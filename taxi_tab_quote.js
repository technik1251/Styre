// ==========================================
// PLIK: taxi_tab_quote.js - Asystent Wyceny (Premium Pink Style)
// ==========================================

window.rDrvQuote = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;

        let act = '';

        // --- NAGŁÓWEK (ASYSTENT WYCENY) ---
        act += '<div style="text-align:center; padding-top:30px; padding-bottom:10px;">';
        act += '<span style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:800; letter-spacing:2px; text-transform:uppercase;">Asystent Wyceny</span>';
        act += '<h1 style="margin:5px 0 20px 0; font-size:3.5rem; font-weight:900; letter-spacing:-1.5px; background: linear-gradient(135deg, #d946ef, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter:drop-shadow(0 0 15px rgba(217,70,239,0.3));">Taksometr</h1>';
        act += '</div>';

        // --- GŁÓWNY PANEL (FORMULARZ ADRESÓW) ---
        act += '<div style="padding:0 15px;">';
        act += '<div class="panel" style="padding:25px 20px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:20px;">';
        
        // ADRES POCZĄTKOWY
        act += '<div style="margin-bottom:20px;">';
        act += '<label style="font-size:0.7rem; color:#10b981; font-weight:800; display:flex; align-items:center; gap:8px; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">' +
               '<div style="width:10px; height:10px; background:#10b981; border-radius:50%; box-shadow:0 0 8px #10b981;"></div> ADRES POCZĄTKOWY</label>';
        act += '<input type="text" placeholder="np. Dworzec Główny" style="width:100%; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); color:#fff; padding:18px; border-radius:16px; font-size:1.05rem; font-weight:700; outline:none; box-sizing:border-box; transition:all 0.3s;">';
        act += '</div>';

        // ADRES DOCELOWY
        act += '<div style="margin-bottom:25px;">';
        act += '<label style="font-size:0.7rem; color:#ef4444; font-weight:800; display:flex; align-items:center; gap:8px; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">' +
               '<div style="width:10px; height:10px; background:#ef4444; border-radius:50%; box-shadow:0 0 8px #ef4444;"></div> ADRES DOCELOWY</label>';
        act += '<input type="text" placeholder="np. Powstańców Warszawy 1" style="width:100%; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); color:#fff; padding:18px; border-radius:16px; font-size:1.05rem; font-weight:700; outline:none; box-sizing:border-box; transition:all 0.3s;">';
        act += '</div>';

        // PRZYCISK WYZNACZANIA
        act += '<button class="btn" style="width:100%; background:linear-gradient(135deg, #d946ef, #a855f7); color:#fff; padding:20px; border-radius:20px; font-weight:900; font-size:1.1rem; letter-spacing:1px; border:none; box-shadow:0 10px 30px rgba(217,70,239,0.4); outline:none; cursor:pointer;" onclick="if(window.sysAlert) window.sysAlert(\'Funkcja PRO\', \'Inteligentne wyznaczanie trasy i automatyczna wycena (Traffic AI) dostępne są w pełnej wersji PRO! 🚀\', \'info\')">🔍 WYZNACZ TRASĘ I CENĘ</button>';
        
        act += '</div>';

        // --- BANER PRO (MAPA AI) ---
        let alertCodeQuote = "if(window.sysAlert) window.sysAlert('Mapa AI PRO', 'W wersji PRO wpisujesz adres, a AI samo sprawdza natężenie ruchu (korki) i podaje klientowi co do grosza najdokładniejszą cenę. 🗺️🚀', 'info')";

        let proBannerQuote = '<div class="pro-teaser-panel" style="margin: 0 0 25px 0; padding: 25px 20px; background: linear-gradient(145deg, #130a1c, #09090b); border: 1px solid rgba(217, 70, 239, 0.2); border-radius: 28px; text-align:center; position: relative; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="' + alertCodeQuote + '">';
        proBannerQuote += '<div style="font-size:2.8rem; margin-bottom:12px; filter:drop-shadow(0 0 15px rgba(217,70,239,0.4));">🗺️</div>';
        proBannerQuote += '<h3 style="color:#d946ef; margin:0 0 8px 0; font-size:1.15rem; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Mapa AI & Import Tras</h3>';
        proBannerQuote += '<p style="color:rgba(255,255,255,0.5); font-size:0.85rem; margin:0; font-weight:600; line-height:1.5;">Zwiększ zyski i oszczędź czas - tylko w wersji PRO! Kliknij po info.</p>';
        proBannerQuote += '</div>';

        act += proBannerQuote;
        act += '</div>'; // koniec padding 15px

        appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;

    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd (taxi_tab_quote.js)</h3><p style="color:#ef4444;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; width:100%;" onclick="window.location.reload()">ODŚWIEŻ</button></div>';
        }
    }
};
