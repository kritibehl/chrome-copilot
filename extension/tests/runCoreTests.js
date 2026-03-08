import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { parseErrorInput } from '../core/parsers/errorParser.js';
import { classifyParsedError } from '../core/classifiers/signatureClassifier.js';
import { clusterParsedError } from '../core/clustering/errorClusterer.js';
import { buildLocalAnalysis } from '../core/fallback/localAnalysis.js';
import { buildIssueReport } from '../core/reports/reportBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesPath = path.resolve(__dirname, '../fixtures/sampleErrors.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const expected = {
  'undefined-property-access': 'undefined-property-access',
  'network-request-failure': 'network-request-failure',
  'cors-policy-failure': 'cors-policy-failure',
  'undefined-symbol': 'undefined-symbol',
  'syntax-failure': 'syntax-failure'
};

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`PASS: ${message}`);
  }
}

for (const fixture of fixtures) {
  const parsed = parseErrorInput(fixture.input);
  const classification = classifyParsedError(parsed);
  const cluster = clusterParsedError(parsed, classification);
  const localAnalysis = buildLocalAnalysis(parsed, classification, cluster);
  const report = buildIssueReport({
    parsed,
    classification,
    cluster,
    localAnalysis,
    metrics: {}
  });

  assert(parsed.rawText.length > 0, `${fixture.name} parsed text exists`);
  assert(classification.signatureType === expected[fixture.name], `${fixture.name} classified correctly`);
  assert(Boolean(cluster.clusterId), `${fixture.name} cluster id exists`);
  assert(Boolean(cluster.normalizedSignature), `${fixture.name} normalized signature exists`);
  assert(Boolean(report.title), `${fixture.name} report title exists`);
  assert(Array.isArray(report.nextSteps) && report.nextSteps.length > 0, `${fixture.name} next steps exist`);

  const clusterRepeat = clusterParsedError(parsed, classification);
  assert(
    clusterRepeat.clusterId === cluster.clusterId,
    `${fixture.name} clustering is stable across repeated runs`
  );
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}

console.log(`\nAll ${fixtures.length} fixture cases passed`);
