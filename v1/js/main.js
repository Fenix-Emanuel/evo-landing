// Punto de entrada: inicia cada módulo en orden.
import { CONFIG } from './config.js';
import { initI18n, t } from './i18n.js';
import { initNavbar } from './navbar.js';
import { initForm } from './form.js';
import { initChat } from './chat.js';
import { whatsappUrl } from './whatsapp.js';

// Todos los links con data-whatsapp apuntan al WhatsApp del equipo
function initWhatsappLinks() {
  const update = () => {
    document.querySelectorAll('[data-whatsapp]').forEach((link) => {
      link.href = whatsappUrl(t('whatsapp.greeting'));
      link.target = '_blank';
      link.rel = 'noopener';
    });
    document.querySelectorAll('[data-phone]').forEach((el) => {
      el.textContent = CONFIG.phoneDisplay;
    });
  };
  update();
  document.addEventListener('evo:languagechange', update);
}

initI18n();
initWhatsappLinks();
initNavbar();
initForm();
initChat();
