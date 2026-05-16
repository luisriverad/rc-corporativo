// ============================================================
// MOTORES DE CÁLCULO FINANCIERO
// Replica la lógica exacta del PDF de RC Corporativo
// ============================================================

export function parseNum(v) {
  if (v === '' || v === null || v === undefined) return 0
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}

export function fmtMoney(n, decimals = 0) {
  const num = parseFloat(n)
  if (isNaN(num)) return '$0'
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function fmtPct(n, decimals = 1) {
  const num = parseFloat(n)
  if (isNaN(num)) return '0%'
  return num.toFixed(decimals) + '%'
}

// Calcula TODOS los renglones derivados del Estado de Resultados para los 3 ejercicios
export function calcER(state) {
  const er = state.financieros.er
  const out = { y1:{}, y2:{}, y3:{} }
  ;['y1','y2','y3'].forEach((y, idx) => {
    const v = parseNum(er.ventas[idx])
    const d = parseNum(er.descuentos[idx])
    const oi = parseNum(er.otrosIngresos[idx])
    const cv = parseNum(er.costoVenta[idx])
    const gv = parseNum(er.gastosVenta[idx])
    const go = parseNum(er.gastosOperacion[idx])
    const og = parseNum(er.otrosGastos[idx])
    const gf = parseNum(er.gastosFinancieros[idx])
    const pf = parseNum(er.productosFinancieros[idx])
    const op = parseNum(er.otrosProductos[idx])
    const isr = parseNum(er.isr[idx])
    const ptu = parseNum(er.ptu[idx])

    const ventasNetas = v - d + oi
    const utilBruta = ventasNetas - cv
    const totalGastosOp = gv + go + og
    const utilOperativa = utilBruta - totalGastosOp
    const riFinanciamiento = pf + op - gf
    const utilAntesImp = utilOperativa + riFinanciamiento
    const utilNeta = utilAntesImp - isr - ptu

    out[y] = {
      ventas: v, descuentos: d, otrosIngresos: oi,
      ventasNetas, costoVenta: cv, utilBruta,
      gastosVenta: gv, gastosOperacion: go, otrosGastos: og, totalGastosOp,
      utilOperativa, gastosFinancieros: gf, productosFinancieros: pf, otrosProductos: op,
      riFinanciamiento, utilAntesImp, isr, ptu, utilNeta,
      margenBruto: ventasNetas > 0 ? (utilBruta/ventasNetas)*100 : 0,
      margenOperativo: ventasNetas > 0 ? (utilOperativa/ventasNetas)*100 : 0,
      margenNeto: ventasNetas > 0 ? (utilNeta/ventasNetas)*100 : 0,
      promMensualVentas: ventasNetas / 12,
      y1Label: er.y1Label, y2Label: er.y2Label, y3Label: er.y3Label
    }
  })
  return out
}

export function calcBG(state) {
  const bg = state.financieros.bg
  const erCalc = calcER(state)
  const out = { y1:{}, y2:{}, y3:{} }
  ;['y1','y2','y3'].forEach((y, idx) => {
    const efectivo = parseNum(bg.efectivo[idx])
    const clientes = parseNum(bg.clientes[idx])
    const dd = parseNum(bg.deudoresDiversos[idx])
    const inv = parseNum(bg.inventarios[idx])
    const oacp = parseNum(bg.otrosActivosCP[idx])
    const af = parseNum(bg.activoFijo[idx])
    const oalp = parseNum(bg.otrosActivosLP[idx])

    const proveedores = parseNum(bg.proveedores[idx])
    const acreedores = parseNum(bg.acreedores[idx])
    const pfcp = parseNum(bg.prestamosFinancierosCP[idx])
    const opcp = parseNum(bg.otrosPasivosCP[idx])
    const pflp = parseNum(bg.prestamosFinancierosLP[idx])
    const oplp = parseNum(bg.otrosPasivosLP[idx])

    const csf = parseNum(bg.capitalSocialFijo[idx])
    const csv = parseNum(bg.capitalSocialVariable[idx])
    const rl = parseNum(bg.reservaLegal[idx])
    const ra = parseNum(bg.resultadosAnteriores[idx])
    const occ = parseNum(bg.otrasCuentasCapital[idx])

    const activoCirculante = efectivo + clientes + dd + inv + oacp
    const activoTotal = activoCirculante + af + oalp
    const totalPasivosCP = proveedores + acreedores + pfcp + opcp
    const totalPasivosLP = pflp + oplp
    const pasivoTotal = totalPasivosCP + totalPasivosLP
    const resultadoEjercicio = erCalc[y].utilNeta
    const capital = csf + csv + rl + ra + resultadoEjercicio + occ
    const pc = pasivoTotal + capital

    out[y] = {
      efectivo, clientes, deudoresDiversos: dd, inventarios: inv, otrosActivosCP: oacp,
      activoCirculante, activoFijo: af, otrosActivosLP: oalp, activoTotal,
      proveedores, acreedores, prestamosFinancierosCP: pfcp, otrosPasivosCP: opcp, totalPasivosCP,
      prestamosFinancierosLP: pflp, otrosPasivosLP: oplp, totalPasivosLP, pasivoTotal,
      capitalSocialFijo: csf, capitalSocialVariable: csv, reservaLegal: rl,
      resultadosAnteriores: ra, resultadoEjercicio, otrasCuentasCapital: occ, capital,
      pc, diferencia: activoTotal - pc
    }
  })
  return out
}

export function calcRazones(state) {
  const er = calcER(state)
  const bg = calcBG(state)
  const out = { y1:{}, y2:{}, y3:{} }
  ;['y1','y2','y3'].forEach((y, idx) => {
    const e = er[y]
    const b = bg[y]

    const razonEndeudamiento = b.activoTotal > 0 ? (b.pasivoTotal / b.activoTotal) * 100 : 0
    const apalancamiento = b.capital > 0 ? b.pasivoTotal / b.capital : 0
    const solvenciaCT = b.totalPasivosCP > 0 ? b.activoCirculante / b.totalPasivosCP : 0
    const liquidezAcida = b.totalPasivosCP > 0 ? (b.activoCirculante - b.inventarios) / b.totalPasivosCP : 0
    const liquidezInmediata = b.totalPasivosCP > 0 ? b.efectivo / b.totalPasivosCP : 0
    const roa = b.activoTotal > 0 ? (e.utilNeta / b.activoTotal) * 100 : 0
    const roe = b.capital > 0 ? (e.utilNeta / b.capital) * 100 : 0
    const diasInventario = e.costoVenta > 0 ? (b.inventarios / e.costoVenta) * 360 : 0
    const diasCxC = e.ventas > 0 ? (b.clientes / e.ventas) * 360 : 0
    const diasCxP = e.costoVenta > 0 ? (b.proveedores / e.costoVenta) * 360 : 0
    const cicloOperativo = diasInventario + diasCxC
    const capitalTrabajoNeto = b.activoCirculante - b.totalPasivosCP
    const pasivosBancariosVentas = e.ventasNetas > 0 ? ((b.prestamosFinancierosCP + b.prestamosFinancierosLP) / e.ventasNetas) * 100 : 0

    out[y] = {
      razonEndeudamiento, apalancamiento,
      solvenciaCT, liquidezAcida, liquidezInmediata,
      roa, roe, margenOperativo: e.margenOperativo, margenNeto: e.margenNeto, margenBruto: e.margenBruto,
      diasInventario, diasCxC, diasCxP, cicloOperativo, capitalTrabajoNeto,
      pasivosBancariosVentas
    }
  })
  return out
}

export function calcAH(arr) {
  const result = ['', '', '']
  for (let i = 1; i < 3; i++) {
    const prev = parseNum(arr[i-1])
    const curr = parseNum(arr[i])
    if (prev !== 0) result[i] = ((curr - prev) / Math.abs(prev)) * 100
  }
  return result
}

export function calcCapacidad(state) {
  const monto = parseNum(state.caratula.montoSolicitado)
  const tasa = parseNum(state.capacidad.tasaAnual) / 100
  const plazo = parseNum(state.capacidad.plazoMeses)
  const flujoMensual = parseNum(state.capacidad.flujoMensualDisponible)

  let pmt = 0
  if (monto > 0 && tasa > 0 && plazo > 0) {
    const i = tasa / 12
    pmt = monto * (i * Math.pow(1+i, plazo)) / (Math.pow(1+i, plazo) - 1)
  } else if (monto > 0 && plazo > 0) {
    pmt = monto / plazo
  }

  const dscr = pmt > 0 ? flujoMensual / pmt : 0
  const dscrSens10 = pmt > 0 ? (flujoMensual * 0.9) / pmt : 0
  const dscrSens20 = pmt > 0 ? (flujoMensual * 0.8) / pmt : 0

  const dscrObjetivo = 1.5
  let montoMaximo = 0
  if (tasa > 0 && plazo > 0) {
    const i = tasa / 12
    const pmtMax = flujoMensual / dscrObjetivo
    montoMaximo = pmtMax * (Math.pow(1+i, plazo) - 1) / (i * Math.pow(1+i, plazo))
  } else if (plazo > 0) {
    montoMaximo = (flujoMensual / dscrObjetivo) * plazo
  }

  const valorGarantias = parseNum(state.capacidad.valorGarantias)
  const ltv = parseNum(state.capacidad.porcentajeLTV) / 100
  const montoMaxGarantias = valorGarantias * ltv

  return {
    pmt, dscr, dscrSens10, dscrSens20,
    montoMaximo, montoMaxGarantias,
    montoRecomendable: Math.min(montoMaximo, montoMaxGarantias)
  }
}

export function calcScore(state) {
  const r = state.riesgo
  const scoreFinal =
    parseNum(r.scoreFinanzas) * 0.35 +
    parseNum(r.scoreBuro) * 0.25 +
    parseNum(r.scoreCapacidad) * 0.20 +
    parseNum(r.scoreCualitativo) * 0.10 +
    parseNum(r.scoreIA) * 0.10

  let nivel = 'Crítico', color = 'red'
  if (scoreFinal >= 85) { nivel = 'Riesgo Bajo'; color = 'green' }
  else if (scoreFinal >= 70) { nivel = 'Riesgo Medio-Bajo'; color = 'green' }
  else if (scoreFinal >= 55) { nivel = 'Riesgo Medio'; color = 'amber' }
  else if (scoreFinal >= 40) { nivel = 'Riesgo Alto'; color = 'red' }

  return { scoreFinal, nivel, color }
}

export function detectAlerts(state) {
  const alerts = []
  const er = calcER(state)
  const bg = calcBG(state)
  const razones = calcRazones(state)
  const c = state.caratula

  if (er.y1.margenNeto > 0 && er.y2.margenNeto < er.y1.margenNeto * 0.5) {
    alerts.push({
      level: 'warn',
      title: 'Deterioro de margen neto',
      desc: `El margen neto cayó de ${er.y1.margenNeto.toFixed(2)}% en ${state.financieros.er.y1Label || 'año 1'} a ${er.y2.margenNeto.toFixed(2)}% en año 2 (deterioro >50%)`
    })
  }

  if (razones.y2.diasCxC > 120) {
    alerts.push({
      level: 'warn',
      title: 'Cuentas por cobrar excesivas',
      desc: `Los días de cuentas por cobrar (${Math.round(razones.y2.diasCxC)} días) superan el umbral recomendado de 90 días. Problema de cobranza detectado.`
    })
  }

  const ddRatio = bg.y2.activoTotal > 0 ? (bg.y2.deudoresDiversos / bg.y2.activoTotal) * 100 : 0
  if (ddRatio > 5) {
    alerts.push({
      level: 'warn',
      title: 'Deudores Diversos sin desglose',
      desc: `Deudores Diversos representa ${ddRatio.toFixed(1)}% del activo total ($${(bg.y2.deudoresDiversos/1000000).toFixed(1)} MDP). Requiere desglose detallado.`
    })
  }

  const monto = parseNum(c.montoSolicitado)
  if (monto > 0) {
    let totalDepositos = 0
    ;(c.cuentasBancarias || []).forEach(cb => {
      for (let i = 1; i <= 6; i++) totalDepositos += parseNum(cb['dm'+i])
    })
    const promMensualDep = totalDepositos / 6
    if (promMensualDep / monto < 2) {
      alerts.push({
        level: 'warn',
        title: 'Cobertura limitada por depósitos',
        desc: `Los depósitos promedio mensuales cubren ${(promMensualDep / monto).toFixed(2)} veces el monto solicitado. Recomendado >2 veces.`
      })
    }
  }

  const consultas = parseNum(state.buroPF.consultasUltimos3Meses)
  if (consultas >= 3) {
    alerts.push({
      level: 'info',
      title: 'Múltiples consultas recientes en buró',
      desc: `${consultas} consultas en los últimos 3 meses. Indica búsqueda activa de crédito por el representante legal.`
    })
  }

  const sumaPart = (c.socios || []).reduce((acc, s) => acc + parseNum(s.participacion), 0)
  if (sumaPart > 0 && Math.abs(sumaPart - 100) > 0.5) {
    alerts.push({
      level: 'warn',
      title: 'Suma de participación accionaria',
      desc: `La suma de % de socios es ${sumaPart.toFixed(1)}%, debe ser 100%. Verificar.`
    })
  }

  return alerts
}

// === COMPLETITUDES ===
export function caratulaCompletionPct(state) {
  const c = state.caratula
  const required = ['empresa','rfc','representanteLegal','telefonos','domicilioFiscal','actividad','empleados','montoSolicitado','destinoCredito']
  let filled = 0
  required.forEach(k => { if (c[k] && String(c[k]).trim() !== '') filled++ })
  const hasSocios = (c.socios||[]).length > 0 ? 1 : 0
  const hasCuentas = (c.cuentasBancarias||[]).length > 0 ? 1 : 0
  return Math.round(((filled + hasSocios + hasCuentas) / (required.length + 2)) * 100)
}

export function financierosCompletionPct(state) {
  const er = state.financieros.er
  const bg = state.financieros.bg
  let total = 0, filled = 0
  ;['ventas','costoVenta','gastosVenta','gastosFinancieros'].forEach(k => {
    er[k].forEach(v => { total++; if (v !== '' && v !== '0') filled++ })
  })
  ;['efectivo','clientes','proveedores','capitalSocialFijo','resultadosAnteriores'].forEach(k => {
    bg[k].forEach(v => { total++; if (v !== '' && v !== '0') filled++ })
  })
  return total > 0 ? Math.round((filled/total)*100) : 0
}

export function buroPFCompletionPct(state) {
  const b = state.buroPF
  const baseFields = ['nombre','fechaConsulta','rfc']
  let filled = 0
  baseFields.forEach(k => { if (b[k] && String(b[k]).trim() !== '') filled++ })
  const hasCredits = (b.creditosBancariosActivos||[]).length + (b.creditosBancariosCerrados||[]).length + (b.creditosNoBancariosActivos||[]).length > 0 ? 1 : 0
  return Math.round(((filled + hasCredits) / 4) * 100)
}

export function buroPMCompletionPct(state) {
  const b = state.buroPM
  const baseFields = ['empresa','rfc','fechaConsulta']
  let filled = 0
  baseFields.forEach(k => { if (b[k] && String(b[k]).trim() !== '') filled++ })
  const hasCredits = (b.creditosFinancierosActivos||[]).length > 0 ? 1 : 0
  return Math.round(((filled + hasCredits) / 4) * 100)
}

export function capacidadCompletionPct(state) {
  const c = state.capacidad
  let filled = 0
  ;['flujoMensualDisponible','tasaAnual','plazoMeses','valorGarantias'].forEach(k => {
    if (parseNum(c[k]) > 0) filled++
  })
  return Math.round((filled/4)*100)
}

export function riesgoCompletionPct(state) {
  const r = state.riesgo
  let filled = 0
  ;['scoreFinanzas','scoreBuro','scoreCapacidad','scoreCualitativo','scoreIA'].forEach(k => {
    if (parseNum(r[k]) > 0) filled++
  })
  return Math.round((filled/5)*100)
}

export function dictamenCompletionPct(state) {
  const d = state.dictamen
  let filled = 0
  if (d.decision) filled++
  if ((d.puntosAFavor||[]).length > 0) filled++
  if ((d.condiciones||[]).length > 0) filled++
  if (parseNum(d.montoAprobado) > 0) filled++
  return Math.round((filled/4)*100)
}

export function moduleCompletionMap(state) {
  return {
    caratula: caratulaCompletionPct(state),
    financieros: financierosCompletionPct(state),
    analisis: financierosCompletionPct(state),
    buroPF: buroPFCompletionPct(state),
    buroPM: buroPMCompletionPct(state),
    capacidad: capacidadCompletionPct(state),
    riesgo: riesgoCompletionPct(state),
    analisisRiesgos: riesgoCompletionPct(state),
    dictamen: dictamenCompletionPct(state)
  }
}
