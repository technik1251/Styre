// ==========================================
// PLIK: taxi_tab_panel.js - Zakładki Panel (Term) i Wyniki (Stats)
// ==========================================

window.rDrvPanel = function(d, t, nav, hdr) {
    try {
        // ==========================================
        // ZAKŁADKA: PANEL (TERM) - TRWAJĄCA ZMIANA
        // ==========================================
        if(t === 'term') {
            if(!window.dTSrc || (d.plat === 'corp' && window.dTSrc === 'Inna')) { window.dTSrc = d.plat === 'apps' ? 'Uber' : 'Centrala'; }
            if(!window.dTPay) { window.dTPay = d.plat === 'apps' ? 'Aplikacja' : 'Gotówka'; }
            
            let ch1 = '';
            if(d.plat === 'apps') {
                ch1 = '<div class="chip '+(window.dTSrc==='Uber'?'active':'')+'" onclick="window.dTC(\'s\',\'Uber\')">Uber</div>' +
                      '<div class="chip '+(window.dTSrc==='Bolt'?'active':'')+'" onclick="window.dTC(\'s\',\'Bolt\')">Bolt</div>' +
                      '<div class="chip '+(window.dTSrc==='FreeNow'?'active':'')+'" onclick="window.dTC(\'s\',\'FreeNow\')">FreeNow</div>' +
                      '<div class="chip '+(window.dTSrc==='Inna'?'active':'')+'" onclick="window.dTC(\'s\',\'Inna\')">Inna...</div>';
            } else {
                ch1 = '<div class="chip '+(window.dTSrc==='Centrala'?'active':'')+'" onclick="window.dTC(\'s\',\'Centrala\')">Centrala</div>' +
                      '<div class="chip '+(window.dTSrc==='Postój'?'active':'')+'" onclick="window.dTC(\'s\',\'Postój\')">Postój</div>' +
                      '<div class="chip '+(window.dTSrc==='Prywatny'?'active':'')+'" onclick="window.dTC(\'s\',\'Prywatny\')">Prywatny</div>';
            }
            
            let otherSrcHtml = (d.plat === 'apps' && window.dTSrc === 'Inna') ? '<div class="inp-group" style="margin-top:10px;"><input type="text" id="dt-other-src" placeholder="Wpisz nazwę apki..." style="border-color:var(--warning); color:var(--warning); padding:10px;" value="'+(window.dOtherSrc||'')+'" onchange="window.dOtherSrc=this.value"></div>' : '';
            
            let ch2 = '';
            if(d.plat === 'apps') {
                ch2 = '<div class="chip '+(window.dTPay==='Aplikacja'?'active':'')+'" onclick="window.dTC(\'p\',\'Aplikacja\')">Aplikacja</div>' +
                      '<div class="chip '+(window.dTPay==='Gotówka'?'active':'')+'" style="'+(window.dTPay==='Gotówka'?'background:var(--success);color:#000;border-color:var(--success)':'color:var(--muted)')+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div>';
            } else {
                ch2 = '<div class="chip '+(window.dTPay==='Gotówka'?'active':'')+'" style="'+(window.dTPay==='Gotówka'?'background:var(--success);color:#000;border-color:var(--success)':'color:var(--muted)')+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div>' +
                      '<div class="chip '+(window.dTPay==='Karta'?'active':'')+'" onclick="window.dTC(\'p\',\'Karta\')" style="'+(window.dTPay==='Karta'?'background:#3b82f6;color:#fff;border-color:#3b82f6':'color:var(--muted)')+'">Karta</div>' +
                      '<div class="chip '+(window.dTPay==='Voucher'?'active':'')+'" onclick="window.dTC(\'p\',\'Voucher\')" style="'+(window.dTPay==='Voucher'?'background:#a855f7;color:#fff;border-color:#a855f7':'color:var(--muted)')+'">Voucher</div>';
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
            
            let stoperHtml = '<div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 8px; border-radius: 8px; margin-bottom: 12px; text-align: center; font-size: 0.65rem; color: var(--driver); text-transform:uppercase; font-weight:800; letter-spacing:1px;">🔒 Śledzenie GPS wkrótce!</div>';
            if(d.sh && d.sh.on) {
                if(d.liveRideStart) {
                    let isWaiting = d.sh.rWS !== null;
                    stoperHtml += '<div class="panel" style="border-color:'+(isWaiting?'var(--info)':'var(--success)')+'; text-align:center; background:'+(isWaiting?'rgba(14,165,233,0.05)':'rgba(34,197,94,0.05)')+'; padding:15px;">' +
                        '<div style="font-size:2rem; margin-bottom:5px;">'+(isWaiting?'⏳':'🟢')+'</div>' +
                        '<h3 style="color:'+(isWaiting?'var(--info)':'var(--success)')+'; margin:0 0 5px 0; font-size:1rem; text-transform:uppercase;">'+(isWaiting?'Oczekiwanie':'Kurs w toku!')+'</h3>' +
                        '<div style="display:flex; gap:10px; margin-top:10px;">' +
                            '<button class="btn" style="flex:1; padding:10px; font-size:0.8rem; background:'+(isWaiting?'var(--success)':'rgba(14,165,233,0.2)')+'; color:'+(isWaiting?'#000':'var(--info)')+'; border:1px solid var(--info);" onclick="window.toggleRideWait()">'+(isWaiting?'▶ RUSZAMY':'⏳ POSTÓJ')+'</button>' +
                            '<button class="btn btn-danger" style="flex:2; padding:10px; font-size:0.8rem;" onclick="window.stopLiveRide()">🔴 ZAKOŃCZ</button>' +
                        '</div></div>';
                } else {
                    stoperHtml += '<div class="panel" style="border-color:var(--success); text-align:center; padding:10px;">' +
                        '<button class="btn" style="background:var(--success); color:#000; font-size:0.9rem; font-weight:bold; padding:12px;" onclick="if(typeof window.startLiveRide===\'function\') window.startLiveRide()">🟢 ROZPOCZNIJ KURS (STOPER)</button></div>';
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
                    etaHtml = '<span style="color:var(--success);font-weight:bold;">🎉 Cel osiągnięty!</span>';
                } else {
                    etaHtml = 'Szacowanie... Czekam na pierwszy zarobek.';
                }
            }
            
            let breakdownHtml = '';
            if(d.sh && d.sh.on) {
                if(d.plat === 'apps') {
                    breakdownHtml = '<div style="display:flex; justify-content:space-between; gap:8px; margin-top:15px; padding:0 10px;">' +
                        '<div style="flex:1; background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.2); border-radius:10px; padding:8px; text-align:center;"><span style="font-size:0.55rem; color:var(--success); text-transform:uppercase; font-weight:bold;">Gotówka</span><br><strong style="color:#fff; font-size:1rem;">'+Number(sumCash).toFixed(2)+'</strong></div>' +
                        '<div style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:8px; text-align:center;"><span style="font-size:0.55rem; color:#fff; text-transform:uppercase; font-weight:bold;">Uber</span><br><strong style="color:#fff; font-size:1rem;">'+Number(sumUber).toFixed(2)+'</strong></div>' +
                        '<div style="flex:1; background:rgba(34,211,238,0.05); border:1px solid rgba(34,211,238,0.2); border-radius:10px; padding:8px; text-align:center;"><span style="font-size:0.55rem; color:#22d3ee; text-transform:uppercase; font-weight:bold;">Bolt</span><br><strong style="color:#fff; font-size:1rem;">'+Number(sumBolt).toFixed(2)+'</strong></div>' +
                    '</div>';
                } else {
                    breakdownHtml = '<div style="display:flex; justify-content:space-between; gap:8px; margin-top:15px; padding:0 10px;">' +
                        '<div style="flex:1; background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.2); border-radius:10px; padding:8px; text-align:center;"><span style="font-size:0.55rem; color:var(--success); text-transform:uppercase; font-weight:bold;">Gotówka</span><br><strong style="color:#fff; font-size:1rem;">'+Number(sumCash).toFixed(2)+'</strong></div>' +
                        '<div style="flex:1; background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:8px; text-align:center;"><span style="font-size:0.55rem; color:#3b82f6; text-transform:uppercase; font-weight:bold;">Karta</span><br><strong style="color:#fff; font-size:1rem;">'+Number(sumCard).toFixed(2)+'</strong></div>' +
                        '<div style="flex:1; background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.2); border-radius:10px; padding:8px; text-align:center;"><span style="font-size:0.55rem; color:#a855f7; text-transform:uppercase; font-weight:bold;">Voucher</span><br><strong style="color:#fff; font-size:1rem;">'+Number(sumVouch).toFixed(2)+'</strong></div>' +
                    '</div>';
                }
            }

            let act = '';
            if (d.sh && d.sh.on) {
                act = '<div class="dash-hero" style="padding-bottom:5px;">' +
                    '<p style="font-size:0.7rem; letter-spacing:1px;">'+displayLabel+'</p>' +
                    '<h1 style="font-size:2.8rem; color:'+(displayVal>=0?'var(--success)':'var(--danger)')+';">'+Number(displayVal||0).toFixed(2)+' zł</h1>' +
                    '<div style="display:flex; justify-content:center; gap:8px; margin-top:10px; margin-bottom:10px;">' +
                        '<button class="chip '+(!showGross?'active':'')+'" style="flex:none; padding: 6px 12px; font-size:0.7rem;" onclick="window.db.drv.panelMode=\'net\';window.render()">Netto (Operacyjne)</button>' +
                        '<button class="chip '+(showGross?'active':'')+'" style="flex:none; padding: 6px 12px; font-size:0.7rem;" onclick="window.db.drv.panelMode=\'gross\';window.render()">Brutto (Utarg)</button>' +
                    '</div>' +
                    '<div style="margin-top: 10px; padding: 0 15px;">' +
                        '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--muted); margin-bottom:5px; font-weight:bold;"><span>Cel: '+goal+' zł</span><span>'+Number(progressPct||0).toFixed(0)+'%</span></div>' +
                        '<div style="width:100%; background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;"><div style="width:'+progressPct+'%; background:'+(progressPct>=100?'var(--success)':'var(--driver)')+'; height:100%; transition:width 0.5s;"></div></div>' +
                        '<div style="font-size:0.7rem; color:var(--muted); text-align:center; margin-top:6px;">'+etaHtml+'</div>' +
                    '</div>' +
                    breakdownHtml +
                    '<div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:8px; display:inline-block; margin-top:15px;">' +
                        '<span style="font-size:0.65rem; color:var(--muted); text-transform:uppercase;">⏳ Czas pracy dniówki:</span><strong style="color:var(--info); font-size:0.9rem; margin-left:5px;">'+diffHrs+'h '+diffMins+'m</strong>' +
                    '</div>' +
                    '<div style="margin-top:10px; display:flex; gap:10px; padding:0 10px;">' +
                        '<button class="btn" style="flex:1; padding:10px; font-size:0.75rem; background:'+(d.sh.sPS?'var(--success)':'rgba(255,255,255,0.05)')+'; color:'+(d.sh.sPS?'#000':'var(--muted)')+'; border:1px solid '+(d.sh.sPS?'var(--success)':'rgba(255,255,255,0.2)')+'; box-shadow:none;" onclick="if(typeof window.toggleShiftPause===\'function\') window.toggleShiftPause()">'+(d.sh.sPS?'▶ WZNÓW':'☕ PRZERWA')+'</button>' +
                        '<button class="btn btn-danger" style="flex:1; padding:10px; font-size:0.75rem; margin-top:0;" onclick="if(typeof window.openEndShiftModal===\'function\') window.openEndShiftModal()">🔴 ZAKOŃCZ PRACĘ</button>' +
                    '</div>' +
                '</div>' +
                (d.sh.sPS ? '<div class="panel" style="border-color:var(--warning); text-align:center; padding:20px 10px;"><div style="font-size:2.5rem; margin-bottom:10px; animation: pulse 2s infinite;">☕</div><h2 style="color:var(--warning); margin:0 0 10px 0; font-size:1.2rem;">ZMIANA WSTRZYMANA</h2><button class="btn" style="background:var(--success); color:#000; padding:12px; font-size:0.9rem;" onclick="if(typeof window.toggleShiftPause===\'function\') window.toggleShiftPause()">▶ WZNÓW PRACĘ</button></div>' : stoperHtml) +
                '<div class="panel" style="border-color:rgba(59, 130, 246, 0.4); padding:12px; display:'+(d.sh.sPS?'none':'block')+';">' +
                    '<div class="form-section" style="padding:10px; margin-bottom:10px;"><div class="fs-title" style="margin-bottom:6px; font-size:0.65rem;">Źródło & Płatność</div><div class="chip-box" style="margin-bottom:8px; padding-bottom:0;">'+ch1+'</div>'+otherSrcHtml+'<div class="chip-box" style="margin-bottom:0; padding-bottom:0;">'+ch2+'</div></div>' +
                    '<div class="inp-group" style="margin-bottom:10px;"><label style="font-size:0.65rem;">Zwiąż z Klientem VIP</label><select id="dt-cid" style="padding:10px; font-size:0.8rem;"><option value="">-- Zwykły kurs --</option>'+clientOpts+'</select></div>' +
                    '<div class="form-section" style="padding:10px; border-color:rgba(59,130,246,0.3); background:rgba(59,130,246,0.05); margin-bottom:10px;"><input type="number" id="dt-v" class="big-inp" placeholder="Kwota (0.00)" style="color:var(--driver); border:none; background:rgba(0,0,0,0.5); font-size:2rem; padding:5px;"></div>' +
                    '<div class="inp-row" style="margin-bottom:5px;"><div class="inp-group"><input type="number" id="dt-m" placeholder="Czas (Min)" style="padding:10px; font-size:0.8rem;"></div><div class="inp-group"><input type="number" id="dt-k" placeholder="Dystans (KM)" style="padding:10px; font-size:0.8rem;"></div></div>' +
                    '<button class="btn btn-driver" style="margin-top:5px; padding:12px; font-size:0.9rem;" onclick="if(typeof window.dAddT===\'function\') window.dAddT()">DODAJ KURS DO PORTFELA</button>' +
                '</div>' +
                '<div class="panel" style="display:'+(d.sh.sPS?'none':'block')+'; padding:12px;">' +
                    '<div class="p-title" style="font-size:0.75rem; margin-bottom:10px;">Historia Zmiany</div>';
                    
                let trsList = d.sh.tr || [];
                if(trsList.length > 0) {
                    for(let i=0; i<trsList.length; i++) {
                        let x = trsList[i];
                        let icon='📱', color='var(--driver)', bg='rgba(59,130,246,0.1)';
                        if(x.p==='Gotówka') { icon='💵'; color='var(--success)'; bg='rgba(34,197,94,0.1)'; }
                        else if(x.p==='Karta') { icon='💳'; color='#f59e0b'; bg='rgba(245,158,11,0.1)'; }
                        else if(x.p==='Voucher') { icon='🎫'; color='#a855f7'; bg='rgba(168,85,247,0.1)'; }
                        
                        act += '<div class="log-item" style="border-left:4px solid '+color+'; padding:10px; margin-bottom:8px; background:linear-gradient(90deg, '+bg+' 0%, transparent 100%); border-radius:10px;">' +
                            '<div style="display:flex; align-items:center; gap:10px; flex:1;">' +
                                '<div style="font-size:1.2rem; width:35px; height:35px; background:rgba(0,0,0,0.5); border:1px solid '+color+'55; border-radius:8px; display:flex; align-items:center; justify-content:center;">'+icon+'</div>' +
                                '<div style="flex:1;">' +
                                    '<strong style="font-size:1rem; color:#fff;">'+Number(x.v||0).toFixed(2)+' zł</strong>' +
                                    '<div style="display:flex; gap:6px; font-size:0.65rem; color:var(--muted); margin-top:2px;">' +
                                        '<span>'+(x.time||'--:--')+'</span><span>•</span><span style="color:'+color+'; font-weight:bold;">'+x.p+'</span><span>•</span><span>'+x.s+'</span>' +
                                        (x.k>0 ? '<span>•</span><span>'+Number(x.k).toFixed(1)+' km</span>' : '') +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div style="display:flex; flex-direction:column; gap:4px;">' +
                                '<button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:6px; padding:5px; cursor:pointer; font-size:0.7rem;" onclick="if(typeof window.dEditT===\'function\') window.dEditT('+x.id+')">✏️</button>' +
                                '<button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:5px; cursor:pointer; font-size:0.7rem;" onclick="if(typeof window.dDelT===\'function\') window.dDelT('+x.id+')">🗑️</button>' +
                            '</div>' +
                        '</div>';
                    }
                } else {
                    act += '<div style="text-align:center;color:var(--muted);padding:15px 0;font-size:0.75rem;">Brak kursów.</div>';
                }
                act += '</div>';
            } else {
                act = '<div class="dash-hero" style="padding-top:30px;">' +
                    '<div style="width:70px;height:70px;background:linear-gradient(135deg,var(--success),#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 15px;font-size:2rem;box-shadow:0 10px 25px rgba(34,197,94,0.3);">🚗</div>' +
                    '<h1 style="font-size:2rem;">Cześć, '+(window.db.userName || 'Kierowco')+'!</h1>' +
                    '<p style="margin-top:8px; font-size:0.8rem;">Aby rozpocząć, potwierdź stan licznika</p>' +
                '</div>' +
                '<div class="panel" style="border-color:var(--success); box-shadow:0 10px 30px rgba(34,197,94,0.1); padding:20px 15px;">' +
                    '<div class="inp-group"><input type="number" id="ds-o" class="big-inp" value="'+((d.odo||0)>0?d.odo:'')+'" placeholder="Stan licznika (KM)" style="font-size:1.8rem; padding:10px;"></div>' +
                    '<button class="btn" style="background:linear-gradient(135deg, var(--success), #059669); color:#fff; font-size:1rem; font-weight:bold; padding:15px; margin-top:15px;" onclick="if(typeof window.dStartS===\'function\') window.dStartS()">ROZPOCZNIJ PRACĘ</button>' +
                '</div>';
                
                if(!window.dShowOff) {
                    act += '<div style="padding:0 15px;"><button class="btn" style="background:rgba(14,165,233,0.1); color:var(--info); border:1px dashed rgba(14,165,233,0.4); margin-top:10px; font-size:0.75rem; box-shadow:none; width: 100%; padding:12px;" onclick="window.dShowOff=true; window.render()">📥 WPROWADŹ UTARG Z RAPORTU (WBITKA)</button></div>';
                } else {
                    act += '<div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:20px; font-size:0.7rem;">⚡ Zaległe rozliczenie / Raport z Kasy</div>' +
                    '<div class="panel" style="border-color:rgba(14,165,233,0.4); animation:fadeIn 0.3s; padding:15px;">' +
                        '<div class="form-section" style="padding:10px; margin-bottom:10px;"><div class="fs-title" style="margin-bottom:6px; font-size:0.65rem;">'+(d.plat==='apps'?'Aplikacja Docelowa':'Główne Źródło (Centrala)')+'</div><div class="chip-box" style="margin-bottom:0; padding-bottom:0;">'+ch1+'</div>'+otherSrcHtml+'</div>' +
                        '<div class="inp-row" style="margin-bottom:10px;"><div class="inp-group"><label style="font-size:0.65rem;">Data Od</label><input type="date" id="dw-d-from" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" style="padding:10px; font-size:0.8rem;"></div><div class="inp-group"><label style="font-size:0.65rem;">Data Do</label><input type="date" id="dw-d-to" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" style="padding:10px; font-size:0.8rem;"></div></div>' +
                        '<div class="inp-group" style="margin-bottom:10px;"><input type="number" id="dw-v" class="big-inp" placeholder="Brutto łącznie (zł)" style="color:var(--info); border:none; background:rgba(0,0,0,0.5); font-size:1.8rem; padding:10px;"></div>' +
                        '<div class="inp-row" style="margin-bottom:10px;"><div class="inp-group"><input type="number" id="dw-k" placeholder="Dystans (KM)" style="padding:10px; font-size:0.8rem;"></div><div class="inp-group"><input type="number" id="dw-c" placeholder="Z tego w gotówce (zł)" style="padding:10px; font-size:0.8rem;"></div></div>' +
                        '<div class="inp-group" style="margin-top:10px;"><input type="number" id="dw-h" placeholder="Przepracowane godziny (Opcjonalnie)" style="padding:10px; font-size:0.8rem;"></div>' +
                        '<button class="btn" style="background:var(--info); color:#fff; margin-top:10px; padding:12px; font-size:0.85rem;" onclick="if(typeof window.dAddOfflineWeekly===\'function\') window.dAddOfflineWeekly()">ZAKSIĘGUJ DO HISTORII</button>' +
                        '<button class="btn" style="background:transparent; color:var(--muted); margin-top:5px; border:1px solid rgba(255,255,255,0.1); box-shadow:none; padding:10px; font-size:0.8rem;" onclick="window.dShowOff=false; window.render()">ANULUJ</button>' +
                    '</div>';
                }
            }
            
            let appContainer = document.getElementById('app');
            if(appContainer) appContainer.innerHTML = hdr + act + '<div style="padding-bottom:60px;"></div>' + nav;
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
                breakdownStatsHtml = '<div class="grid-3" style="padding:0 15px; margin-bottom:15px; display:flex; gap:10px;">' +
                    '<div class="box" style="flex:1; border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05); padding:10px;"><span style="color:var(--success); font-size:0.55rem; font-weight:bold;">GOTÓWKA</span><strong style="color:#fff; font-size:0.95rem; display:block;">'+Number(cashEarned).toFixed(2)+'</strong></div>' +
                    '<div class="box" style="flex:1; border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.05); padding:10px;"><span style="color:#fff; font-size:0.55rem; font-weight:bold;">UBER</span><strong style="color:#fff; font-size:0.95rem; display:block;">'+Number(uberEarned).toFixed(2)+'</strong></div>' +
                    '<div class="box" style="flex:1; border-color:rgba(34,211,238,0.3); background:rgba(34,211,238,0.05); padding:10px;"><span style="color:#22d3ee; font-size:0.55rem; font-weight:bold;">BOLT</span><strong style="color:#fff; font-size:0.95rem; display:block;">'+Number(boltEarned).toFixed(2)+'</strong></div>' +
                '</div>';
            } else {
                breakdownStatsHtml = '<div class="grid-3" style="padding:0 15px; margin-bottom:15px; display:flex; gap:10px;">' +
                    '<div class="box" style="flex:1; border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05); padding:10px;"><span style="color:var(--success); font-size:0.55rem; font-weight:bold;">GOTÓWKA</span><strong style="color:#fff; font-size:0.95rem; display:block;">'+Number(cashEarned).toFixed(2)+'</strong></div>' +
                    '<div class="box" style="flex:1; border-color:rgba(59,130,246,0.3); background:rgba(59,130,246,0.05); padding:10px;"><span style="color:#3b82f6; font-size:0.55rem; font-weight:bold;">KARTA</span><strong style="color:#fff; font-size:0.95rem; display:block;">'+Number(cardEarned).toFixed(2)+'</strong></div>' +
                    '<div class="box" style="flex:1; border-color:rgba(168,85,247,0.3); background:rgba(168,85,247,0.05); padding:10px;"><span style="color:#a855f7; font-size:0.55rem; font-weight:bold;">VOUCHERY</span><strong style="color:#fff; font-size:0.95rem; display:block;">'+Number(vouchEarned).toFixed(2)+'</strong></div>' +
                '</div>';
            }

            let customDatesHtml = fM === 'custom' ? '<div style="display:flex;gap:10px;padding:0 15px;margin-bottom:15px;">' +
                '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem;">Od</label><input type="date" value="'+(window.db.filterFrom||'')+'" onchange="window.db.filterFrom=this.value; window.render()" style="padding:8px; font-size:0.75rem;"></div>' +
                '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem;">Do</label><input type="date" value="'+(window.db.filterTo||'')+'" onchange="window.db.filterTo=this.value; window.render()" style="padding:8px; font-size:0.75rem;"></div>' +
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
                transferButtonHtml = '<button class="btn btn-success" style="margin-top:12px; width:calc(100% - 30px); margin-left:auto; margin-right:auto; font-weight:bold; box-shadow: 0 0 15px rgba(34,197,94,0.3); padding:12px;" onclick="if(typeof window.dTransferToHomeModal===\'function\') window.dTransferToHomeModal()"><span style="font-size:1rem; margin-right:8px;">💸</span> PRZELEJ GOTÓWKĘ DO BUDŻETU<br><small style="font-weight:normal; font-size:0.7rem; color:rgba(0,0,0,0.7); display:block; margin-top:2px;">Nierozliczone: '+Number(availableCashForTransfer).toFixed(2)+' zł</small></button>';
            } else {
                transferButtonHtml = '<button class="btn" style="margin-top:12px; width:calc(100% - 30px); margin-left:auto; margin-right:auto; font-weight:bold; background:rgba(255,255,255,0.05); color:var(--muted); border:1px solid rgba(255,255,255,0.1); cursor:not-allowed; padding:12px;" disabled><span style="font-size:1rem; margin-right:8px;">✅</span> GOTÓWKA ROZLICZONA<br><small style="font-weight:normal; font-size:0.7rem; display:block; margin-top:2px;">Zaksięgowano w Domu: '+Number(totalTransferred).toFixed(2)+' zł</small></button>';
            }

            let proBannerHtml = '';
            if (d.plat === 'apps') {
                proBannerHtml = '<div style="margin: 15px 15px 10px; padding: 12px; background: linear-gradient(135deg, rgba(217, 70, 239, 0.1), rgba(139, 92, 246, 0.1)); border: 1px dashed rgba(217, 70, 239, 0.4); border-radius: 12px; cursor: pointer; text-align: center; box-shadow: 0 4px 15px rgba(217, 70, 239, 0.1);" onclick="if(typeof window.sysAlert===\'function\') window.sysAlert(\'Inteligentny Asystent Zleceń (PRO)\', \'Wkrótce udostępnimy aplikację StyreOS PRO! Nakładka na ekran odczyta szczegóły zlecenia bezpośrednio z aplikacji partnerskiej i w ułamku sekundy pokaże Ci zysk na czysto na malutkim bąbelku, zanim zdążysz to zaakceptować! 🚀\', \'info\')">' +
                    '<div style="font-size: 1.5rem; margin-bottom: 4px;">🔮</div>' +
                    '<strong style="color: #e879f9; font-size: 0.8rem; display: block; text-transform: uppercase;">Inteligentny Asystent Zleceń</strong>' +
                    '<span style="font-size: 0.65rem; color: var(--muted); margin-top: 4px; display: block;">Pływająca nakładka opłacalności wkrótce w wersji PRO! Kliknij.</span>' +
                '</div>';
            } else {
                proBannerHtml = '<div style="margin: 15px 15px 10px; padding: 12px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(14, 165, 233, 0.1)); border: 1px dashed rgba(59, 130, 246, 0.4); border-radius: 12px; cursor: pointer; text-align: center; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);" onclick="if(typeof window.sysAlert===\'function\') window.sysAlert(\'Integracja e-Kasy / RT3000 (PRO)\', \'W wersji StyreOS PRO wprowadzimy bezpośrednią integrację z systemami korporacyjnymi i kasami wirtualnymi (API). Zlecenia i e-paragony będą wpadać do aplikacji w 100% automatycznie! 🖨️☁️\', \'info\')">' +
                    '<div style="font-size: 1.5rem; margin-bottom: 4px;">📡</div>' +
                    '<strong style="color: #60a5fa; font-size: 0.8rem; display: block; text-transform: uppercase;">Integracja e-Kasy / RT3000</strong>' +
                    '<span style="font-size: 0.65rem; color: var(--muted); margin-top: 4px; display: block;">Automatyczne zaciąganie kursów (API) wkrótce w wersji PRO! Kliknij.</span>' +
                '</div>';
            }

            let pAndLHtml = '<div class="panel" style="padding:15px 12px; margin:0 15px 15px;">' +
                '<div class="p-title" style="font-size:0.8rem; margin-bottom:12px;">Wodospad Finansowy (P&L)</div>' +
                '<div class="fin-row" style="font-size:0.8rem; margin-bottom:6px;"><span class="fin-label">Utarg Brutto z aplikacji</span><span class="fin-val" style="color:var(--success)">'+Number(g).toFixed(2)+' zł</span></div>' +
                '<div class="fin-row" style="font-size:0.8rem; margin-bottom:6px;"><span class="fin-label">Wydatki Zmienne (Garaż)</span><span class="fin-val" style="color:var(--danger)">-'+Number(ex).toFixed(2)+' zł</span></div>' +
                '<div class="fin-row" style="font-size:0.8rem; margin-bottom:6px;"><span class="fin-label">Paliwo z przejechanych tras</span><span class="fin-val" style="color:var(--fuel)">-'+Number(fc).toFixed(2)+' zł</span></div>' +
                (cf > 0 ? '<div class="fin-row" style="font-size:0.8rem; margin-bottom:6px;"><span class="fin-label" style="color:var(--info)">Prowizja Terminala</span><span class="fin-val" style="color:var(--danger)">-'+Number(cf).toFixed(2)+' zł</span></div>' : '') +
                (vf > 0 ? '<div class="fin-row" style="font-size:0.8rem; margin-bottom:6px;"><span class="fin-label" style="color:#a855f7">Prowizja (Vouchery)</span><span class="fin-val" style="color:var(--danger)">-'+Number(vf).toFixed(2)+' zł</span></div>' : '') +
                (pf > 0 ? '<div class="fin-row" style="font-size:0.8rem; margin-bottom:6px;"><span class="fin-label">Prowizja Partnera</span><span class="fin-val" style="color:var(--danger)">-'+Number(pf).toFixed(2)+' zł</span></div>' : '') +
                '<div class="fin-row" style="font-size:0.8rem; margin-bottom:6px;"><span class="fin-label">Podatek Dochodowy/VAT</span><span class="fin-val" style="color:var(--danger)">-'+Number(tx).toFixed(2)+' zł</span></div>' +
                '<div class="fin-row" style="align-items:flex-start; font-size:0.8rem; margin-bottom:6px;">' +
                    '<div style="display:flex; flex-direction:column; max-width:70%;"><span class="fin-label" style="color:#fff;">Odpisy Stałe '+(!window.db.drv.showFixed ? '(Wyłączone)' : '(Za '+daysToCharge+' dni)')+'</span></div>' +
                    '<span class="fin-val" style="color:var(--danger); padding-top:2px;">-'+Number(totalDynamicFix).toFixed(2)+' zł</span>' +
                '</div>' +
                '<div class="fin-row" style="background:#000; margin-top:12px; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">' +
                    '<span class="fin-label" style="color:#fff; font-size:0.85rem; font-weight:bold;">WYNIK KOŃCOWY</span>' +
                    '<span class="fin-val" style="font-size:1.1rem; font-weight:bold; color:'+(n >= 0 ? 'var(--success)' : 'var(--danger)')+'">'+Number(n).toFixed(2)+' zł</span>' +
                '</div>' +
            '</div>';

            let historyLogHtml = '<div class="panel" style="margin:0 15px 15px; padding:15px 12px;">' +
                '<div class="p-title" style="font-size:0.8rem; margin-bottom:12px;">Dziennik Zmian (Historia)</div>';
            
            if(fs.length > 0) {
                for(let i=0; i<fs.length; i++) {
                    let x = fs[i];
                    historyLogHtml += '<div class="log-item" style="border-left-color:'+(x.n >= 0 ? 'var(--success)' : 'var(--danger)')+'; flex-direction:column; align-items:flex-start; padding:10px; margin-bottom:8px; border-radius:10px; background:rgba(255,255,255,0.02);">' +
                        '<div style="display:flex; justify-content:space-between; width:100%; margin-bottom:6px;">' +
                            '<div><strong style="font-size:0.95rem; color:#fff;">'+x.dt+'</strong></div>' +
                            '<strong style="color:'+(x.n >= 0 ? 'var(--success)' : 'var(--danger)')+'; font-size:0.95rem;">Operacyjny: '+Number(x.n || 0).toFixed(2)+' zł</strong>' +
                        '</div>' +
                        '<div style="display:flex; justify-content:space-between; width:100%; align-items:center;">' +
                            '<small style="color:var(--muted); font-size:0.7rem;">Brutto: '+Number(x.g || 0).toFixed(2)+' zł | '+Number(x.k || 0).toFixed(1)+' km</small>' +
                            '<div style="display:flex; gap:5px;">' +
                                '<button class="btn" style="padding:6px 10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; font-size:0.7rem;" onclick="if(typeof window.dEditHistory===\'function\') window.dEditHistory('+x.id+')">✏️</button>' +
                                '<button class="btn-danger" style="padding:6px 10px; border:none; border-radius:6px; font-weight:bold; background:rgba(239,68,68,0.15); color:var(--danger); font-size:0.7rem;" onclick="if(typeof window.dDelHistory===\'function\') window.dDelHistory('+x.id+')">🗑️</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                }
            } else {
                historyLogHtml += '<div style="text-align:center;color:var(--muted);font-size:0.75rem;padding:15px 0;">Brak zapisanych zmian.</div>';
            }
            historyLogHtml += '</div>';

            let appContainer = document.getElementById('app');
            if(appContainer) {
                appContainer.innerHTML = hdr + 
                '<div class="mode-switch" style="margin:10px 15px; border-radius:10px; padding:4px;">' +
                    '<div class="m-btn '+(fM==='today'?'active':'')+'" style="padding:6px; font-size:0.7rem;" onclick="window.db.filter=\'today\'; window.render()">Dziś</div>' +
                    '<div class="m-btn '+(fM==='week'?'active':'')+'" style="padding:6px; font-size:0.7rem;" onclick="window.db.filter=\'week\'; window.render()">Tydzień</div>' +
                    '<div class="m-btn '+(fM==='month'?'active':'')+'" style="padding:6px; font-size:0.7rem;" onclick="window.db.filter=\'month\'; window.render()">Miesiąc</div>' +
                    '<div class="m-btn '+(fM==='all'?'active':'')+'" style="padding:6px; font-size:0.7rem;" onclick="window.db.filter=\'all\'; window.render()">Całość</div>' +
                    '<div class="m-btn '+(fM==='custom'?'active':'')+'" style="padding:6px; font-size:0.7rem;" onclick="window.db.filter=\'custom\'; window.render()">Własny</div>' +
                '</div>' +
                customDatesHtml +
                '<div style="display:flex; justify-content:center; gap:8px; margin-bottom:15px; padding:0 15px;">' +
                    '<button class="chip '+(window.db.drv.showFixed?'active':'')+'" style="font-size:0.7rem; padding:6px 12px;" onclick="window.db.drv.showFixed=true; window.render()">Koszty pełne (Netto)</button>' +
                    '<button class="chip '+(!window.db.drv.showFixed?'active':'')+'" style="font-size:0.7rem; padding:6px 12px; background:'+(!window.db.drv.showFixed?'var(--info)':'rgba(255,255,255,0.03)')+'; border-color:'+(!window.db.drv.showFixed?'var(--info)':'rgba(255,255,255,0.05)')+'; color:'+(!window.db.drv.showFixed?'#fff':'var(--muted)')+';" onclick="window.db.drv.showFixed=false; window.render()">Tylko Operacyjny</button>' +
                '</div>' +
                '<div class="dash-hero" style="padding-top:0; padding-bottom:15px;">' +
                    '<p style="font-size:0.7rem; letter-spacing:1px;">'+(window.db.drv.showFixed ? 'TWOJE PRAWDZIWE NETTO' : 'ZYSK Z KURSÓW (BEZ ZUS/AUTA)')+'</p>' +
                    '<h1 style="color:'+(n>=0?'var(--success)':'var(--danger)')+'; font-size:2.8rem; letter-spacing:-1px;">'+Number(n).toFixed(2)+' zł</h1>' +
                    transferButtonHtml +
                '</div>' +
                breakdownStatsHtml +
                '<div class="grid-2" style="padding:0 15px; margin-bottom:10px; gap:10px;">' +
                    '<div class="box" style="padding:12px;"><span style="color:var(--info); font-size:0.65rem; text-transform:uppercase; font-weight:bold;">Zysk / 1 km</span><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:2px;">'+Number(rKm).toFixed(2)+' zł</strong></div>' +
                    '<div class="box" style="padding:12px;"><span style="color:var(--quote); font-size:0.65rem; text-transform:uppercase; font-weight:bold;">Zysk / 1 h</span><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:2px;">'+Number(rHr).toFixed(2)+' zł</strong></div>' +
                '</div>' +
                '<div class="grid-2" style="padding:0 15px; margin-bottom:10px; gap:10px;">' +
                    '<div class="box" style="padding:12px;"><span style="color:var(--success); font-size:0.65rem; text-transform:uppercase; font-weight:bold;">Dni w pracy</span><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:2px;">'+daysToCharge+' dni</strong></div>' +
                    '<div class="box" style="padding:12px;"><span style="color:var(--warning); font-size:0.65rem; text-transform:uppercase; font-weight:bold;">Godziny za kółkiem</span><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:2px;">'+Number(th).toFixed(1)+' h</strong></div>' +
                '</div>' +
                '<div class="grid-2" style="padding:0 15px; margin-bottom:15px; gap:10px;">' +
                    '<div class="box" style="border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05); padding:12px;"><span style="color:var(--success); font-size:0.65rem; text-transform:uppercase; font-weight:bold;">KM z Klientem</span><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:2px;">'+Number(pkSum).toFixed(1)+' km</strong></div>' +
                    '<div class="box" style="border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.05); padding:12px;"><span style="color:var(--danger); font-size:0.65rem; text-transform:uppercase; font-weight:bold;">Puste KM (Dojazdy)</span><strong style="color:#fff; font-size:1.1rem; display:block; margin-top:2px;">'+Number(emptyKSum).toFixed(1)+' km</strong></div>' +
                '</div>' +
                proBannerHtml +
                pAndLHtml +
                historyLogHtml +
                '<div style="padding-bottom:60px;"></div>' + nav;
            }
        }
    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:40px 20px; text-align:center; color:white;"><h3>Błąd w Panelu / Wynikach</h3><p style="color:var(--danger);">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; margin-top:20px;" onclick="window.location.reload()">ODŚWIEŻ</button></div>' + (nav || '');
        }
    }
};
