import {
  Button,
  CarouselCard,
  CarouselPayload,
  CtaUrlButton,
  FlowJson,
  FlowNode,
  NativeFlowMessage,
  PinnedStickerOptions,
  PollCreatePayload,
  RichHtmlObject,
  StickerMetadata,
} from "../Types";

export interface MessageOptions {
  caption?: string;
  contextInfo?: any;
  ephemeralDuration?: number;
  viewOnce?: boolean;
  pinnedSticker?: PinnedStickerOptions;
}

/**
 * Build a WhatsApp message payload with interactive buttons.
 * Supports quick replies, URL buttons, list rows and sectioned lists.
 */
export function buildMessage(buttons: Button[], text?: string, options?: MessageOptions): any {
  const quickButtons: Array<{ buttonId: string; buttonText: { displayText: string } }> = [];
  const listRows: Array<{ rowId: string; title: string; description?: string }> = [];
  const urlButtons: Array<{ title: string; url: string; mobileUrl?: string }> = [];

  for (const b of buttons) {
    switch (b.type) {
      case 'quick':
        quickButtons.push({
          buttonId: b.id || `btn_${quickButtons.length}`,
          buttonText: { displayText: b.text || '' },
        });
        break;
      case 'url':
        urlButtons.push({
          title: b.text || '',
          url: b.url || '',
          mobileUrl: b.url,
        });
        break;
      case 'list':
        listRows.push({
          rowId: b.id || `row_${listRows.length}`,
          title: b.text || '',
        });
        break;
      case 'section':
        if (b.rows) {
          for (const r of b.rows) {
            listRows.push({
              rowId: r.id || `opt_${listRows.length}`,
              title: r.title,
              description: r.description,
            });
          }
        }
        break;
    }
  }

  const msg: any = {
    text: text || undefined,
  };

  if (quickButtons.length > 0) {
    // Interactive reply buttons (max 3 in WhatsApp)
    msg.interactive = {
      type: 'button',
      body: { text: text || '' },
      action: { buttons: quickButtons.slice(0, 3) },
    };
  }

  if (listRows.length > 0) {
    msg.interactive = {
      type: 'list',
      header: { type: 'plain_text', text: text || '' },
      body: { text: text || '' },
      action: {
        button: 'Select',
        sections: [{ title: 'Options', rows: listRows.slice(0, 10) }],
      },
    };
  }

  if (urlButtons.length > 0) {
    // Attach URL buttons alongside interactive body if present
    msg.url_buttons = urlButtons;
  }

  if (options?.caption) msg.caption = options.caption;
  if (options?.contextInfo) msg.contextInfo = options.contextInfo;
  if (options?.ephemeralDuration) msg.ephemeralDuration = options.ephemeralDuration;

  return msg;
}

/**
 * Build a multi-card carousel message payload.
 */
export function buildCarousel(cards: CarouselCard[], header?: string, body?: string, footer?: string): any {
  const out: any = {
    carousel: { cards },
  };
  if (header) out.header = header;
  if (body) out.body = body;
  if (footer) out.footer = footer;
  return out;
}

/**
 * Build an interactive list message with sections and rows.
 */
export function buildList(
  header: string,
  body: string,
  buttonLabel: string,
  sections: Array<{ title?: string; rows: Array<{ title: string; description?: string; rowId?: string }> }>
): any {
  return {
    interactive: {
      type: 'list',
      header: { type: 'plain_text', text: header },
      body: { text: body },
      action: {
        button: buttonLabel,
        sections: sections.map((s, i) => ({
          title: s.title || `Section ${i + 1}`,
          rows: s.rows.map((r, j) => ({
            rowId: r.rowId || `row_${i}_${j}`,
            title: r.title,
            description: r.description,
          })),
        })),
      },
    },
  };
}

/**
 * HTML/rich-объект в сообщении с кнопкой «Узнать больше».
 * Формат: interactive.type === 'native_flow'-like header + body cta_url_link,
 * по образцу rich-ответов innovatorssoft/Baileys и template CTA из Baileys.
 */
export function buildRichHtml(obj: RichHtmlObject): any {
  const cta: CtaUrlButton = {
    displayText: obj.ctaLabel || 'Узнать больше',
    url: obj.ctaUrl,
    mobileUrl: obj.ctaUrl,
    type: 'url',
  };
  return {
    interactive: {
      type: 'rich_message', // расширение Itsukichann/innovatorssoft для ИИ-ответов
      header: {
        type: 'html',
        html: obj.html,
        title: obj.title,
        subtitle: obj.subtitle,
        media: obj.imageUrl ? { type: 'image', url: obj.imageUrl } : undefined,
      },
      body: { text: stripHtml(obj.html) },
      footer: { text: '' },
      action: { ctaButtons: [cta] },
    },
    // fallback для стандартного протокола: caption + URL-кнопка
    contextInfo: {
      externalAdReply: {
        title: obj.title || '',
        body: obj.subtitle || '',
        thumbnailUrl: obj.imageUrl,
        sourceUrl: obj.ctaUrl,
        renderLargerThumbnail: true,
        mediaType: 1,
      },
    },
  };
}

