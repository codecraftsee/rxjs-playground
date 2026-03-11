import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'map',
  category: 'Transformation',
  description: 'Applies a projection function to each emitted value.',
  useCases: [
    'Transform API response objects',
    'Convert temperature units',
    'Extract specific fields from objects',
  ],
  sourceCode: [
    'of(1, 2, 3).pipe(',
    '  map(x => x * 10)',
    ').subscribe(v => console.log(v));',
    '// 10, 20, 30',
  ].join('\n'),
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 15, value: '1' },
          { time: 35, value: '2' },
          { time: 55, value: '3' },
        ],
        completed: 60,
      },
    ],
    operator: 'map(x => x * 10)',
    output: {
      label: 'output',
      events: [
        { time: 15, value: '10' },
        { time: 35, value: '20' },
        { time: 55, value: '30' },
      ],
      completed: 60,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): void {
  log.info('of(1, 2, 3) piped through map(x => x * 10)');

  of(1, 2, 3)
    .pipe(map((x) => x * 10))
    .subscribe({
      next: (value) => log.next(value),
      error: (err) => log.error(err),
      complete: () => log.complete(),
    });
}
