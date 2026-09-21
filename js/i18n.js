import { CONFIG } from './config.js';
import { translations } from './translations.js';

let currentLang = CONFIG.defaultLang;

export const getLang = () => currentLang;

// Devuelve el texto de una clave en el idioma actual (con inglés como respaldo).
export function t(key) {
  return translations[currentLang]?.[key] ?? translations[CONFIG.defaultLang][key] ?? key;
}

function readStoredLang() {
  try {
    const stored = localStorage.getItem(CONFIG.storageKey);
    return translations[stored] ? stored : null;
  } catch {
    return null; // el navegador puede bloquear el almacenamiento
  }
}

function storeLang(lang) {
  try {
    localStorage.setItem(CONFIG.storageKey, lang);
  } catch {
    /* no pasa nada si no se puede guardar */
  }
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });
  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.langOption === currentLang));
  });
}

export function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  storeLang(lang);
  applyTranslations();
  // Avisa a los demás módulos (chat, formulario) para que se actualicen
  document.dispatchEvent(new CustomEvent('evo:languagechange', { detail: { lang } }));
}

export function initI18n() {
  currentLang = readStoredLang() ?? CONFIG.defaultLang;
  applyTranslations();
  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.addEventListener('click', () => setLang(button.dataset.langOption));
  });
}
