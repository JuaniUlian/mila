import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile, ExtractTextFromFileOutput } from '@/ai/flows/extract-text-from-file';

export const runtime = 'nodejs';

// CONFIGURACIÓN CRÍTICA: Deshabilitar bodyParser solo para esta ruta
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
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const contentType = formData.get('contentType') as string | null;

    if (!file || !contentType) {
      return NextResponse.json({ ok: false, error: 'No file or content type found in the request' }, { status: 400 });
    }

    // Convertir el archivo a un buffer y luego a un Data URI
    const buffer = await streamToBuffer(file.stream() as ReadableStream<Uint8Array>);
    const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result: ExtractTextFromFileOutput = await extractTextFromFile({ fileDataUri, contentType });

    if (result.ok) {
        return NextResponse.json({ ok: true, text: result.text });
    } else {
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error in /api/extract-text:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred on the server.';
    return NextResponse.json({
        ok: false,
        error: `Server-side extraction failed: ${errorMessage}`
    }, { status: 500 });
  }
}
