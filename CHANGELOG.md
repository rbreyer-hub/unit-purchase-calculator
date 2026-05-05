# Changelog

All notable changes to **Unit Purchase Calculator** are documented here.
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/rbreyer-hub/unit-purchase-calculator/releases/tag/v0.1.0
