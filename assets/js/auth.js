const AUTH_REDIRECT = () => new URL("auth.html", location.href).href;

function authClient() {
  if (!window.__immbaAuth) {
    window.__immbaAuth = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true
      }
    });
  }
  return window.__immbaAuth;
}

function emptyAuthState() {
  return { ready: true, session: null, user: null, profile: null, role: "", emailConfirmed: false };
}

window.immbaAuthState = window.immbaAuthState || emptyAuthState();

function getAuthAccessToken() {
  return window.immbaAuthState && window.immbaAuthState.session && window.immbaAuthState.session.access_token;
}

function canEditContent() {
  const role = window.immbaAuthState && window.immbaAuthState.role;
  return role === "admin" || role === "super_admin";
}

function isSuperAdmin() {
  return window.immbaAuthState && window.immbaAuthState.role === "super_admin";
}

function authCopy(lang) {
  const zh = lang === "zh";
  return {
    title: zh ? "後台登入" : "Back office sign-in",
    lead: zh ? "先驗證身分，再依角色授權進入後台。" : "Authenticate first. Authorization depends on your role.",
    registerTitle: zh ? "註冊帳號" : "Register",
    resetTitle: zh ? "重設密碼" : "Reset password",
    updateTitle: zh ? "設定新密碼" : "Set a new password",
    verifyTitle: zh ? "請驗證電子郵件" : "Verify your email",
    pendingTitle: zh ? "等待核准" : "Waiting for approval",
    rejectedTitle: zh ? "申請未通過" : "Request declined",
    email: zh ? "電子郵件" : "Email",
    fullName: zh ? "姓名" : "Full name",
    password: zh ? "密碼" : "Password",
    passwordNew: zh ? "新密碼" : "New password",
    login: zh ? "登入" : "Log in",
    register: zh ? "註冊" : "Register",
    reset: zh ? "寄出重設信件" : "Send reset email",
    savePassword: zh ? "儲存新密碼" : "Save new password",
    signOut: zh ? "登出" : "Sign out",
    haveAccount: zh ? "已有帳號？登入" : "Already registered? Log in",
    needAccount: zh ? "建立帳號" : "Create an account",
    forgot: zh ? "忘記密碼" : "Forgot password",
    backLogin: zh ? "返回登入" : "Back to sign-in",
    verifyLead: zh ? "請到信箱點選確認連結，證明這個信箱屬於你。" : "Open the confirmation link in your email to prove this address belongs to you.",
    pendingLead: zh ? "你已完成註冊與信箱驗證，但還不能進入後台。請等待 super_admin 核准。" : "You are registered and verified, but cannot access the back office yet. A super admin must approve you.",
    rejectedLead: zh ? "你的管理員申請已被拒絕。" : "Your administrator request was rejected.",
    flow: zh ? "Register → Verify Email → pending → Super Admin Review → admin" : "Register → Verify Email → pending → Super Admin Review → admin",
    flowRegister: "Register",
    flowVerify: zh ? "Verify Email" : "Verify Email",
    flowPending: "pending",
    flowReview: "Super Admin Review",
    flowAdmin: "admin",
    who: zh ? "Authentication：你是誰？" : "Authentication: who are you?",
    what: zh ? "Authorization：你可以做什麼？" : "Authorization: what are you allowed to do?",
    rolePending: "pending",
    roleAdmin: "admin",
    roleSuper: "super_admin",
    tabAccess: zh ? "管理員核准儀表板" : "Administrator Approval Dashboard",
    pendingQueue: zh ? "待審核的管理員申請" : "Pending administrator requests",
    allApplications: zh ? "全部申請狀態" : "All applications",
    applicant: zh ? "申請人" : "Applicant",
    applicantId: zh ? "申請人 ID" : "Applicant ID",
    requestedAt: zh ? "申請時間" : "Requested",
    reviewedAt: zh ? "審核時間" : "Reviewed",
    emptyPending: zh ? "目前沒有待審核的管理員申請。" : "There are no pending administrator requests.",
    approve: zh ? "核准為 admin" : "Approve as admin",
    reject: zh ? "拒絕" : "Reject",
    emptyQueue: zh ? "目前沒有帳號資料。" : "No accounts found.",
    cannotApprove: zh ? "只有 super_admin 可以核准權限。" : "Only a super admin can approve access.",
    statusLabel: zh ? "核准狀態" : "Approval",
    statusApproved: zh ? "已核准" : "Approved",
    statusWaiting: zh ? "pending — Super Admin Review" : "pending — Super Admin Review",
    statusDenied: zh ? "未核准" : "Not approved",
    statusSuper: zh ? "super_admin" : "super_admin",
    confirmApprove: zh ? "確定核准此帳號為 admin？" : "Approve this account as admin?",
    confirmReject: zh ? "確定將此帳號標示為未核准？" : "Mark this account as not approved?",
    approved: zh ? "已核准" : "Approved",
    approvedDetail: zh ? "此帳號現在是 admin，可以進入後台。" : "This account is now an admin and can use the back office.",
    rejected: zh ? "未核准" : "Not approved",
    rejectedDetail: zh ? "此帳號的申請已被拒絕。" : "This account’s request was declined.",
    notSaved: zh ? "未核准：變更沒有寫入。" : "Not approved: the change was not saved.",
    yourStatus: zh ? "你的核准狀態" : "Your approval status",
    signedInAs: zh ? "目前登入" : "Signed in as",
    roleLabel: zh ? "角色" : "Role",
    error: zh ? "無法完成操作。" : "That request could not be completed.",
    sent: zh ? "信件已寄出，請查收。" : "Email sent. Please check your inbox.",
    registered: zh ? "請先到信箱完成驗證，再登入。" : "Check your email to verify, then sign in.",
    saved: zh ? "密碼已更新，請重新登入。" : "Password updated. Please sign in again.",
    needSql: zh ? "尚未建立 profiles 資料表。請在 Supabase SQL Editor 執行 supabase/auth.sql。" : "The profiles table is missing. Run supabase/auth.sql in the Supabase SQL editor."
  };
}

