// ============================================================
// Tecnico Tessile Pratese - Motore di Calcolo
// Formule dai corsi di tessitura ortogonale
// ============================================================

const Scheda = {
    calcola() {
        const st = {
            articolo: document.getElementById('st-articolo').value,
            variante: document.getElementById('st-variante').value,
            pml: parseFloat(document.getElementById('st-pml').value),
            hf: parseFloat(document.getElementById('st-hf').value),
            pmq: parseFloat(document.getElementById('st-pmq').value),
            rfo: parseFloat(document.getElementById('st-rfo').value),
            rft: parseFloat(document.getElementById('st-rft').value),
            fili: parseFloat(document.getElementById('st-fili').value),
            colpi: parseFloat(document.getElementById('st-colpi').value),
            hp: parseFloat(document.getElementById('st-hp').value),
            pettine: document.getElementById('st-pettine').value,
            iio: parseFloat(document.getElementById('st-iio').value) || 0,
            iro: parseFloat(document.getElementById('st-iro').value) || 0,
            iit: parseFloat(document.getElementById('st-iit').value) || 0,
            irt: parseFloat(document.getElementById('st-irt').value) || 0,
            pot: parseFloat(document.getElementById('st-pot').value) || 0,
            pr: parseFloat(document.getElementById('st-pr').value) || 0,
        };

        let out = '';
        out += `<h3>Scheda Tecnica: ${st.articolo || 'Articolo'} — Variante: ${st.variante || '-'}</h3>`;

        if (!isNaN(st.pml) && !isNaN(st.hf)) {
            const pmqCalc = st.pml / (st.hf / 100);
            out += `<p class="formula">PMQ = PML / (Hf/100) = ${st.pml} / (${st.hf}/100) = <span class="valore">${pmqCalc.toFixed(2)} g/mq</span></p>`;
            if (!isNaN(st.pmq)) {
                const diff = Math.abs(pmqCalc - st.pmq);
                out += `<p>PMQ inserito: ${st.pmq} g/mq — Differenza: ${diff.toFixed(2)} g/mq ${diff < 1 ? '✓' : '⚠'}</p>`;
            }
        }

        if (!isNaN(st.fili) && !isNaN(st.hp)) {
            const ridtO = st.fili / st.hp;
            out += `<p class="formula">RidtO = FO / Hp = ${st.fili} / ${st.hp} = <span class="valore">${ridtO.toFixed(2)} fili/cm</span></p>`;
        }

        if (!isNaN(st.hp) && !isNaN(st.iit)) {
            const hgg = st.hp * (100 - st.iit) / 100;
            out += `<p class="formula">Hgg = Hp - IIT = ${st.hp} × (100-${st.iit})/100 = <span class="valore">${hgg.toFixed(2)} cm</span></p>`;
        }

        if (!isNaN(st.hp) && !isNaN(st.hf) && !isNaN(st.iro)) {
            const hgg = st.hp * (100 - (st.iit || 0)) / 100;
            const hfCalc = hgg * (100 - st.iro) / 100;
            out += `<p class="formula">Hf = Hgg - IRT = ${hgg.toFixed(2)} × (100-${st.iro})/100 = <span class="valore">${hfCalc.toFixed(2)} cm</span></p>`;
        }

        document.getElementById('ris-scheda').innerHTML = out;
    }
};

