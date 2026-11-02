// === Forex Calculator Logic ===
// Core calculators: Pip Value, Position (Lot) Size, Leverage, Margin, Pips Move (Profit/Loss).
// Function names and element IDs are kept from the original site so all links/handlers still work.

// ---------- Instruments ----------
// Pairs offered in every calculator pair dropdown (grouped).
const CALC_PAIRS = [
    { s: 'EURUSD', g: 'Major Pairs' }, { s: 'GBPUSD', g: 'Major Pairs' }, { s: 'USDJPY', g: 'Major Pairs' },
    { s: 'USDCHF', g: 'Major Pairs' }, { s: 'AUDUSD', g: 'Major Pairs' }, { s: 'NZDUSD', g: 'Major Pairs' },
    { s: 'USDCAD', g: 'Major Pairs' },
    { s: 'XAUUSD', g: 'Metals', label: 'XAU/USD (Gold)' }, { s: 'XAGUSD', g: 'Metals', label: 'XAG/USD (Silver)' },
    { s: 'EURGBP', g: 'Cross Pairs' }, { s: 'EURJPY', g: 'Cross Pairs' }, { s: 'GBPJPY', g: 'Cross Pairs' },
    { s: 'EURAUD', g: 'Cross Pairs' }, { s: 'EURCHF', g: 'Cross Pairs' }, { s: 'EURCAD', g: 'Cross Pairs' },
    { s: 'EURNZD', g: 'Cross Pairs' }, { s: 'GBPAUD', g: 'Cross Pairs' }, { s: 'GBPCAD', g: 'Cross Pairs' },
    { s: 'GBPCHF', g: 'Cross Pairs' }, { s: 'GBPNZD', g: 'Cross Pairs' }, { s: 'AUDJPY', g: 'Cross Pairs' },
    { s: 'AUDNZD', g: 'Cross Pairs' }, { s: 'AUDCAD', g: 'Cross Pairs' }, { s: 'AUDCHF', g: 'Cross Pairs' },
    { s: 'NZDJPY', g: 'Cross Pairs' }, { s: 'CADJPY', g: 'Cross Pairs' }, { s: 'CHFJPY', g: 'Cross Pairs' }
];

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
    'USDTRY': 0.0001,
    // Metals
    'XAUUSD': 0.01,   // Gold: quoted to 2 decimals
    'XAGUSD': 0.001   // Silver: quoted to 3 decimals
};

// Contract sizes: units per 1 standard lot
const CONTRACT_SIZES = {
    'XAUUSD': 100,    // Gold: 100 troy ounces per lot
    'XAGUSD': 5000    // Silver: 5,000 troy ounces per lot
};
const DEFAULT_CONTRACT_SIZE = 100000; // Forex standard lot

// Sample prices used to pre-fill price inputs; only overwrite when the field
// still holds the previous pair's sample value (never clobber user input).
const SAMPLE_PRICES = {
    'EURUSD': 1.1000, 'GBPUSD': 1.2500, 'USDJPY': 150.000, 'USDCHF': 0.8800,
    'AUDUSD': 0.6500, 'NZDUSD': 0.5900, 'USDCAD': 1.3700, 'EURGBP': 0.8800,
    'EURJPY': 165.000, 'GBPJPY': 187.500, 'EURAUD': 1.6900, 'EURCHF': 0.9700,
    'EURCAD': 1.5100, 'EURNZD': 1.8600, 'GBPAUD': 1.9200, 'GBPCAD': 1.7100,
    'GBPCHF': 1.1000, 'GBPNZD': 2.1200, 'AUDJPY': 97.500, 'AUDNZD': 1.1000,
    'AUDCAD': 0.8900, 'AUDCHF': 0.5700, 'NZDJPY': 88.500, 'CADJPY': 109.500,
    'CHFJPY': 170.500,
    'XAUUSD': 4400.00,  // Gold (per oz)
    'XAGUSD': 64.500    // Silver (per oz)
};

const PRICE_DECIMALS = { 'XAUUSD': 2, 'XAGUSD': 3 };
const DEFAULT_PRICE_DECIMALS = 4;

