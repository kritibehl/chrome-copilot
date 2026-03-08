import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/workflowValue.json', 'utf8'));

const before = data.baselineManualWorkflow.length;
const after = data.chromeCopilotWorkflow.length;
const reduction = before - after;
const reductionPct = (reduction / before) * 100;

console.log(JSON.stringify({
  baselineSteps: before,
  chromeCopilotSteps: after,
  reducedSteps: reduction,
  reductionPercent: Number(reductionPct.toFixed(2)),
  baselineManualWorkflow: data.baselineManualWorkflow,
  chromeCopilotWorkflow: data.chromeCopilotWorkflow
}, null, 2));
