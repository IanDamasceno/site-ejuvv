/**
 * Formulário de contato.
 *
 * Não há backend para mensagens, então o envio monta uma mensagem
 * estruturada e abre o WhatsApp comercial da EJUVV, o mesmo canal
 * divulgado no rodapé e no botão flutuante.
 *
 * Serviços, portes e o número vêm do HTML, que o servidor monta com o
 * conteúdo publicado no painel (data-whatsapp no <form>).
 */

import { $ } from '../motion/env.js';

/** Máscara BR, portada literalmente do formulário anterior. */
export function maskPhone(value) {
  const n = value.replace(/\D/g, '').slice(0, 11);
  if (n.length > 6) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length > 2) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return n;
}

function buildMessage(data) {
  const lines = [
    `Olá! Sou ${data.name}${data.company ? ` da ${data.company}` : ''}.`,
    '',
    `Serviço de interesse: ${data.service}`,
    `Porte do negócio: ${data.size}`,
    '',
    'Sobre o projeto:',
    data.message,
    '',
    `E-mail: ${data.email}`,
    `WhatsApp: ${data.phone}`,
  ];
  return lines.join('\n');
}

/** Usa um menu visual prÃ³prio quando o navegador nÃ£o oferece o select
 * customizÃ¡vel. O <select> continua sendo a fonte dos dados do formulÃ¡rio. */
function enhanceSelect(select) {
  if (window.CSS?.supports?.('appearance: base-select') || select.dataset.enhanced === 'true') return;
  select.dataset.enhanced = 'true';

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';
  select.before(wrapper);
  wrapper.append(select);
  select.classList.add('custom-select__native');
  select.tabIndex = -1;

  const listId = `${select.id || select.name}-options`;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'custom-select__trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', listId);
  const label = select.id ? select.form?.querySelector(`label[for="${select.id}"]`) : null;
  if (label) {
    label.id ||= `${select.id}-label`;
    trigger.setAttribute('aria-labelledby', label.id);
    label.addEventListener('click', (event) => {
      event.preventDefault();
      trigger.focus();
    });
  }

  const value = document.createElement('span');
  value.className = 'custom-select__value';
  trigger.append(value);

  const list = document.createElement('ul');
  list.id = listId;
  list.className = 'custom-select__options';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  const items = [...select.options].map((option, index) => {
    const item = document.createElement('li');
    item.className = 'custom-select__option';
    item.setAttribute('role', 'option');
    item.dataset.index = String(index);
    item.tabIndex = -1;
    item.textContent = option.textContent;
    if (option.disabled) item.setAttribute('aria-disabled', 'true');
    list.append(item);
    return item;
  });

  wrapper.append(trigger, list);
  const enabledItems = () => items.filter((item) => item.getAttribute('aria-disabled') !== 'true');

  const sync = () => {
    const selected = select.options[select.selectedIndex] || select.options[0];
    value.textContent = selected?.textContent || '';
    trigger.classList.toggle('is-placeholder', !select.value);
    trigger.removeAttribute('aria-invalid');
    items.forEach((item, index) => item.setAttribute('aria-selected', String(index === select.selectedIndex)));
  };

  const close = ({ focus = false } = {}) => {
    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    list.hidden = true;
    if (focus) trigger.focus();
  };

  const open = () => {
    document.querySelectorAll('.custom-select.is-open').forEach((other) => {
      if (other !== wrapper) other.querySelector('.custom-select__trigger')?.click();
    });
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    list.hidden = false;
    const active = items[select.selectedIndex];
    (active?.getAttribute('aria-disabled') !== 'true' ? active : enabledItems()[0])?.focus();
  };

  const choose = (item) => {
    if (!item || item.getAttribute('aria-disabled') === 'true') return;
    select.selectedIndex = Number(item.dataset.index);
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close({ focus: true });
  };

  trigger.addEventListener('click', () => wrapper.classList.contains('is-open') ? close() : open());
  trigger.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    open();
    const available = enabledItems();
    (event.key === 'ArrowUp' || event.key === 'End' ? available.at(-1) : available[0])?.focus();
  });

  list.addEventListener('click', (event) => choose(event.target.closest('.custom-select__option')));
  list.addEventListener('keydown', (event) => {
    const current = event.target.closest('.custom-select__option');
    if (!current) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(current);
      return;
    }
    if (event.key === 'Escape') {
      close({ focus: true });
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const available = enabledItems();
    const index = available.indexOf(current);
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? available.length - 1
      : event.key === 'ArrowDown' ? Math.min(index + 1, available.length - 1)
      : Math.max(index - 1, 0);
    available[next]?.focus();
  });

  select.addEventListener('change', sync);
  select.addEventListener('invalid', (event) => {
    event.preventDefault();
    trigger.setAttribute('aria-invalid', 'true');
    trigger.focus();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!wrapper.contains(event.target)) close();
  });
  wrapper.addEventListener('focusout', (event) => {
    if (!wrapper.contains(event.relatedTarget)) close();
  });
  select.form?.addEventListener('reset', () => setTimeout(sync));
  sync();
}

export function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const serviceSelect = form.querySelector('[name="service"]');
  const phoneInput = form.querySelector('[name="phone"]');
  const successPanel = $('#form-success');

  /* ---------- Pré-seleciona a solução vinda de /contato?servico=slug ---------- */
  const requested = new URLSearchParams(location.search).get('servico');
  if (requested && serviceSelect) {
    const match = [...serviceSelect.options].find((o) => o.value === requested);
    if (match) serviceSelect.value = match.value;
  }

  form.querySelectorAll('select').forEach(enhanceSelect);

  /* ---------- Máscara de telefone ---------- */
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const start = phoneInput.selectionStart;
      const before = phoneInput.value.length;
      phoneInput.value = maskPhone(phoneInput.value);
      const after = phoneInput.value.length;
      if (start !== null && start < before) {
        phoneInput.setSelectionRange(start + (after - before), start + (after - before));
      }
    });
  }

  /* ---------- Envio ---------- */
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Honeypot: bots preenchem o campo escondido.
    if (form.elements.website?.value) return;

    if (!form.reportValidity()) return;

    const fd = new FormData(form);
    const serviceSlug = String(fd.get('service') || '');
    const serviceTitle =
      [...(serviceSelect?.options || [])].find((o) => o.value === serviceSlug && o.value)?.textContent ||
      serviceSlug ||
      'Não informado';

    const text = buildMessage({
      name: String(fd.get('name') || '').trim(),
      company: String(fd.get('company') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      service: serviceTitle,
      size: String(fd.get('size') || 'Não informado'),
      message: String(fd.get('message') || '').trim(),
    });

    const url = `https://wa.me/${form.dataset.whatsapp || ''}?text=${encodeURIComponent(text)}`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) location.href = url;

    if (successPanel) {
      form.hidden = true;
      successPanel.hidden = false;
      successPanel.querySelector('h3')?.focus?.();
    }
  });

  /* ---------- Voltar ao formulário ---------- */
  $('#form-reset')?.addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    if (successPanel) successPanel.hidden = true;
    form.querySelector('input')?.focus();
  });
}
