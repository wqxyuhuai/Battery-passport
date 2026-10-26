#!/usr/bin/env node
/**
 * Validates one passport payload per language before build or deployment.
 *
 * Usage:
 *   node scripts/validate-data.mjs                 # validates src/data/demo-data.json
 *   node scripts/validate-data.mjs payload.json    # validates a backend export
 *
 * Exits with code 1 and a readable error list when the contract is broken.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const LANGUAGES = ['zh', 'en', 'de']
const PANEL_KEYS = ['0', '1', '2', '3', '4']
const REQUIRED_FIELDS = {
  '005': 'DPP id',
  '011': 'serial number',
  '010': 'model identifier',
  '004': 'last updated',
  '002': 'status',
  '060': 'certified usable energy',
  '066': 'nominal voltage',
  '057': 'rated capacity',
  '082': 'expected cycles',
  '021': 'weight',
}
const FIELD_KEYS = {
  id: 'string',
  label: 'string',
  value: 'string',
  href: 'stringOrNull',
  locked: 'boolean',
}

function check(condition, message) {
  if (!condition) throw new Error(message)
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function checkType(value, type, path) {
  if (type === 'stringOrNull') check(value === null || typeof value === 'string', path + ' must be a string or null')
  else check(typeof value === type, path + ' must be a ' + type)
}

function collectIds(payload, lang) {
  const ids = []
  for (const panelKey of PANEL_KEYS) {
    const panel = payload.panels[panelKey]
    check(isRecord(panel), lang + '.panels.' + panelKey + ' is missing')
    checkType(panel.title, 'string', lang + '.panels.' + panelKey + '.title')
    check(Array.isArray(panel.sections), lang + '.panels.' + panelKey + '.sections must be an array')
    for (const [sectionIndex, section] of panel.sections.entries()) {
      const sectionPath = lang + '.panels.' + panelKey + '.sections[' + sectionIndex + ']'
      check(isRecord(section), sectionPath + ' must be an object')
      checkType(section.title, 'string', sectionPath + '.title')
      check(Array.isArray(section.fields), sectionPath + '.fields must be an array')
      for (const [fieldIndex, field] of section.fields.entries()) {
        const fieldPath = sectionPath + '.fields[' + fieldIndex + ']'
        check(isRecord(field), fieldPath + ' must be an object')
        for (const [key, type] of Object.entries(FIELD_KEYS)) checkType(field[key], type, fieldPath + '.' + key)
        check(/^\d{3}$/.test(field.id), fieldPath + '.id must be a three-digit code')
        if ('chips' in field) checkType(field.chips, 'boolean', fieldPath + '.chips')
        if (field.label.trim() === '') throw new Error(fieldPath + '.label must not be empty')
        if (field.value.trim() === '') throw new Error(fieldPath + '.value must not be empty; use "--" for unpublished data')
        if (field.href !== null) check(/^https?:\/\//.test(field.href), fieldPath + '.href must be http(s) or null')
        if (field.locked && field.href) throw new Error(fieldPath + ' cannot be both locked and linked')
        ids.push(field.id)
      }
    }
  }
  return ids
}

const file = process.argv[2] || resolve(here, '..', 'src', 'data', 'demo-data.json')
const payload = JSON.parse(await readFile(file, 'utf8'))
check(isRecord(payload), 'payload must be an object keyed by language')
check(Object.keys(payload).length === LANGUAGES.length, 'payload must contain exactly ' + LANGUAGES.join(', '))

const idsByLanguage = {}
for (const lang of LANGUAGES) {
  const entry = payload[lang]
  check(isRecord(entry), lang + ' is missing')
  checkType(entry.productName, 'string', lang + '.productName')
  check(entry.productName.trim() !== '', lang + '.productName must not be empty')
  check(isRecord(entry.panels), lang + '.panels must be an object')
  check(Object.keys(entry.panels).length === PANEL_KEYS.length, lang + '.panels must contain keys ' + PANEL_KEYS.join(', '))
  idsByLanguage[lang] = collectIds(entry, lang)
  for (const [id, purpose] of Object.entries(REQUIRED_FIELDS)) {
    check(idsByLanguage[lang].includes(id), lang + ' is missing required field ' + id + ' (' + purpose + ')')
  }
}

const reference = idsByLanguage.zh
for (const lang of LANGUAGES) {
  const ids = idsByLanguage[lang]
  check(new Set(ids).size === ids.length, lang + ' contains duplicate field ids')
  const missing = reference.filter((id) => !ids.includes(id))
  const extra = ids.filter((id) => !reference.includes(id))
  check(missing.length === 0, lang + ' is missing ids present in zh: ' + missing.join(', '))
  check(extra.length === 0, lang + ' has ids absent from zh: ' + extra.join(', '))
}

console.log('OK  ' + file)
console.log('    ' + LANGUAGES.map((lang) => lang + ': ' + idsByLanguage[lang].length + ' fields').join(' | '))
