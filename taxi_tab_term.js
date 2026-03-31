// ==========================================
// PLIK: taxi_tab_term.js - Terminal Premium V7 (Perfekcyjne Netto, Auto-Wrap UI, Zero Lag)
// ==========================================

// --- 1. FUNKCJE POMOCNICZE I MATEMATYKA ---
window.dTC = function(type, val) {
    if(type === 's') window.dTSrc = val;
    if(type === 'p') window.dTPay = val;
    if(typeof window.render === 'function') window.render();
};

window.getValSafe = function(id) {
    let el = document.getElementById(id);
    if(el && el.value !== '') return parseFloat(el.value.replace(',','.')) || 0;
    return 0;
};

window.getFixedDailyCosts = function() {
    let c = window.db.drv.cfg || {};
    // Jeśli użytkownik podał "Koszty Stałe" z ręki na głównym ekranie:
    if (c.dailyFixedCosts !== undefined && !isNaN(parseFloat(c.dailyFixedCosts))) {
        return parseFloat(c.dailyFixedCosts);
    }
    // Jeśli nie, próbujemy złożyć z ustawień bazowych:
    let rent = parseFloat(c.carRent || c.rent || c.costRent) || 0; 
    let zus = parseFloat(c.zus || c.costZus) || 0;
    let fixedOther = parseFloat(c.fixedDaily || c.otherFix) || 0;
    return (rent / 7) + (zus / 30) + fixedOther;
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
    
    if(!window.db.drv) window.db.drv = {};
    window.db.drv.odo = o;
    window.db.drv.sh = {
        on: true, o: o, t: Date.now(), shiftStart: Date.now(), 
        sPT: 0, sPS: null, rWT: 0, rWS: null, tr: [],
        shiftDist: 0, lastGlobalSave: Date.now()
    };
    window.db.drv.liveRideStart = null;
    
    window.initGlobalTracker();
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
};

window.dCancelShift = function() {
    if(confirm('Czy na pewno chcesz anulować bieżącą zmianę? Zebrane dziś dane przepadną.')) {
        let s = window.db.drv.sh;
        if(s && s.watchId) navigator.geolocation.clearWatch(s.watchId);
        if(s && s.globalWatchId) navigator.geolocation.clearWatch(s.globalWatchId);
        if(window.liveRideTimer) clearInterval(window.liveRideTimer);
        
        window.db.drv.sh = {on: false};
        window.db.drv.liveRideStart = null;
        if(typeof window.save === 'function') window.save(); 
        if(typeof window.render === 'function') window.render();
    }
};

window.initGlobalTracker = function() {
    if (!('geolocation' in navigator)) return;
    let s = window.db.drv.sh;
    if (!s || !s.on) return;
    if (s.globalWatchId) return; 

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
        }, function(error) { 
            console.warn('Ride GPS Error:', error); 
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
    }
    if(!window.liveRideTimer) window.liveRideTimer = setInterval(window.updateLiveRideUI, 1000);
};

// --- 3. CEL DZIENNY I KOSZTY STAŁE (SMART NETTO) ---
window.dGoalMode = window.dGoalMode || 'netto';
window.toggleGoalMode = function(mode) {
    window.dGoalMode = mode;
    if(typeof window.render === 'function') window.render();
};

window.dSetGoal = function() {
    let isNetto = window.dGoalMode === 'netto';
    let current = isNetto ? ((window.db.drv.cfg && window.db.drv.cfg.goalNetto) || 300) : ((window.db.drv.cfg && window.db.drv.cfg.goalBrutto) || 400);
    let ng = prompt("Podaj swój DZIENNY CEL " + (isNetto ? "NETTO" : "BRUTTO") + " (PLN):", current);
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

window.dSetFixedCosts = function() {
    let current = window.getFixedDailyCosts().toFixed(2);
    let ng = prompt("Wpisz swoje DZIENNE KOSZTY STAŁE (PLN):\nPodaj sumę kosztów wynajmu auta, ZUS-u, aplikacji rozbitych na 1 dzień. Pasek Netto zacznie rosnąć od tego minusa.", current);
    if(ng !== null && ng !== '') {
        let val = parseFloat(ng.replace(',','.'));
        if(!isNaN(val) && val >= 0) {
            if(!window.db.drv.cfg) window.db.drv.cfg = {};
            window.db.drv.cfg.dailyFixedCosts = val;
            if(typeof window.save === 'function') window.save();
            if(typeof window.render === 'function') window.render();
        }
    }
};

window.showProInfo = function() {
    let html = '<div id="m-pro-info" class="modal-overlay" style="z-index:99999; position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.85); backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div class="glass-card" style="width:85%; max-width:340px; border:1px solid rgba(14,165,233,0.4); padding:30px 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.9); text-align:center;">' +
            '<div style="font-size:3.5rem; margin-bottom:15px; filter:drop-shadow(0 0 15px rgba(14,165,233,0.5));">💎</div>' +
            '<h3 style="color:#0ea5e9; font-size:1.4rem; font-weight:900; text-transform:uppercase; margin:0 0 10px 0; letter-spacing:1px;">Wersja PRO</h3>' +
            '<p style="color:var(--muted); font-size:0.85rem; line-height:1.5; margin-bottom:25px;">Zautomatyzuj swoją pracę. StyreOS PRO synchronizuje się w tle z aplikacjami Uber, Bolt i FreeNow, automatycznie księgując każdy Twój przejazd. Zyskaj asystenta głosowego i zaawansowane raporty kosztów.</p>' +
            '<button style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:16px; border-radius:14px; border:none; width:100%; font-size:1rem; box-shadow:0 6px 20px rgba(14,165,233,0.3); cursor:pointer;" onclick="document.getElementById(\'m-pro-info\').remove()">ZROZUMIANO</button>' +
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

// --- 4. SILNIK TAKSOMETRU GPS ---
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
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
    }
};

