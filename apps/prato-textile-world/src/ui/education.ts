import { processGraph, validateGraph } from '../process/graph';

const sourceNames: Record<string,string> = {
  A:'Tessile_lana storia completa (ARPA Biella/Vercelli)', C:'Moretti · preparazione alla tessitura',
  D:'GEFITE · tessitura ortogonale', E:'Finissaggio tessuti di lana C', G:'Appunti di lezione sul riciclato (da validare)',
};

export function initEducation(): void {
  const errors = validateGraph(processGraph);
  if (errors.length) { console.error('Grafo invalido', errors); return; }
  const list = document.getElementById('stage-list')!;
  const detail = document.getElementById('stage-detail')!;
  list.replaceChildren();
  for (const node of processGraph) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'stage'; button.dataset.stage = node.id;
    button.innerHTML = `<span class="stage-index">${String(processGraph.indexOf(node)+1).padStart(2,'0')}</span><span></span><span class="stage-arrow">↗</span>`;
    button.children[1].textContent = node.label;
    button.addEventListener('click', () => selectStage(node.id));
    list.append(button);
  }
  function selectStage(id: string): void {
    const node = processGraph.find(item => item.id === id);
    if (!node) return;
    for (const item of list.querySelectorAll<HTMLButtonElement>('.stage')) item.setAttribute('aria-current', String(item.dataset.stage === id));
    const h = document.createElement('h3'); h.textContent = node.label;
    const p = document.createElement('p'); p.textContent = node.description;
    const inputs = document.createElement('p'); inputs.className = 'stage-meta'; inputs.textContent = `INGRESSI  ${node.inputs.join(' + ')}  ·  USCITA  ${node.produces.join(' + ')}`;
    const branch = document.createElement('p'); branch.className = 'condition'; branch.textContent = node.routeConditions.join(' ');
    const src = document.createElement('p'); src.className = 'source'; src.textContent = `Fonti: ${node.sourceRefs.map(ref => `${ref.id} · ${sourceNames[ref.id]} · ${ref.locator}${ref.evidence === 'FIELD_VALIDATION_PENDING' ? ' [da validare]' : ''}`).join('; ')}. Processo generale, non ricostruzione di uno stabilimento reale.`;
    detail.replaceChildren(h,p,inputs,branch,src);
    if (node.machineId) {
      const note = document.createElement('p'); note.className = 'visit-note'; note.textContent = 'La macchina di questa fase è visitabile nell’edificio 3D.'; detail.append(note);
    }
  }
  selectStage('telaio');
}
