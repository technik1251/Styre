// ==========================================
// PLIK: taxi_views.js - GŁÓWNY ROUTER TAXI (Premium Float Nav)
// ==========================================

window.renderGarageHistory = function() {
    if(typeof window.hRenderGarage === 'function' && window.db && window.db.drv) {
        return window.hRenderGarage(window.db.drv);
    }
    return '';
};

window.rDrv = function() {
    try {
        let d = (window.db && window.db.drv) ? window.db.drv : {cfg:{}, sh:{tr:[]}, q:{}, clients:[]};
        let t = window.db.tab || 'term';

        // --- STYL PŁYWAJĄCEJ WYSPY (FLOAT NAV) ---
        let navStyle = '<style>' +
            '.float-nav { position:fixed; bottom:15px; left:4%; width:92%; background:rgba(15,15,20,0.85); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); border:1px solid rgba(255,255,255,0.08); border-radius:24px; display:flex; justify-content:space-around; align-items:center; padding:10px 5px; box-shadow:0 20px 40px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1); z-index:9999; }' +
            '.f-item { display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--muted); font-size:0.6rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; flex:1; cursor:pointer; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }' +
            '.f-item.act { color:#fff; }' +
            '.f-icon { font-size:1.4rem; margin-bottom:4px; filter:grayscale(100%) opacity(0.5); transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform:scale(0.9); }' +
            '.f-item.act .f-icon { filter:grayscale(0%) opacity(1); transform:scale(1.15) translateY(-2px); }' +
            '.f-dot { width:4px; height:4px; border-radius:50%; background:transparent; margin-top:2px; transition:all 0.3s ease; }' +
            '</style>';

        // Dolny pasek nawigacji (Pływająca Wyspa)
        let nav = navStyle + '<div class="float-nav">' +
            '<div class="f-item '+(t==='term'?'act':'')+'" onclick="window.switchTab(\'term\')"><span class="f-icon">🚕</span>Panel<div class="f-dot" style="'+(t==='term'?'background:#10b981;box-shadow:0 0 10px #10b981;':'')+'"></div></div>' +
            '<div class="f-item '+(t==='quote'?'act':'')+'" onclick="window.switchTab(\'quote\')"><span class="f-icon">🧮</span>Wycena<div class="f-dot" style="'+(t==='quote'?'background:#d946ef;box-shadow:0 0 10px #d946ef;':'')+'"></div></div>' +
            '<div class="f-item '+(t==='garage'?'act':'')+'" onclick="window.switchTab(\'garage\')"><span class="f-icon">⛽</span>Garaż<div class="f-dot" style="'+(t==='garage'?'background:#f59e0b;box-shadow:0 0 10px #f59e0b;':'')+'"></div></div>' +
            '<div class="f-item '+(t==='stats'?'act':'')+'" onclick="window.switchTab(\'stats\')"><span class="f-icon">📊</span>Wyniki<div class="f-dot" style="'+(t==='stats'?'background:#3b82f6;box-shadow:0 0 10px #3b82f6;':'')+'"></div></div>' +
            '<div class="f-item '+(t==='set'?'act':'')+'" onclick="window.switchTab(\'set\')"><span class="f-icon">⚙️</span>Opcje<div class="f-dot" style="'+(t==='set'?'background:#a855f7;box-shadow:0 0 10px #a855f7;':'')+'"></div></div>' +
        '</div>';

        // Górny nagłówek (Przezroczysty z rozmytymi przyciskami)
        let hdr = '<header style="background:transparent; border:none; padding:15px 20px; position:absolute; top:0; width:100%; z-index:10; display:flex; justify-content:space-between; box-sizing:border-box;">' +
            '<button class="logo" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px); box-shadow:0 4px 15px rgba(0,0,0,0.3); font-weight:900; color:#fff;" onclick="if(typeof window.openSwitcher===\'function\') window.openSwitcher()">S</button>' +
            '<div class="header-actions">' +
                '<div class="badge" style="color:var(--warning); border:1px solid rgba(245,158,11,0.3); background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); cursor:pointer; padding:10px 15px; border-radius:14px; font-weight:900; box-shadow:0 4px 15px rgba(0,0,0,0.3); letter-spacing:1px;" onclick="if(typeof window.dEditGlobalOdo===\'function\') window.dEditGlobalOdo()">' + Number(d.odo||0).toFixed(0) + ' KM <span style="font-size:0.85rem; margin-left:6px;">✏️</span></div>' +
            '</div>' +
        '</header>' + '<div style="height:80px;"></div>'; // Dystans pod przezroczystym nagłówkiem

        // DELEGOWANIE WIDOKÓW
        if (t === 'term' || t === 'stats') {
            if(typeof window.rDrvPanel === 'function') window.rDrvPanel(d, t, nav, hdr);
        } 
        else if (t === 'quote' || t === 'garage') {
            if(typeof window.rDrvTools === 'function') window.rDrvTools(d, t, nav, hdr);
        } 
        else if (t === 'set') {
            if(typeof window.rDrvSet === 'function') window.rDrvSet(d, t, nav, hdr);
        }
    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd krytyczny nawigacji (taxi_views.js)</h3><p style="color:var(--danger); font-family:monospace; margin-bottom:20px;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; width:100%; box-shadow:0 10px 20px rgba(255,255,255,0.2);" onclick="window.location.reload()">ODŚWIEŻ APLIKACJĘ</button></div>';
        }
    }
};
