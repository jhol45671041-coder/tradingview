// === Forex Market Session Clock ===
// Sessions are defined in each centre's own local business hours, so daylight-saving
// changes in Sydney, London and New York are handled automatically by the browser's Intl API.

const PKT_TZ = 'Asia/Karachi';
const LOCAL_TZ = (Intl.DateTimeFormat().resolvedOptions().timeZone) || PKT_TZ;

const SESSIONS = [
    { id: 'sydney',  name: 'Sydney',   flag: '🇦🇺', tz: 'Australia/Sydney', open: 7, close: 16 },
    { id: 'tokyo',   name: 'Tokyo',    flag: '🇯🇵', tz: 'Asia/Tokyo',       open: 9, close: 18 },
    { id: 'london',  name: 'London',   flag: '🇬🇧', tz: 'Europe/London',    open: 8, close: 17 },
    { id: 'newyork', name: 'New York', flag: '🇺🇸', tz: 'America/New_York', open: 8, close: 17 }
];
const OVERLAPS = [
    { a: 'sydney', b: 'tokyo',   name: 'Sydney + Tokyo',   note: 'AUD, NZD and JPY pairs' },
    { a: 'tokyo',  b: 'london',  name: 'Tokyo + London',   note: 'EUR/JPY, GBP/JPY' },
    { a: 'london', b: 'newyork', name: 'London + New York', note: 'Busiest window of the day — majors and gold' }
];

let sessionDisplayTz = PKT_TZ;

// ---------- Time-zone helpers ----------
const _fmtCache = {};
function zoneParts(date, tz) {
    if (!_fmtCache[tz]) {
        _fmtCache[tz] = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, hourCycle: 'h23', weekday: 'short',
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
    const o = {};
    _fmtCache[tz].formatToParts(date).forEach(p => { o[p.type] = p.value; });
    const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday];
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second, wd };
}

function zoneOffsetMs(date, tz) {
    const p = zoneParts(date, tz);
    const asUTC = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
    return asUTC - Math.floor(date.getTime() / 1000) * 1000;
}

// Wall-clock time in a zone → UTC epoch ms
function zonedToUtc(y, m, d, h, mi, tz) {
    const guess = Date.UTC(y, m - 1, d, h, mi);
    let ts = guess - zoneOffsetMs(new Date(guess), tz);
    ts = guess - zoneOffsetMs(new Date(ts), tz); // second pass for DST edges
    return ts;
}

function addDays(y, m, d, n) {
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), wd: t.getUTCDay() };
}

function fmtTime(ts, tz, withSeconds) {
    return new Date(ts).toLocaleTimeString('en-GB', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', second: withSeconds ? '2-digit' : undefined, hour12: false
    });
}

function fmtDay(ts, tz) {
    return new Date(ts).toLocaleDateString('en-GB', { timeZone: tz, weekday: 'short' });
}

function fmtDuration(ms) {
    const mins = Math.max(0, Math.round(ms / 60000));
    const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
    if (d) return `${d}d ${h}h`;
    if (h) return `${h}h ${m}m`;
    return `${m}m`;
}

function tzShortName(tz) {
    if (tz === PKT_TZ) return 'PKT';
    try {
        const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date());
        const n = p.find(x => x.type === 'timeZoneName');
        return n ? n.value : tz;
    } catch (e) { return tz; }
}

// ---------- Market-wide open/closed (Fri 17:00 → Sun 17:00 New York) ----------
function isForexMarketOpen(now) {
    const p = zoneParts(now, 'America/New_York');
    if (p.wd === 6) return false;
    if (p.wd === 5 && p.h >= 17) return false;
    if (p.wd === 0 && p.h < 17) return false;
    return true;
}

function nextMarketOpen(now) {
    const p = zoneParts(now, 'America/New_York');
    const daysToSun = (7 - p.wd) % 7;
    const sun = addDays(p.y, p.m, p.d, daysToSun);
    return zonedToUtc(sun.y, sun.m, sun.d, 17, 0, 'America/New_York');
}

function nextMarketClose(now) {
    const p = zoneParts(now, 'America/New_York');
    const daysToFri = (5 - p.wd + 7) % 7;
    const fri = addDays(p.y, p.m, p.d, daysToFri);
    return zonedToUtc(fri.y, fri.m, fri.d, 17, 0, 'America/New_York');
}

