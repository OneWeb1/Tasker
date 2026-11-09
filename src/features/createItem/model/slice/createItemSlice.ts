import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_CATEGORY_ID } from '@/entities/category';
import type { CategoryId } from '@/entities/category';
import type { Note } from '@/entities/note';
import type { Task } from '@/entities/task';

export type CreateItemKind = 'task' | 'note' | 'category';

export interface OpenCreateItemPayload {
  kind?: CreateItemKind;
  categoryId?: CategoryId;
  task?: Task;
  note?: Note;
}

interface CreateItemState {
  isOpen: boolean;
  kind: CreateItemKind;
  categoryId: CategoryId;
  task: Task | null;
  note: Note | null;
}

const initialState: CreateItemState = {
  isOpen: false,
  kind: 'task',
  categoryId: DEFAULT_CATEGORY_ID,
  task: null,
  note: null,
};

const createItemSlice = createSlice({
  name: 'createItem',
  initialState,
  reducers: {
    openCreateItem(state, action: PayloadAction<OpenCreateItemPayload | undefined>) {
      state.isOpen = true;
      state.kind = action.payload?.kind ?? 'task';
      state.categoryId = action.payload?.categoryId ?? DEFAULT_CATEGORY_ID;
      state.task = action.payload?.task ?? null;
      state.note = action.payload?.note ?? null;
    },
    closeCreateItem(state) {
      state.isOpen = false;
    },
  },
});

export const { openCreateItem, closeCreateItem } = createItemSlice.actions;
export const createItemReducer = createItemSlice.reducer;

export const selectCreateItem = (state: { createItem: CreateItemState }): CreateItemState =>
  state.createItem;