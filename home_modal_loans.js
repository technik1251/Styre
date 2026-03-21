// ==========================================
// PLIK: home_modal_loans.js - Modale Zobowiązań (Kredyty, Karty, PayPo)
// ==========================================

window.hToggleLoanFields = function() {
    let type = document.getElementById('ml-type').value; 
    let isCard = (type === 'Karta');
    let isBNPL = (type === 'PayPo'); 
    let isPrywWplyw = (type === 'Prywatny_WPLYW');
    let isPrywWydatek = (type === 'Prywatny_WYDATEK');
    let isPryw = isPrywWplyw || isPrywWydatek;
    let isKredyt = (type === 'Kredyt' || type === 'Leasing');

    let lblBor = document.getElementById('lbl-borrowed');
    let lblKap = document.getElementById('lbl-kapital');

    if(isCard) {
        lblBor.innerText = 'Przyznany Limit Karty (zł)';
        lblKap.innerText = 'Bieżące Zadłużenie na Karcie (zł)';
    }
    else if(isBNPL) {
        lblBor.innerText = 'Wartość Koszyka (Wartość Towaru Bez Kosztów)';
        lblKap.innerText = 'Zadłużenie na dziś (Z Prowizją / Po 30 dniach)';
        document.getElementById('lbl-left-inst').innerText = 'Ile rat POZOSTAŁO?';
        document.getElementById('lbl-total-inst').innerText = 'Z ilu rat wzięto (ŁĄCZNIE)?';
    }
    else if(isPryw) {
        lblBor.innerText = 'Całkowita kwota pożyczki (zł)';
        lblKap.innerText = 'Kwota do spłaty NA DZIŚ (zł)';
    }
    else {
        lblBor.innerText = 'Początkowa Kwota Umowy (zł)';
        lblKap.innerText = 'Kapitał do spłaty NA DZIŚ (zł)';
        document.getElementById('lbl-left-inst').innerText = 'Ile rat ZOSTALO?';
        document.getElementById('lbl-total-inst').innerText = 'Z ilu rat został wzięty? (Całkowita ilość)';
    }

    // Widoczność sekcji
    document.getElementById('row-rates-1').style.display = (isKredyt || isCard) ? 'flex' : 'none'; 
    document.getElementById('row-card-opts').style.display = isCard ? 'flex' : 'none'; 
    document.getElementById('row-rates-2').style.display = (isKredyt || isBNPL) ? 'flex' : 'none'; 
    document.getElementById('row-total-inst').style.display = (isKredyt || isBNPL) ? 'block' : 'none';
    
    document.getElementById('paypo-dates').style.display = isBNPL ? 'flex' : 'none'; 
    document.getElementById('group-day').style.display = (isKredyt || isCard) ? 'block' : 'none'; 
    
    document.getElementById('custom-schedule-box').style.display = isPryw ? 'block' : 'none';
    document.getElementById('pryw-typ-splaty').style.display = isPryw ? 'block' : 'none';

    // Obsługa wyłączania pól w BNPL
    let kapEl = document.getElementById('ml-kapital');
    if(isBNPL) {
        kapEl.disabled = true; 
        kapEl.style.opacity = '0.5';
    } else {
        kapEl.disabled = false; 
        kapEl.style.opacity = '1';
    }

    window.hTogglePrywType(); 
    window.hCalcBNPL();
};

window.hTogglePrywType = function() {
    let mode = document.getElementById('pryw-mode') ? document.getElementById('pryw-mode').value : 'custom';
    if (document.getElementById('custom-schedule-wrap')) {
        document.getElementById('custom-schedule-wrap').style.display = mode === 'custom' ? 'block' : 'none';
    }
    if (document.getElementById('equal-schedule-wrap')) {
        document.getElementById('equal-schedule-wrap').style.display = mode === 'equal' ? 'flex' : 'none';
    }
};

