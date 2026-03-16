// ==========================================
// PLIK: taxi_logic.js - "Mózg" Panelu Kierowcy
// ==========================================

window.dShowOff = window.dShowOff || false;

// 🔥 Zabezpieczenie przed amnezją zmiany po odświeżeniu (F5)
window.dSessionInit = function() {
    if (!window.db.drv) return;
    if (window.db.drv.sh && window.db.drv.sh.on && window.db.role === 'drv' && window.db.tab === 'term') {
        if(!window.clockInt) {
            window.clockInt = setInterval(()=>{ 
                if(window.db.role==='drv' && window.db.tab==='term' && window.db.drv.sh.on) window.render(); 
            }, 60000);
        }
    }
};

window.dTC = function(t,v) { 
    if(t==='s') { window.dTSrc=v; if(v==='Inna') window.dOtherSrc=''; } 
    else { window.dTPay=v; } 
    window.render(); 
};

window.toggleShiftPause = function() { 
    if(!window.db.drv.sh.sPS) { window.db.drv.sh.sPS = Date.now(); } 
    else { window.db.drv.sh.sPT = (window.db.drv.sh.sPT||0) + (Date.now() - window.db.drv.sh.sPS); window.db.drv.sh.sPS = null; } 
    window.save(); window.render(); 
};

window.toggleRideWait = function() { 
    if(!window.db.drv.sh.rWS) { window.db.drv.sh.rWS = Date.now(); } 
    else { window.db.drv.sh.rWT = (window.db.drv.sh.rWT||0) + (Date.now() - window.db.drv.sh.rWS); window.db.drv.sh.rWS = null; } 
    window.save(); window.render(); 
};

window.startLiveRide = function() { 
    window.db.drv.liveRideStart = Date.now(); 
    window.save(); window.render(); 
};

window.stopLiveRide = function() {
    let t = Date.now() - window.db.drv.liveRideStart;
    if(window.db.drv.sh.rWS) { window.db.drv.sh.rWT = (window.db.drv.sh.rWT||0) + (Date.now() - window.db.drv.sh.rWS); window.db.drv.sh.rWS = null; }
    let m = Math.max(1, Math.round(t/60000));
    let wM = (window.db.drv.sh.rWT||0)/60000;
    let wC = (wM/60) * window.db.drv.q.w;
    window.db.drv.liveRideStart = null; 
    window.db.drv.sh.rWT = 0;
    window.save(); window.render();
    
    setTimeout(() => {
        let iM = document.getElementById('dt-m');
        let iV = document.getElementById('dt-v');
        if(iM) { iM.value = m; iM.classList.add('highlight-input'); setTimeout(() => iM.classList.remove('highlight-input'), 1500); }
        if(iV && wC > 0) { let cV = parseFloat(iV.value) || 0; iV.value = (cV + wC).toFixed(2); iV.classList.add('highlight-input'); setTimeout(() => iV.classList.remove('highlight-input'), 1500); }
        if(iV) iV.focus(); 
    }, 50);
};

