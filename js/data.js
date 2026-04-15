/* ═══════════════════════════════════════════════════
   data.js
   Fetches osint-data.csv and parses it into the nested
   { name, children[] } tree that d3.hierarchy() expects.

   CSV COLUMN STRUCTURE (12 columns total)
   ────────────────────────────────────────
   l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, url, type

   RULES
   ─────
   • Fill columns left to right, leave the rest empty.
   • The last non-empty level column is the leaf node.
   • Levels must be contiguous — no skipping a column.
   • url  — required on leaf rows, empty on branch rows.
   • type — optional: T | D | R | M

   EXAMPLE ROWS
   ─────────────
   Username, Search, Sherlock, , , , , , , , https://github.com/..., T
   Username, Search, WhatsMyName, , , , , , , , https://whatsmyname.app,
   Domain/IP, Whois, DNS, Active, Nmap, TCP Scan, , , , , https://nmap.org, T

   DEDUPLICATION
   ─────────────
   A Map is maintained at every level. If a node name
   already exists at that position in the tree it is
   reused — never duplicated. Only unique names create
   new nodes.
═══════════════════════════════════════════════════ */

const CSV_PATH      = 'osint-data.csv';
const LEVEL_COLUMNS = 10;   // l1 … l10  (columns 0–9)
const COL_URL       = 10;   // index of url  column
const COL_TYPE      = 11;   // index of type column

// ─────────────────────────────────────────────────────────────────
// parseCSV — minimal, dependency-free CSV parser.
// Handles quoted fields and trims whitespace.
// Returns an array of string arrays (rows × columns).
// ─────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const rows  = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;

    const cols    = [];
    let   cur     = '';
    let   inQuote = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────────
// buildTreeFromRows — converts parsed CSV rows into the nested
// node object consumed by d3.hierarchy().
//
// Algorithm:
//   • One Map per level tracks name → node so duplicates are
//     caught in O(1).
//   • Walking left-to-right each row, we find or create each
//     branch node, then attach the leaf at the deepest column.
//   • Maps for levels deeper than the current leaf are cleared
//     so stale references from a previous branch don't leak.
// ─────────────────────────────────────────────────────────────────
function buildTreeFromRows(rows) {
  const root = { name: 'OSINT\nFramework', children: [] };

  // One Map per depth level: name → node reference
  const maps = Array.from({ length: LEVEL_COLUMNS }, () => new Map());

  for (const row of rows) {
    const url  = (row[COL_URL]  || '').trim();
    const type = (row[COL_TYPE] || '').trim() || undefined;

    // Find the deepest non-empty level column — that is the leaf
    let leafDepth = -1;
    for (let i = LEVEL_COLUMNS - 1; i >= 0; i--) {
      if (row[i] && row[i].trim()) { leafDepth = i; break; }
    }
    if (leafDepth < 0) continue; // nothing useful in this row

    // Walk from depth 0 to leafDepth
    for (let depth = 0; depth <= leafDepth; depth++) {
      const name = (row[depth] || '').trim();
      if (!name) break; // levels must be contiguous

      const isLeaf = depth === leafDepth;

      // Resolve parent's children array
      const parentChildren = depth === 0
        ? root.children
        : (() => {
            const parentName = (row[depth - 1] || '').trim();
            const parent     = maps[depth - 1].get(parentName);
            if (!parent) return null;
            if (!parent.children) parent.children = [];
            return parent.children;
          })();

      if (!parentChildren) break; // safety

      // Create node only if it doesn't already exist at this depth
      if (!maps[depth].has(name)) {
        const node = isLeaf && url
          ? { name, url, type }       // leaf
          : { name, children: [] };   // branch

        parentChildren.push(node);
        maps[depth].set(name, node);
      }

      if (isLeaf) break;
    }

    // Clear Maps for levels deeper than this leaf so the next
    // shallower row doesn't accidentally reuse stale parents
    for (let i = leafDepth + 1; i < LEVEL_COLUMNS; i++) {
      maps[i].clear();
    }
  }

  return root;
}

// ─────────────────────────────────────────────────────────────────
// loadData — public API called by main.js.
// Fetches the CSV, strips the header row, returns the tree.
// ─────────────────────────────────────────────────────────────────
async function loadData() {
  const response = await fetch(CSV_PATH);
  if (!response.ok) {
    throw new Error(`Failed to load ${CSV_PATH} — HTTP ${response.status}`);
  }
  const text = await response.text();
  const rows = parseCSV(text).slice(1); // drop header row
  return buildTreeFromRows(rows);
}
