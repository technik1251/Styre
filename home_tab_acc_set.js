// ==========================================
// PLIK: home_tab_acc_set.js - Zakładki Konta i Ustawienia
// ==========================================

window.rHomeAccSet = function(h, t, nav, hdr) {
    let balances = window.hGetBal(); 

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
        <div style="margin: 20px 0 10px; padding: 15px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(14, 165, 233, 0.1)); border: 1px dashed rgba(139, 92, 246, 0.4); border-radius: 16px; cursor: pointer; text-align: center; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1); transition: 0.3s;" onclick="window.sysAlert('Open Banking & AI (PRO)', 'W wersji StyreOS PRO połączysz aplikację bezpośrednio ze swoim bankiem (np. mBank, Revolut). Algorytmy AI same rozpoznają, że płatność w Żabce to Zakupy, a na Orlenie to Paliwo, i same wrzucą je do statystyk! 🏦🤖', 'info')">
            <div style="font-size: 1.8rem; margin-bottom: 5px;">🔗</div>
            <strong style="color: #c084fc; font-size: 0.95rem; display: block; text-transform: uppercase;">Automatyczna Synchronizacja z Bankiem</strong>
            <span style="font-size: 0.75rem; color: var(--muted); margin-top: 4px; display: block;">Sztuczna inteligencja i Open Banking same skategoryzują Twoje wydatki (np. Żabka ➔ Zakupy). Wkrótce w wersji PRO! Kliknij po szczegóły.</span>
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

        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `
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

        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `
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
    } 
};
