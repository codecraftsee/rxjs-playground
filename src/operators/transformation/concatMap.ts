import { of, interval, Subscription } from 'rxjs';
import { concatMap, take, map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'concatMap',
  category: 'Transformation',
  description:
    'Maps each value to an inner Observable and concatenates their outputs in order.',
  useCases: [
    'Sequential form submissions',
    'Ordered file processing',
    'Database migrations in sequence',
  ],
  sourceCode: [
    'submits$.pipe(',
    '  concatMap(formData =>',
    '    http.post("/api/save", formData)',
    '  )',
    ').subscribe(res => notify(res));',
    '// Each request waits for the previous to complete',
  ].join('\n'),
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 5, value: '1', color: '#4ec9b0' },
          { time: 15, value: '2', color: '#e94560' },
          { time: 25, value: '3', color: '#537fe7' },
        ],
      },
      {
        label: 'inner 1',
        events: [
          { time: 12, value: 'a', color: '#4ec9b0' },
          { time: 22, value: 'b', color: '#4ec9b0' },
          { time: 32, value: 'c', color: '#4ec9b0' },
        ],
        completed: 34,
      },
      {
        label: 'inner 2',
        events: [
          { time: 42, value: 'a', color: '#e94560' },
          { time: 52, value: 'b', color: '#e94560' },
          { time: 62, value: 'c', color: '#e94560' },
        ],
        completed: 64,
      },
      {
        label: 'inner 3',
        events: [
          { time: 72, value: 'a', color: '#537fe7' },
          { time: 82, value: 'b', color: '#537fe7' },
          { time: 92, value: 'c', color: '#537fe7' },
        ],
        completed: 94,
      },
    ],
    operator: 'concatMap(x => inner$)',
    output: {
      label: 'output',
      events: [
        { time: 12, value: '1a', color: '#4ec9b0' },
        { time: 22, value: '1b', color: '#4ec9b0' },
        { time: 32, value: '1c', color: '#4ec9b0' },
        { time: 42, value: '2a', color: '#e94560' },
        { time: 52, value: '2b', color: '#e94560' },
        { time: 62, value: '2c', color: '#e94560' },
        { time: 72, value: '3a', color: '#537fe7' },
        { time: 82, value: '3b', color: '#537fe7' },
        { time: 92, value: '3c', color: '#537fe7' },
      ],
      completed: 96,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription {
  log.info('of(1, 2, 3).pipe(concatMap(x => interval(300).pipe(take(3))))');
  log.info('Each inner Observable waits for the previous one to complete');

  return of(1, 2, 3)
    .pipe(
      concatMap((x) =>
        interval(300).pipe(
          take(3),
          map((i) => `source ${x}, inner ${i}`),
        ),
      ),
    )
    .subscribe({
      next: (value) => log.next(value),
      error: (err) => log.error(err),
      complete: () => log.complete(),
    });
}
