import { concat, of, timer, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [
    {
      label: 'first',
      events: [
        { time: 10, value: '1' },
        { time: 20, value: '2' },
        { time: 30, value: '3' },
      ],
      completed: 35,
    },
    {
      label: 'second',
      events: [
        { time: 50, value: '4' },
        { time: 60, value: '5' },
      ],
      completed: 70,
    },
  ],
  operator: 'concat',
  output: {
    label: 'output',
    events: [
      { time: 10, value: '1' },
      { time: 20, value: '2' },
      { time: 30, value: '3' },
      { time: 50, value: '4' },
      { time: 60, value: '5' },
    ],
    completed: 70,
  },
};

export const meta = {
  name: 'concat',
  category: 'Combination',
  description:
    'Subscribes to observables sequentially, emitting all values from each before moving to the next.',
  useCases: [
    'Queue animations to play in sequence',
    'Retry with fallback data source',
    'Sequential page data loading',
  ],
  sourceCode: `concat(
  of(1, 2, 3),
  timer(1000).pipe(map(() => 99)),
  of(4, 5, 6),
).subscribe(value => console.log(value));
// Output: 1, 2, 3, 99, 4, 5, 6`,
  marble,
  interactive: false,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription | void {
  return concat(
    of(1, 2, 3),
    timer(1000).pipe(map(() => 99)),
    of(4, 5, 6),
  ).subscribe({
    next: (value) => log.next(value),
    error: (err) => log.error(err),
    complete: () => log.complete(),
  });
}
