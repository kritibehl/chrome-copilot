# Chrome Copilot

> A workflow-first Chrome debugging assistant that turns raw browser errors into structured, shareable issue reports.

Chrome Copilot is a privacy-aware browser debugging tool that reduces debugging context switching by capturing browser-side errors, parsing them into structured signals, classifying recurring failure patterns, clustering noisy variants, and exporting handoff-ready Markdown summaries.

**It is a debugging workflow tool, not a generic AI chatbot.**

---

## Why It Matters

| Metric | Result |
|--------|--------|
| Workflow step reduction | 8 steps → 3 — **62.5% reduction** |
| Report completeness | **100%** on the current fixture-backed benchmark set |
| Error categories validated | **5** representative browser error types |
| Benchmark scale | **1,000** workflow-core runs |
| Cluster stability | **80%** in normalization benchmark |

---

## The Problem It Solves

Every browser debugging session follows the same manual sequence:

1. Copy an error or stack trace from the page
2. Open docs, search, or a chat tool
3. Paste the raw error
4. Interpret what kind of failure it is
5. Identify the relevant file or function
6. Write a probable-cause note
7. Draft next debugging steps
8. Rewrite everything into a report for handoff

Chrome Copilot compresses this into a structured in-browser workflow — **3 steps instead of 8**.

---

## User Experience

### 1. Open a page with errors, logs, or stack traces
The extension works on any page containing browser-side errors, logs, code blocks, or debugging-related text.

### 2. Click the floating Copilot button
The extension injects a floating button into the page. Clicking it captures relevant debugging context automatically.

### 3. Context is captured automatically
The extension gathers:
- Selected text (if highlighted), or nearby code/log text from the page
- Page title and URL
- Context hints (code vs. logs)
- Capture timestamp

### 4. The side panel opens pre-filled
Captured content appears in an analysis-ready panel — no manual copy-paste required.

### 5. Run workflow analysis
Click **Analyze Workflow** to run the full debugging pipeline.

---

## Example

**Input**

```
TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (UserList.jsx:14:23)
    at renderWithHooks (react-dom.development.js:16305:18)
```

**Output**

```
Signature Type:    undefined-property-access
Probable File:     UserList.jsx
Probable Function: UserList
Probable Cause:    A value is being read before it is initialized or after it became undefined.

Next Steps:
  - Guard nullable data before property access
  - Inspect the state or prop source feeding this code path
  - Verify async fetch completion before render or access
```

---

## How the Analysis Pipeline Works

### Stage 1 — Parse Raw Input
Parses raw errors and logs into structured fields: error type, message, stack frames, probable file, probable function, and debugging tags. This is a deterministic parser, not freeform AI interpretation.

### Stage 2 — Classify the Failure Signature
Classifies the failure into a known debugging category with a confidence score and associated hints.

| Category | Description |
|----------|-------------|
| `undefined-property-access` | Reading from null/undefined |
| `network-request-failure` | Failed fetch or XHR |
| `cors-policy-failure` | Cross-origin block |
| `undefined-symbol` | Reference errors |
| `syntax-failure` | Parse-time errors |
| `render-path-failure` | Component/render failures |
| `unclassified-error` | Catch-all for unknown patterns |

### Stage 3 — Cluster Recurring Errors
Normalizes noisy error variants (changing line numbers, request IDs, hex trace IDs, URL noise) into a stable signature and cluster ID. Repeated failures are recognized as the same issue — enabling caching, consistent triage, and smarter repeated workflows.

### Stage 4 — Local Deterministic Analysis
Even without AI, the tool generates:
- Probable cause
- Suggested next steps
- Confidence rating
- Cluster-linked debugging guidance

The extension is **fully functional in local-only deterministic mode**.

### Stage 5 — Build a Structured Issue Report
The output report includes:

> Title · Issue Summary · Probable Cause · Severity  
> Normalized Signature · Cluster ID · Classification  
> Parsed Data · Next Steps · Metrics

