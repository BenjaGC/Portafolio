

/* Borde del nav al hacer scroll */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

/* Animación de aparición al hacer scroll */
const io = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Parallax sutil en el retrato del hero */
const portrait = document.getElementById('portrait');
if (portrait && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('scroll', () => {
    const y = Math.min(scrollY, 760);
    portrait.style.transform = `translateY(${y * 0.18}px) scale(1.05)`;
  }, { passive: true });
}

/* Menú móvil (toggle y cierre) */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('active');
    menuBtn.classList.toggle('active', isOpen);
    menuBtn.textContent = isOpen ? '✕' : '☰';
    document.body.classList.toggle('no-scroll', isOpen);
  });

  // Cerrar menú al hacer click en un link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.textContent = '☰';
      document.body.classList.remove('no-scroll');
    });
  });

  // Cerrar menú al hacer click fuera del navbar
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && !nav.contains(e.target)) {
      navLinks.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.textContent = '☰';
      document.body.classList.remove('no-scroll');
    }
  });
}

/* Scroll suave para enlaces internos del nav */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* Formulario de contacto (Web3Forms) */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.style.color = 'rgba(19,19,21,0.7)';
    status.textContent = 'Enviando…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      const data = await res.json();
      if (data.success) { status.textContent = '¡Mensaje enviado! Te respondo pronto.'; form.reset(); }
      else { status.textContent = 'No se pudo enviar. Revisa tu Access Key.'; }
    } catch { status.textContent = 'Error de conexión. Intenta de nuevo.'; }
  });
}

(function () {
  const track = document.querySelector('.marquee-content');
  if (!track) return;
  track.style.animation = 'none';
  track.style.willChange = 'transform';
  track.innerHTML = track.innerHTML + track.innerHTML;
  let x = 0; const speed = 0.6;
  function step() {
    x -= speed;
    const half = track.scrollWidth / 2;
    if (Math.abs(x) >= half) x = 0;
    track.style.transform = 'translateX(' + x + 'px)';
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();

/* ============================================================
   CARRUSEL DE STACK — lenguajes + IAs (loop infinito, full-width)
   ============================================================ */
(function () {
  const track = document.getElementById('stackTrack');
  const wrap = document.getElementById('stackCarousel');
  if (!track || !wrap) return;

  
  const original = track.innerHTML;
  track.innerHTML = original + original + original;

  let x = 0;
  const speed = 0.55;
  let current = speed, target = speed;

  wrap.addEventListener('mouseenter', () => target = 0.1);
  wrap.addEventListener('mouseleave', () => target = speed);

  function loop() {
    current += (target - current) * 0.06;
    x -= current;
    const third = track.scrollWidth / 3;   // reinicia tras una copia
    if (Math.abs(x) >= third) x = 0;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  /* Resplandor que sigue el cursor */
  const glow = document.getElementById('cursorGlow');
  let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  function followCursor() {
    gx += (mx - gx) * 0.12; gy += (my - gy) * 0.12;
    if (glow) glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
    requestAnimationFrame(followCursor);
  }
  followCursor();

  const heroInner = document.querySelector('.hero-inner');
  const heroSection = document.querySelector('.hero');
  if (heroInner && heroSection) {
    heroSection.addEventListener('mousemove', e => {
      const r = heroSection.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const yy = (e.clientY - r.top) / r.height - 0.5;
      heroInner.style.transform = `translate(${x * 16}px, ${yy * 16}px)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroInner.style.transition = 'transform .6s cubic-bezier(.19,1,.22,1)';
      heroInner.style.transform = '';
      setTimeout(() => heroInner.style.transition = '', 600);
    });
  }

  document.querySelectorAll('.proj').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.19,1,.22,1)';
      card.style.transform = '';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
})();

(function () {
  const canvas = document.getElementById('heroFx');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const coralSoft = 'rgba(255,180,170,0.9)';
  let cols, drops, qrCells;
  const FONT = 14;
  const chars = '01<>/{}[]();=+*ƒλΣ#$%abcdef0123456789';

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    cols = Math.floor(canvas.offsetWidth / FONT);
    drops = Array.from({ length: cols }, () => Math.random() * -50);
    buildQR();
  }
  function buildQR() {
    qrCells = [];
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    for (let b = 0; b < 4; b++) {
      const size = 7 + Math.floor(Math.random() * 3), cell = 6;
      const x = Math.random() * (w - size * cell), y = Math.random() * (h - size * cell);
      const grid = [];
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) if (Math.random() > 0.45) grid.push([i, j]);
      qrCells.push({ x, y, cell, grid, phase: Math.random() * Math.PI * 2 });
    }
  }
  let t = 0;
  function draw() {
    t += 0.02;
    ctx.fillStyle = 'rgba(12,12,14,0.08)';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.font = FONT + "px 'JetBrains Mono', monospace";
    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > 0.92 ? coralSoft : 'rgba(255,107,92,0.45)';
      ctx.fillText(ch, i * FONT, drops[i] * FONT);
      if (drops[i] * FONT > canvas.offsetHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.5;
    }
    qrCells.forEach(q => {
      const pulse = 0.25 + 0.25 * Math.sin(t + q.phase);
      ctx.fillStyle = `rgba(255,107,92,${pulse})`;
      q.grid.forEach(([i, j]) => ctx.fillRect(q.x + i * q.cell, q.y + j * q.cell, q.cell - 1, q.cell - 1));
    });
    requestAnimationFrame(draw);
  }
  resize();
  addEventListener('resize', resize);
  draw();
})();
