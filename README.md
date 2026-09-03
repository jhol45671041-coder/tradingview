# Forex Calculator & TradingView Chart

A simple web calculator for forex metrics (pip movement, pip value, margin) and an embedded TradingView chart.

## Features

- Select currency pair (EUR/USD, GBP/USD, USD/JPY, AUD/USD, Gold).
- Input lot size, leverage, entry/exit price.
- Instantly see:
  - Pip movement (how many pips the price moved).
  - Pip value per lot.
  - Required margin and margin percentage.
- TradingView widget for the selected pair updates automatically.

## How to Use

1. Open `index.html` in a browser.
2. Choose a pair from the dropdown.
3. Enter lot size (e.g., 1.0), leverage (e.g., 100), and entry/exit prices.
4. Click **Calculate** to see results.
5. The TradingView chart below will display the selected pair (default timeframe: Daily).

## Customization

- Add more pairs by editing the `pipSizes` and `contractSizes` objects in `index.html`.
- Change the default timeframe or theme by modifying the TradingView widget parameters.

## Notes

- Pip value calculation assumes a USD‑quoted pair; for XAU/USD the contract size is 1 ounce.
- Margin is calculated as ` (contract size × lot size) / leverage `.
- The TradingView widget loads dynamically; ensure you have an internet connection.

---

Feel free to fork and adapt this calculator for your own trading analysis.