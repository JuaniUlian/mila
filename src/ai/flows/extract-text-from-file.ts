'use server';
/**
 * Extrae texto de PDFs, imágenes y documentos.
 * - Claude Sonnet primario:
 *    - PDF: /v1/files + messages.attachments (tools: document)
 *    - Imágenes: messages con content[type=input_image]
 * - Fallback local básico para PDF si hiciera falta (pdf-lib texto incrustado)
 */

import { z } from 'zod';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';

// ───────────────────────── schemas / tipos
const InputSchema = z.object({
  fileDataUri: z.string().min(10, 'fileDataUri requerido'),
});
type ExtractTextFromFileInput = z.infer<typeof InputSchema>;

export type ExtractTextFromFileOutput = {
  ok: boolean;
  extractedText?: string;
  error?: string;
  meta?: { model: string; strategy: 'anthropic_pdf' | 'anthropic_image' | 'local_mammoth' | 'local_text' };
};

// ───────────────────────── helpers
function parseDataUri(dataUri: string): { mime: string; base64: string; buffer: Buffer } {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUri);
  if (!match) throw new Error('Data URI inválida');
  const [, mime, base64] = match;
  return { mime, base64, buffer: Buffer.from(base64, 'base64') };
}

async function uploadAnthropicFile(buffer: Buffer, filename: string, mime: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada');

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mime }), filename);
  form.append('purpose', 'messages');

  const res = await fetch('https://api.anthropic.com/v1/files', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload a Anthropic falló: ${res.status} ${errText}`);
  }

  const json = await res.json() as { id: string };
  return json.id;
}

async function callAnthropicWithAttachment(fileId: string, prompt: string, model: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      attachments: [
        {
          file_id: fileId,
          tools: [{ type: 'document' }],
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Anthropic messages error: ${res.status} ${JSON.stringify(json)}`);
  }

  const blocks = json?.content ?? [];
  const textBlock = blocks.find((b: any) => b.type === 'text') || blocks.find((b: any) => b.text);
  return textBlock?.text || '';
}

async function callAnthropicWithImage(buffer: Buffer, mime: string, prompt: string, model: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const allowed = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
  let mediaType = mime;
  let out = buffer;

  if (!allowed.has(mime)) {
    out = await sharp(buffer).png().toBuffer();
    mediaType = 'image/png';
  }

  const base64 = out.toString('base64');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'input_image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64,
              },
            },
          ],
        },
      ],
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Anthropic image error: ${res.status} ${JSON.stringify(json)}`);
  }

  const blocks = json?.content ?? [];
  const textBlock = blocks.find((b: any) => b.type === 'text') || blocks.find((b: any) => b.text);
  return textBlock?.text || '';
}


// ───────────────────────── entrypoint
export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
  const { fileDataUri } = InputSchema.parse(input);

  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620';
  const { mime, buffer } = parseDataUri(fileDataUri);

  try {
    if (mime.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        const result = await mammoth.extractRawText({ buffer });
        return { ok: true, extractedText: result.value, meta: { model, strategy: 'local_mammoth' } };
    }

    if (mime === 'application/pdf') {
      const fileId = await uploadAnthropicFile(buffer, 'document.pdf', mime);
      const text = await callAnthropicWithAttachment(
        fileId,
        'Extrae TODO el texto del PDF en orden de lectura. Devuelve únicamente texto plano UTF-8, sin notas ni resumen.',
        model
      );
      if (text && text.trim().length > 0) {
        return { ok: true, extractedText: text, meta: { model, strategy: 'anthropic_pdf' } };
      }
      return { ok: false, error: 'No se pudo extraer texto del PDF con Claude.', meta: { model, strategy: 'anthropic_pdf' } };
    }

    if (mime.startsWith('image/')) {
      const text = await callAnthropicWithImage(
        buffer,
        mime,
        'Lee el texto presente en la imagen y devuélvelo como texto plano.',
        model
      );
      return { ok: true, extractedText: text, meta: { model, strategy: 'anthropic_image' } };
    }

    if (mime.startsWith('text/')) {
      return { ok: true, extractedText: buffer.toString('utf-8'), meta: { model, strategy: 'local_text' } };
    }

    return { ok: false, error: `Tipo de archivo no soportado: ${mime}` };
  } catch (err: any) {
    console.error(`Error in extractTextFromFile for mime type ${mime}:`, err);
    return { ok: false, error: `Failed to extract text: ${err.message}` };
  }
}