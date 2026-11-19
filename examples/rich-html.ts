// HTML-объект в сообщении с кнопкой «Узнать больше».
import { buildRichHtml } from '../src/Lib/Builders';
import { buildRichReply } from '../src/Lib/RichText';

const htmlMsg = buildRichHtml({
  html: '<b>Отчёт за ноябрь</b><br>Выручка: <i>1 200 000 ₽</i><ul><li>+12% к октябрю</li></ul>',
  title: 'Отчёт',
  subtitle: 'Финансы',
  imageUrl: 'https://example.com/thumb.jpg',
  ctaLabel: 'Узнать больше',
  ctaUrl: 'https://example.com/report',
});
console.log(JSON.stringify(htmlMsg, null, 2));

const reply = buildRichReply({
  title: 'Таблица результатов',
  table: { headers: ['Команда', 'Очки'], rows: [['Альфа', '24'], ['Бета', '18']] },
  ctaUrl: 'https://example.com/full',
});
console.log(reply.text);
