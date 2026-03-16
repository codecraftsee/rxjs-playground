import type { Log } from './logger';
import type { MarbleDiagram } from './marble';

// Concepts
import * as conceptsColdObservable from './operators/concepts/coldObservable';
import * as conceptsHotObservable from './operators/concepts/hotObservable';
import * as conceptsColdVsHot from './operators/concepts/coldVsHot';

// Creation
import * as creationOf from './operators/creation/of';
import * as creationFrom from './operators/creation/from';
import * as creationInterval from './operators/creation/interval';
import * as creationTimer from './operators/creation/timer';
import * as creationFromEvent from './operators/creation/fromEvent';

// Transformation
import * as transformationMap from './operators/transformation/map';
import * as transformationSwitchMap from './operators/transformation/switchMap';
import * as transformationMergeMap from './operators/transformation/mergeMap';
import * as transformationConcatMap from './operators/transformation/concatMap';
import * as transformationScan from './operators/transformation/scan';

// Filtering
import * as filteringFilter from './operators/filtering/filter';
import * as filteringDebounceTime from './operators/filtering/debounceTime';
import * as filteringDistinctUntilChanged from './operators/filtering/distinctUntilChanged';
import * as filteringTake from './operators/filtering/take';
import * as filteringTakeUntil from './operators/filtering/takeUntil';

// Combination
import * as combinationCombineLatest from './operators/combination/combineLatest';
import * as combinationMerge from './operators/combination/merge';
import * as combinationForkJoin from './operators/combination/forkJoin';
import * as combinationZip from './operators/combination/zip';
import * as combinationConcat from './operators/combination/concat';

// Error Handling
import * as errorCatchError from './operators/error-handling/catchError';
import * as errorRetry from './operators/error-handling/retry';
import * as errorRetryWhen from './operators/error-handling/retryWhen';

// Utility
import * as utilityTap from './operators/utility/tap';
import * as utilityDelay from './operators/utility/delay';
import * as utilityFinalize from './operators/utility/finalize';
import * as utilityTimeout from './operators/utility/timeout';

// Multicasting
import * as multicastingShare from './operators/multicasting/share';
import * as multicastingShareReplay from './operators/multicasting/shareReplay';
import * as multicastingSubject from './operators/multicasting/subject';

export interface OperatorMeta {
  name: string;
  category: string;
  description: string;
  useCases: string[];
  sourceCode: string;
  marble?: MarbleDiagram;
  interactive?: boolean; // operator supports interactive input
}

export interface OperatorEntry extends OperatorMeta {
  run: (log: Log, interactiveEl?: HTMLElement) => import('rxjs').Subscription | void;
}

const categories = [
  'Concepts',
  'Creation',
  'Transformation',
  'Filtering',
  'Combination',
  'Error Handling',
  'Utility',
  'Multicasting',
] as const;

type OperatorModule = {
  meta: OperatorMeta;
  run: (log: Log, interactiveEl?: HTMLElement) => import('rxjs').Subscription | void;
};

function entry(mod: OperatorModule): OperatorEntry {
  return { ...mod.meta, run: mod.run };
}

const operators: OperatorEntry[] = [
  // Concepts
  entry(conceptsColdObservable),
  entry(conceptsHotObservable),
  entry(conceptsColdVsHot),
  // Creation
  entry(creationOf),
  entry(creationFrom),
  entry(creationInterval),
  entry(creationTimer),
  entry(creationFromEvent),
  // Transformation
  entry(transformationMap),
  entry(transformationSwitchMap),
  entry(transformationMergeMap),
  entry(transformationConcatMap),
  entry(transformationScan),
  // Filtering
  entry(filteringFilter),
  entry(filteringDebounceTime),
  entry(filteringDistinctUntilChanged),
  entry(filteringTake),
  entry(filteringTakeUntil),
  // Combination
  entry(combinationCombineLatest),
  entry(combinationMerge),
  entry(combinationForkJoin),
  entry(combinationZip),
  entry(combinationConcat),
  // Error Handling
  entry(errorCatchError),
  entry(errorRetry),
  entry(errorRetryWhen),
  // Utility
  entry(utilityTap),
  entry(utilityDelay),
  entry(utilityFinalize),
  entry(utilityTimeout),
  // Multicasting
  entry(multicastingShare),
  entry(multicastingShareReplay),
  entry(multicastingSubject),
];

export function getByCategory(): Map<string, OperatorEntry[]> {
  const map = new Map<string, OperatorEntry[]>();
  for (const cat of categories) map.set(cat, []);
  for (const op of operators) map.get(op.category)!.push(op);
  return map;
}
