const FORMS = ['нотатка', 'нотатки', 'нотаток'] as const;

const getFormIndex = (count: number): 0 | 1 | 2 => {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 2;
  if (last === 1) return 0;
  if (last >= 2 && last <= 4) return 1;
  return 2;
};

export const formatNotesCount = (count: number): string => `${count} ${FORMS[getFormIndex(count)]}`;