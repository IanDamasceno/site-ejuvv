// Página inicial. A ordem das seções é fixa: a trajetória do foguete foi desenhada para ela
// (data-rocket-x). Cada seção pode ser escondida e ter cores próprias no painel.
import {esc, icon, txt, secao, botao, imagemSegura} from './fmt.js';
import {pagina, SITE} from './shell.js';
import {servicosPublicados, cardServico, projetosPublicados, cardsProjetos, timeline, faq, mapa, formulario, chamada} from './blocos.js';
import {cartao} from '../../assets/js/blog/views.js';
import {limparEfeitos} from '../../assets/js/motion/efeitos.js';

const visivel = s => s && s.ativo !== false;

const FOGUETE = `
  <!-- ============ Camada do foguete ============ -->
  <div id="rocket-layer" data-tone="dark" aria-hidden="true"%ESTILO%>
    <svg class="traj-svg" viewBox="0 0 1000 4000" preserveAspectRatio="xMinYMin meet" fill="none">
      <path id="traj"/>
    </svg>
    <div id="rocket">
      <svg viewBox="0 0 54 86" fill="none">
        <defs>
          <radialGradient id="rocketGlow">
            <stop offset="0" stop-color="#8067ff" stop-opacity=".5"/>
            <stop offset="1" stop-color="#8067ff" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff3c4"/>
            <stop offset=".45" stop-color="#ffb45c"/>
            <stop offset="1" stop-color="#ff6a3d" stop-opacity=".2"/>
          </linearGradient>
        </defs>
        <ellipse id="r-glow" cx="27" cy="46" rx="32" ry="44"/>
        <g id="r-craft">
          <path id="r-flame" d="M27 70c4 6 6.5 11 6.5 15 0 5-3 8-6.5 8s-6.5-3-6.5-8c0-4 2.5-9 6.5-15Z"/>
          <path id="r-fin-l" class="r-part" d="M16 44c-7 4-11 11-11 22l11-6Z"/>
          <path id="r-fin-r" class="r-part" d="M38 44c7 4 11 11 11 22l-11-6Z"/>
          <path id="r-thruster" class="r-part" d="M18 61h18l-3 9H21Z"/>
          <path id="r-body" class="r-part" d="M27 4c6 10 11 22 11 36v22H16V40C16 26 21 14 27 4Z"/>
          <path id="r-nose" class="r-part" d="M27 4c4 6.5 7.5 14 9.4 22H17.6C19.5 18 23 10.5 27 4Z"/>
          <circle id="r-window" class="r-part" cx="27" cy="31" r="6"/>
          <ellipse id="r-glint" cx="25" cy="29" rx="2.1" ry="2.8"/>
        </g>
      </svg>
    </div>
  </div>
`;

function hero(H) {
  const botoes = [botao(H.botao1, 'btn btn-primary', {seta: true}), botao(H.botao2, 'btn btn-secondary')].filter(Boolean);
  return `
    <!-- ============ Hero: lançamento ============ -->
    <section${secao({classes: 'hero', tom: 'dark', cores: H.cores, extra: ' data-rocket-x="0.74" data-rocket-anchor="end"'})}>
      <div class="container hero-grid">
        <div class="hero-copy">
          <h1>${txt(H.titulo)}</h1>
          ${H.texto ? `<p>${txt(H.texto)}</p>` : ''}
          ${botoes.length ? `<div class="button-row">
            ${botoes.join('\n            ')}
          </div>` : ''}
        </div>
        <div class="hero-stage" aria-hidden="true">
          <div class="hero-rings" data-drift="1">
            <div class="hero-ring r1"></div>
            <div class="hero-ring r2"></div>
            <div class="hero-ring r3"></div>
          </div>
          ${H.coord1 ? `<span class="hero-coord c1">${esc(H.coord1)}</span>` : ''}
          ${H.coord2 ? `<span class="hero-coord c2">${esc(H.coord2)}</span>` : ''}
        </div>
      </div>
    </section>`;
}

