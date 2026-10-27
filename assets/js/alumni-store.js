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
const ALUMNI_CSV_REQUIRED_COLUMNS = [
  "full_name",
  "student_id",
  "department",
  "degree_program",
  "admission_year",
  "email",
  "phone"
];
const ALUMNI_CSV_OPTIONAL_COLUMNS = ["graduation_year", "company", "job_title", "notes", "id"];
const ALUMNI_CSV_KNOWN_COLUMNS = ALUMNI_CSV_REQUIRED_COLUMNS.concat(ALUMNI_CSV_OPTIONAL_COLUMNS);

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
  const admission = String(filters.admission_year || "").trim();
  return records.filter((item) => {
    if (department && item.department !== department) return false;
    if (degree && item.degree_program !== degree) return false;
    if (admission && item.admission_year !== admission) return false;
    if (year && item.graduation_year !== year) return false;
    if (!q) return true;
    const blob = [item.full_name, item.student_id, item.email, item.company, item.job_title, item.phone, item.admission_year, item.graduation_year].join(" ").toLowerCase();
    return blob.includes(q);
  });
}

function normalizeAlumniCsvHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isAlumniCsvRowEmpty(cells) {
  return cells.every((cell) => !String(cell || "").trim());
}

function alumniCsvIssue(row, issue, detail) {
  return { row, issue, detail };
}

async function readAlumniCsvFile(file) {
  const issues = [];
  if (!file) return { text: "", issues: [alumniCsvIssue(0, "encoding", "No file was selected.")] };
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (!bytes.length) {
    return { text: "", issues: [alumniCsvIssue(0, "encoding", "The file is empty.")] };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return {
      text: new TextDecoder("utf-16le").decode(bytes),
      issues: [alumniCsvIssue(0, "encoding", "The file is UTF-16. Save it as UTF-8 CSV before importing.")]
    };
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return {
      text: new TextDecoder("utf-16be").decode(bytes),
      issues: [alumniCsvIssue(0, "encoding", "The file is UTF-16. Save it as UTF-8 CSV before importing.")]
    };
  }
  const sample = bytes.subarray(0, Math.min(bytes.length, 400));
  if (Array.from(sample).some((byte) => byte === 0)) {
    issues.push(alumniCsvIssue(0, "encoding", "The file contains null bytes, so it is not a valid UTF-8 CSV."));
  }
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (/\uFFFD/.test(text)) {
      issues.push(alumniCsvIssue(0, "encoding", "The file contains replacement characters. Save it as UTF-8."));
    }
    return { text, issues };
  } catch (err) {
    const text = new TextDecoder("utf-8").decode(bytes);
    issues.push(alumniCsvIssue(0, "encoding", "The file is not valid UTF-8. Save it as UTF-8 CSV."));
    return { text, issues };
  }
}

