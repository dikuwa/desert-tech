import type { Transition, Variants } from "framer-motion";

export const motionEase = [0.16, 1, 0.3, 1] as const;

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const statusVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export function motionTransition(
  reducedMotion: boolean | null,
  duration = 0.22,
): Transition {
  return reducedMotion
    ? { duration: 0 }
    : { duration, ease: motionEase };
}