window.hAddCustomTransza = function(amt = '', date = '', id = Date.now(), isPaid = false) {
    let wrap = document.getElementById('cs-wrap');
    if(!wrap) return;
    let div = document.createElement('div');
    div.className = 'cs-row';
    div.dataset.id = id;
    div.dataset.paid = isPaid;
    div.style = "display:flex; gap:10px; margin-bottom:10px; align-items:center;";
    div.innerHTML = `
        <input type="number" step="0.01" class="cs-amt" placeholder="Kwota (np. 1500)" value="${amt}" style="flex:1; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;" oninput="window.hCalcCustomTotal()" ${isPaid?'disabled':''}>
        <input type="date" class="cs-date" value="${date}" style="flex:1; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;" ${isPaid?'disabled':''}>
        <button class="btn" style="width:auto; padding:12px; margin:0; background:rgba(239,68,68,0.2); color:var(--danger);" onclick="this.parentElement.remove(); window.hCalcCustomTotal();" ${isPaid?'disabled':''}>🗑️</button>
    `;
    wrap.appendChild(div);
};

window.hCalcCustomTotal = function() {
    let sum = 0;
    document.querySelectorAll('.cs-amt').forEach(inp => sum += (parseFloat(inp.value) || 0));
    let kEl = document.getElementById('ml-kapital');
    let bEl = document.getElementById('ml-borrowed');
    
    let info = document.getElementById('cs-info');
    if(!info) return;
    let target = parseFloat(kEl.value) || parseFloat(bEl.value) || 0;
    
    if(target > 0) {
        if(sum === target) {
            info.innerHTML = `<span style="color:var(--success)">✅ Suma transz zgadza się z kapitałem (${sum} zł)</span>`;
        } else {
            info.innerHTML = `<span style="color:var(--warning)">⚠️ Suma transz (${sum} zł) różni się od kapitału (${target} zł)</span>`;
        }
    }
};

window.hCalcBNPL = function() {
    let type = document.getElementById('ml-type').value;
    if(type === 'PayPo') {
        let rata = parseFloat(document.getElementById('ml-rata').value) || 0;
        let iloscZostalo = parseInt(document.getElementById('ml-left-inst').value) || 0;
        let koszyk = parseFloat(document.getElementById('ml-borrowed').value) || 0;
        let kapEl = document.getElementById('ml-kapital');
        
        let pozostaleZOdsetkami = rata * iloscZostalo;
        
        if (pozostaleZOdsetkami > 0) {
            kapEl.value = pozostaleZOdsetkami.toFixed(2);
        } else {
            kapEl.value = koszyk > 0 ? koszyk.toFixed(2) : '';
        }
    }
};

