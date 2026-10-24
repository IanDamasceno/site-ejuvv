/**
 * Catálogo dos efeitos editáveis no painel (aba Efeitos).
 *
 * Cada efeito tem a opção ATUAL como padrão: sem nada publicado, o site se
 * move exatamente como antes. As alternativas seguem a mesma linguagem —
 * movimentos curtos, com desaceleração suave e nada que salte.
 *
 * Usado pelo site (motion/*.js lê a configuração escolhida), pelo servidor
 * (valida o que o painel publica) e pelo painel (cópia em efeitos.js no
 * repositório ejuvv-cms, para as prévias). Se mudar este arquivo, copie para lá.
 */

export const EFEITOS = [
  {
    chave: 'entrada',
    rotulo: 'Entrada de textos e imagens',
    descricao: 'Como títulos, parágrafos e imagens surgem quando chegam na tela.',
    padrao: 'aparecer',
    opcoes: [
      ['aparecer', 'Aparecer', 'Ganham opacidade aos poucos, sem se mover.'],
      ['subir', 'Subir suave', 'Sobem alguns pixels enquanto aparecem.'],
      ['deslizar', 'Deslizar', 'Entram pela esquerda, na direção da leitura.'],
      ['aproximar', 'Aproximar', 'Crescem levemente até o tamanho final.'],
      ['foco', 'Entrar em foco', 'Saem de um desfoque, como uma lente ajustando.'],
      ['nenhum', 'Sem animação', 'Já aparecem prontos.'],
    ],
  },
  {
    chave: 'cascata',
    rotulo: 'Entrada de cards e listas',
    descricao: 'Cards de soluções, projetos, valores, benefícios e artigos entram um depois do outro.',
    padrao: 'subir',
    opcoes: [
      ['subir', 'Subir em cascata', 'Cada card sobe um pouco depois do anterior.'],
      ['aparecer', 'Aparecer em cascata', 'Só a opacidade, um card de cada vez.'],
      ['aproximar', 'Aproximar em cascata', 'Cada card cresce levemente até o tamanho final.'],
      ['deslizar', 'Deslizar em cascata', 'Os cards entram pela esquerda, em sequência.'],
      ['onda', 'Onda do centro', 'Começa pelo card do meio e se espalha para os lados.'],
      ['nenhum', 'Sem animação', 'Todos já aparecem prontos.'],
    ],
  },
  {
    chave: 'ritmo',
    rotulo: 'Velocidade das entradas',
    descricao: 'Vale para a entrada de textos, imagens, cards e listas.',
    padrao: 'normal',
    opcoes: [
      ['normal', 'Normal', 'Cerca de 0,7 segundo por elemento.'],
      ['suave', 'Mais calma', 'Cerca de 1 segundo, com mais espaço entre os cards.'],
      ['rapido', 'Mais rápida', 'Cerca de meio segundo.'],
    ],
  },
  {
    chave: 'cards',
    rotulo: 'Cards ao passar o mouse',
    descricao: 'Reação dos cards quando o cursor passa por cima (só em computador).',
    padrao: 'elevar',
    opcoes: [
      ['elevar', 'Elevar', 'O card sobe um pouco e ganha sombra.'],
      ['inclinar', 'Inclinar em 3D', 'O card se inclina levemente na direção do cursor.'],
      ['brilho', 'Brilho que segue o mouse', 'Uma luz suave acompanha o cursor dentro do card.'],
      ['nenhum', 'Sem efeito', 'O card fica parado.'],
    ],
  },
  {
    chave: 'botoes',
    rotulo: 'Botões de destaque',
    descricao: 'Botões principais, como “Pedir orçamento”, puxados pelo cursor (só em computador).',
    padrao: 'magnetico',
    opcoes: [
      ['magnetico', 'Magnético', 'O botão se desloca alguns pixels na direção do cursor.'],
      ['forte', 'Magnético mais forte', 'O mesmo efeito, com mais alcance.'],
      ['nenhum', 'Sem efeito', 'O botão só muda de cor e sobe no hover.'],
    ],
  },
  {
    chave: 'contadores',
    rotulo: 'Números dos indicadores',
    descricao: 'Os números da página inicial (NPS, alunos, projetos, clientes).',
    padrao: 'contar',
    opcoes: [
      ['contar', 'Contagem', 'Contam do zero até o valor em cerca de 1,6 segundo.'],
      ['lento', 'Contagem lenta', 'A mesma contagem, em cerca de 2,8 segundos.'],
      ['fixo', 'Sem contagem', 'O número já aparece pronto.'],
    ],
  },
  {
    chave: 'linha',
    rotulo: 'Linha do tempo do processo',
    descricao: 'Os passos “Como trabalhamos”, na página inicial, em Soluções e no Órbita.',
    padrao: 'sequencial',
    opcoes: [
      ['sequencial', 'Passo a passo', 'Cada passo acende meio segundo depois do anterior.'],
      ['rapida', 'Passo a passo rápido', 'Os passos acendem em sequência, mais depressa.'],
      ['junta', 'Tudo de uma vez', 'A linha inteira acende ao mesmo tempo.'],
    ],
  },
  {
    chave: 'abertura',
    rotulo: 'Abertura da página inicial',
    descricao: 'O que acontece no topo da página inicial assim que ela abre.',
    padrao: 'montagem',
    opcoes: [
      ['montagem', 'Montagem do foguete', 'Os textos entram e as peças do foguete se encaixam antes da ignição.'],
      ['rapida', 'Montagem rápida', 'A mesma sequência, na metade do tempo.'],
      ['simples', 'Só os textos', 'Os textos entram e o foguete aparece já montado.'],
    ],
  },
  {
    chave: 'foguete',
    rotulo: 'Foguete que acompanha a rolagem',
    descricao: 'O foguete que voa pela página inicial enquanto a pessoa rola.',
    padrao: 'ativo',
    opcoes: [
      ['ativo', 'Ligado', 'O foguete percorre a trajetória entre as seções.'],
      ['desligado', 'Desligado', 'A página inicial fica sem o foguete.'],
    ],
  },
  {
    chave: 'logos',
    rotulo: 'Faixa de logos dos clientes',
    descricao: 'A faixa que passa com as marcas que já trabalharam com a EJUVV.',
    padrao: 'normal',
    opcoes: [
      ['normal', 'Velocidade normal', 'Uma volta completa a cada 32 segundos.'],
      ['lenta', 'Mais lenta', 'Uma volta a cada 52 segundos.'],
      ['rapida', 'Mais rápida', 'Uma volta a cada 20 segundos.'],
      ['parada', 'Parada', 'As logos ficam paradas, lado a lado.'],
    ],
  },
  {
    chave: 'marca',
    rotulo: 'Símbolo da marca',
    descricao: 'O símbolo da EJUVV no topo e no rodapé.',
    padrao: 'pulsar',
    opcoes: [
      ['pulsar', 'Flutuando', 'O símbolo flutua e gira de leve, devagar.'],
      ['parado', 'Parado', 'O símbolo fica imóvel.'],
    ],
  },
  {
    chave: 'fundo',
    rotulo: 'Anéis do topo da página inicial',
    descricao: 'Os anéis decorativos ao lado do título principal.',
    padrao: 'profundidade',
    opcoes: [
      ['profundidade', 'Profundidade', 'Os anéis se deslocam com o mouse e a rolagem, dando sensação de distância.'],
      ['parado', 'Parados', 'Os anéis ficam fixos.'],
    ],
  },
];

