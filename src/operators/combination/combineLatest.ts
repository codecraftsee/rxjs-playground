import { combineLatest, interval, Subscription } from 'rxjs';
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
        { time: 25, value: 'B0' },
        { time: 55, value: 'B1' },
      ],
    },
  ],
  operator: 'combineLatest',
  output: {
    label: 'output',
    events: [
      { time: 25, value: '[A0,B0]' },
      { time: 45, value: '[A1,B0]' },
      { time: 55, value: '[A1,B1]' },
      { time: 75, value: '[A2,B1]' },
    ],
    completed: 80,
  },
};

export const meta = {
  name: 'combineLatest',
  category: 'Combination',
  description:
    'Combines multiple observables, emitting the latest value from each whenever any source emits.',
  useCases: [
    'Combine form field values for validation',
    'Merge user preferences with app settings',
    'Combine multiple API responses for a dashboard',
  ],
  sourceCode: `combineLatest([
  interval(1000).pipe(take(4), map(i => \`A\${i}\`)),
  interval(700).pipe(take(4), map(i => \`B\${i}\`)),
]).subscribe(([a, b]) => console.log(a, b));`,
  marble,
  interactive: false,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription | void {
  const a$ = interval(1000).pipe(take(4), map((i) => `A${i}`));
  const b$ = interval(700).pipe(take(4), map((i) => `B${i}`));

  return combineLatest([a$, b$]).subscribe({
    next: (value) => log.next(value),
    error: (err) => log.error(err),
    complete: () => log.complete(),
  });
}