window.updateLiveRideUI = function() {
    if (!window.db || !window.db.drv || !window.db.drv.liveRideStart) return;
    let d = window.db.drv;
    let s = d.sh;
    let elTime = document.getElementById('live-ride-time');
    let elDist = document.getElementById('live-ride-dist');
    let elPrice = document.getElementById('live-ride-price'); 
    let elStatus = document.getElementById('live-ride-status'); 

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
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
    }
};

window.toggleShiftPause = function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        if(window.db.drv.sh.sPS) {
            window.db.drv.sh.sPT += (Date.now() - window.db.drv.sh.sPS);
            window.db.drv.sh.sPS = null;
        } else { window.db.drv.sh.sPS = Date.now(); }
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
    }
};

// --- 5. MODAL ZAMYKANIA ZMIANY I FORMULARZE OFFLINE ---
window.openEndShiftModal = function() {
    let s = window.db.drv.sh || {};
    let startOdo = s.o ? parseFloat(s.o) : 0;
    let shiftDist = s.shiftDist || 0;
    let predictedEndOdo = Math.round(startOdo + shiftDist);

    let diffHrs = 0, diffMins = 0;
    if(s.shiftStart) {
        let ms = Date.now() - s.shiftStart;
        if(s.sPT) ms -= s.sPT;
        diffHrs = Math.floor(ms/3600000);
        diffMins = Math.floor((ms%3600000)/60000);
    }
    
    let g = 0;
    if(s.tr) s.tr.forEach(function(x) { g += (parseFloat(x.v)||0); });
    let isApps = (window.db.drv.plat === 'apps');

    let html = '<div id="m-end-shift" class="modal-overlay" style="z-index:99999; position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.85); backdrop-filter:blur(20px); overflow-y:auto; animation:fadeIn 0.2s ease;">' +
        '<div class="glass-card" style="width:90%; max-width:400px; border:1px solid rgba(239,68,68,0.4); padding:25px 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.9); margin:auto;">' +
            '<div style="text-align:center; margin-bottom:20px;">' +
                '<div style="font-size:3rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(239,68,68,0.5));">🏁</div>' +
                '<h3 style="color:#ef4444; margin:0 0 5px 0; font-size:1.4rem; font-weight:900; text-transform:uppercase;">Zakończ Zmianę</h3>' +
                '<p style="color:var(--muted); font-size:0.75rem; margin-bottom:15px;">Podsumuj swój dzień i zaktualizuj przebieg.</p>' +
                '<div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.6); padding:12px; border-radius:12px; border:1px inset rgba(255,255,255,0.05);">' +
                    '<div style="text-align:center; flex:1;"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Czas Pracy</span><br><strong style="color:#0ea5e9; font-size:1.1rem;">'+diffHrs+'h '+diffMins+'m</strong></div>' +
                    '<div style="text-align:center; flex:1; border-left:1px solid rgba(255,255,255,0.1);"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Utarg</span><br><strong style="color:#10b981; font-size:1.1rem;">'+g.toFixed(2)+' zł</strong></div>' +
                '</div>' +
            '</div>' +
            
            '<div style="background:rgba(14,165,233,0.05); border:1px solid rgba(14,165,233,0.2); border-radius:16px; padding:15px; margin-bottom:20px;">' +
                '<label style="font-size:0.65rem; color:#0ea5e9; font-weight:900; display:block; margin-bottom:10px; text-transform:uppercase; text-align:center;">Dodatkowe Zarobki</label>' +
                (isApps ? 
                    '<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;"><input type="number" step="0.01" id="me-v-uber" placeholder="Uber (zł)" class="compact-inp" style="padding:10px; font-size:0.9rem;"><input type="number" step="0.01" id="me-v-bolt" placeholder="Bolt (zł)" class="compact-inp" style="padding:10px; font-size:0.9rem;"><input type="number" step="0.01" id="me-v-freenow" placeholder="FreeNow" class="compact-inp" style="padding:10px; font-size:0.9rem;"><input type="number" step="0.01" id="me-v-inna" placeholder="Inna Apka" class="compact-inp" style="padding:10px; font-size:0.9rem;"><input type="number" step="0.01" id="me-v-cash" placeholder="Gotówka" style="grid-column:span 2; padding:12px; font-size:1rem; color:#10b981; border-color:rgba(16,185,129,0.3);" class="compact-inp"></div>' 
                : 
                    '<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;"><input type="number" step="0.01" id="me-v-cash" placeholder="Gotówka" class="compact-inp" style="color:#10b981; padding:10px; font-size:0.9rem;"><input type="number" step="0.01" id="me-v-karta" placeholder="Terminal" class="compact-inp" style="color:#0ea5e9; padding:10px; font-size:0.9rem;"><input type="number" step="0.01" id="me-v-voucher" placeholder="Vouchery" style="grid-column:span 2; padding:10px; font-size:0.9rem; color:#a855f7;" class="compact-inp"></div>'
                ) +
            '</div>' +

            '<div style="background:#000; border-radius:16px; padding:20px; text-align:center; border:1px inset rgba(255,255,255,0.05); margin-bottom:20px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.5);">' +
                '<label style="font-size:0.65rem; color:#ef4444; font-weight:800; display:block; margin-bottom:10px; letter-spacing:1px;">STAN LICZNIKA POJAZDU (KONIEC)</label>' +
                '<input type="number" id="de-o" value="'+predictedEndOdo+'" style="width:100%; background:transparent; border:none; color:#ef4444; font-size:3rem; font-weight:900; text-align:center; outline:none; padding:0; font-family:monospace; text-shadow: 0 0 15px rgba(239,68,68,0.4);">' +
                '<div style="font-size:0.65rem; color:var(--muted); margin-top:5px; font-weight:700;">Start: '+startOdo+' km | Przejechano (GPS): '+shiftDist.toFixed(1)+' km</div>' +
            '</div>' +
            
            '<button style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; font-weight:900; padding:18px; border-radius:16px; border:none; width:100%; font-size:1.1rem; box-shadow:0 8px 25px rgba(239,68,68,0.4); cursor:pointer;" onclick="window.submitPremiumEndShift()">ROZLICZ ZMIANĘ</button>' +
            '<button style="background:transparent; color:rgba(255,255,255,0.4); margin-top:10px; border:1px solid rgba(255,255,255,0.1); padding:15px; border-radius:16px; width:100%; font-weight:bold; cursor:pointer;" onclick="document.getElementById(\'m-end-shift\').remove()">ANULUJ</button>' +
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

window.submitPremiumEndShift = function() {
    let d = window.db.drv;
    let s = d.sh;
    let time = new Date().toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
    
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

    let fixedCosts = window.getFixedDailyCosts();
    let n = g - fc - tax - pFee - cF - vF - fixedCosts;
    
    let hW = 0;
    if(s.shiftStart) {
        let ms = Date.now() - s.shiftStart;
        if(s.sPT) ms -= s.sPT;
        hW = parseFloat((ms/3600000).toFixed(2));
    }

    let dtStr = (window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0]);

    if(!d.h) d.h = [];
    d.h.push({
        id: Date.now(), dt: dtStr, rD: new Date().toISOString(),
        g: g, n: n, k: distTotal, pk: 0, emptyK: distTotal,
        hW: hW, fc: fc, tx: tax, pF: pFee, cF: cF, vF: vF, tr: s.tr
    });
    d.h.sort(function(a,b) { return new Date(b.rD) - new Date(a.rD); });

    d.sh = {on: false};
    let mEl = document.getElementById('m-end-shift');
    if(mEl) mEl.remove();
    
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert('Zmiana Zakończona', 'Zapisano w historii i P&L.', 'success');
};


