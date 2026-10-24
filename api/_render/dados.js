// Carrega tudo o que as páginas precisam: conteúdo do site, projetos e blog.
// O conteúdo publicado é mesclado sobre o padrão de data/, para que campos novos
// tenham valor mesmo em versões publicadas antes de existirem.
import {readDoc, readSeed} from '../_store.js';
import {mesclar} from './fmt.js';

// Cache curto por instância: muitas visitas seguidas (ou alguém trocando o endereço para
// fugir do cache da borda) não viram uma leitura do Blob por visita.
let cache = {ate: 0, dados: null};

export async function carregar() {
  if (cache.dados && cache.ate > Date.now()) return cache.dados;
  const dados = await ler();
  cache = {ate: Date.now() + 5000, dados};
  return dados;
}

async function ler() {
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
