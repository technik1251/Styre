// ==========================================
// PLIK: app.js - GŁÓWNY SILNIK, LOGOWANIE GOOGLE I WIZARD STARTOWY
// ==========================================

// --- 1. KONFIGURACJA FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyADA7FPv6xEZNg0_WI_NlBiZLpYYv-g61o",
    authDomain: "styreos.firebaseapp.com",
    projectId: "styreos",
    storageBucket: "styreos.firebasestorage.app",
    messagingSenderId: "72578059548",
    appId: "1:72578059548:web:441ec96ed92d6f3f37bed9"
};

// --- 2. INICJALIZACJA FIREBASE (Bezpiecznie) ---
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} else {
    console.warn("Brak połączenia z siecią. Firebase jest niedostępny. Aplikacja przechodzi w tryb Offline.");
}

const firestore = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;

// --- 3. RDZEŃ I ZABEZPIECZENIE BŁĘDÓW ---
const APP = document.getElementById('app');
window.wData = window.wData || {}; // Zmienna tymczasowa dla Wizarda

window.onerror = function(msg, url, lineNo, columnNo, error) { 
    let fileName = url ? url.substring(url.lastIndexOf('/') + 1) : 'Nieznany plik'; 
    if(APP) APP.innerHTML = `<div style="padding:20px;text-align:center;margin-top:50px;"><div style="font-size:4rem;margin-bottom:10px;">🐛</div><h2 style="color:var(--danger); margin-bottom:5px;">Błąd Kodu!</h2><p style="color:var(--muted); font-size:0.8rem; margin-bottom:20px;">Aplikacja zatrzymana przez błąd w JavaScript.</p><div style="background:#000; border:1px solid rgba(255,255,255,0.1); padding:15px; border-radius:12px; text-align:left;"><strong style="color:var(--danger); font-size:0.85rem;">Treść:</strong><br><span style="color:#fff; font-family:monospace; font-size:0.8rem; word-break:break-all;">${msg}</span><br><br><strong style="color:var(--info); font-size:0.85rem;">Gdzie:</strong><br><span style="color:#fff; font-family:monospace; font-size:0.8rem;">Plik: ${fileName}<br>Linia: ${lineNo}</span></div><button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; margin-top:20px;" onclick="localStorage.clear();location.reload()">ODŚWIEŻ STRONĘ</button></div>`; 
    return false; 
};

// --- 4. GŁÓWNY RENDERER ---
window.render = function() { 
    try { 
        if(!db || !db.init) return window.rWiz(); 
        
        // Próba odpalenia profilu domowego (jeśli nie jesteśmy na profilu kierowcy)
        if(db.role === 'home') { 
            if(window.hCheckAuto) window.hCheckAuto(); 
            if(window.rHome) return window.rHome(); 
        } 
        
        // Próba odpalenia profilu kierowcy Taxi
        if(db.role === 'drv') { 
            if(window.dSessionInit) window.dSessionInit(); 
            if(window.rDrv) return window.rDrv(); 
        }
        
        // Zabezpieczenie przed dziurą w pamięci – wracamy do Wizarda
        return window.rWiz(); 
    } catch(err) { 
        if(APP) APP.innerHTML = `<div style="padding:20px;text-align:center;margin-top:50px;"><div style="font-size:4rem;margin-bottom:10px;">🚨</div><h2 style="color:var(--danger)">Krytyczny Błąd Renderowania</h2><p style="color:var(--muted);font-size:0.85rem;line-height:1.4;">${err.message}</p><button class="btn btn-danger" style="margin-top:30px;padding:20px;" onclick="localStorage.clear();location.reload();">NAPRAW (TWARDY RESET)</button></div>`; 
        console.error(err); 
    } 
}

