// ==========================================
// PLIK: taxi_tab_set.js - Zakładka Opcje (Akordeony Premium)
// ==========================================

// --- FUNKCJA ZWIJANIA / ROZWIJANIA (AKORDEONY) ---
window.toggleAccordion = function(id) {
    let content = document.getElementById(id);
    let icon = document.getElementById(id + '-icon');
    if(content) {
        if(content.style.display === 'none') {
            content.style.display = 'block';
            if(icon) icon.innerHTML = '🔼';
        } else {
            content.style.display = 'none';
            if(icon) icon.innerHTML = '🔽';
        }
    }
};

window.rDrvSet = function(d, t, nav, hdr) {
    try {
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
        let uType = (d.cfg && d.cfg.uType) ? d.cfg.uType : 'corp';
        
        let tax = (d.cfg && d.cfg.tax) ? d.cfg.tax * 100 : 8.5;
        let cardF = (d.cfg && d.cfg.cardF) ? d.cfg.cardF * 100 : 1.5;
        let vouchF = (d.cfg && d.cfg.voucherF) ? d.cfg.voucherF * 100 : 0;

        let q = d.q || {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8};

        // Style dla inputów w opcjach (mniejsze i zgrabniejsze)
        let inpStyle = 'background:rgba(0,0,0,0.5); border-radius:10px; padding:12px; font-size:0.85rem; border:1px solid rgba(255,255,255,0.05); color:#fff; width:100%; box-sizing:border-box;';
        let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; display:block;';

        let html = hdr + 
        '<div class="dash-hero" style="padding-bottom: 10px;">' +
            '<p style="font-size:0.7rem; font-weight:bold; color:var(--muted); letter-spacing:1px; text-transform:uppercase;">KONFIGURACJA PROFILI</p>' +
            '<h1 style="color:var(--info); font-size:2.8rem; letter-spacing:-1px; text-transform:uppercase; margin:0;">⚙️ OPCJE</h1>' +
        '</div>' +
        '<div style="padding:0 15px;">';

        // 1. TARYFIKATOR
        html += '<div class="panel" style="padding:0; border-radius:16px; margin-bottom:12px; overflow:hidden; border:1px solid rgba(217, 70, 239, 0.3); background:linear-gradient(145deg, #1e0a2d, #09090b); box-shadow:0 6px 15px rgba(0,0,0,0.3);">' +
            '<div onclick="window.toggleAccordion(\'acc-tar\')" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(217, 70, 239, 0.05);">' +
                '<strong style="color:#d946ef; font-size:0.8rem; letter-spacing:1px; text-transform:uppercase;"><span style="font-size:1.2rem; margin-right:8px;">🧮</span> Ustawienia Wyceny</strong>' +
                '<span id="acc-tar-icon" style="color:var(--muted);">🔽</span>' +
            '</div>' +
            '<div id="acc-tar" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-row" style="margin-bottom:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Opłata Początkowa (zł)</label><input type="number" id="q-cfg-s" value="'+q.s+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Postój (zł/h)</label><input type="number" id="q-cfg-w" value="'+q.w+'" style="'+inpStyle+'"></div>' +
                '</div>' +
                '<div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; margin-top:10px;">' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">T1</label><input type="number" step="0.1" id="q-cfg-t1" value="'+q.t1+'" style="'+inpStyle+' text-align:center;"></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">T2</label><input type="number" step="0.1" id="q-cfg-t2" value="'+q.t2+'" style="'+inpStyle+' text-align:center;"></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">T3</label><input type="number" step="0.1" id="q-cfg-t3" value="'+q.t3+'" style="'+inpStyle+' text-align:center;"></div>' +
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">T4</label><input type="number" step="0.1" id="q-cfg-t4" value="'+q.t4+'" style="'+inpStyle+' text-align:center;"></div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // 2. PERSONALIZACJA I MIASTO
        html += '<div class="panel" style="padding:0; border-radius:16px; margin-bottom:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); background:linear-gradient(145deg, #0f172a, #09090b); box-shadow:0 6px 15px rgba(0,0,0,0.3);">' +
            '<div onclick="window.toggleAccordion(\'acc-pers\')" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(255,255,255,0.02);">' +
                '<strong style="color:var(--success); font-size:0.8rem; letter-spacing:1px; text-transform:uppercase;"><span style="font-size:1.2rem; margin-right:8px;">👤</span> Personalizacja</strong>' +
                '<span id="acc-pers-icon" style="color:var(--muted);">🔽</span>' +
            '</div>' +
            '<div id="acc-pers" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-row" style="margin-bottom:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Twoje Imię</label><input type="text" id="us-name" value="'+(window.db.userName || '')+'" placeholder="np. Jan" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Cel dzienny (zł)</label><input type="number" id="us-goal" value="'+goal+'" style="'+inpStyle+'"></div>' +
                '</div>' +
                '<div class="inp-group" style="margin:0;">' +
                    '<label style="'+lblStyle+'">Domyślne Miasto (Dla Map)</label>' +
                    '<input type="text" id="us-city" value="'+city+'" placeholder="np. Szczecin" style="'+inpStyle+'">' +
                '</div>' +
            '</div>' +
        '</div>';

        // 3. PALIWO
        html += '<div class="panel" style="padding:0; border-radius:16px; margin-bottom:12px; overflow:hidden; border:1px solid rgba(245,158,11,0.3); background:linear-gradient(145deg, #2a1600, #09090b); box-shadow:0 6px 15px rgba(0,0,0,0.3);">' +
            '<div onclick="window.toggleAccordion(\'acc-fuel\')" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(245,158,11,0.05);">' +
                '<strong style="color:var(--fuel); font-size:0.8rem; letter-spacing:1px; text-transform:uppercase;"><span style="font-size:1.2rem; margin-right:8px;">⛽</span> Koszty Paliwa</strong>' +
                '<span id="acc-fuel-icon" style="color:var(--muted);">🔽</span>' +
            '</div>' +
            '<div id="acc-fuel" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-group" style="margin-bottom:15px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:15px;">' +
                    '<label style="'+lblStyle+' color:var(--fuel);">Jakimi paliwami zasilane jest auto?</label>' +
                    '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">' +
                        '<label style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.5); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; flex:1; min-width:40%; font-size:0.8rem;">' +
                            '<input type="checkbox" id="cb-ftype-pb" value="pb" '+(fTypes.indexOf('pb')!==-1?'checked':'')+' onchange="if(typeof window.toggleManualFuelBoxes===\'function\') window.toggleManualFuelBoxes()" style="accent-color:var(--fuel); width:16px; height:16px;"> Benzyna' +
                        '</label>' +
                        '<label style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.5); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; flex:1; min-width:40%; font-size:0.8rem;">' +
                            '<input type="checkbox" id="cb-ftype-on" value="on" '+(fTypes.indexOf('on')!==-1?'checked':'')+' onchange="if(typeof window.toggleManualFuelBoxes===\'function\') window.toggleManualFuelBoxes()" style="accent-color:var(--fuel); width:16px; height:16px;"> Diesel' +
                        '</label>' +
                        '<label style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.5); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; flex:1; min-width:40%; font-size:0.8rem;">' +
                            '<input type="checkbox" id="cb-ftype-lpg" value="lpg" '+(fTypes.indexOf('lpg')!==-1?'checked':'')+' onchange="if(typeof window.toggleManualFuelBoxes===\'function\') window.toggleManualFuelBoxes()" style="accent-color:var(--fuel); width:16px; height:16px;"> Gaz (LPG)' +
                        '</label>' +
                        '<label style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.5); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; flex:1; min-width:40%; font-size:0.8rem;">' +
                            '<input type="checkbox" id="cb-ftype-ev" value="ev" '+(fTypes.indexOf('ev')!==-1?'checked':'')+' onchange="if(typeof window.toggleManualFuelBoxes===\'function\') window.toggleManualFuelBoxes()" style="accent-color:var(--info); width:16px; height:16px;"> Prąd (EV)' +
                        '</label>' +
                    '</div>' +
                '</div>' +
                '<div class="inp-group" style="margin-bottom:5px;">' +
                    '<label style="'+lblStyle+' color:var(--fuel);">Skąd brać dane o kosztach?</label>' +
                    '<select id="us-fuel-src" onchange="if(typeof window.toggleManualFuelBoxes===\'function\') window.toggleManualFuelBoxes()" style="'+inpStyle+' border-color:rgba(245,158,11,0.3);">' +
                        '<option value="garage" '+(fuelSource==='garage'?'selected':'')+'>Dziennik Garażu (Zalecane / Dokładne)</option>' +
                        '<option value="manual" '+(fuelSource==='manual'?'selected':'')+'>Z ryczałtu wpisanego poniżej</option>' +
                    '</select>' +
                '</div>' +
                '<div id="manual-fuel-wrapper" style="display:'+(fuelSource==='manual'?'block':'none')+'; margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">' +
                    '<p style="font-size:0.7rem; color:var(--muted); text-align:center; margin-bottom:15px;">Podaj parametry dla zaznaczonych paliw. Apka zsumuje i wyliczy średni koszt na 1 KM.</p>' +
                    '<div class="grid-2" style="margin-bottom:8px; padding:0 5px;">' +
                        '<div style="font-size:0.6rem; color:var(--muted); text-align:center; font-weight:bold;">ŚREDNIE SPALANIE</div>' +
                        '<div style="font-size:0.6rem; color:var(--muted); text-align:center; font-weight:bold;">CENA (ZŁ/L lub kWh)</div>' +
                    '</div>' +
                    '<div id="mf-box-pb" style="display:'+(fTypes.indexOf('pb')!==-1?'block':'none')+'; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">' +
                        '<div style="color:var(--fuel); font-size:0.7rem; font-weight:bold; margin-bottom:8px; text-transform:uppercase;">⛽ Benzyna</div>' +
                        '<div class="inp-row" style="margin:0;">' +
                            '<div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="mf-c-pb" value="'+mF.pb.c+'" style="'+inpStyle+' text-align:center;"></div>' +
                            '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="mf-p-pb" value="'+mF.pb.p+'" style="'+inpStyle+' text-align:center;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="mf-box-on" style="display:'+(fTypes.indexOf('on')!==-1?'block':'none')+'; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">' +
                        '<div style="color:var(--fuel); font-size:0.7rem; font-weight:bold; margin-bottom:8px; text-transform:uppercase;">⛽ Diesel</div>' +
                        '<div class="inp-row" style="margin:0;">' +
                            '<div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="mf-c-on" value="'+mF.on.c+'" style="'+inpStyle+' text-align:center;"></div>' +
                            '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="mf-p-on" value="'+mF.on.p+'" style="'+inpStyle+' text-align:center;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="mf-box-lpg" style="display:'+(fTypes.indexOf('lpg')!==-1?'block':'none')+'; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">' +
                        '<div style="color:var(--fuel); font-size:0.7rem; font-weight:bold; margin-bottom:8px; text-transform:uppercase;">⛽ Gaz (LPG)</div>' +
                        '<div class="inp-row" style="margin:0;">' +
                            '<div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="mf-c-lpg" value="'+mF.lpg.c+'" style="'+inpStyle+' text-align:center;"></div>' +
                            '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="mf-p-lpg" value="'+mF.lpg.p+'" style="'+inpStyle+' text-align:center;"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="mf-box-ev" style="display:'+(fTypes.indexOf('ev')!==-1?'block':'none')+'; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">' +
                        '<div style="color:var(--info); font-size:0.7rem; font-weight:bold; margin-bottom:8px; text-transform:uppercase;">⚡ Prąd (EV)</div>' +
                        '<div class="inp-row" style="margin:0;">' +
                            '<div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="mf-c-ev" value="'+mF.ev.c+'" style="'+inpStyle+' text-align:center;"></div>' +
                            '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="mf-p-ev" value="'+mF.ev.p+'" style="'+inpStyle+' text-align:center;"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // 4. KOSZTY AUTA I BAZY
        html += '<div class="panel" style="padding:0; border-radius:16px; margin-bottom:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #1e1b4b, #09090b); box-shadow:0 6px 15px rgba(0,0,0,0.3);">' +
            '<div onclick="window.toggleAccordion(\'acc-car\')" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(255,255,255,0.02);">' +
                '<strong style="color:var(--driver); font-size:0.8rem; letter-spacing:1px; text-transform:uppercase;"><span style="font-size:1.2rem; margin-right:8px;">🚗</span> Koszty Auta i Bazy</strong>' +
                '<span id="acc-car-icon" style="color:var(--muted);">🔽</span>' +
            '</div>' +
            '<div id="acc-car" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-row" style="margin-bottom:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">System</label><input type="text" value="'+(plat==='apps'?'Aplikacje':'Korporacja')+'" disabled style="'+inpStyle+' background:rgba(0,0,0,0.2); color:var(--muted);"></div>' +
                    (plat === 'corp' ? 
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Baza (zł)</label><input type="number" id="us-bc" value="'+corpBaseC+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-b-period" style="'+inpStyle+'"><option value="week" '+(corpPeriod==='week'?'selected':'')+'>Tyg</option><option value="month" '+(corpPeriod==='month'?'selected':'')+'>M-c</option></select></div>' 
                    : '') +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:15px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Rodzaj Auta</label><input type="text" value="'+(carType==='own'?'Własne':carType==='lease'?'Leasing':'Wynajem')+'" disabled style="'+inpStyle+' background:rgba(0,0,0,0.2); color:var(--muted);"></div>' +
                    (carType !== 'own' ? 
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Rata (zł)</label><input type="number" id="us-cc" value="'+carC+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-ctype" style="'+inpStyle+'"><option value="week" '+(carPer==='week'?'selected':'')+'>Tyg</option><option value="month" '+(carPer==='month'?'selected':'')+'>M-c</option></select></div>' 
                    : '') +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:12px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.1);">' +
                    '<div class="inp-group" style="margin:0; flex:2;"><label style="'+lblStyle+'">Księgowa / Inne (zł)</label><input type="number" id="us-uc" value="'+uC+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-utype" style="'+inpStyle+'"><option value="week" '+(uType==='week'?'selected':'')+'>Tyg</option><option value="month" '+(uType==='month'?'selected':'')+'>M-c</option></select></div>' +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:5px;">' +
                    '<div class="inp-group" style="margin:0; flex:2;"><label style="'+lblStyle+'">ZUS Ubezp. Auto (zł)</label><input type="number" id="us-ic" value="'+insC+'" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-i-period" style="'+inpStyle+'"><option value="week" '+(insPer==='week'?'selected':'')+'>Tyg</option><option value="month" '+(insPer==='month'?'selected':'')+'>M-c</option></select></div>' +
                '</div>' +
            '</div>' +
        '</div>';

        // 5. PODATKI I PROWIZJE PŁATNOŚCI
        html += '<div class="panel" style="padding:0; border-radius:16px; margin-bottom:12px; overflow:hidden; border:1px solid rgba(14,165,233,0.3); background:linear-gradient(145deg, #0c4a6e, #09090b); box-shadow:0 6px 15px rgba(0,0,0,0.3);">' +
            '<div onclick="window.toggleAccordion(\'acc-tax\')" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(14,165,233,0.05);">' +
                '<strong style="color:var(--info); font-size:0.8rem; letter-spacing:1px; text-transform:uppercase;"><span style="font-size:1.2rem; margin-right:8px;">⚖️</span> Podatki i Prowizje</strong>' +
                '<span id="acc-tax-icon" style="color:var(--muted);">🔽</span>' +
            '</div>' +
            '<div id="acc-tax" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">' +
                '<div class="inp-row" style="margin-bottom:12px;">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Zatrudnienie</label><input type="text" value="'+(emp==='partner'?'U Partnera':'JDG')+'" disabled style="'+inpStyle+' background:rgba(0,0,0,0.2); color:var(--muted);"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Rodzaj Rozliczenia</label><select id="us-etype" onchange="if(typeof window.dCheckEPct===\'function\') window.dCheckEPct()" style="'+inpStyle+'">' +
                        '<option value="flat" '+(empType==='flat'?'selected':'')+'>Stała (ZUS/Umowa)</option>' +
                        '<option value="pct" '+(empType==='pct'?'selected':'')+'>% Utargu</option>' +
                    '</select></div>' +
                '</div>' +
                '<div id="us-ep-box" style="margin-bottom:15px;">' +
                    (empType === 'pct' ? 
                    '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Prowizja partnera (%)</label><input type="number" id="us-epct" value="'+empPct+'" style="'+inpStyle+'"></div>' 
                    : 
                    '<div class="inp-row" style="margin:0;">' +
                        '<div class="inp-group" style="margin:0; flex:2;"><label style="'+lblStyle+'">Kwota stała (zł)</label><input type="number" id="us-ec" value="'+empC+'" style="'+inpStyle+'"></div>' +
                        '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Okres</label><select id="us-e-period" style="'+inpStyle+'"><option value="week" '+(empPer==='week'?'selected':'')+'>Tyg</option><option value="month" '+(empPer==='month'?'selected':'')+'>M-c</option></select></div>' +
                    '</div>'
                    ) +
                '</div>' +
                '<div class="inp-row" style="margin-bottom:12px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.1);">' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Stawka podatku (%)</label><input type="number" id="us-tx" value="'+tax+'" step="0.1" style="'+inpStyle+'"></div>' +
                    '<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Terminal (Karty) (%)</label><input type="number" id="us-cf" value="'+cardF+'" step="0.1" style="'+inpStyle+'"></div>' +
                '</div>' +
                '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Prowizja Voucherów (%) (Opcj.)</label><input type="number" id="us-vf" value="'+vouchF+'" placeholder="0" step="0.1" style="'+inpStyle+'"></div>' +
            '</div>' +
        '</div>';

        html += '</div>'; // Koniec padding kontenera

        // Przycisk Zapisz zawsze widoczny na dole
        html += '<div style="padding:10px 15px; margin-top:10px; margin-bottom:10px;">' +
            '<button class="btn btn-info" style="padding:18px; font-size:1.1rem; border-radius:16px; font-weight:900; letter-spacing:1px; box-shadow:0 8px 25px rgba(14,165,233,0.3);" onclick="if(typeof window.dSaveUS===\'function\') window.dSaveUS()">ZAPISZ WSZYSTKIE OPCJE</button>' +
        '</div>' +
        
        '<div style="text-align:center; padding: 20px 0; padding-bottom: 80px;">' +
            '<img src="icon-512.png" style="width:50px;height:50px; opacity:0.1; mix-blend-mode:luminosity;" class="float-icon">' +
            '<p style="color:var(--muted); font-size:0.6rem; margin-top:8px; text-transform:uppercase; letter-spacing:2px; line-height:1.4;">StyreOS PWA 1.0 Beta<br><span style="opacity:0.6;">Powered by GnomekOK</span></p>' +
        '</div>' +
        
        '<input type="file" id="h-import-file" style="display:none;" onchange="if(typeof window.dImport===\'function\') window.dImport(event)">' +
        '<input type="file" id="d-import-file" style="display:none;" onchange="if(typeof window.dImport===\'function\') window.dImport(event)">' +
        
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
    let inpStyle = 'background:rgba(0,0,0,0.5); border-radius:10px; padding:12px; font-size:0.85rem; border:1px solid rgba(255,255,255,0.05); color:#fff; width:100%; box-sizing:border-box;';
    let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; display:block;';
    
    if(t === 'pct') {
        b.innerHTML = '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Prowizja partnera (%)</label><input type="number" id="us-epct" placeholder="np. 50" style="'+inpStyle+'"></div>';
    } else {
        b.innerHTML = '<div class="inp-row" style="margin:0;">' +
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
    if(typeof window.sysAlert === 'function') window.sysAlert("Zapisano!", "Opcje zaktualizowane. Garaż dopasowany!", "success");
};
