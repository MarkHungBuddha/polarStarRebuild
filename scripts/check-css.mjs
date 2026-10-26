// Mechanical techo-style rules for src/*.css (docs/techo-restyle-spec.md): px sizes, never rem, and corner radii from the
// --radius-* tokens or the fixed shapes below, so new components cannot drift into a different look.
import { readdirSync, readFileSync } from 'node:fs';
import process from 'node:process';

const allowedRadius = [/^0$/, /^50%$/, /^99px$/, /^var\(--radius-[a-z]+\)$/];
const problems = [];
for (const file of readdirSync('src').filter(name => name.endsWith('.css'))) {
  readFileSync(`src/${file}`, 'utf8').split('\n').forEach((line, index) => {
    const where = `src/${file}:${index + 1}`;
    if (/\d(\.\d+)?rem\b/.test(line)) problems.push(`${where} uses rem; size with px like the rest of the techo styles.`);
    for (const [, value] of line.matchAll(/border-radius:\s*([^;}]+)/g)) {
      if (!allowedRadius.some(pattern => pattern.test(value.trim()))) problems.push(`${where} border-radius ${value.trim()}; use var(--radius-*), 0, 50% or 99px.`);
    }
  });
}
if (problems.length) {
  process.stderr.write(`${problems.join('\n')}\n`);
  process.exit(1);
}
