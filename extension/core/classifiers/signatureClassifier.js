export function classifyParsedError(parsed) {
  const text = `${parsed?.message || ''}\n${parsed?.rawText || ''}`;
  const lower = text.toLowerCase();

  if (/cannot read properties of undefined|undefined .*reading|undefined is not an object/.test(lower)) {
    return {
      family: 'frontend-runtime',
      signatureType: 'undefined-property-access',
      confidence: 0.94,
      hints: [
        'Guard nullable values before property access',
        'Check async state initialization before render',
        'Add loading or null fallback'
      ]
    };
  }

  if (/failed to fetch|networkerror|net::|load failed|err_network/.test(lower)) {
    return {
      family: 'network',
      signatureType: 'network-request-failure',
      confidence: 0.9,
      hints: [
        'Verify request URL and server availability',
        'Check CORS or auth configuration',
        'Inspect request status and response body'
      ]
    };
  }

  if (/cors|blocked by cors policy|preflight/.test(lower)) {
    return {
      family: 'network',
      signatureType: 'cors-policy-failure',
      confidence: 0.95,
      hints: [
        'Verify Access-Control-Allow-Origin headers',
        'Check preflight response handling',
        'Confirm credentials and allowed methods'
      ]
    };
  }

  if (/referenceerror/.test(lower)) {
    return {
      family: 'runtime',
      signatureType: 'undefined-symbol',
      confidence: 0.88,
      hints: [
        'Check variable or import definition order',
        'Verify symbol scope',
        'Inspect recent refactors or renamed identifiers'
      ]
    };
  }

  if (/syntaxerror/.test(lower)) {
    return {
      family: 'build-or-runtime',
      signatureType: 'syntax-failure',
      confidence: 0.9,
      hints: [
        'Inspect nearby syntax near the reported line',
        'Check unmatched brackets, commas, or quotes',
        'Verify transpiled output if build-generated'
      ]
    };
  }

  if (/react|render|hook|component/.test(lower)) {
    return {
      family: 'ui-runtime',
      signatureType: 'render-path-failure',
      confidence: 0.75,
      hints: [
        'Check component props and state assumptions',
        'Inspect hook ordering and conditional rendering',
        'Verify async data readiness before render'
      ]
    };
  }

  return {
    family: 'unknown',
    signatureType: 'unclassified-error',
    confidence: 0.4,
    hints: [
      'Inspect top stack frame first',
      'Compare against recent code changes',
      'Capture reproduction steps and failing inputs'
    ]
  };
}