// Approximate value of 1 unit of each currency in USD. Used to convert pip values
// of cross pairs (e.g. EUR/GBP, EUR/JPY) into USD. Replaced with live daily reference
// rates when the currency-converter feed loads (see tools.js → setLiveUsdRates).
const USD_VALUE = {
    USD: 1, EUR: 1.10, GBP: 1.25, JPY: 1 / 150, CHF: 1 / 0.88,
    CAD: 1 / 1.37, AUD: 0.65, NZD: 0.59
};
let usdRatesAreLive = false;

function setLiveUsdRates(ratesPerUSD) {
    // ratesPerUSD: { EUR: 0.91, JPY: 150.2, ... } (units of currency per 1 USD)
    Object.keys(USD_VALUE).forEach(c => {
        if (c !== 'USD' && ratesPerUSD[c]) USD_VALUE[c] = 1 / ratesPerUSD[c];
    });
    usdRatesAreLive = true;
    recalcAll();
}

function getPipSize(pair) {
    return PIP_SIZES[pair] || 0.0001;
}

function getContractSize(pair) {
    return CONTRACT_SIZES[pair] || DEFAULT_CONTRACT_SIZE;
}

function isMetal(pair) {
    return pair === 'XAUUSD' || pair === 'XAGUSD';
}

function isJPYPair(pair) {
    return pair.includes('JPY');
}

function priceDecimals(pair) {
    if (PRICE_DECIMALS[pair]) return PRICE_DECIMALS[pair];
    return isJPYPair(pair) ? 3 : DEFAULT_PRICE_DECIMALS;
}

function pairLabel(pair) {
    const p = CALC_PAIRS.find(x => x.s === pair);
    if (p && p.label) return p.label;
    return pair.slice(0, 3) + '/' + pair.slice(3);
}

// USD value of 1 unit of the pair's quote currency.
// For USD-base pairs (USDJPY, USDCHF...) the trade price itself gives the exact conversion.
function quoteToUSD(pair, price) {
    const quote = pair.slice(3, 6);
    if (quote === 'USD') return 1;
    if (pair.startsWith('USD') && price > 0) return 1 / price;
    return USD_VALUE[quote] || 1;
}

// USD value of one pip for a given number of units
function pipValueUSD(pair, units, price) {
    return units * getPipSize(pair) * quoteToUSD(pair, price);
}

// Notional position value in USD
function positionValueUSD(pair, units, price) {
    if (pair.startsWith('USD')) return units;            // USD is the base currency (USDJPY, USDCHF, ...)
    return units * price * quoteToUSD(pair, price);       // EURUSD, XAUUSD → units*price; crosses converted
}

function formatCurrency(value) {
    const sign = value < 0 ? '-' : '';
    return sign + '$' + Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMoney(value, currency) {
    if (!currency || currency === 'USD') return formatCurrency(value);
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    } catch (e) {
        return formatNumber(value) + ' ' + currency;
    }
}

