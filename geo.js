// geo.js
// ==============================
// GEO INPUT + AUTOCOMPLETE + NORMALIZATION
// ==============================

const cityInput = document.getElementById("cityInput");
const citySuggestions = document.getElementById("citySuggestions");
const selectedCitiesContainer = document.getElementById("selectedCities");
// const addMillionBtn = document.getElementById("addMillionCities");

// ==============================
// DATA
// ==============================

const geoNames = cityData.map(item => item.name);
let selectedRegions = [];

// алиасы / сокращения
const GEO_ALIASES = {
  "КЗ": "Казахстан",
  "Алмата": "Алматы",
};

// ==============================
// HELPERS
// ==============================

function normalizeInput(value) {
  return value
    .toLowerCase()
    .replace(/[^а-яa-z\s-]/gi, "")
    .trim();
}

function resolveGeoName(input) {
  const normalized = normalizeInput(input);

  // алиасы
  if (GEO_ALIASES[normalized]) {
    return GEO_ALIASES[normalized];
  }

  // точное совпадение
  const exact = geoNames.find(
    name => name.toLowerCase() === normalized
  );
  if (exact) return exact;

  // частичное совпадение
  const partial = geoNames.find(
    name => name.toLowerCase().includes(normalized)
  );

  return partial || null;
}

function addToSelected(cityName) {
  if (!selectedRegions.includes(cityName)) {
    selectedRegions.push(cityName);
  }
}

function hideSuggestions() {
  citySuggestions.style.display = "none";
  citySuggestions.innerHTML = "";
}

// ==============================
// RENDER CHIPS
// ==============================

function renderSelectedCities() {
  selectedCitiesContainer.innerHTML = "";

  selectedRegions.forEach(name => {
    const chip = document.createElement("div");
    chip.className = "city-chip";
    chip.innerHTML = `
      ${name}
      <span>×</span>
    `;

    chip.querySelector("span").onclick = () => {
      selectedRegions = selectedRegions.filter(c => c !== name);
      renderSelectedCities();
    };

    selectedCitiesContainer.appendChild(chip);
  });
}

// ==============================
// ADD CITY (FROM INPUT / CLICK)
// ==============================

function addCityFromString(value) {
  const parts = value.split(",").map(v => v.trim()).filter(Boolean);

  parts.forEach(part => {
    const resolved = resolveGeoName(part);
    if (resolved) {
      addToSelected(resolved);
    }
  });

  renderSelectedCities();
  hideSuggestions();
  cityInput.value = "";
}

// ==============================
// INPUT EVENTS
// ==============================

cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addCityFromString(cityInput.value);
  }
});

cityInput.addEventListener("blur", () => {
  hideSuggestions();
});

cityInput.addEventListener("input", () => {
  const query = normalizeInput(
    cityInput.value.split(",").pop()
  );

  citySuggestions.innerHTML = "";

  if (!query) {
    hideSuggestions();
    return;
  }

  const matches = geoNames
    .filter(name => name.toLowerCase().includes(query))
    .slice(0, 10);

  if (!matches.length) {
    hideSuggestions();
    return;
  }

  matches.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("mousedown", e => {
  e.preventDefault(); // ⬅️ блокирует blur

  addToSelected(name);
  renderSelectedCities();
  hideSuggestions();
  cityInput.value = "";
});

    citySuggestions.appendChild(li);
  });

  citySuggestions.style.display = "block";
});

// ==============================
// MILLION CITIES BUTTON
// ==============================

// if (addMillionBtn) {
//   addMillionBtn.addEventListener("click", () => {
//     if (typeof millionCities === "undefined") return;

//     millionCities.forEach(city => {
//       if (geoNames.includes(city)) {
//         addToSelected(city);
//       }
//     });

//     renderSelectedCities();
//     hideSuggestions();
//     cityInput.value = "";
//   });
// }

// ==============================
// API FOR calc.js
// ==============================

window.getSelectedRegions = () => [...selectedRegions];

// ==============================
// GEO PRESETS (STUB)
// ==============================

document.querySelectorAll(".geo-preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const preset = btn.dataset.preset;

    console.log(`Гео-пресет выбран: ${preset}`);

    // TODO:
    // regions  → все регионы РФ
    // million  → города-миллионники
    // 500      → города 500k+
    // 100      → города 100k+

    // Пока заглушка — ничего не добавляем
  });
});
