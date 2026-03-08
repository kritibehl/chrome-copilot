import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

import { parseErrorInput } from '../extension/core/parsers/errorParser.js';
import { classifyParsedError } from '../extension/core/classifiers/signatureClassifier.js';
import { clusterParsedError } from '../extension/core/clustering/errorClusterer.js';
import { buildLocalAnalysis } from '../extension/core/fallback/localAnalysis.js';
import { buildIssueReport } from '../extension/core/reports/reportBuilder.js';
import { buildMarkdownExport } from '../extension/core/reports/exportIssueSummary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesPath = path.resolve(__dirname, '../extension/fixtures/sampleErrors.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const ITERATIONS = 200;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

function computeCompleteness(report) {
  const checks = [
    Boolean(report?.title),
    Boolean(report?.issueSummary),
    Boolean(report?.probableCause),
    Array.isArray(report?.nextSteps) && report.nextSteps.length > 0,
    Boolean(report?.severity),
    Boolean(report?.clusterId),
    Boolean(report?.normalizedSignature)
  ];
  const passed = checks.filter(Boolean).length;
  return {
    passed,
    total: checks.length,
    score: passed / checks.length
  };
}

const totalTimes = [];
const parseTimes = [];
const classifyTimes = [];
const clusterTimes = [];
const localAnalysisTimes = [];
const reportTimes = [];
const markdownTimes = [];
const completenessScores = [];

for (let i = 0; i < ITERATIONS; i += 1) {
  for (const fixture of fixtures) {
    const t0 = performance.now();

    const p0 = performance.now();
    const parsed = parseErrorInput(fixture.input);
    const p1 = performance.now();

    const c0 = performance.now();
    const classification = classifyParsedError(parsed);
    const c1 = performance.now();

    const cl0 = performance.now();
    const cluster = clusterParsedError(parsed, classification);
    const cl1 = performance.now();

    const l0 = performance.now();
    const localAnalysis = buildLocalAnalysis(parsed, classification, cluster);
    const l1 = performance.now();

    const r0 = performance.now();
    const report = buildIssueReport({
      parsed,
      classification,
      cluster,
      localAnalysis,
      metrics: {}
    });
    const r1 = performance.now();

    const m0 = performance.now();
    buildMarkdownExport(report);
    const m1 = performance.now();

    const t1 = performance.now();

    parseTimes.push(p1 - p0);
    classifyTimes.push(c1 - c0);
    clusterTimes.push(cl1 - cl0);
    localAnalysisTimes.push(l1 - l0);
    reportTimes.push(r1 - r0);
    markdownTimes.push(m1 - m0);
    totalTimes.push(t1 - t0);

    completenessScores.push(computeCompleteness(report).score);
  }
}

function fmt(n) {
  return Number(n.toFixed(3));
}

const summary = {
  fixtureCount: fixtures.length,
  iterationsPerFixture: ITERATIONS,
  totalRuns: fixtures.length * ITERATIONS,
  metrics: {
    timeToFirstReportMs: {
      median: fmt(median(totalTimes)),
      p95: fmt(percentile(totalTimes, 95))
    },
    parseLatencyMs: {
      median: fmt(median(parseTimes)),
      p95: fmt(percentile(parseTimes, 95))
    },
    classificationLatencyMs: {
      median: fmt(median(classifyTimes)),
      p95: fmt(percentile(classifyTimes, 95))
    },
    clusteringLatencyMs: {
      median: fmt(median(clusterTimes)),
      p95: fmt(percentile(clusterTimes, 95))
    },
    localAnalysisLatencyMs: {
      median: fmt(median(localAnalysisTimes)),
      p95: fmt(percentile(localAnalysisTimes, 95))
    },
    reportBuildLatencyMs: {
      median: fmt(median(reportTimes)),
      p95: fmt(percentile(reportTimes, 95))
    },
    markdownExportLatencyMs: {
      median: fmt(median(markdownTimes)),
      p95: fmt(percentile(markdownTimes, 95))
    },
    reportCompletenessScore: {
      average: fmt(completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length),
      max: fmt(Math.max(...completenessScores))
    }
  }
};

console.log(JSON.stringify(summary, null, 2));
