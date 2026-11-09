import { NOTE_SORT_OPTIONS, useNoteSort } from '@/features/note/sortNotes';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';

interface NotesSortSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotesSortSheet({ isOpen, onClose }: NotesSortSheetProps) {
  const { order, setOrder } = useNoteSort();

  return (
    <BottomSheet isOpen={isOpen} title="Сортування нотаток" onClose={onClose}>
      <MenuGroup>
      {NOTE_SORT_OPTIONS.map(({ value, label, icon: Icon }) => {
        return (
          <MenuItem
            key={value}
            icon={<Icon width={22} height={22} />}
            label={label}
            isSelected={value === order}
            onClick={() => {
              setOrder(value);
              onClose();
            }}
          />
        );
      })}
      </MenuGroup>
    </BottomSheet>
  );
}