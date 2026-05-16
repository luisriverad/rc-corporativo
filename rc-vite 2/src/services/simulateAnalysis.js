// ============================================================
// SIMULADOR DE ANÁLISIS — Determinista, instantáneo
// Reemplaza la llamada al API real. Genera un memorando coherente
// con base en los datos financieros calculados.
// ============================================================

// Helpers ─────────────────────────────────────────────────────
const fmtMoneyShort = (n) => {
  if (n == null || !isFinite(n)) return '—'
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(2) + 'B'
  if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(2) + 'M'
  if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(0) + 'K'
  return sign + '$' + abs.toFixed(0)
}
const signed = (n, decimals = 1, suffix = '%') => {
  if (n == null || !isFinite(n)) return '—'
  return (n >= 0 ? '+' : '') + n.toFixed(decimals) + suffix
}
const pct = (numer, denom) => denom > 0 ? (numer / denom) * 100 : 0
const yoy = (curr, prev) => (prev && prev !== 0) ? ((curr - prev) / Math.abs(prev)) * 100 : 0
const annualize = (v, months) => months >= 12 || months <= 0 ? v : v * (12 / months)

// ─────────────────────────────────────────────────────────────
// Generador principal
// ─────────────────────────────────────────────────────────────
export function simulateAnalysis({ er, bg, labels, monthsY3, empresa }) {
  // Métricas P&L
  const ventasY1 = er.y1.ventasNetas, ventasY2 = er.y2.ventasNetas, ventasY3 = er.y3.ventasNetas
  const utilNetaY2 = er.y2.utilNeta
  const mBrutoY2 = er.y2.margenBruto, mBrutoY1 = er.y1.margenBruto
  const mOpY2 = er.y2.margenOperativo
  const mNetoY1 = er.y1.margenNeto, mNetoY2 = er.y2.margenNeto, mNetoY3 = er.y3.margenNeto

  const ventasYoY = yoy(ventasY2, ventasY1)
  const ventasProy = annualize(ventasY3, monthsY3)
  const ventasProyVsY2 = yoy(ventasProy, ventasY2)
  const dMNeto = mNetoY2 - mNetoY1
  const dMBruto = mBrutoY2 - mBrutoY1

  // Métricas BG
  const liqY2 = bg.y2.totalPasivosCP > 0 ? bg.y2.activoCirculante / bg.y2.totalPasivosCP : 0
  const liqY3 = bg.y3.totalPasivosCP > 0 ? bg.y3.activoCirculante / bg.y3.totalPasivosCP : 0
  const wcY2 = bg.y2.activoCirculante - bg.y2.totalPasivosCP
  const wcY3 = bg.y3.activoCirculante - bg.y3.totalPasivosCP
  const apalY2 = pct(bg.y2.pasivoTotal, bg.y2.activoTotal)
  const apalY3 = pct(bg.y3.pasivoTotal, bg.y3.activoTotal)
  const capitalY2 = bg.y2.capital, capitalY3 = bg.y3.capital
  const efectivoY2 = bg.y2.efectivo, efectivoY3 = bg.y3.efectivo
  const clientesY2 = bg.y2.clientes
  const inventariosY2 = bg.y2.inventarios

  // Ratios derivados
  const diasCxC = ventasY2 > 0 ? (clientesY2 / ventasY2) * 360 : 0
  const diasInv = er.y2.costoVenta > 0 ? (inventariosY2 / er.y2.costoVenta) * 360 : 0
  const pasivoCrec = yoy(bg.y2.pasivoTotal, bg.y1.pasivoTotal)
  const activoCrec = yoy(bg.y2.activoTotal, bg.y1.activoTotal)

  // ─── Clasificación ────────────────────────────────────────
  const positivas = []
  const alertas = []

  // Ventas
  if (ventasYoY > 8) positivas.push(`Ventas crecen ${signed(ventasYoY)} en ${labels.y2}: tendencia positiva.`)
  else if (ventasYoY > 0 && ventasYoY <= 8) positivas.push(`Ventas con crecimiento modesto de ${signed(ventasYoY)} en ${labels.y2}: estable.`)
  else if (ventasYoY < -5) alertas.push(`Ventas caen ${signed(ventasYoY)} en ${labels.y2}: deterioro comercial relevante.`)
  else if (ventasYoY < 0) alertas.push(`Ventas con caída leve de ${signed(ventasYoY)}: monitorear próximo periodo.`)
  if (ventasProyVsY2 < -10 && monthsY3 < 12) alertas.push(`Proyección anualizada de ${labels.y3} apunta a caída fuerte (${signed(ventasProyVsY2)} vs ${labels.y2}): validar estacionalidad.`)

  // Rentabilidad
  if (mNetoY2 > 8) positivas.push(`Margen neto saludable en ${labels.y2} (${mNetoY2.toFixed(2)}%): operación rentable.`)
  else if (mNetoY2 > 3 && mNetoY2 <= 8) positivas.push(`Margen neto positivo (${mNetoY2.toFixed(2)}%) en ${labels.y2}.`)
  else if (mNetoY2 < 1 && mNetoY2 >= 0) alertas.push(`Margen neto crítico (${mNetoY2.toFixed(2)}%): la empresa opera al filo de la rentabilidad.`)
  else if (mNetoY2 < 0) alertas.push(`Pérdida neta en ${labels.y2} (margen ${mNetoY2.toFixed(2)}%): erosión patrimonial activa.`)
  if (dMNeto < -3) alertas.push(`Compresión de margen neto de ${signed(dMNeto, 2, 'pp')}: presión estructural sobre la rentabilidad.`)
  else if (dMNeto > 2) positivas.push(`Expansión de margen neto de ${signed(dMNeto, 2, 'pp')}: mejora real en eficiencia.`)
  if (utilNetaY2 > 0 && positivas.length < 4) positivas.push(`Utilidad neta positiva: ${fmtMoneyShort(utilNetaY2)} en ${labels.y2}.`)

  // Liquidez
  if (liqY2 >= 1.5) positivas.push(`Liquidez cómoda: razón corriente ${liqY2.toFixed(2)}x en ${labels.y2}.`)
  else if (liqY2 >= 1.0) alertas.push(`Liquidez ajustada (${liqY2.toFixed(2)}x): margen estrecho ante cualquier estrés de cobranza.`)
  else alertas.push(`Liquidez insuficiente (${liqY2.toFixed(2)}x): pasivos de corto plazo no cubiertos por activo circulante.`)
  if (wcY3 < 0) alertas.push(`Capital de trabajo neto negativo en ${labels.y3} (${fmtMoneyShort(wcY3)}): déficit operativo.`)
  else if (wcY3 > 0 && positivas.length < 5) positivas.push(`Capital de trabajo positivo: ${fmtMoneyShort(wcY3)} al cierre de ${labels.y3}.`)

  // Endeudamiento
  if (apalY2 < 40) positivas.push(`Apalancamiento conservador: Pasivo/Activo ${apalY2.toFixed(1)}% en ${labels.y2}.`)
  else if (apalY2 < 60) {/* moderado - sin push */}
  else if (apalY2 < 80) alertas.push(`Apalancamiento elevado (${apalY2.toFixed(1)}%): dependencia significativa de pasivos.`)
  else alertas.push(`Estructura altamente apalancada (${apalY2.toFixed(1)}%): riesgo de insolvencia ante choque.`)
  if (pasivoCrec > 25 && pasivoCrec > activoCrec + 10) alertas.push(`Pasivo crece ${signed(pasivoCrec)} mientras activo solo ${signed(activoCrec)}: deterioro de estructura financiera.`)

  // Capacidad de pago
  if (capitalY2 < 0) alertas.push(`Capital contable negativo en ${labels.y2} (${fmtMoneyShort(capitalY2)}): insolvencia técnica.`)
  if (efectivoY2 < 0.05 * bg.y2.totalPasivosCP && bg.y2.totalPasivosCP > 0) alertas.push(`Efectivo disponible (${fmtMoneyShort(efectivoY2)}) muy bajo vs pasivos de corto plazo: presión inmediata sobre tesorería.`)

  // Eficiencia (alertas secundarias)
  if (diasCxC > 90) alertas.push(`Días CxC elevados (${diasCxC.toFixed(0)}d): cartera con lenta cobranza, riesgo de capital de trabajo.`)
  else if (diasCxC > 0 && diasCxC < 45 && positivas.length < 5) positivas.push(`Cobranza ágil (${diasCxC.toFixed(0)} días CxC): conversión rápida de ventas a efectivo.`)
  if (diasInv > 150) alertas.push(`Inventarios lentos (${diasInv.toFixed(0)}d): posible obsolescencia o sobrestock.`)

  // ─── Severidad → Dictamen ────────────────────────────────
  const alertasCriticas = alertas.filter(a =>
    a.includes('crítico') || a.includes('insolvencia') || a.includes('Pérdida') ||
    a.includes('insuficiente') || a.includes('altamente apalancada') ||
    a.includes('déficit') || a.includes('negativo')
  ).length

  const alertasModerate = alertas.length - alertasCriticas

  let dictamen, dictamenColor, justificacion
  if (alertasCriticas >= 2 || (alertasCriticas >= 1 && alertasModerate >= 3)) {
    dictamen = 'No recomendable'
    dictamenColor = 'red'
    justificacion = `La empresa presenta señales críticas múltiples que comprometen su perfil de riesgo. El otorgamiento de crédito bajo las condiciones actuales expondría al portafolio a probabilidad alta de default. Se sugiere posponer hasta observar mejora sustancial en márgenes, liquidez y estructura de pasivos durante al menos 2 ejercicios consecutivos.`
  } else if (alertasCriticas === 1) {
    dictamen = 'Requiere más información'
    dictamenColor = 'amber'
    justificacion = `Existe una señal crítica que debe aclararse antes de emitir dictamen final. Se requiere documentación complementaria del cliente — composición de saldos, antigüedad, plan de mitigación — para reevaluar adecuadamente la capacidad de pago.`
  } else if (alertas.length >= 3) {
    dictamen = 'Aprobable con condiciones'
    dictamenColor = 'amber'
    justificacion = `El perfil financiero es adecuado pero presenta áreas de seguimiento. Se recomienda aprobar con covenants financieros, garantías reales adicionales y monitoreo trimestral. Limitar monto inicial al 70% del solicitado, con liberación gradual condicionada a entrega de estados intermedios.`
  } else if (positivas.length >= 4 && alertas.length <= 1) {
    dictamen = 'Aprobable'
    dictamenColor = 'green'
    justificacion = `Empresa con perfil financiero sólido: rentabilidad sostenida, liquidez adecuada y estructura de capital saludable. Capacidad de pago suficiente para el crédito solicitado bajo condiciones estándar del producto, sin requerir garantías adicionales más allá de las habituales.`
  } else {
    dictamen = 'Aprobable con condiciones'
    dictamenColor = 'amber'
    justificacion = `Perfil mixto: tendencias generalmente positivas con algunos puntos de seguimiento. Aprobar bajo esquema condicionado, con revisión semestral y covenants estándar de mantenimiento de ratios financieros mínimos.`
  }

  // ─── Preguntas clave ──────────────────────────────────────
  const preguntas = []
  if (ventasYoY < -5 || dMNeto < -3) preguntas.push(`¿A qué se debe el ${ventasYoY < -5 ? 'deterioro de ventas' : 'la caída de márgenes'} en ${labels.y2}? ¿Es coyuntural o estructural?`)
  preguntas.push('¿Cuál es el destino específico del crédito y cómo impactará en el flujo operativo proyectado?')
  preguntas.push('¿Qué garantías reales (inmuebles, equipo, inventarios) se ofrecen como respaldo del crédito?')
  if (diasCxC > 60) preguntas.push(`¿Cómo se compone la cartera de cuentas por cobrar — antigüedad, concentración por cliente, % vencido?`)
  if (apalY2 > 50 || pasivoCrec > 20) preguntas.push('¿Cuál es el detalle de la deuda actual: instituciones, plazos, tasas, amortizaciones y garantías ya comprometidas?')
  if (capitalY2 < 0 || mNetoY2 < 0) preguntas.push('¿Existe plan de capitalización o aportación de socios para fortalecer el patrimonio?')
  preguntas.push('¿Existen proyecciones financieras 2026-2027 que validen la capacidad de pago bajo escenarios base, optimista y de estrés?')

  // ─── Resumen ejecutivo ────────────────────────────────────
  const tonoOps = ventasYoY > 5 && mNetoY2 > 2 ? 'positiva' : ventasYoY < -5 || mNetoY2 < 0 ? 'adversa' : 'estable'
  const periodoY3Note = monthsY3 < 12 ? ` (parcial, ${monthsY3} meses transcurridos)` : ''
  const resumen = `${empresa || 'La empresa solicitante'} reportó ventas de ${fmtMoneyShort(ventasY2)} en ${labels.y2} con un cambio de ${signed(ventasYoY)} YoY. El margen neto se ubicó en ${mNetoY2.toFixed(2)}% (${signed(dMNeto, 2, 'pp')} vs ${labels.y1}) y la razón corriente en ${liqY2.toFixed(2)}x. El apalancamiento Pasivo/Activo cerró en ${apalY2.toFixed(1)}%. Al cierre de ${labels.y3}${periodoY3Note}, ${monthsY3 < 12 ? `la proyección anualizada apunta a ventas de ${fmtMoneyShort(ventasProy)} (${signed(ventasProyVsY2)} vs ${labels.y2})` : `las ventas fueron de ${fmtMoneyShort(ventasY3)}`}. La operación es **${tonoOps}**; primera impresión crediticia: **${dictamen.toLowerCase()}**.`

  // ─── Ensamblar markdown ───────────────────────────────────
  const cap5 = (arr) => arr.slice(0, 5)

  return `## Resumen ejecutivo

${resumen}

## Señales positivas

${cap5(positivas).length > 0 ? cap5(positivas).map((p) => '- ' + p).join('\n') : '- Información insuficiente para identificar señales positivas relevantes.'}

## Señales de alerta

${cap5(alertas).length > 0 ? cap5(alertas).map((a) => '- ' + a).join('\n') : '- Sin alertas mayores detectadas en los rubros principales.'}

## Preguntas clave para el cliente

${cap5(preguntas).map((p) => '- ' + p).join('\n')}

## Dictamen preliminar

**${dictamen}.** ${justificacion}`
}
