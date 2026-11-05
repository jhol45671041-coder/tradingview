// === Trading Journal (stored in this browser's localStorage) ===

const JOURNAL_KEY = 'fpc-journal-v1';
let journal = [];

// Validate every stored trade so tampered/old storage can never inject markup or break rendering
function cleanTrade(t) {
    if (!t || typeof t !== 'object') return null;
    const num = v => (typeof v === 'number' && isFinite(v)) ? v : (v == null || v === '' ? null : (isFinite(parseFloat(v)) ? parseFloat(v) : null));
    const entry = num(t.entry), exit = num(t.exit);
    if (entry == null || exit == null) return null;
    return {
        id: /^[a-z0-9]{1,40}$/i.test(String(t.id)) ? String(t.id) : Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        created: num(t.created) || Date.now(),
        date: /^\d{4}-\d{2}-\d{2}$/.test(String(t.date)) ? String(t.date) : new Date().toLocaleDateString('en-CA'),
        pair: String(t.pair || 'EURUSD').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12) || 'EURUSD',
        dir: t.dir === 'sell' ? 'sell' : 'buy',
        lots: num(t.lots) || 0.01,
        entry, exit, sl: num(t.sl), tp: num(t.tp),
        notes: String(t.notes == null ? '' : t.notes).slice(0, 2000),
        plAuto: !!t.plAuto,
        pl: num(t.pl) || 0
    };
}
function loadJournal() {
    try { const raw = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]'); journal = Array.isArray(raw) ? raw.map(cleanTrade).filter(Boolean) : []; }
    catch (e) { journal = []; }
}
function saveJournal() {
    try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal)); }
    catch (e) { if (typeof toast === 'function') toast('Could not save — browser storage is full or blocked'); }
}

function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function tradePips(t) {
    const pip = getPipSize(t.pair);
    const diff = t.dir === 'sell' ? t.entry - t.exit : t.exit - t.entry;
    return diff / pip;
}

function autoPL(t) {
    return tradePips(t) * pipValueUSD(t.pair, t.lots * getContractSize(t.pair), t.exit);
}

function sortedTrades() {
    return journal.slice().sort((a, b) => (a.date === b.date ? a.created - b.created : a.date < b.date ? -1 : 1));
}

function journalStats() {
    const trades = journal;
    const wins = trades.filter(t => t.pl > 0), losses = trades.filter(t => t.pl < 0);
    const grossWin = wins.reduce((s, t) => s + t.pl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pl, 0));
    return {
        total: trades.length,
        wins: wins.length,
        losses: losses.length,
        winRate: trades.length ? (wins.length / trades.length) * 100 : null,
        pl: trades.reduce((s, t) => s + t.pl, 0),
        pf: grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? Infinity : null),
        avgWin: wins.length ? grossWin / wins.length : null,
        avgLoss: losses.length ? -grossLoss / losses.length : null
    };
}

