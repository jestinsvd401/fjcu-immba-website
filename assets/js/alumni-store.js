const ALUMNI_STORE_KEY = "immba-alumni-v3";
const ALUMNI_ACTIVITY_KEY = "immba-alumni-activity-v2";
const ALUMNI_AUDIT_FIELDS = [
  "full_name",
  "student_id",
  "department",
  "degree_program",
  "admission_year",
  "graduation_year",
  "email",
  "phone",
  "company",
  "job_title",
  "notes"
];
const ALUMNI_DEPARTMENTS = ["EMBA", "ImMBA"];
const ALUMNI_DEGREES = ["Bachelors", "Masters", "Doctoral Program", "Other"];

function seedAlumniRecords() {
  return [
    {
      id: "a-1001",
      full_name: "Wei-Chen Lin",
      student_id: "410012000",
      department: "ImMBA",
      degree_program: "Masters",
      admission_year: "2022",
      graduation_year: "2024",
      email: "weichen.lin@alumni.fju.edu.tw",
      phone: "0912100201",
      company: "Taiwan Semiconductor Manufacturing Company",
      job_title: "Strategy Analyst",
      notes: "Dual-degree track, now in operations planning."
    },
    {
      id: "a-1002",
      full_name: "Amelia Chen",
      student_id: "410012140",
      department: "ImMBA",
      degree_program: "Masters",
      admission_year: "2021",
      graduation_year: "2023",
      email: "amelia.chen@alumni.fju.edu.tw",
      phone: "0933220118",
      company: "Deloitte Taiwan",
      job_title: "Consultant",
      notes: "Exchange semester in Spain."
    },
    {
      id: "a-1003",
      full_name: "Hiroshi Tanaka",
      student_id: "410011980",
      department: "ImMBA",
      degree_program: "Masters",
      admission_year: "2020",
      graduation_year: "2022",
      email: "hiroshi.tanaka@alumni.fju.edu.tw",
      phone: "0904400331",
      company: "Rakuten",
      job_title: "Product Manager",
      notes: "International cohort, Tokyo office."
    },
    {
      id: "a-1004",
      full_name: "Mei-Ling Hsu",
      student_id: "409880220",
      department: "EMBA",
      degree_program: "Masters",
      admission_year: "2019",
      graduation_year: "2021",
      email: "meiling.hsu@alumni.fju.edu.tw",
      phone: "0987441009",
      company: "Cathay Financial Holdings",
      job_title: "Vice President",
      notes: "EMBA weekend cohort."
    },
    {
      id: "a-1005",
      full_name: "Daniel Okoye",
      student_id: "410013070",
      department: "ImMBA",
      degree_program: "Doctoral Program",
      admission_year: "2018",
      graduation_year: "2024",
      email: "daniel.okoye@alumni.fju.edu.tw",
      phone: "0975662440",
      company: "Academia Sinica",
      job_title: "Research Fellow",
      notes: "Continued to doctoral research after imMBA."
    },
    {
      id: "a-1006",
      full_name: "Yu-Hsuan Wu",
      student_id: "407220140",
      department: "EMBA",
      degree_program: "Bachelors",
      admission_year: "2016",
      graduation_year: "2020",
      email: "yuhsuan.wu@alumni.fju.edu.tw",
      phone: "0921778305",
      company: "Uniqlo Taiwan",
      job_title: "Store Development Lead",
      notes: "Later completed EMBA coursework."
    },
    {
      id: "a-1007",
      full_name: "Sofia Martínez",
      student_id: "410012300",
      department: "ImMBA",
      degree_program: "Other",
      admission_year: "2023",
      graduation_year: "",
      email: "sofia.martinez@alumni.fju.edu.tw",
      phone: "0911204887",
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

function alumniCurrentYear() {
  return new Date().getFullYear();
}

function alumniAdmissionYears() {
  const years = [];
  for (let year = alumniCurrentYear(); year >= 2000; year -= 1) years.push(String(year));
  return years;
}

function alumniGraduationYears(admissionYear) {
  const start = Number(admissionYear);
  if (!Number.isFinite(start)) return [];
  const last = alumniCurrentYear() + 6;
  const years = [];
  for (let year = start + 1; year <= last; year += 1) years.push(String(year));
  return years;
}

function alumniDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isAlumniEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function alumniValidationError(record) {
  const item = normalizeAlumni(record);
  if (!/^\d{9}$/.test(item.student_id)) return "Student ID must be exactly 9 digits.";
  const admission = Number(item.admission_year);
  if (!Number.isFinite(admission) || admission < 2000 || admission > alumniCurrentYear()) {
    return "Admission year must be between 2000 and the current year.";
  }
  if (item.graduation_year) {
    const graduation = Number(item.graduation_year);
    if (!Number.isFinite(graduation) || graduation <= admission) {
      return "Graduation year must be later than admission year, or left empty.";
    }
  }
  if (!isAlumniEmail(item.email)) return "Email must use a general format and include @.";
  if (!/^\d{10}$/.test(item.phone)) return "Phone number must be exactly 10 digits.";
  if (!item.department || !item.degree_program) return "Department and degree program must use the dropdown values.";
  return "";
}

function normalizeAlumni(record, index = 0) {
  const admission = String(record.admission_year || "").trim();
  const graduation = String(record.graduation_year || "").trim();
  return {
    id: String(record.id || `a-${Date.now()}-${index}`),
    full_name: String(record.full_name || "").trim(),
    student_id: alumniDigits(record.student_id),
    department: normalizeAlumniDepartment(record.department),
    degree_program: normalizeAlumniDegree(record.degree_program),
    admission_year: admission,
    graduation_year: graduation,
    email: String(record.email || "").trim(),
    phone: alumniDigits(record.phone),
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
  return (window.immbaAuthState && window.immbaAuthState.user && window.immbaAuthState.user.email) || "admin@fju.edu.tw";
}

function alumniRecordLabel(record) {
  const key = (record && (record.student_id || record.id)) || "unknown";
  return `Alumni#${key}`;
}

function describeAlumniChanges(before, after) {
  if (!before) return "New record";
  if (!after) return "Record deleted";
  const parts = ALUMNI_AUDIT_FIELDS.filter((field) => String(before[field] || "") !== String(after[field] || "")).map((field) => {
    const from = before[field] || "—";
    const to = after[field] || "—";
    return `${field} changed from ${from} to ${to}`;
  });
  return parts.length ? parts.join("; ") : "Record saved with no field changes";
}

function logAlumniActivity({ action, record, change, actor }) {
  const entry = {
    id: `act-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    at: new Date().toISOString(),
    admin: actor || alumniActor(),
    action,
    record: record || "Alumni#",
    change: change || ""
  };
  const rows = loadAlumniActivity();
  rows.unshift(entry);
  localStorage.setItem(ALUMNI_ACTIVITY_KEY, JSON.stringify(rows.slice(0, 120)));
}

function seedAlumniActivity() {
  return [
    {
      id: "act-seed-1",
      at: "2026-10-27T10:15:00",
      admin: "admin_A",
      action: "CREATE",
      record: "Alumni#105",
      change: "New record"
    },
    {
      id: "act-seed-2",
      at: "2026-10-27T10:42:00",
      admin: "admin@fju.edu.tw",
      action: "UPDATE",
      record: "Alumni#A20260015",
      change: "company changed from BBC Corp to XYZ Corp; job_title changed from Manager to Senior Manager"
    },
    {
      id: "act-seed-3",
      at: "2026-10-27T11:08:00",
      admin: "admin_A",
      action: "DELETE",
      record: "Alumni#041",
      change: "Record deleted"
    }
  ];
}

function loadAlumniActivity() {
  try {
    const raw = localStorage.getItem(ALUMNI_ACTIVITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (err) {
    /* ignore */
  }
  const seeded = seedAlumniActivity();
  localStorage.setItem(ALUMNI_ACTIVITY_KEY, JSON.stringify(seeded));
  return seeded;
}

function formatAlumniAuditTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "—");
  return date.toLocaleString([], { hour: "2-digit", minute: "2-digit", year: "numeric", month: "2-digit", day: "2-digit" });
}

function alumniAuditSentence(item) {
  return `${item.admin} ${String(item.action || "").toLowerCase()}d ${item.record} at ${formatAlumniAuditTime(item.at)}. ${item.change}`;
}

function listAlumniRecords() {
  return loadAlumniRecords().sort((a, b) => a.full_name.localeCompare(b.full_name) || a.student_id.localeCompare(b.student_id));
}

function getAlumniById(id) {
  return loadAlumniRecords().find((item) => item.id === id) || null;
}

function upsertAlumniRecord(record) {
  const next = normalizeAlumni(record);
  const invalid = alumniValidationError(next);
  if (invalid) throw new Error(invalid);
  const records = loadAlumniRecords();
  const index = records.findIndex((item) => item.id === next.id);
  const existed = index >= 0;
  const before = existed ? records[index] : null;
  if (existed) records[index] = next;
  else records.push(next);
  saveAlumniRecords(records);
  logAlumniActivity({
    action: existed ? "UPDATE" : "CREATE",
    record: alumniRecordLabel(next),
    change: describeAlumniChanges(before, next)
  });
  return next;
}

function deleteAlumniRecord(id) {
  const current = getAlumniById(id);
  saveAlumniRecords(loadAlumniRecords().filter((item) => item.id !== id));
  if (current) {
    logAlumniActivity({
      action: "DELETE",
      record: alumniRecordLabel(current),
      change: "Record deleted"
    });
  }
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
    if (!item.full_name || alumniValidationError(item)) {
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
  logAlumniActivity({
    action: "UPDATE",
    record: `Alumni#batch`,
    change: `Imported ${records.length} record(s); ${skipped} skipped`
  });
  return { imported: records.length, skipped };
}

function alumniCsvTemplate() {
  return [
    "full_name,student_id,department,degree_program,admission_year,graduation_year,email,phone,company,job_title,notes",
    "Jane Example,410019990,ImMBA,Masters,2022,2024,jane@example.com,0912000000,Example Co,Analyst,Imported sample"
  ].join("\n");
}
