// ==========================================
// PLIK: taxi_tab_set.js - Zakładka Opcje (UI)
// ==========================================

window.rDrvSet = function(d, t, nav, hdr) {
    let goal = (d.cfg && d.cfg.goal) ? d.cfg.goal : 350;
    let city = (d.cfg && d.cfg.defCity) ? d.cfg.defCity : 'Twoje Miasto';
    let fuelCons = (d.cfg && d.cfg.fuelCons) ? d.cfg.fuelCons : 7;
    let fuelPx = (d.cfg && d.cfg.fuelPriceL) ? d.cfg.fuelPriceL : 6.50;
    // Nowa opcja - źródło paliwa (garage lub manual)
    let fuelSource = (d.cfg && d.cfg.fuelSource) ? d.cfg.fuelSource : 'garage';
    
    // Konfiguracja kosztów stałych
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
    let empPer = (d.cfg && d.cfg.ePeriod) ? d.cfg.ePeriod : 'month';
    
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
        <p>Konfiguracja Profili</p>
        <h1 style="color:var(--taxi); font-size:2.8rem; letter-spacing:-1px;">⚙️ USTAWIENIA</h1>
    </div>
    
    <div class="panel" style="border-color:rgba(255,255,255,0.05);">
        <div class="p-title">Personalizacja i Miasto 👤</div>
        <div class="inp-row">
            <div class="inp-group"><label>Imię kierowcy</label><input type="text" id="us-name" value="${window.db.userName || ''}" placeholder="np. Mateusz"></div>
            <div class="inp-group"><label>Cel dzienny (zł)</label><input type="number" id="us-goal" value="${goal}"></div>
        </div>
        <div class="inp-group" style="margin-bottom:10px;">
            <label>Domyślne Miasto (Dla Map)</label>
            <input type="text" id="us-city" value="${city}" placeholder="np. Szczecin">
        </div>
    </div>
    
    <div class="panel" style="border-color:var(--warning); background:rgba(234,179,8,0.01);">
        <div class="p-title" style="color:var(--warning); border-color:rgba(234,179,8,0.1);">⛽ KOSZTY PALIWA NA KM</div>
        
        <div class="inp-group" style="margin-bottom:15px;">
            <label style="color:var(--warning);">Skąd brać dane o spalaniu?</label>
            <select id="us-fuel-src" style="background:#000; border-color:rgba(234,179,8,0.3);">
                <option value="garage" ${fuelSource==='garage'?'selected':''}>Dziennik Garażu (Full-to-Full / Fuelio) - Zalecane</option>
                <option value="manual" ${fuelSource==='manual'?'selected':''}>Z ryczałtu wpisanego poniżej</option>
            </select>
        </div>
        
        <div class="inp-row" style="margin-bottom:12px;">
            <div class="inp-group" style="background:rgba(0,0,0,0.3); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.03);">
                <label style="color:var(--muted); font-size:0.6rem;">Średnie spalanie (L/100km)</label>
                <input type="number" step="0.1" id="us-fcons" value="${Number(fuelCons).toFixed(1)}" style="background:transparent; border:none; box-shadow:none; text-align:center; font-size:1.4rem; padding:0; height:30px;">
            </div>
            <div class="inp-group" style="background:rgba(0,0,0,0.3); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.03);">
                <label style="color:var(--muted); font-size:0.6rem;">Cena paliwa na stacji (ZŁ/L)</label>
                <input type="number" step="0.01" id="us-fprice" value="${Number(fuelPx).toFixed(2)}" style="background:transparent; border:none; box-shadow:none; text-align:center; font-size:1.4rem; padding:0; height:30px;">
            </div>
        </div>
        
        <p style="font-size:0.75rem; color:var(--muted); margin:0; text-align:center; line-height:1.4; opacity:0.8;">Wypełnij ręcznie, jeśli nie chcesz prowadzić dokładnego dziennika tankowań (zakładka Garaż). Aplikacja sama wyliczy koszt kilometra na bazie tych ryczałtowych liczb.</p>
    </div>
    
    <div class="panel" style="border-color:rgba(255,255,255,0.05);">
        <div class="p-title">Koszty Auta, Bazy i ZUS 🚗</div>
        <div class="inp-row">
            <div class="inp-group">
                <label>System</label>
                <input type="text" value="${plat==='apps'?'Aplikacje':'Korporacja'}" disabled style="color:var(--muted);">
            </div>
            ${plat === 'corp' ? `
            <div class="inp-group">
                <label>Baza (zł)</label>
                <input type="number" id="us-cc" value="${corpBaseC}">
            </div>
            <div class="inp-group">
                <label>Okres</label>
                <select id="us-city" value="${city}"></select>
                    <option value="week" ${corpPeriod==='week'?'selected':''}>Tydzień</option>
                    <option value="month" ${corpPeriod==='month'?'selected':''}>Miesiąc</option>
                </select>
            </div>
            ` : ''}
        </div>
        
        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>Rodzaj Auta</label>
                <input type="text" value="${carType==='own'?'Własne':carType==='lease'?'Leasing':'Wynajem'}" disabled style="color:var(--muted);">
            </div>
            ${carType !== 'own' ? `
            <div class="inp-group">
                <label>Rata / Wynajem (zł)</label>
                <input type="number" id="us-cc" value="${carC}">
            </div>
            <div class="inp-group">
                <label>Okres</label>
                <select id="us-city" value="${city}"></select>
                    <option value="week" ${carPer==='week'?'selected':''}>Tydzień</option>
                    <option value="month" ${carPer==='month'?'selected':''}>Miesiąc</option>
                </select>
            </div>
            ` : ''}
        </div>
        
        <div class="inp-row" style="margin-top:10px;">
            <div class="inp-group">
                <label>Zatrudnienie</label>
                <input type="text" value="${emp==='partner'?'U Partnera':'JDG'}" disabled style="color:var(--muted);">
            </div>
            <div class="inp-group">
                <label>${emp==='partner'?'Rozliczenie Umowy':'Koszty Stałe / ZUS (zł)'}</label>
                ${emp==='partner' ? `
                    <select id="us-etype" onchange="window.dCheckEPct()">
                        <option value="flat" ${empType==='flat'?'selected':''}>Kwota Stała</option>
                        <option value="pct" ${empType==='pct'?'selected':''}>Procent Utargu</option>
                    </select>
                ` : `
                    <input type="number" id="us-ec" value="${empC}">
                `}
            </div>
        </div>
        
        <div id="us-ep-box" style="margin-top:10px;">
            ${emp==='partner' && empType==='flat' ? `
                <div class="inp-row">
                    <div class="inp-group"><label>Kwota stała umowy (zł)</label><input type="number" id="us-ec" value="${empC}"></div>
                    <div class="inp-group"><label>Okres</label><select id="us-city" value="${city}"></select><option value="week" ${empPer==='week'?'selected':''}>Tydzień</option><option value="month" ${empPer==='month'?'selected':''}>Miesiąc</option></select></div>
                </div>
            ` : ''}
            ${emp==='partner' && empType==='pct' ? `
                <div class="inp-group"><label>Prowizja partnera (%)</label><input type="number" id="us-epct" value="${empPct}"></div>
            ` : ''}
            ${emp==='jdg' ? `
                <div class="inp-group" style="margin-top:10px;"><label>Okres kosztów JDG/ZUS</label><select id="us-city" value="${city}"></select><option value="week" ${empPer==='week'?'selected':''}>Tydzień</option><option value="month" ${empPer==='month'?'selected':''}>Miesiąc</option></select></div>
            ` : ''}
        </div>
        
        <div class="inp-row" style="margin-top:15px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
            <div class="inp-group"><label>ZUS Ubezpieczenie Auto (zł)</label><input type="number" id="us-ic" value="${insC}"></div>
            <div class="inp-group"><label>Okres</label><select id="us-city" value="${city}"></select><option value="week" ${insPer==='week'?'selected':''}>Tydzień</option><option value="month" ${insPer==='month'?'selected':''}>Miesiąc</option></select></div>
        </div>
    </div>
    
    <div class="panel" style="border-color:rgba(255,255,255,0.05);">
        <div class="p-title">Podatki i Prowizje Płatności ⚖️</div>
        <div class="inp-row">
            <div class="inp-group"><label>Twoja stawka podatku (%)</label><input type="number" id="us-tx" value="${tax}" step="0.1"></div>
            <div class="inp-group"><label>Prowizja terminala (%)</label><input type="number" id="us-cf" value="${cardF}" step="0.1"></div>
        </div>
        <div class="inp-group" style="margin-top:10px;">
            <label>Obsługa terminala</label>
            <select id="us-utype">
                <option value="corp" ${uType==='corp'?'selected':''}>Terminal Korporacyjny</option>
                <option value="own" ${uType==='own'?'selected':''}>Własny terminal SumUp/iZettle (liczy prowizję w koszty)</option>
            </select>
        </div>
        ${uType==='own' ? `
            <div class="inp-group" style="margin-top:10px;"><label>Koszt terminala własnego (zł/mies)</label><input type="number" id="us-uc" value="${uC}"></div>
        ` : ''}
        <div class="inp-group" style="margin-top:10px;">
            <label>Prowizja Voucherów (%) (Opcjonalnie)</label>
            <input type="number" id="us-vf" value="${vouchF}" placeholder="0" step="0.1">
        </div>
    </div>

    <div style="padding:0 12px; margin-bottom:20px;">
        <button class="btn btn-live" onclick="window.dSaveUS()">ZAPISZ WSZYSTKIE OPCJE</button>
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
        b.innerHTML = `<div class="inp-group"><label>Prowizja partnera (%)</label><input type="number" id="us-epct" placeholder="np. 50"></div>`;
    } else {
        b.innerHTML = `
            <div class="inp-row">
                <div class="inp-group"><label>Kwota stała umowy (zł)</label><input type="number" id="us-ec" placeholder="np. 50"></div>
                <div class="inp-group"><label>Okres</label><select id="us-city" value="${city}"></select><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div>
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
