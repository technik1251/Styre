// ==========================================
// PLIK: taxi_tab_term.js - Terminal Premium V13 (Ultra-Compact Glassmorphism, Premium Neo-Design)
// ==========================================

// --- 1. FUNKCJE POMOCNICZE I MATEMATYKA ---
window.getRealTodayYMD = function() {
    let d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

window.getValSafe = function(id) {
    let el = document.getElementById(id);
    if(el && el.value !== '') return parseFloat(el.value.replace(',','.')) || 0;
    return 0;
};

window.dTC = function(type, val) {
    if(type === 's') window.dTSrc = val;
    if(type === 'p') window.dTPay = val;
    if(typeof window.render === 'function') window.render();
};

window.getDistanceFromLatLonInKm = function(lat1, lon1, lat2, lon2) {
    let R = 6371; 
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

window.getFixedDailyCosts = function() {
    let c = window.db.drv.cfg || {};
    let now = new Date();
    let daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    let calc = function(val, period) {
        val = parseFloat(val) || 0;
        if (period === 'week') return val / 7;
        if (period === 'month') return val / daysInMonth;
        return val; 
    };

    let rent = calc(c.carRent || c.rent || c.costRent, c.carRentPeriod || 'week');
    let zus = calc(c.zus || c.costZus, c.zusPeriod || 'month');
    let eFix = (c.eType === 'fix') ? calc(c.eFix, c.ePeriod || 'week') : 0;
    let other = calc(c.fixedDaily || c.otherFix, c.fixedOtherPeriod || 'day');

    return rent + zus + eFix + other;
};

// --- 2. ZARZĄDZANIE ZMIANĄ I GPS ---
window.dStartS = function() {
    let el = document.getElementById('ds-o');
    if(!el || el.value === '') { 
        if(window.sysAlert) window.sysAlert('Błąd', 'Wprowadź stan licznika początkowego.', 'error'); 
        return; 
    }
    let o = parseFloat(el.value);
    if(isNaN(o) || o <= 0) { 
        if(window.sysAlert) window.sysAlert('Błąd', 'Stan licznika musi być poprawną liczbą.', 'error'); 
        return; 
    }
    
    let todayStr = window.getRealTodayYMD();
    let alreadyAppliedToday = false;
    if (window.db.drv.h && window.db.drv.h.length > 0) {
        for (let i = 0; i < window.db.drv.h.length; i++) {
            let x = window.db.drv.h[i];
            let xDate = x.rD ? new Date(x.rD) : null;
            if(xDate) { xDate.setMinutes(xDate.getMinutes() - xDate.getTimezoneOffset()); xDate = xDate.toISOString().split('T')[0]; }
            else { xDate = x.dt; }
            if (xDate === todayStr) { alreadyAppliedToday = true; break; }
        }
    }

    let initialFixedCosts = alreadyAppliedToday ? 0 : window.getFixedDailyCosts();

    if(!window.db.drv) window.db.drv = {};
    window.db.drv.odo = o;
    window.db.drv.sh = {
        on: true, o: o, t: Date.now(), shiftStart: Date.now(), 
        sPT: 0, sPS: null, rWT: 0, rWS: null, tr: [],
        shiftDist: 0, fixedCosts: initialFixedCosts, lastGlobalSave: Date.now()
    };
    window.db.drv.liveRideStart = null;
    
    window.initGlobalTracker();
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
};

window.dCancelShift = function() {
    if(confirm('Czy na pewno chcesz anulować bieżącą zmianę? Wszystkie zebrane dziś dane znikną bezpowrotnie.')) {
        let s = window.db.drv.sh;
        if(s && s.watchId) navigator.geolocation.clearWatch(s.watchId);
        if(s && s.globalWatchId) navigator.geolocation.clearWatch(s.globalWatchId);
        if(window.liveRideTimer) clearInterval(window.liveRideTimer);
        if(window.globalShiftTimer) clearInterval(window.globalShiftTimer);
        
        window.db.drv.sh = {on: false};
        window.db.drv.liveRideStart = null;
        if(typeof window.save === 'function') window.save(); 
        if(typeof window.render === 'function') window.render();
    }
};

window.initGlobalTracker = function() {
    if (!('geolocation' in navigator)) return;
    let s = window.db.drv.sh;
    if (!s || !s.on || s.globalWatchId) return; 

    s.shiftDist = s.shiftDist || 0;
    
    s.globalWatchId = navigator.geolocation.watchPosition(function(position) {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        let now = Date.now();
        
        if (!s.sPS) { 
            if (s.lastShiftPos) {
                let distTotal = window.getDistanceFromLatLonInKm(s.lastShiftPos.lat, s.lastShiftPos.lng, lat, lng);
                if (distTotal > 0.005) { 
                    s.shiftDist += distTotal;
                    let elShiftDist = document.getElementById('shift-total-dist');
                    if(elShiftDist) elShiftDist.innerHTML = s.shiftDist.toFixed(1) + ' km';
                    
                    if (now - (s.lastGlobalSave || 0) > 60000) { 
                        if(typeof window.save === 'function') window.save();
                        s.lastGlobalSave = now;
                    }
                }
            }
            s.lastShiftPos = {lat: lat, lng: lng};
        }
    }, function(err) { console.warn('Global GPS:', err); }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
};

window.resumeLiveRide = function() {
    let s = window.db.drv.sh;
    if (!s || !window.db.drv.liveRideStart) return;
    
    if ('geolocation' in navigator && !s.watchId) {
        s.watchId = navigator.geolocation.watchPosition(function(position) {
            if (s.rWS !== null) { s.lastGpsTime = Date.now(); return; }
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            let now = Date.now();
            let q = window.db.drv.q || {s:9, w:39, t1:3.2, t2:4.0, t3:6.4, t4:8.0};
            
            if (s.lastPos) {
                let dist = window.getDistanceFromLatLonInKm(s.lastPos.lat, s.lastPos.lng, lat, lng);
                if (position.coords.speed !== null && position.coords.speed !== undefined) {
                    s.currentSpeed = position.coords.speed * 3.6; 
                } else {
                    let timeDelta = now - (s.lastGpsTime || now);
                    if (timeDelta > 0) s.currentSpeed = (dist / (timeDelta / 3600000));
                }

                if (dist > 0.002 && s.currentSpeed < 160) { 
                    s.gpsDist += dist;
                    let currentRate = q[s.liveTariff || 't1'] || 3.2;
                    s.gpsMoney = (s.gpsMoney || 0) + (dist * currentRate);
                }
            }
            s.lastPos = {lat: lat, lng: lng};
            s.lastGpsTime = now;
            window.updateLiveRideUI();
        }, function(error) { console.error('Ride GPS Error:', error); }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
    }
    if(!window.liveRideTimer) window.liveRideTimer = setInterval(window.updateLiveRideUI, 1000);
};

// --- 3. CELE, PRZERWY I TARYFY ---
window.dGoalMode = window.dGoalMode || 'netto';
window.toggleGoalMode = function(mode) {
    window.dGoalMode = mode;
    if(typeof window.render === 'function') window.render();
};

window.dSetGoal = function() {
    let isNetto = window.dGoalMode === 'netto';
    let current = isNetto ? ((window.db.drv.cfg && window.db.drv.cfg.goalNetto) || 300) : ((window.db.drv.cfg && window.db.drv.cfg.goalBrutto) || 400);
    let modeName = isNetto ? 'NETTO DZIENNE (Kasa na czysto)' : 'UTARG DZIENNY (Brutto)';
    
    let ng = prompt("Podaj CEL DZIENNY " + modeName + " (PLN):", current);
    if(ng !== null && ng !== '') {
        let val = parseFloat(ng.replace(',','.'));
        if(!isNaN(val) && val > 0) {
            if(!window.db.drv.cfg) window.db.drv.cfg = {};
            if(isNetto) window.db.drv.cfg.goalNetto = val;
            else window.db.drv.cfg.goalBrutto = val;
            if(typeof window.save === 'function') window.save();
            if(typeof window.render === 'function') window.render();
        }
    }
};

window.toggleShiftPause = function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        let s = window.db.drv.sh;
        let elPauseBtn = document.getElementById('ui-pause-btn');

        if(s.sPS) {
            s.sPT += (Date.now() - s.sPS);
            s.sPS = null;
            if(elPauseBtn) {
                elPauseBtn.innerHTML = '☕ PRZERWA';
                elPauseBtn.style.background = 'rgba(255,255,255,0.05)';
                elPauseBtn.style.color = '#fff';
                elPauseBtn.style.borderColor = 'rgba(255,255,255,0.1)';
                elPauseBtn.style.transform = 'scale(1)';
            }
        } else { 
            s.sPS = Date.now(); 
            if(elPauseBtn) {
                elPauseBtn.innerHTML = '▶ WZNÓW (0m 00s)';
                elPauseBtn.style.background = 'rgba(245,158,11,0.2)';
                elPauseBtn.style.color = '#f59e0b';
                elPauseBtn.style.borderColor = 'rgba(245,158,11,0.4)';
                elPauseBtn.style.transform = 'scale(1.02)';
            }
        }
        setTimeout(function() { if(typeof window.save === 'function') window.save(); }, 10);
    }
};

window.toggleLiveTariff = function() {
    if(window.db && window.db.drv && window.db.drv.sh && window.db.drv.liveRideStart) {
        let current = window.db.drv.sh.liveTariff || 't1';
        let next = 't1';
        if(current === 't1') next = 't2';
        else if(current === 't2') next = 't3';
        else if(current === 't3') next = 't4';
        else if(current === 't4') next = 't1';
        
        window.db.drv.sh.liveTariff = next;
        window.updateLiveRideUI();
        setTimeout(function() { if(typeof window.save === 'function') window.save(); }, 10);
    }
};

// --- 4. SILNIK TAKSOMETRU GPS ---
window.updateLiveRideUI = function() {
    if (!window.db || !window.db.drv || !window.db.drv.liveRideStart) return;
    let d = window.db.drv;
    let s = d.sh;
    let elTime = document.getElementById('live-ride-time');
    let elDist = document.getElementById('live-ride-dist');
    let elPrice = document.getElementById('live-ride-price'); 
    let elStatus = document.getElementById('live-ride-status'); 
    let elTariffBtn = document.getElementById('live-tariff-btn');

    let isWaiting = s.rWS !== null;
    let now = Date.now();
    let diffMs = now - d.liveRideStart;
    if(s.rWT) diffMs -= s.rWT;
    if(isWaiting) diffMs -= (now - s.rWS);

    if (!s.lastTick) s.lastTick = now;
    let deltaTick = now - s.lastTick;
    s.lastTick = now;

    if (!isWaiting) {
        if (now - (s.lastGpsTime || now) > 5000) s.currentSpeed = 0;
        if ((s.currentSpeed || 0) <= 20) s.autoWaitMs = (s.autoWaitMs || 0) + deltaTick;
    }

    if (elTime) {
        let totalSecs = Math.floor(diffMs / 1000);
        let m = Math.floor(totalSecs / 60);
        let sec = totalSecs % 60;
        elTime.innerHTML = (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    }
    
    if (elDist && s.gpsDist !== undefined) elDist.innerHTML = Number(s.gpsDist).toFixed(2);

    let activeTariff = s.liveTariff || 't1';
    let isAutoWaitActive = (!isWaiting && (s.currentSpeed || 0) <= 20);
    
    if (elTariffBtn) {
        let tColor = (activeTariff==='t1')?'#10b981':(activeTariff==='t2')?'#3b82f6':(activeTariff==='t3')?'#f59e0b':'#ef4444';
        elTariffBtn.innerHTML = '🔄 TARYFA: ' + activeTariff.toUpperCase();
        elTariffBtn.style.color = tColor;
        elTariffBtn.style.borderColor = tColor;
    }
    
    if (elStatus) {
        if (isWaiting) elStatus.innerHTML = '<span style="font-size:0.65rem; color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); padding:4px 12px; border-radius:12px; font-weight:900;">⏸️ POSTÓJ RĘCZNY</span>';
        else if (isAutoWaitActive) elStatus.innerHTML = '<span style="font-size:0.65rem; color:#ef4444; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); padding:4px 12px; border-radius:12px; font-weight:900; animation: glowPulse 2s infinite;">⏱️ NALICZANIE POSTOJU (<20km/h)</span>';
        else elStatus.innerHTML = '<span style="font-size:0.65rem; color:var(--muted); font-weight:800; letter-spacing:1px;">SUGEROWANA CENA (' + activeTariff.toUpperCase() + ')</span>';
    }

    if (elPrice) {
        let q = d.q || {s:9, w:39, t1:3.2, t2:4.0, t3:6.4, t4:8.0};
        let manualWaitMs = s.rWT || 0;
        if(isWaiting) manualWaitMs += (now - s.rWS);
        let totalWaitMins = ((s.autoWaitMs || 0) + manualWaitMs) / 60000;
        let livePrice = q.s + (s.gpsMoney || 0) + (totalWaitMins * (q.w / 60));
        if(livePrice < q.s) livePrice = q.s;
        elPrice.innerHTML = livePrice.toFixed(2);
    }
};

window.startLiveRide = function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        window.db.drv.liveRideStart = Date.now();
        let s = window.db.drv.sh;
        s.rWS = null; s.rWT = 0; s.gpsDist = 0; s.gpsMoney = 0; s.lastPos = null;
        s.liveTariff = 't1'; s.autoWaitMs = 0; s.currentSpeed = 0; s.lastTick = Date.now(); s.lastGpsTime = Date.now();
        
        if (!s.globalWatchId) window.initGlobalTracker();
        window.resumeLiveRide();

        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
    }
};

window.stopLiveRide = function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        let s = window.db.drv.sh;
        if (s.watchId) { navigator.geolocation.clearWatch(s.watchId); s.watchId = null; }
        if(window.liveRideTimer) { clearInterval(window.liveRideTimer); window.liveRideTimer = null; }
        
        let diffMs = Date.now() - window.db.drv.liveRideStart;
        if (s.rWT) diffMs -= s.rWT;
        let finalMins = Math.max(0, Math.round(diffMs / 60000));
        let finalDist = s.gpsDist || 0;

        let q = window.db.drv.q || {s:9, w:39, t1:3.2};
        let manualWaitMs = s.rWT || 0;
        let totalWaitMins = ((s.autoWaitMs || 0) + manualWaitMs) / 60000;
        let finalPrice = q.s + (s.gpsMoney || 0) + (totalWaitMins * (q.w / 60));

        s.tempAutoMins = finalMins;
        s.tempAutoKm = finalDist.toFixed(2);
        s.tempAutoPrice = Math.max(q.s, finalPrice).toFixed(2);

        window.db.drv.liveRideStart = null;
        s.rWS = null; s.lastPos = null;

        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();

        setTimeout(function() {
            if(window.sysAlert) window.sysAlert('Trasa Zakończona', 'Zastosowano odpowiednie stawki. Dane gotowe do zapisu.', 'success');
        }, 100);
    }
};

