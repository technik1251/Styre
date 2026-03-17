// ==========================================
// PLIK: app.js - GŁÓWNY SILNIK I LAUNCHER
// ==========================================

// 1. Zabezpieczenie bazy lokalnej (Anti-Amnezja)
if (typeof window.db === 'undefined') {
    window.db = {};
}
let savedLocal = localStorage.getItem('styre_v101_db');
if (savedLocal) {
    try { window.db = JSON.parse(savedLocal); } catch(e) { window.db = {}; }
}

const APP = document.getElementById('app');
window.wData = window.wData || {};

// 2. Wstrzykiwanie "Bezpieczników" do bazy
window.patchDb = function(data) {
    let d = data || {};
    
    // Bezpieczniki Budżetu Domowego
    if(!d.home) d.home = { trans: [], accs: [{id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0}], budgets: {}, recurring: [], piggy: [], loans: [], debts: [], members: [] };
    if(!d.home.trans) d.home.trans = [];
    if(!d.home.accs) d.home.accs = [{id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0}];
    if(!d.home.loans) d.home.loans = [];
    if(!d.home.piggy) d.home.piggy = [];
    if(!d.home.debts) d.home.debts = [];
    if(!d.home.recurring) d.home.recurring = [];
    if(!Array.isArray(d.home.members)) d.home.members = [];
    if(d.home.members.length === 0) d.home.members.push(d.userName || 'Domownik');
    
    // Bezpieczniki Panelu Taxi
    if(!d.drv) d.drv = { trans: [], shifts: [], clients: [], fuel: [], exp: [], h: [], cfg: { tax: 0.085, cardF: 0.015, bC:0, cC:0, eC:0, goal: 350 }, q: {s: 8, w: 60, t1: 3.5, t2: 4.5, t3: 6, t4: 8} };
    if(!d.drv.cfg) d.drv.cfg = { tax: 0.085, cardF: 0.015, bC:0, cC:0, eC:0, goal: 350 };
    if(d.drv.emp === undefined) d.drv.emp = 'partner';
    if(d.drv.plat === undefined) d.drv.plat = 'apps';
    if(d.drv.carType === undefined) d.drv.carType = 'rent';
    
    // Globalne zmienne użytkownika
    if(!d.userName) d.userName = "Użytkownik";
    if (d.init && d.setupDone === undefined) d.setupDone = true;

    return d;
};

// 3. Narzędzia Pomocnicze
window.safeVal = function(id, def=0) {
    let el = document.getElementById(id);
    if(!el) return def;
    let v = parseFloat(el.value);
    return isNaN(v) ? def : v;
};

window.save = function() {
    if (typeof window.db !== 'undefined') {
        window.db = window.patchDb(window.db); 
        localStorage.setItem('styre_v101_db', JSON.stringify(window.db));
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser && window.db.setupDone) {
            if(firebase.firestore) {
                firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set(window.db).catch(e => console.log('Błąd zapisu w chmurze: ', e));
            }
        }
    }
};

window.onerror = function(msg, url, lineNo) { 
    let fn = url ? url.substring(url.lastIndexOf('/') + 1) : 'Nieznany plik'; 
    if(APP) APP.innerHTML = `<div style="padding:20px;text-align:center;margin-top:50px;"><div style="font-size:4rem;margin-bottom:10px;">🐛</div><h2 style="color:var(--danger);">Błąd Kodu!</h2><div style="background:#000; padding:15px; border-radius:12px; text-align:left; font-family:monospace; font-size:0.8rem; color:#fff;">${msg}<br>Plik: ${fn}<br>Linia: ${lineNo}</div><button class="btn" style="background:rgba(255,255,255,0.1); margin-top:20px;" onclick="localStorage.clear();location.reload()">RESTART (CZYŚĆ PAMIĘĆ)</button></div>`; 
    return false; 
};

// ==========================================
// 4. GLOBALNE FUNKCJE NAWIGACYJNE
// ==========================================

window.switchTab = function(t) { 
    if (window.db) window.db.tab = t; 
    window.save(); 
    window.render(); 
    window.scrollTo(0,0); 
};

