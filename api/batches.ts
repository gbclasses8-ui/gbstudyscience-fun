export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const upstream = await fetch('https://studybeepro.site/sf/batches.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://studybeepro.site/sf/',
      },
    });

    if (upstream.ok) {
      const data = await upstream.json();
      const all = [...(data.new || []), ...(data.old || [])];
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      res.status(200).json({ success: true, count: all.length, data: all });
      return;
    }
  } catch (err: any) {
    console.warn('Vercel batches upstream error:', err);
  }

  res.status(500).json({ success: false, message: 'Could not fetch batches' });
}
