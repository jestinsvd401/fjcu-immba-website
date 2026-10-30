function adminCopy(lang) {
  const zh = lang === "zh";
  return {
    eyebrow: zh ? "後台" : "Back office",
    title: zh ? "公告管理" : "AdminNews",
    lead: zh ? "一則公告同時保存中文與英文。公開網站只顯示已發布項目。" : "One announcement holds Chinese and English in the same record. The public site shows published items only.",
    tabNews: zh ? "公告管理" : "News",
    tabFaculty: zh ? "師資管理" : "Faculty",
    tabAlumni: zh ? "校友管理" : "Alumni",
    tabAccess: zh ? "管理員核准" : "Approval",
    alumniTitle: zh ? "校友後台" : "Alumni management",
    alumniLead: zh ? "支援新增、編輯、刪除、搜尋、篩選與檢視活動紀錄。每次 Create、Update、Delete 都會寫入稽核紀錄。" : "Supports Add, Edit, Delete, Search, Filter, and View activity history. Every Create, Update, and Delete action generates an audit record.",
    addAlumni: zh ? "新增" : "Add",
    viewActivity: zh ? "檢視活動紀錄" : "View activity history",
    alumniRequire: zh ? "每次 Create、Update、Delete 都會產生稽核紀錄。" : "Every Create, Update, and Delete action generates an audit record.",
    columns: zh ? "欄位" : "Columns",
    importAlumni: zh ? "批次匯入 CSV" : "Import CSV",
    importValidate: zh ? "匯入前會先檢查必填欄位、空白列、學位值、欄位名稱、重複資料與編碼。" : "Validate before importing: required fields, empty rows, degree-program values, column names, duplicates, and encoding.",
    importBlocked: zh ? "未匯入。請先修正下列問題。" : "Import blocked. Fix these issues first.",
    importOk: zh ? "已匯入" : "Imported",
    downloadTemplate: zh ? "下載匯入範本" : "Download CSV template",
    searchAlumni: zh ? "搜尋姓名、學號、公司…" : "Search name, student ID, company…",
    filterAll: zh ? "全部" : "All",
    alumniFullName: "full_name",
    alumniStudentId: "student_id",
    alumniDepartment: "department",
    alumniDegree: "degree_program",
    alumniAdmission: "admission_year",
    alumniGraduation: "graduation_year",
    alumniCompany: "company",
    alumniJob: "job_title",
    alumniNotes: "notes",
    alumniActivity: zh ? "檢視活動紀錄" : "View activity history",
    auditTime: zh ? "Time" : "Time",
    auditAdmin: zh ? "Admin" : "Admin",
    auditAction: zh ? "Action" : "Action",
    auditRecord: zh ? "Record" : "Record",
    auditChange: zh ? "Change" : "Change",
    auditNote: zh ? "業務資料顯示目前狀態；稽核資料顯示我們如何到達這個狀態。" : "Business data tells us the current state. Audit data tells us how we got there.",
    emptyAlumni: zh ? "尚無校友。請新增或匯入。" : "No alumni yet. Add one or import a CSV.",
    confirmDeleteAlumni: zh ? "確定刪除此校友？" : "Delete this alumni record?",
    importSkip: zh ? "列因格式不符而略過" : "row(s) skipped because the values did not match the required format",
    notGraduated: zh ? "尚未畢業" : "Not graduated yet",
    alumniInvalid: zh ? "請修正標示的欄位後再儲存。" : "Please fix the highlighted fields before saving.",
    signOut: zh ? "登出" : "Sign out",
    facultyTitle: zh ? "師資管理" : "Faculty management",
    facultyLead: zh ? "師資資料存在雲端（Supabase）。儲存後會同步到公開師資頁。" : "Faculty records live in the cloud (Supabase). Saves sync to the public Faculty page.",
    add: zh ? "新增公告" : "New announcement",
    addFaculty: zh ? "新增師資" : "New faculty",
    reset: zh ? "還原官方清單" : "Restore official list",
    seedCloud: zh ? "同步官方師資到雲端" : "Seed official faculty to cloud",
    shared: zh ? "共用欄位" : "Shared fields",
    bilingual: zh ? "雙語欄位" : "Bilingual fields",
    date: zh ? "日期" : "Date",
    url: zh ? "連結網址" : "Link URL",
    photo: zh ? "照片網址" : "image_url",
    newsImage: zh ? "公告圖片" : "Announcement image",
    insertImage: zh ? "插入圖片" : "Insert image",
    imageUrl: zh ? "圖片網址" : "Image URL",
    imageHint: zh ? "可貼上網址，或從電腦選擇圖片。儲存後會顯示在首頁與公告頁。" : "Paste a URL or choose a file. After saving it appears on the home and announcements pages.",
    removeImage: zh ? "移除圖片" : "Remove image",
    order: zh ? "顯示順序" : "sort_order",
    facultyName: zh ? "姓名" : "name",
    academicTitle: zh ? "職稱" : "title",
    education: zh ? "學歷" : "education",
    research: zh ? "研究領域" : "research_fields",
    phone: zh ? "電話" : "phone",
    website: zh ? "個人網站" : "website",
    category: zh ? "專任／兼任" : "category",
    fullTime: zh ? "專任 Full-time" : "Full-time",
    adjunct: zh ? "兼任 Adjunct" : "Adjunct",
    status: zh ? "狀態" : "Status",
    published: zh ? "已發布" : "Published",
    draft: zh ? "草稿" : "Draft",
    titleZh: "中文標題 / Chinese title",
    titleEn: "英文標題 / English title",
    contentZh: "中文內容 / Chinese content",
    contentEn: "英文內容 / English content",
    nameZh: "中文姓名",
    nameEn: "English name",
    tel: zh ? "電話" : "phone",
    email: "email",
    site: zh ? "個人網站" : "website",
    save: zh ? "儲存" : "Save",
    cancel: zh ? "取消" : "Cancel",
    edit: zh ? "編輯" : "Edit",
    remove: zh ? "刪除" : "Delete",
    up: zh ? "上移" : "Up",
    down: zh ? "下移" : "Down",
    empty: zh ? "尚無公告。請新增一則。" : "No announcements yet. Create one.",
    emptyFaculty: zh ? "尚無師資。請同步官方清單或新增一筆。" : "No faculty yet. Seed the official list or add one.",
    saved: zh ? "已儲存。" : "Saved.",
    cloudOk: zh ? "已連上 Supabase。" : "Connected to Supabase.",
    cloudOff: zh ? "尚未建立雲端資料表，先寫入本機。請在 Supabase SQL Editor 執行 supabase/faculty.sql 後再同步。" : "Cloud table is missing, so changes are local until you run supabase/faculty.sql in the Supabase SQL editor.",
    confirmDelete: zh ? "確定刪除這則公告？" : "Delete this announcement?",
    confirmDeleteFaculty: zh ? "確定刪除這位教師？" : "Delete this faculty member?",
    confirmReset: zh ? "將以官方公告清單覆蓋目前後台資料，確定嗎？" : "Replace all back-office announcements with the official list?",
    confirmSeed: zh ? "將官方師資清單寫入雲端（依 email 合併），確定嗎？" : "Write the official faculty list to the cloud (merge by id)?"
  };
}

