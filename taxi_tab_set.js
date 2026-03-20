// ==========================================
// PLIK: taxi_tab_set.js - Zakładka Opcje (UI)
// ==========================================

window.rDrvSet = function(d, t, nav, hdr) {
    let goal = (d.cfg && d.cfg.goal) ? d.cfg.goal : 350;
    let city = (d.cfg && d.cfg.defCity) ? d.cfg.defCity : 'Szczecin';
    let fuelSource = (d.cfg && d.cfg.fuelSource) ? d.cfg.fuelSource : 'garage';
    let fTypes = (d.cfg && d.cfg.fTypes) ? d.cfg.fTypes : ['pb']; 
    
    // Pobranie ręcznych ryczałtów (lub domyślnych, jeśli puste)
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

    APP.innerHTML = `
    ${hdr}
    <div class="dash-hero" style="padding-bottom: 5px;">
        <p>KONFIGURACJA PROFILI</p>
        <h1 style="color:var(--info); font-size:3.2rem; letter-spacing:-1px; text-transform:uppercase;">⚙️ OPCJE</h1>
    </div>
    
    <div class="panel" style="border-color:rgba(217, 70, 239, 0.3); background:linear-gradient(145deg, #1e0a2d, #09090b);">
        <div class="p-title" style="color:#d946ef;">🧮 USTAWIENIA TARYFIKATORA (WYCENA)</div>
        <div class="inp-row">
            <div class="inp-group"><label>OPŁATA POCZĄTKOWA (ZŁ)</label><input type="number" id="q-cfg-s" value="${q.s}" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>1H POSTOJU (ZŁ/H)</label><input type="number" id="q-cfg-w" value="${q.w}" style="background:rgba(0,0,0,0.5);"></div>
        </div>
        <div class="grid-4" style="padding:0; margin-top:10px;">
            <div class="inp-group"><label>T1</label><input type="number" step="0.1" id="q-cfg-t1" value="${q.t1}" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>T2</label><input type="number" step="0.1" id="q-cfg-t2" value="${q.t2}" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>T3</label><input type="number" step="0.1" id="q-cfg-t3" value="${q.t3}" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>T4</label><input type="number" step="0.1" id="q-cfg-t4" value="${q.t4}" style="background:rgba(0,0,0,0.5);"></div>
        </div>
    </div>

    <div class="panel" style="border-color:rgba(255,255,255,0.05); background:linear-gradient(145deg, #0f172a, #09090b);">
        <div class="p-title" style="color:var(--success);">👤 PERSONALIZACJA I MIASTO</div>
        <div class="inp-row">
            <div class="inp-group"><label>TWOJE IMIĘ</label><input type="text" id="us-name" value="${window.db.userName || ''}" placeholder="np. Mateusz" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>CEL DZIENNY (ZŁ)</label><input type="number" id="us-goal" value="${goal}" style="background:rgba(0,0,0,0.5);"></div>
        </div>
        <div class="inp-group" style="margin-bottom:10px;">
            <label>DOMYŚLNE MIASTO (DLA MAP)</label>
            <input type="text" id="us-city" value="${city}" placeholder="np. Szczecin" style="background:rgba(0,0,0,0.5);">
        </div>
    </div>
    
    <div class="panel" style="border-color:rgba(245,158,11,0.2); background:linear-gradient(145deg, #2a1600, #09090b);">
        <div class="p-title" style="color:var(--fuel);">⛽ KOSZTY PALIWA NA KM</div>
        
        <div class="inp-group" style="margin-bottom:15px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:15px;">
            <label style="color:var(--fuel);">JAKIMI PALIWAMI ZASILANE JEST AUTO?</label>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
                <label style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; flex:1; min-width:45%;">
                    <input type="checkbox" id="cb-ftype-pb" value="pb" ${fTypes.includes('pb')?'checked':''} onchange="window.toggleManualFuelBoxes()" style="accent-color:var(--fuel); width:18px; height:18px;"> Benzyna
                </label>
                <label style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; flex:1; min-width:45%;">
                    <input type="checkbox" id="cb-ftype-on" value="on" ${fTypes.includes('on')?'checked':''} onchange="window.toggleManualFuelBoxes()" style="accent-color:var(--fuel); width:18px; height:18px;"> Diesel
                </label>
                <label style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; flex:1; min-width:45%;">
                    <input type="checkbox" id="cb-ftype-lpg" value="lpg" ${fTypes.includes('lpg')?'checked':''} onchange="window.toggleManualFuelBoxes()" style="accent-color:var(--fuel); width:18px; height:18px;"> Gaz (LPG)
                </label>
                <label style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; flex:1; min-width:45%;">
                    <input type="checkbox" id="cb-ftype-ev" value="ev" ${fTypes.includes('ev')?'checked':''} onchange="window.toggleManualFuelBoxes()" style="accent-color:var(--info); width:18px; height:18px;"> Prąd (EV)
                </label>
            </div>
            <div style="font-size:0.65rem; color:var(--muted); margin-top:8px;">Zaznacz zasilanie auta. Garaż i Ryczałt pokażą tylko wybrane opcje.</div>
        </div>

        <div class="inp-group" style="margin-bottom:5px;">
            <label style="color:var(--fuel);">SKĄD BRAĆ DANE O KOSZTACH?</label>
            <select id="us-fuel-src" onchange="window.toggleManualFuelBoxes()" style="background:#000; border-color:rgba(245,158,11,0.3);">
                <option value="garage" ${fuelSource==='garage'?'selected':''}>Dziennik Garażu (Zalecane / Dokładne)</option>
                <option value="manual" ${fuelSource==='manual'?'selected':''}>Z ryczałtu wpisanego poniżej</option>
            </select>
        </div>

        <div id="manual-fuel-wrapper" style="display:${fuelSource==='manual'?'block':'none'}; margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
            <p style="font-size:0.75rem; color:var(--muted); text-align:center; margin-bottom:15px;">Podaj parametry dla zaznaczonych paliw. Aplikacja automatycznie je zsumuje i wyliczy średni łączny koszt na 1 KM.</p>
            
            <div class="grid-2" style="margin-bottom:5px; padding:0 5px;">
                <div style="font-size:0.6rem; color:var(--muted); text-align:center; font-weight:bold;">ŚREDNIE SPALANIE</div>
                <div style="font-size:0.6rem; color:var(--muted); text-align:center; font-weight:bold;">CENA (ZŁ/L lub kWh)</div>
            </div>

            <div id="mf-box-pb" style="display:${fTypes.includes('pb')?'block':'none'}; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                <div style="color:var(--fuel); font-size:0.7rem; font-weight:bold; margin-bottom:8px; text-transform:uppercase;">⛽ Benzyna</div>
                <div class="inp-row" style="margin:0;">
                    <div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="mf-c-pb" value="${mF.pb.c}" style="background:rgba(0,0,0,0.5); text-align:center;"></div>
                    <div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="mf-p-pb" value="${mF.pb.p}" style="background:rgba(0,0,0,0.5); text-align:center;"></div>
                </div>
            </div>

            <div id="mf-box-on" style="display:${fTypes.includes('on')?'block':'none'}; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                <div style="color:var(--fuel); font-size:0.7rem; font-weight:bold; margin-bottom:8px; text-transform:uppercase;">⛽ Diesel</div>
                <div class="inp-row" style="margin:0;">
                    <div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="mf-c-on" value="${mF.on.c}" style="background:rgba(0,0,0,0.5); text-align:center;"></div>
                    <div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="mf-p-on" value="${mF.on.p}" style="background:rgba(0,0,0,0.5); text-align:center;"></div>
                </div>
            </div>

            <div id="mf-box-lpg" style="display:${fTypes.includes('lpg')?'block':'none'}; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                <div style="color:var(--fuel); font-size:0.7rem; font-weight:bold; margin-bottom:8px; text-transform:uppercase;">⛽ Gaz (LPG)</div>
                <div class="inp-row" style="margin:0;">
                    <div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="mf-c-lpg" value="${mF.lpg.c}" style="background:rgba(0,0,0,0.5); text-align:center;"></div>
                    <div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="mf-p-lpg" value="${mF.lpg.p}" style="background:rgba(0,0,0,0.5); text-align:center;"></div>
                </div>
            </div>

            <div id="mf-box-ev" style="display:${fTypes.includes('ev')?'block':'none'}; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                <div style="color:var(--info); font-size:0.7rem; font-weight:bold; margin-bottom:8px; text-transform:uppercase;">⚡ Prąd (EV)</div>
                <div class="inp-row" style="margin:0;">
                    <div class="inp-group" style="margin:0;"><input type="number" step="0.1" id="mf-c-ev" value="${mF.ev.c}" style="background:rgba(0,0,0,0.5); text-align:center;"></div>
                    <div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="mf-p-ev" value="${mF.ev.p}" style="background:rgba(0,0,0,0.5); text-align:center;"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="panel" style="border-color:rgba(255,255,255,0.05); background:linear-gradient(145deg, #1e1b4b, #09090b);">
        <div class="p-title" style="color:var(--driver);">🚗 KOSZTY AUTA I BAZY</div>
        
        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>System</label>
                <input type="text" value="${plat==='apps'?'Aplikacje':'Korporacja'}" disabled style="color:var(--muted); background:rgba(0,0,0,0.3);">
            </div>
            ${plat === 'corp' ? `
                <div class="inp-group"><label>Baza / Korpo (zł)</label><input type="number" id="us-bc" value="${corpBaseC}" style="background:rgba(0,0,0,0.5);"></div>
                <div class="inp-group"><label>Okres</label>
                    <select id="us-b-period" style="background:#000;">
                        <option value="week" ${corpPeriod==='week'?'selected':''}>Tydzień</option>
                        <option value="month" ${corpPeriod==='month'?'selected':''}>Miesiąc</option>
                    </select>
                </div>
            ` : ''}
        </div>
        
        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>Rodzaj Auta</label>
                <input type="text" value="${carType==='own'?'Własne':carType==='lease'?'Leasing':'Wynajem'}" disabled style="color:var(--muted); background:rgba(0,0,0,0.3);">
            </div>
            ${carType !== 'own' ? `
                <div class="inp-group"><label>Rata / Wynajem (zł)</label><input type="number" id="us-cc" value="${carC}" style="background:rgba(0,0,0,0.5);"></div>
                <div class="inp-group"><label>Okres</label>
                    <select id="us-ctype" style="background:#000;">
                        <option value="week" ${carPer==='week'?'selected':''}>Tydzień</option>
                        <option value="month" ${carPer==='month'?'selected':''}>Miesiąc</option>
                    </select>
                </div>
            ` : ''}
        </div>
        
        <div class="inp-row" style="margin-top:15px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
            <div class="inp-group"><label>Księgowa / Inne (zł)</label><input type="number" id="us-uc" value="${uC}" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>Okres</label>
                <select id="us-utype" style="background:#000;">
                    <option value="week" ${uType==='week'?'selected':''}>Tydzień</option>
                    <option value="month" ${uType==='month'?'selected':''}>Miesiąc</option>
                </select>
            </div>
        </div>
        
        <div class="inp-row" style="margin-top:15px;">
            <div class="inp-group"><label>ZUS Ubezp. Auto (zł)</label><input type="number" id="us-ic" value="${insC}" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>Okres</label>
                <select id="us-i-period" style="background:#000;">
                    <option value="week" ${insPer==='week'?'selected':''}>Tydzień</option>
                    <option value="month" ${insPer==='month'?'selected':''}>Miesiąc</option>
                </select>
            </div>
        </div>
    </div>
    
    <div class="panel" style="border-color:rgba(255,255,255,0.05); background:linear-gradient(145deg, #0c4a6e, #09090b);">
        <div class="p-title" style="color:var(--info);">⚖️ PODATKI I PROWIZJE PŁATNOŚCI</div>
        
        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>Zatrudnienie</label>
                <input type="text" value="${emp==='partner'?'U Partnera':'JDG'}" disabled style="color:var(--muted); background:rgba(0,0,0,0.3);">
            </div>
            <div class="inp-group">
                <label>Rodzaj Rozliczenia</label>
                <select id="us-etype" onchange="window.dCheckEPct()" style="background:#000;">
                    <option value="flat" ${empType==='flat'?'selected':''}>Kwota Stała (ZUS/Umowa)</option>
                    <option value="pct" ${empType==='pct'?'selected':''}>Procent Utargu</option>
                </select>
            </div>
        </div>

        <div id="us-ep-box">
            ${empType === 'pct' ? `
                <div class="inp-group"><label>PROWIZJA partnera (%)</label><input type="number" id="us-epct" value="${empPct}" style="background:rgba(0,0,0,0.5);"></div>
            ` : `
                <div class="inp-row">
                    <div class="inp-group"><label>Kwota stała (ZUS/Umowa) (zł)</label><input type="number" id="us-ec" value="${empC}" style="background:rgba(0,0,0,0.5);"></div>
                    <div class="inp-group"><label>Okres</label>
                        <select id="us-e-period" style="background:#000;">
                            <option value="week" ${empPer==='week'?'selected':''}>Tydzień</option>
                            <option value="month" ${empPer==='month'?'selected':''}>Miesiąc</option>
                        </select>
                    </div>
                </div>
            `}
        </div>

        <div class="inp-row" style="margin-top:15px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
            <div class="inp-group"><label>Twoja stawka podatku (%)</label><input type="number" id="us-tx" value="${tax}" step="0.1" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>Prowizja terminala (%)</label><input type="number" id="us-cf" value="${cardF}" step="0.1" style="background:rgba(0,0,0,0.5);"></div>
        </div>
        
        <div class="inp-group" style="margin-top:10px;"><label>Prowizja Voucherów (%) (Opcjonalnie)</label><input type="number" id="us-vf" value="${vouchF}" placeholder="0" step="0.1" style="background:rgba(0,0,0,0.5);"></div>
    </div>

    <div style="padding:0 12px; margin-bottom:20px;">
        <button class="btn btn-info" style="padding:15px; font-size:1.1rem; box-shadow:0 8px 25px rgba(14,165,233,0.3);" onclick="window.dSaveUS()">ZAPISZ WSZYSTKIE OPCJE</button>
    </div>
    
    <div style="text-align:center; padding: 20px 0; padding-bottom: 40px;">
        <img src="icon-512.png" style="width:70px;height:70px; opacity:0.1; mix-blend-mode:luminosity;" class="float-icon">
        <p style="color:var(--muted); font-size:0.65rem; margin-top:10px; text-transform:uppercase; letter-spacing:1px; line-height:1.4;">StyreOS PWA 1.0 Beta<br><span style="opacity:0.6;">Powered by GnomekOK</span></p>
    </div>
    
    <input type="file" id="h-import-file" style="display:none;" onchange="window.dImport(event)">
    <input type="file" id="d-import-file" style="display:none;" onchange="window.dImport(event)">

    ${nav}`;
};

