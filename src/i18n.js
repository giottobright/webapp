/**
 * UI strings for the Mini App. Keys are identical across languages (checked by tests).
 * t(lang, key, vars) — `{name}` placeholders are replaced from `vars`.
 */
export const STRINGS = {
  ru: {
    'nav.girls': 'Девушки', 'nav.shop': 'Магазин', 'nav.friends': 'Друзья', 'nav.profile': 'Профиль', 'nav.premium': 'VIP',
    'girls.title': 'Исследуй', 'girls.online': '{count} онлайн', 'girls.subtitle': 'Выбери девушку и начни увлекательное общение',
    'card.online': 'Онлайн', 'detail.live': 'В реальном времени', 'detail.gifts': '🎁 Твои подарки',
    'detail.start': 'Начать общение', 'detail.shop': '🎁 Магазин подарков',
    'photo.soon': 'Фото скоро',
    'common.loading': 'Загрузка...', 'common.error': 'Ошибка, попробуй ещё раз', 'common.offline': 'Нет связи с сервером',
    'common.openInTelegram': 'Открой приложение через Telegram-бота', 'common.cancel': 'Отмена', 'common.save': 'Сохранить',
    'common.notTelegram': 'Открой Mini App в Telegram, чтобы продолжить',
    'shop.title': '🎁 Магазин подарков', 'shop.for': 'для {name}', 'shop.all': 'Все', 'shop.popular': '⭐ Популярное', 'shop.new': '✨ Новое',
    'shop.free': 'Бесплатно', 'shop.give': '🎁 Подарить', 'shop.empty': 'Магазин пуст', 'shop.emptyCategory': 'Нет подарков в этой категории',
    'shop.allGirls': 'Все девушки', 'shop.toGirls': 'девушкам', 'shop.gifted': '✅ {emoji} {gift} — подарено {name}!',
    'shop.paidGifted': '🎉 Оплачено! Подарок {emoji} {gift} отправлен {name}', 'shop.freeLimit': 'Бесплатный подарок на сегодня уже отправлен. Платные подарки доступны всегда 💝',
    'shop.myGifts': '💝 Мои подарки', 'shop.catalog': '🛍 Каталог', 'shop.paymentCancelled': 'Оплата отменена',
    'mygifts.title': '💝 Мои подарки', 'mygifts.total': 'Всего подарено: {count}', 'mygifts.empty': 'Пока нет подарков',
    'mygifts.emptyHint': 'Подари что-нибудь в магазине — подарок появится здесь', 'mygifts.openShop': '🎁 Открыть магазин', 'mygifts.for': 'для',
    'premium.title': '⭐ Подписки', 'premium.subtitle': 'Разблокируй все возможности', 'premium.current': 'Твой план: ',
    'premium.popular': '🔥 Популярный', 'premium.active': '✅ Активен', 'premium.choose': 'Выбрать план', 'premium.perMonth': '/30 дней',
    'premium.until': 'Действует до {date}', 'premium.renews': 'Продлится {date}', 'premium.paid': '🎉 План {plan} активирован!',
    'premium.cancelled': 'Оплата отменена', 'premium.failed': 'Не удалось открыть оплату, попробуй ещё раз',
    'premium.note': '💡 Оплата через Telegram Stars. Подписка продлевается каждые 30 дней, отменить можно в настройках Telegram.',
    'premium.extend': 'Продлить',
    'ref.title': 'Пригласи друзей', 'ref.subtitle': '+{bonus} селфи за каждого нового друга!', 'ref.invited': 'Приглашено',
    'ref.bonus': 'Бонус 📸', 'ref.yourLink': 'Твоя ссылка', 'ref.copy': '📋 Копировать', 'ref.copied': '✅ Скопировано!', 'ref.share': '📤 Поделиться',
    'ref.how': 'Как это работает?', 'ref.step1': 'Скопируй свою ссылку', 'ref.step2': 'Отправь другу в Telegram',
    'ref.step3': 'Друг впервые запускает бота', 'ref.step4': 'Ты получаешь +{bonus} селфи! 🎉', 'ref.shareText': 'Попробуй HayalKız — AI-девушки для общения!',
    'ref.left': 'Осталось бонусных селфи: {count}',
    'profile.unavailable': 'Профиль недоступен', 'profile.noName': 'Без имени', 'profile.stats': 'Статистика', 'profile.messages': 'Сообщений',
    'profile.selfies': 'Селфи', 'profile.videos': 'Видео', 'profile.voice': 'Голосовых', 'profile.usage': 'Лимиты',
    'profile.perDay': 'сегодня', 'profile.perWeek': 'на этой неделе', 'profile.edit': 'Редактировать', 'profile.editButton': '✏️ Редактировать профиль',
    'profile.name': 'Имя', 'profile.age': 'Возраст (18+)', 'profile.info': 'Информация', 'profile.refBonus': 'Бонус рефералов',
    'profile.proactive': 'Проактивные сообщения', 'profile.voiceReplies': 'Голосовые ответы', 'profile.since': 'С нами с',
    'profile.ageError': 'Возраст должен быть от 18 до 120', 'profile.saved': 'Сохранено',
    'plan.free': 'Бесплатный', 'plan.premium': 'Premium', 'plan.vip': 'VIP',
  },
  tr: {
    'nav.girls': 'Kızlar', 'nav.shop': 'Mağaza', 'nav.friends': 'Davet', 'nav.profile': 'Profil', 'nav.premium': 'VIP',
    'girls.title': 'Keşfet', 'girls.online': '{count} çevrimiçi', 'girls.subtitle': 'Bir kız seç ve heyecanlı sohbete başla',
    'card.online': 'Çevrimiçi', 'detail.live': 'Gerçek zamanlı', 'detail.gifts': '🎁 Hediyelerin',
    'detail.start': 'Sohbete Başla', 'detail.shop': '🎁 Hediye Dükkanı',
    'photo.soon': 'Foto yakında',
    'common.loading': 'Yükleniyor...', 'common.error': 'Bir hata oluştu, tekrar dene', 'common.offline': 'Sunucuya bağlanılamadı',
    'common.openInTelegram': 'Uygulamayı Telegram botu üzerinden aç', 'common.cancel': 'İptal', 'common.save': 'Kaydet',
    'common.notTelegram': 'Devam etmek için Mini App\'i Telegram\'da aç',
    'shop.title': '🎁 Hediye Dükkanı', 'shop.for': '{name} için', 'shop.all': 'Tümü', 'shop.popular': '⭐ Popüler', 'shop.new': '✨ Yeni',
    'shop.free': 'Ücretsiz', 'shop.give': '🎁 Hediye Et', 'shop.empty': 'Mağaza boş', 'shop.emptyCategory': 'Bu kategoride hediye yok',
    'shop.allGirls': 'Tüm kızlar', 'shop.toGirls': 'kızlara', 'shop.gifted': '✅ {emoji} {gift}, {name} için gönderildi!',
    'shop.paidGifted': '🎉 Ödendi! {emoji} {gift}, {name} için gönderildi', 'shop.freeLimit': 'Bugünkü ücretsiz hediyeni gönderdin. Ücretli hediyeler her zaman açık 💝',
    'shop.myGifts': '💝 Hediyelerim', 'shop.catalog': '🛍 Katalog', 'shop.paymentCancelled': 'Ödeme iptal edildi',
    'mygifts.title': '💝 Hediyelerim', 'mygifts.total': 'Toplam hediye: {count}', 'mygifts.empty': 'Henüz hediye yok',
    'mygifts.emptyHint': 'Mağazadan bir hediye gönder, burada görünsün', 'mygifts.openShop': '🎁 Mağazayı Aç', 'mygifts.for': 'için',
    'premium.title': '⭐ Abonelikler', 'premium.subtitle': 'Tüm özelliklerin kilidini aç', 'premium.current': 'Planın: ',
    'premium.popular': '🔥 Popüler', 'premium.active': '✅ Aktif', 'premium.choose': 'Planı Seç', 'premium.perMonth': '/30 gün',
    'premium.until': '{date} tarihine kadar', 'premium.renews': '{date} tarihinde yenilenir', 'premium.paid': '🎉 {plan} planın aktif!',
    'premium.cancelled': 'Ödeme iptal edildi', 'premium.failed': 'Ödeme açılamadı, tekrar dene',
    'premium.note': '💡 Telegram Stars ile ödeme. Abonelik her 30 günde yenilenir, Telegram ayarlarından iptal edebilirsin.',
    'premium.extend': 'Uzat',
    'ref.title': 'Arkadaşlarını Davet Et', 'ref.subtitle': 'Her yeni arkadaş için +{bonus} selfie!', 'ref.invited': 'Davet',
    'ref.bonus': 'Bonus 📸', 'ref.yourLink': 'Senin linkin', 'ref.copy': '📋 Kopyala', 'ref.copied': '✅ Kopyalandı!', 'ref.share': '📤 Paylaş',
    'ref.how': 'Nasıl çalışır?', 'ref.step1': 'Linkini kopyala', 'ref.step2': 'Arkadaşına Telegram\'dan gönder',
    'ref.step3': 'Arkadaşın botu ilk kez başlatır', 'ref.step4': '+{bonus} selfie kazanırsın! 🎉', 'ref.shareText': 'HayalKız\'ı dene — AI kızlarla sohbet!',
    'ref.left': 'Kalan bonus selfie: {count}',
    'profile.unavailable': 'Profil bulunamadı', 'profile.noName': 'İsimsiz', 'profile.stats': 'İstatistikler', 'profile.messages': 'Mesaj',
    'profile.selfies': 'Selfie', 'profile.videos': 'Video', 'profile.voice': 'Sesli', 'profile.usage': 'Limitler',
    'profile.perDay': 'bugün', 'profile.perWeek': 'bu hafta', 'profile.edit': 'Düzenle', 'profile.editButton': '✏️ Profili düzenle',
    'profile.name': 'İsim', 'profile.age': 'Yaş (18+)', 'profile.info': 'Bilgi', 'profile.refBonus': 'Davet bonusu',
    'profile.proactive': 'Proaktif mesajlar', 'profile.voiceReplies': 'Sesli yanıtlar', 'profile.since': 'Kayıt tarihi',
    'profile.ageError': 'Yaş 18 ile 120 arasında olmalı', 'profile.saved': 'Kaydedildi',
    'plan.free': 'Ücretsiz', 'plan.premium': 'Premium', 'plan.vip': 'VIP',
  },
  en: {
    'nav.girls': 'Girls', 'nav.shop': 'Shop', 'nav.friends': 'Friends', 'nav.profile': 'Profile', 'nav.premium': 'VIP',
    'girls.title': 'Discover', 'girls.online': '{count} online', 'girls.subtitle': 'Pick a girl and start an exciting conversation',
    'card.online': 'Online', 'detail.live': 'Real time', 'detail.gifts': '🎁 Your gifts',
    'detail.start': 'Start chatting', 'detail.shop': '🎁 Gift shop',
    'photo.soon': 'Photo coming soon',
    'common.loading': 'Loading...', 'common.error': 'Something went wrong, try again', 'common.offline': 'Cannot reach the server',
    'common.openInTelegram': 'Open the app from the Telegram bot', 'common.cancel': 'Cancel', 'common.save': 'Save',
    'common.notTelegram': 'Open the Mini App in Telegram to continue',
    'shop.title': '🎁 Gift shop', 'shop.for': 'for {name}', 'shop.all': 'All', 'shop.popular': '⭐ Popular', 'shop.new': '✨ New',
    'shop.free': 'Free', 'shop.give': '🎁 Give', 'shop.empty': 'The shop is empty', 'shop.emptyCategory': 'No gifts in this category',
    'shop.allGirls': 'All girls', 'shop.toGirls': 'the girls', 'shop.gifted': '✅ {emoji} {gift} sent to {name}!',
    'shop.paidGifted': '🎉 Paid! {emoji} {gift} sent to {name}', 'shop.freeLimit': 'You already sent today\'s free gift. Paid gifts are always available 💝',
    'shop.myGifts': '💝 My gifts', 'shop.catalog': '🛍 Catalog', 'shop.paymentCancelled': 'Payment cancelled',
    'mygifts.title': '💝 My gifts', 'mygifts.total': 'Gifts sent: {count}', 'mygifts.empty': 'No gifts yet',
    'mygifts.emptyHint': 'Send something from the shop and it will appear here', 'mygifts.openShop': '🎁 Open the shop', 'mygifts.for': 'for',
    'premium.title': '⭐ Subscriptions', 'premium.subtitle': 'Unlock everything', 'premium.current': 'Your plan: ',
    'premium.popular': '🔥 Popular', 'premium.active': '✅ Active', 'premium.choose': 'Choose plan', 'premium.perMonth': '/30 days',
    'premium.until': 'Valid until {date}', 'premium.renews': 'Renews {date}', 'premium.paid': '🎉 {plan} is active!',
    'premium.cancelled': 'Payment cancelled', 'premium.failed': 'Could not open the payment, try again',
    'premium.note': '💡 Paid with Telegram Stars. Renews every 30 days, cancel anytime in Telegram settings.',
    'premium.extend': 'Extend',
    'ref.title': 'Invite friends', 'ref.subtitle': '+{bonus} selfies for every new friend!', 'ref.invited': 'Invited',
    'ref.bonus': 'Bonus 📸', 'ref.yourLink': 'Your link', 'ref.copy': '📋 Copy', 'ref.copied': '✅ Copied!', 'ref.share': '📤 Share',
    'ref.how': 'How does it work?', 'ref.step1': 'Copy your link', 'ref.step2': 'Send it to a friend on Telegram',
    'ref.step3': 'Your friend starts the bot for the first time', 'ref.step4': 'You get +{bonus} selfies! 🎉', 'ref.shareText': 'Try HayalKız — chat with AI girls!',
    'ref.left': 'Bonus selfies left: {count}',
    'profile.unavailable': 'Profile unavailable', 'profile.noName': 'No name', 'profile.stats': 'Stats', 'profile.messages': 'Messages',
    'profile.selfies': 'Selfies', 'profile.videos': 'Videos', 'profile.voice': 'Voice', 'profile.usage': 'Limits',
    'profile.perDay': 'today', 'profile.perWeek': 'this week', 'profile.edit': 'Edit', 'profile.editButton': '✏️ Edit profile',
    'profile.name': 'Name', 'profile.age': 'Age (18+)', 'profile.info': 'Info', 'profile.refBonus': 'Referral bonus',
    'profile.proactive': 'Proactive messages', 'profile.voiceReplies': 'Voice replies', 'profile.since': 'Member since',
    'profile.ageError': 'Age must be between 18 and 120', 'profile.saved': 'Saved',
    'plan.free': 'Free', 'plan.premium': 'Premium', 'plan.vip': 'VIP',
  },
}

export const LOCALES = { ru: 'ru-RU', tr: 'tr-TR', en: 'en-US' }

export function t(lang, key, vars = {}) {
  const table = STRINGS[lang] || STRINGS.en
  let text = table[key] ?? STRINGS.en[key] ?? key
  for (const [name, value] of Object.entries(vars)) {
    text = text.split(`{${name}}`).join(String(value))
  }
  return text
}

/** Pick a localized field from a backend persona card ({name: {ru, tr, en}}) or a legacy local one (name_ru). */
export function localizePersona(persona, lang) {
  const pick = (field) => {
    const value = persona[field]
    if (value && typeof value === 'object' && !Array.isArray(value)) return value[lang] ?? value.en ?? value.tr
    return persona[`${field}_${lang}`] ?? persona[`${field}_tr`] ?? persona[`${field}_ru`] ?? value
  }
  return {
    code: persona.code,
    age: persona.age,
    name: pick('name'),
    tagline: pick('tagline'),
    tags: pick('tags') || [],
    bio: pick('bio'),
  }
}

export function formatDate(value, lang) {
  if (!value) return ''
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(LOCALES[lang] || 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}