/** A opção que o site usa hoje vem primeiro e recebe a marca “atual”. */
EFEITOS.forEach((e) => {
  e.opcoes.sort((a, b) => (a[0] === e.padrao ? -1 : b[0] === e.padrao ? 1 : 0));
});

export const PADRAO = Object.fromEntries(EFEITOS.map((e) => [e.chave, e.padrao]));

/** Mantém só chaves e valores conhecidos; o resto volta ao padrão. */
export function limparEfeitos(dados) {
  const fonte = dados && typeof dados === 'object' ? dados : {};
  return Object.fromEntries(
    EFEITOS.map((e) => [e.chave, e.opcoes.some(([v]) => v === fonte[e.chave]) ? fonte[e.chave] : e.padrao])
  );
}

/* ------------------------------------------------------------------ parâmetros */

/** Ponto de partida de cada entrada (movimento até o estado final). */
export const ENTRADAS = {
  aparecer: { x: 0, y: 0, scale: 1, blur: 0 },
  subir: { x: 0, y: 28, scale: 1, blur: 0 },
  deslizar: { x: -36, y: 0, scale: 1, blur: 0 },
  aproximar: { x: 0, y: 0, scale: 0.94, blur: 0 },
  foco: { x: 0, y: 14, scale: 1, blur: 10 },
  onda: { x: 0, y: 28, scale: 1, blur: 0 },
};

