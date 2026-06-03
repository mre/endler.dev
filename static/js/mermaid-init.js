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

        window.mermaid.initialize({
            startOnLoad: false,
            theme: currentTheme(),
        });

        try {
            await window.mermaid.run({ nodes: document.querySelectorAll(".mermaid") });
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
