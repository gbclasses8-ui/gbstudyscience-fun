export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const rawUrl = req.query?.url as string;
  if (!rawUrl) {
    res.status(400).send('Missing url parameter');
    return;
  }

  try {
    const reqHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://studybeepro.site/sf/play.html',
    };
    if (req.headers?.range) {
      reqHeaders['Range'] = req.headers.range as string;
    }

    const upstreamUrl = `https://studybeepro.site/video?url=${encodeURIComponent(rawUrl)}`;
    const upstream = await fetch(upstreamUrl, {
      headers: reqHeaders,
    });

    const contentType = upstream.headers.get('content-type') || '';

    // If it's an HLS m3u8 playlist text
    if (contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL') || rawUrl.includes('.m3u8')) {
      const text = await upstream.text();
      const rewritten = text
        .replace(/https?:\/\/studybeepro\.site\/video\?url=/g, '/api/video?url=')
        .replace(/(?:^|[^a-zA-Z0-9_\/])\/video\?url=/g, (match) => {
          return match.startsWith('/') ? '/api/video?url=' : match.charAt(0) + '/api/video?url=';
        });

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).send(rewritten);
      return;
    }

    // Binary segment (.ts) or chunk
    if (upstream.status === 206) {
      res.status(206);
      if (upstream.headers.get('content-range')) {
        res.setHeader('Content-Range', upstream.headers.get('content-range')!);
      }
    } else {
      res.status(200);
    }

    if (upstream.headers.get('accept-ranges')) {
      res.setHeader('Accept-Ranges', upstream.headers.get('accept-ranges')!);
    }
    if (upstream.headers.get('content-length')) {
      res.setHeader('Content-Length', upstream.headers.get('content-length')!);
    }

    let resolvedContentType = contentType || 'video/mp2t';
    if (rawUrl.includes('.ts') || rawUrl.includes('master-') || resolvedContentType === 'application/octet-stream') {
      resolvedContentType = 'video/mp2t';
    }

    res.setHeader('Content-Type', resolvedContentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Video proxy error in Vercel handler:', err);
    res.status(500).send('Video stream proxy error: ' + err?.message);
  }
}
