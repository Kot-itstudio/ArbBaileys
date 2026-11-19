/**
 * Подсистема стикеров.
 * - Конвейер на FFmpeg вместо Jimp — по мотивам @arceos/baileys.
 * - Метаданные паков (name/author/pack_id) и анимированные стикеры —
 *   как в WhiskeySockets/Baileys (prepareMessage 'sticker') и Itsukichann.
 * - Стикеры из паков WhatsApp+ (wa_plus flag) — расширение этого форка.
 */

import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import { StickerMetadata, PinnedStickerOptions } from '../Types';

export interface StickerConvertOptions {
  inputPath: string;          // png/jpg/gif/webp/mp4…
  isAnimated?: boolean;       // webp-анимация / lottie
  sizePx?: number;            // сторона квадрата, по умолчанию 512
  metadata?: StickerMetadata;
  pin?: PinnedStickerOptions; // закрепить под сообщением
}

/**
 * Конвертирует входной файл в WebP-стикер через нативный FFmpeg
 * (без тяжёлой Jimp — подход @arceos/baileys).
 * Возвращает base64 готового стикера.
 */
export async function toStickerWebp(opts: StickerConvertOptions): Promise<string> {
  const size = opts.sizePx ?? 512;
  const out = join(tmpdir(), `sticker_${randomBytes(6).toString('hex')}.webp`);
  const args = [
    '-y',
    '-i', opts.inputPath,
    '-vf', `scale=${size}:${size}:force_original_aspect_ratio=decrease,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2`,
    ...(opts.isAnimated ? ['-loop', '0', '-disposition:v', 'animated'] : []),
    '-frames:v', opts.isAnimated ? '0' : '1',
    '-webp_preset', 'photo',
    out,
  ];

  await new Promise<void>((resolve, reject) => {
    const p = spawn('ffmpeg', args, { stdio: 'ignore' });
    p.on('error', reject);
    p.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))
    );
  });

  try {
    return readFileSync(out).toString('base64');
  } finally {
    try { unlinkSync(out); } catch { /* ignore */ }
  }
}

/**
 * Собирает payload стикера с метаданными пака (включая паки WhatsApp+)
 * и опциональным закреплением под сообщением.
 */
export function stickerPayload(
  base64OrUrl: string,
  meta?: StickerMetadata,
  pin?: PinnedStickerOptions
): any {
  const sticker = /^https?:\/\//.test(base64OrUrl)
    ? { url: base64OrUrl }
    : { base64: base64OrUrl };

  const msg: any = { sticker, contextInfo: {} as Record<string, any> };

  if (meta) {
    msg.metadata = {
      pack_id: meta.packId,
      pack: meta.packName,
      author: meta.author,
      name: meta.name,
      animated: !!meta.isAnimated,
      wa_plus: !!meta.fromWaPlus,
      emoji: meta.emoji,
    };
  }

  if (pin?.pinUnderMessageId) {
    msg.contextInfo.sticker_pinned_under = { message_id: pin.pinUnderMessageId };
    msg.quote = { key: { id: pin.pinUnderMessageId } };
  } else if (pin?.replyTo) {
    msg.quote = { key: { id: pin.replyTo } };
  }

  return msg;
}