const Pettine = {
    calcolaLimite() {
        const nm = parseFloat(document.getElementById('pl-nm').value);
        const imp = parseFloat(document.getElementById('pl-imp').value);

        if (isNaN(nm) || isNaN(imp)) {
            document.getElementById('ris-pettine-limite').innerHTML = '<span class="errore">Inserisci Nm e impettinatura</span>';
            return;
        }

        let out = '';
        out += `<h3>Pettine Limite per Nm ${nm}, impettinatura ${imp}</h3>`;

        const kValues = [15, 16, 17, 18, 19, 20];
        out += '<table><tr><th>k</th><th>Formula</th><th>Pettine Limite</th></tr>';
        for (const k of kValues) {
            const pl = k * Math.sqrt(nm);
            out += `<tr><td>${k}</td><td>${k} × √${nm}</td><td><strong>${pl.toFixed(1)}</strong></td></tr>`;
        }
        out += '</table>';

        if (imp === 2) {
            out += `<p class="highlight">Per impettinatura 2: k=18 è standard → PL = ${(18*Math.sqrt(nm)).toFixed(1)}</p>`;
        } else if (imp === 3) {
            out += `<p class="highlight">Per impettinatura 3: k=17 è standard → PL = ${(17*Math.sqrt(nm)).toFixed(1)}</p>`;
        } else if (imp === 4) {
            out += `<p class="highlight">Per impettinatura 4: k=15 è standard → PL = ${(15*Math.sqrt(nm)).toFixed(1)}</p>`;
        } else if (imp === 6) {
            out += `<p class="highlight">Per impettinatura 6: k=14 è standard → PL = ${(14*Math.sqrt(nm)).toFixed(1)}</p>`;
        }

        document.getElementById('ris-pettine-limite').innerHTML = out;
    },

    calcola() {
        const fo = parseFloat(document.getElementById('pc-fo').value);
        const hp = parseFloat(document.getElementById('pc-hp').value);
        const hgg = parseFloat(document.getElementById('pc-hgg').value);
        const hf = parseFloat(document.getElementById('pc-hf').value);
        const iit = parseFloat(document.getElementById('pc-iit').value) || 0;
        const itt = parseFloat(document.getElementById('pc-itt').value) || 0;
        const imp = parseFloat(document.getElementById('pc-imp').value);
        const nm = parseFloat(document.getElementById('pc-nm').value);

        let out = '<h3>Calcolo Pettine</h3>';

        // Calcolo RidtO da FO e Hp
        if (!isNaN(fo) && !isNaN(hp)) {
            const ridtO = fo / hp;
            out += `<p class="formula">RidtO = FO / Hp = ${fo} / ${hp} = <span class="valore">${ridtO.toFixed(2)} fili/cm</span></p>`;

            if (!isNaN(imp)) {
                const dentiCm = ridtO / imp;
                const pettineDec = dentiCm * 10;
                const pettinePrat = pettineDec * 1.3;
                out += `<p class="formula">Denti/cm = RidtO / imp = ${ridtO.toFixed(2)} / ${imp} = <span class="valore">${dentiCm.toFixed(2)} denti/cm</span></p>`;
                out += `<p class="formula">Pettine Decimale = ${pettineDec.toFixed(1)} /10/${imp}</p>`;
                out += `<p class="formula">Pettine Pratese = ${pettineDec.toFixed(1)} × 1.3 = <span class="valore">${pettinePrat.toFixed(1)}</span> → approssimato: <strong>${Math.round(pettinePrat / 2.5) * 2.5}</strong></p>`;

                if (!isNaN(nm)) {
                    // k-values da GEFITES: distinguere pettinato/cardato
                    // Pettinato: k=20,18,16,14 | Cardato: k=18,17,15,13
                    const kPettinato = imp === 2 ? 20 : imp === 3 ? 18 : imp === 4 ? 16 : imp === 6 ? 14 : 18;
                    const kCardato = imp === 2 ? 18 : imp === 3 ? 17 : imp === 4 ? 15 : imp === 6 ? 13 : 17;
                    const pettLimitePettinato = kPettinato * Math.sqrt(nm);
                    const pettLimiteCardato = kCardato * Math.sqrt(nm);
                    out += `<p class="formula">Pettine Limite Pettinato (k=${kPettinato}): ${kPettinato} × √${nm} = <span class="valore">${pettLimitePettinato.toFixed(1)}</span></p>`;
                    out += `<p class="formula">Pettine Limite Cardato (k=${kCardato}): ${kCardato} × √${nm} = <span class="valore">${pettLimiteCardato.toFixed(1)}</span></p>`;
                    const pettLimite = pettLimitePettinato; // default pettinato
                    const pettLimite = k * Math.sqrt(nm);
                    out += `<p class="formula">Pettine Limite (k=${k}): ${k} × √${nm} = <span class="valore">${pettLimite.toFixed(1)}</span></p>`;
                    if (pettineDec > pettLimite) {
                        out += `<p class="errore">⚠ Pettine decimale (${pettineDec.toFixed(1)}) supera il limite (${pettLimite.toFixed(1)})!</p>`;
                    } else {
                        out += `<p class="valore">✓ Pettine nel limite</p>`;
                    }
                }
            }
        }

        // Calcolo da Hf e ITT
        if (!isNaN(hf) && !isNaN(itt) && !isNaN(imp)) {
            const hpCalc = hf * 100 / (100 - itt);
            const hggCalc = hpCalc * (100 - iit) / 100;
            const foCalc = !isNaN(fo) ? fo : null;

            out += `<p class="formula">Hp = Hf + ITT = ${hf} × 100/(100-${itt}) = <span class="valore">${hpCalc.toFixed(2)} cm</span></p>`;
            out += `<p class="formula">Hgg = Hp - IIT = ${hpCalc.toFixed(2)} × (100-${iit})/100 = <span class="valore">${hggCalc.toFixed(2)} cm</span></p>`;

            if (foCalc) {
                const ridfO = foCalc / hf;
                const ridtO2 = ridfO * (100 - itt) / 100;
                out += `<p class="formula">RidfO = FO / Hf = ${foCalc} / ${hf} = ${ridfO.toFixed(2)} fili/cm</p>`;
                out += `<p class="formula">RidtO = RidfO - ITT = ${ridfO.toFixed(2)} × (100-${itt})/100 = ${ridtO2.toFixed(2)} fili/cm</p>`;

                const dentiCm2 = ridtO2 / imp;
                out += `<p class="formula">Pettine Decimale = ${dentiCm2.toFixed(1)} × 10 = <span class="valore">${(dentiCm2 * 10).toFixed(0)}</span>/10/${imp}</p>`;
            }
        }

        // Calcolo da pettine e Hf
        if (!isNaN(hf) && !isNaN(itt) && !isNaN(imp) && !isNaN(fo)) {
            const ridtO = fo / (hf * 100 / (100 - itt));
            out += `<p class="formula">Verifica: RidtO = ${ridtO.toFixed(2)} fili/cm</p>`;
        }

        document.getElementById('ris-pettine').innerHTML = out;
    },

    converti() {
        const dec = parseFloat(document.getElementById('pcon-dec').value);
        const prat = document.getElementById('pcon-prat').value;

        let out = '<h3>Conversione Pettine</h3>';

        if (!isNaN(dec)) {
            const pratConv = dec * 1.3;
            out += `<p class="formula">Decimale: ${dec} → Pratese: ${dec} × 1.3 = <span class="valore">${pratConv.toFixed(1)}</span></p>`;
            out += `<p>Pratese commerciale: <strong>${Math.round(pratConv / 2.5) * 2.5}</strong>/10/imp</p>`;
        }

        if (prat) {
            const parti = prat.split('/');
            if (parti.length >= 1) {
                const dentiPrat = parseFloat(parti[0].replace(',', '.'));
                if (!isNaN(dentiPrat)) {
                    const decConv = dentiPrat / 1.3;
                    const imp = parti[2] || '?';
                    out += `<p class="formula">Pratese: ${dentiPrat} → Decimale: ${dentiPrat} / 1.3 = <span class="valore">${decConv.toFixed(1)}</span></p>`;
                    out += `<p>Pettine Decimale: <strong>${Math.round(decConv / 5) * 5}</strong>/10/${imp}</p>`;
                }
            }
        }

        document.getElementById('ris-conversione').innerHTML = out;
    }
};

