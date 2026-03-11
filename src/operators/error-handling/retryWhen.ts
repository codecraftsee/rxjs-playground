import { Observable, Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'retryWhen (deprecated)',
  category: 'Error Handling',
  description:
    'retryWhen is deprecated. Use retry with a delay config instead. Retries the source Observable with exponential backoff between attempts.',
  useCases: [
    'Exponential backoff for API calls',
    'Retry with increasing delay on rate-limit',
    'Resilient polling with backoff',
  ],
  sourceCode: `new Observable(subscriber => {
  attempt++;
  if (attempt <= 3) subscriber.error('fail');
  else { subscriber.next('success'); subscriber.complete(); }
}).pipe(retry({ count: 3, delay: 1000 }))`,
  marble: {
    inputs: [
      {
        label: 'source',
        events: [],
        error: 20,
      },
      {
        label: 'retry 1',
        events: [],
        error: 50,
      },
      {
        label: 'retry 2',
        events: [{ time: 80, value: 'success', color: '#4ec9b0' }],
        completed: 85,
      },
    ],
    operator: 'retry({count:3,delay:1000})',
    output: {
      label: 'output',
      events: [{ time: 80, value: 'success', color: '#4ec9b0' }],
      completed: 85,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription {
  let attempt = 0;

  const source$ = new Observable<string>((subscriber) => {
    attempt++;
    log.info(`Attempt #${attempt}`);

    if (attempt <= 3) {
      subscriber.error(new Error(`fail on attempt ${attempt}`));
    } else {
      subscriber.next(`success on attempt ${attempt}`);
      subscriber.complete();
    }
  });

  log.info('Using retry({ count: 3, delay: 1000 }) — exponential backoff');

  return source$.pipe(retry({ count: 3, delay: 1000 })).subscribe({
    next: (v) => log.next(v),
    error: (e) => log.error(e),
    complete: () => log.complete(),
  });
}
