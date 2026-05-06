// Unit Purchase Calculator — popup logic

// `multiplier` is dollars-per-unit-per-point for the standard contract
// of the underlying index/instrument (e.g. NQ for ^NDX = $20/pt). Users
// trading micros (MNQ, MES, etc.) can override after the auto-set.
// `note` shows the contract this multiplier corresponds to.
const MARKETS = [
  { value: "^NDX",     label: "NAS100 (Nasdaq 100)", multiplier: 20,     note: "NQ futures · $20/pt" },
  { value: "^GSPC",    label: "S&P 500",             multiplier: 50,     note: "ES futures · $50/pt" },
  { value: "^DJI",     label: "Dow Jones",           multiplier: 5,      note: "YM futures · $5/pt" },
  { value: "^RUT",     label: "Russell 2000",        multiplier: 50,     note: "RTY futures · $50/pt" },
  { value: "^GDAXI",   label: "DAX",                 multiplier: 25,     note: "FDAX · €25/pt" },
  { value: "^FTSE",    label: "FTSE 100",            multiplier: 10,     note: "Z futures · £10/pt" },
  { value: "EURUSD=X", label: "EUR/USD",             multiplier: 100000, note: "Standard FX lot" },
  { value: "GBPUSD=X", label: "GBP/USD",             multiplier: 100000, note: "Standard FX lot" },
  { value: "JPY=X",    label: "USD/JPY",             multiplier: 1000,   note: "Standard FX lot, JPY pairs" },
  { value: "BTC-USD",  label: "Bitcoin (BTC-USD)",   multiplier: 1,      note: "1 coin = $1/pt" },
  { value: "ETH-USD",  label: "Ethereum (ETH-USD)",  multiplier: 1,      note: "1 coin = $1/pt" },
  { value: "GC=F",     label: "Gold futures",        multiplier: 100,    note: "GC · $100/pt" },
  { value: "SI=F",     label: "Silver futures",      multiplier: 5000,   note: "SI · $5000/pt" },
  { value: "CL=F",     label: "Crude oil futures",   multiplier: 1000,   note: "CL · $1000/pt" },
  { value: "AAPL",     label: "Apple (AAPL)",        multiplier: 1,      note: "1 share = $1/pt" },
  { value: "TSLA",     label: "Tesla (TSLA)",        multiplier: 1,      note: "1 share = $1/pt" },
  { value: "__custom", label: "Custom symbol…",      multiplier: 1,      note: "Set multiplier manually" }
];

const STORAGE_KEY = "upc-state-v1";
const REFRESH_MS = 60_000;

const IS_FULLSCREEN = new URLSearchParams(location.search).has("fullscreen");
if (IS_FULLSCREEN) document.body.classList.add("fullscreen");

const THEME_KEY = "upc-theme-v1";

const els = {
  themeBtn:       document.getElementById("theme-btn"),
  themeIconMoon:  document.getElementById("theme-icon-moon"),
  themeIconSun:   document.getElementById("theme-icon-sun"),
  expandBtn:      document.getElementById("expand-btn"),
  symbolSelect:   document.getElementById("symbol-select"),
  customRow:      document.getElementById("custom-row"),
  customSymbol:   document.getElementById("custom-symbol"),
  customApply:    document.getElementById("custom-apply"),
  refreshBtn:     document.getElementById("refresh-btn"),
  liveDot:        document.getElementById("live-dot"),
  liveStatus:     document.getElementById("live-status"),
  quoteLabel:     document.getElementById("quote-label"),
  quotePrice:     document.getElementById("quote-price"),
  quoteChange:    document.getElementById("quote-change"),
  quoteTime:      document.getElementById("quote-time"),
  useAsEntry:     document.getElementById("use-as-entry"),

  inBalance:      document.getElementById("in-balance"),
  inRisk:         document.getElementById("in-risk"),
  inMultiplier:   document.getElementById("in-multiplier"),
  inEntry:        document.getElementById("in-entry"),
  inStopDistance: document.getElementById("in-stop-distance"),
  inBrokerMargin: document.getElementById("in-broker-margin"),
  inUsedMargin:   document.getElementById("in-used-margin"),

  riskPct:        document.getElementById("risk-pct"),
  stopPriceHint:  document.getElementById("stop-price-hint"),
  multiplierAux:  document.getElementById("multiplier-aux"),
  entryAux:       document.getElementById("entry-aux"),
  brokerLeverage: document.getElementById("broker-leverage"),

  dUnits:         document.getElementById("d-units"),
  dLoss:          document.getElementById("d-loss"),
  dLossPct:       document.getElementById("d-loss-pct"),
  dNotional:      document.getElementById("d-notional"),
  dPosMargin:     document.getElementById("d-pos-margin"),
  dPosMarginPct:  document.getElementById("d-pos-margin-pct"),
  dFreeMargin:    document.getElementById("d-free-margin"),
  dFreeMarginPct: document.getElementById("d-free-margin-pct"),
  dRiskPct:       document.getElementById("d-risk-pct"),

  statusBar:      document.getElementById("status-bar"),
  statusText:     document.getElementById("status-text"),
  gaugeFill:      document.getElementById("gauge-fill"),
  gaugePct:       document.getElementById("gauge-pct"),
  checklist:      document.getElementById("checklist"),
  formulaBox:     document.getElementById("formula-box"),
  footerVersion:  document.getElementById("footer-version")
};

