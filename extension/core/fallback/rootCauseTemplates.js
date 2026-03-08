const TEMPLATE_MAP = {
  'undefined-property-access': {
    probableCause: 'A value is being read before it is initialized or after it became undefined.',
    nextSteps: [
      'Guard nullable data before property access',
      'Inspect the state or prop source feeding this code path',
      'Verify async fetch completion before render or access'
    ]
  },
  'network-request-failure': {
    probableCause: 'The request failed before a usable response was returned.',
    nextSteps: [
      'Verify endpoint reachability and request URL',
      'Inspect auth headers and token validity',
      'Check browser network tab for status code and response'
    ]
  },
  'cors-policy-failure': {
    probableCause: 'The browser blocked the request due to cross-origin policy.',
    nextSteps: [
      'Inspect preflight request and response headers',
      'Verify allowed origin, methods, and credentials configuration',
      'Confirm server-side CORS middleware is applied on failing route'
    ]
  },
  'undefined-symbol': {
    probableCause: 'A referenced symbol is missing, mis-scoped, or renamed.',
    nextSteps: [
      'Check imports and local variable declarations',
      'Inspect recent renames or moved code',
      'Verify execution order and scope visibility'
    ]
  },
  'syntax-failure': {
    probableCause: 'The parser encountered invalid syntax near the reported location.',
    nextSteps: [
      'Inspect the reported line and surrounding code',
      'Look for unmatched delimiters or malformed expressions',
      'Check generated or transpiled code if applicable'
    ]
  },
  'render-path-failure': {
    probableCause: 'A UI render path is assuming data or state that is not ready.',
    nextSteps: [
      'Inspect component props and derived state',
      'Add a loading or empty-state guard',
      'Verify hook and render ordering assumptions'
    ]
  },
  'unclassified-error': {
    probableCause: 'The failure pattern did not match a known signature template.',
    nextSteps: [
      'Inspect the top stack frame first',
      'Compare the failure against recent code changes',
      'Capture minimal reproduction steps and failing inputs'
    ]
  }
};

export function getRootCauseTemplate(signatureType) {
  return TEMPLATE_MAP[signatureType] || TEMPLATE_MAP['unclassified-error'];
}
