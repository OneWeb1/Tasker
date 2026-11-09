type Selection = ReadonlySet<string> | null;
type Listener = () => void;

let selection: Selection = null;
const listeners = new Set<Listener>();

export function getTaskSelection(): Selection {
  return selection;
}

export function setTaskSelection(next: Selection): void {
  if (next === selection) return;
  selection = next;
  listeners.forEach((listener) => listener());
}

export function subscribeTaskSelection(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}