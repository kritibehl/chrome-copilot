export function buildIssueReport({ parsed, classification, cluster, localAnalysis, metrics = {} }) {
  const titleParts = [
    classification?.signatureType || 'unclassified-error',
    parsed?.probableFile || cluster?.clusterFields?.probableFile || null
  ].filter(Boolean);

  const title = titleParts.length
    ? titleParts.join(' @ ')
    : 'browser-debugging-issue-summary';

  return {
    title,
    issueSummary: parsed?.message || parsed?.rawText?.split('\n')[0] || 'Unknown issue',
    probableCause: localAnalysis?.probableCause || 'Unknown probable cause',
    severity: inferSeverity(classification?.family, classification?.confidence),
    normalizedSignature: cluster?.normalizedSignature || null,
    clusterId: cluster?.clusterId || null,
    classification,
    parsed,
    nextSteps: localAnalysis?.nextSteps || [],
    metrics
  };
}

function inferSeverity(family, confidence) {
  if (family === 'network') return 'medium';
  if (family === 'frontend-runtime' || family === 'ui-runtime') return confidence >= 0.85 ? 'high' : 'medium';
  if (family === 'build-or-runtime') return 'high';
  return 'medium';
}
