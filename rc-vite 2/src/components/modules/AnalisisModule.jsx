// ============================================================
// MÓDULO 3: ANÁLISIS FINANCIERO
// ============================================================

import { useState } from 'react'
import { ModuleSection, CompletionBar } from '../shared/Common'
import AnalysisModal from '../shared/AnalysisModal'
import {
  calcER, calcBG, calcRazones, fmtMoney,
  financierosCompletionPct
} from '../../engines/financialEngine'
import { Delta, AlertChip, periodMonths } from '../../utils/financialHelpers'
import { ChartCard, GroupedBars, HorizontalGauge, CashCycleChart } from '../shared/Charts'

export default function AnalisisModule({ state }) {
  const er = calcER(state)
  const bg = calcBG(state)
  const r = calcRazones(state)
  const labels = { y1: state.financieros.er.y1Label, y2: state.financieros.er.y2Label, y3: state.financieros.er.y3Label }
  const monthsY3 = periodMonths(labels.y3)
  const [openModal, setOpenModal] = useState(false)

  const fmtMoneyShort = (n) => {
    if (n == null || !isFinite(n)) return '—'
    const abs = Math.abs(n)
    if (abs >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B'
    if (abs >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M'
    if (abs >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K'
    return '$' + n.toFixed(0)
  }

  // ============================================================
  // SECCIÓN A: Análisis Horizontal (P&L flujos — anualizados para fairness)
  // ============================================================
  const ahRows = [
    { l: 'Ventas Netas',        k: 'ventasNetas',     bold: true },
    { l: 'Costo de Venta',      k: 'costoVenta',      neg: true, inverse: true },
    { l: 'Utilidad Bruta',      k: 'utilBruta',       hi: true },
    { l: 'Gastos de Operación', k: 'totalGastosOp',   neg: true, inverse: true },
    { l: 'Utilidad Operativa',  k: 'utilOperativa',   hi: true },
    { l: 'Result. Financiero',  k: 'riFinanciamiento' },
    { l: 'Utilidad Neta',       k: 'utilNeta',        hi: true, bold: true }
  ]

  // ============================================================
  // SECCIÓN B: Razones Financieras (16 indicadores) — agrupadas
  // ============================================================
  const ratioRows = [
    // Endeudamiento
    { grupo: 'Endeudamiento', l: 'Razón Endeudamiento', k: 'razonEndeudamiento', suffix: '%', precision: 2, inverse: true },
    { grupo: 'Endeudamiento', l: 'Apalancamiento',      k: 'apalancamiento',     suffix: 'x', precision: 2, inverse: true },
    // Liquidez
    { grupo: 'Liquidez', l: 'Razón Corriente',  k: 'solvenciaCT',       suffix: 'x', precision: 2 },
    { grupo: 'Liquidez', l: 'Prueba Ácida',     k: 'liquidezAcida',     suffix: 'x', precision: 2 },
    { grupo: 'Liquidez', l: 'Liquidez Inmediata', k: 'liquidezInmediata', suffix: 'x', precision: 2 },
    // Rentabilidad
    { grupo: 'Rentabilidad', l: 'ROA',              k: 'roa',              suffix: '%', precision: 2 },
    { grupo: 'Rentabilidad', l: 'ROE',              k: 'roe',              suffix: '%', precision: 2 },
    { grupo: 'Rentabilidad', l: 'Margen Bruto',     k: 'margenBruto',      suffix: '%', precision: 2 },
    { grupo: 'Rentabilidad', l: 'Margen Operativo', k: 'margenOperativo',  suffix: '%', precision: 2 },
    { grupo: 'Rentabilidad', l: 'Margen Neto',      k: 'margenNeto',       suffix: '%', precision: 2 },
    // Eficiencia
    { grupo: 'Eficiencia', l: 'Días Inventario',   k: 'diasInventario', suffix: 'd', precision: 0, inverse: true },
    { grupo: 'Eficiencia', l: 'Días CxC',          k: 'diasCxC',        suffix: 'd', precision: 0, inverse: true },
    { grupo: 'Eficiencia', l: 'Días CxP',          k: 'diasCxP',        suffix: 'd', precision: 0 },
    { grupo: 'Eficiencia', l: 'Ciclo Operativo',   k: 'cicloOperativo', suffix: 'd', precision: 0, inverse: true },
    { grupo: 'Eficiencia', l: 'Capital Trab. Neto', k: 'capitalTrabajoNeto', suffix: '$', precision: 0, isMoney: true }
  ]

  const grupos = ['Endeudamiento', 'Liquidez', 'Rentabilidad', 'Eficiencia']

  // ============================================================
  // SECCIÓN C: Tablero ejecutivo
  // ============================================================
  // KPIs principales (latest period = y3, snapshot)
  const activoTotalY3 = bg.y3.activoTotal
  const pasivoTotalY3 = bg.y3.pasivoTotal
  const capitalY3 = bg.y3.capital
  const equityToAsset = activoTotalY3 > 0 ? (capitalY3 / activoTotalY3) * 100 : 0
  const debtToAsset = activoTotalY3 > 0 ? (pasivoTotalY3 / activoTotalY3) * 100 : 0

  // Series para los charts de tendencia (3 periodos)
  const clientesSeries = [bg.y1.clientes, bg.y2.clientes, bg.y3.clientes]
  const proveedoresSeries = [bg.y1.proveedores, bg.y2.proveedores, bg.y3.proveedores]
  const wcSeries = [r.y1.capitalTrabajoNeto, r.y2.capitalTrabajoNeto, r.y3.capitalTrabajoNeto]
  const ventasSeries = [er.y1.ventasNetas, er.y2.ventasNetas, er.y3.ventasNetas]
  const utilNetaSeries = [er.y1.utilNeta, er.y2.utilNeta, er.y3.utilNeta]
  const periodLabels = [labels.y1, labels.y2, labels.y3]

  // Cash Conversion Cycle (DSO + DIO − DPO) — 3 periodos
  const dsoSeries = [r.y1.diasCxC, r.y2.diasCxC, r.y3.diasCxC]
  const dioSeries = [r.y1.diasInventario, r.y2.diasInventario, r.y3.diasInventario]
  const dpoSeries = [r.y1.diasCxP, r.y2.diasCxP, r.y3.diasCxP]
  const cccSeries = dsoSeries.map((dso, i) => dso + dioSeries[i] - dpoSeries[i])

  // Zonas de los gauges (semáforo) — cada zona con label corporativo
  const liquidezZones = [
    { until: 1.0, color: 'var(--rc-red)',     label: 'Déficit' },
    { until: 1.5, color: 'var(--rc-amber)',   label: 'Ajustado' },
    { until: 5,   color: 'var(--rc-success)', label: 'Saludable' }
  ]
  const diasInvZones = [
    { until: 60,  color: 'var(--rc-success)', label: 'Ágil' },
    { until: 120, color: 'var(--rc-amber)',   label: 'Normal' },
    { until: 360, color: 'var(--rc-red)',     label: 'Lento' }
  ]
  const diasCxCZones = [
    { until: 60,  color: 'var(--rc-success)', label: 'Ágil' },
    { until: 90,  color: 'var(--rc-amber)',   label: 'Atrasado' },
    { until: 360, color: 'var(--rc-red)',     label: 'Crítico' }
  ]
  const diasCxPZones = [
    { until: 30,  color: 'var(--rc-amber)',   label: 'Pago rápido' },
    { until: 90,  color: 'var(--rc-success)', label: 'Saludable' },
    { until: 360, color: 'var(--rc-amber)',   label: 'Diferido' }
  ]

  return (
    <>
      {/* ============================================================ */}
      {/* SECCIÓN A — Análisis Horizontal */}
      {/* ============================================================ */}
      <ModuleSection number="1" title="Análisis Horizontal" subtitle="Variación % entre ejercicios + dictamen del periodo más reciente">
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
            {ahRows.map((row, i) => {
              const v1 = er.y1[row.k] ?? 0
              const v2 = er.y2[row.k] ?? 0
              const v3 = er.y3[row.k] ?? 0
              const trClass = row.bold && row.hi ? 'total' : row.hi ? 'subtotal' : row.bold ? 'bold' : ''
              return (
                <tr key={i} className={trClass}>
                  <td className={`row-label ${row.bold ? 'bold' : ''}`}>{row.l}</td>
                  <td className="num calc">
                    <span className="num-v">{row.neg && v1 > 0 ? '(' + fmtMoney(v1) + ')' : fmtMoney(v1)}</span>
                  </td>
                  <td className="num calc">
                    <span className="num-v">{row.neg && v2 > 0 ? '(' + fmtMoney(v2) + ')' : fmtMoney(v2)}</span>
                    <Delta curr={v2} prev={v1} precision={1} inverse={row.inverse} />
                  </td>
                  <td className="num calc col-latest">
                    <span className="num-v">{row.neg && v3 > 0 ? '(' + fmtMoney(v3) + ')' : fmtMoney(v3)}</span>
                  </td>
                  <td className="cell-alert">
                    <AlertChip
                      y1={v1} y2={v2} y3={v3}
                      isFlow={true}
                      inverse={row.inverse}
                      monthsY1={periodMonths(labels.y1)}
                      monthsY2={periodMonths(labels.y2)}
                      monthsY3={monthsY3}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ModuleSection>

      {/* ============================================================ */}
      {/* SECCIÓN B — Razones Financieras */}
      {/* ============================================================ */}
      <ModuleSection number="2" title="Razones Financieras" subtitle="16 indicadores clave con semáforo del último periodo">
        {grupos.map(grupo => (
          <div key={grupo} className="razones-block">
            <h4 className="razones-group">{grupo}</h4>
            <table className="fin-table">
              <thead>
                <tr>
                  <th className="label-col">Razón</th>
                  <th className="num">{labels.y1}</th>
                  <th className="num">{labels.y2}</th>
                  <th className="num col-latest">{labels.y3}</th>
                  <th className="col-alert">Análisis · Real & Actual</th>
                </tr>
              </thead>
              <tbody>
                {ratioRows.filter(rt => rt.grupo === grupo).map((rt, i) => {
                  const v1 = r.y1[rt.k] ?? 0
                  const v2 = r.y2[rt.k] ?? 0
                  const v3 = r.y3[rt.k] ?? 0
                  const fmt = (v) => {
                    if (rt.isMoney) return fmtMoneyShort(v)
                    return (v ?? 0).toFixed(rt.precision) + (rt.suffix === '$' ? '' : rt.suffix)
                  }
                  // For ratios in pp suffix (percentages comparing differences) — use 'pp'; for x/d use the suffix
                  const deltaSuffix = rt.suffix === '%' ? 'pp' : rt.suffix
                  const alertSuffix = rt.suffix === '%' ? 'pp' : '%'
                  return (
                    <tr key={i}>
                      <td className="row-label">{rt.l}</td>
                      <td className="num calc"><span className="num-v">{fmt(v1)}</span></td>
                      <td className="num calc">
                        <span className="num-v">{fmt(v2)}</span>
                        <Delta curr={v2} prev={v1} suffix={deltaSuffix} precision={rt.precision === 0 ? 0 : 2} inverse={rt.inverse} />
                      </td>
                      <td className="num calc col-latest"><span className="num-v">{fmt(v3)}</span></td>
                      <td className="cell-alert">
                        <AlertChip
                          y1={v1} y2={v2} y3={v3}
                          suffix={alertSuffix}
                          inverse={rt.inverse}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </ModuleSection>

      {/* ============================================================ */}
      {/* SECCIÓN C — Tablero Ejecutivo (gauges + charts) */}
      {/* ============================================================ */}
      <ModuleSection number="3" title="Tablero Ejecutivo" subtitle="Visualización de indicadores clave del periodo más reciente">
        <div className="fd-w" style={{ marginBottom: 0 }}>
          {/* Row 1: 4 KPI cards estilo Total / Ratio / Equity */}
          <div className="fd-w-row fd-w-row--kpi">
            <KpiSimple
              label="Activo Total"
              value={fmtMoneyShort(activoTotalY3)}
              sub={`Snapshot ${labels.y3}`}
              accent="var(--rc-green)"
            />
            <KpiSimple
              label="Pasivo Total"
              value={fmtMoneyShort(pasivoTotalY3)}
              sub={`${debtToAsset.toFixed(1)}% del activo`}
              accent="var(--rc-amber)"
            />
            <KpiSimple
              label="Capital Contable / Activo"
              value={equityToAsset.toFixed(2) + '%'}
              sub="Autonomía financiera"
              accent={equityToAsset >= 40 ? 'var(--rc-success)' : equityToAsset >= 20 ? 'var(--rc-amber)' : 'var(--rc-red)'}
            />
            <KpiSimple
              label="Capital de Trabajo Neto"
              value={fmtMoneyShort(r.y3.capitalTrabajoNeto)}
              sub="Activo Circ. − Pasivo CP"
              accent={r.y3.capitalTrabajoNeto > 0 ? 'var(--rc-success)' : 'var(--rc-red)'}
            />
          </div>

          {/* Row 2: 4 gauges — ratios clave */}
          <div className="fd-w-row fd-w-row--4up">
            <GaugeCard
              eye="LIQUIDEZ"
              title="Razón Corriente"
              gauge={
                <HorizontalGauge
                  value={r.y3.solvenciaCT}
                  min={0} max={3} unit="x" precision={2}
                  label="Activo Circ. / Pasivo CP"
                  zones={liquidezZones}
                />
              }
            />
            <GaugeCard
              eye="EFICIENCIA"
              title="Días Inventario (DSI)"
              gauge={
                <HorizontalGauge
                  value={r.y3.diasInventario}
                  min={0} max={180} unit="d" precision={0}
                  label="Rotación de inventario"
                  zones={diasInvZones}
                />
              }
            />
            <GaugeCard
              eye="EFICIENCIA"
              title="Días CxC (DSO)"
              gauge={
                <HorizontalGauge
                  value={r.y3.diasCxC}
                  min={0} max={180} unit="d" precision={0}
                  label="Recuperación de clientes"
                  zones={diasCxCZones}
                />
              }
            />
            <GaugeCard
              eye="EFICIENCIA"
              title="Días CxP (DPO)"
              gauge={
                <HorizontalGauge
                  value={r.y3.diasCxP}
                  min={0} max={180} unit="d" precision={0}
                  label="Pago a proveedores"
                  zones={diasCxPZones}
                />
              }
            />
          </div>

          {/* Row 3: 2 chart cards — CxC vs CxP + Capital Trabajo */}
          <div className="fd-w-row fd-w-row--2up">
            <ChartCard
              eye="ANTIGÜEDAD · CLIENTES vs PROVEEDORES"
              title="Cuentas por Cobrar y por Pagar"
            >
              <GroupedBars
                labels={periodLabels}
                series={[
                  { name: 'CxC (Clientes)',     vals: clientesSeries,    color: 'var(--rc-green)' },
                  { name: 'CxP (Proveedores)',  vals: proveedoresSeries, color: 'var(--rc-amber)' }
                ]}
                fmt={fmtMoneyShort}
              />
            </ChartCard>
            <ChartCard
              eye="LIQUIDEZ OPERATIVA"
              title="Capital de Trabajo Neto"
            >
              <GroupedBars
                labels={periodLabels}
                series={[
                  { name: 'Capital de Trabajo Neto', vals: wcSeries, color: 'var(--rc-blue)' }
                ]}
                fmt={fmtMoneyShort}
              />
            </ChartCard>
          </div>

          {/* Row 4: Cash Conversion Cycle — barras apiladas + línea CCC */}
          <div className="fd-w-row fd-w-row--1up">
            <ChartCard
              eye="EFICIENCIA OPERATIVA · CICLO DE EFECTIVO"
              title={`Cash Conversion Cycle (CCC) en días · Últimos ${periodLabels.length} periodos`}
            >
              <CashCycleChart
                labels={periodLabels}
                dso={dsoSeries}
                dio={dioSeries}
                dpo={dpoSeries}
                ccc={cccSeries}
              />
            </ChartCard>
          </div>

          {/* Row 5: P&L combo wide */}
          <div className="fd-w-row fd-w-row--1up">
            <ChartCard
              eye="P&L · RESUMEN"
              title="Ventas y Utilidad Neta por Periodo"
            >
              <GroupedBars
                labels={periodLabels}
                series={[
                  { name: 'Ventas Netas',  vals: ventasSeries,   color: 'var(--rc-green)' },
                  { name: 'Utilidad Neta', vals: utilNetaSeries, color: 'var(--rc-blue)'  }
                ]}
                fmt={fmtMoneyShort}
              />
            </ChartCard>
          </div>
        </div>

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

// ─────────────────────────────────────────────────────────────
// KPI simple — para la fila superior del tablero
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
// GaugeCard — wrapper de tarjeta para gauges
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
