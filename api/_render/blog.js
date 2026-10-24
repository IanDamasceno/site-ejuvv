// Blog: /blog/ (lista, desenhada no navegador por assets/js/pages/blog.js) e
// /blog/<slug>/ (artigo já renderizado aqui, com título, descrição e imagem próprios).
import {esc, icon} from './fmt.js';
import {pagina} from './shell.js';
import {montarPost} from '../../assets/js/blog/posts.js';
import {viewCabecalho, viewChamada, viewPost, viewNaoEncontrado, seoPost} from '../../assets/js/blog/views.js';

const HEAD = `
<link rel="stylesheet" href="/assets/css/blog.css?v=20261023">
<link rel="alternate" type="application/json" href="/api/blog" title="Artigos do blog da EJUVV">
<script>/^\\/blog\\/[a-z0-9-]+\\/?$/.test(location.pathname)&&document.documentElement.classList.add('blog-is-post')</script>`;

const SCRIPTS = ['/assets/js/pages/inner.js', '/assets/js/pages/blog.js'];

const skeleton = Array.from({length: 3}, () => `          <div class="blog-card is-skeleton" aria-hidden="true"><div class="blog-card-cover"></div><div class="blog-card-body"><span class="skel"></span><span class="skel skel-title"></span><span class="skel"></span></div></div>`).join('\n');

const lista = pg => `<div class="blog-index" id="blog-index">
    <section class="page-hero blog-hero">
      <div class="container blog-hero-copy" id="blog-hero">
        ${viewCabecalho(pg)}
      </div>
    </section>

    <section class="section blog-section">
      <div class="container">
        <div class="blog-toolbar" id="blog-toolbar" hidden>
          <div class="blog-filters" id="blog-filtros" role="group" aria-label="Filtrar por categoria"></div>
          <label class="blog-search">
            <span class="visually-hidden">Buscar artigos</span>
            ${icon('i-search')}
            <input type="search" id="blog-busca" placeholder="Buscar artigos" autocomplete="off" enterkeyhint="search">
          </label>
        </div>
        <div id="blog-destaque"></div>
        <p class="visually-hidden" id="blog-status" role="status" aria-live="polite"></p>
        <div class="blog-grid" id="blog-grid">
${skeleton}
        </div>
        <div class="blog-empty" id="blog-vazio" hidden></div>
        <div class="blog-more" id="blog-mais" hidden>
          <button class="btn btn-outline" type="button">Carregar mais artigos</button>
        </div>
        <noscript><div class="blog-empty"><h2>Ative o JavaScript para ver os artigos.</h2></div></noscript>
      </div>
    </section>
  </div>`;

const chamada = pg => `
    <section class="section soft blog-cta" id="blog-chamada"><!--blog:cta-->
      ${viewChamada(pg)}
    <!--/blog:cta--></section>`;

export function renderBlog(C, G) {
  const pg = G?.pagina || {};
  const seo = G?.seo || {};
  return pagina(C, {
    url: '/blog/',
    titulo: `${seo.titulo || 'Blog'} | ${C.geral.marca}`,
    descricao: seo.descricao || pg.texto || '',
    head: HEAD,
    scripts: SCRIPTS,
    corpo: `${lista(pg)}

  <div class="blog-post-view" id="blog-post"><!--blog:post--><!--/blog:post--></div>
${chamada(pg)}`,
  });
}

/** Artigo; devolve {status, html}. */
export function renderArtigo(C, G, B, slug) {
  const dados = /^[a-z0-9-]{1,80}$/.test(slug) ? montarPost(G, B, slug) : null;
  const pg = G?.pagina || {};
  if (!dados) {
    return {
      status: 404,
      html: pagina(C, {
        url: `/blog/${slug}/`,
        titulo: `Artigo não encontrado | ${C.geral.marca}`,
        descricao: 'Este artigo não está disponível.',
        robots: 'noindex',
        htmlClasse: 'blog-is-post',
        head: HEAD,
        scripts: SCRIPTS,
        corpo: `<div class="blog-post-view" id="blog-post" data-slug="" data-status="404"><!--blog:post-->
    ${viewNaoEncontrado()}
  <!--/blog:post--></div>
${chamada(pg)}`,
      }),
    };
  }
  const {post} = dados;
  const seo = seoPost(post, dados.categorias);
  return {
    status: 200,
    html: pagina(C, {
      url: `/blog/${post.slug}/`,
      titulo: seo.titulo,
      descricao: seo.descricao,
      imagem: seo.imagem,
      tipo: 'article',
      htmlClasse: 'blog-is-post',
      head: `${HEAD}
<meta property="article:published_time" content="${esc(post.data)}">
<script type="application/ld+json">${seo.jsonLd}</script>`,
      scripts: SCRIPTS,
      corpo: `<div class="blog-post-view" id="blog-post" data-slug="${esc(post.slug)}"><!--blog:post-->
    ${viewPost(dados)}
  <!--/blog:post--></div>
${chamada(pg)}`,
    }),
  };
}
