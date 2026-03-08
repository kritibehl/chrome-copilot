import { clusterParsedError } from '../extension/core/clustering/errorClusterer.js';
import { classifyParsedError } from '../extension/core/classifiers/signatureClassifier.js';
import { parseErrorInput } from '../extension/core/parsers/errorParser.js';

const variants = [
  `TypeError: Cannot read properties of undefined (reading 'map')
   at UserList (UserList.jsx:14:23)
   at renderWithHooks (react-dom.development.js:16305:18)`,

  `TypeError: Cannot read properties of undefined (reading 'map')
   at UserList (UserList.jsx:18:44)
   at renderWithHooks (react-dom.development.js:16305:18)`,

  `TypeError: Cannot read properties of undefined (reading 'map')
   at UserList (https://app.example.com/static/UserList.jsx:18:44)
   at renderWithHooks (react-dom.development.js:16305:18)`,

  `TypeError: Cannot read properties of undefined (reading 'map')
   requestId=abc123456789
   at UserList (UserList.jsx:99:7)`,

  `TypeError: Cannot read properties of undefined (reading 'map')
   trace=0x9fabc123
   at UserList (UserList.jsx:201:3)`
];

const clusters = variants.map((input) => {
  const parsed = parseErrorInput(input);
  const classification = classifyParsedError(parsed);
  const cluster = clusterParsedError(parsed, classification);
  return {
    input,
    clusterId: cluster.clusterId,
    normalizedSignature: cluster.normalizedSignature
  };
});

const uniqueClusterIds = [...new Set(clusters.map((c) => c.clusterId))];
const stabilityRate = (clusters.length - uniqueClusterIds.length + 1) / clusters.length;

console.log(JSON.stringify({
  variants: clusters.length,
  uniqueClusterIds: uniqueClusterIds.length,
  stabilityRate,
  clusters
}, null, 2));
