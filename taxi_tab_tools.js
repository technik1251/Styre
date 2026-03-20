// ==========================================
// PLIK: taxi_tab_tools.js - Narzędzia (Wycena, Garaż, Fuelio Algorytm)
// ==========================================

// --- ALGORYTM FUELIO (FULL-TO-FULL) Z PODZIAŁEM NA PALIWA ---
window.calcFuelioStats = function() {
    let fList = (window.db.drv.fuel || []).slice().sort((a, b) => a.o - b.o);
    let totalDist = 0, totalLit = 0, totalCost = 0;
    let lastFullOdo = null, tempLiters = 0, tempCost = 0;

    for(let i=0; i<fList.length; i++) {
        let f = fList[i];
        // Sprawdzamy, czy to tankowanie "Do Pełna" (LPG, PB lub ON) czy tylko "Dolewka" (part / 0)
        let isFull = (f.isF === 'lpg_full' || f.isF === 'pb_full' || f.isF === 'on_full' || f.isF === 1);

        if (lastFullOdo === null) {
            if (isFull) lastFullOdo = f.o; 
        } else {
            tempLiters += (parseFloat(f.l) || 0);
            tempCost += (parseFloat(f.v) || 0);
            if (isFull) {
                let dist = f.o - lastFullOdo;
                if (dist > 0) { totalDist += dist; totalLit += tempLiters; totalCost += tempCost; }
                lastFullOdo = f.o; tempLiters = 0; tempCost = 0;
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
        let q = d.q || {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8};
        let cKm = (d.cfg && d.cfg.fuelPx) ? d.cfg.fuelPx : 0;
        
        APP.innerHTML = `
        ${hdr}
        <div class="dash-hero" style="padding-bottom:10px;">
            <p>KALKULATOR</p>
            <h1 style="color:var(--quote); font-size:3.2rem; letter-spacing:-1.5px; text-transform:uppercase;">🧮 WYCENA</h1>
        </div>
        
        <div class="panel" style="border-color:rgba(217, 70, 239, 0.3); background:linear-gradient(145deg, #1e0a2d, #09090b);">
            <div class="p-title" style="color:var(--quote);">INTELIGENTNA WYCENA (MAPY)</div>
            <div class="inp-group" style="margin-bottom:10px;">
                <label style="color:var(--success);">🟢 ADRES POCZĄTKOWY</label>
                <input type="text" id="q-start" placeholder="np. Dworzec Główny" style="border-color:var(--success);">
            </div>
            <div class="inp-group" style="margin-bottom:15px;">
                <label style="color:var(--danger);">🔴 ADRES DOCELOWY</label>
                <input type="text" id="q-end" placeholder="np. Powstańców Warszawy 1" style="border-color:var(--danger);">
            </div>
            <button class="btn btn-quote" onclick="if(window.sysAlert) window.sysAlert('Wkrótce', 'Integracja z Google Maps w wersji PRO!', 'info')">🔍 WYZNACZ TRASĘ I CENĘ</button>
        </div>

        <div class="panel" style="border-color:rgba(217, 70, 239, 0.3); background:linear-gradient(145deg, #1e0a2d, #09090b);">
            <div class="inp-row">
                <div class="inp-group"><label style="color:var(--quote);">KM Z KLIENTEM</label><input type="number" id="q-km" class="big-inp" style="color:var(--quote); border-color:var(--quote); background:#000;" oninput="window.calcQuote()"></div>
                <div class="inp-group"><label style="color:var(--quote);">CZAS (MINUTY)</label><input type="number" id="q-min" class="big-inp" style="color:var(--quote); border-color:var(--quote); background:#000;" oninput="window.calcQuote()"></div>
            </div>
            <div class="inp-group" style="margin-top:10px;"><label>TARYFA</label>
                <select id="q-tar" onchange="window.calcQuote()" style="background:#000;">
                    <option value="1">Taryfa 1 (Dzień) - ${q.t1} zł/km</option>
                    <option value="2">Taryfa 2 (Noc) - ${q.t2} zł/km</option>
                    <option value="3">Taryfa 3 (Za miasto) - ${q.t3} zł/km</option>
                    <option value="4">Taryfa 4 (Święto/Poza) - ${q.t4} zł/km</option>
                </select>
            </div>
            <div style="background:#000; padding:20px; border-radius:14px; margin-top:15px; text-align:center; border:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0 0 5px 0; color:var(--muted); font-size:0.75rem; text-transform:uppercase; font-weight:bold;">SUGEROWANA KWOTA NA TAKSOMETRZE</p>
                <div id="q-res" style="font-size:3.5rem; font-weight:900; color:var(--quote); letter-spacing:-2px; text-shadow:0 0 20px rgba(217, 70, 239, 0.4);">0.00 <span style="font-size:1.5rem;">zł</span></div>
                <div style="display:flex; justify-content:space-between; margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">
                    <span style="font-size:0.75rem; color:var(--muted);">Start: ${q.s} zł | Czas: ${(q.w/60).toFixed(2)} zł/min</span>
                    <span id="q-cost" style="font-size:0.75rem; color:var(--danger); font-weight:bold;">Koszt paliwa: 0.00 zł</span>
                </div>
            </div>
        </div>

        <div class="panel" style="border-color:rgba(255,255,255,0.05);">
            <div class="p-title" style="color:var(--info);">USTAWIENIA TAKSOMETRU ⚙️</div>
            <div class="inp-row">
                <div class="inp-group"><label>OPŁATA POCZĄTKOWA (ZŁ)</label><input type="number" id="q-cfg-s" value="${q.s}"></div>
                <div class="inp-group"><label>1H POSTOJU (ZŁ/H)</label><input type="number" id="q-cfg-w" value="${q.w}"></div>
            </div>
            <div class="grid-4" style="padding:0; margin-top:10px;">
                <div class="inp-group"><label>T1</label><input type="number" step="0.1" id="q-cfg-t1" value="${q.t1}"></div>
                <div class="inp-group"><label>T2</label><input type="number" step="0.1" id="q-cfg-t2" value="${q.t2}"></div>
                <div class="inp-group"><label>T3</label><input type="number" step="0.1" id="q-cfg-t3" value="${q.t3}"></div>
                <div class="inp-group"><label>T4</label><input type="number" step="0.1" id="q-cfg-t4" value="${q.t4}"></div>
            </div>
            <button class="btn btn-quote" style="margin-top:15px; padding:18px; font-size:1.1rem;" onclick="window.saveQuoteCfg()">ZAPISZ TARYFY</button>
        </div>
        ${nav}`;
        return;
    }

    if (t === 'garage') {
        APP.innerHTML = `
        ${hdr}
        <div class="dash-hero" style="padding-bottom:10px;">
            <p>DZIENNIK TANKOWAŃ I SERWISÓW</p>
            <h1 style="color:var(--fuel); font-size:3.5rem; letter-spacing:-1px;">⛽ GARAŻ</h1>
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
    
    let q = window.db.drv.q || {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8};
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
    let stats = window.calcFuelioStats();
    
    let html = `
    <div style="padding:0 12px;">
        <div class="grid-2">
            <div class="box" style="border-color:rgba(245,158,11,0.4); background:rgba(245,158,11,0.05); text-align:center; padding:20px 10px;">
                <span style="font-size:0.6rem; color:var(--muted); font-weight:800; text-transform:uppercase;">RZECZYWISTE SPALANIE</span>
                <strong style="color:var(--fuel); font-size:1.6rem; margin-top:5px;">${stats.l100.toFixed(2)} <span style="font-size:0.8rem;">L/100</span></strong>
            </div>
            <div class="box" style="border-color:rgba(239,68,68,0.4); background:rgba(239,68,68,0.05); text-align:center; padding:20px 10px;">
                <span style="font-size:0.6rem; color:var(--muted); font-weight:800; text-transform:uppercase;">PALIWO NA 1 KM</span>
                <strong style="color:var(--danger); font-size:1.6rem; margin-top:5px;">${stats.ck.toFixed(2)} <span style="font-size:0.8rem;">zł</span></strong>
            </div>
        </div>
        <div style="text-align:center; margin-bottom:20px;">
            <span style="font-size:0.75rem; color:var(--muted);">Obliczenia na dystansie: ${stats.td.toFixed(0)} KM</span>
        </div>

        <div class="mode-switch" style="border-color:rgba(255,255,255,0.1); margin-bottom:20px;">
            <div class="m-btn ${mode==='f'?'active':''}" onclick="window.dGarMode='f';window.render()" style="${mode==='f'?'background:var(--fuel);color:#000;box-shadow:0 4px 15px rgba(245,158,11,0.3);':''}">⛽ TANKOWANIA</div>
            <div class="m-btn ${mode==='e'?'active':''}" onclick="window.dGarMode='e';window.render()" style="${mode==='e'?'background:var(--info);color:#fff;':''}">🔧 SERWIS / MYJNIA</div>
        </div>
    </div>`;

    if(mode === 'f') {
        html += `
        <div style="padding:0 12px;">
            <div class="p-title" style="color:var(--info);">⚡ SZYBKIE WYDATKI (PODCZAS ZMIANY)</div>
            <div class="grid-2" style="margin-bottom:10px;">
                <button class="btn" style="background:#18181b; color:#fff; border:1px solid rgba(255,255,255,0.1); font-size:0.8rem; padding:12px;" onclick="window.dQuickExp('☕ Kawa', 15)">☕ Kawa (15 zł)</button>
                <button class="btn" style="background:#18181b; color:#fff; border:1px solid rgba(255,255,255,0.1); font-size:0.8rem; padding:12px;" onclick="window.dQuickExp('🍔 Jedzenie', 35)">🍔 Jedzenie (35 zł)</button>
            </div>
        </div>

        <div class="panel" style="border-color:var(--fuel); background:linear-gradient(145deg, #2a1600, #09090b); margin-top:15px;">
            <div class="p-title" style="color:var(--fuel);">⛽ NOWE TANKOWANIE</div>
            
            <div class="inp-row">
                <div class="inp-group"><label>STAN LICZNIKA (KM)</label><input type="number" id="df-o" value="${d.odo||0}" placeholder="np. 155000" style="background:rgba(0,0,0,0.5);"></div>
                <div class="inp-group"><label>ZATANKOWANO (LITRY)</label><input type="number" step="0.1" id="df-l" placeholder="0.0" style="background:rgba(0,0,0,0.5);"></div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>KWOTA Z PARAGONU (ZŁ)</label><input type="number" step="0.01" id="df-v" placeholder="0.00" style="background:rgba(0,0,0,0.5);"></div>
                <div class="inp-group"><label>DATA</label><input type="date" id="df-date" value="${window.getLocalYMD()}" style="background:rgba(0,0,0,0.5);"></div>
            </div>
            <div class="inp-group" style="margin-bottom:15px;">
                <label>RODZAJ PALIWA (DO OBLICZEŃ)</label>
                <select id="df-f" style="background:#000; border-color:var(--fuel);">
                    <option value="lpg_full">⛽ LPG (Zalane do pełna)</option>
                    <option value="pb_full">⛽ Benzyna (Zalane do pełna)</option>
                    <option value="on_full">⛽ Diesel (Zalane do pełna)</option>
                    <option value="part">💧 Dolewka (Nie liczy spalania)</option>
                </select>
            </div>
            <button class="btn" style="background:var(--fuel); color:#000; font-weight:900; padding:15px;" onclick="window.dAF()">DODAJ TANKOWANIE</button>
        </div>`;
    } else {
        html += `
        <div class="panel" style="border-color:var(--info); background:linear-gradient(145deg, #0f172a, #09090b);">
            <div class="p-title" style="color:var(--info);">🔧 NOWY WYDATEK SERWISOWY</div>
            <div class="inp-group" style="margin-bottom:12px;"><label>KWOTA Z PARAGONU (ZŁ)</label><input type="number" step="0.01" id="de-v" class="big-inp" placeholder="0.00" style="background:rgba(0,0,0,0.5); border-color:var(--info);"></div>
            <div class="inp-row">
                <div class="inp-group"><label>KATEGORIA</label><select id="de-c" style="background:#000;"><option>💦 Myjnia</option><option>🔧 Naprawa / Części</option><option>🚗 Płyn / Olej</option><option>🅿️ Parking</option><option>📋 Przegląd</option><option>Inne wydatki</option></select></div>
                <div class="inp-group"><label>DATA</label><input type="date" id="de-date" value="${window.getLocalYMD()}" style="background:#000;"></div>
            </div>
            <button class="btn btn-info" style="margin-top:15px; padding:15px;" onclick="window.dAE()">DODAJ WYDATEK</button>
        </div>`;
    }

    html += `<div class="section-lbl">HISTORIA WYDATKÓW</div><div style="padding: 0 12px;">`;
    
    let expl = d.exp || [];
    let fList = mode === 'f' ? expl.filter(x => x.ty === 'f') : expl.filter(x => x.ty === 'e');
    
    if(fList.length === 0) {
        html += `<div style="text-align:center; padding:30px; color:var(--muted); font-size:0.8rem; background:rgba(255,255,255,0.02); border-radius:14px; border:1px dashed rgba(255,255,255,0.05);">Brak wpisów w tej kategorii.</div>`;
    }
    
    fList.forEach(e => {
        let isFull = (e.isF === 'lpg_full' || e.isF === 'pb_full' || e.isF === 'on_full' || e.isF === 1);
        let fLabel = 'Dolewka';
        if (e.isF === 'lpg_full') fLabel = 'LPG Pełny';
        if (e.isF === 'pb_full') fLabel = 'Benzyna Pełny';
        if (e.isF === 'on_full') fLabel = 'Diesel Pełny';
        if (e.isF === 1) fLabel = 'Do pełna';

        html += `
        <div class="log-item" style="border-left-color:${e.ty==='f' ? 'var(--fuel)' : 'var(--info)'};">
            <div style="flex:1;" onclick="window.dEditExp(${e.id})">
                <strong style="display:block; font-size:0.95rem;">${e.d}</strong>
                <span style="font-size:0.7rem; color:var(--muted);">${e.dt} ${e.ty==='f' ? `| ODO: ${e.odo}` : ''}</span>
                ${e.ty==='f' ? `<div style="font-size:0.65rem; color:${isFull ? 'var(--success)' : 'var(--warning)'}; font-weight:bold; margin-top:4px;">${fLabel} | ${Number(e.l||0).toFixed(1)} Litrów</div>` : ''}
            </div>
            <div style="text-align:right;">
                <div style="color:${e.ty==='f' ? 'var(--fuel)' : 'var(--info)'}; font-weight:900; font-size:1.1rem; margin-bottom:5px;">-${Number(e.v||0).toFixed(2)} zł</div>
                <button class="btn btn-danger" style="padding:6px 12px; font-size:0.6rem; width:auto; margin:0;" onclick="window.dDelExp(${e.id})">KOSZ</button>
            </div>
        </div>`;
    });
    
    html += `</div><div style="height:40px;"></div>`;
    return html;
};
