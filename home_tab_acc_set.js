// ==========================================
// PLIK: home_tab_acc_set.js - Zakładki Konta i Ustawienia (Pancerna Wersja Premium)
// ==========================================

window.rHomeAccSet = function(h, t, nav, hdr) {
    try {
        let balances = typeof window.hGetBal === 'function' ? window.hGetBal() : {}; 

        // ==========================================
        // ZAKŁADKA: KONTA (ACCOUNTS)
        // ==========================================
        if(t === 'acc') { 
            let accs = h.accs || [];
            let totalAccBal = 0; 
            for(let i=0; i<accs.length; i++) {
                let val = parseFloat(balances[accs[i].id]) || 0;
                if (val > 0) totalAccBal += val;
            }
            
            let allocBar = '<div style="width:100%; height:8px; border-radius:4px; overflow:hidden; display:flex; margin-bottom:20px; background:rgba(255,255,255,0.1);">';
            for(let i=0; i<accs.length; i++) {
                let a = accs[i];
                let bal = parseFloat(balances[a.id]) || 0; 
                if(bal > 0 && totalAccBal > 0) { 
                    let pct = (bal / totalAccBal) * 100; 
                    allocBar += '<div style="width:'+pct+'%; background:'+a.c+'; height:100%;"></div>'; 
                } 
            }
            allocBar += '</div>';
            
            let topActions = '<div style="display:flex; gap:10px; margin-bottom:20px;">' +
                '<button class="btn" style="background:linear-gradient(135deg, var(--life), #0d9488); color:#000; border-radius:12px; font-weight:900; box-shadow:0 4px 20px rgba(20,184,166,0.4); flex:2; padding:12px 10px; font-size:0.8rem; margin:0;" onclick="if(typeof window.hOpenAccModal===\'function\') window.hOpenAccModal()">+ DODAJ KONTO</button>' +
                '<button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border-radius:12px; font-weight:900; flex:1; padding:12px 10px; font-size:0.8rem; margin:0; border:1px solid rgba(255,255,255,0.2);" onclick="window.switchTab(\'add\'); window.hTransType=\'transfer\'; window.render();">🔄 PRZELEW</button>' +
            '</div>';

            let accHtml = '';
            for(let i=0; i<accs.length; i++) {
                let a = accs[i];
                let bal = parseFloat(balances[a.id]) || 0; 
                let pct = totalAccBal > 0 && bal > 0 ? ((bal / totalAccBal) * 100).toFixed(0) : 0;
                
                accHtml += '<div class="panel" style="background:linear-gradient(145deg, #18181b, #09090b); padding:20px; border:1px solid rgba(255,255,255,0.05); border-left:4px solid '+a.c+'; margin-bottom:15px; border-radius:16px; position:relative; box-shadow:0 8px 20px rgba(0,0,0,0.4);">' +
                    '<div style="position:absolute; right:-20px; top:-20px; width:100px; height:100px; border-radius:50%; background:'+a.c+'; filter:blur(40px); opacity:0.1; z-index:0; pointer-events:none;"></div>' +
                    '<div style="position:relative; z-index:1;">' +
                        '<div style="position:absolute; right:0; top:0; display:flex; gap:15px; background:rgba(0,0,0,0.5); padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">' +
                            '<span style="font-size:1.1rem; cursor:pointer;" onclick="if(typeof window.hOpenAccModal===\'function\') window.hOpenAccModal(\''+a.id+'\')">✏️</span>' +
                            '<span style="font-size:1.1rem; cursor:pointer;" onclick="if(typeof window.hShowIconPicker===\'function\') window.hShowIconPicker(\''+a.id+'\')">🎨</span>' +
                            '<span style="font-size:1.1rem; cursor:pointer;" onclick="if(typeof window.hDelAcc===\'function\') window.hDelAcc(\''+a.id+'\')">🗑️</span>' +
                        '</div>' +
                        '<div style="display:flex; align-items:center; gap:15px; margin-top:10px;">' +
                            '<div style="width:45px; height:45px; border-radius:12px; background:'+a.c+'22; display:flex; align-items:center; justify-content:center; font-size:1.6rem; border:1px solid '+a.c+'55;">'+(a.i || '💳')+'</div>' +
                            '<div>' +
                                '<strong style="font-size:1.2rem; color:#fff;">'+(a.n || 'Konto')+'</strong>' +
                                '<small style="color:var(--muted); display:block; margin-top:2px; font-size:0.75rem;">Udział: '+pct+'%</small>' +
                            '</div>' +
                        '</div>' +
                        '<div style="margin-top:25px; margin-bottom:20px; background:rgba(255,255,255,0.02); padding:15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">' +
                            '<span style="font-size:0.8rem; color:var(--muted); text-transform:uppercase;">Bieżące saldo</span>' +
                            '<strong style="color:'+(bal >= 0 ? '#fff' : 'var(--danger)')+'; font-size:1.6rem; letter-spacing:-1px;">'+Number(bal).toFixed(2)+' zł</strong>' +
                        '</div>' +
                        '<div style="display:flex; gap:10px;">' +
                            '<button style="flex:1; background:rgba(34,197,94,0.15); color:var(--success); border:1px solid rgba(34,197,94,0.3); border-radius:10px; padding:12px; font-weight:bold; font-size:0.8rem; cursor:pointer;" onclick="window.hTempValue=\'\'; window.hTransType=\'inc\'; window.hSelAcc=\''+a.id+'\'; window.switchTab(\'add\')">+ WPŁYW</button>' +
                            '<button style="flex:1; background:rgba(239,68,68,0.15); color:var(--danger); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:12px; font-weight:bold; font-size:0.8rem; cursor:pointer;" onclick="window.hTempValue=\'\'; window.hTransType=\'exp\'; window.hSelAcc=\''+a.id+'\'; window.switchTab(\'add\')">- WYDATEK</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }

            let appContainer = document.getElementById('app');
            if(appContainer) {
                appContainer.innerHTML = hdr + 
                '<div class="dash-hero" style="padding-bottom:10px;">' +
                    '<p style="letter-spacing:1px; color:var(--life)">KONTA I PORTFELE</p>' +
                    '<h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px;">Zarządzanie</h1>' +
                    '<div style="font-size:0.75rem; color:var(--muted); margin-bottom:8px; text-transform:uppercase; font-weight:bold;">Struktura Twojego Majątku</div>' +
                    allocBar + topActions +
                '</div>' +
                '<div style="padding: 10px 15px;">' + accHtml + '</div>' +
                '<div style="padding-bottom:60px;"></div>' + (nav||''); 
            }
        }

        // ==========================================
        // ZAKŁADKA: USTAWIENIA (SETTINGS)
        // ==========================================
        else if(t === 'set') { 
            let isCloud = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
            let mems = h.members || [];
            
            let cloudStatusHtml = isCloud ? 
                '<div style="background:rgba(34,197,94,0.1); border:1px solid var(--success); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;">' +
                    '<strong style="color:var(--success); font-size:1.1rem;">☁️ Połączono z chmurą Google</strong><br>' +
                    '<span style="font-size:0.8rem; color:var(--success); opacity:0.8;">Zalogowano jako: '+(firebase.auth().currentUser.displayName || window.db.userName)+'</span>' +
                '</div>' : 
                '<div style="background:rgba(239,68,68,0.1); border:1px solid var(--danger); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;">' +
                    '<strong style="color:var(--danger); font-size:1.1rem;">🚫 Tryb Offline (Gość)</strong><br>' +
                    '<span style="font-size:0.8rem; color:var(--muted); display:block; margin-bottom:10px;">Twoje dane są tylko na tym urządzeniu. Zabezpiecz je!</span>' +
                    '<button class="btn" style="background:#fff; color:#000; border:none; padding:12px; font-weight:900; box-shadow:0 4px 15px rgba(255,255,255,0.2);" onclick="if(typeof window.loginWithGoogle===\'function\') window.loginWithGoogle()">G ZALOGUJ PRZEZ GOOGLE</button>' +
                '</div>';

            let dataSecurityHtml = '<div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:10px;">💾 Status Konta i Bezpieczeństwo</div>' +
            cloudStatusHtml +
            '<button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:15px; width:100%; margin-bottom:20px; font-weight:bold;" onclick="if(typeof window.logoutToLauncher===\'function\') window.logoutToLauncher()">⚙️ WRÓĆ DO EKRANU STARTOWEGO</button>' +
            '<div class="panel" style="border-color:var(--info);">' +
                '<p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Możesz w każdej chwili zrobić ręczną kopię zapasową pliku z bazą danych.</p>' +
                '<div style="display:flex; gap:10px;">' +
                    '<button class="btn" style="flex:1; background:rgba(255,255,255,0.05); color:var(--info); border:1px dashed var(--info); font-size:0.8rem; padding:12px; margin:0;" onclick="if(typeof window.hExportData===\'function\') window.hExportData()">📥 POBIERZ PLIK</button>' +
                    '<button class="btn" style="flex:1; background:rgba(255,255,255,0.05); color:var(--danger); border:1px dashed var(--danger); font-size:0.8rem; padding:12px; margin:0;" onclick="if(typeof window.hImportTrigger===\'function\') window.hImportTrigger()">📤 PRZYWRÓĆ PLIK</button>' +
                    '<input type="file" id="h-import-file" style="display:none" accept=".json" onchange="if(typeof window.hImportData===\'function\') window.hImportData(event)">' +
                '</div>' +
            '</div>';

            let membersHtml = '';
            for(let i=0; i<mems.length; i++) {
                let m = mems[i];
                let delBtn = mems.length > 1 ? '<button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="if(typeof window.hDelMem===\'function\') window.hDelMem(\''+m+'\')">USUŃ</button>' : '<span style="color:var(--muted); font-size:0.75rem;">(Główny)</span>';
                membersHtml += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--life);">' +
                    '<strong style="color:#fff; font-size:1.1rem;">'+m+'</strong>' + delBtn +
                '</div>';
            }

            let catOptions = '';
            if(typeof C_EXP !== 'undefined') {
                let keys = Object.keys(C_EXP);
                for(let i=0; i<keys.length; i++) {
                    catOptions += '<option value="'+keys[i]+'">'+keys[i]+'</option>';
                }
            }

            let appContainer = document.getElementById('app');
            if(appContainer) {
                appContainer.innerHTML = hdr + 
                '<div class="dash-hero" style="padding-bottom:10px;"><p>USTAWIENIA BUDŻETU</p></div>' +
                dataSecurityHtml +
                '<div class="section-lbl" style="color:var(--life); border-color:var(--life);">👥 Członkowie Rodziny</div>' +
                '<div class="panel" style="border-color:rgba(20,184,166,0.3);">' +
                    '<div class="inp-row">' +
                        '<div class="inp-group"><input type="text" id="h-new-mem" placeholder="Nowy domownik"></div>' +
                        '<button class="btn btn-home" style="width:auto; margin-top:0; padding: 0 20px;" onclick="if(typeof window.hAddMem===\'function\') window.hAddMem()">DODAJ</button>' +
                    '</div>' +
                    '<div style="margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">' + membersHtml + '</div>' +
                '</div>' +
                '<div class="section-lbl" style="color:var(--plan); border-color:var(--plan);">🎯 Limity i Cele miesięczne</div>' +
                '<div class="panel" style="border-color:var(--plan);">' +
                    '<div class="inp-group" style="margin-bottom:12px;">' +
                        '<label>Wybierz Kategorię do limitu</label>' +
                        '<select id="hb-cat">' + catOptions + '</select>' +
                    '</div>' +
                    '<div class="inp-row">' +
                        '<div class="inp-group"><label>Miesięczny Limit (zł)</label><input type="number" id="hb-val" placeholder="np. 500"></div>' +
                    '</div>' +
                    '<button class="btn" style="background:var(--plan); color:#fff; padding:15px; margin-bottom:10px;" onclick="if(typeof window.hSetBudget===\'function\') window.hSetBudget()">ZAPISZ LIMIT</button>' +
                    '<p style="font-size:0.7rem; color:var(--muted); text-align:center; line-height:1.4; margin:0;">Asystent AI powiadomi Cię na ekranie głównym, gdy przekroczysz 75% wydatków na wyznaczony limit.</p>' +
                '</div>' +
                '<div class="section-lbl" style="color:#ffdd00; border-color:#ffdd00; margin-top:30px;">☕ Wsparcie projektu StyreOS</div>' +
                '<div class="panel" style="border-color:rgba(255, 221, 0, 0.4); background: linear-gradient(145deg, #1a1a00, #09090b); text-align:center; padding:20px;">' +
                    '<p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Podoba Ci się StyreOS? Twoje wsparcie pomaga mi opłacać serwery map i rozwijać nowe funkcje. Każda "kawa" ma znaczenie!</p>' +
                    '<a href="https://buycoffee.to/styreos" target="_blank" style="background:#ffdd00; color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:15px; border-radius:12px; box-shadow: 0 4px 15px rgba(255, 221, 0, 0.2);">' +
                        '<span style="font-size:1.5rem;">☕</span> POSTAW MI KAWĘ' +
                    '</a>' +
                '</div>' +
                '<div style="padding-bottom:60px;"></div>' + (nav||''); 
            }
        } 
    } catch(err) {
        console.error(err);
        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = '<div style="padding:40px 20px; text-align:center; color:white;"><h3>Błąd w Kontach</h3><p style="color:var(--danger);">' + err.message + '</p><button style="padding:15px; background:#fff; color:#000; font-weight:bold; border-radius:12px; border:none; margin-top:20px;" onclick="window.location.reload()">ODŚWIEŻ</button></div>' + (nav || '');
        }
    }
};