window.hOpenLoanModal = function(id = null, forceCard = false) {
    window.hInitDb();
    let ln = id ? window.db.home.loans.find(x => x.id == id) : null; 
    let isC = (ln && ln.type === 'Karta') || forceCard;
    let mPay = ln && ln.minPayPct ? ln.minPayPct : 5;
    let dPay = ln && ln.declaredPay ? ln.declaredPay : '100';
    let today = window.getLocalYMD().substring(0,10);
    
    let html = `<div id="m-loan" class="modal-overlay"><div class="panel" style="width:100%; max-width:380px; background:#18181b; border:1px solid rgba(255,255,255,0.1); max-height:90vh; overflow-y:auto;">
        <h3 style="margin-top:0; color:#fff; display:flex; align-items:center; gap:10px;">${ln ? '✏️ Edytuj Zobowiązanie' : '🏦 Nowe Zobowiązanie'}</h3>
        
        <div class="inp-group" style="margin-bottom:12px;"><label>Typ zobowiązania</label>
            <select id="ml-type" onchange="window.hToggleLoanFields()" style="background:#09090b; border-color:var(--info); color:var(--info); font-weight:bold;" ${ln ? 'disabled' : ''}>
                <option value="PayPo" ${(!ln && !isC) || (ln&&ln.type==='PayPo')?'selected':''}>🛍️ Odroczone / BNPL (np. PayPo)</option>
                <option value="Kredyt" ${ln&&ln.type==='Kredyt'?'selected':''}>🏦 Kredyt Gotówkowy / Hipoteka</option>
                <option value="Leasing" ${ln&&ln.type==='Leasing'?'selected':''}>🚗 Leasing</option>
                <option value="Prywatny_WPLYW" ${ln&&ln.type==='Prywatny_WPLYW'?'selected':''}>🟢 Pożyczka Prywatna (Ktoś MI wisi / Wpływ)</option>
                <option value="Prywatny_WYDATEK" ${ln&&ln.type==='Prywatny_WYDATEK'?'selected':''}>🔴 Pożyczka Prywatna (Ja KOMUŚ wiszę / Wydatek)</option>
                <option value="Karta" ${isC?'selected':''}>💳 Karta Kredytowa</option>
            </select>
            ${ln ? `<small style="color:var(--muted); font-size:0.65rem; display:block; margin-top:4px;">Typu nie można zmienić po utworzeniu.</small>` : ''}
        </div>

        <div class="inp-group" style="margin-bottom:12px;"><label>Nazwa</label><input type="text" id="ml-n" value="${ln?ln.n:''}"></div>
        <div class="inp-group" style="margin-bottom:12px;"><label>Konto powiązane ze spłatą</label><select id="ml-acc" style="background:#09090b;">${window.db.home.accs.map(a => `<option value="${a.id}" ${a.id==(ln?ln.accId:'')?'selected':''}>${a.n}</option>`).join('')}</select></div>
        
        <div class="inp-group" style="margin-bottom:12px; border:1px solid var(--success); padding:10px; border-radius:12px; background:rgba(34,197,94,0.05);"><label id="lbl-borrowed" style="color:var(--success);">Wartość początkowa</label><input type="number" step="0.01" id="ml-borrowed" value="${ln?(parseFloat(ln.borrowed)||0):''}" placeholder="np. 237" style="color:var(--success); font-weight:bold;" oninput="window.hCalcBNPL()"></div>
        
        <div id="row-rates-2" class="inp-row" style="margin-bottom:12px; display:flex;">
            <div class="inp-group" id="group-rata"><label>Kwota JEDNEJ raty (zł)</label><input type="number" step="0.01" id="ml-rata" value="${ln?(ln.rata||''):''}" oninput="window.hCalcBNPL()"></div>
            <div class="inp-group" style="flex:1;"><label id="lbl-left-inst">Ile rat ZOSTALO?</label><input type="number" id="ml-left-inst" value="${ln?(ln.installmentsLeft||''):''}" oninput="window.hCalcBNPL()"></div>
        </div>

        <div class="inp-group" id="row-total-inst" style="margin-bottom:12px; display:none;">
            <label id="lbl-total-inst">Z ilu rat został wzięty? (Całkowita ilość)</label>
            <input type="number" id="ml-total-inst" value="${ln?(ln.totalInst||''):''}" oninput="window.hCalcBNPL()">
        </div>

        <div class="inp-group" style="margin-bottom:15px;"><label id="lbl-kapital">Całkowita kwota do spłaty na dziś (zł)</label><input type="number" step="0.01" id="ml-kapital" value="${ln?(ln.kapital||''):''}" style="border-color:var(--danger); color:var(--danger); background:rgba(239,68,68,0.05);"></div>

        <div id="paypo-dates" class="inp-row" style="margin-bottom:12px; display:none;">
            <div class="inp-group"><label>Data zakupu (Odroczenie)</label><input type="date" id="ml-pp-start" value="${ln&&ln.startDate?ln.startDate:today}" style="background:#09090b;"></div>
        </div>

        <div id="row-rates-1" class="inp-row" style="margin-bottom:12px; display:none;"><div class="inp-group"><label>RRSO (%)</label><input type="number" step="0.01" id="ml-pct" value="${ln?(ln.pct||0):0}"></div><div class="inp-group"><label>Typ Oprocentowania</label><select id="ml-int-type" style="background:#09090b;"><option value="Stałe" ${ln&&ln.intType==='Stałe'?'selected':''}>Stałe</option><option value="Zmienne" ${ln&&ln.intType==='Zmienne'?'selected':''}>Zmienne</option></select></div></div>
        
        <div id="pryw-typ-splaty" style="display:none; margin-bottom:15px;">
            <label>Zasady spłaty pożyczki prywatnej</label>
            <select id="pryw-mode" onchange="window.hTogglePrywType()" style="background:#09090b; border-color:var(--success); color:var(--success); font-weight:bold;">
                <option value="custom" ${(ln&&ln.prywMode==='custom')||!ln?'selected':''}>Własny harmonogram / Różne daty</option>
                <option value="equal" ${ln&&ln.prywMode==='equal'?'selected':''}>Równe raty (co miesiąc)</option>
            </select>
        </div>

        <div id="custom-schedule-box" style="display:none; background:rgba(0,0,0,0.3); border:1px dashed rgba(255,255,255,0.2); padding:10px; border-radius:12px; margin-bottom:15px;">
            <div id="custom-schedule-wrap" style="display:none;">
                <label style="color:var(--success); font-size:0.8rem; font-weight:bold; margin-bottom:10px; display:block;">Harmonogram Transz</label>
                <div id="cs-wrap"></div>
                <div id="cs-info" style="font-size:0.75rem; text-align:center; margin-bottom:10px;"></div>
                <button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border:1px dashed rgba(255,255,255,0.3); font-size:0.8rem; padding:10px;" onclick="window.hAddCustomTransza()">+ Dodaj Transzę do Harmonogramu</button>
            </div>
            <div id="equal-schedule-wrap" class="inp-row" style="display:none;">
                <div class="inp-group"><label>Ilość Rat</label><input type="number" id="ml-pryw-inst" value="${ln?(ln.installmentsLeft||''):''}"></div>
                <div class="inp-group"><label>Dzień spłaty</label><input type="number" id="ml-pryw-day" value="${ln?(ln.day||10):10}"></div>
            </div>
        </div>

        <div id="row-card-opts" class="inp-row" style="margin-bottom:12px; display:none;">
            <div class="inp-group"><label>Min. spłata (%)</label><input type="number" step="0.1" id="ml-min-pay" value="${mPay}"></div>
            <div class="inp-group"><label>Deklaracja spłaty</label><select id="ml-dec-pay" style="background:#09090b;"><option value="100" ${dPay==='100'?'selected':''}>100% (Całość)</option><option value="min" ${dPay==='min'?'selected':''}>Minimum</option></select></div>
        </div>

        <div class="inp-group" id="group-day" style="margin-bottom:15px;"><label id="lbl-day">Dzień spłaty w miesiącu (1-31)</label><input type="number" id="ml-day" value="${ln?(ln.day||10):10}"></div>
        
        <button class="btn btn-danger" style="padding:15px; font-weight:900;" onclick="window.hSaveLoan('${id||''}')">ZAPISZ ZOBOWIĄZANIE</button>
        <button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-loan').remove()">ANULUJ</button>
    </div></div>`; 
    
    document.body.insertAdjacentHTML('beforeend', html); 
    window.hToggleLoanFields();
    
    let isPryw = (ln && (ln.type === 'Prywatny_WPLYW' || ln.type === 'Prywatny_WYDATEK'));
    if(isPryw && ln.prywMode === 'custom' && ln.customSchedule) {
        ln.customSchedule.forEach(cs => window.hAddCustomTransza(cs.amt, cs.date, cs.id, cs.isPaid));
        window.hCalcCustomTotal();
    } else if (isPryw && (!ln.prywMode || ln.prywMode === 'custom')) {
        window.hAddCustomTransza(); 
    }
};

