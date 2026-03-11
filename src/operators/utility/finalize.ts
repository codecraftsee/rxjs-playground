import { interval, Subscription } from 'rxjs';
import { take, finalize } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'finalize',
  category: 'Utility',
  description:
    'Calls a specified function when the Observable completes, errors, or is unsubscribed.',
  useCases: [
    'Hide loading spinner when stream ends',
    'Close database connections on unsubscribe',
    'Remove event listeners on cleanup',
  ],
  sourceCode: `interval(500).pipe(
  take(3),
  finalize(() => console.log('cleanup executed'))
)`,
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 15, value: '0' },
          { time: 40, value: '1' },
          { time: 65, value: '2' },
        ],
        completed: 70,
      },
    ],
    operator: 'finalize(cleanup)',
    output: {
      label: 'output',
      events: [
        { time: 15, value: '0' },
        { time: 40, value: '1' },
        { time: 65, value: '2' },
      ],
      completed: 70,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription {
  log.info('interval(500).pipe(take(3), finalize(() => cleanup))');

  return interval(500)
    .pipe(
      take(3),
      finalize(() => log.info('finalize: cleanup executed')),
    )
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });
}
