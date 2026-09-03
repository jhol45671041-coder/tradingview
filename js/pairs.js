// === Forex Pairs Data & Display ===

const forexPairs = [
    // Major Pairs
    { symbol: 'EURUSD', name: 'EUR/USD', category: 'major', spread: '0.6', pipSize: '0.0001', desc: 'Euro / US Dollar' },
    { symbol: 'GBPUSD', name: 'GBP/USD', category: 'major', spread: '0.8', pipSize: '0.0001', desc: 'British Pound / US Dollar' },
    { symbol: 'USDJPY', name: 'USD/JPY', category: 'major', spread: '0.8', pipSize: '0.01', desc: 'US Dollar / Japanese Yen' },
    { symbol: 'USDCHF', name: 'USD/CHF', category: 'major', spread: '0.8', pipSize: '0.0001', desc: 'US Dollar / Swiss Franc' },
    { symbol: 'AUDUSD', name: 'AUD/USD', category: 'major', spread: '0.6', pipSize: '0.0001', desc: 'Australian Dollar / US Dollar' },
    { symbol: 'NZDUSD', name: 'NZD/USD', category: 'major', spread: '1.0', pipSize: '0.0001', desc: 'New Zealand Dollar / US Dollar' },
    { symbol: 'USDCAD', name: 'USD/CAD', category: 'major', spread: '1.0', pipSize: '0.0001', desc: 'US Dollar / Canadian Dollar' },
    
    // Cross Pairs
    { symbol: 'EURGBP', name: 'EUR/GBP', category: 'cross', spread: '0.8', pipSize: '0.0001', desc: 'Euro / British Pound' },
    { symbol: 'EURJPY', name: 'EUR/JPY', category: 'cross', spread: '1.0', pipSize: '0.01', desc: 'Euro / Japanese Yen' },
    { symbol: 'GBPJPY', name: 'GBP/JPY', category: 'cross', spread: '1.5', pipSize: '0.01', desc: 'British Pound / Japanese Yen' },
    { symbol: 'EURAUD', name: 'EUR/AUD', category: 'cross', spread: '1.5', pipSize: '0.0001', desc: 'Euro / Australian Dollar' },
    { symbol: 'EURCHF', name: 'EUR/CHF', category: 'cross', spread: '1.2', pipSize: '0.0001', desc: 'Euro / Swiss Franc' },
    { symbol: 'EURCAD', name: 'EUR/CAD', category: 'cross', spread: '1.8', pipSize: '0.0001', desc: 'Euro / Canadian Dollar' },
    { symbol: 'EURNZD', name: 'EUR/NZD', category: 'cross', spread: '2.0', pipSize: '0.0001', desc: 'Euro / New Zealand Dollar' },
    { symbol: 'GBPAUD', name: 'GBP/AUD', category: 'cross', spread: '2.0', pipSize: '0.0001', desc: 'British Pound / Australian Dollar' },
    { symbol: 'GBPCAD', name: 'GBP/CAD', category: 'cross', spread: '2.5', pipSize: '0.0001', desc: 'British Pound / Canadian Dollar' },
    { symbol: 'GBPCHF', name: 'GBP/CHF', category: 'cross', spread: '2.5', pipSize: '0.0001', desc: 'British Pound / Swiss Franc' },
    { symbol: 'GBPNZD', name: 'GBP/NZD', category: 'cross', spread: '3.0', pipSize: '0.0001', desc: 'British Pound / New Zealand Dollar' },
    { symbol: 'AUDJPY', name: 'AUD/JPY', category: 'cross', spread: '1.2', pipSize: '0.01', desc: 'Australian Dollar / Japanese Yen' },
    { symbol: 'AUDNZD', name: 'AUD/NZD', category: 'cross', spread: '1.8', pipSize: '0.0001', desc: 'Australian Dollar / New Zealand Dollar' },
    { symbol: 'AUDCAD', name: 'AUD/CAD', category: 'cross', spread: '1.5', pipSize: '0.0001', desc: 'Australian Dollar / Canadian Dollar' },
    { symbol: 'AUDCHF', name: 'AUD/CHF', category: 'cross', spread: '1.5', pipSize: '0.0001', desc: 'Australian Dollar / Swiss Franc' },
    { symbol: 'NZDJPY', name: 'NZD/JPY', category: 'cross', spread: '1.5', pipSize: '0.01', desc: 'New Zealand Dollar / Japanese Yen' },
    { symbol: 'NZDCAD', name: 'NZD/CAD', category: 'cross', spread: '2.0', pipSize: '0.0001', desc: 'New Zealand Dollar / Canadian Dollar' },
    { symbol: 'NZDCHF', name: 'NZD/CHF', category: 'cross', spread: '2.0', pipSize: '0.0001', desc: 'New Zealand Dollar / Swiss Franc' },
    { symbol: 'CADJPY', name: 'CAD/JPY', category: 'cross', spread: '1.2', pipSize: '0.01', desc: 'Canadian Dollar / Japanese Yen' },
    { symbol: 'CADCHF', name: 'CAD/CHF', category: 'cross', spread: '1.8', pipSize: '0.0001', desc: 'Canadian Dollar / Swiss Franc' },
    { symbol: 'CHFJPY', name: 'CHF/JPY', category: 'cross', spread: '1.5', pipSize: '0.01', desc: 'Swiss Franc / Japanese Yen' },
    
    // Exotic Pairs
    { symbol: 'USDTRY', name: 'USD/TRY', category: 'exotic', spread: '5.0', pipSize: '0.0001', desc: 'US Dollar / Turkish Lira' },
    { symbol: 'USDMXN', name: 'USD/MXN', category: 'exotic', spread: '4.0', pipSize: '0.0001', desc: 'US Dollar / Mexican Peso' },
    { symbol: 'USDZAR', name: 'USD/ZAR', category: 'exotic', spread: '8.0', pipSize: '0.0001', desc: 'US Dollar / South African Rand' },
    { symbol: 'USDSEK', name: 'USD/SEK', category: 'exotic', spread: '5.0', pipSize: '0.0001', desc: 'US Dollar / Swedish Krona' },
    { symbol: 'USDNOK', name: 'USD/NOK', category: 'exotic', spread: '5.0', pipSize: '0.0001', desc: 'US Dollar / Norwegian Krone' },
    { symbol: 'USDDKK', name: 'USD/DKK', category: 'exotic', spread: '4.0', pipSize: '0.0001', desc: 'US Dollar / Danish Krone' },
    { symbol: 'USDSGD', name: 'USD/SGD', category: 'exotic', spread: '2.5', pipSize: '0.0001', desc: 'US Dollar / Singapore Dollar' },
    { symbol: 'USDHKD', name: 'USD/HKD', category: 'exotic', spread: '2.0', pipSize: '0.0001', desc: 'US Dollar / Hong Kong Dollar' },
    { symbol: 'USDPLN', name: 'USD/PLN', category: 'exotic', spread: '4.0', pipSize: '0.0001', desc: 'US Dollar / Polish Zloty' },
    { symbol: 'USDCNH', name: 'USD/CNH', category: 'exotic', spread: '5.0', pipSize: '0.0001', desc: 'US Dollar / Chinese Yuan' }
];

