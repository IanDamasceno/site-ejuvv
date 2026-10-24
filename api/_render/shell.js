// Esqueleto comum de todas as páginas: head, cabeçalho, menu do celular, rodapé e scripts.
import crypto from 'node:crypto';
import {esc, icon, txt, destino, alvo, numeroWhatsapp, telefoneTexto, secao, imagemSegura} from './fmt.js';
import {limparEfeitos} from '../../assets/js/motion/efeitos.js';

export const SITE = 'https://ejuvv.com';
// Muda a cada versão dos arquivos de estilo e script, para o navegador não usar cópias antigas.
const V = '20261024';
const v = u => `${u}?v=${V}`;

/* ---------------- Scripts embutidos e Content-Security-Policy ----------------
   Só rodam scripts do próprio site e estes pequenos scripts embutidos, liberados pela
   impressão digital (hash) exata. Qualquer outro script colado numa página não roda. */
export const SCRIPT_JS = "document.documentElement.classList.add('js')";
export const SCRIPT_ANO = "document.getElementById('year').textContent = new Date().getFullYear()";
export const SCRIPT_BLOG = "/^\\/blog\\/[a-z0-9-]+\\/?$/.test(location.pathname)&&document.documentElement.classList.add('blog-is-post')";
const hash = s => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const MAPAS = 'https://www.openstreetmap.org https://www.google.com https://maps.google.com';

