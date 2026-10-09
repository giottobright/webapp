/**
 * UI strings for the Mini App. Keys are identical across languages (checked by tests).
 * t(lang, key, vars) — `{name}` placeholders are replaced from `vars`.
 * Labels carry no emoji: icons are drawn by the components (lucide-react).
 */
export const STRINGS = {
  ru: {
    'nav.girls': 'Девушки', 'nav.shop': 'Подарки', 'nav.friends': 'Друзья', 'nav.profile': 'Профиль', 'nav.premium': 'VIP',
    'nav.label': 'Разделы приложения',
    'girls.title': 'Исследуй', 'girls.online': '{count} онлайн', 'girls.subtitle': 'Выбери девушку и начни увлекательное общение',
    'card.online': 'Онлайн', 'card.open': 'Открыть профиль: {name}, {age}',
    'detail.about': 'О себе', 'detail.interests': 'Интересы', 'detail.gifts': 'Твои подарки',
    'detail.start': 'Начать общение', 'detail.shop': 'Подарить подарок', 'detail.photo': 'Фото {n} из {total}',
    'photo.soon': 'Фото скоро',
    'common.loading': 'Загрузка…', 'common.error': 'Ошибка, попробуй ещё раз', 'common.offline': 'Нет связи с сервером',
    'common.openInTelegram': 'Открой приложение через Telegram-бота', 'common.cancel': 'Отмена', 'common.save': 'Сохранить',
    'common.saving': 'Сохраняем…', 'common.close': 'Закрыть', 'common.retry': 'Повторить', 'common.on': 'Вкл', 'common.off': 'Выкл',
    'common.notTelegram': 'Открой Mini App в Telegram, чтобы продолжить', 'common.crashed': 'Что-то пошло не так',
    'common.crashedHint': 'Перезапусти приложение — мы уже разбираемся', 'common.reload': 'Перезапустить',
    'shop.title': 'Подарки', 'shop.subtitle': 'Порадуй её — она обязательно ответит', 'shop.for': 'для {name}',
    'shop.to': 'Кому', 'shop.toAll': 'Всем', 'shop.categories': 'Категории', 'shop.sort': 'Сортировка',
    'shop.all': 'Все', 'shop.popular': 'Популярные', 'shop.new': 'Новые',
    'shop.free': 'Бесплатно', 'shop.give': 'Подарить', 'shop.empty': 'Магазин пока пуст', 'shop.emptyCategory': 'В этой категории пока нет подарков',
    'shop.loadFailed': 'Не удалось загрузить подарки',
    'shop.allGirls': 'Все девушки', 'shop.toGirls': 'девушкам', 'shop.gifted': '{emoji} {gift} — подарено {name}!',
    'shop.paidGifted': 'Оплачено! {emoji} {gift} отправлен {name}', 'shop.freeLimit': 'Бесплатный подарок на сегодня уже отправлен. Платные подарки доступны всегда',
    'shop.myGifts': 'Мои подарки', 'shop.catalog': 'Каталог', 'shop.paymentCancelled': 'Оплата отменена',
    'mygifts.total': 'Всего подарено: {count}', 'mygifts.empty': 'Пока нет подарков',
    'mygifts.emptyHint': 'Подари что-нибудь из каталога — подарок и её ответ появятся здесь', 'mygifts.openShop': 'Открыть каталог', 'mygifts.for': 'для',
    'mygifts.replied': '{name} ответила',
    'premium.title': 'Подписка', 'premium.subtitle': 'Больше селфи, видео и голосовых от твоей девушки', 'premium.current': 'Твой план',
    'premium.popular': 'Популярный', 'premium.active': 'Активен', 'premium.choose': 'Выбрать план', 'premium.perMonth': '/ 30 дней',
    'premium.until': 'Действует до {date}', 'premium.renews': 'Продлится {date}', 'premium.paid': 'План {plan} активирован!',
    'premium.cancelled': 'Оплата отменена', 'premium.failed': 'Не удалось открыть оплату, попробуй ещё раз',
    'premium.loadFailed': 'Не удалось загрузить тарифы',
    'premium.note': 'Оплата через Telegram Stars. Подписка продлевается каждые 30 дней, отменить можно в настройках Telegram.',
    'premium.extend': 'Продлить',
    'ref.title': 'Пригласи друзей', 'ref.subtitle': '+{bonus} селфи за каждого нового друга', 'ref.invited': 'Приглашено',
    'ref.bonus': 'Бонусных селфи', 'ref.yourLink': 'Твоя ссылка', 'ref.copy': 'Копировать', 'ref.copied': 'Скопировано', 'ref.share': 'Поделиться в Telegram',
    'ref.how': 'Как это работает', 'ref.step1': 'Скопируй свою ссылку', 'ref.step2': 'Отправь другу в Telegram',
    'ref.step3': 'Друг впервые запускает бота', 'ref.step4': 'Ты получаешь +{bonus} селфи', 'ref.shareText': 'Попробуй HayalKız — AI-девушки для общения!',
    'ref.left': 'Осталось бонусных селфи: {count}',
    'profile.unavailable': 'Профиль недоступен', 'profile.noName': 'Без имени', 'profile.stats': 'Статистика', 'profile.messages': 'Сообщений',
    'profile.selfies': 'Селфи', 'profile.videos': 'Видео', 'profile.voice': 'Голосовых', 'profile.usage': 'Лимиты',
    'profile.perDay': 'сегодня', 'profile.perWeek': 'на этой неделе', 'profile.unavailableOnPlan': 'нет в плане',
    'profile.upgrade': 'Увеличить лимиты', 'profile.edit': 'Данные', 'profile.editButton': 'Редактировать профиль',
    'profile.name': 'Имя', 'profile.age': 'Возраст (18+)', 'profile.info': 'Настройки', 'profile.refBonus': 'Бонус рефералов',
    'profile.proactive': 'Проактивные сообщения', 'profile.voiceReplies': 'Голосовые ответы', 'profile.since': 'С нами с {date}',
    'profile.companion': 'Твоя девушка', 'profile.ageError': 'Возраст должен быть от 18 до 120', 'profile.saved': 'Сохранено',
    'plan.free': 'Бесплатный', 'plan.premium': 'Premium', 'plan.vip': 'VIP',
  },
  tr: {
    'nav.girls': 'Kızlar', 'nav.shop': 'Hediyeler', 'nav.friends': 'Davet', 'nav.profile': 'Profil', 'nav.premium': 'VIP',
    'nav.label': 'Uygulama bölümleri',
    'girls.title': 'Keşfet', 'girls.online': '{count} çevrimiçi', 'girls.subtitle': 'Bir kız seç ve heyecanlı sohbete başla',
    'card.online': 'Çevrimiçi', 'card.open': 'Profili aç: {name}, {age}',
    'detail.about': 'Hakkımda', 'detail.interests': 'İlgi alanları', 'detail.gifts': 'Hediyelerin',
    'detail.start': 'Sohbete Başla', 'detail.shop': 'Hediye gönder', 'detail.photo': 'Fotoğraf {n} / {total}',
    'photo.soon': 'Foto yakında',
    'common.loading': 'Yükleniyor…', 'common.error': 'Bir hata oluştu, tekrar dene', 'common.offline': 'Sunucuya bağlanılamadı',
    'common.openInTelegram': 'Uygulamayı Telegram botu üzerinden aç', 'common.cancel': 'İptal', 'common.save': 'Kaydet',
    'common.saving': 'Kaydediliyor…', 'common.close': 'Kapat', 'common.retry': 'Tekrar dene', 'common.on': 'Açık', 'common.off': 'Kapalı',
    'common.notTelegram': 'Devam etmek için Mini App\'i Telegram\'da aç', 'common.crashed': 'Bir şeyler ters gitti',
    'common.crashedHint': 'Uygulamayı yeniden başlat, sorunu inceliyoruz', 'common.reload': 'Yeniden başlat',
    'shop.title': 'Hediyeler', 'shop.subtitle': 'Onu mutlu et, mutlaka cevap verecek', 'shop.for': '{name} için',
    'shop.to': 'Kime', 'shop.toAll': 'Herkese', 'shop.categories': 'Kategoriler', 'shop.sort': 'Sıralama',
    'shop.all': 'Tümü', 'shop.popular': 'Popüler', 'shop.new': 'Yeni',
    'shop.free': 'Ücretsiz', 'shop.give': 'Hediye Et', 'shop.empty': 'Mağaza şimdilik boş', 'shop.emptyCategory': 'Bu kategoride henüz hediye yok',
    'shop.loadFailed': 'Hediyeler yüklenemedi',
    'shop.allGirls': 'Tüm kızlar', 'shop.toGirls': 'kızlara', 'shop.gifted': '{emoji} {gift}, {name} için gönderildi!',
    'shop.paidGifted': 'Ödendi! {emoji} {gift}, {name} için gönderildi', 'shop.freeLimit': 'Bugünkü ücretsiz hediyeni gönderdin. Ücretli hediyeler her zaman açık',
    'shop.myGifts': 'Hediyelerim', 'shop.catalog': 'Katalog', 'shop.paymentCancelled': 'Ödeme iptal edildi',
    'mygifts.total': 'Toplam hediye: {count}', 'mygifts.empty': 'Henüz hediye yok',
    'mygifts.emptyHint': 'Katalogdan bir hediye gönder; hediye ve cevabı burada görünecek', 'mygifts.openShop': 'Kataloğu aç', 'mygifts.for': 'için',
    'mygifts.replied': '{name} yanıtladı',
    'premium.title': 'Abonelik', 'premium.subtitle': 'Kızından daha fazla selfie, video ve sesli mesaj', 'premium.current': 'Planın',
    'premium.popular': 'Popüler', 'premium.active': 'Aktif', 'premium.choose': 'Planı Seç', 'premium.perMonth': '/ 30 gün',
    'premium.until': '{date} tarihine kadar', 'premium.renews': '{date} tarihinde yenilenir', 'premium.paid': '{plan} planın aktif!',
    'premium.cancelled': 'Ödeme iptal edildi', 'premium.failed': 'Ödeme açılamadı, tekrar dene',
    'premium.loadFailed': 'Planlar yüklenemedi',
    'premium.note': 'Telegram Stars ile ödeme. Abonelik her 30 günde yenilenir, Telegram ayarlarından iptal edebilirsin.',
    'premium.extend': 'Uzat',
    'ref.title': 'Arkadaşlarını Davet Et', 'ref.subtitle': 'Her yeni arkadaş için +{bonus} selfie', 'ref.invited': 'Davet edilen',
    'ref.bonus': 'Bonus selfie', 'ref.yourLink': 'Senin linkin', 'ref.copy': 'Kopyala', 'ref.copied': 'Kopyalandı', 'ref.share': 'Telegram\'da paylaş',
    'ref.how': 'Nasıl çalışır', 'ref.step1': 'Linkini kopyala', 'ref.step2': 'Arkadaşına Telegram\'dan gönder',
    'ref.step3': 'Arkadaşın botu ilk kez başlatır', 'ref.step4': '+{bonus} selfie kazanırsın', 'ref.shareText': 'HayalKız\'ı dene — AI kızlarla sohbet!',
    'ref.left': 'Kalan bonus selfie: {count}',
    'profile.unavailable': 'Profil bulunamadı', 'profile.noName': 'İsimsiz', 'profile.stats': 'İstatistikler', 'profile.messages': 'Mesaj',
    'profile.selfies': 'Selfie', 'profile.videos': 'Video', 'profile.voice': 'Sesli', 'profile.usage': 'Limitler',
    'profile.perDay': 'bugün', 'profile.perWeek': 'bu hafta', 'profile.unavailableOnPlan': 'planda yok',
    'profile.upgrade': 'Limitleri artır', 'profile.edit': 'Bilgiler', 'profile.editButton': 'Profili düzenle',
    'profile.name': 'İsim', 'profile.age': 'Yaş (18+)', 'profile.info': 'Ayarlar', 'profile.refBonus': 'Davet bonusu',
    'profile.proactive': 'Proaktif mesajlar', 'profile.voiceReplies': 'Sesli yanıtlar', 'profile.since': '{date} tarihinden beri',
    'profile.companion': 'Sohbet ettiğin kız', 'profile.ageError': 'Yaş 18 ile 120 arasında olmalı', 'profile.saved': 'Kaydedildi',
    'plan.free': 'Ücretsiz', 'plan.premium': 'Premium', 'plan.vip': 'VIP',
  },
  en: {
    'nav.girls': 'Girls', 'nav.shop': 'Gifts', 'nav.friends': 'Friends', 'nav.profile': 'Profile', 'nav.premium': 'VIP',
    'nav.label': 'App sections',
    'girls.title': 'Discover', 'girls.online': '{count} online', 'girls.subtitle': 'Pick a girl and start an exciting conversation',
    'card.online': 'Online', 'card.open': 'Open profile: {name}, {age}',
    'detail.about': 'About me', 'detail.interests': 'Interests', 'detail.gifts': 'Your gifts',
    'detail.start': 'Start chatting', 'detail.shop': 'Send a gift', 'detail.photo': 'Photo {n} of {total}',
    'photo.soon': 'Photo coming soon',
    'common.loading': 'Loading…', 'common.error': 'Something went wrong, try again', 'common.offline': 'Cannot reach the server',
    'common.openInTelegram': 'Open the app from the Telegram bot', 'common.cancel': 'Cancel', 'common.save': 'Save',
    'common.saving': 'Saving…', 'common.close': 'Close', 'common.retry': 'Try again', 'common.on': 'On', 'common.off': 'Off',
    'common.notTelegram': 'Open the Mini App in Telegram to continue', 'common.crashed': 'Something went wrong',
    'common.crashedHint': 'Restart the app — we are looking into it', 'common.reload': 'Restart',
    'shop.title': 'Gifts', 'shop.subtitle': 'Make her day — she will always reply', 'shop.for': 'for {name}',
    'shop.to': 'To', 'shop.toAll': 'Everyone', 'shop.categories': 'Categories', 'shop.sort': 'Sort',
    'shop.all': 'All', 'shop.popular': 'Popular', 'shop.new': 'New',
    'shop.free': 'Free', 'shop.give': 'Give', 'shop.empty': 'The shop is empty for now', 'shop.emptyCategory': 'No gifts in this category yet',
    'shop.loadFailed': 'Could not load the gifts',
    'shop.allGirls': 'All girls', 'shop.toGirls': 'the girls', 'shop.gifted': '{emoji} {gift} sent to {name}!',
    'shop.paidGifted': 'Paid! {emoji} {gift} sent to {name}', 'shop.freeLimit': 'You already sent today\'s free gift. Paid gifts are always available',
    'shop.myGifts': 'My gifts', 'shop.catalog': 'Catalog', 'shop.paymentCancelled': 'Payment cancelled',
    'mygifts.total': 'Gifts sent: {count}', 'mygifts.empty': 'No gifts yet',
    'mygifts.emptyHint': 'Send something from the catalog — the gift and her reply will appear here', 'mygifts.openShop': 'Open the catalog', 'mygifts.for': 'for',
    'mygifts.replied': '{name} replied',
    'premium.title': 'Subscription', 'premium.subtitle': 'More selfies, videos and voice notes from your girl', 'premium.current': 'Your plan',
    'premium.popular': 'Popular', 'premium.active': 'Active', 'premium.choose': 'Choose plan', 'premium.perMonth': '/ 30 days',
    'premium.until': 'Valid until {date}', 'premium.renews': 'Renews {date}', 'premium.paid': '{plan} is active!',
    'premium.cancelled': 'Payment cancelled', 'premium.failed': 'Could not open the payment, try again',
    'premium.loadFailed': 'Could not load the plans',
    'premium.note': 'Paid with Telegram Stars. Renews every 30 days, cancel anytime in Telegram settings.',
    'premium.extend': 'Extend',
    'ref.title': 'Invite friends', 'ref.subtitle': '+{bonus} selfies for every new friend', 'ref.invited': 'Invited',
    'ref.bonus': 'Bonus selfies', 'ref.yourLink': 'Your link', 'ref.copy': 'Copy', 'ref.copied': 'Copied', 'ref.share': 'Share in Telegram',
    'ref.how': 'How it works', 'ref.step1': 'Copy your link', 'ref.step2': 'Send it to a friend on Telegram',
    'ref.step3': 'Your friend starts the bot for the first time', 'ref.step4': 'You get +{bonus} selfies', 'ref.shareText': 'Try HayalKız — chat with AI girls!',
    'ref.left': 'Bonus selfies left: {count}',
    'profile.unavailable': 'Profile unavailable', 'profile.noName': 'No name', 'profile.stats': 'Stats', 'profile.messages': 'Messages',
    'profile.selfies': 'Selfies', 'profile.videos': 'Videos', 'profile.voice': 'Voice', 'profile.usage': 'Limits',
    'profile.perDay': 'today', 'profile.perWeek': 'this week', 'profile.unavailableOnPlan': 'not in your plan',
    'profile.upgrade': 'Raise my limits', 'profile.edit': 'Details', 'profile.editButton': 'Edit profile',
    'profile.name': 'Name', 'profile.age': 'Age (18+)', 'profile.info': 'Settings', 'profile.refBonus': 'Referral bonus',
    'profile.proactive': 'Proactive messages', 'profile.voiceReplies': 'Voice replies', 'profile.since': 'Member since {date}',
    'profile.companion': 'Your companion', 'profile.ageError': 'Age must be between 18 and 120', 'profile.saved': 'Saved',
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

/** Gift purchase rows carry name_ru / name_tr / name_en (backend migration 003); missing ones fall back to Turkish. */
export function purchaseName(purchase, lang) {
  if (lang === 'ru') return purchase.name_ru || purchase.name_tr || ''
  if (lang === 'en') return purchase.name_en || purchase.name_tr || purchase.name_ru || ''
  return purchase.name_tr || purchase.name_ru || ''
}

export function formatDate(value, lang) {
  if (!value) return ''
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(LOCALES[lang] || 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatNumber(value, lang) {
  return Number(value || 0).toLocaleString(LOCALES[lang] || 'en-US')
}
