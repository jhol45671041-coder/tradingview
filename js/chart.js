// === TradingView Chart Integration ===

let currentWidget = null;
let currentTimeframe = '60';

function getTimeframe(tf) {
    const mapping = {
        '1': '1',
        '5': '5',
        '15': '15',
        '60': '60',
        '240': '240',
        'D': 'D',
        'W': 'W'
    };
    return mapping[tf] || '60';
}

function updateChart() {
    const pair = document.getElementById('chart-pair').value;
    const container = document.getElementById('tradingview-chart');
    
    // Clear existing widget
    container.innerHTML = '';
    
    // Create new widget
    currentWidget = new TradingView.widget({
        "autosize": true,
        "symbol": pair,
        "interval": currentTimeframe,
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#1e293b",
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
        "backgroundColor": "#0f172a",
        "gridColor": "#1e293b",
        "withdateranges": true,
        "details": true,
        "calendar": false
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

// Initialize chart on load
window.addEventListener('load', () => {
    // Small delay to ensure TradingView script is loaded
    setTimeout(updateChart, 500);
});
