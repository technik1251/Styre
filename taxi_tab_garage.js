// ==========================================
// PLIK: taxi_tab_garage.js - Garaż 2.0 (Apple Premium UI) & Nowe Powiadomienia
// ==========================================

// --- 🌟 GLOBALNA NADPISKA POWIADOMIEŃ (APPLE GLASSMORPHISM) 🌟 ---
// To sprawi, że wszystkie alerty w apce przestaną wyglądać jak z "Windows XP"
window.sysAlert = function(title, text, type) {
    let existing = document.getElementById('sys-alert-modal');
    if(existing) existing.remove();

    let icon = 'ℹ️';
    let color = '#0ea5e9';
    let bgGlow = 'rgba(14,165,233,0.15)';
    
    if(type === 'error') { icon = '⚠️'; color = '#ef4444'; bgGlow = 'rgba(239,68,68,0.15)'; }
    else if(type === 'success') { icon = '✅'; color = '#10b981'; bgGlow = 'rgba(16,185,129,0.15)'; }
    else if(type === 'warning') { icon = '⚡'; color = '#f59e0b'; bgGlow = 'rgba(245,158,11,0.15)'; }
    else if(title.toUpperCase().includes('PRO')) { icon = '✨'; color = '#d946ef'; bgGlow = 'rgba(217,70,239,0.2)'; }

    let html = '<div id="sys-alert-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:999999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div style="width:85%; max-width:340px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.08); border-radius:32px; box-shadow:0 30px 60px rgba(0,0,0,0.8), 0 0 30px ' + bgGlow + '; text-align:center; padding:35px 25px; position:relative; overflow:hidden;">' +
            '<div style="position:absolute; top:-40px; left:50%; transform:translateX(-50%); width:150px; height:150px; background:' + bgGlow + '; filter:blur(40px); border-radius:50%; pointer-events:none;"></div>' +
            '<div style="font-size:4rem; margin-bottom:15px; filter:drop-shadow(0 0 15px ' + color + '); position:relative; z-index:2;">' + icon + '</div>' +
            '<h3 style="color:' + color + '; margin:0 0 10px 0; font-size:1.4rem; font-weight:900; letter-spacing:-0.5px; position:relative; z-index:2;">' + title + '</h3>' +
            '<p style="color:rgba(255,255,255,0.6); font-size:0.9rem; line-height:1.5; margin:0 0 30px 0; font-weight:600; position:relative; z-index:2;">' + text + '</p>' +
            '<button style="width:100%; padding:18px; border-radius:20px; background:' + color + '; color:#000; font-size:1.05rem; font-weight:900; letter-spacing:1px; border:none; box-shadow:0 10px 25px ' + bgGlow + '; outline:none; cursor:pointer; position:relative; z-index:2;" onclick="document.getElementById(\'sys-alert-modal\').remove()">ZROZUMIANO</button>' +
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

// --- LOGIKA ZAKŁADEK GARAŻU ---
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
        act += '<div style="font-size:3rem; margin-bottom:5px; filter:drop-shadow(0 0 15px rgba(255,255,255,0.2));">🔧</div>';
        act += '<span style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:800; letter-spacing:2px; text-transform:uppercase;">Dziennik Kosztów Floty</span>';
        act += '<h1 style="margin:5px 0 15px 0; font-size:2.8rem; font-weight:900; letter-spacing:-1.5px; color:#fff;">Garaż</h1>';
        act += '</div>';

        act += '<div style="padding:0 15px;">';

        // STATYSTYKI PALIWA (FUELIO)
        let fuelStats = window.calcFuelioStats ? window.calcFuelioStats() : {ck: 0, dist: 0, cost: 0, count: 0};
        
        if (fuelStats.count < 2) {
            act += '<div style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.1); border-radius:20px; padding:20px; text-align:center; margin-bottom:20px;">';
            act += '<span style="font-size:0.8rem; color:var(--muted); font-weight:600; line-height:1.4; display:block;">System kalibruje spalanie pojazdu...<br>Zatankuj "Do Pełna" jeszcze '+(2 - fuelStats.count)+' raz(y), aby poznać realny koszt 1 KM.</span>';
            act += '</div>';
        } else {
            act += '<div style="background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(245,158,11,0.3); border-radius:28px; padding:25px 20px; text-align:center; box-shadow:0 15px 40px rgba(0,0,0,0.5); margin-bottom:25px; position:relative; overflow:hidden;">';
            act += '<div style="position:absolute; top:-20px; right:-20px; width:100px; height:100px; background:rgba(245,158,11,0.1); border-radius:50%; filter:blur(30px);"></div>';
            act += '<div style="font-size:0.7rem; color:rgba(255,255,255,0.5); font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px; position:relative; z-index:2;">REALNY KOSZT PALIW (NA 1 KM)</div>';
            act += '<div style="font-size:4rem; font-weight:900; color:#f59e0b; text-shadow:0 0 25px rgba(245,158,11,0.4); line-height:1; margin-bottom:10px; font-family:monospace; position:relative; z-index:2;">'+Number(fuelStats.ck).toFixed(2)+' <span style="font-size:1.5rem; color:rgba(245,158,11,0.5);">zł</span></div>';
            act += '<div style="font-size:0.75rem; color:var(--muted); font-weight:700; position:relative; z-index:2; background:rgba(0,0,0,0.3); padding:8px 15px; border-radius:12px; display:inline-block;">Analiza: '+Number(fuelStats.dist).toFixed(0)+' KM | Spalono: '+Number(fuelStats.cost).toFixed(2)+' zł</div>';
            act += '</div>';
        }

        // PRZEŁĄCZNIK ZAKŁADEK (APPLE SEGMENTED CONTROL STYLE)
        let isFuel = window.garageTabMode === 'fuel';
        act += '<div style="display:flex; background:rgba(0,0,0,0.4); border-radius:20px; padding:6px; border:1px solid rgba(255,255,255,0.05); margin-bottom:25px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.3);">';
        act += '<button style="flex:1; padding:16px; border-radius:16px; font-weight:900; font-size:0.85rem; letter-spacing:0.5px; border:none; outline:none; transition:all 0.3s; '+(isFuel ? 'background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; box-shadow:0 8px 20px rgba(245,158,11,0.4);' : 'background:transparent; color:var(--muted);')+'" onclick="window.switchGarageTab(\'fuel\')">⛽ TANKOWANIA</button>';
        act += '<button style="flex:1; padding:16px; border-radius:16px; font-weight:900; font-size:0.85rem; letter-spacing:0.5px; border:none; outline:none; transition:all 0.3s; '+(!isFuel ? 'background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; box-shadow:0 8px 20px rgba(239,68,68,0.4);' : 'background:transparent; color:var(--muted);')+'" onclick="window.switchGarageTab(\'service\')">🔧 SERWIS / INNE</button>';
        act += '</div>';

        // FORMULARZ PREMIUM
        act += '<div class="panel" style="padding:30px 20px; border-radius:32px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid '+(isFuel ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)')+'; box-shadow:0 20px 50px rgba(0,0,0,0.7); margin-bottom:30px; position:relative; overflow:hidden;">';
        
        let inpStyle = 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:16px; padding:18px; text-align:center; font-size:1.1rem; font-weight:700; outline:none; width:100%; box-sizing:border-box; transition:all 0.3s ease;';
        let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; text-align:left; padding-left:5px;';

        if (isFuel) {
            act += '<div style="position:absolute; top:-30px; left:50%; transform:translateX(-50%); width:150px; height:150px; background:rgba(245,158,11,0.1); filter:blur(40px); border-radius:50%; pointer-events:none;"></div>';
            act += '<div style="text-align:center; margin-bottom:25px; position:relative; z-index:2;"><span style="font-size:0.8rem; color:#f59e0b; font-weight:900; text-transform:uppercase; letter-spacing:1.5px;">Wprowadź Dane Paragonu</span></div>';
            
            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px; position:relative; z-index:2;">';
            act += '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Licznik Auta (KM)</label><input type="number" id="df-o" placeholder="np. 150200" style="'+inpStyle+'"></div>';
            act += '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Ilość (L / KWh)</label><input type="number" step="0.1" id="df-l" placeholder="0.0" style="'+inpStyle+'"></div>';
            act += '</div>';

            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px; position:relative; z-index:2;">';
            act += '<div class="inp-group" style="margin:0; flex:1.5;"><label style="'+lblStyle+' color:#f59e0b;">Koszt Całkowity (ZŁ)</label><input type="number" step="0.01" id="df-v" placeholder="0.00" style="background:#000; border:1px solid rgba(245,158,11,0.4); color:#f59e0b; border-radius:16px; padding:18px; text-align:center; font-size:1.5rem; font-weight:900; width:100%; outline:none; box-sizing:border-box; box-shadow:inset 0 2px 10px rgba(0,0,0,0.5);"></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Data</label><input type="date" id="df-date" value="'+today+'" style="'+inpStyle+' font-size:0.95rem; padding:22px 10px;"></div>';
            act += '</div>';

            act += '<div class="inp-row" style="margin-bottom:30px; gap:12px; position:relative; z-index:2;">';
            act += '<div class="inp-group" style="margin:0; flex:1.5;"><select id="df-type" style="'+inpStyle+' appearance:none; font-size:1rem; text-align:left;"><option value="pb">⛽ Benzyna (PB)</option><option value="on">⛽ Diesel (ON)</option><option value="lpg">⛽ Gaz (LPG)</option><option value="ev">⚡ Prąd (EV)</option></select></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:#f59e0b; border-radius:16px; padding:18px; font-size:0.9rem; font-weight:900; cursor:pointer; width:100%; box-sizing:border-box;"><input type="checkbox" id="df-full" checked style="accent-color:#f59e0b; width:20px; height:20px;"> DO PEŁNA</label></div>';
            act += '</div>';

            act += '<button class="btn" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; padding:22px; border-radius:20px; font-weight:900; font-size:1.1rem; letter-spacing:1px; border:none; box-shadow:0 10px 30px rgba(245,158,11,0.4); width:100%; outline:none; position:relative; z-index:2;" onclick="if(window.dAF) window.dAF()">ZAPISZ TANKOWANIE</button>';
        } else {
            act += '<div style="position:absolute; top:-30px; left:50%; transform:translateX(-50%); width:150px; height:150px; background:rgba(239,68,68,0.1); filter:blur(40px); border-radius:50%; pointer-events:none;"></div>';
            act += '<div style="text-align:center; margin-bottom:25px; position:relative; z-index:2;"><span style="font-size:0.8rem; color:#ef4444; font-weight:900; text-transform:uppercase; letter-spacing:1.5px;">Rachunek z Serwisu</span></div>';
            
            act += '<div class="inp-row" style="margin-bottom:15px; gap:12px; position:relative; z-index:2;">';
            act += '<div class="inp-group" style="margin:0; flex:1.5;"><label style="'+lblStyle+' color:#ef4444;">Koszt Całkowity (ZŁ)</label><input type="number" step="0.01" id="de-v" placeholder="0.00" style="background:#000; border:1px solid rgba(239,68,68,0.4); color:#ef4444; border-radius:16px; padding:18px; text-align:center; font-size:1.5rem; font-weight:900; width:100%; outline:none; box-sizing:border-box; box-shadow:inset 0 2px 10px rgba(0,0,0,0.5);"></div>';
            act += '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Data</label><input type="date" id="de-date" value="'+today+'" style="'+inpStyle+' font-size:0.95rem; padding:22px 10px;"></div>';
            act += '</div>';

            act += '<div class="inp-group" style="margin-bottom:30px; position:relative; z-index:2;"><label style="'+lblStyle+'">Opis Wydatku</label><input type="text" id="de-c" placeholder="np. Wymiana oleju, Myjnia..." style="'+inpStyle+' text-align:left;"></div>';

            act += '<button class="btn" style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; padding:22px; border-radius:20px; font-weight:900; font-size:1.1rem; letter-spacing:1px; border:none; box-shadow:0 10px 30px rgba(239,68,68,0.4); width:100%; outline:none; position:relative; z-index:2;" onclick="if(window.dAE) window.dAE()">DODAJ WYDATEK DO BAZY</button>';
        }
        act += '</div>';

        // HISTORIA WYDATKÓW
        act += '<div style="margin: 40px 5px 15px 5px; text-align: center;"><span style="font-size:0.75rem; color:var(--muted); font-weight:800; letter-spacing:2px; text-transform:uppercase;">HISTORIA GARAŻU</span></div>';

        let expenses = d.exp || [];
        if(expenses.length > 0) {
            for(let i=0; i<expenses.length; i++) {
                let ex = expenses[i];
                let icon = '🔧', color = '#ef4444', bg = 'rgba(239,68,68,0.05)';
                if(ex.ty === 'f') { icon = '⛽'; color = '#f59e0b'; bg = 'rgba(245,158,11,0.05)'; }
                
                act += '<div class="log-item" style="border:none; padding:18px; margin-bottom:12px; background:rgba(255,255,255,0.03); border-radius:20px; border-left:4px solid '+color+'; display:flex; align-items:center; gap:15px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">' +
                    '<div style="font-size:1.5rem; width:50px; height:50px; background:'+bg+'; border:1px solid '+color+'; border-radius:14px; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 10px rgba(0,0,0,0.5);">'+icon+'</div>' +
                    '<div style="flex:1;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                            '<strong style="font-size:1.15rem; color:#fff; font-weight:900; letter-spacing:-0.5px;">'+Number(ex.v).toFixed(2)+' zł</strong>' +
                            '<span style="font-size:0.7rem; color:rgba(255,255,255,0.4); font-weight:700;">'+ex.dt+'</span>' +
                        '</div>' +
                        '<div style="font-size:0.8rem; color:var(--muted); font-weight:600; margin-top:4px;">'+ex.d+' '+(ex.full?'<span style="color:#f59e0b; font-size:0.7rem;">(Pełny)</span>':'')+'</div>' +
                    '</div>' +
                    '<div style="display:flex; flex-direction:column; gap:8px;">' +
                        '<button style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:8px 12px; cursor:pointer; outline:none;" onclick="if(window.dEditExp) window.dEditExp('+ex.id+')">✏️</button>' +
                        '<button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; border-radius:10px; padding:8px 12px; cursor:pointer; outline:none;" onclick="if(window.dDelExp) window.dDelExp('+ex.id+')">🗑️</button>' +
                    '</div>' +
                '</div>';
            }
        } else {
            act += '<div style="background:rgba(0,0,0,0.2); border:1px dashed rgba(255,255,255,0.05); border-radius:24px; padding:30px; text-align:center; color:var(--muted); font-weight:600; font-size:0.85rem; margin-bottom:20px;">Twój garaż jest na razie pusty.</div>';
        }

        // BANER OCR (NA DOLE, PIĘKNY I BŁYSZCZĄCY)
        let alertCodeOCR = "if(window.sysAlert) window.sysAlert('Skaner OCR PRO', 'W wersji PRO zrobisz zdjęcie paragonu, a AI samo rozpozna kwoty, litry i datę, automatycznie wprowadzając je do bazy! Koniec z ręcznym przepisywaniem. 📸🚀', 'info')";
        act += '<div class="pro-teaser-panel" style="margin: 30px 0; padding: 25px 20px; background: linear-gradient(135deg, #0f172a 0%, #000000 100%); border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 28px; position: relative; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.6); cursor: pointer; text-align:center; transition:transform 0.2s;" onclick="' + alertCodeOCR + '">' +
            '<div style="position:absolute; top:0; left:50%; transform:translateX(-50%); width:200px; height:10px; background:rgba(14,165,233,0.5); filter:blur(15px);"></div>' +
            '<div style="font-size:3.5rem; filter:drop-shadow(0 0 20px rgba(14,165,233,0.5)); margin-bottom:10px;">📸</div>' +
            '<h3 style="color:#0ea5e9; margin:0 0 8px 0; font-size:1.2rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">SKANER OCR & RAPORTY PDF</h3>' +
            '<p style="color:rgba(255,255,255,0.5); font-size:0.85rem; font-weight:600; margin:0; line-height:1.5;">Oszczędź czas - w wersji PRO AI odczyta paragon za Ciebie. Kliknij by sprawdzić!</p>' +
        '</div>';

        act += '</div>'; // Koniec paddingu 15px

        // POTĘŻNY PADDING NA DOLE ABY PRZYCISK NIGDY NIE BYŁ ZASŁONIĘTY PRZEZ MENU!
        appContainer.innerHTML = hdr + act + '<div style="height:150px; width:100%; display:block; clear:both; visibility:hidden;">SPACER</div>' + nav;

    } catch(err) {
        console.error(err);
    }
};

