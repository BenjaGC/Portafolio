(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const nav = document.getElementById("siteNav");
  const toggle = document.getElementById("navToggle");
  const mobile = window.matchMedia("(max-width: 800px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const themeButton = document.getElementById("themeToggle");

  function setMenu(open, returnFocus = false) {
    const expanded = mobile.matches && open;
    toggle.setAttribute("aria-expanded", String(expanded));
    nav.classList.toggle("is-open", expanded);
    nav.inert = mobile.matches && !expanded;
    document.body.classList.toggle("menu-open", expanded);
    if (returnFocus) toggle.focus();
  }
  setMenu(false);
  toggle.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  mobile.addEventListener("change", () => setMenu(false));
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    if (event.key === "Escape") setMenu(false, true);
    if (event.key === "Tab") {
      const lastLink = nav.querySelector("a:last-child");
      if (event.shiftKey && document.activeElement === toggle) {
        event.preventDefault();
        lastLink.focus();
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        toggle.focus();
      }
    }
  });
  document.addEventListener("click", (event) => {
    if (
      toggle.getAttribute("aria-expanded") === "true" &&
      !event.target.closest(".site-header")
    )
      setMenu(false);
  });

  function applyTheme(theme, persist = false) {
    const dark = theme === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]').content = dark
      ? "#1b1f1d"
      : "#f0f1ed";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute(
      "aria-label",
      dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro",
    );
    document.getElementById("themeLabel").textContent = dark
      ? "Tema claro"
      : "Tema oscuro";
    if (persist) {
      try {
        localStorage.setItem("portfolio-theme", dark ? "dark" : "light");
      } catch {
        /* The theme works without storage. */
      }
    }
  }
  themeButton.hidden = false;
  applyTheme(document.documentElement.dataset.theme);
  themeButton.addEventListener("click", () =>
    applyTheme(
      document.documentElement.dataset.theme === "dark" ? "light" : "dark",
      true,
    ),
  );

  document.querySelectorAll("[data-case]").forEach((container) => {
    const tabList = container.querySelector(".case-tabs");
    const tabs = [...tabList.querySelectorAll("[data-tab]")];
    const panels = [...container.querySelectorAll("[data-panel]")];
    const prefix = container.dataset.case;
    tabList.setAttribute("role", "tablist");
    function selectTab(index, focus = false) {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
      tab.id = `${prefix}-tab-${tab.dataset.tab}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", `${prefix}-panel-${tab.dataset.tab}`);
      const panel = panels[index];
      panel.id = `${prefix}-panel-${tab.dataset.tab}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.classList.add("enhanced-panel");
      panel.tabIndex = 0;
      tab.addEventListener("click", () => selectTab(index));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft")
          next = (index + tabs.length - 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          selectTab(next, true);
        }
      });
    });
    selectTab(0);
  });

  function openDetailsFromHash() {
    let id;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    const detail = document.getElementById(id);
    if (detail instanceof HTMLDetailsElement) detail.open = true;
  }
  openDetailsFromHash();
  window.addEventListener("hashchange", openDetailsFromHash);
  document.querySelectorAll("[data-open-case]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const detail = document.getElementById(link.dataset.openCase);
      detail.open = true;
      history.replaceState(null, "", `#${detail.id}`);
      detail.scrollIntoView({
        behavior: reduceMotion.matches ? "instant" : "smooth",
        block: "center",
      });
      detail.querySelector("summary").focus({ preventScroll: true });
    });
  });

  const form = document.getElementById("contactForm");
  form.hidden = false;
  const formStatus = document.getElementById("formStatus");
  const ready = document.getElementById("draftReady");
  const openMail = document.getElementById("openMail");
  let preparedMessage = "";
  async function copyText(text, status, success) {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      status.textContent = success;
    } catch {
      status.textContent =
        "No se pudo copiar. Selecciona el texto o usa el enlace de correo.";
    }
  }
  const copyEmail = document.getElementById("copyEmail");
  copyEmail.hidden = false;
  copyEmail.addEventListener("click", () =>
    copyText(
      form.dataset.email,
      document.getElementById("copyStatus"),
      "Correo copiado.",
    ),
  );
  document
    .getElementById("copyMessage")
    .addEventListener("click", () =>
      copyText(
        preparedMessage,
        formStatus,
        "Mensaje copiado. Puedes pegarlo en tu correo.",
      ),
    );
  form.addEventListener("input", () => {
    ready.hidden = true;
    preparedMessage = "";
    formStatus.textContent = "";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!name || !email || !message) {
      formStatus.textContent = "Completa los campos sin dejar solo espacios.";
      return;
    }
    const subject = `Proyecto web · ${name}`;
    preparedMessage = `Hola Benjamín, soy ${name}.\n\n${message}\n\nPuedes responderme a ${email}.`;
    openMail.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(preparedMessage)}`;
    ready.hidden = false;
    formStatus.textContent =
      "Borrador preparado. Elige abrir tu correo o copiar el mensaje.";
    openMail.focus({ preventScroll: true });
  });
  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      document.getElementById("messageDraft").open = true;
      const message = form.elements.message;
      if (!message.value.trim())
        message.value = `Me interesa ${link.dataset.service}. Mi negocio es `;
      ready.hidden = true;
      formStatus.textContent = "";
    });
  });
})();
