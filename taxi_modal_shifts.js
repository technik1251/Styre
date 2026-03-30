// ==========================================
// PLIK: taxi_modal_shifts.js - Zmiany, Kursy i Wbitki
// ==========================================

// --- EDYCJA LICZNIKA I ANULOWANIE ZMIANY ---
window.dEditGlobalOdo = function() {
    let current = window.db.drv.odo || 0;
    window.sysPrompt("Edytuj Licznik", "Obecnie: " + current, function(val) {
        let v = parseFloat(val);
        if(v > 0) {
            window.db.drv.odo = v;
            if (window.db.drv.sh && window.db.drv.sh.on) {
                window.db.drv.sh.o = v;
            }
            window.save();
            window.render();
            if(window.sysAlert) window.sysAlert("Sukces", "Stan licznika poprawiony!", "success");
        } else {
            if(window.sysAlert) window.sysAlert("Błąd", "Wprowadź poprawną liczbę większą od zera.", "error");
        }
    });
};

window.dEditStartOdo = function() {
    let current = (window.db.drv && window.db.drv.sh && window.db.drv.sh.o) ? window.db.drv.sh.o : 0;
    window.sysPrompt("Korekta ODO Start", "Obecnie: " + current, function(val) {
        let v = parseFloat(val);
        if(v > 0) {
            window.db.drv.sh.o = v;
            window.db.drv.odo = v;
            window.save();
            window.render();
            setTimeout(function() { window.openEndShiftModal(); }, 200);
        } else {
            if(window.sysAlert) window.sysAlert("Błąd", "Wprowadź poprawną liczbę.", "error");
        }
    });
};

window.dCancelShift = function() {
    let m = document.getElementById('m-end-shift');
    if(m) m.remove();
    
    if(window.sysConfirm) {
        window.sysConfirm("Anulowanie Zmiany", "Na pewno chcesz usunąć trwającą zmianę? Niezapisane kursy z tego ekranu przepadną.", function() {
            window.db.drv.sh.on = false; 
            window.db.drv.sh.tr = []; 
            window.db.drv.liveRideStart = null; 
            window.db.drv.sh.t = null; 
            window.db.drv.sh.shiftStart = null; 
            window.db.drv.sh.sPS = null; 
            window.db.drv.sh.sPT = 0; 
            window.db.drv.sh.rWT = 0; 
            window.db.drv.sh.rWS = null;
            window.save();
            window.render();
            if(window.sysAlert) window.sysAlert("Anulowano", "Omyłkowa zmiana została skasowana.", "success");
        });
    }
};

