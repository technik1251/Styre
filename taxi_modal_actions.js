// ==========================================
// PLIK: taxi_modal_actions.js - Garaż, Historia, Klienci, Backup
// ==========================================

// --- BACKUP DANYCH ---
window.dExport = function() { 
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.db)); 
    let dlAnchorElem = document.createElement('a'); 
    dlAnchorElem.setAttribute("href", dataStr); 
    dlAnchorElem.setAttribute("download", "styreos_taxi_backup_" + window.getLocalYMD() + ".json"); 
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
                    window.sysConfirm("Uwaga", "To nadpisze obecne dane z tego telefonu. Kontynuować?", () => { 
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

// --- GARAŻ (TANKOWANIA I WYDATKI) ---
window.dAF = function() {
    let o = window.safeVal('df-o');
    let l = window.safeVal('df-l');
    let v = window.safeVal('df-v');
    let fEl = document.getElementById('df-f');
    let f = fEl ? fEl.value : 'part';
    
    // Konwersja dla kompatybilności wstecznej (jeśli ktoś używał starych wartości)
    if (f === '1') f = 'pb_full';
    if (f === '0') f = 'part';

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
            if(f === 'lpg_full' || f === 'pb_full' || f === 'on_full') {
                if(!window.db.drv.cfg) window.db.drv.cfg = {};
                // Ustawiamy cenę z Garażu tylko, jeśli kierowca nie wymusił ręcznego ryczałtu w Opcjach
                if(window.db.drv.cfg.fuelSource !== 'manual') {
                    window.db.drv.cfg.fuelPx = cpkm;
                }
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

// --- SYNCHRONIZACJA Z DOMEM (TRANSFER GOTÓWKI) ---
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

// --- KLIENCI VIP ---
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

// --- USTAWIENIA TAXI (ZAPIS DANYCH I PALIWA) ---
window.dSaveUS = function() {
    window.db.userName = document.getElementById('us-name').value;
    
    if(!window.db.drv.cfg) window.db.drv.cfg = {};
    
    window.db.drv.cfg.goal = window.safeVal('us-goal');
    window.db.drv.cfg.defCity = document.getElementById('us-city') ? document.getElementById('us-city').value : 'Szczecin';
    
    // Zapisywanie Paliwa
    window.db.drv.cfg.fuelCons = window.safeVal('us-fcons');
    window.db.drv.cfg.fuelPriceL = window.safeVal('us-fprice');
    
    let fSrcEl = document.getElementById('us-fuel-src');
    window.db.drv.cfg.fuelSource = fSrcEl ? fSrcEl.value : 'garage';

    // Jeśli wybrano ręczne wpisywanie, aplikacja przelicza cenę za 1KM matematycznie z okienek
    if(window.db.drv.cfg.fuelSource === 'manual') {
        window.db.drv.cfg.fuelPx = (window.db.drv.cfg.fuelCons * window.db.drv.cfg.fuelPriceL) / 100;
    } else {
        // Jeśli wybrano 'garage', staramy się pobrać najświeższe dane z faktycznych paragonów
        if(window.calcFuelioStats) {
            let fs = window.calcFuelioStats();
            if(fs.ck > 0) window.db.drv.cfg.fuelPx = fs.ck;
        }
    }
    
    // Reszta ustawień (Koszty, Podatki, itp.)
    window.db.drv.cfg.cC = window.safeVal('us-cc');
    window.db.drv.cfg.cType = document.getElementById('us-ctype') ? document.getElementById('us-ctype').value : 'month';
    window.db.drv.cfg.bC = window.safeVal('us-bc');
    window.db.drv.cfg.bPeriod = document.getElementById('us-b-period') ? document.getElementById('us-b-period').value : 'month';
    window.db.drv.cfg.iC = window.safeVal('us-ic');
    window.db.drv.cfg.iPeriod = document.getElementById('us-i-period') ? document.getElementById('us-i-period').value : 'month';
    window.db.drv.cfg.uC = window.safeVal('us-uc');
    window.db.drv.cfg.uType = document.getElementById('us-utype') ? document.getElementById('us-utype').value : 'corp';
    
    window.db.drv.cfg.eType = document.getElementById('us-etype') ? document.getElementById('us-etype').value : 'flat';
    window.db.drv.cfg.eC = window.safeVal('us-ec');
    window.db.drv.cfg.ePeriod = document.getElementById('us-e-period') ? document.getElementById('us-e-period').value : 'month';
    window.db.drv.cfg.ePct = window.safeVal('us-epct') / 100;
    
    window.db.drv.cfg.tax = window.safeVal('us-tx') / 100;
    window.db.drv.cfg.cardF = window.safeVal('us-cf') / 100;
    window.db.drv.cfg.voucherF = window.safeVal('us-vf') / 100;
    
    window.save(); 
    window.render();
    if(window.sysAlert) window.sysAlert("Sukces", "Ustawienia zaktualizowane!", "success");
};
