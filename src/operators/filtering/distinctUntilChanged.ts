import { of, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const sourceCode = `of(1, 1, 2, 2, 3, 1).pipe(
  distinctUntilChanged()
).subscribe(v => console.log(v));
// Output: 1, 2, 3, 1`;

const marble: MarbleDiagram = {
  inputs: [
    {
      label: 'source',
      events: [
        { time: 10, value: '1' },
        { time: 22, value: '1' },
        { time: 34, value: '2' },
        { time: 46, value: '2' },
        { time: 58, value: '3' },
        { time: 70, value: '1' },
      ],
      completed: 75,
    },
  ],
  operator: 'distinctUntilChanged()',
  output: {
    label: 'output',
    events: [
      { time: 10, value: '1' },
      { time: 34, value: '2' },
      { time: 58, value: '3' },
      { time: 70, value: '1' },
    ],
    completed: 75,
  },
};

export const meta = {
  name: 'distinctUntilChanged',
  category: 'Filtering',
  description: 'Emits a value only when it differs from the previous emission.',
  useCases: [
    'Skip duplicate API polling results',
    'Prevent redundant renders',
    'Filter repeated sensor readings',
  ],
  sourceCode,
  marble,
};

export function run(log: Log): Subscription | void {
  log.info('distinctUntilChanged() — suppress consecutive duplicates from 1,1,2,2,3,1');

  of(1, 1, 2, 2, 3, 1)
    .pipe(distinctUntilChanged())
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });
}
