import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned slot for page-level actions (e.g. a "Create" button). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Standard page heading: title, optional supporting copy, and an actions slot.
 * Replaces the ad-hoc `<h1 className="text-2xl font-bold">` + flex wrapper that
 * pages were each rebuilding by hand.
 */
export default function PageHeader({ title, description, actions, className = '' }: PageHeaderProps) {
  return (
    <div className={['mb-6', className].filter(Boolean).join(' ')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-base-content/60">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
