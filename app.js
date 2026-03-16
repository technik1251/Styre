// ==========================================
// PLIK: app.js - GŁÓWNY SILNIK, LOGOWANIE I KREATOR
// ==========================================

if (typeof window.db === 'undefined') {
    window.db = {};
}

const APP = document.getElementById('app');
window.wData = window.wData || {};

// 🛡️ KULOODPORNY BEZPIECZNIK BAZY DANYCH
window.patchDb = function(data) {
    let d = data || {};
    if(!d.home) d.home = { trans: [], accs: [{id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0}], budgets: {}, recurring: [], piggy: [], loans: [], debts: [], members: [d.userName || 'Domownik'] };
    if(!d.home.trans) d.home.trans = [];
    if(!d.home.accs) d.home.accs = [{id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0}];
    if(!d.home.loans) d.home.loans = [];
    if(!d.home.piggy) d.home.piggy = [];
    if(!d.home.debts) d.home.debts = [];
    if(!d.home.recurring) d.home.recurring = [];
    if(!d.drv) d.drv = { trans: [], shifts: [], clients: [], fuel: [], exp: [], h: [], cfg: { tax: 0.085, cardF: 0.015, bC:0, cC:0, eC:0, goal: 350 }, q: {s: 8, w: 60, t1: 3.5, t2: 4.5, t3: 6, t4: 8} };
    return d;
};

// 🛠️ NARZĘDZIA RATUNKOWE
window.safeVal = function(id, def=0) {
    let el = document.getElementById(id);
    if(!el) return def;
    let v = parseFloat(el.value);
    return isNaN(v) ? def : v;
};

window.save = function() {
    if (typeof window.db !== 'undefined') {
        localStorage.setItem('styre_v101_db', JSON.stringify(window.db));
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser && window.db.init) {
            if(firebase.firestore) {
                firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set(window.db).catch(e => console.log('Chmura w tle: ', e));
            }
        }
    }
};

window.onerror = function(msg, url, lineNo) { 
    let fn = url ? url.substring(url.lastIndexOf('/') + 1) : 'Nieznany plik'; 
    if(APP) APP.innerHTML = `<div style="padding:20px;text-align:center;margin-top:50px;"><div style="font-size:4rem;margin-bottom:10px;">🐛</div><h2 style="color:var(--danger);">Błąd Kodu!</h2><div style="background:#000; padding:15px; border-radius:12px; text-align:left; font-family:monospace; font-size:0.8rem; color:#fff;">${msg}<br>Plik: ${fn}<br>Linia: ${lineNo}</div><button class="btn" style="background:rgba(255,255,255,0.1); margin-top:20px;" onclick="localStorage.clear();location.reload()">RESTART (CZYŚĆ PAMIĘĆ)</button></div>`; 
    return false; 
};

window.render = function() { 
    try { 
        window.db = window.patchDb(window.db);
        
        if(!window.db.init) return window.rWiz(); 
        
        if(window.dSessionInit) window.dSessionInit(); 
        if(window.db.role === 'drv' && window.rDrv) return window.rDrv(); 
        if(window.db.role === 'home' && window.rHome) { 
            if(window.hCheckAuto) window.hCheckAuto(); 
            return window.rHome(); 
        } 
        return window.rWiz(); 
    } catch(err) { 
        console.error(err);
        if(APP) APP.innerHTML = `<div style="padding:20px;text-align:center;margin-top:50px;"><div style="font-size:4rem;margin-bottom:10px;">🚨</div><h2 style="color:var(--danger)">Krytyczny Błąd Interfejsu</h2><p style="color:var(--muted);font-size:0.85rem;">${err.message}</p><button class="btn btn-danger" style="margin-top:30px;padding:20px;" onclick="localStorage.clear();location.reload();">TWARDY RESET APLIKACJI</button></div>`; 
    } 
}

window.wS = function(id) { document.querySelectorAll('.wiz-screen').forEach(e=>e.classList.remove('active')); let t = document.getElementById(id); if(t) t.classList.add('active'); window.scrollTo(0,0); }

