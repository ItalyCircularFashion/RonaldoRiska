// ============================================================
// Tecnico Tessile Pratese - Weaving Technology
// Dati da "Weaving Technology I & II", ITU Chapters
// Prof.Dr. Emel Önder, Tek332E
// ============================================================

const Weaving = {
    // Weft Insertion Rate e Produzione Telaio
    calcolaWIR() {
        const rpm = parseFloat(document.getElementById('wv-rpm').value);
        const width = parseFloat(document.getElementById('wv-width').value);
        const efficiency = parseFloat(document.getElementById('wv-efficiency').value) || 85;
        const pickDensity = parseFloat(document.getElementById('wv-pickdensity').value);

        let out = '<h3>Weft Insertion Rate & Produzione Telaio</h3>';

        if (isNaN(rpm) || isNaN(width)) {
            document.getElementById('ris-weaving').innerHTML = '<span class="errore">Inserisci RPM e Larghezza utile</span>';
            return;
        }

        // WIR = RPM × Larghezza (m) × Efficienza (%)
        const wir = rpm * width * (efficiency / 100);
        out += `<p class="formula">WIR = ${rpm} × ${width} × ${efficiency}% = <span class="highlight">${wir.toFixed(1)} m/min</span></p>`;

        // Produzione L (m/h)
        if (!isNaN(pickDensity)) {
            const L = (60 * rpm * efficiency) / (pickDensity * 100 * 100);
            out += `<p class="formula">L = (60 × ${rpm} × ${efficiency}) / (${pickDensity} × 100 × 100) = <span class="valore">${L.toFixed(2)} m/h</span></p>`;

            // Produzione P (m²/h)
            const P = L * width;
            out += `<p class="formula">P = ${L.toFixed(2)} × ${width} = <span class="highlight">${P.toFixed(2)} m²/h</span></p>`;
        }

        // WIR per tipologia macchina
        out += '<h4>WIR per Tipologia Macchina (riferimento)</h4>';
        out += '<table><tr><th>Macchina</th><th>WIR (m/min)</th><th>Velocità (rpm)</th></tr>';
        out += '<tr><td>Shuttle</td><td>357-525</td><td>60-160</td></tr>';
        out += '<tr><td>Projectile</td><td>600-1250</td><td>250-400</td></tr>';
        out += '<tr><td>Rapier (rigid)</td><td>250-700</td><td>200-420</td></tr>';
        out += '<tr><td>Rapier (twin)</td><td>700-1000</td><td>200-500</td></tr>';
        out += '<tr><td>Air-jet</td><td>1100-1300</td><td>400-700</td></tr>';
        out += '<tr><td>Water-jet</td><td>550-1150</td><td>800</td></tr>';
        out += '<tr><td>Rapier (high speed)</td><td>650-1600</td><td>400-700</td></tr>';
        out += '</table>';

        // Fattori che influenzano WIR
        out += '<h4>Fattori che Influenzano il WIR</h4>';
        out += '<ul>';
        out += '<li>Velocità telaio (rpm/ppm)</li>';
        out += '<li>Larghezza utile (m)</li>';
        out += '<li>Efficienza operativa (%)</li>';
        out += '<li>Densità trama ( picks/cm)</li>';
        out += '<li>Tipo di intreccio (complessità)</li>';
        out += '<li>Qualità filati (resistenza, uniformità)</li>';
        out += '</ul>';

        document.getElementById('ris-weaving').innerHTML = out;
    },

    // Confronto Macchine (Tabella 2.2 ITU)
    confrontaMacchine() {
        let out = '<h3>Confronto Macchine per Weft Insertion Rate</h3>';
        out += '<table><tr><th>Macchina</th><th>Larghezza (m)</th><th>Velocità (rpm)</th><th>WIR (m/min)</th></tr>';
        out += '<tr><td>Toyoda Air Jet JAT600</td><td>3.3</td><td>600</td><td>1980</td></tr>';
        out += '<tr><td>Nissan Air Jet LA51A</td><td>2.8</td><td>600</td><td>1680</td></tr>';
        out += '<tr><td>Tsudakoma Air Jet ZAX-190</td><td>1.9</td><td>600</td><td>1140</td></tr>';
        out += '<tr><td>Picanol Air Jet PAT-A-4R</td><td>1.9</td><td>500</td><td>950</td></tr>';
        out += '<tr><td>Sulzer Projectile P7200</td><td>3.6</td><td>400</td><td>1440</td></tr>';
        out += '<tr><td>Somet Rapier Thema 11</td><td>1.9</td><td>500</td><td>950</td></tr>';
        out += '<tr><td>Nuovo Pignone Rapier FAST.2</td><td>1.9</td><td>500</td><td>950</td></tr>';
        out += '<tr><td>Nissan Water Jet LW542</td><td>1.9</td><td>500</td><td>950</td></tr>';
        out += '<tr><td>Dornier Rigid Rapier HTV</td><td>1.9</td><td>400</td><td>760</td></tr>';
        out += '<tr><td>Vamatex Telescopic Rapier</td><td>2.1</td><td>450</td><td>945</td></tr>';
        out += '<tr><td>Jurgens Shuttle Loom</td><td>1.8</td><td>180</td><td>324</td></tr>';
        out += '</table>';

        out += '<h4>Note</h4>';
        out += '<ul>';
        out += '<li>WIR = Velocità × Larghezza (valori nominali a 100% efficienza)</li>';
        out += '<li>Air-jet: WIR più alto, energia compressa</li>';
        out += '<li>Projectile: buon rapporto qualità/produzione</li>';
        out += '<li>Rapier: versatilità, adatto a disegni complessi</li>';
        out += '<li>Shuttle: tradizionale, WIR basso ma alta qualità</li>';
        out += '</ul>';

        document.getElementById('ris-weaving-macchine').innerHTML = out;
    },

    // Produttività Telaio
    calcolaProduttivita() {
        const numTelai = parseInt(document.getElementById('wv-numtelai').value);
        const wir = parseFloat(document.getElementById('wv-wir').value);
        const width = parseFloat(document.getElementById('wv-width2').value);
        const efficienza = parseFloat(document.getElementById('wv-efficienza2').value) || 80;
        const oreTurno = parseFloat(document.getElementById('wv-ore').value) || 8;

        if (isNaN(numTelai) || isNaN(wir) || isNaN(width)) {
            document.getElementById('ris-telaio').innerHTML = '<span class="errore">Inserisci dati telaio</span>';
            return;
        }

        let out = '<h3>Produttività Reparto Tessitura</h3>';

        // Produzione per telaio (m/turno)
        const produzioneTelaiOra = (wir * 60 * efficienza) / (width * 100);
        const produzioneTelaiTurno = produzioneTelaiOra * oreTurno;
        const produzioneTotale = produzioneTelaiTurno * numTelai;

        out += `<p class="formula">Produzione/ora/telaio = (${wir} × 60 × ${efficienza}%) / (${width} × 100) = <span class="valore">${produzioneTelaiOra.toFixed(1)} m²/h</span></p>`;
        out += `<p class="formula">Produzione/turno/telaio = ${produzioneTelaiOra.toFixed(1)} × ${oreTurno} = <span class="valore">${produzioneTelaiTurno.toFixed(1)} m²/turno</span></p>`;
        out += `<p class="formula">Produzione totale (${numTelai} telai) = ${produzioneTelaiTurno.toFixed(1)} × ${numTelai} = <span class="highlight">${produzioneTotale.toFixed(1)} m²/turno</span></p>`;

        // Fattori di perdita
        const fermi = 0.10; // 10% fermi
        const rifilo = 0.03; // 3% rifilo
        const aria = 0.02; // 2% aria
        const totalePerdita = fermi + rifilo + aria;

        out += `<p><strong>Fattori di perdita standard:</strong></p>`;
        out += `<ul>`;
        out += `<li>Fermi meccanici: ${(fermi*100).toFixed(0)}%</li>`;
        out += `<li>Rifilo/pannello: ${(rifilo*100).toFixed(0)}%</li>`;
        out += `<li>Aria/mancata inserzione: ${(aria*100).toFixed(0)}%</li>`;
        out += `<li><strong>Totale: ${(totalePerdita*100).toFixed(0)}%</strong></li>`;
        out += `</ul>`;

        const produzioneNetta = produzioneTotale * (1 - totalePerdita);
        out += `<p class="formula">Produzione netta = ${produzioneTotale.toFixed(1)} × ${(1-totalePerdita).toFixed(2)} = <span class="highlight">${produzioneNetta.toFixed(1)} m²/turno</span></p>`;

        document.getElementById('ris-telaio').innerHTML = out;
    }
};


