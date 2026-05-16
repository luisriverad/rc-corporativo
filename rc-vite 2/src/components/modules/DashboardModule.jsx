// ============================================================
// DASHBOARD EJECUTIVO
// ============================================================

import { Alert } from '../shared/Common'
import { ChartCard, GroupedBars, LineChart } from '../shared/Charts'
import {
  fmtMoney, calcScore, detectAlerts,
  calcER, calcRazones, calcCapacidad, parseNum
} from '../../engines/financialEngine'

export default function DashboardModule({ state }) {
  const c = state.caratula
  const score = calcScore(state)
  const alerts = detectAlerts(state)

  const decisionMap = {
    'aprobado': 'Aprobado',
    'condicionado': 'Aprobado Condicionado',
    'info': 'Información Adicional',
    'rechazado': 'No Recomendable'
  }

  const scoreLight =
    score.scoreFinal >= 70 ? 'green' :
    score.scoreFinal >= 55 ? 'amber' :
    score.scoreFinal > 0   ? 'red'   : null

  const decisionLightMap = { aprobado: 'green', condicionado: 'amber', info: 'amber', rechazado: 'red' }
  const decisionLight = decisionLightMap[state.dictamen.decision] || null

  const kpis = [
    { l: 'Cliente Activo', v: c.empresa || '—', s: c.rfc || 'Sin RFC' },
    { l: 'Monto Solicitado', v: c.montoSolicitado ? fmtMoney(c.montoSolicitado) : '—', s: 'MXN' },
    { l: 'Score Interno', v: score.scoreFinal > 0 ? score.scoreFinal.toFixed(0) : '—', s: score.scoreFinal > 0 ? score.nivel : 'Pendiente', traffic: scoreLight },
    { l: 'Recomendación', v: decisionMap[state.dictamen.decision] || '—', s: state.dictamen.decision ? 'Dictamen emitido' : 'En análisis', traffic: decisionLight }
  ]

  return (
    <>
      <div className="hero">
        <span className="hero-eye">Bienvenido al Sistema</span>
        <h2 className="hero-h2">Sistema de Inteligencia Crediticia</h2>
      </div>

      <div className="kpis">
        {kpis.map((k, i) => (
          <div key={i} className={`kpi ${k.traffic ? 'kpi--traffic' : ''}`}>
            {k.traffic && (
              <div className={`kpi-traffic traffic-${k.traffic}`} aria-hidden="true">
                <span className="tl tl-red" />
                <span className="tl tl-amber" />
                <span className="tl tl-green" />
              </div>
            )}
            <div className="kpi-lbl">{k.l}</div>
            <div className="kpi-val">{k.v}</div>
            <div className="kpi-sub">{k.s}</div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 className="section-h">Alertas</h3>
          <p className="section-p">Detección automática basada en los datos capturados</p>
          {alerts.map((a, i) => (
            <Alert key={i} level={a.level === 'warn' ? 'warn' : 'info'} title={a.title}>
              {a.desc}
            </Alert>
          ))}
        </div>
      )}

      <FinancialDashboard state={state} />
    </>
  )
}

// ============================================================
// FINANCIAL DASHBOARD (Bloomberg / WSJ style)
// ============================================================

function FinancialDashboard({ state }) {
  const er = calcER(state)
  const r  = calcRazones(state)
  const cap = calcCapacidad(state)

  const labels = [
    state.financieros.er.y1Label || 'Año 1',
    state.financieros.er.y2Label || 'Año 2',
    state.financieros.er.y3Label || 'Año 3'
  ]

  const yoy = (curr, prev) => (prev && prev !== 0) ? ((curr - prev) / Math.abs(prev)) * 100 : null
  const bps = (curr, prev) => (prev !== undefined && prev !== null) ? (curr - prev) : null

  const fmtNumShort = (n) => {
    const abs = Math.abs(n)
    if (abs >= 1e9) return (n/1e9).toFixed(2) + 'B'
    if (abs >= 1e6) return (n/1e6).toFixed(2) + 'M'
    if (abs >= 1e3) return (n/1e3).toFixed(1) + 'K'
    return n.toFixed(0)
  }
  const fmtMoneyShort = (n) => '$' + fmtNumShort(n)

  const tickers = [
    { l: 'Ventas Netas',  v: fmtMoneyShort(er.y2.ventasNetas),   d: yoy(er.y2.ventasNetas, er.y1.ventasNetas), unit: '%' },
    { l: 'Margen Neto',   v: er.y2.margenNeto.toFixed(2) + '%',  d: bps(er.y2.margenNeto, er.y1.margenNeto),    unit: 'pp' },
    { l: 'Margen Op.',    v: er.y2.margenOperativo.toFixed(2) + '%', d: bps(er.y2.margenOperativo, er.y1.margenOperativo), unit: 'pp' },
    { l: 'ROE',           v: r.y2.roe.toFixed(2) + '%',          d: bps(r.y2.roe, r.y1.roe),                    unit: 'pp' },
    { l: 'Liquidez CT',   v: r.y2.solvenciaCT.toFixed(2) + 'x',  d: bps(r.y2.solvenciaCT, r.y1.solvenciaCT),    unit: 'x'  },
    { l: 'Endeudamiento', v: r.y2.razonEndeudamiento.toFixed(1) + '%', d: bps(r.y2.razonEndeudamiento, r.y1.razonEndeudamiento), unit: 'pp', inverse: true },
    { l: 'DSCR',          v: cap.dscr > 0 ? cap.dscr.toFixed(2) + 'x' : '—', d: null, unit: 'x' },
    { l: 'Capital Trab.', v: fmtMoneyShort(r.y2.capitalTrabajoNeto), d: yoy(r.y2.capitalTrabajoNeto, r.y1.capitalTrabajoNeto), unit: '%' }
  ]

  const pnlRows = [
    { l: 'Ventas Netas',         k: 'ventasNetas',     bold: true },
    { l: 'Costo de Venta',       k: 'costoVenta',      neg: true },
    { l: 'Utilidad Bruta',       k: 'utilBruta',       hi: true },
    { l: '  Margen Bruto',       k: 'margenBruto',     pct: true, dim: true },
    { l: 'Gastos de Operación',  k: 'totalGastosOp',   neg: true },
    { l: 'Utilidad Operativa',   k: 'utilOperativa',   hi: true },
    { l: '  Margen Operativo',   k: 'margenOperativo', pct: true, dim: true },
    { l: 'Result. Financiero',   k: 'riFinanciamiento' },
    { l: 'Utilidad Neta',        k: 'utilNeta',        hi: true, bold: true },
    { l: '  Margen Neto',        k: 'margenNeto',      pct: true, dim: true }
  ]

  const ratiosList = [
    { l: 'ROA',                 vals: [r.y1.roa, r.y2.roa, r.y3.roa], suffix: '%', good: 'up' },
    { l: 'ROE',                 vals: [r.y1.roe, r.y2.roe, r.y3.roe], suffix: '%', good: 'up' },
    { l: 'Margen Bruto',        vals: [r.y1.margenBruto, r.y2.margenBruto, r.y3.margenBruto], suffix: '%', good: 'up' },
    { l: 'Margen Operativo',    vals: [r.y1.margenOperativo, r.y2.margenOperativo, r.y3.margenOperativo], suffix: '%', good: 'up' },
    { l: 'Liquidez Corriente',  vals: [r.y1.solvenciaCT, r.y2.solvenciaCT, r.y3.solvenciaCT], suffix: 'x', good: 'up' },
    { l: 'Prueba Ácida',        vals: [r.y1.liquidezAcida, r.y2.liquidezAcida, r.y3.liquidezAcida], suffix: 'x', good: 'up' },
    { l: 'Apalancamiento',      vals: [r.y1.apalancamiento, r.y2.apalancamiento, r.y3.apalancamiento], suffix: 'x', good: 'down' },
    { l: 'Endeudamiento',       vals: [r.y1.razonEndeudamiento, r.y2.razonEndeudamiento, r.y3.razonEndeudamiento], suffix: '%', good: 'down' },
    { l: 'Días CxC',            vals: [r.y1.diasCxC, r.y2.diasCxC, r.y3.diasCxC], suffix: 'd', good: 'down' },
    { l: 'Días CxP',            vals: [r.y1.diasCxP, r.y2.diasCxP, r.y3.diasCxP], suffix: 'd', good: 'up' }
  ]

  const cuentas = state.caratula.cuentasBancarias || []
  const depositosPorBanco = cuentas.map(cb => {
    let total = 0
    for (let i = 1; i <= 6; i++) total += parseNum(cb['dm'+i])
    return { banco: cb.banco || '—', promedio: total / 6, total }
  }).sort((a,b) => b.promedio - a.promedio)
  const maxDeposito = Math.max(1, ...depositosPorBanco.map(d => d.promedio))
  const totalDepositos = depositosPorBanco.reduce((s, d) => s + d.total, 0)

  const monto = parseNum(state.caratula.montoSolicitado)
  const dscrPct = Math.min(200, (cap.dscr || 0) * 100 / 1.5 * 50) // 1.5 = 50% of gauge (objetivo)
  const dscrColor = cap.dscr >= 1.5 ? 'var(--rc-success)' : cap.dscr >= 1.2 ? 'var(--rc-amber)' : 'var(--rc-red)'

  // Series for new widgets
  const ventasSeries  = [er.y1.ventasNetas, er.y2.ventasNetas, er.y3.ventasNetas]
  const utilNetaSeries= [er.y1.utilNeta,    er.y2.utilNeta,    er.y3.utilNeta]
  const margenBrutoSeries = [er.y1.margenBruto,     er.y2.margenBruto,     er.y3.margenBruto]
  const margenOpSeries    = [er.y1.margenOperativo, er.y2.margenOperativo, er.y3.margenOperativo]
  const margenNetoSeries  = [er.y1.margenNeto,      er.y2.margenNeto,      er.y3.margenNeto]
  const liquidezCTSeries  = [r.y1.solvenciaCT,        r.y2.solvenciaCT,        r.y3.solvenciaCT]
  const liquidezAcidaSeries = [r.y1.liquidezAcida,    r.y2.liquidezAcida,      r.y3.liquidezAcida]
  const endeudamientoSeries = [r.y1.razonEndeudamiento, r.y2.razonEndeudamiento, r.y3.razonEndeudamiento]
  const apalancamientoSeries = [r.y1.apalancamiento,    r.y2.apalancamiento,    r.y3.apalancamiento]

  // Depósitos totales mensuales (6 meses, sumando todos los bancos)
  const depositosMensuales = [1,2,3,4,5,6].map(m =>
    cuentas.reduce((s, cb) => s + parseNum(cb['dm'+m]), 0)
  )
  const promDepMensual = depositosMensuales.reduce((s,v)=>s+v,0) / 6
  const coberturaBancaria = monto > 0 ? promDepMensual / monto : 0

  // KPI 1 — Monto vs Máx Recomendable
  const maxRec = cap.montoRecomendable || 0
  const montoFillPct = maxRec > 0 ? Math.min(100, (monto / maxRec) * 100) : 0
  const montoSafe = maxRec > 0 ? monto <= maxRec : false

  // KPI 4 — Margen Neto delta
  const mnDelta = bps(er.y2.margenNeto, er.y1.margenNeto)

  // Chart card KPIs — última variación (y3 vs y2)
  const vsAntLabel = `vs ${labels[1].toUpperCase()}`
  const kpiVentas = { delta: yoy(er.y3.ventasNetas, er.y2.ventasNetas), unit: '%', label: vsAntLabel }
  const kpiMargenes = { delta: bps(er.y3.margenNeto, er.y2.margenNeto), unit: 'pp', precision: 2, label: 'Neto ' + vsAntLabel }
  const kpiLiquidez = { delta: bps(r.y3.solvenciaCT, r.y2.solvenciaCT), unit: 'x', precision: 2, label: 'Corriente ' + vsAntLabel }
  const kpiEndeud = { delta: bps(r.y3.razonEndeudamiento, r.y2.razonEndeudamiento), unit: 'pp', precision: 2, inverse: true, label: vsAntLabel }
  const kpiDep = {
    delta: depositosMensuales[0] > 0 ? ((depositosMensuales[5] - depositosMensuales[0]) / depositosMensuales[0]) * 100 : null,
    unit: '%', label: 'último vs 1er mes'
  }

  return (
    <div className="fd">
      {/* TICKER */}
      <div className="fd-ticker">
        <div className="fd-ticker-track">
          {tickers.map((t, i) => {
            const positive = t.inverse ? (t.d != null && t.d < 0) : (t.d != null && t.d >= 0)
            const arrow = t.d == null ? '' : (t.d >= 0 ? '▲' : '▼')
            return (
              <div key={i} className="fd-tick">
                <div className="fd-tick-l">{t.l}</div>
                <div className="fd-tick-v">{t.v}</div>
                {t.d != null ? (
                  <div className={`fd-tick-d ${positive ? 'up' : 'down'}`}>
                    {arrow} {Math.abs(t.d).toFixed(t.unit === '%' ? 1 : 2)}{t.unit} <span className="fd-tick-vs">vs. {labels[0]}</span>
                  </div>
                ) : (
                  <div className="fd-tick-d fd-tick-d--na">— <span className="fd-tick-vs">sin comparativo</span></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* WIDGETS */}
      <div className="fd-w">
        {/* ROW 1 — KPI CARDS */}
        <div className="fd-w-row fd-w-row--kpi">
          <KpiMonto
            monto={monto}
            maxRec={maxRec}
            fillPct={montoFillPct}
            safe={montoSafe}
            fmtMoneyShort={fmtMoneyShort}
          />
          <KpiDscr cap={cap} />
          <KpiCapTrab
            value={r.y2.capitalTrabajoNeto}
            delta={yoy(r.y2.capitalTrabajoNeto, r.y1.capitalTrabajoNeto)}
            fmtMoneyShort={fmtMoneyShort}
          />
          <KpiMargenNeto
            value={er.y2.margenNeto}
            delta={mnDelta}
            series={margenNetoSeries}
          />
        </div>

        {/* ROW 2 — VENTAS + MÁRGENES */}
        <div className="fd-w-row fd-w-row--2up">
          <ChartCard eye="P&L · TENDENCIA" title="Ventas y Utilidad Neta" kpi={kpiVentas}>
            <GroupedBars
              labels={labels}
              series={[
                { name: 'Ventas Netas',  vals: ventasSeries,   color: 'var(--rc-green)' },
                { name: 'Utilidad Neta', vals: utilNetaSeries, color: 'var(--rc-blue)'  }
              ]}
              fmt={fmtMoneyShort}
            />
          </ChartCard>
          <ChartCard eye="RENTABILIDAD · 3 PERIODOS" title="Márgenes" kpi={kpiMargenes}>
            <GroupedBars
              labels={labels}
              series={[
                { name: 'Bruto',     vals: margenBrutoSeries, color: 'var(--rc-green)' },
                { name: 'Operativo', vals: margenOpSeries,    color: 'var(--rc-blue)'  },
                { name: 'Neto',      vals: margenNetoSeries,  color: 'var(--rc-amber)' }
              ]}
              fmt={(v) => (v ?? 0).toFixed(1) + '%'}
            />
          </ChartCard>
        </div>

        {/* ROW 3 — 3 MINI CHARTS */}
        <div className="fd-w-row fd-w-row--3up">
          <ChartCard eye="LIQUIDEZ" title="Razones de Liquidez" kpi={kpiLiquidez}>
            <GroupedBars
              labels={labels}
              series={[
                { name: 'Corriente',    vals: liquidezCTSeries,    color: 'var(--rc-green)' },
                { name: 'Prueba Ácida', vals: liquidezAcidaSeries, color: 'var(--rc-blue)'  }
              ]}
              fmt={(v) => (v ?? 0).toFixed(2) + 'x'}
            />
          </ChartCard>
          <ChartCard eye="APALANCAMIENTO" title="Endeudamiento" kpi={kpiEndeud}>
            <GroupedBars
              labels={labels}
              series={[
                { name: 'Endeud. %',    vals: endeudamientoSeries,  color: 'var(--rc-amber)' },
                { name: 'Apalancam. x', vals: apalancamientoSeries.map(v => v * 10), color: 'var(--rc-blue)', displayVals: apalancamientoSeries, displayFmt: (v) => (v ?? 0).toFixed(2) + 'x' }
              ]}
              fmt={(v) => (v ?? 0).toFixed(1) + '%'}
            />
          </ChartCard>
          <ChartCard eye="FLUJO · ÚLTIMOS 6 MESES" title="Depósitos Mensuales" kpi={kpiDep}>
            <LineChart
              points={depositosMensuales}
              fmt={fmtMoneyShort}
              monthsBack={6}
            />
          </ChartCard>
        </div>
      </div>

      <div className="fd-grid">
        {/* ESTADO DE RESULTADOS */}
        <section className="fd-panel fd-panel--lg">
          <div className="fd-panel-h">
            <div className="fd-panel-eye">P&amp;L · COMPARATIVO</div>
            <div className="fd-panel-t">Estado de Resultados</div>
          </div>
          <table className="fd-tbl">
            <thead>
              <tr>
                <th />
                <th>{labels[0]}</th>
                <th>{labels[1]}</th>
                <th>{labels[2]}</th>
                <th className="fd-tbl-yoy">YoY</th>
              </tr>
            </thead>
            <tbody>
              {pnlRows.map((row, i) => {
                const v1 = er.y1[row.k], v2 = er.y2[row.k], v3 = er.y3[row.k]
                const change = row.pct ? bps(v2, v1) : yoy(v2, v1)
                const fmt = (v) => row.pct ? (v ?? 0).toFixed(2) + '%' : fmtMoneyShort(v ?? 0)
                return (
                  <tr key={i} className={`${row.bold ? 'bold' : ''} ${row.hi ? 'hi' : ''} ${row.dim ? 'dim' : ''}`}>
                    <td className="fd-tbl-lbl">{row.l}</td>
                    <td className={row.neg && v1 > 0 ? 'neg' : ''}>{row.neg ? '(' + fmt(v1) + ')' : fmt(v1)}</td>
                    <td className={row.neg && v2 > 0 ? 'neg' : ''}>{row.neg ? '(' + fmt(v2) + ')' : fmt(v2)}</td>
                    <td className={row.neg && v3 > 0 ? 'neg' : ''}>{row.neg ? '(' + fmt(v3) + ')' : fmt(v3)}</td>
                    <td className={`fd-tbl-yoy ${change == null ? '' : change >= 0 ? 'up' : 'down'}`}>
                      {change == null ? '—' : (
                        <>
                          <span className="fd-tbl-yoy-arrow">{change >= 0 ? '▲' : '▼'}</span>
                          {(change >= 0 ? '+' : '') + change.toFixed(row.pct ? 2 : 1) + (row.pct ? 'pp' : '%')}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* CAPACIDAD DE PAGO */}
        <section className="fd-panel">
          <div className="fd-panel-h">
            <div className="fd-panel-eye">CRÉDITO · CAPACIDAD</div>
            <div className="fd-panel-t">Capacidad de Pago</div>
          </div>

          <div className="fd-gauge">
            <div className="fd-gauge-arc">
              <div className="fd-gauge-fill" style={{ width: `${Math.min(100, dscrPct)}%`, background: dscrColor }} />
            </div>
            <div className="fd-gauge-meta">
              <div className="fd-gauge-val" style={{ color: dscrColor }}>{cap.dscr > 0 ? cap.dscr.toFixed(2) + 'x' : '—'}</div>
              <div className="fd-gauge-lbl">DSCR · Objetivo 1.50x</div>
            </div>
          </div>

          <dl className="fd-dl">
            <div><dt>Monto Solicitado</dt><dd>{monto > 0 ? fmtMoney(monto) : '—'}</dd></div>
            <div><dt>Pago Mensual</dt><dd>{cap.pmt > 0 ? fmtMoney(cap.pmt) : '—'}</dd></div>
            <div><dt>DSCR Sens. −10%</dt><dd className={cap.dscrSens10 >= 1.2 ? 'pos' : 'neg'}>{cap.dscrSens10 > 0 ? cap.dscrSens10.toFixed(2) + 'x' : '—'}</dd></div>
            <div><dt>DSCR Sens. −20%</dt><dd className={cap.dscrSens20 >= 1.2 ? 'pos' : 'neg'}>{cap.dscrSens20 > 0 ? cap.dscrSens20.toFixed(2) + 'x' : '—'}</dd></div>
            <div><dt>Máx. por Flujo</dt><dd>{cap.montoMaximo > 0 ? fmtMoney(cap.montoMaximo) : '—'}</dd></div>
            <div><dt>Máx. por Garantías</dt><dd>{cap.montoMaxGarantias > 0 ? fmtMoney(cap.montoMaxGarantias) : '—'}</dd></div>
            <div className="fd-dl-hi"><dt>Monto Recomendable</dt><dd>{cap.montoRecomendable > 0 ? fmtMoney(cap.montoRecomendable) : '—'}</dd></div>
          </dl>
        </section>

        {/* RAZONES FINANCIERAS */}
        <section className="fd-panel fd-panel--lg">
          <div className="fd-panel-h">
            <div className="fd-panel-eye">RATIOS · TENDENCIA 3 PERIODOS</div>
            <div className="fd-panel-t">Razones Financieras</div>
          </div>
          <table className="fd-tbl fd-tbl--ratios">
            <thead>
              <tr>
                <th>Indicador</th>
                <th>{labels[0]}</th>
                <th>{labels[1]}</th>
                <th>{labels[2]}</th>
                <th className="fd-tbl-yoy">Δ {labels[0]}→{labels[2]}</th>
              </tr>
            </thead>
            <tbody>
              {ratiosList.map((rt, i) => {
                const [v1, v2, v3] = rt.vals
                const change = bps(v3, v1)
                const good = rt.good === 'up' ? (change >= 0) : (change <= 0)
                const fmt = (v) => (v == null ? '—' : (v).toFixed(2) + rt.suffix)
                return (
                  <tr key={i}>
                    <td className="fd-tbl-lbl">{rt.l}</td>
                    <td>{fmt(v1)}</td>
                    <td>{fmt(v2)}</td>
                    <td className="hi">{fmt(v3)}</td>
                    <td className={`fd-tbl-yoy ${change == null ? '' : good ? 'up' : 'down'}`}>
                      {change == null ? '—' : (
                        <>
                          <span className="fd-tbl-yoy-arrow">{change >= 0 ? '▲' : '▼'}</span>
                          {(change >= 0 ? '+' : '') + change.toFixed(2) + (rt.suffix === '%' ? 'pp' : rt.suffix)}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* CONCENTRACIÓN BANCARIA */}
        <section className="fd-panel">
          <div className="fd-panel-h">
            <div className="fd-panel-eye">FLUJO · CONCENTRACIÓN</div>
            <div className="fd-panel-t">Depósitos Bancarios</div>
          </div>
          <div className="fd-bank-total">
            <div className="fd-bank-total-lbl">Depósitos 6m (total)</div>
            <div className="fd-bank-total-v">{fmtMoney(totalDepositos)}</div>
            <div className="fd-bank-total-sub">Cobertura sobre monto solicitado: <b>{monto > 0 ? ((totalDepositos / 6) / monto).toFixed(2) : '—'}x</b></div>
          </div>
          <div className="fd-banks">
            {depositosPorBanco.map((d, i) => {
              const pct = (d.promedio / maxDeposito) * 100
              const share = totalDepositos > 0 ? (d.total / totalDepositos) * 100 : 0
              return (
                <div key={i} className="fd-bank">
                  <div className="fd-bank-row">
                    <div className="fd-bank-name">{d.banco}</div>
                    <div className="fd-bank-share">{share.toFixed(1)}%</div>
                  </div>
                  <div className="fd-bank-bar"><div className="fd-bank-bar-fill" style={{ width: `${pct}%` }} /></div>
                  <div className="fd-bank-sub">Prom. mensual {fmtMoney(d.promedio)}</div>
                </div>
              )
            })}
            {depositosPorBanco.length === 0 && <div className="fd-empty">Sin cuentas registradas</div>}
          </div>
        </section>
      </div>
    </div>
  )
}

// ============================================================
// WIDGET HELPERS
// ============================================================

function KpiMonto({ monto, maxRec, fillPct, safe, fmtMoneyShort }) {
  const trafficColor = maxRec === 0 ? 'var(--rc-border-dark)' : safe ? 'var(--rc-success)' : 'var(--rc-red)'
  return (
    <div className="fd-w-kpi">
      <div className="fd-w-kpi-eye" style={{ color: trafficColor }}>
        MONTO SOLICITADO
      </div>
      <div className="fd-w-kpi-v">{monto > 0 ? fmtMoneyShort(monto) : '—'}</div>
      <div className="fd-w-kpi-bar">
        <div className="fd-w-kpi-bar-fill" style={{ width: `${fillPct}%`, background: trafficColor }} />
      </div>
      <div className="fd-w-kpi-sub">
        vs. Máx. Recomendable {maxRec > 0 ? fmtMoneyShort(maxRec) : '—'}
        {maxRec > 0 && <span className={`fd-w-kpi-tag ${safe ? 'ok' : 'bad'}`}>{safe ? 'OK' : 'EXCEDE'}</span>}
      </div>
    </div>
  )
}

function KpiDscr({ cap }) {
  const tier = (v) => v >= 1.5 ? 'good' : v >= 1.2 ? 'warn' : 'bad'
  const stress = [
    { l: 'Actual', v: cap.dscr || 0 },
    { l: '−10%',   v: cap.dscrSens10 || 0 },
    { l: '−20%',   v: cap.dscrSens20 || 0 }
  ]
  const max = Math.max(2, ...stress.map(s => s.v))
  return (
    <div className="fd-w-kpi">
      <div className={`fd-w-kpi-eye eye-${tier(cap.dscr || 0)}`}>DSCR · COBERTURA DEUDA</div>
      <div className="fd-w-kpi-v">{cap.dscr > 0 ? cap.dscr.toFixed(2) + 'x' : '—'}</div>
      <div className="fd-w-kpi-stress">
        {stress.map((s, i) => (
          <div key={i} className="fd-w-stress-row">
            <span className="fd-w-stress-l">{s.l}</span>
            <span className="fd-w-stress-bar">
              <span className={`fd-w-stress-fill tier-${tier(s.v)}`} style={{ width: `${Math.min(100, (s.v / max) * 100)}%` }} />
            </span>
            <span className="fd-w-stress-v">{s.v > 0 ? s.v.toFixed(2) + 'x' : '—'}</span>
          </div>
        ))}
      </div>
      <div className="fd-w-kpi-sub">Objetivo ≥ 1.50x</div>
    </div>
  )
}

function KpiCapTrab({ value, delta, fmtMoneyShort }) {
  const positive = delta != null && delta >= 0
  return (
    <div className="fd-w-kpi">
      <div className="fd-w-kpi-eye">CAPITAL DE TRABAJO</div>
      <div className="fd-w-kpi-v">{fmtMoneyShort(value || 0)}</div>
      <div className="fd-w-kpi-bar fd-w-kpi-bar--ghost">
        <div className="fd-w-kpi-bar-fill" style={{ width: `${value > 0 ? 100 : 0}%`, background: value > 0 ? 'var(--rc-success)' : 'var(--rc-red)' }} />
      </div>
      <div className="fd-w-kpi-sub">
        Activo Circulante − Pasivo Circulante
        {delta != null && (
          <span className={`fd-w-kpi-tag ${positive ? 'ok' : 'bad'}`}>
            {positive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}

function KpiMargenNeto({ value, delta, series }) {
  const positive = delta != null && delta >= 0
  const max = Math.max(0.0001, ...series.map(v => Math.abs(v || 0)))
  return (
    <div className="fd-w-kpi">
      <div className="fd-w-kpi-eye">MARGEN NETO</div>
      <div className="fd-w-kpi-v">{(value || 0).toFixed(2)}%</div>
      <div className="fd-w-kpi-spark">
        {series.map((v, i) => {
          const h = (Math.abs(v || 0) / max) * 100
          return <span key={i} className={`fd-w-kpi-spark-bar ${i === series.length - 1 ? 'last' : ''}`} style={{ height: `${Math.max(8, h)}%` }} />
        })}
      </div>
      <div className="fd-w-kpi-sub">
        Tendencia 3 periodos
        {delta != null && (
          <span className={`fd-w-kpi-tag ${positive ? 'ok' : 'bad'}`}>
            {positive ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}pp
          </span>
        )}
      </div>
    </div>
  )
}

