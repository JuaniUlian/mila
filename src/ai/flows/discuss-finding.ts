
'use server';
console.error('🔥🔥🔥 DISCUSS-FINDING EJECUTÁNDOSE 🔥🔥🔥');
import { z } from 'zod';
import { type FindingWithStatus } from './compliance-scoring';
import { ai } from '@/ai/genkit';
import { type GenerateRequest } from 'genkit';

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

// Función principal usando Genkit con Gemini
export async function discussFinding(input: DiscussFindingInput): Promise<DiscussFindingOutput> {
  try {
    console.log('=== DEBUGGING discussFinding (Gemini) ===');
    console.log('History length:', input.history?.length);

    if (!input.history || input.history.length === 0) {
      return {
        reply: 'Para iniciar la discusión sobre este hallazgo, presenta tu argumento o punto de vista sobre por qué consideras que esta incidencia no debería aplicar.'
      };
    }

    const lastMessage = input.history[input.history.length - 1];
    if (lastMessage.role !== 'user') {
      return {
        reply: 'Espero tu argumento para poder responder y discutir este hallazgo contigo.'
      };
    }
    console.log('User message:', lastMessage.content);

    const systemPrompt = `Se ha detectado la siguiente incidencia: "${input.finding.titulo_incidencia}".
El usuario argumenta: "${lastMessage.content}".
Tu trabajo es contra-argumentar profesionalmente para mantener el hallazgo, basándote en el contexto del mismo.
No cedas a menos que el usuario proponga argumentos o información contundente que ameriten desestimar el hallazgo.

CONTEXTO DEL HALLAZGO ORIGINAL:
- Evidencia: "${input.finding.evidencia}"
- Justificación Legal: ${input.finding.justificacion_legal}
- Justificación Técnica: ${input.finding.justificacion_tecnica}
- Normativa: ${input.finding.nombre_archivo_normativa}, artículo ${input.finding.articulo_o_seccion}
- Consecuencias Estimadas: ${input.finding.consecuencia_estimada}

INSTRUCCIONES DE RESPUESTA:
- Mantén un tono profesional, colaborativo pero firme. No acuses.
- Tu objetivo es proteger al usuario y la integridad del proceso.
- Si el usuario presenta argumentos válidos, reconócelos, pero pide evidencia concreta o sustento normativo adicional.
- Desafía argumentos débiles pidiendo bases legales o técnicas específicas.
- Sé conciso: responde en un máximo de 150 palabras.`;

    const messagesForApi = input.history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user', // Map to Gemini roles
      parts: [{ text: msg.content }],
    }));

    const request: GenerateRequest = {
      model: 'googleai/gemini-1.5-pro',
      prompt: '', // Prompt is constructed from history and system instruction
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
      history: messagesForApi.slice(0, -1), // All but the last message
      systemInstruction: systemPrompt,
    };
    
    // Add the last user message to the prompt itself
    const lastUserMsg = messagesForApi[messagesForApi.length-1];
    if(lastUserMsg) {
      request.prompt = lastUserMsg.parts[0].text || '';
    }

    console.log('Calling Gemini API...');
    const response = await ai.generate(request);
    const reply = response.text;
    
    console.log('Gemini response length:', reply.length);
    console.log('Gemini response preview:', reply.substring(0, 100) + '...');

    return { reply };

  } catch (error: unknown) {
    console.error('=== ERROR in discussFinding (Gemini) ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    
    const fallbackResponse = `Ocurrió un error al contactar al asistente de IA. Por favor, revisa la configuración y tu conexión a internet.`;
    
    return { reply: `[FALLBACK] ${fallbackResponse}` };
  }
}

// Server Action for the client component
export async function discussFindingAction(history: DiscussionMessage[], finding: FindingWithStatus): Promise<string> {
    try {
        console.log('Starting discussFindingAction with Genkit/Gemini');

        if (!history || history.length === 0) {
            return "Para iniciar la discusión sobre este hallazgo, presenta tu argumento o punto de vista sobre por qué consideras que esta incidencia no debería aplicar o requiere modificación.";
        }

        const lastUserMessage = history[history.length - 1];
        if (lastUserMessage.role !== 'user') {
            return "Espero tu argumento para poder responder y discutir este hallazgo contigo.";
        }

        const result = await discussFinding({ history, finding });
        
        return result.reply;

    } catch (error: unknown) {
        console.error('Error in discussFindingAction:', error);
        
        const lastMessage = history && history.length > 0 ? history[history.length - 1] : null;
        const userContent = lastMessage && lastMessage.role === 'user' ? lastMessage.content : 'su argumento';
        
        const manualResponse = `Comprendo tu punto sobre "${userContent}". Sin embargo, el hallazgo "${finding.titulo_incidencia}" se mantiene válido según ${finding.nombre_archivo_normativa}, artículo ${finding.articulo_o_seccion}. 

${finding.justificacion_legal}

Para cambiar esta evaluación, necesito una base legal específica. ¿Puedes citar artículos de la normativa que respalden tu posición?`;
        
        return manualResponse;
    }
}