function adminSessionBar(lang) {
  const t = adminCopy(lang);
  const a = authCopy(lang);
  const state = window.immbaAuthState || {};
  const email = (state.user && state.user.email) || "";
  return `<div class="admin-session">
    <p>${a.signedInAs}: <strong>${escapeHtml(email)}</strong> · ${a.roleLabel}: <strong>${escapeHtml(state.role || "")}</strong></p>
    <button class="btn btn-action-secondary" type="button" id="auth-signout">${t.signOut}</button>
  </div>`;
}

function adminTabs(lang, tab) {
  const t = adminCopy(lang);
  const access = `<a class="${tab === "access" ? "active" : ""}" href="${withLang("admin.html?tab=access")}">${t.tabAccess}</a>`;
  return `<nav class="admin-tabs" aria-label="${t.eyebrow}">
    <a class="${tab === "news" ? "active" : ""}" href="${withLang("admin.html")}">${t.tabNews}</a>
    <a class="${tab === "faculty" ? "active" : ""}" href="${withLang("admin.html?tab=faculty")}">${t.tabFaculty}</a>
    <a class="${tab === "alumni" ? "active" : ""}" href="${withLang("admin.html?tab=alumni")}">${t.tabAlumni}</a>
    ${access}
  </nav>`;
}

function adminNewsPage(lang) {
  const t = adminCopy(lang);
  const records = sortNewsRecords(loadNewsRecords());
  const editId = new URLSearchParams(location.search).get("edit");
  const creating = location.hash === "#new" || (!records.length && !editId);
  const current = editId ? getNewsById(editId) : creating ? normalizeNewsRecord({
    id: `n-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    url: "",
    image: "",
    order: records.length + 1,
    status: "draft",
    title: { zh: "", en: "" },
    content: { zh: "", en: "" }
  }) : null;

  const rows = records
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.date)}</td>
        <td>${item.order}</td>
        <td><span class="admin-status admin-status-${item.status}">${item.status === "draft" ? t.draft : t.published}</span></td>
        <td>
          ${item.image ? `<img class="admin-news-thumb" src="${escapeHtml(item.image)}" alt="">` : `<span class="muted">—</span>`}
        </td>
        <td>
          <strong>${escapeHtml(item.title.zh || "—")}</strong>
          <span class="muted">${escapeHtml(item.title.en || "—")}</span>
        </td>
        <td class="admin-actions">
          <a class="text-link" href="${withLang("admin.html")}&edit=${encodeURIComponent(item.id)}">${t.edit}</a>
          ${typeof isPinnedNews === "function" && isPinnedNews(item.id) ? "" : `<button class="text-link admin-delete" type="button" data-id="${escapeHtml(item.id)}">${t.remove}</button>`}
        </td>
      </tr>`
    )
    .join("");

  const form = current
    ? `<form id="admin-news-form" class="admin-form">
        <input type="hidden" name="id" value="${escapeHtml(current.id)}">
        <div class="section-header"><div><span class="eyebrow">${t.shared}</span><h2>${t.date} · ${t.url} · ${t.order} / ${t.status}</h2></div></div>
        <div class="admin-shared">
          <label>${t.date}<input type="date" name="date" required value="${escapeHtml(current.date)}"></label>
          <label>${t.url}<input type="url" name="url" placeholder="https://" value="${escapeHtml(current.url)}"></label>
          <label>${t.order}<input type="number" name="order" min="1" step="1" required value="${current.order}"></label>
          <label>${t.status}
            <select name="status">
              <option value="published"${current.status === "published" ? " selected" : ""}>${t.published}</option>
              <option value="draft"${current.status === "draft" ? " selected" : ""}>${t.draft}</option>
            </select>
          </label>
        </div>
        <div class="section-header"><div><span class="eyebrow">${t.newsImage}</span><h2>${t.insertImage}</h2></div></div>
        <div class="admin-image-picker">
          <input type="hidden" name="image" id="news-image-value" value="${escapeHtml(current.image)}">
          <label>${t.imageUrl}<input type="url" name="imageUrl" id="news-image-url" placeholder="https:// or assets/images/..." value="${current.image && !String(current.image).startsWith("data:") ? escapeHtml(current.image) : ""}"></label>
          <label>${t.insertImage}<input type="file" id="news-image-file" accept="image/*"></label>
          <p class="muted">${t.imageHint}</p>
          <figure class="admin-image-preview" id="news-image-preview"${current.image ? "" : " hidden"}>
            <img src="${escapeHtml(current.image)}" alt="">
          </figure>
          <button class="text-link" type="button" id="news-image-clear"${current.image ? "" : " hidden"}>${t.removeImage}</button>
        </div>
        <div class="section-header"><div><span class="eyebrow">${t.bilingual}</span><h2>${t.titleZh}</h2></div></div>
        <div class="admin-bilingual">
          <label>${t.titleZh}<input name="titleZh" required value="${escapeHtml(current.title.zh)}"></label>
          <label>${t.titleEn}<input name="titleEn" required value="${escapeHtml(current.title.en)}"></label>
          <label>${t.contentZh}<textarea name="contentZh" rows="8">${escapeHtml(current.content.zh)}</textarea></label>
          <label>${t.contentEn}<textarea name="contentEn" rows="8">${escapeHtml(current.content.en)}</textarea></label>
        </div>
        <div class="action-row">
          <button class="btn btn-action" type="submit">${t.save}</button>
          <a class="btn btn-action-secondary" href="${withLang("admin.html")}">${t.cancel}</a>
        </div>
        <p class="admin-flash" id="admin-flash" hidden></p>
      </form>`
    : "";

  return `
    ${hero(t.title, t.lead)}
    <section class="section"><div class="container">
      ${adminTabs(lang, "news")}
      ${adminSessionBar(lang)}
      <div class="section-header">
        <div><span class="eyebrow">${t.eyebrow}</span><h2>AdminNews</h2></div>
        <div class="action-row">
          <a class="btn btn-action" href="${withLang("admin.html")}#new">${t.add}</a>
          <button class="btn btn-action-secondary" type="button" id="admin-reset">${t.reset}</button>
        </div>
      </div>
      ${form}
      <div class="admin-table-wrap">
        ${
          records.length
            ? `<table class="admin-table">
                <thead>
                  <tr>
                    <th>${t.date}</th>
                    <th>${t.order}</th>
                    <th>${t.status}</th>
                    <th>${t.newsImage}</th>
                    <th>${t.titleZh} / ${t.titleEn}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>`
            : `<p class="muted">${t.empty}</p>`
        }
      </div>
    </div></section>`;
}

function adminPage(lang) {
  const tab = new URLSearchParams(location.search).get("tab") || "news";
  if (tab === "access") {
    return adminAccessPage(lang);
  }
  if (tab === "alumni") {
    const t = adminCopy(lang);
    return `
      ${hero(t.alumniTitle, t.alumniLead)}
      <section class="section"><div class="container">
        ${adminTabs(lang, "alumni")}
        ${adminSessionBar(lang)}
        <div id="admin-alumni-root"><p class="muted">${lang === "zh" ? "載入校友…" : "Loading alumni…"}</p></div>
      </div></section>`;
  }
  if (tab === "faculty") {
    const t = adminCopy(lang);
    return `
      ${hero(t.facultyTitle, t.facultyLead)}
      <section class="section"><div class="container">
        ${adminTabs(lang, "faculty")}
        ${adminSessionBar(lang)}
        <div id="admin-faculty-root"><p class="muted">${lang === "zh" ? "載入師資…" : "Loading faculty…"}</p></div>
      </div></section>`;
  }
  return adminNewsPage(lang);
}

function adminFacultyForm(current, t) {
  return `<form id="admin-faculty-form" class="admin-form">
    <input type="hidden" name="id" value="${escapeHtml(current.id)}">
    <div class="section-header"><div><span class="eyebrow">faculty</span><h2>id · name · title · category · sort_order</h2></div></div>
    <div class="admin-shared">
      <label>id<input name="id_display" value="${escapeHtml(current.id)}" disabled></label>
      <label>${t.facultyName}<input name="name" required value="${escapeHtml(current.name)}"></label>
      <label>${t.academicTitle}<input name="title" value="${escapeHtml(current.title)}"></label>
      <label>${t.category}
        <select name="category">
          <option value="Full-time"${current.category === "Full-time" ? " selected" : ""}>${t.fullTime}</option>
          <option value="Adjunct"${current.category === "Adjunct" ? " selected" : ""}>${t.adjunct}</option>
        </select>
      </label>
      <label>${t.order}<input type="number" name="sort_order" min="1" step="1" required value="${current.sort_order}"></label>
      <label>${t.email}<input type="email" name="email" value="${escapeHtml(current.email)}"></label>
      <label>${t.phone}<input name="phone" value="${escapeHtml(current.phone)}"></label>
      <label>${t.website}<input type="url" name="website" placeholder="https://" value="${escapeHtml(current.website)}"></label>
      <label>${t.photo}<input name="image_url" placeholder="assets/images/faculty/..." value="${escapeHtml(current.image_url)}"></label>
    </div>
    <div class="admin-bilingual">
      <label>${t.education}<textarea name="education" rows="3">${escapeHtml(current.education)}</textarea></label>
      <label>${t.research}<textarea name="research_fields" rows="4">${escapeHtml(current.research_fields)}</textarea></label>
    </div>
    <div class="action-row">
      <button class="btn btn-action" type="submit">${t.save}</button>
      <a class="btn btn-action-secondary" href="${withLang("admin.html")}&tab=faculty">${t.cancel}</a>
    </div>
    <p class="admin-flash" id="admin-flash" hidden></p>
  </form>`;
}

async function renderAdminFaculty() {
  const root = document.getElementById("admin-faculty-root");
  if (!root) return;
  const lang = getLang();
  const t = adminCopy(lang);
  const params = new URLSearchParams(location.search);
  const editId = params.get("edit");
  const creating = location.hash === "#new";
  const listed = await listFacultyRecords();
  const records = listed.records;
  const cloud = listed.source === "supabase";
  const current = editId
    ? records.find((item) => item.id === editId) || (await getFacultyById(editId))
    : creating
      ? normalizeFaculty({
          id: `f-${Date.now()}`,
          sort_order: records.length + 1,
          category: "Full-time"
        })
      : null;

  const rows = records
    .map(
      (item, index) => `<tr>
        <td>${item.sort_order}</td>
        <td><span class="admin-status">${escapeHtml(item.category)}</span></td>
        <td>
          <strong>${escapeHtml(facultyLangText(item.name, "zh") || "—")}</strong>
          <span class="muted">${escapeHtml(facultyLangText(item.name, "en") || "—")}</span>
        </td>
        <td class="admin-actions">
          <button class="text-link faculty-move" type="button" data-id="${escapeHtml(item.id)}" data-dir="up"${index === 0 ? " disabled" : ""}>${t.up}</button>
          <button class="text-link faculty-move" type="button" data-id="${escapeHtml(item.id)}" data-dir="down"${index === records.length - 1 ? " disabled" : ""}>${t.down}</button>
          <a class="text-link" href="${withLang("admin.html")}&tab=faculty&edit=${encodeURIComponent(item.id)}">${t.edit}</a>
          <button class="text-link faculty-delete" type="button" data-id="${escapeHtml(item.id)}">${t.remove}</button>
        </td>
      </tr>`
    )
    .join("");

  root.innerHTML = `
    <p class="${cloud ? "admin-flash" : "muted"}">${cloud ? t.cloudOk : t.cloudOff}</p>
    <div class="section-header">
      <div><span class="eyebrow">${t.eyebrow}</span><h2>${t.facultyTitle}</h2></div>
      <div class="action-row">
        <a class="btn btn-action" href="${withLang("admin.html")}&tab=faculty#new">${t.addFaculty}</a>
        <button class="btn btn-action-secondary" type="button" id="faculty-seed">${t.seedCloud}</button>
      </div>
    </div>
    ${current ? adminFacultyForm(current, t) : ""}
    <div class="admin-table-wrap">
      ${
        records.length
          ? `<table class="admin-table">
              <thead>
                <tr>
                  <th>${t.order}</th>
                  <th>${t.category}</th>
                  <th>${t.facultyName}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>`
          : `<p class="muted">${t.emptyFaculty}</p>`
      }
    </div>`;

  document.getElementById("admin-faculty-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await upsertFacultyRecord({
      id: data.get("id"),
      name: data.get("name"),
      title: data.get("title"),
      education: data.get("education"),
      research_fields: data.get("research_fields"),
      email: data.get("email"),
      phone: data.get("phone"),
      website: data.get("website"),
      image_url: data.get("image_url"),
      category: data.get("category"),
      sort_order: Number(data.get("sort_order"))
    });
    location.href = withLang("admin.html") + "&tab=faculty";
  });
  document.getElementById("faculty-seed")?.addEventListener("click", async () => {
    if (!confirm(t.confirmSeed)) return;
    await seedFacultyCloud();
    location.href = withLang("admin.html") + "&tab=faculty";
  });
  document.querySelectorAll(".faculty-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm(t.confirmDeleteFaculty)) return;
      await deleteFacultyRecord(btn.dataset.id);
      location.href = withLang("admin.html") + "&tab=faculty";
    });
  });
  document.querySelectorAll(".faculty-move").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await reorderFaculty(btn.dataset.id, btn.dataset.dir);
      location.href = withLang("admin.html") + "&tab=faculty";
    });
  });
}

