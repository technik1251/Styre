// ==========================================
// PLIK: home_modals.js - Akcje i okienka (Modal) Zobowiązań Premium
// ==========================================

window.hExportData = function() { 
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.db)); 
    let dlAnchorElem = document.createElement('a'); 
    dlAnchorElem.setAttribute("href", dataStr); 
    dlAnchorElem.setAttribute("download", "styreos_kopia_" + window.getLocalYMD() + ".json"); 
    dlAnchorElem.click(); 
};

window.hImportTrigger = function() { document.getElementById('h-import-file').click(); };

window.hImportData = function(event) { 
    let file = event.target.files[0]; 
    if(!file) return; 
    let reader = new FileReader(); 
    reader.onload = function(e) { 
        try { 
            let importedDb = JSON.parse(e.target.result); 
            if(importedDb && importedDb.home) { 
                window.db = importedDb; window.save(); 
                if(window.sysAlert) window.sysAlert('Sukces', 'Kopia przywrócona!', 'success'); 
                setTimeout(() => location.reload(), 1500); 
            } else { if(window.sysAlert) window.sysAlert('Błąd', 'Błędny plik.', 'error'); } 
        } catch(err) { if(window.sysAlert) window.sysAlert('Błąd', 'Błąd odczytu.', 'error'); } 
    }; 
    reader.readAsText(file); 
};

// --- AKCJE W INTERFEJSIE ---
window.hChangeMonth = function(dir) { window.hViewDate.setMonth(window.hViewDate.getMonth() + dir); window.render(); };
window.hUseTemplate = function(v, c, note) { let el = document.getElementById('h-v'); if(el) el.value = v; window.hSelCat = c; let dEl = document.getElementById('h-d'); if(dEl) dEl.value = note; window.hCheckLimit(); window.render(); };

window.hCheckLimit = function() { 
    let vEl = document.getElementById('h-v'); let warnEl = document.getElementById('h-warn-limit'); 
    if(!vEl || !warnEl || window.hTransType !== 'exp') { if(warnEl) warnEl.style.display = 'none'; return; } 
    let v = parseFloat(vEl.value) || 0; let cat = window.hSelCat; 
    if(window.db.home.budgets && window.db.home.budgets[cat] && v > 0) { 
        let limit = window.db.home.budgets[cat]; let spent = 0; let now = new Date(); 
        window.db.home.trans.forEach(x => { if(!x.isPlanned && x.type === 'exp' && x.cat === cat && new Date(x.rD).getMonth() === now.getMonth()) spent += parseFloat(x.v) || 0; }); 
        if((spent + v) > limit) { warnEl.innerHTML = `⚠️ Przekroczysz limit o <strong>${Number((spent+v)-limit).toFixed(2)} zł</strong>!`; warnEl.style.display = 'block'; return; } 
    } 
    warnEl.style.display = 'none'; 
};