// --- SYSTEM PRACY (ZMIANA) ---
window.openEndShiftModal = function() {
    let diffHrs=0, diffMins=0, autoHw=0, shiftDateStr = window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0];
    
    if(window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.shiftStart) {
        let activeShiftMs = Date.now() - window.db.drv.sh.shiftStart;
        if(window.db.drv.sh.sPT) activeShiftMs -= window.db.drv.sh.sPT;
        diffHrs = Math.floor(activeShiftMs/3600000);
        diffMins = Math.floor((activeShiftMs%3600000)/60000);
        autoHw = Number(activeShiftMs/3600000).toFixed(1);
        if(autoHw < 0) autoHw = 0;
        shiftDateStr = window.getLocalYMD ? window.getLocalYMD(new Date(window.db.drv.sh.shiftStart)) : new Date(window.db.drv.sh.shiftStart).toISOString().split('T')[0];
    }
    
    let startOdo = (window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.o) ? window.db.drv.sh.o : 0;
    
    let d = window.db.drv;
    let plat = d.plat;
    let g=0;
    if(d.sh && d.sh.tr) {
        for(let i=0; i<d.sh.tr.length; i++) g += (parseFloat(d.sh.tr[i].v) || 0);
    }

    let offlineInputsHtml = '';
    if(plat === 'apps') {
        offlineInputsHtml = 
            '<div style="background:rgba(0,0,0,0.3); border:1px inset rgba(255,255,255,0.05); border-radius:20px; padding:20px; margin-bottom:15px;">' +
                '<label style="font-size:0.65rem; color:#0ea5e9; font-weight:800; text-align:center; display:block; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">POTWIERDŹ UTARG Z APLIKACJI (ZŁ)</label>' +
                '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">' +
                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-m-uber" placeholder="Uber" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:1rem; font-weight:700; outline:none;"></div>' +
                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-m-bolt" placeholder="Bolt" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:1rem; font-weight:700; outline:none;"></div>' +
                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-m-freenow" placeholder="FreeNow" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:1rem; font-weight:700; outline:none;"></div>' +
                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-m-inna" placeholder="Inna Apka" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:1rem; font-weight:700; outline:none;"></div>' +
                '</div>' +
                '<div style="font-size:0.65rem; color:rgba(255,255,255,0.4); text-align:center; margin-top:12px; font-weight:600;">(Gotówkę aplikacja zsumuje z dziennika)</div>' +
            '</div>';
    } else {
        offlineInputsHtml = 
            '<div style="background:rgba(0,0,0,0.3); border:1px inset rgba(255,255,255,0.05); border-radius:20px; padding:20px; margin-bottom:15px;">' +
                '<label style="font-size:0.65rem; color:#0ea5e9; font-weight:800; text-align:center; display:block; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">POTWIERDŹ UTARG (ZŁ)</label>' +
                '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">' +
                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-m-karta" placeholder="Karta/Terminal" style="background:rgba(14,165,233,0.05); border:1px solid rgba(14,165,233,0.3); color:#0ea5e9; border-radius:14px; padding:16px; text-align:center; font-size:1.15rem; font-weight:800; outline:none;"></div>' +
                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-m-voucher" placeholder="Vouchery" style="background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.3); color:#a855f7; border-radius:14px; padding:16px; text-align:center; font-size:1.15rem; font-weight:800; outline:none;"></div>' +
                '</div>' +
                '<div style="font-size:0.65rem; color:rgba(255,255,255,0.4); text-align:center; margin-top:12px; font-weight:600;">(Gotówkę aplikacja zsumuje z dziennika)</div>' +
            '</div>';
    }

    let html = '<div id="m-end-shift" class="modal-overlay" style="z-index: 30000; animation: fadeIn 0.3s ease; position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px);">' +
        '<div class="panel" style="width:90%; max-width:400px; max-height:90vh; overflow-y:auto; border-radius:28px; background: linear-gradient(145deg, #18181b, #09090b); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 25px 60px rgba(0,0,0,0.8); display:flex; flex-direction:column; padding:0;">' +
            
            // Nagłówek modala
            '<div style="padding:25px 20px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center; position:relative;">' +
                '<button style="position:absolute; right:20px; top:25px; background:rgba(255,255,255,0.05); border:none; width:35px; height:35px; border-radius:12px; color:#fff; font-weight:bold; cursor:pointer;" onclick="document.getElementById(\'m-end-shift\').remove()">✕</button>' +
                '<div style="font-size:2.5rem; margin-bottom:10px; text-shadow:0 0 15px rgba(239,68,68,0.4);">🏁</div>' +
                '<h3 style="color:#ef4444; margin:0 0 5px 0; font-size:1.3rem; font-weight:900; letter-spacing:-0.5px;">Zakończ Zmianę</h3>' +
                '<p style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin:0; font-weight:600;">Rozlicz się, aby poznać puste kilometry.</p>' +
            '</div>' +
            
            // Główna zawartość
            '<div style="padding:20px;">' +
                
                // Statystyki z timera
                '<div style="display:flex; justify-content:space-between; margin-bottom:15px; background:rgba(0,0,0,0.5); padding:10px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">' +
                    '<div style="text-align:center; flex:1;">' +
                        '<span style="font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase;">Czas zmiany</span><br>' +
                        '<strong style="color:#0ea5e9; font-size:1.1rem; letter-spacing:1px;">'+diffHrs+'h '+diffMins+'m</strong>' +
                    '</div>' +
                    '<div style="text-align:center; flex:1; border-left:1px solid rgba(255,255,255,0.1);">' +
                        '<span style="font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase;">Wbity utarg</span><br>' +
                        '<strong style="color:#10b981; font-size:1.1rem; letter-spacing:1px;">'+Number(g).toFixed(2)+' zł</strong>' +
                    '</div>' +
                '</div>' +

                // Data zmiany i czas pracy w jednym rzędzie
                '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0;">' +
                        '<label style="font-size:0.65rem; color:var(--muted); font-weight:700; margin-bottom:4px; display:block;">Data zmiany</label>' +
                        '<input type="date" id="de-d1" value="'+shiftDateStr+'" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:0.85rem; font-weight:700; outline:none; width:100%; box-sizing:border-box;">' +
                    '</div>' +
                    '<div class="inp-group" style="margin:0;">' +
                        '<label style="font-size:0.65rem; color:var(--muted); font-weight:700; margin-bottom:4px; display:block;">Czas pracy (h)</label>' +
                        '<input type="number" step="0.1" id="de-h" value="'+autoHw+'" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:0.85rem; font-weight:700; outline:none; width:100%; box-sizing:border-box;">' +
                    '</div>' +
                '</div>' +

                // LEDowy licznik
                '<div style="background:#111116; border-radius:24px; padding:20px; text-align:center; border:1px solid #2a2a35; box-shadow:inset 0 4px 20px rgba(0,0,0,0.5); margin-bottom:20px;">' +
                    '<div style="font-size:0.65rem; color:#ef4444; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px;">STAN LICZNIKA POJAZDU (KONIEC)</div>' +
                    '<input type="number" id="de-o" placeholder="np. '+(startOdo + 100)+'" style="width:100%; background:transparent; border:none; color:#ef4444; font-size:3rem; font-weight:900; text-align:center; outline:none; padding:0; text-shadow:0 0 15px rgba(239,68,68,0.4); letter-spacing:2px; font-family:monospace;">' +
                    '<div style="font-size:0.65rem; color:rgba(255,255,255,0.4); text-align:center; margin-top:10px; font-weight:600; cursor:pointer;" onclick="document.getElementById(\'m-end-shift\').remove(); window.dEditStartOdo();">Licznik Startowy: '+startOdo+' KM <span style="font-size:0.8rem; color:#0ea5e9;">✏️</span></div>' +
                '</div>' +

                offlineInputsHtml +
                
                '<div class="inp-group" style="margin-bottom:10px;">' +
                    '<label style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:700; margin-bottom:6px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Dystans Płatny (KM z Aplikacji)</label>' +
                    '<input type="number" id="dw-m-pk" placeholder="Z pasażerem (KM z apek)" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:16px; padding:16px; text-align:center; font-size:1rem; font-weight:600; outline:none; width:100%; box-sizing:border-box;">' +
                '</div>' +

            '</div>' +
            
            // Footer modala
            '<div style="padding:0 20px 25px 20px;">' +
                '<button class="btn" style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; font-weight:900; padding:20px; font-size:1.1rem; letter-spacing:1px; border-radius:24px; border:none; box-shadow:0 10px 30px rgba(239,68,68,0.3); width:100%; outline:none;" onclick="window.dEndS()">ROZLICZ I ZAKOŃCZ ZMIANĘ</button>' +
                '<button class="btn" style="background:transparent; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:24px; box-shadow:none; padding:15px; margin-top:10px; font-weight:700; font-size:0.9rem; width:100%; outline:none;" onclick="document.getElementById(\'m-end-shift\').remove()">ANULUJ ZAMYKANIE</button>' +
                
                '<div style="text-align:center; margin-top:20px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.1);">' +
                    '<span style="color:#ef4444; font-size:0.7rem; text-decoration:underline; font-weight:700; cursor:pointer; opacity:0.8;" onclick="window.dCancelShift()">Omyłkowo rozpoczęta zmiana? Anuluj bez zapisu.</span>' +
                '</div>' +
            '</div>' +
            
        '</div>' +
    '</div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(function() { let e = document.getElementById('de-o'); if(e) e.focus(); }, 100);
};

