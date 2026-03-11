import { Subject, Subscription } from 'rxjs';
import type { Log } from '../../logger';

export const meta = {
  name: 'Subject',
  category: 'Multicasting',
  description:
    'A Subject acts as both an Observable and Observer, multicasting values to multiple subscribers.',
  useCases: [
    'Event bus between components',
    'Manual control of observable emissions',
    'Bridge imperative code to reactive streams',
  ],
  sourceCode: `const subject = new Subject<string>();
subject.subscribe(v => logA(v));
subject.subscribe(v => logB(v));
subject.next('hello');
subject.complete();`,
  interactive: true,
};

export function run(log: Log, interactiveEl?: HTMLElement): Subscription | void {
  const subject = new Subject<string>();
  const combined = new Subscription();

  combined.add(
    subject.subscribe({
      next: (v) => log.next(`[Subscriber A] ${v}`),
      error: (e) => log.error(e),
      complete: () => log.info('Subscriber A complete'),
    }),
  );

  combined.add(
    subject.subscribe({
      next: (v) => log.next(`[Subscriber B] ${v}`),
      error: (e) => log.error(e),
      complete: () => log.info('Subscriber B complete'),
    }),
  );

  if (interactiveEl) {
    const wrapper = document.createElement('div');
    wrapper.className = 'subject-controls';
    wrapper.style.cssText =
      'display:flex;gap:8px;align-items:center;padding:8px 0;flex-wrap:wrap;';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter value...';
    input.style.cssText =
      'padding:6px 10px;border:1px solid #444;border-radius:6px;' +
      'background:#1e1e2e;color:#e0e0e0;font-family:inherit;font-size:14px;' +
      'outline:none;min-width:140px;';

    const emitBtn = document.createElement('button');
    emitBtn.textContent = 'Emit';
    emitBtn.style.cssText =
      'padding:6px 16px;border:none;border-radius:6px;' +
      'background:#4ec9b0;color:#1e1e2e;font-weight:600;cursor:pointer;font-size:14px;';

    const completeBtn = document.createElement('button');
    completeBtn.textContent = 'Complete';
    completeBtn.style.cssText =
      'padding:6px 16px;border:none;border-radius:6px;' +
      'background:#569cd6;color:#1e1e2e;font-weight:600;cursor:pointer;font-size:14px;';

    emitBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (value && !subject.closed) {
        log.info(`subject.next("${value}")`);
        subject.next(value);
        input.value = '';
        input.focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') emitBtn.click();
    });

    completeBtn.addEventListener('click', () => {
      if (!subject.closed) {
        log.info('subject.complete()');
        subject.complete();
        emitBtn.disabled = true;
        completeBtn.disabled = true;
        input.disabled = true;
        emitBtn.style.opacity = '0.5';
        completeBtn.style.opacity = '0.5';
        input.style.opacity = '0.5';
      }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(emitBtn);
    wrapper.appendChild(completeBtn);
    interactiveEl.appendChild(wrapper);

    log.info('Use the controls above to emit values via the Subject');
  } else {
    log.info('No interactive element — emitting values programmatically');
    subject.next('hello');
    subject.next('world');
    subject.next('!');
    subject.complete();
  }

  return combined;
}
