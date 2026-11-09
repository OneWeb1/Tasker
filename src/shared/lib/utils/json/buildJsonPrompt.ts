export interface JsonPromptField {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

export interface JsonPromptConfig {
  subject: string;
  fields: readonly JsonPromptField[];
  example: string;
  rules?: readonly string[];
  context?: readonly string[];
  intro?: string;
  outro?: string;
}

const BASE_RULES: readonly string[] = [
  'Поверни лише валідний JSON-об’єкт: без markdown, без блоків коду, без коментарів і пояснень.',
  'Використовуй тільки поля з переліку нижче, назви полів не змінюй.',
  'Необов’язкові поля, значення яких невідоме, пропускай.',
  'Один JSON-об’єкт — один елемент. Якщо потрібно кілька елементів, видавай їх по одному.',
];

const formatField = ({ name, type, description, required = false }: JsonPromptField): string =>
  `- ${name} (${type}, ${required ? 'обов’язкове' : 'необов’язкове'}): ${description}`;

const formatSection = (title: string, lines: readonly string[]): string[] =>
  lines.length > 0 ? ['', title, ...lines] : [];

export const buildJsonPrompt = ({
  subject,
  fields,
  example,
  rules = [],
  context = [],
  intro = `Ти — помічник застосунку-планувальника. Твоє завдання — перетворювати опис користувача на JSON для створення: ${subject}.`,
  outro = 'Далі користувач опише, що саме потрібно створити.',
}: JsonPromptConfig): string =>
  [
    intro,
    ...formatSection('Правила відповіді:', [...BASE_RULES, ...rules].map((rule) => `- ${rule}`)),
    ...formatSection('Контекст:', context.map((line) => `- ${line}`)),
    ...formatSection('Поля JSON:', fields.map(formatField)),
    '',
    'Приклад:',
    example,
    '',
    outro,
  ].join('\n');