window.dStartS = function() {
    let el = document.getElementById('ds-o');
    if(!el || el.value === '') { 
        if(el) { el.style.borderBottom='2px solid var(--danger)'; el.classList.add('shake-anim'); setTimeout(function(){el.classList.remove('shake-anim')},300); } 
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz aktualny stan licznika (KM)."); 
        return; 
    }
    
    let o = parseFloat(el.value);
    if(isNaN(o) || o <= 0) { 
        if(el) { el.style.borderBottom='2px solid var(--danger)'; el.classList.add('shake-anim'); setTimeout(function(){el.classList.remove('shake-anim')},300); } 
        if(window.sysAlert) return window.sysAlert("Błąd", "Stan licznika musi być liczbą!"); 
        return; 
    }
    
    if(!window.db.drv) window.db.drv = {};
    window.db.drv.odo = o;
    window.db.drv.sh = {on:true, o:o, t:Date.now(), shiftStart:Date.now(), sPT:0, sPS:null, rWT:0, rWS:null, tr:[]};
    window.db.drv.liveRideStart = null;
    window.save(); 
    window.render();
};

window.dEndS = function() {
    let d1 = document.getElementById('de-d1').value; 
    let dtStr = new Date(d1).toLocaleDateString('pl-PL'); 
    let saveDate = new Date(d1); 
    saveDate.setHours(12,0,0);
    
    let endOdo = window.safeVal('de-o'); 
    let startOdo = (window.db.drv && window.db.drv.sh && window.db.drv.sh.o) ? window.db.drv.sh.o : 0;
    let k = endOdo - startOdo;
    
    if(k <= 0) { 
        let el = document.getElementById('de-o'); 
        if(el) { el.style.borderBottom='2px solid var(--danger)'; el.classList.add('shake-anim'); setTimeout(function(){el.classList.remove('shake-anim')},300); } 
        if(window.sysAlert) return window.sysAlert("Błąd", "Stan końcowy musi być wyższy niż startowy ("+startOdo+" km)! Możesz edytować ODO Start używając ołówka poniżej licznika."); 
        return; 
    }
    
    let hW = window.safeVal('de-h', 0);
    let pk = window.safeVal('dw-m-pk', 0);
    
    let d = window.db.drv;
    let plat = d.plat;
    let g=0, cf=0, vf=0;
    
    let cardFee = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.cardF) ? window.db.drv.cfg.cardF : 0;
    let vouchFee = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.voucherF) ? window.db.drv.cfg.voucherF : 0;
    let fuelPx = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.fuelPx) ? window.db.drv.cfg.fuelPx : 0;
    let taxRate = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.tax) ? window.db.drv.cfg.tax : 0;
    let isPct = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.eType === 'pct');
    let ePct = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.ePct) ? window.db.drv.cfg.ePct : 0;
    
    let trList = (window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) ? window.db.drv.sh.tr : [];
    let newTrList = [];
    
    // Z dziennika zmian
    for(let i=0; i<trList.length; i++) {
        let x = trList[i];
        let xv = parseFloat(x.v) || 0;
        newTrList.push(x);
        g += xv; 
        if(x.p === 'Karta') cf += xv * cardFee;
        if(x.p === 'Voucher') vf += xv * vouchFee;
    }
    
    // Z formularza zamykania (apki/terminal)
    if (plat === 'apps') {
        let vUber = parseFloat(document.getElementById('dw-m-uber').value) || 0;
        let vBolt = parseFloat(document.getElementById('dw-m-bolt').value) || 0;
        let vFree = parseFloat(document.getElementById('dw-m-freenow').value) || 0;
        let vInna = parseFloat(document.getElementById('dw-m-inna').value) || 0;
        
        if (vUber > 0) newTrList.push({id: Date.now()+1, p: 'Aplikacja', s: 'Uber', v: vUber, k: 0, time: '--:--'});
        if (vBolt > 0) newTrList.push({id: Date.now()+2, p: 'Aplikacja', s: 'Bolt', v: vBolt, k: 0, time: '--:--'});
        if (vFree > 0) newTrList.push({id: Date.now()+3, p: 'Aplikacja', s: 'FreeNow', v: vFree, k: 0, time: '--:--'});
        if (vInna > 0) newTrList.push({id: Date.now()+4, p: 'Aplikacja', s: 'Inna', v: vInna, k: 0, time: '--:--'});
        
        g += (vUber + vBolt + vFree + vInna);
    } else {
        let vKarta = parseFloat(document.getElementById('dw-m-karta').value) || 0;
        let vVouch = parseFloat(document.getElementById('dw-m-voucher').value) || 0;
        
        if (vKarta > 0) newTrList.push({id: Date.now()+2, p: 'Karta', s: 'Terminal', v: vKarta, k: 0, time: '--:--'});
        if (vVouch > 0) newTrList.push({id: Date.now()+3, p: 'Voucher', s: 'Korporacja', v: vVouch, k: 0, time: '--:--'});
        
        g += (vKarta + vVouch);
        cf += vKarta * cardFee;
        vf += vVouch * vouchFee;
    }
    
    let emptyK = Math.max(0, k - pk);
    let fc = k * fuelPx;
    let tax = g * taxRate;
    let pFee = isPct ? g * ePct : 0;
    let n_operacyjny = g - fc - tax - pFee - cf - vf;
    
    if(startOdo > 0) window.db.drv.odo = startOdo + k;
    
    if(!window.db.drv.h) window.db.drv.h = [];
    
    window.db.drv.h.unshift({
        id: Date.now(), rD: saveDate.toISOString(), dt: dtStr, hW: hW, 
        g: g, n: n_operacyjny, k: k, pk: pk, emptyK: emptyK, 
        fc: fc, tx: tax, pF: pFee, cF: cf, vF: vf, tr: newTrList
    });
    window.db.drv.h.sort(function(a,b){ return new Date(b.rD) - new Date(a.rD) });
    
    window.db.drv.sh.on = false; 
    window.db.drv.sh.tr = []; 
    window.db.drv.liveRideStart = null; 
    window.db.drv.sh.t = null; 
    window.db.drv.sh.shiftStart = null; 
    window.db.drv.sh.sPS = null; 
    window.db.drv.sh.sPT = 0; 
    window.db.drv.sh.rWT = 0; 
    window.db.drv.sh.rWS = null;
    
    window.save(); 
    
    let modalEl = document.getElementById('m-end-shift'); 
    if(modalEl) modalEl.remove(); 
    
    window.db.tab = 'stats'; 
    window.render();
    
    // --- PODSUMOWANIE ZMIANY PREMIUM ---
    let mHtml = '<div id="m-summary" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index: 30000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.3s ease;">' +
        '<div class="panel" style="width:90%; max-width:380px; border-radius:28px; border:1px solid rgba(16,185,129,0.3); text-align:center; padding:30px 20px; background: linear-gradient(145deg, #18181b, #09090b); box-shadow:0 25px 60px rgba(0,0,0,0.8); max-height: 90vh; overflow-y: auto;">' +
            '<div style="font-size:4rem; margin-bottom:10px; filter:drop-shadow(0 0 15px rgba(16,185,129,0.4));">🏁</div>' +
            '<h2 style="color:#10b981; margin:0 0 5px 0; font-size:1.6rem; font-weight:900; letter-spacing:-0.5px;">ZMIANA ZAKOŃCZONA</h2>' +
            '<p style="color:rgba(255,255,255,0.4); font-size:0.85rem; font-weight:600; margin-bottom:20px; text-transform:uppercase; letter-spacing:1px;">RAPORT Z DNIA: <strong style="color:#fff">'+dtStr+'</strong></p>' +
            
            '<div style="background:#111116; padding:20px; border-radius:20px; margin-bottom:15px; text-align:left; border:1px solid #2a2a35; box-shadow:inset 0 2px 10px rgba(0,0,0,0.2);">' +
                '<div style="color:#0ea5e9; font-size:0.7rem; text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:12px; display:flex; align-items:center; gap:6px;"><span>📊</span> Wyniki Finansowe</div>' +
                '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:rgba(255,255,255,0.6); font-size:0.85rem; font-weight:600;">Utarg Brutto:</span><strong style="color:#10b981; font-size:1rem;">'+Number(g||0).toFixed(2)+' zł</strong></div>' +
                '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:rgba(255,255,255,0.6); font-size:0.85rem; font-weight:600;">Prowizje / Podatki:</span><strong style="color:#ef4444; font-size:1rem;">-'+Number((tax+pFee+cf+vf)||0).toFixed(2)+' zł</strong></div>' +
                '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:rgba(255,255,255,0.6); font-size:0.85rem; font-weight:600;">Koszty Paliwa:</span><strong style="color:#f59e0b; font-size:1rem;">-'+Number(fc||0).toFixed(2)+' zł</strong></div>' +
                '<div style="display:flex; justify-content:space-between; margin-top:12px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:12px; align-items:center;"><span style="color:#fff; font-weight:800; font-size:0.95rem; text-transform:uppercase; letter-spacing:0.5px;">Zysk Operacyjny:</span><strong style="color:'+(n_operacyjny>=0?'#10b981':'#ef4444')+'; font-size:1.4rem; font-weight:900; letter-spacing:-1px;">'+Number(n_operacyjny||0).toFixed(2)+' zł</strong></div>' +
            '</div>' +
            
            '<div style="background:#111116; padding:20px; border-radius:20px; margin-bottom:25px; text-align:left; border:1px solid #2a2a35; box-shadow:inset 0 2px 10px rgba(0,0,0,0.2);">' +
                '<div style="color:#f59e0b; font-size:0.7rem; text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:12px; display:flex; align-items:center; gap:6px;"><span>🚗</span> Statystyki Trasy</div>' +
                '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:rgba(255,255,255,0.6); font-size:0.85rem; font-weight:600;">Całkowity dystans:</span><strong style="color:#fff; font-size:1rem;">'+Number(k||0).toFixed(1)+' km</strong></div>' +
                '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:rgba(255,255,255,0.6); font-size:0.85rem; font-weight:600;">Z pasażerem (Płatny):</span><strong style="color:#10b981; font-size:1rem;">'+Number(pk||0).toFixed(1)+' km</strong></div>' +
                '<div style="display:flex; justify-content:space-between;"><span style="color:rgba(255,255,255,0.6); font-size:0.85rem; font-weight:600;">Puste (Dojazdy):</span><strong style="color:#ef4444; font-size:1rem;">'+Number(emptyK||0).toFixed(1)+' km</strong></div>' +
            '</div>' +
            
            '<button class="btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#000; padding:18px; font-weight:900; font-size:1.05rem; letter-spacing:1px; border-radius:20px; border:none; box-shadow:0 8px 25px rgba(16,185,129,0.3); width:100%; outline:none;" onclick="document.getElementById(\'m-summary\').remove();">ZOBACZ PEŁNE P&L</button>' +
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', mHtml);
    
    // EFEKT WOW: Odpalenie Konfetti na koniec zmiany!
    if(typeof window.shootConfetti === 'function') {
        setTimeout(function(){ window.shootConfetti(); }, 300);
    }
};