// --- TRANSAKCJE ---
window.hAction = function() { 
    window.hInitDb();
    let el = document.getElementById('h-v'); 
    if(!el || !el.value) { if(window.sysAlert) return window.sysAlert("Brak kwoty", "Wpisz kwotę."); return; } 
    let v = parseFloat(el.value); let d = document.getElementById('h-d') ? document.getElementById('h-d').value : ''; 
    let who = window.hMem || window.db.home.members[0] || 'Domownik'; 
    let dVal = document.getElementById('h-date') ? document.getElementById('h-date').value : ''; 
    let todayYMD = window.getLocalYMD(); let isPlannedTrans = dVal > todayYMD; 
    let dObj = dVal ? new Date(dVal) : new Date(); if(dVal) dObj.setHours(12,0,0); 
    let recEl = document.getElementById('h-recurring'); let isRecurring = recEl && recEl.value === 'month'; 
    
    if(window.hTransType === 'transfer') { 
        let fAcc = window.hSelAccFrom; let tAcc = window.hSelAccTo; 
        if(!fAcc || !tAcc || fAcc === tAcc) return window.sysAlert ? window.sysAlert("Błąd", "Wybierz 2 różne konta.") : alert("Błąd kont"); 
        window.db.home.trans.push({id:Date.now(), type:'transfer', fromAcc:fAcc, toAcc:tAcc, d:d, v:v, who:who, dt:dObj.toLocaleDateString('pl-PL'), rD:dObj.toISOString(), isPlanned: isPlannedTrans}); 
    } else { 
        let acc = window.hSelAcc || window.db.home.accs[0].id; let c = window.hSelCat; 
        window.db.home.trans.push({id:Date.now(), type:window.hTransType, cat:c, acc:acc, d:d, v:v, who:who, dt:dObj.toLocaleDateString('pl-PL'), rD:dObj.toISOString(), isPlanned: isPlannedTrans}); 
        if(isRecurring) { 
            window.db.home.recurring.push({ id: Date.now()+1, n: d || c, v: v, t: window.hTransType, c: c, a: acc, day: dObj.getDate(), lastBooked: window.getLocalYMD().substring(0,7) }); 
            if(window.sysAlert) setTimeout(()=> window.sysAlert("Zapisano!", "Operacja dodana do automatów.", "success"), 500); 
        } 
    } 
    window.db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD)); 
    window.hSyncSchedule(); window.save(); window.switchTab('dash'); 
};

window.hDelTrans = function(id) { 
    if(window.sysConfirm) window.sysConfirm("Usuwanie", "Na pewno usunąć tę operację?", () => { executeDeleteTrans(id); });
    else if (confirm("Usunąć?")) executeDeleteTrans(id);
};

function executeDeleteTrans(id) {
    window.hInitDb();
    let tr = window.db.home.trans.find(x => x.id == id); 
    if(tr) { 
        if(tr.loanAction) { 
            let ln = window.db.home.loans.find(x => x.id == tr.loanId); 
            if(ln) { 
                ln.kapital = (parseFloat(ln.kapital)||0) + (parseFloat(tr.principalPaid)||0); 
                if(tr.instReduced) ln.installmentsLeft = (parseInt(ln.installmentsLeft)||0) + parseInt(tr.instReduced); 
                if(tr.loanAction === 'close') ln.isClosed = false; 
                
                // Cofanie transz prywatnych
                if(ln.type === 'Prywatny_WPLYW' || ln.type === 'Prywatny_WYDATEK') {
                    if (ln.customSchedule) {
                        let transza = ln.customSchedule.find(cs => cs.id == tr.transzaId);
                        if(transza) { transza.isPaid = false; transza.paidDate = null; }
                    }
                }
            } 
        } 
        if(tr.piggyAction === 'deposit') { 
            let pg = window.db.home.piggy.find(x => x.id == tr.piggyId); 
            if(pg) { pg.saved = (parseFloat(pg.saved)||0) - (parseFloat(tr.amount)||0); if(pg.saved < 0) pg.saved = 0; } 
        } 
    } 
    window.db.home.trans = window.db.home.trans.filter(x => x.id != id); 
    window.hSyncSchedule(); window.save(); window.render(); 
}