function alumniSelect(name, value, options, required = true) {
  return `<select name="${name}"${required ? " required" : ""}>
    ${options.map((option) => `<option value="${option}"${option === value ? " selected" : ""}>${option}</option>`).join("")}
  </select>`;
}

const ALUMNI_COLUMN_KEY = "immba-alumni-columns-v1";
const ALUMNI_COLUMNS = [
  { id: "full_name", label: { en: "Name", zh: "姓名" }, defaultOn: true },
  { id: "department", label: { en: "Department", zh: "系所" }, defaultOn: true },
  { id: "graduation_year", label: { en: "Graduation Year", zh: "畢業年度" }, defaultOn: true },
  { id: "company", label: { en: "Company", zh: "公司" }, defaultOn: true },
  { id: "phone", label: { en: "Phone", zh: "電話" }, defaultOn: false },
  { id: "email", label: { en: "Email", zh: "電子郵件" }, defaultOn: false },
  { id: "student_id", label: { en: "Student ID", zh: "學號" }, defaultOn: true },
  { id: "degree_program", label: { en: "Degree Program", zh: "學位" }, defaultOn: true },
  { id: "admission_year", label: { en: "Admission Year", zh: "入學年度" }, defaultOn: true },
  { id: "job_title", label: { en: "Job Title", zh: "職稱" }, defaultOn: false }
];

