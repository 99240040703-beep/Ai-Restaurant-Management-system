import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/* A second pass over the files the emoji strip touched. Removing a glyph
   from the front of a label leaves a leading space behind - invisible in
   JSX text, visible inside a string literal, and wrong in both. This trims
   them and retires the one ternary the strip emptied out. */

const files = [
  "Kitchen.jsx",
  "Orders.jsx",
  "Menu.jsx",
  "Reservations.jsx",
  "Tables.jsx",
  "AIInsights.jsx",
  "CustomerPortal.jsx",
  "Inventory.jsx",
  "Reviews.jsx",
  "Waste.jsx",
  "Revenue.jsx",
  "Staff.jsx",
  "Suppliers.jsx",
  "Customers.jsx",
];

const fixes = [
  // A space left where the glyph used to open a label.
  [/" ([A-Za-z(])/g, '"$1'],
  // The same, at the start of a JSX text run.
  [/> ([A-Za-z])/g, ">$1"],
  // A ternary whose two arms are now both empty strings. The dietary dot
  // beside it already carries the vegetarian information.
  [/\{dish\.is_vegetarian \? "" : ""\}/g, "{null}"],
];

for (const file of files) {
  const path = join(here, file);
  let text = readFileSync(path, "utf8");
  const before = text;

  for (const [pattern, replacement] of fixes) {
    text = text.replace(pattern, replacement);
  }

  if (text === before) continue;

  writeFileSync(path, text, "utf8");
  console.log(`${file}: tidied`);
}
