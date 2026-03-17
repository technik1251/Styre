// ==========================================
// PLIK: home_modals.js - Akcje i okienka (Modal) Budżetu
// ==========================================

// --- BACKUP ---
window.hExportData = function() { 
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.db)); 
    let dlAnchorElem = document.createElement('a'); 
    dlAnchorElem.setAttribute("href", dataStr); 
    dlAnchorElem.setAttribute("download", "styreos_kopia_" + window.getLocalYMD() + ".json"); 
    dlAnchorElem.click(); 
};

window.hImportTrigger = function() { 
    document.getElementById('h-import-file').click(); 
};

window.hImportData = function(event) { 
    let file = event.target.files[0]; 
    if(!file) return; 
    let reader = new FileReader(); 
    reader.onload = function(e) { 
        try { 
            let importedDb = JSON.parse(e.target.result); 
            if(importedDb && importedDb.home) { 
                window.db = importedDb; 
                window.save(); 
                if(window.sysAlert) window.sysAlert('Sukces', 'Kopia zapasowa została przywrócona!', 'success'); 
                setTimeout(() => location.reload(), 1500); 
            } else { 
                if(window.sysAlert) window.sysAlert('Błąd', 'Nieprawidłowy plik kopii zapasowej.', 'error'); 
            } 
        } catch(err) { 
            if(window.sysAlert) window.sysAlert('Błąd', 'Błąd odczytu pliku.', 'error'); 
        } 
    }; 
    reader.readAsText(file); 
};

// --- AKCJE W INTERFEJSIE ---
window.hChangeMonth = function(dir) { 
    window.hViewDate.setMonth(window.hViewDate.getMonth() + dir); 
    window.render(); 
};

window.hUseTemplate = function(v, c, note) { 
    let el = document.getElementById('h-v'); 
    if(el) el.value = v; 
    window.hSelCat = c; 
    let dEl = document.getElementById('h-d'); 
    if(dEl) dEl.value = note; 
    window.hCheckLimit(); 
    window.render(); 
};

window.hCheckLimit = function() { 
    let vEl = document.getElementById('h-v'); 
    let warnEl = document.getElementById('h-warn-limit'); 
    if(!vEl || !warnEl || window.hTransType !== 'exp') { 
        if(warnEl) warnEl.style.display = 'none'; 
        return; 
    } 
    let v = parseFloat(vEl.value) || 0; 
    let cat = window.hSelCat; 
    if(window.db.home.budgets && window.db.home.budgets[cat] && v > 0) { 
        let limit = window.db.home.budgets[cat]; 
        let spent = 0; 
        let now = new Date(); 
        window.db.home.trans.forEach(x => { 
            if(!x.isPlanned && x.type === 'exp' && x.cat === cat && new Date(x.rD).getMonth() === now.getMonth()) {
                spent += parseFloat(x.v) || 0; 
            }
        }); 
        if((spent + v) > limit) { 
            warnEl.innerHTML = `⚠️ Przekroczysz limit o <strong>${Number((spent+v)-limit).toFixed(2)} zł</strong>!`; 
            warnEl.style.display = 'block'; 
            return; 
        } 
    } 
    warnEl.style.display = 'none'; 
};

// --- TRANSAKCJE ---
window.hAction = function() { 
    window.hInitDb();
    let el = document.getElementById('h-v'); 
    if(!el || !el.value) { 
        if(el) { el.style.borderBottom = '2px solid red'; el.classList.add('shake-anim'); setTimeout(()=>el.classList.remove('shake-anim'), 300); } 
        if(window.sysAlert) return window.sysAlert("Brak kwoty", "Wpisz kwotę."); 
        return alert("Wpisz kwotę"); 
    } 
    let v = parseFloat(el.value); 
    let dEl = document.getElementById('h-d'); 
    let d = dEl ? dEl.value : ''; 
    let who = window.hMem || window.db.home.members[0] || 'Domownik'; 
    let dVal = document.getElementById('h-date') ? document.getElementById('h-date').value : ''; 
    let todayYMD = window.getLocalYMD(); 
    let isPlannedTrans = dVal > todayYMD; 
    let dObj = dVal ? new Date(dVal) : new Date(); 
    if(dVal) dObj.setHours(12,0,0); 
    let recEl = document.getElementById('h-recurring'); 
    let isRecurring = recEl && recEl.value === 'month'; 
    
    if(window.hTransType === 'transfer') { 
        let fAcc = window.hSelAccFrom; let tAcc = window.hSelAccTo; 
        if(!fAcc || !tAcc || fAcc === tAcc) { 
            if(window.sysAlert) return window.sysAlert("Błąd Przelewu", "Wybierz 2 różne konta."); 
            return alert("Wybierz konta"); 
        } 
        window.db.home.trans.push({id:Date.now(), type:'transfer', fromAcc:fAcc, toAcc:tAcc, d:d, v:v, who:who, dt:dObj.toLocaleDateString('pl-PL'), rD:dObj.toISOString(), isPlanned: isPlannedTrans}); 
    } else { 
        let acc = window.hSelAcc || window.db.home.accs[0].id; 
        let c = window.hSelCat; 
        window.db.home.trans.push({id:Date.now(), type:window.hTransType, cat:c, acc:acc, d:d, v:v, who:who, dt:dObj.toLocaleDateString('pl-PL'), rD:dObj.toISOString(), isPlanned: isPlannedTrans}); 
        if(isRecurring) { 
            window.db.home.recurring.push({ id: Date.now()+1, n: d || c, v: v, t: window.hTransType, c: c, a: acc, day: dObj.getDate(), lastBooked: window.getLocalYMD().substring(0,7) }); 
            if(window.sysAlert) setTimeout(()=> window.sysAlert("Zapisano!", "Operacja dodana. Automat będzie ją ponawiał.", "success"), 500); 
        } 
    } 
    window.db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD)); 
    window.hSyncSchedule(); 
    window.save(); 
    window.switchTab('dash'); 
};

