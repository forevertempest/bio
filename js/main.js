(() => {
  const root = document.documentElement;
  const year = String(new Date().getFullYear());

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const saved = localStorage.getItem("folio-lang");
  let lang = saved === "en" || saved === "ru" ? saved : "ru";

  function t() {
    return window.I18N[lang];
  }

  function applyLang() {
    const d = t();
    root.lang = lang;
    $$("[data-i]").forEach((el) => {
      const path = el.getAttribute("data-i").split(".");
      let val = d;
      for (const key of path) val = val?.[key];
      if (typeof val === "string") {
        if (el.hasAttribute("data-html")) el.innerHTML = val.replace(/\n/g, "<br>");
        else el.textContent = val;
      }
    });

    $$("[data-i-placeholder]").forEach((el) => {
      const path = el.getAttribute("data-i-placeholder").split(".");
      let val = d;
      for (const key of path) val = val?.[key];
      if (typeof val === "string") el.placeholder = val;
    });

    const items = d.work.items;
    $$("[data-work]").forEach((card) => {
      const i = Number(card.getAttribute("data-work"));
      const item = items[i];
      if (!item) return;
      const title = $("[data-work-title]", card);
      const tag = $("[data-work-tag]", card);
      if (title) title.textContent = item.title;
      if (tag) tag.textContent = `${item.tag} · ${window.SITE.works[i].year}`;
    });

    d.skills.items.forEach((s, i) => {
      const box = $(`[data-skill="${i}"]`);
      if (!box) return;
      $("h3", box).textContent = s.t;
      $("p", box).textContent = s.d;
    });

    const tags = $(".tags");
    if (tags) {
      tags.innerHTML = d.skills.tags.map((x) => `<span>${x}</span>`).join("");
    }

    d.exp.items.forEach((e, i) => {
      const row = $(`[data-exp="${i}"]`);
      if (!row) return;
      $(".exp-year", row).textContent = e.year;
      $("h3", row).textContent = e.title;
      $("p", row).textContent = e.text;
      $(".exp-role", row).textContent = e.role;
    });

    $$(".lang button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });

    const y = $("[data-year]");
    if (y) y.textContent = year;
    const logoName = $("[data-logo-name]");
    if (logoName) logoName.textContent = `${d.hero.name} ${d.hero.last}`;
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem("folio-lang", lang);
    applyLang();
  }

  $$(".lang button").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });

  const header = $(".header");
  const onScroll = () => {
    header.classList.toggle("is-solid", window.scrollY > 20);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = $(".menu-btn");
  menuBtn?.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });
  $$(".nav a").forEach((a) => {
    a.addEventListener("click", () => document.body.classList.remove("nav-open"));
  });

  const form = $(".form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = $(".form-note");
    note.textContent = t().contact.sent;
    form.reset();
  });

  const lightbox = $(".lightbox");
  const lbImg = $("[data-lb-img]");
  const lbTitle = $("[data-lb-title]");
  const lbText = $("[data-lb-text]");
  const lbTag = $("[data-lb-tag]");
  const lbOpen = $("[data-lb-open]");

  function openWork(i) {
    const item = t().work.items[i];
    const meta = window.SITE.works[i];
    lbImg.src = meta.img;
    lbTitle.textContent = item.title;
    lbText.textContent = item.text;
    lbTag.textContent = `${item.tag} · ${meta.year}`;
    if (lbOpen) {
      lbOpen.href = meta.href || "#";
      lbOpen.style.display = meta.href ? "inline-flex" : "none";
    }
    lightbox.classList.add("is-open");
  }

  $$("[data-work]").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      openWork(Number(card.getAttribute("data-work")));
    });
  });

  $("[data-lb-close]")?.addEventListener("click", () => lightbox.classList.remove("is-open"));
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("is-open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lightbox.classList.remove("is-open");
  });

  const mailLink = $("[data-mail-link]");
  const contactHref = window.SITE.contactHref || window.SITE.email;
  if (mailLink) {
    mailLink.href = contactHref;
    if (contactHref.startsWith("http")) mailLink.target = "_blank";
  }
  const mailLabel = $("[data-mail]");
  if (mailLabel) mailLabel.textContent = "t.me/tempestdevelop";
  $("[data-initials]").textContent = window.SITE.initials;

  window.SITE.socials.forEach((s) => {
    const a = $(`[data-social="${s.id}"]`);
    if (!a) return;
    if (s.id === "ds") {
      a.href = "#contact";
      a.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(window.SITE.discord);
          a.dataset.copied = "1";
          a.textContent = `${window.SITE.discord} ✓`;
          setTimeout(() => {
            a.textContent = t().contact.ds;
            delete a.dataset.copied;
          }, 1600);
        } catch {
          a.textContent = window.SITE.discord;
        }
      });
    } else {
      a.href = s.href;
    }
  });

  applyLang();
})();
