// ============================================================
// COMPONENTES COMPARTIDOS
// ============================================================

import { useState, useEffect } from 'react'

export function Icon({ path, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: path }}
    />
  )
}

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="toast"
      style={{ background: type === 'error' ? 'var(--rc-red)' : 'var(--rc-green)' }}
    >
      {message}
    </div>
  )
}

export function CompletionBar({ title, pct }) {
  return (
    <div className="completion-bar">
      <div className="completion-info">
        <div className="completion-title">{title}</div>
        <div className="completion-bar-track">
          <div className="completion-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="completion-pct">{pct}%</div>
    </div>
  )
}

export function ModuleSection({ number, title, subtitle, children }) {
  return (
    <section className="module-section">
      <div className="module-section-header">
        <div className="module-section-title">
          <div className="module-section-number">{number}</div>
          <div>
            <div className="module-section-h">{title}</div>
            <div className="module-section-sub">{subtitle}</div>
          </div>
        </div>
      </div>
      <div className="module-section-body">{children}</div>
    </section>
  )
}

export function Alert({ level = 'info', title, children, iconPath }) {
  const defaultIcon = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>'
  return (
    <div className={`alert alert-${level}`}>
      <Icon path={iconPath || defaultIcon} size={14} />
      <div>
        {title && <b>{title}</b>}
        {children}
      </div>
    </div>
  )
}

export function Light({ color, children }) {
  return <span className={`light light-${color}`}>{children}</span>
}
