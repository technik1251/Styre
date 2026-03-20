// ==========================================
// PLIK: taxi_logic.js - "Mózg" Panelu Kierowcy
// ==========================================

window.dShowOff = window.dShowOff || false;

// 🔥 Zabezpieczenie przed amnezją zmiany po odświeżeniu (F5)
window.dSessionInit = function() {
    if (!window.db || !window.db.drv) return;
    if (window.db.drv.sh && window.db.drv.sh.on && window.db.role === 'drv' && window.db.tab === 'term') {
        if (!window.clockInt) {
            window.clockInt = setInterval(() => { 
                if(window.db && window.db.role === 'drv' && window.db.tab === 'term' && window.db.drv.sh && window.db.drv.sh.on) {
                    window.render(); 
                }
            }, 60000);
        }
    }
};

window.dTC = function(t, v) { 
    if (t === 's') { 
        window.dTSrc = v; 
        if (v === 'Inna') window.dOtherSrc = ''; 
    } else { 
        window.dTPay = v; 
    } 
    window.render(); 
};

window.toggleShiftPause = function() { 
    if (!window.db || !window.db.drv || !window.db.drv.sh) return;
    if (!window.db.drv.sh.sPS) { 
        window.db.drv.sh.sPS = Date.now(); 
    } else { 
        window.db.drv.sh.sPT = (window.db.drv.sh.sPT || 0) + (Date.now() - window.db.drv.sh.sPS); 
        window.db.drv.sh.sPS = null; 
    } 
    window.save(); 
    window.render(); 
};

window.toggleRideWait = function() { 
    if (!window.db || !window.db.drv || !window.db.drv.sh) return;
    if (!window.db.drv.sh.rWS) { 
        window.db.drv.sh.rWS = Date.now(); 
    } else { 
        window.db.drv.sh.rWT = (window.db.drv.sh.rWT || 0) + (Date.now() - window.db.drv.sh.rWS); 
        window.db.drv.sh.rWS = null; 
    } 
    window.save(); 
    window.render(); 
};

window.startLiveRide = function() { 
    if (!window.db || !window.db.drv) return;
    window.db.drv.liveRideStart = Date.now(); 
    window.save(); 
    window.render(); 
};

window.stopLiveRide = function() {
    if (!window.db || !window.db.drv || !window.db.drv.sh) return;
    
    let t = Date.now() - (window.db.drv.liveRideStart || Date.now());
    
    if (window.db.drv.sh.rWS) { 
        window.db.drv.sh.rWT = (window.db.drv.sh.rWT || 0) + (Date.now() - window.db.drv.sh.rWS); 
        window.db.drv.sh.rWS = null; 
    }
    
    let m = Math.max(1, Math.round(t / 60000));
    let wM = (window.db.drv.sh.rWT || 0) / 60000;
    
    // Bezpieczne pobranie stawki za postój (w)
    let qWait = window.db.drv.q && window.db.drv.q.w ? window.db.drv.q.w : 0;
    let wC = (wM / 60) * qWait;
    
    window.db.drv.liveRideStart = null; 
    window.db.drv.sh.rWT = 0;
    window.save(); 
    window.render();
    
    setTimeout(() => {
        let iM = document.getElementById('dt-m');
        let iV = document.getElementById('dt-v');
        if (iM) { 
            iM.value = m; 
            iM.classList.add('highlight-input'); 
            setTimeout(() => iM.classList.remove('highlight-input'), 1500); 
        }
        if (iV && wC > 0) { 
            let cV = parseFloat(iV.value) || 0; 
            iV.value = Number(cV + wC).toFixed(2); 
            iV.classList.add('highlight-input'); 
            setTimeout(() => iV.classList.remove('highlight-input'), 1500); 
        }
        if (iV) iV.focus(); 
    }, 50);
};

