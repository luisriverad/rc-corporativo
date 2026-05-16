// ============================================================
// MODAL DE ANÁLISIS IA — AXON B2B SUPER BRAIN
// Componente compartido — usado por Tab 2 (Financieros) y Tab 3 (Análisis).
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { simulateAnalysis } from '../../services/simulateAnalysis'

// ─────────────────────────────────────────────────────────────
// Minimal markdown renderer for streamed AI output
// Handles: ## headers, ### sub-headers, **bold**, - bullets, paragraphs
// ─────────────────────────────────────────────────────────────
function renderInline(text) {
  const parts = []
  let lastIdx = 0
  const regex = /\*\*([^*]+?)\*\*/g
  let match
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index))
    parts.push(<strong key={key++}>{match[1]}</strong>)
    lastIdx = match.index + match[0].length
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts
}

function StreamedMarkdown({ text, streaming }) {
  const lines = text.split('\n')
  const blocks = []
  let bulletGroup = null
  lines.forEach((rawLine, i) => {
    const line = rawLine.trimEnd()
    const flushBullets = () => {
      if (bulletGroup) {
        blocks.push(<ul key={`ul-${i}`} className="md-ul">{bulletGroup}</ul>)
        bulletGroup = null
      }
    }
    if (line.startsWith('### ')) {
      flushBullets()
      blocks.push(<h4 key={i} className="md-h4">{renderInline(line.slice(4))}</h4>)
    } else if (line.startsWith('## ')) {
      flushBullets()
      blocks.push(<h3 key={i} className="md-h3">{renderInline(line.slice(3))}</h3>)
    } else if (line.startsWith('# ')) {
      flushBullets()
      blocks.push(<h2 key={i} className="md-h2">{renderInline(line.slice(2))}</h2>)
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      if (!bulletGroup) bulletGroup = []
      bulletGroup.push(<li key={`li-${i}`}>{renderInline(line.slice(2))}</li>)
    } else if (line.trim() === '') {
      flushBullets()
    } else {
      flushBullets()
      blocks.push(<p key={i} className="md-p">{renderInline(line)}</p>)
    }
  })
  if (bulletGroup) blocks.push(<ul key="ul-end" className="md-ul">{bulletGroup}</ul>)
  return (
    <div className="md-body">
      {blocks}
      {streaming && <span className="md-cursor" aria-hidden="true" />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AnalysisModal — modal con streaming del análisis IA
// ─────────────────────────────────────────────────────────────
export default function AnalysisModal({ open, onClose, title, er, bg, labels, monthsY3, empresa }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'streaming' | 'done' | 'error'
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState(null)
  const abortRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!open || startedRef.current) return
    startedRef.current = true

    setText('')
    setError(null)
    setUsage(null)
    setStatus('streaming')

    let cancelled = false
    let chunkTimer = null

    // Loading dots brevemente, luego streaming simulado del memo determinista
    const loadingDelay = setTimeout(() => {
      if (cancelled) return

      try {
        const fullText = simulateAnalysis({ er, bg, labels, monthsY3, empresa })

        // Fake streaming: chunks de ~14 chars cada 18ms → ~775 chars/seg
        // Total: ~2.5s para un memo de ~2000 chars. Sensación natural sin esperar al API.
        const CHUNK_SIZE = 14
        const TICK_MS = 18
        let idx = 0

        chunkTimer = setInterval(() => {
          if (cancelled) {
            clearInterval(chunkTimer)
            return
          }
          idx = Math.min(fullText.length, idx + CHUNK_SIZE)
          setText(fullText.slice(0, idx))
          if (idx >= fullText.length) {
            clearInterval(chunkTimer)
            setStatus('done')
            setUsage({
              output_tokens: Math.round(fullText.length / 4),
              cache_read_input_tokens: 0,
            })
          }
        }, TICK_MS)
      } catch (err) {
        setError(err?.message || String(err))
        setStatus('error')
      }
    }, 700) // pequeño delay para que el loading state se aprecie

    abortRef.current = {
      abort: () => {
        cancelled = true
        clearTimeout(loadingDelay)
        if (chunkTimer) clearInterval(chunkTimer)
      },
    }

    return () => {
      cancelled = true
      clearTimeout(loadingDelay)
      if (chunkTimer) clearInterval(chunkTimer)
      startedRef.current = false
    }
  }, [open, er, bg, labels, monthsY3, empresa])

  if (!open) return null

  const handleClose = () => {
    if (abortRef.current) abortRef.current.abort()
    startedRef.current = false
    setText('')
    setStatus('idle')
    setError(null)
    setUsage(null)
    onClose()
  }

  return (
    <div className="fin-modal-backdrop" onClick={handleClose}>
      <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fin-modal-h">
          <div>
            <div className="fin-modal-eye">
              <span className="fin-modal-status-dot" data-status={status} /> ANÁLISIS · AXON B2B SUPER BRAIN
            </div>
            <div className="fin-modal-t">{title}</div>
          </div>
          <button className="fin-modal-x" onClick={handleClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="fin-modal-body">
          {status === 'streaming' && text === '' && (
            <div className="fin-modal-loading">
              <div className="fin-modal-loading-dots"><span /><span /><span /></div>
              <div className="fin-modal-loading-t">EL MODELO ESTÁ PROCESANDO LOS DATOS</div>
            </div>
          )}
          {text !== '' && <StreamedMarkdown text={text} streaming={status === 'streaming'} />}
          {status === 'error' && (
            <div className="fin-modal-error">
              <div className="fin-modal-error-t">No se pudo generar el análisis</div>
              <div className="fin-modal-error-b">{error}</div>
            </div>
          )}
        </div>
        <div className="fin-modal-f">
          <span className="fin-modal-disclaimer">
            {status === 'done' && usage && (
              <>
                Generado por <strong>AXON B2B SUPER BRAIN</strong> · {usage.output_tokens.toLocaleString()} tokens
                {usage.cache_read_input_tokens > 0 && ` · ${usage.cache_read_input_tokens.toLocaleString()} cached`}
              </>
            )}
            {status === 'streaming' && <>Generado por <strong>AXON B2B SUPER BRAIN</strong>…</>}
            {status === 'error' && 'Revisa la configuración de VITE_ANTHROPIC_API_KEY en .env.local'}
          </span>
          <button className="btn btn-primary" onClick={handleClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
