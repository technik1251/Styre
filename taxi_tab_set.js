
// ==========================================
// PLIK: taxi_tab_set.js - Zakładka Opcje (Akordeony Premium + Kawa)
// ==========================================

// --- FUNKCJA ZWIJANIA / ROZWIJANIA (AKORDEONY) ---
window.toggleAccordion = function(id) {
    let content = document.getElementById(id);
    let icon = document.getElementById(id + '-icon');
    let parent = document.getElementById(id + '-parent');
    
    if(content) {
        if(content.style.display === 'none') {
            content.style.display = 'block';
            if(icon) icon.innerHTML = '🔼';
            if(parent) parent.style.borderColor = 'rgba(14, 165, 233, 0.4)';
        } else {
            content.style.display = 'none';
            if(icon) icon.innerHTML = '🔽';
            if(parent) parent.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        }
    }
};

window.rDrvSet = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;

        let goal = (d.cfg && d.cfg.goal) ? d.cfg.goal : 350;
        let city = (d.cfg && d.cfg.defCity) ? d.cfg.defCity : 'Szczecin';
        let fuelSource = (d.cfg && d.cfg.fuelSource) ? d.cfg.fuelSource : 'garage';
        let fTypes = (d.cfg && d.cfg.fTypes) ? d.cfg.fTypes : ['pb']; 
        
        let mF = (d.cfg && d.cfg.mFuel) ? d.cfg.mFuel : {
            pb: {c: 7.0, p: 6.50},
            on: {c: 6.0, p: 6.00},
            lpg: {c: 10.0, p: 3.00},
            ev: {c: 15.0, p: 1.00}
        };
        
        let plat = d.plat || 'apps';
        let corpBaseC = (d.cfg && d.cfg.bC) ? d.cfg.bC : 0;
        let corpPeriod = (d.cfg && d.cfg.bPeriod) ? d.cfg.bPeriod : 'month';
        
        let carType = d.carType || 'rent';
        let carC = (d.cfg && d.cfg.cC) ? d.cfg.cC : 0;
        let carPer = (d.cfg && d.cfg.cType) ? d.cfg.cType : 'month';
        
        let emp = d.emp || 'partner';
        let empType = (d.cfg && d.cfg.eType) ? d.cfg.eType : 'flat';
        let empC = (d.cfg && d.cfg.eC) ? d.cfg.eC : 0;
        let empPct = (d.cfg && d.cfg.ePct) ? d.cfg.ePct * 100 : 0;
        let empPer = (d.cfg && d.cfg.ePeriod) ? d.cfg.ePeriod : 'week';
        
        let insC = (d.cfg && d.cfg.iC) ? d.cfg.iC : 0;
        let insPer = (d.cfg && d.cfg.iPeriod) ? d.cfg.iPeriod : 'month';
        let uC = (d.cfg && d.cfg.uC) ? d.cfg.uC : 0;
        let uType = (d.cfg && d.cfg.uType) ? d.cfg.uType : 'week';
        
        let tax = (d.cfg && d.cfg.tax) ? d.cfg.tax * 100 : 8.5;
        let cardF = (d.cfg && d.cfg.cardF) ? d.cfg.cardF * 100 : 1.5;
        let vouchF = (d.cfg && d.cfg.voucherF) ? d.cfg.voucherF * 100 : 0;

        let q = d.q || {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8};

        // Style dla inputów w opcjach (iOS Glass Style)
        let inpStyle = 'background:rgba(255,255,255,0.03); border-radius:14px; padding:16px; font-size:0.95rem; border:1px solid rgba(255,255,255,0.08); color:#fff; width:100%; box-sizing:border-box; outline:none; font-weight:700;';
        let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block;';

        let html = hdr + 
        '<div class="dash-hero" style="padding-bottom: 10px;">' +
            '<div style="width:70px; height:70px; background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); border-radius:24px; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:2.2rem; box-shadow:0 8px 25px rgba(0,0,0,0.4);">⚙️</div>' +
            '<h1 style="color:#0ea5e9; font-size:2.4rem; font-weight:900; letter-spacing:-1px; text-transform:uppercase; margin:0; text-shadow:0 0 15px rgba(14,165,233,0.3);">USTAWIENIA</h1>' +
            '<p style="margin-top:5px; font-size:0.75rem; color:rgba(255,255,255,0.4); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">Konfiguracja Twojego Profilu</p>' +
        '</div>' +
        '<div style="padding:0 15px;">';

        // --- ZAPOWIEDŹ PRO W USTAWIENIACH (Chmura i Profile) ---
        let proBannerSettings = '<div class="pro-teaser-panel" style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #130a1c 0%, #000000 100%); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="window.sysAlert && window.sysAlert(&quot;Chmura i Profile PRO&quot;, &quot;W wersji PRO Twoje dane będą bezpiecznie synchronizowane w chmurze! Dodatkowo będziesz mógł stworzyć kilka osobnych profili dla różnych samochodów lub flot. ☁️🚀&quot;, &quot;info&quot;)">' +
            '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #d946ef, #0ea5e9); box-shadow: 2px 0 12px rgba(217,70,239,0.6);"></div>' +
            '<div style="position: absolute; top: 12px; right: 12px; background: #d946ef; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>' +
            '<div style="display: flex; align-items: center; gap: 15px;">' +
                '<div style="font-size: 2.5rem; filter: drop-shadow(0 0 15px rgba(217,70,239,0.4));">☁️✨</div>' +
                '<div style="text-align: left;">' +
                    '<h4 style="color: #d946ef; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Chmura i Multi-Profile</h4>' +
                    '<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Backup AI:</b> Dane bezpieczne na serwerze.<br>✅ <b>Wiele aut:</b> Osobne statystyki dla flot!</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        html += proBannerSettings;

        // 1. TARYFIKATOR
        html += '<div id="acc-tar-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">' +
            '<div onclick="window.toggleAccordion(&quot;acc-tar&quot;)" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(217, 70, 239, 0.05);">' +
                '<strong style="color:#d946ef; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px; filter:drop-shadow(0 0 8px rgba(217,70,239,0.4));">🧮</span> Ustawienia Wyceny</strong>' +
                '<span id="acc-tar-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span>' +
            '</div>' +
            '<div id="acc-tar" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Opłata Początkowa (zł)</label><input type="number" id="q-cfg-s" value="'+q.s+'" style="'+inpStyle+' text-align:center; color:#d946ef;"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Postój (zł/h)</label><input type="number" id="q-cfg-w" value="'+q.w+'" style="'+inpStyle+' text-align:center; color:#d946ef;"></div>' +
                '</div>' +
                '<div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; margin-top:10px;">' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' text-align:center;">T1</label><input type="number" step="0.1" id="q-cfg-t1" value="'+q.t1+'" style="'+inpStyle+' text-align:center;"></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' text-align:center;">T2</label><input type="number" step="0.1" id="q-cfg-t2" value="'+q.t2+'" style="'+inpStyle+' text-align:center;"></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' text-align:center;">T3</label><input type="number" step="0.1" id="q-cfg-t3" value="'+q.t3+'" style="'+inpStyle+' text-align:center;"></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' text-align:center;">T4</label><input type="number" step="0.1" id="q-cfg-t4" value="'+q.t4+'" style="'+inpStyle+' text-align:center;"></div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // 2. PERSONALIZACJA I MIASTO
        html += '<div id="acc-pers-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">' +
            '<div onclick="window.toggleAccordion(&quot;acc-pers&quot;)" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(16, 185, 129, 0.05);">' +
                '<strong style="color:#10b981; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px; filter:drop-shadow(0 0 8px rgba(16,185,129,0.4));">👤</span> Personalizacja</strong>' +
                '<span id="acc-pers-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span>' +
            '</div>' +
            '<div id="acc-pers" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Twoje Imię</label><input type="text" id="us-name" value="'+(window.db.userName || '')+'" placeholder="np. Jan" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Cel dzienny (zł)</label><input type="number" id="us-goal" value="'+goal+'" style="'+inpStyle+' color:#10b981;"></div>' +
                '</div>' +
                '<div class="inp-group" style="margin:0;">' +
                    '<label style="'+lblStyle+'">Domyślne Miasto (Dla Map)</label>' +
                    '<input type="text" id="us-city" value="'+city+'" placeholder="np. Szczecin" style="'+inpStyle+'">' +
                '</div>' +
            '</div>' +
        '</div>';

        // 3. PALIWO
        let chk = function(val) { return fTypes.indexOf(val) !== -1 ? 'checked' : ''; };
        html += '<div id="acc-fuel-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">' +
            '<div onclick="window.toggleAccordion(&quot;acc-fuel&quot;)" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(245, 158, 11, 0.05);">' +
                '<strong style="color:#f59e0b; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px; filter:drop-shadow(0 0 8px rgba(245,158,11,0.4));">⛽</span> Koszty Paliwa</strong>' +
                '<span id="acc-fuel-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span>' +
            '</div>' +
            '<div id="acc-fuel" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-group" style="margin-bottom:20px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:20px;">' +
                    '<label style="'+lblStyle+' color:#f59e0b;">Jakimi paliwami zasilane jest auto?</label>' +
                    '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">' +
                        '<label style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); cursor:pointer; flex:1; min-width:40%; font-size:0.85rem; font-weight:700;">' +
                            '<input type="checkbox" id="cb-ftype-pb" value="pb" '+chk('pb')+' onchange="window.toggleManualFuelBoxes && window.toggleManualFuelBoxes()" style="accent-color:#f59e0b; width:18px; height:18px;"> Benzyna' +
                        '</label>' +
                        '<label style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); cursor:pointer; flex:1; min-width:40%; font-size:0.85rem; font-weight:700;">' +
                            '<input type="checkbox" id="cb-ftype-on" value="on" '+chk('on')+' onchange="window.toggleManualFuelBoxes && window.toggleManualFuelBoxes()" style="accent-color:#f59e0b; width:18px; height:18px;"> Diesel' +
                        '</label>' +
                        '<label style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); cursor:pointer; flex:1; min-width:40%; font-size:0.85rem; font-weight:700;">' +
                            '<input type="checkbox" id="cb-ftype-lpg" value="lpg" '+chk('lpg')+' onchange="window.toggleManualFuelBoxes && window.toggleManualFuelBoxes()" style="accent-color:#f59e0b; width:18px; height:18px;"> Gaz (LPG)' +
                        '</label>' +
                        '<label style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); cursor:pointer; flex:1; min-width:40%; font-size:0.85rem; font-weight:700;">' +
                            '<input type="checkbox" id="cb-ftype-ev" value="ev" '+chk('ev')+' onchange="window.toggleManualFuelBoxes && window.toggleManualFuelBoxes()" style="accent-color:#0ea5e9; width:18px; height:18px;"> Prąd (EV)' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="inp-group" style="margin-bottom:10px;">' +
                    '<label style="'+lblStyle+' color:#f59e0b;">Skąd brać dane o kosztach?</label>' +
                    '<select id="us-fuel-src" onchange="window.toggleManualFuelBoxes && window.toggleManualFuelBoxes()" style="'+inpStyle+' border-color:rgba(245,158,11,0.3);">' +
                        '<option value="garage" '+(fuelSource==='garage'?'selected':'')+'>Dziennik Garażu (Zalecane / Dokładne)</option>' +
                        '<option value="manual" '+(fuelSource==='manual'?'selected':'')+'>Z ryczałtu wpisanego poniżej</option>' +
                    '</select>' +
                '</div>' +
                '<div id="manual-fuel-wrapper" style="display:'+(fuelSource==='manual'?'block':'none')+'; margin-top:20px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:20px;">' +
                    '<p style="font-size:0.75rem; color:var(--muted); text-align:center; margin-bottom:15px; font-weight:600;">Podaj parametry dla zaznaczonych paliw. Apka zsumuje i wyliczy średni koszt na 1 KM.</p>' +
                    '<div id="mf-box-pb" style="display:'+(fTypes.indexOf('pb')!==-1?'block':'none')+'; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">' +
                        '<div style="color:#f59e0b; font-size:0.75rem; font-weight:800; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">⛽ Benzyna</div>' +
                        '<div class="inp-row" style="margin:0; gap:12px;">' +
                            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Spalanie (L/100km)</label><input type="number" step="0.1" id="mf-c-pb" value="'+mF.pb.c+'" style="'+inpStyle+' text-align:center;"></div>' +
                            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Cena (ZŁ/L)</label><input type="number" step="0.01" id="mf-p-pb" value="'+mF.pb.p+'" style="'+inpStyle+' text-align:center;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="mf-box-on" style="display:'+(fTypes.indexOf('on')!==-1?'block':'none')+'; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">' +
                        '<div style="color:#f59e0b; font-size:0.75rem; font-weight:800; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">⛽ Diesel</div>' +
                        '<div class="inp-row" style="margin:0; gap:12px;">' +
                            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Spalanie (L/100km)</label><input type="number" step="0.1" id="mf-c-on" value="'+mF.on.c+'" style="'+inpStyle+' text-align:center;"></div>' +
                            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Cena (ZŁ/L)</label><input type="number" step="0.01" id="mf-p-on" value="'+mF.on.p+'" style="'+inpStyle+' text-align:center;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="mf-box-lpg" style="display:'+(fTypes.indexOf('lpg')!==-1?'block':'none')+'; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">' +
                        '<div style="color:#f59e0b; font-size:0.75rem; font-weight:800; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">⛽ Gaz (LPG)</div>' +
                        '<div class="inp-row" style="margin:0; gap:12px;">' +
                            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Spalanie (L/100km)</label><input type="number" step="0.1" id="mf-c-lpg" value="'+mF.lpg.c+'" style="'+inpStyle+' text-align:center;"></div>' +
                            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Cena (ZŁ/L)</label><input type="number" step="0.01" id="mf-p-lpg" value="'+mF.lpg.p+'" style="'+inpStyle+' text-align:center;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="mf-box-ev" style="display:'+(fTypes.indexOf('ev')!==-1?'block':'none')+'; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">' +
                        '<div style="color:#0ea5e9; font-size:0.75rem; font-weight:800; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">⚡ Prąd (EV)</div>' +
                        '<div class="inp-row" style="margin:0; gap:12px;">' +
                            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Zużycie (kWh/100km)</label><input type="number" step="0.1" id="mf-c-ev" value="'+mF.ev.c+'" style="'+inpStyle+' text-align:center;"></div>' +
                            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Cena (ZŁ/kWh)</label><input type="number" step="0.01" id="mf-p-ev" value="'+mF.ev.p+'" style="'+inpStyle+' text-align:center;"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // 4. KOSZTY AUTA I BAZY
        html += '<div id="acc-car-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">' +
            '<div onclick="window.toggleAccordion(&quot;acc-car&quot;)" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(255,255,255,0.02);">' +
                '<strong style="color:var(--driver); font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px;">🚗</span> Koszty Auta i Bazy</strong>' +
                '<span id="acc-car-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span>' +
            '</div>' +
            '<div id="acc-car" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">System</label><input type="text" value="'+(plat==='apps'?'Aplikacje':'Korporacja')+'" disabled style="'+inpStyle+' background:rgba(0,0,0,0.3); color:var(--muted);"></div>' +
                    (plat === 'corp' ? 
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Baza (zł)</label><input type="number" id="us-bc" value="'+corpBaseC+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-b-period" style="'+inpStyle+'"><option value="week" '+(corpPeriod==='week'?'selected':'')+'>Tyg</option><option value="month" '+(corpPeriod==='month'?'selected':'')+'>M-c</option></select></div>' 
                    : '') +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Rodzaj Auta</label><input type="text" value="'+(carType==='own'?'Własne':carType==='lease'?'Leasing':'Wynajem')+'" disabled style="'+inpStyle+' background:rgba(0,0,0,0.3); color:var(--muted);"></div>' +
                    (carType !== 'own' ? 
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Rata (zł)</label><input type="number" id="us-cc" value="'+carC+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-ctype" style="'+inpStyle+'"><option value="week" '+(carPer==='week'?'selected':'')+'>Tyg</option><option value="month" '+(carPer==='month'?'selected':'')+'>M-c</option></select></div>' 
                    : '') +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:15px; padding-top:20px; border-top:1px dashed rgba(255,255,255,0.1); gap:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:2;"><label style="'+lblStyle+'">Księgowa / Inne (zł)</label><input type="number" id="us-uc" value="'+uC+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-utype" style="'+inpStyle+'"><option value="week" '+(uType==='week'?'selected':'')+'>Tyg</option><option value="month" '+(uType==='month'?'selected':'')+'>M-c</option></select></div>' +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:5px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:2;"><label style="'+lblStyle+'">ZUS Ubezp. Auto (zł)</label><input type="number" id="us-ic" value="'+insC+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-i-period" style="'+inpStyle+'"><option value="week" '+(insPer==='week'?'selected':'')+'>Tyg</option><option value="month" '+(insPer==='month'?'selected':'')+'>M-c</option></select></div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // 5. PODATKI I PROWIZJE PŁATNOŚCI
        html += '<div id="acc-tax-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:25px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">' +
            '<div onclick="window.toggleAccordion(&quot;acc-tax&quot;)" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(14,165,233,0.05);">' +
                '<strong style="color:#0ea5e9; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px; filter:drop-shadow(0 0 8px rgba(14,165,233,0.4));">⚖️</span> Podatki i Prowizje</strong>' +
                '<span id="acc-tax-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span>' +
            '</div>' +
            '<div id="acc-tax" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Zatrudnienie</label><input type="text" value="'+(emp==='partner'?'U Partnera':'JDG')+'" disabled style="'+inpStyle+' background:rgba(0,0,0,0.3); color:var(--muted);"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Rodzaj Rozliczenia</label><select id="us-etype" onchange="window.dCheckEPct && window.dCheckEPct()" style="'+inpStyle+'">' +
                        '<option value="flat" '+(empType==='flat'?'selected':'')+'>Stała (ZUS/Umowa)</option>' +
                        '<option value="pct" '+(empType==='pct'?'selected':'')+'>% Utargu</option>' +
                    '</select></div>' +
                '</div>' +
                '<div id="us-ep-box" style="margin-bottom:20px;">' +
                    (empType === 'pct' ? 
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Prowizja partnera (%)</label><input type="number" id="us-epct" value="'+empPct+'" style="'+inpStyle+'"></div>' 
                    : 
                    '<div class="inp-row" style="margin:0; gap:12px;">' +
                        '<div class="inp-group" style="margin:0; flex:2;"><label style="'+lblStyle+'">Kwota stała (zł)</label><input type="number" id="us-ec" value="'+empC+'" style="'+inpStyle+'"></div>' +
                        '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-e-period" style="'+inpStyle+'"><option value="week" '+(empPer==='week'?'selected':'')+'>Tyg</option><option value="month" '+(empPer==='month'?'selected':'')+'>M-c</option></select></div>' +
                    '</div>'
                    ) +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:15px; padding-top:20px; border-top:1px dashed rgba(255,255,255,0.1); gap:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Stawka podatku (%)</label><input type="number" id="us-tx" value="'+tax+'" step="0.1" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Terminal (Karty) (%)</label><input type="number" id="us-cf" value="'+cardF+'" step="0.1" style="'+inpStyle+'"></div>' +
                '</div>' +
                '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Prowizja Voucherów (%) (Opcj.)</label><input type="number" id="us-vf" value="'+vouchF+'" placeholder="0" step="0.1" style="'+inpStyle+'"></div>' +
            '</div>' +
        '</div>';

        // 6. WSPARCIE (KUP KAWĘ) - Świecący, ekskluzywny panel
        html += '<div class="panel" style="padding:35px 20px; border-radius:24px; margin-bottom:20px; text-align:center; border:1px solid rgba(245,158,11,0.4); background:linear-gradient(145deg, #2a1505 0%, #090500 100%); box-shadow:0 15px 40px rgba(245,158,11,0.15); position:relative; overflow:hidden;">' +
            '<div style="font-size:4rem; margin-bottom:15px; filter: drop-shadow(0 4px 15px rgba(245,158,11,0.6)); animation: pulse 2s infinite;">☕</div>' +
            '<h3 style="color:#f59e0b; margin:0 0 10px 0; font-size:1.4rem; letter-spacing:1px; text-transform:uppercase; font-weight:900;">Postaw nam kawę!</h3>' +
            '<p style="font-size:0.85rem; color:rgba(255,255,255,0.7); margin-bottom:25px; line-height:1.6; font-weight:600;">StyreOS to narzędzie tworzone z pasji, zupełnie za darmo. Jeśli pomaga Ci zarabiać więcej na Taxi, dorzuć się do serwerów i przyspiesz tworzenie wersji PRO!</p>' +
            '<a href="https://buycoffee.to/styreos" target="_blank" style="background:linear-gradient(135deg, #ffdd00, #f59e0b); color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:18px; border-radius:20px; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4); font-size:1.05rem; letter-spacing:1px; text-transform:uppercase;">' +
                '<span style="font-size:1.4rem;">☕</span> WESPRZYJ PROJEKT' +
            '</a>' +
        '</div>';

        html += '</div>'; // Koniec padding kontenera

        // Przycisk Zapisz zawsze widoczny na dole
        html += '<div style="padding:10px 15px; margin-top:10px; margin-bottom:10px;">' +
            '<button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; padding:20px; font-size:1.1rem; border-radius:24px; font-weight:900; letter-spacing:1px; box-shadow:0 10px 30px rgba(14,165,233,0.3); width:100%; text-transform:uppercase; border:none; outline:none;" onclick="window.dSaveUS && window.dSaveUS()">💾 ZAPISZ USTAWIENIA</button>' +
        '</div>' +
        
        // Opcje Backup & Restore
        '<div style="display:flex; gap:12px; padding: 0 15px 25px 15px;">' +
            '<button class="btn" style="flex:1; background:#18181b; color:#0ea5e9; border:1px solid rgba(14,165,233,0.3); padding:16px; border-radius:20px; font-weight:800; font-size:0.85rem; box-shadow:none; outline:none;" onclick="window.dExport && window.dExport()">📤 KOPIA ZAPASOWA</button>' +
            '<label class="btn" style="flex:1; background:#18181b; color:#f59e0b; border:1px solid rgba(245,158,11,0.3); padding:16px; border-radius:20px; font-weight:800; font-size:0.85rem; box-shadow:none; text-align:center; cursor:pointer; margin-top:0; outline:none; display:flex; align-items:center; justify-content:center;">📥 PRZYWRÓĆ DANE<input type="file" style="display:none;" onchange="window.dImport && window.dImport(event)"></label>' +
        '</div>' +

        '<div style="text-align:center; padding: 20px 0; padding-bottom: 80px;">' +
            '<img src="icon-512.png" style="width:50px;height:50px; opacity:0.1; mix-blend-mode:luminosity;" class="float-icon">' +
            '<p style="color:var(--muted); font-size:0.6rem; margin-top:8px; text-transform:uppercase; letter-spacing:2px; line-height:1.4;">StyreOS PWA 1.0 Beta<br><span style="opacity:0.6;">Powered by GnomekOK</span></p>' +
        '</div>' +
        
        '<input type="file" id="h-import-file" style="display:none;" onchange="window.dImport && window.dImport(event)">' +
        '<input type="file" id="d-import-file" style="display:none;" onchange="window.dImport && window.dImport(event)">' +
        
        (nav || '');

        let appContainer = document.getElementById('app');
        if(appContainer) appContainer.innerHTML = html;

    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:40px 20px; text-align:center; color:white;"><h3>Błąd w Opcjach Taxi</h3><p style="color:var(--danger);">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; margin-top:20px;" onclick="window.location.reload()">ODŚWIEŻ</button></div>' + (nav || '');
        }
    }
};

