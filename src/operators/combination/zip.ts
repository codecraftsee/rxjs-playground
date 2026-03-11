import { zip, of, Subscription } from 'rxjs';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [
    {
      label: 'streamA',
      events: [
        { time: 10, value: '1' },
        { time: 30, value: '2' },
        { time: 50, value: '3' },
      ],
    },
    {
      label: 'streamB',
      events: [
        { time: 20, value: 'a' },
        { time: 40, value: 'b' },
        { time: 60, value: 'c' },
      ],
    },
  ],
  operator: 'zip',
  output: {
    label: 'output',
    events: [
      { time: 20, value: '[1,a]' },
      { time: 40, value: '[2,b]' },
      { time: 60, value: '[3,c]' },
    ],
    completed: 65,
  },
};

export const meta = {
  name: 'zip',
  category: 'Combination',
  description:
    'Combines observables pairwise by index, emitting a tuple each time all sources have emitted at that index.',
  useCases: [
    'Pair request IDs with response data',
    'Coordinate parallel animations',
    'Match translated text with original keys',
  ],
  sourceCode: `zip(
  of(1, 2, 3),
  of('a', 'b', 'c'),
).subscribe(([num, letter]) => console.log(num, letter));
// Output: [1,'a'], [2,'b'], [3,'c']`,
  marble,
  interactive: false,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription | void {
  zip(of(1, 2, 3), of('a', 'b', 'c'), of(true, false, true)).subscribe({
    next: (value) => log.next(value),
    error: (err) => log.error(err),
    complete: () => log.complete(),
  });
}
