// ==========================================
// PLIK: app.js - GŁÓWNY SILNIK I LAUNCHER (Ultra-Premium Crystal Edition)
// ==========================================

// 1. Zabezpieczenia Antypirackie
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73) || (e.ctrlKey && e.shiftKey && e.keyCode === 74) || (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault(); return false;
    }
});

// ==========================================
// INICJALIZACJA FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyADA7FPv6xEZNg0_WI_Nl8iZLpYYv-g61o",
  authDomain: "styreos.firebaseapp.com",
  projectId: "styreos",
  storageBucket: "styreos.firebasestorage.app",
  messagingSenderId: "72578059548",
  appId: "1:72578059548:web:441ec96ed92d6f3f37bed9"
};

// Pancerna Inicjalizacja
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

// 2. Zabezpieczenie bazy lokalnej (Anti-Amnezja)
if (typeof window.db === 'undefined') window.db = {};
let savedLocal = localStorage.getItem('styre_v101_db');
if (savedLocal) {
    try { window.db = JSON.parse(savedLocal); } catch(e) { window.db = {}; }
}

const APP = document.getElementById('app');
window.wData = window.wData || {};

// 3. Wstrzykiwanie "Bezpieczników" do bazy (Zgodność z nowym systemem kosztów)
window.patchDb = function(data) {
    let d = data || {};
    
    if(!d.userName) d.userName = "Użytkownik";
    
    // Bezpieczniki Budżetu Domowego
    if(!d.home) d.home = { trans: [], accs: [{id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0}], budgets: {}, recurring: [], piggy: [], loans: [], debts: [], members: [] };
    if(!d.home.trans) d.home.trans = [];
    if(!d.home.accs) d.home.accs = [{id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0}];
    if(!d.home.loans) d.home.loans = [];
    if(!d.home.piggy) d.home.piggy = [];
    if(!d.home.debts) d.home.debts = [];
    if(!d.home.recurring) d.home.recurring = [];
    if(!Array.isArray(d.home.members)) d.home.members = [];
    
    if(d.home.members.length === 0) d.home.members.push(d.userName);
    
    d.home.loans.forEach(l => {
        if(l.totalInst === undefined) l.totalInst = l.installmentsLeft || 0;
        if(l.startDate === undefined) l.startDate = new Date().toISOString().substring(0,10);
        if(l.minPayPct === undefined) l.minPayPct = 5;
        if(l.declaredPay === undefined) l.declaredPay = '100';
    });

    // Bezpieczniki Panelu Taxi (Nowe, dynamiczne koszty)
    if(!d.drv) d.drv = { trans: [], shifts: [], clients: [], fuel: [], exp: [], h: [], cfg: {}, q: {s: 9, w: 39, t1: 3.2, t2: 4.0, t3: 6.4, t4: 8.0} };
    if(!d.drv.cfg) d.drv.cfg = {};
    
    if(d.drv.cfg.tax === undefined) d.drv.cfg.tax = 0.085;
    if(d.drv.cfg.cardF === undefined) d.drv.cfg.cardF = 0.015;
    if(d.drv.cfg.voucherF === undefined) d.drv.cfg.voucherF = 0.0;
    
    if(d.drv.cfg.carRent === undefined) d.drv.cfg.carRent = 0;
    if(d.drv.cfg.carRentPeriod === undefined) d.drv.cfg.carRentPeriod = 'week';
    if(d.drv.cfg.zus === undefined) d.drv.cfg.zus = 0;
    if(d.drv.cfg.zusPeriod === undefined) d.drv.cfg.zusPeriod = 'month';
    if(d.drv.cfg.eFix === undefined) d.drv.cfg.eFix = 0;
    if(d.drv.cfg.ePeriod === undefined) d.drv.cfg.ePeriod = 'week';
    if(d.drv.cfg.ePct === undefined) d.drv.cfg.ePct = 0;
    if(d.drv.cfg.fixedDaily === undefined) d.drv.cfg.fixedDaily = 0;
    if(d.drv.cfg.fixedOtherPeriod === undefined) d.drv.cfg.fixedOtherPeriod = 'day';

    if(d.drv.cfg.goalBrutto === undefined) d.drv.cfg.goalBrutto = 400;
    if(d.drv.cfg.goalNetto === undefined) d.drv.cfg.goalNetto = 300;

    if(d.drv.emp === undefined) d.drv.emp = 'partner';
    if(d.drv.plat === undefined) d.drv.plat = 'apps';
    if(d.drv.carType === undefined) d.drv.carType = 'rent';
    
    if (d.init && d.setupDone === undefined) d.setupDone = true;

    return d;
};