// --- 5. EKRAN STARTOWY (WIZARD) ---
window.rWiz = function() {
    APP.innerHTML = `<div id="w-main" class="wiz-screen active" style="align-items:center;">
        <div style="width:85px;height:85px;background:linear-gradient(135deg,var(--driver),var(--life));border-radius:25px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">🚀</div>
        <h1 style="color:#fff; font-size:3.5rem; margin:0; font-weight:900; letter-spacing:-2.5px;">STYRE OS</h1>
        <p style="color:var(--muted); font-size:1.1rem; font-weight:600; margin-top:5px; margin-bottom:30px;">Twój Asystent</p>
        
        <div style="width: 100%; max-width: 400px;">
            
            <div id="google-login-box" style="margin-bottom: 25px;">
                <button class="btn" style="background:#fff; color:#000; box-shadow: 0 4px 15px rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; gap:10px; font-weight:800;" onclick="window.loginWithGoogle()">
                    <span style="font-size:1.3rem;">G</span> Zaloguj przez Google
                </button>
                <p style="text-align:center; font-size:0.65rem; color:var(--muted); margin-top:8px; text-transform:uppercase; letter-spacing:0.5px;">Zabezpiecz swoje dane w chmurze ☁️</p>
            </div>

            <div style="text-align:center; font-size:0.7rem; color:var(--muted); margin-bottom:10px; text-transform:uppercase; font-weight:800;">lub kontynuuj offline</div>

            <input type="text" id="w-name" placeholder="Twoje Imię" class="premium-input" value="${db.userName||''}">
            
            <div class="opt-card" style="border-color:rgba(59,130,246,0.3);" onclick="window.wMainProfile('driver')">
                <div class="opt-icon">🚕</div>
                <div class="opt-text"><h3>Kierowca Taxi</h3><p>Utargi, nawigacja GPS, garaż.</p></div>
            </div>
            
            <div class="opt-card" style="border-color:rgba(20,184,166,0.3);" onclick="window.wMainProfile('home')">
                <div class="opt-icon">🏠</div>
                <div class="opt-text"><h3>Budżet Domowy</h3><p>Wydatki, portfele, automaty.</p></div>
            </div>

            <div class="opt-card" style="border-color:rgba(255,255,255,0.05); opacity: 0.6; cursor: pointer; background: rgba(0,0,0,0.3);" onclick="window.sysAlert('Wkrótce', 'Profil Kurier/Dostawca z zarządzaniem rewirami i stawkami za paczkę pojawi się w kolejnych aktualizacjach!', 'info')">
                <div class="opt-icon" style="filter: grayscale(1);">📦</div>
                <div class="opt-text">
                    <h3 style="display:flex; align-items:center; gap:8px;">Kurier / Dostawa <span style="font-size:0.6rem; background:var(--info); color:#fff; padding:2px 6px; border-radius:4px;">WKRÓTCE</span></h3>
                    <p>Paczki, rewirowanie, trasy.</p>
                </div>
            </div>

            <div class="opt-card" style="border-color:rgba(255,255,255,0.05); opacity: 0.6; cursor: pointer; background: rgba(0,0,0,0.3);" onclick="window.sysAlert('Funkcja PRO', 'Pełny moduł Firma/Spedycja (z KSeF, fakturami i zarządzaniem flotą) będzie dostępny w wersji StyreOS PRO!', 'info')">
                <div class="opt-icon" style="filter: grayscale(1);">🚛</div>
                <div class="opt-text">
                    <h3 style="display:flex; align-items:center; gap:8px;">Firma / Spedycja <span style="font-size:0.6rem; background:#a855f7; color:#fff; padding:2px 6px; border-radius:4px;">PRO</span></h3>
                    <p>Zarządzanie flotą, KSeF, faktury.</p>
                </div>
            </div>
        </div>
    </div>
    
    <div id="w-home" class="wiz-screen"><div class="w-title">Budżet Rodzinny</div><div class="w-sub">Gotowy do akcji</div><button class="btn btn-home" onclick="window.hFin()">ZAKOŃCZ</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-main')">Wróć</button></div>
    
    <div id="w-d1" class="wiz-screen"><div class="w-title">System Pracy</div><div class="w-sub">Krok 1 z 3</div><div class="opt-card selected" onclick="window.dW('p','apps',this)"><div class="opt-icon">📱</div><div class="opt-text"><h3>Aplikacje</h3></div></div><div class="opt-card" onclick="window.dW('p','corp',this)"><div class="opt-icon">📻</div><div class="opt-text"><h3>Korporacja</h3></div></div><div id="wd-b" class="wiz-inputs" style="display:none;"><div class="inp-row"><div class="inp-group"><label>Opłata za bazę (zł)</label><input type="number" id="wd-b-v" placeholder="np. 400"></div><div class="inp-group"><label>Okres</label><select id="wd-b-period"><option value="week">Tydzień</option><option value="month" selected>Miesiąc</option></select></div></div></div><button class="btn btn-driver" style="margin-top:20px;" onclick="window.wS('w-d2')">Dalej</button></div>
    
    <div id="w-d2" class="wiz-screen"><div class="w-title">Twoje Auto</div><div class="w-sub">Krok 2 z 3</div><div class="opt-card selected" onclick="window.dW('c','rent',this)"><div class="opt-icon">🤝</div><div class="opt-text"><h3>Wynajem</h3></div></div><div class="opt-card" onclick="window.dW('c','lease',this)"><div class="opt-icon">📝</div><div class="opt-text"><h3>Leasing</h3></div></div><div class="opt-card" onclick="window.dW('c','own',this)"><div class="opt-icon">🚗</div><div class="opt-text"><h3>Własne</h3></div></div><div id="wd-c" style="display:block;"><div class="inp-row"><div class="inp-group"><label>Rata (zł)</label><input type="number" id="wd-c-v"></div><div class="inp-group"><label>Okres</label><select id="wd-c-type"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div></div></div><button class="btn btn-driver" style="margin-top:20px;" onclick="window.wS('w-d3')">Dalej</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-d1')">Wróć</button></div>
    
    <div id="w-d3" class="wiz-screen"><div class="w-title">Koszty Stałe</div><div class="w-sub">Krok 3 z 3</div><div class="opt-card selected" onclick="window.dW('e','partner',this)"><div class="opt-icon">🤝</div><div class="opt-text"><h3>Partner</h3></div></div><div class="opt-card" onclick="window.dW('e','jdg',this)"><div class="opt-icon">💼</div><div class="opt-text"><h3>JDG</h3></div></div><div id="wd-e-p" style="display:block;"><div class="inp-group" style="margin-bottom:10px;"><label>Rodzaj umowy</label><select id="wd-p-type" onchange="window.dTogglePType('wd')"><option value="flat">Stała kwota</option><option value="pct">Procent</option></select></div><div class="inp-row" id="wd-p-flat-box"><div class="inp-group"><label>Kwota (zł)</label><input type="number" id="wd-p-v" placeholder="np. 50"></div><div class="inp-group"><label>Okres</label><select id="wd-p-period"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div></div><div class="inp-group" id="wd-p-pct-box" style="display:none;"><label>Prowizja (%)</label><input type="number" id="wd-p-pct"></div></div><div id="wd-e-j" style="display:none;"><div class="inp-row"><div class="inp-group"><label>ZUS (Kwota zł)</label><input type="number" id="wd-j-v" placeholder="np. 1600"></div><div class="inp-group"><label>Okres</label><select id="wd-j-period"><option value="week">Tydzień</option><option value="month" selected>Miesiąc</option></select></div></div></div><div class="inp-group" style="margin-top:15px;"><label>Podatek (%)</label><input type="number" id="wd-tx-v" value="8.5" step="0.1"></div><button class="btn btn-success" style="margin-top:30px;" onclick="window.dFin()">ZAKOŃCZ</button><button class="btn" style="background:transparent; color:var(--muted);" onclick="window.wS('w-d2')">Wróć</button></div>`;
}

