export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
    const upstreamUrl = `https://studybeepro.site/video?url=${encodeURIComponent(rawUrl)}`;
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://studybeepro.site/sf/play.html',
      },
    });

    const contentType = upstream.headers.get('content-type') || '';

    // If it's an HLS m3u8 playlist text
    if (contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL') || rawUrl.includes('.m3u8')) {
      const text = await upstream.text();
      const rewritten = text
        .replace(/\/video\?url=/g, '/api/video?url=')
        .replace(/http:\/\/studybeepro\.site\/video\?url=/g, '/api/video?url=')
        .replace(/https:\/\/studybeepro\.site\/video\?url=/g, '/api/video?url=');

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(rewritten);
      return;
    }

    // Binary segment (.ts) or chunk
    res.setHeader('Content-Type', contentType || 'video/mp2t');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await upstream.arrayBuffer();
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Video proxy error in Vercel handler:', err);
    res.status(500).send('Video stream proxy error: ' + err?.message);
  }
}
