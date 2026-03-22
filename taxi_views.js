// ==========================================
// PLIK: taxi_views.js - GŁÓWNY ROUTER TAXI (Czysto Pływające Ikony)
// ==========================================

// --- NOWE OKNO EDYCJI LICZNIKA (PREMIUM) ---
window.dEditGlobalOdo = function() {
    let d = window.db.drv || {};
    let oldOdo = Number(d.odo||0).toFixed(0);

    let html = '<div id="m-edit-odo-custom" class="modal-overlay" style="z-index: 30000; animation: fadeIn 0.2s; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);">' +
        '<div class="panel" style="width:90%; max-width:340px; background:linear-gradient(145deg, #18181b, #09090b); border-radius:24px; padding:25px; border:1px solid rgba(255,255,255,0.05); box-shadow:0 20px 50px rgba(0,0,0,0.9); text-align:center;">' +
            '<div style="font-size:3.5rem; margin-bottom:15px; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.5));">✏️</div>' +
            '<h3 style="color:#fff; margin:0 0 10px 0; font-size:1.4rem; letter-spacing:0.5px; font-weight:900;">Edytuj Licznik</h3>' +
            '<p style="font-size:0.75rem; color:var(--muted); margin-bottom:20px; line-height:1.5;">Podaj aktualny przebieg całego pojazdu (ODO). Zmiana wpłynie na statystyki Garażu.</p>' +
            '<div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:15px; margin-bottom:25px;">' +
                '<div style="display:flex; justify-content:center; align-items:center; gap:8px;">' +
                    '<input type="number" id="mod-global-odo-val" placeholder="0" value="'+oldOdo+'" style="color:var(--warning); border:none; background:transparent; font-size:3rem; font-weight:900; text-align:center; width:100%; padding:0; outline:none;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; gap:10px;">' +
                '<button class="btn" style="flex:1; background:rgba(255,255,255,0.05); color:var(--muted); border:1px solid rgba(255,255,255,0.1); border-radius:14px; box-shadow:none; padding:16px; font-weight:bold; font-size:0.85rem;" onclick="document.getElementById(\'m-edit-odo-custom\').remove()">ANULUJ</button>' +
                '<button class="btn" style="flex:1; background:linear-gradient(135deg, var(--warning), #d97706); color:#000; font-weight:900; padding:16px; border-radius:14px; border:none; box-shadow:0 6px 20px rgba(245,158,11,0.4); font-size:0.85rem;" onclick="window.dSaveGlobalOdoCustom('+oldOdo+')">ZAPISZ</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    // Automatyczne zaznaczenie tekstu po otwarciu
    setTimeout(function(){ 
        let inp = document.getElementById('mod-global-odo-val'); 
        if(inp){ inp.focus(); inp.select(); } 
    }, 150);
};

window.dSaveGlobalOdoCustom = function(oldOdo) {
    let valEl = document.getElementById('mod-global-odo-val');
    if(!valEl) return;
    let newOdo = parseFloat(valEl.value);

    if(isNaN(newOdo) || newOdo <= 0) {
        if(typeof window.sysAlert==='function') window.sysAlert("Błąd!", "Podaj poprawny przebieg (ODO)!", "error");
        return;
    }
    if(newOdo < oldOdo) {
        if(typeof window.sysAlert==='function') window.sysAlert("Uwaga!", "Licznik nie może się cofać!", "warning");
        return;
    }

    window.db.drv.odo = newOdo;
    if (window.db.drv.sh && window.db.drv.sh.on) {
        window.db.drv.sh.o = newOdo; // Koryguje też startową wartość jeśli zmiana trwa
    }
    if(typeof window.save === 'function') window.save();

    let mod = document.getElementById('m-edit-odo-custom');
    if(mod) mod.remove();

    if(typeof window.render === 'function') window.render();
    if(typeof window.sysAlert==='function') window.sysAlert("Gotowe!", "Licznik zaktualizowany do "+newOdo+" KM.", "success");
};

// --- RENDEROWANIE GARAŻU FALLBACK ---
window.renderGarageHistory = function() {
    if(typeof window.hRenderGarage === 'function' && window.db && window.db.drv) {
        return window.hRenderGarage(window.db.drv);
    }
    return '';
};

