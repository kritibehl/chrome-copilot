# Chrome Copilot — Ambient AI Debugging for the Web
A Chrome Extension using Chrome built-in AI (Gemini Nano) to explain stack traces, diagnose root causes, and propose refactors without leaving the tab.

## Features
- Explain error logs & stack traces inline (Summarizer API)
- Root-cause analysis with structured output (Prompt API)
- Safe refactor/patch suggestion (Rewriter API or Prompt fallback)
- Side panel history, copy-to-clipboard, inline annotations

## Install (Dev)
1. Open `chrome://extensions` → toggle **Developer mode**
2. **Load unpacked** → select the `extension/` folder
3. Open any page with code/logs → click **⚡ Copilot** floating button

## APIs
- Prompt API
- Summarizer API
- Rewriter API (Origin Trial; falls back to Prompt)

## Demo
YouTube (3 min): *link here after recording*

## License
MIT
