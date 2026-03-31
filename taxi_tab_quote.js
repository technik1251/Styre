// ==========================================
// PLIK: taxi_tab_quote.js - Prawdziwy Asystent Wyceny (Leaflet + OSRM)
// ==========================================

window.rDrvQuote = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;

        // Resetowanie globalnych zmiennych mapy
        window.qMapInstance = null;
        window.qRouteLayer = null;
        window.qCurrentDist = 0;
        window.qCurrentTime = 0;
        window.qTariffMode = 'day'; // 'day' lub 'night'

        let act = '';

        // NAGŁÓWEK
        act += '<div style="text-align:center; padding-top:30px; padding-bottom:10px;">';
        act += '<span style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:800; letter-spacing:2px; text-transform:uppercase;">Asystent Wyceny</span>';
        act += '<h1 style="margin:5px 0 20px 0; font-size:3.5rem; font-weight:900; letter-spacing:-1.5px; background: linear-gradient(135deg, #d946ef, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter:drop-shadow(0 0 15px rgba(217,70,239,0.3));">Taksometr</h1>';
        act += '</div>';

        act += '<div style="padding:0 15px;">';

        // FORMULARZ ADRESÓW
        act += '<div class="panel" style="padding:25px 20px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:20px;">';
        
        act += '<div style="margin-bottom:20px;">';
        act += '<label style="font-size:0.7rem; color:#10b981; font-weight:800; display:flex; align-items:center; gap:8px; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;"><div style="width:10px; height:10px; background:#10b981; border-radius:50%; box-shadow:0 0 8px #10b981;"></div> ADRES POCZĄTKOWY</label>';
        act += '<input type="text" id="qa-start" placeholder="np. Dworzec Główny, Szczecin" style="width:100%; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); color:#fff; padding:18px; border-radius:16px; font-size:1.05rem; font-weight:700; outline:none; box-sizing:border-box;">';
        act += '</div>';

        act += '<div style="margin-bottom:25px;">';
        act += '<label style="font-size:0.7rem; color:#ef4444; font-weight:800; display:flex; align-items:center; gap:8px; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;"><div style="width:10px; height:10px; background:#ef4444; border-radius:50%; box-shadow:0 0 8px #ef4444;"></div> ADRES DOCELOWY</label>';
        act += '<input type="text" id="qa-end" placeholder="np. Mickiewicza 12, Szczecin" style="width:100%; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); color:#fff; padding:18px; border-radius:16px; font-size:1.05rem; font-weight:700; outline:none; box-sizing:border-box;">';
        act += '</div>';

        act += '<button id="btn-calc-route" class="btn" style="width:100%; background:linear-gradient(135deg, #d946ef, #a855f7); color:#fff; padding:20px; border-radius:20px; font-weight:900; font-size:1.1rem; letter-spacing:1px; border:none; box-shadow:0 10px 30px rgba(217,70,239,0.4); outline:none; cursor:pointer;" onclick="window.qFindRoute()">🔍 WYZNACZ TRASĘ I CENĘ</button>';
        act += '</div>';

        // --- BANER PRO (MAPA AI) ---
        let alertCodeQuote = "if(window.sysAlert) window.sysAlert('Mapa AI PRO', 'W wersji PRO wpisujesz adres, a AI samo sprawdza natężenie ruchu (korki) i podaje klientowi co do grosza najdokładniejszą cenę. 🗺️🚀', 'info')";

        let proBannerQuote = '<div class="pro-teaser-panel" style="margin: 0 0 25px 0; padding: 25px 20px; background: linear-gradient(145deg, #130a1c, #09090b); border: 1px solid rgba(217, 70, 239, 0.2); border-radius: 28px; text-align:center; position: relative; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="' + alertCodeQuote + '">';
        proBannerQuote += '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #d946ef, #0ea5e9); box-shadow: 2px 0 12px rgba(217,70,239,0.6);"></div>';
        proBannerQuote += '<div style="position: absolute; top: 12px; right: 12px; background: #d946ef; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>';
        proBannerQuote += '<div style="font-size:2.8rem; margin-bottom:12px; filter:drop-shadow(0 0 15px rgba(217,70,239,0.4));">🗺️✨</div>';
        proBannerQuote += '<h3 style="color:#d946ef; margin:0 0 8px 0; font-size:1.15rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Mapa AI & Import Tras</h3>';
        proBannerQuote += '<p style="color:rgba(255,255,255,0.5); font-size:0.85rem; margin:0; font-weight:600; line-height:1.5;">Zwiększ zyski i oszczędź czas - tylko w wersji PRO! Kliknij po info.</p>';
        proBannerQuote += '</div>';

        act += proBannerQuote;


        // SEKCJA WYNIKÓW (UKRYTA DOMYŚLNIE)
        act += '<div id="q-results" style="display:none; animation:fadeIn 0.5s ease;">';
        
        act += '<div class="panel" style="padding:15px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:20px;">';
        act += '<div id="q-map" style="width:100%; height:200px; border-radius:16px; background:#2a2a35; margin-bottom:15px; z-index:1;"></div>';
        
        act += '<div style="display:flex; gap:10px; margin-bottom:15px;">';
        act += '<div style="flex:1; background:rgba(0,0,0,0.4); padding:15px; border-radius:16px; text-align:center; border:1px inset rgba(255,255,255,0.05);"><span style="display:block; font-size:0.6rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:5px;">DYSTANS</span><strong id="qr-dist" style="font-size:1.5rem; color:#fff; font-weight:900;">0.0 km</strong></div>';
        act += '<div style="flex:1; background:rgba(0,0,0,0.4); padding:15px; border-radius:16px; text-align:center; border:1px inset rgba(255,255,255,0.05);"><span style="display:block; font-size:0.6rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:5px;">CZAS JAZDY</span><strong id="qr-time" style="font-size:1.5rem; color:#fff; font-weight:900;">0 min</strong></div>';
        act += '</div>';

        // PRZEŁĄCZNIKI TARYF (Dzień / Noc)
        act += '<div style="display:flex; gap:10px; margin-bottom:20px;">';
        act += '<button id="q-btn-day" style="flex:1; padding:15px; border-radius:16px; background:linear-gradient(135deg, #3b82f6, #2563eb); color:#fff; font-weight:900; font-size:0.85rem; border:none; box-shadow:0 5px 15px rgba(59,130,246,0.4); cursor:pointer;" onclick="window.qSetTariff(\'day\')">DZIEŃ (T1/T3)</button>';
        act += '<button id="q-btn-night" style="flex:1; padding:15px; border-radius:16px; background:rgba(255,255,255,0.05); color:var(--muted); font-weight:800; font-size:0.85rem; border:1px solid rgba(255,255,255,0.1); cursor:pointer;" onclick="window.qSetTariff(\'night\')">NOC/ŚWIĘTO (T2/T4)</button>';
        act += '</div>';

        // SUWAK GRANICY MIASTA
        act += '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">';
        act += '<div style="text-align:center; font-size:0.75rem; color:#0ea5e9; font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px; display:flex; justify-content:center; align-items:center; gap:5px;"><span>🧮</span> PRZESUŃ DO GRANICY MIASTA</div>';
        act += '<input type="range" id="q-slider" min="0" max="100" value="100" style="width:100%; accent-color:#0ea5e9;" oninput="window.qUpdatePrice()">';
        act += '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--muted); font-weight:700; margin-top:8px;">';
        act += '<span id="q-lbl-t1">Strefa 1: 0.0 km</span><span id="q-lbl-t3">Strefa 2: 0.0 km</span>';
        act += '</div></div>';

        // WYNIK KOŃCOWY
        act += '<div style="background:#000; border-radius:20px; padding:20px; text-align:center; border:1px inset rgba(217,70,239,0.3); box-shadow:inset 0 4px 20px rgba(0,0,0,0.5);">';
        act += '<div style="font-size:0.7rem; color:var(--muted); font-weight:800; letter-spacing:2px; margin-bottom:5px;">SZACOWANA CENA</div>';
        act += '<div id="q-final-price" style="font-size:3.5rem; font-weight:900; color:#d946ef; font-family:monospace; text-shadow:0 0 20px rgba(217,70,239,0.4); line-height:1;">0.00 <span style="font-size:1.2rem; color:rgba(217,70,239,0.5);">zł</span></div>';
        act += '</div>';

        act += '</div></div>'; // Koniec sekcji wyników i paddingu

        appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;

    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd Mapy</h3><p style="color:#ef4444;">' + err.message + '</p></div>';
    }
};

