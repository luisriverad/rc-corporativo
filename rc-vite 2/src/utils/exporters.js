// ============================================================
// UTILIDADES DE EXPORTACIÓN
// PDF, Excel (XLSX), JSON, Import JSON
// ============================================================

import * as XLSX from 'xlsx'
import {
  parseNum, fmtMoney, calcER, calcBG, calcRazones,
  calcCapacidad, calcScore
} from '../engines/financialEngine'

const decisionMap = {
  'aprobado': 'Aprobado',
  'condicionado': 'Aprobado Condicionado',
  'info': 'Información Adicional Requerida',
  'rechazado': 'No Recomendable'
}

const decisionColor = {
  'aprobado': '#2E7D32',
  'condicionado': '#C68A2E',
  'info': '#2A6F97',
  'rechazado': '#B23A3A'
}

// === EXPORTAR JSON ===
export function exportJSON(state) {
  const empresa = state.caratula.empresa || 'caso_sin_nombre'
  const filename = `RC_${empresa.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.json`

  const exportData = {
    metadata: {
      sistema: 'RC Corporativo · Sistema de Inteligencia Crediticia',
      version: '4.0',
      fechaExportacion: new Date().toISOString(),
      cliente: state.caratula.empresa,
      rfc: state.caratula.rfc,
      analista: 'Sistema RC'
    },
    state: state
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// === IMPORTAR JSON ===
export function importJSON(callback) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.state) {
          if (!confirm(`¿Cargar caso de "${data.metadata?.cliente || 'sin nombre'}"? Esto reemplazará los datos actuales.`)) return
          callback(data.state)
        } else {
          alert('Archivo JSON no válido')
        }
      } catch (err) {
        alert('Error al leer el archivo: ' + err.message)
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// === EXPORTAR EXCEL ===
export function exportExcel(state) {
  try {
    const wb = XLSX.utils.book_new()
    const c = state.caratula
    const er = calcER(state)
    const bg = calcBG(state)
    const razones = calcRazones(state)
    const calc = calcCapacidad(state)
    const score = calcScore(state)

    // === HOJA 1: CARÁTULA ===
    const caratulaData = [
      ['RC CORPORATIVO · CARÁTULA DEL CLIENTE'],
      [],
      ['Razón Social', c.empresa],
      ['RFC', c.rfc],
      ['Teléfonos', c.telefonos],
      ['Email', c.email],
      ['Representante Legal', c.representanteLegal],
      ['Fecha de Entrada', c.fechaEntrada],
      ['Fecha de Análisis', c.fechaAnalisis],
      ['Empresa Familiar', c.empresaFamiliar],
      ['Sitio Web', c.web],
      [],
      ['DOMICILIO FISCAL'],
      ['Dirección', c.domicilioFiscal],
      ['Tipo', c.tipoFiscal],
      ['Superficie m²', c.supFiscal],
      [c.tipoFiscal === 'Rentado' ? 'Renta Mensual' : 'Valor Declarado', c.tipoFiscal === 'Rentado' ? c.rentaFiscal : c.valorFiscal],
      [],
      ['ACTIVIDAD Y OPERACIÓN'],
      ['Actividad', c.actividad],
      ['Empleados', c.empleados],
      ['Nómina Mensual', c.nomina],
      ['Ventas Año Anterior', c.ventasAnioAnterior],
      ['Ventas Año en Curso', c.ventasAnioActual],
      ['Principales Clientes', c.clientes],
      ['Principales Proveedores', c.proveedores],
      [],
      ['SOLICITUD DE CRÉDITO'],
      ['Monto Solicitado', parseNum(c.montoSolicitado)],
      ['Plazo (meses)', c.plazoSolicitado],
      ['Destino del Crédito', c.destinoCredito],
      [],
      ['ACCIONISTAS'],
      ['RFC', 'Nombre', 'Participación %']
    ]
    ;(c.socios || []).forEach(s => caratulaData.push([s.rfc, s.nombre, parseNum(s.participacion)]))

    caratulaData.push([])
    caratulaData.push(['AVALES'])
    caratulaData.push(['Nombre', 'Relación', 'Patrimonio', 'Valor Declarado', 'Hipotecable'])
    ;(c.avales || []).forEach(a => caratulaData.push([a.nombre, a.relacion, a.patrimonio, parseNum(a.valor), a.hipoteca]))

    const wsCaratula = XLSX.utils.aoa_to_sheet(caratulaData)
    wsCaratula['!cols'] = [{wch: 35}, {wch: 50}, {wch: 20}, {wch: 20}, {wch: 15}]
    XLSX.utils.book_append_sheet(wb, wsCaratula, 'Carátula')

    // === HOJA 2: CUENTAS BANCARIAS ===
    const cuentasData = [
      ['CUENTAS BANCARIAS - SALDOS Y DEPÓSITOS MENSUALES'],
      [],
      ['Tipo', 'Cuenta', 'Banco', 'Titular', 'Oct-25', 'Nov-25', 'Dic-25', 'Ene-26', 'Feb-26', 'Mar-26', 'Total', 'Promedio']
    ]
    let totalDepSemestre = 0
    ;(c.cuentasBancarias || []).forEach(cb => {
      const saldos = [1,2,3,4,5,6].map(i => parseNum(cb['sm'+i]))
      const depositos = [1,2,3,4,5,6].map(i => parseNum(cb['dm'+i]))
      const totalS = saldos.reduce((a,b)=>a+b,0)
      const totalD = depositos.reduce((a,b)=>a+b,0)
      totalDepSemestre += totalD
      cuentasData.push(['SALDO', cb.numero, cb.banco, cb.titular, ...saldos, totalS, totalS/6])
      cuentasData.push(['DEPÓSITO', cb.numero, cb.banco, cb.titular, ...depositos, totalD, totalD/6])
    })
    cuentasData.push([])
    cuentasData.push(['RESUMEN'])
    cuentasData.push(['Depósitos Promedio Semestral', totalDepSemestre / 6])
    cuentasData.push(['Monto Solicitado', parseNum(c.montoSolicitado)])
    cuentasData.push(['Cobertura (veces)', parseNum(c.montoSolicitado) > 0 ? (totalDepSemestre / 6) / parseNum(c.montoSolicitado) : 0])

    const wsCuentas = XLSX.utils.aoa_to_sheet(cuentasData)
    wsCuentas['!cols'] = [{wch: 12}, {wch: 20}, {wch: 12}, {wch: 25}, {wch: 14}, {wch: 14}, {wch: 14}, {wch: 14}, {wch: 14}, {wch: 14}, {wch: 16}, {wch: 16}]
    XLSX.utils.book_append_sheet(wb, wsCuentas, 'Cuentas Bancarias')

    // === HOJA 3: ESTADO DE RESULTADOS ===
    const labels = { y1: state.financieros.er.y1Label, y2: state.financieros.er.y2Label, y3: state.financieros.er.y3Label }
    const erData = [
      ['ESTADO DE RESULTADOS'],
      [],
      ['Concepto', labels.y1, labels.y2, labels.y3],
      ['Ventas Totales', parseNum(state.financieros.er.ventas[0]), parseNum(state.financieros.er.ventas[1]), parseNum(state.financieros.er.ventas[2])],
      ['(-) Descuentos', parseNum(state.financieros.er.descuentos[0]), parseNum(state.financieros.er.descuentos[1]), parseNum(state.financieros.er.descuentos[2])],
      ['(+) Otros Ingresos', parseNum(state.financieros.er.otrosIngresos[0]), parseNum(state.financieros.er.otrosIngresos[1]), parseNum(state.financieros.er.otrosIngresos[2])],
      ['= Ventas Netas', er.y1.ventasNetas, er.y2.ventasNetas, er.y3.ventasNetas],
      ['(-) Costo de Venta', er.y1.costoVenta, er.y2.costoVenta, er.y3.costoVenta],
      ['= Utilidad Bruta', er.y1.utilBruta, er.y2.utilBruta, er.y3.utilBruta],
      ['  Margen Bruto %', er.y1.margenBruto, er.y2.margenBruto, er.y3.margenBruto],
      ['(-) Gastos de Venta', er.y1.gastosVenta, er.y2.gastosVenta, er.y3.gastosVenta],
      ['(-) Gastos de Operación', er.y1.gastosOperacion, er.y2.gastosOperacion, er.y3.gastosOperacion],
      ['(-) Otros Gastos', er.y1.otrosGastos, er.y2.otrosGastos, er.y3.otrosGastos],
      ['= Total Gastos Op', er.y1.totalGastosOp, er.y2.totalGastosOp, er.y3.totalGastosOp],
      ['= Utilidad Operativa', er.y1.utilOperativa, er.y2.utilOperativa, er.y3.utilOperativa],
      ['  Margen Operativo %', er.y1.margenOperativo, er.y2.margenOperativo, er.y3.margenOperativo],
      ['(-) Gastos Financieros', er.y1.gastosFinancieros, er.y2.gastosFinancieros, er.y3.gastosFinancieros],
      ['(+) Productos Financieros', er.y1.productosFinancieros, er.y2.productosFinancieros, er.y3.productosFinancieros],
      ['= RI Financiamiento', er.y1.riFinanciamiento, er.y2.riFinanciamiento, er.y3.riFinanciamiento],
      ['= Utilidad Antes Imp', er.y1.utilAntesImp, er.y2.utilAntesImp, er.y3.utilAntesImp],
      ['(-) ISR', er.y1.isr, er.y2.isr, er.y3.isr],
      ['(-) PTU', er.y1.ptu, er.y2.ptu, er.y3.ptu],
      ['= UTILIDAD NETA', er.y1.utilNeta, er.y2.utilNeta, er.y3.utilNeta],
      ['  Margen Neto %', er.y1.margenNeto, er.y2.margenNeto, er.y3.margenNeto]
    ]
    const wsER = XLSX.utils.aoa_to_sheet(erData)
    wsER['!cols'] = [{wch: 30}, {wch: 18}, {wch: 18}, {wch: 18}]
    XLSX.utils.book_append_sheet(wb, wsER, 'Estado Resultados')

    // === HOJA 4: BALANCE GENERAL ===
    const bgData = [
      ['BALANCE GENERAL'],
      [],
      ['Concepto', labels.y1, labels.y2, labels.y3],
      ['=== ACTIVO ==='],
      ['Efectivo', bg.y1.efectivo, bg.y2.efectivo, bg.y3.efectivo],
      ['Clientes', bg.y1.clientes, bg.y2.clientes, bg.y3.clientes],
      ['Deudores Diversos', bg.y1.deudoresDiversos, bg.y2.deudoresDiversos, bg.y3.deudoresDiversos],
      ['Inventarios', bg.y1.inventarios, bg.y2.inventarios, bg.y3.inventarios],
      ['Otros Activos CP', bg.y1.otrosActivosCP, bg.y2.otrosActivosCP, bg.y3.otrosActivosCP],
      ['= Activo Circulante', bg.y1.activoCirculante, bg.y2.activoCirculante, bg.y3.activoCirculante],
      ['Activo Fijo', bg.y1.activoFijo, bg.y2.activoFijo, bg.y3.activoFijo],
      ['Otros Activos LP', bg.y1.otrosActivosLP, bg.y2.otrosActivosLP, bg.y3.otrosActivosLP],
      ['= ACTIVO TOTAL', bg.y1.activoTotal, bg.y2.activoTotal, bg.y3.activoTotal],
      [],
      ['=== PASIVO ==='],
      ['Proveedores', bg.y1.proveedores, bg.y2.proveedores, bg.y3.proveedores],
      ['Acreedores', bg.y1.acreedores, bg.y2.acreedores, bg.y3.acreedores],
      ['Préstamos Financieros CP', bg.y1.prestamosFinancierosCP, bg.y2.prestamosFinancierosCP, bg.y3.prestamosFinancierosCP],
      ['Otros Pasivos CP', bg.y1.otrosPasivosCP, bg.y2.otrosPasivosCP, bg.y3.otrosPasivosCP],
      ['= Total Pasivos CP', bg.y1.totalPasivosCP, bg.y2.totalPasivosCP, bg.y3.totalPasivosCP],
      ['Préstamos Financieros LP', bg.y1.prestamosFinancierosLP, bg.y2.prestamosFinancierosLP, bg.y3.prestamosFinancierosLP],
      ['Otros Pasivos LP', bg.y1.otrosPasivosLP, bg.y2.otrosPasivosLP, bg.y3.otrosPasivosLP],
      ['= Total Pasivos LP', bg.y1.totalPasivosLP, bg.y2.totalPasivosLP, bg.y3.totalPasivosLP],
      ['= PASIVO TOTAL', bg.y1.pasivoTotal, bg.y2.pasivoTotal, bg.y3.pasivoTotal],
      [],
      ['=== CAPITAL ==='],
      ['Capital Social Fijo', bg.y1.capitalSocialFijo, bg.y2.capitalSocialFijo, bg.y3.capitalSocialFijo],
      ['Capital Social Variable', bg.y1.capitalSocialVariable, bg.y2.capitalSocialVariable, bg.y3.capitalSocialVariable],
      ['Reserva Legal', bg.y1.reservaLegal, bg.y2.reservaLegal, bg.y3.reservaLegal],
      ['Resultados Anteriores', bg.y1.resultadosAnteriores, bg.y2.resultadosAnteriores, bg.y3.resultadosAnteriores],
      ['Resultado del Ejercicio', bg.y1.resultadoEjercicio, bg.y2.resultadoEjercicio, bg.y3.resultadoEjercicio],
      ['Otras Cuentas Capital', bg.y1.otrasCuentasCapital, bg.y2.otrasCuentasCapital, bg.y3.otrasCuentasCapital],
      ['= CAPITAL', bg.y1.capital, bg.y2.capital, bg.y3.capital],
      ['= PASIVO + CAPITAL', bg.y1.pc, bg.y2.pc, bg.y3.pc]
    ]
    const wsBG = XLSX.utils.aoa_to_sheet(bgData)
    wsBG['!cols'] = [{wch: 30}, {wch: 18}, {wch: 18}, {wch: 18}]
    XLSX.utils.book_append_sheet(wb, wsBG, 'Balance General')

    // === HOJA 5: RAZONES FINANCIERAS ===
    const razonesData = [
      ['RAZONES FINANCIERAS'],
      [],
      ['Razón', labels.y1, labels.y2, labels.y3],
      ['Razón de Endeudamiento %', razones.y1.razonEndeudamiento, razones.y2.razonEndeudamiento, razones.y3.razonEndeudamiento],
      ['Apalancamiento', razones.y1.apalancamiento, razones.y2.apalancamiento, razones.y3.apalancamiento],
      ['Solvencia', razones.y1.solvenciaCT, razones.y2.solvenciaCT, razones.y3.solvenciaCT],
      ['Liquidez Ácida', razones.y1.liquidezAcida, razones.y2.liquidezAcida, razones.y3.liquidezAcida],
      ['Liquidez Inmediata', razones.y1.liquidezInmediata, razones.y2.liquidezInmediata, razones.y3.liquidezInmediata],
      ['ROA %', razones.y1.roa, razones.y2.roa, razones.y3.roa],
      ['ROE %', razones.y1.roe, razones.y2.roe, razones.y3.roe],
      ['Margen Operativo %', razones.y1.margenOperativo, razones.y2.margenOperativo, razones.y3.margenOperativo],
      ['Margen Neto %', razones.y1.margenNeto, razones.y2.margenNeto, razones.y3.margenNeto],
      ['Días Inventario', razones.y1.diasInventario, razones.y2.diasInventario, razones.y3.diasInventario],
      ['Días CxC', razones.y1.diasCxC, razones.y2.diasCxC, razones.y3.diasCxC],
      ['Días CxP', razones.y1.diasCxP, razones.y2.diasCxP, razones.y3.diasCxP],
      ['Ciclo Operativo', razones.y1.cicloOperativo, razones.y2.cicloOperativo, razones.y3.cicloOperativo],
      ['Capital de Trabajo Neto', razones.y1.capitalTrabajoNeto, razones.y2.capitalTrabajoNeto, razones.y3.capitalTrabajoNeto]
    ]
    const wsRazones = XLSX.utils.aoa_to_sheet(razonesData)
    wsRazones['!cols'] = [{wch: 32}, {wch: 18}, {wch: 18}, {wch: 18}]
    XLSX.utils.book_append_sheet(wb, wsRazones, 'Razones')

    // === HOJAS 6-7: BURÓS ===
    const buroPFData = [
      ['BURÓ DE CRÉDITO - PERSONA FÍSICA'],
      [],
      ['Nombre', state.buroPF.nombre],
      ['RFC', state.buroPF.rfc],
      ['Fecha de Consulta', state.buroPF.fechaConsulta],
      ['Folio', state.buroPF.folio],
      [],
      ['CRÉDITOS BANCARIOS ACTIVOS'],
      ['Otorgante', 'Cuenta', 'Tipo', 'Saldo', 'MOP', 'Estatus']
    ]
    ;(state.buroPF.creditosBancariosActivos || []).forEach(c => buroPFData.push([c.otorgante, c.cuenta, c.tipo, parseNum(c.saldo), c.mop, c.estatus]))
    buroPFData.push([], ['CRÉDITOS NO BANCARIOS ACTIVOS'], ['Otorgante', 'Cuenta', 'Tipo', 'Saldo', 'MOP', 'Estatus'])
    ;(state.buroPF.creditosNoBancariosActivos || []).forEach(c => buroPFData.push([c.otorgante, c.cuenta, c.tipo, parseNum(c.saldo), c.mop, c.estatus]))
    const wsBuroPF = XLSX.utils.aoa_to_sheet(buroPFData)
    wsBuroPF['!cols'] = [{wch: 30}, {wch: 25}, {wch: 25}, {wch: 14}, {wch: 8}, {wch: 30}]
    XLSX.utils.book_append_sheet(wb, wsBuroPF, 'Buró PF')

    const buroPMData = [
      ['BURÓ DE CRÉDITO - PERSONA MORAL'],
      [],
      ['Empresa', state.buroPM.empresa],
      ['RFC', state.buroPM.rfc],
      ['Fecha de Consulta', state.buroPM.fechaConsulta],
      [],
      ['CRÉDITOS FINANCIEROS ACTIVOS (miles de pesos)'],
      ['Otorgante', 'Contrato', 'Tipo', 'Otorgado', 'Saldo', 'MOP', 'Estatus']
    ]
    ;(state.buroPM.creditosFinancierosActivos || []).forEach(c => buroPMData.push([c.otorgante, c.contrato, c.tipo, parseNum(c.creditoOtorgado), parseNum(c.saldoActual), c.mop, c.estatus]))
    const wsBuroPM = XLSX.utils.aoa_to_sheet(buroPMData)
    wsBuroPM['!cols'] = [{wch: 32}, {wch: 25}, {wch: 25}, {wch: 14}, {wch: 14}, {wch: 8}, {wch: 35}]
    XLSX.utils.book_append_sheet(wb, wsBuroPM, 'Buró PM')

    // === HOJA 8: CAPACIDAD ===
    const capacidadData = [
      ['ANÁLISIS DE CAPACIDAD DE PAGO'],
      [],
      ['Monto Solicitado', parseNum(c.montoSolicitado)],
      ['Tasa Anual %', parseNum(state.capacidad.tasaAnual)],
      ['Plazo (meses)', parseNum(state.capacidad.plazoMeses)],
      ['Flujo Mensual Disponible', parseNum(state.capacidad.flujoMensualDisponible)],
      [],
      ['CÁLCULOS'],
      ['Pago Mensual (PMT)', calc.pmt],
      ['DSCR Base', calc.dscr],
      ['DSCR Sensibilidad -10%', calc.dscrSens10],
      ['DSCR Sensibilidad -20%', calc.dscrSens20],
      ['Monto Máx. por Flujo', calc.montoMaximo],
      ['Monto Máx. por Garantías', calc.montoMaxGarantias],
      ['Monto Recomendable', calc.montoRecomendable]
    ]
    const wsCapacidad = XLSX.utils.aoa_to_sheet(capacidadData)
    wsCapacidad['!cols'] = [{wch: 35}, {wch: 20}]
    XLSX.utils.book_append_sheet(wb, wsCapacidad, 'Capacidad Pago')

    // === HOJA 9: DICTAMEN ===
    const d = state.dictamen
    const r = state.riesgo
    const dictamenData = [
      ['DICTAMEN FINAL · RC CORPORATIVO'],
      [],
      ['Cliente', c.empresa],
      ['RFC', c.rfc],
      [],
      ['SCORE INTERNO PONDERADO'],
      ['Dimensión', 'Score', 'Peso %', 'Contribución'],
      ['Salud Financiera', r.scoreFinanzas, 35, r.scoreFinanzas * 0.35],
      ['Comportamiento en Buró', r.scoreBuro, 25, r.scoreBuro * 0.25],
      ['Capacidad de Pago', r.scoreCapacidad, 20, r.scoreCapacidad * 0.20],
      ['Análisis Cualitativo', r.scoreCualitativo, 10, r.scoreCualitativo * 0.10],
      ['Alertas Predictivas', r.scoreIA, 10, r.scoreIA * 0.10],
      ['SCORE FINAL', '', '', score.scoreFinal],
      ['Nivel de Riesgo', score.nivel],
      [],
      ['DECISIÓN', decisionMap[d.decision] || 'PENDIENTE'],
      ['Monto Aprobado', parseNum(d.montoAprobado)],
      ['Plazo (meses)', d.plazoAprobado],
      ['Tasa Anual %', d.tasaAprobada],
      [],
      ['PUNTOS A FAVOR']
    ]
    ;(d.puntosAFavor || []).forEach((p, i) => dictamenData.push([`${i+1}. ${p}`]))
    dictamenData.push([], ['PUNTOS EN CONTRA'])
    ;(d.puntosEnContra || []).forEach((p, i) => dictamenData.push([`${i+1}. ${p}`]))
    dictamenData.push([], ['ACLARACIONES'])
    ;(d.aclaraciones || []).forEach((p, i) => dictamenData.push([`${i+1}. ${p}`]))
    dictamenData.push([], ['COMENTARIOS'])
    ;(d.comentarios || []).forEach((p, i) => dictamenData.push([`${i+1}. ${p}`]))
    dictamenData.push([], ['CONDICIONES'])
    ;(d.condiciones || []).forEach((p, i) => dictamenData.push([`${i+1}. ${p}`]))

    const wsDictamen = XLSX.utils.aoa_to_sheet(dictamenData)
    wsDictamen['!cols'] = [{wch: 80}, {wch: 15}, {wch: 12}, {wch: 15}]
    XLSX.utils.book_append_sheet(wb, wsDictamen, 'Dictamen')

    const empresa = c.empresa || 'caso_sin_nombre'
    const filename = `RC_${empresa.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`
    XLSX.writeFile(wb, filename)
  } catch (err) {
    console.error('Error Excel:', err)
    alert('Error al exportar Excel: ' + err.message)
  }
}

// === EXPORTAR PDF (refinado ejecutivo) ===
export function exportPDF(state) {
  const c = state.caratula
  const er = calcER(state)
  const bg = calcBG(state)
  const razones = calcRazones(state)
  const calc = calcCapacidad(state)
  const score = calcScore(state)
  const d = state.dictamen
  const r = state.riesgo

  const fechaActual = new Date().toLocaleDateString('es-MX', { day:'numeric', month:'long', year:'numeric' })

  const pdfHTML = buildPDFHTML({ c, er, bg, razones, calc, score, d, r, state, fechaActual })

  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) {
    alert('Permite ventanas emergentes para imprimir')
    return
  }
  printWindow.document.write(pdfHTML)
  printWindow.document.close()
}

