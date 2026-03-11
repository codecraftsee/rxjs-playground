import { Subscription, timer } from 'rxjs';
import { timeout } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'timeout',
  category: 'Utility',
  description:
    'Errors if the source Observable does not emit a value within a given time span.',
  useCases: [
    'Set deadline for slow API responses',
    'Timeout idle WebSocket connections',
    'Enforce SLA response times',
  ],
  sourceCode: `timer(3000).pipe(timeout(2000))`,
  marble: {
    inputs: [
      {
        label: 'source',
        events: [],
      },
    ],
    operator: 'timeout(2000)',
    output: {
      label: 'output',
      events: [],
      error: 60,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription {
  log.info('timer(3000).pipe(timeout(2000)) — times out before timer fires');

  return timer(3000)
    .pipe(timeout(2000))
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(`TimeoutError: ${e.message}`),
      complete: () => log.complete(),
    });
}
