// Unit Purchase Calculator — background service worker
// Sole job: fetch live prices from Yahoo Finance on the popup's behalf to
// avoid CORS friction. Yahoo's chart endpoint is unauthenticated.

const ENDPOINTS = [
  "https://query1.finance.yahoo.com/v8/finance/chart/",
  "https://query2.finance.yahoo.com/v8/finance/chart/"
];

async function fetchQuote(symbol) {
  const params = "?interval=1m&range=1d";
  let lastErr;
  for (const base of ENDPOINTS) {
    try {
      const res = await fetch(base + encodeURIComponent(symbol) + params, {
        headers: { "User-Agent": "UnitPurchaseCalculator/0.1.0" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      if (!meta || typeof meta.regularMarketPrice !== "number") {
        throw new Error("No price in response");
      }
      return {
        symbol: meta.symbol || symbol,
        price: meta.regularMarketPrice,
        currency: meta.currency || "",
        exchange: meta.exchangeName || "",
        previousClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
        timestamp: meta.regularMarketTime
          ? meta.regularMarketTime * 1000
          : Date.now(),
        fetchedAt: Date.now()
      };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All endpoints failed");
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "fetch-quote" && typeof msg.symbol === "string") {
    fetchQuote(msg.symbol)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err.message || err) }));
    return true; // async
  }
});
