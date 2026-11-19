// Простой функционал: подключение + отправка текста/медиа.
// Интеграция с WhiskeySockets/Baileys:
import { buildMessage } from '../src/Lib/Builders';

async function main() {
  // const { state } = await useMultiFileAuthState('./auth'); // из @whiskeysockets/baileys
  // const sock = makeWASocket({ auth: state });
  const jid = '79000000000@s.whatsapp.net';
  // 1) простой текст
  // await sock.sendMessage(jid, { text: 'Привет из моего форка Baileys!' });
  // 2) сообщение с кнопками через builder этого форка
  const payload = buildMessage(
    [
      { type: 'quick', id: 'yes', text: 'Да' },
      { type: 'quick', id: 'no', text: 'Нет' },
      { type: 'url', text: 'Узнать больше', url: 'https://example.com' },
    ],
    'Вам нравится новый WhatsApp?'
  );
  console.log(JSON.stringify(payload, null, 2));
}
main().catch(console.error);