// Produttività Telaio (da ITU Chapter 2b)
const Produttivita = {
    calcola() {
        const rpm = parseFloat(document.getElementById('pr-rpm').value);
        const width = parseFloat(document.getElementById('pr-width').value);
        const efficiency = parseFloat(document.getElementById('pr-efficiency').value) || 85;
        const pickDensity = parseFloat(document.getElementById('pr-pickdensity').value);
        const numTelai = parseFloat(document.getElementById('pr-numtelai').value) || 1;
        const oreTurno = parseFloat(document.getElementById('pr-ore').value) || 8;

        if (isNaN(rpm) || isNaN(width)) {
            document.getElementById('ris-produttivita').innerHTML = '<span class="errore">Inserisci RPM e Larghezza</span>';
            return;
        }

        let out = '<h3>Produttività Telaio</h3>';

        // WIR (Weft Insertion Rate)
        const wir = rpm * width * (efficiency / 100);
        out += `<p class="formula">WIR = RPM × Larghezza × η = ${rpm} × ${width} × ${efficiency}% = <span class="highlight">${wir.toFixed(1)} m/min</span></p>`;

        // Produzione oraria (m/h)
        const prodOra = wir * 60;
        out += `<p class="formula">Produzione/ora = WIR × 60 = ${wir.toFixed(1)} × 60 = <span class="valore">${prodOra.toFixed(1)} m/h</span></p>`;

        // Produzione oraria (m²/h)
        const prodOraMq = prodOra * width;
        out += `<p class="formula">Produzione/ora (m²) = ${prodOra.toFixed(1)} × ${width} = <span class="valore">${prodOraMq.toFixed(1)} m²/h</span></p>`;

        // Produzione turno (m)
        const prodTurno = prodOra * oreTurno;
        out += `<p class="formula">Produzione/turno = ${prodOra.toFixed(1)} × ${oreTurno}h = <span class="valore">${prodTurno.toFixed(1)} m/turno</span></p>`;

        // Produzione totale (m²/turno)
        const prodTotale = prodTurno * width * numTelai;
        out += `<p class="formula">Produzione totale (${numTelai} telai) = ${prodTurno.toFixed(1)} × ${width} × ${numTelai} = <span class="highlight">${prodTotale.toFixed(1)} m²/turno</span></p>`;

        // Se densità trama disponibile, calcoli avanzati
        if (!isNaN(pickDensity)) {
            // L = (60 × rpm × η) / (D × 100 × 100) — produzione lineare
            const L = (60 * rpm * efficiency) / (pickDensity * 100 * 100);
            out += `<p class="formula">L = (60 × ${rpm} × ${efficiency}) / (${pickDensity} × 100 × 100) = <span class="valore">${L.toFixed(3)} m/h</span></p>`;
            
            // P = L × b (m²/h)
            const P = L * width;
            out += `<p class="formula">P = ${L.toFixed(3)} × ${width} = <span class="valore">${P.toFixed(3)} m²/h</span></p>`;
        }

        // Fattori di perdita
        out += '<h4>Fattori di Perdita</h4>';
        out += '<ul>';
        out += '<li>Fermi meccanici: ~10%</li>';
        out += '<li>Rifilo/pannello: ~3%</li>';
        out += '<li>Aria/mancata inserzione: ~2%</li>';
        out += '<li><strong>Totale perdita: ~15%</strong></li>';
        out += '</ul>';

        const prodNetta = prodTotale * 0.85;
        out += `<p class="formula">Produzione netta = ${prodTotale.toFixed(1)} × 0.85 = <span class="highlight">${prodNetta.toFixed(1)} m²/turno</span></p>`;

        document.getElementById('ris-produttivita').innerHTML = out;
    }
};

