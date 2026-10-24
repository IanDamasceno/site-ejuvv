// Utilitários do renderizador: escape, formatação dos textos do painel, links, cores e contatos.
// Todo texto que vem do painel passa por aqui antes de virar HTML.
import {esc, inline, linkSeguro, imagemSegura} from '../../assets/js/blog/markup.js';

export {esc, imagemSegura};

export const icon = (name, attrs = '') =>
  `<svg aria-hidden="true"${attrs ? ' ' + attrs : ''}><use href="/assets/img/icons.svg#${name}"/></svg>`;

export const pad = n => String(n).padStart(2, '0');

/**
 * Texto curto (títulos, linhas, botões): *itálico de destaque*, **negrito**,
 * [link](endereço) e Enter vira quebra de linha.
 */
export const txt = v =>
  String(v ?? '').replace(/\r\n?/g, '\n').trim().split('\n').map(l => inline(l.trim())).join('<br>')
    .replace(/<a href=/g, '<a class="text-link" href=');

/** Texto longo: linha em branco separa parágrafos. */
export const paragrafos = (v, attrs = '') =>
  String(v ?? '').replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/).filter(Boolean)
    .map(p => `<p${attrs}>${txt(p)}</p>`);

/** Destino de link ou botão: só /, #, https://, mailto: e tel:. */
export const destino = v => linkSeguro(v) || '';

const externo = u => /^https:\/\//i.test(u) && !/^https:\/\/(www\.)?ejuvv\.com(\/|$)/i.test(u);
/** Atributos extras para links que saem do site. */
export const alvo = (u, rel = 'noreferrer') => externo(u) ? ` target="_blank" rel="${rel}"` : '';

/* ---------------- contatos ---------------- */

/** Número para o wa.me: só dígitos e com 55 quando vier apenas com DDD. */
export function numeroWhatsapp(v) {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  return d.length >= 12 ? d : '';
}

/** (27) 99311-7132 a partir do número salvo no painel. */
export function telefoneTexto(v) {
  const d = numeroWhatsapp(v).replace(/^55/, '');
  if (!d) return '';
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

export const A_CONFIRMAR = 'A confirmar';

/* ---------------- cores por seção ---------------- */

const HEX = /^#[0-9a-f]{6}$/i;
const CHAVES = {fundo: 'fundo', titulo: 'titulo', destaque: 'destaque', texto: 'texto', apoio: 'apoio', botao: 'botao', botaoTexto: 'botao-texto'};

function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Atributos de uma seção com as cores escolhidas no painel.
 * classes: classes originais; tom: data-tone original ('dark' | 'light' | '');
 * estilo: style original. Com fundo personalizado, o tom e a classe on-dark
 * passam a seguir a cor escolhida (o foguete e os textos acompanham).
 */
export function secao({classes = '', tom = '', estilo = '', cores = {}, extra = ''} = {}) {
  const c = cores && typeof cores === 'object' ? cores : {};
  const usadas = Object.keys(CHAVES).filter(k => HEX.test(c[k] || ''));
  let lista = classes.split(/\s+/).filter(Boolean);
  let t = tom;
  if (usadas.includes('fundo')) {
    const escuro = luminancia(c.fundo) < 0.36;
    t = tom ? (escuro ? 'dark' : 'light') : '';
    lista = lista.filter(x => x !== 'on-dark' && x !== 'soft');
    if (escuro && classes.split(/\s+/).includes('section')) lista.push('on-dark');
  }
  const vars = usadas.map(k => `--k-${CHAVES[k]}:${c[k].toLowerCase()}`).join(';');
  const style = [estilo, vars].filter(Boolean).join(';');
  const dados = usadas.map(k => ` data-c-${CHAVES[k]}`).join('');
  return `${lista.length ? ` class="${lista.join(' ')}"` : ''}${t ? ` data-tone="${t}"` : ''}${extra}${dados}${style ? ` style="${esc(style)}"` : ''}`;
}

/* ---------------- conteúdo ---------------- */

/** Junta o publicado com o padrão, para campos novos sempre terem valor. */
export function mesclar(padrao, publicado) {
  if (Array.isArray(padrao)) return Array.isArray(publicado) ? publicado : padrao;
  if (padrao && typeof padrao === 'object') {
    const out = {...padrao};
    if (publicado && typeof publicado === 'object' && !Array.isArray(publicado)) {
      for (const [k, v] of Object.entries(publicado)) out[k] = k in padrao ? mesclar(padrao[k], v) : v;
    }
    return out;
  }
  return publicado === undefined || publicado === null ? padrao : publicado;
}

/** Botão ou link {texto, destino} → HTML, ou '' se faltar texto ou destino. */
export function botao(b, classe, {seta = false, magnetico = false, extra = ''} = {}) {
  const href = destino(b?.destino);
  const texto = String(b?.texto ?? '').trim();
  if (!href || !texto) return '';
  return `<a class="${classe}" href="${esc(href)}"${alvo(href)}${magnetico ? ' data-magnetic' : ''}${extra}>${txt(texto)}${seta ? ` ${icon('i-arrow-right')}` : ''}</a>`;
}
