export const EVENT_SOURCE_LABELS = {
  local: 'Tasker',
  google: 'Google Calendar',
  outlook: 'Outlook',
  apple: 'Apple Calendar',
} as const;

export type EventSource = keyof typeof EVENT_SOURCE_LABELS;

export type ExternalEventSource = Exclude<EventSource, 'local'>;

export const EXTERNAL_EVENT_SOURCES: readonly ExternalEventSource[] = [
  'google',
  'outlook',
  'apple',
];