const LOCAL_ONLY_KEY = 'copilot.localOnlyMode';

export async function getLocalOnlyMode() {
  const data = await chrome.storage.local.get(LOCAL_ONLY_KEY);
  return Boolean(data[LOCAL_ONLY_KEY]);
}

export async function setLocalOnlyMode(enabled) {
  await chrome.storage.local.set({
    [LOCAL_ONLY_KEY]: Boolean(enabled)
  });
}