// --- LOGIKA WYZNACZANIA TRASY (OSRM + NOMINATIM) ---
window.qFindRoute = async function() {
    let startAddr = document.getElementById('qa-start').value;
    let endAddr = document.getElementById('qa-end').value;
    let btn = document.getElementById('btn-calc-route');

    if(!startAddr || !endAddr) {
        if(window.sysAlert) window.sysAlert("Błąd", "Musisz wpisać adres początkowy i docelowy.", "error");
        return;
    }

    btn.innerHTML = "⏳ Wyszukiwanie...";
    btn.disabled = true;

    try {
        let startCoords = await window.qGeocode(startAddr);
        let endCoords = await window.qGeocode(endAddr);

        if(!startCoords || !endCoords) {
            throw new Error("Nie znaleziono jednego z adresów na mapie. Podaj miasto (np. 'Wiejska 2, Warszawa').");
        }

        let routeData = await window.qRoute(startCoords, endCoords);
        if(!routeData || !routeData.routes || routeData.routes.length === 0) {
            throw new Error("Nie udało się wyznaczyć trasy między tymi punktami.");
        }

        let route = routeData.routes[0];
        window.qCurrentDist = route.distance / 1000; 
        window.qCurrentTime = route.duration / 60; 
        let geometry = route.geometry;

        document.getElementById('q-results').style.display = 'block';
        document.getElementById('qr-dist').innerHTML = window.qCurrentDist.toFixed(1) + ' km';
        document.getElementById('qr-time').innerHTML = Math.round(window.qCurrentTime) + ' min';

        if(!window.qMapInstance) {
            window.qMapInstance = L.map('q-map', {zoomControl: false, attributionControl: false});
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(window.qMapInstance);
        }
        window.qMapInstance.invalidateSize(); 

        if(window.qRouteLayer) { window.qMapInstance.removeLayer(window.qRouteLayer); }
        let geojsonFeature = { "type": "LineString", "coordinates": geometry.coordinates };
        window.qRouteLayer = L.geoJSON(geojsonFeature, {
            style: { color: '#d946ef', weight: 5, opacity: 0.8 }
        }).addTo(window.qMapInstance);

        window.qMapInstance.fitBounds(window.qRouteLayer.getBounds(), {padding: [20, 20]});

        window.qUpdatePrice();

        btn.innerHTML = "🔍 WYZNACZ PONOWNIE";
        btn.disabled = false;

    } catch (error) {
        console.error(error);
        if(window.sysAlert) window.sysAlert("Błąd Trasy", error.message, "error");
        btn.innerHTML = "🔍 WYZNACZ TRASĘ I CENĘ";
        btn.disabled = false;
    }
};

