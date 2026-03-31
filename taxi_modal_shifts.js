// ==========================================
// PLIK: taxi_modal_shifts.js - Edycja Licznika i Pojedynczych Kursów (Premium Style)
// ==========================================

// --- EDYCJA LICZNIKA GŁÓWNEGO (Korekta) ---
window.dEditGlobalOdo = function() {
    let d = window.db.drv || {};
    let oldOdo = Number(d.odo||0).toFixed(0);

    let existing = document.getElementById('m-apple-odo');
    if(existing) existing.remove();

    let html = '<div id="m-apple-odo" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div style="background:linear-gradient(145deg, #18181b, #09090b); width:85%; max-width:320px; border-radius:28px; box-shadow:0 30px 60px rgba(0,0,0,0.8); text-align:center; overflow:hidden; border:1px solid rgba(245,158,11,0.3);">' +
            '<div style="padding:25px 20px 20px;">' +
                '<div style="font-size:3rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(245,158,11,0.4));">🏎️</div>' +
                '<h3 style="color:#f59e0b; margin:0 0 8px 0; font-size:1.3rem; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase;">Stan licznika</h3>' +
                '<p style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin:0 0 20px 0; font-weight:600;">Wprowadź precyzyjnie przebieg pojazdu (ODO).</p>' +
                '<div style="background:rgba(0,0,0,0.5); border-radius:18px; padding:15px; border:1px inset rgba(255,255,255,0.05); box-shadow:inset 0 4px 15px rgba(0,0,0,0.3);">' +
                    '<input type="number" id="apple-odo-val" value="'+oldOdo+'" style="width:100%; background:transparent; border:none; color:#f59e0b; font-size:2.8rem; font-weight:900; text-align:center; outline:none; padding:0; text-shadow:0 0 15px rgba(245,158,11,0.4); letter-spacing:2px; font-family:monospace;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; padding:0 20px 20px 20px; gap:10px;">' +
                '<button style="flex:1; padding:15px; background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:18px; color:rgba(255,255,255,0.5); font-size:0.9rem; font-weight:700; cursor:pointer; outline:none;" onclick="document.getElementById(\'m-apple-odo\').remove()">ANULUJ</button>' +
                '<button style="flex:1; padding:15px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; border-radius:18px; color:#000; font-size:0.9rem; font-weight:900; letter-spacing:1px; cursor:pointer; outline:none; box-shadow:0 6px 20px rgba(245,158,11,0.3);" onclick="window.dSaveGlobalOdo('+oldOdo+')">ZAPISZ</button>' +
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
    
    window.db.drv.odo = newOdo;
    if (window.db.drv.sh && window.db.drv.sh.on) {
        window.db.drv.sh.o = newOdo; 
    }
    if(typeof window.save === 'function') window.save();

    let mod = document.getElementById('m-apple-odo');
    if(mod) mod.remove();

    if(typeof window.render === 'function') window.render();
};


