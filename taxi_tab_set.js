// ==========================================
// PLIK: taxi_tab_set.js - Zakładka Opcje (UI)
// ==========================================

window.rDrvSet = function(d, t, nav, hdr) {
    let goal = (d.cfg && d.cfg.goal) ? d.cfg.goal : 350;
    let city = (d.cfg && d.cfg.defCity) ? d.cfg.defCity : 'Szczecin';
    let fuelCons = (d.cfg && d.cfg.fuelCons) ? d.cfg.fuelCons : 7;
    let fuelPx = (d.cfg && d.cfg.fuelPriceL) ? d.cfg.fuelPriceL : 6.50;
    let fuelSource = (d.cfg && d.cfg.fuelSource) ? d.cfg.fuelSource : 'garage';
    
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

    APP.innerHTML = `
    ${hdr}
    <div class="dash-hero" style="padding-bottom: 5px;">
        <p>KONFIGURACJA PROFILI</p>
        <h1 style="color:var(--info); font-size:3.2rem; letter-spacing:-1px;">⚙️ OPCJE</h1>
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
        
        <div class="inp-group" style="margin-bottom:15px;">
            <label style="color:var(--fuel);">SKĄD BRAĆ DANE O SPALANIU?</label>
            <select id="us-fuel-src" style="background:#000; border-color:rgba(245,158,11,0.3);">
                <option value="garage" ${fuelSource==='garage'?'selected':''}>Dziennik Garażu (Zalecane / Dokładne)</option>
                <option value="manual" ${fuelSource==='manual'?'selected':''}>Z ryczałtu wpisanego poniżej</option>
            </select>
        </div>
        
        <div class="inp-row" style="margin-bottom:5px;">
            <div class="inp-group">
                <label>ŚREDNIE SPALANIE (L/100KM)</label>
                <input type="number" step="0.1" id="us-fcons" value="${Number(fuelCons).toFixed(1)}" style="background:rgba(0,0,0,0.5);">
            </div>
            <div class="inp-group">
                <label>CENA PALIWA NA STACJI (ZŁ/L)</label>
                <input type="number" step="0.01" id="us-fprice" value="${Number(fuelPx).toFixed(2)}" style="background:rgba(0,0,0,0.5);">
            </div>
        </div>
        <p style="font-size:0.7rem; color:var(--muted); margin:10px 0 0 0; text-align:center; opacity:0.8;">Wypełnij ręcznie, jeśli nie chcesz prowadzić dziennika tankowań. Aplikacja zignoruje Garaż i wyliczy koszt kilometra na bazie tych liczb.</p>
    </div>
    
    <div class="panel" style="border-color:rgba(255,255,255,0.05); background:linear-gradient(145deg, #1e1b4b, #09090b);">
        <div class="p-title" style="color:var(--driver);">🚗 KOSZTY AUTA I BAZY</div>
        
        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>RODZAJ AUTA</label>
                <input type="text" value="${carType==='own'?'Własne':carType==='lease'?'Leasing':'Wynajem'}" disabled style="color:var(--muted); background:rgba(0,0,0,0.3);">
            </div>
            <div class="inp-group">
                <label>RATA / WYNAJEM (ZŁ)</label>
                <input type="number" id="us-cc" value="${carC}" style="background:rgba(0,0,0,0.5);">
            </div>
            <div class="inp-group">
                <label>OKRES</label>
                <select id="us-ctype" style="background:#000;">
                    <option value="week" ${carPer==='week'?'selected':''}>Tydzień</option>
                    <option value="month" ${carPer==='month'?'selected':''}>Miesiąc</option>
                </select>
            </div>
        </div>

        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>BAZA / KORPO (ZŁ)</label>
                <input type="number" id="us-bc" value="${corpBaseC}" style="background:rgba(0,0,0,0.5);">
            </div>
            <div class="inp-group">
                <label>OKRES</label>
                <select id="us-b-period" style="background:#000;">
                    <option value="week" ${corpPeriod==='week'?'selected':''}>Tydzień</option>
                    <option value="month" ${corpPeriod==='month'?'selected':''}>Miesiąc</option>
                </select>
            </div>
        </div>

        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>INNE (KSIĘGOWA ITP.)</label>
                <input type="number" id="us-uc" value="${uC}" style="background:rgba(0,0,0,0.5);">
            </div>
            <div class="inp-group">
                <label>OKRES</label>
                <select id="us-utype" style="background:#000;">
                    <option value="week" ${uType==='week'?'selected':''}>Tydzień</option>
                    <option value="month" ${uType==='month'?'selected':''}>Miesiąc</option>
                </select>
            </div>
        </div>

        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>UBEZPIECZENIE (ZŁ)</label>
                <input type="number" id="us-ic" value="${insC}" style="background:rgba(0,0,0,0.5);">
            </div>
            <div class="inp-group">
                <label>OKRES</label>
                <select id="us-i-period" style="background:#000;">
                    <option value="week" ${insPer==='week'?'selected':''}>Tydzień</option>
                    <option value="month" ${insPer==='month'?'selected':''}>Miesiąc</option>
                </select>
            </div>
        </div>
    </div>
    
    <div class="panel" style="border-color:rgba(255,255,255,0.05); background:linear-gradient(145deg, #0c4a6e, #09090b);">
        <div class="p-title" style="color:var(--info);">⚖️ PODATKI I PROWIZJE</div>
        
        <div class="inp-group" style="margin-bottom:15px;">
            <label>ROZLICZENIE Z PARTNEREM / ZUS</label>
            <select id="us-etype" onchange="window.dCheckEPct()" style="background:#000;">
                <option value="flat" ${empType==='flat'?'selected':''}>Stała kwota (Partner / ZUS)</option>
                <option value="pct" ${empType==='pct'?'selected':''}>Procent Utargu</option>
            </select>
        </div>

        <div id="us-ep-box">
            ${empType === 'pct' ? `
                <div class="inp-group"><label>PROWIZJA PARTNERA (%)</label><input type="number" id="us-epct" value="${empPct}" style="background:rgba(0,0,0,0.5);"></div>
            ` : `
                <div class="inp-row">
                    <div class="inp-group"><label>KWOTA STAŁA (ZŁ)</label><input type="number" id="us-ec" value="${empC}" style="background:rgba(0,0,0,0.5);"></div>
                    <div class="inp-group"><label>OKRES</label>
                        <select id="us-e-period" style="background:#000;">
                            <option value="week" ${empPer==='week'?'selected':''}>Tydzień</option>
                            <option value="month" ${empPer==='month'?'selected':''}>Miesiąc</option>
                        </select>
                    </div>
                </div>
            `}
        </div>

        <div class="inp-row" style="margin-top:15px;">
            <div class="inp-group"><label>TWOJA STAWKA PODATKU (%)</label><input type="number" id="us-tx" value="${tax}" step="0.1" style="background:rgba(0,0,0,0.5);"></div>
            <div class="inp-group"><label>PROWIZJA TERMINALA (%)</label><input type="number" id="us-cf" value="${cardF}" step="0.1" style="background:rgba(0,0,0,0.5);"></div>
        </div>
    </div>

    <div style="padding:0 12px; margin-bottom:20px;">
        <button class="btn btn-info" style="padding:18px; font-size:1.1rem; box-shadow:0 8px 25px rgba(14,165,233,0.3);" onclick="window.dSaveUS()">ZAPISZ WSZYSTKIE OPCJE</button>
    </div>
    
    <div style="text-align:center; padding: 20px 0;">
        <img src="icon-512.png" style="width:70px;height:70px; opacity:0.1; mix-blend-mode:luminosity;" class="float-icon">
        <p style="color:var(--muted); font-size:0.6rem; margin-top:10px;">StyreOS Pro Core v1.01 Alpha<br>Powered by technic1251 Solutions</p>
    </div>
    
    <input type="file" id="h-import-file" style="display:none;" onchange="window.dImport(event)">
    <input type="file" id="d-import-file" style="display:none;" onchange="window.dImport(event)">

    ${nav}`;
};

// Funkcje pomocnicze dla UI Opcji
window.dCheckEPct = function() {
    let t = document.getElementById('us-etype').value;
    let b = document.getElementById('us-ep-box');
    if(t === 'pct') {
        b.innerHTML = `<div class="inp-group"><label>PROWIZJA PARTNERA (%)</label><input type="number" id="us-epct" placeholder="np. 50" style="background:rgba(0,0,0,0.5);"></div>`;
    } else {
        b.innerHTML = `
            <div class="inp-row">
                <div class="inp-group"><label>KWOTA STAŁA (ZŁ)</label><input type="number" id="us-ec" placeholder="np. 50" style="background:rgba(0,0,0,0.5);"></div>
                <div class="inp-group"><label>OKRES</label><select id="us-e-period" style="background:#000;"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div>
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