window.hDelTrans = function(id) { 
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie", "Na pewno usunąć tę operację?", () => { executeDeleteTrans(id); });
    } else if (confirm("Usunąć operację?")) {
        executeDeleteTrans(id);
    }
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
            } 
        } 
        if(tr.piggyAction === 'deposit') { 
            let pg = window.db.home.piggy.find(x => x.id == tr.piggyId); 
            if(pg) { pg.saved = (parseFloat(pg.saved)||0) - (parseFloat(tr.amount)||0); if(pg.saved < 0) pg.saved = 0; } 
        } 
        if(tr.debtAction === 'pay') { 
            let d = window.db.home.debts.find(x => x.id == tr.debtId); 
            if(d) { 
                d.amount = (parseFloat(d.amount)||0) + (parseFloat(tr.v)||0); 
                d.isClosed = false; 
                let ptr = window.db.home.trans.find(x => x.debtId == tr.debtId && x.isPlanned); 
                if(ptr) ptr.v = d.amount; 
                else { 
                    let dObj = new Date(); dObj.setDate(dObj.getDate() + 30); 
                    window.db.home.trans.push({ id: 'd_'+d.id, type: d.type==='i_owe'?'exp':'inc', cat: d.type==='i_owe'?'Inne Wydatki':'Inne Wpływy', acc: window.db.home.accs[0].id, d: 'Dług: '+d.person, v: d.amount, who: window.db.userName, dt: dObj.toLocaleDateString('pl-PL'), rD: dObj.toISOString(), isPlanned: true, debtId: d.id }); 
                } 
            } 
        } 
    } 
    window.db.home.trans = window.db.home.trans.filter(x => x.id != id); 
    window.hSyncSchedule(); 
    window.save(); 
    window.render(); 
}

window.hEditTrans = function(id) { 
    window.hInitDb();
    let tr = window.db.home.trans.find(x => x.id == id); 
    if(!tr) return; 
    let isSystem = tr.loanAction || tr.piggyAction || tr.debtAction; 
    let html = `<div id="m-edit-h-trans" class="modal-overlay"><div class="panel" style="width:100%; max-width:380px; background: #09090b; border-color:var(--info);"><h3 style="margin-top:0; color:var(--info);">Edytuj operację</h3>${isSystem ? `<p style="font-size:0.75rem; color:var(--warning); margin-bottom:15px; font-weight:bold; background:rgba(245,158,11,0.1); padding:8px; border-radius:8px;">⚠️ Operacja systemowa. Aby zmienić kwotę, usuń wpis i dodaj od nowa.</p>` : ''}<div class="inp-group" style="margin-bottom:15px;"><label>Kwota (zł)</label><input type="number" step="0.01" id="eht-v" value="${Number(tr.v||0).toFixed(2)}" ${isSystem ? 'disabled style="opacity:0.5"' : ''}></div><div class="inp-group" style="margin-bottom:20px;"><label>Data operacji</label><input type="date" id="eht-d" value="${tr.rD.split('T')[0]}"></div><button class="btn btn-success" onclick="window.hSaveEditTrans('${id}')">ZAPISZ ZMIANY</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-edit-h-trans').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hSaveEditTrans = function(id) { 
    window.hInitDb();
    let tr = window.db.home.trans.find(x => x.id == id); 
    if(tr) { 
        let nv = window.safeVal('eht-v'); 
        let nd = document.getElementById('eht-d').value; 
        if(nv > 0 && nd) { 
            if(!tr.loanAction && !tr.piggyAction && !tr.debtAction) tr.v = nv; 
            let dObj = new Date(nd); 
            dObj.setHours(12,0,0); 
            tr.rD = dObj.toISOString(); 
            tr.dt = dObj.toLocaleDateString('pl-PL'); 
            tr.isPlanned = nd > window.getLocalYMD(); 
            window.db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD)); 
            window.hSyncSchedule(); 
            window.save(); 
            window.render(); 
        } 
    } 
    document.getElementById('m-edit-h-trans').remove(); 
};

// --- KONTA ---
window.hOpenAccModal = function(id = null) { 
    window.hInitDb();
    let ac = id ? window.db.home.accs.find(x => x.id === id) : null; 
    let n = ac ? ac.n : ''; 
    let b = ac ? (parseFloat(ac.startBal)||0) : 0; 
    let html = `<div id="m-acc" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b;"><h3 style="margin-top:0; color:#fff; margin-bottom:15px;">${ac ? '✏️ Konfiguruj Konto' : '🏦 Nowe Konto'}</h3><div class="inp-group" style="margin-bottom:15px;"><label>Nazwa Konta</label><input type="text" id="ma-n" value="${n}" placeholder="np. mBank"></div><div class="inp-group" style="margin-bottom:20px;"><label>Saldo Startowe (Bieżące środki)</label><input type="number" id="ma-b" value="${Number(b).toFixed(2)}" placeholder="np. 3500"><span style="font-size:0.65rem; color:var(--muted); margin-top:5px;">Nie wliczy się do wykresów przychodów.</span></div><button class="btn btn-success" onclick="window.hSaveAccModal('${id||''}')">ZAPISZ KONTO</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-acc').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hSaveAccModal = function(id) { 
    let n = document.getElementById('ma-n').value; 
    let b = parseFloat(document.getElementById('ma-b').value) || 0; 
    if(!n) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz nazwę konta."); 
        return alert("Wpisz nazwę"); 
    } 
    if(id) { 
        let ac = window.db.home.accs.find(x => x.id === id); 
        if(ac) { ac.n = n; ac.startBal = b; } 
    } else { 
        let newId = 'acc_'+Date.now(); 
        window.db.home.accs.push({id:newId, n:n, c:'#8b5cf6', i:'🏦', startBal:b}); 
        setTimeout(()=>window.hShowIconPicker(newId), 300); 
    } 
    window.save(); 
    window.render(); 
    document.getElementById('m-acc').remove(); 
};