function indicadores(S) {
  const itens = (S.itens || []).filter(i => String(i.valor || '').trim() || String(i.rotulo || '').trim());
  if (!itens.length) return '';
  return `
    <!-- ============ Indicadores ============ -->
    <section${secao({classes: 'indicators', tom: 'dark', cores: S.cores, extra: ' data-rocket-x="0.90" aria-label="Indicadores da EJUVV"'})}>
      <div class="container indicators-inner">
${itens.map(i => `        <div class="stat">
          ${icon(i.icone || 'i-star')}
          <strong data-count="${esc(i.valor)}">${esc(i.valor)}</strong>
          <span>${esc(i.rotulo)}</span>
        </div>`).join('\n')}
      </div>
    </section>`;
}

function destaqueVisual(S, delay = 140) {
  const img = imagemSegura(S.imagem);
  if (img) return `<figure class="media-photo" data-reveal data-reveal-delay="${delay}"><img src="${esc(img)}" alt="${esc(S.imagemAlt || '')}" loading="lazy"></figure>`;
  return `<div class="media-placeholder" data-reveal data-reveal-delay="${delay}">
          <span>${esc(S.destaqueTitulo)}</span>
          <small>${esc(S.destaqueTexto)}</small>
        </div>`;
}

function sobre(S) {
  return `
    <!-- ============ Sobre: ascensão ============ -->
    <section${secao({classes: 'section', tom: 'light', cores: S.cores, extra: ' id="sobre" data-rocket-x="0.95"'})}>
      <div class="container split">
        <div data-reveal>
          ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
          <h2>${txt(S.titulo)}</h2>
          ${S.texto ? `<p class="lead">${txt(S.texto)}</p>` : ''}
          ${botao(S.link, 'text-link', {seta: true}) ? `<p style="margin-top:26px">
            ${botao(S.link, 'text-link', {seta: true})}
          </p>` : ''}
        </div>
        ${destaqueVisual(S)}
      </div>
    </section>`;
}

function solucoes(S, C) {
  const lista = servicosPublicados(C);
  return `
    <!-- ============ Soluções: exploração ============ -->
    <section${secao({classes: 'section on-dark', tom: 'dark', cores: S.cores, estilo: 'background:radial-gradient(ellipse 60% 50% at 12% 8%,rgba(255,255,255,.09),transparent 55%),var(--brand)', extra: ' id="solucoes" data-rocket-x="0.94" data-rocket-anchor="end"'})}>
      <div class="container">
        <div class="section-heading">
          <div data-reveal>
            ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
            <h2>${txt(S.titulo)}</h2>
          </div>
          ${S.texto ? `<p data-reveal data-reveal-delay="120">${txt(S.texto)}</p>` : ''}
        </div>
        <div class="service-grid">
${lista.map((s, i) => cardServico(s, i, S)).join('\n')}
        </div>
      </div>
    </section>`;
}

function processo(S, C) {
  return `
    <!-- ============ Processo ============ -->
    <section${secao({classes: 'section on-dark', tom: 'dark', cores: S.cores, extra: ' data-rocket-x="0.06" data-rocket-anchor="start"'})}>
      <div class="container">
        <div data-reveal>
          ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
          <h2>${txt(S.titulo)}</h2>
        </div>${timeline(C.processo.passos)}
      </div>
    </section>`;
}

