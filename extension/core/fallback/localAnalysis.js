import { getRootCauseTemplate } from './rootCauseTemplates.js';

export function buildLocalAnalysis(parsed, classification, cluster) {
  const template = getRootCauseTemplate(classification?.signatureType);

  return {
    mode: 'local-deterministic',
    probableCause: template.probableCause,
    nextSteps: template.nextSteps,
    confidence: classification?.confidence ?? 0.4,
    clusterId: cluster?.clusterId || null
  };
}