// --- TRANSAKCJE TAXI (DODAWANIE / EDYCJA KURSU) ---
window.dAddT = function() {
    let v = window.safeVal('dt-v'), k = window.safeVal('dt-k'), m = window.safeVal('dt-m');
    let cIdel = document.getElementById('dt-cid'); 
    let cId = cIdel ? parseInt(cIdel.value) || null : null;
    
    if(!v || v <= 0) { 
        let vEl = document.getElementById('dt-v'); 
        if(vEl) { vEl.style.borderBottom='2px solid var(--danger)'; vEl.classList.add('shake-anim'); setTimeout(function(){vEl.classList.remove('shake-anim')},300); } 
        if(window.sysAlert) return window.sysAlert("Brak Kwoty", "Podaj kwotę z apki!"); 
        return; 
    }
    
    let otherSrcEl = document.getElementById('dt-other-src');
    let finalSrc = window.dTSrc === 'Inna' ? (otherSrcEl ? otherSrcEl.value || 'Inna Apka' : 'Inna Apka') : window.dTSrc;
    let timeNow = new Date().toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
    
    if(!window.db.drv.sh.tr) window.db.drv.sh.tr = [];
    window.db.drv.sh.tr.unshift({id: Date.now(), v: v, k: k, m: m, s: finalSrc, p: window.dTPay, c: cId, time: timeNow});
    window.save(); 
    window.render();
};

