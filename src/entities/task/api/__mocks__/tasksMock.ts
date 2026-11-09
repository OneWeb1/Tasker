import { toDateKey } from '@/shared/lib/utils/date';
import type { Task } from '../../model/types/task';

const today = toDateKey(new Date());

export const tasksMock: Task[] = [
{
    id: 'task-1',
    title: 'Узгодити макет',
    description: 'Узгодити фінальний макет другої версії дашборду з командою дизайну.',
    categoryId: 'hot',
    projectId: 'project-launch',
    date: today,
    startTime: '12:00',
    endTime: '13:00',
    status: 'active',
    priority: 'medium',
    subtasks: [
      { id: 'task-1-subtask-1', title: 'Зібрати правки', done: true },
      { id: 'task-1-subtask-2', title: 'Погодити фінальну версію', done: false },
    ],
    checklists: [
      {
        id: 'task-1-checklist-1',
        title: 'Перед зустріччю',
        items: [
          { id: 'task-1-checklist-1-item-1', title: 'Підготувати презентацію', done: true },
          { id: 'task-1-checklist-1-item-2', title: 'Надіслати запрошення', done: false },
        ],
      },
    ],
  },
{
    id: 'task-2',
    title: 'Перевірити готовність',
    description: 'Команда завершить етап ідеації, узагальнивши та уточнивши всі концепції.',
    categoryId: 'hot',
    projectId: 'project-launch',
    date: today,
    startTime: '09:00',
    endTime: '09:30',
    status: 'active',
    priority: 'high',
    subtasks: Array.from({ length: 8 }, (_, index) => ({
      id: `task-2-subtask-${index + 1}`,
      title: `Підзавдання ${index + 1}`,
      done: index < 6,
    })),
  },
{
    id: 'task-3',
    title: 'Розібрати відгуки',
    categoryId: 'growth',
    projectId: 'project-growth',
    date: today,
    startTime: '09:30',
    endTime: '11:30',
    status: 'active',
    priority: 'low',
  },
  { id: 'task-4', title: 'Підготувати нотатки', categoryId: 'other', projectId: 'project-launch', date: today, startTime: '14:00', endTime: '15:00', status: 'active' },
  { id: 'task-5', title: 'Записатися на заняття', categoryId: 'other', projectId: 'project-personal', date: today, startTime: null, endTime: null, status: 'active' },
  { id: 'task-6', title: 'Оновити портфоліо', categoryId: 'growth', projectId: 'project-growth', date: today, startTime: null, endTime: null, status: 'postponed' },
];