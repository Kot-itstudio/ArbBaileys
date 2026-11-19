/**
 * Подсистема rich-ответов (HTML/таблицы для ИИ-ботов).
 * Форматирование взято из innovatorssoft/Baileys (rich replies) и
 * стандартного WhatsApp-форматирования (*bold*, ~strike~, `mono`).
 */

export interface RichTable {
  headers: string[];
  rows: string[][];
}

/** Конвертация HTML в WhatsApp-форматирование (ограниченный набор тегов). */
export function htmlToWaFormatting(html: string): string {
  return html
    .replace(/<(b|strong)>/gi, '*')
    .replace(/<\/(b|strong)>/gi, '*')
    .replace(/<(i|em)>/gi, '_')
    .replace(/<\/(i|em)>/gi, '_')
    .replace(/<(s|strike|del)>/gi, '~')
    .replace(/<\/(s|strike|del)>/gi, '~')
    .replace(/<code>/gi, '```')
    .replace(/<\/code>/gi, '```')
    .replace(/<a href="([^"]+)">([^<]+)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(ul|ol|table|tr|div|p)[^>]*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Markdown-таблица → текстовая таблица, пригодная для monospace-блока WA. */
export function tableToMonoblock(t: RichTable): string {
  const widths = t.headers.map((h, i) =>
    Math.max(h.length, ...t.rows.map((r) => (r[i] || '').length))
  );
  const line = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join(' | ').trimEnd();
  const sep = widths.map((w) => '-'.repeat(w)).join('-+-');
  return '```\n' + [line(t.headers), sep, ...t.rows.map(line)].join('\n') + '\n```';
}

/** Полный rich-ответ: заголовок + HTML-тело + таблица + CTA «Узнать больше». */
export function buildRichReply(opts: {
  title: string;
  html?: string;
  table?: RichTable;
  ctaLabel?: string;   // по умолчанию «Узнать больше»
  ctaUrl: string;
}): any {
  const parts: string[] = [`*${opts.title}*`];
  if (opts.html) parts.push(htmlToWaFormatting(opts.html));
  if (opts.table) parts.push(tableToMonoblock(opts.table));
  return {
    text: parts.join('\n\n'),
    interactive: {
      type: 'button',
      body: { text: parts.join('\n\n') },
      action: {
        buttons: [
          {
            buttonId: 'cta_more',
            buttonText: { displayText: opts.ctaLabel || 'Узнать больше' },
          },
        ],
      },
    },
    contextInfo: {
      externalAdReply: {
        title: opts.title,
        sourceUrl: opts.ctaUrl,
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  };
}