window.openSwitcher = function() {
    let el = document.getElementById('m-switcher');
    let btns = document.getElementById('switcher-btns');
    if(el && btns) {
        btns.innerHTML = `
            <button class="btn" style="background:var(--driver); color:#000; padding:15px; font-weight:900; margin-bottom:10px; font-size:1.1rem; box-shadow:0 4px 15px rgba(59,130,246,0.3);" onclick="window.db.mainProfile='driver'; window.db.role='drv'; window.db.tab='term'; window.save(); document.getElementById('m-switcher').classList.add('hidden'); window.render();">🚕 PANEL TAXI</button>
            <button class="btn" style="background:var(--life); color:#000; padding:15px; font-weight:900; margin-bottom:15px; font-size:1.1rem; box-shadow:0 4px 15px rgba(20,184,166,0.3);" onclick="window.db.mainProfile='home'; window.db.role='home'; window.db.tab='dash'; window.save(); document.getElementById('m-switcher').classList.add('hidden'); window.render();">🏠 BUDŻET DOMOWY</button>
            <div style="height:1px; background:rgba(255,255,255,0.1); margin: 5px 0 15px 0;"></div>
            <p style="color:var(--muted); font-size:0.7rem; text-transform:uppercase; margin-bottom:10px; font-weight:bold;">Zarządzaj innymi profilami</p>
            <button class="btn" style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:var(--muted); padding:15px; margin-bottom:10px;" onclick="if(window.sysAlert) window.sysAlert('Wkrótce', 'Profil Kurier/Dostawca z zarządzaniem rewirami i stawkami za paczkę pojawi się w kolejnych aktualizacjach!', 'info')">📦 KURIER / DOSTAWA (Wkrótce)</button>
            <button class="btn" style="background:rgba(168, 85, 247, 0.1); border:1px dashed rgba(168, 85, 247, 0.4); color:#a855f7; padding:15px; margin-bottom:10px; font-weight:bold;" onclick="if(window.sysAlert) window.sysAlert('Funkcja PRO', 'Pełny moduł Firma/Spedycja (z KSeF, fakturami i flotą) będzie dostępny w wersji StyreOS PRO!', 'info')">🚛 FIRMA / SPEDYCJA (PRO)</button>
            <div style="height:1px; background:rgba(255,255,255,0.1); margin: 15px 0;"></div>
            <button class="btn" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:12px; font-size:0.85rem; font-weight:bold;" onclick="window.logoutToLauncher()">⚙️ WRÓĆ DO EKRANU STARTOWEGO</button>
            <button class="btn" style="background:transparent; color:var(--muted); margin-top:10px;" onclick="document.getElementById('m-switcher').classList.add('hidden')">ZAMKNIJ</button>
        `;
        el.classList.remove('hidden');
    }
};

window.logoutToLauncher = function() {
    if (window.db) {
        window.db.role = null; 
        window.db.tab = null;
        window.save();
    }
    let switcher = document.getElementById('m-switcher');
    if (switcher) switcher.classList.add('hidden');
    window.render();
};

// ==========================================
// 5. GŁÓWNY ROUTER (RENDER)
// ==========================================

window.render = function() { 
    try { 
        window.db = window.patchDb(window.db);
        
        if(!window.db.setupDone) {
            return window.rWiz(); 
        }
        
        if(window.dSessionInit) window.dSessionInit(); 
        
        if(window.db.role === 'drv') {
            if(window.rDrv) return window.rDrv(); 
            else return window.rLauncher(); 
        }
        if(window.db.role === 'home') {
            if(window.rHome) {
                if(window.hCheckAuto) window.hCheckAuto(); 
                return window.rHome(); 
            } else {
                return window.rLauncher(); 
            }
        }
        
        return window.rLauncher(); 
    } catch(err) { 
        console.error(err);
        if(APP) APP.innerHTML = `<div style="padding:20px;text-align:center;margin-top:50px;"><div style="font-size:4rem;margin-bottom:10px;">🚨</div><h2 style="color:var(--danger)">Krytyczny Błąd Interfejsu</h2><p style="color:var(--muted);font-size:0.85rem;">${err.message}</p><button class="btn btn-danger" style="margin-top:30px;padding:20px;" onclick="localStorage.clear();location.reload();">TWARDY RESET APLIKACJI</button></div>`; 
    } 
}

