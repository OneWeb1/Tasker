import type { ComponentType, SVGProps } from 'react';
import { ArrowRightIcon, CalendarIcon, RestoreIcon } from '@/shared/ui/icons';
import type { DatePreset, DatePresetIcon } from '../../model/lib/buildDatePresets';
import styles from './DatePresets.module.css';

const ICONS: Record<DatePresetIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  tomorrow: ArrowRightIcon,
  week: CalendarIcon,
  nextWeek: RestoreIcon,
};

interface DatePresetsProps {
  presets: readonly DatePreset[];
  onSelect: (preset: DatePreset) => void;
}

export function DatePresets({ presets, onSelect }: DatePresetsProps) {
  return (
    <div className={styles.presets} role="group" aria-label="Швидкий вибір дат">
      {presets.map((preset) => {
        const Icon = preset.icon ? ICONS[preset.icon] : null;
        return (
          <button
            key={preset.id}
            type="button"
            className={styles.preset}
            onClick={() => onSelect(preset)}
          >
            {Icon && <Icon width={16} height={16} aria-hidden="true" />}
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}