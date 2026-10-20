function leaveSiteHint(zh) {
  return zh ? "另開分頁，將離開本示範網站" : "Opens in a new tab. You will leave this site.";
}

function extIcon() {
  return `<svg class="ext-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M7 3h6v6M13 3 7 9M4 5v8h8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>`;
}

function fileIcon() {
  return `<svg class="file-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 2h6l3 3v9H4zM10 2v3h3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="miter"/></svg>`;
}

function externalLink(href, label, zh) {
  const hint = leaveSiteHint(zh);
  return `<a class="ext-link" href="${href}" target="_blank" rel="noopener noreferrer" title="${hint}">${label}${extIcon()}<span class="sr-only"> (${hint})</span></a>`;
}

function resourceLink(href, title) {
  return `<a class="resource-link" href="${href}">${fileIcon()}<span>${title} <span class="file-type">PDF</span></span></a>`;
}

function actionLink(href, label, kind = "primary") {
  const cls = kind === "secondary" ? "btn btn-action-secondary" : "btn btn-action";
  if (!/^https?:/i.test(href)) return `<a class="${cls}" href="${href}">${label}</a>`;
  const zh = typeof getLang === "function" && getLang() === "zh";
  return `<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer" title="${leaveSiteHint(zh)}">${label}${extIcon()}<span class="sr-only"> (${leaveSiteHint(zh)})</span></a>`;
}

function externalCard(href, label, zh) {
  const host = href.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const hint = leaveSiteHint(zh);
  return `<a class="card ext-card" href="${href}" target="_blank" rel="noopener noreferrer">
    <h3>${label}${extIcon()}</h3>
    <p class="ext-hint">${hint}</p>
    <p class="muted">${host}</p>
  </a>`;
}

