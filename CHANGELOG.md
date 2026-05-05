# Changelog

All notable changes to **Unit Purchase Calculator** are documented here.
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-05-05

### Added
- **Full-screen mode.** New "Expand" button in the popup header opens
  the calculator in its own browser tab, where the layout switches to
  a two-column grid (inputs on the left, results / status / checklist
  / breakdown on the right). The popup retains its original 480px
  layout. The expand button hides itself when already in full screen.
- `web_accessible_resources` entry for `popup.html` so the full-screen
  page can be loaded from a tab via `chrome.runtime.getURL`.

### Changed
- **Modernized visual design while staying on the cream / forest /
  vermillion palette:**
  - Layered shadow system (`--shadow-sm/md/lg/glow`) applied to cards,
    inputs, and buttons; cards now lift on hover.
  - Radial cream gradient + faint dotted texture on the page
    background for paper-like depth.
  - Card surfaces use vertical gradients with a subtle highlight on
    the top edge.
  - Gradient accent + ink fills on the title via `background-clip: text`.
  - Quote box gains a soft accent-tinted glow in the top-right corner.
  - Status bar, checklist items, and the formula box use gradient
    backgrounds and a left-edge accent stripe (formula box).
  - Free-margin gauge now renders with a gradient fill (forest, ochre,
    or vermillion based on cushion).
  - Inputs show an accent-colored focus ring and inner highlight.
  - Refined live dot pulse (scale + opacity together).
- Expanded palette tokens with tints/shades and a soft ochre warning
  variant for richer state contrast.

## [0.1.0] — 2026-05-05

### Added
- Initial release as a Manifest V3 browser extension.
- Position-sizing calculator with number-field inputs (no sliders) for:
  account balance, risk amount, contract multiplier, entry price,
  stop loss price, broker margin %, and used margin.
- Live quote fetch from Yahoo Finance for 16 default markets:
  NAS100, S&P 500, Dow, Russell 2000, DAX, FTSE 100, EUR/USD,
  GBP/USD, USD/JPY, BTC-USD, ETH-USD, gold, silver, crude oil,
  AAPL, TSLA — plus a "Custom symbol" option for any Yahoo ticker.
- "Use as entry" button to drop the live price into the entry field.
- Free-margin display: balance − used margin − position margin,
  with a percentage gauge of remaining cushion.
- Pre-trade checklist, status bar (safe / warn / danger), and a
  formula breakdown box for transparency.
- State persistence via `chrome.storage.local` so inputs and the
  selected symbol survive popup reopens.
- Cream / forest-green / vermillion palette pulled from the
  reference image, with Syne (display) and DM Mono (body) fonts.

[0.2.0]: https://github.com/rbreyer-hub/unit-purchase-calculator/releases/tag/v0.2.0
[0.1.0]: https://github.com/rbreyer-hub/unit-purchase-calculator/releases/tag/v0.1.0