function defaultAlumniColumns() {
  return Object.fromEntries(ALUMNI_COLUMNS.map((col) => [col.id, col.defaultOn]));
}

function loadAlumniColumns() {
  try {
    const raw = localStorage.getItem(ALUMNI_COLUMN_KEY);
    if (raw) return { ...defaultAlumniColumns(), ...JSON.parse(raw) };
  } catch (err) {
    /* ignore */
  }
  return defaultAlumniColumns();
}

function saveAlumniColumns(visible) {
  localStorage.setItem(ALUMNI_COLUMN_KEY, JSON.stringify(visible));
}

function alumniColumnLabel(col, lang) {
  return (col.label && (col.label[lang] || col.label.en)) || col.id;
}

function alumniCellHtml(item, columnId) {
  if (columnId === "email") {
    return item.email ? `<a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>` : "—";
  }
  return escapeHtml(item[columnId] || "—");
}

function alumniVisibleColumns(visible) {
  return ALUMNI_COLUMNS.filter((col) => visible[col.id]);
}

function alumniTableHtml(shown, visible, t, lang) {
  if (!shown.length) return `<p class="muted">${t.emptyAlumni}</p>`;
  const columns = alumniVisibleColumns(visible);
  return `<table class="admin-table">
    <thead>
      <tr>
        ${columns.map((col) => `<th>${escapeHtml(alumniColumnLabel(col, lang))}</th>`).join("")}
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${shown
        .map(
          (item) => `<tr>
            ${columns.map((col) => `<td>${alumniCellHtml(item, col.id)}</td>`).join("")}
            <td class="admin-actions">
              <a class="alumni-action-icon" href="${withLang("admin.html?tab=alumni")}&edit=${encodeURIComponent(item.id)}" title="${t.edit}">${alumniActionIcon("edit")}<span class="sr-only">${t.edit}</span></a>
              <button class="alumni-action-icon alumni-delete" type="button" data-id="${escapeHtml(item.id)}" title="${t.remove}">${alumniActionIcon("delete")}<span class="sr-only">${t.remove}</span></button>
            </td>
          </tr>`
        )
        .join("")}
    </tbody>
  </table>`;
}

