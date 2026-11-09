import { createContext } from 'react';
import type { TaskContentPatch } from '../types/task';

export const TaskPatchContext = createContext<((patch: TaskContentPatch) => void) | null>(null);