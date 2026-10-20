const LANG_KEY = "immba-lang";

function getLang() {
  const url = new URLSearchParams(location.search).get("lang");
  if (url === "en" || url === "zh") {
    localStorage.setItem(LANG_KEY, url);
    return url;
  }
  return localStorage.getItem(LANG_KEY) || (navigator.language.startsWith("zh") ? "zh" : "en");
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState({}, "", url);
  render();
}

function withLang(href, lang = getLang()) {
  const [path, hash] = href.split("#");
  const url = new URL(path, location.href);
  url.searchParams.set("lang", lang);
  return url.pathname.split("/").pop() + url.search + (hash ? "#" + hash : "");
}

function childPageHref(child) {
  if (Array.isArray(child)) return child[0];
  return child.href;
}

function flatNav(nav) {
  const items = [];
  nav.forEach((item) => {
    if (item.children) item.children.forEach((c) => items.push([childPageHref(c), c.label]));
    else items.push([item.href, item.label]);
  });
  return items;
}

function pageFile(href) {
  return href.split("#")[0].replace(".html", "");
}

function linkActive(href, page) {
  const [path, hash] = href.split("#");
  const file = path.replace(".html", "");
  const onPage = page === file || (page === "home" && file === "index");
  if (!onPage) return false;
  if (!hash) return !location.hash;
  return location.hash === "#" + hash;
}

function submenuChild(child) {
  const href = Array.isArray(child) ? child[0] : child.href;
  const label = Array.isArray(child) ? child[1] : child.label;
  return `<a class="submenu-page" href="${withLang(href)}">${label}</a>`;
}

function navItem(item) {
  const page = document.body.dataset.page;
  if (item.children) {
    const open = item.children.some((child) => pageFile(childPageHref(child)) === page);
    return `<div class="drop">
      <button class="nav-link ${open ? "active" : ""}" type="button" aria-expanded="false" aria-haspopup="true">${item.label}</button>
      <div class="submenu" role="menu">${item.children.map(submenuChild).join("")}</div>
    </div>`;
  }
  const active = linkActive(item.href, page);
  return `<a class="${active ? "active" : ""}" href="${withLang(item.href)}">${item.label}</a>`;
}

function mobileItem(item) {
  if (!item.children) return `<a href="${withLang(item.href)}">${item.label}</a>`;
  return `<div class="mobile-group"><span>${item.label}</span>${item.children.map(submenuChild).join("")}</div>`;
}

function brandLogo() {
  return `<img class="brand-logo" src="assets/images/immba-logo.png?v=59" width="148" height="148" alt="Fu Jen Catholic University imMBA Program">`;
}

function fjcuCross() {
  return `<svg class="fjcu-cross-svg" viewBox="0 0 80 120" aria-hidden="true">
    <path d="M40 4v112" stroke="#b71939" stroke-width="16" stroke-linecap="square"/>
    <path d="M8 36h64" stroke="#b71939" stroke-width="16" stroke-linecap="square"/>
  </svg>`;
}

function whatsappIcon() {
  return `<svg class="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>`;
}

function whatsappButton(lang) {
  const zh = lang === "zh";
  const label = zh ? "WhatsApp 聯絡" : "Chat on WhatsApp";
  const hint = leaveSiteHint(zh);
  return `<a class="whatsapp-float" href="https://wa.me/886937972709" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}. ${hint}">${whatsappIcon()}<span class="sr-only">${label} (${hint})</span></a>`;
}

