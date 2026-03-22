// ==========================================
// PLIK: taxi_tab_tools.js - Narzędzia (Wycena, Garaż, Fuelio Algorytm)
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
        if (t === 'quote') {
            let cOpts = '';
            if(d.clients && d.clients.length > 0) {
                for(let i=0; i<d.clients.length; i++) {
                    let c = d.clients[i];
                    cOpts += '<option value="'+c.d+'" data-n="'+c.n+'">'+c.n+' (-'+c.d+'%)</option>';
                }
            }
            
            let appContainer = document.getElementById('app');
            if(appContainer) {
                appContainer.innerHTML = hdr + 
                '<div class="dash-hero" style="padding-bottom:10px;">' +
                    '<p style="letter-spacing:1px; color:var(--muted); font-weight:bold; font-size:0.7rem;">ZARZĄDZANIE OPROGRAMOWANIEM</p>' +
                    '<h1 style="color:#d946ef; font-size:2.8rem; margin-bottom:20px; font-weight:900; letter-spacing:-1px; text-shadow:0 0 20px rgba(217, 70, 239, 0.4);">🧮 Wycena</h1>' +
                '</div>' +
                '<div class="panel" style="border-color:rgba(217, 70, 239, 0.2); background:linear-gradient(145deg, #1e0a2d, #09090b); padding:20px 15px; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.5); margin:0 15px;">' +
                    '<div class="inp-group" style="margin-bottom:10px;">' +
                        '<label style="color:var(--success); font-size:0.65rem; font-weight:bold; letter-spacing:1px;">🟢 ADRES POCZĄTKOWY</label>' +
                        '<input type="text" id="dq-start" placeholder="np. Dworzec Główny" style="border-color:rgba(34,197,94,0.3); background:rgba(0,0,0,0.5); padding:15px; border-radius:12px;">' +
                    '</div>' +
                    '<div class="inp-group" style="margin-bottom:20px;">' +
                        '<label style="color:var(--danger); font-size:0.65rem; font-weight:bold; letter-spacing:1px;">🔴 ADRES DOCELOWY</label>' +
                        '<input type="text" id="dq-end" placeholder="np. Powstańców Warszawy 1" style="border-color:rgba(239,68,68,0.3); background:rgba(0,0,0,0.5); padding:15px; border-radius:12px;">' +
                    '</div>' +
                    '<button id="btn-route-calc" class="btn" style="background:linear-gradient(135deg, #d946ef, #c026d3); color:#fff; font-weight:900; font-size:1rem; padding:18px; border-radius:16px; border:none; box-shadow:0 8px 25px rgba(217,70,239,0.3);" onclick="if(typeof window.calculateRouteAuto===\'function\') window.calculateRouteAuto()">🔍 WYZNACZ TRASĘ I CENĘ</button>' +
                    
                    '<div id="map-container" style="display:none; margin-top:25px;">' +
                        '<div id="map" style="height:250px; border-radius:16px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.05); box-shadow:inset 0 4px 10px rgba(0,0,0,0.5);"></div>' +
                        
                        '<div class="grid-2" style="margin-bottom:20px; gap:10px;">' +
                            '<div class="box" style="padding:15px; border-radius:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase; font-weight:bold; letter-spacing:1px;">DYSTANS</span><strong style="font-size:1.4rem; color:#fff; display:block; margin-top:5px;" id="res-km">0.0 km</strong></div>' +
                            '<div class="box" style="padding:15px; border-radius:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase; font-weight:bold; letter-spacing:1px;">CZAS JAZDY</span><strong style="font-size:1.4rem; color:#fff; display:block; margin-top:5px;" id="res-min">0 min</strong></div>' +
                        '</div>' +
                        
                        '<div class="mode-switch" style="margin-bottom:20px; border-radius:12px; padding:4px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.05);">' +
                            '<div class="m-btn active" id="btn-tar-day" onclick="window.dQN=false; this.classList.add(\'active\'); this.style.border=\'1px solid #d946ef\'; document.getElementById(\'btn-tar-night\').classList.remove(\'active\'); document.getElementById(\'btn-tar-night\').style.border=\'1px solid transparent\'; if(typeof window.updateRoutePrice===\'function\') window.updateRoutePrice();" style="border:1px solid #d946ef; padding:10px; border-radius:10px;">Dzień (T1/T3)</div>' +
                            '<div class="m-btn" id="btn-tar-night" onclick="window.dQN=true; this.classList.add(\'active\'); this.style.border=\'1px solid #d946ef\'; document.getElementById(\'btn-tar-day\').classList.remove(\'active\'); document.getElementById(\'btn-tar-day\').style.border=\'1px solid transparent\'; if(typeof window.updateRoutePrice===\'function\') window.updateRoutePrice();" style="padding:10px; border-radius:10px;">Noc/Święto (T2/T4)</div>' +
                        '</div>' +
                        
                        '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:20px 15px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.05);">' +
                            '<label style="font-size:0.7rem; color:var(--info); display:block; text-align:center; margin-bottom:15px; font-weight:bold; letter-spacing:1px;">PRZESUŃ DO GRANICY MIASTA</label>' +
                            '<input type="range" id="zone-slider" min="0" max="100" value="100" step="0.1" style="width:100%; accent-color:var(--info);" oninput="if(typeof window.updateZoneSplit===\'function\') window.updateZoneSplit()">' +
                            '<div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-top:12px; font-weight:bold;">' +
                                '<span style="color:var(--info); background:rgba(14,165,233,0.1); padding:4px 8px; border-radius:6px;">Miasto: <strong id="val-in">0.0</strong> km</span>' +
                                '<span style="color:var(--warning); background:rgba(245,158,11,0.1); padding:4px 8px; border-radius:6px;">Poza miastem: <strong id="val-out">0.0</strong> km</span>' +
                            '</div>' +
                        '</div>' +
                        
                        '<div style="border:1px solid rgba(217, 70, 239, 0.3); border-radius:20px; padding:25px; text-align:center; margin-bottom:20px; background:linear-gradient(180deg, rgba(217, 70, 239, 0.05) 0%, transparent 100%);">' +
                            '<span style="font-size:0.7rem; color:#d946ef; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">PROPONOWANA CENA (BRUTTO)</span>' +
                            '<div id="dqt" style="font-size:3.5rem; font-weight:900; letter-spacing:-2px; color:#fff; margin-top:5px; margin-bottom:5px;">0.00 zł</div>' +
                            '<div style="font-size:0.75rem; color:var(--danger); background:rgba(239,68,68,0.1); padding:6px 12px; border-radius:10px; display:inline-block;">Koszt paliwa: <strong id="q-fuel-cost">0.00</strong> zł</div>' +
                        '</div>' +
                        
                        '<div class="inp-group" style="margin-bottom:20px;">' +
                            '<label style="font-size:0.65rem; letter-spacing:1px; color:var(--muted);">KLIENT VIP (RABAT)</label>' +
                            '<select id="dq-c" onchange="if(typeof window.updateRoutePrice===\'function\') window.updateRoutePrice()" style="background:rgba(255,255,255,0.05); border-radius:12px; padding:15px; font-size:0.9rem;">' +
                                '<option value="0">-- Zwykły kurs --</option>' + cOpts +
                            '</select>' +
                        '</div>' +
                        
                        '<button class="btn" style="background:linear-gradient(135deg, #d946ef, #c026d3); color:#fff; font-size:1rem; font-weight:900; padding:18px; border-radius:16px; border:none; box-shadow:0 8px 25px rgba(217,70,239,0.3);" onclick="if(typeof window.saveQuoteToPanel===\'function\') window.saveQuoteToPanel()">ZAKSIĘGUJ DO PANELU</button>' +
                    '</div>' +
                '</div>' +
                '<div style="padding-bottom:80px;"></div>' + (nav||'');
            }
            return;
        }

        if (t === 'garage') {
            let appContainer = document.getElementById('app');
            if(appContainer) {
                appContainer.innerHTML = hdr + 
                '<div class="dash-hero" style="padding-bottom:10px;">' +
                    '<p style="letter-spacing:1px; color:var(--muted); font-weight:bold; font-size:0.7rem;">DZIENNIK TANKOWAŃ I SERWISÓW</p>' +
                    '<h1 style="color:var(--fuel); font-size:2.8rem; margin-bottom:20px; font-weight:900; letter-spacing:-1px; text-shadow:0 0 20px rgba(245, 158, 11, 0.4);">⛽ GARAŻ</h1>' +
                '</div>' +
                (typeof window.hRenderGarage === 'function' ? window.hRenderGarage(d) : '') +
                '<div style="padding-bottom:80px;"></div>' + (nav||'');
            }
        }
    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:40px 20px; text-align:center; color:white;"><h3>Błąd w Garażu</h3><p style="color:var(--danger);">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; margin-top:20px;" onclick="window.location.reload()">ODŚWIEŻ</button></div>' + (nav || '');
        }
    }
};

