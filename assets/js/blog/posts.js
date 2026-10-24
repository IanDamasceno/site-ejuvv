/**
 * Regras do blog compartilhadas entre a API (api/blog.js) e o navegador
 * (fallback com os arquivos de data/ quando a API não responde).
 *
 * Um artigo aparece no site quando está publicado e a data dele já chegou
 * (horário de Brasília) — assim dá para deixar artigos agendados no painel.
 */

const DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Data de hoje em Brasília, no formato AAAA-MM-DD. */
export const hojeSP = (agora = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora);

/** Minutos de leitura, a ~200 palavras por minuto. */
export const tempoLeitura = (texto = '') => {
  const palavras = String(texto)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_\-[\]()`]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
};

export const visivel = (p, hoje = hojeSP()) =>
  p && p.publicado !== false && DATA.test(p.data || '') && p.data <= hoje;

/** Mais recentes primeiro; no mesmo dia, o cadastrado por último vem antes. */
export const ordenar = (posts) =>
  [...posts].sort(
    (a, b) =>
      String(b.data).localeCompare(String(a.data)) ||
      String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''))
  );

/** Versão do artigo para listas: sem o texto completo, com o tempo de leitura. */
export const cartao = (p) => {
  const { conteudo, ...resto } = p;
  return { ...resto, leitura: tempoLeitura(conteudo) };
};

const publicaveis = (postsDoc, hoje) => ordenar((postsDoc?.posts || []).filter((p) => visivel(p, hoje)));

const baseDaPagina = (paginaDoc) => ({
  pagina: paginaDoc?.pagina || {},
  categorias: paginaDoc?.categorias || [],
  seo: paginaDoc?.seo || {},
});

/** Dados da página /blog/: textos, categorias e artigos visíveis. */
export function montarIndice(paginaDoc, postsDoc, hoje = hojeSP()) {
  return { ...baseDaPagina(paginaDoc), posts: publicaveis(postsDoc, hoje).map(cartao) };
}

/** Dados de /blog/<slug>/: o artigo completo e até 3 sugestões de leitura. */
export function montarPost(paginaDoc, postsDoc, slug, hoje = hojeSP()) {
  const lista = publicaveis(postsDoc, hoje);
  const post = lista.find((p) => p.slug === slug);
  if (!post) return null;
  const outros = lista.filter((p) => p.slug !== slug);
  const relacionados = [
    ...outros.filter((p) => post.categoria && p.categoria === post.categoria),
    ...outros.filter((p) => !post.categoria || p.categoria !== post.categoria),
  ]
    .slice(0, 3)
    .map(cartao);
  return { ...baseDaPagina(paginaDoc), post: { ...post, leitura: tempoLeitura(post.conteudo) }, relacionados };
}
