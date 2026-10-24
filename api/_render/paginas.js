// Páginas internas. A estrutura de cada uma é a mesma do site original; os textos,
// as imagens, as listas e as cores vêm do conteúdo publicado no painel.
import {esc, icon, txt, pad, paragrafos, secao, botao, imagemSegura, destino, alvo} from './fmt.js';
import {pagina, topo} from './shell.js';
import {servicosPublicados, cardServico, projetosPublicados, cardsProjetos, slugCategoria, timeline, faq, contatos, mapa, formulario, chamada} from './blocos.js';

const titulo = (C, t) => `${t} | ${C.geral.marca}`;
const vazio = v => !String(v ?? '').trim();
const ondaEscura = 'background:radial-gradient(ellipse 60% 50% at 85% 15%,rgba(255,255,255,.08),transparent 50%),var(--deep)';

function blocoProcesso(S, C) {
  return `
    <section${secao({classes: 'section on-dark', cores: S.cores, estilo: ondaEscura})}>
      <div class="container">
        <div data-reveal>
          ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
          <h2>${txt(S.titulo)}</h2>
        </div>
${timeline(C.processo.passos)}
      </div>
    </section>`;
}

function visual(S, delay = 140) {
  const img = imagemSegura(S.imagem);
  if (img) return `<figure class="media-photo" data-reveal data-reveal-delay="${delay}"><img src="${esc(img)}" alt="${esc(S.imagemAlt || '')}" loading="lazy"></figure>`;
  return `<div class="media-placeholder" data-reveal data-reveal-delay="${delay}">
          <span>${esc(S.destaqueTitulo)}</span>
          <small>${esc(S.destaqueTexto)}</small>
        </div>`;
}

/* ---------------- Sobre ---------------- */

export function renderSobre(C) {
  const Pg = C.paginas.sobre;
  const H = Pg.historia;
  const V = Pg.valores;
  const M = Pg.missao;
  const paras = paragrafos(H.texto, ' class="lead"').map((p, i) => i ? p.replace('<p class="lead">', '<p class="lead" style="margin-top:20px">') : p);
  return pagina(C, {
    url: '/sobre/',
    titulo: titulo(C, Pg.seo.titulo),
    descricao: Pg.seo.descricao,
    corpo: `${topo(C, Pg.hero, [['Sobre']])}

    <section${secao({classes: 'section', cores: H.cores})}>
      <div class="container split">
        <div data-reveal>
          ${H.eyebrow ? `<span class="eyebrow">${esc(H.eyebrow)}</span>` : ''}
          <h2>${txt(H.titulo)}</h2>
          ${paras.join('\n          ')}
        </div>
        ${visual(H)}
      </div>
    </section>

    <section${secao({classes: 'section on-dark', cores: V.cores, estilo: 'background:radial-gradient(ellipse 60% 50% at 85% 20%,rgba(165,102,176,.24),transparent 55%),var(--deep)'})}>
      <div class="container">
        <div class="section-heading">
          <div data-reveal>
            ${V.eyebrow ? `<span class="eyebrow">${esc(V.eyebrow)}</span>` : ''}
            <h2>${txt(V.titulo)}</h2>
          </div>
          ${V.texto ? `<p data-reveal data-reveal-delay="120">${txt(V.texto)}</p>` : ''}
        </div>
        <div class="value-grid">
${(V.itens || []).filter(v => !vazio(v.titulo)).map((v, i) => `          <article class="value-card" data-reveal="stagger" data-reveal-group="val">
            <b>${pad(i + 1)}</b>
            <h3>${esc(v.titulo)}</h3>
            <p>${txt(v.texto)}</p>
          </article>`).join('\n')}
        </div>
      </div>
    </section>

    <section${secao({classes: 'section soft', cores: M.cores})}>
      <div class="container split">
        <div data-reveal>
          ${M.eyebrowMissao ? `<span class="eyebrow">${esc(M.eyebrowMissao)}</span>` : ''}
          <h2>${txt(M.missao)}</h2>
        </div>
        <div data-reveal data-reveal-delay="140">
          ${M.eyebrowVisao ? `<span class="eyebrow">${esc(M.eyebrowVisao)}</span>` : ''}
          <h2>${txt(M.visao)}</h2>
        </div>
      </div>
    </section>

    <section${secao({classes: 'section', cores: Pg.chamada.cores})}>
      ${chamada(Pg.chamada)}
    </section>`,
  });
}

