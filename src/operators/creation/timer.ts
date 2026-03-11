import { timer, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [],
  operator: 'timer(1000, 500)',
  output: {
    label: 'output',
    events: [
      { time: 30, value: '0', color: '#4CAF50' },
      { time: 45, value: '1', color: '#2196F3' },
      { time: 60, value: '2', color: '#FF9800' },
      { time: 75, value: '3', color: '#E91E63' },
    ],
  },
};

export const meta = {
  name: 'timer',
  category: 'Creation',
  description: 'Emits after an initial delay, then at a regular interval.',
  useCases: [
    'Displaying a notification toast that auto-dismisses after a set delay',
    'Implementing a debounced auto-save that waits before the first save, then saves periodically',
    'Scheduling a delayed redirect after a form submission confirmation',
  ],
  sourceCode: `timer(1000, 500)
  .pipe(take(5))
  .subscribe({
    next: (value) => console.log(value),
    complete: () => console.log('Done'),
  });
// Output: 0 (after 1s), 1, 2, 3, 4 (every 500ms), Done`,
  marble,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription {
  log.info('Emitting after a 1s delay, then every 500ms, taking 5 values');

  return timer(1000, 500)
    .pipe(take(5))
    .subscribe({
      next: (value) => log.next(value),
      error: (err) => log.error(err),
      complete: () => log.complete(),
    });
}
