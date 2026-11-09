import * as THREE from 'three';

const materials = {
  stone:new THREE.MeshStandardMaterial({color:0x535c5c,roughness:0.9,flatShading:true}),
  charcoal:new THREE.MeshStandardMaterial({color:0x1b282f,roughness:0.94,flatShading:true}),
  road:new THREE.MeshStandardMaterial({color:0x48524e,roughness:1}),
  line:new THREE.MeshBasicMaterial({color:0xe9c68f}),
  clay:new THREE.MeshStandardMaterial({color:0xb77764,roughness:0.9,flatShading:true}),
  sand:new THREE.MeshStandardMaterial({color:0xc5b79a,roughness:0.96,flatShading:true}),
  mint:new THREE.MeshStandardMaterial({color:0x52796f,roughness:0.8,flatShading:true}),
  glass:new THREE.MeshStandardMaterial({color:0x273e49,metalness:0.25,roughness:0.28}),
  copper:new THREE.MeshStandardMaterial({color:0xdb9b64,metalness:0.35,roughness:0.55}),
  foliage:new THREE.MeshStandardMaterial({color:0x42675a,roughness:1,flatShading:true}),
};
function box(parent:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material, cast=true) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function text(parent:THREE.Object3D,label:string,x:number,y:number,z:number,rot=0) {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#172d2d';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#d5b98b';ctx.lineWidth=6;ctx.strokeRect(4,4,504,120);
  ctx.fillStyle='#f5eddb';ctx.font='bold 36px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,64);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1.05),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));sign.position.set(x,y,z);sign.rotation.y=rot;parent.add(sign);
}
function tree(parent:THREE.Object3D,x:number,z:number,s=1) {
  box(parent,x,1.2*s,z,.27*s,2.4*s,.27*s,materials.clay);
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2*s,0),materials.foliage);crown.position.set(x,3.1*s,z);crown.castShadow=true;parent.add(crown);
}
function factory(parent:THREE.Object3D,cx:number,cz:number,w:number,d:number,color:THREE.Material, entrance=false) {
  const h=5;
  box(parent,cx,2.6,cz-d/2,w,h,.32,color);
  box(parent,cx-w/2,2.6,cz,.32,h,d,color);
  box(parent,cx+w/2,2.6,cz,.32,h,d,color);
  if (entrance) {
    box(parent,cx-(w/2+1.5)/2,2.6,cz+d/2,w/2-1.5,h,.32,color);
    box(parent,cx+(w/2+1.5)/2,2.6,cz+d/2,w/2-1.5,h,.32,color);
    box(parent,cx,4.65,cz+d/2,3,1,.38,materials.copper);
  } else box(parent,cx,2.6,cz+d/2,w,h,.32,color);
  box(parent,cx,5.3,cz,w+.65,.7,d+.65,materials.charcoal);
  for (let i=-w/2+1.5;i<w/2-1;i+=2.4) {
    box(parent,cx+i,3.5,cz+d/2+.2,1.25,1.1,.08,materials.glass,false);
    box(parent,cx+i,1.7,cz-d/2-.2,1.25,1.1,.08,materials.glass,false);
  }
  box(parent,cx-w/2+1,6.7,cz-1,.65,2.4,.65,materials.clay);
}
export function buildDistrict(scene:THREE.Scene): THREE.Group {
  const g=new THREE.Group();scene.add(g);
  box(g,0,-.23,0,90,.4,96,materials.stone,false);
  box(g,0,.014,3,10,.045,70,materials.road,false);
  box(g,0,.016,14,69,.05,6,materials.road,false);
  for (let i=-32;i<32;i+=4.5) box(g,0,.054,i,.12,.009,2,materials.line,false);
  for (let i=-31;i<32;i+=4.5) box(g,i,.053,14,2,.009,.12,materials.line,false);
  box(g,0,.01,-13.3,10,.08,3,materials.sand,false);
  factory(g,0,-22,16,14,materials.clay,true);
  factory(g,-20.5,-24,11,12,materials.sand);
  factory(g,20,-25.5,12,13,materials.mint);
  factory(g,-23.5,0,13,10,materials.mint);
  factory(g,22.5,-1.5,13,9,materials.sand);
  text(g,'TESSITURA  /  01',0,3.65,-14.75);
  text(g,'DISTRETTO TESSILE',0,3.2,19.7);
  box(g,0,1.3,19.6,4.5,2.8,.3,materials.clay);
  for (const [x,z,s] of [[-13,8,1],[-13,21,.9],[13,6,1.1],[13,22,.85],[-31,15,.75],[31,12,1],[-11,-11,.7],[11,-12,.75]] as const) tree(g,x,z,s);
  for (const x of [-5.5,5.5]) for(const z of [-10,-2,6,24]) { box(g,x,1.6,z,.12,3.2,.12,materials.charcoal); const bulb=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),new THREE.MeshBasicMaterial({color:0xffd6a2}));bulb.position.set(x,3.2,z);g.add(bulb); }
  return g;
}
export function buildInterior(scene:THREE.Scene):THREE.Group {
  const g=new THREE.Group();scene.add(g);
  box(g,58,-.09,0,16,.16,16,materials.sand,false);
  for (const x of [50,66]) box(g,x,1.7,0,.25,3.4,16,materials.clay);
  box(g,58,1.7,-8,16,3.4,.25,materials.clay);
  for (const x of [53.1,62.9]) box(g,x,1.7,8,6.2,3.4,.25,materials.clay);
  box(g,58,3.1,8,3.6,.5,.25,materials.copper);
  box(g,51.8,.75,-3.5,1.6,1.5,2.7,materials.charcoal);
  box(g,58,-.045,-2,5,.03,5,materials.charcoal,false);
  for (const x of [51.5,64.5]) for (const z of [-6,0,6]) {
    box(g,x,3.5,z,.12,3,.12,materials.charcoal);
    const light=new THREE.PointLight(0xffd9a8,3.4,10);light.position.set(x,3.2,z);g.add(light);
  }
  text(g,'TELAIO A LICCI  /  01',58,3.1,-7.83);
  return g;
}
export function makeAvatar(scene:THREE.Scene):{ group:THREE.Group; animate:(t:number, moving:boolean)=>void } {
  const group=new THREE.Group();scene.add(group);
  const cream=new THREE.MeshStandardMaterial({color:0xf1dcc0,flatShading:true});
  const coat=new THREE.MeshStandardMaterial({color:0x224d4b,flatShading:true});
  const pants=new THREE.MeshStandardMaterial({color:0x303a45,flatShading:true});
  const hair=new THREE.MeshStandardMaterial({color:0x252d32,flatShading:true});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.36,.48,1.03,6),coat);body.position.y=1.25;body.castShadow=true;group.add(body);
  const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),cream);head.position.y=2.05;group.add(head);
  box(group,0,2.31,-.02,.59,.16,.53,hair);
  const left=box(group,-.18,.43,0,.22,.82,.25,pants),right=box(group,.18,.43,0,.22,.82,.25,pants);
  box(group,-.49,1.23,0,.19,.82,.21,coat);box(group,.49,1.23,0,.19,.82,.21,coat);
  return {group,animate:(t,moving)=>{ const bob=moving?Math.sin(t*11)*.045:0;body.position.y=1.25+bob;head.position.y=2.05+bob;left.rotation.x=moving?Math.sin(t*10)*.42:0;right.rotation.x=-left.rotation.x; }};
}