function montagem(S) {
  const fases = ['scatter', 'assemble', 'formed', 'disassemble'];
  return `
    <!-- ============ Montagem: o foguete construído pelo scroll ============ -->
    <section${secao({classes: 'assembly', tom: 'dark', cores: S.cores, extra: ' id="assembly" data-rocket-x="0.03" aria-labelledby="assembly-title"'})}>
      <div class="assembly-stage" id="assembly-stage" data-phase="scatter">
        <canvas id="assembly-canvas" aria-hidden="true"></canvas>
        <div class="assembly-grid" aria-hidden="true"></div>

        <div class="container assembly-hud">
          <div class="assembly-copy">
            ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
            <h2 id="assembly-title" class="balance">${txt(S.titulo)}</h2>
            ${S.texto ? `<p>${txt(S.texto)}</p>` : ''}
          </div>

          ${S.dica ? `<span class="assembly-cue" aria-hidden="true">${esc(S.dica)}</span>` : ''}

          <div class="assembly-readout" aria-hidden="true">
            <ol class="assembly-phases">
${fases.map((f, i) => `              <li data-for="${f}">${esc(S.fases?.[i] || '')}</li>`).join('\n')}
            </ol>
            <div class="assembly-bar"><span></span></div>
          </div>
        </div>
      </div>
    </section>`;
}

function projetos(S, P) {
  const todos = projetosPublicados(P);
  const lista = todos.filter(p => p.destaque);
  const mostrar = (lista.length ? lista : todos).slice(0, 6);
  return `
    <!-- ============ Projetos: aceleração ============ -->
    <section${secao({classes: 'section', tom: 'light', cores: S.cores, extra: ' id="projetos" data-rocket-x="0.05"'})}>
      <div class="container">
        <div class="section-heading">
          <div data-reveal>
            ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
            <h2>${txt(S.titulo)}</h2>
          </div>
          ${S.texto ? `<p data-reveal data-reveal-delay="120">${txt(S.texto)}</p>` : ''}
        </div>
        <div class="project-grid">
${cardsProjetos(mostrar, S.linkProjeto, {naHome: true})}
        </div>
      </div>
    </section>`;
}

function blog(S, dadosBlog) {
  const posts = (dadosBlog?.posts || []).slice(0, 3);
  if (!posts.length) return '';
  return `
    <!-- ============ Blog ============ -->
    <section${secao({classes: 'section', tom: 'light', cores: S.cores, extra: ' id="blog" data-rocket-x="0.94"'})}>
      <div class="container">
        <div class="section-heading">
          <div data-reveal>
            ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
            <h2>${txt(S.titulo)}</h2>
          </div>
          ${S.texto ? `<p data-reveal data-reveal-delay="120">${txt(S.texto)}</p>` : ''}
        </div>
        <div class="blog-grid">
${posts.map(p => cartao(p, dadosBlog.categorias)).join('\n')}
        </div>
        ${botao(S.botao, 'btn btn-outline', {seta: true}) ? `<p style="margin-top:40px;text-align:center">${botao(S.botao, 'btn btn-outline', {seta: true})}</p>` : ''}
      </div>
    </section>`;
}

function clientes(S) {
  const logos = (S.logos || []).filter(l => imagemSegura(l.imagem));
  if (!logos.length) return '';
  const grupo = (oculto) => `          <div class="logo-group"${oculto ? ' aria-hidden="true"' : ''}>
${logos.map(l => `            <div class="logo-slot${l.largo ? ' logo-slot-wide' : ''}"><img src="${esc(imagemSegura(l.imagem))}" alt="${oculto ? '' : esc(l.nome)}"></div>`).join('\n')}
          </div>`;
  return `
    <!-- ============ Clientes: travessia ============ -->
    <section${secao({classes: 'section soft', tom: 'light', cores: S.cores, extra: ' data-rocket-x="0.06" data-rocket-anchor="end"'})}>
      <div class="container" data-reveal>
        ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
        <h2>${txt(S.titulo)}</h2>
      </div>
      <div class="marquee" style="margin-top:48px" aria-label="${esc(S.eyebrow || 'Clientes')}">
        <div class="marquee-track">
${[false, true, true, true].map(grupo).join('\n')}
        </div>
      </div>
    </section>`;
}

