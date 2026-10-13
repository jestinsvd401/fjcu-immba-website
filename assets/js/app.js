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

function flatNav(nav) {
  const items = [];
  nav.forEach((item) => {
    if (item.children) item.children.forEach((c) => items.push(c));
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

function navItem(item) {
  const page = document.body.dataset.page;
  if (item.children) {
    const open = item.children.some(([href]) => pageFile(href) === page);
    const parentHref = item.href || item.children[0][0].split("#")[0];
    return `<div class="drop">
      <a class="nav-link ${open ? "active" : ""}" href="${withLang(parentHref)}">${item.label}</a>
      <div class="submenu">${item.children.map(([href, label]) => `<a href="${withLang(href)}">${label}</a>`).join("")}</div>
    </div>`;
  }
  const active = linkActive(item.href, page);
  return `<a class="${active ? "active" : ""}" href="${withLang(item.href)}">${item.label}</a>`;
}

function mobileItem(item) {
  if (!item.children) return `<a href="${withLang(item.href)}">${item.label}</a>`;
  return `<div class="mobile-group"><span>${item.label}</span>${item.children.map(([href, label]) => `<a href="${withLang(href)}">${label}</a>`).join("")}</div>`;
}

function brandLogo() {
  return `<img class="brand-logo" src="assets/images/immba-logo.png" width="88" height="88" alt="Fu Jen Catholic University imMBA Program">`;
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
    <header class="header">
      <div class="site-notice">
        <div class="container notice-row">
          <p class="notice-copy">${t.topNotice} <a class="official-link ext-link" href="${t.officialUrl}" target="_blank" rel="noopener noreferrer" title="${leaveSiteHint(lang === "zh")}">${t.topOfficial}${extIcon()}<span class="sr-only"> (${leaveSiteHint(lang === "zh")})</span></a></p>
          <div class="notice-actions">
            <button class="lang-switch" id="lang-switch" type="button">${lang === "en" ? "中文版" : "English"}</button>
            <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="true" aria-controls="notice-nav">${t.menuHide}</button>
          </div>
        </div>
        <nav class="notice-nav" id="notice-nav">
          <div class="container nav">
            ${t.nav.map(navItem).join("")}
            <div class="nav-apply">
              <a class="btn btn-action" href="${withLang("admissions.html")}">${t.apply}</a>
            </div>
          </div>
        </nav>
      </div>
      <div class="container header-brand">
        <a class="brand" href="${withLang("index.html")}">
          ${brandLogo()}
          <span class="brand-text">
            <em>${t.brandSchool}</em>
            <strong>${t.brandName}</strong>
          </span>
        </a>
        <div class="header-actions">
          <a class="btn btn-action-secondary" href="${withLang("contact.html")}">${t.contactAction}</a>
          <button class="icon-btn" id="search-toggle" aria-label="${t.search}">⌕</button>
        </div>
      </div>
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
          ${externalLink("https://www.management.fju.edu.tw/subweb/immba/", lang === "zh" ? "imMBA 正式官網" : "Official imMBA website", lang === "zh")}
        </div>
      </div>
    </footer>`;
}

function render() {
  const lang = getLang();
  document.documentElement.lang = I18N[lang].htmlLang;
  document.title = I18N[lang].pageTitle;
  const page = document.body.dataset.page;
  document.getElementById("app").innerHTML = layout(pageContent(page, lang));
  bind();
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
  applyNavState(sessionStorage.getItem("immba-nav-collapsed") === "1");
  toggle?.addEventListener("click", () => applyNavState(!notice.classList.contains("is-collapsed")));
  document.getElementById("lang-switch")?.addEventListener("click", () => {
    setLang(getLang() === "en" ? "zh" : "en");
  });
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