// Session instances (open/close UTC) for local days around now
function sessionInstances(sess, now, fromDay = -1, toDay = 2) {
    const p = zoneParts(now, sess.tz);
    const out = [];
    for (let i = fromDay; i <= toDay; i++) {
        const day = addDays(p.y, p.m, p.d, i);
        out.push({
            start: zonedToUtc(day.y, day.m, day.d, sess.open, 0, sess.tz),
            end: zonedToUtc(day.y, day.m, day.d, sess.close, 0, sess.tz),
            weekday: day.wd
        });
    }
    return out;
}

function sessionStatus(sess, now) {
    const t = now.getTime();
    const marketOpen = isForexMarketOpen(now);
    const inst = sessionInstances(sess, now, -1, 9).filter(x => x.weekday >= 1 && x.weekday <= 5);
    const current = inst.find(x => t >= x.start && t < x.end);
    if (current && marketOpen) {
        return { open: true, until: current.end, start: current.start, end: current.end };
    }
    // Next trading-day open (clamped to the weekly market reopen)
    const reopen = marketOpen ? t : nextMarketOpen(now);
    const next = inst.find(x => x.end > Math.max(t, reopen));
    if (!next) return { open: false };
    const start = Math.max(next.start, reopen);
    return { open: false, until: start, start, end: next.end };
}

// ---------- Rendering ----------
function renderSessionCards(container, now, compact) {
    if (!container) return 0;
    let openCount = 0;
    container.innerHTML = SESSIONS.map(s => {
        const st = sessionStatus(s, now);
        if (st.open) openCount++;
        const tz = sessionDisplayTz;
        const hours = st.start ? `${fmtTime(st.start, tz)} – ${fmtTime(st.end, tz)} ${tzShortName(tz)}` : '';
        const localNow = fmtTime(now.getTime(), s.tz);
        const cd = st.until ? (st.open ? 'Closes in ' : 'Opens in ') + fmtDuration(st.until - now.getTime()) : '';
        return `
            <div class="session ${st.open ? 'open' : ''}">
                <div class="flag">${s.flag}</div>
                <div>
                    <div class="name">${s.name} <span class="muted" style="font-weight:500;font-size:.78rem">· ${localNow} local</span></div>
                    <div class="meta">${hours}</div>
                </div>
                <div style="text-align:right">
                    <span class="status">${st.open ? 'Open' : 'Closed'}</span>
                    ${compact ? '' : `<div class="countdown">${cd}</div>`}
                </div>
            </div>`;
    }).join('');
    return openCount;
}

function renderOverlaps(now) {
    const el = document.getElementById('sess-overlaps');
    if (!el) return;
    const t = now.getTime();
    const tz = sessionDisplayTz;
    el.innerHTML = OVERLAPS.map(o => {
        const A = SESSIONS.find(s => s.id === o.a), B = SESSIONS.find(s => s.id === o.b);
        const ia = sessionInstances(A, now, -1, 9).filter(x => x.weekday >= 1 && x.weekday <= 5);
        const ib = sessionInstances(B, now, -1, 9).filter(x => x.weekday >= 1 && x.weekday <= 5);
        const ints = [];
        ia.forEach(a => ib.forEach(b => {
            const s = Math.max(a.start, b.start), e = Math.min(a.end, b.end);
            if (e > s) ints.push({ s, e });
        }));
        ints.sort((x, y) => x.s - y.s);
        const marketOpen = isForexMarketOpen(now);
        const reopen = marketOpen ? t : nextMarketOpen(now);
        const next = ints.find(x => x.e > Math.max(t, reopen));
        let status = '<span class="pill">No overlap</span>', range = '–';
        if (next) {
            range = `${fmtDay(next.s, tz)} ${fmtTime(next.s, tz)} – ${fmtTime(next.e, tz)} ${tzShortName(tz)}`;
            const active = marketOpen && t >= next.s && t < next.e;
            status = active
                ? `<span class="pill up">Active · ${fmtDuration(next.e - t)} left</span>`
                : `<span class="pill">in ${fmtDuration(Math.max(next.s, reopen) - t)}</span>`;
        }
        return `<div class="overlap-item"><div><b>${o.name}</b><div class="muted" style="font-size:.78rem">${o.note}</div><div class="mono" style="font-size:.8rem;color:var(--text-2)">${range}</div></div><div>${status}</div></div>`;
    }).join('');
}

