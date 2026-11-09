import * as THREE from 'three';
import { Input } from '../avatar/Input';
import { moveWithCollisions, near, outsideWalls, insideWalls } from '../physics/colliders';
import { buildDistrict, buildInterior, makeAvatar } from './geometry';
import { Loom } from '../machinery/Loom';

export async function startWorld(canvas:HTMLCanvasElement):Promise<void> {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(pointer: coarse)').matches;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.35:1.8));
  renderer.setClearColor(0xd7d5c8);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xb9cbc6);scene.fog=new THREE.Fog(0xb9cbc6,38,100);
  scene.add(new THREE.HemisphereLight(0xe7f2ea,0x43555d,2.4));
  const sun=new THREE.DirectionalLight(0xffead2,2.4);sun.position.set(-18,34,23);sun.castShadow=!mobile;sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-36;sun.shadow.camera.right=36;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;sun.shadow.bias=-.0003;scene.add(sun);
  const world=buildDistrict(scene),interior=buildInterior(scene);interior.visible=false;
  const {group:avatar,animate:animateAvatar}=makeAvatar(scene);avatar.position.set(0,0,8);
  const loom=new Loom();loom.group.position.set(58,0,-2);scene.add(loom.group);loom.group.visible=false;
  const camera=new THREE.PerspectiveCamera(57,1,.08,130);
  const zoneName=document.getElementById('zone-name')!,hint=document.getElementById('action-hint')!;
  const interactButton=document.getElementById('interact') as HTMLButtonElement;
  const panel=document.getElementById('machine-panel')!,toggle=document.getElementById('machine-toggle') as HTMLButtonElement;
  const phaseLabel=document.getElementById('phase-label')!,fps=document.getElementById('fps')!;
  const guide=document.getElementById('guide') as HTMLDialogElement;
  let zone:'outside'|'inside'='outside',lastAction='',lastHint='',lastPhase='',frame=0,seconds=0,frames=0,active=true;
  let lastPanelFocus:HTMLElement=canvas;
  function currentAction(): 'enter'|'exit'|'loom'|null {
    const pos={x:avatar.position.x,z:avatar.position.z};
    if(zone==='outside'&&near(pos,{x:0,z:-13.4},2.7))return'enter';
    if(zone==='inside'&&near(pos,{x:58,z:6.5},2.65))return'exit';
    if(zone==='inside'&&near(pos,{x:58,z:-2},4.2))return'loom';
    return null;
  }
  function setZone(next:'outside'|'inside') {
    zone=next;const isInside=next==='inside';world.visible=!isInside;interior.visible=isInside;loom.group.visible=isInside;
    avatar.position.set(isInside?58:0,0,isInside?5.3:-11.4);
    canvas.dataset.zone=zone;zoneName.textContent=isInside?'FABBRICA / TESSITURA':'DISTRETTO / PRATO';
    input.pressed.clear();
  }
  function closePanel(){ if(panel.hidden) return;panel.hidden=true;lastPanelFocus.focus(); }
  function escape(){ if(guide.open){guide.close();return;}closePanel(); }
  function interact() {
    if(!panel.hidden || guide.open)return;
    const action=currentAction();
    if(action==='enter')setZone('inside');
    if(action==='exit')setZone('outside');
    if(action==='loom'){
      lastPanelFocus=document.activeElement instanceof HTMLElement?document.activeElement:canvas;
      panel.hidden=false;document.getElementById('close-panel')!.focus();
      if(!loom.loaded)phaseLabel.textContent='Modello non disponibile: il percorso didattico resta leggibile.';
      else phaseLabel.textContent=loom.running?loom.phase:'Macchina in pausa. Avvia il ciclo dimostrativo.';
    }
  }
  const input=new Input(canvas,()=>panel.hidden&&!guide.open,interact,escape);
  interactButton.addEventListener('click',interact);
  document.getElementById('close-panel')!.addEventListener('click',closePanel);
  toggle.addEventListener('click',()=>{loom.toggle();toggle.textContent=loom.running?'Metti in pausa':'Avvia telaio';phaseLabel.textContent=loom.phase;});
  document.getElementById('guide-button')!.addEventListener('click',()=>guide.showModal());
  document.getElementById('guide-close')!.addEventListener('click',()=>guide.close());
  const resize=()=>{
    const width=canvas.clientWidth,height=canvas.clientHeight;
    if(width&&height){ renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix(); }
  };
  new ResizeObserver(resize).observe(canvas);resize();
  const modelUrl=`${import.meta.env.BASE_URL}models/loom.glb`;
  void loom.load(modelUrl).then(()=>{
    canvas.dataset.model='loaded';toggle.disabled=false;
  }).catch(error=>{
    console.error('Modello GLB non disponibile:',error);canvas.dataset.model='error';toggle.disabled=true;
    if(!panel.hidden)phaseLabel.textContent='Modello non disponibile: il percorso didattico resta leggibile.';
  });
  const clock=new THREE.Clock();let previous=performance.now();
  function tick() {
    if(!active)return;
    requestAnimationFrame(tick);
    const dt=Math.min(clock.getDelta(),.05),velocity=input.vector();
    if(velocity.dx||velocity.dz){
      const speed=4.3,position=moveWithCollisions({x:avatar.position.x,z:avatar.position.z},velocity.dx*speed*dt,velocity.dz*speed*dt,zone==='outside'?outsideWalls:insideWalls);
      avatar.position.set(position.x,0,position.z);
      avatar.rotation.y=Math.atan2(-velocity.dx,-velocity.dz);
    }
    animateAvatar(clock.elapsedTime,Boolean(velocity.dx||velocity.dz));
    const action=currentAction();
    const actionText=action==='enter'?'Entra nella fabbrica':action==='exit'?'Esci dalla fabbrica':action==='loom'?'Esamina il telaio':null;
    if(action!==lastAction){interactButton.hidden=!actionText;if(actionText)interactButton.firstChild!.textContent=`${actionText} `;lastAction=action||'';}
    const message=actionText?`${actionText} · premi E o tocca il pulsante`:zone==='outside'?'Segui la strada verso la fabbrica TESSITURA / 01.':'Avvicinati al telaio, oppure torna al portone.';
    if(message!==lastHint){hint.textContent=message;lastHint=message;}
    const phase=loom.update(dt);if(phase!==lastPhase){phaseLabel.textContent=phase;lastPhase=phase;}
    const desired=new THREE.Vector3(avatar.position.x-Math.sin(input.yaw)*input.zoom,avatar.position.y+2.1+Math.sin(input.pitch)*input.zoom*.8,avatar.position.z+Math.cos(input.yaw)*input.zoom);
    camera.position.lerp(desired,reduced?1:Math.min(1,dt*7));
    camera.lookAt(avatar.position.x,1.25,avatar.position.z);
    renderer.render(scene,camera);
    frame++;if(frame%5===0){canvas.dataset.position=`${avatar.position.x.toFixed(2)},${avatar.position.z.toFixed(2)}`;canvas.dataset.loomPhase=loom.phase;}
    const now=performance.now();seconds+=now-previous;previous=now;frames++;
    if(seconds>=1000){fps.textContent=String(Math.round(frames*1000/seconds));seconds=0;frames=0;}
    if(frame===1)canvas.dataset.rendered='true';
  }
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;input.dispose();document.getElementById('startup-fallback')!.hidden=false;document.getElementById('startup-error')!.textContent='Contesto grafico perso. Le schede restano accessibili; ricarica per riprovare.';});
  tick();
}