function renderJournal() {
    const body = document.getElementById('j-body');
    const trades = sortedTrades();
    const st = journalStats();

    setText('j-total', String(st.total));
    setText('j-winrate', st.winRate == null ? '–' : formatNumber(st.winRate, 1) + '%');
    const pl = document.getElementById('j-pl');
    pl.textContent = (st.pl > 0 ? '+' : '') + formatCurrency(st.pl);
    pl.className = 'v ' + (st.pl > 0 ? 'up' : st.pl < 0 ? 'down' : '');
    setText('j-pf', st.pf == null ? '–' : st.pf === Infinity ? '∞' : formatNumber(st.pf));
    setText('j-avgwin', st.avgWin == null ? '–' : formatCurrency(st.avgWin));
    setText('j-avgloss', st.avgLoss == null ? '–' : formatCurrency(st.avgLoss));
    setText('kpi-winrate', st.winRate == null ? 'No trades' : formatNumber(st.winRate, 0) + '% (' + st.total + ')');

    if (!trades.length) {
        body.innerHTML = '<tr><td colspan="10"><div class="empty"><i class="fas fa-book-open"></i>No trades yet. Click <b>Add trade</b> to log your first one.</div></td></tr>';
    } else {
        body.innerHTML = trades.slice().reverse().map(t => {
            const dec = priceDecimals(t.pair);
            const pips = tradePips(t);
            return `<tr>
                <td class="mono">${escapeHtml(t.date)}</td>
                <td class="mono"><b>${escapeHtml(pairLabel(t.pair))}</b></td>
                <td><span class="dir-tag ${t.dir === 'sell' ? 'sell' : 'buy'}">${t.dir === 'sell' ? 'sell' : 'buy'}</span></td>
                <td class="num">${formatNumber(t.lots)}</td>
                <td class="num">${Number(t.entry).toFixed(dec)}</td>
                <td class="num">${Number(t.exit).toFixed(dec)}</td>
                <td class="num ${pips >= 0 ? 'up' : 'down'}">${formatNumber(pips, 1)}</td>
                <td class="num ${t.pl >= 0 ? 'up' : 'down'}"><b>${(t.pl > 0 ? '+' : '') + formatCurrency(t.pl)}</b></td>
                <td class="note-cell" title="${escapeHtml(t.notes)}">${escapeHtml(t.notes) || '<span class="muted">–</span>'}</td>
                <td><div class="row-actions">
                    <button type="button" aria-label="Edit trade" title="Edit" data-edit="${escapeHtml(t.id)}"><i class="fas fa-pen"></i></button>
                    <button type="button" class="del" aria-label="Delete trade" title="Delete" data-del="${escapeHtml(t.id)}"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`;
        }).join('');
    }

    // Equity curve
    let cum = 0;
    const series = [0].concat(trades.map(t => (cum += t.pl)));
    drawLineChart('j-chart', series, { includeZero: true, colorBySign: true, label: 'Equity curve', emptyText: 'Add trades to see your equity curve.' });
    if (trades.length < 1) document.getElementById('j-chart').innerHTML = '<div class="empty"><i class="fas fa-chart-line"></i>Add trades to see your equity curve.</div>';
}

// ---------- Modal ----------
function openTradeModal(id) {
    const t = id ? journal.find(x => x.id === id) : null;
    document.getElementById('j-modal-title').textContent = t ? 'Edit trade' : 'Add trade';
    document.getElementById('jf-id').value = t ? t.id : '';
    document.getElementById('jf-date').value = t ? t.date : new Date().toLocaleDateString('en-CA');
    document.getElementById('jf-pair').value = t ? t.pair : 'EURUSD';
    setSeg('jf-dir', t ? t.dir : 'buy');
    document.getElementById('jf-lots').value = t ? t.lots : '0.10';
    document.getElementById('jf-entry').value = t ? t.entry : '';
    document.getElementById('jf-exit').value = t ? t.exit : '';
    document.getElementById('jf-sl').value = t && t.sl != null ? t.sl : '';
    document.getElementById('jf-tp').value = t && t.tp != null ? t.tp : '';
    document.getElementById('jf-pl').value = t && !t.plAuto ? t.pl : '';
    document.getElementById('jf-notes').value = t ? t.notes || '' : '';
    document.getElementById('j-modal').classList.add('show');
    setTimeout(() => document.getElementById('jf-entry').focus(), 50);
}

function closeTradeModal() {
    document.getElementById('j-modal').classList.remove('show');
}

function optNum(id) {
    const v = parseFloat(document.getElementById(id).value);
    return isNaN(v) ? null : v;
}

function saveTradeFromForm(e) {
    e.preventDefault();
    const id = document.getElementById('jf-id').value;
    const t = {
        id: id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
        created: id ? (journal.find(x => x.id === id) || {}).created || Date.now() : Date.now(),
        date: document.getElementById('jf-date').value,
        pair: document.getElementById('jf-pair').value,
        dir: document.getElementById('jf-dir').value,
        lots: optNum('jf-lots') || 0.01,
        entry: optNum('jf-entry'),
        exit: optNum('jf-exit'),
        sl: optNum('jf-sl'),
        tp: optNum('jf-tp'),
        notes: document.getElementById('jf-notes').value.trim().slice(0, 2000)
    };
    if (t.entry == null || t.exit == null) { toast('Enter both entry and exit prices'); return; }
    const manual = optNum('jf-pl');
    t.plAuto = manual == null;
    t.pl = manual == null ? Math.round(autoPL(t) * 100) / 100 : manual;

    const idx = journal.findIndex(x => x.id === t.id);
    if (idx >= 0) journal[idx] = t; else journal.push(t);
    saveJournal();
    renderJournal();
    closeTradeModal();
    toast(idx >= 0 ? 'Trade updated' : 'Trade added');
}