/* ---------------- Soluções ---------------- */

export function renderSolucoes(C) {
  const Pg = C.paginas.solucoes;
  const lista = servicosPublicados(C);
  return pagina(C, {
    url: '/solucoes/',
    titulo: titulo(C, Pg.seo.titulo),
    descricao: Pg.seo.descricao,
    corpo: `${topo(C, Pg.hero, [['Soluções']])}

    <section${secao({classes: 'section soft', cores: Pg.lista.cores})}>
      <div class="container">
        <div class="service-grid">
${lista.map((s, i) => cardServico(s, i, {rotuloProblema: C.home.solucoes.rotuloProblema, ...Pg.lista})).join('\n')}
        </div>
      </div>
    </section>
${blocoProcesso(Pg.processo, C)}`,
  });
}

export function renderServico(C, slug) {
  const s = servicosPublicados(C).find(x => x.slug === slug);
  if (!s) return null;
  const T = C.paginas.servico;
  const D = T.detalhe;
  const O = T.outros;
  const entregas = (s.entregas || []).filter(Boolean);
  return pagina(C, {
    url: `/solucoes/${s.slug}/`,
    titulo: titulo(C, s.titulo),
    descricao: s.descricao,
    corpo: `${topo(C, {eyebrow: T.heroEyebrow, titulo: s.titulo, texto: s.descricao, cores: T.heroCores}, [['Soluções', '/solucoes/'], [s.titulo]])}

    <section${secao({classes: 'section', cores: D.cores})}>
      <div class="container split" style="align-items:start">
        <div data-reveal>
          ${D.publicoEyebrow ? `<span class="eyebrow">${esc(D.publicoEyebrow)}</span>` : ''}
          <h2>${txt(D.publicoTitulo)}</h2>
          ${s.publico ? `<p class="lead">${txt(s.publico)}</p>` : ''}
          ${D.botao ? `<p style="margin-top:28px">
            <a class="btn btn-primary" href="/contato/?servico=${esc(s.slug)}" data-magnetic>${esc(D.botao)} ${icon('i-arrow-right')}</a>
          </p>` : ''}
        </div>
        ${entregas.length ? `<div data-reveal data-reveal-delay="140">
          ${D.incluidoEyebrow ? `<span class="eyebrow">${esc(D.incluidoEyebrow)}</span>` : ''}
          <h2 style="margin-bottom:26px">${txt(D.incluidoTitulo)}</h2>
          <ul class="deliverables">
${entregas.map((d, i) => `            <li><b>${pad(i + 1)}</b><span>${txt(d)}</span>${icon('i-check')}</li>`).join('\n')}
          </ul>
        </div>` : ''}
      </div>
    </section>
${blocoProcesso(T.processo, C)}

    <section${secao({classes: 'section soft', cores: O.cores})}>
      <div class="container cta-band" data-reveal>
        ${O.eyebrow ? `<span class="eyebrow">${esc(O.eyebrow)}</span>` : ''}
        <h2>${txt(O.titulo)}</h2>
        ${O.botao ? `<a class="btn btn-outline" href="/solucoes/">${esc(O.botao)} ${icon('i-arrow-right')}</a>` : ''}
      </div>
    </section>`,
  });
}

/* ---------------- Projetos ---------------- */

