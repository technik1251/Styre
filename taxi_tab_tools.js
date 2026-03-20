// ==========================================
// PLIK: taxi_tab_tools.js - Narzędzia (Wycena, Garaż, Fuelio Algorytm)
// ==========================================

// --- PRAWDZIWY ALGORYTM FUELIO (FULL-TO-FULL) ---
window.calcFuelioStats = function() {
    let fList = (window.db.drv.fuel || []).slice().sort((a, b) => a.o - b.o);
    let totalDist = 0;
    let totalLit = 0;
    let totalCost = 0;

    let lastFullOdo = null;
    let tempLiters = 0;
    let tempCost = 0;

    for(let i=0; i<fList.length; i++) {
        let f = fList[i];
        if (lastFullOdo === null) {
            // Szukamy pierwszego tankowania do pełna, by zacząć pomiar
            if (f.isF === 1) lastFullOdo = f.o; 
        } else {
            // Dodajemy litry i koszty z kolejnych tankowań (nawet częściowych)
            tempLiters += (parseFloat(f.l) || 0);
            tempCost += (parseFloat(f.v) || 0);
            
            // Jeśli to tankowanie do pełna, zamykamy "cykl" i sumujemy do ogólnych statystyk
            if (f.isF === 1) {
                let dist = f.o - lastFullOdo;
                if (dist > 0) {
                    totalDist += dist;
                    totalLit += tempLiters;
                    totalCost += tempCost;
                }
                lastFullOdo = f.o; // Zaczynamy nowy cykl
                tempLiters = 0;
                tempCost = 0;
            }
        }
    }

    let avgL100 = totalDist > 0 ? (totalLit / totalDist) * 100 : 0;
    let avgCostKm = totalDist > 0 ? (totalCost / totalDist) : 0;

    return { l100: avgL100, ck: avgCostKm, td: totalDist };
};

// --- RENDER ZAKŁADEK NARZĘDZIOWYCH ---
window.rDrvTools = function(d, t, nav, hdr) {
    if (t === 'quote') {
        let q = d.q || {s:8, w:60, t1:3.5, t2:4.5, t3:6, t4:8};
        let cKm = (d.cfg && d.cfg.fuelPx) ? d.cfg.fuelPx : 0;
        
        APP.innerHTML = `
        ${hdr}
        <div class="dash-hero" style="padding-bottom:10px;">
            <p>Kalkulator</p>
            <h1 style="color:var(--quote); font-size:2.8rem; letter-spacing:-1px;">🧮 WYCENA</h1>
        </div>
        <div class="panel" style="border-color:rgba(217, 70, 239, 0.3); background:rgba(217, 70, 239, 0.05);">
            <div class="inp-row">
                <div class="inp-group"><label style="color:var(--quote);">KM z klientem</label><input type="number" id="q-km" class="big-inp" style="color:var(--quote); border-color:var(--quote); background:#000;" oninput="window.calcQuote()"></div>
                <div class="inp-group"><label style="color:var(--quote);">Czas (Minuty)</label><input type="number" id="q-min" class="big-inp" style="color:var(--quote); border-color:var(--quote); background:#000;" oninput="window.calcQuote()"></div>
            </div>
            <div class="inp-group" style="margin-top:10px;"><label>Taryfa</label><select id="q-tar" onchange="window.calcQuote()" style="background:#000;"><option value="1">Taryfa 1 (Dzień) - ${q.t1} zł/km</option><option value="2">Taryfa 2 (Noc) - ${q.t2} zł/km</option><option value="3">Taryfa 3 (Za miasto) - ${q.t3} zł/km</option><option value="4">Taryfa 4 (Święto/Poza) - ${q.t4} zł/km</option></select></div>
            <div style="background:#000; padding:20px; border-radius:14px; margin-top:15px; text-align:center; border:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0 0 5px 0; color:var(--muted); font-size:0.7rem; text-transform:uppercase; font-weight:bold;">Sugerowana kwota na taksometrze</p>
                <div id="q-res" style="font-size:3.5rem; font-weight:900; color:var(--quote); letter-spacing:-2px; text-shadow:0 0 20px rgba(217, 70, 239, 0.4);">0.00 <span style="font-size:1.5rem;">zł</span></div>
                <div style="display:flex; justify-content:space-between; margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">
                    <span style="font-size:0.75rem; color:var(--muted);">Start: ${q.s} zł | Czas: ${(q.w/60).toFixed(2)} zł/min</span>
                    <span id="q-cost" style="font-size:0.75rem; color:var(--danger); font-weight:bold;">Koszt paliwa: 0.00 zł</span>
                </div>
            </div>
        </div>
        <div class="panel" style="border-color:rgba(255,255,255,0.05);">
            <div class="p-title">Ustawienia Taksometru ⚙️</div>
            <div class="inp-row">
                <div class="inp-group"><label>Opłata początkowa (zł)</label><input type="number" id="q-cfg-s" value="${q.s}"></div>
                <div class="inp-group"><label>Postojowe (zł/h)</label><input type="number" id="q-cfg-w" value="${q.w}"></div>
            </div>
            <div class="grid-2" style="padding:0; margin-top:10px;">
                <div class="inp-group"><label>Taryfa 1 (zł)</label><input type="number" step="0.1" id="q-cfg-t1" value="${q.t1}"></div>
                <div class="inp-group"><label>Taryfa 2 (zł)</label><input type="number" step="0.1" id="q-cfg-t2" value="${q.t2}"></div>
                <div class="inp-group"><label>Taryfa 3 (zł)</label><input type="number" step="0.1" id="q-cfg-t3" value="${q.t3}"></div>
                <div class="inp-group"><label>Taryfa 4 (zł)</label><input type="number" step="0.1" id="q-cfg-t4" value="${q.t4}"></div>
            </div>
            <button class="btn" style="background:rgba(255,255,255,0.05); color:#fff; margin-top:15px;" onclick="window.saveQuoteCfg()">ZAPISZ TARYFY</button>
        </div>
        ${nav}`;
        return;
    }

    if (t === 'garage') {
        APP.innerHTML = `
        ${hdr}
        <div class="dash-hero" style="padding-bottom:10px;">
            <p>Dziennik Tankowań i Serwisów</p>
            <h1 style="color:var(--fuel); font-size:2.8rem; letter-spacing:-1px;">⛽ GARAŻ</h1>
        </div>
        ${window.hRenderGarage(d)}
        ${nav}`;
    }
};

