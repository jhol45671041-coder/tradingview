// === TradingView Integration ===
// Advanced chart (tv.js), plus free embed widgets: ticker tape, market overview,
// technical summary, forex heatmap, cross rates and economic calendar.
// Widgets are loaded lazily the first time their view is opened, and re-rendered on theme change.

let currentWidget = null;
let currentTimeframe = '60';
const loadedWidgets = new Set();

function tvTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function getTimeframe(tf) {
    const mapping = { '1': '1', '5': '5', '15': '15', '60': '60', '240': '240', 'D': 'D', 'W': 'W' };
    return mapping[tf] || '60';
}

// Generic embed helper for TradingView "external-embedding" widgets
function embedTvWidget(containerId, scriptName, config) {
    const box = document.getElementById(containerId);
    if (!box) return;
    box.innerHTML = '<div class="widget-loading">Loading…</div>' +
        '<div class="tradingview-widget-container" style="position:relative;z-index:1">' +
        '<div class="tradingview-widget-container__widget"></div></div>';
    const wrap = box.querySelector('.tradingview-widget-container');
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/' + scriptName;
    script.async = true;
    script.text = JSON.stringify(config);
    wrap.appendChild(script);
    // Remove the placeholder once the widget has had time to paint (widgets are transparent)
    setTimeout(() => { const l = box.querySelector('.widget-loading'); if (l) l.remove(); }, 4000);
}

function symbolLabel(sym) {
    const s = sym.split(':').pop();
    return s.length === 6 ? s.slice(0, 3) + '/' + s.slice(3) : s;
}

// ---------- Advanced chart ----------
function updateChart() {
    const pair = document.getElementById('chart-pair').value;
    const container = document.getElementById('tradingview-chart');
    const dark = tvTheme() === 'dark';
    container.innerHTML = '';

    if (typeof TradingView === 'undefined' || !TradingView.widget) {
        // tv.js blocked or not loaded yet → fall back to the embed version
        embedTvWidget('tradingview-chart', 'embed-widget-advanced-chart.js', {
            autosize: true, symbol: pair, interval: currentTimeframe, timezone: 'Asia/Karachi',
            theme: tvTheme(), style: '1', locale: 'en', allow_symbol_change: true,
            studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'], support_host: 'https://www.tradingview.com'
        });
    } else {
        currentWidget = new TradingView.widget({
            "autosize": true,
            "symbol": pair,
            "interval": currentTimeframe,
            "timezone": "Asia/Karachi",
            "theme": tvTheme(),
            "style": "1",
            "locale": "en",
            "toolbar_bg": dark ? "#0f1622" : "#ffffff",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tradingview-chart",
            "hide_side_toolbar": false,
            "studies": [
                "MASimple@tv-basicstudies",
                "RSI@tv-basicstudies",
                "MACD@tv-basicstudies"
            ],
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650",
            "backgroundColor": dark ? "#0b111b" : "#ffffff",
            "gridColor": dark ? "rgba(31,42,60,0.6)" : "rgba(226,231,239,0.8)",
            "withdateranges": true,
            "details": true,
            "calendar": false
        });
    }
    loadTechnicalAnalysis(pair);
}

function loadTechnicalAnalysis(symbol) {
    setText('ta-symbol-label', symbolLabel(symbol));
    embedTvWidget('ta-widget', 'embed-widget-technical-analysis.js', {
        interval: '1h', width: '100%', height: '100%', isTransparent: true,
        symbol: symbol, showIntervalTabs: true, displayMode: 'single', locale: 'en', colorTheme: tvTheme()
    });
}

// Timeframe button handlers
document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTimeframe = getTimeframe(btn.dataset.tf);
        updateChart();
    });
});

// ---------- Ticker tape ----------
function loadTickerTape() {
    embedTvWidget('ticker-tape', 'embed-widget-ticker-tape.js', {
        symbols: [
            { proName: 'FX:EURUSD', title: 'EUR/USD' },
            { proName: 'FX:GBPUSD', title: 'GBP/USD' },
            { proName: 'FX:USDJPY', title: 'USD/JPY' },
            { proName: 'OANDA:XAUUSD', title: 'Gold' },
            { proName: 'FX:AUDUSD', title: 'AUD/USD' },
            { proName: 'FX:USDCAD', title: 'USD/CAD' },
            { proName: 'FX:USDCHF', title: 'USD/CHF' },
            { proName: 'FX:GBPJPY', title: 'GBP/JPY' },
            { proName: 'TVC:DXY', title: 'US Dollar Index' },
            { proName: 'FX_IDC:USDPKR', title: 'USD/PKR' },
            { proName: 'OANDA:XAGUSD', title: 'Silver' }
        ],
        showSymbolLogo: true, isTransparent: true, displayMode: 'adaptive', colorTheme: tvTheme(), locale: 'en'
    });
}

