// Carrega tudo o que as páginas precisam: conteúdo do site, projetos e blog.
// O conteúdo publicado é mesclado sobre o padrão de data/, para que campos novos
// tenham valor mesmo em versões publicadas antes de existirem.
import {readDoc, readSeed} from '../_store.js';
import {mesclar} from './fmt.js';

export async function carregar() {
  const [conteudo, projetos, blogPagina, blog] = await Promise.all([
    readDoc('conteudo', 'conteudo.json'),
    readDoc('projetos', 'projetos.json'),
    readDoc('blog-pagina', 'blog-pagina.json'),
    readDoc('blog', 'blog.json'),
  ]);
  return {
    C: mesclar(readSeed('conteudo.json'), conteudo),
    P: projetos,
    G: blogPagina,
    B: blog,
  };
}
