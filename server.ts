import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Enable CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'GB STUDY API Server' });
  });

  // Serve static files from public directory
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public')));

  // Direct metadata.json endpoint handling both /public/metadata.json and /metadata.json
  app.get(['/public/metadata.json', '/metadata.json'], (req, res) => {
    const publicMeta = path.join(__dirname, 'public', 'metadata.json');
    const rootMeta = path.join(__dirname, 'metadata.json');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    if (fs.existsSync(publicMeta)) {
      res.sendFile(publicMeta);
    } else if (fs.existsSync(rootMeta)) {
      res.sendFile(rootMeta);
    } else {
      res.status(404).json({ error: 'metadata.json not found' });
    }
  });

  // Batches proxy
  app.get(['/api/batches', '/batches.json'], async (req, res) => {
    try {
      const response = await fetch('https://studybeepro.site/sf/batches.json', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://studybeepro.site/sf/',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const all = [...(data.new || []), ...(data.old || [])];
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.json({ success: true, count: all.length, data: all });
        return;
      }
    } catch (err) {
      console.warn('Error fetching upstream batches.json:', err);
    }

    // Fallback to local copy
    try {
      const localPath = path.join(__dirname, 'src/data/allBatches.json');
      if (fs.existsSync(localPath)) {
        const localData = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
        res.json({ success: true, count: localData.length, data: localData });
        return;
      }
    } catch (err) {
      console.error('Failed reading local batches:', err);
    }

    res.status(500).json({ success: false, message: 'Could not load batches' });
  });

  // Folder contents proxy
  app.get(['/api/folder_contentsv3', '/get/folder_contentsv3'], async (req, res) => {
    const courseId = req.query.course_id;
    const parentId = req.query.parent_id ?? '-1';
    const start = req.query.start ?? '0';

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

      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(json);
    } catch (err: any) {
      console.error('Error fetching folder contents:', err);
      res.status(500).json({ status: 500, message: err?.message || 'Server error' });
    }
  });

  // Video details proxy
  app.get(['/api/fetchVideoDetailsById', '/get/fetchVideoDetailsById'], async (req, res) => {
    const courseId = req.query.course_id;
    const videoId = req.query.video_id;

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
      res.json(json);
    } catch (err: any) {
      console.error('Error fetching video details:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  // Video streaming proxy
  app.get(['/api/video', '/video'], async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    try {
      const reqHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://studybeepro.site/sf/play.html',
      };
      if (req.headers.range) {
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
        // Correctly rewrite studybeepro video URLs to relative /api/video?url=
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
        res.send(rewritten);
        return;
      }

      // If it's a binary chunk (.ts) or other video segment
      if (upstream.status === 206) {
        res.status(206);
        if (upstream.headers.get('content-range')) {
          res.setHeader('Content-Range', upstream.headers.get('content-range')!);
        }
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
      console.error('Video proxy error:', err);
      res.status(500).send('Video stream proxy error: ' + err?.message);
    }
  });

  // PDF proxy
  app.get(['/api/pdf', '/pdf'], async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    try {
      let cleanRawUrl = rawUrl.trim();
      if (cleanRawUrl.startsWith('https://studybeepro.site/pdf?url=')) {
        cleanRawUrl = cleanRawUrl.replace('https://studybeepro.site/pdf?url=', '');
      } else if (cleanRawUrl.startsWith('http://studybeepro.site/pdf?url=')) {
        cleanRawUrl = cleanRawUrl.replace('http://studybeepro.site/pdf?url=', '');
      }
      const upstreamUrl = cleanRawUrl.startsWith('http')
        ? `https://studybeepro.site/pdf?url=${encodeURIComponent(cleanRawUrl)}`
        : `https://studybeepro.site/pdf?url=${cleanRawUrl}`;

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
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error('PDF proxy error:', err);
      res.status(500).send('PDF proxy error: ' + err?.message);
    }
  });

  // Vite integration
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GB STUDY server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
