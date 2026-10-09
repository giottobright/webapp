import React, { useState, useEffect, useRef } from 'react'
import { Camera, Check, Crown, MessageCircle, Mic, Pencil, RotateCw, UserRound, Video } from 'lucide-react'
import { apiFetch, getTelegramUser, haptic, insideTelegram } from '../utils/api'
import { formatDate, formatNumber, t } from '../i18n'
import { PersonaAvatar, Skeleton } from './ui'

export const MIN_AGE = 18
export const MAX_AGE = 120

export function validAge(value) {
  const age = Number.parseInt(value, 10)
  return Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE
}

function Avatar({ name }) {
  const [broken, setBroken] = useState(false)
  const photo = getTelegramUser().photo_url
  const initial = (String(name || getTelegramUser().first_name || '').trim()[0] || '?').toUpperCase()
  return (
    <div className="profile-avatar" aria-hidden="true">
      {photo && !broken
        ? <img src={photo} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
        : <span>{initial}</span>}
    </div>
  )
}

function Stat({ icon, value, label, lang }) {
  return (
    <div className="stat">
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <span className="stat-value">{formatNumber(value, lang)}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function UsageBar({ label, period, icon, used, limit, lang }) {
  const unlimited = limit === -1
  const unavailable = limit === 0
  const pct = unlimited || unavailable ? 0 : Math.min(100, (used / limit) * 100)
  const full = !unlimited && !unavailable && used >= limit
  return (
    <li className={`usage ${full ? 'is-full' : ''} ${unavailable ? 'is-unavailable' : ''}`}>
      <div className="usage-top">
        <span className="usage-label">
          <span className="usage-icon" aria-hidden="true">{icon}</span>
          {label}
          <span className="usage-period">· {period}</span>
        </span>
        <span className="usage-count">
          {unavailable ? t(lang, 'profile.unavailableOnPlan') : `${used} / ${unlimited ? '∞' : limit}`}
        </span>
      </div>
      {!unavailable && (
        <div
          className="usage-track"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={unlimited ? undefined : limit}
          aria-valuenow={used}
        >
          <div className="usage-fill" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      )}
    </li>
  )
}

export default function ProfilePage({ lang, personas = [], onUpgrade }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const savedTimer = useRef(null)

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  useEffect(() => {
    if (!insideTelegram()) {
      setError(t(lang, 'common.openInTelegram'))
      setLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    apiFetch('/api/profile/me', { signal: controller.signal })
      .then(({ ok, status, data }) => {
        if (ok && data?.profile) {
          setProfile(data.profile)
          setName(data.profile.name || '')
          setAge(data.profile.age || '')
        } else {
          setError(status === 0 ? t(lang, 'common.offline') : t(lang, 'common.error'))
        }
        setLoading(false)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [lang, reloadKey])

  const handleSave = async (event) => {
    event?.preventDefault()
    const body = {}
    if (name.trim()) body.name = name.trim()
    if (age !== '' && age !== null) {
      if (!validAge(age)) { setFormError(t(lang, 'profile.ageError')); haptic('error'); return }
      body.age = Number.parseInt(age, 10)
    }
    setFormError(null)
    if (!Object.keys(body).length) { setEditing(false); return }
    setSaving(true)
    const { ok } = await apiFetch('/api/profile/me', { method: 'POST', body })
    setSaving(false)
    if (!ok) { haptic('error'); setFormError(t(lang, 'common.error')); return }
    haptic('success')
    setEditing(false)
    setSaved(true)
    clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaved(false), 2500)
    setProfile((prev) => ({ ...prev, name: body.name ?? prev?.name, age: body.age ?? prev?.age }))
  }

  if (loading) {
    return (
      <div className="profile" aria-busy="true" aria-label={t(lang, 'common.loading')}>
        <div className="profile-head">
          <Skeleton className="profile-avatar" />
          <Skeleton className="skeleton-line" style={{ width: 140 }} />
        </div>
        <Skeleton className="stats-skeleton" />
        <Skeleton className="usage-skeleton" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile">
        <div className="state">
          <div className="state-icon" aria-hidden="true"><UserRound size={28} /></div>
          <h2 className="state-title">{t(lang, 'profile.unavailable')}</h2>
          {error && <p className="state-text">{error}</p>}
          {insideTelegram() && (
            <button type="button" className="btn btn-secondary btn-md" onClick={() => setReloadKey((k) => k + 1)}>
              <RotateCw size={18} />
              <span>{t(lang, 'common.retry')}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  const plan = profile.plan || 'free'
  const companion = personas.find((p) => p.code === profile.persona)
  const usageRows = [
    { kind: 'selfies', icon: <Camera size={16} />, label: t(lang, 'profile.selfies') },
    { kind: 'videos', icon: <Video size={16} />, label: t(lang, 'profile.videos') },
    { kind: 'voices', icon: <Mic size={16} />, label: t(lang, 'profile.voice') },
  ]

  return (
    <div className="profile">
      <header className="profile-head">
        <Avatar name={profile.name} />
        <h1 className="profile-name">{profile.name || t(lang, 'profile.noName')}</h1>
        <div className="profile-meta">
          <span className={`plan-chip plan-chip-${plan}`}>{t(lang, `plan.${plan}`)}</span>
          {profile.created_at && <span>{t(lang, 'profile.since', { date: formatDate(profile.created_at, lang) })}</span>}
        </div>
      </header>

      {companion && (
        <section className="card companion">
          <PersonaAvatar code={companion.code} name={companion.name} size={44} />
          <div>
            <div className="companion-label">{t(lang, 'profile.companion')}</div>
            <div className="companion-name">{companion.name}, {companion.age}</div>
          </div>
        </section>
      )}

      <section className="profile-section">
        <h2 className="section-title">{t(lang, 'profile.stats')}</h2>
        <div className="stats-grid">
          <Stat lang={lang} icon={<MessageCircle size={18} />} value={profile.stats?.total_messages} label={t(lang, 'profile.messages')} />
          <Stat lang={lang} icon={<Camera size={18} />} value={profile.stats?.total_selfies} label={t(lang, 'profile.selfies')} />
          <Stat lang={lang} icon={<Video size={18} />} value={profile.stats?.total_videos} label={t(lang, 'profile.videos')} />
          <Stat lang={lang} icon={<Mic size={18} />} value={profile.stats?.total_voice} label={t(lang, 'profile.voice')} />
        </div>
      </section>

      <section className="profile-section">
        <h2 className="section-title">{t(lang, 'profile.usage')}</h2>
        <ul className="card usage-list">
          {usageRows.map((row) => {
            const usage = profile.today?.[row.kind] || { used: 0, limit: 0, period: 'day' }
            const period = usage.period === 'week' ? t(lang, 'profile.perWeek') : t(lang, 'profile.perDay')
            return <UsageBar key={row.kind} lang={lang} icon={row.icon} label={row.label} period={period} used={usage.used} limit={usage.limit} />
          })}
        </ul>
        {plan !== 'vip' && onUpgrade && (
          <button type="button" className="btn btn-gold-ghost btn-md btn-block" onClick={onUpgrade}>
            <Crown size={18} />
            <span>{t(lang, 'profile.upgrade')}</span>
          </button>
        )}
      </section>

      <section className="profile-section">
        <h2 className="section-title">{t(lang, 'profile.edit')}</h2>
        {editing ? (
          <form className="card profile-form" onSubmit={handleSave} noValidate>
            <label className="field">
              <span className="field-label">{t(lang, 'profile.name')}</span>
              <input
                className="field-input" value={name} maxLength={255} autoComplete="given-name"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">{t(lang, 'profile.age')}</span>
              <input
                className="field-input" type="number" inputMode="numeric" min={MIN_AGE} max={MAX_AGE} value={age}
                aria-invalid={formError === t(lang, 'profile.ageError') || undefined}
                aria-describedby={formError ? 'profile-form-error' : undefined}
                onChange={(e) => setAge(e.target.value)}
              />
            </label>
            {formError && <p className="field-error" id="profile-form-error" role="alert">{formError}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-md" disabled={saving} aria-busy={saving}>
                {saving ? t(lang, 'common.saving') : t(lang, 'common.save')}
              </button>
              <button type="button" className="btn btn-secondary btn-md" onClick={() => { setEditing(false); setFormError(null) }}>
                {t(lang, 'common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn btn-secondary btn-md btn-block" onClick={() => { setSaved(false); setEditing(true) }}>
            <Pencil size={17} />
            <span>{t(lang, 'profile.editButton')}</span>
          </button>
        )}
        <p className="saved-note" role="status">
          {saved && <><Check size={16} />{t(lang, 'profile.saved')}</>}
        </p>
      </section>

      <section className="profile-section">
        <h2 className="section-title">{t(lang, 'profile.info')}</h2>
        <dl className="card settings-list">
          <div className="settings-row">
            <dt>{t(lang, 'profile.refBonus')}</dt>
            <dd><span className="value-strong">+{profile.referral_bonus_selfies ?? 0}</span> <Camera size={15} className="inline-icon" /></dd>
          </div>
          <div className="settings-row">
            <dt>{t(lang, 'profile.proactive')}</dt>
            <dd><Toggle on={profile.proactive_enabled} lang={lang} /></dd>
          </div>
          <div className="settings-row">
            <dt>{t(lang, 'profile.voiceReplies')}</dt>
            <dd><Toggle on={profile.voice_enabled} lang={lang} /></dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

function Toggle({ on, lang }) {
  return <span className={`status ${on ? 'is-on' : ''}`}>{t(lang, on ? 'common.on' : 'common.off')}</span>
}
