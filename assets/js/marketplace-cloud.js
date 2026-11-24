/* Shared marketplace store. Listings, prices, carts, and orders live in Supabase. */
(function () {
  function headers() {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    };
  }

  async function rpc(name, body) {
    const response = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body || {})
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return { ok: false, error: "cloud" };
    }
    return data;
  }

  window.MarketCloud = {
    load(token) {
      return rpc("market_load", { p_token: token || null });
    },
    login(email, password) {
      return rpc("market_login", { p_email: email, p_password: password });
    },
    register(input) {
      return rpc("market_register", { p_input: input });
    },
    applySeller(token, shopName) {
      return rpc("market_apply_seller", { p_token: token || "", p_shop: shopName || "" });
    },
    logout(token) {
      return rpc("market_logout", { p_token: token || "" });
    },
    save(token, state) {
      return rpc("market_save", { p_token: token, p_state: state });
    },
    reset(token) {
      return rpc("market_reset", { p_token: token || "" });
    },
    adminCsv(token) {
      return rpc("market_admin_csv", { p_token: token || "" });
    },
    removeUser(token, userId) {
      return rpc("market_admin_remove_user", { p_token: token || "", p_user_id: userId || "" });
    },
    install(state) {
      return rpc("market_install", { p_state: state });
    },
    enterSuper(accessToken) {
      return fetch(SUPABASE_URL + "/rest/v1/rpc/market_enter_super", {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json"
        },
        body: "{}"
      }).then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) return { ok: false, error: "cloud" };
        return data;
      });
    }
  };
})();
