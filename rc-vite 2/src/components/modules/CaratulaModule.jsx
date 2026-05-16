// ============================================================
// MÓDULO 1: CARÁTULA DEL CLIENTE
// ============================================================

import { Icon, Alert, ModuleSection, CompletionBar } from '../shared/Common'
import { fmtMoney, parseNum, caratulaCompletionPct } from '../../engines/financialEngine'

export default function CaratulaModule({ state, setState }) {
  const c = state.caratula

  const update = (key, value) => {
    setState({ ...state, caratula: { ...c, [key]: value } })
  }

  const updateList = (listName, idx, key, value) => {
    const list = [...(c[listName] || [])]
    list[idx] = { ...list[idx], [key]: value }
    setState({ ...state, caratula: { ...c, [listName]: list } })
  }

  const addToList = (listName, item) => {
    const list = [...(c[listName] || []), item]
    setState({ ...state, caratula: { ...c, [listName]: list } })
  }

  const removeFromList = (listName, idx) => {
    const list = (c[listName] || []).filter((_, i) => i !== idx)
    setState({ ...state, caratula: { ...c, [listName]: list } })
  }

  const cuentas = c.cuentasBancarias || []
  const totalsSM = [0,0,0,0,0,0], totalsDM = [0,0,0,0,0,0]
  cuentas.forEach(cb => {
    for (let i = 1; i <= 6; i++) {
      totalsSM[i-1] += parseNum(cb['sm'+i])
      totalsDM[i-1] += parseNum(cb['dm'+i])
    }
  })
  const sumDM = totalsDM.reduce((a,b) => a+b, 0)
  const sumSM = totalsSM.reduce((a,b) => a+b, 0)
  const promSM = sumSM/6, promDM = sumDM/6
  const monto = parseNum(c.montoSolicitado)
  const cobertura = monto > 0 ? (promDM / monto).toFixed(2) : '0.00'
  const totalAvales = (c.avales||[]).reduce((acc,a) => acc + parseNum(a.valor), 0)
  const sumaPart = (c.socios||[]).reduce((acc,s) => acc + parseNum(s.participacion), 0)

  return (
    <>
      <ModuleSection number="1" title="Datos Generales de la Empresa" subtitle="Identificación legal y de contacto">
        <div className="form-grid">
          <div className="field span-2">
            <label className="field-label">Razón Social <span className="required">*</span></label>
            <input className="field-input" type="text" value={c.empresa||''} onChange={e => update('empresa', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">RFC <span className="required">*</span></label>
            <input className="field-input" type="text" value={c.rfc||''} onChange={e => update('rfc', e.target.value.toUpperCase())} maxLength="13" style={{ textTransform: 'uppercase' }} />
          </div>
          <div className="field">
            <label className="field-label">Teléfonos <span className="required">*</span></label>
            <input className="field-input" type="text" value={c.telefonos||''} onChange={e => update('telefonos', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Representante Legal <span className="required">*</span></label>
            <input className="field-input" type="text" value={c.representanteLegal||''} onChange={e => update('representanteLegal', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="field-input" type="email" value={c.email||''} onChange={e => update('email', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Fecha de Entrada</label>
            <input className="field-input" type="date" value={c.fechaEntrada||''} onChange={e => update('fechaEntrada', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Fecha de Análisis</label>
            <input className="field-input" type="date" value={c.fechaAnalisis||''} onChange={e => update('fechaAnalisis', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Empresa Familiar</label>
            <select className="field-select" value={c.empresaFamiliar} onChange={e => update('empresaFamiliar', e.target.value)}>
              <option value="NO">NO</option>
              <option value="SI">SI</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Sitio Web</label>
            <input className="field-input" type="url" value={c.web||''} onChange={e => update('web', e.target.value)} />
          </div>
        </div>
      </ModuleSection>

      <ModuleSection number="2" title="Domicilios" subtitle="Fiscal y particular del representante">
        <h4 style={{ fontSize: '12px', color: 'var(--rc-green)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Domicilio Fiscal</h4>
        <div className="form-grid">
          <div className="field span-full">
            <label className="field-label">Dirección Fiscal <span className="required">*</span></label>
            <textarea className="field-textarea" value={c.domicilioFiscal||''} onChange={e => update('domicilioFiscal', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Tipo</label>
            <select className="field-select" value={c.tipoFiscal} onChange={e => update('tipoFiscal', e.target.value)}>
              <option value="Propio">Propio</option>
              <option value="Rentado">Rentado</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Superficie (m²)</label>
            <input className="field-input num" type="number" value={c.supFiscal||''} onChange={e => update('supFiscal', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{c.tipoFiscal === 'Rentado' ? 'Renta Mensual' : 'Valor Declarado'}</label>
            <input className="field-input num" type="number"
              value={c.tipoFiscal === 'Rentado' ? (c.rentaFiscal||'') : (c.valorFiscal||'')}
              onChange={e => update(c.tipoFiscal === 'Rentado' ? 'rentaFiscal' : 'valorFiscal', e.target.value)} />
          </div>
        </div>
      </ModuleSection>

      <ModuleSection number="3" title="Accionistas / Socios" subtitle="Estructura societaria con participación">
        {sumaPart > 0 && Math.abs(sumaPart - 100) > 0.5 && (
          <Alert level="warn" title="Validación">
            Suma actual: {sumaPart.toFixed(1)}%. Debe sumar 100%.
          </Alert>
        )}
        <table className="data-table">
          <thead>
            <tr><th style={{ width: '140px' }}>RFC</th><th>Nombre</th><th style={{ width: '120px' }} className="num">Participación %</th><th style={{ width: '50px' }}></th></tr>
          </thead>
          <tbody>
            {(c.socios||[]).length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--rc-text-light)', padding: '24px' }}>Sin accionistas</td></tr>
            ) : c.socios.map((s, idx) => (
              <tr key={idx}>
                <td><input type="text" value={s.rfc||''} onChange={e => updateList('socios', idx, 'rfc', e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} /></td>
                <td><input type="text" value={s.nombre||''} onChange={e => updateList('socios', idx, 'nombre', e.target.value)} /></td>
                <td><input type="number" className="num" value={s.participacion||''} onChange={e => updateList('socios', idx, 'participacion', e.target.value)} step="0.01" /></td>
                <td><button className="btn-remove" onClick={() => removeFromList('socios', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
              </tr>
            ))}
          </tbody>
          {(c.socios||[]).length > 0 && (
            <tfoot>
              <tr><td colSpan="2" style={{ textAlign: 'right' }}>SUMA:</td><td className="num">{sumaPart.toFixed(2)}%</td><td></td></tr>
            </tfoot>
          )}
        </table>
        <button className="btn-add" onClick={() => addToList('socios', { rfc:'', nombre:'', participacion:'' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Accionista
        </button>
      </ModuleSection>

      <ModuleSection number="4" title="Actividad y Operación" subtitle="Giro, clientes y proveedores">
        <div className="form-grid">
          <div className="field span-full"><label className="field-label">Actividad Principal <span className="required">*</span></label><textarea className="field-textarea" value={c.actividad||''} onChange={e => update('actividad', e.target.value)} /></div>
          <div className="field span-full"><label className="field-label">Principales Clientes</label><textarea className="field-textarea" value={c.clientes||''} onChange={e => update('clientes', e.target.value)} /></div>
          <div className="field span-full"><label className="field-label">Principales Proveedores</label><textarea className="field-textarea" value={c.proveedores||''} onChange={e => update('proveedores', e.target.value)} /></div>
          <div className="field"><label className="field-label">Empleados <span className="required">*</span></label><input className="field-input num" type="number" value={c.empleados||''} onChange={e => update('empleados', e.target.value)} /></div>
          <div className="field"><label className="field-label">Nómina Mensual</label><input className="field-input num" type="number" value={c.nomina||''} onChange={e => update('nomina', e.target.value)} /></div>
        </div>
      </ModuleSection>

      <ModuleSection number="5" title="Solicitud de Crédito" subtitle="Monto, destino y plazo">
        <div className="form-grid">
          <div className="field">
            <label className="field-label">Monto Solicitado <span className="required">*</span></label>
            <input className="field-input num" type="number" value={c.montoSolicitado||''} onChange={e => update('montoSolicitado', e.target.value)} />
            <div className="field-help">{c.montoSolicitado ? fmtMoney(c.montoSolicitado)+' MXN' : ''}</div>
          </div>
          <div className="field">
            <label className="field-label">Plazo (meses)</label>
            <input className="field-input num" type="number" value={c.plazoSolicitado||''} onChange={e => update('plazoSolicitado', e.target.value)} />
          </div>
          <div className="field span-full">
            <label className="field-label">Destino del Crédito <span className="required">*</span></label>
            <textarea className="field-textarea" value={c.destinoCredito||''} onChange={e => update('destinoCredito', e.target.value)} />
          </div>
        </div>
      </ModuleSection>

      <ModuleSection number="6" title="Cuentas Bancarias" subtitle="Saldos y depósitos últimos 6 meses">
        <h4 style={{ fontSize: '11px', color: 'var(--rc-text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>A) Saldos Mensuales</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Cuenta</th>
                <th style={{ width: '100px' }}>Banco</th>
                <th>Titular</th>
                {['Oct-25','Nov-25','Dic-25','Ene-26','Feb-26','Mar-26'].map(m => <th key={m} className="num" style={{ width: '90px' }}>{m}</th>)}
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {cuentas.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', color: 'var(--rc-text-light)', padding: '24px' }}>Sin cuentas</td></tr>
              ) : cuentas.map((cb, idx) => (
                <tr key={idx}>
                  <td><input type="text" value={cb.numero||''} onChange={e => updateList('cuentasBancarias', idx, 'numero', e.target.value)} /></td>
                  <td><input type="text" value={cb.banco||''} onChange={e => updateList('cuentasBancarias', idx, 'banco', e.target.value)} /></td>
                  <td><input type="text" value={cb.titular||''} onChange={e => updateList('cuentasBancarias', idx, 'titular', e.target.value)} /></td>
                  {[1,2,3,4,5,6].map(i => (
                    <td key={i}><input type="number" className="num" value={cb['sm'+i]||''} onChange={e => updateList('cuentasBancarias', idx, 'sm'+i, e.target.value)} step="0.01" /></td>
                  ))}
                  <td><button className="btn-remove" onClick={() => removeFromList('cuentasBancarias', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
                </tr>
              ))}
            </tbody>
            {cuentas.length > 0 && (
              <tfoot>
                <tr><td colSpan="3" style={{ textAlign: 'right' }}>TOTAL:</td>{totalsSM.map((t,i) => <td key={i} className="num">{fmtMoney(t)}</td>)}<td></td></tr>
              </tfoot>
            )}
          </table>
        </div>

        <h4 style={{ fontSize: '11px', color: 'var(--rc-text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '24px 0 10px 0' }}>B) Depósitos Mensuales</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Cuenta</th>
                <th style={{ width: '100px' }}>Banco</th>
                <th>Titular</th>
                {['Oct-25','Nov-25','Dic-25','Ene-26','Feb-26','Mar-26'].map(m => <th key={m} className="num" style={{ width: '90px' }}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {cuentas.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--rc-text-light)', padding: '24px' }}>Agrega cuentas primero</td></tr>
              ) : cuentas.map((cb, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--rc-text-muted)' }}>{cb.numero || '—'}</td>
                  <td style={{ color: 'var(--rc-text-muted)' }}>{cb.banco || '—'}</td>
                  <td style={{ color: 'var(--rc-text-muted)' }}>{cb.titular || '—'}</td>
                  {[1,2,3,4,5,6].map(i => (
                    <td key={i}><input type="number" className="num" value={cb['dm'+i]||''} onChange={e => updateList('cuentasBancarias', idx, 'dm'+i, e.target.value)} step="0.01" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
            {cuentas.length > 0 && (
              <tfoot>
                <tr><td colSpan="3" style={{ textAlign: 'right' }}>TOTAL:</td>{totalsDM.map((t,i) => <td key={i} className="num">{fmtMoney(t)}</td>)}</tr>
              </tfoot>
            )}
          </table>
        </div>

        <button className="btn-add" onClick={() => addToList('cuentasBancarias', { numero:'', banco:'', titular: c.empresa||'', sm1:'', sm2:'', sm3:'', sm4:'', sm5:'', sm6:'', dm1:'', dm2:'', dm3:'', dm4:'', dm5:'', dm6:'' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Cuenta
        </button>

        {cuentas.length > 0 && (
          <div className="summary-box">
            <div className="summary-grid">
              <div><div className="summary-item-label">Saldo Promedio</div><div className="summary-item-value">{fmtMoney(promSM)}</div><div className="summary-item-sub">Mensual semestral</div></div>
              <div><div className="summary-item-label">Depósitos Promedio</div><div className="summary-item-value">{fmtMoney(promDM)}</div><div className="summary-item-sub">Mensual semestral</div></div>
              <div><div className="summary-item-label">Cobertura del Monto</div><div className="summary-item-value">{cobertura}<span style={{ fontSize: '14px', color: 'var(--rc-text-muted)', marginLeft: '4px' }}>veces</span></div><div className="summary-item-sub">Depósitos / Solicitado</div></div>
            </div>
          </div>
        )}
      </ModuleSection>

      <ModuleSection number="7" title="Avales y Garantías" subtitle="Personas físicas que respaldan la operación">
        <table className="data-table">
          <thead>
            <tr><th>Nombre</th><th style={{ width: '130px' }}>Relación</th><th style={{ width: '130px' }}>Patrimonio</th><th className="num" style={{ width: '130px' }}>Valor</th><th style={{ width: '90px' }}>Hipotecable</th><th style={{ width: '40px' }}></th></tr>
          </thead>
          <tbody>
            {(c.avales||[]).length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--rc-text-light)', padding: '24px' }}>Sin avales</td></tr>
            ) : c.avales.map((a, idx) => (
              <tr key={idx}>
                <td><input type="text" value={a.nombre||''} onChange={e => updateList('avales', idx, 'nombre', e.target.value)} /></td>
                <td><input type="text" value={a.relacion||''} onChange={e => updateList('avales', idx, 'relacion', e.target.value)} /></td>
                <td><input type="text" value={a.patrimonio||''} onChange={e => updateList('avales', idx, 'patrimonio', e.target.value)} /></td>
                <td><input type="number" className="num" value={a.valor||''} onChange={e => updateList('avales', idx, 'valor', e.target.value)} /></td>
                <td>
                  <select value={a.hipoteca} onChange={e => updateList('avales', idx, 'hipoteca', e.target.value)}>
                    <option value="NO">NO</option>
                    <option value="SI">SI</option>
                  </select>
                </td>
                <td><button className="btn-remove" onClick={() => removeFromList('avales', idx)}><Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} /></button></td>
              </tr>
            ))}
          </tbody>
          {(c.avales||[]).length > 0 && (
            <tfoot>
              <tr><td colSpan="3" style={{ textAlign: 'right' }}>TOTAL:</td><td className="num">{fmtMoney(totalAvales)}</td><td colSpan="2"></td></tr>
            </tfoot>
          )}
        </table>
        <button className="btn-add" onClick={() => addToList('avales', { nombre:'', relacion:'', patrimonio:'', valor:'', hipoteca:'NO' })}>
          <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar Aval
        </button>
      </ModuleSection>

      <CompletionBar title="% de Completado del Módulo" pct={caratulaCompletionPct(state)} />
    </>
  )
}
