// ============================================================
// CASO REAL: MIRAMAR MEDCOM SA DE CV
// Datos extraídos de los 4 PDF de análisis crediticio
// ============================================================

export const MIRAMAR_DATA = {
  caratula: {
    empresa: 'MIRAMAR MEDCOM SA DE CV',
    rfc: 'MOU000620EP4',
    telefonos: '5556621604',
    email: 'saleaga@miramar.mx',
    representanteLegal: 'ERNESTO SALVADOR ALEAGA PRATS',
    repCargo: 'Representante Legal',
    fechaEntrada: '2026-04-27',
    fechaAnalisis: '2026-04-29',
    domicilioFiscal: 'TIBURCIO SANCHEZ DE LA BARQUERA 46, Merced Gómez, Benito Juárez, CDMX, CP 03930',
    tipoFiscal: 'Rentado',
    tiempoFiscal: '',
    valorFiscal: '',
    supFiscal: '493',
    rentaFiscal: '18269.33',
    domicilioParticular: 'P. ENRIQUEZ URENA 444, Depto 702, Los Reyes, Coyoacán, CDMX, CP 04330',
    tipoParticular: 'Propio',
    tiempoParticular: '',
    valorParticular: '',
    supParticular: '',
    rentaParticular: '',
    actividad: 'Empresa dedicada a dar soluciones e implementar nuevas tecnologías a la comunicación de la salud',
    clientes: 'Asofarma de México ($2.8 MDP), Laboratorios Eurofarma ($2.5 MDP), Protein ($2 MDP), Boehringer Ingelheim ($2 MDP), Laboratorio Silanes, Laboratorio Apotex',
    proveedores: 'Hoteles varios para eventos, despacho contable (Samuel Munguía), agencia de RH (Creando Talento)',
    web: 'https://miramar.mx/',
    empleados: '31',
    nomina: '602000',
    montoSolicitado: '3500000',
    montoSugerido: '3500000',
    destinoCredito: 'Operación de la empresa, los clientes tardan en pagar de 30, 60 y 90 días',
    plazoSolicitado: '24',
    empresaFamiliar: 'NO',
    ventasAnioAnterior: '65086434',
    ventasAnioActual: '17209835',
    socios: [
      { rfc: 'SAGP6511064E7', nombre: 'PABLO MARTIN SVARCH GUERCHICOFF', participacion: '42' },
      { rfc: 'TIBC6408121H3', nombre: 'CARLOS MARCELO TIMOSSI BALDI', participacion: '42' },
      { rfc: 'SAGA540508BB1', nombre: 'ALEJANDRO DIEGO SVARCH GUERCHICOFF', participacion: '34' }
    ],
    cuentasBancarias: [
      {
        numero: '21804737000073', banco: 'BANAMEX', titular: 'MIRAMAR MEDCOM SA DE CV', antiguedad: '',
        sm1: 1407284, sm2: 108871, sm3: 50638, sm4: 313026, sm5: 40026, sm6: 37610,
        dm1: 2433193, dm2: 978062, dm3: 2411463, dm4: 2161000, dm5: 198542, dm6: 1224951
      },
      {
        numero: '12281050', banco: 'BANORTE', titular: 'MIRAMAR MEDCOM SA DE CV', antiguedad: '',
        sm1: 576230, sm2: 152799, sm3: 1837829, sm4: 900355, sm5: 1864999, sm6: 446695,
        dm1: 14823364, dm2: 6721714, dm3: 17537005, dm4: 13522344, dm5: 8095791, dm6: 9969293
      },
      {
        numero: '50073734227', banco: 'INBURSA', titular: 'MIRAMAR MEDCOM SA DE CV', antiguedad: '',
        sm1: 661572, sm2: 193587, sm3: 495568, sm4: 0, sm5: 441534, sm6: 913064,
        dm1: 10524966, dm2: 1665690, dm3: 1812863, dm4: 1360589, dm5: 2567230, dm6: 4997052
      }
    ],
    avales: [
      {
        nombre: 'ERNESTO SALVADOR ALEAGA PRATS', telefono: '', email: 'saleaga@miramar.mx',
        relacion: 'Representante Legal', patrimonio: 'Departamento', valor: '7000000',
        superficie: '', hipoteca: 'NO'
      }
    ]
  },

  financieros: {
    er: {
      y1Label: '2024', y2Label: '2025', y3Label: 'mar-2026',
      ventas:        ['61843925', '65086434', '17209835'],
      descuentos:    ['0', '0', '0'],
      otrosIngresos: ['530700', '2187245', '28516'],
      costoVenta:    ['57421711', '63529047', '16303530'],
      gastosVenta:   ['423699', '826572', '165897'],
      gastosOperacion: ['0', '0', '0'],
      otrosGastos:   ['0', '0', '0'],
      gastosFinancieros:    ['847424', '2571590', '803820'],
      productosFinancieros: ['9587', '165672', '332204'],
      otrosProductos: ['0', '0', '0'],
      isr: ['0', '0', '0'],
      ptu: ['0', '0', '0']
    },
    bg: {
      efectivo:         ['1589345', '2048114', '2504664'],
      clientes:         ['25969313', '29511402', '25082486'],
      deudoresDiversos: ['1290814', '3105508', '4850674'],
      inventarios:      ['0', '0', '0'],
      otrosActivosCP:   ['3156745', '1710802', '829554'],
      activoFijo:       ['6099688', '5397976', '7209981'],
      otrosActivosLP:   ['0', '0', '0'],
      proveedores:      ['8429252', '12548133', '11977024'],
      acreedores:       ['0', '0', '0'],
      prestamosFinancierosCP: ['0', '0', '0'],
      otrosPasivosCP:   ['5200156', '4212236', '3189597'],
      prestamosFinancierosLP: ['0', '0', '0'],
      otrosPasivosLP:   ['0', '0', '0'],
      capitalSocialFijo: ['450000', '474793', '474793'],
      capitalSocialVariable: ['0', '0', '0'],
      reservaLegal:     ['0', '0', '0'],
      resultadosAnteriores: ['15578870', '19270249', '19782391'],
      otrasCuentasCapital: ['4756249', '4756249', '4756249']
    }
  },

  buroPF: {
    nombre: 'ERNESTO SALVADOR ALEAGA PRATS',
    fechaConsulta: '2026-04-29',
    fechaNacimiento: '1989-01-12',
    rfc: 'AEPE8901126VA',
    folio: '4,217,957,178',
    creditosBancariosActivos: [
      { otorgante:'SANTANDER', cuenta:'5453076003477024', tipo:'Tarjeta de Crédito', saldo:'0', limite:'3000', maxCredito:'3335', mop:'1', apertura:'2023-03', cierre:'', estatus:'Al corriente' },
      { otorgante:'BANORTE', cuenta:'4023185002815797', tipo:'Tarjeta de Crédito', saldo:'0', limite:'1000000', maxCredito:'0', mop:'0', apertura:'2026-01', cierre:'', estatus:'Cuenta muy reciente' }
    ],
    creditosBancariosCerrados: [
      { otorgante:'BBVA', cuenta:'00742458229644230807', tipo:'Bienes Raíces / Hipoteca', saldo:'0', limite:'0', maxCredito:'5220000', mop:'1', apertura:'2021-05', cierre:'2025-12', estatus:'Cuenta cerrada al corriente' },
      { otorgante:'BANORTE', cuenta:'4931720070848923', tipo:'Tarjeta de Crédito', saldo:'0', limite:'6500', maxCredito:'0', mop:'1', apertura:'2024-06', cierre:'2025-09', estatus:'Cuenta cerrada al corriente' },
      { otorgante:'SANTANDER', cuenta:'4941330110504193', tipo:'Tarjeta de Crédito', saldo:'0', limite:'40000', maxCredito:'40184', mop:'1', apertura:'2015-12', cierre:'2023-06', estatus:'Cuenta cerrada al corriente' },
      { otorgante:'SANTANDER', cuenta:'5470467021418166', tipo:'Tarjeta de Crédito', saldo:'0', limite:'0', maxCredito:'49462', mop:'1', apertura:'2015-03', cierre:'2023-03', estatus:'En cobranza pagada sin quebranto' },
      { otorgante:'SANTANDER', cuenta:'4915736003267148', tipo:'Tarjeta de Crédito', saldo:'0', limite:'178000', maxCredito:'209362', mop:'1', apertura:'2021-06', cierre:'2022-11', estatus:'Pago menor por programa COVID-19' },
      { otorgante:'SANTANDER', cuenta:'4915735014397407', tipo:'Tarjeta de Crédito', saldo:'0', limite:'70000', maxCredito:'150240', mop:'1', apertura:'2017-08', cierre:'2022-11', estatus:'Pago menor por programa COVID-19' },
      { otorgante:'SANTANDER', cuenta:'4941330105913797', tipo:'Tarjeta de Crédito', saldo:'0', limite:'40000', maxCredito:'40184', mop:'1', apertura:'2015-12', cierre:'2022-11', estatus:'Tarjeta extraviada o robada' },
      { otorgante:'BBVA', cuenta:'5546293001714626', tipo:'Tarjeta de Crédito', saldo:'0', limite:'50100', maxCredito:'52165', mop:'1', apertura:'2014-05', cierre:'2020-09', estatus:'Cuenta cerrada al corriente' }
    ],
    creditosNoBancariosActivos: [
      { otorgante:'AMEX COMPANY', cuenta:'376703647347009', tipo:'Tarjeta de Crédito sin límite', saldo:'90032', limite:'0', maxCredito:'1236900', mop:'1', apertura:'2023-07', cierre:'', estatus:'Al corriente' },
      { otorgante:'AMEX COMPANY', cuenta:'340106039781004', tipo:'Tarjeta de Crédito sin límite', saldo:'1141561', limite:'0', maxCredito:'1786393', mop:'1', apertura:'2025-03', cierre:'', estatus:'Al corriente' },
      { otorgante:'AMEXCO', cuenta:'376698930973000', tipo:'Tarjeta de Crédito - Obligado Solidario', saldo:'0', limite:'0', maxCredito:'169001', mop:'1', apertura:'2024-04', cierre:'', estatus:'Al corriente' },
      { otorgante:'LIVERPOOL', cuenta:'1300004826569301', tipo:'Tarjeta de Crédito', saldo:'0', limite:'70000', maxCredito:'31188', mop:'1', apertura:'2021-08', cierre:'', estatus:'Al corriente' },
      { otorgante:'NU MEXICO', cuenta:'5267777687624528', tipo:'Tarjeta de Crédito', saldo:'11674', limite:'25000', maxCredito:'21824', mop:'1', apertura:'2024-03', cierre:'', estatus:'Al corriente' }
    ],
    creditosNoBancariosCerrados: [
      { otorgante:'DIFFTECH', cuenta:'1705658803', tipo:'Tarjeta de Crédito', saldo:'0', limite:'300', maxCredito:'0', mop:'1', apertura:'2025-08', cierre:'2025-10', estatus:'Cerrada al corriente' },
      { otorgante:'AMEX COMPANY', cuenta:'376701704899003', tipo:'Tarjeta de Crédito sin límite', saldo:'0', limite:'0', maxCredito:'414132', mop:'1', apertura:'2017-08', cierre:'2023-09', estatus:'Cerrada al corriente' },
      { otorgante:'BMW', cuenta:'111211315267', tipo:'Compra de Automóvil', saldo:'0', limite:'0', maxCredito:'186000', mop:'1', apertura:'2018-07', cierre:'2020-07', estatus:'Cerrada al corriente' }
    ],
    consultasUltimos3Meses: '4',
    consultasFinancieras: [
      { institucion:'BANORTE', fecha:'2026-02-05' },
      { institucion:'BBVA', fecha:'2026-01-23' },
      { institucion:'KLAR', fecha:'2026-03-24' }
    ],
    observaciones: 'Buró sólido. Sin atrasos relevantes. Hipoteca BBVA cerrada al corriente. Saldos vigentes manejables ($1.24 MDP en AMEX). Historial limpio.'
  },

  buroPM: {
    empresa: 'MIRAMAR MEDCOM SA DE CV',
    rfc: 'MOU000620EP4',
    fechaConsulta: '2026-04-27',
    fechaRegistro: '2025-10-06',
    folio: '583987607',
    domicilioFiscal: 'TIBURCIO SANCHEZ DE LA BARQUERA 46, Merced Gómez, Benito Juárez, CDMX, CP 03930',
    accionistas: [
      { rfc:'SAGP6511064E7', nombre:'PABLO MARTIN SVARCH GUERCHICOFF', direccion:'AV PEDRO HENRIQUEZ URENA 444 LOS REYES 04330 CDMX', participacion:'42' },
      { rfc:'TIBC6408121H3', nombre:'CARLOS MARCELO TIMOSSI BALDI', direccion:'AV XICOTENCATL 392 DEL CARMEN 04100 CDMX', participacion:'42' },
      { rfc:'SAGA540508BB1', nombre:'ALEJANDRO DIEGO SVARCH GUERCHICOFF', direccion:'TIBURCIO SANCEZ DE LA BARQUERA 46 MERCED GOMEZ 03930 CDMX', participacion:'34' }
    ],
    creditosFinancierosActivos: [
      { otorgante:'ABC LEASING', contrato:'APV000000069130', tipo:'Arrendamiento', creditoOtorgado:'565', saldoActual:'527', saldoVencido:'0', mop:'1', estatus:'Al corriente' },
      { otorgante:'AMERICAN EXPRESS COMPANY (MEXICO)', contrato:'002045207000101', tipo:'Tarjeta de Servicio', creditoOtorgado:'0', saldoActual:'2', saldoVencido:'0', mop:'4', estatus:'En proceso, atraso reciente' },
      { otorgante:'BANAMEX', contrato:'0647424900550100', tipo:'Crédito Simple', creditoOtorgado:'3500', saldoActual:'3268', saldoVencido:'0', mop:'1', estatus:'Al corriente' },
      { otorgante:'BANAMEX', contrato:'8811095520017098', tipo:'Línea de Crédito', creditoOtorgado:'3500', saldoActual:'1', saldoVencido:'0', mop:'1', estatus:'Al corriente' }
    ],
    creditosFinancierosCerrados: [
      { otorgante:'BANAMEX', contrato:'8811095100083395', tipo:'Línea de Crédito', creditoOtorgado:'0', saldoActual:'0', saldoVencido:'0', mop:'1', estatus:'Liquidado (SEP-25)' }
    ],
    otrasSic: [
      { otorgante:'BANCO REGIONAL', contrato:'4364010630734003', tipo:'1380', saldoActual:'0', mop:'1', estatus:'Activo' },
      { otorgante:'BANCO REGIONAL', contrato:'220861160033', tipo:'6280', saldoActual:'3', mop:'2', estatus:'Activo con atrasos leves recientes' },
      { otorgante:'KONFIO', contrato:'28999', tipo:'6280', saldoActual:'0', mop:'1', estatus:'Activo' },
      { otorgante:'KONFIO', contrato:'220775', tipo:'1305', saldoActual:'0', mop:'1', estatus:'Cerrado AGO-24' },
      { otorgante:'KONFIO', contrato:'164472', tipo:'1305', saldoActual:'0', mop:'1', estatus:'Cerrado AGO-23' },
      { otorgante:'NR FINANCE MEXICO', contrato:'4896832000035', tipo:'6270', saldoActual:'0', mop:'1', estatus:'Cerrado MAY-25' }
    ],
    calificacionCartera: [
      { institucion:'AMERICAN EXPRESS CO. (MEXICO)', calificacion:'EX', periodo:'mar-26' },
      { institucion:'BANCO NACIONAL DE MEXICO (BANAMEX)', calificacion:'A1', periodo:'abr-26' }
    ],
    observaciones: 'Empresa con buen historial. Calificación A1 BANAMEX. Atrasos leves recientes en Banco Regional (línea 6280) y en AMEX Servicio que requieren monitoreo.'
  },

  capacidad: {
    flujoMensualDisponible: '1097400',
    tasaAnual: '24',
    plazoMeses: '24',
    pagoMensualEstimado: '',
    dscr: '',
    sensibilidad10: '',
    sensibilidad20: '',
    valorGarantias: '7000000',
    porcentajeLTV: '50'
  },

  riesgo: {
    scoreFinanzas: 78,
    scoreBuro: 72,
    scoreCapacidad: 75,
    scoreCualitativo: 70,
    scoreIA: 68,
    observaciones: 'Score interno: riesgo medio-bajo con alertas específicas que requieren aclaración previa al desembolso.'
  },

  dictamen: {
    puntosAFavor: [
      'Las ventas aumentaron 8% en 2025 vs 2024',
      'Presenta apalancamiento bajo (0.67)',
      'Presenta buena solvencia y liquidez (razón corriente 2.2)',
      'Indicadores de rentabilidad positivos (ROA 1.23%, ROE 2.05%)',
      'El arrastre de utilidades concuerda con ejercicios anteriores',
      'Capital de trabajo neto positivo de $19.6 MDP en 2025'
    ],
    puntosEnContra: [
      'Los días de cuentas por cobrar son de 158 días (muy elevado, indica problema de cobranza)',
      'Margen neto se deterioró de 5.92% (2024) a 0.76% (2025)'
    ],
    aclaraciones: [
      'En 2025 los clientes representaron 43.8% de las ventas totales y en 2026 representan un 146%. ¿Cuándo espera recuperar la cartera?',
      'En financieros refleja créditos con Banorte por $1.5 MDP y por $5.6 MDP, con HSBC por $876 mil pesos, los cuales NO APARECEN EN BURÓ',
      'Refleja $4 MDP en Deudores Diversos, los cuales no desglosa'
    ],
    comentarios: [
      'Sus clientes: Asofarma de México $2.8 MDP, Laboratorios Eurofarma $2.5 MDP, Protein $2 MDP, Boehringer Ingelheim $2 MDP',
      'En 2026 aumentó el activo fijo porque se incrementó la cuenta de equipo de transporte',
      'Los depósitos son mayores a las ventas mensuales ya que refleja traspasos entre cuentas y depósitos por créditos',
      'Ha sido consultada en buró por Konfio, HSBC y Banorte en los últimos tres meses'
    ],
    decision: 'condicionado',
    condiciones: [
      'Aclarar los créditos no reportados en buró (Banorte $1.5 MDP, $5.6 MDP y HSBC $876 mil)',
      'Desglosar la cuenta de Deudores Diversos por $4 MDP',
      'Presentar plan de cobranza para reducir días CxC de 158 a meta de 90 días',
      'Hipotecar el departamento del Sr. Aleaga (valor declarado $7 MDP) como garantía',
      'Reporte trimestral de estados financieros durante vigencia del crédito',
      'Pago domiciliado obligatorio'
    ],
    montoAprobado: '3500000',
    plazoAprobado: '24',
    tasaAprobada: '22'
  },

  modulesCompleted: {
    caratula: true, financieros: true, analisis: true,
    buro: true, capacidad: true,
    riesgo: true, analisisRiesgos: true, dictamen: true
  }
}

