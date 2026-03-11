export interface MarbleEvent {
  time: number; // 0-100 percentage along timeline
  value: string;
  color?: string;
}

export interface MarbleStream {
  label: string;
  events: MarbleEvent[];
  completed?: number; // time position of completion line
  error?: number; // time position of error
}

export interface MarbleDiagram {
  inputs: MarbleStream[];
  operator: string;
  output: MarbleStream;
}

const COLORS = ['#4ec9b0', '#e94560', '#537fe7', '#f0c674', '#c678dd', '#56b6c2', '#e06c75'];

function getColor(index: number): string {
  return COLORS[index % COLORS.length];
}

export function createMarbleDiagramEl(diagram: MarbleDiagram): HTMLElement {
  const container = document.createElement('div');
  container.className = 'marble-diagram';

  const streamHeight = 50;
  const operatorHeight = 36;
  const padding = { top: 20, bottom: 20, left: 70, right: 30 };
  const totalHeight =
    padding.top +
    diagram.inputs.length * streamHeight +
    operatorHeight +
    streamHeight +
    padding.bottom;
  const width = 600;
  const timelineWidth = width - padding.left - padding.right;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`);
  svg.setAttribute('class', 'marble-svg');

  let y = padding.top;

  // Draw input streams
  for (let i = 0; i < diagram.inputs.length; i++) {
    const stream = diagram.inputs[i];
    drawStream(svg, stream, padding.left, y, timelineWidth, getColor(i), i);
    y += streamHeight;
  }

  // Draw operator box — size to fit text
  const opY = y + operatorHeight / 2;
  const charWidth = 8; // approximate monospace char width at font-size 13
  const opPadding = 24;
  const boxWidth = Math.max(160, diagram.operator.length * charWidth + opPadding * 2);
  const opBox = createSVGEl('rect', {
    x: String(width / 2 - boxWidth / 2),
    y: String(y + 4),
    width: String(boxWidth),
    height: '28',
    rx: '14',
    fill: '#0f3460',
    stroke: '#537fe7',
    'stroke-width': '1.5',
  });
  svg.appendChild(opBox);

  const opText = createSVGEl('text', {
    x: String(width / 2),
    y: String(opY + 2),
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    fill: '#e0e0e0',
    'font-size': '13',
    'font-family': "'Cascadia Code', 'Fira Code', monospace",
  });
  opText.textContent = diagram.operator;
  svg.appendChild(opText);

  // Dashed lines from inputs to operator
  for (let i = 0; i < diagram.inputs.length; i++) {
    const fromY = padding.top + i * streamHeight + 20;
    const dashed = createSVGEl('line', {
      x1: String(width / 2),
      y1: String(fromY + 10),
      x2: String(width / 2),
      y2: String(y + 4),
      stroke: '#333',
      'stroke-dasharray': '3,3',
      'stroke-width': '1',
    });
    svg.appendChild(dashed);
  }

  y += operatorHeight;

  // Dashed line from operator to output
  const dashOut = createSVGEl('line', {
    x1: String(width / 2),
    y1: String(y - operatorHeight + 32),
    x2: String(width / 2),
    y2: String(y + 10),
    stroke: '#333',
    'stroke-dasharray': '3,3',
    'stroke-width': '1',
  });
  svg.appendChild(dashOut);

  // Draw output stream
  drawStream(svg, diagram.output, padding.left, y, timelineWidth, '#4ec9b0', -1);

  container.appendChild(svg);
  return container;
}

function drawStream(
  svg: SVGElement,
  stream: MarbleStream,
  x: number,
  y: number,
  width: number,
  color: string,
  _index: number,
) {
  const centerY = y + 20;

  // Label
  const label = createSVGEl('text', {
    x: String(x - 8),
    y: String(centerY + 4),
    'text-anchor': 'end',
    fill: '#808080',
    'font-size': '12',
    'font-family': "'Cascadia Code', 'Fira Code', monospace",
  });
  label.textContent = stream.label;
  svg.appendChild(label);

  // Timeline arrow
  const arrow = createSVGEl('line', {
    x1: String(x),
    y1: String(centerY),
    x2: String(x + width),
    y2: String(centerY),
    stroke: '#444',
    'stroke-width': '2',
  });
  svg.appendChild(arrow);

  // Arrowhead
  const arrowHead = createSVGEl('polygon', {
    points: `${x + width},${centerY} ${x + width - 8},${centerY - 4} ${x + width - 8},${centerY + 4}`,
    fill: '#444',
  });
  svg.appendChild(arrowHead);

  // Events (marbles)
  for (const evt of stream.events) {
    const cx = x + (evt.time / 100) * width;
    const marbleColor = evt.color || color;

    // Scale radius and font based on text length
    const len = evt.value.length;
    const radius = len <= 1 ? 14 : len <= 2 ? 16 : len <= 4 ? 20 : 24;
    const fontSize = len <= 2 ? 11 : len <= 4 ? 9 : 7;

    // Marble circle with animation
    const circle = createSVGEl('circle', {
      cx: String(cx),
      cy: String(centerY),
      r: '0',
      fill: marbleColor,
      opacity: '0.9',
      class: 'marble',
    });

    // Pop-in animation
    const anim = createSVGEl('animate', {
      attributeName: 'r',
      from: '0',
      to: String(radius),
      dur: '0.4s',
      begin: `${evt.time * 30}ms`,
      fill: 'freeze',
      calcMode: 'spline',
      keySplines: '0.34 1.56 0.64 1',
    });
    circle.appendChild(anim);

    const fadeIn = createSVGEl('animate', {
      attributeName: 'opacity',
      from: '0',
      to: '0.9',
      dur: '0.3s',
      begin: `${evt.time * 30}ms`,
      fill: 'freeze',
    });
    circle.appendChild(fadeIn);

    svg.appendChild(circle);

    // Value text
    const text = createSVGEl('text', {
      x: String(cx),
      y: String(centerY + 1),
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: '#fff',
      'font-size': String(fontSize),
      'font-weight': '700',
      'font-family': "'Cascadia Code', 'Fira Code', monospace",
      opacity: '0',
      class: 'marble-text',
    });
    text.textContent = evt.value;

    const textFade = createSVGEl('animate', {
      attributeName: 'opacity',
      from: '0',
      to: '1',
      dur: '0.3s',
      begin: `${evt.time * 30 + 150}ms`,
      fill: 'freeze',
    });
    text.appendChild(textFade);

    svg.appendChild(text);
  }

  // Completion line |
  if (stream.completed !== undefined) {
    const cx = x + (stream.completed / 100) * width;
    const completeLine = createSVGEl('line', {
      x1: String(cx),
      y1: String(centerY - 16),
      x2: String(cx),
      y2: String(centerY + 16),
      stroke: '#569cd6',
      'stroke-width': '3',
      'stroke-linecap': 'round',
      opacity: '0',
    });
    const compAnim = createSVGEl('animate', {
      attributeName: 'opacity',
      from: '0',
      to: '1',
      dur: '0.3s',
      begin: `${stream.completed * 30 + 200}ms`,
      fill: 'freeze',
    });
    completeLine.appendChild(compAnim);
    svg.appendChild(completeLine);
  }

  // Error X
  if (stream.error !== undefined) {
    const cx = x + (stream.error / 100) * width;
    const size = 12;
    const errGroup = createSVGEl('g', { opacity: '0' });

    const line1 = createSVGEl('line', {
      x1: String(cx - size),
      y1: String(centerY - size),
      x2: String(cx + size),
      y2: String(centerY + size),
      stroke: '#f44747',
      'stroke-width': '3',
      'stroke-linecap': 'round',
    });
    const line2 = createSVGEl('line', {
      x1: String(cx + size),
      y1: String(centerY - size),
      x2: String(cx - size),
      y2: String(centerY + size),
      stroke: '#f44747',
      'stroke-width': '3',
      'stroke-linecap': 'round',
    });
    errGroup.appendChild(line1);
    errGroup.appendChild(line2);

    const errAnim = createSVGEl('animate', {
      attributeName: 'opacity',
      from: '0',
      to: '1',
      dur: '0.3s',
      begin: `${stream.error * 30 + 200}ms`,
      fill: 'freeze',
    });
    errGroup.appendChild(errAnim);
    svg.appendChild(errGroup);
  }
}

function createSVGEl(tag: string, attrs: Record<string, string>): SVGElement {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

// Live marble diagram that can be updated in real-time
export interface LiveMarble {
  addEvent(streamIndex: number, value: string, color?: string): void;
  complete(streamIndex: number): void;
  error(streamIndex: number): void;
  getElement(): HTMLElement;
}

export function createLiveMarbleDiagram(
  labels: string[],
  operatorLabel: string,
): LiveMarble {
  const startTime = performance.now();
  const duration = 10000; // 10s timeline
  const streams: { events: MarbleEvent[]; completed?: number; error?: number }[] =
    labels.map(() => ({ events: [] }));

  const container = document.createElement('div');
  container.className = 'marble-diagram marble-live';

  function getTimePercent(): number {
    return Math.min(((performance.now() - startTime) / duration) * 100, 95);
  }

  function render() {
    const diagram: MarbleDiagram = {
      inputs: labels.slice(0, -1).map((label, i) => ({
        label,
        events: streams[i].events,
        completed: streams[i].completed,
        error: streams[i].error,
      })),
      operator: operatorLabel,
      output: {
        label: labels[labels.length - 1],
        events: streams[labels.length - 1].events,
        completed: streams[labels.length - 1].completed,
        error: streams[labels.length - 1].error,
      },
    };

    const el = createMarbleDiagramEl(diagram);
    // Remove animations for live updates (instant display)
    el.querySelectorAll('animate').forEach((a) => {
      const target = a.parentElement;
      if (target && a.getAttribute('attributeName') === 'r') {
        target.setAttribute('r', a.getAttribute('to') || '14');
      }
      if (target && a.getAttribute('attributeName') === 'opacity') {
        target.setAttribute('opacity', a.getAttribute('to') || '1');
      }
      a.remove();
    });
    el.querySelectorAll('[opacity="0"]').forEach((e) => e.setAttribute('opacity', '1'));

    container.innerHTML = '';
    container.appendChild(el.firstChild!);
  }

  render();

  return {
    addEvent(streamIndex: number, value: string, color?: string) {
      streams[streamIndex].events.push({
        time: getTimePercent(),
        value,
        color,
      });
      render();
    },
    complete(streamIndex: number) {
      streams[streamIndex].completed = getTimePercent();
      render();
    },
    error(streamIndex: number) {
      streams[streamIndex].error = getTimePercent();
      render();
    },
    getElement() {
      return container;
    },
  };
}
