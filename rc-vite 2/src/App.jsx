// ============================================================
// APP PRINCIPAL · RC CORPORATIVO
// ============================================================

import { useState, useEffect } from 'react'
import { MIRAMAR_DATA, emptyState, MODS } from './data/miramarSample'
import { Header, SubBar, Sidebar, Footer } from './components/shared/Shell'
import { Icon, Toast } from './components/shared/Common'
import { ExportModal } from './components/shared/ExportModal'
import { DocumentosModal } from './components/shared/DocumentosModal'

import DashboardModule from './components/modules/DashboardModule'
import CaratulaModule from './components/modules/CaratulaModule'
import FinancierosModule from './components/modules/FinancierosModule'
import AnalisisModule from './components/modules/AnalisisModule'
import BuroModule from './components/modules/BuroModule'
import CapacidadModule from './components/modules/CapacidadModule'
import RiesgoModule from './components/modules/RiesgoModule'
import AnalisisRiesgosModule from './components/modules/AnalisisRiesgosModule'
import DictamenModule from './components/modules/DictamenModule'

const STORAGE_KEY = 'rc_corporativo_data_v4'

function loadState() {
  const base = emptyState()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return base
    const parsed = JSON.parse(saved)
    return {
      ...base,
      ...parsed,
      caratula: { ...base.caratula, ...parsed.caratula },
      financieros: {
        ...base.financieros,
        ...parsed.financieros,
        er: { ...base.financieros.er, ...parsed.financieros?.er },
        bg: { ...base.financieros.bg, ...parsed.financieros?.bg }
      },
      buroPF: { ...base.buroPF, ...parsed.buroPF },
      buroPM: { ...base.buroPM, ...parsed.buroPM },
      capacidad: { ...base.capacidad, ...parsed.capacidad },
      riesgo: { ...base.riesgo, ...parsed.riesgo },
      dictamen: { ...base.dictamen, ...parsed.dictamen },
      modulesCompleted: { ...base.modulesCompleted, ...parsed.modulesCompleted }
    }
  } catch (e) { console.warn('Error loading state', e) }
  return base
}

export default function App() {
  const [state, setStateRaw] = useState(loadState)
  const [active, setActive] = useState('dashboard')
  const [showExport, setShowExport] = useState(false)
  const [showDocumentos, setShowDocumentos] = useState(false)
  const [toast, setToast] = useState(null)

  // Persistencia
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) { console.warn('Error saving', e) }
  }, [state])

  const setState = (newState) => setStateRaw(newState)

  const showToast = (msg, type='success') => setToast({ msg, type })

  const clearAll = () => {
    if (confirm('¿Estás seguro? Se borrarán todos los datos capturados.')) {
      setStateRaw(emptyState())
      setActive('dashboard')
      showToast('Datos limpiados')
    }
  }

  // Determinar subtítulo y título por módulo
  const moduleConfig = {
    dashboard: { title: 'Dashboard Ejecutivo', subtitle: 'Vista general del análisis crediticio' },
    caratula: { title: 'Carátula del Cliente', subtitle: 'Captura de datos generales' },
    financieros: { title: 'Estados Financieros', subtitle: 'Balance General y Estado de Resultados' },
    analisis: { title: 'Análisis Financiero', subtitle: 'Razones, tendencias e interpretación' },
    buro: { title: 'Buró Crediticio', subtitle: 'Historial crediticio · Persona Física y Persona Moral' },
    capacidad: { title: 'Capacidad de Pago', subtitle: 'DSCR, flujo y garantías' },
    riesgo: { title: 'Matriz de Riesgo', subtitle: 'Score interno ponderado' },
    analisisRiesgos: { title: 'Análisis de Riesgos', subtitle: 'Escenarios predictivos y alertas' },
    dictamen: { title: 'Dictamen Final', subtitle: 'Recomendación ejecutiva' }
  }
  const cfg = moduleConfig[active] || moduleConfig.dashboard

  const renderModule = () => {
    switch(active) {
      case 'dashboard': return <DashboardModule state={state} setActive={setActive} />
      case 'caratula': return <CaratulaModule state={state} setState={setState} />
      case 'financieros': return <FinancierosModule state={state} setState={setState} />
      case 'analisis': return <AnalisisModule state={state} />
      case 'buro': return <BuroModule state={state} setState={setState} />
      case 'capacidad': return <CapacidadModule state={state} setState={setState} />
      case 'riesgo': return <RiesgoModule state={state} setState={setState} />
      case 'analisisRiesgos': return <AnalisisRiesgosModule state={state} />
      case 'dictamen': return <DictamenModule state={state} setState={setState} />
      default: return <DashboardModule state={state} setActive={setActive} />
    }
  }

  const commonActions = (
    <>
      <button className="btn btn-ghost" onClick={clearAll}>
        <Icon path='<polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>' size={14} /> Limpiar
      </button>
      <button className="btn" onClick={() => setShowDocumentos(true)}>
        <Icon path='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' size={14} /> Carga Documentos
      </button>
      <button className="btn btn-primary" onClick={() => setShowExport(true)}>
        <Icon path='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' size={14} /> Exportar Caso
      </button>
    </>
  )

  return (
    <div className="app">
      <Header state={state} />
      <div className="layout">
        <Sidebar state={state} active={active} setActive={setActive} />
        <main className="main">
          <SubBar title={cfg.title} subtitle={cfg.subtitle} actions={commonActions} />
          <div className="main-content">
            {renderModule()}
          </div>
        </main>
      </div>
      <Footer />
      {showExport && (
        <ExportModal
          state={state}
          onClose={() => setShowExport(false)}
          onImport={(newState) => setStateRaw(newState)}
          showToast={showToast}
        />
      )}
      {showDocumentos && (
        <DocumentosModal
          onClose={() => setShowDocumentos(false)}
          showToast={showToast}
          onEjecutar={() => {
            setStateRaw({
              ...MIRAMAR_DATA,
              modulesCompleted: { caratula:true, financieros:true, analisis:true, buro:true, capacidad:true, riesgo:true, analisisRiesgos:true, dictamen:true }
            })
            setActive('dashboard')
            showToast('Documentos procesados · datos cargados')
          }}
        />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
