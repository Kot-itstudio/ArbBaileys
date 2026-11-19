// List message: single select, секции — формат Itsukichann/zervidas/baileys-pro.
import { buildList, buildNestedFlow } from '../src/Lib/Builders';

const list = buildList('Меню', 'Выберите раздел', 'Выбрать', [
  { title: 'Товары', rows: [
    { title: 'Ноутбук', description: 'от 45 000 ₽', rowId: 'sku_laptop' },
    { title: 'Мышь', description: 'от 900 ₽', rowId: 'sku_mouse' },
  ]},
  { title: 'Услуги', rows: [
    { title: 'Доставка', rowId: 'svc_delivery' },
  ]},
]);
console.log(JSON.stringify(list, null, 2));

// Вложенный flow: кнопки без точек → внутри кнопки с точками → «Выбрать»
const nested = buildNestedFlow({
  header: 'Заказ кофе',
  body: 'Выберите категорию, затем напиток',
  footer: 'КофеБар',
  ctaButtonText: 'Выбрать…',
  topLevelButtons: [
    { id: 'espresso', label: 'Эспрессо' },
    { id: 'latte', label: 'Латте' },
  ],
  radioPerButton: {
    espresso: [
      { id: 'r1', title: 'Ристретто' },
      { id: 'r2', title: 'Доппио' },
    ],
    latte: [
      { id: 'r3', title: 'Классический' },
      { id: 'r4', title: 'Карамельный' },
    ],
  },
  submitLabel: 'Выбрать',
});
console.log(JSON.stringify(nested, null, 2));
