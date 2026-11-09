export {
  useCreateTaskMutation,
  useCreateTasksMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useRemoveTasksMutation,
  useRestoreDeletedTaskMutation,
  useUpdateTaskMutation,
} from './api/taskApi';
export { filterByProject } from './lib/filterByProject';
export { filterTasksByDate } from './lib/filterTasksByDate';
export { forEachOccurrence } from './lib/forEachOccurrence';
export { buildTaskCopy } from './lib/taskCopy';
export { groupTasksByCategory } from './lib/groupTasksByCategory';
export type { TaskGroup } from './lib/groupTasksByCategory';
export { getChecklistProgress } from './lib/checklistProgress';
export {
  addChecklistChild,
  removeChecklistItem,
  toggleChecklistItem,
  updateChecklistItem,
} from './lib/checklistTree';
export { calculateTaskActivity } from './lib/taskActivity';
export type { DayActivity } from './lib/taskActivity';
export { getSubtaskProgress } from './lib/subtaskProgress';
export {
  addSubtaskChild,
  cloneSubtask,
  findSubtask,
  findSubtaskParentId,
  removeSubtaskItem,
} from './lib/subtaskTree';
export { collectScheduledSubtasks } from './lib/subtaskSchedule';
export {
  getSubtaskBounds,
  getSubtaskTimeLimits,
  patchSubtask,
  resolveSubtaskTask,
  stampNewSubtask,
} from './lib/subtaskTask';
export { buildTaskDetails } from './lib/taskDetails';
export type { TaskDetails, TaskDetailsStatus } from './lib/taskDetails';
export { appendStatusChange, buildTaskHistory } from './lib/taskHistory';
export type { TaskHistoryEntry } from './lib/taskHistory';
export { isRecurringSchedule, isRecurringTask, isTaskDoneOn } from './lib/taskOccurrence';
export { getTaskScheduleLabel } from './lib/taskScheduleLabel';
export { collectTaskTimeEntries } from './lib/taskTimeEntries';
export type { TaskTimeEntry, TaskTimeRange } from './lib/taskTimeEntries';
export {
  getTaskTimerElapsedSeconds,
  isTaskTimerEnabled,
  isTaskTimerRunningOn,
  pauseTaskTimer,
  resetTaskTimer,
  setTaskTimerEnabled,
  startTaskTimer,
} from './lib/taskTimer';
export { calculateTaskProgress } from './lib/taskProgress';
export type { TaskProgress } from './lib/taskProgress';
export { calculateRangeProgress } from './lib/rangeProgress';
export { calculateTaskStats } from './lib/taskStats';
export type { TaskStats } from './lib/taskStats';
export { buildTaskSearchEntries } from './lib/taskSearch';
export type { TaskSearchEntry } from './lib/taskSearch';
export { calculateWeekProgress } from './lib/weekProgress';
export type { WeekDayProgress } from './lib/weekProgress';
export { TASK_PRIORITY_LABELS } from './model/constants/taskPriorities';
export { TASK_SCHEDULES } from './model/constants/taskSchedules';
export { TASK_WEEKDAYS } from './model/constants/weekdays';
export { TaskPatchContext } from './model/context/taskPatchContext';
export { useDiffKind, useTaskDiff } from './model/hooks/useTaskDiff';
export { useTaskPatch } from './model/hooks/useTaskPatch';
export type {
  DeletedTask,
  NewTask,
  Task,
  TaskAttachment,
  TaskChecklist,
  TaskChecklistItem,
  TaskComment,
  TaskContentPatch,
  TaskFieldChange,
  TaskSubtask,
} from './model/types/task';
export type { FieldDiff, TaskDiffValue, TaskFieldDiffs } from './model/types/taskDiff';
export type { TaskPriority } from './model/types/taskPriority';
export type { TaskSchedule } from './model/types/taskSchedule';
export type { TaskStatus } from './model/types/taskStatus';
export { TaskDiffProvider } from './ui/TaskDiffProvider';
export { TaskItem, TaskPriorityBadge, TaskPrioritySheet } from './ui';