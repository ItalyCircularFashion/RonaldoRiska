// kpi.js — Tracciamento avanzamento calcoli dashboard
// Tecnico Tessile Pratese
//
// Logica: ogni pressione di un bottone .btn-calcola marca il modulo
// contenitore come "completato". Stato persistito in localStorage.
// Nessuna dipendenza dai calcoli: hook puro sui click.

(function () {
    'use strict';

    const STORAGE_KEY = 'ttp_dashboard_kpi_v1';

    // Metadati moduli: nome visualizzato (coerente con la nav)
    const MODULES = [
        { id: 'scheda',    nome: 'Scheda Tecnica' },
        { id: 'pettine',   nome: 'Calcoli Pettine' },
        { id: 'colore',    nome: 'Note di Colore' },
        { id: 'rincorso',  nome: 'Rincorso & Armatura' },
        { id: 'peso',      nome: 'Peso & Divisore' },
        { id: 'riduzione', nome: 'Riduzione & Imborsi' },
        { id: 'titolo',    nome: 'Titolo & Conversioni' },
        { id: 'gsm',       nome: 'GSM & Peso Tessuto' },
        { id: 'lana',      nome: 'Ciclo Laniero' },
        { id: 'ie',        nome: 'Industrial Engineering' },
        { id: 'weaving',   nome: 'Weaving Tech' },
        { id: 'yarn',      nome: 'Yarn Mfg' }
    ];

    // Sottotitoli per l'header del contenuto (mostrati al cambio modulo)
    const SUBTITLES = {
        scheda:    'Dati generali, composizione filati, imborsi',
        pettine:   'Pettine limite, calcolo pettine, conversione pratese/decimale',
        colore:    'Analisi e simmetrizzazione note di colore',
        rincorso:  'Visualizzazione intrecci, rincorso, armatura licci',
        peso:      'Peso teorico ordito/trama e divisore',
        riduzione: 'Riduzioni, imborsi, calcoli di fabbricazione',
        titolo:    'Conversione sistemi di titolazione, calcolo da campione',
        gsm:       'GSM da struttura, formula commerciale, umidità standard',
        lana:      'Rendimento ciclo laniero, consumi, impronta, biodegradabilità',
        ie:        'SMV, efficienza, KPI lean',
        weaving:   'WIR, confronto macchine, produttività telaio',
        yarn:      'Resa filatura, marker efficiency'
    };

    let done = {};   // { moduleId: timestamp }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            done = raw ? JSON.parse(raw) : {};
        } catch (e) {
            done = {};
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
        } catch (e) { /* storage pieno o disabilitato: il KPI resta in memoria */ }
    }

    function render() {
        const total = MODULES.length;
        const doneCount = MODULES.filter(m => done[m.id]).length;

        const bar = document.getElementById('kpi-bar');
        const doneEl = document.getElementById('kpi-done');
        const totalEl = document.getElementById('kpi-total');
        const list = document.getElementById('kpi-list');

        if (bar) bar.style.width = (doneCount / total * 100).toFixed(1) + '%';
        if (doneEl) doneEl.textContent = doneCount;
        if (totalEl) totalEl.textContent = total;

        if (list) {
            list.innerHTML = '';
            for (const m of MODULES) {
                const li = document.createElement('li');
                if (done[m.id]) {
                    li.className = 'done';
                    li.innerHTML = '<span class="kpi-mark">✓</span><span>' + m.nome + '</span>';
                } else {
                    li.innerHTML = '<span class="kpi-mark">○</span><span>' + m.nome + '</span>';
                }
                list.appendChild(li);
            }
        }

        // Evidenza anche sul bottone di navigazione
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const mod = btn.dataset.module;
            if (mod && done[mod]) {
                btn.setAttribute('data-done', 'true');
            } else if (mod) {
                btn.removeAttribute('data-done');
            }
        });
    }

    function markDone(moduleId) {
        if (!moduleId) return;
        if (done[moduleId]) return;  // già marcato: idempotente
        done[moduleId] = Date.now();
        save();
        render();
    }

    function reset() {
        done = {};
        save();
        render();
    }

    // Ripristina uno stato KPI salvato (usato dall'archivio)
    function setDone(nuovoDone) {
        done = (nuovoDone && typeof nuovoDone === 'object') ? nuovoDone : {};
        save();
        render();
    }

    function getDone() { return Object.assign({}, done); }

    function updateHeader(moduleId) {
        const titleEl = document.getElementById('current-module-title');
        const subEl = document.getElementById('current-module-sub');
        const mod = MODULES.find(m => m.id === moduleId);
        if (titleEl && mod) titleEl.textContent = mod.nome;
        if (subEl) subEl.textContent = SUBTITLES[moduleId] || '';
    }

    // ---- Stato Articolo: checklist campi essenziali ----
    // Si aggiorna a ogni cambiamento dell'articolo (via subscribe di
    // articolo.js). Mostra quali campi mancano per completare la scheda.
    function renderScheda() {
        const bar = document.getElementById('kpi-scheda-bar');
        const doneEl = document.getElementById('kpi-scheda-done');
        const totalEl = document.getElementById('kpi-scheda-total');
        const list = document.getElementById('kpi-scheda-list');
        if (!list) return;

        const articolo = (typeof Articolo !== 'undefined' && Articolo.state) ? Articolo.state() : null;
        const essenziali = (typeof Articolo !== 'undefined' && Articolo.ESSENZIALI) ? Articolo.ESSENZIALI : [];
        const fields = (typeof Articolo !== 'undefined' && Articolo.FIELDS) ? Articolo.FIELDS : {};

        const fatti = articolo ? essenziali.filter(p => getPath(articolo, p) !== null && getPath(articolo, p) !== undefined).length : 0;
        const totale = essenziali.length || 11;
        const pct = totale ? Math.round(fatti / totale * 100) : 0;

        if (bar) {
            bar.style.width = pct + '%';
            bar.className = 'kpi-progress-bar' + (pct >= 100 ? ' scheda-completa' : '');
        }
        if (doneEl) doneEl.textContent = fatti;
        if (totalEl) totalEl.textContent = totale;

        list.innerHTML = '';
        for (const path of essenziali) {
            const val = articolo ? getPath(articolo, path) : null;
            const presente = val !== null && val !== undefined;
            const label = (fields[path] || path).split('.').pop();
            const li = document.createElement('li');
            li.className = presente ? 'done' : 'missing';
            const mark = document.createElement('span');
            mark.className = 'kpi-mark';
            mark.textContent = presente ? '✓' : '○';
            const nome = document.createElement('span');
            nome.textContent = label;
            li.appendChild(mark);
            li.appendChild(nome);
            if (presente) {
                const valore = document.createElement('span');
                valore.className = 'kpi-val';
                valore.textContent = String(val);
                li.appendChild(valore);
            }
            list.appendChild(li);
        }
    }

    function getPath(obj, path) {
        return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
    }

    function init() {
        load();

        // Hook sui bottoni di calcolo: marca il modulo contenitore
        document.querySelectorAll('.btn-calcola').forEach(btn => {
            btn.addEventListener('click', function () {
                const module = this.closest('.module');
                if (module && module.id) {
                    markDone(module.id.replace('mod-', ''));
                }
            });
        });

        // Reset avanzamento moduli (NON tocca l'articolo)
        const resetBtn = document.getElementById('kpi-reset');
        if (resetBtn) resetBtn.addEventListener('click', reset);

        // Hook navigazione: aggiorna header contenuto
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                updateHeader(this.dataset.module);
            });
        });

        // Header iniziale
        const activeNav = document.querySelector('.nav-btn.active');
        if (activeNav) updateHeader(activeNav.dataset.module);

        // Checklist Stato Articolo: si aggiorna dopo ogni calcolo
        // (articolo.js raccoglie i risultati con setTimeout(0): allineo
        // il render sullo stesso tick)
        document.querySelectorAll('.btn-calcola').forEach(btn => {
            btn.addEventListener('click', function () {
                setTimeout(renderScheda, 10);
            });
        });

        render();
        renderScheda();
    }

    // API per l'archivio e i test
    const api = { reset, setDone, getDone, renderScheda };
    try { window.Kpi = api; } catch (e) {}
    try { globalThis.Kpi = api; } catch (e) {}

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
