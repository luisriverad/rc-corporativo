# RC Corporativo · Sistema de Inteligencia Crediticia

Sistema profesional de análisis crediticio para **RC Corporativo** (financiera mexicana).
Construido en **Vite + React 18 + JSX** para desarrollo profesional en Cursor.

> **Powered by AXON B2B**

---

## 🚀 Inicio Rápido en Cursor

### 1. Abrir el proyecto
```bash
# Descomprime el ZIP y abre la carpeta en Cursor
cd rc-vite
cursor .
```

### 2. Instalar dependencias
```bash
npm install
```
*(toma 30-60 segundos)*

### 3. Levantar el servidor de desarrollo
```bash
npm run dev
```

El sistema abrirá automáticamente en `http://localhost:5173`.

### 4. Probar con datos reales
1. Haz clic en **"Cargar MIRAMAR"** (botón en la barra superior)
2. Navega por los 9 módulos en el sidebar izquierdo
3. Haz clic en **"Exportar Caso"** para generar PDF, Excel o JSON

---

## 📁 Estructura del Proyecto

```
rc-vite/
├── package.json                 # React 18 + Vite 5 + xlsx 0.18
├── vite.config.js               # Config Vite (puerto 5173)
├── index.html                   # Entry HTML con Google Fonts
├── README.md                    # Este archivo
└── src/
    ├── main.jsx                 # Punto de entrada React
    ├── App.jsx                  # Componente raíz · routing entre módulos
    │
    ├── components/
    │   ├── shared/
    │   │   ├── Common.jsx       # Icon, Toast, CompletionBar, ModuleSection, Alert, Light
    │   │   ├── Shell.jsx        # Header, SubBar, Sidebar, Footer
    │   │   └── ExportModal.jsx  # Modal de exportación con 4 opciones
    │   │
    │   └── modules/
    │       ├── DashboardModule.jsx           # Vista general + KPIs
    │       ├── CaratulaModule.jsx            # Módulo 01: Datos del cliente
    │       ├── FinancierosModule.jsx         # Módulo 02: Balance + ER
    │       ├── AnalisisModule.jsx            # Módulo 03: Razones + AH
    │       ├── BuroPFModule.jsx              # Módulo 04: Buró Persona Física
    │       ├── BuroPMModule.jsx              # Módulo 05: Buró Empresa
    │       ├── CapacidadModule.jsx           # Módulo 06: DSCR + sensibilidades
    │       ├── RiesgoModule.jsx              # Módulo 07: Score ponderado
    │       ├── AnalisisRiesgosModule.jsx     # Módulo 08: Escenarios + alertas
    │       └── DictamenModule.jsx            # Módulo 09: Dictamen final
    │
    ├── engines/
    │   └── financialEngine.js   # Lógica de cálculo: calcER, calcBG, calcRazones,
    │                            #   calcCapacidad, calcScore, detectAlerts, etc.
    │
    ├── data/
    │   └── miramarSample.js     # Caso real MIRAMAR MEDCOM + emptyState() + MODS
    │
    ├── utils/
    │   └── exporters.js         # exportJSON, exportExcel, exportPDF, importJSON
    │
    └── styles/
        └── global.css           # Sistema de diseño completo (variables + clases)
```

---

## 🎨 Sistema de Diseño RC Corporativo

Variables CSS centrales (en `src/styles/global.css`):

| Variable             | Valor      | Uso                                  |
|----------------------|------------|--------------------------------------|
| `--rc-green`         | `#3D5A2E`  | Verde institucional principal        |
| `--rc-green-soft`    | `#E8EFE2`  | Fondo verde claro                    |
| `--rc-cream`         | `#FAF8F3`  | Fondo crema (cards, sidebar)         |
| `--rc-white`         | `#FFFFFF`  | Fondo blanco principal               |
| `--rc-text`          | `#1A1A1A`  | Texto principal                      |
| `--rc-text-muted`    | `#6B6B6B`  | Texto secundario                     |
| `--rc-success`       | `#2E7D32`  | Verde de éxito                       |
| `--rc-amber`         | `#C68A2E`  | Ámbar (advertencia)                  |
| `--rc-red`           | `#B23A3A`  | Rojo (error/contra)                  |
| `--rc-blue`          | `#2A6F97`  | Azul (información)                   |

Fuentes: **Inter** (UI) + **Source Serif Pro** (títulos y números).

---

## 🔧 Cómo extender el sistema

### Añadir un nuevo módulo

**1. Crear el componente** en `src/components/modules/MiNuevoModule.jsx`:

