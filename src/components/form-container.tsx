import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const FormContainer: React.FC<{
  className?: string;
  children: ReactNode;
}> = (props) => {
  return (
    <div
      className={cn(
        'max-w-[600px] mx-auto space-y-6 border p-6 rounded-md bg-card',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
};
