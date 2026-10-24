/**
 * Formatação dos artigos do blog. O painel grava texto simples e este módulo
 * transforma em HTML, sempre escapando o que foi digitado:
 *
 *   ## Título            ### Subtítulo         > citação
 *   - item de lista      1. item numerado      ---  (linha divisória)
 *   ![legenda](url)      imagem com legenda, sozinha na linha
 *   **negrito**  *itálico*  [texto](https://...)
 *
 * Linha em branco separa parágrafos; Enter dentro do parágrafo quebra a linha.
 * Links só com /, #, https://, mailto: e tel:. Imagens só com / ou https://.
 *
 * O painel (repositório ejuvv-cms) usa uma cópia deste arquivo, markup.js, para a
 * pré-visualização. Se mudar este arquivo, copie para lá.
 */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const linkSeguro = (url) => {
  const u = String(url || '').trim();
  return /^(\/(?!\/)|#|https:\/\/|mailto:|tel:)[^\s"'<>]*$/i.test(u) ? u : '';
};

export const imagemSegura = (url) => {
  const u = String(url || '').trim();
  return /^(\/(?!\/)|https:\/\/|http:\/\/localhost(:\d+)?\/)[^\s"'<>]*$/i.test(u) ? u : '';
};

const externo = (u) => /^https:\/\//i.test(u) && !/^https:\/\/(www\.)?ejuvv\.com(\/|$)/i.test(u);

/** Negrito e itálico sobre texto já escapado. */
const enfase = (s) =>
  s
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?=\S)([^*]*?\S)\*(?!\*)/g, '$1<em>$2</em>');

/** Texto de uma linha: links, negrito e itálico. */
export function inline(texto) {
  const partes = String(texto ?? '').split(/(\[[^\]\n]+\]\([^)\s]+\))/g);
  return partes
    .map((parte) => {
      const link = parte.match(/^\[([^\]\n]+)\]\(([^)\s]+)\)$/);
      if (!link) return enfase(esc(parte));
      const href = linkSeguro(link[2]);
      const rotulo = enfase(esc(link[1]));
      if (!href) return rotulo;
      const alvo = externo(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${esc(href)}"${alvo}>${rotulo}</a>`;
    })
    .join('');
}

const IMAGEM = /^!\[([^\]\n]*)\]\(([^)\s]+)\)$/;
const LISTA = /^[-*]\s+/;
const NUMERO = /^\d+[.)]\s+/;

/** Artigo completo → HTML. */
export function artigo(texto) {
  const linhas = String(texto ?? '').replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  let paragrafo = [];

  const fecharParagrafo = () => {
    if (paragrafo.length) html.push(`<p>${paragrafo.map(inline).join('<br>')}</p>`);
    paragrafo = [];
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();

    if (!linha) { fecharParagrafo(); continue; }

    const titulo = linha.match(/^(#{2,3})\s+(.+)$/);
    if (titulo) {
      fecharParagrafo();
      const n = titulo[1].length;
      html.push(`<h${n}>${inline(titulo[2])}</h${n}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(linha)) { fecharParagrafo(); html.push('<hr>'); continue; }

    const img = linha.match(IMAGEM);
    if (img) {
      fecharParagrafo();
      const src = imagemSegura(img[2]);
      if (src) {
        const legenda = img[1].trim();
        html.push(`<figure><img src="${esc(src)}" alt="${esc(legenda)}" loading="lazy" decoding="async">${legenda ? `<figcaption>${inline(legenda)}</figcaption>` : ''}</figure>`);
      }
      continue;
    }

    if (linha.startsWith('>')) {
      fecharParagrafo();
      const citacao = [];
      while (i < linhas.length && linhas[i].trim().startsWith('>')) {
        citacao.push(linhas[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      i--;
      html.push(`<blockquote><p>${citacao.map(inline).join('<br>')}</p></blockquote>`);
      continue;
    }

    const tipoLista = LISTA.test(linha) ? 'ul' : NUMERO.test(linha) ? 'ol' : '';
    if (tipoLista) {
      fecharParagrafo();
      const marcador = tipoLista === 'ul' ? LISTA : NUMERO;
      const itens = [];
      while (i < linhas.length && marcador.test(linhas[i].trim())) {
        itens.push(`<li>${inline(linhas[i].trim().replace(marcador, ''))}</li>`);
        i++;
      }
      i--;
      html.push(`<${tipoLista}>${itens.join('')}</${tipoLista}>`);
      continue;
    }

    paragrafo.push(linha);
  }
  fecharParagrafo();
  return html.join('\n');
}

/** Texto sem marcações, para resumos e descrições. */
export const textoPuro = (texto) =>
  String(texto ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{2,3}\s+|^>\s?|^[-*]\s+|^\d+[.)]\s+/gm, '')
    .replace(/\*\*?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
