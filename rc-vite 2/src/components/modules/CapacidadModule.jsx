// ============================================================
// MÓDULO 6: CAPACIDAD DE PAGO
// ============================================================

import { ModuleSection, Alert, CompletionBar } from '../shared/Common'
import { fmtMoney, parseNum, calcCapacidad, capacidadCompletionPct } from '../../engines/financialEngine'
import { ChartCard, GroupedBars, HorizontalGauge } from '../shared/Charts'

// ─────────────────────────────────────────────────────────────
// KPI simple — para la fila de resumen
// ─────────────────────────────────────────────────────────────
function KpiSimple({ label, value, sub, accent }) {
  return (
    <div className="fd-w-kpi">
      <div className="fd-w-kpi-eye" style={{ color: accent }}>{label}</div>
      <div className="fd-w-kpi-v">{value}</div>
      <div className="fd-w-kpi-bar">
        <div className="fd-w-kpi-bar-fill" style={{ width: '100%', background: accent }} />
      </div>
      <div className="fd-w-kpi-sub">{sub}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// GaugeCard wrapper (igual al de AnalisisModule)
// ─────────────────────────────────────────────────────────────
function GaugeCard({ eye, title, gauge }) {
  return (
    <div className="fd-w-card">
      <div className="fd-w-card-h">
        <div className="fd-w-card-h-l">
          <div className="fd-w-card-eye">{eye}</div>
          <div className="fd-w-card-t">{title}</div>
        </div>
      </div>
      <div className="fd-w-card-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
        {gauge}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Formato corto de dinero para etiquetas de gráficas
// ─────────────────────────────────────────────────────────────
const fmtMoneyShort = (n) => {
  if (n == null || !isFinite(n)) return '—'
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(2) + 'B'
  if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(2) + 'M'
  if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(0) + 'K'
  return sign + '$' + abs.toFixed(0)
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CapacidadModule({ state, setState }) {
  const cap = state.capacidad
  const calc = calcCapacidad(state)
  const monto = parseNum(state.caratula.montoSolicitado)
  const flujoMensual = parseNum(cap.flujoMensualDisponible)
  const tasa = parseNum(cap.tasaAnual) / 100
  const plazo = parseNum(cap.plazoMeses)
  const valorGarantias = parseNum(cap.valorGarantias)
  const ltv = parseNum(cap.porcentajeLTV)

  const update = (key, value) => setState({ ...state, capacidad: { ...cap, [key]: value } })

  const totalPagar = calc.pmt * plazo
  const intereses = totalPagar - monto

  // Tabla de amortización (calculada en cliente)
  const buildAmortization = () => {
    if (monto <= 0 || tasa <= 0 || plazo <= 0 || calc.pmt <= 0) return []
    const i = tasa / 12
    let saldo = monto
    const rows = []
    for (let mes = 1; mes <= plazo; mes++) {
      const interes = saldo * i
      const capital = calc.pmt - interes
      saldo = Math.max(0, saldo - capital)
      rows.push({ mes, capital, interes, pago: calc.pmt, saldo })
    }
    return rows
  }
  const amortization = buildAmortization()

  // Milestones limpios — siempre incluye M1 y el último mes, con espaciado uniforme.
  // 4-5 puntos máximo para que las etiquetas de valor no se aplasten en el LineChart.
  const pickMilestones = (n) => {
    if (n <= 1) return [1]
    if (n <= 4) return Array.from({ length: n }, (_, i) => i + 1)
    if (n <= 6) return [1, 3, 5, 6].filter(m => m <= n)
    if (n <= 12) return [1, 4, 8, 12].filter(m => m <= n)
    if (n <= 18) return [1, 6, 12, 18].filter(m => m <= n)
    if (n <= 24) return [1, 6, 12, 18, 24].filter(m => m <= n)
    if (n <= 36) return [1, 9, 18, 27, 36].filter(m => m <= n)
    if (n <= 48) return [1, 12, 24, 36, 48].filter(m => m <= n)
    if (n <= 60) return [1, 15, 30, 45, 60].filter(m => m <= n)
    // Plazos largos: 5 puntos equiespaciados
    return [1, Math.round(n * 0.25), Math.round(n * 0.5), Math.round(n * 0.75), n]
  }
  const milestones = amortization.length > 0 ? pickMilestones(amortization.length) : []
  const sampledAmort = milestones.map(m => amortization[m - 1]).filter(Boolean)

  const saldoSeries = sampledAmort.map(r => r.saldo)
  const interesSeries = sampledAmort.map(r => r.interes)
  const capitalSeries = sampledAmort.map(r => r.capital)
  const mesLabels = sampledAmort.map(r => `M${r.mes}`)

  // DSCR zonas para gauge (escala 0-5x; cubre desde DSCR insuficiente hasta sólido excepcional)
  const dscrZones = [
    { until: 1.2, color: 'var(--rc-red)',     label: 'Insuficiente' },
    { until: 1.5, color: 'var(--rc-amber)',   label: 'Aceptable' },
    { until: 5,   color: 'var(--rc-success)', label: 'Sólido' }
  ]

  // LTV zonas (entre 50 y 80% es ideal; <50 muy conservador, >80 agresivo)
  const ltvZones = [
    { until: 50, color: 'var(--rc-success)', label: 'Conservador' },
    { until: 70, color: 'var(--rc-amber)',   label: 'Moderado' },
    { until: 100, color: 'var(--rc-red)',    label: 'Agresivo' }
  ]

  // Cobertura: % del monto solicitado vs monto recomendable
  const coberturaPct = calc.montoRecomendable > 0 ? (monto / calc.montoRecomendable) * 100 : 0
  const montoExcedido = monto > calc.montoRecomendable

  // Sensibilidades — series para grouped bars
  const sensLabels = ['Base 100%', '−10% Flujo', '−20% Flujo']
  const sensDscrSeries = [calc.dscr, calc.dscrSens10, calc.dscrSens20]
  const sensFlujoSeries = [flujoMensual, flujoMensual * 0.9, flujoMensual * 0.8]

  const dscrDictamen = calc.dscr >= 1.5 ? 'Sólido' : calc.dscr >= 1.2 ? 'Aceptable' : calc.dscr > 0 ? 'Insuficiente' : '—'
  const dscrAccent = calc.dscr >= 1.5 ? 'var(--rc-success)' : calc.dscr >= 1.2 ? 'var(--rc-amber)' : 'var(--rc-red)'

  return (
    <>
      {/* ============================================================ */}
      {/* SECCIÓN 1 — Parámetros del Crédito + KPIs ejecutivos */}
      {/* ============================================================ */}
      <ModuleSection number="1" title="Parámetros del Crédito" subtitle="Condiciones financieras de la solicitud">
        <div className="form-grid">
          <div className="field">
            <label className="field-label">Monto Solicitado</label>
            <input className="field-input num" type="text" value={monto > 0 ? fmtMoney(monto) : ''} readOnly />
            <div className="field-help">Capturado en Carátula</div>
          </div>
          <div className="field">
            <label className="field-label">Tasa Anual %</label>
            <input className="field-input num" type="number" value={cap.tasaAnual || ''} onChange={e => update('tasaAnual', e.target.value)} step="0.01" />
          </div>
          <div className="field">
            <label className="field-label">Plazo (meses)</label>
            <input className="field-input num" type="number" value={cap.plazoMeses || ''} onChange={e => update('plazoMeses', e.target.value)} />
          </div>
          <div className="field span-full">
            <label className="field-label">Flujo Mensual Disponible</label>
            <input className="field-input num" type="number" value={cap.flujoMensualDisponible || ''} onChange={e => update('flujoMensualDisponible', e.target.value)} />
            <div className="field-help">Capacidad mensual estimada del cliente para hacer frente a la deuda</div>
          </div>
        </div>

        {/* KPI Row — resumen ejecutivo del crédito */}
        <div className="fd-w-row fd-w-row--kpi" style={{ marginTop: 20 }}>
          <KpiSimple
            label="Pago Mensual (PMT)"
            value={calc.pmt > 0 ? fmtMoneyShort(calc.pmt) : '—'}
            sub={`${plazo || 0} mensualidades`}
            accent="var(--rc-blue)"
          />
          <KpiSimple
            label="Total a Pagar"
            value={totalPagar > 0 ? fmtMoneyShort(totalPagar) : '—'}
            sub="Capital + intereses"
            accent="var(--rc-green)"
          />
          <KpiSimple
            label="Intereses Totales"
            value={intereses > 0 ? fmtMoneyShort(intereses) : '—'}
            sub={monto > 0 ? `${((intereses / monto) * 100).toFixed(1)}% sobre capital` : 'Costo financiero'}
            accent="var(--rc-amber)"
          />
          <KpiSimple
            label="DSCR Base"
            value={calc.dscr > 0 ? calc.dscr.toFixed(2) + 'x' : '—'}
            sub={dscrDictamen}
            accent={dscrAccent}
          />
        </div>
      </ModuleSection>

      {/* ============================================================ */}
      {/* SECCIÓN 2 — Tablero ejecutivo: DSCR gauge + LTV gauge + Cobertura */}
      {/* ============================================================ */}
      <ModuleSection number="2" title="Tablero de Capacidad" subtitle="Indicadores clave del perfil crediticio">
        <div className="fd-w" style={{ marginBottom: 0 }}>
          <div className="fd-w-row fd-w-row--3up">
            <GaugeCard
              eye="COBERTURA"
              title="DSCR · Servicio de Deuda"
              gauge={
                <HorizontalGauge
                  value={calc.dscr}
                  min={0} max={5} unit="x" precision={2}
                  label="Flujo Mensual / PMT"
                  zones={dscrZones}
                />
              }
            />
            <GaugeCard
              eye="GARANTÍAS"
              title="LTV · Loan-to-Value"
              gauge={
                <HorizontalGauge
                  value={ltv}
                  min={0} max={100} unit="%" precision={0}
                  label={`Monto / Valor garantías`}
                  zones={ltvZones}
                />
              }
            />
            <GaugeCard
              eye="COMPOSICIÓN"
              title="Capital vs Intereses"
              gauge={
                <HorizontalGauge
                  value={totalPagar > 0 ? (intereses / totalPagar) * 100 : 0}
                  min={0} max={100} unit="%" precision={1}
                  label="Intereses / Total a pagar"
                  zones={[
                    { until: 20, color: 'var(--rc-success)', label: 'Bajo costo' },
                    { until: 40, color: 'var(--rc-amber)',   label: 'Moderado' },
                    { until: 100, color: 'var(--rc-red)',    label: 'Alto costo' }
                  ]}
                />
              }
            />
          </div>
        </div>
      </ModuleSection>

      {/* ============================================================ */}
      {/* SECCIÓN 3 — Sensibilidades y Garantías */}
      {/* ============================================================ */}
      <ModuleSection number="3" title="Análisis de Sensibilidad" subtitle="DSCR bajo escenarios de estrés del flujo">
        <div className="fd-w" style={{ marginBottom: 0 }}>
          <div className="fd-w-row fd-w-row--2up">
            <ChartCard
              eye="STRESS TEST · DSCR"
              title="Cobertura por escenario"
            >
              <GroupedBars
                labels={sensLabels}
                series={[
                  { name: 'DSCR (x)', vals: sensDscrSeries, color: 'var(--rc-green)' }
                ]}
                fmt={(v) => (v ?? 0).toFixed(2) + 'x'}
              />
            </ChartCard>
            <ChartCard
              eye="STRESS TEST · FLUJO"
              title="Flujo mensual disponible"
            >
              <GroupedBars
                labels={sensLabels}
                series={[
                  { name: 'Flujo', vals: sensFlujoSeries, color: 'var(--rc-blue)' }
                ]}
                fmt={fmtMoneyShort}
              />
            </ChartCard>
          </div>

          {/* Tabla de sensibilidades — detalle numérico */}
          <table className="fin-table" style={{ marginTop: 20 }}>
            <thead>
              <tr>
                <th className="label-col">Escenario</th>
                <th className="num">Flujo Mensual</th>
                <th className="num">PMT</th>
                <th className="num">DSCR</th>
                <th className="col-alert">Dictamen</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Base (100%)', flujo: flujoMensual, dscr: calc.dscr },
                { label: 'Sensibilidad −10%', flujo: flujoMensual * 0.9, dscr: calc.dscrSens10 },
                { label: 'Sensibilidad −20%', flujo: flujoMensual * 0.8, dscr: calc.dscrSens20 }
              ].map((s, i) => {
                const tone = s.dscr >= 1.5 ? 'good' : s.dscr >= 1.2 ? 'caution' : 'critical'
                const dict = s.dscr >= 1.5 ? 'Sólido' : s.dscr >= 1.2 ? 'Aceptable' : 'Insuficiente'
                return (
                  <tr key={i}>
                    <td className="row-label">{s.label}</td>
                    <td className="num calc"><span className="num-v">{fmtMoney(s.flujo)}</span></td>
                    <td className="num calc"><span className="num-v">{fmtMoney(calc.pmt, 2)}</span></td>
                    <td className="num calc"><span className="num-v">{s.dscr.toFixed(2)}x</span></td>
                    <td className="cell-alert">
                      <span className={`fin-alert tone-${tone}`}>
                        <span className="fin-alert-dot" /> {dict}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {calc.dscrSens20 < 1.0 && calc.dscrSens20 > 0 && (
            <Alert level="warn" title="Riesgo material en sensibilidad −20%">
              Con una caída de 20% en el flujo, el DSCR cae a <b>{calc.dscrSens20.toFixed(2)}x</b> (por debajo de 1.00x). Recomendable reducir el monto, ampliar el plazo o reforzar garantías líquidas.
            </Alert>
          )}
        </div>
      </ModuleSection>

      {/* ============================================================ */}
      {/* SECCIÓN 4 — Amortización (línea: saldo decreciente + composición) */}
      {/* ============================================================ */}
      <ModuleSection number="4" title="Calendario de Amortización" subtitle="Evolución del saldo y composición del pago">
        <div className="fd-w" style={{ marginBottom: 0 }}>
          <div className="fd-w-row fd-w-row--2up">
            <ChartCard
              eye="CURVA DE SALDO"
              title="Saldo insoluto durante el plazo"
            >
              {saldoSeries.length > 0 ? (
                <GroupedBars
                  labels={mesLabels}
                  series={[
                    { name: 'Saldo insoluto', vals: saldoSeries, color: 'var(--rc-green)' }
                  ]}
                  fmt={fmtMoneyShort}
                />
              ) : (
                <div className="fd-w-empty">Captura los parámetros para visualizar la amortización</div>
              )}
            </ChartCard>
            <ChartCard
              eye="COMPOSICIÓN DEL PAGO"
              title="Capital vs intereses por periodo"
            >
              {sampledAmort.length > 0 ? (
                <GroupedBars
                  labels={mesLabels}
                  series={[
                    { name: 'Capital',   vals: capitalSeries,  color: 'var(--rc-green)' },
                    { name: 'Intereses', vals: interesSeries,  color: 'var(--rc-amber)' }
                  ]}
                  fmt={fmtMoneyShort}
                />
              ) : (
                <div className="fd-w-empty">Captura los parámetros para visualizar la amortización</div>
              )}
            </ChartCard>
          </div>
        </div>
      </ModuleSection>

      {/* ============================================================ */}
      {/* SECCIÓN 5 — Garantías */}
      {/* ============================================================ */}
      <ModuleSection number="5" title="Garantías" subtitle="Valor declarado y LTV aplicable">
        <div className="form-grid">
          <div className="field">
            <label className="field-label">Valor de Garantías</label>
            <input className="field-input num" type="number" value={cap.valorGarantias || ''} onChange={e => update('valorGarantias', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">% LTV (Loan-to-Value)</label>
            <input className="field-input num" type="number" value={cap.porcentajeLTV || ''} onChange={e => update('porcentajeLTV', e.target.value)} step="0.01" />
            <div className="field-help">Porcentaje máximo del valor que se acepta como respaldo</div>
          </div>
        </div>
      </ModuleSection>

      {/* ============================================================ */}
      {/* SECCIÓN 6 — Monto Recomendable */}
      {/* ============================================================ */}
      <ModuleSection number="6" title="Monto Recomendable" subtitle="Tope por flujo, tope por garantías y dictamen final">
        <div className="fd-w-row fd-w-row--3up" style={{ marginBottom: 20 }}>
          <KpiSimple
            label="Por Flujo (DSCR 1.5x)"
            value={fmtMoneyShort(calc.montoMaximo)}
            sub="Máximo sostenible"
            accent="var(--rc-blue)"
          />
          <KpiSimple
            label={`Por Garantías (${ltv || 0}%)`}
            value={fmtMoneyShort(calc.montoMaxGarantias)}
            sub={`Valor garantías × LTV`}
            accent="var(--rc-amber)"
          />
          <KpiSimple
            label="Recomendable Final"
            value={fmtMoneyShort(calc.montoRecomendable)}
            sub="El menor de los dos topes"
            accent="var(--rc-green)"
          />
        </div>

        {/* Barra de cobertura: Monto solicitado vs Recomendable */}
        {calc.montoRecomendable > 0 && monto > 0 && (
          <div className="cap-cobertura">
            <div className="cap-cobertura-h">
              <span className="cap-cobertura-l">Cobertura del Monto Solicitado</span>
              <span className={`cap-cobertura-pct ${montoExcedido ? 'bad' : 'ok'}`}>
                {coberturaPct.toFixed(1)}% del recomendable
              </span>
            </div>
            <div className="cap-cobertura-track">
              <div
                className={`cap-cobertura-fill ${montoExcedido ? 'bad' : 'ok'}`}
                style={{ width: `${Math.min(100, coberturaPct)}%` }}
              />
              {coberturaPct > 100 && (
                <div className="cap-cobertura-overflow" style={{ width: `${Math.min(50, coberturaPct - 100)}%` }} />
              )}
            </div>
            <div className="cap-cobertura-foot">
              <span>Solicitado: <strong>{fmtMoney(monto)}</strong></span>
              <span>Recomendable: <strong>{fmtMoney(calc.montoRecomendable)}</strong></span>
              <span className={montoExcedido ? 'bad' : 'ok'}>
                {montoExcedido
                  ? `Excede por ${fmtMoney(monto - calc.montoRecomendable)}`
                  : `Holgura ${fmtMoney(calc.montoRecomendable - monto)}`}
              </span>
            </div>
          </div>
        )}

        {monto > calc.montoRecomendable && calc.montoRecomendable > 0 && (
          <Alert level="warn" title="Monto solicitado supera el recomendable técnico">
            El cliente solicita <b>{fmtMoney(monto)}</b> pero el recomendable técnico es <b>{fmtMoney(calc.montoRecomendable)}</b>. Considera ajustar el monto, ampliar el plazo o requerir garantías adicionales.
          </Alert>
        )}
      </ModuleSection>

      <CompletionBar title="% de Completado del Módulo" pct={capacidadCompletionPct(state)} />
    </>
  )
}