// --- 6. LOGIKA WIZARDA (Przełączanie kroków) ---
window.wS = function(id) { document.querySelectorAll('.wiz-screen').forEach(e=>e.classList.remove('active')); let t = document.getElementById(id); if(t) t.classList.add('active'); window.scrollTo(0,0); }
window.wMainProfile = function(prof) { window.wData.mainProfile = prof; if(prof==='driver') window.wS('w-d1'); else window.wS('w-home'); }
window.dW = function(cat, val, el) { window.wData[cat] = val; el.parentElement.querySelectorAll('.opt-card').forEach(c=>{ c.style.borderColor='rgba(255,255,255,0.05)'; c.classList.remove('selected'); }); el.style.borderColor='var(--driver)'; el.classList.add('selected'); if(cat==='p') { let elB = document.getElementById('wd-b'); if(elB) elB.style.display = (val === 'corp') ? 'block' : 'none'; } if(cat==='c') { let elC = document.getElementById('wd-c'); if(elC) elC.style.display = (val === 'own') ? 'none' : 'block'; } if(cat==='e') { let ep = document.getElementById('wd-e-p'); let ej = document.getElementById('wd-e-j'); if(ep) ep.style.display = (val === 'partner') ? 'block' : 'none'; if(ej) ej.style.display = (val === 'jdg') ? 'block' : 'none'; } }
window.dTogglePType = function(prefix) { let elT = document.getElementById(`${prefix}-p-type`); let val = elT ? elT.value : 'flat'; let flatBox = document.getElementById(`${prefix}-p-flat-box`); let pctBox = document.getElementById(`${prefix}-p-pct-box`); if(flatBox) flatBox.style.display = (val === 'flat') ? 'flex' : 'none'; if(pctBox) pctBox.style.display = (val === 'pct') ? 'block' : 'none'; }

