/* ═══════════════════════════════════════════════════
   interaction.js
   All user-facing event handlers:
     onClick()       — node click (toggle or open URL)
     expandAll()     — expand full tree
     collapseAll()   — collapse to L1 ring only
     showTip()       — show tooltip on hover
     moveTip()       — follow cursor
     hideTip()       — hide tooltip
     doZoom()        — programmatic zoom in/out
     resetView()     — snap back to centred default
     toggleTheme()   — dark ↔ light
═══════════════════════════════════════════════════ */

// ── node click ────────────────────────────────────

/**
 * Toggle a branch open/closed, or open a leaf URL.
 * @param {d3.HierarchyNode} d
 */
function onClick(d) {
  if (d.depth === 0) return; // root — not interactive

  // Leaf node → open tool URL in new tab
  if (!d.children && !d._children) {
    if (d.data.url) window.open(d.data.url, '_blank');
    return;
  }

  // Branch node → toggle children
  if (d.children) {
    d._children = d.children;
    d.children  = null;
  } else {
    d.children  = d._children;
    d._children = null;
  }

  redraw();
}

/** Expand every node in the tree. */
function expandAll() {
  hierRoot.descendants().forEach(d => {
    if (d._children) { d.children = d._children; d._children = null; }
  });
  redraw();
}

/** Collapse everything back to the L1 ring. */
function collapseAll() {
  hierRoot.descendants().forEach(d => {
    if (d.depth >= 1 && d.children) {
      d._children = d.children;
      d.children  = null;
    }
  });
  redraw();
}

// ── tooltip ───────────────────────────────────────

const tipEl    = document.getElementById('tip');
const tipName  = document.getElementById('tip-name');
const tipUrl   = document.getElementById('tip-url');
const tipTag   = document.getElementById('tip-tag');

const TYPE_LABEL = {
  T: '(T) Local install required',
  D: '(D) Google Dork',
  R: '(R) Registration required',
  M: '(M) Manual URL edit'
};

/**
 * @param {MouseEvent}         ev
 * @param {d3.HierarchyNode}   d
 */
function showTip(ev, d) {
  // Only show tooltip for actionable nodes
  if (!d.data.url && !(d.children || d._children)) return;

  tipName.textContent = d.data.name;
  tipUrl.textContent  = d.data.url || '— click to expand / collapse —';
  tipTag.textContent  = d.data.type ? TYPE_LABEL[d.data.type] : '';

  tipEl.classList.add('on');
  moveTip(ev);
}

/** @param {MouseEvent} ev */
function moveTip(ev) {
  tipEl.style.left = (ev.clientX + 14) + 'px';
  tipEl.style.top  = (ev.clientY - 8)  + 'px';
}

function hideTip() {
  tipEl.classList.remove('on');
}

// ── zoom ──────────────────────────────────────────

/**
 * Zoom the SVG by a scale factor.
 * @param {number} k — e.g. 1.3 to zoom in, 0.77 to zoom out
 */
function doZoom(k) {
  sv.transition().duration(220).call(zoom.scaleBy, k);
}

/** Reset pan + zoom to the centred default. */
function resetView() {
  dims();
  sv.transition().duration(480).call(
    zoom.transform,
    d3.zoomIdentity.translate(W / 2, H / 2).scale(0.88)
  );
}

// ── theme ─────────────────────────────────────────

let isDark = true;

/** Toggle between dark and light theme. */
function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('light', !isDark);
  document.getElementById('themeBtn').textContent =
    isDark ? '☀ Light' : '🌙 Dark';
}
