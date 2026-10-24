// Todas as páginas do site (rewrite do vercel.json: o que não é arquivo estático chega aqui).
// Cada página é montada com o conteúdo publicado no painel e fica 10 s em cache na borda,
// então o que é salvo no painel aparece no site em poucos segundos, sem novo deploy.
import {PUBLIC_CACHE} from './_store.js';
import {carregar} from './_render/dados.js';
import {renderHome} from './_render/home.js';
import {renderSobre, renderSolucoes, renderServico, renderProjetos, renderProjeto, renderOrbita, renderContato, renderLegal, renderNaoEncontrada} from './_render/paginas.js';
import {renderBlog, renderArtigo} from './_render/blog.js';
import {montarIndice} from '../assets/js/blog/posts.js';

function rotear(caminho, {C, P, G, B}) {
  const ok = html => (html ? {status: 200, html} : null);
  if (caminho === '/') return ok(renderHome(C, P, montarIndice(G, B)));
  const fixas = {
    '/sobre/': () => renderSobre(C),
    '/solucoes/': () => renderSolucoes(C),
    '/projetos/': () => renderProjetos(C, P),
    '/orbita/': () => renderOrbita(C),
    '/contato/': () => renderContato(C),
    '/blog/': () => renderBlog(C, G),
    '/politica-de-privacidade/': () => renderLegal(C, 'privacidade', '/politica-de-privacidade/'),
    '/termos-de-uso/': () => renderLegal(C, 'termos', '/termos-de-uso/'),
  };
  if (fixas[caminho]) return ok(fixas[caminho]());
  let m;
  if ((m = caminho.match(/^\/solucoes\/([a-z0-9-]+)\/$/))) return ok(renderServico(C, m[1]));
  if ((m = caminho.match(/^\/projetos\/([a-z0-9-]+)\/$/))) return ok(renderProjeto(C, P, m[1]));
  if ((m = caminho.match(/^\/blog\/([a-z0-9-]+)\/$/))) return renderArtigo(C, G, B, m[1]);
  return null;
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  // O rewrite manda o caminho original em ?rota=; em desenvolvimento, chega o próprio caminho.
  const viaRewrite = url.searchParams.has('rota');
  let caminho = viaRewrite ? '/' + (url.searchParams.get('rota') || '').replace(/^\/+|\/+$/g, '') : url.pathname;
  url.searchParams.delete('rota');
  const busca = url.searchParams.toString();

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end();
  }

  // Endereços canônicos terminam em barra (/sobre → /sobre/). Pelo rewrite, a barra final pode
  // ou não vir no parâmetro, então ali o caminho só é completado (a tag canonical indica o certo).
  if (!caminho.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(caminho)) {
    if (!viaRewrite) {
      res.statusCode = 308;
      res.setHeader('Location', `${caminho}/${busca ? `?${busca}` : ''}`);
      return res.end();
    }
    caminho += '/';
  }
  caminho = caminho.toLowerCase();

  try {
    const dados = await carregar();
    const r = rotear(caminho, dados) || {status: 404, html: renderNaoEncontrada(dados.C, caminho)};
    res.statusCode = r.status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    for (const [k, v] of Object.entries(PUBLIC_CACHE)) res.setHeader(k, v);
    return res.end(req.method === 'HEAD' ? undefined : r.html);
  } catch (erro) {
    console.error(erro);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Não foi possível carregar esta página agora. Tente de novo em instantes.');
  }
}
