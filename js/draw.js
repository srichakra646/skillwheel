/* ═══════════════════════════════════════════════════
   draw.js
   Owns all SVG rendering:
     redraw()      — full scene rebuild (called on toggle)
     drawNode()    — dispatches to the right renderer
     renderRoot()  — central hub
     renderL1()    — category pill
     renderL2()    — sub-group box
     renderLeaf()  — tool dot + label
═══════════════════════════════════════════════════ */

/**
 * Full scene rebuild. Clears the SVG group, recomputes the
 * D3 layout, draws rings → links → nodes, then restarts the
 * float animation loop so new DOM elements are picked up.
 */
function redraw() {
  // Pause loop — new DOM elements will be picked up after restart
  if (typeof stopFloatLoop === 'function') stopFloatLoop();

  rg.selectAll('*').remove();
  computeLayout();

  const allNodes = hierRoot.descendants();

  // Snapshot base angles so float deltas are pure additive offsets
  allNodes.forEach(d => { d._baseX = d.x; });

  // ── decorative orbit rings ────────────────────────────────────
  const maxD   = d3.max(allNodes, d => d.depth);
  const ringG  = rg.append('g').attr('class', 'rings');

  for (let i = 1; i <= Math.min(maxD, RADII.length - 1); i++) {
    ringG.append('circle')
      .attr('class', 'orbit-ring-solid')
      .attr('r', RADII[i]);
    ringG.append('circle')
      .attr('class', 'orbit-ring ring-rotate')
      .attr('r', RADII[i]);
  }
  // outer frame ring
  ringG.append('circle')
    .attr('class', 'orbit-ring-solid')
    .attr('r', RADII[RADII.length - 1] + 40)
    .attr('opacity', 0.04);

  // ── links ─────────────────────────────────────────────────────
  const linkG = rg.append('g').attr('class', 'link-group');

  hierRoot.links().forEach(lk => {
    const s  = lk.source, t = lk.target;
    const sp = nodeXY(s),  tp = nodeXY(t);
    const blend = 0.45;
    const mx = (sp.x + tp.x) * blend;
    const my = (sp.y + tp.y) * blend;

    // Link class: leaf links get .lk-leaf, others get .lk-d{depth}
    const isLeafTarget = !t.children && !t._children;
    const cls = isLeafTarget
      ? 'link lk-leaf'
      : `link lk-d${Math.min(t.depth, 10)}`;

    linkG.append('path')
      .attr('class', cls)
      .attr('id',    `lk-${s._uid}-${t._uid}`)
      .attr('d',     `M${sp.x},${sp.y} Q${mx},${my} ${tp.x},${tp.y}`);
  });

  // ── nodes (deepest first → root renders on top) ───────────────
  const nodeG   = rg.append('g').attr('class', 'node-group');
  const byDepth = [[], [], [], []];

  allNodes.forEach(d => {
    const dep = Math.min(d.depth, 3);
    byDepth[dep].push(d);
  });

  for (let dep = 3; dep >= 0; dep--) {
    byDepth[dep].forEach(d => drawNode(nodeG, d));
  }

  // Restart float loop — all elements now in DOM with stable IDs
  if (typeof startFloatLoop === 'function') startFloatLoop();
}

// ─────────────────────────────────────────────────────────────────
// drawNode — creates a <g> wrapper and delegates to the right
// renderer based on depth:
//   depth 0          → renderRoot
//   depth 1          → renderL1  (category pill)
//   depth 2–3        → renderL2  (group box, shrinks at depth 3)
//   depth 4+ leaf    → renderLeaf
//   depth 4+ branch  → renderDeepBranch (small labelled circle)
// ─────────────────────────────────────────────────────────────────
function drawNode(container, d) {
  const { x, y } = nodeXY(d);
  const isLeaf    = !d.children && !d._children;

  const g = container.append('g')
    .attr('class',     'node')
    .attr('id',        `n-${d._uid}`)
    .attr('transform', `translate(${x},${y})`)
    .style('cursor',   'pointer')
    .on('click',     ev => { ev.stopPropagation(); onClick(d); })
    .on('mouseover', ev => showTip(ev, d))
    .on('mousemove', ev => moveTip(ev))
    .on('mouseout',  () => hideTip());

  if      (d.depth === 0)             renderRoot(g);
  else if (d.depth === 1)             renderL1(g, d);
  else if (d.depth <= 3)              renderL2(g, d);
  else if (isLeaf)                    renderLeaf(g, d);
  else                                renderDeepBranch(g, d);
}

