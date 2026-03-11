import { of, Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'tap',
  category: 'Utility',
  description:
    'Performs side effects for each emission without altering the stream.',
  useCases: [
    'Debug logging in operator chains',
    'Track analytics events in streams',
    'Update loading spinners as side effects',
  ],
  sourceCode: `of(1, 2, 3).pipe(
  tap(v => console.log('side-effect:', v)),
  map(v => v * 10)
)`,
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
    operator: 'tap(log)',
    output: {
      label: 'output',
      events: [
        { time: 15, value: '1' },
        { time: 40, value: '2' },
        { time: 65, value: '3' },
      ],
      completed: 70,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription | void {
  log.info('of(1,2,3).pipe(tap(side-effect), map(v => v*10))');

  of(1, 2, 3)
    .pipe(
      tap((v) => log.info(`tap side-effect: ${v}`)),
      map((v) => v * 10),
    )
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });
}
