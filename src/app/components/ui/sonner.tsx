'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': '#22c55e',
          '--success-text': '#ffffff',
          '--success-border': '#16a34a',
          '--error-bg': '#ef4444',
          '--error-text': '#ffffff',
          '--error-border': '#dc2626',
          '--warning-bg': '#eab308',
          '--warning-text': '#ffffff',
          '--warning-border': '#ca8a04',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
