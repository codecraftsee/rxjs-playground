import { Subject, Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'Hot Observable',
  category: 'Concepts',
  description:
    'A hot observable shares a single execution among all subscribers. Late subscribers miss values that were emitted before they subscribed — like tuning into a live broadcast.',
  useCases: [
    'WebSocket connections — data streams regardless of subscribers',
    'Mouse/keyboard events — events fire whether anyone listens or not',
    'Stock tickers — prices update continuously',
  ],
  sourceCode: `// Hot observable using Subject
const source$ = new Subject<number>();

// Feed values into the subject
let count = 0;
setInterval(() => source$.next(++count), 800);

// Sub A subscribes immediately — gets all values
source$.subscribe(v => console.log('A:', v));
// A: 1, A: 2, A: 3, A: 4, A: 5 ...

// Sub B subscribes after 2.5s — misses early values!
setTimeout(() => {
  source$.subscribe(v => console.log('B:', v));
  // B: 4, B: 5 ...  (missed 1, 2, 3)
}, 2500);`,
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 10, value: '1' },
          { time: 25, value: '2' },
          { time: 40, value: '3' },
          { time: 55, value: '4' },
          { time: 70, value: '5' },
          { time: 85, value: '6' },
        ],
        completed: 95,
      },
      {
        label: 'Sub B',
        events: [
          { time: 55, value: '4', color: '#e94560' },
          { time: 70, value: '5', color: '#e94560' },
          { time: 85, value: '6', color: '#e94560' },
        ],
        completed: 95,
      },
    ],
    operator: 'Hot: shared execution',
    output: {
      label: 'Sub A',
      events: [
        { time: 10, value: '1', color: '#4ec9b0' },
        { time: 25, value: '2', color: '#4ec9b0' },
        { time: 40, value: '3', color: '#4ec9b0' },
        { time: 55, value: '4', color: '#4ec9b0' },
        { time: 70, value: '5', color: '#4ec9b0' },
        { time: 85, value: '6', color: '#4ec9b0' },
      ],
      completed: 95,
    },
  } as MarbleDiagram,
};

export function run(log: Log): Subscription {
  const combined = new Subscription();
  const source = new Subject<number>();

  // Feed values from interval into the subject (hot source)
  let count = 0;
  combined.add(
    interval(800)
      .pipe(take(8))
      .subscribe({
        next: () => source.next(++count),
        complete: () => source.complete(),
      }),
  );

  // Subscriber A — subscribes immediately, gets everything
  log.info('Subscriber A subscribes now — will receive all values');
  combined.add(
    source.subscribe({
      next: (v) => log.next(`[Sub A] ${v}`),
      complete: () => log.info('Sub A complete'),
    }),
  );

  // Subscriber B — subscribes late, misses early values
  const timer = setTimeout(() => {
    log.info('Subscriber B subscribes now (2.5s later) — missed early values!');
    combined.add(
      source.subscribe({
        next: (v) => log.next(`[Sub B] ${v}`),
        complete: () => log.info('Sub B complete'),
      }),
    );
  }, 2500);

  combined.add(() => clearTimeout(timer));
  return combined;
}