function authFormCard(title, lead, body) {
  return `${typeof hero === "function" ? hero(title, lead) : `<section class="page-hero"><div class="container"><h1>${title}</h1><p>${lead}</p></div></section>`}
    <section class="section"><div class="container">
      <div class="auth-card">${body}</div>
    </div></section>`;
}

function authLinks(t) {
  return `<p class="auth-links">
    <a href="${withLang("auth.html")}">${t.backLogin}</a>
    <a href="${withLang("auth.html")}&view=register">${t.needAccount}</a>
    <a href="${withLang("auth.html")}&view=reset">${t.forgot}</a>
  </p>`;
}

function authPage(lang) {
  const t = authCopy(lang);
  const view = new URLSearchParams(location.search).get("view") || "login";
  const flash = sessionStorage.getItem("immba-auth-flash") || "";
  sessionStorage.removeItem("immba-auth-flash");
  const flashHtml = flash ? `<p class="admin-flash">${escapeHtml(flash)}</p>` : "";
  if (view === "register") {
    return authFormCard(
      t.registerTitle,
      t.who,
      `${flashHtml}
      <p class="muted">${t.flow}</p>
      <form id="auth-register-form" class="admin-form">
        <label>${t.fullName}<input type="text" name="full_name" required autocomplete="name"></label>
        <label>${t.email}<input type="email" name="email" required autocomplete="email"></label>
        <label>${t.password}<input type="password" name="password" required minlength="6" autocomplete="new-password"></label>
        <p class="admin-flash" id="auth-error" hidden></p>
        <button class="btn btn-action" type="submit">${t.register}</button>
      </form>
      ${authLinks(t)}`
    );
  }
  if (view === "reset") {
    return authFormCard(
      t.resetTitle,
      t.who,
      `${flashHtml}
      <form id="auth-reset-form" class="admin-form">
        <label>${t.email}<input type="email" name="email" required autocomplete="email"></label>
        <p class="admin-flash" id="auth-error" hidden></p>
        <button class="btn btn-action" type="submit">${t.reset}</button>
      </form>
      ${authLinks(t)}`
    );
  }
  if (view === "update") {
    return authFormCard(
      t.updateTitle,
      t.who,
      `${flashHtml}
      <form id="auth-update-form" class="admin-form">
        <label>${t.passwordNew}<input type="password" name="password" required minlength="6" autocomplete="new-password"></label>
        <p class="admin-flash" id="auth-error" hidden></p>
        <button class="btn btn-action" type="submit">${t.savePassword}</button>
      </form>`
    );
  }
  return authFormCard(
    t.title,
    `${t.who} ${t.what}`,
    `${flashHtml}
    <form id="auth-login-form" class="admin-form">
      <label>${t.email}<input type="email" name="email" required autocomplete="email"></label>
      <label>${t.password}<input type="password" name="password" required autocomplete="current-password"></label>
      <p class="admin-flash" id="auth-error" hidden></p>
      <button class="btn btn-action" type="submit">${t.login}</button>
    </form>
    ${authLinks(t)}`
  );
}

