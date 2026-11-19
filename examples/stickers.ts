// Стикеры: обычный, из паков WhatsApp+, закреплённый под сообщением.
import { stickerPayload, toStickerWebp } from '../src/Lib/Stickers';

// 1) стикер по URL с метаданными пака WA+
const waPlus = stickerPayload(
  'https://web.whatsapp.com/sticker/abc.webp',
  { packName: 'Meme Pack+', packId: 'wa_plus_1', author: 'Community', fromWaPlus: true, emoji: '😂' }
);

// 2) стикер, закреплённый под сообщением
const pinned = stickerPayload(
  'https://web.whatsapp.com/sticker/xyz.webp',
  { name: 'Огонь', emoji: '🔥' },
  { pinUnderMessageId: 'BAE5F1234567890' }
);

// 3) конвертация локального gif в анимированный стикер (FFmpeg, без Jimp)
toStickerWebp({ inputPath: './input.gif', isAnimated: true })
  .then((b64) => stickerPayload(b64, { isAnimated: true }));

console.log(JSON.stringify(pinned, null, 2), waPlus.sticker.url);
