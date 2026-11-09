export type CardRole = 'leaving' | 'arriving';

export interface CardMotion {
  away: number;
  tilt: number;
  scaleX: number;
  scaleY: number;
  originX: number;
  reveal: number;
}

export interface ParallaxShift {
  fixed: number;
  lead: number;
}

export const REST_CARD_MOTION: CardMotion = {
  away: 0,
  tilt: 0,
    scaleX: 1,
  scaleY: 1,
  originX: 50,
  reveal: 1,
};

export const REST_PARALLAX: ParallaxShift = { fixed: 0, lead: 0 };

const MAX_TILT_DEG = 38;
const CARD_STRETCH_X = 0.3;
const CARD_SQUASH_Y = 0.12;
const ORIGIN_BLEND_RANGE = 0.125;
const PARALLAX_STRENGTH = 0.6;
const ARRIVAL_REVEAL_START = 0.1;
const ARRIVAL_REVEAL_END = 0.35;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const round = (value: number): number => Math.round(value * 1000) / 1000;

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);
const easeIn = (t: number): number => t * t;
const arrivalPulse = (amount: number): number => Math.sin(Math.PI * easeOut(amount));

export const getCardMotion = (progress: number, role: CardRole): CardMotion => {
  const amount = clamp(Math.abs(progress), 0, 1);
  const sign = Math.sign(progress);
  const away = role === 'leaving' ? amount : 1 - amount;
  const direction = role === 'leaving' ? -sign : sign;
  const tilt = round(direction * MAX_TILT_DEG * away);
  const originX = round(50 - 50 * clamp(progress / ORIGIN_BLEND_RANGE, -1, 1));

  if (role === 'leaving') {
    return {
      away: round(away),
      tilt,
      originX,
      scaleX: round(1 + CARD_STRETCH_X * away),
      scaleY: round(1 - CARD_SQUASH_Y * away),
      reveal: 1,
    };
  }

  const pulse = arrivalPulse(amount);

  return {
    away: round(away),
    tilt,
    originX,
    scaleX: round(1 + CARD_STRETCH_X * pulse),
    scaleY: round(1 - CARD_SQUASH_Y * pulse),
    reveal: round(
      easeIn(
        clamp(
          (amount - ARRIVAL_REVEAL_START) / (ARRIVAL_REVEAL_END - ARRIVAL_REVEAL_START),
          0,
          1,
        ),
      ),
    ),
  };
};

export const getParallaxShift = (progress: number, travel: number): ParallaxShift => {
  const amount = clamp(Math.abs(progress), 0, 1);
  if (travel <= 0 || amount === 0) return REST_PARALLAX;

  const sign = Math.sign(progress);
  const lead = amount + PARALLAX_STRENGTH * (easeOut(amount) - amount);

  return {
    fixed: Math.round(-sign * travel * amount * 100) / 100,
    lead: Math.round(sign * travel * (lead - amount) * 100) / 100,
  };
};