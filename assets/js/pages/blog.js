/**
 * Página do blog: /blog/ (lista) e /blog/<slug>/ (artigo).
 *
 * Os dados vêm de /api/blog, que lê o que o painel publicou. Se a API não
 * responder, o blog usa os arquivos padrão em /data/. Na Vercel o artigo já
 * chega renderizado por api/_render/blog.js; aqui ele só é desenhado quando não veio
 * pronto (por exemplo, quando a função falhou).
 *
 * Carregado depois de inner.js, que cuida do header, dos reveals e das
 * microinterações comuns a todas as páginas internas.
 */

import { entrar as reveal, entrarEmCascata as staggerReveal } from '../motion/reveal.js';
import { $, $$, debounce } from '../motion/env.js';
import { montarIndice, montarPost } from '../blog/posts.js';
import { esc, textoPuro } from '../blog/markup.js';
import {
  POR_PAGINA,
  cartao,
  destaque,
  nomeCategoria,
  seoPost,
  viewCabecalho,
  viewChamada,
  viewNaoEncontrado,
  viewPost,
} from '../blog/views.js';

const rotaPost = location.pathname.match(/^\/blog\/([a-z0-9-]+)\/?$/);

/* ------------------------------------------------------------------ dados */

class SemApi extends Error {}

async function api(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  const ehJson = (r.headers.get('content-type') || '').includes('json');
  if (r.status === 404 && ehJson) return null; // artigo inexistente (resposta da própria API)
  if (!r.ok || !ehJson) throw new SemApi(`Blog indisponível (${r.status})`);
  return r.json();
}

let padrao;
const arquivosPadrao = () =>
  (padrao ||= Promise.all(
    ['/data/blog-pagina.json', '/data/blog.json'].map((u) => fetch(u).then((r) => r.json()))
  ));

async function carregarIndice() {
  try {
    return await api('/api/blog');
  } catch {
    const [pagina, posts] = await arquivosPadrao();
    return montarIndice(pagina, posts);
  }
}

async function carregarPost(slug) {
  try {
    return await api(`/api/blog?slug=${encodeURIComponent(slug)}`);
  } catch {
    const [pagina, posts] = await arquivosPadrao();
    return montarPost(pagina, posts, slug);
  }
}

/* ------------------------------------------------------------------ comuns */

function definirMeta(seletor, atributo, valor) {
  let el = document.head.querySelector(seletor);
  if (!el) {
    el = document.createElement(seletor.startsWith('link') ? 'link' : 'meta');
    const [, chave, nome] = seletor.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/) || [];
    if (chave) el.setAttribute(chave, nome);
    document.head.append(el);
  }
  el.setAttribute(atributo, valor);
}

function aplicarSeo({ titulo, descricao, url }) {
  document.title = titulo;
  definirMeta('meta[name="description"]', 'content', descricao);
  definirMeta('meta[property="og:title"]', 'content', titulo);
  definirMeta('meta[property="og:description"]', 'content', descricao);
  if (url) {
    definirMeta('link[rel="canonical"]', 'href', url);
    definirMeta('meta[property="og:url"]', 'content', url);
  }
}

function atualizarChamada(pagina) {
  const secao = $('#blog-chamada');
  if (!secao || !pagina) return;
  secao.innerHTML = viewChamada(pagina);
  reveal($$('[data-reveal]', secao));
}

function ligarCompartilhar(raiz) {
  $$('[data-copiar]', raiz).forEach((btn) => {
    const aviso = btn.parentElement.querySelector('.blog-share-ok');
    let timer;
    btn.addEventListener('click', async () => {
      const url = btn.dataset.copiar;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const campo = Object.assign(document.createElement('textarea'), { value: url });
        campo.setAttribute('readonly', '');
        campo.style.cssText = 'position:fixed;opacity:0';
        document.body.append(campo);
        campo.select();
        document.execCommand('copy');
        campo.remove();
      }
      if (aviso) {
        aviso.textContent = 'Link copiado';
        clearTimeout(timer);
        timer = setTimeout(() => (aviso.textContent = ''), 2600);
      }
    });
  });
}

/* ------------------------------------------------------------------ artigo */

