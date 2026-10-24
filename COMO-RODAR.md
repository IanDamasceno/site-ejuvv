# Como abrir o site e o painel da EJUVV no seu computador

O projeto tem duas partes, cada uma no seu repositório:

| Parte | Repositório | O que é |
|---|---|---|
| **Site** | [`IanDamasceno/site-ejuvv`](https://github.com/IanDamasceno/site-ejuvv) (público) | O site em si: páginas, estilos, animações e o conteúdo padrão |
| **Painel (CMS)** | [`IanDamasceno/ejuvv-cms`](https://github.com/IanDamasceno/ejuvv-cms) (privado) | O painel que edita o site inteiro: textos, seções, cores, soluções, projetos, blog, contatos e efeitos |

Nada disso está publicado. No computador, o painel grava numa pasta local e o site lê dessa mesma pasta. Em produção, os dois se ligam pelo mesmo Vercel Blob store (veja o `README.md` do site, seção “Publicar”).

## 1. O que precisa ter instalado

- **Node.js 20 ou mais novo.** Para conferir, abra um terminal e rode `node -v`. Se o comando não existir ou mostrar uma versão menor que 20, instale a versão LTS em https://nodejs.org.
- **Git**, para baixar os repositórios. (Também dá para baixar o zip pelo botão verde “Code” de cada repositório.)

Não precisa rodar `npm install`.

## 2. Baixar as duas partes, uma ao lado da outra

O repositório do painel é privado: peça a quem mantém o projeto para adicionar você como colaborador. Depois, numa mesma pasta, rode:

```
git clone https://github.com/IanDamasceno/site-ejuvv.git
```

```
git clone https://github.com/IanDamasceno/ejuvv-cms.git
```

As duas pastas precisam ficar **lado a lado** (por exemplo, `projetos/site-ejuvv` e `projetos/ejuvv-cms`). É assim que o site local encontra o conteúdo salvo pelo painel. Se você usar outros nomes de pasta, veja “Bom saber”.

## 3. Criar a senha do painel

O painel lê a senha do arquivo `.env.local`, na pasta do painel (`ejuvv-cms`). Esse arquivo **não vem no repositório**: cada pessoa cria o seu, com uma senha só de teste. Nenhum arquivo `.env` (nem o `.env.local`, nem o modelo `.env.example`) vai para o GitHub, e o `.env.local` não deve ser enviado para outras pessoas.

1. Na pasta `ejuvv-cms`, crie um arquivo chamado `.env.local` com estas três linhas (se você recebeu o modelo `.env.example`, pode copiá-lo com esse nome):
   ```
   ADMIN_PASSWORD=
   SESSION_SECRET=
   SITE_URL=https://ejuvv.com
   ```
2. Preencha:
   - `ADMIN_PASSWORD=` a senha de teste que você quiser;
   - `SESSION_SECRET=` um texto aleatório longo (16 caracteres ou mais). Pode ficar vazio no computador: o painel gera um a cada vez que liga (e o login cai quando ele reinicia). Para gerar um, rode no terminal:
     ```
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
     e cole o resultado depois do `=`.
3. Deixe `SITE_URL=https://ejuvv.com` como está. No computador, o painel usa o site local sozinho.

Se o arquivo faltar, o painel abre, mas o login avisa que a senha inicial não foi configurada. Depois de criar ou mudar o `.env.local`, desligue e ligue de novo o painel (passo 4).

## 4. Ligar o site e o painel

Abra **dois terminais** e rode um comando em cada:

- no terminal 1, dentro da pasta **do site** (`site-ejuvv`):
  ```
  node dev-server.js
  ```
- no terminal 2, dentro da pasta **do painel** (`ejuvv-cms`):
  ```
  node dev-server.js
  ```

Cada um mostra uma linha como `Site em http://localhost:4173` e `Painel em http://localhost:4174`. **Deixe os dois terminais abertos** enquanto usa o site e o painel; fechar o terminal desliga o servidor.

## 5. Abrir no navegador

- **Site:** http://localhost:4173
- **Painel:** http://localhost:4174 (entre com a senha do passo 3)

O que você publicar no painel aparece no site local na hora: basta recarregar a página do site.

## Bom saber

- **Abrir os arquivos `.html` direto (clicando duas vezes) não funciona.** As páginas são montadas pelo servidor do passo 4.
- **O conteúdo editado fica no seu computador**, na pasta `.cms-local/` dentro da pasta do painel. Para voltar ao site original, feche os servidores e apague essa pasta. Para mostrar suas alterações a outra pessoa, envie essa pasta junto.
- **Pastas com outros nomes:** o site procura o painel nas pastas irmãs `ejuvv-cms` ou `ejuvv-admin`. Com outro nome, ligue o site informando o caminho, por exemplo `LOCAL_STORE=../meu-painel/.cms-local node dev-server.js` (no PowerShell: `$env:LOCAL_STORE='../meu-painel/.cms-local'; node dev-server.js`).
- **Trocar a senha:** dentro do painel, em Configurações (a nova precisa ter 10 caracteres ou mais). Depois da troca, a senha do `.env.local` deixa de valer e as outras sessões abertas caem. Se esquecer a nova, apague a pasta `.cms-local/cms/acesso` (na pasta do painel) e entre de novo com a do `.env.local`.
- **Porta ocupada** (erro `EADDRINUSE`): já existe um servidor ligado nessa porta, provavelmente em outro terminal. Feche-o ou use o que já está aberto.
- **Os servidores só atendem o próprio computador.** Outras pessoas na mesma rede não conseguem abrir o site nem o painel locais.
- **Nada aqui publica o site.** A publicação na Vercel é um passo separado, descrito no `README.md` do site (seção “Publicar”).

Mais detalhes em `README.md` (site) e no `README.md` do repositório do painel.
