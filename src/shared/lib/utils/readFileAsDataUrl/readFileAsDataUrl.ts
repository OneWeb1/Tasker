export const readFileAsDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Unexpected file reader result'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(blob);
  });