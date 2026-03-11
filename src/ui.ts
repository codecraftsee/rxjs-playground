import type { OperatorEntry } from './registry';

export interface UIHandles {
  outputEl: HTMLElement;
  marbleEl: HTMLElement;
  interactiveEl: HTMLElement;
  clearOutput: () => void;
  clearAll: () => void;
  setActive: (name: string) => void;
  showOperatorDetails: (op: OperatorEntry) => void;
}

export function initUI(
  appEl: HTMLElement,
  operatorsByCategory: Map<string, OperatorEntry[]>,
  onSelect: (op: OperatorEntry) => void,
): UIHandles {
  appEl.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <h1 class="sidebar-title">RxJS Playground</h1>
        <nav id="nav"></nav>
      </aside>
      <main class="main">
        <div class="toolbar">
          <button id="btn-run" title="Re-run demo">Run</button>
          <button id="btn-stop" title="Stop running demo">Stop</button>
          <button id="btn-clear" title="Clear output">Clear</button>
        </div>
        <div class="content-area">
          <div class="top-panels">
            <div class="panel marble-panel">
              <div class="panel-header">Marble Diagram</div>
              <div id="marble" class="panel-body"></div>
            </div>
            <div class="panel code-panel">
              <div class="panel-header">Source Code</div>
              <pre id="source-code" class="panel-body code-body"></pre>
            </div>
          </div>
          <div id="interactive-area" class="interactive-area"></div>
          <div class="panel use-cases-panel">
            <div class="panel-header">Real-World Use Cases</div>
            <div id="use-cases" class="panel-body use-cases-body"></div>
          </div>
          <div class="panel output-panel">
            <div class="panel-header">Output</div>
            <div id="output" class="panel-body output"></div>
          </div>
        </div>
        <div id="welcome" class="welcome">
          <div class="welcome-inner">
            <h2>Welcome to RxJS Playground</h2>
            <p>Select an operator from the sidebar to explore animated marble diagrams, interactive demos, real-world use cases, and source code.</p>
          </div>
        </div>
      </main>
    </div>
  `;

  const nav = appEl.querySelector('#nav')!;
  const outputEl = appEl.querySelector('#output') as HTMLElement;
  const marbleEl = appEl.querySelector('#marble') as HTMLElement;
  const interactiveEl = appEl.querySelector('#interactive-area') as HTMLElement;
  const sourceCodeEl = appEl.querySelector('#source-code') as HTMLElement;
  const useCasesEl = appEl.querySelector('#use-cases') as HTMLElement;
  const contentArea = appEl.querySelector('.content-area') as HTMLElement;
  const welcome = appEl.querySelector('#welcome') as HTMLElement;
  const allItems: HTMLElement[] = [];

  for (const [category, ops] of operatorsByCategory) {
    const group = document.createElement('div');
    group.className = 'nav-group';

    const header = document.createElement('div');
    header.className = 'nav-category';
    header.textContent = category;
    group.appendChild(header);

    for (const op of ops) {
      const item = document.createElement('div');
      item.className = 'nav-item';
      item.textContent = op.name;
      item.dataset.name = op.name;
      item.addEventListener('click', () => onSelect(op));
      group.appendChild(item);
      allItems.push(item);
    }

    nav.appendChild(group);
  }

  function setActive(name: string) {
    for (const item of allItems) {
      item.classList.toggle('active', item.dataset.name === name);
    }
  }

  function clearOutput() {
    outputEl.innerHTML = '';
  }

  function clearAll() {
    outputEl.innerHTML = '';
    marbleEl.innerHTML = '';
    interactiveEl.innerHTML = '';
    interactiveEl.style.display = 'none';
  }

  function showOperatorDetails(op: OperatorEntry) {
    welcome.style.display = 'none';
    contentArea.style.display = 'flex';

    // Source code
    sourceCodeEl.textContent = op.sourceCode;

    // Use cases
    useCasesEl.innerHTML = '';
    for (const uc of op.useCases) {
      const li = document.createElement('div');
      li.className = 'use-case-item';
      li.textContent = uc;
      useCasesEl.appendChild(li);
    }

    // Interactive area
    if (op.interactive) {
      interactiveEl.style.display = 'block';
    } else {
      interactiveEl.style.display = 'none';
    }
  }

  appEl.querySelector('#btn-clear')!.addEventListener('click', clearOutput);

  return { outputEl, marbleEl, interactiveEl, clearOutput, clearAll, setActive, showOperatorDetails };
}
