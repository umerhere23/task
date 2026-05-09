'use client';

import styles from './UI.module.css';
export * from './Toast';

export function LoadingSpinner() {
  return (
    <div className={styles.spinner}>
      <div className={styles.spinnerCircle} />
    </div>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className={`${styles.alert} ${styles.alertError}`}>
      <p style={{ fontWeight: 600 }}>Error</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function SuccessAlert({ message }: { message: string }) {
  return (
    <div className={`${styles.alert} ${styles.alertSuccess}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function Pagination({
  page,
  pages,
  onPageChange,
}: {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className={styles.pagination}>
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={styles.btn}
      >
        Previous
      </button>
      <span className={styles.smallText}>
        Page {page} of {pages}
      </span>
      <button
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
        className={styles.btn}
      >
        Next
      </button>
    </div>
  );
}
