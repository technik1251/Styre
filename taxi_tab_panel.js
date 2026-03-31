// ==========================================
// PLIK: taxi_tab_panel.js - Zakładki Panel (Term) i Wyniki (Stats) + MODUŁ GPS
// ==========================================

// --- SILNIK MATEMATYCZNY GPS (Krzywizna Ziemi - Wzór Haversine) ---
window.getDistanceFromLatLonInKm = function(lat1, lon1, lat2, lon2) {
    let R = 6371; // Promień Ziemi w km
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// --- NOWY SILNIK KSIĘGOWANIA ZBIORCZEGO (Z PODZIAŁEM NA APLIKACJE) ---
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
        if(window.sysAlert) window.sysAlert("Błąd", "Wprowadź chociaż jedną kwotę utargu lub stan licznika!", "error");
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
        id: Date.now(),
        dt: periodStr,
        rD: rDateObj.toISOString(),
        g: sumV,
        n: n,
        k: distTotal,
        pk: pk,
        emptyK: emptyK,
        hW: h,
        fc: fc,
        tx: tax,
        pF: pFee,
        cF: cf,
        vF: vf,
        tr: trList
    });
    
    window.db.drv.h.sort((a,b) => new Date(b.rD) - new Date(a.rD));
    window.dShowOff = false;
    
    if(typeof window.save === 'function') window.save();
    if(typeof window.render === 'function') window.render();
    if(window.sysAlert) window.sysAlert("Zaksięgowano!", "Rozliczenie dodane. Puste kilometry zostały wyliczone.", "success");
};

// --- LOGIKA STOPERA I GPS ---
window.startLiveRide = window.startLiveRide || function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        window.db.drv.liveRideStart = Date.now();
        window.db.drv.sh.rWS = null;
        window.db.drv.sh.rWT = 0;
        window.db.drv.sh.gpsDist = 0;
        window.db.drv.sh.lastPos = null;

        if ("geolocation" in navigator) {
            if(window.sysAlert) window.sysAlert("GPS Uruchomiony", "Pamiętaj: PWA nie liczy trasy przy wygaszonym ekranie. Zostaw ekran włączony! (Pełne śledzenie w tle tylko w aplikacji PRO).", "info");
            
            window.db.drv.sh.watchId = navigator.geolocation.watchPosition(function(position) {
                if (window.db.drv.sh.rWS !== null) return; // Jeśli stoper wciśnięty na pauzę (oczekiwanie), nie dodawaj dystansu
                
                let lat = position.coords.latitude;
                let lng = position.coords.longitude;
                
                if (window.db.drv.sh.lastPos) {
                    let dist = window.getDistanceFromLatLonInKm(window.db.drv.sh.lastPos.lat, window.db.drv.sh.lastPos.lng, lat, lng);
                    if (dist > 0.01) { // Dokładność pow. 10 metrów (ignoruj "pływanie" GPSu na postoju)
                        window.db.drv.sh.gpsDist += dist;
                    }
                }
                window.db.drv.sh.lastPos = {lat: lat, lng: lng};
                if(typeof window.render === 'function') window.render();
            }, function(error) {
                console.error("GPS Error", error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 5000
            });
        } else {
            if(window.sysAlert) window.sysAlert("Błąd", "Twoja przeglądarka nie obsługuje lokalizacji GPS.", "error");
        }

        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
    }
};

window.stopLiveRide = window.stopLiveRide || function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        // Wyłączenie GPS
        if (window.db.drv.sh.watchId) {
            navigator.geolocation.clearWatch(window.db.drv.sh.watchId);
            window.db.drv.sh.watchId = null;
        }
        
        let diffMs = Date.now() - window.db.drv.liveRideStart;
        if (window.db.drv.sh.rWT) diffMs -= window.db.drv.sh.rWT;
        let diffMins = Math.max(0, Math.round(diffMs / 60000));
        let finalDist = window.db.drv.sh.gpsDist || 0;

        window.db.drv.liveRideStart = null;
        window.db.drv.sh.rWS = null;
        window.db.drv.sh.lastPos = null;

        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();

        // Autouzupełnianie formularza na dole i efekt wizualny
        setTimeout(function() {
            let elM = document.getElementById('dt-m');
            let elK = document.getElementById('dt-k');
            if (elM) { 
                elM.value = diffMins; 
                elM.style.borderColor = '#10b981';
                elM.style.color = '#10b981';
            }
            if (elK) { 
                elK.value = finalDist.toFixed(2); 
                elK.style.borderColor = '#10b981';
                elK.style.color = '#10b981';
            }
            if(window.sysAlert) window.sysAlert("Trasa Zakończona!", "Czas i Dystans z GPS zostały załadowane do formularza niżej. Sprawdź i dodaj kurs.", "success");
        }, 300);
    }
};

window.toggleRideWait = window.toggleRideWait || function() {
    if(window.db && window.db.drv && window.db.drv.sh) {
        if(window.db.drv.sh.rWS) {
            window.db.drv.sh.rWT += (Date.now() - window.db.drv.sh.rWS);
            window.db.drv.sh.rWS = null;
        } else {
            window.db.drv.sh.rWS = Date.now();
        }
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
    }
};