window.hEditTrans = function(id) { 
    window.hInitDb();
    let tr = window.db.home.trans.find(x => x.id == id); 
    if(!tr) return; 
    let isSystem = tr.loanAction || tr.piggyAction || tr.debtAction; 
    let html = `<div id="m-edit-h-trans" class="modal-overlay"><div class="panel" style="width:100%; max-width:380px; background: #09090b; border-color:var(--info);"><h3 style="margin-top:0; color:var(--info);">Edytuj operację</h3>${isSystem ? `<p style="font-size:0.75rem; color:var(--warning); margin-bottom:15px; font-weight:bold; background:rgba(245,158,11,0.1); padding:8px; border-radius:8px;">⚠️ Operacja systemowa (Rata/Cel). Zmień kwotę poprzez edycję Zobowiązania, lub usuń wpis.</p>` : ''}<div class="inp-group" style="margin-bottom:15px;"><label>Kwota (zł)</label><input type="number" step="0.01" id="eht-v" value="${Number(tr.v||0).toFixed(2)}" ${isSystem ? 'disabled style="opacity:0.5"' : ''}></div><div class="inp-group" style="margin-bottom:20px;"><label>Data operacji</label><input type="date" id="eht-d" value="${tr.rD.split('T')[0]}"></div><button class="btn btn-success" onclick="window.hSaveEditTrans('${id}')">ZAPISZ ZMIANY</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-edit-h-trans').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hSaveEditTrans = function(id) { 
    let tr = window.db.home.trans.find(x => x.id == id); 
    if(tr) { 
        let nv = window.safeVal('eht-v'); let nd = document.getElementById('eht-d').value; 
        if(nv > 0 && nd) { 
            if(!tr.loanAction && !tr.piggyAction && !tr.debtAction) tr.v = nv; 
            let dObj = new Date(nd); dObj.setHours(12,0,0); 
            tr.rD = dObj.toISOString(); tr.dt = dObj.toLocaleDateString('pl-PL'); tr.isPlanned = nd > window.getLocalYMD(); 
            window.db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD)); 
            window.hSyncSchedule(); window.save(); window.render(); 
        } 
    } 
    document.getElementById('m-edit-h-trans').remove(); 
};


// ==========================================
// ZOBOWIĄZANIA PREMIUM (UNIFIED)
// ==========================================

window.hToggleLoanFields = function() {
    let type = document.getElementById('ml-type').value; 
    let isCard = (type === 'Karta');
    let isPayPo = (type === 'PayPo');
    let isPrywWplyw = (type === 'Prywatny_WPLYW');
    let isPrywWydatek = (type === 'Prywatny_WYDATEK');
    let isPryw = isPrywWplyw || isPrywWydatek;
    let isKredyt = (type === 'Kredyt' || type === 'Leasing');

    // Opisy pół zależnie od typu
    let lblBor = document.getElementById('lbl-borrowed');
    if(isCard) lblBor.innerText = 'Przyznany Limit Karty (zł)';
    else if(isPayPo) lblBor.innerText = 'Wartość początkowa zakupu (zł)';
    else if(isPryw) lblBor.innerText = 'Całkowita kwota pożyczki (zł)';
    else lblBor.innerText = 'Początkowa Kwota Umowy (zł)';

    document.getElementById('lbl-kapital').innerText = isCard ? 'Bieżące Zadłużenie na Karcie (zł)' : 'Kwota pozostała do spłaty NA DZIŚ (zł)';

    // Pokazywanie/Ukrywanie sekcji
    document.getElementById('row-rates-1').style.display = isKredyt ? 'flex' : 'none'; // Oprocentowanie tylko dla Kredytu
    document.getElementById('row-rates-2').style.display = (isKredyt || isPayPo) ? 'flex' : 'none'; // Ilość rat
    document.getElementById('row-card-opts').style.display = isCard ? 'flex' : 'none'; // Opcje Karty
    document.getElementById('group-rata').style.display = (isKredyt || isPayPo) ? 'block' : 'none'; // Kwota pojedynczej raty
    document.getElementById('paypo-dates').style.display = isPayPo ? 'flex' : 'none'; // Daty w PayPo (30 dni)
    document.getElementById('group-day').style.display = (isKredyt || isCard) ? 'block' : 'none'; // Dzień spłaty w m-cu
    
    // Sekcja Prywatna
    document.getElementById('custom-schedule-box').style.display = isPryw ? 'block' : 'none';
    document.getElementById('pryw-typ-splaty').style.display = isPryw ? 'block' : 'none';

    // Zerowanie niepotrzebnych dla danego typu
    if(isCard || isPryw) { 
        document.getElementById('ml-rata').value = 0; 
        document.getElementById('ml-left-inst').value = 0; 
    }
    if(!isKredyt) document.getElementById('ml-pct').value = 0;
    
    window.hTogglePrywType(); // Odśwież widok harmonogramu
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

// Automatyczne generowanie wiersza własnego harmonogramu (Prywatny)
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

// Obliczanie sumy własnego harmonogramu
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
                <option value="PayPo" ${(!ln && !isC) || (ln&&ln.type==='PayPo')?'selected':''}>🛍️ Odroczone / PayPo / BNPL</option>
                <option value="Prywatny_WPLYW" ${ln&&ln.type==='Prywatny_WPLYW'?'selected':''}>🟢 Pożyczka Prywatna (Ktoś MI wisi / Wpływ)</option>
                <option value="Prywatny_WYDATEK" ${ln&&ln.type==='Prywatny_WYDATEK'?'selected':''}>🔴 Pożyczka Prywatna (Ja KOMUŚ wiszę / Wydatek)</option>
                <option value="Kredyt" ${ln&&ln.type==='Kredyt'?'selected':''}>🏦 Kredyt Gotówkowy / Hipoteka</option>
                <option value="Leasing" ${ln&&ln.type==='Leasing'?'selected':''}>🚗 Leasing</option>
                <option value="Karta" ${isC?'selected':''}>💳 Karta Kredytowa</option>
            </select>
            ${ln ? `<small style="color:var(--muted); font-size:0.65rem; display:block; margin-top:4px;">Typu nie można zmienić po utworzeniu.</small>` : ''}
        </div>

        <div class="inp-group" style="margin-bottom:12px;"><label>Nazwa (np. Maciek, Karta, PayPo)</label><input type="text" id="ml-n" value="${ln?ln.n:''}"></div>
        <div class="inp-group" style="margin-bottom:12px;"><label>Konto powiązane ze spłatą/wpływem</label><select id="ml-acc" style="background:#09090b;">${window.db.home.accs.map(a => `<option value="${a.id}" ${a.id==(ln?ln.accId:'')?'selected':''}>${a.n}</option>`).join('')}</select></div>
        
        <div class="inp-group" style="margin-bottom:12px; border:1px solid var(--success); padding:10px; border-radius:12px; background:rgba(34,197,94,0.05);"><label id="lbl-borrowed" style="color:var(--success);">Wartość bazowa</label><input type="number" step="0.01" id="ml-borrowed" value="${ln?(parseFloat(ln.borrowed)||0):''}" placeholder="np. 1000" style="color:var(--success); font-weight:bold;" oninput="window.hCalcCustomTotal()"></div>
        
        <div class="inp-group" style="margin-bottom:15px;"><label id="lbl-kapital">Kwota pozostająca NA DZIŚ (zł)</label><input type="number" step="0.01" id="ml-kapital" value="${ln?(ln.kapital||''):''}" style="border-color:var(--danger); color:var(--danger); background:rgba(239,68,68,0.05);" oninput="window.hCalcCustomTotal()"></div>

        <div id="paypo-dates" class="inp-row" style="margin-bottom:12px; display:none;">
            <div class="inp-group"><label>Data zakupu (Start)</label><input type="date" id="ml-pp-start" value="${ln&&ln.startDate?ln.startDate:today}" style="background:#09090b;"></div>
        </div>

        <div id="row-rates-1" class="inp-row" style="margin-bottom:12px; display:none;"><div class="inp-group"><label>RRSO (%)</label><input type="number" step="0.01" id="ml-pct" value="${ln?(ln.pct||0):0}"></div><div class="inp-group"><label>Typ Oprocentowania</label><select id="ml-int-type" style="background:#09090b;"><option value="Stałe" ${ln&&ln.intType==='Stałe'?'selected':''}>Stałe</option><option value="Zmienne" ${ln&&ln.intType==='Zmienne'?'selected':''}>Zmienne</option></select></div></div>
        
        <div id="row-rates-2" class="inp-row" style="margin-bottom:12px; display:flex;"><div class="inp-group" id="group-rata"><label>Kwota JEDNEJ raty</label><input type="number" step="0.01" id="ml-rata" value="${ln?(ln.rata||''):''}"></div><div class="inp-group"><label>Ile rat zostało?</label><input type="number" id="ml-left-inst" value="${ln?(ln.installmentsLeft||''):''}"></div></div>
        
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
    
    // Załadowanie istniejących transz dla "Prywatny"
    let isPryw = (ln && (ln.type === 'Prywatny_WPLYW' || ln.type === 'Prywatny_WYDATEK'));
    if(isPryw && ln.prywMode === 'custom' && ln.customSchedule) {
        ln.customSchedule.forEach(cs => window.hAddCustomTransza(cs.amt, cs.date, cs.id, cs.isPaid));
        window.hCalcCustomTotal();
    } else if (isPryw && (!ln.prywMode || ln.prywMode === 'custom')) {
        window.hAddCustomTransza(); // pusty na start
    }
};

window.hSaveLoan = function(id) {
    let n = document.getElementById('ml-n').value; 
    let accId = document.getElementById('ml-acc').value; 
    let type = document.getElementById('ml-type').value; 
    
    let isCard = (type === 'Karta');
    let isPayPo = (type === 'PayPo');
    let isKredyt = (type === 'Kredyt' || type === 'Leasing');
    let isPryw = (type === 'Prywatny_WPLYW' || type === 'Prywatny_WYDATEK');
    
    let k = parseFloat(document.getElementById('ml-kapital').value) || 0; 
    let bor = parseFloat(document.getElementById('ml-borrowed').value) || k; 
    
    let d = parseInt(document.getElementById('ml-day').value) || 10;
    if (isPryw && document.getElementById('pryw-mode').value === 'equal') {
        d = parseInt(document.getElementById('ml-pryw-day').value) || 10;
    }
    
    let p = isKredyt ? (parseFloat(document.getElementById('ml-pct').value) || 0) : 0; 
    let r = (isPayPo || isKredyt) ? (parseFloat(document.getElementById('ml-rata').value)||0) : 0; 
    let i = (isPayPo || isKredyt) ? (parseInt(document.getElementById('ml-left-inst').value)||0) : 0;
    
    // Obsługa logiki dat rozpoczęcia rat (sztywny harmonogram)
    let startDate = window.getLocalYMD().substring(0,10);
    if (isPayPo) startDate = document.getElementById('ml-pp-start') ? document.getElementById('ml-pp-start').value : startDate;
    
    let prywMode = isPryw ? document.getElementById('pryw-mode').value : null;
    if(isPryw && prywMode === 'equal') {
        i = parseInt(document.getElementById('ml-pryw-inst').value) || 0;
        if(i > 0) r = k / i; // Obliczamy ratę z kapitału
    }
    
    let ti = i; // Nowe wpisy zakładają, że total = left inst.

    let minPay = isCard ? (parseFloat(document.getElementById('ml-min-pay').value) || 5) : 0; 
    let decPay = isCard ? document.getElementById('ml-dec-pay').value : '100';

    if(!n) return window.sysAlert ? window.sysAlert("Błąd", "Podaj nazwę!") : alert("Brak nazwy");

    // Zbieranie i sortowanie własnego harmonogramu
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
            ln.n = n; ln.accId = accId; ln.kapital = k; ln.pct = p; ln.rata = r; 
            ln.installmentsLeft = i; ln.day = d; ln.borrowed = bor; ln.type = type; 
            ln.minPayPct = minPay; ln.declaredPay = decPay; ln.startDate = startDate;
            if(isPryw) { ln.customSchedule = customSch; ln.prywMode = prywMode; }
        } 
    } else { 
        let newLoan = {
            id: Date.now(), n: n, accId: accId, kapital: k, pct: p, rata: r, 
            totalInst: ti, installmentsLeft: i, day: d, isClosed: false, 
            intType: 'Stałe', instType: 'Równe', borrowed: bor, type: type, 
            minPayPct: minPay, declaredPay: decPay, startDate: startDate
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

window.hPayOffCompletely = function(loanId) { 
    let ln = window.db.home.loans.find(x => x.id == loanId); if(!ln) return; 
    if(window.sysConfirm) {
        window.sysConfirm("Całkowita Spłata 🏆", `Opłacić całość (${Number(ln.kapital).toFixed(2)} zł) na dziś?`, () => { 
            let expOrInc = ln.type === 'Prywatny_WPLYW' ? 'inc' : 'exp'; // Zabezpieczenie typu akcji
            window.db.home.trans.unshift({ 
                id: Date.now(), type: expOrInc, cat: 'Kredyt / Leasing', v: ln.kapital, 
                d: 'Spłata całości: ' + ln.n, dt: new Date().toLocaleDateString('pl-PL'), 
                rD: new Date().toISOString(), isPlanned: false, acc: ln.accId || window.db.home.accs[0].id, 
                loanAction: 'close', loanId: ln.id, principalPaid: ln.kapital, instReduced: ln.installmentsLeft 
            }); 
            ln.isClosed = true; ln.kapital = 0; ln.installmentsLeft = 0; 
            if(ln.customSchedule) ln.customSchedule.forEach(cs => cs.isPaid = true);
            window.hSyncSchedule(); window.save(); window.render();
            window.sysAlert("Zrealizowano! 🎉", `Spłacone w całości!`, "success"); 
        });
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
        if(ln.installmentsLeft === 1) defVal = ln.kapital; 
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
            principalPaid = val; // BNPL i prywatne to czysty kapitał
        } else {
            interest = (ln.kapital * (ln.pct / 100)) / 12; 
            principalPaid = val - interest; 
        }
        if(principalPaid < 0) principalPaid = 0; 

        // Logika transz dla pożyczki prywatnej
        let activeTranszaId = null;
        if((ln.type === 'Prywatny_WPLYW' || ln.type === 'Prywatny_WYDATEK') && ln.customSchedule) {
            let unpaid = ln.customSchedule.find(cs => !cs.isPaid);
            if(unpaid) { unpaid.isPaid = true; unpaid.paidDate = new Date().toISOString(); activeTranszaId = unpaid.id; }
        }

        let expOrInc = ln.type === 'Prywatny_WPLYW' ? 'inc' : 'exp'; // Zabezpieczenie kierunku przelewu
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

// --- SKARBONKI / CELE ---
window.hOpenPiggyModal = function() { 
    let html = `<div id="m-piggy" class="modal-overlay"><div class="panel" style="width:100%; max-width:380px; background:#09090b; border-color:var(--success);"><h3 style="margin-top:0; color:var(--success);">🎯 Cel Oszczędnościowy</h3><div class="inp-group" style="margin-bottom:10px;"><label>Cel (np. Wakacje)</label><input type="text" id="mp-n"></div><div class="inp-row" style="margin-bottom:10px;"><div class="inp-group"><label>Docelowo (zł)</label><input type="number" id="mp-target"></div><div class="inp-group"><label>Już masz (zł)</label><input type="number" id="mp-saved" value="0"></div></div><div class="inp-group" style="margin-bottom:20px;"><label>Data końcowa</label><input type="date" id="mp-date"></div><button class="btn btn-success" onclick="window.hSavePiggy()">ZAPISZ CEL</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-piggy').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hSavePiggy = function() { 
    let n = document.getElementById('mp-n').value; let t = parseFloat(document.getElementById('mp-target').value); 
    let s = parseFloat(document.getElementById('mp-saved').value) || 0; let d = document.getElementById('mp-date').value; 
    if(!n || !t) return window.sysAlert ? window.sysAlert("Błąd", "Wymagane pola.") : alert("Wymagane"); 
    window.db.home.piggy.push({id: Date.now(), n:n, target:t, saved:s, deadline: d}); window.save(); window.render(); document.getElementById('m-piggy').remove(); 
};

