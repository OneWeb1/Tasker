import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EVENT_SOURCE_LABELS, EXTERNAL_EVENT_SOURCES } from '@/entities/event';
import type { ExternalEventSource } from '@/entities/event';
import { calendarToggled, selectConnectedSources } from '../slice/connectedCalendarsSlice';

export function useConnectedCalendars() {
  const dispatch = useDispatch();
  const connectedSources = useSelector(selectConnectedSources);

  const calendars = useMemo(
    () =>
      EXTERNAL_EVENT_SOURCES.map((source) => ({
        source,
        label: EVENT_SOURCE_LABELS[source],
        isConnected: connectedSources.includes(source),
      })),
    [connectedSources],
  );

  const toggleCalendar = useCallback(
    (source: ExternalEventSource) => {
      dispatch(calendarToggled(source));
    },
    [dispatch],
  );

  return { calendars, connectedSources, toggleCalendar };
}