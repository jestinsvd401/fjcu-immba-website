const ALUMNI_STORE_KEY = "immba-alumni-v1";
const ALUMNI_ACTIVITY_KEY = "immba-alumni-activity-v1";
const ALUMNI_DEPARTMENTS = ["EMBA", "ImMBA"];
const ALUMNI_DEGREES = ["Bachelors", "Masters", "Doctoral Program", "Other"];

function seedAlumniRecords() {
  return [
    {
      id: "a-1001",
      full_name: "Wei-Chen Lin",
      student_id: "410012001",
      department: "ImMBA",
      degree_program: "Masters",
      admission_year: "2022",
      graduation_year: "2024",
      email: "weichen.lin@alumni.fju.edu.tw",
      phone: "+886-912-100-201",
      company: "Taiwan Semiconductor Manufacturing Company",
      job_title: "Strategy Analyst",
      notes: "Dual-degree track, now in operations planning."
    },
    {
      id: "a-1002",
      full_name: "Amelia Chen",
      student_id: "410012014",
      department: "ImMBA",
      degree_program: "Masters",
      admission_year: "2021",
      graduation_year: "2023",
      email: "amelia.chen@alumni.fju.edu.tw",
      phone: "+886-933-220-118",
      company: "Deloitte Taiwan",
      job_title: "Consultant",
      notes: "Exchange semester in Spain."
    },
    {
      id: "a-1003",
      full_name: "Hiroshi Tanaka",
      student_id: "410011988",
      department: "ImMBA",
      degree_program: "Masters",
      admission_year: "2020",
      graduation_year: "2022",
      email: "hiroshi.tanaka@alumni.fju.edu.tw",
      phone: "+81-90-4400-3311",
      company: "Rakuten",
      job_title: "Product Manager",
      notes: "International cohort, Tokyo office."
    },
    {
      id: "a-1004",
      full_name: "Mei-Ling Hsu",
      student_id: "409880221",
      department: "EMBA",
      degree_program: "Masters",
      admission_year: "2019",
      graduation_year: "2021",
      email: "meiling.hsu@alumni.fju.edu.tw",
      phone: "+886-987-441-009",
      company: "Cathay Financial Holdings",
      job_title: "Vice President",
      notes: "EMBA weekend cohort."
    },
    {
      id: "a-1005",
      full_name: "Daniel Okoye",
      student_id: "410013077",
      department: "ImMBA",
      degree_program: "Doctoral Program",
      admission_year: "2018",
      graduation_year: "2024",
      email: "daniel.okoye@alumni.fju.edu.tw",
      phone: "+886-975-662-440",
      company: "Academia Sinica",
      job_title: "Research Fellow",
      notes: "Continued to doctoral research after imMBA."
    },
    {
      id: "a-1006",
      full_name: "Yu-Hsuan Wu",
      student_id: "407220145",
      department: "EMBA",
      degree_program: "Bachelors",
      admission_year: "2016",
      graduation_year: "2020",
      email: "yuhsuan.wu@alumni.fju.edu.tw",
      phone: "+886-921-778-305",
      company: "Uniqlo Taiwan",
      job_title: "Store Development Lead",
      notes: "Later completed EMBA coursework."
    },
    {
      id: "a-1007",
      full_name: "Sofia Martínez",
      student_id: "410012301",
      department: "ImMBA",
      degree_program: "Other",
      admission_year: "2023",
      graduation_year: "2025",
      email: "sofia.martinez@alumni.fju.edu.tw",
      phone: "+34-611-204-887",
      company: "IESE Alumni Network",
      job_title: "Partnership Coordinator",
      notes: "Certificate / other pathway."
    }
  ].map((item) => normalizeAlumni(item));
}

function normalizeAlumniDepartment(value) {
  const raw = String(value || "").trim();
  if (/^emba$/i.test(raw)) return "EMBA";
  if (/^i+mmba$/i.test(raw) || /^imba$/i.test(raw)) return "ImMBA";
  return "";
}

function normalizeAlumniDegree(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "bachelors" || raw === "bachelor" || raw === "bachelor's") return "Bachelors";
  if (raw === "masters" || raw === "master" || raw === "master's" || raw === "mba") return "Masters";
  if (raw.includes("doctoral") || raw === "phd" || raw === "ph.d.") return "Doctoral Program";
  if (raw === "other") return "Other";
  return "";
}

function normalizeAlumni(record, index = 0) {
  return {
    id: String(record.id || `a-${Date.now()}-${index}`),
    full_name: String(record.full_name || "").trim(),
    student_id: String(record.student_id || "").trim(),
    department: normalizeAlumniDepartment(record.department),
    degree_program: normalizeAlumniDegree(record.degree_program),
    admission_year: String(record.admission_year || "").trim(),
    graduation_year: String(record.graduation_year || "").trim(),
    email: String(record.email || "").trim(),
    phone: String(record.phone || "").trim(),
    company: String(record.company || "").trim(),
    job_title: String(record.job_title || "").trim(),
    notes: String(record.notes || "").trim()
  };
}