window.calculateRouteAuto = async function() {
    let start = document.getElementById('dq-start') ? document.getElementById('dq-start').value : '';
    let end = document.getElementById('dq-end') ? document.getElementById('dq-end').value : '';
    
    if (!start || !end) { 
        if (window.sysAlert) return window.sysAlert("Brak Danych", "Podaj adres startowy i docelowy!", "error"); 
        return; 
    }
    
    let defCity = (window.db && window.db.drv && window.db.drv.cfg && window.db.drv.cfg.defCity) ? window.db.drv.cfg.defCity : 'Szczecin';
    let sQ = start.toLowerCase().includes(defCity.toLowerCase()) ? start : start + ', ' + defCity;
    let eQ = end.toLowerCase().includes(defCity.toLowerCase()) ? end : end + ', ' + defCity;
    
    let btn = document.querySelector('button[onclick="window.calculateRouteAuto()"]');
    let origBtnText = btn ? btn.innerText : '';
    
    if (btn) { 
        btn.innerText = "⏳ OBLICZANIE..."; 
        btn.style.opacity = 0.7; 
        btn.disabled = true;
    }
    
    try {
        let resS = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(sQ)}`);
        let dataS = await resS.json();
        
        let resE = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(eQ)}`);
        let dataE = await resE.json();
        
        if (!dataS.length || !dataE.length) {
            if (btn) { btn.innerText = origBtnText; btn.style.opacity = 1; btn.disabled = false; }
            if (window.sysAlert) return window.sysAlert("Błąd Mapy", "Nie odnaleziono adresu. Sprawdź pisownię.", "error"); 
            return;
        }
        
        let routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${dataS[0].lon},${dataS[0].lat};${dataE[0].lon},${dataE[0].lat}?overview=full&geometries=geojson`);
        let routeData = await routeRes.json();
        
        if (!routeData || !routeData.routes || routeData.routes.length === 0) throw new Error("Brak trasy");
        
        let distKm = routeData.routes[0].distance / 1000;
        let timeMin = routeData.routes[0].duration / 60;
        
        let mapContainer = document.getElementById('map-container');
        if (mapContainer) mapContainer.style.display = 'block';
        
        if (!window.lmap) {
            window.lmap = L.map('map').setView([dataS[0].lat, dataS[0].lon], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(window.lmap);
        }
        window.lmap.invalidateSize();
        
        if (window.routeLayer) window.lmap.removeLayer(window.routeLayer);
        
        window.routeLayer = L.geoJSON(routeData.routes[0].geometry, {style: {color:'#d946ef', weight:6}}).addTo(window.lmap);
        window.lmap.fitBounds(window.routeLayer.getBounds(), {padding:[20,20]});
        
        window.dQK = distKm; 
        window.dQM_T = Math.round(timeMin);
        
        let resKmEl = document.getElementById('res-km');
        if (resKmEl) resKmEl.innerText = Number(distKm).toFixed(1) + ' km';
        
        let resMinEl = document.getElementById('res-min');
        if (resMinEl) resMinEl.innerText = window.dQM_T + ' min';
        
        let isOut = !end.toLowerCase().includes(defCity.toLowerCase());
        let slider = document.getElementById('zone-slider');
        
        if (slider) {
            slider.max = Number(distKm).toFixed(1);
            if (isOut) { 
                slider.value = Math.min(10, distKm); 
                let zs = document.getElementById('zone-split');
                if(zs) zs.style.display = 'block'; 
            } else { 
                slider.value = Number(distKm).toFixed(1); 
                let zs = document.getElementById('zone-split');
                if(zs) zs.style.display = 'none'; 
            }
            window.updateZoneSplit();
        }
        
    } catch(e) {
        if (window.sysAlert) window.sysAlert("Błąd Serwera", "Problem z wyznaczeniem trasy na mapach OSRM.", "error");
        console.error(e);
    } finally {
        if (btn) { btn.innerText = origBtnText; btn.style.opacity = 1; btn.disabled = false; }
    }
};

window.updateZoneSplit = function() {
    let slider = document.getElementById('zone-slider');
    if (!slider) return;
    
    let inDist = parseFloat(slider.value) || 0;
    let outDist = (parseFloat(slider.max) || 0) - inDist;
    
    let valIn = document.getElementById('val-in');
    if (valIn) valIn.innerText = Number(inDist).toFixed(1);
    
    let valOut = document.getElementById('val-out');
    if (valOut) valOut.innerText = Number(outDist).toFixed(1);
    
    window.updateRoutePrice(inDist, outDist);
};

window.updateRoutePrice = function(inDist = null, outDist = null) {
    if (inDist === null) {
        let slider = document.getElementById('zone-slider');
        if (!slider) return;
        inDist = parseFloat(slider.value) || 0;
        outDist = (parseFloat(slider.max) || 0) - inDist;
    }
    
    let q = (window.db && window.db.drv && window.db.drv.q) ? window.db.drv.q : {s:0, w:0, t1:0, t2:0, t3:0, t4:0};
    let discSel = document.getElementById('dq-c');
    let disc = (discSel && discSel.selectedIndex > 0) ? parseFloat(discSel.options[discSel.selectedIndex].getAttribute('data-d') || 0) : 0;
    
    // Zabezpieczenie przed brakiem taryf w bazie (gdy kierowca nic nie wpisał w Opcjach)
    let s = parseFloat(q.s) || 0;
    let t1 = parseFloat(q.t1) || 0; let t2 = parseFloat(q.t2) || 0;
    let t3 = parseFloat(q.t3) || 0; let t4 = parseFloat(q.t4) || 0;
    let w = parseFloat(q.w) || 0;

    let expectedTime = ((window.dQK || 0) / 20) * 60;
    let trafficTime = Math.max(0, (window.dQM_T || 0) - expectedTime);
    
    let base = s + 
               (inDist * (window.dQN ? t2 : t1)) + 
               (outDist * (window.dQN ? t4 : t3)) + 
               (trafficTime * (w / 60));
               
    window.dQV = base - (base * (disc / 100));
    
    let dqt = document.getElementById('dqt');
    if (dqt) {
        if(s === 0 && t1 === 0 && t2 === 0) {
            dqt.innerHTML = `<span style="font-size:1.5rem; color:var(--danger)">Ustaw taryfy w zakładce Opcje!</span>`;
            window.dQV = 0;
        } else {
            dqt.innerText = Number(window.dQV || 0).toFixed(2) + " zł";
        }
    }
};

window.calcFuelioStats = function() {
    let l = (window.db && window.db.drv && window.db.drv.fuel) ? window.db.drv.fuel : [];
    let px = (window.db && window.db.drv && window.db.drv.cfg && window.db.drv.cfg.fuelPx) ? window.db.drv.cfg.fuelPx : 0;
    let s = {l1: 0, c1: 0, ck: px};
    
    if (l.length >= 2) {
        let lF = l.findIndex(x => x.isF === 1);
        if (lF !== -1) {
            let pF = l.findIndex((x,i) => i > lF && x.isF === 1);
            if (pF !== -1) {
                let d = (l[lF].o || 0) - (l[pF].o || 0);
                if (d > 0) {
                    let tL = 0, tC = 0;
                    for (let i = lF; i < pF; i++) { 
                        tL += (l[i].l || 0); 
                        tC += (l[i].v || 0); 
                    }
                    s.l1 = (tL / d) * 100; 
                    s.c1 = (tC / d) * 100; 
                    s.ck = tC / d;
                    
                    // Automatyczna aktualizacja ceny kilometra w głównych ustawieniach kierowcy!
                    if (window.db && window.db.drv && window.db.drv.cfg) {
                        window.db.drv.cfg.fuelPx = s.ck; 
                        window.save();
                    }
                }
            }
        }
    }
    return s;
};
