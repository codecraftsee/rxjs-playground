import { forkJoin, of, timer, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [
    {
      label: 'streamA',
      events: [
        { time: 10, value: '1' },
        { time: 25, value: '2' },
        { time: 38, value: '3' },
      ],
      completed: 40,
    },
    {
      label: 'streamB',
      events: [
        { time: 65, value: 'done' },
      ],
      completed: 70,
    },
  ],
  operator: 'forkJoin',
  output: {
    label: 'output',
    events: [
      { time: 70, value: "[3,'done']" },
    ],
    completed: 72,
  },
};

export const meta = {
  name: 'forkJoin',
  category: 'Combination',
  description:
    'Waits for all observables to complete, then emits the last value from each as an array.',
  useCases: [
    'Load all required data before showing a page',
    'Parallel API calls that all must complete',
    'Batch file uploads with final summary',
  ],
  sourceCode: `forkJoin([
  of(1, 2, 3),
  timer(1000).pipe(map(() => 'done')),
]).subscribe(([last, done]) => console.log(last, done));
// Output: 3, 'done'`,
  marble,
  interactive: false,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription | void {
  return forkJoin([
    of(1, 2, 3),
    timer(1000).pipe(map(() => 'done')),
    of([10, 20]),
  ]).subscribe({
    next: (value) => log.next(value),
    error: (err) => log.error(err),
    complete: () => log.complete(),
  });
}
