import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import next from "ultracite/oxlint/next";
import nextJsPlugins from "ultracite/oxlint/next/js-plugins";
import react from "ultracite/oxlint/react";

const jsPlugins = selectJsPlugins(["github", "sonarjs", "react-doctor"]);

export default defineConfig({
  extends: [antiSlop, core, next, nextJsPlugins, react, jsPlugins],
  ignorePatterns: [
    ...(core.ignorePatterns || []),
    ".agents/**/*",
    "src/components/ui/**/*",
  ],
  jsPlugins: jsPlugins.jsPlugins,
  rules: {
    // `<>{children}</>` is how a pass-through boundary component is written —
    // it keeps server-rendered children off the client. See LandingMotion.
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
  },
  settings: jsPluginSettings,
});
