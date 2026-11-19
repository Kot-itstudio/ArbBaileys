export interface Button {
  type: 'quick' | 'url' | 'list' | 'section';
  text?: string;
  id?: string;
  url?: string;
  rows?: Array<{ title: string; description?: string; id?: string }>;
}

export interface CarouselCard {
  header?: string;
  body?: string;
  footer?: string;
  image?: { url: string };
  video?: { url: string };
  buttons?: Button[];
}

export interface MessageOptions {
  caption?: string;
  contextInfo?: any;
  ephemeralDuration?: number;
}

export interface MediaMessage {
  image?: { url: string; mimetype?: string; caption?: string };
  video?: { url: string; mimetype?: string; caption?: string };
  audio?: { url: string; mimetype?: string };
  document?: { url: string; mimetype?: string; fileName?: string };
}

export interface InteractiveButtons {
  buttons: Button[];
}

export interface InteractiveList {
  header?: string;
  body?: string;
  footer?: string;
  button?: string;
  sections: Array<{
    title?: string;
    rows: Array<{ title: string; description?: string; row_id?: string }>;
  }>;
}

export interface InteractiveCarousel {
  cards: CarouselCard[];
}
