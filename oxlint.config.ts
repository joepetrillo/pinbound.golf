import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import jsPlugins from "ultracite/oxlint/js-plugins";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, jsPlugins, next, react],
  ignorePatterns: [
    ...(core.ignorePatterns || []),
    ".agents/**/*",
    "src/components/ui/**/*",
  ],
  rules: {
    "eslint/func-style": "off",
  },
});