function alumniColumnsMenuHtml(visible, lang, t) {
  return `<div class="alumni-columns">
    <button class="btn btn-action-secondary alumni-columns-btn" id="alumni-columns-btn" type="button" aria-expanded="false" aria-haspopup="true">${escapeHtml(t.columns)} <span aria-hidden="true">▾</span></button>
    <div class="alumni-columns-menu" id="alumni-columns-menu" hidden>
      ${ALUMNI_COLUMNS.map(
        (col) => `<label>
          <input type="checkbox" data-col="${col.id}"${visible[col.id] ? " checked" : ""}>
          <span>${escapeHtml(alumniColumnLabel(col, lang))}</span>
        </label>`
      ).join("")}
    </div>
  </div>`;
}

function bindAlumniDeleteButtons(t) {
  document.querySelectorAll(".alumni-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm(t.confirmDeleteAlumni)) return;
      deleteAlumniRecord(btn.dataset.id);
      location.href = withLang("admin.html?tab=alumni");
    });
  });
}

function bindAlumniColumnPicker(shown, t, lang) {
  const btn = document.getElementById("alumni-columns-btn");
  const menu = document.getElementById("alumni-columns-menu");
  const root = document.getElementById("admin-alumni-root");
  if (!btn || !menu) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.addEventListener("click", (e) => e.stopPropagation());
  menu.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.addEventListener("change", () => {
      const visible = loadAlumniColumns();
      visible[input.dataset.col] = input.checked;
      saveAlumniColumns(visible);
      const wrap = document.getElementById("alumni-table-wrap");
      if (wrap) wrap.innerHTML = alumniTableHtml(shown, visible, t, lang);
      bindAlumniDeleteButtons(t);
    });
  });
  root?.addEventListener("click", (e) => {
    if (e.target.closest(".alumni-columns")) return;
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  });
}

function alumniYearOptions(years, selected, emptyLabel) {
  const empty = emptyLabel ? `<option value="">${emptyLabel}</option>` : "";
  return `${empty}${years
    .map((year) => `<option value="${year}"${String(year) === String(selected) ? " selected" : ""}>${year}</option>`)
    .join("")}`;
}

function alumniImportIssueLine(item) {
  const row = item.row ? `Row ${item.row}` : "File";
  return `${row} · ${item.issue}: ${item.detail}`;
}

function alumniImportReportHtml(report, t, imported) {
  const errors = (report && report.errors) || [];
  const warnings = (report && report.warnings) || [];
  if (errors.length) {
    return `<div class="alumni-import-report is-error" id="alumni-import-report">
      <p>${escapeHtml(t.importBlocked)}</p>
      <ul>${errors.map((item) => `<li>${escapeHtml(alumniImportIssueLine(item))}</li>`).join("")}</ul>
    </div>`;
  }
  if (imported == null && !warnings.length) return `<div id="alumni-import-report"></div>`;
  return `<div class="alumni-import-report is-ok" id="alumni-import-report">
    ${imported != null ? `<p>${escapeHtml(t.importOk)} ${imported}.</p>` : ""}
    ${warnings.length ? `<ul>${warnings.map((item) => `<li>${escapeHtml(alumniImportIssueLine(item))}</li>`).join("")}</ul>` : ""}
  </div>`;
}

