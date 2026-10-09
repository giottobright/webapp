import React, { useState, useEffect } from 'react'
import { apiFetch, haptic, insideTelegram } from '../utils/api'
import { formatDate, t } from '../i18n'

export const MIN_AGE = 18
export const MAX_AGE = 120

export function validAge(value) {
  const age = Number.parseInt(value, 10)
  return Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE
}

export default function ProfilePage({ lang }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!insideTelegram()) {
      setError(t(lang, 'common.openInTelegram'))
      setLoading(false)
      return
    }
    apiFetch('/api/profile/me')
      .then(({ ok, status, data }) => {
        if (ok) {
          setProfile(data.profile)
          setName(data.profile.name || '')
          setAge(data.profile.age || '')
        } else {
          setError(status === 0 ? t(lang, 'common.offline') : t(lang, 'common.error'))
        }
      })
      .finally(() => setLoading(false))
  }, [lang])

  const handleSave = async () => {
    const body = {}
    if (name.trim()) body.name = name.trim()
    if (age !== '' && age !== null) {
      if (!validAge(age)) { setFormError(t(lang, 'profile.ageError')); return }
      body.age = Number.parseInt(age, 10)
    }
    setFormError(null)
    setSaving(true)
    const { ok } = await apiFetch('/api/profile/me', { method: 'POST', body })
    setSaving(false)
    if (!ok) { haptic('error'); setFormError(t(lang, 'common.error')); return }
    haptic('success')
    setEditing(false)
    setProfile((prev) => ({ ...prev, name: body.name ?? prev?.name, age: body.age ?? prev?.age }))
  }

  if (loading) {
    return <div className="profile-page page-enter"><div className="profile-header-block"><div className="spinner"></div></div></div>
  }

  if (!profile) {
    return (
      <div className="profile-page page-enter">
        <div className="profile-header-block">
          <h2>{t(lang, 'profile.unavailable')}</h2>
          {error && <p style={{ color: '#999', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>}
        </div>
      </div>
    )
  }

  const planName = t(lang, `plan.${profile.plan}`)
  const usageRows = [
    { kind: 'selfies', icon: '📸', label: t(lang, 'profile.selfies') },
    { kind: 'videos', icon: '🎬', label: t(lang, 'profile.videos') },
    { kind: 'voices', icon: '🎤', label: t(lang, 'profile.voice') },
  ]

  return (
    <div className="profile-page page-enter">
      <div className="profile-header-block">
        <div className="profile-avatar">{profile.persona ? profile.persona[0].toUpperCase() : '👤'}</div>
        <h2 className="profile-name">{profile.name || t(lang, 'profile.noName')}</h2>
        <div className="profile-plan-badge">{planName}</div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">{t(lang, 'profile.stats')}</h3>
        <div className="profile-stats-grid">
          <Stat value={profile.stats?.total_messages} label={t(lang, 'profile.messages')} />
          <Stat value={profile.stats?.total_selfies} label={t(lang, 'profile.selfies')} />
          <Stat value={profile.stats?.total_videos} label={t(lang, 'profile.videos')} />
          <Stat value={profile.stats?.total_voice} label={t(lang, 'profile.voice')} />
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">{t(lang, 'profile.usage')}</h3>
        <div className="profile-usage-list">
          {usageRows.map((row) => {
            const usage = profile.today?.[row.kind] || { used: 0, limit: 0, period: 'day' }
            const period = usage.period === 'week' ? t(lang, 'profile.perWeek') : t(lang, 'profile.perDay')
            return <UsageBar key={row.kind} icon={row.icon} label={`${row.label} · ${period}`} used={usage.used} limit={usage.limit} />
          })}
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">{t(lang, 'profile.edit')}</h3>
        {editing ? (
          <div className="profile-edit-form">
            <input className="profile-input" placeholder={t(lang, 'profile.name')} value={name} maxLength={255} onChange={(e) => setName(e.target.value)} />
            <input
              className="profile-input" placeholder={t(lang, 'profile.age')} type="number" inputMode="numeric"
              min={MIN_AGE} max={MAX_AGE} value={age} onChange={(e) => setAge(e.target.value)}
            />
            {formError && <p role="alert" style={{ color: 'var(--rose-soft)', fontSize: '0.85rem' }}>{formError}</p>}
            <div className="profile-edit-actions">
              <button className="profile-btn profile-btn-save" onClick={handleSave} disabled={saving}>{saving ? '...' : t(lang, 'common.save')}</button>
              <button className="profile-btn profile-btn-cancel" onClick={() => { setEditing(false); setFormError(null) }}>{t(lang, 'common.cancel')}</button>
            </div>
          </div>
        ) : (
          <button className="profile-btn profile-btn-edit" onClick={() => setEditing(true)}>{t(lang, 'profile.editButton')}</button>
        )}
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">{t(lang, 'profile.info')}</h3>
        <div className="profile-info-list">
          <div className="profile-info-row"><span>{t(lang, 'profile.refBonus')}</span><span>+{profile.referral_bonus_selfies ?? 0} 📸</span></div>
          <div className="profile-info-row"><span>{t(lang, 'profile.proactive')}</span><span>{profile.proactive_enabled ? '✅' : '❌'}</span></div>
          <div className="profile-info-row"><span>{t(lang, 'profile.voiceReplies')}</span><span>{profile.voice_enabled ? '✅' : '❌'}</span></div>
          {profile.created_at && (
            <div className="profile-info-row"><span>{t(lang, 'profile.since')}</span><span>{formatDate(profile.created_at, lang)}</span></div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="profile-stat">
      <span className="profile-stat-val">{value ?? 0}</span>
      <span className="profile-stat-lbl">{label}</span>
    </div>
  )
}

function UsageBar({ label, icon, used, limit }) {
  const unlimited = limit === -1
  const pct = unlimited || limit <= 0 ? 0 : Math.min(100, (used / limit) * 100)
  return (
    <div className="profile-usage-item">
      <div className="profile-usage-top">
        <span>{icon} {label}</span>
        <span className="profile-usage-count">{limit === 0 ? '—' : `${used}/${unlimited ? '∞' : limit}`}</span>
      </div>
      <div className="profile-usage-bar-bg">
        <div className="profile-usage-bar-fill" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  )
}
