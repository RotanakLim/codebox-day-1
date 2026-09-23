const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const DEFAULT_PORT = Number(process.env.PORT) || 3000;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: error.code === 'ENOENT' ? 'Not found' : 'Unable to read file' }));
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': filePath.includes(`${path.sep}data${path.sep}`) ? 'public, max-age=3600' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    res.end(data);
  });
}

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }
    if (url.pathname === '/api/counties') return sendFile(res, path.join(PUBLIC, 'data', 'california-food-insecurity.geojson'));
    if (url.pathname === '/api/organizations') return sendFile(res, path.join(PUBLIC, 'data', 'organizations.json'));

    const relativePath = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const requestedPath = path.resolve(PUBLIC, relativePath);
    if (!requestedPath.startsWith(`${PUBLIC}${path.sep}`) && requestedPath !== PUBLIC) {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }
    sendFile(res, requestedPath);
  });
}

if (require.main === module) {
  createServer().listen(DEFAULT_PORT, () => console.log(`California Food Need Map running at http://localhost:${DEFAULT_PORT}`));
}

module.exports = { createServer };
