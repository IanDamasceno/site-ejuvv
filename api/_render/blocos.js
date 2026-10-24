// Blocos usados em mais de uma página.
import {esc, icon, txt, pad, destino, alvo, numeroWhatsapp, telefoneTexto, A_CONFIRMAR, imagemSegura, botao} from './fmt.js';

const TONS = ['#eee8f7', '#f2e7ee', '#e8ebf8'];

export const servicosPublicados = C => (C.servicos || []).filter(s => s.publicado !== false && s.slug && s.titulo);

export function cardServico(s, i, {rotuloProblema, linkDetalhe, linkContato}) {
  return `
          <article class="service-card" data-reveal="stagger" data-reveal-group="svc" style="--tone:${TONS[i % 3]}">
            <span class="card-num">${pad(i + 1)}</span>
            <div class="service-icon">${icon(s.icone || 'i-panels')}</div>
            ${s.problema ? `<p class="service-problem"><small>${esc(rotuloProblema)}</small><strong>${txt(s.problema)}</strong></p>` : ''}
            <h3>${esc(s.titulo)}</h3>
            ${s.descricao ? `<p>${txt(s.descricao)}</p>` : ''}
            <div class="service-actions">
              ${linkDetalhe ? `<a class="text-link" href="/solucoes/${esc(s.slug)}/">${esc(linkDetalhe)} ${icon('i-arrow-right')}</a>` : ''}
              ${linkContato ? `<a class="text-link" href="/contato/?servico=${esc(s.slug)}">${esc(linkContato)}</a>` : ''}
            </div>
          </article>`;
}

/* ---------------- projetos ---------------- */

export const projetosPublicados = P => (P?.projetos || []).filter(p => p.publicado !== false && p.slug && p.titulo);

function visualProjeto(p) {
  const sites = (p.sites || []).filter(s => imagemSegura(s.imagem));
  const href = `/projetos/${esc(p.slug)}/`;
  const rotulo = `aria-label="Ver projeto: ${esc(p.titulo)}"`;
  if (sites.length) {
    return `<a class="project-visual project-visual-sites" href="${href}" ${rotulo}>
              ${sites.slice(0, 3).map(s => `<img src="${esc(imagemSegura(s.imagem))}" alt="Home do site ${esc(s.nome)}">`).join('\n              ')}
              ${p.selo ? `<span>${esc(p.selo)}</span>` : ''}
            </a>`;
  }
  const capa = imagemSegura(p.capa) || imagemSegura(p.galeria?.[0]?.imagem);
  return `<a class="project-visual${capa ? ' project-visual-link' : ''}" href="${href}" ${rotulo}>
              ${capa ? `<img src="${esc(capa)}" alt="${esc(p.capaAlt || '')}" loading="lazy">` : ''}
              ${p.selo ? `<span>${esc(p.selo)}</span>` : ''}
            </a>`;
}

export function cardsProjetos(lista, linkProjeto, {filtro = false, naHome = false} = {}) {
  return lista.map(p => `          <article class="project-card" data-reveal="stagger" data-reveal-group="proj"${filtro ? ` data-projeto data-categoria="${esc(slugCategoria(p.categoria))}" data-busca="${esc([p.titulo, p.categoria, p.desafio].join(' '))}"` : ''}>
            ${visualProjeto(p)}
            <div class="project-body">
              ${p.categoria ? `<small>${esc(p.categoria)}</small>` : ''}
              <h3>${esc(p.titulo)}</h3>
              ${(naHome && p.resumoHome) || p.desafio ? `<p>${txt((naHome && p.resumoHome) || p.desafio)}</p>` : ''}
              ${linkProjeto ? `<a class="text-link" href="/projetos/${esc(p.slug)}/">${esc(linkProjeto)} ${icon('i-arrow-right')}</a>` : ''}
            </div>
          </article>`).join('\n');
}

export const slugCategoria = v => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---------------- listas ---------------- */