window.hSaveLoan = function(id) {
    let n = document.getElementById('ml-n').value; 
    let accId = document.getElementById('ml-acc').value; 
    let type = document.getElementById('ml-type').value; 
    
    let isCard = (type === 'Karta');
    let isBNPL = (type === 'PayPo'); 
    let isKredyt = (type === 'Kredyt' || type === 'Leasing');
    let isPryw = (type === 'Prywatny_WPLYW' || type === 'Prywatny_WYDATEK');
    
    let bor = parseFloat(document.getElementById('ml-borrowed').value) || 0; 
    let k = 0, r = 0, i = 0, ti = 0;

    if (isBNPL) {
        r = parseFloat(document.getElementById('ml-rata').value) || 0;
        i = parseInt(document.getElementById('ml-left-inst').value) || 0;
        ti = parseInt(document.getElementById('ml-total-inst').value) || i; 
        if (r > 0 && i > 0) k = r * i; 
        else k = bor; 
    } else if (isKredyt) {
        k = parseFloat(document.getElementById('ml-kapital').value) || 0;
        r = parseFloat(document.getElementById('ml-rata').value) || 0;
        i = parseInt(document.getElementById('ml-left-inst').value) || 0;
        ti = parseInt(document.getElementById('ml-total-inst').value) || i; 
    } else {
        k = parseFloat(document.getElementById('ml-kapital').value) || 0;
        i = parseInt(document.getElementById('ml-left-inst').value) || 0;
        ti = i;
    }

    if (bor === 0 && k > 0) bor = k;
    
    let d = parseInt(document.getElementById('ml-day').value) || 10;
    if (isPryw && document.getElementById('pryw-mode').value === 'equal') {
        d = parseInt(document.getElementById('ml-pryw-day').value) || 10;
    }
    
    let p = (isKredyt || isCard) ? (parseFloat(document.getElementById('ml-pct').value) || 0) : 0; 
    
    let startDate = window.getLocalYMD().substring(0,10);
    if (isBNPL) startDate = document.getElementById('ml-pp-start') ? document.getElementById('ml-pp-start').value : startDate;
    
    let prywMode = isPryw ? document.getElementById('pryw-mode').value : null;
    if(isPryw && prywMode === 'equal') {
        i = parseInt(document.getElementById('ml-pryw-inst').value) || 0;
        if(i > 0) r = k / i; 
        ti = i;
    }
    
    let minPay = isCard ? (parseFloat(document.getElementById('ml-min-pay').value) || 5) : 0; 
    let decPay = isCard ? document.getElementById('ml-dec-pay').value : '100';

    if(!n) return window.sysAlert ? window.sysAlert("Błąd", "Podaj nazwę!") : alert("Brak nazwy");

    let customSch = [];
    if(isPryw && prywMode === 'custom') {
        document.querySelectorAll('.cs-row').forEach(row => {
            let amt = parseFloat(row.querySelector('.cs-amt').value);
            let date = row.querySelector('.cs-date').value;
            let isPaid = row.dataset.paid === 'true';
            let tId = row.dataset.id || Date.now() + Math.random();
            if(amt > 0 && date) customSch.push({id: tId, amt: amt, date: date, isPaid: isPaid});
        });
        customSch.sort((a,b) => new Date(a.date) - new Date(b.date));
    }

    if(id) { 
        let ln = window.db.home.loans.find(x => x.id == id); 
        if(ln) { 
            ln.n = n; ln.accId = accId; ln.kapital = k; ln.pct = p; ln.borrowed = bor;
            ln.rata = r; ln.installmentsLeft = i; ln.totalInst = ti;
            ln.day = d; ln.type = type; ln.minPayPct = minPay; ln.declaredPay = decPay; ln.startDate = startDate;
            if(isPryw) { ln.customSchedule = customSch; ln.prywMode = prywMode; }
        } 
    } else { 
        let newLoan = {
            id: Date.now(), n: n, accId: accId, kapital: k, pct: p, rata: r, 
            totalInst: ti, installmentsLeft: i, day: d, isClosed: false, 
            intType: 'Stałe', instType: 'Równe', borrowed: bor, type: type, 
            minPayPct: minPay, declaredPay: decPay, startDate: startDate, isConverted: false
        };
        if(isPryw) { newLoan.customSchedule = customSch; newLoan.prywMode = prywMode; }
        window.db.home.loans.push(newLoan); 
    }
    
    window.hSyncSchedule(); window.save(); window.render(); 
    document.getElementById('m-loan').remove();
};

