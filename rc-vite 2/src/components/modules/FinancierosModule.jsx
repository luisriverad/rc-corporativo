// ============================================================
// MÓDULO 2: ESTADOS FINANCIEROS
// ============================================================

import { useState } from 'react'
import { ModuleSection, Alert, CompletionBar } from '../shared/Common'
import AnalysisModal from '../shared/AnalysisModal'
import { calcER, calcBG, fmtMoney, parseNum, financierosCompletionPct } from '../../engines/financialEngine'
import { Delta, AlertChip, periodMonths } from '../../utils/financialHelpers'

function MoneyInput({ value, onChange, isLatest }) {
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
      className={`num ${isLatest ? 'num--latest' : ''}`}
      value={display}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.\-,]/g, ''))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

export default function FinancierosModule({ state, setState }) {
  const er = calcER(state)
  const bg = calcBG(state)
  const fin = state.financieros
  const [openModal, setOpenModal] = useState(false) // boolean — análisis integral

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
    // Delta vs y1, sólo para la columna y2 (índice 1)
    let delta = null
    if (idx === 1) {
      const series = isER ? fin.er[key] : fin.bg[key]
      const curr = parseNum(series[1])
      const prev = parseNum(series[0])
      if (prev !== 0 && curr !== 0) {
        delta = <Delta curr={curr} prev={prev} precision={1} />
      }
    }
    return (
      <td key={`${key}-${idx}`} className={`cell-input ${idx === 2 ? 'col-latest' : ''}`}>
        <MoneyInput value={value} onChange={(v) => fn(key, idx, v)} isLatest={idx === 2} />
        {delta && <div className="cell-input-delta">{delta}</div>}
      </td>
    )
  }

  // Calc cell — delta sólo en y2 (idx 1). y3 (idx 2, parcial) no se mide vs año completo.
  const calcCell = (val, prevVal, idx, decimals = 0) => (
    <td key={idx} className={`num calc ${idx === 2 ? 'col-latest' : ''}`}>
      <span className="num-v">{fmtMoney(val, decimals)}</span>
      {idx === 1 && <Delta curr={val} prev={prevVal} precision={1} />}
    </td>
  )

  const pctCell = (val, prevVal, idx) => (
    <td key={idx} className={`num pct ${idx === 2 ? 'col-latest' : ''}`}>
      <span className="num-v">{(val ?? 0).toFixed(2)}%</span>
      {idx === 1 && <Delta curr={val} prev={prevVal} suffix="pp" precision={2} />}
    </td>
  )

  const labels = { y1: fin.er.y1Label, y2: fin.er.y2Label, y3: fin.er.y3Label }
  const monthsY1 = periodMonths(labels.y1)
  const monthsY2 = periodMonths(labels.y2)
  const monthsY3 = periodMonths(labels.y3)

  // Alert cell — análisis compuesto: real (y1→y2) × proyección (y2→y3 anualizado)
  // isFlow: true para flujos del P&L (ventas, costos, utilidades). false para stocks (BG) y razones (%).
  const alertCell = (y1, y2, y3, opts = {}) => (
    <td className="cell-alert">
      <AlertChip
        y1={y1} y2={y2} y3={y3}
        monthsY1={monthsY1} monthsY2={monthsY2} monthsY3={monthsY3}
        {...opts}
      />
    </td>
  )
  const blankAlertCell = () => <td className="cell-alert empty">—</td>
  const erRaw = (key, idx) => parseNum(fin.er[key][idx])
  const bgRaw = (key, idx) => parseNum(fin.bg[key][idx])

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
            <thead>
              <tr>
                <th className="label-col">Concepto</th>
                <th className="num">{labels.y1}</th>
                <th className="num">{labels.y2}</th>
                <th className="num col-latest">{labels.y3}</th>
                <th className="col-alert">Análisis · Real & Proyección</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="row-label">Ventas Totales</td>{[0,1,2].map(i => inputCell('ventas', i, true))}{alertCell(erRaw('ventas',0), erRaw('ventas',1), erRaw('ventas',2), { isFlow: true })}</tr>
              <tr><td className="row-label sub">(−) Descuentos</td>{[0,1,2].map(i => inputCell('descuentos', i, true))}{alertCell(erRaw('descuentos',0), erRaw('descuentos',1), erRaw('descuentos',2), { isFlow: true, inverse: true })}</tr>
              <tr><td className="row-label sub">(+) Otros Ingresos</td>{[0,1,2].map(i => inputCell('otrosIngresos', i, true))}{alertCell(erRaw('otrosIngresos',0), erRaw('otrosIngresos',1), erRaw('otrosIngresos',2), { isFlow: true })}</tr>
              <tr className="subtotal"><td className="row-label">= Ventas Netas</td>{calcCell(er.y1.ventasNetas, null, 0)}{calcCell(er.y2.ventasNetas, er.y1.ventasNetas, 1)}{calcCell(er.y3.ventasNetas, er.y2.ventasNetas, 2)}{alertCell(er.y1.ventasNetas, er.y2.ventasNetas, er.y3.ventasNetas, { isFlow: true })}</tr>
              <tr><td className="row-label">(−) Costo de Venta</td>{[0,1,2].map(i => inputCell('costoVenta', i, true))}{alertCell(erRaw('costoVenta',0), erRaw('costoVenta',1), erRaw('costoVenta',2), { isFlow: true, inverse: true })}</tr>
              <tr className="subtotal"><td className="row-label">= Utilidad Bruta</td>{calcCell(er.y1.utilBruta, null, 0)}{calcCell(er.y2.utilBruta, er.y1.utilBruta, 1)}{calcCell(er.y3.utilBruta, er.y2.utilBruta, 2)}{alertCell(er.y1.utilBruta, er.y2.utilBruta, er.y3.utilBruta, { isFlow: true })}</tr>
              <tr><td className="row-label sub">Margen Bruto %</td>{pctCell(er.y1.margenBruto, null, 0)}{pctCell(er.y2.margenBruto, er.y1.margenBruto, 1)}{pctCell(er.y3.margenBruto, er.y2.margenBruto, 2)}{alertCell(er.y1.margenBruto, er.y2.margenBruto, er.y3.margenBruto, { suffix: 'pp' })}</tr>
              <tr><td className="row-label">(−) Gastos de Venta</td>{[0,1,2].map(i => inputCell('gastosVenta', i, true))}{alertCell(erRaw('gastosVenta',0), erRaw('gastosVenta',1), erRaw('gastosVenta',2), { isFlow: true, inverse: true })}</tr>
              <tr><td className="row-label">(−) Gastos de Operación</td>{[0,1,2].map(i => inputCell('gastosOperacion', i, true))}{alertCell(erRaw('gastosOperacion',0), erRaw('gastosOperacion',1), erRaw('gastosOperacion',2), { isFlow: true, inverse: true })}</tr>
              <tr><td className="row-label">(−) Otros Gastos</td>{[0,1,2].map(i => inputCell('otrosGastos', i, true))}{alertCell(erRaw('otrosGastos',0), erRaw('otrosGastos',1), erRaw('otrosGastos',2), { isFlow: true, inverse: true })}</tr>
              <tr className="subtotal"><td className="row-label">= Utilidad Operativa</td>{calcCell(er.y1.utilOperativa, null, 0)}{calcCell(er.y2.utilOperativa, er.y1.utilOperativa, 1)}{calcCell(er.y3.utilOperativa, er.y2.utilOperativa, 2)}{alertCell(er.y1.utilOperativa, er.y2.utilOperativa, er.y3.utilOperativa, { isFlow: true })}</tr>
              <tr><td className="row-label sub">Margen Operativo %</td>{pctCell(er.y1.margenOperativo, null, 0)}{pctCell(er.y2.margenOperativo, er.y1.margenOperativo, 1)}{pctCell(er.y3.margenOperativo, er.y2.margenOperativo, 2)}{alertCell(er.y1.margenOperativo, er.y2.margenOperativo, er.y3.margenOperativo, { suffix: 'pp' })}</tr>
              <tr><td className="row-label">(−) Gastos Financieros</td>{[0,1,2].map(i => inputCell('gastosFinancieros', i, true))}{alertCell(erRaw('gastosFinancieros',0), erRaw('gastosFinancieros',1), erRaw('gastosFinancieros',2), { isFlow: true, inverse: true })}</tr>
              <tr><td className="row-label">(+) Productos Financieros</td>{[0,1,2].map(i => inputCell('productosFinancieros', i, true))}{alertCell(erRaw('productosFinancieros',0), erRaw('productosFinancieros',1), erRaw('productosFinancieros',2), { isFlow: true })}</tr>
              <tr><td className="row-label">(+) Otros Productos</td>{[0,1,2].map(i => inputCell('otrosProductos', i, true))}{alertCell(erRaw('otrosProductos',0), erRaw('otrosProductos',1), erRaw('otrosProductos',2), { isFlow: true })}</tr>
              <tr className="subtotal"><td className="row-label">= RI de Financiamiento</td>{calcCell(er.y1.riFinanciamiento, null, 0)}{calcCell(er.y2.riFinanciamiento, er.y1.riFinanciamiento, 1)}{calcCell(er.y3.riFinanciamiento, er.y2.riFinanciamiento, 2)}{alertCell(er.y1.riFinanciamiento, er.y2.riFinanciamiento, er.y3.riFinanciamiento, { isFlow: true })}</tr>
              <tr className="subtotal"><td className="row-label">= Util. Antes de Imp.</td>{calcCell(er.y1.utilAntesImp, null, 0)}{calcCell(er.y2.utilAntesImp, er.y1.utilAntesImp, 1)}{calcCell(er.y3.utilAntesImp, er.y2.utilAntesImp, 2)}{alertCell(er.y1.utilAntesImp, er.y2.utilAntesImp, er.y3.utilAntesImp, { isFlow: true })}</tr>
              <tr><td className="row-label">(−) ISR</td>{[0,1,2].map(i => inputCell('isr', i, true))}{alertCell(erRaw('isr',0), erRaw('isr',1), erRaw('isr',2), { isFlow: true, inverse: true })}</tr>
              <tr><td className="row-label">(−) PTU</td>{[0,1,2].map(i => inputCell('ptu', i, true))}{alertCell(erRaw('ptu',0), erRaw('ptu',1), erRaw('ptu',2), { isFlow: true, inverse: true })}</tr>
              <tr className="total"><td className="row-label bold">= UTILIDAD NETA</td>{calcCell(er.y1.utilNeta, null, 0)}{calcCell(er.y2.utilNeta, er.y1.utilNeta, 1)}{calcCell(er.y3.utilNeta, er.y2.utilNeta, 2)}{alertCell(er.y1.utilNeta, er.y2.utilNeta, er.y3.utilNeta, { isFlow: true })}</tr>
              <tr><td className="row-label sub">Margen Neto %</td>{pctCell(er.y1.margenNeto, null, 0)}{pctCell(er.y2.margenNeto, er.y1.margenNeto, 1)}{pctCell(er.y3.margenNeto, er.y2.margenNeto, 2)}{alertCell(er.y1.margenNeto, er.y2.margenNeto, er.y3.margenNeto, { suffix: 'pp' })}</tr>
            </tbody>
          </table>
        </div>
      </ModuleSection>

      <ModuleSection number="B" title="Balance General" subtitle="Activos, pasivos y capital · 3 ejercicios">
        <div style={{ overflowX: 'auto' }}>
          <table className="fin-table">
            <thead>
              <tr>
                <th className="label-col">Concepto</th>
                <th className="num">{labels.y1}</th>
                <th className="num">{labels.y2}</th>
                <th className="num col-latest">{labels.y3}</th>
                <th className="col-alert">Análisis · Real & Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="section-divider"><td colSpan="5">ACTIVO</td></tr>
              <tr><td className="row-label">Efectivo</td>{[0,1,2].map(i => inputCell('efectivo', i, false))}{alertCell(bgRaw('efectivo',0), bgRaw('efectivo',1), bgRaw('efectivo',2))}</tr>
              <tr><td className="row-label">Clientes</td>{[0,1,2].map(i => inputCell('clientes', i, false))}{alertCell(bgRaw('clientes',0), bgRaw('clientes',1), bgRaw('clientes',2))}</tr>
              <tr><td className="row-label">Deudores Diversos</td>{[0,1,2].map(i => inputCell('deudoresDiversos', i, false))}{alertCell(bgRaw('deudoresDiversos',0), bgRaw('deudoresDiversos',1), bgRaw('deudoresDiversos',2))}</tr>
              <tr><td className="row-label">Inventarios</td>{[0,1,2].map(i => inputCell('inventarios', i, false))}{alertCell(bgRaw('inventarios',0), bgRaw('inventarios',1), bgRaw('inventarios',2))}</tr>
              <tr><td className="row-label">Otros Activos CP</td>{[0,1,2].map(i => inputCell('otrosActivosCP', i, false))}{alertCell(bgRaw('otrosActivosCP',0), bgRaw('otrosActivosCP',1), bgRaw('otrosActivosCP',2))}</tr>
              <tr className="subtotal"><td className="row-label">= Activo Circulante</td>{calcCell(bg.y1.activoCirculante, null, 0)}{calcCell(bg.y2.activoCirculante, bg.y1.activoCirculante, 1)}{calcCell(bg.y3.activoCirculante, bg.y2.activoCirculante, 2)}{alertCell(bg.y1.activoCirculante, bg.y2.activoCirculante, bg.y3.activoCirculante)}</tr>
              <tr><td className="row-label">Activo Fijo</td>{[0,1,2].map(i => inputCell('activoFijo', i, false))}{alertCell(bgRaw('activoFijo',0), bgRaw('activoFijo',1), bgRaw('activoFijo',2))}</tr>
              <tr><td className="row-label">Otros Activos LP</td>{[0,1,2].map(i => inputCell('otrosActivosLP', i, false))}{alertCell(bgRaw('otrosActivosLP',0), bgRaw('otrosActivosLP',1), bgRaw('otrosActivosLP',2))}</tr>
              <tr className="total"><td className="row-label bold">= ACTIVO TOTAL</td>{calcCell(bg.y1.activoTotal, null, 0)}{calcCell(bg.y2.activoTotal, bg.y1.activoTotal, 1)}{calcCell(bg.y3.activoTotal, bg.y2.activoTotal, 2)}{alertCell(bg.y1.activoTotal, bg.y2.activoTotal, bg.y3.activoTotal)}</tr>

              <tr className="section-divider"><td colSpan="5">PASIVO</td></tr>
              <tr><td className="row-label">Proveedores</td>{[0,1,2].map(i => inputCell('proveedores', i, false))}{alertCell(bgRaw('proveedores',0), bgRaw('proveedores',1), bgRaw('proveedores',2), { inverse: true })}</tr>
              <tr><td className="row-label">Acreedores</td>{[0,1,2].map(i => inputCell('acreedores', i, false))}{alertCell(bgRaw('acreedores',0), bgRaw('acreedores',1), bgRaw('acreedores',2), { inverse: true })}</tr>
              <tr><td className="row-label">Préstamos Fin. CP</td>{[0,1,2].map(i => inputCell('prestamosFinancierosCP', i, false))}{alertCell(bgRaw('prestamosFinancierosCP',0), bgRaw('prestamosFinancierosCP',1), bgRaw('prestamosFinancierosCP',2), { inverse: true })}</tr>
              <tr><td className="row-label">Otros Pasivos CP</td>{[0,1,2].map(i => inputCell('otrosPasivosCP', i, false))}{alertCell(bgRaw('otrosPasivosCP',0), bgRaw('otrosPasivosCP',1), bgRaw('otrosPasivosCP',2), { inverse: true })}</tr>
              <tr className="subtotal"><td className="row-label">= Total Pasivos CP</td>{calcCell(bg.y1.totalPasivosCP, null, 0)}{calcCell(bg.y2.totalPasivosCP, bg.y1.totalPasivosCP, 1)}{calcCell(bg.y3.totalPasivosCP, bg.y2.totalPasivosCP, 2)}{alertCell(bg.y1.totalPasivosCP, bg.y2.totalPasivosCP, bg.y3.totalPasivosCP, { inverse: true })}</tr>
              <tr><td className="row-label">Préstamos Fin. LP</td>{[0,1,2].map(i => inputCell('prestamosFinancierosLP', i, false))}{alertCell(bgRaw('prestamosFinancierosLP',0), bgRaw('prestamosFinancierosLP',1), bgRaw('prestamosFinancierosLP',2), { inverse: true })}</tr>
              <tr><td className="row-label">Otros Pasivos LP</td>{[0,1,2].map(i => inputCell('otrosPasivosLP', i, false))}{alertCell(bgRaw('otrosPasivosLP',0), bgRaw('otrosPasivosLP',1), bgRaw('otrosPasivosLP',2), { inverse: true })}</tr>
              <tr className="total"><td className="row-label bold">= PASIVO TOTAL</td>{calcCell(bg.y1.pasivoTotal, null, 0)}{calcCell(bg.y2.pasivoTotal, bg.y1.pasivoTotal, 1)}{calcCell(bg.y3.pasivoTotal, bg.y2.pasivoTotal, 2)}{alertCell(bg.y1.pasivoTotal, bg.y2.pasivoTotal, bg.y3.pasivoTotal, { inverse: true })}</tr>

              <tr className="section-divider"><td colSpan="5">CAPITAL</td></tr>
              <tr><td className="row-label">Capital Social Fijo</td>{[0,1,2].map(i => inputCell('capitalSocialFijo', i, false))}{alertCell(bgRaw('capitalSocialFijo',0), bgRaw('capitalSocialFijo',1), bgRaw('capitalSocialFijo',2))}</tr>
              <tr><td className="row-label">Capital Social Variable</td>{[0,1,2].map(i => inputCell('capitalSocialVariable', i, false))}{alertCell(bgRaw('capitalSocialVariable',0), bgRaw('capitalSocialVariable',1), bgRaw('capitalSocialVariable',2))}</tr>
              <tr><td className="row-label">Reserva Legal</td>{[0,1,2].map(i => inputCell('reservaLegal', i, false))}{alertCell(bgRaw('reservaLegal',0), bgRaw('reservaLegal',1), bgRaw('reservaLegal',2))}</tr>
              <tr><td className="row-label">Resultados Anteriores</td>{[0,1,2].map(i => inputCell('resultadosAnteriores', i, false))}{alertCell(bgRaw('resultadosAnteriores',0), bgRaw('resultadosAnteriores',1), bgRaw('resultadosAnteriores',2))}</tr>
              <tr><td className="row-label sub">Resultado del Ejercicio</td>{calcCell(bg.y1.resultadoEjercicio, null, 0)}{calcCell(bg.y2.resultadoEjercicio, bg.y1.resultadoEjercicio, 1)}{calcCell(bg.y3.resultadoEjercicio, bg.y2.resultadoEjercicio, 2)}{alertCell(bg.y1.resultadoEjercicio, bg.y2.resultadoEjercicio, bg.y3.resultadoEjercicio)}</tr>
              <tr><td className="row-label">Otras Cuentas Capital</td>{[0,1,2].map(i => inputCell('otrasCuentasCapital', i, false))}{alertCell(bgRaw('otrasCuentasCapital',0), bgRaw('otrasCuentasCapital',1), bgRaw('otrasCuentasCapital',2))}</tr>
              <tr className="total"><td className="row-label bold">= CAPITAL</td>{calcCell(bg.y1.capital, null, 0)}{calcCell(bg.y2.capital, bg.y1.capital, 1)}{calcCell(bg.y3.capital, bg.y2.capital, 2)}{alertCell(bg.y1.capital, bg.y2.capital, bg.y3.capital)}</tr>
              <tr className="total"><td className="row-label bold">= PASIVO + CAPITAL</td>{calcCell(bg.y1.pc, null, 0)}{calcCell(bg.y2.pc, bg.y1.pc, 1)}{calcCell(bg.y3.pc, bg.y2.pc, 2)}{blankAlertCell()}</tr>
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
        <div className="fin-analysis-cta">
          <button className="btn-analysis" onClick={() => setOpenModal(true)}>
            <span className="btn-analysis-icon">✦</span>
            <span>
              <span className="btn-analysis-l">Análisis Integral de Crédito</span>
              <span className="btn-analysis-sub">Dictamen profesional para comité · ER + BG</span>
            </span>
          </button>
        </div>
      </ModuleSection>

      <CompletionBar title="% de Completado del Módulo" pct={financierosCompletionPct(state)} />

      <AnalysisModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={`Dictamen de Crédito · ${state.caratula?.empresa || 'Empresa solicitante'}`}
        er={er}
        bg={bg}
        labels={labels}
        monthsY3={monthsY3}
        empresa={state.caratula?.empresa}
      />
    </>
  )
}