window.hShowIconPicker = function(accId) { 
    let icons = [['🏦','#8b5cf6'],['💵','#22c55e'],['💳','#f59e0b'],['🐷','#ec4899'],['📈','#0ea5e9'],['💼','#64748b'],['💎','#eab308']]; 
    let html = `<div id="m-icon-picker" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; text-align:center; background:#09090b; border:1px solid rgba(255,255,255,0.1); border-radius:24px;"><h3 style="margin-top:0; color:#fff; font-size:1.3rem;">Wybierz Ikonę</h3><div style="display:flex; flex-wrap:wrap; gap:15px; justify-content:center; margin-bottom:25px;">${icons.map(i=>`<div onclick="window.hApplyIcon('${accId}','${i[0]}','${i[1]}')" style="font-size:2.2rem; width:70px; height:70px; display:flex; align-items:center; justify-content:center; background:${i[1]}15; border:2px solid ${i[1]}55; border-radius:18px; cursor:pointer;">${i[0]}</div>`).join('')}</div><button class="btn" style="background:rgba(255,255,255,0.05); color:#fff;" onclick="document.getElementById('m-icon-picker').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hApplyIcon = function(id, ico, col) { 
    let ac = window.db.home.accs.find(x => x.id === id); 
    if(ac) { 
        ac.i = ico; 
        ac.c = col; 
        window.save(); 
        window.render(); 
    } 
    document.getElementById('m-icon-picker').remove(); 
};

window.hDelAcc = function(id) { 
    if(window.db.home.accs.length <= 1) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Musisz mieć min. 1 konto!"); 
        return alert("Min. 1 konto"); 
    } 
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie konta", "Na pewno? Znikną przypisane środki.", () => { 
            window.db.home.accs = window.db.home.accs.filter(a => a.id !== id); 
            window.save(); 
            window.render(); 
        });
    } else if(confirm("Usunąć konto?")) {
        window.db.home.accs = window.db.home.accs.filter(a => a.id !== id); 
        window.save(); 
        window.render();
    }
};

// --- KREDYTY, KARTY KREDYTOWE I RATY PAYPO ---
window.hToggleLoanFields = function() {
    let type = document.getElementById('ml-type').value; 
    let isCard = (type === 'Karta');
    let isRaty = (type === 'Raty');
    
    document.getElementById('lbl-borrowed').innerText = isCard ? 'Przyznany Limit Karty (zł)' : 'Całkowita kwota do spłaty (zł)';
    document.getElementById('lbl-kapital').innerText = isCard ? 'Bieżące Zadłużenie na Karcie (zł)' : 'Kwota kapitału pozostająca na dziś (zł)';
    
    let lblDay = document.getElementById('lbl-day'); 
    if(lblDay) lblDay.innerText = isCard ? 'Dzień cyklu rozliczeniowego (Spłata)' : 'Dzień spłaty w miesiącu (1-31)';

    document.getElementById('row-rates-1').style.display = (isCard || isRaty) ? 'none' : 'flex'; 
    document.getElementById('row-rates-2').style.display = isCard ? 'none' : 'flex'; 
    document.getElementById('row-card-opts').style.display = isCard ? 'flex' : 'none'; 
    document.getElementById('group-rata').style.display = isCard ? 'none' : 'block';

    if(isCard) { 
        document.getElementById('ml-rata').value = 0; 
        document.getElementById('ml-total-inst').value = 0; 
        document.getElementById('ml-left-inst').value = 0; 
    }
    
    if(isRaty) {
        document.getElementById('ml-pct').value = 0;
    }
};

window.hOpenLoanModal = function(id = null, forceCard = false) {
    window.hInitDb();
    let ln = id ? window.db.home.loans.find(x => x.id == id) : null; 
    let b = ln ? (parseFloat(ln.borrowed)||0) : ''; 
    let isC = (ln && ln.type === 'Karta') || forceCard;
    let mPay = ln && ln.minPayPct ? ln.minPayPct : 5;
    let dPay = ln && ln.declaredPay ? ln.declaredPay : '100';

    let html = `<div id="m-loan" class="modal-overlay"><div class="panel" style="width:100%; max-width:380px; background:#18181b; border:1px solid #27272a; max-height:90vh; overflow-y:auto;">
        <h3 style="margin-top:0; color:#fff; display:flex; align-items:center; gap:10px;">${ln ? '✏️ Edytuj' : (isC ? '💳 Nowa Karta' : '🏦 Nowe Zobowiązanie')}</h3>
        <div class="inp-group" style="margin-bottom:12px;"><label>Nazwa (np. ${isC?'Karta Millenium':'PayPo - Zakupy'})</label><input type="text" id="ml-n" value="${ln?ln.n:''}"></div>
        <div class="inp-group" style="margin-bottom:12px; ${isC?'display:none':''}"><label>Typ zobowiązania</label>
            <select id="ml-type" onchange="window.hToggleLoanFields()" style="background:#09090b; border-color:var(--info); color:var(--info); font-weight:bold;">
                <option value="Kredyt" ${ln&&ln.type==='Kredyt'?'selected':''}>Kredyt Gotówkowy / Hipoteka</option>
                <option value="Raty" ${(!ln && !isC) || (ln&&ln.type==='Raty')?'selected':''}>Raty 0% / PayPo / Znajomy</option>
                <option value="Leasing" ${ln&&ln.type==='Leasing'?'selected':''}>Leasing</option>
                <option value="Karta" ${isC?'selected':''}>💳 Karta Kredytowa</option>
            </select>
        </div>
        ${isC ? `<input type="hidden" id="ml-type" value="Karta">` : ''}
        <div class="inp-group" style="margin-bottom:12px;"><label>Konto z którego najczęściej spłacasz</label><select id="ml-acc" style="background:#09090b;">${window.db.home.accs.map(a => `<option value="${a.id}" ${a.id==(ln?ln.accId:'')?'selected':''}>${a.n}</option>`).join('')}</select></div>
        <div class="inp-group" style="margin-bottom:12px; border:1px solid var(--success); padding:10px; border-radius:12px; background:rgba(34,197,94,0.05);"><label id="lbl-borrowed" style="color:var(--success);">Całkowita kwota do spłaty (zł)</label><input type="number" step="0.01" id="ml-borrowed" value="${b}" placeholder="np. 237" style="color:var(--success); font-weight:bold;"></div>
        
        <div id="row-rates-1" class="inp-row" style="margin-bottom:12px; display:none;"><div class="inp-group"><label>Oprocentowanie RRSO (%)</label><input type="number" step="0.01" id="ml-pct" value="${ln?(ln.pct||0):0}"></div><div class="inp-group"><label>Typ Oprocentowania</label><select id="ml-int-type" style="background:#09090b;"><option value="Stałe" ${ln&&ln.intType==='Stałe'?'selected':''}>Stałe</option><option value="Zmienne" ${ln&&ln.intType==='Zmienne'?'selected':''}>Zmienne</option></select></div></div>
        
        <div class="inp-row" style="margin-bottom:15px;"><div class="inp-group"><label id="lbl-kapital">Kwota pozostająca NA DZIŚ (zł)</label><input type="number" step="0.01" id="ml-kapital" value="${ln?(ln.kapital||''):''}" style="border-color:var(--danger); color:var(--danger); background:rgba(239,68,68,0.05);"></div><div class="inp-group" id="group-rata"><label>Kwota JEDNEJ raty (zł)</label><input type="number" step="0.01" id="ml-rata" value="${ln?(ln.rata||''):''}"></div></div>
        
        <div id="row-rates-2" class="inp-row" style="margin-bottom:12px; display:flex;"><div class="inp-group"><label>Z ilu rat łącznie?</label><input type="number" id="ml-total-inst" value="${ln?(ln.totalInst||''):''}"></div><div class="inp-group"><label>Ile rat zostało do końca?</label><input type="number" id="ml-left-inst" value="${ln?(ln.installmentsLeft||''):''}"></div></div>
        
        <div id="row-card-opts" class="inp-row" style="margin-bottom:12px; display:none;">
            <div class="inp-group"><label>Minimalna spłata (%)</label><input type="number" step="0.1" id="ml-min-pay" value="${mPay}"></div>
            <div class="inp-group"><label>Zadeklarowana spłata</label><select id="ml-dec-pay" style="background:#09090b;"><option value="100" ${dPay==='100'?'selected':''}>100% (Całość)</option><option value="min" ${dPay==='min'?'selected':''}>Tylko Minimum</option></select></div>
        </div>

        <div class="inp-group" style="margin-bottom:15px;"><label id="lbl-day">Dzień spłaty w miesiącu (1-31)</label><input type="number" id="ml-day" value="${ln?(ln.day||10):10}"></div>
        
        <button class="btn btn-danger" onclick="window.hSaveLoan('${id||''}')">ZAPISZ ZOBOWIĄZANIE</button>
        <button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-loan').remove()">ANULUJ</button>
    </div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
    window.hToggleLoanFields();
};

