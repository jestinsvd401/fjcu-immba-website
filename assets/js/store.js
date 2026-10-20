const NEWS_STORE_KEY = "immba-admin-news";
const NEWS_STORE_VERSION_KEY = "immba-admin-news-v";
const NEWS_STORE_VERSION = "7";
const PINNED_NEWS_IDS_KEY = "immba-pinned-news-ids";
const PINNED_SOURCE_ORDERS = [11, 12];

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
    image: record.image || record.image_url || "",
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
  return pinTopNews(
    NEWS.map((item, index) =>
      normalizeNewsRecord(
        {
          id: item.id,
          date: item.date,
          url: item.url || "",
          order: index + 11,
          status: "published",
          title: item.title,
          content: item.content || { zh: "", en: "" }
        },
        index
      )
    )
  );
}

function newsTitleBlob(record) {
  const title = record.title || {};
  return `${title.en || ""} ${title.zh || ""}`.toLowerCase();
}

function resolvePinnedNewsIds(records) {
  try {
    const saved = JSON.parse(localStorage.getItem(PINNED_NEWS_IDS_KEY) || "[]");
    if (Array.isArray(saved) && saved.length === 2 && saved.every((id) => records.some((record) => String(record.id) === String(id)))) {
      return saved.map(String);
    }
  } catch (err) {
    /* ignore */
  }
  const byTitle = [
    records.find((record) => /class on supabase|supabase 課程/.test(newsTitleBlob(record))),
    records.find((record) => /semester kickoff|學期開學/.test(newsTitleBlob(record)))
  ];
  const ids = PINNED_SOURCE_ORDERS.map((order, index) => {
    if (byTitle[index]) return String(byTitle[index].id);
    const match = records.find((record) => Number(record.order) === order);
    return match ? String(match.id) : "";
  }).filter(Boolean);
  if (ids.length === 2) localStorage.setItem(PINNED_NEWS_IDS_KEY, JSON.stringify(ids));
  return ids;
}

function isPinnedNews(id) {
  try {
    const saved = JSON.parse(localStorage.getItem(PINNED_NEWS_IDS_KEY) || "[]");
    if (Array.isArray(saved) && saved.includes(String(id))) return true;
  } catch (err) {
    /* ignore */
  }
  return ["class-supabase", "semester-kickoff"].includes(String(id));
}

function pinTopNews(records) {
  const list = records.map((record) => normalizeNewsRecord(record));
  NEWS.slice(0, 2).forEach((item, index) => {
    const exists = list.some(
      (record) =>
        String(record.id) === String(item.id) ||
        (index === 0 && /class on supabase|supabase 課程/.test(newsTitleBlob(record))) ||
        (index === 1 && /semester kickoff|學期開學/.test(newsTitleBlob(record)))
    );
    if (exists) return;
    list.push(
      normalizeNewsRecord({
        id: item.id,
        date: item.date,
        url: item.url || "",
        image: item.image || "",
        order: PINNED_SOURCE_ORDERS[index],
        status: "published",
        title: item.title,
        content: item.content || { zh: "", en: "" }
      })
    );
  });
  const pinnedIds = resolvePinnedNewsIds(list);
  return list.map((record) => {
    const rank = pinnedIds.indexOf(String(record.id));
    if (rank >= 0) {
      return normalizeNewsRecord({
        ...record,
        status: "published",
        order: rank + 1
      });
    }
    const order = Number(record.order);
    if (Number.isFinite(order) && order <= pinnedIds.length) {
      return normalizeNewsRecord({ ...record, order: order + 10 });
    }
    return record;
  });
}

function loadNewsRecords() {
  let records = null;
  try {
    const raw = localStorage.getItem(NEWS_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) records = parsed.map(normalizeNewsRecord);
    }
  } catch (err) {
    records = null;
  }
  if (!records) {
    records = seedNewsRecords();
    saveNewsRecords(records);
  }
  records = pinTopNews(records);
  if (localStorage.getItem(NEWS_STORE_VERSION_KEY) !== NEWS_STORE_VERSION) {
    saveNewsRecords(records);
    localStorage.setItem(NEWS_STORE_VERSION_KEY, NEWS_STORE_VERSION);
  }
  return records;
}

function saveNewsRecords(records) {
  localStorage.setItem(NEWS_STORE_KEY, JSON.stringify(pinTopNews(records.map(normalizeNewsRecord))));
}

function sortNewsRecords(records) {
  const pinnedIds = resolvePinnedNewsIds(records);
  return [...records].sort((a, b) => {
    const ap = pinnedIds.indexOf(String(a.id));
    const bp = pinnedIds.indexOf(String(b.id));
    if (ap !== -1 || bp !== -1) {
      if (ap === -1) return 1;
      if (bp === -1) return -1;
      return ap - bp;
    }
    return a.order - b.order || b.date.localeCompare(a.date) || a.id.localeCompare(b.id);
  });
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
  if (isPinnedNews(id)) return;
  saveNewsRecords(loadNewsRecords().filter((item) => item.id !== id));
}

function resetNewsRecords() {
  const seeded = seedNewsRecords();
  saveNewsRecords(seeded);
  return seeded;
}
