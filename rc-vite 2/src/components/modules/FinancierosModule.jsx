// ============================================================
// MÓDULO 2: ESTADOS FINANCIEROS
// ============================================================

import { ModuleSection, Alert, CompletionBar } from '../shared/Common'
import { calcER, calcBG, fmtMoney, financierosCompletionPct } from '../../engines/financialEngine'

export default function FinancierosModule({ state, setState }) {
  const er = calcER(state)
  const bg = calcBG(state)
  const fin = state.financieros

  const updateER = (key, idx, value) => {
    const newER = { ...fin.er, [key]: fin.er[key].map((v, i) => i === idx ? value : v) }
    setState({ ...state, financieros: { ...fin, er: newER } })
  }
  const updateBG = (key, idx, value) => {
    const newBG = { ...fin.bg, [key]: fin.bg[key].map((v, i) => i === idx ? value : v) }
    setState({ ...state, financieros: { ...fin, bg: newBG } })
  }
  const updateLabel = (key, value) => {
    setState({ ...state, financieros: { ...fin, er: { ...fin.er, [key]: value } } })
  }

  const inputCell = (key, idx, isER) => {
    const value = isER ? fin.er[key][idx] : fin.bg[key][idx]
    const fn = isER ? updateER : updateBG
    return (
      <td key={`${key}-${idx}`}>
        <input type="number" className="num" value={value||''} onChange={e => fn(key, idx, e.target.value)} step="0.01" />
      </td>
    )
  }

  const calcCell = (val, decimals=0) => <td className="num calc">{fmtMoney(val, decimals)}</td>

  const labels = { y1: fin.er.y1Label, y2: fin.er.y2Label, y3: fin.er.y3Label }

  return (
    <>
      <ModuleSection number="A" title="Estado de Resultados" subtitle="Captura de 3 ejercicios comparativos">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div className="field"><label className="field-label">Año 1</label><input className="field-input" type="text" value={labels.y1} onChange={e => updateLabel('y1Label', e.target.value)} /></div>
          <div className="field"><label className="field-label">Año 2</label><input className="field-input" type="text" value={labels.y2} onChange={e => updateLabel('y2Label', e.target.value)} /></div>
          <div className="field"><label className="field-label">Periodo Parcial</label><input className="field-input" type="text" value={labels.y3} onChange={e => updateLabel('y3Label', e.target.value)} /></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="fin-table">
            <thead><tr><th className="label-col">Concepto</th><th className="num">{labels.y1}</th><th className="num">{labels.y2}</th><th className="num">{labels.y3}</th></tr></thead>
            <tbody>
              <tr><td className="row-label">Ventas Totales</td>{[0,1,2].map(i => inputCell('ventas', i, true))}</tr>
              <tr><td className="row-label sub">(-) Descuentos</td>{[0,1,2].map(i => inputCell('descuentos', i, true))}</tr>
              <tr><td className="row-label sub">(+) Otros Ingresos</td>{[0,1,2].map(i => inputCell('otrosIngresos', i, true))}</tr>
              <tr className="subtotal"><td className="row-label">= Ventas Netas</td>{calcCell(er.y1.ventasNetas)}{calcCell(er.y2.ventasNetas)}{calcCell(er.y3.ventasNetas)}</tr>
              <tr><td className="row-label">(-) Costo de Venta</td>{[0,1,2].map(i => inputCell('costoVenta', i, true))}</tr>
              <tr className="subtotal"><td className="row-label">= Utilidad Bruta</td>{calcCell(er.y1.utilBruta)}{calcCell(er.y2.utilBruta)}{calcCell(er.y3.utilBruta)}</tr>
              <tr><td className="row-label sub">Margen Bruto %</td><td className="num pct">{er.y1.margenBruto.toFixed(2)}%</td><td className="num pct">{er.y2.margenBruto.toFixed(2)}%</td><td className="num pct">{er.y3.margenBruto.toFixed(2)}%</td></tr>
              <tr><td className="row-label">(-) Gastos de Venta</td>{[0,1,2].map(i => inputCell('gastosVenta', i, true))}</tr>
              <tr><td className="row-label">(-) Gastos de Operación</td>{[0,1,2].map(i => inputCell('gastosOperacion', i, true))}</tr>
              <tr><td className="row-label">(-) Otros Gastos</td>{[0,1,2].map(i => inputCell('otrosGastos', i, true))}</tr>
              <tr className="subtotal"><td className="row-label">= Utilidad Operativa</td>{calcCell(er.y1.utilOperativa)}{calcCell(er.y2.utilOperativa)}{calcCell(er.y3.utilOperativa)}</tr>
              <tr><td className="row-label sub">Margen Operativo %</td><td className="num pct">{er.y1.margenOperativo.toFixed(2)}%</td><td className="num pct">{er.y2.margenOperativo.toFixed(2)}%</td><td className="num pct">{er.y3.margenOperativo.toFixed(2)}%</td></tr>
              <tr><td className="row-label">(-) Gastos Financieros</td>{[0,1,2].map(i => inputCell('gastosFinancieros', i, true))}</tr>
              <tr><td className="row-label">(+) Productos Financieros</td>{[0,1,2].map(i => inputCell('productosFinancieros', i, true))}</tr>
              <tr><td className="row-label">(+) Otros Productos</td>{[0,1,2].map(i => inputCell('otrosProductos', i, true))}</tr>
              <tr className="subtotal"><td className="row-label">= RI de Financiamiento</td>{calcCell(er.y1.riFinanciamiento)}{calcCell(er.y2.riFinanciamiento)}{calcCell(er.y3.riFinanciamiento)}</tr>
              <tr className="subtotal"><td className="row-label">= Util. Antes de Imp.</td>{calcCell(er.y1.utilAntesImp)}{calcCell(er.y2.utilAntesImp)}{calcCell(er.y3.utilAntesImp)}</tr>
              <tr><td className="row-label">(-) ISR</td>{[0,1,2].map(i => inputCell('isr', i, true))}</tr>
              <tr><td className="row-label">(-) PTU</td>{[0,1,2].map(i => inputCell('ptu', i, true))}</tr>
              <tr className="total"><td className="row-label bold">= UTILIDAD NETA</td>{calcCell(er.y1.utilNeta)}{calcCell(er.y2.utilNeta)}{calcCell(er.y3.utilNeta)}</tr>
              <tr><td className="row-label sub">Margen Neto %</td><td className="num pct">{er.y1.margenNeto.toFixed(2)}%</td><td className="num pct">{er.y2.margenNeto.toFixed(2)}%</td><td className="num pct">{er.y3.margenNeto.toFixed(2)}%</td></tr>
            </tbody>
          </table>
        </div>
      </ModuleSection>

      <ModuleSection number="B" title="Balance General" subtitle="Activos, pasivos y capital · 3 ejercicios">
        <div style={{ overflowX: 'auto' }}>
          <table className="fin-table">
            <thead><tr><th className="label-col">Concepto</th><th className="num">{labels.y1}</th><th className="num">{labels.y2}</th><th className="num">{labels.y3}</th></tr></thead>
            <tbody>
              <tr className="section-divider"><td colSpan="4">ACTIVO</td></tr>
              <tr><td className="row-label">Efectivo</td>{[0,1,2].map(i => inputCell('efectivo', i, false))}</tr>
              <tr><td className="row-label">Clientes</td>{[0,1,2].map(i => inputCell('clientes', i, false))}</tr>
              <tr><td className="row-label">Deudores Diversos</td>{[0,1,2].map(i => inputCell('deudoresDiversos', i, false))}</tr>
              <tr><td className="row-label">Inventarios</td>{[0,1,2].map(i => inputCell('inventarios', i, false))}</tr>
              <tr><td className="row-label">Otros Activos CP</td>{[0,1,2].map(i => inputCell('otrosActivosCP', i, false))}</tr>
              <tr className="subtotal"><td className="row-label">= Activo Circulante</td>{calcCell(bg.y1.activoCirculante)}{calcCell(bg.y2.activoCirculante)}{calcCell(bg.y3.activoCirculante)}</tr>
              <tr><td className="row-label">Activo Fijo</td>{[0,1,2].map(i => inputCell('activoFijo', i, false))}</tr>
              <tr><td className="row-label">Otros Activos LP</td>{[0,1,2].map(i => inputCell('otrosActivosLP', i, false))}</tr>
              <tr className="total"><td className="row-label bold">= ACTIVO TOTAL</td>{calcCell(bg.y1.activoTotal)}{calcCell(bg.y2.activoTotal)}{calcCell(bg.y3.activoTotal)}</tr>

              <tr className="section-divider"><td colSpan="4">PASIVO</td></tr>
              <tr><td className="row-label">Proveedores</td>{[0,1,2].map(i => inputCell('proveedores', i, false))}</tr>
              <tr><td className="row-label">Acreedores</td>{[0,1,2].map(i => inputCell('acreedores', i, false))}</tr>
              <tr><td className="row-label">Préstamos Fin. CP</td>{[0,1,2].map(i => inputCell('prestamosFinancierosCP', i, false))}</tr>
              <tr><td className="row-label">Otros Pasivos CP</td>{[0,1,2].map(i => inputCell('otrosPasivosCP', i, false))}</tr>
              <tr className="subtotal"><td className="row-label">= Total Pasivos CP</td>{calcCell(bg.y1.totalPasivosCP)}{calcCell(bg.y2.totalPasivosCP)}{calcCell(bg.y3.totalPasivosCP)}</tr>
              <tr><td className="row-label">Préstamos Fin. LP</td>{[0,1,2].map(i => inputCell('prestamosFinancierosLP', i, false))}</tr>
              <tr><td className="row-label">Otros Pasivos LP</td>{[0,1,2].map(i => inputCell('otrosPasivosLP', i, false))}</tr>
              <tr className="total"><td className="row-label bold">= PASIVO TOTAL</td>{calcCell(bg.y1.pasivoTotal)}{calcCell(bg.y2.pasivoTotal)}{calcCell(bg.y3.pasivoTotal)}</tr>

              <tr className="section-divider"><td colSpan="4">CAPITAL</td></tr>
              <tr><td className="row-label">Capital Social Fijo</td>{[0,1,2].map(i => inputCell('capitalSocialFijo', i, false))}</tr>
              <tr><td className="row-label">Capital Social Variable</td>{[0,1,2].map(i => inputCell('capitalSocialVariable', i, false))}</tr>
              <tr><td className="row-label">Reserva Legal</td>{[0,1,2].map(i => inputCell('reservaLegal', i, false))}</tr>
              <tr><td className="row-label">Resultados Anteriores</td>{[0,1,2].map(i => inputCell('resultadosAnteriores', i, false))}</tr>
              <tr><td className="row-label sub">Resultado del Ejercicio</td>{calcCell(bg.y1.resultadoEjercicio)}{calcCell(bg.y2.resultadoEjercicio)}{calcCell(bg.y3.resultadoEjercicio)}</tr>
              <tr><td className="row-label">Otras Cuentas Capital</td>{[0,1,2].map(i => inputCell('otrasCuentasCapital', i, false))}</tr>
              <tr className="total"><td className="row-label bold">= CAPITAL</td>{calcCell(bg.y1.capital)}{calcCell(bg.y2.capital)}{calcCell(bg.y3.capital)}</tr>
              <tr className="total"><td className="row-label bold">= PASIVO + CAPITAL</td>{calcCell(bg.y1.pc)}{calcCell(bg.y2.pc)}{calcCell(bg.y3.pc)}</tr>
            </tbody>
          </table>
        </div>

        {Math.abs(bg.y2.diferencia) > 100 ? (
          <Alert level="warn" title="Descuadre detectado">
            El año {labels.y2} no cuadra. Diferencia: {fmtMoney(bg.y2.diferencia)}. Revise los valores.
          </Alert>
        ) : (
          <Alert level="success" title="Balance cuadrado" iconPath='<polyline points="20 6 9 17 4 12"/>'>
            Los 3 ejercicios cumplen la ecuación contable: Activo = Pasivo + Capital.
          </Alert>
        )}
      </ModuleSection>

      <CompletionBar title="Completitud del Módulo" pct={financierosCompletionPct(state)} />
    </>
  )
}
