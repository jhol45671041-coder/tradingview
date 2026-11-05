// === Additional trading tools ===
// Risk:Reward, Compounding, Drawdown recovery, Fibonacci, Pivot points, Currency converter,
// plus a tiny dependency-free SVG line chart used by the compounding tool and the journal.

// ---------- Shared: SVG line chart ----------
function drawLineChart(container, values, opts = {}) {
    if (typeof container === 'string') container = document.getElementById(container);
    if (!container) return;
    if (!values || values.length < 2) {
        container.innerHTML = `<div class="empty"><i class="fas fa-chart-line"></i>${opts.emptyText || 'Not enough data yet.'}</div>`;
        return;
    }
    const W = 600, H = opts.height || 180, padL = 8, padR = 8, padT = 12, padB = 18;
    let min = Math.min(...values), max = Math.max(...values);
    if (opts.includeZero) { min = Math.min(min, 0); max = Math.max(max, 0); }
    if (min === max) { min -= 1; max += 1; }
    const x = i => padL + (i / (values.length - 1)) * (W - padL - padR);
    const y = v => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    const baseY = opts.includeZero ? y(0) : H - padB;
    const area = `M${x(0).toFixed(1)},${baseY.toFixed(1)} L${pts.join(' L')} L${x(values.length - 1).toFixed(1)},${baseY.toFixed(1)} Z`;
    const fmt = opts.format || (v => formatCurrency(v));
    const zeroLine = opts.includeZero ? `<line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}" stroke-dasharray="4 4"/>` : '';
    const last = values[values.length - 1];
    const color = opts.colorBySign ? (last >= 0 ? 'var(--up)' : 'var(--down)') : '';
    container.innerHTML = `
        <svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${opts.label || 'Chart'}">
            <line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${padT}" y2="${padT}"/>
            <line class="grid-line" x1="${padL}" x2="${W - padR}" y1="${H - padB}" y2="${H - padB}"/>
            ${zeroLine}
            <path class="area" d="${area}" ${color ? `style="fill:${color};opacity:.12"` : ''}/>
            <polyline class="line" points="${pts.join(' ')}" vector-effect="non-scaling-stroke" ${color ? `style="stroke:${color}"` : ''}/>
        </svg>
        <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.72rem;color:var(--muted);margin-top:4px">
            <span>Low ${fmt(Math.min(...values))}</span><span>High ${fmt(Math.max(...values))}</span>
        </div>`;
}

// ---------- Risk : Reward ----------
function calculateRR() {
    const pair = document.getElementById('rr-pair').value;
    const dir = document.getElementById('rr-direction').value;
    const entry = num('rr-entry', 0);
    const sl = num('rr-sl', 0);
    const tp = num('rr-tp', 0);
    const lots = num('rr-lots', 1) || 1;
    const pipSize = getPipSize(pair);
    const units = lots * getContractSize(pair);

    const riskPips = (dir === 'buy' ? entry - sl : sl - entry) / pipSize;
    const rewardPips = (dir === 'buy' ? tp - entry : entry - tp) / pipSize;
    const pv = pipValueUSD(pair, units, entry);
    const riskUSD = riskPips * pv;
    const rewardUSD = rewardPips * pv;
    const info = document.getElementById('rr-info');

    if (riskPips <= 0 || rewardPips <= 0) {
        setText('rr-ratio', '–');
        setText('rr-risk-pips', formatNumber(riskPips, 1));
        setText('rr-reward-pips', formatNumber(rewardPips, 1));
        setText('rr-risk-usd', '–');
        setText('rr-reward-usd', '–');
        setText('rr-breakeven', '–');
        info.classList.add('warn');
        info.querySelector('span').textContent = dir === 'buy'
            ? 'For a buy, the stop loss must be below entry and the take profit above it.'
            : 'For a sell, the stop loss must be above entry and the take profit below it.';
        return;
    }

    const rr = rewardPips / riskPips;
    const breakeven = 100 / (1 + rr);
    setText('rr-ratio', '1 : ' + formatNumber(rr));
    setText('rr-risk-pips', formatNumber(riskPips, 1));
    setText('rr-reward-pips', formatNumber(rewardPips, 1));
    setText('rr-risk-usd', formatCurrency(riskUSD));
    setText('rr-reward-usd', formatCurrency(rewardUSD));
    setText('rr-breakeven', formatNumber(breakeven, 1) + '%');
    const riskW = 100 / (1 + rr);
    document.getElementById('rr-bar-risk').style.width = riskW + '%';
    document.getElementById('rr-bar-reward').style.width = (100 - riskW) + '%';

    info.classList.toggle('warn', rr < 1);
    info.querySelector('span').textContent = rr < 1
        ? 'Reward is smaller than risk — you need to win more than ' + formatNumber(breakeven, 0) + '% of trades just to break even.'
        : 'You need to win at least ' + formatNumber(breakeven, 1) + '% of trades like this to break even. Many traders look for at least 1:2.';
}

