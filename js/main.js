/* ═══════════════════════════════════════════════════
   main.js
   Application entry point. Owns shared mutable state
   (hierRoot, W, H, sv, rg, zoom) and the two lifecycle
   functions: dims() and buildTree().

   Load order in index.html must be:
     d3 → data.js → constants.js → layout.js →
     draw.js → animate.js → interaction.js → main.js
═══════════════════════════════════════════════════ */

// ── shared state (referenced by all other modules) ──
let hierRoot;        // d3.hierarchy root node
let W, H;            // canvas dimensions (updated on resize)

// D3 selections
const sv = d3.select('#svg');
const rg = d3.select('#root-g');

// D3 zoom behaviour — shared so interaction.js can call scaleBy
const zoom = d3.zoom()
  .scaleExtent([0.08, 6])
  .on('zoom', e => rg.attr('transform', e.transform));

sv.call(zoom).on('dblclick.zoom', null);

// ── UID counter — stable IDs that survive redraw() ──
let _uidCounter = 0;

// ─────────────────────────────────────────────────────────────────
// dims() — read canvas size into W / H
// ─────────────────────────────────────────────────────────────────
function dims() {
  const el = document.getElementById('canvas');
  W = el.clientWidth;
  H = el.clientHeight;
}

// ─────────────────────────────────────────────────────────────────
// buildTree() — construct hierarchy from DATA, seed float state,
//               then hand off to draw.js
// ─────────────────────────────────────────────────────────────────
function buildTree() {
  hierRoot = d3.hierarchy(DATA);

  hierRoot.descendants().forEach(d => {
    // Stable numeric ID — used as DOM element id by draw.js
    d._uid = _uidCounter++;

    // Float animation state (used by animate.js)
    d._floatPhase = Math.random() * Math.PI * 2; // unique starting phase
    d._floatDelta = 0;                            // current angular offset

    // Collapse everything below L1 on first load
    if (d.depth >= 1 && d.children) {
      d._children = d.children;
      d.children  = null;
    }
  });

  redraw(); // defined in draw.js
}

// ─────────────────────────────────────────────────────────────────
// Lifecycle events
// ─────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  dims();
  buildTree();

  // Centre the radial tree in the viewport
  sv.call(
    zoom.transform,
    d3.zoomIdentity.translate(W / 2, H / 2).scale(0.88)
  );

  // Dismiss loading screen after the bar animation finishes
  setTimeout(() => {
    document.getElementById('loading').classList.add('done');
  }, 1400);

  // Float loop is started inside redraw() after DOM is ready
});

window.addEventListener('resize', () => {
  dims();
  resetView(); // defined in interaction.js
});
