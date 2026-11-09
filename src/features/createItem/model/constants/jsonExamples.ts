import { TASK_PRIORITY_LABELS } from '@/entities/task';

const stringify = (value: unknown): string => JSON.stringify(value, null, 2);

export const createTaskJsonExample = (date: string): string =>
  stringify({
  title: 'Підготувати звіт',
  description: 'Зібрати дані за місяць',
  date,
  startTime: '09:00',
  endTime: '10:00',
  schedule: 'weekly',
  weekdays: [1, 3, 5],
  priority: Object.keys(TASK_PRIORITY_LABELS)[0],
  subtasks: [{ title: 'Зібрати цифри', done: false }],
  checklists: [{ title: 'Перевірка', items: [{ title: 'Пункт 1' }] }],
});

export const createSubtaskJsonExample = (date: string): string =>
  stringify({
    title: 'Зібрати цифри',
    done: false,
    description: 'Вивантажити дані з усіх джерел',
    priority: Object.keys(TASK_PRIORITY_LABELS)[0],
    date,
    startTime: '09:00',
    endTime: '10:00',
    subtasks: [{ title: 'Вивантажити дані', done: false }],
    checklists: [{ title: 'Перевірка', items: [{ title: 'Пункт 1' }] }],
  });

const NOTE_EXAMPLE_CONTENT = [
  '<!--center-->## План поїздки',
  '',
  'Головне: **не поспішати**, _перевірити_ <u>документи</u>, ==ключова дата== і ~~зайве~~ не брати.',
  '',
  '### Перед виїздом',
  '- [ ] Купити квитки',
  '- [x] Забронювати житло',
  '  - [ ] Надіслати підтвердження',
  '',
  '1. Зібрати речі',
  '2. Перевірити `паспорт`',
  '',
  '> Головне — відпочити.',
  '> [!info] Квитки діють лише в день поїздки.',
  '',
  '| Пункт | Статус |',
  '| --- | --- |',
  '| Квитки | куплено |',
  '| Житло | заброньовано |',
  '',
  '[-] Запасний варіант',
  'Маршрут через Краків, якщо рейс скасують.',
  '[+] Вартість',
  '| Пункт | Сума |',
  '| --- | --- |',
  '| Квиток | 450 грн |',
  '[/]',
  '[/]',
  '',
  '---',
  '',
  '```',
  'ticket: LV-2026',
  '```',
  '',
  'Деталі: [сайт перевізника](https://example.com).',
  '',
  '[[media: Фото бронювання]]',
  '',
  '[[file: Квитки (PDF)]]',
].join('\n');

export const NOTE_JSON_EXAMPLE = stringify({
  title: 'Поїздка до Львова',
  content: NOTE_EXAMPLE_CONTENT,
  tags: ['подорожі', 'плани'],
  textAlign: 'left',
  color: '#4f7bc0',
});

const NOTE_SECTION_EXAMPLE_CONTENT = [
  '| Пункт | Сума |',
  '| --- | --- |',
  '| Квиток | 450 грн |',
  '',
  '[-] Знижки',
  'Студентська знижка 10%.',
  '[/]',
].join('\n');

export const NOTE_SECTION_JSON_EXAMPLE = stringify({
  title: 'Вартість',
  content: NOTE_SECTION_EXAMPLE_CONTENT,
});

export const createPlanJsonExample = (date: string): string =>
  stringify({
    project: { title: 'Дохід 5k$ за рік', emoji: '💰' },
    categories: [
      {
        title: 'Навчання',
        emoji: '📚',
        color: '#4f7bc0',
        tasks: [
          {
            title: 'Ранкова практика',
            date,
            startTime: '05:00',
            endTime: '06:30',
            schedule: 'weekly',
            weekdays: [1, 2, 3, 4, 5, 6, 0],
            subtasks: [{ title: 'Розминка' }, { title: 'Фокус-сесія' }],
          },
        ],
      },
      {
        title: 'Клієнти',
        emoji: '🤝',
        tasks: [
          {
            title: 'Знайти перших клієнтів',
            date,
            schedule: 'month',
            checklists: [{ title: 'Кроки', items: [{ title: 'Скласти список' }] }],
          },
        ],
      },
    ],
  });