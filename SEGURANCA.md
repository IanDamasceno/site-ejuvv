# Segurança do site

Auditoria de 24/10/2026, a partir do scan do GitGuard (commit `5f3fecf`) e de uma revisão manual completa. As aberturas encontradas foram testadas com ataques reais contra o site local antes e depois da correção. A segurança do painel está no `SEGURANCA.md` do repositório `ejuvv-cms`.

## O que protege o site

- **Sem credenciais**: o site só **lê** o conteúdo publicado. Não guarda senha nem segredo; na Vercel, o único valor é o `BLOB_STORE_ID`, criado pela própria Vercel. Nenhum arquivo `.env` vai para o Git.
- **Texto do painel sempre escapado**: títulos, textos e listas viram HTML só depois do escape; links e botões aceitam apenas `/`, `#`, `https://`, `mailto:` e `tel:`; imagens, só `https://` ou caminhos do site; o mapa, só `https://` do OpenStreetMap ou do Google.
- **Content-Security-Policy** em todas as páginas: só rodam os scripts do próprio site e três pequenos scripts embutidos, liberados pela impressão digital (hash) exata. Mesmo que um texto malicioso escapasse, o navegador não executaria.
- **Cabeçalhos** (`vercel.json`): `X-Frame-Options: DENY` (o site não pode ser embutido por outro), `nosniff`, HSTS, Referrer-Policy e Permissions-Policy.
- **Rascunhos e agendados** não aparecem: nem nas páginas, nem em `/api/blog`, nem no sitemap, nem pelo link direto (404).
- **Redirecionamentos** só para o próprio site: endereços como `//outro-site.com` não viram redirecionamento externo.
- **Prévia de efeitos** (`?efeitos=`): só aceita valores do catálogo; o resto é ignorado.
- **Custo e excesso de acessos**: as páginas ficam em cache na borda, e cada instância guarda o conteúdo por 5 segundos, então muitas visitas seguidas não viram uma leitura do Blob por visita.
- **Dependências**: `npm audit` sem vulnerabilidades. O `zod` (dependência do `@vercel/blob`) é forçado para a versão corrigida em `overrides`, no `package.json`.

## Servidor local (`dev-server.js`)

Só para testes no computador; não vai para a Vercel. **Antes desta auditoria, ele tinha duas aberturas reais**, já corrigidas:

- Com uma barra codificada (`/assets/..%2f.backup%2f…`), entregava o zip do backup e o código das funções. Agora o caminho é decodificado e normalizado antes de qualquer checagem, e `..`, arquivos ocultos e as pastas `api/`, `.backup/`, `.git/` e `node_modules/` nunca são servidos.
- Escutava em todas as redes: qualquer pessoa no mesmo Wi-Fi alcançava o site local. Agora escuta **só no próprio computador** (127.0.0.1 e ::1).

## Triagem do scan do GitGuard

| Alerta | Situação |
|---|---|
| `regex_dos` em `api/_render/blocos.js`, `assets/js/blog/posts.js` e `assets/js/blog/views.js` | **Falso positivo**: expressões simples, com início fixo e sem repetições aninhadas, que rodam em tempo linear. Mesmo assim, a do mapa virou validação pelo endereço completo (`new URL`) e a de `views.js` virou `startsWith` |
| `unknown-value-with-script-tag` em `api/_render/blog.js` | **Falso positivo, reforçado**: é o JSON-LD do artigo (dados para o Google, não executa). O texto já escapava `<`; agora também `>`, `&` e as quebras U+2028/U+2029, e a CSP impede qualquer script não autorizado |
| `node_insecure_random_generator` em `assets/js/motion/particles.js` | **Falso positivo**: `Math.random` só sorteia posição e tamanho das partículas visuais do foguete; não há uso de segurança |

## Recomendado configurar (fora do código)

- **Vercel → projeto do site → Deployment Protection**: deixe **desligado** em produção (o painel precisa ler o site).
- **Vercel → Firewall**: se o site receber acessos abusivos, ative o *Attack Challenge Mode* ou uma regra de *rate limit*.
- **GitHub → Settings → Code security**: ligar *Secret scanning*, *Push protection* e *Dependabot alerts*.
