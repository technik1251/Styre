// ==========================================
// PLIK: taxi_tab_term.js - Główny Panel (Terminal), GPS i Dodawanie Kursów
// ==========================================

// --- BEZPIECZNE FUNKCJE POMOCNICZE ---
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
    window.db.drv.sh = {on:true, o:o, t:Date.now(), shiftStart:Date.now(), sPT:0, sPS:null, rWT:0, rWS:null, tr:[]};
    window.db.drv.liveRideStart = null;
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
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

window.updateLiveRideUI = function() {
    if (!window.db || !window.db.drv || !window.db.drv.liveRideStart) return;
    let d = window.db.drv;
    let elTime = document.getElementById('live-ride-time');
    let elDist = document.getElementById('live-ride-dist');

    if (elTime) {
        let isWaiting = d.sh.rWS !== null;
        let diffMs = Date.now() - d.liveRideStart;
        if(d.sh.rWT) diffMs -= d.sh.rWT;
        if(isWaiting) diffMs -= (Date.now() - d.sh.rWS);

        let totalSecs = Math.floor(diffMs / 1000);
        let m = Math.floor(totalSecs / 60);
        let s = totalSecs % 60;
        elTime.innerHTML = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }
    if (elDist && d.sh.gpsDist !== undefined) {
        elDist.innerHTML = Number(d.sh.gpsDist).toFixed(2);
    }
};

window.startLiveRide = function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        window.db.drv.liveRideStart = Date.now();
        window.db.drv.sh.rWS = null;
        window.db.drv.sh.rWT = 0;
        window.db.drv.sh.gpsDist = 0;
        window.db.drv.sh.lastPos = null;

        if ('geolocation' in navigator) {
            window.db.drv.sh.watchId = navigator.geolocation.watchPosition(function(position) {
                if (window.db.drv.sh.rWS !== null) return; 
                
                let lat = position.coords.latitude;
                let lng = position.coords.longitude;
                
                if (window.db.drv.sh.lastPos) {
                    let dist = window.getDistanceFromLatLonInKm(window.db.drv.sh.lastPos.lat, window.db.drv.sh.lastPos.lng, lat, lng);
                    if (dist > 0.01) { 
                        window.db.drv.sh.gpsDist += dist;
                        window.updateLiveRideUI();
                    }
                }
                window.db.drv.sh.lastPos = {lat: lat, lng: lng};
            }, function(error) {
                console.error('GPS Error', error);
            }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 });
        }

        if(window.liveRideTimer) clearInterval(window.liveRideTimer);
        window.liveRideTimer = setInterval(window.updateLiveRideUI, 1000);

        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
    }
};

