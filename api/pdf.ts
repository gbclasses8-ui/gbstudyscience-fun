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
    const upstreamUrl = `https://studybeepro.site/pdf?url=${encodeURIComponent(rawUrl)}`;
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://studybeepro.site/sf/content.html',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).send('Could not fetch PDF from upstream');
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="lecture_notes.pdf"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await upstream.arrayBuffer();
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('PDF proxy error in Vercel handler:', err);
    res.status(500).send('PDF proxy error: ' + err?.message);
  }
}
