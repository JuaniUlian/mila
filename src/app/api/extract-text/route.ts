import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/ai/flows/extract-text-from-file';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      chunks.push(value);
    }
  }
  
  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file found in the request' }, { status: 400 });
    }

    // @ts-ignore - 'stream' está disponible en el objeto File en el runtime de Next.js Edge/Node.js
    const buffer = await streamToBuffer(file.stream());
    const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await extractTextFromFile({ fileDataUri });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in /api/extract-text:', error);
    // Use the error message directly from the flow, which is now more informative
    const errorMessage = error.message || 'An unexpected error occurred on the server.';
    return NextResponse.json({ 
        error: `Server-side extraction failed. ${errorMessage}` 
    }, { status: 500 });
  }
}
