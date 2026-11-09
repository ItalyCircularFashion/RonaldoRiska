import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const movingNames=['HeddleFront','HeddleRear','Reed','Shuttle','FabricRoll','WarpBeam','Cloth'] as const;
type Name = typeof movingNames[number];
export class Loom {
  group=new THREE.Group();
  loaded=false; running=false; time=0; phase='In pausa';
  private objects=new Map<Name,THREE.Object3D>();
  private initial=new Map<Name,{x:number,y:number,z:number,rx:number,rz:number}>();
  async load(url:string):Promise<void> {
    const gltf=await new GLTFLoader().loadAsync(url);
    this.group.add(gltf.scene);
    for (const name of movingNames) {
      const obj=gltf.scene.getObjectByName(name);
      if (!obj) throw new Error(`GLB incompleto: manca ${name}`);
      this.objects.set(name,obj);
      this.initial.set(name,{x:obj.position.x,y:obj.position.y,z:obj.position.z,rx:obj.rotation.x,rz:obj.rotation.z});
    }
    this.loaded=true;
  }
  toggle() { if(!this.loaded) return; this.running=!this.running; if(!this.running) this.phase='In pausa'; }
  update(dt:number):string {
    if (!this.loaded || !this.running) return this.phase;
    this.time+=Math.min(dt,.05);const t=(this.time/4)%1;
    this.phase=t<.25?'01 · Licci: apertura del passo':t<.5?'02 · Navetta: inserzione della trama':t<.75?'03 · Pettine: battuta': '04 · Avanzamento della pezza';
    const set=(name:Name,changes:{x?:number;y?:number;z?:number;rx?:number;rz?:number})=>{
      const obj=this.objects.get(name)!,base=this.initial.get(name)!;
      obj.position.set(base.x+(changes.x||0),base.y+(changes.y||0),base.z+(changes.z||0));
      obj.rotation.x=base.rx+(changes.rx||0);obj.rotation.z=base.rz+(changes.rz||0);
    };
    const lift=t<.25?Math.sin(t*4*Math.PI)*.18: t<.75?.18:Math.cos((t-.75)*2*Math.PI)*.18;
    set('HeddleFront',{y:lift});set('HeddleRear',{y:-lift});
    set('Shuttle',{x:t>=.25&&t<.5?(t-.25)*4*2.5-1.25:t<.25?-1.25:1.25});
    set('Reed',{z:t>=.5&&t<.75?Math.sin((t-.5)*4*Math.PI)*.4:0});
    set('FabricRoll',{rx:t>=.75?(t-.75)*4*.24:0});
    set('WarpBeam',{rx:t>=.75?-(t-.75)*4*.10:0});
    set('Cloth',{z:t>=.75?Math.min((t-.75)*4*.28,.28):0});
    return this.phase;
  }
}
