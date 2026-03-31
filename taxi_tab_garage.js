// ==========================================
// PLIK: taxi_tab_garage.js - Garaż, Tankowanie i Skaner OCR Premium
// ==========================================

window.rDrvGarage = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;

        let act = '';
        let today = window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0];

        // --- BANER PRO: INTELIGENTNY SKANER OCR ---
        let alertCodeOCR = "if(window.sysAlert) window.sysAlert('Skaner OCR PRO', 'W wersji PRO nie musisz ręcznie wpisywać kwot! Zrób zdjęcie paragonu, a Sztuczna Inteligencja sama rozpozna cenę, ilość litrów i datę tankowania. 📸🚀', 'info')";

        let ocrTeaser = '<div class="pro-teaser-panel" style="margin: 0 0 25px 0; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #000000 100%); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="' + alertCodeOCR + '">' +
            '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #0ea5e9, #a855f7); box-shadow: 2px 0 12px rgba(14,165,233,0.6);"></div>' +
            '<div style="position: absolute; top: 12px; right: 12px; background: #0ea5e9; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>' +
            '<div style="display: flex; align-items: center; gap: 15px;">' +
                '<div style="font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(14,165,233,0.4));">📸✨</div>' +
                '<div style="text-align: left;">' +
                    '<h4 style="color: #0ea5e9; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Skaner OCR & Raporty PDF</h4>' +
                    '<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Błyskawiczne rozliczanie kosztów.</b><br>✅ <b>Kliknij po więcej informacji.</b></div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // --- BUDOWA INTERFEJSU GARAŻU ---
        act += '<div style="padding:0 15px;">';
        act += ocrTeaser;

        // Sekcja: Formularz Tankowania
        act += '<div class="panel" style="padding:25px 20px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(245,158,11,0.2); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:25px;">' +
            '<div style="text-align:center; margin-bottom:20px;">' +
                '<span style="font-size:0.7rem; color:rgba(255,255,255,0.3); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">DODAJ NOWE TANKOWANIE</span>' +
            '</div>' +

            '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                '<div class="inp-group" style="margin:0; flex:1.5;"><label style="font-size:0.6rem; color:#f59e0b; font-weight:800; margin-bottom:6px; display:block;">KOSZT (ZŁ)</label><input type="number" id="f-val" placeholder="0.00" style="background:#000; border:1px solid rgba(245,158,11,0.3); color:#f59e0b; border-radius:14px; padding:16px; text-align:center; font-size:1.4rem; font-weight:900; width:100%; box-sizing:border-box; outline:none; text-shadow:0 0 10px rgba(245,158,11,0.3);"></div>' +
                '<div class="inp-group" style="margin:0; flex:1;"><label style="font-size:0.6rem; color:var(--muted); font-weight:800; margin-bottom:6px; display:block;">DATA</label><input type="date" id="f-date" value="'+today+'" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; font-size:0.8rem; width:100%; box-sizing:border-box; outline:none;"></div>' +
            '</div>' +

            '<div class="inp-row" style="margin-bottom:20px; gap:12px;">' +
                '<div class="inp-group" style="margin:0; flex:1.5;">' +
                    '<select id="f-type" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; font-size:0.9rem; font-weight:700; width:100%; outline:none; appearance:none;">' +
                        '<option value="pb">⛽ Benzyna (PB)</option>' +
                        '<option value="on">⛽ Diesel (ON)</option>' +
                        '<option value="lpg">⛽ Gaz (LPG)</option>' +
                        '<option value="ev">⚡ Prąd (EV)</option>' +
                    '</select>' +
                '</div>' +
                '<div class="inp-group" style="margin:0; flex:1; display:flex; align-items:center; justify-content:center;">' +
                    '<label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#fff; font-weight:800; cursor:pointer; background:rgba(255,255,255,0.03); padding:14px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); width:100%; box-sizing:border-box;">' +
                        '<input type="checkbox" id="f-full" checked style="accent-color:#f59e0b; width:18px; height:18px;"> DO PEŁNA' +
                    '</label>' +
                '</div>' +
            '</div>' +

            '<button class="btn" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; padding:18px; border-radius:18px; font-weight:900; font-size:1.05rem; letter-spacing:1px; border:none; box-shadow:0 8px 25px rgba(245,158,11,0.35); width:100%; outline:none;" onclick="if(typeof window.dSaveFuel===\'function\') window.dSaveFuel()">ZAPISZ TANKOWANIE</button>' +
        '</div>';

        // Sekcja: Historia Wydatków
        act += '<div style="margin: 30px 5px 15px 5px; text-align: center;"><span style="font-size:0.75rem; color:rgba(255,255,255,0.3); font-weight:800; letter-spacing:1.5px; text-transform:uppercase;">OSTATNIE WPISY Z GARAŻU</span></div>';

        let expenses = d.exp || [];
        if(expenses.length > 0) {
            for(let i=0; i<expenses.length; i++) {
                let ex = expenses[i];
                let icon = '🔧', color = '#0ea5e9';
                if(ex.ty === 'f') { icon = '⛽'; color = '#f59e0b'; }
                
                act += '<div class="log-item" style="border:none; padding:16px; margin-bottom:12px; background:rgba(255,255,255,0.03); border-radius:20px; border-left:4px solid '+color+'; display:flex; align-items:center; gap:15px;">' +
                    '<div style="font-size:1.5rem; width:45px; height:45px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:12px; display:flex; align-items:center; justify-content:center;">'+icon+'</div>' +
                    '<div style="flex:1;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                            '<strong style="font-size:1.1rem; color:#fff; font-weight:800;">'+Number(ex.v).toFixed(2)+' zł</strong>' +
                            '<span style="font-size:0.7rem; color:rgba(255,255,255,0.4); font-weight:700;">'+ex.dt+'</span>' +
                        '</div>' +
                        '<div style="font-size:0.75rem; color:var(--muted); font-weight:600; margin-top:2px;">'+ex.d+' '+(ex.full?'(Do pełna)':'')+'</div>' +
                    '</div>' +
                    '<button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; border-radius:10px; padding:8px 12px; cursor:pointer; outline:none;" onclick="if(typeof window.dDelExp===\'function\') window.dDelExp('+ex.id+')">🗑️</button>' +
                '</div>';
            }
        } else {
            act += '<div style="text-align:center;color:rgba(255,255,255,0.3);padding:40px 20px;font-size:0.85rem; background:rgba(0,0,0,0.2); border-radius:24px; border:1px dashed rgba(255,255,255,0.05); font-weight:600;">Garaż jest pusty. Dodaj pierwsze tankowanie powyżej.</div>';
        }

        act += '</div>'; // Koniec paddingu 15px

        appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;

    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd (taxi_tab_garage.js)</h3><p style="color:#ef4444;">' + err.message + '</p></div>';
        }
    }
};