// --- EDYCJA ODO START NA TRWAJĄCEJ ZMIANIE ---
window.dEditStartOdo = function() {
    let current = (window.db.drv && window.db.drv.sh && window.db.drv.sh.o) ? window.db.drv.sh.o : 0;
    
    let existing = document.getElementById('m-apple-odo-start');
    if(existing) existing.remove();

    let html = '<div id="m-apple-odo-start" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div style="background:linear-gradient(145deg, #18181b, #09090b); width:85%; max-width:320px; border-radius:28px; box-shadow:0 30px 60px rgba(0,0,0,0.8); text-align:center; overflow:hidden; border:1px solid rgba(14,165,233,0.3);">' +
            '<div style="padding:25px 20px 20px;">' +
                '<div style="font-size:3rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(14,165,233,0.4));">⏱️</div>' +
                '<h3 style="color:#0ea5e9; margin:0 0 8px 0; font-size:1.2rem; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase;">Korekta ODO Start</h3>' +
                '<p style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin:0 0 20px 0; font-weight:600;">Zmień stan licznika, z którym rozpoczynałeś zmianę.</p>' +
                '<div style="background:rgba(0,0,0,0.5); border-radius:18px; padding:15px; border:1px inset rgba(255,255,255,0.05); box-shadow:inset 0 4px 15px rgba(0,0,0,0.3);">' +
                    '<input type="number" id="apple-odo-start-val" value="'+current+'" style="width:100%; background:transparent; border:none; color:#0ea5e9; font-size:2.8rem; font-weight:900; text-align:center; outline:none; padding:0; text-shadow:0 0 15px rgba(14,165,233,0.4); letter-spacing:2px; font-family:monospace;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex; padding:0 20px 20px 20px; gap:10px;">' +
                '<button style="flex:1; padding:15px; background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:18px; color:rgba(255,255,255,0.5); font-size:0.9rem; font-weight:700; cursor:pointer; outline:none;" onclick="document.getElementById(\'m-apple-odo-start\').remove(); if(typeof window.openEndShiftModal === \'function\') window.openEndShiftModal();">ANULUJ</button>' +
                '<button style="flex:1; padding:15px; background:linear-gradient(135deg, #0ea5e9, #0284c7); border:none; border-radius:18px; color:#fff; font-size:0.9rem; font-weight:900; letter-spacing:1px; cursor:pointer; outline:none; box-shadow:0 6px 20px rgba(14,165,233,0.3);" onclick="window.dSaveStartOdo()">ZAPISZ</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(function() {
        let inp = document.getElementById('apple-odo-start-val');
        if(inp){ inp.focus(); inp.select(); }
    }, 150);
};

window.dSaveStartOdo = function() {
    let valEl = document.getElementById('apple-odo-start-val');
    if(!valEl) return;
    let v = parseFloat(valEl.value);

    if(v > 0) {
        window.db.drv.sh.o = v;
        window.db.drv.odo = v;
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
        
        let mod = document.getElementById('m-apple-odo-start');
        if(mod) mod.remove();
        
        // Powrót do ekranu zamykania zmiany z nową wartością
        setTimeout(function() { if(typeof window.openEndShiftModal === 'function') window.openEndShiftModal(); }, 150);
    } else {
        if(window.sysAlert) window.sysAlert("Błąd", "Wprowadź poprawną liczbę.", "error");
    }
};

// --- ANULOWANIE OMYŁKOWEJ ZMIANY ---
window.dCancelShift = function() {
    let m = document.getElementById('m-end-shift');
    if(m) m.remove();
    
    if(window.sysConfirm) {
        window.sysConfirm("Anulowanie Zmiany", "Na pewno chcesz usunąć trwającą zmianę? Niezapisane kursy z tego ekranu przepadną bezpowrotnie.", function() {
            window.db.drv.sh.on = false; 
            window.db.drv.sh.tr = []; 
            window.db.drv.liveRideStart = null; 
            window.db.drv.sh.t = null; 
            window.db.drv.sh.shiftStart = null; 
            window.db.drv.sh.sPS = null; 
            window.db.drv.sh.sPT = 0; 
            window.db.drv.sh.rWT = 0; 
            window.db.drv.sh.rWS = null;
            if(typeof window.save === 'function') window.save();
            if(typeof window.render === 'function') window.render();
            if(window.sysAlert) window.sysAlert("Anulowano", "Omyłkowa zmiana została skasowana. Możesz zacząć od nowa.", "success");
        });
    }
};

