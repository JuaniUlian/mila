
'use server';
console.error('🔥🔥🔥 DISCUSS-FINDING EJECUTÁNDOSE 🔥🔥🔥');
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

// Función principal usando Claude API
export async function discussFinding(input: DiscussFindingInput): Promise<DiscussFindingOutput> {
  try {
    console.log('=== DEBUGGING discussFinding ===');
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
    console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length);
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

    // Verificar API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('No ANTHROPIC_API_KEY found');
      throw new Error('API key not configured');
    }

    // Construir el system prompt
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

    // Construir mensajes para Claude API
    const messages = input.history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    console.log('Calling Claude API...');
    console.log('System prompt length:', systemPrompt.length);
    console.log('Messages count:', messages.length);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages
      })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error details:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data structure:', Object.keys(data));
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid Claude response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format from Claude API');
    }

    const reply = data.content[0].text;
    console.log('Claude response length:', reply.length);
    console.log('Claude response preview:', reply.substring(0, 100) + '...');

    return { reply };

  } catch (error: unknown) {
    console.error('=== ERROR in discussFinding ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    
    // Fallback con respuesta contextual DIFERENTE
    const lastMessage = input.history[input.history.length - 1];
    const fallbackResponses = [
      `Veo que mencionas "${lastMessage.content}". Sin embargo, el hallazgo sobre "${input.finding.titulo_incidencia}" se mantiene porque la evidencia "${input.finding.evidencia}" no cumple con los estándares requeridos por ${input.finding.nombre_archivo_normativa}. ¿Tienes documentación específica que sustente tu posición?`,
      
      `Tu argumento "${lastMessage.content}" es interesante, pero según ${input.finding.nombre_archivo_normativa}, artículo ${input.finding.articulo_o_seccion}, se requiere mayor sustento. ${input.finding.justificacion_legal} ¿Podrías proporcionar evidencia adicional?`,
      
      `Entiendo tu punto sobre "${lastMessage.content}". No obstante, el hallazgo "${finding.titulo_incidencia}" se basa en criterios técnicos específicos. ${input.finding.justificacion_tecnica} ¿Qué elementos consideras que deberían modificar esta evaluación?`
    ];

    // Usar una respuesta aleatoria para variar
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return { reply: `[FALLBACK] ${randomResponse}` };
  }
}

// Server Action for the client component
export async function discussFindingAction(history: DiscussionMessage[], finding: FindingWithStatus): Promise<string> {
    try {
        console.log('Starting discussFindingAction with Claude API');

        if (!history || history.length === 0) {
            return "Para iniciar la discusión sobre este hallazgo, presenta tu argumento o punto de vista sobre por qué consideras que esta incidencia no debería aplicar o requiere modificación.";
        }

        const lastUserMessage = history[history.length - 1];
        if (lastUserMessage.role !== 'user') {
            return "Espero tu argumento para poder responder y discutir este hallazgo contigo.";
        }

        // Use the discussFinding function to get the reply
        const result = await discussFinding({ history, finding });
        
        // Return only the string reply
        return result.reply;

    } catch (error: unknown) {
        console.error('Error in discussFindingAction:', error);
        
        const lastMessage = history && history.length > 0 ? history[history.length - 1] : null;
        const userContent = lastMessage && lastMessage.role === 'user' ? lastMessage.content : 'su argumento';
        
        const manualResponse = `Comprendo tu punto sobre "${userContent}". Sin embargo, el hallazgo "${finding.titulo_incidencia}" se mantiene válido según ${finding.nombre_archivo_normativa}, artículo ${finding.articulo_o_seccion}. 

${finding.justificacion_legal}

Para cambiar esta evaluación, necesito una base legal específica. ¿Puedes citar artículos de la normativa que respalden tu posición?`;
        
        // In case of an error, return a simple string response.
        return manualResponse;
    }
}
    
