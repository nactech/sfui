import styles from "./layout.module.scss";

/** The SF UI mark: a black glass tile with a periwinkle tonal core. */
export function BrandMark({ size = 2 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={`${size}rem`} height={`${size}rem`} aria-hidden="true" className={styles.brandMark}>
      <defs>
        <linearGradient id="sfui-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cbd3ff" />
          <stop offset="1" stopColor="#a5b4ff" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="61" height="61" rx="18" fill="#000" stroke="#ffffff29" strokeWidth="1.5" />
      <rect x="14" y="14" width="36" height="36" rx="11" fill="#1d2347" stroke="url(#sfui-mark)" strokeWidth="2.5" />
      <path d="M22 36h20" stroke="#cbd3ff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function Brand() {
  return (
    <span className={styles.brand}>
      <BrandMark />
      <span className={styles.brandText}>
        <span className={styles.brandName}>SF UI</span>
        <span className={styles.brandSub}>Black Glass</span>
      </span>
    </span>
  );
}