const Colore = {
    calcola() {
        const nota = document.getElementById('nc-nota').value;
        const fo = parseFloat(document.getElementById('nc-fo').value);
        const simm = document.getElementById('nc-simm').value;

        if (!nota) {
            document.getElementById('ris-colore').innerHTML = '<span class="errore">Inserisci la nota</span>';
            return;
        }

        // Parse nota: "60A-18C-22B-16D-22B-18C"
        const elementi = nota.split('-');
        let filiNota = 0;
        let tabella = {};
        let dettaglio = [];

        for (const elem of elementi) {
            const match = elem.match(/^(\d+(?:[.,]\d+)?)\s*([A-Za-z])$/);
            if (match) {
                const qta = parseFloat(match[1].replace(',', '.'));
                const tipo = match[2].toUpperCase();
                filiNota += qta;
                tabella[tipo] = (tabella[tipo] || 0) + qta;
                dettaglio.push({ qta, tipo });
            }
        }

        let out = `<h3>Analisi Nota: ${nota}</h3>`;
        out += `<p>Fili Totali di Nota: <span class="highlight">${filiNota}</span></p>`;
        out += '<p>Composizione: ';
        for (const [tipo, qta] of Object.entries(tabella)) {
            out += `${tipo}: ${qta} fili; `;
        }
        out += '</p>';

        if (!isNaN(fo)) {
            const ripetizioni = fo / filiNota;
            const ripIntere = Math.floor(ripetizioni);
            const resto = fo - (filiNota * ripIntere);
            const spostamento = resto / 2;

            out += `<p class="formula">RIPETIZIONI = FO / FiliNota = ${fo} / ${filiNota} = <span class="valore">${ripetizioni.toFixed(2)}</span></p>`;
            out += `<p>Ripetizioni intere: <strong>${ripIntere}</strong></p>`;
            out += `<p class="formula">RESTO = FO - (Nota × RipIntere) = ${fo} - (${filiNota} × ${ripIntere}) = <span class="valore">${resto}</span> fili</p>`;
            out += `<p class="formula">CENTRATURA = Resto / 2 = ${resto} / 2 = <span class="highlight">${spostamento}</span> fili</p>`;
            out += `<p>→ Spostare la partenza di <strong>${spostamento}</strong> fili partendo da destra (o dal basso)</p>`;

            if (simm === 'yes') {
                out += '<h4>Nota Simmetrizzata</h4>';
                // Costruisci simmetrica
                let simmetrica = [];
                for (let i = 0; i < dettaglio.length; i++) {
                    simmetrica.push(dettaglio[i]);
                }
                for (let i = dettaglio.length - 2; i >= 0; i--) {
                    simmetrica.push(dettaglio[i]);
                }
                const simmStr = simmetrica.map(e => `${e.qta}${e.tipo}`).join('-');
                const filiSimm = simmetrica.reduce((a, b) => a + b.qta, 0);
                out += `<p>Nota simmetrica: <span class="highlight">${simmStr}</span></p>`;
                out += `<p>Fili nota simmetrica: ${filiSimm}</p>`;

                if (!isNaN(fo)) {
                    const ripSimm = fo / filiSimm;
                    const ripIntSimm = Math.floor(ripSimm);
                    const restoSimm = fo - (filiSimm * ripIntSimm);
                    const spostSimm = restoSimm / 2;
                    out += `<p>Ripetizioni: ${ripSimm.toFixed(2)} → intere: ${ripIntSimm}, resto: ${restoSimm}, centratura: ${spostSimm}</p>`;
                }
            }
        }

        document.getElementById('ris-colore').innerHTML = out;
    }
};