export function renderProjetos(C, P) {
  const Pg = C.paginas.projetos;
  const L = Pg.lista;
  const lista = projetosPublicados(P);
  const cats = [...new Map(lista.filter(p => p.categoria).map(p => [slugCategoria(p.categoria), p.categoria])).entries()];
  const comFiltro = cats.length > 1 || lista.length > 3;
  const barra = comFiltro ? `
        <div class="projetos-filtros" id="projetos-filtros">
          ${cats.length > 1 ? `<div class="blog-filters" role="group" aria-label="Filtrar por categoria">
            <button class="blog-chip" type="button" data-categoria-filtro="" aria-pressed="true">${esc(L.todos)}</button>
            ${cats.map(([s, n]) => `<button class="blog-chip" type="button" data-categoria-filtro="${esc(s)}" aria-pressed="false">${esc(n)}</button>`).join('\n            ')}
          </div>` : ''}
          ${lista.length > 3 ? `<label class="blog-search">
            <span class="visually-hidden">${esc(L.busca)}</span>
            ${icon('i-search')}
            <input type="search" placeholder="${esc(L.busca)}" autocomplete="off" enterkeyhint="search">
          </label>` : ''}
        </div>
        <p class="visually-hidden" id="projetos-status" role="status" aria-live="polite"></p>` : '';
  return pagina(C, {
    url: '/projetos/',
    titulo: titulo(C, Pg.seo.titulo),
    descricao: Pg.seo.descricao,
    corpo: `${topo(C, Pg.hero, [['Projetos']])}

    <section${secao({classes: 'section', cores: L.cores})}>
      <div class="container">${barra}
        <div class="project-grid">
${cardsProjetos(lista, L.linkProjeto, {filtro: comFiltro})}
        </div>${comFiltro ? `
        <div class="blog-empty" id="projetos-vazio" hidden>
          <h2>${esc(L.vazio)}</h2>
          <button class="btn btn-outline" type="button" data-limpar-projetos>${esc(L.todos)}</button>
        </div>` : ''}
      </div>
    </section>`,
    head: comFiltro ? '\n<link rel="stylesheet" href="/assets/css/blog.css?v=20261023">' : '',
  });
}

export function renderProjeto(C, P, slug) {
  const p = projetosPublicados(P).find(x => x.slug === slug);
  if (!p) return null;
  const L = C.paginas.projetos.projeto;
  const CH = C.paginas.projetos.chamada;
  const sites = (p.sites || []).filter(s => !vazio(s.nome));
  const galeria = (p.galeria || []).filter(g => imagemSegura(g.imagem));
  const entregas = (p.entregas || []).filter(Boolean);
  const blocos = [];

  if (!vazio(p.introTitulo) || !vazio(p.solucao)) blocos.push(`<section${secao({classes: 'section', cores: L.cores})}>
      <div class="container case-intro" data-reveal>
        <div>
          ${L.introEyebrow ? `<span class="eyebrow">${esc(L.introEyebrow)}</span>` : ''}
          ${p.introTitulo ? `<h2>${txt(p.introTitulo)}</h2>` : ''}
        </div>
        ${p.solucao ? `<p>${txt(p.solucao)}</p>` : ''}
      </div>
    </section>`);

  if (sites.length) blocos.push(`<section class="section soft">
      <div class="container">
        <div class="section-heading">
          <div data-reveal>
            ${L.sitesEyebrow ? `<span class="eyebrow">${esc(L.sitesEyebrow)}</span>` : ''}
            <h2>${txt(L.sitesTitulo)}</h2>
          </div>
          ${p.desafio ? `<p data-reveal data-reveal-delay="120">${txt(p.desafio)}</p>` : ''}
        </div>
        <div class="case-site-grid">
${sites.map(s => {
    const url = destino(s.url);
    const img = imagemSegura(s.imagem);
    return `          <article class="case-site-card">
            ${img ? `<${url ? `a class="case-site-shot" href="${esc(url)}" target="_blank" rel="noreferrer"` : 'div class="case-site-shot"'}>
              <img src="${esc(img)}" alt="Home do site ${esc(s.nome)}">
            </${url ? 'a' : 'div'}>` : ''}
            <div class="case-site-body">
              ${s.especialidade ? `<small>${esc(s.especialidade)}</small>` : ''}
              <h3>${esc(s.nome)}</h3>
              ${s.nota ? `<p>${txt(s.nota)}</p>` : ''}
              ${url && L.linkSite ? `<a class="text-link" href="${esc(url)}" target="_blank" rel="noreferrer">${esc(L.linkSite)} ${icon('i-arrow-right')}</a>` : ''}
            </div>
          </article>`;
  }).join('\n')}
        </div>
      </div>
    </section>`);

  if (galeria.length) blocos.push(`<section class="section${sites.length ? '' : ' soft'}">
      <div class="container">
        <div data-reveal style="margin-bottom:40px">
          ${L.galeriaEyebrow ? `<span class="eyebrow">${esc(L.galeriaEyebrow)}</span>` : ''}
          <h2>${txt(L.galeriaTitulo)}</h2>
        </div>
        <div class="galeria" data-galeria>
${galeria.map((g, i) => `          <a class="galeria-item" href="${esc(imagemSegura(g.imagem))}"${g.legenda ? ` data-legenda="${esc(g.legenda)}"` : ''} data-reveal="stagger" data-reveal-group="gal">
            <img src="${esc(imagemSegura(g.imagem))}" alt="${esc(g.legenda || `Foto ${i + 1} do projeto ${p.titulo}`)}" loading="lazy">
          </a>`).join('\n')}
        </div>
      </div>
    </section>`);

  if (entregas.length || !vazio(p.resultado)) blocos.push(`<section class="section">
      <div class="container case-details" data-reveal>
        <div>
          ${L.entregasEyebrow ? `<span class="eyebrow">${esc(L.entregasEyebrow)}</span>` : ''}
          <h2>${txt(L.entregasTitulo)}</h2>
        </div>
        <ul class="deliverables case-deliverables">
${entregas.map(item => `          <li>${icon('i-check')}<span>${txt(item)}</span></li>`).join('\n')}
        </ul>
        ${p.resultado ? `<div class="case-result">
          <small>${esc(L.resultadoRotulo)}</small>
          <p>${txt(p.resultado)}</p>
        </div>` : ''}
      </div>
    </section>`);

  return pagina(C, {
    url: `/projetos/${p.slug}/`,
    titulo: titulo(C, p.titulo),
    descricao: String(p.desafio || '').replace(/\*/g, ''),
    imagem: p.capa || '',
    corpo: `${topo(C, {eyebrow: p.categoria, titulo: p.titulo, texto: p.desafio, cores: C.paginas.projetos.hero.cores}, [['Projetos', '/projetos/'], [p.titulo]])}
${blocos.join('\n\n    ')}

    <section${secao({classes: 'section soft', cores: CH.cores})}>
      <div class="container cta-band" data-reveal>
        ${CH.eyebrow ? `<span class="eyebrow">${esc(CH.eyebrow)}</span>` : ''}
        <h2>${txt(CH.titulo)}</h2>
        ${botao(CH.botao, 'btn btn-outline', {seta: true})}
      </div>
    </section>`,
  });
}

