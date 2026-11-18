/* Books & materials desk. The imMBA page shell stays; this paints the child page. */
(function () {
  const E = window.MarketEngine;
  const KEY = "immba-market-v2";
  const SESSION = "immba-market-session";
  const ROLE = "immba-market-role";
  const TOKEN = "immba-market-token";

  const STATUS = {
    waiting_payment: { en: "Waiting for payment confirmation", zh: "等待確認付款" },
    payment_confirmed: { en: "Payment confirmed", zh: "已確認付款" },
    ready_to_ship: { en: "Shipping", zh: "出貨中" },
    shipped: { en: "Shipping", zh: "出貨中" },
    completed: { en: "Transaction complete", zh: "交易完成" }
  };
  const PAY = {
    waiting: { en: "Payment sent", zh: "已付款" },
    received: { en: "Payment received", zh: "已收款" }
  };
  const STOCK = {
    in_stock: { en: "In stock", zh: "有庫存" },
    low_stock: { en: "Low stock", zh: "庫存偏低" },
    out_of_stock: { en: "Out of stock", zh: "缺貨" }
  };
  const LISTING = {
    active: { en: "Active", zh: "上架中" },
    hidden: { en: "Hidden", zh: "已隱藏" },
    removed: { en: "Removed", zh: "已下架" }
  };
  const SELLER_STATUS = {
    pending: { en: "Pending", zh: "待核准" },
    approved: { en: "Approved", zh: "已核准" },
    rejected: { en: "Declined", zh: "未核准" }
  };
  const CATS = {
    textbooks: { en: "Textbooks", zh: "教科書" },
    packs: { en: "Course packs", zh: "課程講義" },
    notes: { en: "Notes", zh: "筆記" },
    stationery: { en: "Stationery", zh: "文具" },
    electronics: { en: "Electronics", zh: "電子用品" }
  };
  const FLAGS = {
    "Payment still waiting": { en: "Payment still waiting", zh: "付款仍未確認" },
    "Shipped and not closed": { en: "Shipped and not closed", zh: "已出貨尚未結案" }
  };
  const ERRORS = {
    sign_in: { en: "Sign in to continue.", zh: "請先登入。" },
    credentials: { en: "That email and password do not match. Registered buyers and sellers use the password from sign-up. The sample password works only on the sample buttons.", zh: "帳號或密碼不正確。註冊的買家和賣家請用註冊時設定的密碼。示範密碼只適用右側的示範按鈕。" },
    suspended: { en: "This account is suspended.", zh: "此帳號已停用。" },
    buyer_only: { en: "Cart and checkout belong to buyer accounts.", zh: "購物車與結帳只開放給買家。" },
    seller_only: { en: "Listings and shipping stay on the seller desk.", zh: "上架與出貨只在賣家工作台。" },
    admin_only: { en: "Transaction monitoring belongs to the platform admin.", zh: "交易監控只開放給平台管理員。" },
    not_approved: { en: "Seller tools open after the super admin approves this shop. You can still buy with the buyer role.", zh: "超級管理員核准這間店之後，才能使用賣家功能。你仍可以用買家身份購物。" },
    stock: { en: "That quantity is no longer available.", zh: "這個數量目前沒有足夠庫存。" },
    quantity: { en: "Enter a valid quantity.", zh: "請輸入有效數量。" },
    empty: { en: "The cart is empty.", zh: "購物車是空的。" },
    confirm: { en: "Confirm the payment before buying.", zh: "付款後才能買下。" },
    payment: { en: "Choose how you paid and add the payment reference.", zh: "請選擇付款方式並填上付款參考。" },
    delivery: { en: "Choose home delivery or self collection.", zh: "請選擇宅配或自取。" },
    charge: { en: "Every order includes the NT$4 service charge, and the total must include the delivery choice.", zh: "每筆訂單都要加 NT$4 服務費，合計也要包含所選的運費。" },
    address: { en: "Recipient, address, and city are required.", zh: "請填收件人、地址與城市。" },
    phone: { en: "Enter a phone number with 8 to 15 digits.", zh: "請填 8 到 15 碼的電話號碼。" },
    missing: { en: "That record is not on this desk.", zh: "這個工作台找不到該筆資料。" },
    step: { en: "That step is not available for this order.", zh: "這筆訂單現在不能做這個動作。" },
    name: { en: "Add a name.", zh: "請填名稱。" },
    email: { en: "Use a valid email.", zh: "請填有效的電子郵件。" },
    password: { en: "Use at least 4 characters.", zh: "密碼至少 4 個字。" },
    taken: { en: "That email is already registered.", zh: "這個電子郵件已經註冊。" },
    shop: { en: "A seller needs a shop name.", zh: "賣家需要店名。" },
    category: { en: "Choose a category.", zh: "請選擇分類。" },
    description: { en: "Add a short description.", zh: "請寫一段簡短說明。" },
    price: { en: "Enter a price in NT$.", zh: "請輸入新台幣價格。" },
    image: { en: "Product image must be under 1.4 MB.", zh: "商品圖片需小於 1.4 MB。" },
    locked: { en: "Platform administrator access cannot be changed here.", zh: "這裡不能變更平台管理員權限。" },
    cloud: { en: "The shared marketplace could not be saved. Refresh and try again.", zh: "無法寫入共用市集。請重新整理後再試。" },
    admin_only: { en: "Only the platform admin can restore the sample floor.", zh: "只有平台管理員可以還原示範市集。" }
  };

  let db = null;
  let flash = "";

  function zh() {
    return typeof getLang === "function" && getLang() === "zh";
  }
  function pick(map) {
    if (!map) return "";
    if (typeof map === "string") return map;
    return zh() ? map.zh || map.en || "" : map.en || map.zh || "";
  }
  function tErr(code) {
    return pick(ERRORS[code]) || code || "";
  }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }
  function money(amount) {
    return new Intl.NumberFormat(zh() ? "zh-TW" : "en-US", {
      style: "currency",
      currency: "TWD",
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  function deliveryChoice() {
    const value = new URLSearchParams((location.hash.split("?")[1] || "")).get("delivery");
    return value === "pickup" ? "pickup" : "home";
  }

  function deliveryChooser() {
    const current = deliveryChoice();
    return `<fieldset class="mk-delivery">
      <legend>${zh() ? "取貨方式" : "Collection"}</legend>
      <label class="mk-check"><input type="radio" name="delivery" value="home" ${current === "home" ? "checked" : ""}> ${zh() ? "宅配" : "Home delivery"} · ${esc(money(E.HOME_DELIVERY_CHARGE))}</label>
      <label class="mk-check"><input type="radio" name="delivery" value="pickup" ${current === "pickup" ? "checked" : ""}> ${zh() ? "自取" : "Self collection"} · ${zh() ? "免運" : "Nil"}</label>
    </fieldset>`;
  }

  function chargeSummary(quote) {
    const deliveryName = quote.delivery === "pickup" ? (zh() ? "自取" : "Self collection") : (zh() ? "宅配" : "Home delivery");
    const deliveryAmount = quote.deliveryCharge ? money(quote.deliveryCharge) : (zh() ? "免運" : "Nil");
    return `<dl class="mk-fees" data-quote>
      <div><dt>${zh() ? "小計" : "Subtotal"}</dt><dd>${esc(money(quote.subtotal))}</dd></div>
      <div><dt>${zh() ? "服務費" : "Service charge"}</dt><dd>${esc(money(quote.serviceCharge))}</dd></div>
      <div><dt>${esc(deliveryName)}</dt><dd>${esc(deliveryAmount)}</dd></div>
      <div class="mk-fee-total"><dt>${zh() ? "合計" : "Total"}</dt><dd><strong>${esc(money(quote.total))}</strong></dd></div>
    </dl>`;
  }

  function collecting(order) {
    return !!(order.address && order.address.deliveryMethod === "pickup");
  }

  function orderFees(order) {
    const address = order.address || {};
    if (!Number(address.serviceCharge) && !Number(address.deliveryCharge)) return "";
    const service = Number(address.serviceCharge) || 0;
    const delivery = Number(address.deliveryCharge) || 0;
    return chargeSummary({
      subtotal: order.total - service - delivery,
      serviceCharge: service,
      deliveryCharge: delivery,
      delivery: address.deliveryMethod === "pickup" ? "pickup" : "home",
      total: order.total
    });
  }
  function when(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat(zh() ? "zh-TW" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Taipei",
      timeZoneName: "short"
    }).format(new Date(value));
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && saved.version === 1 && Array.isArray(saved.users)) return saved;
    } catch (error) {
      /* reseed below */
    }
    const seeded = E.createSeed(new Date());
    remember(seeded);
    return seeded;
  }
  function token() {
    return sessionStorage.getItem(TOKEN) || "";
  }
  function remember(state) {
    try {
      const copy = JSON.parse(JSON.stringify(state));
      (copy.products || []).forEach((product) => {
        if (typeof product.image === "string" && product.image.length > 2048) product.image = "";
      });
      (copy.orders || []).forEach((order) => {
        (order.items || []).forEach((item) => {
          if (typeof item.image === "string" && item.image.length > 2048) item.image = "";
        });
      });
      localStorage.setItem(KEY, JSON.stringify(copy));
    } catch (error) {
      try { localStorage.removeItem(KEY); } catch (ignore) { /* the desk still runs from the server copy */ }
    }
  }
  function publicSeed() {
    const seeded = E.createSeed(new Date());
    seeded.users.forEach((user) => {
      delete user.password;
    });
    return seeded;
  }
  async function pull() {
    if (!window.MarketCloud) return load();
    let state = await MarketCloud.load(token());
    if (!state || !Array.isArray(state.users)) throw new Error("load");
    if (!state.users.length) {
      const installed = await MarketCloud.install(publicSeed());
      if (!installed || installed.ok === false) throw new Error("install");
      state = await MarketCloud.load(token());
      if (!state || !Array.isArray(state.users) || !state.users.length) throw new Error("load");
    }
    remember(state);
    return state;
  }
  async function persist() {
    if (!window.MarketCloud) {
      remember(db);
      return true;
    }
    if (!token()) return false;
    const copy = JSON.parse(JSON.stringify(db));
    copy.users.forEach((user) => {
      delete user.password;
    });
    const result = await MarketCloud.save(token(), copy);
    if (!result || result.ok === false) return false;
    remember(db);
    return true;
  }
  async function commit(next) {
    const ok = await persist();
    if (!ok) {
      flash = tErr("cloud");
      try {
        db = await pull();
      } catch (error) {
        db = load();
      }
      renderMarket();
      return;
    }
    if (typeof next === "function") next();
    else renderMarket();
  }
  function userId() {
    return sessionStorage.getItem(SESSION) || "";
  }
  function activeRole() {
    const user = E.findUser(db, userId());
    if (!user) return "";
    const chosen = sessionStorage.getItem(ROLE);
    return user.roles.includes(chosen) ? chosen : user.roles[0];
  }
  function actor() {
    return E.sessionActor(db, userId(), activeRole());
  }
  function setSession(id, role) {
    if (!id) {
      sessionStorage.removeItem(SESSION);
      sessionStorage.removeItem(ROLE);
      return;
    }
    sessionStorage.setItem(SESSION, id);
    sessionStorage.setItem(ROLE, role);
  }
  function route() {
    const raw = (location.hash || "#/").replace(/^#/, "");
    const path = (raw.startsWith("/") ? raw : "/" + raw).split("?")[0];
    return path.split("/").filter(Boolean);
  }
  function go(path) {
    const next = path.startsWith("/") ? path : "/" + path;
    if (location.hash === "#" + next) renderMarket();
    else location.hash = next;
  }
  function cartCount() {
    const user = E.findUser(db, userId());
    if (!user || activeRole() !== "buyer") return 0;
    return user.cart.reduce((sum, line) => sum + line.quantity, 0);
  }
  function deskFor(role) {
    if (role === "seller") return "/sell";
    if (role === "admin") return "/admin";
    return "/";
  }

  function chrome() {
    const user = actor();
    const parts = route();
    const here = "/" + parts.join("/");
    const links = [];
    const add = (href, label) => {
      const selected = href === "/admin"
        ? here === "/admin" || here.startsWith("/admin/transactions")
        : here === href || (href !== "/" && here.startsWith(href));
      links.push(`<a class="${selected ? "on" : ""}" href="#${href}">${esc(label)}</a>`);
    };
    if (user && user.role === "seller" && sellerWaiting(user)) {
      links.push(`<span class="on">${zh() ? "等待核准" : "Waiting for approval"}</span>`);
    } else if (!user || user.role === "buyer") {
      add("/", zh() ? "市集" : "Floor");
    }
    if (user && user.role === "buyer") {
      add("/orders", zh() ? "我的訂單" : "My orders");
      add("/cart", (zh() ? "購物車 " : "Cart ") + cartCount());
    }
    if (user && user.role === "seller" && !sellerWaiting(user)) {
      add("/sell/inventory", zh() ? "商品" : "Listings");
      add("/sell/products/new", zh() ? "新增商品" : "Add item");
      add("/sell/orders", zh() ? "待處理訂單" : "Orders");
      add("/sell/sales", zh() ? "交易紀錄" : "Transactions");
    }
    if (user && user.role === "admin") {
      const waiting = pendingSellers().length;
      add("/admin", zh() ? "全部交易" : "Transactions");
      add("/admin/applications", (zh() ? "賣家申請" : "Applications") + (waiting ? " " + waiting : ""));
      add("/admin/users", zh() ? "使用者" : "Users");
      add("/admin/activity", zh() ? "活動紀錄" : "Activity");
    }
    if (!user) add("/login", zh() ? "登入" : "Sign in");
    const switcher = user && user.roles.length > 1
      ? `<label class="mk-switch">${zh() ? "角色" : "Role"}
          <select data-role-switch>${user.roles.map((role) => `<option value="${role}" ${role === user.role ? "selected" : ""}>${esc(roleLabel(role))}</option>`).join("")}</select>
        </label>`
      : "";
    const waitingSeller = user && user.role === "seller" && sellerWaiting(user);
    const whoLabel = user && user.platformOwner
      ? (zh() ? "超級管理員" : "Super admin")
      : user
        ? `${user.name} · ${waitingSeller ? (zh() ? "等待核准" : "Waiting for approval") : roleLabel(user.role)}${user.role === "seller" && user.shopName && !waitingSeller ? " · " + user.shopName : ""}`
        : "";
    const who = user
      ? `<span class="mk-who">${esc(whoLabel)}</span>
         <button type="button" class="mk-text" data-action="logout">${zh() ? "登出" : "Sign out"}</button>`
      : `<span class="mk-who">${zh() ? "訪客可以先瀏覽商品" : "Visitors can browse the floor"}</span>`;
    return `<div class="mk-bar">
      <nav class="mk-links">${links.join("")}</nav>
      <div class="mk-session">${switcher}${who}</div>
    </div>`;
  }

  function roleLabel(role) {
    return {
      buyer: zh() ? "買家" : "Buyer",
      seller: zh() ? "賣家" : "Seller",
      admin: zh() ? "平台管理員" : "Platform admin"
    }[role] || role;
  }

  function banner() {
    return flash ? `<p class="mk-flash">${esc(flash)}</p>` : "";
  }

  function stepper(status) {
    const stages = [
      { en: "Payment sent", zh: "已付款" },
      { en: "Payment confirmed", zh: "已確認付款" },
      { en: "Shipping", zh: "出貨" },
      { en: "Transaction complete", zh: "交易完成" }
    ];
    const at = status === "completed" ? 3 : status === "shipped" || status === "ready_to_ship" ? 2 : status === "payment_confirmed" ? 1 : 0;
    return `<ol class="mk-steps">${stages.map((stage, index) => {
      const state = index < at ? "done" : index === at ? "now" : "later";
      return `<li class="${state}"><span>${index + 1}</span><strong>${esc(zh() ? stage.zh : stage.en)}</strong></li>`;
    }).join("")}</ol>`;
  }

  function paymentDetail(order) {
    const labels = {
      bank_transfer: { en: "Bank transfer", zh: "銀行轉帳" },
      cash: { en: "Cash", zh: "現金" },
      line_pay: { en: "LINE Pay", zh: "LINE Pay" }
    };
    const method = order.address && labels[order.address.paymentMethod];
    const reference = order.address && order.address.paymentReference;
    if (!method) return "";
    return `${pick(method)}${reference ? " · " + reference : ""}`;
  }

  function workflow() {
    const steps = [
      [zh() ? "加入購物車並付款" : "Add to cart and pay", zh() ? "買家選好書或教材，加入購物車，從購物車付款並買下。" : "The buyer chooses a book or material, adds it to the cart, then pays and buys from the cart."],
      [zh() ? "賣家確認收款" : "Seller confirms the payment", zh() ? "賣家核對付款參考，確認已經收到款項。" : "The seller checks the payment reference and confirms the money arrived."],
      [zh() ? "出貨" : "Shipping", zh() ? "確認收款後，訂單進入出貨。" : "Once the payment is confirmed, the order moves to shipping."],
      [zh() ? "交易完成" : "Transaction complete", zh() ? "出貨之後，這筆交易標成完成並保留紀錄。" : "After shipping, the sale is marked transaction complete and the record stays."]
    ];
    return `<ol class="mk-workflow">${steps.map((step, index) => `<li><span>${index + 1}</span><div><strong>${esc(step[0])}</strong><p>${esc(step[1])}</p></div></li>`).join("")}</ol>`;
  }

  function denied(title, body, href, label) {
    return `${chrome()}${banner()}<section class="mk-panel">
      <h2>${esc(title)}</h2>
      <p>${esc(body)}</p>
      ${href ? `<a class="mk-btn" href="#${href}">${esc(label)}</a>` : ""}
    </section>`;
  }

  function guard(role) {
    const user = actor();
    if (!user) {
      return denied(
        zh() ? "請先登入" : "Sign in to open this desk",
        zh() ? "訪客可以瀏覽市集。這個工作台需要對應的角色。" : "Visitors can browse the floor. This desk needs the matching role.",
        "/login",
        zh() ? "登入" : "Sign in"
      );
    }
    if (user.role === role) return "";
    if (role === "buyer") {
      return denied(
        zh() ? "這是買家工作台" : "This is the buyer desk",
        user.role === "seller"
          ? (zh() ? "購物車與結帳屬於買家。請用賣家工作台處理庫存與訂單。" : "Cart and checkout belong to buyer accounts. Use the seller desk to list products and fulfill orders.")
          : (zh() ? "平台管理員監看交易，不以買家或賣家的身份下單。" : "Platform administrators monitor transactions and do not act as the buyer or the seller."),
        user.role === "seller" ? "/sell/inventory" : "/admin",
        user.role === "seller" ? (zh() ? "打開庫存" : "Open inventory") : (zh() ? "監看交易" : "Monitor transactions")
      );
    }
    if (role === "seller") {
      return denied(
        zh() ? "這是賣家工作台" : "This is the seller desk",
        user.role === "buyer"
          ? (zh() ? "上架、庫存、確認付款與出貨都在賣家工作台。你的工具是市集、購物車和訂單。" : "Listings, stock, payment confirmation, and shipping stay on the seller desk. Your tools are the floor, the cart, and your orders.")
          : (zh() ? "使用者核准與交易監看屬於平台管理員。這個帳號不會代替賣家出貨。" : "User approval and transaction monitoring belong to the platform admin. This account does not ship for a seller."),
        user.role === "buyer" ? "/" : "/admin",
        user.role === "buyer" ? (zh() ? "回到市集" : "Back to the floor") : (zh() ? "監看交易" : "Monitor transactions")
      );
    }
    return denied(
      zh() ? "這是平台管理員工作台" : "This is the platform admin desk",
      zh() ? "這個工作台不下單、不上架、也不出貨。你可以檢視每一筆訂單、管理使用者，並閱讀市集活動。" : "This desk does not buy, list, or ship. You can review every order, manage users, and read marketplace activity without acting as the buyer or the seller.",
      deskFor(user.role),
      zh() ? "回到自己的工作台" : "Back to your desk"
    );
  }

  function floor(parts) {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const q = params.get("q") || "";
    const category = params.get("category") || "";
    const products = E.publicProducts(db, { q, category });
    const cats = [{ id: "", en: "All", zh: "全部" }].concat(E.CATEGORIES.map((id) => ({ id, en: CATS[id].en, zh: CATS[id].zh })));
    return `${chrome()}${banner()}
      <section class="mk-sheet">
        <p class="mk-kicker">${zh() ? "同學二手市集" : "Student C2C desk"}</p>
        <h2>${zh() ? "二手書與教材" : "Second-hand books and materials"}</h2>
        <p class="mk-lead">${zh()
          ? "訪客可瀏覽公開商品。買家加入購物車並下單。賣家管理庫存與出貨。平台管理員只監看交易。同一套系統裡有買家、賣家與平台管理員三種角色，介面會跟著目前角色改變。"
          : "Visitors browse public listings. Buyers add to cart and place orders. Sellers manage inventory and shipping. The platform admin monitors transactions and does not act as the buyer or the seller. One system holds buyer, seller, and platform admin roles, and the desk changes with the role you are using."}</p>
        ${actor() ? sellApplication() : signupChoices()}
        ${sellerDeskNote()}
        <form class="mk-filters" data-action="search">
          <label>${zh() ? "搜尋商品" : "Search products"}
            <input name="q" value="${esc(q)}" placeholder="${zh() ? "書名、講義、賣家" : "Title, notes, seller"}">
          </label>
          <div class="mk-chips">${cats.map((cat) => `<button type="submit" name="category" value="${esc(cat.id)}" class="${category === cat.id ? "on" : ""}">${esc(zh() ? cat.zh : cat.en)}</button>`).join("")}</div>
        </form>
        ${products.length ? `<div class="mk-grid">${products.map(card).join("")}</div>` : `<p class="mk-empty">${zh() ? "沒有符合的商品。" : "No listings match that search."}</p>`}
        <div class="mk-split">
          <div>
            <h3>${zh() ? "角色與權限" : "Roles and permissions"}</h3>
            <ul class="mk-roles">
              <li><strong>${zh() ? "訪客" : "Visitor"}</strong><span>${zh() ? "瀏覽公開商品資訊" : "Browse public product information"}</span></li>
              <li><strong>${zh() ? "買家" : "Buyer"}</strong><span>${zh() ? "瀏覽、加入購物車、下單、查看訂單紀錄" : "Browse, add to cart, place orders, view order history"}</span></li>
              <li><strong>${zh() ? "賣家" : "Seller"}</strong><span>${zh() ? "同時也是買家。核准後才能上架、改庫存、確認付款、出貨、查看銷售" : "Also a buyer. After approval: list products, manage inventory, confirm payment, ship, and view sales"}</span></li>
              <li><strong>${zh() ? "平台管理員" : "Platform admin"}</strong><span>${zh() ? "管理使用者並監看交易，不代買也不代賣" : "Manage users and monitor transactions, without buying or selling"}</span></li>
            </ul>
          </div>
          <div>
            <h3>${zh() ? "訂單怎麼走" : "What happens after an order"}</h3>
            ${workflow()}
          </div>
        </div>
      </section>`;
  }

  function card(product) {
    return `<a class="mk-card" href="#/product/${esc(product.id)}">
      <span class="mk-photo"><img src="${esc(product.image || "")}" alt="${esc(pick(product.name))}"><em class="mk-stock ${product.stockStatus}">${esc(pick(STOCK[product.stockStatus]))}</em></span>
      <p class="mk-kicker">${esc(pick(CATS[product.category]))}</p>
      <h3>${esc(pick(product.name))}</h3>
      <p class="mk-shop">${esc(product.shopName)}</p>
      <p class="mk-price">${esc(money(product.price))}</p>
    </a>`;
  }

  function productPage(id) {
    const product = E.findProduct(db, id);
    if (!product || product.listingStatus !== "active") {
      return `${chrome()}<section class="mk-panel"><h2>${zh() ? "找不到商品" : "Listing unavailable"}</h2><p><a href="#/">${zh() ? "回到市集" : "Back to the floor"}</a></p></section>`;
    }
    const view = E.productView(product, E.findUser(db, product.sellerId));
    const user = actor();
    const max = Math.max(view.quantity, 1);
    let box = "";
    if (!user) {
      box = `<p>${zh() ? "登入買家帳號後才能加入購物車。" : "Sign in as a buyer to add this to a cart."}</p><a class="mk-btn" href="#/login">${zh() ? "登入" : "Sign in"}</a>`;
    } else if (user.role === "buyer") {
      box = view.quantity > 0
        ? `<form data-action="add-cart">
            <input type="hidden" name="productId" value="${esc(view.id)}">
            <label>${zh() ? "數量" : "Quantity"}
              <input name="quantity" type="number" min="1" max="${max}" value="1">
            </label>
            <button class="mk-btn" type="submit">${zh() ? "加入購物車" : "Add to cart"}</button>
          </form>
          <p class="mk-note">${zh() ? "先加入購物車。付款與購買在購物車進行。" : "Add it to the cart. Payment and purchase happen from the cart."}</p>`
        : `<p>${zh() ? "目前缺貨。" : "None are left on hand."}</p>`;
    } else if (user.role === "seller") {
      box = `<p>${zh() ? "賣家不從這個帳號購買。庫存與出貨在賣家工作台。" : "Sellers do not purchase from this account. Inventory and order fulfillment live on the seller desk."}</p><a class="mk-btn" href="#/sell/inventory">${zh() ? "打開庫存" : "Open inventory"}</a>`;
    } else {
      box = `<p>${zh() ? "平台管理員監看交易，不以買家或賣家的身份購買。" : "Platform administrators monitor transactions and do not act as the buyer or the seller."}</p><a class="mk-btn" href="#/admin">${zh() ? "監看交易" : "Monitor transactions"}</a>`;
    }
    return `${chrome()}${banner()}<article class="mk-detail">
      <img src="${esc(view.image)}" alt="">
      <div>
        <p class="mk-kicker">${esc(pick(CATS[view.category]))} · ${esc(view.shopName)}</p>
        <h2>${esc(pick(view.name))}</h2>
        <p class="mk-price">${esc(money(view.price))}</p>
        <p class="mk-stock-line ${view.stockStatus}">${esc(pick(STOCK[view.stockStatus]))}${view.quantity > 0 ? (zh() ? ` · 可售 ${view.quantity}` : ` · ${view.quantity} available`) : ""}</p>
        <p class="mk-formula">${zh()
          ? `可售庫存 = 目前存貨 − 已購買數量（${view.currentInventory} − ${view.purchased} = ${view.quantity}）`
          : `Available stock = current inventory − purchased quantity (${view.currentInventory} − ${view.purchased} = ${view.quantity})`}</p>
        <p>${esc(pick(view.description))}</p>
        <p class="mk-shop">${zh() ? "賣家" : "Seller"}: ${esc(view.sellerName)}</p>
        <div class="mk-buy">${box}</div>
      </div>
    </article>`;
  }

  function roleIcon(role) {
    const paths = {
      buyer: `<circle cx="24" cy="15" r="6"/><path d="M9 38c1.6-7 6.4-11 15-11s13.4 4 15 11"/>`,
      seller: `<path d="M8 20 24 8l16 12"/><path d="M12 18v18h24V18"/><path d="M20 36v-8h8v8"/>`,
      admin: `<path d="M24 7 38 13v10c0 8-6 13-14 16-8-3-14-8-14-16V13z"/><path d="M18 24l4 4 8-8"/>`
    };
    return `<span class="mk-signup-icon"><svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${paths[role] || ""}</svg></span>`;
  }
  function superDeskCard() {
    const signedIn = typeof isSuperAdmin === "function" && isSuperAdmin();
    const detail = zh() ? "核准賣家並監看每一筆交易" : "Approve sellers and monitor every transaction";
    if (signedIn) {
      return `<button type="button" class="mk-signup" data-action="super">
        ${roleIcon("admin")}
        <strong>${zh() ? "超級管理員" : "Super admin"}</strong>
        <em>${zh() ? "進入工作台" : "Open the desk"}</em>
        <span>${esc(detail)}</span>
      </button>`;
    }
    const href = typeof withLang === "function" ? withLang("auth.html?next=marketplace") : "auth.html?next=marketplace";
    return `<a class="mk-signup" href="${esc(href)}">
      ${roleIcon("admin")}
      <strong>${zh() ? "超級管理員" : "Super admin"}</strong>
      <em>${zh() ? "登入" : "Sign in"}</em>
      <span>${esc(detail)}</span>
    </a>`;
  }
  function signupChoices() {
    const items = [
      ["buyer", zh() ? "買家" : "Buyer", zh() ? "立刻加入購物車並下單" : "Add to a cart and place orders"],
      ["seller", zh() ? "賣家" : "Seller", zh() ? "可先購物，核准後才能上架" : "Buy now, and list after approval"]
    ];
    return `<div class="mk-signup-row">${items.map(([role, title, detail]) => `<a class="mk-signup" href="#/register/${role}">
      ${roleIcon(role)}
      <strong>${esc(title)}</strong>
      <em>${zh() ? "註冊" : "Sign up"}</em>
      <span>${esc(detail)}</span>
    </a>`).join("")}${superDeskCard()}</div>`;
  }
  function loginPage() {
    const demos = [
      ["Wei Lin", "wei.lin@immba.test", zh() ? "平台管理員" : "Platform admin"],
      ["Mei Huang", "mei.huang@immba.test", zh() ? "賣家 · 已核准" : "Seller · approved"],
      ["Arun Shah", "arun.shah@immba.test", zh() ? "賣家 · 已核准" : "Seller · approved"],
      ["Elena Chen", "elena.chen@immba.test", zh() ? "買家" : "Buyer"],
      ["Chris Tan", "chris.tan@immba.test", zh() ? "買家" : "Buyer"],
      ["Sam Ortiz", "sam.ortiz@immba.test", zh() ? "賣家 · 等待核准" : "Seller · waiting approval"],
      ["Alex Lin", "alex.lin@immba.test", zh() ? "買家與賣家" : "Buyer and seller"]
    ];
    return `${chrome()}${banner()}<div class="mk-split">
      <section class="mk-panel">
        <p class="mk-kicker">${zh() ? "帳號" : "Account"}</p>
        <h2>${zh() ? "登入你的工作台" : "Sign in to your desk"}</h2>
        <form data-action="login">
          <label>${zh() ? "電子郵件" : "Email"}<input name="email" type="email" autocomplete="username" required></label>
          <label>${zh() ? "密碼" : "Password"}<input name="password" type="password" autocomplete="current-password" required></label>
          <button class="mk-btn" type="submit">${zh() ? "登入" : "Sign in"}</button>
        </form>
        <p class="mk-note">${zh() ? "買家和賣家在這裡登入，請輸入註冊時設定的密碼。示範密碼只給右側的示範按鈕使用。" : "Buyers and sellers sign in here with the password chosen at sign-up. The sample password is only for the sample buttons."}</p>
        <h3>${zh() ? "註冊" : "Sign up"}</h3>
        <p>${zh() ? "買家和賣家各自註冊。超級管理員用後台帳號登入，核准賣家並監看交易。" : "Buyers and sellers each register. The super admin signs in with the back-office account to approve sellers and monitor transactions."}</p>
        ${signupChoices()}
      </section>
      <section class="mk-panel">
        <p class="mk-kicker">${zh() ? "示範帳號" : "Sample floor"}</p>
        <h2>${zh() ? "打開一個角色" : "Open a role"}</h2>
        <p>${zh() ? "每個示範帳號的密碼都是" : "Every sample account uses the password"} <code>${E.DEMO_PASSWORD}</code>. ${zh() ? "訪客可以略過，直接逛市集。" : "Visitors can skip this and browse the floor."}</p>
        <div class="mk-demos">${demos.map((demo) => `<button type="button" data-action="demo" data-email="${esc(demo[1])}"><strong>${esc(demo[0])}</strong><span>${esc(demo[2])}</span></button>`).join("")}</div>
        <p><a href="#/">${zh() ? "以訪客繼續" : "Continue as a visitor"}</a></p>
      </section>
    </div>`;
  }

  function registerPage(role) {
    if (role === "admin") {
      return `${chrome()}${banner()}<section class="mk-panel mk-narrow">
        <p><a href="#/register">${zh() ? "註冊入口" : "Sign-up choices"}</a></p>
        <p class="mk-kicker">${zh() ? "超級管理員" : "Super admin"}</p>
        <h2>${zh() ? "用後台帳號進入市集" : "Enter the marketplace as the super admin"}</h2>
        <p>${zh() ? "超級管理員維持為市集的主要管理者，可以核准每一位賣家，並監看全部交易。這個帳號不能在市集裡另行註冊。" : "The super admin remains the main administrator of the marketplace. That account approves each seller and monitors every transaction. It is not created from a marketplace sign-up."}</p>
        <div class="mk-signup-row">${superDeskCard()}</div>
      </section>`;
    }
    const chosen = role === "seller" ? "seller" : role === "buyer" ? "buyer" : "";
    if (!chosen) {
      return `${chrome()}${banner()}<section class="mk-panel">
        <p class="mk-kicker">${zh() ? "註冊" : "Sign up"}</p>
        <h2>${zh() ? "選擇你的角色" : "Choose your role"}</h2>
        <p>${zh() ? "買家和賣家各自註冊。超級管理員不是在這裡建立的，而是用後台帳號登入。" : "Buyers and sellers each register. The super admin is not created here and signs in with the back-office account."}</p>
        ${signupChoices()}
      </section>`;
    }
    const title = chosen === "seller"
      ? (zh() ? "註冊賣家" : "Sign up as a seller")
      : (zh() ? "註冊買家" : "Sign up as a buyer");
    const note = chosen === "seller"
      ? (zh() ? "賣家註冊時要留下地址和電話，而且可以先用買家身份購物。上架、庫存和出貨要等超級管理員核准。" : "Sellers leave an address and phone number when they register, and they can buy right away. Listing, inventory, and shipping wait for the super admin.")
      : (zh() ? "買家註冊時要留下地址和電話，建立後就可以購物。買家不能成為賣家，除非超級管理員核准賣家申請。" : "Buyers leave an address and phone number when they register, then they can shop. A buyer cannot sell unless the super admin approves a seller application.");
    return `${chrome()}${banner()}<section class="mk-panel mk-narrow">
      <p><a href="#/register">${zh() ? "註冊入口" : "Sign-up choices"}</a></p>
      ${roleIcon(chosen)}
      <p class="mk-kicker">${zh() ? "註冊" : "Sign up"}</p>
      <h2>${esc(title)}</h2>
      <p>${esc(note)}</p>
      <form data-action="register">
        <input type="hidden" name="role" value="${chosen}">
        <label>${zh() ? "姓名" : "Name"}<input name="name" required></label>
        <label>${zh() ? "電子郵件" : "Email"}<input name="email" type="email" required autocomplete="username"></label>
        <label>${zh() ? "密碼" : "Password"}<input name="password" type="password" required minlength="4" autocomplete="new-password"></label>
        ${chosen === "seller" ? `<label>${zh() ? "店名" : "Shop name"}<input name="shopName" required minlength="2" placeholder="${zh() ? "買家會看到的名稱" : "The name buyers will see"}"></label>` : ""}
        <fieldset class="mk-contact">
          <legend>${zh() ? "地址與電話" : "Address and phone"}</legend>
          <label>${zh() ? "電話" : "Phone"}<input name="phone" type="tel" required inputmode="tel" autocomplete="tel" placeholder="0912 345 678"></label>
          <label>${zh() ? "地址" : "Address"}<input name="line1" required autocomplete="address-line1" placeholder="${zh() ? "路名與門牌" : "Street and number"}"></label>
          <label>${zh() ? "城市" : "City"}<input name="city" required autocomplete="address-level2"></label>
          <label>${zh() ? "地區" : "Region"}<input name="region" required autocomplete="address-level1" value="Taiwan"></label>
          <label>${zh() ? "郵遞區號" : "Postal code"}<input name="postal" required autocomplete="postal-code"></label>
          <label>${zh() ? "國家" : "Country"}<input name="country" required autocomplete="country-name" value="Taiwan"></label>
        </fieldset>
        <button class="mk-btn" type="submit">${zh() ? "註冊" : "Sign up"}</button>
      </form>
    </section>`;
  }

  function cartPage() {
    const block = guard("buyer");
    if (block) return block;
    const user = E.findUser(db, userId());
    const cart = E.cartView(db, user);
    return `${chrome()}${banner()}<section class="mk-sheet">
      <h2>${zh() ? "購物車" : "Cart"}</h2>
      ${cart.items.length ? cart.items.map((item) => `<div class="mk-line">
        <img src="${esc(item.image)}" alt="">
        <div>
          <strong>${esc(pick(item.name))}</strong>
          <p>${esc(item.shopName)}</p>
          <p>${item.purchasable ? esc(money(item.price)) : (zh() ? "目前不能購買" : "Not available")}</p>
        </div>
        <label>${zh() ? "數量" : "Qty"}
          <input data-cart-qty="${esc(item.productId)}" type="number" min="0" max="${Math.max(item.available, 0)}" value="${item.quantity}">
        </label>
        <strong>${esc(money(item.lineTotal))}</strong>
        <button type="button" class="mk-text" data-action="cart-remove" data-id="${esc(item.productId)}">${zh() ? "移除" : "Remove"}</button>
      </div>`).join("") : `<p class="mk-empty">${zh() ? "購物車是空的。" : "Nothing in the cart yet."}</p>`}
      ${cart.items.some((item) => item.purchasable) ? `<p class="mk-note">${zh() ? "每筆購物都要加服務費 NT$4。宅配 NT$40，自取免運。" : "Every cart includes a NT$4 service charge. Home delivery is NT$40. Self collection is nil."}</p>${deliveryChooser()}${chargeSummary(E.cartQuote(cart.subtotal, deliveryChoice()))}<a class="mk-btn" href="#/checkout?delivery=${deliveryChoice()}" data-checkout>${zh() ? "付款並購買" : "Pay and buy"}</a>` : (cart.items.length ? `<p class="mk-total">${zh() ? "小計" : "Subtotal"} <strong>${esc(money(cart.subtotal))}</strong></p>` : "")}
    </section>`;
  }

  function checkoutPage() {
    const block = guard("buyer");
    if (block) return block;
    const user = E.findUser(db, userId());
    const cart = E.cartView(db, user);
    const address = user.address || { recipient: user.name, line1: "", city: "", region: "Taiwan", postal: "", country: "Taiwan" };
    const buyable = cart.items.filter((item) => item.purchasable && item.quantity > 0);
    return `${chrome()}${banner()}<section class="mk-sheet">
      <h2>${zh() ? "付款並購買" : "Pay and buy"}</h2>
      <p>${zh() ? "從購物車付款後，訂單會送給賣家。賣家確認收到款項後，商品才進入出貨，接著交易完成。" : "Pay from the cart and the order goes to the seller. After the seller confirms the payment, the product moves to shipping and then to transaction complete."}</p>
      ${buyable.map((item) => `<div class="mk-line mk-line-plain">
        <div><strong>${esc(pick(item.name))}</strong><p>${esc(item.shopName)}</p></div>
        <label>${zh() ? "數量" : "Qty"}
          <input data-cart-qty="${esc(item.productId)}" type="number" min="1" max="${Math.max(item.available, 1)}" value="${item.quantity}">
        </label>
        <strong>${esc(money(item.price * item.quantity))}</strong>
      </div>`).join("")}
      <form data-action="checkout">
        <h3>${zh() ? "付款" : "Payment"}</h3>
        <label>${zh() ? "付款方式" : "Payment method"}
          <select name="paymentMethod" required>
            <option value="bank_transfer">${zh() ? "銀行轉帳" : "Bank transfer"}</option>
            <option value="cash">${zh() ? "現金" : "Cash"}</option>
            <option value="line_pay">LINE Pay</option>
          </select>
        </label>
        <label>${zh() ? "付款參考" : "Payment reference"}<input name="paymentReference" required minlength="2" placeholder="${zh() ? "轉帳末五碼或收據編號" : "Transfer number or receipt note"}"></label>
        <h3>${zh() ? "送到" : "Ship to"}</h3>
        ${[
          ["recipient", zh() ? "收件人" : "Recipient", address.recipient],
          ["line1", zh() ? "地址" : "Address", address.line1],
          ["city", zh() ? "城市" : "City", address.city],
          ["region", zh() ? "地區" : "Region", address.region],
          ["postal", zh() ? "郵遞區號" : "Postal code", address.postal],
          ["country", zh() ? "國家" : "Country", address.country],
          ["phone", zh() ? "電話" : "Phone", address.phone]
        ].map(([name, label, value]) => `<label>${esc(label)}<input name="${name}" ${name === "phone" ? 'type="tel" inputmode="tel"' : ""} value="${esc(value || "")}"></label>`).join("")}
        <label class="mk-check"><input type="checkbox" name="confirm" required> ${zh() ? "我已支付這筆金額" : "I have paid this amount"}</label>
        ${buyable.length ? `${deliveryChooser()}${chargeSummary(E.cartQuote(cart.subtotal, deliveryChoice()))}` : ""}
        <button class="mk-btn" type="submit" ${buyable.length ? "" : "disabled"}>${zh() ? "付款並購買" : "Pay and buy"}</button>
      </form>
    </section>`;
  }

  function ordersPage() {
    const block = guard("buyer");
    if (block) return block;
    const orders = db.orders.filter((order) => order.buyerId === userId()).map((order) => E.orderView(db, order, Date.now()));
    const open = orders.filter((order) => order.status !== "completed");
    const history = orders.filter((order) => order.status === "completed");
    const table = (list, empty) => list.length ? `<div class="mk-table"><table>
      <thead><tr><th>${zh() ? "訂單編號" : "Order ID"}</th><th>${zh() ? "賣家" : "Seller"}</th><th>${zh() ? "日期" : "Date"}</th><th>${zh() ? "金額" : "Total"}</th><th>${zh() ? "狀態" : "Status"}</th></tr></thead>
      <tbody>${list.map((order) => `<tr>
        <td><a href="#/orders/${esc(order.id)}">${esc(order.id)}</a></td>
        <td>${esc(order.seller.shopName)}</td>
        <td>${esc(when(order.createdAt))}</td>
        <td>${esc(money(order.total))}</td>
        <td>${esc(pick(STATUS[order.status]))}</td>
      </tr>`).join("")}</tbody>
    </table></div>` : `<p class="mk-empty">${esc(empty)}</p>`;
    return `${chrome()}${banner()}<section class="mk-sheet">
      <h2>${zh() ? "我的訂單" : "My orders"}</h2>
      <p>${zh() ? "進行中的訂單會保留狀態，直到交易完成。完成的購買會留在購買紀錄裡，不會刪除。" : "Open orders keep their order status until the sale is completed. Finished purchases move to purchase history and remain there."}</p>
      <h3>${zh() ? "進行中" : "Open orders"}</h3>
      ${table(open, zh() ? "沒有進行中的訂單。回到市集開始一筆。" : "No open orders. Browse the floor to start one.")}
      <h3>${zh() ? "購買紀錄" : "Purchase history"}</h3>
      ${table(history, zh() ? "還沒有完成的購買。" : "No completed purchases yet.")}
    </section>`;
  }

  function orderArticle(order, mode) {
    const user = actor();
    let actions = "";
    if (mode === "seller" && user) {
      actions = `<div class="mk-actions">
        <p>${zh() ? "付款" : "Payment"}: <strong>${esc(pick(PAY[order.paymentStatus]))}</strong></p>
        ${order.status === "waiting_payment" ? `<p>${zh() ? "買家已付款。確認收款後，訂單會進入出貨。" : "The buyer has paid. Confirm the receipt and the order moves to shipping."}</p>${paymentDetail(order) ? `<p>${zh() ? "付款" : "Payment"}: <strong>${esc(paymentDetail(order))}</strong></p>` : ""}<button type="button" class="mk-btn" data-action="advance" data-step="payment_received" data-id="${esc(order.id)}">${zh() ? "確認已收款" : "Confirm payment received"}</button>` : ""}
        ${order.status === "payment_confirmed" ? `<button type="button" class="mk-btn" data-action="advance" data-step="ready_to_ship" data-id="${esc(order.id)}">${zh() ? "進入出貨" : "Move to shipping"}</button>` : ""}
        ${order.status === "ready_to_ship" && !order.prepared ? `<button type="button" class="mk-btn" data-action="advance" data-step="prepare" data-id="${esc(order.id)}">${zh() ? "準備商品" : "Prepare the product"}</button>` : ""}
        ${order.status === "ready_to_ship" && order.prepared ? `<label>${zh() ? "出貨備註" : "Shipment note"}<input id="ship-note" placeholder="${zh() ? "例如：下課交給學程辦公室" : "Carrier or packing note"}"></label><button type="button" class="mk-btn" data-action="advance" data-step="confirm_shipment" data-id="${esc(order.id)}">${zh() ? "確認出貨" : "Confirm shipment"}</button>` : ""}
        ${order.status === "shipped" ? `<p class="mk-note">${zh() ? "這筆訂單正在出貨。" : "This order is in shipping."}</p><button type="button" class="mk-btn" data-action="advance" data-step="transaction_complete" data-id="${esc(order.id)}">${zh() ? "交易完成" : "Transaction complete"}</button>` : ""}
        ${order.status === "completed" ? `<p class="mk-note">${zh() ? "這筆交易已完成，紀錄會保留。" : "This transaction is complete and stays on record."}</p>` : ""}
      </div>`;
    }
    if (mode === "buyer" && order.status === "shipped") {
      actions = `<p class="mk-note">${zh() ? "賣家已確認收款，商品正在出貨。收到後可以把交易標成完成。" : "The seller confirmed the payment and the product is in shipping. Mark the transaction complete when it arrives."}</p><button type="button" class="mk-btn" data-action="complete" data-id="${esc(order.id)}">${zh() ? "交易完成" : "Transaction complete"}</button>`;
    }
    if (mode === "admin") {
      actions = `<p class="mk-note">${zh() ? "監看不等於修改。管理員不能代為確認付款或出貨。" : "Monitoring does not mean editing. The admin does not confirm payment or shipment."}</p>`;
    }
    const people = mode === "buyer"
      ? `<p><strong>${esc(order.seller.shopName)}</strong><br>${esc(order.seller.name)}</p>`
      : mode === "seller"
        ? `<p><strong>${esc(order.buyer.name)}</strong><br>${esc(order.buyer.email)}</p>`
        : `<p><strong>${zh() ? "買家" : "Buyer"}</strong> ${esc(order.buyer.name)} · ${esc(order.buyer.email)}<br><strong>${zh() ? "賣家" : "Seller"}</strong> ${esc(order.seller.shopName)} · ${esc(order.seller.name)} · ${esc(order.seller.email)}</p>`;
    return `<section class="mk-sheet">
      <p class="mk-kicker">${esc(order.id)}</p>
      <h2>${esc(pick(STATUS[order.status]))}</h2>
      ${stepper(order.status)}
      <div class="mk-split">
        <div>
          <h3>${mode === "seller" ? (zh() ? "買家" : "Buyer") : (zh() ? "賣家" : "Seller")}</h3>
          ${people}
          <h3>${zh() ? "商品" : "Products"}</h3>
          ${order.items.map((item) => `<div class="mk-line"><img src="${esc(item.image)}" alt=""><div><strong>${esc(pick(item.name))}</strong><p>${esc(pick(CATS[item.category] || item.category))} · ${item.quantity}</p></div><strong>${esc(money(item.price * item.quantity))}</strong></div>`).join("")}
          ${orderFees(order) || `<p class="mk-total">${zh() ? "合計" : "Total"} <strong>${esc(money(order.total))}</strong></p>`}
        </div>
        <div>
          <h3>${zh() ? "訂單資料" : "Order"}</h3>
          <p>${zh() ? "訂單日期" : "Order date"}: ${esc(when(order.createdAt))}</p>
          <p>${zh() ? "付款狀態" : "Payment status"}: ${esc(pick(PAY[order.paymentStatus]))}</p>
          ${paymentDetail(order) ? `<p>${zh() ? "付款方式" : "Paid by"}: ${esc(paymentDetail(order))}</p>` : ""}
          <p>${collecting(order) ? (zh() ? "自取聯絡" : "Self collection") : (zh() ? "宅配地址" : "Home delivery")}:<br>${esc([order.address.recipient, order.address.phone, order.address.line1, order.address.city, order.address.region, order.address.postal, order.address.country].filter(Boolean).join(", "))}</p>
          ${order.shipmentNote ? `<p>${zh() ? "出貨備註" : "Shipment note"}: ${esc(order.shipmentNote)}</p>` : ""}
          ${order.status === "ready_to_ship" ? `<p class="mk-note">${order.prepared ? (zh() ? "商品已備好。" : "Product prepared.") : (zh() ? "商品還需要準備。" : "Product still needs to be prepared.")}</p>` : ""}
          ${actions}
          <h3>${zh() ? "狀態紀錄" : "Order status"}</h3>
          <ol class="mk-timeline">${order.timeline.map((entry) => `<li><strong>${esc(pick(STATUS[entry.status] || entry.status))}</strong><span>${esc(when(entry.at))} · ${esc(entry.actorName)}</span><p>${esc(entry.note)}</p></li>`).join("")}</ol>
        </div>
      </div>
    </section>`;
  }

  function buyerOrder(id) {
    const block = guard("buyer");
    if (block) return block;
    const order = db.orders.find((entry) => entry.id === id && entry.buyerId === userId());
    if (!order) return `${chrome()}<section class="mk-panel"><h2>${zh() ? "找不到訂單" : "Order unavailable"}</h2></section>`;
    return `${chrome()}${banner()}<p><a href="#/orders">${zh() ? "全部訂單" : "All orders"}</a></p>${orderArticle(E.orderView(db, order, Date.now()), "buyer")}`;
  }

  function sellerHome() {
    const block = guard("seller");
    if (block) return block;
    const user = actor();
    const status = new URLSearchParams((location.hash.split("?")[1] || "")).get("status") || "";
    const listings = db.products.filter((product) => product.sellerId === user.id && product.listingStatus !== "removed");
    const removed = db.products.filter((product) => product.sellerId === user.id && product.listingStatus === "removed");
    const transactions = db.orders
      .filter((order) => order.sellerId === user.id && (!status || order.status === status))
      .map((order) => E.orderView(db, order, Date.now()));
    const statuses = [{ id: "", en: "All transactions", zh: "全部交易" }].concat(E.STATUSES.map((id) => ({ id, en: STATUS[id].en, zh: STATUS[id].zh })));
    return `${chrome()}${banner()}<section class="mk-sheet">
      <div class="mk-head">
        <div>
          <p class="mk-kicker">${esc(user.shopName || "")}</p>
          <h2>${zh() ? "賣家工作台" : "Seller desk"}</h2>
        </div>
        <div class="mk-row-actions">
          <a class="mk-btn" href="#/sell/products/new">${zh() ? "新增商品" : "Add item"}</a>
          <button type="button" class="mk-btn mk-ghost" data-action="csv" data-status="${esc(status)}">${zh() ? "匯出 CSV" : "Export CSV"}</button>
        </div>
      </div>
      <p>${zh() ? "上架或移除商品，並追蹤這間店的每一筆交易。CSV 會依你目前選的交易狀態匯出。" : "List or remove items, then follow every transaction for this shop. The CSV follows the transaction status you select."}</p>
      <h3>${zh() ? "商品" : "Listings"}</h3>
      <div class="mk-table"><table>
        <thead><tr>
          <th>${zh() ? "商品" : "Item"}</th>
          <th>${zh() ? "價格" : "Price"}</th>
          <th>${zh() ? "可售" : "Available"}</th>
          <th>${zh() ? "買家已買" : "Sold"}</th>
          <th>${zh() ? "上架狀態" : "Listing"}</th>
          <th></th>
        </tr></thead>
        <tbody>${listings.map((product) => `<tr>
          <td>${esc(pick(product.name))}<br><small>${esc(purchaseNote(product))}</small></td>
          <td>${esc(money(product.price))}</td>
          <td>${product.quantity}</td>
          <td>${purchaseCount(product)}</td>
          <td>${esc(pick(LISTING[product.listingStatus]))}</td>
          <td class="mk-row-actions">
            <a href="#/sell/products/${esc(product.id)}/edit">${zh() ? "編輯" : "Edit"}</a>
            <button type="button" data-action="visibility" data-step="remove" data-id="${esc(product.id)}">${zh() ? "移除" : "Remove"}</button>
          </td>
        </tr>`).join("") || `<tr><td colspan="6">${zh() ? "還沒有上架的商品。" : "No items listed yet."}</td></tr>`}</tbody>
      </table></div>
      ${removed.length ? `<p class="mk-note">${zh() ? "已移除、買家看不到的商品：" : "Removed from the floor:"} ${esc(removed.map((product) => pick(product.name)).join(", "))}</p>` : ""}
      <h3>${zh() ? "交易" : "Transactions"}</h3>
      <div class="mk-chips">${statuses.map((item) => `<a class="${status === item.id ? "on" : ""}" href="#/sell${item.id ? "?status=" + item.id : ""}">${esc(zh() ? item.zh : item.en)}</a>`).join("")}</div>
      <div class="mk-table"><table>
        <thead><tr>
          <th>${zh() ? "訂單編號" : "Order ID"}</th>
          <th>${zh() ? "買家" : "Buyer"}</th>
          <th>${zh() ? "商品" : "Items"}</th>
          <th>${zh() ? "日期" : "Date"}</th>
          <th>${zh() ? "合計" : "Total"}</th>
          <th>${zh() ? "狀態" : "Status"}</th>
        </tr></thead>
        <tbody>${transactions.map((order) => `<tr>
          <td><a href="#/sell/orders/${esc(order.id)}">${esc(order.id)}</a></td>
          <td>${esc(order.buyer.name)}</td>
          <td>${esc(order.items.map((item) => pick(item.name) + " × " + item.quantity).join(", "))}</td>
          <td>${esc(when(order.createdAt))}</td>
          <td>${esc(money(order.total))}</td>
          <td>${esc(pick(STATUS[order.status]))}</td>
        </tr>`).join("") || `<tr><td colspan="6">${zh() ? "這個狀態沒有交易。" : "No transactions for this status."}</td></tr>`}</tbody>
      </table></div>
    </section>`;
  }

  function inventoryPage() {
    const block = guard("seller");
    if (block) return block;
    const result = E.sellerProducts(db, userId(), activeRole());
    const locked = result.sellerStatus !== "approved";
    return `${chrome()}${banner()}<section class="mk-sheet">
      <div class="mk-head"><div><p class="mk-kicker">${esc(result.shopName || "")}</p><h2>${zh() ? "庫存" : "Inventory"}</h2></div>${locked ? "" : `<a class="mk-btn" href="#/sell/products/new">${zh() ? "上架商品" : "Add product"}</a>`}</div>
      <p class="mk-formula">${zh() ? "可售庫存 = 目前存貨 − 已購買數量。完成的交易不會把庫存加回去，也不會刪除訂單。" : "Available stock = current inventory − purchased quantity. Completed sales do not return stock, and orders are not deleted."}</p>
      ${locked ? `<p class="mk-note">${tErr("not_approved")}</p>` : ""}
      <div class="mk-table"><table>
        <thead><tr>
          <th>${zh() ? "商品" : "Product"}</th>
          <th>${zh() ? "分類" : "Category"}</th>
          <th>${zh() ? "價格" : "Price"}</th>
          <th>${zh() ? "可售" : "Available"}</th>
          <th>${zh() ? "買家已買" : "Sold"}</th>
          <th>${zh() ? "存貨狀態" : "Stock"}</th>
          <th>${zh() ? "上架狀態" : "Listing"}</th>
          <th></th>
        </tr></thead>
        <tbody>${result.products.map((product) => `<tr>
          <td>${esc(pick(product.name))}<br><small>${zh() ? "目前存貨" : "Current inventory"} ${product.currentInventory} − ${zh() ? "已購買" : "purchased"} ${product.purchased}</small><br><small>${esc(purchaseNote(product))}</small></td>
          <td>${esc(pick(CATS[product.category]))}</td>
          <td>${esc(money(product.price))}</td>
          <td><input data-qty="${esc(product.id)}" type="number" min="0" value="${product.quantity}" ${locked ? "disabled" : ""}></td>
          <td>${purchaseCount(product)}</td>
          <td><em class="mk-pill ${product.stockStatus}">${esc(pick(STOCK[product.stockStatus]))}</em></td>
          <td>${esc(pick(LISTING[product.listingStatus]))}</td>
          <td class="mk-row-actions">
            ${locked ? "" : `<a href="#/sell/products/${esc(product.id)}/edit">${zh() ? "編輯" : "Edit"}</a>`}
            ${locked ? "" : `<button type="button" data-action="set-qty" data-id="${esc(product.id)}">${zh() ? "更新數量" : "Update quantity"}</button>`}
            ${!locked && product.listingStatus === "active" ? `<button type="button" data-action="visibility" data-step="hide" data-id="${esc(product.id)}">${zh() ? "隱藏" : "Hide"}</button>` : ""}
            ${!locked && product.listingStatus === "hidden" ? `<button type="button" data-action="visibility" data-step="unhide" data-id="${esc(product.id)}">${zh() ? "重新上架" : "List again"}</button>` : ""}
            ${!locked && product.listingStatus !== "removed" ? `<button type="button" data-action="visibility" data-step="remove" data-id="${esc(product.id)}">${zh() ? "移除" : "Remove"}</button>` : ""}
          </td>
        </tr>`).join("")}</tbody>
      </table></div>
    </section>`;
  }

  function productForm(id) {
    const block = guard("seller");
    if (block) return block;
    const user = actor();
    if (user.sellerStatus !== "approved") {
      return `${chrome()}<section class="mk-panel"><h2>${esc(user.shopName || "")}</h2><p class="mk-note">${tErr("not_approved")}</p></section>`;
    }
    const product = id ? E.findProduct(db, id) : null;
    if (id && (!product || product.sellerId !== user.id)) {
      return `${chrome()}<section class="mk-panel"><h2>${zh() ? "找不到商品" : "Listing unavailable"}</h2></section>`;
    }
    const value = product || { name: { en: "" }, category: "textbooks", description: { en: "" }, price: "", quantity: 1, listingStatus: "active", image: "" };
    return `${chrome()}${banner()}<section class="mk-panel mk-narrow">
      <h2>${product ? (zh() ? "編輯商品" : "Save product") : (zh() ? "上架商品" : "List a product")}</h2>
      <form data-action="save-product">
        <input type="hidden" name="id" value="${esc(product ? product.id : "")}">
        <label>${zh() ? "商品名稱" : "Product name"}<input name="name" value="${esc(pick(value.name))}" required></label>
        <label>${zh() ? "分類" : "Category"}<select name="category">${E.CATEGORIES.map((cat) => `<option value="${cat}" ${value.category === cat ? "selected" : ""}>${esc(pick(CATS[cat]))}</option>`).join("")}</select></label>
        <label>${zh() ? "說明" : "Description"}<textarea name="description" rows="4" required>${esc(pick(value.description))}</textarea></label>
        <label>${zh() ? "價格（新台幣）" : "Price (NT$)"}<input name="price" type="number" min="0" step="1" value="${esc(value.price)}" required></label>
        <label>${zh() ? "可售數量" : "Quantity available"}<input name="quantity" type="number" min="0" step="1" value="${esc(value.quantity)}" required></label>
        <label>${zh() ? "上架狀態" : "Listing status"}<select name="listingStatus"><option value="active" ${value.listingStatus === "active" ? "selected" : ""}>${esc(pick(LISTING.active))}</option><option value="hidden" ${value.listingStatus === "hidden" ? "selected" : ""}>${esc(pick(LISTING.hidden))}</option></select></label>
        <label>${zh() ? "商品圖片" : "Product image"}<input name="image" type="file" accept="image/*"></label>
        ${product && product.image ? `<img class="mk-thumb" src="${esc(product.image)}" alt="">` : ""}
        <button class="mk-btn" type="submit">${product ? (zh() ? "儲存商品" : "Save product") : (zh() ? "上架" : "List product")}</button>
      </form>
    </section>`;
  }

  function sellerOrders(queue) {
    const block = guard("seller");
    if (block) return block;
    const user = actor();
    const mine = db.orders.filter((order) => order.sellerId === user.id).map((order) => E.orderView(db, order, Date.now()));
    const queues = [
      ["process", zh() ? "待處理訂單" : "Orders to process"],
      ["payments", zh() ? "待確認付款" : "Payments to confirm"],
      ["ship", zh() ? "待出貨" : "Products to ship"]
    ];
    const current = queue === "payments" || queue === "ship" ? queue : "process";
    const rows = mine.filter((order) => E.inQueue(order, current));
    return `${chrome()}${banner()}<section class="mk-sheet">
      <h2>${zh() ? "賣家訂單" : "Shop orders"}</h2>
      <p>${zh() ? "這些是還需要你處理的訂單。已出貨與已完成的銷售留在" : "These are the orders that still need you. Shipped and completed sales stay in"} <a href="#/sell/sales">${zh() ? "銷售紀錄" : "sales history"}</a>${zh() ? "，不會刪除。" : " and are not deleted."}</p>
      <div class="mk-chips">${queues.map(([id, label]) => `<a class="${current === id ? "on" : ""}" href="#/sell/orders${id === "process" ? "" : "/" + id}">${esc(label)} (${mine.filter((order) => E.inQueue(order, id)).length})</a>`).join("")}</div>
      <div class="mk-table"><table>
        <thead><tr><th>${zh() ? "訂單編號" : "Order ID"}</th><th>${zh() ? "買家" : "Buyer"}</th><th>${zh() ? "訂單日期" : "Order date"}</th><th>${zh() ? "合計" : "Total amount"}</th><th>${zh() ? "付款狀態" : "Payment status"}</th><th>${zh() ? "訂單狀態" : "Order status"}</th></tr></thead>
        <tbody>${rows.map((order) => `<tr>
          <td><a href="#/sell/orders/${esc(order.id)}">${esc(order.id)}</a></td>
          <td>${esc(order.buyer.name)}</td>
          <td>${esc(when(order.createdAt))}</td>
          <td>${esc(money(order.total))}</td>
          <td>${esc(pick(PAY[order.paymentStatus]))}</td>
          <td>${esc(pick(STATUS[order.status]))}</td>
        </tr>`).join("")}</tbody>
      </table></div>
      ${rows.length ? "" : `<p class="mk-empty">${zh() ? "這個佇列是空的。" : "Nothing in this queue."}</p>`}
    </section>`;
  }

  function sellerOrder(id) {
    const block = guard("seller");
    if (block) return block;
    const order = db.orders.find((entry) => entry.id === id && entry.sellerId === userId());
    if (!order) return `${chrome()}<section class="mk-panel"><h2>${zh() ? "找不到訂單" : "Order unavailable"}</h2></section>`;
    return `${chrome()}${banner()}<p><a href="#/sell/orders">${zh() ? "全部店內訂單" : "All shop orders"}</a></p>${orderArticle(E.orderView(db, order, Date.now()), "seller")}`;
  }

  function salesPage() {
    const block = guard("seller");
    if (block) return block;
    const summary = E.salesSummary(db, userId(), Date.now());
    const orders = db.orders.filter((order) => order.sellerId === userId()).map((order) => E.orderView(db, order, Date.now()));
    return `${chrome()}${banner()}<section class="mk-sheet">
      <div class="mk-head"><div><p class="mk-kicker">${zh() ? "賣家" : "Seller"}</p><h2>${zh() ? "交易紀錄" : "Transactions"}</h2></div><button type="button" class="mk-btn" data-action="csv">${zh() ? "匯出 CSV" : "Export CSV"}</button></div>
      <p>${zh() ? "這間店的每一筆訂單都留在交易紀錄裡，包含已完成的交易。需要時可以匯出 CSV。" : "Every order for this shop stays in the transaction record, including completed sales. Export a CSV whenever you need it."}</p>
      <div class="mk-stats">
        <article><span>${esc(summary.monthLabel)} ${zh() ? "營收" : "revenue"}</span><strong>${esc(money(summary.monthlyRevenue))}</strong></article>
        <article><span>${zh() ? "已完成訂單" : "Completed orders"}</span><strong>${summary.completedOrders}</strong></article>
        <article><span>${zh() ? "待確認付款" : "Pending payments"}</span><strong>${summary.pendingPayments}</strong><small>${esc(money(summary.pendingPaymentAmount))} ${zh() ? "待處理" : "waiting"}</small></article>
        <article><span>${zh() ? "待出貨訂單" : "Orders waiting for shipment"}</span><strong>${summary.waitingShipment}</strong></article>
      </div>
      ${summary.months.length ? `<ul class="mk-months">${summary.months.map((month) => `<li><span>${esc(month.month)}</span><b>${esc(money(month.revenue))}</b><small>${month.completedOrders} ${zh() ? "筆完成" : "completed"}</small></li>`).join("")}</ul>` : ""}
      <div class="mk-table"><table>
        <thead><tr><th>${zh() ? "訂單編號" : "Order ID"}</th><th>${zh() ? "買家" : "Buyer"}</th><th>${zh() ? "商品" : "Products"}</th><th>${zh() ? "日期" : "Date"}</th><th>${zh() ? "合計" : "Total"}</th><th>${zh() ? "付款" : "Payment"}</th><th>${zh() ? "狀態" : "Status"}</th></tr></thead>
        <tbody>${orders.map((order) => `<tr>
          <td><a href="#/sell/orders/${esc(order.id)}">${esc(order.id)}</a></td>
          <td>${esc(order.buyer.name)}</td>
          <td>${esc(order.items.map((item) => pick(item.name) + " × " + item.quantity).join(", "))}</td>
          <td>${esc(when(order.createdAt))}</td>
          <td>${esc(money(order.total))}</td>
          <td>${esc(pick(PAY[order.paymentStatus]))}</td>
          <td>${esc(pick(STATUS[order.status]))}</td>
        </tr>`).join("")}</tbody>
      </table></div>
    </section>`;
  }

  function adminPage() {
    const block = guard("admin");
    if (block) return block;
    const filters = readAdminFilters();
    const report = E.adminOrders(db, filters, Date.now());
    const chips = [{ id: "", en: "Any status", zh: "任何狀態" }].concat(E.STATUSES.map((id) => ({ id, en: STATUS[id].en, zh: STATUS[id].zh })));
    return `${chrome()}${banner()}<section class="mk-sheet">
      <p class="mk-kicker">${zh() ? "平台管理員" : "Platform admin"}</p>
      <h2>${zh() ? "交易管理" : "Transaction management"}</h2>
      <p class="mk-note">${zh() ? `這裡列出每一間店的每一筆買家交易，目前顯示 ${report.orders.length} 筆，資料庫共 ${db.orders.length} 筆。監看不會刪除已完成的交易。` : `Every buyer purchase from every shop is listed here. Showing ${report.orders.length} of ${db.orders.length} transactions. Monitoring does not delete a completed sale.`}</p>
      ${applicationSummary()}
      <p><button type="button" class="mk-text" data-action="reset">${zh() ? "還原示範市集" : "Restore the sample floor"}</button></p>
      <div class="mk-stats">
        <article><span>${zh() ? "交易金額" : "Transaction amount"}</span><strong>${esc(money(report.volume))}</strong></article>
        <article><span>${zh() ? "未完成" : "Incomplete"}</span><strong>${report.incompleteCount}</strong></article>
        <article><span>${zh() ? "異常" : "Abnormal"}</span><strong>${report.abnormalCount}</strong></article>
        ${E.STATUSES.map((key) => `<article><span>${esc(pick(STATUS[key]))}</span><strong>${report.counts[key] || 0}</strong></article>`).join("")}
      </div>
      <form class="mk-filters" data-action="admin-filter">
        <div class="mk-chips">
          <button type="submit" name="attention" value="" class="${filters.attention ? "" : "on"}">${zh() ? "全部交易" : "All transactions"}</button>
          <button type="submit" name="attention" value="incomplete" class="${filters.attention === "incomplete" ? "on" : ""}">${zh() ? "未完成" : "Incomplete"}</button>
          <button type="submit" name="attention" value="abnormal" class="${filters.attention === "abnormal" ? "on" : ""}">${zh() ? "異常" : "Abnormal"}</button>
        </div>
        <div class="mk-chips">${chips.map((chip) => `<button type="submit" name="status" value="${esc(chip.id)}" class="${filters.status === chip.id ? "on" : ""}">${esc(zh() ? chip.zh : chip.en)}</button>`).join("")}</div>
        <div class="mk-dates">
          <label>${zh() ? "搜尋訂單編號" : "Search by order ID"}<input name="q" value="${esc(filters.q)}" placeholder="MK-18420"></label>
          <label>${zh() ? "從" : "From"}<input name="from" type="date" value="${esc(filters.from)}"></label>
          <label>${zh() ? "到" : "To"}<input name="to" type="date" value="${esc(filters.to)}"></label>
          <button class="mk-btn" type="submit">${zh() ? "套用篩選" : "Apply filters"}</button>
        </div>
      </form>
      <div class="mk-table"><table>
        <thead><tr><th>${zh() ? "訂單編號" : "Order ID"}</th><th>${zh() ? "買家" : "Buyer"}</th><th>${zh() ? "賣家" : "Seller"}</th><th>${zh() ? "日期" : "Date"}</th><th>${zh() ? "交易金額" : "Transaction amount"}</th><th>${zh() ? "交易狀態" : "Transaction status"}</th><th>${zh() ? "注意" : "Attention"}</th></tr></thead>
        <tbody>${report.orders.map((order) => `<tr>
          <td><a href="#/admin/transactions/${esc(order.id)}">${esc(order.id)}</a></td>
          <td>${esc(order.buyer.name)}<br><small>${esc(order.buyer.email)}</small></td>
          <td>${esc(order.seller.shopName)}<br><small>${esc(order.seller.name)}</small></td>
          <td>${esc(when(order.createdAt))}</td>
          <td>${esc(money(order.total))}</td>
          <td>${esc(pick(STATUS[order.status]))}</td>
          <td>${order.flags.length ? esc(order.flags.map((flag) => pick(FLAGS[flag]) || flag).join(", ")) : order.incomplete ? (zh() ? "未完成" : "Incomplete") : (zh() ? "已入帳" : "On record")}</td>
        </tr>`).join("")}</tbody>
      </table></div>
      ${report.orders.length ? "" : `<p class="mk-empty">${zh() ? "沒有符合的交易。" : "No transactions match that search."}</p>`}
    </section>`;
  }

  function readAdminFilters() {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    return {
      q: params.get("q") || "",
      status: params.get("status") || "",
      attention: params.get("attention") || "",
      from: params.get("from") || "",
      to: params.get("to") || ""
    };
  }

  function adminOrder(id) {
    const block = guard("admin");
    if (block) return block;
    const order = E.findOrder(db, id);
    if (!order) return `${chrome()}<section class="mk-panel"><h2>${zh() ? "找不到交易" : "Transaction unavailable"}</h2></section>`;
    return `${chrome()}${banner()}<p><a href="#/admin">${zh() ? "全部交易" : "All transactions"}</a></p>${orderArticle(E.orderView(db, order, Date.now()), "admin")}`;
  }

  function pendingSellers() {
    return sellerApplications("pending");
  }
  function sellerStatusLabel(status) {
    const label = SELLER_STATUS[status];
    return label ? pick(label) : status || "";
  }
  function sellerApplications(status) {
    return db.users
      .filter((user) => user.roles.includes("seller") && user.sellerStatus)
      .filter((user) => !status || user.sellerStatus === status)
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }
  function applicationCounts() {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    sellerApplications().forEach((user) => {
      if (counts[user.sellerStatus] != null) counts[user.sellerStatus] += 1;
    });
    return counts;
  }
  function applicationFilter() {
    const status = new URLSearchParams(location.hash.split("?")[1] || "").get("status") || "";
    return SELLER_STATUS[status] ? status : "";
  }
  function applicationCard(user) {
    const address = user.address && user.address.line1
      ? [user.address.line1, user.address.city, user.address.region, user.address.postal, user.address.country].filter(Boolean).join(", ")
      : "";
    const action = user.sellerStatus === "pending"
      ? `<button type="button" class="mk-btn" data-action="user" data-step="approve" data-id="${esc(user.id)}">${zh() ? "核准這位賣家" : "Approve this seller"}</button>`
      : "";
    return `<article class="mk-application">
      <div>
        <strong>${esc(user.name)}</strong>
        <p><em class="mk-pill ${esc(user.sellerStatus)}">${esc(sellerStatusLabel(user.sellerStatus))}</em>${user.suspended ? (zh() ? " · 已停用" : " · Suspended") : ""}</p>
        <p>${esc(user.shopName || (zh() ? "未填店名" : "No shop name"))}</p>
        <p>${esc(user.email)}</p>
        ${user.address && user.address.phone ? `<p>${esc(user.address.phone)}</p>` : ""}
        ${address ? `<p>${esc(address)}</p>` : ""}
        ${user.createdAt ? `<p>${esc(when(user.createdAt))}</p>` : ""}
      </div>
      ${action}
    </article>`;
  }
  function applicationGroup(status) {
    const headings = {
      pending: { en: "Pending applications", zh: "待核准申請" },
      approved: { en: "Approved applications", zh: "已核准申請" },
      rejected: { en: "Declined applications", zh: "未核准申請" }
    };
    const empty = {
      pending: { en: "No seller applications are waiting.", zh: "目前沒有待核准的賣家申請。" },
      approved: { en: "No shops have been approved yet.", zh: "目前沒有已核准的賣家。" },
      rejected: { en: "No applications have been declined.", zh: "目前沒有被拒絕的申請。" }
    };
    const rows = sellerApplications(status);
    return `<section>
      <h3>${esc(pick(headings[status]))} (${rows.length})</h3>
      ${rows.length ? rows.map(applicationCard).join("") : `<p class="mk-empty">${esc(pick(empty[status]))}</p>`}
    </section>`;
  }
  function applicationsBoard() {
    const selected = applicationFilter();
    const counts = applicationCounts();
    const chips = [
      ["", { en: "All applications", zh: "全部申請" }],
      ["pending", SELLER_STATUS.pending],
      ["approved", SELLER_STATUS.approved],
      ["rejected", SELLER_STATUS.rejected]
    ];
    const groups = selected ? [selected] : ["pending", "approved", "rejected"];
    return `<div class="mk-applications">
      <div class="mk-stats">
        <article><span>${esc(pick(SELLER_STATUS.pending))}</span><strong>${counts.pending}</strong></article>
        <article><span>${esc(pick(SELLER_STATUS.approved))}</span><strong>${counts.approved}</strong></article>
        <article><span>${esc(pick(SELLER_STATUS.rejected))}</span><strong>${counts.rejected}</strong></article>
      </div>
      <div class="mk-chips">${chips.map(([id, label]) => `<a class="${selected === id ? "on" : ""}" href="#/admin/applications${id ? "?status=" + id : ""}">${esc(pick(label))} ${id ? counts[id] : counts.pending + counts.approved + counts.rejected}</a>`).join("")}</div>
      ${groups.map(applicationGroup).join("")}
    </div>`;
  }
  function applicationSummary() {
    const counts = applicationCounts();
    return `<div class="mk-applications">
      <h3>${zh() ? "賣家申請" : "Seller applications"}</h3>
      <p>${zh()
        ? `待核准 ${counts.pending}、已核准 ${counts.approved}、未核准 ${counts.rejected}。核准前，申請人可以購物，但不能上架或出貨。`
        : `Pending ${counts.pending}, approved ${counts.approved}, declined ${counts.rejected}. Until approval, an applicant can buy, but cannot list or ship.`}</p>
      <p><a class="mk-btn" href="#/admin/applications">${zh() ? "查看申請" : "Review applications"}</a></p>
    </div>`;
  }
  function applicationsPage() {
    const block = guard("admin");
    if (block) return block;
    return `${chrome()}${banner()}<section class="mk-sheet">
      <p class="mk-kicker">${zh() ? "平台管理員" : "Platform admin"}</p>
      <h2>${zh() ? "賣家申請" : "Seller applications"}</h2>
      <p>${zh()
        ? "待核准、已核准和未核准的賣家申請都留在這裡。待核准的申請可以在這頁核准。"
        : "Pending, approved, and declined seller applications stay on this desk. Approve a pending application from its card."}</p>
      ${applicationsBoard()}
    </section>`;
  }
  function usersPage() {
    const block = guard("admin");
    if (block) return block;
    const users = db.users.map((user) => E.userPublic(user));
    return `${chrome()}${banner()}<section class="mk-sheet">
      <h2>${zh() ? "使用者" : "Users"}</h2>
      ${applicationSummary()}
      <p class="mk-note">${zh() ? "也可以在這裡停用買家或賣家。平台管理員權限不能在這裡授予。" : "You can also suspend a buyer or seller here. Platform administrator access cannot be granted from this desk."}</p>
      <div class="mk-table"><table>
        <thead><tr><th>${zh() ? "姓名" : "Name"}</th><th>${zh() ? "角色" : "Role"}</th><th>${zh() ? "店名 / 狀態" : "Shop / status"}</th><th></th></tr></thead>
        <tbody>${users.map((user) => `<tr>
          <td>${esc(user.name)}<br><small>${esc(user.email)}</small>${user.address && user.address.phone ? `<br><small>${esc(user.address.phone)}</small>` : ""}</td>
          <td>${esc(user.roles.map(roleLabel).join(" / "))}</td>
          <td>${user.roles.includes("seller") ? esc(user.shopName || "") + " · " + esc(sellerStatusLabel(user.sellerStatus)) : "—"}${user.suspended ? (zh() ? " · 已停用" : " · suspended") : ""}</td>
          <td class="mk-row-actions">
            ${user.roles.includes("seller") && user.sellerStatus === "pending" ? `<button type="button" data-action="user" data-step="approve" data-id="${esc(user.id)}">${zh() ? "核准賣家" : "Approve seller"}</button>` : ""}
            ${!user.roles.includes("admin") && !user.suspended ? `<button type="button" data-action="user" data-step="suspend" data-id="${esc(user.id)}">${zh() ? "停用" : "Suspend"}</button>` : ""}
            ${!user.roles.includes("admin") && user.suspended ? `<button type="button" data-action="user" data-step="restore" data-id="${esc(user.id)}">${zh() ? "恢復" : "Restore"}</button>` : ""}
          </td>
        </tr>`).join("")}</tbody>
      </table></div>
    </section>`;
  }

  function activityPage() {
    const block = guard("admin");
    if (block) return block;
    return `${chrome()}${banner()}<section class="mk-sheet">
      <h2>${zh() ? "市集活動" : "Marketplace activity"}</h2>
      <ol class="mk-timeline">${db.activity.map((entry) => `<li><strong>${esc(pick(entry.message))}</strong><span>${esc(when(entry.at))} · ${esc(entry.actorName)}</span>${entry.orderId ? `<p><a href="#/admin/transactions/${esc(entry.orderId)}">${esc(entry.orderId)}</a></p>` : ""}</li>`).join("")}</ol>
    </section>`;
  }

  function purchaseCount(product) {
    const rows = E.productPurchases(db, product.id);
    if (!rows.length) return product.purchased || 0;
    return rows.reduce((sum, row) => sum + row.quantity, 0);
  }
  function purchaseNote(product) {
    const rows = E.productPurchases(db, product.id);
    if (!rows.length) return zh() ? "還沒有買家購買。" : "No buyer purchases yet.";
    return rows.map((row) => zh()
      ? `${row.buyerName} 買了 ${row.quantity}（${row.orderId}）`
      : `${row.buyerName} bought ${row.quantity} (${row.orderId})`).join(zh() ? "、" : ", ");
  }
  function sellerDeskNote() {
    const user = E.findUser(db, userId());
    if (!user || activeRole() === "seller") return "";
    if (!user.roles.includes("seller") || user.sellerStatus !== "approved") return "";
    return `<p class="mk-note">${zh()
      ? "這間店已經核准。切換到賣家，就能看到庫存和買家買走的數量。"
      : "This shop is approved. Switch to Seller to see inventory and the quantities buyers purchased."}</p>`;
  }

  function sellerWaiting(user) {
    const person = user || E.findUser(db, userId());
    return !!(person && person.roles.includes("seller") && person.sellerStatus !== "approved");
  }

  function waitingPage() {
    const user = E.findUser(db, userId());
    return `${chrome()}${banner()}<section class="mk-panel mk-narrow">
      <p class="mk-kicker">${esc(user.shopName || (zh() ? "賣家" : "Seller"))}</p>
      <h2>${zh() ? "等待核准" : "Waiting for approval"}</h2>
      <p>${zh()
        ? "你現在可以買書。切換到買家就能逛市集、使用購物車和查看訂單。上架、庫存、出貨和銷售要等超級管理員核准這間店。"
        : "You can buy now. Switch to Buyer for the floor, the cart, and your orders. Listing, inventory, shipping, and sales stay closed until the super admin approves this shop."}</p>
      <p class="mk-note">${zh() ? "核准後請重新整理或重新登入，賣家工作台就會打開。" : "After approval, refresh or sign in again and the seller desk opens."}</p>
    </section>`;
  }

  function sellApplication() {
    const user = actor();
    if (!user || user.role !== "buyer" || user.roles.includes("admin")) return "";
    if (user.roles.includes("seller") && user.sellerStatus === "approved") return "";
    if (user.roles.includes("seller") && user.sellerStatus === "pending") {
      return `<p class="mk-note">${zh()
        ? "賣家申請審核中。你現在可以購物。超級管理員核准後才能上架與出貨。"
        : "Your seller application is waiting. You can keep buying. Listing and shipping open after the super admin approves the shop."}</p>`;
    }
    return `<form data-action="apply-seller">
      <p>${zh()
        ? "買家不能直接成為賣家。留下店名申請，超級管理員核准後才能上架。"
        : "A buyer cannot sell until the super admin approves the shop. Leave a shop name to apply."}</p>
      <label>${zh() ? "店名" : "Shop name"}<input name="shopName" required minlength="2" placeholder="${zh() ? "買家會看到的名稱" : "The name buyers will see"}"></label>
      <button class="mk-btn" type="submit">${zh() ? "申請成為賣家" : "Apply to sell"}</button>
    </form>`;
  }

  function view() {
    const parts = route();
    const head = parts[0] || "";
    if (head === "sell" && sellerWaiting()) return waitingPage();
    if (head === "login") return loginPage();
    if (head === "register") return registerPage(parts[1]);
    if (head === "product") return productPage(parts[1]);
    if (head === "cart") return cartPage();
    if (head === "checkout") return checkoutPage();
    if (head === "orders") return parts[1] ? buyerOrder(parts[1]) : ordersPage();
    if (head === "sell") {
      if (!parts[1]) return sellerHome();
      if (parts[1] === "inventory") return inventoryPage();
      if (parts[1] === "products" && parts[2] === "new") return productForm(null);
      if (parts[1] === "products" && parts[3] === "edit") return productForm(parts[2]);
      if (parts[1] === "orders") {
        if (!parts[2] || parts[2] === "payments" || parts[2] === "ship") return sellerOrders(parts[2] || "process");
        return sellerOrder(parts[2]);
      }
      if (parts[1] === "sales") return salesPage();
    }
    if (head === "admin") {
      if (parts[1] === "users") return usersPage();
      if (parts[1] === "applications") return applicationsPage();
      if (parts[1] === "activity") return activityPage();
      if (parts[1] === "transactions" && parts[2]) return adminOrder(parts[2]);
      return adminPage();
    }
    return floor(parts);
  }

  function fail(result) {
    flash = tErr(result.error);
    renderMarket();
  }

  function afterLogin(result) {
    setSession(result.user.id, result.activeRole);
    flash = zh() ? "已登入。" : "Signed in.";
    go(deskFor(result.activeRole));
  }

  async function enterDesk(result) {
    if (!result || result.ok === false || !result.user) return fail(result || { error: "cloud" });
    if (!window.MarketCloud) return afterLogin(result);
    if (result.token) sessionStorage.setItem(TOKEN, result.token);
    try {
      db = await pull();
    } catch (error) {
      sessionStorage.removeItem(TOKEN);
      return fail({ error: "cloud" });
    }
    if (!E.findUser(db, result.user.id)) {
      sessionStorage.removeItem(TOKEN);
      return fail({ error: "cloud" });
    }
    afterLogin(result);
  }

  async function readImage(file) {
    if (!file) return "";
    if (file.size > 1.4 * 1024 * 1024) {
      flash = tErr("image");
      return null;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  }

  function bind(root) {
    root.querySelector("[data-role-switch]")?.addEventListener("change", (event) => {
      const user = E.findUser(db, userId());
      const next = event.target.value;
      if (!user || !user.roles.includes(next)) return;
      sessionStorage.setItem(ROLE, next);
      flash = zh() ? "工作台已換成" + roleLabel(next) + "。" : "Desk switched to " + roleLabel(next) + ".";
      go(deskFor(next));
    });
    root.querySelectorAll("[data-cart-qty]").forEach((input) => {
      input.addEventListener("change", () => {
        const result = E.setCartQuantity(db, userId(), activeRole(), input.dataset.cartQty, input.value);
        if (!result.ok) return fail(result);
        commit();
      });
    });
    root.querySelectorAll('input[name="delivery"]').forEach((input) => {
      input.addEventListener("change", () => {
        const user = E.findUser(db, userId());
        if (!user) return;
        const cart = E.cartView(db, user);
        const quote = E.cartQuote(cart.subtotal, input.value);
        const box = root.querySelector("[data-quote]");
        if (box) box.outerHTML = chargeSummary(quote);
        const link = root.querySelector("[data-checkout]");
        if (link) link.href = "#/checkout?delivery=" + encodeURIComponent(input.value);
        const path = (location.hash || "#/cart").replace(/^#/, "").split("?")[0];
        history.replaceState(null, "", "#" + path + "?delivery=" + encodeURIComponent(input.value));
      });
    });
    if (root.dataset.bound === "yes") return;
    root.dataset.bound = "yes";
    root.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-action]");
      if (!button || button.tagName === "FORM") return;
      const action = button.dataset.action;
      if (action === "logout") {
        const current = token();
        deferSuper = true;
        setSession("", "");
        sessionStorage.removeItem(TOKEN);
        if (current && window.MarketCloud) MarketCloud.logout(current);
        flash = zh() ? "已登出。你可以繼續以訪客瀏覽。" : "Signed out. You can keep browsing as a visitor.";
        go("/");
        return;
      }
      if (action === "reset") {
        if (!window.MarketCloud) {
          db = E.createSeed(new Date());
          remember(db);
          setSession("", "");
          flash = zh() ? "示範資料已還原。" : "Sample data restored.";
          go("/login");
          return;
        }
        const result = await MarketCloud.reset(token());
        if (!result || result.ok === false) return fail(result || { error: "cloud" });
        if (result.token) sessionStorage.setItem(TOKEN, result.token);
        db = await pull();
        flash = zh() ? "示範市集已還原。" : "Sample floor restored.";
        go("/admin");
        return;
      }
      if (action === "super") {
        deferSuper = false;
        const claimed = await claimSuperAdmin(true);
        if (!claimed) return fail({ error: "admin_only" });
        db = await pull();
        flash = zh() ? "已進入超級管理員工作台。" : "Opened the super admin desk.";
        go("/admin");
        return;
      }
      if (action === "demo") {
        if (!window.MarketCloud) {
          const result = E.login(db, button.dataset.email, E.DEMO_PASSWORD);
          if (!result.ok) return fail(result);
          afterLogin(result);
          return;
        }
        const result = await MarketCloud.login(button.dataset.email, E.DEMO_PASSWORD);
        await enterDesk(result);
        return;
      }
      if (action === "cart-remove") {
        const result = E.setCartQuantity(db, userId(), activeRole(), button.dataset.id, 0);
        if (!result.ok) return fail(result);
        commit();
        return;
      }
      if (action === "advance") {
        const note = document.getElementById("ship-note");
        const result = E.advance(db, userId(), activeRole(), button.dataset.id, button.dataset.step, note ? note.value : "", Date.now());
        if (!result.ok) return fail(result);
        flash = button.dataset.step === "payment_received"
          ? (zh() ? "已確認收款，訂單進入出貨。" : "Payment confirmed. The order is now in shipping.")
          : button.dataset.step === "transaction_complete"
            ? (zh() ? "交易已完成，紀錄會保留。" : "Transaction complete. The record stays.")
            : (zh() ? "訂單狀態已更新。賣家與買家會看到同一筆紀錄。" : "Order status updated. Buyer and seller share this record.");
        commit();
        return;
      }
      if (action === "complete") {
        const result = E.completeOrder(db, userId(), activeRole(), button.dataset.id, Date.now());
        if (!result.ok) return fail(result);
        flash = zh() ? "交易已完成，紀錄會保留。" : "Transaction completed. The record stays.";
        commit();
        return;
      }
      if (action === "set-qty") {
        const input = root.querySelector(`[data-qty="${CSS.escape(button.dataset.id)}"]`);
        const result = E.setQuantity(db, userId(), activeRole(), button.dataset.id, input ? input.value : "", Date.now());
        if (!result.ok) return fail(result);
        flash = zh() ? "可售數量已更新。" : "Available quantity updated.";
        commit();
        return;
      }
      if (action === "visibility") {
        if (button.dataset.step === "remove" && !window.confirm(zh() ? "下架後買家就看不到這項商品。已完成的訂單仍會保留。" : "Buyers will no longer see this listing. Completed orders stay on record.")) return;
        const result = E.setVisibility(db, userId(), activeRole(), button.dataset.id, button.dataset.step, Date.now());
        if (!result.ok) return fail(result);
        commit();
        return;
      }
      if (action === "user") {
        const result = E.adminUsers(db, userId(), activeRole(), button.dataset.id, button.dataset.step, Date.now());
        if (!result.ok) return fail(result);
        flash = button.dataset.step === "approve"
          ? (zh() ? "已核准這位賣家。對方現在可以管理庫存與出貨。" : "Seller approved. They can now manage inventory and shipping.")
          : (zh() ? "使用者狀態已更新。" : "User updated.");
        commit();
        return;
      }
      if (action === "csv") {
        const wanted = button.dataset.status || "";
        const csv = E.salesCsv(db, userId(), wanted);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = wanted ? "immba-transactions-" + wanted + ".csv" : "immba-transactions.csv";
        link.click();
        URL.revokeObjectURL(url);
      }
    });
    root.addEventListener("submit", async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      event.preventDefault();
      const data = new FormData(form);
      const action = form.dataset.action;
      if (action === "login") {
        if (!window.MarketCloud) {
          const result = E.login(db, data.get("email"), data.get("password"));
          if (!result.ok) return fail(result);
          afterLogin(result);
          return;
        }
        const result = await MarketCloud.login(String(data.get("email") || "").trim(), data.get("password"));
        await enterDesk(result);
        return;
      }
      if (action === "register") {
        const input = {
          name: data.get("name"),
          email: data.get("email"),
          password: data.get("password"),
          role: data.get("role"),
          shopName: data.get("shopName"),
          phone: data.get("phone"),
          line1: data.get("line1"),
          city: data.get("city"),
          region: data.get("region"),
          postal: data.get("postal"),
          country: data.get("country")
        };
        if (!window.MarketCloud) {
          const result = E.register(db, input, Date.now());
          if (!result.ok) return fail(result);
          remember(db);
          afterLogin(result);
          return;
        }
        const result = await MarketCloud.register(input);
        await enterDesk(result);
        return;
      }
      if (action === "apply-seller") {
        const shopName = data.get("shopName");
        if (!window.MarketCloud) {
          const result = E.applySeller(db, userId(), activeRole(), shopName, Date.now());
          if (!result.ok) return fail(result);
          flash = zh() ? "已送出賣家申請。你仍可以購物，核准後才能上架。" : "Seller application sent. You can keep buying. Listing opens after approval.";
          commit();
          return;
        }
        const result = await MarketCloud.applySeller(token(), shopName);
        if (!result || result.ok === false) return fail(result || { error: "cloud" });
        db = await pull();
        flash = zh() ? "已送出賣家申請。你仍可以購物，核准後才能上架。" : "Seller application sent. You can keep buying. Listing opens after approval.";
        renderMarket();
        return;
      }
      if (action === "add-cart") {
        const result = E.addToCart(db, userId(), activeRole(), data.get("productId"), data.get("quantity"));
        if (!result.ok) return fail(result);
        flash = zh() ? "已加入購物車。" : "Added to cart.";
        commit(() => go("/cart"));
        return;
      }
      if (action === "checkout") {
        const user = E.findUser(db, userId());
        const cart = E.cartView(db, user);
        const result = E.placeOrders(db, userId(), activeRole(), {
          quantitiesConfirmed: true,
          paymentMethod: data.get("paymentMethod"),
          paymentReference: data.get("paymentReference"),
          delivery: data.get("delivery") || deliveryChoice(),
          address: {
            recipient: data.get("recipient"),
            line1: data.get("line1"),
            city: data.get("city"),
            region: data.get("region"),
            postal: data.get("postal"),
            country: data.get("country"),
            phone: data.get("phone")
          },
          items: cart.items.filter((item) => item.purchasable).map((item) => ({ productId: item.productId, quantity: item.quantity }))
        }, Date.now());
        if (!result.ok) return fail(result);
        flash = zh() ? "已付款。賣家確認收款後，訂單才會進入出貨。" : "Payment sent. Shipping starts after the seller confirms it.";
        commit(() => go(result.orders.length === 1 ? "/orders/" + result.orders[0].id : "/orders"));
        return;
      }
      if (action === "save-product") {
        const fileInput = form.elements.namedItem("image");
        const file = fileInput && fileInput.files && fileInput.files[0];
        const image = await readImage(file);
        if (image === null) return renderMarket();
        const result = E.saveProduct(db, userId(), activeRole(), {
          name: data.get("name"),
          category: data.get("category"),
          description: data.get("description"),
          price: data.get("price"),
          quantity: data.get("quantity"),
          listingStatus: data.get("listingStatus"),
          image
        }, data.get("id") || null, Date.now());
        if (!result.ok) return fail(result);
        flash = zh() ? "商品已儲存。" : "Product saved.";
        commit(() => go("/sell/inventory"));
        return;
      }
      if (action === "search") {
        const submitter = event.submitter;
        const category = submitter && submitter.name === "category" ? submitter.value : "";
        const params = new URLSearchParams();
        const q = String(data.get("q") || "").trim();
        if (q) params.set("q", q);
        if (category) params.set("category", category);
        const next = "/?" + params.toString();
        go(params.toString() ? next : "/");
        return;
      }
      if (action === "admin-filter") {
        const submitter = event.submitter;
        const params = new URLSearchParams();
        const current = readAdminFilters();
        let attention = current.attention;
        let status = current.status;
        if (submitter && submitter.name === "attention") attention = submitter.value;
        if (submitter && submitter.name === "status") status = submitter.value;
        const q = String(data.get("q") || current.q || "").trim();
        const from = String(data.get("from") || "");
        const to = String(data.get("to") || "");
        if (q) params.set("q", q);
        if (status) params.set("status", status);
        if (attention) params.set("attention", attention);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        go("/admin" + (params.toString() ? "?" + params.toString() : ""));
      }
    });
  }

  function renderMarket() {
    const root = document.getElementById("market-root");
    if (!root) return;
    const message = flash;
    root.innerHTML = view();
    flash = "";
    if (message) {
      const slot = root.querySelector(".mk-flash");
      if (!slot) root.insertAdjacentHTML("afterbegin", `<p class="mk-flash">${esc(message)}</p>`);
    }
    labelTables(root);
    bind(root);
  }

  function labelTables(root) {
    root.querySelectorAll(".mk-table table").forEach((table) => {
      const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
      table.querySelectorAll("tbody tr").forEach((row) => {
        [...row.children].forEach((cell, index) => {
          if (heads[index]) cell.setAttribute("data-label", heads[index]);
        });
      });
    });
  }

  let loadGen = 0;
  let deferSuper = false;
  async function claimSuperAdmin(force) {
    if (!force && (deferSuper || token())) return false;
    if (!window.MarketCloud || typeof initAuth !== "function") return false;
    const state = window.immbaAuthState && window.immbaAuthState.ready ? window.immbaAuthState : await initAuth();
    if (!state || state.role !== "super_admin" || !state.session || !state.session.access_token) return false;
    const result = await MarketCloud.enterSuper(state.session.access_token);
    if (!result || result.ok === false || !result.token || !result.user) return false;
    sessionStorage.setItem(TOKEN, result.token);
    setSession(result.user.id, "admin");
    return true;
  }
  window.mountMarketplace = function () {
    const gen = ++loadGen;
    const root = document.getElementById("market-root");
    if (root && !db) {
      root.innerHTML = `<p class="mk-empty">${typeof getLang === "function" && getLang() === "zh" ? "正在讀取市集…" : "Loading the marketplace…"}</p>`;
    }
    const job = (async () => {
      if (window.MarketCloud && !token() && !deferSuper) {
        const claimed = await claimSuperAdmin(false);
        if (claimed) {
          const head = (location.hash || "#/").replace(/^#\/?/, "").split(/[/?]/)[0];
          if (!head || head === "login" || head === "register") {
            location.hash = "/admin";
            return null;
          }
        }
      }
      return window.MarketCloud ? pull() : load();
    })();
    Promise.resolve(job).then((state) => {
      if (gen !== loadGen || !state) return;
      db = state;
      renderMarket();
    }).catch(() => {
      if (gen !== loadGen) return;
      if (!db) db = load();
      flash = tErr("cloud");
      renderMarket();
    });
  };
})();
