const ROLE_SELECTOR = (role: 'enter' | 'peek'): string =>
  `:scope > div[data-role="${role}"], :scope > header[data-role="${role}"]`;

export interface PageSwipeView {
  offset: number;
  width: number;
  direction: 1 | -1;
}

interface SwipeLayers {
  enter: HTMLElement[];
  peek: HTMLElement[];
}

const layersCache = new WeakMap<HTMLElement, SwipeLayers>();

const queryLayers = (stage: HTMLElement, role: 'enter' | 'peek'): HTMLElement[] =>
  Array.from(stage.querySelectorAll<HTMLElement>(ROLE_SELECTOR(role)));

const getLayers = (stage: HTMLElement): SwipeLayers => {
  const cached = layersCache.get(stage);
  if (cached && cached.peek.length > 0) return cached;

  const layers: SwipeLayers = {
    enter: queryLayers(stage, 'enter'),
    peek: queryLayers(stage, 'peek'),
  };
  layersCache.set(stage, layers);
  return layers;
};

export const renderPageSwipe = (stage: HTMLElement, view: PageSwipeView): void => {
  const layers = getLayers(stage);
  const currentTransform = view.offset === 0 ? '' : `translate3d(${view.offset}px, 0, 0)`;
  for (const element of layers.enter) element.style.transform = currentTransform;

  if (view.width > 0) {
    const shift = view.direction > 0 ? -view.width : view.width;
    const peekTransform = `translate3d(${view.offset + shift}px, 0, 0)`;
    for (const element of layers.peek) element.style.transform = peekTransform;
  }
};

export const resetPageSwipe = (stage: HTMLElement): void => {
  const cached = layersCache.get(stage);
  const enter = cached ? cached.enter : queryLayers(stage, 'enter');
  for (const element of enter) element.style.transform = '';
  layersCache.delete(stage);
};