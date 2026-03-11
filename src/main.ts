import { Subscription } from 'rxjs';
import { getByCategory } from './registry';
import type { OperatorEntry } from './registry';
import { createLog } from './logger';
import { createMarbleDiagramEl } from './marble';
import { initUI } from './ui';
import './style.css';

let currentSub: Subscription | undefined;
let currentOp: OperatorEntry | undefined;

const app = document.getElementById('app')!;
const byCategory = getByCategory();

const ui = initUI(app, byCategory, selectOperator);

function selectOperator(op: OperatorEntry) {
  currentSub?.unsubscribe();
  ui.clearAll();
  ui.setActive(op.name);
  ui.showOperatorDetails(op);
  currentOp = op;
  location.hash = op.name;

  // Render static marble diagram if available
  if (op.marble) {
    ui.marbleEl.innerHTML = '';
    ui.marbleEl.appendChild(createMarbleDiagramEl(op.marble));
  } else {
    ui.marbleEl.innerHTML = '<div class="marble-placeholder">No marble diagram for this operator</div>';
  }

  runDemo(op);
}

function runDemo(op: OperatorEntry) {
  ui.clearOutput();
  const log = createLog(ui.outputEl);
  log.info(op.description);
  log.info('---');

  const result = op.run(log, op.interactive ? ui.interactiveEl : undefined);
  currentSub = result ?? undefined;
}

// Stop button
document.getElementById('btn-stop')?.addEventListener('click', () => {
  currentSub?.unsubscribe();
  currentSub = undefined;
  const log = createLog(ui.outputEl);
  log.info('Stopped.');
});

// Run button (re-run current)
document.getElementById('btn-run')?.addEventListener('click', () => {
  if (currentOp) {
    currentSub?.unsubscribe();
    runDemo(currentOp);
  }
});

// Hash-based deep linking
const hash = location.hash.slice(1);
if (hash) {
  for (const ops of byCategory.values()) {
    const found = ops.find((op) => op.name === hash);
    if (found) {
      selectOperator(found);
      break;
    }
  }
}
