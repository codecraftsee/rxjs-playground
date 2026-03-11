import { of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'catchError',
  category: 'Error Handling',
  description:
    'Catches errors on the Observable and replaces the errored Observable with a new one.',
  useCases: [
    'Graceful HTTP error recovery',
    'Default values when API fails',
    'Logging errors and continuing',
  ],
  sourceCode: `of(1, 2, 3, 4, 5).pipe(
  map(n => { if (n === 4) throw new Error('four!'); return n; }),
  catchError(err => of('fallback'))
)`,
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 10, value: '1' },
          { time: 25, value: '2' },
          { time: 40, value: '3' },
        ],
        error: 55,
      },
    ],
    operator: 'catchError',
    output: {
      label: 'output',
      events: [
        { time: 10, value: '1' },
        { time: 25, value: '2' },
        { time: 40, value: '3' },
        { time: 55, value: 'fallback', color: '#f0c674' },
      ],
      completed: 60,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription | void {
  log.info('of(1,2,3,4,5) — map throws on 4, catchError replaces with fallback');

  of(1, 2, 3, 4, 5)
    .pipe(
      map((n) => {
        if (n === 4) throw new Error('four!');
        return n;
      }),
      catchError((err) => {
        log.info(`Caught error: ${err.message} — replacing with fallback`);
        return of('fallback');
      }),
    )
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });
}
