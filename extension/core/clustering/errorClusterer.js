function normalizeMessage(message = '') {
  return message
    .replace(/\b\d+\b/g, '<num>')
    .replace(/\b0x[a-f0-9]+\b/gi, '<hex>')
    .replace(/https?:\/\/\S+/gi, '<url>')
    .replace(/\b[a-f0-9]{8,}\b/gi, '<id>')
    .trim()
    .toLowerCase();
}

function simpleHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return `sig_${Math.abs(hash)}`;
}

export function clusterParsedError(parsed, classification) {
  const primaryFrame = parsed?.frames?.[0] || {};
  const normalizedMessage = normalizeMessage(parsed?.message || '');
  const normalizedSignature = [
    parsed?.errorType || 'UnknownError',
    classification?.signatureType || 'unclassified-error',
    primaryFrame.file || parsed?.probableFile || 'unknown-file',
    primaryFrame.fn || parsed?.probableFunction || 'unknown-fn',
    normalizedMessage
  ].join('|');

  return {
    normalizedMessage,
    normalizedSignature,
    clusterId: simpleHash(normalizedSignature),
    clusterFields: {
      errorType: parsed?.errorType || 'UnknownError',
      signatureType: classification?.signatureType || 'unclassified-error',
      probableFile: primaryFrame.file || parsed?.probableFile || null,
      probableFunction: primaryFrame.fn || parsed?.probableFunction || null
    }
  };
}
