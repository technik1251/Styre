// ==========================================
// PLIK: home_tab_goals.js - Zakładka Zobowiązania (Kredyty, BNPL, Cele)
// ==========================================

window.rHomeGoals = function(h, t, nav, hdr) {
    let activeLoans = h.loans.filter(l => !l.isClosed && l.type !== 'Karta');
    let isCompact = window.hForceCompact !== undefined ? window.hForceCompact : (activeLoans.length > 1);
    
    let sumBanki = 0; let sumBNPL = 0; let sumPrywInc = 0; let sumPrywExp = 0;
    let sumBankiRaty = 0;
    let maxMonths = 0;
    
    let dzis = new Date();

    activeLoans.forEach(l => { 
        let k = parseFloat(l.kapital) || 0;
        let bor = parseFloat(l.borrowed) || k;
        let r = parseFloat(l.rata) || 0;

        if(l.type === 'Kredyt' || l.type === 'Leasing') {
            sumBanki += k;
            sumBankiRaty += r;
        }
        else if(l.type === 'PayPo') {
            let dataZakupu = new Date(l.startDate || window.getLocalYMD().substring(0,10));
            let roznicaMs = dzis.getTime() - dataZakupu.getTime();
            let dniOdZakupu = Math.floor(roznicaMs / (1000 * 60 * 60 * 24));
            
            if (dniOdZakupu > 30 || parseInt(l.installmentsLeft) < parseInt(l.totalInst) || parseInt(l.totalInst) > 1) {
                sumBNPL += k; 
            } else {
                let paidCount = parseInt(l.totalInst) - parseInt(l.installmentsLeft);
                let splaconyKapitalJuz = paidCount * r;
                let doZaplaty = bor - splaconyKapitalJuz;
                sumBNPL += Math.max(0, doZaplaty); 
            }
        }
        else if(l.type === 'Prywatny_WPLYW') sumPrywInc += k;
        else if(l.type === 'Prywatny_WYDATEK') sumPrywExp += k;
        
        let m = parseInt(l.installmentsLeft) || 0; 
        if(m > maxMonths) maxMonths = m; 
    });
    
    let bilansPryw = sumPrywInc - sumPrywExp;
    let bilansColor = bilansPryw >= 0 ? 'var(--success)' : 'var(--danger)';
    let bilansStr = bilansPryw >= 0 ? `+${bilansPryw.toFixed(2)}` : `${bilansPryw.toFixed(2)}`;
    
    let freedomDate = new Date(); 
    freedomDate.setMonth(freedomDate.getMonth() + maxMonths);
    let freedomStr = sumBanki > 0 ? freedomDate.toLocaleDateString('pl-PL', {month:'long', year:'numeric'}) : 'Jesteś wolny!';
    
    let toggleHtml = activeLoans.length > 0 ? 
        `<div style="display:flex; justify-content:flex-end; padding:0 15px 10px;">
            <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; display:flex; padding:3px;">
                <button onclick="window.hForceCompact=false; window.render()" style="background:${!isCompact?'rgba(255,255,255,0.1)':'transparent'}; color:${!isCompact?'#fff':'var(--muted)'}; border:none; padding:5px 10px; border-radius:6px; font-size:0.7rem; cursor:pointer;">Szczegóły</button>
                <button onclick="window.hForceCompact=true; window.render()" style="background:${isCompact?'rgba(255,255,255,0.1)':'transparent'}; color:${isCompact?'#fff':'var(--muted)'}; border:none; padding:5px 10px; border-radius:6px; font-size:0.7rem; cursor:pointer;">Kompakt</button>
            </div>
        </div>` : '';

    let topSummaryHtml = `
        <div style="margin: 0 15px 15px; border:1px solid var(--danger); border-radius:16px; padding:20px; background:linear-gradient(145deg, rgba(239,68,68,0.05), #09090b);">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                <div>
                    <span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase;">Zadłużenie Kredytowe</span><br>
                    <strong style="color:var(--danger); font-size:1.6rem;">${Number(sumBanki).toFixed(2)} zł</strong>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase;">Miesięczne Raty</span><br>
                    <strong style="color:#fff; font-size:1.2rem;">${Number(sumBankiRaty).toFixed(2)} zł</strong>
                </div>
            </div>
            <div style="background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.3); border-radius:10px; padding:10px; display:flex; align-items:center; gap:10px;">
                <div style="font-size:1.2rem;">🕊️</div>
                <div>
                    <span style="font-size:0.65rem; color:var(--success); text-transform:uppercase;">Wolność Finansowa</span><br>
                    <strong style="color:#fff; font-size:0.85rem;">Wolny od rat bankowych: <span style="color:var(--success)">${freedomStr}</span></strong>
                </div>
            </div>
        </div>
        
        <div style="display:flex; gap:10px; padding:0 15px 15px; overflow-x:auto;">
            <div style="flex:1; min-width:140px; background:rgba(14,165,233,0.05); border:1px solid rgba(14,165,233,0.3); padding:12px; border-radius:12px;">
                <span style="font-size:0.65rem; color:var(--info); text-transform:uppercase;">🛍️ Odroczone / BNPL</span><br>
                <strong style="color:#fff; font-size:1.2rem;">${Number(sumBNPL).toFixed(2)} zł</strong>
            </div>
            <div style="flex:1; min-width:140px; background:${bilansPryw >= 0 ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)'}; border:1px solid ${bilansColor}; padding:12px; border-radius:12px;">
                <span style="font-size:0.65rem; color:${bilansColor}; text-transform:uppercase;">🤝 Prywatne (Bilans)</span><br>
                <strong style="color:#fff; font-size:1.2rem;">${bilansStr} zł</strong>
            </div>
        </div>`;

    let loansHtml = '';
    let hideScrollStyle = `<style>.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }</style>`;

    if (activeLoans.length === 0) { 
        loansHtml = '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px 0 30px;">Brak zobowiązań. Twój profil jest czysty! 🕊️</div>'; 
    } else {
        let mappedLoans = activeLoans.map(l => {
            let isBNPL = l.type === 'PayPo';
            let isPrywInc = l.type === 'Prywatny_WPLYW';
            let isPrywExp = l.type === 'Prywatny_WYDATEK';
            let isPryw = isPrywInc || isPrywExp;
            let isKredyt = l.type === 'Kredyt' || l.type === 'Leasing';
            
            let cIcon = isBNPL ? '🛍️' : (isPrywInc ? '📥' : (isPrywExp ? '📤' : (l.type === 'Leasing' ? '🚗' : '🏦')));
            let cTheme = isBNPL ? 'var(--info)' : (isPrywInc ? 'var(--success)' : 'var(--danger)');
            let cBg = isBNPL ? 'rgba(14,165,233,0.1)' : (isPrywInc ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)');
            let cBorder = isBNPL ? 'rgba(14,165,233,0.3)' : (isPrywInc ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)');
            
            let kap = parseFloat(l.kapital) || 0; 
            let bor = parseFloat(l.borrowed) || kap; 
            let rat = parseFloat(l.rata) || 0; 
            let instL = parseInt(l.installmentsLeft) || 0; 
            let totInst = parseInt(l.totalInst) || instL; 
            if(totInst < instL) totInst = instL;
            
            let pctBank = parseFloat(l.pct) || 0; 
            let detailsHtml = '';
            let pct = 0;
            
            let savingsMsg = '';
            let savingsColor = 'var(--success)';

            let valToPayText = kap;
            let valToPayLbl = isPryw ? 'DO SPŁATY NA DZIŚ' : 'KAPITAŁ DO SPŁATY';
            let bnplAlert = '';

            let paidCount = totInst - instL;
            let splaconyKapitalJuz = paidCount * rat;

            if (isKredyt) {
                let totalCostRemaining = rat * instL; 
                let oszczednosc = totalCostRemaining - kap;
                if (oszczednosc > 0 && rat > 0 && kap > 0) {
                    savingsMsg = `Spłacając dziś, unikasz ${Number(oszczednosc).toFixed(2)} zł odsetek! 💸`;
                    savingsColor = 'var(--success)';
                }
            } else if (isBNPL) {
                let dataZakupu = new Date(l.startDate || window.getLocalYMD().substring(0,10));
                let roznicaMs = dzis.getTime() - dataZakupu.getTime();
                let dniOdZakupu = Math.floor(roznicaMs / (1000 * 60 * 60 * 24));

                if (dniOdZakupu <= 30 && instL === totInst && totInst <= 1) {
                    valToPayText = bor - splaconyKapitalJuz; 
                    if(valToPayText < 0) valToPayText = 0;
                    valToPayLbl = 'WARTOŚĆ ZAKUPU / ZADŁUŻENIE';
                    
                    let oszczednoscDnia = (rat * instL) - valToPayText; 
                    if(oszczednoscDnia > 0) {
                        savingsMsg = `Spłacając dziś, unikasz ${Number(oszczednoscDnia).toFixed(2)} zł opłat! 🛍️`;
                        savingsColor = 'var(--info)';
                    } else {
                        savingsMsg = `Spłać do 30 dni, by ominąć prowizję! 🛡️`;
                        savingsColor = 'var(--success)';
                    }
                    bnplAlert = `<div style="color:var(--success); font-size:0.75rem; font-weight:bold; margin-top:5px;">Trwa okres darmowy (Zostało ${30 - dniOdZakupu} dni) ⏳</div>`;
                } else {
                    valToPayText = kap; 
                    valToPayLbl = 'ZADŁUŻENIE (KOSZYK + PROWIZJA)';
                    
                    let doZaplatyNatychmiast = bor - splaconyKapitalJuz;
                    if(doZaplatyNatychmiast < 0) doZaplatyNatychmiast = 0;
                    let oszczednoscDnia = (rat * instL) - doZaplatyNatychmiast; 
                    
                    if(oszczednoscDnia > 0) {
                        savingsMsg = `Spłacając dziś całość, unikasz opłat! 🛍️`;
                        savingsColor = 'var(--info)';
                    }
                    bnplAlert = `<div style="color:var(--danger); font-size:0.75rem; font-weight:bold; margin-top:5px;">Minęło 30 dni lub rozłożono. Doliczono koszty operatora. ⚠️</div>`;
                }
            }

            let savingsHtmlCompact = savingsMsg ? `<div style="font-size:0.75rem; color:${savingsColor}; font-weight:bold; margin-bottom:8px;">${savingsMsg}</div>` : '';
            let savingsHtmlDetailed = savingsMsg ? `<div style="margin-top:5px; font-size:0.85rem; font-weight:bold; color:${savingsColor};">${savingsMsg}</div>` : '';
            
            // =====================================
            // OBLICZANIE DAT (SZTYWNE OFFSETY PAYPO)
            // =====================================
            let nextDateStr = '--';
            let baseNextD = new Date();
            if (paidCount < 0) paidCount = 0;

            if (instL <= 0) {
                nextDateStr = 'Spłacone 🎉';
            } else if (isBNPL) {
                // LOGIKA PAYPO: Dokładne przesunięcia w dniach dla każdej raty od daty zakupu
                let offsets = [31, 61, 91, 120];
                let offset = offsets[paidCount] || (30 * (paidCount + 1));
                
                let stD = new Date(l.startDate || new Date());
                stD.setHours(12, 0, 0, 0);
                stD.setDate(stD.getDate() + offset); 
                nextDateStr = stD.toLocaleDateString('pl-PL', {day:'2-digit', month:'2-digit', year:'numeric'});
                baseNextD = stD;
            } else if (isKredyt || (isPryw && l.prywMode === 'equal')) {
                // KREDYTY: Sztywny dzień miesiąca
                let stD = new Date(l.startDate || new Date());
                let payDay = l.day || 10;
                baseNextD = new Date(stD.getFullYear(), stD.getMonth(), payDay);
                if (stD.getDate() > payDay) { baseNextD.setMonth(baseNextD.getMonth() + 1); }
                let styreOsPayments = h.trans.filter(x => x.loanId === l.id && !x.isPlanned).length;
                baseNextD.setMonth(baseNextD.getMonth() + styreOsPayments);
                nextDateStr = baseNextD.toLocaleDateString('pl-PL', {day:'2-digit', month:'2-digit', year:'numeric'});
            }

            if(isBNPL) {
                let deadline = new Date(l.startDate || new Date());
                deadline.setDate(deadline.getDate() + 30); 
                let daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                let isFreePeriod = daysLeft >= 0;

                detailsHtml = `<div style="margin-top:15px; padding-top:20px; border-top:1px dashed rgba(255,255,255,0.05); text-align:left;">`;
                
                pct = totInst > 0 ? (paidCount / totInst) * 100 : 0;
                let prowizja = (rat * totInst) - bor; 
                
                detailsHtml += `
                <div style="display:flex; gap:12px; margin-bottom:15px; position:relative; align-items:flex-start;">
                    <div style="width:2px; background:var(--info); position:absolute; left:13px; top:28px; bottom:-18px;"></div>
                    <div style="width:28px; height:28px; border-radius:50%; background:var(--info); color:#000; display:flex; align-items:center; justify-content:center; font-size:0.85rem; z-index:1; flex-shrink:0;">🛍️</div>
                    <div style="flex:1; padding-top:2px;"><strong style="color:#fff; font-size:0.9rem;">Wartość zakupu</strong><br><small style="color:var(--muted)">Data: ${l.startDate || '--'}</small></div>
                    <strong style="color:#fff; font-size:0.9rem; padding-top:2px;">${Number(bor).toFixed(2)} zł</strong>
                </div>`;

                if (prowizja > 0) {
                    let pColor = (isFreePeriod && instL === totInst) ? 'var(--muted)' : 'var(--warning)';
                    let pText = (isFreePeriod && instL === totInst) ? `(Ominiesz płacąc do ${daysLeft} dni)` : `Naliczono po 30 dniach`;
                    
                    detailsHtml += `
                    <div style="display:flex; gap:12px; margin-bottom:15px; position:relative; align-items:flex-start;">
                        <div style="width:2px; background:var(--info); position:absolute; left:13px; top:28px; bottom:-18px;"></div>
                        <div style="width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,0.5); border:1px solid ${pColor}; color:${pColor}; display:flex; align-items:center; justify-content:center; font-size:0.85rem; z-index:1; flex-shrink:0;">📈</div>
                        <div style="flex:1; padding-top:2px;"><strong style="color:#fff; font-size:0.9rem;">Koszty operatora</strong><br><small style="color:${pColor};">${pText}</small></div>
                        <strong style="color:${pColor}; font-size:0.9rem; padding-top:2px;">+${Number(prowizja).toFixed(2)} zł</strong>
                    </div>`;
                }
                
                for(let i=1; i<=totInst; i++) {
                    let isPaid = i <= paidCount;
                    let isCurrent = i === paidCount + 1;
                    let sColor = isPaid ? 'var(--info)' : (isCurrent ? 'var(--warning)' : 'var(--muted)');
                    let sIcon = isPaid ? '✅' : (isCurrent ? '🟢' : '⚪');
                    let lineDisp = i === totInst ? 'none' : 'block';
                    
                    // Sztywne pobieranie dat dla każdej raty!
                    let offsets = [31, 61, 91, 120];
                    let offset = offsets[i - 1] || (30 * i);
                    
                    let dRata = new Date(l.startDate || new Date());
                    dRata.setHours(12, 0, 0, 0);
                    dRata.setDate(dRata.getDate() + offset);
                    let rdStr = dRata.toLocaleDateString('pl-PL', {day:'2-digit', month:'2-digit', year:'numeric'});
                    
                    detailsHtml += `
                    <div style="display:flex; gap:12px; margin-bottom:15px; position:relative; align-items:flex-start;">
                        <div style="display:${lineDisp}; width:2px; background:${isPaid?'var(--info)':'rgba(255,255,255,0.1)'}; position:absolute; left:13px; top:28px; bottom:-18px;"></div>
                        <div style="width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,0.5); border:1px solid ${sColor}; color:${sColor}; display:flex; align-items:center; justify-content:center; font-size:0.7rem; z-index:1; flex-shrink:0;">${isPaid?sIcon:i}</div>
                        <div style="flex:1; padding-top:2px;"><strong style="color:${isPaid?'var(--muted)':'#fff'}; font-size:0.9rem;">Rata nr ${i}</strong><br><small style="color:var(--muted)">${isPaid?'Opłacona':(isCurrent?`Spłać do: ${nextDateStr}`:`Planowana: ${rdStr}`)}</small></div>
                        <strong style="color:${isPaid?'var(--muted)':'#fff'}; font-size:0.9rem; padding-top:2px; text-decoration:${isPaid?'line-through':'none'};">${Number(rat).toFixed(2)} zł</strong>
                    </div>`;
                }
                detailsHtml += `</div>`;
            } 
            else if(isPryw) {
                let paidKap = 0;
                detailsHtml = `<div style="margin-top:15px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.05); text-align:left;">`;
                
                if(l.prywMode === 'equal') {
                    pct = totInst > 0 ? (paidCount / totInst) * 100 : 0;
                    for(let i=1; i<=totInst; i++) {
                        let isPaid = i <= paidCount;
                        let isCurrent = i === paidCount + 1;
                        let sColor = isPaid ? cTheme : (isCurrent ? 'var(--warning)' : 'var(--muted)');
                        let sIcon = isPaid ? '✅' : (isCurrent ? '🟢' : '⚪');
                        let lineDisp = i === totInst ? 'none' : 'block';
                        
                        detailsHtml += `
                        <div style="display:flex; gap:12px; margin-bottom:15px; position:relative; align-items:flex-start;">
                            <div style="display:${lineDisp}; width:2px; background:${isPaid?cTheme:'rgba(255,255,255,0.1)'}; position:absolute; left:13px; top:28px; bottom:-18px;"></div>
                            <div style="width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,0.5); border:1px solid ${sColor}; color:${sColor}; display:flex; align-items:center; justify-content:center; font-size:0.7rem; z-index:1; flex-shrink:0;">${isPaid?sIcon:i}</div>
                            <div style="flex:1; padding-top:2px;"><strong style="color:${isPaid?'var(--muted)':'#fff'}; font-size:0.9rem;">Rata nr ${i}</strong></div>
                            <strong style="color:${isPaid?'var(--muted)':'#fff'}; font-size:0.9rem; padding-top:2px; text-decoration:${isPaid?'line-through':'none'};">${Number(rat).toFixed(2)} zł</strong>
                        </div>`;
                    }
                } else if(l.customSchedule && l.customSchedule.length > 0) {
                    l.customSchedule.forEach((cs, idx) => {
                        if(cs.isPaid) paidKap += cs.amt;
                        let isPaid = cs.isPaid;
                        let sColor = isPaid ? cTheme : 'var(--warning)';
                        let sIcon = isPaid ? '✅' : '⏳';
                        let lineDisp = idx === l.customSchedule.length - 1 ? 'none' : 'block';
                        
                        detailsHtml += `
                        <div style="display:flex; gap:12px; margin-bottom:15px; position:relative; align-items:flex-start;">
                            <div style="display:${lineDisp}; width:2px; background:${isPaid?cTheme:'rgba(255,255,255,0.1)'}; position:absolute; left:13px; top:28px; bottom:-18px;"></div>
                            <div style="width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,0.5); border:1px solid ${sColor}; color:${sColor}; display:flex; align-items:center; justify-content:center; font-size:0.7rem; z-index:1; flex-shrink:0;">${sIcon}</div>
                            <div style="flex:1; padding-top:2px;"><strong style="color:${isPaid?'var(--muted)':'#fff'}; font-size:0.9rem;">Transza ${idx+1}</strong><br><small style="color:var(--muted)">Planowana: ${cs.date}</small></div>
                            <strong style="color:${isPaid?'var(--muted)':'#fff'}; font-size:0.9rem; padding-top:2px; text-decoration:${isPaid?'line-through':'none'};">${Number(cs.amt).toFixed(2)} zł</strong>
                        </div>`;
                    });
                    pct = bor > 0 ? (paidKap / bor) * 100 : 0;
                } else {
                    detailsHtml += `<div style="text-align:center; color:var(--muted); font-size:0.75rem;">Brak harmonogramu. Spłata ręczna.</div>`;
                }
                detailsHtml += `</div>`;
            }
            else {
                let paidKap = bor - kap; if(paidKap < 0) paidKap = 0; 
                let paidPctKap = bor > 0 ? (paidKap / bor) * 100 : 0; 
                pct = totInst > 0 ? ((totInst - instL) / totInst) * 100 : 0;
                
                detailsHtml = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.05); text-align:left;">
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">🗓️ Najbliższa rata</span><br><strong style="color:#fff; font-size:0.85rem;">${nextDateStr}</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">📊 Oprocentowanie</span><br><strong style="color:#fff; font-size:0.85rem;">${Number(pctBank || 0).toFixed(2)}% (${l.intType||'Stałe'})</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">📉 Typ rat</span><br><strong style="color:#fff; font-size:0.85rem;">${l.instType||'Równe'}</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">🏦 Kwota z umowy</span><br><strong style="color:#fff; font-size:0.85rem;">${Number(bor || 0).toFixed(2)} zł</strong></div>
                    <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; grid-column: span 2;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">✅ Spłacony Kapitał</span><strong style="color:var(--success); font-size:0.85rem;">${Number(paidKap || 0).toFixed(2)} zł (${Number(paidPctKap || 0).toFixed(1)}%)</strong></div>
                        <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px;"><div style="width:${paidPctKap}%; background:var(--success); height:100%;"></div></div>
                    </div>
                </div>`;
            }

            let ratyStr = (totInst > instL && totInst > 0) ? `${instL} z ${totInst}` : `${instL}`;

            if(!isCompact) {
                let mainTitle = isPrywInc ? 'OCZEKUJĘ ZWROTU:' : (isBNPL ? 'WARTOŚĆ ZAKUPU / ZADŁUŻENIE' : 'KAPITAŁ DO SPŁATY');
                
                return `
                <div class="panel" style="flex: 0 0 85%; min-width: 280px; max-width: 340px; scroll-snap-align: center; padding:0; border:1px solid ${isKredyt ? 'var(--danger)' : '#27272a'}; border-radius:24px; overflow:hidden; margin-bottom:0; background:#18181b;">
                    <div style="padding:20px 20px 10px; position:relative;">
                        <div style="position:absolute; right:15px; top:15px; display:flex; gap:5px;">
                            <button style="background:transparent; border:none; color:var(--muted); font-size:1.2rem; cursor:pointer;" onclick="window.hOpenLoanModal('${l.id}')">✏️</button>
                            <button style="background:transparent; border:none; color:var(--danger); font-size:1.2rem; cursor:pointer;" onclick="window.hDelLoan('${l.id}')">🗑️</button>
                        </div>
                        
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                            <div style="width:40px; height:40px; border-radius:10px; background:${cBg}; display:flex; align-items:center; justify-content:center; font-size:1.4rem; border:1px solid ${cBorder};">${cIcon}</div>
                            <div><strong style="font-size:1.2rem; color:#fff;">${l.n}</strong><br><span style="color:var(--muted); font-size:0.8rem;">Rata: <strong style="color:#fff;">${Number(rat).toFixed(2)} zł</strong></span></div>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                            <div>
                                <span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">${valToPayLbl}</span>
                                <div style="font-size:1.8rem; font-weight:900; color:#fff; letter-spacing:-1px;">${Number(valToPayText || 0).toFixed(2)} zł</div>
                                ${bnplAlert}
                            </div>
                            <div style="text-align:right;">
                                <span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">POZOSTAŁO RAT</span>
                                <div style="font-size:1.1rem; font-weight:900; color:#fff;">${ratyStr}</div>
                            </div>
                        </div>
                        ${savingsHtmlDetailed}
                        <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; margin-top:10px;">
                            <div style="width:${pct}%; background:var(--success); height:100%;"></div>
                        </div>
                    </div>
                    <div style="text-align:center; padding-top:10px;">
                        <span onclick="let el=document.getElementById('ldet_${l.id}'); let txt=this; if(el.style.display==='none'){el.style.display='block'; txt.innerHTML='🔼 Zwiń szczegóły';}else{el.style.display='none'; txt.innerHTML='🔽 Rozwiń szczegóły';}" style="color:var(--info); font-size:0.75rem; cursor:pointer; font-weight:bold; display:inline-block; padding:5px;">🔽 Rozwiń szczegóły</span>
                    </div>
                    <div style="padding:0 20px 15px;">
                        <div id="ldet_${l.id}" style="display:none; margin-bottom:12px;">${detailsHtml}</div>
                    </div>
                    
                    <div style="padding:0 20px 20px; display:flex; flex-direction:column; gap:10px;">
                        <button style="background:${cTheme}; color:${isPrywInc?'#000':'#fff'}; width:100%; padding:15px; border-radius:14px; font-weight:bold; font-size:0.9rem; border:none; box-shadow:0 6px 15px ${cBg}; cursor:pointer;" onclick="${isBNPL ? `window.hPayOffCompletely('${l.id}')` : `window.hOpenPayLoanModal('${l.id}')`}">${isPrywInc ? '📥 ODBIERZ WPŁATĘ' : (isBNPL ? '💸 SPŁAĆ CAŁOŚĆ' : '💸 SPŁAĆ RATĘ')}</button>
                        <div style="display:flex; gap:10px;">
                            <button style="background:rgba(14,165,233,0.2); color:var(--info); flex:1; padding:10px; border-radius:10px; font-size:0.75rem; border:1px solid rgba(14,165,233,0.4);" onclick="${isBNPL ? `window.hOpenPayLoanModal('${l.id}')` : `window.hOverpayLoan('${l.id}')`}">${isBNPL ? '✂️ NA RATY' : '💰 DOWOLNA K.'}</button>
                            ${isKredyt ? `<button style="background:rgba(245,158,11,0.2); color:var(--warning); flex:1; padding:10px; border-radius:10px; font-size:0.75rem; border:1px solid rgba(245,158,11,0.4);" onclick="window.hCreditHoliday('${l.id}')">🏖️ ODROCZ</button>` : ''}
                            <button style="background:rgba(34,197,94,0.2); color:var(--success); flex:1; padding:10px; border-radius:10px; font-size:0.75rem; border:1px solid rgba(34,197,94,0.4);" onclick="window.hPayOffCompletely('${l.id}')">🏆 ZAMKNIJ</button>
                        </div>
                    </div>
                </div>`;
            } else {
                let mainTitleCompact = isPrywInc ? 'Zostało wpłynąć' : (isBNPL ? 'Wartość / Zadłużenie' : 'Kapitał do spłaty');
                let rataTxt = (isPryw && l.prywMode === 'custom') ? '' : `Rata: <strong style="color:#fff">${Number(rat || 0).toFixed(2)} zł</strong>`;

                return `
                <div class="panel" style="flex: 0 0 75%; min-width: 250px; max-width: 280px; scroll-snap-align: center; padding:15px; border-left:4px solid ${cTheme}; border-radius:16px; margin-bottom:0; background:linear-gradient(145deg, #18181b, #09090b); position:relative;">
                    <div style="position:absolute; right:15px; top:15px; display:flex; gap:5px;">
                        <button style="background:transparent; border:none; color:var(--muted); font-size:1.1rem; cursor:pointer;" onclick="window.hOpenLoanModal('${l.id}')">✏️</button>
                        <button style="background:transparent; border:none; color:var(--danger); font-size:1.1rem; cursor:pointer;" onclick="window.hDelLoan('${l.id}')">🗑️</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-right:50px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:35px; height:35px; border-radius:10px; background:${cBg}; border:1px solid ${cBorder}; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">${cIcon}</div>
                            <div><strong style="color:#fff; font-size:1rem; display:block; line-height:1.2;">${l.n}</strong><span style="color:var(--muted); font-size:0.7rem;">${rataTxt}</span></div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:8px;">
                        <div><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">${valToPayLbl}</span><strong style="color:#fff; font-size:1.3rem; line-height:1.2; display:block;">${Number(valToPayText || 0).toFixed(2)} zł</strong></div>
                        <div style="text-align:right;"><span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">Pozostało rat</span><br><strong style="color:#fff; font-size:0.9rem;">${ratyStr}</strong></div>
                    </div>
                    ${savingsHtmlCompact}
                    <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; margin-bottom:8px;">
                        <div style="width:${pct}%; background:var(--success); height:100%;"></div>
                    </div>
                    <div style="text-align:center; margin-bottom:10px;">
                        <span onclick="let el=document.getElementById('ldet_${l.id}'); let txt=this; if(el.style.display==='none'){el.style.display='block'; txt.innerHTML='🔼 Zwiń harmonogram';}else{el.style.display='none'; txt.innerHTML='🔽 Rozwiń harmonogram';}" style="color:var(--info); font-size:0.75rem; cursor:pointer; font-weight:bold; display:inline-block; padding:5px;">🔽 Rozwiń harmonogram</span>
                    </div>
                    <div id="ldet_${l.id}" style="display:none; margin-bottom:12px;">${detailsHtml}</div>
                    
                    <div style="display:flex; gap:6px;">
                        <button style="background:${cTheme}; color:${isPrywInc?'#000':'#fff'}; flex:1; padding:8px 0; border-radius:8px; font-weight:bold; font-size:0.75rem; border:none; cursor:pointer;" onclick="${isBNPL ? `window.hPayOffCompletely('${l.id}')` : `window.hOpenPayLoanModal('${l.id}')`}">💸 ${isPrywInc?'ODBIERZ':(isBNPL?'SPŁAĆ CAŁOŚĆ':'SPŁAĆ RATĘ')}</button>
                        <button style="background:rgba(14,165,233,0.15); color:var(--info); width:38px; border-radius:8px; font-size:0.9rem; border:1px solid rgba(14,165,233,0.3); cursor:pointer;" onclick="${isBNPL ? `window.hOpenPayLoanModal('${l.id}')` : `window.hOverpayLoan('${l.id}')`}">${isBNPL ? '✂️' : '💰'}</button>
                        ${isKredyt ? `<button style="background:rgba(245,158,11,0.15); color:var(--warning); width:38px; border-radius:8px; font-size:0.9rem; border:1px solid rgba(245,158,11,0.3); cursor:pointer;" onclick="window.hCreditHoliday('${l.id}')">🏖️</button>` : ''}
                        <button style="background:rgba(34,197,94,0.15); color:var(--success); width:38px; border-radius:8px; font-size:0.9rem; border:1px solid rgba(34,197,94,0.3); cursor:pointer;" onclick="window.hPayOffCompletely('${l.id}')">🏆</button>
                    </div>
                    
                </div>`;
            }
        }).join('');

        loansHtml = hideScrollStyle + `<div class="hide-scroll" style="display:flex; overflow-x:auto; gap:15px; scroll-snap-type: x mandatory; padding-bottom:15px; width:100%; margin:0; padding: 0 15px;">${mappedLoans}</div>`;
    }

    let legacyDebtsHtml = '';
    if(h.debts && h.debts.filter(d => !d.isClosed).length > 0) {
        legacyDebtsHtml = `
        <div class="section-lbl" style="color:var(--warning); border-color:var(--warning); margin-top:30px;">⏳ Stare wpisy (Do przeniesienia)</div>
        <div class="panel" style="border-color:var(--warning); background:linear-gradient(145deg, #18181b, #09090b);">
            <p style="font-size:0.75rem; color:var(--muted); text-align:center; margin-bottom:15px;">Masz tu stare wpisy. Użyj przycisku migracji, aby łatwo zamienić je w nowoczesny Harmonogram w sekcji Zobowiązań!</p>
            <div style="border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                ${h.debts.filter(d => !d.isClosed).map(d => { 
                    let amt = parseFloat(d.amount) || 0; 
                    return `
                    <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:16px; margin-bottom:15px; border-left:4px solid var(--warning);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <strong style="color:#fff; font-size:1.15rem; display:block; margin-bottom:4px;">${d.person}</strong>
                                <span style="font-size:0.75rem; color:var(--muted);">Kwota: <strong style="color:var(--warning); font-size:1.1rem;">${Number(amt || 0).toFixed(2)} zł</strong></span>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:5px; align-items:flex-end;">
                                <div style="display:flex; gap:5px;">
                                    <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:6px; border-radius:8px; cursor:pointer; font-size:0.8rem;" onclick="window.hDelDebtMistake(${d.id})">🗑️ USUŃ CAŁKIEM</button>
                                </div>
                            </div>
                        </div>
                        <button class="btn" style="background:rgba(14,165,233,0.1); color:var(--info); border:1px solid rgba(14,165,233,0.3); border-radius:8px; padding:10px; width:100%; font-size:0.75rem; font-weight:bold; margin-top:12px; box-shadow:none;" onclick="window.hConvertDebtToInstallments(${d.id})">🔄 MIGRACJA: PRZENIEŚ DO NOWYCH ZOBOWIĄZAŃ</button>
                    </div>`; 
                }).join('')}
            </div>
        </div>`;
    }

    let appContainer = document.getElementById('app');
    if(appContainer) {
        appContainer.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:10px;">
            <p style="letter-spacing:1px; color:var(--info)">TWOJE FINANSE PREMIUM</p>
            <h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px;">Zobowiązania</h1>
            <button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #3b82f6); color:#fff; border-radius:12px; font-weight:900; box-shadow:0 4px 20px rgba(14,165,233,0.4); width:auto; padding:15px 30px; font-size:1rem; border:none;" onclick="window.hOpenLoanModal()">+ DODAJ ZOBOWIĄZANIE</button>
        </div>
        ${topSummaryHtml}
        ${toggleHtml}
        ${loansHtml}
        
        <div class="section-lbl" style="color:var(--success); border-color:var(--success); margin-top:10px;">🎯 Skarbonki / Cele Oszczędnościowe</div>
        <div style="padding: 10px 15px; margin-bottom:80px;">
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
        ${legacyDebtsHtml}
        ` + nav;
    }
};
