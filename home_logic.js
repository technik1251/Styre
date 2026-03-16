// ==========================================
// PLIK: home_logic.js - "Mózg" Finansów Domowych (Obliczenia i Baza)
// ==========================================

// 1. KONFIGURACJA KATEGORII
const FIXED_EXP_CATS = ['Stałe opłaty / Czynsz', 'Prąd / Gaz / Woda', 'Internet i Telefon', 'Kredyt / Leasing', 'Dom i Rachunki'];
const C_EXP = { 
    'Stałe opłaty / Czynsz': {c: '#f59e0b', i: '🏢'}, 
    'Prąd / Gaz / Woda': {c: '#0ea5e9', i: '⚡'}, 
    'Internet i Telefon': {c: '#8b5cf6', i: '🌐'}, 
    'Kredyt / Leasing': {c: '#ef4444', i: '🏦'}, 
    'Zakupy Spożywcze': {c: '#22c55e', i: '🛒'}, 
    'Dom i Rachunki': {c: '#14b8a6', i: '🏠'}, 
    'Auto i Transport': {c: '#f59e0b', i: '🚗'}, 
    'Rozrywka': {c: '#a855f7', i: '🎉'}, 
    'Jedzenie na mieście': {c: '#ef4444', i: '🍔'}, 
    'Ubrania': {c: '#ec4899', i: '👗'}, 
    'Zdrowie': {c: '#10b981', i: '💊'}, 
    'Oszczędności / Skarbonka': {c: '#10b981', i: '🐷'}, 
    'Inne Wydatki': {c: '#64748b', i: '📦'} 
};
const C_INC = { 
    'Wypłata z Etatu': {c: '#22c55e', i: '💼'}, 
    'Utarg z Taxi': {c: '#3b82f6', i: '🚕'}, 
    'Premia / Prezent': {c: '#10b981', i: '🎁'}, 
    'Inne Wpływy': {c: '#14b8a6', i: '📈'} 
};

// 2. ZMIENNE STANU (Filtry i Widoki)
window.hHistFilter = window.hHistFilter || 'all';
window.hCalMode = window.hCalMode || 'history';
window.hViewDate = window.hViewDate || new Date();
window.hSearchQuery = window.hSearchQuery || '';

// ==========================================
// FUNKCJE LOGICZNE (MATEMATYKA)
// ==========================================

// Bezpieczna inicjalizacja (Uruchamiana dopiero gdy baza jest gotowa)
window.hInitDb = function() {
    if(!window.db) window.db = {};
    if(!window.db.home) window.db.home = {};
    if(!window.db.home.goals) window.db.home.goals = [];
    if(!window.db.home.loans) window.db.home.loans = [];
    if(!window.db.home.piggy) window.db.home.piggy = [];
    if(!window.db.home.debts) window.db.home.debts = [];
    if(!window.db.home.accs) window.db.home.accs = [{id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0}];
    if(!window.db.home.trans) window.db.home.trans = [];
    if(!window.db.home.recurring) window.db.home.recurring = [];
    if(!window.db.home.budgets) window.db.home.budgets = {};
};

// Pobieranie Salda wszystkich kont
window.hGetBal = function() {
    window.hInitDb();
    let b = {}; 
    window.db.home.accs.forEach(a => b[a.id] = parseFloat(a.startBal) || 0);
    
    window.db.home.trans.forEach(x => {
        if(!x.isPlanned) {
            let v = parseFloat(x.v) || 0;
            if(x.type === 'inc' && b[x.acc] !== undefined) b[x.acc] += v;
            if(x.type === 'exp' && b[x.acc] !== undefined) b[x.acc] -= v;
            if(x.type === 'transfer') { 
                if(b[x.fromAcc] !== undefined) b[x.fromAcc] -= v; 
                if(b[x.toAcc] !== undefined) b[x.toAcc] += v; 
            }
        }
    }); 
    return b;
};

