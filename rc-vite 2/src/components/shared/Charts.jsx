// ============================================================
// COMPONENTES DE GRÁFICAS COMPARTIDOS — paleta RC Corporativo
// ============================================================

import { useId } from 'react'

// ─────────────────────────────────────────────────────────────
// ChartCard — wrapper de tarjeta con eyebrow + título + KPI pill
// ─────────────────────────────────────────────────────────────
export function ChartCard({ eye, title, kpi, children }) {
  return (
    <div className="fd-w-card">
      <div className="fd-w-card-h">
        <div className="fd-w-card-h-l">
          <div className="fd-w-card-eye">{eye}</div>
          <div className="fd-w-card-t">{title}</div>
        </div>
        {kpi && <ChartCardKpi kpi={kpi} />}
      </div>
      <div className="fd-w-card-body">{children}</div>
    </div>
  )
}

export function ChartCardKpi({ kpi }) {
  if (kpi.delta == null) return <div className="fd-w-card-kpi neutral">—</div>
  const positive = kpi.delta >= 0
  const good = kpi.inverse ? !positive : positive
  const tone = kpi.delta === 0 ? 'neutral' : good ? 'good' : 'bad'
  const arrow = kpi.delta === 0 ? '·' : positive ? '▲' : '▼'
  const sign = positive ? '+' : ''
  return (
    <div className={`fd-w-card-kpi ${tone}`}>
      <span className="fd-w-card-kpi-arrow">{arrow}</span>
      <span className="fd-w-card-kpi-v">{sign}{kpi.delta.toFixed(kpi.precision ?? 1)}{kpi.unit}</span>
      {kpi.label && <span className="fd-w-card-kpi-l">{kpi.label}</span>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// GroupedBars — barras agrupadas con etiquetas y leyenda
// series: [{ name, vals, color, displayVals?, displayFmt? }]
// ─────────────────────────────────────────────────────────────
export function GroupedBars({ labels, series, fmt }) {
  const allVals = series.flatMap(s => s.vals.map(v => Math.abs(v || 0)))
  const max = Math.max(0.0001, ...allVals)
  const chartH = 160
  return (
    <div className="fd-w-bars">
      <div className="fd-w-bars-area" style={{ height: chartH }}>
        {labels.map((_lab, gi) => (
          <div key={gi} className="fd-w-bars-group">
            {series.map((s, si) => {
              const v = s.vals[gi]
              const dispVal = s.displayVals ? s.displayVals[gi] : v
              const dispFmt = s.displayFmt || fmt
              const h = max > 0 ? (Math.abs(v || 0) / max) * 100 : 0
              return (
                <div key={si} className="fd-w-bars-bar-wrap" title={`${s.name}: ${dispFmt(dispVal)}`}>
                  <span className="fd-w-bars-val" style={{ color: s.color }}>{dispFmt(dispVal)}</span>
                  <span className="fd-w-bars-bar" style={{ height: `${Math.max(2, h)}%`, background: s.color }} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="fd-w-bars-axis">
        {labels.map((lab, i) => <span key={i}>{lab}</span>)}
      </div>
      <div className="fd-w-bars-legend">
        {series.map((s, i) => (
          <span key={i} className="fd-w-legend-item">
            <span className="fd-w-legend-dot" style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// LineChart — línea con área, puntos y etiquetas (default eje meses)
// Si `xLabels` se pasa, los usa en lugar de meses calculados.
// ─────────────────────────────────────────────────────────────
export function LineChart({ points, fmt, monthsBack, xLabels }) {
  if (!points || points.length === 0 || points.every(p => !p)) {
    return <div className="fd-w-empty">Sin datos</div>
  }
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = Math.max(1, max - min)
  const W = 320, H = 160, P = 26
  const innerW = W - P * 2, innerH = H - P * 2
  const xs = points.map((_, i) => P + (i / Math.max(1, points.length - 1)) * innerW)
  const ys = points.map(p => P + innerH - ((p - min) / range) * innerH)
  const linePath = points.map((_p, i) => `${i === 0 ? 'M' : 'L'} ${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  const areaPath = linePath + ` L ${xs[xs.length - 1].toFixed(1)} ${P + innerH} L ${xs[0].toFixed(1)} ${P + innerH} Z`
  const axis = xLabels || (monthsBack ? buildMonthLabels(monthsBack) : points.map((_, i) => `P${i + 1}`))
  const labelOffset = (i) => (ys[i] - P > 14 ? -8 : 16)
  return (
    <div className="fd-w-line">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="fd-w-line-svg">
        <defs>
          <linearGradient id="fd-w-line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="var(--rc-green)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--rc-green)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#fd-w-line-grad)" />
        <path d={linePath} fill="none" stroke="var(--rc-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={xs[i]} cy={ys[i]} r="3.5" fill="#fff" stroke="var(--rc-green)" strokeWidth="1.5">
              <title>{fmt(p)}</title>
            </circle>
            <text x={xs[i]} y={ys[i] + labelOffset(i)} textAnchor="middle" className="fd-w-line-lbl">{fmt(p)}</text>
          </g>
        ))}
      </svg>
      <div className="fd-w-line-axis" style={{ gridTemplateColumns: `repeat(${axis.length}, 1fr)` }}>
        {axis.map((m, i) => <span key={i}>{m}</span>)}
      </div>
      {monthsBack && (
        <div className="fd-w-line-sum">
          <span>Prom. {fmt(points.reduce((s, v) => s + v, 0) / points.length)}</span>
          <span>Total {fmt(points.reduce((s, v) => s + v, 0))}</span>
        </div>
      )}
    </div>
  )
}

function buildMonthLabels(monthsBack) {
  const now = new Date()
  return Array.from({ length: monthsBack }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1)
    return d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '')
  })
}

// ─────────────────────────────────────────────────────────────
// CashCycleChart — barras apiladas (DSO+DIO+DPO) + línea CCC overlay
// labels: array de periodos
// dso, dio, dpo, ccc: arrays paralelos de números
// ─────────────────────────────────────────────────────────────
export function CashCycleChart({ labels, dso, dio, dpo, ccc }) {
  const W = 1200, H = 240, P = 32
  const innerW = W - P * 2, innerH = H - P * 2 - 24 // 24px reservado para axis abajo
  const cy0 = P + innerH // base de las barras

  // Stack totals para escala
  const stackTotals = labels.map((_, i) => (dso[i] || 0) + (dio[i] || 0) + (dpo[i] || 0))
  const maxStack = Math.max(0.0001, ...stackTotals)
  const maxCcc = Math.max(0.0001, ...ccc.map(c => Math.abs(c || 0)))
  const yMax = Math.max(maxStack, maxCcc * 1.05)

  const barW = Math.min(90, innerW / labels.length * 0.45)
  const slotW = innerW / labels.length
  const xCenter = (i) => P + slotW * (i + 0.5)

  // Mapeo de Y
  const yFromV = (v) => cy0 - (v / yMax) * innerH

  // Colores (gradiente de verde RC)
  const COLOR_DSO = 'var(--rc-green-dark)'  // más oscuro (cobranza)
  const COLOR_DIO = 'var(--rc-green)'        // medio (inventario)
  const COLOR_DPO = 'var(--rc-green-light)'  // claro (pago)
  const COLOR_CCC = 'var(--rc-amber)'        // línea overlay

  // Path de la línea CCC
  const cccPoints = ccc.map((c, i) => ({ x: xCenter(i), y: yFromV(Math.abs(c || 0)) }))
  const linePath = cccPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  // Ticks Y (5 divisiones)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: cy0 - f * innerH,
    val: (yMax * f).toFixed(0),
  }))

  return (
    <div className="fd-w-cycle">
      <svg viewBox={`0 0 ${W} ${H}`} className="fd-w-cycle-svg" preserveAspectRatio="xMidYMid meet">
        {/* Y axis ticks (grid) */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={P} y1={t.y.toFixed(1)} x2={W - P} y2={t.y.toFixed(1)} stroke="var(--rc-border)" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
            <text x={P - 6} y={(t.y + 3).toFixed(1)} textAnchor="end" className="fd-w-cycle-tick">{t.val}</text>
          </g>
        ))}

        {/* Stacked bars */}
        {labels.map((_, i) => {
          const x = xCenter(i) - barW / 2
          const hDso = (dso[i] || 0) / yMax * innerH
          const hDio = (dio[i] || 0) / yMax * innerH
          const hDpo = (dpo[i] || 0) / yMax * innerH
          const yDso = cy0 - hDso
          const yDio = yDso - hDio
          const yDpo = yDio - hDpo
          return (
            <g key={`bar-${i}`}>
              {/* DSO (bottom) */}
              <rect x={x.toFixed(1)} y={yDso.toFixed(1)} width={barW} height={Math.max(0, hDso).toFixed(1)} fill={COLOR_DSO} />
              {/* DIO (middle) */}
              <rect x={x.toFixed(1)} y={yDio.toFixed(1)} width={barW} height={Math.max(0, hDio).toFixed(1)} fill={COLOR_DIO} />
              {/* DPO (top) */}
              <rect x={x.toFixed(1)} y={yDpo.toFixed(1)} width={barW} height={Math.max(0, hDpo).toFixed(1)} fill={COLOR_DPO} />
            </g>
          )
        })}

        {/* CCC line overlay */}
        <path d={linePath} fill="none" stroke={COLOR_CCC} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {cccPoints.map((p, i) => (
          <circle key={`pt-${i}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4.5" fill="#fff" stroke={COLOR_CCC} strokeWidth="2" />
        ))}

        {/* CCC value labels — siempre arriba de la barra apilada para legibilidad */}
        {labels.map((_, i) => {
          const yStackTop = yFromV(stackTotals[i])
          const yCccPt = cccPoints[i].y
          const yLbl = Math.min(yStackTop, yCccPt) - 10
          return (
            <text
              key={`lbl-${i}`}
              x={xCenter(i).toFixed(1)}
              y={yLbl.toFixed(1)}
              textAnchor="middle"
              className="fd-w-cycle-ccc-lbl"
            >
              {(ccc[i] || 0).toFixed(0)}d
            </text>
          )
        })}

        {/* X axis labels */}
        {labels.map((lab, i) => (
          <text key={`x-${i}`} x={xCenter(i).toFixed(1)} y={(H - 6).toFixed(1)} textAnchor="middle" className="fd-w-cycle-axis">{lab}</text>
        ))}
      </svg>
      <div className="fd-w-cycle-legend">
        <span className="fd-w-legend-item"><span className="fd-w-legend-dot" style={{ background: COLOR_DSO }} /> DSO (días cobranza)</span>
        <span className="fd-w-legend-item"><span className="fd-w-legend-dot" style={{ background: COLOR_DIO }} /> DIO (días inventario)</span>
        <span className="fd-w-legend-item"><span className="fd-w-legend-dot" style={{ background: COLOR_DPO }} /> DPO (días pago)</span>
        <span className="fd-w-legend-item"><span className="fd-w-legend-dot fd-w-legend-line" style={{ background: COLOR_CCC }} /> CCC (ciclo neto)</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Gauge — arco 270° con aguja, valor central, zonas de color
// zones: [{ until: number, color: string }] — bandas de tono.
// ─────────────────────────────────────────────────────────────
export function Gauge({ value, min = 0, max = 100, unit = '', precision = 2, label, zones, fmt }) {
  // Layout: 180° arc SEMICIRCULAR (mitad superior). Pivote abajo-centro, valor debajo en espacio limpio.
  const W = 240, H = 175
  const cx = W / 2, cy = 118
  const r = 80, strokeW = 20
  // Arc desde 270° (LEFT) clockwise por TOP hasta 450°=90° (RIGHT) — semicírculo superior
  const START = 270, END = 450
  const reactId = useId().replace(/[:]/g, '')
  const gaugeId = `g${reactId}`

  const v = value == null || !isFinite(value) ? min : value
  // Auto-extiende el max cuando el valor lo supera, para que la aguja apunte a la posición real.
  // Redondea hacia arriba a un número "limpio" arriba del valor + un margen pequeño.
  const effectiveMax = v > max ? Math.ceil(v + Math.max(0.5, max * 0.1)) : max
  const rawPos = (v - min) / (effectiveMax - min)
  const pos = Math.max(0, Math.min(1, rawPos))
  const underflow = rawPos < 0
  const valueAngle = START + (END - START) * pos

  // Polar: 0° = TOP, aumenta en sentido horario
  const polar = (angle, radius = r) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  const startPt = polar(START)
  const endPt = polar(END)
  const valuePt = polar(valueAngle)

  // Background arc (180° → large=0)
  const bgArc = `M ${startPt.x.toFixed(1)} ${startPt.y.toFixed(1)} A ${r} ${r} 0 0 1 ${endPt.x.toFixed(1)} ${endPt.y.toFixed(1)}`

  // Zone arcs (segmentos de color) — la última zona se extiende a effectiveMax si hubo overflow
  const lastZoneIdx = (zones?.length || 0) - 1
  const zoneArcs = zones?.map((z, i) => {
    const zStart = i === 0 ? min : zones[i - 1].until
    const zEnd = i === lastZoneIdx && z.until >= max ? effectiveMax : Math.min(z.until, effectiveMax)
    const a1 = START + ((zStart - min) / (effectiveMax - min)) * (END - START)
    const a2 = START + ((zEnd - min) / (effectiveMax - min)) * (END - START)
    const p1 = polar(a1)
    const p2 = polar(a2)
    const large = a2 - a1 > 180 ? 1 : 0
    return { d: `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`, color: z.color, key: i }
  }) || []

  // Value fill arc
  const valueLarge = valueAngle - START > 180 ? 1 : 0

  // Tono activo según zona donde cae el valor
  let activeColor = 'var(--rc-green)'
  let activeLabel = null
  if (zones && zones.length > 0) {
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i]
      if (v <= z.until) {
        activeColor = z.color
        activeLabel = z.label || null
        break
      }
      activeColor = z.color
      activeLabel = z.label || null
    }
  }

  // Solo MIN y MAX en las esquinas inferiores (estilo gauge clásico).
  // Sin ticks intermedios para evitar valores feos (0.8, 2.3) en escalas no-redondas.
  const fmtTick = (n) => Number.isInteger(n) ? String(n) : n.toFixed(1)

  // Needle: polígono ahusado apuntando UP (cy → cy-needleLength), luego rotado por valueAngle
  const needleLength = r - 6
  const needleBaseHalf = 4
  const needlePoints = `${(cx - needleBaseHalf).toFixed(1)},${(cy + 2).toFixed(1)} ${cx.toFixed(1)},${(cy - needleLength).toFixed(1)} ${(cx + needleBaseHalf).toFixed(1)},${(cy + 2).toFixed(1)}`

  const displayVal = fmt ? fmt(v) : `${v.toFixed(precision)}${unit}`

  return (
    <div className="fd-gauge">
      <svg viewBox={`0 0 ${W} ${H}`} className="fd-gauge-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id={`shadow-${gaugeId}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
            <feOffset dy="1.5" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.28" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track del semicírculo */}
        <path d={bgArc} fill="none" stroke="#EFEDE5" strokeWidth={strokeW} strokeLinecap="butt" />

        {/* Zone bands — opacidad COMPLETA (single source of truth visual) */}
        {zoneArcs.length > 0 && zoneArcs.map((za) => (
          <path key={za.key} d={za.d} fill="none" stroke={za.color} strokeWidth={strokeW} strokeLinecap="butt" filter={`url(#shadow-${gaugeId})`} />
        ))}

        {/* MIN label */}
        <text x={(startPt.x).toFixed(1)} y={(startPt.y + 16).toFixed(1)} textAnchor="middle" className="fd-gauge-tick-lbl">{fmtTick(min)}</text>
        {/* MAX label — refleja effectiveMax cuando hay auto-extensión */}
        <text x={(endPt.x).toFixed(1)} y={(endPt.y + 16).toFixed(1)} textAnchor="middle" className="fd-gauge-tick-lbl">
          {fmtTick(effectiveMax)}
        </text>
        {underflow && (
          <text x={(startPt.x).toFixed(1)} y={(startPt.y - 6).toFixed(1)} textAnchor="middle" className="fd-gauge-tick-lbl" style={{ fill: 'var(--rc-red)' }}>◂</text>
        )}

        {/* La aguja es el único indicador del valor — no hay value fill que se mezcle con las zonas */}
        <g transform={`rotate(${valueAngle.toFixed(2)} ${cx} ${cy})`}>
          <polygon points={needlePoints} fill="var(--rc-text)" stroke="var(--rc-text)" strokeWidth="0.5" strokeLinejoin="round" />
        </g>

        {/* Pivote — círculo blanco con borde y centro negro (estilo manómetro) */}
        <circle cx={cx} cy={cy} r="7" fill="#fff" stroke="var(--rc-text)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="2.5" fill="var(--rc-text)" />

        {/* Valor central — debajo del pivote, en espacio LIMPIO sin overlap con aguja */}
        <text x={cx} y={cy + 32} textAnchor="middle" className="fd-gauge-v-text" style={{ fill: activeColor }}>{displayVal}</text>
      </svg>
      {label && <div className="fd-gauge-l">{label}</div>}
      {activeLabel && (
        <div className="fd-gauge-zone" style={{ color: activeColor, borderColor: activeColor }}>
          <span className="fd-gauge-zone-dot" style={{ background: activeColor }} />
          {activeLabel}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// HorizontalGauge — barra horizontal con bandas de zona y marcador
// Mismo contrato que Gauge: { value, min, max, unit, precision, label, zones, fmt }
// ─────────────────────────────────────────────────────────────
export function HorizontalGauge({ value, min = 0, max = 100, unit = '', precision = 2, label, zones, fmt }) {
  const W = 240, H = 64
  const padX = 10
  const innerW = W - padX * 2
  const barH = 14
  const barTop = 22
  const reactId = useId().replace(/[:]/g, '')
  const clipId = `hgclip-${reactId}`

  const v = value == null || !isFinite(value) ? min : value
  const effectiveMax = v > max ? Math.ceil(v + Math.max(0.5, max * 0.1)) : max
  const rawPos = (v - min) / (effectiveMax - min)
  const pos = Math.max(0, Math.min(1, rawPos))
  const underflow = rawPos < 0
  const markerX = padX + innerW * pos

  const lastZoneIdx = (zones?.length || 0) - 1
  const zoneSegments = zones?.map((z, i) => {
    const zStart = i === 0 ? min : zones[i - 1].until
    const zEnd = i === lastZoneIdx && z.until >= max ? effectiveMax : Math.min(z.until, effectiveMax)
    const x1 = padX + ((zStart - min) / (effectiveMax - min)) * innerW
    const x2 = padX + ((zEnd - min) / (effectiveMax - min)) * innerW
    return { x: x1, width: Math.max(0, x2 - x1), color: z.color, key: i }
  }) || []

  let activeColor = 'var(--rc-green)'
  let activeLabel = null
  if (zones && zones.length > 0) {
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i]
      if (v <= z.until) { activeColor = z.color; activeLabel = z.label || null; break }
      activeColor = z.color
      activeLabel = z.label || null
    }
  }

  const fmtTick = (n) => Number.isInteger(n) ? String(n) : n.toFixed(1)
  const displayVal = fmt ? fmt(v) : `${v.toFixed(precision)}${unit}`

  return (
    <div className="fd-hgauge">
      <div className="fd-hgauge-v" style={{ color: activeColor }}>{displayVal}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="fd-hgauge-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id={clipId}>
            <rect x={padX} y={barTop} width={innerW} height={barH} rx={barH / 2} ry={barH / 2} />
          </clipPath>
        </defs>

        {/* Background track */}
        <rect x={padX} y={barTop} width={innerW} height={barH} rx={barH / 2} ry={barH / 2} fill="#EFEDE5" />

        {/* Zone bands */}
        <g clipPath={`url(#${clipId})`}>
          {zoneSegments.map(zs => (
            <rect key={zs.key} x={zs.x.toFixed(1)} y={barTop} width={zs.width.toFixed(1)} height={barH} fill={zs.color} />
          ))}
        </g>

        {/* Marker — triángulo + línea vertical */}
        <g transform={`translate(${markerX.toFixed(1)}, 0)`}>
          <polygon
            points={`0,${barTop - 3} -5,${barTop - 11} 5,${barTop - 11}`}
            fill="var(--rc-text)"
            stroke="#fff"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <line
            x1="0" y1={barTop - 1}
            x2="0" y2={barTop + barH + 1}
            stroke="var(--rc-text)" strokeWidth="2"
          />
        </g>

        {/* Min / Max ticks */}
        <text x={padX} y={H - 4} textAnchor="start" className="fd-hgauge-tick">{fmtTick(min)}</text>
        <text x={W - padX} y={H - 4} textAnchor="end" className="fd-hgauge-tick">{fmtTick(effectiveMax)}</text>

        {underflow && (
          <text x={padX} y={barTop - 6} textAnchor="start" className="fd-hgauge-tick" style={{ fill: 'var(--rc-red)' }}>◂</text>
        )}
      </svg>
      {label && <div className="fd-hgauge-l">{label}</div>}
      {activeLabel && (
        <div className="fd-hgauge-zone" style={{ color: activeColor, borderColor: activeColor }}>
          <span className="fd-hgauge-zone-dot" style={{ background: activeColor }} />
          {activeLabel}
        </div>
      )}
    </div>
  )
}