window.toggleManualFuelBoxes = function() {
    let srcEl = document.getElementById('us-fuel-src');
    if(!srcEl) return;
    let src = srcEl.value;
    let wrap = document.getElementById('manual-fuel-wrapper');
    if(wrap) wrap.style.display = (src === 'manual') ? 'block' : 'none';

    let types = ['pb', 'on', 'lpg', 'ev'];
    for(let i=0; i<types.length; i++) {
        let t = types[i];
        let cb = document.getElementById('cb-ftype-' + t);
        let box = document.getElementById('mf-box-' + t);
        if(cb && box) box.style.display = cb.checked ? 'block' : 'none';
    }
};

window.dCheckEPct = function() {
    let tEl = document.getElementById('us-etype');
    let b = document.getElementById('us-ep-box');
    if(!tEl || !b) return;
    
    let t = tEl.value;
    let inpStyle = 'background:rgba(255,255,255,0.03); border-radius:14px; padding:16px; font-size:0.95rem; border:1px solid rgba(255,255,255,0.08); color:#fff; width:100%; box-sizing:border-box; outline:none; font-weight:700;';
    let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block;';
    
    if(t === 'pct') {
        b.innerHTML = '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Prowizja partnera (%)</label><input type="number" id="us-epct" placeholder="np. 50" style="'+inpStyle+'"></div>';
    } else {
        b.innerHTML = '<div class="inp-row" style="margin:0; gap:12px;">' +
            '<div class="inp-group" style="margin:0; flex:2;"><label style="'+lblStyle+'">Kwota stała (zł)</label><input type="number" id="us-ec" placeholder="np. 50" style="'+inpStyle+'"></div>' +
            '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-e-period" style="'+inpStyle+'"><option value="week" selected>Tyg</option><option value="month">M-c</option></select></div>' +
        '</div>';
    }
};

