// ============================================================
// MÓDULO 9: DICTAMEN FINAL
// ============================================================

import { useState } from 'react'
import { Icon, CompletionBar } from '../shared/Common'
import { fmtMoney, calcScore, dictamenCompletionPct, parseNum } from '../../engines/financialEngine'

// ─────────────────────────────────────────────────────────────
// Input numérico con separador de miles (focus=raw, blur=formateado)
// ─────────────────────────────────────────────────────────────
function MoneyTermInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  const raw = value ?? ''
  const display = focused
    ? raw
    : (raw === '' || raw == null
        ? ''
        : parseNum(raw).toLocaleString('en-US', { maximumFractionDigits: 2 }))
  return (
    <input
      type="text"
      inputMode="decimal"
      className="dict-term-input"
      value={display}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.\-,]/g, ''))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
    />
  )
}

const decisionConfig = {
  aprobado:    { label: 'APROBADO',                        color: 'var(--rc-success)',  bg: '#E8EFE2' },
  condicionado:{ label: 'APROBADO · CONDICIONADO',         color: 'var(--rc-amber)',    bg: '#FEF7E6' },
  info:        { label: 'INFORMACIÓN ADICIONAL REQUERIDA', color: 'var(--rc-blue)',     bg: '#EBF5FA' },
  rechazado:   { label: 'NO RECOMENDABLE',                 color: 'var(--rc-red)',      bg: '#FEEBEB' }
}

