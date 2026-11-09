export type Evidence = 'GENERAL_DOCUMENTED' | 'PRATO_CONTEXT' | 'FIELD_VALIDATION_PENDING';
export type SourceRef = { id: string; locator: string; evidence: Evidence };
export type ProcessNode = {
  id: string; label: string; description: string; inputs: string[]; produces: string[];
  requiresAll: string[]; nextIds: string[]; routeConditions: string[];
  sourceRefs: SourceRef[]; machineId?: string; factoryId?: string;
};

const A = (locator: string): SourceRef => ({ id: 'A', locator, evidence: 'GENERAL_DOCUMENTED' });
const C = (locator: string): SourceRef => ({ id: 'C', locator, evidence: 'GENERAL_DOCUMENTED' });
const D = (locator: string): SourceRef => ({ id: 'D', locator, evidence: 'GENERAL_DOCUMENTED' });
const E = (locator: string): SourceRef => ({ id: 'E', locator, evidence: 'GENERAL_DOCUMENTED' });
const G = (locator: string): SourceRef => ({ id: 'G', locator, evidence: 'FIELD_VALIDATION_PENDING' });

// Didactic process possibilities, not an itinerary of real companies or a single compulsory route.
export const processGraph: ProcessNode[] = [
  { id:'fibra', label:'La materia', description:'Lana o materia recuperata hanno origini e preparazioni distinte. La rigenerazione citata negli appunti richiede conferma sul campo.', inputs:['materia da preparare'], produces:['fibra preparata'], requiresAll:[], nextIds:['cardato','pettinato'], routeConditions:['Origine e preparazione dipendono dalla materia scelta.'], sourceRefs:[A('pp. 20–22'),G('§§62–76, da validare')] },
  { id:'cardato', label:'Filatura cardata', description:'Nel percorso cardato, la fibra preparata viene cardata e poi filata. È un ramo alternativo al pettinato per la visita didattica.', inputs:['fibra preparata'], produces:['filato'], requiresAll:['fibra preparata'], nextIds:['roccatura','trama'], routeConditions:['Alternativa didattica: cardato; non richiede la pettinatura.'], sourceRefs:[A('pp. 22–25')] },
  { id:'pettinato', label:'Filatura pettinata', description:'Il percorso pettinato prepara e pettina la fibra prima della filatura. Il dettaglio della sequenza è ancora da riconciliare tra le fonti.', inputs:['fibra preparata'], produces:['filato'], requiresAll:['fibra preparata'], nextIds:['roccatura','trama'], routeConditions:['Alternativa condizionata; sequenza fine da validare.'], sourceRefs:[A('pp. 21–25'),G('§§72–76, in conflitto su un passaggio')] },
  { id:'roccatura', label:'Rocche e preparazione', description:'Il filato viene avvolto su rocche prima di preparare l’ordito.', inputs:['filato'], produces:['rocche'], requiresAll:['filato'], nextIds:['orditura'], routeConditions:[], sourceRefs:[C('p. 181'),D('p. 4')] },
  { id:'orditura', label:'Preparazione dell’ordito', description:'I fili vengono disposti e avvolti sul subbio; seguono le operazioni necessarie a portarli al telaio.', inputs:['rocche'], produces:['ordito pronto'], requiresAll:['rocche'], nextIds:['telaio'], routeConditions:['Imbozzimatura solo se prevista per l’articolo.'], sourceRefs:[C('pp. 180–182, 194'),D('pp. 5, 32')] },
  { id:'trama', label:'Preparazione della trama', description:'Il secondo sistema di fili entra nel passo formato dall’ordito. È un ramo parallelo, non una fase successiva all’orditura.', inputs:['filato'], produces:['trama pronta'], requiresAll:['filato'], nextIds:['telaio'], routeConditions:[], sourceRefs:[A('pp. 26–27')] },
  { id:'telaio', label:'Tessitura · Telaio a licci', description:'Ordito e trama devono essere entrambi disponibili. I licci aprono il passo, la trama passa, il pettine batte e il tessuto avanza. Entra nella fabbrica per vedere il meccanismo.', inputs:['ordito pronto','trama pronta'], produces:['pezza greggia'], requiresAll:['ordito pronto','trama pronta'], nextIds:['pezza'], routeConditions:['Dimostrazione di tessitura ortogonale generale, non un impianto identificato.'], sourceRefs:[A('p. 26 nota 7; p. 27'),D('p. 59')], machineId:'loom', factoryId:'fabbrica-tessitura' },
  { id:'pezza', label:'Pezza greggia', description:'Il tessuto uscito dal telaio può essere controllato, eventualmente tinto in pezza e rifinito secondo l’articolo.', inputs:['pezza greggia'], produces:['pezza da rifinire'], requiresAll:['pezza greggia'], nextIds:['finissaggio'], routeConditions:['Tintura in fibra, in filato o in pezza sono opzioni alternative; non tutte obbligatorie.'], sourceRefs:[A('pp. 27–30, 33–37')] },
  { id:'finissaggio', label:'Finissaggio e controllo', description:'Trattamenti e controlli sono scelti per l’articolo; non esiste un’unica ricetta valida per tutte le pezze.', inputs:['pezza da rifinire'], produces:['tessuto finito'], requiresAll:['pezza da rifinire'], nextIds:[], routeConditions:['I singoli trattamenti sono condizionali.'], sourceRefs:[A('pp. 33–37, 147'),E('pp. 4–6, 35, 42')] },
];

export function validateGraph(nodes: ProcessNode[]): string[] {
  const errors: string[] = [], ids = new Set<string>(), outputs = new Set(nodes.flatMap(n => n.produces));
  for (const node of nodes) {
    if (ids.has(node.id)) errors.push(`ID duplicato: ${node.id}`);
    ids.add(node.id);
    if (!node.sourceRefs.length) errors.push(`Fonte mancante: ${node.id}`);
    for (const input of node.requiresAll) if (!node.inputs.includes(input) || !outputs.has(input)) errors.push(`Ingresso inesistente: ${node.id}/${input}`);
  }
  for (const node of nodes) for (const next of node.nextIds) if (!ids.has(next)) errors.push(`Arco inesistente: ${node.id}/${next}`);
  return errors;
}

export function canProcess(node: ProcessNode, available: ReadonlySet<string>): boolean {
  return node.requiresAll.every(id => available.has(id));
}
