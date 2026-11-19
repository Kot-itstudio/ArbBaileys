/**
 * Типы интерактивных сообщений.
 * Форматы payload'ов взяты из: WhiskeySockets/Baileys (interactive),
 * Itsukichann/Baileys (buttons/list), zervidas/baileys-pro (carousel cards),
 * fadzzzslebew/baileys (Native Flow / Shop Flow).
 */

/* ---------- Кнопки ---------- */

export type ButtonType = 'quick' | 'url' | 'list' | 'section';

export interface Button {
  type: ButtonType;
  text?: string;
  id?: string;
  url?: string;
  rows?: Array<{ title: string; description?: string; id?: string }>;
}

/** Карточка горизонтальной карусели (zervidas/baileys-pro, fadzzzslebew/baileys). */
export interface CarouselCard {
  header?: { title?: string; media?: { type: 'image' | 'video'; url: string } };
  body: { text: string };
  footer?: { text: string };
  buttons: CarouselCardButton[]; // 1–2 кнопки на карточку
}

/** Quick-reply кнопка в interactive.type === 'button' (до 3 шт.) */
export interface InteractiveReplyButton {
  buttonId: string;
  buttonText: { displayText: string };
}

/** URL-кнопка «Узнать больше» / cta_button (template / rich) */
export interface CtaUrlButton {
  displayText: string; // например: "Узнать больше"
  url: string;
  mobileUrl?: string;
  /** для template buttons */
  type?: 'url';
  parameters?: Array<{ type: 'text' | 'coupon_code'; text?: string }>;
}

/* ---------- Списки ---------- */

export interface ListRow {
  rowId: string;
  title: string;
  description?: string;
}

export interface ListSection {
  title?: string;
  rows: ListRow[];
}

export interface InteractiveListAction {
  button: string; // подпись кнопки, открывающей список («Выбрать…»)
  sections: ListSection[];
  listTitle?: string;
}

/* ---------- Карусель ---------- */

export interface CarouselCardButton {
  type: 'reply' | 'url' | 'shop' | 'flow';
  label: string;
  id?: string;
  url?: string;
  flowId?: string;
}

export interface CarouselCard {
  header?: { title?: string; media?: { type: 'image' | 'video'; url: string } };
  body: { text: string };
  footer?: { text: string };
  buttons: CarouselCardButton[]; // 1–2 кнопки на карточку
}

export interface CarouselPayload {
  type: 'carousel';
  cards: CarouselCard[]; // до 10 карточек
}

/* ---------- Native Flow (вложенные экраны) ---------- */
/*
 * Сценарий из ТЗ: «list message, в котором кнопки без точек, внутри которых
 * кнопки с точками и кнопкой выбрать» = FlowScreen с:
 *  - FooterWithButtons (кнопки без точек = tapable cells / buttons),
 *  - RadioItemSection / DropdownItemSection (кнопки с точками = radio),
 *  - FooterButton «Выбрать» (mode: submit).
 * Формат json_flow — по fadzzzslebew/baileys и zervidas/baileys-pro.
 */

export type FlowAction = 'nav' | 'action' | 'openURL' | 'back' | 'exit' | 'restart';

export interface FlowNode {
  name: string;
  children: FlowComponent[];
}

export type FlowComponent =
  | FlowHeader
  | FlowBodyComponent
  | FlowFooterComponent;

export interface FlowHeader {
  type: 'header';
  title: string;
  hasCloseIcon?: boolean;
}

export interface FlowText {
  type: 'text';
  text: string;
  variant?: 'heading' | 'body';
}

/** Секция с радио-кнопками («кнопки с точками») */
export interface FlowRadioSection {
  type: 'radio_button_list' | 'dropdown';
  label?: string;
  required?: boolean;
  datareadonly?: boolean;
  values: Array<{ id: string; title: string; description?: string }>;
}

/** Cell без точки — обычная тапабельная строка/кнопка («кнопки без точек») */
export interface FlowTapableCell {
  type: 'tapable_header_cell' | 'editable_footer_button';
  id?: string;
  label: string;
  sublabel?: string;
  onPress?: { type: FlowAction; nextScreen?: string; url?: string };
}

export interface FlowButton {
  type: 'button';
  label: string;
  action: FlowAction;
  nextScreen?: string;
  url?: string;
  downloadFileExtension?: string;
}

export interface FlowFooter {
  type: 'footer';
  buttons: FlowButton[];
}

export type FlowBodyComponent = FlowText | FlowRadioSection | FlowTapableCell;

export interface FlowMetadata {
  version: string; // '3.1'
  screen_type: 'phone' | 'desktop';
}

export interface FlowJson {
  screens: Record<string, FlowNode>;
  metadata?: FlowMetadata;
}

export interface NativeFlowMessage {
  mode: 'single_column' | 'multi_column';
  flowId?: string;     // ID забалансового flow (WhatsApp Business)
  resourceId?: string; // для off-platform flows
  header: string;
  body: string;
  footer: string;
  ctaButtonText: string;      // текст кнопки открытия flow («Выбрать…»)
  flowAction: 'navigate' | 'data_exchange' | 'complete';
  flowStatus?: 'acknowledged' | 'in_progress' | 'completed';
  json?: FlowJson;            // inline flow (для тестов)
  token?: string;             // подписанный токен ответа
}

/* ---------- Rich HTML-объект + «Узнать больше» ---------- */

export interface RichHtmlObject {
  /** HTML-разметка (ограниченный набор тегов WhatsApp: b, i, a, br, ul, li, table) */
  html: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel: string;   // «Узнать больше»
  ctaUrl: string;
}

/* ---------- Стикеры ---------- */

export interface StickerMetadata {
  name?: string;
  author?: string;
  packId?: string;
  packName?: string;
  isAnimated?: boolean;
  /** стикер из паков WhatsApp+ (WA+/plus sticker pack) */
  fromWaPlus?: boolean;
  emoji?: string;
}

export interface PinnedStickerOptions {
  /** закрепить стикер под сообщением (pin-in-thread / sticky reaction) */
  pinUnderMessageId?: string;
  replyTo?: string;
}

/* ---------- Звонки ---------- */

export type CallStatus =
  | 'connect'
  | 'accpet' // историческая опечатка протокола WA сохранена как в Baileys
  | 'reject'
  | 'timeout'
  | 'offer'
  | 'busy'
  | 'end'
  | 'iceCheckFailed';

export interface CallEvent {
  id: string;       // call-id (base64 tag)
  from: string;     // jid
  to: string;
  status: CallStatus;
  isGroup: boolean;
  video: boolean;
  offline?: boolean;
  timestamp: number;
}

export interface CallOfferOptions {
  video?: boolean;
  ringtone?: string;
  /** ICE/DTLS параметры берёт SignalingRepository (innovatorssoft/Baileys VoIP) */
}

/* ---------- Прочее ---------- */

export interface PollCreatePayload {
  name: string;
  values: string[];
  selectableCount?: number;
}

export interface ReactionPayload {
  key: { id: string; remoteJid: string };
  text: string; // emoji
}

export interface MessageOptions {
  caption?: string;
  contextInfo?: any;
  ephemeralDuration?: number;
  viewOnce?: boolean;
  mentions?: string[];
  quoted?: any;
  pinnedSticker?: PinnedStickerOptions;
}