// Generowanie harmonogramów (Kredyty, Karty i Automaty)
window.hSyncSchedule = function() {
    window.hInitDb();
    window.db.home.trans = window.db.home.trans.filter(x => !(x.isPlanned && (x.loanId || x.recId)));
    let n = new Date(); 
    let y = n.getFullYear(); 
    let m = n.getMonth();

    // 1. Zwykłe Automaty Kosztowe
    for(let i=0; i<12; i++) {
        let curD = new Date(y, m+i, 1);
        if(window.db.home.recurring) {
            window.db.home.recurring.forEach(r => {
                let dObj = new Date(curD.getFullYear(), curD.getMonth(), r.day || 1, 12, 0, 0);
                if(dObj > n) {
                    window.db.home.trans.push({ 
                        id: 'rec_'+r.id+'_'+i, 
                        type: r.t, 
                        cat: r.c, 
                        acc: r.a, 
                        d: r.n, 
                        v: parseFloat(r.v) || 0, 
                        who: 'System', 
                        dt: dObj.toLocaleDateString('pl-PL'), 
                        rD: dObj.toISOString(), 
                        isPlanned: true, 
                        recId: r.id 
                    });
                }
            });
        }
    }

    // 2. Kredyty i Karty Kredytowe
    if(window.db.home.loans) {
        window.db.home.loans.filter(l => !l.isClosed).forEach(l => {
            let isCard = (l.type === 'Karta');
            
            // Logika dla KARTY KREDYTOWEJ
            if (isCard) {
                let kap = parseFloat(l.kapital) || 0;
                if (kap > 0) {
                    let minP = (kap * (parseFloat(l.minPayPct) || 5)) / 100;
                    if (minP < 50 && kap > 0) minP = Math.min(50, kap);
                    let plannedV = l.declaredPay === 'min' ? minP : kap;
                    
                    for(let i=0; i<12; i++) {
                        let curD = new Date(y, m+i, 1);
                        let dObj = new Date(curD.getFullYear(), curD.getMonth(), l.day || 10, 12, 0, 0);
                        if(dObj > n || (i===0 && dObj.getDate() >= n.getDate())) {
                            window.db.home.trans.push({ 
                                id: 'loan_'+l.id+'_'+i, 
                                type: 'exp', 
                                cat: 'Kredyt / Leasing', 
                                acc: l.accId || window.db.home.accs[0].id, 
                                d: 'Karta: ' + l.n, 
                                v: plannedV, 
                                who: 'System', 
                                dt: dObj.toLocaleDateString('pl-PL'), 
                                rD: dObj.toISOString(), 
                                isPlanned: true, 
                                loanId: l.id 
                            });
                            break; 
                        }
                    }
                }
            } 
            // Logika dla KREDYTÓW / LEASINGÓW
            else {
                let generated = 0;
                let instLeft = parseInt(l.installmentsLeft) || 0;
                for(let i=0; i<24 && generated < instLeft; i++) {
                    let curD = new Date(y, m+i, 1);
                    let curMStr = curD.getFullYear() + '-' + String(curD.getMonth()+1).padStart(2,'0');

                    if(l.holidayMonth === curMStr) continue;

                    let dObj = new Date(curD.getFullYear(), curD.getMonth(), l.day || 10, 12, 0, 0);
                    if(dObj > n || (generated===0 && dObj.getDate() >= n.getDate())) {
                         window.db.home.trans.push({ 
                             id: 'loan_'+l.id+'_'+i, 
                             type: 'exp', 
                             cat: 'Kredyt / Leasing', 
                             acc: l.accId || window.db.home.accs[0].id, 
                             d: 'Rata: ' + l.n, 
                             v: parseFloat(l.rata) || 0, 
                             who: 'System', 
                             dt: dObj.toLocaleDateString('pl-PL'), 
                             rD: dObj.toISOString(), 
                             isPlanned: true, 
                             loanId: l.id 
                         });
                    }
                    generated++;
                }
            }
        });
    }

    window.db.home.trans.sort((a,b) => new Date(b.rD) - new Date(a.rD));
};

// Sprawdzanie i księgowanie zeszłych automatów
window.hCheckAuto = function() {
    window.hInitDb();
    let n = new Date(); 
    let cM = n.getFullYear() + '-' + String(n.getMonth()+1).padStart(2,'0'); 
    let cD = n.getDate(); 
    let added = 0;
    
    if(window.db.home.recurring) {
        window.db.home.recurring.forEach(r => {
            if(r.lastBooked !== cM && cD >= (r.day || 1)) {
                let dObj = new Date(n.getFullYear(), n.getMonth(), r.day || 1, 12, 0, 0);
                window.db.home.trans.push({ 
                    id: Date.now() + Math.random(), 
                    type: r.t, 
                    cat: r.c, 
                    acc: r.a, 
                    d: r.n + ' (Automat)', 
                    v: parseFloat(r.v) || 0, 
                    who: 'System', 
                    dt: dObj.toLocaleDateString('pl-PL'), 
                    rD: dObj.toISOString(), 
                    isPlanned: false 
                });
                r.lastBooked = cM; 
                added++;
            }
        });
    }
    window.hSyncSchedule();
    if(added > 0 && typeof window.save === 'function') { window.save(); }
};