window.dEditT = function(id) {
    let trList = (window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) ? window.db.drv.sh.tr : [];
    let tr = trList.find(function(x) { return x.id === id; }); 
    if(!tr) return;
    
    let plat = (window.db.drv && window.db.drv.plat) ? window.db.drv.plat : 'apps';
    let srcOpts = plat === 'apps' ? 
        '<option value="Uber" '+(tr.s==='Uber'?'selected':'')+'>Uber</option><option value="Bolt" '+(tr.s==='Bolt'?'selected':'')+'>Bolt</option><option value="FreeNow" '+(tr.s==='FreeNow'?'selected':'')+'>FreeNow</option><option value="Inna" '+(tr.s==='Inna'?'selected':'')+'>Inna</option>' : 
        '<option value="Centrala" '+(tr.s==='Centrala'?'selected':'')+'>Centrala</option><option value="Postój" '+(tr.s==='Postój'?'selected':'')+'>Postój</option><option value="Prywatny" '+(tr.s==='Prywatny'?'selected':'')+'>Prywatny</option>';
    
    let payOpts = plat === 'apps' ? 
        '<option value="Aplikacja" '+(tr.p==='Aplikacja'?'selected':'')+'>Aplikacja</option><option value="Gotówka" '+(tr.p==='Gotówka'?'selected':'')+'>Gotówka</option>' : 
        '<option value="Gotówka" '+(tr.p==='Gotówka'?'selected':'')+'>Gotówka</option><option value="Karta" '+(tr.p==='Karta'?'selected':'')+'>Karta</option><option value="Voucher" '+(tr.p==='Voucher'?'selected':'')+'>Voucher</option>';
    
    let inpStyle = 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:1rem; font-weight:700; outline:none; width:100%; box-sizing:border-box;';
    
    let html = '<div id="m-edit-t" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:30000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div class="panel" style="width:90%; max-width:350px; background: linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.08); border-radius:28px; box-shadow:0 20px 50px rgba(0,0,0,0.8); padding:0;">' +
            
            '<div style="padding:25px 20px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center; position:relative;">' +
                '<button style="position:absolute; right:20px; top:25px; background:rgba(255,255,255,0.05); border:none; width:35px; height:35px; border-radius:12px; color:#fff; font-weight:bold; cursor:pointer;" onclick="document.getElementById(\'m-edit-t\').remove()">✕</button>' +
                '<h3 style="margin:0; color:#0ea5e9; font-size:1.2rem; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase;">✏️ Edytuj Kurs</h3>' +
            '</div>' +
            
            '<div style="padding:20px;">' +
                '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:var(--muted); font-weight:700; margin-bottom:6px; display:block;">Kwota (zł)</label><input type="number" step="0.01" id="et-v" value="'+Number(tr.v||0).toFixed(2)+'" style="'+inpStyle+' color:#10b981;"></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:var(--muted); font-weight:700; margin-bottom:6px; display:block;">Dystans (KM)</label><input type="number" step="0.1" id="et-k" value="'+Number(tr.k||0).toFixed(1)+'" style="'+inpStyle+'"></div>' +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:20px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:var(--muted); font-weight:700; margin-bottom:6px; display:block;">Źródło</label><select id="et-s" style="'+inpStyle+' padding:15px;">'+srcOpts+'</select></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:var(--muted); font-weight:700; margin-bottom:6px; display:block;">Płatność</label><select id="et-p" style="'+inpStyle+' padding:15px;">'+payOpts+'</select></div>' +
                '</div>' +
                '<button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:18px; font-size:1rem; border-radius:20px; border:none; box-shadow:0 8px 25px rgba(14,165,233,0.3); width:100%; letter-spacing:1px; outline:none;" onclick="window.dSaveEditT('+id+')">ZAPISZ ZMIANY</button>' +
                '<button class="btn" style="background:transparent; color:rgba(255,255,255,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:20px; box-shadow:none; padding:15px; margin-top:10px; font-weight:700; font-size:0.85rem; width:100%; outline:none;" onclick="document.getElementById(\'m-edit-t\').remove()">ANULUJ</button>' +
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
            window.save(); 
            window.render(); 
        } 
    } 
    let modal = document.getElementById('m-edit-t');
    if(modal) modal.remove(); 
};