window.calculateRouteAuto = async function() {
    let start = document.getElementById('dq-start').value, end = document.getElementById('dq-end').value;
    if(!start||!end) { if(window.sysAlert) return window.sysAlert("Błąd", "Podaj adres startowy i docelowy!"); return; }
    
    let defCity = window.db.drv.cfg.defCity || 'Szczecin';
    let sQ = start.toLowerCase().includes(defCity.toLowerCase()) ? start : start + ', ' + defCity;
    let eQ = end.toLowerCase().includes(defCity.toLowerCase()) ? end : end + ', ' + defCity;
    let btn = document.querySelector('button[onclick="window.calculateRouteAuto()"]');
    let origBtnText = btn ? btn.innerText : '';
    if(btn) { btn.innerText="⏳ OBLICZANIE..."; btn.style.opacity=0.7; }
    
    try {
        let resS = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(sQ)}`);
        let dataS = await resS.json();
        let resE = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(eQ)}`);
        let dataE = await resE.json();
        
        if(!dataS.length || !dataE.length) {
            if(btn) { btn.innerText = origBtnText; btn.style.opacity = 1; }
            if(window.sysAlert) return window.sysAlert("Błąd Mapy", "Nie odnaleziono adresu."); return;
        }
        
        let routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${dataS[0].lon},${dataS[0].lat};${dataE[0].lon},${dataE[0].lat}?overview=full&geometries=geojson`);
        let routeData = await routeRes.json();
        let distKm = routeData.routes[0].distance/1000, timeMin = routeData.routes[0].duration/60;
        
        document.getElementById('map-container').style.display='block';
        if(!window.lmap) {
            window.lmap = L.map('map').setView([dataS[0].lat, dataS[0].lon], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(window.lmap);
        }
        window.lmap.invalidateSize();
        if(window.routeLayer) window.lmap.removeLayer(window.routeLayer);
        window.routeLayer = L.geoJSON(routeData.routes[0].geometry, {style: {color:'#d946ef', weight:6}}).addTo(window.lmap);
        window.lmap.fitBounds(window.routeLayer.getBounds(), {padding:[20,20]});
        
        window.dQK = distKm; window.dQM_T = Math.round(timeMin);
        document.getElementById('res-km').innerText = distKm.toFixed(1) + ' km';
        document.getElementById('res-min').innerText = window.dQM_T + ' min';
        
        let isOut = !end.toLowerCase().includes(defCity.toLowerCase());
        let slider = document.getElementById('zone-slider');
        slider.max = distKm.toFixed(1);
        if(isOut) { slider.value = Math.min(10, distKm); document.getElementById('zone-split').style.display='block'; } 
        else { slider.value = distKm.toFixed(1); document.getElementById('zone-split').style.display='none'; }
        
        window.updateZoneSplit();
    } catch(e) {
        if(window.sysAlert) window.sysAlert("Błąd Serwera", "Błąd połączenia z mapami.");
    } finally {
        if(btn) { btn.innerText = origBtnText; btn.style.opacity = 1; }
    }
};

window.updateZoneSplit = function() {
    let slider = document.getElementById('zone-slider');
    let inDist = parseFloat(slider.value);
    let outDist = parseFloat(slider.max) - inDist;
    document.getElementById('val-in').innerText = inDist.toFixed(1);
    document.getElementById('val-out').innerText = outDist.toFixed(1);
    window.updateRoutePrice(inDist, outDist);
};

window.updateRoutePrice = function(inDist = null, outDist = null) {
    if(inDist === null) {
        let slider = document.getElementById('zone-slider');
        inDist = parseFloat(slider.value);
        outDist = parseFloat(slider.max) - inDist;
    }
    let q = window.db.drv.q;
    let discSel = document.getElementById('dq-c');
    let disc = (discSel && discSel.selectedIndex > 0) ? parseFloat(discSel.options[discSel.selectedIndex].getAttribute('data-d')) : 0;
    
    let expectedTime = (window.dQK / 20) * 60;
    let trafficTime = Math.max(0, window.dQM_T - expectedTime);
    
    let base = q.s + (inDist * (window.dQN ? q.t2 : q.t1)) + (outDist * (window.dQN ? q.t4 : q.t3)) + (trafficTime * (q.w / 60));
    window.dQV = base - (base * (disc / 100));
    
    document.getElementById('dqt').innerText = window.dQV.toFixed(2) + " zł";
};

window.calcFuelioStats = function() {
    let l = window.db.drv.fuel, s = {l1:0, c1:0, ck: window.db.drv.cfg.fuelPx};
    if(l.length >= 2) {
        let lF = l.findIndex(x => x.isF === 1);
        if(lF !== -1) {
            let pF = l.findIndex((x,i) => i > lF && x.isF === 1);
            if(pF !== -1) {
                let d = l[lF].o - l[pF].o;
                if(d > 0) {
                    let tL=0, tC=0;
                    for(let i=lF; i<pF; i++) { tL += l[i].l; tC += l[i].v; }
                    s.l1 = (tL/d)*100; s.c1 = (tC/d)*100; s.ck = tC/d;
                    window.db.drv.cfg.fuelPx = s.ck; window.save();
                }
            }
        }
    }
    return s;
};
