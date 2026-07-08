const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const themeToggle = document.getElementById("themeToggle");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const scrollProgress = document.getElementById("scrollProgress");
const themeMeta = document.querySelector("meta[name='theme-color']");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const themeKey = "portfolio-theme";

function setTheme(theme, options = {}) {
  const normalizedTheme = theme === "light" ? "light" : "dark";
  const isLight = normalizedTheme === "light";

  document.documentElement.dataset.theme = normalizedTheme;

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("aria-label", isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
  }

  if (themeMeta) {
    themeMeta.setAttribute("content", isLight ? "#f6fbff" : "#070b10");
  }

  if (options.persist) {
    try {
      localStorage.setItem(themeKey, normalizedTheme);
    } catch {
      // The theme still changes when storage is unavailable.
    }
  }
}

setTheme(document.documentElement.dataset.theme, { persist: false });

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function setMenu(open) {
  if (!navToggle || !siteNav) return;
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Cerrar menu" : "Abrir menu");
  siteNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

function updateProgressFallback() {
  if (!scrollProgress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
}

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(currentTheme === "light" ? "dark" : "light", { persist: true });
  });
}

if (window.gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });

  const heroReveals = gsap.utils.toArray(".hero .reveal");
  gsap.set(heroReveals, { autoAlpha: 0, y: 22 });

  gsap.timeline({ defaults: { duration: 0.9 } })
    .from(".brand", { autoAlpha: 0, y: -12 })
    .from(".site-nav a", { autoAlpha: 0, y: -10, stagger: 0.05 }, "-=0.65")
    .to(heroReveals, { autoAlpha: 1, y: 0, stagger: 0.12 }, "-=0.35")
    .from(".hero-copy h1", { y: 18, autoAlpha: 0, duration: 1 }, "-=0.75");

  const scrollReveals = gsap.utils.toArray(".reveal").filter((element) => !element.closest(".hero"));

  ScrollTrigger.batch(scrollReveals, {
    start: "top 82%",
    once: true,
    batchMax: 4,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          overwrite: true,
        }
      );
    },
  });

  gsap.to(scrollProgress, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.25,
    },
  });

  gsap.to(".hero-panel", {
    y: -26,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });

  gsap.to(".project-image img", {
    yPercent: -6,
    scale: 1.04,
    ease: "none",
    scrollTrigger: {
      trigger: ".project-feature",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });

  if (document.fonts) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
} else {
  window.addEventListener("scroll", updateProgressFallback, { passive: true });
  updateProgressFallback();
}

const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (sections.length && "IntersectionObserver" in window) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-42% 0px -54% 0px", threshold: 0 }
  );

  sections.forEach((section) => activeObserver.observe(section));
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const targetEmail = contactForm.dataset.email;
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!targetEmail || !name || !email || !message) {
      formStatus.textContent = "Completa los datos para preparar el correo.";
      return;
    }

    const subject = `Nuevo proyecto web - ${name}`;
    const body = [
      `Hola Benjamin, soy ${name}.`,
      "",
      "Quiero conversar sobre este proyecto:",
      message,
      "",
      `Mi correo: ${email}`,
    ].join("\n");

    const mailto = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    formStatus.textContent = "Listo. Se abrira tu correo con el mensaje preparado.";
    window.location.href = mailto;
  });
}
