import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "../lib/utils";

/**
 * fade-rise(12px, 300ms) entrance.
 *
 * `show` comes from an IntersectionObserver in the parent, so a whole block can
 * cascade in from a single observation point without nesting transforms (a
 * translate on both a wrapper and its child would double the displacement).
 */
export function Rise({
  show = true,
  delay = 0,
  className,
  as: Tag = "div",
  children,
}: {
  show?: boolean;
  delay?: number;
  className?: string;
  as?: ElementType;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(show ? "rg-rise" : "opacity-0", className)}
      style={{ "--rg-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
