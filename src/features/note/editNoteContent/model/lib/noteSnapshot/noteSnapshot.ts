import { readNoteHtml } from '../noteDocument';
import { captureNoteSelection, placeCaret, restoreNoteSelection } from '../noteSelection';
import type { NoteSelection } from '../noteSelection';

export interface NoteSnapshot {
  html: string;
  selection: NoteSelection | null;
}

export const captureNoteSnapshot = (root: HTMLElement): NoteSnapshot => ({
  html: readNoteHtml(root),
  selection: captureNoteSelection(root),
});

export const applyNoteSnapshot = (root: HTMLElement, snapshot: NoteSnapshot): void => {
  root.innerHTML = snapshot.html;
  root.focus({ preventScroll: true });
  if (snapshot.selection) restoreNoteSelection(root, snapshot.selection);
  else placeCaret(root, null, 'end');
};