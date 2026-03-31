// ==========================================
// PLIK: taxi_modal_actions.js - Edycja Wydatków, Historii, CRM i Backup (Premium)
// ==========================================

// --- BACKUP DANYCH (EKSPORT/IMPORT) ---
window.dExport = function() { 
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.db)); 
    let dlAnchorElem = document.createElement('a'); 
    dlAnchorElem.setAttribute("href", dataStr); 
    dlAnchorElem.setAttribute("download", "styreos_taxi_backup_" + (window.getLocalYMD ? window.getLocalYMD() : "data") + ".json"); 
    dlAnchorElem.click(); 
    if(window.sysAlert) window.sysAlert("Pobrano!", "Plik kopii zapasowej został zapisany.", "success"); 
};

window.dImport = function(event) { 
    let file = event.target.files[0]; 
    if(!file) return; 
    let reader = new FileReader(); 
    reader.onload = function(e) { 
        try { 
            let importedDb = JSON.parse(e.target.result); 
            if(importedDb && importedDb.drv) { 
                if(window.sysConfirm) { 
                    window.sysConfirm("Przywracanie Danych", "To nadpisze obecne dane na tym urządzeniu. Czy na pewno kontynuować?", function() { 
                        localStorage.setItem('styre_v101_db', JSON.stringify(importedDb)); 
                        if(window.sysAlert) window.sysAlert("Sukces!", "Dane przywrócone. Restartuję...", "success"); 
                        setTimeout(function() { location.reload(); }, 1200); 
                    }); 
                } else { 
                    localStorage.setItem('styre_v101_db', JSON.stringify(importedDb)); 
                    location.reload(); 
                } 
            } else throw new Error("Błędny format"); 
        } catch(err) { 
            if(window.sysAlert) window.sysAlert("Błąd", "Nieprawidłowy plik kopii zapasowej.", "error"); 
        } 
    }; 
    reader.readAsText(file); 
};

// --- MODAL: EDYCJA WYDATKU Z GARAŻU (Premium Style) ---
window.dEditExp = function(id) {
    let expList = window.db.drv.exp || [];
    let e = expList.find(function(x) { return x.id === id; });
    if(!e) return;
    
    let existing = document.getElementById('m-edit-exp');
    if(existing) existing.remove();

    let inpStyle = 'background:rgba(255,255,255,0.03); border-radius:14px; padding:16px; font-size:1.1rem; border:1px solid rgba(255,255,255,0.08); color:#f59e0b; width:100%; box-sizing:border-box; outline:none; font-weight:800; text-align:center;';
    
    let html = '<div id="m-edit-exp" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div style="background:linear-gradient(145deg, #18181b, #09090b); width:85%; max-width:320px; border-radius:28px; box-shadow:0 30px 60px rgba(0,0,0,0.8); text-align:center; overflow:hidden; border:1px solid rgba(245,158,11,0.3);">' +
            '<div style="padding:25px 20px 20px;">' +
                '<div style="font-size:2.5rem; margin-bottom:10px;">🔧</div>' +
                '<h3 style="color:#fff; margin:0 0 5px 0; font-size:1.2rem; font-weight:900; letter-spacing:0.5px;">Edytuj Wydatek</h3>' +
                '<p style="color:rgba(255,255,255,0.5); font-size:0.75rem; margin-bottom:20px;">Zmień kwotę wpisu: <br><strong>' + e.d + '</strong></p>' +
                '<div style="background:#000; border-radius:18px; padding:10px; border:1px inset rgba(255,255,255,0.05);">' +
                    '<input type="number" step="0.01" id="ee-v" value="'+Number(e.v||0).toFixed(2)+'" style="'+inpStyle+'">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; padding:0 20px 25px 20px; gap:10px;">' +
                '<button style="flex:1; padding:16px; background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:18px; color:rgba(255,255,255,0.5); font-size:0.9rem; font-weight:700; cursor:pointer;" onclick="document.getElementById(\'m-edit-exp\').remove()">Anuluj</button>' +
                '<button style="flex:1; padding:16px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; border-radius:18px; color:#000; font-size:0.9rem; font-weight:900; letter-spacing:0.5px; cursor:pointer;" onclick="window.dSaveEditExp('+id+')">Zapisz</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
};

window.dSaveEditExp = function(id) {
    let nv = parseFloat(document.getElementById('ee-v').value);
    if(isNaN(nv) || nv <= 0) return;

    let expList = window.db.drv.exp || [];
    let e = expList.find(function(x) { return x.id === id; });
    if(e) {
        e.v = nv;
        if(e.ty === 'f') {
            let fuelList = window.db.drv.fuel || [];
            let f = fuelList.find(function(x) { return x.o === e.odo; });
            if(f) f.v = nv;
            if(e.dist > 0) e.cpkm = nv / e.dist;
        }
        if(typeof window.save === 'function') window.save(); 
        if(typeof window.render === 'function') window.render();
    }
    let modal = document.getElementById('m-edit-exp');
    if(modal) modal.remove();
};

