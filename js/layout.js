/* ═══════════════════════════════════════════════════
   layout.js
   Owns the D3 radial tree layout computation and the
   nodeXY() function that converts a hierarchy node
   to { x, y } screen coordinates.

   The float animation in animate.js writes _floatDelta
   onto L1 nodes; nodeXY() reads it so every descendant
   inherits the drift automatically.
═══════════════════════════════════════════════════ */

/**
 * Run d3.tree() on the global hierRoot.
 * Assigns .x (angle, radians) and .y (normalised radius)
 * to every node. Called at the start of each redraw().
 */
function computeLayout() {
  const layout = d3.tree()
    .size([2 * Math.PI, 1])
    .separation((a, b) => a.parent === b.parent ? 1 : 2);

  layout(hierRoot);
}

/**
 * Convert a hierarchy node to SVG { x, y } coordinates.
 *
 * For depth >= 1 the L1 ancestor's _floatDelta is added to
 * the base angle, so the whole branch drifts together while
 * the root stays pinned at the origin.
 *
 * @param  {d3.HierarchyNode} d
 * @returns {{ x: number, y: number }}
 */
function nodeXY(d) {
  const r     = RADII[Math.min(d.depth, RADII.length - 1)];
  // Use the snapshotted base angle (set in redraw) so float is
  // always an additive offset, never drifting from a moving target.
  let angle   = d._baseX !== undefined ? d._baseX : d.x;

  if (d.depth >= 1) {
    const l1 = d.depth === 1
      ? d
      : d.ancestors().find(a => a.depth === 1);

    if (l1 && l1._floatDelta !== undefined) {
      angle += l1._floatDelta;
    }
  }

  return {
    x: r * Math.cos(angle - Math.PI / 2),
    y: r * Math.sin(angle - Math.PI / 2)
  };
}
