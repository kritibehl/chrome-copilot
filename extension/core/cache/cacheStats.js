const CACHE_STATS_KEY = 'copilot.cacheStats';

async function readStats() {
  const data = await chrome.storage.local.get(CACHE_STATS_KEY);
  return data[CACHE_STATS_KEY] || { hits: 0, misses: 0 };
}

async function writeStats(stats) {
  await chrome.storage.local.set({ [CACHE_STATS_KEY]: stats });
}

export async function recordCacheHit() {
  const stats = await readStats();
  stats.hits += 1;
  await writeStats(stats);
  return stats;
}

export async function recordCacheMiss() {
  const stats = await readStats();
  stats.misses += 1;
  await writeStats(stats);
  return stats;
}

export async function getCacheStats() {
  return readStats();
}
