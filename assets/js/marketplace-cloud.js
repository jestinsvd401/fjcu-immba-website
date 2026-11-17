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
    logout(token) {
      return rpc("market_logout", { p_token: token || "" });
    },
    save(token, state) {
      return rpc("market_save", { p_token: token, p_state: state });
    },
    reset(token) {
      return rpc("market_reset", { p_token: token || "" });
    },
    install(state) {
      return rpc("market_install", { p_state: state });
    }
  };
})();