window.hDelLoan = function(id) { 
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie", "Na pewno usunąć to zobowiązanie trwale?", () => { 
            window.db.home.loans = window.db.home.loans.filter(x => x.id != id); 
            window.db.home.trans = window.db.home.trans.filter(x => x.loanId != id); 
            window.hSyncSchedule(); window.save(); window.render(); 
        });
    } else if(confirm("Usunąć?")) {
        window.db.home.loans = window.db.home.loans.filter(x => x.id != id); 
        window.db.home.trans = window.db.home.trans.filter(x => x.loanId != id); 
        window.hSyncSchedule(); window.save(); window.render();
    }
};

window.hCreditHoliday = function(loanId) { 
    let ln = window.db.home.loans.find(x => x.id == loanId); if(!ln) return; 
    let currentM = window.getLocalYMD().substring(0,7); 
    if(ln.holidayMonth === currentM) return window.sysAlert ? window.sysAlert("Błąd", "Już odroczono w tym m-cu.") : alert("Już odroczono"); 
    
    if(window.sysConfirm) {
        window.sysConfirm("Odroczenie 🏖️", "Odroczyć najbliższą ratę na kolejny miesiąc?", () => { 
            ln.holidayMonth = currentM; window.hSyncSchedule(); window.save(); window.render(); 
            window.sysAlert("Sukces!", "Płatność odroczona.", "success"); 
        });
    }
};

