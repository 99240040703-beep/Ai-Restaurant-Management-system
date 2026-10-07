import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/* Every class name the components ask for, against every class name any
   stylesheet defines. A class with no rule anywhere is a component that
   will render as the browser's own markup, which is the most obvious
   "this is a prototype" tell there is. */

const stylesheets = readdirSync(here)
  .filter((name) => name.endsWith(".css"))
  .map((name) => readFileSync(join(here, name), "utf8"))
  .join("\n");

const defined = new Set();

for (const match of stylesheets.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
  defined.add(match[1]);
}

const used = new Map();

for (const name of readdirSync(here).filter((n) => n.endsWith(".jsx"))) {
  const source = readFileSync(join(here, name), "utf8");

  /* A literal className, a template literal, or a ternary of literals. */
  const patterns = [
    /className="([^"]*)"/g,
    /className=\{`([^`]*)`\}/g,
    /className=\{[^}]*?"([^"]*)"/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      /* Interpolations collapse to nothing: the static parts around them
         are still real class names. */
      const parts = match[1].split(/\$\{[^}]*\}/);

      for (const part of parts) {
        for (const token of part.split(/\s+/)) {
          const clean = token.replace(/[^A-Za-z0-9_-]/g, "");

          if (!clean) continue;

          if (!used.has(clean)) used.set(clean, new Set());
          used.get(clean).add(name);
        }
      }
    }
  }
}

const missing = [...used.entries()]
  .filter(([name]) => !defined.has(name))
  .sort();

console.log(
  `classes used in JSX with no rule in any stylesheet: ${missing.length}\n`,
);

missing.forEach(([name, files]) => {
  console.log(`  .${name}  (${[...files].join(", ")})`);
});
