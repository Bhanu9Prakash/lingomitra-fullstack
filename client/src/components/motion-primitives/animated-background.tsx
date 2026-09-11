// Upstream: https://github.com/ibelick/motion-primitives/blob/92586e62a951eb9b6bfd1cc7c8a4e6e2ab6ba17d/components/core/animated-background.tsx
// MIT. Controlled route selection and reduced-motion compatibility are recorded in component-sources.json.
'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, Transition, motion, useReducedMotion } from 'motion/react';
import {
  Children,
  cloneElement,
  ReactElement,
  useEffect,
  useState,
  useId,
} from 'react';

export type AnimatedBackgroundProps = {
  children:
    | ReactElement<{ 'data-id': string }>[]
    | ReactElement<{ 'data-id': string }>;
  defaultValue?: string;
  value?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  value,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultValue ?? null);
  const uniqueId = useId();
  const reducedMotion = useReducedMotion() !== false;
  const selectedId = value !== undefined ? value : activeId;

  const handleSetActiveId = (id: string | null) => {
    if (value === undefined) setActiveId(id);

    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return Children.map(children, (child: any, index) => {
    const id = child.props['data-id'];

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => handleSetActiveId(id),
        };

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative inline-flex', child.props.className),
        'data-checked': selectedId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {selectedId === id && (
            <motion.div
              layoutId={reducedMotion ? undefined : `background-${uniqueId}`}
              aria-hidden="true"
              className={cn('absolute inset-0', className)}
              transition={reducedMotion ? { duration: 0 } : transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <div className='z-10'>{child.props.children}</div>
      </>
    );
  });
}