// NOWA LOGIKA: Zamykanie długu z PROMPTEM pozwalającym wpisać co do grosza kwotę z PayPo
window.hPayOffCompletely = function(loanId) { 
    let ln = window.db.home.loans.find(x => x.id == loanId); if(!ln) return; 
    
    let realKwotaDoZaplaty = parseFloat(ln.kapital) || 0; 
    
    if (ln.type === 'PayPo') {
        let dzis = new Date();
        let dataZakupu = new Date(ln.startDate || window.getLocalYMD().substring(0,10));
        let roznicaMs = dzis.getTime() - dataZakupu.getTime();
        let dniOdZakupu = Math.floor(roznicaMs / (1000 * 60 * 60 * 24));

        let k = parseFloat(ln.kapital) || 0;
        let bor = parseFloat(ln.borrowed) || k;
        let r = parseFloat(ln.rata) || 0;
        let instL = parseInt(ln.installmentsLeft) || 0;
        let totInst = parseInt(ln.totalInst) || instL || 0;
        let paidCount = totInst - instL;

        if (dniOdZakupu <= 30 && instL === totInst) {
            realKwotaDoZaplaty = bor; 
        } else {
            // Szacunek zniżki (aby podpowiedzieć użytkownikowi), ok. 80% odsetek przyszłych odpada
            let prowizjaCalkowita = (r * totInst) - bor;
            if(prowizjaCalkowita < 0) prowizjaCalkowita = 0;
            let szacowanaZnizka = prowizjaCalkowita * (instL / totInst) * 0.8;
            realKwotaDoZaplaty = (r * instL) - szacowanaZnizka;
        }
    }
    
    if (realKwotaDoZaplaty < 0) realKwotaDoZaplaty = 0;

    // Prompt, który pozwala użytkownikowi wklepać dokładnie to, co widzi w swojej apce bankowej
    let userAmt = prompt(`Całkowita Spłata 🏆\nPayPo i inne banki często obniżają koszty przy wczesnej spłacie.\n\nPodaj dokładną kwotę do spłaty (na podstawie Twojej aplikacji):`, Number(realKwotaDoZaplaty).toFixed(2));

    if (userAmt !== null) {
        let finalAmt = parseFloat(userAmt.replace(',', '.'));
        if (!isNaN(finalAmt) && finalAmt >= 0) {
            let expOrInc = ln.type === 'Prywatny_WPLYW' ? 'inc' : 'exp'; 
            window.db.home.trans.unshift({ 
                id: Date.now(), type: expOrInc, cat: 'Kredyt / Leasing', v: finalAmt, 
                d: 'Spłata całości: ' + ln.n, dt: new Date().toLocaleDateString('pl-PL'), 
                rD: new Date().toISOString(), isPlanned: false, acc: ln.accId || window.db.home.accs[0].id, 
                loanAction: 'close', loanId: ln.id, principalPaid: ln.kapital, instReduced: ln.installmentsLeft 
            }); 
            ln.isClosed = true; ln.kapital = 0; ln.installmentsLeft = 0; 
            if(ln.customSchedule) ln.customSchedule.forEach(cs => cs.isPaid = true);
            window.hSyncSchedule(); window.save(); window.render();
            if(window.sysAlert) window.sysAlert("Zrealizowano! 🎉", `Spłacono i zamknięto!`, "success"); 
        } else {
            if(window.sysAlert) window.sysAlert("Błąd", "Nieprawidłowa kwota.", "error"); 
        }
    }
};

