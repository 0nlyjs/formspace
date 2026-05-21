import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  noExternal: [/^@repo\//], // bundle all internal workspace packages into the output
  external: ["@scalar/express-api-reference"], // keep ESM-only package external
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  format: ["esm"], // output ESM so ESM-only packages like @scalar work
  outExtension: () => ({ js: ".mjs" }),
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
});
