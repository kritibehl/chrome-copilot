import { detectContext } from './detectors.js';

(function mount() {
  if (document.getElementById('copilot-fab')) return;
  const state = detectContext();

  const btn = document.createElement('button');
  btn.id = 'copilot-fab';
  btn.textContent = '⚡ Copilot';
  document.documentElement.appendChild(btn);

  btn.addEventListener('click', () => {
    const sel = window.getSelection()?.toString()?.trim();
    const payload = sel || collectNearestBlock('pre, code');
    window.dispatchEvent(new CustomEvent('copilot:open', { detail: { text: payload, state } }));
    // Open side panel
    chrome?.sidePanel?.open({ windowId: chrome?.windows?.WINDOW_ID_CURRENT }).catch(()=>{});
  });

  function collectNearestBlock(selector) {
    const node = document.activeElement || document.querySelector(selector) || document.body;
    return node.innerText.slice(0, 6000);
  }
})();