async function iniciarArtigo(slug) {
  const view = $('#blog-post');
  // Já veio renderizado pelo servidor: só liga os botões.
  if (view.dataset.slug === slug || view.dataset.status === '404') {
    ligarCompartilhar(view);
    return;
  }

  let dados = null;
  try {
    dados = await carregarPost(slug);
  } catch {
    dados = null;
  }

  if (!dados) {
    view.innerHTML = viewNaoEncontrado();
    aplicarSeo({ titulo: 'Artigo não encontrado | EJUVV', descricao: 'Este artigo não está disponível.' });
    definirMeta('meta[name="robots"]', 'content', 'noindex');
    return;
  }

  view.innerHTML = viewPost(dados);
  const seo = seoPost(dados.post, dados.categorias);
  aplicarSeo(seo);
  const ld = Object.assign(document.createElement('script'), { type: 'application/ld+json', textContent: seo.jsonLd });
  document.head.append(ld);
  atualizarChamada(dados.pagina);

  reveal($$('[data-reveal]:not([data-reveal="stagger"])', view));
  const cards = $$('[data-reveal="stagger"]', view);
  if (cards.length) staggerReveal(cards);
  ligarCompartilhar(view);
}

/* ------------------------------------------------------------------ lista */

const normalizar = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function iniciarLista() {
  const el = {
    hero: $('#blog-hero'),
    toolbar: $('#blog-toolbar'),
    filtros: $('#blog-filtros'),
    busca: $('#blog-busca'),
    destaque: $('#blog-destaque'),
    grid: $('#blog-grid'),
    vazio: $('#blog-vazio'),
    mais: $('#blog-mais'),
    status: $('#blog-status'),
  };

  const params = new URLSearchParams(location.search);
  const estado = {
    dados: null,
    categoria: params.get('categoria') || '',
    busca: params.get('busca') || '',
    mostrando: POR_PAGINA,
  };
  el.busca.value = estado.busca;

  const atualizarUrl = (modo = 'replace') => {
    const p = new URLSearchParams();
    if (estado.categoria) p.set('categoria', estado.categoria);
    if (estado.busca.trim()) p.set('busca', estado.busca.trim());
    const url = `/blog/${p.toString() ? `?${p}` : ''}`;
    if (url !== location.pathname + location.search) history[`${modo}State`](null, '', url);
  };

  const filtrados = () => {
    const { posts, categorias } = estado.dados;
    const termo = normalizar(estado.busca.trim());
    return posts.filter((p) => {
      if (estado.categoria && p.categoria !== estado.categoria) return false;
      if (!termo) return true;
      const alvo = normalizar(
        [p.titulo, p.resumo, p.autor, nomeCategoria(categorias, p.categoria)].map(textoPuro).join(' ')
      );
      return termo.split(/\s+/).every((t) => alvo.includes(t));
    });
  };

  function desenharFiltros() {
    const { posts, categorias } = estado.dados;
    const usadas = categorias.filter((c) => posts.some((p) => p.categoria === c.slug));
    // Categoria vinda de um link antigo que não existe mais: volta para "Todos".
    if (estado.categoria && !usadas.some((c) => c.slug === estado.categoria)) estado.categoria = '';
    const chip = (slug, nome) =>
      `<button class="blog-chip" type="button" data-categoria="${esc(slug)}" aria-pressed="${estado.categoria === slug}">${esc(nome)}</button>`;
    el.filtros.innerHTML = usadas.length > 1 ? [chip('', 'Todos'), ...usadas.map((c) => chip(c.slug, c.nome))].join('') : '';
    el.filtros.hidden = usadas.length <= 1;
  }

  function desenhar({ animar = true } = {}) {
    const { posts, categorias, pagina } = estado.dados;

    if (!posts.length) {
      el.toolbar.hidden = true;
      el.destaque.innerHTML = '';
      el.grid.innerHTML = '';
      el.mais.hidden = true;
      el.vazio.hidden = false;
      el.vazio.innerHTML = `<h2>${esc(pagina.vazioTitulo || 'Os primeiros artigos estão a caminho.')}</h2>
        ${pagina.vazioTexto ? `<p>${esc(pagina.vazioTexto)}</p>` : ''}
        <a class="btn btn-outline" href="https://instagram.com/ejuvv" target="_blank" rel="noopener noreferrer">Seguir a EJUVV no Instagram</a>`;
      el.status.textContent = 'Ainda não há artigos publicados.';
      return;
    }

    // Busca só faz sentido com alguns artigos; os filtros, com artigos em mais de uma categoria.
    const comBusca = posts.length >= 4 || Boolean(estado.busca);
    el.busca.closest('.blog-search').hidden = !comBusca;
    el.toolbar.hidden = !comBusca && el.filtros.hidden;
    $$('.blog-chip', el.filtros).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.categoria === estado.categoria)));

    const filtrando = Boolean(estado.categoria || estado.busca.trim());
    let lista = filtrados();
    let principal = null;
    if (!filtrando) {
      principal = lista.find((p) => p.destaque) || lista[0];
      lista = lista.filter((p) => p !== principal);
    }

    el.destaque.innerHTML = principal ? destaque(principal, categorias) : '';
    el.grid.innerHTML = lista.slice(0, estado.mostrando).map((p) => cartao(p, categorias)).join('\n');
    el.mais.hidden = lista.length <= estado.mostrando;

    const total = lista.length + (principal ? 1 : 0);
    el.vazio.hidden = total > 0;
    if (!total) {
      el.vazio.innerHTML = `<h2>Nenhum artigo encontrado.</h2>
        <p>Tente outra palavra ou veja todos os artigos.</p>
        <button class="btn btn-outline" type="button" data-limpar>Ver todos os artigos</button>`;
    }
    el.status.textContent = filtrando
      ? `${total} ${total === 1 ? 'artigo encontrado' : 'artigos encontrados'}.`
      : `${total} ${total === 1 ? 'artigo publicado' : 'artigos publicados'}.`;

    if (animar) {
      if (principal) reveal(el.destaque.firstElementChild, { y: 20 });
      const cards = $$('.blog-card', el.grid);
      if (cards.length) staggerReveal(cards, { each: 70, y: 20 });
    } else {
      $$('[data-reveal]', el.destaque.parentElement).forEach((n) => {
        n.style.opacity = '1';
        n.classList.add('is-revealed');
      });
    }
  }

  function carregarMais() {
    const { categorias } = estado.dados;
    const filtrando = Boolean(estado.categoria || estado.busca.trim());
    let lista = filtrados();
    if (!filtrando) {
      const principal = lista.find((p) => p.destaque) || lista[0];
      lista = lista.filter((p) => p !== principal);
    }
    const novos = lista.slice(estado.mostrando, estado.mostrando + POR_PAGINA);
    estado.mostrando += POR_PAGINA;
    el.grid.insertAdjacentHTML('beforeend', novos.map((p) => cartao(p, categorias)).join('\n'));
    const cards = $$('.blog-card', el.grid).slice(-novos.length);
    staggerReveal(cards, { each: 70, y: 20, threshold: 0 });
    cards[0]?.querySelector('.blog-card-link')?.focus({ preventScroll: true });
    el.mais.hidden = lista.length <= estado.mostrando;
  }

  const escolherCategoria = (slug, modo = 'push') => {
    estado.categoria = slug;
    estado.mostrando = POR_PAGINA;
    atualizarUrl(modo);
    desenhar();
  };

  el.filtros.addEventListener('click', (e) => {
    const b = e.target.closest('.blog-chip');
    if (b) escolherCategoria(b.dataset.categoria);
  });

  // Etiqueta de categoria dentro de um card: filtra sem recarregar a página.
  $('#blog-index').addEventListener('click', (e) => {
    const tag = e.target.closest('a.blog-tag');
    if (tag && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      const slug = new URL(tag.href).searchParams.get('categoria') || '';
      e.preventDefault();
      escolherCategoria(slug);
      el.toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (e.target.closest('[data-limpar]')) {
      estado.busca = '';
      el.busca.value = '';
      escolherCategoria('', 'replace');
      el.busca.focus();
    }
  });

  el.busca.addEventListener(
    'input',
    debounce(() => {
      estado.busca = el.busca.value;
      estado.mostrando = POR_PAGINA;
      atualizarUrl();
      desenhar({ animar: false });
    }, 180)
  );
  el.mais.querySelector('button').addEventListener('click', carregarMais);

  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search);
    estado.categoria = p.get('categoria') || '';
    estado.busca = p.get('busca') || '';
    el.busca.value = estado.busca;
    estado.mostrando = POR_PAGINA;
    desenhar({ animar: false });
  });

  (async () => {
    try {
      estado.dados = await carregarIndice();
    } catch {
      estado.dados = { pagina: {}, categorias: [], seo: {}, posts: [] };
    }
    const { pagina, seo } = estado.dados;
    el.hero.innerHTML = viewCabecalho(pagina);
    el.hero.classList.add('is-ready');
    if (seo?.titulo || seo?.descricao) {
      aplicarSeo({
        titulo: `${seo.titulo || 'Blog'} | EJUVV`,
        descricao: seo.descricao || pagina.texto || '',
      });
    }
    atualizarChamada(pagina);
    desenharFiltros();
    desenhar();
  })();
}

/* ------------------------------------------------------------------ início */

if (rotaPost) iniciarArtigo(rotaPost[1]);
else iniciarLista();
