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
    { symbol: 'USDCNH', name: 'USD/CNH', category: 'exotic', spread: '5.0', pipSize: '0.0001', desc: 'US Dollar / Chinese Yuan' },
    { symbol: 'USDPKR', name: 'USD/PKR', category: 'exotic', spread: '–', pipSize: '0.01', desc: 'US Dollar / Pakistani Rupee', lot: '–' },

    // Metals
    { symbol: 'XAUUSD', name: 'XAU/USD', category: 'metal', spread: '25', pipSize: '0.01', desc: 'Gold / US Dollar', lot: '100 oz' },
    { symbol: 'XAGUSD', name: 'XAG/USD', category: 'metal', spread: '25', pipSize: '0.001', desc: 'Silver / US Dollar', lot: '5,000 oz' }
];

let currentFilter = 'all';
let searchQuery = '';

function renderPairs() {
    const grid = document.getElementById('pairs-grid');

    const q = searchQuery.trim().toLowerCase().replace('/', '');
    const filtered = forexPairs.filter(pair => {
        const matchFilter = currentFilter === 'all' || pair.category === currentFilter;
        const matchSearch = q === '' ||
            pair.symbol.toLowerCase().includes(q) ||
            pair.desc.toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="fas fa-magnifying-glass"></i>No pairs found matching your search.</div>';
        return;
    }

    grid.innerHTML = filtered.map(pair => `
        <div class="pair-card" role="button" tabindex="0" onclick="viewPairChart('${pair.symbol}')" onkeydown="if(event.key==='Enter')viewPairChart('${pair.symbol}')">
            <div class="pair-card-header">
                <span class="pair-name">${pair.name}</span>
                <span class="pair-badge badge-${pair.category}">${pair.category}</span>
            </div>
            <div class="pair-desc">${pair.desc}</div>
            <div class="pair-info">
                <span class="pair-info-label">Pip size</span>
                <span class="pair-info-value">${pair.pipSize}</span>
            </div>
            <div class="pair-info">
                <span class="pair-info-label">Avg spread</span>
                <span class="pair-info-value">${pair.spread}${pair.spread === '–' ? '' : ' pips'}</span>
            </div>
            <div class="pair-info">
                <span class="pair-info-label">1 lot</span>
                <span class="pair-info-value">${pair.lot || '100,000'}</span>
            </div>
            <button class="pair-view-btn" tabindex="-1">
                <i class="fas fa-chart-area"></i> View chart
            </button>
        </div>
    `).join('');
}

function viewPairChart(symbol) {
    // Select the pair in the chart dropdown (any exchange prefix) and open the chart view
    const chartPairSelect = document.getElementById('chart-pair');
    for (let i = 0; i < chartPairSelect.options.length; i++) {
        if (chartPairSelect.options[i].value.split(':').pop() === symbol) {
            chartPairSelect.selectedIndex = i;
            break;
        }
    }
    // showView loads the chart the first time; afterwards refresh it for the new pair
    const alreadyLoaded = typeof loadedWidgets !== 'undefined' && loadedWidgets.has('charts');
    if (typeof showView === 'function') showView('charts');
    if (alreadyLoaded && typeof updateChart === 'function') updateChart();
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

renderPairs();
