export function buildMarkdownExport(report) {
  return [
    `# ${report.title}`,
    '',
    `- Severity: ${report.severity}`,
    `- Cluster ID: ${report.clusterId || 'n/a'}`,
    `- Signature: ${report.normalizedSignature || 'n/a'}`,
    '',
    '## Issue Summary',
    report.issueSummary || 'n/a',
    '',
    '## Probable Cause',
    report.probableCause || 'n/a',
    '',
    '## Next Steps',
    ...(report.nextSteps?.length
      ? report.nextSteps.map((step) => `- ${step}`)
      : ['- n/a']),
    '',
    '## Classification',
    '```json',
    JSON.stringify(report.classification || {}, null, 2),
    '```',
    '',
    '## Parsed',
    '```json',
    JSON.stringify(report.parsed || {}, null, 2),
    '```'
  ].join('\n');
}
