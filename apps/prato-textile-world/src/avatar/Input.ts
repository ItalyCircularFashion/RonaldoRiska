export type Move = 'forward' | 'backward' | 'left' | 'right';
const keymap: Record<string,Move> = { w:'forward', ArrowUp:'forward', s:'backward', ArrowDown:'backward', a:'left', ArrowLeft:'left', d:'right', ArrowRight:'right' };
export class Input {
  pressed = new Set<Move>();
  yaw = 0; pitch = 0.26; zoom = 8.3;
  private pointer: number | null = null;
  private px = 0; private py = 0;
  private touch = new Map<Move,number>();
  private cleanup: Array<() => void> = [];
  constructor(canvas: HTMLCanvasElement, private canMove: () => boolean, private interact: () => void, private escape: () => void) {
    const listen = <K extends keyof WindowEventMap>(target: Window, event: K, fn: (e: WindowEventMap[K]) => void) => {
      target.addEventListener(event, fn as EventListener); this.cleanup.push(() => target.removeEventListener(event, fn as EventListener));
    };
    listen(window,'keydown',e => {
      if (e.key === 'Escape') { this.escape(); return; }
      if (e.target instanceof HTMLElement && (e.target.closest('input,textarea,select,button,[contenteditable="true"],[role="dialog"]'))) return;
      if (!this.canMove()) return;
      if (e.key.toLowerCase() === 'e') { e.preventDefault(); this.interact(); return; }
      const move = keymap[e.key.toLowerCase()] || keymap[e.key];
      if (move) { e.preventDefault(); this.pressed.add(move); }
    });
    listen(window,'keyup',e => { const move = keymap[e.key.toLowerCase()] || keymap[e.key]; if (move) this.pressed.delete(move); });
    listen(window,'blur',() => this.pressed.clear());
    canvas.addEventListener('pointerdown', e => { this.pointer=e.pointerId; this.px=e.clientX; this.py=e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (e.pointerId !== this.pointer) return; this.yaw -= (e.clientX-this.px)*0.006; this.pitch=Math.max(-0.15,Math.min(0.85,this.pitch+(e.clientY-this.py)*0.003)); this.px=e.clientX;this.py=e.clientY; });
    canvas.addEventListener('pointerup', () => { this.pointer=null; });
    canvas.addEventListener('pointercancel', () => { this.pointer=null; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); this.zoom=Math.max(4.5,Math.min(14,this.zoom+e.deltaY*0.007)); }, { passive:false });
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-move]')) {
      const direction = button.dataset.move as Move;
      const down = (e: PointerEvent) => { e.preventDefault(); if (!this.canMove()) return; this.touch.set(direction,e.pointerId); this.pressed.add(direction); button.setPointerCapture(e.pointerId); };
      const up = (e: PointerEvent) => { if(this.touch.get(direction) !== e.pointerId) return; this.touch.delete(direction); this.pressed.delete(direction); };
      button.addEventListener('pointerdown',down); button.addEventListener('pointerup',up); button.addEventListener('pointercancel',up); button.addEventListener('lostpointercapture',up);
      this.cleanup.push(() => { button.removeEventListener('pointerdown',down);button.removeEventListener('pointerup',up);button.removeEventListener('pointercancel',up);button.removeEventListener('lostpointercapture',up); });
    }
  }
  vector(): { dx:number; dz:number } {
    if (!this.canMove()) return {dx:0,dz:0};
    const f = Number(this.pressed.has('forward'))-Number(this.pressed.has('backward'));
    const r = Number(this.pressed.has('right'))-Number(this.pressed.has('left'));
    const n = Math.hypot(f,r) || 1;
    return { dx: (Math.sin(this.yaw)*f+Math.cos(this.yaw)*r)/n, dz: (-Math.cos(this.yaw)*f+Math.sin(this.yaw)*r)/n };
  }
  dispose() { this.cleanup.forEach(f=>f()); }
}