const Rincorso = {
    visualizza() {
        const tipo = document.getElementById('rv-tipo').value;
        const licci = parseInt(document.getElementById('rv-licci').value) || 4;
        const rincorso = document.getElementById('rv-rincorso').value;

        let out = `<h3>Visualizzazione Intreccio</h3>`;

        // Determina il rincorso
        let rinc;
        if (rincorso) {
            rinc = rincorso.split('-').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
        } else {
            rinc = this.generaRincorso(tipo, licci);
        }

        out += `<p>Rincorso: <strong>${rinc.join('-')}</strong></p>`;

        // Genera matrice
        const matrice = this.generaMatrice(tipo, licci, rinc);

        out += '<div class="matrix-container">';
        for (let r = 0; r < matrice.length; r++) {
            out += '<div class="matrix-row">';
            out += `<span class="matrix-cell label">L${r+1}</span>`;
            for (let c = 0; c < matrice[r].length; c++) {
                const cella = matrice[r][c];
                out += `<span class="matrix-cell ${cella ? 'filled' : 'empty'}" title="L${r+1} C${c+1}">${cella ? 'X' : '·'}</span>`;
            }
            out += '</div>';
        }
        out += '</div>';

        // Info sull'intreccio
        out += `<p>Tipo: ${tipo}, Licci: ${licci}, Note rincorso: ${rinc.length}</p>`;

        document.getElementById('ris-rincorso-viz').innerHTML = out;
    },

    generaRincorso(tipo, licci) {
        switch (tipo) {
            case 'telaio':
                return Array.from({length: licci}, (_, i) => i + 1);
            case 'batavia22':
                return [1, 2, 3, 4].slice(0, licci);
            case 'batavia33':
                return [1, 2, 3, 4, 5, 6].slice(0, licci);
            case 'raso5':
                return [1, 2, 3, 4, 5].slice(0, licci);
            case 'raso8':
                return [1, 2, 3, 4, 5, 6, 7, 8].slice(0, licci);
            default:
                return Array.from({length: licci}, (_, i) => i + 1);
        }
    },

    generaMatrice(tipo, licci, rinc) {
        const cols = rinc.length * 2;
        const matrice = Array.from({length: licci}, () => Array(cols).fill(false));

        switch (tipo) {
            case 'telaio':
                for (let c = 0; c < cols; c++) {
                    const l = rinc[c % rinc.length] - 1;
                    matrice[l][c] = true;
                }
                break;
            case 'batavia22':
                for (let c = 0; c < cols; c++) {
                    const offset = c % 4;
                    const l1 = rinc[offset % rinc.length] - 1;
                    const l2 = rinc[(offset + 1) % rinc.length] - 1;
                    if (l1 < licci) matrice[l1][c] = true;
                    if (l2 < licci) matrice[l2][c] = true;
                }
                break;
            case 'twill33':
                for (let c = 0; c < cols; c++) {
                    const offset = c % 6;
                    for (let i = 0; i < 3; i++) {
                        const l = rinc[(offset + i) % rinc.length] - 1;
                        if (l < licci) matrice[l][c] = true;
                    }
                }
                break;
            default:
                // Telaio base
                for (let c = 0; c < cols; c++) {
                    const l = rinc[c % rinc.length] - 1;
                    matrice[l][c] = true;
                }
        }
        return matrice;
    },

    calcola() {
        const licci = parseInt(document.getElementById('rc-licci').value) || 4;
        const tipo = document.getElementById('rc-tipo').value;

        let out = `<h3>Rincorso — Tipo: ${tipo}</h3>`;

        let rincorso;
        switch (tipo) {
            case 'diretto':
                rincorso = Array.from({length: licci}, (_, i) => i + 1);
                out += `<p>Rincorso Diretto: <span class="highlight">${rincorso.join('-')}</span></p>`;
                out += `<p>Sequenza: 1-${licci} ripetuto</p>`;
                break;
            case 'punto':
                // Rincorso a punto: 1-2-...-n-...-2-1
                rincorso = [];
                for (let i = 1; i <= licci; i++) rincorso.push(i);
                for (let i = licci - 1; i >= 1; i--) rincorso.push(i);
                out += `<p>Rincorso a Punto: <span class="highlight">${rincorso.join('-')}</span></p>`;
                out += `<p>Note totali: ${rincorso.length}</p>`;
                break;
            case 'lisca':
                // Rincorso a lisca/resca: 1-2-3-4-3-2-1-4 (per 4 licci)
                rincorso = [];
                for (let i = 1; i <= licci; i++) rincorso.push(i);
                for (let i = licci - 1; i >= 1; i--) rincorso.push(i);
                rincorso.push(licci);
                out += `<p>Rincorso a Lisca/Resca: <span class="highlight">${rincorso.join('-')}</span></p>`;
                out += `<p>Note totali: ${rincorso.length}</p>`;
                break;
        }

        document.getElementById('ris-rincorso').innerHTML = out;
    },

    armatura() {
        const licci = parseInt(document.getElementById('ra-licci').value) || 4;
        const tipo = document.getElementById('ra-tipo').value;

        let out = `<h3>Armatura Licci — Tipo: ${tipo}</h3>`;

        let armatura = [];
        switch (tipo) {
            case 'telaio':
                armatura = Array.from({length: licci}, (_, i) => i + 1);
                out += `<p>Armatura Telaio: <span class="highlight">${armatura.join('-')}</span></p>`;
                out += `<p>Maglie per liccio: ${licci}</p>`;
                break;
            case 'twill22':
                armatura = [1, 2, 3, 4].slice(0, licci);
                out += `<p>Armatura Twill 2/2: <span class="highlight">${armatura.join('-')}</span></p>`;
                break;
            case 'twill33':
                armatura = [1, 2, 3, 4, 5, 6].slice(0, licci);
                out += `<p>Armatura Twill 3/3: <span class="highlight">${armatura.join('-')}</span></p>`;
                break;
            case 'satin5':
                armatura = [1, 2, 3, 4, 5].slice(0, licci);
                out += `<p>Armatura Satin 5: <span class="highlight">${armatura.join('-')}</span></p>`;
                break;
            case 'satin8':
                armatura = [1, 2, 3, 4, 5, 6, 7, 8].slice(0, licci);
                out += `<p>Armatura Satin 8: <span class="highlight">${armatura.join('-')}</span></p>`;
                break;
        }

        // Tabella armatura
        out += '<table><tr><th>Liccio</th><th>Maglie</th></tr>';
        for (let i = 0; i < armatura.length; i++) {
            out += `<tr><td>${i + 1}</td><td>${armatura[i]}</td></tr>`;
        }
        out += '</table>';

        document.getElementById('ris-armatura').innerHTML = out;
    }
};

