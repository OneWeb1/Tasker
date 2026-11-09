import type { Note } from '@/entities/note';
import { buildJsonPrompt } from '@/shared/lib/utils/json';
import { NOTE_JSON_EXAMPLE } from '../../constants/jsonExamples';
import { collapseToggleBlocks } from '../noteToggleBlocks';
import {
  NOTE_JSON_FIELDS,
  NOTE_JSON_RULES,
  buildNoteContext,
} from '../buildNoteJsonPrompt/buildNoteJsonPrompt';
import type { NotePromptContext } from '../buildNoteJsonPrompt/buildNoteJsonPrompt';

export interface NoteContextPromptOptions extends NotePromptContext {
  projectTitle?: string;
  selection?: string;
}

const SELECTION_RULES: readonly string[] = [
  'Користувач виділив фрагмент тексту нотатки. Змінюй лише цей фрагмент (і те, що з ним безпосередньо пов’язано), а решту нотатки поверни без змін.',
  'Виділений фрагмент наведено як звичайний текст без розмітки: знайди його в content і заміни покращеним варіантом, зберігаючи навколишню структуру та форматування.',
];

const RULES: readonly string[] = [
  'Працюй із поточною нотаткою нижче: покращуй, доповнюй, структуруй або виправляй її так, як попросить користувач.',
  'Поверни повний оновлений JSON нотатки (а не лише зміни). Те, що користувач не просив змінювати, залиш без змін.',
  'Рядки виду <!--attachments:…--> у content — це вкладення користувача. Залиш їх без змін, окремими рядками, на доречних місцях.',
  'Поля tags, project, color і textAlign зі поточної нотатки зберігай, якщо користувач не просив їх змінити. Щоб прибрати project, color чи вирівнювання, пропусти поле; щоб прибрати всі теги, поверни "tags": [].',
  'Щоб зняти закріплення або повернути нотатку з архіву, поверни isPinned або isArchived зі значенням false.',
  'У content згортані блоки позначені парою "[+]/[-] Заголовок" … "[/]". Зберігай цей синтаксис, дописуй нові блоки, таблиці та підрозділи всередині потрібних блоків, не замінюючи їх відступами.',
];

export const serializeNote = (
  note: Note,
  projectTitle: string | undefined,
): Record<string, unknown> => ({
  title: note.title,
  ...(note.content !== '' ? { content: collapseToggleBlocks(note.content) } : {}),
  ...(note.tags && note.tags.length > 0 ? { tags: note.tags } : {}),
  ...(note.textAlign && note.textAlign !== 'left' ? { textAlign: note.textAlign } : {}),
  ...(projectTitle ? { project: projectTitle } : {}),
  ...(note.color ? { color: note.color } : {}),
  ...(note.isPinned ? { isPinned: true } : {}),
  ...(note.isArchived ? { isArchived: true } : {}),
});

export const buildNoteContextPrompt = (
  note: Note,
  { projectTitle, selection, ...context }: NoteContextPromptOptions,
): string =>
  buildJsonPrompt({
    subject: 'нотатки',
    intro:
      'Ти — досвідчений помічник застосунку-планувальника. Твоє завдання — професійно покращувати існуючу нотатку: структурувати текст, виправляти формулювання, додавати форматування та теги.',
    fields: NOTE_JSON_FIELDS,
    rules: [...NOTE_JSON_RULES, ...RULES, ...(selection ? SELECTION_RULES : [])],
    context: buildNoteContext(context),
    example: NOTE_JSON_EXAMPLE,
    outro: [
      'Поточна нотатка (JSON):',
      JSON.stringify(serializeNote(note, projectTitle), null, 2),
      ...(selection
        ? ['', 'Виділений фрагмент (звичайний текст), який потрібно покращити:', JSON.stringify(selection)]
        : []),
      '',
      'Далі користувач опише, що саме потрібно покращити чи доповнити.',
    ].join('\n'),
  });