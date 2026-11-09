import { REST_CARD_MOTION, getCardMotion, getParallaxShift } from '../cardMotion';
import type { CardMotion } from '../cardMotion';

export interface CarouselFrame {
  progress: number;
  width: number;
  isSettling: boolean;
}

interface SlotLayers {
  role: 'current' | 'neighbor';
  slot: HTMLElement;
  slide: HTMLElement | null;
  lead: HTMLElement | null;
  fixed: HTMLElement | null;
}

export const REST_FRAME: CarouselFrame = { progress: 0, width: 0, isSettling: false };

const PERSPECTIVE_PX = 900;
const OPACITY_DROP = 0.45;

const layersCache = new WeakMap<HTMLElement, SlotLayers[]>();

const collectLayers = (shift: HTMLElement): SlotLayers[] => {
  const layers: SlotLayers[] = [];
  for (const child of Array.from(shift.children)) {
    if (!(child instanceof HTMLElement)) continue;
    layers.push({
      role: child.dataset.role === 'neighbor' ? 'neighbor' : 'current',
      slot: child,
      slide: child.querySelector<HTMLElement>('[data-period-slide]'),
      lead: child.querySelector<HTMLElement>('[data-period-lead]'),
      fixed: child.querySelector<HTMLElement>('[data-period-fixed]'),
    });
  }
  return layers;
};

const getLayers = (shift: HTMLElement): SlotLayers[] => {
  const cached = layersCache.get(shift);
  if (cached) return cached;
  const layers = collectLayers(shift);
  layersCache.set(shift, layers);
  return layers;
};

const toTranslate = (value: number): string =>
  value === 0 ? '' : `translate3d(${value}px, 0, 0)`;

const applySlideMotion = (slide: HTMLElement, motion: CardMotion): void => {
  const { style } = slide;
  style.transform = `perspective(${PERSPECTIVE_PX}px) rotateY(${motion.tilt}deg) scale(${motion.scaleX}, ${motion.scaleY})`;
  style.transformOrigin = `${motion.originX}% 50%`;
  style.opacity = String(1 - OPACITY_DROP * motion.away);
};

export const invalidateCarouselLayers = (shift: HTMLElement): void => {
  layersCache.delete(shift);
};

export const paintCarousel = (
  shift: HTMLElement,
  { progress, width, isSettling }: CarouselFrame,
): void => {
  const settling = String(isSettling);
  if (shift.dataset.periodSettling !== settling) shift.dataset.periodSettling = settling;

  const leaving = progress === 0 ? REST_CARD_MOTION : getCardMotion(progress, 'leaving');
  const arriving = getCardMotion(progress, 'arriving');
  const parallax = getParallaxShift(progress, width);

  for (const layer of getLayers(shift)) {
    const isCurrent = layer.role === 'current';
    if (layer.slide) applySlideMotion(layer.slide, isCurrent ? leaving : arriving);
    if (layer.lead) layer.lead.style.transform = toTranslate(parallax.lead);
    if (layer.fixed) layer.fixed.style.transform = toTranslate(parallax.fixed);
    layer.slot.style.opacity = isCurrent ? '' : String(arriving.reveal);
  }
};