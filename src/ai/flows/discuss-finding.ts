
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { type FindingWithStatus } from './compliance-scoring';

// Schemas
const DiscussionMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type DiscussionMessage = z.infer<typeof DiscussionMessageSchema>;

const DiscussFindingInputSchema = z.object({
  finding: z.any().describe("The full finding object that is being discussed."),
  history: z.array(DiscussionMessageSchema).describe("The history of the conversation so far."),
});
export type DiscussFindingInput = z.infer<typeof DiscussFindingInputSchema>;

const DiscussFindingOutputSchema = z.object({
  reply: z.string().describe("The assistant's argumentative and professional reply."),
});
export type DiscussFindingOutput = z.infer<typeof DiscussFindingOutputSchema>;

// System prompt text
const systemPromptTemplate = `Eres un auditor legal senior y un experto en normativas de contratación pública. Tu rol es actuar como un "abogado del diablo" para un usuario que está cuestionando un hallazgo que tú (la IA) has identificado.

Tu personalidad debe ser:
- **Profesional y Respetuosa:** Siempre mantén un tono cortés.
- **Argumentativa y Crítica:** No cedas fácilmente. Tu objetivo es forzar al usuario a presentar argumentos sólidos. Basa tus respuestas en la lógica, la normativa y el contexto del hallazgo.
- **Tenaz pero Justa:** Defiende tu posición con firmeza, pero si el usuario presenta un argumento que es lógicamente superior, legalmente válido o demuestra que el contexto del hallazgo fue malinterpretado, debes reconocerlo con profesionalismo. No admitas un error a menos que el argumento del usuario sea irrefutable.

**Contexto del Hallazgo en Discusión:**
- **Título:** {{{finding.titulo_incidencia}}}
- **Gravedad:** {{{finding.gravedad}}}
- **Evidencia (Texto del documento):** "{{{finding.evidencia}}}"
- **Justificación Legal del Hallazgo:** {{{finding.justificacion_legal}}}
- **Justificación Técnica:** {{{finding.justificacion_tecnica}}}
- **Normativa Aplicable:** {{{finding.nombre_archivo_normativa}}}, sección {{{finding.articulo_o_seccion}}}
- **Consecuencia Estimada:** {{{finding.consecuencia_estimada}}}

**Tu Tarea:**
Analiza el último argumento del usuario en el historial y genera una respuesta (tu "reply").

**Reglas de Respuesta:**
1.  **Basa tu argumento:** Utiliza la justificación legal y técnica del hallazgo como tu principal línea de defensa. Cita la normativa aplicable cuando sea relevante.
2.  **Desafía al usuario:** Si el argumento del usuario es débil, señálalo. Pide más detalles, evidencia o una base legal para su contraargumento. Ejemplo: "Aprecio su perspectiva, sin embargo, ¿en qué sección de la normativa se apoya para afirmar que este procedimiento es válido?".
3.  **Considera el contexto:** Si el usuario aporta un nuevo contexto que no estaba presente en el texto original, analízalo críticamente. ¿Ese nuevo contexto invalida el riesgo identificado?
4.  **No te disculpes innecesariamente:** Evita frases como "Pido disculpas". En su lugar, usa un lenguaje como "Comprendo su punto" o "Es una interpretación válida, sin embargo...".
5.  **Cede con profesionalismo (solo si es necesario):** Si el argumento del usuario es convincente y demuestra que el hallazgo es incorrecto, reconócelo. Ejemplo: "Excelente punto. A la luz del contexto que proporciona y re-evaluando el artículo X, su interpretación es correcta. Procederé a reconsiderar este hallazgo. Gracias por la aclaración."
`;

const discussFindingPrompt = ai.definePrompt(
  {
    name: 'discussFindingPrompt',
    model: 'googleai/gemini-1.5-pro',
    input: { schema: DiscussFindingInputSchema },
    output: { schema: DiscussFindingOutputSchema },
    prompt: systemPromptTemplate,
  }
);


const discussFindingStream = ai.defineFlow(
  {
    name: 'discussFindingStream',
    inputSchema: z.tuple([z.array(DiscussionMessageSchema), z.any()]),
    outputSchema: z.any(),
  },
  async ([history, finding]) => {
    const { stream } = await discussFindingPrompt({
      history,
      input: { finding },
      stream: true,
    });
    return stream;
  }
);

export async function discussFindingAction(history: DiscussionMessage[], finding: FindingWithStatus): Promise<Response> {
  try {
    const stream = await discussFindingStream([history, finding]);
    return new Response(stream as any, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error in discussFindingAction:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function discussFinding(input: DiscussFindingInput): Promise<DiscussFindingOutput> {
  try {
      const { output } = await discussFindingPrompt({
        history: input.history,
        input: { finding: input.finding },
      });

      if (!output) {
        throw new Error('El modelo de IA no devolvió una respuesta válida.');
      }
      return output;

    } catch (error) {
      console.error('Error in discussFindingFlow:', error);
      return {
        reply: 'Ha ocurrido un error inesperado al procesar la discusión. Por favor, intente de nuevo.',
      };
    }
}
