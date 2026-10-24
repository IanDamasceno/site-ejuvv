# EJUVV — site institucional

HTML, CSS e JavaScript puros, sem framework e sem etapa de build. Todo o
conteúdo (textos, imagens, seções, cores, soluções, projetos, blog, contatos,
SEO e efeitos) é editado no **painel** (CMS), que fica num repositório e num
projeto Vercel próprios, e aparece no site em poucos segundos, sem novo deploy.

| Parte | Repositório | Projeto Vercel |
|---|---|---|
| Site (este) | `IanDamasceno/site-ejuvv` | projeto do site |
| Painel (CMS) | `IanDamasceno/ejuvv-cms` (privado) | projeto do painel |

O **vínculo** entre os dois na Vercel é o mesmo **Blob store** conectado aos dois
projetos: o painel grava, o site lê. O painel também conhece o endereço do site
pela variável `SITE_URL`.

As páginas são montadas no servidor por uma função da Vercel (`api/render.js`)
a partir do conteúdo publicado. Sem nada publicado, ela usa o conteúdo padrão de
`data/`, que reproduz exatamente o site como era antes do painel.

## Rodar localmente

```bash
node dev-server.js
```

Depois abra <http://localhost:4173>. O servidor local reproduz a Vercel: arquivos
estáticos primeiro, depois as funções de `api/` e, para todo o resto, as páginas
montadas por `api/render.js`. Não precisa de `npm install`.

Para editar o conteúdo localmente, baixe o repositório do painel **numa pasta ao
lado desta** e rode o painel também (passo a passo em [COMO-RODAR.md](COMO-RODAR.md)).
O site local lê a pasta `.cms-local/` do painel (procura as pastas irmãs
`ejuvv-cms` e `ejuvv-admin`; com outro nome, use a variável `LOCAL_STORE`), então
o que você publica no painel aparece no site local na hora. Para voltar ao
conteúdo original, apague essa pasta.

## Estrutura

```
api/render.js               todas as páginas (rewrite do vercel.json)
api/_render/                montagem das páginas: esqueleto, home, internas, blog, blocos
api/sitemap.js              /sitemap.xml, com páginas, soluções, projetos e artigos
api/blog.js                 dados da lista do blog (/api/blog)
api/_store.js               leitura do Blob compartilhado com o painel
data/                       conteúdo padrão: conteudo.json, projetos.json, blog*.json
assets/css/                 base · layout · components · motion · blog · cms
assets/js/motion/           env · reveal · counter · rocket · assembly · efeitos
assets/js/ui/               header · accordion · form · galeria · projetos
assets/js/pages/            home.js (com foguete) · inner.js (sem) · blog.js
assets/js/blog/             regras, formatação e marcação do blog (navegador e servidor)
assets/js/vendor/           anime.js v4 (MIT)
dev-server.js               servidor local (não vai para a Vercel)
.backup/                    cópia do site antes do painel (fora do deploy e do Git)
```

## Como o conteúdo chega ao site

- O painel grava versões em um **Vercel Blob store** compartilhado com o site:
  `cms/conteudo/` (textos, seções, soluções, contatos, SEO e efeitos),
  `cms/projetos/`, `cms/blog/` e `cms/blog-pagina/`. O site lê sempre a versão
  mais recente. As páginas ficam 10 segundos em cache na borda.
- O conteúdo publicado é mesclado sobre o padrão de `data/conteudo.json`: um
  campo novo no código sempre tem valor, mesmo em versões publicadas antes dele.
- Todo texto do painel é escapado. Nos textos, `*palavra*` sai em itálico de
  destaque, `**palavra**` em negrito, Enter quebra a linha e, nos textos longos,
  uma linha em branco separa parágrafos. Links e botões só aceitam `/`, `#`,
  `https://`, `mailto:` e `tel:`.
- **Cores por seção**: cada seção pode ter fundo, títulos, destaques, textos,
  rótulos e botões próprios (`data-c-*` e `--k-*`, regras em
  `assets/css/cms.css`). Com um fundo escolhido, a seção passa a ser clara ou
  escura conforme a cor, e o foguete acompanha (`data-tone`).
- **Seções da home** podem ser escondidas; a ordem é fixa porque a trajetória do
  foguete foi desenhada para ela.
- **Soluções** viram cards, opções do formulário e páginas em
  `/solucoes/<endereço>/`. **Projetos** têm capa, sites, galeria com lightbox,
  destaque na home e filtro por categoria em `/projetos/`.
- **Contatos**: o WhatsApp ganha o 55 sozinho quando vem só com DDD. Sem número,
  os botões de WhatsApp somem e o formulário avisa; campos vazios aparecem como
  “A confirmar”.

## Efeitos

As animações têm opções escolhidas na aba **Efeitos** do painel. O catálogo fica
em `assets/js/motion/efeitos.js` (com uma cópia idêntica, `efeitos.js`, no
repositório do painel, usada nas prévias: **se mudar um, copie para o outro**). A opção padrão de cada
efeito é exatamente o comportamento original do site.

O servidor escreve os efeitos publicados em `<html data-efeitos="…">` e em
`data-fx-cards`, `data-fx-logos` e `data-fx-marca` (usados pelo CSS). Uma
prévia aberta pelo painel passa as escolhas em `?efeitos=…` no endereço: vale só
para quem abriu o link e mostra o aviso “Prévia de efeitos”. Com
`prefers-reduced-motion: reduce`, o site continua sem movimento, como antes.

## Blog

| Endereço | O que é |
|---|---|
| `/blog/` | lista: artigo em destaque, filtro por categoria, busca e "carregar mais" |
| `/blog/<artigo>/` | o artigo, já renderizado no servidor, com título, descrição, imagem e JSON-LD próprios |
| `/api/blog` | dados da lista; `/api/blog?slug=<artigo>` traz um artigo completo |

