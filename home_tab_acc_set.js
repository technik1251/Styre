// ==========================================
// PLIK: home_tab_acc_set.js - Zakładki Konta i Ustawienia (Ekskluzywne Premium)
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
            
            let allocBar = '<div style="width:100%; height:6px; border-radius:3px; overflow:hidden; display:flex; margin-bottom:25px; background:rgba(255,255,255,0.05); box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);">';
            for(let i=0; i<accs.length; i++) {
                let a = accs[i];
                let bal = parseFloat(balances[a.id]) || 0; 
                if(bal > 0 && totalAccBal > 0) { 
                    let pct = (bal / totalAccBal) * 100; 
                    allocBar += '<div style="width:'+pct+'%; background:'+a.c+'; height:100%; box-shadow: 0 0 10px '+a.c+';"></div>'; 
                } 
            }
            allocBar += '</div>';
            
            let topActions = '<div style="display:flex; gap:12px; margin-bottom:10px;">' +
                '<button class="btn" style="background:linear-gradient(135deg, #d4af37 0%, #aa801a 100%); color:#000; border-radius:14px; font-weight:900; box-shadow:0 6px 20px rgba(212, 175, 55, 0.3); flex:2; padding:16px 10px; font-size:0.85rem; letter-spacing:1px; margin:0; border:none;" onclick="if(typeof window.hOpenAccModal===\'function\') window.hOpenAccModal()">+ DODAJ PORTFEL</button>' +
                '<button class="btn" style="background:rgba(255,255,255,0.05); color:#fff; border-radius:14px; font-weight:900; flex:1; padding:16px 10px; font-size:0.85rem; letter-spacing:1px; margin:0; border:1px solid rgba(255,255,255,0.1);" onclick="window.switchTab(\'add\'); window.hTransType=\'transfer\'; window.render();">🔄 PRZELEW</button>' +
            '</div>';

            let accHtml = '';
            for(let i=0; i<accs.length; i++) {
                let a = accs[i];
                let bal = parseFloat(balances[a.id]) || 0; 
                let pct = totalAccBal > 0 && bal > 0 ? ((bal / totalAccBal) * 100).toFixed(0) : 0;
                
                // Elegancka karta konta (Styl Apple Wallet / Revolut Metal)
                accHtml += '<div class="panel" style="background:linear-gradient(145deg, #1c1c1e 0%, #0d0d0f 100%); padding:22px; border:1px solid rgba(255,255,255,0.03); margin-bottom:20px; border-radius:24px; position:relative; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.6);">' +
                    // Świecąca poświata w tle (zgodna z kolorem konta)
                    '<div style="position:absolute; top:-40px; right:-40px; width:150px; height:150px; border-radius:50%; background:'+a.c+'; filter:blur(60px); opacity:0.15; z-index:0; pointer-events:none;"></div>' +
                    
                    '<div style="position:relative; z-index:1;">' +
                        // Nagłówek Karty (Ikona + Nazwa + Menu Admina)
                        '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                            '<div style="display:flex; align-items:center; gap:15px;">' +
                                '<div style="width:48px; height:48px; border-radius:14px; background:'+a.c+'22; display:flex; align-items:center; justify-content:center; font-size:1.6rem; border:1px solid '+a.c+'44; box-shadow: inset 0 2px 5px rgba(255,255,255,0.1);">'+(a.i || '💳')+'</div>' +
                                '<div>' +
                                    '<strong style="font-size:1.2rem; color:#fff; letter-spacing:0.5px;">'+(a.n || 'Konto')+'</strong>' +
                                    '<span style="color:var(--muted); display:block; margin-top:3px; font-size:0.7rem; text-transform:uppercase; letter-spacing:1px;">Konto Premium • '+pct+'%</span>' +
                                '</div>' +
                            '</div>' +
                            
                            // Dyskretne menu administracyjne
                            '<div style="display:flex; gap:10px; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">' +
                                '<span style="font-size:1rem; cursor:pointer; opacity:0.7;" onclick="if(typeof window.hOpenAccModal===\'function\') window.hOpenAccModal(\''+a.id+'\')">✏️</span>' +
                                '<span style="font-size:1rem; cursor:pointer; opacity:0.7;" onclick="if(typeof window.hShowIconPicker===\'function\') window.hShowIconPicker(\''+a.id+'\')">🎨</span>' +
                                '<span style="font-size:1rem; cursor:pointer; opacity:0.7;" onclick="if(typeof window.hDelAcc===\'function\') window.hDelAcc(\''+a.id+'\')">🗑️</span>' +
                            '</div>' +
                        '</div>' +
                        
                        // Wielka Kwota
                        '<div style="margin-top:30px; margin-bottom:25px;">' +
                            '<span style="font-size:0.7rem; color:var(--muted); text-transform:uppercase; font-weight:bold; letter-spacing:2px;">Dostępne Środki</span><br>' +
                            '<strong style="color:'+(bal >= 0 ? '#fff' : 'var(--danger)')+'; font-size:2.6rem; letter-spacing:-1px; display:block; margin-top:5px; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">'+Number(bal).toFixed(2)+' zł</strong>' +
                        '</div>' +
                        
                        // Przyciski Akcji (Pills)
                        '<div style="display:flex; gap:12px;">' +
                            '<button style="flex:1; background:rgba(34,197,94,0.1); color:var(--success); border:1px solid rgba(34,197,94,0.2); border-radius:14px; padding:14px; font-weight:900; font-size:0.75rem; letter-spacing:1px; cursor:pointer;" onclick="window.hTempValue=\'\'; window.hTransType=\'inc\'; window.hSelAcc=\''+a.id+'\'; window.switchTab(\'add\')">+ WPŁYW</button>' +
                            '<button style="flex:1; background:rgba(239,68,68,0.1); color:var(--danger); border:1px solid rgba(239,68,68,0.2); border-radius:14px; padding:14px; font-weight:900; font-size:0.75rem; letter-spacing:1px; cursor:pointer;" onclick="window.hTempValue=\'\'; window.hTransType=\'exp\'; window.hSelAcc=\''+a.id+'\'; window.switchTab(\'add\')">- WYDATEK</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }

            let appContainer = document.getElementById('app');
            if(appContainer) {
                appContainer.innerHTML = hdr + 
                '<div class="dash-hero" style="padding-bottom:10px;">' +
                    '<p style="letter-spacing:2px; color:#d4af37; font-weight:bold; font-size:0.7rem;">STYREOS PRO</p>' +
                    '<h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px; font-weight:900; letter-spacing:-1px;">Twój Kapitał</h1>' +
                    '<div style="font-size:0.7rem; color:var(--muted); margin-bottom:10px; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">Struktura Majątku Netto</div>' +
                    allocBar + topActions +
                '</div>' +
                '<div style="padding: 10px 15px;">' + accHtml + '</div>' +
                '<div style="padding-bottom:80px;"></div>' + (nav||''); 
            }
        }

        // ==========================================
        // ZAKŁADKA: USTAWIENIA (SETTINGS)
        // ==========================================
        else if(t === 'set') { 
            let isCloud = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
            let mems = h.members || [];
            
            let cloudStatusHtml = isCloud ? 
                '<div style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">' +
                    '<strong style="color:var(--success); font-size:1.1rem;">☁️ Chmura Aktywna</strong><br>' +
                    '<span style="font-size:0.8rem; color:var(--success); opacity:0.8;">Zalogowano: '+(firebase.auth().currentUser.displayName || window.db.userName)+'</span>' +
                '</div>' : 
                '<div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); padding:20px; border-radius:16px; margin-bottom:20px; text-align:center;">' +
                    '<strong style="color:var(--danger); font-size:1.1rem;">🚫 Tryb Gościa (Offline)</strong><br>' +
                    '<span style="font-size:0.8rem; color:var(--muted); display:block; margin-bottom:15px;">Twoje dane nie są synchronizowane. Zabezpiecz je!</span>' +
                    '<button class="btn" style="background:#fff; color:#000; border:none; border-radius:12px; padding:15px; font-weight:900; box-shadow:0 4px 15px rgba(255,255,255,0.2);" onclick="if(typeof window.loginWithGoogle===\'function\') window.loginWithGoogle()">ZALOGUJ PRZEZ GOOGLE</button>' +
                '</div>';

            let dataSecurityHtml = '<div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:10px;">💾 Centrum Bezpieczeństwa</div>' +
            cloudStatusHtml +
            '<button class="btn" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:18px; width:100%; margin-bottom:25px; font-weight:bold; letter-spacing:1px;" onclick="if(typeof window.logoutToLauncher===\'function\') window.logoutToLauncher()">⚙️ EKRAN STARTOWY</button>' +
            '<div class="panel" style="border-color:rgba(14,165,233,0.3); border-radius:20px; padding:20px;">' +
                '<p style="font-size:0.8rem; color:var(--muted); margin-bottom:20px; line-height:1.5;">Wykonaj kopię zapasową swoich danych finansowych. Plik JSON zostanie pobrany do pamięci telefonu.</p>' +
                '<div style="display:flex; gap:12px;">' +
                    '<button class="btn" style="flex:1; background:rgba(14,165,233,0.1); color:var(--info); border:1px solid rgba(14,165,233,0.3); border-radius:12px; font-size:0.8rem; font-weight:bold; padding:15px; margin:0;" onclick="if(typeof window.hExportData===\'function\') window.hExportData()">📥 POBIERZ</button>' +
                    '<button class="btn" style="flex:1; background:rgba(239,68,68,0.1); color:var(--danger); border:1px solid rgba(239,68,68,0.3); border-radius:12px; font-size:0.8rem; font-weight:bold; padding:15px; margin:0;" onclick="if(typeof window.hImportTrigger===\'function\') window.hImportTrigger()">📤 PRZYWRÓĆ</button>' +
                    '<input type="file" id="h-import-file" style="display:none" accept=".json" onchange="if(typeof window.hImportData===\'function\') window.hImportData(event)">' +
                '</div>' +
            '</div>';

            let membersHtml = '';
            for(let i=0; i<mems.length; i++) {
                let m = mems[i];
                let delBtn = mems.length > 1 ? '<button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:8px 15px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.75rem;" onclick="if(typeof window.hDelMem===\'function\') window.hDelMem(\''+m+'\')">USUŃ</button>' : '<span style="color:var(--muted); font-size:0.75rem; background:rgba(255,255,255,0.05); padding:5px 10px; border-radius:8px;">Główny</span>';
                membersHtml += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:15px 20px; border-radius:16px; margin-bottom:12px; border-left:4px solid var(--life);">' +
                    '<strong style="color:#fff; font-size:1.1rem; letter-spacing:0.5px;">'+m+'</strong>' + delBtn +
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
                '<div class="dash-hero" style="padding-bottom:10px;">' +
                    '<p style="letter-spacing:2px; color:var(--muted); font-weight:bold; font-size:0.7rem;">ZAAWANSOWANE</p>' +
                    '<h1 style="color:#fff; font-size:2.5rem; margin-bottom:20px; font-weight:900; letter-spacing:-1px;">Opcje</h1>' +
                '</div>' +
                '<div style="padding: 0 15px;">' +
                    dataSecurityHtml +
                    '<div class="section-lbl" style="color:var(--life); border-color:var(--life); margin-top:30px;">👥 Zespół Domowy</div>' +
                    '<div class="panel" style="border-color:rgba(20,184,166,0.3); border-radius:20px; padding:20px;">' +
                        '<div class="inp-row" style="display:flex; gap:10px;">' +
                            '<div class="inp-group" style="flex:1;"><input type="text" id="h-new-mem" placeholder="Nazwa profilu" style="background:rgba(255,255,255,0.05); border-radius:12px; padding:15px;"></div>' +
                            '<button class="btn btn-home" style="width:auto; margin-top:0; padding: 0 25px; border-radius:12px; font-weight:900;" onclick="if(typeof window.hAddMem===\'function\') window.hAddMem()">DODAJ</button>' +
                        '</div>' +
                        '<div style="margin-top:20px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:20px;">' + membersHtml + '</div>' +
                    '</div>' +
                    
                    '<div class="section-lbl" style="color:var(--plan); border-color:var(--plan); margin-top:30px;">🎯 Smart Limity</div>' +
                    '<div class="panel" style="border-color:rgba(217,70,239,0.3); border-radius:20px; padding:20px;">' +
                        '<div class="inp-group" style="margin-bottom:15px;">' +
                            '<label style="font-size:0.7rem; color:var(--muted); font-weight:bold; text-transform:uppercase;">Kategoria wydatków</label>' +
                            '<select id="hb-cat" style="background:rgba(255,255,255,0.05); border-radius:12px; padding:15px; margin-top:5px;">' + catOptions + '</select>' +
                        '</div>' +
                        '<div class="inp-row">' +
                            '<div class="inp-group">' +
                                '<label style="font-size:0.7rem; color:var(--muted); font-weight:bold; text-transform:uppercase;">Miesięczny Limit (zł)</label>' +
                                '<input type="number" id="hb-val" placeholder="np. 500" style="background:rgba(255,255,255,0.05); border-radius:12px; padding:15px; margin-top:5px;">' +
                            '</div>' +
                        '</div>' +
                        '<button class="btn" style="background:var(--plan); color:#fff; border-radius:14px; padding:16px; margin-top:15px; margin-bottom:15px; font-weight:900; letter-spacing:1px;" onclick="if(typeof window.hSetBudget===\'function\') window.hSetBudget()">ZAPISZ LIMIT</button>' +
                        '<p style="font-size:0.75rem; color:var(--muted); text-align:center; line-height:1.5; margin:0;">Asystent AI powiadomi Cię na ekranie głównym, gdy przekroczysz 75% limitu.</p>' +
                    '</div>' +
                
                    '<div class="section-lbl" style="color:#ffdd00; border-color:#ffdd00; margin-top:40px;">☕ Wesprzyj Projekt</div>' +
                    '<div class="panel" style="border-color:rgba(255, 221, 0, 0.3); background: linear-gradient(145deg, #1a1a00, #09090b); text-align:center; padding:25px; border-radius:20px;">' +
                        '<div style="font-size:3rem; margin-bottom:15px;">🚀</div>' +
                        '<p style="font-size:0.85rem; color:var(--muted); margin-bottom:20px; line-height:1.6;">Podoba Ci się StyreOS? Pomóż utrzymać serwery i rozwijać nowe funkcje. Każda wirtualna kawa przybliża nas do wydania wersji PRO!</p>' +
                        '<a href="https://buycoffee.to/styreos" target="_blank" style="background:linear-gradient(135deg, #ffdd00, #ffaa00); color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:18px; border-radius:14px; box-shadow: 0 8px 25px rgba(255, 221, 0, 0.3); font-size:1rem; letter-spacing:1px;">' +
                            '<span style="font-size:1.5rem;">☕</span> POSTAW KAWĘ' +
                        '</a>' +
                    '</div>' +
                '</div>' +
                '<div style="padding-bottom:80px;"></div>' + (nav||''); 
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
