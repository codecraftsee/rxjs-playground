import { of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'delay',
  category: 'Utility',
  description:
    'Delays the emission of items from the source Observable by a given timeout.',
  useCases: [
    'Debounce UI notifications',
    'Stagger animation start times',
    'Simulate network latency in tests',
  ],
  sourceCode: `of(1, 2, 3).pipe(delay(1000))`,
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 10, value: '1' },
          { time: 20, value: '2' },
          { time: 30, value: '3' },
        ],
        completed: 35,
      },
    ],
    operator: 'delay(1000)',
    output: {
      label: 'output',
      events: [
        { time: 40, value: '1' },
        { time: 50, value: '2' },
        { time: 60, value: '3' },
      ],
      completed: 65,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription {
  log.info('of(1,2,3).pipe(delay(1000)) — values arrive after 1s delay');

  return of(1, 2, 3)
    .pipe(delay(1000))
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });
}
