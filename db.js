// Copyright (c) 2026 StyreOS by Technik1251. All rights reserved.
// ==========================================
// PLIK: db.js - BAZA DANYCH I FUNKCJE GLOBALNE
// ==========================================

let defaultDb = {
    init: false, 
    mainProfile: null, 
    role: null, 
    tab: 'term', 
    filter: 'today', 
    filterFrom: null, 
    filterTo: null, 
    userName: '', 
    setupDone: false,
    drv: { 
        plat: 'apps', carType: 'rent', emp: 'partner', liveRideStart: null, showFixed: true, panelMode: 'net',
        cfg: { fix: 0, tax: 0.085, fuelPx: 0.45, fuelCons: 7.0, fuelPriceL: 6.5, bC: 0, cC: 0, cType: 'month', eC: 0, iC: 0, eType: 'flat', ePct: 0, cardF: 0.015, goal: 350, defCity: 'Szczecin' }, 
        odo: 0, q: {s:9, w:39, t1:3.2, t2:4, t3:6.4, t4:8}, 
        sh: {on: false, o: 0, t: null, shiftStart: null, sPT: 0, sPS: null, rWT: 0, rWS: null, tr: []}, h: [], exp: [], fuel: [], clients: [] 
    },
    home: { 
        n: 'Dom', sal: 0, fix: 0, 
        accs: [
            {id:'acc_1', n:'Portfel Głów.', c:'#22c55e', i:'💵', startBal:0},
            {id:'bank', n:'Konto Bankowe', c:'#3b82f6', i:'🏦', startBal:0}, 
            {id:'card', n:'Karta Kredytowa', c:'#f59e0b', i:'💳', startBal:0}
        ],
        trans: [], members: [], budgets: {}, recurring: [], piggy: [], loans: [], debts: [], lastAuto: ""
    }
};

if (typeof window.db === 'undefined') {
    try {
        let loaded = JSON.parse(localStorage.getItem('styre_v101_db'));
        window.db = loaded || defaultDb;
    } catch(e) { 
        window.db = defaultDb; 
    }
}

const STYRE_LOGO = `<div style="display:flex; align-items:center; gap:6px;"><div style="background:linear-gradient(135deg, #3b82f6, #14b8a6); color:#000; border-radius:6px; padding:2px 8px; font-weight:900; font-style:italic; font-size:1.1rem; box-shadow: 0 2px 10px rgba(59,130,246,0.5);">S</div><span style="font-weight:900; font-size:1.2rem; letter-spacing:0.5px;">STYRE<span style="color:var(--muted); font-weight:600;">OS</span></span><span style="font-size:0.7rem; color:var(--muted); margin-left:4px;">⏷</span></div>`;

// Zmienne tymczasowe dla paneli (resetują się po odświeżeniu)
let wData = { p: 'apps', c: 'rent', e: 'partner', mainProfile: null }; 
window.hTransType = 'exp'; window.hSelCat = null; window.hSelAcc = 'acc_1'; window.hMem = null;
window.hRecType = 'exp'; window.hRecCat = 'Stałe opłaty / Czynsz'; window.hRecAcc = 'acc_1'; window.hDebtType = 'they_owe';
window.dInputMode = window.dInputMode || 'single'; window.dOtherSrc = window.dOtherSrc || ''; 

let dTSrc = null; let dTPay = null; let dQM = 'taxi'; let dQN = false; let dQV=0; let dQK=0; let dQM_T=0;

// Narzędzia globalne
window.safeVal = function(id, fallback = 0) { 
    let el = document.getElementById(id); 
    if(el && el.value) { 
        let v = parseFloat(el.value); 
        return isNaN(v) ? fallback : v; 
    } 
    return fallback; 
}
window.getLocalYMD = function(dObj = new Date()) { 
    let tzOffset = dObj.getTimezoneOffset() * 60000; 
    return new Date(dObj.getTime() - tzOffset).toISOString().split('T')[0]; 
}

