import { describe, expect, it } from 'vitest'
import { STRINGS, localizePersona, t } from '../i18n'
import { PERSONAS } from '../personas'

describe('i18n', () => {
  it('has the same keys in every language', () => {
    const base = Object.keys(STRINGS.en).sort()
    for (const lang of ['ru', 'tr']) {
      expect(Object.keys(STRINGS[lang]).sort()).toEqual(base)
    }
  })

  it('interpolates variables', () => {
    expect(t('en', 'girls.online', { count: 8 })).toBe('8 online')
    expect(t('ru', 'premium.paid', { plan: 'VIP' })).toContain('VIP')
  })

  it('falls back to English and then the key', () => {
    expect(t('de', 'nav.shop')).toBe('Shop')
    expect(t('ru', 'missing.key')).toBe('missing.key')
  })
})

describe('persona catalog', () => {
  it('has 8 adult personas with all languages', () => {
    expect(PERSONAS).toHaveLength(8)
    for (const p of PERSONAS) {
      expect(p.age).toBeGreaterThanOrEqual(18)
      for (const lang of ['ru', 'tr', 'en']) {
        const local = localizePersona(p, lang)
        expect(local.name).toBeTruthy()
        expect(local.bio).toBeTruthy()
        expect(local.tags.length).toBeGreaterThan(0)
      }
    }
  })

  it('localizes legacy flat personas too', () => {
    const legacy = { code: 'x', age: 21, name_ru: 'Икс', name_tr: 'X', tags_ru: ['a'], bio_ru: 'b', tagline_ru: 't' }
    expect(localizePersona(legacy, 'ru')).toMatchObject({ name: 'Икс', tags: ['a'] })
  })
})