// --- GŁÓWNY ROUTER TAXI ---
window.rDrv = function() {
    try {
        let d = (window.db && window.db.drv) ? window.db.drv : {cfg:{}, sh:{tr:[]}, q:{}, clients:[]};
        let t = window.db.tab || 'term';

        // --- STYL CZYSTO PŁYWAJĄCYCH IKON (ZERO TŁA, ZERO RAMEK) ---
        let navStyle = '<style>' +
            '.float-nav { position:fixed; bottom:20px; left:0; width:100%; background:transparent !important; border:none !important; backdrop-filter:none !important; box-shadow:none !important; display:flex; justify-content:space-around; align-items:center; padding:0 5px; z-index:9999; }' +
            '.f-item { display:flex; flex-direction:column; align-items:center; justify-content:center; color:rgba(255,255,255,0.45); font-size:0.6rem; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; flex:1; cursor:pointer; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-shadow:0 2px 6px rgba(0,0,0,0.9); }' +
            '.f-item.act { color:#fff; }' +
            '.f-icon { font-size:1.8rem; margin-bottom:5px; filter:grayscale(100%) opacity(0.5); transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform:scale(0.85); filter:drop-shadow(0 4px 6px rgba(0,0,0,0.9)); }' +
            '.f-item.act .f-icon { filter:grayscale(0%) opacity(1) drop-shadow(0 6px 12px rgba(0,0,0,1)); transform:scale(1.2) translateY(-4px); }' +
            '.f-dot { width:5px; height:5px; border-radius:50%; background:transparent; margin-top:3px; transition:all 0.3s ease; box-shadow:none; }' +
            '</style>';

        // Dolny pasek nawigacji (Tylko lewitujące ikony)
        let nav = navStyle + '<div class="float-nav">' +
            '<div class="f-item '+(t==='term'?'act':'')+'" onclick="window.switchTab(\'term\')"><span class="f-icon">🚕</span>Panel<div class="f-dot" style="'+(t==='term'?'background:#10b981;box-shadow:0 0 12px #10b981;':'')+'"></div></div>' +
            '<div class="f-item '+(t==='quote'?'act':'')+'" onclick="window.switchTab(\'quote\')"><span class="f-icon">🧮</span>Wycena<div class="f-dot" style="'+(t==='quote'?'background:#d946ef;box-shadow:0 0 12px #d946ef;':'')+'"></div></div>' +
            '<div class="f-item '+(t==='garage'?'act':'')+'" onclick="window.switchTab(\'garage\')"><span class="f-icon">⛽</span>Garaż<div class="f-dot" style="'+(t==='garage'?'background:#f59e0b;box-shadow:0 0 12px #f59e0b;':'')+'"></div></div>' +
            '<div class="f-item '+(t==='stats'?'act':'')+'" onclick="window.switchTab(\'stats\')"><span class="f-icon">📊</span>Wyniki<div class="f-dot" style="'+(t==='stats'?'background:#3b82f6;box-shadow:0 0 12px #3b82f6;':'')+'"></div></div>' +
            '<div class="f-item '+(t==='set'?'act':'')+'" onclick="window.switchTab(\'set\')"><span class="f-icon">⚙️</span>Opcje<div class="f-dot" style="'+(t==='set'?'background:#a855f7;box-shadow:0 0 10px #a855f7;':'')+'"></div></div>' +
        '</div>';

        // Górny nagłówek (Przezroczysty z rozmytymi przyciskami)
        let hdr = '<header style="background:transparent; border:none; padding:15px 20px; position:absolute; top:0; width:100%; z-index:10; display:flex; justify-content:space-between; box-sizing:border-box;">' +
            '<button class="logo" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px); box-shadow:0 4px 15px rgba(0,0,0,0.3); font-weight:900; color:#fff;" onclick="if(typeof window.openSwitcher===\'function\') window.openSwitcher()">S</button>' +
            '<div class="header-actions">' +
                '<div class="badge" style="color:var(--warning); border:1px solid rgba(245,158,11,0.3); background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); cursor:pointer; padding:10px 15px; border-radius:14px; font-weight:900; box-shadow:0 4px 15px rgba(0,0,0,0.3); letter-spacing:1px;" onclick="if(typeof window.dEditGlobalOdo===\'function\') window.dEditGlobalOdo()">' + Number(d.odo||0).toFixed(0) + ' KM <span style="font-size:0.85rem; margin-left:6px;">✏️</span></div>' +
            '</div>' +
        '</header>' + '<div style="height:80px;"></div>';

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