```jsx
import { ModuleSection, CompletionBar } from '../shared/Common'

export default function MiNuevoModule({ state, setState }) {
  return (
    <>
      <ModuleSection number="1" title="Mi Sección" subtitle="Descripción">
        {/* Contenido */}
      </ModuleSection>
      <CompletionBar title="Completitud" pct={50} />
    </>
  )
}
```

**2. Registrar el módulo** en `src/data/miramarSample.js` dentro del array `MODS`:

```js
{
  id: 'minuevo',
  name: 'Mi Nuevo Módulo',
  sub: 'Subtítulo',
  icon: '<svg paths…/>'
}
```

**3. Conectar en** `src/App.jsx`:

```jsx
import MiNuevoModule from './components/modules/MiNuevoModule'

// En moduleConfig:
minuevo: { title: 'Mi Nuevo Módulo', subtitle: 'Descripción' }

// En renderModule():
case 'minuevo': return <MiNuevoModule state={state} setState={setState} />
```

**4. Inicializar el state** en `emptyState()` de `miramarSample.js`:

```js
minuevo: { campo1: '', campo2: '' }
```

### Extender los motores de cálculo

En `src/engines/financialEngine.js` puedes añadir nuevas funciones:

```js
export function calcMiMetrica(state) {
  const er = calcER(state)
  return er.y2.ventasNetas / er.y1.ventasNetas
}
```

### Conectar a APIs reales (Buró, CFDI, etc.)

1. Crea `src/api/buroAPI.js` con `fetch()` o `axios`.
2. En el componente, usa `useEffect()` para llamar a la API al montar.
3. Actualiza el state con la respuesta.

```jsx
import { useEffect } from 'react'

useEffect(() => {
  fetch('/api/buro/' + state.caratula.rfc)
    .then(r => r.json())
    .then(data => setState({ ...state, buroPF: data }))
}, [state.caratula.rfc])
```

---

## 📊 Caso de Prueba: MIRAMAR MEDCOM

El sistema viene precargado con un caso real para validación:

- **Empresa:** MIRAMAR MEDCOM SA DE CV
- **RFC:** MOU000620EP4
- **Monto solicitado:** $3.5 MDP
- **Plazo:** 24 meses
- **Score esperado:** 73/100 (Riesgo Medio-Bajo)
- **Dictamen esperado:** Aprobado Condicionado

Alertas críticas detectadas automáticamente:
1. ⚠️ Margen neto deteriorado de 5.92% → 0.76%
2. ⚠️ Días CxC de 158 días (excesivo)
3. ⚠️ Deudores Diversos sin desglose ($4 MDP)
4. ℹ️ 3+ consultas en buró en últimos 3 meses
5. ⚠️ Pasivos no reportados (Banorte $5.6 MDP no aparece en buró)

---

## 📤 Exportación

El sistema permite exportar el caso en 3 formatos + importar:

| Formato | Contenido | Uso |
|---------|-----------|-----|
| **PDF** | Dictamen ejecutivo imprimible · 5-7 páginas | Compartir con cliente / archivo final |
| **Excel** | 9 hojas (Carátula, Cuentas, ER, Balance, Razones, Buró PF/PM, Capacidad, Dictamen) | Análisis interno y backups operativos |
| **JSON** | Respaldo técnico completo del state | Mover casos entre dispositivos |
| **Importar JSON** | Cargar caso guardado | Continuar análisis previos |

---

## 🔐 Persistencia

El sistema guarda **automáticamente** todo el state en `localStorage`
bajo la clave `rc_corporativo_data_v4`.

Para limpiar manualmente:
```js
localStorage.removeItem('rc_corporativo_data_v4')
```

O usar el botón **"Limpiar"** en la UI.

---

## 🛠️ Stack Técnico

- **React 18.3** con Hooks (useState, useEffect)
- **Vite 5.4** como bundler (HMR ultrarrápido)
- **xlsx 0.18** para exportación Excel
- **PDF** nativo del navegador (window.print con CSS @page)
- **Sin dependencias adicionales** · Sin Tailwind · CSS plain
- **JSX puro** (sin TypeScript) · Listo para añadir TS si lo prefieres

---

## 🎯 Próximos Pasos Sugeridos

1. **Integrar API de Buró de Crédito** (Círculo de Crédito / Buró)
2. **Conectar SAT/CFDI** para lectura automática de facturas
3. **Workflow de aprobación** multi-usuario (analista → gerente → director)
4. **Histórico de casos** con búsqueda y filtros
5. **Dashboard ejecutivo** con KPIs de cartera
6. **Notificaciones** vía email/Slack al cambiar estado
7. **Reglas de negocio configurables** desde UI
8. **Versionado de análisis** (snapshots por fecha)

---

## 📄 Licencia

Sistema propietario · © 2026 RC Corporativo · Consultoría Financiera · Recursos & Capital

**Powered by AXON B2B**
