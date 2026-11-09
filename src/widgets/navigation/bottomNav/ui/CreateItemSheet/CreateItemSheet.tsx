import type { ReactNode } from 'react';
import { CREATE_ITEM_KIND_ITEMS } from '@/features/createItem';
import type { CreateItemKind } from '@/features/createItem';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { CheckIcon, ChecklistAddIcon, ListIcon, NotesIcon } from '@/shared/ui/icons';
import styles from './CreateItemSheet.module.css';

const ICONS: Record<CreateItemKind, ReactNode> = {
  task: <CheckIcon width={26} height={26} />,
  note: <NotesIcon width={26} height={26} />,
  category: <ListIcon width={26} height={26} />,
};

interface CreateItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (kind: CreateItemKind) => void;
  onImportPlan: () => void;
}

export function CreateItemSheet({ isOpen, onClose, onSelect, onImportPlan }: CreateItemSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Створити" onClose={onClose}>
      <MenuGroup>
        {CREATE_ITEM_KIND_ITEMS.map((item) => (
          <MenuItem
            key={item.value}
            icon={<span className={styles[item.value]}>{ICONS[item.value]}</span>}
            label={item.label}
            onClick={() => onSelect(item.value)}
          />
        ))}
        <MenuItem
          icon={
            <span className={styles.plan}>
              <ChecklistAddIcon width={26} height={26} />
            </span>
          }
          label="Імпорт плану з ШІ"
          onClick={onImportPlan}
        />
      </MenuGroup>
    </BottomSheet>
  );
}