const Peso = {
    calcola() {
        const fo = parseFloat(document.getElementById('peso-fo').value);
        const nmo = parseFloat(document.getElementById('peso-nmo').value);
        const colpi = parseFloat(document.getElementById('peso-colpi').value);
        const nmt = parseFloat(document.getElementById('peso-nmt').value);
        const hp = parseFloat(document.getElementById('peso-hp').value);
        const iio = parseFloat(document.getElementById('peso-iio').value) || 0;
        const iro = parseFloat(document.getElementById('peso-iro').value) || 0;
        const pot = parseFloat(document.getElementById('peso-pot').value) || 0;

        let out = '<h3>Calcolo Peso & Divisore</h3>';

        // Peso Teorico Ordito
        if (!isNaN(fo) && !isNaN(nmo)) {
            const ptO = fo / nmo;
            out += `<p class="formula">Peso Teorico Ordito = FO / NmO = ${fo} / ${nmo} = <span class="valore">${ptO.toFixed(2)} g/ml</span></p>`;
        }

        // Peso Teorico Trama
        if (!isNaN(colpi) && !isNaN(hp) && !isNaN(nmt)) {
            const ptT = (colpi * hp) / nmt;
            out += `<p class="formula">Peso Teorico Trama = (Colpi × Hp) / NmT = (${colpi} × ${hp}) / ${nmt} = <span class="valore">${ptT.toFixed(2)} g/ml</span></p>`;
        }

        // Peso Teorico Totale
        if (!isNaN(fo) && !isNaN(nmo) && !isNaN(colpi) && !isNaN(hp) && !isNaN(nmt)) {
            const ptO = fo / nmo;
            const ptT = (colpi * hp) / nmt;
            const ptTot = ptO + ptT;
            out += `<p class="formula">Peso Teorico Totale = ptO + ptT = ${ptO.toFixed(2)} + ${ptT.toFixed(2)} = <span class="highlight">${ptTot.toFixed(2)} g/ml</span></p>`;

            // Peso Greggio
            const pGreggio = ptTot * (1 + iio / 100);
            out += `<p class="formula">Peso Greggio = PTeorico × (1 + IIO/100) = ${ptTot.toFixed(2)} × ${(1 + iio/100).toFixed(3)} = <span class="valore">${pGreggio.toFixed(2)} g/ml</span></p>`;

            // Peso Finito
            const pFinito = pGreggio * (1 + iro / 100);
            out += `<p class="formula">Peso Finito = PGreggio × (1 + IRO/100) = ${pGreggio.toFixed(2)} × ${(1 + iro/100).toFixed(3)} = <span class="valore">${pFinito.toFixed(2)} g/ml</span></p>`;

            // Divisore
            const divTeorico = ptTot;
            const divEffettivo = ptTot * (1 + iio / 100) * (1 + pot / 100);
            out += `<p class="formula">Divisore Teorico = ${divTeorico.toFixed(2)} g/ml</p>`;
            out += `<p class="formula">Divisore Effettivo = ptO × (1 + IIO/100) × (1 + POT/100) = <span class="highlight">${divEffettivo.toFixed(2)} g/ml</span></p>`;
            
            // Fabbisogno Materiali (da GEFITES)
            const metriProd = 1000; // placeholder, in futuro input
            const fabbisogno = divEffettivo * metriProd / 1000; // kg per 1000m
            out += `<p class="formula">Fabbisogno (${metriProd}m) = ${divEffettivo.toFixed(2)} × ${metriProd}/1000 = <span class="highlight">${fabbisogno.toFixed(2)} kg</span></p>`;
        }

        document.getElementById('ris-peso').innerHTML = out;
    }
};