window.dDelT = function(id) { 
    if(window.sysConfirm) { 
        window.sysConfirm("Cofnij kurs", "Na pewno usunąć ten kurs?", function() { 
            if(window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) {
                window.db.drv.sh.tr = window.db.drv.sh.tr.filter(function(x) { return x.id !== id; }); 
                window.save(); 
                window.render(); 
            }
        }); 
    } 
};

// --- WBITKI OFFLINE (RAPORTY) ---
// Note: przeniesiono i ulepszono logikę do dAddOfflineWeekly (z podziałem na aplikacje)

// --- SYNCHRONIZACJA Z DOMEM (TRANSFER GOTÓWKI + KONFETTI 🎉) Premium Apple Style ---
window.dTransferToHomeModal = function() {
    let accOpts = '';
    if (window.db.home && window.db.home.accs) {
        for(let i=0; i<window.db.home.accs.length; i++) {
            let a = window.db.home.accs[i];
            accOpts += '<option value="'+a.id+'">'+a.n+'</option>';
        }
    }
    
    if(accOpts === '') { 
        if(window.sysAlert) return window.sysAlert('Brak Portfeli', 'Nie masz żadnych kont w Budżecie Domowym. Dodaj je najpierw w module domowym!', 'error'); 
        return; 
    }
    
    let totalCashEarned = 0;
    if(window.db.drv && window.db.drv.h) {
        for(let i=0; i<window.db.drv.h.length; i++) {
            let s = window.db.drv.h[i];
            if(s.tr) {
                for(let j=0; j<s.tr.length; j++) {
                    let t = s.tr[j];
                    if(t.p === 'Gotówka') totalCashEarned += (parseFloat(t.v)||0);
                }
            }
        }
    }
    if(window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) {
        for(let i=0; i<window.db.drv.sh.tr.length; i++) {
            let t = window.db.drv.sh.tr[i];
            if(t.p === 'Gotówka') totalCashEarned += (parseFloat(t.v)||0);
        }
    }
    
    let totalTransferred = 0;
    if(window.db.home && window.db.home.trans) {
        for(let i=0; i<window.db.home.trans.length; i++) {
            let t = window.db.home.trans[i];
            if(t.cat === 'Wypłata z Etatu' && t.d === 'Utarg z Taxi') {
                totalTransferred += (parseFloat(t.v)||0);
            }
        }
    }
    
    let availableCash = totalCashEarned - totalTransferred;
    if (availableCash <= 0) {
        if(window.sysAlert) return window.sysAlert('Portfel Pusty', 'Rozliczyłeś już całą gotówkę z Taxi. Wszystko się zgadza!', 'info');
        return;
    }
    
    let html = '<div id="m-transfer-home" class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:30000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.8); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); animation:fadeIn 0.3s ease;">' +
        '<div class="panel" style="width:90%; max-width:360px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(16,185,129,0.3); border-radius:32px; box-shadow:0 30px 60px rgba(0,0,0,0.9); overflow:hidden;">' +
            
            '<div style="background:rgba(16,185,129,0.05); padding:30px 20px 20px 20px; text-align:center; border-bottom:1px solid rgba(16,185,129,0.1); position:relative;">' +
                '<button style="position:absolute; right:20px; top:20px; background:rgba(255,255,255,0.05); border:none; width:35px; height:35px; border-radius:12px; color:#fff; font-weight:bold; cursor:pointer;" onclick="document.getElementById(\'m-transfer-home\').remove()">✕</button>' +
                '<div style="font-size:3.5rem; margin-bottom:5px; filter:drop-shadow(0 0 15px rgba(16,185,129,0.5)); animation: pulse 2s infinite;">💸</div>' +
                '<h3 style="margin:0; color:#10b981; font-size:1.3rem; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase;">Przelew Utargu</h3>' +
            '</div>' +
            
            '<div style="padding:25px 20px;">' +
                
                '<div style="text-align:center; margin-bottom:25px;">' +
                    '<span style="font-size:0.7rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px;">Nierozliczona gotówka w portfelu</span>' +
                    '<strong style="font-size:2.2rem; color:#fff; font-weight:900; letter-spacing:-1px;">'+Number(availableCash).toFixed(2)+' zł</strong>' +
                '</div>' +
                
                '<div class="inp-group" style="margin-bottom:15px;">' +
                    '<label style="font-size:0.65rem; color:var(--muted); font-weight:700; margin-bottom:6px; display:block; text-transform:uppercase;">Kwota do przelania (zł)</label>' +
                    '<input type="number" step="0.01" id="dth-v" max="'+availableCash+'" value="'+Number(availableCash).toFixed(2)+'" style="background:rgba(255,255,255,0.03); border:1px solid rgba(16,185,129,0.3); color:#10b981; border-radius:16px; padding:16px; text-align:center; font-size:1.2rem; font-weight:900; outline:none; width:100%; box-sizing:border-box;">' +
                '</div>' +
                
                '<div class="inp-group" style="margin-bottom:25px;">' +
                    '<label style="font-size:0.65rem; color:var(--muted); font-weight:700; margin-bottom:6px; display:block; text-transform:uppercase;">Wybierz portfel domowy</label>' +
                    '<select id="dth-acc" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:16px; padding:16px; font-size:0.95rem; font-weight:700; outline:none; width:100%; box-sizing:border-box; appearance:none;">'+accOpts+'</select>' +
                '</div>' +
                
                '<button id="btn-transfer-exec" class="btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#000; font-weight:900; padding:20px; font-size:1.05rem; letter-spacing:1px; border-radius:20px; border:none; box-shadow:0 10px 30px rgba(16,185,129,0.3); width:100%; outline:none;" onclick="window.dExecTransferToHome()">ZAKSIĘGUJ W DOMU</button>' +
            '</div>' +
            
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dExecTransferToHome = function() {
    let inputEl = document.getElementById('dth-v');
    let v = parseFloat(inputEl.value);
    let maxV = parseFloat(inputEl.getAttribute('max'));
    let accId = document.getElementById('dth-acc').value;
    let btn = document.getElementById('btn-transfer-exec');
    
    if(!v || v <= 0) { 
        if(window.sysAlert) window.sysAlert('Błąd', 'Podaj poprawną kwotę!', 'error'); 
        return; 
    }
    
    if(v > maxV + 0.05) {
        if(window.sysAlert) window.sysAlert('Odmowa', "Próbujesz przelać więcej, niż masz w gotówce z Taxi! (Maksymalnie: "+Number(maxV).toFixed(2)+" zł)", 'error'); 
        return;
    }
    
    if(btn) {
        btn.innerHTML = "PRZEKAZYWANIE... 💸";
        btn.style.opacity = "0.7";
        btn.disabled = true;
    }
    
    let dObj = new Date(); 
    dObj.setHours(12,0,0);
    
    if(!window.db.home) window.db.home = {trans: []};
    if(!window.db.home.trans) window.db.home.trans = [];
    
    let dtStr = window.getLocalYMD ? window.getLocalYMD(dObj) : dObj.toISOString().split('T')[0];
    
    window.db.home.trans.push({
        id: Date.now(), type: 'inc', cat: 'Wypłata z Etatu', acc: accId,
        d: 'Utarg z Taxi', v: v, who: window.db.userName || 'Kierowca',
        dt: dtStr, rD: dObj.toISOString(), isPlanned: false
    });
    
    window.db.home.trans.sort(function(a,b){ return new Date(b.rD) - new Date(a.rD); });
    window.save();
    
    if(typeof window.shootConfetti === 'function') {
        window.shootConfetti();
    }
    
    setTimeout(function() {
        let modal = document.getElementById('m-transfer-home');
        if(modal) modal.remove();
        if(typeof window.render === 'function') window.render();
        
        if(window.sysAlert) {
            window.sysAlert('Sukces!', "Zaksięgowano wpłatę "+Number(v).toFixed(2)+" zł do Budżetu Domowego!", 'success');
        }
    }, 600);
};
