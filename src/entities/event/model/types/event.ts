import type { CategoryId } from '@/entities/category';
import type { EventSource } from '../constants/eventSources';

export type CalendarEvent = {
  id: string;
  title: string;
  categoryId: CategoryId;
  projectId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  source: EventSource;
  isDone?: boolean;
};