// ==========================================
// PLIK: taxi_views.js - GŁÓWNY ROUTER TAXI (Premium iOS Float)
// ==========================================

// --- NOWOCZESNE OKNO EDYCJI LICZNIKA (STYL APPLE iOS) ---
window.dEditGlobalOdo = function() {
    let d = window.db.drv || {};
    let oldOdo = Number(d.odo||0).toFixed(0);

    // Usuń stary modal jeśli istnieje
    let existing = document.getElementById('m-apple-odo');
    if(existing) existing.remove();

    let html = '<div id="m-apple-odo" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); animation:fadeIn 0.2s ease;">' +
        '<div style="background:rgba(30,30,35,0.85); width:85%; max-width:320px; border-radius:24px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 30px 60px rgba(0,0,0,0.7); text-align:center; overflow:hidden;">' +
            '<div style="padding:25px 20px;">' +
                '<div style="font-size:3rem; margin-bottom:10px;">🏎️</div>' +
                '<h3 style="color:#fff; margin:0 0 8px 0; font-size:1.15rem; font-weight:700; letter-spacing:0.5px;">Stan Licznika</h3>' +
                '<p style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin:0 0 20px 0; line-height:1.4;">Wprowadź aktualny przebieg (ODO), aby precyzyjnie liczyć koszty paliwa.</p>' +
                '<div style="background:rgba(0,0,0,0.4); border-radius:14px; padding:12px; border:1px solid rgba(255,255,255,0.05);">' +
                    '<input type="number" id="apple-odo-val" value="'+oldOdo+'" style="width:100%; background:transparent; border:none; color:#0ea5e9; font-size:2.4rem; font-weight:700; text-align:center; outline:none; padding:0;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; border-top:1px solid rgba(255,255,255,0.1);">' +
                '<button style="flex:1; padding:18px; background:transparent; border:none; border-right:1px solid rgba(255,255,255,0.1); color:#0ea5e9; font-size:1.05rem; font-weight:400; cursor:pointer;" onclick="document.getElementById(\'m-apple-odo\').remove()">Anuluj</button>' +
                '<button style="flex:1; padding:18px; background:transparent; border:none; color:#0ea5e9; font-size:1.05rem; font-weight:700; cursor:pointer;" onclick="window.dSaveGlobalOdoCustom('+oldOdo+')">Zapisz</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    
    // Automatycznie zaznacza cyfry po wejściu
    setTimeout(function() {
        let inp = document.getElementById('apple-odo-val');
        if(inp){ inp.focus(); inp.select(); }
    }, 100);
};

window.dSaveGlobalOdoCustom = function(oldOdo) {
    let valEl = document.getElementById('apple-odo-val');
    if(!valEl) return;
    let newOdo = parseFloat(valEl.value);

    if(isNaN(newOdo) || newOdo <= 0) {
        if(typeof window.sysAlert==='function') window.sysAlert("Błąd", "Podaj poprawny przebieg (ODO).", "error");
        return;
    }
    if(newOdo < oldOdo) {
        if(typeof window.sysAlert==='function') window.sysAlert("Uwaga", "Licznik nie może się cofać.", "warning");
        return;
    }

    window.db.drv.odo = newOdo;
    if (window.db.drv.sh && window.db.drv.sh.on) {
        window.db.drv.sh.o = newOdo; // Aktualizuje również start zmiany, jeśli trwa
    }
    if(typeof window.save === 'function') window.save();

    let mod = document.getElementById('m-apple-odo');
    if(mod) mod.remove();

    if(typeof window.render === 'function') window.render();
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

        // --- STYL CZYSTO LEWITUJĄCYCH IKON (ZERO TŁA, ZERO RAMEK) ---
        let navStyle = '<style>' +
            '.apple-dock { position:fixed; bottom:20px; left:0; width:100%; display:flex; justify-content:space-around; align-items:flex-end; padding:0 10px; z-index:9999; box-sizing:border-box; pointer-events:none; }' +
            '.a-item { pointer-events:auto; display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; cursor:pointer; transition:all 0.3s ease; position:relative; height:60px; }' +
            '.a-icon { font-size:1.8rem; opacity:0.4; transition:all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform:scale(0.85); filter:drop-shadow(0 4px 6px rgba(0,0,0,0.9)); position:absolute; bottom:15px; }' +
            '.a-lbl { font-size:0.6rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#fff; text-shadow:0 2px 6px rgba(0,0,0,0.9); opacity:0; transform:translateY(10px); transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position:absolute; bottom:0; }' +
            '.a-item.act .a-icon { opacity:1; transform:scale(1.2) translateY(-12px); filter:drop-shadow(0 8px 15px rgba(0,0,0,1)); }' +
            '.a-item.act .a-lbl { opacity:1; transform:translateY(0); }' +
            '</style>';

        // Dolny pasek nawigacji (Tylko same lewitujące ikony, napisy pojawiają się przy aktywnej)
        let nav = navStyle + '<div class="apple-dock">' +
            '<div class="a-item '+(t==='term'?'act':'')+'" onclick="window.switchTab(\'term\')"><span class="a-icon">🚕</span><span class="a-lbl">Panel</span></div>' +
            '<div class="a-item '+(t==='quote'?'act':'')+'" onclick="window.switchTab(\'quote\')"><span class="a-icon">🧮</span><span class="a-lbl">Wycena</span></div>' +
            '<div class="a-item '+(t==='garage'?'act':'')+'" onclick="window.switchTab(\'garage\')"><span class="a-icon">⛽</span><span class="a-lbl">Garaż</span></div>' +
            '<div class="a-item '+(t==='stats'?'act':'')+'" onclick="window.switchTab(\'stats\')"><span class="a-icon">📊</span><span class="a-lbl">Wyniki</span></div>' +
            '<div class="a-item '+(t==='set'?'act':'')+'" onclick="window.switchTab(\'set\')"><span class="a-icon">⚙️</span><span class="a-lbl">Opcje</span></div>' +
        '</div>';

        // Górny nagłówek (Przezroczysty z rozmytymi przyciskami)
        let hdr = '<header style="background:transparent; border:none; padding:15px 20px; position:absolute; top:0; width:100%; z-index:10; display:flex; justify-content:space-between; box-sizing:border-box; pointer-events:none;">' +
            '<button class="logo" style="pointer-events:auto; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); box-shadow:0 6px 20px rgba(0,0,0,0.5); font-weight:900; color:#fff;" onclick="if(typeof window.openSwitcher===\'function\') window.openSwitcher()">S</button>' +
            '<div class="header-actions">' +
                '<div class="badge" style="pointer-events:auto; color:var(--warning); border:1px solid rgba(245,158,11,0.3); background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); cursor:pointer; padding:10px 15px; border-radius:16px; font-weight:900; box-shadow:0 6px 20px rgba(0,0,0,0.5); letter-spacing:1px;" onclick="window.dEditGlobalOdo()">' + Number(d.odo||0).toFixed(0) + ' KM <span style="font-size:0.85rem; margin-left:6px;">✏️</span></div>' +
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
            appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd nawigacji (taxi_views.js)</h3><p style="color:var(--danger); font-family:monospace; margin-bottom:20px;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; width:100%;" onclick="window.location.reload()">ODŚWIEŻ APLIKACJĘ</button></div>';
        }
    }
};