function authStatusPage(lang, kind) {
  const t = authCopy(lang);
  const map = {
    verify: [t.verifyTitle, t.verifyLead],
    pending: [t.pendingTitle, t.pendingLead],
    rejected: [t.rejectedTitle, t.rejectedLead],
    sql: [t.title, t.needSql]
  };
  const [title, lead] = map[kind] || map.pending;
  const email = (window.immbaAuthState.user && window.immbaAuthState.user.email) || "";
  const role = window.immbaAuthState.role || "pending";
  const approved = role === "admin" || role === "super_admin";
  const statusText = approved ? t.statusApproved : kind === "rejected" || role === "rejected" ? t.statusDenied : t.statusWaiting;
  return authFormCard(
    title,
    lead,
    `${approvalFlowHtml(t, approved ? "admin" : kind === "verify" ? "verify" : "pending")}
     <div class="access-confirm ${approved ? "is-approved" : "is-denied"}" role="status">
       <strong>${t.yourStatus}: ${statusText}</strong>
     </div>
     <p><strong>${t.signedInAs}:</strong> ${escapeHtml(email)}</p>
     <p><strong>${t.roleLabel}:</strong> ${escapeHtml(role)}</p>
     <p class="muted">${t.flow}</p>
     <div class="action-row">
       <button class="btn btn-action-secondary" type="button" id="auth-signout">${t.signOut}</button>
     </div>`
  );
}

async function fetchProfile(userId) {
  const client = authClient();
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error && (error.code === "PGRST205" || /profiles/i.test(error.message || ""))) {
    return { missingTable: true, profile: null };
  }
  return { missingTable: false, profile: data || null };
}

async function ensureOwnProfile() {
  const client = authClient();
  const { data, error } = await client.rpc("ensure_own_profile");
  if (error) return null;
  return data || null;
}

async function refreshAuthState() {
  const client = authClient();
  const { data } = await client.auth.getSession();
  const session = data.session || null;
  const user = session && session.user ? session.user : null;
  const emailConfirmed = !!(user && (user.email_confirmed_at || user.confirmed_at));
  let profile = null;
  let missingTable = false;
  if (user) {
    const result = await fetchProfile(user.id);
    profile = result.profile;
    missingTable = result.missingTable;
    if (!missingTable) {
      const ensured = await ensureOwnProfile();
      if (ensured) profile = ensured;
    }
  }
  window.immbaAuthState = {
    ready: true,
    session,
    user,
    profile,
    role: profile ? profile.role : "",
    emailConfirmed,
    missingTable
  };
  return window.immbaAuthState;
}

async function initAuth() {
  if (typeof window.supabase === "undefined") {
    window.immbaAuthState = emptyAuthState();
    return window.immbaAuthState;
  }
  const client = authClient();
  client.auth.onAuthStateChange((_event, session) => {
    window.immbaAuthState.session = session;
    window.immbaAuthState.user = session && session.user ? session.user : null;
  });
  await refreshAuthState();
  const hash = location.hash || "";
  if (hash.includes("type=recovery")) {
    const url = new URL(location.href);
    url.searchParams.set("view", "update");
    history.replaceState({}, "", url.pathname + url.search);
  }
  return window.immbaAuthState;
}

function showAuthError(err, fallback) {
  const node = document.getElementById("auth-error");
  const message = (err && (err.message || err.error_description)) || fallback;
  if (node) {
    node.hidden = false;
    node.textContent = message;
    return;
  }
  alert(message);
}

function bindAuthForms() {
  const lang = getLang();
  const t = authCopy(lang);
  const client = typeof window.supabase === "undefined" ? null : authClient();
  document.getElementById("auth-signout")?.addEventListener("click", async () => {
    if (client) await client.auth.signOut();
    location.href = withLang("auth.html");
  });
  document.getElementById("auth-login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const { error } = await client.auth.signInWithPassword({
      email: String(data.get("email") || "").trim(),
      password: String(data.get("password") || "")
    });
    if (error) return showAuthError(error, t.error);
    location.href = withLang("admin.html");
  });
  document.getElementById("auth-register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const { error } = await client.auth.signUp({
      email: String(data.get("email") || "").trim(),
      password: String(data.get("password") || ""),
      options: {
        emailRedirectTo: AUTH_REDIRECT(),
        data: { full_name: String(data.get("full_name") || "").trim() }
      }
    });
    if (error) return showAuthError(error, t.error);
    sessionStorage.setItem("immba-auth-flash", t.registered);
    location.href = withLang("auth.html");
  });
  document.getElementById("auth-reset-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const { error } = await client.auth.resetPasswordForEmail(String(data.get("email") || "").trim(), {
      redirectTo: AUTH_REDIRECT()
    });
    if (error) return showAuthError(error, t.error);
    sessionStorage.setItem("immba-auth-flash", t.sent);
    location.href = withLang("auth.html");
  });
  document.getElementById("auth-update-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const { error } = await client.auth.updateUser({ password: String(data.get("password") || "") });
    if (error) return showAuthError(error, t.error);
    await client.auth.signOut();
    sessionStorage.setItem("immba-auth-flash", t.saved);
    location.href = withLang("auth.html");
  });
}