window.hOpenPayLoanModal = function(loanId, transId = null) {
    window.hInitDb();
    let ln = window.db.home.loans.find(x => x.id == loanId); if(!ln) return; 
    
    let defVal = ln.rata;
    let subText = `Kwota z harmonogramu: <strong>${Number(defVal||0).toFixed(2)} zł</strong>`;
    
    if(ln.type === 'Karta') {
        let minP = (ln.kapital * (ln.minPayPct || 5)) / 100;
        if(minP < 50 && ln.kapital > 0) minP = Math.min(50, ln.kapital);
        defVal = (ln.declaredPay === 'min') ? minP : ln.kapital;
        subText = `Zadłużenie: <strong>${Number(ln.kapital||0).toFixed(2)} zł</strong><br>Min. spłata: <strong>${Number(minP||0).toFixed(2)} zł</strong>`;
    } else if (ln.type === 'PayPo') {
        let dzis = new Date();
        let dataZakupu = new Date(ln.startDate || window.getLocalYMD().substring(0,10));
        let dniOdZakupu = Math.floor((dzis.getTime() - dataZakupu.getTime()) / (1000 * 60 * 60 * 24));

        if (dniOdZakupu <= 30) {
            let k = parseFloat(ln.kapital) || 0;
            let bor = parseFloat(ln.borrowed) || k;
            let r = parseFloat(ln.rata) || 0;
            let totInst = parseInt(ln.totalInst) || parseInt(ln.installmentsLeft) || 0;
            let totalZOdsetkami = r * totInst;
            if (totalZOdsetkami === 0) totalZOdsetkami = bor;

            let zaplaconoJuz = totalZOdsetkami - k;
            let zostaloSamegoKoszyka = bor - zaplaconoJuz;
            if(zostaloSamegoKoszyka < 0) zostaloSamegoKoszyka = 0;

            defVal = zostaloSamegoKoszyka;
            subText = `Trwa okres darmowy. Spłacasz tylko koszyk bez prowizji! 🛡️`;
        } else {
            if(!ln.rata || ln.rata === 0) {
                defVal = ln.kapital; 
                subText = `Spłacasz całość zakupu.`;
            } else {
                defVal = ln.rata;
                subText = `Okres darmowy minął. Kwota raty z harmonogramu: <strong>${Number(defVal||0).toFixed(2)} zł</strong>`;
            }
        }
    } else if (ln.type === 'Prywatny_WYDATEK' || ln.type === 'Prywatny_WPLYW') {
        if (ln.prywMode === 'custom') {
            let unpaid = ln.customSchedule ? ln.customSchedule.find(cs => !cs.isPaid) : null;
            if(unpaid) {
                defVal = unpaid.amt;
                subText = `Najbliższa transza (${unpaid.date}): <strong>${Number(defVal).toFixed(2)} zł</strong>`;
            } else {
                defVal = ln.kapital;
                subText = `Brak zaplanowanych transz. Spłata ręczna.`;
            }
        }
    }

    let html = `<div id="m-pay-loan" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:${ln.type==='Prywatny_WPLYW'?'var(--success)':'var(--danger)'};"><h3 style="margin-top:0; color:${ln.type==='Prywatny_WPLYW'?'var(--success)':'var(--danger)'};">${ln.type==='Prywatny_WPLYW'?'📥 Odbierz:':'💸 Spłata:'} ${ln.n}</h3><p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">${subText}</p><div class="inp-group" style="margin-bottom:15px;"><label>Kwota (zł)</label><input type="number" step="0.01" id="mpl-val" value="${Number(defVal||0).toFixed(2)}" class="big-inp" style="color:${ln.type==='Prywatny_WPLYW'?'var(--success)':'var(--danger)'}; background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Konto</label><select id="mpl-acc" style="background:#18181b;">${window.db.home.accs.map(a => `<option value="${a.id}" ${a.id==(ln.accId||window.db.home.accs[0].id)?'selected':''}>${a.n}</option>`).join('')}</select></div><button class="btn" style="background:${ln.type==='Prywatny_WPLYW'?'var(--success)':'var(--danger)'}; color:${ln.type==='Prywatny_WPLYW'?'#000':'#fff'};" onclick="window.hExecPayLoan('${loanId}', '${transId||''}')">POTWIERDŹ</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-pay-loan').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html);
};

window.hExecPayLoan = function(loanId, transId) {
    let val = parseFloat(document.getElementById('mpl-val').value); 
    let accId = document.getElementById('mpl-acc').value; 
    if(!val || val <= 0) return window.sysAlert ? window.sysAlert("Błąd", "Błędna kwota!") : alert("Błędna kwota"); 
    
    let ln = window.db.home.loans.find(x => x.id == loanId);
    if(ln) {
        let principalPaid = 0; let interest = 0;
        
        if (ln.type === 'Karta') {
            if(ln.declaredPay === '100') { principalPaid = val; } 
            else { interest = (ln.kapital * (ln.pct / 100)) / 12; principalPaid = val - interest; }
        } else if (ln.type === 'PayPo' || ln.type === 'Prywatny_WPLYW' || ln.type === 'Prywatny_WYDATEK') {
            principalPaid = val; 
        } else {
            interest = (ln.kapital * (ln.pct / 100)) / 12; 
            principalPaid = val - interest; 
        }
        if(principalPaid < 0) principalPaid = 0; 

        let activeTranszaId = null;
        if((ln.type === 'Prywatny_WPLYW' || ln.type === 'Prywatny_WYDATEK') && ln.customSchedule) {
            let unpaid = ln.customSchedule.find(cs => !cs.isPaid);
            if(unpaid) { unpaid.isPaid = true; unpaid.paidDate = new Date().toISOString(); activeTranszaId = unpaid.id; }
        }

        let expOrInc = ln.type === 'Prywatny_WPLYW' ? 'inc' : 'exp'; 
        let katName = ln.type === 'Prywatny_WPLYW' ? 'Inne Wpływy' : (ln.type === 'Prywatny_WYDATEK' ? 'Inne Wydatki' : 'Kredyt / Leasing');

        window.db.home.trans.unshift({ 
            id: Date.now(), type: expOrInc, cat: katName, v: val, 
            d: 'Rozliczenie: ' + ln.n, dt: new Date().toLocaleDateString('pl-PL'), 
            rD: new Date().toISOString(), isPlanned: false, acc: accId, loanAction: 'pay', 
            loanId: ln.id, principalPaid: principalPaid, instReduced: (ln.type==='Karta' || ln.type==='Prywatny_WPLYW' || ln.type==='Prywatny_WYDATEK') ? 0 : 1,
            transzaId: activeTranszaId 
        });
        
        ln.kapital -= principalPaid; 
        if(ln.type === 'PayPo' || ln.type === 'Kredyt' || ln.type === 'Leasing' || (ln.type.includes('Prywatny') && ln.prywMode === 'equal')) {
            ln.installmentsLeft -= 1; 
        }
        
        if(ln.kapital <= 0) { ln.kapital = 0; ln.installmentsLeft = 0; ln.isClosed = true; }
        
        if(transId) window.db.home.trans = window.db.home.trans.filter(x => x.id != transId); 
        else window.db.home.trans = window.db.home.trans.filter(x => !(x.isPlanned && x.loanId == loanId && x.rD.startsWith(window.getLocalYMD().substring(0,7)))); 
        
        window.hSyncSchedule(); window.save(); window.render(); 
        if(window.sysAlert) window.sysAlert("Zaksięgowano!", `Przetworzono ${Number(val).toFixed(2)} zł w koncie.`, "success");
    }
    document.getElementById('m-pay-loan').remove();
};

window.hOverpayLoan = function(loanId) {
    let ln = window.db.home.loans.find(x => x.id == loanId); if(!ln) return;
    let html = `<div id="m-overpay" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--info);"><h3 style="margin-top:0; color:var(--info);">💰 Nadpłata / Spłata Dowolna</h3><div class="inp-group" style="margin-bottom:15px;"><label>Kwota (zł)</label><input type="number" id="mo-val" placeholder="np. 500" class="big-inp" style="color:var(--info); background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Konto</label><select id="mo-acc" style="background:#18181b;">${window.db.home.accs.map(a => `<option value="${a.id}" ${a.id==(ln.accId||window.db.home.accs[0].id)?'selected':''}>${a.n}</option>`).join('')}</select></div><button class="btn" style="background:var(--info); color:#fff;" onclick="window.hSaveOverpay('${loanId}')">ZAPISZ NADPŁATĘ</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-overpay').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html);
};

