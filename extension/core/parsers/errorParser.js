export function parseErrorInput(rawText) {
  const text = (rawText || '').trim();

  const typeMatch =
    text.match(/\b(TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|AggregateError)\b/) ||
    text.match(/\b(NetworkError|AbortError)\b/);

  const messageMatch =
    text.match(/^(.*(?:Error|Exception):?.*)$/m) ||
    text.match(/\b(TypeError|ReferenceError|SyntaxError|RangeError|URIError|EvalError|AggregateError)\b:?\s*(.*)/);

  const frameRegex = /at\s+([^(]+?)\s*\(([^:)\n]+):(\d+):(\d+)\)|at\s+([^:)\n]+):(\d+):(\d+)/g;

  const frames = [];
  let match;
  while ((match = frameRegex.exec(text)) !== null) {
    if (match[1]) {
      frames.push({
        fn: match[1].trim(),
        file: match[2].trim(),
        line: Number(match[3]),
        column: Number(match[4])
      });
    } else {
      frames.push({
        fn: null,
        file: match[5].trim(),
        line: Number(match[6]),
        column: Number(match[7])
      });
    }
  }

  const probableFile = frames[0]?.file || null;
  const probableFunction = frames[0]?.fn || null;

  return {
    rawText: text,
    errorType: typeMatch ? typeMatch[1] : 'UnknownError',
    message: messageMatch ? messageMatch[0].trim() : text.split('\n')[0] || '',
    frames,
    probableFile,
    probableFunction,
    tags: inferTags(text),
    parsedAt: new Date().toISOString()
  };
}

function inferTags(text) {
  const tags = [];

  if (/fetch|network|xhr|failed to fetch|status code|net::/i.test(text)) {
    tags.push('network');
  }

  if (/TypeError|ReferenceError|SyntaxError/i.test(text)) {
    tags.push('runtime');
  }

  if (/react|render|hooks|component/i.test(text)) {
    tags.push('ui');
  }

  if (/npm ERR!|Build failed|Traceback|Exception/i.test(text)) {
    tags.push('logs');
  }

  return tags;
}
