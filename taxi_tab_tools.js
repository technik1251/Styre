// ==========================================
// PLIK: taxi_tab_tools.js - Narzędzia (Taksometr Online, Garaż, Fuelio Algorytm)
// ==========================================

// --- NOWY ALGORYTM FUELIO (Z PODZIAŁEM NA PALIWA) ---
window.calcFuelioStats = function() {
    let fList = [];
    if(window.db && window.db.drv && window.db.drv.fuel) {
        for(let i=0; i<window.db.drv.fuel.length; i++) fList.push(window.db.drv.fuel[i]);
    }
    fList.sort(function(a, b){ return a.o - b.o; });

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
        let type = 'pb'; 
        
        if (f.isF === 1 || f.isF === '1' || f.isF === 'part') {
            type = 'pb'; 
        } else if (typeof f.isF === 'string') {
            if (f.isF.startsWith('lpg')) type = 'lpg';
            else if (f.isF.startsWith('pb')) type = 'pb';
            else if (f.isF.startsWith('on')) type = 'on';
            else if (f.isF.startsWith('ev')) type = 'ev';
        }

        let isFull = (f.isF === 1 || f.isF === '1' || (typeof f.isF === 'string' && f.isF.includes('full')));

        if (minOdo === null || f.o < minOdo) minOdo = f.o;
        if (maxOdo === null || f.o > maxOdo) maxOdo = f.o;
        totalCostAll += (parseFloat(f.v) || 0);

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

    let results = [];
    let sKeys = Object.keys(s);
    for(let i=0; i<sKeys.length; i++) {
        let k = sKeys[i];
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

    return { list: results, ck: globalCk, td: totalDistAll, totalCost: totalCostAll };
};

// --- RENDER ZAKŁADEK NARZĘDZIOWYCH ---
window.rDrvTools = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;
        
        let act = '';

        if (t === 'quote') {
            let cOpts = '';
            if(d.clients && d.clients.length > 0) {
                for(let i=0; i<d.clients.length; i++) {
                    let c = d.clients[i];
                    cOpts += '<option value="'+c.d+'" data-n="'+c.n+'">'+c.n+' (-'+c.d+'%)</option>';
                }
            }
            
            act = '<div class="dash-hero" style="padding-bottom:15px; border-bottom:1px dashed rgba(255,255,255,0.05); margin-bottom:20px;">' +
                '<div style="display:flex; justify-content:center; margin-bottom:15px;"><div style="background:rgba(217, 70, 239, 0.1); border:1px solid rgba(217, 70, 239, 0.3); width:55px; height:55px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; box-shadow: 0 8px 20px rgba(217,70,239,0.25);">📍</div></div>' +
                '<p style="letter-spacing:1px; color:rgba(255,255,255,0.4); font-weight:800; font-size:0.65rem; text-transform:uppercase;">ASYSTENT WYCENY</p>' +
                '<h1 style="color:#fff; font-size:2.5rem; margin-bottom:5px; font-weight:900; letter-spacing:-1px;">Taksometr <span style="color:#d946ef;">Online</span></h1>' +
            '</div>' +
            
            '<div class="panel" style="border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); padding:20px 15px; border-radius:24px; box-shadow:0 10px 40px rgba(0,0,0,0.6); margin:0 15px;">' +
                '<div class="inp-group" style="margin-bottom:15px;">' +
                    '<label style="color:#10b981; font-size:0.65rem; font-weight:800; letter-spacing:1px; margin-bottom:6px; display:block;">🟢 ADRES POCZĄTKOWY</label>' +
                    '<input type="text" id="dq-start" placeholder="np. Dworzec Główny" style="border:1px solid rgba(16,185,129,0.2); background:rgba(16,185,129,0.05); padding:16px; border-radius:14px; font-size:0.9rem; color:#fff; outline:none; width:100%; box-sizing:border-box;">' +
                '</div>' +
                '<div class="inp-group" style="margin-bottom:25px;">' +
                    '<label style="color:#ef4444; font-size:0.65rem; font-weight:800; letter-spacing:1px; margin-bottom:6px; display:block;">🔴 ADRES DOCELOWY</label>' +
                    '<input type="text" id="dq-end" placeholder="np. Powstańców Warszawy 1" style="border:1px solid rgba(239,68,68,0.2); background:rgba(239,68,68,0.05); padding:16px; border-radius:14px; font-size:0.9rem; color:#fff; outline:none; width:100%; box-sizing:border-box;">' +
                '</div>' +
                '<button id="btn-route-calc" class="btn" style="background:#d946ef; color:#fff; font-weight:800; font-size:1.05rem; letter-spacing:0.5px; padding:18px; border-radius:16px; border:none; box-shadow:0 8px 25px rgba(217,70,239,0.3); width:100%;" onclick="if(typeof window.calculateRouteAuto===\'function\') window.calculateRouteAuto()">🔍 WYZNACZ TRASĘ I CENĘ</button>' +
                
                '<div id="map-container" style="display:none; margin-top:25px;">' +
                    '<div id="map" style="height:250px; border-radius:16px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.05); box-shadow:inset 0 4px 15px rgba(0,0,0,0.6);"></div>' +
                    
                    '<div class="grid-2" style="margin-bottom:20px; gap:12px;">' +
                        '<div class="box" style="padding:15px; border-radius:16px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); text-align:center;"><span style="font-size:0.6rem; color:rgba(255,255,255,0.5); text-transform:uppercase; font-weight:800; letter-spacing:1px;">DYSTANS</span><strong style="font-size:1.5rem; color:#fff; display:block; margin-top:5px; font-weight:900;" id="res-km">0.0 km</strong></div>' +
                        '<div class="box" style="padding:15px; border-radius:16px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); text-align:center;"><span style="font-size:0.6rem; color:rgba(255,255,255,0.5); text-transform:uppercase; font-weight:800; letter-spacing:1px;">CZAS JAZDY</span><strong style="font-size:1.5rem; color:#fff; display:block; margin-top:5px; font-weight:900;" id="res-min">0 min</strong></div>' +
                    '</div>' +
                    
                    '<div class="mode-switch" style="margin-bottom:20px; border-radius:14px; padding:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05);">' +
                        '<div class="m-btn active" id="btn-tar-day" onclick="window.dQN=false; this.classList.add(\'active\'); this.style.border=\'1px solid #d946ef\'; document.getElementById(\'btn-tar-night\').classList.remove(\'active\'); document.getElementById(\'btn-tar-night\').style.border=\'1px solid transparent\'; if(typeof window.updateRoutePrice===\'function\') window.updateRoutePrice();" style="border:1px solid #d946ef; padding:12px; border-radius:12px; font-weight:700;">Dzień (T1/T3)</div>' +
                        '<div class="m-btn" id="btn-tar-night" onclick="window.dQN=true; this.classList.add(\'active\'); this.style.border=\'1px solid #d946ef\'; document.getElementById(\'btn-tar-day\').classList.remove(\'active\'); document.getElementById(\'btn-tar-day\').style.border=\'1px solid transparent\'; if(typeof window.updateRoutePrice===\'function\') window.updateRoutePrice();" style="padding:12px; border-radius:12px; font-weight:700;">Noc/Święto (T2/T4)</div>' +
                    '</div>' +
                    
                    '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:20px 15px; margin-bottom:20px; border:1px inset rgba(255,255,255,0.05);">' +
                        '<label style="font-size:0.65rem; color:#0ea5e9; display:block; text-align:center; margin-bottom:15px; font-weight:800; letter-spacing:1px;">PRZESUŃ DO GRANICY MIASTA</label>' +
                        '<input type="range" id="zone-slider" min="0" max="100" value="100" step="0.1" style="width:100%; accent-color:#0ea5e9;" oninput="if(typeof window.updateZoneSplit===\'function\') window.updateZoneSplit()">' +
                        '<div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-top:15px; font-weight:800;">' +
                            '<span style="color:#0ea5e9; background:rgba(14,165,233,0.15); padding:6px 10px; border-radius:8px;">Miasto: <strong id="val-in">0.0</strong> km</span>' +
                            '<span style="color:#f59e0b; background:rgba(245,158,11,0.15); padding:6px 10px; border-radius:8px;">Poza miastem: <strong id="val-out">0.0</strong> km</span>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div style="border:1px solid rgba(217, 70, 239, 0.2); border-radius:20px; padding:25px; text-align:center; margin-bottom:20px; background:linear-gradient(180deg, rgba(217, 70, 239, 0.05) 0%, transparent 100%);">' +
                        '<span style="font-size:0.65rem; color:#d946ef; font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">PROPONOWANA CENA (BRUTTO)</span>' +
                        '<div id="dqt" style="font-size:4rem; font-weight:900; letter-spacing:-2px; color:#fff; margin-top:5px; margin-bottom:10px; text-shadow:0 0 20px rgba(217,70,239,0.3);">0.00 zł</div>' +
                        '<div style="font-size:0.75rem; color:#ef4444; background:rgba(239,68,68,0.1); padding:6px 12px; border-radius:10px; display:inline-block; font-weight:700;">Koszt paliwa: <strong id="q-fuel-cost">0.00</strong> zł</div>' +
                    '</div>' +
                    
                    '<div class="inp-group" style="margin-bottom:25px;">' +
                        '<label style="font-size:0.65rem; letter-spacing:1px; color:rgba(255,255,255,0.4); font-weight:800; display:block; margin-bottom:6px;">KLIENT VIP (RABAT)</label>' +
                        '<select id="dq-c" onchange="if(typeof window.updateRoutePrice===\'function\') window.updateRoutePrice()" style="background:rgba(0,0,0,0.3); border-radius:14px; padding:16px; font-size:0.9rem; color:#fff; border:1px solid rgba(255,255,255,0.05); width:100%; outline:none;">' +
                            '<option value="0">-- Zwykły kurs --</option>' + cOpts +
                        '</select>' +
                    '</div>' +
                    
                    '<button class="btn" style="background:#d946ef; color:#fff; font-size:1.05rem; font-weight:900; padding:18px; border-radius:16px; border:none; box-shadow:0 8px 25px rgba(217,70,239,0.4); width:100%;" onclick="if(typeof window.saveQuoteToPanel===\'function\') window.saveQuoteToPanel()">ZAKSIĘGUJ DO PANELU</button>' +
                '</div>' +
            '</div>';
        }

        if (t === 'garage') {
            act = '<div class="dash-hero" style="padding-bottom:15px; border-bottom:1px dashed rgba(255,255,255,0.05); margin-bottom:20px;">' +
                '<div style="display:flex; justify-content:center; margin-bottom:15px;"><div style="background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.3); width:55px; height:55px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.8rem; box-shadow: 0 8px 20px rgba(245,158,11,0.25);">🔧</div></div>' +
                '<p style="letter-spacing:1px; color:rgba(255,255,255,0.4); font-weight:800; font-size:0.65rem; text-transform:uppercase;">DZIENNIK TANKOWAŃ I SERWISÓW</p>' +
                '<h1 style="color:#fff; font-size:2.5rem; margin-bottom:5px; font-weight:900; letter-spacing:-1px;">Eksploatacja <span style="color:#f59e0b;">Garaż</span></h1>' +
            '</div>' +
            (typeof window.hRenderGarage === 'function' ? window.hRenderGarage(d) : '');
        }

        // Dodanie marginesu 140px, żeby dolny pasek nigdy nie zasłaniał elementów
        appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;

    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:40px 20px; text-align:center; color:white;"><h3>Błąd w Narzędziach</h3><p style="color:#ef4444;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; margin-top:20px;" onclick="window.location.reload()">ODŚWIEŻ</button></div>' + (nav || '');
        }
    }
};

