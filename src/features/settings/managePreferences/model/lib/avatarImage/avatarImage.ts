const AVATAR_SIZE = 256;
const AVATAR_QUALITY = 0.85;

export async function readAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Unsupported file type');

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not supported');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );

    return canvas.toDataURL('image/jpeg', AVATAR_QUALITY);
  } finally {
    bitmap.close();
  }
}