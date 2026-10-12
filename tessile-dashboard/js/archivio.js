// archivio.js — Archivio Articoli: salva, carica, elimina articoli
// Tecnico Tessile Pratese
//
// Concetto: l'articolo corrente (Articolo.state()) può essere salvato
// in una libreria persistita in localStorage. Dall'archivio si può:
//   - Salva: snapshot dell'articolo corrente con nome e timestamp
//   - Carica: ripristina l'articolo e ripopola i moduli (fonte: articolo)
//   - Elimina: rimuove la voce dall'archivio
//
// Sicurezza: i nomi articolo sono input utente -> SEMPRE escapati
// prima di essere inseriti nel DOM (vettore XSS se il nome contiene
// <script> o attributi on*). Nessun innerHTML con dati non fidati.

(function () {
    'use strict';

    const STORAGE_KEY = 'ttp_archivio_v1';

    let voci = [];  // [{ id, nome, salvatoIl, stato }]

    // ---- Persistenza ----
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) voci = parsed.filter(isVoceValida);
            }
        } catch (e) { voci = []; }
    }

    function isVoceValida(v) {
        return v && typeof v === 'object' && typeof v.id === 'string' &&
               typeof v.nome === 'string' && v.stato && typeof v.stato === 'object';
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(voci));
        } catch (e) { /* storage pieno: lo stato resta in memoria */ }
    }

    // ---- Utility DOM sicura ----
    function el(tag, cls, testo) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (testo !== undefined) e.textContent = testo;  // textContent: mai HTML
        return e;
    }

    function formattaData(iso) {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
                   ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        } catch (e) { return iso; }
    }

    function riepilogoStato(stato) {
        const c = stato && stato.costruzione ? stato.costruzione : {};
        const parti = [];
        if (c.filiTotali != null) parti.push(c.filiTotali + ' fili');
        if (c.hp != null) parti.push('Hp ' + c.hp);
        if (stato && stato.imborsi && stato.imborsi.iit != null) parti.push('IIT ' + stato.imborsi.iit);
        return parti.length ? parti.join(' · ') : '—';
    }

    // ---- Azioni ----
    function salvaCorrente() {
        if (typeof Articolo === 'undefined') return;
        const stato = Articolo.state();
        // Rifiuta il salvataggio di un articolo completamente vuoto
        const vuoto = Object.keys(stato).every(sez =>
            !stato[sez] || typeof stato[sez] !== 'object' ||
            Object.values(stato[sez]).every(v => v === null || v === undefined)
        );
        if (vuoto) {
            alert('Nessun dato da salvare: compila prima la scheda tecnica.');
            return;
        }
        const nome = (stato.identita && stato.identita.articolo) || ('Articolo ' + (voci.length + 1));
        // Salva anche lo stato KPI: caricando l'articolo, l'avanzamento
        // moduli torna com'era al momento del salvataggio
        const kpiStato = (typeof Kpi !== 'undefined' && Kpi.getDone) ? Kpi.getDone() : {};
        const voce = {
            id: 'a' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            nome: nome,
            salvatoIl: new Date().toISOString(),
            stato: stato,
            kpi: kpiStato
        };
        voci.unshift(voce);
        save();
        render();
    }

    function caricaVoce(id) {
        const voce = voci.find(v => v.id === id);
        if (!voce || typeof Articolo === 'undefined') return;
        if (!confirm('Caricare "' + voce.nome + '"? L\'articolo corrente verrà sostituito.')) return;
        // Sostituisci stato, ripopola i moduli, ripristina il KPI
        Articolo.replace(voce.stato);
        Articolo.refresh();
        if (typeof Kpi !== 'undefined' && Kpi.setDone) Kpi.setDone(voce.kpi || {});
        // Chiudi modale
        nascondi();
    }

    function eliminaVoce(id) {
        const voce = voci.find(v => v.id === id);
        if (!voce) return;
        if (!confirm('Eliminare "' + voce.nome + '" dall\'archivio?')) return;
        voci = voci.filter(v => v.id !== id);
        save();
        render();
    }

    // ---- Rendering ----
    function render() {
        const lista = document.getElementById('archivio-lista');
        const conta = document.getElementById('archivio-conta');
        if (!lista) return;
        lista.innerHTML = '';
        if (conta) conta.textContent = voci.length + (voci.length === 1 ? ' articolo' : ' articoli');

        if (voci.length === 0) {
            lista.appendChild(el('li', 'archivio-vuoto',
                'Nessun articolo in archivio. Compila una scheda tecnica e premi "Salva articolo corrente".'));
            return;
        }

        for (const voce of voci) {
            const li = el('li', 'archivio-voce');

            const info = el('div', 'archivio-info');
            info.appendChild(el('span', 'archivio-nome', voce.nome));           // textContent: sicuro
            info.appendChild(el('span', 'archivio-meta',
                formattaData(voce.salvatoIl) + ' — ' + riepilogoStato(voce.stato)));

            const azioni = el('div', 'archivio-azioni-voce');
            const btnCarica = el('button', 'btn-archivio btn-carica', 'Carica');
            btnCarica.type = 'button';
            btnCarica.addEventListener('click', () => caricaVoce(voce.id));
            const btnElimina = el('button', 'btn-archivio btn-elimina', 'Elimina');
            btnElimina.type = 'button';
            btnElimina.addEventListener('click', () => eliminaVoce(voce.id));
            azioni.appendChild(btnCarica);
            azioni.appendChild(btnElimina);

            li.appendChild(info);
            li.appendChild(azioni);
            lista.appendChild(li);
        }
    }

    // ---- Modale ----
    function mostra() {
        const ov = document.getElementById('archivio-overlay');
        if (ov) {
            ov.hidden = false;
            render();
        }
    }

    function nascondi() {
        const ov = document.getElementById('archivio-overlay');
        if (ov) ov.hidden = true;
    }

    // ---- Init ----
    function init() {
        load();

        const btnOpen = document.getElementById('archivio-open');
        if (btnOpen) btnOpen.addEventListener('click', mostra);

        const btnClose = document.getElementById('archivio-close');
        if (btnClose) btnClose.addEventListener('click', nascondi);

        const btnSalva = document.getElementById('archivio-salva');
        if (btnSalva) btnSalva.addEventListener('click', salvaCorrente);

        // Click sull'overlay (fuori dalla modale) chiude
        const ov = document.getElementById('archivio-overlay');
        if (ov) {
            ov.addEventListener('click', function (e) {
                if (e.target === ov) nascondi();
            });
        }

        // Esc chiude
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') nascondi();
        });

        render();
    }

    // API per uso futuro / test
    const api = {
        salva: salvaCorrente,
        carica: caricaVoce,
        elimina: eliminaVoce,
        lista: () => voci.map(v => ({ id: v.id, nome: v.nome, salvatoIl: v.salvatoIl })),
        conta: () => voci.length,
        mostra: mostra,
        nascondi: nascondi
    };
    try { window.Archivio = api; } catch (e) {}
    try { globalThis.Archivio = api; } catch (e) {}

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
