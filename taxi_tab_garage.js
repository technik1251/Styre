// ==========================================
// PLIK: taxi_tab_garage.js - Garaż, Serwis i Paliwo (Zgodny z filmem + Synchronizacja)
// ==========================================

window.garageTabMode = window.garageTabMode || 'fuel';

window.switchGarageTab = function(mode) {
    window.garageTabMode = mode;
    if(typeof window.render === 'function') window.render();
};

window.rDrvGarage = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;

        let act = '';
        let today = window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0];

        // --- NAGŁÓWEK ---
        act += '<div style="text-align:center; padding-top:30px; padding-bottom:15px;">';
        act += '<div style="font-size:2rem; margin-bottom:5px; color:rgba(255,255,255,0.8);">🔧</div>';
        act += '<span style="font-size:0.6rem; color:var(--muted); font-weight:800; letter-spacing:2px; text-transform:uppercase;">Dziennik Tankowań i Serwisów</span>';
        act += '<h1 style="margin:5px 0 15px 0; font-size:2.8rem; font-weight:900; letter-spacing:-1px; color:#fff;">Garaż</h1>';
        act += '</div>';

        act += '<div style="padding:0 15px;">';

        // --- STATYSTYKI PALIWA (FUELIO) ---
        let fuelStats = window.calcFuelioStats ? window.calcFuelioStats() : {ck: 0, dist: 0, cost: 0, count: 0};
        
        if (fuelStats.count < 2) {
            act += '<div style="background:#111116; border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:20px; text-align:center; margin-bottom:20px;">';
            act += '<span style="font-size:0.8rem; color:var(--muted); font-weight:600; line-height:1.5; display:block;">Brak pełnych cykli tankowań do obliczeń.<br>Zatankuj do pełna 2 razy.</span>';
            act += '</div>';
        } else {
            act += '<div style="background:#111116; border:1px solid rgba(239,68,68,0.2); border-radius:20px; padding:20px; text-align:center; margin-bottom:20px;">';
            act += '<div style="font-size:0.7rem; color:rgba(255,255,255,0.5); font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px;">ZBIORCZY KOSZT PALIW (MIX) NA 1 KM</div>';
            act += '<div style="font-size:3.5rem; font-weight:900; color:#ef4444; line-height:1; margin-bottom:10px;">'+Number(fuelStats.ck).toFixed(2)+' zł</div>';
            act += '<div style="font-size:0.75rem; color:var(--muted); font-weight:600;">Dystans Mix: '+Number(fuelStats.dist).toFixed(0)+' KM | Wydano: '+Number(fuelStats.cost).toFixed(2)+' zł</div>';
            act += '</div>';
        }

        // --- ZAKŁADKI (TANKOWANIE / SERWIS) ---
        let isFuel = window.garageTabMode === 'fuel';
        act += '<div style="display:flex; gap:10px; margin-bottom:20px;">';
        act += '<button style="flex:1; padding:16px; border-radius:16px; font-weight:900; font-size:0.85rem; border:none; outline:none; transition:all 0.2s; '+(isFuel ? 'background:#f59e0b; color:#000; box-shadow:0 0 20px rgba(245,158,11,0.3);' : 'background:#18181b; color:var(--muted); border:1px solid rgba(255,255,255,0.05);')+'" onclick="window.switchGarageTab(\'fuel\')">⛽ TANKOWANIA</button>';
        act += '<button style="flex:1; padding:16px; border-radius:16px; font-weight:900; font-size:0.85rem; border:none; outline:none; transition:all 0.2s; '+(!isFuel ? 'background:#ef4444; color:#fff; box-shadow:0 0 20px rgba(239,68,68,0.3);' : 'background:#18181b; color:var(--muted); border:1px solid rgba(255,255,255,0.05);')+'" onclick="window.switchGarageTab(\'service\')">🔧 SERWIS / INNE</button>';
        act += '</div>';

        // --- FORMULARZ ---
        act += '<div style="border-radius:24px; border:1px solid rgba(255,255,255,0.05); padding:25px 20px; margin-bottom:25px;">';
        
        let inpStyle = 'background:#18181b; border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:12px; padding:16px; text-align:center; font-size:1.1rem; font-weight:700; outline:none; width:100%; box-sizing:border-box;';
        let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; text-align:left;';

        if (isFuel) {
            act += '<div style="text-align:center; margin-bottom:20px;"><span style="font-size:0.85rem; color:#f59e0b; font-weight:900; text-transform:uppercase; letter-spacing:1px;">⛽ NOWE TANKOWANIE</span></div>';
            
            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px;">';
            act += '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">LICZNIK (KM)</label><input type="number" id="df-o" placeholder="np. 150200" style="'+inpStyle+'"></div>';
            act += '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">ILOŚĆ (L / KWH)</label><input type="number" step="0.1" id="df-l" placeholder="0.0" style="'+inpStyle+'"></div>';
            act += '</div>';

            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px;">';
            act += '<div class="inp-group" style="margin:0; flex:1.2;"><label style="'+lblStyle+' color:#f59e0b;">KOSZT (ZŁ)</label><input type="number" step="0.01" id="df-v" placeholder="0.00" style="background:#000; border:1px solid rgba(245,158,11,0.4); color:#f59e0b; border-radius:12px; padding:16px; text-align:center; font-size:1.5rem; font-weight:900; width:100%; outline:none; box-sizing:border-box;"></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">DATA</label><input type="date" id="df-date" value="'+today+'" style="'+inpStyle+' font-size:0.95rem; padding:18px 10px;"></div>';
            act += '</div>';

            // DYNAMICZNE POBIERANIE PALIW Z USTAWIEŃ!
            let fTypes = (d.cfg && Array.isArray(d.cfg.fTypes) && d.cfg.fTypes.length > 0) ? d.cfg.fTypes : ['pb'];
            let fuelOpts = '';
            if(fTypes.includes('pb')) fuelOpts += '<option value="pb">⛽ Benzyna (PB)</option>';
            if(fTypes.includes('on')) fuelOpts += '<option value="on">⛽ Diesel (ON)</option>';
            if(fTypes.includes('lpg')) fuelOpts += '<option value="lpg">⛽ Gaz (LPG)</option>';
            if(fTypes.includes('ev')) fuelOpts += '<option value="ev">⚡ Prąd (EV)</option>';

            act += '<div class="inp-row" style="margin-bottom:25px; gap:12px;">';
            act += '<div class="inp-group" style="margin:0; flex:1.2;"><select id="df-type" style="'+inpStyle+' appearance:none; font-size:0.95rem; text-align:left; padding-left:15px;">'+fuelOpts+'</select></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); color:#f59e0b; border-radius:12px; padding:16px; font-size:0.9rem; font-weight:900; cursor:pointer; width:100%; box-sizing:border-box;"><input type="checkbox" id="df-full" checked style="accent-color:#f59e0b; width:20px; height:20px;"> DO PEŁNA</label></div>';
            act += '</div>';

            act += '<button class="btn" style="background:#f59e0b; color:#000; padding:20px; border-radius:16px; font-weight:900; font-size:1.1rem; letter-spacing:1px; border:none; box-shadow:0 8px 25px rgba(245,158,11,0.4); width:100%; outline:none;" onclick="if(window.dAF) window.dAF()">ZAPISZ TANKOWANIE</button>';
        } else {
            act += '<div style="text-align:center; margin-bottom:20px;"><span style="font-size:0.85rem; color:rgba(239,68,68,0.8); font-weight:900; text-transform:uppercase; letter-spacing:1px;">KOSZTY EKSPLOATACYJNE</span></div>';
            
            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px;">';
            act += '<div class="inp-group" style="margin:0; flex:1.2;"><label style="'+lblStyle+' color:#ef4444;">KOSZT (ZŁ)</label><input type="number" step="0.01" id="de-v" placeholder="0.00" style="background:#000; border:1px solid rgba(239,68,68,0.4); color:#ef4444; border-radius:12px; padding:16px; text-align:center; font-size:1.5rem; font-weight:900; width:100%; outline:none; box-sizing:border-box;"></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">DATA</label><input type="date" id="de-date" value="'+today+'" style="'+inpStyle+' font-size:0.95rem; padding:18px 10px;"></div>';
            act += '</div>';

            act += '<div class="inp-group" style="margin-bottom:25px;"><label style="'+lblStyle+'">OPIS WYDATKU</label><input type="text" id="de-c" placeholder="np. Myjnia, Płyn, Klocki" style="'+inpStyle+' text-align:left;"></div>';

            act += '<button class="btn" style="background:#ef4444; color:#fff; padding:20px; border-radius:16px; font-weight:900; font-size:1.1rem; letter-spacing:1px; border:none; box-shadow:0 8px 25px rgba(239,68,68,0.4); width:100%; outline:none;" onclick="if(window.dAE) window.dAE()">DODAJ WYDATEK DO BAZY</button>';
        }
        act += '</div>'; // Koniec Formularza

        // --- HISTORIA WYDATKÓW ---
        act += '<div style="margin: 30px 5px 15px 5px; text-align: center;"><span style="font-size:0.75rem; color:var(--muted); font-weight:800; letter-spacing:1px; text-transform:uppercase;">HISTORIA WYDATKÓW Z GARAŻU</span></div>';

        let expenses = d.exp || [];
        if(expenses.length > 0) {
            for(let i=0; i<expenses.length; i++) {
                let ex = expenses[i];
                let icon = '🔧', color = '#ef4444';
                if(ex.ty === 'f') { icon = '⛽'; color = '#f59e0b'; }
                
                act += '<div class="log-item" style="border:none; padding:16px; margin-bottom:12px; background:#18181b; border-radius:16px; border-left:4px solid '+color+'; display:flex; align-items:center; gap:15px;">' +
                    '<div style="font-size:1.5rem; width:45px; height:45px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:12px; display:flex; align-items:center; justify-content:center;">'+icon+'</div>' +
                    '<div style="flex:1;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                            '<strong style="font-size:1.1rem; color:#fff; font-weight:800;">'+Number(ex.v).toFixed(2)+' zł</strong>' +
                            '<span style="font-size:0.7rem; color:rgba(255,255,255,0.4); font-weight:700;">'+ex.dt+'</span>' +
                        '</div>' +
                        '<div style="font-size:0.75rem; color:var(--muted); font-weight:600; margin-top:2px;">'+ex.d+' '+(ex.full?'(Do pełna)':'')+'</div>' +
                    '</div>' +
                    '<button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; border-radius:10px; padding:8px 12px; cursor:pointer; outline:none;" onclick="if(window.dDelExp) window.dDelExp('+ex.id+')">🗑️</button>' +
                '</div>';
            }
        } else {
            act += '<div style="background:#111116; border-radius:20px; padding:25px; text-align:center; color:var(--muted); font-weight:600; font-size:0.85rem; margin-bottom:20px;">Brak wpisów w tej kategorii.</div>';
        }

        // --- BANER OCR (Premium Blue Style z filmiku) ---
        let alertCodeOCR = "if(window.sysAlert) window.sysAlert('Skaner Paragonów i PDF (PRO)', 'Koniec z ręcznym przepisywaniem! W wersji PRO zrobisz zdjęcie paragonu za paliwo lub myjnię, a AI samo uzupełni kwoty. Dodatkowo wygenerujesz eleganckie raporty PDF dla księgowego. 📸📄', 'info')";
        
        act += '<div class="pro-teaser-panel" style="margin: 25px 0; padding: 25px 20px; background: #0f172a; border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; text-align:center;" onclick="' + alertCodeOCR + '">';
        act += '<div style="font-size:2.8rem; filter:drop-shadow(0 0 10px rgba(14,165,233,0.5)); margin-bottom:10px;">📸</div>';
        act += '<h3 style="color:#0ea5e9; margin:0 0 8px 0; font-size:1rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">SKANER OCR & RAPORTY PDF</h3>';
        act += '<p style="color:rgba(255,255,255,0.5); font-size:0.75rem; font-weight:600; margin:0; line-height:1.4;">Błyskawiczne rozliczanie kosztów - tylko w wersji PRO! Kliknij po info.</p>';
        act += '</div>';

        act += '</div>'; // Koniec paddingu 15px

        appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;

    } catch(err) {
        console.error(err);
    }
};

