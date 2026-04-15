/* ═══════════════════════════════════════════════════
   constants.js
   Numeric and mapping constants shared across modules.
   Change a value here and it propagates everywhere.
═══════════════════════════════════════════════════ */

// Pixel radius for each depth level (root=0, l1=1 … l10=10).
// Rings get progressively closer together at deeper levels.
const RADII = [
    0,   // depth 0  — root (centre)
  165,   // depth 1  — L1 category pills
  300,   // depth 2  — L2 group boxes
  420,   // depth 3  — L3
  530,   // depth 4  — L4
  630,   // depth 5  — L5
  720,   // depth 6  — L6
  800,   // depth 7  — L7
  870,   // depth 8  — L8
  930,   // depth 9  — L9
  980,   // depth 10 — L10 leaf
];

// Level-1 pill dimensions (px)
const L1W = 84;
const L1H = 24;

// Level-2 box height (px) — width is computed from label length
const L2H = 18;

// Leaf dot radius (px)
const LEAF_R = 3.5;

// Badge type → CSS colour expression
const TYPE_COLOR = {
  T: 'var(--accent)',   // local tool  → cyan
  D: 'var(--accent3)',  // dork        → orange
  R: '#ffc800',         // registration → yellow
  M: '#b464ff'          // manual URL  → purple
};