function loadAlumniRecords() {
  try {
    const raw = localStorage.getItem(ALUMNI_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeAlumni);
    }
  } catch (err) {
    /* ignore */
  }
  const seeded = seedAlumniRecords();
  saveAlumniRecords(seeded, { silent: true });
  return seeded;
}

function saveAlumniRecords(records, options = {}) {
  localStorage.setItem(ALUMNI_STORE_KEY, JSON.stringify(records.map((item) => normalizeAlumni(item))));
  if (!options.silent && options.activity) logAlumniActivity(options.activity);
}

function alumniActor() {
  return (window.immbaAuthState && window.immbaAuthState.user && window.immbaAuthState.user.email) || "administrator";
}

function logAlumniActivity(action, detail) {
  const entry = {
    id: `act-${Date.now()}`,
    at: new Date().toISOString(),
    actor: alumniActor(),
    action,
    detail: detail || ""
  };
  const rows = loadAlumniActivity();
  rows.unshift(entry);
  localStorage.setItem(ALUMNI_ACTIVITY_KEY, JSON.stringify(rows.slice(0, 80)));
}

function loadAlumniActivity() {
  try {
    const raw = localStorage.getItem(ALUMNI_ACTIVITY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function listAlumniRecords() {
  return loadAlumniRecords().sort((a, b) => a.full_name.localeCompare(b.full_name) || a.student_id.localeCompare(b.student_id));
}

function getAlumniById(id) {
  return loadAlumniRecords().find((item) => item.id === id) || null;
}

function upsertAlumniRecord(record) {
  const next = normalizeAlumni(record);
  if (!next.department || !next.degree_program) {
    throw new Error("department and degree_program must use the dropdown values");
  }
  const records = loadAlumniRecords();
  const index = records.findIndex((item) => item.id === next.id);
  const existed = index >= 0;
  if (existed) records[index] = next;
  else records.push(next);
  saveAlumniRecords(records);
  logAlumniActivity(existed ? "edit" : "add", `${next.full_name} (${next.student_id || next.email})`);
  return next;
}

function deleteAlumniRecord(id) {
  const current = getAlumniById(id);
  saveAlumniRecords(loadAlumniRecords().filter((item) => item.id !== id));
  if (current) logAlumniActivity("delete", `${current.full_name} (${current.student_id || current.email})`);
}

function filterAlumniRecords(records, filters = {}) {
  const q = String(filters.q || "").trim().toLowerCase();
  const department = normalizeAlumniDepartment(filters.department);
  const degree = normalizeAlumniDegree(filters.degree_program);
  const year = String(filters.graduation_year || "").trim();
  return records.filter((item) => {
    if (department && item.department !== department) return false;
    if (degree && item.degree_program !== degree) return false;
    if (year && item.graduation_year !== year) return false;
    if (!q) return true;
    const blob = [item.full_name, item.student_id, item.email, item.company, item.job_title, item.phone].join(" ").toLowerCase();
    return blob.includes(q);
  });
}

function parseAlumniCsv(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return { records: [], skipped: 0 };
  const headers = splitAlumniCsvLine(lines[0]).map((cell) => cell.trim().toLowerCase());
  const records = [];
  let skipped = 0;
  lines.slice(1).forEach((line, index) => {
    const cells = splitAlumniCsvLine(line);
    const row = {};
    headers.forEach((key, i) => {
      row[key] = cells[i] || "";
    });
    const item = normalizeAlumni(
      {
        id: row.id || `a-import-${Date.now()}-${index}`,
        full_name: row.full_name,
        student_id: row.student_id,
        department: row.department,
        degree_program: row.degree_program,
        admission_year: row.admission_year,
        graduation_year: row.graduation_year,
        email: row.email,
        phone: row.phone,
        company: row.company,
        job_title: row.job_title,
        notes: row.notes
      },
      index
    );
    if (!item.full_name || !item.department || !item.degree_program) {
      skipped += 1;
      return;
    }
    records.push(item);
  });
  return { records, skipped };
}

function splitAlumniCsvLine(line) {
  const out = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(current);
      current = "";
    } else current += ch;
  }
  out.push(current);
  return out;
}

function importAlumniRecords(text) {
  const { records, skipped } = parseAlumniCsv(text);
  if (!records.length) return { imported: 0, skipped };
  const existing = loadAlumniRecords();
  records.forEach((item) => {
    const index = existing.findIndex((row) => row.student_id && row.student_id === item.student_id);
    if (index >= 0) existing[index] = { ...existing[index], ...item, id: existing[index].id };
    else existing.push(item);
  });
  saveAlumniRecords(existing);
  logAlumniActivity("import", `${records.length} row(s), ${skipped} skipped`);
  return { imported: records.length, skipped };
}

function alumniCsvTemplate() {
  return [
    "full_name,student_id,department,degree_program,admission_year,graduation_year,email,phone,company,job_title,notes",
    "Jane Example,410019999,ImMBA,Masters,2022,2024,jane@example.com,+886-900-000-000,Example Co,Analyst,Imported sample"
  ].join("\n");
}
