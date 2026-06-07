"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariants, motionTransition } from "@/lib/motion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span";
}

/**
 * A thin wrapper that fades content in with a slight upward slide.
 * Designed to be unobtrusive — respects reduced-motion preferences.
 *
 * Usage:
 *   <FadeIn delay={0.05}>
 *     <SomeCard />
 *   </FadeIn>
 *
 * For staggered lists, pass increasing delays:
 *   {items.map((item, i) => (
 *     <FadeIn key={item.id} delay={i * 0.04}>
 *       <ItemCard />
 *     </FadeIn>
 *   ))}
 */
export function FadeIn({ children, delay = 0, className, as = "div" }: FadeInProps) {
  const reducedMotion = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={motionTransition(reducedMotion, 0.22 + delay)}
      className={className}
    >
      {children}
    </Tag>
  );
}
