import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { eventCollapseToggled, selectCollapsedEventIds } from '../slice/collapsedEventsSlice';

export function useCollapsedEvents() {
  const dispatch = useDispatch();
  const ids = useSelector(selectCollapsedEventIds);
  const collapsedIds = useMemo<ReadonlySet<string>>(() => new Set(ids), [ids]);

  const toggle = useCallback(
    (id: string) => {
      dispatch(eventCollapseToggled(id));
    },
    [dispatch],
  );

  return { collapsedIds, toggle };
}