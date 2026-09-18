import "react";

declare module "react" {
  interface CSSProperties {
    /** Zero-based stagger index consumed by the landing animations in motion.css. */
    "--i"?: number;
  }
}
