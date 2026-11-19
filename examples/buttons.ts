import { buildMessage, Button } from '../src';

const buttons: Button[] = [
  { type: 'quick', id: 'yes', text: 'Yes' },
  { type: 'quick', id: 'no', text: 'No' },
];

console.log(JSON.stringify(buildMessage(buttons, 'Are you sure?'), null, 2));
