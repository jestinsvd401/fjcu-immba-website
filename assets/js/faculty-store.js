const FACULTY_TABLE = "faculty";
const FACULTY_LOCAL_KEY = "immba-faculty-v2";
const FACULTY_CATEGORIES = ["Full-time", "Adjunct"];
let facultySeedAttempted = false;

function facultyHeaders(extra) {
  return Object.assign(
    {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    extra || {}
  );
}

function facultyCategory(value) {
  return String(value).toLowerCase().includes("adjunct") || String(value).includes("兼任") ? "Adjunct" : "Full-time";
}

function joinFacultyText(zh, en) {
  const left = String(zh || "").trim();
  const right = String(en || "").trim();
  if (left && right) return `${left} / ${right}`;
  return left || right;
}

function facultyLangText(value, lang) {
  const text = String(value || "");
  const parts = text.split(" / ");
  if (parts.length >= 2) return lang === "zh" ? parts[0] : parts.slice(1).join(" / ");
  return text;
}

function sortFaculty(records) {
  return [...records].sort((a, b) => a.sort_order - b.sort_order || String(a.name).localeCompare(String(b.name), "zh"));
}

function normalizeFaculty(record, index = 0) {
  const name = record.name || joinFacultyText(record.name_zh, record.name_en);
  const title = record.title || joinFacultyText(record.role_zh, record.role_en);
  const education = record.education || joinFacultyText(record.edu_zh, record.edu_en);
  const research = record.research_fields || joinFacultyText(record.spec_zh, record.spec_en);
  const categorySource = record.category || record.role_zh || record.role_en || "";
  return {
    id: String(record.id || `f-${Date.now()}-${index}`),
    name,
    title,
    education,
    research_fields: research,
    email: record.email || "",
    phone: record.phone || record.tel || "",
    website: record.website || record.site || "",
    image_url: record.image_url || record.photo_url || "",
    category: FACULTY_CATEGORIES.includes(record.category) ? record.category : facultyCategory(categorySource),
    sort_order: Number.isFinite(Number(record.sort_order)) ? Number(record.sort_order) : index + 1
  };
}

function loadFacultyLocal() {
  try {
    const raw = localStorage.getItem(FACULTY_LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeFaculty);
    }
  } catch (err) {
    /* ignore */
  }
  return (typeof FACULTY_SEED !== "undefined" ? FACULTY_SEED : []).map(normalizeFaculty);
}

function saveFacultyLocal(records) {
  localStorage.setItem(FACULTY_LOCAL_KEY, JSON.stringify(records.map(normalizeFaculty)));
}

async function facultyRequest(path, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${FACULTY_TABLE}${path || ""}`, {
      ...options,
      signal: controller.signal,
      headers: facultyHeaders(options && options.headers)
    });
    let body = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (err) {
        body = text;
      }
    }
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function listFacultyRecords() {
  const result = await facultyRequest("?select=*&order=sort_order.asc", { method: "GET" });
  if (result.ok && Array.isArray(result.body)) {
    if (!result.body.length && !facultySeedAttempted) {
      facultySeedAttempted = true;
      const seeded = await seedFacultyCloud();
      if (seeded.ok) return listFacultyRecords();
    }
    const records = sortFaculty(result.body.map(normalizeFaculty));
    saveFacultyLocal(records);
    return { source: "supabase", records };
  }
  return { source: "local", records: sortFaculty(loadFacultyLocal()) };
}

async function listPublishedFaculty() {
  const { records } = await listFacultyRecords();
  return records;
}

async function getFacultyById(id) {
  const { records } = await listFacultyRecords();
  return records.find((item) => item.id === id) || null;
}

async function upsertFacultyRecord(record) {
  const next = normalizeFaculty(record);
  const result = await facultyRequest("?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify(next)
  });
  if (result.ok) {
    const { records } = await listFacultyRecords();
    return records.find((item) => item.id === next.id) || next;
  }
  const records = loadFacultyLocal();
  const index = records.findIndex((item) => item.id === next.id);
  if (index >= 0) records[index] = next;
  else records.push(next);
  saveFacultyLocal(records);
  return next;
}

async function deleteFacultyRecord(id) {
  const result = await facultyRequest(`?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!result.ok) {
    saveFacultyLocal(loadFacultyLocal().filter((item) => item.id !== id));
  }
}

async function reorderFaculty(id, direction) {
  const { records } = await listFacultyRecords();
  const index = records.findIndex((item) => item.id === id);
  if (index < 0) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= records.length) return;
  const current = records[index];
  const other = records[swapWith];
  const currentOrder = current.sort_order;
  current.sort_order = other.sort_order;
  other.sort_order = currentOrder;
  await upsertFacultyRecord(current);
  await upsertFacultyRecord(other);
}

async function seedFacultyCloud() {
  const seed = (typeof FACULTY_SEED !== "undefined" ? FACULTY_SEED : []).map(normalizeFaculty);
  const result = await facultyRequest("?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify(seed)
  });
  saveFacultyLocal(seed);
  return result;
}
