const SESSION_KEY = 'copilot.latestCapture';

export async function setLatestCapture(capture) {
  await chrome.storage.session.set({
    [SESSION_KEY]: capture
  });
}

export async function getLatestCapture() {
  const data = await chrome.storage.session.get(SESSION_KEY);
  return data[SESSION_KEY] || null;
}

export async function clearLatestCapture() {
  await chrome.storage.session.remove(SESSION_KEY);
}
