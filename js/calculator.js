// === Forex Calculator Logic ===

// Pip sizes for different pairs
const PIP_SIZES = {
    'EURUSD': 0.0001, 'GBPUSD': 0.0001, 'AUDUSD': 0.0001, 'NZDUSD': 0.0001,
    'USDCHF': 0.0001, 'USDCAD': 0.0001, 'EURGBP': 0.0001, 'EURAUD': 0.0001,
    'EURCHF': 0.0001, 'EURCAD': 0.0001, 'EURNZD': 0.0001, 'GBPAUD': 0.0001,
    'GBPCAD': 0.0001, 'GBPCHF': 0.0001, 'GBPNZD': 0.0001, 'AUDNZD': 0.0001,
    'AUDCAD': 0.0001, 'AUDCHF': 0.0001, 'NZDCAD': 0.0001, 'NZDCHF': 0.0001,
    'CADCHF': 0.0001, 'USDSGD': 0.0001, 'USDMXN': 0.0001, 'USDHKD': 0.0001,
    'USDZAR': 0.0001, 'USDSEK': 0.0001, 'USDNOK': 0.0001, 'USDDKK': 0.0001,
    'USDPLN': 0.0001, 'USDCNH': 0.0001,
    'USDJPY': 0.01, 'EURJPY': 0.01, 'GBPJPY': 0.01, 'AUDJPY': 0.01,
    'NZDJPY': 0.01, 'CADJPY': 0.01, 'CHFJPY': 0.01,
    'USDTRY': 0.0001
};

function getPipSize(pair) {
    return PIP_SIZES[pair] || 0.0001;
}

function isJPYPair(pair) {
    return pair.includes('JPY');
}

