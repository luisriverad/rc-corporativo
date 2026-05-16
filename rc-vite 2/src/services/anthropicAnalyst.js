// ============================================================
// SERVICIO DE ANÁLISIS CON IA — Claude Opus 4.7
// Llamadas directas desde el navegador con dangerouslyAllowBrowser.
// Streaming + prompt caching para reducir costo de llamadas repetidas.
// ============================================================

import Anthropic from '@anthropic-ai/sdk'

// Sonnet 4.6: ~3-5x más rápido que Opus 4.7 para output de la misma longitud,
// ~5x más barato. Calidad suficiente para análisis de crédito mid-market.
const MODEL = 'claude-sonnet-4-6'

// Lazy client init — solo crear si hay API key
let _client = null
function getClient() {
  if (_client) return _client
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY no está configurada. Crea un archivo .env.local con: VITE_ANTHROPIC_API_KEY=sk-ant-...')
  }
  _client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
  return _client
}

// ─────────────────────────────────────────────────────────────
// System prompt — ULTRA-CONCISO para máxima velocidad.
// Output ~1K tokens en lugar de 4K → respuesta 3-4× más rápida.
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Actúa como analista de crédito empresarial.

Voy a darte un comparativo de Estado de Resultados y Balance General de los años 2024, 2025 y 2026 MTD.

Analiza la información con un solo objetivo: determinar si la empresa tiene capacidad financiera para recibir un crédito.

No hagas un análisis excesivamente largo. Sé claro, directo y ejecutivo.

Analiza únicamente estos puntos:

- **Ventas**: revisa si crecen o caen, y si la tendencia es positiva o preocupante.
- **Rentabilidad**: revisa si la empresa gana dinero, si los márgenes mejoran o se deterioran, y si la utilidad neta es sana.
- **Liquidez**: revisa si la empresa tiene suficiente activo circulante para cubrir sus obligaciones de corto plazo, y si hay presión en efectivo, cuentas por cobrar o inventarios.
- **Endeudamiento**: revisa si la deuda es manejable o riesgosa, y si el pasivo está creciendo demasiado.
- **Capacidad de pago**: con la información disponible, determina si la empresa parece capaz de pagar un crédito y señala cualquier alerta importante.

Entrega la respuesta en este formato (usa headers de nivel \`##\`):

## Resumen ejecutivo
Máximo 5 renglones.

## Señales positivas
Máximo 5 puntos (bullets \`- \`).

## Señales de alerta
Máximo 5 puntos (bullets \`- \`).

## Preguntas clave para el cliente
Máximo 5 preguntas (bullets \`- \`).

## Dictamen preliminar
Elige solo una opción entre **Aprobable**, **Aprobable con condiciones**, **Requiere más información** o **No recomendable**. Explica tu decisión en máximo 5 renglones.

# Reglas importantes

No inventes datos. No hagas explicaciones largas. No uses lenguaje técnico innecesario. Si falta información, dilo claramente. Prioriza riesgo, liquidez y capacidad de pago. Usa variaciones importantes cuando sean evidentes. El análisis debe poder leerse en menos de 3 minutos.`

// ─────────────────────────────────────────────────────────────
// Public: streaming analysis
// ─────────────────────────────────────────────────────────────
/**
 * Stream an integrated credit analysis (ER + BG) following the RC Corporativo
 * senior credit analyst prompt. Output is a full credit memo (sections A-H).
 *
 * @param {Object} opts
 * @param {Object} opts.er - Estado de Resultados calculado (y1/y2/y3)
 * @param {Object} opts.bg - Balance General calculado (y1/y2/y3)
 * @param {Object} opts.labels - { y1, y2, y3 } period labels
 * @param {number} opts.monthsY3 - Months elapsed in y3 (12 = full year, less = partial)
 * @param {string} [opts.empresa] - Company name for context
 * @param {(deltaText: string) => void} opts.onDelta - Called with each token delta
 * @param {(usage: Object) => void} [opts.onComplete] - Called when stream ends with token usage
 * @param {(err: Error) => void} [opts.onError] - Called on error
 * @param {AbortSignal} [opts.signal] - AbortSignal to cancel mid-stream
 * @returns {Promise<void>}
 */
export async function streamFinancialAnalysis({
  er,
  bg,
  labels,
  monthsY3,
  empresa,
  onDelta,
  onComplete,
  onError,
  signal,
}) {
  const client = getClient()

  const userMessage = buildUserMessage({ er, bg, labels, monthsY3, empresa })

  try {
    const stream = client.messages.stream(
      {
        model: MODEL,
        max_tokens: 1800, // output ~5 secciones × 5 bullets = ~1K-1.5K tokens
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      },
      signal ? { signal } : undefined
    )

    stream.on('text', (delta) => {
      onDelta(delta)
    })

    const final = await stream.finalMessage()

    if (onComplete) {
      onComplete({
        input_tokens: final.usage.input_tokens,
        output_tokens: final.usage.output_tokens,
        cache_creation_input_tokens: final.usage.cache_creation_input_tokens,
        cache_read_input_tokens: final.usage.cache_read_input_tokens,
      })
    }
  } catch (err) {
    if (err?.name === 'AbortError' || signal?.aborted) return // user cerró el modal — silenciar
    if (onError) {
      onError(humanizeError(err))
    } else {
      throw err
    }
  }
}

function buildUserMessage({ er, bg, labels, monthsY3, empresa }) {
  const isPartialY3 = monthsY3 < 12
  const notaParcial = isPartialY3
    ? `\nNota: El periodo ${labels.y3} es parcial (${monthsY3} de 12 meses transcurridos).\n`
    : ''

  return `Empresa: ${empresa || 'No especificada'}
Periodos: ${labels.y1} (2024) · ${labels.y2} (2025) · ${labels.y3} (2026 MTD)${notaParcial}
Aquí están los estados financieros:

Estado de Resultados (pesos mexicanos):
\`\`\`json
${JSON.stringify(er, null, 2)}
\`\`\`

Balance General (pesos mexicanos):
\`\`\`json
${JSON.stringify(bg, null, 2)}
\`\`\``
}

function humanizeError(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return new Error('API key inválida o expirada. Verifica VITE_ANTHROPIC_API_KEY en .env.local')
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return new Error('La API key no tiene permisos para usar este modelo (claude-opus-4-7).')
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new Error('Límite de rate alcanzado. Espera unos segundos y reintenta.')
  }
  if (err instanceof Anthropic.OverloadedError) {
    return new Error('Los servidores de Anthropic están saturados. Reintenta en un momento.')
  }
  if (err instanceof Anthropic.APIError) {
    return new Error(`Error de API (${err.status}): ${err.message}`)
  }
  if (err?.message?.includes('VITE_ANTHROPIC_API_KEY')) {
    return err // already humanized
  }
  return new Error(`Error inesperado: ${err?.message || String(err)}`)
}
