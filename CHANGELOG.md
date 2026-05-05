# Changelog

All notable changes to **Unit Purchase Calculator** are documented here.
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] — 2026-05-05

### Added
- **Dark mode** with a header toggle button. `data-theme="dark"` on
  `<html>` re-maps every palette token so the calculator inverts to
  black ground / cream ink while keeping the same layout, the color-
  block stripe, and the vermillion accent (slightly brightened to
  `#E85A3F` for legibility). State is persisted to
  `chrome.storage.local`; first run defaults to the user's
  `prefers-color-scheme`. Free-margin tile shifts to a deep warm
  slab with cream value text so it still reads as the headline
  output. Smooth color cross-fade on toggle.
- Theme button shows a moon icon in light mode (target = dark) and
  a sun in dark mode (target = light).

### Changed
- **Display font swapped from Syne to Inter.** Inter is a neutral
  modern grotesque used widely in financial / professional
  interfaces. The title's "Calculator" italic flourish is dropped
  in favor of a flat color contrast — fewer quirks, more presence.
- All numeric displays (quote price, result tiles, gauge percent,
  number inputs) now use `font-variant-numeric: tabular-nums
  lining-nums` so digits keep a fixed-width column and don't shift
  as values update.
- Header buttons restructured into a `.header-actions` flex group
  in the top-right; both share a unified `.btn-pill` style.

## [0.3.0] — 2026-05-05

### Changed
- **Visual redesign in the editorial / portfolio mode of yukaidu.com:**
  white ground, black ink, hairline borders, generous whitespace,
  oversized italic accent on the title, single-color accent strategy.
  All gradients, drop shadows, paper texture, hover-lift micro-
  interactions, glow effects, and accent-tinted radial halos from
  the v0.2.0 modernization are removed in favor of restraint —
  letting type and data carry the visual weight.
- Top edge now carries a thin **5-block color stripe** (red ·
  gold · forest · navy · cream) as a nod to Yukai Du's "vibrant
  layered patterns" — the only loud color outside of accent text.
- Header title is now ~2.6rem display (4.5rem in full screen) with
  *Calculator* set in italic vermillion against black "Unit
  Purchase".
- Result tiles use hairline grid lines (no inner gap), removing
  the boxed "card" feel; the **Free margin** tile is now solid
  cream from the stripe palette so it stands as the headline
  output.
- Status bar reduced to a single thick left border in the relevant
  state color; checklist becomes a flat bordered list.
- Inputs, quote box, formula box: 1px hairline borders only,
  flat fills, focus rings replaced with simple border-color
  changes.
- Free-margin gauge thinned to a 4px solid bar (no gradient, no
  inner highlight).
- Live-dot pulse simplified to opacity-only.
- Fullscreen layout retuned to a 1180px max-width grid with
  3.5rem gutters and a 4.5rem display title.

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

[0.4.0]: https://github.com/rbreyer-hub/unit-purchase-calculator/releases/tag/v0.4.0
[0.3.0]: https://github.com/rbreyer-hub/unit-purchase-calculator/releases/tag/v0.3.0
[0.2.0]: https://github.com/rbreyer-hub/unit-purchase-calculator/releases/tag/v0.2.0
[0.1.0]: https://github.com/rbreyer-hub/unit-purchase-calculator/releases/tag/v0.1.0