function formatNumber(value, decimals = 2) {
    if (!isFinite(value)) return '–';
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function num(id, fallback) {
    const el = document.getElementById(id);
    const v = el ? parseFloat(el.value) : NaN;
    return isNaN(v) ? fallback : v;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// ---------- Populate pair dropdowns ----------
function populatePairSelects() {
    document.querySelectorAll('select.pair-select').forEach(select => {
        if (select.options.length) return;
        const groups = {};
        CALC_PAIRS.forEach(p => {
            if (!groups[p.g]) {
                groups[p.g] = document.createElement('optgroup');
                groups[p.g].label = p.g;
                select.appendChild(groups[p.g]);
            }
            const opt = document.createElement('option');
            opt.value = p.s;
            opt.textContent = p.label || pairLabel(p.s);
            groups[p.g].appendChild(opt);
        });
        select.value = 'EURUSD';
    });
}
populatePairSelects();

// === Pip Calculator ===
function calculatePip() {
    const pair = document.getElementById('pip-pair').value;
    const account = document.getElementById('pip-account-currency').value || 'USD';
    const lots = num('pip-lots', 1) || 1;
    const price = num('pip-price', SAMPLE_PRICES[pair] || 1.1);

    const pipSize = getPipSize(pair);
    const units = lots * getContractSize(pair);
    const totalValue = positionValueUSD(pair, units, price);

    // Pip value in USD, then into the account currency
    const pipUSD = pipValueUSD(pair, units, price);
    const pipValue = pipUSD / (USD_VALUE[account] || 1);

    setText('pip-value-result', formatMoney(pipValue, account));
    setText('pip-size-result', pipSize.toString());
    setText('pip-units-result', formatNumber(units, 0) + (isMetal(pair) ? ' oz' : ''));
    setText('pip-total-result', formatCurrency(totalValue));
}

// === Lot (Position) Size Calculator ===
function calculateLot() {
    const balance = num('lot-balance', 10000);
    const mode = (document.getElementById('lot-risk-mode') || {}).value || 'percent';
    const stopLoss = num('lot-stoploss', 50) || 50;
    const pair = document.getElementById('lot-pair').value;

    let riskAmount, riskPercent;
    if (mode === 'fixed') {
        riskAmount = num('lot-risk-fixed', 100);
        riskPercent = balance > 0 ? (riskAmount / balance) * 100 : 0;
    } else {
        riskPercent = num('lot-risk', 2);
        riskAmount = balance * (riskPercent / 100);
    }

    const pipSize = getPipSize(pair);
    // $ value of 1 pip on 1 standard lot ($10 on USD-quoted pairs; $1 Gold; $5 Silver; converted for crosses)
    const pipValuePerLot = getContractSize(pair) * pipSize * quoteToUSD(pair, SAMPLE_PRICES[pair]);

    const lotSize = riskAmount / (stopLoss * pipValuePerLot);
    const units = lotSize * getContractSize(pair);
    const actualPipValue = riskAmount / stopLoss;

    setText('lot-size-result', (isFinite(lotSize) ? lotSize.toFixed(2) : '0.00') + ' lots');
    setText('lot-risk-amount', formatCurrency(riskAmount));
    setText('lot-risk-pct', formatNumber(riskPercent) + '%');
    setText('lot-pip-value', formatCurrency(actualPipValue));
    setText('lot-units', formatNumber(units, 0) + (isMetal(pair) ? ' oz' : ''));
    setText('lot-mini-micro', isMetal(pair) ? '–' : formatNumber(lotSize * 10, 1) + ' / ' + formatNumber(lotSize * 100, 0));

    const info = document.getElementById('lot-info');
    if (info) {
        const warn = riskPercent > 2;
        info.classList.toggle('warn', warn);
        info.querySelector('i').className = warn ? 'fas fa-triangle-exclamation' : 'fas fa-info-circle';
        info.querySelector('span').textContent = warn
            ? 'You are risking ' + formatNumber(riskPercent) + '% of your account. Most traders keep risk at 1–2% per trade.'
            : 'Never risk more than 1–2% of your account on a single trade.' + (lotSize < 0.01 ? ' This size is below 0.01 lots — most brokers will not allow it.' : '');
    }
}

// === Leverage Calculator ===
function calculateLeverage() {
    const equity = num('lev-equity', 10000) || 10000;
    const lots = num('lev-lots', 1) || 1;
    const pair = document.getElementById('lev-pair').value;
    const price = num('lev-price', SAMPLE_PRICES[pair] || 1.1);

    const units = lots * getContractSize(pair);
    const positionValue = positionValueUSD(pair, units, price);
    const effectiveLeverage = positionValue / equity;

    // Required margin at 1:100 leverage
    const marginRequired = positionValue / 100;
    const freeMargin = equity - marginRequired;

    setText('lev-ratio', '1:' + formatNumber(effectiveLeverage));
    setText('lev-position-value', formatCurrency(positionValue));
    setText('lev-margin-required', formatCurrency(marginRequired));
    const fm = document.getElementById('lev-free-margin');
    if (fm) {
        fm.textContent = formatCurrency(freeMargin);
        fm.classList.toggle('loss', freeMargin < 0);
    }

    // Update leverage meter (scale 1-100)
    const meterPercent = Math.min((effectiveLeverage / 100) * 100, 100);
    document.getElementById('leverage-meter-fill').style.width = meterPercent + '%';
}

// === Margin Calculator ===
function calculateMargin() {
    const pair = document.getElementById('margin-pair').value;
    const lots = num('margin-lots', 1) || 1;
    const leverage = parseInt(document.getElementById('margin-leverage').value) || 100;
    const price = num('margin-price', SAMPLE_PRICES[pair] || 1.1);

    const units = lots * getContractSize(pair);
    const positionValue = positionValueUSD(pair, units, price);
    const requiredMargin = positionValue / leverage;
    const marginPercent = (1 / leverage) * 100;
    const marginPerPip = requiredMargin / (positionValue * getPipSize(pair));

    setText('margin-required', formatCurrency(requiredMargin));
    setText('margin-position', formatCurrency(positionValue));
    setText('margin-percent', marginPercent.toFixed(2) + '%');
    setText('margin-per-pip', formatCurrency(marginPerPip));
}

// === Pips Move (Profit / Loss) Calculator ===
function calculatePipsMove() {
    const pair = document.getElementById('move-pair').value;
    const direction = document.getElementById('move-direction').value;
    const entry = num('move-entry', 1.1000);
    const exit = num('move-exit', 1.1050);
    const lots = num('move-lots', 1) || 1;

    const pipSize = getPipSize(pair);
    const units = lots * getContractSize(pair);

    let pipsMoved;
    if (direction === 'buy') {
        pipsMoved = (exit - entry) / pipSize;
    } else {
        pipsMoved = (entry - exit) / pipSize;
    }

    const pipValue = pipValueUSD(pair, units, exit);
    const profitLoss = pipsMoved * pipValue;
    const priceChange = ((exit - entry) / entry) * 100;

    setText('move-pips', (pipsMoved < 0 ? '-' : '') + formatNumber(Math.abs(pipsMoved), 1) + ' pips');

    const plElement = document.getElementById('move-pl');
    const base = plElement.classList.contains('big') ? 'big result-value ' : 'result-value ';
    if (profitLoss >= 0) {
        plElement.textContent = '+' + formatCurrency(profitLoss);
        plElement.className = base + 'profit';
    } else {
        plElement.textContent = '-' + formatCurrency(Math.abs(profitLoss));
        plElement.className = base + 'loss';
    }

    setText('move-pip-val', formatCurrency(pipValue));
    setText('move-change', (priceChange >= 0 ? '+' : '') + priceChange.toFixed(4) + '%');

    // Quick scenarios for this pair and trade size
    const grid = document.getElementById('scenario-grid');
    if (grid) {
        grid.innerHTML = [10, 25, 50, 100].map(p =>
            `<div class="scenario"><span>${p} pips</span><span class="profit">${formatCurrency(p * pipValue)}</span></div>`
        ).join('');
        setText('scenario-title', `Quick scenarios (${formatNumber(lots)} lot${lots === 1 ? '' : 's'} ${pairLabel(pair)})`);
    }
}

// === Tab Switching (scoped per tab group: calculators / analysis) ===
function switchCalc(calc) {
    const tab = document.querySelector(`.calc-tab[data-calc="${calc}"]`);
    const panel = document.getElementById(`calc-${calc}`);
    if (!tab || !panel) return;
    const group = tab.closest('.calc-tabs').dataset.group;

    document.querySelectorAll(`.calc-tabs[data-group="${group}"] .calc-tab`).forEach(t => t.classList.remove('active'));
    document.querySelectorAll(`.calc-panel[data-group="${group}"]`).forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    panel.classList.add('active');
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });

    // Navigate to the owning view if needed (app.js)
    if (typeof showView === 'function') {
        const view = panel.closest('.view');
        if (view) showView(view.id.replace('view-', ''), calc, true);
    }
}

