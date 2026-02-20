import React, { useState, useEffect } from 'react'
import { API_BASE, getTg, getUserId, getLang } from '../utils/api'

export default function ProfilePage() {
  const lang = getLang()
  const tg = getTg()
  const userId = getUserId()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userId) {
      console.warn('ProfilePage: no userId available', {
        tg: !!tg,
        initData: tg?.initData?.substring(0, 50),
        initDataUnsafe: tg?.initDataUnsafe,
      })
      setError(lang === 'ru' ? 'Не удалось определить пользователя' : 'Kullanıcı belirlenemedi')
      setLoading(false)
      return
    }
    const url = `${API_BASE}/api/profile/${userId}`
    console.log('ProfilePage: fetching', url)
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (data.ok) {
          setProfile(data.profile)
          setName(data.profile.name || '')
          setAge(data.profile.age || '')
        } else {
          console.error('ProfilePage: API returned ok=false', data)
          setError(data.error || (lang === 'ru' ? 'Ошибка загрузки' : 'Yükleme hatası'))
        }
      })
      .catch(err => {
        console.error('ProfilePage: fetch failed', err)
        setError(lang === 'ru' ? 'Ошибка подключения к серверу' : 'Sunucuya bağlanılamadı')
      })
      .finally(() => setLoading(false))
  }, [userId])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const body = {}
      if (name.trim()) body.name = name.trim()
      if (age && parseInt(age) >= 13) body.age = parseInt(age)
      const saveId = userId || getUserId()
      if (!saveId) return
      await fetch(`${API_BASE}/api/profile/${saveId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      try { tg?.HapticFeedback?.notificationOccurred('success') } catch (_) {}
      setEditing(false)
      setProfile(prev => ({ ...prev, name: body.name || prev?.name, age: body.age || prev?.age }))
    } catch (_) {}
    setSaving(false)
  }

  const fmtLimit = (val) => val === -1 ? '∞' : String(val)

  if (loading) {
    return (
      <div className="profile-page page-enter">
        <div className="profile-header-block"><div className="spinner"></div></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-page page-enter">
        <div className="profile-header-block">
          <h2>{lang === 'ru' ? 'Профиль недоступен' : 'Profil bulunamadı'}</h2>
          {error && <p style={{ color: '#999', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>}
          {!userId && (
            <p style={{ color: '#777', fontSize: '0.8rem', marginTop: 8 }}>
              {lang === 'ru'
                ? 'Откройте приложение через Telegram бота'
                : 'Uygulamayı Telegram botu üzerinden açın'}
            </p>
          )}
        </div>
      </div>
    )
  }

  const planLabel = { free: lang === 'ru' ? 'Бесплатный' : 'Ücretsiz', premium: 'Premium', vip: 'VIP' }
  const planName = planLabel[profile.plan] || profile.plan

  return (
    <div className="profile-page page-enter">
      <div className="profile-header-block">
        <div className="profile-avatar">{profile.persona ? profile.persona[0].toUpperCase() : '👤'}</div>
        <h2 className="profile-name">{profile.name || (lang === 'ru' ? 'Без имени' : 'İsimsiz')}</h2>
        <div className="profile-plan-badge">{planName}</div>
      </div>

      {/* Stats */}
      <div className="profile-section">
        <h3 className="profile-section-title">{lang === 'ru' ? 'Статистика' : 'İstatistikler'}</h3>
        <div className="profile-stats-grid">
          <div className="profile-stat">
            <span className="profile-stat-val">{profile.stats?.total_messages ?? 0}</span>
            <span className="profile-stat-lbl">{lang === 'ru' ? 'Сообщений' : 'Mesaj'}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-val">{profile.stats?.total_selfies ?? 0}</span>
            <span className="profile-stat-lbl">{lang === 'ru' ? 'Селфи' : 'Selfie'}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-val">{profile.stats?.total_videos ?? 0}</span>
            <span className="profile-stat-lbl">{lang === 'ru' ? 'Видео' : 'Video'}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-val">{profile.stats?.total_voice ?? 0}</span>
            <span className="profile-stat-lbl">{lang === 'ru' ? 'Голосовых' : 'Sesli'}</span>
          </div>
        </div>
      </div>

      {/* Today's usage */}
      <div className="profile-section">
        <h3 className="profile-section-title">{lang === 'ru' ? 'Сегодня' : 'Bugün'}</h3>
        <div className="profile-usage-list">
          <UsageBar label={lang === 'ru' ? 'Селфи' : 'Selfie'} icon="📸"
            used={profile.today?.selfies?.used ?? 0}
            limit={profile.today?.selfies?.limit ?? 3} />
          <UsageBar label={lang === 'ru' ? 'Видео' : 'Video'} icon="🎬"
            used={profile.today?.videos?.used ?? 0}
            limit={profile.today?.videos?.limit ?? 1} />
          <UsageBar label={lang === 'ru' ? 'Голосовые' : 'Sesli'} icon="🎤"
            used={profile.today?.voices?.used ?? 0}
            limit={profile.today?.voices?.limit ?? 5} />
        </div>
      </div>

      {/* Edit profile */}
      <div className="profile-section">
        <h3 className="profile-section-title">{lang === 'ru' ? 'Редактировать' : 'Düzenle'}</h3>
        {editing ? (
          <div className="profile-edit-form">
            <input className="profile-input" placeholder={lang === 'ru' ? 'Имя' : 'İsim'}
              value={name} onChange={e => setName(e.target.value)} />
            <input className="profile-input" placeholder={lang === 'ru' ? 'Возраст' : 'Yaş'}
              type="number" min="13" max="120" value={age} onChange={e => setAge(e.target.value)} />
            <div className="profile-edit-actions">
              <button className="profile-btn profile-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? '...' : (lang === 'ru' ? 'Сохранить' : 'Kaydet')}
              </button>
              <button className="profile-btn profile-btn-cancel" onClick={() => setEditing(false)}>
                {lang === 'ru' ? 'Отмена' : 'İptal'}
              </button>
            </div>
          </div>
        ) : (
          <button className="profile-btn profile-btn-edit" onClick={() => setEditing(true)}>
            {lang === 'ru' ? '✏️ Редактировать профиль' : '✏️ Profili düzenle'}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="profile-section">
        <h3 className="profile-section-title">{lang === 'ru' ? 'Информация' : 'Bilgi'}</h3>
        <div className="profile-info-list">
          <div className="profile-info-row">
            <span>{lang === 'ru' ? 'Бонус рефералов' : 'Davet bonusu'}</span>
            <span>+{profile.referral_bonus_selfies ?? 0} 📸</span>
          </div>
          <div className="profile-info-row">
            <span>{lang === 'ru' ? 'Проактивные' : 'Proaktif'}</span>
            <span>{profile.proactive_enabled ? '✅' : '❌'}</span>
          </div>
          <div className="profile-info-row">
            <span>{lang === 'ru' ? 'Голосовые ответы' : 'Sesli yanıtlar'}</span>
            <span>{profile.voice_enabled ? '✅' : '❌'}</span>
          </div>
          {profile.created_at && (
            <div className="profile-info-row">
              <span>{lang === 'ru' ? 'С нами с' : 'Kayıt tarihi'}</span>
              <span>{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UsageBar({ label, icon, used, limit }) {
  const unlimited = limit === -1
  const pct = unlimited ? 0 : (limit > 0 ? Math.min(100, (used / limit) * 100) : 0)
  const remaining = unlimited ? '∞' : Math.max(0, limit - used)
  return (
    <div className="profile-usage-item">
      <div className="profile-usage-top">
        <span>{icon} {label}</span>
        <span className="profile-usage-count">{used}/{unlimited ? '∞' : limit}</span>
      </div>
      <div className="profile-usage-bar-bg">
        <div className="profile-usage-bar-fill" style={{ width: unlimited ? '0%' : `${pct}%` }}></div>
      </div>
    </div>
  )
}
