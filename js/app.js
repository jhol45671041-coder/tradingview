// === App shell: navigation, routing, theme, toast ===

const VIEW_ALIASES = { chart: 'charts', 'how-to-use': 'guide', calendar: 'calendar', home: 'dashboard', '': 'dashboard' };
let currentView = null;

function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function openSidebar(open) {
    document.getElementById('sidebar').classList.toggle('open', open);
    document.getElementById('scrim').classList.toggle('show', open);
}

function showView(view, sub, fromTab) {
    view = VIEW_ALIASES[view] !== undefined ? VIEW_ALIASES[view] : view;
    const section = document.getElementById('view-' + view);
    if (!section) { view = 'dashboard'; }
    const target = document.getElementById('view-' + view);
    const changed = currentView !== view;

    if (changed) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        target.classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.view === view));
        const title = target.dataset.title || 'Forex Pro Calculator';
        document.getElementById('page-title').innerHTML = title + '<small>Forex Pro Calculator</small>';
        document.title = (view === 'dashboard' ? '' : title.replace('&amp;', '&') + ' · ') + 'Forex Pro Calculator & Trading Charts';
        currentView = view;
        if (!fromTab) window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (sub && !fromTab && document.getElementById('calc-' + sub)) {
        switchCalc(sub); // calls back here with fromTab=true
    }

    // Keep the URL shareable: #view or #view/tab
    const activeTab = target.querySelector('.calc-tab.active');
    const hash = '#' + view + (sub ? '/' + sub : (activeTab && view !== 'dashboard' ? '/' + activeTab.dataset.calc : ''));
    if (location.hash !== hash) history.replaceState(null, '', hash);

    openSidebar(false);
    if (typeof loadWidgetsForView === 'function') loadWidgetsForView(view);
}

function route() {
    const [view, sub] = location.hash.replace(/^#/, '').split('/');
    showView(view || 'dashboard', sub);
}

// ---------- Theme ----------
function applyTheme(theme, reloadWidgets) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('fpc-theme', theme); } catch (e) {}
    const btn = document.getElementById('theme-btn');
    btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    btn.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#070b12' : '#f3f5f9';
    if (reloadWidgets && typeof reloadWidgetsForTheme === 'function') reloadWidgetsForTheme(currentView);
}

// ---------- Init ----------
(function initApp() {
    document.getElementById('menu-btn').addEventListener('click', () => openSidebar(true));
    document.getElementById('scrim').addEventListener('click', () => openSidebar(false));
    document.getElementById('theme-btn').addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next, true);
    });
    window.addEventListener('hashchange', route);

    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);
    route();
    if (typeof loadTickerTape === 'function') loadTickerTape();
})();
