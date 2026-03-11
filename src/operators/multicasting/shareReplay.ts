import { of, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'shareReplay',
  category: 'Multicasting',
  description:
    'Shares the source and replays the specified number of last emissions to late subscribers.',
  useCases: [
    'Cache latest API response for new subscribers',
    'Replay auth token to late components',
    'Buffer last N sensor readings for new dashboards',
  ],
  sourceCode: `const source$ = of(1, 2, 3).pipe(shareReplay(2));
source$.subscribe(v => logA(v));  // receives 1, 2, 3
source$.subscribe(v => logB(v));  // receives 2, 3 (replayed)`,
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 15, value: '1' },
          { time: 40, value: '2' },
          { time: 65, value: '3' },
        ],
        completed: 70,
      },
    ],
    operator: 'shareReplay(2)',
    output: {
      label: 'late sub',
      events: [
        { time: 72, value: '2', color: '#f0c674' },
        { time: 78, value: '3', color: '#f0c674' },
      ],
      completed: 80,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription | void {
  log.info('of(1,2,3).pipe(shareReplay(2)) — late subscriber gets replayed last 2 values');

  const source$ = of(1, 2, 3).pipe(shareReplay(2));

  log.info('--- Subscriber A (receives all) ---');
  source$.subscribe({
    next: (v) => log.next(`[Subscriber A] ${v}`),
    error: (e) => log.error(e),
    complete: () => log.info('Subscriber A complete'),
  });

  log.info('--- Subscriber B (late, gets replayed 2 and 3) ---');
  source$.subscribe({
    next: (v) => log.next(`[Subscriber B] ${v}`),
    error: (e) => log.error(e),
    complete: () => log.info('Subscriber B complete'),
  });
}
