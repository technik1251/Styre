// ==========================================
// PLIK: taxi_modals.js - Okienka i Akcje
// ==========================================

// --- BACKUP ---
window.dExport = function() { 
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.db)); 
    let dlAnchorElem = document.createElement('a'); 
    dlAnchorElem.setAttribute("href", dataStr); 
    dlAnchorElem.setAttribute("download", "styreos_backup_" + window.getLocalYMD() + ".json"); 
    dlAnchorElem.click(); 
    if(window.sysAlert) window.sysAlert("Pobrano!", "Plik kopii zapasowej został pobrany na urządzenie.", "success"); 
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
                    window.sysConfirm("Uwaga", "To nadpisze obecne dane. Kontynuować?", () => { 
                        localStorage.setItem('styre_v101_db', JSON.stringify(importedDb)); 
                        window.sysAlert("Sukces!", "Dane przywrócone. Trwa restart...", "success"); 
                        setTimeout(() => location.reload(), 1500); 
                    }); 
                } else { 
                    localStorage.setItem('styre_v101_db', JSON.stringify(importedDb)); 
                    location.reload(); 
                } 
            } else throw new Error("Błędny plik"); 
        } catch(err) { 
            if(window.sysAlert) window.sysAlert("Błąd", "Nieprawidłowy plik kopii zapasowej."); 
        } 
    }; 
    reader.readAsText(file); 
};