// --- RENDER GŁÓWNY (UI) ---
window.getOfflineHTML = function(d) {
    let lblStyle = 'font-size:0.6rem; color:var(--muted); font-weight:800; text-transform:uppercase; margin-bottom:6px; display:block; text-align:left;';
    let html = '<div style="color:#0ea5e9; margin-top:10px; font-size:0.75rem; font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:15px;">⚡ ZALEGŁA ZMIANA (OFFLINE)</div><div class="glass-card" style="padding:25px 15px; border-color: rgba(14,165,233,0.3); margin-bottom:20px;">';
    html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"><div><label style="'+lblStyle+'">Data Startu</label><input type="date" id="dw-d-from" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" class="compact-inp"></div><div><label style="'+lblStyle+'">Data Koniec</label><input type="date" id="dw-d-to" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" class="compact-inp"></div></div>';
    html += '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#f59e0b; font-weight:900; text-align:center; display:block; margin-bottom:10px;">STAN LICZNIKA POJAZDU</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" id="dw-odo-s" value="'+(d.odo||0)+'" placeholder="Start (KM)" class="compact-inp" style="color:#f59e0b; border-color:rgba(245,158,11,0.3);"></div><div><input type="number" id="dw-odo-e" placeholder="Koniec (KM)" class="compact-inp" style="color:#f59e0b; border-color:rgba(245,158,11,0.3);"></div></div></div>';
    
    if(d.plat === 'apps') {
        html += '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#0ea5e9; font-weight:900; text-align:center; display:block; margin-bottom:10px;">ROZBICIE UTARGU (ZŁ)</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" step="0.01" id="dw-v-uber" placeholder="Uber" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-bolt" placeholder="Bolt" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-freenow" placeholder="FreeNow" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-inna" placeholder="Inna Apka" class="compact-inp"></div><div style="grid-column: span 2;"><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka" class="compact-inp" style="color:#10b981; border-color:rgba(16,185,129,0.3); font-size:1.2rem; padding:15px;"></div></div></div>';
    } else {
        html += '<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#0ea5e9; font-weight:900; text-align:center; display:block; margin-bottom:10px;">ROZBICIE UTARGU (ZŁ)</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka" class="compact-inp" style="color:#10b981; border-color:rgba(16,185,129,0.3);"></div><div><input type="number" step="0.01" id="dw-v-karta" placeholder="Karta/Terminal" class="compact-inp" style="color:#0ea5e9; border-color:rgba(14,165,233,0.3);"></div><div style="grid-column: span 2;"><input type="number" step="0.01" id="dw-v-voucher" placeholder="Vouchery" class="compact-inp" style="color:#a855f7; border-color:rgba(168,85,247,0.3);"></div></div></div>';
    }
    
    html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;"><div><label style="'+lblStyle+'">Dystans Płatny (KM)</label><input type="number" id="dw-pk" placeholder="0.0" class="compact-inp"></div><div><label style="'+lblStyle+'">Czas Pracy (H)</label><input type="number" id="dw-h" placeholder="0" class="compact-inp"></div></div><button style="width:100%; padding:18px; border-radius:16px; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; font-size:1rem; border:none; box-shadow:0 6px 20px rgba(14,165,233,0.3);" onclick="window.dAddOfflineWeekly()">ZAKSIĘGUJ ZMIANĘ</button><button style="width:100%; padding:16px; border-radius:16px; background:transparent; color:var(--muted); border:1px solid rgba(255,255,255,0.1); margin-top:10px; font-weight:800; font-size:0.85rem;" onclick="window.dShowOff=false; window.render()">ANULUJ</button></div>';
    return html;
};