// --- LOGIKA ZAPISU TANKOWANIA ---
window.dSaveFuel = function() {
    let valEl = document.getElementById('f-val');
    let dateEl = document.getElementById('f-date');
    let typeEl = document.getElementById('f-type');
    let fullEl = document.getElementById('f-full');

    let v = parseFloat(valEl.value);
    let dt = dateEl.value;
    let ty = typeEl.value;
    let full = fullEl.checked;

    if(!v || v <= 0) {
        if(window.sysAlert) window.sysAlert("Błąd", "Wprowadź kwotę tankowania!", "error");
        return;
    }

    if(!window.db.drv.exp) window.db.drv.exp = [];

    window.db.drv.exp.unshift({
        id: Date.now(),
        ty: 'f', // fueling
        v: v,
        dt: dt,
        rD: new Date(dt).toISOString(),
        d: 'Tankowanie ' + ty.toUpperCase(),
        full: full
    });

    // Czyścimy pola
    valEl.value = '';
    
    if(typeof window.save === 'function') window.save();
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Zapisano!", "Koszt paliwa dodany do garażu.", "success");
};

window.dDelExp = function(id) {
    if(window.sysConfirm) {
        window.sysConfirm("Usuń wpis", "Na pewno chcesz usunąć ten wydatek z historii?", function() {
            window.db.drv.exp = window.db.drv.exp.filter(x => x.id !== id);
            window.save();
            window.render();
        });
    }
};
