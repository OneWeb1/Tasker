const VELOCITY_SMOOTHING = 0.6;
const STALE_VELOCITY_MS = 100;

export interface VelocityTracker {
  start: (x: number, time: number) => void;
  move: (x: number, time: number) => void;
  read: (time: number) => number;
}

export const createVelocityTracker = (): VelocityTracker => {
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;

  return {
    start: (x, time) => {
      lastX = x;
      lastTime = time;
      velocity = 0;
    },
    move: (x, time) => {
      const dt = time - lastTime;
      if (dt <= 0) return;
      const instant = (x - lastX) / dt;
      velocity = velocity * (1 - VELOCITY_SMOOTHING) + instant * VELOCITY_SMOOTHING;
      lastX = x;
      lastTime = time;
    },
    read: (time) => (time - lastTime > STALE_VELOCITY_MS ? 0 : velocity),
  };
};