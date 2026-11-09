import './style.css';
import { initEducation } from './ui/education';

initEducation(); // HTML learning path remains usable if the 3D engine fails.
const failure = document.getElementById('startup-fallback')!;
const errorText = document.getElementById('startup-error')!;
const hint = document.getElementById('action-hint')!;

function fail(message: string) {
  failure.hidden = false;
  errorText.textContent = message;
  hint.textContent = 'Percorso testuale disponibile nella colonna laterale.';
}

async function boot() {
  failure.hidden = true;
  try {
    const canvas = document.getElementById('world') as HTMLCanvasElement;
    if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) throw new Error('WebGL non disponibile');
    const { startWorld } = await import('./world/runtime');
    await startWorld(canvas);
  } catch (error) {
    console.error('Avvio 3D fallito:', error);
    fail('WebGL, un modulo o una risorsa 3D non è disponibile. Le schede didattiche restano accessibili.');
  }
}

document.getElementById('retry')!.addEventListener('click', () => location.reload());
void boot();