// ==========================================
// 6. EKRAN LAUNCHERA I KREATORA (WIZARD)
// ==========================================

window.rLauncher = function() {
    let roadmapHtml = `
    <div style="width:100%; max-width:350px; margin-top:25px; text-align:left; background:linear-gradient(145deg, #1e1b4b, #09090b); border:1px solid rgba(139, 92, 246, 0.3); border-radius:16px; padding:20px; box-shadow:0 10px 30px rgba(139, 92, 246, 0.1);">
        <h3 style="color:#c084fc; margin:0 0 15px 0; font-size:1rem; display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:1px;"><span>🚀</span> Wkrótce w StyreOS PRO</h3>
        
        <div style="margin-bottom:15px; border-left:2px solid #8b5cf6; padding-left:10px;">
            <strong style="color:#fff; font-size:0.85rem;">🚕 RideHelper AI & e-Kasa API</strong>
            <p style="color:var(--muted); font-size:0.75rem; margin:4px 0 0; line-height:1.4;">Pływająca nakładka opłacalności zlecenia (Uber/Bolt) oraz auto-zaciąganie kursów z kas RT3000 i centrali.</p>
        </div>
        
        <div style="margin-bottom:15px; border-left:2px solid #14b8a6; padding-left:10px;">
            <strong style="color:#fff; font-size:0.85rem;">🏦 Open Banking (Banki & Budżet)</strong>
            <p style="color:var(--muted); font-size:0.75rem; margin:4px 0 0; line-height:1.4;">Połączenie z bankami. AI samo w locie rozpozna i skategoryzuje transakcje (np. Żabka ➔ Zakupy Spożywcze).</p>
        </div>

        <div style="margin-bottom:15px; border-left:2px solid #ec4899; padding-left:10px;">
            <strong style="color:#fff; font-size:0.85rem;">📸 Inteligentny Skaner Paragonów</strong>
            <p style="color:var(--muted); font-size:0.75rem; margin:4px 0 0; line-height:1.4;">Wystarczy zrobić zdjęcie paragonu, a AI odczyta kwotę, datę i samo wrzuci ją w koszty napraw lub tankowania.</p>
        </div>
        
        <div style="border-left:2px solid #f59e0b; padding-left:10px;">
            <strong style="color:#fff; font-size:0.85rem;">🚛 Moduł Flota / Spedycja</strong>
            <p style="color:var(--muted); font-size:0.75rem; margin:4px 0 0; line-height:1.4;">Obsługa wielu aut i kierowców, fakturowanie, KSeF i pełna automatyczna księgowość firmy transportowej.</p>
        </div>
    </div>
    `;

    APP.innerHTML = `
    <div style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px 20px; text-align:center; background:var(--bg);">
        <div style="width:90px;height:90px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
            <img src="icon-512.png" style="width:100%;height:100%;border-radius:22px;box-shadow:0 10px 25px rgba(0,0,0,0.5);" alt="Logo" onerror="this.outerHTML='<div style=\\'font-size:3rem;\\'>🚀</div>'">
        </div>
        <h1 style="color:#fff; font-size:2.2rem; margin-bottom:5px;">Cześć, ${window.db.userName}! 👋</h1>
        <p style="color:var(--muted); margin-bottom:30px; font-size:0.95rem;">Wybierz swój pulpit roboczy</p>

        <div style="width:100%; max-width:350px; display:flex; flex-direction:column; gap:15px;">
            <button class="btn" style="background:var(--driver); color:#000; padding:20px; font-size:1.2rem; font-weight:900; box-shadow:0 8px 25px rgba(59,130,246,0.3); display:flex; align-items:center; justify-content:center; gap:12px; border-radius:16px;" onclick="window.db.role='drv'; window.db.tab='term'; window.save(); window.render();">
                <span style="font-size:1.6rem;">🚕</span> PANEL TAXI
            </button>
            <button class="btn" style="background:var(--life); color:#000; padding:20px; font-size:1.2rem; font-weight:900; box-shadow:0 8px 25px rgba(20,184,166,0.3); display:flex; align-items:center; justify-content:center; gap:12px; border-radius:16px;" onclick="window.db.role='home'; window.db.tab='dash'; window.save(); window.render();">
                <span style="font-size:1.6rem;">🏠</span> BUDŻET DOMOWY
            </button>
            <button class="btn" style="background:rgba(255,255,255,0.05); color:var(--muted); border:1px dashed rgba(255,255,255,0.2); padding:15px; font-size:1rem; font-weight:bold; border-radius:16px;" onclick="if(window.sysAlert) window.sysAlert('Wkrótce', 'Profil Kurier/Dostawca w kolejnej aktualizacji!', 'info')">
                📦 KURIER / DOSTAWA
            </button>
        </div>

        ${roadmapHtml}

        <div style="margin-top:40px; display:flex; flex-direction:column; gap:15px; align-items:center;">
            <button style="background:transparent; border:none; color:var(--danger); font-size:0.8rem; text-decoration:underline; cursor:pointer;" onclick="if(confirm('Chcesz zresetować konfigurację i zacząć od nowa?')){ localStorage.clear(); location.reload(); }">Wyczyść dane i zresetuj aplikację</button>
        </div>
    </div>
    `;
}