export const RITMOS = { normal: 1, suave: 1.4, rapido: 0.65 };
export const MAGNETICO = { magnetico: { strength: 0.28, max: 10 }, forte: { strength: 0.42, max: 16 } };
export const CONTADORES = { contar: 1600, lento: 2800 };
export const LINHA = { sequencial: 520, rapida: 220, junta: 0 };
export const LOGOS = { normal: 32, lenta: 52, rapida: 20, parada: 0 };

/* ------------------------------------------------------------------ navegador */

const decodificar = (b64) => {
  try {
    const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(bin)));
  } catch {
    return null;
  }
};
export const codificar = (obj) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

let atual;
/**
 * Efeitos em uso nesta página: os publicados (atributo data-efeitos no <html>,
 * escrito pelo servidor) ou, numa prévia aberta pelo painel, os do endereço
 * (?efeitos=...). A prévia vale só para quem abriu o link.
 */
export function efeitos() {
  if (atual) return atual;
  if (typeof document === 'undefined') return (atual = { ...PADRAO });
  let base = {};
  try { base = JSON.parse(document.documentElement.dataset.efeitos || '{}'); } catch {}
  const previa = new URLSearchParams(location.search).get('efeitos');
  const sobrepor = previa ? decodificar(previa) : null;
  atual = limparEfeitos({ ...base, ...(sobrepor || {}) });
  if (sobrepor) aplicarAtributos(atual, true);
  return atual;
}

/** Atributos lidos pelo CSS (cards, logos e símbolo da marca). */
export function aplicarAtributos(fx, previa = false) {
  const html = document.documentElement;
  html.dataset.fxCards = fx.cards;
  html.dataset.fxLogos = fx.logos;
  html.dataset.fxMarca = fx.marca;
  if (previa && !document.getElementById('fx-previa')) {
    const aviso = document.createElement('div');
    aviso.id = 'fx-previa';
    aviso.setAttribute('role', 'status');
    aviso.textContent = 'Prévia de efeitos · ainda não publicada';
    document.body.append(aviso);
  }
}

/* ------------------------------------------------------------------ cards */

const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
export const SELETOR_CARDS = '.service-card, .project-card, .value-card, .numbered-card, .case-site-card, .blog-card:not(.is-skeleton), .blog-feature';

/**
 * Inclinação 3D e brilho que segue o cursor. “Elevar” e “nenhum” são só CSS.
 * Mede o card uma vez ao entrar e reaproveita a medida enquanto o cursor
 * estiver dentro, sem ler a geometria a cada movimento.
 */
export function iniciarCards(modo, raiz = document) {
  if (!['inclinar', 'brilho'].includes(modo) || !finePointer()) return () => {};
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const offs = [];
  const ligar = (card) => {
    if (card.dataset.fxLigado) return;
    card.dataset.fxLigado = '1';
    let rect = null;
    let frame = 0;
    const entrar = () => { rect = card.getBoundingClientRect(); };
    const mover = (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (modo === 'inclinar') {
          card.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 7).toFixed(2)}deg) rotateY(${((px - 0.5) * 9).toFixed(2)}deg) translateY(-4px)`;
        } else {
          card.style.setProperty('--fx-x', `${(px * 100).toFixed(1)}%`);
          card.style.setProperty('--fx-y', `${(py * 100).toFixed(1)}%`);
        }
      });
    };
    const sair = () => {
      rect = null;
      cancelAnimationFrame(frame);
      if (modo === 'inclinar') card.style.transform = '';
    };
    card.addEventListener('pointerenter', entrar);
    card.addEventListener('pointermove', mover);
    card.addEventListener('pointerleave', sair);
    offs.push(() => {
      card.removeEventListener('pointerenter', entrar);
      card.removeEventListener('pointermove', mover);
      card.removeEventListener('pointerleave', sair);
      card.style.transform = '';
      delete card.dataset.fxLigado;
    });
  };
  raiz.querySelectorAll(SELETOR_CARDS).forEach(ligar);
  // Cards que chegam depois (lista do blog, "carregar mais").
  const obs = new MutationObserver(() => raiz.querySelectorAll(SELETOR_CARDS).forEach(ligar));
  obs.observe(raiz === document ? document.body : raiz, { childList: true, subtree: true });
  return () => { obs.disconnect(); offs.forEach((f) => f()); };
}
