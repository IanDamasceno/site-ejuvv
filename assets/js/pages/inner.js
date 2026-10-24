/**
 * Entrada das páginas internas — reusa reveals, contadores e microinterações,
 * sem carregar o módulo do foguete nem o sistema de partículas.
 * Os efeitos seguem a aba Efeitos do painel (motion/efeitos.js).
 */

import { autoReveal } from '../motion/reveal.js';
import { counter, processTimeline } from '../motion/counter.js';
import { initMagnetic } from '../motion/interactions.js';
import { efeitos, iniciarCards, MAGNETICO, CONTADORES, LINHA } from '../motion/efeitos.js';
import { initHeader } from '../ui/header.js';
import { initAccordion } from '../ui/accordion.js';
import { initContactForm } from '../ui/form.js';
import { initGaleria } from '../ui/galeria.js';
import { initFiltroProjetos } from '../ui/projetos.js';
import { $ } from '../motion/env.js';

const fx = efeitos();

initHeader();
initAccordion();
initContactForm();
initGaleria();
autoReveal();
// Depois das entradas: o filtro vindo do endereço mostra prontos os cards que ficam visíveis.
initFiltroProjetos();
if (fx.contadores !== 'fixo') counter('[data-count]', { duration: CONTADORES[fx.contadores] });
if (fx.botoes !== 'nenhum') initMagnetic('[data-magnetic]', MAGNETICO[fx.botoes]);
iniciarCards(fx.cards);

if ($('.timeline')) processTimeline('.timeline', { stepDelay: LINHA[fx.linha] });
