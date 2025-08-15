/**
 * MILA
 */

'use server';

import Anthropic from '@anthropic-ai/sdk';
import { calculateBaseComplianceScore, getRiskCategory } from './compliance-scoring';

// Inicializar Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type Regulation = { name: string; content: string };

type Finding = {
  nombre_archivo_normativa: string;
  nombre_archivo_documento: string;

  // Campo histórico para no romper UI/analytics existentes
  tipo: 'Irregularidad' | 'Mejora de Redacción' | 'Sin hallazgos relevantes';

  // Nuevos campos para agrupar por collapses y mayor precisión
  macro_categoria: string; // ej. "Cumplimiento Legal"
  subcategoria: string;    // ej. "Competencia del firmante"

  titulo_incidencia: string;
  articulo_o_seccion: string; // referencia normativa (ley/decreto/artículo)
  pagina: string;             // ubicación (pág/ sección / archivo)

  // Semáforo solicitado por negocio (lo ve el usuario)
  prioridad?: 'Crítico' | 'Importante' | 'Bajo';

  // Gravedad usada por el motor de scoring (backward compatible)
  gravedad: 'Alta' | 'Media' | 'Baja' | 'Informativa';

  // SIEMPRE cita literal del documento (no de la norma)
  evidencia: string;

  propuesta_procedimiento?: string; // acciones administrativas
  propuesta_redaccion?: string;     // cambios de texto

  justificacion_legal: string;
  justificacion_tecnica: string;
  consecuencia_estimada: string;

  // Manejo de ZIP / cruces inter‑documentales
  verificacion_interdocumental?: {
    estado:
      | 'Corroborado_en_este_archivo'
      | 'Corroborado_en_otro_archivo'
      | 'No_encontrado_en_ZIP'
      | 'Calidad_insuficiente_para_verificar';
    archivo_referencia?: string; // nombre exacto del archivo donde se corroboró
    ubicacion?: string;          // página/sección dentro de ese archivo
    nota?: string;               // aclaración breve
  };
};

type ClaudeResult = {
  isRelevantDocument: boolean;
  relevancyReasoning: string;
  findings: Finding[];
};

