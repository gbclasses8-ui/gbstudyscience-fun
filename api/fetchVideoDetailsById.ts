export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const courseId = req.query?.course_id;
  const videoId = req.query?.video_id;

  if (!courseId || !videoId) {
    res.status(400).json({ success: false, error: 'Missing course_id or video_id' });
    return;
  }

  const cleanCourse = String(courseId).replace(/\D/g, '') || String(courseId);
  const cleanVideo = String(videoId).trim();

  const targetUrl = `https://studybeepro.site/get/fetchVideoDetailsById?course_id=${encodeURIComponent(cleanCourse)}&video_id=${encodeURIComponent(cleanVideo)}`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://studybeepro.site/sf/play.html?course_id=${cleanCourse}&video_id=${cleanVideo}`,
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ success: false, error: 'Upstream error' });
      return;
    }

    const json = await upstream.json();
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    res.status(200).json(json);
  } catch (err: any) {
    console.error('Error in Vercel fetchVideoDetailsById handler:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}
