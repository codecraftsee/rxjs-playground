import { of, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const sourceCode = `of(1, 2, 3, 4, 5, 6).pipe(
  filter(x => x % 2 === 0)
).subscribe(v => console.log(v));
// Output: 2, 4, 6`;

const marble: MarbleDiagram = {
  inputs: [
    {
      label: 'source',
      events: [
        { time: 10, value: '1' },
        { time: 22, value: '2' },
        { time: 34, value: '3' },
        { time: 46, value: '4' },
        { time: 58, value: '5' },
        { time: 70, value: '6' },
      ],
      completed: 75,
    },
  ],
  operator: 'filter(x => x % 2 === 0)',
  output: {
    label: 'output',
    events: [
      { time: 22, value: '2' },
      { time: 46, value: '4' },
      { time: 70, value: '6' },
    ],
    completed: 75,
  },
};

export const meta = {
  name: 'filter',
  category: 'Filtering',
  description: 'Emits only values that satisfy a predicate function.',
  useCases: [
    'Filter completed todos',
    'Show only error-level logs',
    'Filter valid form submissions',
  ],
  sourceCode,
  marble,
};

export function run(log: Log): Subscription | void {
  log.info('filter(x => x % 2 === 0) — keep even numbers from 1..6');

  of(1, 2, 3, 4, 5, 6)
    .pipe(filter((x) => x % 2 === 0))
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });
}
