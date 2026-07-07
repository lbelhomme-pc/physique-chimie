import { onLabReady } from "./lab-utils.js";

onLabReady("[data-lab-index]", (root) => {
  const searchInput = root.querySelector("[data-lab-search]");
  const filters = Array.from(root.querySelectorAll("[data-lab-filter]"));
  const cards = Array.from(root.querySelectorAll("[data-lab-card]"));
  const clearButton = root.querySelector("[data-lab-clear]");
  const title = root.querySelector("[data-lab-results-title]");
  const count = root.querySelector("[data-lab-results-count]");
  const noResults = root.querySelector("[data-lab-no-results]");

  if (!searchInput || cards.length === 0) return;

  function selectedValues(type) {
    return filters
      .filter((input) => input.dataset.labFilter === type && input.checked)
      .map((input) => input.value);
  }

  function intersects(values, selected) {
    if (selected.length === 0) return true;
    return selected.some((value) => values.includes(value));
  }

  function update() {
    const query = searchInput.value.trim().toLocaleLowerCase("fr-FR");
    const selectedLevels = selectedValues("level");
    const selectedThemes = selectedValues("theme");
    const selectedTopics = selectedValues("topic");
    let visible = 0;

    cards.forEach((card) => {
      const searchText = card.dataset.search || "";
      const levels = (card.dataset.levels || "").split(/\s+/).filter(Boolean);
      const topics = (card.dataset.topics || "").split(/\s+/).filter(Boolean);
      const theme = card.dataset.theme || "";

      const matchesSearch = query === "" || searchText.includes(query);
      const matchesLevel = intersects(levels, selectedLevels);
      const matchesTheme = selectedThemes.length === 0 || selectedThemes.includes(theme);
      const matchesTopic = intersects(topics, selectedTopics);
      const isVisible = matchesSearch && matchesLevel && matchesTheme && matchesTopic;

      card.classList.toggle("is-hidden", !isVisible);
      if (isVisible) visible += 1;
    });

    const hasFilters =
      query !== "" || selectedLevels.length > 0 || selectedThemes.length > 0 || selectedTopics.length > 0;

    if (title) {
      title.textContent = hasFilters ? "Résultats filtrés" : "Toutes les simulations";
    }
    if (count) {
      count.textContent = `${visible} simulation${visible > 1 ? "s" : ""}`;
    }
    clearButton?.classList.toggle("is-hidden", !hasFilters);
    noResults?.classList.toggle("is-hidden", visible > 0);
  }

  searchInput.addEventListener("input", update);
  filters.forEach((input) => input.addEventListener("change", update));
  clearButton?.addEventListener("click", () => {
    searchInput.value = "";
    filters.forEach((input) => {
      input.checked = false;
    });
    update();
    searchInput.focus();
  });

  update();
});
