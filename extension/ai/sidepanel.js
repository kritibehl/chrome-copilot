import { explain } from '../ai/summarizer.js';
import { diagnose } from '../ai/prompt.js';
import { rewrite } from '../ai/rewriter.js';

window.addEventListener('copilot:open', (e) => {
  const v = e.detail?.text || '';
  const ta = document.getElementById('input');
  if (v && (!ta.value || ta.value.length < v.length)) ta.value = v;
});

async function run(fn) {
  const ta = document.getElementById('input');
  const out = document.getElementById('out');
  const text = ta.value.trim();
  if (!text) { out.textContent = 'Select some code/logs or paste into the box.'; return; }
  out.textContent = '…thinking (on-device)';
  try {
    const res = await fn(text);
    out.textContent = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
  } catch (e) { out.textContent = `Error: ${e.message}`; }
}

document.getElementById('explain').onclick = () => run(explain);
document.getElementById('diagnose').onclick = () => run(diagnose);
document.getElementById('rewrite').onclick  = () => run(rewrite);
