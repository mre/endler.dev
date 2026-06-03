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
