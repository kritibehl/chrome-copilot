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

async function analyzeInput(text) {
  const res = await chrome.runtime.sendMessage({
    type: 'COPILOT_ANALYZE_INPUT',
    payload: { text }
  });

  if (!res?.ok) {
    throw new Error(res?.error || 'Failed to analyze input');
  }

  return res;
}

async function runWorkflow() {
  const ta = document.getElementById('input');
  const out = document.getElementById('out');
  const text = ta.value.trim();

  if (!text) {
    out.textContent = 'Select some code/logs or paste into the box.';
    return;
  }

  out.textContent = '…analyzing workflow';

  try {
    const result = await analyzeInput(text);
    out.textContent = JSON.stringify(
      {
        report: result.report,
        localAnalysis: result.localAnalysis,
        classification: result.classification,
        cluster: result.cluster,
        metrics: result.report?.metrics || {}
      },
      null,
      2
    );
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
}

async function runAi(fn) {
  const ta = document.getElementById('input');
  const out = document.getElementById('out');
  const text = ta.value.trim();

  if (!text) {
    out.textContent = 'Select some code/logs or paste into the box.';
    return;
  }

  out.textContent = '…thinking (on-device)';

  try {
    const workflow = await analyzeInput(text);
    const ai = await fn(text);

    out.textContent = JSON.stringify(
      {
        report: workflow.report,
        ai
      },
      null,
      2
    );
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await prefillFromLatestCapture();

  document.getElementById('explain').onclick = () => runAi(explain);
  document.getElementById('diagnose').onclick = () => runAi(diagnose);
  document.getElementById('rewrite').onclick = () => runAi(rewrite);

  const input = document.getElementById('input');
  if (input && !document.getElementById('workflow-analyze')) {
    const btn = document.createElement('button');
    btn.id = 'workflow-analyze';
    btn.textContent = 'Analyze Workflow';
    btn.style.marginRight = '8px';

    const explainBtn = document.getElementById('explain');
    explainBtn?.parentNode?.insertBefore(btn, explainBtn);

    btn.onclick = runWorkflow;
  }
});
