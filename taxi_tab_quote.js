// ==========================================
// PLIK: taxi_tab_quote.js - Asystent Wyceny i Taksometr Premium
// ==========================================

window.rDrvQuote = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;

        let q = d.q || {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8};
        let act = '';

        // Baner PRO dla Wyceny (Mapa AI)
        let alertCodeQuote = "if(window.sysAlert) window.sysAlert('Mapa AI PRO', 'W wersji PRO nie musisz nic wpisywać! Wpisz adres, a AI samo sprawdzi natężenie ruchu i poda klientowi najdokładniejszą cenę. 🗺️🚀', 'info')";

        let proBannerQuote = '<div class="pro-teaser-panel" style="margin: 0 0 25px 0; padding: 20px; background: linear-gradient(135deg, #130a1c 0%, #000000 100%); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="' + alertCodeQuote + '">' +
            '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #0ea5e9, #d946ef); box-shadow: 2px 0 12px rgba(14,165,233,0.6);"></div>' +
            '<div style="position: absolute; top: 12px; right: 12px; background: #0ea5e9; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>' +
            '<div style="display: flex; align-items: center; gap: 15px;">' +
                '<div style="font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(14,165,233,0.4));">🗺️✨</div>' +
                '<div style="text-align: left;">' +
                    '<h4 style="color: #0ea5e9; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Inteligentna Mapa AI</h4>' +
                    '<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Automatyczna Trasa:</b> Kilometry liczą się same.<br>✅ <b>Traffic AI:</b> Uwzględnia korki w mieście!</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // --- BUDOWA INTERFEJSU WYCENY ---
        act += '<div style="padding:0 15px;">';
        act += proBannerQuote;

        // Sekcja: Szybki Kalkulator (Taksometr)
        act += '<div class="panel" style="padding:25px 20px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:20px;">' +
            '<div style="text-align:center; margin-bottom:20px;">' +
                '<span style="font-size:0.7rem; color:rgba(255,255,255,0.3); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">KALKULATOR KURSU (TAKSOMETR)</span>' +
            '</div>' +

            '<div style="background:#000; border-radius:20px; padding:25px 15px; text-align:center; border:1px inset rgba(255,255,255,0.05); box-shadow:inset 0 4px 20px rgba(0,0,0,0.5); margin-bottom:20px;">' +
                '<div id="quote-result" style="font-size:4rem; font-weight:900; color:#10b981; letter-spacing:-2px; line-height:1; text-shadow:0 0 20px rgba(16,185,129,0.4);">0.00</div>' +
                '<div style="font-size:0.9rem; color:rgba(255,255,255,0.4); font-weight:700; margin-top:8px;">PRZEWIDYWANA CENA (ZŁ)</div>' +
            '</div>' +

            '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                '<div class="inp-group" style="margin:0;"><label style="font-size:0.6rem; color:var(--muted); font-weight:800; margin-bottom:6px; display:block;">DYSTANS (KM)</label><input type="number" id="q-km" placeholder="0.0" oninput="window.calcQuote()" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:1.1rem; font-weight:700; width:100%; box-sizing:border-box; outline:none;"></div>' +
                '<div class="inp-group" style="margin:0;"><label style="font-size:0.6rem; color:var(--muted); font-weight:800; margin-bottom:6px; display:block;">CZAS (MIN)</label><input type="number" id="q-min" placeholder="0" oninput="window.calcQuote()" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:1.1rem; font-weight:700; width:100%; box-sizing:border-box; outline:none;"></div>' +
            '</div>' +

            '<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; margin-bottom:15px;">' +
                '<div class="chip active" id="q-t1" style="flex:1; text-align:center; padding:12px; border-radius:14px; background:rgba(14,165,233,0.1); color:#0ea5e9; border:1px solid #0ea5e9; font-weight:800; cursor:pointer;" onclick="window.setTariff(1)">T1</div>' +
                '<div class="chip" id="q-t2" style="flex:1; text-align:center; padding:12px; border-radius:14px; background:rgba(255,255,255,0.02); color:rgba(255,255,255,0.3); border:1px solid transparent; font-weight:800; cursor:pointer;" onclick="window.setTariff(2)">T2</div>' +
                '<div class="chip" id="q-t3" style="flex:1; text-align:center; padding:12px; border-radius:14px; background:rgba(255,255,255,0.02); color:rgba(255,255,255,0.3); border:1px solid transparent; font-weight:800; cursor:pointer;" onclick="window.setTariff(3)">T3</div>' +
                '<div class="chip" id="q-t4" style="flex:1; text-align:center; padding:12px; border-radius:14px; background:rgba(255,255,255,0.02); color:rgba(255,255,255,0.3); border:1px solid transparent; font-weight:800; cursor:pointer;" onclick="window.setTariff(4)">T4</div>' +
            '</div>' +
            
            '<button class="btn" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); padding:16px; border-radius:16px; width:100%; font-weight:700; font-size:0.85rem;" onclick="window.resetQuote()">WYCZYŚĆ KALKULATOR</button>' +
        '</div>';

        // Sekcja: Informacje o Twoich stawkach
        act += '<div class="panel" style="padding:20px; border-radius:24px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);">' +
            '<div style="font-size:0.65rem; color:var(--muted); font-weight:800; margin-bottom:12px; text-transform:uppercase; letter-spacing:1px;">Twoje aktualne stawki:</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.8rem; color:#fff; font-weight:600;">' +
                '<div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:10px;">Wejście: '+Number(q.s).toFixed(2)+' zł</div>' +
                '<div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:10px;">Postój: '+Number(q.w).toFixed(2)+' zł/h</div>' +
                '<div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:10px;">T1: '+Number(q.t1).toFixed(2)+' zł</div>' +
                '<div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:10px;">T2: '+Number(q.t2).toFixed(2)+' zł</div>' +
            '</div>' +
            '<div style="margin-top:15px; text-align:center;"><span style="font-size:0.6rem; color:rgba(255,255,255,0.3); text-decoration:underline; cursor:pointer;" onclick="window.switchTab(\'set\')">Zmień stawki w ustawieniach ⚙️</span></div>' +
        '</div>';

        act += '</div>'; // Koniec paddingu 15px

        appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;

    } catch(err) {
        console.error(err);
        appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd (taxi_tab_quote.js)</h3><p style="color:#ef4444;">' + err.message + '</p></div>';
    }
};

// --- LOGIKA KALKULATORA ---
window.currentTariff = 1;
window.setTariff = function(num) {
    window.currentTariff = num;
    for(let i=1; i<=4; i++) {
        let el = document.getElementById('q-t'+i);
        if(el) {
            if(i === num) {
                el.style.background = 'rgba(14,165,233,0.1)';
                el.style.color = '#0ea5e9';
                el.style.borderColor = '#0ea5e9';
            } else {
                el.style.background = 'rgba(255,255,255,0.02)';
                el.style.color = 'rgba(255,255,255,0.3)';
                el.style.borderColor = 'transparent';
            }
        }
    }
    window.calcQuote();
};

window.calcQuote = function() {
    let km = parseFloat(document.getElementById('q-km').value) || 0;
    let min = parseFloat(document.getElementById('q-min').value) || 0;
    let q = window.db.drv.q || {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8};
    
    let rate = q['t' + window.currentTariff] || q.t1;
    let result = q.s + (km * rate) + (min * (q.w / 60));
    
    let resEl = document.getElementById('quote-result');
    if(resEl) resEl.innerHTML = result.toFixed(2);
};

window.resetQuote = function() {
    document.getElementById('q-km').value = '';
    document.getElementById('q-min').value = '';
    window.setTariff(1);
    window.calcQuote();
};