window.saveNameAndNext = function() {
    let nameInp = document.getElementById('w-guest-name');
    window.db.userName = nameInp ? (nameInp.value.trim() || 'Gość') : 'Gość';
    window.save();
    window.wS('w-profile');
};

window.wMainProfile = function(prof) { 
    window.wData.mainProfile = prof; 
    window.db = window.patchDb(window.db);
    
    // Sprawdzamy, czy dany profil był już skonfigurowany w 100%
    let taxiReady = (window.db.drv && window.db.drv.plat);
    let homeReady = (window.db.userName);

    if (prof === 'driver' && taxiReady) {
        window.db.mainProfile = prof;
        window.db.role = 'drv';
        window.db.tab = 'term';
        window.db.init = true;
        window.save();
        return window.render();
    }

    if (prof === 'home' && homeReady && window.db.home && window.db.home.members && window.db.home.members.length > 0) {
        window.db.mainProfile = prof;
        window.db.role = 'home';
        window.db.tab = 'dash';
        window.db.init = true;
        window.save();
        return window.render();
    }
    
    // Jeśli nie są gotowe, wymuś konfigurację:
    if(prof==='driver') window.wS('w-d1'); else window.wS('w-home'); 
}

window.dW = function(cat, val, el) { window.wData[cat] = val; el.parentElement.querySelectorAll('.opt-card').forEach(c=>{ c.style.borderColor='rgba(255,255,255,0.05)'; c.classList.remove('selected'); }); el.style.borderColor='var(--driver)'; el.classList.add('selected'); if(cat==='p') { let elB = document.getElementById('wd-b'); if(elB) elB.style.display = (val === 'corp') ? 'block' : 'none'; } if(cat==='c') { let elC = document.getElementById('wd-c'); if(elC) elC.style.display = (val === 'own') ? 'none' : 'block'; } if(cat==='e') { let ep = document.getElementById('wd-e-p'); let ej = document.getElementById('wd-e-j'); if(ep) ep.style.display = (val === 'partner') ? 'block' : 'none'; if(ej) ej.style.display = (val === 'jdg') ? 'block' : 'none'; } }
window.dTogglePType = function(prefix) { let elT = document.getElementById(`${prefix}-p-type`); let val = elT ? elT.value : 'flat'; let flatBox = document.getElementById(`${prefix}-p-flat-box`); let pctBox = document.getElementById(`${prefix}-p-pct-box`); if(flatBox) flatBox.style.display = (val === 'flat') ? 'flex' : 'none'; if(pctBox) pctBox.style.display = (val === 'pct') ? 'block' : 'none'; }

window.dFin = function() { 
    window.db = window.patchDb(window.db); 
    window.db.mainProfile = window.wData.mainProfile || 'driver'; 
    window.db.drv.plat = window.wData.p; window.db.drv.carType = window.wData.c; window.db.drv.emp = window.wData.e; 
    let b = window.wData.p === 'corp' ? window.safeVal('wd-b-v') : 0; let bPer = document.getElementById('wd-b-period') ? document.getElementById('wd-b-period').value : 'month';
    let c = window.wData.c === 'own' ? 0 : window.safeVal('wd-c-v'); let cType = window.wData.c === 'own' ? 'month' : (document.getElementById('wd-c-type') ? document.getElementById('wd-c-type').value : 'month');
    let e = 0, eTy = 'flat', ePct = 0, ePer = 'month'; 
    if(window.wData.e === 'partner') { eTy = document.getElementById('wd-p-type') ? document.getElementById('wd-p-type').value : 'flat'; if(eTy === 'flat') { e = window.safeVal('wd-p-v'); ePer = document.getElementById('wd-p-period') ? document.getElementById('wd-p-period').value : 'week'; } else { ePct = window.safeVal('wd-p-pct') / 100; } } else { e = window.safeVal('wd-j-v'); ePer = document.getElementById('wd-j-period') ? document.getElementById('wd-j-period').value : 'month'; } 
    window.db.drv.cfg.bC = b; window.db.drv.cfg.bPeriod = bPer; window.db.drv.cfg.cC = c; window.db.drv.cfg.cType = cType; 
    window.db.drv.cfg.eC = e; window.db.drv.cfg.eType = eTy; window.db.drv.cfg.ePct = ePct; window.db.drv.cfg.ePeriod = ePer; window.db.drv.cfg.iC = 0; window.db.drv.cfg.iPeriod = 'month';
    window.db.drv.cfg.fix = 0; window.db.drv.cfg.tax = window.safeVal('wd-tx-v', 8.5) / 100; window.db.drv.cfg.cardF = 0.015; window.db.drv.cfg.goal = 350;
    window.db.role = 'drv'; window.db.tab = 'term'; window.db.init = true; window.save(); if(window.dSessionInit) window.dSessionInit(); window.render(); 
}

