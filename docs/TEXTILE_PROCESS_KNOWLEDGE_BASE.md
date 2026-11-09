# PRATO TEXTILE WORLD — Base documentale del processo (WP00)

Stato: ricerca iniziale, sola lettura delle fonti. Documento di lavoro LOCALE: contiene percorsi del computer dell'utente; non pubblicare senza revisione dei riferimenti e dei diritti. Nessun valore di resa, velocità, temperatura, consumi o sequenza aziendale è inferito. `p.` indica la pagina fisica del PDF (base 1); per G si usano i paragrafi del documento.

## 1. Provenienza e limiti del corpus

Inventario mirato, non censimento esaustivo dei dischi: le cartelle più pertinenti sono `/mnt/c/Users/ACER/Documents/SCUOLA/`, `/mnt/c/Users/ACER/Documents/Tesina GEFITES Settembre 2026/`, `/mnt/c/Users/ACER/Desktop/Note di colore app/` e le estrazioni in `/mnt/c/Users/ACER/Documents/Manuali/`. Alcuni elaborati della tesina sono copie/render, non fonti indipendenti. I PDF A–F e H hanno testo estraibile sulle pagine citate; C è OCR e i numeri critici vanno confermati sul documento grafico prima di usarli in un simulatore. H contiene anche pagine senza testo: le citazioni qui sotto riguardano pagine effettivamente lette. G è un appunto di lezione con refusi, non una scheda d'impianto.

| ID | Fonte locale accessibile | Argomento / localizzatore | Ambito di affidabilità |
|---|---|---|---|
| A | `/mnt/c/Users/ACER/Documents/SCUOLA/Tessitura Ortogonale Cora Dormiendo/lezioni/Tessile_lana storia completa.pdf` | ARPA Biella/Vercelli, pp. 20–37; controllo/rammendo p. 147 | Processo laniero generale, NON prova della dotazione di Prato. |
| B | `/mnt/c/Users/ACER/Documents/SCUOLA/Filati Simona Ciardi/filatura_appunti.pdf` | Fibre e filatura cardata/pettinata pp. 1–3 | Appunti di filatura; verificare i dettagli con A e altre fonti. |
| C | `/mnt/c/Users/ACER/Desktop/Note di colore app/libro moretti_ottimizato.pdf` | Alberto Moretti, preparazione alla tessitura pp. 180–182; imbozzimatura p. 194 | Manuale tecnico OCR, non un impianto specifico. |
| D | `/mnt/c/Users/ACER/Documents/SCUOLA/Tessitura Ortogonale Cora Dormiendo/GEFITE_tessitura Cora Dormendo.pdf` | Roccatrice/orditura pp. 4–5; licci pp. 32, 59 | Lezione su tessitura ortogonale. |
| E | `/mnt/c/Users/ACER/Documents/SCUOLA/Enrico Ciapini - Nobilitazione tessile/finissaggio tessuti di lana C.pdf` | Esempio ciclo cardato pp. 4–6; garzatura p. 35; cimatura p. 42 | La sequenza di finissaggio è un ESEMPIO, non universale. |
| F | `/mnt/c/Users/ACER/Documents/SCUOLA/Enrico Venturini/Pdf venturini/Schema_Processo_Tessile_Abbigliamento_SupplyChain.pdf` | Filiere/alternative pp. 2, 4, 7–8 | Schema didattico di settore, non specifico del distretto. |
| G | `/mnt/c/Users/ACER/Documents/SCUOLA/Enrico Venturini/Appunti/appunti lezione 19.12.docx` | «Sunto 19-01-2026», paragrafi 62–76 | Appunto sul riciclato, da validare con tecnico/impianto. |
| H | `/mnt/c/Users/ACER/Documents/SCUOLA/Tessitura Ortogonale Cora Dormiendo/lezioni/FABRIC_MANUFACTURING_02/Weaving_ITU_Chapter_3c_Jacquard.pdf` | Jacquard pp. 2, 8–9 | Meccanismo generale, non obbligatorio nel percorso pilota. |

Media potenzialmente illustrativi, presenza/formato verificati ma contenuto visivo e licenze NON verificati: `/mnt/c/Users/ACER/Documents/Tesina GEFITES Settembre 2026/Immagini di riferimento/Fasi Lavoro/FotoVideo Lavoro/{Orditura.MOV,Tessitura.MOV,Tessitura2.MOV}`, `/mnt/c/Users/ACER/Desktop/Pool/{telaiojacquard.mov,telaiojacquard2.mov}`, `/home/indigo/RonaldoRiska/assets/video/{orditura-hero.mp4,tessitura-hero.mp4}`. Non copiare o pubblicare i media senza verifica dei diritti.