window.hSaveLoan = function(id) {
    let n = document.getElementById('ml-n').value; 
    let accId = document.getElementById('ml-acc').value; 
    let type = document.getElementById('ml-type').value; 
    let isCard = (type === 'Karta');
    let isRaty = (type === 'Raty');
    
    let k = parseFloat(document.getElementById('ml-kapital').value) || 0; 
    let bor = parseFloat(document.getElementById('ml-borrowed').value) || k; 
    let d = parseInt(document.getElementById('ml-day').value) || 10;
    
    let p = (isRaty || isCard) ? 0 : (parseFloat(document.getElementById('ml-pct').value) || 0); 
    
    let r = isCard ? 0 : parseFloat(document.getElementById('ml-rata').value); 
    let ti = isCard ? 0 : parseInt(document.getElementById('ml-total-inst').value) || 0; 
    let i = isCard ? 0 : parseInt(document.getElementById('ml-left-inst').value) || 0;
    
    let minPay = isCard ? (parseFloat(document.getElementById('ml-min-pay').value) || 5) : 0; 
    let decPay = isCard ? document.getElementById('ml-dec-pay').value : '100';

    if(!n || (!isCard && isNaN(r))) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Wypełnij nazwę i kwotę raty!"); 
        return alert("Brak danych"); 
    }
    
    if(id) { 
        let ln = window.db.home.loans.find(x => x.id == id); 
        if(ln) { 
            ln.n = n; ln.accId = accId; ln.kapital = k; ln.pct = p; ln.rata = r; 
            ln.totalInst = ti; ln.installmentsLeft = i; ln.day = d; 
            ln.intType = document.getElementById('ml-int-type') ? document.getElementById('ml-int-type').value : 'Stałe'; 
            ln.instType = document.getElementById('ml-inst-type') ? document.getElementById('ml-inst-type').value : 'Równe'; 
            ln.borrowed = bor; ln.type = type; ln.minPayPct = minPay; ln.declaredPay = decPay; 
        } 
    } else { 
        window.db.home.loans.push({
            id: Date.now(), n: n, accId: accId, kapital: k, pct: p, rata: r, 
            totalInst: ti, installmentsLeft: i, day: d, isClosed: false, 
            intType: document.getElementById('ml-int-type') ? document.getElementById('ml-int-type').value : 'Stałe', 
            instType: 'Równe', borrowed: bor, type: type, minPayPct: minPay, declaredPay: decPay
        }); 
    }
    
    window.hSyncSchedule(); 
    window.save(); 
    window.render(); 
    document.getElementById('m-loan').remove();
};

