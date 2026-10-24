/**
 * Entradas progressivas de elementos ao entrar no viewport.
 * Todo elemento com [data-reveal] começa em opacity:0 (via motion.css, e só
 * quando o JS está ativo) e é revelado uma única vez.
 *
 * O jeito de entrar vem da aba Efeitos do painel (motion/efeitos.js). Com o
 * padrão, as chamadas são exatamente as de antes: textos só aparecem, cards
 * sobem em cascata.
 */

import { animate, stagger, utils } from '../vendor/anime.esm.min.js';
import { $$, observeOnce, prefersReducedMotion } from './env.js';
import { efeitos, ENTRADAS, RITMOS, PADRAO } from './efeitos.js';

const DEFAULTS = {
  y: 28,
  x: 0,
  scale: 1,
  duration: 700,
  ease: 'out(3)',
  threshold: 0.18,
  delay: 0,
};

function settle(els) {
  utils.set(els, { opacity: 1, x: 0, y: 0, scale: 1 });
  els.forEach((el) => {
    el.style.filter = '';
    el.classList.add('is-revealed');
  });
}

// Desfoque (efeito “Entrar em foco”): só entra na animação quando escolhido.
const comFoco = (opts, props) =>
  opts.blur ? { ...props, filter: [`blur(${opts.blur}px)`, 'blur(0px)'] } : props;
const desfocar = (els, opts) => {
  if (opts.blur) els.forEach((el) => (el.style.filter = `blur(${opts.blur}px)`));
};
const limparFoco = (el, opts) => {
  if (opts.blur) el.style.filter = '';
};

/** Revela um ou mais elementos de forma independente. */
export function reveal(targets, options = {}) {
  const els = typeof targets === 'string' ? $$(targets) : [].concat(targets).filter(Boolean);
  if (!els.length) return { revert() {} };

  const opts = { ...DEFAULTS, ...options };

  if (prefersReducedMotion()) {
    settle(els);
    return { revert() {} };
  }

  utils.set(els, {
    opacity: 0,
    y: opts.y,
    x: opts.x,
    scale: opts.scale === 1 ? 1 : opts.scale,
  });
  desfocar(els, opts);

  const stop = observeOnce(
    els,
    (el) => {
      animate(el, comFoco(opts, {
        opacity: [0, 1],
        y: [opts.y, 0],
        x: [opts.x, 0],
        scale: opts.scale === 1 ? undefined : [opts.scale, 1],
        duration: opts.duration,
        delay: opts.delay,
        ease: opts.ease,
        onComplete: () => {
          limparFoco(el, opts);
          el.classList.add('is-revealed');
        },
      }));
    },
    { threshold: opts.threshold }
  );

  return { revert: stop };
}

/**
 * Revela um grupo em coreografia: o grupo inteiro dispara quando o primeiro
 * elemento entra no viewport, com atraso escalonado entre os itens.
 */
export function staggerReveal(targets, options = {}) {
  const els = typeof targets === 'string' ? $$(targets) : [].concat(targets).filter(Boolean);
  if (!els.length) return { revert() {} };

  const { each = 90, from = 0, ...rest } = options;
  const opts = { ...DEFAULTS, ...rest };

  if (prefersReducedMotion()) {
    settle(els);
    return { revert() {} };
  }

  utils.set(els, { opacity: 0, y: opts.y, x: opts.x });
  if (opts.scale !== 1) utils.set(els, { scale: opts.scale });
  desfocar(els, opts);

  const stop = observeOnce(
    els[0],
    () => {
      animate(els, comFoco(opts, {
        opacity: [0, 1],
        y: [opts.y, 0],
        x: [opts.x, 0],
        scale: opts.scale === 1 ? undefined : [opts.scale, 1],
        duration: opts.duration,
        ease: opts.ease,
        delay: stagger(each, { start: opts.delay, from }),
        onComplete: () =>
          els.forEach((el) => {
            limparFoco(el, opts);
            el.classList.add('is-revealed');
          }),
      }));
    },
    { threshold: opts.threshold }
  );

  return { revert: stop };
}

/**
 * Entrada de um elemento conforme a aba Efeitos. `base` são os parâmetros
 * originais da chamada, usados sem mudança quando o efeito é o padrão.
 */
export function entrar(targets, base = {}) {
  const fx = efeitos();
  const r = RITMOS[fx.ritmo];
  if (fx.entrada === PADRAO.entrada && r === 1) return reveal(targets, base);
  const els = typeof targets === 'string' ? $$(targets) : [].concat(targets).filter(Boolean);
  if (fx.entrada === 'nenhum') {
    settle(els);
    return { revert() {} };
  }
  return reveal(els, {
    ...base,
    ...ENTRADAS[fx.entrada],
    duration: (base.duration || DEFAULTS.duration) * r,
    delay: (base.delay || 0) * r,
  });
}

/** Entrada em cascata (cards e listas) conforme a aba Efeitos. */
export function entrarEmCascata(targets, base = {}) {
  const fx = efeitos();
  const r = RITMOS[fx.ritmo];
  if (fx.cascata === PADRAO.cascata && r === 1) return staggerReveal(targets, base);
  const els = typeof targets === 'string' ? $$(targets) : [].concat(targets).filter(Boolean);
  if (fx.cascata === 'nenhum') {
    settle(els);
    return { revert() {} };
  }
  return staggerReveal(els, {
    ...base,
    ...ENTRADAS[fx.cascata],
    each: (base.each || 90) * r,
    delay: (base.delay || 0) * r,
    duration: (base.duration || DEFAULTS.duration) * r,
    from: fx.cascata === 'onda' ? 'center' : base.from || 0,
  });
}

/**
 * Aplica reveals a partir dos atributos do HTML, sem precisar registrar
 * cada seletor no JS da página:
 *   data-reveal            → reveal simples
 *   data-reveal="stagger"  → agrupa por [data-reveal-group]
 *   data-reveal-delay="200"
 */
export function autoReveal(root = document) {
  const groups = new Map();
  const singles = [];

  $$('[data-reveal]', root).forEach((el) => {
    const group = el.dataset.revealGroup;
    if (el.dataset.reveal === 'stagger' && group) {
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(el);
    } else {
      singles.push(el);
    }
  });

  singles.forEach((el) =>
    entrar(el, {
      delay: Number(el.dataset.revealDelay) || 0,
      y: el.dataset.revealY ? Number(el.dataset.revealY) : undefined,
    })
  );

  groups.forEach((els) =>
    entrarEmCascata(els, {
      each: Number(els[0].dataset.revealEach) || 90,
      delay: Number(els[0].dataset.revealDelay) || 0,
    })
  );
}
