import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  // Horizontal alignment of the content. Defaults to centered.
  justify?: 'start' | 'center' | 'end';
};

const JUSTIFY_CLASS = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
} as const;

// Reusable layout container to avoid repeating tailwind wrapper classes.
// Width is bounded rather than `w-screen` so content sits inside the app shell
// instead of bleeding past it (w-screen ignores the sidebar rail entirely).
export default function Container({ children, className = '', justify = 'center' }: ContainerProps) {
  return (
    <div className={[
      'w-full',
      'max-w-400',
      'mx-auto',
      'flex',
      JUSTIFY_CLASS[justify],
      'p-6 md:p-8',
      className,
    ].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
