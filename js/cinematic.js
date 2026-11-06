// ==========================================================================
// Movimiento cinematográfico (GSAP + ScrollTrigger + Lenis).
// Las librerías se cargan desde CDN en index.html. Si no cargan, o si la persona
// pidió "reducir movimiento", la página queda completa y estática.
// Todo es una sola toma: el pasillo se acerca hasta un punto de luz, esa luz
// recorre el cable por cada servicio, y después enciende el proceso.
// ==========================================================================
import { t } from './i18n.js';

const SERVICES = ['network', 'fiber', 'wifi', 'security'];

// Header: transparente arriba, sólido al bajar
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export function initCinematic() {
  initHeader();

  const { gsap, ScrollTrigger, Lenis } = window;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('is-cine');

  // ---------- Scroll suave ----------
  let lenis = null;
  if (Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Los links internos (#services, #contact…) viajan con Lenis
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(id === '#top' ? 0 : target, { offset: -60, duration: 1.4 });
    });
  }

  initHero(gsap);
  initSignal(gsap);
  initReveals(gsap);
  initProcess(gsap);
  initContact(gsap);

  // Al cambiar de idioma cambian los largos de texto: recalcular
  document.addEventListener('evo:languagechange', () => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// ---------- 1. Hero: la cámara avanza por el pasillo hasta un punto de luz ----------
function initHero(gsap) {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  gsap.from('.hero__content > *', { y: 28, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.09, delay: 0.1 });
  gsap.set('.hero__image', { filter: 'blur(0px) brightness(1)' });

  gsap.timeline({
    scrollTrigger: { trigger: hero, start: 'top top', end: '+=110%', scrub: 0.6, pin: true },
  })
    .to('.hero__welcome', { opacity: 0, duration: 0.2 }, 0)
    .to('.hero__content', { opacity: 0, y: -60, duration: 0.35 }, 0)
    .to('.hero__media', { scale: 2.6, transformOrigin: '60% 40.5%', ease: 'power2.in', duration: 1 }, 0)
    .to('.hero__image', { filter: 'blur(5px) brightness(0.55)', ease: 'power2.in', duration: 1 }, 0)
    .fromTo('.hero__pulse', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3 }, 0.55)
    .to('.hero__fade', { opacity: 1, duration: 0.3 }, 0.7);
}

