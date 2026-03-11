import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const sourceCode = `interval(300).pipe(
  take(3)
).subscribe(v => console.log(v));
// Output: 0, 1, 2 (then completes)`;

const marble: MarbleDiagram = {
  inputs: [
    {
      label: 'source',
      events: [
        { time: 10, value: '0' },
        { time: 25, value: '1' },
        { time: 40, value: '2' },
        { time: 55, value: '3' },
        { time: 70, value: '4' },
      ],
    },
  ],
  operator: 'take(3)',
  output: {
    label: 'output',
    events: [
      { time: 10, value: '0' },
      { time: 25, value: '1' },
      { time: 40, value: '2' },
    ],
    completed: 42,
  },
};

export const meta = {
  name: 'take',
  category: 'Filtering',
  description: 'Emits only the first N values and then completes.',
  useCases: [
    'Limit results shown to user',
    'Get first N responses from a stream',
    'Sample initial values from a sensor',
  ],
  sourceCode,
  marble,
};

export function run(log: Log): Subscription {
  log.info('interval(300).pipe(take(3)) — emit first 3 values then complete');

  return interval(300)
    .pipe(take(3))
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });
}
