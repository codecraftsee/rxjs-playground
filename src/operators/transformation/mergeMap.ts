import { of, interval, Subscription } from 'rxjs';
import { mergeMap, take, map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'mergeMap',
  category: 'Transformation',
  description:
    'Maps each value to an inner Observable and merges their outputs concurrently.',
  useCases: [
    'Parallel HTTP requests for multiple IDs',
    'Processing file uploads concurrently',
    'Handling multiple WebSocket connections',
  ],
  sourceCode: [
    'of(1, 2, 3).pipe(',
    '  mergeMap(id =>',
    '    http.get(`/items/${id}`)',
    '  )',
    ').subscribe(item => render(item));',
    '// Results arrive as each request completes',
  ].join('\n'),
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 10, value: '1', color: '#4ec9b0' },
          { time: 25, value: '2', color: '#e94560' },
          { time: 40, value: '3', color: '#537fe7' },
        ],
      },
      {
        label: 'inner 1',
        events: [
          { time: 20, value: 'a', color: '#4ec9b0' },
          { time: 30, value: 'b', color: '#4ec9b0' },
          { time: 40, value: 'c', color: '#4ec9b0' },
        ],
        completed: 42,
      },
      {
        label: 'inner 2',
        events: [
          { time: 35, value: 'a', color: '#e94560' },
          { time: 45, value: 'b', color: '#e94560' },
          { time: 55, value: 'c', color: '#e94560' },
        ],
        completed: 57,
      },
      {
        label: 'inner 3',
        events: [
          { time: 50, value: 'a', color: '#537fe7' },
          { time: 60, value: 'b', color: '#537fe7' },
          { time: 70, value: 'c', color: '#537fe7' },
        ],
        completed: 72,
      },
    ],
    operator: 'mergeMap(x => inner$)',
    output: {
      label: 'output',
      events: [
        { time: 20, value: '1a', color: '#4ec9b0' },
        { time: 30, value: '1b', color: '#4ec9b0' },
        { time: 35, value: '2a', color: '#e94560' },
        { time: 40, value: '1c', color: '#4ec9b0' },
        { time: 45, value: '2b', color: '#e94560' },
        { time: 50, value: '3a', color: '#537fe7' },
        { time: 55, value: '2c', color: '#e94560' },
        { time: 60, value: '3b', color: '#537fe7' },
        { time: 70, value: '3c', color: '#537fe7' },
      ],
      completed: 75,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription {
  log.info('of(1, 2, 3).pipe(mergeMap(x => interval(500).pipe(take(3))))');
  log.info('All inner Observables run concurrently');

  return of(1, 2, 3)
    .pipe(
      mergeMap((x) =>
        interval(500).pipe(
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
