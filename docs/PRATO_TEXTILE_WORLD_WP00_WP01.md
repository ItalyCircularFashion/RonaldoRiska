# PRATO TEXTILE WORLD — Rapporto tecnico WP00–WP01 e progetto a livelli

> Per Hermes: eseguire solo le fasi autorizzate. L'incarico corrente termina dopo WP00 e WP01; WP02 richiede una nuova autorizzazione. Nessun commit, push o installazione di software di sistema è autorizzato da questo rapporto.

**Obiettivo:** mondo 3D esplorabile e didattico nel quale un avatar segue la trasformazione della materia tessile attraverso un distretto stilizzato ispirato a Prato. Interazioni originali; NON un clone di Bruno Simon né un digital twin industriale basato su dati reali in assenza di dati convalidati.

**Documento di dominio:** [TEXTILE_PROCESS_KNOWLEDGE_BASE.md](TEXTILE_PROCESS_KNOWLEDGE_BASE.md). Le citazioni locali e i diritti di riuso richiedono revisione prima di qualunque pubblicazione.

## 1. Stato iniziale verificato

Repository canonico esaminato: `/home/indigo/RonaldoRiska`, branch `main`, commit `77339bf`, remote `git@github.com:ItalyCircularFashion/RonaldoRiska.git`. Il working tree non aveva modifiche tracciate all'inizio; `b.html` e backup `.bak` erano preesistenti e restano fuori ambito. Il sito live risponde HTTP 200.

`index.html:326–345,819–820` ospita un prototipo procedurale Three.js con auto guidabile, cartelli Tessitura/CAD Moda/Supply Chain e import map da CDN (`prato-3d.js`, `prato-3d.css`). In browser di test la scena risulta pronta sia desktop sia mobile e genera draw call: questo NON conferma il funzionamento sul dispositivo dell'utente che aveva segnalato «non funziona il coso 3d». Non ci sono avatar, ingresso in stabilimento, interazione `E`, macchina tessile con ciclo causale completo o modello di filiera.

Problemi osservati nel prototipo: `prato-3d.js:236–240` ascolta i tasti globalmente anche nei campi form; in prova la `W` nella ricerca ha mosso l'auto. A movimento ridotto `updateCar` disabilita la guida, benché le istruzioni restino visibili (`prato-3d.js:288,314–320`). Un import Three.js assente simulato lascia «Caricamento scena 3D…» senza fallback: il `catch` protegge solo la creazione del renderer (`prato-3d.js:18–25`); non è prova che il CDN attuale sia guasto. `prato-3d.js:96` chiama «Arno» il fiume della scena; il Museo del Tessuto documenta il Bisenzio per Prato. I fili dei telai oscillano, ma non mostrano licci, passo, trama, pettine e avanzamento come ciclo (`prato-3d.js:131–153,332–344`). Nessuno di questi file è modificato in WP00–WP01.

Ambiente: Blender 5.0.1, Node 24.21.0 e npm 11.19.0 sono presenti; non è stata fatta alcuna installazione. `package.json` del sito usa uno script Babel per `temp_app.jsx` (non la pipeline della nuova app). `.github/workflows/pages.yml:23–25` carica l'intera root `.` come artifact Pages: non è una build Vite né una selezione di file pubblicabili. `lca_data.db` è tracciato e raggiungibile pubblicamente (HTTP 200, 77824 byte); lo schema non contiene colonne nominativamente PII, ma il contenuto e la pubblicabilità non sono stati revisionati. Prima di cambiare workflow o di pubblicare nuovi documenti occorre un audit dedicato.

## 2. Livelli progettuali, con gate

| Livello | Pacchetti | Output | Gate |
|---|---|---|---|
| L0 — Evidenza | WP00 Discovery & Research | Fonti locali inventariate in modo mirato, grafo documentabile, status delle affermazioni | Terminato con limiti espliciti: fonti generali vs Prato; rami non validati. |
| L1 — Contratto | WP01 Technical Architecture | Struttura app, modello dati, asset pipeline, QA/security, WBS | Terminato come proposta; nessuna dipendenza installata né codice dell'app. |
| L2 — Vertical slice | WP02 World MVP → WP03 First Textile Factory → WP04 Production Graph | Avatar → stabilimento → telaio animato → scheda con fonte; poi rami del grafo | **BLOCCATO da approvazione WP02**; proseguire un WP alla volta. |
| L3 — Espansione | WP05 District Expansion → WP06 Gameplay & Education | Macchine ed edifici aggiuntivi, percorso materia e modalità libera | Solo dopo vertical slice verificata e fonti delle nuove fasi. |
| L4 — Rilascio | WP07 Visual Polish → WP08 QA & Deployment | Art/ottimizzazione, test, artifact statico sicuro | Nessun push/deploy senza approvazione separata. |

