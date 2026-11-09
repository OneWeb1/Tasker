import type { ReactNode } from 'react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { CheckIcon } from '@/shared/ui/icons';

interface OptionSheetOption<T extends string> {
  value: T;
  label: string;
  leading?: ReactNode;
}

interface OptionSheetProps<T extends string> {
  isOpen: boolean;
  title: string;
  options: readonly OptionSheetOption<T>[];
  value: T;
   onSelect: (value: T) => void;
   onClose: () => void;
   onExited?: () => void;
  }

export function OptionSheet<T extends string>({
  isOpen,
  title,
  options,
  value,
   onSelect,
   onClose,
   onExited,
  }: OptionSheetProps<T>) {
   return (
     <BottomSheet isOpen={isOpen} title={title} onClose={onClose} onExited={onExited}>
      <MenuGroup>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            icon={option.leading}
            label={option.label}
            isSelected={option.value === value}
            trailing={option.value === value ? <CheckIcon width={20} height={20} /> : undefined}
            onClick={() => onSelect(option.value)}
          />
        ))}
      </MenuGroup>
    </BottomSheet>
  );
}