window.hAddFundsPiggy = function(id) { 
    let pg = window.db.home.piggy.find(x => x.id == id); if(!pg) return; 
    let html = `<div id="m-add-funds" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--success);"><h3 style="margin-top:0; color:var(--success);">🐷 Zasil: ${pg.n}</h3><div class="inp-group" style="margin-bottom:15px;"><input type="number" id="maf-val" placeholder="np. 100" class="big-inp" style="color:var(--success); background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Konto</label><select id="maf-acc" style="background:#18181b;">${window.db.home.accs.map(a => `<option value="${a.id}">${a.n}</option>`).join('')}</select></div><button class="btn btn-success" onclick="window.hSaveFundsPiggy('${id}')">WPŁAĆ</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-add-funds').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hSaveFundsPiggy = function(id) { 
    let val = parseFloat(document.getElementById('maf-val').value); let accId = document.getElementById('maf-acc').value; 
    if(!val || val <= 0) return alert("Błąd wpłaty"); let pg = window.db.home.piggy.find(x => x.id == id); 
    if(pg) { 
        let dObj = new Date(); dObj.setHours(12,0,0); 
        window.db.home.trans.unshift({ id:Date.now(), type:'exp', cat:'Oszczędności / Skarbonka', acc:accId, d:`Cel: ${pg.n}`, v:val, who:window.db.userName, dt:dObj.toLocaleDateString('pl-PL'), rD:dObj.toISOString(), isPlanned: false, piggyAction: 'deposit', piggyId: pg.id, amount: val }); 
        pg.saved += val; window.save(); window.render(); 
    } 
    document.getElementById('m-add-funds').remove(); 
};

window.hDelPiggy = function(id) { 
    if(window.sysConfirm) { window.sysConfirm("Usuwanie", "Usunąć cel?", () => { window.db.home.piggy = window.db.home.piggy.filter(x => x.id != id); window.save(); window.render(); }); } 
    else { window.db.home.piggy = window.db.home.piggy.filter(x => x.id != id); window.save(); window.render(); } 
};

// --- LEGACY (STARE DŁUGI) Obsługa kompatybilności wstecznej ---
window.hDelDebtMistake = function(id) { 
    if(window.sysConfirm) { window.sysConfirm("Usuwanie", "Usunąć stary wpis?", () => { window.db.home.debts = window.db.home.debts.filter(d => d.id != id); window.save(); window.render(); }); } 
};

window.hOpenPayDebtModal = function(id) { 
    let d = window.db.home.debts.find(x => x.id == id); if(!d) return; 
    let html = `<div id="m-pay-debt" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--warning);"><h3 style="margin-top:0; color:var(--warning);">🤝 Rozliczenie starego wpisu</h3><p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px;">Wpis: <strong>${d.person}</strong></p><div class="inp-group" style="margin-bottom:15px;"><label>Spłacasz (zł)</label><input type="number" step="0.01" id="mpd-val" value="${Number(d.amount||0).toFixed(2)}" max="${d.amount}" class="big-inp" style="color:var(--warning); background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Konto</label><select id="mpd-acc" style="background:#18181b;">${window.db.home.accs.map(a => `<option value="${a.id}">${a.n}</option>`).join('')}</select></div><button class="btn" style="background:var(--warning); color:#000;" onclick="window.hExecPayDebt('${d.id}')">POTWIERDŹ SPŁATĘ</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-pay-debt').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hExecPayDebt = function(id) { 
    let val = parseFloat(document.getElementById('mpd-val').value); let accId = document.getElementById('mpd-acc').value; 
    let d = window.db.home.debts.find(x => x.id == id); if(!d || !val || val <= 0 || val > d.amount) return; 
    let isOwe = d.type === 'i_owe'; let dObj = new Date(); dObj.setHours(12,0,0); 
    
    window.db.home.trans.unshift({ id: Date.now(), type: isOwe?'exp':'inc', cat: isOwe?'Inne Wydatki':'Inne Wpływy', acc: accId, d: (isOwe?'Spłata starego: ':'Otrzymano: ')+d.person, v: val, who: window.db.userName, dt: dObj.toLocaleDateString('pl-PL'), rD: dObj.toISOString(), isPlanned: false, debtAction: 'pay', debtId: d.id }); 
    d.amount -= val; let ptr = window.db.home.trans.find(x => x.debtId == id && x.isPlanned); 
    if(d.amount <= 0) { d.amount = 0; d.isClosed = true; if(ptr) window.db.home.trans = window.db.home.trans.filter(x => x.id != ptr.id); if(window.sysAlert) window.sysAlert("Rozliczono!", "Stary wpis zamknięty.", "success"); } 
    window.hSyncSchedule(); window.save(); window.render(); document.getElementById('m-pay-debt').remove(); 
};

