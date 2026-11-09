import { test, expect, type Page } from '@playwright/test';

async function walkUntil(page:Page, direction:'w'|'s', text:RegExp) {
  await page.keyboard.down(direction);
  try { await expect(page.locator('#action-hint')).toContainText(text,{timeout:16000}); }
  finally { await page.keyboard.up(direction); }
}

async function touchHold(page:Page, selector:string, until:RegExp) {
  const b=(await page.locator(selector).boundingBox())!;
  const client=await page.context().newCDPSession(page);
  const x=b.x+b.width/2,y=b.y+b.height/2;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
  try { await expect(page.locator('#action-hint')).toContainText(until,{timeout:16000}); }
  finally { await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await client.detach(); }
}

test('distretto → avatar → fabbrica → telaio → uscita',async({page},testInfo)=>{
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  const canvas=page.locator('#world');
  await expect(canvas).toHaveAttribute('data-rendered','true',{timeout:15000});
  await expect(canvas).toHaveAttribute('data-model','loaded',{timeout:15000});
  const initial=await canvas.getAttribute('data-position');
  expect(initial).toBeTruthy();
  if(testInfo.project.name==='mobile') {
    await expect(page.locator('.controls-touch')).toBeVisible();
    await touchHold(page,'[data-move="forward"]',/Entra nella fabbrica/);
  } else await walkUntil(page,'w',/Entra nella fabbrica/);
  expect(await canvas.getAttribute('data-position')).not.toBe(initial);
  await page.locator('#interact').click();
  await expect(canvas).toHaveAttribute('data-zone','inside');
  if(testInfo.project.name==='mobile') await touchHold(page,'[data-move="forward"]',/Esamina il telaio/);
  else await walkUntil(page,'w',/Esamina il telaio/);
  await page.locator('#interact').click();
  await expect(page.locator('#machine-panel')).toBeVisible();
  await expect(page.locator('#machine-toggle')).toBeEnabled();
  await page.locator('#machine-toggle').click();
  await expect(page.locator('#machine-toggle')).toHaveText('Metti in pausa');
  await expect(canvas).toHaveAttribute('data-loom-phase',/02 · Navetta|03 · Pettine|04 · Avanzamento/,{timeout:8000});
  await page.locator('#machine-toggle').click();
  await expect(page.locator('#machine-toggle')).toHaveText('Avvia telaio');
  await page.locator('#close-panel').click();
  if(testInfo.project.name==='mobile') await touchHold(page,'[data-move="backward"]',/Esci dalla fabbrica/);
  else await walkUntil(page,'s',/Esci dalla fabbrica/);
  await page.locator('#interact').click();
  await expect(canvas).toHaveAttribute('data-zone','outside');
  const fps=Number(await page.locator('#fps').textContent());
  expect(fps).toBeGreaterThan(0);
  console.log(`${testInfo.project.name} measured FPS (headless): ${fps}`);
  expect(errors).toEqual([]);
  if(testInfo.project.name==='mobile') {
    const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.view+1);
  }
  await page.screenshot({path:testInfo.outputPath('world.png')});
});

test('fasi e fallback quando manca il GLB',async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile','Un solo controllo di failure injection per la build');
  await page.route('**/models/loom.glb',route=>route.abort('failed'));
  await page.goto('/');
  await expect(page.locator('#world')).toHaveAttribute('data-rendered','true');
  await expect(page.locator('#world')).toHaveAttribute('data-model','error');
  await page.locator('[data-stage="orditura"]').click();
  await expect(page.locator('#stage-detail')).toContainText('Preparazione dell’ordito');
  await expect(page.locator('#stage-detail')).toContainText('p. 5');
});

test('fallback della scena se il dispositivo non offre WebGL',async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile','Un solo controllo WebGL per la build');
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this: HTMLCanvasElement,type,...args){
      if(type==='webgl'||type==='webgl2')return null;
      return (original as any).call(this,type,...args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('#startup-fallback')).toBeVisible();
  await page.locator('[data-stage="trama"]').click();
  await expect(page.locator('#stage-detail')).toContainText('ramo parallelo');
});

test('nessuna guida digitando in un input, e movimento ridotto non blocca avatar',async({page},testInfo)=>{
  test.skip(testInfo.project.name==='mobile','Test con tastiera desktop');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const canvas=page.locator('#world');
  await expect(canvas).toHaveAttribute('data-rendered','true');
  await page.evaluate(()=>{const i=document.createElement('input');i.id='editing';document.body.append(i);i.focus();});
  const pos=await canvas.getAttribute('data-position');
  await page.keyboard.type('wwwww');await page.waitForTimeout(200);
  expect(await canvas.getAttribute('data-position')).toBe(pos);
  await page.locator('#editing').blur();
  await page.keyboard.down('w');await page.waitForTimeout(600);await page.keyboard.up('w');
  expect(await canvas.getAttribute('data-position')).not.toBe(pos);
});
