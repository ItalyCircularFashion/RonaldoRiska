// articolo.js — Layer "Articolo corrente": dato unico, moduli connessi
// Tecnico Tessile Pratese
//
// Concetto: i dati dell'articolo (fili, altezze, imborsi, titoli, pettine,
// peso) vivono in UN posto (localStorage). I moduli non hanno più campi
// isolati: all'apertura prepopolano i propri input dall'articolo; alla
// pressione di "Calcola" riscrivono i risultati nell'articolo, che si
// propagano a tutti gli altri moduli.
//
// Design:
// - Modello dati piatto con sezioni (identita, costruzione, pesi, ...)
// - Nessun calcolo qui dentro: questo file è solo stato + propagazione
// - Hook sui .btn-calcola esistenti (nessun JS di calcolo toccato)
// - API: Articolo.get(path), Articolo.set(path, val), Articolo.state()

(function () {
    'use strict';

    const STORAGE_KEY = 'ttp_articolo_v1';

    // ---- Modello dati dell'articolo ----
    // path -> etichetta per la barra di completezza
    const FIELDS = {
        'identita.articolo':       'Articolo',
        'identita.variante':       'Variante',
        'identita.composizione':   'Composizione',
        'costruzione.filiTotali':  'Fili totali',
        'costruzione.hp':          'Hp teorica',
        'costruzione.hgg':         'Hgg',
        'costruzione.hf':          'Hf',
        'costruzione.colpiTelaio': 'Colpi a telaio',
        'costruzione.riduzioneFO': 'Riduzione finita ordito',
        'costruzione.riduzioneFT': 'Riduzione finita trama',
        'imborsi.iio':             'IIO',
        'imborsi.iro':             'IRO',
        'imborsi.iit':             'IIT',
        'imborsi.irt':             'IRT',
        'imborsi.pot':             'Perdite ord./tess.',
        'imborsi.pr':              'Perdite ponderali',
        'pettine.denti':           'Pettine denti',
        'pettine.base':            'Pettine base',
        'pettine.imp':             'Impettinatura',
        'pettine.tipo':            'Tipo pettine',
        'titoli.nmOrdito':         'Titolo ordito (Nm)',
        'titoli.nmTrama':          'Titolo trama (Nm)',
        'pesi.pesoFinitoMl':       'Peso finito (g/ml)',
        'pesi.pesoFinitoMq':       'Peso finito (g/mq)',
        'pesi.altezzaFinita':      'Altezza finita (cm)'
    };

    // Campi considerati "essenziali" per la barra di completezza (11)
    const ESSENZIALI = [
        'identita.articolo',
        'costruzione.filiTotali',
        'costruzione.hp',
        'costruzione.hf',
        'imborsi.iio',
        'imborsi.iro',
        'imborsi.iit',
        'imborsi.irt',
        'pettine.denti',
        'pettine.imp',
        'titoli.nmOrdito'
    ];

    function emptyArticle() {
        return {
            identita:      { articolo: null, variante: null, composizione: null },
            costruzione:   { filiTotali: null, hp: null, hgg: null, hf: null, colpiTelaio: null, riduzioneFO: null, riduzioneFT: null },
            imborsi:       { iio: null, iro: null, iit: null, irt: null, pot: null, pr: null },
            pettine:       { denti: null, base: null, imp: null, tipo: null },
            titoli:        { nmOrdito: null, nmTrama: null },
            pesi:          { pesoFinitoMl: null, pesoFinitoMq: null, altezzaFinita: null }
        };
    }

    let article = emptyArticle();
    const listeners = [];

    // ---- Persistenza ----
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                article = mergeDeep(emptyArticle(), parsed);
            }
        } catch (e) { article = emptyArticle(); }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(article));
        } catch (e) { /* storage pieno/disabilitato: stato resta in memoria */ }
        notify();
    }

    function mergeDeep(base, override) {
        const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
        for (const k of Object.keys(override || {})) {
            const bv = base ? base[k] : undefined;
            const ov = override[k];
            if (bv && typeof bv === 'object' && !Array.isArray(bv) && ov && typeof ov === 'object') {
                out[k] = mergeDeep(bv, ov);
            } else if (ov !== null && ov !== undefined) {
                out[k] = ov;
            }
        }
        return out;
    }

    // ---- API pubblica ----
    function get(path) {
        return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), article);
    }

    function set(path, value) {
        const keys = path.split('.');
        let cur = article;
        for (let i = 0; i < keys.length - 1; i++) {
            if (typeof cur[keys[i]] !== 'object' || cur[keys[i]] === null) cur[keys[i]] = {};
            cur = cur[keys[i]];
        }
        // normalizza: stringa vuota = null (cancella), numeri come numeri
        let v = value;
        if (typeof v === 'string') {
            const t = v.trim();
            if (t === '') { v = null; }
            else if (!isNaN(t) && t !== '') { v = parseFloat(t); }
            else { v = t; }
        }
        if (cur[keys[keys.length - 1]] === v) return;  // idempotente
        cur[keys[keys.length - 1]] = v;
        save();
    }

    function state() { return JSON.parse(JSON.stringify(article)); }

    // Sostituisce completamente lo stato articolo (usato dall'archivio
    // per caricare un articolo salvato). Normalizza e salva.
    function replace(nuovoStato) {
        article = mergeDeep(emptyArticle(), nuovoStato || {});
        save();
    }

    // Ripopola i campi del modulo attivo dall'articolo (dopo replace)
    function refresh() {
        const active = activeModuleId();
        if (active) populateModule(active);
        renderBar();
        if (typeof Kpi !== 'undefined' && Kpi.renderScheda) Kpi.renderScheda();
    }

    function reset() {
        article = emptyArticle();
        save();
    }

    function subscribe(fn) { listeners.push(fn); }
    function notify() { for (const fn of listeners) { try { fn(article); } catch (e) {} } }

    // ---- Completezza ----
    function completezza() {
        const fatti = ESSENZIALI.filter(p => get(p) !== null && get(p) !== undefined).length;
        return { fatti, totale: ESSENZIALI.length, pct: Math.round(fatti / ESSENZIALI.length * 100) };
    }

    // ---- Barra UI ----
    function renderBar() {
        const chip = document.getElementById('articolo-chip');
        const comp = document.getElementById('articolo-complete');
        const art = get('identita.articolo');
        if (chip) {
            chip.textContent = art ? ('📄 ' + art) : '📄 Nessun articolo';
            chip.classList.toggle('has-article', !!art);
        }
        if (comp) {
            const c = completezza();
            comp.textContent = c.fatti + '/' + c.totale + ' campi (' + c.pct + '%)';
            comp.className = 'articolo-complete ' + (c.pct >= 100 ? 'full' : c.pct > 0 ? 'partial' : 'empty');
        }
    }

    // ---- Hook sui moduli: lettura all'apertura ----
    // Mappa: id input -> path articolo. I moduli leggono da qui all'apertura.
    const INPUT_MAP = {
        // Scheda Tecnica
        'st-articolo': 'identita.articolo',
        'st-variante': 'identita.variante',
        'st-pml': 'pesi.pesoFinitoMl',
        'st-hf': 'costruzione.hf',
        'st-fili': 'costruzione.filiTotali',
        'st-hp': 'costruzione.hp',
        'st-colpi': 'costruzione.colpiTelaio',
        'st-iio': 'imborsi.iio',
        'st-iro': 'imborsi.iro',
        'st-iit': 'imborsi.iit',
        'st-irt': 'imborsi.irt',
        'st-pot': 'imborsi.pot',
        'st-pr': 'imborsi.pr',
        // Pettine (calcolo)
        'pc-fo': 'costruzione.filiTotali',
        'pc-hp': 'costruzione.hp',
        'pc-hgg': 'costruzione.hgg',
        'pc-hf': 'costruzione.hf',
        'pc-iit': 'imborsi.iit',
        'pc-imp': 'pettine.imp',
        // Pettine limite
        'pl-nm': 'titoli.nmOrdito',
        'pl-imp': 'pettine.imp',
        // Peso
        'peso-fo': 'costruzione.filiTotali',
        'peso-nmo': 'titoli.nmOrdito',
        'peso-colpi': 'costruzione.colpiTelaio',
        'peso-nmt': 'titoli.nmTrama',
        'peso-hp': 'costruzione.hp',
        'peso-iio': 'imborsi.iio',
        'peso-iro': 'imborsi.iro',
        'peso-pot': 'imborsi.pot',
        // Riduzione
        'rid-fo': 'costruzione.filiTotali',
        'rid-hp': 'costruzione.hp',
        'rid-iit': 'imborsi.iit',
        'rid-irt': 'imborsi.irt',
        'rid-iio': 'imborsi.iio',
        'rid-colpi': 'costruzione.colpiTelaio',
        'rid-rapporto': 'pettine.imp',
        'rid-passaggi': null,  // non memorizzato: input locale
        // Note di colore
        'nc-fo': 'costruzione.filiTotali'
    };

    // Popola gli input di un modulo dall'articolo.
    // L'articolo è la fonte di verità: all'apertura il modulo mostra
    // SEMPRE il valore corrente dell'articolo (se presente). Così una
    // modifica fatta in un modulo si vede subito negli altri.
    function populateModule(moduleId) {
        const mod = document.getElementById('mod-' + moduleId);
        if (!mod) return;
        mod.querySelectorAll('input, select').forEach(inp => {
            const path = INPUT_MAP[inp.id];
            if (!path) return;
            const v = get(path);
            if (v === null || v === undefined) return;
            inp.value = v;
        });
    }

    // ---- Hook sui bottoni Calcola: scrittura dei risultati ----
    // Dopo ogni calcolo, raccoglie i valori "canonici" dai campi del modulo
    // attivo e li scrive nell'articolo.
    function collectFromModule(moduleId) {
        const mod = document.getElementById('mod-' + moduleId);
        if (!mod) return;
        mod.querySelectorAll('input, select').forEach(inp => {
            const path = INPUT_MAP[inp.id];
            if (!path) return;
            if (inp.value === '' || inp.value === null) return;
            set(path, inp.value);
        });
    }

    function activeModuleId() {
        const m = document.querySelector('.module.active');
        return m ? m.id.replace('mod-', '') : null;
    }

    // ---- Init ----
    function init() {
        load();

        // Popola il modulo attivo all'apertura
        const active = activeModuleId();
        if (active) populateModule(active);

        // Hook navigazione: popola il modulo che si apre
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const mod = this.dataset.module;
                if (mod) populateModule(mod);
            });
        });

        // Hook sub-tab: popola il pannello che si apre
        document.querySelectorAll('.sub-tab').forEach(btn => {
            btn.addEventListener('click', function () {
                const panel = document.getElementById('sub-' + this.dataset.sub);
                if (panel) {
                    panel.querySelectorAll('input, select').forEach(inp => {
                        const path = INPUT_MAP[inp.id];
                        if (!path) return;
                        const v = get(path);
                        if (v === null || v === undefined) return;
                        if (inp.value === '') inp.value = v;
                    });
                }
            });
        });

        // Hook Calcola: dopo il calcolo, raccoglie i risultati nell'articolo
        document.querySelectorAll('.btn-calcola').forEach(btn => {
            btn.addEventListener('click', function () {
                const mod = this.closest('.module');
                if (mod) {
                    const modId = mod.id.replace('mod-', '');
                    // lascia terminare il calcolo (le funzioni sono sincrone)
                    setTimeout(() => collectFromModule(modId), 0);
                }
            });
        });

        // Reset ("Nuovo Articolo"): azzera articolo, campi E avanzamento KPI.
        // Se ci sono dati non salvati, avvisa prima di procedere.
        const resetBtn = document.getElementById('articolo-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                const c = completezza();
                const haDati = c.fatti > 0;
                const msg = haDati
                    ? 'Creare un nuovo articolo? L\'articolo corrente (' + c.fatti + '/' + c.totale + ' campi) verrà azzerato. Salvarlo prima in Archivio se vuoi conservarlo.'
                    : 'Creare un nuovo articolo vuoto?';
                if (!confirm(msg)) return;
                reset();
                // ripulisci anche i campi visivi
                document.querySelectorAll('input, select').forEach(inp => {
                    if (INPUT_MAP[inp.id]) inp.value = '';
                });
                // azzera l'avanzamento moduli (KPI) — nuovo articolo = contatore pulito
                if (typeof Kpi !== 'undefined' && Kpi.reset) Kpi.reset();
                // aggiorna la checklist Stato Articolo
                if (typeof Kpi !== 'undefined' && Kpi.renderScheda) Kpi.renderScheda();
            });
        }

        renderBar();
        subscribe(renderBar);
    }

    // Espone l'API per uso futuro (export, stampa)
    const api = {
        get: get,
        set: set,
        state: state,
        replace: replace,
        refresh: refresh,
        reset: reset,
        completezza: completezza,
        FIELDS: FIELDS,
        ESSENZIALI: ESSENZIALI
    };
    try { window.Articolo = api; } catch (e) {}
    try { globalThis.Articolo = api; } catch (e) {}

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