async function listAdminProfiles() {
  const { data, error } = await authClient().from("profiles").select("*").order("created_at", { ascending: true });
  if (error) return { records: [], error };
  return { records: data || [], error: null };
}

async function setProfileRole(id, role) {
  const now = new Date().toISOString();
  const reviewer = window.immbaAuthState.user ? window.immbaAuthState.user.id : null;
  const patch = {
    role,
    reviewed_at: now,
    approved_at: role === "admin" ? now : null,
    approved_by: reviewer
  };
  return authClient().from("profiles").update(patch).eq("id", id).select("id, role, email, full_name").maybeSingle();
}

const ACCESS_FLASH_KEY = "immba-access-flash";

function accessActionIcon(kind) {
  if (kind === "approve") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.3 16.3 4.7 11.7l1.4-1.4 3.2 3.2 8.6-8.6 1.4 1.4z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z"/></svg>`;
}

function accessStatusMeta(role, t) {
  if (role === "super_admin") return { label: t.statusSuper, cls: "admin-status-published" };
  if (role === "admin") return { label: t.statusApproved, cls: "admin-status-approved" };
  if (role === "rejected") return { label: t.statusDenied, cls: "admin-status-denied" };
  return { label: t.statusWaiting, cls: "admin-status-waiting" };
}