// --- LOGIKA WYCENY ---
window.calcQuote = function() {
    let km = parseFloat(document.getElementById('q-km').value) || 0;
    let min = parseFloat(document.getElementById('q-min').value) || 0;
    let tarIdx = document.getElementById('q-tar').value;
    
    let q = window.db.drv.q || {s:8, w:60, t1:3.5, t2:4.5, t3:6, t4:8};
    let cKm = (window.db.drv.cfg && window.db.drv.cfg.fuelPx) ? window.db.drv.cfg.fuelPx : 0;
    
    let tVal = q['t'+tarIdx] || 0;
    let total = q.s + (km * tVal) + (min * (q.w / 60));
    
    document.getElementById('q-res').innerHTML = `${total.toFixed(2)} <span style="font-size:1.5rem;">zł</span>`;
    let costEl = document.getElementById('q-cost');
    if(costEl) costEl.innerHTML = `Spali: ~${(km * cKm).toFixed(2)} zł`;
};

window.saveQuoteCfg = function() {
    window.db.drv.q = {
        s: parseFloat(document.getElementById('q-cfg-s').value) || 0,
        w: parseFloat(document.getElementById('q-cfg-w').value) || 0,
        t1: parseFloat(document.getElementById('q-cfg-t1').value) || 0,
        t2: parseFloat(document.getElementById('q-cfg-t2').value) || 0,
        t3: parseFloat(document.getElementById('q-cfg-t3').value) || 0,
        t4: parseFloat(document.getElementById('q-cfg-t4').value) || 0
    };
    window.save(); 
    window.render();
    if(window.sysAlert) window.sysAlert("Sukces", "Cennik zapisany!", "success");
};