// ---------- 2. La señal: un pulso recorre el cable y enciende cada servicio ----------
function initSignal(gsap) {
  const stage = document.querySelector('[data-signal]');
  if (!stage) return;
  const services = [...stage.querySelectorAll('.service')];

  // Cable (SVG que se estira a lo ancho; el grosor no se deforma)
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1600, H = 200;
  const NODES_X = [200, 600, 1000, 1400];
  const d = 'M -40 100 C 80 100 120 60 200 60 S 420 140 600 140 S 820 60 1000 60 S 1220 140 1400 140 S 1580 100 1660 100';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'signal__wire');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const base = document.createElementNS(NS, 'path');
  const lit = document.createElementNS(NS, 'path');
  [base, lit].forEach((p, i) => {
    p.setAttribute('d', d);
    p.setAttribute('class', i ? 'signal__lit' : 'signal__base');
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(p);
  });
  stage.prepend(svg);
  const scene = createScene(stage);

  // Largo total y en qué punto del largo cae cada nodo
  const total = lit.getTotalLength();
  const nodeLen = NODES_X.map((x) => {
    let best = 0, bestDist = Infinity;
    for (let l = 0; l <= total; l += 2) {
      const dist = Math.abs(lit.getPointAtLength(l).x - x);
      if (dist < bestDist) { bestDist = dist; best = l; }
    }
    return best;
  });
  lit.style.strokeDasharray = total;
  lit.style.strokeDashoffset = total;

  // Nodos y pulso en HTML (así siguen redondos aunque el SVG se estire)
  const wireBox = () => svg.getBoundingClientRect();
  const place = (el, pt) => {
    const box = wireBox(), sb = stage.getBoundingClientRect();
    el.style.left = `${box.left - sb.left + (pt.x / W) * box.width}px`;
    el.style.top = `${box.top - sb.top + (pt.y / H) * box.height}px`;
  };
  const nodes = SERVICES.map((key, i) => {
    const node = document.createElement('span');
    node.className = `signal__node signal__node--${key}`;
    node.setAttribute('aria-hidden', 'true');
    stage.appendChild(node);
    node._pt = lit.getPointAtLength(nodeLen[i]);
    return node;
  });
  const pulse = document.createElement('span');
  pulse.className = 'signal__pulse';
  pulse.setAttribute('aria-hidden', 'true');
  stage.appendChild(pulse);

  // Riel con los 4 servicios (muestra en cuál va la señal)
  const rail = document.createElement('ul');
  rail.className = 'signal__rail';
  rail.setAttribute('aria-hidden', 'true');
  const railItems = SERVICES.map((key) => {
    const li = document.createElement('li');
    li.className = `is-${key}`;
    rail.appendChild(li);
    return li;
  });
  const labelRail = () => railItems.forEach((li, i) => { li.textContent = t(`service.${SERVICES[i]}`); });
  labelRail();
  document.addEventListener('evo:languagechange', labelRail);
  stage.appendChild(rail);

  const state = { len: 0 };
  const update = () => {
    lit.style.strokeDashoffset = total - state.len;
    place(pulse, lit.getPointAtLength(Math.max(0, Math.min(total, state.len))));
    let active = -1;
    nodes.forEach((node, i) => {
      const on = state.len >= nodeLen[i] - 1;
      node.classList.toggle('is-on', on);
      railItems[i].classList.toggle('is-on', on);
      if (on) active = i;
    });
    scene.setActive(active);
  };
  const layout = () => { nodes.forEach((n) => place(n, n._pt)); update(); };
  layout();

  gsap.set(services, { autoAlpha: 0 });
  gsap.set(stage.querySelectorAll('.service__body, .service__action'), { opacity: 0, y: 30 });
  gsap.set(stage.querySelectorAll('.service__object'), { opacity: 0, scale: 0.86, yPercent: 8 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: () => `+=${window.innerHeight * services.length * 1.1}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onRefresh: layout,
      onToggle: (self) => scene.run(self.isActive),
    },
  });

  services.forEach((service, i) => {
    const word = service.querySelector('.service__word');
    const body = service.querySelectorAll('.service__body, .service__action');
    const object = service.querySelector('.service__object');

    // viaja hasta el nodo
    tl.to(state, { len: nodeLen[i], duration: 1, ease: 'power1.inOut', onUpdate: update });
    // el servicio aparece: la palabra se llena con el color de su cable
    tl.set(service, { autoAlpha: 1 });
    tl.fromTo(word, { opacity: 0, yPercent: 14, backgroundPosition: '100% 0' },
      { opacity: 0.9, yPercent: 0, backgroundPosition: '0% 0', duration: 0.55, ease: 'power2.out' });
    tl.to(object, { opacity: 1, scale: 1, yPercent: 0, duration: 0.6, ease: 'power3.out' }, '<0.05');
    tl.to(body, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, '<0.15');
    // pausa para leer: el objeto sigue acercándose despacio
    tl.to(object, { scale: 1.06, rotation: i % 2 ? -2 : 2, duration: 0.6 }, '>');

    if (i < services.length - 1) {
      tl.to([word, ...body], { opacity: 0, y: -24, duration: 0.3, ease: 'power1.in' });
      tl.to(object, { opacity: 0, scale: 1.18, yPercent: -6, duration: 0.3, ease: 'power1.in' }, '<');
      tl.set(service, { autoAlpha: 0 });
    }
  });
  tl.to(state, { len: total, duration: 0.6, onUpdate: update });

  window.addEventListener('resize', layout);
}

// ---------- Escena de fondo en canvas: una atmósfera distinta por servicio ----------
// network: luces de rack · fiber: haces de luz · wifi: ondas · security: barrido de cámara
function createScene(stage) {
  const canvas = document.createElement('canvas');
  canvas.className = 'signal__scene';
  canvas.setAttribute('aria-hidden', 'true');
  stage.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const LIME = [181, 229, 93];
  let w = 0, h = 0, dpr = 1, running = false, active = -1, raf = 0;
  const weight = [0, 0, 0, 0];

  // Datos fijos de cada escena (se generan una vez)
  const leds = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.6, c: Math.random() }));
  const beams = Array.from({ length: 46 }, () => ({ y: Math.random(), x: Math.random(), v: 0.15 + Math.random() * 0.5, l: 0.05 + Math.random() * 0.18, a: 0.25 + Math.random() * 0.6 }));

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = stage.clientWidth; h = stage.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const focus = () => ({ x: w * (w >= 896 ? 0.66 : 0.5), y: h * (w >= 896 ? 0.46 : 0.37) });

  const drawers = [
    // Cableado: columnas de LEDs a los costados, como racks en la penumbra
    (t, a) => {
      leds.forEach((d) => {
        const side = d.x < 0.5 ? d.x * 0.36 : 0.82 + (d.x - 0.5) * 0.36;
        const on = 0.35 + 0.65 * Math.max(0, Math.sin(t * d.s + d.p));
        ctx.fillStyle = d.c > 0.82 ? `rgba(255,255,255,${0.5 * on * a})` : rgba(LIME, 0.55 * on * a);
        ctx.fillRect(side * w, (0.12 + d.y * 0.8) * h, 3, 3);
      });
    },
    // Fibra: haces de luz que cruzan la pantalla
    (t, a) => {
      ctx.lineCap = 'round';
      beams.forEach((b) => {
        const x = ((b.x + t * b.v * 0.12) % 1.3 - 0.15) * w;
        const g = ctx.createLinearGradient(x - b.l * w, 0, x, 0);
        g.addColorStop(0, rgba(LIME, 0)); g.addColorStop(1, `rgba(235,255,210,${b.a * a})`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x - b.l * w, b.y * h); ctx.lineTo(x, b.y * h); ctx.stroke();
      });
    },
    // Wi-Fi: ondas que se expanden desde el access point
    (t, a) => {
      const f = focus();
      for (let i = 0; i < 6; i++) {
        const k = ((t * 0.22 + i / 6) % 1);
        ctx.strokeStyle = rgba(LIME, (1 - k) * 0.45 * a); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(f.x, f.y, 40 + k * Math.max(w, h) * 0.6, 0, Math.PI * 2); ctx.stroke();
      }
    },
    // Seguridad: grilla de puntos y un haz que barre la escena
    (t, a) => {
      const f = focus();
      ctx.fillStyle = rgba(LIME, 0.12 * a);
      for (let x = 24; x < w; x += 36) for (let y = 24; y < h; y += 36) ctx.fillRect(x, y, 1.5, 1.5);
      const ang = Math.PI + Math.sin(t * 0.6) * 0.55;
      const r = Math.max(w, h);
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 0.8);
      g.addColorStop(0, rgba(LIME, 0.22 * a)); g.addColorStop(1, rgba(LIME, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.arc(f.x, f.y, r, ang - 0.22, ang + 0.22); ctx.closePath(); ctx.fill();
    },
  ];

  const frame = (ms) => {
    const t = ms / 1000;
    ctx.clearRect(0, 0, w, h);
    weight.forEach((v, i) => {
      weight[i] += ((i === active ? 1 : 0) - v) * 0.08; // fundido suave entre escenas
      if (weight[i] > 0.01) drawers[i](t, weight[i]);
    });
    if (running) raf = requestAnimationFrame(frame);
  };

  return {
    setActive(i) { active = i; },
    run(on) {
      if (on === running) return;
      running = on;
      if (on) { resize(); raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
    },
  };
}

// ---------- 3. Títulos y panel de conexiones ----------
function initReveals(gsap) {
  gsap.utils.toArray('.section__title, .section__intro').forEach((el) => {
    if (el.closest('[data-signal]')) return;
    gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // Los cables se enchufan uno por uno
  gsap.from('.patch__port', {
    opacity: 0, scale: 0.6, duration: 0.5, ease: 'back.out(2)',
    stagger: { each: 0.05, from: 'random' },
    scrollTrigger: { trigger: '.patch', start: 'top 80%' },
  });
}

// ---------- 4. Proceso: la línea se enciende paso a paso ----------
function initProcess(gsap) {
  const steps = gsap.utils.toArray('.step');
  if (!steps.length) return;
  gsap.set(steps, { '--fill': 0 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.process__list', start: 'top 78%', end: 'bottom 55%', scrub: 0.5 } });
  steps.forEach((step) => {
    tl.to(step, {
      '--fill': 1, duration: 1, ease: 'none',
      onUpdate() { step.classList.toggle('is-lit', this.progress() > 0.92); },
    });
  });
}

// ---------- 5. Contacto: la palabra gigante entra de costado ----------
function initContact(gsap) {
  const big = document.querySelector('.contact__big');
  if (!big) return;
  gsap.fromTo(big, { xPercent: 22 }, {
    xPercent: -4, ease: 'none',
    scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'top 15%', scrub: 0.6 },
  });
}
