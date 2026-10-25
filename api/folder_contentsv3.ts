export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const courseId = req.query?.course_id;
  const parentId = req.query?.parent_id ?? '-1';
  const start = req.query?.start ?? '0';

  if (!courseId) {
    res.status(400).json({ status: 400, message: 'Missing course_id' });
    return;
  }

  const cleanCourse = String(courseId).replace(/\D/g, '') || String(courseId);
  const parentIdStr = String(parentId).trim();

  const targetUrl = `https://studybeepro.site/get/folder_contentsv3?course_id=${encodeURIComponent(cleanCourse)}&parent_id=${encodeURIComponent(parentIdStr)}&start=${encodeURIComponent(String(start))}`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://studybeepro.site/sf/content.html?id=${cleanCourse}`,
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ status: upstream.status, message: 'Upstream returned error' });
      return;
    }

    const json = await upstream.json();
    let items = json?.data || [];

    // If at root (-1) and single "Home" folder wrapper is returned, automatically fetch its children
    if (
      (parentIdStr === '-1' || parentIdStr === 'root') &&
      items.length === 1 &&
      (items[0].material_type || items[0].type) === 'FOLDER' &&
      (items[0].Title?.toLowerCase() === 'home' || items[0].title?.toLowerCase() === 'home')
    ) {
      const homeId = String(items[0].id);
      const subUrl = `https://studybeepro.site/get/folder_contentsv3?course_id=${encodeURIComponent(cleanCourse)}&parent_id=${encodeURIComponent(homeId)}&start=0`;
      const subRes = await fetch(subUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': `https://studybeepro.site/sf/content.html?id=${cleanCourse}`,
        },
      });
      if (subRes.ok) {
        const subJson = await subRes.json();
        if (Array.isArray(subJson?.data) && subJson.data.length > 0) {
          json.data = subJson.data;
          json.total = subJson.total;
        }
      }
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.status(200).json(json);
  } catch (err: any) {
    console.error('Error in Vercel folder_contentsv3 handler:', err);
    res.status(500).json({ status: 500, message: err?.message || 'Server error' });
  }
}
