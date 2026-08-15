import type { CSSProperties } from "react";

/** Sets `--i` for the landing stagger contract in `src/app/motion.css`. */
export const staggerStyle = (index: number): CSSProperties => {
  const style: CSSProperties & { "--i": number } = { "--i": index };
  return style;
};