window.qGeocode = async function(address) {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    let response = await fetch(url);
    let data = await response.json();
    if(data && data.length > 0) {
        return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
    return null;
};

window.qRoute = async function(start, end) {
    let url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
    let response = await fetch(url);
    return await response.json();
};

window.qSetTariff = function(mode) {
    window.qTariffMode = mode;
    let btnDay = document.getElementById('q-btn-day');
    let btnNight = document.getElementById('q-btn-night');

    if(mode === 'day') {
        btnDay.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        btnDay.style.color = '#fff';
        btnDay.style.border = 'none';
        btnDay.style.boxShadow = '0 5px 15px rgba(59,130,246,0.4)';
        
        btnNight.style.background = 'rgba(255,255,255,0.05)';
        btnNight.style.color = 'var(--muted)';
        btnNight.style.border = '1px solid rgba(255,255,255,0.1)';
        btnNight.style.boxShadow = 'none';
    } else {
        btnNight.style.background = 'linear-gradient(135deg, #6366f1, #4338ca)';
        btnNight.style.color = '#fff';
        btnNight.style.border = 'none';
        btnNight.style.boxShadow = '0 5px 15px rgba(99,102,241,0.4)';
        
        btnDay.style.background = 'rgba(255,255,255,0.05)';
        btnDay.style.color = 'var(--muted)';
        btnDay.style.border = '1px solid rgba(255,255,255,0.1)';
        btnDay.style.boxShadow = 'none';
    }
    window.qUpdatePrice();
};

window.qUpdatePrice = function() {
    let q = window.db.drv.q || {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8};
    let totalDist = window.qCurrentDist;
    
    let sliderVal = document.getElementById('q-slider').value;
    let pctCity = sliderVal / 100;
    
    let distCity = totalDist * pctCity;
    let distOutside = totalDist - distCity;

    document.getElementById('q-lbl-t1').innerHTML = 'Strefa 1: ' + distCity.toFixed(1) + ' km';
    document.getElementById('q-lbl-t3').innerHTML = 'Strefa 2: ' + distOutside.toFixed(1) + ' km';

    let rateCity = window.qTariffMode === 'day' ? q.t1 : q.t2;
    let rateOutside = window.qTariffMode === 'day' ? q.t3 : q.t4;

    let price = q.s + (distCity * rateCity) + (distOutside * rateOutside);
    let estWaitTime = window.qCurrentTime * 0.2; 
    price += estWaitTime * (q.w / 60);

    document.getElementById('q-final-price').innerHTML = price.toFixed(2) + ' <span style="font-size:1.2rem; color:rgba(217,70,239,0.5);">zł</span>';
};
