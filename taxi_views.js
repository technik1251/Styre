// ==========================================
// PLIK: taxi_views.js - Interfejs Taxi
// ==========================================

window.renderGarageHistory = function() {
    let expList = (window.db && window.db.drv && window.db.drv.exp) ? window.db.drv.exp : [];
    
    return expList.map(x => {
        if(x.ty === 'f') {
            let dist = x.dist || 0;
            let l100 = x.l100 || 0;
            let cpkm = x.cpkm || 0;
            let l = x.l || 0;
            let odo = x.odo || 0;
            let full = x.isF === 1 ? 'Pod korek' : 'Częściowo';
            let statsHtml = '';
            
            if (x.isF === 1 && dist > 0) {
                statsHtml = `
                <div style="display:flex; justify-content:space-between; width:100%; margin-top:12px; padding-top:12px; border-top:1px dashed rgba(255,255,255,0.1); font-size:0.8rem;">
                    <div style="text-align:center;"><span style="color:var(--muted); font-size:0.65rem; text-transform:uppercase;">Dystans</span><br><strong style="color:#fff;">${Number(dist||0).toFixed(1)} km</strong></div>
                    <div style="text-align:center;"><span style="color:var(--muted); font-size:0.65rem; text-transform:uppercase;">Spalanie</span><br><strong style="color:var(--info);">${Number(l100||0).toFixed(1)} L</strong></div>
                    <div style="text-align:center;"><span style="color:var(--muted); font-size:0.65rem; text-transform:uppercase;">Koszt/KM</span><br><strong style="color:var(--danger);">${Number(cpkm||0).toFixed(2)} zł</strong></div>
                </div>`;
            } else if (x.isF === 0) {
                statsHtml = `<div style="margin-top:10px; font-size:0.75rem; color:var(--warning); text-align:center; width:100%; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">Częściowe tankowanie. Brak pomiaru spalania.</div>`;
            } else {
                statsHtml = `<div style="margin-top:10px; font-size:0.75rem; color:var(--muted); text-align:center; width:100%; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">Zatankuj ponownie, aby obliczyć spalanie.</div>`;
            }
            
            return `
            <div class="log-item" style="border-left-color:var(--fuel); flex-direction:column; align-items:flex-start;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:flex-start;">
                    <div><strong style="color:#fff; font-size:1.1rem;">${x.d} <span style="color:var(--fuel)">${Number(l||0).toFixed(1)}L</span></strong><br><small style="color:var(--muted)">${x.dt} • ODO: <span style="color:#fff">${odo}</span> (${full})</small></div>
                    <div style="text-align:right;">
                        <strong style="color:var(--fuel); font-size:1.2rem;">-${Number(x.v || 0).toFixed(2)} zł</strong>
                        <div style="display:flex; gap:5px; margin-top:5px; justify-content:flex-end;">
                            <button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.dEditExp(${x.id})">✏️</button>
                            <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.dDelExp(${x.id})">🗑️</button>
                        </div>
                    </div>
                </div>
                ${statsHtml}
            </div>`;
        } else {
            let col = x.ty === 'amort' ? 'var(--info)' : 'var(--danger)';
            let pref = x.ty === 'amort' ? '' : '-';
            return `
            <div class="log-item" style="border-left-color:${col}; flex-direction:column; align-items:flex-start;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <div><strong style="color:#fff; font-size:1.05rem;">${x.d}</strong><br><small style="color:var(--muted)">${x.dt}</small></div>
                    <div style="text-align:right;">
                        <strong style="color:${col}">${pref}${Number(x.v || 0).toFixed(2)} zł</strong>
                        <div style="display:flex; gap:5px; margin-top:5px; justify-content:flex-end;">
                            <button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.dEditExp(${x.id})">✏️</button>
                            <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" onclick="window.dDelExp(${x.id})">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    }).join('') || '<div style="text-align:center;color:var(--muted);padding:10px;">Brak wpisów.</div>';
};

window.rDrv = function() {
    let d = (window.db && window.db.drv) ? window.db.drv : {cfg:{}, sh:{tr:[]}, q:{}, clients:[]};
    let t = window.db.tab || 'term';
    
    let nav = `
    <div class="nav">
        <div class="nav-item ${t==='term'?'active':''}" onclick="window.db.tab='term'; window.render();"><i>🚕</i>Panel</div>
        <div class="nav-item ${t==='quote'?'active':''}" onclick="window.db.tab='quote'; window.render();"><i>🧮</i>Wycena</div>
        <div class="nav-item ${t==='garage'?'active':''}" onclick="window.db.tab='garage'; window.render();"><i>⛽</i>Garaż</div>
        <div class="nav-item ${t==='stats'?'active':''}" onclick="window.db.tab='stats'; window.render();"><i>📊</i>Wyniki</div>
        <div class="nav-item ${t==='set'?'active':''}" onclick="window.db.tab='set'; window.render();"><i>⚙️</i>Opcje</div>
    </div>`;
    
    let hdr = `
    <header>
        <button class="logo" onclick="window.openSwitcher()">S</button>
        <div class="header-actions">
            <div class="badge" style="color:var(--fuel); border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.1);">${Number(d.odo||0).toFixed(0)} KM</div>
        </div>
    </header>`;
    
    // ==========================================
    // ZAKŁADKA: PANEL (TERM)
    // ==========================================
    if(t === 'term') {
        if(!window.dTSrc || (d.plat === 'corp' && window.dTSrc === 'Inna')) { window.dTSrc = d.plat === 'apps' ? 'Uber' : 'Centrala'; }
        if(!window.dTPay) { window.dTPay = d.plat === 'apps' ? 'Aplikacja' : 'Gotówka'; }
        
        let ch1 = d.plat === 'apps' ? 
            `<div class="chip ${window.dTSrc==='Uber'?'active':''}" onclick="window.dTC('s','Uber')">Uber</div><div class="chip ${window.dTSrc==='Bolt'?'active':''}" onclick="window.dTC('s','Bolt')">Bolt</div><div class="chip ${window.dTSrc==='FreeNow'?'active':''}" onclick="window.dTC('s','FreeNow')">FreeNow</div><div class="chip ${window.dTSrc==='Inna'?'active':''}" onclick="window.dTC('s','Inna')">Inna...</div>` : 
            `<div class="chip ${window.dTSrc==='Centrala'?'active':''}" onclick="window.dTC('s','Centrala')">Centrala</div><div class="chip ${window.dTSrc==='Postój'?'active':''}" onclick="window.dTC('s','Postój')">Postój</div><div class="chip ${window.dTSrc==='Prywatny'?'active':''}" onclick="window.dTC('s','Prywatny')">Prywatny</div>`;
        
        let otherSrcHtml = (d.plat === 'apps' && window.dTSrc === 'Inna') ? `<div class="inp-group" style="margin-top:10px;"><input type="text" id="dt-other-src" placeholder="Wpisz nazwę apki..." style="border-color:var(--warning); color:var(--warning)" value="${window.dOtherSrc||''}" onchange="window.dOtherSrc=this.value"></div>` : '';
        
        let ch2 = d.plat === 'apps' ? 
            `<div class="chip ${window.dTPay==='Aplikacja'?'active':''}" onclick="window.dTC('p','Aplikacja')">Aplikacja</div><div class="chip ${window.dTPay==='Gotówka'?'active':''}" style="${window.dTPay==='Gotówka'?'background:var(--success);color:#000;border-color:var(--success)':'color:var(--muted)'}" onclick="window.dTC('p','Gotówka')">Gotówka</div>` : 
            `<div class="chip ${window.dTPay==='Gotówka'?'active':''}" style="${window.dTPay==='Gotówka'?'background:var(--success);color:#000;border-color:var(--success)':'color:var(--muted)'}" onclick="window.dTC('p','Gotówka')">Gotówka</div><div class="chip ${window.dTPay==='Karta'?'active':''}" onclick="window.dTC('p','Karta')" style="${window.dTPay==='Karta'?'background:#3b82f6;color:#fff;border-color:#3b82f6':'color:var(--muted)'}">Karta</div><div class="chip ${window.dTPay==='Voucher'?'active':''}" onclick="window.dTC('p','Voucher')" style="${window.dTPay==='Voucher'?'background:#a855f7;color:#fff;border-color:#a855f7':'color:var(--muted)'}">Voucher</div>`;
        
        let clientOpts = (d.clients || []).map(c => `<option value="${c.id}">${c.n}</option>`).join('');
        
        let now = new Date();
        let dim = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
        let getDaily = (val, p, dim) => { let v = parseFloat(val)||0; if(p==='week') return v/7; if(p==='year') return v/365; return v/dim; };
        
        let cfg = d.cfg || {};
        let dailyFix = getDaily(cfg.bC, cfg.bPeriod, dim) + getDaily(cfg.iC, cfg.iPeriod, dim) + getDaily(cfg.cC, cfg.cType, dim) + getDaily(cfg.uC, cfg.uType, dim) + (cfg.eType === 'flat' ? getDaily(cfg.eC, cfg.ePeriod, dim) : 0);
        
        let g=0, cf=0, vf=0, curK=0, sumCash=0, sumCard=0, sumVouch=0, sumApp=0, sumUber=0, sumBolt=0;
        
        if(d.sh && d.sh.on && d.sh.tr) {
            d.sh.tr.forEach(x => {
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
            });
        }
        
        let pFee = cfg.eType === 'pct' ? g * (cfg.ePct || 0) : 0;
        let tax = g * (cfg.tax || 0);
        let fuelC = curK * (cfg.fuelPx || 0);
        let n = g - tax - pFee - cf - vf - fuelC - dailyFix;
        
        let stoperHtml = `<div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 10px; border-radius: 12px; margin-bottom: 15px; text-align: center; font-size: 0.7rem; color: var(--driver); text-transform:uppercase; font-weight:800; letter-spacing:1px;">🔒 Śledzenie GPS wkrótce!</div>`;
        if(d.sh && d.sh.on) {
            if(d.liveRideStart) {
                let isWaiting = d.sh.rWS !== null;
                stoperHtml += `<div class="panel" style="border-color:${isWaiting?'var(--info)':'var(--success)'}; text-align:center; background:${isWaiting?'rgba(14,165,233,0.05)':'rgba(34,197,94,0.05)'}; padding:20px;"><div style="font-size:2.5rem; margin-bottom:5px;">${isWaiting?'⏳':'🟢'}</div><h3 style="color:${isWaiting?'var(--info)':'var(--success)'}; margin:0 0 5px 0; text-transform:uppercase;">${isWaiting?'Oczekiwanie':'Kurs w toku!'}</h3><div style="display:flex; gap:10px; margin-top:15px;"><button class="btn" style="flex:1; background:${isWaiting?'var(--success)':'rgba(14,165,233,0.2)'}; color:${isWaiting?'#000':'var(--info)'}; border:1px solid var(--info);" onclick="window.toggleRideWait()">${isWaiting?'▶ RUSZAMY':'⏳ POSTÓJ'}</button><button class="btn btn-danger" style="flex:2; padding:15px;" onclick="window.stopLiveRide()">🔴 ZAKOŃCZ</button></div></div>`;
            } else {
                stoperHtml += `<div class="panel" style="border-color:var(--success); text-align:center; padding:15px;"><button class="btn" style="background:var(--success); color:#000; font-size:1.1rem; padding:15px;" onclick="window.startLiveRide()">🟢 ROZPOCZNIJ KURS (STOPER)</button></div>`;
            }
        }
        
        let diffHrs = 0, diffMins = 0, activeHrs = 0, etaHtml = '';
        let goal = cfg.goal || 350;
        let showGross = window.db.drv.panelMode === 'gross';
        let displayVal = showGross ? g : n;
        let displayLabel = showGross ? 'UTARG BRUTTO' : 'PRAWDZIWE NETTO (ZUS/AUTO/OC)';
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
                etaHtml = `Do celu: <strong>~${etaH}h ${etaM}m</strong> (${Number(rateHr).toFixed(0)} zł/h)`;
            } else if(displayVal >= goal) {
                etaHtml = `<span style="color:var(--success);font-weight:bold;">🎉 Cel osiągnięty!</span>`;
            } else {
                etaHtml = `Szacowanie... Czekam na pierwszy zarobek.`;
            }
        }
        
        let breakdownHtml = '';
        if(d.sh && d.sh.on) {
            if(d.plat === 'apps') {
                breakdownHtml = `
                <div style="display:flex; justify-content:space-between; gap:8px; margin-top:15px; padding:0 20px;">
                    <div style="flex:1; background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.2); border-radius:10px; padding:10px; text-align:center;"><span style="font-size:0.6rem; color:var(--success); text-transform:uppercase; font-weight:bold;">Gotówka</span><br><strong style="color:#fff; font-size:1.1rem;">${Number(sumCash).toFixed(2)}</strong></div>
                    <div style="flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:10px; text-align:center;"><span style="font-size:0.6rem; color:#fff; text-transform:uppercase; font-weight:bold;">Uber (Apka)</span><br><strong style="color:#fff; font-size:1.1rem;">${Number(sumUber).toFixed(2)}</strong></div>
                    <div style="flex:1; background:rgba(34,211,238,0.05); border:1px solid rgba(34,211,238,0.2); border-radius:10px; padding:10px; text-align:center;"><span style="font-size:0.6rem; color:#22d3ee; text-transform:uppercase; font-weight:bold;">Bolt (Apka)</span><br><strong style="color:#fff; font-size:1.1rem;">${Number(sumBolt).toFixed(2)}</strong></div>
                </div>`;
            } else {
                breakdownHtml = `
                <div style="display:flex; justify-content:space-between; gap:8px; margin-top:15px; padding:0 20px;">
                    <div style="flex:1; background:rgba(34,197,94,0.05); border:1px solid rgba(34,197,94,0.2); border-radius:10px; padding:10px; text-align:center;"><span style="font-size:0.6rem; color:var(--success); text-transform:uppercase; font-weight:bold;">Gotówka</span><br><strong style="color:#fff; font-size:1.1rem;">${Number(sumCash).toFixed(2)}</strong></div>
                    <div style="flex:1; background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.2); border-radius:10px; padding:10px; text-align:center;"><span style="font-size:0.6rem; color:#3b82f6; text-transform:uppercase; font-weight:bold;">Karta</span><br><strong style="color:#fff; font-size:1.1rem;">${Number(sumCard).toFixed(2)}</strong></div>
                    <div style="flex:1; background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.2); border-radius:10px; padding:10px; text-align:center;"><span style="font-size:0.6rem; color:#a855f7; text-transform:uppercase; font-weight:bold;">Voucher</span><br><strong style="color:#fff; font-size:1.1rem;">${Number(sumVouch).toFixed(2)}</strong></div>
                </div>`;
            }
        }

        let act = (d.sh && d.sh.on) ? `
        <div class="dash-hero" style="padding-bottom:5px;">
            <p>${displayLabel}</p>
            <h1 style="font-size:3.5rem; color:${displayVal>=0?'var(--success)':'var(--danger)'};">${Number(displayVal||0).toFixed(2)} zł</h1>
            <div style="display:flex; justify-content:center; gap:10px; margin-top:10px; margin-bottom:10px;">
                <button class="chip ${!showGross?'active':''}" style="flex:none; padding: 6px 12px;" onclick="window.db.drv.panelMode='net';window.render()">Netto (Operacyjne)</button>
                <button class="chip ${showGross?'active':''}" style="flex:none; padding: 6px 12px;" onclick="window.db.drv.panelMode='gross';window.render()">Brutto (Utarg)</button>
            </div>
            <div style="margin-top: 15px; padding: 0 25px;">
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--muted); margin-bottom:5px; font-weight:bold;"><span>Cel: ${goal} zł</span><span>${Number(progressPct||0).toFixed(0)}%</span></div>
                <div style="width:100%; background:rgba(255,255,255,0.1); height:12px; border-radius:6px; overflow:hidden;"><div style="width:${progressPct}%; background:${progressPct>=100?'var(--success)':'var(--driver)'}; height:100%; transition:width 0.5s;"></div></div>
                <div style="font-size:0.75rem; color:var(--muted); text-align:center; margin-top:8px;">${etaHtml}</div>
            </div>
            ${breakdownHtml}
            <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:6px 12px; border-radius:10px; display:inline-block; margin-top:15px;">
                <span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase;">⏳ Czas pracy dniówki:</span><strong style="color:var(--info); font-size:1rem; margin-left:5px;">${diffHrs}h ${diffMins}m</strong>
            </div>
            <div style="margin-top:10px; display:flex; gap:10px; padding:0 12px;">
                <button class="btn" style="flex:1; padding:10px; font-size:0.75rem; background:${d.sh.sPS?'var(--success)':'rgba(255,255,255,0.05)'}; color:${d.sh.sPS?'#000':'var(--muted)'}; border:1px solid ${d.sh.sPS?'var(--success)':'rgba(255,255,255,0.2)'}; box-shadow:none;" onclick="window.toggleShiftPause()">${d.sh.sPS?'▶ WZNÓW ZMIANĘ':'☕ PRZERWA'}</button>
                <button class="btn btn-danger" style="flex:1; padding:10px; font-size:0.75rem; margin-top:0;" onclick="window.openEndShiftModal()">🔴 ZAKOŃCZ PRACĘ</button>
            </div>
        </div>
        ${d.sh.sPS ? `<div class="panel" style="border-color:var(--warning); text-align:center; padding:30px 15px;"><div style="font-size:3rem; margin-bottom:10px; animation: pulse 2s infinite;">☕</div><h2 style="color:var(--warning); margin:0 0 10px 0;">ZMIANA WSTRZYMANA</h2><button class="btn" style="background:var(--success); color:#000; padding:15px;" onclick="window.toggleShiftPause()">▶ WZNÓW PRACĘ</button></div>` : stoperHtml}
        <div class="panel" style="border-color:rgba(59, 130, 246, 0.4); display:${d.sh.sPS?'none':'block'};">
            <div class="form-section" style="padding:10px; margin-bottom:10px;"><div class="fs-title" style="margin-bottom:6px;">Źródło & Płatność</div><div class="chip-box" style="margin-bottom:8px; padding-bottom:0;">${ch1}</div>${otherSrcHtml}<div class="chip-box" style="margin-bottom:0; padding-bottom:0;">${ch2}</div></div>
            <div class="inp-group" style="margin-bottom:15px;"><label>Zwiąż z Klientem VIP</label><select id="dt-cid"><option value="">-- Zwykły kurs --</option>${clientOpts}</select></div>
            <div class="form-section" style="padding:15px; border-color:rgba(59,130,246,0.3); background:rgba(59,130,246,0.05);"><input type="number" id="dt-v" class="big-inp" placeholder="Kwota (0.00)" style="color:var(--driver); border:none; background:rgba(0,0,0,0.5);"></div>
            <div class="inp-row"><div class="inp-group"><input type="number" id="dt-m" placeholder="Czas (Min)"></div><div class="inp-group"><input type="number" id="dt-k" placeholder="Dystans (KM)"></div></div>
            <button class="btn btn-driver" style="margin-top:10px; padding:15px;" onclick="window.dAddT()">DODAJ KURS DO PORTFELA</button>
        </div>
        <div class="panel" style="display:${d.sh.sPS?'none':'block'};">
            <div class="p-title">Historia Zmiany</div>
            ${(d.sh.tr||[]).map(x => {
                let icon='📱', color='var(--driver)', bg='rgba(59,130,246,0.1)';
                if(x.p==='Gotówka') { icon='💵'; color='var(--success)'; bg='rgba(34,197,94,0.1)'; }
                else if(x.p==='Karta') { icon='💳'; color='#f59e0b'; bg='rgba(245,158,11,0.1)'; }
                else if(x.p==='Voucher') { icon='🎫'; color='#a855f7'; bg='rgba(168,85,247,0.1)'; }
                return `
                <div class="log-item" style="border-left:4px solid ${color}; padding:12px; margin-bottom:10px; background:linear-gradient(90deg, ${bg} 0%, transparent 100%);">
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <div style="font-size:1.5rem; width:45px; height:45px; background:rgba(0,0,0,0.5); border:1px solid ${color}55; border-radius:12px; display:flex; align-items:center; justify-content:center;">${icon}</div>
                        <div style="flex:1;">
                            <strong style="font-size:1.15rem; color:#fff;">${Number(x.v||0).toFixed(2)} zł</strong>
                            <div style="display:flex; gap:8px; font-size:0.75rem; color:var(--muted); margin-top:2px;">
                                <span>${x.time||'--:--'}</span><span>•</span><span style="color:${color}; font-weight:bold;">${x.p}</span><span>•</span><span>${x.s}</span>
                                ${x.k>0 ? `<span>•</span><span>${Number(x.k).toFixed(1)} km</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <button style="background:rgba(255,255,255,0.1); color:#fff; border:none; border-radius:8px; padding:6px; cursor:pointer;" onclick="window.dEditT(${x.id})">✏️</button>
                        <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; border-radius:8px; padding:6px; cursor:pointer;" onclick="window.dDelT(${x.id})">🗑️</button>
                    </div>
                </div>`;
            }).join('') || '<div style="text-align:center;color:var(--muted);padding:20px 0;font-size:0.85rem;">Brak kursów.</div>'}
        </div>` : 
        `<div class="dash-hero" style="padding-top:40px;">
            <div style="width:80px;height:80px;background:linear-gradient(135deg,var(--success),#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:2.5rem;box-shadow:0 10px 25px rgba(34,197,94,0.3);">🚗</div>
            <h1 style="font-size:2.5rem;">Cześć, ${window.db.userName || 'Kierowco'}!</h1>
            <p style="margin-top:10px;">Aby rozpocząć, potwierdź stan licznika</p>
        </div>
        <div class="panel" style="border-color:var(--success); box-shadow:0 10px 30px rgba(34,197,94,0.1);">
            <div class="inp-group"><input type="number" id="ds-o" class="big-inp" value="${(d.odo||0)>0?d.odo:''}" placeholder="Stan licznika (KM)"></div>
            <button class="btn" style="background:linear-gradient(135deg, var(--success), #059669); color:#fff; font-size:1.1rem; padding:18px; margin-top:15px;" onclick="window.dStartS()">ROZPOCZNIJ PRACĘ</button>
        </div>` + 
        (d.plat === 'apps' ? 
            (!window.dShowOff ? 
                `<div style="padding:0 15px;"><button class="btn" style="background:rgba(14,165,233,0.1); color:var(--info); border:1px dashed rgba(14,165,233,0.4); margin-top:10px; font-size:0.85rem; box-shadow:none; width: 100%;" onclick="window.dShowOff=true; window.render()">📥 DODAJ ZALEGŁE ROZLICZENIE (WBITKA)</button></div>` : 
                `<div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:25px;">⚡ Zaległe rozliczenie</div>
                <div class="panel" style="border-color:rgba(14,165,233,0.4); animation:fadeIn 0.3s;">
                    <div class="form-section" style="padding:10px; margin-bottom:10px;"><div class="fs-title" style="margin-bottom:6px;">Aplikacja Docelowa</div><div class="chip-box" style="margin-bottom:0; padding-bottom:0;">${ch1}</div>${otherSrcHtml}</div>
                    <div class="inp-row" style="margin-bottom:15px;"><div class="inp-group"><label>Data Od</label><input type="date" id="dw-d-from" value="${window.getLocalYMD()}"></div><div class="inp-group"><label>Data Do</label><input type="date" id="dw-d-to" value="${window.getLocalYMD()}"></div></div>
                    <div class="inp-group" style="margin-bottom:10px;"><input type="number" id="dw-v" class="big-inp" placeholder="Brutto łącznie (zł)" style="color:var(--info); border:none; background:rgba(0,0,0,0.5);"></div>
                    <div class="inp-row"><div class="inp-group"><input type="number" id="dw-k" placeholder="Dystans (KM)"></div><div class="inp-group"><input type="number" id="dw-c" placeholder="Z tego w gotówce (zł)"></div></div>
                    <div class="inp-group" style="margin-top:10px;"><input type="number" id="dw-h" placeholder="Przepracowane godziny (Opcjonalnie)"></div>
                    <button class="btn" style="background:var(--info); color:#fff; margin-top:15px; padding:15px;" onclick="window.dAddOfflineWeekly()">ZAKSIĘGUJ DO HISTORII</button>
                    <button class="btn" style="background:transparent; color:var(--muted); margin-top:5px; border:1px solid rgba(255,255,255,0.1); box-shadow:none;" onclick="window.dShowOff=false; window.render()">ANULUJ</button>
                </div>`
            ) : '');
        
        APP.innerHTML = hdr + act + nav;
    }

    // ==========================================
    // ZAKŁADKA: STATYSTYKI (STATS)
    // ==========================================
    if(t === 'stats') {
        let fM = window.db.filter || 'all';
        let now = new Date();
        let fs = [], fe = [], dF = null, dT = null;
        
        if(fM === 'custom') {
            if(!window.db.filterFrom) window.db.filterFrom = window.getLocalYMD();
            if(!window.db.filterTo) window.db.filterTo = window.getLocalYMD();
            dF = new Date(window.db.filterFrom); dF.setHours(0,0,0,0);
            dT = new Date(window.db.filterTo); dT.setHours(23,59,59,999);
        }
        
        (d.h || []).forEach(s => {
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
        });
        
        (d.exp || []).forEach(e => {
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
        });
        
        let g=0, k=0, fc=0, tx=0, ex=0, pf=0, cf=0, vf=0, th=0, pkSum=0, emptyKSum=0;
        let cashEarned=0, cardEarned=0, appEarned=0, uberEarned=0, boltEarned=0, vouchEarned=0;
        
        let getDaily = (val, p, dim) => { let v = parseFloat(val)||0; if(p==='week') return v/7; if(p==='year') return v/365; return v/dim; };
        let daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
        
        let cfg = d.cfg || {};
        let exactDailyRate = getDaily(cfg.bC, cfg.bPeriod, daysInCurrentMonth) + 
                             getDaily(cfg.iC, cfg.iPeriod, daysInCurrentMonth) + 
                             getDaily(cfg.cC, cfg.cType, daysInCurrentMonth) + 
                             getDaily(cfg.uC, cfg.uType, daysInCurrentMonth) + 
                             (cfg.eType === 'flat' ? getDaily(cfg.eC, cfg.ePeriod, daysInCurrentMonth) : 0);
        
        let oD = new Date();
        if(d.h && d.h.length > 0) {
            let sH = [...d.h].sort((a,b) => new Date(a.rD) - new Date(b.rD));
            oD = new Date(sH[0].rD);
        }
        
        let aS = window.db.createdAt ? new Date(window.db.createdAt) : new Date();
        if(oD < aS) { aS = oD; window.db.createdAt = window.getLocalYMD(aS); window.save(); }
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
        
        fs.forEach(x => {
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
            
            (x.tr || []).forEach(tr => { 
                let trv = parseFloat(tr.v) || 0;
                if(tr.p === 'Gotówka') cashEarned += trv; 
                else if(tr.p === 'Karta') cardEarned += trv; 
                else if(tr.p === 'Voucher') vouchEarned += trv; 
                else { 
                    appEarned += trv; 
                    if(tr.s === 'Uber') uberEarned += trv; 
                    else if(tr.s === 'Bolt') boltEarned += trv; 
                } 
            }); 
        });
        
        fe.forEach(x => { if(x.ty === 'e') ex += (parseFloat(x.v) || 0); });
        
        let n = g - fc - tx - totalDynamicFix - pf - cf - vf - ex;
        let rKm = k > 0 ? (n / k) : 0;
        let rHr = th > 0 ? (n / th) : 0;

        let breakdownStatsHtml = '';
        if (d.plat === 'apps') {
            breakdownStatsHtml = `
            <div class="grid-3" style="padding:0 15px; margin-bottom:15px; display:flex; gap:10px;">
                <div class="box" style="flex:1; border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05); padding:10px;"><span style="color:var(--success); font-size:0.6rem;">GOTÓWKA</span><strong style="color:#fff; font-size:1rem;">${Number(cashEarned).toFixed(2)}</strong></div>
                <div class="box" style="flex:1; border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.05); padding:10px;"><span style="color:#fff; font-size:0.6rem;">UBER</span><strong style="color:#fff; font-size:1rem;">${Number(uberEarned).toFixed(2)}</strong></div>
                <div class="box" style="flex:1; border-color:rgba(34,211,238,0.3); background:rgba(34,211,238,0.05); padding:10px;"><span style="color:#22d3ee; font-size:0.6rem;">BOLT</span><strong style="color:#fff; font-size:1rem;">${Number(boltEarned).toFixed(2)}</strong></div>
            </div>`;
        } else {
            breakdownStatsHtml = `
            <div class="grid-3" style="padding:0 15px; margin-bottom:15px; display:flex; gap:10px;">
                <div class="box" style="flex:1; border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05); padding:10px;"><span style="color:var(--success); font-size:0.6rem;">GOTÓWKA</span><strong style="color:#fff; font-size:1rem;">${Number(cashEarned).toFixed(2)}</strong></div>
                <div class="box" style="flex:1; border-color:rgba(59,130,246,0.3); background:rgba(59,130,246,0.05); padding:10px;"><span style="color:#3b82f6; font-size:0.6rem;">KARTA</span><strong style="color:#fff; font-size:1rem;">${Number(cardEarned).toFixed(2)}</strong></div>
                <div class="box" style="flex:1; border-color:rgba(168,85,247,0.3); background:rgba(168,85,247,0.05); padding:10px;"><span style="color:#a855f7; font-size:0.6rem;">VOUCHERY</span><strong style="color:#fff; font-size:1rem;">${Number(vouchEarned).toFixed(2)}</strong></div>
            </div>`;
        }

        let customDatesHtml = fM === 'custom' ? `
        <div style="display:flex;gap:10px;padding:0 15px;margin-bottom:15px;">
            <div class="inp-group"><label>Od</label><input type="date" value="${window.db.filterFrom||''}" onchange="window.db.filterFrom=this.value; window.render()"></div>
            <div class="inp-group"><label>Do</label><input type="date" value="${window.db.filterTo||''}" onchange="window.db.filterTo=this.value; window.render()"></div>
        </div>` : '';

        // --- Logika Inteligentnego Przycisku Transferu ---
        let totalTransferred = 0;
        if(window.db.home && window.db.home.trans) {
            window.db.home.trans.forEach(t => {
                if(t.cat === 'Wypłata z Etatu' && t.d === 'Utarg z Taxi') {
                    totalTransferred += (parseFloat(t.v)||0);
                }
            });
        }
        let availableCashForTransfer = cashEarned - totalTransferred;
        
        let transferButtonHtml = '';
        if (availableCashForTransfer > 0) {
            transferButtonHtml = `<button class="btn btn-success" style="margin-top:15px; width:calc(100% - 30px); margin-left:auto; margin-right:auto; font-weight:bold; box-shadow: 0 0 20px rgba(34,197,94,0.4);" onclick="window.dTransferToHomeModal()"><span style="font-size:1.1rem; margin-right:8px;">💸</span> PRZELEJ GOTÓWKĘ DO BUDŻETU<br><small style="font-weight:normal; font-size:0.75rem; color:rgba(255,255,255,0.8); display:block; margin-top:4px;">Nierozliczone: ${Number(availableCashForTransfer).toFixed(2)} zł</small></button>`;
        } else {
            transferButtonHtml = `<button class="btn" style="margin-top:15px; width:calc(100% - 30px); margin-left:auto; margin-right:auto; font-weight:bold; background:rgba(255,255,255,0.05); color:var(--muted); border:1px solid rgba(255,255,255,0.1); cursor:not-allowed;" disabled><span style="font-size:1.1rem; margin-right:8px;">✅</span> GOTÓWKA W PEŁNI ROZLICZONA<br><small style="font-weight:normal; font-size:0.75rem; display:block; margin-top:4px;">Zaksięgowano w Domu: ${Number(totalTransferred).toFixed(2)} zł</small></button>`;
        }
        // ---------------------------------------------------

        APP.innerHTML = hdr + `
        <div class="mode-switch" style="margin:12px;">
            <div class="m-btn ${fM==='today'?'active':''}" onclick="window.db.filter='today'; window.render()">Dziś</div>
            <div class="m-btn ${fM==='week'?'active':''}" onclick="window.db.filter='week'; window.render()">Tydzień</div>
            <div class="m-btn ${fM==='month'?'active':''}" onclick="window.db.filter='month'; window.render()">Miesiąc</div>
            <div class="m-btn ${fM==='all'?'active':''}" onclick="window.db.filter='all'; window.render()">Całość</div>
            <div class="m-btn ${fM==='custom'?'active':''}" onclick="window.db.filter='custom'; window.render()">Własny</div>
        </div>
        ${customDatesHtml}
        <div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px; padding:0 15px;">
            <button class="chip ${window.db.drv.showFixed?'active':''}" onclick="window.db.drv.showFixed=true; window.render()">Koszty pełne (Netto)</button>
            <button class="chip ${!window.db.drv.showFixed?'active':''}" style="background:${!window.db.drv.showFixed?'var(--info)':'rgba(255,255,255,0.03)'}; border-color:${!window.db.drv.showFixed?'var(--info)':'rgba(255,255,255,0.05)'}; color:${!window.db.drv.showFixed?'#fff':'var(--muted)'};" onclick="window.db.drv.showFixed=false; window.render()">Tylko Operacyjny</button>
        </div>
        <div class="dash-hero" style="padding-top:0;">
            <p>${window.db.drv.showFixed ? 'TWOJE PRAWDZIWE NETTO' : 'ZYSK Z KURSÓW (BEZ ZUS/AUTA)'}</p>
            <h1 style="color:${n>=0?'var(--success)':'var(--danger)'}; font-size:3.8rem;">${Number(n).toFixed(2)} zł</h1>
            ${transferButtonHtml}
        </div>
        ${breakdownStatsHtml}
        <div class="grid-2">
            <div class="box"><span style="color:var(--info)">Zysk / 1 km</span><strong style="color:#fff">${Number(rKm).toFixed(2)} zł</strong></div>
            <div class="box"><span style="color:var(--quote)">Zysk / 1 h</span><strong style="color:#fff">${Number(rHr).toFixed(2)} zł</strong></div>
        </div>
        <div class="grid-2" style="margin-top:-8px;">
            <div class="box"><span style="color:var(--success)">Dni rozliczeniowe</span><strong style="color:#fff">${daysToCharge} dni</strong></div>
            <div class="box"><span style="color:var(--warning)">Czas w pracy</span><strong style="color:#fff">${Number(th).toFixed(1)} h</strong></div>
        </div>
        <div class="grid-2" style="margin-top:-8px;">
            <div class="box" style="border-color:rgba(34,197,94,0.3); background:rgba(34,197,94,0.05);"><span style="color:var(--success)">KM z Klientem</span><strong style="color:#fff">${Number(pkSum).toFixed(1)} km</strong></div>
            <div class="box" style="border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.05);"><span style="color:var(--danger)">Puste KM (Dojazdy)</span><strong style="color:#fff">${Number(emptyKSum).toFixed(1)} km</strong></div>
        </div>
        <div class="panel" style="padding:20px 15px;">
            <div class="p-title">Wodospad Finansowy (P&L)</div>
            <div class="fin-row"><span class="fin-label">Utarg Brutto z aplikacji</span><span class="fin-val" style="color:var(--success)">${Number(g).toFixed(2)} zł</span></div>
            <div class="fin-row"><span class="fin-label">Wydatki Zmienne (Garaż)</span><span class="fin-val" style="color:var(--danger)">-${Number(ex).toFixed(2)} zł</span></div>
            <div class="fin-row"><span class="fin-label">Paliwo z przejechanych tras</span><span class="fin-val" style="color:var(--fuel)">-${Number(fc).toFixed(2)} zł</span></div>
            ${cf > 0 ? `<div class="fin-row"><span class="fin-label" style="color:var(--info)">Prowizja Terminala (Karty)</span><span class="fin-val" style="color:var(--danger)">-${Number(cf).toFixed(2)} zł</span></div>` : ''}
            ${vf > 0 ? `<div class="fin-row"><span class="fin-label" style="color:#a855f7">Prowizja (Vouchery)</span><span class="fin-val" style="color:var(--danger)">-${Number(vf).toFixed(2)} zł</span></div>` : ''}
            ${pf > 0 ? `<div class="fin-row"><span class="fin-label">Prowizja Partnera (Aplikacje)</span><span class="fin-val" style="color:var(--danger)">-${Number(pf).toFixed(2)} zł</span></div>` : ''}
            <div class="fin-row"><span class="fin-label">Podatek Dochodowy/VAT</span><span class="fin-val" style="color:var(--danger)">-${Number(tx).toFixed(2)} zł</span></div>
            <div class="fin-row" style="align-items:flex-start;">
                <div style="display:flex; flex-direction:column; max-width:70%;">
                    <span class="fin-label" style="color:#fff;">Odpisy Stałe ${!window.db.drv.showFixed ? '(Wyłączone)' : `(Za ${daysToCharge} dni)`}</span>
                </div>
                <span class="fin-val" style="color:var(--danger); padding-top:2px;">-${Number(totalDynamicFix).toFixed(2)} zł</span>
            </div>
            <div class="fin-row" style="background:#000; margin-top:15px; padding:15px; border-radius:12px;">
                <span class="fin-label" style="color:#fff; font-size:1rem;">WYNIK KOŃCOWY</span>
                <span class="fin-val" style="font-size:1.3rem; color:${n >= 0 ? 'var(--success)' : 'var(--danger)'}">${Number(n).toFixed(2)} zł</span>
            </div>
        </div>
        <div class="panel">
            <div class="p-title">Dziennik Zmian (Historia)</div>
            ${fs.map(x => `
            <div class="log-item" style="border-left-color:${x.n >= 0 ? 'var(--success)' : 'var(--danger)'}; flex-direction:column; align-items:flex-start; padding:12px;">
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:8px;">
                    <div><strong style="font-size:1.05rem;">${x.dt}</strong></div>
                    <strong style="color:${x.n >= 0 ? 'var(--success)' : 'var(--danger)'}; font-size:1.1rem;">Zysk Oper: ${Number(x.n || 0).toFixed(2)} zł</strong>
                </div>
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <small style="color:var(--muted)">Brutto: ${Number(x.g || 0).toFixed(2)} zł | ${Number(x.k || 0).toFixed(1)} km</small>
                    <div style="display:flex; gap:5px;">
                        <button class="btn" style="padding:6px 10px; background:rgba(255,255,255,0.1); border:none; border-radius:8px; font-size:0.7rem;" onclick="window.dEditHistory(${x.id})">✏️</button>
                        <button class="btn-danger" style="padding:6px 10px; border:none; border-radius:8px; font-weight:bold; background:rgba(239,68,68,0.15); color:var(--danger); font-size:0.7rem;" onclick="window.dDelHistory(${x.id})">🗑️</button>
                    </div>
                </div>
            </div>`).join('') || '<div style="text-align:center;color:var(--muted);font-size:0.85rem;padding:20px 0;">Brak danych.</div>'}
        </div>` + nav;
    }

    // ==========================================
    // ZAKŁADKA: WYCENA (QUOTE)
    // ==========================================
    if(t === 'quote') {
        let q = d.q || {s:0, w:0, t1:0, t2:0, t3:0, t4:0};
        let clientOpts = (d.clients || []).map(c => `<option value="${c.id}" data-d="${c.d||0}">${c.n} (Rabat: ${c.d||0}%)</option>`).join('');
        
        APP.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:5px;"><p>INTELIGENTNA WYCENA (MAPY)</p></div>
        <div class="panel" style="border-color:rgba(217, 70, 239, 0.4)">
            <div class="form-section" style="padding:15px;">
                <div class="inp-group" style="margin-bottom:10px;"><label style="color:var(--success)">🟢 Adres początkowy</label><input type="text" id="dq-start" placeholder="np. Dworzec Główny" style="border-color:var(--success);"></div>
                <div class="inp-group"><label style="color:var(--danger)">🔴 Adres docelowy</label><input type="text" id="dq-end" placeholder="np. Powstańców Warszawy 1" style="border-color:var(--danger);"></div>
                <button class="btn btn-quote" style="margin-top:15px; padding:15px;" onclick="window.calculateRouteAuto()">🔍 WYZNACZ TRASĘ I CENĘ</button>
            </div>
            <div id="map-container" style="display:none; margin-top:20px;">
                <div id="map" style="height: 250px; border-radius: 16px; border: 1px solid var(--border);"></div>
                <div style="display:flex; justify-content:space-between; margin-top:10px; padding:10px; background:rgba(255,255,255,0.02); border-radius:12px;">
                    <div style="text-align:center; flex:1;"><span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase;">Dystans</span><br><strong id="res-km" style="color:#fff; font-size:1.2rem;">0 km</strong></div>
                    <div style="text-align:center; flex:1;"><span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase;">Czas jazdy</span><br><strong id="res-min" style="color:#fff; font-size:1.2rem;">0 min</strong></div>
                </div>
                <div class="chip-box" style="margin-top:15px;">
                    <div class="chip ${!window.dQN?'active':''}" style="background:${!window.dQN?'rgba(217,70,239,0.1)':'var(--bg)'};color:${!window.dQN?'var(--quote)':'var(--muted)'}; border-color:${!window.dQN?'var(--quote)':'transparent'}" onclick="window.dQN=false; window.updateRoutePrice();">Dzień (T1/T3)</div>
                    <div class="chip ${window.dQN?'active':''}" style="background:${window.dQN?'rgba(217,70,239,0.1)':'var(--bg)'};color:${window.dQN?'var(--quote)':'var(--muted)'}; border-color:${window.dQN?'var(--quote)':'transparent'}" onclick="window.dQN=true; window.updateRoutePrice();">Noc/Święto (T2/T4)</div>
                </div>
                <div id="zone-split" style="display:none; margin-top:15px; background:#000; padding:15px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
                    <label style="color:var(--info); font-size:0.75rem; text-transform:uppercase; font-weight:bold; display:block; text-align:center;">Przesuń do granicy miasta</label>
                    <input type="range" id="zone-slider" min="0" max="100" value="100" step="0.1" style="width:100%; margin:15px 0;" oninput="window.updateZoneSplit()">
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                        <span style="color:var(--driver)">Miasto: <strong id="val-in">0.0</strong> km</span>
                        <span style="color:var(--warning)">Poza miastem: <strong id="val-out">0.0</strong> km</span>
                    </div>
                </div>
                <div style="background:#000; border-radius:16px; padding:20px; margin-top:20px; text-align:center; border:1px solid var(--quote); box-shadow:inset 0 5px 10px rgba(0,0,0,0.5);">
                    <p style="margin:0 0 5px 0; color:var(--quote); font-size:0.75rem; font-weight:800;">PROPONOWANA CENA (BRUTTO)</p>
                    <h1 id="dqt" style="margin:0; font-size:3.5rem; letter-spacing:-2px;">0.00 zł</h1>
                </div>
                <div class="inp-group" style="margin-top:15px;"><label>Klient VIP (Rabat)</label><select id="dq-c" onchange="window.updateRoutePrice()"><option value="">-- Zwykły kurs --</option>${clientOpts}</select></div>
                <button class="btn btn-quote" style="margin-top:15px;" onclick="window.dQB()">ZAKSIĘGUJ KURS DO PANELU</button>
            </div>
        </div>
        <div class="section-lbl" style="color:var(--quote); border-color:var(--quote);">Ustawienia Taryfikatora</div>
        <div class="panel">
            <div class="grid-2">
                <div class="inp-group"><label>Start</label><input type="number" id="dcs" value="${q.s || 0}"></div>
                <div class="inp-group"><label>1h Postoju</label><input type="number" id="dcw" value="${q.w || 0}"></div>
            </div>
            <div class="grid-4" style="grid-template-columns:1fr 1fr 1fr 1fr; gap:8px;">
                <div class="inp-group"><label>T1</label><input type="number" id="dct1" value="${q.t1 || 0}"></div>
                <div class="inp-group"><label>T2</label><input type="number" id="dct2" value="${q.t2 || 0}"></div>
                <div class="inp-group"><label>T3</label><input type="number" id="dct3" value="${q.t3 || 0}"></div>
                <div class="inp-group"><label>T4</label><input type="number" id="dct4" value="${q.t4 || 0}"></div>
            </div>
            <button class="btn" style="background:#222; color:#fff;" onclick="window.dSaveQC()">ZAPISZ TARYFY</button>
        </div>` + nav;
    }

    // ==========================================
    // ZAKŁADKA: GARAŻ (GARAGE)
    // ==========================================
    if(t === 'garage') {
        let fS = window.calcFuelioStats(); 
        let todayStr = window.getLocalYMD();
        
        let quickExpHtml = `
        <div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:20px;">⚡ Szybkie wydatki (podczas zmiany)</div>
        <div style="display:flex; gap:10px; overflow-x:auto; padding: 0 15px 15px;">
            <div onclick="window.dQuickExp('☕ Kawa', 15)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer;"><span style="font-size:1.5rem;">☕</span><strong style="color:#fff; font-size:0.85rem;">Kawa (15 zł)</strong></div>
            <div onclick="window.dQuickExp('🍔 Jedzenie', 35)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer;"><span style="font-size:1.5rem;">🍔</span><strong style="color:#fff; font-size:0.85rem;">Jedzenie (35 zł)</strong></div>
            <div onclick="window.dQuickExp('✨ Myjnia', 20)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer;"><span style="font-size:1.5rem;">✨</span><strong style="color:#fff; font-size:0.85rem;">Myjnia (20 zł)</strong></div>
            <div onclick="window.dQuickExp('🅿 Parking', 10)" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 15px; display:flex; align-items:center; gap:8px; flex-shrink:0; cursor:pointer;"><span style="font-size:1.5rem;">🅿</span><strong style="color:#fff; font-size:0.85rem;">Parking (10 zł)</strong></div>
        </div>`;
        
        APP.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:5px;">
            <p>ŚREDNIE SPALANIE (Z paragonów)</p>
            <h1 style="color:var(--fuel); font-size:4rem;">${Number(fS.l1||0).toFixed(1)} <span style="font-size:1.5rem; color:var(--muted)">L/100</span></h1>
        </div>
        <div class="grid-2" style="padding:0 15px; margin-bottom:20px;">
            <div class="box" style="border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.05); align-items:center;">
                <span style="color:var(--fuel)">Koszt 100 KM</span><strong style="color:#fff">${Number(fS.c1||0).toFixed(2)} zł</strong>
            </div>
            <div class="box" style="border-color:rgba(245,158,11,0.3); background:rgba(245,158,11,0.05); align-items:center;">
                <span style="color:var(--fuel)">Koszt 1 KM</span><strong style="color:#fff">${Number((d.cfg||{}).fuelPx||0).toFixed(2)} zł</strong>
            </div>
        </div>
        ${quickExpHtml}
        <div class="panel" style="border-color:var(--fuel); background: linear-gradient(180deg, #18181b 0%, #09090b 100%);">
            <div class="p-title" style="color:var(--fuel)">⛽ Dziennik Tankowań</div>
            <div class="inp-row">
                <div class="inp-group"><label>Licznik (KM)</label><input type="number" id="df-o" placeholder="np. 155000"></div>
                <div class="inp-group"><label>Litry</label><input type="number" id="df-l" step="0.1" placeholder="0.0"></div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Rachunek (zł)</label><input type="number" id="df-v" placeholder="0.00"></div>
                <div class="inp-group"><label>Data</label><input type="date" id="df-date" value="${todayStr}"></div>
            </div>
            <div class="inp-group" style="margin-bottom:15px;">
                <label>Pod korek?</label>
                <select id="df-f"><option value="1">Tak (Oblicz spalanie)</option><option value="0">Nie</option></select>
            </div>
            <button class="btn" style="background:var(--fuel); color:#000;" onclick="window.dAF()">ZAPISZ PARAGON</button>
        </div>
        <div class="panel" style="border-color:rgba(239,68,68,0.4)">
            <div class="p-title" style="color:var(--danger)">🔧 Inne Wydatki</div>
            <div class="inp-row">
                <div class="inp-group" style="flex:2"><label>Kategoria</label><select id="de-c"><option value="✨ Myjnia">✨ Myjnia</option><option value="🛠 Serwis">🛠 Serwis</option><option value="💧 Płyny">💧 Płyny</option><option value="🅿 Parking">🅿 Parking</option><option value="🎫 Mandat">🎫 Mandat</option><option value="☕ Kawa/Jedzenie">☕ Kawa/Jedzenie</option><option value="🛒 Inne">🛒 Inne</option></select></div>
                <div class="inp-group"><label>Kwota (zł)</label><input type="number" id="de-v" placeholder="0.00"></div>
            </div>
            <div class="inp-group" style="margin-bottom:15px;"><label>Data</label><input type="date" id="de-date" value="${todayStr}"></div>
            <button class="btn btn-danger" style="background:var(--danger); color:#fff;" onclick="window.dAE()">ZAPISZ WYDATEK</button>
        </div>
        <div class="section-lbl" style="color:#fff; border-color:rgba(255,255,255,0.1);">Historia Garażu</div>
        <div style="padding: 0 15px; margin-bottom: 20px;">${window.renderGarageHistory()}</div>` + nav;
    }

    // ==========================================
    // ZAKŁADKA: USTAWIENIA (SET)
    // ==========================================
    if(t === 'set') {
        let cloudStatusHtml = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) ? 
            `<div style="background:rgba(34,197,94,0.1); border:1px solid var(--success); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;"><strong style="color:var(--success); font-size:1.1rem;">☁️ Połączono z chmurą Google</strong><br><span style="font-size:0.8rem; color:var(--success); opacity:0.8;">Zalogowano jako: ${firebase.auth().currentUser.displayName || window.db.userName}</span></div>` : 
            `<div style="background:rgba(239,68,68,0.1); border:1px solid var(--danger); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;"><strong style="color:var(--danger); font-size:1.1rem;">🚫 Tryb Offline</strong><br><span style="font-size:0.8rem; color:var(--muted);">Dane zapisywane tylko na telefonie</span></div>`;

        APP.innerHTML = hdr + `
        <div class="dash-hero" style="padding-bottom:0; padding-top:10px;"><p>KONTROLA TWOJEJ FIRMY</p></div>
        
        <div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:10px;">💾 Status Konta</div>
        <div style="padding: 0 15px;">
            ${cloudStatusHtml}
            <button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:15px; width:100%; margin-bottom:20px; font-weight:bold;" onclick="window.logoutToLauncher()">⚙️ WRÓĆ DO EKRANU STARTOWEGO</button>
        </div>

        <div class="section-lbl" style="color:var(--success); border-color:var(--success);">👤 Personalizacja i Miasto</div>
        <div class="panel">
            <div class="inp-row">
                <div class="inp-group"><label>Twoje Imię</label><input type="text" id="us-name" value="${window.db.userName || ''}"></div>
                <div class="inp-group"><label>Cel Dzienny (zł)</label><input type="number" id="us-goal" value="${(d.cfg||{}).goal||350}"></div>
            </div>
            <div class="inp-group" style="margin-top:10px;"><label>Domyślne Miasto (Dla map)</label><input type="text" id="us-city" value="${(d.cfg||{}).defCity||'Szczecin'}" style="border-color:var(--success);"></div>
        </div>

        <div class="section-lbl" style="color:var(--fuel); border-color:var(--fuel);">⛽ Koszty Paliwa na KM</div>
        <div class="panel" style="border-color:rgba(245,158,11,0.4);">
            <div class="inp-row">
                <div class="inp-group"><label>Średnie spalanie (L/100km)</label><input type="number" id="us-fcons" step="0.1" value="${(d.cfg||{}).fuelCons||7.0}"></div>
                <div class="inp-group"><label>Cena paliwa na stacji (zł/L)</label><input type="number" id="us-fprice" step="0.01" value="${(d.cfg||{}).fuelPriceL||6.5}"></div>
            </div>
            <p style="font-size:0.7rem; color:var(--muted); margin-top:10px; line-height:1.4;">Zapisz, jeśli nie chcesz prowadzić dziennika tankowań (zakładka Garaż). Aplikacja sama wyliczy koszt kilometra.</p>
        </div>

        <div class="section-lbl" style="color:var(--driver); border-color:var(--driver);">🚗 Koszty Auta i Bazy</div>
        <div class="panel">
            <div class="inp-row">
                <div class="inp-group"><label>Rata / Wynajem (zł)</label><input type="number" id="us-cc" value="${(d.cfg||{}).cC||0}"></div>
                <div class="inp-group"><label>Okres</label><select id="us-ctype"><option value="week" ${(d.cfg||{}).cType==='week'?'selected':''}>Tydzień</option><option value="month" ${(d.cfg||{}).cType==='month'?'selected':''}>Miesiąc</option></select></div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Baza / Korpo (zł)</label><input type="number" id="us-bc" value="${(d.cfg||{}).bC||0}"></div>
                <div class="inp-group"><label>Okres</label><select id="us-b-period"><option value="week" ${(d.cfg||{}).bPeriod==='week'?'selected':''}>Tydzień</option><option value="month" ${(d.cfg||{}).bPeriod!=='week'?'selected':''}>Miesiąc</option></select></div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Inne (Księgowa itp.)</label><input type="number" id="us-ic" value="${(d.cfg||{}).iC||0}"></div>
                <div class="inp-group"><label>Okres</label><select id="us-i-period"><option value="week" ${(d.cfg||{}).iPeriod==='week'?'selected':''}>Tydzień</option><option value="month" ${(d.cfg||{}).iPeriod!=='week'?'selected':''}>Miesiąc</option></select></div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Ubezpieczenie (zł)</label><input type="number" id="us-uc" value="${(d.cfg||{}).uC||0}"></div>
                <div class="inp-group"><label>Okres</label><select id="us-utype"><option value="month" ${(d.cfg||{}).uType==='month'||!(d.cfg||{}).uType?'selected':''}>Miesiąc</option><option value="year" ${(d.cfg||{}).uType==='year'?'selected':''}>Rok</option></select></div>
            </div>
        </div>

        <div class="section-lbl" style="color:var(--info); border-color:var(--info);">⚖️ Podatki i Prowizje</div>
        <div class="panel">
            <div class="inp-group" style="margin-bottom:15px;">
                <label>Rozliczenie z Partnerem/ZUS</label>
                <select id="us-etype" onchange="window.dTogglePType('us')"><option value="flat" ${(d.cfg||{}).eType==='flat'?'selected':''}>Stała kwota (Partner / ZUS)</option><option value="pct" ${(d.cfg||{}).eType==='pct'?'selected':''}>Procent (Prowizja)</option></select>
            </div>
            <div class="inp-row" id="us-p-flat-box" style="display:${(d.cfg||{}).eType==='flat'?'flex':'none'}; margin-bottom:15px;">
                <div class="inp-group"><label>Kwota stała (zł)</label><input type="number" id="us-ec" value="${(d.cfg||{}).eC||0}"></div>
                <div class="inp-group"><label>Okres</label><select id="us-e-period"><option value="week" ${(d.cfg||{}).ePeriod==='week'?'selected':''}>Tydzień</option><option value="month" ${(d.cfg||{}).ePeriod!=='week'?'selected':''}>Miesiąc</option></select></div>
            </div>
            <div id="us-p-pct-box" style="display:${(d.cfg||{}).eType==='pct'?'block':'none'}; margin-bottom:15px;">
                <div class="inp-group"><label>Prowizja Partnera (%)</label><input type="number" id="us-epct" value="${Number((d.cfg||{}).ePct*100||0).toFixed(0)}"></div>
            </div>
            <div class="inp-row">
                <div class="inp-group"><label>Podatek / VAT (%)</label><input type="number" id="us-tx" value="${Number((d.cfg||{}).tax*100||0).toFixed(1)}" step="0.1"></div>
                <div class="inp-group"><label>Prow. Terminala (%)</label><input type="number" id="us-cf" value="${Number((d.cfg||{}).cardF*100||0).toFixed(1)}" step="0.1"></div>
            </div>
            <div class="inp-group" style="margin-top:15px;">
                <label>Prowizja Vouchera (%)</label><input type="number" id="us-vf" value="${Number((d.cfg||{}).voucherF*100||0).toFixed(1)}" step="0.1">
            </div>
        </div>

        <div class="section-lbl" style="color:var(--quote); border-color:var(--quote);">👥 Klienci VIP</div>
        <div class="panel">
            <div class="inp-row">
                <div class="inp-group"><label>Imię</label><input type="text" id="dc-n"></div>
                <div class="inp-group"><label>Telefon</label><input type="text" id="dc-p"></div>
            </div>
            <div class="inp-group" style="margin-bottom:15px;"><label>Rabat (%)</label><input type="number" id="dc-d"></div>
            <button class="btn btn-quote" onclick="window.dAddCrm()">+ DODAJ DO BAZY</button>
            <div style="margin-top:20px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                ${(d.clients||[]).map(c => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--quote);">
                    <div>
                        <strong style="color:#fff; font-size:1rem;">${c.n}</strong>
                        <span style="background:var(--quote); color:#fff; font-size:0.7rem; padding:2px 6px; border-radius:6px; margin-left:8px; font-weight:bold;">-${c.d||0}%</span><br>
                        <small style="color:var(--muted)">${c.ph||'Brak numeru'}</small>
                    </div>
                    <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.dCrmDel(${c.id})">USUŃ</button>
                </div>`).join('') || '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px;">Brak klientów.</div>'}
            </div>
        </div>

        <div class="section-lbl" style="color:var(--warning); border-color:var(--warning);">💾 Bezpieczeństwo Danych</div>
        <div class="panel" style="border-color:rgba(245, 158, 11, 0.4)">
            <p style="font-size:0.75rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Twoje dane są zapisane tylko w tym telefonie (100% Prywatności). Zrób kopię zapasową, aby przenieść profil na inne urządzenie lub zabezpieczyć się przed wyczyszczeniem przeglądarki!</p>
            <div style="display:flex; gap:10px;">
                <button class="btn" style="background:rgba(245,158,11,0.1); color:var(--warning); border:1px dashed var(--warning); flex:1; font-size:0.75rem; padding:10px;" onclick="window.dExport()">📥 POBIERZ PLIK</button>
                <label class="btn" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); flex:1; text-align:center; cursor:pointer; font-size:0.75rem; padding:10px; margin:0;">📤 PRZYWRÓĆ PLIK<input type="file" style="display:none" accept=".json" onchange="window.dImport(event)"></label>
            </div>
        </div>

        <div style="padding: 0 15px;">
            <button class="btn btn-driver" style="margin-bottom:30px;" onclick="window.dSaveUS()">💾 ZAKTUALIZUJ USTAWIENIA</button>
        </div>

        <div class="section-lbl" style="color:#ffdd00; border-color:#ffdd00; margin-top:30px;">☕ Wsparcie projektu StyreOS</div>
        <div class="panel" style="border-color:rgba(255, 221, 0, 0.4); background: linear-gradient(145deg, #1a1a00, #09090b); text-align:center; padding:20px;">
            <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">
                Podoba Ci się StyreOS? Twoje wsparcie pomaga mi opłacać serwery map i rozwijać nowe funkcje dla kierowców i rodzin. Każda "kawa" ma znaczenie!
            </p>
            <a href="https://buycoffee.to/styreos" target="_blank" style="background:#ffdd00; color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:15px; border-radius:12px; box-shadow: 0 4px 15px rgba(255, 221, 0, 0.2);">
                <span style="font-size:1.5rem;">☕</span> POSTAW MI KAWĘ
            </a>
        </div>

        <div class="section-lbl" style="color:var(--danger); border-color:var(--danger);">⚠️ Strefa Niebezpieczna</div>
        <div class="panel" style="border-color:rgba(239,68,68,0.4)">
            <button class="btn btn-danger" style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; box-shadow:none;" onclick="window.hardReset()">TWARDY RESET APLIKACJI</button>
        </div>` + nav;
    }
};
