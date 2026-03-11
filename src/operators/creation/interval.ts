import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [],
  operator: 'interval(500)',
  output: {
    label: 'output',
    events: [
      { time: 15, value: '0', color: '#4CAF50' },
      { time: 30, value: '1', color: '#2196F3' },
      { time: 45, value: '2', color: '#FF9800' },
      { time: 60, value: '3', color: '#E91E63' },
      { time: 75, value: '4', color: '#9C27B0' },
    ],
  },
};

export const meta = {
  name: 'interval',
  category: 'Creation',
  description: 'Emits an ascending number at a fixed time interval.',
  useCases: [
    'Polling a REST API every few seconds to check for updated data',
    'Driving a countdown timer or stopwatch display in the UI',
    'Periodically refreshing an authentication token before it expires',
  ],
  sourceCode: `interval(500)
  .pipe(take(10))
  .subscribe({
    next: (value) => console.log(value),
    complete: () => console.log('Done'),
  });
// Output: 0, 1, 2, ... 9, Done (one every 500ms)`,
  marble,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription {
  log.info('Emitting a value every 500ms, taking the first 10');

  return interval(500)
    .pipe(take(10))
    .subscribe({
      next: (value) => log.next(value),
      error: (err) => log.error(err),
      complete: () => log.complete(),
    });
}
