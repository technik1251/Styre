// ==========================================
// PLIK: taxi_views.js - GŁÓWNY ROUTER TAXI
// ==========================================

window.renderGarageHistory = function() {
    // Funkcja przeniesiona do taxi_tab_tools.js, 
    // ale zostawiamy tu bezpieczny fallback w razie czego
    if(window.hRenderGarage) return window.hRenderGarage();
    return '';
};

window.rDrv = function() {
    let d = (window.db && window.db.drv) ? window.db.drv : {cfg:{}, sh:{tr:[]}, q:{}, clients:[]};
    let t = window.db.tab || 'term';
    
    // Dolny pasek nawigacji
    let nav = `
    <div class="nav">
        <div class="nav-item ${t==='term'?'active':''}" onclick="window.switchTab('term')"><i>🚕</i>Panel</div>
        <div class="nav-item ${t==='quote'?'active':''}" onclick="window.switchTab('quote')"><i>🧮</i>Wycena</div>
        <div class="nav-item ${t==='garage'?'active':''}" onclick="window.switchTab('garage')"><i>⛽</i>Garaż</div>
        <div class="nav-item ${t==='stats'?'active':''}" onclick="window.switchTab('stats')"><i>📊</i>Wyniki</div>
        <div class="nav-item ${t==='set'?'active':''}" onclick="window.switchTab('set')"><i>⚙️</i>Opcje</div>
    </div>`;
    
    // Górny nagłówek
    let hdr = `
    <header>
        <button class="logo" onclick="window.openSwitcher()">S</button>
        <div class="header-actions">
            <div class="badge" style="color:var(--fuel); border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.1); cursor:pointer;" onclick="window.dEditGlobalOdo()">${Number(d.odo||0).toFixed(0)} KM <span style="font-size:0.8rem;">✏️</span></div>
        </div>
    </header>`;
    
    // ==========================================
    // DELEGOWANIE DO ZMODULARYZOWANYCH PLIKÓW
    // ==========================================
    if (t === 'term' || t === 'stats') {
        if(window.rDrvPanel) window.rDrvPanel(d, t, nav, hdr);
    } 
    else if (t === 'quote' || t === 'garage') {
        if(window.rDrvTools) window.rDrvTools(d, t, nav, hdr);
    } 
    else if (t === 'set') {
        if(window.rDrvSet) window.rDrvSet(d, t, nav, hdr);
    }
};
