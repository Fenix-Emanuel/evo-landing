import { CONFIG } from './config.js';

// Arma el link de WhatsApp con un mensaje ya escrito (opcional).
export function whatsappUrl(message) {
  const base = `https://wa.me/${CONFIG.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