// --- LOGIKA ZAPISU TANKOWANIA ---
window.dAF = function() {
    let o = parseFloat(document.getElementById('df-o').value);
    let l = parseFloat(document.getElementById('df-l').value);
    let v = parseFloat(document.getElementById('df-v').value);
    
    let type = document.getElementById('df-type').value;
    let isFullCheck = document.getElementById('df-full').checked;
    let f = isFullCheck ? type + '_full' : type + '_part';

    if(isNaN(o) || isNaN(l) || isNaN(v) || o <= 0 || l <= 0 || v <= 0) { 
        if(window.sysAlert) window.sysAlert("Błąd Formularza", "Upewnij się, że poprawnie wpisałeś przebieg (KM), litry i koszt.", "error"); 
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
    if(window.sysAlert) window.sysAlert("Tankowanie Zapisane!", "Koszt został dodany do historii Garażu.", "success");
};

// --- LOGIKA ZAPISU WYDATKU/SERWISU ---
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
    if(window.sysAlert) window.sysAlert("Wydatek Zapisany!", "Rachunek z serwisu został doliczony do kosztów.", "success");
};

// --- KASOWANIE WYDATKU ---
window.dDelExp = function(id) {
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie wpisu", "Na pewno chcesz trwale usunąć ten wydatek z historii?", function() {
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
