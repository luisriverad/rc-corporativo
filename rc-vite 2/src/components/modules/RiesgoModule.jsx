// ============================================================
// MÓDULO 7: MATRIZ DE RIESGO · SCORE INTERNO
// ============================================================

import { useState } from 'react'
import { Icon, ModuleSection, CompletionBar } from '../shared/Common'
import { calcScore, parseNum, riesgoCompletionPct } from '../../engines/financialEngine'

// Umbrales por defecto (cambiables vía modal "Cambiar Tolerancia")
const DEFAULT_T1 = 55  // Crítico ↔ Aceptable
const DEFAULT_T2 = 70  // Aceptable ↔ Sólido

const dimensiones = [
  { key: 'scoreFinanzas',    label: 'Salud Financiera',        peso: 35, desc: 'Margen, liquidez, apalancamiento, rentabilidad' },
  { key: 'scoreBuro',        label: 'Comportamiento en Buró',  peso: 25, desc: 'Historial PF y PM, MOPs, atrasos, calificación' },
  { key: 'scoreCapacidad',   label: 'Capacidad de Pago',       peso: 20, desc: 'DSCR, sensibilidades, cobertura por garantías' },
  { key: 'scoreCualitativo', label: 'Análisis Cualitativo',    peso: 10, desc: 'Antigüedad, sector, cartera de clientes, calidad de info' },
  { key: 'scoreIA',          label: 'Alertas Predictivas',     peso: 10, desc: 'Bureau-shopping, descuadres, pasivos no reportados' }
]