function renderTimeline(now) {
    const el = document.getElementById('sess-timeline');
    if (!el) return;
    const tz = sessionDisplayTz;
    const p = zoneParts(now, tz);
    const dayStart = zonedToUtc(p.y, p.m, p.d, 0, 0, tz);
    const dayEnd = dayStart + 24 * 3600 * 1000;
    const span = dayEnd - dayStart;
    const pct = ts => ((ts - dayStart) / span) * 100;

    const rows = SESSIONS.map(s => {
        const segs = sessionInstances(s, now, -1, 1)
            .map(x => ({ s: Math.max(x.start, dayStart), e: Math.min(x.end, dayEnd) }))
            .filter(x => x.e > x.s)
            .map(x => `<div class="tl-seg ${s.id}" style="left:${pct(x.s)}%;width:${pct(x.e) - pct(x.s)}%" title="${s.name} ${fmtTime(x.s, tz)}–${fmtTime(x.e, tz)}"></div>`)
            .join('');
        return `<div class="tl-row"><div class="tl-label">${s.flag} ${s.name}</div><div class="tl-track">${segs}</div></div>`;
    }).join('');

    const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => `<span style="left:${(h / 24) * 100}%">${String(h % 24).padStart(2, '0')}</span>`).join('');
    const nowPct = pct(now.getTime());
    el.innerHTML = `
        <div style="position:relative">
            ${rows}
            <div class="tl-axis"><div></div><div class="tl-ticks">${ticks}</div></div>
            <div style="position:absolute;left:92px;right:0;top:0;bottom:0;pointer-events:none">
                <div class="tl-now" style="left:${nowPct}%"></div>
            </div>
        </div>`;
    setText('tl-zone-label', tz === PKT_TZ ? 'Pakistan time (PKT)' : 'Your time (' + tzShortName(tz) + ')');
}

function tickSessions() {
    const now = new Date();
    const pktTime = fmtTime(now.getTime(), PKT_TZ, true);
    const marketOpen = isForexMarketOpen(now);

    setText('top-clock', pktTime);
    const dot = document.getElementById('top-market-dot');
    if (dot) {
        dot.classList.toggle('on', marketOpen);
        dot.parentElement.title = 'Forex market ' + (marketOpen ? 'open' : 'closed') + ' · Pakistan Standard Time';
    }
    setText('kpi-pkt', fmtTime(now.getTime(), PKT_TZ));
    const km = document.getElementById('kpi-market');
    if (km) { km.textContent = marketOpen ? 'Open' : 'Closed'; km.className = 'v ' + (marketOpen ? 'up' : 'down'); }

    setText('sess-pkt-clock', pktTime);
    setText('sess-pkt-date', new Date().toLocaleDateString('en-GB', { timeZone: PKT_TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · PKT (UTC+5)');
    if (LOCAL_TZ !== PKT_TZ) {
        setText('sess-local-clock', 'Your time: ' + fmtTime(now.getTime(), LOCAL_TZ, true) + ' ' + tzShortName(LOCAL_TZ));
    }
    const pill = document.getElementById('sess-market-pill');
    if (pill) {
        pill.className = 'pill ' + (marketOpen ? 'up' : 'down');
        pill.textContent = marketOpen
            ? 'Market open · closes in ' + fmtDuration(nextMarketClose(now) - now.getTime())
            : 'Market closed · opens in ' + fmtDuration(nextMarketOpen(now) - now.getTime());
    }

    const openCount = renderSessionCards(document.getElementById('sess-list'), now, false);
    renderSessionCards(document.getElementById('dash-sessions'), now, false);
    setText('kpi-sessions', openCount + ' / 4');
    setText('nav-open-count', openCount + ' open');

    // Heavier pieces: refresh every 30 s (or on first run)
    if (!tickSessions._last || now - tickSessions._last > 30000) {
        tickSessions._last = now;
        renderOverlaps(now);
        renderTimeline(now);
    }
}

(function initSessions() {
    const seg = document.getElementById('sess-tz-seg');
    if (seg) {
        if (LOCAL_TZ === PKT_TZ) seg.querySelector('[data-value="local"]').textContent = 'My time (PKT)';
        seg.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                sessionDisplayTz = btn.dataset.value === 'local' ? LOCAL_TZ : PKT_TZ;
                tickSessions._last = null;
                tickSessions();
            });
        });
    }
    tickSessions();
    setInterval(tickSessions, 1000);
})();
