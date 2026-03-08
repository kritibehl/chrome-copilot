# Demo Script — Chrome Copilot

## Scenario
A frontend page fails with a runtime error:

TypeError: Cannot read properties of undefined (reading 'map')

## Demo flow

1. Open the failing page
2. Click the floating Copilot button
3. Open the side panel
4. Show captured page title, URL, and error text
5. Click "Analyze Workflow"
6. Walk through:
   - parsed error
   - signature classification
   - cluster id
   - probable cause
   - suggested next steps
   - latency metrics
7. Click "Copy Report"
8. Paste the generated Markdown issue summary into a doc or issue tracker
9. Re-run the same analysis
10. Show cache hit in metrics

## Key talking points

- This is not a generic browser chatbot
- The project is designed to reduce debugging context switching
- Repeated failures cluster to the same normalized signature
- The workflow still works in local-only deterministic mode
- Exportable issue summaries reduce repeated manual triage
