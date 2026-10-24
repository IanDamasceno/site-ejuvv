/**
 * Marcação HTML do blog. Funções puras (sem window/document), usadas no
 * navegador (assets/js/pages/blog.js) e no servidor (api/_render/blog.js), para que
 * o artigo renderizado na Vercel e o renderizado no navegador sejam idênticos.
 */

import { esc, artigo, imagemSegura, textoPuro } from './markup.js';

export const SITE = 'https://ejuvv.com';
export const POR_PAGINA = 9;

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const partes = (iso) => String(iso || '').split('-').map(Number);
export const dataLonga = (iso) => {
  const [a, m, d] = partes(iso);
  return a && m && d ? `${d} de ${MESES[m - 1]} de ${a}` : '';
};
export const dataCurta = (iso) => {
  const [a, m, d] = partes(iso);
  return a && m && d ? `${d} ${MESES[m - 1].slice(0, 3)}. ${a}` : '';
};

const icon = (name) => `<svg aria-hidden="true"><use href="/assets/img/icons.svg#${name}"/></svg>`;

export const urlPost = (slug) => `/blog/${slug}/`;
export const urlCategoria = (slug) => `/blog/?categoria=${encodeURIComponent(slug)}`;
export const nomeCategoria = (categorias, slug) => (categorias || []).find((c) => c.slug === slug)?.nome || '';

export const descricaoPost = (p) =>
  textoPuro(p.seoDescricao || p.resumo || p.conteudo || '').slice(0, 160);

const leitura = (p) => `${p.leitura || 1} min de leitura`;

function capa(p, { tamanho = '' } = {}) {
  const src = imagemSegura(p.capa);
  if (src) return `<img src="${esc(src)}" alt="${esc(p.capaAlt || '')}" loading="lazy" decoding="async"${tamanho}>`;
  return `<span class="blog-cover-fallback" aria-hidden="true"><img src="/assets/img/logo-ejuvv-symbol.png" alt=""></span>`;
}

function etiqueta(p, categorias) {
  const nome = nomeCategoria(categorias, p.categoria);
  return nome ? `<a class="blog-tag" href="${esc(urlCategoria(p.categoria))}">${esc(nome)}</a>` : '';
}

/* ------------------------------------------------------------------ lista */

export function cartao(p, categorias) {
  return `<article class="blog-card" data-reveal="stagger" data-reveal-group="blog">
  <div class="blog-card-cover">${capa(p)}</div>
  <div class="blog-card-body">
    <div class="blog-meta">${etiqueta(p, categorias)}<span><time datetime="${esc(p.data)}">${esc(dataCurta(p.data))}</time></span><span>${esc(p.leitura || 1)} min</span></div>
    <h3><a class="blog-card-link" href="${esc(urlPost(p.slug))}">${esc(textoPuro(p.titulo))}</a></h3>
    ${p.resumo ? `<p>${esc(textoPuro(p.resumo))}</p>` : ''}
    <span class="text-link blog-card-more" aria-hidden="true">Ler artigo ${icon('i-arrow-right')}</span>
  </div>
</article>`;
}

export function destaque(p, categorias) {
  return `<article class="blog-feature" data-reveal>
  <div class="blog-feature-cover">${capa(p, { tamanho: ' fetchpriority="high"' }).replace(' loading="lazy"', '')}</div>
  <div class="blog-feature-body">
    <span class="eyebrow">Em destaque</span>
    <div class="blog-meta">${etiqueta(p, categorias)}<span><time datetime="${esc(p.data)}">${esc(dataLonga(p.data))}</time></span><span>${esc(leitura(p))}</span></div>
    <h2><a class="blog-card-link" href="${esc(urlPost(p.slug))}">${esc(textoPuro(p.titulo))}</a></h2>
    ${p.resumo ? `<p>${esc(textoPuro(p.resumo))}</p>` : ''}
    <span class="btn btn-primary blog-feature-btn" aria-hidden="true">Ler artigo ${icon('i-arrow-right')}</span>
  </div>
</article>`;
}

/* ------------------------------------------------------------------ artigo */

const migalhas = (titulo) => `<nav class="breadcrumb" aria-label="Você está aqui">
          <a href="/">Início</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a><span aria-hidden="true">/</span><span aria-current="page">${esc(textoPuro(titulo))}</span>
        </nav>`;