function validateAlumniCsv(text, existing = []) {
  const errors = [];
  const warnings = [];
  const records = [];
  const raw = String(text || "").replace(/^\uFEFF/, "");
  if (!raw.trim()) {
    errors.push(alumniCsvIssue(0, "encoding", "The CSV has no readable text."));
    return { ok: false, records, errors, warnings };
  }
  if (/[\uFFFD]/.test(raw) || /Ã.|Â.|â€™|â€/.test(raw.slice(0, 400))) {
    errors.push(alumniCsvIssue(0, "encoding", "The file looks mis-encoded. Save it as UTF-8 CSV."));
  }
  const lines = raw.split(/\r?\n/);
  if (!lines.length || isAlumniCsvRowEmpty(splitAlumniCsvLine(lines[0]))) {
    errors.push(alumniCsvIssue(1, "columns", "The first row must contain column names."));
    return { ok: false, records, errors, warnings };
  }
  const rawHeaders = splitAlumniCsvLine(lines[0]).map((cell) => String(cell || "").trim());
  const headers = rawHeaders.map(normalizeAlumniCsvHeader);
  const missing = ALUMNI_CSV_REQUIRED_COLUMNS.filter((name) => !headers.includes(name));
  if (missing.length) {
    errors.push(alumniCsvIssue(1, "columns", `Incorrect or missing column names: ${missing.join(", ")}.`));
  }
  const unknown = headers.filter((name) => name && !ALUMNI_CSV_KNOWN_COLUMNS.includes(name));
  if (unknown.length) {
    errors.push(alumniCsvIssue(1, "columns", `Unknown column names: ${unknown.join(", ")}. Use the template headers.`));
  }
  if (new Set(headers.filter(Boolean)).size !== headers.filter(Boolean).length) {
    errors.push(alumniCsvIssue(1, "columns", "Duplicate column names were found in the header row."));
  }
  const dataLines = lines.slice(1);
  if (!dataLines.some((line) => !isAlumniCsvRowEmpty(splitAlumniCsvLine(line)))) {
    errors.push(alumniCsvIssue(0, "empty", "The CSV has no data rows."));
    return { ok: false, records, errors, warnings };
  }
  const fileIds = new Map();
  const fileEmails = new Map();
  const existingById = new Map(existing.map((item) => [item.student_id, item]));
  const existingByEmail = new Map(existing.filter((item) => item.email).map((item) => [item.email.toLowerCase(), item]));
  dataLines.forEach((line, index) => {
    const rowNumber = index + 2;
    const cells = splitAlumniCsvLine(line);
    if (isAlumniCsvRowEmpty(cells)) {
      errors.push(alumniCsvIssue(rowNumber, "empty", "Empty row."));
      return;
    }
    const row = {};
    headers.forEach((key, i) => {
      if (key) row[key] = String(cells[i] || "").trim();
    });
    const requiredMissing = ALUMNI_CSV_REQUIRED_COLUMNS.filter((key) => !String(row[key] || "").trim());
    if (requiredMissing.length) {
      errors.push(alumniCsvIssue(rowNumber, "required", `Missing required fields: ${requiredMissing.join(", ")}.`));
    }
    if (row.degree_program && !normalizeAlumniDegree(row.degree_program)) {
      errors.push(
        alumniCsvIssue(
          rowNumber,
          "degree_program",
          `Invalid degree_program "${row.degree_program}". Use ${ALUMNI_DEGREES.join(", ")}.`
        )
      );
    }
    if (row.department && !normalizeAlumniDepartment(row.department)) {
      errors.push(alumniCsvIssue(rowNumber, "required", `Invalid department "${row.department}". Use ${ALUMNI_DEPARTMENTS.join(" or ")}.`));
    }
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
    const fieldError = alumniValidationError(item);
    if (fieldError && !requiredMissing.length) {
      errors.push(alumniCsvIssue(rowNumber, "record", fieldError));
    }
    if (item.student_id) {
      if (fileIds.has(item.student_id)) {
        errors.push(alumniCsvIssue(rowNumber, "duplicate", `Duplicate student_id ${item.student_id} also appears on row ${fileIds.get(item.student_id)}.`));
      } else {
        fileIds.set(item.student_id, rowNumber);
      }
      if (existingById.has(item.student_id)) {
        warnings.push(alumniCsvIssue(rowNumber, "duplicate", `student_id ${item.student_id} already exists and would be updated.`));
      }
    }
    if (item.email) {
      const emailKey = item.email.toLowerCase();
      if (fileEmails.has(emailKey)) {
        errors.push(alumniCsvIssue(rowNumber, "duplicate", `Duplicate email ${item.email} also appears on row ${fileEmails.get(emailKey)}.`));
      } else {
        fileEmails.set(emailKey, rowNumber);
      }
      const other = existingByEmail.get(emailKey);
      if (other && other.student_id !== item.student_id) {
        errors.push(alumniCsvIssue(rowNumber, "duplicate", `Email ${item.email} already belongs to ${alumniRecordLabel(other)}.`));
      }
    }
    if (!requiredMissing.length && !fieldError && item.degree_program) records.push(item);
  });
  return { ok: !errors.length, records, errors, warnings };
}

function parseAlumniCsv(text) {
  const report = validateAlumniCsv(text, []);
  return { records: report.records, skipped: report.errors.filter((item) => item.row > 1).length, report };
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

function importAlumniRecords(text, existingRecords) {
  const report = validateAlumniCsv(text, existingRecords || loadAlumniRecords());
  if (!report.ok) return { imported: 0, skipped: report.errors.length, report };
  const { records } = report;
  const skipped = report.warnings.length;
  if (!records.length) return { imported: 0, skipped, report };
  const existing = loadAlumniRecords();
  records.forEach((item) => {
    const index = existing.findIndex((row) => row.student_id && row.student_id === item.student_id);
    if (index >= 0) {
      const before = existing[index];
      const next = { ...before, ...item, id: before.id };
      existing[index] = next;
      logAlumniActivity({
        action: "UPDATE",
        record: alumniRecordLabel(next),
        change: describeAlumniChanges(before, next)
      });
    } else {
      existing.push(item);
      logAlumniActivity({
        action: "CREATE",
        record: alumniRecordLabel(item),
        change: describeAlumniChanges(null, item)
      });
    }
  });
  saveAlumniRecords(existing);
  return { imported: records.length, skipped, report };
}

function alumniCsvTemplate() {
  return [
    "full_name,student_id,department,degree_program,admission_year,graduation_year,email,phone,company,job_title,notes",
    "Jane Example,410019990,ImMBA,Masters,2022,2024,jane@example.com,0912000000,Example Co,Analyst,Imported sample"
  ].join("\n");
}
