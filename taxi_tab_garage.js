// ==========================================
// PLIK: taxi_tab_garage.js - Garaż, Serwis i Paliwo
// ==========================================

window.rDrvGarage = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;

        let act = '';
        let today = window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0];

        let alertCodeOCR = "if(window.sysAlert) window.sysAlert('Skaner OCR PRO', 'W wersji PRO nie musisz ręcznie wpisywać kwot! Zrób zdjęcie paragonu ze stacji lub warsztatu, a Sztuczna Inteligencja sama rozpozna cenę. 📸🚀', 'info')";
        let ocrTeaser = '<div class="pro-teaser-panel" style="margin: 0 0 25px 0; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #000000 100%); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="' + alertCodeOCR + '">' +
            '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #0ea5e9, #a855f7); box-shadow: 2px 0 12px rgba(14,165,233,0.6);"></div>' +
            '<div style="position: absolute; top: 12px; right: 12px; background: #0ea5e9; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>' +
            '<div style="display: flex; align-items: center; gap: 15px;">' +
                '<div style="font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(14,165,233,0.4));">📸✨</div>' +
                '<div style="text-align: left;">' +
                    '<h4 style="color: #0ea5e9; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Skaner OCR & Raporty</h4>' +
                    '<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Błyskawiczne rozliczanie paragonów.</b></div>' +
                '</div>' +
            '</div>' +
        '</div>';

        act += '<div style="padding:0 15px;">';
        act += ocrTeaser;

        // FORMULARZ TANKOWANIA
        act += '<div class="panel" style="padding:25px 20px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(245,158,11,0.2); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:20px;">' +
            '<div style="text-align:center; margin-bottom:20px;"><span style="font-size:0.7rem; color:rgba(255,255,255,0.3); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">DODAJ TANKOWANIE</span></div>' +
            '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                '<div class="inp-group" style="margin:0; flex:1.5;"><label style="font-size:0.6rem; color:#f59e0b; font-weight:800; margin-bottom:6px; display:block;">KOSZT (ZŁ)</label><input type="number" id="f-val" placeholder="0.00" style="background:#000; border:1px solid rgba(245,158,11,0.3); color:#f59e0b; border-radius:14px; padding:16px; text-align:center; font-size:1.4rem; font-weight:900; width:100%; box-sizing:border-box; outline:none;"></div>' +
                '<div class="inp-group" style="margin:0; flex:1;"><label style="font-size:0.6rem; color:var(--muted); font-weight:800; margin-bottom:6px; display:block;">DATA</label><input type="date" id="f-date" value="'+today+'" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; font-size:0.8rem; width:100%; box-sizing:border-box; outline:none;"></div>' +
            '</div>' +
            '<button class="btn" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; padding:18px; border-radius:18px; font-weight:900; font-size:1.05rem; letter-spacing:1px; border:none; box-shadow:0 8px 25px rgba(245,158,11,0.35); width:100%; outline:none;" onclick="if(window.dSaveFuel) window.dSaveFuel()">ZAPISZ TANKOWANIE</button>' +
        '</div>';

        // FORMULARZ SERWISU / WYDATKÓW
        act += '<div class="panel" style="padding:25px 20px; border-radius:28px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(239,68,68,0.2); box-shadow:0 15px 40px rgba(0,0,0,0.6); margin-bottom:25px;">' +
            '<div style="text-align:center; margin-bottom:20px;"><span style="font-size:0.7rem; color:rgba(255,255,255,0.3); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">KOSZTY EKSPLOATACYJNE</span></div>' +
            '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                '<div class="inp-group" style="margin:0; flex:1;"><label style="font-size:0.6rem; color:#ef4444; font-weight:800; margin-bottom:6px; display:block;">KOSZT (ZŁ)</label><input type="number" id="e-val" placeholder="0.00" style="background:#000; border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:14px; padding:16px; text-align:center; font-size:1.2rem; font-weight:900; width:100%; box-sizing:border-box; outline:none;"></div>' +
                '<div class="inp-group" style="margin:0; flex:1;"><label style="font-size:0.6rem; color:var(--muted); font-weight:800; margin-bottom:6px; display:block;">DATA</label><input type="date" id="e-date" value="'+today+'" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; font-size:0.8rem; width:100%; box-sizing:border-box; outline:none;"></div>' +
            '</div>' +
            '<div class="inp-group" style="margin-bottom:20px;"><input type="text" id="e-desc" placeholder="Opis (np. Myjnia, Płyn, Klocki)" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; font-size:0.9rem; font-weight:700; width:100%; outline:none; box-sizing:border-box;"></div>' +
            '<button class="btn" style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; padding:18px; border-radius:18px; font-weight:900; font-size:1.05rem; letter-spacing:1px; border:none; box-shadow:0 8px 25px rgba(239,68,68,0.35); width:100%; outline:none;" onclick="if(window.dSaveExp) window.dSaveExp()">DODAJ WYDATEK</button>' +
        '</div>';

        // HISTORIA WYDATKÓW
        act += '<div style="margin: 30px 5px 15px 5px; text-align: center;"><span style="font-size:0.75rem; color:rgba(255,255,255,0.3); font-weight:800; letter-spacing:1.5px; text-transform:uppercase;">OSTATNIE WPISY Z GARAŻU</span></div>';

        let expenses = d.exp || [];
        if(expenses.length > 0) {
            for(let i=0; i<expenses.length; i++) {
                let ex = expenses[i];
                let icon = '🔧', color = '#ef4444';
                if(ex.ty === 'f') { icon = '⛽'; color = '#f59e0b'; }
                
                act += '<div class="log-item" style="border:none; padding:16px; margin-bottom:12px; background:rgba(255,255,255,0.03); border-radius:20px; border-left:4px solid '+color+'; display:flex; align-items:center; gap:15px;">' +
                    '<div style="font-size:1.5rem; width:45px; height:45px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:12px; display:flex; align-items:center; justify-content:center;">'+icon+'</div>' +
                    '<div style="flex:1;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                            '<strong style="font-size:1.1rem; color:#fff; font-weight:800;">'+Number(ex.v).toFixed(2)+' zł</strong>' +
                            '<span style="font-size:0.7rem; color:rgba(255,255,255,0.4); font-weight:700;">'+ex.dt+'</span>' +
                        '</div>' +
                        '<div style="font-size:0.75rem; color:var(--muted); font-weight:600; margin-top:2px;">'+ex.d+'</div>' +
                    '</div>' +
                    '<button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; border-radius:10px; padding:8px 12px; cursor:pointer; outline:none;" onclick="if(typeof window.dDelExp===\'function\') window.dDelExp('+ex.id+')">🗑️</button>' +
                '</div>';
            }
        } else {
            act += '<div style="text-align:center;color:rgba(255,255,255,0.3);padding:40px 20px;font-size:0.85rem; background:rgba(0,0,0,0.2); border-radius:24px; border:1px dashed rgba(255,255,255,0.05); font-weight:600;">Garaż jest pusty.</div>';
        }

        act += '</div>'; 
        appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;

    } catch(err) {
        console.error(err);
    }
};

