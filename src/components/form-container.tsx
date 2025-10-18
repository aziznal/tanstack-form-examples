import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const FormContainer: React.FC<{
  className?: string;
  children: ReactNode;
}> = (props) => {
  return (
    <div className={cn('space-y-6 border p-6 rounded-md', props.className)}>{props.children}</div>
  );
};
