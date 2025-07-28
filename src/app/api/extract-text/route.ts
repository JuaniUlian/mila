
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/ai/flows/extract-text-from-file';
import { Readable } from 'stream';

// Aumentar el límite de tamaño del cuerpo de la solicitud
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

// Función para convertir un stream en un buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file found in the request' }, { status: 400 });
    }

    // Convertir el archivo a un buffer y luego a un Data URI
    // @ts-ignore - 'stream' is available on the File object in Node.js runtime
    const buffer = await streamToBuffer(file.stream());
    const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await extractTextFromFile({ fileDataUri, fileType: file.type, fileName: file.name });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in /api/extract-text:', error);
    return NextResponse.json({ 
        error: error.message || 'An unexpected error occurred on the server.' 
    }, { status: 500 });
  }
}

    