window.dCrmChange = function() {
    let blEl = document.getElementById('dc-bl');
    let b = document.getElementById('dc-btn');
    if(!blEl || !b) return;
    
    if(blEl.checked) {
        b.innerHTML = "DODAJ DO CZARNEJ LISTY 🚫";
        b.className = "btn btn-danger";
    } else {
        b.innerHTML = "DODAJ DO CRM VIP ★";
        b.className = "btn btn-driver";
    }
};

window.dSaveUS = function() {
    let nameEl = document.getElementById('us-name');
    if(nameEl) window.db.userName = nameEl.value;
    
    if(!window.db.drv.cfg) window.db.drv.cfg = {};

    let safeVal = function(id, def) {
        let el = document.getElementById(id);
        if(el) { let val = parseFloat(el.value); return isNaN(val) ? (def||0) : val; }
        return def||0;
    };

    window.db.drv.q = {
        s: safeVal('q-cfg-s'), w: safeVal('q-cfg-w'),
        t1: safeVal('q-cfg-t1'), t2: safeVal('q-cfg-t2'),
        t3: safeVal('q-cfg-t3'), t4: safeVal('q-cfg-t4')
    };

    window.db.drv.cfg.goal = safeVal('us-goal', 350);
    let cityEl = document.getElementById('us-city');
    window.db.drv.cfg.defCity = cityEl ? cityEl.value : 'Szczecin';
    
    let selectedF = [];
    let types = ['pb', 'on', 'lpg', 'ev'];
    for(let i=0; i<types.length; i++) {
        let cb = document.getElementById('cb-ftype-' + types[i]);
        if(cb && cb.checked) selectedF.push(types[i]);
    }
    if(selectedF.length === 0) selectedF = ['pb']; 
    window.db.drv.cfg.fTypes = selectedF;

    let mF = {
        pb: {c: safeVal('mf-c-pb', 7.0), p: safeVal('mf-p-pb', 6.50)},
        on: {c: safeVal('mf-c-on', 6.0), p: safeVal('mf-p-on', 6.00)},
        lpg: {c: safeVal('mf-c-lpg', 10.0), p: safeVal('mf-p-lpg', 3.00)},
        ev: {c: safeVal('mf-c-ev', 15.0), p: safeVal('mf-p-ev', 1.00)}
    };
    window.db.drv.cfg.mFuel = mF;

    let fSrcEl = document.getElementById('us-fuel-src');
    window.db.drv.cfg.fuelSource = fSrcEl ? fSrcEl.value : 'garage';

    if(window.db.drv.cfg.fuelSource === 'manual') {
        let totalCostPerKm = 0;
        for(let i=0; i<selectedF.length; i++) {
            let t = selectedF[i];
            totalCostPerKm += (mF[t].c * mF[t].p) / 100;
        }
        window.db.drv.cfg.fuelPx = totalCostPerKm;
    } else {
        if(typeof window.calcFuelioStats === 'function') {
            let fs = window.calcFuelioStats();
            if(fs && fs.ck > 0) window.db.drv.cfg.fuelPx = fs.ck;
        }
    }
    
    window.db.drv.cfg.cC = safeVal('us-cc');
    let cTypeEl = document.getElementById('us-ctype');
    window.db.drv.cfg.cType = cTypeEl ? cTypeEl.value : 'month';
    
    window.db.drv.cfg.bC = safeVal('us-bc');
    let bPerEl = document.getElementById('us-b-period');
    window.db.drv.cfg.bPeriod = bPerEl ? bPerEl.value : 'month';
    
    window.db.drv.cfg.iC = safeVal('us-ic');
    let iPerEl = document.getElementById('us-i-period');
    window.db.drv.cfg.iPeriod = iPerEl ? iPerEl.value : 'month';
    
    window.db.drv.cfg.uC = safeVal('us-uc');
    let uTypeEl = document.getElementById('us-utype');
    window.db.drv.cfg.uType = uTypeEl ? uTypeEl.value : 'week';
    
    let eTypeEl = document.getElementById('us-etype');
    window.db.drv.cfg.eType = eTypeEl ? eTypeEl.value : 'flat';
    window.db.drv.cfg.eC = safeVal('us-ec');
    let ePerEl = document.getElementById('us-e-period');
    window.db.drv.cfg.ePeriod = ePerEl ? ePerEl.value : 'month';
    window.db.drv.cfg.ePct = safeVal('us-epct') / 100;
    
    window.db.drv.cfg.tax = safeVal('us-tx') / 100;
    window.db.drv.cfg.cardF = safeVal('us-cf') / 100;
    window.db.drv.cfg.voucherF = safeVal('us-vf') / 100;
    
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Zapisano!", "Opcje zaktualizowane.", "success");
};
