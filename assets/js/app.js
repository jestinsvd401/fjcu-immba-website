const LANG_KEY = "immba-lang";

function getLang() {
  const url = new URLSearchParams(location.search).get("lang");
  if (url === "en" || url === "zh") return url;
  return localStorage.getItem(LANG_KEY) || (navigator.language.startsWith("zh") ? "zh" : "en");
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState({}, "", url);
  render();
}

function withLang(href) {
  const lang = getLang();
  const [path, hash] = href.split("#");
  const url = new URL(path, location.href);
  url.searchParams.set("lang", lang);
  return url.pathname.split("/").pop() + url.search + (hash ? "#" + hash : "");
}

function flatNav(nav) {
  const items = [];
  nav.forEach((item) => {
    if (item.children) item.children.forEach((c) => items.push(c));
    else items.push([item.href, item.label]);
  });
  return items;
}

function navItem(item) {
  const page = document.body.dataset.page;
  if (item.children) {
    const open = item.children.some(([href]) => href.replace(".html", "") === page);
    return `<div class="drop">
      <button class="nav-link ${open ? "active" : ""}" type="button">${item.label}</button>
      <div class="submenu">${item.children.map(([href, label]) => `<a href="${withLang(href)}">${label}</a>`).join("")}</div>
    </div>`;
  }
  const file = item.href.replace(".html", "");
  const active = page === file || (page === "home" && item.href === "index.html");
  return `<a class="${active ? "active" : ""}" href="${withLang(item.href)}">${item.label}</a>`;
}

function brandLogo() {
  return `<svg class="brand-logo" viewBox="0 0 90 96" role="img" aria-label="Fu Jen Catholic University emblem">
    <title>Fu Jen Catholic University</title>
    <g fill="#2f7a3a">
      <path d="M22 46c-11 14-9 32 6 42-8-14-6-24 3-32-8 1-10-4-9-10z"/>
      <path d="M18 54c-2 6 1 14 8 20-7-4-12-12-8-20z"/>
      <path d="M24 40c-6 8-5 18 2 26-8-6-9-16-2-26z"/>
      <path d="M68 46c11 14 9 32-6 42 8-14 6-24-3-32 8 1 10-4 9-10z"/>
      <path d="M72 54c2 6-1 14-8 20 7-4 12-12 8-20z"/>
      <path d="M66 40c6 8 5 18-2 26 8-6 9-16 2-26z"/>
    </g>
    <g fill="#f6ac00">
      <circle cx="45" cy="20" r="1.8"/>
      <circle cx="35" cy="22.5" r="1.6"/>
      <circle cx="55" cy="22.5" r="1.6"/>
      <circle cx="26.5" cy="28" r="1.5"/>
      <circle cx="63.5" cy="28" r="1.5"/>
      <circle cx="20" cy="36" r="1.4"/>
      <circle cx="70" cy="36" r="1.4"/>
      <circle cx="16.5" cy="46" r="1.3"/>
      <circle cx="73.5" cy="46" r="1.3"/>
      <circle cx="17" cy="57" r="1.2"/>
      <circle cx="73" cy="57" r="1.2"/>
      <circle cx="45" cy="16.5" r="1.5"/>
    </g>
    <path d="M45 6v11" stroke="#b71939" stroke-width="3.4" stroke-linecap="square"/>
    <path d="M39.5 10.2h11" stroke="#b71939" stroke-width="3.4" stroke-linecap="square"/>
    <path d="M29 36.5L45 26l16 10.5-4.2 26.5L45 73 33.2 63Z" fill="#00517d"/>
    <path d="M45 26l16 10.5-4.2 26.5L45 73Z" fill="#fff"/>
    <text x="37.4" y="54" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="Noto Serif TC, serif">輔</text>
    <text x="52.8" y="54" text-anchor="middle" font-size="12" font-weight="700" fill="#00517d" font-family="Noto Serif TC, serif">仁</text>
    <rect x="27" y="78" width="36" height="8" rx="1.5" fill="#b71939"/>
    <text x="45" y="83.8" text-anchor="middle" font-size="4.6" fill="#fff" font-family="Noto Serif TC, serif">真善美聖</text>
  </svg>`;
}