// Marker Making
const Marker = {
    calcolaEfficienza() {
        const areaPattern = parseFloat(document.getElementById('mk-area-pattern').value);
        const areaMarker = parseFloat(document.getElementById('mk-area-marker').value);

        let out = '<h3>Marker Efficiency</h3>';

        if (isNaN(areaPattern) || isNaN(areaMarker)) {
            document.getElementById('ris-marker').innerHTML = '<span class="errore">Inserisci area pattern e area marker</span>';
            return;
        }

        // Marker Efficiency = (Area pattern / Area marker) × 100
        const efficiency = (areaPattern / areaMarker) * 100;
        out += `<p class="formula">Marker Efficiency = (${areaPattern} / ${areaMarker}) × 100 = <span class="highlight">${efficiency.toFixed(2)}%</span></p>`;

        // Sprechi
        const spreco = areaMarker - areaPattern;
        const sprecoPercent = (spreco / areaMarker) * 100;
        out += `<p class="formula">Spreco = ${areaMarker} - ${areaPattern} = ${spreco.toFixed(2)} m² (${sprecoPercent.toFixed(2)}%)</p>`;

        // Tipologie di spreco
        out += '<h4>Tipologie Spreco Marker</h4>';
        out += '<table><tr><th>Tipo</th><th>Percentuale</th><th>Nota</th></tr>';
        out += '<tr><td>Ends of ply</td><td>2 cm per estremità</td><td>Necessario per taglio</td></tr>';
        out += '<tr><td>Selvedge</td><td>~3% larghezza</td><td>Riducibile con marker width maggiore</td></tr>';
        out += '<tr><td>Fabric ends</td><td>Variabile</td><td>Ultimo pezzo rotolo</td></tr>';
        out += '<tr><td>Purchase loss</td><td>Variabile</td><td>Dichiarato vs reale</td></tr>';
        out += '</table>';

        // Fattori che influenzano
        out += '<h4>Fattori che Influenzano Marker Efficiency</h4>';
        out += '<ul>';
        out += '<li><strong>Competenza planner:</strong> esperienza, conoscenza tecnica</li>';
        out += '<li><strong>Taglie:</strong> medie taglie > efficienza; piccole/grandi < efficienza</li>';
        out += '<li><strong>Lunghezza marker:</strong> più lungo = efficienza maggiore</li>';
        out += '<li><strong>Larghezza marker:</strong> più larga = più facilità</li>';
        out += '<li><strong>Metodo:</strong> Computerized > Manuale</li>';
        out += '<li><strong>Caratteristiche tessuto:</strong> simmetrico > asimmetrico</li>';
        out += '</ul>';

        // Tipi di marker
        out += '<h4>Tipi di Marker</h4>';
        out += '<ul>';
        out += '<li><strong>Nap-either-way:</strong> tessuto simmetrico, non direzionale</li>';
        out += '<li><strong>Nap-one-way:</strong> tessuto asimmetrico/direzionale, tutte pezzi stessa direzione</li>';
        out += '<li><strong>Nap-up-and-down:</strong> direzionale, alternare direzioni per taglie</li>';
        out += '<li><strong>Group:</strong> variazione tonalità, raggruppare per shade</li>';
        out += '</ul>';

        // Efficienza target
        out += '<h4>Efficienza Target per Tipo Tessuto</h4>';
        out += '<table><tr><th>Tipo Tessuto</th><th>Efficienza Target</th></tr>';
        out += '<tr><td>Tessuto piatto (plain)</td><td>85-90%</td></tr>';
        out += '<tr><td>Tessuto twill/satin</td><td>80-85%</td></tr>';
        out += '<tr><td>Tessuto a barre/check</td><td>75-80%</td></tr>';
        out += '<tr><td>Tessuto a pelo/pile</td><td>75-82%</td></tr>';
        out += '<tr><td>Tessuto jacquard</td><td>70-78%</td></tr>';
        out += '</table>';

        document.getElementById('ris-marker').innerHTML = out;
    }
};

