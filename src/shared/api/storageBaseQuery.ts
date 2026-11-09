import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { createId } from '@/shared/lib/utils/createId';
import { readCollection, writeCollection } from '@/shared/lib/utils/storage';

type StorageRecord = Record<string, unknown> & { id: string };

export type StorageRequest =
  | { op: 'list'; collection: string; seed?: readonly { id: string }[] }
  | { op: 'create'; collection: string; body: Record<string, unknown> }
  | { op: 'createMany'; collection: string; bodies: readonly Record<string, unknown>[] }
  | {
      op: 'update';
      collection: string;
      id: string;
      patch: Record<string, unknown> | ((current: StorageRecord) => Record<string, unknown>);
    }
  | { op: 'remove'; collection: string; id: string }
  | { op: 'removeMany'; collection: string; ids: readonly string[] }
  | { op: 'restore'; collection: string; record: StorageRecord; index: number }
  | { op: 'reorder'; collection: string; ids: readonly string[] };

export interface StorageError {
  status: 'NOT_FOUND' | 'STORAGE_ERROR';
  message: string;
}

const notFound = (request: { collection: string; id: string }) => ({
  error: {
    status: 'NOT_FOUND' as const,
    message: `Record ${request.id} not found in ${request.collection}`,
  },
});

export const storageBaseQuery: BaseQueryFn<
  StorageRequest,
  unknown,
  StorageError
> = async (request) => {
  try {
    const items = readCollection<StorageRecord>(
      request.collection,
      request.op === 'list'
        ? (request.seed as readonly StorageRecord[] | undefined)
        : undefined,
    );

    switch (request.op) {
      case 'list':
        return { data: items };

      case 'create': {
        const created: StorageRecord = { ...request.body, id: createId() };
        writeCollection(request.collection, [...items, created]);
        return { data: created };
      }

      case 'createMany': {
        const created = request.bodies.map((body): StorageRecord => ({ ...body, id: createId() }));
        writeCollection(request.collection, [...items, ...created]);
        return { data: created };
      }

      case 'update': {
        const target = items.find((item) => item.id === request.id);
        if (!target) return notFound(request);
        const { patch } = request;
        const updated: StorageRecord = {
          ...target,
          ...(typeof patch === 'function' ? patch(target) : patch),
        };
        writeCollection(
          request.collection,
          items.map((item) => (item.id === request.id ? updated : item)),
        );
        return { data: updated };
      }

      case 'remove': {
        const index = items.findIndex((item) => item.id === request.id);
        const record = items[index];
        if (!record) return notFound(request);
        writeCollection(
          request.collection,
          items.filter((item) => item.id !== request.id),
        );
        return { data: { record, index } };
      }

      case 'removeMany': {
        const ids = new Set(request.ids);
        const kept = items.filter((item) => !ids.has(item.id));
        writeCollection(request.collection, kept);
        return { data: items.length - kept.length };
      }

      case 'restore': {
        if (items.some((item) => item.id === request.record.id)) {
          return { data: request.record };
        }
        const position = Math.min(Math.max(request.index, 0), items.length);
        writeCollection(request.collection, [
          ...items.slice(0, position),
          request.record,
          ...items.slice(position),
        ]);
        return { data: request.record };
      }

      case 'reorder': {
        const byId = new Map(items.map((item) => [item.id, item] as const));
        const ordered = request.ids.flatMap((id) => {
          const item = byId.get(id);
          return item ? [item] : [];
        });
        const rest = items.filter((item) => !request.ids.includes(item.id));
        const next = [...ordered, ...rest];
        writeCollection(request.collection, next);
        return { data: next };
      }
    }

  } catch (error) {
    return {
      error: {
        status: 'STORAGE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown storage error',
      },
    };
  }
};