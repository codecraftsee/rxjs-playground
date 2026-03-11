import { interval, Subject, Subscription } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

export const meta = {
  name: 'switchMap',
  category: 'Transformation',
  description:
    'Maps each value to an inner Observable, cancelling the previous inner on each new emission.',
  useCases: [
    'Type-ahead search (cancel previous HTTP request)',
    'Route parameter changes triggering data fetch',
    'Real-time dashboard switching between data sources',
  ],
  sourceCode: [
    'input$.pipe(',
    '  switchMap(query =>',
    '    http.get(`/search?q=${query}`)',
    '  )',
    ').subscribe(results => render(results));',
    '// Only the latest request matters',
  ].join('\n'),
  marble: {
    inputs: [
      {
        label: 'outer',
        events: [
          { time: 10, value: 'A', color: '#537fe7' },
          { time: 50, value: 'B', color: '#e94560' },
        ],
      },
      {
        label: 'inner A',
        events: [
          { time: 20, value: '0', color: '#537fe7' },
          { time: 30, value: '1', color: '#537fe7' },
          { time: 40, value: '2', color: '#555' },
        ],
        error: 50, // cancelled when B arrives
      },
      {
        label: 'inner B',
        events: [
          { time: 60, value: '0', color: '#e94560' },
          { time: 70, value: '1', color: '#e94560' },
          { time: 80, value: '2', color: '#e94560' },
        ],
        completed: 85,
      },
    ],
    operator: 'switchMap(x => inner$)',
    output: {
      label: 'output',
      events: [
        { time: 20, value: 'A0', color: '#537fe7' },
        { time: 30, value: 'A1', color: '#537fe7' },
        { time: 60, value: 'B0', color: '#e94560' },
        { time: 70, value: 'B1', color: '#e94560' },
        { time: 80, value: 'B2', color: '#e94560' },
      ],
      completed: 85,
    },
  } satisfies MarbleDiagram,
  interactive: true,
};

export function run(log: Log, interactiveEl?: HTMLElement): Subscription {
  if (interactiveEl) {
    const subject = new Subject<string>();
    const sub = new Subscription();

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin:8px 0;display:flex;gap:8px;align-items:center';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a value and press Enter...';
    input.style.cssText =
      'padding:6px 10px;border:1px solid #444;border-radius:4px;background:#1e1e2e;color:#e0e0e0;font-family:inherit;width:220px';

    const hint = document.createElement('span');
    hint.textContent = 'Each entry cancels the previous inner stream';
    hint.style.cssText = 'color:#808080;font-size:12px';

    wrapper.appendChild(input);
    wrapper.appendChild(hint);
    interactiveEl.appendChild(wrapper);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const val = input.value.trim();
        log.info(`Emitting outer value: "${val}"`);
        subject.next(val);
        input.value = '';
      }
    });

    sub.add(
      subject
        .pipe(
          switchMap((outer) =>
            interval(600).pipe(
              take(3),
              map((inner) => `"${outer}" inner ${inner}`),
            ),
          ),
        )
        .subscribe({
          next: (value) => log.next(value),
          error: (err) => log.error(err),
          complete: () => log.complete(),
        }),
    );

    sub.add(() => subject.complete());
    return sub;
  }

  log.info(
    'interval(2000).pipe(take(4), switchMap => inner interval(500).pipe(take(3)))',
  );
  log.info('Each outer emission cancels the previous inner subscription');

  return interval(2000)
    .pipe(
      take(4),
      switchMap((outer) =>
        interval(500).pipe(
          take(3),
          map((inner) => `outer ${outer}, inner ${inner}`),
        ),
      ),
    )
    .subscribe({
      next: (value) => log.next(value),
      error: (err) => log.error(err),
      complete: () => log.complete(),
    });
}