window.dAF = function() {
    let o = parseFloat(document.getElementById('df-o').value);
    let l = parseFloat(document.getElementById('df-l').value);
    let v = parseFloat(document.getElementById('df-v').value);
    
    let type = document.getElementById('df-type').value;
    let isFullCheck = document.getElementById('df-full').checked;
    let f = isFullCheck ? type + '_full' : type + '_part';

    if(isNaN(o) || isNaN(l) || isNaN(v) || o <= 0 || l <= 0 || v <= 0) { 
        if(window.sysAlert) window.sysAlert("Błąd", "Wypełnij poprawnie wszystkie dane (Licznik, Litry, Koszt)!", "error"); 
        return; 
    }
    
    let dVal = document.getElementById('df-date').value;
    let dObj = dVal ? new Date(dVal) : new Date();
    dObj.setHours(12,0,0);
    
    let dist=0, l100=0, cpkm=0;
    if(!window.db.drv.fuel) window.db.drv.fuel = [];
    
    let prevF = window.db.drv.fuel.filter(function(x){ return x.o < o; }).sort(function(a,b){ return b.o - a.o; })[0];
    if(prevF) {
        dist = o - prevF.o;
        if(dist > 0) {
            l100 = (l / dist) * 100;
            cpkm = v / dist;
        }
    }
    
    window.db.drv.odo = o;
    window.db.drv.fuel.push({o: o, l: l, v: v, isF: f, rD: dObj.toISOString()});
    window.db.drv.fuel.sort(function(a,b){ return b.o - a.o; });
    
    if(!window.db.drv.exp) window.db.drv.exp = [];
    window.db.drv.exp.unshift({
        id: Date.now(), rD: dObj.toISOString(), d: '⛽ Tankowanie ' + type.toUpperCase(), 
        v: v, dt: dObj.toLocaleDateString('pl-PL'), ty: 'f', 
        l: l, odo: o, dist: dist, l100: l100, cpkm: cpkm, isF: f, full: isFullCheck
    });
    window.db.drv.exp.sort(function(a,b){ return new Date(b.rD) - new Date(a.rD); });
    
    if(window.db.drv.cfg && window.db.drv.cfg.fuelSource !== 'manual' && window.calcFuelioStats) {
         let fs = window.calcFuelioStats();
         if(fs.ck > 0) window.db.drv.cfg.fuelPx = fs.ck;
    }
    
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Sukces!", "Tankowanie zapisane w historii.", "success");
};

