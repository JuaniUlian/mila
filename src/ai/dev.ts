'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/extract-text-from-file.ts';
import '@/ai/flows/validate-document.ts';
import '@/ai/flows/validate-suggestion-edit.ts';