### Stage 6 — Export
Reports are exported as Markdown — ready to copy or download as a `.md` file for issue trackers, handoff notes, or QA documentation.

---

## Common Errors and Fixes

| Error Pattern | Likely Cause | Typical Fix |
|---------------|--------------|-------------|
| `undefined-property-access` | Data is null or undefined before access | Add null guards, loading states, or initialization checks |
| `network-request-failure` | Request failed before response was returned | Verify URL, server reachability, auth, and response status |
| `cors-policy-failure` | Browser blocked cross-origin request | Check preflight behavior and server CORS headers |
| `undefined-symbol` | Variable or import is missing or renamed | Verify scope, imports, and recent refactors |
| `syntax-failure` | Invalid syntax near reported line | Inspect delimiters, commas, quotes, and generated code |
| `render-path-failure` | UI render assumed unavailable state/props | Add defensive rendering and verify async data readiness |

---

## Architecture

```
+---------------------------------------------+
|              Content Layer                  |
|  context detection · capture · initiation   |
|  content.js · detectors.js                  |
+---------------------------------------------+
|           Core Workflow Layer               |
|  parse · classify · cluster · analyze       |
|  report · export · cache · settings         |
+---------------------------------------------+
|       Background / Orchestration Layer      |
|  message routing · session storage          |
|  cache coordination · settings              |
+---------------------------------------------+
|              AI Layer (optional)            |
|  explain · diagnose · rewrite               |
+---------------------------------------------+
```

The extension is built around a **deterministic workflow core**. AI sits on top as an optional enhancement layer rather than acting as the primary logic engine.

---

## Key Features

### Clustering and Caching
- Normalizes noisy error variants into stable signatures
- Caches prior analysis by signature — repeated failures reuse prior results
- Tracks cache hits and misses for visibility into debugging reuse patterns

### Local-Only Deterministic Mode
- Full deterministic workflow runs without any AI backend
- Useful for privacy-sensitive environments and degraded conditions

### Metrics
Every workflow run records:
- Parse, classification, clustering, and analysis latency
- Cache status (hit / miss)
- Local-only mode state

### Validation
Fixture-based tests cover representative failure patterns. Each fixture validates:
- Parsing
- Classification
- Cluster ID generation
- Signature normalization
- Report building
- Next-step generation
- Repeated-run clustering stability

Validated patterns include:
- `undefined-property-access`
- `network-request-failure`
- `cors-policy-failure`
- `undefined-symbol`
- `syntax-failure`

---

## What Makes This Different

Most browser AI tools make AI the entire product. Chrome Copilot inverts that design.

| Approach | This Project |
|----------|-------------|
| Generic chatbot | ❌ |
| AI as primary logic | ❌ |
| Deterministic workflow core | ✅ |
| AI as optional enhancement | ✅ |
| Clustering and caching | ✅ |
| Exportable structured reports | ✅ |
| Local-only deterministic mode | ✅ |
| Benchmark and validation suite | ✅ |

---

## Who This Is For

- **Software QA engineers** — structured reports and repeatable triage
- **Product engineers** — faster root-cause identification
- **Developer productivity** — reduced context switching
- **Internal tooling teams** — exportable, handoff-ready summaries

---

## Run Locally

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Open a page with logs or stack traces
6. Click the floating Copilot button
7. Open the side panel and click **Analyze Workflow**

---

## Validation and Benchmarks

Run fixture-backed validation:

```bash
npm run test:core
```

Run workflow benchmarks:

```bash
npm run bench:core
npm run bench:cluster
npm run bench:value
```

---

## Summary

Chrome Copilot is a workflow-first Chrome debugging assistant that captures browser-side debugging context, parses raw logs and stack traces into structured signals, classifies recurring failure patterns, clusters noisy variants into stable issue signatures, generates deterministic root-cause guidance, caches repeated analyses, and exports shareable Markdown issue summaries for faster debugging triage and handoff.