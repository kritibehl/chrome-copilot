import { setLatestCapture, getLatestCapture } from './core/state/sessionStore.js';
import { parseErrorInput } from './core/parsers/errorParser.js';
import { classifyParsedError } from './core/classifiers/signatureClassifier.js';
import { clusterParsedError } from './core/clustering/errorClusterer.js';
import { buildLocalAnalysis } from './core/fallback/localAnalysis.js';
import { buildIssueReport } from './core/reports/reportBuilder.js';
import { buildMarkdownExport } from './core/reports/exportIssueSummary.js';

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setOptions({ enabled: true });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message?.type) {
        case 'COPILOT_CAPTURE_DEBUG_CONTEXT': {
          await setLatestCapture(message.payload);
          sendResponse({ ok: true });
          break;
        }

        case 'COPILOT_GET_LATEST_CAPTURE': {
          const capture = await getLatestCapture();
          sendResponse({ ok: true, capture });
          break;
        }

        case 'COPILOT_PARSE_INPUT': {
          const parsed = parseErrorInput(message.payload?.text || '');
          sendResponse({ ok: true, parsed });
          break;
        }

        case 'COPILOT_ANALYZE_INPUT': {
          const text = message.payload?.text || '';

          const t0 = performance.now();
          const parsed = parseErrorInput(text);
          const t1 = performance.now();

          const classification = classifyParsedError(parsed);
          const t2 = performance.now();

          const cluster = clusterParsedError(parsed, classification);
          const t3 = performance.now();

          const localAnalysis = buildLocalAnalysis(parsed, classification, cluster);
          const t4 = performance.now();

          const metrics = {
            parseLatencyMs: Number((t1 - t0).toFixed(2)),
            classificationLatencyMs: Number((t2 - t1).toFixed(2)),
            clusteringLatencyMs: Number((t3 - t2).toFixed(2)),
            localAnalysisLatencyMs: Number((t4 - t3).toFixed(2))
          };

          const report = buildIssueReport({
            parsed,
            classification,
            cluster,
            localAnalysis,
            metrics
          });

          const markdown = buildMarkdownExport(report);

          sendResponse({
            ok: true,
            parsed,
            classification,
            cluster,
            localAnalysis,
            report,
            markdown
          });
          break;
        }

        default:
          sendResponse({ ok: false, error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
  })();

  return true;
});
