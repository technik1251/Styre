// ==========================================
// PLIK: taxi_views.js - GŁÓWNY ROUTER TAXI (Premium iOS Float)
// ==========================================

// --- NOWOCZESNE OKNO EDYCJI LICZNIKA (STYL APPLE iOS) ---
window.dEditGlobalOdoApple = function() {
    let d = window.db.drv || {};
    let oldOdo = Number(d.odo||0).toFixed(0);

    // Usuń stary modal jeśli istnieje
    let existing = document.getElementById('m-apple-odo');
    if(existing) existing.remove();

    let html = '<div id="m-apple-odo" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); animation:fadeIn 0.2s ease;">' +
        '<div style="background:rgba(30,30,35,0.9); width:85%; max-width:300px; border-radius:20px; box-shadow:0 30px 60px rgba(0,0,0,0.7); text-align:center; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">' +
            '<div style="padding:25px 20px 20px;">' +
                '<h3 style="color:#fff; margin:0 0 8px 0; font-size:1.15rem; font-weight:600; letter-spacing:0.5px;">Stan licznika</h3>' +
                '<p style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin:0 0 20px 0; line-height:1.4;">Wprowadź aktualny przebieg (ODO), aby poprawnie liczyć koszty.</p>' +
                '<div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:10px; border:1px inset rgba(255,255,255,0.05);">' +
                    '<input type="number" id="apple-odo-val" value="'+oldOdo+'" style="width:100%; background:transparent; border:none; color:#0a84ff; font-size:2.2rem; font-weight:600; text-align:center; outline:none; padding:0;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; border-top:1px solid rgba(255,255,255,0.08);">' +
                '<button style="flex:1; padding:16px; background:transparent; border:none; border-right:1px solid rgba(255,255,255,0.08); color:#0a84ff; font-size:1.05rem; font-weight:400; cursor:pointer; outline:none;" onclick="document.getElementById(\'m-apple-odo\').remove()">Anuluj</button>' +
                '<button style="flex:1; padding:16px; background:transparent; border:none; color:#0a84ff; font-size:1.05rem; font-weight:600; cursor:pointer; outline:none;" onclick="window.dSaveGlobalOdoApple('+oldOdo+')">Zapisz</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    
    // Automatycznie zaznacza cyfry po wejściu, żeby można było od razu pisać
    setTimeout(function() {
        let inp = document.getElementById('apple-odo-val');
        if(inp){ inp.focus(); inp.select(); }
    }, 150);
};

window.dSaveGlobalOdoApple = function(oldOdo) {
    let valEl = document.getElementById('apple-odo-val');
    if(!valEl) return;
    let newOdo = parseFloat(valEl.value);

    if(isNaN(newOdo) || newOdo <= 0) {
        if(typeof window.sysAlert==='function') window.sysAlert("Błąd", "Podaj poprawny przebieg.", "error");
        return;
    }
    if(newOdo < oldOdo) {
        if(typeof window.sysAlert==='function') window.sysAlert("Uwaga", "Licznik nie może się cofać.", "warning");
        return;
    }

    window.db.drv.odo = newOdo;
    if (window.db.drv.sh && window.db.drv.sh.on) {
        window.db.drv.sh.o = newOdo; // Koryguje też startową wartość zmiany
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

        // --- STYL CZYSTO LEWITUJĄCYCH IKON (ZERO TŁA PASKOWEGO, ZERO RAMEK) ---
        let navStyle = '<style>' +
            '.ghost-dock { position:fixed; bottom:25px; left:0; width:100%; display:flex; justify-content:space-evenly; align-items:center; z-index:9999; pointer-events:none; }' +
            '.gd-item { pointer-events:auto; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }' +
            '.gd-icon-wrap { width:48px; height:48px; border-radius:24px; background:rgba(15, 15, 20, 0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:1.4rem; box-shadow:0 8px 20px rgba(0,0,0,0.4); filter:grayscale(100%) opacity(0.6); transition:all 0.3s; }' +
            '.gd-item.act .gd-icon-wrap { filter:grayscale(0%) opacity(1); transform:translateY(-8px) scale(1.15); box-shadow:0 15px 25px rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.2); }' +
            '.gd-lbl { margin-top:8px; font-size:0.6rem; font-weight:800; color:#fff; text-transform:uppercase; letter
