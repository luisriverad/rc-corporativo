// ============================================================
// HELPERS COMPARTIDOS DE ANÁLISIS FINANCIERO
// Usados por FinancierosModule, AnalisisModule y futuros módulos.
// ============================================================

// ─────────────────────────────────────────────────────────────
// Period parsing — detecta periodos parciales desde labels
//   "mar-2026" / "MAR-2026" → 3 meses
//   "2025" / "ENE-2025" → 12 ó 1 mes
// ─────────────────────────────────────────────────────────────
export const MONTH_MAP = { ene:1, feb:2, mar:3, abr:4, may:5, jun:6, jul:7, ago:8, sep:9, oct:10, nov:11, dic:12 }

export function periodMonths(label) {
  if (!label) return 12
  const m = String(label).toLowerCase().match(/(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/)
  return m ? MONTH_MAP[m[1]] : 12
}

export function annualize(value, months) {
  if (months >= 12 || months <= 0 || value == null) return value
  return value * (12 / months)
}

// ─────────────────────────────────────────────────────────────
// Direction — 3 buckets: up/flat/down (independent de inverse)
// ─────────────────────────────────────────────────────────────
export function direction(curr, prev, suffix = '%') {
  if (prev == null || prev === 0 || curr == null) return null
  const change = suffix === 'pp' ? (curr - prev) : ((curr - prev) / Math.abs(prev)) * 100
  if (!isFinite(change)) return null
  const flatTh = suffix === 'pp' ? 0.5 : 3
  return {
    dir: Math.abs(change) < flatTh ? 'flat' : (change > 0 ? 'up' : 'down'),
    change,
    abs: Math.abs(change)
  }
}

// ─────────────────────────────────────────────────────────────
// Compound alert matrix — Real (y1→y2) × Proyección (y2→y3)
// ─────────────────────────────────────────────────────────────
export const INCOME_MATRIX = {
  up_up:     { tone: 'great',    label: 'Crecimiento sostenido'  },
  up_flat:   { tone: 'good',     label: 'Se estabiliza al alza'  },
  up_down:   { tone: 'caution',  label: 'Inflexión negativa'     },
  flat_up:   { tone: 'good',     label: 'Recuperación'           },
  flat_flat: { tone: 'neutral',  label: 'Estable'                },
  flat_down: { tone: 'caution',  label: 'Deterioro iniciando'    },
  down_up:   { tone: 'good',     label: 'Recuperación post-caída'},
  down_flat: { tone: 'caution',  label: 'Estabilización a la baja'},
  down_down: { tone: 'critical', label: 'Caída acelerada'        }
}

export const COST_MATRIX = {
  up_up:     { tone: 'critical', label: 'Alza sostenida'        },
  up_flat:   { tone: 'warn',     label: 'Se estabiliza arriba'  },
  up_down:   { tone: 'good',     label: 'Mejora reciente'       },
  flat_up:   { tone: 'warn',     label: 'Alza iniciando'        },
  flat_flat: { tone: 'neutral',  label: 'Controlado'            },
  flat_down: { tone: 'good',     label: 'Reducción iniciando'   },
  down_up:   { tone: 'caution',  label: 'Repunte tras baja'     },
  down_flat: { tone: 'good',     label: 'Baja sostenida'        },
  down_down: { tone: 'great',    label: 'Reducción acelerada'   }
}

export function compoundAlert({ realDir, projDir, inverse = false }) {
  if (!realDir && !projDir) return null
  const r = realDir || { dir: 'flat', change: 0, abs: 0 }
  const p = projDir || { dir: 'flat', change: 0, abs: 0 }
  const matrix = inverse ? COST_MATRIX : INCOME_MATRIX
  const base = matrix[`${r.dir}_${p.dir}`] || { tone: 'neutral', label: 'Estable' }
  const high = p.abs >= 25
  if (!high) return base
  if (base.tone === 'critical') return { ...base, label: base.label + ' fuerte' }
  if (base.tone === 'great')    return { ...base, label: base.label + ' fuerte' }
  return base
}

// ─────────────────────────────────────────────────────────────
// React components: Delta + AlertChip
// ─────────────────────────────────────────────────────────────
export function Delta({ curr, prev, suffix = '%', precision = 1, inverse = false }) {
  if (prev == null || prev === 0 || curr == null) return null
  const change = suffix === 'pp' ? (curr - prev) : ((curr - prev) / Math.abs(prev)) * 100
  if (!isFinite(change) || change === 0) return null
  const up = change > 0
  const good = inverse ? !up : up
  return (
    <span className={`fin-d ${good ? 'up' : 'down'}`}>
      <span className="fin-d-arrow">{up ? '▲' : '▼'}</span>
      {Math.abs(change).toFixed(precision)}{suffix}
    </span>
  )
}

export function AlertChip({ y1, y2, y3, suffix = '%', inverse = false, isFlow = false, monthsY1 = 12, monthsY2 = 12, monthsY3 = 12 }) {
  // Flows → anualizar antes de comparar (para que periodos parciales sean justos)
  const a1 = isFlow ? annualize(y1, monthsY1) : y1
  const a2 = isFlow ? annualize(y2, monthsY2) : y2
  const a3 = isFlow ? annualize(y3, monthsY3) : y3
  const realDir = direction(a2, a1, suffix)
  const projDir = direction(a3, a2, suffix)
  const result = compoundAlert({ realDir, projDir, inverse })
  if (!result) return <span className="fin-alert empty">—</span>
  const fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + (suffix === 'pp' ? 'pp' : '%')
  const tipParts = []
  if (realDir) tipParts.push(`Real: ${fmtPct(realDir.change)}`)
  if (projDir) tipParts.push(`Proyección: ${fmtPct(projDir.change)}`)
  return (
    <span className={`fin-alert tone-${result.tone}`} title={tipParts.join(' · ')}>
      <span className="fin-alert-dot" />
      {result.label}
    </span>
  )
}