window.wS = function(id) { document.querySelectorAll('.wiz-screen').forEach(e=>e.classList.remove('active')); let t = document.getElementById(id); if(t) t.classList.add('active'); window.scrollTo(0,0); }

window.saveNameAndNext = function() {
    let nameInp = document.getElementById('w-guest-name');
    window.db.userName = nameInp ? (nameInp.value.trim() || 'Gość') : 'Gość';
    if (!window.db.home.members.includes(window.db.userName)) {
        window.db.home.members.unshift(window.db.userName);
    }
    window.save();
    window.wS('w-modules');
};

window.wSetupChoice = function(choice) {
    if (choice === 'taxi') {
        window.wS('w-d1'); 
    } else {
        window.finishSetup(false);
    }
}

window.dW = function(cat, val, el) { window.wData[cat] = val; el.parentElement.querySelectorAll('.opt-card').forEach(c=>{ c.style.borderColor='rgba(255,255,255,0.05)'; c.classList.remove('selected'); }); el.style.borderColor='var(--driver)'; el.classList.add('selected'); if(cat==='p') { let elB = document.getElementById('wd-b'); if(elB) elB.style.display = (val === 'corp') ? 'block' : 'none'; } if(cat==='c') { let elC = document.getElementById('wd-c'); if(elC) elC.style.display = (val === 'own') ? 'none' : 'block'; } if(cat==='e') { let ep = document.getElementById('wd-e-p'); let ej = document.getElementById('wd-e-j'); if(ep) ep.style.display = (val === 'partner') ? 'block' : 'none'; if(ej) ej.style.display = (val === 'jdg') ? 'block' : 'none'; } }
window.dTogglePType = function(prefix) { let elT = document.getElementById(`${prefix}-p-type`); let val = elT ? elT.value : 'flat'; let flatBox = document.getElementById(`${prefix}-p-flat-box`); let pctBox = document.getElementById(`${prefix}-p-pct-box`); if(flatBox) flatBox.style.display = (val === 'flat') ? 'flex' : 'none'; if(pctBox) pctBox.style.display = (val === 'pct') ? 'block' : 'none'; }

