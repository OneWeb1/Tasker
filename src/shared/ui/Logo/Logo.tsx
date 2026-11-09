import styles from './Logo.module.css';

export function Logo() {
  return (
    <span className={styles.logo}>
      <svg
        className={styles.mark}
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="8" fill="var(--color-growth)" />
        <path
          d="m8 14.5 4 4 8-9"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={styles.text}>TASKER</span>
    </span>
  );
}