require("esbuild").buildSync({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["chrome58", "firefox57", "safari11"],
  outdir: "dist",
});
