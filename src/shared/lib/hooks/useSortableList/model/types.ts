export interface SortableAnnouncement {
  type: 'lift' | 'drop' | 'cancel' | 'move';
  id: string;
  position: number;
  total: number;
}

export interface ItemRect {
  id: string;
  top: number;
  height: number;
}

export interface DragSession {
  id: string;
  pointerId: number;
  fromIndex: number;
  targetIndex: number;
  grabOffset: number;
  pointerY: number;
  scrollParent: HTMLElement | null;
  reducedMotion: boolean;
}