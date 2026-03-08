const CACHE_KEY = 'copilot.signatureCache';

async function readCacheMap() {
  const data = await chrome.storage.local.get(CACHE_KEY);
  return data[CACHE_KEY] || {};
}

async function writeCacheMap(cacheMap) {
  await chrome.storage.local.set({ [CACHE_KEY]: cacheMap });
}

export async function getCachedAnalysis(signature) {
  const cacheMap = await readCacheMap();
  return cacheMap[signature] || null;
}

export async function setCachedAnalysis(signature, value) {
  const cacheMap = await readCacheMap();
  cacheMap[signature] = {
    ...value,
    cachedAt: new Date().toISOString()
  };
  await writeCacheMap(cacheMap);
}

export async function clearCachedAnalysis(signature) {
  const cacheMap = await readCacheMap();
  delete cacheMap[signature];
  await writeCacheMap(cacheMap);
}
