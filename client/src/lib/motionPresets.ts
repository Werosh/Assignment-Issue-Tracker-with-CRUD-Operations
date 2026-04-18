/** Shared Framer Motion presets for modals and drag UI. */

export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const modalBackdropTransition = { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };

export const modalPanelVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const modalPanelTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

export const dragOverlayVariants = {
  hidden: { scale: 0.94, opacity: 0.92, rotate: -0.8 },
  visible: { scale: 1, opacity: 1, rotate: 0 },
};

export const dragOverlayTransition = {
  type: "spring" as const,
  stiffness: 480,
  damping: 32,
};

export const cardHoverTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
};
