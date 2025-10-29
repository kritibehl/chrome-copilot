chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setOptions({ enabled: true });
  });
  