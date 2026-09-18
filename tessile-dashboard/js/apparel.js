// ============================================================
// Tecnico Tessile Pratese - Apparel & Marker Making
// Confezione: pattern making, marker efficiency, gradazione
// ============================================================

const Apparel = {
    // Gradazione taglie (da standard Size Engineering)
    calcolaGradazione() {
        const baseSize = document.getElementById('ap-base-size').value;
        const baseChest = parseFloat(document.getElementById('ap-base-chest').value) || 92;
        const incremento = parseFloat(document.getElementById('ap-incremento').value) || 4;

        let out = '<h3>Gradazione Taglie</h3>';
        out += '<p>Base: ' + baseSize + ' (petto ' + baseChest + 'cm), incremento: ' + incremento + 'cm</p>';

        const taglie = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const valori = [];
        for (let i = 0; i < taglie.length; i++) {
            valori.push(baseChest + (i - 2) * incremento);
        }

        out += '<table><tr><th>Taglia</th><th>Petto (cm)</th><th>Incremento</th></tr>';
        for (let i = 0; i < taglie.length; i++) {
            const inc = i === 2 ? '—' : (valori[i] > baseChest ? '+' : '') + (valori[i] - baseChest);
            out += '<tr><td>' + taglie[i] + '</td><td>' + valori[i] + '</td><td>' + inc + '</td></tr>';
        }
        out += '</table>';

        // Formula incremento
        out += '<h4>Formula Incremento</h4>';
        out += '<p class="formula">Taglia(n) = base + (n - centro) × incremento</p>';
        out += '<p>Dove n = indice taglia, centro = taglia media (M)</p>';

        document.getElementById('ris-apparel').innerHTML = out;
    },

    // Marker Efficiency
    calcolaMarker() {
        const areaPattern = parseFloat(document.getElementById('mk-area-pattern').value) || 0;
        const areaMarker = parseFloat(document.getElementById('mk-area-marker').value) || 0;

        if (areaMarker <= 0) {
            document.getElementById('ris-marker-adv').innerHTML = '<span class="errore">Area marker deve essere > 0</span>';
            return;
        }

        const efficiency = (areaPattern / areaMarker) * 100;
        const spreco = areaMarker - areaPattern;
        const sprecoPct = (spreco / areaMarker) * 100;

        let out = '<h3>Marker Efficiency</h3>';
        out += '<div class="stats-grid">';
        out += '<div class="stat-card"><div class="stat-label">Area Pattern</div><div class="stat-value">' + areaPattern.toFixed(2) + '<div class="stat-unit">m²</div></div></div>';
        out += '<div class="stat-card"><div class="stat-label">Area Marker</div><div class="stat-value">' + areaMarker.toFixed(2) + '<div class="stat-unit">m²</div></div></div>';
        out += '<div class="stat-card"><div class="stat-label">Efficiency</div><div class="stat-value">' + efficiency.toFixed(1) + '<div class="stat-unit">%</div></div></div>';
        out += '<div class="stat-card"><div class="stat-label">Spreco</div><div class="stat-value">' + spreco.toFixed(2) + '<div class="stat-unit">m² (' + sprecoPct.toFixed(1) + '%)</div></div></div>';
        out += '</div>';

        out += '<p class="formula">Efficiency = (Area Pattern / Area Marker) × 100 = (' + areaPattern.toFixed(2) + ' / ' + areaMarker.toFixed(2) + ') × 100 = <span class="highlight">' + efficiency.toFixed(2) + '%</span></p>';

        // Target efficiency
        out += '<h4>Efficiency Target</h4>';
        out += '<table><tr><th>Tipo Tessuto</th><th>Target</th><th>Stato</th></tr>';
        const tipi = ['Plain', 'Twill', 'Satin', 'Check', 'Pile', 'Stripe'];
        const targets = [88, 85, 82, 78, 80, 75];
        for (let i = 0; i < tipi.length; i++) {
            const stato = efficiency >= targets[i] ? '✓ OK' : '✗ Bassa';
            const cls = efficiency >= targets[i] ? 'valore' : 'errore';
            out += '<tr><td>' + tipi[i] + '</td><td>' + targets[i] + '%</td><td class="' + cls + '">' + stato + '</td></tr>';
        }
        out += '</table>';

        document.getElementById('ris-marker-adv').innerHTML = out;
    },

    // Consumo tessuto per capo
    calcolaConsumo() {
        const pz = parseInt(document.getElementById('ap-pz').value) || 100;
        const consumo = parseFloat(document.getElementById('ap-consumo').value) || 1.5;
        const mqTotal = pz * consumo;
        const kgTotal = mqTotal * 0.25; // 250g/m2 medio

        let out = '<h3>Consumo Tessuto</h3>';
        out += '<p class="formula">Totale = pezzi × consumo = ' + pz + ' × ' + consumo + ' = <span class="highlight">' + mqTotal.toFixed(1) + ' m²</span></p>';
        out += '<p class="formula">Peso (250g/m²) = ' + mqTotal.toFixed(1) + ' × 0.25 = <span class="highlight">' + kgTotal.toFixed(1) + ' kg</span></p>';

        out += '<h4>Per Taglia</h4>';
        const taglie = ['XS', 'S', 'M', 'L', 'XL'];
        const fattori = [0.9, 0.95, 1.0, 1.05, 1.1];
        out += '<table><tr><th>Taglia</th><th>Fattore</th><th>Consumo (m²)</th><th>Peso (kg)</th></tr>';
        for (let i = 0; i < taglie.length; i++) {
            const cons = consumo * fattori[i];
            const peso = cons * 0.25 * pz;
            out += '<tr><td>' + taglie[i] + '</td><td>' + fattori[i] + '</td><td>' + cons.toFixed(2) + '</td><td>' + peso.toFixed(1) + '</td></tr>';
        }
        out += '</table>';

        document.getElementById('ris-apparel-consumo').innerHTML = out;
    }
};
