export async function rewrite(text, goal='make safer and more robust') {
    if ('Rewriter' in self) {
      const availability = await Rewriter.availability();
      if (availability !== 'unavailable') {
        const rw = await Rewriter.create({ tone: 'neutral', format: 'markdown' });
        return await rw.rewrite(text, { goal });
      }
    }
    // Fallback through Prompt API to produce only code or patch-like output.
    if (!('LanguageModel' in self)) throw new Error('No Rewriter/Prompt available');
    const session = await LanguageModel.create({});
    const prompt = `Rewrite the following code with the goal: ${goal}. Output ONLY a code block, no commentary.`;
    const res = await session.prompt(`${prompt}\n\n${text}`);
    return res;
  }
  