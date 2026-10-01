import { onLabReady } from "./lab-utils.js";

onLabReady("[data-lab-index]", (root) => {
  const searchInput = root.querySelector("[data-lab-search]");
  const filters = Array.from(root.querySelectorAll("[data-lab-filter]"));
  const cards = Array.from(root.querySelectorAll("[data-lab-card]"));
  const clearButton = root.querySelector("[data-lab-clear]");
  const title = root.querySelector("[data-lab-results-title]");
  const count = root.querySelector("[data-lab-results-count]");
  const noResults = root.querySelector("[data-lab-no-results]");
  const activeFilters = root.querySelector("[data-lab-active-filters]");
  const filterPanel = root.querySelector("[data-lab-filter-panel]");
  const filterToggle = root.querySelector("[data-lab-filter-toggle]");
  const filterClose = root.querySelector("[data-lab-filter-close]");
  const filterCount = root.querySelector("[data-lab-filter-count]");

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
    const selectedInputs = filters.filter((input) => input.checked);
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

    if (filterCount) {
      filterCount.textContent = String(selectedInputs.length);
    }

    if (filterToggle) {
      filterToggle.setAttribute(
        "aria-label",
        selectedInputs.length
          ? `Ouvrir les filtres, ${selectedInputs.length} actif${selectedInputs.length > 1 ? "s" : ""}`
          : "Ouvrir les filtres"
      );
    }

    if (activeFilters) {
      activeFilters.replaceChildren();
      selectedInputs.forEach((input) => {
        const label = input.closest("label")?.textContent?.trim() || input.value;
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "lab-active-filter";
        chip.textContent = `${label} ×`;
        chip.setAttribute("aria-label", `Retirer le filtre ${label}`);
        chip.addEventListener("click", () => {
          input.checked = false;
          update();
        });
        activeFilters.appendChild(chip);
      });

      if (query) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "lab-active-filter";
        chip.textContent = `Recherche : ${searchInput.value.trim()} ×`;
        chip.setAttribute("aria-label", "Effacer la recherche");
        chip.addEventListener("click", () => {
          searchInput.value = "";
          update();
          searchInput.focus();
        });
        activeFilters.appendChild(chip);
      }

      activeFilters.classList.toggle("is-empty", activeFilters.childElementCount === 0);
    }
  }

  searchInput.addEventListener("input", update);
  filters.forEach((input) => input.addEventListener("change", update));

  function closeFilterPanel() {
    root.removeAttribute("data-lab-filters-open");
    filterToggle?.setAttribute("aria-expanded", "false");
  }

  filterToggle?.addEventListener("click", () => {
    const open = root.getAttribute("data-lab-filters-open") === "true";
    if (open) {
      closeFilterPanel();
    } else {
      root.setAttribute("data-lab-filters-open", "true");
      filterToggle.setAttribute("aria-expanded", "true");
      filterPanel?.querySelector("input")?.focus();
    }
  });

  filterClose?.addEventListener("click", () => {
    closeFilterPanel();
    filterToggle?.focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.getAttribute("data-lab-filters-open") === "true") {
      closeFilterPanel();
      filterToggle?.focus();
    }
  });
  clearButton?.addEventListener("click", () => {
    searchInput.value = "";
    filters.forEach((input) => {
      input.checked = false;
    });
    update();
    closeFilterPanel();
    searchInput.focus();
  });

  update();
});