/* ---------------- Órbita ---------------- */

export function renderOrbita(C) {
  const Pg = C.paginas.orbita;
  const I = Pg.intro;
  const A = Pg.areas;
  const S = Pg.selecao;
  const T = Pg.talentos;
  const inscricao = T.inscricoesAbertas && destino(T.inscricaoLink)
    ? `<a class="btn btn-outline" href="${esc(destino(T.inscricaoLink))}"${alvo(destino(T.inscricaoLink))}>${esc(T.inscricaoTexto)}</a>`
    : `<button class="btn btn-outline" type="button" disabled>${esc(T.fechadoTexto)}</button>`;
  return pagina(C, {
    url: '/orbita/',
    titulo: titulo(C, Pg.seo.titulo),
    descricao: Pg.seo.descricao,
    corpo: `${topo(C, Pg.hero, [['Órbita']])}

    <section${secao({classes: 'section', cores: I.cores})}>
      <div class="container split" style="align-items:start">
        <div data-reveal>
          ${I.eyebrow ? `<span class="eyebrow">${esc(I.eyebrow)}</span>` : ''}
          <h2>${txt(I.titulo)}</h2>
          ${I.texto ? `<p class="lead">${txt(I.texto)}</p>` : ''}
          ${I.status ? `<p class="status-note">${txt(I.status)}</p>` : ''}
        </div>
        <ul class="benefit-list on-light" data-reveal data-reveal-delay="140">
${(Pg.beneficios || []).filter(Boolean).map(b => `          <li>${icon('i-check')}${txt(b)}</li>`).join('\n')}
        </ul>
      </div>
    </section>

    <section${secao({classes: 'section soft', cores: A.cores})}>
      <div class="container">
        <div class="section-heading">
          <div data-reveal>
            ${A.eyebrow ? `<span class="eyebrow">${esc(A.eyebrow)}</span>` : ''}
            <h2>${txt(A.titulo)}</h2>
          </div>
        </div>
        <div class="numbered-grid">
${(A.itens || []).filter(a => !vazio(a.titulo)).map((a, i) => `          <article class="numbered-card" data-reveal="stagger" data-reveal-group="area">
            <b>${pad(i + 1)}</b>
            <h3>${esc(a.titulo)}</h3>
            <p>${txt(a.texto)}</p>
          </article>`).join('\n')}
        </div>
      </div>
    </section>

    <section${secao({classes: 'section on-dark', cores: S.cores, estilo: ondaEscura})}>
      <div class="container">
        <div data-reveal>
          ${S.eyebrow ? `<span class="eyebrow">${esc(S.eyebrow)}</span>` : ''}
          <h2>${txt(S.titulo)}</h2>
        </div>
${timeline(S.passos)}
      </div>
    </section>

    <section${secao({classes: 'section', cores: T.cores, extra: ' id="banco-de-talentos"'})}>
      <div class="container split" style="align-items:start">
        <div data-reveal>
          ${T.eyebrow ? `<span class="eyebrow">${esc(T.eyebrow)}</span>` : ''}
          <h2>${txt(T.titulo)}</h2>
          ${T.texto ? `<p class="lead">${txt(T.texto)}</p>` : ''}
          <div class="button-row" style="margin-top:30px">
            ${botao(T.botao, 'btn btn-primary', {seta: true})}
            ${inscricao}
          </div>
        </div>
        ${(T.faq || []).length ? `<div class="faq" data-reveal data-reveal-delay="140">
${faq(T.faq, 'o-')}
        </div>` : ''}
      </div>
    </section>`,
  });
}