// --- RENDER GARAŻU Z DYNAMICZNYMI PALIWAMI (ULTRA KOMPAKTOWY Z OPISEM) ---
window.hRenderGarage = function(d) {
    let mode = window.dGarMode || 'f';
    let sourceAlert = '';
    
    if (d.cfg && d.cfg.fuelSource === 'manual') {
        sourceAlert = '<div style="background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2); color:#ef4444; padding:15px; border-radius:16px; font-size:0.75rem; text-align:center; margin-bottom:20px; font-weight:700; box-shadow:0 4px 10px rgba(239,68,68,0.1); margin-left:15px; margin-right:15px;">⚠️ Masz włączony tryb Ręcznego Wpisywania Spalania w Opcjach. Apka zignoruje statystyki z Garażu do wyliczeń Wyceny.</div>';
    }

    let stats = window.calcFuelioStats();
    let statsCards = '';

    if (stats.list.length > 0) {
        for(let i=0; i<stats.list.length; i++) {
            let x = stats.list[i];
            let u100 = x.unit === 'kWh' ? 'kWh/100' : 'L/100';
            statsCards += '<div class="box" style="border:1px solid rgba(245,158,11,0.1); background:rgba(245,158,11,0.05); text-align:center; padding:15px 10px; border-radius:16px; box-shadow:0 6px 15px rgba(0,0,0,0.2);">' +
                '<span style="font-size:0.6rem; color:rgba(255,255,255,0.6); font-weight:800; text-transform:uppercase; letter-spacing:1px;">'+x.name+' <span style="opacity:0.5;">('+x.dist.toFixed(0)+' KM)</span></span><br>' +
                '<strong style="color:#f59e0b; font-size:1.6rem; font-weight:900; display:block; margin-top:5px; text-shadow:0 0 10px rgba(245,158,11,0.3);">'+x.l100.toFixed(2)+' <span style="font-size:0.65rem;">'+u100+'</span></strong>' +
                '<strong style="color:#ef4444; font-size:0.8rem; background:rgba(239,68,68,0.1); padding:4px 8px; border-radius:8px; display:inline-block; margin-top:8px;">'+x.ck.toFixed(2)+' zł/km</strong>' +
            '</div>';
        }
    } else {
        statsCards = '<div class="box" style="grid-column: span 2; text-align:center; padding:25px; color:rgba(255,255,255,0.4); font-size:0.8rem; font-weight:600; border:1px dashed rgba(255,255,255,0.05); border-radius:16px; background:rgba(0,0,0,0.2);">Brak pełnych cykli tankowań do obliczeń.<br>Zatankuj do pełna 2 razy.</div>';
    }

    let fTypes = (d.cfg && d.cfg.fTypes && d.cfg.fTypes.length > 0) ? d.cfg.fTypes : ['pb'];
    let fuelOptionsHtml = '';
    for(let i=0; i<fTypes.length; i++) {
        let t = fTypes[i];
        if (t === 'pb') fuelOptionsHtml += '<option value="pb">⛽ Benzyna (PB)</option>';
        if (t === 'on') fuelOptionsHtml += '<option value="on">⛽ Diesel (ON)</option>';
        if (t === 'lpg') fuelOptionsHtml += '<option value="lpg">⛽ Gaz (LPG)</option>';
        if (t === 'ev') fuelOptionsHtml += '<option value="ev">⚡ Prąd (EV)</option>';
    }

    let html = '<div style="padding:0 0px;">' +
        sourceAlert +
        '<div class="grid-2" style="margin-bottom:15px; gap:12px; padding:0 15px;">' +
            statsCards +
        '</div>' +
        
        '<div style="text-align:center; margin:0 15px 25px 15px; background:linear-gradient(145deg, rgba(239,68,68,0.05), rgba(0,0,0,0.2)); border:1px solid rgba(239,68,68,0.15); padding:20px; border-radius:20px; box-shadow:0 8px 25px rgba(0,0,0,0.4);">' +
            '<span style="font-size:0.6rem; color:#ef4444; font-weight:800; text-transform:uppercase; letter-spacing:1px;">ZBIORCZY KOSZT PALIW (MIX) NA 1 KM</span><br>' +
            '<strong style="color:#ef4444; font-size:2.4rem; font-weight:900; letter-spacing:-1px; display:block; margin-top:5px; text-shadow:0 0 15px rgba(239,68,68,0.3);">'+stats.ck.toFixed(2)+' zł</strong>' +
            '<div style="font-size:0.65rem; color:rgba(255,255,255,0.4); margin-top:10px; background:rgba(0,0,0,0.4); padding:6px 10px; border-radius:8px; display:inline-block; font-weight:600;">Dystans Mix: '+stats.td.toFixed(0)+' KM | Wydano: '+stats.totalCost.toFixed(2)+' zł</div>' +
        '</div>' +

        '<div class="mode-switch" style="border-radius:16px; padding:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05); margin:0 15px 20px 15px;">' +
            '<div class="m-btn '+(mode==='f'?'active':'')+'" onclick="window.dGarMode=\'f\';window.render()" style="border-radius:12px; padding:12px; font-weight:800; font-size:0.75rem; '+(mode==='f'?'background:#f59e0b;color:#000;box-shadow:0 4px 15px rgba(245,158,11,0.3);':'color:rgba(255,255,255,0.4);')+'">⛽ TANKOWANIA</div>' +
            '<div class="m-btn '+(mode==='e'?'active':'')+'" onclick="window.dGarMode=\'e\';window.render()" style="border-radius:12px; padding:12px; font-weight:800; font-size:0.75rem; '+(mode==='e'?'background:#0ea5e9;color:#fff;box-shadow:0 4px 15px rgba(14,165,233,0.3);':'color:rgba(255,255,255,0.4);')+'">🔧 SERWIS / INNE</div>' +
        '</div>' +
    '</div>';

    if(mode === 'f') {
        let tdy = window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0];
        html += '<div class="panel" style="border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); padding:15px; border-radius:20px; box-shadow:0 8px 25px rgba(0,0,0,0.5); margin:0 15px;">' +
            '<div class="p-title" style="color:#f59e0b; font-size:0.65rem; font-weight:800; letter-spacing:1px; margin-bottom:12px; text-align:center;">⛽ NOWE TANKOWANIE</div>' +
            
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">' +
                '<div class="inp-group" style="margin:0;"><label style="font-size:0.6rem; color:var(--muted); margin-bottom:4px; font-weight:bold;">Licznik (KM)</label><input type="number" id="df-o" value="'+(d.odo||0)+'" style="background:rgba(255,255,255,0.03); border-radius:10px; padding:12px; font-size:1rem; font-weight:700; color:#fff; text-align:center; border:1px solid rgba(255,255,255,0.05); outline:none; width:100%; box-sizing:border-box;"></div>' +
                '<div class="inp-group" style="margin:0;"><label style="font-size:0.6rem; color:var(--muted); margin-bottom:4px; font-weight:bold;">Ilość (L / kWh)</label><input type="number" step="0.1" id="df-l" style="background:rgba(255,255,255,0.03); border-radius:10px; padding:12px; font-size:1rem; font-weight:700; color:#fff; text-align:center; border:1px solid rgba(255,255,255,0.05); outline:none; width:100%; box-sizing:border-box;"></div>' +
            '</div>' +
            
            '<div style="display:flex; gap:10px; margin-bottom:10px;">' +
                '<div class="inp-group" style="flex:2; margin:0;"><label style="font-size:0.6rem; color:#f59e0b; margin-bottom:4px; font-weight:bold;">KOSZT (ZŁ)</label><input type="number" step="0.01" id="df-v" placeholder="0.00" style="background:rgba(0,0,0,0.3); border-radius:10px; padding:10px; font-size:1.4rem; font-weight:900; color:#f59e0b; text-align:center; border:1px solid rgba(245,158,11,0.3); outline:none; width:100%; box-sizing:border-box;"></div>' +
                '<div class="inp-group" style="flex:1.5; margin:0;"><label style="font-size:0.6rem; color:var(--muted); margin-bottom:4px; font-weight:bold;">Data</label><input type="date" id="df-date" value="'+tdy+'" style="background:rgba(255,255,255,0.03); border-radius:10px; padding:14px 10px; font-size:0.8rem; color:#fff; border:1px solid rgba(255,255,255,0.05); outline:none; width:100%; box-sizing:border-box;"></div>' +
            '</div>' +
            
            '<div style="display:flex; align-items:stretch; gap:10px; margin-bottom:15px;">' +
                '<select id="df-type" style="flex:1; background:rgba(255,255,255,0.03); border-radius:10px; padding:10px; font-size:0.8rem; font-weight:600; color:#fff; border:1px solid rgba(255,255,255,0.05); outline:none;">' + fuelOptionsHtml + '</select>' +
                '<label style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; background:rgba(245,158,11,0.1); padding:10px; border-radius:10px; border:1px solid rgba(245,158,11,0.3); cursor:pointer;">' +
                    '<input type="checkbox" id="df-full" checked style="width:16px; height:16px; accent-color:#f59e0b; margin:0;">' +
                    '<span style="color:#f59e0b; font-weight:800; font-size:0.7rem; white-space:nowrap;">DO PEŁNA</span>' +
                '</label>' +
            '</div>' +

            '<button class="btn" style="background:#f59e0b; color:#000; font-weight:900; font-size:0.95rem; letter-spacing:0.5px; padding:14px; border-radius:12px; border:none; box-shadow:0 4px 15px rgba(245,158,11,0.3); width:100%; outline:none;" onclick="if(typeof window.dAF===\'function\') window.dAF()">ZAPISZ TANKOWANIE</button>' +
        '</div>';
    } else {
        let tdy = window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0];
        html += '<div class="panel" style="border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); padding:15px; border-radius:20px; box-shadow:0 8px 25px rgba(0,0,0,0.5); margin:0 15px;">' +
            '<div class="p-title" style="color:#0ea5e9; font-size:0.65rem; font-weight:800; letter-spacing:1px; margin-bottom:12px; text-align:center;">🔧 NOWY WYDATEK SERWISOWY</div>' +
            
            '<div style="display:flex; gap:10px; margin-bottom:10px;">' +
                '<div class="inp-group" style="flex:2; margin:0;"><label style="font-size:0.6rem; color:#0ea5e9; margin-bottom:4px; font-weight:bold;">KOSZT (ZŁ)</label><input type="number" step="0.01" id="de-v" placeholder="0.00" style="background:rgba(0,0,0,0.3); border-radius:10px; padding:10px; font-size:1.4rem; font-weight:900; color:#0ea5e9; text-align:center; border:1px solid rgba(14,165,233,0.3); outline:none; width:100%; box-sizing:border-box;"></div>' +
                '<div class="inp-group" style="flex:1.5; margin:0;"><label style="font-size:0.6rem; color:var(--muted); margin-bottom:4px; font-weight:bold;">Data</label><input type="date" id="de-date" value="'+tdy+'" style="background:rgba(255,255,255,0.03); border-radius:10px; padding:14px 10px; font-size:0.8rem; color:#fff; border:1px solid rgba(255,255,255,0.05); outline:none; width:100%; box-sizing:border-box;"></div>' +
            '</div>' +
            
            '<div class="inp-group" style="margin-bottom:10px; margin-top:0;">' +
                '<label style="font-size:0.6rem; color:var(--muted); margin-bottom:4px; font-weight:bold;">Rodzaj wydatku</label>' +
                '<select id="de-c" style="background:rgba(255,255,255,0.03); border-radius:10px; padding:12px; font-size:0.85rem; font-weight:600; color:#fff; border:1px solid rgba(255,255,255,0.05); outline:none; width:100%;">' +
                    '<option>💦 Myjnia</option>' +
                    '<option>🔧 Naprawa / Części</option>' +
                    '<option>🚗 Płyn / Olej / Wycieraczki</option>' +
                    '<option>🅿️ Parking / Autostrada</option>' +
                    '<option>📋 Przegląd / Ubezpieczenie</option>' +
                    '<option>💡 Inne koszty eksploatacyjne</option>' +
                '</select>' +
            '</div>' +
            
            '<div class="inp-group" style="margin-bottom:15px;">' +
                '<label style="font-size:0.6rem; color:var(--muted); margin-bottom:4px; font-weight:bold;">Opis / Notatka (Opcjonalnie)</label>' +
                '<input type="text" id="de-desc" placeholder="np. Wymiana klocków przód" style="background:rgba(255,255,255,0.03); border-radius:10px; padding:12px; font-size:0.85rem; color:#fff; border:1px solid rgba(255,255,255,0.05); outline:none; width:100%; box-sizing:border-box;">' +
            '</div>' +

            '<button class="btn btn-info" style="background:#0ea5e9; color:#fff; font-weight:900; font-size:0.95rem; letter-spacing:0.5px; padding:14px; border-radius:12px; border:none; box-shadow:0 4px 15px rgba(14,165,233,0.3); width:100%; outline:none;" onclick="if(typeof window.dAE===\'function\') window.dAE()">ZAKSIĘGUJ WYDATEK</button>' +
        '</div>';
    }

    html += '<div style="margin:30px 15px 15px; text-align:center;"><span style="font-size:0.7rem; color:rgba(255,255,255,0.4); font-weight:800; text-transform:uppercase; letter-spacing:1px;">HISTORIA WYDATKÓW Z GARAŻU</span></div><div style="padding: 0 15px;">';
    
    let expl = d.exp || [];
    let fList = [];
    for(let i=0; i<expl.length; i++) {
        if(mode === 'f' && expl[i].ty === 'f') fList.push(expl[i]);
        else if(mode === 'e' && expl[i].ty === 'e') fList.push(expl[i]);
    }
    
    if(fList.length === 0) {
        html += '<div style="text-align:center; padding:30px; color:rgba(255,255,255,0.4); font-size:0.8rem; font-weight:600; background:rgba(0,0,0,0.2); border-radius:16px; border:1px dashed rgba(255,255,255,0.05);">Brak wpisów w tej kategorii.</div>';
    } else {
        for(let i=0; i<fList.length; i++) {
            let e = fList[i];
            let isFull = (e.isF === 'lpg_full' || e.isF === 'pb_full' || e.isF === 'on_full' || e.isF === 'ev_full' || e.isF === 1 || e.isF === "1");
            
            let fLabel = 'Dolewka';
            if (e.isF === 'lpg_full') fLabel = 'LPG (Pełen)';
            if (e.isF === 'pb_full') fLabel = 'PB (Pełen)';
            if (e.isF === 'on_full') fLabel = 'ON (Pełen)';
            if (e.isF === 'ev_full') fLabel = 'EV (Pełen)';
            if (e.isF === 'lpg_part') fLabel = 'LPG (Dolewka)';
            if (e.isF === 'pb_part') fLabel = 'PB (Dolewka)';
            if (e.isF === 'on_part') fLabel = 'ON (Dolewka)';
            if (e.isF === 'ev_part') fLabel = 'EV (Dolewka)';
            if (e.isF === 1 || e.isF === "1") fLabel = 'PB (Pełen)';
            
            let uStr = (e.isF && typeof e.isF === 'string' && e.isF.includes('ev')) ? 'kWh' : 'L';

            let eColor = e.ty === 'f' ? '#f59e0b' : '#0ea5e9';
            let eBgColor = e.ty === 'f' ? 'rgba(245,158,11,0.05)' : 'rgba(14,165,233,0.05)';
            let eIcon = e.ty === 'f' ? '⛽' : '🔧';
            if (e.d.includes('Myjnia')) eIcon = '💦';
            else if (e.d.includes('Olej')) eIcon = '🚗';
            else if (e.d.includes('Parking')) eIcon = '🅿️';

            let descHtml = (e.ty === 'e' && e.desc) ? `<div style="font-size:0.75rem; color:#0ea5e9; margin-top:4px; font-style:italic;">"${e.desc}"</div>` : '';

            html += '<div class="log-item" style="border:none; border-left:3px solid '+eColor+'; border-radius:16px; padding:15px; margin-bottom:12px; background:'+eBgColor+';">' +
                '<div style="display:flex; align-items:center; gap:15px; flex:1;" onclick="if(typeof window.dEditExp===\'function\') window.dEditExp('+e.id+')">' +
                    '<div style="font-size:1.5rem; width:45px; height:45px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:12px; display:flex; align-items:center; justify-content:center;">'+eIcon+'</div>' +
                    '<div style="flex:1;">' +
                        '<strong style="display:block; font-size:1rem; color:#fff; font-weight:700;">'+e.d+'</strong>' +
                        '<div style="display:flex; gap:6px; font-size:0.7rem; color:rgba(255,255,255,0.5); font-weight:600; align-items:center; margin-top:2px;">' +
                            '<span>'+e.dt+'</span>' +
                            (e.ty==='f' ? '<span style="opacity:0.3">•</span><span>ODO: '+e.odo+'</span>' : '') +
                        '</div>' +
                        (e.ty==='f' ? '<div style="font-size:0.65rem; color:'+(isFull ? '#10b981' : '#f59e0b')+'; font-weight:800; margin-top:6px; text-transform:uppercase;">'+fLabel+' | '+Number(e.l||0).toFixed(1)+' '+uStr+'</div>' : descHtml) +
                    '</div>' +
                '</div>' +
                '<div style="text-align:right; display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end;">' +
                    '<div style="color:'+eColor+'; font-weight:900; font-size:1.15rem; margin-bottom:10px;">-'+Number(e.v||0).toFixed(2)+' zł</div>' +
                    '<button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; padding:6px 12px; font-size:0.7rem; border-radius:10px; font-weight:800; cursor:pointer; outline:none;" onclick="if(typeof window.dDelExp===\'function\') window.dDelExp('+e.id+')">USUŃ</button>' +
                '</div>' +
            '</div>';
        }
    }
    
    return html;
};
