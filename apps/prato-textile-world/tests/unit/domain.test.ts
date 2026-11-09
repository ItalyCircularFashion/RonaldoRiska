import { describe, it, expect } from 'vitest';
import { processGraph, canProcess, validateGraph } from '../../src/process/graph';
import { moveWithCollisions, collide, near, outsideWalls, insideWalls } from '../../src/physics/colliders';

describe('grafo documentale e rami',()=>{
  it('ha riferimenti validi e una fonte per ogni fase',()=>{expect(validateGraph(processGraph)).toEqual([]);});
  it('il telaio richiede ordito E trama, non una sequenza di visite',()=>{
    const loom=processGraph.find(p=>p.id==='telaio')!;
    expect(canProcess(loom,new Set(['ordito pronto']))).toBe(false);
    expect(canProcess(loom,new Set(['trama pronta']))).toBe(false);
    expect(canProcess(loom,new Set(['trama pronta','ordito pronto']))).toBe(true);
  });
  it('lato cardato e pettinato sono opzioni, non fasi concatenate',()=>{
    const a=processGraph.find(p=>p.id==='fibra')!;
    expect(a.nextIds).toContain('cardato');expect(a.nextIds).toContain('pettinato');
    expect(processGraph.find(p=>p.id==='cardato')!.nextIds).not.toContain('pettinato');
  });
  it('rileva riferimenti inesistenti',()=>{
    expect(validateGraph([{...processGraph[0],nextIds:['non-esiste']}])).toContain('Arco inesistente: fibra/non-esiste');
  });
});

describe('collisioni avatar',()=>{
  it('blocca il corpo su una parete e scivola sull’altro asse',()=>{
    const wall=[{xMin:2,xMax:3,zMin:0,zMax:3}];
    const end=moveWithCollisions({x:0,z:1},4,1,wall);
    expect(end.x).toBeLessThan(2);
    expect(end.z).toBeGreaterThan(1);
  });
  it('non attraversa una parete in un singolo frame lungo',()=>{
    expect(moveWithCollisions({x:0,z:1},8,0,[{xMin:2,xMax:3,zMin:0,zMax:3}]).x).toBeLessThan(2);
  });
  it('il portone rimane aperto, i muri e la macchina sono solidi',()=>{
    expect(collide({x:0,z:-15},outsideWalls)).toBe(false);
    expect(collide({x:4,z:-15},outsideWalls)).toBe(true);
    expect(collide({x:58,z:-1.5},insideWalls)).toBe(true);
  });
  it('un tasto E fuori dal raggio non interagisce',()=>{
    expect(near({x:0,z:8},{x:0,z:-13.4},2.7)).toBe(false);
    expect(near({x:0,z:-12},{x:0,z:-13.4},2.7)).toBe(true);
  });
});