window.rDrvTerm = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;
        
        let html = [hdr];
        html.push('<style>.glass-card { background: rgba(20, 20, 25, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); position: relative; overflow: hidden; padding: 20px; } .compact-inp { background: rgba(0,0,0,0.4); border: 1px inset rgba(255,255,255,0.05); color: #fff; border-radius: 12px; padding: 12px; text-align: center; font-size: 1.1rem; font-weight: 700; outline: none; width: 100%; box-sizing: border-box; } .chip { padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.05); } .chip.active.blue { background: rgba(14,165,233,0.15); color: #0ea5e9; border-color: rgba(14,165,233,0.4); box-shadow: 0 0 10px rgba(14,165,233,0.2); } .chip.active.green { background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.4); box-shadow: 0 0 10px rgba(16,185,129,0.2); } .chip.idle { background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4); } @keyframes glowPulse { 0% { opacity: 0.5; box-shadow: 0 0 5px rgba(239,68,68,0.2); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(239,68,68,0.6); } 100% { opacity: 0.5; box-shadow: 0 0 5px rgba(239,68,68,0.2); } } .btn-taryfa { width:100%; height:100%; border-radius:10px; font-weight:900; font-size:1.1rem; background: linear-gradient(to bottom, #333, #111); box-shadow: 0 4px 0 #000, inset 0 2px 5px rgba(255,255,255,0.2); cursor:pointer; outline:none; transition:all 0.1s; } .btn-taryfa:active { transform: translateY(4px); box-shadow: 0 0 0 #000, inset 0 2px 5px rgba(255,255,255,0.2); }</style>');

        let panelProBanner = '<div style="margin: 0 0 20px 0; padding: 15px; background: linear-gradient(135deg, #130a1c, #000); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 16px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="if(window.showProInfo) window.showProInfo()"><div style="font-size: 1.8rem; filter: drop-shadow(0 0 8px rgba(217,70,239,0.5));">🚕</div><div><h4 style="color:#d946ef; margin:0 0 2px 0; font-size:0.85rem; font-weight:900;">Auto-Zlecenia (PRO)</h4><div style="font-size:0.65rem; color:var(--muted);">Integracja z APKAMI i GPS w tle.</div></div></div>';

        if(!window.dTSrc || (d.plat === 'corp' && window.dTSrc === 'Inna')) { window.dTSrc = d.plat === 'apps' ? 'Uber' : 'Centrala'; }
        if(!window.dTPay) { window.dTPay = d.plat === 'apps' ? 'Aplikacja' : 'Gotówka'; }
        
        let cSrc = function(name) { return window.dTSrc === name ? 'chip active blue' : 'chip idle'; };
        let cPay = function(name, cl) { return window.dTPay === name ? 'chip active '+cl : 'chip idle'; };
        
        let ch1 = '', ch2 = '', otherSrcHtml = '';
        if(d.plat === 'apps') {
            ch1 = '<div class="'+cSrc('Uber')+'" onclick="window.dTC(\'s\',\'Uber\')">Uber</div><div class="'+cSrc('Bolt')+'" onclick="window.dTC(\'s\',\'Bolt\')">Bolt</div><div class="'+cSrc('FreeNow')+'" onclick="window.dTC(\'s\',\'FreeNow\')">FreeNow</div><div class="'+cSrc('Inna')+'" onclick="window.dTC(\'s\',\'Inna\')">Inna</div>';
            otherSrcHtml = (window.dTSrc === 'Inna') ? '<div style="margin-bottom:10px;"><input type="text" id="dt-other-src" placeholder="Nazwa apki..." class="compact-inp" value="'+(window.dOtherSrc||'')+'" onchange="window.dOtherSrc=this.value"></div>' : '';
            ch2 = '<div class="'+cPay('Aplikacja','blue')+'" onclick="window.dTC(\'p\',\'Aplikacja\')">Aplikacja</div><div class="'+cPay('Gotówka','green')+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div>';
        } else {
            ch1 = '<div class="'+cSrc('Centrala')+'" onclick="window.dTC(\'s\',\'Centrala\')">Centrala</div><div class="'+cSrc('Postój')+'" onclick="window.dTC(\'s\',\'Postój\')">Postój</div><div class="'+cSrc('Prywatny')+'" onclick="window.dTC(\'s\',\'Prywatny\')">Prywatny</div>';
            ch2 = '<div class="'+cPay('Gotówka','green')+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div><div class="'+cPay('Karta','blue')+'" onclick="window.dTC(\'p\',\'Karta\')">Karta</div><div class="'+cPay('Voucher','blue')+'" style="'+(window.dTPay==='Voucher'?'color:#a855f7; border-color:rgba(168,85,247,0.4); background:rgba(168,85,247,0.15);':'')+'" onclick="window.dTC(\'p\',\'Voucher\')">Voucher</div>';
        }

        let clientOpts = '';
        if(d.clients) d.clients.forEach(c => clientOpts += '<option value="'+c.id+'">'+c.n+'</option>');
        
        let g=0, sumCash=0, sumCard=0, sumVouch=0, manualKm=0;
        if(d.sh && d.sh.on && d.sh.tr) {
            d.sh.tr.forEach(x => {
                let val = parseFloat(x.v)||0; g += val; manualKm += parseFloat(x.k)||0;
                if(x.p === 'Gotówka') sumCash += val;
                if(x.p === 'Karta') sumCard += val;
                if(x.p === 'Voucher') sumVouch += val;
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

        // AUTO-INICJALIZACJA GLOBAL TRACKERA
        if(d.sh && d.sh.on && !d.sh.globalWatchId) {
            window.initGlobalTracker();
        }

        if (d.sh && d.sh.on) {
            html.push('<div style="padding:0 15px; margin-top:15px;">');
            
            // --- SMART GOAL UI (ZGODNIE ZE SCREENEM) ---
            window.dGoalMode = window.dGoalMode || 'netto';
            let isNetto = window.dGoalMode === 'netto';
            
            let totalKm = (d.sh.shiftDist || 0) + manualKm;
            let taxRate = (d.cfg && d.cfg.tax) ? parseFloat(d.cfg.tax) : 0;
            let fuelPx = (d.cfg && d.cfg.fuelPx) ? parseFloat(d.cfg.fuelPx) : 0;
            let ePct = (d.cfg && d.cfg.eType === 'pct') ? (parseFloat(d.cfg.ePct) || 0) : 0;
            let cardF = (d.cfg && d.cfg.cardF) ? parseFloat(d.cfg.cardF) : 0;
            let vouchF = (d.cfg && d.cfg.voucherF) ? parseFloat(d.cfg.voucherF) : 0;

            let fixedCosts = window.getFixedDailyCosts(); 
            let varCosts = (totalKm * fuelPx) + (g * taxRate) + (g * ePct) + (sumCard * cardF) + (sumVouch * vouchF);

            let currentBrutto = g;
            let currentNetto = g - varCosts - fixedCosts;
            let currProg = isNetto ? currentNetto : currentBrutto;

            let goalBrutto = (d.cfg && d.cfg.goalBrutto) ? parseFloat(d.cfg.goalBrutto) : ((d.cfg && d.cfg.dailyGoal) ? parseFloat(d.cfg.dailyGoal) : 400);
            let goalNetto = (d.cfg && d.cfg.goalNetto) ? parseFloat(d.cfg.goalNetto) : 300;
            let activeGoal = isNetto ? goalNetto : goalBrutto;
            
            let startValue = isNetto ? -fixedCosts : 0;
            let totalJourney = activeGoal - startValue;
            let covered = currProg - startValue;
            let pct = (totalJourney > 0) ? (covered / totalJourney) * 100 : 0;
            pct = Math.min(Math.max(pct, 0), 100);

            let etaStr = '--:--';
            let speedPerHour = activeHrs > 0 ? ((currProg - startValue) / activeHrs) : 0; 
            
            if (activeHrs > 0.1) { 
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

            // GŁÓWNY MODUŁ WIDOKU (Stary styl z wielką liczbą i toggle z Twojego screena)
            html.push('<div class="glass-card" style="padding:25px 20px; margin-bottom:15px; border-color:rgba(14,165,233,0.3); text-align:center;">');
            html.push('<div style="font-size:0.75rem; color:var(--muted); font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:5px;">'+(isNetto?'NETTO (OPERACYJNE)':'UTARG BRUTTO')+'</div>');
            html.push('<div style="font-size:3.8rem; font-weight:900; color:'+(isNetto?'#10b981':'#0ea5e9')+'; line-height:1; margin-bottom:15px;">'+currProg.toFixed(2)+' <span style="font-size:1.2rem; color:rgba(255,255,255,0.4);">zł</span></div>');
            
            html.push('<div style="display:inline-flex; background:rgba(0,0,0,0.5); border-radius:12px; border:1px solid rgba(255,255,255,0.05); overflow:hidden; margin-bottom:20px;">');
            html.push('<button style="padding:10px 15px; font-size:0.7rem; font-weight:900; border:none; cursor:pointer; ' + (isNetto ? 'background:rgba(255,255,255,0.15); color:#fff;' : 'background:transparent; color:var(--muted);') + '" onclick="window.toggleGoalMode(\'netto\')">Netto (Operacyjne)</button>');
            html.push('<button style="padding:10px 15px; font-size:0.7rem; font-weight:900; border:none; cursor:pointer; ' + (!isNetto ? 'background:rgba(255,255,255,0.15); color:#fff;' : 'background:transparent; color:var(--muted);') + '" onclick="window.toggleGoalMode(\'brutto\')">Brutto (Utarg)</button>');
            html.push('</div>');

            html.push('<div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:800; color:var(--muted); margin-bottom:6px;"><span style="cursor:pointer;" onclick="window.dSetGoal()">Cel: ' + activeGoal.toFixed(0) + ' zł ⚙️</span><span style="color:#fff;">'+Math.round(pct)+'%</span></div>');
            html.push('<div style="height:8px; background:rgba(0,0,0,0.5); border-radius:4px; margin-bottom:10px;"><div style="height:100%; width:'+pct+'%; background:'+(isNetto?'#10b981':'#0ea5e9')+'; border-radius:4px; box-shadow:0 0 10px '+(isNetto?'#10b981':'#0ea5e9')+'; transition:width 0.5s ease;"></div></div>');
            html.push('<div style="font-size:0.7rem; color:var(--muted); font-weight:700; margin-bottom:10px;">Do celu: <span style="color:#fff;">~'+etaStr+'</span> ('+(speedPerHour).toFixed(0)+' zł/h)</div>');
            html.push('<div style="font-size:0.65rem; color:#ef4444; font-weight:800; text-decoration:underline; cursor:pointer;" onclick="window.dSetFixedCosts()">Ustaw/Zmień Koszty Stałe Auto+ZUS (obecnie: '+fixedCosts.toFixed(2)+'zł/dzień)</div>');
            html.push('</div>');

            // Karty Gotówka / Karta (Zgodnie ze screenem)
            html.push('<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:15px;">');
            html.push('<div class="glass-card" style="padding:15px 10px; text-align:center;"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:5px;">GOTÓWKA</div><div style="font-size:1.1rem; font-weight:900; color:#10b981;">'+Number(sumCash).toFixed(2)+'</div></div>');
            html.push('<div class="glass-card" style="padding:15px 10px; text-align:center;"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:5px;">Aplikacja/Karta</div><div style="font-size:1.1rem; font-weight:900; color:#0ea5e9;">'+Number(g - sumCash - sumVouch).toFixed(2)+'</div></div>');
            html.push('<div class="glass-card" style="padding:15px 10px; text-align:center;"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:5px;">VOUCHER</div><div style="font-size:1.1rem; font-weight:900; color:#a855f7;">'+Number(sumVouch).toFixed(2)+'</div></div>');
            html.push('</div>');

            html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">');
            html.push('<div class="glass-card" style="padding:15px 10px; text-align:center;"><div style="font-size:0.6rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:5px;">CZAS PRACY</div><div style="font-size:1.2rem; font-weight:900; color:#0ea5e9;">'+diffHrs+'h '+diffMins+'m</div></div>');
            html.push('<div style="display:flex; flex-direction:column; gap:8px;">');
            html.push('<button style="flex:1; border-radius:12px; font-weight:800; font-size:0.8rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1);" onclick="window.toggleShiftPause()">'+(d.sh.sPS ? '▶ WZNÓW' : '☕ PRZERWA')+'</button>');
            html.push('<button style="flex:1; border-radius:12px; font-weight:800; font-size:0.8rem; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);" onclick="if(window.openEndShiftModal) window.openEndShiftModal()">🔴 ZAKOŃCZ</button>');
            html.push('</div></div>');

            html.push('<div style="text-align:center; margin-bottom:20px; font-size:0.75rem; font-weight:900; color:#f59e0b;"><span style="margin-right:10px;">🚕 Dystans całkowity zmiany: '+Number(d.sh.shiftDist||0).toFixed(1)+' km</span></div>');
            
            // MODUŁ GPS (LIVE TAKSOMETR)
            if(d.liveRideStart) {
                let cTime = '00:00'; 
                let startPrice = (d.q && d.q.s) ? d.q.s : 9.0;
                let activeTariff = d.sh.liveTariff || 't1';
                let tColor = (activeTariff==='t1')?'#10b981':(activeTariff==='t2')?'#3b82f6':(activeTariff==='t3')?'#f59e0b':'#ef4444';

                html.push('<div class="glass-card" style="padding:20px 15px; margin-bottom:20px; border-color:rgba(16,185,129,0.4);">');
                html.push('<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;"><div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div><span style="color:#10b981; font-size: 0.8rem; font-weight: 900; letter-spacing: 1px; text-transform:uppercase;">W Trasie</span></div><div id="live-ride-time" style="font-size: 1.1rem; font-weight: 900; color: #0ea5e9; font-family: monospace;">'+cTime+'</div></div>');

                html.push('<div style="text-align:center; margin-bottom:15px; display:flex; flex-direction:column; align-items:center;">');
                html.push('<div id="live-ride-status" style="min-height:22px; margin-bottom:8px;"></div>');
                html.push('<div style="display:flex; align-items:baseline; justify-content:center; gap:6px;"><span id="live-ride-price" style="font-size:4.2rem; font-weight:900; color:#10b981; font-family:monospace; line-height:1; text-shadow:0 0 25px rgba(16,185,129,0.4);">'+startPrice.toFixed(2)+'</span><span style="font-size:1.4rem; color:rgba(255,255,255,0.3);">zł</span></div></div>');

                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">');
                html.push('<div style="background:rgba(0,0,0,0.5); padding:12px; border-radius:12px; text-align:center;"><span style="font-size:0.6rem; color:var(--muted); display:block;">DYSTANS (GPS)</span><strong id="live-ride-dist" style="font-size:1.5rem; color:#fff;">0.00</strong></div>');
                html.push('<div style="background:rgba(0,0,0,0.5); padding:12px; border-radius:12px; text-align:center; display:flex; align-items:center; justify-content:center;"><button class="btn-taryfa" style="color: '+tColor+'; border: 1px solid '+tColor+'; text-shadow: 0 0 10px rgba(255,255,255,0.2);" onclick="if(window.toggleLiveTariff) window.toggleLiveTariff()">🔄 TARYFA: ' + activeTariff.toUpperCase() + '</button></div></div>');

                html.push('<button style="width: 100%; padding: 15px; border-radius: 12px; font-weight: 900; font-size: 0.95rem; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); cursor: pointer; outline:none;" onclick="if(window.stopLiveRide) window.stopLiveRide()">🛑 ZAKOŃCZ KURS</button></div>');
            } else {
                html.push('<button style="width:100%; padding:18px; border-radius:16px; margin-bottom:20px; background:linear-gradient(135deg, #10b981, #059669); color:#000; font-weight:900; font-size:1rem; border:none; box-shadow:0 6px 20px rgba(16,185,129,0.3);" onclick="if(window.startLiveRide) window.startLiveRide()">🟢 ROZPOCZNIJ KURS (STOPER / GPS)</button>');
            }
            
            let autoM = d.sh.tempAutoMins !== undefined ? d.sh.tempAutoMins : '';
            let autoK = d.sh.tempAutoKm !== undefined ? d.sh.tempAutoKm : '';
            let autoP = d.sh.tempAutoPrice !== undefined ? d.sh.tempAutoPrice : '';
            let isHighlight = autoM !== '' ? 'border-color:#10b981; color:#10b981;' : '';
            d.sh.tempAutoMins = undefined; d.sh.tempAutoKm = undefined; d.sh.tempAutoPrice = undefined;

            // KREATOR KURSU
            html.push('<div class="glass-card" style="padding: 20px 15px; margin-bottom: 20px;">');
            html.push('<div style="font-size: 0.7rem; color: var(--muted); font-weight: 900; text-transform: uppercase; margin-bottom: 12px; text-align: center; letter-spacing:1px;">REJESTRACJA KURSU</div>');
            html.push('<div style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-bottom:10px;">'+ch1+'</div>');
            html.push(otherSrcHtml);
            html.push('<div style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-bottom:15px;">'+ch2+'</div>');
            
            html.push('<div style="display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.6); border-radius:16px; padding:15px; margin-bottom:15px; border:1px inset rgba(255,255,255,0.05);"><input type="number" id="dt-v" placeholder="0.00" value="'+autoP+'" style="background:transparent; border:none; color:#fff; font-size:3.5rem; font-weight:900; text-align:center; outline:none; width:100%; max-width:200px; font-family:monospace;"><span style="font-size:1.5rem; color:rgba(255,255,255,0.4); font-weight:700; margin-left:10px;">zł</span></div>');
            
            html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">');
            html.push('<div><label style="font-size:0.6rem; color:var(--muted); font-weight:800; display:block; margin-bottom:4px; text-align:center;">CZAS (MIN)</label><input type="number" id="dt-m" placeholder="0" value="'+autoM+'" class="compact-inp" style="'+isHighlight+'"></div>');
            html.push('<div><label style="font-size:0.6rem; color:var(--muted); font-weight:800; display:block; margin-bottom:4px; text-align:center;">DYSTANS (KM)</label><input type="number" step="0.1" id="dt-k" placeholder="0.0" value="'+autoK+'" class="compact-inp" style="'+isHighlight+'"></div>');
            html.push('</div>');

            html.push('<div class="inp-group" style="margin-bottom:15px;"><select id="dt-cid" class="compact-inp" style="appearance:none;"><option value="">-- Powiąż z Klientem VIP --</option>'+clientOpts+'</select></div>');
            html.push('<button style="width:100%; padding:18px; border-radius:14px; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; font-size:1rem; border:none; box-shadow:0 6px 20px rgba(14,165,233,0.3); outline:none;" onclick="if(window.dAddT) window.dAddT()">ZAPISZ KURS</button></div>');
            
            // DZIENNIK
            html.push('<div style="margin: 30px 15px 10px 15px; text-align: center;"><span style="font-size:0.7rem; color:var(--muted); font-weight:900; text-transform:uppercase;">DZIENNIK ZAROBKÓW</span></div>');
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
                html.push('<div style="text-align:center; color:var(--muted); padding:20px 0; font-size:0.8rem; background:rgba(0,0,0,0.3); border-radius:16px; font-weight:700;">Brak wpisów w tej zmianie.</div>');
            }
            html.push('<div style="text-align:center; margin:30px 0 15px 0;"><button style="background:transparent; color:#ef4444; border:none; font-size:0.65rem; font-weight:800; text-decoration:underline; cursor:pointer; opacity:0.6;" onclick="window.dCancelShift()">🗑️ Anuluj przypadkowo rozpoczętą zmianę</button></div>');
            html.push('</div>');
        } else {
            // EKRAN STARTOWY
            html.push('<div style="padding: 30px 20px; text-align: center;"><div style="width:60px; height:60px; background:rgba(245,158,11,0.1); border-radius:20px; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:2rem;">🚕</div><h1 style="font-size:2.2rem; font-weight:900; color:#fff; margin:0 0 5px 0;">Witaj!</h1><p style="color:var(--muted); font-size:0.85rem; margin-bottom:30px; font-weight:600;">Potwierdź licznik, aby zacząć pracę.</p>');
            html.push('<div class="glass-card" style="padding:25px 20px; margin-bottom:20px; border-color: rgba(245,158,11,0.3);"><div style="font-size:0.65rem; color:#f59e0b; font-weight:800; letter-spacing:1px; margin-bottom:10px; text-transform:uppercase;">STAN LICZNIKA (KM)</div><input type="number" id="ds-o" value="'+((d.odo||0)>0?d.odo:'')+'" placeholder="000000" style="width:100%; background:rgba(0,0,0,0.4); border-radius:12px; padding:15px; color:#f59e0b; font-size:3.5rem; font-weight:900; text-align:center; outline:none; border:1px inset rgba(255,255,255,0.05);"></div>');
            html.push('<button style="width:100%; padding:20px; border-radius:16px; font-size:1.1rem; font-weight:900; background:linear-gradient(135deg, #10b981, #059669); color:#000; border:none; margin-bottom:20px; box-shadow:0 8px 25px rgba(16,185,129,0.3);" onclick="if(window.dStartS) window.dStartS()">ROZPOCZNIJ PRACĘ</button>');
            
            if(!window.dShowOff) {
                html.push('<button style="width:100%; padding:15px; border-radius:14px; font-size:0.8rem; font-weight:800; background:rgba(255,255,255,0.05); color:var(--muted); border:none; margin-bottom:20px;" onclick="window.dShowOff=true; window.render()">📥 ZAKSIĘGUJ ZALEGŁĄ ZMIANĘ (OFFLINE)</button>');
                html.push(panelProBanner);
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

window.dAddOfflineWeekly = function() {
    let dFrom = document.getElementById('dw-d-from') ? document.getElementById('dw-d-from').value : '';
    let dTo = document.getElementById('dw-d-to') ? document.getElementById('dw-d-to').value : '';
    let oS = parseFloat(document.getElementById('dw-odo-s') ? document.getElementById('dw-odo-s').value : 0) || 0;
    let oE = parseFloat(document.getElementById('dw-odo-e') ? document.getElementById('dw-odo-e').value : 0) || 0;
    let pk = parseFloat(document.getElementById('dw-pk') ? document.getElementById('dw-pk').value : 0) || 0; 
    let h = parseFloat(document.getElementById('dw-h') ? document.getElementById('dw-h').value : 0) || 0; 
    
    let d = window.db.drv; let plat = d.plat; let sumV = 0; let trList = [];
    let rDateStr = dTo || (window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0]);
    let rDateObj = new Date(rDateStr); rDateObj.setHours(12,0,0,0);
    let cf = 0, vf = 0;
    
    if (plat === 'apps') {
        let vUber = parseFloat(document.getElementById('dw-v-uber').value) || 0;
        let vBolt = parseFloat(document.getElementById('dw-v-bolt').value) || 0;
        let vFree = parseFloat(document.getElementById('dw-v-freenow').value) || 0;
        let vInna = parseFloat(document.getElementById('dw-v-inna').value) || 0;
        let vCash = parseFloat(document.getElementById('dw-v-cash').value) || 0;
        
        if (vUber > 0) trList.push({id: Date.now()+1, p: 'Aplikacja', s: 'Uber', v: vUber, k: 0, time: '--:--'});
        if (vBolt > 0) trList.push({id: Date.now()+2, p: 'Aplikacja', s: 'Bolt', v: vBolt, k: 0, time: '--:--'});
        if (vFree > 0) trList.push({id: Date.now()+3, p: 'Aplikacja', s: 'FreeNow', v: vFree, k: 0, time: '--:--'});
        if (vInna > 0) trList.push({id: Date.now()+4, p: 'Aplikacja', s: 'Inna', v: vInna, k: 0, time: '--:--'});
        if (vCash > 0) trList.push({id: Date.now()+5, p: 'Gotówka', s: 'Aplikacja', v: vCash, k: 0, time: '--:--'});
        sumV = vUber + vBolt + vFree + vInna + vCash;
    } else {
        let vCash = parseFloat(document.getElementById('dw-v-cash').value) || 0;
        let vKarta = parseFloat(document.getElementById('dw-v-karta').value) || 0;
        let vVouch = parseFloat(document.getElementById('dw-v-voucher').value) || 0;
        
        if (vCash > 0) trList.push({id: Date.now()+1, p: 'Gotówka', s: 'Postój/Centrala', v: vCash, k: 0, time: '--:--'});
        if (vKarta > 0) trList.push({id: Date.now()+2, p: 'Karta', s: 'Terminal', v: vKarta, k: 0, time: '--:--'});
        if (vVouch > 0) trList.push({id: Date.now()+3, p: 'Voucher', s: 'Korporacja', v: vVouch, k: 0, time: '--:--'});
        sumV = vCash + vKarta + vVouch;
        cf = vKarta * (d.cfg.cardF || 0); vf = vVouch * (d.cfg.voucherF || 0);
    }
    
    if (sumV <= 0 && oS === 0 && oE === 0) { if(window.sysAlert) window.sysAlert('Błąd', 'Wprowadź chociaż jedną kwotę utargu lub stan licznika!', 'error'); return; }
    let distTotal = 0; if (oE > 0 && oS > 0 && oE >= oS) { distTotal = oE - oS; window.db.drv.odo = oE; }
    let emptyK = distTotal > pk ? (distTotal - pk) : 0;
    
    let taxRate = (d.cfg && d.cfg.tax) ? parseFloat(d.cfg.tax) : 0;
    let fuelPx = (d.cfg && d.cfg.fuelPx) ? parseFloat(d.cfg.fuelPx) : 0;
    let ePct = (d.cfg && d.cfg.eType === 'pct') ? (parseFloat(d.cfg.ePct) || 0) : 0;
    
    let tax = sumV * taxRate; let pFee = sumV * ePct; let fc = distTotal * fuelPx; 
    let n = sumV - fc - tax - pFee - cf - vf;
    
    let periodStr = dFrom === dTo ? dFrom : (dFrom + ' do ' + dTo);
    if (!periodStr) periodStr = window.getLocalYMD ? window.getLocalYMD() : 'Zaległa Zmiana';
    
    if (!window.db.drv.h) window.db.drv.h = [];
    window.db.drv.h.push({ id: Date.now(), dt: periodStr, rD: rDateObj.toISOString(), g: sumV, n: n, k: distTotal, pk: pk, emptyK: emptyK, hW: h, fc: fc, tx: tax, pF: pFee, cF: cf, vF: vf, tr: trList });
    window.db.drv.h.sort(function(a,b) { return new Date(b.rD) - new Date(a.rD); });
    window.dShowOff = false;
    
    if(typeof window.save === 'function') window.save(); if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert('Zaksięgowano!', 'Rozliczenie dodane do historii.', 'success');
};