const Riduzione = {
    calcola() {
        const fo = parseFloat(document.getElementById('rid-fo').value);
        const hp = parseFloat(document.getElementById('rid-hp').value);
        const iit = parseFloat(document.getElementById('rid-iit').value) || 0;
        const irt = parseFloat(document.getElementById('rid-irt').value) || 0;
        const iio = parseFloat(document.getElementById('rid-iio').value) || 0;
        const colpi = parseFloat(document.getElementById('rid-colpi').value);

        let out = '<h3>Riduzione & Imborsi</h3>';

        if (!isNaN(fo) && !isNaN(hp)) {
            // RidtO
            const ridtO = fo / hp;
            out += `<p class="formula">RidtO (Riduzione Teorica Ordito) = FO / Hp = ${fo} / ${hp} = <span class="valore">${ridtO.toFixed(2)} fili/cm</span></p>`;

            // Hgg
            const hgg = hp * (100 - iit) / 100;
            out += `<p class="formula">Hgg = Hp - IIT = ${hp} × (100-${iit})/100 = <span class="valore">${hgg.toFixed(2)} cm</span></p>`;

            // RidggO
            const ridggO = fo / hgg;
            out += `<p class="formula">RidggO = FO / Hgg = ${fo} / ${hgg.toFixed(2)} = <span class="valore">${ridggO.toFixed(2)} fili/cm</span></p>`;

            // Hf
            const hf = hgg * (100 - irt) / 100;
            out += `<p class="formula">Hf = Hgg - IRT = ${hgg.toFixed(2)} × (100-${irt})/100 = <span class="valore">${hf.toFixed(2)} cm</span></p>`;

            // RidfO
            const ridfO = fo / hf;
            out += `<p class="formula">RidfO = FO / Hf = ${fo} / ${hf.toFixed(2)} = <span class="valore">${ridfO.toFixed(2)} fili/cm</span></p>`;

            // Verifica
            const ridggCheck = ridtO * (100 + iit) / 100;
            const ridfCheck = ridggO * (100 + irt) / 100;
            out += `<p class="formula">Verifica: RidggO = RidtO + IIT = ${ridtO.toFixed(2)} × (100+${iit})/100 = ${ridggCheck.toFixed(2)}</p>`;
            out += `<p class="formula">Verifica: RidfO = RidggO + IRT = ${ridggO.toFixed(2)} × (100+${irt})/100 = ${ridfCheck.toFixed(2)}</p>`;
        }

        if (!isNaN(colpi) && !isNaN(iio)) {
            const colpiGreggio = colpi * (100 - iio) / 100;
            out += `<p class="formula">Colpi in Greggio = Colpi finiti × (100 - IIO)/100 = ${colpi} × (100-${iio})/100 = <span class="valore">${colpiGreggio.toFixed(2)} colpi/cm</span></p>`;
        }
        
        // Formula Colpi Greggio Trama (da esercizi GEFITES)
        if (!isNaN(ridT) && !isNaN(itt)) {
            const colpiGreggioT = ridT * (100 - itt) / 100;
            out += `<p class="formula">Colpi Greggio Trama = RidfT × (100-ITT)/100 = <span class="valore">${colpiGreggioT.toFixed(2)} colpi/cm</span></p>`;
        }

        // Formula inversa
        if (!isNaN(hgg) && !isNaN(iit)) {
            const hpDaHgg = hgg * 100 / (100 - iit);
            out += `<p class="formula">Hp = Hgg + IIT = ${hgg.toFixed(2)} × 100/(100-${iit}) = <span class="valore">${hpDaHgg.toFixed(2)} cm</span></p>`;
        }

        document.getElementById('ris-riduzione').innerHTML = out;
    }
};

