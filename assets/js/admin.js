function adminCopy(lang) {
  const zh = lang === "zh";
  return {
    eyebrow: zh ? "後台" : "Back office",
    title: zh ? "公告管理" : "AdminNews",
    lead: zh ? "一則公告同時保存中文與英文。公開網站只顯示已發布項目。" : "One announcement holds Chinese and English in the same record. The public site shows published items only.",
    tabNews: zh ? "公告管理" : "News",
    tabFaculty: zh ? "師資管理" : "Faculty",
    tabAccess: zh ? "權限核准" : "Access",
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
  const access = typeof isSuperAdmin === "function" && isSuperAdmin()
    ? `<a class="${tab === "access" ? "active" : ""}" href="${withLang("admin.html")}&tab=access">${t.tabAccess}</a>`
    : "";
  return `<nav class="admin-tabs" aria-label="${t.eyebrow}">
    <a class="${tab === "news" ? "active" : ""}" href="${withLang("admin.html")}">${t.tabNews}</a>
    <a class="${tab === "faculty" ? "active" : ""}" href="${withLang("admin.html")}&tab=faculty">${t.tabFaculty}</a>
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
  if (tab === "access" && typeof isSuperAdmin === "function" && isSuperAdmin()) {
    return adminAccessPage(lang);
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
