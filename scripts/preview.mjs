import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'web');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
]);

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || host}`);
  const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.resolve(root, `.${requested}`);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(file, (error, body) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    response.writeHead(200, {
      'content-type': types.get(path.extname(file)) || 'application/octet-stream',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    response.end(body);
  });
});

server.listen(port, host, () => {
  console.log(`GuildBook disponível em http://${host}:${port}`);
});
