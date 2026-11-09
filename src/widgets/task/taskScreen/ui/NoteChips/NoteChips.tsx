import { ProjectBadge } from '@/entities/project';
import type { Project } from '@/entities/project';
import type { Workspace } from '@/entities/workspace';
import {
  ACCENT_COLORS,
  CUSTOM_ACCENT_ID,
  CUSTOM_ACCENT_LABEL,
  DEFAULT_CUSTOM_ACCENT,
  isHexColor,
} from '@/features/settings/managePreferences';
import { ColorSwatches } from '@/shared/ui/ColorSwatches';
import { NoteTagsEditor } from '../NoteTagsEditor';
import styles from './NoteChips.module.css';

const NO_COLOR_ITEM = {
  value: '',
  label: 'Без кольору',
  color: 'var(--color-text-muted)',
  isEmpty: true,
};

const PRESET_ITEMS = ACCENT_COLORS.filter(({ id }) => id !== 'pink').map(
  ({ label, color }) => ({ value: color, label, color }),
);
const COLOR_ITEMS = [NO_COLOR_ITEM, ...PRESET_ITEMS];

interface NoteChipsProps {
  project?: Project;
  workspace?: Workspace;
  tags: readonly string[];
  color: string;
  onColorChange: (color: string) => void;
  onOpenProject: () => void;
  onOpenWorkspace: () => void;
  onAddTag: (raw: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function NoteChips({
  project,
  workspace,
  tags,
  color,
  onColorChange,
  onOpenProject,
  onOpenWorkspace,
  onAddTag,
  onRemoveTag,
}: NoteChipsProps) {
  const normalized = color.toLowerCase();
  const isPreset = PRESET_ITEMS.some((item) => item.value === normalized);

  return (
    <div className={styles.chips}>
      <div className={styles.row}>
        <span className={styles.label}>Проєкт</span>
        <button type="button" className={styles.chip} aria-haspopup="dialog" onClick={onOpenProject}>
          {project ? <ProjectBadge project={project} /> : 'Без проєкту'}
        </button>
      </div>
      {workspace && (
        <div className={styles.row}>
          <span className={styles.label}>Простір</span>
          <button
            type="button"
            className={styles.chip}
            aria-haspopup="dialog"
            onClick={onOpenWorkspace}
          >
            <span aria-hidden="true">{workspace.emoji}</span>
            {workspace.title}
          </button>
        </div>
      )}
      <div className={styles.row}>
        <span className={styles.label}>Теги</span>
        <NoteTagsEditor tags={tags} onAdd={onAddTag} onRemove={onRemoveTag} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Колір</span>
        <div className={styles.colors}>
          <ColorSwatches
            label="Колір"
            items={COLOR_ITEMS}
            value={color === '' || isPreset ? normalized : CUSTOM_ACCENT_ID}
            custom={{
              label: CUSTOM_ACCENT_LABEL,
              color: isHexColor(color) ? normalized : DEFAULT_CUSTOM_ACCENT,
              isSelected: color !== '' && !isPreset,
              onChange: onColorChange,
            }}
            onChange={onColorChange}
          />
        </div>
      </div>
    </div>
  );
}