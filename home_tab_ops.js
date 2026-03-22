// ==========================================
// PLIK: home_tab_ops.js - Zakładki Przegląd, Dodaj, Wykresy, Historia
// ==========================================

// --- SZYBKIE PRZEŁĄCZANIE (BEZ RESETOWANIA EKRANU I KWOTY) ---
window.hSetCat = function(c, color) {
    window.hSelCat = c;
    document.querySelectorAll('.cat-item').forEach(el => {
        el.style.background = 'transparent'; 
        el.style.borderColor = 'transparent';
    });
    let el = document.getElementById('cat-item-' + c.replace(/[^a-zA-Z0-9]/g, ''));
    if(el) { 
        el.style.background = color + '22'; 
        el.style.borderColor = color; 
    }
    if(typeof window.hCheckLimit === 'function') window.hCheckLimit();
};

window.hSetAcc = function(varName, id, color) {
    window[varName] = id;
    document.querySelectorAll('.' + varName + '-item').forEach(el => {
        el.style.background = 'rgba(255,255,255,0.05)'; 
        el.style.borderColor = 'rgba(255,255,255,0.1)';
    });
    let el = document.getElementById(varName + '-item-' + id);
    if(el) { 
        el.style.background = color + '33'; 
        el.style.borderColor = color; 
    }
};

