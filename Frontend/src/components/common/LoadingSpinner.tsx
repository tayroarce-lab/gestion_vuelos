import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  variant?: 'fullPage' | 'section' | 'inline';
  size?: number;
  text?: string;
}

export default function LoadingSpinner({
  variant = 'section',
  size,
  text
}: LoadingSpinnerProps) {
  const defaultSizes = { fullPage: 40, section: 32, inline: 16 };
  const currentSize = size || defaultSizes[variant];

  const content = (
    <>
      <Loader2
        size={currentSize}
        className="animate-spin"
        style={{ color: variant === 'inline' ? 'currentColor' : 'var(--color-primary)' }}
      />
      {text && <span style={{ marginLeft: '8px', fontSize: '14px' }}>{text}</span>}
    </>
  );

  if (variant === 'fullPage') {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9998
      }}>
        {content}
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div style={{
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}>
        {content}
      </div>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {content}
    </span>
  );
}
