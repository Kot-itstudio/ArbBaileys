# План создания проекта: Личный форк WhatsApp Baileys (JS/TS)

## 0. Контекст и цели
Создать личный форк библиотеки Baileys (TypeScript/JavaScript) для работы с протоколом
WhatsApp Web Multi-Device, который:
1. Имеет простой базовый функционал (подключение, чаты, отправка сообщений).
2. Поддерживает «все новинки» WhatsApp Business:
   - HTML/rich-объект в сообщении с кнопкой «Узнать больше» (rich text + cta button);
   - стикеры, закрепляемые под сообщением (pinned sticker / sticker reply);
   - стикеры из WhatsApp+ (кастомные sticker-паки, анимированные stickers);
   - кнопки (quick reply buttons, template buttons);
   - list message (single select, multi-section lists);
   - карусель (horizontal carousel cards);
   - вложенные списки: «list message, в котором кнопки без точек, внутри которых кнопки
     с точками и кнопкой "Выбрать"» — т.е. sections → rows → nested interactive (cta flow);
   - звонки (VoIP call offer/accept/reject через CallController);
   - реакции, опросы (polls), view-once, ephemeral, location, contacts.
3. Код берётся не «из головы», а собирается из проверенных открытых реализаций.

## 1. Источники кода (по ТЗ)
Приоритет заимствования фрагментов (репозитории указаны пользователем):
- WhiskeySockets/Baileys — ядро протокола (auth, keys, noise, WABinary, msg/encode-decode).
- wppconnect-team/baileys — интеграционные правки WPPConnect.
- Itsukichann/Baileys — расширенные интерактивные кнопки/списки/медиа.
- zervidas/baileys-pro — обёртки buttons/single_select/альбомы/карусели (cards).
- fadzzzslebew/baileys — Shop Flow, Native Flow, карусели, бизнес-компоненты.
- innovatorssoft/Baileys — rich-ответы (HTML/таблицы), VoIP-звонки, аудиопотоки.
- itsliaaa/baileys — лёгкая база v7, альбомы, payment requests.
- @arceos/baileys — медиа-конвейер на FFmpeg вместо Jimp.
- fazer-ai/baileys-api — REST-слой (Bun/Elysia) как референс API (не обязательная зависимость).
- WhiskeySockets/BaileysCSharp — кросс-проверка структур protobuf-сообщений.

Примечание: доступ к сети/GitHub в текущей среде ограничен, поэтому структура пакетов
и форматы протокольных объектов воспроизводятся по публичной документации перечисленных
проектов; при наличии интернета фрагменты копируются напрямую из их исходников.

## 2. Структура проекта
```
/workspace
├── PLAN.md                  # этот план
├── README.md                # документация + примеры «новостинок»
├── package.json             # имя: @personal/baileys-plus, TS-сборка
├── tsconfig.json            # ES2020, strict, declaration
├── src/
│   ├── index.ts             # экспорт makeWASocket и всего API
│   ├── Types/Message.ts     # типы: Button, ListRow, Section, CarouselCard, Flow, Sticker...
│   ├── Lib/Builders.ts      # конструкторы всех интерактивных payload'ов
│   ├── Lib/RichText.ts      # HTML/rich-текст + кнопка «Узнать больше»
│   ├── Lib/Stickers.ts      # стикеры: закрепление под сообщением, паки, WA+
│   ├── Lib/Calls.ts         # VoIP: offer/accept/reject/end (CallController)
│   └── Store/Memory.ts      # MemoryStore (чаты, контакты, сообщения)
├── examples/
│   ├── basic.ts             # подключение + текст/медиа
│   ├── buttons.ts           # quick-reply + URL («узнать больше»)
│   ├── list-message.ts      # single/multi-select, вложенные секции
│   ├── carousel.ts          # горизонтальная карусель карточек
│   ├── flow-nested.ts       # Native Flow: экраны, кнопки без точек/с точками, «Выбрать»
│   ├── stickers.ts          # sticker + pinned-sticker под сообщением, пак из WC+
│   └── calls.ts             # исходящий/входящий звонок
└── dist/                    # результат tsc
```

## 3. Этапы работ
1. **Каркас**: package.json, tsconfig, index.ts, MemoryStore (уже частично есть — дополнить).
2. **Типы** (`Types/Message.ts`): полный набор интерфейсов под все новинки.
3. **Билдеры** (`Lib/Builders.ts`):
   - buildMessage (quick/url/list), buildList (sections/rows), buildCarousel (cards),
   - buildRichHtml (HTML-объект + cta «Узнать больше»),
   - buildNestedFlow (экраны Native Flow: header, buttons without bullet, radio-list
     «кнопки с точками», submit-кнопка «Выбрать»),
   - buildPinnedSticker (sticker с contextInfo/pin под сообщением).
4. **Подсистемы**: RichText, Stickers, Calls — отдельные модули.
5. **Примеры**: по одному TS-скрипту на каждую фичу.
6. **Проверка**: `npx tsc --noEmit` — проект должен компилироваться без ошибок.
7. **README**: таблица «фича → какой форк-источник → как использовать».

## 4. Критерии приёмки
- `npm run build` проходит.
- Каждый пункт «новинок» из ТЗ имеет типизацию, builder и рабочий пример.
- Никаких заглушек вида TODO в публичном API.
