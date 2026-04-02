// ==========================================
// PLIK: home_views.js - Ekran Startowy, Menu Główne i Kreator Konfiguracji (Crystal UI)
// ==========================================

// --- ZMIENNE TYMCZASOWE KREATORA ---
window.wizStep = 1;
window.wizType = 'taxi'; // taxi / budget
window.wizPlat = 'apps'; // apps / corp
window.wizCarType = 'rent'; // rent / lease / own

window.nextWiz = function(step) {
    window.wizStep = step;
    if(typeof window.render === 'function') window.render();
};

window.finishWiz = function() {
    let safeVal = function(id, def) {
        let el = document.getElementById(id);
        if(el && el.value !== '') return parseFloat(el.value.replace(',', '.')) || (def || 0);
        return def || 0;
    };
    
    let safeStr = function(id, def) {
        let el = document.getElementById(id);
        if(el && el.value !== '') return el.value;
        return def || '';
    };

    // Imię
    let nEl = document.getElementById('wiz-name');
    if(nEl && nEl.value) window.db.userName = nEl.value;
    else window.db.userName = 'Kierowca';

    // Jeśli wybrano tylko budżet
    if(window.wizType === 'budget') {
        window.db.setupDone = true;
        window.save();
        window.dGoTo('budget');
        return;
    }

    // Jeśli Taxi, inicjalizujemy bazę drv.cfg
    if(!window.db.drv) window.db.drv = {};
    if(!window.db.drv.cfg) window.db.drv.cfg = {};
    
    window.db.drv.plat = window.wizPlat;
    
    // Zapisujemy koszty dokładnie tak, jak wymaga tego nowy Panel Taxi (Pełna Synchronizacja!)
    window.db.drv.cfg.carRent = safeVal('wiz-car-rent');
    window.db.drv.cfg.carRentPeriod = safeStr('wiz-car-period', 'week');
    
    window.db.drv.cfg.zus = safeVal('wiz-zus');
    window.db.drv.cfg.zusPeriod = safeStr('wiz-zus-period', 'month');
    
    window.db.drv.cfg.eFix = safeVal('wiz-partner-fee');
    window.db.drv.cfg.ePeriod = safeStr('wiz-partner-period', 'week');
    
    window.db.drv.cfg.tax = safeVal('wiz-tax', 8.5) / 100;
    
    // Domyślne cele na start
    window.db.drv.cfg.goalBrutto = 400;
    window.db.drv.cfg.goalNetto = 300;

    window.db.setupDone = true;
    window.save();
    
    if(window.sysAlert) window.sysAlert('Gotowe!', 'Twój profil został skonfigurowany i połączony z panelem.', 'success');
    
    // Resetuj widok
    window.wizStep = 1;
    if(typeof window.render === 'function') window.render();
};

