
'use server';
import { config } from 'dotenv';
config();

// Import all flows so that they are registered with Genkit
import '@/ai/flows/extract-text-from-file.ts';
import '@/ai/flows/validate-document.ts';
import '@/ai/flows/validate-suggestion-edit.ts';

import { firebase } from '@genkit-ai/firebase';
import { genkit } from 'genkit';

// This is the entry point for the Genkit developer server
export default genkit({
  plugins: [firebase()],
});
