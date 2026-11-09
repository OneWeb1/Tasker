import { CategoryHeader, getCategoryColorStyle } from '@/entities/category';
import { ProjectBadge } from '@/entities/project';
import { TaskItem } from '@/entities/task';
import type { TaskFilter } from '@/features/day/switchTab';
import { UserAvatar } from '@/features/settings/managePreferences';
import { IconButton } from '@/shared/ui/IconButton';
import { MoreIcon } from '@/shared/ui/icons';
import { useTaskGroups } from '../../model/hooks/useTaskGroups';
import { CategoryActionsSheet } from '../CategoryActionsSheet';
import { CategorySelectionBar } from '../CategorySelectionBar';
import { ProgressSummary } from '../ProgressSummary';
import { SelectionBar } from '../SelectionBar';
import { TaskActionsSheet } from '../TaskActionsSheet';
import styles from './TaskGroups.module.css';

const EMPTY_LABELS: Record<TaskFilter, string> = {
  all: 'Завдань немає',
  active: 'Активних завдань немає',
  postponed: 'Відкладених завдань немає',
  done: 'Виконаних завдань немає',
};

export function TaskGroups() {
  const {
    groups,
    summaryGroups,
    viewDate,
    taskFilter,
    hideEmptyCategories,
    pickDate,
    isEmpty,
    sortable,
    sortAnnouncement,
    collapsedIds,
    toggleCategory,
    openTaskActions,
    openTask,
    taskActions,
    openCategoryActions,
    categoryActions,
    selection,
    categorySelection,
  } = useTaskGroups();
  const { containerRef, registerItem, getHandleProps, isDragging } = sortable;
  const isSelecting = selection.isActive || categorySelection.isActive;

  return (
    <>
      <ProgressSummary groups={summaryGroups} date={viewDate} onSelectDate={pickDate} />
      {hideEmptyCategories && isEmpty ? (
        <p className={styles.empty}>{EMPTY_LABELS[taskFilter]}</p>
      ) : (
        <div
          ref={containerRef}
          className={styles.list}
          data-selecting={isSelecting || undefined}
        >
          {groups.map(({ category, items, progress }) => (
              <section
                key={category.id}
                ref={registerItem(category.id)}
                className={styles.group}
                data-color={category.color}
                data-collapsed={isDragging || collapsedIds.has(category.id)}
                data-selected={
                  categorySelection.isActive ? categorySelection.isSelected(category.id) : undefined
                }
                {...(!hideEmptyCategories && !isSelecting ? getHandleProps(category.id) : {})}
                style={getCategoryColorStyle(category.color)}
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest('button, a, input, label')) return;
                  const header = target.closest('header');
                  if (!header || !event.currentTarget.contains(header)) return;
                  if (categorySelection.isActive) categorySelection.toggle(category.id);
                  else toggleCategory(category.id);
                }}
              >
                <CategoryHeader
                  category={category}
                  isCollapsed={collapsedIds.has(category.id)}
                  isSelected={
                    categorySelection.isActive ? categorySelection.isSelected(category.id) : undefined
                  }
                  progress={progress}
                  actions={
                    !isSelecting ? (
                      <IconButton
                        variant="ghost"
                        label={`Дії з категорією: ${category.title}`}
                        onClick={() => openCategoryActions(category)}
                      >
                        <MoreIcon width={18} height={18} />
                      </IconButton>
                    ) : undefined
                  }
                />
                {items.length > 0 && (
                  <div className={styles.collapse}>
                    <ul className={styles.tasks}>
                      {items.map(({ task, project, isDone }) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          isDone={isDone}
                          isSelected={selection.isActive ? selection.isSelected(task.id) : undefined}
                          onOpen={() =>
                            selection.isActive ? selection.toggle(task.id) : openTask(task)
                          }
                          meta={project && <ProjectBadge project={project} />}
                          avatar={<UserAvatar size={24} />}
                          actions={
                            selection.isActive ? undefined : (
                              <IconButton
                                variant="ghost"
                                label={`Дії із завданням: ${task.title}`}
                                onClick={() => openTaskActions(task)}
                              >
                                <MoreIcon width={18} height={18} />
                              </IconButton>
                            )
                          }
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
        </div>
      )}
      <p className={styles.srOnly} role="status" aria-live="assertive">
        {sortAnnouncement}
      </p>
      <SelectionBar {...selection.bar} />
      <CategorySelectionBar {...categorySelection.bar} />
      <TaskActionsSheet {...taskActions} />
      <CategoryActionsSheet {...categoryActions} />
    </>
  );
}