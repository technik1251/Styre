// ==========================================
// PLIK: home_tab_acc_set.js - Zakładki Konta i Ustawienia (Wersja Premium Czysta)
// ==========================================

window.rHomeAccSet = function(h, t, nav, hdr) {
    let balances = window.hGetBal(); 

    // ==========================================
    // ZAKŁADKA: KONTA (ACCOUNTS)
    // ==========================================
    if(t === 'acc') { 
        let totalAccBal = 0; 
        h.accs.forEach(a => totalAccBal += Math.max(0, parseFloat(balances[a.id]) || 0));
        
        let allocBar = `<div style="width:100%; height:8px; border-radius:4px; overflow:hidden; display:flex; margin-bottom:20px; background:rgba(255,255,255,0.1);">`;
        h.accs.forEach(a => { 
            let bal = parseFloat(balances[a.id]) || 0; 
            if(bal > 0 && totalAccBal > 0) { 
                let pct = (bal / totalAccBal) * 100; 
                allocBar += `<div style="width:${pct}%; background:${a.c}; height:100%;"></div>`; 
            } 
        }); 
        allocBar += `</div>`;
        
        let topActions = `
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button class="btn" style="background:linear-gradient(135deg, var(--life), #0d9488); color:#000; border-radius:12px; font-weight:900; box-shadow:0 4px 20px rgba(20,184,166,0.4); flex:2; padding:12px 10px; font-size:0.8rem; margin:0;" onclick="window.hOpenAccModal()">+ DODAJ KONTO</button>
            <button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:900; flex:1; padding:12px 10px; font-size:0.8rem; margin:0; border:1px solid rgba(255,255,255,0.2);" onclick="window.switchTab('add'); window.hTransType='transfer'; window.render();">🔄 PRZELEW</button>
        </div>`;

        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `
            <div class="dash-hero" style="padding-bottom:10px;">
                <p style="letter-spacing:1px; color:var(--life)">KONTA I PORTFELE</p>
                <h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px;">Zarządzanie</h1>
                <div style="font-size:0.75rem; color:var(--muted); margin-bottom:8px; text-transform:uppercase; font-weight:bold;">Struktura Twojego Majątku</div>
                ${allocBar}
                ${topActions}
            </div>
            
            <div style="padding: 10px 15px;">
                ${h.accs.map(a => {
                    let bal = parseFloat(balances[a.id]) || 0; 
                    let pct = totalAccBal > 0 && bal > 0 ? ((bal / totalAccBal) * 100).toFixed(0) : 0;
                    return `
                    <div class="panel" style="padding:15px; border-left:4px solid ${a.c}; margin-bottom:15px; position:relative;">
                        <div style="position:absolute; right:10px; top:10px; display:flex; gap:10px;">
                            <button style="background:transparent; border:none; color:var(--muted); font-size:1.1rem; cursor:pointer;" onclick="window.hOpenAccModal('${a.id}')">✏️</button>
                            <button style="background:transparent; border:none; color:var(--muted); font-size:1.1rem; cursor:pointer;" onclick="window.hShowIconPicker('${a.id}')">🎨</button>
                            <button style="background:transparent; border:none; color:var(--danger); font-size:1.1rem; cursor:pointer;" onclick="window.hDelAcc('${a.id}')">🗑️</button>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="width:45px; height:45px; border-radius:50%; background:${a.c}22; display:flex; align-items:center; justify-content:center; font-size:1.6rem; border:1px solid ${a.c}55;">${a.i}</div>
                                <div>
                                    <strong style="font-size:1.1rem; color:#fff;">${a.n}</strong>
                                    <small style="color:var(--muted); display:block; margin-top:2px; font-size:0.75rem;">Udział: ${pct}%</small>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:10px; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:0.8rem; color:var(--muted);">Bieżące saldo:</span>
                            <strong style="color:${bal >= 0 ? '#fff' : 'var(--danger)'}; font-size:1.3rem;">${Number(bal || 0).toFixed(2)} zł</strong>
                        </div>
                    </div>`;
                }).join('')}
            </div>` + nav; 
        }
    }

    // ==========================================
    // ZAKŁADKA: USTAWIENIA (SETTINGS)
    // ==========================================
    if(t === 'set') { 
        let isCloud = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
        
        let cloudStatusHtml = isCloud ? 
            `<div style="background:rgba(34,197,94,0.1); border:1px solid var(--success); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;">
                <strong style="color:var(--success); font-size:1.1rem;">☁️ Połączono z chmurą Google</strong><br>
                <span style="font-size:0.8rem; color:var(--success); opacity:0.8;">Zalogowano jako: ${firebase.auth().currentUser.displayName || window.db.userName}</span>
            </div>` : 
            `<div style="background:rgba(239,68,68,0.1); border:1px solid var(--danger); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;">
                <strong style="color:var(--danger); font-size:1.1rem;">🚫 Tryb Offline (Gość)</strong><br>
                <span style="font-size:0.8rem; color:var(--muted); display:block; margin-bottom:10px;">Twoje dane są tylko na tym urządzeniu. Zabezpiecz je!</span>
                <button class="btn" style="background:#fff; color:#000; border:none; padding:12px; font-weight:900; box-shadow:0 4px 15px rgba(255,255,255,0.2);" onclick="window.loginWithGoogle()">G ZALOGUJ PRZEZ GOOGLE</button>
            </div>`;

        let dataSecurityHtml = `
        <div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:10px;">💾 Status Konta i Bezpieczeństwo</div>
        ${cloudStatusHtml}
        <button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:15px; width:100%; margin-bottom:20px; font-weight:bold;" onclick="window.logoutToLauncher()">⚙️ WRÓĆ DO EKRANU STARTOWEGO</button>
        
        <div class="panel" style="border-color:var(--info);">
            <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Możesz w każdej chwili zrobić ręczną kopię zapasową pliku z bazą danych.</p>
            <div style="display:flex; gap:10px;">
                <button class="btn" style="flex:1; background:rgba(255,255,255,0.05); color:var(--info); border:1px dashed var(--info); font-size:0.8rem; padding:12px; margin:0;" onclick="window.hExportData()">📥 POBIERZ PLIK</button>
                <button class="btn" style="flex:1; background:rgba(255,255,255,0.05); color:var(--danger); border:1px dashed var(--danger); font-size:0.8rem; padding:12px; margin:0;" onclick="window.hImportTrigger()">📤 PRZYWRÓĆ PLIK</button>
                <input type="file" id="h-import-file" style="display:none" accept=".json" onchange="window.hImportData(event)">
            </div>
        </div>`;

        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `
            <div class="dash-hero" style="padding-bottom:10px;"><p>USTAWIENIA BUDŻETU</p></div>
            ${dataSecurityHtml}
            
            <div class="section-lbl" style="color:var(--life); border-color:var(--life);">👥 Członkowie Rodziny</div>
            <div class="panel" style="border-color:rgba(20,184,166,0.3);">
                <div class="inp-row">
                    <div class="inp-group"><input type="text" id="h-new-mem" placeholder="Nowy domownik"></div>
                    <button class="btn btn-home" style="width:auto; margin-top:0; padding: 0 20px;" onclick="window.hAddMem()">DODAJ</button>
                </div>
                <div style="margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                    ${h.members.map(m => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--life);">
                        <strong style="color:#fff; font-size:1.1rem;">${m}</strong>
                        ${h.members.length > 1 ? `<button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.hDelMem('${m}')">USUŃ</button>` : `<span style="color:var(--muted); font-size:0.75rem;">(Główny)</span>`}
                    </div>`).join('')}
                </div>
            </div>
            
            <div class="section-lbl" style="color:var(--plan); border-color:var(--plan);">🎯 Limity i Cele miesięczne</div>
            <div class="panel" style="border-color:var(--plan);">
                <div class="inp-group" style="margin-bottom:12px;">
                    <label>Wybierz Kategorię do limitu</label>
                    <select id="hb-cat">${Object.keys(C_EXP).map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
                </div>
                <div class="inp-row">
                    <div class="inp-group"><label>Miesięczny Limit (zł)</label><input type="number" id="hb-val" placeholder="np. 500"></div>
                </div>
                <button class="btn" style="background:var(--plan); color:#fff; padding:15px; margin-bottom:10px;" onclick="window.hSetBudget()">ZAPISZ LIMIT</button>
                <p style="font-size:0.7rem; color:var(--muted); text-align:center; line-height:1.4; margin:0;">Asystent AI powiadomi Cię na ekranie głównym, gdy przekroczysz 75% wydatków na wyznaczony limit.</p>
            </div>
        
            <div class="section-lbl" style="color:#ffdd00; border-color:#ffdd00; margin-top:30px;">☕ Wsparcie projektu StyreOS</div>
            <div class="panel" style="border-color:rgba(255, 221, 0, 0.4); background: linear-gradient(145deg, #1a1a00, #09090b); text-align:center; padding:20px;">
                <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">
                    Podoba Ci się StyreOS? Twoje wsparcie pomaga mi opłacać serwery map i rozwijać nowe funkcje. Każda "kawa" ma znaczenie!
                </p>
                <a href="https://buycoffee.to/styreos" target="_blank" style="background:#ffdd00; color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:15px; border-radius:12px; box-shadow: 0 4px 15px rgba(255, 221, 0, 0.2);">
                    <span style="font-size:1.5rem;">☕</span> POSTAW MI KAWĘ
                </a>
            </div>
            ` + nav; 
        }
    } 
};
