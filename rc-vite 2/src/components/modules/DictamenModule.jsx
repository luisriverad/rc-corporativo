// ============================================================
// MÓDULO 9: DICTAMEN FINAL
// ============================================================

import { Icon, ModuleSection, CompletionBar } from '../shared/Common'
import { fmtMoney, calcScore, dictamenCompletionPct } from '../../engines/financialEngine'

export default function DictamenModule({ state, setState }) {
  const d = state.dictamen
  const score = calcScore(state)

  const update = (key, value) => setState({ ...state, dictamen: { ...d, [key]: value } })

  const addListItem = (listName) => {
    setState({ ...state, dictamen: { ...d, [listName]: [...(d[listName]||[]), ''] } })
  }
  const updateListItem = (listName, idx, value) => {
    const list = [...(d[listName] || [])]
    list[idx] = value
    setState({ ...state, dictamen: { ...d, [listName]: list } })
  }
  const removeListItem = (listName, idx) => {
    setState({ ...state, dictamen: { ...d, [listName]: (d[listName]||[]).filter((_,i) => i !== idx) } })
  }

  const renderList = (listName, title, color, iconPath) => (
    <ModuleSection number="" title={title} subtitle={`${(d[listName]||[]).length} elementos`}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(d[listName]||[]).map((item, idx) => (
          <li key={idx} className={`dict-item dict-${color}`}>
            <Icon path={iconPath} size={16} />
            <textarea value={item} onChange={e => updateListItem(listName, idx, e.target.value)} rows="2" />
            <button className="btn-remove" onClick={() => removeListItem(listName, idx)}>
              <Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} />
            </button>
          </li>
        ))}
      </ul>
      <button className="btn-add" onClick={() => addListItem(listName)}>
        <Icon path='<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' size={12} /> Agregar
      </button>
    </ModuleSection>
  )

  const decisionConfig = {
    aprobado: { label: 'Aprobado', color: 'var(--rc-success)', bg: '#E8EFE2' },
    condicionado: { label: 'Aprobado Condicionado', color: 'var(--rc-amber)', bg: '#FEF7E6' },
    info: { label: 'Información Adicional Requerida', color: 'var(--rc-blue)', bg: '#EBF5FA' },
    rechazado: { label: 'No Recomendable', color: 'var(--rc-red)', bg: '#FEEBEB' }
  }
  const cfg = decisionConfig[d.decision]

  return (
    <>
      <ModuleSection number="1" title="Veredicto Ejecutivo" subtitle="Recomendación basada en el análisis integral">
        {cfg && (
          <div style={{ padding: '20px 24px', background: cfg.bg, border: `2px solid ${cfg.color}`, borderRadius: '6px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: cfg.color, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Recomendación Ejecutiva</div>
            <div style={{ fontFamily: "'Source Serif Pro', serif", fontSize: '28px', fontWeight: 700, color: cfg.color, lineHeight: 1.1, marginBottom: '12px' }}>{cfg.label}</div>
            <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Score Interno: <b>{score.scoreFinal.toFixed(0)}/100</b> · {score.nivel}
            </div>
          </div>
        )}
        <div className="form-grid">
          <div className="field span-full">
            <label className="field-label">Decisión</label>
            <select className="field-select" value={d.decision||''} onChange={e => update('decision', e.target.value)}>
              <option value="">— Selecciona —</option>
              <option value="aprobado">Aprobado</option>
              <option value="condicionado">Aprobado Condicionado</option>
              <option value="info">Información Adicional Requerida</option>
              <option value="rechazado">No Recomendable</option>
            </select>
          </div>
          <div className="field"><label className="field-label">Monto Aprobado</label><input className="field-input num" type="number" value={d.montoAprobado||''} onChange={e => update('montoAprobado', e.target.value)} /></div>
          <div className="field"><label className="field-label">Plazo (meses)</label><input className="field-input num" type="number" value={d.plazoAprobado||''} onChange={e => update('plazoAprobado', e.target.value)} /></div>
          <div className="field"><label className="field-label">Tasa Anual %</label><input className="field-input num" type="number" value={d.tasaAprobada||''} onChange={e => update('tasaAprobada', e.target.value)} step="0.01" /></div>
        </div>
      </ModuleSection>

      {renderList('puntosAFavor', 'Puntos a Favor', 'favor', '<polyline points="20 6 9 17 4 12"/>')}
      {renderList('puntosEnContra', 'Puntos en Contra', 'contra', '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>')}
      {renderList('aclaraciones', 'Aclaraciones Pendientes', 'aclar', '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')}
      {renderList('comentarios', 'Comentarios Adicionales', 'info', '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>')}
      {renderList('condiciones', 'Condiciones del Crédito', 'cond', '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')}

      <CompletionBar title="Completitud del Módulo" pct={dictamenCompletionPct(state)} />
    </>
  )
}
