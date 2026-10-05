(() => {
  "use strict";

  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const toggle = document.getElementById("motionToggle");
  const label = document.getElementById("motionLabel");
  let preferred = null;
  try {
    preferred = localStorage.getItem("portfolio-motion");
  } catch {
    /* Effects also work without storage. */
  }
  let enabled = preferred === "on" || (preferred !== "off" && !reduced.matches);
  const animations = new Set();
  const controls = [];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function animate(element, frames, options) {
    if (!enabled || !element.animate) return;
    const animation = element.animate(frames, options);
    animations.add(animation);
    const clean = () => animations.delete(animation);
    animation.onfinish = clean;
    animation.oncancel = clean;
    return animation;
  }

  document
    .querySelectorAll(".project-visual, .portrait-visual")
    .forEach((surface) => {
      const stage = document.createElement("div");
      stage.className = "motion-stage";
      surface.before(stage);
      stage.append(surface);
      surface.classList.add("motion-surface");
      surface.draggable = false;
      surface.querySelector("img").draggable = false;
      const decoration = (className, parent = surface) => {
        const span = document.createElement("span");
        span.className = className;
        span.setAttribute("aria-hidden", "true");
        parent.append(span);
        return span;
      };
      decoration("motion-rim");
      const edge = decoration("motion-edge");
      const light = decoration("motion-light", edge);
      const glass = decoration("motion-glass");
      const reflection = decoration("motion-reflection", glass);
      let bounds;
      let frame = 0;
      let lastTime = 0;
      let x = 0.5;
      let y = 0.5;
      let targetX = 0.5;
      let targetY = 0.5;
      let active = false;
      let intro;
      let touchAnimation;

      const stop = () => {
        if (!active && !stage.classList.contains("is-pressed")) return;
        active = false;
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        intro?.cancel();
        touchAnimation?.cancel();
        stage.classList.remove("is-tracking", "is-pressed");
        surface.style.transform = "";
        x = y = targetX = targetY = 0.5;
      };
      controls.push(stop);

      function draw(time) {
        frame = 0;
        if (!active || !enabled) return;
        // Time-based damping gives the same response at 60 and 120 Hz.
        const dt = lastTime ? Math.min(time - lastTime, 48) : 16;
        lastTime = time;
        const response = 1 - Math.exp(-dt / 65);
        x += (targetX - x) * response;
        y += (targetY - y) * response;
        surface.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * 9}deg) rotateY(${(x - 0.5) * 10}deg) translate3d(${(x - 0.5) * 5}px, ${(y - 0.5) * 5}px, 0) scale(1.012)`;
        light.style.transform = `translate3d(${x * bounds.width - 210}px, ${y * bounds.height - 210}px, 0)`;
        reflection.style.transform = `translate3d(${x * bounds.width - 310}px, ${y * bounds.height - 310}px, 0)`;
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.0005)
          frame = requestAnimationFrame(draw);
        else lastTime = 0;
      }

      function point(event) {
        targetX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
        targetY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
        if (!frame) frame = requestAnimationFrame(draw);
      }
      function track(event) {
        if (!enabled || !finePointer.matches || event.pointerType === "touch")
          return;
        if (!active) {
          intro?.cancel();
          bounds = stage.getBoundingClientRect();
          active = true;
          stage.classList.add("is-tracking");
        }
        point(event);
      }
      stage.addEventListener("pointerenter", track);
      stage.addEventListener("pointermove", track, { passive: true });
      stage.addEventListener("pointerleave", stop);
      stage.addEventListener("pointercancel", stop);
      surface.addEventListener("focus", stop);
      stage.addEventListener(
        "pointerdown",
        (event) => {
          if (!enabled || event.pointerType !== "touch") return;
          bounds = stage.getBoundingClientRect();
          light.style.transform = `translate3d(${event.clientX - bounds.left - 210}px, ${event.clientY - bounds.top - 210}px, 0)`;
          stage.classList.add("is-pressed");
          touchAnimation = animate(
            surface,
            [{ transform: "scale(1)" }, { transform: "scale(0.985)" }],
            {
              duration: 160,
              fill: "forwards",
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            },
          );
        },
        { passive: true },
      );
      stage.addEventListener("pointerup", (event) => {
        if (event.pointerType === "touch") stop();
      });

      // A single pass introduces the interactive edge; no perpetual animation.
      stage.addEventListener("motion:enter", () => {
        if (!enabled || active) return;
        const width = stage.getBoundingClientRect().width;
        light.style.transform = "translate3d(-210px, -180px, 0)";
        intro = animate(
          light,
          [
            { transform: "translate3d(-210px, -180px, 0)" },
            { transform: `translate3d(${width - 210}px, -180px, 0)` },
          ],
          { duration: 1100, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
        animate(
          edge,
          [
            { opacity: 0 },
            { opacity: 1, offset: 0.2 },
            { opacity: 1, offset: 0.65 },
            { opacity: 0 },
          ],
          { duration: 1100 },
        );
      });
    });

  let observer;
  const revealed = new WeakSet();
  function applyPreference() {
    enabled = preferred === "on" || (preferred !== "off" && !reduced.matches);
    root.dataset.motion = enabled ? "on" : "off";
    toggle.hidden = false;
    toggle.setAttribute("aria-pressed", String(enabled));
    label.textContent = enabled ? "Efectos activados" : "Activar efectos";
    toggle.title =
      !enabled && reduced.matches
        ? "Tu dispositivo prefiere menos movimiento. Activa los efectos solo si lo deseas."
        : "Activar o desactivar los efectos de las imágenes";
    if (!enabled) {
      controls.forEach((stop) => stop());
      animations.forEach((animation) => animation.cancel());
      observer?.disconnect();
    } else if (observer) {
      document.querySelectorAll(".motion-stage").forEach((stage) => {
        if (!revealed.has(stage)) observer.observe(stage);
      });
    }
  }
  applyPreference();
  toggle.addEventListener("click", () => {
    preferred = enabled ? "off" : "on";
    try {
      localStorage.setItem("portfolio-motion", preferred);
    } catch {
      /* Optional preference. */
    }
    applyPreference();
  });
  reduced.addEventListener("change", applyPreference);
  finePointer.addEventListener("change", () =>
    controls.forEach((stop) => stop()),
  );
  window.addEventListener("resize", () => controls.forEach((stop) => stop()), {
    passive: true,
  });
  window.addEventListener("scroll", () => controls.forEach((stop) => stop()), {
    passive: true,
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      controls.forEach((stop) => stop());
      animations.forEach((animation) => animation.cancel());
    }
  });

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          if (!enabled) return;
          revealed.add(entry.target);
          animate(
            entry.target,
            [
              {
                opacity: 0.2,
                transform: "translate3d(0, 28px, 0) scale(0.975)",
              },
              { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
            ],
            { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
          entry.target.dispatchEvent(new Event("motion:enter"));
        });
      },
      { threshold: 0.12 },
    );
    applyPreference();
  }
})();