// System Modali
window.sysAlert = function(title, msg, type="error") { 
    let icon = type === 'error' ? '❌' : (type === 'success' ? '✅' : 'ℹ️'); 
    let color = type === 'error' ? 'var(--danger)' : (type === 'success' ? 'var(--success)' : 'var(--info)'); 
    let html = `<div id="sys-modal" class="modal-overlay" style="z-index: 40000; animation: fadeIn 0.2s;"><div class="panel" style="width:100%; max-width:340px; border-color:${color}; text-align:center; background:#09090b;"><div style="font-size:3.5rem; margin-bottom:10px;">${icon}</div><h3 style="color:${color}; margin:0 0 10px 0; font-weight:900;">${title}</h3><p style="color:var(--muted); font-size:0.95rem; margin-bottom:20px; line-height:1.4;">${msg}</p><button class="btn" style="background:${color}; color:#fff;" onclick="document.getElementById('sys-modal').remove()">ZROZUMIANO</button></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
}

window.sysConfirm = function(title, msg, onConfirm) { 
    let html = `<div id="sys-modal" class="modal-overlay" style="z-index: 40000; animation: fadeIn 0.2s;"><div class="panel" style="width:100%; max-width:340px; border-color:var(--danger); text-align:center; background:#09090b;"><div style="font-size:3.5rem; margin-bottom:10px;">⚠️</div><h3 style="color:var(--danger); margin:0 0 10px 0; font-weight:900;">${title}</h3><p style="color:var(--muted); font-size:0.95rem; margin-bottom:25px; line-height:1.4;">${msg}</p><div style="display:flex; gap:10px;"><button class="btn btn-danger" style="flex:1; margin-top:0;" id="sys-btn-yes">TAK</button><button class="btn" style="background:rgba(255,255,255,0.05); color:var(--muted); border:1px solid rgba(255,255,255,0.1); flex:1; margin-top:0;" onclick="document.getElementById('sys-modal').remove()">ANULUJ</button></div></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
    document.getElementById('sys-btn-yes').onclick = function() { 
        document.getElementById('sys-modal').remove(); 
        onConfirm(); 
    }; 
}

window.sysPrompt = function(title, placeholder, onConfirm) { 
    let html = `<div id="sys-modal" class="modal-overlay" style="z-index: 40000; animation: fadeIn 0.2s;"><div class="panel" style="width:100%; max-width:340px; border-color:var(--info); text-align:center; background:#09090b;"><div style="font-size:3.5rem; margin-bottom:10px;">✏️</div><h3 style="color:var(--info); margin:0 0 15px 0; font-weight:900;">${title}</h3><input type="text" id="sys-prompt-val" class="big-inp" placeholder="${placeholder}" style="margin-bottom:20px;"><div style="display:flex; gap:10px;"><button class="btn" style="background:var(--info); color:#fff; flex:1; margin-top:0;" id="sys-btn-yes">ZAPISZ</button><button class="btn" style="background:rgba(255,255,255,0.05); color:var(--muted); border:1px solid rgba(255,255,255,0.1); flex:1; margin-top:0;" onclick="document.getElementById('sys-modal').remove()">ANULUJ</button></div></div></div>`; 
    document.body.insertAdjacentHTML('beforeend', html); 
    setTimeout(() => document.getElementById('sys-prompt-val').focus(), 100); 
    document.getElementById('sys-btn-yes').onclick = function() { 
        let val = document.getElementById('sys-prompt-val').value; 
        if(val) { 
            document.getElementById('sys-modal').remove(); 
            onConfirm(val); 
        } else { 
            document.getElementById('sys-prompt-val').style.borderColor = 'var(--danger)'; 
        } 
    }; 
}

window.hardReset = function() { 
    window.sysConfirm("TWARDE RESETOWANIE", "Trwałe usunięcie danych z telefonu! Jesteś pewny?", () => { 
        localStorage.clear(); 
        location.reload(); 
    }); 
}

window.dSessionInit = function() { 
    if(!window.db || !window.db.drv) return; 
    if(window.db.drv.plat === 'apps') { 
        if(!['Uber', 'Bolt', 'FreeNow', 'Inna'].includes(dTSrc)) dTSrc = 'Uber'; 
        if(!['Aplikacja', 'Gotówka'].includes(dTPay)) dTPay = 'Aplikacja'; 
    } else { 
        if(!['Centrala', 'Postój', 'Prywatny', 'Inna'].includes(dTSrc)) dTSrc = 'Centrala'; 
        if(!['Gotówka', 'Karta'].includes(dTPay)) dTPay = 'Gotówka'; 
    } 
}
