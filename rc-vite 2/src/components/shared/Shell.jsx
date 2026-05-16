// ============================================================
// SHELL COMPONENTS: Header, Sidebar, SubBar, Footer
// ============================================================

import { Icon } from './Common'
import { MODS } from '../../data/miramarSample'
import { moduleCompletionMap } from '../../engines/financialEngine'
import logoRC from '../../Logo RC Corporativo png.png'

export function Header({ state }) {
  const empresa = state.caratula.empresa || '— Sin cliente —'
  let fecha = '29 de Abril 2026'
  if (state.caratula.fechaAnalisis) {
    try {
      const d = new Date(state.caratula.fechaAnalisis + 'T00:00:00')
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      fecha = `${d.getDate()} de ${meses[d.getMonth()]} ${d.getFullYear()}`
    } catch(e) {}
  }

  return (
    <header className="header">
      <div className="logo-wrap">
        <img src={logoRC} alt="RC Corporativo" className="logo-img" />
      </div>
      <div className="head-info">
        <div className="head-block">
          <div className="head-lbl">Cliente en Análisis</div>
          <div className="head-val">{empresa}</div>
        </div>
        <div className="head-divider" />
        <div className="head-block">
          <div className="head-lbl">Fecha de Análisis</div>
          <div className="head-val">{fecha}</div>
        </div>
        <div className="head-badge">En Proceso</div>
      </div>
    </header>
  )
}

export function SubBar({ title, subtitle, actions }) {
  return (
    <div className="subbar">
      <div className="subbar-left">
        <div className="eyebrow">Sistema de Inteligencia Crediticia</div>
        <h1 className="h1">{title}</h1>
        <div className="h1-sub">{subtitle}</div>
      </div>
      <div className="subbar-actions">{actions}</div>
    </div>
  )
}

export function Sidebar({ state, active, setActive }) {
  const completionMap = moduleCompletionMap(state)
  const completedCount = Object.values(state.modulesCompleted || {}).filter(Boolean).length

  return (
    <aside className="aside">
      <button
        className={`dashbtn ${active === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActive('dashboard')}
      >
        <Icon path='<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>' />
        <span>Dashboard Ejecutivo</span>
      </button>
      <div className="aside-label">Módulos de Análisis</div>
      <nav>
        {MODS.map((m, i) => {
          const completed = state.modulesCompleted?.[m.id]
          const isActive = active === m.id
          return (
            <button
              key={m.id}
              className={`modbtn ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}`}
              onClick={() => setActive(m.id)}
            >
              <div className="modnum">{String(i+1).padStart(2,'0')}</div>
              <div className="modtxt">
                {m.name}
                <div className="modtxt-sub">{m.sub}</div>
              </div>
              {completed && <div className="modbtn-status-dot" />}
              {isActive && !completed && <Icon path='<polyline points="9 18 15 12 9 6"/>' size={14} />}
            </button>
          )
        })}
      </nav>
      <div className="progress">
        <div className="progress-lbl">Progreso del Análisis</div>
        <div>
          <span className="progress-num">{completedCount}</span>
          <span className="progress-of">/ 9 módulos</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(completedCount/9)*100}%` }} />
        </div>
      </div>
    </aside>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">© 2026 RC Corporativo · Consultoría Financiera · Recursos & Capital</div>
      <div className="footer-right">Powered by <b>AXON B2B</b></div>
    </footer>
  )
}