window.dSaveFuel = function() {
    let v = parseFloat(document.getElementById('f-val').value);
    let dt = document.getElementById('f-date').value;
    if(isNaN(v) || v <= 0) { if(window.sysAlert) window.sysAlert("Błąd", "Wprowadź poprawną kwotę!", "error"); return; }
    
    let dObj = dt ? new Date(dt) : new Date();
    dObj.setHours(12,0,0);

    if(!window.db.drv.exp) window.db.drv.exp = [];
    window.db.drv.exp.unshift({
        id: Date.now(), ty: 'f', v: v, dt: dObj.toLocaleDateString('pl-PL'), rD: dObj.toISOString(), d: '⛽ Tankowanie'
    });
    
    if(typeof window.save === 'function') window.save();
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Zapisano!", "Paliwo dodane do garażu.", "success");
};

window.dSaveExp = function() {
    let v = parseFloat(document.getElementById('e-val').value);
    let dt = document.getElementById('e-date').value;
    let desc = document.getElementById('e-desc').value || 'Serwis/Części';
    
    if(isNaN(v) || v <= 0) { if(window.sysAlert) window.sysAlert("Błąd", "Wprowadź poprawną kwotę!", "error"); return; }
    
    let dObj = dt ? new Date(dt) : new Date();
    dObj.setHours(12,0,0);

    if(!window.db.drv.exp) window.db.drv.exp = [];
    window.db.drv.exp.unshift({
        id: Date.now(), ty: 'e', v: v, dt: dObj.toLocaleDateString('pl-PL'), rD: dObj.toISOString(), d: desc
    });
    
    if(typeof window.save === 'function') window.save();
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Zapisano!", "Koszt eksploatacyjny został dodany.", "success");
};
