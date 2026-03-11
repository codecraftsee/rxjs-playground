import { from, Subscription } from 'rxjs';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [],
  operator: 'from([10, 20, 30])',
  output: {
    label: 'output',
    events: [
      { time: 10, value: '10', color: '#4CAF50' },
      { time: 30, value: '20', color: '#2196F3' },
      { time: 50, value: '30', color: '#FF9800' },
    ],
    completed: 55,
  },
};

export const meta = {
  name: 'from',
  category: 'Creation',
  description: 'Converts an array, promise, or iterable into an Observable.',
  useCases: [
    'Wrapping a fetch() Promise so it can be composed with other Observables via mergeMap or switchMap',
    'Converting an array of file paths into a stream for sequential processing',
    'Adapting a third-party callback-based API result into the reactive pipeline',
  ],
  sourceCode: `// From an array
from([10, 20, 30]).subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Array done'),
});

// From a Promise
from(Promise.resolve(42)).subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Promise done'),
});`,
  marble,
};

export function run(log: Log, _interactiveEl?: HTMLElement): Subscription | void {
  log.info('Converting an array [10, 20, 30] to an Observable');

  from([10, 20, 30]).subscribe({
    next: (value) => log.next(value),
    error: (err) => log.error(err),
    complete: () => log.complete(),
  });

  log.info('Converting a Promise that resolves to 42');

  const promise = Promise.resolve(42);

  from(promise).subscribe({
    next: (value) => log.next(value),
    error: (err) => log.error(err),
    complete: () => log.complete(),
  });
}
