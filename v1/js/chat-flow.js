// ==========================================================================
// Conversación del bot: SOLO la estructura (pasos y opciones).
// Los textos viven en translations.js (claves labelKey / messageKey).
// Para agregar una pregunta, suma un paso acá y sus textos allá.
// ==========================================================================
export const FIRST_STEP = 'start';

export const flow = {
  start: {
    messageKey: 'chat.start.message',
    field: 'service',
    next: 'place',
    options: [
      { value: 'network', labelKey: 'service.network' },
      { value: 'fiber', labelKey: 'service.fiber' },
      { value: 'wifi', labelKey: 'service.wifi' },
      { value: 'security', labelKey: 'service.security' },
      { value: 'unsure', labelKey: 'service.unsure' },
    ],
  },
  place: {
    messageKey: 'chat.place.message',
    field: 'place',
    next: 'language',
    options: [
      { value: 'business', labelKey: 'place.business' },
      { value: 'home', labelKey: 'place.home' },
    ],
  },
  language: {
    messageKey: 'chat.language.message',
    field: 'language',
    next: null, // null = fin de la conversación
    options: [
      { value: 'en', labelKey: 'language.en' },
      { value: 'es', labelKey: 'language.es' },
    ],
  },
};

// Convierte las respuestas en el mensaje que se envía por WhatsApp
export function buildSummary(answers, t) {
  return t('whatsapp.summary')
    .replace('{service}', () => t(`service.${answers.service}`))
    .replace('{place}', () => t(`place.${answers.place}`))
    .replace('{language}', () => t(`language.${answers.language}`));
}
