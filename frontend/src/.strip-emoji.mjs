import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/* Pictographic emoji, and the invisible glue that holds some of them
   together: the variation selector, the zero-width joiner, and the skin
   tone modifiers. Left in, they render as a gap. */
const STRIP = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{23E9}-\u{23FA}\u{25A0}-\u{25FF}\u{FE0F}\u{200D}\u{20E3}]/gu;

/* Typographic marks that are not illustrations and read as type at any
   size. These stay. */
const KEEP = new Set([
  0x2190, // leftwards arrow
  0x2192, // rightwards arrow
  0x2605, // black star - the rating glyph
  0x2713, // check mark
  0x2715, // multiplication x - the close button
  0x2726, // four-pointed star
  0x00d7, // multiplication sign
]);

const files = [
  "Kitchen.jsx",
  "Orders.jsx",
  "Menu.jsx",
  "Reservations.jsx",
  "Tables.jsx",
  "AIInsights.jsx",
  "AIChartBoard.jsx",
  "CustomerPortal.jsx",
  "Inventory.jsx",
  "Reviews.jsx",
  "Waste.jsx",
  "Revenue.jsx",
  "Staff.jsx",
  "Suppliers.jsx",
  "Customers.jsx",
];

let total = 0;

for (const file of files) {
  const path = join(here, file);
  const before = readFileSync(path, "utf8");

  let changed = 0;

  const after = before.replace(STRIP, (match) => {
    const code = match.codePointAt(0);

    if (KEEP.has(code)) return match;

    changed += 1;
    return "";
  });

  if (changed === 0) continue;

  /* A glyph that was the only thing in its own line, or that used to
     separate two words, leaves a double space or a stray comma behind.
     Both are tidied here rather than left for a human to find. */
  const tidied = after
    .replace(/\{ " +"/g, '{ "')
    .replace(/\{ "" \}/g, "{ }")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ \{ \}/g, " {null}")
    .replace(/<span>\s*<\/span>/g, "<span />")
    .replace(/"" \}/g, '"" }');

  writeFileSync(path, tidied, "utf8");

  total += changed;
  console.log(`${file}: ${changed} glyphs removed`);
}

console.log(`\n${total} glyphs removed across ${files.length} files`);