// --- EDYCJA LICZNIKA I ANULOWANIE ZMIANY (NOWOŚĆ) ---
window.dEditGlobalOdo = function() {
    let current = window.db.drv.odo || 0;
    window.sysPrompt("Edytuj Licznik", `Obecnie: ${current}`, (val) => {
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
    window.sysPrompt("Korekta ODO Start", `Obecnie: ${current}`, (val) => {
        let v = parseFloat(val);
        if(v > 0) {
            window.db.drv.sh.o = v;
            window.db.drv.odo = v;
            window.save();
            window.render();
            setTimeout(() => window.openEndShiftModal(), 200);
        } else {
            if(window.sysAlert) window.sysAlert("Błąd", "Wprowadź poprawną liczbę.", "error");
        }
    });
};

window.dCancelShift = function() {
    let m = document.getElementById('m-end-shift');
    if(m) m.remove();
    
    window.sysConfirm("Anulowanie Zmiany", "Na pewno chcesz usunąć trwającą zmianę? Niezapisane kursy z tego ekranu przepadną.", () => {
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
};

// --- SYSTEM PRACY (ZMIANA) ---
window.openEndShiftModal = function() {
    let diffHrs=0, diffMins=0, autoHw=0, shiftDateStr = window.getLocalYMD();
    
    if(window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.shiftStart) {
        let activeShiftMs = Date.now() - window.db.drv.sh.shiftStart;
        if(window.db.drv.sh.sPT) activeShiftMs -= window.db.drv.sh.sPT;
        diffHrs = Math.floor(activeShiftMs/3600000);
        diffMins = Math.floor((activeShiftMs%3600000)/60000);
        autoHw = Number(activeShiftMs/3600000).toFixed(1);
        if(autoHw < 0) autoHw = 0;
        shiftDateStr = window.getLocalYMD(new Date(window.db.drv.sh.shiftStart));
    }
    
    let startOdo = (window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.o) ? window.db.drv.sh.o : 0;
    
    let html = `
    <div id="m-end-shift" class="modal-overlay" style="z-index: 30000; animation: fadeIn 0.2s;">
        <div class="panel" style="width:100%; max-width:380px; border-color:var(--danger); background: linear-gradient(145deg, #1e1010, #09090b);">
            <div style="text-align:center; margin-bottom:15px;">
                <div style="font-size:2.5rem; margin-bottom:5px;">🏁</div>
                <h3 style="color:var(--danger); margin:0; font-size:1.2rem; text-transform:uppercase;">Zakończenie Pracy</h3>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; background:rgba(0,0,0,0.5); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                <div style="text-align:center; flex:1;">
                    <span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">Czas z timera</span><br>
                    <strong style="color:var(--info); font-size:1.1rem;">${diffHrs}h ${diffMins}m</strong>
                </div>
                <div style="text-align:center; flex:1; border-left:1px solid rgba(255,255,255,0.1);">
                    <span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">ODO Start</span><br>
                    <strong style="color:#fff; font-size:1.1rem; cursor:pointer;" onclick="document.getElementById('m-end-shift').remove(); window.dEditStartOdo();">${startOdo} <span style="font-size:0.8rem; color:var(--info);">✏️</span></strong>
                </div>
            </div>
            <div class="inp-group" style="margin-bottom:12px;">
                <label style="color:var(--muted);">Data zmiany (Dla statystyk)</label>
                <input type="date" id="de-d1" value="${shiftDateStr}">
            </div>
            <div class="inp-row" style="margin-bottom:15px;">
                <div class="inp-group">
                    <label style="color:var(--muted);">Czas pracy (h)</label>
                    <input type="number" step="0.1" id="de-h" value="${autoHw}">
                </div>
                <div class="inp-group">
                    <label style="color:var(--danger);">Końcowy Przebieg</label>
                    <input type="number" id="de-o" style="border-color:var(--danger); background:rgba(239,68,68,0.05); color:var(--danger); font-weight:bold;" placeholder="np. ${startOdo + 100}">
                </div>
            </div>
            <button class="btn btn-danger" style="padding:18px;" onclick="window.dEndS()">ZAKOŃCZ I ZAPISZ</button>
            <button class="btn" style="background:transparent; color:var(--muted); box-shadow:none; border:1px solid rgba(255,255,255,0.1); margin-top:8px;" onclick="document.getElementById('m-end-shift').remove()">ANULUJ ZAMYKANIE</button>
            
            <div style="text-align:center; margin-top:20px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
                <span style="color:var(--danger); font-size:0.75rem; text-decoration:underline; cursor:pointer; opacity:0.8;" onclick="window.dCancelShift()">Omyłkowo rozpoczęta zmiana? Anuluj ją bez zapisu.</span>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(()=>document.getElementById('de-o').focus(), 100);
};

window.dStartS = function() {
    let el = document.getElementById('ds-o');
    if(!el || el.value === '') { 
        if(el) { el.style.borderBottom='2px solid var(--danger)'; el.classList.add('shake-anim'); setTimeout(()=>el.classList.remove('shake-anim'),300); } 
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz aktualny stan licznika (KM)."); 
        return; 
    }
    
    let o = parseFloat(el.value);
    if(isNaN(o) || o <= 0) { 
        if(el) { el.style.borderBottom='2px solid var(--danger)'; el.classList.add('shake-anim'); setTimeout(()=>el.classList.remove('shake-anim'),300); } 
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
        if(el) { el.style.borderBottom='2px solid var(--danger)'; el.classList.add('shake-anim'); setTimeout(()=>el.classList.remove('shake-anim'),300); } 
        if(window.sysAlert) return window.sysAlert("Błąd", `Stan końcowy musi być wyższy niż startowy (${startOdo} km)! Możesz edytować ODO Start używając ołówka powyżej.`); 
        return; 
    }
    
    let hW = window.safeVal('de-h', 0);
    let g=0, pk=0, cf=0, vf=0;
    let cardFee = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.cardF) ? window.db.drv.cfg.cardF : 0;
    let vouchFee = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.voucherF) ? window.db.drv.cfg.voucherF : 0;
    let fuelPx = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.fuelPx) ? window.db.drv.cfg.fuelPx : 0;
    let taxRate = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.tax) ? window.db.drv.cfg.tax : 0;
    let isPct = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.eType === 'pct');
    let ePct = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.ePct) ? window.db.drv.cfg.ePct : 0;
    
    let trList = (window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) ? window.db.drv.sh.tr : [];
    
    trList.forEach(x => {
        let xv = parseFloat(x.v) || 0;
        let xk = parseFloat(x.k) || 0;
        g += xv; 
        pk += xk;
        if(x.p === 'Karta') cf += xv * cardFee;
        if(x.p === 'Voucher') vf += xv * vouchFee;
    });
    
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
        fc: fc, tx: tax, pF: pFee, cF: cf, vF: vf, tr: [...trList]
    });
    window.db.drv.h.sort((a,b) => new Date(b.rD) - new Date(a.rD));
    
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
    
    let mHtml = `
    <div id="m-summary" class="modal-overlay" style="z-index: 30000;">
        <div class="panel" style="width:100%; max-width:380px; border-color:var(--success); text-align:center; padding:20px; background: linear-gradient(145deg, #18181b, #09090b); max-height: 90vh; overflow-y: auto;">
            <div style="font-size:3rem; margin-bottom:5px;">🏁</div>
            <h2 style="color:var(--success); margin:0 0 5px 0; font-size:1.5rem;">ZMIANA ZAKOŃCZONA</h2>
            <p style="color:var(--muted); font-size:0.8rem; margin-bottom:15px;">Data: <strong style="color:#fff">${dtStr}</strong></p>
            <div style="background:#000; padding:15px; border-radius:12px; margin-bottom:15px; text-align:left; border:1px solid rgba(255,255,255,0.05);">
                <div style="color:var(--info); font-size:0.7rem; text-transform:uppercase; font-weight:bold; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">📊 Wyniki Finansowe</div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--muted); font-size:0.85rem;">Utarg Brutto:</span><strong style="color:var(--success);">${Number(g||0).toFixed(2)} zł</strong></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--muted); font-size:0.85rem;">Prowizje / Podatki:</span><strong style="color:var(--danger);">-${Number((tax+pFee+cf+vf)||0).toFixed(2)} zł</strong></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--muted); font-size:0.85rem;">Koszty Paliwa:</span><strong style="color:var(--fuel);">-${Number(fc||0).toFixed(2)} zł</strong></div>
                <div style="display:flex; justify-content:space-between; margin-top:8px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:8px;"><span style="color:#fff; font-weight:bold; font-size:0.9rem;">Zysk Operacyjny:</span><strong style="color:${n_operacyjny>=0?'var(--success)':'var(--danger)'}; font-size:1.1rem;">${Number(n_operacyjny||0).toFixed(2)} zł</strong></div>
            </div>
            <div style="background:#000; padding:15px; border-radius:12px; margin-bottom:15px; text-align:left; border:1px solid rgba(255,255,255,0.05);">
                <div style="color:var(--driver); font-size:0.7rem; text-transform:uppercase; font-weight:bold; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">🚗 Statystyki Trasy</div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--muted); font-size:0.85rem;">Całkowity dystans:</span><strong style="color:#fff;">${Number(k||0).toFixed(1)} km</strong></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--muted); font-size:0.85rem;">Z pasażerem:</span><strong style="color:var(--success);">${Number(pk||0).toFixed(1)} km</strong></div>
                <div style="display:flex; justify-content:space-between;"><span style="color:var(--muted); font-size:0.85rem;">Puste (Dojazdy):</span><strong style="color:var(--warning);">${Number(emptyK||0).toFixed(1)} km</strong></div>
            </div>
            <button class="btn" style="background:var(--success); color:#000; padding:15px;" onclick="document.getElementById('m-summary').remove();">ZOBACZ PEŁNE P&L</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', mHtml);
};

// --- SYNCHRONIZACJA Z DOMEM ---
window.dTransferToHomeModal = function() {
    let accOpts = (window.db.home && window.db.home.accs) ? window.db.home.accs.map(a => `<option value="${a.id}">${a.n}</option>`).join('') : '';
    if(!accOpts) { 
        if(window.sysAlert) return window.sysAlert('Błąd', 'Brak kont w Budżecie Domowym! Dodaj je najpierw w module domowym.', 'error'); 
        return; 
    }
    
    let totalCashEarned = 0;
    if(window.db.drv && window.db.drv.h) {
        window.db.drv.h.forEach(s => { 
            if(s.tr) s.tr.forEach(t => { if(t.p === 'Gotówka') totalCashEarned += (parseFloat(t.v)||0); }); 
        });
    }
    if(window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) {
        window.db.drv.sh.tr.forEach(t => { if(t.p === 'Gotówka') totalCashEarned += (parseFloat(t.v)||0); });
    }
    
    let totalTransferred = 0;
    if(window.db.home && window.db.home.trans) {
        window.db.home.trans.forEach(t => {
            if(t.cat === 'Wypłata z Etatu' && t.d === 'Utarg z Taxi') {
                totalTransferred += (parseFloat(t.v)||0);
            }
        });
    }
    
    let availableCash = totalCashEarned - totalTransferred;
    if (availableCash <= 0) {
        if(window.sysAlert) return window.sysAlert('Brak środków', 'Rozliczyłeś już całą gotówkę z Taxi w Budżecie Domowym!', 'info');
        return;
    }
    
    let html = `
    <div id="m-transfer-home" class="modal-overlay" style="z-index: 30000; animation: fadeIn 0.2s;">
        <div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--success);">
            <h3 style="margin-top:0; color:var(--success);">💸 Wypłata Utargu</h3>
            <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px;">Przelej zarobioną gotówkę do portfela domowego.</p>
            
            <div style="font-size:0.75rem; color:var(--success); margin-bottom:15px; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); padding:10px; border-radius:8px; text-align:center;">
                Nierozliczona gotówka w portfelu:<br>
                <strong style="font-size:1.2rem;">${Number(availableCash).toFixed(2)} zł</strong>
            </div>
            
            <div class="inp-group" style="margin-bottom:15px;">
                <label>Kwota do przelania (zł)</label>
                <input type="number" step="0.01" id="dth-v" max="${availableCash}" placeholder="np. 250" value="${Number(availableCash).toFixed(2)}" class="big-inp" style="color:var(--success); background:rgba(0,0,0,0.5);">
            </div>
            <div class="inp-group" style="margin-bottom:20px;">
                <label>Do jakiego portfela?</label>
                <select id="dth-acc" style="background:#18181b;">${accOpts}</select>
            </div>
            <button class="btn btn-success" style="padding:15px; font-weight:bold;" onclick="window.dExecTransferToHome()">ZAKSIĘGUJ W DOMU</button>
            <button class="btn" style="background:transparent; color:var(--muted); margin-top:5px; box-shadow:none;" onclick="document.getElementById('m-transfer-home').remove()">ANULUJ</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dExecTransferToHome = function() {
    let inputEl = document.getElementById('dth-v');
    let v = parseFloat(inputEl.value);
    let maxV = parseFloat(inputEl.getAttribute('max'));
    let accId = document.getElementById('dth-acc').value;
    
    if(!v || v <= 0) { 
        if(window.sysAlert) window.sysAlert('Błąd', 'Podaj poprawną kwotę!', 'error'); 
        return; 
    }
    
    if(v > maxV + 0.05) {
        if(window.sysAlert) window.sysAlert('Odmowa', `Próbujesz przelać więcej, niż masz w gotówce z Taxi! (Max: ${Number(maxV).toFixed(2)} zł)`, 'error'); 
        return;
    }
    
    let dObj = new Date(); 
    dObj.setHours(12,0,0);
    
    if(!window.db.home) window.db.home = {trans: []};
    if(!window.db.home.trans) window.db.home.trans = [];
    
    window.db.home.trans.push({
        id: Date.now(), type: 'inc', cat: 'Wypłata z Etatu', acc: accId,
        d: 'Utarg z Taxi', v: v, who: window.db.userName,
        dt: dObj.toLocaleDateString('pl-PL'), rD: dObj.toISOString(), isPlanned: false
    });
    
    window.db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD));
    window.save();
    
    let modal = document.getElementById('m-transfer-home');
    if(modal) modal.remove();
    window.render();
    
    if(window.sysAlert) {
        setTimeout(() => {
            window.sysAlert('Sukces!', `Przelałeś ${Number(v).toFixed(2)} zł do Budżetu!`, 'success');
        }, 100);
    }
};

// --- TRANSAKCJE TAXI ---
window.dAddT = function() {
    let v = window.safeVal('dt-v'), k = window.safeVal('dt-k'), m = window.safeVal('dt-m');
    let cIdel = document.getElementById('dt-cid'); 
    let cId = cIdel ? parseInt(cIdel.value) || null : null;
    
    if(!v || v <= 0) { 
        let vEl = document.getElementById('dt-v'); 
        if(vEl) { vEl.style.borderBottom='2px solid var(--danger)'; vEl.classList.add('shake-anim'); setTimeout(()=>vEl.classList.remove('shake-anim'),300); } 
        if(window.sysAlert) return window.sysAlert("Brak Kwoty", "Podaj kwotę z apki!"); 
        return; 
    }
    
    let finalSrc = window.dTSrc === 'Inna' ? (document.getElementById('dt-other-src').value || 'Inna Apka') : window.dTSrc;
    let timeNow = new Date().toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
    
    if(!window.db.drv.sh.tr) window.db.drv.sh.tr = [];
    window.db.drv.sh.tr.unshift({id: Date.now(), v: v, k: k, m: m, s: finalSrc, p: window.dTPay, c: cId, time: timeNow});
    window.save(); 
    window.render();
};

window.dEditT = function(id) {
    let trList = (window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) ? window.db.drv.sh.tr : [];
    let tr = trList.find(x => x.id === id); 
    if(!tr) return;
    
    let plat = (window.db.drv && window.db.drv.plat) ? window.db.drv.plat : 'apps';
    let srcOpts = plat === 'apps' ? 
        `<option value="Uber" ${tr.s==='Uber'?'selected':''}>Uber</option><option value="Bolt" ${tr.s==='Bolt'?'selected':''}>Bolt</option><option value="FreeNow" ${tr.s==='FreeNow'?'selected':''}>FreeNow</option><option value="Inna" ${tr.s==='Inna'?'selected':''}>Inna</option>` : 
        `<option value="Centrala" ${tr.s==='Centrala'?'selected':''}>Centrala</option><option value="Postój" ${tr.s==='Postój'?'selected':''}>Postój</option><option value="Prywatny" ${tr.s==='Prywatny'?'selected':''}>Prywatny</option>`;
    
    let payOpts = plat === 'apps' ? 
        `<option value="Aplikacja" ${tr.p==='Aplikacja'?'selected':''}>Aplikacja</option><option value="Gotówka" ${tr.p==='Gotówka'?'selected':''}>Gotówka</option>` : 
        `<option value="Gotówka" ${tr.p==='Gotówka'?'selected':''}>Gotówka</option><option value="Karta" ${tr.p==='Karta'?'selected':''}>Karta</option><option value="Voucher" ${tr.p==='Voucher'?'selected':''}>Voucher</option>`;
    
    let html = `
    <div id="m-edit-t" class="modal-overlay" style="z-index: 30000; animation: fadeIn 0.2s;">
        <div class="panel" style="width:100%; max-width:380px; background: #09090b; border-color:var(--driver);">
            <h3 style="margin-top:0; color:var(--driver);">✏️ Edytuj Kurs</h3>
            <div class="inp-row" style="margin-bottom:10px;">
                <div class="inp-group"><label>Kwota (zł)</label><input type="number" step="0.01" id="et-v" value="${Number(tr.v||0).toFixed(2)}"></div>
                <div class="inp-group"><label>Dystans (KM)</label><input type="number" step="0.1" id="et-k" value="${Number(tr.k||0).toFixed(1)}"></div>
            </div>
            <div class="inp-row" style="margin-bottom:15px;">
                <div class="inp-group"><label>Źródło</label><select id="et-s" style="background:#000;">${srcOpts}</select></div>
                <div class="inp-group"><label>Płatność</label><select id="et-p" style="background:#000;">${payOpts}</select></div>
            </div>
            <button class="btn btn-driver" style="padding:15px;" onclick="window.dSaveEditT(${id})">ZAPISZ ZMIANY</button>
            <button class="btn" style="background:transparent; color:var(--muted); box-shadow:none; margin-top:5px;" onclick="document.getElementById('m-edit-t').remove()">ANULUJ</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dSaveEditT = function(id) { 
    let trList = (window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) ? window.db.drv.sh.tr : [];
    let tr = trList.find(x => x.id === id); 
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
        window.sysConfirm("Cofnij kurs", "Na pewno usunąć ten kurs?", () => { 
            if(window.db.drv && window.db.drv.sh && window.db.drv.sh.tr) {
                window.db.drv.sh.tr = window.db.drv.sh.tr.filter(x => x.id !== id); 
                window.save(); 
                window.render(); 
            }
        }); 
    } 
};

// --- WBITKI OFFLINE ---
window.dAddOfflineWeekly = function() {
    let v = window.safeVal('dw-v'), k = window.safeVal('dw-k'), c = window.safeVal('dw-c', 0), hW = window.safeVal('dw-h', 0);
    let dF_str = document.getElementById('dw-d-from').value;
    let dT_str = document.getElementById('dw-d-to').value;
    
    if(!v || v <= 0) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz kwotę brutto!"); 
        return; 
    }
    
    let dF = new Date(dF_str); dF.setHours(12,0,0); 
    let dT = new Date(dT_str); dT.setHours(12,0,0);
    
    if(dT < dF) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Data 'Do' nie może być przed 'Od'!"); 
        return; 
    }
    
    let tD = Math.round((dT - dF) / (1000*60*60*24)) + 1;
    let finalSrc = window.dTSrc === 'Inna' ? (document.getElementById('dt-other-src').value || 'Inna Apka') : window.dTSrc;
    
    let vD = v / tD, kD = k / tD, cD = c / tD, hwD = hW / tD;
    
    let fuelPx = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.fuelPx) ? window.db.drv.cfg.fuelPx : 0;
    let taxRate = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.tax) ? window.db.drv.cfg.tax : 0;
    let isPct = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.eType === 'pct');
    let ePct = (window.db.drv && window.db.drv.cfg && window.db.drv.cfg.ePct) ? window.db.drv.cfg.ePct : 0;
    
    let fcD = kD * fuelPx;
    let taxD = vD * taxRate;
    let pFeeD = isPct ? vD * ePct : 0;
    let n_opD = vD - fcD - taxD - pFeeD;
    
    if(!window.db.drv.h) window.db.drv.h = [];
    
    for(let i=0; i<tD; i++) {
        let tObj = new Date(dT); 
        tObj.setDate(tObj.getDate() - i); 
        let dDisp = tObj.toLocaleDateString('pl-PL');
        let tr = [];
        
        if(cD > 0) {
            tr.push({id: Date.now() + i*10, v: cD, k: 0, m: 0, s: finalSrc + ' (Gotówka)', p: 'Gotówka', c: null});
            tr.push({id: Date.now() + i*10 + 1, v: vD - cD, k: kD, m: 0, s: finalSrc + ' (Apka)', p: 'Aplikacja', c: null});
        } else {
            tr.push({id: Date.now() + i*10, v: vD, k: kD, m: 0, s: finalSrc + (tD > 1 ? ' (Zestawienie)' : ' (Wbita)'), p: 'Aplikacja', c: null});
        }
        
        window.db.drv.h.unshift({
            id: Date.now() + i*100, rD: tObj.toISOString(), dt: dDisp, 
            hW: hwD, g: vD, n: n_opD, k: kD, pk: kD, emptyK: 0, 
            fc: fcD, tx: taxD, pF: pFeeD, cF: 0, vF: 0, tr: tr
        });
    }
    
    window.db.drv.h.sort((a,b) => new Date(b.rD) - new Date(a.rD));
    if(k > 0 && window.db.drv.odo > 0) window.db.drv.odo += k;
    
    window.dShowOff = false; 
    window.save(); 
    window.db.tab = 'stats'; 
    window.render();
    
    if(window.sysAlert) window.sysAlert("Sukces", tD > 1 ? `Rozbito poprawnie na ${tD} dni i zaksięgowano!` : "Utarg zaksięgowany prosto do historii!", "success");
};

