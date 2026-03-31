// ==========================================
// PLIK: taxi_tab_term.js - Kompaktowy Terminal Premium (Smart Netto, Auto-Taksometr, Multitaryfa)
// ==========================================

window.dTC = function(type, val) {
    if(type === 's') window.dTSrc = val;
    if(type === 'p') window.dTPay = val;
    if(typeof window.render === 'function') window.render();
};

window.dStartS = function() {
    let el = document.getElementById('ds-o');
    if(!el || el.value === '') { 
        if(window.sysAlert) window.sysAlert('Błąd', 'Wpisz aktualny stan licznika (KM).', 'error'); 
        return; 
    }
    let o = parseFloat(el.value);
    if(isNaN(o) || o <= 0) { 
        if(window.sysAlert) window.sysAlert('Błąd', 'Stan licznika musi być poprawną liczbą!', 'error'); 
        return; 
    }
    if(!window.db.drv) window.db.drv = {};
    window.db.drv.odo = o;
    window.db.drv.sh = {
        on: true, 
        o: o, 
        t: Date.now(), 
        shiftStart: Date.now(), 
        sPT: 0, 
        sPS: null, 
        rWT: 0, 
        rWS: null, 
        tr: [],
        shiftDist: 0 
    };
    window.db.drv.liveRideStart = null;
    
    window.initGlobalTracker();

    if(typeof window.save === 'function') window.save(); 
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

window.initGlobalTracker = function() {
    if (!('geolocation' in navigator)) return;
    let s = window.db.drv.sh;
    if (!s || !s.on) return;
    if (s.globalWatchId) return; 

    s.shiftDist = s.shiftDist || 0;
    
    s.globalWatchId = navigator.geolocation.watchPosition(function(position) {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        
        if (!s.sPS) { 
            if (s.lastShiftPos) {
                let distTotal = window.getDistanceFromLatLonInKm(s.lastShiftPos.lat, s.lastShiftPos.lng, lat, lng);
                if (distTotal > 0.005) { 
                    s.shiftDist += distTotal;
                    let elShiftDist = document.getElementById('shift-total-dist');
                    if(elShiftDist) elShiftDist.innerHTML = s.shiftDist.toFixed(1) + ' km';
                    if(typeof window.save === 'function') window.save();
                }
            }
            s.lastShiftPos = {lat: lat, lng: lng};
        }
    }, function(err) { console.warn('Global GPS:', err); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 });
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

                if (dist > 0.002) { 
                    s.gpsDist += dist;
                    let currentRate = q[s.liveTariff || 't1'] || 3.2;
                    s.gpsMoney = (s.gpsMoney || 0) + (dist * currentRate);
                }
            }
            s.lastPos = {lat: lat, lng: lng};
            s.lastGpsTime = now;
            window.updateLiveRideUI();
        }, function(error) { console.error('Ride GPS:', error); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 });
    }
    if(!window.liveRideTimer) window.liveRideTimer = setInterval(window.updateLiveRideUI, 1000);
};

window.dGoalMode = window.dGoalMode || 'netto';
window.toggleGoalMode = function() {
    window.dGoalMode = (window.dGoalMode === 'brutto') ? 'netto' : 'brutto';
    if(typeof window.render === 'function') window.render();
};
window.dSetGoal = function() {
    let current = (window.db.drv.cfg && window.db.drv.cfg.dailyGoal) ? window.db.drv.cfg.dailyGoal : 400;
    let ng = prompt("Podaj swój DZIENNY CEL BRUTTO (zł):\n(System automatycznie przeliczy Prawdziwe Netto na podstawie Twoich kosztów i prowizji)", current);
    if(ng !== null && ng !== '') {
        let val = parseFloat(ng);
        if(!isNaN(val) && val > 0) {
            if(!window.db.drv.cfg) window.db.drv.cfg = {};
            window.db.drv.cfg.dailyGoal = val;
            if(typeof window.save === 'function') window.save();
            if(typeof window.render === 'function') window.render();
        }
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
        if ((s.currentSpeed || 0) <= 20) {
            s.autoWaitMs = (s.autoWaitMs || 0) + deltaTick;
        }
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
        if (isWaiting) {
            elStatus.innerHTML = '<span style="font-size:0.65rem; color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); padding:4px 12px; border-radius:12px; font-weight:900; letter-spacing:1px;">⏸️ POSTÓJ RĘCZNY</span>';
        } else if (isAutoWaitActive) {
            elStatus.innerHTML = '<span style="font-size:0.65rem; color:#ef4444; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); padding:4px 12px; border-radius:12px; font-weight:900; letter-spacing:1px; animation: glowPulse 2s infinite;">⏱️ NALICZANIE POSTOJU (<20km/h)</span>';
        } else {
            elStatus.innerHTML = '<span style="font-size:0.65rem; color:var(--muted); font-weight:800; letter-spacing:1px;">SUGEROWANA CENA (' + activeTariff.toUpperCase() + ')</span>';
        }
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
            if(window.sysAlert) window.sysAlert('Trasa Zakończona!', 'Czas, Dystans i Kwota z taksometru GPS zostały uzupełnione.', 'success');
        }, 100);
    }
};

