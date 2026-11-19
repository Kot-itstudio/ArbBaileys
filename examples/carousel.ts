import { buildCarousel, CarouselCard } from '../src';

const cards: CarouselCard[] = [
  { header: 'Product A', body: 'Great product', buttons: [{ type: 'quick', id: 'buy_a', text: 'Buy' }] },
  { header: 'Product B', body: 'Even better', buttons: [{ type: 'quick', id: 'buy_b', text: 'Buy' }] },
];

console.log(JSON.stringify(buildCarousel(cards, 'Shop', 'Pick one', 'Powered by fork'), null, 2));