// --- EDYCJA POJEDYNCZEGO KURSU (W PANELU TRWAJĄCEJ ZMIANY) ---
window.dEditT = function(id) {
    let trList = (window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) ? window.db.drv.sh.tr : [];
    let tr = trList.find(function(x) { return x.id === id; }); 
    if(!tr) return;
    
    let existing = document.getElementById('m-edit-t');
    if(existing) existing.remove();

    let plat = (window.db.drv && window.db.drv.plat) ? window.db.drv.plat : 'apps';
    let srcOpts = plat === 'apps' ? 
        '<option value="Uber" '+(tr.s==='Uber'?'selected':'')+'>Uber</option><option value="Bolt" '+(tr.s==='Bolt'?'selected':'')+'>Bolt</option><option value="FreeNow" '+(tr.s==='FreeNow'?'selected':'')+'>FreeNow</option><option value="Inna" '+(tr.s==='Inna'?'selected':'')+'>Inna</option>' : 
        '<option value="Centrala" '+(tr.s==='Centrala'?'selected':'')+'>Centrala</option><option value="Postój" '+(tr.s==='Postój'?'selected':'')+'>Postój</option><option value="Prywatny" '+(tr.s==='Prywatny'?'selected':'')+'>Prywatny</option>';
    
    let payOpts = plat === 'apps' ? 
        '<option value="Aplikacja" '+(tr.p==='Aplikacja'?'selected':'')+'>Aplikacja</option><option value="Gotówka" '+(tr.p==='Gotówka'?'selected':'')+'>Gotówka</option>' : 
        '<option value="Gotówka" '+(tr.p==='Gotówka'?'selected':'')+'>Gotówka</option><option value="Karta" '+(tr.p==='Karta'?'selected':'')+'>Karta</option><option value="Voucher" '+(tr.p==='Voucher'?'selected':'')+'>Voucher</option>';
    
    let inpStyle = 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:1rem; font-weight:700; outline:none; width:100%; box-sizing:border-box;';
    let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block;';
    
    let html = '<div id="m-edit-t" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:30000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div class="panel" style="width:90%; max-width:350px; background: linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(14,165,233,0.3); border-radius:28px; box-shadow:0 25px 60px rgba(0,0,0,0.8); padding:0;">' +
            
            '<div style="padding:25px 20px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center; position:relative;">' +
                '<button style="position:absolute; right:20px; top:25px; background:rgba(255,255,255,0.05); border:none; width:35px; height:35px; border-radius:12px; color:#fff; font-weight:bold; cursor:pointer;" onclick="document.getElementById(\'m-edit-t\').remove()">✕</button>' +
                '<div style="font-size:2.5rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(14,165,233,0.4));">✏️</div>' +
                '<h3 style="margin:0; color:#0ea5e9; font-size:1.3rem; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase;">Edytuj Kurs</h3>' +
            '</div>' +
            
            '<div style="padding:20px;">' +
                '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Kwota (zł)</label><input type="number" step="0.01" id="et-v" value="'+Number(tr.v||0).toFixed(2)+'" style="'+inpStyle+' color:#10b981; font-size:1.2rem;"></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Dystans (KM)</label><input type="number" step="0.1" id="et-k" value="'+Number(tr.k||0).toFixed(1)+'" style="'+inpStyle+'"></div>' +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:25px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Aplikacja</label><select id="et-s" style="'+inpStyle+' appearance:none;">'+srcOpts+'</select></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Płatność</label><select id="et-p" style="'+inpStyle+' appearance:none;">'+payOpts+'</select></div>' +
                '</div>' +
                '<button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:18px; font-size:1.05rem; border-radius:20px; border:none; box-shadow:0 8px 25px rgba(14,165,233,0.35); width:100%; letter-spacing:1px; outline:none;" onclick="window.dSaveEditT('+id+')">ZAPISZ ZMIANY</button>' +
            '</div>' +
            
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dSaveEditT = function(id) { 
    let trList = (window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) ? window.db.drv.sh.tr : [];
    let tr = trList.find(function(x) { return x.id === id; }); 
    if(tr) { 
        let nv = window.safeVal('et-v'); 
        let nk = window.safeVal('et-k', 0); 
        let ns = document.getElementById('et-s').value; 
        let np = document.getElementById('et-p').value; 
        if(nv > 0) { 
            tr.v = nv; tr.k = nk; tr.s = ns; tr.p = np; 
            if(typeof window.save === 'function') window.save(); 
            if(typeof window.render === 'function') window.render(); 
        } else {
             if(window.sysAlert) window.sysAlert("Błąd", "Kwota musi być wyższa niż 0.", "error");
             return;
        }
    } 
    let modal = document.getElementById('m-edit-t');
    if(modal) modal.remove(); 
};

window.dDelT = function(id) { 
    if(window.sysConfirm) { 
        window.sysConfirm("Cofnij kurs", "Czy na pewno chcesz całkowicie usunąć ten kurs z trwającej zmiany?", function() { 
            if(window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) {
                window.db.drv.sh.tr = window.db.drv.sh.tr.filter(function(x) { return x.id !== id; }); 
                if(typeof window.save === 'function') window.save(); 
                if(typeof window.render === 'function') window.render(); 
            }
        }); 
    } 
};