// ─────────────────────────────────────────────────────────────
// Botón premium bloqueado (no funcional por ahora)
// ─────────────────────────────────────────────────────────────
function PremiumLockedButton() {
  return (
    <div className="dict-premium" role="button" tabIndex={-1} aria-disabled="true">
      <div className="dict-premium-lock">
        <Icon path='<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' size={24} />
      </div>
      <div className="dict-premium-body">
        <div className="dict-premium-eye">PREMIUM · ACCESO RESTRINGIDO</div>
        <div className="dict-premium-t">Análisis Complementario Avanzado</div>
        <ul className="dict-premium-meta">
          <li><span className="dict-premium-meta-dot" /> Análisis generado por <strong>AXON B2B SUPER BRAIN</strong></li>
          <li><span className="dict-premium-meta-dot" /> Su estudio puede tomar varios minutos</li>
          <li><span className="dict-premium-meta-dot" /> Debido al uso intensivo de diversas IA, se requiere <strong>password</strong> para su uso</li>
        </ul>
      </div>
      <div className="dict-premium-cta">
        <Icon path='<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' size={14} />
        Desbloquear
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Helper: lista editable (puntos a favor, en contra, etc.)
// ─────────────────────────────────────────────────────────────
function EditableList({ items, listName, color, iconPath, onUpdate, onRemove, onAdd, placeholder }) {
  return (
    <div className="dict-list">
      <ul>
        {(items || []).length === 0 && (
          <li className="dict-list-empty">Sin elementos — agrega uno abajo</li>
        )}
        {(items || []).map((item, idx) => (
          <li key={idx} className={`dict-item dict-${color}`}>
            <span className="dict-item-icon"><Icon path={iconPath} size={14} /></span>
            <textarea
              value={item}
              onChange={(e) => onUpdate(listName, idx, e.target.value)}
              rows="2"
              placeholder={placeholder}
            />
            <button className="dict-item-remove" onClick={() => onRemove(listName, idx)} aria-label="Eliminar">
              <Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={11} />
            </button>
          </li>
        ))}
      </ul>
      <button className="btn-add" onClick={() => onAdd(listName)}>
        <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar
      </button>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function DictamenModule({ state, setState }) {
  const d = state.dictamen
  const c = state.caratula || {}
  const score = calcScore(state)
  const cfg = decisionConfig[d.decision]

  const update = (key, value) => setState({ ...state, dictamen: { ...d, [key]: value } })
  const addListItem = (listName) => {
    setState({ ...state, dictamen: { ...d, [listName]: [...(d[listName] || []), ''] } })
  }
  const updateListItem = (listName, idx, value) => {
    const list = [...(d[listName] || [])]
    list[idx] = value
    setState({ ...state, dictamen: { ...d, [listName]: list } })
  }
  const removeListItem = (listName, idx) => {
    setState({ ...state, dictamen: { ...d, [listName]: (d[listName] || []).filter((_, i) => i !== idx) } })
  }

  // Fecha de hoy formateada
  const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      {/* ============================================================ */}
      {/* HERO · Encabezado editorial estilo memorando de comité */}
      {/* ============================================================ */}
      <div className="dict-hero">
        <div className="dict-hero-ornament" aria-hidden="true">§</div>
        <div className="dict-hero-eye">MEMORANDO DEL COMITÉ DE CRÉDITO</div>
        <h1 className="dict-hero-t">Dictamen Final</h1>
        <div className="dict-hero-sub">
          <span className="dict-hero-meta"><strong>Cliente:</strong> {c.empresa || '—'}</span>
          <span className="dict-hero-divider">·</span>
          <span className="dict-hero-meta"><strong>RFC:</strong> {c.rfc || '—'}</span>
          <span className="dict-hero-divider">·</span>
          <span className="dict-hero-meta"><strong>Fecha:</strong> {today}</span>
        </div>
        <div className="dict-hero-rule" />
      </div>

      {/* ============================================================ */}
      {/* A. VEREDICTO EJECUTIVO */}
      {/* ============================================================ */}
      <section className="dict-section">
        <div className="dict-section-h">
          <span className="dict-section-letter">A</span>
          <div>
            <div className="dict-section-eye">Veredicto Ejecutivo</div>
            <div className="dict-section-t">Recomendación basada en el análisis integral</div>
          </div>
        </div>

        {cfg ? (
          <div className="dict-verdict" style={{ background: cfg.bg, borderColor: cfg.color }}>
            <div className="dict-verdict-l">
              <div className="dict-verdict-eye" style={{ color: cfg.color }}>RECOMENDACIÓN EJECUTIVA</div>
              <div className="dict-verdict-label" style={{ color: cfg.color }}>{cfg.label}</div>
              <div className="dict-verdict-score">
                Score Interno: <strong>{score.scoreFinal.toFixed(0)}/100</strong> · {score.nivel}
              </div>
            </div>
          </div>
        ) : (
          <div className="dict-verdict-empty">
            Selecciona la decisión del comité para emitir el veredicto.
          </div>
        )}

        <div className="form-grid" style={{ marginTop: 18 }}>
          <div className="field span-full">
            <label className="field-label">Decisión del Comité</label>
            <select className="field-select" value={d.decision || ''} onChange={(e) => update('decision', e.target.value)}>
              <option value="">— Selecciona —</option>
              <option value="aprobado">Aprobado</option>
              <option value="condicionado">Aprobado Condicionado</option>
              <option value="info">Información Adicional Requerida</option>
              <option value="rechazado">No Recomendable</option>
            </select>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* B. TÉRMINOS DEL CRÉDITO APROBADO */}
      {/* ============================================================ */}
      <section className="dict-section">
        <div className="dict-section-h">
          <span className="dict-section-letter">B</span>
          <div>
            <div className="dict-section-eye">Términos del Crédito</div>
            <div className="dict-section-t">Condiciones financieras aprobadas por el comité</div>
          </div>
        </div>

        <div className="fd-w-row fd-w-row--3up">
          <div className="dict-term-card">
            <div className="dict-term-lbl">Monto Aprobado</div>
            <div className="dict-term-input-wrap">
              <span className="dict-term-prefix">$</span>
              <MoneyTermInput
                value={d.montoAprobado}
                onChange={(v) => update('montoAprobado', v)}
                placeholder="0"
              />
            </div>
            <div className="dict-term-sub">{parseNum(d.montoAprobado) > 0 ? fmtMoney(parseNum(d.montoAprobado)) : 'MXN'}</div>
          </div>
          <div className="dict-term-card">
            <div className="dict-term-lbl">Plazo Aprobado</div>
            <div className="dict-term-input-wrap">
              <input
                type="number"
                className="dict-term-input"
                value={d.plazoAprobado || ''}
                onChange={(e) => update('plazoAprobado', e.target.value)}
                placeholder="0"
              />
              <span className="dict-term-suffix">meses</span>
            </div>
            <div className="dict-term-sub">{parseNum(d.plazoAprobado) > 0 ? `${(parseNum(d.plazoAprobado) / 12).toFixed(1)} años` : 'Periodo de pago'}</div>
          </div>
          <div className="dict-term-card">
            <div className="dict-term-lbl">Tasa Anual</div>
            <div className="dict-term-input-wrap">
              <input
                type="number"
                className="dict-term-input"
                value={d.tasaAprobada || ''}
                onChange={(e) => update('tasaAprobada', e.target.value)}
                step="0.01"
                placeholder="0.00"
              />
              <span className="dict-term-suffix">%</span>
            </div>
            <div className="dict-term-sub">Costo financiero</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PREMIUM LOCKED BUTTON */}
      {/* ============================================================ */}
      <PremiumLockedButton />

      {/* ============================================================ */}
      {/* C. ARGUMENTOS DEL DICTAMEN — Favor vs Contra (2 columnas) */}
      {/* ============================================================ */}
      <section className="dict-section">
        <div className="dict-section-h">
          <span className="dict-section-letter">C</span>
          <div>
            <div className="dict-section-eye">Argumentos del Dictamen</div>
            <div className="dict-section-t">Razones que sustentan o cuestionan la recomendación</div>
          </div>
        </div>

        <div className="dict-grid-2">
          <div className="dict-col">
            <div className="dict-col-h dict-col-h--pro">
              <Icon path='<polyline points="20 6 9 17 4 12"/>' size={14} />
              <span>Puntos a Favor</span>
              <span className="dict-col-count">{(d.puntosAFavor || []).length}</span>
            </div>
            <EditableList
              items={d.puntosAFavor}
              listName="puntosAFavor"
              color="favor"
              iconPath='<polyline points="20 6 9 17 4 12"/>'
              onUpdate={updateListItem}
              onRemove={removeListItem}
              onAdd={addListItem}
              placeholder="Argumento que respalda la aprobación..."
            />
          </div>
          <div className="dict-col">
            <div className="dict-col-h dict-col-h--con">
              <Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={14} />
              <span>Puntos en Contra</span>
              <span className="dict-col-count">{(d.puntosEnContra || []).length}</span>
            </div>
            <EditableList
              items={d.puntosEnContra}
              listName="puntosEnContra"
              color="contra"
              iconPath='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
              onUpdate={updateListItem}
              onRemove={removeListItem}
              onAdd={addListItem}
              placeholder="Riesgo o preocupación detectada..."
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* D. ACLARACIONES Y CONDICIONES */}
      {/* ============================================================ */}
      <section className="dict-section">
        <div className="dict-section-h">
          <span className="dict-section-letter">D</span>
          <div>
            <div className="dict-section-eye">Aclaraciones y Condiciones</div>
            <div className="dict-section-t">Información pendiente y restricciones del crédito</div>
          </div>
        </div>

        <div className="dict-grid-2">
          <div className="dict-col">
            <div className="dict-col-h dict-col-h--aclar">
              <Icon path='<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' size={14} />
              <span>Aclaraciones Pendientes</span>
              <span className="dict-col-count">{(d.aclaraciones || []).length}</span>
            </div>
            <EditableList
              items={d.aclaraciones}
              listName="aclaraciones"
              color="aclar"
              iconPath='<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
              onUpdate={updateListItem}
              onRemove={removeListItem}
              onAdd={addListItem}
              placeholder="Información o documento por solicitar..."
            />
          </div>
          <div className="dict-col">
            <div className="dict-col-h dict-col-h--cond">
              <Icon path='<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' size={14} />
              <span>Condiciones del Crédito</span>
              <span className="dict-col-count">{(d.condiciones || []).length}</span>
            </div>
            <EditableList
              items={d.condiciones}
              listName="condiciones"
              color="cond"
              iconPath='<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
              onUpdate={updateListItem}
              onRemove={removeListItem}
              onAdd={addListItem}
              placeholder="Garantía, covenant o restricción..."
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* E. COMENTARIOS DEL COMITÉ */}
      {/* ============================================================ */}
      <section className="dict-section">
        <div className="dict-section-h">
          <span className="dict-section-letter">E</span>
          <div>
            <div className="dict-section-eye">Comentarios del Comité</div>
            <div className="dict-section-t">Observaciones adicionales y consideraciones del análisis</div>
          </div>
        </div>

        <div className="dict-col">
          <EditableList
            items={d.comentarios}
            listName="comentarios"
            color="info"
            iconPath='<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
            onUpdate={updateListItem}
            onRemove={removeListItem}
            onAdd={addListItem}
            placeholder="Comentario u observación del comité..."
          />
        </div>
      </section>

      <CompletionBar title="% de Completado del Módulo" pct={dictamenCompletionPct(state)} />
    </>
  )
}