window.hDelLoan = function(id) { 
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie", "Na pewno usunąć to zobowiązanie ze wszystkimi danymi?", () => { 
            window.db.home.loans = window.db.home.loans.filter(x => x.id != id); 
            window.db.home.trans = window.db.home.trans.filter(x => x.loanId != id); 
            window.hSyncSchedule(); 
            window.save(); 
            window.render(); 
        });
    } else if(confirm("Usunąć zobowiązanie?")) {
        window.db.home.loans = window.db.home.loans.filter(x => x.id != id); 
        window.db.home.trans = window.db.home.trans.filter(x => x.loanId != id); 
        window.hSyncSchedule(); 
        window.save(); 
        window.render();
    }
};

window.hCreditHoliday = function(loanId) { 
    let ln = window.db.home.loans.find(x => x.id == loanId); 
    if(!ln) return; 
    let currentM = window.getLocalYMD().substring(0,7); 
    if(ln.holidayMonth === currentM) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Już masz wakacje."); 
        return alert("Już masz wakacje"); 
    } 
    if(window.sysConfirm) {
        window.sysConfirm("Wakacje 🏖️", "Zawiesić spłatę w tym miesiącu?", () => { 
            ln.holidayMonth = currentM; 
            window.hSyncSchedule(); 
            window.save(); 
            window.render(); 
            window.sysAlert("Sukces!", "Wakacje aktywowane.", "success"); 
        });
    } else {
        ln.holidayMonth = currentM; 
        window.hSyncSchedule(); 
        window.save(); 
        window.render();
    }
};

window.hPayOffCompletely = function(loanId) { 
    let ln = window.db.home.loans.find(x => x.id == loanId); 
    if(!ln) return; 
    if(window.sysConfirm) {
        window.sysConfirm("Całkowita Spłata 🏆", `Spłacić całkowicie zadłużenie dzisiaj?`, () => { 
            executePayOffCompletely(ln); 
            window.sysAlert("Zrealizowano! 🎉", `Zobowiązanie spłacone w całości!`, "success"); 
        });
    } else if(confirm("Spłacić w całości?")) {
        executePayOffCompletely(ln);
    }
};

function executePayOffCompletely(ln) {
    window.db.home.trans.unshift({ 
        id: Date.now(), type: 'exp', cat: 'Kredyt / Leasing', v: ln.kapital, 
        d: 'Całkowita spłata: ' + ln.n, dt: new Date().toLocaleDateString('pl-PL'), 
        rD: new Date().toISOString(), isPlanned: false, acc: ln.accId || window.db.home.accs[0].id, 
        loanAction: 'close', loanId: ln.id, principalPaid: ln.kapital, instReduced: ln.installmentsLeft 
    }); 
    ln.isClosed = true; 
    ln.kapital = 0; 
    ln.installmentsLeft = 0; 
    window.hSyncSchedule(); 
    window.save(); 
    window.render();
}

window.hOpenPayLoanModal = function(loanId, transId = null) {
    window.hInitDb();
    let ln = window.db.home.loans.find(x => x.id == loanId); 
    if(!ln) return; 
    let isCard = ln.type === 'Karta';
    
    let minP = (ln.kapital * (ln.minPayPct || 5)) / 100;
    if(minP < 50 && ln.kapital > 0) minP = Math.min(50, ln.kapital);
    let defVal = isCard ? (ln.declaredPay === 'min' ? minP : ln.kapital) : ln.rata;
    let subText = isCard ? `Zadłużenie całkowite: <strong>${Number(ln.kapital||0).toFixed(2)} zł</strong><br>Min. spłata: <strong>${Number(minP||0).toFixed(2)} zł</strong>` : `Kwota raty: <strong>${Number(ln.rata||0).toFixed(2)} zł</strong>`;

    let html = `<div id="m-pay-loan" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--danger);"><h3 style="margin-top:0; color:var(--danger);">💸 Spłata: ${ln.n}</h3><p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">${subText}</p><div class="inp-group" style="margin-bottom:15px;"><label>Kwota wpłaty (zł)</label><input type="number" step="0.01" id="mpl-val" value="${Number(defVal||0).toFixed(2)}" class="big-inp" style="color:var(--danger); background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Konto pobrania</label><select id="mpl-acc" style="background:#18181b;">${window.db.home.accs.map(a => `<option value="${a.id}" ${a.id==(ln.accId||window.db.home.accs[0].id)?'selected':''}>${a.n}</option>`).join('')}</select></div><button class="btn btn-danger" onclick="window.hExecPayLoan('${loanId}', '${transId||''}')">POTWIERDŹ SPŁATĘ</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-pay-loan').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html);
};

window.hExecPayLoan = function(loanId, transId) {
    let val = parseFloat(document.getElementById('mpl-val').value); 
    let accId = document.getElementById('mpl-acc').value; 
    if(!val || val <= 0) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Błędna kwota wpłaty!"); 
        return alert("Błędna kwota"); 
    } 
    let ln = window.db.home.loans.find(x => x.id == loanId);
    if(ln) {
        let isCard = ln.type === 'Karta'; 
        let kap = parseFloat(ln.kapital)||0; 
        let pct = parseFloat(ln.pct)||0; 
        let principalPaid = 0; 
        let interest = 0;
        
        if (isCard) {
            if(ln.declaredPay === '100') { 
                principalPaid = val; interest = 0; 
            } else { 
                interest = kap * (pct / 100) / 12; 
                principalPaid = val - interest; 
                if(principalPaid < 0) principalPaid = 0; 
            }
        } else {
            interest = kap * (pct / 100) / 12; 
            principalPaid = val - interest; 
            if(principalPaid < 0) principalPaid = 0; 
        }

        window.db.home.trans.unshift({ 
            id: Date.now(), type: 'exp', cat: 'Kredyt / Leasing', v: val, 
            d: (isCard ? 'Spłata Karty: ' : 'Spłata raty: ') + ln.n, dt: new Date().toLocaleDateString('pl-PL'), 
            rD: new Date().toISOString(), isPlanned: false, acc: accId, loanAction: 'pay', 
            loanId: ln.id, principalPaid: principalPaid, instReduced: isCard ? 0 : 1 
        });
        
        ln.kapital = kap - principalPaid; 
        if(!isCard) ln.installmentsLeft = (parseInt(ln.installmentsLeft)||0) - 1; 
        if(ln.kapital < 0) ln.kapital = 0; 
        if(ln.installmentsLeft < 0) ln.installmentsLeft = 0;
        
        if(transId) window.db.home.trans = window.db.home.trans.filter(x => x.id != transId); 
        else window.db.home.trans = window.db.home.trans.filter(x => !(x.isPlanned && x.loanId == loanId && x.rD.startsWith(window.getLocalYMD().substring(0,7)))); 
        
        window.hSyncSchedule(); 
        window.save(); 
        window.render(); 
        if(window.sysAlert) window.sysAlert("Zaksięgowano!", `Z konta pobrano ${Number(val||0).toFixed(2)} zł.`, "success");
    }
    let m = document.getElementById('m-pay-loan'); 
    if(m) m.remove();
};

window.hOverpayLoan = function(loanId) {
    let ln = window.db.home.loans.find(x => x.id == loanId); 
    if(!ln) return;
    let html = `<div id="m-overpay" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--info);"><h3 style="margin-top:0; color:var(--info);">💰 Nadpłata Kapitału</h3><div class="inp-group" style="margin-bottom:15px;"><label>Dodatkowa gotówka (zł)</label><input type="number" id="mo-val" placeholder="np. 1000" class="big-inp" style="color:var(--info); background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Konto</label><select id="mo-acc" style="background:#18181b;">${window.db.home.accs.map(a => `<option value="${a.id}" ${a.id==(ln.accId||window.db.home.accs[0].id)?'selected':''}>${a.n}</option>`).join('')}</select></div><button class="btn" style="background:var(--info); color:#fff;" onclick="window.hSaveOverpay('${loanId}')">ZAPISZ NADPŁATĘ</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-overpay').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html);
};

