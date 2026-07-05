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

// Reusable layout container to avoid repeating tailwind wrapper classes
export default function Container({ children, className = '', justify = 'center' }: ContainerProps) {
  return (
    <div className={[
      'w-screen',
      'flex',
      JUSTIFY_CLASS[justify],
      'p-10',
      className,
    ].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