/** Убирает теги, оставляя текст (для plain-text fallback). */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Карусель карточек (horizontal cards) — формат zervidas/baileys-pro /
 * fadzzzslebew/baileys (до 10 карточек, 1–2 кнопки на карточку).
 */
export function buildCarouselCards(cards: CarouselCard[], footer?: string): CarouselPayload & { footer?: string } {
  if (cards.length > 10) throw new Error('Carousel supports max 10 cards');
  const out: any = { type: 'carousel', cards: cards.slice(0, 10) };
  if (footer) out.footer = { text: footer };
  return out;
}

/**
 * Native Flow: «list message, в котором кнопки без точек, внутри которых
 * кнопки с точками и кнопкой Выбрать».
 * Экран 1: tapable cells (без точек) → навигация;
 * Экран 2: radio_button_list (с точками) + footer button «Выбрать» (submit/nav).
 */
export function buildNestedFlow(opts: {
  header: string;
  body: string;
  footer?: string;
  ctaButtonText?: string;             // например «Выбрать…»
  topLevelButtons: Array<{ id: string; label: string; sublabel?: string }>; // кнопки БЕЗ точек
  radioPerButton: Record<string, Array<{ id: string; title: string; description?: string }>>; // кнопки С точками
  submitLabel?: string;               // «Выбрать»
  flowId?: string;
  json?: boolean;                     // отправлять inline json (demo)
}): NativeFlowMessage & { json?: FlowJson } {
  const screens: Record<string, FlowNode> = {};

  // Стартовый экран: список кнопок без точек
  screens['ROOT'] = {
    name: 'ROOT',
    children: [
      { type: 'header', title: opts.header, hasCloseIcon: true },
      { type: 'text', text: opts.body, variant: 'body' },
      ...opts.topLevelButtons.map((b) => ({
        type: 'tapable_header_cell' as const,
        id: b.id,
        label: b.label,
        sublabel: b.sublabel,
        onPress: { type: 'nav' as const, nextScreen: `RADIO_${b.id}` },
      })),
    ],
  };

  // По одному экрану с radio-списком на каждую кнопку
  for (const [id, values] of Object.entries(opts.radioPerButton)) {
    screens[`RADIO_${id}`] = {
      name: `RADIO_${id}`,
      children: [
        { type: 'header', title: opts.header, hasCloseIcon: false },
        {
          type: 'radio_button_list',
          label: opts.topLevelButtons.find((b) => b.id === id)?.label,
          required: true,
          values,
        },
        {
          type: 'footer',
          buttons: [
            { type: 'button', label: opts.submitLabel || 'Выбрать', action: 'complete' as any, nextScreen: 'ROOT' },
            { type: 'button', label: 'Назад', action: 'back' },
          ],
        },
      ],
    };
  }

  const flow: NativeFlowMessage = {
    mode: 'single_column',
    flowId: opts.flowId,
    header: opts.header,
    body: opts.body,
    footer: opts.footer || '',
    ctaButtonText: opts.ctaButtonText || 'Выбрать…',
    flowAction: 'navigate',
  };

  const result: any = { native_flow: flow };
  if (opts.json !== false) {
    result.json = {
      screens,
      metadata: { version: '3.1', screen_type: 'phone' },
    };
  }
  return result;
}

/**
 * Стикеры: обычный, из паков WhatsApp+ и «закрепляемый под сообщением».
 * Закрепление реализовано через contextInfo (sticker_pinned / reply),
 * как в форках wppconnect и Itsukichann.
 */
export function buildStickerMessage(
  sticker: { url?: string; base64?: string },
  meta?: StickerMetadata,
  pin?: PinnedStickerOptions
): any {
  const msg: any = {
    sticker: sticker.url ? { url: sticker.url } : { base64: sticker.base64 },
    contextInfo: {},
  };
  if (meta?.packId || meta?.fromWaPlus) {
    msg.metadata = {
      pack: meta.packName,
      pack_id: meta.packId,
      author: meta.author,
      name: meta.name,
      animated: !!meta.isAnimated,
      wa_plus: !!meta.fromWaPlus, // стикер из паков WhatsApp+
      emoji: meta.emoji,
    };
  }
  if (pin?.pinUnderMessageId) {
    // стикер, закреплённый под сообщением (sticky/pinned sticker under message)
    msg.contextInfo.sticker_pinned_under = { message_id: pin.pinUnderMessageId };
    msg.quote = { key: { id: pin.pinUnderMessageId } };
  } else if (pin?.replyTo) {
    msg.quote = { key: { id: pin.replyTo } };
  }
  return msg;
}

/** Опрос (poll) — формат pollCreation из WhiskeySockets/Baileys. */
export function buildPoll(poll: PollCreatePayload): any {
  return {
    poll: {
      name: poll.name,
      values: poll.values.map((v) => ({ itemTitle: v })),
      selectableOptionsCount: poll.selectableCount ?? 1,
      durationSeconds: 86400,
    },
  };
}

/** Реакция на сообщение — формат reactionMessage из Baileys. */
export function buildReaction(messageId: string, remoteJid: string, emoji: string): any {
  return {
    key: { id: messageId, remoteJid, fromMe: true },
    reactionMessage: { text: emoji },
  };
}
