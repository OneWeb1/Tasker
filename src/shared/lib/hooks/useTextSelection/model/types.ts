export interface Caret {
  node: Node;
  offset: number;
}

export type HandleId = 'a' | 'b';

export interface HandlePoint {
  x: number;
  y: number;
}

export interface SelectionGeometry {
  top: number;
  bottom: number;
  left: number;
  right: number;
  handles: Record<HandleId, HandlePoint>;
}

export interface TextSelection extends SelectionGeometry {
  text: string;
  occurrence: number;
  x: number;
}

export interface TextSelectionOptions {
  highlightName: string;
  ignoreSelector?: string;
}

export interface SelectionModel {
  range: Range | null;
  caretA: Caret | null;
  caretB: Caret | null;
  lastX: number;
}