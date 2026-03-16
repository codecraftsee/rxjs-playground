import { Observable, Subject, Subscription, interval } from 'rxjs';
import type { Log } from '../../logger';

export const meta = {
  name: 'Cold vs Hot',
  category: 'Concepts',
  description:
    'Compare cold and hot observables side by side. Cold observables create independent executions per subscriber. Hot observables share a single execution — late subscribers miss earlier values.',
  useCases: [
    'Understanding when to use share() or shareReplay() to convert cold to hot',
    'Choosing between cold HTTP requests vs hot WebSocket streams',
    'Debugging unexpected multiple executions (cold) or missing values (hot)',
  ],
  sourceCode: `// COLD — each subscriber gets independent values
const cold$ = new Observable(sub => {
  let i = 0;
  const id = setInterval(() => sub.next(++i), 800);
  return () => clearInterval(id);
});
cold$.subscribe(v => log('Cold A:', v)); // 1, 2, 3...
// Later: cold$.subscribe(v => log('Cold B:', v)); // 1, 2, 3...

// HOT — shared execution via Subject
const hot$ = new Subject();
let i = 0;
setInterval(() => hot$.next(++i), 800);
hot$.subscribe(v => log('Hot A:', v));  // 1, 2, 3, 4...
// Later: hot$.subscribe(v => log('Hot B:', v)); // 4, 5, 6...`,
  interactive: true,
};

const COLORS = {
  subA: '#4ec9b0',
  subB: '#e94560',
  cold: '#537fe7',
  hot: '#f0c674',
  bg: '#1a1a2e',
  line: '#444',
  text: '#e0e0e0',
  dimText: '#808080',
};

const BTN_BASE =
  'padding:6px 14px;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;transition:opacity 0.2s;';

function createBtn(label: string, color: string): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.cssText = BTN_BASE + `background:${color};color:#1a1a2e;`;
  return btn;
}

function createSVGEl(tag: string, attrs: Record<string, string>): SVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

interface TimelineState {
  svg: SVGSVGElement;
  startTime: number;
  streams: Map<string, { events: { time: number; value: string; color: string }[]; startX: number }>;
  animId: number;
  width: number;
  padding: number;
  duration: number;
}

function createTimeline(title: string, titleColor: string): { el: HTMLElement; state: TimelineState } {
  const container = document.createElement('div');
  container.style.cssText = 'flex:1;min-width:0;';

  const header = document.createElement('div');
  header.textContent = title;
  header.style.cssText = `font-weight:700;font-size:14px;color:${titleColor};margin-bottom:8px;text-align:center;text-transform:uppercase;letter-spacing:1px;`;
  container.appendChild(header);

  const svgContainer = document.createElement('div');
  svgContainer.style.cssText = 'background:#12122a;border-radius:8px;padding:8px;min-height:120px;';
  container.appendChild(svgContainer);

  const width = 280;
  const height = 120;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.style.cssText = 'display:block;';
  svgContainer.appendChild(svg);

  const state: TimelineState = {
    svg,
    startTime: performance.now(),
    streams: new Map(),
    animId: 0,
    width,
    padding: 50,
    duration: 12000,
  };

  // Draw static timeline labels and arrows
  drawStaticTimelines(state);

  return { el: container, state };
}

function drawStaticTimelines(state: TimelineState) {
  const { svg, width, padding } = state;
  const lineWidth = width - padding - 20;

  // Sub A timeline (y=30)
  drawTimelineArrow(svg, padding, 30, lineWidth);
  const labelA = createSVGEl('text', {
    x: '6', y: '34',
    fill: COLORS.subA, 'font-size': '11',
    'font-family': "'Cascadia Code', 'Fira Code', monospace",
  });
  labelA.textContent = 'Sub A';
  svg.appendChild(labelA);

  // Sub B timeline (y=80)
  drawTimelineArrow(svg, padding, 80, lineWidth);
  const labelB = createSVGEl('text', {
    x: '6', y: '84',
    fill: COLORS.subB, 'font-size': '11',
    'font-family': "'Cascadia Code', 'Fira Code', monospace",
  });
  labelB.textContent = 'Sub B';
  svg.appendChild(labelB);
}

