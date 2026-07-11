import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [".agents/**/*"],
  sortTailwindcss: {
    functions: ["clsx", "cn", "cva", "cx", "tw"],
    stylesheet: "./src/app/globals.css",
  },
});