window.toggleRideWait = function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        if(window.db.drv.sh.rWS) {
            window.db.drv.sh.rWT += (Date.now() - window.db.drv.sh.rWS);
            window.db.drv.sh.rWS = null;
        } else {
            window.db.drv.sh.rWS = Date.now();
        }
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
        } else {
            window.db.drv.sh.sPS = Date.now();
        }
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
    }
};

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

    let html = '<div id="m-end-shift" class="modal-overlay" style="z-index:99999; position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.8); backdrop-filter:blur(15px); animation:fadeIn 0.2s ease;">' +
        '<div class="glass-card" style="width:90%; max-width:380px; border:1px solid rgba(239,68,68,0.3); padding:25px 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">' +
            '<div style="text-align:center; margin-bottom:20px;">' +
                '<div style="font-size:3rem; margin-bottom:10px; filter:drop-shadow(0 0 10px rgba(239,68,68,0.4));">🏁</div>' +
                '<h3 style="color:#ef4444; margin:0 0 5px 0; font-size:1.4rem; font-weight:900; text-transform:uppercase;">Zakończ Zmianę</h3>' +
                '<div style="display:flex; justify-content:space-between; margin-top:15px; background:rgba(0,0,0,0.5); padding:10px; border-radius:12px; border:1px inset rgba(255,255,255,0.05);">' +
                    '<div style="text-align:center; flex:1;"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Czas</span><br><strong style="color:#0ea5e9;">'+diffHrs+'h '+diffMins+'m</strong></div>' +
                    '<div style="text-align:center; flex:1; border-left:1px solid rgba(255,255,255,0.1);"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Utarg</span><br><strong style="color:#10b981;">'+g.toFixed(2)+' zł</strong></div>' +
                    '<div style="text-align:center; flex:1; border-left:1px solid rgba(255,255,255,0.1);"><span style="font-size:0.6rem; color:var(--muted); text-transform:uppercase;">Dystans</span><br><strong style="color:#f59e0b;">'+shiftDist.toFixed(1)+' km</strong></div>' +
                '</div>' +
            '</div>' +
            
            '<div style="background:#000; border-radius:20px; padding:20px; text-align:center; border:1px inset rgba(255,255,255,0.05); margin-bottom:20px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.5);">' +
                '<label style="font-size:0.65rem; color:#ef4444; font-weight:800; display:block; margin-bottom:10px; letter-spacing:1px;">STAN LICZNIKA POJAZDU (KONIEC)</label>' +
                '<input type="number" id="de-o" value="'+predictedEndOdo+'" style="width:100%; background:transparent; border:none; color:#ef4444; font-size:3.5rem; font-weight:900; text-align:center; outline:none; padding:0; font-family:monospace; text-shadow: 0 0 15px rgba(239,68,68,0.4);">' +
                '<div style="font-size:0.65rem; color:rgba(255,255,255,0.4); margin-top:5px; font-weight:700;">Start: '+startOdo+' km | Przejechano (GPS): '+shiftDist.toFixed(1)+' km</div>' +
            '</div>' +

            '<div style="margin-bottom:20px;">' +
                '<label style="font-size:0.65rem; color:rgba(255,255,255,0.6); font-weight:800; margin-bottom:8px; display:block; text-transform:uppercase;">Płatny Dystans z Aplikacji (KM)</label>' +
                '<input type="number" step="0.1" id="dw-m-pk" placeholder="np. 85.5" class="compact-inp">' +
            '</div>' +
            
            '<button style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; font-weight:900; padding:18px; border-radius:20px; border:none; width:100%; font-size:1.1rem; box-shadow:0 8px 25px rgba(239,68,68,0.4); cursor:pointer;" onclick="window.dEndS()">ROZLICZ ZMIANĘ</button>' +
            '<button style="background:transparent; color:rgba(255,255,255,0.4); margin-top:10px; border:1px solid rgba(255,255,255,0.1); padding:15px; border-radius:20px; width:100%; font-weight:bold; cursor:pointer;" onclick="document.getElementById(\'m-end-shift\').remove()">ANULUJ</button>' +
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
};

