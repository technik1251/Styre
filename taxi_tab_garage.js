// ==========================================
// PLIK: taxi_tab_garage.js - Garaż, Serwis i Paliwo (Premium UI)
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

        // NAGŁÓWEK GARAŻU
        act += '<div style="text-align:center; padding-top:30px; padding-bottom:15px;">';
        act += '<div style="font-size:2.5rem; margin-bottom:5px; filter:drop-shadow(0 0 10px rgba(255,255,255,0.2));">🔧</div>';
        act += '<span style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:800; letter-spacing:2px; text-transform:uppercase;">Dziennik Tankowań i Serwisów</span>';
        act += '<h1 style="margin:5px 0 15px 0; font-size:2.5rem; font-weight:900; letter-spacing:-1px; color:#fff;">Garaż</h1>';
        act += '</div>';

        act += '<div style="padding:0 15px;">';

        // STATYSTYKI PALIWA (FUELIO)
        let fuelStats = window.calcFuelioStats ? window.calcFuelioStats() : {ck: 0, dist: 0, cost: 0, count: 0};
        
        if (fuelStats.count < 2) {
            act += '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:15px; text-align:center; margin-bottom:15px;">';
            act += '<span style="font-size:0.8rem; color:var(--muted); font-weight:600;">Brak pełnych cykli tankowań do obliczeń.<br>Zatankuj do pełna 2 razy.</span>';
            act += '</div>';
        } else {
            act += '<div style="background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(239,68,68,0.2); border-radius:24px; padding:20px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5); margin-bottom:25px;">';
            act += '<div style="font-size:0.7rem; color:rgba(255,255,255,0.5); font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px;">ZBIORCZY KOSZT PALIW (MIX) NA 1 KM</div>';
            act += '<div style="font-size:3.5rem; font-weight:900; color:#ef4444; text-shadow:0 0 20px rgba(239,68,68,0.4); line-height:1; margin-bottom:10px;">'+Number(fuelStats.ck).toFixed(2)+' zł</div>';
            act += '<div style="font-size:0.75rem; color:var(--muted); font-weight:600;">Dystans mix: '+Number(fuelStats.dist).toFixed(0)+' KM | Wydano: '+Number(fuelStats.cost).toFixed(2)+' zł</div>';
            act += '</div>';
        }

        // ZAKŁADKI (TANKOWANIE / SERWIS)
        let isFuel = window.garageTabMode === 'fuel';
        act += '<div style="display:flex; gap:10px; margin-bottom:20px;">';
        act += '<button style="flex:1; padding:15px; border-radius:16px; font-weight:900; font-size:0.85rem; letter-spacing:0.5px; border:none; outline:none; transition:all 0.3s; '+(isFuel ? 'background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; box-shadow:0 5px 15px rgba(245,158,11,0.4);' : 'background:rgba(255,255,255,0.05); color:var(--muted); border:1px solid rgba(255,255,255,0.1);')+'" onclick="window.switchGarageTab(\'fuel\')">⛽ TANKOWANIA</button>';
        act += '<button style="flex:1; padding:15px; border-radius:16px; font-weight:900; font-size:0.85rem; letter-spacing:0.5px; border:none; outline:none; transition:all 0.3s; '+(!isFuel ? 'background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; box-shadow:0 5px 15px rgba(239,68,68,0.4);' : 'background:rgba(255,255,255,0.05); color:var(--muted); border:1px solid rgba(255,255,255,0.1);')+'" onclick="window.switchGarageTab(\'service\')">🔧 SERWIS / INNE</button>';
        act += '</div>';

        // FORMULARZ
        let inpStyle = 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:1.1rem; font-weight:700; outline:none; width:100%; box-sizing:border-box;';
        let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block;';

        if (isFuel) {
            act += '<div class="panel" style="padding:25px 20px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(245,158,11,0.3); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:25px;">';
            act += '<div style="text-align:center; margin-bottom:20px;"><span style="font-size:0.75rem; color:rgba(245,158,11,0.8); font-weight:900; text-transform:uppercase; letter-spacing:1px;">⛽ NOWE TANKOWANIE</span></div>';
            
            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px;">';
            act += '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">LICZNIK (KM)</label><input type="number" id="df-o" placeholder="np. 150200" style="'+inpStyle+'"></div>';
            act += '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">ILOŚĆ (L / KWH)</label><input type="number" step="0.1" id="df-l" placeholder="0.0" style="'+inpStyle+'"></div>';
            act += '</div>';

            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px;">';
            act += '<div class="inp-group" style="margin:0; flex:1.5;"><label style="'+lblStyle+' color:#f59e0b;">KOSZT (ZŁ)</label><input type="number" step="0.01" id="df-v" placeholder="0.00" style="background:#000; border:1px solid rgba(245,158,11,0.3); color:#f59e0b; border-radius:14px; padding:16px; text-align:center; font-size:1.3rem; font-weight:900; width:100%; outline:none; box-sizing:border-box;"></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">DATA</label><input type="date" id="df-date" value="'+today+'" style="'+inpStyle+' font-size:0.9rem; padding:18px 10px;"></div>';
            act += '</div>';

            act += '<div class="inp-row" style="margin-bottom:25px; gap:12px;">';
            act += '<div class="inp-group" style="margin:0; flex:1.5;"><select id="df-type" style="'+inpStyle+' appearance:none; font-size:0.95rem;"><option value="pb">⛽ Benzyna (PB)</option><option value="on">⛽ Diesel (ON)</option><option value="lpg">⛽ Gaz (LPG)</option><option value="ev">⚡ Prąd (EV)</option></select></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); color:#f59e0b; border-radius:14px; padding:16px; font-size:0.85rem; font-weight:900; cursor:pointer;"><input type="checkbox" id="df-full" checked style="accent-color:#f59e0b; width:18px; height:18px;"> DO PEŁNA</label></div>';
            act += '</div>';

            act += '<button class="btn" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; padding:20px; border-radius:20px; font-weight:900; font-size:1.1rem; letter-spacing:1px; border:none; box-shadow:0 10px 30px rgba(245,158,11,0.4); width:100%; outline:none;" onclick="if(window.dAF) window.dAF()">ZAPISZ TANKOWANIE</button>';
            act += '</div>';
        } else {
            act += '<div class="panel" style="padding:25px 20px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(239,68,68,0.3); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:25px;">';
            act += '<div style="text-align:center; margin-bottom:20px;"><span style="font-size:0.75rem; color:rgba(239,68,68,0.8); font-weight:900; text-transform:uppercase; letter-spacing:1px;">🔧 NOWY SERWIS / WYDATEK</span></div>';
            
            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px;">';
            act += '<div class="inp-group" style="margin:0; flex:1.5;"><label style="'+lblStyle+' color:#ef4444;">KOSZT (ZŁ)</label><input type="number" step="0.01" id="de-v" placeholder="0.00" style="background:#000; border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:14px; padding:16px; text-align:center; font-size:1.3rem; font-weight:900; width:100%; outline:none; box-sizing:border-box;"></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">DATA</label><input type="date" id="de-date" value="'+today+'" style="'+inpStyle+' font-size:0.9rem; padding:18px 10px;"></div>';
            act += '</div>';

            act += '<div class="inp-group" style="margin-bottom:25px;"><label style="'+lblStyle+'">OPIS WYDATKU</label><input type="text" id="de-c" placeholder="np. Myjnia, Wycieraczki, Płyn..." style="'+inpStyle+' text-align:left;"></div>';

            act += '<button class="btn" style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; padding:20px; border-radius:20px; font-weight:900; font-size:1.1rem; letter-spacing:1px; border:none; box-shadow:0 10px 30px rgba(239,68,68,0.4); width:100%; outline:none;" onclick="if(window.dAE) window.dAE()">ZAPISZ WYDATEK</button>';
            act += '</div>';
        }

        // HISTORIA WYDATKÓW
        act += '<div style="margin: 30px 5px 15px 5px; text-align: center;"><span style="font-size:0.75rem; color:var(--muted); font-weight:800; letter-spacing:1.5px; text-transform:uppercase;">HISTORIA WYDATKÓW Z GARAŻU</span></div>';

        let expenses = d.exp || [];
        if(expenses.length > 0) {
            for(let i=0; i<expenses.length; i++) {
                let ex = expenses[i];
                let icon = '🔧', color = '#ef4444';
                if(ex.ty === 'f') { icon = '⛽'; color = '#f59e0b'; }
                
                act += '<div class="log-item" style="border:none; padding:16px; margin-bottom:12px; background:rgba(255,255,255,0.03); border-radius:20px; border-left:4px solid '+color+'; display:flex; align-items:center; gap:15px;">' +
                    '<div style="font-size:1.5rem; width:45px; height:45px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:12px; display:flex; align-items:center; justify-content:center;">'+icon+'</div>' +
                    '<div style="flex:1;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                            '<strong style="font-size:1.1rem; color:#fff; font-weight:800;">'+Number(ex.v).toFixed(2)+' zł</strong>' +
                            '<span style="font-size:0.7rem; color:rgba(255,255,255,0.4); font-weight:700;">'+ex.dt+'</span>' +
                        '</div>' +
                        '<div style="font-size:0.75rem; color:var(--muted); font-weight:600; margin-top:2px;">'+ex.d+' '+(ex.full?'(Do pełna)':'')+'</div>' +
                    '</div>' +
                    '<button style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:8px 12px; margin-right:5px; cursor:pointer; outline:none;" onclick="if(window.dEditExp) window.dEditExp('+ex.id+')">✏️</button>' +
                    '<button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; border-radius:10px; padding:8px 12px; cursor:pointer; outline:none;" onclick="if(window.dDelExp) window.dDelExp('+ex.id+')">🗑️</button>' +
                '</div>';
            }
        } else {
            act += '<div style="background:rgba(0,0,0,0.2); border:1px dashed rgba(255,255,255,0.05); border-radius:24px; padding:30px; text-align:center; color:var(--muted); font-weight:600; font-size:0.85rem; margin-bottom:20px;">Brak wpisów w tej kategorii.</div>';
        }

        // BANER OCR (NA DOLE)
        let alertCodeOCR = "if(window.sysAlert) window.sysAlert('Skaner OCR PRO', 'Koniec z ręcznym przepisywaniem! W wersji PRO zrobisz zdjęcie paragonu, a AI samo uzupełni kwoty i litry. 📸🚀', 'info')";
        act += '<div class="pro-teaser-panel" style="margin: 25px 0; padding: 25px 20px; background: linear-gradient(135deg, #0f172a 0%, #000000 100%); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 28px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; text-align:center;" onclick="' + alertCodeOCR + '">' +
            '<div style="font-size:3rem; filter:drop-shadow(0 0 15px rgba(14,165,233,0.5)); margin-bottom:10px;">📸</div>' +
            '<h3 style="color:#0ea5e9; margin:0 0 8px 0; font-size:1.1rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">SKANER OCR & RAPORTY PDF</h3>' +
            '<p style="color:rgba(255,255,255,0.5); font-size:0.8rem; font-weight:600; margin:0; line-height:1.4;">Błyskawiczne rozliczanie kosztów - tylko w wersji PRO! Kliknij po info.</p>' +
        '</div>';

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

    if(!o || !l || !v || isNaN(o) || isNaN(l) || isNaN(v)) { 
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
    window.db.drv.exp.push({
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
        if(window.sysAlert) window.sysAlert("Błąd", "Wpisz poprawną kwotę wydatku!", "error"); 
        return; 
    }
    
    let dVal = document.getElementById('de-date').value;
    let dObj = dVal ? new Date(dVal) : new Date();
    dObj.setHours(12,0,0);
    
    if(!window.db.drv.exp) window.db.drv.exp = [];
    window.db.drv.exp.push({
        id: Date.now(), rD: dObj.toISOString(), d: c, 
        v: v, dt: dObj.toLocaleDateString('pl-PL'), ty: 'e'
    });
    window.db.drv.exp.sort(function(a,b){ return new Date(b.rD) - new Date(a.rD); });
    
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Sukces!", "Wydatek został zapisany.", "success");
};
