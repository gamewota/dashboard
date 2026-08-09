import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Removes inner padding — use when the child manages its own edges (e.g. a table). */
  flush?: boolean;
};

/**
 * Surface primitive. Gives content a bounded, elevated container so it stops
 * bleeding to the viewport edges.
 */
export default function Card({ children, className = '', flush = false }: CardProps) {
  return (
    <div
      className={[
        'bg-base-100 border border-base-300 rounded-xl shadow-sm',
        flush ? 'overflow-hidden' : 'p-5',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