window.stopLiveRide = function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        if (window.db.drv.sh.watchId) {
            navigator.geolocation.clearWatch(window.db.drv.sh.watchId);
            window.db.drv.sh.watchId = null;
        }
        if(window.liveRideTimer) {
            clearInterval(window.liveRideTimer);
            window.liveRideTimer = null;
        }
        
        let diffMs = Date.now() - window.db.drv.liveRideStart;
        if (window.db.drv.sh.rWT) diffMs -= window.db.drv.sh.rWT;
        let finalMins = Math.max(0, Math.round(diffMs / 60000));
        let finalDist = window.db.drv.sh.gpsDist || 0;

        window.db.drv.sh.tempAutoMins = finalMins;
        window.db.drv.sh.tempAutoKm = finalDist.toFixed(2);

        window.db.drv.liveRideStart = null;
        window.db.drv.sh.rWS = null;
        window.db.drv.sh.lastPos = null;

        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();

        setTimeout(function() {
            if(window.sysAlert) window.sysAlert('Trasa Zakończona!', 'Czas i Dystans z GPS zostały automatycznie wpisane do formularza. Zapisz kurs.', 'success');
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

window.dAddOfflineWeekly = function() {
    let dFrom = document.getElementById('dw-d-from') ? document.getElementById('dw-d-from').value : '';
    let dTo = document.getElementById('dw-d-to') ? document.getElementById('dw-d-to').value : '';
    let oS = parseFloat(document.getElementById('dw-odo-s') ? document.getElementById('dw-odo-s').value : 0) || 0;
    let oE = parseFloat(document.getElementById('dw-odo-e') ? document.getElementById('dw-odo-e').value : 0) || 0;
    let pk = parseFloat(document.getElementById('dw-pk') ? document.getElementById('dw-pk').value : 0) || 0; 
    let h = parseFloat(document.getElementById('dw-h') ? document.getElementById('dw-h').value : 0) || 0; 
    
    let d = window.db.drv;
    let plat = d.plat;
    let sumV = 0;
    let trList = [];
    
    let rDateStr = dTo || (window.getLocalYMD ? window.getLocalYMD() : new Date().toISOString().split('T')[0]);
    let rDateObj = new Date(rDateStr);
    rDateObj.setHours(12,0,0,0);
    
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
        cf = vKarta * (d.cfg.cardF || 0);
        vf = vVouch * (d.cfg.voucherF || 0);
    }
    
    if (sumV <= 0 && oS === 0 && oE === 0) {
        if(window.sysAlert) window.sysAlert('Błąd', 'Wprowadź chociaż jedną kwotę utargu lub stan licznika!', 'error');
        return;
    }
    
    let distTotal = 0;
    if (oE > 0 && oS > 0 && oE >= oS) {
        distTotal = oE - oS;
        window.db.drv.odo = oE; 
    }
    
    let emptyK = distTotal > pk ? (distTotal - pk) : 0;
    let taxRate = (d.cfg && d.cfg.tax) ? d.cfg.tax : 0;
    let fuelPx = (d.cfg && d.cfg.fuelPx) ? d.cfg.fuelPx : 0;
    let isPct = (d.cfg && d.cfg.eType === 'pct');
    let ePct = (d.cfg && d.cfg.ePct) ? d.cfg.ePct : 0;
    
    let tax = sumV * taxRate;
    let pFee = isPct ? sumV * ePct : 0;
    let fc = distTotal * fuelPx; 
    let n = sumV - fc - tax - pFee - cf - vf;
    
    let periodStr = dFrom === dTo ? dFrom : (dFrom + ' do ' + dTo);
    if (!periodStr) periodStr = window.getLocalYMD ? window.getLocalYMD() : 'Zaległa Zmiana';
    
    if (!window.db.drv.h) window.db.drv.h = [];
    window.db.drv.h.push({
        id: Date.now(), dt: periodStr, rD: rDateObj.toISOString(),
        g: sumV, n: n, k: distTotal, pk: pk, emptyK: emptyK,
        hW: h, fc: fc, tx: tax, pF: pFee, cF: cf, vF: vf, tr: trList
    });
    
    window.db.drv.h.sort(function(a,b) { return new Date(b.rD) - new Date(a.rD); });
    window.dShowOff = false;
    
    if(typeof window.save === 'function') window.save();
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert('Zaksięgowano!', 'Rozliczenie dodane do P&L.', 'success');
};


// --- RENDER GŁÓWNY (UI - APPLE GLASSMORPHISM 2.0) ---
window.rDrvTerm = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;
        
        let html = [];
        html.push(hdr);

        // Style Premium
        html.push('<style>');
        html.push('.glass-card { background: rgba(20, 20, 25, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 32px; box-shadow: 0 30px 60px rgba(0,0,0,0.8); position: relative; overflow: hidden; }');
        html.push('.neon-btn-green { background: linear-gradient(135deg, #10b981, #059669); color: #000; font-weight: 900; box-shadow: 0 10px 30px rgba(16,185,129,0.35); border: none; transition: transform 0.2s; }');
        html.push('.neon-btn-green:active { transform: scale(0.96); }');
        html.push('.neon-btn-red { background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; font-weight: 900; box-shadow: 0 10px 30px rgba(239,68,68,0.35); border: none; transition: transform 0.2s; }');
        html.push('.neon-btn-red:active { transform: scale(0.96); }');
        html.push('@keyframes radarPulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }');
        html.push('@keyframes waitPulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }');
        html.push('</style>');

        let panelProBanner = '<div class="pro-teaser-panel" style="margin: 0 15px 25px 15px; padding: 20px; background: linear-gradient(135deg, #130a1c 0%, #000000 100%); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="if(window.sysAlert) window.sysAlert(\'Centrum Funkcji PRO\', \'W wersji PRO zapomnisz o ręcznym wpisywaniu kursów! StyreOS automatycznie połączy się z Twoimi apkami i zaciągnie wszystkie przejazdy. Dodatkowo Asystent Głosowy obsłuży gotówkę! 🚀\', \'info\')">' +
            '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #d946ef, #0ea5e9); box-shadow: 2px 0 12px rgba(217,70,239,0.6);"></div>' +
            '<div style="position: absolute; top: 12px; right: 12px; background: #d946ef; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>' +
            '<div style="display: flex; align-items: center; gap: 15px;">' +
                '<div style="font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(217,70,239,0.4));">🚕✨</div>' +
                '<div style="text-align: left;">' +
                    '<h4 style="color: #d946ef; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Premium Usługi Taxi</h4>' +
                    '<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Automatyczne Zlecenia:</b> Kursy wpadają same.<br>✅ <b>Pełen GPS w Tle:</b> Prawdziwy Tracker tras!</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        if(!window.dTSrc || (d.plat === 'corp' && window.dTSrc === 'Inna')) { window.dTSrc = d.plat === 'apps' ? 'Uber' : 'Centrala'; }
        if(!window.dTPay) { window.dTPay = d.plat === 'apps' ? 'Aplikacja' : 'Gotówka'; }
        
        let chipStyle = 'flex: 0 0 auto; border-radius: 16px; font-weight: 800; padding: 12px 22px; font-size: 0.85rem; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; cursor: pointer;';
        let chipActBlue = 'background: rgba(14,165,233,0.15); color: #0ea5e9; border-color: rgba(14,165,233,0.4); box-shadow: 0 4px 15px rgba(14,165,233,0.2);';
        let chipActGreen = 'background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.4); box-shadow: 0 4px 15px rgba(16,185,129,0.2);';
        let chipIdle = 'background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.5);';
        
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
        
        let otherSrcHtml = (d.plat === 'apps' && window.dTSrc === 'Inna') ? '<div class="inp-group" style="margin-top:10px;"><input type="text" id="dt-other-src" placeholder="Nazwa aplikacji..." style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:14px; color:#fff; padding:18px; font-size:0.95rem; width:100%; box-sizing:border-box;" value="'+(window.dOtherSrc||'')+'" onchange="window.dOtherSrc=this.value"></div>' : '';
        
        let ch2 = '';
        if(d.plat === 'apps') {
            ch2 = '<div class="chip '+(window.dTPay==='Aplikacja'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Aplikacja'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'p\',\'Aplikacja\')">Aplikacja</div>' +
                  '<div class="chip '+(window.dTPay==='Gotówka'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Gotówka'?chipActGreen:chipIdle)+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div>';
        } else {
            ch2 = '<div class="chip '+(window.dTPay==='Gotówka'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Gotówka'?chipActGreen:chipIdle)+'" onclick="window.dTC(\'p\',\'Gotówka\')">Gotówka</div>' +
                  '<div class="chip '+(window.dTPay==='Karta'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Karta'?chipActBlue:chipIdle)+'" onclick="window.dTC(\'p\',\'Karta\')">Karta</div>' +
                  '<div class="chip '+(window.dTPay==='Voucher'?'active':'')+'" style="'+chipStyle+(window.dTPay==='Voucher'?'background:rgba(168,85,247,0.15);color:#a855f7;border-color:rgba(168,85,247,0.4);box-shadow: 0 4px 15px rgba(168,85,247,0.2);':chipIdle)+'" onclick="window.dTC(\'p\',\'Voucher\')">Voucher</div>';
        }

        let clientOpts = '';
        if(d.clients && d.clients.length > 0) {
            for(let i=0; i<d.clients.length; i++) {
                clientOpts += '<option value="'+d.clients[i].id+'">'+d.clients[i].n+'</option>';
            }
        }
        
        let g=0, sumCash=0, sumCard=0, sumVouch=0, sumApp=0, sumUber=0, sumBolt=0;
        if(d.sh && d.sh.on && d.sh.tr) {
            for(let i=0; i<d.sh.tr.length; i++) {
                let x = d.sh.tr[i];
                let val = parseFloat(x.v) || 0;
                g += val; 
                
                if(x.p === 'Gotówka') sumCash += val;
                else if(x.p === 'Karta') sumCard += val;
                else if(x.p === 'Voucher') sumVouch += val;
                else {
                    sumApp += val;
                    if(x.s === 'Uber') sumUber += val;
                    else if(x.s === 'Bolt') sumBolt += val;
                }
            }
        }

        let diffHrs = 0, diffMins = 0;
        if(d.sh && d.sh.shiftStart) {
            let activeShiftMs = Date.now() - d.sh.shiftStart;
            if(d.sh.sPT) activeShiftMs -= d.sh.sPT;
            diffHrs = Math.floor(activeShiftMs/3600000);
            diffMins = Math.floor((activeShiftMs%3600000)/60000);
        }

        if (d.sh && d.sh.on) {
            // EKRAN TRWAJĄCEJ ZMIANY
            html.push('<div style="padding:0 15px;">');
            
            // WIDGET UTARGU (Glassmorphism 2.0)
            html.push('<div class="glass-card" style="padding: 35px 20px; margin-bottom: 25px; border-color: rgba(16, 185, 129, 0.3); text-align:center;">');
            html.push('<div style="position:absolute; top:-50px; right:-50px; width:150px; height:150px; background:rgba(16,185,129,0.15); filter:blur(40px); border-radius:50%; z-index:0;"></div>');
            
            html.push('<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; position:relative; z-index:1;">');
            html.push('<div style="display:flex; align-items:center; gap: 8px;">');
            html.push('<div style="width: 12px; height: 12px; border-radius: 50%; background: '+(d.sh.sPS ? '#f59e0b' : '#10b981')+'; box-shadow: 0 0 15px '+(d.sh.sPS ? 'rgba(245,158,11,0.6)' : 'rgba(16,185,129,0.6)')+';"></div>');
            html.push('<span style="font-size: 0.75rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">'+(d.sh.sPS ? 'Przerwa' : 'W Trasie')+'</span></div>');
            html.push('<div style="font-size: 0.9rem; font-weight: 800; color: #0ea5e9; background: rgba(14,165,233,0.1); padding: 8px 15px; border-radius: 12px; border: 1px solid rgba(14,165,233,0.3);">⏱️ '+diffHrs+'h '+diffMins+'m</div></div>');
            
            html.push('<div style="font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; position:relative; z-index:1;">PRZYCHÓD BRUTTO ZMIANY</div>');
            html.push('<div style="font-size: 4rem; font-weight: 900; color: #10b981; letter-spacing: -2px; line-height: 1; text-shadow: 0 0 25px rgba(16,185,129,0.4); font-family:monospace; position:relative; z-index:1;">'+Number(g||0).toFixed(2)+'<span style="font-size:1.5rem; color:rgba(16,185,129,0.5);">zł</span></div>');
            
            if(d.plat === 'apps') {
                html.push('<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 25px; position:relative; z-index:1;">');
                html.push('<div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 10px 16px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; color: #10b981; box-shadow:0 5px 15px rgba(16,185,129,0.2);">💵 '+Number(sumCash).toFixed(2)+'</div>');
                html.push('<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px 16px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; color: #fff;">Uber: '+Number(sumUber).toFixed(2)+'</div>');
                html.push('<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px 16px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; color: #fff;">Bolt: '+Number(sumBolt).toFixed(2)+'</div></div>');
            } else {
                html.push('<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 25px; position:relative; z-index:1;">');
                html.push('<div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 10px 16px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; color: #10b981;">💵 '+Number(sumCash).toFixed(2)+'</div>');
                html.push('<div style="background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); padding: 10px 16px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; color: #0ea5e9;">💳 '+Number(sumCard).toFixed(2)+'</div>');
                html.push('<div style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); padding: 10px 16px; border-radius: 14px; font-size: 0.85rem; font-weight: 800; color: #a855f7;">🎫 '+Number(sumVouch).toFixed(2)+'</div></div>');
            }

            html.push('<div style="display: flex; gap: 12px; margin-top: 30px; position:relative; z-index:1;">');
            html.push('<button style="flex: 1; background: '+(d.sh.sPS ? '#f59e0b' : 'rgba(255,255,255,0.05)')+'; color: '+(d.sh.sPS ? '#000' : '#fff')+'; border: 1px solid '+(d.sh.sPS ? '#f59e0b' : 'rgba(255,255,255,0.1)')+'; padding: 18px; border-radius: 20px; font-weight: 900; font-size: 0.95rem; cursor: pointer; transition: transform 0.2s; outline:none;" onclick="if(window.toggleShiftPause) window.toggleShiftPause()">'+(d.sh.sPS ? '▶ WZNÓW PRACĘ' : '☕ PRZERWA')+'</button>');
            html.push('<button class="neon-btn-red" style="flex: 1; padding: 18px; border-radius: 20px; font-size: 0.95rem; cursor: pointer; outline:none;" onclick="if(window.openEndShiftModal) window.openEndShiftModal()">🔴 ZAKOŃCZ</button>');
            html.push('</div></div>'); // Koniec Widgetu Utargu
            
            // --- WIDGET GPS (KURS W TOKU) ---
            if(d.liveRideStart) {
                let isWaiting = d.sh.rWS !== null;
                let diffRideMs = Date.now() - d.liveRideStart;
                if(d.sh.rWT) diffRideMs -= d.sh.rWT;
                if(isWaiting) diffRideMs -= (Date.now() - d.sh.rWS); 
                
                let rMins = Math.floor(diffRideMs/60000);
                let rSecs = Math.floor((diffRideMs%60000)/1000);
                let timeFmt = (rMins < 10 ? '0'+rMins : rMins) + ':' + (rSecs < 10 ? '0'+rSecs : rSecs);

                html.push('<div class="glass-card" style="padding: 35px 20px; text-align: center; margin-bottom: 25px; border-color:'+(isWaiting?'rgba(245,158,11,0.4)':'rgba(16,185,129,0.4)')+';">');
                html.push('<div style="position:absolute; top:-60px; left:50%; transform:translateX(-50%); width:200px; height:200px; background:'+(isWaiting?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)')+'; filter:blur(50px); border-radius:50%; z-index:0;"></div>');
                
                html.push('<div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 15px; position:relative; z-index:1;">');
                html.push('<div style="width: 20px; height: 20px; border-radius: 50%; background: '+(isWaiting?'#f59e0b':'#10b981')+'; box-shadow: 0 0 20px '+(isWaiting?'#f59e0b':'#10b981')+'; animation: '+(isWaiting?'waitPulse':'radarPulse')+' 2s infinite;"></div>');
                html.push('<h3 style="margin: 0; color: '+(isWaiting?'#f59e0b':'#10b981')+'; font-size: 1.2rem; letter-spacing: 2px; text-transform: uppercase; font-weight: 900;">'+(isWaiting?'Postój':'W Trasie')+'</h3></div>');

                html.push('<div style="font-size: 5rem; font-weight: 900; color: #fff; font-family: monospace; line-height: 1; margin-bottom: 5px; position:relative; z-index:1; text-shadow: 0 0 30px '+(isWaiting?'rgba(245,158,11,0.5)':'rgba(16,185,129,0.5)')+';"><span id="live-ride-dist">'+Number(d.sh.gpsDist||0).toFixed(2)+'</span></div>');
                html.push('<div style="font-size: 0.85rem; color: var(--muted); font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 30px; position:relative; z-index:1;">KILOMETRÓW (GPS)</div>');

                html.push('<div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; position:relative; z-index:1;">');
                html.push('<div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 12px 25px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.4);">');
                html.push('<span style="font-size: 0.65rem; color: var(--muted); text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px;">Czas trwania</span>');
                html.push('<span id="live-ride-time" style="font-size: 1.5rem; font-weight: 900; color: #0ea5e9; font-family: monospace;">'+timeFmt+'</span></div></div>');

                html.push('<div style="display: flex; gap: 15px; position:relative; z-index:1;">');
                html.push('<button style="flex: 1; padding: 20px; border-radius: 20px; font-weight: 900; font-size: 1rem; letter-spacing: 1px; background: '+(isWaiting?'#10b981':'rgba(245,158,11,0.15)')+'; color: '+(isWaiting?'#000':'#f59e0b')+'; border: '+(isWaiting?'none':'1px solid rgba(245,158,11,0.3)')+'; outline: none; box-shadow: '+(isWaiting?'0 10px 30px rgba(16,185,129,0.4)':'none')+'; cursor: pointer; transition: transform 0.2s;" onclick="if(window.toggleRideWait) window.toggleRideWait()">'+(isWaiting?'▶ WZNÓW':'⏳ POSTÓJ')+'</button>');
                html.push('<button style="flex: 1; padding: 20px; border-radius: 20px; font-weight: 900; font-size: 1rem; letter-spacing: 1px; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); outline: none; cursor: pointer; transition: transform 0.2s;" onclick="if(window.stopLiveRide) window.stopLiveRide()">🔴 ZAKOŃCZ</button>');
                html.push('</div></div>');
            } else {
                html.push('<div style="background:rgba(0,0,0,0.3); border:1px dashed rgba(255,255,255,0.1); padding:20px; border-radius:24px; margin-bottom:20px; text-align:center;">');
                html.push('<div style="font-size: 0.75rem; color: var(--muted); font-weight: 700; line-height:1.5;">⚠️ PWA usypia moduł GPS, gdy zablokujesz ekran telefonu.<br><span style="color:#d946ef; font-weight:900; font-size:0.8rem; display:block; margin-top:5px;">Pełen GPS w tle dostaniesz w wersji PRO.</span></div></div>');
                html.push('<button class="btn neon-btn-green" style="width:100%; font-size:1.1rem; padding:22px; border-radius:24px; margin-bottom:30px;" onclick="if(window.startLiveRide) window.startLiveRide()"><span style="font-size:1.4rem;">🛰️</span> ROZPOCZNIJ KURS (GPS)</button>');
            }
            
            // Auto uzupełnianie z GPS
            let autoM = window.db.drv.sh.tempAutoMins !== undefined ? window.db.drv.sh.tempAutoMins : '';
            let autoK = window.db.drv.sh.tempAutoKm !== undefined ? window.db.drv.sh.tempAutoKm : '';
            let highlightM = autoM !== '' ? 'border-color:#10b981; color:#10b981;' : 'border-color:rgba(255,255,255,0.08); color:#fff;';
            let highlightK = autoK !== '' ? 'border-color:#10b981; color:#10b981;' : 'border-color:rgba(255,255,255,0.08); color:#fff;';
            
            window.db.drv.sh.tempAutoMins = undefined;
            window.db.drv.sh.tempAutoKm = undefined;

            // --- KREATOR KURSU (Glassmorphism 2.0) ---
            html.push('<div class="glass-card" style="padding: 30px 20px; border-color: rgba(14, 165, 233, 0.3); margin-bottom: 25px;">');
            html.push('<div style="font-size: 0.8rem; color: #0ea5e9; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 25px; text-align: center;">Dodaj Kurs</div>');
            
            html.push('<div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 10px;">'+ch1+'</div>');
            html.push(otherSrcHtml);
            html.push('<div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 20px;">'+ch2+'</div>');
            
            html.push('<div style="background: #000; border: 1px inset rgba(255,255,255,0.05); border-radius: 24px; padding: 20px; margin-bottom: 20px; display: flex; justify-content: center; align-items: center; box-shadow: inset 0 4px 15px rgba(0,0,0,0.6);">');
            html.push('<input type="number" id="dt-v" placeholder="0.00" style="color: #0ea5e9; border: none; background: transparent; font-size: 3.8rem; font-weight: 900; text-align: center; width: 180px; outline: none; font-family: monospace; text-shadow: 0 0 20px rgba(14,165,233,0.4);">');
            html.push('<span style="font-size: 1.6rem; font-weight: 700; color: rgba(255,255,255,0.4); margin-top: 15px; margin-left: 8px;">zł</span></div>');
            
            html.push('<div class="inp-row" style="margin-bottom:20px; gap:15px;">');
            html.push('<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:var(--muted); font-weight:800; margin-bottom:8px; display:block; text-transform:uppercase;">Czas (min)</label><input type="number" id="dt-m" placeholder="0" value="'+autoM+'" style="background:rgba(255,255,255,0.03); border:1px solid; '+highlightM+' border-radius:18px; padding:20px; text-align:center; font-size:1.2rem; font-weight:800; outline:none; width:100%; box-sizing:border-box;"></div>');
            html.push('<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:var(--muted); font-weight:800; margin-bottom:8px; display:block; text-transform:uppercase;">Dystans (km)</label><input type="number" step="0.1" id="dt-k" placeholder="0.0" value="'+autoK+'" style="background:rgba(255,255,255,0.03); border:1px solid; '+highlightK+' border-radius:18px; padding:20px; text-align:center; font-size:1.2rem; font-weight:800; outline:none; width:100%; box-sizing:border-box;"></div></div>');
            
            html.push('<div class="inp-group" style="margin-bottom:25px;">');
            html.push('<select id="dt-cid" style="background:rgba(0,0,0,0.4); border-radius:18px; padding:20px; font-size:0.95rem; font-weight:700; color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.1); outline:none; width:100%; box-sizing:border-box; appearance:none;"><option value="">-- Powiąż z Klientem VIP --</option>'+clientOpts+'</select></div>');
            
            html.push('<button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; padding:22px; border-radius:22px; font-weight:900; font-size:1.15rem; letter-spacing:1px; border:none; box-shadow:0 10px 30px rgba(14,165,233,0.4); width:100%; outline:none; transition:transform 0.2s;" onclick="if(window.dAddT) window.dAddT()">DODAJ KURS</button></div>');
            
            html.push('<div style="margin: 40px 15px 20px 15px; text-align: center;"><span style="font-size:0.75rem; color:var(--muted); font-weight:900; letter-spacing:2px; text-transform:uppercase;">DZIENNIK ZAROBKÓW</span></div>');
                
            let trsList = d.sh.tr || [];
            if(trsList.length > 0) {
                for(let i=0; i<trsList.length; i++) {
                    let x = trsList[i];
                    let icon='🚕', color='rgba(255,255,255,0.2)', bg='rgba(255,255,255,0.02)';
                    if(x.p==='Gotówka') { icon='💵'; color='#10b981'; bg='rgba(16,185,129,0.05)'; }
                    else if(x.p==='Karta') { icon='💳'; color='#0ea5e9'; bg='rgba(14,165,233,0.05)'; }
                    else if(x.p==='Voucher') { icon='🎫'; color='#a855f7'; bg='rgba(168,85,247,0.05)'; }
                    
                    html.push('<div class="log-item" style="border:none; padding:18px; margin-bottom:12px; background:#18181b; border-radius:20px; border-left:4px solid '+color+'; display:flex; gap:15px; align-items:center; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">');
                    html.push('<div style="font-size:1.5rem; width:50px; height:50px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.05); border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">'+icon+'</div>');
                    html.push('<div style="flex:1;">');
                    html.push('<strong style="font-size:1.2rem; color:#fff; display:block; margin-bottom:5px; font-weight:900; letter-spacing:-0.5px;">'+Number(x.v||0).toFixed(2)+' zł</strong>');
                    html.push('<div style="display:flex; gap:6px; font-size:0.75rem; color:var(--muted); align-items:center; font-weight:700;">');
                    html.push('<span>'+(x.time||'--:--')+'</span><span style="opacity:0.3">•</span><span style="color:'+color+';">'+x.p+'</span><span style="opacity:0.3">•</span><span>'+x.s+'</span>');
                    if(x.k>0) html.push('<span style="opacity:0.3">•</span><span>'+Number(x.k).toFixed(1)+' km</span>');
                    html.push('</div></div>');
                    html.push('<div style="display:flex; flex-direction:column; gap:8px;">');
                    html.push('<button style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 14px; cursor:pointer; font-size:0.8rem; outline:none;" onclick="if(window.dEditT) window.dEditT('+x.id+')">✏️</button>');
                    html.push('<button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; border-radius:12px; padding:10px 14px; cursor:pointer; font-size:0.8rem; outline:none;" onclick="if(window.dDelT) window.dDelT('+x.id+')">🗑️</button>');
                    html.push('</div></div>');
                }
            } else {
                html.push('<div style="text-align:center;color:var(--muted);padding:40px 0;font-size:0.9rem; background:rgba(0,0,0,0.3); border-radius:24px; border:1px dashed rgba(255,255,255,0.05); font-weight:700; margin-bottom:20px;">Brak wpisów w tej zmianie.</div>');
            }
            html.push('</div>'); // Koniec paddingu 15px
        } else {
            // --- EKRAN STARTOWY (Zanim kliknie "Rozpocznij pracę") ---
            html.push('<div style="padding: 50px 20px 30px 20px; text-align: center;">');
            html.push('<div style="width:90px; height:90px; background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.2); border-radius:32px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:3rem; box-shadow:0 15px 35px rgba(245,158,11,0.2);">🚕</div>');
            html.push('<h1 style="font-size:2.8rem; font-weight:900; color:#fff; letter-spacing:-1.5px; margin:0;">Witaj, '+(window.db.userName || 'Szefie')+'!</h1>');
            html.push('<p style="color:var(--muted); font-size:0.95rem; margin:10px 0 40px 0; font-weight:600;">Potwierdź swój przebieg i ruszaj w miasto.</p>');
            
            html.push('<div class="glass-card" style="padding:35px 20px; margin-bottom:30px; border-color: rgba(245,158,11,0.3);">');
            html.push('<div style="font-size:0.7rem; color:#f59e0b; font-weight:900; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:15px;">STAN LICZNIKA POJAZDU</div>');
            html.push('<div style="background:#000; border-radius:20px; padding:20px; border:1px inset rgba(255,255,255,0.05); box-shadow:inset 0 4px 20px rgba(0,0,0,0.5);">');
            html.push('<input type="number" id="ds-o" value="'+((d.odo||0)>0?d.odo:'')+'" placeholder="000000" style="width:100%; background:transparent; border:none; color:#f59e0b; font-size:4.5rem; font-weight:900; text-align:center; outline:none; font-family:monospace; text-shadow:0 0 20px rgba(245,158,11,0.4);">');
            html.push('</div></div>');
            
            html.push('<button class="btn neon-btn-green" style="width:100%; padding:24px; border-radius:24px; font-size:1.2rem; letter-spacing:1px;" onclick="if(window.dStartS) window.dStartS()">ROZPOCZNIJ PRACĘ</button></div>');
            
            if(!window.dShowOff) {
                html.push('<div style="padding:0 20px; margin-bottom:30px;">');
                html.push('<button class="btn" style="background:#18181b; color:var(--muted); border:1px solid rgba(255,255,255,0.05); font-size:0.85rem; font-weight:800; box-shadow:none; width:100%; padding:18px; border-radius:20px; outline:none;" onclick="window.dShowOff=true; window.render()">📥 ZAKSIĘGUJ ZALEGŁĄ ZMIANĘ (OFFLINE)</button></div>');
                html.push('<div style="padding:0 15px;">'+panelProBanner+'</div>');
            } else {
                // ... Kod dla manualnej zmiany offline ...
                html.push('<div style="padding:0 15px; margin-top:20px;">');
                html.push('<div style="color:#0ea5e9; margin-top:10px; font-size:0.75rem; font-weight:900; letter-spacing:1px; text-transform:uppercase; text-align:center; margin-bottom:15px;">⚡ ZALEGŁA ZMIANA / RAPORT Z KASY</div>');
                html.push('<div class="glass-card" style="padding:30px 20px; border-color: rgba(14,165,233,0.3); margin-bottom:30px;">');
                
                let inpStyle = 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:16px; padding:18px; text-align:center; font-size:1rem; font-weight:700; outline:none; width:100%; box-sizing:border-box;';
                let lblStyle = 'font-size:0.65rem; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:block;';

                html.push('<div class="inp-row" style="margin-bottom:20px; gap:12px;">');
                html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Data Startu</label><input type="date" id="dw-d-from" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" style="'+inpStyle+' padding:18px 10px;"></div>');
                html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Data Zakończenia</label><input type="date" id="dw-d-to" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" style="'+inpStyle+' padding:18px 10px;"></div>');
                html.push('</div>');
                
                html.push('<div style="background:rgba(0,0,0,0.4); border:1px inset rgba(255,255,255,0.05); border-radius:24px; padding:25px; margin-bottom:20px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.5);">');
                html.push('<label style="font-size:0.75rem; color:#f59e0b; font-weight:900; text-align:center; display:block; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">STAN LICZNIKA POJAZDU</label>');
                html.push('<div class="inp-row" style="margin:0; gap:12px;">');
                html.push('<div class="inp-group" style="margin:0;"><input type="number" id="dw-odo-s" value="'+(d.odo||0)+'" placeholder="Start (KM)" style="'+inpStyle+' border-color:rgba(245,158,11,0.3); color:#f59e0b;"></div>');
                html.push('<div class="inp-group" style="margin:0;"><input type="number" id="dw-odo-e" placeholder="Koniec (KM)" style="'+inpStyle+' border-color:rgba(245,158,11,0.3); color:#f59e0b;"></div>');
                html.push('</div></div>');

                if(d.plat === 'apps') {
                    html.push('<div style="background:rgba(0,0,0,0.4); border:1px inset rgba(255,255,255,0.05); border-radius:24px; padding:25px; margin-bottom:20px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.5);">');
                    html.push('<label style="font-size:0.75rem; color:#0ea5e9; font-weight:900; text-align:center; display:block; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">ROZBICIE UTARGU (ZŁ)</label>');
                    html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">');
                    html.push('<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-uber" placeholder="Uber" style="'+inpStyle+'"></div>');
                    html.push('<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-bolt" placeholder="Bolt" style="'+inpStyle+'"></div>');
                    html.push('<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-freenow" placeholder="FreeNow" style="'+inpStyle+'"></div>');
                    html.push('<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-inna" placeholder="Inna Apka" style="'+inpStyle+'"></div>');
                    html.push('<div class="inp-group" style="margin:0; grid-column: span 2;"><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka (Suma)" style="'+inpStyle+' border-color:rgba(16,185,129,0.3); color:#10b981; font-size:1.3rem; padding:20px;"></div>');
                    html.push('</div></div>');
                } else {
                    html.push('<div style="background:rgba(0,0,0,0.4); border:1px inset rgba(255,255,255,0.05); border-radius:24px; padding:25px; margin-bottom:20px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.5);">');
                    html.push('<label style="font-size:0.75rem; color:#0ea5e9; font-weight:900; text-align:center; display:block; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">ROZBICIE UTARGU (ZŁ)</label>');
                    html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">');
                    html.push('<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka" style="'+inpStyle+' border-color:rgba(16,185,129,0.3); color:#10b981;"></div>');
                    html.push('<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-karta" placeholder="Karta/Terminal" style="'+inpStyle+' border-color:rgba(14,165,233,0.3); color:#0ea5e9;"></div>');
                    html.push('<div class="inp-group" style="margin:0; grid-column: span 2;"><input type="number" step="0.01" id="dw-v-voucher" placeholder="Vouchery" style="'+inpStyle+' border-color:rgba(168,85,247,0.3); color:#a855f7;"></div>');
                    html.push('</div></div>');
                }

                html.push('<div class="inp-row" style="margin-bottom:25px; gap:15px;">');
                html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Dystans Płatny (KM)</label><input type="number" id="dw-pk" placeholder="0.0" style="'+inpStyle+'"></div>');
                html.push('<div class="inp-group" style="margin:0;"><label style="'+lblStyle+'">Czas Pracy (H)</label><input type="number" id="dw-h" placeholder="0" style="'+inpStyle+'"></div>');
                html.push('</div>');
                
                html.push('<button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:22px; font-size:1.1rem; letter-spacing:1px; border-radius:22px; border:none; box-shadow:0 10px 30px rgba(14,165,233,0.4); width:100%; outline:none;" onclick="if(window.dAddOfflineWeekly) window.dAddOfflineWeekly()">ZAKSIĘGUJ ZMIANĘ</button>');
                html.push('<button class="btn" style="background:transparent; color:var(--muted); margin-top:15px; border:1px solid rgba(255,255,255,0.1); border-radius:22px; padding:18px; font-weight:800; font-size:0.9rem; width:100%; outline:none;" onclick="window.dShowOff=false; window.render()">ANULUJ</button>');
                html.push('</div></div>');
            }
        }
        
        appContainer.innerHTML = html.join('') + '<div style="height:150px; visibility:hidden; width:100%; clear:both;">SPACER</div>' + nav;

        if (d.liveRideStart && (!d.sh.rWS)) {
            setTimeout(window.updateLiveRideUI, 50);
        }

    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd Panelu (taxi_tab_term.js)</h3><p style="color:#ef4444;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; width:100%;" onclick="window.location.reload()">ODŚWIEŻ</button></div>';
        }
    }
};

// --- ZAPISYWANIE KURSU ---
window.dAddT = function() {
    let v = parseFloat(document.getElementById('dt-v').value);
    let m = parseFloat(document.getElementById('dt-m').value) || 0;
    let k = parseFloat(document.getElementById('dt-k').value) || 0;
    let cIdel = document.getElementById('dt-cid');
    let cId = cIdel ? parseInt(cIdel.value) || null : null;
    
    if(isNaN(v) || v <= 0) { 
        if(window.sysAlert) window.sysAlert("Brak Kwoty", "Podaj poprawną kwotę z apki!", "error"); 
        return; 
    }
    
    let otherSrcEl = document.getElementById('dt-other-src');
    let finalSrc = window.dTSrc === 'Inna' ? (otherSrcEl ? otherSrcEl.value || 'Inna' : 'Inna') : window.dTSrc;
    let time = new Date().toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
    
    if(!window.db.drv.sh.tr) window.db.drv.sh.tr = [];
    window.db.drv.sh.tr.unshift({id: Date.now(), v: v, k: k, m: m, time: time, p: window.dTPay, s: finalSrc, c: cId});
    
    // Resetuj pola (Zgodnie ze standardami UI)
    document.getElementById('dt-v').value = '';
    document.getElementById('dt-m').value = '';
    document.getElementById('dt-k').value = '';
    
    if(typeof window.save === 'function') window.save(); 
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Dodano", "Kurs został poprawnie zapisany na zmianie.", "success");
};