window.dAE = function() {
    let v = parseFloat(document.getElementById('de-v').value);
    let c = document.getElementById('de-c').value || 'Wydatki / Serwis';
    
    if(isNaN(v) || v <= 0) { 
        if(window.sysAlert) window.sysAlert("Błąd", "Wpisz poprawną kwotę wydatku (większą od zera).", "error"); 
        return; 
    }
    
    let dVal = document.getElementById('de-date').value;
    let dObj = dVal ? new Date(dVal) : new Date();
    dObj.setHours(12,0,0);
    
    if(!window.db.drv.exp) window.db.drv.exp = [];
    window.db.drv.exp.unshift({
        id: Date.now(), rD: dObj.toISOString(), d: c, 
        v: v, dt: dObj.toLocaleDateString('pl-PL'), ty: 'e'
    });
    window.db.drv.exp.sort(function(a,b){ return new Date(b.rD) - new Date(a.rD); });
    
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Sukces!", "Wydatek został zapisany.", "success");
};

window.dDelExp = function(id) {
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie wpisu", "Na pewno chcesz usunąć ten wydatek z historii?", function() {
            let expList = window.db.drv.exp || [];
            let e = expList.find(function(x) { return x.id === id; });
            if(e && e.ty === 'f') {
                window.db.drv.fuel = (window.db.drv.fuel || []).filter(function(f) { return f.o !== e.odo; });
            }
            window.db.drv.exp = expList.filter(function(x) { return x.id !== id; });
            
            if(window.db.drv.cfg && window.db.drv.cfg.fuelSource !== 'manual' && window.calcFuelioStats) {
                let fs = window.calcFuelioStats();
                window.db.drv.cfg.fuelPx = fs.ck > 0 ? fs.ck : 0;
            }

            if(typeof window.save === 'function') window.save(); 
            if(typeof window.render === 'function') window.render();
        });
    }
};
