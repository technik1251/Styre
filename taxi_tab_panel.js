// ==========================================
// PLIK: taxi_tab_panel.js - Zakładki Panel (Term) i Wyniki (Stats)
// ==========================================

window.rDrvPanel = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;
        
        let act = ''; // Główna zawartość ekranu

        // ==========================================
        // ZAKŁADKA: PANEL (TERM) - TRWAJĄCA ZMIANA
        // ==========================================
        if(t === 'term') {
            if(!window.dTSrc || (d.plat === 'corp' && window.dTSrc === 'Inna')) { window.dTSrc = d.plat === 'apps' ? 'Uber' : 'Centrala'; }
            if(!window.dTPay) { window.dTPay = d.plat === 'apps' ? 'Aplikacja' : 'Gotówka'; }
            
            // Styl dla eleganckich chipów (przycisków wyboru)
            let chipStyle = 'border-radius:12px; font-weight:700; padding:8px 16px; font-size:0.7rem; letter-spacing:0.5px; border:1px solid rgba(255,255,255,0.05); transition:all 0.2s;';
            let chipActBlue = 'background:rgba(14,165,233,0.15); color:#0ea5e9; border-color:rgba(14,165,233,0.4); box-shadow:0 0 10px rgba(14,165,233,0.3);';
            let chipActGreen = 'background:rgba(16,185,129,0.15); color:#10b981; border-color:rgba(16,185,129,0.4); box-shadow:0 0 10px rgba(16,185,129,0.3);';
            let chipIdle = 'background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.4);';
            
            let ch1 = '';
            if(d.plat === 'apps') {
                ch1 = '<div class="chip '+(window.dTSrc==='Uber'?'active':'')+'" style="'+chipStyle+(window.dTSrc==='Uber'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'s\',\'Uber\')">Uber</div>' +
                      '<div class="chip '+(window.dTSrc==='Bolt'?'active':'')+'" style="'+chipStyle+(window.dTSrc==='Bolt'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'s\',\'Bolt\')">Bolt</div>' +
                      '<div class="chip '+(window.dTSrc==='FreeNow'?'active':'')+'" style="'+chipStyle+(window.dTSrc==='FreeNow'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'s\',\'FreeNow\')">FreeNow</div>' +
                      '<div class="chip '+(window.dTSrc==='Inna'?'active':'')+'" style="'+chipStyle+(window.dTSrc==='Inna'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'s\',\'Inna\')">Inna</div>';
            } else {
                ch1 = '<div class="chip '+(window.dTSrc==='Centrala'?'active':'')+'" style="'+chipStyle+(window.dTSrc==='Centrala'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'s\',\'Centrala\')">Centrala</div>' +
                      '<div class="chip '+(window.dTSrc==='Postój'?'active':'')+'" style="'+chipStyle+(window.dTSrc==='Postój'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'s\',\'Postój\')">Postój</div>' +
                      '<div class="chip '+(window.dTSrc==='Prywatny'?'active':'')+'" style="'+chipStyle+(window.dTSrc==='Prywatny'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'s\',\'Prywatny\')">Prywatny</div>';
            }
            
            let otherSrcHtml = (d.plat === 'apps' && window.dTSrc === 'Inna') ? '<div class="inp-group" style="margin-top:10px;"><input type="text" id="dt-other-src" placeholder="Nazwa aplikacji..." style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; padding:12px; font-size:0.85rem; width:100%; box-sizing:border-box;" value="'+(window.dOtherSrc||'')+'" onchange="window.dOtherSrc=this.value"></div>' : '';
            
            let ch2 = '';
            if(d.plat === 'apps') {
                ch2 = '<div class="chip '+(window.dTPay==='Aplikacja'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Aplikacja'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'p\',\'Aplikacja\')">Aplikacja</div>' +
                      '<div class="chip '+(window.dTPay==='Gotówka'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Gotówka'?chipActGreen:chipIdle)+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div>';
            } else {
                ch2 = '<div class="chip '+(window.dTPay==='Gotówka'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Gotówka'?chipActGreen:chipIdle)+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div>' +
                      '<div class="chip '+(window.dTPay==='Karta'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Karta'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'p\',\'Karta\')">Karta</div>' +
                      '<div class="chip '+(window.dTPay==='Voucher'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Voucher'?'background:rgba(168,85,247,0.15);color:#a855f7;border-color:rgba(168,85,247,0.4);box-shadow:0 0 10px rgba(168,85,247,0.3);':chipIdle)+'" onclick="window.dTC(\'p\',\'Voucher\')">Voucher</div>';
            }
            
            let clientOpts = '';
            if(d.clients && d.clients.length > 0) {
                for(let i=0; i<d.clients.length; i++) {
                    clientOpts += '<option value="'+d.clients[i].id+'">'+d.clients[i].n+'</option>';
                }
            }
            
            let now = new Date();
            let dim = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
            let getDaily = function(val, p, dim) { let v = parseFloat(val)||0; if(p==='week') return v/7; if(p==='year') return v/365; return v/dim; };
            
            let cfg = d.cfg || {};
            let dailyFix = getDaily(cfg.bC, cfg.bPeriod, dim) + getDaily(cfg.iC, cfg.iPeriod, dim) + getDaily(cfg.cC, cfg.cType, dim) + getDaily(cfg.uC, cfg.uType, dim) + (cfg.eType === 'flat' ? getDaily(cfg.eC, cfg.ePeriod, dim) : 0);
            
            let g=0, cf=0, vf=0, curK=0, sumCash=0, sumCard=0, sumVouch=0, sumApp=0, sumUber=0, sumBolt=0;
            
            if(d.sh && d.sh.on && d.sh.tr) {
                for(let i=0; i<d.sh.tr.length; i++) {
                    let x = d.sh.tr[i];
                    let val = parseFloat(x.v) || 0;
                    g += val; 
                    curK += (parseFloat(x.k) || 0);
                    
                    if(x.p === 'Gotówka') sumCash += val;
                    else if(x.p === 'Karta') { cf += val * (cfg.cardF || 0); sumCard += val; }
                    else if(x.p === 'Voucher') { vf += val * (cfg.voucherF || 0); sumVouch += val; }
                    else {
                        sumApp += val;
                        if(x.s === 'Uber') sumUber += val;
                        else if(x.s === 'Bolt') sumBolt += val;
                    }
                }
            }
            
            let pFee = cfg.eType === 'pct' ? g * (cfg.ePct || 0) : 0;
            let tax = g * (cfg.tax || 0);
            let fuelC = curK * (cfg.fuelPx || 0);
            let n = g - tax - pFee - cf - vf - fuelC - dailyFix;
            
            let stoperHtml = '<div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 8px; margin-bottom: 12px; text-align: center; font-size: 0.6rem; color: #3b82f6; text-transform:uppercase; font-weight:800; letter-spacing:1px;">🔒 Śledzenie GPS wkrótce</div>';
            if(d.sh && d.sh.on) {
                if(d.liveRideStart) {
                    let isWaiting = d.sh.rWS !== null;
                    stoperHtml += '<div class="panel" style="border-color:'+(isWaiting?'rgba(14,165,233,0.4)':'rgba(16,185,129,0.4)')+'; text-align:center; background:'+(isWaiting?'rgba(14,165,233,0.05)':'rgba(16,185,129,0.05)')+'; padding:15px; border-radius:20px; box-shadow:0 8px 25px rgba(0,0,0,0.3); margin-bottom:15px;">' +
                        '<div style="font-size:2rem; margin-bottom:5px;">'+(isWaiting?'⏳':'🟢')+'</div>' +
                        '<h3 style="color:'+(isWaiting?'#0ea5e9':'#10b981')+'; margin:0 0 10px 0; font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;">'+(isWaiting?'Oczekiwanie':'Kurs w toku!')+'</h3>' +
                        '<div style="display:flex; gap:10px;">' +
                            '<button class="btn" style="flex:1; padding:12px; font-size:0.8rem; border-radius:14px; font-weight:800; background:'+(isWaiting?'#10b981':'rgba(14,165,233,0.15)')+'; color:'+(isWaiting?'#000':'#0ea5e9')+'; border:none;" onclick="window.toggleRideWait()">'+(isWaiting?'▶ RUSZAMY':'⏳ POSTÓJ')+'</button>' +
                            '<button class="btn" style="flex:2; padding:12px; border-radius:14px; font-size:0.8rem; font-weight:800; background:rgba(239,68,68,0.15); color:#ef4444; border:none;" onclick="window.stopLiveRide()">🔴 ZAKOŃCZ</button>' +
                        '</div></div>';
                } else {
                    stoperHtml += '<div class="panel" style="border-color:rgba(16,185,129,0.2); background:rgba(16,185,129,0.05); text-align:center; padding:10px; border-radius:20px; margin-bottom:15px;">' +
                        '<button class="btn" style="background:#10b981; color:#000; font-size:0.85rem; font-weight:800; letter-spacing:1px; padding:15px; border-radius:14px; border:none; box-shadow:0 6px 15px rgba(16,185,129,0.2);" onclick="window.startLiveRide()">🟢 ROZPOCZNIJ KURS (STOPER)</button></div>';
                }
            }
            
            let diffHrs = 0, diffMins = 0, activeHrs = 0, etaHtml = '';
            let goal = cfg.goal || 350;
            let showGross = window.db.drv.panelMode === 'gross';
            let displayVal = showGross ? g : n;
            let displayLabel = showGross ? 'UTARG BRUTTO' : 'NETTO (ZUS/AUTO/OC)';
            let progressPct = displayVal > 0 ? Math.min((displayVal / goal) * 100, 100) : 0;
            
            if(d.sh && d.sh.shiftStart) {
                let activeShiftMs = Date.now() - d.sh.shiftStart;
                if(d.sh.sPT) activeShiftMs -= d.sh.sPT;
                diffHrs = Math.floor(activeShiftMs/3600000);
                diffMins = Math.floor((activeShiftMs%3600000)/60000);
                activeHrs = activeShiftMs/3600000;
                
                if(displayVal > 0 && activeHrs > 0 && displayVal < goal) {
                    let rateHr = displayVal / activeHrs;
                    let remaining = goal - displayVal;
                    let etaHrs = remaining / rateHr;
                    let etaH = Math.floor(etaHrs);
                    let etaM = Math.round((etaHrs - etaH) * 60);
                    etaHtml = 'Do celu: <strong>~'+etaH+'h '+etaM+'m</strong> ('+Number(rateHr).toFixed(0)+' zł/h)';
                } else if(displayVal >= goal) {
                    etaHtml = '<span style="color:#10b981; font-weight:800;">🎉 Cel osiągnięty!</span>';
                } else {
                    etaHtml = 'Szacowanie... Czekam na zarobek.';
                }
            }
            
            let breakdownHtml = '';
            if(d.sh && d.sh.on) {
                if(d.plat === 'apps') {
                    breakdownHtml = '<div style="display:flex; justify-content:space-between; gap:10px; margin-top:15px; padding:0 5px;">' +
                        '<div style="flex:1; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:12px 5px; text-align:center;"><span style="font-size:0.55rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Gotówka</span><br><strong style="color:#10b981; font-size:1.1rem; display:block; margin-top:4px;">'+Number(sumCash).toFixed(2)+'</strong></div>' +
                        '<div style="flex:1; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:12px 5px; text-align:center;"><span style="font-size:0.55rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Uber</span><br><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:4px;">'+Number(sumUber).toFixed(2)+'</strong></div>' +
                        '<div style="flex:1; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:12px 5px; text-align:center;"><span style="font-size:0.55rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Bolt</span><br><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:4px;">'+Number(sumBolt).toFixed(2)+'</strong></div>' +
                    '</div>';
                } else {
                    breakdownHtml = '<div style="display:flex; justify-content:space-between; gap:10px; margin-top:15px; padding:0 5px;">' +
                        '<div style="flex:1; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:12px 5px; text-align:center;"><span style="font-size:0.55rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Gotówka</span><br><strong style="color:#10b981; font-size:1.1rem; display:block; margin-top:4px;">'+Number(sumCash).toFixed(2)+'</strong></div>' +
                        '<div style="flex:1; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:12px 5px; text-align:center;"><span style="font-size:0.55rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Karta</span><br><strong style="color:#0ea5e9; font-size:1.1rem; display:block; margin-top:4px;">'+Number(sumCard).toFixed(2)+'</strong></div>' +
                        '<div style="flex:1; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:12px 5px; text-align:center;"><span style="font-size:0.55rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Voucher</span><br><strong style="color:#a855f7; font-size:1.1rem; display:block; margin-top:4px;">'+Number(sumVouch).toFixed(2)+'</strong></div>' +
                    '</div>';
                }
            }

            if (d.sh && d.sh.on) {
                act += '<div class="dash-hero" style="padding-bottom:15px; border-bottom:1px dashed rgba(255,255,255,0.05); margin-bottom:15px;">' +
                    '<p style="font-size:0.6rem; font-weight:800; color:rgba(255,255,255,0.4); letter-spacing:1px; text-transform:uppercase; margin-bottom:5px;">'+displayLabel+'</p>' +
                    '<h1 style="font-size:3rem; color:'+(displayVal>=0?'#10b981':'#ef4444')+'; font-weight:900; letter-spacing:-1px; margin:0;">'+Number(displayVal||0).toFixed(2)+' zł</h1>' +
                    
                    '<div style="display:flex; justify-content:center; gap:10px; margin-top:15px; margin-bottom:15px;">' +
                        '<button class="chip '+(!showGross?'active':'')+'" style="flex:none; padding: 8px 16px; font-size:0.7rem; border-radius:20px; font-weight:700; background:'+(!showGross?'rgba(255,255,255,0.1)':'transparent')+'; border:1px solid rgba(255,255,255,0.1); color:'+(!showGross?'#fff':'var(--muted)')+';" onclick="window.db.drv.panelMode=\'net\';window.render()">Netto (Operacyjne)</button>' +
                        '<button class="chip '+(showGross?'active':'')+'" style="flex:none; padding: 8px 16px; font-size:0.7rem; border-radius:20px; font-weight:700; background:'+(showGross?'rgba(255,255,255,0.1)':'transparent')+'; border:1px solid rgba(255,255,255,0.1); color:'+(showGross?'#fff':'var(--muted)')+';" onclick="window.db.drv.panelMode=\'gross\';window.render()">Brutto (Utarg)</button>' +
                    '</div>' +
                    
                    '<div style="margin-top: 10px; padding: 0 10px;">' +
                        '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:rgba(255,255,255,0.5); margin-bottom:6px; font-weight:700;"><span>Cel: '+goal+' zł</span><span style="color:'+(progressPct>=100?'#10b981':'#fff')+';">'+Number(progressPct||0).toFixed(0)+'%</span></div>' +
                        '<div style="width:100%; background:rgba(0,0,0,0.5); height:8px; border-radius:4px; overflow:hidden; border:1px inset rgba(255,255,255,0.05);"><div style="width:'+progressPct+'%; background:'+(progressPct>=100?'#10b981':'rgba(255,255,255,0.8)')+'; height:100%; transition:width 0.6s cubic-bezier(0.4,0,0.2,1); border-radius:4px;"></div></div>' +
                        '<div style="font-size:0.65rem; color:rgba(255,255,255,0.4); text-align:center; margin-top:8px;">'+etaHtml+'</div>' +
                    '</div>' +
                    breakdownHtml +
                    
                    '<div style="display:flex; justify-content:center; gap:10px; margin-top:20px; padding:0 5px;">' +
                        '<div style="flex:1; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:16px; display:flex; flex-direction:column; justify-content:center;">' +
                            '<span style="font-size:0.55rem; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:800; letter-spacing:0.5px; margin-bottom:4px;">Czas pracy:</span>' +
                            '<strong style="color:#0ea5e9; font-size:1.1rem;">'+diffHrs+'h '+diffMins+'m</strong>' +
                        '</div>' +
                        '<div style="flex:1; display:flex; flex-direction:column; gap:8px;">' +
                            '<button style="flex:1; border-radius:14px; font-size:0.75rem; font-weight:800; background:'+(d.sh.sPS?'#10b981':'rgba(255,255,255,0.05)')+'; color:'+(d.sh.sPS?'#000':'#fff')+'; border:1px solid '+(d.sh.sPS?'#10b981':'rgba(255,255,255,0.1)')+'; cursor:pointer; outline:none;" onclick="window.toggleShiftPause()">'+(d.sh.sPS?'▶ WZNÓW':'☕ PRZERWA')+'</button>' +
                            '<button style="flex:1; border-radius:14px; font-size:0.75rem; font-weight:800; background:rgba(239,68,68,0.15); color:#ef4444; border:none; cursor:pointer; outline:none;" onclick="window.openEndShiftModal()">🔴 ZAKOŃCZ</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
                
                act += (d.sh.sPS ? '<div class="panel" style="border-color:rgba(245,158,11,0.3); text-align:center; padding:25px 15px; margin-top:10px; border-radius:20px; background:rgba(245,158,11,0.05);"><div style="font-size:2.5rem; margin-bottom:10px; animation: pulse 2s infinite;">☕</div><h2 style="color:#f59e0b; margin:0 0 15px 0; font-size:1.1rem;">ZMIANA WSTRZYMANA</h2><button class="btn" style="background:#10b981; color:#000; font-weight:800; padding:15px; border-radius:14px; border:none; font-size:1rem;" onclick="window.toggleShiftPause()">▶ WZNÓW PRACĘ</button></div>' : stoperHtml);
                
                // Formularz dodawania kursu - NOWY, SMUKŁY DESIGN (Apple Style)
                act += '<div class="panel" style="border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); padding:20px 15px; border-radius:24px; display:'+(d.sh.sPS?'none':'block')+'; box-shadow:0 10px 30px rgba(0,0,0,0.5); margin-bottom:20px;">' +
                    '<div style="text-align:center; margin-bottom:15px;">' +
                        '<span style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:800; text-transform:uppercase; letter-spacing:1px;">Rejestracja Kursu</span>' +
                    '</div>' +
                    
                    '<div style="margin-bottom:15px;">' +
                        '<div class="chip-box" style="margin-bottom:10px; justify-content:center; gap:8px;">'+ch1+'</div>' +
                        otherSrcHtml +
                        '<div class="chip-box" style="margin-bottom:0; justify-content:center; gap:8px; margin-top:10px;">'+ch2+'</div>' +
                    '</div>' +
                    
                    // Pole na kwotę - Wygląd jak PIN pad
                    '<div style="background:rgba(0,0,0,0.4); border:1px inset rgba(255,255,255,0.05); border-radius:20px; padding:15px; margin-bottom:15px;">' +
                        '<div style="display:flex; justify-content:center; align-items:center; gap:8px;">' +
                            '<input type="number" id="dt-v" placeholder="0" style="color:#fff; border:none; background:transparent; font-size:3.2rem; font-weight:700; text-align:center; width:160px; padding:0; outline:none;">' +
                            '<span style="font-size:1.4rem; font-weight:700; color:rgba(255,255,255,0.3); margin-top:12px;">zł</span>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="inp-row" style="margin-bottom:15px; gap:10px;">' +
                        '<div class="inp-group" style="margin:0;"><input type="number" id="dt-m" placeholder="Czas (min)" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:0.9rem; font-weight:600; outline:none;"></div>' +
                        '<div class="inp-group" style="margin:0;"><input type="number" id="dt-k" placeholder="Dystans (km)" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:0.9rem; font-weight:600; outline:none;"></div>' +
                    '</div>' +
                    
                    '<div class="inp-group" style="margin-bottom:15px;">' +
                        '<select id="dt-cid" style="background:rgba(0,0,0,0.3); border-radius:14px; padding:14px; font-size:0.8rem; color:rgba(255,255,255,0.6); border:1px solid rgba(255,255,255,0.05); outline:none;"><option value="">-- Powiąż z Klientem VIP --</option>'+clientOpts+'</select>' +
                    '</div>' +
                    
                    '<button class="btn" style="background:#0ea5e9; color:#fff; padding:18px; border-radius:16px; font-weight:800; font-size:1rem; letter-spacing:0.5px; border:none; box-shadow:0 6px 20px rgba(14,165,233,0.3);" onclick="window.dAddT()">DODAJ KURS</button>' +
                '</div>';
                
                act += '<div class="panel" style="display:'+(d.sh.sPS?'none':'block')+'; padding:15px; border-radius:24px; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b);">' +
                    '<div style="font-size:0.7rem; margin-bottom:15px; color:rgba(255,255,255,0.4); font-weight:800; letter-spacing:1px; text-align:center;">HISTORIA ZMIANY</div>';
                    
                let trsList = d.sh.tr || [];
                if(trsList.length > 0) {
                    for(let i=0; i<trsList.length; i++) {
                        let x = trsList[i];
                        let icon='🚕', color='rgba(255,255,255,0.2)', bg='rgba(255,255,255,0.02)';
                        if(x.p==='Gotówka') { icon='💵'; color='#10b981'; bg='rgba(16,185,129,0.05)'; }
                        else if(x.p==='Karta') { icon='💳'; color='#0ea5e9'; bg='rgba(14,165,233,0.05)'; }
                        else if(x.p==='Voucher') { icon='🎫'; color='#a855f7'; bg='rgba(168,85,247,0.05)'; }
                        
                        act += '<div class="log-item" style="border:none; padding:12px; margin-bottom:8px; background:'+bg+'; border-radius:16px; border-left:3px solid '+color+';">' +
                            '<div style="display:flex; align-items:center; gap:12px; flex:1;">' +
                                '<div style="font-size:1.3rem; width:40px; height:40px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:12px; display:flex; align-items:center; justify-content:center;">'+icon+'</div>' +
                                '<div style="flex:1;">' +
                                    '<strong style="font-size:1.05rem; color:#fff; display:block; margin-bottom:2px; font-weight:700;">'+Number(x.v||0).toFixed(2)+' zł</strong>' +
                                    '<div style="display:flex; gap:6px; font-size:0.65rem; color:rgba(255,255,255,0.5); align-items:center; font-weight:600;">' +
                                        '<span>'+(x.time||'--:--')+'</span><span style="opacity:0.3">•</span><span style="color:'+color+';">'+x.p+'</span><span style="opacity:0.3">•</span><span>'+x.s+'</span>' +
                                        (x.k>0 ? '<span style="opacity:0.3">•</span><span>'+Number(x.k).toFixed(1)+' km</span>' : '') +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div style="display:flex; flex-direction:column; gap:6px;">' +
                                '<button style="background:rgba(255,255,255,0.05); color:#fff; border:none; border-radius:10px; padding:6px 10px; cursor:pointer; font-size:0.7rem; outline:none;" onclick="window.dEditT('+x.id+')">✏️</button>' +
                                '<button style="background:rgba(239,68,68,0.1); color:#ef4444; border:none; border-radius:10px; padding:6px 10px; cursor:pointer; font-size:0.7rem; outline:none;" onclick="window.dDelT('+x.id+')">🗑️</button>' +
                            '</div>' +
                        '</div>';
                    }
                } else {
                    act += '<div style="text-align:center;color:rgba(255,255,255,0.3);padding:20px 0;font-size:0.8rem; background:rgba(0,0,0,0.2); border-radius:16px; border:1px dashed rgba(255,255,255,0.05);">Brak dodanych kursów.</div>';
                }
                act += '</div>';
            } else {
                // EKRAN STARTOWY (Rozpocznij Pracę) - Premium UI
                act = '<div class="dash-hero" style="padding-top:40px; padding-bottom:30px;">' +
                    '<div style="width:80px;height:80px;background:#10b981;border-radius:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:2.5rem;box-shadow:0 8px 25px rgba(16,185,129,0.3);">🚕</div>' +
                    '<h1 style="font-size:2rem; font-weight:800; letter-spacing:-0.5px; margin-bottom:5px; color:#fff;">Cześć, '+(window.db.userName || 'Kierowco')+'!</h1>' +
                    '<p style="margin-top:5px; font-size:0.85rem; color:rgba(255,255,255,0.5); font-weight:600;">Potwierdź stan licznika przed jazdą.</p>' +
                '</div>' +
                '<div class="panel" style="border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 20px 40px rgba(0,0,0,0.6); padding:30px 20px; border-radius:24px; margin:0 15px;">' +
                    '<div style="background:rgba(0,0,0,0.4); border:1px inset rgba(255,255,255,0.05); border-radius:16px; padding:15px; margin-bottom:20px;">' +
                        '<input type="number" id="ds-o" value="'+((d.odo||0)>0?d.odo:'')+'" placeholder="ODO" style="width:100%; font-size:2.5rem; padding:0; text-align:center; background:transparent; border:none; color:#10b981; font-weight:800; outline:none; box-sizing:border-box;">' +
                    '</div>' +
                    '<button class="btn" style="background:#10b981; color:#000; font-size:1.1rem; font-weight:800; letter-spacing:0.5px; padding:18px; border-radius:16px; border:none; box-shadow:0 6px 20px rgba(16, 185, 129, 0.3); width:100%; outline:none;" onclick="window.dStartS()">ROZPOCZNIJ PRACĘ</button>' +
                '</div>';
                
                if(!window.dShowOff) {
                    act += '<div style="padding:0 15px; margin-top:20px;">' +
                        '<button class="btn" style="background:rgba(14,165,233,0.08); color:#0ea5e9; border:1px dashed rgba(14,165,233,0.3); font-size:0.8rem; font-weight:700; box-shadow:none; width:100%; padding:15px; border-radius:16px; outline:none;" onclick="window.dShowOff=true; window.render()">📥 WPROWADŹ UTARG Z RAPORTU KASY</button>' +
                    '</div>';
                } else {
                    act += '<div class="section-lbl" style="color:#0ea5e9; border-color:#0ea5e9; margin-top:30px; font-size:0.7rem; letter-spacing:1px; text-transform:uppercase;">⚡ Raport z Kasy (Zaległe)</div>' +
                    '<div class="panel" style="border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #0f172a, #09090b); border-radius:24px; padding:20px 15px; margin:0 15px; animation:fadeIn 0.3s; box-shadow:0 10px 30px rgba(0,0,0,0.5);">' +
                        '<div class="form-section" style="padding:12px; margin-bottom:15px; background:rgba(0,0,0,0.3); border-radius:16px; border:1px solid rgba(255,255,255,0.05);">' +
                            '<div class="fs-title" style="margin-bottom:10px; font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:800; text-align:center;">'+(d.plat==='apps'?'Wybierz Aplikację':'Wybierz Źródło')+'</div>' +
                            '<div class="chip-box" style="margin-bottom:0; padding-bottom:0; justify-content:center; gap:8px;">'+ch1+'</div>'+otherSrcHtml+
                        '</div>' +
                        '<div class="inp-row" style="margin-bottom:15px; gap:10px;">' +
                            '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:700; margin-bottom:4px; display:block;">Data Od</label><input type="date" id="dw-d-from" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" style="background:rgba(255,255,255,0.05); border:none; border-radius:12px; padding:12px; color:#fff; font-size:0.85rem; outline:none; width:100%; box-sizing:border-box;"></div>' +
                            '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:700; margin-bottom:4px; display:block;">Data Do</label><input type="date" id="dw-d-to" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" style="background:rgba(255,255,255,0.05); border:none; border-radius:12px; padding:12px; color:#fff; font-size:0.85rem; outline:none; width:100%; box-sizing:border-box;"></div>' +
                        '</div>' +
                        '<div class="inp-group" style="margin-bottom:15px; background:rgba(0,0,0,0.4); border-radius:16px; padding:15px; border:1px inset rgba(255,255,255,0.05);">' +
                            '<label style="font-size:0.65rem; color:#0ea5e9; font-weight:800; text-align:center; display:block; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">UTARG BRUTTO (ŁĄCZNIE)</label>' +
                            '<input type="number" id="dw-v" placeholder="0.00" style="width:100%; color:#0ea5e9; border:none; background:transparent; font-size:2.2rem; font-weight:800; text-align:center; outline:none; padding:0; box-sizing:border-box;">' +
                        '</div>' +
                        '<div class="inp-row" style="margin-bottom:15px; gap:10px;">' +
                            '<div class="inp-group" style="margin:0;"><input type="number" id="dw-k" placeholder="Przebieg (KM)" style="background:rgba(255,255,255,0.05); border:none; color:#fff; border-radius:12px; padding:14px; text-align:center; font-size:0.85rem; font-weight:600; outline:none; width:100%; box-sizing:border-box;"></div>' +
                            '<div class="inp-group" style="margin:0;"><input type="number" id="dw-c" placeholder="W tym gotówka" style="background:rgba(255,255,255,0.05); border:none; color:#fff; border-radius:12px; padding:14px; text-align:center; font-size:0.85rem; font-weight:600; outline:none; width:100%; box-sizing:border-box;"></div>' +
                        '</div>' +
                        '<div class="inp-group" style="margin-bottom:20px;">' +
                            '<input type="number" id="dw-h" placeholder="Godziny pracy (opcjonalnie)" style="background:rgba(255,255,255,0.05); border:none; color:#fff; border-radius:12px; padding:14px; text-align:center; font-size:0.85rem; font-weight:600; outline:none; width:100%; box-sizing:border-box;">' +
                        '</div>' +
                        '<button class="btn" style="background:#0ea5e9; color:#fff; font-weight:800; padding:16px; font-size:0.95rem; border-radius:14px; border:none; box-shadow:0 6px 15px rgba(14,165,233,0.3); width:100%; outline:none;" onclick="window.dAddOfflineWeekly()">ZAKSIĘGUJ W HISTORII</button>' +
                        '<button class="btn" style="background:transparent; color:rgba(255,255,255,0.5); margin-top:8px; border:1px solid rgba(255,255,255,0.1); border-radius:14px; box-shadow:none; padding:14px; font-weight:700; font-size:0.85rem; width:100%; outline:none;" onclick="window.dShowOff=false; window.render()">ANULUJ</button>' +
                    '</div>';
                }
            }
            
            // POTĘŻNY MARGINES DOLNY (140px) chroniący treść przed zakryciem przez pływającą wyspę nav
            appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;
        }

        // ==========================================
        // ZAKŁADKA: STATYSTYKI (STATS)
        // ==========================================
        if(t === 'stats') {
            let fM = window.db.filter || 'all';
            let now = new Date();
            let fs = [], fe = [], dF = null, dT = null;
            
            if(fM === 'custom') {
                if(!window.db.filterFrom) window.db.filterFrom = (window.getLocalYMD ? window.getLocalYMD() : '');
                if(!window.db.filterTo) window.db.filterTo = (window.getLocalYMD ? window.getLocalYMD() : '');
                dF = new Date(window.db.filterFrom); dF.setHours(0,0,0,0);
                dT = new Date(window.db.filterTo); dT.setHours(23,59,59,999);
            }
            
            let hArr = d.h || [];
            for(let i=0; i<hArr.length; i++) {
                let s = hArr[i];
                let sd = new Date(s.rD);
                if(fM === 'all') fs.push(s);
                else if(fM === 'today' && sd.toDateString() === now.toDateString()) fs.push(s);
                else if(fM === 'month' && sd.getMonth() === now.getMonth() && sd.getFullYear() === now.getFullYear()) fs.push(s);
                else if(fM === 'week') {
                    let diff = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
                    let st = new Date(now.setDate(diff)); st.setHours(0,0,0,0);
                    if(sd >= st) fs.push(s);
                }
                else if(fM === 'custom' && sd >= dF && sd <= dT) fs.push(s);
            }
            
            let expArr = d.exp || [];
            for(let i=0; i<expArr.length; i++) {
                let e = expArr[i];
                let ed = new Date(e.rD);
                if(fM === 'all') fe.push(e);
                else if(fM === 'today' && ed.toDateString() === now.toDateString()) fe.push(e);
                else if(fM === 'month' && ed.getMonth() === now.getMonth() && ed.getFullYear() === now.getFullYear()) fe.push(e);
                else if(fM === 'week') {
                    let diff = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
                    let st = new Date(now.setDate(diff)); st.setHours(0,0,0,0);
                    if(ed >= st) fe.push(e);
                }
                else if(fM === 'custom' && ed >= dF && ed <= dT) fe.push(e);
            }
            
            let g=0, k=0, fc=0, tx=0, ex=0, pf=0, cf=0, vf=0, th=0, pkSum=0, emptyKSum=0;
            let cashEarned=0, cardEarned=0, appEarned=0, uberEarned=0, boltEarned=0, vouchEarned=0;
            
            let getDaily = function(val, p, dim) { let v = parseFloat(val)||0; if(p==='week') return v/7; if(p==='year') return v/365; return v/dim; };
            let daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
            
            let cfg = d.cfg || {};
            let exactDailyRate = getDaily(cfg.bC, cfg.bPeriod, daysInCurrentMonth) + 
                                 getDaily(cfg.iC, cfg.iPeriod, daysInCurrentMonth) + 
                                 getDaily(cfg.cC, cfg.cType, daysInCurrentMonth) + 
                                 getDaily(cfg.uC, cfg.uType, daysInCurrentMonth) + 
                                 (cfg.eType === 'flat' ? getDaily(cfg.eC, cfg.ePeriod, daysInCurrentMonth) : 0);
            
            let oD = new Date();
            if(d.h && d.h.length > 0) {
                let sH = [];
                for(let i=0; i<d.h.length; i++) sH.push(d.h[i]);
                sH.sort(function(a,b){ return new Date(a.rD) - new Date(b.rD); });
                oD = new Date(sH[0].rD);
            }
            
            let aS = window.db.createdAt ? new Date(window.db.createdAt) : new Date();
            if(oD < aS) { aS = oD; window.db.createdAt = (window.getLocalYMD ? window.getLocalYMD(aS) : ''); if(typeof window.save==='function') window.save(); }
            aS.setHours(0,0,0,0);
            
            let tE = new Date(); tE.setHours(23,59,59,999);
            let rS = new Date(), rE = new Date(tE);
            
            if(fM === 'today') { rS.setHours(0,0,0,0); }
            else if(fM === 'week') {
                let wN = new Date();
                let diff = wN.getDate() - wN.getDay() + (wN.getDay() === 0 ? -6 : 1);
                rS = new Date(wN.setDate(diff)); rS.setHours(0,0,0,0);
                rE = new Date(rS); rE.setDate(rE.getDate()+6); rE.setHours(23,59,59,999);
            }
            else if(fM === 'month') { rS = new Date(now.getFullYear(), now.getMonth(), 1); rE = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999); }
            else if(fM === 'custom') { rS = new Date(dF); rE = new Date(dT); rE.setHours(23,59,59,999); }
            else { rS = new Date(aS); }
            
            let actS = new Date(Math.max(rS.getTime(), aS.getTime()));
            let actE = new Date(Math.min(rE.getTime(), tE.getTime()));
            let daysToCharge = 0;
            
            if(actS <= actE) { daysToCharge = Math.floor((actE.getTime() - actS.getTime()) / 86400000) + 1; }
            if(daysToCharge < 1) daysToCharge = 1;
            
            let totalDynamicFix = (window.db.drv && window.db.drv.showFixed) ? (daysToCharge * exactDailyRate) : 0;
            
            for(let i=0; i<fs.length; i++) {
                let x = fs[i];
                g += (parseFloat(x.g) || 0); 
                k += (parseFloat(x.k) || 0); 
                fc += (parseFloat(x.fc) || 0); 
                tx += (parseFloat(x.tx) || 0); 
                pf += (parseFloat(x.pF) || 0); 
                cf += (parseFloat(x.cF) || 0); 
                vf += (parseFloat(x.vF) || 0); 
                th += (parseFloat(x.hW) || 0); 
                pkSum += (parseFloat(x.pk) || 0); 
                emptyKSum += (parseFloat(x.emptyK) || 0); 
                
                let xtr = x.tr || [];
                for(let j=0; j<xtr.length; j++) {
                    let tr = xtr[j];
                    let trv = parseFloat(tr.v) || 0;
                    if(tr.p === 'Gotówka') cashEarned += trv; 
                    else if(tr.p === 'Karta') cardEarned += trv; 
                    else if(tr.p === 'Voucher') vouchEarned += trv; 
                    else { 
                        appEarned += trv; 
                        if(tr.s === 'Uber') uberEarned += trv; 
                        else if(tr.s === 'Bolt') boltEarned += trv; 
                    } 
                }
            }
            
            for(let i=0; i<fe.length; i++) {
                if(fe[i].ty === 'e') ex += (parseFloat(fe[i].v) || 0);
            }
            
            let n = g - fc - tx - totalDynamicFix - pf - cf - vf - ex;
            let rKm = k > 0 ? (n / k) : 0;
            let rHr = th > 0 ? (n / th) : 0;

            let breakdownStatsHtml = '';
            if (d.plat === 'apps') {
                breakdownStatsHtml = '<div style="display:flex; justify-content:space-between; gap:10px; margin-top:20px; padding:0 15px; margin-bottom:20px;">' +
                    '<div style="flex:1; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.15); border-radius:16px; padding:15px 10px; text-align:center;"><span style="font-size:0.6rem; color:#10b981; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Gotówka</span><br><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:6px;">'+Number(cashEarned).toFixed(2)+'</strong></div>' +
                    '<div style="flex:1; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:15px 10px; text-align:center;"><span style="font-size:0.6rem; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:800; letter-spacing:1px;">Uber</span><br><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:6px;">'+Number(uberEarned).toFixed(2)+'</strong></div>' +
                    '<div style="flex:1; background:rgba(14,165,233,0.05); border:1px solid rgba(14,165,233,0.15); border-radius:16px; padding:15px 10px; text-align:center;"><span style="font-size:0.6rem; color:#0ea5e9; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Bolt</span><br><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:6px;">'+Number(boltEarned).toFixed(2)+'</strong></div>' +
                '</div>';
            } else {
                breakdownStatsHtml = '<div style="display:flex; justify-content:space-between; gap:10px; margin-top:20px; padding:0 15px; margin-bottom:20px;">' +
                    '<div style="flex:1; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.15); border-radius:16px; padding:15px 10px; text-align:center;"><span style="font-size:0.6rem; color:#10b981; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Gotówka</span><br><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:6px;">'+Number(cashEarned).toFixed(2)+'</strong></div>' +
                    '<div style="flex:1; background:rgba(14,165,233,0.05); border:1px solid rgba(14,165,233,0.15); border-radius:16px; padding:15px 10px; text-align:center;"><span style="font-size:0.6rem; color:#0ea5e9; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Karta</span><br><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:6px;">'+Number(cardEarned).toFixed(2)+'</strong></div>' +
                    '<div style="flex:1; background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.15); border-radius:16px; padding:15px 10px; text-align:center;"><span style="font-size:0.6rem; color:#a855f7; text-transform:uppercase; font-weight:800; letter-spacing:1px;">Voucher</span><br><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:6px;">'+Number(vouchEarned).toFixed(2)+'</strong></div>' +
                '</div>';
            }

            let customDatesHtml = fM === 'custom' ? '<div style="display:flex;gap:8px;padding:0 15px;margin-bottom:15px;">' +
                '<div class="inp-group" style="margin:0; flex:1;"><label style="font-size:0.6rem; color:rgba(255,255,255,0.4); margin-bottom:4px; display:block;">Data Od</label><input type="date" value="'+(window.db.filterFrom||'')+'" onchange="window.db.filterFrom=this.value; window.render()" style="padding:10px; font-size:0.75rem; border-radius:10px; background:rgba(255,255,255,0.05); color:#fff; border:none; width:100%; box-sizing:border-box; outline:none;"></div>' +
                '<div class="inp-group" style="margin:0; flex:1;"><label style="font-size:0.6rem; color:rgba(255,255,255,0.4); margin-bottom:4px; display:block;">Data Do</label><input type="date" value="'+(window.db.filterTo||'')+'" onchange="window.db.filterTo=this.value; window.render()" style="padding:10px; font-size:0.75rem; border-radius:10px; background:rgba(255,255,255,0.05); color:#fff; border:none; width:100%; box-sizing:border-box; outline:none;"></div>' +
            '</div>' : '';

            let totalTransferred = 0;
            if(window.db.home && window.db.home.trans) {
                for(let i=0; i<window.db.home.trans.length; i++) {
                    let ht = window.db.home.trans[i];
                    if(ht.cat === 'Wypłata z Etatu' && ht.d === 'Utarg z Taxi') {
                        totalTransferred += (parseFloat(ht.v)||0);
                    }
                }
            }
            let availableCashForTransfer = cashEarned - totalTransferred;
            
            let transferButtonHtml = '';
            if (availableCashForTransfer > 0) {
                transferButtonHtml = '<button class="btn btn-success" style="margin-top:15px; width:calc(100% - 30px); margin-left:auto; margin-right:auto; font-weight:800; background:#10b981; color:#000; box-shadow: 0 4px 15px rgba(16,185,129,0.3); padding:14px; border-radius:14px; border:none; outline:none; cursor:pointer;" onclick="window.dTransferToHomeModal()"><span style="font-size:1.1rem; margin-right:8px;">💸</span> PRZELEJ DO BUDŻETU<br><small style="font-weight:600; font-size:0.7rem; color:rgba(0,0,0,0.6); display:block; margin-top:2px;">Nierozliczone: '+Number(availableCashForTransfer).toFixed(2)+' zł</small></button>';
            } else {
                transferButtonHtml = '<button class="btn" style="margin-top:15px; width:calc(100% - 30px); margin-left:auto; margin-right:auto; font-weight:700; background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.3); border:1px solid rgba(255,255,255,0.05); padding:14px; border-radius:14px; outline:none;" disabled><span style="font-size:1rem; margin-right:8px;">✅</span> GOTÓWKA ROZLICZONA<br><small style="font-weight:600; font-size:0.65rem; display:block; margin-top:2px;">W domu: '+Number(totalTransferred).toFixed(2)+' zł</small></button>';
            }

            let proBannerHtml = '';
            if (d.plat === 'apps') {
                proBannerHtml = '<div style="margin: 15px; padding: 15px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.05)); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; cursor: pointer; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" onclick="window.sysAlert(\'Inteligentny Asystent Zleceń (PRO)\', \'Wkrótce udostępnimy aplikację StyreOS PRO! Nakładka na ekran odczyta szczegóły zlecenia bezpośrednio z aplikacji partnerskiej i w ułamku sekundy pokaże Ci zysk na czysto na malutkim bąbelku, zanim zdążysz to zaakceptować! 🚀\', \'info\')">' +
                    '<div style="font-size: 1.6rem; margin-bottom: 4px;">🔮</div>' +
                    '<strong style="color: #c084fc; font-size: 0.8rem; display: block; text-transform: uppercase; letter-spacing:1px; font-weight:800;">Inteligentny Asystent</strong>' +
                    '<span style="font-size: 0.65rem; color: rgba(255,255,255,0.5); margin-top: 4px; display: block; line-height:1.4;">Pływająca nakładka opłacalności kursu - tylko w wersji PRO! Kliknij po info.</span>' +
                '</div>';
            } else {
                proBannerHtml = '<div style="margin: 15px; padding: 15px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(2, 132, 199, 0.05)); border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 16px; cursor: pointer; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" onclick="window.sysAlert(\'Integracja e-Kasy / RT3000 (PRO)\', \'W wersji StyreOS PRO wprowadzimy bezpośrednią integrację z systemami korporacyjnymi i kasami wirtualnymi (API). Zlecenia i e-paragony będą wpadać do aplikacji w 100% automatycznie! 🖨️☁️\', \'info\')">' +
                    '<div style="font-size: 1.6rem; margin-bottom: 4px;">📡</div>' +
                    '<strong style="color: #38bdf8; font-size: 0.8rem; display: block; text-transform: uppercase; letter-spacing:1px; font-weight:800;">Integracja e-Kasy</strong>' +
                    '<span style="font-size: 0.65rem; color: rgba(255,255,255,0.5); margin-top: 4px; display: block; line-height:1.4;">Automatyczne zaciąganie kursów (API) w wersji PRO. Kliknij po info.</span>' +
                '</div>';
            }

            let pAndLHtml = '<div class="panel" style="padding:20px 15px; margin:0 15px 15px; border-radius:20px; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 8px 25px rgba(0,0,0,0.4);">' +
                '<div style="text-align:center; margin-bottom:15px;">' +
                    '<span style="font-size:0.65rem; color:rgba(255,255,255,0.3); font-weight:800; text-transform:uppercase; letter-spacing:1px;">Wodospad Finansowy (P&L)</span>' +
                '</div>' +
                '<div class="fin-row" style="font-size:0.75rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><span class="fin-label" style="color:#fff;">Utarg Brutto z aplikacji</span><strong class="fin-val" style="color:#10b981">'+Number(g).toFixed(2)+' zł</strong></div>' +
                '<div class="fin-row" style="font-size:0.75rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><span class="fin-label" style="color:rgba(255,255,255,0.6);">Wydatki Zmienne (Garaż)</span><span class="fin-val" style="color:#ef4444">-'+Number(ex).toFixed(2)+' zł</span></div>' +
                '<div class="fin-row" style="font-size:0.75rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><span class="fin-label" style="color:rgba(255,255,255,0.6);">Paliwo z tras</span><span class="fin-val" style="color:#f59e0b">-'+Number(fc).toFixed(2)+' zł</span></div>' +
                (cf > 0 ? '<div class="fin-row" style="font-size:0.75rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><span class="fin-label" style="color:rgba(255,255,255,0.6);">Prowizja Terminala</span><span class="fin-val" style="color:#ef4444">-'+Number(cf).toFixed(2)+' zł</span></div>' : '') +
                (vf > 0 ? '<div class="fin-row" style="font-size:0.75rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><span class="fin-label" style="color:rgba(255,255,255,0.6);">Prowizja Voucherów</span><span class="fin-val" style="color:#ef4444">-'+Number(vf).toFixed(2)+' zł</span></div>' : '') +
                (pf > 0 ? '<div class="fin-row" style="font-size:0.75rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><span class="fin-label" style="color:rgba(255,255,255,0.6);">Prowizja Aplikacji</span><span class="fin-val" style="color:#ef4444">-'+Number(pf).toFixed(2)+' zł</span></div>' : '') +
                '<div class="fin-row" style="font-size:0.75rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><span class="fin-label" style="color:rgba(255,255,255,0.6);">Podatek / VAT</span><span class="fin-val" style="color:#ef4444">-'+Number(tx).toFixed(2)+' zł</span></div>' +
                '<div class="fin-row" style="align-items:flex-start; font-size:0.75rem; margin-bottom:12px;">' +
                    '<div style="display:flex; flex-direction:column; max-width:70%;"><span class="fin-label" style="color:rgba(255,255,255,0.8);">Odpisy Stałe '+(!window.db.drv.showFixed ? '(Wyłączone)' : '(Za '+daysToCharge+' dni)')+'</span></div>' +
                    '<span class="fin-val" style="color:#ef4444; padding-top:2px;">-'+Number(totalDynamicFix).toFixed(2)+' zł</span>' +
                '</div>' +
                '<div class="fin-row" style="background:rgba(0,0,0,0.3); padding:15px; border-radius:12px; border:1px inset rgba(255,255,255,0.05);">' +
                    '<span class="fin-label" style="color:#fff; font-size:0.85rem; font-weight:900; letter-spacing:1px;">WYNIK KOŃCOWY</span>' +
                    '<span class="fin-val" style="font-size:1.4rem; font-weight:900; letter-spacing:-0.5px; color:'+(n >= 0 ? '#10b981' : '#ef4444')+'">'+Number(n).toFixed(2)+' zł</span>' +
                '</div>' +
            '</div>';

            let historyLogHtml = '<div class="panel" style="margin:0 15px 15px; padding:15px; border-radius:20px; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 8px 25px rgba(0,0,0,0.4);">' +
                '<div style="text-align:center; margin-bottom:15px;">' +
                    '<span style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:800; text-transform:uppercase; letter-spacing:1px;">Dziennik Zmian</span>' +
                '</div>';
            
            if(fs.length > 0) {
                for(let i=0; i<fs.length; i++) {
                    let x = fs[i];
                    historyLogHtml += '<div class="log-item" style="border:none; border-left:3px solid '+(x.n >= 0 ? '#10b981' : '#ef4444')+'; flex-direction:column; align-items:flex-start; padding:12px; margin-bottom:10px; border-radius:14px; background:rgba(0,0,0,0.2);">' +
                        '<div style="display:flex; justify-content:space-between; width:100%; margin-bottom:6px;">' +
                            '<div><strong style="font-size:0.95rem; color:#fff; font-weight:700;">'+x.dt+'</strong></div>' +
                            '<strong style="color:'+(x.n >= 0 ? '#10b981' : '#ef4444')+'; font-size:0.95rem;">Netto: '+Number(x.n || 0).toFixed(2)+' zł</strong>' +
                        '</div>' +
                        '<div style="display:flex; justify-content:space-between; width:100%; align-items:center;">' +
                            '<span style="color:rgba(255,255,255,0.4); font-size:0.65rem;">Brutto: <span style="color:#fff;">'+Number(x.g || 0).toFixed(2)+' zł</span> | '+Number(x.k || 0).toFixed(1)+' km</span>' +
                            '<div style="display:flex; gap:6px;">' +
                                '<button class="btn" style="padding:6px 10px; background:rgba(255,255,255,0.05); border:none; border-radius:8px; font-size:0.7rem; cursor:pointer; outline:none;" onclick="window.dEditHistory('+x.id+')">✏️</button>' +
                                '<button class="btn-danger" style="padding:6px 10px; border:none; border-radius:8px; font-weight:bold; background:rgba(239,68,68,0.15); color:#ef4444; font-size:0.7rem; cursor:pointer; outline:none;" onclick="window.dDelHistory('+x.id+')">🗑️</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                }
            } else {
                historyLogHtml += '<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:0.75rem;padding:20px 0; background:rgba(0,0,0,0.15); border-radius:14px; border:1px dashed rgba(255,255,255,0.05);">Brak zapisanych zmian w tym okresie.</div>';
            }
            historyLogHtml += '</div>';

            let appContainer = document.getElementById('app');
            if(appContainer) {
                appContainer.innerHTML = hdr + 
                '<div class="mode-switch" style="margin:12px 15px; border-radius:14px; padding:4px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05);">' +
                    '<div class="m-btn '+(fM==='today'?'active':'')+'" style="padding:10px; font-size:0.65rem; border-radius:10px; font-weight:700;" onclick="window.db.filter=\'today\'; window.render()">Dziś</div>' +
                    '<div class="m-btn '+(fM==='week'?'active':'')+'" style="padding:10px; font-size:0.65rem; border-radius:10px; font-weight:700;" onclick="window.db.filter=\'week\'; window.render()">Tydzień</div>' +
                    '<div class="m-btn '+(fM==='month'?'active':'')+'" style="padding:10px; font-size:0.65rem; border-radius:10px; font-weight:700;" onclick="window.db.filter=\'month\'; window.render()">Miesiąc</div>' +
                    '<div class="m-btn '+(fM==='all'?'active':'')+'" style="padding:10px; font-size:0.65rem; border-radius:10px; font-weight:700;" onclick="window.db.filter=\'all\'; window.render()">Całość</div>' +
                    '<div class="m-btn '+(fM==='custom'?'active':'')+'" style="padding:10px; font-size:0.65rem; border-radius:10px; font-weight:700;" onclick="window.db.filter=\'custom\'; window.render()">Własny</div>' +
                '</div>' +
                customDatesHtml +
                '<div style="display:flex; justify-content:center; gap:8px; margin-bottom:15px; padding:0 15px;">' +
                    '<button class="chip '+(window.db.drv.showFixed?'active':'')+'" style="font-size:0.65rem; padding:6px 12px; border-radius:16px; font-weight:800; background:'+(window.db.drv.showFixed?'rgba(255,255,255,0.1)':'transparent')+'; border:1px solid rgba(255,255,255,0.1); color:'+(window.db.drv.showFixed?'#fff':'var(--muted)')+';" onclick="window.db.drv.showFixed=true; window.render()">Koszty pełne</button>' +
                    '<button class="chip '+(!window.db.drv.showFixed?'active':'')+'" style="font-size:0.65rem; padding:6px 12px; border-radius:16px; font-weight:800; background:'+(!window.db.drv.showFixed?'rgba(255,255,255,0.1)':'transparent')+'; border:1px solid rgba(255,255,255,0.1); color:'+(!window.db.drv.showFixed?'#fff':'var(--muted)')+';" onclick="window.db.drv.showFixed=false; window.render()">Tylko Operacyjny</button>' +
                '</div>' +
                '<div class="dash-hero" style="padding-top:0; padding-bottom:15px; border-bottom:1px dashed rgba(255,255,255,0.05); margin-bottom:15px;">' +
                    '<p style="font-size:0.6rem; font-weight:800; color:rgba(255,255,255,0.4); letter-spacing:1px; text-transform:uppercase;">'+(window.db.drv.showFixed ? 'TWOJE PRAWDZIWE NETTO' : 'ZYSK Z KURSÓW (BEZ ZUS/AUTA)')+'</p>' +
                    '<h1 style="color:'+(n>=0?'#10b981':'#ef4444')+'; font-size:3rem; font-weight:900; letter-spacing:-1.5px; margin:0;">'+Number(n).toFixed(2)+' zł</h1>' +
                    transferButtonHtml +
                '</div>' +
                breakdownStatsHtml +
                
                '<div style="padding:0 15px; display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">' +
                    '<div style="display:flex; gap:10px;">' +
                        '<div class="box" style="flex:1; padding:12px; border-radius:16px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05);">' +
                            '<span style="color:#0ea5e9; font-size:0.6rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">Zysk / 1 km</span>' +
                            '<strong style="color:#fff; font-size:1.1rem; display:block; margin-top:4px;">'+Number(rKm).toFixed(2)+' zł</strong>' +
                        '</div>' +
                        '<div class="box" style="flex:1; padding:12px; border-radius:16px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05);">' +
                            '<span style="color:#d946ef; font-size:0.6rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">Zysk / 1 h</span>' +
                            '<strong style="color:#fff; font-size:1.1rem; display:block; margin-top:4px;">'+Number(rHr).toFixed(2)+' zł</strong>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex; gap:10px;">' +
                        '<div class="box" style="flex:1; padding:12px; border-radius:16px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05);">' +
                            '<span style="color:#10b981; font-size:0.6rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">Dni w pracy</span>' +
                            '<strong style="color:#fff; font-size:1.1rem; display:block; margin-top:4px;">'+daysToCharge+' dni</strong>' +
                        '</div>' +
                        '<div class="box" style="flex:1; padding:12px; border-radius:16px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05);">' +
                            '<span style="color:#f59e0b; font-size:0.6rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">Czas za kółkiem</span>' +
                            '<strong style="color:#fff; font-size:1.1rem; display:block; margin-top:4px;">'+Number(th).toFixed(1)+' h</strong>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex; gap:10px;">' +
                        '<div class="box" style="flex:1; border:1px solid rgba(16,185,129,0.1); background:rgba(16,185,129,0.05); padding:12px; border-radius:16px;">' +
                            '<span style="color:#10b981; font-size:0.6rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">KM z Klientem</span>' +
                            '<strong style="color:#fff; font-size:1.1rem; display:block; margin-top:4px;">'+Number(pkSum).toFixed(1)+' km</strong>' +
                        '</div>' +
                        '<div class="box" style="flex:1; border:1px solid rgba(239,68,68,0.1); background:rgba(239,68,68,0.05); padding:12px; border-radius:16px;">' +
                            '<span style="color:#ef4444; font-size:0.6rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">Puste (Dojazdy)</span>' +
                            '<strong style="color:#fff; font-size:1.1rem; display:block; margin-top:4px;">'+Number(emptyKSum).toFixed(1)+' km</strong>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                proBannerHtml +
                pAndLHtml +
                historyLogHtml +
                '<div style="height:140px; width:100%; clear:both;"></div>' + nav;
            }
        }
    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd w Panelu (taxi_tab_panel.js)</h3><p style="color:#ef4444; font-family:monospace; margin-bottom:20px;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; width:100%; box-shadow:0 10px 20px rgba(255,255,255,0.2);" onclick="window.location.reload()">ODŚWIEŻ APLIKACJĘ</button></div>';
        }
    }
};
