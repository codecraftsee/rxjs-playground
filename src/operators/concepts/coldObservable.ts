import { Observable, Subscription } from 'rxjs';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'Cold Observable',
  category: 'Concepts',
  description:
    'A cold observable creates a new, independent execution for each subscriber. Every subscriber receives all values from the beginning, regardless of when they subscribe.',
  useCases: [
    'HTTP requests — each subscriber triggers its own request',
    'Reading a file — each subscriber reads from the start',
    'Most RxJS creation operators (of, from, interval) produce cold observables',
  ],
  sourceCode: `// Each subscriber gets its own independent execution
const cold$ = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

// Sub A subscribes immediately
cold$.subscribe(v => console.log('A:', v));
// A: 1, A: 2, A: 3

// Sub B subscribes later — still gets ALL values
setTimeout(() => {
  cold$.subscribe(v => console.log('B:', v));
  // B: 1, B: 2, B: 3
}, 2000);`,
  marble: {
    inputs: [
      {
        label: 'Sub A',
        events: [
          { time: 15, value: '1', color: '#4ec9b0' },
          { time: 30, value: '2', color: '#4ec9b0' },
          { time: 45, value: '3', color: '#4ec9b0' },
          { time: 60, value: '4', color: '#4ec9b0' },
        ],
        completed: 70,
      },
      {
        label: 'Sub B',
        events: [
          { time: 40, value: '1', color: '#e94560' },
          { time: 55, value: '2', color: '#e94560' },
          { time: 70, value: '3', color: '#e94560' },
          { time: 85, value: '4', color: '#e94560' },
        ],
        completed: 92,
      },
    ],
    operator: 'Cold: independent execution',
    output: {
      label: 'each',
      events: [
        { time: 15, value: '1' },
        { time: 30, value: '2' },
        { time: 40, value: '1', color: '#e94560' },
        { time: 45, value: '3' },
        { time: 55, value: '2', color: '#e94560' },
        { time: 60, value: '4' },
        { time: 70, value: '3', color: '#e94560' },
        { time: 85, value: '4', color: '#e94560' },
      ],
    },
  } as MarbleDiagram,
};

export function run(log: Log): Subscription {
  const combined = new Subscription();

  // Cold observable: each subscription creates a new execution
  const cold$ = new Observable<number>((subscriber) => {
    let count = 1;
    log.info(`New execution started for a subscriber`);
    const id = setInterval(() => {
      if (count <= 4) {
        subscriber.next(count++);
      } else {
        subscriber.complete();
        clearInterval(id);
      }
    }, 800);
    return () => clearInterval(id);
  });

  // Subscriber A — subscribes immediately
  log.info('Subscriber A subscribes now');
  combined.add(
    cold$.subscribe({
      next: (v) => log.next(`[Sub A] ${v}`),
      complete: () => log.complete(),
    }),
  );

  // Subscriber B — subscribes after 2 seconds
  const timer = setTimeout(() => {
    log.info('Subscriber B subscribes now (2s later) — gets ALL values from start');
    combined.add(
      cold$.subscribe({
        next: (v) => log.next(`[Sub B] ${v}`),
        complete: () => log.complete(),
      }),
    );
  }, 2000);

  combined.add(() => clearTimeout(timer));
  return combined;
}