function consumeAlumniImportFlash(t) {
  try {
    const raw = sessionStorage.getItem("immba-alumni-import-flash");
    if (!raw) return `<div id="alumni-import-report"></div>`;
    sessionStorage.removeItem("immba-alumni-import-flash");
    const flash = JSON.parse(raw);
    return alumniImportReportHtml(flash.report || {}, t, flash.imported);
  } catch (err) {
    return `<div id="alumni-import-report"></div>`;
  }
}

function alumniActionIcon(kind) {
  if (kind === "edit") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6 7h12v14H6V7zm3-4h6l1 2h4v2H4V5h4l1-2zm1 6v8h2V9H10zm4 0v8h2V9h-2z"/></svg>`;
}

function adminAlumniForm(current, t) {
  const departments = typeof ALUMNI_DEPARTMENTS !== "undefined" ? ALUMNI_DEPARTMENTS : ["EMBA", "ImMBA"];
  const degrees = typeof ALUMNI_DEGREES !== "undefined" ? ALUMNI_DEGREES : ["Bachelors", "Masters", "Doctoral Program", "Other"];
  const admissionYears = typeof alumniAdmissionYears === "function" ? alumniAdmissionYears() : [];
  const admission = current.admission_year || String(alumniCurrentYear());
  const graduationYears = typeof alumniGraduationYears === "function" ? alumniGraduationYears(admission) : [];
  return `<form id="admin-alumni-form" class="admin-form">
    <input type="hidden" name="id" value="${escapeHtml(current.id)}">
    <div class="section-header"><div><span class="eyebrow">alumni</span><h2>full_name · student_id · department · degree_program</h2></div></div>
    <div class="admin-shared">
      <label>${t.alumniFullName}<input name="full_name" required value="${escapeHtml(current.full_name)}"></label>
      <label>${t.alumniStudentId}<input name="student_id" required inputmode="numeric" pattern="\\d{9}" maxlength="9" minlength="9" title="Exactly 9 digits" value="${escapeHtml(current.student_id)}"></label>
      <label>${t.alumniDepartment}${alumniSelect("department", current.department || "ImMBA", departments)}</label>
      <label>${t.alumniDegree}${alumniSelect("degree_program", current.degree_program || "Masters", degrees)}</label>
      <label>${t.alumniAdmission}<select name="admission_year" required>${alumniYearOptions(admissionYears, admission)}</select></label>
      <label>${t.alumniGraduation}<select name="graduation_year">${alumniYearOptions(graduationYears, current.graduation_year, t.notGraduated)}</select></label>
      <label>${t.email}<input type="email" name="email" required pattern="[^\\s@]+@[^\\s@]+\\.[^\\s@]+" title="Must include @" value="${escapeHtml(current.email)}"></label>
      <label>${t.phone}<input name="phone" required inputmode="numeric" pattern="\\d{10}" maxlength="10" minlength="10" title="Exactly 10 digits" value="${escapeHtml(current.phone)}"></label>
      <label>${t.alumniCompany}<input name="company" value="${escapeHtml(current.company)}"></label>
      <label>${t.alumniJob}<input name="job_title" value="${escapeHtml(current.job_title)}"></label>
    </div>
    <div class="admin-bilingual">
      <label>${t.alumniNotes}<textarea name="notes" rows="3">${escapeHtml(current.notes)}</textarea></label>
    </div>
    <div class="action-row">
      <button class="btn btn-action" type="submit">${t.save}</button>
      <a class="btn btn-action-secondary" href="${withLang("admin.html?tab=alumni")}">${t.cancel}</a>
    </div>
    <p class="admin-flash" id="admin-flash" hidden></p>
  </form>`;
}