function drawTimelineArrow(svg: SVGSVGElement, x: number, y: number, width: number) {
  svg.appendChild(createSVGEl('line', {
    x1: String(x), y1: String(y), x2: String(x + width), y2: String(y),
    stroke: COLORS.line, 'stroke-width': '1.5',
  }));
  svg.appendChild(createSVGEl('polygon', {
    points: `${x + width},${y} ${x + width - 6},${y - 3} ${x + width - 6},${y + 3}`,
    fill: COLORS.line,
  }));
}

function addMarble(state: TimelineState, streamKey: string, value: string, color: string) {
  const stream = state.streams.get(streamKey);
  if (!stream) return;

  const elapsed = performance.now() - state.startTime;
  const timePercent = Math.min(elapsed / state.duration, 0.95);
  const lineWidth = state.width - state.padding - 20;
  const cx = state.padding + timePercent * lineWidth;
  const cy = streamKey.includes('A') ? 30 : 80;

  stream.events.push({ time: timePercent, value, color });

  // Animate marble pop-in
  const circle = createSVGEl('circle', {
    cx: String(cx), cy: String(cy), r: '0',
    fill: color, opacity: '0.9',
  });
  const anim = createSVGEl('animate', {
    attributeName: 'r', from: '0', to: '11',
    dur: '0.35s', fill: 'freeze',
    calcMode: 'spline', keySplines: '0.34 1.56 0.64 1',
  });
  circle.appendChild(anim);
  state.svg.appendChild(circle);

  const text = createSVGEl('text', {
    x: String(cx), y: String(cy + 1),
    'text-anchor': 'middle', 'dominant-baseline': 'middle',
    fill: '#fff', 'font-size': '10', 'font-weight': '700',
    'font-family': "'Cascadia Code', 'Fira Code', monospace",
    opacity: '0',
  });
  text.textContent = value;
  const textAnim = createSVGEl('animate', {
    attributeName: 'opacity', from: '0', to: '1',
    dur: '0.2s', begin: '0.15s', fill: 'freeze',
  });
  text.appendChild(textAnim);
  state.svg.appendChild(text);
}

function addSubscribeMarker(state: TimelineState, streamKey: string, color: string) {
  const elapsed = performance.now() - state.startTime;
  const timePercent = Math.min(elapsed / state.duration, 0.95);
  const lineWidth = state.width - state.padding - 20;
  const cx = state.padding + timePercent * lineWidth;
  const cy = streamKey.includes('A') ? 30 : 80;

  // Small triangle marker for subscription point
  const marker = createSVGEl('polygon', {
    points: `${cx},${cy - 14} ${cx - 5},${cy - 22} ${cx + 5},${cy - 22}`,
    fill: color, opacity: '0',
  });
  const fadeIn = createSVGEl('animate', {
    attributeName: 'opacity', from: '0', to: '1',
    dur: '0.3s', fill: 'freeze',
  });
  marker.appendChild(fadeIn);
  state.svg.appendChild(marker);

  // Store the start position for this stream
  state.streams.set(streamKey, { events: [], startX: cx });
}