// Sync R:R sample prices when the pair changes (only if untouched)
(function () {
    const select = document.getElementById('rr-pair');
    if (!select) return;
    let last = select.value;
    select.addEventListener('change', () => {
        const oldPair = last, newPair = select.value;
        last = newPair;
        syncPriceFields([
            { id: 'rr-entry' },
            { id: 'rr-sl', pipsOffset: -30 },
            { id: 'rr-tp', pipsOffset: 90 }
        ], oldPair, newPair);
        calculateRR();
    });
})();

// ---------- Compounding ----------
function calculateCompound() {
    const start = Math.max(0, num('cmp-start', 1000));
    const rate = num('cmp-rate', 5) / 100;
    const periods = Math.min(1000, Math.max(1, Math.round(num('cmp-periods', 12))));
    const deposit = Math.max(0, num('cmp-deposit', 0));
    const unit = document.getElementById('cmp-unit').value;
    const unitLabel = String(unit).replace(/[^A-Za-z ]/g, '').slice(0, 20);

    let bal = start;
    const series = [start];
    const rows = [];
    for (let i = 1; i <= periods; i++) {
        const s = bal;
        const gain = s * rate;
        bal = s + gain + deposit;
        series.push(bal);
        rows.push(`<tr><td>${unitLabel} ${i}</td><td class="num">${formatCurrency(s)}</td><td class="num ${gain >= 0 ? 'up' : 'down'}">${formatCurrency(gain)}</td><td class="num">${formatCurrency(deposit)}</td><td class="num">${formatCurrency(bal)}</td></tr>`);
    }
    const deposits = deposit * periods;
    const profit = bal - start - deposits;
    const invested = start + deposits;

    setText('cmp-final', formatCurrency(bal));
    const p = document.getElementById('cmp-profit');
    p.textContent = formatCurrency(profit);
    p.className = 'result-value ' + (profit >= 0 ? 'profit' : 'loss');
    setText('cmp-deposits', formatCurrency(deposits));
    setText('cmp-return', invested > 0 ? formatNumber((profit / invested) * 100) + '%' : '–');
    document.getElementById('cmp-table').innerHTML = rows.join('');
    drawLineChart('cmp-chart', series, { label: 'Balance growth' });
}

// ---------- Drawdown recovery ----------
function recoveryNeeded(ddPct) {
    if (ddPct >= 100) return Infinity;
    return (1 / (1 - ddPct / 100) - 1) * 100;
}

function calculateDrawdown() {
    const balance = Math.max(0, num('dd-balance', 10000));
    const dd = Math.min(99.9, Math.max(0, num('dd-pct', 20)));
    const rate = Math.max(0.01, num('dd-rate', 2));
    const need = recoveryNeeded(dd);
    const after = balance * (1 - dd / 100);
    const periods = dd > 0 ? Math.ceil(Math.log(1 / (1 - dd / 100)) / Math.log(1 + rate / 100)) : 0;

    setText('dd-needed', formatNumber(need) + '%');
    setText('dd-after', formatCurrency(after));
    setText('dd-lost', formatCurrency(balance - after));
    setText('dd-periods', isFinite(periods) ? String(periods) : '–');
}

function renderDrawdownTable() {
    const levels = [5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 75, 80, 90];
    document.getElementById('dd-table').innerHTML = levels.map(l => {
        const need = recoveryNeeded(l);
        const w = Math.min(100, need / 9); // 900% = full bar
        const color = need < 25 ? 'var(--up)' : need < 70 ? 'var(--amber)' : 'var(--down)';
        return `<tr><td class="mono">-${l}%</td><td class="num">+${formatNumber(need, need >= 100 ? 0 : 2)}%</td>
            <td><div class="meter-bar"><div style="height:100%;width:${w}%;background:${color};border-radius:999px"></div></div></td></tr>`;
    }).join('');
}

// ---------- Fibonacci ----------
const FIB_RETRACE = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_EXT = [1.272, 1.414, 1.618, 2, 2.618];