function formatCurrency(value) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(value, decimals = 2) {
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// === Pip Calculator ===
function calculatePip() {
    const pair = document.getElementById('pip-pair').value;
    const lots = parseFloat(document.getElementById('pip-lots').value) || 1;
    const price = parseFloat(document.getElementById('pip-price').value) || 1.1000;
    
    const pipSize = getPipSize(pair);
    const units = lots * 100000;
    const totalValue = units * price;
    
    let pipValue;
    if (isJPYPair(pair)) {
        pipValue = (units * pipSize) / price;
    } else {
        // For USD quote pairs, pip value = units * pipSize
        // For non-USD quote, convert back
        if (pair.endsWith('USD') || pair === 'USDCAD' || pair === 'USDCHF' || pair === 'USDJPY') {
            pipValue = units * pipSize;
        } else {
            pipValue = (units * pipSize) / price;
        }
    }
    
    document.getElementById('pip-value-result').textContent = formatCurrency(pipValue);
    document.getElementById('pip-size-result').textContent = pipSize.toString();
    document.getElementById('pip-units-result').textContent = formatNumber(units, 0);
    document.getElementById('pip-total-result').textContent = formatCurrency(totalValue);
}

// === Lot Size Calculator ===
function calculateLot() {
    const balance = parseFloat(document.getElementById('lot-balance').value) || 10000;
    const riskPercent = parseFloat(document.getElementById('lot-risk').value) || 2;
    const stopLoss = parseFloat(document.getElementById('lot-stoploss').value) || 50;
    const pair = document.getElementById('lot-pair').value;
    
    const riskAmount = balance * (riskPercent / 100);
    const pipSize = getPipSize(pair);
    
    let pipValuePerLot;
    if (isJPYPair(pair)) {
        pipValuePerLot = 100000 * pipSize; // Approximate
    } else {
        pipValuePerLot = 100000 * pipSize; // $10 for standard lot on USD pairs
    }
    
    const lotSize = riskAmount / (stopLoss * pipValuePerLot);
    const units = lotSize * 100000;
    const actualPipValue = riskAmount / stopLoss;
    
    document.getElementById('lot-size-result').textContent = lotSize.toFixed(2) + ' lots';
    document.getElementById('lot-risk-amount').textContent = formatCurrency(riskAmount);
    document.getElementById('lot-pip-value').textContent = formatCurrency(actualPipValue);
    document.getElementById('lot-units').textContent = formatNumber(units, 0);
}

// === Leverage Calculator ===
function calculateLeverage() {
    const equity = parseFloat(document.getElementById('lev-equity').value) || 10000;
    const lots = parseFloat(document.getElementById('lev-lots').value) || 1;
    const pair = document.getElementById('lev-pair').value;
    const price = parseFloat(document.getElementById('lev-price').value) || 1.1000;
    
    const units = lots * 100000;
    const positionValue = units * price;
    const effectiveLeverage = positionValue / equity;
    
    // Required margin at 1:100 leverage
    const marginRequired = positionValue / 100;
    const freeMargin = equity - marginRequired;
    
    document.getElementById('lev-ratio').textContent = '1:' + formatNumber(effectiveLeverage);
    document.getElementById('lev-position-value').textContent = formatCurrency(positionValue);
    document.getElementById('lev-margin-required').textContent = formatCurrency(marginRequired);
    document.getElementById('lev-free-margin').textContent = formatCurrency(freeMargin);
    
    // Update leverage meter (scale 1-100)
    const meterPercent = Math.min((effectiveLeverage / 100) * 100, 100);
    document.getElementById('leverage-meter-fill').style.width = meterPercent + '%';
}

// === Margin Calculator ===
function calculateMargin() {
    const pair = document.getElementById('margin-pair').value;
    const lots = parseFloat(document.getElementById('margin-lots').value) || 1;
    const leverage = parseInt(document.getElementById('margin-leverage').value) || 100;
    const price = parseFloat(document.getElementById('margin-price').value) || 1.1000;
    
    const units = lots * 100000;
    const positionValue = units * price;
    const requiredMargin = positionValue / leverage;
    const marginPercent = (1 / leverage) * 100;
    const marginPerPip = requiredMargin / (positionValue * getPipSize(pair));
    
    document.getElementById('margin-required').textContent = formatCurrency(requiredMargin);
    document.getElementById('margin-position').textContent = formatCurrency(positionValue);
    document.getElementById('margin-percent').textContent = marginPercent.toFixed(2) + '%';
    document.getElementById('margin-per-pip').textContent = formatCurrency(marginPerPip);
}

// === Pips Move Calculator ===
function calculatePipsMove() {
    const pair = document.getElementById('move-pair').value;
    const direction = document.getElementById('move-direction').value;
    const entry = parseFloat(document.getElementById('move-entry').value) || 1.1000;
    const exit = parseFloat(document.getElementById('move-exit').value) || 1.1050;
    const lots = parseFloat(document.getElementById('move-lots').value) || 1;
    
    const pipSize = getPipSize(pair);
    const units = lots * 100000;
    
    let pipsMoved;
    if (direction === 'buy') {
        pipsMoved = (exit - entry) / pipSize;
    } else {
        pipsMoved = (entry - exit) / pipSize;
    }
    
    const pipValue = units * pipSize;
    const profitLoss = pipsMoved * pipValue;
    const priceChange = ((exit - entry) / entry) * 100;
    
    document.getElementById('move-pips').textContent = formatNumber(Math.abs(pipsMoved), 1) + ' pips';
    
    const plElement = document.getElementById('move-pl');
    if (profitLoss >= 0) {
        plElement.textContent = '+' + formatCurrency(profitLoss);
        plElement.className = 'result-value profit';
    } else {
        plElement.textContent = '-' + formatCurrency(Math.abs(profitLoss));
        plElement.className = 'result-value loss';
    }
    
    document.getElementById('move-pip-val').textContent = formatCurrency(pipValue);
    document.getElementById('move-change').textContent = (priceChange >= 0 ? '+' : '') + priceChange.toFixed(4) + '%';
}

// === Tab Switching ===
function switchCalc(calc) {
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
    
    document.querySelector(`.calc-tab[data-calc="${calc}"]`).classList.add('active');
    document.getElementById(`calc-${calc}`).classList.add('active');
}

// Tab click handlers
document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const calc = tab.dataset.calc;
        switchCalc(calc);
    });
});

// Navigation click handlers
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Run initial calculations on load
window.addEventListener('load', () => {
    calculatePip();
    calculateLot();
    calculateLeverage();
    calculateMargin();
    calculatePipsMove();
});
