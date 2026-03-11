import { of } from 'rxjs';
import { scan } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'scan',
  category: 'Transformation',
  description:
    'Applies an accumulator function over emissions, emitting each intermediate result.',
  useCases: [
    'Running total in shopping cart',
    'Accumulating state from events (Redux-like)',
    'Building chat message history',
  ],
  sourceCode: [
    'actions$.pipe(',
    '  scan((state, action) => reducer(state, action), initialState)',
    ').subscribe(state => render(state));',
    '// Emits updated state after every action',
  ].join('\n'),
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 10, value: '1' },
          { time: 25, value: '2' },
          { time: 40, value: '3' },
          { time: 55, value: '4' },
          { time: 70, value: '5' },
        ],
        completed: 75,
      },
    ],
    operator: 'scan((acc,v) => acc+v, 0)',
    output: {
      label: 'output',
      events: [
        { time: 10, value: '1' },
        { time: 25, value: '3' },
        { time: 40, value: '6' },
        { time: 55, value: '10' },
        { time: 70, value: '15' },
      ],
      completed: 75,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): void {
  log.info('of(1, 2, 3, 4, 5).pipe(scan((acc, val) => acc + val, 0)) — running sum');

  of(1, 2, 3, 4, 5)
    .pipe(scan((acc, val) => acc + val, 0))
    .subscribe({
      next: (value) => log.next(value),
      error: (err) => log.error(err),
      complete: () => log.complete(),
    });
}