// 4. Narzędzia Pomocnicze
window.safeVal = function(id, def=0) {
    let el = document.getElementById(id);
    if(!el || el.value === '') return def;
    let v = parseFloat(el.value.replace(',', '.'));
    return isNaN(v) ? def : v;
};

window.save = function() {
    if (typeof window.db !== 'undefined') {
        window.db = window.patchDb(window.db); 
        localStorage.setItem('styre_v101_db', JSON.stringify(window.db));
        
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0 && firebase.auth && firebase.auth().currentUser && window.db.setupDone) {
            if(firebase.firestore) {
                firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set(window.db).catch(e => console.log('Błąd zapisu w chmurze: ', e));
            }
        }
    }
};

window.onerror = function(msg, url, lineNo) { 
    let fn = url ? url.substring(url.lastIndexOf('/') + 1) : 'Nieznany plik'; 
    if(APP) APP.innerHTML = `<div style="padding:20px;text-align:center;margin-top:50px;"><div style="font-size:4rem;margin-bottom:10px;" class="float-icon">🐛</div><h2 style="color:var(--danger);">Błąd Kodu!</h2><div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:12px; text-align:left; font-family:monospace; font-size:0.8rem; color:#fff; border:1px solid rgba(255,255,255,0.1);">${msg}<br>Plik: ${fn}<br>Linia: ${lineNo}</div><button class="btn" style="background:rgba(255,255,255,0.1); margin-top:20px; border:1px solid rgba(255,255,255,0.2);" onclick="localStorage.clear();location.reload()">TWARDY RESET (CZYŚĆ PAMIĘĆ)</button><p style="color:var(--muted); font-size:0.7rem; margin-top:15px;">Twoje dane w chmurze Google są bezpieczne.</p></div>`; 
    return false; 
};

// ==========================================
// 5. GLOBALNE FUNKCJE NAWIGACYJNE I KRYSZTAŁOWY SWITCHER
// ==========================================

window.switchTab = function(t) { 
    if (window.db) window.db.tab = t; 
    window.save(); 
    window.render(); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
};

