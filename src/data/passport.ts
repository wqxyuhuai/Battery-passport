import raw from './demo-data.json'

export const LANGS = ['zh', 'en', 'de'] as const
export type Lang = (typeof LANGS)[number]

export const LANG_LABELS: Record<Lang, string> = {
  zh: '中文',
  en: 'English',
  de: 'Deutsch',
}

export const TAB_KEYS = ['basic', 'performance', 'materials', 'health', 'compliance'] as const
export type TabKey = (typeof TAB_KEYS)[number]

export type Field = {
  href: string | null
  id: string
  label: string
  locked: boolean
  value: string
}

export type Section = {
  title: string
  fields: Field[]
}

export type Panel = {
  title: string
  sections: Section[]
}

type LangContent = {
  header: string
  panels: Record<string, Panel>
}

const content = raw as unknown as Record<Lang, LangContent>

export function getPanels(lang: Lang): Panel[] {
  return TAB_KEYS.map((_, index) => content[lang].panels[String(index)])
}

export function getPanel(lang: Lang, tab: TabKey): Panel {
  return content[lang].panels[String(TAB_KEYS.indexOf(tab))]
}

export function findField(panel: Panel, id: string): Field | undefined {
  for (const section of panel.sections) {
    const match = section.fields.find((field) => field.id === id)
    if (match) return match
  }
  return undefined
}

export function findFieldAcross(lang: Lang, id: string): Field | undefined {
  for (const panel of getPanels(lang)) {
    const match = findField(panel, id)
    if (match) return match
  }
  return undefined
}

export function fieldCount(panel: Panel): number {
  return panel.sections.reduce((total, section) => total + section.fields.length, 0)
}

export function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function isKeyValueLine(line: string): boolean {
  return /^[A-Za-z][A-Za-z ]{1,38}:\s/.test(line)
}

export function splitKeyValue(line: string): [string, string] {
  const index = line.indexOf(':')
  return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
}

export function splitMetric(value: string): { number: string; unit: string } {
  const match = value.match(/^(-?[\d.,]+)\s*(.*)$/)
  if (!match) return { number: value, unit: '' }
  return { number: match[1], unit: match[2] }
}

export function numericValue(value: string): number {
  const match = value.match(/-?[\d.,]+/)
  if (!match) return 0
  return Number(match[0].replace(',', '.'))
}

export type MetricKey = 'energy' | 'voltage' | 'capacity' | 'cycles' | 'mass'

export const METRICS: Record<MetricKey, string> = {
  energy: '060',
  voltage: '066',
  capacity: '057',
  cycles: '082',
  mass: '021',
}

export const METRIC_KEYS: MetricKey[] = ['energy', 'voltage', 'capacity', 'cycles', 'mass']

export type UiCopy = {
  brand: string
  product: string
  eyebrow: string
  heroDescription: string
  dppId: string
  serial: string
  model: string
  updated: string
  regulation: string
  downloadPdf: string
  menu: string
  close: string
  passport: string
  overview: string
  search: string
  searchAll: string
  matchingFields: string
  noResults: string
  noResultsHint: string
  clear: string
  fields: string
  sections: string
  document: string
  documents: string
  restricted: string
  awaitingData: string
  awaitingHint: string
  verification: string
  verifiedRecord: string
  dataCoverage: string
  publishedFields: string
  schema: string
  lastUpdate: string
  dataSteward: string
  scan: string
  scanHint: string
  needHelp: string
  needHelpBody: string
  contact: string
  metricSubtitles: Record<MetricKey, string>
  composition: string
  recycledContent: string
  carbonBreakdown: string
  carbonTotal: string
  performanceGrade: string
  liveTelemetry: string
  liveTelemetryBody: string
  printTitle: string
  printFooter: string
  generated: string
  confirmed: string
  openDocument: string
  passportRecord: string
  summary: string
  allCategories: string
  coreSpecs: string
  sectionsNav: string
}

