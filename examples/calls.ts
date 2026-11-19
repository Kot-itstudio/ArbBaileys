// VoIP-звонки: исходящий offer, приём/отклонение входящего.
import { CallController, parseCallNode } from '../src/Lib/Calls';

const sent: any[] = [];
const calls = new CallController((node) => sent.push(node), '79000000000:12@s.whatsapp.net');

calls.on('offer', (c) => {
  console.log('Входящий звонок:', c.from, c.video ? 'video' : 'audio');
  calls.accept(c.id); // или calls.reject(c.id, 'busy')
});

// Исходящий видеозвонок
const ev = calls.offer('79001112233@s.whatsapp.net', { video: true });
setTimeout(() => calls.end(ev.id), 30_000);

// Разбор <call>-узла из WABinary-потока Baileys
const node = { tag: 'call', attrs: { call_id: 'AAA=', from: 'x@s.whatsapp.net', video: 'true' }, content: [{ tag: 'offer', attrs: {} }] };
console.log(parseCallNode(node), JSON.stringify(sent));