function orbita(S, C) {
  const botoes = [botao(S.botao1, 'btn btn-light', {seta: true, magnetico: true}), botao(S.botao2, 'btn btn-ghost')].filter(Boolean);
  const beneficios = (C.paginas.orbita.beneficios || []).filter(Boolean);
  return `
    <!-- ============ Órbita ============ -->
    <section${secao({classes: 'section on-dark', tom: 'dark', cores: S.cores, estilo: 'background:linear-gradient(135deg,var(--deep),var(--brand) 56%,#6f3b78)', extra: ' id="orbita" data-rocket-x="0.94" data-rocket-anchor="start"'})}>
      <div class="container split">
        <div data-reveal>
          ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
          <h2>${txt(S.titulo)}</h2>
          ${S.texto ? `<p class="lead">${txt(S.texto)}</p>` : ''}
          ${botoes.length ? `<div class="button-row" style="margin-top:30px">
            ${botoes.join('\n            ')}
          </div>` : ''}
        </div>
        <ul class="benefit-list">
${beneficios.map(b => `          <li data-reveal="stagger" data-reveal-group="orb">${icon('i-check')}${txt(b)}</li>`).join('\n')}
        </ul>
      </div>
    </section>`;
}

function chamadaHome(S) {
  return `
    <!-- ============ CTA comercial ============ -->
    <section${secao({classes: 'section', tom: 'light', cores: S.cores, extra: ' data-rocket-x="0.95"'})}>
      ${chamada(S)}
    </section>`;
}

function contato(S, C) {
  return `
    <!-- ============ Contato: chegada ============ -->
    <section${secao({classes: 'section soft', tom: 'light', cores: S.cores, extra: ' id="contato" data-rocket-x="0.92"'})}>
      <div class="container split" style="align-items:start">

        <div>
          <div data-reveal>
            ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
            <h2>${txt(S.titulo)}</h2>
            ${S.texto ? `<p class="lead">${txt(S.texto)}</p>` : ''}
          </div>
${S.mapa !== false ? mapa(C, 'margin:34px 0') : ''}

          ${(S.faq || []).length ? `<div class="faq" data-reveal>
${faq(S.faq, 'faq-', {primeiraAberta: true})}
          </div>` : ''}
        </div>
${formulario(C, {comContatos: true})}

      </div>
    </section>`;
}

export function renderHome(C, P, dadosBlog) {
  const H = C.home;
  const fx = limparEfeitos(C.efeitos);
  const secoes = [
    hero(H.hero),
    visivel(H.indicadores) ? indicadores(H.indicadores) : '',
    visivel(H.sobre) ? sobre(H.sobre) : '',
    visivel(H.solucoes) ? solucoes(H.solucoes, C) : '',
    visivel(H.processo) ? processo(H.processo, C) : '',
    visivel(H.montagem) ? montagem(H.montagem) : '',
    visivel(H.projetos) ? projetos(H.projetos, P) : '',
    visivel(H.blog) ? blog(H.blog, dadosBlog) : '',
    visivel(H.clientes) ? clientes(H.clientes) : '',
    visivel(H.orbita) ? orbita(H.orbita, C) : '',
    visivel(H.chamada) ? chamadaHome(H.chamada) : '',
    visivel(H.contato) ? contato(H.contato, C) : '',
  ].filter(Boolean);
  const seo = C.geral.seo;
  return pagina(C, {
    url: '/',
    titulo: seo.titulo,
    descricao: seo.descricao,
    compartilharTitulo: seo.compartilharTitulo,
    compartilharDescricao: seo.compartilharDescricao,
    imagem: seo.imagem,
    corpo: `${secoes.join('\n')}
`,
    envolver: FOGUETE.replace('%ESTILO%', fx.foguete === 'desligado' ? ' style="display:none"' : ''),
    head: visivel(H.blog) && dadosBlog?.posts?.length ? '\n<link rel="stylesheet" href="/assets/css/blog.css?v=20261023">' : '',
    scripts: ['/assets/js/pages/home.js'],
  });
}

export {SITE};
