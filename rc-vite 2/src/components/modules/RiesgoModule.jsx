// ============================================================
// MÓDULO 7: MATRIZ DE RIESGO · SCORE INTERNO
// ============================================================

import { ModuleSection, CompletionBar } from '../shared/Common'
import { calcScore, parseNum, riesgoCompletionPct } from '../../engines/financialEngine'

export default function RiesgoModule({ state, setState }) {
  const r = state.riesgo
  const score = calcScore(state)

  const update = (key, value) => setState({ ...state, riesgo: { ...r, [key]: parseInt(value) || 0 } })

  const dimensiones = [
    { key: 'scoreFinanzas', label: 'Salud Financiera', peso: 35, desc: 'Margen, liquidez, apalancamiento, rentabilidad' },
    { key: 'scoreBuro', label: 'Comportamiento en Buró', peso: 25, desc: 'Historial PF y PM, MOPs, atrasos, calificación' },
    { key: 'scoreCapacidad', label: 'Capacidad de Pago', peso: 20, desc: 'DSCR, sensibilidades, cobertura por garantías' },
    { key: 'scoreCualitativo', label: 'Análisis Cualitativo', peso: 10, desc: 'Antigüedad, sector, cartera de clientes, calidad de info' },
    { key: 'scoreIA', label: 'Alertas Predictivas', peso: 10, desc: 'Bureau-shopping, descuadres, pasivos no reportados' }
  ]

  return (
    <>
      <ModuleSection number="1" title="Score Interno Ponderado" subtitle="Resultado consolidado">
        <div className={`score-card score-${score.color}`}>
          <div className="score-eyebrow">Score Final</div>
          <div className="score-number">{score.scoreFinal.toFixed(0)}<span className="score-of">/100</span></div>
          <div className="score-label">{score.nivel}</div>
        </div>
      </ModuleSection>

      <ModuleSection number="2" title="Calificación por Dimensión" subtitle="Ajuste manual con barras visuales">
        {dimensiones.map(d => (
          <div key={d.key} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{d.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--rc-text-muted)' }}>{d.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="range" min="0" max="100" value={r[d.key]||0} onChange={e => update(d.key, e.target.value)} style={{ width: '180px' }} />
                <input type="number" className="num" style={{ width: '60px' }} min="0" max="100" value={r[d.key]||0} onChange={e => update(d.key, e.target.value)} />
                <div style={{ fontSize: '11px', color: 'var(--rc-green)', fontWeight: 700, minWidth: '40px' }}>{d.peso}%</div>
              </div>
            </div>
            <div style={{ height: '8px', background: 'var(--rc-border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${r[d.key]||0}%`, background: 'var(--rc-green)', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--rc-text-muted)', marginTop: '4px' }}>
              Contribución al score: <b>{((r[d.key]||0) * d.peso / 100).toFixed(1)}</b> puntos
            </div>
          </div>
        ))}
      </ModuleSection>

      <ModuleSection number="3" title="Desglose Ponderado" subtitle="Cálculo detallado del score">
        <table className="data-table">
          <thead><tr><th>Dimensión</th><th className="num">Score</th><th className="num">Peso</th><th className="num">Contribución</th></tr></thead>
          <tbody>
            {dimensiones.map(d => (
              <tr key={d.key}>
                <td>{d.label}</td>
                <td className="num">{r[d.key]||0}</td>
                <td className="num">{d.peso}%</td>
                <td className="num">{((r[d.key]||0) * d.peso / 100).toFixed(1)}</td>
              </tr>
            ))}
            <tr style={{ background: 'var(--rc-green-soft)', fontWeight: 700, color: 'var(--rc-green)' }}>
              <td>SCORE FINAL</td><td colSpan="2"></td><td className="num">{score.scoreFinal.toFixed(2)} / 100</td>
            </tr>
          </tbody>
        </table>
      </ModuleSection>

      <CompletionBar title="Completitud del Módulo" pct={riesgoCompletionPct(state)} />
    </>
  )
}