export function run(log: Log, interactiveEl?: HTMLElement): Subscription | void {
  const combined = new Subscription();

  if (!interactiveEl) {
    // Fallback: non-interactive auto-run
    runAutoDemo(log, combined);
    return combined;
  }

  // Build the interactive UI
  const panel = document.createElement('div');
  panel.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;';

  // --- COLD side ---
  const { el: coldEl, state: coldState } = createTimeline('Cold Observable', COLORS.cold);
  const coldControls = document.createElement('div');
  coldControls.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;justify-content:center;';

  const coldSubABtn = createBtn('Subscribe A', COLORS.subA);
  const coldSubBBtn = createBtn('Subscribe B', COLORS.subB);
  const coldUnsubABtn = createBtn('Unsub A', '#666');
  const coldUnsubBBtn = createBtn('Unsub B', '#666');
  coldUnsubABtn.disabled = true;
  coldUnsubBBtn.disabled = true;
  coldUnsubABtn.style.opacity = '0.4';
  coldUnsubBBtn.style.opacity = '0.4';

  coldControls.append(coldSubABtn, coldUnsubABtn, coldSubBBtn, coldUnsubBBtn);
  coldEl.appendChild(coldControls);

  // --- HOT side ---
  const { el: hotEl, state: hotState } = createTimeline('Hot Observable', COLORS.hot);
  const hotControls = document.createElement('div');
  hotControls.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;justify-content:center;';

  const hotSubABtn = createBtn('Subscribe A', COLORS.subA);
  const hotSubBBtn = createBtn('Subscribe B', COLORS.subB);
  const hotUnsubABtn = createBtn('Unsub A', '#666');
  const hotUnsubBBtn = createBtn('Unsub B', '#666');
  hotUnsubABtn.disabled = true;
  hotUnsubBBtn.disabled = true;
  hotUnsubABtn.style.opacity = '0.4';
  hotUnsubBBtn.style.opacity = '0.4';

  hotControls.append(hotSubABtn, hotUnsubABtn, hotSubBBtn, hotUnsubBBtn);
  hotEl.appendChild(hotControls);

  panel.append(coldEl, hotEl);
  interactiveEl.appendChild(panel);

  // --- Cold observable logic ---
  let coldCount = 0;
  let coldSubA: Subscription | null = null;
  let coldSubB: Subscription | null = null;

  function createColdObservable(): Observable<number> {
    return new Observable<number>((subscriber) => {
      let count = 0;
      const id = setInterval(() => {
        subscriber.next(++count);
      }, 900);
      return () => clearInterval(id);
    });
  }

  coldSubABtn.addEventListener('click', () => {
    if (coldSubA) return;
    coldCount++;
    log.info(`[Cold] Sub A subscribes — new independent execution #${coldCount}`);
    addSubscribeMarker(coldState, 'coldA', COLORS.subA);
    coldSubA = createColdObservable().subscribe({
      next: (v) => {
        log.next(`[Cold Sub A] ${v}`);
        addMarble(coldState, 'coldA', String(v), COLORS.subA);
      },
    });
    combined.add(coldSubA);
    coldSubABtn.disabled = true;
    coldSubABtn.style.opacity = '0.4';
    coldUnsubABtn.disabled = false;
    coldUnsubABtn.style.opacity = '1';
  });

  coldSubBBtn.addEventListener('click', () => {
    if (coldSubB) return;
    coldCount++;
    log.info(`[Cold] Sub B subscribes — new independent execution #${coldCount} (starts from 1!)`);
    addSubscribeMarker(coldState, 'coldB', COLORS.subB);
    coldSubB = createColdObservable().subscribe({
      next: (v) => {
        log.next(`[Cold Sub B] ${v}`);
        addMarble(coldState, 'coldB', String(v), COLORS.subB);
      },
    });
    combined.add(coldSubB);
    coldSubBBtn.disabled = true;
    coldSubBBtn.style.opacity = '0.4';
    coldUnsubBBtn.disabled = false;
    coldUnsubBBtn.style.opacity = '1';
  });

  coldUnsubABtn.addEventListener('click', () => {
    if (coldSubA) {
      coldSubA.unsubscribe();
      coldSubA = null;
      log.info('[Cold] Sub A unsubscribed');
      coldSubABtn.disabled = false;
      coldSubABtn.style.opacity = '1';
      coldUnsubABtn.disabled = true;
      coldUnsubABtn.style.opacity = '0.4';
    }
  });

  coldUnsubBBtn.addEventListener('click', () => {
    if (coldSubB) {
      coldSubB.unsubscribe();
      coldSubB = null;
      log.info('[Cold] Sub B unsubscribed');
      coldSubBBtn.disabled = false;
      coldSubBBtn.style.opacity = '1';
      coldUnsubBBtn.disabled = true;
      coldUnsubBBtn.style.opacity = '0.4';
    }
  });

  // --- Hot observable logic ---
  const hotSource = new Subject<number>();
  let hotCounter = 0;
  const hotInterval = setInterval(() => {
    hotSource.next(++hotCounter);
  }, 900);
  combined.add(() => clearInterval(hotInterval));
  combined.add(() => hotSource.complete());

  let hotSubA: Subscription | null = null;
  let hotSubB: Subscription | null = null;

  log.info('Hot source is emitting values every 900ms...');
  log.info('Click Subscribe buttons to see the difference!');

  hotSubABtn.addEventListener('click', () => {
    if (hotSubA) return;
    log.info(`[Hot] Sub A subscribes — joins shared stream at value ${hotCounter}`);
    addSubscribeMarker(hotState, 'hotA', COLORS.subA);
    hotSubA = hotSource.subscribe({
      next: (v) => {
        log.next(`[Hot Sub A] ${v}`);
        addMarble(hotState, 'hotA', String(v), COLORS.subA);
      },
    });
    combined.add(hotSubA);
    hotSubABtn.disabled = true;
    hotSubABtn.style.opacity = '0.4';
    hotUnsubABtn.disabled = false;
    hotUnsubABtn.style.opacity = '1';
  });

  hotSubBBtn.addEventListener('click', () => {
    if (hotSubB) return;
    log.info(`[Hot] Sub B subscribes — joins shared stream at value ${hotCounter} (missed earlier values!)`);
    addSubscribeMarker(hotState, 'hotB', COLORS.subB);
    hotSubB = hotSource.subscribe({
      next: (v) => {
        log.next(`[Hot Sub B] ${v}`);
        addMarble(hotState, 'hotB', String(v), COLORS.subB);
      },
    });
    combined.add(hotSubB);
    hotSubBBtn.disabled = true;
    hotSubBBtn.style.opacity = '0.4';
    hotUnsubBBtn.disabled = false;
    hotUnsubBBtn.style.opacity = '1';
  });

  hotUnsubABtn.addEventListener('click', () => {
    if (hotSubA) {
      hotSubA.unsubscribe();
      hotSubA = null;
      log.info('[Hot] Sub A unsubscribed');
      hotSubABtn.disabled = false;
      hotSubABtn.style.opacity = '1';
      hotUnsubABtn.disabled = true;
      hotUnsubABtn.style.opacity = '0.4';
    }
  });

  hotUnsubBBtn.addEventListener('click', () => {
    if (hotSubB) {
      hotSubB.unsubscribe();
      hotSubB = null;
      log.info('[Hot] Sub B unsubscribed');
      hotSubBBtn.disabled = false;
      hotSubBBtn.style.opacity = '1';
      hotUnsubBBtn.disabled = true;
      hotUnsubBBtn.style.opacity = '0.4';
    }
  });

  return combined;
}