const Titolo = {
    converti() {
        const valore = parseFloat(document.getElementById('tit-valore').value);
        const sistema = document.getElementById('tit-sistema').value;
        const capi = parseInt(document.getElementById('tit-capi').value) || 1;

        if (isNaN(valore)) {
            document.getElementById('ris-titolo').innerHTML = '<span class="errore">Inserisci un valore</span>';
            return;
        }

        let out = `<h3>Conversione Titolo: ${valore} ${sistema.toUpperCase()}</h3>`;

        // Converti prima in Nm (metrico)
        let nm;
        switch (sistema) {
            case 'nm':
                nm = valore;
                break;
            case 'ne':
                nm = valore * 1.693;
                break;
            case 'tex':
                nm = 1000 / valore;
                break;
            case 'den':
                nm = 9000 / valore;
                break;
            case 'np':
                nm = valore * 0.59;
                break;
            default:
                nm = valore;
        }

        out += `<p>Nm (Metrico): <span class="highlight">${nm.toFixed(2)}</span></p>`;
        out += `<p>Ne (Cotton): <span class="valore">${(nm / 1.693).toFixed(2)}</span></p>`;
        out += `<p>Tex: <span class="valore">${(1000 / nm).toFixed(2)}</span></p>`;
        out += `<p>Denier: <span class="valore">${(9000 / nm).toFixed(2)}</span></p>`;
        out += `<p>Np (Pettinato): <span class="valore">${(nm / 0.59).toFixed(2)}</span></p>`;

        if (capi > 1) {
            out += `<p>Numero capi: ${capi}</p>`;
            out += `<p>Titolo effettivo: <strong>${valore}/${capi}</strong> = ${(valore/capi).toFixed(2)} ${sistema.toUpperCase()}</p>`;
        }

        document.getElementById('ris-titolo').innerHTML = out;
    },

    daCampione() {
        const lunghezza = parseFloat(document.getElementById('tit-lunghezza').value);
        const nfili = parseFloat(document.getElementById('tit-nfili').value);
        const peso = parseFloat(document.getElementById('tit-peso').value);

        if (isNaN(lunghezza) || isNaN(nfili) || isNaN(peso)) {
            document.getElementById('ris-titolo-campione').innerHTML = '<span class="errore">Inserisci tutti i dati del campione</span>';
            return;
        }

        let out = '<h3>Calcolo Titolo da Campione</h3>';

        const lunghezzaM = lunghezza / 100;
        const lunghezzaTot = lunghezzaM * nfili;
        const nm = lunghezzaTot / peso;

        out += `<p class="formula">Lunghezza totale = ${lunghezza} cm × ${nfili} fili = ${lunghezzaTot.toFixed(2)} m</p>`;
        out += `<p class="formula">Nm = Lunghezza (m) / Peso (g) = ${lunghezzaTot.toFixed(2)} / ${peso} = <span class="highlight">${nm.toFixed(2)}</span></p>`;

        // Arrotonda al titolo commerciale
        const titoliCom = [5, 8, 10, 12, 15, 17, 20, 25, 30, 34, 40, 50, 60, 80];
        let piuVicino = titoliCom[0];
        let minDiff = Math.abs(nm - titoliCom[0]);
        for (const t of titoliCom) {
            const diff = Math.abs(nm - t);
            if (diff < minDiff) {
                minDiff = diff;
                piuVicino = t;
            }
        }

        out += `<p>Titolo commerciale più vicino: <strong>Nm 1/${Math.round(piuVicino)}</strong> (${piuVicino.toFixed(1)})</p>`;

        document.getElementById('ris-titolo-campione').innerHTML = out;
    }
};

// Navigazione
document.addEventListener('DOMContentLoaded', () => {
    // Nav principale
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('mod-' + btn.dataset.module).classList.add('active');
        });
    });

    // Sub-tabs
    document.querySelectorAll('.sub-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.module');
            parent.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
            parent.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('sub-' + btn.dataset.sub).classList.add('active');
        });
    });

    // Composizione - righe iniziali (solo se esistono)
    const compOrdBody = document.querySelector('#comp-ordito tbody');
    const compTramaBody = document.querySelector('#comp-trama tbody');
    if (compOrdBody && compTramaBody) {
        for (let i = 0; i < 4; i++) {
            compOrdBody.insertAdjacentHTML('beforeend', `<tr><td>${i+1}</td><td><input type="text" placeholder="Cotone"></td><td><input type="text" placeholder="Nm 20"></td><td><input type="text"></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>`);
            compTramaBody.insertAdjacentHTML('beforeend', `<tr><td>${i+1}</td><td><input type="text" placeholder="Cotone"></td><td><input type="text" placeholder="Nm 20"></td><td><input type="text"></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>`);
        }
    }
});
