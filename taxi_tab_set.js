// ==========================================
// PLIK: taxi_tab_set.js - Zakładka Opcje (Ustawienia Premium i Koszty Operacyjne)
// ==========================================

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

        let goalBrutto = (d.cfg && d.cfg.goalBrutto) ? d.cfg.goalBrutto : 400;
        let goalNetto = (d.cfg && d.cfg.goalNetto) ? d.cfg.goalNetto : 300;
        let city = (d.cfg && d.cfg.defCity) ? d.cfg.defCity : 'Warszawa';
        let fuelSource = (d.cfg && d.cfg.fuelSource) ? d.cfg.fuelSource : 'garage';
        let fTypes = (d.cfg && Array.isArray(d.cfg.fTypes)) ? d.cfg.fTypes : ['pb']; 
        
        let mF = (d.cfg && d.cfg.mFuel) ? d.cfg.mFuel : {
            pb: {c: 7.0, p: 6.50},
            on: {c: 6.0, p: 6.00},
            lpg: {c: 10.0, p: 3.00},
            ev: {c: 15.0, p: 1.00}
        };
        
        // Pobrane bezpiecznie wartości do formularzy
        let carRent = (d.cfg && d.cfg.carRent) ? d.cfg.carRent : 0;
        let zusCost = (d.cfg && d.cfg.zus) ? d.cfg.zus : 0;
        let fixedDaily = (d.cfg && d.cfg.fixedDaily) ? d.cfg.fixedDaily : 0;
        
        let empType = (d.cfg && d.cfg.eType) ? d.cfg.eType : 'flat';
        let eFix = (d.cfg && d.cfg.eFix) ? d.cfg.eFix : 0;
        let ePct = (d.cfg && d.cfg.ePct) ? (d.cfg.ePct * 100) : 0;
        
        let tax = (d.cfg && d.cfg.tax) ? (d.cfg.tax * 100) : 8.5;
        let cardF = (d.cfg && d.cfg.cardF) ? (d.cfg.cardF * 100) : 1.5;
        let vouchF = (d.cfg && d.cfg.voucherF) ? (d.cfg.voucherF * 100) : 0;

        let q = d.q || {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8};

        let inpStyle = 'background:rgba(255,255,255,0.03); border-radius:14px; padding:16px; font-size:0.95rem; border:1px solid rgba(255,255,255,0.08); color:#fff; width:100%; box-sizing:border-box; outline:none; font-weight:700;';
        let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block;';

        let html = [];
        
        html.push('<style>');
        html.push('@keyframes steamRise { 0% { transform: translateY(0) scale(1); opacity: 0.8; } 100% { transform: translateY(-25px) scale(1.5); opacity: 0; } }');
        html.push('</style>');
        
        html.push(hdr);
        html.push('<div class="dash-hero" style="padding-bottom: 10px; text-align:center;">');
        html.push('<div style="width:70px; height:70px; background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); border-radius:24px; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:2.2rem; box-shadow:0 8px 25px rgba(0,0,0,0.4);">⚙️</div>');
        html.push('<h1 style="color:#0ea5e9; font-size:2.4rem; font-weight:900; letter-spacing:-1px; text-transform:uppercase; margin:0; text-shadow:0 0 15px rgba(14,165,233,0.3);">USTAWIENIA</h1>');
        html.push('<p style="margin-top:5px; font-size:0.75rem; color:rgba(255,255,255,0.4); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">Konfiguracja Twojego Profilu</p>');
        html.push('</div>');

        html.push('<div style="padding:0 15px;">');

        // KONTO GOOGLE
        html.push('<div class="panel" style="padding:25px 20px; border-radius:24px; margin-bottom:15px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(14,165,233,0.3); box-shadow:0 10px 30px rgba(0,0,0,0.4); text-align:center;">');
        html.push('<div style="font-size:2.5rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(14,165,233,0.4));">☁️</div>');
        html.push('<h3 style="color:#0ea5e9; font-size:1.1rem; margin:0 0 5px 0; font-weight:900; letter-spacing:1px; text-transform:uppercase;">Konto i Kopia Zapasowa</h3>');
        html.push('<p style="font-size:0.75rem; color:var(--muted); margin-bottom:20px;">Zaloguj się kontem Google, aby automatycznie synchronizować dane o zarobkach z darmową chmurą.</p>');
        html.push('<button class="btn" style="background:#fff; color:#000; font-weight:900; padding:18px; border-radius:18px; width:100%; display:flex; align-items:center; justify-content:center; gap:12px; box-shadow:0 8px 20px rgba(255,255,255,0.2); outline:none;" onclick="if(window.sysLoginGoogle) window.sysLoginGoogle(); else if(window.loginWithGoogle) window.loginWithGoogle(); else if(window.sysAlert) window.sysAlert(\'Info\', \'Moduł Google w trakcie konfiguracji.\', \'info\');">');
        html.push('<img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" style="width:20px;" alt="G"> ZALOGUJ PRZEZ GOOGLE');
        html.push('</button></div>');

        // BANER PRO
        html.push('<div class="pro-teaser-panel" style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #130a1c 0%, #000000 100%); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="if(window.sysAlert) window.sysAlert(\'Multi-Profile PRO\', \'W wersji PRO będziesz mógł stworzyć kilka osobnych profili dla różnych samochodów, a nawet zarządzać statystykami całej floty z jednego miejsca! 👥🚀\', \'info\')">');
        html.push('<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #d946ef, #0ea5e9); box-shadow: 2px 0 12px rgba(217,70,239,0.6);"></div>');
        html.push('<div style="position: absolute; top: 12px; right: 12px; background: #d946ef; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>');
        html.push('<div style="display: flex; align-items: center; gap: 15px;">');
        html.push('<div style="font-size: 2.5rem; filter: drop-shadow(0 0 15px rgba(217,70,239,0.4));">👥✨</div>');
        html.push('<div style="text-align: left;">');
        html.push('<h4 style="color: #d946ef; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Zarządzanie Flotą</h4>');
        html.push('<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Wiele aut:</b> Osobne statystyki operacyjne.<br>✅ <b>Pełna Analiza:</b> Raporty zmian dla kierowców!</div>');
        html.push('</div></div></div>');

        // 1. TARYFIKATOR
        html.push('<div id="acc-tar-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">');
        html.push('<div onclick="window.toggleAccordion(\'acc-tar\')" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(217, 70, 239, 0.05);">');
        html.push('<strong style="color:#d946ef; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px; filter:drop-shadow(0 0 8px rgba(217,70,239,0.4));">🧮</span> Taksometr i Wycena</strong>');
        html.push('<span id="acc-tar-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span></div>');
        html.push('<div id="acc-tar" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">');
        html.push('<div class="inp-row" style="margin-bottom:15px; gap:12px;">');
        html.push('<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Opłata Początkowa (zł)</label><input type="number" step="0.1" id="q-cfg-s" value="'+(q.s||0)+'" style="'+inpStyle+' text-align:center; color:#d946ef;"></div>');
        html.push('<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Postój (zł/h)</label><input type="number" step="0.1" id="q-cfg-w" value="'+(q.w||0)+'" style="'+inpStyle+' text-align:center; color:#d946ef;"></div></div>');
        html.push('<div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; margin-top:10px;">');
        html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' text-align:center;">T1</label><input type="number" step="0.1" id="q-cfg-t1" value="'+(q.t1||0)+'" style="'+inpStyle+' text-align:center;"></div>');
        html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' text-align:center;">T2</label><input type="number" step="0.1" id="q-cfg-t2" value="'+(q.t2||0)+'" style="'+inpStyle+' text-align:center;"></div>');
        html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' text-align:center;">T3</label><input type="number" step="0.1" id="q-cfg-t3" value="'+(q.t3||0)+'" style="'+inpStyle+' text-align:center;"></div>');
        html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' text-align:center;">T4</label><input type="number" step="0.1" id="q-cfg-t4" value="'+(q.t4||0)+'" style="'+inpStyle+' text-align:center;"></div>');
        html.push('</div></div></div>');

        // 2. PERSONALIZACJA CELÓW
        html.push('<div id="acc-pers-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">');
        html.push('<div onclick="window.toggleAccordion(\'acc-pers\')" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(16, 185, 129, 0.05);">');
        html.push('<strong style="color:#10b981; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px; filter:drop-shadow(0 0 8px rgba(16,185,129,0.4));">👤</span> Personalizacja Celów</strong>');
        html.push('<span id="acc-pers-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span></div>');
        html.push('<div id="acc-pers" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">');
        html.push('<div class="inp-group" style="margin-bottom:15px;"><label style="'+lblStyle+'">Twoje Imię</label><input type="text" id="us-name" value="'+(window.db.userName || '')+'" placeholder="np. Jan" style="'+inpStyle+'"></div>');
        
        html.push('<div class="inp-row" style="margin-bottom:15px; gap:12px;">');
        html.push('<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Cel Utargu (Brutto)</label><input type="number" id="us-goal-brutto" value="'+goalBrutto+'" style="'+inpStyle+' color:#0ea5e9;"></div>');
        html.push('<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Cel Zarobku (Netto)</label><input type="number" id="us-goal-netto" value="'+goalNetto+'" style="'+inpStyle+' color:#10b981;"></div></div>');
        
        html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Miasto Główne (Dla Modułu Map)</label><input type="text" id="us-city" value="'+city+'" placeholder="np. Szczecin" style="'+inpStyle+'"></div>');
        html.push('</div></div>');

        // 3. PALIWO
        let cPb = fTypes.indexOf('pb') !== -1 ? 'checked' : '';
        let cOn = fTypes.indexOf('on') !== -1 ? 'checked' : '';
        let cLpg = fTypes.indexOf('lpg') !== -1 ? 'checked' : '';
        let cEv = fTypes.indexOf('ev') !== -1 ? 'checked' : '';
        let selGar = fuelSource === 'garage' ? 'selected' : '';
        let selMan = fuelSource === 'manual' ? 'selected' : '';

        html.push('<div id="acc-fuel-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">');
        html.push('<div onclick="window.toggleAccordion(\'acc-fuel\')" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(245, 158, 11, 0.05);">');
        html.push('<strong style="color:#f59e0b; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px; filter:drop-shadow(0 0 8px rgba(245,158,11,0.4));">⛽</span> Koszty Operacyjne Paliwa</strong>');
        html.push('<span id="acc-fuel-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span></div>');
        html.push('<div id="acc-fuel" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">');
        
        html.push('<div class="inp-group" style="margin-bottom:20px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:20px;">');
        html.push('<label style="'+lblStyle+' color:#f59e0b;">Zasilanie Twojego Pojazdu</label>');
        html.push('<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">');
        html.push('<label style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); cursor:pointer; flex:1; min-width:40%; font-size:0.85rem; font-weight:700;"><input type="checkbox" id="cb-ftype-pb" value="pb" '+cPb+' onchange="if(window.toggleManualFuelBoxes) window.toggleManualFuelBoxes()" style="accent-color:#f59e0b; width:18px; height:18px;"> Benzyna</label>');
        html.push('<label style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); cursor:pointer; flex:1; min-width:40%; font-size:0.85rem; font-weight:700;"><input type="checkbox" id="cb-ftype-on" value="on" '+cOn+' onchange="if(window.toggleManualFuelBoxes) window.toggleManualFuelBoxes()" style="accent-color:#f59e0b; width:18px; height:18px;"> Diesel</label>');
        html.push('<label style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); cursor:pointer; flex:1; min-width:40%; font-size:0.85rem; font-weight:700;"><input type="checkbox" id="cb-ftype-lpg" value="lpg" '+cLpg+' onchange="if(window.toggleManualFuelBoxes) window.toggleManualFuelBoxes()" style="accent-color:#f59e0b; width:18px; height:18px;"> Gaz (LPG)</label>');
        html.push('<label style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); cursor:pointer; flex:1; min-width:40%; font-size:0.85rem; font-weight:700;"><input type="checkbox" id="cb-ftype-ev" value="ev" '+cEv+' onchange="if(window.toggleManualFuelBoxes) window.toggleManualFuelBoxes()" style="accent-color:#0ea5e9; width:18px; height:18px;"> Prąd (EV)</label>');
        html.push('</div></div>');
        
        html.push('<div class="inp-group" style="margin-bottom:10px;"><label style="'+lblStyle+' color:#f59e0b;">Zarządzanie Cennikiem Paliwa</label><select id="us-fuel-src" onchange="if(window.toggleManualFuelBoxes) window.toggleManualFuelBoxes()" style="'+inpStyle+' border-color:rgba(245,158,11,0.3);"><option value="garage" '+selGar+'>Obliczaj dynamicznie (Z Dziennika Garażu)</option><option value="manual" '+selMan+'>Ustawienie ręczne (Na sztywno)</option></select></div>');
        
        let mWrap = fuelSource === 'manual' ? 'block' : 'none';
        html.push('<div id="manual-fuel-wrapper" style="display:'+mWrap+'; margin-top:20px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:20px;">');
        html.push('<p style="font-size:0.75rem; color:var(--muted); text-align:center; margin-bottom:15px; font-weight:600;">System wyliczy średni koszt paliwa za 1 km.</p>');
        
        let dPb = cPb !== '' ? 'block' : 'none';
        html.push('<div id="mf-box-pb" style="display:'+dPb+'; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);"><div style="color:#f59e0b; font-size:0.75rem; font-weight:800; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">⛽ Benzyna</div><div class="inp-row" style="margin:0; gap:12px;"><div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Spalanie (L/100km)</label><input type="number" step="0.1" id="mf-c-pb" value="'+(mF.pb.c||0)+'" style="'+inpStyle+' text-align:center;"></div><div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Cena (zł/L)</label><input type="number" step="0.01" id="mf-p-pb" value="'+(mF.pb.p||0)+'" style="'+inpStyle+' text-align:center;"></div></div></div>');
        
        let dOn = cOn !== '' ? 'block' : 'none';
        html.push('<div id="mf-box-on" style="display:'+dOn+'; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);"><div style="color:#f59e0b; font-size:0.75rem; font-weight:800; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">⛽ Diesel</div><div class="inp-row" style="margin:0; gap:12px;"><div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Spalanie (L/100km)</label><input type="number" step="0.1" id="mf-c-on" value="'+(mF.on.c||0)+'" style="'+inpStyle+' text-align:center;"></div><div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Cena (zł/L)</label><input type="number" step="0.01" id="mf-p-on" value="'+(mF.on.p||0)+'" style="'+inpStyle+' text-align:center;"></div></div></div>');
        
        let dLpg = cLpg !== '' ? 'block' : 'none';
        html.push('<div id="mf-box-lpg" style="display:'+dLpg+'; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);"><div style="color:#f59e0b; font-size:0.75rem; font-weight:800; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">⛽ Gaz LPG</div><div class="inp-row" style="margin:0; gap:12px;"><div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Spalanie (L/100km)</label><input type="number" step="0.1" id="mf-c-lpg" value="'+(mF.lpg.c||0)+'" style="'+inpStyle+' text-align:center;"></div><div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Cena (zł/L)</label><input type="number" step="0.01" id="mf-p-lpg" value="'+(mF.lpg.p||0)+'" style="'+inpStyle+' text-align:center;"></div></div></div>');
        
        let dEv = cEv !== '' ? 'block' : 'none';
        html.push('<div id="mf-box-ev" style="display:'+dEv+'; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);"><div style="color:#0ea5e9; font-size:0.75rem; font-weight:800; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">⚡ Prąd (EV)</div><div class="inp-row" style="margin:0; gap:12px;"><div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Zużycie (kWh/100km)</label><input type="number" step="0.1" id="mf-c-ev" value="'+(mF.ev.c||0)+'" style="'+inpStyle+' text-align:center;"></div><div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+' text-align:center;">Cena (zł/kWh)</label><input type="number" step="0.01" id="mf-p-ev" value="'+(mF.ev.p||0)+'" style="'+inpStyle+' text-align:center;"></div></div></div>');
        
        html.push('</div></div></div>');

        // 4. KOSZTY STAŁE (FLOTOWE / ZUS / INNE) - Inteligentne mapowanie dni
        html.push('<div id="acc-car-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">');
        html.push('<div onclick="window.toggleAccordion(\'acc-car\')" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(255,255,255,0.02);">');
        html.push('<strong style="color:var(--driver); font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px;">🚗</span> Koszty Stałe i Flotowe</strong>');
        html.push('<span id="acc-car-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span></div>');
        html.push('<div id="acc-car" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">');
        
        html.push('<div style="background:rgba(255,255,255,0.02); padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); margin-bottom:15px;">');
        html.push('<p style="font-size:0.75rem; color:#10b981; margin-top:0; font-weight:700;">Te koszty potrącamy od razu przy starcie zmiany, aby pasek Celu Netto rósł od minusa (zawsze wiesz ile musisz odrobić!).</p>');
        
        html.push('<div class="inp-group" style="margin-bottom:15px;"><label style="'+lblStyle+'">Wynajem Auta (Opłata Tygodniowa)</label><div style="position:relative;"><input type="number" id="us-car-rent" value="'+carRent+'" placeholder="np. 600" style="'+inpStyle+' padding-right:40px;"><span style="position:absolute; right:15px; top:16px; color:var(--muted); font-weight:700;">zł</span></div></div>');
        
        html.push('<div class="inp-group" style="margin-bottom:15px;"><label style="'+lblStyle+'">ZUS i Księgowość (Opłata Miesięczna)</label><div style="position:relative;"><input type="number" id="us-zus" value="'+zusCost+'" placeholder="np. 1800" style="'+inpStyle+' padding-right:40px;"><span style="position:absolute; right:15px; top:16px; color:var(--muted); font-weight:700;">zł</span></div></div>');
        
        html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Inne stałe (Opłata Dzienna)</label><div style="position:relative;"><input type="number" id="us-fixed-daily" value="'+fixedDaily+'" placeholder="np. 20" style="'+inpStyle+' padding-right:40px;"><span style="position:absolute; right:15px; top:16px; color:var(--muted); font-weight:700;">zł</span></div></div>');
        
        html.push('</div></div></div>');

        // 5. PODATKI I PROWIZJE (Zmienne potrącane w locie)
        let sEFlat = empType === 'flat' ? 'selected' : '';
        let sEPct = empType === 'pct' ? 'selected' : '';
        
        html.push('<div id="acc-tax-parent" class="panel" style="padding:0; border-radius:24px; margin-bottom:25px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 10px 30px rgba(0,0,0,0.4); transition: border-color 0.3s;">');
        html.push('<div onclick="window.toggleAccordion(\'acc-tax\')" style="padding:20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:rgba(14,165,233,0.05);">');
        html.push('<strong style="color:#0ea5e9; font-size:0.85rem; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center;"><span style="font-size:1.5rem; margin-right:12px; filter:drop-shadow(0 0 8px rgba(14,165,233,0.4));">⚖️</span> Prowizje i Podatki (Od obrotu)</strong>');
        html.push('<span id="acc-tax-icon" style="color:var(--muted); font-size:0.8rem;">🔽</span></div>');
        html.push('<div id="acc-tax" style="display:none; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">');
        
        html.push('<div class="inp-group" style="margin-bottom:15px;"><label style="'+lblStyle+'">Model Rozliczenia z Partnerem</label><select id="us-etype" onchange="if(window.dCheckEPct) window.dCheckEPct()" style="'+inpStyle+'"><option value="flat" '+sEFlat+'>Opłata Stała / Abonamentowa</option><option value="pct" '+sEPct+'>Prowizja Procentowa od Utargu</option></select></div>');
        
        html.push('<div id="us-ep-box" style="margin-bottom:20px; background:rgba(14,165,233,0.05); padding:15px; border-radius:14px; border:1px solid rgba(14,165,233,0.2);">');
        if(empType === 'pct') {
            html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' color:#0ea5e9;">Opłata Partnera (%)</label><input type="number" id="us-epct" value="'+ePct+'" style="'+inpStyle+' border-color:rgba(14,165,233,0.4);"></div>');
        } else {
            html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+' color:#0ea5e9;">Opłata Partnera za Rozliczenie (Tygodniowo)</label><input type="number" id="us-efix" value="'+eFix+'" placeholder="np. 50" style="'+inpStyle+' border-color:rgba(14,165,233,0.4);"></div>');
        }
        html.push('</div>');
        
        html.push('<div class="inp-row" style="margin-bottom:15px; padding-top:20px; border-top:1px dashed rgba(255,255,255,0.1); gap:12px;">');
        html.push('<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Podatek Dochodowy (%)</label><input type="number" id="us-tax" value="'+tax+'" step="0.1" style="'+inpStyle+'"></div>');
        html.push('<div class="inp-group" style="margin:0; flex:1;"><label style="'+lblStyle+'">Prowizja Terminala (%)</label><input type="number" id="us-cardf" value="'+cardF+'" step="0.1" style="'+inpStyle+'"></div>');
        html.push('</div>');
        html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Prowizja Voucherów (%)</label><input type="number" id="us-voucherf" value="'+vouchF+'" step="0.1" style="'+inpStyle+'"></div>');
        html.push('</div></div>');

        // 6. WSPARCIE (KUP KAWĘ)
        html.push('<div class="panel" style="padding:35px 20px; border-radius:24px; margin-bottom:20px; text-align:center; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #2a1505 0%, #090500 100%); box-shadow:0 15px 40px rgba(245,158,11,0.15); position:relative; overflow:hidden;">');
        html.push('<div style="position:relative; display:inline-block; font-size:4rem; margin-bottom:15px; filter: drop-shadow(0 4px 15px rgba(245,158,11,0.6));">');
        html.push('<div style="position:absolute; top:-20px; left:10px; font-size:1.5rem; opacity:0; animation: steamRise 2s infinite linear; color:#f59e0b;">〰️</div>');
        html.push('<div style="position:absolute; top:-25px; left:30px; font-size:1.5rem; opacity:0; animation: steamRise 2s infinite linear 0.7s; color:#f59e0b;">〰️</div>');
        html.push('<div style="position:absolute; top:-15px; left:50px; font-size:1.5rem; opacity:0; animation: steamRise 2s infinite linear 1.4s; color:#f59e0b;">〰️</div>');
        html.push('☕</div>');
        html.push('<h3 style="color:#f59e0b; margin:0 0 10px 0; font-size:1.4rem; letter-spacing:1px; text-transform:uppercase; font-weight:900;">Postaw nam kawę!</h3>');
        html.push('<p style="font-size:0.85rem; color:rgba(255,255,255,0.7); margin-bottom:25px; line-height:1.6; font-weight:600;">StyreOS to narzędzie tworzone z pasji, zupełnie za darmo. Jeśli pomaga Ci zarabiać więcej na Taxi, dorzuć się do serwerów i przyspiesz tworzenie wersji PRO!</p>');
        html.push('<a href="https://buycoffee.to/styreos" target="_blank" style="background:linear-gradient(135deg, #ffdd00, #f59e0b); color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:18px; border-radius:20px; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4); font-size:1.05rem; letter-spacing:1px; text-transform:uppercase;">');
        html.push('<span style="font-size:1.4rem;">☕</span> WESPRZYJ PROJEKT</a></div>');

        html.push('</div>');

        // PRZYCISKI ZAPISU I BACKUP
        html.push('<div style="padding:10px 15px; margin-top:10px; margin-bottom:10px;">');
        html.push('<button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; padding:20px; font-size:1.1rem; border-radius:24px; font-weight:900; letter-spacing:1px; box-shadow:0 10px 30px rgba(14,165,233,0.3); width:100%; text-transform:uppercase; border:none; outline:none; cursor:pointer;" onclick="if(window.dSaveUS) window.dSaveUS()">💾 ZAPISZ USTAWIENIA</button>');
        html.push('</div>');
        
        html.push('<div style="display:flex; gap:12px; padding: 0 15px 25px 15px;">');
        html.push('<button class="btn" style="flex:1; background:#18181b; color:#0ea5e9; border:1px solid rgba(14,165,233,0.3); padding:16px; border-radius:20px; font-weight:800; font-size:0.85rem; box-shadow:none; outline:none; cursor:pointer;" onclick="if(window.dExport) window.dExport()">📤 KOPIA ZAPASOWA</button>');
        html.push('<label class="btn" style="flex:1; background:#18181b; color:#f59e0b; border:1px solid rgba(245,158,11,0.3); padding:16px; border-radius:20px; font-weight:800; font-size:0.85rem; box-shadow:none; text-align:center; cursor:pointer; margin-top:0; outline:none; display:flex; align-items:center; justify-content:center;">📥 PRZYWRÓĆ<input type="file" style="display:none;" onchange="if(window.dImport) window.dImport(event)"></label>');
        html.push('</div>');

        html.push('<div style="text-align:center; padding: 20px 0; padding-bottom: 80px;">');
        html.push('<img src="icon-512.png" style="width:50px;height:50px; opacity:0.1; mix-blend-mode:luminosity;" class="float-icon" alt="StyreOS">');
        html.push('<p style="color:var(--muted); font-size:0.6rem; margin-top:8px; text-transform:uppercase; letter-spacing:2px; line-height:1.4;">StyreOS PWA 1.0 Beta<br><span style="opacity:0.6;">Powered by GnomekOK</span></p>');
        html.push('</div>');
        
        html.push(nav || '');
        appContainer.innerHTML = html.join('');

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
    let inpStyle = 'background:rgba(255,255,255,0.03); border-radius:14px; padding:16px; font-size:0.95rem; border:1px solid rgba(255,255,255,0.08); color:#fff; width:100%; box-sizing:border-box; outline:none; font-weight:700; border-color:rgba(14,165,233,0.4);';
    let lblStyle = 'font-size:0.65rem; color:#0ea5e9; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block;';
    
    if(t === 'pct') {
        b.innerHTML = '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Opłata Partnera (%)</label><input type="number" id="us-epct" placeholder="np. 8.5" style="'+inpStyle+'"></div>';
    } else {
        b.innerHTML = '<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Opłata Partnera za Rozliczenie (Tygodniowo)</label><input type="number" id="us-efix" placeholder="np. 50" style="'+inpStyle+'"></div>';
    }
};