window.toggleShiftPause = window.toggleShiftPause || function() {
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

// --- GŁÓWNY RENDER PANELU ---
window.rDrvPanel = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;
        
        let act = ''; 

        let panelProBanner = '<div class="pro-teaser-panel" style="margin: 0 15px 25px 15px; padding: 20px; background: linear-gradient(135deg, #130a1c 0%, #000000 100%); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="if(typeof window.sysAlert===\'function\') window.sysAlert(\'Centrum Funkcji PRO\', \'W wersji PRO zapomnisz o ręcznym wpisywaniu kursów! StyreOS automatycznie połączy się z Twoimi apkami i zaciągnie wszystkie przejazdy. Dodatkowo Asystent Głosowy obsłuży gotówkę! 🚀\', \'info\')">' +
            '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #d946ef, #0ea5e9); box-shadow: 2px 0 12px rgba(217,70,239,0.6);"></div>' +
            '<div style="position: absolute; top: 12px; right: 12px; background: #d946ef; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>' +
            '<div style="display: flex; align-items: center; gap: 15px;">' +
                '<div style="font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(217,70,239,0.4));">🚕✨</div>' +
                '<div style="text-align: left;">' +
                    '<h4 style="color: #d946ef; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Premium Usługi Taxi</h4>' +
                    '<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Automatyczne Zlecenia:</b> Kursy wpadają same.<br>✅ <b>Premium Rozliczenia:</b> Wszystko w jednym miejscu!</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        if(t === 'term') {
            if(!window.dTSrc || (d.plat === 'corp' && window.dTSrc === 'Inna')) { window.dTSrc = d.plat === 'apps' ? 'Uber' : 'Centrala'; }
            if(!window.dTPay) { window.dTPay = d.plat === 'apps' ? 'Aplikacja' : 'Gotówka'; }
            
            let chipStyle = 'flex: 0 0 auto; border-radius: 16px; font-weight: 800; padding: 10px 20px; font-size: 0.75rem; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; cursor: pointer;';
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
            
            let otherSrcHtml = (d.plat === 'apps' && window.dTSrc === 'Inna') ? '<div class="inp-group" style="margin-top:10px;"><input type="text" id="dt-other-src" placeholder="Wpisz nazwę aplikacji..." style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:14px; color:#fff; padding:14px; font-size:0.85rem; width:100%; box-sizing:border-box;" value="'+(window.dOtherSrc||'')+'" onchange="window.dOtherSrc=this.value"></div>' : '';
            
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
            
            let now = new Date();
            let dim = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
            let getDaily = function(val, p, dim) { let v = parseFloat(val)||0; if(p==='week') return v/7; if(p==='year') return v/365; return v/dim; };
            
            let cfg = d.cfg || {};
            let dailyFix = getDaily(cfg.bC, cfg.bPeriod, dim) + getDaily(cfg.iC, cfg.iPeriod, dim) + getDaily(cfg.cC, cfg.cType, dim) + getDaily(cfg.uC, cfg.uType, dim) + (cfg.eType === 'flat' ? getDaily(cfg.eC, cfg.ePeriod, dim) : 0);
            
            let g=0, sumCash=0, sumCard=0, sumVouch=0, sumApp=0, sumUber=0, sumBolt=0;
            let n = 0; 
            
            if(d.sh && d.sh.on && d.sh.tr) {
                for(let i=0; i<d.sh.tr.length; i++) {
                    let x = d.sh.tr[i];
                    let val = parseFloat(x.v) || 0;
                    g += val; 
                    
                    if(x.p === 'Gotówka') sumCash += val;
                    else if(x.p === 'Karta') { sumCard += val; }
                    else if(x.p === 'Voucher') { sumVouch += val; }
                    else {
                        sumApp += val;
                        if(x.s === 'Uber') sumUber += val;
                        else if(x.s === 'Bolt') sumBolt += val;
                    }
                }
            }

            let tax = g * (cfg.tax || 0);
            let pFee = cfg.eType === 'pct' ? g * (cfg.ePct || 0) : 0;
            n = g - tax - pFee - dailyFix;
            
            let diffHrs = 0, diffMins = 0, activeHrs = 0;
            let goal = cfg.goal || 350;
            let showGross = window.db.drv.panelMode === 'gross';
            let displayVal = showGross ? g : n;
            let displayLabel = showGross ? 'PRZYCHÓD BRUTTO' : 'ZYSK NETTO (SZACUNEK)';
            
            if(d.sh && d.sh.shiftStart) {
                let activeShiftMs = Date.now() - d.sh.shiftStart;
                if(d.sh.sPT) activeShiftMs -= d.sh.sPT;
                diffHrs = Math.floor(activeShiftMs/3600000);
                diffMins = Math.floor((activeShiftMs%3600000)/60000);
                activeHrs = activeShiftMs/3600000;
            }

            if (d.sh && d.sh.on) {
                act += '<div style="background: linear-gradient(145deg, #13131a, #0a0a0f); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 25px 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); margin-bottom: 20px; position: relative; overflow: hidden;">' +
                    '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">' +
                        '<div style="display:flex; align-items:center; gap: 8px;">' +
                            '<div style="width: 10px; height: 10px; border-radius: 50%; background: '+(d.sh.sPS ? '#f59e0b' : '#10b981')+'; box-shadow: 0 0 10px '+(d.sh.sPS ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.5)')+';"></div>' +
                            '<span style="font-size: 0.7rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">'+(d.sh.sPS ? 'Pauza' : 'Zalogowany')+'</span>' +
                        '</div>' +
                        '<div style="font-size: 0.85rem; font-weight: 800; color: #0ea5e9; background: rgba(14,165,233,0.1); padding: 6px 12px; border-radius: 12px; border: 1px solid rgba(14,165,233,0.2);">⏱️ '+diffHrs+'h '+diffMins+'m</div>' +
                    '</div>' +
                    '<div style="text-align: center; margin-bottom: 25px; cursor:pointer;" onclick="window.db.drv.panelMode = window.db.drv.panelMode === \'gross\' ? \'net\' : \'gross\'; window.render()">' +
                        '<div style="font-size: 0.65rem; color: rgba(255,255,255,0.4); font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 5px; display:flex; justify-content:center; align-items:center; gap:6px;">' +
                            displayLabel + ' <span style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:6px; font-size:0.55rem;">🔁</span>' +
                        '</div>' +
                        '<div style="font-size: 3.5rem; font-weight: 900; color: '+(displayVal>=0?'#10b981':'#ef4444')+'; letter-spacing: -2px; line-height: 1; text-shadow: 0 0 20px '+(displayVal>=0?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)')+';">' + Number(displayVal||0).toFixed(2) + ' zł</div>' +
                    '</div>';
                
                if(d.plat === 'apps') {
                    act += '<div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 25px;">' +
                        '<div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 8px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; color: #10b981;">💵 '+Number(sumCash).toFixed(2)+'</div>' +
                        '<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; color: #fff;">Uber: '+Number(sumUber).toFixed(2)+'</div>' +
                        '<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; color: #fff;">Bolt: '+Number(sumBolt).toFixed(2)+'</div>' +
                    '</div>';
                } else {
                    act += '<div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 25px;">' +
                        '<div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); padding: 8px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; color: #10b981;">💵 '+Number(sumCash).toFixed(2)+'</div>' +
                        '<div style="background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.2); padding: 8px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; color: #0ea5e9;">💳 '+Number(sumCard).toFixed(2)+'</div>' +
                        '<div style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); padding: 8px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; color: #a855f7;">🎫 '+Number(sumVouch).toFixed(2)+'</div>' +
                    '</div>';
                }

                act += '<div style="display: flex; gap: 12px;">' +
                    '<button style="flex: 1; background: '+(d.sh.sPS ? '#10b981' : 'rgba(255,255,255,0.05)')+'; color: '+(d.sh.sPS ? '#000' : '#fff')+'; border: 1px solid '+(d.sh.sPS ? '#10b981' : 'rgba(255,255,255,0.1)')+'; padding: 16px; border-radius: 18px; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; box-shadow: '+(d.sh.sPS ? '0 4px 15px rgba(16,185,129,0.3)' : 'none')+'; outline:none;" onclick="if(typeof window.toggleShiftPause===\'function\') window.toggleShiftPause()">' +
                        (d.sh.sPS ? '▶ WZNÓW PRACĘ' : '☕ PRZERWA') +
                    '</button>' +
                    '<button style="flex: 1; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 16px; border-radius: 18px; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; outline:none;" onclick="if(typeof window.openEndShiftModal===\'function\') window.openEndShiftModal()">' +
                        '🔴 ZAKOŃCZ' +
                    '</button>' +
                '</div>' +
            '</div>';
                
                // MODUŁ GPS
                if(d.liveRideStart) {
                    let isWaiting = d.sh.rWS !== null;
                    act += '<div style="background: '+(isWaiting?'rgba(14,165,233,0.05)':'rgba(16,185,129,0.05)')+'; border: 1px solid '+(isWaiting?'rgba(14,165,233,0.3)':'rgba(16,185,129,0.3)')+'; padding: 15px; border-radius: 20px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">' +
                        '<div style="font-size:1.8rem; margin-bottom:5px;">'+(isWaiting?'⏳':'🟢')+'</div>' +
                        '<h3 style="color:'+(isWaiting?'#0ea5e9':'#10b981')+'; margin:0 0 5px 0; font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;">'+(isWaiting?'Oczekiwanie...':'Kurs w toku!')+'</h3>' +
                        '<div style="font-size:2rem; font-weight:900; color:#fff; font-family:monospace; margin-bottom:12px; text-shadow:0 0 10px rgba(255,255,255,0.3);">'+Number(d.sh.gpsDist||0).toFixed(2)+'<span style="font-size:0.9rem; color:var(--muted); margin-left:5px;">KM (GPS)</span></div>' +
                        '<div style="display:flex; gap:10px;">' +
                            '<button style="flex:1; padding:12px; font-size:0.85rem; border-radius:14px; font-weight:800; background:'+(isWaiting?'#10b981':'rgba(14,165,233,0.1)')+'; color:'+(isWaiting?'#000':'#0ea5e9')+'; border:none; outline:none;" onclick="if(typeof window.toggleRideWait===\'function\') window.toggleRideWait()">'+(isWaiting?'▶ RUSZAMY':'⏳ POSTÓJ')+'</button>' +
                            '<button style="flex:2; padding:12px; border-radius:14px; font-size:0.85rem; font-weight:800; background:rgba(239,68,68,0.15); color:#ef4444; border:none; outline:none;" onclick="if(typeof window.stopLiveRide===\'function\') window.stopLiveRide()">🔴 ZAKOŃCZ KURS</button>' +
                        '</div></div>';
                } else {
                    act += '<div style="font-size: 0.65rem; color: #a855f7; margin-bottom: 8px; text-align: center; font-weight: 800; letter-spacing:0.5px;">⚠️ PWA NIE LICZY TRASY W TLE (WŁĄCZ EKRAN)<br>PEŁEN GPS W TLE TYLKO W WERSJI PRO</div>' +
                           '<button style="width:100%; background:linear-gradient(135deg, #10b981, #059669); color:#000; font-size:1rem; font-weight:900; letter-spacing:1px; padding:18px; border-radius:20px; border:none; box-shadow:0 8px 25px rgba(16,185,129,0.3); margin-bottom:20px; outline:none;" onclick="if(typeof window.startLiveRide===\'function\') window.startLiveRide()">🟢 ROZPOCZNIJ KURS (STOPER GPS)</button>';
                }
                
                act += '<div style="background: #111116; border: 1px solid #2a2a35; border-radius: 24px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 20px;">' +
                    '<div style="font-size: 0.65rem; color: #a1a1aa; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 15px; text-align: center;">Dodaj pojedynczy kurs</div>' +
                    '<div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 5px;">'+ch1+'</div>' +
                    otherSrcHtml +
                    '<div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px;">'+ch2+'</div>' +
                    '<div style="background: #000; border: 1px inset rgba(255,255,255,0.05); border-radius: 16px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: center; align-items: center; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">' +
                        '<input type="number" id="dt-v" placeholder="0.00" style="color: #0ea5e9; border: none; background: transparent; font-size: 3rem; font-weight: 900; text-align: center; width: 160px; outline: none; font-family: monospace; text-shadow: 0 0 15px rgba(14,165,233,0.3);">' +
                        '<span style="font-size: 1.4rem; font-weight: 700; color: rgba(255,255,255,0.3); margin-top: 10px; margin-left: 5px;">zł</span>' +
                    '</div>' +
                    '<div class="inp-row" style="margin-bottom:15px; gap:10px;">' +
                        '<div class="inp-group" style="margin:0;"><input type="number" id="dt-m" placeholder="Czas (min)" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:0.95rem; font-weight:600; outline:none; width:100%; box-sizing:border-box;"></div>' +
                        '<div class="inp-group" style="margin:0;"><input type="number" id="dt-k" placeholder="Dystans (km)" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:0.95rem; font-weight:600; outline:none; width:100%; box-sizing:border-box;"></div>' +
                    '</div>' +
                    '<div class="inp-group" style="margin-bottom:15px;">' +
                        '<select id="dt-cid" style="background:rgba(0,0,0,0.3); border-radius:14px; padding:16px; font-size:0.85rem; color:rgba(255,255,255,0.6); border:1px solid rgba(255,255,255,0.08); outline:none; width:100%; box-sizing:border-box;"><option value="">-- Powiąż z Klientem VIP --</option>'+clientOpts+'</select>' +
                    '</div>' +
                    '<button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; padding:18px; border-radius:16px; font-weight:900; font-size:1.05rem; letter-spacing:1px; border:none; box-shadow:0 8px 25px rgba(14,165,233,0.35); width:100%; outline:none;" onclick="if(typeof window.dAddT===\'function\') window.dAddT()">DODAJ KURS DO ZMIANY</button>' +
                '</div>';
                
                act += '<div style="margin: 30px 5px 15px 5px; text-align: center;"><span style="font-size:0.7rem; color:rgba(255,255,255,0.4); font-weight:800; letter-spacing:1px; text-transform:uppercase;">DZIENNIK ZAROBKÓW</span></div>';
                    
                let trsList = d.sh.tr || [];
                if(trsList.length > 0) {
                    for(let i=0; i<trsList.length; i++) {
                        let x = trsList[i];
                        let icon='🚕', color='rgba(255,255,255,0.2)', bg='rgba(255,255,255,0.02)';
                        if(x.p==='Gotówka') { icon='💵'; color='#10b981'; bg='rgba(16,185,129,0.05)'; }
                        else if(x.p==='Karta') { icon='💳'; color='#0ea5e9'; bg='rgba(14,165,233,0.05)'; }
                        else if(x.p==='Voucher') { icon='🎫'; color='#a855f7'; bg='rgba(168,85,247,0.05)'; }
                        
                        act += '<div class="log-item" style="border:none; padding:15px; margin-bottom:10px; background:'+bg+'; border-radius:16px; border-left:3px solid '+color+';">' +
                            '<div style="display:flex; align-items:center; gap:15px; flex:1;">' +
                                '<div style="font-size:1.5rem; width:45px; height:45px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:12px; display:flex; align-items:center; justify-content:center;">'+icon+'</div>' +
                                '<div style="flex:1;">' +
                                    '<strong style="font-size:1.1rem; color:#fff; display:block; margin-bottom:4px; font-weight:800;">'+Number(x.v||0).toFixed(2)+' zł</strong>' +
                                    '<div style="display:flex; gap:6px; font-size:0.7rem; color:rgba(255,255,255,0.5); align-items:center; font-weight:600;">' +
                                        '<span>'+(x.time||'--:--')+'</span><span style="opacity:0.3">•</span><span style="color:'+color+';">'+x.p+'</span><span style="opacity:0.3">•</span><span>'+x.s+'</span>' +
                                        (x.k>0 ? '<span style="opacity:0.3">•</span><span>'+Number(x.k).toFixed(1)+' km</span>' : '') +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div style="display:flex; flex-direction:column; gap:8px;">' +
                                '<button style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:8px 12px; cursor:pointer; font-size:0.75rem; outline:none;" onclick="if(typeof window.dEditT===\'function\') window.dEditT('+x.id+')">✏️</button>' +
                                '<button style="background:rgba(239,68,68,0.15); color:#ef4444; border:none; border-radius:10px; padding:8px 12px; cursor:pointer; font-size:0.75rem; outline:none;" onclick="if(typeof window.dDelT===\'function\') window.dDelT('+x.id+')">🗑️</button>' +
                            '</div>' +
                        '</div>';
                    }
                } else {
                    act += '<div style="text-align:center;color:rgba(255,255,255,0.3);padding:30px 0;font-size:0.85rem; background:rgba(0,0,0,0.2); border-radius:20px; border:1px dashed rgba(255,255,255,0.05); font-weight:600;">Brak zarejestrowanych kursów na tej zmianie.</div>';
                }
            } else {
                act = '<div class="dash-hero" style="padding-top:30px; padding-bottom:20px;">' +
                    '<div style="width:70px; height:70px; background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:2.2rem; box-shadow:0 8px 25px rgba(245,158,11,0.15);">🚕</div>' +
                    '<h1 style="font-size:2.2rem; font-weight:900; letter-spacing:-1px; margin-bottom:5px; color:#fff;">Cześć, '+(window.db.userName || 'Kierowco')+'!</h1>' +
                    '<p style="margin-top:5px; font-size:0.75rem; color:rgba(255,255,255,0.5); font-weight:800; text-transform:uppercase; letter-spacing:1px;">Potwierdź stan licznika przed jazdą</p>' +
                '</div>' +
                '<div style="padding:0 15px;">' +
                    '<div style="background:#111116; border-radius:24px; padding:25px; text-align:center; border:1px solid #2a2a35; box-shadow:inset 0 4px 20px rgba(0,0,0,0.5), 0 8px 30px rgba(0,0,0,0.4); margin-bottom:20px;">' +
                        '<div style="font-size:0.65rem; color:#f59e0b; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px;">STAN LICZNIKA POJAZDU (START)</div>' +
                        '<input type="number" id="ds-o" value="'+((d.odo||0)>0?d.odo:'')+'" placeholder="000000" style="width:100%; background:transparent; border:none; color:#f59e0b; font-size:3.5rem; font-weight:900; text-align:center; outline:none; padding:0; text-shadow:0 0 15px rgba(245,158,11,0.4); letter-spacing:2px; font-family:monospace;">' +
                    '</div>' +
                    '<button class="btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#000; font-size:1.1rem; font-weight:900; letter-spacing:1px; padding:20px; border-radius:24px; border:none; box-shadow:0 10px 30px rgba(16,185,129,0.3); width:100%; text-transform:uppercase; outline:none;" onclick="if(typeof window.dStartS===\'function\') window.dStartS()">ROZPOCZNIJ PRACĘ</button>' +
                '</div>';
                
                if(!window.dShowOff) {
                    act += '<div style="padding:0 15px; margin-top:15px;">' +
                        '<button class="btn" style="background:#1a1a22; color:#888; border:1px solid #2a2a35; font-size:0.8rem; font-weight:700; box-shadow:none; width:100%; padding:16px; border-radius:20px; outline:none;" onclick="window.dShowOff=true; window.render()">📥 ZAKSIĘGUJ ZALEGŁĄ ZMIANĘ</button>' +
                    '</div>';
                    act += panelProBanner;
                } else {
                    let offlineInputsHtml = '';
                    if(d.plat === 'apps') {
                        offlineInputsHtml = 
                            '<div style="background:rgba(0,0,0,0.3); border:1px inset rgba(255,255,255,0.05); border-radius:20px; padding:20px; margin-bottom:15px;">' +
                                '<label style="font-size:0.65rem; color:#0ea5e9; font-weight:800; text-align:center; display:block; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">ROZBICIE UTARGU (ZŁ)</label>' +
                                '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">' +
                                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-uber" placeholder="Uber" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:1rem; font-weight:700; outline:none;"></div>' +
                                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-bolt" placeholder="Bolt" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:1rem; font-weight:700; outline:none;"></div>' +
                                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-freenow" placeholder="FreeNow" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:1rem; font-weight:700; outline:none;"></div>' +
                                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-inna" placeholder="Inna Apka" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:1rem; font-weight:700; outline:none;"></div>' +
                                    '<div class="inp-group" style="margin:0; grid-column: span 2;"><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka (Suma z portfela)" style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.3); color:#10b981; border-radius:14px; padding:16px; text-align:center; font-size:1.15rem; font-weight:800; outline:none;"></div>' +
                                '</div>' +
                            '</div>';
                    } else {
                        offlineInputsHtml = 
                            '<div style="background:rgba(0,0,0,0.3); border:1px inset rgba(255,255,255,0.05); border-radius:20px; padding:20px; margin-bottom:15px;">' +
                                '<label style="font-size:0.65rem; color:#0ea5e9; font-weight:800; text-align:center; display:block; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">ROZBICIE UTARGU (ZŁ)</label>' +
                                '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">' +
                                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-cash" placeholder="Gotówka" style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.3); color:#10b981; border-radius:14px; padding:16px; text-align:center; font-size:1.15rem; font-weight:800; outline:none;"></div>' +
                                    '<div class="inp-group" style="margin:0;"><input type="number" step="0.01" id="dw-v-karta" placeholder="Karta/Terminal" style="background:rgba(14,165,233,0.05); border:1px solid rgba(14,165,233,0.3); color:#0ea5e9; border-radius:14px; padding:16px; text-align:center; font-size:1.15rem; font-weight:800; outline:none;"></div>' +
                                    '<div class="inp-group" style="margin:0; grid-column: span 2;"><input type="number" step="0.01" id="dw-v-voucher" placeholder="Vouchery" style="background:rgba(168,85,247,0.05); border:1px solid rgba(168,85,247,0.3); color:#a855f7; border-radius:14px; padding:16px; text-align:center; font-size:1.15rem; font-weight:800; outline:none;"></div>' +
                                '</div>' +
                            '</div>';
                    }

                    act += '<div class="section-lbl" style="color:#0ea5e9; border-color:#0ea5e9; margin-top:30px; font-size:0.7rem; letter-spacing:1px; text-transform:uppercase;">⚡ ZALEGŁA ZMIANA / RAPORT Z KASY</div>' +
                    '<div class="panel" style="border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #0f172a, #09090b); border-radius:24px; padding:25px 20px; margin:0 15px; animation:fadeIn 0.3s; box-shadow:0 15px 40px rgba(0,0,0,0.6);">' +
                        
                        '<div class="inp-row" style="margin-bottom:15px; gap:12px;">' +
                            '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:700; margin-bottom:6px; display:block;">Data Startu</label><input type="date" id="dw-d-from" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px; color:#fff; font-size:0.85rem; outline:none; width:100%; box-sizing:border-box;"></div>' +
                            '<div class="inp-group" style="margin:0;"><label style="font-size:0.65rem; color:rgba(255,255,255,0.4); font-weight:700; margin-bottom:6px; display:block;">Data Zakończenia</label><input type="date" id="dw-d-to" value="'+(window.getLocalYMD?window.getLocalYMD():'')+'" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px; color:#fff; font-size:0.85rem; outline:none; width:100%; box-sizing:border-box;"></div>' +
                        '</div>' +
                        
                        '<div style="background:rgba(0,0,0,0.3); border:1px inset rgba(255,255,255,0.05); border-radius:20px; padding:20px; margin-bottom:15px;">' +
                            '<label style="font-size:0.65rem; color:#f59e0b; font-weight:800; text-align:center; display:block; margin-bottom:12px; text-transform:uppercase; letter-spacing:1px;">STAN LICZNIKA POJAZDU</label>' +
                            '<div class="inp-row" style="margin:0; gap:12px;">' +
                                '<div class="inp-group" style="margin:0;"><input type="number" id="dw-odo-s" value="'+(d.odo||0)+'" placeholder="Start (KM)" style="background:rgba(245,158,11,0.05); border:1px solid rgba(245,158,11,0.2); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:0.95rem; font-weight:700; outline:none;"></div>' +
                                '<div class="inp-group" style="margin:0;"><input type="number" id="dw-odo-e" placeholder="Koniec (KM)" style="background:rgba(245,158,11,0.05); border:1px solid rgba(245,158,11,0.2); color:#fff; border-radius:14px; padding:14px; text-align:center; font-size:0.95rem; font-weight:700; outline:none;"></div>' +
                            '</div>' +
                        '</div>' +

                        offlineInputsHtml +
                        
                        '<div class="inp-row" style="margin-bottom:25px; gap:12px;">' +
                            '<div class="inp-group" style="margin:0;"><input type="number" id="dw-pk" placeholder="Dystans płatny (KM)" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:0.85rem; font-weight:600; outline:none; width:100%; box-sizing:border-box;"></div>' +
                            '<div class="inp-group" style="margin:0;"><input type="number" id="dw-h" placeholder="Czas pracy (h)" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:#fff; border-radius:14px; padding:16px; text-align:center; font-size:0.85rem; font-weight:600; outline:none; width:100%; box-sizing:border-box;"></div>' +
                        '</div>' +
                        
                        '<button class="btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:18px; font-size:1.05rem; letter-spacing:1px; border-radius:20px; border:none; box-shadow:0 8px 25px rgba(14,165,233,0.35); width:100%; outline:none;" onclick="if(typeof window.dAddOfflineWeekly===\'function\') window.dAddOfflineWeekly()">ZAKSIĘGUJ ZMIANĘ</button>' +
                        '<button class="btn" style="background:transparent; color:rgba(255,255,255,0.4); margin-top:10px; border:1px solid rgba(255,255,255,0.1); border-radius:20px; box-shadow:none; padding:16px; font-weight:700; font-size:0.9rem; width:100%; outline:none;" onclick="window.dShowOff=false; window.render()">ANULUJ</button>' +
                    '</div>';
                }
            }
            
            appContainer.innerHTML = hdr + act + '<div style="height:140px; width:100%; clear:both;"></div>' + nav;
        }

        // ==========================================
        // ZAKŁADKA: STATYSTYKI (STATS) - P&L
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
                transferButtonHtml = '<button class="btn btn-success" style="margin-top:15px; width:calc(100% - 30px); margin-left:auto; margin-right:auto; font-weight:800; background:#10b981; color:#000; box-shadow: 0 4px 15px rgba(16,185,129,0.3); padding:14px; border-radius:14px; border:none; outline:none; cursor:pointer;" onclick="if(typeof window.dTransferToHomeModal===\'function\') window.dTransferToHomeModal()"><span style="font-size:1.1rem; margin-right:8px;">💸</span> PRZELEJ DO BUDŻETU<br><small style="font-weight:600; font-size:0.7rem; color:rgba(0,0,0,0.6); display:block; margin-top:2px;">Nierozliczone: '+Number(availableCashForTransfer).toFixed(2)+' zł</small></button>';
            } else {
                transferButtonHtml = '<button class="btn" style="margin-top:15px; width:calc(100% - 30px); margin-left:auto; margin-right:auto; font-weight:700; background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.3); border:1px solid rgba(255,255,255,0.05); padding:14px; border-radius:14px; outline:none;" disabled><span style="font-size:1rem; margin-right:8px;">✅</span> GOTÓWKA ROZLICZONA<br><small style="font-weight:600; font-size:0.65rem; display:block; margin-top:2px;">W domu: '+Number(totalTransferred).toFixed(2)+' zł</small></button>';
            }

            // --- ZAPOWIEDŹ PRO DLA WYNIKÓW ---
            let proBannerHtml = '';
            if (d.plat === 'apps') {
                proBannerHtml = '<div class="pro-teaser-panel" style="margin: 15px 15px 25px 15px; padding: 20px; background: linear-gradient(135deg, #130a1c 0%, #000000 100%); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="if(typeof window.sysAlert===\'function\') window.sysAlert(\'Centrum Funkcji PRO\', \'W wersji PRO uzyskasz dostęp do pełnej automatyzacji! Zlecenia, paragony i e-kasy będą się rozliczać same. 🚀\', \'info\')">' +
                    '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #d946ef, #0ea5e9); box-shadow: 2px 0 12px rgba(217,70,239,0.6);"></div>' +
                    '<div style="position: absolute; top: 12px; right: 12px; background: #d946ef; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>' +
                    '<div style="display: flex; align-items: center; gap: 15px;">' +
                        '<div style="font-size: 2.5rem; text-shadow: 0 0 15px rgba(217,70,239,0.4);">🏆✨</div>' +
                        '<div style="text-align: left;">' +
                            '<h4 style="color: #d946ef; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Premium Wyniki</h4>' +
                            '<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Rozliczenia AI:</b> Wszystko w jednym miejscu.<br>✅ <b>Pełna Historia:</b> Analizuj swoje zyski!</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            } else {
                proBannerHtml = '<div class="pro-teaser-panel" style="margin: 15px 15px 25px 15px; padding: 20px; background: linear-gradient(135deg, #130a1c 0%, #000000 100%); border: 1px solid rgba(217, 70, 239, 0.3); border-radius: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s;" onclick="if(typeof window.sysAlert===\'function\') window.sysAlert(\'Centrum Funkcji PRO\', \'W wersji PRO uzyskasz dostęp do pełnej automatyzacji! Zlecenia, paragony i e-kasy będą się rozliczać same. 🚀\', \'info\')">' +
                    '<div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #d946ef, #0ea5e9); box-shadow: 2px 0 12px rgba(217,70,239,0.6);"></div>' +
                    '<div style="position: absolute; top: 12px; right: 12px; background: #d946ef; color: #fff; font-size: 0.6rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; letter-spacing: 1px; animation: proPulse 2s infinite;">PRO</div>' +
                    '<div style="display: flex; align-items: center; gap: 15px;">' +
                        '<div style="font-size: 2.5rem; text-shadow: 0 0 15px rgba(217,70,239,0.4);">🏆✨</div>' +
                        '<div style="text-align: left;">' +
                            '<h4 style="color: #d946ef; margin: 0 0 6px 0; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;">Premium Wyniki</h4>' +
                            '<div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">✅ <b>Integracja e-Kasy:</b> Automatyczne zaciąganie kursów (API).</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }

            // =========================================================
            // BUDOWA AKORDEONÓW SZCZEGÓŁOWYCH P&L
            // =========================================================

            let bruttoDetHtml = '<div id="brutto-det" style="display:none; margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); width:100%; font-size:0.7rem; color:var(--muted);">';
            if(d.plat === 'apps') {
                if(cashEarned > 0) bruttoDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Przychód z gotówki:</span><span style="color:#10b981;">+'+Number(cashEarned).toFixed(2)+' zł</span></div>';
                if(uberEarned > 0) bruttoDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Przychód z Uber:</span><span style="color:#fff;">+'+Number(uberEarned).toFixed(2)+' zł</span></div>';
                if(boltEarned > 0) bruttoDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Przychód z Bolt:</span><span style="color:#fff;">+'+Number(boltEarned).toFixed(2)+' zł</span></div>';
                let otherApps = appEarned - uberEarned - boltEarned;
                if(otherApps > 0) bruttoDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Przychód Inne (Aplikacje):</span><span style="color:#fff;">+'+Number(otherApps).toFixed(2)+' zł</span></div>';
            } else {
                if(cashEarned > 0) bruttoDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Przychód z gotówki:</span><span style="color:#10b981;">+'+Number(cashEarned).toFixed(2)+' zł</span></div>';
                if(cardEarned > 0) bruttoDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Przychód z Karty/Terminal:</span><span style="color:#0ea5e9;">+'+Number(cardEarned).toFixed(2)+' zł</span></div>';
                if(vouchEarned > 0) bruttoDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Przychód z Voucherów:</span><span style="color:#a855f7;">+'+Number(vouchEarned).toFixed(2)+' zł</span></div>';
            }
            bruttoDetHtml += '</div>';

            let exDetHtml = '<div id="ex-det" style="display:none; margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); width:100%; font-size:0.7rem; color:var(--muted);">';
            let exList = fe.filter(function(e) { return e.ty === 'e'; });
            if (exList.length > 0) {
                for(let i=0; i<exList.length; i++) {
                    exDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>'+exList[i].d+' ('+exList[i].dt+'):</span><span>-'+Number(exList[i].v).toFixed(2)+' zł</span></div>';
                }
            } else {
                exDetHtml += '<div style="text-align:center; padding: 10px 0;">Brak zrejestrowanych kosztów eksploatacyjnych.</div>';
            }
            exDetHtml += '</div>';

            let costPk = pkSum * (cfg.fuelPx || 0);
            let costEmpty = emptyKSum * (cfg.fuelPx || 0);

            let fuelDetHtml = '<div id="fuel-det" style="display:none; margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); width:100%; font-size:0.7rem; color:var(--muted);">';
            fuelDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:#fff;">Dystans całkowity ('+Number(k).toFixed(1)+' km):</span><span style="color:#fff;">-'+Number(fc).toFixed(2)+' zł</span></div>';
            fuelDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>W tym płatny (z klientem) - '+Number(pkSum).toFixed(1)+' km:</span><span>-'+Number(costPk).toFixed(2)+' zł</span></div>';
            fuelDetHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>W tym pusty (dojazdy) - '+Number(emptyKSum).toFixed(1)+' km:</span><span style="color:var(--danger);">-'+Number(costEmpty).toFixed(2)+' zł</span></div>';
            fuelDetHtml += '<div style="text-align:right; font-size:0.65rem; margin-top:8px; color:rgba(255,255,255,0.3); border-top:1px dashed rgba(255,255,255,0.05); padding-top:8px;">Średni koszt: '+Number(cfg.fuelPx || 0).toFixed(2)+' zł/km</div>';
            fuelDetHtml += '</div>';

            let taxDetHtml = '<div id="tax-det" style="display:none; margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); width:100%; font-size:0.7rem; color:var(--muted);"><div style="display:flex; justify-content:space-between;"><span>Przychód Brutto ('+Number(g).toFixed(2)+' zł) * Podatek ('+Number((cfg.tax||0)*100).toFixed(1)+'%)</span><span>-'+Number(tx).toFixed(2)+' zł</span></div></div>';
            let pfDetHtml = '<div id="pf-det" style="display:none; margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); width:100%; font-size:0.7rem; color:var(--muted);"><div style="display:flex; justify-content:space-between;"><span>Przychód Brutto ('+Number(g).toFixed(2)+' zł) * Prowizja ('+Number((cfg.ePct||0)*100).toFixed(1)+'%)</span><span>-'+Number(pf).toFixed(2)+' zł</span></div></div>';
            let cfDetHtml = '<div id="cf-det" style="display:none; margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); width:100%; font-size:0.7rem; color:var(--muted);"><div style="display:flex; justify-content:space-between;"><span>Utarg Kartą ('+Number(cardEarned).toFixed(2)+' zł) * Prowizja Terminala ('+Number((cfg.cardF||0)*100).toFixed(1)+'%)</span><span>-'+Number(cf).toFixed(2)+' zł</span></div></div>';
            let vfDetHtml = '<div id="vf-det" style="display:none; margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); width:100%; font-size:0.7rem; color:var(--muted);"><div style="display:flex; justify-content:space-between;"><span>Utarg Voucher ('+Number(vouchEarned).toFixed(2)+' zł) * Prowizja ('+Number((cfg.voucherF||0)*100).toFixed(1)+'%)</span><span>-'+Number(vf).toFixed(2)+' zł</span></div></div>';

            let bC_tot = getDaily(cfg.bC, cfg.bPeriod, daysInCurrentMonth) * daysToCharge;
            let iC_tot = getDaily(cfg.iC, cfg.iPeriod, daysInCurrentMonth) * daysToCharge;
            let cC_tot = getDaily(cfg.cC, cfg.cType, daysInCurrentMonth) * daysToCharge;
            let uC_tot = getDaily(cfg.uC, cfg.uType, daysInCurrentMonth) * daysToCharge;
            let eC_tot = (cfg.eType === 'flat' ? getDaily(cfg.eC, cfg.ePeriod, daysInCurrentMonth) : 0) * daysToCharge;

            let fixedDetailsHtml = '<div id="fixed-costs-det" style="display:none; margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); width:100%; font-size:0.7rem; color:var(--muted);">';
            if(bC_tot > 0) fixedDetailsHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Abonament za bazę / Korporację:</span><span>-'+Number(bC_tot).toFixed(2)+' zł</span></div>';
            if(iC_tot > 0) fixedDetailsHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>ZUS / Ubezpieczenie Pojazdu:</span><span>-'+Number(iC_tot).toFixed(2)+' zł</span></div>';
            if(cC_tot > 0) fixedDetailsHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Amortyzacja Auta (Rata/Wynajem):</span><span>-'+Number(cC_tot).toFixed(2)+' zł</span></div>';
            if(uC_tot > 0) fixedDetailsHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Księgowość / Inne usługi:</span><span>-'+Number(uC_tot).toFixed(2)+' zł</span></div>';
            if(eC_tot > 0) fixedDetailsHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Abonament (Stała opłata partnerska):</span><span>-'+Number(eC_tot).toFixed(2)+' zł</span></div>';
            fixedDetailsHtml += '</div>';

            let makeRow = function(label, valueStr, valColor, detId, detHtml) {
                return '<div class="fin-row" style="flex-direction:column; align-items:stretch; font-size:0.85rem; margin-bottom:10px; cursor:pointer; background:rgba(255,255,255,0.03); padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); backdrop-filter:blur(10px); transition:transform 0.2s;" onclick="let el=document.getElementById(\''+detId+'\'); let icon=document.getElementById(\''+detId+'-icon\'); if(el.style.display===\'none\'){el.style.display=\'block\'; icon.innerHTML=\'🔼\'; this.style.transform=\'scale(1.02)\';}else{el.style.display=\'none\'; icon.innerHTML=\'🔽\'; this.style.transform=\'scale(1)\';}">' +
                    '<div style="display:flex; justify-content:space-between; width:100%; align-items:center;">' +
                        '<span class="fin-label" style="color:rgba(255,255,255,0.8); font-weight:600;">' + label + ' <span id="'+detId+'-icon" style="font-size:0.6rem; margin-left:6px; opacity:0.5;">🔽</span></span>' +
                        '<span class="fin-val" style="color:'+valColor+'; font-weight:900; letter-spacing:0.5px;">' + valueStr + '</span>' +
                    '</div>' +
                    detHtml +
                '</div>';
            };

            let pAndLHtml = '<div class="panel" style="padding:25px 20px; margin:0 15px 15px; border-radius:24px; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 15px 40px rgba(0,0,0,0.6);">' +
                '<div style="text-align:center; margin-bottom:20px;">' +
                    '<span style="font-size:0.75rem; color:rgba(255,255,255,0.3); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">WODOSPAD FINANSOWY (P&L)</span>' +
                '</div>' +
                makeRow('Przychody Operacyjne Brutto', Number(g).toFixed(2)+' zł', '#10b981', 'brutto-det', bruttoDetHtml) +
                makeRow('Koszty Eksploatacyjne (Serwis)', '-'+Number(ex).toFixed(2)+' zł', '#ef4444', 'ex-det', exDetHtml) +
                makeRow('Koszty Paliwa (Całkowite)', '-'+Number(fc).toFixed(2)+' zł', '#f59e0b', 'fuel-det', fuelDetHtml) +
                (cf > 0 ? makeRow('Prowizja Terminala (Karty)', '-'+Number(cf).toFixed(2)+' zł', '#ef4444', 'cf-det', cfDetHtml) : '') +
                (vf > 0 ? makeRow('Prowizja Voucherów', '-'+Number(vf).toFixed(2)+' zł', '#ef4444', 'vf-det', vfDetHtml) : '') +
                (pf > 0 ? makeRow('Prowizja Aplikacji', '-'+Number(pf).toFixed(2)+' zł', '#ef4444', 'pf-det', pfDetHtml) : '') +
                makeRow('Zobowiązania Podatkowe (VAT/PIT)', '-'+Number(tx).toFixed(2)+' zł', '#ef4444', 'tax-det', taxDetHtml) +
                makeRow('Koszty Stałe / Amortyzacja '+(!window.db.drv.showFixed ? '(Wyłączone)' : '(Za '+daysToCharge+' dni)'), '-'+Number(totalDynamicFix).toFixed(2)+' zł', '#ef4444', 'fixed-costs-det', (window.db.drv.showFixed ? fixedDetailsHtml : '')) +
                '<div class="fin-row" style="background:rgba(0,0,0,0.4); padding:20px; border-radius:16px; border:1px inset rgba(255,255,255,0.05); margin-top:20px; box-shadow:inset 0 4px 15px rgba(0,0,0,0.3);">' +
                    '<span class="fin-label" style="color:#fff; font-size:0.95rem; font-weight:900; letter-spacing:1px; text-transform:uppercase;">ZYSK NETTO (OPERACYJNY)</span>' +
                    '<span class="fin-val" style="font-size:1.8rem; font-weight:900; letter-spacing:-1px; color:'+(n >= 0 ? '#10b981' : '#ef4444')+'">'+Number(n).toFixed(2)+' zł</span>' +
                '</div>' +
            '</div>';

            let historyLogHtml = '<div class="panel" style="margin:0 15px 15px; padding:25px 20px; border-radius:24px; border:1px solid rgba(255,255,255,0.05); background:linear-gradient(145deg, #18181b, #09090b); box-shadow:0 15px 40px rgba(0,0,0,0.6);">' +
                '<div style="text-align:center; margin-bottom:20px;">' +
                    '<span style="font-size:0.75rem; color:rgba(255,255,255,0.3); font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">HISTORIA ZMIAN</span>' +
                '</div>';
            
            if(fs.length > 0) {
                for(let i=0; i<fs.length; i++) {
                    let x = fs[i];
                    historyLogHtml += '<div class="log-item" style="border:none; border-left:4px solid '+(x.n >= 0 ? '#10b981' : '#ef4444')+'; flex-direction:column; align-items:flex-start; padding:16px; margin-bottom:12px; border-radius:16px; background:rgba(0,0,0,0.3); box-shadow:inset 0 2px 10px rgba(0,0,0,0.2);">' +
                        '<div style="display:flex; justify-content:space-between; width:100%; margin-bottom:8px; align-items:center;">' +
                            '<div><strong style="font-size:1rem; color:#fff; font-weight:800; letter-spacing:0.5px;">'+x.dt+'</strong></div>' +
                            '<strong style="color:'+(x.n >= 0 ? '#10b981' : '#ef4444')+'; font-size:1.1rem; letter-spacing:-0.5px;">Netto: '+Number(x.n || 0).toFixed(2)+' zł</strong>' +
                        '</div>' +
                        '<div style="display:flex; justify-content:space-between; width:100%; align-items:center;">' +
                            '<span style="color:rgba(255,255,255,0.4); font-size:0.75rem; font-weight:600;">Brutto: <span style="color:#fff;">'+Number(x.g || 0).toFixed(2)+' zł</span> | '+Number(x.k || 0).toFixed(1)+' km</span>' +
                            '<div style="display:flex; gap:8px;">' +
                                '<button class="btn" style="padding:8px 12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; font-size:0.8rem; cursor:pointer; outline:none;" onclick="if(typeof window.dEditHistory===\'function\') window.dEditHistory('+x.id+')">✏️</button>' +
                                '<button class="btn-danger" style="padding:8px 12px; border:none; border-radius:10px; font-weight:bold; background:rgba(239,68,68,0.15); color:#ef4444; font-size:0.8rem; cursor:pointer; outline:none;" onclick="if(typeof window.dDelHistory===\'function\') window.dDelHistory('+x.id+')">🗑️</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                }
            } else {
                historyLogHtml += '<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:0.8rem;padding:30px 0; background:rgba(0,0,0,0.2); border-radius:16px; border:1px dashed rgba(255,255,255,0.05); font-weight:600;">Brak zapisanych zmian w tym okresie.</div>';
            }
            historyLogHtml += '</div>';

            appContainer.innerHTML = hdr + 
            '<div class="mode-switch" style="margin:12px 15px; border-radius:16px; padding:6px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05);">' +
                '<div class="m-btn '+(fM==='today'?'active':'')+'" style="padding:12px; font-size:0.7rem; border-radius:12px; font-weight:800;" onclick="window.db.filter=\'today\'; window.render()">Dziś</div>' +
                '<div class="m-btn '+(fM==='week'?'active':'')+'" style="padding:12px; font-size:0.7rem; border-radius:12px; font-weight:800;" onclick="window.db.filter=\'week\'; window.render()">Tydzień</div>' +
                '<div class="m-btn '+(fM==='month'?'active':'')+'" style="padding:12px; font-size:0.7rem; border-radius:12px; font-weight:800;" onclick="window.db.filter=\'month\'; window.render()">Miesiąc</div>' +
                '<div class="m-btn '+(fM==='all'?'active':'')+'" style="padding:12px; font-size:0.7rem; border-radius:12px; font-weight:800;" onclick="window.db.filter=\'all\'; window.render()">Całość</div>' +
                '<div class="m-btn '+(fM==='custom'?'active':'')+'" style="padding:12px; font-size:0.7rem; border-radius:12px; font-weight:800;" onclick="window.db.filter=\'custom\'; window.render()">Własny</div>' +
            '</div>' +
            customDatesHtml +
            '<div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px; padding:0 15px;">' +
                '<button class="chip '+(window.db.drv.showFixed?'active':'')+'" style="font-size:0.7rem; padding:8px 16px; border-radius:20px; font-weight:800; background:'+(window.db.drv.showFixed?'rgba(255,255,255,0.1)':'transparent')+'; border:1px solid rgba(255,255,255,0.1); color:'+(window.db.drv.showFixed?'#fff':'var(--muted)')+';" onclick="window.db.drv.showFixed=true; window.render()">Koszty pełne</button>' +
                '<button class="chip '+(!window.db.drv.showFixed?'active':'')+'" style="font-size:0.7rem; padding:8px 16px; border-radius:20px; font-weight:800; background:'+(!window.db.drv.showFixed?'rgba(255,255,255,0.1)':'transparent')+'; border:1px solid rgba(255,255,255,0.1); color:'+(!window.db.drv.showFixed?'#fff':'var(--muted)')+';" onclick="window.db.drv.showFixed=false; window.render()">Tylko Operacyjny</button>' +
            '</div>' +
            '<div class="dash-hero" style="padding-top:0; padding-bottom:20px; border-bottom:1px dashed rgba(255,255,255,0.05); margin-bottom:20px;">' +
                '<p style="font-size:0.65rem; font-weight:800; color:rgba(255,255,255,0.4); letter-spacing:1px; text-transform:uppercase;">'+(window.db.drv.showFixed ? 'TWOJE PRAWDZIWE NETTO' : 'ZYSK Z KURSÓW (BEZ KOSZTÓW STAŁYCH)')+'</p>' +
                '<h1 style="color:'+(n>=0?'#10b981':'#ef4444')+'; font-size:3.5rem; font-weight:900; letter-spacing:-2px; margin:0; text-shadow:0 0 20px '+(n>=0?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)')+';">'+Number(n).toFixed(2)+' zł</h1>' +
                transferButtonHtml +
            '</div>' +
            breakdownStatsHtml +
            
            '<div style="padding:0 15px; display:flex; flex-direction:column; gap:12px; margin-bottom:25px;">' +
                '<div style="display:flex; gap:12px;">' +
                    '<div class="box" style="flex:1; padding:16px; border-radius:20px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05); box-shadow:0 8px 20px rgba(0,0,0,0.3);">' +
                        '<span style="color:#0ea5e9; font-size:0.65rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">ZYSK JEDNOSTKOWY (1 KM)</span>' +
                        '<strong style="color:#fff; font-size:1.3rem; display:block; margin-top:6px; letter-spacing:-0.5px;">'+Number(rKm).toFixed(2)+' zł</strong>' +
                    '</div>' +
                    '<div class="box" style="flex:1; padding:16px; border-radius:20px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05); box-shadow:0 8px 20px rgba(0,0,0,0.3);">' +
                        '<span style="color:#d946ef; font-size:0.65rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">ZYSK GODZINOWY (1 H)</span>' +
                        '<strong style="color:#fff; font-size:1.3rem; display:block; margin-top:6px; letter-spacing:-0.5px;">'+Number(rHr).toFixed(2)+' zł</strong>' +
                    '</div>' +
                '</div>' +
                '<div style="display:flex; gap:12px;">' +
                    '<div class="box" style="flex:1; padding:16px; border-radius:20px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05); box-shadow:0 8px 20px rgba(0,0,0,0.3);">' +
                        '<span style="color:#10b981; font-size:0.65rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">AKTYWNE DNI</span>' +
                        '<strong style="color:#fff; font-size:1.3rem; display:block; margin-top:6px; letter-spacing:-0.5px;">'+daysToCharge+' dni</strong>' +
                    '</div>' +
                    '<div class="box" style="flex:1; padding:16px; border-radius:20px; background:linear-gradient(145deg, #18181b, #09090b); border:1px solid rgba(255,255,255,0.05); box-shadow:0 8px 20px rgba(0,0,0,0.3);">' +
                        '<span style="color:#f59e0b; font-size:0.65rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">CZAS ZALOGOWANIA</span>' +
                        '<strong style="color:#fff; font-size:1.3rem; display:block; margin-top:6px; letter-spacing:-0.5px;">'+Number(th).toFixed(1)+' h</strong>' +
                    '</div>' +
                '</div>' +
                '<div style="display:flex; gap:12px;">' +
                    '<div class="box" style="flex:1; border:1px solid rgba(16,185,129,0.2); background:rgba(16,185,129,0.05); padding:16px; border-radius:20px; box-shadow:inset 0 2px 10px rgba(0,0,0,0.2);">' +
                        '<span style="color:#10b981; font-size:0.65rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">DYSTANS PŁATNY</span>' +
                        '<strong style="color:#fff; font-size:1.3rem; display:block; margin-top:6px; letter-spacing:-0.5px;">'+Number(pkSum).toFixed(1)+' km</strong>' +
                    '</div>' +
                    '<div class="box" style="flex:1; border:1px solid rgba(239,68,68,0.2); background:rgba(239,68,68,0.05); padding:16px; border-radius:20px; box-shadow:inset 0 2px 10px rgba(0,0,0,0.2);">' +
                        '<span style="color:#ef4444; font-size:0.65rem; text-transform:uppercase; font-weight:800; letter-spacing:0.5px;">PUSTE PRZEBIEGI</span>' +
                        '<strong style="color:#fff; font-size:1.3rem; display:block; margin-top:6px; letter-spacing:-0.5px;">'+Number(emptyKSum).toFixed(1)+' km</strong>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            
            proBannerHtml +
            pAndLHtml +
            historyLogHtml +
            '<div style="height:140px; width:100%; clear:both;"></div>' + nav;
        }
    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:50px 20px; text-align:center; color:white;"><h3>Błąd krytyczny w Panelu (taxi_tab_panel.js)</h3><p style="color:#ef4444; font-family:monospace; margin-bottom:20px;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; width:100%; box-shadow:0 10px 20px rgba(255,255,255,0.2);" onclick="window.location.reload()">ODŚWIEŻ APLIKACJĘ</button></div>';
        }
    }
};
