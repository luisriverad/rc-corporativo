// ============================================================
// MÓDULO 6: CAPACIDAD DE PAGO
// ============================================================

import { ModuleSection, Alert, Light, CompletionBar } from '../shared/Common'
import { fmtMoney, parseNum, calcCapacidad, capacidadCompletionPct } from '../../engines/financialEngine'

export default function CapacidadModule({ state, setState }) {
  const cap = state.capacidad
  const calc = calcCapacidad(state)
  const monto = parseNum(state.caratula.montoSolicitado)

  const update = (key, value) => setState({ ...state, capacidad: { ...cap, [key]: value } })

  const dscrLevel = (dscr) => {
    if (dscr >= 1.5) return 'green'
    if (dscr >= 1.2) return 'amber'
    return 'red'
  }

  const totalPagar = calc.pmt * parseNum(cap.plazoMeses)
  const intereses = totalPagar - monto

  return (
    <>
      <ModuleSection number="1" title="Parámetros del Crédito" subtitle="Condiciones financieras de la solicitud">
        <div className="form-grid">
          <div className="field"><label className="field-label">Monto Solicitado</label><input className="field-input num" type="text" value={monto > 0 ? fmtMoney(monto) : ''} readOnly /><div className="field-help">Capturado en Carátula</div></div>
          <div className="field"><label className="field-label">Tasa Anual %</label><input className="field-input num" type="number" value={cap.tasaAnual||''} onChange={e => update('tasaAnual', e.target.value)} step="0.01" /></div>
          <div className="field"><label className="field-label">Plazo (meses)</label><input className="field-input num" type="number" value={cap.plazoMeses||''} onChange={e => update('plazoMeses', e.target.value)} /></div>
          <div className="field span-full"><label className="field-label">Flujo Mensual Disponible</label><input className="field-input num" type="number" value={cap.flujoMensualDisponible||''} onChange={e => update('flujoMensualDisponible', e.target.value)} /><div className="field-help">Capacidad mensual estimada del cliente para hacer frente a la deuda</div></div>
        </div>
      </ModuleSection>

      <ModuleSection number="2" title="Cálculo del Pago Mensual (PMT)" subtitle="Fórmula de anualidad">
        <div className="summary-grid">
          <div><div className="summary-item-label">Pago Mensual</div><div className="summary-item-value">{fmtMoney(calc.pmt, 2)}</div><div className="summary-item-sub">PMT calculado</div></div>
          <div><div className="summary-item-label">Total a Pagar</div><div className="summary-item-value">{fmtMoney(totalPagar)}</div><div className="summary-item-sub">{cap.plazoMeses || 0} mensualidades</div></div>
          <div><div className="summary-item-label">Intereses Totales</div><div className="summary-item-value">{fmtMoney(intereses)}</div><div className="summary-item-sub">Costo financiero</div></div>
        </div>
      </ModuleSection>

      <ModuleSection number="3" title="DSCR · Cobertura de Servicio de Deuda" subtitle="Sensibilidades por escenarios">
        <table className="data-table">
          <thead><tr><th>Escenario</th><th className="num">Flujo Mensual</th><th className="num">PMT</th><th className="num">DSCR</th><th>Estado</th></tr></thead>
          <tbody>
            <tr>
              <td>Base (100%)</td>
              <td className="num">{fmtMoney(cap.flujoMensualDisponible)}</td>
              <td className="num">{fmtMoney(calc.pmt, 2)}</td>
              <td className="num"><b>{calc.dscr.toFixed(2)}x</b></td>
              <td><Light color={dscrLevel(calc.dscr)}>{calc.dscr >= 1.5 ? 'Sólido' : calc.dscr >= 1.2 ? 'Aceptable' : 'Insuficiente'}</Light></td>
            </tr>
            <tr>
              <td>Sensibilidad -10%</td>
              <td className="num">{fmtMoney(parseNum(cap.flujoMensualDisponible) * 0.9)}</td>
              <td className="num">{fmtMoney(calc.pmt, 2)}</td>
              <td className="num"><b>{calc.dscrSens10.toFixed(2)}x</b></td>
              <td><Light color={dscrLevel(calc.dscrSens10)}>{calc.dscrSens10 >= 1.5 ? 'Sólido' : calc.dscrSens10 >= 1.2 ? 'Aceptable' : 'Insuficiente'}</Light></td>
            </tr>
            <tr>
              <td>Sensibilidad -20%</td>
              <td className="num">{fmtMoney(parseNum(cap.flujoMensualDisponible) * 0.8)}</td>
              <td className="num">{fmtMoney(calc.pmt, 2)}</td>
              <td className="num"><b>{calc.dscrSens20.toFixed(2)}x</b></td>
              <td><Light color={dscrLevel(calc.dscrSens20)}>{calc.dscrSens20 >= 1.5 ? 'Sólido' : calc.dscrSens20 >= 1.2 ? 'Aceptable' : 'Insuficiente'}</Light></td>
            </tr>
          </tbody>
        </table>
        {calc.dscrSens20 < 1.0 && (
          <Alert level="warn" title="Riesgo en sensibilidad -20%">
            Con una caída de 20% en el flujo, el DSCR cae a {calc.dscrSens20.toFixed(2)}x. Recomendable reducir monto o ajustar plazo.
          </Alert>
        )}
      </ModuleSection>

      <ModuleSection number="4" title="Garantías" subtitle="Valor declarado y LTV aplicable">
        <div className="form-grid">
          <div className="field"><label className="field-label">Valor de Garantías</label><input className="field-input num" type="number" value={cap.valorGarantias||''} onChange={e => update('valorGarantias', e.target.value)} /></div>
          <div className="field"><label className="field-label">% LTV (Loan-to-Value)</label><input className="field-input num" type="number" value={cap.porcentajeLTV||''} onChange={e => update('porcentajeLTV', e.target.value)} step="0.01" /></div>
        </div>
      </ModuleSection>

      <ModuleSection number="5" title="Monto Recomendable" subtitle="Tope por flujo y tope por garantías">
        <div className="summary-grid">
          <div><div className="summary-item-label">Por Flujo (DSCR 1.5)</div><div className="summary-item-value">{fmtMoney(calc.montoMaximo)}</div><div className="summary-item-sub">Máximo sostenible</div></div>
          <div><div className="summary-item-label">Por Garantías ({cap.porcentajeLTV}%)</div><div className="summary-item-value">{fmtMoney(calc.montoMaxGarantias)}</div><div className="summary-item-sub">Valor × LTV</div></div>
          <div><div className="summary-item-label">Recomendable Final</div><div className="summary-item-value" style={{ color: 'var(--rc-green)' }}>{fmtMoney(calc.montoRecomendable)}</div><div className="summary-item-sub">El menor de ambos</div></div>
        </div>
        {monto > calc.montoRecomendable && (
          <Alert level="warn" title="Monto solicitado supera el recomendable">
            El cliente solicita {fmtMoney(monto)} pero el recomendable técnico es {fmtMoney(calc.montoRecomendable)}.
          </Alert>
        )}
      </ModuleSection>

      <CompletionBar title="Completitud del Módulo" pct={capacidadCompletionPct(state)} />
    </>
  )
}
