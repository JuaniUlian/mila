
import { NextResponse } from 'next/server';
import { extractTextFromFile } from '@/ai/flows/extract-text-from-file';

// Define a new config object for the API route to increase the body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const { fileDataUri } = await request.json();

    if (!fileDataUri) {
      return NextResponse.json({ error: 'Missing fileDataUri in request body' }, { status: 400 });
    }

    const result = await extractTextFromFile({ fileDataUri });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in /api/extract-text:', error);
    // Provide a more structured error response
    return NextResponse.json({ 
        error: error.message || 'An unexpected error occurred on the server.' 
    }, { status: 500 });
  }
}

    