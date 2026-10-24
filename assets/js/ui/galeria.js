/**
 * Galeria de fotos dos projetos com lightbox.
 *
 * Cada link [data-galeria] > a aponta para a foto grande. Sem JS, o link
 * simplesmente abre a imagem. Com JS, abre um <dialog> com navegação por
 * setas, teclado (← → Esc) e toque (arrastar para os lados).
 */

import { $, $$ } from '../motion/env.js';

const icon = (name) => `<svg aria-hidden="true"><use href="/assets/img/icons.svg#${name}"/></svg>`;

export function initGaleria() {
  const grupos = $$('[data-galeria]');
  if (!grupos.length || typeof HTMLDialogElement !== 'function') return;

  const caixa = document.createElement('dialog');
  caixa.className = 'lightbox';
  caixa.setAttribute('aria-label', 'Foto ampliada');
  caixa.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lightbox-fechar" aria-label="Fechar">${icon('i-x')}</button>
    <button type="button" class="lightbox-ant" aria-label="Foto anterior">${icon('i-arrow-left')}</button>
    <button type="button" class="lightbox-prox" aria-label="Próxima foto">${icon('i-arrow-right')}</button>
    <span class="lightbox-conta" aria-live="polite"></span>`;
  document.body.append(caixa);

  const img = $('img', caixa);
  const legenda = $('figcaption', caixa);
  const conta = $('.lightbox-conta', caixa);
  let itens = [];
  let atual = 0;

  const mostrar = (i) => {
    atual = (i + itens.length) % itens.length;
    const a = itens[atual];
    img.src = a.href;
    img.alt = a.querySelector('img')?.alt || '';
    legenda.textContent = a.dataset.legenda || '';
    legenda.hidden = !a.dataset.legenda;
    conta.textContent = itens.length > 1 ? `${atual + 1} de ${itens.length}` : '';
    caixa.classList.toggle('sozinha', itens.length < 2);
  };

  grupos.forEach((grupo) => {
    const links = $$('a', grupo);
    links.forEach((a, i) =>
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        itens = links;
        mostrar(i);
        caixa.showModal();
      })
    );
  });

  $('.lightbox-fechar', caixa).addEventListener('click', () => caixa.close());
  $('.lightbox-ant', caixa).addEventListener('click', () => mostrar(atual - 1));
  $('.lightbox-prox', caixa).addEventListener('click', () => mostrar(atual + 1));
  caixa.addEventListener('click', (e) => { if (e.target === caixa) caixa.close(); });
  caixa.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mostrar(atual - 1);
    if (e.key === 'ArrowRight') mostrar(atual + 1);
  });
  caixa.addEventListener('close', () => itens[atual]?.focus());

  let x0 = null;
  caixa.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  caixa.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50 && itens.length > 1) mostrar(atual + (dx < 0 ? 1 : -1));
  });
}