window.hSaveOverpay = function(loanId) { 
    let val = parseFloat(document.getElementById('mo-val').value); 
    let accId = document.getElementById('mo-acc').value; 
    if(!val || val <= 0) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz kwotę!"); 
        return alert("Brak kwoty"); 
    } 
    let ln = window.db.home.loans.find(x => x.id == loanId); 
    if(ln) { 
        window.db.home.trans.unshift({ 
            id: Date.now(), type: 'exp', cat: 'Kredyt / Leasing', v: val, 
            d: 'Nadpłata: ' + ln.n, dt: new Date().toLocaleDateString('pl-PL'), 
            rD: new Date().toISOString(), isPlanned: false, acc: accId, loanAction: 'overpay', 
            loanId: ln.id, principalPaid: val, instReduced: 0 
        }); 
        ln.kapital = (parseFloat(ln.kapital)||0) - val; 
        if(ln.kapital < 0) ln.kapital = 0; 
        window.hSyncSchedule(); 
        window.save(); 
        window.render(); 
        if(window.sysAlert) window.sysAlert("Nadpłacono!", `Zmniejszyłeś kapitał o ${Number(val||0).toFixed(2)} zł!`, "success"); 
    } 
    document.getElementById('m-overpay').remove(); 
};

// --- SKARBONKI ---
window.hOpenPiggyModal = function() { 
    let html = `<div id="m-piggy" class="modal-overlay"><div class="panel" style="width:100%; max-width:380px; background:#09090b; border-color:var(--success);"><h3 style="margin-top:0; color:var(--success);">🎯 Cel Oszczędnościowy</h3><div class="inp-group" style="margin-bottom:10px;"><label>Cel (np. Wakacje)</label><input type="text" id="mp-n"></div><div class="inp-row" style="margin-bottom:10px;"><div class="inp-group"><label>Docelowo (zł)</label><input type="number" id="mp-target"></div><div class="inp-group"><label>Już masz (zł)</label><input type="number" id="mp-saved" value="0"></div></div><div class="inp-group" style="margin-bottom:20px;"><label>Data końcowa</label><input type="date" id="mp-date"></div><button class="btn btn-success" onclick="window.hSavePiggy()">ZAPISZ CEL</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-piggy').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hSavePiggy = function() { 
    let n = document.getElementById('mp-n').value; 
    let t = parseFloat(document.getElementById('mp-target').value); 
    let s = parseFloat(document.getElementById('mp-saved').value) || 0; 
    let d = document.getElementById('mp-date').value; 
    if(!n || !t) { 
        if(window.sysAlert) return window.sysAlert("Błąd", "Podaj nazwę i kwotę."); 
        return alert("Wymagane"); 
    } 
    window.db.home.piggy.push({id: Date.now(), n:n, target:t, saved:s, deadline: d}); 
    window.save(); 
    window.render(); 
    document.getElementById('m-piggy').remove(); 
};

window.hAddFundsPiggy = function(id) { 
    let pg = window.db.home.piggy.find(x => x.id == id); 
    if(!pg) return; 
    let html = `<div id="m-add-funds" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--success);"><h3 style="margin-top:0; color:var(--success);">🐷 Zasil: ${pg.n}</h3><div class="inp-group" style="margin-bottom:15px;"><input type="number" id="maf-val" placeholder="np. 100" class="big-inp" style="color:var(--success); background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Konto</label><select id="maf-acc" style="background:#18181b;">${window.db.home.accs.map(a => `<option value="${a.id}">${a.n}</option>`).join('')}</select></div><button class="btn btn-success" onclick="window.hSaveFundsPiggy('${id}')">WPŁAĆ</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-add-funds').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hSaveFundsPiggy = function(id) { 
    let val = parseFloat(document.getElementById('maf-val').value); 
    let accId = document.getElementById('maf-acc').value; 
    if(!val || val <= 0) return alert("Błąd wpłaty"); 
    let pg = window.db.home.piggy.find(x => x.id == id); 
    if(pg) { 
        let dObj = new Date(); 
        dObj.setHours(12,0,0); 
        window.db.home.trans.unshift({
            id:Date.now(), type:'exp', cat:'Oszczędności / Skarbonka', acc:accId, 
            d:`Cel: ${pg.n}`, v:val, who:window.db.userName, 
            dt:dObj.toLocaleDateString('pl-PL'), rD:dObj.toISOString(), 
            isPlanned: false, piggyAction: 'deposit', piggyId: pg.id, amount: val
        }); 
        pg.saved = (parseFloat(pg.saved)||0) + val; 
        window.save(); 
        window.render(); 
    } 
    document.getElementById('m-add-funds').remove(); 
};

