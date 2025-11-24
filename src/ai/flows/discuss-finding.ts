
'use server';
import { z } from 'zod';
import { type FindingWithStatus } from './compliance-scoring';
import { ai } from '@/ai/genkit';
import { type GenerateRequest } from 'genkit';

// Model configuration
const MODELS = {
  primary: 'anthropic/claude-sonnet-4-5-20250929',
  fallback: 'googleai/gemini-2.5-pro',
} as const;

// Schemas
const DiscussionMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type DiscussionMessage = z.infer<typeof DiscussionMessageSchema>;

const DiscussFindingInputSchema = z.object({
  finding: z.custom<FindingWithStatus>().describe("The full finding object that is being discussed."),
  history: z.array(DiscussionMessageSchema).describe("The history of the conversation so far."),
});
export type DiscussFindingInput = z.infer<typeof DiscussFindingInputSchema>;

const DiscussFindingOutputSchema = z.object({
  reply: z.string().describe("The assistant's argumentative and professional reply."),
  outcome: z.enum(['user_wins', 'ai_wins', 'ongoing']).optional().describe("Result of the discussion"),
  suggestedModuleInstruction: z.string().optional().describe("New instruction to add to module if user wins"),
  confidence: z.number().min(0).max(1).optional().describe("AI confidence in its position"),
});
export type DiscussFindingOutput = z.infer<typeof DiscussFindingOutputSchema>;

// Helper function to generate with fallback
async function generateWithFallback(request: GenerateRequest): Promise<string> {
  try {
    // Try primary model (Claude)
    const primaryRequest = { ...request, model: MODELS.primary };
    console.log('Calling Claude API...');
    const response = await ai.generate(primaryRequest);
    return response.text;
  } catch (primaryError) {
    console.warn('Primary model (Claude) failed, trying fallback (Gemini):', primaryError);
    // Fallback to Gemini
    const fallbackRequest = { ...request, model: MODELS.fallback };
    console.log('Calling Gemini API (fallback)...');
    const response = await ai.generate(fallbackRequest);
    return response.text;
  }
}