// --- MODAL: KOREKTA HISTORII (P&L) ---
window.dEditHistory = function(id) {
    let hList = window.db.drv.h || [];
    let h = hList.find(function(x) { return x.id === id; });
    if(!h) return;
    
    let existing = document.getElementById('m-edit-history');
    if(existing) existing.remove();

    let inpStyle = 'background:rgba(255,255,255,0.03); border-radius:14px; padding:15px; font-size:1rem; border:1px solid rgba(255,255,255,0.08); color:#fff; width:100%; box-sizing:border-box; outline:none; font-weight:700; text-align:center;';
    let lblStyle = 'font-size:0.6rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; display:block;';

    let html = '<div id="m-edit-history" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div style="background:linear-gradient(145deg, #18181b, #09090b); width:90%; max-width:350px; border-radius:28px; box-shadow:0 30px 60px rgba(0,0,0,0.8); text-align:center; overflow:hidden; border:1px solid rgba(16,185,129,0.3);">' +
            '<div style="padding:25px 20px 20px;">' +
                '<div style="font-size:2.5rem; margin-bottom:10px;">📊</div>' +
                '<h3 style="color:#10b981; margin:0 0 5px 0; font-size:1.2rem; font-weight:900; letter-spacing:0.5px;">Korekta Rozliczenia</h3>' +
                '<p style="color:rgba(255,255,255,0.5); font-size:0.75rem; margin-bottom:20px;">Data: <strong>' + h.dt + '</strong></p>' +
                
                '<div style="margin-bottom:15px; text-align:left;">' +
                    '<label style="'+lblStyle+'">Utarg Brutto (zł)</label>' +
                    '<input type="number" step="0.01" id="eh-g" value="'+Number(h.g||0).toFixed(2)+'" style="'+inpStyle+' color:#10b981;">' +
                '</div>' +
                '<div style="margin-bottom:20px; text-align:left;">' +
                    '<label style="'+lblStyle+'">Dystans (KM)</label>' +
                    '<input type="number" step="0.1" id="eh-k" value="'+Number(h.k||0).toFixed(1)+'" style="'+inpStyle+'">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; padding:0 20px 25px 20px; gap:10px;">' +
                '<button style="flex:1; padding:16px; background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:18px; color:rgba(255,255,255,0.5); font-size:0.9rem; font-weight:700; cursor:pointer;" onclick="document.getElementById(\'m-edit-history\').remove()">ANULUJ</button>' +
                '<button style="flex:1; padding:16px; background:linear-gradient(135deg, #10b981, #059669); border:none; border-radius:18px; color:#000; font-size:0.9rem; font-weight:900; letter-spacing:0.5px; cursor:pointer;" onclick="window.dSaveEditHistory('+id+')">PRZELICZ</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
};

window.dSaveEditHistory = function(id) {
    let ng = parseFloat(document.getElementById('eh-g').value);
    let nk = parseFloat(document.getElementById('eh-k').value);
    
    let hList = window.db.drv.h || [];
    let h = hList.find(function(x) { return x.id === id; });
    if(h && !isNaN(ng)) {
        h.g = ng; 
        h.k = isNaN(nk) ? 0 : nk;
        
        let d = window.db.drv;
        let taxRate = (d.cfg && d.cfg.tax) ? d.cfg.tax : 0;
        let fuelPx = (d.cfg && d.cfg.fuelPx) ? d.cfg.fuelPx : 0;
        let isPct = (d.cfg && d.cfg.eType === 'pct');
        let ePct = (d.cfg && d.cfg.ePct) ? d.cfg.ePct : 0;
        
        h.tx = h.g * taxRate; 
        h.pF = isPct ? h.g * ePct : 0; 
        h.fc = h.k * fuelPx;
        h.n = h.g - h.fc - h.tx - h.pF - (h.cF || 0) - (h.vF || 0);
        
        if(typeof window.save === 'function') window.save(); 
        if(typeof window.render === 'function') window.render();
    }
    let modal = document.getElementById('m-edit-history');
    if(modal) modal.remove();
};

// --- LOGIKA CRM: KLIENCI VIP ---
window.dAddCrm = function() {
    let n = document.getElementById('dc-n').value;
    let ph = document.getElementById('dc-p').value;
    if(!n) { if(window.sysAlert) window.sysAlert("Błąd", "Wpisz imię klienta!", "error"); return; }
    
    if(!window.db.drv.clients) window.db.drv.clients = [];
    window.db.drv.clients.unshift({id: Date.now(), n: n, ph: ph, bl: false});
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("VIP", "Klient dodany do bazy.", "success");
};

window.dCrmDel = function(id) {
    if(window.sysConfirm) {
        window.sysConfirm("Baza Klientów", "Czy na pewno usunąć tego klienta?", function() {
            window.db.drv.clients = (window.db.drv.clients || []).filter(function(x) { return x.id !== id; });
            if(typeof window.save === 'function') window.save(); 
            if(typeof window.render === 'function') window.render();
        });
    }
};

// --- LOGIKA: SZYBKI WYDATEK (Z BANERÓW) ---
window.dQuickExp = function(c, v) {
    if(!window.db.drv.exp) window.db.drv.exp = [];
    let dObj = new Date();
    window.db.drv.exp.unshift({
        id: Date.now(), rD: dObj.toISOString(), d: c, 
        v: v, dt: dObj.toLocaleDateString('pl-PL'), ty: 'e'
    });
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Zapisano", "Dodano wydatek: " + c, "success");
};
