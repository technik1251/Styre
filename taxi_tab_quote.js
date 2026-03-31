// ==========================================
// PLIK: taxi_tab_quote.js - Mapa i Taksometr
// ==========================================

window.rDrvQuote = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;

        let act = '<div style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1;">' +
                  '<div id="quoteMap" style="width:100%; height:100%; background:#111116;"></div>' +
                  '</div>';

        // Luksusowa nakładka u dołu ekranu
        act += '<div style="position:absolute; bottom:90px; left:15px; right:15px; z-index:10; animation:fadeInUp 0.5s ease;">' +
               '<div class="panel" style="background:rgba(9, 9, 11, 0.85); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); border:1px solid rgba(14,165,233,0.3); border-radius:28px; padding:25px; box-shadow:0 20px 50px rgba(0,0,0,0.9); text-align:center;">' +
               '<div style="font-size:2.5rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(14,165,233,0.4));">🗺️</div>' +
               '<h3 style="color:#0ea5e9; margin:0 0 8px 0; font-size:1.3rem; font-weight:900; letter-spacing:-0.5px;">Mapa AI (Taksometr)</h3>' +
               '<p style="font-size:0.8rem; color:rgba(255,255,255,0.6); margin-bottom:20px; line-height:1.4;">Zaznacz punkt na mapie, a Sztuczna Inteligencja wytyczy trasę, sprawdzi korki i wyliczy cenę kursu dla pasażera.</p>' +
               '<button class="btn" style="width:100%; background:linear-gradient(135deg, #0ea5e9, #d946ef); color:#fff; font-weight:900; font-size:1.1rem; letter-spacing:1px; padding:18px; border-radius:20px; border:none; box-shadow:0 8px 25px rgba(14,165,233,0.4); outline:none; cursor:pointer;" onclick="if(window.sysAlert) window.sysAlert(\'Funkcja PRO\', \'Automatyczne wyznaczanie trasy (Routing) i integracja z Traffic AI zostanie odblokowana w wersji PRO! 🚀\', \'info\')">ODBLOKUJ MAPĘ PRO ✨</button>' +
               '</div></div>';

        appContainer.innerHTML = hdr + act + nav;

        // Odpalenie mapy po ułamku sekundy
        setTimeout(function() {
            if(window.qMap) { window.qMap.remove(); }
            window.qMap = L.map('quoteMap', {zoomControl: false, attributionControl: false}).setView([53.4285, 14.5528], 13);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(window.qMap);

            let marker = L.marker([53.4285, 14.5528]).addTo(window.qMap);
            marker.bindPopup('<b style="color:#0ea5e9;">Czekam na kurs!</b><br>Tryb PRO wyznaczy stąd trasę.').openPopup();
        }, 300);

    } catch(err) {
        console.error(err);
    }
};
