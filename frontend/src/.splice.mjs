import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(here, name), "utf8");

const target = join(here, "portal.css");
let css = read("portal.css");

const shell = read(".shell-block.css");
const guest = read(".guest-block.css");
const responsive = read(".responsive-block.css");
const repaint = read(".repaint-block.css");

/**
 * Replaces the region that starts at a section banner (the `/* ====` line
 * immediately above a named title) up to, but not including, the banner of
 * the next section. Working on the banners rather than on line numbers
 * means the splice survives an edit anywhere else in the file.
 */
function replaceSection(cssText, title, nextTitle, body) {
  const banner = (name) =>
    new RegExp(
      `/\\* ={10,}\\r?\\n\\s*${name}\\r?\\n`,
    );

  const start = banner(title);
  const end = new RegExp(`/\\* ={10,}\\r?\\n\\s*${nextTitle}[^\\r\\n]*\\r?\\n`);

  const startMatch = start.exec(cssText);
  if (!startMatch) throw new Error(`section not found: ${title}`);

  const endMatch = end.exec(cssText.slice(startMatch.index));
  if (!endMatch) throw new Error(`next section not found: ${nextTitle}`);

  const from = startMatch.index;
  const to = startMatch.index + endMatch.index;

  return cssText.slice(0, from) + body + "\n" + cssText.slice(to);
}

css = replaceSection(css, "ADMIN SHELL", "PAGE SCAFFOLDING", shell);
css = replaceSection(
  css,
  "15\\. CUSTOMER PORTAL SHELL",
  "16\\. TYPOGRAPHY REFINEMENTS",
  guest,
);
css = replaceSection(css, "17\\. RESPONSIVE", "18\\. LOGIN", responsive);

css = `${css.trimEnd()}\n\n${repaint.trim()}\n`;

writeFileSync(target, css, "utf8");
console.log("portal.css rewritten,", css.split("\n").length, "lines");