let currentFilter = 'all';
let searchQuery = '';

function renderPairs() {
    const grid = document.getElementById('pairs-grid');
    
    const filtered = forexPairs.filter(pair => {
        const matchFilter = currentFilter === 'all' || pair.category === currentFilter;
        const matchSearch = searchQuery === '' || 
            pair.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pair.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchFilter && matchSearch;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No pairs found matching your criteria.</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(pair => `
        <div class="pair-card" onclick="viewPairChart('${pair.symbol}')">
            <div class="pair-card-header">
                <span class="pair-name">${pair.name}</span>
                <span class="pair-badge badge-${pair.category}">${pair.category}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${pair.desc}</div>
            <div class="pair-info">
                <span class="pair-info-label">Pip Size</span>
                <span class="pair-info-value">${pair.pipSize}</span>
            </div>
            <div class="pair-info">
                <span class="pair-info-label">Avg Spread</span>
                <span class="pair-info-value pair-spread">${pair.spread} pips</span>
            </div>
            <div class="pair-info">
                <span class="pair-info-label">Lot Size</span>
                <span class="pair-info-value">100,000</span>
            </div>
            <button class="pair-view-btn">
                <i class="fas fa-chart-area"></i> View Chart
            </button>
        </div>
    `).join('');
}

function viewPairChart(symbol) {
    // Switch to chart section and load the pair
    const chartPairSelect = document.getElementById('chart-pair');
    const optionValue = 'FX:' + symbol;
    
    // Find and select the option
    for (let i = 0; i < chartPairSelect.options.length; i++) {
        if (chartPairSelect.options[i].value === optionValue) {
            chartPairSelect.selectedIndex = i;
            break;
        }
    }
    
    // Scroll to chart section
    document.getElementById('chart').scrollIntoView({ behavior: 'smooth' });
    
    // Update the chart
    setTimeout(() => {
        if (typeof updateChart === 'function') {
            updateChart();
        }
    }, 300);
    
    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[data-section="chart"]').classList.add('active');
}

function filterPairs() {
    searchQuery = document.getElementById('pair-search').value;
    renderPairs();
}

// Filter button handlers
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderPairs();
    });
});

