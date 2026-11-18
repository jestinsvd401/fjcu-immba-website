/* Role-based C2C marketplace for the imMBA books and materials desk.
   Shared by the page and by the node checks. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MarketEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const LOW_STOCK = 5;
  const STATUSES = ["waiting_payment", "payment_confirmed", "ready_to_ship", "shipped", "completed"];
  const CATEGORIES = ["textbooks", "packs", "notes", "stationery", "electronics"];
  const DEMO_PASSWORD = "immba-demo";

  function iso(date) {
    return new Date(date).toISOString();
  }

  function daysBefore(now, days) {
    return iso(new Date(now).getTime() - days * 24 * 60 * 60 * 1000);
  }

  function stockStatus(quantity) {
    if (quantity <= 0) return "out_of_stock";
    if (quantity <= LOW_STOCK) return "low_stock";
    return "in_stock";
  }

  function currentInventory(product) {
    return product.quantity + (product.purchased || 0);
  }

  function cover(_title, accent) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320" viewBox="0 0 240 320"><rect width="240" height="320" fill="${accent}"/><rect x="28" y="24" width="184" height="272" fill="none" stroke="#fff8e8" stroke-width="3"/><rect x="28" y="24" width="18" height="272" fill="#fff8e8" opacity="0.35"/></svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function userPublic(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.slice(),
      shopName: user.shopName || null,
      sellerStatus: user.sellerStatus || null,
      suspended: !!user.suspended,
      address: user.address || null
    };
  }

  function productView(product, seller) {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      purchased: product.purchased || 0,
      currentInventory: currentInventory(product),
      stockStatus: stockStatus(product.quantity),
      image: product.image,
      sellerId: product.sellerId,
      sellerName: seller ? seller.name : "",
      shopName: seller ? seller.shopName : "",
      listingStatus: product.listingStatus,
      updatedAt: product.updatedAt
    };
  }

  function findUser(db, id) {
    return db.users.find((user) => user.id === id) || null;
  }

  function findProduct(db, id) {
    return db.products.find((product) => product.id === id) || null;
  }

  function findOrder(db, id) {
    return db.orders.find((order) => order.id === id) || null;
  }

  function sessionActor(db, userId, activeRole) {
    const user = findUser(db, userId);
    if (!user || user.suspended) return null;
    const role = user.roles.includes(activeRole) ? activeRole : user.roles[0];
    return Object.assign({}, user, { role });
  }

  function attention(order, now) {
    const moment = new Date(now).getTime();
    const flags = [];
    if (order.status === "waiting_payment" && moment - Date.parse(order.createdAt) > WEEK_MS) {
      flags.push("Payment still waiting");
    }
    if (order.status === "shipped") {
      const shipped = (order.timeline || []).find((entry) => entry.status === "shipped");
      const at = shipped ? shipped.at : order.updatedAt;
      if (moment - Date.parse(at) > WEEK_MS) flags.push("Shipped and not closed");
    }
    return {
      incomplete: order.status !== "completed",
      abnormal: flags.length > 0,
      flags
    };
  }

  function orderView(db, order, now) {
    const buyer = findUser(db, order.buyerId);
    const seller = findUser(db, order.sellerId);
    const mark = attention(order, now);
    return {
      id: order.id,
      buyer: buyer
        ? { id: buyer.id, name: buyer.name, email: buyer.email, address: buyer.address || null }
        : { id: order.buyerId, name: "Buyer", email: "", address: null },
      seller: seller
        ? { id: seller.id, name: seller.name, email: seller.email, shopName: seller.shopName || "" }
        : { id: order.sellerId, name: "Seller", email: "", shopName: "" },
      items: order.items.map((item) => Object.assign({}, item)),
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      prepared: !!order.prepared,
      shipmentNote: order.shipmentNote || "",
      address: order.address,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      completedAt: order.completedAt || null,
      timeline: order.timeline.map((entry) => Object.assign({}, entry)),
      incomplete: mark.incomplete,
      abnormal: mark.abnormal,
      flags: mark.flags
    };
  }

  function log(db, entry) {
    db.activity.unshift(Object.assign({ id: "a" + db.activitySeq++ }, entry));
  }

  function timeline(order, status, actor, note) {
    order.timeline.push({
      status,
      at: order.updatedAt,
      actorId: actor.id,
      actorName: actor.name,
      note
    });
  }

  function createSeed(nowInput) {
    const now = nowInput ? new Date(nowInput) : new Date();
    const at = (days) => daysBefore(now, days);
    const users = [
      {
        id: "u_wei",
        name: "Wei Lin",
        email: "wei.lin@immba.test",
        password: DEMO_PASSWORD,
        roles: ["admin"],
        shopName: null,
        sellerStatus: null,
        suspended: false,
        address: null,
        cart: [],
        createdAt: at(70)
      },
      {
        id: "u_mei",
        name: "Mei Huang",
        email: "mei.huang@immba.test",
        password: DEMO_PASSWORD,
        roles: ["seller"],
        shopName: "Mei’s Used Books",
        sellerStatus: "approved",
        suspended: false,
        address: { recipient: "Mei Huang", line1: "LM Building, Fu Jen", city: "New Taipei", region: "Taiwan", postal: "242", country: "Taiwan" },
        cart: [],
        createdAt: at(60)
      },
      {
        id: "u_arun",
        name: "Arun Shah",
        email: "arun.shah@immba.test",
        password: DEMO_PASSWORD,
        roles: ["seller"],
        shopName: "Arun Course Packs",
        sellerStatus: "approved",
        suspended: false,
        address: { recipient: "Arun Shah", line1: "Library 2F", city: "New Taipei", region: "Taiwan", postal: "242", country: "Taiwan" },
        cart: [],
        createdAt: at(50)
      },
      {
        id: "u_elena",
        name: "Elena Chen",
        email: "elena.chen@immba.test",
        password: DEMO_PASSWORD,
        roles: ["buyer"],
        shopName: null,
        sellerStatus: null,
        suspended: false,
        address: { recipient: "Elena Chen", line1: "14 Songshan Road", city: "Taipei", region: "Taipei", postal: "105", country: "Taiwan" },
        cart: [],
        createdAt: at(40)
      },
      {
        id: "u_chris",
        name: "Chris Tan",
        email: "chris.tan@immba.test",
        password: DEMO_PASSWORD,
        roles: ["buyer"],
        shopName: null,
        sellerStatus: null,
        suspended: false,
        address: { recipient: "Chris Tan", line1: "88 Zhongzheng Road", city: "New Taipei", region: "Taiwan", postal: "242", country: "Taiwan" },
        cart: [],
        createdAt: at(36)
      },
      {
        id: "u_sam",
        name: "Sam Ortiz",
        email: "sam.ortiz@immba.test",
        password: DEMO_PASSWORD,
        roles: ["seller"],
        shopName: "Sam’s Notes",
        sellerStatus: "pending",
        suspended: false,
        address: null,
        cart: [],
        createdAt: at(12)
      },
      {
        id: "u_alex",
        name: "Alex Lin",
        email: "alex.lin@immba.test",
        password: DEMO_PASSWORD,
        roles: ["buyer", "seller"],
        shopName: "Alex’s Desk",
        sellerStatus: "approved",
        suspended: false,
        address: { recipient: "Alex Lin", line1: "Dorm 3, Fu Jen", city: "New Taipei", region: "Taiwan", postal: "242", country: "Taiwan" },
        cart: [],
        createdAt: at(20)
      }
    ];

    function book(id, sellerId, name, category, description, price, quantity, purchased, status, accent, updatedDays) {
      return {
        id,
        name,
        category,
        description,
        price,
        quantity,
        purchased,
        image: cover(name.en.split(" ").slice(0, 3).join(" "), accent),
        sellerId,
        listingStatus: status,
        updatedAt: at(updatedDays)
      };
    }

    const products = [
      book("p_strategy", "u_mei", { en: "International Business Strategy", zh: "國際企業策略" }, "textbooks", { en: "Used hardcover from the strategy module. Light notes in pencil on the first three chapters.", zh: "策略模組用過的精裝本，前三章有鉛筆註記。" }, 450, 4, 1, "active", "#4c2a6a", 20),
      book("p_accounting", "u_mei", { en: "Financial Accounting", zh: "財務會計" }, "textbooks", { en: "Eighth edition, no writing inside. The companion code has been used.", zh: "第八版，內頁無筆跡。隨書序號已使用。" }, 380, 6, 0, "active", "#7a1f33", 18),
      book("p_calc", "u_mei", { en: "Casio fx-991ES", zh: "Casio fx-991ES 計算機" }, "electronics", { en: "Scientific calculator allowed in imMBA exams. Battery replaced this term.", zh: "imMBA 考試可使用的工程計算機，本學期已換電池。" }, 650, 2, 1, "active", "#1f4d3a", 8),
      book("p_binding", "u_mei", { en: "Thesis binding kit", zh: "論文裝訂組" }, "stationery", { en: "Covers, spine tape, and a format checklist printout for the library thesis.", zh: "封面、書背膠帶，以及圖書館論文格式檢核表影印。" }, 120, 8, 1, "active", "#8a5a12", 15),
      book("p_cases", "u_mei", { en: "Strategy case pack", zh: "策略個案講義" }, "packs", { en: "Hidden from the floor until Mei lists it again.", zh: "Mei 再次上架前，市集上看不到。" }, 200, 5, 0, "hidden", "#3d3a48", 6),
      book("p_analytics", "u_arun", { en: "Data Analytics course pack", zh: "資料分析課程講義" }, "packs", { en: "Printed cases and dataset notes from the analytics spotlight course.", zh: "資料分析專題的個案與資料集筆記，紙本。" }, 220, 10, 2, "active", "#243e73", 11),
      book("p_adpd", "u_arun", { en: "AI-ADPD workshop notes", zh: "AI 輔助數位產品開發筆記" }, "notes", { en: "Second-hand studio notes for product framing and the marketplace build.", zh: "產品定位與市集作業的二手工坊筆記。" }, 160, 7, 1, "active", "#b71939", 9),
      book("p_english", "u_arun", { en: "English for Management readings", zh: "管理專業英語讀本" }, "notes", { en: "CEFR B2 discussion packet. None are left on the shelf.", zh: "CEFR B2 討論講義。架上已無存貨。" }, 90, 0, 0, "active", "#5c4a78", 4),
      book("p_briefs", "u_arun", { en: "Partner school briefs", zh: "合作校簡介" }, "packs", { en: "UM-Flint, KEDGE, and IQS overview sheets, already highlighted.", zh: "UM-Flint、KEDGE、IQS 說明，已有畫線。" }, 40, 12, 2, "active", "#0e6b62", 14),
      book("p_alex", "u_alex", { en: "Operations management summary", zh: "營運管理整理" }, "notes", { en: "Alex’s own chapter summary, 28 pages, clean print.", zh: "Alex 自己整理的章節摘要，28 頁，乾淨列印。" }, 80, 3, 0, "active", "#2f1844", 3)
    ];

    function item(productId, quantity) {
      const product = products.find((entry) => entry.id === productId);
      return {
        productId,
        name: product.name,
        category: product.category,
        image: product.image,
        price: product.price,
        quantity
      };
    }

    function makeOrder(id, buyerId, sellerId, productId, quantity, status, createdDays, updatedDays, extra) {
      const buyer = users.find((user) => user.id === buyerId);
      const line = item(productId, quantity);
      const createdAt = at(createdDays);
      const updatedAt = at(updatedDays);
      const order = {
        id,
        buyerId,
        sellerId,
        items: [line],
        total: line.price * quantity,
        status,
        paymentStatus: status === "waiting_payment" ? "waiting" : "received",
        prepared: !!(extra && extra.prepared),
        shipmentNote: (extra && extra.shipmentNote) || "",
        address: Object.assign({}, buyer.address),
        createdAt,
        updatedAt,
        completedAt: status === "completed" ? updatedAt : null,
        timeline: []
      };
      const actorBuyer = { id: buyer.id, name: buyer.name };
      const seller = users.find((user) => user.id === sellerId);
      const actorSeller = { id: seller.id, name: seller.name };
      order.timeline.push({ status: "waiting_payment", at: createdAt, actorId: buyer.id, actorName: buyer.name, note: "Order submitted. Waiting for payment confirmation." });
      if (status !== "waiting_payment") {
        order.timeline.push({ status: "payment_confirmed", at: at(createdDays - 0.4), actorId: seller.id, actorName: seller.name, note: "Payment received." });
      }
      if (["ready_to_ship", "shipped", "completed"].includes(status)) {
        order.timeline.push({ status: "ready_to_ship", at: at(Math.max(updatedDays, createdDays - 0.8)), actorId: seller.id, actorName: seller.name, note: "Moved to ready to ship." });
      }
      if (status === "shipped" || status === "completed") {
        order.timeline.push({ status: "shipped", at: updatedAt, actorId: seller.id, actorName: seller.name, note: order.shipmentNote || "Shipment confirmed." });
      }
      if (status === "completed") {
        order.timeline.push({ status: "completed", at: updatedAt, actorId: buyer.id, actorName: buyer.name, note: "Buyer confirmed the books arrived." });
      }
      return order;
    }

    const orders = [
      makeOrder("MK-18420", "u_elena", "u_mei", "p_strategy", 1, "waiting_payment", 0.2, 0.2),
      makeOrder("MK-18433", "u_elena", "u_arun", "p_analytics", 1, "payment_confirmed", 1, 0.8),
      makeOrder("MK-18441", "u_chris", "u_mei", "p_calc", 1, "ready_to_ship", 2, 1.2, { prepared: false }),
      makeOrder("MK-18455", "u_chris", "u_arun", "p_adpd", 1, "shipped", 4, 3, { prepared: true, shipmentNote: "Left with the program office." }),
      makeOrder("MK-18302", "u_elena", "u_arun", "p_briefs", 2, "completed", 12, 9, { prepared: true, shipmentNote: "Handed over after class." }),
      makeOrder("MK-18140", "u_elena", "u_mei", "p_binding", 1, "shipped", 16, 15, { prepared: true, shipmentNote: "Campus mail." }),
      makeOrder("MK-18110", "u_chris", "u_arun", "p_analytics", 1, "waiting_payment", 16, 16)
    ];

    const activity = [
      { id: "a7", at: at(0.2), type: "order_placed", actorName: "Elena Chen", orderId: "MK-18420", message: { en: "Elena Chen placed order MK-18420 with Mei’s Used Books.", zh: "Elena Chen 向 Mei’s Used Books 送出訂單 MK-18420。" } },
      { id: "a6", at: at(1.2), type: "order_status", actorName: "Mei Huang", orderId: "MK-18441", message: { en: "Mei Huang moved order MK-18441 to Ready to ship.", zh: "Mei Huang 將訂單 MK-18441 改為待出貨。" } },
      { id: "a5", at: at(12), type: "seller_applied", actorName: "Sam Ortiz", message: { en: "Sam Ortiz applied to sell as Sam’s Notes and is waiting for approval.", zh: "Sam Ortiz 以 Sam’s Notes 申請成為賣家，等待核准。" } },
      { id: "a4", at: at(3), type: "order_shipped", actorName: "Arun Shah", orderId: "MK-18455", message: { en: "Arun Shah shipped order MK-18455.", zh: "Arun Shah 已出貨訂單 MK-18455。" } },
      { id: "a3", at: at(9), type: "order_completed", actorName: "Elena Chen", orderId: "MK-18302", message: { en: "Elena Chen completed order MK-18302.", zh: "Elena Chen 完成訂單 MK-18302。" } },
      { id: "a2", at: at(15), type: "order_shipped", actorName: "Mei Huang", orderId: "MK-18140", message: { en: "Mei Huang shipped order MK-18140. The buyer has not closed it.", zh: "Mei Huang 已出貨 MK-18140，買家尚未結案。" } },
      { id: "a1", at: at(16), type: "order_placed", actorName: "Chris Tan", orderId: "MK-18110", message: { en: "Chris Tan placed order MK-18110 with Arun Course Packs. Payment is still waiting.", zh: "Chris Tan 向 Arun Course Packs 送出 MK-18110，付款仍待確認。" } }
    ];

    return {
      version: 1,
      orderSeq: 18455,
      productSeq: 20,
      activitySeq: 8,
      users,
      products,
      orders,
      activity
    };
  }

  function publicProducts(db, filters) {
    const query = (filters && filters.q ? String(filters.q) : "").trim().toLowerCase();
    const category = filters && filters.category ? filters.category : "";
    return db.products
      .filter((product) => product.listingStatus === "active")
      .filter((product) => !category || product.category === category)
      .filter((product) => {
        if (!query) return true;
        const seller = findUser(db, product.sellerId);
        const blob = [product.name.en, product.name.zh, product.description.en, product.description.zh, seller && seller.shopName, seller && seller.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(query);
      })
      .map((product) => productView(product, findUser(db, product.sellerId)));
  }

  function requireUser(db, userId, activeRole) {
    const actor = sessionActor(db, userId, activeRole);
    if (!actor) return { ok: false, error: "sign_in" };
    return { ok: true, actor };
  }

  function register(db, input, now) {
    const name = String(input.name || "").trim();
    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");
    if (input.role === "admin") return { ok: false, error: "admin_only" };
    const role = input.role === "seller" ? "seller" : "buyer";
    const shopName = String(input.shopName || "").trim();
    if (name.length < 2) return { ok: false, error: "name" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "email" };
    if (password.length < 4) return { ok: false, error: "password" };
    if (db.users.some((user) => user.email === email)) return { ok: false, error: "taken" };
    if (role === "seller" && shopName.length < 2) return { ok: false, error: "shop" };
    const user = {
      id: "u_" + Date.now().toString(36),
      name,
      email,
      password,
      roles: role === "seller" ? ["buyer", "seller"] : ["buyer"],
      shopName: role === "seller" ? shopName : null,
      sellerStatus: role === "seller" ? "pending" : null,
      suspended: false,
      address: null,
      cart: [],
      createdAt: iso(now || Date.now())
    };
    db.users.push(user);
    if (role === "seller") {
      log(db, {
        at: user.createdAt,
        type: "seller_applied",
        actorName: user.name,
        message: {
          en: name + " applied to sell as " + shopName + " and is waiting for approval.",
          zh: name + " 以 " + shopName + " 申請成為賣家，等待核准。"
        }
      });
    }
    return { ok: true, user: userPublic(user), activeRole: role };
  }

  function login(db, email, password) {
    const user = db.users.find((entry) => entry.email === String(email || "").trim().toLowerCase());
    if (!user || user.password !== password) return { ok: false, error: "credentials" };
    if (user.suspended) return { ok: false, error: "suspended" };
    return { ok: true, user: userPublic(user), activeRole: user.roles[0] };
  }

  function addToCart(db, userId, activeRole, productId, quantity) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "buyer") return { ok: false, error: "buyer_only" };
    const product = findProduct(db, productId);
    if (!product || product.listingStatus !== "active") return { ok: false, error: "missing" };
    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty < 1) return { ok: false, error: "quantity" };
    if (qty > product.quantity) return { ok: false, error: "stock" };
    const user = findUser(db, userId);
    const line = user.cart.find((item) => item.productId === productId);
    if (line) line.quantity = qty;
    else user.cart.push({ productId, quantity: qty });
    return { ok: true, cart: cartView(db, user) };
  }

  function setCartQuantity(db, userId, activeRole, productId, quantity) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "buyer") return { ok: false, error: "buyer_only" };
    const user = findUser(db, userId);
    const qty = Math.floor(Number(quantity));
    user.cart = user.cart.filter((item) => item.productId !== productId || qty > 0);
    if (qty > 0) {
      const product = findProduct(db, productId);
      if (!product) return { ok: false, error: "missing" };
      const capped = Math.min(qty, Math.max(product.quantity, 0));
      const line = user.cart.find((item) => item.productId === productId);
      if (line) line.quantity = capped;
      else if (capped > 0) user.cart.push({ productId, quantity: capped });
    }
    return { ok: true, cart: cartView(db, user) };
  }

  function cartView(db, user) {
    const items = [];
    user.cart.forEach((line) => {
      const product = findProduct(db, line.productId);
      if (!product) return;
      const seller = findUser(db, product.sellerId);
      const purchasable = product.listingStatus === "active" && product.quantity > 0;
      const quantity = Math.min(line.quantity, product.quantity);
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        available: product.quantity,
        purchasable,
        shopName: seller ? seller.shopName : "",
        sellerId: product.sellerId,
        image: product.image,
        lineTotal: product.price * quantity
      });
    });
    const subtotal = items.reduce((sum, item) => sum + (item.purchasable ? item.lineTotal : 0), 0);
    return { items, subtotal };
  }

  function placeOrders(db, userId, activeRole, input, now) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "buyer") return { ok: false, error: "buyer_only" };
    if (!input || input.quantitiesConfirmed !== true) return { ok: false, error: "confirm" };
    const address = input.address || {};
    const recipient = String(address.recipient || "").trim();
    const line1 = String(address.line1 || "").trim();
    const city = String(address.city || "").trim();
    if (!recipient || !line1 || !city) return { ok: false, error: "address" };
    const user = findUser(db, userId);
    const requested = Array.isArray(input.items) && input.items.length ? input.items : user.cart;
    if (!requested.length) return { ok: false, error: "empty" };
    const groups = new Map();
    for (const line of requested) {
      const product = findProduct(db, line.productId);
      const qty = Math.floor(Number(line.quantity));
      if (!product || product.listingStatus !== "active") return { ok: false, error: "missing" };
      if (!Number.isFinite(qty) || qty < 1) return { ok: false, error: "quantity" };
      if (qty > product.quantity) return { ok: false, error: "stock" };
      if (!groups.has(product.sellerId)) groups.set(product.sellerId, []);
      groups.get(product.sellerId).push({ product, qty });
    }
    const moment = iso(now || Date.now());
    const created = [];
    groups.forEach((lines, sellerId) => {
      const seller = findUser(db, sellerId);
      db.orderSeq += 1;
      const items = lines.map(({ product, qty }) => {
        product.quantity -= qty;
        product.purchased = (product.purchased || 0) + qty;
        product.updatedAt = moment;
        return {
          productId: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          price: product.price,
          quantity: qty
        };
      });
      const order = {
        id: "MK-" + db.orderSeq,
        buyerId: user.id,
        sellerId,
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: "waiting_payment",
        paymentStatus: "waiting",
        prepared: false,
        shipmentNote: "",
        address: {
          recipient,
          line1,
          city,
          region: String(address.region || "").trim(),
          postal: String(address.postal || "").trim(),
          country: String(address.country || "Taiwan").trim()
        },
        createdAt: moment,
        updatedAt: moment,
        completedAt: null,
        timeline: []
      };
      timeline(order, "waiting_payment", user, "Order submitted. Waiting for payment confirmation.");
      db.orders.unshift(order);
      created.push(order);
      log(db, {
        at: moment,
        type: "order_placed",
        actorName: user.name,
        orderId: order.id,
        message: {
          en: user.name + " placed order " + order.id + " with " + (seller.shopName || seller.name) + ".",
          zh: user.name + " 向 " + (seller.shopName || seller.name) + " 送出訂單 " + order.id + "。"
        }
      });
    });
    const bought = new Set(requested.map((line) => line.productId));
    user.cart = user.cart.filter((line) => !bought.has(line.productId));
    user.address = created[0].address;
    return { ok: true, orders: created.map((order) => orderView(db, order, now || Date.now())) };
  }

  function advance(db, userId, activeRole, orderId, action, note, now) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "seller") return { ok: false, error: "seller_only" };
    if (gate.actor.sellerStatus !== "approved") return { ok: false, error: "not_approved" };
    const order = findOrder(db, orderId);
    if (!order || order.sellerId !== gate.actor.id) return { ok: false, error: "missing" };
    const moment = iso(now || Date.now());
    const seller = gate.actor;
    if (action === "payment_received") {
      if (order.status !== "waiting_payment") return { ok: false, error: "step" };
      order.status = "payment_confirmed";
      order.paymentStatus = "received";
      order.updatedAt = moment;
      timeline(order, "payment_confirmed", seller, "Payment received.");
    } else if (action === "ready_to_ship") {
      if (order.status !== "payment_confirmed") return { ok: false, error: "step" };
      order.status = "ready_to_ship";
      order.updatedAt = moment;
      timeline(order, "ready_to_ship", seller, "Moved to ready to ship.");
    } else if (action === "prepare") {
      if (order.status !== "ready_to_ship" || order.prepared) return { ok: false, error: "step" };
      order.prepared = true;
      order.updatedAt = moment;
    } else if (action === "confirm_shipment") {
      if (order.status !== "ready_to_ship" || !order.prepared) return { ok: false, error: "step" };
      order.status = "shipped";
      order.shipmentNote = String(note || "").trim();
      order.updatedAt = moment;
      timeline(order, "shipped", seller, order.shipmentNote || "Shipment confirmed.");
    } else {
      return { ok: false, error: "step" };
    }
    log(db, {
      at: moment,
      type: action === "confirm_shipment" ? "order_shipped" : "order_status",
      actorName: seller.name,
      orderId: order.id,
      message: {
        en: seller.name + " updated order " + order.id + " (" + action.replaceAll("_", " ") + ").",
        zh: seller.name + " 更新了訂單 " + order.id + "。"
      }
    });
    return { ok: true, order: orderView(db, order, now || Date.now()) };
  }

  function completeOrder(db, userId, activeRole, orderId, now) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "buyer") return { ok: false, error: "buyer_only" };
    const order = findOrder(db, orderId);
    if (!order || order.buyerId !== gate.actor.id) return { ok: false, error: "missing" };
    if (order.status !== "shipped") return { ok: false, error: "step" };
    const moment = iso(now || Date.now());
    order.status = "completed";
    order.completedAt = moment;
    order.updatedAt = moment;
    timeline(order, "completed", gate.actor, "Buyer confirmed the books arrived.");
    log(db, {
      at: moment,
      type: "order_completed",
      actorName: gate.actor.name,
      orderId: order.id,
      message: {
        en: gate.actor.name + " completed order " + order.id + ".",
        zh: gate.actor.name + " 完成訂單 " + order.id + "。"
      }
    });
    return { ok: true, order: orderView(db, order, now || Date.now()) };
  }

  function sellerProducts(db, userId, activeRole) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "seller") return { ok: false, error: "seller_only" };
    const products = db.products
      .filter((product) => product.sellerId === gate.actor.id && product.listingStatus !== "removed")
      .map((product) => productView(product, gate.actor));
    return { ok: true, products, sellerStatus: gate.actor.sellerStatus, shopName: gate.actor.shopName };
  }

  function saveProduct(db, userId, activeRole, input, productId, now) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "seller") return { ok: false, error: "seller_only" };
    if (gate.actor.sellerStatus !== "approved") return { ok: false, error: "not_approved" };
    const name = String(input.name || "").trim();
    const description = String(input.description || "").trim();
    const category = CATEGORIES.includes(input.category) ? input.category : "";
    const price = Math.round(Number(input.price));
    const quantity = Math.floor(Number(input.quantity));
    const listingStatus = ["active", "hidden"].includes(input.listingStatus) ? input.listingStatus : "active";
    if (name.length < 2) return { ok: false, error: "name" };
    if (!category) return { ok: false, error: "category" };
    if (description.length < 4) return { ok: false, error: "description" };
    if (!Number.isFinite(price) || price < 0) return { ok: false, error: "price" };
    if (!Number.isFinite(quantity) || quantity < 0) return { ok: false, error: "quantity" };
    let image = String(input.image || "");
    if (image && image.length > 1_900_000) return { ok: false, error: "image" };
    const moment = iso(now || Date.now());
    let product = productId ? findProduct(db, productId) : null;
    if (productId && (!product || product.sellerId !== gate.actor.id || product.listingStatus === "removed")) {
      return { ok: false, error: "missing" };
    }
    if (!product) {
      db.productSeq += 1;
      product = {
        id: "p" + db.productSeq,
        sellerId: gate.actor.id,
        purchased: 0,
        image: image || cover(name, "#4c2a6a")
      };
      db.products.unshift(product);
    } else if (image) {
      product.image = image;
    }
    product.name = { en: name, zh: name };
    product.category = category;
    product.description = { en: description, zh: description };
    product.price = price;
    product.quantity = quantity;
    product.listingStatus = listingStatus;
    product.updatedAt = moment;
    return { ok: true, product: productView(product, gate.actor) };
  }

  function setQuantity(db, userId, activeRole, productId, quantity, now) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "seller" || gate.actor.sellerStatus !== "approved") return { ok: false, error: "not_approved" };
    const product = findProduct(db, productId);
    if (!product || product.sellerId !== gate.actor.id || product.listingStatus === "removed") return { ok: false, error: "missing" };
    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty < 0) return { ok: false, error: "quantity" };
    product.quantity = qty;
    product.updatedAt = iso(now || Date.now());
    return { ok: true, product: productView(product, gate.actor) };
  }

  function setVisibility(db, userId, activeRole, productId, action, now) {
    const gate = requireUser(db, userId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "seller" || gate.actor.sellerStatus !== "approved") return { ok: false, error: "not_approved" };
    const product = findProduct(db, productId);
    if (!product || product.sellerId !== gate.actor.id) return { ok: false, error: "missing" };
    if (action === "hide" && product.listingStatus === "active") product.listingStatus = "hidden";
    else if (action === "unhide" && product.listingStatus === "hidden") product.listingStatus = "active";
    else if (action === "remove" && product.listingStatus !== "removed") product.listingStatus = "removed";
    else return { ok: false, error: "step" };
    product.updatedAt = iso(now || Date.now());
    if (action === "hide") {
      log(db, {
        at: product.updatedAt,
        type: "product_hidden",
        actorName: gate.actor.name,
        message: { en: gate.actor.name + " hid " + product.name.en + ".", zh: gate.actor.name + " 隱藏了 " + product.name.zh + "。" }
      });
    }
    return { ok: true, product: productView(product, gate.actor) };
  }

  function inQueue(order, queue) {
    if (queue === "payments") return order.status === "waiting_payment";
    if (queue === "ship") return order.status === "payment_confirmed" || order.status === "ready_to_ship";
    return order.status === "waiting_payment" || order.status === "payment_confirmed" || order.status === "ready_to_ship";
  }

  function salesSummary(db, sellerId, now) {
    const moment = new Date(now || Date.now());
    const month = moment.getUTCFullYear() + "-" + String(moment.getUTCMonth() + 1).padStart(2, "0");
    const mine = db.orders.filter((order) => order.sellerId === sellerId);
    const completed = mine.filter((order) => order.status === "completed");
    const months = new Map();
    completed.forEach((order) => {
      const key = (order.completedAt || order.updatedAt).slice(0, 7);
      if (!months.has(key)) months.set(key, { month: key, revenue: 0, completedOrders: 0 });
      const bucket = months.get(key);
      bucket.revenue += order.total;
      bucket.completedOrders += 1;
    });
    const monthList = Array.from(months.values()).sort((a, b) => b.month.localeCompare(a.month));
    const pending = mine.filter((order) => order.status === "waiting_payment");
    return {
      month,
      monthLabel: moment.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
      monthlyRevenue: completed.filter((order) => (order.completedAt || "").slice(0, 7) === month).reduce((sum, order) => sum + order.total, 0),
      months: monthList,
      completedOrders: completed.length,
      pendingPayments: pending.length,
      pendingPaymentAmount: pending.reduce((sum, order) => sum + order.total, 0),
      waitingShipment: mine.filter((order) => order.status === "ready_to_ship").length,
      completedTotal: completed.reduce((sum, order) => sum + order.total, 0)
    };
  }

  function csvCell(value) {
    const text = value == null ? "" : String(value);
    if (/[",\n]/.test(text)) return '"' + text.replaceAll('"', '""') + '"';
    return text;
  }

  function salesCsv(db, sellerId) {
    const rows = [[
      "Order ID",
      "Buyer",
      "Buyer email",
      "Products",
      "Total amount",
      "Payment status",
      "Transaction status",
      "Order date",
      "Completed at"
    ]];
    db.orders
      .filter((order) => order.sellerId === sellerId)
      .forEach((order) => {
        const buyer = findUser(db, order.buyerId);
        const products = order.items.map((item) => (item.name.en || item.name) + " x " + item.quantity).join("; ");
        rows.push([
          order.id,
          buyer ? buyer.name : "",
          buyer ? buyer.email : "",
          products,
          order.total.toFixed(2),
          order.paymentStatus,
          order.status,
          order.createdAt,
          order.completedAt || ""
        ]);
      });
    return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
  }

  function adminOrders(db, filters, now) {
    const query = String((filters && filters.q) || "").trim().toLowerCase();
    const status = filters && filters.status;
    const attentionFilter = filters && filters.attention;
    const from = filters && filters.from;
    const to = filters && filters.to;
    const moment = now || Date.now();
    const orders = db.orders
      .map((order) => orderView(db, order, moment))
      .filter((order) => !status || order.status === status)
      .filter((order) => !query || order.id.toLowerCase().includes(query))
      .filter((order) => {
        const day = order.createdAt.slice(0, 10);
        if (from && day < from) return false;
        if (to && day > to) return false;
        return true;
      })
      .filter((order) => {
        if (attentionFilter === "incomplete") return order.incomplete;
        if (attentionFilter === "abnormal") return order.abnormal;
        return true;
      });
    const counts = {};
    STATUSES.forEach((key) => {
      counts[key] = db.orders.filter((order) => order.status === key).length;
    });
    const all = db.orders.map((order) => orderView(db, order, moment));
    return {
      orders,
      counts,
      volume: db.orders.reduce((sum, order) => sum + order.total, 0),
      incompleteCount: all.filter((order) => order.incomplete).length,
      abnormalCount: all.filter((order) => order.abnormal).length,
      monitorOnly: true,
      retained: true
    };
  }

  function adminUsers(db, actorId, activeRole, targetId, action, now) {
    const gate = requireUser(db, actorId, activeRole);
    if (!gate.ok) return gate;
    if (gate.actor.role !== "admin") return { ok: false, error: "admin_only" };
    if (!targetId) {
      return { ok: true, users: db.users.map(userPublic) };
    }
    const target = findUser(db, targetId);
    if (!target || target.roles.includes("admin")) return { ok: false, error: "locked" };
    const moment = iso(now || Date.now());
    if (action === "approve" && target.sellerStatus === "pending") {
      target.sellerStatus = "approved";
      if (!target.roles.includes("seller")) target.roles.push("seller");
      log(db, {
        at: moment,
        type: "seller_approved",
        actorName: gate.actor.name,
        message: { en: gate.actor.name + " approved " + target.shopName + ".", zh: gate.actor.name + " 核准了 " + target.shopName + "。" }
      });
    } else if (action === "suspend" && !target.suspended) {
      target.suspended = true;
    } else if (action === "restore" && target.suspended) {
      target.suspended = false;
    } else {
      return { ok: false, error: "step" };
    }
    return { ok: true, user: userPublic(target) };
  }

  return {
    DEMO_PASSWORD,
    WEEK_MS,
    LOW_STOCK,
    STATUSES,
    CATEGORIES,
    createSeed,
    stockStatus,
    currentInventory,
    attention,
    publicProducts,
    productView,
    orderView,
    userPublic,
    findUser,
    findProduct,
    findOrder,
    sessionActor,
    register,
    login,
    addToCart,
    setCartQuantity,
    cartView,
    placeOrders,
    advance,
    completeOrder,
    sellerProducts,
    saveProduct,
    setQuantity,
    setVisibility,
    inQueue,
    salesSummary,
    salesCsv,
    adminOrders,
    adminUsers
  };
});
