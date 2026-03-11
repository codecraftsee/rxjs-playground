export interface Log {
  next(value: unknown): void;
  error(err: unknown): void;
  complete(): void;
  info(message: string): void;
}

const startTime = performance.now();

function formatTime(): string {
  return ((performance.now() - startTime) / 1000).toFixed(3);
}

export function createLog(outputEl: HTMLElement): Log {
  function append(cls: string, text: string) {
    const line = document.createElement('div');
    line.className = `log-line log-${cls}`;

    const timestamp = document.createElement('span');
    timestamp.className = 'log-timestamp';
    timestamp.textContent = `[${formatTime()}s]`;

    line.appendChild(timestamp);
    line.appendChild(document.createTextNode(` ${text}`));
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  return {
    next: (v) => append('next', `next: ${JSON.stringify(v)}`),
    error: (e) => append('error', `error: ${e}`),
    complete: () => append('complete', 'complete'),
    info: (msg) => append('info', msg),
  };
}