let currentQuote = null;
let refreshTimer = null;

// ───────── Formatting ─────────
function fmtMoney(n) {
  if (!isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n < 0 ? "-" : "") + "$" + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1000)      return (n < 0 ? "-" : "") + "$" + (abs / 1000).toFixed(1) + "K";
  return (n < 0 ? "-" : "") + "$" + Math.round(abs).toLocaleString("en-US");
}
function fmtMoneyFull(n) {
  if (!isFinite(n)) return "$0";
  return (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtNum(n, decimals = 2) {
  if (!isFinite(n)) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtPct(n, decimals = 2) {
  if (!isFinite(n)) return "—";
  return n.toFixed(decimals) + "%";
}
function fmtTime(ts) {
  if (!ts) return "never updated";
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60)   return `updated ${Math.round(diff)}s ago`;
  if (diff < 3600) return `updated ${Math.round(diff / 60)}m ago`;
  return `updated ${new Date(ts).toLocaleTimeString()}`;
}

// ───────── Calculation ─────────
function calc() {
  const balance      = num(els.inBalance.value);
  const riskAmt      = num(els.inRisk.value);
  const multiplier   = num(els.inMultiplier.value, 1);
  const entry        = num(els.inEntry.value);
  const stopDist     = num(els.inStopDistance.value);
  const brokerMargin = num(els.inBrokerMargin.value);
  const usedMargin   = num(els.inUsedMargin.value);

  const riskPct      = balance > 0 ? (riskAmt / balance) * 100 : 0;
  const valuePerUnit = stopDist * multiplier;
  const units        = valuePerUnit > 0 ? riskAmt / valuePerUnit : 0;
  const notional     = units * entry * multiplier;
  const posMargin    = notional * (brokerMargin / 100);
  const freeMargin   = balance - usedMargin - posMargin;
  const freePct      = balance > 0 ? (freeMargin / balance) * 100 : 0;
  const leverage     = brokerMargin > 0 ? 100 / brokerMargin : Infinity;
  const stopPrice    = entry > 0 && stopDist > 0 ? entry - stopDist : null;

  // Aux labels
  els.riskPct.textContent        = `= ${fmtPct(riskPct)} of balance`;
  els.stopPriceHint.textContent  = stopPrice != null
    ? `stop ≈ ${fmtNum(stopPrice, decimalsFor(entry))}`
    : "enter entry & distance";
  els.brokerLeverage.textContent = isFinite(leverage)
    ? `≈ ${leverage.toFixed(0)}:1 leverage`
    : "no leverage";

  // Result tiles — units is the headline output. Show it whenever
  // we have positive risk + distance + multiplier; otherwise show "—"
  // with a clear reason in the checklist below.
  const unitsValid = units > 0 && isFinite(units);
  els.dUnits.textContent         = unitsValid ? fmtNum(units, 2) : "—";
  els.dLoss.textContent          = fmtMoney(riskAmt);
  els.dLossPct.textContent       = `${fmtPct(riskPct)} of account`;
  els.dNotional.textContent      = fmtMoney(notional);
  els.dPosMargin.textContent     = fmtMoney(posMargin);
  els.dPosMarginPct.textContent  = `${fmtPct(brokerMargin, 1)} of notional`;
  els.dFreeMargin.textContent    = fmtMoney(freeMargin);
  els.dFreeMarginPct.textContent = `${fmtPct(freePct)} of balance`;
  els.dRiskPct.textContent       = fmtPct(riskPct);

  // Free-margin gauge
  const gaugeWidth = Math.max(0, Math.min(100, freePct));
  els.gaugeFill.style.width = gaugeWidth.toFixed(1) + "%";
  let gaugeColor = "var(--grad-gauge-safe)";
  if (freeMargin < 0)        gaugeColor = "var(--grad-gauge-danger)";
  else if (freePct < 25)     gaugeColor = "var(--grad-gauge-warn)";
  els.gaugeFill.style.background = gaugeColor;
  els.gaugePct.textContent = Math.round(freePct) + "%";

  // Checks
  const checks = [
    { pass: balance > 0,        text: balance > 0 ? "Account balance entered" : "Enter an account balance" },
    { pass: riskAmt > 0,        text: riskAmt > 0 ? `Risk amount set (${fmtMoneyFull(riskAmt)})` : "Enter a risk amount" },
    { pass: stopDist > 0,       text: stopDist > 0 ? `Stop loss distance ${fmtNum(stopDist, 2)} pts` : "Enter a stop loss distance > 0" },
    { pass: multiplier > 0,     text: multiplier > 0 ? `Multiplier $${fmtNum(multiplier, 2)}/pt` : "Enter a contract multiplier > 0" },
    { pass: riskPct <= 2,       text: riskPct <= 2 ? `Risk ${fmtPct(riskPct)} — within 1–2% sane range` : `Risk ${fmtPct(riskPct)} — over 2% is aggressive` },
    { pass: freeMargin >= 0,    text: freeMargin >= 0 ? `Free margin ${fmtMoney(freeMargin)} after this trade` : `Free margin ${fmtMoney(freeMargin)} — position exceeds available margin` },
    { pass: units > 0 && isFinite(units), text: units > 0 && isFinite(units) ? `Units ${fmtNum(units, 2)} sized correctly` : "Cannot size: check stop distance and multiplier" }
  ];
  els.checklist.innerHTML = checks.map(c =>
    `<div class="check-item ${c.pass ? "pass" : "fail"}">
       <div class="check-icon">${c.pass ? "✓" : "✗"}</div>
       <span class="check-text">${c.text}</span>
     </div>`
  ).join("");

  // Status bar
  const fail = checks.find(c => !c.pass);
  const warn = riskPct > 2 || freePct < 25;
  if (freeMargin < 0 || (fail && fail.text.startsWith("Free margin"))) {
    setStatus("danger", "Do not enter — free margin would go negative. Reduce units or risk.");
  } else if (fail) {
    setStatus("warn", fail.text);
  } else if (warn) {
    setStatus("warn", riskPct > 2
      ? `Risk above 2% — review before entering`
      : `Free margin under 25% — limited cushion for further trades`);
  } else {
    setStatus("safe", "Safe to enter — all checks passed");
  }

  // Formula breakdown
  els.formulaBox.innerHTML = [
    `<strong>Stop distance</strong> = ${fmtNum(stopDist, 2)} pts (entered)`,
    `<strong>Value per unit</strong> = ${fmtNum(stopDist, 2)} pts × $${fmtNum(multiplier, 2)}/pt = ${fmtMoneyFull(valuePerUnit)}`,
    `<strong>Units</strong> = ${fmtMoneyFull(riskAmt)} ÷ ${fmtMoneyFull(valuePerUnit)} = <span class="highlight">${unitsValid ? fmtNum(units, 2) : "—"} units</span>`,
    `<strong>Notional</strong> = ${fmtNum(units, 2)} × ${fmtNum(entry, 2)} × ${fmtNum(multiplier, 2)} = ${fmtMoneyFull(notional)}`,
    `<strong>Position margin</strong> = ${fmtMoneyFull(notional)} × ${fmtPct(brokerMargin, 1)} = ${fmtMoneyFull(posMargin)}`,
    `<strong>Free margin</strong> = ${fmtMoneyFull(balance)} − ${fmtMoneyFull(usedMargin)} − ${fmtMoneyFull(posMargin)} = <span class="highlight">${fmtMoneyFull(freeMargin)}</span>`
  ].join("<br>");

  saveState();
}

function setStatus(kind, text) {
  els.statusBar.className = "status-bar " + kind;
  els.statusText.textContent = text;
}

function num(v, fallback = 0) {
  const n = parseFloat(v);
  return isFinite(n) ? n : fallback;
}

// ───────── Quote handling ─────────
function setQuoteLabel(symbol, label) {
  els.quoteLabel.textContent = label ? `${label} · ${symbol}` : symbol;
}

function renderQuote() {
  if (!currentQuote) {
    els.quotePrice.textContent = "—";
    els.quoteChange.textContent = "—";
    els.quoteTime.textContent = "never updated";
    els.liveDot.classList.add("stale");
    els.liveStatus.textContent = "No data";
    return;
  }
  const q = currentQuote;
  els.quotePrice.textContent = fmtNum(q.price, decimalsFor(q.price));
  if (q.previousClose != null) {
    const change = q.price - q.previousClose;
    const pct = (change / q.previousClose) * 100;
    const arrow = change >= 0 ? "▲" : "▼";
    els.quoteChange.textContent = `${arrow} ${fmtNum(change, decimalsFor(q.price))} (${fmtPct(pct)})`;
    els.quoteChange.style.color = change >= 0 ? "var(--ink)" : "var(--accent)";
  } else {
    els.quoteChange.textContent = "—";
  }
  els.quoteTime.textContent = fmtTime(q.fetchedAt);
  els.liveDot.classList.remove("stale");
  els.liveStatus.textContent = "Live data";
}

function decimalsFor(price) {
  if (price >= 1000) return 2;
  if (price >= 10)   return 2;
  if (price >= 1)    return 4;
  return 6;
}

async function fetchQuote(symbol, label, { autoApplyEntry = false } = {}) {
  if (!symbol) return;
  els.liveStatus.textContent = "Fetching…";
  setQuoteLabel(symbol, label);
  try {
    const resp = await chrome.runtime.sendMessage({ type: "fetch-quote", symbol });
    if (resp && resp.ok) {
      currentQuote = resp.data;
      renderQuote();
      if (autoApplyEntry && isFinite(currentQuote.price)) {
        els.inEntry.value = currentQuote.price.toString();
        calc();
      }
    } else {
      currentQuote = null;
      renderQuote();
      els.liveStatus.textContent = `Error: ${resp?.error || "fetch failed"}`;
    }
  } catch (e) {
    currentQuote = null;
    renderQuote();
    els.liveStatus.textContent = `Error: ${String(e.message || e)}`;
  }
}

function selectedMarket() {
  const v = els.symbolSelect.value;
  return MARKETS.find(m => m.value === v) || null;
}

function selectedSymbolAndLabel() {
  const m = selectedMarket();
  if (m && m.value === "__custom") {
    const s = els.customSymbol.value.trim().toUpperCase();
    return { symbol: s, label: s ? s : "", market: m };
  }
  if (m) return { symbol: m.value, label: m.label, market: m };
  return { symbol: els.symbolSelect.value, label: els.symbolSelect.value, market: null };
}

// Apply the standard contract multiplier for the selected market.
// Always overwrites the input value so users see a sensible default
// for the chosen index; they can edit afterwards (e.g. for micros).
function applyMultiplierForMarket(market) {
  if (!market || !isFinite(market.multiplier)) return;
  els.inMultiplier.value = String(market.multiplier);
  if (els.multiplierAux && market.note) {
    els.multiplierAux.textContent = `${market.note} · auto-set, edit for micros`;
  }
}

function onSymbolChange() {
  const market = selectedMarket();
  const isCustom = market && market.value === "__custom";
  els.customRow.style.display = isCustom ? "flex" : "none";
  if (market) applyMultiplierForMarket(market);
  if (!isCustom) {
    const { symbol, label } = selectedSymbolAndLabel();
    fetchQuote(symbol, label, { autoApplyEntry: true });
  }
  calc();
}

// ───────── State persistence ─────────
function saveState() {
  const state = {
    symbol: els.symbolSelect.value,
    customSymbol: els.customSymbol.value,
    balance: els.inBalance.value,
    risk: els.inRisk.value,
    multiplier: els.inMultiplier.value,
    entry: els.inEntry.value,
    stopDistance: els.inStopDistance.value,
    brokerMargin: els.inBrokerMargin.value,
    usedMargin: els.inUsedMargin.value
  };
  chrome.storage.local.set({ [STORAGE_KEY]: state });
}

async function loadState() {
  const out = await chrome.storage.local.get(STORAGE_KEY);
  const s = out[STORAGE_KEY];
  if (!s) return;
  if (s.symbol)        els.symbolSelect.value = s.symbol;
  if (s.customSymbol)  els.customSymbol.value = s.customSymbol;
  if (s.balance)       els.inBalance.value = s.balance;
  if (s.risk)          els.inRisk.value = s.risk;
  if (s.multiplier)    els.inMultiplier.value = s.multiplier;
  if (s.entry)         els.inEntry.value = s.entry;
  if (s.stopDistance)  els.inStopDistance.value = s.stopDistance;
  if (s.brokerMargin)  els.inBrokerMargin.value = s.brokerMargin;
  if (s.usedMargin)    els.inUsedMargin.value = s.usedMargin;
  els.customRow.style.display = els.symbolSelect.value === "__custom" ? "flex" : "none";
  const market = selectedMarket();
  if (market && els.multiplierAux && market.note) {
    els.multiplierAux.textContent = `${market.note} · auto-set, edit for micros`;
  }
}

// ───────── Version display ─────────
function readVersion() {
  try {
    const v = chrome.runtime.getManifest().version;
    els.footerVersion.textContent = "v" + v;
  } catch (_) {}
}

// ───────── Wiring ─────────
function populateSymbols() {
  els.symbolSelect.innerHTML = MARKETS.map(m =>
    `<option value="${m.value}">${m.label}</option>`
  ).join("");
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  if (els.themeIconMoon && els.themeIconSun) {
    els.themeIconMoon.style.display = isDark ? "none" : "";
    els.themeIconSun.style.display  = isDark ? "" : "none";
  }
  if (els.themeBtn) {
    els.themeBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    els.themeBtn.setAttribute("aria-label", els.themeBtn.title);
  }
}

async function loadTheme() {
  const out = await chrome.storage.local.get(THEME_KEY);
  let theme = out[THEME_KEY];
  if (theme !== "dark" && theme !== "light") {
    theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }
  applyTheme(theme);
  return theme;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  chrome.storage.local.set({ [THEME_KEY]: next });
}

function wire() {
  if (els.themeBtn) els.themeBtn.addEventListener("click", toggleTheme);
  if (els.expandBtn) {
    if (IS_FULLSCREEN) {
      els.expandBtn.style.display = "none";
    } else {
      els.expandBtn.addEventListener("click", () => {
        const url = chrome.runtime.getURL("popup.html?fullscreen=1");
        chrome.tabs.create({ url });
        window.close();
      });
    }
  }
  els.symbolSelect.addEventListener("change", onSymbolChange);
  els.customApply.addEventListener("click", () => {
    const { symbol, label } = selectedSymbolAndLabel();
    if (symbol) fetchQuote(symbol, label, { autoApplyEntry: true });
    saveState();
  });
  els.customSymbol.addEventListener("keydown", (e) => {
    if (e.key === "Enter") els.customApply.click();
  });
  els.refreshBtn.addEventListener("click", () => {
    const { symbol, label } = selectedSymbolAndLabel();
    if (symbol) fetchQuote(symbol, label, { autoApplyEntry: true });
  });
  els.useAsEntry.addEventListener("click", () => {
    if (currentQuote && isFinite(currentQuote.price)) {
      els.inEntry.value = currentQuote.price.toString();
      calc();
    }
  });

  const inputs = [
    els.inBalance, els.inRisk, els.inMultiplier, els.inEntry,
    els.inStopDistance, els.inBrokerMargin, els.inUsedMargin
  ];
  inputs.forEach(i => i.addEventListener("input", calc));

  // Refresh quote periodically while popup is open
  refreshTimer = setInterval(() => {
    if (currentQuote) renderQuote(); // update "Xs ago"
  }, 1000);
  setInterval(() => {
    const { symbol, label } = selectedSymbolAndLabel();
    if (symbol && symbol !== "__custom") fetchQuote(symbol, label, { autoApplyEntry: true });
  }, REFRESH_MS);
}

// ───────── Boot ─────────
(async function init() {
  populateSymbols();
  readVersion();
  await loadTheme();
  await loadState();
  wire();
  calc();
  const { symbol, label } = selectedSymbolAndLabel();
  if (symbol) fetchQuote(symbol, label, { autoApplyEntry: true });
})();
