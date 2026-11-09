import { createContext } from 'react';
import type { TaskDiffValue } from '../types/taskDiff';

export const TaskDiffContext = createContext<TaskDiffValue | null>(null);