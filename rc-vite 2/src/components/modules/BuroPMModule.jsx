// ============================================================
// MÓDULO 5: BURÓ EMPRESA (PERSONA MORAL)
// ============================================================

import { Icon, ModuleSection, Alert, CompletionBar } from '../shared/Common'
import { fmtMoney, parseNum, buroPMCompletionPct, calcBG } from '../../engines/financialEngine'

export default function BuroPMModule({ state, setState }) {
  const b = state.buroPM
  const bg = calcBG(state)

  const update = (key, value) => setState({ ...state, buroPM: { ...b, [key]: value } })
  const updateList = (listName, idx, key, value) => {
    const list = [...(b[listName] || [])]
    list[idx] = { ...list[idx], [key]: value }
    setState({ ...state, buroPM: { ...b, [listName]: list } })
  }
  const addToList = (listName, item) => setState({ ...state, buroPM: { ...b, [listName]: [...(b[listName]||[]), item] } })
  const removeFromList = (listName, idx) => setState({ ...state, buroPM: { ...b, [listName]: (b[listName]||[]).filter((_,i) => i !== idx) } })

  // Análisis cruzado: detectar pasivos no reportados
  const totalPasivosBuro = (b.creditosFinancierosActivos || []).reduce((acc, c) => acc + parseNum(c.saldoActual) * 1000, 0) // en miles
  const pasivosFinancierosBalance = bg.y2.prestamosFinancierosCP + bg.y2.prestamosFinancierosLP
  const diferenciaSospechosa = pasivosFinancierosBalance - totalPasivosBuro

  return (
    <>
      <ModuleSection number="1" title="Datos de la Empresa" subtitle="Identificación legal">
        <div className="form-grid">
          <div className="field span-2"><label className="field-label">Razón Social</label><input className="field-input" type="text" value={b.empresa||''} onChange={e => update('empresa', e.target.value)} /></div>
          <div className="field"><label className="field-label">RFC</label><input className="field-input" type="text" value={b.rfc||''} onChange={e => update('rfc', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} /></div>
          <div className="field"><label className="field-label">Fecha Consulta</label><input className="field-input" type="date" value={b.fechaConsulta||''} onChange={e => update('fechaConsulta', e.target.value)} /></div>
          <div className="field"><label className="field-label">Fecha Registro</label><input className="field-input" type="date" value={b.fechaRegistro||''} onChange={e => update('fechaRegistro', e.target.value)} /></div>
          <div className="field"><label className="field-label">Folio</label><input className="field-input" type="text" value={b.folio||''} onChange={e => update('folio', e.target.value)} /></div>
          <div className="field span-full"><label className="field-label">Domicilio Fiscal</label><textarea className="field-textarea" value={b.domicilioFiscal||''} onChange={e => update('domicilioFiscal', e.target.value)} /></div>
        </div>
      </ModuleSection>

      <ModuleSection number="2" title="Créditos Financieros" subtitle="Activos (en miles de pesos)">
        <table className="data-table">
          <thead><tr><th>Otorgante</th><th>Contrato</th><th>Tipo</th><th className="num">Otorgado</th><th className="num">Saldo</th><th className="num">Vencido</th><th>MOP</th><th>Estatus</th><th></th></tr></thead>
          <tbody>
            {(b.creditosFinancierosActivos||[]).length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--rc-text-light)', padding: '24px' }}>Sin registros</td></tr>
            ) : b.creditosFinancierosActivos.map((c, idx) => (
              <tr key={idx}>
                <td><input type="text" value={c.otorgante||''} onChange={e => updateList('creditosFinancierosActivos', idx, 'otorgante', e.target.value)} /></td>
                <td><input type="text" value={c.contrato||''} onChange={e => updateList('creditosFinancierosActivos', idx, 'contrato', e.target.value)} /></td>
                <td><input type="text" value={c.tipo||''} onChange={e => updateList('creditosFinancierosActivos', idx, 'tipo', e.target.value)} /></td>
                <td><input type="number" className="num" value={c.creditoOtorgado||''} onChange={e => updateList('creditosFinancierosActivos', idx, 'creditoOtorgado', e.target.value)} /></td>
                <td><input type="number" className="num" value={c.saldoActual||''} onChange={e => updateList('creditosFinancierosActivos', idx, 'saldoActual', e.target.value)} /></td>
                <td><input type="number" className="num" value={c.saldoVencido||''} onChange={e => updateList('creditosFinancierosActivos', idx, 'saldoVencido', e.target.value)} /></td>
                <td><input type="text" style={{ width: '40px' }} value={c.mop||''} onChange={e => updateList('creditosFinancierosActivos', idx, 'mop', e.target.value)} /></td>
                <td><input type="text" value={c.estatus||''} onChange={e => updateList('creditosFinancierosActivos', idx, 'estatus', e.target.value)} /></td>
                <td><button className="btn-remove" onClick={() => removeFromList('creditosFinancierosActivos', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-add" onClick={() => addToList('creditosFinancierosActivos', { otorgante:'', contrato:'', tipo:'', creditoOtorgado:'', saldoActual:'', saldoVencido:'0', mop:'1', estatus:'' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Crédito
        </button>
      </ModuleSection>

      <ModuleSection number="3" title="Calificación de Cartera" subtitle="Por institución financiera">
        <table className="data-table">
          <thead><tr><th>Institución</th><th>Calificación</th><th>Periodo</th><th></th></tr></thead>
          <tbody>
            {(b.calificacionCartera||[]).length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--rc-text-light)', padding: '24px' }}>Sin calificaciones</td></tr>
            ) : b.calificacionCartera.map((c, idx) => (
              <tr key={idx}>
                <td><input type="text" value={c.institucion||''} onChange={e => updateList('calificacionCartera', idx, 'institucion', e.target.value)} /></td>
                <td><input type="text" value={c.calificacion||''} onChange={e => updateList('calificacionCartera', idx, 'calificacion', e.target.value)} /></td>
                <td><input type="text" value={c.periodo||''} onChange={e => updateList('calificacionCartera', idx, 'periodo', e.target.value)} /></td>
                <td><button className="btn-remove" onClick={() => removeFromList('calificacionCartera', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-add" onClick={() => addToList('calificacionCartera', { institucion:'', calificacion:'', periodo:'' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Calificación
        </button>
      </ModuleSection>

      <ModuleSection number="4" title="Análisis Cruzado" subtitle="Detección de pasivos no reportados">
        <div className="summary-grid">
          <div><div className="summary-item-label">Pasivos en Buró</div><div className="summary-item-value">{fmtMoney(totalPasivosBuro)}</div><div className="summary-item-sub">Activos reportados</div></div>
          <div><div className="summary-item-label">Pasivos en Balance</div><div className="summary-item-value">{fmtMoney(pasivosFinancierosBalance)}</div><div className="summary-item-sub">Préstamos financieros</div></div>
          <div><div className="summary-item-label">Diferencia</div><div className="summary-item-value" style={{ color: Math.abs(diferenciaSospechosa) > 500000 ? 'var(--rc-red)' : 'var(--rc-success)' }}>{fmtMoney(diferenciaSospechosa)}</div></div>
        </div>
        {Math.abs(diferenciaSospechosa) > 500000 && (
          <Alert level="warn" title="Pasivos potenciales no reportados">
            La diferencia entre lo reportado en balance ({fmtMoney(pasivosFinancierosBalance)}) y lo registrado en buró ({fmtMoney(totalPasivosBuro)}) supera $500K. Solicitar aclaración.
          </Alert>
        )}
      </ModuleSection>

      <ModuleSection number="5" title="Observaciones del Analista" subtitle="Conclusiones del análisis">
        <div className="field span-full">
          <label className="field-label">Observaciones</label>
          <textarea className="field-textarea" value={b.observaciones||''} onChange={e => update('observaciones', e.target.value)} rows="4" />
        </div>
      </ModuleSection>

      <CompletionBar title="Completitud del Módulo" pct={buroPMCompletionPct(state)} />
    </>
  )
}