window.finishSetup = function(fromTaxi = true) { 
    try {
        window.db = window.patchDb(window.db); 
        
        if (fromTaxi) {
            window.db.drv.plat = window.wData.p || 'apps'; 
            window.db.drv.carType = window.wData.c || 'rent'; 
            window.db.drv.emp = window.wData.e || 'partner'; 
            
            let b = window.db.drv.plat === 'corp' ? window.safeVal('wd-b-v') : 0; 
            let bPer = document.getElementById('wd-b-period') ? document.getElementById('wd-b-period').value : 'month';
            let c = window.db.drv.carType === 'own' ? 0 : window.safeVal('wd-c-v'); 
            let cType = window.db.drv.carType === 'own' ? 'month' : (document.getElementById('wd-c-type') ? document.getElementById('wd-c-type').value : 'month');
            let e = 0, eTy = 'flat', ePct = 0, ePer = 'month'; 
            
            if(window.db.drv.emp === 'partner') { 
                eTy = document.getElementById('wd-p-type') ? document.getElementById('wd-p-type').value : 'flat'; 
                if(eTy === 'flat') { e = window.safeVal('wd-p-v'); ePer = document.getElementById('wd-p-period') ? document.getElementById('wd-p-period').value : 'week'; } 
                else { ePct = window.safeVal('wd-p-pct') / 100; } 
            } else { 
                e = window.safeVal('wd-j-v'); ePer = document.getElementById('wd-j-period') ? document.getElementById('wd-j-period').value : 'month'; 
            } 
            
            window.db.drv.cfg.bC = b; window.db.drv.cfg.bPeriod = bPer; window.db.drv.cfg.cC = c; window.db.drv.cfg.cType = cType; 
            window.db.drv.cfg.eC = e; window.db.drv.cfg.eType = eTy; window.db.drv.cfg.ePct = ePct || 0; window.db.drv.cfg.ePeriod = ePer; window.db.drv.cfg.iC = 0; window.db.drv.cfg.iPeriod = 'month';
            window.db.drv.cfg.tax = window.safeVal('wd-tx-v', 8.5) / 100;
        }

        window.db.setupDone = true; 
        window.db.init = true; 
        window.db.role = null; 
        
        window.save(); 
        window.render(); 
    } catch(err) {
        alert("Błąd podczas konfiguracji: " + err.message);
    }
}

