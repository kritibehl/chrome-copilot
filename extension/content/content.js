import { detectContext } from './detectors.js';

(function mount() {
  if (document.getElementById('copilot-fab')) return;

  const btn = document.createElement('button');
  btn.id = 'copilot-fab';
  btn.textContent = '⚡ Copilot';
  document.documentElement.appendChild(btn);

  btn.addEventListener('click', async () => {
    const state = detectContext();
    const sel = window.getSelection()?.toString()?.trim();
    const payload = sel || collectNearestBlock('pre, code');

    const capture = {
      text: payload,
      state,
      page: {
        title: document.title,
        url: location.href
      },
      capturedAt: new Date().toISOString()
    };

    try {
      await chrome.runtime.sendMessage({
        type: 'COPILOT_CAPTURE_DEBUG_CONTEXT',
        payload: capture
      });
    } catch (err) {
      console.error('Failed to send capture to background:', err);
    }

    try {
      await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    } catch (_) {
      // no-op
    }
  });

  function collectNearestBlock(selector) {
    const node =
      document.activeElement ||
      document.querySelector(selector) ||
      document.body;

    return (node?.innerText || document.body.innerText || '').slice(0, 6000);
  }
})();