window.hDelPiggy = function(id) { 
    if(window.sysConfirm) { 
        window.sysConfirm("Usuwanie", "Usunąć cel?", () => { 
            window.db.home.piggy = window.db.home.piggy.filter(x => x.id != id); 
            window.save(); 
            window.render(); 
        }); 
    } else { 
        window.db.home.piggy = window.db.home.piggy.filter(x => x.id != id); 
        window.save(); 
        window.render(); 
    } 
};

// --- DŁUGI / PAYPO I RATY ---
window.hAddDebt = function() { 
    let n = document.getElementById('hd-name').value.trim(); 
    let v = parseFloat(document.getElementById('hd-val').value); 
    
    let dEl = document.getElementById('hd-date');
    let dlEl = document.getElementById('hd-deadline');
    let dt = dEl ? dEl.value : window.getLocalYMD().substring(0,10);
    let dl = dlEl ? dlEl.value : '';

    if(!n || isNaN(v) || v <= 0) {
        if(window.sysAlert) return window.sysAlert("Błąd", "Podaj poprawną nazwę i kwotę.", "error");
        return alert("Błąd: Wpisz nazwę i kwotę.");
    }
    
    let dId = Date.now(); 
    let isOwe = window.hDebtType === 'i_owe'; 
    
    let dObj = new Date(); 
    if (dl) {
        dObj = new Date(dl);
    } else {
        dObj.setDate(dObj.getDate() + 30); 
    }
    dObj.setHours(12,0,0); 
    
    window.db.home.debts.push({ 
        id: dId, person: n, amount: v, type: window.hDebtType, 
        date: dt, deadline: dl, isClosed: false 
    }); 
    
    window.db.home.trans.push({ 
        id: 'd_'+dId, type: isOwe ? 'exp' : 'inc', cat: isOwe ? 'Inne Wydatki' : 'Inne Wpływy', 
        acc: window.db.home.accs[0].id, d: (isOwe ? 'Odroczone (PayPo): ' : 'Dług: ') + n, 
        v: v, who: window.db.userName, dt: dObj.toLocaleDateString('pl-PL'), 
        rD: dObj.toISOString(), isPlanned: true, debtId: dId 
    }); 
    
    window.db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD)); 
    window.hSyncSchedule(); 
    window.save(); 
    window.render(); 
    if(window.sysAlert) window.sysAlert("Sukces", "Zapisano wpis w zeszycie!", "success"); 
};

window.hDelDebtMistake = function(id) { 
    if(window.sysConfirm) { 
        window.sysConfirm("Usuwanie", "Usunąć wpis z zeszytu?", () => { 
            window.db.home.debts = window.db.home.debts.filter(d => d.id != id); 
            window.db.home.trans = window.db.home.trans.filter(t => !(t.isPlanned && t.debtId == id)); 
            window.save(); 
            window.render(); 
        }); 
    } 
};

window.hOpenPayDebtModal = function(id) { 
    let d = window.db.home.debts.find(x => x.id == id); 
    if(!d) return; 
    let html = `<div id="m-pay-debt" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--warning);"><h3 style="margin-top:0; color:var(--warning);">🤝 Rozliczenie</h3><p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px;">Wpis: <strong>${d.person}</strong></p><div class="inp-group" style="margin-bottom:15px;"><input type="number" step="0.01" id="mpd-val" value="${Number(d.amount||0).toFixed(2)}" max="${d.amount}" class="big-inp" style="color:var(--warning); background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Konto</label><select id="mpd-acc" style="background:#18181b;">${window.db.home.accs.map(a => `<option value="${a.id}">${a.n}</option>`).join('')}</select></div><button class="btn" style="background:var(--warning); color:#000;" onclick="window.hExecPayDebt('${d.id}')">POTWIERDŹ SPŁATĘ</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-pay-debt').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hExecPayDebt = function(id) { 
    let val = parseFloat(document.getElementById('mpd-val').value); 
    let accId = document.getElementById('mpd-acc').value; 
    let d = window.db.home.debts.find(x => x.id == id); 
    if(!d || !val || val <= 0 || val > d.amount) return; 
    
    let isOwe = d.type === 'i_owe'; 
    let dObj = new Date(); 
    dObj.setHours(12,0,0); 
    
    window.db.home.trans.unshift({ 
        id: Date.now(), type: isOwe?'exp':'inc', cat: isOwe?'Inne Wydatki':'Inne Wpływy', 
        acc: accId, d: (isOwe?'Spłata Odroczona: ':'Otrzymano: ')+d.person, v: val, 
        who: window.db.userName, dt: dObj.toLocaleDateString('pl-PL'), 
        rD: dObj.toISOString(), isPlanned: false, debtAction: 'pay', debtId: d.id 
    }); 
    
    d.amount -= val; 
    let ptr = window.db.home.trans.find(x => x.debtId == id && x.isPlanned); 
    
    if(d.amount <= 0) { 
        d.amount = 0; 
        d.isClosed = true; 
        if(ptr) window.db.home.trans = window.db.home.trans.filter(x => x.id != ptr.id); 
        if(window.sysAlert) window.sysAlert("Rozliczono!", "Płatność w pełni uregulowana.", "success"); 
    } else { 
        if(ptr) ptr.v = d.amount; 
        if(window.sysAlert) window.sysAlert("Sukces!", `Pozostało jeszcze: ${Number(d.amount||0).toFixed(2)} zł.`, "success"); 
    } 
    window.hSyncSchedule(); 
    window.save(); 
    window.render(); 
    document.getElementById('m-pay-debt').remove(); 
};

// NOWOŚĆ: Funkcja do rozbicia Długu/PayPo na Raty pod właściwą nazwą guzika!
window.hConvertDebtToInstallments = function(id) {
    let d = window.db.home.debts.find(x => x.id == id); 
    if(!d) return; 
    let html = `<div id="m-split-debt" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--info);"><h3 style="margin-top:0; color:var(--info);">🔄 Rozbicie na Raty</h3><p style="font-size:0.75rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Zmieniasz ten wpis (${d.person}) w harmonogram ratalny. Zostanie on przeniesiony do głównych Zobowiązań.</p><div class="inp-group" style="margin-bottom:10px;"><label>Kwota JEDNEJ Raty (zł)</label><input type="number" step="0.01" id="msd-rata" placeholder="np. 68.14" class="big-inp" style="color:var(--info); background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:15px;"><label>Z ilu rat łącznie?</label><input type="number" id="msd-ilosc" placeholder="np. 4"></div><div class="inp-group" style="margin-bottom:20px;"><label>Dzień spłaty w miesiącu (1-31)</label><input type="number" id="msd-day" value="${new Date().getDate()}"></div><button class="btn" style="background:var(--info); color:#fff;" onclick="window.hExecSplitDebt('${d.id}')">ZATWIERDŹ I UTWÓRZ RATY</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-split-debt').remove()">ANULUJ</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
};