function renderAdminAlumni() {
  const root = document.getElementById("admin-alumni-root");
  if (!root || typeof listAlumniRecords !== "function") return;
  const lang = getLang();
  const t = adminCopy(lang);
  const params = new URLSearchParams(location.search);
  const editId = params.get("edit");
  const creating = location.hash === "#new";
  const records = listAlumniRecords();
  const filters = {
    q: params.get("q") || "",
    department: params.get("department") || "",
    degree_program: params.get("degree") || "",
    admission_year: params.get("admission") || "",
    graduation_year: params.get("year") || ""
  };
  const shown = filterAlumniRecords(records, filters);
  const current = editId
    ? getAlumniById(editId)
    : creating
      ? normalizeAlumni({ id: `a-${Date.now()}`, department: "ImMBA", degree_program: "Masters", admission_year: String(alumniCurrentYear()) })
      : null;
  const admissionYears = [...new Set(records.map((item) => item.admission_year).filter(Boolean))].sort().reverse();
  const years = [...new Set(records.map((item) => item.graduation_year).filter(Boolean))].sort().reverse();
  const activity = loadAlumniActivity();
  const departments = typeof ALUMNI_DEPARTMENTS !== "undefined" ? ALUMNI_DEPARTMENTS : ["EMBA", "ImMBA"];
  const degrees = typeof ALUMNI_DEGREES !== "undefined" ? ALUMNI_DEGREES : ["Bachelors", "Masters", "Doctoral Program", "Other"];
  const visibleColumns = loadAlumniColumns();
  root.innerHTML = `
    <nav class="alumni-ops" aria-label="${escapeHtml(t.alumniTitle)}">
      <a class="alumni-op" href="${withLang("admin.html?tab=alumni")}#new">${t.addAlumni}</a>
      <a class="alumni-op alumni-op-icon" href="#alumni-search" title="${t.edit}"><span class="alumni-action-icon">${alumniActionIcon("edit")}</span><span>${t.edit}</span></a>
      <a class="alumni-op alumni-op-icon" href="#alumni-search" title="${t.remove}"><span class="alumni-action-icon alumni-delete">${alumniActionIcon("delete")}</span><span>${t.remove}</span></a>
      <a class="alumni-op" href="#alumni-search">${lang === "zh" ? "搜尋" : "Search"}</a>
      <a class="alumni-op" href="#alumni-search">${lang === "zh" ? "篩選" : "Filter"}</a>
      <a class="alumni-op" href="#alumni-activity">${t.viewActivity}</a>
    </nav>
    <p class="alumni-require">${escapeHtml(t.alumniRequire)}</p>
    <p class="muted alumni-import-hint">${escapeHtml(t.importValidate)}</p>
    ${consumeAlumniImportFlash(t)}
    <form class="alumni-toolbar" id="alumni-filter-form">
      <label class="sr-only" for="alumni-q">${t.searchAlumni}</label>
      <input id="alumni-q" name="q" value="${escapeHtml(filters.q)}" placeholder="${t.searchAlumni}">
      <select name="department">
        <option value="">${t.alumniDepartment}: ${t.filterAll}</option>
        ${departments.map((item) => `<option value="${item}"${item === filters.department ? " selected" : ""}>${item}</option>`).join("")}
      </select>
      <select name="degree">
        <option value="">${t.alumniDegree}: ${t.filterAll}</option>
        ${degrees.map((item) => `<option value="${item}"${item === filters.degree_program ? " selected" : ""}>${item}</option>`).join("")}
      </select>
      <select name="admission">
        <option value="">${t.alumniAdmission}: ${t.filterAll}</option>
        ${admissionYears.map((item) => `<option value="${item}"${item === filters.admission_year ? " selected" : ""}>${item}</option>`).join("")}
      </select>
      <select name="year">
        <option value="">${t.alumniGraduation}: ${t.filterAll}</option>
        ${years.map((item) => `<option value="${item}"${item === filters.graduation_year ? " selected" : ""}>${item}</option>`).join("")}
      </select>
      <button class="btn btn-action-secondary" type="submit">${lang === "zh" ? "篩選" : "Filter"}</button>
    </form>
    <div class="section-header" id="alumni-search">
      <div><span class="eyebrow">${t.eyebrow}</span><h2>${t.alumniTitle}</h2></div>
      <div class="action-row">
        <a class="btn btn-action" href="${withLang("admin.html?tab=alumni")}#new">${t.addAlumni}</a>
        ${alumniColumnsMenuHtml(visibleColumns, lang, t)}
        <a class="btn btn-action-secondary" href="#alumni-activity">${t.viewActivity}</a>
        <button class="btn btn-action-secondary" type="button" id="alumni-template">${t.downloadTemplate}</button>
        <label class="btn btn-action-secondary alumni-import-label">${t.importAlumni}<input id="alumni-import" type="file" accept=".csv,text/csv" hidden></label>
      </div>
    </div>
    ${current ? adminAlumniForm(current, t) : ""}
    <div class="admin-table-wrap" id="alumni-table-wrap">
      ${alumniTableHtml(shown, visibleColumns, t, lang)}
    </div>
    <div class="section-header" id="alumni-activity"><div><span class="eyebrow">audit</span><h2>${t.alumniActivity}</h2></div></div>
    <div class="admin-table-wrap">
      ${
        activity.length
          ? `<table class="admin-table audit-table">
              <thead><tr><th>${t.auditTime}</th><th>${t.auditAdmin}</th><th>${t.auditAction}</th><th>${t.auditRecord}</th><th>${t.auditChange}</th></tr></thead>
              <tbody>${activity
                .map(
                  (item) => `<tr>
                    <td>${escapeHtml(formatAlumniAuditTime(item.at))}</td>
                    <td>${escapeHtml(item.admin || item.actor || "—")}</td>
                    <td><span class="admin-status">${escapeHtml(item.action || "—")}</span></td>
                    <td>${escapeHtml(item.record || "—")}</td>
                    <td>${escapeHtml(item.change || item.detail || "—")}</td>
                  </tr>`
                )
                .join("")}</tbody>
            </table>
            <p class="muted audit-example">${escapeHtml(alumniAuditSentence(activity[0]))}</p>`
          : `<p class="muted">${lang === "zh" ? "尚無稽核紀錄。" : "No audit trail yet."}</p>`
      }
    </div>`;

  document.getElementById("alumni-filter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const url = new URL(withLang("admin.html?tab=alumni"), location.href);
    ["q", "department", "degree", "admission", "year"].forEach((key) => {
      const value = String(data.get(key) || "").trim();
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    location.href = url.pathname.split("/").pop() + url.search;
  });
  const admissionSelect = document.querySelector("#admin-alumni-form [name='admission_year']");
  const graduationSelect = document.querySelector("#admin-alumni-form [name='graduation_year']");
  admissionSelect?.addEventListener("change", () => {
    if (!graduationSelect || typeof alumniGraduationYears !== "function") return;
    const kept = graduationSelect.value;
    const years = alumniGraduationYears(admissionSelect.value);
    graduationSelect.innerHTML = alumniYearOptions(years, years.includes(kept) ? kept : "", t.notGraduated);
  });
  document.getElementById("admin-alumni-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      id: data.get("id"),
      full_name: data.get("full_name"),
      student_id: data.get("student_id"),
      department: data.get("department"),
      degree_program: data.get("degree_program"),
      admission_year: data.get("admission_year"),
      graduation_year: data.get("graduation_year"),
      email: data.get("email"),
      phone: data.get("phone"),
      company: data.get("company"),
      job_title: data.get("job_title"),
      notes: data.get("notes")
    };
    const invalid = typeof alumniValidationError === "function" ? alumniValidationError(payload) : "";
    const flash = document.getElementById("admin-flash");
    if (invalid) {
      if (flash) {
        flash.hidden = false;
        flash.textContent = invalid;
        flash.classList.add("is-error");
      } else alert(invalid);
      return;
    }
    try {
      upsertAlumniRecord(payload);
      location.href = withLang("admin.html?tab=alumni");
    } catch (err) {
      if (flash) {
        flash.hidden = false;
        flash.textContent = err.message || t.alumniInvalid;
        flash.classList.add("is-error");
      }
    }
  });
  document.getElementById("alumni-template")?.addEventListener("click", () => {
    const blob = new Blob([alumniCsvTemplate()], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "alumni-import-template.csv";
    link.click();
    URL.revokeObjectURL(href);
  });
  document.getElementById("alumni-import")?.addEventListener("change", async (e) => {
    const file = e.currentTarget.files && e.currentTarget.files[0];
    if (!file) return;
    const box = document.getElementById("alumni-import-report");
    const read = typeof readAlumniCsvFile === "function" ? await readAlumniCsvFile(file) : { text: await file.text(), issues: [] };
    const report = validateAlumniCsv(read.text, listAlumniRecords());
    report.errors = (read.issues || []).concat(report.errors || []);
    report.ok = !report.errors.length;
    e.currentTarget.value = "";
    if (!report.ok) {
      if (box) box.outerHTML = alumniImportReportHtml(report, t);
      else alert(t.importBlocked + "\n" + report.errors.map(alumniImportIssueLine).join("\n"));
      return;
    }
    const result = importAlumniRecords(read.text, listAlumniRecords());
    sessionStorage.setItem("immba-alumni-import-flash", JSON.stringify({ imported: result.imported, report: result.report }));
    location.href = withLang("admin.html?tab=alumni");
  });
  bindAlumniDeleteButtons(t);
  bindAlumniColumnPicker(shown, t, lang);
}

