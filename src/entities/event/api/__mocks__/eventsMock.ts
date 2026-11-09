import { toDateKey } from '@/shared/lib/utils/date';
import type { CalendarEvent } from '../../model/types/event';

const today = toDateKey(new Date());

export const eventsMock: CalendarEvent[] = [
  { id: 'event-1', title: 'Планерка команди', categoryId: 'hot', projectId: 'project-launch', date: today, startTime: '11:30', endTime: '12:00', source: 'google' },
  { id: 'event-2', title: 'Дзвінок із клієнтом', categoryId: 'growth', projectId: 'project-growth', date: today, startTime: '13:00', endTime: '14:00', source: 'outlook' },
  { id: 'event-3', title: 'Тренування', categoryId: 'other', projectId: 'project-personal', date: today, startTime: '16:00', endTime: '17:00', source: 'apple' },
];