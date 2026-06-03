// Renders Mermaid diagrams and keeps them in sync with the site's
// light/dark theme toggle (driven by the `data-theme` attribute on <html>).
//
// Mermaid replaces the original <pre class="mermaid"> source with an SVG once
// it has rendered, so we stash the source in `data-source` to be able to
// re-render with a different theme when the user flips the toggle.
(function () {
  let rendering = false;
  let rerenderQueued = false;

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "default";
  }

  // Hand-drawn "squiggle": a turbulence-driven displacement filter applied to
  // the box and line strokes (not the text labels). The filter is injected
  // into each diagram's *own* <svg> with a unique id and referenced via a
  // presentation attribute, because Safari refuses to resolve a CSS
  // `filter: url(#id)` that points at a filter defined in a different (or
  // zero-sized) <svg> element — the shapes would simply vanish.
  const SVG_NS = "http://www.w3.org/2000/svg";

  function applySquiggle() {
    document.querySelectorAll(".mermaid svg").forEach((svg, index) => {
      const id = "squiggle-" + index;

      let defs = svg.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS(SVG_NS, "defs");
        svg.insertBefore(defs, svg.firstChild);
      }

      if (!svg.querySelector("#" + id)) {
        // Use `objectBoundingBox` units (the default) so the filter region is
        // sized relative to *each* element's own bounding box. Mermaid gives
        // every node its own translated coordinate system (the box is centred
        // on the local origin), so a single `userSpaceOnUse` region can't fit
        // them all — it ends up clipping one side of every box. A generous
        // bbox-relative margin leaves room for the displacement, and the
        // per-element buffers stay small enough for Safari.
        const filter = document.createElementNS(SVG_NS, "filter");
        filter.setAttribute("id", id);
        filter.setAttribute("x", "-50%");
        filter.setAttribute("y", "-50%");
        filter.setAttribute("width", "200%");
        filter.setAttribute("height", "200%");
        // Keep the noise frequency in user space so the wobble looks the same
        // on every box regardless of its size.
        filter.setAttribute("primitiveUnits", "userSpaceOnUse");

        const turbulence = document.createElementNS(SVG_NS, "feTurbulence");
        turbulence.setAttribute("type", "fractalNoise");
        turbulence.setAttribute("baseFrequency", "0.03");
        turbulence.setAttribute("numOctaves", "2");
        turbulence.setAttribute("seed", "7");
        turbulence.setAttribute("result", "noise");

        const displace = document.createElementNS(SVG_NS, "feDisplacementMap");
        displace.setAttribute("in", "SourceGraphic");
        displace.setAttribute("in2", "noise");
        displace.setAttribute("scale", "6");
        displace.setAttribute("xChannelSelector", "R");
        displace.setAttribute("yChannelSelector", "G");

        filter.appendChild(turbulence);
        filter.appendChild(displace);
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
    const ink = currentTheme() === "dark" ? "#e6e6e6" : "#1a1a1a";
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
        primaryTextColor: ink,
        primaryBorderColor: ink,
        nodeBorder: ink,
        arrowheadColor: ink,
        secondaryBorderColor: ink,
        tertiaryBorderColor: ink,
        // No frame boxes around subgraphs.
        clusterBorder: "transparent",
        noteBorderColor: ink,
        noteTextColor: ink,
        lineColor: ink,
        textColor: ink,
        titleColor: ink,
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
