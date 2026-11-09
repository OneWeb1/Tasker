import {
  REDUCED_MOTION_DURATION,
  SETTLE_DURATION_MS,
  SETTLE_EASING,
} from '../../model/constants';

export const setTargetOffset = (target: HTMLElement, value: number): void => {
  target.style.transform = value === 0 ? '' : `translate3d(${value}px, 0, 0)`;
};

export const prepareTarget = (target: HTMLElement): void => {
  target.style.willChange = 'transform';
};

export const startTargetSettle = (
  target: HTMLElement,
  isReducedMotion: boolean,
  durationMs = SETTLE_DURATION_MS,
): void => {
  const duration = isReducedMotion ? REDUCED_MOTION_DURATION : `${durationMs}ms`;
  target.style.transition = `transform ${duration} ${SETTLE_EASING}`;
};

export const releaseTarget = (target: HTMLElement): void => {
  target.style.transition = '';
  target.style.willChange = '';
};