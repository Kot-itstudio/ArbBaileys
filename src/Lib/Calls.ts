/**
 * Подсистема VoIP-звонков (WhatsApp Call).
 * Сигналинг-структуры (call-id, status, ICE) — по WhiskeySockets/Baileys
 * (CallController) и экспериментальному VoIP-слою innovatorssoft/Baileys.
 * Реальный медиа-поток требует WebRTC-транспорта; здесь — управляющий слой.
 */

import { EventEmitter } from 'events';
import { CallEvent, CallOfferOptions } from '../Types';

export interface CallSignalNode {
  tag: string;          // base64 call-id
  from: string;
  to: string;
  status: string;       // 'offer' | 'accept' | 'reject' | 'preaccept' | 'hangout' | 'terminate'
  isGroup: boolean;
  video: boolean;
  /** ICE-параметры (candidate/username/password) из SDP-обмена */
  ice?: Array<{ candidate: string }>;
}

/** Разбор `<call>` узла WABinary в типизированное событие. */
export function parseCallNode(node: any): CallEvent | null {
  if (!node || node.tag !== 'call') return null;
  const child = node.content?.[0];
  const status: string = child?.tag || node.attrs?.call_child_tag || 'offer';
  return {
    id: node.attrs.call_id ?? child?.attrs?.call_id ?? '',
    from: node.attrs.from ?? '',
    to: node.attrs.to ?? '',
    status: status as CallEvent['status'],
    isGroup: node.attrs.is_group === 'true',
    video: node.attrs.video === 'true',
    offline: node.attrs.offline === 'true',
    timestamp: Number(node.attrs.t ?? Date.now() / 1000),
  };
}

/**
 * Контроллер звонков: отправка offer, приём/отклонение входящих, завершение.
 * Транспортные сообщения отправляются через переданный `sendNode`
 * (в интеграции — sock.query / ws.send из Baileys).
 */
export class CallController extends EventEmitter {
  private active = new Map<string, CallEvent>();

  constructor(private sendNode: (node: any) => void, private ownJid: string) {
    super();
  }

  /** Ответ клиента на <call> от сервера. */
  onIncoming(call: CallEvent): void {
    this.active.set(call.id, call);
    this.emit(call.status, call);
  }

  /** Предложить звонок (audio/video). */
  offer(toJid: string, opts: CallOfferOptions = {}): CallEvent {
    const id = Buffer.from(Math.floor(Math.random() * 1e15).toString()).toString('base64');
    const node = {
      tag: 'call',
      attrs: { from: this.ownJid, to: toJid, call_id: id, video: opts.video ? 'true' : 'false' },
      content: [{ tag: 'offer', attrs: { from: this.ownJid, to: toJid } }],
    };
    this.sendNode(node);
    const ev: CallEvent = {
      id, from: this.ownJid, to: toJid, status: 'offer',
      isGroup: false, video: !!opts.video, timestamp: Date.now() / 1000,
    };
    this.active.set(id, ev);
    return ev;
  }

  accept(callId: string): void {
    this.sendStatus(callId, 'accept');
  }

  reject(callId: string, reason: 'busy' | 'timeout' | 'reject' = 'reject'): void {
    this.sendStatus(callId, reason);
  }

  end(callId: string): void {
    this.sendStatus(callId, 'terminate');
    this.active.delete(callId);
    this.emit('end', callId);
  }

  /** Отправить ICE-кандидаты после соединения. */
  sendIce(callId: string, candidates: string[]): void {
    this.sendNode({
      tag: 'call',
      attrs: { from: this.ownJid },
      content: [{
        tag: 'ice_check_failed',
        attrs: { call_id: callId },
        content: candidates.map((c) => ({ tag: 'candidate', attrs: { candidate: c } })),
      }],
    });
  }

  get activeCalls(): CallEvent[] {
    return [...this.active.values()];
  }

  private sendStatus(callId: string, status: string): void {
    this.sendNode({
      tag: 'call',
      attrs: { from: this.ownJid },
      content: [{ tag: status, attrs: { call_id: callId } }],
    });
  }
}
