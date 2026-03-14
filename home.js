// ==========================================
// PLIK 2: home.js - BUDŻET DOMOWY (StyreOS 3.5: Profesjonalne Zobowiązania, Reorganizacja Menu)
// ==========================================
const C_EXP = { 'Stałe opłaty / Czynsz': {c: '#f59e0b', i: '🏢'}, 'Prąd / Gaz / Woda': {c: '#0ea5e9', i: '⚡'}, 'Internet i Telefon': {c: '#8b5cf6', i: '🌐'}, 'Kredyt / Leasing': {c: '#ef4444', i: '🏦'}, 'Zakupy Spożywcze': {c: '#22c55e', i: '🛒'}, 'Dom i Rachunki': {c: '#14b8a6', i: '🏠'}, 'Auto i Transport': {c: '#f59e0b', i: '🚗'}, 'Rozrywka': {c: '#a855f7', i: '🎉'}, 'Jedzenie na mieście': {c: '#ef4444', i: '🍔'}, 'Ubrania': {c: '#ec4899', i: '👗'}, 'Zdrowie': {c: '#10b981', i: '💊'}, 'Oszczędności / Skarbonka': {c: '#10b981', i: '🐷'}, 'Inne Wydatki': {c: '#64748b', i: '📦'} };
const C_INC = { 'Wypłata z Etatu': {c: '#22c55e', i: '💼'}, 'Utarg z Taxi': {c: '#3b82f6', i: '🚕'}, 'Premia / Prezent': {c: '#10b981', i: '🎁'}, 'Inne Wpływy': {c: '#14b8a6', i: '📈'} };

window.hHistFilter = window.hHistFilter || 'all';
window.hCalMode = window.hCalMode || 'history';
if(!db.home.goals) db.home.goals = [];
if(!db.home.loans) db.home.loans = []; // Nowa tablica dla prawdziwych Zobowiązań

window.hGetBal = function() { 
    let b = {}; 
    db.home.accs.forEach(a => b[a.id] = a.startBal || 0); 
    db.home.trans.forEach(x => { 
        if(!x.isPlanned) { 
            if(x.type === 'inc' && b[x.acc] !== undefined) b[x.acc] += x.v; 
            if(x.type === 'exp' && b[x.acc] !== undefined) b[x.acc] -= x.v; 
            if(x.type === 'transfer') { 
                if(b[x.fromAcc] !== undefined) b[x.fromAcc] -= x.v; 
                if(b[x.toAcc] !== undefined) b[x.toAcc] += x.v; 
            } 
        }
    }); 
    return b; 
}

window.hCheckAuto = function() { 
    let n = new Date(); let cM = n.getFullYear() + '-' + String(n.getMonth()+1).padStart(2,'0'); let cD = n.getDate(); let added = 0;
    
    // Automaty ze starych subskrypcji
    if(db.home.recurring && db.home.recurring.length > 0) {
        db.home.recurring.forEach(r => {
            let rDay = r.day || 1;
            if(r.lastBooked !== cM && cD >= rDay) {
                let dObj = new Date(n.getFullYear(), n.getMonth(), rDay, 12, 0, 0);
                db.home.trans.push({ id: Date.now() + Math.random(), type: r.t, cat: r.c, acc: r.a, d: r.n + ' (Automat)', v: parseFloat(r.v), who: 'System', dt: dObj.toLocaleDateString('pl-PL'), rD: dObj.toISOString(), isPlanned: false });
                r.lastBooked = cM; added++;
            }
        });
    }

    // Automaty z Kredytów (Generowanie na liście "Planowane" co miesiąc)
    if(db.home.loans && db.home.loans.length > 0) {
        db.home.loans.forEach(l => {
            let lDay = l.day || 10;
            if(l.lastPlanned !== cM && l.left > 0) {
                let dObj = new Date(n.getFullYear(), n.getMonth(), lDay, 12, 0, 0);
                // Jeśli data w tym miesiącu jeszcze nie minęła, planuj na ten miesiąc. Jeśli minęła, planuj na następny.
                if(cD > lDay) dObj.setMonth(dObj.getMonth() + 1);
                
                db.home.trans.push({ id: 'loan_'+l.id+'_'+cM, type: 'exp', cat: 'Kredyt / Leasing', acc: db.home.accs[0].id, d: 'Rata: ' + l.n, v: l.rata, who: 'System', dt: dObj.toLocaleDateString('pl-PL'), rD: dObj.toISOString(), isPlanned: true, loanId: l.id });
                l.lastPlanned = cM; added++;
            }
        });
    }

    if(added > 0) {
        db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD)); window.save();
    }
}

// --- CUSTOM MODALE (ZAMIAST BRZYDKICH PROMPTÓW) ---
window.hOpenAccModal = function(id = null) {
    let ac = id ? db.home.accs.find(x => x.id === id) : null;
    let n = ac ? ac.n : ''; let b = ac ? ac.startBal : 0;
    let html = `<div id="m-acc" class="modal-overlay">
        <div class="panel" style="width:100%; max-width:320px; background:#09090b;">
            <h3 style="margin-top:0; color:#fff;">${ac ? 'Edytuj Konto' : 'Nowe Konto'}</h3>
            <div class="inp-group" style="margin-bottom:15px;"><label>Nazwa Konta</label><input type="text" id="ma-n" value="${n}" placeholder="np. mBank"></div>
            <div class="inp-group" style="margin-bottom:20px;"><label>Saldo Początkowe (zł)</label><input type="number" id="ma-b" value="${b}"></div>
            <button class="btn btn-success" onclick="window.hSaveAccModal('${id||''}')">ZAPISZ</button>
            <button class="btn" style="background:transparent; color:var(--muted); box-shadow:none; margin-top:5px;" onclick="document.getElementById('m-acc').remove()">ANULUJ</button>
        </div></div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}
window.hSaveAccModal = function(id) {
    let n = document.getElementById('ma-n').value; let b = parseFloat(document.getElementById('ma-b').value) || 0;
    if(!n) return window.sysAlert("Błąd", "Wpisz nazwę konta.");
    if(id) { let ac = db.home.accs.find(x => x.id === id); if(ac) { ac.n = n; ac.startBal = b; } } 
    else { let newId = 'acc_'+Date.now(); db.home.accs.push({id:newId, n:n, c:'#8b5cf6', i:'🏦', startBal:b}); setTimeout(()=>window.hShowIconPicker(newId), 300); }
    window.save(); window.render(); document.getElementById('m-acc').remove();
}

window.hShowIconPicker = function(accId) {
    let icons = [['🏦','#8b5cf6'],['💵','#22c55e'],['💳','#f59e0b'],['🐷','#ec4899'],['📈','#0ea5e9'],['💼','#64748b'],['💎','#eab308']];
    let html = `<div id="m-icon-picker" class="modal-overlay">
        <div class="panel" style="width:100%; max-width:320px; text-align:center; background:#09090b; border:1px solid rgba(255,255,255,0.1); border-radius:24px;">
            <h3 style="margin-top:0; color:#fff; font-size:1.3rem;">Wybierz Ikonę</h3>
            <div style="display:flex; flex-wrap:wrap; gap:15px; justify-content:center; margin-bottom:25px;">
                ${icons.map(i=>`<div onclick="window.hApplyIcon('${accId}','${i[0]}','${i[1]}')" style="font-size:2.2rem; width:70px; height:70px; display:flex; align-items:center; justify-content:center; background:${i[1]}15; border:2px solid ${i[1]}55; border-radius:18px; cursor:pointer;">${i[0]}</div>`).join('')}
            </div>
            <button class="btn" style="background:rgba(255,255,255,0.05); color:#fff;" onclick="document.getElementById('m-icon-picker').remove()">ANULUJ</button>
        </div></div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}