Riferimenti territoriali esterni, di contesto (non sostitutivi del manuale): [Museo del Tessuto — Prato e la tradizione tessile](https://www.museodeltessuto.it/about/) descrive filatura, tessitura, tintura, rifinizione e i terzisti; [percorso espositivo](https://www.museodeltessuto.it/percorso-espositivo/) documenta la tradizione della lana rigenerata; [Comune di Prato — Prato Textile District](https://www.comune.prato.it/it/vivere-il-comune/buoneprassi/prato-textile-district/archivio42_0_99.html) conferma la vocazione al recupero. Il corso d'acqua storicamente associato alle gualchiere pratesi è il Bisenzio (Museo, «Prato e la tradizione tessile»), non l'Arno: `prato-3d.js:96` contiene un commento geografico errato da correggere in un WP autorizzato.

## 2. Livelli di evidenza

- `GENERAL_DOCUMENTED`: meccanismo o passaggio attestato da una fonte tessile letta; NON autorizza a chiamarlo «macchina di Prato» né a fissare valori.
- `PRATO_CONTEXT`: tradizione/distretto confermati da fonte territoriale, senza attribuzione a stabilimenti.
- `FIELD_VALIDATION_PENDING`: dettaglio nei soli appunti G o ricostruzione proposta; non rappresentare come configurazione reale di un'impresa.
- `DESIGN_OPTION`: collegamento narrativo, visuale o gameplay senza prova documentale; esporre come ipotesi di progetto.

## 3. Grafo tessile documentabile

Il grafo descrive stati della materia e processi, NON la geografia della mappa. Gli archi tra stabilimenti sono una scelta di design finché non si documentano aziende/itinerari. Il telaio richiede contemporaneamente un ramo ORDITO e uno TRAMA: non sono due passi seriali. I rami di tintura entrano nel punto corrispondente al supporto. Il finissaggio è un insieme di trattamenti configurabili per articolo, non una lista che ogni pezza percorre.

```text
[LANIERO GENERALE, A pp.20–25; B pp.1–3]
  lana sucida -> selezione/apertura -> lavaggio -> fibra preparata
  fibra preparata -> cardatura -> velo/nastro -> (cardato: stoppino -> filatura)
  fibra preparata -> preparazione/pettinatura -> top -> stiro -> filatura pettinata
  NOTA: A descrive cardatura anche a monte della pettinatura; G la nega in un appunto.
  Il dettaglio del ramo pettinato resta da riconciliare prima dell'animazione.

[RECUPERO, G §§62–76: da validare sul campo]
  stracci/scarti -> cernita -> taglio -> sfilacciatura/depolverizzazione
  -> pressatura -> apertura/miscelazione (fresa/lupa) -> ensimaggio
  -> cardatura -> velo -> divisore/stoppino -> filatura (self-acting nell'appunto)
  Non assumere che ogni linea esegua tutte queste operazioni nell'ordine scritto.

[COLORAZIONE, A pp.26–30]
  fiocco/top -> tintura in fibra/top -> filatura    [alternativa]
  filato -> tintura in rocca/matassa -> preparazione alla tessitura [alternativa]
  pezza greggia -> tintura in pezza -> finissaggio pertinente       [alternativa]
  Possibili percorsi anche non tinti; un solo cammino coloristico va scelto per il caso pilota.

[TESSITURA, A pp.26–27; C pp.180–182,194; D pp.4–5,32,59]
  filato -> roccatura -> orditura -> subbio -> [imbozzimatura se prevista]
         -> incorsatura/impettinatura -------------------------------+
  filato -> preparazione della trama -------------------------------+-> telaio
    telaio (passo, inserzione trama, battuta, avanzamento) -> pezza greggia
    telaio a licci / Jacquard = tecnologie ALTERNATIVE, non fasi consecutive.

[DOPO LA TESSITURA, A pp.33–37,147; E pp.4–6,35,42; F pp.7–8]
  pezza greggia -> [controllo/rammendo] -> [tintura in pezza se scelta]
               -> finissaggi idonei all'articolo -> controllo finito -> tessuto finito
  tessuto finito -> vendita/uso come tessuto
  oppure, se si sceglie un capo: -> stesura/taglio -> confezione
               -> stiro/controllo -> imballaggio/spedizione.
```

`[ ]` significa facoltativo o condizionale, NON «mancante». Punti da NON chiudere senza fonti ulteriori: ordini dei trattamenti per un articolo identificato; dettagli della pettinatura contraddittori fra A/G; schemi di ricircolo materia/materiale; esistenza reale di capannoni/macchinari in posizioni precise del distretto; qualifiche e quantità. Per il pilota scegliere e citare una singola configurazione didattica, dichiarata tale.

## 4. Schede macchina: ingresso / funzione / uscita (senza valori inventati)

| Priorità | Processo / macchina | Input → trasformazione rappresentabile → output | Evidenza |
|---|---|---|---|
| P0 | Telaio a licci | Subbio d'ordito + trama → licci formano il passo, la trama viene inserita, il pettine la batte e il tessuto avanza → pezza greggia. Animare in questa relazione causale, non come oscillazioni decorative. | A p. 26, nota 7, e p. 27; D p. 59. |
| P1 | Roccatrice | Filato → controllo/riavvolgimento → rocca idonea. | C p. 181; D p. 4. |
| P1 | Orditoio sezionale | Rocche sulla cantra → raggruppamento in sezioni, passaggio al subbio → ordito preparato. | C p. 182; D p. 5. |
| P1 | Cardatrice + divisore | Fibra preparata → cilindri guarniti e velo cardato; secondo linea, successivo nastro o divisore → stoppino. Non chiamare «stoppino» l'uscita automatica di ogni carda. | A pp. 22–23; B p. 1; G §§72–75 (divisore da validare). |
| P1 | Filatoio (ring o self-acting) | Stoppino/preparato → stiro, torsione e avvolgimento → filato. Le tecnologie sono alternative con cinematismi diversi. | A pp. 24–25; B pp. 2–3; G §75 per self-acting locale da validare. |
| P2 | Tintoria | Fiocco, top, rocca/matassa o pezza → bagno/fissazione/asciugatura adeguati al supporto → materiale tinto allo stesso stadio. Non imporre una ricetta numerica. | A pp. 27–30. |
| P2 | Garzatrice / cimatrice / follone | Pezza → sollevamento del pelo / taglio uniforme del pelo / compattazione in umido → effetti distinti di superficie e mano. Solo se richiesti dall'articolo. | A pp. 35–36; E pp. 35, 42. |
| P2 | Rameuse | Pezza → trasporto in continuo e trattamento termico secondo ricetta → asciugatura/stabilizzazione. | A p. 35; E pp. 26, 28. |
| P3 | Pettinatrice / Jacquard | Fibre preparate → selezione fibre lunghe → top; oppure controllo individuale di fili d'ordito sul telaio. Due famiglie non connesse nello stesso percorso obbligato. | A pp. 21–23; H pp. 2, 8–9. |

## 5. Schede tecniche e modello del grafo futuro

Ogni scheda del mondo deve mostrare `nome`, `scopo`, `ingressi`, `trasformazione osservabile`, `uscite`, `controlli documentati`, `fonteIds` + pagine, `evidenceLevel` e `condizione`. Parametri non presenti in fonte: «non documentato», NON un numero dimostrativo mascherato da dato reale. Un grafo dati deve supportare più ingressi richiesti insieme (ordito E trama), rami alternativi condizionati (tintura, cardato/pettinato, capo/tessuto) e ritorni solo se documentati: `nextProcesses[]` da solo non basta. Distinguere progressione didattica dall'effettivo movimento dei lotti aziendali.

## 6. Verifiche aperte prima di WP02/WP03

1. Validare con fonti tecniche aggiuntive o un esperto il caso pilota del telaio (tipo di trama e armatura, sequenza dei moti, dettagli non coperti dal disegno di principio). Non derivare titoli/densità/velocità dai filmati.
2. Scegliere la materia/prodotto pilota e registrare fonte per ogni arco; senza conferma, usare una scena di tessitura DIDATTICA non associata a un'impresa o tessuto specifici.
3. Chiarire titolarità/licenze dei MOV e dei PDF; non copiarli nella build pubblica né in `public/` senza permesso.
4. Riconciliare la contraddizione del ramo pettinato A/G e validare in campo la sequenza della rigenerazione G prima di chiamarla «il ciclo pratese».
5. Le citazioni e i percorsi locali sono per studio, non per pubblicazione automatica sul sito.
