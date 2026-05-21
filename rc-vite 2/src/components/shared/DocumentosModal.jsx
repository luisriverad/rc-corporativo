// ============================================================
// MODAL DE CARGA DE DOCUMENTOS (drag & drop)
// ============================================================

import { useState, useRef } from 'react'
import { Icon } from './Common'

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export function DocumentosModal({ onClose, showToast, onEjecutar }) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef(null)

  const handleEjecutar = () => {
    if (files.length === 0 || processing) return
    setProcessing(true)
    setTimeout(() => {
      onEjecutar?.()
      setProcessing(false)
      onClose()
    }, 900)
  }

  const addFiles = (newFiles) => {
    const list = Array.from(newFiles).map(f => ({
      id: `${f.name}-${f.lastModified}-${f.size}`,
      name: f.name,
      size: f.size,
      type: f.type || 'desconocido',
      lastModified: f.lastModified
    }))
    setFiles(prev => {
      const seen = new Set(prev.map(p => p.id))
      const merged = [...prev]
      for (const it of list) if (!seen.has(it.id)) merged.push(it)
      return merged
    })
    if (list.length > 0) showToast(`${list.length} documento(s) cargado(s)`)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }

  const onPick = (e) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = ''
  }

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id))
  const clearAll = () => setFiles([])

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
        background: 'var(--rc-white)', borderRadius: '8px', maxWidth: '620px', width: '92%',
        padding: '28px 32px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--rc-green)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '6px' }}>Documentos del caso</div>
            <h3 style={{ fontFamily: "'Source Serif Pro', serif", fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Carga Documentos</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--rc-text-muted)', padding: 4 }}
            aria-label="Cerrar"
          >
            <Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={20} />
          </button>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--rc-green)' : 'var(--rc-border-dark)'}`,
            background: isDragging ? 'var(--rc-green-soft)' : 'var(--rc-cream)',
            borderRadius: '6px',
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--rc-green-soft)', color: 'var(--rc-green)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
          }}>
            <Icon path='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' size={24} />
          </div>
          <div style={{ fontFamily: "'Source Serif Pro', serif", fontSize: '17px', fontWeight: 700, color: 'var(--rc-text)', marginBottom: 6 }}>
            Arrastra y suelta tus archivos aquí
          </div>
          <div style={{ fontSize: '12px', color: 'var(--rc-text-muted)' }}>
            o <span style={{ color: 'var(--rc-green)', fontWeight: 600 }}>haz clic para seleccionar</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={onPick}
            style={{ display: 'none' }}
          />
        </div>

        {files.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: '10px', color: 'var(--rc-text-muted)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {files.length} archivo{files.length === 1 ? '' : 's'} cargado{files.length === 1 ? '' : 's'}
              </div>
              <button
                onClick={clearAll}
                style={{ background: 'transparent', border: 'none', color: 'var(--rc-text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }}
              >
                Limpiar todo
              </button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid var(--rc-border)', borderRadius: 4, overflow: 'hidden' }}>
              {files.map((f, idx) => (
                <li
                  key={f.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px',
                    borderBottom: idx === files.length - 1 ? 'none' : '1px solid var(--rc-border)',
                    background: 'var(--rc-white)'
                  }}
                >
                  <div style={{ color: 'var(--rc-green)', flexShrink: 0 }}>
                    <Icon path='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rc-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--rc-text-muted)' }}>
                      {fmtSize(f.size)}
                    </div>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeFile(f.id)}
                    aria-label={`Quitar ${f.name}`}
                  >
                    <Icon path='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--rc-text-muted)' }}>
            {processing
              ? 'Procesando documentos…'
              : files.length === 0
                ? 'Carga al menos un documento para ejecutar'
                : `Listo para procesar ${files.length} documento${files.length === 1 ? '' : 's'}`}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose} disabled={processing}>Cerrar</button>
            <button
              className="btn btn-primary"
              onClick={handleEjecutar}
              disabled={files.length === 0 || processing}
              style={{ opacity: (files.length === 0 || processing) ? 0.55 : 1, cursor: (files.length === 0 || processing) ? 'not-allowed' : 'pointer' }}
            >
              {processing ? (
                <>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white',
                    display: 'inline-block', animation: 'rc-spin 0.7s linear infinite'
                  }} />
                  Procesando…
                </>
              ) : (
                <>
                  <Icon path='<polygon points="5 3 19 12 5 21 5 3"/>' size={12} />
                  EJECUTAR
                </>
              )}
            </button>
          </div>
        </div>
        <style>{`@keyframes rc-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
