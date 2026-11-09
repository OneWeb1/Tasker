import type { Note } from '../../model/types/note';

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.now();

export const notesMock: Note[] = [
  { id: 'note-1', title: 'Ідеї для запуску', content: 'Підготувати анонс, зібрати відгуки перших користувачів та описати план релізу.', updatedAt: now },
  { id: 'note-2', title: 'Список покупок', content: 'Кава, ноутбук-стенд, блокнот для планування.', updatedAt: now - DAY_MS },
  { id: 'note-3', title: 'Плани на тиждень', content: 'Розібрати вхідні, закрити гарячі завдання, залишити час на розвиток.', updatedAt: now - 3 * DAY_MS },
];