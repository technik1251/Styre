// ==========================================
// PLIK: home_views.js - GŁÓWNY ROUTER WIDOKÓW BUDŻETU
// ==========================================

window.rHome = function() {
    let h = window.db.home; 
    let t = window.db.tab; 
    
    if(!window.hMem) window.hMem = h.members[0] || window.db.userName;
    let needsSave = false; 
    let today = window.getLocalYMD();
    
    // Auto-realizacja zaplanowanych transakcji
    h.trans.forEach(x => { 
        if(x.isPlanned && !x.loanId && !x.recId && !x.debtId && x.rD.split('T')[0] <= today) { 
            x.isPlanned = false; needsSave = true; 
        } 
    });
    
    h.loans.forEach(l => { 
        if(l.kapital === undefined) l.kapital = parseFloat(l.left) || 0; 
    });
    
    if(needsSave) window.save();

    // Dolny pasek nawigacji (Wspólny dla całego modułu domowego)
    let nav = `
    <div class="nav">
        <div class="nav-item ${t==='dash'?'act-home':''}" onclick="window.switchTab('dash')"><i>🏠</i>Przegląd</div>
        <div class="nav-item ${t==='goals'?'act-home':''}" onclick="window.switchTab('goals')"><i>🏦</i>Zobowiązania</div>
        <div class="nav-item" style="transform:translateY(-15px);">
            <div style="background:var(--life); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto; box-shadow:0 5px 15px rgba(20,184,166,0.4); color:#000; font-size:1.8rem;" onclick="window.switchTab('add')">+</div>
        </div>
        <div class="nav-item ${t==='stats'?'act-home':''}" onclick="window.switchTab('stats')"><i>📊</i>Wykresy</div>
        <div class="nav-item ${t==='cal'?'act-home':''}" onclick="window.hCalMode='history'; window.switchTab('cal')"><i>📅</i>Historia</div>
    </div>`;

    // Górny nagłówek (Wspólny dla całego modułu domowego)
    let hdr = `
    <header>
        <button class="logo" onclick="window.openSwitcher()">S</button>
        <div class="header-actions" style="display:flex; gap:10px;">
            <div class="settings-btn" style="background:transparent; border:none; padding:0; display:flex; flex-direction:column; align-items:center;" onclick="window.switchTab('acc')">
                <span style="font-size:1.3rem; line-height:1;">💳</span><span style="font-size:0.5rem; font-weight:900; color:var(--muted); text-transform:uppercase;">Konta</span>
            </div>
            <div class="settings-btn" style="background:transparent; border:none; padding:0; display:flex; flex-direction:column; align-items:center;" onclick="window.switchTab('set')">
                <span style="font-size:1.3rem; line-height:1;">⚙️</span><span style="font-size:0.5rem; font-weight:900; color:var(--muted); text-transform:uppercase;">Opcje</span>
            </div>
        </div>
    </header>`;

    // ==========================================
    // DELEGOWANIE DO ZMODULARYZOWANYCH PLIKÓW
    // ==========================================
    if (t === 'goals') {
        if(window.rHomeGoals) window.rHomeGoals(h, t, nav, hdr);
    } 
    else if (t === 'acc' || t === 'set') {
        if(window.rHomeAccSet) window.rHomeAccSet(h, t, nav, hdr);
    } 
    else {
        // Wszystkie pozostałe: dash, add, stats, cal
        if(window.rHomeOps) window.rHomeOps(h, t, nav, hdr);
    }
};
