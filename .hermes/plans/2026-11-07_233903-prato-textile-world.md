# PRATO TEXTILE WORLD — Piano di implementazione a livelli

> **Per Hermes:** eseguire solo fasi autorizzate; WP00 e WP01 sono ricerca/architettura, WP02 richiede una nuova approvazione. Ogni eventuale commit/push richiede autorizzazione separata.

**Goal:** trasformare la dimostrazione 3D generica del portfolio in un prodotto didattico autonomo: avatar → fabbrica → telaio animato → percorso documentato della materia nella filiera tessile pratese.

**Architecture:** app modulare sotto `apps/prato-textile-world/`; dati del processo separati dal rendering, con fonti e livello di evidenza. Non sostituire `index.html` del portfolio né pubblicare PDF/media locali. Pipeline statica Pages solo dopo gate privacy/QA.

**Tech Stack proposto:** TypeScript, Vite, React 19 + Three.js/R3F 9/Drei, Rapier 2, Zustand, GSAP per UI, Blender già disponibile, Vitest e Playwright. Versioni esatte da bloccare in lockfile solo dopo autorizzazione WP02 e verifica di compatibilità.

---

## Materiale corrente e vincoli

- Repository: `/home/indigo/RonaldoRiska` (branch `main` a `77339bf`; `b.html` e `.bak` preesistenti non toccati).
- Fonti, citazioni e grafo WP00: `/home/indigo/RonaldoRiska/docs/TEXTILE_PROCESS_KNOWLEDGE_BASE.md`.
- Specifica, WBS, CQ/sicurezza, test, roadmap WP01: `/home/indigo/RonaldoRiska/docs/PRATO_TEXTILE_WORLD_WP00_WP01.md`.
- Il deploy attuale carica `.` e espone `lca_data.db`; vietato aggiungere i riferimenti locali al publish set senza revisione privacy. Non attribuire dati o macchine a imprese reali senza evidenza.

## Sequenza esecutiva e prove (un WP alla volta)

### Livello L0 — WP00: ricerca delle fonti (completata con limiti)

1. Identificare fonti A–H e media locali pertinenti; non spostare né copiare gli originali. Verificare `pdfinfo`/`pdftotext` sulle pagine candidate e la leggibilità di DOCX; le parti scansionate non sono evidenza finché non vengono lette.
2. Classificare ogni nodo come processo generale, contesto pratese o appunto da validare. Test documentale: ogni arco nel grafo punta a un ID fonte e un localizzatore; nessun parametro inventato.
3. Pubblicazione interdetta: la KB ha percorsi locali ed è un documento di lavoro. Esito: PASS WITH ISSUES per la specificità territoriale e le licenze media non confermate.

### Livello L1 — WP01: contratto architetturale (completato come proposta)

1. Audit del codice esistente `index.html`, `prato-3d.js`, `prato-3d.css`, `package.json`, `.github/workflows/pages.yml` e del browser live; distinguere scena funzionante nel browser di prova da difetti e incompatibilità del dispositivo utente non riprodotte.
2. Definire i tipi `SourceRef`, `MaterialState`, `ProcessNode`, `VisitProgress` con input congiunti (`requiresAll`), alternative condizionate e tracciamento fonti; definire prototipo avatar → ingresso → telaio.
3. Progettare dir `apps/prato-textile-world/` e build con `base: '/RonaldoRiska/prato-textile-world/'`. Il sito root e il suo `package.json` Babel non sono la nuova app. Gate: rapporto WP01 e struttura futura sono coerenti, nessuna dipendenza installata. Esito: PASS WITH ISSUES per deploy/security preesistenti.

### Livello L2 — WP02: playable world MVP (NON autorizzato)

1. Prima dell'installazione: verificare compatibilità e provenienza delle versioni R3F/Drei/Rapier/Vite; creare `apps/prato-textile-world/package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`. Test: `npm ci`, `npm run typecheck`, `npm run build` solo nella app isolata.
2. Creare `src/main.tsx`, `src/App.tsx`, `src/world/Terrain.tsx` e `Buildings.tsx` con un unico edificio originale, terreno e accesso visibile. Test: build sotto il sottopercorso Pages locale; risorse 200.
3. Creare `src/avatar/Avatar.tsx`, `src/camera/FollowCamera.tsx`, `src/physics/colliders.ts`, `src/interactions/Interactable.tsx`: camminata, collisione, ingresso/uscita. Test browser a 1440/390 px con tastiera e touch; digitare in un campo non muove l'avatar.
4. Implementare fallback HTML se WebGL, WASM o chunk mancano; non far sparire contenuto senza JS. Test Playwright con import/asset bloccati e `prefers-reduced-motion` (avatar ancora guidabile). Evidenza screenshot/video + limiti prima di richiedere WP03.

### Livello L2 — WP03: prima fabbrica (dopo WP02)

1. Aggiungere `src/machinery/Loom.tsx` con eventi indipendenti start/pause: apertura passo da licci, inserzione trama, battuta pettine, avanzamento tessuto. Fonte: KB A p.26, nota 7, e p.27. Test unitario del ciclo degli stati; nessun valore di produttività inventato.
2. Collegare prossimità `E`/pulsante touch e camera di dettaglio; in `src/education/ProcessPanel.tsx` mostrare input, trasformazione, output, controllo e citazione. Test Playwright: fuori raggio non apre, dentro apre, Esc chiude e restituisce focus/movimento.
3. Verificare nel browser la macchina realmente in movimento e l'uscita visiva del tessuto; non basta `node --check` o una card statica.

### Livello L2 — WP04: grafo (dopo WP03)

1. Implementare `src/process/{types,graph,validate}.ts` a partire dalla KB, con test Vitest su ingressi congiunti, ID inesistenti, alternative di tintura/cardato/pettinato e rami non validati.
2. Tenere distinte visita fisica e trasformazione del materiale; vietata la promozione di ipotesi o appunti a dati verificati. Integrare solo dopo i test del pilota.

### Livello L3 — WP05/06: espansione e didattica (dopo WP04)

- Aggiungere una fabbrica/macchina per volta, fonte e QA per ciascuna; poi missioni «segui la materia», mappa e progressione. Validare su percorso materiale e non su decorazioni. I media dell'utente necessitano review licenze; nessuna importazione automatica.

### Livello L4 — WP07/08: polish, QA e rilascio (dopo L3)

- Blender Python → GLB originali; test del viewer, pivot, animazioni e profiling (byte, tempo caricamento, frame time, draw call, memoria). Dati prestazioni solo con hardware/profilo dichiarati.
- Cambiare `.github/workflows/pages.yml` solo dopo privacy audit della root. Build e artifact allowlist per portfolio + app, esclusi DB, backup, fonti locali, cache e node_modules. Verificare link e runtime sul vero URL GitHub Pages dopo autorizzazione esplicita di commit/push.

## Rischi e gate di approvazione

- Fonte tecnica generalista ≠ macchina reale a Prato: scenografia «distretto ispirato a Prato», schede con livello di evidenza. Appunti G da validare.
- Existing site: scena auto funziona nel browser di test ma non riproduce il ciclo; fallback CDN non completo, input globale e movimento ridotto difettosi. Modifiche al sito esistente fuori WP00–WP01.
- Pubblicazione: database già raggiungibile live e workflow troppo permissivo; prima del nuovo push audit dati e artifact allowlist. KB e media restano locali.
- Prossima decisione richiesta: approvare specifica del prototipo DIDATTICO (telaio a licci, nessuna impresa o ricetta attribuita) e autorizzare WP02. WP03 e successivi hanno gate distinti; il push non è implicito.
