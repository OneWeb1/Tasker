import { useEffect, useState } from 'react';

export function useObjectUrl(blob: Blob | null, mimeOverride?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob === null) {
      setUrl(null);
      return undefined;
    }

    const source =
      mimeOverride && blob.type !== mimeOverride ? new Blob([blob], { type: mimeOverride }) : blob;
    const objectUrl = URL.createObjectURL(source);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [blob, mimeOverride]);

  return url;
}