window.dFin = function() { 
    db.mainProfile = window.wData.mainProfile || 'driver'; let nameEl = document.getElementById('w-name'); db.userName = nameEl ? (nameEl.value || 'Kierowca') : 'Kierowca';
    db.drv.plat = window.wData.p; db.drv.carType = window.wData.c; db.drv.emp = window.wData.e; 
    let b = window.wData.p === 'corp' ? window.safeVal('wd-b-v') : 0; let bPer = document.getElementById('wd-b-period') ? document.getElementById('wd-b-period').value : 'month';
    let c = window.wData.c === 'own' ? 0 : window.safeVal('wd-c-v'); let cType = window.wData.c === 'own' ? 'month' : (document.getElementById('wd-c-type') ? document.getElementById('wd-c-type').value : 'month');
    let e = 0, eTy = 'flat', ePct = 0, ePer = 'month'; 
    if(window.wData.e === 'partner') { 
        eTy = document.getElementById('wd-p-type') ? document.getElementById('wd-p-type').value : 'flat'; 
        if(eTy === 'flat') { e = window.safeVal('wd-p-v'); ePer = document.getElementById('wd-p-period') ? document.getElementById('wd-p-period').value : 'week'; } 
        else { ePct = window.safeVal('wd-p-pct') / 100; } 
    } else { e = window.safeVal('wd-j-v'); ePer = document.getElementById('wd-j-period') ? document.getElementById('wd-j-period').value : 'month'; } 
    db.drv.cfg.bC = b; db.drv.cfg.bPeriod = bPer; db.drv.cfg.cC = c; db.drv.cfg.cType = cType; 
    db.drv.cfg.eC = e; db.drv.cfg.eType = eTy; db.drv.cfg.ePct = ePct; db.drv.cfg.ePeriod = ePer; db.drv.cfg.iC = 0; db.drv.cfg.iPeriod = 'month';
    db.drv.cfg.fix = 0; db.drv.cfg.tax = window.safeVal('wd-tx-v', 8.5) / 100; db.drv.cfg.cardF = 0.015; db.drv.cfg.goal = 350;
    db.role = 'drv'; db.tab = 'term'; db.init = true; window.save(); if(window.dSessionInit) window.dSessionInit(); window.render(); 
}

window.hFin = function() { 
    db.mainProfile = 'home'; let nameEl = document.getElementById('w-name'); db.userName = nameEl ? (nameEl.value || 'Domownik') : 'Domownik'; 
    db.home.members = [db.userName]; db.role = 'home'; db.tab = 'dash'; db.init = true; window.save(); window.render(); 
}

// --- 7. LOGOWANIE GOOGLE (Poprawione błędy Firebase) ---
window.loginWithGoogle = function() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        return window.sysAlert('Błąd systemu', 'Biblioteka Firebase nie została załadowana. Sprawdź połączenie z internetem lub chwilę poczekaj.', 'error');
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log("Zalogowano pomyślnie. UID:", user.uid);
            
            if(firestore) {
                firestore.collection('users').doc(user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            // Mamy zapisane dane!
                            db = doc.data();     
                            db.init = true;      
                            window.save();       
                            
                            window.sysAlert('Witaj ponownie!', `Przywrócono Twoją pełną historię z chmury, ${user.displayName.split(' ')[0]}! ☁️`, 'success');
                            
                            window.render(); 
                        } else {
                            // Nowy użytkownik
                            let loginBox = document.getElementById('google-login-box');
                            if(loginBox) loginBox.style.display = 'none';

                            let nameInput = document.getElementById('w-name');
                            if(nameInput && user.displayName) {
                                nameInput.value = user.displayName.split(' ')[0]; 
                            }
                            
                            window.sysAlert('Konto utworzone!', `Cześć ${user.displayName.split(' ')[0]}! Dokończ konfigurację, a system sam zacznie wrzucać Twoje wpisy do chmury.`, 'success');
                        }
                    })
                    .catch((error) => {
                        console.error("Błąd sprawdzania bazy danych:", error);
                        window.sysAlert('Ostrzeżenie', 'Zalogowano pomyślnie, ale coś przerwało komunikację z chmurą. ' + error.message, 'warning');
                    });
            } else {
                 window.sysAlert('Tryb Offline', 'Zalogowano, ale baza chmurowa Firestore jest obecnie niedostępna. Twoje dane zostaną tylko na telefonie.', 'warning');
            }
        })
        .catch((error) => {
            console.error("Błąd logowania:", error);
            window.sysAlert('Błąd Logowania', `Powód: ${error.message}`, 'error');
        });
}

// Uruchomienie aplikacji (Silnik włączony!)
window.render();
