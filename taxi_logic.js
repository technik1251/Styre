// ==========================================
// PLIK: taxi_logic.js - "Mózg" Panelu Kierowcy (z obsługą mapy)
// ==========================================

window.dShowOff = window.dShowOff || false;

// --- INICJALIZACJA SESJI TAXI ---
window.dSessionInit = function() {
    if (!window.db || !window.db.drv) return;
    if (window.db.drv.sh && window.db.drv.sh.active && window.db.role === 'drv' && window.db.tab === 'term') {
        if (!window.clockInt) {
            window.clockInt = setInterval(() => { 
                if(window.db && window.db.role === 'drv' && window.db.tab === 'term' && window.db.drv.sh && window.db.drv.sh.active) {
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

// --- LOGIKA ROZPOCZYNANIA I KOŃCZENIA ZMIANY W PANELU ---
window.dToggleShift = function() {
    if(!window.db.drv.sh) window.db.drv.sh = { active: false, tr: [] };
    
    if(window.db.drv.sh.active) {
        // Zakończenie Zmiany
        window.db.drv.sh.active = false;
        window.db.drv.sh.end = new Date().toISOString();
        
        let dObj = new Date(window.db.drv.sh.start);
        let g = window.db.drv.sh.tr.reduce((sum, t) => sum + (parseFloat(t.v)||0), 0);
        let k = window.db.drv.sh.tr.reduce((sum, t) => sum + (parseFloat(t.km)||0), 0);
        
        if(g > 0 || window.db.drv.sh.tr.length > 0) {
            if(!window.db.drv.h) window.db.drv.h = [];
            window.db.drv.h.unshift({
                id: Date.now(),
                dt: dObj.toLocaleDateString('pl-PL'),
                start: window.db.drv.sh.start,
                end: window.db.drv.sh.end,
                g: g,
                k: k,
                tr: window.db.drv.sh.tr
            });
        }
        window.db.drv.sh.tr = [];
    } else {
        // Rozpoczęcie Zmiany
        window.db.drv.sh.active = true;
        window.db.drv.sh.start = new Date().toISOString();
        window.db.drv.sh.tr = [];
    }
    window.save();
    window.render();
};

window.dAddTr = function() {
    let v = parseFloat(document.getElementById('dt-v').value);
    let p = document.getElementById('dt-p').value;
    let plat = document.getElementById('dt-plat').value;
    
    if(!v) {
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz kwotę kursu!");
        return;
    }
    
    if(!window.db.drv.sh.tr) window.db.drv.sh.tr = [];
    let dObj = new Date();
    window.db.drv.sh.tr.unshift({
        id: Date.now(),
        t: dObj.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'}),
        v: v,
        p: p,
        plat: plat,
        km: 0
    });
    window.save();
    window.render();
};

window.dDelTr = function(id) {
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie", "Usunąć ten wpis ze zmiany?", () => {
            window.db.drv.sh.tr = window.db.drv.sh.tr.filter(x => x.id !== id);
            window.save(); 
            window.render();
        });
    }
};

window.dEditGlobalOdo = function() {
    let cOdo = window.db.drv.odo || 0;
    let n = prompt("Aktualny przebieg auta (KM):", cOdo);
    if(n !== null && !isNaN(parseInt(n))) {
        window.db.drv.odo = parseInt(n);
        window.save();
        window.render();
    }
};

// --- LOGIKA WYCENY (MAPY LEAFLET I API) ---
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
    
    let btn = document.getElementById('btn-route-calc');
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
            window.lmap = L.map('map', {zoomControl: false}).setView([dataS[0].lat, dataS[0].lon], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OSM'
            }).addTo(window.lmap);
        }
        setTimeout(() => { window.lmap.invalidateSize(); }, 200);
        
        if (window.routeLayer) window.lmap.removeLayer(window.routeLayer);
        
        window.routeLayer = L.geoJSON(routeData.routes[0].geometry, {style: {color:'#d946ef', weight:6, opacity: 0.9}}).addTo(window.lmap);
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
            } else { 
                slider.value = Number(distKm).toFixed(1); 
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
    let disc = (discSel && discSel.selectedIndex > 0) ? parseFloat(discSel.options[discSel.selectedIndex].value || 0) : 0;
    
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
    
    // Obliczanie szacowanego kosztu paliwa (Dystans całkowity * koszt 1km)
    let cKm = (window.db && window.db.drv && window.db.drv.cfg && window.db.drv.cfg.fuelPx) ? window.db.drv.cfg.fuelPx : 0;
    let fuelCost = (window.dQK || 0) * cKm;
    
    let dqt = document.getElementById('dqt');
    if (dqt) {
        if(s === 0 && t1 === 0 && t2 === 0) {
            dqt.innerHTML = `<span style="font-size:1.5rem; color:var(--danger)">Ustaw taryfy poniżej!</span>`;
            window.dQV = 0;
        } else {
            dqt.innerText = Number(window.dQV || 0).toFixed(2) + " zł";
        }
    }
    
    let fuelEl = document.getElementById('q-fuel-cost');
    if (fuelEl) fuelEl.innerText = Number(fuelCost).toFixed(2);
};

window.saveQuoteToPanel = function() {
    if (!window.dQV || window.dQV <= 0) return;

    let start = document.getElementById('dq-start').value;
    let end = document.getElementById('dq-end').value;
    let activeShift = (window.db.drv.sh && window.db.drv.sh.active) ? window.db.drv.sh : null;

    if (!activeShift) {
        if(window.sysAlert) window.sysAlert("Brak aktywnej zmiany", "Przejdź do zakładki Panel i rozpocznij zmianę, by zaksięgować ten kurs!", "warning");
        return;
    }

    let dObj = new Date();
    if(!activeShift.tr) activeShift.tr = [];
    
    let isVip = false;
    let vipName = '';
    let discSel = document.getElementById('dq-c');
    if (discSel && discSel.selectedIndex > 0) {
        isVip = true;
        vipName = discSel.options[discSel.selectedIndex].getAttribute('data-n') || 'VIP';
    }
    
    let sourceDesc = `Trasa: ${start} ➔ ${end}`;
    if (isVip) sourceDesc = `Trasa VIP (${vipName}): ${start} ➔ ${end}`;
    
    activeShift.tr.unshift({
        id: Date.now(),
        t: dObj.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'}),
        v: parseFloat(window.dQV.toFixed(2)),
        p: 'Gotówka',
        plat: 'Wycena (Mapy)',
        src: sourceDesc,
        km: parseFloat((window.dQK || 0).toFixed(1))
    });
    
    window.save();
    
    if(window.sysAlert) {
        window.sysAlert("Zaksięgowano!", "Kurs wylądował na Twojej aktywnej zmianie. Zostaniesz przeniesiony.", "success");
        setTimeout(() => { window.switchTab('term'); }, 1500);
    } else {
        alert("Zaksięgowano kurs!");
        window.switchTab('term');
    }
};
