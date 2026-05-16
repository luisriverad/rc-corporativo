// ============================================================
// DASHBOARD EJECUTIVO
// ============================================================

import { Alert } from '../shared/Common'
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
  const bg = calcBG(state)
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

  return (
    <div className="fd">
      {/* TICKER */}
      <div className="fd-ticker">
        <div className="fd-ticker-label">LIVE · {labels[1].toUpperCase()}</div>
        <div className="fd-ticker-track">
          {tickers.map((t, i) => {
            const positive = t.inverse ? (t.d != null && t.d < 0) : (t.d != null && t.d >= 0)
            const arrow = t.d == null ? '' : (t.d >= 0 ? '▲' : '▼')
            return (
              <div key={i} className="fd-tick">
                <div className="fd-tick-l">{t.l}</div>
                <div className="fd-tick-v">{t.v}</div>
                {t.d != null && (
                  <div className={`fd-tick-d ${positive ? 'up' : 'down'}`}>
                    {arrow} {Math.abs(t.d).toFixed(t.unit === '%' ? 1 : 2)}{t.unit}
                  </div>
                )}
              </div>
            )
          })}
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
                      {change == null ? '—' : (change >= 0 ? '+' : '') + change.toFixed(row.pct ? 2 : 1) + (row.pct ? 'pp' : '%')}
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
          <div className="fd-ratios">
            {ratiosList.map((rt, i) => {
              const max = Math.max(...rt.vals.map(v => Math.abs(v || 0)))
              const last = rt.vals[rt.vals.length - 1]
              const first = rt.vals[0]
              const change = bps(last, first)
              const good = rt.good === 'up' ? (change >= 0) : (change <= 0)
              return (
                <div key={i} className="fd-ratio">
                  <div className="fd-ratio-l">{rt.l}</div>
                  <div className="fd-ratio-v">{(last || 0).toFixed(2)}{rt.suffix}</div>
                  <div className="fd-ratio-spark">
                    {rt.vals.map((v, j) => {
                      const h = max > 0 ? (Math.abs(v || 0) / max) * 100 : 0
                      return <span key={j} className="fd-spark-bar" style={{ height: `${Math.max(6, h)}%`, background: j === rt.vals.length - 1 ? (good ? 'var(--rc-success)' : 'var(--rc-red)') : 'var(--rc-border-dark)' }} />
                    })}
                  </div>
                  <div className={`fd-ratio-d ${good ? 'up' : 'down'}`}>
                    {change == null ? '—' : (change >= 0 ? '+' : '') + change.toFixed(2)}{rt.suffix === '%' ? 'pp' : rt.suffix}
                  </div>
                </div>
              )
            })}
          </div>
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
