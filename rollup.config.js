import { defineConfig } from "rollup";
import pluginTypescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "src/index.ts",
  output: {
    format: "es",
    dir: "dist",
    preserveModules: true,
    preserveModulesRoot: "src",
  },
  plugins: [pluginTypescript()],
});
