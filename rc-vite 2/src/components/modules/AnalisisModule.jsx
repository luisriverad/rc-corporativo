// ============================================================
// MÓDULO 3: ANÁLISIS FINANCIERO
// ============================================================

import { ModuleSection, Light, CompletionBar } from '../shared/Common'
import { calcER, calcBG, calcRazones, calcAH, fmtMoney, financierosCompletionPct } from '../../engines/financialEngine'

export default function AnalisisModule({ state }) {
  const er = calcER(state)
  const bg = calcBG(state)
  const r = calcRazones(state)
  const labels = { y1: state.financieros.er.y1Label, y2: state.financieros.er.y2Label, y3: state.financieros.er.y3Label }

  const ahVentas = calcAH([er.y1.ventasNetas, er.y2.ventasNetas, er.y3.ventasNetas])
  const ahUtilBruta = calcAH([er.y1.utilBruta, er.y2.utilBruta, er.y3.utilBruta])
  const ahUtilOp = calcAH([er.y1.utilOperativa, er.y2.utilOperativa, er.y3.utilOperativa])
  const ahUtilNeta = calcAH([er.y1.utilNeta, er.y2.utilNeta, er.y3.utilNeta])

  const fmtAH = (v) => v === '' ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`
  const ahColor = (v) => v === '' ? '' : v > 0 ? 'positive' : 'negative'

  const semForo = (val, good, bad, inverse=false) => {
    if (inverse) {
      if (val <= good) return 'green'
      if (val <= bad) return 'amber'
      return 'red'
    }
    if (val >= good) return 'green'
    if (val >= bad) return 'amber'
    return 'red'
  }

  return (
    <>
      <ModuleSection number="1" title="Análisis Horizontal" subtitle="Variación porcentual entre ejercicios">
        <table className="fin-table">
          <thead>
            <tr><th className="label-col">Concepto</th><th className="num">{labels.y1}</th><th className="num">% AH</th><th className="num">{labels.y2}</th><th className="num">% AH</th><th className="num">{labels.y3}</th></tr>
          </thead>
          <tbody>
            <tr><td className="row-label">Ventas Netas</td><td className="num calc">{fmtMoney(er.y1.ventasNetas)}</td><td className="num"></td><td className="num calc">{fmtMoney(er.y2.ventasNetas)}</td><td className={`num ${ahColor(ahVentas[1])}`}>{fmtAH(ahVentas[1])}</td><td className="num calc">{fmtMoney(er.y3.ventasNetas)}</td></tr>
            <tr><td className="row-label">Utilidad Bruta</td><td className="num calc">{fmtMoney(er.y1.utilBruta)}</td><td className="num"></td><td className="num calc">{fmtMoney(er.y2.utilBruta)}</td><td className={`num ${ahColor(ahUtilBruta[1])}`}>{fmtAH(ahUtilBruta[1])}</td><td className="num calc">{fmtMoney(er.y3.utilBruta)}</td></tr>
            <tr><td className="row-label">Utilidad Operativa</td><td className="num calc">{fmtMoney(er.y1.utilOperativa)}</td><td className="num"></td><td className="num calc">{fmtMoney(er.y2.utilOperativa)}</td><td className={`num ${ahColor(ahUtilOp[1])}`}>{fmtAH(ahUtilOp[1])}</td><td className="num calc">{fmtMoney(er.y3.utilOperativa)}</td></tr>
            <tr className="total"><td className="row-label bold">Utilidad Neta</td><td className="num calc">{fmtMoney(er.y1.utilNeta)}</td><td className="num"></td><td className="num calc">{fmtMoney(er.y2.utilNeta)}</td><td className={`num ${ahColor(ahUtilNeta[1])}`}>{fmtAH(ahUtilNeta[1])}</td><td className="num calc">{fmtMoney(er.y3.utilNeta)}</td></tr>
          </tbody>
        </table>
      </ModuleSection>

      <ModuleSection number="2" title="Razones Financieras" subtitle="16 indicadores clave con semáforo">
        <h4 className="razones-group">Endeudamiento</h4>
        <table className="razones-table">
          <thead><tr><th>Razón</th><th className="num">{labels.y1}</th><th className="num">{labels.y2}</th><th className="num">{labels.y3}</th><th>Estado</th></tr></thead>
          <tbody>
            <tr><td>Razón de Endeudamiento</td><td className="num">{r.y1.razonEndeudamiento.toFixed(2)}%</td><td className="num">{r.y2.razonEndeudamiento.toFixed(2)}%</td><td className="num">{r.y3.razonEndeudamiento.toFixed(2)}%</td><td><Light color={semForo(r.y2.razonEndeudamiento, 40, 60, true)}>{r.y2.razonEndeudamiento < 40 ? 'Bajo' : r.y2.razonEndeudamiento < 60 ? 'Moderado' : 'Alto'}</Light></td></tr>
            <tr><td>Apalancamiento</td><td className="num">{r.y1.apalancamiento.toFixed(2)}</td><td className="num">{r.y2.apalancamiento.toFixed(2)}</td><td className="num">{r.y3.apalancamiento.toFixed(2)}</td><td><Light color={semForo(r.y2.apalancamiento, 1, 2, true)}>{r.y2.apalancamiento < 1 ? 'Sano' : r.y2.apalancamiento < 2 ? 'Moderado' : 'Riesgoso'}</Light></td></tr>
          </tbody>
        </table>

        <h4 className="razones-group">Liquidez</h4>
        <table className="razones-table">
          <thead><tr><th>Razón</th><th className="num">{labels.y1}</th><th className="num">{labels.y2}</th><th className="num">{labels.y3}</th><th>Estado</th></tr></thead>
          <tbody>
            <tr><td>Solvencia / Capital Trabajo</td><td className="num">{r.y1.solvenciaCT.toFixed(2)}</td><td className="num">{r.y2.solvenciaCT.toFixed(2)}</td><td className="num">{r.y3.solvenciaCT.toFixed(2)}</td><td><Light color={semForo(r.y2.solvenciaCT, 1.5, 1.0)}>{r.y2.solvenciaCT >= 1.5 ? 'Sano' : r.y2.solvenciaCT >= 1.0 ? 'Aceptable' : 'Crítico'}</Light></td></tr>
            <tr><td>Liquidez Ácida</td><td className="num">{r.y1.liquidezAcida.toFixed(2)}</td><td className="num">{r.y2.liquidezAcida.toFixed(2)}</td><td className="num">{r.y3.liquidezAcida.toFixed(2)}</td><td><Light color={semForo(r.y2.liquidezAcida, 1.0, 0.7)}>{r.y2.liquidezAcida >= 1.0 ? 'Sano' : r.y2.liquidezAcida >= 0.7 ? 'Aceptable' : 'Bajo'}</Light></td></tr>
            <tr><td>Liquidez Inmediata</td><td className="num">{r.y1.liquidezInmediata.toFixed(2)}</td><td className="num">{r.y2.liquidezInmediata.toFixed(2)}</td><td className="num">{r.y3.liquidezInmediata.toFixed(2)}</td><td><Light color={semForo(r.y2.liquidezInmediata, 0.3, 0.1)}>{r.y2.liquidezInmediata >= 0.3 ? 'Sano' : r.y2.liquidezInmediata >= 0.1 ? 'Limitado' : 'Crítico'}</Light></td></tr>
          </tbody>
        </table>

        <h4 className="razones-group">Rentabilidad</h4>
        <table className="razones-table">
          <thead><tr><th>Razón</th><th className="num">{labels.y1}</th><th className="num">{labels.y2}</th><th className="num">{labels.y3}</th><th>Estado</th></tr></thead>
          <tbody>
            <tr><td>ROA</td><td className="num">{r.y1.roa.toFixed(2)}%</td><td className="num">{r.y2.roa.toFixed(2)}%</td><td className="num">{r.y3.roa.toFixed(2)}%</td><td><Light color={semForo(r.y2.roa, 5, 2)}>{r.y2.roa >= 5 ? 'Bueno' : r.y2.roa >= 2 ? 'Bajo' : 'Crítico'}</Light></td></tr>
            <tr><td>ROE</td><td className="num">{r.y1.roe.toFixed(2)}%</td><td className="num">{r.y2.roe.toFixed(2)}%</td><td className="num">{r.y3.roe.toFixed(2)}%</td><td><Light color={semForo(r.y2.roe, 10, 5)}>{r.y2.roe >= 10 ? 'Bueno' : r.y2.roe >= 5 ? 'Bajo' : 'Crítico'}</Light></td></tr>
            <tr><td>Margen Operativo</td><td className="num">{r.y1.margenOperativo.toFixed(2)}%</td><td className="num">{r.y2.margenOperativo.toFixed(2)}%</td><td className="num">{r.y3.margenOperativo.toFixed(2)}%</td><td><Light color={semForo(r.y2.margenOperativo, 5, 2)}>{r.y2.margenOperativo >= 5 ? 'Sano' : 'Bajo'}</Light></td></tr>
            <tr><td>Margen Neto</td><td className="num">{r.y1.margenNeto.toFixed(2)}%</td><td className="num">{r.y2.margenNeto.toFixed(2)}%</td><td className="num">{r.y3.margenNeto.toFixed(2)}%</td><td><Light color={semForo(r.y2.margenNeto, 5, 2)}>{r.y2.margenNeto >= 5 ? 'Sano' : r.y2.margenNeto >= 2 ? 'Bajo' : 'Crítico'}</Light></td></tr>
          </tbody>
        </table>

        <h4 className="razones-group">Eficiencia</h4>
        <table className="razones-table">
          <thead><tr><th>Razón</th><th className="num">{labels.y1}</th><th className="num">{labels.y2}</th><th className="num">{labels.y3}</th><th>Estado</th></tr></thead>
          <tbody>
            <tr><td>Días Inventario</td><td className="num">{r.y1.diasInventario.toFixed(0)}</td><td className="num">{r.y2.diasInventario.toFixed(0)}</td><td className="num">{r.y3.diasInventario.toFixed(0)}</td><td><Light color={semForo(r.y2.diasInventario, 60, 120, true)}>{r.y2.diasInventario < 60 ? 'Ágil' : r.y2.diasInventario < 120 ? 'Normal' : 'Lento'}</Light></td></tr>
            <tr><td>Días Cuentas por Cobrar</td><td className="num">{r.y1.diasCxC.toFixed(0)}</td><td className="num">{r.y2.diasCxC.toFixed(0)}</td><td className="num">{r.y3.diasCxC.toFixed(0)}</td><td><Light color={semForo(r.y2.diasCxC, 60, 90, true)}>{r.y2.diasCxC < 60 ? 'Ágil' : r.y2.diasCxC < 90 ? 'Normal' : 'Lento'}</Light></td></tr>
            <tr><td>Días Cuentas por Pagar</td><td className="num">{r.y1.diasCxP.toFixed(0)}</td><td className="num">{r.y2.diasCxP.toFixed(0)}</td><td className="num">{r.y3.diasCxP.toFixed(0)}</td><td><Light color="green">Info</Light></td></tr>
            <tr><td>Ciclo Operativo</td><td className="num">{r.y1.cicloOperativo.toFixed(0)}</td><td className="num">{r.y2.cicloOperativo.toFixed(0)}</td><td className="num">{r.y3.cicloOperativo.toFixed(0)}</td><td><Light color={semForo(r.y2.cicloOperativo, 90, 150, true)}>{r.y2.cicloOperativo < 90 ? 'Ágil' : r.y2.cicloOperativo < 150 ? 'Normal' : 'Lento'}</Light></td></tr>
            <tr><td>Capital de Trabajo Neto</td><td className="num">{fmtMoney(r.y1.capitalTrabajoNeto)}</td><td className="num">{fmtMoney(r.y2.capitalTrabajoNeto)}</td><td className="num">{fmtMoney(r.y3.capitalTrabajoNeto)}</td><td><Light color={r.y2.capitalTrabajoNeto > 0 ? 'green' : 'red'}>{r.y2.capitalTrabajoNeto > 0 ? 'Positivo' : 'Negativo'}</Light></td></tr>
          </tbody>
        </table>
      </ModuleSection>

      <CompletionBar title="Completitud del Módulo" pct={financierosCompletionPct(state)} />
    </>
  )
}
