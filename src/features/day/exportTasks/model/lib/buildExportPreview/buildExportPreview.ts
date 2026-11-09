const MAX_PREVIEW_LINES = 500;

export interface ExportPreview {
  text: string;
  hiddenLines: number;
}

export const buildExportPreview = (content: string): ExportPreview => {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  return {
    text: lines.slice(0, MAX_PREVIEW_LINES).join('\n'),
    hiddenLines: Math.max(0, lines.length - MAX_PREVIEW_LINES),
  };
};