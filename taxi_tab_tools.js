// ==========================================
// PLIK: taxi_tab_tools.js - Narzędzia (Wycena, Garaż, Fuelio Algorytm)
// ==========================================

// --- ZAAWANSOWANY ALGORYTM FUELIO (ROZDZIELONE PALIWA + PRĄD) ---
window.calcFuelioStats = function() {
    let fList = (window.db.drv.fuel || []).slice().sort((a, b) => a.o - b.o);

    // Koszyki dla różnych rodzajów zasilania
    let s = {
        lpg: { name: 'LPG', d: 0, l: 0, c: 0, last: null, tL: 0, tC: 0, u: 'L' },
        pb:  { name: 'Benzyna', d: 0, l: 0, c: 0, last: null, tL: 0, tC: 0, u: 'L' },
        on:  { name: 'Diesel', d: 0, l: 0, c: 0, last: null, tL: 0, tC: 0, u: 'L' },
        ev:  { name: 'Prąd', d: 0, l: 0, c: 0, last: null, tL: 0, tC: 0, u: 'kWh' }
    };

    let minOdo = null;
    let maxOdo = null;
    let totalCostAll = 0;

    for(let i=0; i<fList.length; i++) {
        let f = fList[i];
        let type = 'pb'; // Domyślnie benzyna dla starych wpisów
        
        if (f.isF === 1 || f.isF === '1' || f.isF === 'part') {
            type = 'pb'; // Stare wpisy
        } else if (typeof f.isF === 'string') {
            if (f.isF.startsWith('lpg')) type = 'lpg';
            else if (f.isF.startsWith('pb')) type = 'pb';
            else if (f.isF.startsWith('on')) type = 'on';
            else if (f.isF.startsWith('ev')) type = 'ev';
        }

        let isFull = (f.isF === 1 || f.isF === '1' || (typeof f.isF === 'string' && f.isF.includes('full')));

        // Zbiorcze statystyki
        if (minOdo === null || f.o < minOdo) minOdo = f.o;
        if (maxOdo === null || f.o > maxOdo) maxOdo = f.o;
        totalCostAll += (parseFloat(f.v) || 0);

        // Przypisywanie do odpowiedniego koszyka
        let b = s[type];
        if (b.last === null) {
            if (isFull) b.last = f.o; 
        } else {
            b.tL += (parseFloat(f.l) || 0);
            b.tC += (parseFloat(f.v) || 0);
            if (isFull) {
                let dist = f.o - b.last;
                if (dist > 0) {
                    b.d += dist;
                    b.l += b.tL;
                    b.c += b.tC;
                }
                b.last = f.o; 
                b.tL = 0; 
                b.tC = 0;
            }
        }
    }

    let totalDistAll = (maxOdo !== null && minOdo !== null) ? (maxOdo - minOdo) : 0;
    let globalCk = totalDistAll > 0 ? (totalCostAll / totalDistAll) : 0;

    // Formatowanie wyników koszyków
    let results = [];
    for (let k in s) {
        if (s[k].d > 0) {
            results.push({
                name: s[k].name,
                unit: s[k].u,
                l100: (s[k].l / s[k].d) * 100,
                ck: (s[k].c / s[k].d),
                dist: s[k].d
            });
        }
    }

    // Zwraca .ck jako globalny koszt mix (aby logika zapisywania zadziałała poprawnie)
    return { list: results, ck: globalCk, td: totalDistAll, totalCost: totalCostAll };
};

