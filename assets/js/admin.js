function adminCopy(lang) {
  const zh = lang === "zh";
  return {
    eyebrow: zh ? "後台" : "Back office",
    title: zh ? "公告管理" : "AdminNews",
    lead: zh ? "一則公告同時保存中文與英文。公開網站只顯示已發布項目。" : "One announcement holds Chinese and English in the same record. The public site shows published items only.",
    add: zh ? "新增公告" : "New announcement",
    reset: zh ? "還原官方清單" : "Restore official list",
    shared: zh ? "共用欄位" : "Shared fields",
    bilingual: zh ? "雙語欄位" : "Bilingual fields",
    date: zh ? "日期" : "Date",
    url: zh ? "連結網址" : "Link URL",
    order: zh ? "顯示順序" : "Display order",
    status: zh ? "狀態" : "Status",
    published: zh ? "已發布" : "Published",
    draft: zh ? "草稿" : "Draft",
    titleZh: "中文標題 / Chinese title",
    titleEn: "英文標題 / English title",
    contentZh: "中文內容 / Chinese content",
    contentEn: "英文內容 / English content",
    save: zh ? "儲存" : "Save",
    cancel: zh ? "取消" : "Cancel",
    edit: zh ? "編輯" : "Edit",
    remove: zh ? "刪除" : "Delete",
    empty: zh ? "尚無公告。請新增一則。" : "No announcements yet. Create one.",
    saved: zh ? "已儲存。" : "Saved.",
    confirmDelete: zh ? "確定刪除這則公告？" : "Delete this announcement?",
    confirmReset: zh ? "將以官方公告清單覆蓋目前後台資料，確定嗎？" : "Replace all back-office announcements with the official list?"
  };
}

function adminPage(lang) {
  const t = adminCopy(lang);
  const records = sortNewsRecords(loadNewsRecords());
  const editId = new URLSearchParams(location.search).get("edit");
  const creating = location.hash === "#new" || (!records.length && !editId);
  const current = editId ? getNewsById(editId) : creating ? normalizeNewsRecord({
    id: `n-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    url: "",
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
          <strong>${escapeHtml(item.title.zh || "—")}</strong>
          <span class="muted">${escapeHtml(item.title.en || "—")}</span>
        </td>
        <td class="admin-actions">
          <a class="text-link" href="${withLang("admin.html")}&edit=${encodeURIComponent(item.id)}">${t.edit}</a>
          <button class="text-link admin-delete" type="button" data-id="${escapeHtml(item.id)}">${t.remove}</button>
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

function bindAdmin() {
  if (document.body.dataset.page !== "admin") return;
  const lang = getLang();
  const t = adminCopy(lang);
  const form = document.getElementById("admin-news-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    upsertNewsRecord({
      id: data.get("id"),
      date: data.get("date"),
      url: data.get("url"),
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
}
