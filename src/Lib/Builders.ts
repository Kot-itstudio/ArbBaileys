import { Button, CarouselCard } from "../Types";

export interface MessageOptions {
  caption?: string;
  contextInfo?: any;
  ephemeralDuration?: number;
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