export const timeline = passos => `
        <div class="timeline">
          <div class="timeline-progress"></div>
${(passos || []).filter(Boolean).map((s, i) => `          <div class="t-step"><span>${pad(i + 1)}</span><p>${txt(s)}</p></div>`).join('\n')}
        </div>`;

export function faq(itens, prefixo, {primeiraAberta = false} = {}) {
  const lista = (itens || []).filter(i => String(i.p || '').trim());
  return lista.map((item, i) => {
    const n = i + 1;
    const aberta = primeiraAberta && i === 0;
    return `            <div class="faq-item${aberta ? ' is-open' : ''}">
              <button class="faq-q" type="button" aria-expanded="${aberta}" aria-controls="${prefixo}a${n}" id="${prefixo}q${n}">${esc(item.p)}<span class="faq-icon" aria-hidden="true"></span></button>
              <div class="faq-a" id="${prefixo}a${n}" role="region" aria-labelledby="${prefixo}q${n}"><div><p>${txt(item.r)}</p></div></div>
            </div>`;
  }).join('\n');
}

/* ---------------- contato ---------------- */

export function contatos(C) {
  const G = C.geral;
  const wa = numeroWhatsapp(G.whatsapp);
  const linha = (ic, rot, valor) => `            <div class="contact-row">${icon(ic)}<div><small>${rot}</small>${valor}</div></div>`;
  const ou = v => v ? null : `<span>${A_CONFIRMAR}</span>`;
  const ig = destino(G.instagramUrl) || (G.instagram ? `https://instagram.com/${String(G.instagram).replace(/^@/, '')}` : '');
  return [
    linha('i-mail', 'E-mail', ou(G.email) || `<a href="mailto:${esc(G.email)}">${esc(G.email)}</a>`),
    linha('i-message-circle', 'WhatsApp', ou(wa) || `<a href="https://wa.me/${wa}" target="_blank" rel="noreferrer">${esc(telefoneTexto(G.whatsapp))}</a>`),
    linha('i-map-pin', 'Localização', `<span>${esc(G.endereco || A_CONFIRMAR)}</span>`),
    linha('i-clock', 'Atendimento', `<span>${esc(G.horario || A_CONFIRMAR)}</span>`),
    linha('i-instagram', 'Redes sociais', ou(ig) || `<a href="${esc(ig)}" target="_blank" rel="noreferrer">${esc(G.instagram || ig.replace(/^https:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, ''))}</a>`),
  ].join('\n');
}

const HOSTS_MAPA = new Set(['openstreetmap.org', 'www.openstreetmap.org', 'google.com', 'www.google.com', 'maps.google.com']);
const mapaPermitido = v => {
  try { const u = new URL(String(v || '')); return u.protocol === 'https:' && HOSTS_MAPA.has(u.hostname); } catch { return false; }
};

export function mapa(C, estilo) {
  const M = C.geral.mapa || {};
  const embed = mapaPermitido(M.embed) ? M.embed : '';
  if (!embed) return '';
  const link = destino(M.link);
  return `
          <div class="map-frame" id="map-frame" style="${estilo}" data-reveal>
            <iframe title="${esc(M.descricao || 'Mapa')}" tabindex="-1" loading="lazy"
              src="${esc(embed)}"></iframe>
            ${link ? `<a class="map-card" target="_blank" rel="noreferrer"
               aria-label="${esc(M.rotulo || `Abrir no mapa: ${M.titulo || ''}`)}"
               href="${esc(link)}">
              ${icon('i-map-pin')}
              <span><strong>${esc(M.titulo || '')}</strong><small>${esc(M.subtitulo || '')}</small></span>
            </a>` : ''}
          </div>`;
}