window.hSaveOverpay = function(loanId) { 
    let val = parseFloat(document.getElementById('mo-val').value); let accId = document.getElementById('mo-acc').value; 
    if(!val || val <= 0) return window.sysAlert ? window.sysAlert("Błąd", "Wpisz kwotę!") : alert("Błąd"); 
    let ln = window.db.home.loans.find(x => x.id == loanId); 
    if(ln) { 
        let expOrInc = ln.type === 'Prywatny_WPLYW' ? 'inc' : 'exp';
        window.db.home.trans.unshift({ 
            id: Date.now(), type: expOrInc, cat: 'Kredyt / Leasing', v: val, 
            d: 'Nadpłata: ' + ln.n, dt: new Date().toLocaleDateString('pl-PL'), 
            rD: new Date().toISOString(), isPlanned: false, acc: accId, loanAction: 'overpay', 
            loanId: ln.id, principalPaid: val, instReduced: 0 
        }); 
        ln.kapital -= val; 
        if(ln.kapital <= 0) { ln.kapital = 0; ln.isClosed = true; } 
        window.hSyncSchedule(); window.save(); window.render(); 
        if(window.sysAlert) window.sysAlert("Nadpłacono!", `Zmniejszono kapitał.`, "success"); 
    } 
    document.getElementById('m-overpay').remove(); 
};
