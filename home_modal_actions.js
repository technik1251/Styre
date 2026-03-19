
// ==========================================
// PLIK: home_modal_actions.js - Akcje, Konta, Skarbonki, Transakcje
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
    let who = window.hMem || window.db.home.members[0] || 'Ja'; 
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
    window.hOpenLoanModal(); 
    setTimeout(() => {
        document.getElementById('ml-type').value = 'PayPo';
        window.hToggleLoanFields();
        document.getElementById('ml-n').value = d.person;
        document.getElementById('ml-borrowed').value = d.amount;
        document.getElementById('ml-kapital').value = d.amount;
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

// ==========================================
// ZARZĄDZANIE KONTAMI I PORTFELAMI
// ==========================================
window.hOpenAccModal = function(id = null) {
    window.hInitDb();
    let acc = id ? window.db.home.accs.find(a => a.id == id) : null;
    let html = `<div id="m-acc" class="modal-overlay"><div class="panel" style="width:100%; max-width:320px; background:#09090b; border-color:var(--life);"><h3 style="margin-top:0; color:var(--life);">${acc ? '✏️ Edytuj Konto' : '🏦 Nowe Konto'}</h3><div class="inp-group" style="margin-bottom:15px;"><label>Nazwa Konta</label><input type="text" id="m-acc-n" value="${acc ? acc.n : ''}" placeholder="np. mBank, Gotówka" style="background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:15px;"><label>Początkowe Saldo (zł)</label><input type="number" step="0.01" id="m-acc-bal" value="${acc ? (acc.startBal||0) : 0}" style="background:rgba(0,0,0,0.5);"></div><div class="inp-group" style="margin-bottom:20px;"><label>Kolor identyfikacyjny</label><input type="color" id="m-acc-c" value="${acc ? acc.c : '#22c55e'}" style="width:100%; height:40px; border:none; background:transparent; cursor:pointer;"></div><button class="btn" style="background:var(--life); color:#000; font-weight:bold;" onclick="window.hSaveAcc('${id || ''}')">ZAPISZ KONTO</button><button class="btn" style="background:transparent; color:var(--muted); margin-top:5px;" onclick="document.getElementById('m-acc').remove()">ANULUJ</button></div></div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.hSaveAcc = function(id) {
    let n = document.getElementById('m-acc-n').value.trim();
    let bal = parseFloat(document.getElementById('m-acc-bal').value) || 0;
    let c = document.getElementById('m-acc-c').value;
    if(!n) return window.sysAlert ? window.sysAlert("Błąd", "Podaj nazwę konta!", "error") : alert("Podaj nazwę!");
    
    if(id) {
        let acc = window.db.home.accs.find(a => a.id == id);
        if(acc) { acc.n = n; acc.startBal = bal; acc.c = c; }
    } else {
        window.db.home.accs.push({id: 'acc_'+Date.now(), n: n, startBal: bal, c: c, i: '💳'});
    }
    window.save(); window.render();
    document.getElementById('m-acc').remove();
    if(window.sysAlert) window.sysAlert("Sukces", "Zapisano konto.", "success");
};

window.hDelAcc = function(id) {
    if(window.db.home.accs.length <= 1) {
        if(window.sysAlert) window.sysAlert("Odmowa", "Musisz mieć przynajmniej jedno aktywne konto!", "error");
        return;
    }
    if(window.sysConfirm) {
        window.sysConfirm("Usuwanie Konta", "Na pewno usunąć to konto? Możesz stracić przypisanie w historii transakcji.", () => {
            window.db.home.accs = window.db.home.accs.filter(a => a.id != id);
            window.save(); window.render();
            window.sysAlert("Usunięto", "Konto zostało wykasowane.", "success");
        });
    } else if(confirm("Usunąć konto?")) {
        window.db.home.accs = window.db.home.accs.filter(a => a.id != id);
        window.save(); window.render();
    }
};

window.hShowIconPicker = function(id) {
    let icon = prompt("Wklej jedno emoji jako ikonę konta (np. 🏦, 💳, 🐖, 🪙):", "💳");
    if(icon && icon.trim() !== "") {
        let acc = window.db.home.accs.find(a => a.id == id);
        if(acc) { acc.i = icon.trim(); window.save(); window.render(); }
    }
};
