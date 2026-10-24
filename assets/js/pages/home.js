/**
 * Entrada da home — a única página que carrega a narrativa do foguete.
 *
 * A ordem importa: o foguete é criado antes da abertura do hero porque a
 * timeline de montagem precisa acionar a ignição dele no momento certo.
 *
 * Cada efeito segue a aba Efeitos do painel (motion/efeitos.js); com o padrão,
 * tudo se comporta exatamente como antes.
 */

import { autoReveal } from '../motion/reveal.js';
import { counter, processTimeline } from '../motion/counter.js';
import { initRocket } from '../motion/rocket.js';
import { initAssembly } from '../motion/assembly.js';
import { playHeroIntro } from '../motion/hero.js';
import { initMagnetic, initDepthLayers } from '../motion/interactions.js';
import { initDebug } from '../motion/debug.js';
import { efeitos, iniciarCards, MAGNETICO, CONTADORES, LINHA } from '../motion/efeitos.js';
import { initHeader } from '../ui/header.js';
import { initAccordion } from '../ui/accordion.js';
import { initContactForm } from '../ui/form.js';
import { $, whenSettled } from '../motion/env.js';

const fx = efeitos();

initHeader();
initAccordion();
initContactForm();

const desligado = { ignite() {}, refresh() {}, destroy() {}, getState: () => null };
// A camada vem escondida do servidor quando o foguete está desligado; uma prévia pode religá-la.
$('#rocket-layer')?.style.setProperty('display', fx.foguete === 'desligado' ? 'none' : '');
const rocket = fx.foguete === 'desligado' ? desligado : initRocket();
const assembly = initAssembly();

autoReveal();
if (fx.contadores !== 'fixo') counter('[data-count]', { duration: CONTADORES[fx.contadores] });
processTimeline('.timeline', { stepDelay: LINHA[fx.linha] });

playHeroIntro(rocket, { modo: fx.abertura });

if (fx.botoes !== 'nenhum') initMagnetic('[data-magnetic]', MAGNETICO[fx.botoes]);
if (fx.fundo !== 'parado') initDepthLayers();
iniciarCards(fx.cards);
initDebug(rocket);

// Trajetória e cena de montagem dependem da altura final da página e da
// posição da seção: refazem depois que fontes, imagens e o iframe do mapa
// assentarem.
whenSettled().then(() => {
  rocket.refresh();
  assembly.refresh();
});
$('#map-frame iframe')?.addEventListener('load', () => rocket.refresh(), { once: true });
