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
  const star = "0,-2.15 .62,-.66 2.15,-.66 .86,.28 1.32,1.82 0,.86 -1.32,1.82 -.86,.28 -2.15,-.66 -.62,-.66";
  const stars = [
    [41.5, 12.4], [58.5, 12.4], [33.4, 17.6], [66.6, 17.6],
    [26.6, 25.2], [73.4, 25.2], [21.8, 34.4], [78.2, 34.4],
    [19.6, 44.2], [80.4, 44.2], [21.2, 53.6], [78.8, 53.6]
  ];
  const leaf = (x, y, rot, s = 1) =>
    `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0 C2.2-3.4 6.4-3.6 8.2-.4 C5.2 1.5 2.2 1.4 0 0Z"/>`;
  const left = [
    [24, 92, -20], [18, 84, -40], [15, 75, -58], [14, 66, -72], [15, 57, -84],
    [18, 48, -98], [22, 40, -112], [28, 33, -128], [35, 27, -145], [43, 23, -162]
  ];
  const right = left.map(([x, y, rot]) => [100 - x, y, 180 - rot]);
  return `<svg class="brand-logo" viewBox="0 0 100 118" role="img" aria-label="Fu Jen Catholic University emblem">
    <title>Fu Jen Catholic University</title>
    <g fill="#1f7a34">${[...left, ...right].map(([x, y, rot]) => leaf(x, y, rot)).join("")}</g>
    <g fill="#f6ac00">${stars.map(([x, y]) => `<polygon points="${star}" transform="translate(${x} ${y})"/>`).join("")}</g>
    <path d="M50 6.5v28" stroke="#b71939" stroke-width="4.4" stroke-linecap="square"/>
    <path d="M41.4 15.2h17.2" stroke="#b71939" stroke-width="4.4" stroke-linecap="square"/>
    <path d="M32 44h18v42C42 78 32 68 32 56Z" fill="#00517d"/>
    <path d="M50 44h18v12c0 12-8 22-18 30V44Z" fill="#fff"/>
    <path d="M32 44h36v12c0 14-8 26-18 34-10-8-18-20-18-34V44Z" fill="none" stroke="#00517d" stroke-width="1.15"/>
    <text x="41" y="67" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Noto Serif TC, PMingLiU, serif">輔</text>
    <text x="59" y="67" text-anchor="middle" font-size="13" font-weight="700" fill="#00517d" font-family="Noto Serif TC, PMingLiU, serif">仁</text>
    <path d="M26 98c8-3.2 40-3.2 48 0l3.2 6.4c-9-2.4-42-2.4-51.2 0L26 98Z" fill="#b71939"/>
    <path d="M24 99.2 29.2 96.6v8.8L24 108.2l1.8-4.5Z" fill="#b71939"/>
    <path d="M76 99.2 70.8 96.6v8.8L76 108.2l-1.8-4.5Z" fill="#b71939"/>
    <text x="50" y="104.4" text-anchor="middle" font-size="4.8" fill="#fff" font-family="Noto Serif TC, PMingLiU, serif" letter-spacing="1.2">真善美聖</text>
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
