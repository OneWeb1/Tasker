import { BottomSheet } from '@/shared/ui/BottomSheet';
import { RangeCalendar } from '@/shared/ui/RangeCalendar';

interface MonthPickerProps {
  isOpen: boolean;
  monthKey: string;
  selectedDate: string;
  today: string;
  minDate?: string;
  maxDate?: string;
  onClose: () => void;
  onMonthChange: (monthKey: string) => void;
  onSelectDate: (dateKey: string) => void;
}

export function MonthPicker({
  isOpen,
  monthKey,
  selectedDate,
  today,
  minDate,
  maxDate,
  onClose,
  onMonthChange,
  onSelectDate,
}: MonthPickerProps) {
  return (
    <BottomSheet isOpen={isOpen} title="Оберіть дату" onClose={onClose}>
      <RangeCalendar
        monthKey={monthKey}
        start={selectedDate}
        end={null}
        today={today}
        minDate={minDate}
        maxDate={maxDate}
        onSelect={onSelectDate}
        onMonthChange={onMonthChange}
      />
    </BottomSheet>
  );
}