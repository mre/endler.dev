const WASM_PATH = "/tinysearch_engine.wasm";
const RESULT_LIMIT = 10;
const SEARCH_DELAY_MS = 100;
const WASM_PAGE_SIZE = 65_536;

class TinySearch {
  constructor(instance) {
    const { memory, search, free_search_result: freeSearchResult } =
      instance.exports;

    if (!memory || !search || !freeSearchResult) {
      throw new Error("TinySearch is missing required WebAssembly exports");
    }

    this.memory = memory;
    this.searchFunction = search;
    this.freeSearchResult = freeSearchResult;
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  search(query, limit = RESULT_LIMIT) {
    const queryBytes = this.encoder.encode(`${query}\0`);
    const pages = Math.max(1, Math.ceil(queryBytes.length / WASM_PAGE_SIZE));
    const queryPointer = this.memory.grow(pages) * WASM_PAGE_SIZE;
    new Uint8Array(this.memory.buffer, queryPointer, queryBytes.length).set(
      queryBytes,
    );

    const resultPointer = this.searchFunction(queryPointer, limit);
    if (resultPointer === 0) {
      return [];
    }

    try {
      const memory = new Uint8Array(this.memory.buffer);
      let end = resultPointer;
      while (end < memory.length && memory[end] !== 0) {
        end += 1;
      }

      return JSON.parse(
        this.decoder.decode(memory.subarray(resultPointer, end)),
      );
    } finally {
      this.freeSearchResult(resultPointer);
    }
  }
}

let enginePromise;

async function loadEngine() {
  if (!enginePromise) {
    enginePromise = (async () => {
      const response = await fetch(WASM_PATH);
      if (!response.ok) {
        throw new Error(`Could not load TinySearch (${response.status})`);
      }

      let instance;
      try {
        ({ instance } = await WebAssembly.instantiateStreaming(
          Promise.resolve(response.clone()),
        ));
      } catch {
        ({ instance } = await WebAssembly.instantiate(
          await response.arrayBuffer(),
        ));
      }

      return new TinySearch(instance);
    })();
  }

  return enginePromise;
}

function currentOriginUrl(value) {
  const url = new URL(value, window.location.href);
  return `${url.pathname}${url.search}${url.hash}`;
}

function initializeSearch(root) {
  const toggle = root.querySelector(".search-toggle");
  const panel = document.querySelector("[data-search-panel]");
  const form = panel.querySelector(".search-form");
  const input = panel.querySelector(".search-input");
  const pageContent = document.querySelector("[data-page-content]");
  const searchContent = document.querySelector("[data-search-content]");
  const status = searchContent.querySelector(".search-content-status");
  const results = searchContent.querySelector(".search-content-results");

  let activeIndex = -1;
  let recommendations = [];
  let requestId = 0;
  let searchTimer;

  function showSearchContent(show) {
    searchContent.hidden = !show;
    pageContent.hidden = show;
    input.setAttribute("aria-expanded", String(show));
  }

  function resetSearch() {
    clearTimeout(searchTimer);
    requestId += 1;
    activeIndex = -1;
    recommendations = [];
    input.value = "";
    input.removeAttribute("aria-activedescendant");
    results.replaceChildren();
    status.textContent = "";
    showSearchContent(false);
  }

  function setOpen(open, returnFocus = false) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-search-open", open);

    if (open) {
      loadEngine().catch(() => {});
      requestAnimationFrame(() => input.focus());
    } else {
      resetSearch();
      if (returnFocus) {
        toggle.focus();
      }
    }
  }

  function setActive(index) {
    const options = results.querySelectorAll("[role='option']");
    options.forEach((option) => {
      option.classList.remove("is-active");
      option.setAttribute("aria-selected", "false");
    });

    if (options.length === 0) {
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
      return;
    }

    activeIndex = (index + options.length) % options.length;
    const activeOption = options[activeIndex];
    activeOption.classList.add("is-active");
    activeOption.setAttribute("aria-selected", "true");
    input.setAttribute("aria-activedescendant", activeOption.id);
    activeOption.scrollIntoView({ block: "nearest" });
  }

  function renderRecommendations(query, items) {
    recommendations = items;
    activeIndex = -1;
    input.removeAttribute("aria-activedescendant");
    results.replaceChildren();

    if (items.length === 0) {
      status.textContent = `No articles found for “${query}”.`;
      return;
    }

    status.textContent = `${items.length} article${items.length === 1 ? "" : "s"} found for “${query}”.`;

    items.forEach((item, index) => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.id = `search-result-${index}`;
      link.href = item.url;
      link.textContent = item.title;
      link.setAttribute("role", "option");
      link.setAttribute("aria-selected", "false");
      listItem.append(link);
      results.append(listItem);
    });
  }

  async function updateRecommendations() {
    const query = input.value.trim();
    const currentRequest = ++requestId;

    if (!query) {
      activeIndex = -1;
      recommendations = [];
      input.removeAttribute("aria-activedescendant");
      results.replaceChildren();
      status.textContent = "";
      showSearchContent(false);
      return;
    }

    results.replaceChildren();
    status.textContent = "Searching…";
    showSearchContent(true);

    try {
      const engine = await loadEngine();
      const items = engine.search(query, RESULT_LIMIT).map((item) => ({
        ...item,
        url: currentOriginUrl(item.url),
      }));
      if (currentRequest === requestId) {
        renderRecommendations(query, items);
      }
    } catch (error) {
      console.error("TinySearch failed:", error);
      if (currentRequest === requestId) {
        recommendations = [];
        results.replaceChildren();
        status.textContent = "Search is temporarily unavailable.";
      }
    }
  }

  toggle.addEventListener("click", () => {
    setOpen(panel.hidden);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (recommendations.length > 0) {
      const index = activeIndex >= 0 ? activeIndex : 0;
      window.location.assign(recommendations[index].url);
    }
  });

  input.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(updateRecommendations, SEARCH_DELAY_MS);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(activeIndex - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false, true);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (
      !panel.hidden &&
      !root.contains(event.target) &&
      !panel.contains(event.target) &&
      !searchContent.contains(event.target)
    ) {
      setOpen(false);
    }
  });

}

document.querySelectorAll("[data-search]").forEach(initializeSearch);