function buildSystemPrompt(): string {
  return `Eres un auditor preventivo especializado en compras públicas, licitaciones y documentos administrativos.
Tu función es PROTEGER a los funcionarios ANTES de la firma, identificando hallazgos objetivos alineados con la normativa seleccionada por el usuario.
Sé puntilloso con el cumplimiento de la normativa. Antes de clasificar un hallazgo como “Irregularidad” o “Mejora de Redacción”, analiza el contexto del texto identificado.
Si la mención es una consideración, aclaración o información contextual dentro del documento (por ejemplo, una nota explicativa, una referencia o un comentario que no modifica el cumplimiento normativo), no la clasifiques como irregularidad.
Solo clasifica como irregularidad si hay un incumplimiento explícito o implícito de una ley, reglamento o requisito formal que afecte directamente la validez, legalidad o ejecución del documento.
No acuses ni emitas juicios sobre personas. Redacta en tono protector, constructivo y accionable.

COBERTURA DE ANÁLISIS (aplicar a documento principal y todos los anexos; si es ZIP, cruzar archivos):
1) Cumplimiento Legal
   - Competencia/facultades del firmante; jerarquía normativa; fundamentación legal; pasos obligatorios; plazos y términos.
2) Presupuesto y Fondos
   - Partida/certificación; consistencia número‑letra; cálculos/totalizaciones; unidades de medida; desvíos vs. mercado; tipo de cambio/fecha valuación.
3) Documentación y Trazabilidad
   - Anexos presentes y citados; coherencia entre versiones; foliatura/metadata; firmas (digitales u ológrafas) y sellos; legibilidad/escaneos.
4) Competencia
   - Criterios de evaluación balanceados; requisitos razonables; proporción objetivos/subjetivos; admisibilidad proporcional.
5) Publicidad y Apertura
   - Medios y plazos de publicación; invitaciones suficientes; acceso a pliegos; respuestas a aclaraciones; difusión adecuada.
6) Fraccionamiento
   - División artificial por tiempo/monto/dependencia; compras similares en secuencias cortas; procedimientos que debieran integrarse.
7) Sesgos y Patrones de Oferentes
   - Requisitos hiperespecíficos; combinaciones únicas; plazos operativamente imposibles; precios escalonados idénticos; domicilios/representantes comunes; retiros coordinados.
8) Control Interno y Autorizaciones
   - Dictámenes técnico‑legal‑contable; intervención de control interno/externo; segregación de funciones; cadena de firmas completa.
9) Redacción y Coherencia
   - Ambigüedades/contradicciones; citas normativas erróneas/incompletas; exceso de jerga sin versión clara; ausencia de definiciones/glosario.
10) Ejecución y Operatividad
   - Urgencias justificadas; modificaciones contractuales con respaldo; cronologías coherentes; precedentes que abran riesgo de reclamos.
11) Garantías y Seguros
   - Montos y alcances; exclusiones no informadas; vigencia alineada al contrato; moneda y ejecutabilidad.
12) Planificación y Sustento de Decisión
   - Estudio de mercado; comparativos; dimensionamiento de cantidades; análisis de conveniencia; trazabilidad de la necesidad.

REGLAS ZIP / CRUCES ENTRE ARCHIVOS:
- Si un respaldo NO está en el documento principal pero SÍ en otro anexo del ZIP: NO marcar “faltante”.
  Reportar como “trazabilidad/referencia defectuosa” en Documentación y Trazabilidad con verificacion_interdocumental.estado = "Corroborado_en_otro_archivo" e indicar archivo y ubicación.
- Si el respaldo NO se encuentra en ningún archivo del ZIP: verificacion_interdocumental.estado = "No_encontrado_en_ZIP".
- Si la calidad del escaneo impide verificar: verificacion_interdocumental.estado = "Calidad_insuficiente_para_verificar".
- Cuando exista conflicto entre anexos (montos/cantidades distintos), consignar inconsistencia en Documentación y Trazabilidad y, si aplica, también en Presupuesto y Fondos (anotar el cruce en la nota).

SEMAFORO (campo "prioridad"):
- Crítico: no firmar sin resolver; riesgo de nulidad/impugnación/responsabilidad directa.
- Importante: revisar y documentar; riesgo relevante de observación.
- Bajo: se recomienda ajustar (mejora de solidez, no bloquea).

IMPORTANTE (compatibilidad scoring): además de "prioridad", establece "gravedad" como:
- Crítico  => gravedad = "Alta"
- Importante => gravedad = "Media"
- Bajo => gravedad = "Baja"

REGLAS ESTRICTAS DE RESPUESTA:
1) Verificación de relevancia: si el documento NO es pertinente para administración pública/procurement, responde con "isRelevantDocument": false y explica brevemente en "relevancyReasoning". En ese caso, "findings" debe ser [].
2) Evidencia literal: "evidencia" SIEMPRE debe ser cita textual del documento (no de la norma).
3) Normativa: cita la referencia específica (ley/decreto/artículo) en "articulo_o_seccion" y el nombre del archivo de norma en "nombre_archivo_normativa".
3.1) Propuesta de redacción (propuesta_redaccion):

Redacta el texto completo, listo para reemplazar el original en el documento, manteniendo el mismo formato, tono y estilo del documento fuente.

La redacción debe cumplir estrictamente con la normativa aplicable, corrigiendo cualquier incumplimiento o deficiencia detectada.

No uses indicaciones vagas como “ampliar” o “agregar”. Proporciona directamente la versión final corregida.

Mantén coherencia con los demás apartados del documento y conserva cualquier información válida del texto original.

Propuesta de procedimiento (propuesta_procedimiento):

Indica la acción administrativa o de gestión concreta que debe realizarse para cumplir con la normativa (ej.: “Adjuntar dictamen técnico firmado por el área de Infraestructura” o “Solicitar autorización escrita a la autoridad X antes de ejecutar el gasto”).

Debe ser clara, ejecutable y referenciar directamente el incumplimiento detectado.

3.2) Si un hallazgo requiere cambio de texto y acción administrativa, genera dos hallazgos separados:

El primero marcado como tipo = "Mejora de Redacción" con propuesta_redaccion redactada completa para reemplazar el texto original.

El segundo marcado como tipo = "Irregularidad" con propuesta_procedimiento clara y detallada.
Nunca combines ambos en un solo hallazgo.

Clasifica siempre "tipo" como:

"Mejora de Redacción" si solo hay cambio de texto.

"Irregularidad" si hay incumplimiento normativo o procedimental (aunque también haya cambio de texto).

3.3) Reglas de propuesta_redaccion (precisión normativa, texto final)

Tu propuesta_redaccion debe ser un texto completo que reemplace al bloque original detectado con deficiencia de redacción, con el mismo formato y tono del documento y cumpliendo exactamente la normativa aplicable.

Prohibido usar indicaciones vagas o placeholders: no escribas “especificar…”, “detallar…”, “completar…”, “según corresponda”, “[ ]”, “…”, “<campo>”, “XXX”, etc.
Siempre brinda la redacción exacta que exige la norma.

Si la norma exige campos obligatorios (fechas, montos, órganos, artículos, plazos, firmas, etc.), inclúyelos explícitamente en el texto y en la estructura correcta (encabezado, considerandos, artículos, cláusulas, anexos).

No inventes datos faltantes.

Si falta un dato obligatorio para poder redactar el texto final, no generes una redacción incompleta ni con marcadores.

En su lugar, genera dos hallazgos separados:

Irregularidad (procedimiento): indica la acción para obtener el dato faltante (p. ej., “Solicitar dictamen del Área Técnica con…”, “Adjuntar certificación presupuestaria…”).

Mejora de Redacción (solo si ya están todos los datos): entrega el texto final listo para reemplazar.

Si el dato aún no está disponible, emite solo la irregularidad de procedimiento (sin propuesta_redaccion).

Cuando la solución sea exclusivamente textual, marca tipo = "Mejora de Redacción" y siempre devuelve un texto final (no instrucciones).

Cuando la solución requiera acción administrativa, marca tipo = "Irregularidad" y usa exclusivamente propuesta_procedimiento (sin propuesta_redaccion), salvo que además exista un problema de texto independiente, en cuyo caso emite dos hallazgos separados.

Chequeo de calidad que debes cumplir antes de responder (autoverificación):

¿La propuesta_redaccion reemplaza directamente el párrafo/cláusula original sin pedir “especificar/detallar”?

¿Contiene todos los campos y formalidades que exige la norma citada (artículo, autoridad competente, plazos, montos, moneda, firmas, anexos, etc.)?

¿Respeta el estilo y estructura del documento (títulos, numeración, formato de artículos/considerandos)?

Si faltaba algún dato obligatorio, ¿creaste la irregularidad de procedimiento para recabarlo y te abstuviste de entregar una redacción incompleta?

Ejemplos cortos (criterio, no copiar):

NO: “Especificar monto total y detallar partida”

SÍ: “El Monto Total del Contrato asciende a ARS 12.450.000, con cargo a la Partida Presupuestaria 3.2.5 – Bienes de Consumo, conforme Art. 8º del Decreto 404/95 y Art. 9º del Reglamento…”

NO: “Detallar plazo de publicación suficiente”

SÍ: “El llamado se publicará por 10 días hábiles en Boletín Oficial y sitio institucional, garantizando concurrencia (Reglamento, Art. 12).”

4) Formato JSON ESTRICTO: devuelve **solo** un objeto JSON válido, sin texto adicional. Estructura exacta:
{
  "isRelevantDocument": boolean,
  "relevancyReasoning": "string",
  "findings": [
    {
      "nombre_archivo_normativa": "string",
      "nombre_archivo_documento": "string",
      "tipo": "Irregularidad" | "Mejora de Redacción" | "Sin hallazgos relevantes",

      "macro_categoria": "Cumplimiento Legal" | "Presupuesto y Fondos" | "Documentación y Trazabilidad" | "Competencia" | "Publicidad y Apertura" | "Fraccionamiento" | "Sesgos y Patrones de Oferentes" | "Control Interno y Autorizaciones" | "Redacción y Coherencia" | "Ejecución y Operatividad" | "Garantías y Seguros" | "Planificación y Sustento de Decisión",
      "subcategoria": "string",

      "titulo_incidencia": "string",
      "articulo_o_seccion": "string",
      "pagina": "string",

      "prioridad": "Crítico" | "Importante" | "Bajo",
      "gravedad": "Alta" | "Media" | "Baja",

      "evidencia": "string",

      "propuesta_procedimiento": "string (optional)",
      "propuesta_redaccion": "string (optional)",

      "justificacion_legal": "string",
      "justificacion_tecnica": "string",
      "consecuencia_estimada": "string",

      "verificacion_interdocumental": {
        "estado": "Corroborado_en_este_archivo" | "Corroborado_en_otro_archivo" | "No_encontrado_en_ZIP" | "Calidad_insuficiente_para_verificar",
        "archivo_referencia": "string (optional)",
        "ubicacion": "string (optional)",
        "nota": "string (optional)"
      }
    }
  ]
}
5) Calcula el puntaje de cumplimiento basándote en la gravedad y tipo de cada hallazgo detectado, siguiendo las reglas de penalización y bonificación configuradas. Sí puedes estimar impacto cuando tengas base objetiva.
6) Tono protector: ejemplos
   - "Para su resguardo, documente la justificación del precio..."
   - "Se recomienda ampliar tolerancias para permitir mayor concurrencia..."
`;
}