// Tab click handlers
document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => switchCalc(tab.dataset.calc));
});

// === Segmented controls → hidden selects ===
document.querySelectorAll('.seg[data-target]').forEach(seg => {
    const target = document.getElementById(seg.dataset.target);
    seg.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (target) {
                target.value = btn.dataset.value;
                target.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });
});
function setSeg(targetId, value) {
    const seg = document.querySelector(`.seg[data-target="${targetId}"]`);
    const target = document.getElementById(targetId);
    if (target) target.value = value;
    if (seg) seg.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.value === value));
}

// Risk mode toggle (position size)
(function () {
    const seg = document.getElementById('lot-risk-mode-seg');
    if (!seg) return;
    seg.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.value;
            document.getElementById('lot-risk-mode').value = mode;
            document.getElementById('lot-risk-percent-group').classList.toggle('hidden', mode !== 'percent');
            document.getElementById('lot-risk-fixed-group').classList.toggle('hidden', mode !== 'fixed');
            calculateLot();
        });
    });
})();

// === Live recalculation as the user types ===
document.querySelectorAll('[data-calc-fn]').forEach(form => {
    const fnName = form.dataset.calcFn;
    let t;
    const run = () => {
        clearTimeout(t);
        t = setTimeout(() => { if (typeof window[fnName] === 'function') window[fnName](); }, 120);
    };
    form.addEventListener('input', run);
    form.addEventListener('change', run);
});

