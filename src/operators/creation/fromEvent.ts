import { fromEvent, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Log } from '../../logger';
import type { MarbleDiagram } from '../../marble';

const marble: MarbleDiagram = {
  inputs: [],
  operator: 'fromEvent(btn, "click")',
  output: {
    label: 'output',
    events: [
      { time: 20, value: 'click', color: '#4CAF50' },
      { time: 45, value: 'click', color: '#2196F3' },
      { time: 70, value: 'click', color: '#FF9800' },
    ],
  },
};

export const meta = {
  name: 'fromEvent',
  category: 'Creation',
  description: 'Creates an Observable from DOM events such as clicks, keypresses, etc.',
  useCases: [
    'Listening to search input keystrokes and debouncing before firing an API request',
    'Tracking mouse movements to build a drawing canvas or drag-and-drop feature',
    'Reacting to window resize events to dynamically adjust a responsive layout',
  ],
  sourceCode: `const button = document.querySelector('#myBtn');
fromEvent(button, 'click').subscribe({
  next: (event) => console.log('Clicked!', event),
});

const input = document.querySelector('#search');
fromEvent(input, 'input').pipe(
  map(e => (e.target as HTMLInputElement).value),
).subscribe({
  next: (text) => console.log('Typed:', text),
});`,
  marble,
  interactive: true,
};

export function run(log: Log, interactiveEl?: HTMLElement): Subscription {
  const container = interactiveEl || document.body;

  // Create a wrapper div for the interactive controls
  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px',
  });

  // Text input for custom event type
  const inputRow = document.createElement('div');
  Object.assign(inputRow.style, {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  });

  const label = document.createElement('label');
  label.textContent = 'Event type:';
  Object.assign(label.style, { fontSize: '14px', fontWeight: 'bold' });

  const eventTypeInput = document.createElement('input');
  eventTypeInput.type = 'text';
  eventTypeInput.value = 'click';
  eventTypeInput.placeholder = 'e.g. click, mouseenter, dblclick';
  Object.assign(eventTypeInput.style, {
    padding: '6px 10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    flex: '1',
  });

  inputRow.appendChild(label);
  inputRow.appendChild(eventTypeInput);

  // The target button
  const button = document.createElement('button');
  button.textContent = 'Click me!';
  Object.assign(button.style, {
    padding: '12px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '4px',
    border: '1px solid #999',
    background: '#f0f0f0',
    alignSelf: 'flex-start',
  });

  wrapper.appendChild(inputRow);
  wrapper.appendChild(button);
  container.appendChild(wrapper);

  log.info('Interact with the button below. Change the event type input to listen for different events.');

  // Track the current event type subscription
  let currentEventType = 'click';
  let eventSub = fromEvent(button, currentEventType).subscribe({
    next: (event) => {
      const mouseEvent = event as MouseEvent;
      log.next(`${currentEventType} at (${mouseEvent.clientX}, ${mouseEvent.clientY})`);
    },
    error: (err) => log.error(err),
  });

  // Listen for changes on the event type input to re-subscribe
  const inputSub = fromEvent(eventTypeInput, 'change')
    .pipe(
      map((e) => (e.target as HTMLInputElement).value.trim()),
    )
    .subscribe({
      next: (newEventType) => {
        if (!newEventType) return;
        log.info(`Switching event listener to: "${newEventType}"`);
        currentEventType = newEventType;
        eventSub.unsubscribe();
        eventSub = fromEvent(button, currentEventType).subscribe({
          next: (event) => {
            const mouseEvent = event as MouseEvent;
            log.next(`${currentEventType} at (${mouseEvent.clientX ?? 'N/A'}, ${mouseEvent.clientY ?? 'N/A'})`);
          },
          error: (err) => log.error(err),
        });
      },
    });

  // Combine subscriptions and handle cleanup
  const combinedSub = new Subscription();
  combinedSub.add(eventSub);
  combinedSub.add(inputSub);
  combinedSub.add(() => {
    wrapper.remove();
    log.info('Interactive controls removed from DOM');
  });

  return combinedSub;
}