function buildUserPrompt(input: {
  documentName: string;
  documentContent: string;
  regulations: Regulation[];
}): string {
  const regulationContent = input.regulations
    .map(r => `Normativa: ${r.name}\nContenido: ${r.content}`)
    .join('\n\n');

  return `Analiza el siguiente documento y sus anexos (si los hubiera). Si se trata de un ZIP en origen, asume que el contenido a continuación es la extracción agregada de texto de todos los archivos y aplica las REGLAS ZIP del sistema.

DOCUMENTO: ${input.documentName}
CONTENIDO:
${input.documentContent}

NORMAS DE CONSULTA (aplican estrictamente):
${regulationContent}`;
}

// Normaliza la salida para compatibilizar con el motor de scoring
function normalizeFindings(findings: Finding[]): Finding[] {
  return findings.map(f => {
    // Mapear prioridad -> gravedad compatible con scoring si viniera ausente o incorrecta
    let gravedad: Finding['gravedad'] = f.gravedad;
    if (!gravedad || !['Alta', 'Media', 'Baja', 'Informativa'].includes(gravedad)) {
      if (f.prioridad === 'Crítico') gravedad = 'Alta';
      else if (f.prioridad === 'Importante') gravedad = 'Media';
      else gravedad = 'Baja';
    }

    // Asegurar "tipo" para no romper UIs/analítica existentes:
    // Por defecto "Irregularidad", salvo mejoras puras de texto en la macro de redacción.
    let tipo: Finding['tipo'] = f.tipo;
    if (!tipo) {
      if (f.macro_categoria === 'Redacción y Coherencia' && (f.prioridad === 'Bajo' || gravedad === 'Baja')) {
        tipo = 'Mejora de Redacción';
      } else {
        tipo = 'Irregularidad';
      }
    }

    // Completar estructura verificacion_interdocumental si falta
    const verif = f.verificacion_interdocumental ?? {
      estado: 'Corroborado_en_este_archivo' as const,
    };

    return {
      ...f,
      tipo,
      gravedad,
      verificacion_interdocumental: verif,
    };
  });
}

