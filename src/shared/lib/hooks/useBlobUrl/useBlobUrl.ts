import { useBlob } from '@/shared/lib/hooks/useBlob';
import { useObjectUrl } from '@/shared/lib/hooks/useObjectUrl';

export function useBlobUrl(blobId: string | undefined): string | null {
  const { blob } = useBlob(blobId);
  return useObjectUrl(blob);
}