// ============================================================
// MÓDULO 4: BURÓ PERSONA FÍSICA
// ============================================================

import { Icon, ModuleSection, Alert, CompletionBar } from '../shared/Common'
import { fmtMoney, parseNum, buroPFCompletionPct } from '../../engines/financialEngine'

export default function BuroPFModule({ state, setState }) {
  const b = state.buroPF

  const update = (key, value) => {
    setState({ ...state, buroPF: { ...b, [key]: value } })
  }

  const updateList = (listName, idx, key, value) => {
    const list = [...(b[listName] || [])]
    list[idx] = { ...list[idx], [key]: value }
    setState({ ...state, buroPF: { ...b, [listName]: list } })
  }

  const addToList = (listName, item) => {
    setState({ ...state, buroPF: { ...b, [listName]: [...(b[listName]||[]), item] } })
  }

  const removeFromList = (listName, idx) => {
    setState({ ...state, buroPF: { ...b, [listName]: (b[listName]||[]).filter((_,i) => i !== idx) } })
  }

  const mopBadge = (mop) => {
    const num = parseInt(mop) || 0
    if (num === 0) return <span className="mop-badge mop-new">{mop || '—'}</span>
    if (num === 1) return <span className="mop-badge mop-ok">{mop}</span>
    if (num === 2) return <span className="mop-badge mop-late">{mop}</span>
    return <span className="mop-badge mop-bad">{mop}</span>
  }

  const renderTable = (listName, title, isActive=true) => {
    const list = b[listName] || []
    const isClosed = listName.includes('Cerrados')
    return (
      <div style={{ marginBottom: '24px' }}>
        <h4 className="razones-group">{title}</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Otorgante</th>
                <th>Cuenta</th>
                <th>Tipo</th>
                <th className="num">{isActive ? 'Saldo' : 'Máximo'}</th>
                {isActive && <th className="num">Límite</th>}
                <th>MOP</th>
                <th>{isClosed ? 'Cierre' : 'Apertura'}</th>
                <th>Estatus</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--rc-text-light)', padding: '24px' }}>Sin registros</td></tr>
              ) : list.map((c, idx) => (
                <tr key={idx}>
                  <td><input type="text" value={c.otorgante||''} onChange={e => updateList(listName, idx, 'otorgante', e.target.value)} /></td>
                  <td><input type="text" value={c.cuenta||''} onChange={e => updateList(listName, idx, 'cuenta', e.target.value)} /></td>
                  <td><input type="text" value={c.tipo||''} onChange={e => updateList(listName, idx, 'tipo', e.target.value)} /></td>
                  <td><input type="number" className="num" value={isActive ? (c.saldo||'') : (c.maxCredito||'')} onChange={e => updateList(listName, idx, isActive ? 'saldo' : 'maxCredito', e.target.value)} /></td>
                  {isActive && <td><input type="number" className="num" value={c.limite||''} onChange={e => updateList(listName, idx, 'limite', e.target.value)} /></td>}
                  <td>{mopBadge(c.mop)}<input type="text" style={{ width: '40px', marginLeft: '4px' }} value={c.mop||''} onChange={e => updateList(listName, idx, 'mop', e.target.value)} /></td>
                  <td><input type="text" value={isClosed ? (c.cierre||'') : (c.apertura||'')} onChange={e => updateList(listName, idx, isClosed ? 'cierre' : 'apertura', e.target.value)} /></td>
                  <td><input type="text" value={c.estatus||''} onChange={e => updateList(listName, idx, 'estatus', e.target.value)} /></td>
                  <td><button className="btn-remove" onClick={() => removeFromList(listName, idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-add" onClick={() => addToList(listName, { otorgante:'', cuenta:'', tipo:'', saldo:'', limite:'', maxCredito:'', mop:'1', apertura:'', cierre:'', estatus:'' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar
        </button>
      </div>
    )
  }

  const totalSaldosActivos = (b.creditosBancariosActivos||[]).reduce((acc,c) => acc + parseNum(c.saldo), 0) +
                              (b.creditosNoBancariosActivos||[]).reduce((acc,c) => acc + parseNum(c.saldo), 0)
  const numConsultas = parseNum(b.consultasUltimos3Meses)

  return (
    <>
      <ModuleSection number="1" title="Datos del Titular" subtitle="Información de identificación">
        <div className="form-grid">
          <div className="field span-2"><label className="field-label">Nombre Completo</label><input className="field-input" type="text" value={b.nombre||''} onChange={e => update('nombre', e.target.value)} /></div>
          <div className="field"><label className="field-label">RFC</label><input className="field-input" type="text" value={b.rfc||''} onChange={e => update('rfc', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} /></div>
          <div className="field"><label className="field-label">Fecha de Consulta</label><input className="field-input" type="date" value={b.fechaConsulta||''} onChange={e => update('fechaConsulta', e.target.value)} /></div>
          <div className="field"><label className="field-label">Fecha de Nacimiento</label><input className="field-input" type="date" value={b.fechaNacimiento||''} onChange={e => update('fechaNacimiento', e.target.value)} /></div>
          <div className="field"><label className="field-label">Folio</label><input className="field-input" type="text" value={b.folio||''} onChange={e => update('folio', e.target.value)} /></div>
          <div className="field"><label className="field-label">Consultas Últimos 3 Meses</label><input className="field-input num" type="number" value={b.consultasUltimos3Meses||''} onChange={e => update('consultasUltimos3Meses', e.target.value)} /></div>
        </div>
      </ModuleSection>

      <ModuleSection number="2" title="Créditos Bancarios" subtitle="Tarjetas, hipotecas, automotrices">
        {renderTable('creditosBancariosActivos', 'A) Activos', true)}
        {renderTable('creditosBancariosCerrados', 'B) Cerrados', false)}
      </ModuleSection>

      <ModuleSection number="3" title="Créditos No Bancarios" subtitle="Tiendas, financieras, otros">
        {renderTable('creditosNoBancariosActivos', 'A) Activos', true)}
        {renderTable('creditosNoBancariosCerrados', 'B) Cerrados', false)}
      </ModuleSection>

      <ModuleSection number="4" title="Consultas Recientes" subtitle="Instituciones que han consultado el buró">
        {numConsultas >= 3 && (
          <Alert level="warn" title="Bureau-shopping detectado">
            {numConsultas} consultas en los últimos 3 meses. Indica búsqueda activa de crédito.
          </Alert>
        )}
        <table className="data-table">
          <thead><tr><th>Institución</th><th>Fecha</th><th></th></tr></thead>
          <tbody>
            {(b.consultasFinancieras||[]).length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--rc-text-light)', padding: '24px' }}>Sin consultas registradas</td></tr>
            ) : b.consultasFinancieras.map((c, idx) => (
              <tr key={idx}>
                <td><input type="text" value={c.institucion||''} onChange={e => updateList('consultasFinancieras', idx, 'institucion', e.target.value)} /></td>
                <td><input type="date" value={c.fecha||''} onChange={e => updateList('consultasFinancieras', idx, 'fecha', e.target.value)} /></td>
                <td><button className="btn-remove" onClick={() => removeFromList('consultasFinancieras', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-add" onClick={() => addToList('consultasFinancieras', { institucion:'', fecha:'' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Consulta
        </button>
      </ModuleSection>

      <ModuleSection number="5" title="Observaciones del Analista" subtitle="Notas y conclusiones">
        <div className="summary-grid">
          <div><div className="summary-item-label">Saldos Activos Totales</div><div className="summary-item-value">{fmtMoney(totalSaldosActivos)}</div></div>
          <div><div className="summary-item-label">Consultas Recientes</div><div className="summary-item-value">{numConsultas}</div></div>
          <div><div className="summary-item-label">Total Créditos</div><div className="summary-item-value">{(b.creditosBancariosActivos||[]).length + (b.creditosBancariosCerrados||[]).length + (b.creditosNoBancariosActivos||[]).length + (b.creditosNoBancariosCerrados||[]).length}</div></div>
        </div>
        <div className="field span-full" style={{ marginTop: '16px' }}>
          <label className="field-label">Observaciones</label>
          <textarea className="field-textarea" value={b.observaciones||''} onChange={e => update('observaciones', e.target.value)} rows="4" />
        </div>
      </ModuleSection>

      <CompletionBar title="Completitud del Módulo" pct={buroPFCompletionPct(state)} />
    </>
  )
}
