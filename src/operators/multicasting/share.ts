import { interval, Subscription } from 'rxjs';
import { take, share } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'share',
  category: 'Multicasting',
  description:
    'Shares a single subscription to the source Observable among multiple subscribers.',
  useCases: [
    'Share HTTP response among multiple subscribers',
    'Share expensive computation results',
    'Multicast WebSocket messages to UI components',
  ],
  sourceCode: `const shared$ = interval(500).pipe(take(3), share());
shared$.subscribe(v => logA(v));
shared$.subscribe(v => logB(v));`,
  marble: {
    inputs: [
      {
        label: 'source',
        events: [
          { time: 15, value: '1' },
          { time: 40, value: '2' },
          { time: 65, value: '3' },
        ],
        completed: 70,
      },
    ],
    operator: 'share()',
    output: {
      label: 'shared',
      events: [
        { time: 15, value: '1' },
        { time: 40, value: '2' },
        { time: 65, value: '3' },
      ],
      completed: 70,
    },
  } satisfies MarbleDiagram,
};

export function run(log: Log): Subscription {
  log.info('interval(500).pipe(take(3), share()) — two subscribers share one source');

  const source$ = interval(500).pipe(take(3), share());

  const combined = new Subscription();

  combined.add(
    source$.subscribe({
      next: (v) => log.next(`[Subscriber A] ${v}`),
      error: (e) => log.error(e),
      complete: () => log.info('Subscriber A complete'),
    }),
  );

  combined.add(
    source$.subscribe({
      next: (v) => log.next(`[Subscriber B] ${v}`),
      error: (e) => log.error(e),
      complete: () => log.info('Subscriber B complete'),
    }),
  );

  return combined;
}
