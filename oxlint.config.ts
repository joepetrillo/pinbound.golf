import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import jsPlugins from "ultracite/oxlint/js-plugins";
import next from "ultracite/oxlint/next";
import nextJsPlugins from "ultracite/oxlint/next/js-plugins";
import react from "ultracite/oxlint/react";

const selectedJsPluginNames = new Set(["github", "sonarjs", "react-doctor"]);
const selectedJsPluginRulePrefixes = new Set([
  "github",
  "sonarjs",
  "react-doctor",
]);

const selectedJsPlugins = {
  ...jsPlugins,
  jsPlugins: jsPlugins.jsPlugins?.filter((plugin) =>
    selectedJsPluginNames.has(typeof plugin === "string" ? plugin : plugin.name)
  ),
  overrides: jsPlugins.overrides?.map((override) => ({
    ...override,
    rules: Object.fromEntries(
      Object.entries(override.rules ?? {}).filter(([ruleName]) =>
        selectedJsPluginRulePrefixes.has(ruleName.split("/")[0] ?? ruleName)
      )
    ),
  })),
  rules: Object.fromEntries(
    Object.entries(jsPlugins.rules ?? {}).filter(([ruleName]) =>
      selectedJsPluginRulePrefixes.has(ruleName.split("/")[0] ?? ruleName)
    )
  ),
};

export default defineConfig({
  extends: [core, next, nextJsPlugins, react, selectedJsPlugins],
  ignorePatterns: [
    ...(core.ignorePatterns || []),
    ".agents/**/*",
    "src/components/ui/**/*",
  ],
  rules: {
    // `<>{children}</>` is how a pass-through boundary component is written —
    // it keeps server-rendered children off the client. See LandingMotion.
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
  },
});
