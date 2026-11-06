import { t } from './i18n.js';
import { whatsappUrl } from './whatsapp.js';

// Formulario de contacto: valida y abre WhatsApp con el mensaje armado.
export function initForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const nameField = form.querySelector('#field-name');
  const serviceField = form.querySelector('#field-service');
  const messageField = form.querySelector('#field-message');
  const fields = [nameField, serviceField];

  function showError(field, key) {
    const errorEl = form.querySelector(`#${field.id}-error`);
    field.dataset.errorKey = key ?? '';
    field.setAttribute('aria-invalid', key ? 'true' : 'false');
    errorEl.textContent = key ? t(key) : '';
  }

  function validate() {
    showError(nameField, nameField.value.trim() ? null : 'form.errorName');
    showError(serviceField, serviceField.value ? null : 'form.errorService');
    return fields.every((field) => !field.dataset.errorKey);
  }

  function buildMessage() {
    const name = nameField.value.trim();
    const service = t(`service.${serviceField.value}`);
    let text = t('whatsapp.form')
      .replace('{name}', () => name)
      .replace('{service}', () => service);
    const details = messageField.value.trim();
    if (details) text += `\n\n${details}`;
    return text;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) {
      fields.find((field) => field.dataset.errorKey)?.focus();
      return;
    }
    const url = whatsappUrl(buildMessage());
    // Si el navegador bloquea la pestaña nueva, abre WhatsApp en la misma
    if (!window.open(url, '_blank', 'noopener')) window.location.href = url;
  });

  // Quita el error apenas la persona corrige el campo
  fields.forEach((field) => {
    field.addEventListener('input', () => showError(field, null));
  });

  // Si cambia el idioma, traduce los errores que estén visibles
  document.addEventListener('evo:languagechange', () => {
    fields.forEach((field) => {
      if (field.dataset.errorKey) showError(field, field.dataset.errorKey);
    });
  });
}
