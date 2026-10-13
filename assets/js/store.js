const NEWS_STORE_KEY = "immba-admin-news";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function formatNewsContent(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return "";
  return raw
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function normalizeNewsRecord(record, index = 0) {
  const title = record.title || {};
  const content = record.content || {};
  return {
    id: String(record.id || `n-${Date.now()}-${index}`),
    date: record.date || new Date().toISOString().slice(0, 10),
    url: record.url || "",
    order: Number.isFinite(Number(record.order)) ? Number(record.order) : index + 1,
    status: record.status === "draft" ? "draft" : "published",
    title: {
      zh: title.zh || "",
      en: title.en || ""
    },
    content: {
      zh: content.zh || "",
      en: content.en || ""
    }
  };
}

function seedNewsRecords() {
  return NEWS.map((item, index) =>
    normalizeNewsRecord(
      {
        id: item.id,
        date: item.date,
        url: item.url || "",
        order: item.pin ? index + 1 : index + 10,
        status: "published",
        title: item.title,
        content: item.content || { zh: "", en: "" }
      },
      index
    )
  );
}

function loadNewsRecords() {
  try {
    const raw = localStorage.getItem(NEWS_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeNewsRecord);
    }
  } catch (err) {
    /* fall back to seed */
  }
  const seeded = seedNewsRecords();
  saveNewsRecords(seeded);
  return seeded;
}

function saveNewsRecords(records) {
  localStorage.setItem(NEWS_STORE_KEY, JSON.stringify(records.map(normalizeNewsRecord)));
}

function sortNewsRecords(records) {
  return [...records].sort((a, b) => a.order - b.order || b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

function getPublishedNews() {
  return sortNewsRecords(loadNewsRecords().filter((item) => item.status === "published"));
}

function getNewsById(id) {
  return loadNewsRecords().find((item) => item.id === id) || null;
}

function upsertNewsRecord(record) {
  const next = normalizeNewsRecord(record);
  const records = loadNewsRecords();
  const index = records.findIndex((item) => item.id === next.id);
  if (index >= 0) records[index] = next;
  else records.push(next);
  saveNewsRecords(records);
  return next;
}

function deleteNewsRecord(id) {
  saveNewsRecords(loadNewsRecords().filter((item) => item.id !== id));
}

function resetNewsRecords() {
  const seeded = seedNewsRecords();
  saveNewsRecords(seeded);
  return seeded;
}