window.hExecSplitDebt = function(id) {
    let rata = parseFloat(document.getElementById('msd-rata').value);
    let ilosc = parseInt(document.getElementById('msd-ilosc').value);
    let day = parseInt(document.getElementById('msd-day').value) || 10;
    
    if(!rata || !ilosc || rata <= 0 || ilosc <= 0) {
        if(window.sysAlert) return window.sysAlert("Błąd", "Wpisz poprawną kwotę raty i ich ilość.");
        return alert("Błąd w kwotach!");
    }
    
    let d = window.db.home.debts.find(x => x.id == id); 
    if(!d) return; 

    let calkowitaKwota = rata * ilosc;

    // Utwórz nowy kredyt "Raty 0%"
    window.db.home.loans.push({
        id: Date.now(), 
        n: d.person, 
        accId: window.db.home.accs[0].id, 
        kapital: calkowitaKwota, 
        pct: 0, 
        rata: rata, 
        totalInst: ilosc, 
        installmentsLeft: ilosc, 
        day: day, 
        isClosed: false, 
        intType: 'Stałe', 
        instType: 'Równe', 
        borrowed: calkowitaKwota, 
        type: 'Raty', 
        minPayPct: 0, 
        declaredPay: '100'
    });

    // Usuń stary dług i jego planowaną transakcję
    window.db.home.debts = window.db.home.debts.filter(x => x.id != id); 
    window.db.home.trans = window.db.home.trans.filter(t => !(t.isPlanned && t.debtId == id)); 

    window.hSyncSchedule(); 
    window.save(); 
    
    document.getElementById('m-split-debt').remove(); 
    
    // Przenieś usera do zakładki Zobowiązań
    window.switchTab('goals');
    
    if(window.sysAlert) window.sysAlert("Sukces!", "Przeniesiono PayPo/Dług do Harmonogramu Rat!", "success");
};


// --- USTAWIENIA I RODZINA ---
window.hAddMem = function() { 
    let val = document.getElementById('h-new-mem').value.trim(); 
    if(val && !window.db.home.members.includes(val)) { 
        window.db.home.members.push(val); 
        window.save(); 
        window.render(); 
    } 
};

window.hDelMem = function(name) { 
    if(window.db.home.members.length <= 1) return; 
    if(window.sysConfirm) { 
        window.sysConfirm("Usuwanie", `Usunąć domownika: ${name}?`, () => { 
            window.db.home.members = window.db.home.members.filter(m => m !== name); 
            if(window.hMem === name) window.hMem = window.db.home.members[0]; 
            window.save(); 
            window.render(); 
        }); 
    } 
};

window.hAddRecurring = function() { 
    let n = document.getElementById('hr-name').value; 
    let v = parseFloat(document.getElementById('hr-val').value); 
    let d = parseInt(document.getElementById('hr-day').value) || 1; 
    if(!n || !v) return; 
    window.db.home.recurring.push({ id: Date.now(), n: n, v: v, t: window.hRecType, c: window.hRecCat, a: window.hRecAcc, day: d, lastBooked: '' }); 
    window.hSyncSchedule(); 
    window.save(); 
    window.render(); 
    if(window.sysAlert) window.sysAlert("Sukces", "Dodano do automatu!", "success"); 
};

window.hDelRecurring = function(id) { 
    window.db.home.recurring = window.db.home.recurring.filter(r => r.id !== id); 
    window.hSyncSchedule(); 
    window.save(); 
    window.render(); 
};

window.hSetBudget = function() { 
    let cat = document.getElementById('hb-cat').value; 
    let val = parseFloat(document.getElementById('hb-val').value); 
    if(!window.db.home.budgets) window.db.home.budgets = {}; 
    if(val > 0) window.db.home.budgets[cat] = val; 
    else delete window.db.home.budgets[cat]; 
    window.save(); 
    window.render(); 
    if(window.sysAlert) window.sysAlert("Sukces", "Zapisano limit.", "success"); 
};
