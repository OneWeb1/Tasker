import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import { ATTACHMENT_SLOT_SELECTOR } from '@/shared/lib/utils/markdown';

type Slots = ReadonlyMap<string, HTMLElement>;

const NO_SLOTS: Slots = new Map();

const collectSlots = (root: HTMLElement, previous: Slots): Slots => {
  const next = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>(ATTACHMENT_SLOT_SELECTOR).forEach((slot) => {
    const id = slot.dataset.group;
    if (id) next.set(id, slot);
  });

  const isSame =
    next.size === previous.size && [...next].every(([id, slot]) => previous.get(id) === slot);
  return isSame ? previous : next;
};

export function useAttachmentSlots(
  rootRef: RefObject<HTMLElement | null>,
  version?: unknown,
): Slots {
  const [slots, setSlots] = useState<Slots>(NO_SLOTS);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      setSlots(NO_SLOTS);
      return undefined;
    }

    const refresh = () => setSlots((previous) => collectSlots(root, previous));
    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(root, { childList: true });
    return () => observer.disconnect();
  }, [rootRef, version]);

  return slots;
}