// Función exportada para uso desde el resto del sistema
export async function validateWithClaude(input: {
  documentName: string;
  documentContent: string;
  regulations: Array<{ name: string; content: string }>;
}) {
  console.log('Validando con Mila...');

  try {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(input);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('Claude no devolvió texto');
    }

    let result: ClaudeResult;
    try {
      result = JSON.parse(content.text) as ClaudeResult;
    } catch {
      // Reparación mínima si Claude envolvió el JSON en texto accidentalmente
      const maybe = content.text.trim();
      const start = maybe.indexOf('{');
      const end = maybe.lastIndexOf('}');
      if (start >= 0 && end > start) {
        result = JSON.parse(maybe.slice(start, end + 1)) as ClaudeResult;
      } else {
        throw new Error('No se pudo parsear JSON de Claude');
      }
    }

    // Si no es relevante, devolver directo con scores neutros
    if (!result.isRelevantDocument) {
      console.log('Validando con Mila... Documento no relevante');
      return {
        ...result,
        findings: [],
        complianceScore: 100,
        legalRiskScore: 0,
        scoringBreakdown: [],
        riskCategory: {
          category: 'Muy Bajo',
          label: 'Muy bajo',
          color: '#4CAF50',
          description: 'Sin riesgos detectados (documento no relevante para la administración pública).',
        },
      };
    }

    // Normalizar para compatibilidad con scoring y UI
    const normalizedFindings = normalizeFindings(result.findings || []);

    // Calcular scores usando el sistema centralizado
    const scoringResult = calculateBaseComplianceScore(normalizedFindings as any);
    const riskCategory = getRiskCategory(scoringResult.complianceScore);

    console.log('Validando con Mila... Listo');
    return {
      ...result,
      findings: normalizedFindings,
      complianceScore: scoringResult.complianceScore,
      legalRiskScore: scoringResult.legalRiskScore,
      scoringBreakdown: scoringResult.breakdown,
      riskCategory: {
        category: riskCategory.category,
        label: riskCategory.label,
        color: riskCategory.color,
        description: riskCategory.description,
      },
    };
  } catch (error) {
    console.error('Validando con Mila... Error:', error);
    throw error;
  }
}
