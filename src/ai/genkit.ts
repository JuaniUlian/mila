import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-pro',
  // Set a longer timeout for flows to handle large file processing.
  flowTimeout: '5m',
});