window.hConvertDebtToInstallments = function(id) {
    let d = window.db.home.debts.find(x => x.id == id); if(!d) return; 
    window.hOpenLoanModal(); // Otwiera nowy kreator
    // Pre-fill fields for migration
    setTimeout(() => {
        document.getElementById('ml-type').value = 'PayPo';
        window.hToggleLoanFields();
        document.getElementById('ml-n').value = d.person;
        document.getElementById('ml-borrowed').value = d.amount;
        document.getElementById('ml-kapital').value = d.amount;
        // Skasuj po udanej migracji ręcznej
        window.sysAlert("Kreator otwarty", "Wypełnij szczegóły i zapisz. Stary wpis musisz usunąć ręcznie (koszem).", "info");
    }, 100);
};

// --- USTAWIENIA I RODZINA ---
window.hAddMem = function() { 
    let val = document.getElementById('h-new-mem').value.trim(); 
    if(val && !window.db.home.members.includes(val)) { window.db.home.members.push(val); window.save(); window.render(); } 
};

window.hDelMem = function(name) { 
    if(window.db.home.members.length <= 1) return; 
    if(window.sysConfirm) { window.sysConfirm("Usuwanie", `Usunąć domownika: ${name}?`, () => { window.db.home.members = window.db.home.members.filter(m => m !== name); if(window.hMem === name) window.hMem = window.db.home.members[0]; window.save(); window.render(); }); } 
};

window.hAddRecurring = function() { 
    let n = document.getElementById('hr-name').value; let v = parseFloat(document.getElementById('hr-val').value); let d = parseInt(document.getElementById('hr-day').value) || 1; 
    if(!n || !v) return; window.db.home.recurring.push({ id: Date.now(), n: n, v: v, t: window.hRecType, c: window.hRecCat, a: window.hRecAcc, day: d, lastBooked: '' }); window.hSyncSchedule(); window.save(); window.render(); if(window.sysAlert) window.sysAlert("Sukces", "Dodano do automatu!", "success"); 
};

window.hDelRecurring = function(id) { window.db.home.recurring = window.db.home.recurring.filter(r => r.id !== id); window.hSyncSchedule(); window.save(); window.render(); };

window.hSetBudget = function() { 
    let cat = document.getElementById('hb-cat').value; let val = parseFloat(document.getElementById('hb-val').value); 
    if(!window.db.home.budgets) window.db.home.budgets = {}; 
    if(val > 0) window.db.home.budgets[cat] = val; else delete window.db.home.budgets[cat]; 
    window.save(); window.render(); if(window.sysAlert) window.sysAlert("Sukces", "Zapisano limit.", "success"); 
};