// --- GARAŻ ---
window.dAF = function() {
    let o = window.safeVal('df-o');
    let l = window.safeVal('df-l');
    let v = window.safeVal('df-v');
    let fEl = document.getElementById('df-f');
    let f = fEl ? parseInt(fEl.value) : 1;
    
    if(!o || !l || !v) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Wypełnij dane!"); 
        return; 
    }
    
    let dVal = document.getElementById('df-date').value;
    let dObj = dVal ? new Date(dVal) : new Date();
    if(dVal) dObj.setHours(12,0,0);
    
    let dist=0, l100=0, cpkm=0;
    if(!window.db.drv.fuel) window.db.drv.fuel = [];
    
    let prevF = window.db.drv.fuel.filter(x => x.o < o).sort((a,b) => b.o - a.o)[0];
    if(prevF) {
        dist = o - prevF.o;
        if(dist > 0) {
            l100 = (l / dist) * 100;
            cpkm = v / dist;
            if(f === 1) {
                if(!window.db.drv.cfg) window.db.drv.cfg = {};
                window.db.drv.cfg.fuelPx = cpkm;
            }
        }
    }
    
    window.db.drv.odo = o;
    window.db.drv.fuel.push({o: o, l: l, v: v, isF: f, rD: dObj.toISOString()});
    window.db.drv.fuel.sort((a,b) => b.o - a.o);
    
    if(!window.db.drv.exp) window.db.drv.exp = [];
    window.db.drv.exp.push({
        id: Date.now(), rD: dObj.toISOString(), d: `⛽ Tankowanie`, 
        v: v, dt: dObj.toLocaleDateString('pl-PL'), ty: 'f', 
        l: l, odo: o, dist: dist, l100: l100, cpkm: cpkm, isF: f
    });
    window.db.drv.exp.sort((a,b) => new Date(b.rD) - new Date(a.rD));
    
    window.save(); 
    window.render();
};