Um artigo só aparece quando está **publicado** e a **data dele já chegou**
(horário de Brasília); datas futuras funcionam como agendamento. A formatação
do texto (`## título`, `**negrito**`, listas, citações, links e imagens) é
convertida por `assets/js/blog/markup.js` (cópia idêntica, `markup.js`, no
repositório do painel).

## Publicar

Nada aqui foi publicado. Quando for colocar no ar:

1. **Site** — importe o repositório `site-ejuvv` num projeto Vercel (Framework
   Preset **Other**, sem comando de build, Root Directory na raiz). Ele usa
   `api/`, `data/`, `vercel.json` e o `package.json` (para instalar o
   `@vercel/blob`). O `.vercelignore` deixa de fora `.backup/` e o
   `dev-server.js`. O site precisa da Vercel (ou de outra hospedagem com funções
   serverless): as páginas são montadas pela função `api/render.js`. Não ligue a
   proteção de acesso neste projeto: o painel precisa ler o site.
2. **Painel** — importe o repositório `ejuvv-cms` num **segundo projeto** Vercel.
   Cadastre as variáveis `ADMIN_PASSWORD` e `SESSION_SECRET` com valores novos,
   só de produção, e `SITE_URL` com o endereço do projeto do site (o
   `https://….vercel.app` dele, ou `https://ejuvv.com` quando o domínio já
   apontar para esta versão). Nenhum arquivo `.env` vai para o Git; para testar
   no computador, cada pessoa cria o seu (veja [COMO-RODAR.md](COMO-RODAR.md)).
3. **Vínculo (Blob)** — na Vercel, em Storage, crie um Blob store **público** e
   conecte-o aos **dois** projetos (Storage → Connect Project; a Vercel cria a
   variável `BLOB_STORE_ID` em cada um). Faça um novo deploy dos dois. Sem o
   Blob, o site funciona com o conteúdo padrão de `data/`, mas o painel não
   consegue salvar.
4. Depois do deploy, confira as rotas de produção (`/`, cada página, uma
   solução, um projeto, `/blog/`, `/sitemap.xml` e um endereço inexistente, que
   deve mostrar a página 404).

## A narrativa do foguete

O sistema de movimento está documentado em detalhe em
[MOTION_SYSTEM.md](MOTION_SYSTEM.md) — física, estados do foguete, partículas,
parâmetros de ajuste e o contrato de quem pode escrever cada transform. Leia
antes de mexer em qualquer coisa em `assets/js/motion/`.

Em resumo: uma camada de página inteira (`#rocket-layer`) contém a trajetória e
o foguete. A trajetória é regenerada em JavaScript sobre um viewBox 1:1 em
pixels, a partir dos atributos declarados nas seções:

```html
<section data-tone="dark" data-rocket-x="0.94">
```

- `data-rocket-x` — posição horizontal (0 = esquerda, 1 = direita) no centro da seção
- `data-tone` — `dark` ou `light`; define as cores do foguete quando ele passa ali
- `data-rocket-anchor` — opcional, `start` ou `end`, desloca o ponto na vertical

Os beats viram uma spline de Catmull-Rom com continuidade C¹. O scroll define
apenas um alvo; a posição real é integrada por uma mola amortecida, de modo que
o foguete acelera, carrega momentum e ultrapassa levemente numa parada brusca.
Ao mudar o tamanho da janela, a trajetória é reconstruída a partir da geometria
real.

Em telas estreitas as frações são comprimidas contra a borda mais próxima, e com
`prefers-reduced-motion: reduce` a camada inteira é desligada.

## A montagem por fragmentos

No meio da home existe uma segunda cena, independente do foguete que voa: a
seção `#assembly`. Ela tem 300vh de altura só para servir de curso de scroll, e
dentro dela um palco `sticky` de 100vh com um `<canvas>`.

O scroll da seção vira um único progresso normalizado de 0 a 1, e esse número
controla tudo — não há timer nem sequência tocando sozinha, então rolar para
cima desfaz exatamente o que rolar para baixo fez:

```
0.00 → 0.35   centenas de fragmentos convergem e formam o foguete
0.35 → 0.60   foguete formado, com micro-oscilação e respiração
0.60 → 1.00   as peças se soltam e voltam a se dispersar
```

A silhueta não é uma imagem: cada parte do foguete é rasterizada fora da tela e
os fragmentos nascem dos pixels dela, densos no contorno e esparsos no miolo.
Cada peça tem atraso, duração, curva e rotação próprios — mesmo progresso, mas
chegadas diferentes. Ajustar a forma é editar os paths em
`assets/js/motion/rocket-shape.js`; ajustar o comportamento é
`assets/js/motion/assembly.js`. Os detalhes estão em
[MOTION_SYSTEM.md](MOTION_SYSTEM.md#9-montagem-por-fragmentos).

Para inspecionar o movimento, abra a home com `?debug=motion`.

## Formulário de contato

Não há backend para mensagens. O formulário valida nativamente, monta uma
mensagem estruturada e abre o WhatsApp comercial informado em Configurações no
painel (`data-whatsapp` no `<form>`). O campo `website` é um honeypot — se vier
preenchido, o envio é abortado.

## Conteúdo disponível

A área de projetos mostra apenas trabalhos publicados e autorizados. Como ainda
não há uma fotografia oficial da equipe no repositório, o espaço institucional
exibe texto em vez de uma instrução de placeholder. Não existem depoimentos;
inclua novos cases, imagens e relatos somente com material real e autorizado.
