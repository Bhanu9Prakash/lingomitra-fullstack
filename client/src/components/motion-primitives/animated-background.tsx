"use client";

// Adapted from Motion Primitives' AnimatedBackground (MIT).
// Source: https://motion-primitives.com/docs/animated-background

import * as React from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";

type SelectableChildProps = {
  "data-id": string;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
};

interface AnimatedBackgroundProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  enableHover?: boolean;
  backgroundClassName?: string;
  transition?: Transition;
}

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  enableHover = false,
  backgroundClassName,
  transition = { type: "spring", stiffness: 360, damping: 34, mass: 0.65 },
  className,
  ...props
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = React.useState<string | null>(defaultValue ?? null);
  const layoutId = `animated-background-${React.useId()}`;
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    setActiveId(defaultValue ?? null);
  }, [defaultValue]);

  const choose = React.useCallback((id: string) => {
    setActiveId(id);
    onValueChange?.(id);
  }, [onValueChange]);

  return (
    <div className={cn("animated-background", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<SelectableChildProps>(child)) return child;

        const id = child.props["data-id"];
        if (!id) return child;

        const interactionProps = enableHover
          ? {
              onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
                child.props.onMouseEnter?.(event);
                choose(id);
              },
            }
          : {
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                child.props.onClick?.(event);
                choose(id);
              },
            };

        return React.cloneElement(child, {
          ...interactionProps,
          children: (
            <>
              {activeId === id ? (
                <motion.span
                  layoutId={layoutId}
                  className={cn("animated-background-selection", backgroundClassName)}
                  transition={shouldReduceMotion ? { duration: 0 } : transition}
                  aria-hidden="true"
                />
              ) : null}
              {child.props.children}
            </>
          ),
        });
      })}
    </div>
  );
}