window.dAE = function() {
    let v = window.safeVal('de-v');
    let cEl = document.getElementById('de-c');
    let c = cEl ? cEl.value : 'Wydatki';
    
    if(!v) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz kwotę!"); 
        return; 
    }
    
    let dVal = document.getElementById('de-date').value;
    let dObj = dVal ? new Date(dVal) : new Date();
    if(dVal) dObj.setHours(12,0,0);
    
    if(!window.db.drv.exp) window.db.drv.exp = [];
    window.db.drv.exp.push({
        id: Date.now(), rD: dObj.toISOString(), d: c, 
        v: v, dt: dObj.toLocaleDateString('pl-PL'), ty: 'e'
    });
    window.db.drv.exp.sort((a,b) => new Date(b.rD) - new Date(a.rD));
    
    window.save(); 
    window.render();
};

window.dQuickExp = function(c,v) {
    let dObj = new Date();
    if(!window.db.drv.exp) window.db.drv.exp = [];
    window.db.drv.exp.push({
        id: Date.now(), rD: dObj.toISOString(), d: c, 
        v: v, dt: dObj.toLocaleDateString('pl-PL'), ty: 'e'
    });
    window.db.drv.exp.sort((a,b) => new Date(b.rD) - new Date(a.rD));
    
    window.save(); 
    window.render();
    if(window.sysAlert) window.sysAlert("Szybki wydatek", `Dodano: ${c} (-${Number(v||0).toFixed(2)}zł)`, "success");
};