function readAccessFlash() {
  try {
    const raw = sessionStorage.getItem(ACCESS_FLASH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(ACCESS_FLASH_KEY);
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function writeAccessFlash(payload) {
  sessionStorage.setItem(ACCESS_FLASH_KEY, JSON.stringify(payload));
}

function accessFlashHtml(flash, t) {
  if (!flash) return `<div class="access-confirm" id="access-flash" hidden></div>`;
  const ok = !!flash.ok;
  const title = ok ? t.approved : t.rejected;
  const email = flash.email ? `<span class="access-confirm-email">${escapeHtml(flash.email)}</span>` : "";
  return `<div class="access-confirm ${ok ? "is-approved" : "is-denied"}" id="access-flash" role="status">
    <strong>${ok ? t.statusApproved : t.statusDenied}</strong>
    <p>${email} ${escapeHtml(flash.message || title)}</p>
  </div>`;
}

function approvalFlowHtml(t, current) {
  const steps = [
    ["register", t.flowRegister],
    ["verify", t.flowVerify],
    ["pending", t.flowPending],
    ["review", t.flowReview],
    ["admin", t.flowAdmin]
  ];
  return `<ol class="approval-flow" aria-label="${t.flow}">
    ${steps
      .map(([key, label]) => `<li class="${key === current ? "is-current" : ""}">${escapeHtml(label)}</li>`)
      .join("")}
  </ol>`;
}

function formatAccessStamp(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function applicantName(item) {
  return (item.full_name || "").trim() || item.email || item.id;
}

function accessActionsHtml(item, t, superAdmin) {
  if (item.role === "super_admin") return "";
  const disabled = superAdmin ? "" : " disabled";
  return `<div class="approval-actions">
    <button class="btn btn-action access-approve" type="button" data-id="${item.id}" data-email="${escapeHtml(item.email)}"${disabled}>${t.approve}</button>
    <button class="btn btn-action-secondary access-reject" type="button" data-id="${item.id}" data-email="${escapeHtml(item.email)}"${disabled}>${t.reject}</button>
  </div>`;
}

function applicantDetailsHtml(item, t) {
  const status = accessStatusMeta(item.role, t);
  return `<dl class="applicant-details">
    <div><dt>${t.applicant}</dt><dd>${escapeHtml(applicantName(item))}</dd></div>
    <div><dt>${t.fullName}</dt><dd>${escapeHtml(item.full_name || "—")}</dd></div>
    <div><dt>${t.email}</dt><dd>${escapeHtml(item.email || "—")}</dd></div>
    <div><dt>${t.applicantId}</dt><dd>${escapeHtml(item.id)}</dd></div>
    <div><dt>${t.requestedAt}</dt><dd>${escapeHtml(formatAccessStamp(item.created_at))}</dd></div>
    <div><dt>${t.reviewedAt}</dt><dd>${escapeHtml(formatAccessStamp(item.reviewed_at || item.approved_at))}</dd></div>
    <div><dt>${t.statusLabel}</dt><dd><span class="admin-status ${status.cls}">${status.label}</span></dd></div>
    <div><dt>${t.roleLabel}</dt><dd>${escapeHtml(item.role || "pending")}</dd></div>
  </dl>`;
}

function adminAccessPage(lang) {
  const t = authCopy(lang);
  return `
    ${hero(t.tabAccess, t.flow)}
    <section class="section"><div class="container">
      ${adminTabs(lang, "access")}
      ${typeof adminSessionBar === "function" ? adminSessionBar(lang) : ""}
      ${approvalFlowHtml(t, "review")}
      <div id="admin-access-root"><p class="muted">…</p></div>
    </div></section>`;
}

function bindAccessActions(root, t) {
  const changeRole = async (btn, role, confirmText, okDetail) => {
    const email = btn.dataset.email || "";
    if (!confirm(`${confirmText}\n${email}`)) return;
    const { data, error: updateError } = await setProfileRole(btn.dataset.id, role);
    const saved = data && data.role === role;
    writeAccessFlash({
      ok: saved,
      email,
      message: saved ? okDetail : updateError && updateError.message ? updateError.message : t.notSaved
    });
    renderAdminAccess();
  };
  root.querySelectorAll(".access-approve").forEach((btn) => {
    btn.addEventListener("click", () => changeRole(btn, "admin", t.confirmApprove, t.approvedDetail));
  });
  root.querySelectorAll(".access-reject").forEach((btn) => {
    btn.addEventListener("click", () => changeRole(btn, "rejected", t.confirmReject, t.rejectedDetail));
  });
}

async function renderAdminAccess() {
  const root = document.getElementById("admin-access-root");
  if (!root) return;
  const lang = getLang();
  const t = authCopy(lang);
  const superAdmin = typeof isSuperAdmin === "function" && isSuperAdmin();
  const { records, error } = await listAdminProfiles();
  if (error) {
    root.innerHTML = `<p class="admin-flash" id="access-flash">${escapeHtml(error.message || t.error)}</p>`;
    return;
  }
  if (!records.length) {
    root.innerHTML = `<p class="muted">${t.emptyQueue}</p>`;
    return;
  }
  const pending = records.filter((item) => item.role === "pending");
  const note = superAdmin ? "" : `<p class="muted">${t.cannotApprove}</p>`;
  const flash = readAccessFlash();
  const pendingCards = pending.length
    ? pending
        .map(
          (item) => `<article class="approval-card">
            <header>
              <h3>${escapeHtml(applicantName(item))}</h3>
              <span class="admin-status admin-status-waiting">${t.statusWaiting}</span>
            </header>
            ${applicantDetailsHtml(item, t)}
            ${accessActionsHtml(item, t, superAdmin)}
          </article>`
        )
        .join("")
    : `<p class="muted">${t.emptyPending}</p>`;
  root.innerHTML = `${note}
    ${accessFlashHtml(flash, t)}
    <div class="section-header"><div><span class="eyebrow">${t.tabAccess}</span><h2>${t.pendingQueue}</h2></div></div>
    <div class="approval-queue">${pendingCards}</div>
    <div class="section-header"><div><span class="eyebrow">${t.statusLabel}</span><h2>${t.allApplications}</h2></div></div>
    <table class="admin-table">
    <thead><tr><th>${t.applicant}</th><th>${t.email}</th><th>${t.statusLabel}</th><th>${t.roleLabel}</th><th>${t.requestedAt}</th><th></th></tr></thead>
    <tbody>${records
      .map((item) => {
        const status = accessStatusMeta(item.role, t);
        return `<tr>
        <td>${escapeHtml(applicantName(item))}</td>
        <td>${escapeHtml(item.email || "—")}</td>
        <td><span class="admin-status ${status.cls}">${status.label}</span></td>
        <td>${escapeHtml(item.role)}</td>
        <td>${escapeHtml(formatAccessStamp(item.created_at))}</td>
        <td class="admin-actions">${accessActionsHtml(item, t, superAdmin)}</td>
      </tr>`;
      })
      .join("")}</tbody>
  </table>`;
  bindAccessActions(root, t);
}
