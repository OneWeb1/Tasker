import type { Task } from '../../model/types/task';
import { isTaskSkippedOn, occursOnDate } from '../taskOccurrence';

export const filterTasksByDate = (tasks: readonly Task[], dateKey: string): Task[] =>
  tasks.filter((task) => occursOnDate(task, dateKey) && !isTaskSkippedOn(task, dateKey));