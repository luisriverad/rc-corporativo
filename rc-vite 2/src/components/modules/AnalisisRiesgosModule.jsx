// ============================================================
// MÓDULO 8: ANÁLISIS DE RIESGOS (escenarios predictivos)
// ============================================================

import { ModuleSection, Alert, Light, CompletionBar } from '../shared/Common'
import { calcCapacidad, detectAlerts, fmtMoney, parseNum, riesgoCompletionPct } from '../../engines/financialEngine'

export default function AnalisisRiesgosModule({ state }) {
  const calc = calcCapacidad(state)
  const alerts = detectAlerts(state)
  const flujo = parseNum(state.capacidad.flujoMensualDisponible)

  const escenarios = [
    { name: 'Optimista', factor: 1.1, prob: '30%', flujo: flujo * 1.1, dscr: calc.pmt > 0 ? (flujo * 1.1) / calc.pmt : 0 },
    { name: 'Base', factor: 1.0, prob: '50%', flujo: flujo, dscr: calc.dscr },
    { name: 'Pesimista', factor: 0.7, prob: '20%', flujo: flujo * 0.7, dscr: calc.pmt > 0 ? (flujo * 0.7) / calc.pmt : 0 }
  ]

  const dscrLevel = (dscr) => {
    if (dscr >= 1.5) return 'green'
    if (dscr >= 1.2) return 'amber'
    return 'red'
  }

  return (
    <>
      <ModuleSection number="1" title="Escenarios Predictivos" subtitle="3 escenarios con probabilidad ponderada">
        <table className="data-table">
          <thead><tr><th>Escenario</th><th>Probabilidad</th><th className="num">Flujo Mensual</th><th className="num">DSCR</th><th>Resultado</th></tr></thead>
          <tbody>
            {escenarios.map(e => (
              <tr key={e.name}>
                <td><b>{e.name}</b></td>
                <td>{e.prob}</td>
                <td className="num">{fmtMoney(e.flujo)}</td>
                <td className="num"><b>{e.dscr.toFixed(2)}x</b></td>
                <td><Light color={dscrLevel(e.dscr)}>{e.dscr >= 1.5 ? 'Sólido' : e.dscr >= 1.2 ? 'Aceptable' : 'Insuficiente'}</Light></td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModuleSection>

      <ModuleSection number="2" title="Alertas Críticas Detectadas" subtitle="Sistema de detección automática">
        {alerts.length === 0 ? (
          <Alert level="success" title="Sin alertas críticas">
            El análisis automático no detectó banderas rojas en este momento.
          </Alert>
        ) : (
          alerts.map((a, i) => (
            <Alert key={i} level={a.level === 'warn' ? 'warn' : 'info'} title={a.title}>
              {a.desc}
            </Alert>
          ))
        )}
      </ModuleSection>

      <ModuleSection number="3" title="Mapa de Riesgos" subtitle="Probabilidad × Impacto">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="risk-cell risk-low"><b>Riesgo Operativo</b><div>Probabilidad: Media · Impacto: Bajo</div></div>
          <div className="risk-cell risk-medium"><b>Riesgo de Crédito</b><div>Probabilidad: Media · Impacto: Medio</div></div>
          <div className="risk-cell risk-medium"><b>Riesgo de Liquidez</b><div>Probabilidad: Media · Impacto: Medio</div></div>
          <div className="risk-cell risk-low"><b>Riesgo de Mercado</b><div>Probabilidad: Baja · Impacto: Bajo</div></div>
        </div>
      </ModuleSection>

      <ModuleSection number="4" title="Recomendaciones de Mitigación" subtitle="Acciones sugeridas">
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li className="recommendation"><b>1.</b> Hipotecar garantía declarada para reducir exposición.</li>
          <li className="recommendation"><b>2.</b> Implementar pago domiciliado obligatorio.</li>
          <li className="recommendation"><b>3.</b> Solicitar reportes financieros trimestrales.</li>
          <li className="recommendation"><b>4.</b> Pedir aclaración formal de pasivos no reportados en buró.</li>
          <li className="recommendation"><b>5.</b> Establecer plan de cobranza para reducir días CxC.</li>
        </ul>
      </ModuleSection>

      <CompletionBar title="Completitud del Módulo" pct={riesgoCompletionPct(state)} />
    </>
  )
}
