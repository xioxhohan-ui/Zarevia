'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[MYRO Error]', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: 'inherit',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: 'var(--foreground)' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--foreground-muted)', marginBottom: '24px', maxWidth: '400px' }}>
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 28px',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: '600',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
