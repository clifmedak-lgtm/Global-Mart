import http from 'http';
import { readFile, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const products = [
  { id: 'ps5-standard', name: 'PS5 Standard Edition', vendor: 'GameHub', price: 420000, category: 'consoles' },
  { id: 'ps5-digital', name: 'PS5 Digital Edition', vendor: 'GameHub', price: 390000, category: 'consoles' },
  { id: 'samsung-s24', name: 'Samsung Galaxy S24', vendor: 'TechStore Official', price: 540000, category: 'android' },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', vendor: 'Mobile World', price: 980000, category: 'iphone' },
  { id: 'clear-case', name: 'Clear Silicone Case', vendor: 'PhoneAccessory', price: 25000, category: 'cases' },
];

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url?.split('?')[0] || '/';

    if (url.startsWith('/api/')) {
      handleApi(req, res, url);
      return;
    }

    const normalizedUrl = url === '/' ? '/index.html' : url;
    const filePath = join(__dirname, normalizedUrl);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      res.writeHead(302, { Location: '/index.html' });
      res.end();
      return;
    }

    const content = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

function handleApi(req, res, url) {
  if (req.method === 'GET' && url === '/api/products') {
    return respondJson(res, products);
  }

  if (req.method === 'POST' && url === '/api/checkout') {
    return collectRequestBody(req)
      .then(body => {
        const order = { id: `order_${Date.now()}`, status: 'PENDING', total: body.total || 0, items: body.items || [] };
        return respondJson(res, { success: true, order });
      })
      .catch(() => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid checkout payload' }));
      });
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'API route not found' }));
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function respondJson(res, payload) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