// --- RENDER GARAŻU Z DYNAMICZNYMI PALIWAMI ---
window.hRenderGarage = function(d) {
    let mode = window.dGarMode || 'f';
    let sourceAlert = '';
    
    if (d.cfg && d.cfg.fuelSource === 'manual') {
        sourceAlert = '<div style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); color:var(--danger); padding:15px; border-radius:16px; font-size:0.75rem; text-align:center; margin-bottom:20px; font-weight:bold; box-shadow:0 4px 10px rgba(239,68,68,0.1);">⚠️ Masz włączony tryb Ręcznego Wpisywania Spalania w Opcjach. Apka zignoruje statystyki z Garażu do wyliczeń Wyceny.</div>';
    }

    let stats = window.calcFuelioStats();
    let statsCards = '';

    if (stats.list.length > 0) {
        for(let i=0; i<stats.list.length; i++) {
            let x = stats.list[i];
            let u100 = x.unit === 'kWh' ? 'kWh/100' : 'L/100';
            statsCards += '<div class="box" style="border-color:rgba(245,158,11,0.2); background:rgba(245,158,11,0.05); text-align:center; padding:15px 10px; border-radius:16px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">' +
                '<span style="font-size:0.6rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px;">'+x.name+' <span style="opacity:0.5;">('+x.dist.toFixed(0)+' KM)</span></span><br>' +
                '<strong style="color:var(--fuel); font-size:1.5rem; display:block; margin-top:5px;">'+x.l100.toFixed(2)+' <span style="font-size:0.6rem;">'+u100+'</span></strong>' +
                '<strong style="color:var(--danger); font-size:0.85rem; background:rgba(239,68,68,0.1); padding:4px 8px; border-radius:8px; display:inline-block; margin-top:5px;">'+x.ck.toFixed(2)+' zł/km</strong>' +
            '</div>';
        }
    } else {
        statsCards = '<div class="box" style="grid-column: span 2; text-align:center; padding:20px; color:var(--muted); font-size:0.8rem; border-color:rgba(255,255,255,0.05); border-radius:16px;">Brak pełnych cykli tankowań do obliczeń. Zatankuj do pełna 2 razy.</div>';
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

    let html = '<div style="padding:0 15px;">' +
        sourceAlert +
        '<div class="grid-2" style="margin-bottom:15px; gap:10px;">' +
            statsCards +
        '</div>' +
        
        '<div style="text-align:center; margin-bottom:25px; background:linear-gradient(145deg, rgba(239,68,68,0.1), rgba(0,0,0,0.2)); border:1px solid rgba(239,68,68,0.2); padding:20px; border-radius:20px; box-shadow:0 8px 25px rgba(239,68,68,0.15);">' +
            '<span style="font-size:0.65rem; color:var(--danger); font-weight:bold; text-transform:uppercase; letter-spacing:1px;">ZBIORCZY KOSZT PALIW (MIX) NA 1 KM</span><br>' +
            '<strong style="color:var(--danger); font-size:2.2rem; font-weight:900; letter-spacing:-1px; display:block; margin-top:5px; text-shadow:0 0 15px rgba(239,68,68,0.3);">'+stats.ck.toFixed(2)+' zł</strong>' +
            '<div style="font-size:0.7rem; color:var(--muted); margin-top:8px; background:rgba(0,0,0,0.5); padding:6px; border-radius:8px; display:inline-block;">Dystans Mix: '+stats.td.toFixed(0)+' KM | Wydano: '+stats.totalCost.toFixed(2)+' zł</div>' +
        '</div>' +

        '<div class="mode-switch" style="border-radius:12px; padding:4px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">' +
            '<div class="m-btn '+(mode==='f'?'active':'')+'" onclick="window.dGarMode=\'f\';window.render()" style="border-radius:10px; padding:10px; '+(mode==='f'?'background:linear-gradient(135deg, var(--fuel), #d97706);color:#000;font-weight:bold;box-shadow:0 4px 15px rgba(245,158,11,0.3);':'')+'">⛽ TANKOWANIA</div>' +
            '<div class="m-btn '+(mode==='e'?'active':'')+'" onclick="window.dGarMode=\'e\';window.render()" style="border-radius:10px; padding:10px; '+(mode==='e'?'background:linear-gradient(135deg, var(--info), #0284c7);color:#fff;font-weight:bold;box-shadow:0 4px 15px rgba(14,165,233,0.3);':'')+'">🔧 SERWIS / INNE</div>' +
        '</div>' +
    '</div>';

    if(mode === 'f') {
        let tdy = window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0];
        html += '<div class="panel" style="border-color:rgba(245,158,11,0.3); background:linear-gradient(145deg, #1f1406, #09090b); padding:20px 15px; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.5); margin:0 15px;">' +
            '<div class="p-title" style="color:var(--fuel); font-size:0.8rem; letter-spacing:1px; margin-bottom:15px; text-align:center;">⛽ NOWE TANKOWANIE</div>' +
            
            '<div class="inp-row" style="margin-bottom:10px;">' +
                '<div class="inp-group" style="margin:0;"><input type="number" id="df-o" value="'+(d.odo||0)+'" placeholder="Licznik (KM)" style="background:rgba(0,0,0,0.5); border-radius:12px; padding:15px; font-size:1.1rem; text-align:center; border:1px solid rgba(255,255,255,0.05);"></div>' +
                '<div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="df-l" placeholder="Litry / kWh" style="background:rgba(0,0,0,0.5); border-radius:12px; padding:15px; font-size:1.1rem; text-align:center; border:1px solid rgba(255,255,255,0.05);"></div>' +
            '</div>' +
            
            '<div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:15px; margin-bottom:15px;">' +
                '<div style="display:flex; justify-content:center; align-items:center; gap:8px;">' +
                    '<input type="number" step="0.01" id="df-v" placeholder="0" style="color:var(--fuel); border:none; background:transparent; font-size:3.2rem; font-weight:900; text-align:center; width:140px; padding:0; outline:none;">' +
                    '<span style="font-size:1.5rem; font-weight:bold; color:var(--muted); margin-top:15px;">zł</span>' +
                '</div>' +
            '</div>' +
            
            '<div class="inp-row" style="margin-bottom:15px; align-items:center;">' +
                '<div class="inp-group" style="margin:0; flex:1;">' +
                    '<select id="df-type" style="background:rgba(255,255,255,0.05); border-radius:12px; padding:12px; font-size:0.85rem; border:1px solid rgba(245,158,11,0.2);">' + fuelOptionsHtml + '</select>' +
                '</div>' +
                '<div class="inp-group" style="margin:0; width:100px;">' +
                    '<input type="date" id="df-date" value="'+tdy+'" style="background:rgba(255,255,255,0.05); border-radius:12px; padding:12px; font-size:0.85rem; border:1px solid rgba(255,255,255,0.05);">' +
                '</div>' +
            '</div>' +
            
            '<div style="background:rgba(245,158,11,0.05); border:1px dashed rgba(245,158,11,0.3); border-radius:12px; padding:15px; margin-bottom:15px; text-align:center;">' +
                '<label style="display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer;">' +
                    '<input type="checkbox" id="df-full" checked style="width:24px; height:24px; accent-color:var(--fuel);">' +
                    '<span style="color:var(--fuel); font-weight:bold; font-size:0.9rem; letter-spacing:1px;">ZATANKOWANO DO PEŁNA</span>' +
                '</label>' +
            '</div>' +

            '<button class="btn" style="background:linear-gradient(135deg, var(--fuel), #d97706); color:#000; font-weight:900; font-size:1rem; letter-spacing:1px; padding:18px; border-radius:16px; border:none; box-shadow:0 8px 25px rgba(245,158,11,0.3);" onclick="if(typeof window.dAF===\'function\') window.dAF()">ZAPISZ TANKOWANIE</button>' +
        '</div>';
    } else {
        let tdy = window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0];
        html += '<div class="panel" style="border-color:rgba(14,165,233,0.3); background:linear-gradient(145deg, #091324, #09090b); padding:20px 15px; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.5); margin:0 15px;">' +
            '<div class="p-title" style="color:var(--info); font-size:0.8rem; letter-spacing:1px; margin-bottom:15px; text-align:center;">🔧 NOWY WYDATEK SERWISOWY</div>' +
            
            '<div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:15px; margin-bottom:15px;">' +
                '<div style="display:flex; justify-content:center; align-items:center; gap:8px;">' +
                    '<input type="number" step="0.01" id="de-v" placeholder="0" style="color:var(--info); border:none; background:transparent; font-size:3.2rem; font-weight:900; text-align:center; width:140px; padding:0; outline:none;">' +
                    '<span style="font-size:1.5rem; font-weight:bold; color:var(--muted); margin-top:15px;">zł</span>' +
                '</div>' +
            '</div>' +
            
            '<div class="inp-row" style="margin-bottom:20px;">' +
                '<div class="inp-group" style="margin:0; flex:1;">' +
                    '<select id="de-c" style="background:rgba(255,255,255,0.05); border-radius:12px; padding:15px; font-size:0.85rem; border:1px solid rgba(14,165,233,0.2);">' +
                        '<option>💦 Myjnia</option>' +
                        '<option>🔧 Naprawa / Części</option>' +
                        '<option>🚗 Płyn / Olej</option>' +
                        '<option>🅿️ Parking</option>' +
                        '<option>📋 Przegląd</option>' +
                        '<option>💡 Inne wydatki</option>' +
                    '</select>' +
                '</div>' +
                '<div class="inp-group" style="margin:0; width:110px;">' +
                    '<input type="date" id="de-date" value="'+tdy+'" style="background:rgba(255,255,255,0.05); border-radius:12px; padding:15px; font-size:0.8rem; border:1px solid rgba(255,255,255,0.05);">' +
                '</div>' +
            '</div>' +
            '<button class="btn btn-info" style="background:linear-gradient(135deg, var(--info), #0284c7); color:#fff; font-weight:900; font-size:1rem; letter-spacing:1px; padding:18px; border-radius:16px; border:none; box-shadow:0 8px 25px rgba(14,165,233,0.3);" onclick="if(typeof window.dAE===\'function\') window.dAE()">ZAKSIĘGUJ WYDATEK</button>' +
        '</div>';
    }

    html += '<div style="margin:30px 15px 10px; text-align:center;"><span style="font-size:0.75rem; color:var(--muted); font-weight:bold; text-transform:uppercase; letter-spacing:2px;">HISTORIA WYDATKÓW Z GARAŻU</span></div><div style="padding: 0 15px;">';
    
    let expl = d.exp || [];
    let fList = [];
    for(let i=0; i<expl.length; i++) {
        if(mode === 'f' && expl[i].ty === 'f') fList.push(expl[i]);
        else if(mode === 'e' && expl[i].ty === 'e') fList.push(expl[i]);
    }
    
    if(fList.length === 0) {
        html += '<div style="text-align:center; padding:30px; color:var(--muted); font-size:0.8rem; background:rgba(0,0,0,0.2); border-radius:16px; border:1px dashed rgba(255,255,255,0.05);">Brak wpisów w tej kategorii.</div>';
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

            let eColor = e.ty === 'f' ? 'var(--fuel)' : 'var(--info)';
            let eBgColor = e.ty === 'f' ? 'rgba(245,158,11,0.1)' : 'rgba(14,165,233,0.1)';
            let eIcon = e.ty === 'f' ? '⛽' : '🔧';
            if (e.d.includes('Myjnia')) eIcon = '💦';
            else if (e.d.includes('Olej')) eIcon = '🚗';
            else if (e.d.includes('Parking')) eIcon = '🅿️';

            html += '<div class="log-item" style="border-left:4px solid '+eColor+'; border-radius:16px; padding:15px; margin-bottom:10px; background:linear-gradient(90deg, '+eBgColor+' 0%, rgba(255,255,255,0.02) 100%);">' +
                '<div style="display:flex; align-items:center; gap:15px; flex:1;" onclick="if(typeof window.dEditExp===\'function\') window.dEditExp('+e.id+')">' +
                    '<div style="font-size:1.4rem; width:42px; height:42px; background:rgba(0,0,0,0.4); border:1px solid '+eColor+'44; border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 2px 5px rgba(255,255,255,0.05);">'+eIcon+'</div>' +
                    '<div style="flex:1;">' +
                        '<strong style="display:block; font-size:1rem; color:#fff; letter-spacing:0.5px;">'+e.d+'</strong>' +
                        '<div style="display:flex; gap:6px; font-size:0.7rem; color:var(--muted); align-items:center; margin-top:2px;">' +
                            '<span>'+e.dt+'</span>' +
                            (e.ty==='f' ? '<span style="opacity:0.5">•</span><span>ODO: '+e.odo+'</span>' : '') +
                        '</div>' +
                        (e.ty==='f' ? '<div style="font-size:0.65rem; color:'+(isFull ? 'var(--success)' : 'var(--warning)')+'; font-weight:bold; margin-top:4px; text-transform:uppercase;">'+fLabel+' | '+Number(e.l||0).toFixed(1)+' '+uStr+'</div>' : '') +
                    '</div>' +
                '</div>' +
                '<div style="text-align:right; display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end;">' +
                    '<div style="color:'+eColor+'; font-weight:900; font-size:1.15rem; margin-bottom:8px;">-'+Number(e.v||0).toFixed(2)+' zł</div>' +
                    '<button style="background:rgba(239,68,68,0.15); color:var(--danger); border:1px solid rgba(239,68,68,0.2); padding:6px 12px; font-size:0.65rem; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="if(typeof window.dDelExp===\'function\') window.dDelExp('+e.id+')">USUŃ</button>' +
                '</div>' +
            '</div>';
        }
    }
    
    html += '</div><div style="height:40px;"></div>';
    return html;
};