// --- RENDER GARAŻU Z PALIWEM ---
window.hRenderGarage = function(d) {
    let mode = window.dGarMode || 'f';
    let sourceAlert = '';
    
    if (d.cfg && d.cfg.fuelSource === 'manual') {
        sourceAlert = `<div style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); color:var(--danger); padding:10px; border-radius:12px; font-size:0.75rem; text-align:center; margin-bottom:15px; font-weight:bold;">⚠️ UWAGA: Masz włączony tryb Ręcznego Wpisywania Spalania w Opcjach. Tankowania dodane tutaj zapiszą się w historii, ale NIE zaktualizują Twojego kosztu na kilometr.</div>`;
    }

    let stats = window.calcFuelioStats();
    let statsHtml = '';
    
    if(mode === 'f') {
        statsHtml = `
        <div class="grid-2">
            <div class="box" style="border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.05);"><span>Rzeczywiste Spalanie</span><strong style="color:var(--fuel);">${stats.l100.toFixed(2)} L/100</strong></div>
            <div class="box" style="border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.05);"><span>Paliwo na 1 KM</span><strong style="color:var(--danger);">${stats.ck.toFixed(2)} zł</strong></div>
        </div>
        <div style="text-align:center; margin-bottom:15px;"><span style="font-size:0.7rem; color:var(--muted);">Obliczenia na dystansie: ${stats.td.toFixed(0)} KM</span></div>`;
    }

    let html = `
    <div style="padding:0 12px;">
        ${sourceAlert}
        ${statsHtml}
        <div class="mode-switch" style="border-color:rgba(255,255,255,0.1);">
            <div class="m-btn ${mode==='f'?'active':''}" onclick="window.dGarMode='f';window.render()" style="${mode==='f'?'background:var(--fuel);color:#000;box-shadow:0 4px 15px rgba(245,158,11,0.3);':''}">⛽ Tankowania</div>
            <div class="m-btn ${mode==='e'?'active':''}" onclick="window.dGarMode='e';window.render()" style="${mode==='e'?'background:var(--danger);color:#fff;box-shadow:0 4px 15px rgba(239,68,68,0.3);':''}">🔧 Serwis / Myjnia</div>
        </div>
    </div>`;

    if(mode === 'f') {
        html += `
        <div class="panel" style="border-color:rgba(245,158,11,0.2);">
            <div class="inp-group" style="margin-bottom:12px;"><label>Przebieg ODO (km)</label><input type="number" id="df-o" class="big-inp" value="${d.odo||0}"></div>
            <div class="inp-row">
                <div class="inp-group"><label>Zatankowano (L)</label><input type="number" step="0.1" id="df-l"></div>
                <div class="inp-group"><label>Kwota (zł)</label><input type="number" step="0.01" id="df-v"></div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Rodzaj</label><select id="df-f"><option value="1">⛽ Do pełna (Liczy spalanie)</option><option value="0">💧 Dolewka (Tylko koszt)</option></select></div>
                <div class="inp-group"><label>Data</label><input type="date" id="df-date" value="${window.getLocalYMD()}"></div>
            </div>
            <button class="btn" style="background:linear-gradient(135deg, var(--fuel), #d97706); color:#000; margin-top:10px;" onclick="window.dAF()">ZAPISZ PARAGON</button>
        </div>`;
    } else {
        html += `
        <div class="panel" style="border-color:rgba(239,68,68,0.2);">
            <div class="inp-group" style="margin-bottom:12px;"><label>Kwota z paragonu (zł)</label><input type="number" step="0.01" id="de-v" class="big-inp"></div>
            <div class="inp-row">
                <div class="inp-group"><label>Kategoria</label><select id="de-c"><option>💦 Myjnia</option><option>🔧 Naprawa / Części</option><option>🚗 Płyn / Olej</option><option>🅿️ Parking</option><option>📋 Przegląd</option><option>Inne wydatki</option></select></div>
                <div class="inp-group"><label>Data</label><input type="date" id="de-date" value="${window.getLocalYMD()}"></div>
            </div>
            <button class="btn btn-danger" style="margin-top:10px;" onclick="window.dAE()">DODAJ WYDATEK</button>
        </div>`;
    }

    html += `<div class="section-lbl">Historia Wydatków</div><div style="padding: 0 12px;">`;
    
    let expl = d.exp || [];
    let fList = mode === 'f' ? expl.filter(x => x.ty === 'f') : expl.filter(x => x.ty === 'e');
    
    if(fList.length === 0) {
        html += `<div style="text-align:center; padding:30px; color:var(--muted); font-size:0.8rem; background:rgba(255,255,255,0.02); border-radius:14px; border:1px dashed rgba(255,255,255,0.05);">Brak wpisów w tej kategorii.</div>`;
    }
    
    fList.forEach(e => {
        let isFull = e.isF === 1;
        html += `
        <div class="log-item" style="border-left-color:${e.ty==='f' ? 'var(--fuel)' : 'var(--danger)'};">
            <div style="flex:1;" onclick="window.dEditExp(${e.id})">
                <strong style="display:block; font-size:0.95rem;">${e.d}</strong>
                <span style="font-size:0.7rem; color:var(--muted);">${e.dt} ${e.ty==='f' ? `| ODO: ${e.odo}` : ''}</span>
                ${e.ty==='f' ? `<div style="font-size:0.65rem; color:${isFull ? 'var(--success)' : 'var(--warning)'}; font-weight:bold; margin-top:4px;">${isFull ? 'Do pełna' : 'Dolewka'} | ${Number(e.l||0).toFixed(1)} Litrów</div>` : ''}
            </div>
            <div style="text-align:right;">
                <div style="color:var(--danger); font-weight:900; font-size:1.1rem; margin-bottom:5px;">-${Number(e.v||0).toFixed(2)} zł</div>
                <button class="btn btn-danger" style="padding:6px 12px; font-size:0.6rem; width:auto; margin:0;" onclick="window.dDelExp(${e.id})">KOSZ</button>
            </div>
        </div>`;
    });
    
    html += `</div><div style="height:40px;"></div>`;
    return html;
};
