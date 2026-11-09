import type { Note, NoteSection } from '@/entities/note';
import { buildJsonPrompt } from '@/shared/lib/utils/json';
import type { JsonPromptField } from '@/shared/lib/utils/json';
import { NOTE_SECTION_JSON_EXAMPLE } from '../../constants/jsonExamples';
import { serializeNote } from '../buildNoteContextPrompt/buildNoteContextPrompt';
import {
  NOTE_JSON_RULES,
  buildNoteContext,
} from '../buildNoteJsonPrompt/buildNoteJsonPrompt';
import { splitNoteSection } from '../noteSectionBlock';

const NOTE_SECTION_JSON_FIELDS: readonly JsonPromptField[] = [
  {
    name: 'title',
    type: 'рядок',
    required: true,
    description: 'Заголовок блока (текст після маркера [+]/[-]).',
  },
  {
    name: 'content',
    type: 'рядок',
    description:
      'Вміст усередині блока в Markdown-діалекті застосунку (синтаксис — у розділі «Контекст»), без рядка заголовка "[+]/[-]" і без завершального "[/]" самого цього блока. Вкладені блоки записуй парами [+]/[-] … [/]. Рядки розділяй символом \\n.',
  },
  {
    name: 'isCollapsed',
    type: 'boolean',
    description: 'true, якщо блок має бути згорнутим. Інакше пропусти поле.',
  },
];

const RULES: readonly string[] = [
  'Повна нотатка верхнього рівня нижче — лише контекст, щоб ти розумів загальну тему та сусідні розділи.',
  'Змінюй виключно цільовий блок і його вміст: текст, списки, таблиці, вкладені блоки. Решту нотатки не змінюй і не повертай.',
  'Поверни повний оновлений JSON саме цільового блока (а не всієї нотатки і не лише зміни). Те, що користувач не просив змінювати, залиш без змін.',
  'Рядки виду <!--attachments:…--> у content — це вкладення користувача. Залиш їх без змін, окремими рядками.',
  'Не додавай у content рядок заголовка цільового блока та його завершальний [/]; вкладені блоки закривай власним [/].',
];

export const buildNoteSectionPrompt = (
  note: Note,
  section: NoteSection,
  projectTitle: string | undefined,
): string => {
  const { title, content, isCollapsed } = splitNoteSection(section);
  const location = [note.title, ...section.path, title]
    .map((item) => `«${item.trim() || 'Без назви'}»`)
    .join(' → ');
  const target = {
    title,
    ...(content !== '' ? { content } : {}),
    ...(isCollapsed ? { isCollapsed: true } : {}),
  };

  return buildJsonPrompt({
    subject: 'блока нотатки',
    intro:
      'Ти — досвідчений помічник застосунку-планувальника. Тобі надано повну нотатку верхнього рівня як контекст. Твоє завдання — професійно покращувати лише один її згортаний блок і вміст усередині нього: структурувати текст, виправляти формулювання, додавати списки, таблиці та вкладені блоки.',
    fields: NOTE_SECTION_JSON_FIELDS,
    rules: [...NOTE_JSON_RULES, ...RULES],
    context: [
      `Цільовий блок розташований за шляхом: ${location}. Змінюй лише його.`,
      ...buildNoteContext({ existingTags: [], projectTitles: [] }),
    ],
    example: NOTE_SECTION_JSON_EXAMPLE,
    outro: [
      'Повна нотатка верхнього рівня (JSON, лише контекст):',
      JSON.stringify(serializeNote(note, projectTitle), null, 2),
      '',
      'Цільовий блок (JSON) — саме його потрібно змінити та повернути:',
      JSON.stringify(target, null, 2),
      '',
      'Далі користувач опише, що саме потрібно покращити чи доповнити в цьому блоці.',
    ].join('\n'),
  });
};