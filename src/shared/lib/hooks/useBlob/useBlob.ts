import { useEffect, useState } from 'react';
import { getBlob } from '@/shared/lib/utils/storage';

interface LoadedBlob {
  id: string;
  blob: Blob | null;
}

export function useBlob(blobId: string | undefined): { blob: Blob | null; isLoading: boolean } {
  const [loaded, setLoaded] = useState<LoadedBlob | null>(null);

  useEffect(() => {
    if (blobId === undefined) return undefined;
    let isCancelled = false;

    getBlob(blobId).then(
      (blob) => {
        if (!isCancelled) setLoaded({ id: blobId, blob });
      },
      () => {
        if (!isCancelled) setLoaded({ id: blobId, blob: null });
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [blobId]);

  const isCurrent = blobId !== undefined && loaded?.id === blobId;
  return {
    blob: isCurrent ? loaded.blob : null,
    isLoading: blobId !== undefined && !isCurrent,
  };
}