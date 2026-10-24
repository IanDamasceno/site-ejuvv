// Servidor local do site: node dev-server.js  →  http://localhost:4173
// Reproduz o que a Vercel faz em produção: arquivos estáticos primeiro, depois as funções de api/
// e, para todo o resto, as páginas montadas por api/render.js (mesmos rewrites do vercel.json).
// Lê o que o painel local publicou em LOCAL_STORE (padrão: .cms-local/ da pasta do painel ao lado), igual ao Blob em produção.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2'};
const BLOQUEADOS = /^\/(api|node_modules|\.claude|\.git|\.backup)(\/|$)/;

async function funcao(nome, req, res) {
  try {
    const mod = await import(pathToFileURL(path.join(ROOT, 'api', nome + '.js')).href + '?t=' + Date.now());
    return await mod.default(req, res);
  } catch (erro) {
    console.error(erro);
    res.statusCode = 500;
    return res.end('Erro na função');
  }
}

http.createServer(async (req, res) => {
  const {pathname} = new URL(req.url, 'http://local');
  const api = pathname.match(/^\/api\/([a-z-]+)$/);
  if (api && fs.existsSync(path.join(ROOT, 'api', api[1] + '.js'))) return funcao(api[1], req, res);
  if (pathname === '/sitemap.xml') return funcao('sitemap', req, res);

  const rota = decodeURIComponent(pathname);
  const file = path.join(ROOT, rota);
  const ehArquivo = file.startsWith(ROOT) && !BLOQUEADOS.test(rota) && fs.existsSync(file) && fs.statSync(file).isFile();
  if (!ehArquivo) return funcao('render', req, res);

  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Site em http://localhost:${PORT}`));
