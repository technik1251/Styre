// ==========================================
// PLIK: taxi_views.js - GŁÓWNY ROUTER TAXI (Ultra Premium Micro Float)
// ==========================================

// --- NOWOCZESNE OKNO EDYCJI LICZNIKA (STYL APPLE iOS) ---
window.dEditGlobalOdo = function() {
    let d = window.db.drv || {};
    let oldOdo = Number(d.odo||0).toFixed(0);

    // Usuń stary modal jeśli istnieje
    let existing = document.getElementById('m-apple-odo');
    if(existing) existing.remove();

    let html = '<div id="m-apple-odo" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); animation:fadeIn 0.2s ease;">' +
        '<div style="background:rgba(25,25,30,0.95); width:85%; max-width:320px; border-radius:24px; box-shadow:0 30px 60px rgba(0,0,0,0.8); text-align:center; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">' +
            '<div style="padding:25px 20px 20px;">' +
                '<div style="font-size:2.0rem; margin-bottom:10px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));">🏎️</div>' +
                '<h3 style="color:#fff; margin:0 0 8px 0; font-size:1.2rem; font-weight:800; letter-spacing:0.5px;">Stan licznika</h3>' +
                '<p style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin:0 0 20px 0; line-height:1.4;">Wprowadź przebieg (ODO), aby poprawnie liczyć koszty paliwa.</p>' +
                '<div style="background:rgba(0,0,0,0.4); border-radius:14px; padding:10px; border:1px inset rgba(255,255,255,0.05);">' +
                    '<input type="number" id="apple-odo-val" value="'+oldOdo+'" style="width:100%; background:transparent; border:none; color:#0ea5e9; font-size:2.4rem; font-weight:800; text-align:center; outline:none; padding:0;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; border-top:1px solid rgba(255,255,255,0.08);">' +
                '<button style="flex:1; padding:18px; background:transparent; border:none; border-right:1px solid rgba(255,255,255,0.08); color:#0ea5e9; font-size:1.05rem; font-weight:400; cursor:pointer; outline:none;" onclick="document.getElementById(\'m-apple-odo\').remove()">Anuluj</button>' +
                '<button style="flex:1; padding:18px; background:transparent; border:none; color:#0ea5e9; font-size:1.05rem; font-weight:800; cursor:pointer; outline:none;" onclick="window.dSaveGlobalOdo('+oldOdo+')">Zapisz</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(function() {
        let inp = document.getElementById('apple-odo-val');
        if(inp){ inp.focus(); inp.select(); }
    }, 150);
};

window.dSaveGlobalOdo = function(oldOdo) {
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
        window.db.drv.sh.o = newOdo; 
    }
    if(typeof window.save === 'function') window.save();

    let mod = document.getElementById('m-apple-odo');
    if(mod) mod.remove();

    if(typeof window.render === 'function') window.render();
};

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

        // --- STYL CZYSTO LEWITUJĄCYCH EMOTEK (ZERO RAMEK, ZERO TŁA, ULTRA MINI + EFEKTY) ---
        let navStyle = '<style>' +
            '.pure-float-nav { position:fixed; bottom:15px; left:0; width:100%; display:flex; justify-content:space-evenly; align-items:flex-end; z-index:9999; pointer-events:none; }' +
            '.pf-item { pointer-events:auto; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); height:50px; position:relative; }' +
            '.pf-icon { font-size:1.0rem; filter:grayscale(100%) opacity(0.35); transform:scale(0.9); transition:all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); padding: 6px; border-radius: 50%; background: rgba(255,255,255,0.05); }' +
            '.pf-item.act .pf-icon { filter:grayscale(0%) opacity(1); transform:scale(1.05) translateY(-3px); background: rgba(14, 165, 233, 0.1); box-shadow: 0 0 10px rgba(14, 165, 233, 0.4); }' +
            '.pf-lbl { font-size:0.55rem; font-weight:900; color:#fff; text-transform:uppercase; letter-spacing:0.8px; text-shadow:0 1px 4px rgba(0,0,0,0.9); opacity:0; transform:translateY(8px); transition:all 0.3s ease; margin-top: 2px; }' +
            '.pf-item.act .pf-lbl { opacity:1; transform:translateY(-2px); }' +
            '</style>';

        // Lewitujące Emotki bez tła, ultra mini
        let nav = navStyle + '<div class="pure-float-nav">' +
            '<div class="pf-item '+(t==='term'?'act':'')+'" onclick="window.switchTab(\'term\')"><span class="pf-icon">🚕</span><span class="pf-lbl">Panel</span></div>' +
            '<div class="pf-item '+(t==='quote'?'act':'')+'" onclick="window.switchTab(\'quote\')"><span class="pf-icon">🧮</span><span class="pf-lbl">Wycena</span></div>' +
            '<div class="pf-item '+(t==='garage'?'act':'')+'" onclick="window.switchTab(\'garage\')"><span class="pf-icon">🔧</span><span class="pf-lbl">Garaż</span></div>' +
            '<div class="pf-item '+(t==='stats'?'act':'')+'" onclick="window.switchTab(\'stats\')"><span class="pf-icon">📊</span><span class="pf-lbl">Wyniki</span></div>' +
            '<div class="pf-item '+(t==='set'?'act':'')+'" onclick="window.switchTab(\'set\')"><span class="pf-icon">⚙️</span><span class="pf-lbl">Opcje</span></div>' +
        '</div>';

        // Górny nagłówek
        let hdr = '<header style="background:transparent; border:none; padding:15px 20px; position:absolute; top:0; width:100%; z-index:10; display:flex; justify-content:space-between; box-sizing:border-box; pointer-events:none;">' +
            '<button class="logo" style="pointer-events:auto; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px); box-shadow:0 6px 20px rgba(0,0,0,0.5); font-weight:900; color:#fff;" onclick="if(typeof window.openSwitcher===\'function\') window.openSwitcher()">S</button>' +
            '<div class="header-actions">' +
                '<div class="badge" style="pointer-events:auto; color:var(--warning); border:1px solid rgba(245,158,11,0.3); background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); cursor:pointer; padding:10px 15px; border-radius:16px; font-weight:900; box-shadow:0 6px 20px rgba(0,0,0,0.5); letter-spacing:1px;" onclick="window.dEditGlobalOdo()">' + Number(d.odo||0).toFixed(0) + ' KM <span style="font-size:0.85rem; margin-left:6px;">✏️</span></div>' +
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
