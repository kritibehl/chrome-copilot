export function detectContext() {
    const text = document.body.innerText.slice(0, 200000);
    const isGitHub = !!document.querySelector('.blob-code, .markdown-body');
    const hasCodeTags = document.querySelectorAll('pre, code').length > 0;
    const logHints = /(ERROR|Exception|Traceback|Build failed|npm ERR!|stack trace|at [^\n]+:\d+)/i.test(text);
    const codeHints = /(^|\s)(function|class|def|=>|import|#include|SELECT|INSERT|UPDATE)(\s|[({])/im.test(text);
    return { isCode: isGitHub || hasCodeTags || codeHints, isLogs: logHints };
  }
  