// GET /api/blog            → textos da página, categorias e artigos visíveis (sem o texto completo)
// GET /api/blog?slug=<...> → um artigo completo e sugestões de leitura (404 se não existir ou não estiver no ar)
// Os artigos são editados no painel (pasta painel/).
import {readDoc, send, PUBLIC_CACHE} from './_store.js';
import {montarIndice, montarPost} from '../assets/js/blog/posts.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(res, 405, {error: 'Método não permitido.'}); }
  try {
    const [pagina, posts] = await Promise.all([readDoc('blog-pagina', 'blog-pagina.json'), readDoc('blog', 'blog.json')]);
    const slug = new URL(req.url, 'http://x').searchParams.get('slug');
    if (!slug) return send(res, 200, montarIndice(pagina, posts), PUBLIC_CACHE);
    const dados = montarPost(pagina, posts, slug);
    return dados ? send(res, 200, dados, PUBLIC_CACHE) : send(res, 404, {error: 'Artigo não encontrado.'}, PUBLIC_CACHE);
  } catch (error) {
    console.error(error);
    return send(res, 500, {error: 'Erro ao carregar o blog.'});
  }
}