export const UI: Record<Lang, UiCopy> = {
  zh: {
    brand: 'Wattsonic',
    product: '数字电池护照',
    eyebrow: '欧盟数字产品护照',
    heroDescription:
      '从制造、性能与材料，到使用健康与回收处置，每一个数据点都可追溯、可核验。',
    dppId: '护照唯一标识符',
    serial: '电池序列号',
    model: '电池型号标识符',
    updated: '护照数据更新时间',
    regulation: '法规依据',
    downloadPdf: '下载 PDF',
    menu: '打开导航',
    close: '关闭',
    passport: '护照',
    overview: '护照概览',
    search: '在当前分类中搜索',
    searchAll: '搜索全部字段',
    matchingFields: '个匹配字段',
    noResults: '没有找到匹配的字段',
    noResultsHint: '尝试搜索型号、标准编号或材料名称，或清除搜索条件。',
    clear: '清除搜索',
    fields: '个字段',
    sections: '个信息组',
    document: '文件',
    documents: '可查看文件',
    restricted: '受限文件',
    awaitingData: '待同步',
    awaitingHint: '该字段将在电池投入运行并回传数据后更新。',
    verification: '记录验证',
    verifiedRecord: '已验证护照记录',
    dataCoverage: '数据完整度',
    publishedFields: '已发布字段',
    schema: '数据规范',
    lastUpdate: '最后更新',
    dataSteward: '数据管理方',
    scan: '扫码打开此护照',
    scanHint: '指向 DPP-2027-A001 的稳定链接',
    needHelp: '需要更多信息？',
    needHelpBody: '如需合规文件、采购或售后支持，请联系 Wattsonic 团队。',
    contact: '联系支持',
    metricSubtitles: {
      energy: '认证可用能量',
      voltage: '标称电压',
      capacity: '额定容量',
      cycles: '充放电循环',
      mass: '整包重量',
    },
    composition: '材料组成',
    recycledContent: '再生材料占比',
    carbonBreakdown: '碳足迹分阶段',
    carbonTotal: '单位功能量碳足迹',
    performanceGrade: '碳足迹性能等级',
    liveTelemetry: '运行数据待接入',
    liveTelemetryBody: '该护照已发布，但实时健康数据尚未从电池管理系统同步。',
    printTitle: '数字电池护照 · 完整记录',
    printFooter: '本文件由 Wattsonic 数字电池护照系统生成，内容以在线护照记录为准。',
    generated: '生成时间',
    confirmed: '已验证',
    openDocument: '打开文件',
    passportRecord: '护照记录',
    summary: '概览',
    allCategories: '全部类别',
    coreSpecs: '核心规格',
    sectionsNav: '本页信息组',
  },
  en: {
    brand: 'Wattsonic',
    product: 'Digital Battery Passport',
    eyebrow: 'EU Digital Product Passport',
    heroDescription:
      'From manufacturing and performance to materials, in-use health and end-of-life handling — every data point is traceable and verifiable.',
    dppId: 'Unique DPP identifier',
    serial: 'Battery serial number',
    model: 'Battery model identifier',
    updated: 'Passport last updated',
    regulation: 'Regulatory basis',
    downloadPdf: 'Download PDF',
    menu: 'Open navigation',
    close: 'Close',
    passport: 'Passport',
    overview: 'Passport overview',
    search: 'Search this category',
    searchAll: 'Search all fields',
    matchingFields: 'matching fields',
    noResults: 'No matching fields',
    noResultsHint: 'Try a model, standard or material name, or clear the search.',
    clear: 'Clear search',
    fields: 'fields',
    sections: 'sections',
    document: 'Document',
    documents: 'documents available',
    restricted: 'restricted documents',
    awaitingData: 'Awaiting data',
    awaitingHint: 'This field updates once the battery is in service and telemetry is connected.',
    verification: 'Record verification',
    verifiedRecord: 'Verified passport record',
    dataCoverage: 'Data coverage',
    publishedFields: 'published fields',
    schema: 'Schema',
    lastUpdate: 'Last update',
    dataSteward: 'Data steward',
    scan: 'Scan to open this passport',
    scanHint: 'Stable link to DPP-2027-A001',
    needHelp: 'Need more information?',
    needHelpBody: 'For compliance documents, procurement or service support, contact the Wattsonic team.',
    contact: 'Contact support',
    metricSubtitles: {
      energy: 'Certified usable energy',
      voltage: 'Nominal voltage',
      capacity: 'Rated capacity',
      cycles: 'Charge-discharge cycles',
      mass: 'Pack weight',
    },
    composition: 'Material composition',
    recycledContent: 'Recycled content',
    carbonBreakdown: 'Carbon footprint by stage',
    carbonTotal: 'Carbon footprint per functional unit',
    performanceGrade: 'Carbon footprint performance class',
    liveTelemetry: 'Operational data not connected',
    liveTelemetryBody: 'The passport is published, but live health data has not yet synced from the battery management system.',
    printTitle: 'Digital Battery Passport · Full record',
    printFooter: 'Generated by the Wattsonic Digital Battery Passport system. The online passport record remains authoritative.',
    generated: 'Generated',
    confirmed: 'Verified',
    openDocument: 'Open document',
    passportRecord: 'Passport record',
    summary: 'Overview',
    allCategories: 'All categories',
    coreSpecs: 'Core specifications',
    sectionsNav: 'In this category',
  },
  de: {
    brand: 'Wattsonic',
    product: 'Digitaler Batteriepass',
    eyebrow: 'EU Digitaler Produktpass',
    heroDescription:
      'Von Fertigung und Leistung über Materialien bis hin zu Nutzungszustand und Entsorgung — jeder Datenpunkt ist nachvollziehbar und prüfbar.',
    dppId: 'Eindeutige DPP-Kennung',
    serial: 'Batterieseriennummer',
    model: 'Batteriemodellkennung',
    updated: 'Letzte Passaktualisierung',
    regulation: 'Rechtsgrundlage',
    downloadPdf: 'PDF herunterladen',
    menu: 'Navigation öffnen',
    close: 'Schließen',
    passport: 'Batteriepass',
    overview: 'Passübersicht',
    search: 'In dieser Kategorie suchen',
    searchAll: 'Alle Felder durchsuchen',
    matchingFields: 'Treffer',
    noResults: 'Keine passenden Felder',
    noResultsHint: 'Suchen Sie nach Modell, Norm oder Material oder löschen Sie die Suche.',
    clear: 'Suche löschen',
    fields: 'Felder',
    sections: 'Bereiche',
    document: 'Dokument',
    documents: 'Dokumente verfügbar',
    restricted: 'gesperrte Dokumente',
    awaitingData: 'Daten ausstehend',
    awaitingHint: 'Dieses Feld wird aktualisiert, sobald die Batterie in Betrieb ist und Telemetriedaten vorliegen.',
    verification: 'Datensatzprüfung',
    verifiedRecord: 'Geprüfter Passdatensatz',
    dataCoverage: 'Datenabdeckung',
    publishedFields: 'veröffentlichte Felder',
    schema: 'Schema',
    lastUpdate: 'Letzte Aktualisierung',
    dataSteward: 'Datenverantwortlicher',
    scan: 'Zum Öffnen des Passes scannen',
    scanHint: 'Stabiler Link zu DPP-2027-A001',
    needHelp: 'Weitere Informationen?',
    needHelpBody: 'Für Konformitätsdokumente, Beschaffung oder Service wenden Sie sich an das Wattsonic-Team.',
    contact: 'Support kontaktieren',
    metricSubtitles: {
      energy: 'Zertifizierte nutzbare Energie',
      voltage: 'Nennspannung',
      capacity: 'Nennkapazität',
      cycles: 'Lade-/Entladezyklen',
      mass: 'Packgewicht',
    },
    composition: 'Materialzusammensetzung',
    recycledContent: 'Recyclinganteil',
    carbonBreakdown: 'CO₂-Fußabdruck nach Phase',
    carbonTotal: 'CO₂-Fußabdruck pro Funktionseinheit',
    performanceGrade: 'CO₂-Leistungsklasse',
    liveTelemetry: 'Betriebsdaten nicht verbunden',
    liveTelemetryBody: 'Der Pass ist veröffentlicht, aber Live-Gesundheitsdaten wurden noch nicht vom Batteriemanagementsystem übertragen.',
    printTitle: 'Digitaler Batteriepass · Vollständiger Datensatz',
    printFooter: 'Erzeugt vom Wattsonic Digital Battery Passport System. Der Online-Datensatz ist maßgeblich.',
    generated: 'Erstellt',
    confirmed: 'Geprüft',
    openDocument: 'Dokument öffnen',
    passportRecord: 'Passdatensatz',
    summary: 'Übersicht',
    allCategories: 'Alle Kategorien',
    coreSpecs: 'Kerndaten',
    sectionsNav: 'In dieser Kategorie',
  },
}
