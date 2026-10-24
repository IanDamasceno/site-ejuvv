// GET /sitemap.xml (rewrite do vercel.json) → todas as páginas, soluções, projetos e artigos publicados.
// É gerado na hora porque o painel cria páginas novas sem novo deploy.
import {carregar} from './_render/dados.js';
import {servicosPublicados, projetosPublicados} from './_render/blocos.js';
import {montarIndice} from '../assets/js/blog/posts.js';
import {esc} from '../assets/js/blog/markup.js';
import {SITE} from './_render/shell.js';

export default async function handler(req, res) {
  try {
    const {C, P, G, B} = await carregar();
    const dia = iso => String(iso || '').slice(0, 10);
    const hoje = new Date().toISOString().slice(0, 10);
    const conteudo = dia(C.atualizadoEm) || hoje;
    const posts = montarIndice(G, B).posts;
    const urls = [
      ['/', conteudo, '1.0'],
      ...['/sobre/', '/solucoes/', '/projetos/', '/orbita/', '/contato/', '/politica-de-privacidade/', '/termos-de-uso/'].map(u => [u, conteudo, '0.7']),
      ...servicosPublicados(C).map(s => [`/solucoes/${s.slug}/`, conteudo, '0.7']),
      ...projetosPublicados(P).map(p => [`/projetos/${p.slug}/`, dia(P.atualizadoEm) || conteudo, '0.7']),
      ['/blog/', posts.map(p => dia(p.atualizadoEm || p.data)).sort().pop() || conteudo, '0.7'],
      ...posts.map(p => [`/blog/${p.slug}/`, dia(p.atualizadoEm || p.data), '0.6']),
    ];
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
    res.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d, pr]) => `  <url><loc>${esc(SITE + u)}</loc><lastmod>${d}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`);
  } catch (erro) {
    console.error(erro);
    res.statusCode = 500;
    res.end();
  }
}