// --- FUNKCJA POKAZUJĄCA DYNAMICZNE RYCZAŁTY ---
window.toggleManualFuelBoxes = function() {
    let src = document.getElementById('us-fuel-src').value;
    let wrap = document.getElementById('manual-fuel-wrapper');
    if(wrap) wrap.style.display = (src === 'manual') ? 'block' : 'none';

    ['pb', 'on', 'lpg', 'ev'].forEach(t => {
        let cb = document.getElementById('cb-ftype-' + t);
        let box = document.getElementById('mf-box-' + t);
        if(cb && box) box.style.display = cb.checked ? 'block' : 'none';
    });
};

// Funkcje pomocnicze dla UI Opcji
window.dCheckEPct = function() {
    let t = document.getElementById('us-etype').value;
    let b = document.getElementById('us-ep-box');
    if(t === 'pct') {
        b.innerHTML = `<div class="inp-group"><label>Prowizja partnera (%)</label><input type="number" id="us-epct" placeholder="np. 50" style="background:rgba(0,0,0,0.5);"></div>`;
    } else {
        b.innerHTML = `
            <div class="inp-row">
                <div class="inp-group"><label>Kwota stała (ZUS/Umowa) (zł)</label><input type="number" id="us-ec" placeholder="np. 50" style="background:rgba(0,0,0,0.5);"></div>
                <div class="inp-group"><label>Okres</label><select id="us-e-period" style="background:#000;"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div>
            </div>`;
    }
};

window.dCrmChange = function() {
    let bl = document.getElementById('dc-bl').checked;
    let b = document.getElementById('dc-btn');
    if(bl) {
        b.innerHTML = "DODAJ DO CZARNEJ LISTY 🚫";
        b.className = "btn btn-danger";
    } else {
        b.innerHTML = "DODAJ DO CRM VIP ★";
        b.className = "btn btn-driver";
    }
};
