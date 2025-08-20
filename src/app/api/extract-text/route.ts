
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/ai/flows/extract-text-from-file';

// Aumentar el límite de tamaño del cuerpo de la solicitud
export const config = {
  api: {
    bodyParser: false, // Let the server handle the raw request body
  },
};

// Función para convertir un Web Stream (ReadableStream) en un buffer
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

    // Convertir el archivo a un buffer y luego a un Data URI
    // @ts-ignore - 'stream' está disponible en el objeto File en el runtime de Next.js Edge/Node.js
    const buffer = await streamToBuffer(file.stream());
    const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await extractTextFromFile({ fileDataUri, fileType: file.type, fileName: file.name });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in /api/extract-text:', error);
    const errorMessage = error.message || 'An unexpected error occurred on the server.';
    return NextResponse.json({ 
        error: `Server-side extraction failed: ${errorMessage}` 
    }, { status: 500 });
  }
}
