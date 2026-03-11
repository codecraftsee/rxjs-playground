import { of, Subscription } from 'rxjs';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [],
  operator: 'of(1, 2, 3)',
  output: {
    label: 'output',
    events: [
      { time: 10, value: '1', color: '#4CAF50' },
      { time: 20, value: '2', color: '#2196F3' },
      { time: 30, value: '3', color: '#FF9800' },
    ],
    completed: 35,
  },
};

export const meta = {
  name: 'of',
  category: 'Creation',
  description: 'Creates an Observable that emits a fixed set of values synchronously, then completes.',
  useCases: [
    'Providing default or fallback values when a network request fails',
    'Emitting static configuration data at the start of an application',
    'Creating mock Observables for unit testing service methods',
  ],
  sourceCode: `of(1, 2, 3).subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Done'),
});
// Output: 1, 2, 3, Done`,
  marble,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription | void {
  log.info('Emitting values 1, 2, 3 synchronously using of()');

  of(1, 2, 3).subscribe({
    next: (value) => log.next(value),
    error: (err) => log.error(err),
    complete: () => log.complete(),
  });
}
