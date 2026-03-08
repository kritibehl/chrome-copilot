import { setLatestCapture, getLatestCapture } from './core/state/sessionStore.js';
import { parseErrorInput } from './core/parsers/errorParser.js';

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

        default:
          sendResponse({ ok: false, error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
  })();

  return true;
});
