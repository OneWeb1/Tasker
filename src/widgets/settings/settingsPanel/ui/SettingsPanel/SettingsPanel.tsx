import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, ReactNode } from 'react';
import { useConnectedCalendars } from '@/features/settings/connectCalendars';
import {
  ACCENT_COLORS,
  CUSTOM_ACCENT_ID,
  CUSTOM_ACCENT_LABEL,
  USER_NAME_MAX_LENGTH,
  consumeNameFocusRequest,
  useSettings,
} from '@/features/settings/managePreferences';
import { ResetHistorySheet, useResetData, useResetHistory } from '@/features/settings/resetData';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { MenuGroup } from '@/shared/ui/MenuGroup';
import { Toggle } from '@/shared/ui/Toggle';
import {
  CheckIcon,
  PaletteIcon,
  RestoreIcon,
  ThemeIcon,
  TodayIcon,
  TrashIcon,
} from '@/shared/ui/icons';
import styles from './SettingsPanel.module.css';

interface SettingRowProps {
  icon: ReactNode;
  tone: 'theme' | 'accent' | 'calendar';
  title: string;
  caption: string;
  children?: ReactNode;
}

function SettingRow({ icon, tone, title, caption, children }: SettingRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.tile} data-tone={tone}>
        {icon}
      </span>
      <span className={styles.rowBody}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowCaption}>{caption}</span>
      </span>
      {children}
    </div>
  );
}

export function SettingsPanel() {
  const { theme, setTheme, accent, setAccent, customAccent, setCustomAccent, userName, setUserName } =
    useSettings();
  const { calendars, toggleCalendar } = useConnectedCalendars();
  const [draft, setDraft] = useState(userName);
  const { resetData, resetWithoutBackup, hasBackupError, dismissBackupError } = useResetData();
  const history = useResetHistory();
    const [isResetOpen, setIsResetOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = nameInputRef.current;
    if (!input || !consumeNameFocusRequest()) return;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }, []);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setDraft(next);
    setUserName(next);
  };

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h2 className={styles.heading}>Ваше ім’я</h2>
        <MenuGroup>
        <label className={styles.nameField}>
          <span className={styles.srOnly}>Ім’я</span>
          <input
            ref={nameInputRef}
            className={styles.nameInput}
            value={draft}
            maxLength={USER_NAME_MAX_LENGTH}
            placeholder="Як до вас звертатися?"
            autoComplete="given-name"
            onChange={handleNameChange}
          />
          <span className={styles.counter} aria-hidden="true">
            {draft.length}/{USER_NAME_MAX_LENGTH}
          </span>
        </label>
        </MenuGroup>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Вигляд</h2>
        <MenuGroup>
        <SettingRow
          icon={<ThemeIcon width={22} height={22} />}
          tone="theme"
          title="Темна тема"
          caption={theme === 'dark' ? 'Увімкнено' : 'Вимкнено'}
        >
          <Toggle
            checked={theme === 'dark'}
            label="Темна тема"
            onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </SettingRow>
        <SettingRow
          icon={<PaletteIcon width={22} height={22} />}
          tone="accent"
          title="Акцентний колір"
          caption={
            accent === CUSTOM_ACCENT_ID
              ? CUSTOM_ACCENT_LABEL
              : (ACCENT_COLORS.find((item) => item.id === accent)?.label ?? '')
          }
        />
        <div className={styles.swatches} role="radiogroup" aria-label="Акцентний колір">
          {ACCENT_COLORS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === accent}
              aria-label={item.label}
              className={styles.swatch}
              style={{ '--swatch-color': item.color } as CSSProperties}
              onClick={() => setAccent(item.id)}
            >
              {item.id === accent && <CheckIcon width={16} height={16} />}
            </button>
          ))}
          <label
            className={`${styles.swatch} ${styles.swatchCustom}`}
            data-selected={accent === CUSTOM_ACCENT_ID}
            style={{ '--swatch-color': customAccent } as CSSProperties}
          >
            {accent === CUSTOM_ACCENT_ID && <CheckIcon width={16} height={16} />}
            <input
              type="color"
              className={styles.colorInput}
              aria-label={CUSTOM_ACCENT_LABEL}
              value={customAccent}
              onChange={(event) => setCustomAccent(event.target.value)}
            />
          </label>
        </div>
        </MenuGroup>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Календарі</h2>
        <MenuGroup>
        {calendars.map(({ source, label, isConnected }) => (
          <SettingRow
            key={source}
            icon={<TodayIcon width={22} height={22} />}
            tone="calendar"
            title={label}
            caption={isConnected ? 'Підключено' : 'Не підключено'}
          >
            <Toggle
              checked={isConnected}
              label={`Підключити ${label}`}
              onChange={() => toggleCalendar(source)}
            />
          </SettingRow>
        ))}
        </MenuGroup>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Дані</h2>
        <MenuGroup>
        <button
          type="button"
          className={styles.actionRow}
          aria-haspopup="dialog"
          onClick={() => {
            dismissBackupError();
            setIsResetOpen(true);
          }}
        >
          <span className={styles.tile} data-tone="danger">
            <TrashIcon width={22} height={22} />
          </span>
          <span className={styles.rowBody}>
            <span className={styles.rowTitle}>Скинути всі дані</span>
            <span className={styles.rowCaption}>Повернути застосунок до початкового стану</span>
          </span>
        </button>
        <button
          type="button"
          className={styles.actionRow}
          aria-haspopup="dialog"
          onClick={() => setIsHistoryOpen(true)}
        >
          <span className={styles.tile} data-tone="history">
            <RestoreIcon width={22} height={22} />
          </span>
          <span className={styles.rowBody}>
            <span className={styles.rowTitle}>Історія скидань</span>
            <span className={styles.rowCaption}>
              {history.items.length > 0
                ? `Збережених копій: ${history.items.length}`
                : 'Немає збережених копій'}
            </span>
          </span>
        </button>
        </MenuGroup>
      </section>

      <BottomSheet
        isOpen={isResetOpen}
        title="Скинути всі дані?"
        onClose={() => setIsResetOpen(false)}
      >
        <div className={styles.confirm}>
          <p className={styles.confirmText}>
            {hasBackupError
              ? 'Не вдалося зберегти резервну копію (можливо, закінчилося місце). Ви можете скинути дані без копії або скасувати.'
              : 'Усі завдання, категорії, нотатки, проєкти й налаштування буде видалено. Перед цим поточний стан збережеться в історії скидань, звідки його можна відновити.'}
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost" fullWidth onClick={() => setIsResetOpen(false)}>
              Скасувати
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={hasBackupError ? resetWithoutBackup : resetData}
            >
              {hasBackupError ? 'Скинути без копії' : 'Скинути'}
            </Button>
          </div>
        </div>
      </BottomSheet>

      <ResetHistorySheet
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
      />
    </div>
  );
}