// === Pair change: sync sample prices & recalculate ===
function bindPairSelect(selectId, recalcFn) {
    const select = document.getElementById(selectId);
    if (!select) return;
    let lastPair = select.value;
    select.addEventListener('change', () => {
        const oldPair = lastPair;
        const newPair = select.value;
        lastPair = newPair;
        if (oldPair === newPair || !recalcFn) return;
        recalcFn(oldPair, newPair);
    });
}

function syncPriceField(inputId, oldPair, newPair, pipsOffset) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const current = parseFloat(input.value);
    const oldSample = SAMPLE_PRICES[oldPair] + (pipsOffset ? pipsOffset * getPipSize(oldPair) : 0);
    // Leave custom user-entered prices untouched
    if (isNaN(current) || Math.abs(current - oldSample) > 1e-9) return;
    if (SAMPLE_PRICES[newPair] === undefined) return;
    const newSample = SAMPLE_PRICES[newPair] + (pipsOffset ? pipsOffset * getPipSize(newPair) : 0);
    input.value = newSample.toFixed(priceDecimals(newPair));
}

// Sync a group of price fields together (e.g. entry + exit): only replace
// them if ALL still hold their sample values, so a user-customized field
// can never end up mixed with a synced one.
function syncPriceFields(fields, oldPair, newPair) {
    const allPristine = fields.every(f => {
        const input = document.getElementById(f.id);
        if (!input) return false;
        const current = parseFloat(input.value);
        const sample = SAMPLE_PRICES[oldPair] + (f.pipsOffset ? f.pipsOffset * getPipSize(oldPair) : 0);
        return !isNaN(current) && Math.abs(current - sample) <= 1e-9;
    });
    if (!allPristine) return;
    fields.forEach(f => syncPriceField(f.id, oldPair, newPair, f.pipsOffset));
}

// Pip Calculator
bindPairSelect('pip-pair', (oldPair, newPair) => {
    syncPriceField('pip-price', oldPair, newPair);
    calculatePip();
});

// Lot Size Calculator (no price input)
bindPairSelect('lot-pair', () => calculateLot());

// Leverage Calculator
bindPairSelect('lev-pair', (oldPair, newPair) => {
    syncPriceField('lev-price', oldPair, newPair);
    calculateLeverage();
});

// Margin Calculator
bindPairSelect('margin-pair', (oldPair, newPair) => {
    syncPriceField('margin-price', oldPair, newPair);
    calculateMargin();
});

// Pips Move Calculator (entry + exit 50 pips higher, synced as a group)
bindPairSelect('move-pair', (oldPair, newPair) => {
    syncPriceFields([{ id: 'move-entry' }, { id: 'move-exit', pipsOffset: 50 }], oldPair, newPair);
    calculatePipsMove();
});

function recalcAll() {
    [calculatePip, calculateLot, calculateLeverage, calculateMargin, calculatePipsMove].forEach(fn => {
        try { fn(); } catch (e) { console.error(e); }
    });
    if (typeof calculateRR === 'function') { try { calculateRR(); } catch (e) { console.error(e); } }
}

// Run initial calculations immediately (DOM is already parsed — scripts are at the end of <body>)
recalcAll();