/* ---------------- Contato ---------------- */

export function renderContato(C) {
  const Pg = C.paginas.contato;
  const K = Pg.canais;
  return pagina(C, {
    url: '/contato/',
    titulo: titulo(C, Pg.seo.titulo),
    descricao: Pg.seo.descricao,
    corpo: `${topo(C, Pg.hero, [['Contato']])}

    <section${secao({classes: 'section', cores: K.cores})}>
      <div class="container split" style="align-items:start">

        <div>
          <div data-reveal>
            ${K.eyebrow ? `<span class="eyebrow">${esc(K.eyebrow)}</span>` : ''}
            <h2>${txt(K.titulo)}</h2>
            ${K.texto ? `<p class="lead">${txt(K.texto)}</p>` : ''}
          </div>

          <div class="contact-details" style="margin-top:30px" data-reveal data-reveal-delay="100">
${contatos(C)}
          </div>
${K.mapa !== false ? mapa(C, 'margin-top:34px') : ''}
        </div>
${formulario(C)}

      </div>
    </section>`,
  });
}

/* ---------------- Legais ---------------- */

export function renderLegal(C, chave, url) {
  const Pg = C.paginas[chave];
  return pagina(C, {
    url,
    titulo: titulo(C, Pg.seo.titulo),
    descricao: Pg.seo.descricao,
    corpo: `${topo(C, Pg.hero, [[Pg.hero.titulo]])}

    <section${secao({classes: 'section', cores: Pg.texto.cores})}>
      <div class="container prose" data-reveal>
${(Pg.texto.secoes || []).filter(s => !vazio(s.titulo) || !vazio(s.texto)).map(s => `        <div>${s.titulo ? `<h2>${esc(s.titulo)}</h2>` : ''}${paragrafos(s.texto).join('')}</div>`).join('\n')}
      </div>
    </section>`,
  });
}

/* ---------------- 404 ---------------- */

export function renderNaoEncontrada(C, url) {
  const N = C.paginas.naoEncontrada;
  return pagina(C, {
    url,
    titulo: `${N.titulo.replace(/[*.]/g, '')} | ${C.geral.marca}`,
    descricao: N.texto,
    robots: 'noindex',
    corpo: `
    <section class="page-hero page-404">
      <div class="container">
        ${N.eyebrow ? `<span class="eyebrow">${esc(N.eyebrow)}</span>` : ''}
        <h1>${txt(N.titulo)}</h1>
        ${N.texto ? `<p>${txt(N.texto)}</p>` : ''}
        <div class="button-row" style="margin-top:30px">
          ${botao(N.botao, 'btn btn-light', {seta: true})}
          <a class="btn btn-ghost" href="/contato/">Falar com a equipe</a>
        </div>
      </div>
    </section>`,
  });
}
