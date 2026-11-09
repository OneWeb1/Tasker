import { CONNECTED_CALENDARS_STORAGE_KEY } from '@/features/settings/connectCalendars';
import { SETTINGS_STORAGE_KEY } from '@/features/settings/managePreferences';
import { ACTIVE_WORKSPACE_STORAGE_KEY } from '@/features/workspace/switchWorkspace';
import { writeValue } from '@/shared/lib/utils/storage';
import type { rootReducer } from './rootReducer';

type PersistedRootState = ReturnType<typeof rootReducer>;

interface PersistableStore {
  getState: () => PersistedRootState;
  subscribe: (listener: () => void) => () => void;
}

export function persistState(store: PersistableStore): void {
  let previous = store.getState();

  store.subscribe(() => {
    const current = store.getState();

    if (current.connectedCalendars !== previous.connectedCalendars) {
      writeValue(CONNECTED_CALENDARS_STORAGE_KEY, current.connectedCalendars);
    }

    if (current.settings !== previous.settings) {
      writeValue(SETTINGS_STORAGE_KEY, current.settings);
    }

    if (current.activeWorkspace !== previous.activeWorkspace) {
      writeValue(ACTIVE_WORKSPACE_STORAGE_KEY, current.activeWorkspace);
    }

    previous = current;
  });
}