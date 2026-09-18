// ============================================================
// Tecnico Tessile Pratese - Knitting Technology
// Maglieria: punto dritto, rib, interlock, derivati
// ============================================================

const Knitting = {
    // Genera schema maglia
    generaSchema(tipo, righe) {
        let schema = [];
        switch (tipo) {
            case 'dritto': // 1x1 Jersey
                for (let r = 0; r < righe; r++) {
                    let row = [];
                    for (let c = 0; c < 4; c++) {
                        row.push(r % 2 === 0 ? 'V' : 'O');
                    }
                    schema.push(row);
                }
                break;
            case 'rib11': // 1x1 Rib
                for (let r = 0; r < righe; r++) {
                    let row = [];
                    for (let c = 0; c < 4; c++) {
                        row.push(c % 2 === 0 ? 'V' : 'O');
                    }
                    schema.push(row);
                }
                break;
            case 'rib22': // 2x2 Rib
                for (let r = 0; r < righe; r++) {
                    let row = [];
                    for (let c = 0; c < 4; c++) {
                        row.push((c < 2) ? 'V' : 'O');
                    }
                    schema.push(row);
                }
                break;
            case 'interlock': // Interlock
                for (let r = 0; r < righe; r++) {
                    let row = [];
                    for (let c = 0; c < 4; c++) {
                        row.push((r + c) % 2 === 0 ? 'V' : 'O');
                    }
                    schema.push(row);
                }
                break;
            case 'pique': // Piqué
                for (let r = 0; r < righe; r++) {
                    let row = [];
                    for (let c = 0; c < 4; c++) {
                        row.push((r % 2 === 0) ? 'V' : (c % 2 === 0 ? 'V' : 'O'));
                    }
                    schema.push(row);
                }
                break;
            default:
                for (let r = 0; r < righe; r++) {
                    schema.push(['V', 'V', 'V', 'V']);
                }
        }
        return schema;
    },

    // Calcola proprietà maglia
    calcola() {
        const tipo = document.getElementById('kn-tipo').value;
        const righe = parseInt(document.getElementById('kn-righe').value) || 6;
        const gauge = parseFloat(document.getElementById('kn-gauge').value) || 10;

        if (righe < 2 || righe > 20) {
            document.getElementById('ris-knitting').innerHTML = '<span class="errore">Righe deve essere tra 2 e 20</span>';
            return;
        }

        const schema = this.generaSchema(tipo, righe);
        
        let out = '<h3>Knitting Pattern — ' + tipo.toUpperCase() + '</h3>';
        
        // Statistiche
        let frontCount = 0, backCount = 0;
        for (let r of schema) {
            for (let c of r) {
                if (c === 'V') frontCount++; else backCount++;
            }
        }
        const totale = frontCount + backCount;
        
        out += '<div class="stats-grid">';
        out += '<div class="stat-card"><div class="stat-label">Righe</div><div class="stat-value">' + righe + '</div></div>';
        out += '<div class="stat-card"><div class="stat-label">Gauge</div><div class="stat-value">' + gauge + '<div class="stat-unit">aghi"</div></div></div>';
        out += '<div class="stat-card"><div class="stat-label">Front</div><div class="stat-value">' + frontCount + '<div class="stat-unit">' + ((frontCount/totale)*100).toFixed(0) + '%</div></div></div>';
        out += '<div class="stat-card"><div class="stat-label">Back</div><div class="stat-value">' + backCount + '<div class="stat-unit">' + ((backCount/totale)*100).toFixed(0) + '%</div></div></div>';
        out += '</div>';

        // Schema visuale
        out += '<h4>Schema Maglia</h4>';
        out += '<div class="matrix-container">';
        for (let r = 0; r < schema.length; r++) {
            out += '<div class="matrix-row">';
            out += '<span class="matrix-cell label">' + (r + 1) + '</span>';
            for (let c = 0; c < schema[r].length; c++) {
                const cell = schema[r][c];
                const cls = cell === 'V' ? 'filled' : 'empty';
                out += '<span class="matrix-cell ' + cls + '">' + cell + '</span>';
            }
            out += '</div>';
        }
        out += '</div>';

        // Legenda
        out += '<p><span class="matrix-cell filled" style="display:inline-block;width:20px;height:20px;margin:0 4px;"></span> V = Front (dritto) ';
        out += '<span class="matrix-cell empty" style="display:inline-block;width:20px;height:20px;margin:0 4px;"></span> O = Back (rovescio)</p>';

        // Proprietà
        out += '<h4>Proprietà</h4>';
        out += '<table><tr><th>Tipo</th><th>Struttura</th><th>Elasticità</th><th>Utilizzo</th></tr>';
        out += '<tr><td>Jersey</td><td>Unifrontale</td><td>Media</td><td>T-shirt, maglieria leggera</td></tr>';
        out += '<tr><td>Rib 1x1</td><td>Bifrontale</td><td>Alta</td><td>Polsini, golf</td></tr>';
        out += '<tr><td>Rib 2x2</td><td>Bifrontale</td><td>Molto alta</td><td>Bordi, maglieria</td></tr>';
        out += '<tr><td>Interlock</td><td>Doppio</td><td>Media</td><td>Biancheria, sport</td></tr>';
        out += '<tr><td>Piqué</td><td>Strutturato</td><td>Bassa</td><td>Polo, camicie</td></tr>';
        out += '</table>';

        document.getElementById('ris-knitting').innerHTML = out;
    },

    // Confronto gauge
    confrontaGauge() {
        let out = '<h3>Confronto Gauge</h3>';
        out += '<table><tr><th>Gauge (aghi")</th><th>Cm</th><th>Maglia</th></tr>';
        const gauges = [5, 7, 10, 12, 14, 16, 20, 24, 28, 32];
        for (const g of gauges) {
            const cm = 2.54 / g;
            const tipo = g <= 7 ? 'Grossa' : g <= 14 ? 'Media' : 'Fine';
            out += '<tr><td>' + g + '</td><td>' + cm.toFixed(2) + '</td><td>' + tipo + '</td></tr>';
        }
        out += '</table>';
        out += '<p class="formula">Cm per ago = 2.54 / gauge</p>';
        document.getElementById('ris-knitting-gauge').innerHTML = out;
    }
};