window.openSwitcher = function() {
    let el = document.getElementById('m-switcher');
    let btns = document.getElementById('switcher-btns');
    if(el && btns) {
        btns.innerHTML = `
            <div style="margin-bottom:20px; display:flex; flex-direction:column; gap:12px;">
                <button class="btn" style="background:linear-gradient(135deg, rgba(14,165,233,0.15), rgba(0,0,0,0.6)); border:1px solid rgba(14,165,233,0.3); border-top-color:rgba(14,165,233,0.6); color:#fff; padding:18px; font-weight:900; font-size:1.1rem; box-shadow:0 8px 25px rgba(14,165,233,0.2); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; gap:10px;" onclick="window.db.mainProfile='driver'; window.db.role='drv'; window.db.tab='term'; window.save(); document.getElementById('m-switcher').classList.add('hidden'); window.render();"><span class="float-icon" style="font-size:1.4rem;">🚕</span> PANEL TAXI</button>
                <button class="btn" style="background:linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,0,0,0.6)); border:1px solid rgba(16,185,129,0.3); border-top-color:rgba(16,185,129,0.6); color:#fff; padding:18px; font-weight:900; font-size:1.1rem; box-shadow:0 8px 25px rgba(16,185,129,0.2); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; gap:10px;" onclick="window.db.mainProfile='home'; window.db.role='home'; window.db.tab='dash'; window.save(); document.getElementById('m-switcher').classList.add('hidden'); window.render();"><span class="float-icon" style="font-size:1.4rem;">🏠</span> BUDŻET DOMOWY</button>
            </div>
            
            <div style="height:1px; background:rgba(255,255,255,0.05); margin: 5px 0 15px 0;"></div>
            <p style="color:var(--muted); font-size:0.65rem; text-transform:uppercase; margin-bottom:12px; font-weight:800; letter-spacing:1px; text-align:center;">Zarządzaj innymi profilami</p>
            
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
                <button class="btn" style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.05); color:var(--muted); padding:15px; display:flex; align-items:center; justify-content:center; gap:10px;" onclick="if(window.sysAlert) window.sysAlert('Wkrótce', 'Profil Kurier/Dostawca z zarządzaniem rewirami i stawkami za paczkę pojawi się w kolejnych aktualizacjach!', 'info')"><span style="filter:grayscale(100%);">📦</span> KURIER / DOSTAWA (Wkrótce)</button>
                <button class="btn" style="background:linear-gradient(135deg, rgba(217,70,239,0.05), rgba(0,0,0,0.5)); border:1px dashed rgba(217,70,239,0.3); color:#d946ef; padding:15px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:10px;" onclick="if(window.sysAlert) window.sysAlert('Funkcja PRO', 'Pełny moduł Firma/Spedycja (z KSeF, fakturami i flotą) będzie dostępny w wersji StyreOS PRO!', 'info')"><span>🚛</span> FIRMA / SPEDYCJA (PRO)</button>
            </div>
            
            <div style="height:1px; background:rgba(255,255,255,0.05); margin: 15px 0;"></div>
            
            <button class="btn" style="background:transparent; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); padding:15px; font-size:0.85rem; font-weight:800;" onclick="window.logoutToLauncher()">⚙️ WRÓĆ DO EKRANU STARTOWEGO</button>
            <button class="btn" style="background:transparent; color:#ef4444; margin-top:5px; box-shadow:none; font-size:0.8rem;" onclick="document.getElementById('m-switcher').classList.add('hidden')">ZAMKNIJ MODAL</button>
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
// 6. GŁÓWNY ROUTER (RENDER)
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
        if(APP) APP.innerHTML = `<div style="padding:20px;text-align:center;margin-top:50px;"><div style="font-size:4rem;margin-bottom:10px;" class="float-icon">🚨</div><h2 style="color:var(--danger)">Krytyczny Błąd Interfejsu</h2><p style="color:var(--muted);font-size:0.85rem;">${err.message}</p><button class="btn btn-danger" style="margin-top:30px;padding:20px;" onclick="localStorage.clear();location.reload();">TWARDY RESET APLIKACJI</button></div>`; 
    } 
}

// ==========================================
// 7. EKRAN LAUNCHERA (BRAMA GŁÓWNA)
// ==========================================

window.rLauncher = function() {
    let roadmapHtml = `
    <div style="width:100%; max-width:350px; margin-top:25px; text-align:left; background:linear-gradient(145deg, rgba(30,27,75,0.8), rgba(9,9,11,0.9)); border:1px solid rgba(139, 92, 246, 0.2); border-radius:24px; padding:24px; box-shadow:0 15px 40px rgba(0,0,0,0.4); backdrop-filter: blur(12px);">
        <h3 style="color:#c084fc; margin:0 0 18px 0; font-size:1.05rem; display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:1px;"><span>🚀</span> Wkrótce w StyreOS PRO</h3>
        
        <div style="margin-bottom:16px; border-left:2px solid #8b5cf6; padding-left:12px;">
            <strong style="color:#fff; font-size:0.85rem;">🚕 Asystent Zleceń AI & e-Kasa API</strong>
            <p style="color:var(--muted); font-size:0.75rem; margin:6px 0 0; line-height:1.4;">Pływająca nakładka opłacalności zlecenia oraz auto-zaciąganie kursów z kas RT3000 i centrali.</p>
        </div>
        
        <div style="margin-bottom:16px; border-left:2px solid #14b8a6; padding-left:12px;">
            <strong style="color:#fff; font-size:0.85rem;">🏦 Open Banking (Banki & Budżet)</strong>
            <p style="color:var(--muted); font-size:0.75rem; margin:6px 0 0; line-height:1.4;">Połączenie z bankami. AI samo w locie rozpozna i skategoryzuje transakcje i przypisze je do odpowiedniego miejsca w panelu.</p>
        </div>

        <div style="margin-bottom:16px; border-left:2px solid #ec4899; padding-left:12px;">
            <strong style="color:#fff; font-size:0.85rem;">📸 Inteligentny Skaner Paragonów</strong>
            <p style="color:var(--muted); font-size:0.75rem; margin:6px 0 0; line-height:1.4;">Wystarczy zrobić zdjęcie paragonu, a AI odczyta kwotę, datę i samo wrzuci ją w koszty napraw lub tankowania.</p>
        </div>
        
        <div style="border-left:2px solid #f59e0b; padding-left:12px;">
            <strong style="color:#fff; font-size:0.85rem;">🚛 Moduł Flota / Spedycja</strong>
            <p style="color:var(--muted); font-size:0.75rem; margin:6px 0 0; line-height:1.4;">Obsługa wielu aut i kierowców, fakturowanie, KSeF i pełna automatyczna księgowość firmy transportowej.</p>
        </div>
    </div>
    `;

    let uName = window.db.userName ? window.db.userName : 'Kierowco';

    // LAUNCHER ZBUDOWANY NA SYSTEMIE CRYSTAL (Ostateczna Wersja)
    APP.innerHTML = `
    <style id="home-crystal-styles-v13">
        .crystal-card { background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.2) 100%); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.3); border-radius: 16px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.5); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 20px; text-align: center; position: relative; overflow: hidden; margin-bottom:15px; cursor:pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .crystal-card:active { transform: scale(0.96); }
        .crystal-card::after { content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); animation: shine 5s infinite; }
        .crystal-taxi { border-top-color: rgba(14,165,233,0.6); box-shadow: inset 0 1px 2px rgba(14,165,233,0.4), 0 8px 20px rgba(0,0,0,0.6), 0 0 25px rgba(14,165,233,0.2); background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(0,0,0,0.4)); }
        .crystal-budget { border-top-color: rgba(16,185,129,0.6); box-shadow: inset 0 1px 2px rgba(16,185,129,0.4), 0 8px 20px rgba(0,0,0,0.6), 0 0 25px rgba(16,185,129,0.2); background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,0,0,0.4)); }
        .crystal-locked { border-top-color: rgba(255,255,255,0.1); box-shadow: inset 0 1px 2px rgba(255,255,255,0.05), 0 8px 20px rgba(0,0,0,0.4); background: rgba(0,0,0,0.6); opacity: 0.6; cursor: not-allowed; }
        .crystal-pro { border-top-color: rgba(217,70,239,0.4); box-shadow: inset 0 1px 2px rgba(217,70,239,0.2), 0 8px 20px rgba(0,0,0,0.4); background: linear-gradient(135deg, rgba(217,70,239,0.05), rgba(0,0,0,0.6)); opacity: 0.8; }
        @keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
    </style>
    
    <div style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px 20px; text-align:center; background:var(--bg); animation:fadeIn 0.4s ease;">
        <div style="display:inline-block; position:relative; margin-bottom:15px;">
            <div style="width:80px; height:80px; background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); border-radius:26px; display:flex; align-items:center; justify-content:center; font-size:2.8rem; box-shadow:0 15px 35px rgba(0,0,0,0.5); backdrop-filter:blur(10px);">🎛️</div>
            <div style="position:absolute; top:-5px; right:-5px; background:#10b981; width:20px; height:20px; border-radius:50%; border:3px solid var(--bg); box-shadow:0 0 10px #10b981;"></div>
        </div>
        
        <h1 style="color:#fff; font-size:2.2rem; font-weight:900; margin:0 0 5px 0; letter-spacing:-1px;">Cześć, ${uName}!</h1>
        <p style="color:var(--muted); font-size:0.85rem; margin-bottom:30px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Wybierz swój pulpit roboczy</p>

        <div style="width:100%; max-width:350px; display:flex; flex-direction:column; gap:0;">
            <div class="crystal-card crystal-taxi" onclick="window.db.role='drv'; window.db.tab='term'; window.save(); window.render();">
                <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
                    <div style="font-size:2rem; filter:drop-shadow(0 0 10px rgba(14,165,233,0.5));">🚕</div>
                    <h2 style="margin:0; font-size:1.4rem; font-weight:900; color:#fff; text-shadow:0 0 10px rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px;">Panel Taxi</h2>
                </div>
            </div>

            <div class="crystal-card crystal-budget" onclick="window.db.role='home'; window.db.tab='dash'; window.save(); window.render();">
                <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
                    <div style="font-size:2rem; filter:drop-shadow(0 0 10px rgba(16,185,129,0.5));">🏠</div>
                    <h2 style="margin:0; font-size:1.4rem; font-weight:900; color:#fff; text-shadow:0 0 10px rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px;">Budżet Domowy</h2>
                </div>
            </div>
            
            <div style="margin:20px 0 15px 0; font-size:0.65rem; color:rgba(255,255,255,0.3); font-weight:900; text-transform:uppercase; letter-spacing:2px; display:flex; align-items:center; gap:10px;">
                <div style="flex:1; height:1px; background:rgba(255,255,255,0.05);"></div>ZARZĄDZAJ INNYMI PROFILAMI<div style="flex:1; height:1px; background:rgba(255,255,255,0.05);"></div>
            </div>

            <div class="crystal-card crystal-locked" onclick="if(window.sysAlert) window.sysAlert('Wkrótce', 'Profil Kurier/Dostawca pojawi się w kolejnej aktualizacji!', 'info')">
                <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
                    <div style="font-size:1.6rem; filter:grayscale(100%); opacity:0.5;">📦</div>
                    <h2 style="margin:0; font-size:1rem; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:1px;">Kurier / Dostawa</h2>
                </div>
            </div>

            <div class="crystal-card crystal-pro" onclick="if(window.sysAlert) window.sysAlert('Wersja PRO', 'Profil Menadżera Floty będzie dostępny w StyreOS PRO.', 'info')">
                <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
                    <div style="font-size:1.6rem; filter:drop-shadow(0 0 5px rgba(217,70,239,0.5));">🚛</div>
                    <h2 style="margin:0; font-size:1rem; font-weight:800; color:#d946ef; text-transform:uppercase; letter-spacing:1px;">Firma / Flota (PRO)</h2>
                </div>
            </div>
        </div>

        ${roadmapHtml}

        <div style="margin-top:40px; display:flex; flex-direction:column; gap:15px; align-items:center;">
            <button style="background:transparent; border:none; color:var(--danger); font-size:0.8rem; text-decoration:underline; cursor:pointer; opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8" onclick="if(confirm('Chcesz zresetować konfigurację i zacząć od nowa?')){ localStorage.clear(); location.reload(); }">Wyczyść dane i zresetuj aplikację</button>
        </div>
    </div>
    `;
}

// --- LOGOWANIE GOOGLE ---
window.loginWithGoogle = function() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        if(window.sysAlert) return window.sysAlert('Brak połączenia', 'Zaczekaj sekundę na biblioteki Google.', 'warning');
        return alert("Poczekaj na wczytanie bibliotek...");
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
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
                                <div style="font-size:3rem; margin-bottom:10px;" class="float-icon">☁️</div>
                                <h3 style="color:var(--warning); margin-bottom:10px;">Konto odnalezione!</h3>
                                <p style="font-size:0.85rem; color:var(--muted); margin-bottom:20px; line-height:1.4;">Masz już dane w chmurze, ale pracowałeś też jako Gość na tym telefonie. Co chcesz zachować?</p>
                                <button class="btn" style="background:linear-gradient(135deg, var(--success), #16a34a); color:#fff; padding:18px; margin-bottom:12px; font-weight:bold; box-shadow:0 8px 25px rgba(34,197,94,0.3);" onclick="window.resolveConflict('cloud')">📥 POBIERZ Z CHMURY<br><small style="font-weight:normal; opacity:0.8;">(Skasuje dane Gościa)</small></button>
                                <button class="btn" style="background:linear-gradient(135deg, var(--info), #0284c7); color:#fff; padding:18px; margin-bottom:10px; font-weight:bold; box-shadow:0 8px 25px rgba(14,165,233,0.3);" onclick="window.resolveConflict('local')">📤 WYŚLIJ DO CHMURY<br><small style="font-weight:normal; opacity:0.8;">(Zachowa dane Gościa)</small></button>
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

