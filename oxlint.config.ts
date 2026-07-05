import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import github from "ultracite/oxlint/github";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import sonarjs from "ultracite/oxlint/sonarjs";

export default defineConfig({
  extends: [core, github, next, react, sonarjs],
  ignorePatterns: core.ignorePatterns,
  rules: {
    // Declare the "@/*" tsconfig path alias so the dependency check doesn't
    // mistake internal modules for undeclared npm packages.
    "sonarjs/no-implicit-dependencies": [
      "error",
      { whitelist: ["@/app", "@/components", "@/hooks", "@/lib"] },
    ],
  },
});