window.hApplyIcon = function(id, ico, col) { let ac = db.home.accs.find(x => x.id === id); if(ac) { ac.i = ico; ac.c = col; window.save(); window.render(); } document.getElementById('m-icon-picker').remove(); }
window.hDelAcc = function(id) { if(db.home.accs.length <= 1) return window.sysAlert("Błąd", "Musisz mieć min. 1 konto!"); window.sysConfirm("Usuwanie konta", "Na pewno? Znikną przypisane środki.", () => { db.home.accs = db.home.accs.filter(a => a.id !== id); save(); render(); }); }


// --- NOWY MODUŁ ZOBOWIĄZAŃ (KREDYTY) ---
window.hOpenLoanModal = function() {
    let html = `<div id="m-loan" class="modal-overlay">
        <div class="panel" style="width:100%; max-width:380px; background:#09090b; border-color:var(--danger);">
            <h3 style="margin-top:0; color:var(--danger); display:flex; align-items:center; gap:10px;">🏦 Dodaj Zobowiązanie</h3>
            <div class="inp-group" style="margin-bottom:10px;"><label>Nazwa (np. Kredyt Mieszkaniowy)</label><input type="text" id="ml-n"></div>
            <div class="inp-row" style="margin-bottom:10px;">
                <div class="inp-group"><label>Zostało do spłaty (zł)</label><input type="number" id="ml-left" placeholder="np. 38000"></div>
                <div class="inp-group"><label>Całkowita Kwota (zł)</label><input type="number" id="ml-total" placeholder="np. 50000"></div>
            </div>
            <div class="inp-row" style="margin-bottom:20px;">
                <div class="inp-group"><label>Miesięczna Rata (zł)</label><input type="number" id="ml-rata" placeholder="np. 1500"></div>
                <div class="inp-group"><label>Dzień spłaty (1-31)</label><input type="number" id="ml-day" placeholder="np. 10"></div>
            </div>
            <button class="btn btn-danger" onclick="window.hSaveLoan()">ZAPISZ KREDYT</button>
            <button class="btn" style="background:transparent; color:var(--muted); box-shadow:none; margin-top:5px;" onclick="document.getElementById('m-loan').remove()">ANULUJ</button>
        </div></div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}
window.hSaveLoan = function() {
    let n = document.getElementById('ml-n').value; let l = parseFloat(document.getElementById('ml-left').value); 
    let t = parseFloat(document.getElementById('ml-total').value); let r = parseFloat(document.getElementById('ml-rata').value);
    let d = parseInt(document.getElementById('ml-day').value) || 10;
    if(!n || !l || !t || !r) return window.sysAlert("Błąd", "Wypełnij wszystkie pola poprawnie.");
    db.home.loans.push({id: Date.now(), n:n, left:l, total:t, rata:r, day:d, lastPlanned: ''});
    window.save(); window.hCheckAuto(); window.render(); document.getElementById('m-loan').remove();
    window.sysAlert("Sukces!", "Dodano kredyt. Aplikacja zaplanowała pierwszą ratę w kalendarzu.", "success");
}

// Aktualizacja kredytu po spłaceniu raty w historii
window.hPayLoanInstallment = function(transId) {
    let tr = db.home.trans.find(x => x.id === transId);
    if(tr && tr.loanId) {
        let ln = db.home.loans.find(x => x.id === tr.loanId);
        if(ln) {
            ln.left -= tr.v; if(ln.left < 0) ln.left = 0;
            tr.isPlanned = false; tr.dt = new Date().toLocaleDateString('pl-PL');
            let nd = new Date(); nd.setHours(12,0,0); tr.rD = nd.toISOString();
            window.save(); window.render();
            window.sysAlert("Rata spłacona!", `Zostało do spłaty: ${ln.left.toFixed(2)} zł`, "success");
        }
    }
}


window.hAction = function() { 
    let el = document.getElementById('h-v'); 
    if(!el || !el.value) { if(el) { el.style.borderBottom = '2px solid red'; el.classList.add('shake-anim'); setTimeout(()=>el.classList.remove('shake-anim'), 300); } return window.sysAlert("Brak kwoty", "Wpisz kwotę."); } 
    let v = parseFloat(el.value); let dEl = document.getElementById('h-d'); let d = dEl ? dEl.value : ''; 
    let who = window.hMem || db.home.members[0]; let dVal = document.getElementById('h-date') ? document.getElementById('h-date').value : ''; 
    let todayYMD = window.getLocalYMD(); let isPlannedTrans = dVal > todayYMD; 
    let dObj = dVal ? new Date(dVal) : new Date(); if(dVal) dObj.setHours(12,0,0); 
    
    let recEl = document.getElementById('h-recurring'); let isRecurring = recEl && recEl.value === 'month';

    if(window.hTransType === 'transfer') { 
        let fAcc = window.hSelAccFrom; let tAcc = window.hSelAccTo; 
        if(!fAcc || !tAcc || fAcc === tAcc) return window.sysAlert("Błąd Przelewu", "Wybierz 2 różne konta."); 
        db.home.trans.push({id:Date.now(), type:'transfer', fromAcc:fAcc, toAcc:tAcc, d, v, who, dt:dObj.toLocaleDateString('pl-PL'), rD:dObj.toISOString(), isPlanned: isPlannedTrans}); 
    } else { 
        let acc = window.hSelAcc || db.home.accs[0].id; let c = window.hSelCat; 
        db.home.trans.push({id:Date.now(), type:window.hTransType, cat:c, acc:acc, d, v, who, dt:dObj.toLocaleDateString('pl-PL'), rD:dObj.toISOString(), isPlanned: isPlannedTrans}); 
        if(isRecurring) {
            db.home.recurring.push({ id: Date.now()+1, n: d || c, v: v, t: window.hTransType, c: c, a: acc, day: dObj.getDate(), lastBooked: window.getLocalYMD().substring(0,7) });
            setTimeout(()=> window.sysAlert("Zapisano!", "Operacja dodana, a automat będzie ją ponawiał co miesiąc.", "success"), 500);
        }
    } 
    db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD)); save(); db.tab='dash'; render(); 
} 

window.rHome = function() { 
    let h = db.home; let t = db.tab; if(!window.hMem) window.hMem = h.members[0] || db.userName;
    let needsSave = false; let today = window.getLocalYMD();
    h.trans.forEach(x => { if(x.isPlanned && !x.loanId && x.rD.split('T')[0] <= today) { x.isPlanned = false; needsSave = true; } });
    if(needsSave) { window.save(); }

    // --- ZMIENIONA NAWIGACJA (Usunięto Zarządzaj, dodano Cele/Zobowiązania) ---
    let nav = `<div class="nav"><div class="nav-item ${t==='dash'?'act-home':''}" onclick="db.tab='dash';window.render()"><i>🏠</i>Przegląd</div><div class="nav-item ${t==='goals'?'act-home':''}" onclick="db.tab='goals';window.render()"><i>🏦</i>Zobowiązania</div><div class="nav-item" style="transform:translateY(-15px);"><div style="background:var(--life); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto; box-shadow:0 5px 15px rgba(20,184,166,0.4); color:#000; font-size:1.8rem;" onclick="db.tab='add';window.render()">+</div></div><div class="nav-item ${t==='stats'?'act-home':''}" onclick="db.tab='stats';window.render()"><i>📊</i>Wykresy</div><div class="nav-item ${t==='cal'?'act-home':''}" onclick="db.tab='cal';window.render()"><i>📅</i>Historia</div></div>`; 
    
    // Header z dostępem do "Zarządzaj kontami / Ustawienia"
    let hdr = `<header><button class="logo" onclick="window.openSwitcher()">${STYRE_LOGO}</button><div class="header-actions" style="display:flex; gap:10px;">
        <div class="settings-btn" style="background:transparent; border:none; padding:0; display:flex; flex-direction:column; align-items:center;" onclick="db.tab='acc';window.render()"><span style="font-size:1.3rem; line-height:1;">💳</span><span style="font-size:0.5rem; font-weight:900; color:var(--muted); text-transform:uppercase;">Konta</span></div>
        <div class="settings-btn" style="background:transparent; border:none; padding:0; display:flex; flex-direction:column; align-items:center;" onclick="db.tab='set';window.render()"><span style="font-size:1.3rem; line-height:1;">⚙️</span><span style="font-size:0.5rem; font-weight:900; color:var(--muted); text-transform:uppercase;">Opcje</span></div>
    </div></header>`; 
    
    let balances = window.hGetBal(); let globalBalance = Object.values(balances).reduce((a,b)=>a+b, 0); 
    let now = new Date(); let currExp=0; let currInc=0; let plannedSum = 0;
    h.trans.forEach(x => { 
        let d = new Date(x.rD); 
        if(d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()) { 
            if(!x.isPlanned) { if(x.type==='exp') currExp += x.v; if(x.type==='inc') currInc += x.v; } 
            else if (x.type === 'exp') { plannedSum += x.v; }
        } 
    });

    if(t === 'dash') { 
        APP.innerHTML = hdr + `<div style="background: linear-gradient(180deg, rgba(20,184,166,0.15) 0%, var(--bg) 100%); padding: 30px 20px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius:30px; border-bottom-right-radius:30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <p style="margin:0 0 5px 0; font-size:0.8rem; color:var(--muted); text-transform:uppercase; font-weight:bold; letter-spacing:1px;">Dostępne środki</p>
        <h1 style="margin:0; font-size:3.8rem; font-weight:900; color:${globalBalance >= 0 ? '#fff' : 'var(--danger)'}; letter-spacing:-1.5px;">${globalBalance.toFixed(2)} zł</h1>
        ${plannedSum > 0 ? `<div style="margin-top:10px; font-size:0.85rem; color:var(--warning); display:flex; align-items:center; justify-content:center; gap:5px; background:rgba(245, 158, 11, 0.1); padding:5px 10px; border-radius:8px; border:1px solid rgba(245, 158, 11, 0.3); width:max-content; margin-left:auto; margin-right:auto; cursor:pointer;" onclick="window.hCalMode='planned'; db.tab='cal'; window.render()"><span>⏳ Zaplanowane w tym m-cu:</span> <strong>-${plannedSum.toFixed(2)} zł</strong> <span style="font-size:0.7rem; margin-left:5px;">(Pokaż >)</span></div>` : ''}
        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
        <div style="flex:1; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:12px; padding:10px;">
        <div style="color:var(--success); font-weight:bold; margin-bottom:8px; font-size:1.1rem;">+${currInc.toFixed(0)} zł</div>
        <button class="btn btn-success" style="padding:8px; font-size:0.75rem; margin-top:0; width:100%; box-shadow:none;" onclick="window.hTransType='inc'; db.tab='add'; window.render()">💰 WPŁYW</button>
        </div>
        <div style="flex:1; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:12px; padding:10px;">
        <div style="color:var(--danger); font-weight:bold; margin-bottom:8px; font-size:1.1rem;">-${currExp.toFixed(0)} zł</div>
        <button class="btn btn-danger" style="padding:8px; font-size:0.75rem; margin-top:0; width:100%; box-shadow:none;" onclick="window.hTransType='exp'; db.tab='add'; window.render()">💸 WYDATEK</button>
        </div>
        </div></div>
        <div class="section-lbl" style="color:#fff; border-color:rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; margin-top:20px;">Ostatnie i Zaplanowane</div>
        <div style="padding: 0 15px;">${[...h.trans].sort((a,b)=>new Date(b.rD)-new Date(a.rD)).slice(0,8).map(x=>{ 
            let isExp = x.type === 'exp'; let isTrans = x.type === 'transfer'; 
            let cd = isExp ? (C_EXP[x.cat] || {c:'#ef4444',i:'💸'}) : (isTrans ? {c:'#8b5cf6',i:'🔄'} : (C_INC[x.cat] || {c:'#22c55e',i:'💵'})); 
            let accName = isTrans ? `Z ${h.accs.find(a=>a.id===x.fromAcc)?.n} na ${h.accs.find(a=>a.id===x.toAcc)?.n}` : (h.accs.find(a=>a.id===x.acc)?.n || 'Konto'); 
            let catName = isTrans ? 'Przelew własny' : x.cat; let sign = isExp ? '-' : (isTrans ? '' : '+'); 
            let color = isExp ? 'var(--danger)' : (isTrans ? '#fff' : 'var(--success)'); 
            let opacity = x.isPlanned ? '0.6' : '1';
            let planLbl = x.isPlanned ? `<span style="color:var(--warning); font-size:0.65rem; border:1px solid var(--warning); padding:1px 4px; border-radius:4px; margin-left:6px; white-space:nowrap;">PLAN: ${x.dt}</span>` : '';
            
            // Specjalny guzik "Zapłać Ratę" dla kredytów w dashboardzie
            let payBtn = (x.isPlanned && x.loanId) ? `<button style="background:rgba(34,197,94,0.2); color:var(--success); border:1px solid var(--success); border-radius:8px; padding:6px 12px; font-size:0.75rem; font-weight:bold; cursor:pointer; width:100%; margin-top:8px;" onclick="window.hPayLoanInstallment('${x.id}')">💸 OPŁAĆ RATĘ TERAZ</button>` : '';

            return `<div class="log-item" style="border:none; border-bottom:1px solid rgba(255,255,255,0.05); border-radius:0; margin-bottom:0; background:transparent; padding:15px 5px; opacity:${opacity}; flex-direction:column; align-items:stretch;"><div style="display:flex; justify-content:space-between; align-items:center; width:100%;"><div style="display:flex; align-items:center; gap:15px; flex:1;"><div style="width:45px; height:45px; border-radius:50%; background:${cd.c}22; border:1px solid ${cd.c}55; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">${cd.i}</div><div><strong style="font-size:0.95rem; color:#fff; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${catName} ${planLbl}</strong><small style="color:var(--muted); display:block; margin-top:4px;">${accName} • ${x.isPlanned ? 'ZAPLANOWANE' : x.dt}</small></div></div><div style="text-align:right;"><strong style="color:${color}; font-size:1.1rem; white-space:nowrap;">${sign}${x.v.toFixed(2)} zł</strong></div></div>${payBtn}</div>`; 
        }).join('') || '<div style="text-align:center;color:var(--muted);padding:20px 0; font-size:0.8rem;">Brak operacji na koncie.</div>'}</div>` + nav; 
    } 

    // --- NOWA ZAKŁADKA: CELE I ZOBOWIĄZANIA (ZABÓJCA EXCELA) ---
    if(t === 'goals') {
        APP.innerHTML = hdr + `<div class="dash-hero" style="padding-bottom:10px;">
            <p style="letter-spacing:1px; color:var(--danger)">TWOJE ZOBOWIĄZANIA</p>
            <h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px;">Kredyty i Leasingi</h1>
            <button class="btn btn-danger" style="border-radius:12px; font-weight:900; box-shadow:0 4px 20px rgba(239,68,68,0.4); width:auto; padding:12px 25px; font-size:0.9rem;" onclick="window.hOpenLoanModal()">+ DODAJ KREDYT</button>
        </div>
        <div style="padding: 10px 15px;">
            ${db.home.loans.length === 0 ? '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:30px;">Brak kredytów. Ciesz się wolnością finansową! 🕊️</div>' : db.home.loans.map(l => {
                let pct = 100 - ((l.left / l.total) * 100);
                return `<div class="panel" style="padding:20px; border-left:4px solid var(--danger); background:linear-gradient(145deg, #1e1010, #09090b); margin-bottom:15px; border-radius:16px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <div><span style="font-size:1.5rem; margin-right:8px;">🏦</span><strong style="color:#fff; font-size:1.2rem;">${l.n}</strong></div>
                        <div style="text-align:right;"><span style="color:var(--muted); font-size:0.8rem; display:block;">Pozostało do spłaty:</span><strong style="color:var(--danger); font-size:1.3rem;">${l.left.toFixed(2)} zł</strong></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--muted); margin-bottom:8px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
                        <span>Rata: <strong style="color:#fff;">${l.rata.toFixed(2)} zł</strong> (Dzień: ${l.day})</span>
                        <span>Zaciągnięto: ${l.total.toFixed(0)} zł</span>
                    </div>
                    <div style="width:100%; height:12px; background:rgba(0,0,0,0.5); border-radius:6px; overflow:hidden;"><div style="width:${pct}%; background:var(--success); height:100%;"></div></div>
                    <div style="text-align:center; font-size:0.8rem; color:var(--success); margin-top:8px; font-weight:bold;">Spłacono: ${pct.toFixed(1)}% kapitału!</div>
                </div>`;
            }).join('')}
        </div>` + nav;
    }
    
    // --- STARE ZARZĄDZANIE KONTAMI (Teraz przeniesione pod przycisk 'Konta' na górze) ---
    if(t === 'acc') { 
        APP.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:10px;">
            <p style="letter-spacing:1px; color:var(--life)">KONTA I ZESZYT DŁUGÓW</p>
            <h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px;">Zarządzanie</h1>
            <button class="btn" style="background:linear-gradient(135deg, var(--life), #0d9488); color:#000; border-radius:12px; font-weight:900; box-shadow:0 4px 20px rgba(20,184,166,0.4); width:auto; padding:12px 25px; font-size:0.9rem;" onclick="window.hOpenAccModal()">+ DODAJ KONTO</button>
        </div>
        <div style="padding: 10px 15px;">
            ${h.accs.map(a => `<div class="panel" style="padding:15px; border-left:4px solid ${a.c}; margin-bottom:15px;"><div style="display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; align-items:center; gap:15px;"><div style="width:50px; height:50px; border-radius:50%; background:${a.c}22; display:flex; align-items:center; justify-content:center; font-size:1.8rem; border:1px solid ${a.c}55;">${a.i}</div><div><strong style="font-size:1.2rem; color:#fff;">${a.n}</strong><small style="color:var(--muted); display:block; margin-top:2px; font-size:0.75rem;">Bieżące saldo</small></div></div><strong style="color:${balances[a.id]>=0?'#fff':'var(--danger)'}; font-size:1.4rem;">${balances[a.id].toFixed(2)} zł</strong></div><div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;"><button style="flex:1; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 5px; font-size:0.75rem; cursor:pointer;" onclick="window.hOpenAccModal('${a.id}')">✏️ Edytuj</button><button style="flex:1; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 5px; font-size:0.75rem; cursor:pointer;" onclick="window.hShowIconPicker('${a.id}')">🎨 Ikona</button><button style="background:rgba(239,68,68,0.15); color:var(--danger); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:10px 15px; cursor:pointer;" onclick="window.hDelAcc('${a.id}')">🗑️</button></div></div>`).join('')}
        </div>
        <div class="section-lbl" style="color:var(--warning); border-color:var(--warning); margin-top:20px;">🤝 Zeszyt Długów</div>
        <div class="panel" style="border-color:var(--warning);"><div class="mode-switch" style="margin-bottom:15px; background:rgba(0,0,0,0.5);"><div class="m-btn ${window.hDebtType==='they_owe'?'active':''}" style="${window.hDebtType==='they_owe'?'background:var(--success);color:#000;':''}" onclick="window.hDebtType='they_owe';window.render()">Ktoś mi wisi</div><div class="m-btn ${window.hDebtType==='i_owe'?'active':''}" style="${window.hDebtType==='i_owe'?'background:var(--danger);color:#000;':''}" onclick="window.hDebtType='i_owe';window.render()">Ja komuś wiszę</div></div><div class="inp-row"><div class="inp-group"><label>Kto / Od kogo?</label><input type="text" id="hd-name" placeholder="np. Jan Kowalski" style="background:#000;"></div><div class="inp-group"><label>Kwota (zł)</label><input type="number" id="hd-val" placeholder="np. 150" style="background:#000;"></div></div><button class="btn" style="background:var(--warning); color:#000; padding:15px; margin-bottom:20px; font-weight:900;" onclick="window.hAddDebt()">ZAPISZ DŁUG DO ZESZYTU</button><div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">${h.debts.length === 0 ? '<div style="text-align:center; color:var(--muted); font-size:0.85rem;">Brak wpisów w zeszycie.</div>' : h.debts.map(d => `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid ${d.type === 'they_owe' ? 'var(--success)' : 'var(--danger)'};"><div><strong style="color:#fff; font-size:1.1rem;">${d.person}</strong><span style="font-size:0.75rem; color:var(--muted); display:block;">Data dodania: ${d.date}</span></div><div style="display:flex; align-items:center; gap:15px;"><strong style="color:${d.type === 'they_owe' ? 'var(--success)' : 'var(--danger)'}; font-size:1.2rem;">${d.amount.toFixed(2)} zł</strong><button style="background:rgba(255,255,255,0.1); color:#fff; border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.hDelDebt(${d.id})">SPŁACONE</button></div></div>`).join('')}</div></div>` + nav; 
    }

    if(t === 'add') { 
        let isExp = window.hTransType === 'exp'; let isTrans = window.hTransType === 'transfer'; 
        let col = isExp ? 'var(--danger)' : (isTrans ? 'var(--info)' : 'var(--success)'); 
        let topBg = isExp ? 'var(--bg-exp)' : (isTrans ? 'linear-gradient(180deg, #0ea5e9 0%, #09090b 100%)' : 'var(--bg-inc)'); 
        let todayStr = window.getLocalYMD(); let catSrc = isExp ? C_EXP : C_INC; 
        if(!isTrans && (!window.hSelCat || !catSrc[window.hSelCat])) window.hSelCat = Object.keys(catSrc)[0]; 
        if(!window.hSelAcc && h.accs.length > 0) window.hSelAcc = h.accs[0].id;
        if(!window.hSelAccFrom && h.accs.length > 0) window.hSelAccFrom = h.accs[0].id;
        if(!window.hSelAccTo && h.accs.length > 1) window.hSelAccTo = h.accs[1].id;

        // DYNAMICZNE SZABLONY
        let templates = [];
        if(!isTrans) {
            let counts = {};
            db.home.trans.filter(x => x.type === window.hTransType && !x.isPlanned).forEach(x => {
                let key = x.d + '|' + x.cat; 
                if(!counts[key]) counts[key] = {n: x.d || x.cat, c: x.cat, v: x.v, cnt: 0};
                counts[key].cnt++; counts[key].v = x.v;
            });
            templates = Object.values(counts).sort((a,b) => b.cnt - a.cnt).slice(0,3).map(x => {
                return {n: x.n.substring(0,12), v: x.v, c: x.c, i: catSrc[x.c] ? catSrc[x.c].i : '💸'};
            });
            if(templates.length === 0) {
                templates = isExp ? [{n:'Kawa', v:15, c:'Jedzenie na mieście', i:'☕'}, {n:'Paliwo', v:150, c:'Auto i Transport', i:'⛽'}, {n:'Biedronka', v:100, c:'Zakupy Spożywcze', i:'🛒'}] 
                : [{n:'Wypłata', v:4000, c:'Wypłata z Etatu', i:'💰'}, {n:'Kieszonkowe', v:100, c:'Inne Wpływy', i:'🎁'}];
            }
        }
        
        let tplHtml = !isTrans ? `<div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:10px; margin-bottom:15px;">
            ${templates.map(tpl => `<div onclick="window.hUseTemplate(${tpl.v}, '${tpl.c}', '${tpl.n}')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:8px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer; white-space:nowrap;"><span style="font-size:1.2rem;">${tpl.i}</span><span style="color:#fff; font-weight:bold; font-size:0.85rem;">${tpl.n}</span></div>`).join('')}
        </div>` : '';

        let accSlider = (selVar) => `<div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:5px;">
            ${h.accs.map(a => `<div onclick="window.${selVar}='${a.id}'; window.render()" style="background:${window[selVar]===a.id?a.c+'33':'rgba(255,255,255,0.05)'}; border:1px solid ${window[selVar]===a.id?a.c:'rgba(255,255,255,0.1)'}; border-radius:12px; padding:10px; min-width:110px; flex-shrink:0; text-align:center; cursor:pointer;"><div style="font-size:1.5rem; margin-bottom:5px;">${a.i}</div><strong style="color:#fff; font-size:0.8rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.n}</strong><small style="color:var(--muted); font-size:0.7rem;">${balances[a.id].toFixed(0)} zł</small></div>`).join('')}
        </div>`;

        let gridHtml = !isTrans ? `<div class="cat-grid" style="grid-template-columns: repeat(4, 1fr); gap:8px;">` + Object.keys(catSrc).map(k => `<div class="cat-item ${window.hSelCat===k?'active':''}" onclick="window.hSelCat='${k}'; window.hCheckLimit(); window.render();" style="padding:10px 5px; ${window.hSelCat===k?`background:${catSrc[k].c}22; border-color:${catSrc[k].c};`:''}"><span class="cat-icon" style="font-size:1.5rem; margin-bottom:5px;">${catSrc[k].i}</span><span class="cat-lbl" style="font-size:0.65rem; line-height:1.1;">${k}</span></div>`).join('') + `</div>` : ''; 
        let memChips = `<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:5px;">` + h.members.map(m => `<div class="chip ${window.hMem === m ? 'active' : ''}" style="padding:8px 16px; flex-shrink:0; ${window.hMem === m ? 'background:var(--life);color:#000;border-color:var(--life)' : 'color:var(--muted)'}" onclick="window.hMem='${m}'; window.render();">${m}</div>`).join('') + `</div>`; 

        APP.innerHTML = hdr + `<div style="background: ${topBg}; padding: 20px 15px 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div class="mode-switch" style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1);"><div class="m-btn" style="${isExp?'background:var(--danger); color:#fff;':'color:var(--muted)'}" onclick="window.hTransType='exp';window.render()">WYDATEK</div><div class="m-btn" style="${!isExp&&!isTrans?'background:var(--success); color:#fff;':'color:var(--muted)'}" onclick="window.hTransType='inc';window.render()">WPŁYW</div><div class="m-btn" style="${isTrans?'background:var(--info); color:#fff;':'color:var(--muted)'}" onclick="window.hTransType='transfer';window.render()">TRANSFER</div></div>
        <div style="text-align:center; padding: 15px 0 5px;">
            <label style="color:#fff; font-size:0.8rem; font-weight:bold; text-transform:uppercase; opacity:0.8;">Wprowadź Kwotę</label>
            <div style="display:flex; justify-content:center; align-items:center; gap:5px; margin-top:5px;">
                <input type="number" id="h-v" oninput="window.hCheckLimit()" style="background:transparent; border:none; border-bottom:2px solid #fff; color:#fff; font-size:4rem!important; font-weight:900; text-align:center; width:200px; padding:5px; outline:none;" placeholder="0">
                <span style="font-size:2rem; font-weight:900; color:#fff;">zł</span>
            </div>
            <div id="h-warn-limit" style="display:none; color:var(--warning); font-size:0.75rem; font-weight:bold; margin-top:10px; background:rgba(245,158,11,0.15); padding:6px; border-radius:8px; border:1px solid rgba(245,158,11,0.3);"></div>
        </div></div>
        <div style="padding: 15px;">
            ${tplHtml}
            <div style="margin-bottom:15px;"><label style="font-size:0.75rem; color:var(--muted); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:8px;">Kto wykonuje?</label>${memChips}</div>
            ${isTrans ? `
                <div style="margin-bottom:15px;"><label style="font-size:0.75rem; color:var(--danger); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:8px;">Z Konta (Wypływ)</label>${accSlider('hSelAccFrom')}</div>
                <div style="margin-bottom:15px;"><label style="font-size:0.75rem; color:var(--success); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:8px;">Na Konto (Wpływ)</label>${accSlider('hSelAccTo')}</div>
            ` : `
                <div style="margin-bottom:15px;"><label style="font-size:0.75rem; color:var(--life); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:8px;">Wybierz Konto</label>${accSlider('hSelAcc')}</div>
                <label style="font-size:0.75rem; color:var(--muted); font-weight:bold; text-transform:uppercase; margin-bottom:8px; display:block;">Wybierz Kategorię</label>${gridHtml}
            `}
            <div class="inp-group" style="margin-top:15px; margin-bottom:15px;"><input type="text" id="h-d" placeholder="Notatka (Opcjonalnie)" style="background:#18181b; padding:15px;"></div>
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <div class="inp-group" style="flex:1;"><label>Data</label><input type="date" id="h-date" value="${todayStr}" style="background:#18181b;"></div>
                ${!isTrans ? `<div class="inp-group" style="flex:1;"><label>Powtarzaj co msc</label><select id="h-recurring" style="background:#18181b;"><option value="none">Nie</option><option value="month">Tak 🔄</option></select></div>` : ''}
            </div>
            <button class="btn" style="background:${col}; color:#fff; font-size:1.2rem; font-weight:900; padding:20px; box-shadow:0 10px 20px ${col}44;" onclick="window.hAction()">${isTrans?'WYKONAJ PRZELEW':'ZAPISZ TRANSAKCJĘ'}</button>
        </div>` + nav; 
    } 
    
    if(t === 'stats') { 
        let now = new Date(); let cats = {}; let incCats = {}; 
        let sumExp = 0; let sumInc = 0; let sumFixed = 0; let sumVar = 0; 
        h.trans.forEach(x => { 
            let d = new Date(x.rD); 
            if(!x.isPlanned && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()) { 
                if(x.type === 'exp') { 
                    if(!cats[x.cat]) cats[x.cat] = 0; cats[x.cat] += x.v; sumExp += x.v; 
                    if(FIXED_EXP_CATS.includes(x.cat)) sumFixed += x.v; else sumVar += x.v; 
                } 
                if(x.type === 'inc') { 
                    if(!incCats[x.cat]) incCats[x.cat] = 0; incCats[x.cat] += x.v; sumInc += x.v; 
                } 
            } 
        }); 
        
        let sortedCats = Object.keys(cats).sort((a,b) => cats[b] - cats[a]); 
        let cLabels = sortedCats; let cData = sortedCats.map(k => cats[k]); let cColors = sortedCats.map(k => C_EXP[k] ? C_EXP[k].c : '#8b5cf6'); 
        let catListHtml = sortedCats.map((lbl, idx) => { let val = cData[idx]; let pct = sumExp > 0 ? ((val / sumExp) * 100).toFixed(0) : 0; let color = cColors[idx]; let icon = C_EXP[lbl] ? C_EXP[lbl].i : '📦'; return `<div class="cat-list-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><div style="display:flex; align-items:center;"><div style="width:30px; height:30px; border-radius:50%; background:${color}22; display:flex; align-items:center; justify-content:center; margin-right:12px; font-size:1rem; border:1px solid ${color}55;">${icon}</div><span style="font-weight:bold;">${lbl}</span></div><div style="display:flex; align-items:center;"><span style="color:var(--muted);font-size:0.8rem;margin-right:10px;">${pct}%</span><span style="color:${color};font-weight:bold;">-${val.toFixed(2)} zł</span></div></div>`; }).join(''); 
        
        let sortedIncCats = Object.keys(incCats).sort((a,b) => incCats[b] - incCats[a]);
        let incLabels = sortedIncCats; let incData = sortedIncCats.map(k => incCats[k]); let incColors = sortedIncCats.map(k => C_INC[k] ? C_INC[k].c : '#22c55e');
        let incListHtml = sortedIncCats.map((lbl, idx) => { let val = incData[idx]; let pct = sumInc > 0 ? ((val / sumInc) * 100).toFixed(0) : 0; let color = incColors[idx]; let icon = C_INC[lbl] ? C_INC[lbl].i : '💰'; return `<div class="cat-list-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><div style="display:flex; align-items:center;"><div style="width:30px; height:30px; border-radius:50%; background:${color}22; display:flex; align-items:center; justify-content:center; margin-right:12px; font-size:1rem; border:1px solid ${color}55;">${icon}</div><span style="font-weight:bold;">${lbl}</span></div><div style="display:flex; align-items:center;"><span style="color:var(--muted);font-size:0.8rem;margin-right:10px;">${pct}%</span><span style="color:${color};font-weight:bold;">+${val.toFixed(2)} zł</span></div></div>`; }).join(''); 

        let bilans = sumInc - sumExp; 
        
        APP.innerHTML = hdr + `<div class="dash-hero" style="padding-bottom:10px;"><p>BILANS W TYM MIESIĄCU</p><h1 style="color:${bilans >= 0 ? 'var(--success)' : 'var(--danger)'}; font-size:3.5rem;">${bilans > 0 ? '+' : ''}${bilans.toFixed(2)} zł</h1></div><div class="grid-2" style="padding: 0 15px; margin-bottom: 20px;"><div class="box" style="border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05);"><span style="color:var(--success)">Przychody</span><strong style="color:#fff">${sumInc.toFixed(2)} zł</strong></div><div class="box" style="border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.05);"><span style="color:var(--danger)">Wydatki</span><strong style="color:#fff">-${sumExp.toFixed(2)} zł</strong></div></div><div class="panel" style="margin-bottom:20px; border-color:var(--info);"><div class="p-title" style="color:var(--info); margin-bottom:10px;">Podział Wydatków</div><div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="color:var(--muted); font-size:0.8rem; font-weight:bold;">Stałe opłaty: <span style="color:#f59e0b">${sumFixed.toFixed(2)} zł</span></span><span style="color:var(--muted); font-size:0.8rem; font-weight:bold;">Zmienne: <span style="color:#0ea5e9">${sumVar.toFixed(2)} zł</span></span></div><div style="width:100%; height:12px; background:rgba(255,255,255,0.1); border-radius:6px; overflow:hidden; display:flex;"><div style="width:${sumExp > 0 ? (sumFixed/sumExp)*100 : 0}%; background:#f59e0b; height:100%;"></div><div style="width:${sumExp > 0 ? (sumVar/sumExp)*100 : 0}%; background:#0ea5e9; height:100%;"></div></div><p style="font-size:0.7rem; color:var(--muted); text-align:center; margin-top:10px;">Opłaty stałe stanowią ${(sumExp > 0 ? (sumFixed/sumExp)*100 : 0).toFixed(0)}% Twoich wydatków.</p></div>
        <div class="panel" style="padding: 20px; border-color:rgba(34, 197, 94, 0.4);"><div class="p-title" style="color:var(--success)">Struktura Przychodów</div><div style="height:200px; position:relative; margin-bottom:20px;"><canvas id="h-chart-inc"></canvas>${sumInc === 0 ? '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:var(--muted); font-size:0.9rem;">Brak danych</div>' : ''}</div><div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">${incListHtml || '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px;">Brak wpływów w tym miesiącu.</div>'}</div></div>
        <div class="panel" style="padding: 20px; border-color:rgba(239, 68, 68, 0.4);"><div class="p-title" style="color:var(--danger)">Struktura Kosztów Zmiennych</div><div style="height:250px; position:relative; margin-bottom:20px;"><canvas id="h-chart"></canvas>${sumExp === 0 ? '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:var(--muted); font-size:0.9rem;">Brak danych</div>' : ''}</div><div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">${catListHtml || '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px;">Brak wydatków w tym miesiącu.</div>'}</div></div>` + nav; 
        if(sumExp > 0) { setTimeout(() => { if(window.hCh) window.hCh.destroy(); let ctx = document.getElementById('h-chart').getContext('2d'); window.hCh = new Chart(ctx, { type: 'doughnut', data: { labels: cLabels, datasets: [{ data: cData, backgroundColor: cColors, borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%', layout: {padding: 10} } }); }, 100); } 
        if(sumInc > 0) { setTimeout(() => { if(window.hChInc) window.hChInc.destroy(); let ctx2 = document.getElementById('h-chart-inc').getContext('2d'); window.hChInc = new Chart(ctx2, { type: 'doughnut', data: { labels: incLabels, datasets: [{ data: incData, backgroundColor: incColors, borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%', layout: {padding: 10} } }); }, 100); } 
    } 
    
    if(t === 'cal') { 
        let isPlannedMode = window.hCalMode === 'planned';
        let switchHtml = `<div class="mode-switch" style="margin: 15px 15px 5px 15px;"><div class="m-btn ${!isPlannedMode?'active':''}" style="${!isPlannedMode?'background:var(--success);color:#000;':''}" onclick="window.hCalMode='history'; window.render()">📅 Zrealizowane</div><div class="m-btn ${isPlannedMode?'active':''}" style="${isPlannedMode?'background:var(--warning);color:#000;':''}" onclick="window.hCalMode='planned'; window.render()">⏳ Planowane</div></div>`;
        let filteredTrans = h.trans.filter(x => isPlannedMode ? x.isPlanned : !x.isPlanned);
        if(window.hHistFilter === 'inc') filteredTrans = filteredTrans.filter(x => x.type === 'inc');
        if(window.hHistFilter === 'exp') filteredTrans = filteredTrans.filter(x => x.type === 'exp');
        let monthlySummaryHtml = '';
        if(isPlannedMode && filteredTrans.length > 0) {
            let mTotals = {}; filteredTrans.forEach(x => { let dObj = new Date(x.rD); let mKey = dObj.toLocaleDateString('pl-PL', {month:'long', year:'numeric'}).toUpperCase(); if(!mTotals[mKey]) mTotals[mKey] = {exp:0, inc:0}; if(x.type === 'exp') mTotals[mKey].exp += x.v; if(x.type === 'inc') mTotals[mKey].inc += x.v; });
            monthlySummaryHtml = `<div style="padding:0 15px;">` + Object.keys(mTotals).map(k => `<div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); padding:12px; border-radius:12px; margin-bottom:15px; text-align:center;"><div style="color:var(--warning); font-size:0.9rem; font-weight:900; letter-spacing:1px; margin-bottom:8px;">${k}</div><div style="display:flex; justify-content:space-around;"><div><span style="font-size:0.7rem; color:var(--muted)">Do wydania</span><br><strong style="color:var(--danger); font-size:1.1rem;">-${mTotals[k].exp.toFixed(2)} zł</strong></div><div style="border-left:1px solid rgba(245,158,11,0.2); padding-left:15px;"><span style="font-size:0.7rem; color:var(--muted)">Spodziewany wpływ</span><br><strong style="color:var(--success); font-size:1.1rem;">+${mTotals[k].inc.toFixed(2)} zł</strong></div></div></div>`).join('') + `</div>`;
        }
        let groups = {}; filteredTrans.sort((a,b) => isPlannedMode ? new Date(a.rD) - new Date(b.rD) : new Date(b.rD) - new Date(a.rD)).forEach(x => { if(!groups[x.dt]) groups[x.dt] = []; groups[x.dt].push(x); }); 
        let calHtml = Object.keys(groups).map(date => { 
            let dayTrans = groups[date]; let dayExp = dayTrans.filter(x=>x.type==='exp').reduce((a,b)=>a+b.v, 0); let dayInc = dayTrans.filter(x=>x.type==='inc').reduce((a,b)=>a+b.v, 0); 
            let itemsHtml = dayTrans.map(x => { 
                let isExp = x.type === 'exp'; let isTrans = x.type === 'transfer'; let cd = isExp ? (C_EXP[x.cat] || {c:'#ef4444',i:'💸'}) : (isTrans ? {c:'#8b5cf6',i:'🔄'} : (C_INC[x.cat] || {c:'#22c55e',i:'💵'})); 
                let accName = isTrans ? `${h.accs.find(a=>a.id===x.fromAcc)?.n} -> ${h.accs.find(a=>a.id===x.toAcc)?.n}` : (h.accs.find(a=>a.id===x.acc)?.n || 'Konto'); 
                let catName = isTrans ? 'Przelew' : x.cat; let planLbl = x.isPlanned ? `<span style="color:var(--warning); font-size:0.6rem; margin-left:5px;">(PLAN)</span>` : ''; 
                
                let payBtn = (x.isPlanned && x.loanId) ? `<button style="background:rgba(34,197,94,0.2); color:var(--success); border:1px solid var(--success); border-radius:8px; padding:6px 12px; font-size:0.75rem; font-weight:bold; cursor:pointer; width:100%; margin-top:8px;" onclick="window.hPayLoanInstallment('${x.id}')">💸 OPŁAĆ RATĘ TERAZ</button>` : '';

                return `<div style="display:flex; flex-direction:column; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.03); opacity:${x.isPlanned?'0.7':'1'};"><div style="display:flex; justify-content:space-between; align-items:center; width:100%;"><div style="display:flex; align-items:center; gap:12px; flex:1;"><div style="width:35px; height:35px; border-radius:50%; background:${cd.c}22; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0;">${cd.i}</div><div><span style="color:#fff; font-size:0.95rem; font-weight:600; display:flex; align-items:center; flex-wrap:wrap;">${catName}${planLbl}</span><small style="color:var(--muted); font-size:0.7rem; display:block; margin-top:2px;">${accName} ${x.d ? '• '+x.d : ''}</small></div></div><div style="text-align:right;"><strong style="color:${isExp?'var(--danger)':(isTrans?'#fff':'var(--success)')}; white-space:nowrap;">${isExp?'-':(isTrans?'':'+')}${x.v.toFixed(2)} zł</strong><div style="display:flex; gap:5px; margin-top:5px; justify-content:flex-end;"><button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.hEditTrans('${x.id}')">✏️</button><button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.hDelTrans('${x.id}')">🗑️</button></div></div></div>${payBtn}</div>`; 
            }).join(''); 
            return `<div class="date-group" style="margin-top:20px; display:flex; justify-content:space-between; font-weight:bold; font-size:0.85rem; color:var(--muted); text-transform:uppercase; padding:0 10px;"><span>${date}</span> <span><span style="color:var(--success)">+${dayInc.toFixed(0)}</span> / <span style="color:var(--danger)">-${dayExp.toFixed(0)}</span></span></div><div class="panel" style="margin-top:5px; padding:5px 15px; border-radius:12px;">${itemsHtml}</div>`; 
        }).join(''); 
        let filterButtons = `<div style="display:flex; gap:10px; padding: 10px 15px 15px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:10px;"><button onclick="window.hHistFilter='all'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:${window.hHistFilter==='all'?'rgba(255,255,255,0.1)':'transparent'}; color:#fff; font-size:0.8rem;">Wszystko</button><button onclick="window.hHistFilter='inc'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--success); background:${window.hHistFilter==='inc'?'rgba(34,197,94,0.1)':'transparent'}; color:var(--success); font-size:0.8rem;">Wpływy</button><button onclick="window.hHistFilter='exp'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--danger); background:${window.hHistFilter==='exp'?'rgba(239,68,68,0.1)':'transparent'}; color:var(--danger); font-size:0.8rem;">Wydatki</button></div>`;
        APP.innerHTML = hdr + `<div class="dash-hero" style="padding-bottom:0;"><p>HISTORIA I ZAPLANOWANE</p></div>${switchHtml}${filterButtons}${monthlySummaryHtml}<div style="padding:0 15px 30px;">${calHtml || '<div style="text-align:center; color:var(--muted); padding:30px;">Brak danych w tym widoku.</div>'}</div>` + nav; 
    }
    
    if(t === 'set') { let catSrcSet = window.hRecType === 'exp' ? C_EXP : C_INC; if(!catSrcSet[window.hRecCat]) window.hRecCat = Object.keys(catSrcSet)[0]; let accOptionsSet = h.accs.map(a => `<option value="${a.id}">${a.n}</option>`).join(''); APP.innerHTML = hdr + `<div class="dash-hero" style="padding-bottom:10px;"><p>USTAWIENIA BUDŻETU</p></div><div class="section-lbl" style="color:var(--info); border-color:var(--info);">⚙️ Automatyzacja (Stałe Koszty i Wpływy)</div><div class="panel" style="border-color:var(--info);"><p style="font-size:0.75rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Dodaj tu rachunki lub wpływy, a system sam doda je wybranego dnia każdego miesiąca!</p><div class="mode-switch" style="background:rgba(0,0,0,0.5); margin-bottom:15px;"><div class="m-btn ${window.hRecType==='exp'?'active':''}" style="${window.hRecType==='exp'?'background:var(--danger);color:#fff;':''}" onclick="window.hRecType='exp';window.render()">WYDATEK</div><div class="m-btn ${window.hRecType==='inc'?'active':''}" style="${window.hRecType==='inc'?'background:var(--success);color:#fff;':''}" onclick="window.hRecType='inc';window.render()">WPŁYW</div></div><div class="inp-row"><div class="inp-group"><label>Nazwa</label><input type="text" id="hr-name" placeholder="np. Czynsz" style="background:#000;"></div><div class="inp-group"><label>Kwota</label><input type="number" id="hr-val" placeholder="np. 2000" style="background:#000;"></div></div><div class="inp-row" style="margin-bottom:10px;"><div class="inp-group" style="flex:2;"><label>Kategoria</label><select onchange="window.hRecCat=this.value" style="background:#000;">${Object.keys(catSrcSet).map(k => `<option value="${k}" ${window.hRecCat===k?'selected':''}>${k}</option>`).join('')}</select></div><div class="inp-group" style="flex:1;"><label>Dzień m-ca</label><input type="number" id="hr-day" value="1" min="1" max="31" placeholder="1-31" style="background:#000;"></div></div><div class="inp-group" style="margin-bottom:15px;"><label>Konto docelowe</label><select id="hr-acc" onchange="window.hRecAcc=this.value" style="background:#000;">${accOptionsSet}</select></div><button class="btn" style="background:var(--info); color:#fff; padding:15px; margin-bottom:20px;" onclick="window.hAddRecurring()">DODAJ DO AUTOMATU</button><div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;"><span style="font-size:0.75rem; color:var(--muted); font-weight:bold; text-transform:uppercase; margin-bottom:10px; display:block;">Twoje automaty (${h.recurring.length}):</span>${h.recurring.map(r => `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid ${r.t === 'exp' ? 'var(--danger)' : 'var(--success)'};"><div><strong style="color:#fff; font-size:1rem;">${r.n}</strong><span style="font-size:0.7rem; color:var(--muted); display:block;">${r.c} <strong style="color:#fff;">(Dzień: ${r.day||1})</strong></span></div><div style="display:flex; align-items:center; gap:15px;"><strong style="color:${r.t === 'exp' ? 'var(--danger)' : 'var(--success)'};">${r.v.toFixed(0)} zł</strong><button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:6px 10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.hDelRecurring(${r.id})">USUŃ</button></div></div>`).join('') || '<div style="color:var(--muted); font-size:0.8rem;">Brak skonfigurowanych automatów.</div>'}</div></div><div class="section-lbl" style="color:var(--life); border-color:var(--life);">👥 Członkowie Rodziny</div><div class="panel" style="border-color:rgba(20,184,166,0.3);"><div class="inp-row"><div class="inp-group"><input type="text" id="h-new-mem" placeholder="Nowy domownik"></div><button class="btn btn-home" style="width:auto; margin-top:0; padding: 0 20px;" onclick="window.hAddMem()">DODAJ</button></div><div style="margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">${h.members.map(m => `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--life);"><strong style="color:#fff; font-size:1.1rem;">${m}</strong>${h.members.length > 1 ? `<button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.hDelMem('${m}')">USUŃ</button>` : `<span style="color:var(--muted); font-size:0.75rem;">(Główny)</span>`}</div>`).join('')}</div></div><div class="section-lbl" style="color:var(--plan); border-color:var(--plan);">🎯 Limity i Cele miesięczne</div><div class="panel" style="border-color:var(--plan);"><div class="inp-group" style="margin-bottom:12px;"><label>Wybierz Kategorię do limitu</label><select id="hb-cat">${Object.keys(C_EXP).map(k=>`<option value="${k}">${k}</option>`).join('')}</select></div><div class="inp-row"><div class="inp-group"><label>Miesięczny Limit (zł)</label><input type="number" id="hb-val" placeholder="np. 500"></div></div><button class="btn" style="background:var(--plan); color:#fff; padding:15px;" onclick="window.hSetBudget()">USTAW LIMIT KATEGORII</button><div style="margin-top:20px;">${Object.keys(h.budgets || {}).map(k => { let limit = h.budgets[k]; let spent = 0; let now = new Date(); h.trans.forEach(x => { if(!x.isPlanned && x.type==='exp' && x.cat===k && new Date(x.rD).getMonth()===now.getMonth()) spent += x.v; }); let pct = Math.min((spent / limit) * 100, 100); let color = pct > 90 ? 'var(--danger)' : (pct > 70 ? 'var(--warning)' : 'var(--success)'); return `<div style="margin-bottom:15px;"><div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:5px;"><span>${k}</span><span style="color:${color}">Wydano: ${spent.toFixed(0)} / ${limit} zł</span></div><div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;"><div style="width:${pct}%; background:${color}; height:100%;"></div></div></div>`; }).join('')}</div></div>
    
    <div class="section-lbl" style="color:#ffdd00; border-color:#ffdd00; margin-top:30px;">☕ Wsparcie projektu StyreOS</div>
    <div class="panel" style="border-color:rgba(255, 221, 0, 0.4); background: linear-gradient(145deg, #1a1a00, #09090b); text-align:center; padding:20px;">
        <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">
            Podoba Ci się StyreOS? Twoje wsparcie pomaga mi opłacać serwery map i rozwijać nowe funkcje dla kierowców i rodzin. Każda "kawa" ma znaczenie!
        </p>
        <a href="https://buycoffee.to/styreos" target="_blank" style="background:#ffdd00; color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:15px; border-radius:12px; box-shadow: 0 4px 15px rgba(255, 221, 0, 0.2);">
            <span style="font-size:1.5rem;">☕</span> POSTAW MI KAWĘ
        </a>
    </div>

    <div class="section-lbl" style="color:var(--danger); border-color:var(--danger);">⚠️ Strefa Niebezpieczna</div><div class="panel" style="border-color:rgba(239,68,68,0.4)"><button class="btn btn-danger" style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; box-shadow:none;" onclick="window.hardReset()">TWARDY RESET APLIKACJI</button></div>` + nav; } 
}
