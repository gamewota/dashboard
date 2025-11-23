import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

// Reusable layout container to avoid repeating tailwind wrapper classes
export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={[
      'w-screen',
      'flex',
      'justify-center',
      'p-10',
      className,
    ].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