function buildPDFHTML({ c, er, bg, razones, calc, score, d, r, state, fechaActual }) {
  const labels = { y1: state.financieros.er.y1Label, y2: state.financieros.er.y2Label, y3: state.financieros.er.y3Label }
  const scriptTag1 = '<scr' + 'ipt>'
  const scriptTag2 = '</scr' + 'ipt>'

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>RC Corporativo · Dictamen ${c.empresa || 'Cliente'}</title>
<style>
  @page { size: letter; margin: 0.55in 0.5in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1A1A1A; font-size: 10pt; line-height: 1.45; }
  .page-break { page-break-before: always; }
  .no-break { page-break-inside: avoid; }

  .pdf-header { border-bottom: 3px solid #3D5A2E; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
  .pdf-logo-wrap { display: flex; align-items: center; gap: 12px; }
  .pdf-logo-box { width: 46px; height: 46px; background: #3D5A2E; color: white; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-weight: 700; font-size: 20px; border-radius: 3px; }
  .pdf-logo-title { font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #1A1A1A; line-height: 1; }
  .pdf-logo-sub { font-size: 8pt; color: #6B6B6B; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 3px; }
  .pdf-header-right { text-align: right; font-size: 9pt; color: #6B6B6B; }
  .pdf-header-right .doc-badge { display: inline-block; background: #3D5A2E; color: white; padding: 4px 10px; border-radius: 2px; font-size: 8pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }

  h1.doc-title { font-family: Georgia, serif; font-size: 22pt; font-weight: 700; color: #3D5A2E; margin-bottom: 4px; letter-spacing: -0.01em; }
  .doc-subtitle { font-size: 11pt; color: #6B6B6B; margin-bottom: 18px; }

  .verdict-box { padding: 18px 22px; border-radius: 5px; border: 2px solid; margin-bottom: 20px; }
  .verdict-label { font-size: 9pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px; }
  .verdict-title { font-family: Georgia, serif; font-size: 20pt; font-weight: 700; margin-bottom: 10px; line-height: 1.1; }
  .verdict-desc { font-size: 10pt; line-height: 1.65; }

  h2.section { background: #3D5A2E; color: white; padding: 8px 14px; font-size: 11pt; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin: 18px 0 12px 0; border-radius: 2px; }
  h3.subsection { color: #3D5A2E; font-size: 10pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin: 14px 0 6px 0; border-bottom: 1px solid #E5E2D9; padding-bottom: 4px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9pt; }
  table th, table td { padding: 6px 9px; border-bottom: 1px solid #E5E2D9; text-align: left; }
  table th { background: #F5F3EC; font-weight: 700; font-size: 8pt; color: #6B6B6B; letter-spacing: 0.05em; text-transform: uppercase; }
  table td.num { text-align: right; font-variant-numeric: tabular-nums; font-family: Georgia, serif; }
  table tr.subtotal td { background: #F5F3EC; font-weight: 700; }
  table tr.total td { background: #E8EFE2; font-weight: 700; color: #3D5A2E; border-top: 2px solid #3D5A2E; }
  .label-cell { font-weight: 600; width: 35%; color: #6B6B6B; }

  .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
  .kpi-box { border: 1px solid #E5E2D9; padding: 10px; border-radius: 3px; }
  .kpi-label { font-size: 8pt; color: #3D5A2E; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
  .kpi-value { font-family: Georgia, serif; font-size: 13pt; font-weight: 700; }
  .kpi-sub { font-size: 8pt; color: #6B6B6B; margin-top: 2px; }

  .list-item { margin-bottom: 7px; padding-left: 16px; position: relative; font-size: 10pt; line-height: 1.6; }
  .list-item::before { content: ""; position: absolute; left: 0; top: 8px; width: 7px; height: 7px; border-radius: 50%; }
  .list-favor::before { background: #2E7D32; }
  .list-contra::before { background: #B23A3A; }
  .list-aclar::before { background: #C68A2E; }
  .list-info::before { background: #2A6F97; }
  .list-cond::before { background: #3D5A2E; }

  .footer-pdf { margin-top: 32px; padding-top: 14px; border-top: 1px solid #E5E2D9; display: flex; justify-content: space-between; font-size: 8pt; color: #9A9A9A; letter-spacing: 0.1em; }
  .footer-pdf b { color: #3D5A2E; }

  .score-card { background: linear-gradient(135deg, #3D5A2E 0%, #2A4020 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; margin: 12px 0; }
  .score-card.amber { background: linear-gradient(135deg, #C68A2E 0%, #8A5F1A 100%); }
  .score-card.red { background: linear-gradient(135deg, #B23A3A 0%, #7A1F1F 100%); }
  .score-eyebrow { font-size: 8pt; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.85; margin-bottom: 4px; }
  .score-number { font-family: Georgia, serif; font-size: 40pt; font-weight: 700; line-height: 1; }
  .score-of { font-size: 18pt; opacity: 0.7; }
  .score-label { font-size: 10pt; margin-top: 6px; letter-spacing: 0.05em; }

  .signature-block { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; }
  .signature-line { border-top: 1px solid #6B6B6B; padding-top: 8px; text-align: center; font-size: 9pt; color: #6B6B6B; }
  .signature-line b { display: block; color: #1A1A1A; font-size: 10pt; margin-bottom: 2px; }

  .summary-table td { padding: 7px 9px; }
  .summary-table .label-cell { width: 40%; }
</style>
</head>
<body>

<div class="pdf-header">
  <div class="pdf-logo-wrap">
    <div class="pdf-logo-box">RC</div>
    <div>
      <div class="pdf-logo-title">RC corporativo<sup style="font-size:8pt">®</sup></div>
      <div class="pdf-logo-sub">Consultoría Financiera · Recursos & Capital</div>
    </div>
  </div>
  <div class="pdf-header-right">
    <div class="doc-badge">Dictamen Crediticio</div>
    <div>${fechaActual}</div>
  </div>
</div>

<h1 class="doc-title">${c.empresa || 'Cliente'}</h1>
<div class="doc-subtitle">RFC: ${c.rfc || '—'} · Análisis Crediticio Integral</div>

${d.decision ? `
<div class="verdict-box" style="background:${d.decision==='aprobado'?'#E8EFE2':d.decision==='condicionado'?'#FEF7E6':d.decision==='info'?'#EBF5FA':'#FEEBEB'};border-color:${decisionColor[d.decision]}">
  <div class="verdict-label" style="color:${decisionColor[d.decision]}">Recomendación Ejecutiva</div>
  <div class="verdict-title" style="color:${decisionColor[d.decision]}">${decisionMap[d.decision]}</div>
  <div class="verdict-desc">
    Score Interno: <b>${score.scoreFinal.toFixed(0)}/100</b> · ${score.nivel}<br>
    Monto Aprobado: <b>${d.montoAprobado ? fmtMoney(d.montoAprobado) : '—'}</b> · Plazo: <b>${d.plazoAprobado || '—'} meses</b> · Tasa: <b>${d.tasaAprobada ? d.tasaAprobada+'%' : '—'}</b>
  </div>
</div>
` : ''}

<h2 class="section">1. Datos del Cliente</h2>
<table class="summary-table">
  <tr><td class="label-cell">Razón Social</td><td>${c.empresa || '—'}</td></tr>
  <tr><td class="label-cell">RFC</td><td>${c.rfc || '—'}</td></tr>
  <tr><td class="label-cell">Representante Legal</td><td>${c.representanteLegal || '—'}</td></tr>
  <tr><td class="label-cell">Actividad</td><td>${c.actividad || '—'}</td></tr>
  <tr><td class="label-cell">Empleados</td><td>${c.empleados || '—'}</td></tr>
  <tr><td class="label-cell">Domicilio Fiscal</td><td>${c.domicilioFiscal || '—'}</td></tr>
  <tr><td class="label-cell">Principales Clientes</td><td>${c.clientes || '—'}</td></tr>
</table>

<h2 class="section">2. Solicitud de Crédito</h2>
<div class="kpi-row">
  <div class="kpi-box"><div class="kpi-label">Monto Solicitado</div><div class="kpi-value">${fmtMoney(c.montoSolicitado)}</div><div class="kpi-sub">MXN</div></div>
  <div class="kpi-box"><div class="kpi-label">Plazo</div><div class="kpi-value">${c.plazoSolicitado || '—'}<span style="font-size:10pt"> meses</span></div></div>
  <div class="kpi-box"><div class="kpi-label">DSCR</div><div class="kpi-value">${calc.dscr.toFixed(2)}<span style="font-size:10pt">x</span></div></div>
  <div class="kpi-box"><div class="kpi-label">Score</div><div class="kpi-value">${score.scoreFinal.toFixed(0)}<span style="font-size:10pt">/100</span></div></div>
</div>
<table>
  <tr><td class="label-cell">Destino del Crédito</td><td>${c.destinoCredito || '—'}</td></tr>
</table>

<h2 class="section">3. Indicadores Financieros Clave</h2>
<table>
  <thead><tr><th>Indicador</th><th class="num">${labels.y1}</th><th class="num">${labels.y2}</th><th class="num">${labels.y3}</th></tr></thead>
  <tbody>
    <tr><td>Ventas Netas</td><td class="num">${fmtMoney(er.y1.ventasNetas)}</td><td class="num">${fmtMoney(er.y2.ventasNetas)}</td><td class="num">${fmtMoney(er.y3.ventasNetas)}</td></tr>
    <tr><td>Utilidad Bruta</td><td class="num">${fmtMoney(er.y1.utilBruta)}</td><td class="num">${fmtMoney(er.y2.utilBruta)}</td><td class="num">${fmtMoney(er.y3.utilBruta)}</td></tr>
    <tr><td>Utilidad Operativa</td><td class="num">${fmtMoney(er.y1.utilOperativa)}</td><td class="num">${fmtMoney(er.y2.utilOperativa)}</td><td class="num">${fmtMoney(er.y3.utilOperativa)}</td></tr>
    <tr class="total"><td><b>Utilidad Neta</b></td><td class="num">${fmtMoney(er.y1.utilNeta)}</td><td class="num">${fmtMoney(er.y2.utilNeta)}</td><td class="num">${fmtMoney(er.y3.utilNeta)}</td></tr>
    <tr><td>Margen Neto %</td><td class="num">${er.y1.margenNeto.toFixed(2)}%</td><td class="num">${er.y2.margenNeto.toFixed(2)}%</td><td class="num">${er.y3.margenNeto.toFixed(2)}%</td></tr>
    <tr><td>Activo Total</td><td class="num">${fmtMoney(bg.y1.activoTotal)}</td><td class="num">${fmtMoney(bg.y2.activoTotal)}</td><td class="num">${fmtMoney(bg.y3.activoTotal)}</td></tr>
    <tr><td>Pasivo Total</td><td class="num">${fmtMoney(bg.y1.pasivoTotal)}</td><td class="num">${fmtMoney(bg.y2.pasivoTotal)}</td><td class="num">${fmtMoney(bg.y3.pasivoTotal)}</td></tr>
    <tr><td>Capital</td><td class="num">${fmtMoney(bg.y1.capital)}</td><td class="num">${fmtMoney(bg.y2.capital)}</td><td class="num">${fmtMoney(bg.y3.capital)}</td></tr>
  </tbody>
</table>

<h3 class="subsection">Razones Financieras Clave</h3>
<table>
  <thead><tr><th>Razón</th><th class="num">${labels.y1}</th><th class="num">${labels.y2}</th><th class="num">${labels.y3}</th></tr></thead>
  <tbody>
    <tr><td>Razón de Endeudamiento</td><td class="num">${razones.y1.razonEndeudamiento.toFixed(2)}%</td><td class="num">${razones.y2.razonEndeudamiento.toFixed(2)}%</td><td class="num">${razones.y3.razonEndeudamiento.toFixed(2)}%</td></tr>
    <tr><td>Apalancamiento</td><td class="num">${razones.y1.apalancamiento.toFixed(2)}</td><td class="num">${razones.y2.apalancamiento.toFixed(2)}</td><td class="num">${razones.y3.apalancamiento.toFixed(2)}</td></tr>
    <tr><td>Solvencia</td><td class="num">${razones.y1.solvenciaCT.toFixed(2)}</td><td class="num">${razones.y2.solvenciaCT.toFixed(2)}</td><td class="num">${razones.y3.solvenciaCT.toFixed(2)}</td></tr>
    <tr><td>ROA</td><td class="num">${razones.y1.roa.toFixed(2)}%</td><td class="num">${razones.y2.roa.toFixed(2)}%</td><td class="num">${razones.y3.roa.toFixed(2)}%</td></tr>
    <tr><td>ROE</td><td class="num">${razones.y1.roe.toFixed(2)}%</td><td class="num">${razones.y2.roe.toFixed(2)}%</td><td class="num">${razones.y3.roe.toFixed(2)}%</td></tr>
    <tr><td>Días CxC</td><td class="num">${razones.y1.diasCxC.toFixed(0)}</td><td class="num">${razones.y2.diasCxC.toFixed(0)}</td><td class="num">${razones.y3.diasCxC.toFixed(0)}</td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<h2 class="section">4. Score Interno de Riesgo</h2>
<div class="score-card ${score.color}">
  <div class="score-eyebrow">Score Ponderado</div>
  <div class="score-number">${score.scoreFinal.toFixed(0)}<span class="score-of">/100</span></div>
  <div class="score-label">${score.nivel}</div>
</div>
<table>
  <thead><tr><th>Dimensión</th><th class="num">Score</th><th class="num">Peso</th><th class="num">Contribución</th></tr></thead>
  <tbody>
    <tr><td>Salud Financiera</td><td class="num">${r.scoreFinanzas}</td><td class="num">35%</td><td class="num">${(r.scoreFinanzas*0.35).toFixed(1)}</td></tr>
    <tr><td>Comportamiento en Buró</td><td class="num">${r.scoreBuro}</td><td class="num">25%</td><td class="num">${(r.scoreBuro*0.25).toFixed(1)}</td></tr>
    <tr><td>Capacidad de Pago</td><td class="num">${r.scoreCapacidad}</td><td class="num">20%</td><td class="num">${(r.scoreCapacidad*0.20).toFixed(1)}</td></tr>
    <tr><td>Análisis Cualitativo</td><td class="num">${r.scoreCualitativo}</td><td class="num">10%</td><td class="num">${(r.scoreCualitativo*0.10).toFixed(1)}</td></tr>
    <tr><td>Alertas Predictivas</td><td class="num">${r.scoreIA}</td><td class="num">10%</td><td class="num">${(r.scoreIA*0.10).toFixed(1)}</td></tr>
    <tr class="total"><td><b>TOTAL</b></td><td></td><td></td><td class="num">${score.scoreFinal.toFixed(2)}</td></tr>
  </tbody>
</table>

<h2 class="section">5. Análisis de Capacidad de Pago</h2>
<table class="summary-table">
  <tr><td class="label-cell">Pago Mensual (PMT)</td><td class="num"><b>${fmtMoney(calc.pmt, 2)}</b></td></tr>
  <tr><td class="label-cell">Flujo Mensual Disponible</td><td class="num">${fmtMoney(state.capacidad.flujoMensualDisponible)}</td></tr>
  <tr><td class="label-cell">DSCR Base</td><td class="num"><b>${calc.dscr.toFixed(2)}x</b></td></tr>
  <tr><td class="label-cell">DSCR Sensibilidad -10%</td><td class="num">${calc.dscrSens10.toFixed(2)}x</td></tr>
  <tr><td class="label-cell">DSCR Sensibilidad -20%</td><td class="num">${calc.dscrSens20.toFixed(2)}x</td></tr>
  <tr><td class="label-cell">Valor de Garantías</td><td class="num">${fmtMoney(state.capacidad.valorGarantias)}</td></tr>
  <tr><td class="label-cell">Monto Máximo Recomendable</td><td class="num"><b>${fmtMoney(calc.montoRecomendable)}</b></td></tr>
</table>

<div class="page-break"></div>

<h2 class="section">6. Análisis Cualitativo del Dictamen</h2>

${(d.puntosAFavor||[]).length > 0 ? `
<h3 class="subsection" style="color:#2E7D32">✓ Puntos a Favor</h3>
${d.puntosAFavor.map(p => `<div class="list-item list-favor">${p}</div>`).join('')}
` : ''}

${(d.puntosEnContra||[]).length > 0 ? `
<h3 class="subsection" style="color:#B23A3A">✗ Puntos en Contra</h3>
${d.puntosEnContra.map(p => `<div class="list-item list-contra">${p}</div>`).join('')}
` : ''}

${(d.aclaraciones||[]).length > 0 ? `
<h3 class="subsection" style="color:#C68A2E">? Aclaraciones Pendientes</h3>
${d.aclaraciones.map(p => `<div class="list-item list-aclar">${p}</div>`).join('')}
` : ''}

${(d.comentarios||[]).length > 0 ? `
<h3 class="subsection" style="color:#2A6F97">i Comentarios Adicionales</h3>
${d.comentarios.map(p => `<div class="list-item list-info">${p}</div>`).join('')}
` : ''}

${(d.condiciones||[]).length > 0 ? `
<h2 class="section">7. Condiciones del Crédito</h2>
${d.condiciones.map(p => `<div class="list-item list-cond">${p}</div>`).join('')}
` : ''}

<div class="signature-block">
  <div class="signature-line">
    <b>Analista de Crédito</b>
    RC Corporativo
  </div>
  <div class="signature-line">
    <b>Gerente de Crédito</b>
    Autorización
  </div>
</div>

<div class="footer-pdf">
  <div>© ${new Date().getFullYear()} RC Corporativo · Consultoría Financiera · Recursos & Capital</div>
  <div>Powered by <b>AXON B2B</b></div>
</div>

${scriptTag1}
  window.onload = function() {
    setTimeout(function() { window.print(); }, 400);
  };
  window.onafterprint = function() {
    setTimeout(function() { window.close(); }, 300);
  };
${scriptTag2}
</body>
</html>`
}
