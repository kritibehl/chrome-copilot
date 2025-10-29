export async function explain(text) {
    if (!('Summarizer' in self)) throw new Error('Summarizer API unavailable');
    const availability = await Summarizer.availability();
    if (availability === 'unavailable') throw new Error('Model unavailable');
    const summarizer = await Summarizer.create({ type: 'key-points', format: 'markdown', length: 'short' });
    return await summarizer.summarize(text, { context: 'Explain for a software engineer debugging an issue.' });
  }
  