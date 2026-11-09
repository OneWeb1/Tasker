import styles from './ActivityHeatmapPlaceholder.module.css';

export function ActivityHeatmapPlaceholder() {
  return (
    <section className={styles.root} aria-hidden="true">
      <h2 className={styles.title}>Активність</h2>
      <div className={styles.card} />
    </section>
  );
}