window.toggleRideWait = function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        if(window.db.drv.sh.rWS) {
            window.db.drv.sh.rWT += (Date.now() - window.db.drv.sh.rWS);
            window.db.drv.sh.rWS = null;
        } else { window.db.drv.sh.rWS = Date.now(); }
        window.updateLiveRideUI();
        setTimeout(function() { if(typeof window.save === 'function') window.save(); }, 10);
    }
};

// --- 5. MODAL ZAMYKANIA ZMIANY ---
window.openPremiumEndShiftModal = function() {
    let s = window.db.drv.sh || {};
    let startOdo = s.o ? parseFloat(s.o) : 0;
    let shiftDist = s.shiftDist || 0;
    let predictedEndOdo = Math.round(startOdo + shiftDist);

    let diffHrs = 0, diffMins = 0;
    if(s.shiftStart) {
        let ms = Date.now() - s.shiftStart;
        if(s.sPT) ms -= s.sPT;
        if(s.sPS) ms -= (Date.now() - s.sPS);
        diffHrs = Math.floor(ms/3600000);
        diffMins = Math.floor((ms%3600000)/60000);
    }
    
    let g = 0;
    if(s.tr) s.tr.forEach(function(x) { g += (parseFloat(x.v)||0); });
    let isApps = (window.db.drv.plat === 'apps');

    let html = '<div id="m-end-shift-premium" class="modal-overlay" style="z-index:99999; position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:flex-start; justify-content:center; background:rgba(0,0,0,0.85); backdrop-filter:blur(20px); overflow-y:auto; padding:30px 0; box-sizing:border-box; animation:fadeIn 0.2s ease;">' +
        '<div class="crystal-card crystal-panel" style="width:90%; max-width:400px; padding:25px 20px; margin:auto; flex-shrink:0;">' +
            '<div style="text-align:center; margin-bottom:20px;">' +
                '<div style="font-size:3rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(239,68,68,0.5));">🏁</div>' +
                '<h3 style="color:#ef4444; margin:0 0 5px 0; font-size:1.4rem; font-weight:900; text-transform:uppercase;">Zakończ Zmianę</h3>' +
                '<p style="color:var(--muted); font-size:0.75rem; margin-bottom:15px;">Podsumuj swój dzień operacyjny.</p>' +
                '<div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.6); padding:12px; border-radius:12px; border:1px inset rgba(255,255,255,0.05);">' +
                    '<div style="text-align:center; flex:1;"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Czas Pracy</span><br><strong style="color:#0ea5e9; font-size:1.1rem;">'+diffHrs+'h '+diffMins+'m</strong></div>' +
                    '<div style="text-align:center; flex:1; border-left:1px solid rgba(255,255,255,0.1);"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Aktualny Utarg</span><br><strong style="color:#10b981; font-size:1.1rem;">'+g.toFixed(2)+' zł</strong></div>' +
                '</div>' +
            '</div>' +
            
            '<div style="background:rgba(14,165,233,0.05); border:1px solid rgba(14,165,233,0.2); border-radius:16px; padding:15px; margin-bottom:20px;">' +
                '<label style="font-size:0.65rem; color:#0ea5e9; font-weight:900; display:block; margin-bottom:10px; text-transform:uppercase; text-align:center;">DODATKOWE ZAROBKI Z APLIKACJI</label>' +
                (isApps ? 
                    '<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">' +
                        '<input type="number" step="0.01" id="me-v-uber" placeholder="Uber (PLN)" class="compact-inp" style="padding:12px; font-size:0.9rem;">' +
                        '<input type="number" step="0.01" id="me-v-bolt" placeholder="Bolt (PLN)" class="compact-inp" style="padding:12px; font-size:0.9rem;">' +
                        '<input type="number" step="0.01" id="me-v-freenow" placeholder="FreeNow (PLN)" class="compact-inp" style="padding:12px; font-size:0.9rem;">' +
                        '<input type="number" step="0.01" id="me-v-inna" placeholder="Inna Apka" class="compact-inp" style="padding:12px; font-size:0.9rem;">' +
                        '<input type="number" step="0.01" id="me-v-cash" placeholder="Gotówka (Całość)" style="grid-column:span 2; padding:15px; font-size:1.1rem; color:#10b981; border-color:rgba(16,185,129,0.3);" class="compact-inp">' +
                    '</div>' 
                : 
                    '<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">' +
                        '<input type="number" step="0.01" id="me-v-cash" placeholder="Gotówka (PLN)" class="compact-inp" style="color:#10b981; padding:12px; font-size:0.9rem;">' +
                        '<input type="number" step="0.01" id="me-v-karta" placeholder="Terminal (PLN)" class="compact-inp" style="color:#0ea5e9; padding:12px; font-size:0.9rem;">' +
                        '<input type="number" step="0.01" id="me-v-voucher" placeholder="Vouchery" style="grid-column:span 2; padding:12px; font-size:0.9rem; color:#a855f7;" class="compact-inp">' +
                    '</div>'
                ) +
            '</div>' +

            '<div style="background:#000; border-radius:16px; padding:20px; text-align:center; border:1px inset rgba(255,255,255,0.05); margin-bottom:20px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.5);">' +
                '<label style="font-size:0.65rem; color:#ef4444; font-weight:800; display:block; margin-bottom:10px; letter-spacing:1px;">STAN LICZNIKA POJAZDU (KONIEC)</label>' +
                '<input type="number" id="de-o" value="'+predictedEndOdo+'" style="width:100%; background:transparent; border:none; color:#ef4444; font-size:3rem; font-weight:900; text-align:center; outline:none; padding:0; font-family:monospace; text-shadow: 0 0 15px rgba(239,68,68,0.4);">' +
                '<div style="font-size:0.65rem; color:var(--muted); margin-top:5px; font-weight:700;">Start: '+startOdo+' km | Przejechano (GPS): '+shiftDist.toFixed(1)+' km</div>' +
            '</div>' +
            
            '<button style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; font-weight:900; padding:18px; border-radius:16px; border:none; width:100%; font-size:1.1rem; box-shadow:0 8px 25px rgba(239,68,68,0.4); cursor:pointer;" onclick="window.submitPremiumEndShiftModal()">ROZLICZ ZMIANĘ</button>' +
            '<button style="background:transparent; color:rgba(255,255,255,0.4); margin-top:10px; border:1px solid rgba(255,255,255,0.1); padding:15px; border-radius:16px; width:100%; font-weight:bold; cursor:pointer;" onclick="document.getElementById(\'m-end-shift-premium\').remove()">ANULUJ</button>' +
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

window.submitPremiumEndShiftModal = function() {
    try {
        let d = window.db.drv;
        let s = d.sh;
        if(!s || !s.on) return;

        let time = new Date().toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
        if(!s.tr) s.tr = [];
        
        if(d.plat === 'apps') {
            let u = window.getValSafe('me-v-uber'); let b = window.getValSafe('me-v-bolt');
            let f = window.getValSafe('me-v-freenow'); let i = window.getValSafe('me-v-inna');
            let c = window.getValSafe('me-v-cash');
            if(u>0) s.tr.push({id:Date.now()+1, v:u, k:0, m:0, time:time, p:'Aplikacja', s:'Uber'});
            if(b>0) s.tr.push({id:Date.now()+2, v:b, k:0, m:0, time:time, p:'Aplikacja', s:'Bolt'});
            if(f>0) s.tr.push({id:Date.now()+3, v:f, k:0, m:0, time:time, p:'Aplikacja', s:'FreeNow'});
            if(i>0) s.tr.push({id:Date.now()+4, v:i, k:0, m:0, time:time, p:'Aplikacja', s:'Inna'});
            if(c>0) s.tr.push({id:Date.now()+5, v:c, k:0, m:0, time:time, p:'Gotówka', s:'Aplikacja'});
        } else {
            let c = window.getValSafe('me-v-cash'); let k = window.getValSafe('me-v-karta'); let v = window.getValSafe('me-v-voucher');
            if(c>0) s.tr.push({id:Date.now()+1, v:c, k:0, m:0, time:time, p:'Gotówka', s:'Centrala'});
            if(k>0) s.tr.push({id:Date.now()+2, v:k, k:0, m:0, time:time, p:'Karta', s:'Terminal'});
            if(v>0) s.tr.push({id:Date.now()+3, v:v, k:0, m:0, time:time, p:'Voucher', s:'Korporacja'});
        }

        let endOdo = window.getValSafe('de-o');
        if(endOdo < s.o || endOdo === 0) endOdo = s.o;
        d.odo = endOdo;
        let distTotal = endOdo - s.o;
        
        if (s.watchId) navigator.geolocation.clearWatch(s.watchId);
        if (s.globalWatchId) navigator.geolocation.clearWatch(s.globalWatchId);
        if (window.liveRideTimer) clearInterval(window.liveRideTimer);
        if (window.globalShiftTimer) clearInterval(window.globalShiftTimer);

        let g = 0, sumCard = 0, sumVouch = 0;
        s.tr.forEach(function(x) {
            let val = parseFloat(x.v)||0; g += val;
            if(x.p === 'Karta') sumCard += val;
            if(x.p === 'Voucher') sumVouch += val;
        });

        let cfg = d.cfg || {};
        let taxRate = parseFloat(cfg.tax) || 0; let fuelPx = parseFloat(cfg.fuelPx) || 0;
        let ePct = (cfg.eType === 'pct') ? (parseFloat(cfg.ePct) || 0) : 0;
        let cardF = parseFloat(cfg.cardF) || 0; let vouchF = parseFloat(cfg.voucherF) || 0;
        
        let cF = sumCard * cardF; let vF = sumVouch * vouchF;
        let tax = g * taxRate; let pFee = g * ePct; let fc = distTotal * fuelPx;

        let fixedCosts = (s.fixedCosts !== undefined) ? s.fixedCosts : 0;
        let n = g - fc - tax - pFee - cF - vF - fixedCosts;
        
        let hW = 0;
        if(s.shiftStart) {
            let ms = Date.now() - s.shiftStart;
            if(s.sPT) ms -= s.sPT;
            if(s.sPS) ms -= (Date.now() - s.sPS);
            hW = parseFloat((ms/3600000).toFixed(2));
        }

        let dtStr = window.getRealTodayYMD();

        if(!d.h) d.h = [];
        d.h.push({
            id: Date.now(), dt: dtStr, rD: new Date().toISOString(),
            g: g, n: n, k: distTotal, pk: 0, emptyK: distTotal,
            hW: hW, fc: fc, tx: tax, pF: pFee, cF: cF, vF: vF, tr: s.tr
        });
        d.h.sort(function(a,b) { return new Date(b.rD) - new Date(a.rD); });

        d.sh = {on: false};
        let mEl = document.getElementById('m-end-shift-premium');
        if(mEl) mEl.remove();
        
        if(typeof window.save === 'function') window.save(); 
        if(typeof window.render === 'function') window.render();
        if(window.sysAlert) window.sysAlert('Zmiana Zakończona', 'Pomyślnie zsynchronizowano z historią.', 'success');
    } catch(err) {
        if(window.sysAlert) window.sysAlert('Błąd Krytyczny', 'Błąd zapisu: ' + err.message, 'error');
        else alert('Błąd: ' + err.message);
    }
};

// --- RENDER GŁÓWNY (UI) KOMPAKTOWY PREMIUM ---
window.getOfflineHTML = function(d) {
    let lblStyle = 'font-size:0.6rem; color:var(--muted); font-weight:800; text-transform:uppercase; margin-bottom:6px; display:block; text-align:left;';
    let html = '<div style="color:#0ea5e9; margin-top:10px; font-size:0.75rem; font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:15px;">⚡ ZALEGŁA ZMIANA (OFFLINE)</div><div class="crystal-card crystal-panel" style="padding:25px 15px; margin-bottom:20px;">';
    html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"><div><label style="'+lblStyle+'">Data Startu</label><input type="date" id="dw-d-from" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" class="compact-inp"></div><div><label style="'+lblStyle+'">Data Koniec</label><input type="date" id="dw-d-to" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" class="compact-inp"></div></div>';
    html += '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#f59e0b; font-weight:900; text-align:center; display:block; margin-bottom:10px;">STAN LICZNIKA POJAZDU</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" id="dw-odo-s" value="'+(d.odo||0)+'" placeholder="Start (KM)" class="compact-inp" style="color:#f59e0b; border-color:rgba(245,158,11,0.3);"></div><div><input type="number" id="dw-odo-e" placeholder="Koniec (KM)" class="compact-inp" style="color:#f59e0b; border-color:rgba(245,158,11,0.3);"></div></div></div>';
    
    if(d.plat === 'apps') {
        html += '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#0ea5e9; font-weight:900; text-align:center; display:block; margin-bottom:10px;">ROZBICIE UTARGU (ZŁ)</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" step="0.01" id="dw-v-uber" placeholder="Uber" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-bolt" placeholder="Bolt" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-freenow" placeholder="FreeNow" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-inna" placeholder="Inna Apka" class="compact-inp"></div><div style="grid-column: span 2;"><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka (Suma)" class="compact-inp" style="color:#10b981; border-color:rgba(16,185,129,0.3); font-size:1.2rem; padding:15px;"></div></div></div>';
    } else {
        html += '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#0ea5e9; font-weight:900; text-align:center; display:block; margin-bottom:10px;">ROZBICIE UTARGU (ZŁ)</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka" class="compact-inp" style="color:#10b981; border-color:rgba(16,185,129,0.3);"></div><div><input type="number" step="0.01" id="dw-v-karta" placeholder="Terminal" class="compact-inp" style="color:#0ea5e9; border-color:rgba(14,165,233,0.3);"></div><div style="grid-column: span 2;"><input type="number" step="0.01" id="dw-v-voucher" placeholder="Vouchery" class="compact-inp" style="color:#a855f7; border-color:rgba(168,85,247,0.3);"></div></div></div>';
    }
    
    html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;"><div><label style="'+lblStyle+'">Dystans Płatny (KM)</label><input type="number" id="dw-pk" placeholder="0.0" class="compact-inp"></div><div><label style="'+lblStyle+'">Czas Pracy (H)</label><input type="number" id="dw-h" placeholder="0" class="compact-inp"></div></div><button style="width:100%; padding:18px; border-radius:16px; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; font-size:1rem; border:none; box-shadow:0 6px 20px rgba(14,165,233,0.3);" onclick="window.dAddOfflineWeekly()">ZAKSIĘGUJ ZMIANĘ</button><button style="width:100%; padding:16px; border-radius:16px; background:transparent; color:var(--muted); border:1px solid rgba(255,255,255,0.1); margin-top:10px; font-weight:800; font-size:0.85rem;" onclick="window.dShowOff=false; window.render()">ANULUJ</button></div>';
    return html;
};

window.rDrvTerm = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;
        
        let html = [hdr];
        
        // ZASZYTE STYLE CSS - OSTATECZNA OCHRONA PRZED CACHE
        html.push('<style id="crystal-styles-v13">');
        html.push('.crystal-card { background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.2) 100%); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.3); border-radius: 16px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.5); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 15px 5px; text-align: center; position: relative; overflow: hidden; }');
        html.push('.crystal-card::after { content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); animation: shine 6s infinite; }');
        html.push('@keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }');
        html.push('.crystal-uber { border-top-color: rgba(14,165,233,0.6); box-shadow: inset 0 1px 2px rgba(14,165,233,0.4), 0 8px 20px rgba(0,0,0,0.5), 0 0 15px rgba(14,165,233,0.1); }');
        html.push('.crystal-bolt { border-top-color: rgba(34,197,94,0.6); box-shadow: inset 0 1px 2px rgba(34,197,94,0.4), 0 8px 20px rgba(0,0,0,0.5), 0 0 15px rgba(34,197,94,0.1); }');
        html.push('.crystal-freenow { border-top-color: rgba(217,70,239,0.6); box-shadow: inset 0 1px 2px rgba(217,70,239,0.4), 0 8px 20px rgba(0,0,0,0.5), 0 0 15px rgba(217,70,239,0.1); }');
        html.push('.crystal-cash { border-top-color: rgba(16,185,129,0.6); box-shadow: inset 0 1px 2px rgba(16,185,129,0.4), 0 8px 20px rgba(0,0,0,0.5), 0 0 15px rgba(16,185,129,0.1); }');
        html.push('.crystal-main { border-top-color: rgba(255,255,255,0.4); background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.4) 100%); box-shadow: inset 0 1px 2px rgba(255,255,255,0.3), 0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(255,255,255,0.05); }');
        html.push('.crystal-time { border-top-color: rgba(14,165,233,0.6); box-shadow: inset 0 1px 2px rgba(14,165,233,0.4), 0 6px 15px rgba(0,0,0,0.5), 0 0 12px rgba(14,165,233,0.1); }');
        html.push('.crystal-gross { border-top-color: rgba(16,185,129,0.6); box-shadow: inset 0 1px 2px rgba(16,185,129,0.4), 0 6px 15px rgba(0,0,0,0.5), 0 0 12px rgba(16,185,129,0.1); }');
        html.push('.crystal-dist { border-top-color: rgba(245,158,11,0.6); box-shadow: inset 0 1px 2px rgba(245,158,11,0.4), 0 6px 15px rgba(0,0,0,0.5), 0 0 12px rgba(245,158,11,0.1); }');
        html.push('.crystal-panel { border-top-color: rgba(255,255,255,0.2); box-shadow: inset 0 1px 2px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.5); }');
        html.push('.compact-inp { background: rgba(0,0,0,0.4); border: 1px inset rgba(255,255,255,0.05); color: #fff; border-radius: 12px; padding: 12px; text-align: center; font-size: 1.1rem; font-weight: 700; outline: none; width: 100%; box-sizing: border-box; transition: border 0.3s; } .compact-inp:focus { border-color: rgba(14,165,233,0.5); }');
        html.push('.btn-taryfa { width:100%; height:100%; border-radius:10px; font-weight:900; font-size:1rem; background: linear-gradient(to bottom, #333, #111); box-shadow: 0 3px 0 #000, inset 0 2px 4px rgba(255,255,255,0.2); cursor:pointer; outline:none; transition:all 0.1s; } .btn-taryfa:active { transform: translateY(3px); box-shadow: 0 0 0 #000, inset 0 2px 4px rgba(255,255,255,0.2); }');
        // Nowe Neo Chipy do Kreatora Kursu
        html.push('.neo-chip { padding: 10px 14px; border-radius: 12px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.4); color: var(--muted); text-align: center; flex: 1; white-space: nowrap; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); }');
        html.push('.neo-chip.active.blue { background: linear-gradient(135deg, rgba(14,165,233,0.3), rgba(14,165,233,0.1)); color: #fff; border-color: rgba(14,165,233,0.6); box-shadow: 0 4px 15px rgba(14,165,233,0.3), inset 0 1px 2px rgba(255,255,255,0.2); text-shadow: 0 0 5px rgba(255,255,255,0.5); transform: translateY(-2px); }');
        html.push('.neo-chip.active.green { background: linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1)); color: #fff; border-color: rgba(16,185,129,0.6); box-shadow: 0 4px 15px rgba(16,185,129,0.3), inset 0 1px 2px rgba(255,255,255,0.2); text-shadow: 0 0 5px rgba(255,255,255,0.5); transform: translateY(-2px); }');
        html.push('.neo-input-box { background: rgba(0,0,0,0.6); border: 1px solid rgba(14,165,233,0.3); border-radius: 16px; padding: 15px; box-shadow: inset 0 4px 20px rgba(0,0,0,0.8), 0 0 15px rgba(14,165,233,0.1); display: flex; align-items: center; justify-content: center; transition: all 0.3s; }');
        html.push('.neo-input-box:focus-within { border-color: #0ea5e9; box-shadow: inset 0 4px 20px rgba(0,0,0,0.8), 0 0 25px rgba(14,165,233,0.3); }');
        html.push('</style>');

        if(!window.dTSrc || (d.plat === 'corp' && window.dTSrc === 'Inna')) { window.dTSrc = d.plat === 'apps' ? 'Uber' : 'Centrala'; }
        if(!window.dTPay) { window.dTPay = d.plat === 'apps' ? 'Aplikacja' : 'Gotówka'; }
        
        let cSrc = function(name) { return window.dTSrc === name ? 'neo-chip active blue' : 'neo-chip'; };
        let cPay = function(name, cl) { return window.dTPay === name ? 'neo-chip active '+cl : 'neo-chip'; };
        
        let ch1 = '', ch2 = '', otherSrcHtml = '';
        if(d.plat === 'apps') {
            ch1 = '<div class="'+cSrc('Uber')+'" onclick="window.dTC(\'s\',\'Uber\')">Uber</div><div class="'+cSrc('Bolt')+'" onclick="window.dTC(\'s\',\'Bolt\')">Bolt</div><div class="'+cSrc('FreeNow')+'" onclick="window.dTC(\'s\',\'FreeNow\')">FreeNow</div><div class="'+cSrc('Inna')+'" onclick="window.dTC(\'s\',\'Inna\')">Inna</div>';
            otherSrcHtml = (window.dTSrc === 'Inna') ? '<div style="margin-bottom:15px;"><input type="text" id="dt-other-src" placeholder="Nazwa apki..." class="compact-inp" value="'+(window.dOtherSrc||'')+'" onchange="window.dOtherSrc=this.value"></div>' : '';
            ch2 = '<div class="'+cPay('Aplikacja','blue')+'" onclick="window.dTC(\'p\',\'Aplikacja\')">Aplikacja</div><div class="'+cPay('Gotówka','green')+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div>';
        } else {
            ch1 = '<div class="'+cSrc('Centrala')+'" onclick="window.dTC(\'s\',\'Centrala\')">Centrala</div><div class="'+cSrc('Postój')+'" onclick="window.dTC(\'s\',\'Postój\')">Postój</div><div class="'+cSrc('Prywatny')+'" onclick="window.dTC(\'s\',\'Prywatny\')">Prywatny</div>';
            ch2 = '<div class="'+cPay('Gotówka','green')+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div><div class="'+cPay('Karta','blue')+'" onclick="window.dTC(\'p\',\'Karta\')">Karta</div><div class="'+cPay('Voucher','blue')+'" style="'+(window.dTPay==='Voucher'?'color:#a855f7; border-color:rgba(168,85,247,0.4); box-shadow:0 4px 15px rgba(168,85,247,0.3);':'')+'" onclick="window.dTC(\'p\',\'Voucher\')">Voucher</div>';
        }

        let clientOpts = '';
        if(d.clients) d.clients.forEach(c => clientOpts += '<option value="'+c.id+'">'+c.n+'</option>');
        
        let g=0, sumCash=0, sumCard=0, sumVouch=0, manualKm=0;
        let uSum = 0, bSum = 0, fSum = 0, iSum = 0; 
        if(d.sh && d.sh.on && d.sh.tr) {
            d.sh.tr.forEach(x => {
                let val = parseFloat(x.v)||0; g += val; manualKm += parseFloat(x.k)||0;
                if(x.p === 'Gotówka') sumCash += val;
                if(x.p === 'Karta') sumCard += val;
                if(x.p === 'Voucher') sumVouch += val;
                
                if(x.s === 'Uber') uSum += val;
                if(x.s === 'Bolt') bSum += val;
                if(x.s === 'FreeNow') fSum += val;
                if(x.s === 'Inna') iSum += val;
            });
        }

        let diffHrs = 0, diffMins = 0, activeHrs = 0;
        if(d.sh && d.sh.shiftStart) {
            let aMs = Date.now() - d.sh.shiftStart;
            if(d.sh.sPT) aMs -= d.sh.sPT;
            activeHrs = aMs / 3600000;
            diffHrs = Math.floor(activeHrs);
            diffMins = Math.floor((aMs % 3600000) / 60000);
        }

        let todayStr = window.getRealTodayYMD();
        let todayPastGross = 0, todayPastNetto = 0, todayPastHrs = 0;
        if (d.h) {
            d.h.forEach(x => {
                let xDate = x.rD ? new Date(x.rD) : null;
                if(xDate) { xDate.setMinutes(xDate.getMinutes() - xDate.getTimezoneOffset()); xDate = xDate.toISOString().split('T')[0]; }
                else { xDate = x.dt; }
                
                if (xDate === todayStr) {
                    todayPastGross += (parseFloat(x.g) || 0);
                    todayPastNetto += (parseFloat(x.n) || 0);
                    todayPastHrs += (parseFloat(x.hW) || 0);
                }
            });
        }

        // GLOBALNY ZEGAR UI (STOPER PRZERWY)
        if(window.globalShiftTimer) clearInterval(window.globalShiftTimer);
        if(d.sh && d.sh.on) {
            window.globalShiftTimer = setInterval(function() {
                if(!window.db || !window.db.drv || !window.db.drv.sh || !window.db.drv.sh.on) {
                    clearInterval(window.globalShiftTimer); return;
                }
                let s = window.db.drv.sh;
                let aMs = Date.now() - s.shiftStart;
                if(s.sPT) aMs -= s.sPT;
                
                let elPauseBtn = document.getElementById('ui-pause-btn');
                if(s.sPS) {
                    aMs -= (Date.now() - s.sPS);
                    let pMs = Date.now() - s.sPS;
                    let pM = Math.floor(pMs / 60000);
                    let pS = Math.floor((pMs % 60000) / 1000);
                    if(elPauseBtn) {
                        elPauseBtn.innerHTML = '▶ WZNÓW (' + pM + 'm ' + (pS<10?'0':'')+pS + 's)';
                        elPauseBtn.style.background = 'rgba(245,158,11,0.2)';
                        elPauseBtn.style.color = '#f59e0b';
                        elPauseBtn.style.borderColor = 'rgba(245,158,11,0.4)';
                        elPauseBtn.style.transform = 'scale(1.02)';
                    }
                } else {
                    if(elPauseBtn) {
                        elPauseBtn.innerHTML = '☕ PRZERWA';
                        elPauseBtn.style.background = 'rgba(255,255,255,0.05)';
                        elPauseBtn.style.color = '#fff';
                        elPauseBtn.style.borderColor = 'rgba(255,255,255,0.1)';
                        elPauseBtn.style.transform = 'scale(1)';
                    }
                }
                
                aMs = Math.max(0, aMs);
                let hrs = Math.floor(aMs / 3600000);
                let mins = Math.floor((aMs % 3600000) / 60000);
                let elTime = document.getElementById('ui-shift-time');
                if(elTime) elTime.innerHTML = hrs + 'h ' + mins + 'm';
            }, 1000);
        }

        if(d.sh && d.sh.on && !d.sh.globalWatchId) window.initGlobalTracker();

        if (d.sh && d.sh.on) {
            html.push('<div style="padding:0 10px; margin-top:10px;">');
            
            // --- SMART GOAL UI ---
            window.dGoalMode = window.dGoalMode || 'netto';
            let isNetto = window.dGoalMode === 'netto';
            
            let totalKm = (d.sh.shiftDist || 0) + manualKm;
            let taxRate = (d.cfg && d.cfg.tax) ? parseFloat(d.cfg.tax) : 0;
            let fuelPx = (d.cfg && d.cfg.fuelPx) ? parseFloat(d.cfg.fuelPx) : 0;
            let ePct = (d.cfg && d.cfg.eType === 'pct') ? (parseFloat(d.cfg.ePct) || 0) : 0;
            let cardF = (d.cfg && d.cfg.cardF) ? parseFloat(d.cfg.cardF) : 0;
            let vouchF = (d.cfg && d.cfg.voucherF) ? parseFloat(d.cfg.voucherF) : 0;

            let fixedCosts = (d.sh.fixedCosts !== undefined) ? d.sh.fixedCosts : 0; 
            let varCosts = (totalKm * fuelPx) + (g * taxRate) + (g * ePct) + (sumCard * cardF) + (sumVouch * vouchF);

            let currentShiftNetto = g - varCosts - fixedCosts;
            
            let dailyGross = todayPastGross + g;
            let dailyNetto = todayPastNetto + currentShiftNetto;
            let currProg = isNetto ? dailyNetto : dailyGross;
            
            let activeWorkHrs = 0;
            if(d.sh.shiftStart) {
                let aMs = Date.now() - d.sh.shiftStart;
                if(d.sh.sPT) aMs -= d.sh.sPT;
                if(d.sh.sPS) aMs -= (Date.now() - d.sh.sPS); 
                activeWorkHrs = Math.max(0, aMs / 3600000);
            }
            let totalActiveHrs = todayPastHrs + activeWorkHrs;

            let goalBrutto = (d.cfg && d.cfg.goalBrutto) ? parseFloat(d.cfg.goalBrutto) : 400;
            let goalNetto = (d.cfg && d.cfg.goalNetto) ? parseFloat(d.cfg.goalNetto) : 300;
            let activeGoal = isNetto ? goalNetto : goalBrutto;
            
            let totalFixedCosts = todayPastNetto === 0 ? fixedCosts : 0; 
            let startValue = isNetto ? -totalFixedCosts : 0;
            
            let totalJourney = activeGoal - startValue;
            let covered = currProg - startValue;
            let pct = (totalJourney > 0) ? (covered / totalJourney) * 100 : 0;
            pct = Math.min(Math.max(pct, 0), 100);

            let etaStr = '--:--';
            let speedPerHour = totalActiveHrs > 0 ? ((currProg - startValue) / totalActiveHrs) : 0; 
            
            if (totalActiveHrs > 0.1) { 
                let remaining = activeGoal - currProg;
                if (remaining <= 0) {
                    etaStr = 'Osiągnięto! 🎉';
                } else if (speedPerHour > 0) {
                    let hoursLeft = remaining / speedPerHour;
                    let mLeft = Math.round(hoursLeft * 60);
                    etaStr = Math.floor(mLeft / 60) + 'h ' + (mLeft % 60) + 'm';
                } else {
                    etaStr = 'Odrabianie strat...';
                }
            } else {
                etaStr = 'Zbieranie danych...';
            }

            // GŁÓWNY PANEL (Kryształowy Duży)
            html.push('<div class="crystal-card crystal-main" style="padding:20px 15px; margin-bottom:15px;">');
            html.push('<div style="font-size:0.7rem; color:var(--muted); font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:5px;">'+(isNetto?'NETTO CAŁY DZIEŃ':'BRUTTO CAŁY DZIEŃ')+'</div>');
            html.push('<div style="font-size:3.5rem; font-weight:900; color:'+(isNetto?'#10b981':'#0ea5e9')+'; line-height:1; margin-bottom:15px;"><span id="goal-current-val">'+currProg.toFixed(2)+'</span> <span style="font-size:1.2rem; color:rgba(255,255,255,0.4);">zł</span></div>');
            
            html.push('<div style="display:inline-flex; background:rgba(0,0,0,0.5); border-radius:10px; border:1px solid rgba(255,255,255,0.05); overflow:hidden; margin-bottom:15px;">');
            html.push('<button style="padding:6px 12px; font-size:0.65rem; font-weight:900; border:none; cursor:pointer; ' + (isNetto ? 'background:rgba(255,255,255,0.15); color:#fff;' : 'background:transparent; color:var(--muted);') + '" onclick="window.toggleGoalMode(\'netto\')">Netto (Operacyjne)</button>');
            html.push('<button style="padding:6px 12px; font-size:0.65rem; font-weight:900; border:none; cursor:pointer; ' + (!isNetto ? 'background:rgba(255,255,255,0.15); color:#fff;' : 'background:transparent; color:var(--muted);') + '" onclick="window.toggleGoalMode(\'brutto\')">Brutto (Utarg)</button>');
            html.push('</div>');

            html.push('<div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800; color:var(--muted); margin-bottom:6px;"><span style="cursor:pointer;" onclick="window.dSetGoal()">Cel: ' + activeGoal.toFixed(0) + ' zł ⚙️</span><span style="color:#fff;">'+Math.round(pct)+'%</span></div>');
            html.push('<div style="height:6px; background:rgba(0,0,0,0.5); border-radius:3px; margin-bottom:8px;"><div id="goal-bar-fill" style="height:100%; width:'+pct+'%; background:'+(isNetto?'#10b981':'#0ea5e9')+'; border-radius:3px; box-shadow:0 0 10px '+(isNetto?'#10b981':'#0ea5e9')+'; transition:width 0.5s ease;"></div></div>');
            html.push('<div style="font-size:0.65rem; color:var(--muted); font-weight:700;">ETA DO CELU: <span style="color:#fff;">~'+etaStr+'</span> | EFEKTYWNOŚĆ: '+(speedPerHour).toFixed(0)+' zł/h</div>');
            html.push('</div>');

            // --- ZWARTY WIDOK INFORMACYJNY (Kryształowe Kafelki 2x2) ---
            if (d.plat === 'apps') {
                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">');
                html.push('<div class="crystal-card crystal-uber"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; margin-bottom:2px; letter-spacing:1px;">UBER</div><div style="font-size:1.3rem; font-weight:900; color:#0ea5e9;">'+Number(uSum).toFixed(2)+'</div></div>');
                html.push('<div class="crystal-card crystal-bolt"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; margin-bottom:2px; letter-spacing:1px;">BOLT</div><div style="font-size:1.3rem; font-weight:900; color:#22c55e;">'+Number(bSum).toFixed(2)+'</div></div>');
                html.push('<div class="crystal-card crystal-freenow"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; margin-bottom:2px; letter-spacing:1px;">FREENOW / INNE</div><div style="font-size:1.3rem; font-weight:900; color:#d946ef;">'+Number(fSum+iSum).toFixed(2)+'</div></div>');
                html.push('<div class="crystal-card crystal-cash"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; margin-bottom:2px; letter-spacing:1px;">GOTÓWKA</div><div style="font-size:1.3rem; font-weight:900; color:#10b981;">'+Number(sumCash).toFixed(2)+'</div></div>');
                html.push('</div>');
            } else {
                html.push('<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:12px;">');
                html.push('<div class="crystal-card crystal-cash"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:2px;">GOTÓWKA</div><div style="font-size:1.3rem; font-weight:900; color:#10b981;">'+Number(sumCash).toFixed(2)+'</div></div>');
                html.push('<div class="crystal-card crystal-uber"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:2px;">KARTA</div><div style="font-size:1.3rem; font-weight:900; color:#0ea5e9;">'+Number(sumCard).toFixed(2)+'</div></div>');
                html.push('<div class="crystal-card crystal-freenow"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:2px;">VOUCHER</div><div style="font-size:1.3rem; font-weight:900; color:#a855f7;">'+Number(sumVouch).toFixed(2)+'</div></div>');
                html.push('</div>');
            }

            // --- KAFELKI KRYSZTAŁOWE DLA STATYSTYK BIEŻĄCYCH ---
            html.push('<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px;">');
            html.push('<div class="crystal-card crystal-time"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; margin-bottom:2px; letter-spacing:0.5px;">CZAS PRACY</div><div id="ui-shift-time" style="font-size:1.1rem; font-weight:900; color:#0ea5e9;">0h 0m</div></div>');
            html.push('<div class="crystal-card crystal-gross"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; margin-bottom:2px; letter-spacing:0.5px;">UTARG ZMIANY</div><div style="font-size:1.1rem; font-weight:900; color:#10b981;">'+Number(g).toFixed(2)+' zł</div></div>');
            html.push('<div class="crystal-card crystal-dist"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; margin-bottom:2px; letter-spacing:0.5px;">DYSTANS (GPS)</div><div style="font-size:1.1rem; font-weight:900; color:#f59e0b;"><span id="shift-total-dist">'+Number(d.sh.shiftDist||0).toFixed(1)+'</span> km</div></div>');
            html.push('</div>');

            html.push('<div style="display:flex; gap:10px; margin-bottom:10px;">');
            html.push('<button id="ui-pause-btn" style="flex:1; border-radius:14px; padding:15px; font-weight:900; font-size:0.85rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; box-shadow:0 4px 15px rgba(0,0,0,0.3);" onclick="window.toggleShiftPause()">☕ PRZERWA</button>');
            html.push('<button style="flex:1; border-radius:14px; padding:15px; font-weight:900; font-size:0.85rem; background:linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.2)); color:#ef4444; border:1px solid rgba(239,68,68,0.4); box-shadow:0 4px 15px rgba(239,68,68,0.2);" onclick="if(window.openPremiumEndShiftModal) window.openPremiumEndShiftModal()">🔴 ZAKOŃCZ ZMIANĘ</button>');
            html.push('</div>');
            html.push('<div style="text-align:center; margin-bottom:15px;"><button style="background:transparent; color:#ef4444; border:none; font-size:0.65rem; font-weight:800; text-decoration:underline; cursor:pointer; opacity:0.8;" onclick="window.dCancelShift()">🗑️ Anuluj (Kasuj dane)</button></div>');
            
            // MODUŁ GPS (LIVE TAKSOMETR)
            if(d.liveRideStart) {
                let cTime = '00:00'; 
                let startPrice = (d.q && d.q.s) ? d.q.s : 9.0;
                let activeTariff = d.sh.liveTariff || 't1';
                let tColor = (activeTariff==='t1')?'#10b981':(activeTariff==='t2')?'#3b82f6':(activeTariff==='t3')?'#f59e0b':'#ef4444';

                html.push('<div class="crystal-card crystal-panel" style="padding:15px; margin-bottom:15px;">');
                html.push('<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><div style="display: flex; align-items: center; gap: 8px;"><div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow:0 0 10px #10b981;"></div><span style="color:#10b981; font-size: 0.75rem; font-weight: 900; letter-spacing: 1px; text-transform:uppercase; text-shadow:0 0 5px rgba(16,185,129,0.5);">W Trasie</span></div><div id="live-ride-time" style="font-size: 1.1rem; font-weight: 900; color: #0ea5e9; font-family: monospace;">'+cTime+'</div></div>');

                html.push('<div style="text-align:center; margin-bottom:10px; display:flex; flex-direction:column; align-items:center;">');
                html.push('<div id="live-ride-status" style="min-height:22px; margin-bottom:5px;"></div>');
                html.push('<div style="display:flex; align-items:baseline; justify-content:center; gap:6px;"><span id="live-ride-price" style="font-size:4rem; font-weight:900; color:#10b981; font-family:monospace; line-height:1; text-shadow:0 0 25px rgba(16,185,129,0.5);">'+startPrice.toFixed(2)+'</span><span style="font-size:1.2rem; color:rgba(255,255,255,0.3);">zł</span></div></div>');

                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">');
                html.push('<div class="neo-input-box" style="padding:10px; flex-direction:column; gap:4px;"><span style="font-size:0.55rem; color:var(--muted); font-weight:800;">DYSTANS (GPS)</span><strong id="live-ride-dist" style="font-size:1.3rem; color:#fff;">0.00</strong></div>');
                html.push('<div style="display:flex; align-items:stretch;"><button id="live-tariff-btn" class="btn-taryfa" style="color: '+tColor+'; border: 1px solid '+tColor+'; text-shadow: 0 0 10px rgba(255,255,255,0.2); font-size:0.95rem;" onclick="if(window.toggleLiveTariff) window.toggleLiveTariff()">🔄 TARYFA: ' + activeTariff.toUpperCase() + '</button></div></div>');

                html.push('<button style="width: 100%; padding: 15px; border-radius: 12px; font-weight: 900; font-size: 0.95rem; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); cursor: pointer; outline:none; box-shadow:0 0 15px rgba(239,68,68,0.2);" onclick="if(window.stopLiveRide) window.stopLiveRide()">🛑 ZAKOŃCZ KURS</button></div>');
            } else {
                html.push('<button style="width:100%; padding:18px; border-radius:16px; margin-bottom:20px; background:linear-gradient(135deg, #10b981, #059669); color:#000; font-weight:900; font-size:1rem; border:none; box-shadow:0 6px 20px rgba(16,185,129,0.4);" onclick="if(window.startLiveRide) window.startLiveRide()">🟢 ROZPOCZNIJ KURS (STOPER / GPS)</button>');
            }
            
            let autoM = d.sh.tempAutoMins !== undefined ? d.sh.tempAutoMins : '';
            let autoK = d.sh.tempAutoKm !== undefined ? d.sh.tempAutoKm : '';
            let autoP = d.sh.tempAutoPrice !== undefined ? d.sh.tempAutoPrice : '';
            let isHighlight = autoM !== '' ? 'color:#10b981;' : '';
            d.sh.tempAutoMins = undefined; d.sh.tempAutoKm = undefined; d.sh.tempAutoPrice = undefined;

            // --- NOWY, LUKSUSOWY KREATOR KURSU ---
            html.push('<div class="crystal-card crystal-panel" style="padding: 20px 15px; margin-bottom: 20px; border-top-color:rgba(14,165,233,0.5);">');
            html.push('<div style="font-size: 0.75rem; color: #0ea5e9; font-weight: 900; text-transform: uppercase; margin-bottom: 15px; text-align: center; letter-spacing:1.5px; text-shadow: 0 0 10px rgba(14,165,233,0.3);">✨ REJESTRACJA KURSU</div>');
            
            html.push('<div style="display:flex; gap:8px; margin-bottom:12px; overflow-x:auto; padding-bottom:5px;">'+ch1+'</div>');
            html.push(otherSrcHtml);
            html.push('<div style="display:flex; gap:8px; margin-bottom:20px; overflow-x:auto; padding-bottom:5px;">'+ch2+'</div>');
            
            html.push('<div class="neo-input-box" style="margin-bottom:20px;">');
            html.push('<input type="number" id="dt-v" placeholder="0.00" value="'+autoP+'" style="background:transparent; border:none; color:#fff; font-size:3.8rem; font-weight:900; text-align:center; outline:none; width:100%; font-family:monospace; text-shadow: 0 0 20px rgba(255,255,255,0.3);"><span style="font-size:1.5rem; color:var(--muted); font-weight:700; margin-left:10px;">zł</span>');
            html.push('</div>');
            
            html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">');
            html.push('<div class="neo-input-box" style="padding:12px; flex-direction:column; gap:6px;"><label style="font-size:0.6rem; color:var(--muted); font-weight:800; text-align:center; letter-spacing:1px;">CZAS (MIN)</label><input type="number" id="dt-m" placeholder="0" value="'+autoM+'" style="width:100%; background:transparent; border:none; color:#fff; text-align:center; font-size:1.5rem; font-weight:800; outline:none; '+isHighlight+'"></div>');
            html.push('<div class="neo-input-box" style="padding:12px; flex-direction:column; gap:6px;"><label style="font-size:0.6rem; color:var(--muted); font-weight:800; text-align:center; letter-spacing:1px;">DYSTANS (KM)</label><input type="number" step="0.1" id="dt-k" placeholder="0.0" value="'+autoK+'" style="width:100%; background:transparent; border:none; color:#fff; text-align:center; font-size:1.5rem; font-weight:800; outline:none; '+isHighlight+'"></div>');
            html.push('</div>');

            html.push('<div class="inp-group" style="margin-bottom:15px;"><select id="dt-cid" style="width:100%; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:15px; border-radius:14px; font-size:0.95rem; font-weight:700; outline:none; appearance:none; text-align:center; box-shadow:inset 0 2px 10px rgba(0,0,0,0.5);"><option value="">-- Powiąż z Klientem VIP --</option>'+clientOpts+'</select></div>');
            html.push('<button style="width:100%; padding:18px; border-radius:14px; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; font-size:1.1rem; border:none; box-shadow:0 8px 25px rgba(14,165,233,0.4); outline:none; cursor:pointer; letter-spacing:1px;" onclick="if(window.dAddT) window.dAddT()">ZAPISZ KURS</button></div>');
            
            // DZIENNIK
            html.push('<div style="margin: 30px 15px 10px 15px; text-align: center;"><span style="font-size:0.7rem; color:var(--muted); font-weight:900; text-transform:uppercase;">DZIENNIK ZAROBKÓW BIEŻĄCEJ ZMIANY</span></div>');
            let trsList = d.sh.tr || [];
            if(trsList.length > 0) {
                for(let i=0; i<trsList.length; i++) {
                    let x = trsList[i];
                    let icon='🚕', color='rgba(255,255,255,0.2)', bg='rgba(255,255,255,0.02)';
                    if(x.p==='Gotówka') { icon='💵'; color='#10b981'; bg='rgba(16,185,129,0.05)'; }
                    else if(x.p==='Karta') { icon='💳'; color='#0ea5e9'; bg='rgba(14,165,233,0.05)'; }
                    else if(x.p==='Voucher') { icon='🎫'; color='#a855f7'; bg='rgba(168,85,247,0.05)'; }
                    
                    html.push('<div style="padding:15px; margin-bottom:10px; background:#18181b; border-radius:16px; border-left:4px solid '+color+'; display:flex; gap:12px; align-items:center;">');
                    html.push('<div style="font-size:1.2rem; width:40px; height:40px; background:rgba(0,0,0,0.5); border-radius:10px; display:flex; align-items:center; justify-content:center;">'+icon+'</div>');
                    html.push('<div style="flex:1;"><strong style="font-size:1.1rem; color:#fff; display:block; margin-bottom:2px; font-weight:900;">'+Number(x.v||0).toFixed(2)+' zł</strong><div style="font-size:0.7rem; color:var(--muted); font-weight:700;"><span>'+(x.time||'--:--')+'</span> • <span style="color:'+color+';">'+x.p+'</span> • <span>'+x.s+'</span></div></div>');
                    html.push('<button style="background:rgba(255,255,255,0.05); color:#fff; border:none; border-radius:10px; padding:8px; margin-right:5px;" onclick="if(window.dEditT) window.dEditT('+x.id+')">✏️</button><button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; border-radius:10px; padding:8px;" onclick="if(window.dDelT) window.dDelT('+x.id+')">🗑️</button></div>');
                }
            } else {
                html.push('<div style="text-align:center; color:var(--muted); padding:20px 0; font-size:0.8rem; background:rgba(0,0,0,0.3); border-radius:166px; font-weight:700;">Brak wpisów w tej zmianie.</div>');
            }
            html.push('</div>'); // End padding container
        } else {
            // EKRAN STARTOWY
            let proBanner = '<div style="margin: 0 0 20px 0; padding: 15px; background: linear-gradient(135deg, #130a1c, #000); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 16px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="if(window.showProInfo) window.showProInfo()"><div style="font-size: 1.8rem; filter: drop-shadow(0 0 8px rgba(217,70,239,0.5));">🚕</div><div><h4 style="color:#d946ef; margin:0 0 2px 0; font-size:0.85rem; font-weight:900;">Auto-Zlecenia (PRO)</h4><div style="font-size:0.65rem; color:var(--muted);">Integracja z APKAMI i GPS w tle.</div></div></div>';
            
            html.push('<div style="padding: 30px 20px; text-align: center;"><div style="width:60px; height:60px; background:rgba(245,158,11,0.1); border-radius:20px; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:2rem;">🚕</div><h1 style="font-size:2.2rem; font-weight:900; color:#fff; margin:0 0 5px 0;">Witaj!</h1><p style="color:var(--muted); font-size:0.85rem; margin-bottom:30px; font-weight:600;">Potwierdź licznik, aby zacząć pracę.</p>');
            html.push('<div class="crystal-card crystal-panel" style="padding:25px 20px; margin-bottom:20px;"><div style="font-size:0.65rem; color:#f59e0b; font-weight:800; letter-spacing:1px; margin-bottom:10px; text-transform:uppercase;">STAN LICZNIKA (KM)</div><input type="number" id="ds-o" value="'+((d.odo||0)>0?d.odo:'')+'" placeholder="000000" style="width:100%; background:rgba(0,0,0,0.4); border-radius:12px; padding:15px; color:#f59e0b; font-size:3.5rem; font-weight:900; text-align:center; outline:none; border:1px inset rgba(255,255,255,0.05);"></div>');
            html.push('<button style="width:100%; padding:20px; border-radius:16px; font-size:1.1rem; font-weight:900; background:linear-gradient(135deg, #10b981, #059669); color:#000; border:none; margin-bottom:20px; box-shadow:0 8px 25px rgba(16,185,129,0.3);" onclick="if(window.dStartS) window.dStartS()">ROZPOCZNIJ PRACĘ</button>');
            
            if(!window.dShowOff) {
                html.push('<button style="width:100%; padding:15px; border-radius:14px; font-size:0.8rem; font-weight:800; background:rgba(255,255,255,0.05); color:var(--muted); border:none; margin-bottom:20px;" onclick="window.dShowOff=true; window.render()">📥 ZAKSIĘGUJ ZALEGŁĄ ZMIANĘ (OFFLINE)</button>');
                html.push(proBanner);
            } else {
                html.push(window.getOfflineHTML(d));
            }
            html.push('</div>');
        }
        
        appContainer.innerHTML = html.join('') + '<div style="height:150px;"></div>' + nav;

        if (d.liveRideStart && (!d.sh || !d.sh.rWS)) {
            if (!window.liveRideTimer) window.resumeLiveRide();
            setTimeout(window.updateLiveRideUI, 50);
        }
    } catch(err) { 
        console.error(err); 
        let ac = document.getElementById('app');
        if(ac) ac.innerHTML = '<div style="padding:40px 20px; text-align:center; color:white;"><h3>Błąd Panelu</h3><p style="color:#ef4444;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; width:100%;" onclick="window.location.reload()">ODŚWIEŻ</button></div>';
    }
};