window.dSaveUS = function() {
    let safeVal = function(id, def) {
        let el = document.getElementById(id);
        if(el && el.value !== '') return parseFloat(el.value.replace(',', '.')) || (def || 0);
        return def || 0;
    };

    let nameEl = document.getElementById('us-name');
    if(nameEl) window.db.userName = nameEl.value;
    
    if(!window.db.drv.cfg) window.db.drv.cfg = {};

    window.db.drv.q = {
        s: safeVal('q-cfg-s'), w: safeVal('q-cfg-w'),
        t1: safeVal('q-cfg-t1'), t2: safeVal('q-cfg-t2'),
        t3: safeVal('q-cfg-t3'), t4: safeVal('q-cfg-t4')
    };

    window.db.drv.cfg.goalBrutto = safeVal('us-goal-brutto', 400);
    window.db.drv.cfg.goalNetto = safeVal('us-goal-netto', 300);
    window.db.drv.cfg.dailyGoal = safeVal('us-goal-brutto', 400); // Backward compatibility
    
    let cityEl = document.getElementById('us-city');
    window.db.drv.cfg.defCity = cityEl ? cityEl.value : 'Warszawa';
    
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
    
    // Zapisywanie ZUNIFIKOWANYCH Kosztów Stałych i Zmiennych
    window.db.drv.cfg.carRent = safeVal('us-car-rent');
    window.db.drv.cfg.zus = safeVal('us-zus');
    window.db.drv.cfg.fixedDaily = safeVal('us-fixed-daily');
    
    let eTypeEl = document.getElementById('us-etype');
    window.db.drv.cfg.eType = eTypeEl ? eTypeEl.value : 'flat';
    window.db.drv.cfg.eFix = safeVal('us-efix');
    window.db.drv.cfg.ePct = safeVal('us-epct') / 100;
    
    window.db.drv.cfg.tax = safeVal('us-tax') / 100;
    window.db.drv.cfg.cardF = safeVal('us-cardf') / 100;
    window.db.drv.cfg.voucherF = safeVal('us-voucherf') / 100;
    
    // Nadpisz zmienną z błędu (czyszczenie starych zmiennych aby parser nie wariował)
    window.db.drv.cfg.dailyFixedCosts = undefined;
    
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    
    let dailyCosts = window.getFixedDailyCosts();
    if(window.sysAlert) {
        window.sysAlert("Zapisano Ustawienia!", "Twoje stałe koszty dzienne to: " + dailyCosts.toFixed(2) + " zł. Pasek Netto zacznie obliczenia od tej kwoty.", "success");
    } else {
        alert("Zapisano! Codzienne stałe koszty operacyjne: " + dailyCosts.toFixed(2) + " zł");
    }
};
