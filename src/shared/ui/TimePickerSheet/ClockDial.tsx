import type { PointerEvent } from 'react';
import styles from './ClockDial.module.css';

export type ClockUnit = 'hours' | 'minutes';

interface ClockDialProps {
  unit: ClockUnit;
  value: number;
  onChange: (value: number) => void;
  onCommit: () => void;
}

interface Mark {
  value: number;
  angle: number;
  radius: number;
  isInner: boolean;
}

const SLOTS = 12;
const SLOT_ANGLE = 30;
const MINUTE_ANGLE = 6;
const MINUTE_STEP = 5;
const OUTER_RADIUS = 40;
const INNER_RADIUS = 26;
const INNER_THRESHOLD = (OUTER_RADIUS + INNER_RADIUS) / 2 / 50;

export const padTime = (value: number): string => String(value).padStart(2, '0');

const formatValue = (unit: ClockUnit, value: number): string =>
  unit === 'minutes' || value === 0 ? padTime(value) : String(value);

const HOUR_MARKS: Mark[] = Array.from({ length: SLOTS }, (_, slot) => slot).flatMap((slot) => [
  { value: slot === 0 ? 12 : slot, angle: slot * SLOT_ANGLE, radius: OUTER_RADIUS, isInner: false },
  { value: slot === 0 ? 0 : 12 + slot, angle: slot * SLOT_ANGLE, radius: INNER_RADIUS, isInner: true },
]);

const MINUTE_MARKS: Mark[] = Array.from({ length: SLOTS }, (_, slot) => ({
  value: slot * MINUTE_STEP,
  angle: slot * SLOT_ANGLE,
  radius: OUTER_RADIUS,
  isInner: false,
}));

const isInnerHour = (hour: number): boolean => hour === 0 || hour > 12;

const polar = (angle: number, radius: number) => {
  const radians = (angle * Math.PI) / 180;
  return { x: 50 + radius * Math.sin(radians), y: 50 - radius * Math.cos(radians) };
};

const getHand = (unit: ClockUnit, value: number) =>
  unit === 'minutes'
    ? { angle: value * MINUTE_ANGLE, radius: OUTER_RADIUS }
    : {
        angle: (value % 12) * SLOT_ANGLE,
        radius: isInnerHour(value) ? INNER_RADIUS : OUTER_RADIUS,
      };

const resolveValue = (unit: ClockUnit, event: PointerEvent<HTMLElement>): number => {
  const rect = event.currentTarget.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;

  if (unit === 'minutes') return Math.round(angle / MINUTE_ANGLE) % 60;

  const slot = Math.round(angle / SLOT_ANGLE) % SLOTS;
  const isInner = Math.hypot(dx, dy) / (rect.width / 2) < INNER_THRESHOLD;
  if (isInner) return slot === 0 ? 0 : 12 + slot;
  return slot === 0 ? 12 : slot;
};

export function ClockDial({ unit, value, onChange, onCommit }: ClockDialProps) {
  const marks = unit === 'hours' ? HOUR_MARKS : MINUTE_MARKS;
  const hand = getHand(unit, value);
  const knob = polar(hand.angle, hand.radius);

  return (
    <div
      className={styles.dial}
      role="group"
      aria-label={unit === 'hours' ? 'Вибір годин' : 'Вибір хвилин'}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onChange(resolveValue(unit, event));
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        onChange(resolveValue(unit, event));
      }}
      onPointerUp={onCommit}
    >
      {marks.map((mark) => {
        const { x, y } = polar(mark.angle, mark.radius);
        return (
          <span
            key={`${unit}:${mark.isInner}:${mark.value}`}
            className={styles.mark}
            data-inner={mark.isInner}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {formatValue(unit, mark.value)}
          </span>
        );
      })}
      <span
        className={styles.hand}
        style={{ height: `${hand.radius}%`, transform: `rotate(${hand.angle}deg)` }}
      />
      <span className={styles.knob} style={{ left: `${knob.x}%`, top: `${knob.y}%` }}>
        {formatValue(unit, value)}
      </span>
      <span className={styles.center} />
    </div>
  );
}