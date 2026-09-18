// app.js - Inizializzazione e utility
// Tecnico Tessile Pratese

// Utility: formatta numero
function fmt(n, dec = 2) {
    if (isNaN(n)) return '-';
    return Number(n).toFixed(dec);
}

// Utility: formatta formula
function formula(testo, valore, unita) {
    return `<p class="formula">${testo} = <span class="valore">${fmt(valore)} ${unita || ''}</span></p>`;
}

// Utility: card risultato
function card(label, value, unit) {
    return `<div class="risultato-card"><div class="label">${label}</div><div class="value">${value} ${unit || ''}</div></div>`;
}

// Utility: crea tabella
function makeTable(headers, rows) {
    let html = '<table><thead><tr>';
    headers.forEach(h => { html += `<th>${h}</th>`; });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => { html += `<td>${cell}</td>`; });
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

// Verifica validità pettine
function verificaPettine(pettineDec, nm, imp) {
    const k = imp === 2 ? 18 : imp === 3 ? 17 : imp === 4 ? 15 : imp === 6 ? 14 : 17;
    const limite = k * Math.sqrt(nm);
    return {
        k: k,
        limite: limite,
        valido: pettineDec <= limite,
        messaggio: pettineDec <= limite
            ? `✓ Pettine ${pettineDec.toFixed(0)} nel limite (${limite.toFixed(0)})`
            : `✗ Pettine ${pettineDec.toFixed(0)} supera il limite (${limite.toFixed(0)})`
    };
}

// Logica: calcolo da pettine pratese a denti/cm
function pettinePrateseToDentiCm(pratese) {
    // formato: 87.5/13/4 → denti=87.5, base=13, imp=4
    const parti = pratese.split('/');
    if (parti.length < 3) return null;
    const denti = parseFloat(parti[0].replace(',', '.'));
    const base = parseFloat(parti[1].replace(',', '.'));
    const imp = parseFloat(parti[2].replace(',', '.'));
    if (isNaN(denti) || isNaN(base) || isNaN(imp)) return null;
    return {
        dentiPratese: denti,
        base: base,
        imp: imp,
        dentiCm: denti * imp / base,
        ridtO: denti * imp / base
    };
}