function pageContent(page, lang) {
  const zh = lang === "zh";
  const langQ = new URLSearchParams(location.search).get("lang");
  const q = langQ ? `?lang=${langQ}` : "";
  const textLink = (href, en, zhLabel) => {
    const file = href.replace(".html", "");
    const on = page === file;
    return `<a class="text-link${on ? " active" : ""}" href="${href}${q}"${on ? ' aria-current="page"' : ""}>${zh ? zhLabel : en}</a>`;
  };
  const programLinks = () => `
    <nav class="inpage-nav" aria-label="${zh ? "學程頁面" : "Program pages"}">
      ${textLink("admissions.html", "Admissions", "招生資訊")}
      ${textLink("faculty.html", "Faculty", "師資介紹")}
      ${textLink("dual-degree.html", "Dual Degree", "跨國雙碩士")}
    </nav>`;
  const newsSource = () =>
    `<p class="news-source">${I18N[lang].newsSource} · ${externalLink(I18N[lang].newsSourceUrl, zh ? "官方公告頁" : "Official news page", zh)}</p>`;
  const newsGlyph = (n) => {
    const id = String(n.id);
    if (id === "class-supabase") {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h16v3H4V5zm0 5h16v9H4v-9zm3 2v5h2v-5H7zm4 0v5h6v-5h-6z"/></svg>`;
    }
    if (id === "semester-kickoff") {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm13 8H4v10h16V10zM6 6v2h12V6H6z"/></svg>`;
    }
    if (id === "2905") {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3h6v3h5v15H4V6h5V3zm2 2v1h2V5h-2zM6 8v11h12V8H6z"/></svg>`;
    }
    if (id === "3417") {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.5 9h-3.1a15 15 0 0 0-1.4-5.2A8 8 0 0 1 19.5 11zM12 4a13 13 0 0 1 1.8 7H10.2A13 13 0 0 1 12 4zM4.5 13h3.1a15 15 0 0 0 1.4 5.2A8 8 0 0 1 4.5 13zm3.1-2H4.5A8 8 0 0 1 9 5.8 15 15 0 0 0 7.6 11zM12 20a13 13 0 0 1-1.8-7h3.6A13 13 0 0 1 12 20zm3-3.8A15 15 0 0 0 16.4 13h3.1A8 8 0 0 1 15 16.2z"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 10v4h2l6 4V6L5 10H3zm14.5 1.5a3.5 3.5 0 0 0 0-3l1.7-1a5.5 5.5 0 0 1 0 5l-1.7-1z"/></svg>`;
  };
  const newsList = (limit) =>
    getPublishedNews()
      .slice(0, limit || undefined)
      .map((n) => {
        const title = n.title[lang] || n.title.zh;
        const body = (n.content[lang] || n.content.zh || "").trim();
        const details = body
          ? `<a class="text-link" href="${withLang("news.html#" + n.id)}">${I18N[lang].viewDetails}</a>`
          : n.url
            ? externalLink(n.url, I18N[lang].viewDetails, zh)
            : "";
        return `<article class="news-card${typeof isPinnedNews === "function" && isPinnedNews(n.id) ? " pinned" : ""}">
          <span class="news-icon" aria-hidden="true">${newsGlyph(n)}</span>
          <time datetime="${n.date}">${n.date.replaceAll("-", "/")}</time>
          <h3>${escapeHtml(title)}</h3>
          ${details}
        </article>`;
      })
      .join("");

  const pages = {
    home: () => {
      const t = I18N[lang].home;
      return `
      <section class="hero">
        <div class="hero-media">
          <img src="assets/images/fju-campus.jpg" alt="${zh ? "輔仁大學野聲樓" : "Fu Jen Catholic University, Cardinal Yu Pin Administration Building"}">
          <div class="hero-cross" aria-hidden="true"><svg class="fjcu-cross-svg" viewBox="0 0 80 120" aria-hidden="true"><path d="M40 4v112" stroke="#f6ac00" stroke-width="14" stroke-linecap="square"/><path d="M8 36h64" stroke="#f6ac00" stroke-width="14" stroke-linecap="square"/></svg></div>
        </div>
        <div class="container hero-content">
          <span class="eyebrow">${t.eyebrow}</span>
          <h1>${t.title}</h1>
          <p class="lead">${t.lead}</p>
          <div class="hero-actions">
            ${actionLink(q ? "admissions.html" + q : "admissions.html", I18N[lang].apply)}
            ${actionLink(q ? "contact.html" + q : "contact.html", I18N[lang].contactAction, "secondary")}
          </div>
        </div>
      </section>
      <section class="section home-news">
        <div class="container">
          <div class="section-header">
            <div><span class="eyebrow">${t.eyebrowNews}</span><h2>${t.newsTitle}</h2></div>
            <a href="news.html${q}">${t.newsMore} →</a>
          </div>
          <div class="news-cards news-cards-home">${newsList(2)}</div>
          ${newsSource()}
        </div>
      </section>
      <div class="stats">${t.stats.map(([a, b]) => `<div class="stat"><b>${a}</b><span>${b}</span></div>`).join("")}</div>
      <section class="section">
        <div class="container">
          <div class="section-header"><div><span class="eyebrow">${t.eyebrowProgram}</span><h2>${t.whyTitle}</h2></div></div>
          <div class="grid-3">${t.why.map(([h, p]) => `<article class="card"><span class="eyebrow">imMBA</span><h3>${h}</h3><p>${p}</p></article>`).join("")}</div>
          ${programLinks()}
        </div>
      </section>
      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="section-header">
            <div><span class="eyebrow">${t.eyebrowLife}</span><h2>${t.galleryTitle}</h2></div>
            <a href="gallery.html">${t.galleryMore} →</a>
          </div>
          <div class="gallery-grid" style="grid-template-columns:1fr 1fr 1fr 1fr">
            ${GALLERY.slice(0, 4).map((item) => `<a href="gallery.html"><img src="${item.src}" alt="${item.alt[lang]}"></a>`).join("")}
          </div>
        </div>
      </section>
      <section class="section cta-band">
        <div class="container">
          <div><span class="eyebrow">${t.eyebrowAdmissions}</span><h2>${t.ctaTitle}</h2><p>${t.ctaText}</p></div>
          <div class="action-row">
            ${actionLink("admissions.html" + q, I18N[lang].apply)}
            ${actionLink("contact.html" + q, I18N[lang].contactAction, "secondary")}
          </div>
        </div>
      </section>`;
    },

    intro: () => `
      ${hero(zh ? "學程簡介" : "Intro", zh ? "輔仁大學國際經營管理碩士班" : "MBA in International Management at Fu Jen Catholic University")}
      <section class="section"><div class="container prose">
        <p>${zh
          ? "imMBA 為全英語授課、AACSB 認證之國際 MBA，強調國際視野、跨域整合與數位創新。學生可選擇兩年制輔大學位，或第一年在輔大、第二年赴美國、法國或西班牙攻讀雙碩士。"
          : "imMBA is an English-taught, AACSB-accredited international MBA focused on global outlook, cross-domain integration, and digital innovation. Students may complete two years at Fu Jen, or spend year two on a dual master's in the USA, France, or Spain."}</p>
        <p><a class="btn btn-outline" href="${q ? "about.html" + q : "about.html"}">${zh ? "學程概況與排名" : "Overview and Ranking"}</a></p>
      </div></section>`,

    marketplace: () => `
      ${hero(zh ? "教材與書籍市集" : "Books & Materials Marketplace", zh ? "課程示範用讀本與講義（非正式書店）" : "Course-demonstration readings and packs — not an official bookstore")}
      <section class="section"><div class="container">
        <div class="notice">${zh
          ? "本頁為課程示範內容，非正式販售。正式教材請依教師與圖書館公告。"
          : "This page is for the course demonstration only. It is not an official shop. Follow faculty and library notices for required texts."}</div>
        <div class="grid-3">${MATERIALS.map((m) => `
          <article class="card">
            <span class="eyebrow">${m.type[lang]}</span>
            <h3>${m.title[lang]}</h3>
            <p>${m.note[lang]}</p>
            ${m.title.en === "Thesis Format Guide" ? resourceLink("assets/docs/thesis-format-checklist.pdf", zh ? "論文格式檢核表（教學示範）" : "Thesis format checklist (teaching sample)") : ""}
            ${m.title.en === "Partner School Briefs" ? resourceLink("assets/docs/immba-curriculum-overview.pdf", zh ? "課程與修業一覽（教學示範）" : "Curriculum overview (teaching sample)") : ""}
          </article>`).join("")}</div>
      </div></section>`,

    about: () => `
      ${hero(zh ? "學程概況與排名" : "Overview and Ranking", zh ? "AACSB 認證的全英語國際 MBA" : "An AACSB-accredited, English-taught international MBA")}
      <section class="section"><div class="container">
        ${pagePhoto("assets/images/gallery/campus-cross.jpg", zh ? "輔仁大學校園十字架" : "Campus cross at Fu Jen Catholic University")}
        <div class="split">
        <div class="prose">
          <p>${zh
            ? "輔仁大學國際經營管理碩士班（imMBA）以全球觀點培養務實的商管能力，提升學生的國際移動力。課程協助學生理解行銷、營運、財務、人資、科技與策略如何在全球經濟中相互連結。"
            : "Fu Jen MBA in International Management (imMBA) equips students with practical business knowledge from a global perspective and strengthens international mobility. The curriculum shows how marketing, operations, finance, human resources, technology, and strategy are connected in the global economy."}</p>
          <p>${zh
            ? "僅約 5% 的商學院通過 AACSB 認證。依據 Eduniversal 2025，輔大 imMBA 在國際管理領域名列台灣前 3、遠東亞洲前 20。"
            : "Only about 5% of business schools worldwide hold AACSB accreditation. According to Eduniversal 2025, Fu Jen imMBA ranks Top 3 in Taiwan and Top 20 in Far East Asia in International Management."}</p>
        </div>
        <div class="grid-3" style="grid-template-columns:1fr">
          <article class="card"><span class="eyebrow">Eduniversal 2025</span><h3>${zh ? "台灣前 3 名" : "Top 3 in Taiwan"}</h3><p>${zh ? "國際管理領域（International Management）。" : "In the International Management category."}</p></article>
          <article class="card"><span class="eyebrow">Eduniversal 2025</span><h3>${zh ? "遠東亞洲前 20" : "Top 20 in Far East Asia"}</h3><p>${zh ? "同一排名類別中的區域表現。" : "Regional standing in the same ranking category."}</p></article>
          <article class="card"><span class="eyebrow">AACSB</span><h3>${zh ? "全球約 5% 商學院" : "About 5% of business schools"}</h3><p>${zh ? "取得 AACSB 認證，課程對接當代全球經濟挑戰。" : "Hold AACSB accreditation. The curriculum is built for current global-economy challenges."}</p></article>
        </div>
      </div>
      <div class="prose" id="regulations">
        <h2>${zh ? "本單位規定及辦法" : "Program regulations"}</h2>
        <p>${zh
          ? "修業、抵免、英語門檻與畢業離校，一律依學生入學年度之版本辦理。課程結構與離校流程見相關頁面；正式辦法以學程辦公室、教務處與管理學院公告為準。"
          : "Study rules, course waivers, the English requirement, and leaving-school procedures follow the version in force for a student’s year of entry. Credit structure and the graduation process are outlined on the linked pages. Official regulations are those issued by the program office, the Office of Academic Affairs, and the College of Management."}</p>
        <p><a href="curriculum.html${q}">${zh ? "課程與修業規則" : "Curriculum and requirements"}</a> · <a href="graduation.html${q}">${zh ? "畢業與離校" : "Graduation"}</a></p>
      </div>
      </div></section>`,

    "learning-environment": () => `
      ${hero(zh ? "學習環境" : "Our Learning Environment", zh ? "國際化教室、雙碩士與全球交換" : "An international classroom, dual degrees, and global exchange")}
      <section class="section"><div class="container">
        ${pagePhoto("assets/images/gallery/classroom.jpg", zh ? "imMBA 課堂" : "imMBA classroom")}
        <div class="grid-3">
          <article class="card"><h3>${zh ? "國際化教室" : "International classroom"}</h3><p>${zh ? "學位生與交換生來自 30 餘國，課堂本地與非本地比例可接近 1:1，讓日常討論即是跨文化協作。" : "Degree-seeking and exchange students come from 30+ countries. Local to non-local ratios can approach 1:1, so seminar discussion is already cross-cultural work."}</p></article>
          <article class="card"><h3>${textLink("dual-degree.html", "Dual Degree", "跨國雙碩士")}</h3><p>${zh ? "與美國 UM-Flint、法國 KEDGE、西班牙 IQS 合作，第一年在輔大、第二年出國，兩年取得兩碩士。" : "Partners in the USA, France, and Spain. Year one at Fu Jen and year two abroad, with two master's degrees if both requirements are met."}</p></article>
          <article class="card"><h3>${zh ? "免學費交換" : "Tuition-free exchange"}</h3><p>${zh ? "未走雙碩士者，可申請輔大全球姊妹校免學費交換，拓展國際視野與跨文化經驗。" : "Students not on a dual-degree track are encouraged to join Fu Jen’s global tuition-free exchange for international and cross-cultural experience."}</p></article>
        </div>
        <div class="prose" style="margin-top:48px">
          <p>${zh
            ? "imMBA 全英語授課，結合行銷、營運、財務、人資、科技與策略，並透過課堂組成與出國路徑，讓「國際化」成為日常學習環境，而不只是選修體驗。"
            : "imMBA is taught entirely in English and connects marketing, operations, finance, HR, technology, and strategy. Cohort mix and mobility options make internationalisation the everyday classroom, not an optional extra."}</p>
        </div>
      </div></section>`,

    admissions: () => `
      ${hero(zh ? "招生資訊" : "Admissions", zh ? "本地生與國際生雙軌申請" : "Local and international tracks")}
      <section class="section"><div class="container prose">
        ${pagePhoto("assets/images/gallery/students-ice-cream.jpg", zh ? "imMBA 學生活動" : "imMBA students on campus")}
        <div class="notice">${zh
          ? "所有課程以英語進行。學位選擇：兩年制輔大 imMBA；或第一年在輔大、第二年赴合作校之雙碩士。"
          : "All courses are taught in English. Options: the two-year Fu Jen imMBA, or a dual master's (M1 at FJCU, M2 abroad)."}</div>
        <h2>${zh ? "國際生" : "International students"}</h2>
        <p>${zh ? "提供春季與秋季入學。春季約 10 月中至 12 月底；秋季約 1 月至 6 月。此國際生管道僅供國際學生。" : "Spring and fall intake. Spring applications are typically mid-October to late December; fall from January to June. This track is for international students only."}</p>
        <p><strong>Spring 2027：</strong> ${zh ? "2026/09/14–10/14" : "14 Sep–14 Oct 2026"}</p>
        <div class="action-row">
          ${actionLink("http://idsasys.oie.fju.edu.tw/", I18N[lang].apply)}
          ${actionLink("contact.html" + q, I18N[lang].contactAction, "secondary")}
        </div>
        <p>${zh ? "線上申請系統：" : "Application system:"} ${externalLink("http://idsasys.oie.fju.edu.tw/", zh ? "輔大國際生申請系統" : "FJCU international application system", zh)}</p>
        <p>${resourceLink("assets/docs/immba-admissions-guide.pdf", zh ? "imMBA 招生說明（教學示範）" : "imMBA admissions guide (teaching sample)")}</p>
        <h3>${zh ? "繳交文件" : "Required documents"}</h3>
        <ul>
          <li>${zh ? "英文自傳" : "Autobiography (English)"}</li>
          <li>${zh ? "英文讀書計畫" : "Study plan (English)"}</li>
          <li>${zh ? "英語能力證明（TOEFL / IELTS / TOEIC；建議 CEFR B2）" : "English proficiency (TOEFL, IELTS, or TOEIC; CEFR B2 preferred)"}</li>
          <li>${zh ? "兩封推薦信" : "Two recommendation letters"}</li>
          <li>${zh ? "其他有助審查之資料" : "Other supporting materials"}</li>
        </ul>
        <h3 id="scholarships">${zh ? "學雜費與獎學金（國際生）" : "Tuition and scholarships (international)"}</h3>
        ${pagePhoto("assets/images/gallery/centennial-celebration.jpg", zh ? "輔仁大學百年慶祝" : "Fu Jen centennial celebration")}
        <ul>
          <li>${zh ? "學雜費每學期 NT$123,000。" : "Tuition and miscellaneous fees: NT$123,000 per semester."}</li>
          <li>${zh ? "領有政府獎學金或輔大新生獎學金者，可適用本地生學雜費 NT$68,660／學期。" : "Holders of government or FJCU new-international-student scholarships may pay the local rate of NT$68,660 per semester."}</li>
          <li>${zh ? "英語達 CEFR B2（成績兩年內有效）可獲校長獎學金每學期 NT$40,600，至多四學期。" : "CEFR B2 (scores valid within two years) may receive the President Scholarship of NT$40,600 per semester, up to four semesters."}</li>
        </ul>
        <h2>${zh ? "本地生" : "Local applicants"}</h2>
        <p>${zh ? "碩士班每年約 10 月（甄試）與 1 月招生；五年一貫與國際行銷微學程每年 5 月申請。116 甄試報名：2026/09/30–10/13。" : "Master's admissions are typically in October (screening) and January. The 5-year pathway and International Marketing micro-program usually open in May. 2027 screening: 30 Sep–13 Oct 2026."}</p>
        <p>${zh ? "完整簡章請見學院招生系統與辦公室公告。" : "Please follow the College admissions system and office notices for the official brochure."}</p>
      </div></section>`,

    curriculum: () => `
      ${hero(zh ? "課程資訊" : "Curriculum", zh ? "最低 42 學分，含論文" : "42 credits, including thesis")}
      <section class="section"><div class="container">
        ${pagePhoto("assets/images/gallery/tech-exhibition.jpg", zh ? "imMBA 科技與產業參訪" : "imMBA technology exhibition visit")}
        <div class="split">
        <div class="prose">
          <h2 id="structure">${zh ? "畢業學分結構" : "Credit structure"}</h2>
          ${pagePhoto("assets/images/gallery/research-display.jpg", zh ? "研究成果展示" : "Student research display")}
          <ul>
            <li>${zh ? "必修 23 學分：絕對必修 11 學分（含論文 6 學分）＋選必修 12 學分" : "23 required credits: 11 absolutely required (including 6-credit thesis) + 12 optionally required"}</li>
            <li>${zh ? "選修 19 學分" : "19 elective credits"}</li>
            <li>${zh ? "完成論文口試；最低 42 學分" : "Pass the thesis defense; minimum 42 credits"}</li>
          </ul>
          <h2>${zh ? "先修與抵免" : "Prerequisites and waivers"}</h2>
          <p>${zh ? "經濟學、企業管理、統計、會計為先修。非商學背景須於入學第一學期結束前通過其中一門（不計入畢業學分）。研究所層級抵免僅有一次機會，須於開學第一週前提出，由主任核定。" : "Economics, Business Management, Statistics, and Accounting are prerequisites. Non-business majors must pass one of these by the end of the first semester (not counted toward graduation). Postgraduate waivers may be requested only once, in the first week of class, subject to the chair’s approval."}</p>
          <h2>${zh ? "論文" : "Thesis"}</h2>
          <p>${zh ? "辦公室於每年 3 月底與 10 月初公布指導教授名單。預計口試當學期須在加退選截止前加選「論文」。" : "Advisor lists are released in late March and early October. Enrol in THESIS before the add/drop deadline in the semester you intend to defend."}</p>
        </div>
        <aside class="card">
          <span class="eyebrow">English</span>
          <h3>${zh ? "英語門檻" : "English requirement"}</h3>
          <p>TOEIC 785 / TOEFL iBT 72 / IELTS 6.0 / OPT 61</p>
          <p>${zh ? "成績須於畢業前兩年內有效。未達標者須依規定補測並修習加強課程（不計畢業學分）。特定英語系國家全日制學位得申請免試。" : "Scores are valid within two years before graduation. Students below the standard follow the office’s make-up and enhancement-course rules (not graduation credits). Waivers may apply after full-time study in designated English-speaking countries."}</p>
          <p>${resourceLink("assets/docs/immba-curriculum-overview.pdf", zh ? "課程與修業一覽（教學示範）" : "Curriculum overview (teaching sample)")}</p>
        </aside>
        </div>
      </div></section>`,

    faculty: () => `
      ${hero(zh ? "師資介紹" : "Faculty", zh ? "專任與兼任教師" : "Full-time and adjunct faculty")}
      <section class="section"><div class="container">
        <div id="faculty-list" class="faculty-list"><p class="muted">${zh ? "載入師資…" : "Loading faculty…"}</p></div>
      </div></section>`,

    guide: () => `
      ${hero(zh ? "imMBA 全攻略" : "Student guide", zh ? "從入學到出國的實用路徑" : "From arrival to mobility")}
      <section class="section"><div class="container timeline">
        ${[
          [zh ? "入學前" : "Before you arrive", zh ? "確認申請管道、英語成績、先修科目與抵免時限。國際生走國際處系統；本地生見甄試／考試簡章。" : "Confirm your track, English scores, prerequisites, and waiver deadlines. International students use the OIE system; local students follow the screening/exam brochure."],
          [zh ? "第一學期" : "Semester 1", zh ? "完成選課與先修。若計劃雙碩士，須於開學第一週向辦公室提出意向並依合約選課。" : "Register courses and finish prerequisites. Dual-degree applicants must declare in week one and follow the partner contract."],
          [zh ? "論文與指導教授" : "Thesis advisor", zh ? "等待 3 月／9–10 月名單再選定指導教授，勿錯過加選論文期限。" : "Wait for the March / September–October list, then enrol in THESIS before add/drop."],
          [zh ? "出國年" : "Year abroad", zh ? "雙碩士生赴合作校並同時完成輔大註冊繳費；交換生則走國際學生中心時程。" : "Dual-degree students study at the partner school while remaining registered at Fu Jen. Exchange students follow ISC procedures."],
          [zh ? "畢業" : "Graduation", zh ? "依入學年度版本完成學分、英語、口試與離校手續。" : "Meet the credit, English, defense, and leaving-school rules for your enrolment year."]
        ].map(([h, p]) => `<article><h3>${h}</h3><p>${p}</p></article>`).join("")}
      </div></section>`,

    graduation: () => `
      ${hero(zh ? "畢業與離校" : "Graduation", zh ? "請依入學年度版本辦理" : "Follow the rules for your cohort")}
      <section class="section"><div class="container prose">
        <p>${zh ? "畢業條件請閱讀適用您入學年度之版本（自 2014 秋至 2025 秋均有對應規定）。" : "Read the graduation-requirement version that matches your enrolment year (cohorts from fall 2014 through fall 2025)."}</p>
        <ul>
          <li>${zh ? "指導教授名單：每年 3 月底與 9 月公布。" : "Advisor lists: late March and September."}</li>
          <li>${zh ? "預計口試當學期須加選「論文」。" : "Enrol in THESIS in the semester you plan to defend."}</li>
          <li>${zh ? "口試與離校文件含論文格式、口試同意書、論文口試通過證明等，請向辦公室索取最新表格。" : "Defense and leaving-school forms (format, defense agreement, acceptance) are issued by the office."}</li>
          <li>${zh ? "圖書館提供論文資源與格式支援。" : "FJCU Library provides thesis resources and formatting support."}</li>
        </ul>
        <div class="notice">${zh ? "本站提供流程說明；正式表格與學則以學程辦公室與教務處公告為準。" : "This site outlines the process. Official forms and regulations are those issued by the program office and academic affairs."}</div>
        <p>${resourceLink("assets/docs/thesis-format-checklist.pdf", zh ? "論文格式檢核表（教學示範）" : "Thesis format checklist (teaching sample)")}</p>
      </div></section>`,

    "dual-degree": () => `
      ${hero(zh ? "跨國雙碩士" : "Dual master's degrees", zh ? "第一年輔大，第二年出國" : "Year one at Fu Jen, year two abroad")}
      <section class="section"><div class="container">
        <div class="prose" style="max-width:none">
          <p>${zh ? "學生可選擇兩年制 imMBA，或赴 UM-Flint（美國）、KEDGE（法國）、IQS（西班牙）攻讀雙碩士。須同時滿足兩校畢業條件。名額有限，合作校握有最終錄取權。" : "Students may complete the two-year imMBA or pursue a dual master's at UM-Flint (USA), KEDGE (France), or IQS (Spain). Both institutions’ requirements must be met. Seats are limited; partners make the final admission decision."}</p>
        </div>
        <div class="timeline" style="margin:36px 0">
          ${[
            ["Fall · Phase 1", zh ? "開學第一週提出雙碩士申請；依合約選課；確認指導教授並開始論文。" : "Declare in week one; follow the contract for courses; confirm an advisor and start the thesis."],
            ["Spring · Phase 2", zh ? "完成論文前三章發表；繳交合約規定文件（含英語證明）；期末繳交口試同意書；可申請學程獎學金。" : "Three-chapter presentation; submit contract documents including English proof; defense agreement in finals week; optional imMBA scholarship."],
            ["Fall · Phase 3", zh ? "輔大完成註冊並繳全額學雜費；於合作校修課並繳費（依各校合約）；學期初繳交修課清單。" : "Register and pay full Fu Jen tuition; study (and pay, if required) at the partner; submit the course list."],
            ["Spring · Phase 4", zh ? "持續兩校註冊；完成合作校課程與 imMBA 畢業條件後，回輔大口試並辦理畢業。" : "Remain registered at both; finish partner courses and imMBA requirements, then defend at Fu Jen."]
          ].map(([h, p]) => `<article><h3>${h}</h3><p>${p}</p></article>`).join("")}
        </div>
        <div class="grid-3">
          <article class="partner-card">
            <img src="https://images.unsplash.com/photo-1485738422979-f5c462d49f19?auto=format&fit=crop&w=1200&q=80" alt="United States">
            <div><span class="eyebrow">USA</span><h3>University of Michigan-Flint</h3><p>${zh ? "AACSB。MBA，九個專長領域。第一年 GPA 3.0 並完成合約課程與論文。提供 in-state 學費與獎學金。" : "AACSB MBA with nine concentrations. Year-one GPA 3.0 plus contracted courses and thesis. In-state tuition and scholarships may apply."}</p></div>
          </article>
          <article class="partner-card">
            <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80" alt="France">
            <div><span class="eyebrow">France</span><h3>KEDGE Business School</h3><p>${zh ? "三重認證（AACSB、AMBA、EQUIS）。Master in Management（60 ECTS），另須至少 6 個月實習。學士須至少 240 ECTS。在 KEDGE 免學費，輔大繳全額。" : "Triple crown (AACSB, AMBA, EQUIS). Master in Management (60 ECTS) plus at least six months of internship. 240 ECTS at bachelor level. Study at KEDGE is tuition-free; pay full Fu Jen tuition."}</p></div>
          </article>
          <article class="partner-card">
            <img src="https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80" alt="Barcelona">
            <div><span class="eyebrow">Spain</span><h3>IQS School of Management</h3><p>${zh ? "巴塞隆納，AACSB。可選數位環境國際行銷碩士（MIMDE）或工業經營碩士（MIBM）。學費依年度合約。" : "Barcelona, AACSB. Pathways: Master in International Marketing in a Digital Environment (MIMDE) or Master in Industrial Business Management (MIBM). Fees follow the annual agreement."}</p></div>
          </article>
        </div>
        <p class="muted" style="margin-top:24px">${zh ? "未依時程完成視同放棄，可自第一學期重新申請。超額時依新生身份、學業表現與英語能力排序。" : "Missing the schedule means withdrawing; students may reapply from phase 1. If demand exceeds seats, the chair ranks first-year status, academic performance, and English."}</p>
      </div></section>`,

    exchange: () => `
      ${hero(zh ? "海外交換" : "Exchange", zh ? "全球姊妹校免學費交換" : "Tuition-free exchange worldwide")}
      <section class="section"><div class="container prose">
        <p>${zh ? "輔大擁有豐富的國際學術網絡與免學費交換名額。未選擇雙碩士的 imMBA 學生，特別鼓勵透過交換拓展國際視野與跨文化經驗。" : "Fu Jen maintains a wide academic network and a tuition-free exchange programme. imMBA students who are not on a dual-degree track are encouraged to use it for international and cross-cultural experience."}</p>
        <p>${zh ? "申請程序、資格、截止日期與學校名單，請至輔仁大學國際學生中心（ISC）查詢。" : "Procedures, requirements, deadlines, and partner lists are published by the Fu Jen International Student Center."}</p>
        <p>${externalLink("https://www.oie.fju.edu.tw/", zh ? "輔仁大學國際處／國際學生中心" : "Fu Jen Office of International Education", zh)}</p>
      </div></section>`,

    gallery: () => `
      ${hero(zh ? "活動集錦" : "Events", zh ? "課堂、交流與校園活動" : "Classes, exchanges, and campus events")}
      <section class="section"><div class="container">
        <div class="gallery-grid">${GALLERY.map((item) => `<a href="${item.src}" target="_blank" rel="noopener"><img src="${item.src}" alt="${item.alt[lang]}"></a>`).join("")}</div>
        <p class="muted" style="margin-top:20px">${zh ? "相片來自學程課堂、校園與交流活動。" : "Photos from classes, campus, and programme outings."}</p>
      </div></section>`,

    news: () => {
      const hash = location.hash.replace("#", "");
      const item = hash ? getNewsById(hash) : null;
      if (item && item.status === "published") {
        const title = item.title[lang] || item.title.zh;
        const body = formatNewsContent(item.content[lang] || item.content.zh);
        return `${hero(escapeHtml(title), item.date)}
          <section class="section"><div class="container prose">
            ${item.image ? `<figure class="news-article-image"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(title)}"></figure>` : ""}
            ${body || `<p class="muted">${zh ? "此則公告尚未填入內文。" : "No article body has been added yet."}</p>`}
            ${item.url ? `<p>${externalLink(item.url, zh ? "官方原文" : "Official article", zh)}</p>` : ""}
            <p><a href="${withLang("news.html")}">${zh ? "← 返回公告列表" : "← Back to announcements"}</a></p>
          </div></section>`;
      }
      return `${hero(zh ? "最新公告" : "Announcements", zh ? "招生、課程與學程動態" : "Admissions, courses, and programme notes")}
        <section class="section"><div class="container">
          <div class="news-cards">${newsList()}</div>
          ${newsSource()}
        </div></section>`;
    },

    contact: () => `
      ${hero(zh ? "聯絡我們" : "Contact", zh ? "我們會盡快回覆來信" : "Email us and we will reply as soon as we can")}
      <section class="section"><div class="container contact-grid">
        <div>
          <h2 style="font-family:var(--serif)">${zh ? "辦公室" : "Office"}</h2>
          <p>${I18N[lang].address}</p>
          <p>${I18N[lang].tel}</p>
          <p><a href="mailto:imMBA@mail.fju.edu.tw">imMBA@mail.fju.edu.tw</a></p>
          <p>${externalLink("https://www.management.fju.edu.tw/", zh ? "輔仁大學管理學院" : "College of Management, Fu Jen Catholic University", zh)}</p>
        </div>
        <form id="contact-form">
          <label>${zh ? "姓名" : "Name"}<input name="name" required></label>
          <label>${zh ? "電子郵件" : "Email"}<input type="email" name="email" required></label>
          <label>${zh ? "主旨" : "Subject"}
            <select name="subject">
              <option>${zh ? "招生諮詢" : "Admissions"}</option>
              <option>${zh ? "課程與選課" : "Curriculum"}</option>
              <option>${zh ? "雙碩士／交換" : "Dual degree / exchange"}</option>
              <option>${zh ? "其他" : "Other"}</option>
            </select>
          </label>
          <label>${zh ? "內容" : "Message"}<textarea name="message" rows="6" required></textarea></label>
          <button class="btn btn-action" type="submit">${I18N[lang].submit}</button>
        </form>
      </div></section>`,

    links: () => `
      ${hero(zh ? "相關連結" : "Related links", zh ? "站內頁面與外部資源" : "Pages on this site and external resources")}
      <section class="section"><div class="container">
        <div class="section-header"><div><span class="eyebrow">${zh ? "站內" : "On this site"}</span><h2>${zh ? "內部連結" : "Internal links"}</h2></div></div>
        ${programLinks()}
        <div class="section-header" style="margin-top:56px"><div><span class="eyebrow">${zh ? "站外" : "Off this site"}</span><h2>${zh ? "外部連結" : "External links"}</h2></div></div>
        <p class="muted">${zh ? "下列連結會另開分頁並離開本示範網站。" : "These links open in a new tab and take you away from this teaching site."}</p>
        <div class="grid-3">
        ${[
          ["https://www.fju.edu.tw/", zh ? "輔仁大學全球資訊網" : "Fu Jen Catholic University"],
          ["https://www.management.fju.edu.tw/", zh ? "輔仁大學管理學院" : "College of Management, FJCU"],
          ["http://idsasys.oie.fju.edu.tw/", zh ? "輔大國際生申請系統" : "FJCU international application system"],
          ["https://www.oie.fju.edu.tw/", zh ? "輔仁大學國際處" : "Office of International Education"],
          ["https://www.aacsb.edu/", "AACSB"],
          ["https://www.management.fju.edu.tw/subweb/immba/", zh ? "imMBA 正式官網" : "Official imMBA website"]
        ].map(([href, label]) => externalCard(href, label, zh)).join("")}
        </div>
        <div class="section-header" style="margin-top:56px"><div><span class="eyebrow">${zh ? "文件" : "Documents"}</span><h2>${zh ? "資源連結" : "Resource links"}</h2></div></div>
        <ul class="resource-list">
          <li>${resourceLink("assets/docs/immba-admissions-guide.pdf", zh ? "imMBA 招生說明（教學示範）" : "imMBA admissions guide (teaching sample)")}</li>
          <li>${resourceLink("assets/docs/immba-curriculum-overview.pdf", zh ? "課程與修業一覽（教學示範）" : "Curriculum overview (teaching sample)")}</li>
          <li>${resourceLink("assets/docs/thesis-format-checklist.pdf", zh ? "論文格式檢核表（教學示範）" : "Thesis format checklist (teaching sample)")}</li>
        </ul>
      </div></section>`
  };

  return (pages[page] || pages.home)();
}

function facultyRowHtml(f, lang) {
  const zh = lang === "zh";
  const name = typeof facultyLangText === "function" ? facultyLangText(f.name, lang) : f.name;
  const title = typeof facultyLangText === "function" ? facultyLangText(f.title, lang) : f.title;
  const education = typeof facultyLangText === "function" ? facultyLangText(f.education, lang) : f.education;
  const research = typeof facultyLangText === "function" ? facultyLangText(f.research_fields, lang) : f.research_fields;
  const photo = f.image_url || "";
  return `<article class="faculty-row">
    <figure class="faculty-photo-wrap">
      ${photo ? `<img class="faculty-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(name)}">` : `<div class="faculty-photo faculty-photo-empty" aria-hidden="true"></div>`}
    </figure>
    <div class="faculty-details">
      <h3>${escapeHtml(name)}</h3>
      <p class="role">${escapeHtml(title)}</p>
      <p>${escapeHtml(education)}</p>
      <p>${escapeHtml(research)}</p>
      <p class="muted">${escapeHtml(f.phone || "—")}${f.email ? `<br><a href="mailto:${escapeHtml(f.email)}">${escapeHtml(f.email)}</a>` : ""}${f.website ? `<br>${externalLink(f.website, zh ? `${name}教師網頁` : `${name} faculty page`, zh)}` : ""}</p>
    </div>
  </article>`;
}

function facultySectionHtml(records, lang, category) {
  const zh = lang === "zh";
  const title = category === "Adjunct" ? (zh ? "兼任教師" : "Adjunct") : (zh ? "專任教師" : "Full-time");
  if (!records.length) return "";
  return `<section class="faculty-section">
    <div class="section-header"><div><span class="eyebrow">faculty</span><h2>${title}</h2></div></div>
    <div class="faculty-section-grid">${records.map((item) => facultyRowHtml(item, lang)).join("")}</div>
  </section>`;
}

async function bindFacultyPage() {
  const root = document.getElementById("faculty-list");
  if (!root || typeof listPublishedFaculty !== "function") return;
  const lang = getLang();
  const zh = lang === "zh";
  try {
    const records = await listPublishedFaculty();
    const fullTime = records.filter((item) => item.category !== "Adjunct");
    const adjunct = records.filter((item) => item.category === "Adjunct");
    root.innerHTML = records.length
      ? facultySectionHtml(fullTime, lang, "Full-time") + facultySectionHtml(adjunct, lang, "Adjunct")
      : `<p class="muted">${zh ? "目前沒有已發布的師資。" : "No published faculty yet."}</p>`;
  } catch (err) {
    root.innerHTML = `<p class="muted">${zh ? "師資資料載入失敗。" : "Could not load faculty."}</p>`;
  }
}

function hero(title, subtitle) {
  return `<section class="page-hero"><div class="container">
    <p class="breadcrumbs">imMBA</p>
    <h1>${title}</h1>
    <p class="lead muted">${subtitle || ""}</p>
  </div></section>`;
}

function pagePhoto(src, alt) {
  return `<figure class="page-photo"><img src="${src}" alt="${alt}"></figure>`;
}
