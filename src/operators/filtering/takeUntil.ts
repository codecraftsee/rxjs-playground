import { interval, timer, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const sourceCode = `const source$ = interval(300);
const notifier$ = timer(2000);

source$.pipe(
  takeUntil(notifier$)
).subscribe(v => console.log(v));
// Emits values every 300ms, stops when notifier fires at 2s`;

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
    {
      label: 'notifier',
      events: [
        { time: 50, value: 'X', color: '#e94560' },
      ],
      completed: 50,
    },
  ],
  operator: 'takeUntil',
  output: {
    label: 'output',
    events: [
      { time: 10, value: '0' },
      { time: 25, value: '1' },
      { time: 40, value: '2' },
    ],
    completed: 50,
  },
};

export const meta = {
  name: 'takeUntil',
  category: 'Filtering',
  description: 'Emits values until a notifier Observable emits, then completes.',
  useCases: [
    'Unsubscribe on component destroy (Angular pattern)',
    'Stop polling when user navigates away',
    'Cancel operation on timeout',
  ],
  sourceCode,
  marble,
};

export function run(log: Log): Subscription {
  log.info('interval(300).pipe(takeUntil(timer(2000))) — emit every 300ms, stop after 2s');

  return interval(300)
    .pipe(takeUntil(timer(2000)))
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });
}
