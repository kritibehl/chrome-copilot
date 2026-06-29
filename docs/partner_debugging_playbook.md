# Partner Debugging Playbook

## Purpose

This playbook documents how Chrome Copilot can be used as a workflow-first browser debugging assistant for partner-facing web incidents, especially issues involving playback, embeds, HTTP failures, CORS problems, and browser-side client symptoms.

The goal is to turn raw browser signals into:
- structured incident understanding
- likely root-cause classification
- reproducible debugging steps
- partner-facing troubleshooting guidance
- exportable support-ready reports

---

## Primary Incident Types

Chrome Copilot is especially useful for:

- video player not loading
- partner embed blocked or blank
- playback bootstrap request failure
- HTTP 403 / authorization failure
- CORS preflight or fetch failure
- timeout or stalled media/bootstrap request
- script/runtime errors that block player initialization

---

## Workflow

### 1. Symptom Intake
Start with the partner-reported symptom:
- player not loading
- black screen
- spinner never resolves
- embed blocked
- playback request fails
- console/network errors observed

Capture:
- page URL
- environment
- browser/device
- repro frequency
- partner description of expected vs actual behavior

### 2. Browser Signal Capture
Capture browser-side evidence:
- console errors
- stack traces
- failed network requests
- request timing
- request/response headers
- visible player bootstrap failures

Chrome Copilot should collect:
- selected console or log text when available
- nearby code/log blocks
- page title and URL
- context hints for code/log-heavy pages

### 3. Network Failure Inspection
Inspect:
- failing request URL
- HTTP method
- status code
- response timing
- preflight behavior
- request headers
- response headers

Look for:
- 403 authorization/policy failures
- CORS header mismatches
- timeouts
- blocked third-party resources
- missing allowlist/origin/referrer conditions

### 4. Root-Cause Classification
Map signals into structured categories such as:
- network-request-failure
- cors-policy-failure
- undefined-property-access
- render-path-failure
- undefined-symbol
- syntax-failure
- unclassified-error

For partner incidents, also interpret likely support categories:
- partner embed policy mismatch
- origin/referrer restriction
- authorization/token issue
- playback bootstrap timeout
- browser-side player initialization failure
- client/runtime integration issue

### 5. Reproduction Guidance
Generate reproducible steps using:
- page URL
- browser/device information
- environment notes
- trigger action
- expected result
- actual result
- console/network observations

A good repro section should make it easy for:
- partner support
- engineering
- QA
- product operations

to reproduce the issue consistently.

### 6. Partner-Facing Troubleshooting Guidance
Translate low-level technical symptoms into partner-safe guidance:
- verify allowed origin / embed settings
- confirm authorization token or allowlist configuration
- inspect failing request and headers
- validate CORS behavior
- test in clean browser session
- retry with minimal embed environment
- confirm whether issue is environment-specific or universal

### 7. Exportable Report
A useful partner/browser incident report should include:
- incident summary
- browser symptoms
- console evidence
- network evidence
- likely root cause
- reproduction steps
- partner actions
- escalation notes

---

## Common Browser/Network Issue Patterns

### HTTP 403 on Embed or Playback Request
Likely causes:
- missing partner allowlist
- invalid or expired token
- blocked referrer/origin
- policy restriction on embed context

Typical checks:
- request URL
- authorization headers
- referrer/origin headers
- response body/message
- partner embed configuration

### CORS Failure
Likely causes:
- missing `Access-Control-Allow-Origin`
- failing preflight response
- mismatched credentials/methods/headers

Typical checks:
- request origin
- preflight request/response
- CORS headers
- browser console CORS message

### Timeout / Stalled Bootstrap Request
Likely causes:
- upstream slowness
- blocked dependency
- client timeout threshold
- intermittent partner network path issues

Typical checks:
- request timing waterfall
- retry behavior
- dependency availability
- environment-specific reproducibility

### Client Runtime Failure
Likely causes:
- JS integration error
- undefined config or state
- player init path bug
- unsupported page/embed setup

Typical checks:
- top stack frame
- player init sequence
- missing config values
- environment-dependent script loading

---

## Escalation Criteria

Escalate when:
- issue is reproducible across clean sessions and environments
- network failure indicates platform-side policy or backend issue
- request/response headers suggest allowlist or auth misconfiguration that needs backend verification
- symptom persists after partner-safe remediation steps
- runtime failure points to likely player or integration bug beyond partner configuration

---

## What Good Output Looks Like

A strong Chrome Copilot workflow output for partner debugging should:
- classify the incident clearly
- identify the most relevant browser/network evidence
- provide probable root cause
- produce reproducible steps
- translate findings into partner-facing actions
- export a report usable in support or engineering handoff
