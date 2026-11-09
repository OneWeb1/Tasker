import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { MenuItem } from '@/shared/ui/MenuItem';
import { Tabs } from '@/shared/ui/Tabs';
import { ArrowRightIcon, DownloadIcon, EyeIcon, TodayIcon } from '@/shared/ui/icons';
import { EXPORT_FORMATS, EXPORT_PRESET_ITEMS, MAX_EXPORT_DAYS } from '../../model/constants/export';
import { useExportTasks } from '../../model/hooks/useExportTasks';
import styles from './ExportSheet.module.css';

type ExportState = ReturnType<typeof useExportTasks>;

const ignoreClose = () => {};

function ExportMenu({ openExport }: Pick<ExportState, 'openExport'>) {
  return (
    <MenuGroup>
      <MenuItem
        icon={<DownloadIcon width={22} height={22} />}
        label="Експортувати цей день"
        onClick={() => openExport('day')}
      />
      <MenuItem
        icon={<TodayIcon width={22} height={22} />}
        label="Експортувати період"
        onClick={() => openExport('period')}
      />
    </MenuGroup>
  );
}

function ExportForm({
  mode,
  openPreview,
  from,
  setFrom,
  to,
  setTo,
  format,
  setFormat,
  applyPreset,
  dayLabel,
  rowsCount,
  filename,
  preview,
  isRangeValid,
  canExport,
  isSaving,
  hasError,
  exportTasks,
}: ExportState) {
  let hint = `Буде експортовано завдань: ${rowsCount}`;
  if (!isRangeValid) hint = `Оберіть коректний період (до ${MAX_EXPORT_DAYS} днів)`;
  else if (rowsCount === 0) hint = 'Немає завдань за цей період';

  return (
    <div className={styles.form}>
      {mode === 'day' ? (
        <p className={styles.summary}>{dayLabel}</p>
      ) : (
        <>
          <div className={styles.presets} role="group" aria-label="Швидкий вибір періоду">
            {EXPORT_PRESET_ITEMS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={styles.preset}
                onClick={() => applyPreset(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className={styles.dates}>
            <label className={styles.field}>
              <span className={styles.label}>Від</span>
              <input
                className={styles.input}
                type="date"
                value={from}
                max={to || undefined}
                required
                onChange={(event) => setFrom(event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>До</span>
              <input
                className={styles.input}
                type="date"
                value={to}
                min={from || undefined}
                required
                onChange={(event) => setTo(event.target.value)}
              />
            </label>
          </div>
        </>
      )}

      <div className={styles.field}>
        <span className={styles.label}>Формат</span>
        <Tabs ariaLabel="Формат файлу" items={EXPORT_FORMATS} value={format} onChange={setFormat} />
      </div>

      {preview && (
        <button
          type="button"
          className={styles.previewButton}
          aria-haspopup="dialog"
          onClick={openPreview}
        >
          <span className={styles.previewTile}>
            <EyeIcon width={22} height={22} />
          </span>
          <span className={styles.previewBody}>
            <span className={styles.previewName}>Переглянути дані</span>
            <span className={styles.previewMeta}>
              {filename} · {rowsCount}
            </span>
          </span>
          <ArrowRightIcon className={styles.previewArrow} width={20} height={20} />
        </button>
      )}

      <p className={styles.hint} role="status">
        {hint}
      </p>

      {hasError && (
        <p className={styles.error} role="alert">
          Не вдалося експортувати. Спробуйте ще раз.
        </p>
      )}

      <Button fullWidth disabled={!canExport || isSaving} onClick={() => void exportTasks()}>
        Експортувати
      </Button>
    </div>

  );
}

function ExportPreview({ filename, preview }: Pick<ExportState, 'filename' | 'preview'>) {
  if (!preview) return null;

  return (
    <div className={styles.previewForm}>
      <span className={styles.label}>{filename}</span>
      <pre className={styles.preview} tabIndex={0} aria-label="Дані файлу">
        {preview.text}
      </pre>
      {preview.hiddenLines > 0 && (
        <span className={styles.label}>…і ще {preview.hiddenLines} рядків</span>
      )}
    </div>
  );
}

interface ExportSheetProps {
  isOpen: boolean;
  defaultDate: string;
  onClose: () => void;
}

export function ExportSheet({ isOpen, defaultDate, onClose }: ExportSheetProps) {
  const state = useExportTasks(defaultDate, isOpen, onClose);
  const { view, mode, backToMenu, closePreview } = state;

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        title="Дії дня"
        onClose={view === 'menu' ? onClose : ignoreClose}
      >
        <ExportMenu openExport={state.openExport} />
      </BottomSheet>
      <BottomSheet
        isOpen={isOpen && view !== 'menu'}
        title={mode === 'day' ? 'Експорт дня' : 'Експорт періоду'}
        onClose={view === 'export' ? backToMenu : ignoreClose}
        onBack={backToMenu}
      >
        <ExportForm {...state} />
      </BottomSheet>
      <BottomSheet
        isOpen={isOpen && view === 'preview'}
        title="Попередній перегляд"
        onClose={closePreview}
        onBack={closePreview}
      >
        <ExportPreview filename={state.filename} preview={state.preview} />
      </BottomSheet>
    </>
  );
}