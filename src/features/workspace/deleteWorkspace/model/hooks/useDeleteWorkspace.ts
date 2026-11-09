import { useCallback } from 'react';
import { DEFAULT_CATEGORY_ID, useDeleteCategoryMutation, useGetCategoriesQuery } from '@/entities/category';
import { useGetNotesQuery, useRemoveNotesMutation } from '@/entities/note';
import { useDeleteProjectMutation, useGetProjectsQuery } from '@/entities/project';
import { useGetTasksQuery, useRemoveTasksMutation } from '@/entities/task';
import {
  DEFAULT_WORKSPACE,
  filterByWorkspace,
  useDeleteWorkspaceMutation,
} from '@/entities/workspace';

export function useDeleteWorkspace() {
  const { data: tasks = [] } = useGetTasksQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: notes = [] } = useGetNotesQuery();
  const [removeTasks] = useRemoveTasksMutation();
  const [removeNotes] = useRemoveNotesMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteWorkspaceMutation] = useDeleteWorkspaceMutation();

  const deleteWorkspace = useCallback(
    async (id: string): Promise<boolean> => {
      if (id === DEFAULT_WORKSPACE.id) return false;

      try {
        const taskIds = filterByWorkspace(tasks, id).map((task) => task.id);
        if (taskIds.length > 0) await removeTasks(taskIds).unwrap();

        const noteIds = filterByWorkspace(notes, id).map((note) => note.id);
        if (noteIds.length > 0) await removeNotes(noteIds).unwrap();

        for (const project of filterByWorkspace(projects, id)) {
          await deleteProject(project.id).unwrap();
        }

        for (const category of filterByWorkspace(categories, id)) {
          if (category.id !== DEFAULT_CATEGORY_ID) await deleteCategory(category.id).unwrap();
        }

        await deleteWorkspaceMutation(id).unwrap();
        return true;
      } catch {
        return false;
      }
    },
    [
      categories,
      deleteCategory,
      deleteProject,
      deleteWorkspaceMutation,
      notes,
      projects,
      removeNotes,
      removeTasks,
      tasks,
    ],

  );

  return { deleteWorkspace };
}