function bindAdmin() {
  if (document.body.dataset.page !== "admin") return;
  if (typeof canEditContent === "function" && !canEditContent()) {
    bindAuthForms();
    return;
  }
  const lang = getLang();
  const t = adminCopy(lang);
  const tab = new URLSearchParams(location.search).get("tab") || "news";
  if (tab === "access") {
    renderAdminAccess();
    bindAuthForms();
    return;
  }
  if (tab === "alumni") {
    renderAdminAlumni();
    bindAuthForms();
    return;
  }
  if (tab === "faculty") {
    renderAdminFaculty();
    bindAuthForms();
    return;
  }
  const form = document.getElementById("admin-news-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    upsertNewsRecord({
      id: data.get("id"),
      date: data.get("date"),
      url: data.get("url"),
      image: data.get("image") || data.get("imageUrl") || "",
      order: Number(data.get("order")),
      status: data.get("status"),
      title: { zh: data.get("titleZh"), en: data.get("titleEn") },
      content: { zh: data.get("contentZh"), en: data.get("contentEn") }
    });
    const flash = document.getElementById("admin-flash");
    if (flash) {
      flash.hidden = false;
      flash.textContent = t.saved;
    }
    const url = new URL(withLang("admin.html"), location.href);
    history.replaceState({}, "", url.pathname + url.search);
    render();
  });
  document.getElementById("admin-reset")?.addEventListener("click", () => {
    if (!confirm(t.confirmReset)) return;
    resetNewsRecords();
    location.href = withLang("admin.html");
  });
  document.querySelectorAll(".admin-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm(t.confirmDelete)) return;
      deleteNewsRecord(btn.dataset.id);
      location.href = withLang("admin.html");
    });
  });
  bindNewsImagePicker();
  bindAuthForms();
}

function setNewsImageValue(value) {
  const hidden = document.getElementById("news-image-value");
  const preview = document.getElementById("news-image-preview");
  const img = preview?.querySelector("img");
  const clear = document.getElementById("news-image-clear");
  if (hidden) hidden.value = value || "";
  if (preview) preview.hidden = !value;
  if (img) img.src = value || "";
  if (clear) clear.hidden = !value;
}

function compressNewsImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => resolve(String(reader.result || ""));
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function bindNewsImagePicker() {
  const file = document.getElementById("news-image-file");
  const url = document.getElementById("news-image-url");
  document.getElementById("news-image-clear")?.addEventListener("click", () => {
    if (file) file.value = "";
    if (url) url.value = "";
    setNewsImageValue("");
  });
  url?.addEventListener("input", () => {
    setNewsImageValue(url.value.trim());
  });
  file?.addEventListener("change", async () => {
    const chosen = file.files && file.files[0];
    if (!chosen) return;
    const dataUrl = await compressNewsImage(chosen);
    if (url) url.value = "";
    setNewsImageValue(dataUrl);
  });
}