window.hFin = function() { 
    window.db = window.patchDb(window.db); 
    window.db.mainProfile = 'home'; let nameEl = document.getElementById('w-name-home'); window.db.userName = nameEl ? (nameEl.value || 'Domownik') : window.db.userName; 
    if(!window.db.home.members.includes(window.db.userName)) window.db.home.members.unshift(window.db.userName);
    window.db.role = 'home'; window.db.tab = 'dash'; window.db.init = true; window.save(); window.render(); 
}

// --- INTELIGENTNE LOGOWANIE GOOGLE ---
window.loginWithGoogle = function() {
    if (typeof firebase === 'undefined') {
        if(window.sysAlert) return window.sysAlert('Brak połączenia', 'Zaczekaj sekundę na biblioteki Google.', 'warning');
        return alert("Poczekaj...");
    }
    
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyADA7FPv6xEZNg0_WI_NlBiZLpYYv-g61o",
            authDomain: "styreos.firebaseapp.com",
            projectId: "styreos",
            storageBucket: "styreos.firebasestorage.app",
            messagingSenderId: "72578059548",
            appId: "1:72578059548:web:441ec96ed92d6f3f37bed9"
        });
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            if (typeof firebase.firestore !== 'undefined') {
                firebase.firestore().collection('users').doc(user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            let cloudData = window.patchDb(doc.data()); 
                            
                            let hasLocalData = false;
                            if (window.db) {
                                if (window.db.drv && window.db.drv.h && window.db.drv.h.length > 0) hasLocalData = true;
                                if (window.db.home && window.db.home.trans && window.db.home.trans.length > 0) hasLocalData = true;
                            }

                            if (hasLocalData) {
                                window.tempCloudData = cloudData;
                                let modalHtml = `
                                <div id="m-conflict" class="modal-overlay" style="z-index:99999;">
                                    <div class="panel" style="width:100%; max-width:350px; text-align:center;">
                                        <div style="font-size:3rem; margin-bottom:10px;">☁️</div>
                                        <h3 style="color:var(--warning); margin-bottom:10px;">Konto odnalezione!</h3>
                                        <p style="font-size:0.85rem; color:var(--muted); margin-bottom:20px; line-height:1.4;">Masz już dane w chmurze, ale pracowałeś też jako Gość na tym telefonie. Co chcesz zachować?</p>
                                        
                                        <button class="btn" style="background:var(--success); color:#000; padding:15px; margin-bottom:10px; font-weight:bold;" onclick="window.resolveConflict('cloud')">
                                            📥 POBIERZ Z CHMURY<br><small style="font-weight:normal;">(Skasuje dane Gościa)</small>
                                        </button>
                                        
                                        <button class="btn" style="background:var(--info); color:#fff; padding:15px; margin-bottom:10px; font-weight:bold;" onclick="window.resolveConflict('local')">
                                            📤 WYŚLIJ DO CHMURY<br><small style="font-weight:normal;">(Zachowa dane Gościa)</small>
                                        </button>
                                    </div>
                                </div>`;
                                document.body.insertAdjacentHTML('beforeend', modalHtml);
                            } else {
                                window.db = cloudData;
                                window.db.init = true;
                                window.save();
                                window.render();
                            }
                        } else {
                            window.db = window.patchDb(window.db); 
                            window.db.userName = window.db.userName || user.displayName.split(' ')[0];
                            window.save(); 
                            if(window.sysAlert) window.sysAlert('Połączono z chmurą!', `Gotowe, ${window.db.userName}. Wybierz profil.`, 'success');
                            window.render(); 
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        if(window.sysAlert) window.sysAlert('Błąd Bazy', `Nie udało się pobrać danych: ${error.message}`, 'error');
                    });
            }
        })
        .catch((error) => {
            if(error.code !== 'auth/popup-closed-by-user') {
                if(window.sysAlert) window.sysAlert('Błąd Logowania', error.message, 'error');
            }
        });
}

