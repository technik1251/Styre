// ==========================================
// PLIK: taxi_tab_set.js - Zakładka Ustawienia (Set)
// ==========================================

window.rDrvSet = function(d, t, nav, hdr) {
    if(t === 'set') {
        let isCloud = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
        let cloudStatusHtml = isCloud ? 
            `<div style="background:rgba(34,197,94,0.1); border:1px solid var(--success); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;"><strong style="color:var(--success); font-size:1.1rem;">☁️ Połączono z chmurą Google</strong><br><span style="font-size:0.8rem; color:var(--success); opacity:0.8;">Zalogowano jako: ${firebase.auth().currentUser.displayName || window.db.userName}</span></div>` : 
            `<div style="background:rgba(239,68,68,0.1); border:1px solid var(--danger); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;">
                <strong style="color:var(--danger); font-size:1.1rem;">🚫 Tryb Offline (Gość)</strong><br>
                <span style="font-size:0.8rem; color:var(--muted); display:block; margin-bottom:10px;">Twoje dane są tylko na tym urządzeniu. Zabezpiecz je!</span>
                <button class="btn" style="background:#fff; color:#000; border:none; padding:12px; font-weight:900; box-shadow:0 4px 15px rgba(255,255,255,0.2);" onclick="window.loginWithGoogle()">G ZALOGUJ PRZEZ GOOGLE</button>
            </div>`;

        let q = d.q || {s:0, w:0, t1:0, t2:0, t3:0, t4:0};

        let appContainer = document.getElementById('app');
        if(appContainer) {
            appContainer.innerHTML = hdr + `
            <div class="dash-hero" style="padding-bottom:0; padding-top:10px;"><p>KONTROLA TWOJEJ FIRMY</p></div>
            
            <div class="section-lbl" style="color:var(--info); border-color:var(--info); margin-top:10px;">💾 Status Konta</div>
            <div style="padding: 0 15px;">
                ${cloudStatusHtml}
                <button class="btn" style="background:rgba(255,255,255,0.1); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:15px; width:100%; margin-bottom:20px; font-weight:bold;" onclick="window.logoutToLauncher()">⚙️ WRÓĆ DO EKRANU STARTOWEGO</button>
            </div>

            <div class="section-lbl" style="color:var(--quote); border-color:var(--quote);">🧮 Ustawienia Taryfikatora (Wycena)</div>
            <div class="panel">
                <div class="grid-2">
                    <div class="inp-group"><label>Opłata początkowa</label><input type="number" id="dcs" value="${q.s || 0}"></div>
                    <div class="inp-group"><label>1h Postoju</label><input type="number" id="dcw" value="${q.w || 0}"></div>
                </div>
                <div class="grid-4" style="grid-template-columns:1fr 1fr 1fr 1fr; gap:8px;">
                    <div class="inp-group"><label>T1</label><input type="number" id="dct1" value="${q.t1 || 0}"></div>
                    <div class="inp-group"><label>T2</label><input type="number" id="dct2" value="${q.t2 || 0}"></div>
                    <div class="inp-group"><label>T3</label><input type="number" id="dct3" value="${q.t3 || 0}"></div>
                    <div class="inp-group"><label>T4</label><input type="number" id="dct4" value="${q.t4 || 0}"></div>
                </div>
                <button class="btn" style="background:var(--quote); color:#fff; margin-top:10px;" onclick="window.dSaveQC()">ZAPISZ TARYFY</button>
            </div>

            <div class="section-lbl" style="color:var(--success); border-color:var(--success);">👤 Personalizacja i Miasto</div>
            <div class="panel">
                <div class="inp-row">
                    <div class="inp-group"><label>Twoje Imię</label><input type="text" id="us-name" value="${window.db.userName || ''}"></div>
                    <div class="inp-group"><label>Cel Dzienny (zł)</label><input type="number" id="us-goal" value="${(d.cfg||{}).goal||350}"></div>
                </div>
                <div class="inp-group" style="margin-top:10px;"><label>Domyślne Miasto (Dla map)</label><input type="text" id="us-city" value="${(d.cfg||{}).defCity||'Szczecin'}" style="border-color:var(--success);"></div>
            </div>

            <div class="section-lbl" style="color:var(--fuel); border-color:var(--fuel);">⛽ Koszty Paliwa na KM</div>
            <div class="panel" style="border-color:rgba(245,158,11,0.4);">
                <div class="inp-row">
                    <div class="inp-group"><label>Średnie spalanie (L/100km)</label><input type="number" id="us-fcons" step="0.1" value="${(d.cfg||{}).fuelCons||7.0}"></div>
                    <div class="inp-group"><label>Cena paliwa na stacji (zł/L)</label><input type="number" id="us-fprice" step="0.01" value="${(d.cfg||{}).fuelPriceL||6.5}"></div>
                </div>
                <p style="font-size:0.7rem; color:var(--muted); margin-top:10px; line-height:1.4;">Zapisz, jeśli nie chcesz prowadzić dziennika tankowań (zakładka Garaż). Aplikacja sama wyliczy koszt kilometra.</p>
            </div>

            <div class="section-lbl" style="color:var(--driver); border-color:var(--driver);">🚗 Koszty Auta i Bazy</div>
            <div class="panel">
                <div class="inp-row">
                    <div class="inp-group"><label>Rata / Wynajem (zł)</label><input type="number" id="us-cc" value="${(d.cfg||{}).cC||0}"></div>
                    <div class="inp-group"><label>Okres</label><select id="us-ctype"><option value="week" ${(d.cfg||{}).cType==='week'?'selected':''}>Tydzień</option><option value="month" ${(d.cfg||{}).cType==='month'?'selected':''}>Miesiąc</option></select></div>
                </div>
                <div class="inp-row">
                    <div class="inp-group"><label>Baza / Korpo (zł)</label><input type="number" id="us-bc" value="${(d.cfg||{}).bC||0}"></div>
                    <div class="inp-group"><label>Okres</label><select id="us-b-period"><option value="week" ${(d.cfg||{}).bPeriod==='week'?'selected':''}>Tydzień</option><option value="month" ${(d.cfg||{}).bPeriod!=='week'?'selected':''}>Miesiąc</option></select></div>
                </div>
                <div class="inp-row">
                    <div class="inp-group"><label>Inne (Księgowa itp.)</label><input type="number" id="us-ic" value="${(d.cfg||{}).iC||0}"></div>
                    <div class="inp-group"><label>Okres</label><select id="us-i-period"><option value="week" ${(d.cfg||{}).iPeriod==='week'?'selected':''}>Tydzień</option><option value="month" ${(d.cfg||{}).iPeriod!=='week'?'selected':''}>Miesiąc</option></select></div>
                </div>
                <div class="inp-row">
                    <div class="inp-group"><label>Ubezpieczenie (zł)</label><input type="number" id="us-uc" value="${(d.cfg||{}).uC||0}"></div>
                    <div class="inp-group"><label>Okres</label><select id="us-utype"><option value="month" ${(d.cfg||{}).uType==='month'||!(d.cfg||{}).uType?'selected':''}>Miesiąc</option><option value="year" ${(d.cfg||{}).uType==='year'?'selected':''}>Rok</option></select></div>
                </div>
            </div>

            <div class="section-lbl" style="color:var(--info); border-color:var(--info);">⚖️ Podatki i Prowizje</div>
            <div class="panel">
                <div class="inp-group" style="margin-bottom:15px;">
                    <label>Rozliczenie z Partnerem/ZUS</label>
                    <select id="us-etype" onchange="window.dTogglePType('us')"><option value="flat" ${(d.cfg||{}).eType==='flat'?'selected':''}>Stała kwota (Partner / ZUS)</option><option value="pct" ${(d.cfg||{}).eType==='pct'?'selected':''}>Procent (Prowizja)</option></select>
                </div>
                <div class="inp-row" id="us-p-flat-box" style="display:${(d.cfg||{}).eType==='flat'?'flex':'none'}; margin-bottom:15px;">
                    <div class="inp-group"><label>Kwota stała (zł)</label><input type="number" id="us-ec" value="${(d.cfg||{}).eC||0}"></div>
                    <div class="inp-group"><label>Okres</label><select id="us-e-period"><option value="week" ${(d.cfg||{}).ePeriod==='week'?'selected':''}>Tydzień</option><option value="month" ${(d.cfg||{}).ePeriod!=='week'?'selected':''}>Miesiąc</option></select></div>
                </div>
                <div id="us-p-pct-box" style="display:${(d.cfg||{}).eType==='pct'?'block':'none'}; margin-bottom:15px;">
                    <div class="inp-group"><label>Prowizja Partnera (%)</label><input type="number" id="us-epct" value="${Number((d.cfg||{}).ePct*100||0).toFixed(0)}"></div>
                </div>
                <div class="inp-row">
                    <div class="inp-group"><label>Podatek / VAT (%)</label><input type="number" id="us-tx" value="${Number((d.cfg||{}).tax*100||0).toFixed(1)}" step="0.1"></div>
                    <div class="inp-group"><label>Prow. Terminala (%)</label><input type="number" id="us-cf" value="${Number((d.cfg||{}).cardF*100||0).toFixed(1)}" step="0.1"></div>
                </div>
                <div class="inp-group" style="margin-top:15px;">
                    <label>Prowizja Vouchera (%)</label><input type="number" id="us-vf" value="${Number((d.cfg||{}).voucherF*100||0).toFixed(1)}" step="0.1">
                </div>
            </div>

            <div class="section-lbl" style="color:var(--quote); border-color:var(--quote);">👥 Klienci VIP</div>
            <div class="panel">
                <div class="inp-row">
                    <div class="inp-group"><label>Imię</label><input type="text" id="dc-n"></div>
                    <div class="inp-group"><label>Telefon</label><input type="text" id="dc-p"></div>
                </div>
                <div class="inp-group" style="margin-bottom:15px;"><label>Rabat (%)</label><input type="number" id="dc-d"></div>
                <button class="btn btn-quote" onclick="window.dAddCrm()">+ DODAJ DO BAZY</button>
                <div style="margin-top:20px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;">
                    ${(d.clients||[]).map(c => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px 15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--quote);">
                        <div>
                            <strong style="color:#fff; font-size:1rem;">${c.n}</strong>
                            <span style="background:var(--quote); color:#fff; font-size:0.7rem; padding:2px 6px; border-radius:6px; margin-left:8px; font-weight:bold;">-${c.d||0}%</span><br>
                            <small style="color:var(--muted)">${c.ph||'Brak numeru'}</small>
                        </div>
                        <button style="background:rgba(239,68,68,0.15); color:var(--danger); border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.dCrmDel(${c.id})">USUŃ</button>
                    </div>`).join('') || '<div style="text-align:center; color:var(--muted); font-size:0.85rem; padding:10px;">Brak klientów.</div>'}
                </div>
            </div>

            <div class="section-lbl" style="color:var(--warning); border-color:var(--warning);">💾 Bezpieczeństwo Danych</div>
            <div class="panel" style="border-color:rgba(245, 158, 11, 0.4)">
                <p style="font-size:0.75rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">Twoje dane są zapisane tylko w tym telefonie (100% Prywatności). Zrób kopię zapasową, aby przenieść profil na inne urządzenie lub zabezpieczyć się przed wyczyszczeniem przeglądarki!</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn" style="background:rgba(245,158,11,0.1); color:var(--warning); border:1px dashed var(--warning); flex:1; font-size:0.75rem; padding:10px;" onclick="window.dExport()">📥 POBIERZ PLIK</button>
                    <label class="btn" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); flex:1; text-align:center; cursor:pointer; font-size:0.75rem; padding:10px; margin:0;">📤 PRZYWRÓĆ PLIK<input type="file" style="display:none" accept=".json" onchange="window.dImport(event)"></label>
                </div>
            </div>

            <div style="padding: 0 15px;">
                <button class="btn btn-driver" style="margin-bottom:30px;" onclick="window.dSaveUS()">💾 ZAKTUALIZUJ USTAWIENIA</button>
            </div>

            <div class="section-lbl" style="color:#ffdd00; border-color:#ffdd00; margin-top:30px;">☕ Wsparcie projektu StyreOS</div>
            <div class="panel" style="border-color:rgba(255, 221, 0, 0.4); background: linear-gradient(145deg, #1a1a00, #09090b); text-align:center; padding:20px;">
                <p style="font-size:0.8rem; color:var(--muted); margin-bottom:15px; line-height:1.4;">
                    Podoba Ci się StyreOS? Twoje wsparcie pomaga mi opłacać serwery map i rozwijać nowe funkcje dla kierowców i rodzin. Każda "kawa" ma znaczenie!
                </p>
                <a href="https://buycoffee.to/styreos" target="_blank" style="background:#ffdd00; color:#000; font-weight:900; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:15px; border-radius:12px; box-shadow: 0 4px 15px rgba(255, 221, 0, 0.2);">
                    <span style="font-size:1.5rem;">☕</span> POSTAW MI KAWĘ
                </a>
            </div>` + nav;
        }
    }
};

