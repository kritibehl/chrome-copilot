export async function diagnose(text, kind='auto') {
    if (!('LanguageModel' in self)) throw new Error('Prompt API unavailable');
    const availability = await LanguageModel.availability();
    if (availability === 'unavailable') throw new Error('Model unavailable');
    const session = await LanguageModel.create({
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }]
    });
    const prompt = `You are a senior debugging assistant. Given the following ${kind} content, identify likely root cause and the safest next step. Respond as JSON with keys root_cause, fix, confidence (0-1).`;
    const res = await session.prompt(`${prompt}\n\n=== CONTENT START ===\n${text}\n=== CONTENT END ===`);
    // If model returns plain text JSON, try parse; else return as-is.
    try { return JSON.parse(res); } catch { return { root_cause: res, fix: "", confidence: 0.5 }; }
  }
  