// ==========================================
// PLIK: home_views.js - GŁÓWNY ROUTER WIDOKÓW BUDŻETU
// ==========================================

// --- LEKKI SILNIK ANIMACJI (KONFETTI) ---
window.shootConfetti = function() {
    for(let i=0; i<40; i++) {
        let conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.left = '50%';
        conf.style.top = '50%';
        conf.style.width = '8px';
        conf.style.height = '15px';
        conf.style.backgroundColor = ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444', '#a855f7'][Math.floor(Math.random()*5)];
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        conf.style.pointerEvents = 'none';
        conf.style.zIndex = '99999';
        document.body.appendChild(conf);
        
        let angle = Math.random() * Math.PI * 2;
        let velocity = 40 + Math.random() * 80;
        let tx = Math.cos(angle) * velocity * (Math.random() * 3);
        let ty = Math.sin(angle) * velocity * (Math.random() * 3) - 150;
        
        conf.animate([
            { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random()*720}deg) scale(0)`, opacity: 0 }
        ], { 
            duration: 1000 + Math.random()*1000, 
            easing: 'cubic-bezier(0,0,0.2,1)' 
        }).onfinish = () => conf.remove();
    }
};

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

    // Dolny pasek nawigacji (Wersja Premium - Zoptymalizowany UX)
    let nav = `
    <div class="nav">
        <div class="nav-item ${t==='dash'?'act-home':''}" onclick="window.switchTab('dash')">
            <i style="font-size:1.3rem;">🏠</i><span style="font-size:0.6rem;">Pulpit</span>
        </div>
        <div class="nav-item ${t==='goals'?'act-home':''}" onclick="window.switchTab('goals')">
            <i style="font-size:1.3rem;">🏦</i><span style="font-size:0.6rem;">Cele/Raty</span>
        </div>
        <div class="nav-item" style="transform:translateY(-20px);">
            <div style="background:linear-gradient(135deg, var(--life), #0d9488); width:55px; height:55px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto; box-shadow:0 8px 25px rgba(20,184,166,0.6); color:#000; font-size:2rem; font-weight:300; transition: transform 0.2s;" onactive="this.style.transform='scale(0.95)'" onclick="window.switchTab('add')">+</div>
        </div>
        <div class="nav-item ${t==='stats'?'act-home':''}" onclick="window.switchTab('stats')">
            <i style="font-size:1.3rem;">📊</i><span style="font-size:0.6rem;">Analiza</span>
        </div>
        <div class="nav-item ${t==='cal'?'act-home':''}" onclick="window.hCalMode='history'; window.switchTab('cal')">
            <i style="font-size:1.3rem;">📅</i><span style="font-size:0.6rem;">Historia</span>
        </div>
    </div>`;

    // Górny nagłówek (Wspólny dla całego modułu domowego)
    let hdr = `
    <header>
        <button class="logo" onclick="window.openSwitcher()">S</button>
        <div class="header-actions" style="display:flex; gap:12px;">
            <div class="settings-btn" style="background:transparent; border:none; padding:0; display:flex; flex-direction:column; align-items:center; cursor:pointer;" onclick="window.switchTab('acc')">
                <span style="font-size:1.3rem; line-height:1;">💳</span><span style="font-size:0.5rem; font-weight:900; color:var(--muted); text-transform:uppercase;">Konta</span>
            </div>
            <div class="settings-btn" style="background:transparent; border:none; padding:0; display:flex; flex-direction:column; align-items:center; cursor:pointer;" onclick="window.switchTab('set')">
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
