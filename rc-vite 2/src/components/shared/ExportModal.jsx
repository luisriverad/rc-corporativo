// ============================================================
// MODAL DE EXPORTACIÓN
// ============================================================

import { Icon } from './Common'
import { exportJSON, exportExcel, exportPDF, importJSON } from '../../utils/exporters'

export function ExportModal({ state, onClose, onImport, showToast }) {
  const empresa = state.caratula.empresa || 'Sin cliente'

  const handleExportPDF = () => {
    exportPDF(state)
    showToast('Generando PDF...')
  }

  const handleExportExcel = () => {
    exportExcel(state)
    showToast('Excel exportado con 9 hojas')
  }

  const handleExportJSON = () => {
    exportJSON(state)
    showToast('Caso exportado a JSON')
  }

  const handleImport = () => {
    importJSON((newState) => {
      onImport(newState)
      showToast('Caso importado correctamente')
      onClose()
    })
  }

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--rc-white)', borderRadius: '8px', maxWidth: '580px', width: '90%',
        padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--rc-green)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Exportar Caso
            </div>
            <h2 style={{ fontFamily: "'Source Serif Pro', serif", fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {empresa}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--rc-text-muted)', marginTop: '2px' }}>
              {state.caratula.rfc || 'Sin RFC'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--rc-border)',
              width: '32px', height: '32px', borderRadius: '4px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit'
            }}
          >
            <Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginTop: '24px' }}>
          <ExportOption
            color="red"
            iconPath='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'
            iconBg="#FEEBEB"
            iconColor="var(--rc-red)"
            title="Dictamen Ejecutivo en PDF"
            desc="Reporte profesional imprimible · Carta · 5-7 páginas con score, financieros y dictamen"
            onClick={handleExportPDF}
          />
          <ExportOption
            color="green"
            iconPath='<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>'
            iconBg="#E8EFE2"
            iconColor="var(--rc-success)"
            title="Reporte Excel (.xlsx)"
            desc="9 hojas: Carátula, Cuentas, ER, Balance, Razones, Buró PF, Buró PM, Capacidad, Dictamen"
            onClick={handleExportExcel}
          />
          <ExportOption
            color="blue"
            iconPath='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'
            iconBg="var(--rc-blue-soft)"
            iconColor="var(--rc-blue)"
            title="Respaldo Completo (.json)"
            desc="Backup técnico de todo el caso · Permite restaurar exactamente el análisis"
            onClick={handleExportJSON}
          />
          <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--rc-border)' }}>
            <button
              onClick={handleImport}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '18px',
                background: 'var(--rc-cream)', border: '1px dashed var(--rc-border-dark)',
                borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', transition: 'all 0.15s', width: '100%'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--rc-green)'
                e.currentTarget.style.background = 'var(--rc-green-soft)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--rc-border-dark)'
                e.currentTarget.style.background = 'var(--rc-cream)'
              }}
            >
              <div style={{
                width: '48px', height: '48px', background: 'var(--rc-white)',
                color: 'var(--rc-text-muted)', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--rc-border)'
              }}>
                <Icon path='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>Importar Caso Guardado</div>
                <div style={{ fontSize: '12px', color: 'var(--rc-text-muted)' }}>Cargar un archivo .json previamente exportado</div>
              </div>
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '24px', padding: '14px', background: 'var(--rc-green-soft)',
          borderRadius: '4px', fontSize: '11px', color: 'var(--rc-green-dark)',
          lineHeight: 1.5, display: 'flex', gap: '8px'
        }}>
          <Icon path='<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>' size={14} />
          <div>
            <b>Tip:</b> Cada caso se guarda automáticamente en este navegador (localStorage).
            Para mover el análisis a otra computadora o respaldarlo, usa Exportar JSON.
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportOption({ color, iconPath, iconBg, iconColor, title, desc, onClick }) {
  const hoverColor = color === 'red' ? 'var(--rc-red)' : color === 'green' ? 'var(--rc-success)' : 'var(--rc-blue)'
  const hoverBg = color === 'red' ? '#FFF8F8' : color === 'green' ? '#F5F8F1' : '#F0F7FB'

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px', padding: '18px',
        background: 'var(--rc-white)', border: '1px solid var(--rc-border)',
        borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit', transition: 'all 0.15s'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = hoverColor
        e.currentTarget.style.background = hoverBg
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--rc-border)'
        e.currentTarget.style.background = 'var(--rc-white)'
      }}
    >
      <div style={{
        width: '48px', height: '48px', background: iconBg, color: iconColor,
        borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon path={iconPath} size={22} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--rc-text-muted)' }}>{desc}</div>
      </div>
      <Icon path='<polyline points="9 18 15 12 9 6"/>' size={16} />
    </button>
  )
}
