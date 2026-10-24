// Leitura do conteúdo publicado pelo painel (repositório ejuvv-cms, projeto Vercel próprio).
// Os dois projetos usam o mesmo Vercel Blob store. Cada documento é gravado como versões imutáveis
// em cms/<documento>/<versão>-<data>-<sufixo>.json; vale a mais recente.
// Sem Blob (desenvolvimento local), lê a mesma estrutura de pastas em LOCAL_STORE; o padrão é a pasta
// .cms-local/ do painel ao lado do site (../ejuvv-admin ou ../ejuvv-cms, o nome que fica ao clonar).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAINEL = ['ejuvv-admin', 'ejuvv-cms'].map(p => path.join(ROOT, '..', p)).find(p => fs.existsSync(path.join(p, 'api', 'conteudo.js')));
const LOCAL = process.env.LOCAL_STORE || path.join(PAINEL || path.join(ROOT, '..', 'ejuvv-admin'), '.cms-local');
const useBlob = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

async function latestBlob(prefix) {
  const {list} = await import('@vercel/blob');
  let latest = null;
  let cursor;
  do {
    const page = await list({prefix, limit: 1000, cursor});
    for (const b of page.blobs) if (!latest || b.pathname > latest.pathname) latest = b;
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return latest;
}

/** O conteúdo padrão do repositório (data/<arquivo>). */
export const readSeed = seedFile => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', seedFile), 'utf8'));

// Devolve o documento publicado ou o padrão do repositório (data/<arquivo>).
export async function readDoc(name, seedFile) {
  const prefix = `cms/${name}/`;
  if (useBlob()) {
    const latest = await latestBlob(prefix);
    if (latest) {
      const response = await fetch(latest.url);
      if (!response.ok) throw new Error(`Falha ao ler ${latest.pathname}: ${response.status}`);
      return response.json();
    }
  } else {
    const dir = path.join(LOCAL, prefix);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort() : [];
    if (files.length) return JSON.parse(fs.readFileSync(path.join(dir, files[files.length - 1]), 'utf8'));
  }
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', seedFile), 'utf8'));
}

export function send(res, status, payload, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.end(JSON.stringify(payload));
}

// Cache curto na borda: o que for publicado no painel aparece no site em poucos segundos.
export const PUBLIC_CACHE = {'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=30'};