Ogni WP futuro deve produrre codice reale, documenti, evidenze di esecuzione/browser, limiti, criteri verificati e verdetto PASS / PASS WITH ISSUES / FAIL. Non promuovere un WP perché passa soltanto `build`.

## 3. WP00 — Risultati e decisioni di dominio

Fonti locali A–H, percorsi/pagine, grafo delle fasi, schema macchine e incertezze sono nel documento di dominio. La ricerca è mirata a SCUOLA/Tesina/Manuali, non certifica di aver letto ogni file della macchina. A è un testo ARPA Biella/Vercelli (meccanica laniera, NON mappa industriale di Prato); G sono appunti sul riciclato da confermare. Fonti territoriali [Museo del Tessuto](https://www.museodeltessuto.it/about/) e [Comune di Prato](https://www.comune.prato.it/it/vivere-il-comune/buoneprassi/prato-textile-district/archivio42_0_99.html) confermano il contesto del distretto ma non i parametri di un impianto.

Regola progettuale: il percorso pilota è un caso DIDATTICO documentato, non il percorso obbligatorio di ogni tessuto. Distinguere almeno i rami di rigenerazione da validare, cardato/pettinato, tintura fibra/filato/pezza, i due ingressi sincronizzati ordito+trama, trattamenti di finissaggio condizionali e confezione solo se il prodotto è un capo. Un'animazione non convalida da sola la correttezza tessile.

## 4. WP01 — Architettura proposta (non implementata)

**App autonoma e modulare** sotto `apps/prato-textile-world/`, senza sostituire la home o editare gli altri tool. Build statica compatibile con GitHub Pages in `/RonaldoRiska/prato-textile-world/`, configurando `base` in Vite; inizialmente anteprima solo locale. In WP08 il workflow dovrà costruire la nuova app e caricare un artifact con allowlist, NON l'intera root: questo cambiamento non rientra in WP01. La home potrà linkare l'esperienza solo dopo approvazione e test.

**Stack candidato, senza dipendenze installate:** TypeScript + Vite + React 19, Three.js + @react-three/fiber v9, @react-three/drei, @react-three/rapier v2 (WASM), Zustand per progressi/selezioni, GSAP solo per UI, Vitest + Playwright. La documentazione [R3F](https://r3f.docs.pmnd.rs/getting-started/introduction) abbina React 19 a R3F 9 (v10 è alpha); [Rapier](https://pmndrs.github.io/react-three-rapier/) v2 supporta React 19/R3F 9. Prima di WP02 scegliere versioni STABILI compatibili e fissarle in `package-lock.json`; non importare i CDN della homepage. Valutare se Rapier aggiunge costo sufficiente per le collisioni dell'MVP, ma il brief lo preferisce. Nessun backend né dataset aziendale reale in questa fase.

**Schema logico (non ancora implementato):**

```ts
// Distinguere fonte, stato materiale, trasformazione e progressione della visita.
type Evidence = 'GENERAL_DOCUMENTED' | 'PRATO_CONTEXT' |
  'FIELD_VALIDATION_PENDING' | 'DESIGN_OPTION';
type SourceRef = { id: string; locator: string; evidence: Evidence };
type MaterialState = { id: string; label: string; form: string };
type ProcessNode = {
  id: string; label: string;
  requiresAll: string[]; // es. telaio: ordito E trama
  produces: string[];
  routeConditions: string[]; // es. colore in filo, articolo cardato
  nextIds: string[]; // non sostituisce la validazione requiresAll
  machineId?: string; factoryId?: string; sourceRefs: SourceRef[];
};
type VisitProgress = { visitedNodes: string[]; selectedRoute?: string };
```

Validatore del grafo: ID unici; referenze esistenti; niente archi verso stati inesistenti; `requiresAll` verificato sui materiali; percorsi alternativi espliciti; nessuna fase segnata «Prato reale» sulla base dei soli manuali generali. Progressi di gameplay separati dai cambiamenti di stato del materiale; Zustand non gestisce la posizione ad ogni frame (lato fisica/R3F). Pannelli di contenuto in DOM semantico e utilizzabili senza WebGL.

Struttura prevista (i file che seguono NON esistono ancora):

```text
RonaldoRiska/
  index.html                         # invariato fino a una successiva approvazione
  docs/TEXTILE_PROCESS_KNOWLEDGE_BASE.md
  docs/PRATO_TEXTILE_WORLD_WP00_WP01.md
  apps/prato-textile-world/
    index.html  package.json  package-lock.json  tsconfig.json  vite.config.ts
    src/main.tsx  src/App.tsx
    src/world/{Terrain,Buildings,FactoryInterior}.tsx
    src/avatar/Avatar.tsx  src/camera/FollowCamera.tsx
    src/physics/colliders.ts  src/interactions/Interactable.tsx
    src/machinery/Loom.tsx  src/education/ProcessPanel.tsx
    src/process/{types,graph,validate}.ts  src/state/store.ts
    src/ui/  src/performance/
    public/models/  public/poster/
    tools/blender/  tests/unit/  tests/e2e/
  .github/workflows/pages.yml       # solo WP08, con artifact selettivo
```

**Pipeline asset:** partire in WP02 con geometrie originali Three.js e un edificio; Blender 5.0.1 già disponibile per modellare proceduralmente una famiglia alla volta con Python (macchine prima dei dettagli ambientali). Esportare GLB/glTF, verificare in viewer, silhouette, pivot, naming e animazioni; dividere esterno/interno per caricamento su richiesta, comprimere/istanziarne le ripetizioni solo dopo profiling. Nessun asset di Bruno Simon o materiale d'autore esterno senza licenza verificata. Per ogni macchina definire contratto di parti mobili, input/output mostrati e comandi start/pause indipendenti.

**Resilienza:** mostrare una poster + percorso HTML leggibile se mancano WebGL, WASM, JS o asset; intercettare anche i fallimenti di import/bootstrap, non solo `new WebGLRenderer`. Con `prefers-reduced-motion` fermare camera automatica/ambienti, non disabilitare il movimento dell'avatar. Touch e tastiera operano solo quando il mondo è attivo e non quando l'utente scrive in un form. Nessuna interazione indispensabile solo hover. FPS e memory target sono obiettivi da misurare su hardware dichiarato, non risultati attuali.

## 5. Specifica della prima vertical slice giocabile (WP02 + WP03, futura)

1. MVP 01 / WP02: una piccola porzione originale del distretto, strade, avatar **a piedi**, camera third-person, collisioni, ingresso e uscita dal primo stabilimento, controlli desktop/touch; modalità guidata minima e libera. Una pagina HTML fallback descrive tappa e fornisce link accessibili.
2. MVP 02 / WP03: nello stabilimento un telaio **a licci** con ordito visibile, licci che aprono il passo, trama inserita, battuta del pettine e progressivo avvolgimento del tessuto; sequenza causale documentata in A p. 26, nota 7, e p. 27. Start/pause indipendente, senza velocità o qualità di un impianto reale inventate.
3. MVP 03 / WP03: avvicinarsi → indicatore → `E`/pulsante touch → camera di dettaglio → scheda con ingresso, trasformazione, uscita, controllo e fonte. Fuori raggio `E` non attiva la macchina; Esc/chiusura ripristina camminata/focus. Distinguere chiaramente locomozione da avanzamento di materia nel grafo.
4. WP04, dopo test della vertical slice: sviluppare il grafo completo dei rami già documentati, senza imporre una sequenza unica. I nodi non validati restano marcati come tali.

Criterio PASS del primo prototipo: scena caricata e percorribile su desktop/mobile; collisione ripetibile; ingresso/uscita; macchina con cinque momenti sincronizzati (licci, passo, trama, pettine, tessuto); scheda leggibile con citazione; gestione 404 asset/WebGL/WASM; registrazione video/screenshot e prova browser reale. Un modello statico con etichetta è FAIL. Il mondo educativo non equivale a un gemello digitale operativo in tempo reale.

## 6. WBS con dipendenze, test e roadmap

| WP | Dipende da | Deliverable minimo e gate di verifica | Stato |
|---|---|---|---|
| 00 Discovery | — | Inventario mirato, fonti lette e citate, grafo con incertezze | PASS WITH ISSUES (Prato/riciclato da validare). |
| 01 Architecture | 00 | Contratto processo/scene, directory, asset/test/publishing strategy | PASS WITH ISSUES (stack non installato, sicurezza deploy da risolvere). |
| 02 Playable World | Approvazione + 01 | Build TS, terrain/strade/avatar/camera/collider/primo edificio, guida desktop/touch, fallback. Vitest + Playwright su artifact locale. | NON AVVIATO. |
| 03 First Factory | 02 + A p.26–27 | Telaio animato causale, E/touch, start/pause, scheda con fonte. Test movimento e browser mobile/desktop. | NON AVVIATO. |
| 04 Production Graph | 03 + validazioni WP00 | Grafo condizionale testato (ordito+trama, tinture, prodotti); ID e citazioni coerenti. | NON AVVIATO. |
| 05 District Expansion | 04 + fonti dei nuovi impianti | Ulteriori stabilimenti/trasporti/modelli; verifiche macchina per macchina. | NON AVVIATO. |
| 06 Gameplay & Education | 04–05 | Segui-la-materia, mappa, progressi, teletrasporto, modalità libera/guidata. | NON AVVIATO. |
| 07 Visual Polish | 03–06 | GLB ottimizzati, luci/transizioni/audio opzionale; profiling CPU/GPU/mobile. | NON AVVIATO. |
| 08 QA & Deploy | 07 + approvazione pubblicazione | Test regressione/accessibilità/performance, artifact allowlist, base Pages, verifica URL live. | NON AVVIATO. |

Per ogni WP di codice: test unitari su dati puri; `tsc --noEmit`, `vite build`, test Vitest e browser Playwright sulla build servita (desktop, 390 px, tasti, touch, reduced-motion, failure injection). Misurare frame time/FPS, draw call, memoria dove disponibile e byte/tempo caricamento; il browser headless non certifica «60 FPS desktop». Il criterio WP00–WP01 è documentale: citazioni con pagine reali, struttura coerente, inventario senza modificare originali e nessun file eseguibile/deploy toccato.

## 7. CQ + cybersecurity / rischi

Rischio globale della **proposta documentale**: basso se resta locale; rischio del **deploy esistente e futuro**: medio finché non viene selezionato l'artifact e revisionata la base pubblicata.

| Area | Finding | Risiko | Mitigazione | Verdetto |
|---|---|---|---|---|
| Provenienza | Manuali A–F/H generali e appunti G non dimostrano una sequenza di un'impresa pratese. | 🟡 Medio | Etichetta per fonte/nodo; validazione con esperto prima di presentare linee aziendali o parametri. | CLEAN_WITH_LIMITS |
| Privacy / diritti | Percorsi locali in questa KB e media/PDF senza licenza di riuso accertata. | 🟡 Medio | Documentazione non committata; redazione per versione pubblica; nessun media/documento originale nell'artifact. | CLEAN_WITH_LIMITS |
| Deploy esistente | Workflow Pages carica `.`; `lca_data.db` tracciato è già HTTP 200 pubblico (contenuto non auditato). | 🟡 Medio | Audit contenuti/necessità del DB; artifact allowlist e review di tutti i file pubblicati prima di un nuovo push. | CLEAN_WITH_LIMITS |
| Import / disponibilità | CDN Three.js e fallback parziale nella scena corrente; blocco CDN simulato lascia loader. | 🟡 Medio | Bundle locale con lockfile, error boundary e fallback HTML; simulare blocco moduli. | CLEAN_WITH_LIMITS |
| Input / accessibilità | Tastiera globale muove l'auto durante digitazione; reduced-motion azzera la guida. | 🟡 Medio | Scope controlli alla scena; ridurre solo effetti non essenziali; test form e tastiera/touch. | CLEAN_WITH_LIMITS |
| Prestazioni | Scene 3D + GLB/WASM possono pesare su telefoni. | 🟡 Medio | Lazy-load, profiling, qualità adattiva, poster, sospensione scene fuori viewport. | CLEAN_WITH_LIMITS |
| Asset di terzi | Somiglianza con Bruno Simon non autorizza riuso di codici, asset, mappe o identità. | 🟡 Medio | Modellazione e interazioni originali, controllo licenze prima dell'import. | CLEAN_WITH_LIMITS |

**Verdetto WP00–WP01:** documentazione locale pronta per revisione; solo conoscenza generale del processo è sufficientemente supportata. Nessuna garanzia di correttezza di dati/impianti pratesi puntuali e nessun WP02 avviato. Decisione successiva: approvare o correggere il caso pilota (telaio a licci didattico) e autorizzare separatamente WP02; pubblicazione ancora distinta.