// Función principal usando Claude con fallback a Gemini
export async function discussFinding(input: DiscussFindingInput): Promise<DiscussFindingOutput> {
  try {
    console.log('=== DEBUGGING discussFinding (Claude) ===');
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

CONTEXTO DEL HALLAZGO ORIGINAL:
- Evidencia: "${input.finding.evidencia}"
- Justificación Legal: ${input.finding.justificacion_legal}
- Justificación Técnica: ${input.finding.justificacion_tecnica}
- Normativa: ${input.finding.nombre_archivo_normativa}, artículo ${input.finding.articulo_o_seccion}
- Consecuencias Estimadas: ${input.finding.consecuencia_estimada}

TU ROL:
Eres un auditor profesional que evalúa argumentos de forma objetiva e imparcial. Tu objetivo NO es defender el hallazgo a toda costa, sino determinar si el argumento del usuario tiene mérito.

CRITERIOS PARA ACEPTAR EL ARGUMENTO DEL USUARIO (si cumple AL MENOS UNO):
1. Presenta evidencia documental concreta que contradice el hallazgo
2. Cita artículos específicos de normativa que excepcionan el caso
3. Demuestra un contexto operacional especial legalmente justificado
4. Presenta jurisprudencia o doctrina aplicable que respalda su posición
5. Identifica un error factual en el hallazgo original

INSTRUCCIONES DE RESPUESTA:
- Mantén un tono profesional y colaborativo.
- Si el argumento del usuario es SÓLIDO y cumple alguno de los criterios anteriores, RECONÓCELO claramente y acepta que el hallazgo debe ser eliminado.
- Si el argumento es parcialmente válido pero incompleto, indica qué información adicional necesitas.
- Si el argumento es débil o sin fundamento, explica por qué el hallazgo se mantiene.
- Sé conciso: responde en un máximo de 150 palabras.`;

    const messagesForApi = input.history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const request: GenerateRequest = {
      model: MODELS.primary, // Will be overwritten by generateWithFallback
      prompt: '',
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
      history: messagesForApi.slice(0, -1),
      systemInstruction: systemPrompt,
    };

    const lastUserMsg = messagesForApi[messagesForApi.length-1];
    if(lastUserMsg) {
      request.prompt = lastUserMsg.parts[0].text || '';
    }

    const reply = await generateWithFallback(request);

    console.log('Response length:', reply.length);
    console.log('Response preview:', reply.substring(0, 100) + '...');

    return { reply };

  } catch (error: unknown) {
    console.error('=== ERROR in discussFinding ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);

    const fallbackResponse = `Ocurrió un error al contactar al asistente de IA. Por favor, revisa la configuración y tu conexión a internet.`;

    return { reply: `[FALLBACK] ${fallbackResponse}` };
  }
}

/**
 * Evalúa si el argumento del usuario es suficientemente sólido para ganar la discusión
 */
async function evaluateUserArgument(
  finding: FindingWithStatus,
  userArgument: string
): Promise<{ userWins: boolean; confidence: number; reason: string }> {
  try {
    const evaluationPrompt = `Eres un juez imparcial en una discusión sobre compliance normativo.

HALLAZGO ORIGINAL:
- Título: ${finding.titulo_incidencia}
- Gravedad: ${finding.gravedad}
- Evidencia: "${finding.evidencia}"
- Justificación legal: ${finding.justificacion_legal}
- Normativa: ${finding.nombre_archivo_normativa}, art. ${finding.articulo_o_seccion}

ARGUMENTO DEL USUARIO:
"${userArgument}"

Evalúa si el argumento del usuario es suficientemente sólido para DESESTIMAR y ELIMINAR el hallazgo.

CRITERIOS PARA QUE EL USUARIO GANE (si cumple AL MENOS UNO, userWins=true):
1. Presenta evidencia documental concreta que contradice el hallazgo
2. Cita artículos específicos de normativa que excepcionan el caso
3. Demuestra un contexto operacional especial legalmente justificado
4. Presenta jurisprudencia o doctrina aplicable que respalda su posición
5. Identifica un error factual en el hallazgo original

IMPORTANTE: Sé justo y objetivo. Si el usuario presenta un argumento válido y bien fundamentado, reconócelo con userWins=true y confidence alta.

Responde en JSON:
{
  "userWins": boolean,
  "confidence": number (0-1),
  "reason": "explicación breve de por qué gana o no el usuario"
}`;

    const reply = await generateWithFallback({
      model: MODELS.primary,
      prompt: evaluationPrompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const result = JSON.parse(reply);
    return {
      userWins: result.userWins || false,
      confidence: result.confidence || 0,
      reason: result.reason || '',
    };
  } catch (error) {
    console.error('Error evaluating user argument:', error);
    return { userWins: false, confidence: 0, reason: 'Error en evaluación' };
  }
}

/**
 * Genera una nueva instrucción para el módulo basada en el argumento ganador del usuario
 */
async function generateModuleInstruction(
  finding: FindingWithStatus,
  userArgument: string
): Promise<string> {
  try {
    const instructionPrompt = `Basándote en el siguiente caso donde el usuario ganó la discusión, genera una instrucción concisa para agregar al módulo de validación que evite futuros falsos positivos similares.

HALLAZGO ORIGINAL (FALSO POSITIVO):
- Título: ${finding.titulo_incidencia}
- Evidencia: "${finding.evidencia}"
- Normativa: ${finding.nombre_archivo_normativa}, art. ${finding.articulo_o_seccion}

ARGUMENTO GANADOR DEL USUARIO:
"${userArgument}"

Genera una instrucción clara, específica y accionable (máximo 150 palabras) que se agregará a las instrucciones del módulo.

Formato:
"En casos donde [contexto específico], NO marcar como hallazgo si [condición], debido a [justificación legal/técnica]."

Ejemplo:
"En casos donde se solicite la presentación de garantías bancarias, NO marcar como hallazgo si el pliego especifica modalidades alternativas de garantía (pólizas de seguro de caución, fianzas), debido a que el art. 123 de la Ley 80/93 permite garantías equivalentes."

Genera solo la instrucción, sin preámbulos.`;

    const reply = await generateWithFallback({
      model: MODELS.primary,
      prompt: instructionPrompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 300,
      },
    });

    return reply.trim();
  } catch (error) {
    console.error('Error generating module instruction:', error);
    return '';
  }
}

/**
 * Guarda una nueva instrucción en el módulo del usuario
 */
async function saveModuleInstruction(
  userId: string,
  moduleId: string,
  instruction: string
): Promise<void> {
  try {
    // Por ahora guardamos en localStorage, luego será en BD
    const storageKey = `module-instructions-${userId}-${moduleId}`;
    const existing = localStorage.getItem(storageKey);
    const instructions = existing ? JSON.parse(existing) : [];

    instructions.push({
      instruction,
      createdAt: new Date().toISOString(),
      source: 'discussion_win',
    });

    localStorage.setItem(storageKey, JSON.stringify(instructions));
    console.log('✅ Module instruction saved:', instruction);
  } catch (error) {
    console.error('Error saving module instruction:', error);
  }
}

// Server Action for the client component
export async function discussFindingAction(
  history: DiscussionMessage[],
  finding: FindingWithStatus
): Promise<{
  reply: string;
  outcome?: 'user_wins' | 'ai_wins' | 'ongoing';
  suggestedModuleInstruction?: string;
}> {
    try {
        console.log('Starting discussFindingAction with Genkit/Gemini');

        if (!history || history.length === 0) {
            return {
                reply: "Para iniciar la discusión sobre este hallazgo, presenta tu argumento o punto de vista sobre por qué consideras que esta incidencia no debería aplicar o requiere modificación.",
                outcome: 'ongoing',
            };
        }

        const lastUserMessage = history[history.length - 1];
        if (lastUserMessage.role !== 'user') {
            return {
                reply: "Espero tu argumento para poder responder y discutir este hallazgo contigo.",
                outcome: 'ongoing',
            };
        }

        // Si es el segundo mensaje del usuario o posterior, evaluamos si puede ganar
        const userMessages = history.filter(m => m.role === 'user');
        if (userMessages.length >= 2) {
            const evaluation = await evaluateUserArgument(finding, lastUserMessage.content);

            if (evaluation.userWins && evaluation.confidence > 0.6) {
                // El usuario ganó la discusión - el hallazgo será eliminado
                const instruction = await generateModuleInstruction(finding, lastUserMessage.content);

                return {
                    reply: `**Hallazgo eliminado.** Tu argumento es válido y bien fundamentado.\n\n**Razón:** ${evaluation.reason}\n\nEste hallazgo ha sido removido del análisis. Además, se ha generado una nueva instrucción para el módulo que evitará este tipo de falsos positivos en futuros análisis.`,
                    outcome: 'user_wins',
                    suggestedModuleInstruction: instruction,
                };
            }
        }

        // Continuar la discusión normalmente
        const result = await discussFinding({ history, finding });

        return {
            reply: result.reply,
            outcome: result.outcome || 'ongoing',
            suggestedModuleInstruction: result.suggestedModuleInstruction,
        };

    } catch (error: unknown) {
        console.error('Error in discussFindingAction:', error);
        
        const lastMessage = history && history.length > 0 ? history[history.length - 1] : null;
        const userContent = lastMessage && lastMessage.role === 'user' ? lastMessage.content : 'su argumento';
        
        const manualResponse = `Comprendo tu punto sobre "${userContent}". Sin embargo, el hallazgo "${finding.titulo_incidencia}" se mantiene válido según ${finding.nombre_archivo_normativa}, artículo ${finding.articulo_o_seccion}.

${finding.justificacion_legal}

Para cambiar esta evaluación, necesito una base legal específica. ¿Puedes citar artículos de la normativa que respalden tu posición?`;

        return {
            reply: manualResponse,
            outcome: 'ongoing',
        };
    }
}