// --- GOOGLE LOGIN ---
window.loginWithGoogle = function() {
    if (typeof firebase === 'undefined') {
        if(window.sysAlert) return window.sysAlert('Brak połączenia', 'Zaczekaj sekundę na biblioteki Google.', 'warning');
        return alert("Poczekaj...");
    }
    if (!firebase.apps.length) {
        firebase.initializeApp({ apiKey: "AIzaSyADA7FPv6xEZNg0_WI_NlBiZLpYYv-g61o", authDomain: "styreos.firebaseapp.com", projectId: "styreos", storageBucket: "styreos.firebasestorage.app", messagingSenderId: "72578059548", appId: "1:72578059548:web:441ec96ed92d6f3f37bed9" });
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
        const user = result.user;
        if (typeof firebase.firestore !== 'undefined') {
            firebase.firestore().collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    let cloudData = window.patchDb(doc.data()); 
                    let hasLocalData = false;
                    if (window.db && window.db.setupDone) {
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
                                <button class="btn" style="background:var(--success); color:#000; padding:15px; margin-bottom:10px; font-weight:bold;" onclick="window.resolveConflict('cloud')">📥 POBIERZ Z CHMURY<br><small style="font-weight:normal;">(Skasuje dane Gościa)</small></button>
                                <button class="btn" style="background:var(--info); color:#fff; padding:15px; margin-bottom:10px; font-weight:bold;" onclick="window.resolveConflict('local')">📤 WYŚLIJ DO CHMURY<br><small style="font-weight:normal;">(Zachowa dane Gościa)</small></button>
                            </div>
                        </div>`;
                        document.body.insertAdjacentHTML('beforeend', modalHtml);
                    } else {
                        window.db = cloudData;
                        window.db.setupDone = true;
                        window.db.role = null;
                        window.save();
                        window.render();
                    }
                } else {
                    window.db = window.patchDb(window.db); 
                    window.db.userName = window.db.userName || user.displayName.split(' ')[0];
                    window.save(); 
                    window.wS('w-modules');
                }
            }).catch((error) => {
                console.error(error);
                if(window.sysAlert) window.sysAlert('Błąd Bazy', `Nie udało się pobrać danych: ${error.message}`, 'error');
            });
        }
    }).catch((error) => {
        if(error.code !== 'auth/popup-closed-by-user') {
            if(window.sysAlert) window.sysAlert('Błąd Logowania', error.message, 'error');
        }
    });
}

window.resolveConflict = function(choice) {
    if (choice === 'cloud') { window.db = window.tempCloudData; }
    window.db.setupDone = true;
    window.db.role = null; 
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
            <button class="btn" style="background:#fff; color:#000; box-shadow: 0 4px 15px rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800; padding:15px;" onclick="window.loginWithGoogle()"><span style="font-size:1.3rem;">G</span> Zaloguj przez Google</button>
            <p style="font-size:0.7rem; color:var(--success); margin-top:10px; margin-bottom:25px;">Zalecane: bezpieczna kopia w chmurze</p>
            <div style="display:flex; align-items:center; margin: 20px 0; color:var(--muted); font-size:0.7rem; text-transform:uppercase; font-weight:bold;"><div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div><span style="padding:0 10px;">LUB</span><div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div></div>
            <button class="btn" style="background:transparent; color:var(--muted); border:1px solid rgba(255,255,255,0.2); padding:15px;" onclick="window.wS('w-name')">Rozpocznij (Konto Offline)</button>
        </div>
    </div>
    <div id="w-name" class="wiz-screen" style="align-items:center; text-align:center;">
        <div style="width:100%; max-width:350px; margin-top:50px;">
            <h2 style="color:#fff; margin-bottom:5px;">Jak masz na imię?</h2>
            <p style="color:var(--muted); font-size:0.85rem; margin-bottom:30px;">Abyśmy wiedzieli, jak się do Ciebie zwracać.</p>
            <input type="text" id="w-guest-name" class="premium-input" placeholder="Wpisz imię..." value="${uName}" style="text-align:center; font-size:1.2rem; padding:15px; margin-bottom:30px;">
            <button class="btn btn-info" style="padding:15px;" onclick="window.saveNameAndNext()">DALEJ ➔</button>
            <button class="btn" style="background:transparent; color:var(--muted); margin-top:10px;" onclick="window.wS('w-main')">Wróć</button>
        </div>
    </div>
    <div id="w-modules" class="wiz-screen" style="align-items:center; text-align:center;">
        <div style="width:100%; max-width:380px; margin-top:30px;">
            <h2 style="color:#fff; margin-bottom:5px;">Konfiguracja Konta</h2>
            <p style="color:var(--muted); font-size:0.85rem; margin-bottom:30px;">Z czego będziesz korzystać w StyreOS?</p>
            <div class="opt-card" style="border-color:rgba(59,130,246,0.5); background:rgba(59,130,246,0.05); text-align:left;" onclick="window.wSetupChoice('taxi')"><div class="opt-icon">🚕</div><div class="opt-text"><h3 style="color:var(--driver)">Jestem Kierowcą Taxi</h3><p style="font-size:0.75rem;">Skonfiguruj auto, prowizje i korporację</p></div></div>
            <div class="opt-card" style="border-color:rgba(20,184,166,0.5); background:rgba(20,184,166,0.05); text-align:left;" onclick="window.wSetupChoice('home')"><div class="opt-icon">🏠</div><div class="opt-text"><h3 style="color:var(--life)">Tylko Budżet Domowy</h3><p style="font-size:0.75rem;">Zarządzaj domem, pomiń ustawienia Taxi</p></div></div>
            <button class="btn" style="background:transparent; color:var(--muted); margin-top:20px;" onclick="window.wS('w-name')">Wróć</button>
        </div>
    </div>
    <div id="w-d1" class="wiz-screen"><div class="w-title">System Pracy</div><div class="w-sub">Krok 1 z 3</div><div class="opt-card selected" onclick="window.dW('p','apps',this)"><div class="opt-icon">📱</div><div class="opt-text"><h3>Aplikacje</h3></div></div><div class="opt-card" onclick="window.dW('p','corp',this)"><div class="opt-icon">📻</div><div class="opt-text"><h3>Korporacja</h3></div></div><div id="wd-b" class="wiz-inputs" style="display:none;"><div class="inp-row"><div class="inp-group"><label>Opłata za bazę (zł)</label><input type="number" id="wd-b-v" placeholder="np. 400"></div><div class="inp-group"><label>Okres</label><select id="wd-b-period"><option value="week">Tydzień</option><option value="month" selected>Miesiąc</option></select></div></div></div><button class="btn btn-driver" style="margin-top:20px;" onclick="window.wS('w-d2')">Dalej</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-modules')">Wróć</button></div>
    <div id="w-d2" class="wiz-screen"><div class="w-title">Twoje Auto</div><div class="w-sub">Krok 2 z 3</div><div class="opt-card selected" onclick="window.dW('c','rent',this)"><div class="opt-icon">🤝</div><div class="opt-text"><h3>Wynajem</h3></div></div><div class="opt-card" onclick="window.dW('c','lease',this)"><div class="opt-icon">📝</div><div class="opt-text"><h3>Leasing</h3></div></div><div class="opt-card" onclick="window.dW('c','own',this)"><div class="opt-icon">🚗</div><div class="opt-text"><h3>Własne</h3></div></div><div id="wd-c" style="display:block;"><div class="inp-row"><div class="inp-group"><label>Rata (zł)</label><input type="number" id="wd-c-v"></div><div class="inp-group"><label>Okres</label><select id="wd-c-type"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div></div></div><button class="btn btn-driver" style="margin-top:20px;" onclick="window.wS('w-d3')">Dalej</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-d1')">Wróć</button></div>
    <div id="w-d3" class="wiz-screen"><div class="w-title">Koszty Stałe</div><div class="w-sub">Krok 3 z 3</div><div class="opt-card selected" onclick="window.dW('e','partner',this)"><div class="opt-icon">🤝</div><div class="opt-text"><h3>Partner</h3></div></div><div class="opt-card" onclick="window.dW('e','jdg',this)"><div class="opt-icon">💼</div><div class="opt-text"><h3>JDG</h3></div></div><div id="wd-e-p" style="display:block;"><div class="inp-group" style="margin-bottom:10px;"><label>Rodzaj umowy</label><select id="wd-p-type" onchange="window.dTogglePType('wd')"><option value="flat">Stała kwota</option><option value="pct">Procent</option></select></div><div class="inp-row" id="wd-p-flat-box"><div class="inp-group"><label>Kwota (zł)</label><input type="number" id="wd-p-v" placeholder="np. 50"></div><div class="inp-group"><label>Okres</label><select id="wd-p-period"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div></div><div class="inp-group" id="wd-p-pct-box" style="display:none;"><label>Prowizja (%)</label><input type="number" id="wd-p-pct"></div></div><div id="wd-e-j" style="display:none;"><div class="inp-row"><div class="inp-group"><label>ZUS (Kwota zł)</label><input type="number" id="wd-j-v" placeholder="np. 1600"></div><div class="inp-group"><label>Okres</label><select id="wd-j-period"><option value="week">Tydzień</option><option value="month" selected>Miesiąc</option></select></div></div></div><div class="inp-group" style="margin-top:15px;"><label>Podatek (%)</label><input type="number" id="wd-tx-v" value="8.5" step="0.1"></div><button class="btn btn-success" style="margin-top:30px; padding:15px;" onclick="window.finishSetup(true)">ZAKOŃCZ I WEJDŹ</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-d2')">Wróć</button></div>
    `;
}

if (typeof firebase !== 'undefined') {
    setTimeout(() => {
        if (!firebase.apps.length) {
            firebase.initializeApp({ apiKey: "AIzaSyADA7FPv6xEZNg0_WI_NlBiZLpYYv-g61o", authDomain: "styreos.firebaseapp.com", projectId: "styreos", storageBucket: "styreos.firebasestorage.app", messagingSenderId: "72578059548", appId: "1:72578059548:web:441ec96ed92d6f3f37bed9" });
        }
        if(firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => { let wiz = document.getElementById('w-main'); if (user && wiz && wiz.classList.contains('active')) { window.render(); } });
        }
    }, 1000);
}

window.render();
