import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const sourceCode = `const subject = new Subject<string>();

subject.pipe(
  debounceTime(300)
).subscribe(v => console.log(v));

// Rapid burst 1
subject.next('burst1-a'); // t=0
subject.next('burst1-b'); // t=50
subject.next('burst1-c'); // t=100  → emits 'burst1-c' after 300ms quiet

// Rapid burst 2
subject.next('burst2-a'); // t=600
subject.next('burst2-b'); // t=650
subject.next('burst2-c'); // t=700  → emits 'burst2-c' after 300ms quiet`;

const marble: MarbleDiagram = {
  inputs: [
    {
      label: 'source',
      events: [
        { time: 10, value: 'a' },
        { time: 13, value: 'b' },
        { time: 16, value: 'c' },
        { time: 50, value: 'd' },
        { time: 53, value: 'e' },
        { time: 56, value: 'f' },
      ],
      completed: 85,
    },
  ],
  operator: 'debounceTime(300)',
  output: {
    label: 'output',
    events: [
      { time: 25, value: 'c' },
      { time: 65, value: 'f' },
    ],
    completed: 80,
  },
};

export const meta = {
  name: 'debounceTime',
  category: 'Filtering',
  description:
    'Emits a value only after a specified quiet period has passed without another emission.',
  useCases: [
    'Search-as-you-type input',
    'Window resize handler',
    'Auto-save after user stops typing',
  ],
  sourceCode,
  marble,
  interactive: true,
};

export function run(log: Log, interactiveEl?: HTMLElement): Subscription {
  log.info('debounceTime(300) — only the last value in each rapid burst gets through');

  const subject = new Subject<string>();

  const subscription = subject
    .pipe(debounceTime(300))
    .subscribe({
      next: (v) => log.next(v),
      error: (e) => log.error(e),
      complete: () => log.complete(),
    });

  // If an interactive element is provided, create a text input for live demo
  if (interactiveEl) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin: 8px 0; display: flex; align-items: center; gap: 8px;';

    const label = document.createElement('label');
    label.textContent = 'Type here (debounced at 300ms): ';
    label.style.cssText = 'color: #ccc; font-size: 13px; white-space: nowrap;';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Start typing...';
    input.style.cssText =
      'flex: 1; padding: 6px 10px; border: 1px solid #444; border-radius: 4px; ' +
      'background: #1e1e2e; color: #e0e0e0; font-family: inherit; font-size: 13px; ' +
      'outline: none;';

    input.addEventListener('input', () => {
      subject.next(input.value);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    interactiveEl.appendChild(wrapper);

    // Clean up the input listener on unsubscribe
    subscription.add(() => {
      input.removeEventListener('input', () => {});
      wrapper.remove();
    });
  } else {
    // Fallback: automated burst demo when no interactive element
    setTimeout(() => subject.next('burst1-a'), 0);
    setTimeout(() => subject.next('burst1-b'), 50);
    setTimeout(() => subject.next('burst1-c'), 100);

    setTimeout(() => subject.next('burst2-a'), 600);
    setTimeout(() => subject.next('burst2-b'), 650);
    setTimeout(() => subject.next('burst2-c'), 700);

    setTimeout(() => subject.complete(), 1200);
  }

  return subscription;
}