function compartilhar(p) {
  const url = SITE + urlPost(p.slug);
  const titulo = textoPuro(p.titulo);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${titulo} ${url}`)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  return `<div class="blog-share">
          <span>Compartilhe</span>
          <a class="blog-share-btn" href="${esc(wa)}" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no WhatsApp">${icon('i-message-circle')}</a>
          <a class="blog-share-btn" href="${esc(li)}" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no LinkedIn">${icon('i-linkedin')}</a>
          <button class="blog-share-btn" type="button" data-copiar="${esc(url)}" aria-label="Copiar o link do artigo">${icon('i-link')}</button>
          <span class="blog-share-ok" role="status" aria-live="polite"></span>
        </div>`;
}

export function viewPost({ post: p, relacionados = [], categorias = [] }) {
  const cat = nomeCategoria(categorias, p.categoria);
  const src = imagemSegura(p.capa);
  return `<section class="page-hero blog-post-hero">
      <div class="container">
        ${migalhas(p.titulo)}
        ${cat ? `<a class="eyebrow blog-post-cat" href="${esc(urlCategoria(p.categoria))}">${esc(cat)}</a>` : '<span class="eyebrow">Blog da EJUVV</span>'}
        <h1>${esc(textoPuro(p.titulo))}</h1>
        ${p.resumo ? `<p>${esc(textoPuro(p.resumo))}</p>` : ''}
        <div class="blog-post-meta">
          <span>Por ${esc(p.autor || 'Equipe EJUVV')}</span>
          <span>${icon('i-calendar')}<time datetime="${esc(p.data)}">${esc(dataLonga(p.data))}</time></span>
          <span>${icon('i-clock')}${esc(leitura(p))}</span>
        </div>
      </div>
    </section>

    <section class="section blog-article-section${src ? '' : ' sem-capa'}">
      <div class="container">
        ${src ? `<figure class="blog-cover"><img src="${esc(src)}" alt="${esc(p.capaAlt || '')}" fetchpriority="high" decoding="async"></figure>` : ''}
        <article class="blog-article">
${artigo(p.conteudo)}
        </article>
        <footer class="blog-article-footer">
          ${compartilhar(p)}
          <a class="text-link" href="/blog/">${icon('i-arrow-left')} Voltar para o blog</a>
        </footer>
      </div>
    </section>${
      relacionados.length
        ? `

    <section class="section blog-related">
      <div class="container">
        <div class="section-heading">
          <div data-reveal>
            <span class="eyebrow">Continue lendo</span>
            <h2>Outros artigos da EJUVV.</h2>
          </div>
        </div>
        <div class="blog-grid">
${relacionados.map((r) => cartao(r, categorias)).join('\n')}
        </div>
      </div>
    </section>`
        : ''
    }`;
}

export function viewNaoEncontrado() {
  return `<section class="page-hero blog-post-hero">
      <div class="container">
        ${migalhas('Artigo não encontrado')}
        <span class="eyebrow">Erro 404</span>
        <h1>Artigo não encontrado.</h1>
        <p>O endereço pode ter mudado ou o artigo saiu do ar. Veja os artigos publicados no blog.</p>
        <div class="button-row" style="margin-top:30px">
          <a class="btn btn-light" href="/blog/">Ver todos os artigos ${icon('i-arrow-right')}</a>
        </div>
      </div>
    </section>`;
}

/* ------------------------------------------------------------------ textos da página */

/** Topo de /blog/ (os campos vêm de Página do blog, no painel). */
export const viewCabecalho = (pg = {}) => `<span class="eyebrow">${esc(pg.eyebrow || 'Blog da EJUVV')}</span>
        <h1>${esc(pg.titulo || 'Blog')}</h1>
        ${pg.texto ? `<p>${esc(pg.texto)}</p>` : ''}`;

/** Chamada final, igual à das outras páginas internas. */
export const viewChamada = (pg = {}) => `<div class="container cta-band" data-reveal>
        <span class="eyebrow">${esc(pg.chamadaEyebrow || 'Vamos conversar')}</span>
        <h2>${esc(pg.chamadaTitulo || 'Tem um projeto em mente?')}</h2>
        ${pg.chamadaTexto ? `<p class="lead">${esc(pg.chamadaTexto)}</p>` : ''}
        <a class="btn btn-primary" href="/contato/" data-magnetic>${esc(pg.chamadaBotao || 'Falar com a EJUVV')} ${icon('i-arrow-right')}</a>
      </div>`;

/* ------------------------------------------------------------------ SEO */

export function seoPost(p, categorias = []) {
  const titulo = textoPuro(p.seoTitulo || p.titulo);
  const descricao = descricaoPost(p);
  const url = SITE + urlPost(p.slug);
  const src = imagemSegura(p.capa);
  const imagem = src.startsWith('https://') ? src : src.startsWith('/') ? SITE + src : `${SITE}/og.png`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: textoPuro(p.titulo),
    description: descricao,
    image: imagem,
    datePublished: p.data,
    dateModified: (p.atualizadoEm || p.data || '').slice(0, 10),
    author: { '@type': p.autor ? 'Person' : 'Organization', name: p.autor || 'EJUVV' },
    publisher: { '@type': 'Organization', name: 'EJUVV', logo: { '@type': 'ImageObject', url: `${SITE}/apple-touch-icon.png` } },
    mainEntityOfPage: url,
    articleSection: nomeCategoria(categorias, p.categoria) || undefined,
  };
  return {
    titulo: `${titulo} | Blog EJUVV`,
    descricao,
    url,
    imagem,
    // Escapa < > & e as quebras de linha especiais: o texto nunca fecha a tag <script>.
    jsonLd: JSON.stringify(ld).replace(/[<>&\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`),
  };
}
