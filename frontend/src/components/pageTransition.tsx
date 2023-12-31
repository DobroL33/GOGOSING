export const PageVariants = {
  initial: (direction: boolean) => ({
    opacity: 0,
    x: direction ? "20%" : "-20%",
  }),
  in: {
    opacity: 1,
    x: 0,
  },
  out: (direction: boolean) => ({
    opacity: 0,
  }),
};

export const PageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.15,
};
