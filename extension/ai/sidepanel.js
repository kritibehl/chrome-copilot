import { explain } from '../ai/summarizer.js';
import { diagnose } from '../ai/prompt.js';
import { rewrite } from '../ai/rewriter.js';

let lastWorkflowResult = null;

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

async function getLocalOnlyMode() {
  const res = await chrome.runtime.sendMessage({
    type: 'COPILOT_GET_LOCAL_ONLY_MODE'
  });

  if (!res?.ok) throw new Error(res?.error || 'Failed to get local-only mode');
  return Boolean(res.enabled);
}

async function setLocalOnlyMode(enabled) {
  const res = await chrome.runtime.sendMessage({
    type: 'COPILOT_SET_LOCAL_ONLY_MODE',
    payload: { enabled }
  });

  if (!res?.ok) throw new Error(res?.error || 'Failed to set local-only mode');
}

async function getCacheStats() {
  const res = await chrome.runtime.sendMessage({
    type: 'COPILOT_GET_CACHE_STATS'
  });

  if (!res?.ok) throw new Error(res?.error || 'Failed to get cache stats');
  return res.stats;
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

function renderWorkflowOutput(result) {
  const out = document.getElementById('out');
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
    lastWorkflowResult = result;
    renderWorkflowOutput(result);
    await refreshCacheStatsLabel();
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
    lastWorkflowResult = workflow;
    const ai = await fn(text);

    out.textContent = JSON.stringify(
      {
        report: workflow.report,
        ai
      },
      null,
      2
    );
    await refreshCacheStatsLabel();
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
}

async function copyMarkdownExport() {
  const out = document.getElementById('out');

  if (!lastWorkflowResult?.markdown) {
    out.textContent = 'Run Analyze Workflow first to generate an export.';
    return;
  }

  try {
    await navigator.clipboard.writeText(lastWorkflowResult.markdown);
    out.textContent = 'Markdown issue summary copied to clipboard.';
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
}

function downloadMarkdownExport() {
  const out = document.getElementById('out');

  if (!lastWorkflowResult?.markdown || !lastWorkflowResult?.report?.title) {
    out.textContent = 'Run Analyze Workflow first to download an export.';
    return;
  }

  const blob = new Blob([lastWorkflowResult.markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = lastWorkflowResult.report.title.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase();

  a.href = url;
  a.download = `${safeName || 'issue-summary'}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  out.textContent = 'Markdown issue summary downloaded.';
}

async function refreshCacheStatsLabel() {
  const stats = await getCacheStats();
  const label = document.getElementById('cache-stats-label');
  if (label) {
    label.textContent = `Cache H/M: ${stats.hits}/${stats.misses}`;
  }
}

async function mountControls() {
  const explainBtn = document.getElementById('explain');
  const parent = explainBtn?.parentNode;
  if (!parent) return;

  if (!document.getElementById('workflow-analyze')) {
    const btn = document.createElement('button');
    btn.id = 'workflow-analyze';
    btn.textContent = 'Analyze Workflow';
    btn.style.marginRight = '8px';
    btn.onclick = runWorkflow;
    parent.insertBefore(btn, explainBtn);
  }

  if (!document.getElementById('workflow-export')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'workflow-export';
    exportBtn.textContent = 'Copy Report';
    exportBtn.style.marginRight = '8px';
    exportBtn.onclick = copyMarkdownExport;
    parent.insertBefore(exportBtn, explainBtn);
  }

  if (!document.getElementById('workflow-download')) {
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'workflow-download';
    downloadBtn.textContent = 'Download Report';
    downloadBtn.style.marginRight = '8px';
    downloadBtn.onclick = downloadMarkdownExport;
    parent.insertBefore(downloadBtn, explainBtn);
  }

  if (!document.getElementById('local-only-toggle')) {
    const label = document.createElement('label');
    label.id = 'local-only-toggle';
    label.style.display = 'inline-flex';
    label.style.alignItems = 'center';
    label.style.gap = '6px';
    label.style.marginRight = '10px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'local-only-checkbox';
    checkbox.checked = await getLocalOnlyMode();
    checkbox.onchange = async () => {
      try {
        await setLocalOnlyMode(checkbox.checked);
      } catch (e) {
        document.getElementById('out').textContent = `Error: ${e.message}`;
      }
    };

    const span = document.createElement('span');
    span.textContent = 'Local-only';

    label.appendChild(checkbox);
    label.appendChild(span);
    parent.insertBefore(label, explainBtn);
  }

  if (!document.getElementById('cache-stats-label')) {
    const stats = document.createElement('span');
    stats.id = 'cache-stats-label';
    stats.style.marginRight = '10px';
    parent.insertBefore(stats, explainBtn);
  }

  await refreshCacheStatsLabel();
}

document.addEventListener('DOMContentLoaded', async () => {
  await prefillFromLatestCapture();
  await mountControls();

  document.getElementById('explain').onclick = () => runAi(explain);
  document.getElementById('diagnose').onclick = () => runAi(diagnose);
  document.getElementById('rewrite').onclick = () => runAi(rewrite);
});
