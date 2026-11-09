import { clampLevel, createFolding } from './model';

export const syncBlockFolding = (root: HTMLElement): void => {
  const isHidden = createFolding();

  for (const child of Array.from(root.children)) {
    if (!(child instanceof HTMLElement)) continue;
    const kind = child.dataset.b ?? 'p';
    const hidden = isHidden(
      kind,
      clampLevel(Number(child.dataset.level)),
      child.dataset.collapsed === 'true',
      kind === 'p' && (child.textContent ?? '') === '',
    );
    if (hidden) child.dataset.hidden = 'true';
    else delete child.dataset.hidden;
  }
};

const FOLD_DURATION_MS = 280;
const FOLD_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const FOLD_MAX_BLOCKS = 80;
const FOLD_PROPS = [
  'height',
  'minHeight',
  'marginTop',
  'marginBottom',
  'paddingTop',
  'paddingBottom',
] as const;

const getRootBlocks = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement);

const canAnimateFold = (): boolean =>
  typeof Element.prototype.animate === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const readFoldFrames = (element: HTMLElement): [Keyframe, Keyframe] => {
  const computed = getComputedStyle(element);
  const open: Keyframe = { opacity: '1' };
  const closed: Keyframe = { opacity: '0' };
  for (const prop of FOLD_PROPS) {
    open[prop] = computed[prop];
    closed[prop] = '0px';
  }
  return [open, closed];
};

const animateFold = (element: HTMLElement, isOpening: boolean): void => {
  const [open, closed] = readFoldFrames(element);
  element.style.overflow = 'hidden';

  const animation = element.animate(isOpening ? [closed, open] : [open, closed], {
    duration: FOLD_DURATION_MS,
    easing: FOLD_EASING,
    fill: isOpening ? 'none' : 'forwards',
  });

  animation.onfinish = () => {
    element.style.overflow = '';
    if (!isOpening) element.dataset.hidden = 'true';
    animation.cancel();
  };
};

const settleFolding = (blocks: readonly HTMLElement[]): void => {
  for (const block of blocks) {
    block.getAnimations().forEach((animation) => animation.cancel());
    block.style.overflow = '';
  }
};

const flipCollapsed = (block: HTMLElement): void => {
  if (block.dataset.collapsed === 'true') delete block.dataset.collapsed;
  else block.dataset.collapsed = 'true';
};

export const toggleBlockCollapsed = (block: HTMLElement): void => {
  const root = block.parentElement;
  if (!root) {
    flipCollapsed(block);
    return;
  }

  const blocks = getRootBlocks(root);
  if (!canAnimateFold()) {
    flipCollapsed(block);
    syncBlockFolding(root);
    return;
  }

  settleFolding(blocks);
  syncBlockFolding(root);
  const visibleBefore = new Set(blocks.filter((item) => item.dataset.hidden === undefined));

  flipCollapsed(block);
  syncBlockFolding(root);

  const changed = blocks.filter(
    (item) => (item.dataset.hidden === undefined) !== visibleBefore.has(item),
  );
  if (changed.length === 0 || changed.length > FOLD_MAX_BLOCKS) return;

  for (const item of changed) {
    const isOpening = item.dataset.hidden === undefined;
    if (!isOpening) delete item.dataset.hidden;
    animateFold(item, isOpening);
  }
};