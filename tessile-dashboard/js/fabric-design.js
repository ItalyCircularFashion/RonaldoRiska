// ============================================================
// Tecnico Tessile Pratese - Fabric Design
// Strutture tessili basiche e derivate
// ============================================================

const FabricDesign = {
    // Genera matrice armatura
    generaMatrice(licci, tipo) {
        let matrice = [];
        switch (tipo) {
            case 'telaio':
                for (let i = 0; i < licci; i++) {
                    matrice.push(Array(licci).fill(false));
                    matrice[i][i] = true;
                }
                break;
            case 'twill22':
                for (let i = 0; i < licci; i++) {
                    matrice.push(Array(licci).fill(false));
                    matrice[i][i] = true;
                    matrice[i][(i + 1) % licci] = true;
                }
                break;
            case 'twill33':
                for (let i = 0; i < licci; i++) {
                    matrice.push(Array(licci).fill(false));
                    matrice[i][i] = true;
                    matrice[i][(i + 1) % licci] = true;
                    matrice[i][(i + 2) % licci] = true;
                }
                break;
            case 'satin5':
                const satin5 = [0, 2, 4, 1, 3];
                for (let i = 0; i < 5; i++) {
                    matrice.push(Array(5).fill(false));
                    matrice[i][satin5[i]] = true;
                }
                break;
            case 'satin8':
                const satin8 = [0, 3, 6, 1, 4, 7, 2, 5];
                for (let i = 0; i < 8; i++) {
                    matrice.push(Array(8).fill(false));
                    matrice[i][satin8[i]] = true;
                }
                break;
            default:
                for (let i = 0; i < licci; i++) {
                    matrice.push(Array(licci).fill(false));
                    matrice[i][i] = true;
                }
        }
        return matrice;
    },

    // Calcola proprietà armatura
    calcola(licci, tipo) {
        const matrice = this.generaMatrice(licci, tipo);
        const rapporto = matrice.length > 0 ? matrice[0].length : 0;
        
        // Conta fili in e out
        let filiUp = 0, filiDown = 0;
        for (let r = 0; r < matrice.length; r++) {
            for (let c = 0; c < matrice[r].length; c++) {
                if (matrice[r][c]) filiUp++; else filiDown++;
            }
        }
        
        // Float length (media)
        let floatSum = 0;
        for (let r = 0; r < matrice.length; r++) {
            let rowFloat = 0;
            for (let c = 0; c < matrice[r].length; c++) {
                if (matrice[r][c]) {
                    rowFloat++;
                } else {
                    if (rowFloat > 1) floatSum += rowFloat;
                    rowFloat = 0;
                }
            }
            if (rowFloat > 1) floatSum += rowFloat;
        }

        return {
            matrice: matrice,
            rapporto: rapporto,
            filiUp: filiUp,
            filiDown: filiDown,
            floatMedio: floatSum / licci
        };
    },

    // Visualizza matrice
    visualizza() {
        const licci = parseInt(document.getElementById('fd-licci').value) || 4;
        const tipo = document.getElementById('fd-tipo').value;

        if (licci < 2 || licci > 12) {
            document.getElementById('ris-fabric').innerHTML = '<span class="errore">Licci deve essere tra 2 e 12</span>';
            return;
        }

        const dati = this.calcola(licci, tipo);
        let out = `<h3>Fabric Design — ${tipo.toUpperCase()}</h3>`;
        
        // Info base
        out += '<div class="stats-grid">';
        out += `<div class="stat-card"><div class="stat-label">Licci</div><div class="stat-value">${licci}</div></div>`;
        out += `<div class="stat-card"><div class="stat-label">Rapporto</div><div class="stat-value">${dati.rapporto}</div></div>`;
        out += `<div class="stat-card"><div class="stat-label">Fili Up</div><div class="stat-value">${dati.filiUp}</div></div>`;
        out += `<div class="stat-card"><div class="stat-label">Fili Down</div><div class="stat-value">${dati.filiDown}</div></div>`;
        out += '</div>';

        // Matrice visuale
        out += '<h4>Schema Armatura</h4>';
        out += '<div class="matrix-container">';
        for (let r = 0; r < dati.matrice.length; r++) {
            out += '<div class="matrix-row">';
            out += `<span class="matrix-cell label">L${r + 1}</span>`;
            for (let c = 0; c < dati.matrice[r].length; c++) {
                out += `<span class="matrix-cell ${dati.matrice[r][c] ? 'filled' : 'empty'}">${dati.matrice[r][c] ? 'X' : '·'}</span>`;
            }
            out += '</div>';
        }
        out += '</div>';

        // Sequenza licci
        out += '<h4>Sequenza Licci (Rincorso)</h4>';
        const rincorsi = [];
        for (let c = 0; c < dati.matrice[0].length; c++) {
            for (let r = 0; r < dati.matrice.length; r++) {
                if (dati.matrice[r][c]) {
                    rincorsi.push(r + 1);
                    break;
                }
            }
        }
        out += `<p><span class="highlight">${rincorsi.join(' - ')}</span></p>`;

        // Proprietà
        out += '<h4>Proprietà</h4>';
        out += '<ul>';
        out += `<li><strong>Float medio:</strong> ${dati.floatMedio.toFixed(2)}</li>`;
        out += `<li><strong>Densità:</strong> ${dati.filiUp} up / ${dati.filiDown} down</li>`;
        out += `<li><strong>Rapporto:</strong> ${licci}:${dati.rapporto}</li>';
        out += '</ul>';

        // Tabella confronto
        out += '<h4>Confronto Armature</h4>';
        out += '<table><tr><th>Tipo</th><th>Licci</th><th>Rapporto</th><th>Float</th></tr>';
        const tipi = ['telaio', 'twill22', 'twill33', 'satin5', 'satin8'];
        for (const t of tipi) {
            const d = this.calcola(t === 'satin5' ? 5 : t === 'satin8' ? 8 : licci, t);
            out += `<tr><td>${t}</td><td>${d.matrice.length}</td><td>${d.rapporto}</td><td>${d.floatMedio.toFixed(1)}</td></tr>`;
        }
        out += '</table>';

        document.getElementById('ris-fabric').innerHTML = out;
    },

    // Salto massimo (satin)
    calcolaSalto() {
        const licci = parseInt(document.getElementById('fd-licci').value) || 5;
        
        let out = '<h3>Calcolo Salto (Satin)</h3>';
        out += '<p>Il salto S deve essere coprimo con il numero di licci L (MCD(S,L) = 1)</p>';
        
        out += '<table><tr><th>Salto S</th><th>MCD(S,' + licci + ')</th><th>Valido?</th></tr>';
        for (let s = 2; s < licci; s++) {
            const mcd = this.MCD(s, licci);
            const valido = mcd === 1;
            out += `<tr><td>${s}</td><td>${mcd}</td><td class="${valido ? 'valore' : 'errore'}">${valido ? '✓ Sì' : '✗ No'}</td></tr>`;
        }
        out += '</table>';
        
        out += '<h4>Formula</h4>';
        out += '<p class="formula">MCD(S, L) = 1 → Salto valido</p>';
        out += '<p>Dove S = salto, L = numero licci</p>';
        
        document.getElementById('ris-fabric-salto').innerHTML = out;
    },

    // Algoritmo MCD
    MCD(a, b) {
        if (b === 0) return a;
        return this.MCD(b, a % b);
    }
};
