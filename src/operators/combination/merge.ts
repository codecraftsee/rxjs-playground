import { merge, interval, Subscription } from 'rxjs';
import { take, map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [
    {
      label: 'streamA',
      events: [
        { time: 15, value: 'A0' },
        { time: 45, value: 'A1' },
        { time: 75, value: 'A2' },
      ],
    },
    {
      label: 'streamB',
      events: [
        { time: 30, value: 'B0' },
        { time: 60, value: 'B1' },
      ],
    },
  ],
  operator: 'merge',
  output: {
    label: 'output',
    events: [
      { time: 15, value: 'A0' },
      { time: 30, value: 'B0' },
      { time: 45, value: 'A1' },
      { time: 60, value: 'B1' },
      { time: 75, value: 'A2' },
    ],
  },
};

export const meta = {
  name: 'merge',
  category: 'Combination',
  description:
    'Flattens multiple observables into a single stream, emitting values concurrently as they arrive.',
  useCases: [
    'Combine click events from multiple buttons',
    'Merge WebSocket messages from multiple channels',
    'Aggregate events from different input sources',
  ],
  sourceCode: `merge(
  interval(1000).pipe(take(3), map(i => \`A\${i}\`)),
  interval(700).pipe(take(3), map(i => \`B\${i}\`)),
).subscribe(value => console.log(value));`,
  marble,
  interactive: false,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription | void {
  const a$ = interval(1000).pipe(take(3), map((i) => `A${i}`));
  const b$ = interval(700).pipe(take(3), map((i) => `B${i}`));

  return merge(a$, b$).subscribe({
    next: (value) => log.next(value),
    error: (err) => log.error(err),
    complete: () => log.complete(),
  });
}
