// app-v2.js - Navigazione sidebar per tema v2
// Tecnico Tessile Pratese

document.addEventListener('DOMContentLoaded', () => {
    // Nav principale (sidebar)
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
            btn.classList.add('active');
            const mod = btn.dataset.module;
            if (mod) {
                const el = document.getElementById('mod-' + mod);
                if (el) el.classList.add('active');
            }
        });
    });

    // Sub-tabs
    document.querySelectorAll('.sub-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.module');
            parent.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
            parent.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const sub = btn.dataset.sub;
            if (sub) {
                const el = document.getElementById('sub-' + sub);
                if (el) el.classList.add('active');
            }
        });
    });

    // Composizione - righe iniziali
    const compOrdBody = document.querySelector('#comp-ordito tbody');
    const compTramaBody = document.querySelector('#comp-trama tbody');
    if (compOrdBody && compTramaBody) {
        for (let i = 0; i < 4; i++) {
            compOrdBody.insertAdjacentHTML('beforeend', `<tr><td>${i+1}</td><td><input type="text" placeholder="Cotone"></td><td><input type="text" placeholder="Nm 20"></td><td><input type="text"></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>`);
            compTramaBody.insertAdjacentHTML('beforeend', `<tr><td>${i+1}</td><td><input type="text" placeholder="Cotone"></td><td><input type="text" placeholder="Nm 20"></td><td><input type="text"></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>`);
        }
    }
});