function calculateFib() {
    let high = num('fib-high', 0), low = num('fib-low', 0);
    if (high < low) { const t = high; high = low; low = t; }
    const trend = document.getElementById('fib-trend').value;
    const d = parseInt(document.getElementById('fib-decimals').value) || 5;
    const range = high - low;

    // Uptrend: retracements measured down from the high; extensions projected above the high.
    // Downtrend: retracements measured up from the low; extensions projected below the low.
    const retr = FIB_RETRACE.map(r => ({
        r, price: trend === 'up' ? high - range * r : low + range * r
    }));
    const ext = FIB_EXT.map(e => ({
        r: e, price: trend === 'up' ? low + range * e : high - range * e
    }));
    const key = [0.382, 0.5, 0.618];
    const rung = (o, isExt) => `
        <div class="rung ${key.includes(o.r) ? 'key' : ''}">
            <span class="tag" style="color:${isExt ? 'var(--blue)' : key.includes(o.r) ? 'var(--accent)' : 'var(--text-2)'}">${(o.r * 100).toFixed(1)}%</span>
            <span class="bar"><span style="width:${Math.min(100, (o.r / (isExt ? 2.618 : 1)) * 100)}%;${isExt ? 'background:var(--blue)' : ''}"></span></span>
            <span class="val">${o.price.toFixed(d)}</span>
        </div>`;
    document.getElementById('fib-retrace').innerHTML = (range > 0)
        ? retr.map(o => rung(o, false)).join('')
        : '<div class="empty">Swing high and low must be different.</div>';
    document.getElementById('fib-ext').innerHTML = (range > 0) ? ext.map(o => rung(o, true)).join('') : '';
}

// ---------- Pivot points ----------
function pivotSets(H, L, C) {
    const R = H - L;
    const P = (H + L + C) / 3;
    const classic = { R3: H + 2 * (P - L), R2: P + R, R1: 2 * P - L, P, S1: 2 * P - H, S2: P - R, S3: L - 2 * (H - P) };
    const fibonacci = { R3: P + R, R2: P + 0.618 * R, R1: P + 0.382 * R, P, S1: P - 0.382 * R, S2: P - 0.618 * R, S3: P - R };
    const camarilla = {
        R4: C + R * 1.1 / 2, R3: C + R * 1.1 / 4, R2: C + R * 1.1 / 6, R1: C + R * 1.1 / 12, P,
        S1: C - R * 1.1 / 12, S2: C - R * 1.1 / 6, S3: C - R * 1.1 / 4, S4: C - R * 1.1 / 2
    };
    const WP = (H + L + 2 * C) / 4;
    const woodie = { R2: WP + R, R1: 2 * WP - L, P: WP, S1: 2 * WP - H, S2: WP - R };
    return { classic, fibonacci, camarilla, woodie };
}

function calculatePivots() {
    const H = num('pv-high', 0), L = num('pv-low', 0), C = num('pv-close', 0);
    const d = parseInt(document.getElementById('pv-decimals').value) || 5;
    const method = document.getElementById('pv-method').value;
    const sets = pivotSets(Math.max(H, L), Math.min(H, L), C);
    const names = { classic: 'Classic', fibonacci: 'Fibonacci', camarilla: 'Camarilla', woodie: 'Woodie' };
    setText('pv-ladder-title', names[method] + ' pivots');

    const set = sets[method];
    document.getElementById('pv-ladder').innerHTML = Object.keys(set).map(k => {
        const cls = k === 'P' ? 'p' : k[0] === 'R' ? 'r' : 's';
        const label = k === 'P' ? 'Pivot' : (k[0] === 'R' ? 'R' : 'S') + k.slice(1);
        return `<div class="rung ${cls}"><span class="tag">${label}</span><span></span><span class="val">${set[k].toFixed(d)}</span></div>`;
    }).join('');

    const order = ['R4', 'R3', 'R2', 'R1', 'P', 'S1', 'S2', 'S3', 'S4'];
    document.getElementById('pv-table').innerHTML = order.map(k => {
        const cell = m => sets[m][k] !== undefined ? sets[m][k].toFixed(d) : '<span class="muted">–</span>';
        const color = k === 'P' ? 'var(--amber)' : k[0] === 'R' ? 'var(--down)' : 'var(--up)';
        return `<tr><td class="mono" style="color:${color};font-weight:700">${k === 'P' ? 'Pivot' : k}</td>
            <td class="num">${cell('classic')}</td><td class="num">${cell('fibonacci')}</td><td class="num">${cell('camarilla')}</td><td class="num">${cell('woodie')}</td></tr>`;
    }).join('');
}

