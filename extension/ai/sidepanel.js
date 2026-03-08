import { explain } from '../ai/summarizer.js';
import { diagnose } from '../ai/prompt.js';
import { rewrite } from '../ai/rewriter.js';

async function prefillFromLatestCapture() {
  const ta = document.getElementById('input');

  try {
    const res = await chrome.runtime.sendMessage({
      type: 'COPILOT_GET_LATEST_CAPTURE'
    });

    if (!res?.ok || !res.capture) return;

    const { text, page, state, capturedAt } = res.capture;

    const header = [
      page?.title ? `Page: ${page.title}` : null,
      page?.url ? `URL: ${page.url}` : null,
      capturedAt ? `Captured At: ${capturedAt}` : null,
      state ? `Context: ${JSON.stringify(state)}` : null,
      '',
      text || ''
    ]
      .filter(Boolean)
      .join('\n');

    if (!ta.value || ta.value.trim().length < (text || '').length) {
      ta.value = header;
    }
  } catch (err) {
    console.error('Failed to prefill from latest capture:', err);
  }
}

async function run(fn) {
  const ta = document.getElementById('input');
  const out = document.getElementById('out');
  const text = ta.value.trim();

  if (!text) {
    out.textContent = 'Select some code/logs or paste into the box.';
    return;
  }

  out.textContent = '…thinking (on-device)';

  try {
    const res = await fn(text);
    out.textContent =
      typeof res === 'string' ? res : JSON.stringify(res, null, 2);
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await prefillFromLatestCapture();

  document.getElementById('explain').onclick = () => run(explain);
  document.getElementById('diagnose').onclick = () => run(diagnose);
  document.getElementById('rewrite').onclick = () => run(rewrite);
});
