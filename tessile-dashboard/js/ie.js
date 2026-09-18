// ============================================================
// Tecnico Tessile Pratese - Industrial Engineering & Lean
// Dati da "IEMS Module-2 - Work Study Technique" e "IEMS Module-6 - Optimization & Lean"
// Fonte: Eqra Knowledge Center / BGMEA-SEIP Training Institute
// ============================================================

const IE = {
    // SMV - Standard Minute Value
    calcolaSMV() {
        const obsTime = parseFloat(document.getElementById('ie-obs-time').value);
        const rating = parseFloat(document.getElementById('ie-rating').value) || 100;
        const allowances = parseFloat(document.getElementById('ie-allowances').value) || 15;
        const machineType = document.getElementById('ie-machine-type').value;

        let out = '<h3>Calcolo SMV (Standard Minute Value)</h3>';

        if (isNaN(obsTime)) {
            document.getElementById('ris-ie-smv').innerHTML = '<span class="errore">Inserisci tempo osservato</span>';
            return;
        }

        // Basic Time = Observed Time × Rating / 100
        const basicTime = obsTime * rating / 100;
        out += `<p class="formula">Basic Time = ${obsTime} × ${rating} / 100 = <span class="valore">${basicTime.toFixed(3)} min</span></p>`;

        // Machine delay allowance predefinita per tipo macchina
        const machineDelays = {
            'single-needle': 9,
            'twin-needle': 14,
            '3-thread-overlock': 7,
            '4-thread-overlock': 9,
            '5-thread-overlock': 11,
            'coverstitch': 10,
            'flatlock': 12,
            'weaving-loom': 5,
            'warping': 8,
            'sizing': 10
        };
        const machineDelay = machineDelays[machineType] || allowances;

        // SMV = Basic Time + Allowances (relaxation + contingency + machine delay)
        const relaxationAllowance = basicTime * 0.09; // 9% standard (5% personal + 4% fatigue)
        const contingencyAllowance = basicTime * 0.03; // 3% standard
        const machineDelayTime = basicTime * (machineDelay / 100);
        const smv = basicTime + relaxationAllowance + contingencyAllowance + machineDelayTime;

        out += `<p>Allowances:</p>`;
        out += `<ul>`;
        out += `<li>Relaxation (9%): ${relaxationAllowance.toFixed(3)} min (personal needs 5% + fatigue 4%)</li>`;
        out += `<li>Contingency (3%): ${contingencyAllowance.toFixed(3)} min</li>`;
        out += `<li>Machine delay (${machineDelay}%): ${machineDelayTime.toFixed(3)} min</li>`;
        out += `</ul>`;
        out += `<p class="formula">SMV = ${basicTime.toFixed(3)} + ${relaxationAllowance.toFixed(3)} + ${contingencyAllowance.toFixed(3)} + ${machineDelayTime.toFixed(3)} = <span class="highlight">${smv.toFixed(3)} min</span></p>`;

        // Tabella allowances per macchina
        out += '<h4>Machine Delay Allowances Standard</h4>';
        out += '<table><tr><th>Macchina</th><th>Delay %</th></tr>';
        out += '<tr><td>Single needle lockstitch</td><td>9%</td></tr>';
        out += '<tr><td>Twin needle lockstitch</td><td>14%</td></tr>';
        out += '<tr><td>3-thread overlock</td><td>7%</td></tr>';
        out += '<tr><td>4-thread overlock</td><td>9%</td></tr>';
        out += '<tr><td>5-thread overlock</td><td>11%</td></tr>';
        out += '<tr><td>Telai tessitura</td><td>5%</td></tr>';
        out += '<tr><td>Orditura</td><td>8%</td></tr>';
        out += '<tr><td>Incollatura</td><td>10%</td></tr>';
        out += '</table>';

        document.getElementById('ris-ie-smv').innerHTML = out;
    },

    // Efficiency & Productivity
    calcolaEfficiency() {
        const smv = parseFloat(document.getElementById('ie-smv').value);
        const production = parseFloat(document.getElementById('ie-production').value);
        const manpower = parseFloat(document.getElementById('ie-manpower').value) || 1;
        const workingHours = parseFloat(document.getElementById('ie-working-hours').value) || 8;

        let out = '<h3>Calcolo Efficiency & Productivity</h3>';

        if (isNaN(smv) || isNaN(production)) {
            document.getElementById('ris-ie-efficiency').innerHTML = '<span class="errore">Inserisci SMV e produzione</span>';
            return;
        }

        const workingMinutes = workingHours * 60;
        const totalMinutesAvailable = manpower * workingMinutes;
        const totalMinutesProduced = production * smv;
        const efficiency = (totalMinutesProduced / totalMinutesAvailable) * 100;

        out += `<p class="formula">Minuti totali disponibili = ${manpower} × ${workingMinutes} = ${totalMinutesAvailable} min</p>`;
        out += `<p class="formula">Minuti totali prodotti = ${production} × ${smv.toFixed(3)} = ${totalMinutesProduced.toFixed(1)} min</p>`;
        out += `<p class="formula">Efficiency = (${totalMinutesProduced.toFixed(1)} / ${totalMinutesAvailable}) × 100 = <span class="highlight">${efficiency.toFixed(2)}%</span></p>`;

        // Productivity
        const laborProductivity = production / (manpower * workingHours);
        const machineProductivity = production / workingHours;
        out += `<p class="formula">Labor Productivity = ${production} / (${manpower} × ${workingHours}) = <span class="valore">${laborProductivity.toFixed(2)} pz/operator·ora</span></p>`;
        out += `<p class="formula">Machine Productivity = ${production} / ${workingHours} = <span class="valore">${machineProductivity.toFixed(2)} pz/macchina·ora</span></p>`;

        // Benchmark efficiency
        out += '<h4>Benchmark Efficiency Tessile</h4>';
        out += '<table><tr><th>Livello</th><th>Efficiency</th></tr>';
        out += '<tr><td>Excellent</td><td>&gt;85%</td></tr>';
        out += '<tr><td>Good</td><td>70-85%</td></tr>';
        out += '<tr><td>Average</td><td>55-70%</td></tr>';
        out += '<tr><td>Below Average</td><td>40-55%</td></tr>';
        out += '<tr><td>Poor</td><td>&lt;40%</td></tr>';
        out += '</table>';

        // Incremento produttività
        out += '<h4>Metodi per Incrementare Produttività</h4>';
        out += '<ul>';
        out += '<li>Stesso output con input inferiore (ridurre sprechi, fermi)</li>';
        out += '<li>Output maggiore con input uguale (ottimizzazione layout)</li>';
        out += '<li>Output maggiore con input inferiore (automazione)</li>';
        out += '</ul>';

        document.getElementById('ris-ie-efficiency').innerHTML = out;
    },

    // Lean KPIs
    calcolaKPIs() {
        const orderQty = parseFloat(document.getElementById('ie-order-qty').value);
        const markerLength = parseFloat(document.getElementById('ie-marker-length').value);
        const fabricWidth = parseFloat(document.getElementById('ie-fabric-width').value);
        const fabricUsed = parseFloat(document.getElementById('ie-fabric-used').value);

        let out = '<h3>Lean KPIs - Key Performance Indicators</h3>';

        if (isNaN(orderQty) || isNaN(markerLength) || isNaN(fabricWidth)) {
            document.getElementById('ris-ie-kpis').innerHTML = '<span class="errore">Inserisci qty, marker length, fabric width</span>';
            return;
        }

        // Marker Efficiency
        const markerEfficiency = ((orderQty * markerLength) / (markerLength * fabricWidth)) * 100;
        out += `<p class="formula">Marker Efficiency = (${orderQty} × ${markerLength}) / (${markerLength} × ${fabricWidth}) × 100 = <span class="valore">${markerEfficiency.toFixed(2)}%</span></p>`;

        // Fabric Utilization
        if (!isNaN(fabricUsed)) {
            const fabricUtilization = ((orderQty * markerLength * fabricWidth) / fabricUsed) * 100;
            out += `<p class="formula">Fabric Utilization = (${orderQty} × ${markerLength} × ${fabricWidth}) / ${fabricUsed} × 100 = <span class="valore">${fabricUtilization.toFixed(2)}%</span></p>`;
        }

        // Overall Equipment Effectiveness (OEE)
        const availability = 0.90; // 90% standard
        const performance = 0.85; // 85% standard
        const quality = 0.95; // 95% standard
        const oee = availability * performance * quality * 100;

        out += '<h4>OEE (Overall Equipment Effectiveness)</h4>';
        out += `<p class="formula">OEE = Availability × Performance × Quality</p>`;
        out += `<p class="formula">Oee = ${(availability*100).toFixed(0)}% × ${(performance*100).toFixed(0)}% × ${(quality*100).toFixed(0)}% = <span class="highlight">${oee.toFixed(2)}%</span></p>`;

        // Tabella KPI
        out += '<h4>KPI Standard Tessile</h4>';
        out += '<table><tr><th>KPI</th><th>Formula</th><th>Target</th></tr>';
        out += '<tr><td>Labor Productivity</td><td>Output / Manpower × Hours</td><td>Max</td></tr>';
        out += '<tr><td>Machine Productivity</td><td>Output / Machine × Hours</td><td>Max</td></tr>';
        out += '<tr><td>Efficiency</td><td>(SMV × Prod) / (Manpower × Minutes) × 100</td><td>&gt;75%</td></tr>';
        out += '<tr><td>OEE</td><td>Avail × Perf × Quality × 100</td><td>&gt;85%</td></tr>';
        out += '<tr><td>First Time Quality</td><td>(Ok / Tot) × 100</td><td>&gt;95%</td></tr>';
        out += '<tr><td>WIP Turnover</td><td>Output / Avg WIP</td><td>Max</td></tr>';
        out += '<tr><td>Line Balance</td><td>(Σ cycle / (bottleneck × stations)) × 100</td><td>&gt;85%</td></tr>';
        out += '</table>';

        // 7 Wastes (Muda)
        out += '<h4>I 7 Wastes (Muda) - Lean Manufacturing</h4>';
        out += '<ul>';
        out += '<li><strong>Overproduction:</strong> Produce più del necessario</li>';
        out += '<li><strong>Waiting:</strong> Tempi morti tra operazioni</li>';
        out += '<li><strong>Transport:</strong> Movimenti inutili di materiale</li>';
        out += '<li><strong>Overprocessing:</strong> Lavorazioni superflue</li>';
        out += '<li><strong>Inventory:</strong> Scorte eccessive/WIP alto</li>';
        out += '<li><strong>Motion:</strong> Movimenti umani non ergonomici</li>';
        out += '<li><strong>Defects:</strong> Difetti e rilavorazioni</li>';
        out += '</ul>';

        // 5S
        out += '<h4>Metodologia 5S</h4>';
        out += '<table><tr><th>S</th><th>Italiano</th><th>Inglese</th><th>Azione</th></tr>';
        out += '<tr><td>1</td><td>Sortire</td><td>Sort</td><td>Separare necessario da inutile</td></tr>';
        out += '<tr><td>2</td><td>Sistemare</td><td>Set in Order</td><td>Ogni cosa nel suo posto</td></tr>';
        out += '<tr><td>3</td><td>Splendere</td><td>Shine</td><td>Pulizia e ordine</td></tr>';
        out += '<tr><td>4</td><td>Standard</td><td>Standardize</td><td>Procedure e controlli</td></tr>';
        out += '<tr><td>5</td><td>Sostenere</td><td>Sustain</td><td>Miglioramento continuo</td></tr>';
        out += '</table>';

        document.getElementById('ris-ie-kpis').innerHTML = out;
    }
};
