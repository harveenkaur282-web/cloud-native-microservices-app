import React from 'react';
import AnimatedPage from './AnimatedPage';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageContainer({
  children,
  title,
  description,
  action,
}: PageContainerProps) {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      {(title || description || action) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="space-y-4">
        <AnimatedPage>{children}</AnimatedPage>
      </div>
    </div>
  );
}
