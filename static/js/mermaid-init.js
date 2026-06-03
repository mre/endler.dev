// Renders Mermaid diagrams and keeps them in sync with the site's
// light/dark theme toggle (driven by the `data-theme` attribute on <html>).
//
// Mermaid replaces the original <pre class="mermaid"> source with an SVG once
// it has rendered, so we stash the source in `data-source` to be able to
// re-render with a different theme when the user flips the toggle.
(function () {
  let rendering = false;
  let rerenderQueued = false;
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Single ink color for the whole diagram, following the light/dark theme.
  function ink() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "#e6e6e6"
      : "#1a1a1a";
  }

  function createSvgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    for (const key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  // Hand-drawn "squiggle": a turbulence-driven displacement filter applied to
  // the box and line strokes (not the text labels). The filter is injected
  // into each diagram's *own* <svg> with a unique id and referenced via a
  // presentation attribute, because Safari refuses to resolve a CSS
  // `filter: url(#id)` that points at a filter defined in a different (or
  // zero-sized) <svg> element — the shapes would simply vanish.
  function applySquiggle() {
    document.querySelectorAll(".mermaid svg").forEach((svg, index) => {
      const id = "squiggle-" + index;

      let defs = svg.querySelector("defs");
      if (!defs) {
        defs = createSvgEl("defs", {});
        svg.insertBefore(defs, svg.firstChild);
      }

      if (!svg.querySelector("#" + id)) {
        // `objectBoundingBox` units (the default) size the filter region
        // relative to *each* element's own bounding box. Mermaid gives every
        // node its own translated coordinate system (the box is centred on
        // the local origin), so a single `userSpaceOnUse` region can't fit
        // them all — it clips one side of every box. A generous bbox-relative
        // margin leaves room for the displacement, and the per-element
        // buffers stay small enough for Safari. `primitiveUnits` keeps the
        // noise frequency in user space so the wobble looks the same on every
        // box regardless of its size.
        const filter = createSvgEl("filter", {
          id,
          x: "-50%",
          y: "-50%",
          width: "200%",
          height: "200%",
          primitiveUnits: "userSpaceOnUse",
        });
        filter.appendChild(
          createSvgEl("feTurbulence", {
            type: "fractalNoise",
            baseFrequency: "0.03",
            numOctaves: "2",
            seed: "7",
            result: "noise",
          }),
        );
        filter.appendChild(
          createSvgEl("feDisplacementMap", {
            in: "SourceGraphic",
            in2: "noise",
            scale: "6",
            xChannelSelector: "R",
            yChannelSelector: "G",
          }),
        );
        defs.appendChild(filter);
      }

      svg
        .querySelectorAll(".nodes path, .edgePaths path")
        .forEach((shape) => shape.setAttribute("filter", "url(#" + id + ")"));
    });
  }

  async function render() {
    if (!window.mermaid) return;

    const nodes = document.querySelectorAll(".mermaid");
    if (!nodes.length) return;

    // Avoid overlapping runs if the theme is toggled rapidly.
    if (rendering) {
      rerenderQueued = true;
      return;
    }
    rendering = true;

    nodes.forEach((node) => {
      if (node.getAttribute("data-source") === null) {
        // First render: remember the original diagram source.
        node.setAttribute("data-source", node.textContent);
      } else {
        // Re-render: restore source and let Mermaid process it again.
        node.textContent = node.getAttribute("data-source");
        node.removeAttribute("data-processed");
      }
    });

    // Black-and-white, xkcd-style look: sketchy rough.js strokes, the xkcd
    // handwriting font, no fills, and a single ink color that follows the
    // light/dark theme.
    const inkColor = ink();
    const fontFamily =
      '"xkcd", "Comic Sans MS", "Segoe Print", cursive, sans-serif';

    // Initialize with `startOnLoad: false` *before* any `await` below, so
    // Mermaid's own auto-render can't fire on DOMContentLoaded and paint the
    // default theme while we're waiting on fonts.
    window.mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      look: "handDrawn",
      handDrawnSeed: 1,
      fontFamily,
      themeVariables: {
        fontFamily,
        // Transparent fills everywhere: no background boxes.
        background: "transparent",
        mainBkg: "transparent",
        secondaryColor: "transparent",
        tertiaryColor: "transparent",
        clusterBkg: "transparent",
        noteBkgColor: "transparent",
        edgeLabelBackground: "transparent",
        // Everything else is drawn in a single ink color.
        primaryColor: "transparent",
        primaryTextColor: inkColor,
        primaryBorderColor: inkColor,
        nodeBorder: inkColor,
        arrowheadColor: inkColor,
        secondaryBorderColor: inkColor,
        tertiaryBorderColor: inkColor,
        // No frame boxes around subgraphs.
        clusterBorder: "transparent",
        noteBorderColor: inkColor,
        noteTextColor: inkColor,
        lineColor: inkColor,
        textColor: inkColor,
        titleColor: inkColor,
      },
    });

    // The hand-drawn look measures text in the "xkcd" font to size nodes, so
    // wait for it to load to avoid clipped or overflowing labels.
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load('1em "xkcd"');
        await document.fonts.ready;
      } catch (_) {
        // Font loading is best-effort; fall back to whatever is available.
      }
    }

    try {
      await window.mermaid.run({
        nodes: document.querySelectorAll(".mermaid"),
      });
      applySquiggle();
    } finally {
      rendering = false;
      if (rerenderQueued) {
        rerenderQueued = false;
        render();
      }
    }
  }

  function init() {
    render();

    // Re-render whenever the theme changes.
    new MutationObserver((mutations) => {
      if (mutations.some((m) => m.attributeName === "data-theme")) {
        render();
      }
    }).observe(document.documentElement, { attributes: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