export function emptyState() {
  return {
    caratula: {
      empresa:'', rfc:'', telefonos:'', email:'', representanteLegal:'', repCargo:'',
      fechaEntrada:'', fechaAnalisis:'', domicilioFiscal:'', tipoFiscal:'Propio',
      tiempoFiscal:'', valorFiscal:'', supFiscal:'', rentaFiscal:'',
      domicilioParticular:'', tipoParticular:'Propio', tiempoParticular:'',
      valorParticular:'', supParticular:'', rentaParticular:'',
      actividad:'', clientes:'', proveedores:'', web:'', empleados:'', nomina:'',
      montoSolicitado:'', montoSugerido:'', destinoCredito:'', plazoSolicitado:'',
      empresaFamiliar:'NO', ventasAnioAnterior:'', ventasAnioActual:'',
      socios:[], cuentasBancarias:[], avales:[]
    },
    financieros: {
      er: {
        y1Label:'2024', y2Label:'2025', y3Label:'mar-2026',
        ventas: ['','',''], descuentos: ['','',''], otrosIngresos: ['','',''],
        costoVenta: ['','',''], gastosVenta: ['','',''], gastosOperacion: ['','',''],
        otrosGastos: ['','',''], gastosFinancieros: ['','',''], productosFinancieros: ['','',''],
        otrosProductos: ['','',''], isr: ['','',''], ptu: ['','','']
      },
      bg: {
        efectivo: ['','',''], clientes: ['','',''], deudoresDiversos: ['','',''],
        inventarios: ['','',''], otrosActivosCP: ['','',''], activoFijo: ['','',''],
        otrosActivosLP: ['','',''], proveedores: ['','',''], acreedores: ['','',''],
        prestamosFinancierosCP: ['','',''], otrosPasivosCP: ['','',''],
        prestamosFinancierosLP: ['','',''], otrosPasivosLP: ['','',''],
        capitalSocialFijo: ['','',''], capitalSocialVariable: ['','',''],
        reservaLegal: ['','',''], resultadosAnteriores: ['','',''], otrasCuentasCapital: ['','','']
      }
    },
    buroPF: {
      nombre:'', fechaConsulta:'', fechaNacimiento:'', rfc:'', folio:'',
      creditosBancariosActivos: [], creditosBancariosCerrados: [],
      creditosNoBancariosActivos: [], creditosNoBancariosCerrados: [],
      consultasUltimos3Meses: '', consultasFinancieras: [], observaciones: ''
    },
    buroPM: {
      empresa:'', rfc:'', fechaConsulta:'', fechaRegistro:'', folio:'',
      domicilioFiscal:'', accionistas: [], creditosFinancierosActivos: [],
      creditosFinancierosCerrados: [], otrasSic: [], calificacionCartera: [], observaciones: ''
    },
    capacidad: {
      flujoMensualDisponible:'', tasaAnual:'', plazoMeses:'',
      pagoMensualEstimado:'', dscr:'', sensibilidad10:'', sensibilidad20:'',
      valorGarantias:'', porcentajeLTV:'70'
    },
    riesgo: {
      scoreFinanzas: 0, scoreBuro: 0, scoreCapacidad: 0,
      scoreCualitativo: 0, scoreIA: 0, observaciones: ''
    },
    dictamen: {
      puntosAFavor: [], puntosEnContra: [], aclaraciones: [], comentarios: [],
      decision: '', condiciones: [], montoAprobado: '', plazoAprobado: '', tasaAprobada: ''
    },
    modulesCompleted: {}
  }
}

export const MODS = [
  { id:'caratula', name:'Carátula', sub:'Datos del Cliente', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
  { id:'financieros', name:'Estados Financieros', sub:'Balance + Resultados', icon:'<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/>' },
  { id:'analisis', name:'Análisis Financiero', sub:'Razones y Tendencias', icon:'<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="11" y2="14"/>' },
  { id:'buro', name:'Buró Crediticio', sub:'Persona Física + Moral', icon:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  { id:'capacidad', name:'Capacidad de Pago', sub:'Flujo y Garantías', icon:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' },
  { id:'riesgo', name:'Matriz de Riesgo', sub:'Score Interno', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
  { id:'analisisRiesgos', name:'Análisis de Riesgos', sub:'Escenarios Predictivos', icon:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
  { id:'dictamen', name:'Dictamen Final', sub:'Recomendación Ejecutiva', icon:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' }
]