// Yarn Manufacturing
const Yarn = {
    calcolaResa() {
        const materiaPrima = parseFloat(document.getElementById('ym-materia-prima').value);
        const sistema = document.getElementById('ym-sistema').value;

        let out = '<h3>Resa Filiatura</h3>';

        if (isNaN(materiaPrima)) {
            document.getElementById('ris-yarn').innerHTML = '<span class="errore">Inserisci materia prima (kg)</span>';
            return;
        }

        // Rese tipiche per sistema
        const resa = {
            'cotton-cardato': { resa: 0.82, scarti: 0.18, note: 'Cardato: 18% scarti totali' },
            'cotton-pettinato': { resa: 0.78, scarti: 0.22, note: 'Pettinato: 22% scarti (noils + fiocco)' },
            'woolen': { resa: 0.85, scarti: 0.15, note: 'Woolen: 15% scarti (lavaggio + cardatura)' },
            'worsted': { resa: 0.72, scarti: 0.28, note: 'Worsted: 28% scarti (combing noils 15% + altri)' },
            'open-end': { resa: 0.95, scarti: 0.05, note: 'Open-end: 5% scarti (alta resa, bassa qualità)' },
            'air-jet': { resa: 0.93, scarti: 0.07, note: 'Air-jet: 7% scarti' }
        };

        const dati = resa[sistema] || resa['cotton-cardato'];
        const filato = materiaPrima * dati.resa;
        const scarti = materiaPrima * dati.scarti;

        out += `<p class="formula">Filato prodotto = ${materiaPrima} × ${(dati.resa*100).toFixed(0)}% = <span class="valore">${filato.toFixed(1)} kg</span></p>`;
        out += `<p class="formula">Scarti = ${materiaPrima} × ${(dati.scarti*100).toFixed(0)}% = ${filato.toFixed(1)} kg</p>`;
        out += `<p>Nota: ${dati.note}</p>`;

        // Differenza short staple vs long staple
        out += '<h4>Short Staple vs Long Staple</h4>';
        out += '<table><tr><th>Caratteristica</th><th>Short Staple (Cotton)</th><th>Long Staple (Worsted)</th></tr>';
        out += '<tr><td>Lunghezza fibra</td><td>< 2.5 inch (60mm)</td><td>2.5-9 inch (60-230mm)</td></tr>';
        out += '<tr><td>Sistema</td><td>Cotton system</td><td>Worsted system</td></tr>';
        out += '<tr><td>Resa tipica</td><td>78-95%</td><td>72-85%</td></tr>';
        out += '<tr><td>Torsione</td><td>Alta (400-800 TPM)</td><td>Media (200-500 TPM)</td></tr>';
        out += '<tr><td>Uso finale</td><td>Abbigliamento intimo, lenzuola, maglieria</td><td>Tessuti pregiati, tappeti, flanella</td></tr>';
        out += '</table>';

        // Confronto sistemi
        out += '<h4>Confronto Sistemi di Filiatura</h4>';
        out += '<table><tr><th>Sistema</th><th>Resa</th><th>Qualità</th><th>Costo</th></tr>';
        out += '<tr><td>Ring spun (cardato)</td><td>82%</td><td>Buona</td><td>Medio</td></tr>';
        out += '<tr><td>Ring spun (pettinato)</td><td>78%</td><td>Alta</td><td>Alto</td></tr>';
        out += '<tr><td>Open-end (rotor)</td><td>95%</td><td>Media</td><td>Basso</td></tr>';
        out += '<tr><td>Air-jet</td><td>93%</td><td>Buona</td><td>Medio</td></tr>';
        out += '<tr><td>Woolen</td><td>85%</td><td>Media</td><td>Medio</td></tr>';
        out += '<tr><td>Worsted</td><td>72%</td><td>Molto alta</td><td>Molto alto</td></tr>';
        out += '</table>';

        document.getElementById('ris-yarn').innerHTML = out;
    }
};
