import { Observable, Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'retry',
  category: 'Error Handling',
  description:
    'Resubscribes to the source Observable a specified number of times when an error occurs.',
  useCases: [
    'Retry failed HTTP requests',
    'Reconnect dropped WebSocket',
    'Retry flaky database queries',
  ],
  sourceCode: `new Observable(subscriber => {
  attempt++;
  if (attempt <= 2) subscriber.error('fail');
  else { subscriber.next(1); subscriber.next(2); subscriber.next(3); subscriber.complete(); }
}).pipe(retry(2))`,
  marble: {
    inputs: [
      {
        label: 'attempt 1',
        events: [{ time: 10, value: '1' }],
        error: 30,
      },
      {
        label: 'attempt 2',
        events: [{ time: 10, value: '1' }],
        error: 30,
      },
      {
        label: 'attempt 3',
        events: [
          { time: 10, value: '1' },
          { time: 30, value: '2' },
          { time: 50, value: '3' },
        ],
        completed: 60,
      },
    ],
    operator: 'retry(2)',
    output: {
      label: 'output',
      events: [
        { time: 50, value: '1' },
        { time: 60, value: '2' },
        { time: 70, value: '3' },
      ],
      completed: 80,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription {
  let attempt = 0;

  const source$ = new Observable<number>((subscriber) => {
    attempt++;
    log.info(`Attempt #${attempt}`);

    if (attempt <= 2) {
      subscriber.next(1);
      subscriber.error(new Error(`fail on attempt ${attempt}`));
    } else {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    }
  });

  return source$.pipe(retry(2)).subscribe({
    next: (v) => log.next(v),
    error: (e) => log.error(e),
    complete: () => log.complete(),
  });
}