function layout(inner) {
  const lang = getLang();
  const t = I18N[lang];
  const page = document.body.dataset.page;
  return `
    <header class="header">
      <div class="site-notice">
        <div class="container notice-row">
          <p class="notice-copy">${t.topNotice} <a class="official-link ext-link" href="${t.officialUrl}" target="_blank" rel="noopener noreferrer" title="${leaveSiteHint(lang === "zh")}">${t.topOfficial}${extIcon()}<span class="sr-only"> (${leaveSiteHint(lang === "zh")})</span></a></p>
          <div class="notice-actions">
            <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="true" aria-controls="notice-nav">${t.menuHide}</button>
          </div>
        </div>
        <nav class="notice-nav" id="notice-nav">
          <div class="container nav">
            ${t.nav.map(navItem).join("")}
            <div class="nav-apply">
              <button class="lang-switch" id="lang-switch" type="button">${lang === "en" ? "中文版" : "English"}</button>
              <a class="btn btn-action" href="${withLang("admissions.html")}">${t.apply}</a>
            </div>
          </div>
        </nav>
      </div>
      <div class="container header-brand">
        <div class="brand">
          <a class="brand-logo-link" href="${withLang("admin.html")}" title="${lang === "zh" ? "後台管理" : "Back office"}">${brandLogo()}</a>
          <a class="brand-text" href="${withLang("index.html")}">
            <span class="brand-name-wrap">
              <canvas class="brand-fire" aria-hidden="true"></canvas>
              <em>${t.brandSchool}</em>
            </span>
            <strong>${t.brandName}</strong>
          </a>
        </div>
      </div>
    </header>
    <main>
      <div class="fjcu-cross-bg" aria-hidden="true">${fjcuCross()}</div>
      ${inner}
    </main>
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h3>imMBA</h3>
            <p>${t.footerAbout}</p>
            <p>${t.address}<br>${t.tel}<br>${t.email}</p>
          </div>
          <div>
            <h3>${t.footerCol1}</h3>
            <p><a href="${withLang("about.html")}">${lang === "zh" ? "簡介" : "About"}</a></p>
            <p><a href="${withLang("admissions.html")}">${lang === "zh" ? "招生資訊" : "Admissions"}</a></p>
            <p><a href="${withLang("curriculum.html")}">${lang === "zh" ? "課程資訊" : "Curriculum"}</a></p>
            <p><a href="${withLang("dual-degree.html")}">${lang === "zh" ? "跨國雙碩士" : "Dual degree"}</a></p>
          </div>
          <div>
            <h3>${t.footerCol2}</h3>
            <p><a href="${withLang("guide.html")}">${lang === "zh" ? "imMBA 全攻略" : "Student guide"}</a></p>
            <p><a href="${withLang("graduation.html")}">${lang === "zh" ? "畢業與離校" : "Graduation"}</a></p>
            <p><a href="${withLang("exchange.html")}">${lang === "zh" ? "海外交換" : "Exchange"}</a></p>
            <p><a href="${withLang("faculty.html")}">${lang === "zh" ? "師資介紹" : "Faculty"}</a></p>
          </div>
          <div>
            <h3>${t.footerCol3}</h3>
            <p><a href="${withLang("news.html")}">${lang === "zh" ? "公告" : "News"}</a></p>
            <p><a href="${withLang("gallery.html")}">${lang === "zh" ? "活動集錦" : "Gallery"}</a></p>
            <p><a href="${withLang("contact.html")}">${lang === "zh" ? "聯絡我們" : "Contact"}</a></p>
            <p><a href="${withLang("links.html")}">${lang === "zh" ? "相關連結" : "Related links"}</a></p>
          </div>
        </div>
        <div class="footer-bottom">
          <span>${t.copyright}</span>
          ${externalLink("https://www.management.fju.edu.tw/subweb/immba/", lang === "zh" ? "imMBA 正式官網" : "Official imMBA website", lang === "zh")}
        </div>
      </div>
    </footer>
    ${whatsappButton(lang)}`;
}

async function render() {
  const lang = getLang();
  const page = document.body.dataset.page;
  document.documentElement.lang = I18N[lang].htmlLang;
  if (page === "admin") document.title = lang === "zh" ? "後台管理 | imMBA" : "Back office | imMBA";
  else if (page === "auth") document.title = lang === "zh" ? "後台登入 | imMBA" : "Back office sign-in | imMBA";
  else document.title = I18N[lang].pageTitle;

  let inner;
  if (page === "auth" && typeof authPage === "function") {
    inner = authPage(lang);
  } else if (page === "admin" && typeof adminPage === "function") {
    const state = window.immbaAuthState || {};
    if (!state.user) {
      location.replace(withLang("auth.html"));
      inner = `<p class="muted" style="padding:48px 0;text-align:center">${lang === "zh" ? "請先登入。" : "Please sign in."}</p>`;
    } else if (state.missingTable) {
      inner = authStatusPage(lang, "sql");
    } else if (!state.emailConfirmed) {
      inner = authStatusPage(lang, "verify");
    } else if (state.role === "rejected") {
      inner = authStatusPage(lang, "rejected");
    } else if (state.role !== "admin" && state.role !== "super_admin") {
      inner = authStatusPage(lang, "pending");
    } else {
      inner = adminPage(lang);
    }
  } else {
    inner = pageContent(page, lang);
  }

  document.getElementById("app").innerHTML = layout(inner);
  bind();
  if (page === "auth" && typeof bindAuthForms === "function") bindAuthForms();
  if (typeof bindAdmin === "function") bindAdmin();
  if (typeof bindFacultyPage === "function") bindFacultyPage();
}

