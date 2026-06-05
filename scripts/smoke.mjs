// Quick smoke test: build a theme zip from default seed data via the compiler
// and write it to /tmp so we can inspect it without spinning up the UI.
import { build } from "vite";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

// Build the compiler as a library and import its output.
await build({
  root,
  logLevel: "warn",
  build: {
    lib: {
      entry: path.join(root, "src/compiler/index.ts"),
      formats: ["es"],
      fileName: "compiler-smoke",
    },
    outDir: path.join(root, ".smoke"),
    emptyOutDir: true,
    rollupOptions: { external: ["jszip"] },
  },
});

const mod = await import(path.join(root, ".smoke/compiler-smoke.js"));
const seed = (await import(path.join(root, "scripts/seed.mjs"))).seed;

const project = { meta: seed.meta, templates: seed.templates };
const files = mod.compile(project);

const out = path.join(root, ".smoke/theme");
await mkdir(out, { recursive: true });
for (const [p, content] of Object.entries(files)) {
  const full = path.join(out, p);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content);
}
console.log("Wrote", Object.keys(files).length, "files to", out);
console.log("\n--- index.hbs ---");
console.log(files["index.hbs"]);
