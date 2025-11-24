
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {anthropic} from 'genkitx-anthropic';
import { config } from 'dotenv';

config();

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
    anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