// ─────────────────────────────────────────────────────────────
// Barra horizontal de dictamen con zonas de tolerancia + aguja
// ─────────────────────────────────────────────────────────────
function RiesgoBar({ value, t1, t2 }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="riesgo-bar">
      <div className="riesgo-bar-zones">
        <div className="riesgo-zone tone-critical" style={{ width: `${t1}%` }} />
        <div className="riesgo-zone tone-caution"  style={{ width: `${Math.max(0, t2 - t1)}%` }} />
        <div className="riesgo-zone tone-good"     style={{ width: `${Math.max(0, 100 - t2)}%` }} />
      </div>
      <div className="riesgo-bar-track" />
      <div className="riesgo-bar-pin" style={{ left: `${v}%` }}>
        <div className="riesgo-bar-pin-bubble">{v}</div>
        <div className="riesgo-bar-pin-stick" />
      </div>
      <div className="riesgo-bar-marks">
        <span style={{ left: `${t1}%` }}>{t1}</span>
        <span style={{ left: `${t2}%` }}>{t2}</span>
      </div>
      <div className="riesgo-bar-scale">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Modal: Cambiar Tolerancia
// ─────────────────────────────────────────────────────────────
function ToleranceModal({ t1, t2, onSave, onClose }) {
  const [localT1, setLocalT1] = useState(t1)
  const [localT2, setLocalT2] = useState(t2)
  const safeT1 = Math.max(0, Math.min(localT1, localT2 - 1, 99))
  const safeT2 = Math.max(localT1 + 1, Math.min(localT2, 100))

  return (
    <div className="fin-modal-backdrop" onClick={onClose}>
      <div className="fin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="fin-modal-h">
          <div>
            <div className="fin-modal-eye">
              <span className="fin-modal-status-dot" data-status="done" /> CONFIGURACIÓN · UMBRALES
            </div>
            <div className="fin-modal-t">Cambiar Tolerancia</div>
          </div>
          <button className="fin-modal-x" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="fin-modal-body">
          <p className="md-p" style={{ marginBottom: 18 }}>
            Ajusta los umbrales que definen las bandas de calificación. Los scores por debajo de <strong>T1</strong> se clasifican como <strong>Crítico</strong>, entre T1 y <strong>T2</strong> como <strong>Aceptable</strong>, y por encima de T2 como <strong>Sólido</strong>.
          </p>

          <div className="form-grid" style={{ marginBottom: 18 }}>
            <div className="field">
              <label className="field-label">Umbral T1 · Crítico → Aceptable</label>
              <input
                className="field-input num"
                type="number"
                min="1" max="99"
                value={localT1}
                onChange={(e) => setLocalT1(parseInt(e.target.value) || 0)}
              />
              <div className="field-help">Default sugerido: 55</div>
            </div>
            <div className="field">
              <label className="field-label">Umbral T2 · Aceptable → Sólido</label>
              <input
                className="field-input num"
                type="number"
                min="2" max="100"
                value={localT2}
                onChange={(e) => setLocalT2(parseInt(e.target.value) || 0)}
              />
              <div className="field-help">Default sugerido: 70</div>
            </div>
          </div>

          <div className="md-h4" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--rc-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
            Vista previa
          </div>
          <RiesgoBar value={50} t1={safeT1} t2={safeT2} />
        </div>
        <div className="fin-modal-f">
          <span className="fin-modal-disclaimer">
            Estos umbrales solo afectan la visualización del dictamen por dimensión. El score ponderado final se calcula igual.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={() => onSave({ t1: safeT1, t2: safeT2 })}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function RiesgoModule({ state, setState }) {
  const r = state.riesgo
  const score = calcScore(state)
  const [openTol, setOpenTol] = useState(false)

  const t1 = parseNum(r.toleranciaT1) || DEFAULT_T1
  const t2 = parseNum(r.toleranciaT2) || DEFAULT_T2

  const saveTolerance = ({ t1, t2 }) => {
    setState({ ...state, riesgo: { ...r, toleranciaT1: t1, toleranciaT2: t2 } })
    setOpenTol(false)
  }

  const dictamen = (val) => {
    if (val < t1) return { tone: 'critical', label: 'Crítico' }
    if (val < t2) return { tone: 'caution',  label: 'Aceptable' }
    return         { tone: 'good',     label: 'Sólido' }
  }

  return (
    <>
      {/* Centro de Control de Tolerancias — banner superior prominente */}
      <div className="riesgo-control-banner">
        <div className="riesgo-control-l">
          <div className="riesgo-control-eye">CENTRO DE CONTROL</div>
          <div className="riesgo-control-t">Tolerancias del Comité</div>
          <div className="riesgo-control-sub">
            Define los umbrales que clasifican cada dimensión como Crítico, Aceptable o Sólido.
          </div>
        </div>
        <div className="riesgo-control-r">
          <div className="riesgo-control-thresholds">
            <div className="riesgo-control-th-item">
              <div className="riesgo-control-th-lbl">T1 · CRÍTICO → ACEPTABLE</div>
              <div className="riesgo-control-th-val">{t1}</div>
            </div>
            <div className="riesgo-control-th-divider" />
            <div className="riesgo-control-th-item">
              <div className="riesgo-control-th-lbl">T2 · ACEPTABLE → SÓLIDO</div>
              <div className="riesgo-control-th-val">{t2}</div>
            </div>
          </div>
          <button className="riesgo-control-btn" onClick={() => setOpenTol(true)}>
            <Icon path='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' size={16} />
            Cambiar Tolerancia
          </button>
        </div>
      </div>

      <ModuleSection number="1" title="Score Interno Ponderado" subtitle="Resultado consolidado">
        <div className={`score-card score-${score.color}`}>
          <div className="score-eyebrow">Score Final</div>
          <div className="score-number">{score.scoreFinal.toFixed(0)}<span className="score-of">/100</span></div>
          <div className="score-label">{score.nivel}</div>
        </div>
      </ModuleSection>

      <ModuleSection number="2" title="Calificación por Dimensión" subtitle="Score 0-100 por área con dictamen sobre bandas de tolerancia">
        <div className="riesgo-list">
          {dimensiones.map((d) => {
            const val = parseInt(r[d.key]) || 0
            const dict = dictamen(val)
            return (
              <div key={d.key} className="riesgo-row">
                <div className="riesgo-row-h">
                  <div className="riesgo-row-l">
                    <div className="riesgo-dim-name">{d.label}</div>
                    <div className="riesgo-dim-desc">{d.desc}</div>
                  </div>
                  <div className="riesgo-row-r">
                    <span className="riesgo-peso" title="Peso en el score ponderado">{d.peso}%</span>
                    <div className="riesgo-score-display" title="Score calculado automáticamente">
                      {val}
                      <span className="riesgo-score-of">/100</span>
                    </div>
                    <span className={`fin-alert tone-${dict.tone}`}>
                      <span className="fin-alert-dot" /> {dict.label}
                    </span>
                  </div>
                </div>
                <RiesgoBar value={val} t1={t1} t2={t2} />
                <div className="riesgo-row-foot">
                  Contribución al score: <strong>{(val * d.peso / 100).toFixed(1)}</strong> puntos
                </div>
              </div>
            )
          })}
        </div>
      </ModuleSection>

      <ModuleSection number="3" title="Desglose Ponderado" subtitle="Cálculo detallado del score final">
        <table className="fin-table">
          <thead>
            <tr>
              <th className="label-col">Dimensión</th>
              <th className="num">Score</th>
              <th className="num">Peso</th>
              <th className="num">Contribución</th>
              <th className="col-alert">Dictamen</th>
            </tr>
          </thead>
          <tbody>
            {dimensiones.map((d) => {
              const val = parseInt(r[d.key]) || 0
              const dict = dictamen(val)
              return (
                <tr key={d.key}>
                  <td className="fd-tbl-lbl">{d.label}</td>
                  <td className="num calc"><span className="num-v">{val}</span></td>
                  <td className="num"><span className="num-v">{d.peso}%</span></td>
                  <td className="num calc"><span className="num-v">{(val * d.peso / 100).toFixed(1)}</span></td>
                  <td className="cell-alert">
                    <span className={`fin-alert tone-${dict.tone}`}>
                      <span className="fin-alert-dot" /> {dict.label}
                    </span>
                  </td>
                </tr>
              )
            })}
            <tr className="total">
              <td className="row-label bold">SCORE FINAL</td>
              <td className="num calc" colSpan="2"></td>
              <td className="num calc"><span className="num-v">{score.scoreFinal.toFixed(2)} / 100</span></td>
              <td className="cell-alert">
                <span className={`fin-alert tone-${score.color === 'green' ? 'good' : score.color === 'amber' ? 'caution' : 'critical'}`}>
                  <span className="fin-alert-dot" /> {score.nivel}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </ModuleSection>

      <CompletionBar title="% de Completado del Módulo" pct={riesgoCompletionPct(state)} />

      {openTol && (
        <ToleranceModal t1={t1} t2={t2} onSave={saveTolerance} onClose={() => setOpenTol(false)} />
      )}
    </>
  )
}
