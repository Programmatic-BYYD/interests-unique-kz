// ==============================
// DOM
// ==============================
const interestsContainer = document.getElementById("interestsContainer");
const searchInput = document.getElementById("interestsSearch");
const selectedBox = document.getElementById("selectedInterests");
const selectedCount = document.getElementById("selectedCount");
const clearSelectedBtn = document.getElementById("clearSelected");
const copySelectedBtn = document.getElementById("copySelected");
const clearSearchBtn = document.getElementById("clearInterests");

// ==============================
// STATE
// ==============================
const selected = new Set();

// ==============================
// GROUP BY CATEGORY
// ==============================
const grouped = interestsData.reduce((acc, i) => {
  if (!acc[i.category]) acc[i.category] = [];
  acc[i.category].push(i);
  return acc;
}, {});

// ==============================
// RENDER INTERESTS
// ==============================
function render(filter = "") {
  interestsContainer.innerHTML = "";

  Object.entries(grouped).forEach(([category, items]) => {
    const categoryMatch = category.toLowerCase().includes(filter);

    const matchedItems = items.filter(i =>
      i.name.toLowerCase().includes(filter)
    );

    // если не совпала ни категория, ни интересы — не рендерим
    if (!categoryMatch && !matchedItems.length) return;

    const visibleItems = categoryMatch ? items : matchedItems;

    const cat = document.createElement("div");
    cat.className = "interests-category open";

    // ===== CATEGORY HEADER =====
    const header = document.createElement("div");
    header.className = "interests-category-header";

    const catCheckbox = document.createElement("input");
    catCheckbox.type = "checkbox";
    catCheckbox.checked =
      visibleItems.length &&
      visibleItems.every(i => selected.has(i.id));

    catCheckbox.onchange = () => {
      visibleItems.forEach(i =>
        catCheckbox.checked
          ? selected.add(i.id)
          : selected.delete(i.id)
      );
      updateSelected();
      render(filter);
    };

    header.appendChild(catCheckbox);
    header.append(` Категория: ${category}`);

    // ===== ITEMS =====
    const list = document.createElement("div");
    list.className = "interests-items";

    visibleItems.forEach(i => {
      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selected.has(i.id);

      checkbox.onchange = () => {
        checkbox.checked
          ? selected.add(i.id)
          : selected.delete(i.id);
        updateSelected();
      };

      label.appendChild(checkbox);
      label.append(` ${i.name}`);
      list.appendChild(label);
    });

    cat.appendChild(header);
    cat.appendChild(list);
    interestsContainer.appendChild(cat);
  });
}

// ==============================
// SELECTED PANEL (CHIPS)
// ==============================
function updateSelected() {
  selectedBox.innerHTML = "";

  selected.forEach(id => {
    const interest = interestsData.find(i => i.id === id);
    if (!interest) return;

    const chip = document.createElement("div");
    chip.className = "chip"; // визуал НЕ меняем
    chip.innerHTML = `${interest.name} <span>×</span>`;

    chip.querySelector("span").onclick = () => {
      selected.delete(id);
      updateSelected();
      render(searchInput.value.toLowerCase());
    };

    selectedBox.appendChild(chip);
  });

  selectedCount.textContent = selected.size;
}

// ==============================
// SEARCH
// ==============================
searchInput.addEventListener("input", e => {
  render(e.target.value.toLowerCase());
});

// ==============================
// CLEAR SEARCH
// ==============================
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  render();
});

// ==============================
// ACTIONS
// ==============================

// Очистить выбранные
clearSelectedBtn.addEventListener("click", () => {
  selected.clear();

  document
    .querySelectorAll('.interests-items input[type="checkbox"]')
    .forEach(cb => (cb.checked = false));

  updateSelected();
  render(searchInput.value.toLowerCase());
});

// Скопировать — ЧИСТЫЙ СПИСОК ДЛЯ EXCEL
copySelectedBtn.addEventListener("click", () => {
  if (!selected.size) return;

  const text = [...selected]
    .map(id => {
      const item = interestsData.find(i => i.id === id);
      return item ? item.name : "";
    })
    .filter(Boolean)
    .join("\n"); // перенос строки — идеально для Excel

  navigator.clipboard.writeText(text).catch(err => {
    console.error("Ошибка копирования", err);
  });
});

// ==============================
// INIT
// ==============================
render();
updateSelected();

window.getSelectedInterests = () => {
  return Array.from(selected);
};