window.dAddT = function() {
    let v = parseFloat(document.getElementById('dt-v').value);
    if(isNaN(v) || v <= 0) { if(window.sysAlert) window.sysAlert("Brak Kwoty", "Podaj poprawną kwotę z apki!", "error"); return; }
    let time = new Date().toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
    if(!window.db.drv.sh.tr) window.db.drv.sh.tr = [];
    
    let otherSrcEl = document.getElementById('dt-other-src');
    let finalSrc = window.dTSrc === 'Inna' ? (otherSrcEl ? otherSrcEl.value || 'Inna' : 'Inna') : window.dTSrc;
    let cIdel = document.getElementById('dt-cid');
    
    window.db.drv.sh.tr.unshift({
        id: Date.now(), v: v, 
        k: parseFloat(document.getElementById('dt-k').value) || 0, 
        m: parseFloat(document.getElementById('dt-m').value) || 0, 
        time: time, p: window.dTPay, s: finalSrc, 
        c: cIdel ? parseInt(cIdel.value) || null : null
    });
    
    document.getElementById('dt-v').value = ''; document.getElementById('dt-m').value = ''; document.getElementById('dt-k').value = '';
    window.db.drv.sh.tempAutoMins = undefined; window.db.drv.sh.tempAutoKm = undefined; window.db.drv.sh.tempAutoPrice = undefined;
    window.save(); window.render();
};