function deleteTrade(id) {
    const t = journal.find(x => x.id === id);
    if (!t) return;
    if (!confirm(`Delete this ${pairLabel(t.pair)} ${t.dir} trade from ${t.date}?`)) return;
    journal = journal.filter(x => x.id !== id);
    saveJournal();
    renderJournal();
    toast('Trade deleted');
}

// ---------- CSV ----------
const CSV_COLS = ['date', 'pair', 'dir', 'lots', 'entry', 'exit', 'sl', 'tp', 'pips', 'pl', 'notes'];

function csvCell(v) {
    let s = v == null ? '' : String(v);
    // Stop spreadsheet formula injection (=, +, -, @ at the start of text cells); plain numbers stay as numbers
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportJournalCSV() {
    if (!journal.length) { toast('No trades to export'); return; }
    const rows = [CSV_COLS.join(',')].concat(sortedTrades().map(t =>
        CSV_COLS.map(c => csvCell(c === 'pips' ? tradePips(t).toFixed(1) : t[c])).join(',')
    ));
    const blob = new Blob(['\ufeff' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'trading-journal-' + new Date().toLocaleDateString('en-CA') + '.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', q = false;
    text = text.replace(/^\ufeff/, '');
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (q) {
            if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
            else if (c === '"') q = false;
            else cell += c;
        } else if (c === '"') q = true;
        else if (c === ',') { row.push(cell); cell = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); rows.push(row); row = []; cell = '';
        } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(x => x.trim() !== ''));
}

function importJournalCSV(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const rows = parseCSV(reader.result);
            const head = rows.shift().map(h => h.trim().toLowerCase());
            const col = n => head.indexOf(n);
            if (col('pair') < 0 || col('entry') < 0 || col('exit') < 0) throw new Error('Missing columns');
            let added = 0;
            rows.forEach(r => {
                const get = n => (col(n) >= 0 ? r[col(n)] : '');
                const n = v => { const x = parseFloat(v); return isNaN(x) ? null : x; };
                const t = {
                    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
                    created: Date.now() + added,
                    date: get('date') || new Date().toLocaleDateString('en-CA'),
                    pair: (get('pair') || 'EURUSD').replace('/', '').toUpperCase(),
                    dir: /sell|short/i.test(get('dir')) ? 'sell' : 'buy',
                    lots: n(get('lots')) || 0.01,
                    entry: n(get('entry')), exit: n(get('exit')),
                    sl: n(get('sl')), tp: n(get('tp')),
                    notes: get('notes') || ''
                };
                if (t.entry == null || t.exit == null) return;
                if (t.notes.startsWith("'")) t.notes = t.notes.slice(1);
                const pl = n(get('pl'));
                t.plAuto = pl == null;
                t.pl = pl == null ? Math.round(autoPL(cleanTrade(t)) * 100) / 100 : pl;
                const c = cleanTrade(t);
                if (c) journal.push(c);
                added++;
            });
            saveJournal();
            renderJournal();
            toast(`Imported ${added} trade${added === 1 ? '' : 's'}`);
        } catch (e) {
            toast('Could not read that CSV — export one first to see the format');
        }
    };
    reader.readAsText(file);
}

// ---------- Wire up ----------
(function initJournal() {
    loadJournal();
    document.getElementById('j-add').addEventListener('click', () => openTradeModal());
    document.getElementById('j-close').addEventListener('click', closeTradeModal);
    document.getElementById('j-cancel').addEventListener('click', closeTradeModal);
    document.getElementById('j-modal').addEventListener('click', e => { if (e.target.id === 'j-modal') closeTradeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTradeModal(); });
    document.getElementById('j-form').addEventListener('submit', saveTradeFromForm);
    document.getElementById('j-body').addEventListener('click', e => {
        const ed = e.target.closest('[data-edit]'); if (ed) return openTradeModal(ed.dataset.edit);
        const dl = e.target.closest('[data-del]'); if (dl) deleteTrade(dl.dataset.del);
    });
    document.getElementById('j-export').addEventListener('click', exportJournalCSV);
    document.getElementById('j-import').addEventListener('change', e => {
        if (e.target.files[0]) importJournalCSV(e.target.files[0]);
        e.target.value = '';
    });
    document.getElementById('j-clear').addEventListener('click', () => {
        if (!journal.length) return;
        if (!confirm('Delete ALL trades from your journal? Export a CSV first if you want a backup.')) return;
        journal = [];
        saveJournal();
        renderJournal();
        toast('Journal cleared');
    });
    renderJournal();
})();
