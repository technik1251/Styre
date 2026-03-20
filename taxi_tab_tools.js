
// ==========================================
// PLIK: taxi_tab_tools.js - Zakładki Wycena (Quote) i Garaż (Garage)
// ==========================================

window.hRenderGarage = function() {
    let expList = (window.db && window.db.drv && window.db.drv.exp) ? window.db.drv.exp : [];
    
    return expList.map(x => {
        if(x.ty === 'f') {
            let dist = x.dist || 0;
            let l100 = x.l100 || 0;
            let cpkm = x.cpkm || 0;
            let l = x.l || 0;
            let odo = x.odo || 0;
            let full = x.isF === 1 ? 'Pod korek' : 'Częściowo';
            let statsHtml = '';
            
            if (x.isF === 1 && dist > 0) {
                statsHtml = `
                <div style="display:flex; justify-content:space-between; width:100%; margin-top:12px; padding-top:12px; border-top:1px dashed rgba(255,255,255,0.1); font-size:0.8rem;">
                    <div style="text-align:center;"><span style="color:var(--muted); font-size:0.65rem; text-transform:uppercase;">Dystans</span><br><strong style="color:#fff;">${Number(dist||0).toFixed(1)} km</strong></div>
                    <div style="text-align:center;"><span style="color:var(--muted); font-size:0.65rem; text-transform:uppercase;">Spalanie</span><br><strong style="color:var(--info);">${Number(l100||0).toFixed(1)} L</strong></div>
                    <div style="text-align:center;"><span style="color:var(--muted); font-size:0.65rem; text-transform:uppercase;">Koszt/KM</span><br><strong style="color:var(--danger);">${Number(cpkm||0).toFixed(2)} zł</strong></div>
                </div>`;
            } else if (x.isF === 0) {
                statsHtml = `<div style="margin-top:10px; font-size:0.75rem; color:var(--warning); text-align:center; width:100%; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">Częściowe tankowanie. Brak pomiaru spalania.</div>`;
            } else {
                statsHtml = `<div style="margin-top:10px; font-size:0.75rem; color:var(--muted); text-align:center; width:100%; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">Zatankuj ponownie, aby obliczyć spalanie.</div>`;
            }
            
            return `
            <div class="log-item" style="border-left-color:var(--fuel); flex-direction:column; align-items:flex-start;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:flex-start;">
                    <div><strong style="color:#fff; font-size:1.1rem;">${x.d} <span style="color:var(--fuel)">${Number(l||0).toFixed(1)}L</span></strong><br><small style="color:var(--muted)">${x.dt} • ODO: <span style="color:#fff">${odo}</span> (${full})</small></div>
                    <div style="text-align:right;">
                        <strong style="color:var(--fuel); font-size:1.2rem;">-${Number(x.v || 0).toFixed(2)} zł</strong>
                        <div style="display:flex; gap:5px; margin-top:5px; justify-content:flex-end;">
                            <button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.dEditExp(${x.id})">✏️</button>
                            <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.dDelExp(${x.id})">🗑️</button>
                        </div>
                    </div>
                </div>
                ${statsHtml}
            </div>`;
        } else {
            let col = x.ty === 'amort' ? 'var(--info)' : 'var(--danger)';
            let pref = x.ty === 'amort' ? '' : '-';
            return `
            <div class="log-item" style="border-left-color:${col}; flex-direction:column; align-items:flex-start;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <div><strong style="color:#fff; font-size:1.05rem;">${x.d}</strong><br><small style="color:var(--muted)">${x.dt}</small></div>
                    <div style="text-align:right;">
                        <strong style="color:${col}">${pref}${Number(x.v || 0).toFixed(2)} zł</strong>
                        <div style="display:flex; gap:5px; margin-top:5px; justify-content:flex-end;">
                            <button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.dEditExp(${x.id})">✏️</button>
                            <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.dDelExp(${x.id})">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    }).join('') || '<div style="text-align:center;color:var(--muted);padding:10px;">Brak wpisów.</div>';
};

window.rDrvTools = function(d, t, nav, hdr) {

    // ==========================================
    // ZAKŁADKA: WYCENA (QUOTE)
    // ==========================================
    if(t === 'quote') {
        let clientOpts = (d.clients || []).map(c => `<option value="${c.id}" data-d="${c.d||0}">${c.n} (Rabat: ${c.d||0}%)</option>`).join('');
        
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `
            <div class="dash-hero" style="padding-bottom:5px;"><p>INTELIGENTNA WYCENA (MAPY)</p></div>
            <div class="panel" style="border-color:rgba(217, 70, 239, 0.4)">
                <div class="form-section" style="padding:15px;">
                    <div class="inp-group" style="margin-bottom:10px;"><label style="color:var(--success)">🟢 Adres początkowy</label><input type="text" id="dq-start" placeholder="np. Dworzec Główny" style="border-color:var(--success);"></div>
                    <div class="inp-group"><label style="color:var(--danger)">🔴 Adres docelowy</label><input type="text" id="dq-end" placeholder="np. Powstańców Warszawy 1" style="border-color:var(--danger);"></div>
                    <button class="btn btn-quote" style="margin-top:15px; padding:15px;" onclick="window.calculateRouteAuto()">🔍 WYZNACZ TRASĘ I CENĘ</button>
                </div>
                <div id="map-container" style="display:none; margin-top:20px;">
                    <div id="map" style="height: 250px; border-radius: 16px; border: 1px solid var(--border);"></div>
                    <div style="display:flex; justify-content:space-between; margin-top:10px; padding:10px; background:rgba(255,255,255,0.02); border-radius:12px;">
                        <div style="text-align:center; flex:1;"><span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase;">Dystans</span><br><strong id="res-km" style="color:#fff; font-size:1.2rem;">0 km</strong></div>
                        <div style="text-align:center; flex:1;"><span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase;">Czas jazdy</span><br><strong id="res-min" style="color:#fff; font-size:1.2rem;">0 min</strong></div>
                    </div>
                    <div class="chip-box" style="margin-top:15px;">
                        <div class="chip ${!window.dQN?'active':''}" style="background:${!window.dQN?'rgba(217,70,239,0.1)':'var(--bg)'};color:${!window.dQN?'var(--quote)':'var(--muted)'}; border-color:${!window.dQN?'var(--quote)':'transparent'}" onclick="window.dQN=false; window.updateRoutePrice();">Dzień (T1/T3)</div>
                        <div class="chip ${window.dQN?'active':''}" style="background:${window.dQN?'rgba(217,70,239,0.1)':'var(--bg)'};color:${window.dQN?'var(--quote)':'var(--muted)'}; border-color:${window.dQN?'var(--quote)':'transparent'}" onclick="window.dQN=true; window.updateRoutePrice();">Noc/Święto (T2/T4)</div>
                    </div>
                    <div id="zone-split" style="display:none; margin-top:15px; background:#000; padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
                        <label style="color:var(--info); font-size:0.75rem; text-transform:uppercase; font-weight:bold; display:block; text-align:center;">Przesuń do granicy miasta</label>
                        <input type="range" id="zone-slider" min="0" max="100" value="100" step="0.1" style="width:100%; margin:15px 0;" oninput="window.updateZoneSplit()">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                            <span style="color:var(--driver)">Miasto: <strong id="val-in">0.0</strong> km</span>
                            <span style="color:var(--warning)">Poza miastem: <strong id="val-out">0.0</strong> km</span>
                        </div>
                    </div>
                    <div style="background:#000; border-radius:16px; padding:20px; margin-top:20px; text-align:center; border:1px solid var(--quote); box-shadow:inset 0 5px 10px rgba(0,0,0,0.5);">
                        <p style="margin:0 0 5px 0; color:var(--quote); font-size:0.75rem; font-weight:800;">PROPONOWANA CENA (BRUTTO)</p>
                        <h1 id="dqt" style="margin:0; font-size:3.5rem; letter-spacing:-2px;">0.00 zł</h1>
                    </div>
                    <div class="inp-group" style="margin-top:15px;"><label>Klient VIP (Rabat)</label><select id="dq-c" onchange="window.updateRoutePrice()"><option value="">-- Zwykły kurs --</option>${clientOpts}</select></div>
                    <button class="btn btn-quote" style="margin-top:15px;" onclick="window.dQB()">ZAKSIĘGUJ KURS DO PANELU</button>
                </div>
            </div>` + nav;
        }
    }

    // ==========================================
    // ZAKŁADKA: GARAŻ (GARAGE)
    // ==========================================
    if(t === 'garage') {
        let fS = window.calcFuelioStats(); 
        let todayStr = window.getLocalYMD();
        
        let quickExpHtml = `
        <div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:20px;">⚡ Szybkie wydatki (podczas zmiany)</div>
        <div style="display:flex; gap:10px; overflow-x:auto; padding: 0 15px 15px;">
            <div onclick="window.dQuickExp('☕ Kawa', 15)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer;"><span style="font-size:1.5rem;">☕</span><strong style="color:#fff; font-size:0.85rem;">Kawa (15 zł)</strong></div>
            <div onclick="window.dQuickExp('🍔 Jedzenie', 35)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer;"><span style="font-size:1.5rem;">🍔</span><strong style="color:#fff; font-size:0.85rem;">Jedzenie (35 zł)</strong></div>
            <div onclick="window.dQuickExp('✨ Myjnia', 20)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer;"><span style="font-size:1.5rem;">✨</span><strong style="color:#fff; font-size:0.85rem;">Myjnia (20 zł)</strong></div>
            <div onclick="window.dQuickExp('🅿 Parking', 10)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer;"><span style="font-size:1.5rem;">🅿</span><strong style="color:#fff; font-size:0.85rem;">Parking (10 zł)</strong></div>
        </div>`;
        
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `
            <div class="dash-hero" style="padding-bottom:5px;">
                <p>ŚREDNIE SPALANIE (Z paragonów)</p>
                <h1 style="color:var(--fuel); font-size:4rem;">${Number(fS.l1||0).toFixed(1)} <span style="font-size:1.5rem; color:var(--muted)">L/100</span></h1>
            </div>
            <div class="grid-2" style="padding:0 15px; margin-bottom:20px;">
                <div class="box" style="border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.05); align-items:center;">
                    <span style="color:var(--fuel)">Koszt 100 KM</span><strong style="color:#fff">${Number(fS.c1||0).toFixed(2)} zł</strong>
                </div>
                <div class="box" style="border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.05); align-items:center;">
                    <span style="color:var(--fuel)">Koszt 1 KM</span><strong style="color:#fff">${Number((d.cfg||{}).fuelPx||0).toFixed(2)} zł</strong>
                </div>
            </div>
            ${quickExpHtml}
            
            <div class="panel" style="border-color:var(--fuel); background: linear-gradient(145deg, #18181b 0%, #09090b 100%);">
                <div class="p-title" style="color:var(--fuel); display:flex; align-items:center; gap:10px;"><span style="font-size:1.5rem;">⛽</span> Nowe Tankowanie</div>
                <div style="background:rgba(255,255,255,0.02); padding:15px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); margin-bottom:15px;">
                    <div class="inp-row">
                        <div class="inp-group"><label>Stan Licznika (KM)</label><input type="number" id="df-o" placeholder="np. 155000" style="background:#000;"></div>
                        <div class="inp-group"><label>Zatankowano (Litry)</label><input type="number" id="df-l" step="0.1" placeholder="0.0" style="background:#000;"></div>
                    </div>
                    <div class="inp-row">
                        <div class="inp-group"><label>Kwota z paragonu (zł)</label><input type="number" id="df-v" placeholder="0.00" style="background:#000; color:var(--fuel); font-weight:bold;"></div>
                        <div class="inp-group"><label>Data</label><input type="date" id="df-date" value="${todayStr}" style="background:#000;"></div>
                    </div>
                    <div class="inp-group" style="margin-bottom:0;">
                        <label>Czy zatankowano do pełna?</label>
                        <select id="df-f" style="background:#000;"><option value="1">Tak (Wymagane do obliczenia spalania)</option><option value="0">Tylko częściowo</option></select>
                    </div>
                </div>
                <button class="btn" style="background:var(--fuel); color:#000; font-weight:bold; font-size:1.1rem; padding:15px; box-shadow:0 5px 15px rgba(245,158,11,0.2);" onclick="window.dAF()">ZAPISZ PARAGON TANKOWANIA</button>
            </div>

            <div class="panel" style="border-color:rgba(239,68,68,0.4); background: linear-gradient(145deg, #18181b 0%, #09090b 100%);">
                <div class="p-title" style="color:var(--danger); display:flex; align-items:center; gap:10px;"><span style="font-size:1.5rem;">🔧</span> Dodaj Wydatek (Eksploatacja)</div>
                <div style="background:rgba(239,68,68,0.05); padding:15px; border-radius:12px; border:1px solid rgba(239,68,68,0.2); margin-bottom:15px;">
                    <div class="inp-row">
                        <div class="inp-group" style="flex:2"><label>Kategoria Wydatku</label><select id="de-c" style="background:#000;"><option value="✨ Myjnia">✨ Myjnia</option><option value="🛠 Serwis">🛠 Serwis</option><option value="💧 Płyny">💧 Płyny</option><option value="🅿 Parking">🅿 Parking</option><option value="🎫 Mandat">🎫 Mandat</option><option value="☕ Kawa/Jedzenie">☕ Kawa/Jedzenie</option><option value="🛒 Inne">🛒 Inne</option></select></div>
                        <div class="inp-group"><label>Kwota (zł)</label><input type="number" id="de-v" placeholder="0.00" style="background:#000; color:var(--danger); font-weight:bold;"></div>
                    </div>
                    <div class="inp-group" style="margin-bottom:0;"><label>Data Wydatku</label><input type="date" id="de-date" value="${todayStr}" style="background:#000;"></div>
                </div>
                <button class="btn btn-danger" style="background:var(--danger); color:#fff; font-weight:bold; font-size:1.1rem; padding:15px; box-shadow:0 5px 15px rgba(239,68,68,0.2);" onclick="window.dAE()">ZAPISZ WYDATEK</button>
            </div>

            <div class="section-lbl" style="color:#fff; border-color:rgba(255,255,255,0.1);">Historia Garażu</div>
            <div style="padding: 0 15px; margin-bottom: 20px;">${window.hRenderGarage()}</div>` + nav;
        }
    }
};