function runAutoDemo(log: Log, combined: Subscription) {
  log.info('=== Cold Observable ===');
  log.info('Each subscriber gets its own execution:');

  const cold$ = new Observable<number>((subscriber) => {
    let count = 0;
    const id = setInterval(() => {
      subscriber.next(++count);
      if (count >= 4) {
        subscriber.complete();
        clearInterval(id);
      }
    }, 700);
    return () => clearInterval(id);
  });

  combined.add(
    cold$.subscribe({
      next: (v) => log.next(`[Cold A] ${v}`),
      complete: () => log.info('Cold A complete'),
    }),
  );

  const t1 = setTimeout(() => {
    log.info('Sub B subscribes 2s later — still gets 1, 2, 3, 4:');
    combined.add(
      cold$.subscribe({
        next: (v) => log.next(`[Cold B] ${v}`),
        complete: () => log.info('Cold B complete'),
      }),
    );
  }, 2000);
  combined.add(() => clearTimeout(t1));

  const t2 = setTimeout(() => {
    log.info('');
    log.info('=== Hot Observable ===');
    log.info('Late subscriber misses early values:');

    const hotSource = new Subject<number>();
    let count = 0;
    combined.add(
      interval(700).subscribe({
        next: () => {
          count++;
          if (count <= 6) hotSource.next(count);
          else hotSource.complete();
        },
      }),
    );

    combined.add(
      hotSource.subscribe({
        next: (v) => log.next(`[Hot A] ${v}`),
        complete: () => log.info('Hot A complete'),
      }),
    );

    const t3 = setTimeout(() => {
      log.info('Sub B subscribes 2s later — misses values 1, 2:');
      combined.add(
        hotSource.subscribe({
          next: (v) => log.next(`[Hot B] ${v}`),
          complete: () => log.info('Hot B complete'),
        }),
      );
    }, 2000);
    combined.add(() => clearTimeout(t3));
  }, 6000);
  combined.add(() => clearTimeout(t2));
}