let origDEndS = window.dEndS;
window.dEndS = function() {
    if(window.db && window.db.drv && window.db.drv.sh && window.db.drv.sh.globalWatchId) {
        navigator.geolocation.clearWatch(window.db.drv.sh.globalWatchId);
        window.db.drv.sh.globalWatchId = null;
    }
    if(origDEndS) origDEndS();
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
    if(window.sysAlert) window.sysAlert('Zaksięgowano!', 'Rozliczenie dodane do P&L.', 'success');
};


// --- RENDER GŁÓWNY (UI) KOMPAKTOWY PREMIUM ---
window.rDrvTerm = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;
        
        let html = [];
        html.push(hdr);

        // STYLE LUXURY KOMPAKT
        html.push('<style>');
        html.push('.glass-card { background: rgba(20, 20, 25, 0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); position: relative; overflow: hidden; padding: 20px; }');
        html.push('.compact-inp { background: rgba(0,0,0,0.4); border: 1px inset rgba(255,255,255,0.05); color: #fff; border-radius: 12px; padding: 12px; text-align: center; font-size: 1.1rem; font-weight: 700; outline: none; width: 100%; box-sizing: border-box; }');
        html.push('.chip { flex: 0 0 auto; border-radius: 10px; font-weight: 800; padding: 8px 14px; font-size: 0.75rem; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; margin-right: 6px; }');
        html.push('.chip.active.blue { background: rgba(14,165,233,0.15); color: #0ea5e9; border-color: rgba(14,165,233,0.4); }');
        html.push('.chip.active.green { background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.4); }');
        html.push('.chip.idle { background: transparent; color: rgba(255,255,255,0.4); }');
        html.push('@keyframes glowPulse { 0% { opacity: 0.5; box-shadow: 0 0 5px rgba(239,68,68,0.2); } 50% { opacity: 1; box-shadow: 0 0 15px rgba(239,68,68,0.6); } 100% { opacity: 0.5; box-shadow: 0 0 5px rgba(239,68,68,0.2); } }');
        html.push('.btn-taryfa { width:100%; height:100%; border-radius:10px; font-weight:900; font-size:1.1rem; background: linear-gradient(to bottom, #333, #111); box-shadow: 0 4px 0 #000, inset 0 2px 5px rgba(255,255,255,0.2); cursor:pointer; outline:none; transition:all 0.1s; }');
        html.push('.btn-taryfa:active { transform: translateY(4px); box-shadow: 0 0 0 #000, inset 0 2px 5px rgba(255,255,255,0.2); }');
        html.push('</style>');

        let panelProBanner = '<div style="margin: 0 0 20px 0; padding: 15px; background: linear-gradient(135deg, #130a1c, #000); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 16px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="if(window.sysAlert) window.sysAlert(\'Centrum Funkcji PRO\', \'W wersji PRO zapomnisz o ręcznym wpisywaniu kursów! StyreOS automatycznie połączy się z Twoimi apkami i zaciągnie wszystkie przejazdy. Dodatkowo Asystent Głosowy obsłuży gotówkę! 🚀\', \'info\')">' +
            '<div style="font-size: 1.8rem; filter: drop-shadow(0 0 8px rgba(217,70,239,0.5));">🚕</div>' +
            '<div><h4 style="color:#d946ef; margin:0 0 2px 0; font-size:0.85rem; font-weight:900;">Auto-Zlecenia (PRO)</h4><div style="font-size:0.65rem; color:var(--muted);">Integracja z APKAMI i GPS w tle.</div></div></div>';

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
                else if(x.p === 'Karta') sumCard += val;
                else if(x.p === 'Voucher') sumVouch += val;
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

        if (d.sh && d.sh.on) {
            html.push('<div style="padding:0 15px; margin-top:15px;">');
            
            // ==========================================
            // MODUŁ CELU DZIENNEGO (SMART GOAL ETA & PRAWDZIWE NETTO)
            // ==========================================
            let isNetto = window.dGoalMode === 'netto';
            let goalBrutto = (d.cfg && d.cfg.dailyGoal) ? parseFloat(d.cfg.dailyGoal) : 400;
            
            let totalKm = (d.sh.shiftDist || 0) + manualKm;
            let taxRate = (d.cfg && d.cfg.tax) ? parseFloat(d.cfg.tax) : 0;
            let fuelPx = (d.cfg && d.cfg.fuelPx) ? parseFloat(d.cfg.fuelPx) : 0;
            let ePct = (d.cfg && d.cfg.eType === 'pct') ? (parseFloat(d.cfg.ePct) || 0) : 0;
            let eFixDaily = (d.cfg && d.cfg.eType === 'fix') ? (parseFloat(d.cfg.eFix) || 0) / 7 : 0; 
            let carDaily = (d.cfg && d.cfg.carRent) ? (parseFloat(d.cfg.carRent) / 7) : 0; 
            let fixedOtherDaily = (d.cfg && d.cfg.fixedDaily) ? parseFloat(d.cfg.fixedDaily) : 0;
            let cardF = (d.cfg && d.cfg.cardF) ? parseFloat(d.cfg.cardF) : 0;
            let vouchF = (d.cfg && d.cfg.voucherF) ? parseFloat(d.cfg.voucherF) : 0;

            let fixedCosts = eFixDaily + carDaily + fixedOtherDaily;
            let varCosts = (totalKm * fuelPx) + (g * taxRate) + (g * ePct) + (sumCard * cardF) + (sumVouch * vouchF);
            
            let currentBrutto = g;
            let currentNetto = g - varCosts - fixedCosts;

            // Szacowanie Netto dla celu Brutto
            let fuelRatio = g > 0 ? ((totalKm * fuelPx) / g) : 0.05; 
            let cardRatio = g > 0 ? ((sumCard * cardF + sumVouch * vouchF) / g) : 0;
            let goalNetto = goalBrutto - (goalBrutto * taxRate) - (goalBrutto * ePct) - (goalBrutto * fuelRatio) - (goalBrutto * cardRatio) - fixedCosts;
            
            let currProg = isNetto ? currentNetto : currentBrutto;
            let activeGoal = isNetto ? goalNetto : goalBrutto;
            if(isNetto && activeGoal < 0) activeGoal = 1;

            let pct = 0;
            if (isNetto) {
                let startNetto = -fixedCosts;
                let totalJourney = activeGoal - startNetto;
                let covered = currProg - startNetto;
                pct = totalJourney > 0 ? (covered / totalJourney) * 100 : 0;
            } else {
                pct = (currProg / activeGoal) * 100;
            }
            pct = Math.min(Math.max(pct, 0), 100);

            let etaStr = '--:--';
            let speedPerHour = 0;
            if(activeHrs > 0.25) { 
                if(isNetto) {
                    speedPerHour = (g - varCosts) / activeHrs; 
                    if(speedPerHour > 0 && currProg < activeGoal) {
                        let hoursLeft = (activeGoal - currProg) / speedPerHour;
                        let mLeft = Math.round(hoursLeft * 60);
                        etaStr = Math.floor(mLeft / 60) + 'h ' + (mLeft % 60) + 'm';
                    } else if (currProg >= activeGoal) etaStr = 'Osiągnięto! 🎉';
                    else etaStr = 'Prędkość ujemna...';
                } else {
                    speedPerHour = g / activeHrs;
                    if(speedPerHour > 0 && currProg < activeGoal) {
                        let hoursLeft = (activeGoal - currProg) / speedPerHour;
                        let mLeft = Math.round(hoursLeft * 60);
                        etaStr = Math.floor(mLeft / 60) + 'h ' + (mLeft % 60) + 'm';
                    } else if (currProg >= activeGoal) etaStr = 'Osiągnięto! 🎉';
                    else etaStr = 'Kalibracja AI...';
                }
            } else {
                etaStr = 'Kalibracja AI...';
            }

            html.push('<div class="glass-card" style="padding:15px 20px; margin-bottom:15px; border-color:rgba(14,165,233,0.3);">');
            html.push('<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">');
            html.push('<div style="font-size:0.75rem; color:#0ea5e9; font-weight:900; letter-spacing:1px; text-transform:uppercase; cursor:pointer;" onclick="window.dSetGoal()">🎯 CEL DZIENNY ⚙️</div>');
            html.push('<div style="display:flex; background:rgba(0,0,0,0.5); border-radius:10px; border:1px solid rgba(255,255,255,0.05); overflow:hidden;">');
            html.push('<button style="padding:5px 10px; font-size:0.6rem; font-weight:900; border:none; cursor:pointer; ' + (!isNetto ? 'background:#0ea5e9; color:#000;' : 'background:transparent; color:var(--muted);') + '" onclick="window.toggleGoalMode()">BRUTTO</button>');
            html.push('<button style="padding:5px 10px; font-size:0.6rem; font-weight:900; border:none; cursor:pointer; ' + (isNetto ? 'background:#10b981; color:#000;' : 'background:transparent; color:var(--muted);') + '" onclick="window.toggleGoalMode()">NETTO</button>');
            html.push('</div></div>');
            html.push('<div style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:900; color:#fff; margin-bottom:8px;"><span>' + currProg.toFixed(2) + ' zł</span><span style="color:var(--muted);">' + activeGoal.toFixed(2) + ' zł</span></div>');
            html.push('<div style="height:10px; background:rgba(0,0,0,0.5); border-radius:5px; border:1px inset rgba(255,255,255,0.05); margin-bottom:12px;"><div style="height:100%; width:'+pct+'%; background:linear-gradient(90deg, #f59e0b, #10b981); border-radius:5px; box-shadow:0 0 10px rgba(16,185,129,0.5); transition:width 0.5s ease;"></div></div>');
            html.push('<div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800;"><span style="color:var(--muted);">EFEKTYWNOŚĆ: '+(speedPerHour).toFixed(2)+' zł/h</span><span style="color:#0ea5e9;">ETA DO CELU: '+etaStr+'</span></div></div>');

            // ==========================================
            // ZWARTY PASEK INFORMACYJNY
            // ==========================================
            html.push('<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:15px;">');
            html.push('<div class="glass-card" style="padding:12px 10px; text-align:center; border-color:rgba(16,185,129,0.2);"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:2px;">UTARG BRUTTO</div><div style="font-size:1.2rem; font-weight:900; color:#10b981;">'+Number(g).toFixed(2)+' zł</div></div>');
            html.push('<div class="glass-card" style="padding:12px 10px; text-align:center; border-color:rgba(14,165,233,0.2);"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:2px;">CZAS ZMIANY</div><div style="font-size:1.2rem; font-weight:900; color:#0ea5e9;">'+diffHrs+'h '+diffMins+'m</div></div>');
            html.push('<div class="glass-card" style="padding:12px 10px; text-align:center; border-color:rgba(245,158,11,0.2);"><div style="font-size:0.55rem; color:var(--muted); font-weight:800; letter-spacing:1px; margin-bottom:2px;">DYSTANS (GPS)</div><div id="shift-total-dist" style="font-size:1.2rem; font-weight:900; color:#f59e0b;">'+Number(d.sh.shiftDist||0).toFixed(1)+' km</div></div>');
            html.push('</div>');

            html.push('<div style="display:flex; gap:10px; margin-bottom:15px;">');
            html.push('<button style="flex:1; padding:14px; border-radius:14px; font-weight:800; font-size:0.8rem; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1);" onclick="window.toggleShiftPause()">'+(d.sh.sPS ? '▶ WZNÓW PRACĘ' : '☕ PRZERWA')+'</button>');
            html.push('<button style="flex:1; padding:14px; border-radius:14px; font-weight:800; font-size:0.8rem; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);" onclick="if(window.openEndShiftModal) window.openEndShiftModal()">🔴 ZAKOŃCZ ZMIANĘ</button>');
            html.push('</div>');
            
            // ==========================================
            // MODUŁ GPS (LIVE TAKSOMETR MULTITARYFOWY)
            // ==========================================
            if(d.liveRideStart) {
                let cTime = '00:00'; 
                let startPrice = (d.q && d.q.s) ? d.q.s : 9.0;
                let activeTariff = d.sh.liveTariff || 't1';
                let tColor = (activeTariff==='t1')?'#10b981':(activeTariff==='t2')?'#3b82f6':(activeTariff==='t3')?'#f59e0b':'#ef4444';

                html.push('<div class="glass-card" style="padding:20px 15px; margin-bottom:15px; border-color:rgba(16,185,129,0.4);">');
                html.push('<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;"><div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div><span style="color:#10b981; font-size: 0.8rem; font-weight: 900; letter-spacing: 1px; text-transform:uppercase;">W Trasie</span></div><div id="live-ride-time" style="font-size: 1.1rem; font-weight: 900; color: #0ea5e9; font-family: monospace;">'+cTime+'</div></div>');

                html.push('<div style="text-align:center; margin-bottom:15px; display:flex; flex-direction:column; align-items:center;">');
                html.push('<div id="live-ride-status" style="min-height:22px; margin-bottom:8px;"></div>');
                html.push('<div style="display:flex; align-items:baseline; justify-content:center; gap:6px;"><span id="live-ride-price" style="font-size:4.2rem; font-weight:900; color:#10b981; font-family:monospace; line-height:1; text-shadow:0 0 25px rgba(16,185,129,0.4);">'+startPrice.toFixed(2)+'</span><span style="font-size:1.4rem; color:rgba(255,255,255,0.3);">zł</span></div></div>');

                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">');
                html.push('<div style="background:rgba(0,0,0,0.5); padding:12px; border-radius:12px; text-align:center;"><span style="font-size:0.6rem; color:var(--muted); display:block;">DYSTANS (GPS)</span><strong id="live-ride-dist" style="font-size:1.5rem; color:#fff;">0.00</strong></div>');
                html.push('<div style="background:rgba(0,0,0,0.5); padding:12px; border-radius:12px; text-align:center; display:flex; align-items:center; justify-content:center;"><button class="btn-taryfa" style="color: '+tColor+'; border: 1px solid '+tColor+'; text-shadow: 0 0 10px rgba(255,255,255,0.2);" onclick="if(window.toggleLiveTariff) window.toggleLiveTariff()">🔄 TARYFA: ' + activeTariff.toUpperCase() + '</button></div></div>');

                html.push('<button style="width: 100%; padding: 15px; border-radius: 12px; font-weight: 900; font-size: 0.95rem; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); cursor: pointer; outline:none;" onclick="if(window.stopLiveRide) window.stopLiveRide()">🛑 ZAKOŃCZ KURS</button></div>');
            } else {
                html.push('<button style="width:100%; padding:18px; border-radius:16px; margin-bottom:15px; background:linear-gradient(135deg, #10b981, #059669); color:#000; font-weight:900; font-size:1rem; border:none; box-shadow:0 6px 20px rgba(16,185,129,0.3);" onclick="window.startLiveRide()">🛰️ ROZPOCZNIJ KURS (GPS)</button>');
            }
            
            let autoM = d.sh.tempAutoMins !== undefined ? d.sh.tempAutoMins : '';
            let autoK = d.sh.tempAutoKm !== undefined ? d.sh.tempAutoKm : '';
            let autoP = d.sh.tempAutoPrice !== undefined ? d.sh.tempAutoPrice : '';
            let isHighlight = autoM !== '' ? 'border-color:#10b981; color:#10b981;' : '';
            d.sh.tempAutoMins = undefined; d.sh.tempAutoKm = undefined; d.sh.tempAutoPrice = undefined;

            // KREATOR
            html.push('<div class="glass-card" style="padding: 20px 15px; margin-bottom: 20px;">');
            html.push('<div style="font-size: 0.7rem; color: #0ea5e9; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; text-align: center;">Dodaj Kurs</div>');
            html.push('<div style="display:flex; overflow-x:auto; padding-bottom:5px; margin-bottom:5px; white-space:nowrap;">'+ch1+'</div>');
            html.push(otherSrcHtml);
            html.push('<div style="display:flex; overflow-x:auto; padding-bottom:10px; margin-bottom:15px; white-space:nowrap;">'+ch2+'</div>');
            
            html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">');
            html.push('<div style="grid-column: span 2; background:rgba(0,0,0,0.6); border-radius:14px; padding:15px; display:flex; justify-content:center; align-items:center; border:1px inset rgba(255,255,255,0.05);"><input type="number" id="dt-v" placeholder="0.00" value="'+autoP+'" style="background:transparent; border:none; color:#0ea5e9; font-size:2.8rem; font-weight:900; text-align:center; outline:none; width:150px;"><span style="font-size:1.2rem; color:var(--muted); font-weight:700;">zł</span></div>');
            html.push('<div><label style="font-size:0.6rem; color:var(--muted); font-weight:800; display:block; margin-bottom:4px;">CZAS (MIN)</label><input type="number" id="dt-m" placeholder="0" value="'+autoM+'" class="compact-inp" style="'+isHighlight+'"></div>');
            html.push('<div><label style="font-size:0.6rem; color:var(--muted); font-weight:800; display:block; margin-bottom:4px;">DYSTANS (KM)</label><input type="number" step="0.1" id="dt-k" placeholder="0.0" value="'+autoK+'" class="compact-inp" style="'+isHighlight+'"></div>');
            html.push('</div>');

            html.push('<div class="inp-group" style="margin-bottom:15px;"><select id="dt-cid" class="compact-inp" style="appearance:none;"><option value="">-- Powiąż z Klientem VIP --</option>'+clientOpts+'</select></div>');
            html.push('<button style="width:100%; padding:16px; border-radius:14px; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; font-size:1rem; border:none; box-shadow:0 6px 20px rgba(14,165,233,0.3); outline:none;" onclick="if(window.dAddT) window.dAddT()">ZAPISZ KURS</button></div>');
            
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
            html.push('</div>');
        } else {
            // EKRAN STARTOWY
            html.push('<div style="padding: 30px 20px; text-align: center;"><div style="width:60px; height:60px; background:rgba(245,158,11,0.1); border-radius:20px; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:2rem;">🚕</div><h1 style="font-size:2rem; font-weight:900; color:#fff; margin:0 0 5px 0;">Witaj!</h1><p style="color:var(--muted); font-size:0.85rem; margin-bottom:30px; font-weight:600;">Potwierdź licznik, aby zacząć pracę.</p>');
            html.push('<div class="glass-card" style="padding:25px 20px; margin-bottom:20px; border-color: rgba(245,158,11,0.3);"><div style="font-size:0.65rem; color:#f59e0b; font-weight:800; letter-spacing:1px; margin-bottom:10px;">STAN LICZNIKA (KM)</div><input type="number" id="ds-o" value="'+((d.odo||0)>0?d.odo:'')+'" placeholder="000000" style="width:100%; background:rgba(0,0,0,0.4); border-radius:12px; padding:15px; color:#f59e0b; font-size:2.8rem; font-weight:900; text-align:center; outline:none; border:1px inset rgba(255,255,255,0.05);"></div>');
            html.push('<button style="width:100%; padding:20px; border-radius:16px; font-size:1.1rem; font-weight:900; background:linear-gradient(135deg, #10b981, #059669); color:#000; border:none; margin-bottom:20px;" onclick="if(window.dStartS) window.dStartS()">ROZPOCZNIJ PRACĘ</button>');
            
            if(!window.dShowOff) {
                html.push('<button style="width:100%; padding:15px; border-radius:14px; font-size:0.8rem; font-weight:800; background:rgba(255,255,255,0.05); color:var(--muted); border:none; margin-bottom:20px;" onclick="window.dShowOff=true; window.render()">📥 ZAKSIĘGUJ ZALEGŁĄ ZMIANĘ (OFFLINE)</button>');
                html.push(panelProBanner);
            } else {
                html.push('<div style="color:#0ea5e9; margin-top:10px; font-size:0.75rem; font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:15px;">⚡ ZALEGŁA ZMIANA / RAPORT Z KASY</div><div class="glass-card" style="padding:25px 15px; border-color: rgba(14,165,233,0.3); margin-bottom:20px;">');
                let lblStyle = 'font-size:0.6rem; color:var(--muted); font-weight:800; text-transform:uppercase; margin-bottom:6px; display:block; text-align:left;';
                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"><div><label style="'+lblStyle+'">Data Startu</label><input type="date" id="dw-d-from" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" class="compact-inp"></div><div><label style="'+lblStyle+'">Data Zakończenia</label><input type="date" id="dw-d-to" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" class="compact-inp"></div></div>');
                html.push('<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#f59e0b; font-weight:900; text-align:center; display:block; margin-bottom:10px;">STAN LICZNIKA POJAZDU</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" id="dw-odo-s" value="'+(d.odo||0)+'" placeholder="Start (KM)" class="compact-inp" style="color:#f59e0b; border-color:rgba(245,158,11,0.3);"></div><div><input type="number" id="dw-odo-e" placeholder="Koniec (KM)" class="compact-inp" style="color:#f59e0b; border-color:rgba(245,158,11,0.3);"></div></div></div>');
                
                if(d.plat === 'apps') {
                    html.push('<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#0ea5e9; font-weight:900; text-align:center; display:block; margin-bottom:10px;">ROZBICIE UTARGU (ZŁ)</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" step="0.01" id="dw-v-uber" placeholder="Uber" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-bolt" placeholder="Bolt" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-freenow" placeholder="FreeNow" class="compact-inp"></div><div><input type="number" step="0.01" id="dw-v-inna" placeholder="Inna Apka" class="compact-inp"></div><div style="grid-column: span 2;"><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka (Suma)" class="compact-inp" style="color:#10b981; border-color:rgba(16,185,129,0.3); font-size:1.2rem; padding:15px;"></div></div></div>');
                } else {
                    html.push('<div style="background:rgba(0,0,0,0.3); border-radius:16px; padding:15px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05);"><label style="font-size:0.7rem; color:#0ea5e9; font-weight:900; text-align:center; display:block; margin-bottom:10px;">ROZBICIE UTARGU (ZŁ)</label><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka" class="compact-inp" style="color:#10b981; border-color:rgba(16,185,129,0.3);"></div><div><input type="number" step="0.01" id="dw-v-karta" placeholder="Karta/Terminal" class="compact-inp" style="color:#0ea5e9; border-color:rgba(14,165,233,0.3);"></div><div style="grid-column: span 2;"><input type="number" step="0.01" id="dw-v-voucher" placeholder="Vouchery" class="compact-inp" style="color:#a855f7; border-color:rgba(168,85,247,0.3);"></div></div></div>');
                }
                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;"><div><label style="'+lblStyle+'">Dyst. Płatny (KM)</label><input type="number" id="dw-pk" placeholder="0.0" class="compact-inp"></div><div><label style="'+lblStyle+'">Czas Pracy (H)</label><input type="number" id="dw-h" placeholder="0" class="compact-inp"></div></div><button style="width:100%; padding:18px; border-radius:16px; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; font-size:1rem; border:none; box-shadow:0 6px 20px rgba(14,165,233,0.3);" onclick="if(window.dAddOfflineWeekly) window.dAddOfflineWeekly()">ZAKSIĘGUJ ZMIANĘ</button><button style="width:100%; padding:16px; border-radius:16px; background:transparent; color:var(--muted); border:1px solid rgba(255,255,255,0.1); margin-top:10px; font-weight:800; font-size:0.85rem;" onclick="window.dShowOff=false; window.render()">ANULUJ</button></div>');
            }
            html.push('</div>');
        }
        
        appContainer.innerHTML = html.join('') + '<div style="height:150px;"></div>' + nav;

        if (d.liveRideStart && (!d.sh || !d.sh.rWS)) {
            if (!window.liveRideTimer) window.resumeLiveRide();
            setTimeout(window.updateLiveRideUI, 50);
        }
    } catch(err) { console.error(err); }
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