window.rHomeOps = function(h, t, nav, hdr) {
    // Zabezpieczenia danych
    let trs = h.trans || [];
    let accs = h.accs || [];
    let pigs = h.piggy || [];
    let mems = h.members || [];
    
    let balances = typeof window.hGetBal === 'function' ? window.hGetBal() : {}; 
    let globalBalance = Object.values(balances).reduce((a,b) => a+b, 0);
    let todayStr = typeof window.getLocalYMD === 'function' ? window.getLocalYMD() : new Date().toISOString().split('T')[0];

    // ==========================================
    // ZAKŁADKA: PRZEGLĄD (DASHBOARD)
    // ==========================================
    if(t === 'dash') {
        let now = new Date(); 
        let currExp = 0; 
        let currInc = 0; 
        let plannedSum = 0; 
        let dashCats = {};
        
        let accStats = {};
        accs.forEach(a => accStats[a.id] = { in: 0, out: 0 });
        
        trs.forEach(x => {
            if(!x.rD) return;
            let d = new Date(x.rD); 
            let v = parseFloat(x.v) || 0;
            if(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                if(!x.isPlanned) { 
                    if(x.type === 'exp') { 
                        currExp += v; 
                        dashCats[x.cat] = (dashCats[x.cat] || 0) + v; 
                        if(accStats[x.acc]) accStats[x.acc].out += v;
                    }
                    if(x.type === 'inc') {
                        currInc += v; 
                        if(accStats[x.acc]) accStats[x.acc].in += v;
                    }
                } else if (x.type === 'exp') { 
                    plannedSum += v; 
                }
            }
        });

        // STATYSTYKI KONT NA PULPICIE (Pulse)
        let accPulseHtml = `<div style="display:flex; gap:10px; overflow-x:auto; padding:15px 15px 5px;" class="hide-scroll">` + 
        accs.map(a => {
            let bal = parseFloat(balances[a.id]) || 0;
            let sIn = accStats[a.id] ? accStats[a.id].in : 0;
            let sOut = accStats[a.id] ? accStats[a.id].out : 0;
            return `<div onclick="window.switchTab('acc')" style="min-width:130px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px; cursor:pointer;">
                <div style="font-size:0.75rem; color:var(--muted); margin-bottom:5px; display:flex; align-items:center; gap:5px;"><span>${a.i || '💳'}</span> ${a.n || 'Konto'}</div>
                <strong style="color:#fff; font-size:1.1rem; display:block; margin-bottom:8px;">${Number(bal).toFixed(2)} zł</strong>
                <div style="display:flex; justify-content:space-between; font-size:0.65rem; border-top:1px dashed rgba(255,255,255,0.1); padding-top:6px;">
                    <span style="color:var(--success)">+${Number(sIn).toFixed(0)}</span>
                    <span style="color:var(--danger)">-${Number(sOut).toFixed(0)}</span>
                </div>
            </div>`;
        }).join('') + `</div>`;

        let limitAlertsHtml = '';
        if (h.budgets && Object.keys(h.budgets).length > 0) {
            Object.keys(h.budgets).forEach(k => {
                let limit = h.budgets[k];
                let spent = dashCats[k] || 0;
                let pct = limit > 0 ? (spent / limit) * 100 : 0;
                
                if (pct >= 75) {
                    let isDanger = pct >= 95;
                    let cTheme = isDanger ? 'var(--danger)' : 'var(--warning)';
                    let cBg = isDanger ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
                    let icon = isDanger ? '🚨' : '⚠️';
                    
                    limitAlertsHtml += `
                    <div style="margin: 15px 15px 0; background:${cBg}; border:1px solid ${cTheme}; padding:12px; border-radius:12px; display:flex; gap:12px; align-items:center;">
                        <div style="font-size:1.5rem;">${icon}</div>
                        <div style="flex:1;">
                            <strong style="color:${cTheme}; font-size:0.8rem; display:block; text-transform:uppercase; margin-bottom:4px;">Zbliżasz się do limitu (${k})</strong>
                            <div style="width:100%; height:4px; background:rgba(0,0,0,0.5); border-radius:2px; overflow:hidden;">
                                <div style="width:${Math.min(pct, 100)}%; background:${cTheme}; height:100%;"></div>
                            </div>
                        </div>
                    </div>`;
                }
            });
        }

        let topCatName = Object.keys(dashCats).sort((a,b) => dashCats[b] - dashCats[a])[0];
        let insightsHtml = '';
        
        if (currExp > 0 && limitAlertsHtml === '') { 
            insightsHtml = `
            <div style="background:rgba(139, 92, 246, 0.1); border:1px solid rgba(139, 92, 246, 0.3); padding:12px; border-radius:12px; margin: 15px 15px 0; text-align:left; display:flex; gap:12px; align-items:center; cursor:pointer;" onclick="window.switchTab('stats')">
                <div style="font-size:1.8rem;">💡</div>
                <div>
                    <strong style="color:var(--info); font-size:0.85rem; display:block;">Asystent StyreOS</strong>
                    <span style="color:var(--muted); font-size:0.75rem;">${topCatName ? `Najwięcej w tym miesiącu wydajesz na: <strong style="color:#fff">${topCatName}</strong>.` : 'Twoje finanse wyglądają stabilnie.'}</span>
                </div>
            </div>`; 
        }

        let miniPiggyHtml = '';
        if (pigs.length > 0) { 
            let p = pigs[0]; 
            let pct = p.target > 0 ? ((p.saved||0) / p.target) * 100 : 0; 
            if(pct > 100) pct = 100; 
            miniPiggyHtml = `
            <div style="margin: 15px 15px 0; padding:12px; background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.2); border-radius:12px; cursor:pointer;" onclick="window.switchTab('goals')">
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:5px;">
                    <span style="color:var(--muted);">Zbierasz na: <strong style="color:#fff;">${p.n || 'Cel'}</strong></span>
                    <span style="color:var(--success); font-weight:bold;">${Number(pct || 0).toFixed(0)}%</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                    <div style="width:${pct}%; background:var(--success); height:100%;"></div>
                </div>
            </div>`; 
        }

        let upcoming = trs.filter(x => x.isPlanned && x.type === 'exp').sort((a,b) => new Date(a.rD) - new Date(b.rD)).slice(0,3);
        let upcomingHtml = '';
        if(upcoming.length > 0) {
            upcomingHtml = `
            <div class="panel" style="margin:15px 15px 0; border-color:var(--warning); padding:15px;">
                <div class="p-title" style="color:var(--warning); margin-bottom:10px; font-size:0.85rem; text-transform:uppercase;">📅 Nadchodzące płatności</div>` + 
                upcoming.map(x => {
                    let targetTab = `window.hCalMode='planned'; window.switchTab('cal')`;
                    if(x.loanId) targetTab = `window.switchTab('goals')`;
                    return `<div onclick="${targetTab}" style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px; cursor:pointer;"><span style="color:#fff; font-size:0.85rem;">${x.d || x.cat} <span style="color:var(--muted); font-size:0.7rem;">(${x.dt || ''})</span></span><strong style="color:var(--danger);">${Number(x.v || 0).toFixed(2)} zł</strong></div>`;
                }).join('') + `</div>`;
        }

        let dashRecentTrans = trs.filter(x => !x.isPlanned).sort((a,b) => new Date(b.rD) - new Date(a.rD)).slice(0,8).map(x => { 
            let v = parseFloat(x.v) || 0; 
            let isExp = x.type === 'exp'; 
            let isTrans = x.type === 'transfer'; 
            let cd = isExp ? (window.C_EXP?.[x.cat] || {c:'#ef4444',i:'💸'}) : (isTrans ? {c:'#8b5cf6',i:'🔄'} : (window.C_INC?.[x.cat] || {c:'#22c55e',i:'💵'})); 
            
            let fAccObj = accs.find(a => a.id === x.fromAcc);
            let tAccObj = accs.find(a => a.id === x.toAcc);
            let regAccObj = accs.find(a => a.id === x.acc);
            
            let accName = isTrans ? `Z ${fAccObj ? fAccObj.n : 'Konta'} na ${tAccObj ? tAccObj.n : 'Konto'}` : (regAccObj ? regAccObj.n : 'Konto'); 
            let catName = isTrans ? 'Przelew' : (x.cat || 'Inne'); 
            let sign = isExp ? '-' : (isTrans ? '' : '+'); 
            let color = isExp ? 'var(--danger)' : (isTrans ? '#fff' : 'var(--success)'); 
            return `
            <div class="log-item" onclick="window.hCalMode='history'; window.switchTab('cal')" style="border:none; border-bottom:1px solid rgba(255,255,255,0.05); border-radius:0; margin-bottom:0; background:transparent; padding:15px 5px; flex-direction:column; align-items:stretch; cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    <div style="display:flex; align-items:center; gap:15px; flex:1;">
                        <div style="width:40px; height:40px; border-radius:50%; background:${cd.c}22; border:1px solid ${cd.c}55; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0;">${cd.i}</div>
                        <div><strong style="font-size:0.9rem; color:#fff; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${catName}</strong><small style="color:var(--muted); display:block; margin-top:4px;">${accName} • ${x.dt || ''}</small></div>
                    </div>
                    <div style="text-align:right;"><strong style="color:${color}; font-size:1rem; white-space:nowrap;">${sign}${Number(v || 0).toFixed(2)} zł</strong></div>
                </div>
            </div>`; 
        }).join('');

        if (!dashRecentTrans || dashRecentTrans === '') {
            dashRecentTrans = `
            <div style="background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); border-radius:16px; padding:30px 20px; text-align:center; margin-top:10px;">
                <div style="font-size:2.5rem; margin-bottom:10px;">💸</div>
                <strong style="color:#fff; font-size:1rem; display:block; margin-bottom:5px;">Tu pojawi się Twoja historia</strong>
                <button class="btn" style="background:rgba(20,184,166,0.15); color:var(--life); border:1px solid rgba(20,184,166,0.3); border-radius:10px; padding:10px 20px; font-size:0.8rem; font-weight:bold; box-shadow:none; width:auto;" onclick="window.switchTab('add')">+ DODAJ TRANSAKCJĘ</button>
            </div>`;
        }

        let safeBalance = globalBalance - plannedSum;
        let hideScrollStyle = `<style>.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }</style>`;
        
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + hideScrollStyle + `
            <div style="background: linear-gradient(180deg, rgba(20,184,166,0.15) 0%, var(--bg) 100%); padding: 30px 20px 15px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius:30px; border-bottom-right-radius:30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <p style="margin:0 0 5px 0; font-size:0.75rem; color:var(--muted); text-transform:uppercase; font-weight:bold; letter-spacing:1px;">Bezpieczne Saldo Netto</p>
                <h1 style="margin:0; font-size:2.8rem; font-weight:900; color:${safeBalance >= 0 ? '#fff' : 'var(--danger)'}; letter-spacing:-1px;">${Number(safeBalance || 0).toFixed(2)} zł</h1>
                
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
                    <div style="flex:1; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:12px; padding:10px; cursor:pointer;" onclick="window.hTempValue=''; window.hTransType='inc'; window.switchTab('add')">
                        <div style="color:var(--success); font-weight:bold; margin-bottom:5px; font-size:1rem;">+${Number(currInc || 0).toFixed(0)} zł</div>
                        <div style="color:var(--success); font-size:0.7rem; font-weight:bold; text-transform:uppercase;">💰 WPŁYW</div>
                    </div>
                    <div style="flex:1; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:12px; padding:10px; cursor:pointer;" onclick="window.hTempValue=''; window.hTransType='exp'; window.switchTab('add')">
                        <div style="color:var(--danger); font-weight:bold; margin-bottom:5px; font-size:1rem;">-${Number(currExp || 0).toFixed(0)} zł</div>
                        <div style="color:var(--danger); font-size:0.7rem; font-weight:bold; text-transform:uppercase;">💸 WYDATEK</div>
                    </div>
                </div>
            </div>
            
            ${accPulseHtml}
            ${limitAlertsHtml}
            ${insightsHtml}
            ${upcomingHtml}
            ${miniPiggyHtml}
            
            <div class="section-lbl" style="color:#fff; border-color:rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; margin-top:20px;">Ostatnie operacje</div>
            <div style="padding: 0 15px 30px;">
                ${dashRecentTrans}
            </div>
            <div style="padding-bottom:60px;"></div>
            ` + nav;
        }
    }

    // ==========================================
    // ZAKŁADKA: DODAWANIE TRANSAKCJI (ADD)
    // ==========================================
    if(t === 'add') { 
        let isExp = window.hTransType === 'exp'; 
        let isTrans = window.hTransType === 'transfer'; 
        let col = isExp ? 'var(--danger)' : (isTrans ? 'var(--info)' : 'var(--success)'); 
        let topBg = isExp ? 'var(--bg-exp)' : (isTrans ? 'linear-gradient(180deg, #0ea5e9 0%, #09090b 100%)' : 'var(--bg-inc)'); 
        let catSrc = isExp ? (window.C_EXP || {}) : (window.C_INC || {}); 
        
        if(!isTrans && (!window.hSelCat || !catSrc[window.hSelCat])) window.hSelCat = Object.keys(catSrc)[0] || ''; 
        if(!window.hSelAcc && accs.length > 0) window.hSelAcc = accs[0].id;
        if(!window.hSelAccFrom && accs.length > 0) window.hSelAccFrom = accs[0].id;
        if(!window.hSelAccTo && accs.length > 1) window.hSelAccTo = accs[1].id;

        let scanBtnHtml = `<div style="background:rgba(139, 92, 246, 0.1); color:#c084fc; border:1px dashed rgba(139, 92, 246, 0.3); border-radius:10px; padding:10px; margin-bottom:15px; display:flex; align-items:center; justify-content:center; gap:8px; font-size:0.8rem; font-weight:bold; cursor:pointer;" onclick="if(window.sysAlert) window.sysAlert('Funkcja PRO', 'Skanowanie paragonów wkrótce! 🚀', 'info')">📸 SKANUJ PARAGON (PRO)</div>`;

        let templates = [];
        if(!isTrans) {
            let counts = {};
            trs.filter(x => x.type === window.hTransType && !x.isPlanned).forEach(x => { 
                let key = x.d + '|' + x.cat; 
                if(!counts[key]) counts[key] = {n: x.d || x.cat, c: x.cat, v: parseFloat(x.v) || 0, cnt: 0}; 
                counts[key].cnt++; 
                counts[key].v = parseFloat(x.v) || 0; 
            });
            templates = Object.values(counts).sort((a,b) => b.cnt - a.cnt).slice(0,3).map(x => { 
                return {n: (x.n||'').substring(0,12), v: x.v, c: x.c, i: catSrc[x.c] ? catSrc[x.c].i : '💸'}; 
            });
            if(templates.length === 0) { 
                templates = isExp ? 
                [{n:'Kawa', v:15, c:'Jedzenie na mieście', i:'☕'}, {n:'Paliwo', v:150, c:'Auto i Transport', i:'⛽'}, {n:'Sklep', v:100, c:'Zakupy Spożywcze', i:'🛒'}] : 
                [{n:'Wypłata', v:4000, c:'Wypłata z Etatu', i:'💰'}]; 
            }
        }
        
        let tplHtml = !isTrans ? `<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:5px; margin-bottom:15px;" class="hide-scroll">${templates.map(tpl => `<div onclick="let vEl=document.getElementById('h-v'); if(vEl)vEl.value=${tpl.v}; let dEl=document.getElementById('h-d'); if(dEl)dEl.value='${tpl.n}'; window.hSetCat('${tpl.c}', '${catSrc[tpl.c]?catSrc[tpl.c].c:'#ccc'}');" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:6px 12px; display:flex; align-items:center; gap:6px; flex-shrink:0; cursor:pointer;"><span style="font-size:1rem;">${tpl.i}</span><span style="color:#fff; font-size:0.75rem;">${tpl.n}</span></div>`).join('')}</div>` : '';
        
        let accSlider = (selVar) => `<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:5px;" class="hide-scroll">${accs.map(a => { 
            let isActive = window[selVar] === a.id;
            let bg = isActive ? a.c+'33' : 'rgba(255,255,255,0.05)';
            let br = isActive ? a.c : 'rgba(255,255,255,0.1)';
            return `<div id="${selVar}-item-${a.id}" class="${selVar}-item" onclick="window.hSetAcc('${selVar}', '${a.id}', '${a.c}')" style="background:${bg}; border:1px solid ${br}; border-radius:10px; padding:8px 10px; min-width:90px; flex-shrink:0; text-align:center; cursor:pointer; transition:0.2s;"><div style="font-size:1.2rem; margin-bottom:2px;">${a.i || '💳'}</div><strong style="color:#fff; font-size:0.75rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.n}</strong></div>`; 
        }).join('')}</div>`;
        
        let gridHtml = !isTrans ? `<div class="cat-grid" style="grid-template-columns: repeat(4, 1fr); gap:6px;">` + Object.keys(catSrc).map(k => {
            let isActive = window.hSelCat === k;
            let bg = isActive ? catSrc[k].c+'22' : 'transparent';
            let br = isActive ? catSrc[k].c : 'transparent';
            let catId = k.replace(/[^a-zA-Z0-9]/g, '');
            return `<div id="cat-item-${catId}" class="cat-item" onclick="window.hSetCat('${k}', '${catSrc[k].c}')" style="padding:8px 4px; border:1px solid ${br}; background:${bg}; border-radius:8px; cursor:pointer; transition:0.2s;"><span class="cat-icon" style="font-size:1.3rem; margin-bottom:4px;">${catSrc[k].i}</span><span class="cat-lbl" style="font-size:0.6rem; line-height:1.1;">${k}</span></div>`;
        }).join('') + `</div>` : ''; 
        
        let memChips = mems.length > 1 ? `<div style="margin-bottom:15px;"><label style="font-size:0.65rem; color:var(--muted); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:6px;">Kto wykonuje?</label><div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:5px;" class="hide-scroll">` + mems.map(m => `<div class="chip ${window.hMem === m ? 'active' : ''}" style="padding:6px 12px; font-size:0.75rem; flex-shrink:0; ${window.hMem === m ? 'background:var(--life);color:#000;border-color:var(--life)' : 'color:var(--muted)'}" onclick="window.hMem='${m}'; let vEl=document.getElementById('h-v'); if(vEl)window.hTempValue=vEl.value; let dEl=document.getElementById('h-d'); if(dEl)window.hTempNote=dEl.value; window.render();">${m}</div>`).join('') + `</div></div>` : ''; 

        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `<style>.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }</style>` + `
            <div style="background: ${topBg}; padding: 15px 15px 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div class="mode-switch" style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); margin-bottom:10px;">
                    <div class="m-btn" style="${isExp?'background:var(--danger); color:#fff;':'color:var(--muted)';} padding:8px;" onclick="let vEl=document.getElementById('h-v'); if(vEl)window.hTempValue=vEl.value; let dEl=document.getElementById('h-d'); if(dEl)window.hTempNote=dEl.value; window.hTransType='exp';window.render()">WYDATEK</div>
                    <div class="m-btn" style="${!isExp&&!isTrans?'background:var(--success); color:#fff;':'color:var(--muted)';} padding:8px;" onclick="let vEl=document.getElementById('h-v'); if(vEl)window.hTempValue=vEl.value; let dEl=document.getElementById('h-d'); if(dEl)window.hTempNote=dEl.value; window.hTransType='inc';window.render()">WPŁYW</div>
                    <div class="m-btn" style="${isTrans?'background:var(--info); color:#fff;':'color:var(--muted)';} padding:8px;" onclick="let vEl=document.getElementById('h-v'); if(vEl)window.hTempValue=vEl.value; let dEl=document.getElementById('h-d'); if(dEl)window.hTempNote=dEl.value; window.hTransType='transfer';window.render()">TRANSFER</div>
                </div>
                <div style="text-align:center; padding: 0 0 5px;">
                    <div style="display:flex; justify-content:center; align-items:center; gap:5px;">
                        <input type="number" id="h-v" oninput="if(typeof window.hCheckLimit === 'function') window.hCheckLimit()" value="${window.hTempValue || ''}" style="background:transparent; border:none; border-bottom:2px solid #fff; color:#fff; font-size:3rem!important; font-weight:900; text-align:center; width:160px; padding:0; outline:none;" placeholder="0">
                        <span style="font-size:1.5rem; font-weight:900; color:#fff;">zł</span>
                    </div>
                    <div id="h-warn-limit" style="display:none; color:var(--warning); font-size:0.7rem; font-weight:bold; margin-top:5px; background:rgba(245,158,11,0.15); padding:6px; border-radius:8px; border:1px solid rgba(245,158,11,0.3);"></div>
                </div>
            </div>
            <div style="padding: 15px;">
                ${scanBtnHtml}
                ${tplHtml}
                ${memChips}
                ${isTrans ? `
                <div style="margin-bottom:15px;"><label style="font-size:0.65rem; color:var(--danger); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:6px;">Z Konta (Wypływ)</label>${accSlider('hSelAccFrom')}</div>
                <div style="margin-bottom:15px;"><label style="font-size:0.65rem; color:var(--success); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:6px;">Na Konto (Wpływ)</label>${accSlider('hSelAccTo')}</div>
                ` : `
                <div style="margin-bottom:15px;"><label style="font-size:0.65rem; color:var(--life); font-weight:bold; text-transform:uppercase; display:block; margin-bottom:6px;">Wybierz Konto</label>${accSlider('hSelAcc')}</div>
                <div style="margin-bottom:10px;"><label style="font-size:0.65rem; color:var(--muted); font-weight:bold; text-transform:uppercase; margin-bottom:6px; display:block;">Kategoria</label>${gridHtml}</div>
                `}
                <div class="inp-group" style="margin-bottom:15px;"><input type="text" id="h-d" value="${window.hTempNote || ''}" placeholder="Notatka (Opcjonalnie)" style="background:rgba(255,255,255,0.05); padding:12px; font-size:0.85rem;"></div>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <div class="inp-group" style="flex:1;"><label style="font-size:0.65rem;">Data</label><input type="date" id="h-date" value="${todayStr}" style="background:rgba(255,255,255,0.05); padding:10px; font-size:0.8rem;"></div>
                    ${!isTrans ? `<div class="inp-group" style="flex:1;"><label style="font-size:0.65rem;">Powtarzaj</label><select id="h-recurring" style="background:rgba(255,255,255,0.05); padding:10px; font-size:0.8rem;"><option value="none">Nie</option><option value="month">Co miesiąc 🔄</option></select></div>` : ''}
                </div>
                <button class="btn" style="background:${col}; color:#fff; font-size:1rem; font-weight:900; padding:15px; box-shadow:0 8px 15px ${col}44;" onclick="if(window.hTransType==='inc' && typeof window.shootConfetti === 'function') window.shootConfetti(); if(typeof window.hAction === 'function') window.hAction(); window.hTempValue=''; window.hTempNote='';">${isTrans?'WYKONAJ PRZELEW':'ZAPISZ TRANSAKCJĘ'}</button>
            </div>
            <div style="padding-bottom:60px;"></div>` + nav; 
        }
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
        
        trs.forEach(x => { 
            if(!x.rD) return;
            let d = new Date(x.rD); 
            let v = parseFloat(x.v) || 0; 
            if(!x.isPlanned && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) { 
                if(x.type === 'exp') { 
                    if(!cats[x.cat]) cats[x.cat] = 0; 
                    cats[x.cat] += v; 
                    sumExp += v; 
                    if(window.FIXED_EXP_CATS && window.FIXED_EXP_CATS.includes(x.cat)) sumFixed += v; 
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
        let cColors = sortedCats.map(k => window.C_EXP?.[k]?.c || '#8b5cf6'); 
        
        let catListHtml = sortedCats.map((lbl, idx) => { 
            let val = cData[idx]; 
            let pct = sumExp > 0 ? ((val / sumExp) * 100).toFixed(0) : 0; 
            let color = cColors[idx]; 
            let icon = window.C_EXP?.[lbl]?.i || '📦'; 
            return `<div class="cat-list-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><div style="display:flex; align-items:center;"><div style="width:30px; height:30px; border-radius:50%; background:${color}22; display:flex; align-items:center; justify-content:center; margin-right:12px; font-size:1rem; border:1px solid ${color}55;">${icon}</div><span style="font-weight:bold;">${lbl}</span></div><div style="display:flex; align-items:center;"><span style="color:var(--muted);font-size:0.8rem;margin-right:10px;">${pct}%</span><span style="color:${color};font-weight:bold;">-${Number(val||0).toFixed(2)} zł</span></div></div>`; 
        }).join(''); 
        
        let sortedIncCats = Object.keys(incCats).sort((a,b) => incCats[b] - incCats[a]); 
        let incLabels = sortedIncCats; 
        let incData = sortedIncCats.map(k => incCats[k]); 
        let incColors = sortedIncCats.map(k => window.C_INC?.[k]?.c || '#22c55e'); 
        
        let incListHtml = sortedIncCats.map((lbl, idx) => { 
            let val = incData[idx]; 
            let pct = sumInc > 0 ? ((val / sumInc) * 100).toFixed(0) : 0; 
            let color = incColors[idx]; 
            let icon = window.C_INC?.[lbl]?.i || '💰'; 
            return `<div class="cat-list-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><div style="display:flex; align-items:center;"><div style="width:30px; height:30px; border-radius:50%; background:${color}22; display:flex; align-items:center; justify-content:center; margin-right:12px; font-size:1rem; border:1px solid ${color}55;">${icon}</div><span style="font-weight:bold;">${lbl}</span></div><div style="display:flex; align-items:center;"><span style="color:var(--muted);font-size:0.8rem;margin-right:10px;">${pct}%</span><span style="color:${color};font-weight:bold;">+${Number(val||0).toFixed(2)} zł</span></div></div>`; 
        }).join(''); 
        
        let bilans = sumInc - sumExp; 
        let mapBtnHtml = `<button class="btn" style="background:rgba(14, 165, 233, 0.15); color:var(--info); border:1px dashed rgba(14, 165, 233, 0.4); border-radius:12px; font-weight:bold; padding:12px; margin-bottom:20px; display:flex; align-items:center; justify-content:center; gap:10px; width:100%;" onclick="if(window.sysAlert) window.sysAlert('Funkcja PRO', 'Mapa Finansów (Geotagowanie wydatków i nawigacja Google Maps) będzie wkrótce dostępna w wersji StyreOS PRO! 🗺️', 'info')"><span style="font-size:1.1rem;">📍</span> POKAŻ WYDATKI NA MAPIE (Wkrótce PRO)</button>`;

        let expEmptyHtml = sumExp === 0 ? `
            <div style="text-align:center; padding:30px 10px;">
                <div style="font-size:3rem; margin-bottom:10px;">📊</div>
                <strong style="color:var(--danger); font-size:1.1rem; display:block; margin-bottom:5px;">Brak danych do analizy</strong>
                <span style="color:var(--muted); font-size:0.85rem; display:block; margin-bottom:20px;">Zacznij notować wydatki, aby wygenerować wykresy.</span>
                <div style="background:linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(14, 165, 233, 0.1)); border:1px dashed rgba(139, 92, 246, 0.4); padding:12px; border-radius:12px; cursor:pointer;" onclick="if(window.sysAlert) window.sysAlert('Auto-Kategoryzacja AI', 'W wersji PRO podepniesz swój bank i Sztuczna Inteligencja sama wygeneruje te wykresy! 🤖', 'info')">
                    <span style="color:#c084fc; font-weight:bold; font-size:0.8rem;">🤖 Wkrótce PRO: AI samo uzupełni wykresy!</span>
                </div>
            </div>` : '';
            
        let incEmptyHtml = sumInc === 0 ? `
            <div style="text-align:center; padding:20px 10px;">
                <span style="color:var(--muted); font-size:0.85rem; display:block;">Brak zarejestrowanych wpływów w tym miesiącu.</span>
            </div>` : '';

        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `
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
                ${sumInc > 0 ? `<div style="height:200px; position:relative; margin-bottom:20px;"><canvas id="h-chart-inc"></canvas></div>` : incEmptyHtml}
                ${sumInc > 0 ? `<div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">${incListHtml}</div>` : ''}
            </div>
            
            <div class="panel" style="padding: 20px; border-color:rgba(239, 68, 68, 0.4);">
                <div class="p-title" style="color:var(--danger)">Struktura Kosztów Zmiennych</div>
                ${sumExp > 0 ? `<div style="height:250px; position:relative; margin-bottom:20px;"><canvas id="h-chart"></canvas></div>` : expEmptyHtml}
                ${sumExp > 0 ? `<div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">${catListHtml}</div>` : ''}
            </div>
            <div style="padding-bottom:60px;"></div>` + nav; 
            
            if(sumExp > 0 && window.Chart) { 
                setTimeout(() => { 
                    if(window.hCh) window.hCh.destroy(); 
                    let ctx = document.getElementById('h-chart').getContext('2d'); 
                    window.hCh = new Chart(ctx, { type: 'doughnut', data: { labels: cLabels, datasets: [{ data: cData, backgroundColor: cColors, borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%', layout: {padding: 10} } }); 
                }, 100); 
            } 
            if(sumInc > 0 && window.Chart) { 
                setTimeout(() => { 
                    if(window.hChInc) window.hChInc.destroy(); 
                    let ctx2 = document.getElementById('h-chart-inc').getContext('2d'); 
                    window.hChInc = new Chart(ctx2, { type: 'doughnut', data: { labels: incLabels, datasets: [{ data: incData, backgroundColor: incColors, borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%', layout: {padding: 10} } }); 
                }, 100); 
            } 
        }
    } 
    
    // ==========================================
    // ZAKŁADKA: KALENDARZ (CALENDAR/HISTORY)
    // ==========================================
    if(t === 'cal') { 
        let isPlannedMode = window.hCalMode === 'planned'; 
        let switchHtml = `<div class="mode-switch" style="margin: 15px 15px 5px 15px;"><div class="m-btn ${!isPlannedMode?'active':''}" style="${!isPlannedMode?'background:var(--success);color:#000;':''}" onclick="window.hCalMode='history'; window.render()">📅 Zrealizowane</div><div class="m-btn ${isPlannedMode?'active':''}" style="${isPlannedMode?'background:var(--warning);color:#000;':''}" onclick="window.hCalMode='planned'; window.render()">⏳ Planowane</div></div>`;
        if(!window.hViewDate) window.hViewDate = new Date();
        let viewM = window.hViewDate.getMonth(); 
        let viewY = window.hViewDate.getFullYear(); 
        let mName = window.hViewDate.toLocaleDateString('pl-PL', {month:'long', year:'numeric'}).toUpperCase();
        
        let filteredTrans = trs.filter(x => { 
            if(!x.rD) return false;
            let d = new Date(x.rD); 
            return d.getMonth() === viewM && d.getFullYear() === viewY && (isPlannedMode ? x.isPlanned : !x.isPlanned); 
        });
        
        if(window.hHistFilter === 'inc') filteredTrans = filteredTrans.filter(x => x.type === 'inc'); 
        if(window.hHistFilter === 'exp') filteredTrans = filteredTrans.filter(x => x.type === 'exp');
        if(window.hSearchQuery) { 
            let q = window.hSearchQuery.toLowerCase(); 
            filteredTrans = filteredTrans.filter(x => ((x.d || '').toLowerCase().includes(q) || (x.cat || '').toLowerCase().includes(q) || (x.v || '').toString().includes(q))); 
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
        filteredTrans.sort((a,b) => {
            let dA = new Date(a.rD || 0); let dB = new Date(b.rD || 0);
            return isPlannedMode ? dA - dB : dB - dA;
        }).forEach(x => { 
            let dtKey = x.dt || 'Brak daty';
            if(!groups[dtKey]) groups[dtKey] = []; 
            groups[dtKey].push(x); 
        }); 
        
        let calHtml = Object.keys(groups).map(date => { 
            let dayTrans = groups[date]; 
            let dayExp = dayTrans.filter(x=>x.type==='exp').reduce((a,b)=>a+(parseFloat(b.v)||0), 0); 
            let dayInc = dayTrans.filter(x=>x.type==='inc').reduce((a,b)=>a+(parseFloat(b.v)||0), 0); 
            
            let itemsHtml = dayTrans.map(x => { 
                let v = parseFloat(x.v) || 0; 
                let isExp = x.type === 'exp'; 
                let isTrans = x.type === 'transfer'; 
                let cd = isExp ? (window.C_EXP?.[x.cat] || {c:'#ef4444',i:'💸'}) : (isTrans ? {c:'#8b5cf6',i:'🔄'} : (window.C_INC?.[x.cat] || {c:'#22c55e',i:'💵'})); 
                
                let fAccObj = accs.find(a => a.id === x.fromAcc);
                let tAccObj = accs.find(a => a.id === x.toAcc);
                let regAccObj = accs.find(a => a.id === x.acc);
                
                let accName = isTrans ? `Z ${fAccObj ? fAccObj.n : 'Konta'} na ${tAccObj ? tAccObj.n : 'Konto'}` : (regAccObj ? regAccObj.n : 'Konto'); 
                
                let catName = isTrans ? 'Przelew' : (x.cat || 'Inne'); 
                let planLbl = x.isPlanned ? `<span style="color:var(--warning); font-size:0.6rem; margin-left:5px;">(PLAN)</span>` : ''; 
                
                let payBtn = ''; 
                if(x.isPlanned && x.loanId) payBtn = `<button style="background:rgba(34,197,94,0.2); color:var(--success); border:1px solid var(--success); border-radius:8px; padding:6px 12px; font-size:0.75rem; font-weight:bold; cursor:pointer; width:100%; margin-top:8px;" onclick="if(typeof window.hOpenPayLoanModal==='function') window.hOpenPayLoanModal('${x.loanId}', '${x.id}')">💸 ZAKSIĘGUJ PŁATNOŚĆ / ODBIÓR</button>`; 
                
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
                                <button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="if(typeof window.hEditTrans==='function') window.hEditTrans('${x.id}')">✏️</button>
                                <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="if(typeof window.hDelTrans==='function') window.hDelTrans('${x.id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                    ${payBtn}
                </div>`; 
            }).join(''); 
            
            return `<div class="date-group" style="margin-top:20px; display:flex; justify-content:space-between; font-weight:bold; font-size:0.85rem; color:var(--muted); text-transform:uppercase; padding:0 10px;"><span>${date}</span> <span><span style="color:var(--success)">+${Number(dayInc||0).toFixed(0)}</span> / <span style="color:var(--danger)">-${Number(dayExp||0).toFixed(0)}</span></span></div><div class="panel" style="margin-top:5px; padding:5px 15px; border-radius:12px;">${itemsHtml}</div>`; 
        }).join(''); 
        
        if(!calHtml || calHtml === '') {
            calHtml = `
            <div style="text-align:center; padding:40px 20px;">
                <div style="font-size:3.5rem; margin-bottom:15px;">📝</div>
                <strong style="color:#fff; font-size:1.1rem; display:block; margin-bottom:5px;">Czysta karta</strong>
                <span style="color:var(--muted); font-size:0.85rem; display:block; margin-bottom:20px;">Twój kalendarz czeka na pierwsze operacje.</span>
                <div style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.1); padding:15px; border-radius:12px; display:inline-block; text-align:left; cursor:pointer;" onclick="if(window.sysAlert) window.sysAlert('Funkcja PRO', 'Inteligentne skanowanie paragonów automatycznie sczyta daty z Twoich zakupów! Wkrótce dostępne. 🚀', 'info')">
                    <span style="color:var(--info); font-size:0.75rem; font-weight:bold; display:block; margin-bottom:5px;">🚀 Wkrótce w StyreOS PRO:</span>
                    <span style="color:var(--muted); font-size:0.75rem;">Skaner paragonów sam odczyta datę i kwotę!</span>
                </div>
            </div>`;
        }

        let filterButtons = `<div style="display:flex; gap:10px; padding: 10px 15px 15px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:10px;"><button onclick="window.hHistFilter='all'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:${window.hHistFilter==='all'?'rgba(255,255,255,0.1)':'transparent'}; color:#fff; font-size:0.8rem;">Wszystko</button><button onclick="window.hHistFilter='inc'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--success); background:${window.hHistFilter==='inc'?'rgba(34,197,94,0.1)':'transparent'}; color:var(--success); font-size:0.8rem;">Wpływy</button><button onclick="window.hHistFilter='exp'; window.render()" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--danger); background:${window.hHistFilter==='exp'?'rgba(239,68,68,0.1)':'transparent'}; color:var(--danger); font-size:0.8rem;">Wydatki</button></div>`;
        let monthNavHtml = `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px 20px; margin-bottom:10px;"><button style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px 15px; border-radius:8px; font-weight:bold;" onclick="if(typeof window.hChangeMonth==='function') window.hChangeMonth(-1)"><</button><strong style="text-transform:uppercase; color:var(--warning); font-size:1.1rem; letter-spacing:1px;">${mName}</strong><button style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px 15px; border-radius:8px; font-weight:bold;" onclick="if(typeof window.hChangeMonth==='function') window.hChangeMonth(1)">></button></div>`;
        let searchHtml = `<input type="text" placeholder="Szukaj transakcji..." style="background:#000; border:1px solid rgba(255,255,255,0.1); width:calc(100% - 30px); margin:0 15px 15px; padding:12px; border-radius:12px; color:#fff;" oninput="window.hSearchQuery=this.value; window.render();" value="${window.hSearchQuery || ''}">`;
        
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `<div class="dash-hero" style="padding-bottom:0;"><p>HISTORIA I KALENDARZ</p></div>${switchHtml}${monthNavHtml}${searchHtml}${filterButtons}${monthlySummaryHtml}<div style="padding:0 15px 60px;">${calHtml}</div>` + nav; 
        }
    }
};