window.dDelExp = function(id) {
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie", "Na pewno usunąć ten wpis?", () => {
            let expList = window.db.drv.exp || [];
            let e = expList.find(x => x.id === id);
            if(e && e.ty === 'f') {
                window.db.drv.fuel = (window.db.drv.fuel || []).filter(f => f.o !== e.odo);
            }
            window.db.drv.exp = expList.filter(x => x.id !== id);
            window.save(); 
            window.render();
        });
    }
};

window.dEditExp = function(id) {
    let expList = window.db.drv.exp || [];
    let e = expList.find(x => x.id === id);
    if(!e) return;
    
    let html = `
    <div id="m-edit-e" class="modal-overlay" style="z-index: 30000; animation: fadeIn 0.2s;">
        <div class="panel" style="width:100%; max-width:380px; background: #09090b;">
            <h3 style="margin-top:0;">Edytuj Wydatek</h3>
            <div class="inp-group"><label>Kwota (zł)</label><input type="number" step="0.01" id="ee-v" value="${Number(e.v||0).toFixed(2)}"></div>
            <button class="btn btn-danger" style="margin-top:15px; padding:15px;" onclick="window.dSaveEditExp(${id})">ZAPISZ ZMIANY</button>
            <button class="btn" style="background:transparent; color:var(--muted); box-shadow:none; margin-top:5px;" onclick="document.getElementById('m-edit-e').remove()">ANULUJ</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dSaveEditExp = function(id) {
    let expList = window.db.drv.exp || [];
    let e = expList.find(x => x.id === id);
    if(e) {
        let nv = window.safeVal('ee-v');
        if(nv > 0) {
            e.v = nv;
            if(e.ty === 'f') {
                let fuelList = window.db.drv.fuel || [];
                let f = fuelList.find(x => x.o === e.odo);
                if(f) f.v = nv;
                if(e.dist > 0) e.cpkm = nv / e.dist;
            }
            window.save(); 
            window.render();
        }
    }
    let modal = document.getElementById('m-edit-e');
    if(modal) modal.remove();
};

// --- HISTORIA ---
window.dDelHistory = function(id) {
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie Dnia", "Trwale usunąć to rozliczenie?", () => {
            window.db.drv.h = (window.db.drv.h || []).filter(x => x.id !== id);
            window.save(); 
            window.render();
        });
    }
};

window.dEditHistory = function(id) {
    let hList = window.db.drv.h || [];
    let h = hList.find(x => x.id === id);
    if(!h) return;
    
    let html = `
    <div id="m-edit-h" class="modal-overlay" style="z-index: 30000; animation: fadeIn 0.2s;">
        <div class="panel" style="width:100%; max-width:380px; background: #09090b;">
            <h3 style="margin-top:0;">Korekta Rozliczenia</h3>
            <div class="inp-group"><label>Utarg Brutto (zł)</label><input type="number" step="0.01" id="eh-g" value="${Number(h.g||0).toFixed(2)}"></div>
            <div class="inp-group"><label>Przejechany Dystans (KM)</label><input type="number" step="0.1" id="eh-k" value="${Number(h.k||0).toFixed(1)}"></div>
            <button class="btn btn-success" style="margin-top:15px; padding:15px;" onclick="window.dSaveEditHistory(${id})">PRZELICZ I ZAPISZ</button>
            <button class="btn" style="background:transparent; color:var(--muted); box-shadow:none; margin-top:5px;" onclick="document.getElementById('m-edit-h').remove()">ANULUJ</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.dSaveEditHistory = function(id) {
    let hList = window.db.drv.h || [];
    let h = hList.find(x => x.id === id);
    if(h) {
        let ng = window.safeVal('eh-g');
        let nk = window.safeVal('eh-k', 0);
        if(ng >= 0) {
            h.g = ng; 
            h.k = nk;
            let taxRate = (window.db.drv.cfg && window.db.drv.cfg.tax) ? window.db.drv.cfg.tax : 0;
            let fuelPx = (window.db.drv.cfg && window.db.drv.cfg.fuelPx) ? window.db.drv.cfg.fuelPx : 0;
            let isPct = (window.db.drv.cfg && window.db.drv.cfg.eType === 'pct');
            let ePct = (window.db.drv.cfg && window.db.drv.cfg.ePct) ? window.db.drv.cfg.ePct : 0;
            
            let tax = h.g * taxRate;
            let pFee = isPct ? h.g * ePct : 0;
            let fc = h.k * fuelPx;
            
            h.tx = tax; 
            h.pF = pFee; 
            h.fc = fc;
            h.n = h.g - h.fc - h.tx - h.pF - (h.cF || 0) - (h.vF || 0);
            
            window.save(); 
            window.render();
        }
    }
    let modal = document.getElementById('m-edit-h');
    if(modal) modal.remove();
};

// --- WYCENA MAPY ---
window.dQB = function() {
    if(!window.db.drv.sh || !window.db.drv.sh.on) {
        if(window.sysAlert) return window.sysAlert("Błąd", "Otwórz zmianę przed zaksięgowaniem kursu!");
        return;
    }
    if(window.dQV > 0) {
        let timeNow = new Date().toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
        if(!window.db.drv.sh.tr) window.db.drv.sh.tr = [];
        window.db.drv.sh.tr.unshift({
            id: Date.now(), v: window.dQV, k: Number(window.dQK||0).toFixed(1), 
            m: (window.dQM_T||0), s: 'Z Mapy', p: 'Gotówka', time: timeNow
        });
        window.save(); 
        window.db.tab = 'term'; 
        window.render();
        if(window.sysAlert) window.sysAlert("Sukces", "Zaksięgowano kurs!", "success");
    }
};

window.dSaveQC = function() {
    if(!window.db.drv) window.db.drv = {};
    window.db.drv.q = {
        s: window.safeVal('dcs'), w: window.safeVal('dcw'), 
        t1: window.safeVal('dct1'), t2: window.safeVal('dct2'), 
        t3: window.safeVal('dct3'), t4: window.safeVal('dct4')
    };
    window.save();
    if(window.sysAlert) window.sysAlert("Sukces", "Zapisano Taryfy!", "success");
};

// --- KLIENCI ---
window.dAddCrm = function() {
    let n = document.getElementById('dc-n').value;
    let ph = document.getElementById('dc-p').value;
    let d = window.safeVal('dc-d');
    
    if(!n) {
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz imię klienta!");
        return;
    }
    
    if(!window.db.drv.clients) window.db.drv.clients = [];
    window.db.drv.clients.unshift({id: Date.now(), n: n, ph: ph, d: d, bl: false});
    window.save(); 
    window.render();
    if(window.sysAlert) window.sysAlert("Sukces", "Dodano do bazy!", "success");
};

window.dCrmDel = function(id) {
    if(window.sysConfirm) {
        window.sysConfirm("Baza Klientów", "Usunąć?", () => {
            window.db.drv.clients = (window.db.drv.clients || []).filter(x => x.id !== id);
            window.save(); 
            window.render();
        });
    }
};

// --- USTAWIENIA TAXI ---
window.dSaveUS = function() {
    window.db.userName = document.getElementById('us-name').value;
    
    if(!window.db.drv.cfg) window.db.drv.cfg = {};
    
    window.db.drv.cfg.goal = window.safeVal('us-goal');
    window.db.drv.cfg.defCity = document.getElementById('us-city').value;
    window.db.drv.cfg.fuelCons = window.safeVal('us-fcons');
    window.db.drv.cfg.fuelPriceL = window.safeVal('us-fprice');
    window.db.drv.cfg.fuelPx = (window.db.drv.cfg.fuelCons * window.db.drv.cfg.fuelPriceL) / 100;
    
    window.db.drv.cfg.cC = window.safeVal('us-cc');
    window.db.drv.cfg.cType = document.getElementById('us-ctype').value;
    window.db.drv.cfg.bC = window.safeVal('us-bc');
    window.db.drv.cfg.bPeriod = document.getElementById('us-b-period').value;
    window.db.drv.cfg.iC = window.safeVal('us-ic');
    window.db.drv.cfg.iPeriod = document.getElementById('us-i-period').value;
    window.db.drv.cfg.uC = window.safeVal('us-uc');
    window.db.drv.cfg.uType = document.getElementById('us-utype').value;
    
    window.db.drv.cfg.eType = document.getElementById('us-etype').value;
    window.db.drv.cfg.eC = window.safeVal('us-ec');
    window.db.drv.cfg.ePeriod = document.getElementById('us-e-period').value;
    window.db.drv.cfg.ePct = window.safeVal('us-epct') / 100;
    
    window.db.drv.cfg.tax = window.safeVal('us-tx') / 100;
    window.db.drv.cfg.cardF = window.safeVal('us-cf') / 100;
    window.db.drv.cfg.voucherF = window.safeVal('us-vf') / 100;
    
    window.save(); 
    window.render();
    if(window.sysAlert) window.sysAlert("Sukces", "Opcje zaktualizowane!", "success");
};