// ---------- Market overview (dashboard) ----------
function loadMarketOverviewWidget() {
    const dark = tvTheme() === 'dark';
    embedTvWidget('market-overview-widget', 'embed-widget-market-overview.js', {
        colorTheme: tvTheme(),
        dateRange: '1D',
        showChart: true,
        locale: 'en',
        largeChartUrl: '',
        isTransparent: true,
        showSymbolLogo: true,
        showFloatingTooltip: true,
        width: '100%',
        height: '100%',
        plotLineColorGrowing: 'rgba(45, 212, 191, 1)',
        plotLineColorFalling: 'rgba(244, 63, 94, 1)',
        gridLineColor: dark ? 'rgba(31, 42, 60, 0.6)' : 'rgba(226, 231, 239, 0.8)',
        scaleFontColor: dark ? 'rgba(164, 176, 195, 1)' : 'rgba(71, 85, 105, 1)',
        belowLineFillColorGrowing: 'rgba(45, 212, 191, 0.12)',
        belowLineFillColorFalling: 'rgba(244, 63, 94, 0.12)',
        belowLineFillColorGrowingBottom: 'rgba(45, 212, 191, 0)',
        belowLineFillColorFallingBottom: 'rgba(244, 63, 94, 0)',
        symbolActiveColor: 'rgba(45, 212, 191, 0.12)',
        tabs: [
            { title: 'Majors', symbols: [
                { s: 'FX:EURUSD', d: 'EUR/USD' }, { s: 'FX:GBPUSD', d: 'GBP/USD' }, { s: 'FX:USDJPY', d: 'USD/JPY' },
                { s: 'FX:USDCHF', d: 'USD/CHF' }, { s: 'FX:AUDUSD', d: 'AUD/USD' }, { s: 'FX:NZDUSD', d: 'NZD/USD' },
                { s: 'FX:USDCAD', d: 'USD/CAD' }
            ] },
            { title: 'Crosses', symbols: [
                { s: 'FX:EURGBP', d: 'EUR/GBP' }, { s: 'FX:EURJPY', d: 'EUR/JPY' }, { s: 'FX:GBPJPY', d: 'GBP/JPY' },
                { s: 'FX:EURAUD', d: 'EUR/AUD' }, { s: 'FX:GBPAUD', d: 'GBP/AUD' }, { s: 'FX:AUDJPY', d: 'AUD/JPY' }
            ] },
            { title: 'Metals', symbols: [
                { s: 'OANDA:XAUUSD', d: 'Gold' }, { s: 'OANDA:XAGUSD', d: 'Silver' }, { s: 'TVC:DXY', d: 'US Dollar Index' }
            ] },
            { title: 'Exotics', symbols: [
                { s: 'FX_IDC:USDPKR', d: 'USD/PKR' }, { s: 'FX:USDTRY', d: 'USD/TRY' }, { s: 'FX:USDMXN', d: 'USD/MXN' },
                { s: 'FX:USDZAR', d: 'USD/ZAR' }, { s: 'FX:USDSGD', d: 'USD/SGD' }
            ] }
        ]
    });
}

// ---------- Heatmap & cross rates ----------
const TV_CURRENCIES = ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD'];
function loadHeatmap() {
    embedTvWidget('heatmap-widget', 'embed-widget-forex-heat-map.js', {
        width: '100%', height: '100%', currencies: TV_CURRENCIES, isTransparent: true, colorTheme: tvTheme(), locale: 'en'
    });
}
function loadCrossRates() {
    embedTvWidget('cross-rates-widget', 'embed-widget-forex-cross-rates.js', {
        width: '100%', height: '100%', currencies: TV_CURRENCIES, isTransparent: true, colorTheme: tvTheme(), locale: 'en'
    });
}

// ---------- Economic calendar ----------
function loadCalendar() {
    embedTvWidget('calendar-widget', 'embed-widget-events.js', {
        colorTheme: tvTheme(), isTransparent: true, width: '100%', height: '100%', locale: 'en',
        importanceFilter: '-1,0,1', countryFilter: 'us,eu,gb,jp,au,ca,ch,nz,cn'
    });
}

// ---------- Lazy loading per view ----------
const VIEW_WIDGETS = {
    dashboard: [loadMarketOverviewWidget],
    charts: [updateChart],
    markets: [loadHeatmap, loadCrossRates],
    calendar: [loadCalendar]
};

function loadWidgetsForView(view) {
    if (loadedWidgets.has(view) || !VIEW_WIDGETS[view]) return;
    loadedWidgets.add(view);
    VIEW_WIDGETS[view].forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
}

// Re-render every widget that has been shown (used after a theme switch)
function reloadWidgetsForTheme(activeView) {
    loadTickerTape();
    const shown = Array.from(loadedWidgets);
    loadedWidgets.clear();
    shown.forEach(v => {
        if (v === activeView) loadWidgetsForView(v);
    });
}
