import type { CSSProperties } from 'react';
import type { CategoryColor } from '../../model/types/category';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const isHexColor = (color: CategoryColor): boolean => HEX_COLOR.test(color);

export const getCategoryColorStyle = (color: CategoryColor): CSSProperties | undefined =>
  isHexColor(color)
    ? ({
        '--category-solid': color,
        '--category-soft': `color-mix(in srgb, ${color} 22%, var(--color-bg))`,
      } as CSSProperties)
    : undefined;