// ─────────────────────────────────────────────────────────────────
// renderRoot — central hub with concentric decorative circles
// ─────────────────────────────────────────────────────────────────
function renderRoot(g) {
  // outermost dashed halo (also carries the CSS pulse animation)
  g.append('circle')
    .attr('class',             'root-pulse')
    .attr('r',                 58)
    .attr('fill',              'none')
    .attr('stroke',            'var(--accent)')
    .attr('stroke-width',      0.6)
    .attr('stroke-dasharray',  '2 8')
    .attr('opacity',           0.25);

  g.append('circle')
    .attr('class',   'orbit-ring-solid')
    .attr('r',       52)
    .attr('opacity', 0.12);

  g.append('circle').attr('class', 'root-inner').attr('r', 44);

  g.append('circle')
    .attr('r',            37)
    .attr('fill',         'none')
    .attr('stroke',       'var(--accent)')
    .attr('stroke-width', 0.5)
    .attr('opacity',      0.3);

  // multi-line label
  const lines = DATA.name.split('\n');
  lines.forEach((ln, i) => {
    g.append('text')
      .attr('class', 'root-label')
      .attr('y',     (i - (lines.length - 1) / 2) * 13)
      .text(ln);
  });
}

// ─────────────────────────────────────────────────────────────────
// renderL1 — category pill with open/closed indicator dot
// ─────────────────────────────────────────────────────────────────
function renderL1(g, d) {
  const open = !!d.children;

  g.append('rect')
    .attr('class',  'pill-bg' + (open ? '' : ' closed'))
    .attr('x',      -L1W / 2)
    .attr('y',      -L1H / 2)
    .attr('width',   L1W)
    .attr('height',  L1H)
    .attr('rx',      6)
    .attr('ry',      6);

  // status dot: green = open, cyan = closed
  g.append('circle')
    .attr('class', 'pill-dot' + (open ? '' : ' closed'))
    .attr('cx',    L1W / 2 - 8)
    .attr('cy',    0)
    .attr('r',     3);

  g.append('text').attr('class', 'pill-label').text(d.data.name);
}

// ─────────────────────────────────────────────────────────────────
// renderL2 — sub-group box, width fitted to label.
// At depth 3 the box shrinks slightly for visual hierarchy.
// ─────────────────────────────────────────────────────────────────
function renderL2(g, d) {
  const name   = d.data.name;
  // Box gets smaller the deeper it is
  const scale  = d.depth === 2 ? 1 : 0.82;
  const h      = L2H * scale;
  const w      = Math.max(46, name.length * 5.2 * scale + 14);

  g.append('rect')
    .attr('class',  'box-bg')
    .attr('x',      -w / 2)
    .attr('y',      -h / 2)
    .attr('width',   w)
    .attr('height',  h)
    .attr('rx',      4)
    .attr('ry',      4)
    .style('opacity', d.depth === 2 ? 1 : 0.75);

  g.append('text')
    .attr('class',    'box-label')
    .style('font-size', `${8 * scale}px`)
    .text(name);
}

// ─────────────────────────────────────────────────────────────────
// renderDeepBranch — for branch nodes at depth 4 and beyond.
// Rendered as a small labelled circle that can still be clicked
// to expand. Shrinks progressively with depth.
// ─────────────────────────────────────────────────────────────────
function renderDeepBranch(g, d) {
  // Radius shrinks from 5px at depth 4 down to 3px at depth 10
  const r      = Math.max(3, 6 - (d.depth - 3) * 0.4);
  const open   = !!d.children;
  const col    = open ? 'var(--accent2)' : 'var(--accent)';

  g.append('circle')
    .attr('r',            r)
    .attr('fill',         'var(--panel)')
    .attr('stroke',       col)
    .attr('stroke-width', 1.2);

  // Tiny centre dot to indicate collapsed state
  if (!open) {
    g.append('circle').attr('r', r * 0.35).attr('fill', col);
  }

  // Label — same flip logic as leaf
  const angleDeg = ((d.x * 180 / Math.PI) + 360) % 360;
  const leftSide = angleDeg > 90 && angleDeg < 270;
  const fontSize = Math.max(6.5, 8 - (d.depth - 3) * 0.3);

  g.append('text')
    .attr('x',                 leftSide ? -(r + 5) : (r + 5))
    .attr('y',                 0)
    .attr('text-anchor',       leftSide ? 'end' : 'start')
    .attr('dominant-baseline', 'central')
    .attr('fill',              col)
    .style('font-size',        `${fontSize}px`)
    .style('pointer-events',   'none')
    .text(d.data.name);
}

// ─────────────────────────────────────────────────────────────────
// renderLeaf — small dot + label, flipped for left-side nodes
// ─────────────────────────────────────────────────────────────────
function renderLeaf(g, d) {
  const angleDeg = ((d.x * 180 / Math.PI) + 360) % 360;
  const leftSide = angleDeg > 90 && angleDeg < 270;
  const tx       = leftSide ? -9  : 9;
  const anchor   = leftSide ? 'end' : 'start';
  const col      = d.data.type ? TYPE_COLOR[d.data.type] : 'var(--accent2)';

  g.append('circle').attr('class', 'leaf-dot').attr('r', LEAF_R);

  g.append('text')
    .attr('class',              'leaf-label')
    .attr('x',                  tx)
    .attr('y',                  0)
    .attr('text-anchor',        anchor)
    .attr('dominant-baseline',  'central')
    .attr('fill',               col)
    .text(d.data.name + (d.data.type ? ` (${d.data.type})` : ''));
}
