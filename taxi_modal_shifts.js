// ==========================================
// PLIK: taxi_modal_shifts.js - Zmiany, ODO i Kursy
// ==========================================

window.dEditGlobalOdo = function() {
    let oldOdo = Number(window.db.drv.odo||0).toFixed(0);
    let existing = document.getElementById('m-apple-odo');
    if(existing) existing.remove();

    let html = '<div id="m-apple-odo" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div style="background:linear-gradient(145deg, #18181b, #09090b); width:85%; max-width:320px; border-radius:28px; box-shadow:0 30px 60px rgba(0,0,0,0.8); text-align:center; overflow:hidden; border:1px solid rgba(245,158,11,0.3);">' +
            '<div style="padding:25px 20px 20px;">' +
                '<div style="font-size:3rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(245,158,11,0.4));">🏎️</div>' +
                '<h3 style="color:#f59e0b; margin:0 0 8px 0; font-size:1.3rem; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase;">Stan licznika</h3>' +
                '<div style="background:rgba(0,0,0,0.5); border-radius:18px; padding:15px; border:1px inset rgba(255,255,255,0.05); box-shadow:inset 0 4px 15px rgba(0,0,0,0.3);">' +
                    '<input type="number" id="apple-odo-val" value="'+oldOdo+'" style="width:100%; background:transparent; border:none; color:#f59e0b; font-size:2.8rem; font-weight:900; text-align:center; outline:none; padding:0; text-shadow:0 0 15px rgba(245,158,11,0.4); letter-spacing:2px; font-family:monospace;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; padding:0 20px 20px 20px; gap:10px;">' +
                '<button style="flex:1; padding:15px; background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:18px; color:rgba(255,255,255,0.5); font-size:0.9rem; font-weight:700; cursor:pointer;" onclick="document.getElementById(\'m-apple-odo\').remove()">ANULUJ</button>' +
                '<button style="flex:1; padding:15px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; border-radius:18px; color:#000; font-size:0.9rem; font-weight:900; cursor:pointer;" onclick="window.dSaveGlobalOdo()">ZAPISZ</button>' +
            '</div>' +
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dSaveGlobalOdo = function() {
    let nv = parseFloat(document.getElementById('apple-odo-val').value);
    if(isNaN(nv) || nv <= 0) { if(window.sysAlert) window.sysAlert("Błąd", "Błędna wartość", "error"); return; }
    window.db.drv.odo = nv;
    if (window.db.drv.sh && window.db.drv.sh.on) window.db.drv.sh.o = nv;
    if(typeof window.save === 'function') window.save();
    document.getElementById('m-apple-odo').remove();
    if(typeof window.render === 'function') window.render();
};

window.openEndShiftModal = function() {
    let startOdo = (window.db.drv.sh && window.db.drv.sh.o) ? window.db.drv.sh.o : 0;
    let diffHrs = 0, diffMins = 0;
    if(window.db.drv.sh.shiftStart) {
        let ms = Date.now() - window.db.drv.sh.shiftStart;
        if(window.db.drv.sh.sPT) ms -= window.db.drv.sh.sPT;
        diffHrs = Math.floor(ms/3600000);
        diffMins = Math.floor((ms%3600000)/60000);
    }
    
    let g = 0;
    if(window.db.drv.sh.tr) window.db.drv.sh.tr.forEach(function(x) { g += (parseFloat(x.v)||0); });

    let html = '<div id="m-end-shift" class="modal-overlay" style="z-index:99999; position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.8); backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div class="panel" style="width:90%; max-width:380px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(239,68,68,0.3); box-shadow:0 30px 60px rgba(0,0,0,0.9); padding:25px 20px;">' +
            '<div style="text-align:center; margin-bottom:20px;">' +
                '<div style="font-size:3rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(239,68,68,0.4));">🏁</div>' +
                '<h3 style="color:#ef4444; margin:0 0 5px 0; font-size:1.4rem; font-weight:900; text-transform:uppercase;">Zakończ Zmianę</h3>' +
                '<div style="display:flex; justify-content:space-between; margin-top:15px; background:rgba(0,0,0,0.5); padding:10px; border-radius:12px;">' +
                    '<div style="text-align:center; flex:1;"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Czas Pracy</span><br><strong style="color:#0ea5e9;">'+diffHrs+'h '+diffMins+'m</strong></div>' +
                    '<div style="text-align:center; flex:1; border-left:1px solid rgba(255,255,255,0.1);"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Utarg</span><br><strong style="color:#10b981;">'+g.toFixed(2)+' zł</strong></div>' +
                '</div>' +
            '</div>' +
            
            '<div style="background:#000; border-radius:20px; padding:20px; text-align:center; border:1px inset rgba(255,255,255,0.05); margin-bottom:20px;">' +
                '<label style="font-size:0.65rem; color:#ef4444; font-weight:800; display:block; margin-bottom:10px;">STAN LICZNIKA POJAZDU (KONIEC)</label>' +
                '<input type="number" id="de-o" placeholder="np. '+(startOdo+120)+'" style="width:100%; background:transparent; border:none; color:#ef4444; font-size:3rem; font-weight:900; text-align:center; outline:none; padding:0; font-family:monospace;">' +
                '<div style="font-size:0.65rem; color:rgba(255,255,255,0.4); margin-top:5px;">Odo Start: '+startOdo+' km</div>' +
            '</div>' +

            '<div style="margin-bottom:20px;">' +
                '<label style="font-size:0.65rem; color:rgba(255,255,255,0.6); font-weight:700; margin-bottom:5px; display:block;">Płatny Dystans z Aplikacji (KM)</label>' +
                '<input type="number" step="0.1" id="dw-m-pk" placeholder="np. 85.5" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:14px; padding:15px; width:100%; text-align:center; font-size:1.1rem; font-weight:bold; box-sizing:border-box;">' +
            '</div>' +
            
            '<button class="btn" style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; font-weight:900; padding:18px; border-radius:20px; border:none; width:100%; font-size:1.1rem; box-shadow:0 8px 25px rgba(239,68,68,0.4);" onclick="window.dEndS()">ROZLICZ ZMIANĘ</button>' +
            '<button class="btn" style="background:transparent; color:rgba(255,255,255,0.4); margin-top:10px; border:1px solid rgba(255,255,255,0.1); padding:15px; border-radius:20px; width:100%; font-weight:bold;" onclick="document.getElementById(\'m-end-shift\').remove()">ANULUJ</button>' +
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dEndS = function() {
    let endOdo = parseFloat(document.getElementById('de-o').value);
    let startOdo = window.db.drv.sh.o || 0;
    
    if(isNaN(endOdo) || endOdo <= startOdo) {
        if(window.sysAlert) window.sysAlert('Błąd', 'Licznik końcowy musi być większy niż startowy ('+startOdo+' km).', 'error');
        return;
    }

    let k = endOdo - startOdo;
    let pk = parseFloat(document.getElementById('dw-m-pk').value) || 0;
    let emptyK = Math.max(0, k - pk);
    
    let g=0, cf=0, vf=0;
    let trList = window.db.drv.sh.tr || [];
    let c = window.db.drv.cfg || {};
    
    let cardF = c.cardF || 0;
    let vouchF = c.voucherF || 0;
    let taxRate = c.tax || 0;
    let fuelPx = c.fuelPx || 0;
    let ePct = c.eType === 'pct' ? (c.ePct || 0) : 0;

    trList.forEach(function(x) {
        let val = parseFloat(x.v) || 0;
        g += val;
        if(x.p === 'Karta') cf += val * cardF;
        if(x.p === 'Voucher') vf += val * vouchF;
    });

    let fc = k * fuelPx;
    let tx = g * taxRate;
    let pF = g * ePct;
    let n = g - fc - tx - pF - cf - vf;

    let diffHrs = 0, diffMins = 0;
    if(window.db.drv.sh.shiftStart) {
        let ms = Date.now() - window.db.drv.sh.shiftStart;
        if(window.db.drv.sh.sPT) ms -= window.db.drv.sh.sPT;
        diffHrs = Math.floor(ms/3600000);
        diffMins = Math.floor((ms%3600000)/60000);
    }

    window.db.drv.odo = endOdo;
    if(!window.db.drv.h) window.db.drv.h = [];
    
    window.db.drv.h.unshift({
        id: Date.now(),
        rD: new Date().toISOString(),
        dt: new Date().toLocaleDateString('pl-PL'),
        hW: diffHrs + (diffMins/60),
        g: g, n: n, k: k, pk: pk, emptyK: emptyK,
        fc: fc, tx: tx, pF: pF, cF: cf, vF: vf, tr: trList
    });

    window.db.drv.sh = {on:false, tr:[]};
    window.db.drv.liveRideStart = null;
    window.db.tab = 'stats';

    if(typeof window.save === 'function') window.save();
    document.getElementById('m-end-shift').remove();
    if(typeof window.render === 'function') window.render();
};

window.dEditT = function(id) {
    let trList = window.db.drv.sh.tr || [];
    let tr = trList.find(function(x) { return x.id === id; }); 
    if(!tr) return;
    
    let html = '<div id="m-edit-t" class="modal-overlay" style="z-index:99999; position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px);">' +
        '<div class="panel" style="width:90%; max-width:350px; background: #09090b; border:1px solid rgba(14,165,233,0.3); border-radius:24px; padding:25px 20px;">' +
            '<h3 style="color:#0ea5e9; text-align:center; margin:0 0 20px 0;">Edytuj Kurs</h3>' +
            '<div style="margin-bottom:15px;"><label style="font-size:0.7rem; color:var(--muted);">Kwota (zł)</label><input type="number" step="0.01" id="et-v" value="'+Number(tr.v||0).toFixed(2)+'" style="width:100%; background:rgba(255,255,255,0.05); color:#10b981; border:none; padding:15px; border-radius:12px; font-size:1.2rem; font-weight:bold; outline:none; text-align:center; margin-top:5px;"></div>' +
            '<button class="btn" style="background:#0ea5e9; color:#fff; width:100%; padding:15px; border-radius:15px; font-weight:bold;" onclick="window.dSaveEditT('+id+')">ZAPISZ</button>' +
            '<button class="btn" style="background:transparent; color:rgba(255,255,255,0.5); width:100%; padding:15px; margin-top:10px;" onclick="document.getElementById(\'m-edit-t\').remove()">ANULUJ</button>' +
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dSaveEditT = function(id) { 
    let tr = (window.db.drv.sh.tr || []).find(function(x) { return x.id === id; }); 
    if(tr) { 
        let nv = parseFloat(document.getElementById('et-v').value);
        if(!isNaN(nv) && nv > 0) { tr.v = nv; window.save(); window.render(); } 
    } 
    document.getElementById('m-edit-t').remove(); 
};

window.dDelT = function(id) { 
    if(window.sysConfirm) { 
        window.sysConfirm("Cofnij kurs", "Usunąć kurs ze zmiany?", function() { 
            window.db.drv.sh.tr = window.db.drv.sh.tr.filter(function(x) { return x.id !== id; }); 
            window.save(); window.render(); 
        }); 
    } 
};