// Load TradingView Market Overview Widget
function loadMarketOverviewWidget() {
    const container = document.getElementById('market-overview-widget');
    container.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "colorTheme": "dark",
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showFloatingTooltip": true,
        "width": "100%",
        "height": "450",
        "plotLineColorGrowing": "rgba(14, 165, 233, 1)",
        "plotLineColorFalling": "rgba(239, 68, 68, 1)",
        "gridLineColor": "rgba(51, 65, 85, 0.5)",
        "scaleFontColor": "rgba(148, 163, 184, 1)",
        "belowLineFillColorGrowing": "rgba(14, 165, 233, 0.12)",
        "belowLineFillColorFalling": "rgba(239, 68, 68, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(14, 165, 233, 0)",
        "belowLineFillColorFallingBottom": "rgba(239, 68, 68, 0)",
        "symbolActiveColor": "rgba(14, 165, 233, 0.15)",
        "tabs": [
            {
                "title": "Major Pairs",
                "symbols": [
                    { "s": "FX:EURUSD", "d": "EUR/USD" },
                    { "s": "FX:GBPUSD", "d": "GBP/USD" },
                    { "s": "FX:USDJPY", "d": "USD/JPY" },
                    { "s": "FX:USDCHF", "d": "USD/CHF" },
                    { "s": "FX:AUDUSD", "d": "AUD/USD" },
                    { "s": "FX:NZDUSD", "d": "NZD/USD" },
                    { "s": "FX:USDCAD", "d": "USD/CAD" }
                ]
            },
            {
                "title": "Cross Pairs",
                "symbols": [
                    { "s": "FX:EURGBP", "d": "EUR/GBP" },
                    { "s": "FX:EURJPY", "d": "EUR/JPY" },
                    { "s": "FX:GBPJPY", "d": "GBP/JPY" },
                    { "s": "FX:EURAUD", "d": "EUR/AUD" },
                    { "s": "FX:GBPAUD", "d": "GBP/AUD" },
                    { "s": "FX:AUDJPY", "d": "AUD/JPY" }
                ]
            },
            {
                "title": "Exotic Pairs",
                "symbols": [
                    { "s": "FX:USDTRY", "d": "USD/TRY" },
                    { "s": "FX:USDMXN", "d": "USD/MXN" },
                    { "s": "FX:USDZAR", "d": "USD/ZAR" },
                    { "s": "FX:USDSGD", "d": "USD/SGD" },
                    { "s": "FX:USDHKD", "d": "USD/HKD" }
                ]
            }
        ]
    });
    
    container.appendChild(script);
}

// Initialize on load
window.addEventListener('load', () => {
    renderPairs();
    setTimeout(loadMarketOverviewWidget, 800);
});