// ---------- Currency converter (free, no API key) ----------
const FX_API = 'https://open.er-api.com/v6/latest/USD';
const FX_CACHE_KEY = 'fpc-fx-rates';
const FX_POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'PKR', 'AED', 'SAR', 'INR', 'CNY', 'HKD', 'SGD', 'TRY', 'ZAR', 'MXN', 'SEK', 'NOK', 'DKK', 'PLN', 'KWD', 'QAR', 'BDT', 'MYR', 'THB', 'KRW', 'BRL', 'RUB'];
let fxRates = null;
// Only accept 3-letter currency codes with positive numeric rates (API/cache data goes into <option> markup)
function cleanRates(r) {
    if (!r || typeof r !== 'object') return null;
    const out = {};
    for (const k of Object.keys(r)) if (/^[A-Z]{3}$/.test(k) && typeof r[k] === 'number' && isFinite(r[k]) && r[k] > 0) out[k] = r[k];
    return Object.keys(out).length ? out : null;
}
let fxUpdated = null;

function fillConverterSelects() {
    const from = document.getElementById('cv-from');
    const to = document.getElementById('cv-to');
    const codes = fxRates ? Object.keys(fxRates) : FX_POPULAR;
    const popular = FX_POPULAR.filter(c => codes.includes(c));
    const others = codes.filter(c => !FX_POPULAR.includes(c)).sort();
    const html = `<optgroup label="Popular">${popular.map(c => `<option value="${c}">${c}</option>`).join('')}</optgroup>` +
        (others.length ? `<optgroup label="All currencies">${others.map(c => `<option value="${c}">${c}</option>`).join('')}</optgroup>` : '');
    const fv = from.value || 'USD', tv = to.value || 'PKR';
    from.innerHTML = html; to.innerHTML = html;
    from.value = codes.includes(fv) ? fv : 'USD';
    to.value = codes.includes(tv) ? tv : (codes.includes('PKR') ? 'PKR' : 'EUR');
}

function convertCurrency() {
    if (!fxRates) {
        setText('cv-result', '–');
        return;
    }
    const amt = num('cv-amount', 0);
    const f = document.getElementById('cv-from').value;
    const t = document.getElementById('cv-to').value;
    const rate = fxRates[t] / fxRates[f];
    const out = amt * rate;
    setText('cv-label', `${formatNumber(amt)} ${f} =`);
    setText('cv-result', formatNumber(out, out < 1 ? 6 : 2) + ' ' + t);
    setText('cv-rate', `1 ${f} = ${formatNumber(rate, rate < 1 ? 6 : 4)} ${t}`);
    setText('cv-inverse', `1 ${t} = ${formatNumber(1 / rate, 1 / rate < 1 ? 6 : 4)} ${f}`);
    setText('cv-updated', fxUpdated ? new Date(fxUpdated).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' }) + ' PKT' : '–');
}

async function loadFxRates(force) {
    try {
        if (!force) {
            const cached = JSON.parse(localStorage.getItem(FX_CACHE_KEY) || 'null');
            if (cached && cleanRates(cached.rates) && Date.now() - cached.fetched < 6 * 3600 * 1000) {
                fxRates = cleanRates(cached.rates); fxUpdated = Number(cached.updated) || null;
                onFxReady();
                return;
            }
        }
    } catch (e) { /* ignore bad cache */ }

    setText('cv-updated', 'Loading…');
    try {
        const res = await fetch(FX_API, { cache: 'no-store' });
        const data = await res.json();
        if (data.result !== 'success' || !cleanRates(data.rates)) throw new Error('Bad response');
        fxRates = cleanRates(data.rates);
        fxUpdated = Number(data.time_last_update_unix) * 1000 || null;
        try { localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ rates: fxRates, updated: fxUpdated, fetched: Date.now() })); } catch (e) {}
        onFxReady();
        if (force && typeof toast === 'function') toast('Exchange rates updated');
    } catch (e) {
        console.warn('FX rates unavailable:', e);
        setText('cv-updated', 'Unavailable — check your connection');
        setText('cv-result', 'Rates offline');
    }
}

function onFxReady() {
    fillConverterSelects();
    convertCurrency();
    if (typeof setLiveUsdRates === 'function') setLiveUsdRates(fxRates);
}

// ---------- Wire up ----------
(function initTools() {
    fillConverterSelects();
    ['cv-amount', 'cv-from', 'cv-to'].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', convertCurrency);
        el.addEventListener('change', convertCurrency);
    });
    document.getElementById('cv-swap').addEventListener('click', () => {
        const f = document.getElementById('cv-from'), t = document.getElementById('cv-to');
        const tmp = f.value; f.value = t.value; t.value = tmp;
        convertCurrency();
    });
    document.getElementById('cv-refresh').addEventListener('click', () => loadFxRates(true));

    renderDrawdownTable();
    [calculateRR, calculateCompound, calculateDrawdown, calculateFib, calculatePivots].forEach(fn => {
        try { fn(); } catch (e) { console.error(e); }
    });
    loadFxRates(false);
})();
