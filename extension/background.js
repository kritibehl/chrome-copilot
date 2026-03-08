import { setLatestCapture, getLatestCapture } from './core/state/sessionStore.js';
import { parseErrorInput } from './core/parsers/errorParser.js';
import { classifyParsedError } from './core/classifiers/signatureClassifier.js';
import { clusterParsedError } from './core/clustering/errorClusterer.js';
import { buildLocalAnalysis } from './core/fallback/localAnalysis.js';
import { buildIssueReport } from './core/reports/reportBuilder.js';
import { buildMarkdownExport } from './core/reports/exportIssueSummary.js';
import { getCachedAnalysis, setCachedAnalysis } from './core/cache/signatureCache.js';
import { getLocalOnlyMode, setLocalOnlyMode } from './core/settings/modeStore.js';
import { recordCacheHit, recordCacheMiss, getCacheStats } from './core/cache/cacheStats.js';

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

        case 'COPILOT_GET_LOCAL_ONLY_MODE': {
          const enabled = await getLocalOnlyMode();
          sendResponse({ ok: true, enabled });
          break;
        }

        case 'COPILOT_SET_LOCAL_ONLY_MODE': {
          await setLocalOnlyMode(Boolean(message.payload?.enabled));
          sendResponse({ ok: true });
          break;
        }

        case 'COPILOT_GET_CACHE_STATS': {
          const stats = await getCacheStats();
          sendResponse({ ok: true, stats });
          break;
        }

        case 'COPILOT_ANALYZE_INPUT': {
          const text = message.payload?.text || '';
          const localOnlyMode = await getLocalOnlyMode();

          const t0 = performance.now();
          const parsed = parseErrorInput(text);
          const t1 = performance.now();

          const classification = classifyParsedError(parsed);
          const t2 = performance.now();

          const cluster = clusterParsedError(parsed, classification);
          const t3 = performance.now();

          const cached = await getCachedAnalysis(cluster.normalizedSignature);
          const t4 = performance.now();

          if (cached) {
            const stats = await recordCacheHit();

            sendResponse({
              ok: true,
              parsed,
              classification,
              cluster,
              localAnalysis: cached.localAnalysis,
              report: {
                ...cached.report,
                metrics: {
                  ...cached.report.metrics,
                  parseLatencyMs: Number((t1 - t0).toFixed(2)),
                  classificationLatencyMs: Number((t2 - t1).toFixed(2)),
                  clusteringLatencyMs: Number((t3 - t2).toFixed(2)),
                  cacheLookupLatencyMs: Number((t4 - t3).toFixed(2)),
                  cacheStatus: 'hit',
                  localOnlyMode,
                  cacheHits: stats.hits,
                  cacheMisses: stats.misses
                }
              },
              markdown: cached.markdown
            });
            break;
          }

          const localAnalysis = buildLocalAnalysis(parsed, classification, cluster);
          const t5 = performance.now();

          const stats = await recordCacheMiss();

          const metrics = {
            parseLatencyMs: Number((t1 - t0).toFixed(2)),
            classificationLatencyMs: Number((t2 - t1).toFixed(2)),
            clusteringLatencyMs: Number((t3 - t2).toFixed(2)),
            cacheLookupLatencyMs: Number((t4 - t3).toFixed(2)),
            localAnalysisLatencyMs: Number((t5 - t4).toFixed(2)),
            cacheStatus: 'miss',
            localOnlyMode,
            cacheHits: stats.hits,
            cacheMisses: stats.misses
          };

          const report = buildIssueReport({
            parsed,
            classification,
            cluster,
            localAnalysis,
            metrics
          });

          const markdown = buildMarkdownExport(report);

          await setCachedAnalysis(cluster.normalizedSignature, {
            localAnalysis,
            report,
            markdown
          });

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
