// ==========================================
// PLIK: home_views.js - Renderowanie zakładek Budżetu Domowego
// ==========================================

window.rHome = function() {
    let h = window.db.home; 
    let t = window.db.tab; 
    
    if(!window.hMem) window.hMem = h.members[0] || window.db.userName;
    let needsSave = false; 
    let today = window.getLocalYMD();
    
    h.trans.forEach(x => { 
        if(x.isPlanned && !x.loanId && !x.recId && !x.debtId && x.rD.split('T')[0] <= today) { 
            x.isPlanned = false; 
            needsSave = true; 
        } 
    });
    
    h.loans.forEach(l => { 
        if(l.kapital === undefined) { 
            l.kapital = parseFloat(l.left) || 0; 
        } 
    });
    
    if(needsSave) { window.save(); }

    let nav = `
    <div class="nav">
        <div class="nav-item ${t==='dash'?'act-home':''}" onclick="window.switchTab('dash')"><i>🏠</i>Przegląd</div>
        <div class="nav-item ${t==='goals'?'act-home':''}" onclick="window.switchTab('goals')"><i>🏦</i>Zobowiązania</div>
        <div class="nav-item" style="transform:translateY(-15px);">
            <div style="background:var(--life); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto; box-shadow:0 5px 15px rgba(20,184,166,0.4); color:#000; font-size:1.8rem;" onclick="window.switchTab('add')">+</div>
        </div>
        <div class="nav-item ${t==='stats'?'act-home':''}" onclick="window.switchTab('stats')"><i>📊</i>Wykresy</div>
        <div class="nav-item ${t==='cal'?'act-home':''}" onclick="window.hCalMode='history'; window.switchTab('cal')"><i>📅</i>Historia</div>
    </div>`;

    let hdr = `
    <header>
        <button class="logo" onclick="window.openSwitcher()">S</button>
        <div class="header-actions" style="display:flex; gap:10px;">
            <div class="settings-btn" style="background:transparent; border:none; padding:0; display:flex; flex-direction:column; align-items:center;" onclick="window.switchTab('acc')">
                <span style="font-size:1.3rem; line-height:1;">💳</span><span style="font-size:0.5rem; font-weight:900; color:var(--muted); text-transform:uppercase;">Konta</span>
            </div>
            <div class="settings-btn" style="background:transparent; border:none; padding:0; display:flex; flex-direction:column; align-items:center;" onclick="window.switchTab('set')">
                <span style="font-size:1.3rem; line-height:1;">⚙️</span><span style="font-size:0.5rem; font-weight:900; color:var(--muted); text-transform:uppercase;">Opcje</span>
            </div>
        </div>
    </header>`;

    let balances = window.hGetBal(); 
    let globalBalance = Object.values(balances).reduce((a,b) => a+b, 0);
    let now = new Date(); 
    let currExp = 0; 
    let currInc = 0; 
    let plannedSum = 0; 
    let dashCats = {};
    
    h.trans.forEach(x => {
        let d = new Date(x.rD); 
        let v = parseFloat(x.v) || 0;
        if(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            if(!x.isPlanned) { 
                if(x.type === 'exp') { 
                    currExp += v; 
                    dashCats[x.cat] = (dashCats[x.cat] || 0) + v; 
                }
                if(x.type === 'inc') currInc += v; 
            } else if (x.type === 'exp') { 
                plannedSum += v; 
            }
        }
    });

    // ==========================================
    // ZAKŁADKA: DASHBOARD (PRZEGLĄD)
    // ==========================================
    if(t === 'dash') {
        let topCatName = Object.keys(dashCats).sort((a,b) => dashCats[b] - dashCats[a])[0];
        let insightsHtml = '';
        if (currExp > 0) { 
            insightsHtml = `
            <div style="background:rgba(139, 92, 246, 0.1); border:1px solid rgba(139, 92, 246, 0.3); padding:12px; border-radius:12px; margin: 15px 15px 0; text-align:left; display:flex; gap:12px; align-items:center; cursor:pointer;" onclick="window.switchTab('stats')">
                <div style="font-size:1.8rem;">💡</div>
                <div>
                    <strong style="color:var(--info); font-size:0.85rem; display:block;">Asystent StyreOS</strong>
                    <span style="color:var(--muted); font-size:0.75rem;">${topCatName ? `Najwięcej w tym miesiącu wydajesz na: <strong style="color:#fff">${topCatName}</strong>. Trzymaj się limitów!` : 'Twoje finanse wyglądają stabilnie w tym miesiącu.'}</span>
                </div>
            </div>`; 
        }
        
        let miniPiggyHtml = '';
        if (window.db.home.piggy && window.db.home.piggy.length > 0) { 
            let p = window.db.home.piggy[0]; 
            let pct = p.target > 0 ? (p.saved / p.target) * 100 : 0; 
            if(pct > 100) pct = 100; 
            miniPiggyHtml = `
            <div style="margin: 15px 15px 0; padding:12px; background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.2); border-radius:12px; cursor:pointer;" onclick="window.switchTab('goals')">
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:5px;">
                    <span style="color:var(--muted);">Zbierasz na: <strong style="color:#fff;">${p.n}</strong></span>
                    <span style="color:var(--success); font-weight:bold;">${Number(pct || 0).toFixed(0)}%</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                    <div style="width:${pct}%; background:var(--success); height:100%;"></div>
                </div>
            </div>`; 
        }

        let upcoming = window.db.home.trans.filter(x => x.isPlanned && x.type === 'exp').sort((a,b) => new Date(a.rD) - new Date(b.rD)).slice(0,3);
        let upcomingHtml = '';
        if(upcoming.length > 0) {
            upcomingHtml = `
            <div class="panel" style="margin:15px 15px 0; border-color:var(--warning); padding:15px;">
                <div class="p-title" style="color:var(--warning); margin-bottom:10px; font-size:0.85rem; text-transform:uppercase;">📅 Nadchodzące płatności</div>` + 
                upcoming.map(x => {
                    let targetTab = `window.hCalMode='planned'; window.switchTab('cal')`;
                    if(x.loanId) {
                        let ln = window.db.home.loans.find(l => l.id == x.loanId);
                        if(ln && ln.type === 'Karta') targetTab = `window.switchTab('acc')`;
                        else targetTab = `window.switchTab('goals')`;
                    } else if (x.debtId || x.piggyId) { 
                        targetTab = `window.switchTab('goals')`; 
                    }
                    return `<div onclick="${targetTab}" style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px; cursor:pointer;"><span style="color:#fff; font-size:0.85rem;">${x.d || x.cat} <span style="color:var(--muted); font-size:0.7rem;">(${x.dt})</span></span><strong style="color:var(--danger);">${Number(x.v || 0).toFixed(2)} zł</strong></div>`;
                }).join('') + `</div>`;
        }

        let dashRecentTrans = [...h.trans].filter(x => !x.isPlanned).sort((a,b) => new Date(b.rD) - new Date(a.rD)).slice(0,8).map(x => { 
            let v = parseFloat(x.v) || 0; 
            let isExp = x.type === 'exp'; 
            let isTrans = x.type === 'transfer'; 
            let cd = isExp ? (C_EXP[x.cat] || {c:'#ef4444',i:'💸'}) : (isTrans ? {c:'#8b5cf6',i:'🔄'} : (C_INC[x.cat] || {c:'#22c55e',i:'💵'})); 
            let accName = isTrans ? `Z ${h.accs.find(a=>a.id===x.fromAcc)?.n || 'Konta'} na ${h.accs.find(a=>a.id===x.toAcc)?.n || 'Konto'}` : (h.accs.find(a=>a.id===x.acc)?.n || 'Konto'); 
            let catName = isTrans ? 'Przelew' : x.cat; 
            let sign = isExp ? '-' : (isTrans ? '' : '+'); 
            let color = isExp ? 'var(--danger)' : (isTrans ? '#fff' : 'var(--success)'); 
            return `
            <div class="log-item" onclick="window.hCalMode='history'; window.switchTab('cal')" style="border:none; border-bottom:1px solid rgba(255,255,255,0.05); border-radius:0; margin-bottom:0; background:transparent; padding:15px 5px; flex-direction:column; align-items:stretch; cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    <div style="display:flex; align-items:center; gap:15px; flex:1;">
                        <div style="width:45px; height:45px; border-radius:50%; background:${cd.c}22; border:1px solid ${cd.c}55; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">${cd.i}</div>
                        <div><strong style="font-size:0.95rem; color:#fff; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${catName}</strong><small style="color:var(--muted); display:block; margin-top:4px;">${accName} • ${x.dt}</small></div>
                    </div>
                    <div style="text-align:right;"><strong style="color:${color}; font-size:1.1rem; white-space:nowrap;">${sign}${Number(v || 0).toFixed(2)} zł</strong></div>
                </div>
            </div>`; 
        }).join('');

        let safeBalance = globalBalance - plannedSum;
        
        APP.innerHTML = hdr + `
        <div style="background: linear-gradient(180deg, rgba(20,184,166,0.15) 0%, var(--bg) 100%); padding: 30px 20px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius:30px; border-bottom-right-radius:30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <p style="margin:0 0 5px 0; font-size:0.8rem; color:var(--muted); text-transform:uppercase; font-weight:bold; letter-spacing:1px;">Bezpieczne Saldo Netto</p>
            <h1 style="margin:0; font-size:3.8rem; font-weight:900; color:${safeBalance >= 0 ? '#fff' : 'var(--danger)'}; letter-spacing:-1.5px;">${Number(safeBalance || 0).toFixed(2)} zł</h1>
            
            <div style="margin-top:15px; display:flex; justify-content:space-between; font-size:0.75rem; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); padding:10px 15px; border-radius:12px;">
                <div style="text-align:left; cursor:pointer;" onclick="window.switchTab('acc')">
                    <span style="color:var(--muted)">Suma portfeli:</span><br>
                    <strong style="color:#fff; font-size:0.9rem;">${Number(globalBalance || 0).toFixed(2)} zł</strong>
                </div>
                <div style="text-align:right; cursor:pointer;" onclick="window.hCalMode='planned'; window.switchTab('cal')">
                    <span style="color:var(--muted)">Zarezerwowane:</span><br>
                    <strong style="color:var(--warning); font-size:0.9rem;">-${Number(plannedSum || 0).toFixed(2)} zł</strong>
                </div>
            </div>

            <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
                <div style="flex:1; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:12px; padding:10px;">
                    <div style="color:var(--success); font-weight:bold; margin-bottom:8px; font-size:1.1rem;">+${Number(currInc || 0).toFixed(0)} zł</div>
                    <button class="btn btn-success" style="padding:8px; font-size:0.75rem; margin-top:0; width:100%; box-shadow:none;" onclick="window.hTransType='inc'; window.switchTab('add')">💰 WPŁYW</button>
                </div>
                <div style="flex:1; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:12px; padding:10px;">
                    <div style="color:var(--danger); font-weight:bold; margin-bottom:8px; font-size:1.1rem;">-${Number(currExp || 0).toFixed(0)} zł</div>
                    <button class="btn btn-danger" style="padding:8px; font-size:0.75rem; margin-top:0; width:100%; box-shadow:none;" onclick="window.hTransType='exp'; window.switchTab('add')">💸 WYDATEK</button>
                </div>
            </div>
        </div>
        ${insightsHtml}
        ${upcomingHtml}
        ${miniPiggyHtml}
        <div class="section-lbl" style="color:#fff; border-color:rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; margin-top:20px;">Ostatnie operacje</div>
        <div style="padding: 0 15px 30px;">
            ${dashRecentTrans || '<div style="text-align:center;color:var(--muted);padding:20px 0; font-size:0.8rem;">Brak operacji.</div>'}
        </div>
        ` + nav;
    }

    // ==========================================
    // ZAKŁADKA: CELE / KREDYTY (GOALS)
    // ==========================================
    if(t === 'goals') {
        let activeLoans = window.db.home.loans.filter(l => !l.isClosed && l.type !== 'Karta');
        let isCompact = window.hForceCompact !== undefined ? window.hForceCompact : (activeLoans.length > 1);
        
        let toggleHtml = activeLoans.length > 0 ? 
            `<div style="display:flex; justify-content:flex-end; padding:0 15px 10px;">
                <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; display:flex; padding:3px;">
                    <button onclick="window.hForceCompact=false; window.render()" style="background:${!isCompact?'rgba(255,255,255,0.1)':'transparent'}; color:${!isCompact?'#fff':'var(--muted)'}; border:none; padding:5px 10px; border-radius:6px; font-size:0.7rem; cursor:pointer;">Szczegóły</button>
                    <button onclick="window.hForceCompact=true; window.render()" style="background:${isCompact?'rgba(255,255,255,0.1)':'transparent'}; color:${isCompact?'#fff':'var(--muted)'}; border:none; padding:5px 10px; border-radius:6px; font-size:0.7rem; cursor:pointer;">Kompakt</button>
                </div>
            </div>` : '';

        let totalDebt = 0; 
        let totalRata = 0; 
        let maxMonths = 0;
        
        activeLoans.forEach(l => { 
            totalDebt += (parseFloat(l.kapital) || parseFloat(l.left) || 0); 
            totalRata += (parseFloat(l.rata) || 0); 
            let m = parseInt(l.installmentsLeft) || 0; 
            if(m > maxMonths) maxMonths = m; 
        });
        
        let freedomDate = new Date(); 
        freedomDate.setMonth(freedomDate.getMonth() + maxMonths);
        let freedomStr = maxMonths > 0 ? freedomDate.toLocaleDateString('pl-PL', {month:'long', year:'numeric'}) : 'Teraz!';
        
        let debtSummaryHtml = activeLoans.length > 0 ? `
            <div style="background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.3); border-radius:16px; padding:15px; margin: 0 15px 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div>
                        <span style="font-size:0.7rem; color:var(--danger); text-transform:uppercase;">Zadłużenie Kredytowe</span><br>
                        <strong style="color:var(--danger); font-size:1.5rem;">${Number(totalDebt || 0).toFixed(2)} zł</strong>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:0.7rem; color:var(--danger); text-transform:uppercase;">Miesięczne raty</span><br>
                        <strong style="color:#fff; font-size:1.2rem;">${Number(totalRata || 0).toFixed(2)} zł</strong>
                    </div>
                </div>
                <div style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:8px; padding:10px; display:flex; align-items:center; gap:10px;">
                    <div style="font-size:1.5rem;">🕊️</div>
                    <div>
                        <span style="font-size:0.7rem; color:var(--success); text-transform:uppercase;">Wolność finansowa</span><br>
                        <strong style="color:#fff; font-size:0.9rem;">Wolny od rat bankowych: <span style="color:var(--success)">${freedomStr}</span></strong>
                    </div>
                </div>
            </div>` : '';
        
        let proOptBtn = activeLoans.length > 0 ? `
            <button class="btn" style="background:rgba(139, 92, 246, 0.15); color:#a855f7; border:1px dashed rgba(139, 92, 246, 0.4); border-radius:12px; font-weight:bold; padding:12px; margin:0 15px 20px; width:calc(100% - 30px); display:flex; align-items:center; justify-content:center; gap:10px;" onclick="window.sysAlert('Funkcja PRO', 'Optymalizator Kredytów AI: Wkrótce wersja PRO podpowie, który kredyt nadpłacać najpierw, by oszczędzić tysiące złotych na odsetkach! 🤖💸', 'info')">
                <span style="font-size:1.1rem;">🧠</span> OPTYMALIZATOR KREDYTÓW (Wkrótce PRO)
            </button>` : '';

        let oweMe = 0; 
        let iOwe = 0;
        h.debts.filter(d => !d.isClosed).forEach(d => { 
            if(d.type === 'they_owe') oweMe += parseFloat(d.amount) || 0; 
            if(d.type === 'i_owe') iOwe += parseFloat(d.amount) || 0; 
        });
        
        let netDebt = oweMe - iOwe; 
        let netColor = netDebt >= 0 ? 'var(--success)' : 'var(--danger)'; 
        let netText = netDebt >= 0 ? `Plus: ${Number(netDebt || 0).toFixed(2)} zł` : `Minus: ${Math.abs(netDebt || 0).toFixed(2)} zł`;
        
        let notebookSummary = (oweMe > 0 || iOwe > 0) ? `
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:15px; background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
                <div style="color:var(--success)">Ktoś Ci wisi:<br><strong>${Number(oweMe || 0).toFixed(2)} zł</strong></div>
                <div style="text-align:center; color:${netColor}">Bilans:<br><strong>${netText}</strong></div>
                <div style="text-align:right; color:var(--danger)">Ty wiszisz:<br><strong>${Number(iOwe || 0).toFixed(2)} zł</strong></div>
            </div>` : '';

        let loansHtml = '';
        let hideScrollStyle = `<style>.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }</style>`;

        if (activeLoans.length === 0) { 
            loansHtml = '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px 0 30px;">Brak zobowiązań kredytowych. Ciesz się wolnością! 🕊️</div>'; 
        } else {
            let mappedLoans = activeLoans.map(l => {
                let kap = parseFloat(l.kapital); 
                if(isNaN(kap)) kap = parseFloat(l.left) || 0; 
                let bor = parseFloat(l.borrowed); 
                if(isNaN(bor)) bor = parseFloat(l.total) || 0; 
                
                let rat = parseFloat(l.rata) || 0; 
                let instL = parseInt(l.installmentsLeft) || 0; 
                let totInst = parseInt(l.totalInst) || 0; 
                let pctBank = parseFloat(l.pct) || 0; 
                
                let totalCostRemaining = rat * instL; 
                let savings = totalCostRemaining - kap; 
                let isError = totalCostRemaining < kap; 
                let errorHtml = isError ? `<div style="background:rgba(239,68,68,0.15); color:var(--danger); padding:8px; border-radius:8px; font-size:0.75rem; margin-top:10px; margin-bottom:10px; border:1px solid rgba(239,68,68,0.3); text-align:center;">⚠️ Błąd: Suma rat mniejsza niż kapitał!</div>` : ''; 
                
                let pct = totInst > 0 ? ((totInst - instL) / totInst) * 100 : 0; 
                if(pct > 100) pct = 100; if(pct < 0) pct = 0; 
                
                let paidKap = bor - kap; 
                if(paidKap < 0) paidKap = 0; 
                let paidPctKap = bor > 0 ? (paidKap / bor) * 100 : 0; 
                
                let today = new Date(); 
                let nextD = new Date(today.getFullYear(), today.getMonth(), l.day || 10); 
                if(today.getDate() > (l.day || 10)) nextD.setMonth(nextD.getMonth() + 1); 
                let nextDateStr = nextD.toLocaleDateString('pl-PL', {day:'2-digit', month:'2-digit', year:'numeric'});
                
                let detailsGrid = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.05); text-align:left;">
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">🗓️ Najbliższa rata</span><br><strong style="color:#fff; font-size:0.85rem;">${nextDateStr}</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">📊 Oprocentowanie</span><br><strong style="color:#fff; font-size:0.85rem;">${Number(pctBank || 0).toFixed(2)}% (${l.intType||'Stałe'})</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">📉 Typ rat</span><br><strong style="color:#fff; font-size:0.85rem;">${l.instType||'Równe'}</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">🏦 Kwota z umowy</span><br><strong style="color:#fff; font-size:0.85rem;">${Number(bor || 0).toFixed(2)} zł</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; grid-column: span 2;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">✅ Spłacony Kapitał</span><strong style="color:var(--success); font-size:0.85rem;">${Number(paidKap || 0).toFixed(2)} zł (${Number(paidPctKap || 0).toFixed(1)}%)</strong></div>
                        <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px;"><div style="width:${paidPctKap}%; background:var(--success); height:100%;"></div></div>
                    </div>
                    <div style="background:rgba(239,68,68,0.05); padding:10px; border-radius:10px; grid-column: span 2; border:1px solid rgba(239,68,68,0.2);">
                        <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:0.7rem; color:var(--danger); text-transform:uppercase; font-weight:bold;">Całkowity Koszt do końca</span><strong style="color:var(--danger); font-size:1rem;">${Number(totalCostRemaining || 0).toFixed(2)} zł</strong></div>
                    </div>
                </div>`;

                if(!isCompact) {
                    let savingsHtml = (!isError && savings > 0) ? `<div style="font-size:0.75rem; color:var(--success); margin-top:5px; font-weight:bold; text-align:center;">Spłacając dziś, unikasz ${Number(savings || 0).toFixed(2)} zł odsetek! 💸</div>` : '';
                    return `
                    <div class="panel" style="flex: 0 0 85%; min-width: 280px; max-width: 320px; scroll-snap-align: center; padding:0; border:1px solid #27272a; border-radius:24px; overflow:hidden; margin-bottom:0; background:#18181b;">
                        <div style="padding:20px 20px 10px; text-align:center; position:relative;">
                            <div style="position:absolute; right:15px; top:15px; display:flex; gap:5px;">
                                <button style="background:transparent; border:none; color:var(--muted); font-size:1.2rem; cursor:pointer;" onclick="window.hOpenLoanModal('${l.id}')">✏️</button>
                                <button style="background:transparent; border:none; color:var(--danger); font-size:1.2rem; cursor:pointer;" onclick="window.hDelLoan('${l.id}')">🗑️</button>
                            </div>
                            <div style="display:flex; justify-content:center; margin-bottom:10px;">
                                <div style="width:50px; height:50px; border-radius:16px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); display:flex; align-items:center; justify-content:center; font-size:1.6rem;">🏦</div>
                            </div>
                            <h3 style="margin:0 0 5px; font-size:1.2rem; color:#fff;">${l.n}</h3>
                            <div style="width:40px; height:3px; background:var(--danger); margin:0 auto 15px; border-radius:2px;"></div>
                            ${errorHtml}
                            <span style="font-size:0.75rem; color:var(--muted); text-transform:uppercase;">KAPITAŁ POZOSTAŁY DO SPŁATY</span>
                            <div style="font-size:2.2rem; font-weight:900; color:#fff; margin-top:5px; letter-spacing:-1px;">${Number(kap || 0).toFixed(2)} PLN</div>
                            ${savingsHtml}
                        </div>
                        <div style="padding:0 20px 15px;">${detailsGrid}</div>
                        <div style="padding:0 20px 20px; display:flex; flex-direction:column; gap:10px;">
                            <button style="background:var(--danger); color:#fff; width:100%; padding:15px; border-radius:14px; font-weight:bold; font-size:0.9rem; border:none; box-shadow:0 6px 15px rgba(239,68,68,0.3); cursor:pointer;" onclick="window.hOpenPayLoanModal('${l.id}')">💸 SPŁAĆ RATĘ ( ${Number(rat || 0).toFixed(2)} zł )</button>
                            <div style="display:flex; gap:10px;">
                                <button style="background:rgba(14,165,233,0.2); color:var(--info); flex:1; padding:10px; border-radius:10px; font-size:0.75rem; border:1px solid rgba(14,165,233,0.4);" onclick="window.hOverpayLoan('${l.id}')">💰 NADPŁAĆ</button>
                                <button style="background:rgba(245,158,11,0.2); color:var(--warning); flex:1; padding:10px; border-radius:10px; font-size:0.75rem; border:1px solid rgba(245,158,11,0.4);" onclick="window.hCreditHoliday('${l.id}')">🏖️ WAKACJE</button>
                                <button style="background:rgba(34,197,94,0.2); color:var(--success); flex:1; padding:10px; border-radius:10px; font-size:0.75rem; border:1px solid rgba(34,197,94,0.4);" onclick="window.hPayOffCompletely('${l.id}')">🏆 ZAMKNIJ</button>
                            </div>
                        </div>
                    </div>`;
                } else {
                    let savingsHtml = (!isError && savings > 0) ? `<div style="font-size:0.65rem; color:var(--success); margin-bottom:8px; font-weight:bold; text-align:center;">Spłacając dziś, unikasz ${Number(savings || 0).toFixed(2)} zł odsetek! 💸</div>` : '';
                    let rightInfo = `<span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">Pozostało rat</span><br><strong style="color:#fff; font-size:0.9rem;">${instL} z ${totInst}</strong>`;
                    return `
                    <div class="panel" style="flex: 0 0 75%; min-width: 250px; max-width: 280px; scroll-snap-align: center; padding:15px; border-left:4px solid var(--danger); border-radius:16px; margin-bottom:0; background:linear-gradient(145deg, #18181b, #09090b); position:relative;">
                        <div style="position:absolute; right:15px; top:15px; display:flex; gap:5px;">
                            <button style="background:transparent; border:none; color:var(--muted); font-size:1.1rem; cursor:pointer;" onclick="window.hOpenLoanModal('${l.id}')">✏️</button>
                            <button style="background:transparent; border:none; color:var(--danger); font-size:1.1rem; cursor:pointer;" onclick="window.hDelLoan('${l.id}')">🗑️</button>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-right:50px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="width:35px; height:35px; border-radius:10px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">🏦</div>
                                <div><strong style="color:#fff; font-size:1rem; display:block; line-height:1.2;">${l.n}</strong><span style="color:var(--muted); font-size:0.7rem;">Rata: <strong style="color:#fff">${Number(rat || 0).toFixed(2)} zł</strong></span></div>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:8px;">
                            <div><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">Kapitał do spłaty</span><strong style="color:#fff; font-size:1.3rem; line-height:1.2; display:block;">${Number(kap || 0).toFixed(2)} zł</strong></div>
                            <div style="text-align:right;">${rightInfo}</div>
                        </div>
                        ${savingsHtml}${errorHtml}
                        <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; margin-bottom:8px;">
                            <div style="width:${pct}%; background:var(--success); height:100%;"></div>
                        </div>
                        <div style="text-align:center; margin-bottom:10px;">
                            <span onclick="let el=document.getElementById('ldet_${l.id}'); let txt=this; if(el.style.display==='none'){el.style.display='block'; txt.innerHTML='🔼 Zwiń szczegóły';}else{el.style.display='none'; txt.innerHTML='🔽 Rozwiń szczegóły';}" style="color:var(--info); font-size:0.75rem; cursor:pointer; font-weight:bold; display:inline-block; padding:5px;">🔽 Rozwiń szczegóły</span>
                        </div>
                        <div id="ldet_${l.id}" style="display:none; margin-bottom:12px;">${detailsGrid}</div>
                        <div style="display:flex; gap:6px;">
                            <button style="background:var(--danger); color:#fff; flex:1; padding:8px 0; border-radius:8px; font-weight:bold; font-size:0.75rem; border:none; cursor:pointer;" onclick="window.hOpenPayLoanModal('${l.id}')">💸 SPŁAĆ</button>
                            <button style="background:rgba(14,165,233,0.15); color:var(--info); width:38px; border-radius:8px; font-size:0.9rem; border:1px solid rgba(14,165,233,0.3); cursor:pointer;" onclick="window.hOverpayLoan('${l.id}')">💰</button>
                            <button style="background:rgba(245,158,11,0.15); color:var(--warning); width:38px; border-radius:8px; font-size:0.9rem; border:1px solid rgba(245,158,11,0.3); cursor:pointer;" onclick="window.hCreditHoliday('${l.id}')">🏖️</button>
                            <button style="background:rgba(34,197,94,0.15); color:var(--success); width:38px; border-radius:8px; font-size:0.9rem; border:1px solid rgba(34,197,94,0.3); cursor:pointer;" onclick="window.hPayOffCompletely('${l.id}')">🏆</button>
                        </div>
                    </div>`;
                }
            }).join('');

            loansHtml = hideScrollStyle + `<div class="hide-scroll" style="display:flex; overflow-x:auto; gap:15px; scroll-snap-type: x mandatory; padding-bottom:15px; width:100%; margin:0; padding: 0 15px;">${mappedLoans}</div>`;
        }

        APP.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:10px;">
            <p style="letter-spacing:1px; color:var(--danger)">KREDYTY I LEASINGI</p>
            <h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px;">Zobowiązania</h1>
            <button class="btn btn-danger" style="border-radius:12px; font-weight:900; box-shadow:0 4px 20px rgba(239,68,68,0.4); width:auto; padding:12px 25px; font-size:0.9rem;" onclick="window.hOpenLoanModal()">+ DODAJ ZOBOWIĄZANIE</button>
        </div>
        ${debtSummaryHtml}
        ${toggleHtml}
        ${loansHtml}
        ${proOptBtn}
        <div class="section-lbl" style="color:var(--success); border-color:var(--success); margin-top:10px;">🎯 Skarbonki / Cele Oszczędnościowe</div>
        <div style="padding: 10px 15px;">
            <div style="text-align:center; margin-bottom:15px;">
                <button class="btn" style="background:linear-gradient(135deg, var(--success), #16a34a); color:#fff; border-radius:12px; font-weight:900; box-shadow:0 4px 20px rgba(34,197,94,0.4); width:auto; padding:12px 25px; font-size:0.9rem;" onclick="window.hOpenPiggyModal()">+ DODAJ CEL</button>
            </div>
            ${window.db.home.piggy.map(p => {
                let saved = parseFloat(p.saved) || 0; 
                let target = parseFloat(p.target) || 0; 
                let pct = target > 0 ? (saved / target) * 100 : 0; 
                if(pct > 100) pct = 100;
                
                let deadlineHtml = ''; 
                if(p.deadline) { 
                    let dLine = new Date(p.deadline); 
                    let diffDays = Math.ceil((dLine - new Date()) / (1000 * 60 * 60 * 24)); 
                    if(diffDays > 0) { 
                        let months = diffDays / 30.4; 
                        let perMonth = (target - saved) / months; 
                        if(perMonth < 0) perMonth = 0; 
                        deadlineHtml = `<div style="font-size:0.75rem; color:var(--muted); margin-bottom:10px; background:rgba(255,255,255,0.05); padding:8px; border-radius:8px;">Zostało <strong>${diffDays} dni</strong>. Wymaga odłożenia ok. <strong style="color:var(--success)">${Number(perMonth || 0).toFixed(0)} zł</strong> miesięcznie.</div>`; 
                    } else { 
                        deadlineHtml = `<div style="font-size:0.75rem; color:var(--danger); margin-bottom:10px;">Czas minął (${p.deadline})</div>`; 
                    } 
                }
                return `
                <div class="panel" style="padding:15px; border-left:4px solid var(--success); background:linear-gradient(145deg, #18181b, #09090b); margin-bottom:15px; border-radius:16px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;">
                        <strong style="color:#fff; font-size:1.1rem;">${p.n}</strong>
                        <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:6px 10px; cursor:pointer; font-weight:bold; font-size:0.7rem;" onclick="window.hDelPiggy('${p.id}')">USUŃ</button>
                    </div>
                    ${deadlineHtml}
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--muted); margin-bottom:8px;">
                        <span>Zgromadzono: <strong style="color:var(--success); font-size:1rem;">${Number(saved || 0).toFixed(0)} zł</strong></span>
                        <span>Cel: ${Number(target || 0).toFixed(0)} zł</span>
                    </div>
                    <div style="width:100%; height:12px; background:rgba(0,0,0,0.5); border-radius:6px; overflow:hidden; margin-bottom:12px;">
                        <div style="width:${pct}%; background:var(--success); height:100%;"></div>
                    </div>
                    <button style="background:rgba(34,197,94,0.15); color:var(--success); border:1px solid rgba(34,197,94,0.3); border-radius:10px; padding:10px; width:100%; font-weight:bold; cursor:pointer;" onclick="window.hAddFundsPiggy('${p.id}')">+ WPŁAĆ ŚRODKI (Z KONTA)</button>
                </div>`;
            }).join('') || '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px 0;">Brak aktywnych celów.</div>'}
        </div>
        
        <div class="section-lbl" style="color:var(--warning); border-color:var(--warning); margin-top:30px;">🤝 Zeszyt Długów</div>
        <div class="panel" style="border-color:var(--warning);">
            ${notebookSummary}
            <div class="mode-switch" style="margin-bottom:15px; background:rgba(0,0,0,0.5);">
                <div class="m-btn ${window.hDebtType==='they_owe'?'active':''}" style="${window.hDebtType==='they_owe'?'background:var(--success);color:#000;':''}" onclick="window.hDebtType='they_owe';window.render()">Ktoś mi wisi</div>
                <div class="m-btn ${window.hDebtType==='i_owe'?'active':''}" style="${window.hDebtType==='i_owe'?'background:var(--danger);color:#000;':''}" onclick="window.hDebtType='i_owe';window.render()">Ja komuś wiszę</div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Kto / Od kogo?</label><input type="text" id="hd-name" placeholder="np. Jan Kowalski" style="background:#000;"></div>
                <div class="inp-group"><label>Kwota (zł)</label><input type="number" id="hd-val" placeholder="np. 150" style="background:#000;"></div>
            </div>
            <button class="btn" style="background:var(--warning); color:#000; padding:15px; margin-bottom:20px; font-weight:900;" onclick="window.hAddDebt()">ZAPISZ DŁUG DO ZESZYTU</button>
            <div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                ${h.debts.filter(d => !d.isClosed).length === 0 ? '<div style="text-align:center; color:var(--muted); font-size:0.85rem;">Brak wpisów w zeszycie.</div>' : 
                h.debts.filter(d => !d.isClosed).map(d => { 
                    let amt = parseFloat(d.amount) || 0; 
                    return `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid ${d.type === 'they_owe' ? 'var(--success)' : 'var(--danger)'};">
                        <div>
                            <strong style="color:#fff; font-size:1.1rem;">${d.person}</strong>
                            <span style="font-size:0.75rem; color:var(--muted); display:block;">Pozostało: <strong style="color:${d.type === 'they_owe' ? 'var(--success)' : 'var(--danger)'};">${Number(amt || 0).toFixed(2)} zł</strong></span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button style="background:rgba(255,255,255,0.1); color:#fff; border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.hOpenPayDebtModal(${d.id})">💸 SPŁAĆ</button>
                            <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:8px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.hDelDebtMistake(${d.id})">🗑️</button>
                        </div>
                    </div>`; 
                }).join('')}
            </div>
        </div>` + nav;
    }
    
    // ==========================================
    // ZAKŁADKA: KONTA (ACCOUNTS)
    // ==========================================
    if(t === 'acc') { 
        let totalAccBal = 0; 
        h.accs.forEach(a => totalAccBal += Math.max(0, parseFloat(balances[a.id]) || 0));
        
        let allocBar = `<div style="width:100%; height:8px; border-radius:4px; overflow:hidden; display:flex; margin-bottom:20px; background:rgba(255,255,255,0.1);">`;
        h.accs.forEach(a => { 
            let bal = parseFloat(balances[a.id]) || 0; 
            if(bal > 0 && totalAccBal > 0) { 
                let pct = (bal / totalAccBal) * 100; 
                allocBar += `<div style="width:${pct}%; background:${a.c}; height:100%;"></div>`; 
            } 
        }); 
        allocBar += `</div>`;
        
        let proBankBtn = `
        <div style="margin-top:20px; padding:15px; border-radius:16px; border:1px dashed rgba(139, 92, 246, 0.4); background:rgba(139, 92, 246, 0.05); text-align:center; cursor:pointer;" onclick="window.sysAlert('Funkcja PRO', 'Automatyczna synchronizacja kont z bankami (Open Banking API) pojawi się w wersji PRO! Nie będziesz musiał wpisywać wydatków ręcznie. 🏦', 'info')">
            <strong style="color:#a855f7; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px;"><span>🔗</span> Podłącz prawdziwy bank (Wkrótce PRO)</strong>
            <p style="font-size:0.75rem; color:var(--muted); margin-top:5px; margin-bottom:0;">Automatyczne pobieranie historii i salda</p>
        </div>`;
        
        let topActions = `
        <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
            <button class="btn" style="background:linear-gradient(135deg, var(--life), #0d9488); color:#000; border-radius:12px; font-weight:900; box-shadow:0 4px 20px rgba(20,184,166,0.4); flex:1; min-width:100px; padding:12px 10px; font-size:0.8rem; margin:0;" onclick="window.hOpenAccModal()">+ KONTO</button>
            <button class="btn" style="background:rgba(245,158,11,0.2); color:var(--warning); border-radius:12px; font-weight:900; flex:1; min-width:100px; padding:12px 10px; font-size:0.8rem; margin:0; border:1px solid rgba(245,158,11,0.3);" onclick="window.hOpenLoanModal(null, true)">+ KARTA</button>
            <button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:900; flex:1; min-width:100px; padding:12px 10px; font-size:0.8rem; margin:0; border:1px solid rgba(255,255,255,0.2);" onclick="window.switchTab('add'); window.hTransType='transfer'; window.render();">🔄 PRZELEW</button>
        </div>`;

        let activeCards = h.loans.filter(l => !l.isClosed && l.type === 'Karta');
        let cardsHtml = '';
        if(activeCards.length > 0) {
            let hideScrollStyle = `<style>.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }</style>`;
            let mappedCards = activeCards.map(c => {
                let kap = parseFloat(c.kapital) || 0; 
                let bor = parseFloat(c.borrowed) || 0;
                let pctBank = parseFloat(c.pct) || 0; 
                let pct = bor > 0 ? (kap / bor) * 100 : 0; 
                if(pct > 100) pct = 100;
                
                let avail = bor - kap; 
                if(avail < 0) avail = 0;
                
                let minP = (kap * (c.minPayPct || 5)) / 100;
                if(minP < 50 && kap > 0) minP = Math.min(50, kap);
                
                let monthlyInt = (kap * (pctBank / 100)) / 12;
                
                let declaredText = c.declaredPay === 'min' ? 'Minimalna kwota' : '100% (Całość)';
                let motivation = '';
                
                if (kap > 0) {
                    if (c.declaredPay === '100') {
                        motivation = `<div style="font-size:0.7rem; color:var(--success); margin-top:10px; font-weight:bold; text-align:center; background:rgba(34,197,94,0.1); padding:8px; border-radius:8px; border:1px solid rgba(34,197,94,0.2);">💡 Spłacasz całość w okresie bezodsetkowym. Używasz pieniędzy banku za darmo! 🚀</div>`;
                    } else {
                        motivation = `<div style="font-size:0.7rem; color:var(--danger); margin-top:10px; font-weight:bold; text-align:center; background:rgba(239,68,68,0.1); padding:8px; border-radius:8px; border:1px solid rgba(239,68,68,0.2);">⚠️ Spłacając tylko minimum, w tym miesiącu zapłacisz bankowi ok. <strong>${Number(monthlyInt || 0).toFixed(2)} zł</strong> odsetek!</div>`;
                    }
                } else {
                    motivation = `<div style="font-size:0.7rem; color:var(--success); margin-top:10px; font-weight:bold; text-align:center;">Świetnie! Karta jest w pełni spłacona. 🏆</div>`;
                }

                let detailsGrid = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.05); text-align:left;">
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">🗓️ Cykl spłaty</span><br><strong style="color:#fff; font-size:0.85rem;">Do ${c.day || 10} dnia m-ca</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">📊 Oprocentowanie</span><br><strong style="color:#fff; font-size:0.85rem;">${Number(pctBank || 0).toFixed(2)}%</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">💳 Limit Karty</span><br><strong style="color:#fff; font-size:0.85rem;">${Number(bor || 0).toFixed(2)} zł</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">📉 Szac. Odsetki</span><br><strong style="color:var(--danger); font-size:0.85rem;">${Number(monthlyInt || 0).toFixed(2)} zł/m-c</strong></div>
                </div>`;

                return `
                <div class="panel" style="flex: 0 0 90%; max-width: 380px; scroll-snap-align: center; padding:15px; border-left:4px solid var(--warning); margin-bottom:0; background:linear-gradient(145deg, #18181b, #09090b);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div style="width:45px; height:45px; border-radius:12px; background:rgba(245,158,11,0.1); display:flex; align-items:center; justify-content:center; font-size:1.6rem; border:1px solid rgba(245,158,11,0.3);">💳</div>
                            <div><strong style="font-size:1.2rem; color:#fff;">${c.n}</strong><small style="color:var(--muted); display:block; margin-top:2px; font-size:0.75rem;">Dzień spłaty: ${c.day || 10}</small></div>
                        </div>
                        <div style="text-align:right;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">Zadłużenie</span><br><strong style="color:var(--warning); font-size:1.4rem;">${Number(kap || 0).toFixed(2)} zł</strong></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-top:15px; margin-bottom:5px;">
                        <span style="color:var(--success)">Dostępne: ${Number(avail || 0).toFixed(2)} zł</span><span style="color:var(--muted)">Limit: ${Number(bor || 0).toFixed(2)} zł</span>
                    </div>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
                        <div style="width:${pct}%; background:var(--warning); height:100%;"></div>
                    </div>
                    
                    <div style="background:rgba(255,255,255,0.02); border-radius:8px; padding:10px; margin-top:15px; display:flex; justify-content:space-between; font-size:0.75rem;"><span style="color:var(--muted);">Min. spłata:<br><strong style="color:#fff;">${Number(minP || 0).toFixed(2)} zł</strong></span><span style="color:var(--muted); text-align:right;">Zadeklarowano:<br><strong style="color:var(--info);">${declaredText}</strong></span></div>
                    
                    ${motivation}
                    
                    <div style="text-align:center; margin-top:15px;">
                        <span onclick="let el=document.getElementById('cdet_${c.id}'); let txt=this; if(el.style.display==='none'){el.style.display='block'; txt.innerHTML='🔼 Zwiń szczegóły';}else{el.style.display='none'; txt.innerHTML='🔽 Rozwiń szczegóły';}" style="color:var(--info); font-size:0.75rem; cursor:pointer; font-weight:bold; display:inline-block; padding:5px;">🔽 Rozwiń szczegóły</span>
                    </div>
                    <div id="cdet_${c.id}" style="display:none; margin-bottom:12px;">${detailsGrid}</div>
                    
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                        <button style="flex:2; background:rgba(34,197,94,0.15); color:var(--success); border:1px solid rgba(34,197,94,0.3); border-radius:10px; padding:12px 5px; font-size:0.85rem; font-weight:bold; cursor:pointer;" onclick="window.hOpenPayLoanModal('${c.id}')">💸 SPŁAĆ ZADŁUŻENIE</button>
                        <button style="flex:1; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px 5px; font-size:0.8rem; cursor:pointer;" onclick="window.hOpenLoanModal('${c.id}')">✏️ Edytuj</button>
                        <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:12px 15px; cursor:pointer;" onclick="window.hDelLoan('${c.id}')">🗑️</button>
                    </div>
                </div>`;
            }).join('');
            cardsHtml = `<div class="section-lbl" style="color:var(--warning); border-color:var(--warning); margin-top:20px;">💳 Karty Kredytowe</div>` + hideScrollStyle + `<div class="hide-scroll" style="display:flex; overflow-x:auto; gap:15px; scroll-snap-type: x mandatory; padding-bottom:15px; width:100%; margin:0; padding: 0 15px;">${mappedCards}</div>`;
        }

        APP.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:10px;">
            <p style="letter-spacing:1px; color:var(--life)">KONTA I PORTFELE</p>
            <h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px;">Zarządzanie</h1>
            <div style="font-size:0.75rem; color:var(--muted); margin-bottom:8px; text-transform:uppercase; font-weight:bold;">Struktura Twojego Majątku</div>
            ${allocBar}
            ${topActions}
        </div>
        ${cardsHtml}
        <div style="padding: 10px 15px;">
            <div class="section-lbl" style="color:#fff; border-color:rgba(255,255,255,0.1); margin-top:10px;">🏦 Konta i Portfele</div>
            ${h.accs.map(a => {
                let bal = parseFloat(balances[a.id]) || 0; 
                let pct = totalAccBal > 0 && bal > 0 ? ((bal / totalAccBal) * 100).toFixed(0) : 0;
                return `
                <div class="panel" style="padding:15px; border-left:4px solid ${a.c}; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div style="width:50px; height:50px; border-radius:50%; background:${a.c}22; display:flex; align-items:center; justify-content:center; font-size:1.8rem; border:1px solid ${a.c}55;">${a.i}</div>
                            <div>
                                <strong style="font-size:1.2rem; color:#fff;">${a.n}</strong>
                                <small style="color:var(--muted); display:block; margin-top:2px; font-size:0.75rem;">Bieżące saldo (${pct}%)</small>
                            </div>
                        </div>
                        <strong style="color:${bal >= 0 ? '#fff' : 'var(--danger)'}; font-size:1.4rem;">${Number(bal || 0).toFixed(2)} zł</strong>
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                        <button style="flex:1; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 5px; font-size:0.75rem; cursor:pointer;" onclick="window.hOpenAccModal('${a.id}')">✏️ Edytuj</button>
                        <button style="flex:1; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 5px; font-size:0.75rem; cursor:pointer;" onclick="window.hShowIconPicker('${a.id}')">🎨 Ikona</button>
                        <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:10px 15px; cursor:pointer;" onclick="window.hDelAcc('${a.id}')">🗑️</button>
                    </div>
                </div>`;
            }).join('')}
            ${proBankBtn}
        </div>` + nav; 
    }

    // ==========================================
    // ZAKŁADKA: DODAWANIE TRANSAKCJI (ADD)
    // ==========================================
    if(t === 'add') { 
        let isExp = window.hTransType === 'exp'; 
        let isTrans = window.hTransType === 'transfer'; 
        let col = isExp ? 'var(--danger)' : (isTrans ? 'var(--info)' : 'var(--success)'); 
        let topBg = isExp ? 'var(--bg-exp)' : (isTrans ? 'linear-gradient(180deg, #0ea5e9 0%, #09090b 100%)' : 'var(--bg-inc)'); 
        let todayStr = window.getLocalYMD(); 
        let catSrc = isExp ? C_EXP : C_INC; 
        
        if(!isTrans && (!window.hSelCat || !catSrc[window.hSelCat])) window.hSelCat = Object.keys(catSrc)[0]; 
        if(!window.hSelAcc && h.accs.length > 0) window.hSelAcc = h.accs[0].id;
        if(!window.hSelAccFrom && h.accs.length > 0) window.hSelAccFrom = h.accs[0].id;
        if(!window.hSelAccTo && h.accs.length > 1) window.hSelAccTo = h.accs[1].id;

        let scanBtnHtml = `<button class="btn" style="background:rgba(139, 92, 246, 0.15); color:#a855f7; border:1px dashed rgba(139, 92, 246, 0.4); border-radius:12px; font-weight:bold; padding:15px; margin-bottom:20px; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1);" onclick="window.sysAlert('Funkcja PRO', 'Inteligentne skanowanie paragonów i faktur (AI OCR) będzie dostępne wkrótce w StyreOS PRO! 🚀', 'info')"><span style="font-size:1.3rem;">📸</span> SKANUJ PARAGON (Wkrótce PRO)</button>`;

        let templates = [];
        if(!isTrans) {
            let counts = {};
            window.db.home.trans.filter(x => x.type === window.hTransType && !x.isPlanned).forEach(x => { 
                let key = x.d + '|' + x.cat; 
                if(!counts[key]) counts[key] = {n: x.d || x.cat, c: x.cat, v: parseFloat(x.v) || 0, cnt: 0}; 
                counts[key].cnt++; 
                counts[key].v = parseFloat(x.v) || 0; 
            });
            templates = Object.values(counts).sort((a,b) => b.cnt - a.cnt).slice(0,3).map(x => { 
                return {n: x.n.substring(0,12), v: x.v, c: x.c, i: catSrc[x.c] ? catSrc[x.c].i : '💸'}; 
            });
            if(templates.length === 0) { 
                templates = isExp ? 
                [{n:'Kawa', v:15, c:'Jedzenie na mieście', i:'☕'}, {n:'Paliwo', v:150, c:'Auto i Transport', i:'⛽'}, {n:'Biedronka', v:100, c:'Zakupy Spożywcze', i:'🛒'}] : 
                [{n:'Wypłata', v:4000, c:'Wypłata z Etatu', i:'💰'}, {n:'Kieszonkowe', v:100, c:'Inne Wpływy', i:'🎁'}]; 
            }
        }
        
        let tplHtml = !isTrans ? `<div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:10px; margin-bottom:15px;">${templates.map(tpl => `<div onclick="window.hUseTemplate(${tpl.v}, '${tpl.c}', '${tpl.n}')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:8px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer; white-space:nowrap;"><span style="font-size:1.2rem;">${tpl.i}</span><span style="color:#fff; font-weight:bold; font-size:0.85rem;">${tpl.n}</span></div>`).join('')}</div>` : '';
        
        let accSlider = (selVar) => `<div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:5px;">${h.accs.map(a => { 
            let bal = parseFloat(balances[a.id]) || 0; 
            return `<div onclick="window.${selVar}='${a.id}'; window.render()" style="background:${window[selVar]===a.id?a.c+'33':'rgba(255,255,255,0.05)'}; border:1px solid ${window[selVar]===a.id?a.c:'rgba(255,255,255,0.1)'}; border-radius:12px; padding:10px; min-width:110px; flex-shrink:0; text-align:center; cursor:pointer;"><div style="font-size:1.5rem; margin-bottom:5px;">${a.i}</div><strong style="color:#fff; font-size:0.8rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.n}</strong><small style="color:var(--muted); font-size:0.7rem;">${Number(bal || 0).toFixed(0)} zł</small></div>`; 
        }).join('')}</div>`;
        
        let gridHtml = !isTrans ? `<div class="cat-grid" style="grid-template-columns: repeat(4, 1fr); gap:8px;">` + Object.keys(catSrc).map(k => `<div class="cat-item ${window.hSelCat===k?'active':''}" onclick="window.hSelCat='${k}'; window.hCheckLimit(); window.render();" style="padding:10px 5px; ${window.hSelCat===k?`background:${catSrc[k].c}22; border-color:${catSrc[k].c};`:''}"><span class="cat-icon" style="font-size:1.5rem; margin-bottom:5px;">${catSrc[k].i}</span><span class="cat-lbl" style="font-size:0.65rem; line-height:1.1;">${k}</span></div>`).join('') + `</div>` : ''; 
        
        let memChips = `<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:5px;">` + h.members.map(m => `<div class="chip ${window.hMem === m ? 'active' : ''}" style="padding:8px 16px; flex-shrink:0; ${window.hMem === m ? 'background:var(--life);color:#000;border-color:var(--life)' : 'color:var(--muted)'}" onclick="window.hMem='${m}'; window.render();">${m}</div>`).join('') + `</div>`; 

        APP.innerHTML = hdr + `
        <div style="background: ${topBg}; padding: 20px 15px 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div class="mode-switch" style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1);">
                <div class="m-btn" style="${isExp?'background:var(--danger); color:#fff;':'color:var(--muted)'}" onclick="window.hTransType='exp';window.render()">WYDATEK</div>
                <div class="m-btn" style="${!isExp&&!isTrans?'background:var(--success); color:#fff;':'color:var(--muted)'}" onclick="window.hTransType='inc';window.render()">WPŁYW</div>
                <div class="m-btn" style="${isTrans?'background:var(--info); color:#fff;':'color:var(--muted)'}" onclick="window.hTransType='transfer';window.render()">TRANSFER</div>
            </div>
            <div style="text-align:center; padding: 15px 0 5px;">
                <label style="color:#fff; font-size:0.8rem; font-weight:bold; text-transform:uppercase; opacity:0.8;">Wprowadź Kwotę</label>
                <div style="display:flex; justify-content:center; align-items:center; gap:5px; margin-top:5px;">
                    <input type="number" id="h-v" oninput="window.hCheckLimit()" style="background:transparent; border:none; border-bottom:2px solid #fff; color:#fff; font-size:4rem!important; font-weight:900; text-align:center; width:200px; padding:5px; outline:none;" placeholder="0">
                    <span style="font-size:2rem; font-weight:900; color:#fff;">zł</span>
                </div>
                <div id="h-warn-limit" style="display:none; color:var(--warning); font-size:0.75rem; font-weight:bold; margin-top:10px; background:rgba(245,158,11,0.15); padding:6px; border-radius:8px; border:1px solid rgba(245,158,11,0.3);"></div>
            </div>
        </div>
        <div style="padding: 15px;">
            ${scanBtnHtml}
            ${tplHtml}
            <div style="margin-bottom:15px;">
                <label style="font-size:0.75rem; color:var(--muted); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:8px;">Kto wykonuje?</label>
                ${memChips}
            </div>
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
                ${!isTrans ? `<div class="inp-group" style="flex:1;"><label>Powtarzaj</label><select id="h-recurring" style="background:#18181b;"><option value="none">Nie</option><option value="month">Co miesiąc 🔄</option></select></div>` : ''}
            </div>
            <button class="btn" style="background:${col}; color:#fff; font-size:1.2rem; font-weight:900; padding:20px; box-shadow:0 10px 20px ${col}44;" onclick="window.hAction()">${isTrans?'WYKONAJ PRZELEW':'ZAPISZ TRANSAKCJĘ'}</button>
        </div>` + nav; 
    } 
    
    // ==========================================
    // ZAKŁADKA: STATYSTYKI (STATS)
    // ==========================================
    if(t === 'stats') { 
        let now = new Date(); 
        let cats = {}; 
        let incCats = {}; 
        let sumExp = 0; 
        let sumInc = 0; 
        let sumFixed = 0; 
        let sumVar = 0; 
        
        h.trans.forEach(x => { 
            let d = new Date(x.rD); 
            let v = parseFloat(x.v) || 0; 
            if(!x.isPlanned && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) { 
                if(x.type === 'exp') { 
                    if(!cats[x.cat]) cats[x.cat] = 0; 
                    cats[x.cat] += v; 
                    sumExp += v; 
                    if(FIXED_EXP_CATS.includes(x.cat)) sumFixed += v; 
                    else sumVar += v; 
                } 
                if(x.type === 'inc') { 
                    if(!incCats[x.cat]) incCats[x.cat] = 0; 
                    incCats[x.cat] += v; 
                    sumInc += v; 
                } 
            } 
        }); 
        
        let sortedCats = Object.keys(cats).sort((a,b) => cats[b] - cats[a]); 
        let cLabels = sortedCats; 
        let cData = sortedCats.map(k => cats[k]); 
        let cColors = sortedCats.map(k => C_EXP[k] ? C_EXP[k].c : '#8b5cf6'); 
        
        let catListHtml = sortedCats.map((lbl, idx) => { 
            let val = cData[idx]; 
            let pct = sumExp > 0 ? ((val / sumExp) * 100).toFixed(0) : 0; 
            let color = cColors[idx]; 
            let icon = C_EXP[lbl] ? C_EXP[lbl].i : '📦'; 
            return `<div class="cat-list-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><div style="display:flex; align-items:center;"><div style="width:30px; height:30px; border-radius:50%; background:${color}22; display:flex; align-items:center; justify-content:center; margin-right:12px; font-size:1rem; border:1px solid ${color}55;">${icon}</div><span style="font-weight:bold;">${lbl}</span></div><div style="display:flex; align-items:center;"><span style="color:var(--muted);font-size:0.8rem;margin-right:10px;">${pct}%</span><span style="color:${color};font-weight:bold;">-${Number(val||0).toFixed(2)} zł</span></div></div>`; 
        }).join(''); 
        
        let sortedIncCats = Object.keys(incCats).sort((a,b) => incCats[b] - incCats[a]); 
        let incLabels = sortedIncCats; 
        let incData = sortedIncCats.map(k => incCats[k]); 
        let incColors = sortedIncCats.map(k => C_INC[k] ? C_INC[k].c : '#22c55e'); 
        
        let incListHtml = sortedIncCats.map((lbl, idx) => { 
            let val = incData[idx]; 
            let pct = sumInc > 0 ? ((val / sumInc) * 100).toFixed(0) : 0; 
            let color = incColors[idx]; 
            let icon = C_INC[lbl] ? C_INC[lbl].i : '💰'; 
            return `<div class="cat-list-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><div style="display:flex; align-items:center;"><div style="width:30px; height:30px; border-radius:50%; background:${color}22; display:flex; align-items:center; justify-content:center; margin-right:12px; font-size:1rem; border:1px solid ${color}55;">${icon}</div><span style="font-weight:bold;">${lbl}</span></div><div style="display:flex; align-items:center;"><span style="color:var(--muted);font-size:0.8rem;margin-right:10px;">${pct}%</span><span style="color:${color};font-weight:bold;">+${Number(val||0).toFixed(2)} zł</span></div></div>`; 
        }).join(''); 
        
        let bilans = sumInc - sumExp; 
        let mapBtnHtml = `<button class="btn" style="background:rgba(14, 165, 233, 0.15); color:var(--info); border:1px dashed rgba(14, 165, 233, 0.4); border-radius:12px; font-weight:bold; padding:12px; margin-bottom:20px; display:flex; align-items:center; justify-content:center; gap:10px; width:100%;" onclick="window.sysAlert('Funkcja PRO', 'Mapa Finansów (Geotagowanie wydatków i nawigacja Google Maps) będzie wkrótce dostępna w wersji StyreOS PRO! 🗺️', 'info')"><span style="font-size:1.1rem;">📍</span> POKAŻ WYDATKI NA MAPIE (Wkrótce PRO)</button>`;

        APP.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:10px;">
            <p>BILANS W TYM MIESIĄCU</p>
            <h1 style="color:${bilans >= 0 ? 'var(--success)' : 'var(--danger)'}; font-size:3.5rem;">${bilans > 0 ? '+' : ''}${Number(bilans||0).toFixed(2)} zł</h1>
        </div>
        <div class="grid-2" style="padding: 0 15px; margin-bottom: 20px;">
            <div class="box" style="border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05);">
                <span style="color:var(--success)">Przychody</span><strong style="color:#fff">${Number(sumInc||0).toFixed(2)} zł</strong>
            </div>
            <div class="box" style="border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.05);">
                <span style="color:var(--danger)">Wydatki</span><strong style="color:#fff">-${Number(sumExp||0).toFixed(2)} zł</strong>
            </div>
        </div>
        <div style="padding:0 15px;">${mapBtnHtml}</div>
        <div class="panel" style="margin-bottom:20px; border-color:var(--info);">
            <div class="p-title" style="color:var(--info); margin-bottom:10px;">Podział Wydatków</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span style="color:var(--muted); font-size:0.8rem; font-weight:bold;">Stałe opłaty: <span style="color:#f59e0b">${Number(sumFixed||0).toFixed(2)} zł</span></span>
                <span style="color:var(--muted); font-size:0.8rem; font-weight:bold;">Zmienne: <span style="color:#0ea5e9">${Number(sumVar||0).toFixed(2)} zł</span></span>
            </div>
            <div style="width:100%; height:12px; background:rgba(255,255,255,0.1); border-radius:6px; overflow:hidden; display:flex;">
                <div style="width:${sumExp > 0 ? (sumFixed/sumExp)*100 : 0}%; background:#f59e0b; height:100%;"></div>
                <div style="width:${sumExp > 0 ? (sumVar/sumExp)*100 : 0}%; background:#0ea5e9; height:100%;"></div>
            </div>
            <p style="font-size:0.7rem; color:var(--muted); text-align:center; margin-top:10px;">Opłaty stałe stanowią ${(sumExp > 0 ? (sumFixed/sumExp)*100 : 0).toFixed(0)}% Twoich wydatków.</p>
        </div>
        <div class="panel" style="padding: 20px; border-color:rgba(34, 197, 94, 0.4);">
            <div class="p-title" style="color:var(--success)">Struktura Przychodów</div>
            <div style="height:200px; position:relative; margin-bottom:20px;">
                <canvas id="h-chart-inc"></canvas>${sumInc === 0 ? '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:var(--muted); font-size:0.9rem;">Brak danych</div>' : ''}
            </div>
            <div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">
                ${incListHtml || '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px;">Brak wpływów.</div>'}
            </div>
        </div>
        <div class="panel" style="padding: 20px; border-color:rgba(239, 68, 68, 0.4);">
            <div class="p-title" style="color:var(--danger)">Struktura Kosztów Zmiennych</div>
            <div style="height:250px; position:relative; margin-bottom:20px;">
                <canvas id="h-chart"></canvas>${sumExp === 0 ? '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:var(--muted); font-size:0.9rem;">Brak danych</div>' : ''}
            </div>
            <div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">
                ${catListHtml || '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px;">Brak wydatków.</div>'}
            </div>
        </div>` + nav; 
        
        if(sumExp > 0) { 
            setTimeout(() => { 
                if(window.hCh) window.hCh.destroy(); 
                let ctx = document.getElementById('h-chart').getContext('2d'); 
                window.hCh = new Chart(ctx, { type: 'doughnut', data: { labels: cLabels, datasets: [{ data: cData, backgroundColor: cColors, borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%', layout: {padding: 10} } }); 
            }, 100); 
        } 
        if(sumInc > 0) { 
            setTimeout(() => { 
                if(window.hChInc) window.hChInc.destroy(); 
                let ctx2 = document.getElementById('h-chart-inc').getContext('2d'); 
                window.hChInc = new Chart(ctx2, { type: 'doughnut', data: { labels: incLabels, datasets: [{ data: incData, backgroundColor: incColors, borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%', layout: {padding: 10} } }); 
            }, 100); 
        } 
    } 
    
    // ==========================================
    // ZAKŁADKA: KALENDARZ (CALENDAR/HISTORY)
    // ==========================================
    if(t === 'cal') { 
        let isPlannedMode = window.hCalMode === 'planned'; 
        let switchHtml = `<div class="mode-switch" style="margin: 15px 15px 5px 15px;"><div class="m-btn ${!isPlannedMode?'active':''}" style="${!isPlannedMode?'background:var(--success);color:#000;':''}" onclick="window.hCalMode='history'; window.render()">📅 Zrealizowane</div><div class="m-btn ${isPlannedMode?'active':''}" style="${isPlannedMode?'background:var(--warning);color:#000;':''}" onclick="window.hCalMode='planned'; window.render()">⏳ Planowane</div></div>`;
        let viewM = window.hViewDate.getMonth(); 
        let viewY = window.hViewDate.getFullYear(); 
        let mName = window.hViewDate.toLocaleDateString('pl-PL', {month:'long', year:'numeric'}).toUpperCase();
        
        let filteredTrans = h.trans.filter(x => { 
            let d = new Date(x.rD); 
            return d.getMonth() === viewM && d.getFullYear() === viewY && (isPlannedMode ? x.isPlanned : !x.isPlanned); 
        });
        
        if(window.hHistFilter === 'inc') filteredTrans = filteredTrans.filter(x => x.type === 'inc'); 
        if(window.hHistFilter === 'exp') filteredTrans = filteredTrans.filter(x => x.type === 'exp');
        if(window.hSearchQuery) { 
            let q = window.hSearchQuery.toLowerCase(); 
            filteredTrans = filteredTrans.filter(x => (x.d || '').toLowerCase().includes(q) || (x.cat || '').toLowerCase().includes(q) || (x.v || '').toString().includes(q)); 
        }
        
        let monthlySummaryHtml = '';
        if(isPlannedMode && filteredTrans.length > 0 && !window.hSearchQuery) { 
            let mExp = 0; 
            let mInc = 0; 
            filteredTrans.forEach(x => { 
                let v = parseFloat(x.v) || 0; 
                if(x.type === 'exp') mExp += v; 
                if(x.type === 'inc') mInc += v; 
            }); 
            monthlySummaryHtml = `<div style="padding:0 15px;"><div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); padding:12px; border-radius:12px; margin-bottom:15px; text-align:center;"><div style="display:flex; justify-content:space-around;"><div><span style="font-size:0.7rem; color:var(--muted)">Do wydania</span><br><strong style="color:var(--danger); font-size:1.1rem;">-${Number(mExp||0).toFixed(2)} zł</strong></div><div style="border-left:1px solid rgba(245,158,11,0.2); padding-left:15px;"><span style="font-size:0.7rem; color:var(--muted)">Spodziewany wpływ</span><br><strong style="color:var(--success); font-size:1.1rem;">+${Number(mInc||0).toFixed(2)} zł</strong></div></div></div></div>`; 
        }
        
        let groups = {}; 
        filteredTrans.sort((a,b) => isPlannedMode ? new Date(a.rD) - new Date(b.rD) : new Date(b.rD) - new Date(a.rD)).forEach(x => { 
            if(!groups[x.dt]) groups[x.dt] = []; 
            groups[x.dt].push(x); 
        }); 
        
        let calHtml = Object.keys(groups).map(date => { 
            let dayTrans = groups[date]; 
            let dayExp = dayTrans.filter(x=>x.type==='exp').reduce((a,b)=>a+(parseFloat(b.v)||0), 0); 
            let dayInc = dayTrans.filter(x=>x.type==='inc').reduce((a,b)=>a+(parseFloat(b.v)||0), 0); 
            
            let itemsHtml = dayTrans.map(x => { 
                let v = parseFloat(x.v) || 0; 
                let isExp = x.type === 'exp'; 
                let isTrans = x.type === 'transfer'; 
                let cd = isExp ? (C_EXP[x.cat] || {c:'#ef4444',i:'💸'}) : (isTrans ? {c:'#8b5cf6',i:'🔄'} : (C_INC[x.cat] || {c:'#22c55e',i:'💵'})); 
                let accName = isTrans ? `Z ${h.accs.find(a=>a.id===x.fromAcc)?.n || 'Konta'} na ${h.accs.find(a=>a.id===x.toAcc)?.n || 'Konto'}` : (h.accs.find(a=>a.id===x.acc)?.n || 'Konto'); 
                let catName = isTrans ? 'Przelew' : x.cat; 
                let planLbl = x.isPlanned ? `<span style="color:var(--warning); font-size:0.6rem; margin-left:5px;">(PLAN)</span>` : ''; 
                
                let payBtn = ''; 
                if(x.isPlanned && x.loanId) payBtn = `<button style="background:rgba(34,197,94,0.2); color:var(--success); border:1px solid var(--success); border-radius:8px; padding:6px 12px; font-size:0.75rem; font-weight:bold; cursor:pointer; width:100%; margin-top:8px;" onclick="window.hOpenPayLoanModal('${x.loanId}', '${x.id}')">💸 OPŁAĆ RATĘ TERAZ</button>`; 
                if(x.isPlanned && x.debtId) payBtn = `<button style="background:rgba(245,158,11,0.2); color:var(--warning); border:1px solid var(--warning); border-radius:8px; padding:6px 12px; font-size:0.75rem; font-weight:bold; cursor:pointer; width:100%; margin-top:8px;" onclick="window.hOpenPayDebtModal('${x.debtId}')">🤝 ROZLICZ DŁUG</button>`;
                
                return `
                <div style="display:flex; flex-direction:column; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.03); opacity:${x.isPlanned?'0.7':'1'};">
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <div style="display:flex; align-items:center; gap:12px; flex:1;">
                            <div style="width:35px; height:35px; border-radius:50%; background:${cd.c}22; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0;">${cd.i}</div>
                            <div>
                                <span style="color:#fff; font-size:0.95rem; font-weight:600; display:flex; align-items:center; flex-wrap:wrap;">${catName}${planLbl}</span>
                                <small style="color:var(--muted); font-size:0.7rem; display:block; margin-top:2px;">${accName} ${x.d ? '• '+x.d : ''}</small>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <strong style="color:${isExp?'var(--danger)':(isTrans?'#fff':'var(--success)')}; white-space:nowrap;">${isExp?'-':(isTrans?'':'+')}${Number(v||0).toFixed(2)} zł</strong>
                            <div style="display:flex; gap:5px; margin-top:5px; justify-content:flex-end;">
                                <button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.hEditTrans('${x.id}')">✏️</button>
                                <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.hDelTrans('${x.id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                    ${payBtn}
                </div>`; 
            }).join(''); 
            
            return `<div class="date-group" style="margin-top:20px; display:flex; justify-content:space-between; font-weight:bold; font-size:0.85rem; color:var(--muted); text-transform:uppercase; padding:0 10px;"><span>${date}</span> <span><span style="color:var(--success)">+${Number(dayInc||0).toFixed(0)}</span> / <span style="color:var(--danger)">-${Number(dayExp||0).toFixed(0)}</span></span></div><div class="panel" style="margin-top:5px; padding:5px 15px; border-radius:12px;">${itemsHtml}</div>`; 
        }).join(''); 
        
        let filterButtons = `<div style="display:flex; gap:10px; padding: 10px 15px 15px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:10px;"><button onclick="window.hHistFilter='all'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:${window.hHistFilter==='all'?'rgba(255,255,255,0.1)':'transparent'}; color:#fff; font-size:0.8rem;">Wszystko</button><button onclick="window.hHistFilter='inc'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--success); background:${window.hHistFilter==='inc'?'rgba(34,197,94,0.1)':'transparent'}; color:var(--success); font-size:0.8rem;">Wpływy</button><button onclick="window.hHistFilter='exp'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--danger); background:${window.hHistFilter==='exp'?'rgba(239,68,68,0.1)':'transparent'}; color:var(--danger); font-size:0.8rem;">Wydatki</button></div>`;
        let monthNavHtml = `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px 20px; margin-bottom:10px;"><button style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px 15px; border-radius:8px; font-weight:bold;" onclick="window.hChangeMonth(-1)"><</button><strong style="text-transform:uppercase; color:var(--warning); font-size:1.1rem; letter-spacing:1px;">${mName}</strong><button style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px 15px; border-radius:8px; font-weight:bold;" onclick="window.hChangeMonth(1)">></button></div>`;
        let searchHtml = `<input type="text" placeholder="Szukaj transakcji (np. Biedronka, 150)..." style="background:#000; border:1px solid rgba(255,255,255,0.1); width:calc(100% - 30px); margin:0 15px 15px; padding:12px; border-radius:12px; color:#fff;" oninput="window.hSearchQuery=this.value; window.render();" value="${window.hSearchQuery}">`;
        
        APP.innerHTML = hdr + `<div class="dash-hero" style="padding-bottom:0;"><p>HISTORIA I KALENDARZ</p></div>${switchHtml}${monthNavHtml}${searchHtml}${filterButtons}${monthlySummaryHtml}<div style="padding:0 15px 30px;">${calHtml || '<div style="text-align:center; color:var(--muted); padding:30px;">Brak operacji.</div>'}</div>` + nav; 
    }
    
    // ==========================================
    // ZAKŁADKA: USTAWIENIA (SETTINGS)
    // ==========================================
    if(t === 'set') { 
        let catSrcSet = window.hRecType === 'exp' ? C_EXP : C_INC; 
        if(!catSrcSet[window.hRecCat]) window.hRecCat = Object.keys(catSrcSet)[0]; 
        let accOptionsSet = h.accs.map(a => `<option value="${a.id}">${a.n}</option>`).join(''); 
        
        let cloudStatusHtml = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) ? 
            `<div style="background:rgba(34,197,94,0.1); border:1px solid var(--success); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;"><strong style="color:var(--success); font-size:1.1rem;">☁️ Połączono z chmurą Google</strong><br><span style="font-size:0.8rem; color:var(--success); opacity:0.8;">Zalogowano jako: ${firebase.auth().currentUser.displayName || window.db.userName}</span></div>` : 
            `<div style="background:rgba(239,68,68,0.1); border:1px solid var(--danger); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;"><strong style="color:var(--danger); font-size:1.1rem;">🚫 Tryb Offline</strong><br><span style="font-size:0.8rem; color:var(--muted);">Dane zapisywane tylko na telefonie</span></div>`;

        let dataSecurityHtml = `
        <div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:10px;">💾 Status Konta i Bezpieczeństwo</div>
        ${cloudStatusHtml}
        <button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:15px; width:100%; margin-bottom:20px; font-weight:bold;" onclick="window.logoutToLauncher()">⚙️ WRÓĆ DO EKRANU STARTOWEGO</button>
        
        <div class="panel" style="border-color:var(--info);">
            <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Twoje dane są zapisane tylko w tym telefonie (100% Prywatności). Zrób kopię zapasową, aby przenieść profil na inne urządzenie lub zabezpieczyć się przed wyczyszczeniem przeglądarki!</p>
            <div style="display:flex; gap:10px;">
                <button class="btn" style="flex:1; background:rgba(255,255,255,0.05); color:var(--info); border:1px dashed var(--info); font-size:0.8rem; padding:12px; margin:0;" onclick="window.hExportData()">📥 POBIERZ PLIK</button>
                <button class="btn" style="flex:1; background:rgba(255,255,255,0.05); color:var(--danger); border:1px dashed var(--danger); font-size:0.8rem; padding:12px; margin:0;" onclick="window.hImportTrigger()">📤 PRZYWRÓĆ PLIK</button>
                <input type="file" id="h-import-file" style="display:none" accept=".json" onchange="window.hImportData(event)">
            </div>
        </div>`;

        APP.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:10px;"><p>USTAWIENIA BUDŻETU</p></div>
        ${dataSecurityHtml}
        <div class="section-lbl" style="color:var(--info); border-color:var(--info);">⚙️ Automatyzacja (Stałe Koszty i Wpływy)</div>
        <div class="panel" style="border-color:var(--info);">
            <p style="font-size:0.75rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Dodaj tu rachunki lub wpływy, a system sam doda je wybranego dnia każdego miesiąca!</p>
            <div class="mode-switch" style="background:rgba(0,0,0,0.5); margin-bottom:15px;">
                <div class="m-btn ${window.hRecType==='exp'?'active':''}" style="${window.hRecType==='exp'?'background:var(--danger);color:#fff;':''}" onclick="window.hRecType='exp';window.render()">WYDATEK</div>
                <div class="m-btn ${window.hRecType==='inc'?'active':''}" style="${window.hRecType==='inc'?'background:var(--success);color:#fff;':''}" onclick="window.hRecType='inc';window.render()">WPŁYW</div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Nazwa</label><input type="text" id="hr-name" placeholder="np. Czynsz" style="background:#000;"></div>
                <div class="inp-group"><label>Kwota</label><input type="number" id="hr-val" placeholder="np. 2000" style="background:#000;"></div>
            </div>
            <div class="inp-row" style="margin-bottom:10px;">
                <div class="inp-group" style="flex:2;"><label>Kategoria</label><select onchange="window.hRecCat=this.value" style="background:#000;">${Object.keys(catSrcSet).map(k => `<option value="${k}" ${window.hRecCat===k?'selected':''}>${k}</option>`).join('')}</select></div>
                <div class="inp-group" style="flex:1;"><label>Dzień m-ca</label><input type="number" id="hr-day" value="1" min="1" max="31" placeholder="1-31" style="background:#000;"></div>
            </div>
            <div class="inp-group" style="margin-bottom:15px;">
                <label>Konto docelowe</label>
                <select id="hr-acc" onchange="window.hRecAcc=this.value" style="background:#000;">${accOptionsSet}</select>
            </div>
            <button class="btn" style="background:var(--info); color:#fff; padding:15px; margin-bottom:20px;" onclick="window.hAddRecurring()">DODAJ DO AUTOMATU</button>
            <div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                <span style="font-size:0.75rem; color:var(--muted); font-weight:bold; text-transform:uppercase; margin-bottom:10px; display:block;">Twoje automaty (${h.recurring.length}):</span>
                ${h.recurring.map(r => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid ${r.t === 'exp' ? 'var(--danger)' : 'var(--success)'};">
                    <div>
                        <strong style="color:#fff; font-size:1rem;">${r.n}</strong>
                        <span style="font-size:0.7rem; color:var(--muted); display:block;">${r.c} <strong style="color:#fff;">(Dzień: ${r.day||1})</strong></span>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <strong style="color:${r.t === 'exp' ? 'var(--danger)' : 'var(--success)'};">${Number(r.v||0).toFixed(2)} zł</strong>
                        <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:6px 10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.hDelRecurring(${r.id})">USUŃ</button>
                    </div>
                </div>`).join('') || '<div style="color:var(--muted); font-size:0.8rem;">Brak skonfigurowanych automatów.</div>'}
            </div>
        </div>
        
        <div class="section-lbl" style="color:var(--life); border-color:var(--life);">👥 Członkowie Rodziny</div>
        <div class="panel" style="border-color:rgba(20,184,166,0.3);">
            <div class="inp-row">
                <div class="inp-group"><input type="text" id="h-new-mem" placeholder="Nowy domownik"></div>
                <button class="btn btn-home" style="width:auto; margin-top:0; padding: 0 20px;" onclick="window.hAddMem()">DODAJ</button>
            </div>
            <div style="margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                ${h.members.map(m => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--life);">
                    <strong style="color:#fff; font-size:1.1rem;">${m}</strong>
                    ${h.members.length > 1 ? `<button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.hDelMem('${m}')">USUŃ</button>` : `<span style="color:var(--muted); font-size:0.75rem;">(Główny)</span>`}
                </div>`).join('')}
            </div>
        </div>
        
        <div class="section-lbl" style="color:var(--plan); border-color:var(--plan);">🎯 Limity i Cele miesięczne</div>
        <div class="panel" style="border-color:var(--plan);">
            <div class="inp-group" style="margin-bottom:12px;">
                <label>Wybierz Kategorię do limitu</label>
                <select id="hb-cat">${Object.keys(C_EXP).map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Miesięczny Limit (zł)</label><input type="number" id="hb-val" placeholder="np. 500"></div>
            </div>
            <button class="btn" style="background:var(--plan); color:#fff; padding:15px;" onclick="window.hSetBudget()">USTAW LIMIT KATEGORII</button>
            <div style="margin-top:20px;">
                ${Object.keys(h.budgets || {}).map(k => { 
                    let limit = h.budgets[k]; 
                    let spent = 0; 
                    let now = new Date(); 
                    h.trans.forEach(x => { 
                        if(!x.isPlanned && x.type==='exp' && x.cat===k && new Date(x.rD).getMonth()===now.getMonth()) spent += parseFloat(x.v)||0; 
                    }); 
                    let pct = Math.min((spent / limit) * 100, 100); 
                    let color = pct > 90 ? 'var(--danger)' : (pct > 70 ? 'var(--warning)' : 'var(--success)'); 
                    return `
                    <div style="margin-bottom:15px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:5px;"><span>${k}</span><span style="color:${color}">Wydano: ${Number(spent||0).toFixed(2)} / ${limit} zł</span></div>
                        <div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;"><div style="width:${pct}%; background:${color}; height:100%;"></div></div>
                    </div>`; 
                }).join('')}
            </div>
        </div>
    
        <div class="section-lbl" style="color:#ffdd00; border-color:#ffdd00; margin-top:30px;">☕ Wsparcie projektu StyreOS</div>
        <div class="panel" style="border-color:rgba(255, 221, 0, 0.4); background: linear-gradient(145deg, #1a1a00, #09090b); text-align:center; padding:20px;">
            <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">
                Podoba Ci się StyreOS? Twoje wsparcie pomaga mi opłacać serwery map i rozwijać nowe funkcje. Każda "kawa" ma znaczenie!
            </p>
            <a href="https://buycoffee.to/styreos" target="_blank" style="background:#ffdd00; color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:15px; border-radius:12px; box-shadow: 0 4px 15px rgba(255, 221, 0, 0.2);">
                <span style="font-size:1.5rem;">☕</span> POSTAW MI KAWĘ
            </a>
        </div>

        <div class="section-lbl" style="color:var(--danger); border-color:var(--danger);">⚠️ Strefa Niebezpieczna</div>
        <div class="panel" style="border-color:rgba(239,68,68,0.4)">
            <button class="btn btn-danger" style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; box-shadow:none;" onclick="window.hardReset()">TWARDY RESET APLIKACJI</button>
        </div>
        ` + nav; 
    } 
};