/** Cabeçalho CSP das páginas. Em desenvolvimento, aceita as imagens servidas pelo painel local. */
export function politicaSeguranca() {
  const dev = !process.env.VERCEL;
  return [
    "default-src 'self'",
    `script-src 'self' ${[SCRIPT_JS, SCRIPT_ANO, SCRIPT_BLOG].map(hash).join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: https:${dev ? ' http://localhost:*' : ''}`,
    "font-src 'self'",
    "connect-src 'self'",
    `frame-src ${MAPAS}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

/** A seção do menu marcada como atual: o item cujo endereço é o início da página. */
function itemAtual(menu, url) {
  const candidatos = menu.map(m => destino(m.destino)).filter(d => d.startsWith('/'));
  if (url === '/') return candidatos.includes('/') ? '/' : '';
  return candidatos.filter(d => d !== '/' && url.startsWith(d)).sort((a, b) => b.length - a.length)[0] || '';
}

const imagemAbsoluta = u => {
  const s = imagemSegura(u);
  return /^https:\/\//.test(s) ? s : s.startsWith('/') ? SITE + s : `${SITE}/og.png`;
};

export function marca(C) {
  const logo = imagemSegura(C.geral.logo);
  return `${logo ? `<img class="brand-mark" src="${esc(logo)}" alt="" aria-hidden="true">` : ''}
      <span>${esc(C.geral.marca)}</span>`;
}

function rodape(C) {
  const R = C.rodape;
  const G = C.geral;
  const wa = numeroWhatsapp(G.whatsapp);
  const lista = itens => itens
    .map(i => ({rot: String(i.rotulo || '').trim(), href: destino(i.destino)}))
    .filter(i => i.rot && i.href)
    .map(i => `          <li><a href="${esc(i.href)}"${alvo(i.href, 'noopener noreferrer')}>${esc(i.rot)}</a></li>`)
    .join('\n');
  const contato = [
    G.email ? `          <li><a href="mailto:${esc(G.email)}">${esc(G.email)}</a></li>` : '',
    wa ? `          <li><a href="https://wa.me/${wa}" target="_blank" rel="noreferrer">${esc(telefoneTexto(G.whatsapp))}</a></li>` : '',
    G.endereco ? `          <li><span>${esc(G.endereco)}</span></li>` : '',
  ].filter(Boolean).join('\n');
  return `<footer${secao({classes: 'footer', cores: R.cores})}>
  <div class="container">
    <div class="footer-grid">
      <div>
        <span class="brand">
          ${imagemSegura(C.geral.logo) ? `<img class="brand-mark" src="${esc(imagemSegura(C.geral.logo))}" alt="" aria-hidden="true">` : ''}
          ${esc(C.geral.marca)}
        </span>
        ${G.descricao ? `<p class="footer-tagline">${esc(G.descricao)}</p>` : ''}
      </div>
      <div class="footer-col">
        <h3>${esc(R.tituloNavegue)}</h3>
        <ul>
${lista(R.navegue)}
        </ul>
      </div>
      <div class="footer-col">
        <h3>${esc(R.tituloContato)}</h3>
        <ul>
${contato || '          <li><span>A confirmar</span></li>'}
        </ul>
      </div>
      <div class="footer-col">
        <h3>${esc(R.tituloTransparencia)}</h3>
        <ul>
${lista(R.transparencia)}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span id="year">${new Date().getFullYear()}</span> ${esc(R.direitos)}</span>
      ${R.linhaDireita ? `<span>${esc(R.linhaDireita)}</span>` : ''}
    </div>
  </div>
</footer>

${wa ? `<a class="wa-float" href="https://wa.me/${wa}" target="_blank" rel="noreferrer" aria-label="Conversar pelo WhatsApp">
  ${icon('i-message-circle')}
</a>` : ''}`;
}

/**
 * Página completa.
 * titulo: título já completo (“Sobre | EJUVV”); compartilhar*: textos do card de link (padrão: os mesmos).
 * envolver: HTML que fica dentro de #page antes do <main> (camada do foguete da home).
 */
export function pagina(C, {
  url, titulo, descricao, compartilharTitulo, compartilharDescricao, imagem, tipo = 'website',
  corpo, head = '', scripts = ['/assets/js/pages/inner.js'], envolver = null, robots = '', htmlClasse = '',
}) {
  const fx = limparEfeitos(C.efeitos);
  const menu = (C.cabecalho.menu || []).filter(m => String(m.rotulo || '').trim() && destino(m.destino));
  const atual = itemAtual(menu, url);
  const navLinks = menu.map(m => {
    const href = destino(m.destino);
    return `<a href="${esc(href)}"${href === atual ? ' aria-current="page"' : ''}${alvo(href)}>${esc(m.rotulo)}</a>`;
  }).join('\n      ');
  const mobileLinks = menu.map(m => {
    const href = destino(m.destino);
    return `  <a class="m-link" href="${esc(href)}"${alvo(href)}>${esc(m.rotulo)} ${icon('i-chevron-right')}</a>`;
  }).join('\n');
  const b = C.cabecalho.botao;
  const bm = C.cabecalho.botaoMobile;
  const bHref = destino(b?.destino);
  const bmHref = destino(bm?.destino);
  const ogT = compartilharTitulo || titulo;
  const ogD = compartilharDescricao || descricao;

  const main = `<main id="main">
${corpo}
</main>`;

  return `<!doctype html>
<html lang="pt-BR"${htmlClasse ? ` class="${htmlClasse}"` : ''} data-efeitos="${esc(JSON.stringify(fx))}" data-fx-cards="${fx.cards}" data-fx-logos="${fx.logos}" data-fx-marca="${fx.marca}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
${robots ? `<meta name="robots" content="${robots}">\n` : ''}<link rel="canonical" href="${SITE}${esc(url)}">
<meta property="og:title" content="${esc(ogT)}">
<meta property="og:description" content="${esc(ogD)}">
<meta property="og:type" content="${tipo}">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="${SITE}${esc(url)}">
<meta property="og:image" content="${esc(imagemAbsoluta(imagem || C.geral.seo.imagem))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#35143d">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${v('/assets/css/base.css')}">
<link rel="stylesheet" href="${v('/assets/css/layout.css')}">
<link rel="stylesheet" href="${v('/assets/css/components.css')}">
<link rel="stylesheet" href="${v('/assets/css/motion.css')}">
<link rel="stylesheet" href="${v('/assets/css/cms.css')}">
<link rel="modulepreload" href="/assets/js/vendor/anime.esm.min.js">
<script>${SCRIPT_JS}</script>${head}
</head>
<body>
<a class="skip-link" href="#main">Pular para o conteúdo</a>

<header class="header">
  <div class="header-inner">
    <a class="brand" href="/" aria-label="${esc(C.geral.marca)}, início">
      ${marca(C)}
    </a>
    <nav class="desktop-nav" aria-label="Navegação principal">
      ${navLinks}
    </nav>
    ${bHref && b.texto ? `<a class="btn btn-primary" href="${esc(bHref)}"${alvo(bHref)} data-magnetic>${txt(b.texto)}</a>` : ''}
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menu">
      ${icon('i-menu', 'class="icon-open"')}
      ${icon('i-x', 'class="icon-close" hidden')}
    </button>
  </div>
</header>

<div class="mobile-menu" id="mobile-menu" aria-hidden="true">
${mobileLinks}
${bmHref && bm.texto ? `  <a class="btn btn-primary" href="${esc(bmHref)}"${alvo(bmHref)}>${txt(bm.texto)} ${icon('i-arrow-right')}</a>` : ''}
</div>

${envolver === null ? main : `<div id="page">
${envolver}
  ${main}
</div>`}

${rodape(C)}

<script>${SCRIPT_ANO}</script>
${scripts.map(src => `<script type="module" src="${v(src)}"></script>`).join('\n')}
</body>
</html>
`;
}

/** Topo das páginas internas, com o caminho “Início / Página” quando ligado em Configurações. */
export function topo(C, hero = {}, migalhas = []) {
  const caminho = C.geral.migalhas && migalhas.length
    ? `<nav class="breadcrumb" aria-label="Você está aqui">
          <a href="/">Início</a>${migalhas.map(([rot, href], i) => `<span aria-hidden="true">/</span>${href && i < migalhas.length - 1 ? `<a href="${esc(href)}">${esc(rot)}</a>` : `<span aria-current="page">${esc(rot)}</span>`}`).join('')}
        </nav>
        `
    : '';
  return `
    <section${secao({classes: 'page-hero', cores: hero.cores})}>
      <div class="container">
        ${caminho}${hero.eyebrow ? `<span class="eyebrow">${esc(hero.eyebrow)}</span>` : ''}
        <h1>${txt(hero.titulo)}</h1>
        ${hero.texto ? `<p>${txt(hero.texto)}</p>` : ''}
      </div>
    </section>`;
}
