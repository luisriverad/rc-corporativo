// ============================================================
// MÓDULO 4: BURÓ CREDITICIO — UNIFICADO PF + PM
// ============================================================

import { useState } from 'react'
import { Icon, ModuleSection, Alert, CompletionBar } from '../shared/Common'
import {
  fmtMoney, parseNum, calcBG,
  buroPFCompletionPct, buroPMCompletionPct
} from '../../engines/financialEngine'

// ─────────────────────────────────────────────────────────────
// MOP chip — semáforo corporativo basado en grado de atraso
// ─────────────────────────────────────────────────────────────
function mopChip(mop) {
  const num = parseInt(mop) || 0
  let tone, label
  if (!mop || num === 0) { tone = 'neutral'; label = 'Nuevo' }
  else if (num === 1)    { tone = 'good';    label = 'Al corriente' }
  else if (num === 2)    { tone = 'caution'; label = 'Atraso leve' }
  else if (num === 3)    { tone = 'warn';    label = 'Atraso medio' }
  else                   { tone = 'critical'; label = 'Atraso grave' }
  return (
    <span className={`fin-alert tone-${tone}`} title={`MOP ${mop || '—'}: ${label}`}>
      <span className="fin-alert-dot" />
      MOP {mop || '—'}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// KPI card simple — para la fila de resumen
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

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function BuroModule({ state, setState }) {
  const [entity, setEntity] = useState('PF') // 'PF' | 'PM'

  return (
    <>
      {/* Toggle PF / PM — esquina superior */}
      <div className="buro-toggle-bar">
        <div className="buro-toggle">
          <button
            className={`buro-toggle-btn ${entity === 'PF' ? 'active' : ''}`}
            onClick={() => setEntity('PF')}
          >
            <Icon path='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' size={14} />
            Persona Física
          </button>
          <button
            className={`buro-toggle-btn ${entity === 'PM' ? 'active' : ''}`}
            onClick={() => setEntity('PM')}
          >
            <Icon path='<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' size={14} />
            Persona Moral
          </button>
        </div>
      </div>

      {entity === 'PF' ? <BuroPF state={state} setState={setState} /> : <BuroPM state={state} setState={setState} />}

      <CompletionBar
        title="% de Completado del Módulo"
        pct={Math.round((buroPFCompletionPct(state) + buroPMCompletionPct(state)) / 2)}
      />
    </>
  )
}

// ============================================================
// PERSONA FÍSICA
// ============================================================
function BuroPF({ state, setState }) {
  const b = state.buroPF

  const update = (key, value) => setState({ ...state, buroPF: { ...b, [key]: value } })
  const updateList = (listName, idx, key, value) => {
    const list = [...(b[listName] || [])]
    list[idx] = { ...list[idx], [key]: value }
    setState({ ...state, buroPF: { ...b, [listName]: list } })
  }
  const addToList = (listName, item) => setState({ ...state, buroPF: { ...b, [listName]: [...(b[listName] || []), item] } })
  const removeFromList = (listName, idx) => setState({ ...state, buroPF: { ...b, [listName]: (b[listName] || []).filter((_, i) => i !== idx) } })

  const totalSaldosActivos =
    (b.creditosBancariosActivos || []).reduce((acc, c) => acc + parseNum(c.saldo), 0) +
    (b.creditosNoBancariosActivos || []).reduce((acc, c) => acc + parseNum(c.saldo), 0)
  const totalLimites =
    (b.creditosBancariosActivos || []).reduce((acc, c) => acc + parseNum(c.limite), 0) +
    (b.creditosNoBancariosActivos || []).reduce((acc, c) => acc + parseNum(c.limite), 0)
  const utilizacion = totalLimites > 0 ? (totalSaldosActivos / totalLimites) * 100 : 0
  const numConsultas = parseNum(b.consultasUltimos3Meses)
  const totalCreditos =
    (b.creditosBancariosActivos || []).length +
    (b.creditosBancariosCerrados || []).length +
    (b.creditosNoBancariosActivos || []).length +
    (b.creditosNoBancariosCerrados || []).length

  // Peor MOP entre todos los activos
  const allActive = [...(b.creditosBancariosActivos || []), ...(b.creditosNoBancariosActivos || [])]
  const peorMop = allActive.reduce((max, c) => Math.max(max, parseInt(c.mop) || 0), 0)
  const mopAccent = peorMop <= 1 ? 'var(--rc-success)' : peorMop === 2 ? 'var(--rc-amber)' : 'var(--rc-red)'
  const mopLabel = peorMop === 0 ? '—' : peorMop === 1 ? 'Al corriente' : peorMop === 2 ? 'Atraso leve' : 'Atraso grave'

  const renderCreditTable = (listName, title, isActive = true) => {
    const list = b[listName] || []
    const isClosed = listName.includes('Cerrados')
    return (
      <div className="razones-block">
        <h4 className="razones-group">{title}</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="fin-table">
            <thead>
              <tr>
                <th className="label-col">Otorgante</th>
                <th>Cuenta</th>
                <th>Tipo</th>
                <th className="num">{isActive ? 'Saldo' : 'Máximo'}</th>
                {isActive && <th className="num">Límite</th>}
                <th className="col-alert">MOP</th>
                <th>{isClosed ? 'Cierre' : 'Apertura'}</th>
                <th>Estatus</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={isActive ? 9 : 8} className="buro-empty">Sin registros — agrega un crédito abajo</td></tr>
              ) : list.map((c, idx) => (
                <tr key={idx}>
                  <td className="fd-tbl-lbl"><input type="text" className="buro-cell-input" value={c.otorgante || ''} onChange={e => updateList(listName, idx, 'otorgante', e.target.value)} /></td>
                  <td><input type="text" className="buro-cell-input" value={c.cuenta || ''} onChange={e => updateList(listName, idx, 'cuenta', e.target.value)} /></td>
                  <td><input type="text" className="buro-cell-input" value={c.tipo || ''} onChange={e => updateList(listName, idx, 'tipo', e.target.value)} /></td>
                  <td className="num"><input type="number" className="buro-cell-input buro-cell-num" value={isActive ? (c.saldo || '') : (c.maxCredito || '')} onChange={e => updateList(listName, idx, isActive ? 'saldo' : 'maxCredito', e.target.value)} /></td>
                  {isActive && <td className="num"><input type="number" className="buro-cell-input buro-cell-num" value={c.limite || ''} onChange={e => updateList(listName, idx, 'limite', e.target.value)} /></td>}
                  <td className="cell-alert">
                    <div className="buro-mop-wrap">
                      {mopChip(c.mop)}
                      <input type="text" className="buro-mop-input" maxLength={2} value={c.mop || ''} onChange={e => updateList(listName, idx, 'mop', e.target.value)} />
                    </div>
                  </td>
                  <td><input type="text" className="buro-cell-input" value={isClosed ? (c.cierre || '') : (c.apertura || '')} onChange={e => updateList(listName, idx, isClosed ? 'cierre' : 'apertura', e.target.value)} /></td>
                  <td><input type="text" className="buro-cell-input" value={c.estatus || ''} onChange={e => updateList(listName, idx, 'estatus', e.target.value)} /></td>
                  <td><button className="btn-remove" onClick={() => removeFromList(listName, idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-add" onClick={() => addToList(listName, { otorgante: '', cuenta: '', tipo: '', saldo: '', limite: '', maxCredito: '', mop: '1', apertura: '', cierre: '', estatus: '' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar
        </button>
      </div>
    )
  }

  return (
    <>
      <ModuleSection number="1" title="Datos del Titular" subtitle="Información de identificación">
        <div className="form-grid">
          <div className="field span-2"><label className="field-label">Nombre Completo</label><input className="field-input" type="text" value={b.nombre || ''} onChange={e => update('nombre', e.target.value)} /></div>
          <div className="field"><label className="field-label">RFC</label><input className="field-input" type="text" value={b.rfc || ''} onChange={e => update('rfc', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} /></div>
          <div className="field"><label className="field-label">Fecha de Consulta</label><input className="field-input" type="date" value={b.fechaConsulta || ''} onChange={e => update('fechaConsulta', e.target.value)} /></div>
          <div className="field"><label className="field-label">Fecha de Nacimiento</label><input className="field-input" type="date" value={b.fechaNacimiento || ''} onChange={e => update('fechaNacimiento', e.target.value)} /></div>
          <div className="field"><label className="field-label">Folio</label><input className="field-input" type="text" value={b.folio || ''} onChange={e => update('folio', e.target.value)} /></div>
          <div className="field"><label className="field-label">Consultas Últimos 3 Meses</label><input className="field-input num" type="number" value={b.consultasUltimos3Meses || ''} onChange={e => update('consultasUltimos3Meses', e.target.value)} /></div>
        </div>

        {/* KPI Row */}
        <div className="fd-w-row fd-w-row--kpi" style={{ marginTop: 20 }}>
          <KpiSimple
            label="Saldos Activos"
            value={fmtMoney(totalSaldosActivos)}
            sub={`Suma deudas vigentes`}
            accent="var(--rc-green)"
          />
          <KpiSimple
            label="Utilización de Líneas"
            value={totalLimites > 0 ? utilizacion.toFixed(1) + '%' : '—'}
            sub={`Saldo / Límite total`}
            accent={utilizacion < 30 ? 'var(--rc-success)' : utilizacion < 60 ? 'var(--rc-amber)' : 'var(--rc-red)'}
          />
          <KpiSimple
            label="Peor MOP Activo"
            value={mopLabel}
            sub={`MOP ${peorMop || '—'} máximo`}
            accent={mopAccent}
          />
          <KpiSimple
            label="Consultas Recientes"
            value={numConsultas}
            sub={`${numConsultas >= 3 ? 'Bureau-shopping' : numConsultas > 0 ? 'Búsqueda moderada' : 'Sin búsqueda'} (3 meses)`}
            accent={numConsultas >= 3 ? 'var(--rc-red)' : numConsultas > 0 ? 'var(--rc-amber)' : 'var(--rc-success)'}
          />
        </div>
      </ModuleSection>

      <ModuleSection number="2" title="Créditos Bancarios" subtitle="Tarjetas, hipotecas, automotrices">
        {renderCreditTable('creditosBancariosActivos', 'Activos', true)}
        {renderCreditTable('creditosBancariosCerrados', 'Cerrados', false)}
      </ModuleSection>

      <ModuleSection number="3" title="Créditos No Bancarios" subtitle="Tiendas departamentales, financieras, otros otorgantes">
        {renderCreditTable('creditosNoBancariosActivos', 'Activos', true)}
        {renderCreditTable('creditosNoBancariosCerrados', 'Cerrados', false)}
      </ModuleSection>

      <ModuleSection number="4" title="Consultas Recientes" subtitle="Instituciones que han consultado el buró en los últimos 3 meses">
        {numConsultas >= 3 && (
          <Alert level="warn" title="Bureau-shopping detectado">
            {numConsultas} consultas en los últimos 3 meses. Indica búsqueda activa de crédito en múltiples instituciones.
          </Alert>
        )}
        <table className="fin-table">
          <thead>
            <tr>
              <th className="label-col">Institución</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(b.consultasFinancieras || []).length === 0 ? (
              <tr><td colSpan="3" className="buro-empty">Sin consultas registradas</td></tr>
            ) : b.consultasFinancieras.map((c, idx) => (
              <tr key={idx}>
                <td className="fd-tbl-lbl"><input type="text" className="buro-cell-input" value={c.institucion || ''} onChange={e => updateList('consultasFinancieras', idx, 'institucion', e.target.value)} /></td>
                <td><input type="date" className="buro-cell-input" value={c.fecha || ''} onChange={e => updateList('consultasFinancieras', idx, 'fecha', e.target.value)} /></td>
                <td><button className="btn-remove" onClick={() => removeFromList('consultasFinancieras', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-add" onClick={() => addToList('consultasFinancieras', { institucion: '', fecha: '' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Consulta
        </button>
      </ModuleSection>

      <ModuleSection number="5" title="Observaciones del Analista" subtitle="Notas y conclusiones sobre el historial crediticio">
        <div className="field span-full">
          <label className="field-label">Observaciones</label>
          <textarea className="field-textarea" value={b.observaciones || ''} onChange={e => update('observaciones', e.target.value)} rows="4" placeholder={`Resumen del comportamiento crediticio, banderas detectadas (MOP atrasados, consultas múltiples, sobre-endeudamiento), y recomendación operativa para el dictamen.`} />
        </div>
        <div className="buro-summary">
          <span>Total créditos: <strong>{totalCreditos}</strong></span>
          <span>Saldos activos: <strong>{fmtMoney(totalSaldosActivos)}</strong></span>
          <span>Utilización: <strong>{totalLimites > 0 ? utilizacion.toFixed(1) + '%' : '—'}</strong></span>
        </div>
      </ModuleSection>
    </>
  )
}

// ============================================================
// PERSONA MORAL
// ============================================================
function BuroPM({ state, setState }) {
  const b = state.buroPM
  const bg = calcBG(state)

  const update = (key, value) => setState({ ...state, buroPM: { ...b, [key]: value } })
  const updateList = (listName, idx, key, value) => {
    const list = [...(b[listName] || [])]
    list[idx] = { ...list[idx], [key]: value }
    setState({ ...state, buroPM: { ...b, [listName]: list } })
  }
  const addToList = (listName, item) => setState({ ...state, buroPM: { ...b, [listName]: [...(b[listName] || []), item] } })
  const removeFromList = (listName, idx) => setState({ ...state, buroPM: { ...b, [listName]: (b[listName] || []).filter((_, i) => i !== idx) } })

  // Análisis cruzado: buró vs balance
  const totalPasivosBuro = (b.creditosFinancierosActivos || []).reduce((acc, c) => acc + parseNum(c.saldoActual) * 1000, 0)
  const pasivosFinancierosBalance = bg.y2.prestamosFinancierosCP + bg.y2.prestamosFinancierosLP
  const diferenciaSospechosa = pasivosFinancierosBalance - totalPasivosBuro
  const tieneAlerta = Math.abs(diferenciaSospechosa) > 500000

  const totalVencido = (b.creditosFinancierosActivos || []).reduce((acc, c) => acc + parseNum(c.saldoVencido) * 1000, 0)
  const totalOtorgado = (b.creditosFinancierosActivos || []).reduce((acc, c) => acc + parseNum(c.creditoOtorgado) * 1000, 0)
  const peorMopPM = (b.creditosFinancierosActivos || []).reduce((max, c) => Math.max(max, parseInt(c.mop) || 0), 0)
  const mopAccentPM = peorMopPM <= 1 ? 'var(--rc-success)' : peorMopPM === 2 ? 'var(--rc-amber)' : 'var(--rc-red)'
  const mopLabelPM = peorMopPM === 0 ? '—' : peorMopPM === 1 ? 'Al corriente' : peorMopPM === 2 ? 'Atraso leve' : 'Atraso grave'

  return (
    <>
      <ModuleSection number="1" title="Datos de la Empresa" subtitle="Identificación legal y fiscal">
        <div className="form-grid">
          <div className="field span-2"><label className="field-label">Razón Social</label><input className="field-input" type="text" value={b.empresa || ''} onChange={e => update('empresa', e.target.value)} /></div>
          <div className="field"><label className="field-label">RFC</label><input className="field-input" type="text" value={b.rfc || ''} onChange={e => update('rfc', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} /></div>
          <div className="field"><label className="field-label">Fecha Consulta</label><input className="field-input" type="date" value={b.fechaConsulta || ''} onChange={e => update('fechaConsulta', e.target.value)} /></div>
          <div className="field"><label className="field-label">Fecha Registro</label><input className="field-input" type="date" value={b.fechaRegistro || ''} onChange={e => update('fechaRegistro', e.target.value)} /></div>
          <div className="field"><label className="field-label">Folio</label><input className="field-input" type="text" value={b.folio || ''} onChange={e => update('folio', e.target.value)} /></div>
          <div className="field span-full"><label className="field-label">Domicilio Fiscal</label><textarea className="field-textarea" value={b.domicilioFiscal || ''} onChange={e => update('domicilioFiscal', e.target.value)} rows="2" /></div>
        </div>

        {/* KPI Row */}
        <div className="fd-w-row fd-w-row--kpi" style={{ marginTop: 20 }}>
          <KpiSimple
            label="Crédito Otorgado Total"
            value={fmtMoney(totalOtorgado)}
            sub="Suma líneas autorizadas"
            accent="var(--rc-green)"
          />
          <KpiSimple
            label="Saldo Activo en Buró"
            value={fmtMoney(totalPasivosBuro)}
            sub={`${(b.creditosFinancierosActivos || []).length} créditos vigentes`}
            accent="var(--rc-blue)"
          />
          <KpiSimple
            label="Saldo Vencido"
            value={fmtMoney(totalVencido)}
            sub={totalVencido > 0 ? 'Atraso documentado' : 'Sin atrasos'}
            accent={totalVencido > 0 ? 'var(--rc-red)' : 'var(--rc-success)'}
          />
          <KpiSimple
            label="Peor MOP Activo"
            value={mopLabelPM}
            sub={`MOP ${peorMopPM || '—'} máximo`}
            accent={mopAccentPM}
          />
        </div>
      </ModuleSection>

      <ModuleSection number="2" title="Créditos Financieros Activos" subtitle="Líneas vigentes (montos en miles de pesos)">
        <div style={{ overflowX: 'auto' }}>
          <table className="fin-table">
            <thead>
              <tr>
                <th className="label-col">Otorgante</th>
                <th>Contrato</th>
                <th>Tipo</th>
                <th className="num">Otorgado</th>
                <th className="num">Saldo</th>
                <th className="num">Vencido</th>
                <th className="col-alert">MOP</th>
                <th>Estatus</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(b.creditosFinancierosActivos || []).length === 0 ? (
                <tr><td colSpan="9" className="buro-empty">Sin créditos registrados — agrega uno abajo</td></tr>
              ) : b.creditosFinancierosActivos.map((c, idx) => (
                <tr key={idx}>
                  <td className="fd-tbl-lbl"><input type="text" className="buro-cell-input" value={c.otorgante || ''} onChange={e => updateList('creditosFinancierosActivos', idx, 'otorgante', e.target.value)} /></td>
                  <td><input type="text" className="buro-cell-input" value={c.contrato || ''} onChange={e => updateList('creditosFinancierosActivos', idx, 'contrato', e.target.value)} /></td>
                  <td><input type="text" className="buro-cell-input" value={c.tipo || ''} onChange={e => updateList('creditosFinancierosActivos', idx, 'tipo', e.target.value)} /></td>
                  <td className="num"><input type="number" className="buro-cell-input buro-cell-num" value={c.creditoOtorgado || ''} onChange={e => updateList('creditosFinancierosActivos', idx, 'creditoOtorgado', e.target.value)} /></td>
                  <td className="num"><input type="number" className="buro-cell-input buro-cell-num" value={c.saldoActual || ''} onChange={e => updateList('creditosFinancierosActivos', idx, 'saldoActual', e.target.value)} /></td>
                  <td className="num"><input type="number" className="buro-cell-input buro-cell-num" value={c.saldoVencido || ''} onChange={e => updateList('creditosFinancierosActivos', idx, 'saldoVencido', e.target.value)} /></td>
                  <td className="cell-alert">
                    <div className="buro-mop-wrap">
                      {mopChip(c.mop)}
                      <input type="text" className="buro-mop-input" maxLength={2} value={c.mop || ''} onChange={e => updateList('creditosFinancierosActivos', idx, 'mop', e.target.value)} />
                    </div>
                  </td>
                  <td><input type="text" className="buro-cell-input" value={c.estatus || ''} onChange={e => updateList('creditosFinancierosActivos', idx, 'estatus', e.target.value)} /></td>
                  <td><button className="btn-remove" onClick={() => removeFromList('creditosFinancierosActivos', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-add" onClick={() => addToList('creditosFinancierosActivos', { otorgante: '', contrato: '', tipo: '', creditoOtorgado: '', saldoActual: '', saldoVencido: '0', mop: '1', estatus: '' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Crédito
        </button>
      </ModuleSection>

      <ModuleSection number="3" title="Calificación de Cartera" subtitle="Calificaciones otorgadas por institución financiera">
        <table className="fin-table">
          <thead>
            <tr>
              <th className="label-col">Institución</th>
              <th>Calificación</th>
              <th>Periodo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(b.calificacionCartera || []).length === 0 ? (
              <tr><td colSpan="4" className="buro-empty">Sin calificaciones registradas</td></tr>
            ) : b.calificacionCartera.map((c, idx) => (
              <tr key={idx}>
                <td className="fd-tbl-lbl"><input type="text" className="buro-cell-input" value={c.institucion || ''} onChange={e => updateList('calificacionCartera', idx, 'institucion', e.target.value)} /></td>
                <td><input type="text" className="buro-cell-input" value={c.calificacion || ''} onChange={e => updateList('calificacionCartera', idx, 'calificacion', e.target.value)} /></td>
                <td><input type="text" className="buro-cell-input" value={c.periodo || ''} onChange={e => updateList('calificacionCartera', idx, 'periodo', e.target.value)} /></td>
                <td><button className="btn-remove" onClick={() => removeFromList('calificacionCartera', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-add" onClick={() => addToList('calificacionCartera', { institucion: '', calificacion: '', periodo: '' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Calificación
        </button>
      </ModuleSection>

      <ModuleSection number="4" title="Análisis Cruzado" subtitle="Detección de pasivos no reportados (Balance vs Buró)">
        <div className="fd-w-row fd-w-row--3up">
          <KpiSimple
            label="Pasivos en Balance"
            value={fmtMoney(pasivosFinancierosBalance)}
            sub="Préstamos financieros reportados"
            accent="var(--rc-blue)"
          />
          <KpiSimple
            label="Pasivos en Buró"
            value={fmtMoney(totalPasivosBuro)}
            sub="Suma créditos activos"
            accent="var(--rc-green)"
          />
          <KpiSimple
            label="Diferencia"
            value={fmtMoney(diferenciaSospechosa)}
            sub={tieneAlerta ? 'Discrepancia material' : 'Dentro de tolerancia'}
            accent={tieneAlerta ? 'var(--rc-red)' : 'var(--rc-success)'}
          />
        </div>
        {tieneAlerta && (
          <Alert level="warn" title="Pasivos potencialmente no reportados">
            La diferencia entre lo reportado en balance ({fmtMoney(pasivosFinancierosBalance)}) y lo registrado en buró ({fmtMoney(totalPasivosBuro)}) supera $500K. Solicitar aclaración al cliente: pueden existir pasivos fuera de balance o discrepancias en la captura del buró.
          </Alert>
        )}
      </ModuleSection>

      <ModuleSection number="5" title="Observaciones del Analista" subtitle="Conclusiones del análisis crediticio empresarial">
        <div className="field span-full">
          <label className="field-label">Observaciones</label>
          <textarea className="field-textarea" value={b.observaciones || ''} onChange={e => update('observaciones', e.target.value)} rows="4" placeholder="Resumen del comportamiento crediticio empresarial, calidad de cartera ante el sistema, análisis cruzado con balance, y recomendación operativa para el dictamen." />
        </div>
      </ModuleSection>
    </>
  )
}
