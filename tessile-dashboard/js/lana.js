// ============================================================
// Tecnico Tessile Pratese - Moduli Lanieri
// Dati da "Analisi del Ciclo Produttivo del Settore Tessile Laniero" (Arpa Piemonte)
// ============================================================

const Lana = {
    // Rendimento Ciclo Laniero
    calcolaRendimento() {
        const sucido = parseFloat(document.getElementById('ln-sucido').value);
        const resa = parseFloat(document.getElementById('ln-resa').value) || 65; // default 65% lana vera
        const fiocco = parseFloat(document.getElementById('ln-fiocco').value) || 35;
        const pettorite = parseFloat(document.getElementById('ln-pettorite').value) || 15;

        let out = '<h3>Rendimento Ciclo Laniero (da Lana Sucida)</h3>';

        if (isNaN(sucido)) {
            document.getElementById('ris-lana').innerHTML = '<span class="errore">Inserisci kg di lana sucida</span>';
            return;
        }

        // Composizione lana sucida (dati Arpa)
        const lanaVera = sucido * resa / 100;
        const materiaMinerale = sucido * 0.10; // 10% terra/argille
        const materiaVegetale = sucido * 0.04; // 4% vegetale
        const grassoSudore = sucido * 0.08; // 8% grasso organico insolubile
        const sostanzeSolubili = sucido * 0.12; // 12% sudoripare solubile
        const altro = sucido * (100 - resa - 26) / 100;

        out += `<p class="formula">Lana vera (rea): ${resa}% × ${sucido} kg = <span class="valore">${lanaVera.toFixed(1)} kg</span></p>`;
        out += `<p>Composizione sucido: terra 10% (${(sucido*0.10).toFixed(1)} kg), vegetale 4% (${(sucido*0.04).toFixed(1)} kg), grasso 8% (${(sucido*0.08).toFixed(1)} kg), solubile 12% (${(sucido*0.12).toFixed(1)} kg)</p>`;

        // Purga/lavaggio
        const grassoRecuperato = lanaVera * 0.35; // 35-40% recupero grasso BAT
        const topsPettinato = lanaVera * (100 - fiocco) / 100 * (100 - pettorite/100*3) / 100;
        const fioccoProdotto = lanaVera * fiocco / 100;
        const sottoprodotti = sucido - topsPettinato - fioccoProdotto;

        out += `<p class="formula">Grasso recuperato (35%): ${grassoRecuperato.toFixed(1)} kg → lanolina</p>`;
        out += `<p class="formula">Tops pettinato: ${lanaVera.toFixed(1)} × ${(100-fiocco)}% = <span class="valore">${topsPettinato.toFixed(1)} kg</span></p>`;
        out += `<p class="formula">Fiocco (scarto pettinatura): ${fioccoProdotto.toFixed(1)} kg → filatura cardata</p>`;
        out += `<p class="formula">Sottoprodotti totali: ${sottoprodotti.toFixed(1)} kg</p>`;

        // Resa filatura
        const resaFilatura = 0.95; // 5% perdite filatura pettinata
        const filatoPettinato = topsPettinato * resaFilatura;
        out += `<p class="formula">Filato pettinato: ${topsPettinato.toFixed(1)} × 95% = <span class="highlight">${filatoPettinato.toFixed(1)} kg</span></p>`;

        document.getElementById('ris-lana').innerHTML = out;
    },

    // Consumi Acqua ed Energia
    calcolaConsumi() {
        const tipologia = document.getElementById('ln-tipologia').value;
        const tonTrattate = parseFloat(document.getElementById('ln-ton').value);

        if (isNaN(tonTrattate)) {
            document.getElementById('ris-consumi').innerHTML = '<span class="errore">Inserisci tonnellate trattate</span>';
            return;
        }

        let out = `<h3>Consumi per ${tipologia} — ${tonTrattate} t/anno</h3>`;

        // Dati Arpa: mc/ton per tipologia
        const datiConsumo = {
            'pettinatura': {
                acqua_mc: 16.24,
                en_elettrica: 1.5,
                en_termica: 8.5,
                note: 'Lavaggio sucido: consumo elevato per finezza fibra (14-18 micron richiedono più acqua)'
            },
            'filatura': {
                acqua_mc: 4.0,
                en_elettrica: 0.8,
                en_termica: 0.5,
                note: 'Fase meccanica: solo condizionamento e vaporizzo'
            },
            'tessitura': {
                acqua_mc: 6.0,
                en_elettrica: 1.2,
                en_termica: 1.0,
                note: 'Vaporizzo ordito/trema'
            },
            'tintoria': {
                acqua_mc: 102.4,
                en_elettrica: 2.75,
                en_termica: 17.3,
                note: 'Tintura discontinua: rapporto bagno variabile per substrato'
            },
            'finissaggio': {
                acqua_mc: 80.0,
                en_elettrica: 2.0,
                en_termica: 25.0,
                note: 'Lavaggi, follatura, rameuse'
            },
            'lanificio': {
                acqua_mc: 250.0,
                en_elettrica: 4.0,
                en_termica: 50.0,
                note: 'Ciclo completo: max consumo specifico'
            }
        };

        const d = datiConsumo[tipologia] || datiConsumo['tintoria'];

        out += `<div class="risultato-grid">`;
        out += card('Acqua (mc/ton)', d.acqua_mc.toFixed(1), 'mc/t');
        out += card('Acqua totale', (d.acqua_mc * tonTrattate).toFixed(0), 'mc/anno');
        out += card('En. elettrica (MWh/ton)', d.en_elettrica.toFixed(2), 'MWh/t');
        out += card('En. elettrica totale', (d.en_elettrica * tonTrattate).toFixed(0), 'MWh/anno');
        out += card('En. termica (GJ/ton)', d.en_termica.toFixed(1), 'GJ/t');
        out += card('En. termica totale', (d.en_termica * tonTrattate).toFixed(0), 'GJ/anno');
        out += `</div>`;

        // Rapporto bagno per tintoria
        if (tipologia === 'tintoria' || tipologia === 'lanificio') {
            out += '<h4>Rapporto Bagno per Substrato</h4>';
            out += '<table><tr><th>Substrato</th><th>Rapporto Bagno</th><th>Litri/kg</th></tr>';
            out += '<tr><td>Tops</td><td>1:8</td><td>8 l/kg</td></tr>';
            out += '<tr><td>Fiocco</td><td>1:20</td><td>20 l/kg</td></tr>';
            out += '<tr><td>Rocche</td><td>1:8</td><td>8 l/kg</td></tr>';
            out += '<tr><td>Matasse</td><td>1:20-25</td><td>20-25 l/kg</td></tr>';
            out += '<tr><td>Pezze</td><td>1:10-20</td><td>10-20 l/kg</td></tr>';
            out += '</table>';
        }

        out += `<p class="formula">Nota: ${d.note}</p>`;

        document.getElementById('ris-consumi').innerHTML = out;
    },

    // Impronta Ambientale (BOD, COD, scarichi)
    calcolaImpronta() {
        const mcAcqua = parseFloat(document.getElementById('ln-mcacqua').value);
        const tipoScarico = document.getElementById('ln-scarico').value;

        if (isNaN(mcAcqua)) {
            document.getElementById('ris-impronta').innerHTML = '<span class="errore">Inserisci mc acqua/anno</span>';
            return;
        }

        let out = '<h3>Impronta Ambientale — Scarichi Tessili</h3>';

        // Concentrazioni medie in ingresso (Arpa Tab. 30)
        const inquinanti = {
            'follatura': { pH: 5, cond: 1500, sst: 200, cod: 300, mbas: 2, bias: 60 },
            'carbonizzo': { pH: 8, cond: 3000, sst: 500, cod: 1000, mbas: 4, bias: 80 },
            'tintoria': { pH: 7.5, cond: 4000, sst: 100, cod: 900, mbas: 4, bias: 25 },
            'misto': { pH: 7.5, cond: 3000, sst: 300, cod: 700, mbas: 3, bias: 50 }
        };

        const inq = inquinanti[tipoScarico] || inquinanti['misto'];

        out += `<p><strong>Tipologia effluente:</strong> ${tipoScarico}</p>`;
        out += '<h4>Parametri in ingresso depurazione (mg/l)</h4>';
        out += `<table><tr><th>Parametro</th><th>Valore</th><th>Limite D.Lgs. 152/06</th></tr>`;
        out += `<tr><td>pH</td><td>${inq.pH}</td><td>5.5-9.5</td></tr>`;
        out += `<tr><td>Conducibilità (µS/cm)</td><td>${inq.cond}</td><td>-</td></tr>`;
        out += `<tr><td>Solidi Sospesi (SST)</td><td>${inq.sst}</td><td>&lt;80 mg/l</td></tr>`;
        out += `<tr><td>COD</td><td>${inq.cod}</td><td>&lt;160 mg/l</td></tr>`;
        out += `<tr><td>BOD5</td><td>${Math.round(inq.cod*0.4)}</td><td>&lt;40 mg/l</td></tr>`;
        out += `<tr><td>Tens. anionici (MBAS)</td><td>${inq.mbas}</td><td>&lt;2 mg/l</td></tr>`;
        out += `<tr><td>Tens. non ionici (BIAS)</td><td>${inq.bias}</td><td>&lt;20 mg/l</td></tr>`;
        out += `</table>`;

        // Efficienza trattamenti terziari
        out += '<h4>Efficienza Trattamenti Terziari (Arpa Prato)</h4>';
        out += `<table><tr><th>Trattamento</th><th>Torbidità</th><th>SST</th><th>COD</th><th>Colore</th><th>Tensioattivi</th></tr>`;
        out += `<tr><td>Filtrazione sabbia</td><td>50-70%</td><td>60-80%</td><td>10-30%</td><td>5-15%</td><td>40-60%</td></tr>`;
        out += `<tr><td>+Filtrazione+Ozonizz.</td><td>95-100%</td><td>100%</td><td>70-90%</td><td>90-100%</td><td>90-100%</td></tr>`;
        out += `<tr><td>+Microfiltraz.+Nanofilt.</td><td>95-100%</td><td>100%</td><td>85-95%</td><td>95-100%</td><td>-</td></tr>`;
        out += `<tr><td>+Ultrafilt.+Osmosi inv.</td><td>95-100%</td><td>100%</td><td>85-95%</td><td>95-100%</td><td>-</td></tr>`;
        out += `</table>`;

        // Qualità acque riciclo
        out += '<h4>Limiti Acque Riciclo Interno (Ferrero/Rovero)</h4>';
        out += `<table><tr><th>Parametro</th><th>Limite accettabile</th></tr>`;
        out += `<tr><td>pH</td><td>7-8</td></tr>`;
        out += `<tr><td>Durezza (°F)</td><td>20-30</td></tr>`;
        out += `<tr><td>Conducibilità (µS/cm)</td><td>1800</td></tr>`;
        out += `<tr><td>Colore (mg/l)</td><td>0.01</td></tr>`;
        out += `<tr><td>COD (mg O2/l)</td><td>30</td></tr>`;
        out += `<tr><td>Cloruri (mg/l)</td><td>500</td></tr>`;
        out += `<tr><td>Solfati (mg/l)</td><td>500</td></tr>`;
        out += `</table>`;

        document.getElementById('ris-impronta').innerHTML = out;
    },

    // Biodegradabilità sostanze
    cercaBiodegradabilita() {
        const sostanza = document.getElementById('ln-sostanza').value.toLowerCase();

        let out = '<h3>Biodegradabilità Sostanze Tessili (Arpa Tab. 29)</h3>';

        const biodegradData = [
            { cat: 'Idrocarburi saturi', bio: 'Difficilmente biodegradabili', note: 'Difficili da trattare biologicamente' },
            { cat: 'Olefine (5/7 C)', bio: 'Difficilmente biodegradabili', note: '' },
            { cat: 'Idrocarburi clorurati', bio: 'Non biodegradabili', note: 'Separare flussi per trattamento chimico' },
            { cat: 'Alcoli', bio: 'Facilmente degradabili', note: 'Tranne butilterziario, amilico' },
            { cat: 'Acidi organici', bio: 'Facilmente degradabili', note: 'Acetico, formico, maleico → preferibili' },
            { cat: 'Eteri', bio: 'Degradano male', note: 'Dopo adattamento microrganismi' },
            { cat: 'Ammine/Ammidi', bio: 'Facilmente degradabili', note: 'Tranne triacetamide' },
            { cat: 'Tensioattivi lineari', bio: 'Facilmente degradabili', note: 'Conc.>150 mg/l, dopo adattamento' },
            { cat: 'Tensioattivi non ionici', bio: 'Biodegradabilità intermedia', note: 'APEO da sostituire con alcoli etossilati' },
            { cat: 'Detergenti sintetici', bio: 'Facilmente degradabili', note: 'Catene lineari, conc.>150 mg/l' }
        ];

        let trovato = null;
        if (sostanza) {
            for (const d of biodegradData) {
                if (d.cat.toLowerCase().includes(sostanza) || sostanza.includes(d.cat.toLowerCase().split(' ')[0])) {
                    trovato = d;
                    break;
                }
            }
        }

        if (trovato) {
            out += `<p><strong>${trovato.cat}:</strong> <span class="highlight">${trovato.bio}</span></p>`;
            if (trovato.note) out += `<p>Nota: ${trovato.note}</p>`;
        } else {
            out += '<p>Elenco completo:</p>';
            out += '<table><tr><th>Sostanza</th><th>Biodegradabilità</th><th>Nota</th></tr>';
            for (const d of biodegradData) {
                const classe = d.bio.includes('Facilmente') ? 'valore' : d.bio.includes('Difficilmente') ? 'errore' : 'highlight';
                out += `<tr><td>${d.cat}</td><td class="${classe}">${d.bio}</td><td>${d.note}</td></tr>`;
            }
            out += '</table>';
        }

        document.getElementById('ris-bio').innerHTML = out;
    }
};


