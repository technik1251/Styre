// ==========================================
// PLIK: home_views.js - GŁÓWNY ROUTER WIDOKÓW BUDŻETU
// ==========================================

// --- LEKKI SILNIK ANIMACJI (KONFETTI) ---
window.shootConfetti = function() {
    try {
        for(let i = 0; i < 40; i++) {
            let conf = document.createElement('div');
            conf.style.position = 'fixed';
            conf.style.left = '50%';
            conf.style.top = '50%';
            conf.style.width = '8px';
            conf.style.height = '15px';
            let colors = ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444', '#a855f7'];
            conf.style.backgroundColor = colors[Math.floor(Math.random() * 5)];
            conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            conf.style.pointerEvents = 'none';
            conf.style.zIndex = '99999';
            document.body.appendChild(conf);
            
            let angle = Math.random() * Math.PI * 2;
            let velocity = 40 + Math.random() * 80;
            let tx = Math.cos(angle) * velocity * (Math.random() * 3);
            let ty = Math.sin(angle) * velocity * (Math.random() * 3) - 150;
            
            if (typeof conf.animate === 'function') {
                let animation = conf.animate([
                    { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)', opacity: 1 },
                    { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random()*720}deg) scale(0)`, opacity: 0 }
                ], { 
                    duration: 1000 + Math.random() * 1000, 
                    easing: 'cubic-bezier(0,0,0.2,1)' 
                });
                animation.onfinish = function() { conf.remove(); };
            } else {
                setTimeout(function(c) { if(c) c.remove(); }, 1500, conf);
            }
        }
    } catch(e) {
        console.log("Konfetti nie jest wspierane", e);
    }
};

window.rHome = function() {
    try {
        // 100% Bezpieczna inicjalizacja bazy
        if(typeof window.db === 'undefined' || !window.db) window.db = {};
        if(typeof window.db.home === 'undefined' || !window.db.home) window.db.home = {};
        
        let h = window.db.home; 
        let t = window.db.tab || 'dash'; 
        
        if(!h.members || !Array.isArray(h.members)) h.members = [];
        if(!h.accs || !Array.isArray(h.accs)) h.accs = [{id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0}];
        if(!h.trans || !Array.isArray(h.trans)) h.trans = [];
        if(!h.loans || !Array.isArray(h.loans)) h.loans = [];
        if(!h.piggy || !Array.isArray(h.piggy)) h.piggy = [];
        
        if(typeof window.hMem === 'undefined' || !window.hMem) {
            window.hMem = (h.members.length > 0) ? h.members[0] : (window.db.userName || 'Ja');
        }
        
        let needsSave = false; 
        let today = (typeof window.getLocalYMD === 'function') ? window.getLocalYMD() : new Date().toISOString().split('T')[0];
        
        // Auto-realizacja zaplanowanych transakcji (Zabezpieczona pętla)
        for(let i = 0; i < h.trans.length; i++) {
            let x = h.trans[i];
            if(x.isPlanned && !x.loanId && !x.recId && !x.debtId && x.rD && typeof x.rD === 'string') { 
                let rdSplit = x.rD.split('T')[0];
                if (rdSplit <= today) {
                    x.isPlanned = false; 
                    needsSave = true; 
                }
            } 
        }
        
        for(let j = 0; j < h.loans.length; j++) {
            let l = h.loans[j];
            if(l.kapital === undefined) l.kapital = parseFloat(l.left) || 0; 
        }
        
        if(needsSave && typeof window.save === 'function') {
            window.save();
        }

        // Dolny pasek nawigacji (Zoptymalizowany UX)
        let nav = `
        <div class="nav">
            <div class="nav-item ${t==='dash'?'act-home':''}" onclick="window.switchTab('dash')">
                <i style="font-size:1.3rem;">🏠</i><span style="font-size:0.6rem;">Pulpit</span>
            </div>
            <div class="nav-item ${t==='goals'?'act-home':''}" onclick="window.switchTab('goals')">
                <i style="font-size:1.3rem;">🏦</i><span style="font-size:0.6rem;">Cele/Raty</span>
            </div>
            <div class="nav-item" style="transform:translateY(-20px);">
                <div style="background:linear-gradient(135deg, var(--life), #0d9488); width:55px; height:55px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto; box-shadow:0 8px 25px rgba(20,184,166,0.6); color:#000; font-size:2rem; font-weight:300; transition: transform 0.2s;" onclick="window.switchTab('add')">+</div>
            </div>
            <div class="nav-item ${t==='stats'?'act-home':''}" onclick="window.switchTab('stats')">
                <i style="font-size:1.3rem;">📊</i><span style="font-size:0.6rem;">Analiza</span>
            </div>
            <div class="nav-item ${t==='cal'?'act-home':''}" onclick="window.hCalMode='history'; window.switchTab('cal')">
                <i style="font-size:1.3rem;">📅</i><span style="font-size:0.6rem;">Historia</span>
            </div>
        </div>`;

        // Górny nagłówek
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

        // DELEGOWANIE Z ZABEZPIECZENIAMI
        if (t === 'goals') {
            if(typeof window.rHomeGoals === 'function') window.rHomeGoals(h, t, nav, hdr);
        } 
        else if (t === 'acc' || t === 'set') {
            if(typeof window.rHomeAccSet === 'function') window.rHomeAccSet(h, t, nav, hdr);
        } 
        else {
            if(typeof window.rHomeOps === 'function') {
                window.rHomeOps(h, t, nav, hdr);
            } else {
                let appContainer = document.getElementById('app');
                if(appContainer) appContainer.innerHTML = hdr + `<div style="padding:40px 20px; text-align:center; color:var(--warning); font-weight:bold;">Moduł ładuje dane... Jeżeli to nie znika, sprawdź plik home_tab_ops.js</div>` + nav;
            }
        }
        
    } catch(err) {
        // WYKRYWACZ BŁĘDÓW NA EKRANIE
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = `<div style="padding:40px 20px; text-align:center; background:#18181b; height:100vh; color:#fff;">
                <div style="font-size:3rem; margin-bottom:10px;">🚨</div>
                <h3 style="color:var(--danger); margin-top:0;">Błąd systemu!</h3>
                <p style="font-size:0.8rem; color:var(--muted);">Aplikacja napotkała problem w pliku <b>home_views.js</b>:</p>
                <div style="background:rgba(239,68,68,0.1); border:1px solid var(--danger); color:var(--danger); padding:10px; border-radius:8px; font-size:0.7rem; font-family:monospace; text-align:left; word-wrap:break-word;">${err.message}</div>
                <button style="margin-top:20px; padding:15px; background:#fff; color:#000; border:none; border-radius:12px; font-weight:bold; width:100%;" onclick="window.location.reload()">ODŚWIEŻ APLIKACJĘ</button>
            </div>`;
        }
    }
};
