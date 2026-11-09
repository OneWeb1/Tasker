const MARK_AT_END = /[.,!?…:;]$/;
const SENTENCE_END = /[.!?…]$/;
const STRIP_MARKS = /[.,!?…:;"«»()]/g;

const normalize = (token: string): string =>
  token.toLocaleLowerCase('uk-UA').replace(STRIP_MARKS, '');

const COMMA_BEFORE = new Set([
  'але', 'проте', 'однак', 'зате', 'а', 'що', 'щоб', 'аби', 'бо', 'адже', 'якщо', 'хоча',
  'ніби', 'наче', 'ніж', 'який', 'яка', 'яке', 'які', 'якого', 'якої', 'якому', 'якій',
  'яким', 'яких', 'якими', 'котрий', 'котра', 'котре', 'котрі',
]);

const NO_COMMA_AFTER = new Set([
  'і', 'й', 'та', 'або', 'чи', 'а', 'але', 'що', 'щоб', 'бо', 'якщо', 'хоча', 'ніби', 'наче',
  'не', 'ні', 'на', 'у', 'в', 'до', 'з', 'із', 'за', 'про', 'від', 'для', 'при', 'по', 'під',
  'над', 'без', 'через', 'між', 'з-за', 'завдяки', 'внаслідок', 'після', 'перед', 'замість',
  'попри', 'крім', 'навіть', 'тільки', 'лише', 'саме', 'так',
]);

const INTRO_PHRASES: readonly (readonly string[])[] = [
  ['на', 'мою', 'думку'],
  ['іншими', 'словами'],
  ['між', 'іншим'],
  ['до', 'того', 'ж'],
  ['таким', 'чином'],
  ['до', 'речі'],
  ['на', 'жаль'],
  ['на', 'щастя'],
  ['крім', 'того'],
  ['в', 'принципі'],
  ['по-перше'],
  ['по-друге'],
  ['по-третє'],
  ['звичайно'],
  ['звісно'],
  ['наприклад'],
  ['отже'],
  ['мабуть'],
  ['напевно'],
  ['здається'],
  ['тобто'],
  ['значить'],
  ['словом'],
  ['загалом'],
  ['насамперед'],
  ['зрозуміло'],
  ['очевидно'],
  ['безумовно'],
  ['безперечно'],
  ['нарешті'],
  ['зрештою'],
];

const QUESTION_WORDS = new Set([
  'чому', 'навіщо', 'чи', 'хто', 'скільки', 'куди', 'звідки', 'невже', 'хіба', 'чого',
]);

const matchesPhrase = (tokens: readonly string[], index: number, phrase: readonly string[]) =>
  index + phrase.length < tokens.length &&
  phrase.every((word, offset) => normalize(tokens[index + offset]) === word);

const withComma = (token: string): string => (MARK_AT_END.test(token) ? token : `${token},`);

export const applyUkrainianGrammar = (text: string): string => {
  const tokens = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let atStart = true;
  let index = 0;

  while (index < tokens.length) {
    if (atStart) {
      const phrase = INTRO_PHRASES.find((item) => matchesPhrase(tokens, index, item));
      if (phrase) {
        phrase.forEach((_, offset) => out.push(tokens[index + offset]));
        out[out.length - 1] = withComma(out[out.length - 1]);
        index += phrase.length;
        atStart = false;
        continue;
      }
    }

    const token = tokens[index];
    const word = normalize(token);
    const previous = out[out.length - 1];

    if (!atStart && previous !== undefined && !MARK_AT_END.test(previous)) {
      const previousWord = normalize(previous);
      const next = tokens[index + 1] === undefined ? '' : normalize(tokens[index + 1]);
      let needsComma = false;

      if (word === 'тому' && next === 'що') {
        needsComma = !NO_COMMA_AFTER.has(previousWord);
      } else if (word === 'що' && previousWord === 'тому') {
        const beforeThat = out[out.length - 2];
        needsComma = beforeThat === undefined || !MARK_AT_END.test(beforeThat);
      } else if (COMMA_BEFORE.has(word)) {
        needsComma = !NO_COMMA_AFTER.has(previousWord);
      }

      if (needsComma) out[out.length - 1] = withComma(previous);
    }

    out.push(token);
    atStart = SENTENCE_END.test(token);
    index += 1;

  }

  return out.join(' ');
};

export const markQuestions = (text: string): string =>
  text
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => {
      const first = normalize(sentence.split(/\s+/)[0] ?? '');
      return QUESTION_WORDS.has(first) && sentence.endsWith('.') ? `${sentence.slice(0, -1)}?` : sentence;
    })
    .join(' ');