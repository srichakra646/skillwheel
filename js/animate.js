/* ═══════════════════════════════════════════════════
   animate.js
   Owns the requestAnimationFrame float loop that makes
   L1 category nodes drift organically.

   HOW IT WORKS
   ─────────────
   Each L1 node gets a unique random _floatPhase seeded
   in main.js. Every frame, the phase advances by
   FLOAT_SPEED * dt and _floatDelta is computed as a
   weighted sum of two sine waves at different frequencies.
   This produces smooth, non-repeating organic motion.

   nodeXY() (layout.js) reads _floatDelta and adds it to
   the base angle, so every node in the branch inherits
   the drift — links stay attached for free.

   The loop surgically patches only the affected DOM
   attributes (transform, d) — never calls redraw().
═══════════════════════════════════════════════════ */

// ── tuning constants ──────────────────────────────
/** Maximum angular wobble in radians (~2.7°) */
const FLOAT_AMP   = 0.048;

/** Phase advance per millisecond */
const FLOAT_SPEED = 0.00035;
// ─────────────────────────────────────────────────

let animFrame = null;

/**
 * Start the float loop. Safe to call multiple times —
 * exits immediately if a loop is already running.
 */
function startFloatLoop() {
  if (animFrame !== null) return;

  let last = performance.now();

  function tick(now) {
    const dt = Math.min(now - last, 64); // clamp for tab-switch spikes
    last = now;

    // ── 1. Advance each L1 node's phase and delta ────────────
    const l1s = hierRoot.children || [];

    l1s.forEach(d => {
      d._floatPhase += FLOAT_SPEED * dt;

      // Two overlapping sines → organic, non-repeating drift
      d._floatDelta = FLOAT_AMP * (
        Math.sin(d._floatPhase)               * 0.65 +
        Math.sin(d._floatPhase * 2.7 + 1.3)  * 0.35
      );
    });

    // ── 2. Patch node transforms ─────────────────────────────
    hierRoot.descendants().forEach(d => {
      if (d.depth === 0) return; // root stays fixed

      const { x, y } = nodeXY(d);
      const el = document.getElementById(`n-${d._uid}`);
      if (el) el.setAttribute('transform', `translate(${x},${y})`);
    });

    // ── 3. Patch link paths ───────────────────────────────────
    hierRoot.links().forEach(lk => {
      const s  = lk.source, t = lk.target;
      const sp = nodeXY(s),  tp = nodeXY(t);
      const blend = 0.45;
      const mx = (sp.x + tp.x) * blend;
      const my = (sp.y + tp.y) * blend;
      const el = document.getElementById(`lk-${s._uid}-${t._uid}`);
      if (el) el.setAttribute('d', `M${sp.x},${sp.y} Q${mx},${my} ${tp.x},${tp.y}`);
    });

    animFrame = requestAnimationFrame(tick);
  }

  animFrame = requestAnimationFrame(tick);
}

/**
 * Stop the float loop. Called by redraw() before clearing
 * the SVG so stale element IDs are not targeted mid-frame.
 */
function stopFloatLoop() {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}
