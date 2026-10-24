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

/**
 * Arquivo público dentro da pasta do site, ou null. O caminho é decodificado e normalizado
 * antes de qualquer checagem: "..", barras codificadas (%2f), arquivos ocultos (.git, .backup,
 * .env…) e as pastas bloqueadas nunca são servidos.
 */
function arquivoPublico(pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return null; }
  const partes = rel.split(/[\\/]+/).filter(Boolean);
  if (rel.includes('\0') || partes.some(p => p === '..' || p.startsWith('.'))) return null;
  const normal = '/' + partes.join('/');
  if (BLOQUEADOS.test(normal)) return null;
  const file = path.resolve(ROOT, ...partes);
  if (!file.startsWith(ROOT + path.sep)) return null;
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}

// Os mesmos cabeçalhos de segurança que a Vercel aplica (vercel.json), para testar igual.
const CABECALHOS = (JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).headers || [])
  .filter(h => h.source === '/(.*)').flatMap(h => h.headers).filter(h => h.key !== 'Strict-Transport-Security');

async function atender(req, res) {
  for (const {key, value} of CABECALHOS) res.setHeader(key, value);
  const {pathname} = new URL(req.url, 'http://local');
  const api = pathname.match(/^\/api\/([a-z-]+)$/);
  if (api && fs.existsSync(path.join(ROOT, 'api', api[1] + '.js'))) return funcao(api[1], req, res);
  if (pathname === '/sitemap.xml') return funcao('sitemap', req, res);

  const file = arquivoPublico(pathname);
  if (!file) return funcao('render', req, res);

  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  fs.createReadStream(file).pipe(res);
}

// Só o próprio computador (127.0.0.1 e ::1): ninguém na mesma rede alcança o servidor de teste.
let avisou = false;
for (const host of ['127.0.0.1', '::1']) {
  const servidor = http.createServer(atender);
  servidor.on('error', erro => {
    if (host === '::1' && ['EADDRNOTAVAIL', 'EAFNOSUPPORT'].includes(erro.code)) return;
    throw erro;
  });
  servidor.listen(PORT, host, () => { if (!avisou) { avisou = true; console.log(`Site em http://localhost:${PORT}`); } });
}
