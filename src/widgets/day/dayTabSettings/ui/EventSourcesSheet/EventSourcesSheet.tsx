import { useConnectedCalendars } from '@/features/settings/connectCalendars';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuToggleRow } from '@/shared/ui/MenuToggleRow';

interface EventSourcesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EventSourcesSheet({ isOpen, onClose }: EventSourcesSheetProps) {
  const { calendars, toggleCalendar } = useConnectedCalendars();

  return (
    <BottomSheet isOpen={isOpen} title="Календарі подій" onClose={onClose}>
      <MenuGroup>
        {calendars.map(({ source, label, isConnected }) => (
          <MenuToggleRow
            key={source}
            label={label}
            checked={isConnected}
            onChange={() => toggleCalendar(source)}
          />
        ))}
      </MenuGroup>
    </BottomSheet>
  );
}