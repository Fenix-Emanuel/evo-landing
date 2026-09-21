import { flow, FIRST_STEP, buildSummary } from './chat-flow.js';
import { t } from './i18n.js';
import { whatsappUrl } from './whatsapp.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let els;
let state;

const isOpen = () => !els.panel.hidden;

// Pequeña pausa para que el bot se sienta natural (se omite con movimiento reducido)
const later = (fn) => (reducedMotion.matches ? fn() : setTimeout(fn, 350));

export function initChat() {
  els = {
    toggle: document.querySelector('[data-chat-toggle]'),
    panel: document.querySelector('[data-chat-panel]'),
    close: document.querySelector('[data-chat-close]'),
    log: document.querySelector('[data-chat-log]'),
    options: document.querySelector('[data-chat-options]'),
  };
  if (!els.panel) return;

  restart(null);

  els.toggle.addEventListener('click', () => (isOpen() ? closeChat() : openChat()));
  els.close.addEventListener('click', closeChat);
  els.panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeChat();
  });

  // Cualquier botón de la página puede abrir el chat (con o sin servicio preelegido)
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-chat-open], [data-chat-topic]');
    if (!trigger) return;
    const topic = trigger.dataset.chatTopic;
    openChat(topic);
  });

  // Si cambia el idioma, la conversación se reinicia en el idioma nuevo
  document.addEventListener('evo:languagechange', () => restart(state.preset));
}

function openChat(topic) {
  if (topic) restart(topic);
  els.panel.hidden = false;
  els.toggle.setAttribute('aria-expanded', 'true');
  (els.options.querySelector('button, a') ?? els.close).focus();
}

function closeChat() {
  els.panel.hidden = true;
  els.toggle.setAttribute('aria-expanded', 'false');
  els.toggle.focus();
}

function restart(topic) {
  state = { answers: {}, preset: topic ?? null };
  els.log.replaceChildren();
  els.options.replaceChildren();

  addMessage('bot', t('chat.hello'));

  if (topic) {
    // Ya eligió un servicio en la página: saltamos la primera pregunta
    state.answers.service = topic;
    addMessage('user', t(`service.${topic}`));
    showStep('place');
  } else {
    showStep(FIRST_STEP);
  }
}

function addMessage(role, text) {
  const message = document.createElement('div');
  message.className = `chat__message chat__message--${role}`;
  message.textContent = text;
  els.log.append(message);
  scrollLogToEnd();
}

// Se llama también después de mostrar los botones, porque ocupan espacio
// y cambian el alto visible de la conversación.
function scrollLogToEnd() {
  els.log.scrollTop = els.log.scrollHeight;
}

function showStep(stepId) {
  const step = flow[stepId];
  addMessage('bot', t(step.messageKey));

  els.options.replaceChildren(
    ...step.options.map((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chat__option';
      button.textContent = t(option.labelKey);
      button.addEventListener('click', () => choose(step, option));
      return button;
    })
  );
  scrollLogToEnd();
}

function choose(step, option) {
  state.answers[step.field] = option.value;
  addMessage('user', t(option.labelKey));
  els.options.replaceChildren();

  later(() => (step.next ? showStep(step.next) : finish()));
}

function finish() {
  addMessage('bot', t('chat.summary.message'));

  const send = document.createElement('a');
  send.className = 'button button--primary';
  send.href = whatsappUrl(buildSummary(state.answers, t));
  send.target = '_blank';
  send.rel = 'noopener';
  send.textContent = t('chat.send');

  const again = document.createElement('button');
  again.type = 'button';
  again.className = 'chat__option';
  again.textContent = t('chat.restart');
  again.addEventListener('click', () => restart(null));

  els.options.replaceChildren(send, again);
  scrollLogToEnd();
  send.focus();
}
