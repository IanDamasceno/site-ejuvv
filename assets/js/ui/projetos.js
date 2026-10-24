/**
 * Filtro por categoria e busca na página /projetos/.
 *
 * Os cards já vêm renderizados pelo servidor com data-categoria e
 * data-busca; aqui só escondemos e mostramos. Os botões e a busca só
 * aparecem quando há o que filtrar (o servidor decide).
 */

import { $, $$, debounce } from '../motion/env.js';

const normalizar = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function initFiltroProjetos() {
  const barra = $('#projetos-filtros');
  if (!barra) return;
  const cards = $$('[data-projeto]');
  const busca = $('input[type="search"]', barra);
  const vazio = $('#projetos-vazio');
  const status = $('#projetos-status');
  const params = new URLSearchParams(location.search);
  let categoria = params.get('categoria') || '';
  if (busca) busca.value = params.get('busca') || '';

  const aplicar = (atualizarUrl = true) => {
    const termos = normalizar(busca?.value.trim()).split(/\s+/).filter(Boolean);
    let n = 0;
    for (const card of cards) {
      const ok =
        (!categoria || card.dataset.categoria === categoria) &&
        termos.every((t) => normalizar(card.dataset.busca).includes(t));
      card.hidden = !ok;
      if (ok) n++;
      // A entrada em cascata dispara quando o primeiro card do grupo aparece; se ele
      // estiver escondido pelo filtro, ela não acontece. Ao filtrar, os cards já aparecem prontos.
      if (!card.classList.contains('is-revealed')) {
        card.style.opacity = '1';
        card.style.transform = 'none';
        card.style.filter = '';
        card.classList.add('is-revealed');
      }
    }
    $$('[data-categoria-filtro]', barra).forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.categoriaFiltro === categoria))
    );
    if (vazio) vazio.hidden = n > 0;
    if (status) status.textContent = `${n} ${n === 1 ? 'projeto' : 'projetos'}.`;
    if (atualizarUrl) {
      const p = new URLSearchParams();
      if (categoria) p.set('categoria', categoria);
      if (busca?.value.trim()) p.set('busca', busca.value.trim());
      history.replaceState(null, '', `${location.pathname}${p.toString() ? `?${p}` : ''}`);
    }
  };

  barra.addEventListener('click', (e) => {
    const b = e.target.closest('[data-categoria-filtro]');
    if (!b) return;
    categoria = b.dataset.categoriaFiltro;
    aplicar();
  });
  busca?.addEventListener('input', debounce(() => aplicar(), 160));
  $('[data-limpar-projetos]')?.addEventListener('click', () => {
    categoria = '';
    if (busca) busca.value = '';
    aplicar();
  });

  if (categoria || busca?.value) aplicar(false);
}