let brandFireStop = null;

function startBrandFire() {
  if (brandFireStop) {
    brandFireStop();
    brandFireStop = null;
  }
  const canvas = document.querySelector(".brand-fire");
  const wrap = document.querySelector(".brand-name-wrap");
  if (!canvas || !wrap) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let raf = 0;
  let width = 0;
  let height = 0;
  const particles = [];

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    const count = width > 420 ? 6 : 4;
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: width * 0.04 + Math.random() * width * 0.92,
        y: height * 0.62 + Math.random() * height * 0.2,
        vx: (Math.random() - 0.5) * 0.38,
        vy: -0.32 - Math.random() * 0.75,
        life: 0.62 + Math.random() * 0.24,
        decay: 0.014 + Math.random() * 0.016,
        r: 6 + Math.random() * 10
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    spawn();
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.r *= 0.985;
      if (p.life <= 0 || p.r < 1) {
        particles.splice(i, 1);
        continue;
      }
      const a = p.life;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(255, 236, 140, ${0.42 * a})`);
      g.addColorStop(0.28, `rgba(255, 170, 40, ${0.28 * a})`);
      g.addColorStop(0.58, `rgba(255, 72, 10, ${0.18 * a})`);
      g.addColorStop(1, `rgba(183, 25, 57, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  sizeCanvas();
  spawn();
  raf = requestAnimationFrame(tick);
  const ro = new ResizeObserver(sizeCanvas);
  ro.observe(wrap);

  brandFireStop = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
  };
}

function bind() {
  const notice = document.querySelector(".site-notice");
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("notice-nav");
  const t = I18N[getLang()];
  const applyNavState = (collapsed) => {
    notice?.classList.toggle("is-collapsed", collapsed);
    if (toggle) {
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      toggle.textContent = collapsed ? t.menuShow : t.menuHide;
    }
    sessionStorage.setItem("immba-nav-collapsed", collapsed ? "1" : "0");
  };
  const savedNav = sessionStorage.getItem("immba-nav-collapsed");
  const preferCollapsed = window.matchMedia("(max-width: 760px)").matches;
  applyNavState(savedNav === "1" || (savedNav === null && preferCollapsed));
  toggle?.addEventListener("click", () => applyNavState(!notice.classList.contains("is-collapsed")));
  const closeDrops = () => {
    document.querySelectorAll(".drop.is-open").forEach((drop) => {
      drop.classList.remove("is-open");
      drop.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
    });
  };
  document.querySelectorAll(".drop > .nav-link").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const drop = btn.closest(".drop");
      const wasOpen = drop.classList.contains("is-open");
      closeDrops();
      if (!wasOpen) {
        drop.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.querySelectorAll(".drop").forEach((drop) => {
    drop.addEventListener("click", (e) => e.stopPropagation());
  });
  if (!bind.dropDocBound) {
    document.addEventListener("click", closeDrops);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrops();
    });
    bind.dropDocBound = true;
  }
  document.getElementById("lang-switch")?.addEventListener("click", () => {
    setLang(getLang() === "en" ? "zh" : "en");
  });
  startBrandFire();
  const form = document.getElementById("contact-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const body = encodeURIComponent(`${data.get("name")} <${data.get("email")}>\n\n${data.get("message")}`);
    location.href = `mailto:imMBA@mail.fju.edu.tw?subject=${encodeURIComponent(data.get("subject"))}&body=${body}`;
  });
}

window.addEventListener("hashchange", render);
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof initAuth === "function" && (document.body.dataset.page === "admin" || document.body.dataset.page === "auth")) {
    await initAuth();
  }
  render();
});