function fjcuCross() {
  return `<svg class="fjcu-cross-svg" viewBox="0 0 80 120" aria-hidden="true">
    <path d="M40 4v112" stroke="#b71939" stroke-width="16" stroke-linecap="square"/>
    <path d="M8 36h64" stroke="#b71939" stroke-width="16" stroke-linecap="square"/>
  </svg>`;
}

function layout(inner) {
  const lang = getLang();
  const t = I18N[lang];
  const page = document.body.dataset.page;
  return `
    <div class="site-notice">
      <div class="container">
        <p>${t.topNotice}</p>
        <a class="official-link" href="${t.officialUrl}" target="_blank" rel="noopener">${t.topOfficial}: ${t.officialUrl}</a>
      </div>
    </div>
    <header class="header">
      <div class="container header-brand">
        <a class="brand" href="${withLang("index.html")}">
          ${brandLogo()}
          <span class="brand-text">
            <em>Fu Jen Catholic University</em>
            <strong>${t.brandName}</strong>
          </span>
        </a>
        <div class="header-actions">
          <div class="lang-switch" role="group" aria-label="Language">
            <button type="button" class="${lang === "zh" ? "active" : ""}" data-lang="zh">中</button>
            <span>|</span>
            <button type="button" class="${lang === "en" ? "active" : ""}" data-lang="en">EN</button>
          </div>
          <button class="icon-btn" id="search-toggle" aria-label="${t.search}">⌕</button>
          <a class="btn btn-primary" href="${withLang("admissions.html")}">${t.applyEn}</a>
          <a class="btn btn-outline apply-zh" href="${withLang("admissions.html")}">${t.applyZh}</a>
          <button class="menu-btn" id="menu-toggle">${t.menu}</button>
        </div>
      </div>
      <nav class="nav-bar">
        <div class="container nav">${t.nav.map(navItem).join("")}</div>
      </nav>
      <nav class="mobile-nav container" id="mobile-nav">${flatNav(t.nav).map(([href, label]) => `<a href="${withLang(href)}">${label}</a>`).join("")}</nav>
      <div class="search-panel" id="search-panel">
        <input id="search-input" placeholder="${t.searchPlaceholder}">
        <div class="search-results" id="search-results"></div>
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
          <a href="https://www.management.fju.edu.tw/subweb/immba/" target="_blank" rel="noopener">${lang === "zh" ? "原站" : "Original site"}</a>
        </div>
      </div>
    </footer>`;
}

function render() {
  const lang = getLang();
  document.documentElement.lang = I18N[lang].htmlLang;
  const page = document.body.dataset.page;
  document.getElementById("app").innerHTML = layout(pageContent(page, lang));
  bind();
}

function bind() {
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
  const menu = document.getElementById("menu-toggle");
  const mobile = document.getElementById("mobile-nav");
  menu?.addEventListener("click", () => mobile.classList.toggle("open"));
  const panel = document.getElementById("search-panel");
  document.getElementById("search-toggle")?.addEventListener("click", () => {
    panel.classList.toggle("open");
    document.getElementById("search-input")?.focus();
  });
  document.getElementById("search-input")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const lang = getLang();
    const hits = [];
    flatNav(I18N[lang].nav).forEach(([href, label]) => {
      if (label.toLowerCase().includes(q) || href.includes(q)) hits.push([withLang(href), label]);
    });
    NEWS.forEach((n) => {
      if (n[lang].title.toLowerCase().includes(q)) hits.push([withLang("news.html") + "#" + n.id, n[lang].title]);
    });
    FACULTY.forEach((f) => {
      const name = lang === "zh" ? f.zhName : f.name;
      if (name.toLowerCase().includes(q) || f.spec[lang].toLowerCase().includes(q)) {
        hits.push([withLang("faculty.html"), name]);
      }
    });
    document.getElementById("search-results").innerHTML = q
      ? hits.slice(0, 8).map(([href, label]) => `<a href="${href}">${label}</a>`).join("") || `<p>${lang === "zh" ? "沒有符合的結果" : "No matches"}</p>`
      : "";
  });
  const form = document.getElementById("contact-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const body = encodeURIComponent(`${data.get("name")} <${data.get("email")}>\n\n${data.get("message")}`);
    location.href = `mailto:imMBA@mail.fju.edu.tw?subject=${encodeURIComponent(data.get("subject"))}&body=${body}`;
  });
}

window.addEventListener("hashchange", render);
document.addEventListener("DOMContentLoaded", render);