window.rHome = function(d, t, nav, hdr) {
    try {
        let appContainer = document.getElementById('app');
        if(!appContainer) return;
        
        let html = [];
        html.push(hdr);
        
        // ZASZYTE STYLE CSS (Kryształy i Neony)
        html.push('<style id="home-crystal-styles">');
        html.push('.crystal-card { background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.2) 100%); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.3); border-radius: 16px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.5); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 20px; text-align: center; position: relative; overflow: hidden; margin-bottom:15px; cursor:pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }');
        html.push('.crystal-card:active { transform: scale(0.96); }');
        html.push('.crystal-card::after { content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); animation: shine 5s infinite; }');
        html.push('.crystal-taxi { border-top-color: rgba(14,165,233,0.6); box-shadow: inset 0 1px 2px rgba(14,165,233,0.4), 0 8px 20px rgba(0,0,0,0.6), 0 0 25px rgba(14,165,233,0.2); background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(0,0,0,0.4)); }');
        html.push('.crystal-budget { border-top-color: rgba(16,185,129,0.6); box-shadow: inset 0 1px 2px rgba(16,185,129,0.4), 0 8px 20px rgba(0,0,0,0.6), 0 0 25px rgba(16,185,129,0.2); background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,0,0,0.4)); }');
        html.push('.crystal-locked { border-top-color: rgba(255,255,255,0.1); box-shadow: inset 0 1px 2px rgba(255,255,255,0.05), 0 8px 20px rgba(0,0,0,0.4); background: rgba(0,0,0,0.6); opacity: 0.6; cursor: not-allowed; }');
        html.push('.crystal-pro { border-top-color: rgba(217,70,239,0.4); box-shadow: inset 0 1px 2px rgba(217,70,239,0.2), 0 8px 20px rgba(0,0,0,0.4); background: linear-gradient(135deg, rgba(217,70,239,0.05), rgba(0,0,0,0.6)); opacity: 0.8; }');
        
        html.push('.neo-input-box { background: rgba(0,0,0,0.6); border: 1px solid rgba(14,165,233,0.3); border-radius: 16px; padding: 15px; box-shadow: inset 0 4px 20px rgba(0,0,0,0.8), 0 0 15px rgba(14,165,233,0.1); display: flex; align-items: center; justify-content: center; transition: all 0.3s; margin-bottom:15px; }');
        html.push('.neo-input-box:focus-within { border-color: #0ea5e9; box-shadow: inset 0 4px 20px rgba(0,0,0,0.8), 0 0 25px rgba(14,165,233,0.3); }');
        html.push('.compact-inp { background: transparent; border: none; color: #fff; padding: 10px; text-align: center; font-size: 1.5rem; font-weight: 900; outline: none; width: 100%; box-sizing: border-box; }');
        html.push('.grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;}');
        html.push('.wiz-card { background: rgba(24, 24, 27, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; margin-bottom: 12px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; box-shadow: 0 6px 15px rgba(0,0,0,0.3); backdrop-filter: blur(10px);}');
        html.push('.wiz-card:active { transform: scale(0.97); }');
        html.push('.wiz-card.selected { border-color: #0ea5e9; background: rgba(14,165,233,0.1); box-shadow: 0 8px 25px rgba(14,165,233,0.25); transform: translateY(-2px); }');
        html.push('</style>');

        // --- KREATOR KONFIGURACJI (WIZARD) ---
        if (!d.setupDone) {
            html.push('<div style="min-height:85vh; display:flex; flex-direction:column; justify-content:center; padding:20px; animation:fadeIn 0.3s ease;">');
            
            if (window.wizStep === 1) {
                html.push('<div style="text-align:center; margin-bottom:30px;"><div style="font-size:3.5rem; margin-bottom:10px; filter:drop-shadow(0 0 15px rgba(14,165,233,0.4));">👋</div><h1 style="color:#fff; font-size:2.5rem; font-weight:900; margin:0 0 5px 0; letter-spacing:-1px;">Jak masz na imię?</h1><p style="color:var(--muted); font-size:0.9rem; margin:0;">Abyśmy wiedzieli, jak się do Ciebie zwracać.</p></div>');
                html.push('<div class="neo-input-box"><input type="text" id="wiz-name" placeholder="Twoje Imię" class="compact-inp" style="color:#0ea5e9;"></div>');
                html.push('<button style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:18px; border-radius:16px; border:none; width:100%; font-size:1.1rem; box-shadow:0 8px 25px rgba(14,165,233,0.4); cursor:pointer; margin-top:20px;" onclick="window.nextWiz(2)">DALEJ ➔</button>');
            } 
            else if (window.wizStep === 2) {
                html.push('<div style="text-align:center; margin-bottom:30px;"><h1 style="color:#fff; font-size:2.2rem; font-weight:900; margin:0 0 5px 0; letter-spacing:-1px;">Konfiguracja</h1><p style="color:var(--muted); font-size:0.9rem; margin:0;">Z czego będziesz korzystać w StyreOS?</p></div>');
                
                let sT = window.wizType === 'taxi' ? 'selected' : '';
                let sB = window.wizType === 'budget' ? 'selected' : '';
                
                html.push('<div class="wiz-card '+sT+'" onclick="window.wizType=\'taxi\'; window.render()"><div style="font-size:2rem; margin-right:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:12px;">🚕</div><div><h3 style="margin:0 0 4px 0; font-size:1.1rem; color:#fff;">Jestem Kierowcą Taxi</h3><p style="margin:0; font-size:0.75rem; color:var(--muted);">Skonfiguruj auto, prowizje i zyski.</p></div></div>');
                html.push('<div class="wiz-card '+sB+'" onclick="window.wizType=\'budget\'; window.render()"><div style="font-size:2rem; margin-right:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:12px;">🏠</div><div><h3 style="margin:0 0 4px 0; font-size:1.1rem; color:#fff;">Tylko Budżet Domowy</h3><p style="margin:0; font-size:0.75rem; color:var(--muted);">Zarządzaj wydatkami, pomiń taxi.</p></div></div>');
                
                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:30px;">');
                html.push('<button style="background:transparent; color:var(--muted); font-weight:800; padding:18px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); width:100%; cursor:pointer;" onclick="window.nextWiz(1)">Wróć</button>');
                html.push('<button style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:18px; border-radius:16px; border:none; width:100%; box-shadow:0 8px 25px rgba(14,165,233,0.4); cursor:pointer;" onclick="window.wizType===\'budget\' ? window.finishWiz() : window.nextWiz(3)">DALEJ ➔</button>');
                html.push('</div>');
            }
            else if (window.wizStep === 3) {
                html.push('<div style="text-align:center; margin-bottom:30px;"><div style="font-size:0.7rem; color:#0ea5e9; font-weight:900; letter-spacing:2px; margin-bottom:10px;">KROK 1 Z 3</div><h1 style="color:#fff; font-size:2.2rem; font-weight:900; margin:0 0 5px 0; letter-spacing:-1px;">System Pracy</h1><p style="color:var(--muted); font-size:0.9rem; margin:0;">Jak pozyskujesz klientów?</p></div>');
                
                let sA = window.wizPlat === 'apps' ? 'selected' : '';
                let sC = window.wizPlat === 'corp' ? 'selected' : '';
                
                html.push('<div class="wiz-card '+sA+'" onclick="window.wizPlat=\'apps\'; window.render()"><div style="font-size:2rem; margin-right:15px;">📱</div><div><h3 style="margin:0 0 4px 0; font-size:1.1rem; color:#fff;">Aplikacje</h3><p style="margin:0; font-size:0.75rem; color:var(--muted);">Uber, Bolt, FreeNow</p></div></div>');
                html.push('<div class="wiz-card '+sC+'" onclick="window.wizPlat=\'corp\'; window.render()"><div style="font-size:2rem; margin-right:15px;">📻</div><div><h3 style="margin:0 0 4px 0; font-size:1.1rem; color:#fff;">Korporacja</h3><p style="margin:0; font-size:0.75rem; color:var(--muted);">Radio, Postój, Baza</p></div></div>');
                
                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:30px;">');
                html.push('<button style="background:transparent; color:var(--muted); font-weight:800; padding:18px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); width:100%; cursor:pointer;" onclick="window.nextWiz(2)">Wróć</button>');
                html.push('<button style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:18px; border-radius:16px; border:none; width:100%; box-shadow:0 8px 25px rgba(14,165,233,0.4); cursor:pointer;" onclick="window.nextWiz(4)">DALEJ ➔</button>');
                html.push('</div>');
            }
            else if (window.wizStep === 4) {
                html.push('<div style="text-align:center; margin-bottom:30px;"><div style="font-size:0.7rem; color:#0ea5e9; font-weight:900; letter-spacing:2px; margin-bottom:10px;">KROK 2 Z 3</div><h1 style="color:#fff; font-size:2.2rem; font-weight:900; margin:0 0 5px 0; letter-spacing:-1px;">Pojazd</h1><p style="color:var(--muted); font-size:0.9rem; margin:0;">Ile kosztuje Cię auto?</p></div>');
                
                let sR = window.wizCarType === 'rent' ? 'selected' : '';
                let sL = window.wizCarType === 'lease' ? 'selected' : '';
                let sO = window.wizCarType === 'own' ? 'selected' : '';
                
                html.push('<div class="grid-3" style="grid-template-columns:1fr 1fr 1fr;">');
                html.push('<div class="wiz-card '+sR+'" style="flex-direction:column; padding:15px 5px;" onclick="window.wizCarType=\'rent\'; window.render()"><div style="font-size:2rem; margin:0 0 10px 0;">🤝</div><h3 style="margin:0; font-size:0.85rem; color:#fff; text-align:center;">Wynajem</h3></div>');
                html.push('<div class="wiz-card '+sL+'" style="flex-direction:column; padding:15px 5px;" onclick="window.wizCarType=\'lease\'; window.render()"><div style="font-size:2rem; margin:0 0 10px 0;">📝</div><h3 style="margin:0; font-size:0.85rem; color:#fff; text-align:center;">Leasing</h3></div>');
                html.push('<div class="wiz-card '+sO+'" style="flex-direction:column; padding:15px 5px;" onclick="window.wizCarType=\'own\'; window.render()"><div style="font-size:2rem; margin:0 0 10px 0;">🚗</div><h3 style="margin:0; font-size:0.85rem; color:#fff; text-align:center;">Własne</h3></div>');
                html.push('</div>');
                
                if(window.wizCarType !== 'own') {
                    html.push('<div class="neo-input-box" style="padding:10px; margin-top:10px;"><div style="flex:2;"><label style="font-size:0.55rem; color:var(--muted); font-weight:800; display:block; text-align:center;">KOSZT AUTA (ZŁ)</label><input type="number" id="wiz-car-rent" placeholder="np. 600" class="compact-inp" style="color:#0ea5e9;"></div><div style="flex:1;"><label style="font-size:0.55rem; color:var(--muted); font-weight:800; display:block; text-align:center;">OKRES</label><select id="wiz-car-period" class="compact-inp" style="padding:14px 5px; font-size:0.9rem;"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div></div>');
                } else {
                    html.push('<input type="hidden" id="wiz-car-rent" value="0"><input type="hidden" id="wiz-car-period" value="week">');
                }

                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">');
                html.push('<button style="background:transparent; color:var(--muted); font-weight:800; padding:18px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); width:100%; cursor:pointer;" onclick="window.nextWiz(3)">Wróć</button>');
                html.push('<button style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-weight:900; padding:18px; border-radius:16px; border:none; width:100%; box-shadow:0 8px 25px rgba(14,165,233,0.4); cursor:pointer;" onclick="window.nextWiz(5)">DALEJ ➔</button>');
                html.push('</div>');
            }
            else if (window.wizStep === 5) {
                html.push('<div style="text-align:center; margin-bottom:30px;"><div style="font-size:0.7rem; color:#10b981; font-weight:900; letter-spacing:2px; margin-bottom:10px;">KROK 3 Z 3</div><h1 style="color:#fff; font-size:2.2rem; font-weight:900; margin:0 0 5px 0; letter-spacing:-1px;">Koszty Stałe</h1><p style="color:var(--muted); font-size:0.9rem; margin:0;">ZUS, Księgowa i prowizje.</p></div>');
                
                html.push('<div class="neo-input-box" style="padding:10px; margin-bottom:10px;"><div style="flex:2;"><label style="font-size:0.55rem; color:var(--muted); font-weight:800; display:block; text-align:center;">ZUS / KSIĘGOWOŚĆ (ZŁ)</label><input type="number" id="wiz-zus" placeholder="np. 400" class="compact-inp" style="color:#10b981;"></div><div style="flex:1;"><label style="font-size:0.55rem; color:var(--muted); font-weight:800; display:block; text-align:center;">OKRES</label><select id="wiz-zus-period" class="compact-inp" style="padding:14px 5px; font-size:0.9rem;"><option value="month" selected>Miesiąc</option><option value="week">Tydzień</option></select></div></div>');

                html.push('<div class="neo-input-box" style="padding:10px; margin-bottom:10px;"><div style="flex:2;"><label style="font-size:0.55rem; color:var(--muted); font-weight:800; display:block; text-align:center;">ABONAMENT PARTNERA (ZŁ)</label><input type="number" id="wiz-partner-fee" placeholder="np. 50" class="compact-inp" style="color:#10b981;"></div><div style="flex:1;"><label style="font-size:0.55rem; color:var(--muted); font-weight:800; display:block; text-align:center;">OKRES</label><select id="wiz-partner-period" class="compact-inp" style="padding:14px 5px; font-size:0.9rem;"><option value="week" selected>Tydzień</option><option value="month">Miesiąc</option></select></div></div>');

                html.push('<div class="neo-input-box" style="padding:10px;"><div style="flex:1;"><label style="font-size:0.55rem; color:var(--muted); font-weight:800; display:block; text-align:center;">PODATEK DOCHODOWY (%)</label><input type="number" step="0.1" id="wiz-tax" value="8.5" class="compact-inp"></div></div>');

                html.push('<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">');
                html.push('<button style="background:transparent; color:var(--muted); font-weight:800; padding:18px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); width:100%; cursor:pointer;" onclick="window.nextWiz(4)">Wróć</button>');
                html.push('<button style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; font-weight:900; padding:18px; border-radius:16px; border:none; width:100%; box-shadow:0 8px 25px rgba(16,185,129,0.4); cursor:pointer;" onclick="window.finishWiz()">ZAKOŃCZ</button>');
                html.push('</div>');
            }
            
            html.push('</div>');
            appContainer.innerHTML = html.join('');
            return;
        }

        // --- MENU STARTOWE (ZARZĄDZANIE PROFILAMI - CRYSTAL UI) ---
        let uName = window.db.userName ? window.db.userName : 'Kierowco';
        
        html.push('<div style="padding:30px 20px; text-align:center; animation:fadeIn 0.3s ease;">');
        html.push('<div style="display:inline-block; position:relative; margin-bottom:15px;">');
        html.push('<div style="width:80px; height:80px; background:rgba(255, 255, 255, 0.05); border:1px solid rgba(255, 255, 255, 0.1); border-radius:28px; display:flex; align-items:center; justify-content:center; font-size:2.8rem; box-shadow:0 15px 35px rgba(0,0,0,0.5); backdrop-filter:blur(10px);">🎛️</div>');
        html.push('<div style="position:absolute; top:-5px; right:-5px; background:#10b981; width:20px; height:20px; border-radius:50%; border:3px solid var(--bg); box-shadow:0 0 10px #10b981;"></div>');
        html.push('</div>');
        
        html.push('<h1 style="color:#fff; font-size:2rem; font-weight:900; margin:0 0 5px 0; letter-spacing:-1px;">Cześć, '+uName+'!</h1>');
        html.push('<p style="color:var(--muted); font-size:0.85rem; margin-bottom:30px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Wybierz swój pulpit roboczy</p>');
        
        // Kafelki Profilów
        html.push('<div class="crystal-card crystal-taxi" onclick="if(window.dGoTo) window.dGoTo(\'term\')">');
        html.push('<div style="display:flex; align-items:center; justify-content:center; gap:15px;"><div style="font-size:2rem; filter:drop-shadow(0 0 10px rgba(14,165,233,0.5));">🚕</div><h2 style="margin:0; font-size:1.4rem; font-weight:900; color:#fff; text-shadow:0 0 10px rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px;">Panel Taxi</h2></div>');
        html.push('</div>');

        html.push('<div class="crystal-card crystal-budget" onclick="if(window.dGoTo) window.dGoTo(\'budget\')">');
        html.push('<div style="display:flex; align-items:center; justify-content:center; gap:15px;"><div style="font-size:2rem; filter:drop-shadow(0 0 10px rgba(16,185,129,0.5));">🏠</div><h2 style="margin:0; font-size:1.4rem; font-weight:900; color:#fff; text-shadow:0 0 10px rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1px;">Budżet Domowy</h2></div>');
        html.push('</div>');
        
        html.push('<div style="margin:40px 0 15px 0; font-size:0.65rem; color:rgba(255,255,255,0.3); font-weight:900; text-transform:uppercase; letter-spacing:2px; display:flex; align-items:center; gap:10px;"><div style="flex:1; height:1px; background:rgba(255,255,255,0.05);"></div>ZARZĄDZAJ INNYMI PROFILAMI<div style="flex:1; height:1px; background:rgba(255,255,255,0.05);"></div></div>');

        html.push('<div class="crystal-card crystal-locked" onclick="if(window.sysAlert) window.sysAlert(\'Wkrótce\', \'Profil Kurier/Dostawca z zarządzaniem rewirami i stawkami za paczkę pojawi się w kolejnych aktualizacjach!\', \'info\')">');
        html.push('<div style="display:flex; align-items:center; justify-content:center; gap:15px;"><div style="font-size:1.6rem; filter:grayscale(100%); opacity:0.5;">📦</div><h2 style="margin:0; font-size:1rem; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:1px;">Kurier / Dostawa</h2></div>');
        html.push('</div>');

        html.push('<div class="crystal-card crystal-pro" onclick="if(window.sysAlert) window.sysAlert(\'Wersja PRO\', \'Profil Menadżera Floty (Rozliczanie kierowców i spedycja) będzie dostępny w wersji PRO.\', \'info\')">');
        html.push('<div style="display:flex; align-items:center; justify-content:center; gap:15px;"><div style="font-size:1.6rem; filter:drop-shadow(0 0 5px rgba(217,70,239,0.5));">🚛</div><h2 style="margin:0; font-size:1rem; font-weight:800; color:#d946ef; text-transform:uppercase; letter-spacing:1px;">Firma / Flota (PRO)</h2></div>');
        html.push('</div>');

        html.push('</div>');
        
        appContainer.innerHTML = html.join('') + '<div style="height:100px;"></div>' + nav;

    } catch(err) {
        console.error(err);
        let ac = document.getElementById('app');
        if(ac) ac.innerHTML = '<div style="padding:40px 20px; text-align:center; color:white;"><h3>Błąd Ekranu Startowego</h3><p style="color:#ef4444;">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; width:100%;" onclick="window.location.reload()">ODŚWIEŻ</button></div>';
    }
};