// --- RENDER ZAKŁADEK NARZĘDZIOWYCH ---
window.rDrvTools = function(d, t, nav, hdr) {
    if (t === 'quote') {
        let cOpts = (d.clients||[]).map(c => `<option value="${c.d}" data-n="${c.n}">${c.n} (-${c.d}%)</option>`).join('');
        
        APP.innerHTML = `
        ${hdr}
        <div class="dash-hero" style="padding-bottom:10px;">
            <p>KALKULATOR</p>
            <h1 style="color:#d946ef; font-size:3.2rem; letter-spacing:-1.5px; text-transform:uppercase; text-shadow:0 0 20px rgba(217, 70, 239, 0.4);">🧮 WYCENA</h1>
        </div>
        
        <div class="panel" style="border-color:rgba(217, 70, 239, 0.3); background:linear-gradient(145deg, #1e0a2d, #09090b); padding-bottom:5px;">
            <div class="inp-group" style="margin-bottom:10px;">
                <label style="color:var(--success);">🟢 ADRES POCZĄTKOWY</label>
                <input type="text" id="dq-start" placeholder="np. Dworzec Główny" style="border-color:var(--success); background:#000;">
            </div>
            <div class="inp-group" style="margin-bottom:15px;">
                <label style="color:var(--danger);">🔴 ADRES DOCELOWY</label>
                <input type="text" id="dq-end" placeholder="np. Powstańców Warszawy 1" style="border-color:var(--danger); background:#000;">
            </div>
            <button id="btn-route-calc" class="btn" style="background:#d946ef; color:#fff; font-weight:900;" onclick="window.calculateRouteAuto()">🔍 WYZNACZ TRASĘ I CENĘ</button>
            
            <div id="map-container" style="display:none; margin-top:20px;">
                <div id="map" style="height:250px; border-radius:14px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.1);"></div>
                
                <div class="grid-2" style="margin-bottom:15px;">
                    <div style="text-align:center;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase; font-weight:bold;">DYSTANS</span><br><strong style="font-size:1.4rem;" id="res-km">0.0 km</strong></div>
                    <div style="text-align:center;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase; font-weight:bold;">CZAS JAZDY</span><br><strong style="font-size:1.4rem;" id="res-min">0 min</strong></div>
                </div>
                
                <div class="mode-switch" style="margin-bottom:15px;">
                    <div class="m-btn active" id="btn-tar-day" onclick="window.dQN=false; this.classList.add('active'); this.style.border='1px solid #d946ef'; document.getElementById('btn-tar-night').classList.remove('active'); document.getElementById('btn-tar-night').style.border='1px solid transparent'; window.updateRoutePrice();" style="border:1px solid #d946ef;">Dzień (T1/T3)</div>
                    <div class="m-btn" id="btn-tar-night" onclick="window.dQN=true; this.classList.add('active'); this.style.border='1px solid #d946ef'; document.getElementById('btn-tar-day').classList.remove('active'); document.getElementById('btn-tar-day').style.border='1px solid transparent'; window.updateRoutePrice();">Noc/Święto (T2/T4)</div>
                </div>
                
                <div style="background:rgba(0,0,0,0.5); border-radius:12px; padding:15px; margin-bottom:15px;">
                    <label style="font-size:0.75rem; color:var(--info); display:block; text-align:center; margin-bottom:10px; font-weight:bold;">PRZESUŃ DO GRANICY MIASTA</label>
                    <input type="range" id="zone-slider" min="0" max="100" value="100" step="0.1" style="width:100%; accent-color:var(--info);" oninput="window.updateZoneSplit()">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:8px;">
                        <span style="color:var(--info);">Miasto: <strong id="val-in">0.0</strong> km</span>
                        <span style="color:var(--warning);">Poza miastem: <strong id="val-out">0.0</strong> km</span>
                    </div>
                </div>
                
                <div style="border:1px solid rgba(217, 70, 239, 0.4); border-radius:14px; padding:20px; text-align:center; margin-bottom:15px; background:linear-gradient(180deg, rgba(217, 70, 239, 0.05) 0%, transparent 100%);">
                    <span style="font-size:0.75rem; color:#d946ef; font-weight:bold; text-transform:uppercase;">PROPONOWANA CENA (BRUTTO)</span>
                    <div id="dqt" style="font-size:3.5rem; font-weight:900; letter-spacing:-2px; color:#fff;">0.00 zł</div>
                    <div style="font-size:0.75rem; color:var(--danger); margin-top:5px;">Koszt paliwa (w koszty): <span id="q-fuel-cost">0.00</span> zł</div>
                </div>
                
                <div class="inp-group" style="margin-bottom:20px;">
                    <label>KLIENT VIP (RABAT)</label>
                    <select id="dq-c" onchange="window.updateRoutePrice()" style="background:#000;">
                        <option value="0">-- Zwykły kurs --</option>
                        ${cOpts}
                    </select>
                </div>
                
                <button class="btn" style="background:#d946ef; color:#fff; font-size:1.1rem; padding:15px;" onclick="window.saveQuoteToPanel()">ZAKSIĘGUJ KURS DO PANELU</button>
            </div>
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

// --- RENDER GARAŻU Z ROZDZIELONYMI PALIWAMI ---
window.hRenderGarage = function(d) {
    let mode = window.dGarMode || 'f';
    let sourceAlert = '';
    
    if (d.cfg && d.cfg.fuelSource === 'manual') {
        sourceAlert = `<div style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); color:var(--danger); padding:10px; border-radius:12px; font-size:0.75rem; text-align:center; margin-bottom:15px; font-weight:bold;">⚠️ Masz włączony tryb Ręcznego Wpisywania Spalania w Opcjach. Apka zignoruje statystyki z Garażu do wyliczeń Wyceny.</div>`;
    }

    let stats = window.calcFuelioStats();
    let statsCards = '';

    if (stats.list.length > 0) {
        stats.list.forEach(x => {
            let u100 = x.unit === 'kWh' ? 'kWh/100' : 'L/100';
            statsCards += `
            <div class="box" style="border-color:rgba(245,158,11,0.4); background:rgba(245,158,11,0.05); text-align:center; padding:15px 5px;">
                <span style="font-size:0.6rem; color:var(--muted); font-weight:800; text-transform:uppercase;">${x.name} <span style="opacity:0.5;">(${x.dist.toFixed(0)} KM)</span></span><br>
                <strong style="color:var(--fuel); font-size:1.3rem;">${x.l100.toFixed(2)} <span style="font-size:0.6rem;">${u100}</span></strong><br>
                <strong style="color:var(--danger); font-size:0.8rem;">${x.ck.toFixed(2)} zł/km</strong>
            </div>`;
        });
    } else {
        statsCards = `<div class="box" style="grid-column: span 2; text-align:center; padding:20px; color:var(--muted); font-size:0.8rem; border-color:rgba(255,255,255,0.05);">Brak pełnych cykli tankowań do obliczeń. Zatankuj do pełna 2 razy.</div>`;
    }

    let html = `
    <div style="padding:0 12px;">
        ${sourceAlert}
        <div class="grid-2" style="margin-bottom:10px;">
            ${statsCards}
        </div>
        
        <div style="text-align:center; margin-bottom:20px; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); padding:12px; border-radius:12px;">
            <span style="font-size:0.65rem; color:var(--danger); font-weight:bold; text-transform:uppercase;">ZBIORCZY KOSZT PALIW (MIX) NA 1 KM</span><br>
            <strong style="color:var(--danger); font-size:1.5rem;">${stats.ck.toFixed(2)} zł</strong>
            <div style="font-size:0.65rem; color:var(--muted); margin-top:4px;">Dystans Mix: ${stats.td.toFixed(0)} KM | Wydano: ${stats.totalCost.toFixed(2)} zł</div>
        </div>

        <div class="mode-switch" style="border-color:rgba(255,255,255,0.1); margin-bottom:15px;">
            <div class="m-btn ${mode==='f'?'active':''}" onclick="window.dGarMode='f';window.render()" style="${mode==='f'?'background:var(--fuel);color:#000;box-shadow:0 4px 15px rgba(245,158,11,0.3);':''}">⛽ TANKOWANIA</div>
            <div class="m-btn ${mode==='e'?'active':''}" onclick="window.dGarMode='e';window.render()" style="${mode==='e'?'background:var(--info);color:#fff;':''}">🔧 SERWIS / MYJNIA</div>
        </div>
    </div>`;

    if(mode === 'f') {
        html += `
        <div class="panel" style="border-color:var(--fuel); background:linear-gradient(145deg, #2a1600, #09090b);">
            <div class="p-title" style="color:var(--fuel);">⛽ NOWE TANKOWANIE</div>
            
            <div class="inp-row">
                <div class="inp-group"><label>STAN LICZNIKA (KM)</label><input type="number" id="df-o" value="${d.odo||0}" placeholder="np. 155000" style="background:rgba(0,0,0,0.5);"></div>
                <div class="inp-group"><label>LITRY / kWh</label><input type="number" step="0.1" id="df-l" placeholder="0.0" style="background:rgba(0,0,0,0.5);"></div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>KWOTA (ZŁ)</label><input type="number" step="0.01" id="df-v" placeholder="0.00" style="background:rgba(0,0,0,0.5);"></div>
                <div class="inp-group"><label>DATA</label><input type="date" id="df-date" value="${window.getLocalYMD()}" style="background:rgba(0,0,0,0.5);"></div>
            </div>
            <div class="inp-group" style="margin-bottom:15px;">
                <label>RODZAJ PALIWA</label>
                <select id="df-f" style="background:#000; border-color:var(--fuel);">
                    <optgroup label="Do pełna (Oblicza spalanie)">
                        <option value="lpg_full">⛽ LPG (Do pełna)</option>
                        <option value="pb_full">⛽ Benzyna (Do pełna)</option>
                        <option value="on_full">⛽ Diesel (Do pełna)</option>
                        <option value="ev_full">⚡ Prąd (Pełne ład.)</option>
                    </optgroup>
                    <optgroup label="Dolewka (Tylko koszty mix)">
                        <option value="lpg_part">💧 LPG (Dolewka)</option>
                        <option value="pb_part">💧 Benzyna (Dolewka)</option>
                        <option value="on_part">💧 Diesel (Dolewka)</option>
                        <option value="ev_part">⚡ Prąd (Doładowanie)</option>
                    </optgroup>
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
        let isFull = (e.isF === 'lpg_full' || e.isF === 'pb_full' || e.isF === 'on_full' || e.isF === 'ev_full' || e.isF === 1 || e.isF === "1");
        
        let fLabel = 'Dolewka';
        if (e.isF === 'lpg_full') fLabel = 'LPG (Do pełna)';
        if (e.isF === 'pb_full') fLabel = 'PB (Do pełna)';
        if (e.isF === 'on_full') fLabel = 'ON (Do pełna)';
        if (e.isF === 'ev_full') fLabel = 'EV (Do pełna)';
        if (e.isF === 'lpg_part') fLabel = 'LPG (Dolewka)';
        if (e.isF === 'pb_part') fLabel = 'PB (Dolewka)';
        if (e.isF === 'on_part') fLabel = 'ON (Dolewka)';
        if (e.isF === 'ev_part') fLabel = 'EV (Dolewka)';
        if (e.isF === 1 || e.isF === "1") fLabel = 'PB (Do pełna)';
        
        let uStr = (e.isF && e.isF.includes('ev')) ? 'kWh' : 'Litrów';

        html += `
        <div class="log-item" style="border-left-color:${e.ty==='f' ? 'var(--fuel)' : 'var(--info)'};">
            <div style="flex:1;" onclick="window.dEditExp(${e.id})">
                <strong style="display:block; font-size:0.95rem;">${e.d}</strong>
                <span style="font-size:0.7rem; color:var(--muted);">${e.dt} ${e.ty==='f' ? `| ODO: ${e.odo}` : ''}</span>
                ${e.ty==='f' ? `<div style="font-size:0.65rem; color:${isFull ? 'var(--success)' : 'var(--warning)'}; font-weight:bold; margin-top:4px;">${fLabel} | ${Number(e.l||0).toFixed(1)} ${uStr}</div>` : ''}
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