window.resolveConflict = function(choice) {
    if (choice === 'cloud') {
        window.db = window.tempCloudData;
    }
    window.db.init = true;
    window.save();
    document.getElementById('m-conflict').remove();
    window.render();
}

window.rWiz = function() {
    let isLogged = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
    let uName = window.db.userName || '';

    APP.innerHTML = `
    <div id="w-main" class="wiz-screen active" style="align-items:center; text-align:center;">
        <div style="width:90px;height:90px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
            <img src="icon-512.png" style="width:100%;height:100%;border-radius:22px;box-shadow:0 10px 25px rgba(0,0,0,0.5);" alt="Logo" onerror="this.outerHTML='<div style=\\'font-size:3rem;\\'>🚀</div>'">
        </div>
        <h1 style="color:#fff; font-size:3.5rem; margin:0; font-weight:900; letter-spacing:-2.5px;">STYRE OS</h1>
        <p style="color:var(--muted); font-size:1.1rem; font-weight:600; margin-top:5px; margin-bottom:40px;">Twój Asystent Finansowy</p>

        <div style="width:100%; max-width:350px;">
            ${isLogged ? `
            <div style="background:rgba(34,197,94,0.1); border:1px solid var(--success); padding:15px; border-radius:12px; margin-bottom:20px;">
                <strong style="color:var(--success); font-size:1.1rem;">☁️ Zalogowano pomyślnie</strong><br>
                <span style="font-size:0.8rem; color:var(--muted);">${firebase.auth().currentUser.displayName}</span>
            </div>
            <button class="btn btn-success" style="padding:15px; font-size:1rem;" onclick="window.wS('w-profile')">DALEJ ➔</button>
            ` : `
            <button class="btn" style="background:#fff; color:#000; box-shadow: 0 4px 15px rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800; padding:15px;" onclick="window.loginWithGoogle()">
                <span style="font-size:1.3rem;">G</span> Zaloguj przez Google
            </button>
            <p style="font-size:0.7rem; color:var(--success); margin-top:10px; margin-bottom:25px;">Zalecane: bezpieczna kopia w chmurze</p>

            <div style="display:flex; align-items:center; margin: 20px 0; color:var(--muted); font-size:0.7rem; text-transform:uppercase; font-weight:bold;">
                <div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div>
                <span style="padding:0 10px;">LUB</span>
                <div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div>
            </div>

            <button class="btn" style="background:transparent; color:var(--muted); border:1px solid rgba(255,255,255,0.2); padding:15px;" onclick="${uName ? `window.wS('w-profile')` : `window.wS('w-name')`}">
                Kontynuuj (Offline)
            </button>
            `}
        </div>
    </div>

    <div id="w-name" class="wiz-screen" style="align-items:center; text-align:center;">
        <div style="width:100%; max-width:350px; margin-top:50px;">
            <h2 style="color:#fff; margin-bottom:5px;">Jak masz na imię?</h2>
            <p style="color:var(--muted); font-size:0.85rem; margin-bottom:30px;">Abyśmy wiedzieli, jak się do Ciebie zwracać.</p>
            
            <input type="text" id="w-guest-name" class="premium-input" placeholder="Wpisz imię..." value="${uName}" style="text-align:center; font-size:1.2rem; padding:15px; margin-bottom:30px;">
            
            <button class="btn btn-info" style="padding:15px;" onclick="window.saveNameAndNext()">POTWIERDŹ</button>
            <button class="btn" style="background:transparent; color:var(--muted); margin-top:10px;" onclick="window.wS('w-main')">Wróć</button>
        </div>
    </div>

    <div id="w-profile" class="wiz-screen" style="align-items:center;">
        <div style="width:100%; max-width:400px; margin-top:30px;">
            <h2 style="color:#fff; text-align:center; margin-bottom:5px;">Wybierz moduł</h2>
            <p style="color:var(--muted); font-size:0.85rem; text-align:center; margin-bottom:30px;">Zawsze możesz przełączać się między nimi.</p>

            <div class="opt-card" style="border-color:rgba(59,130,246,0.3);" onclick="window.wMainProfile('driver')">
                <div class="opt-icon">🚕</div>
                <div class="opt-text"><h3>Kierowca Taxi</h3><p>Utargi, nawigacja GPS, garaż.</p></div>
            </div>
            
            <div class="opt-card" style="border-color:rgba(20,184,166,0.3);" onclick="window.wMainProfile('home')">
                <div class="opt-icon">🏠</div>
                <div class="opt-text"><h3>Budżet Domowy</h3><p>Wydatki, portfele, automaty.</p></div>
            </div>

            <div class="opt-card" style="border-color:rgba(255,255,255,0.05); opacity: 0.6; cursor: pointer; background: rgba(0,0,0,0.3);" onclick="if(window.sysAlert) window.sysAlert('Wkrótce', 'Profil Kurier/Dostawca pojawi się w kolejnych aktualizacjach!', 'info')">
                <div class="opt-icon" style="filter: grayscale(1);">📦</div>
                <div class="opt-text">
                    <h3 style="display:flex; align-items:center; gap:8px;">Kurier / Dostawa <span style="font-size:0.6rem; background:var(--info); color:#fff; padding:2px 6px; border-radius:4px;">WKRÓTCE</span></h3>
                    <p>Paczki, rewirowanie, trasy.</p>
                </div>
            </div>

            <div class="opt-card" style="border-color:rgba(255,255,255,0.05); opacity: 0.6; cursor: pointer; background: rgba(0,0,0,0.3);" onclick="if(window.sysAlert) window.sysAlert('Funkcja PRO', 'Pełny moduł Firma/Spedycja (z KSeF, fakturami i flotą) będzie dostępny w wersji StyreOS PRO!', 'info')">
                <div class="opt-icon" style="filter: grayscale(1);">🚛</div>
                <div class="opt-text">
                    <h3 style="display:flex; align-items:center; gap:8px;">Firma / Spedycja <span style="font-size:0.6rem; background:#a855f7; color:#fff; padding:2px 6px; border-radius:4px;">PRO</span></h3>
                    <p>Zarządzanie flotą, KSeF, faktury.</p>
                </div>
            </div>
        </div>
    </div>

    <div id="w-home" class="wiz-screen">
        <div style="text-align:center; margin-top:50px;">
            <div style="font-size:4rem; margin-bottom:10px;">🏠</div>
            <h2 style="color:var(--life); margin-bottom:10px;">Budżet Gotowy!</h2>
            <p style="color:var(--muted); font-size:0.9rem; margin-bottom:30px;">Twoje finanse w jednym miejscu.</p>
            <button class="btn btn-home" style="padding:15px; max-width:300px; margin:0 auto;" onclick="window.hFin()">WEJDŹ DO BUDŻETU</button>
            <button class="btn" style="background:transparent; color:var(--muted); margin-top:10px;" onclick="window.wS('w-profile')">Wróć</button>
        </div>
    </div>

    <div id="w-d1" class="wiz-screen"><div class="w-title">System Pracy</div><div class="w-sub">Krok 1 z 3</div><p style="color:var(--muted); text-align:center; margin-bottom:15px; font-size:0.9rem;">Jak mamy się do Ciebie zwracać?</p><div class="inp-group" style="margin-bottom:20px;"><input type="text" id="w-name-drv" placeholder="Twoje Imię" class="premium-input" value="${uName}"></div><div class="opt-card selected" onclick="window.dW('p','apps',this)"><div class="opt-icon">📱</div><div class="opt-text"><h3>Aplikacje</h3></div></div><div class="opt-card" onclick="window.dW('p','corp',this)"><div class="opt-icon">📻</div><div class="opt-text"><h3>Korporacja</h3></div></div><div id="wd-b" class="wiz-inputs" style="display:none;"><div class="inp-row"><div class="inp-group"><label>Opłata za bazę (zł)</label><input type="number" id="wd-b-v" placeholder="np. 400"></div><div class="inp-group"><label>Okres</label><select id="wd-b-period"><option value="week">Tydzień</option><option value="month" selected>Miesiąc</option></select></div></div></div><button class="btn btn-driver" style="margin-top:20px;" onclick="window.wS('w-d2')">Dalej</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-profile')">Wróć</button></div>
    
    <div id="w-d2" class="wiz-screen"><div class="w-title">Twoje Auto</div><div class="w-sub">Krok 2 z 3</div><div class="opt-card selected" onclick="window.dW('c','rent',this)"><div class="opt-icon">🤝</div><div class="opt-text"><h3>Wynajem</h3></div></div><div class="opt-card" onclick="window.dW('c','lease',this)"><div class="opt-icon">📝</div><div class="opt-text"><h3>Leasing</h3></div></div><div class="opt-card" onclick="window.dW('c','own',this)"><div class="opt-icon">🚗</div><div class="opt-text"><h3>Własne</h3></div></div><div id="wd-c" style="display:block;"><div class="inp-row"><div class="inp-group"><label>Rata (zł)</label><input type="number" id="wd-c-v"></div><div class="inp-group"><label>Okres</label><select id="wd-c-type"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div></div></div><button class="btn btn-driver" style="margin-top:20px;" onclick="window.wS('w-d3')">Dalej</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-d1')">Wróć</button></div>
    
    <div id="w-d3" class="wiz-screen"><div class="w-title">Koszty Stałe</div><div class="w-sub">Krok 3 z 3</div><div class="opt-card selected" onclick="window.dW('e','partner',this)"><div class="opt-icon">🤝</div><div class="opt-text"><h3>Partner</h3></div></div><div class="opt-card" onclick="window.dW('e','jdg',this)"><div class="opt-icon">💼</div><div class="opt-text"><h3>JDG</h3></div></div><div id="wd-e-p" style="display:block;"><div class="inp-group" style="margin-bottom:10px;"><label>Rodzaj umowy</label><select id="wd-p-type" onchange="window.dTogglePType('wd')"><option value="flat">Stała kwota</option><option value="pct">Procent</option></select></div><div class="inp-row" id="wd-p-flat-box"><div class="inp-group"><label>Kwota (zł)</label><input type="number" id="wd-p-v" placeholder="np. 50"></div><div class="inp-group"><label>Okres</label><select id="wd-p-period"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div></div><div class="inp-group" id="wd-p-pct-box" style="display:none;"><label>Prowizja (%)</label><input type="number" id="wd-p-pct"></div></div><div id="wd-e-j" style="display:none;"><div class="inp-row"><div class="inp-group"><label>ZUS (Kwota zł)</label><input type="number" id="wd-j-v" placeholder="np. 1600"></div><div class="inp-group"><label>Okres</label><select id="wd-j-period"><option value="week">Tydzień</option><option value="month" selected>Miesiąc</option></select></div></div></div><div class="inp-group" style="margin-top:15px;"><label>Podatek (%)</label><input type="number" id="wd-tx-v" value="8.5" step="0.1"></div><button class="btn btn-success" style="margin-top:30px; padding:15px;" onclick="window.dFin()">ZAKOŃCZ I WEJDŹ</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-d2')">Wróć</button></div>
    `;
}

if (typeof firebase !== 'undefined') {
    setTimeout(() => {
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyADA7FPv6xEZNg0_WI_NlBiZLpYYv-g61o",
                authDomain: "styreos.firebaseapp.com",
                projectId: "styreos",
                storageBucket: "styreos.firebasestorage.app",
                messagingSenderId: "72578059548",
                appId: "1:72578059548:web:441ec96ed92d6f3f37bed9"
            });
        }
        if(firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                let wiz = document.getElementById('w-main');
                if (user && wiz && wiz.classList.contains('active')) {
                    window.render(); 
                }
            });
        }
    }, 1000);
}

window.render();