/** Formulário de orçamento (abre o WhatsApp com a mensagem montada). */
export function formulario(C, {comContatos = false} = {}) {
  const F = C.formulario;
  const wa = numeroWhatsapp(C.geral.whatsapp);
  const servicos = servicosPublicados(C);
  return `
        <div class="form-card" data-reveal data-reveal-delay="140">
          <span class="eyebrow">${esc(F.eyebrow)}</span>
          <h3 style="margin-bottom:24px">${txt(F.titulo)}</h3>

          <form id="contact-form" novalidate data-whatsapp="${wa}">
            <div class="field-grid">
              <div class="field"><label for="f-name">Nome completo</label><input id="f-name" name="name" autocomplete="name" placeholder="Como podemos chamar você?" required></div>
              <div class="field"><label for="f-company">Empresa</label><input id="f-company" name="company" autocomplete="organization" placeholder="Nome da empresa" required></div>
              <div class="field"><label for="f-email">E-mail</label><input id="f-email" type="email" name="email" autocomplete="email" placeholder="voce@empresa.com" required></div>
              <div class="field"><label for="f-phone">WhatsApp</label><input id="f-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="(27) 99999-9999" required></div>
              <div class="field"><label for="f-service">Serviço de interesse</label><select id="f-service" name="service" required><option value="" disabled selected>Selecione uma solução</option>${servicos.map(s => `<option value="${esc(s.slug)}">${esc(s.titulo)}</option>`).join('')}</select></div>
              <div class="field"><label for="f-size">Porte do negócio</label><select id="f-size" name="size" required><option value="" disabled selected>Selecione uma opção</option>${(F.portes || []).filter(Boolean).map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></div>
              <div class="field full"><label for="f-message">O que você precisa?</label><textarea id="f-message" name="message" rows="5" placeholder="Descreva o projeto, o problema atual e o resultado esperado." required></textarea></div>
            </div>

            <input class="honeypot" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">

            <label class="consent">
              <input type="checkbox" name="consent" required>
              <span>Concordo com o tratamento dos meus dados para retorno deste contato, conforme a <a href="/politica-de-privacidade/">Política de Privacidade</a>.</span>
            </label>

            <button class="btn btn-primary" type="submit" data-magnetic style="width:100%;justify-content:center"${wa ? '' : ' disabled'}>${esc(F.botao)} ${icon('i-arrow-right')}</button>
            ${wa ? '' : `<p class="form-aviso">O WhatsApp da equipe ainda não foi informado. Enquanto isso, fale com a gente${C.geral.email ? ` pelo e-mail <a class="text-link" href="mailto:${esc(C.geral.email)}">${esc(C.geral.email)}</a>` : ' pelos canais ao lado'}.</p>`}
          </form>

          <div class="form-success" id="form-success" hidden>
            <span class="tick" aria-hidden="true">✓</span>
            <h3 tabindex="-1">${esc(F.sucessoTitulo)}</h3>
            <p>${esc(F.sucessoTexto)}${wa ? ` <a class="text-link" href="https://wa.me/${wa}" target="_blank" rel="noreferrer">${esc(telefoneTexto(C.geral.whatsapp))}</a>` : ''}.</p>
            <button class="btn btn-outline" type="button" id="form-reset">${esc(F.sucessoBotao)}</button>
          </div>
${comContatos ? `
          <div class="contact-details" style="margin-top:34px">
${contatos(C)}
          </div>` : ''}
        </div>`;
}

/** Chamada final (banda centralizada com botão). */
export function chamada(ch = {}, {magnetico = true, classeBotao = 'btn btn-primary'} = {}) {
  return `<div class="container cta-band" data-reveal>
        ${ch.eyebrow ? `<span class="eyebrow">${esc(ch.eyebrow)}</span>` : ''}
        <h2>${txt(ch.titulo)}</h2>
        ${ch.texto ? `<p class="lead">${txt(ch.texto)}</p>` : ''}
        ${botao(ch.botao, classeBotao, {seta: true, magnetico})}
      </div>`;
}

export {destino, alvo};
