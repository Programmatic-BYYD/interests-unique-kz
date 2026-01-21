// calc.js
let BASE = 0;

const AGE_GROUP_MAP = {
  "0-4": ["0–4 года"],
  "5-12": ["5–12 лет"],
  "13-17": ["13–17 лет"],
  "18-24": ["18–24 года"],
  "25-34": ["25–34 года"],
  "35-44": ["35–44 года"],
  "45-54": ["45–54 года"],
  "55-64": ["55–64 года"],
  "65+": ["65+ лет"],
  "ALL": [
    "0–4 года",
    "5–12 лет",
    "13–17 лет",
    "18–24 года",
    "25–34 года",
    "35–44 года",
    "45–54 года",
    "55–64 года",
    "65+ лет"
  ]
};

const GENDER_MAP = {
  "М": ["М", "male", "Мужчины"],
  "Ж": ["Ж", "female", "Женщины"]
};

// const COEF = {
//   Broad: 1.0,
//   Medium: 0.875,
//   Narrow: 0.6,
//   "Very Narrow": 0.3
// };

function calculateBaseFromCity(region, gender, ageGroupKey) {
  const capacity = region.capacity;
  if (!capacity) return 0;

  // Если запрашиваем М или Ж, ищем соответствующий ключ в данных
  const possibleGenderKeys = GENDER_MAP[gender] || [];
  const genderKey = possibleGenderKeys.find(k => capacity[k]);

  if (!genderKey) return 0;

  const genderData = capacity[genderKey];
  const groups = ageGroupKey && AGE_GROUP_MAP[ageGroupKey] ? AGE_GROUP_MAP[ageGroupKey] : AGE_GROUP_MAP.ALL;

  return groups.reduce((sum, group) => sum + (genderData[group] || 0), 0);
}

function calculateBase() {
  const selectedRegions = window.getSelectedRegions ? window.getSelectedRegions() : [];

  if (!selectedRegions.length) {
    alert("Добавьте хотя бы один город или регион");
    return;
  }

  const gender = document.getElementById("genderSelect").value;
  const ageGroupValue = document.getElementById("ageGroup")?.value || "";
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  let totalSum = 0;

  selectedRegions.forEach(regionName => {
    const region = cityData.find(c => c.name === regionName);
    if (!region) return;

    let regionSum = 0;

    if (gender === "М/Ж") {
      // Суммируем М и Ж отдельно для надежности
      regionSum += calculateBaseFromCity(region, "М", ageGroupValue);
      regionSum += calculateBaseFromCity(region, "Ж", ageGroupValue);
    } else {
      regionSum = calculateBaseFromCity(region, gender, ageGroupValue);
    }

    totalSum += regionSum;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${region.name}</td>
      <td>—</td>
      <td>—</td>
      <td>${gender}</td>
      <td>${ageGroupValue || "Любой"}</td>
      <td>${regionSum.toLocaleString("ru-RU")}</td>
    `;
    tableBody.appendChild(tr);
  });

  BASE = totalSum;
  document.getElementById("baseReach").innerText = BASE.toLocaleString("ru-RU");
  document.getElementById("finalReach").innerText = BASE.toLocaleString("ru-RU");
  document.getElementById("coef").innerText = "1.00";
  document.getElementById("deltaReach").innerText = "0%";
  document.getElementById("citiesCount").innerText = selectedRegions.length;

  document.getElementById("detailsAccordion").classList.add("open");
  document.getElementById("tableWrapper").style.display = "block";
  document.getElementById("detailsSubtitle").innerText = "Скрыть список";
}

function calculateWithInterests() {
  if (!BASE || BASE === 0) {
    alert("Сначала рассчитайте базовый охват");
    return;
  }

  const selectedInterestsIds = window.getSelectedInterests ? window.getSelectedInterests() : [];
  if (selectedInterestsIds.length === 0) {
    document.getElementById("finalReach").innerText = BASE.toLocaleString("ru-RU");
    document.getElementById("coef").innerText = "1.00";
    document.getElementById("deltaReach").innerText = "0%";
    return;
  }

  const coefs = selectedInterestsIds.map(id => {
    const interest = interestsData.find(i => i.id === id);
    // Используем COEF из data.js
    return interest ? (COEF[interest.status] || 1) : 1; 
  });

  const finalCoef = Math.min(...coefs);
  const finalReach = Math.round(BASE * finalCoef);
  const deltaPercent = ((1 - finalCoef) * 100).toFixed(1);

  document.getElementById("finalReach").innerText = finalReach.toLocaleString("ru-RU");
  document.getElementById("coef").innerText = finalCoef.toFixed(3);
  document.getElementById("deltaReach").innerText = `${deltaPercent}%`;
}

// Привязка событий
document.getElementById("calcBtn").addEventListener("click", calculateBase);
document.getElementById("calcWithInterestsBtn").addEventListener("click", calculateWithInterests);
document.getElementById("resetBtn").addEventListener("click", () => location.reload());

// Аккордеоны
document.getElementById("tableToggle").addEventListener("click", () => {
  const acc = document.getElementById("detailsAccordion");
  const wrapper = document.getElementById("tableWrapper");
  const isOpen = acc.classList.contains("open");
  acc.classList.toggle("open");
  wrapper.style.display = isOpen ? "none" : "block";
  document.getElementById("detailsSubtitle").innerText = isOpen ? "Раскрыть список" : "Скрыть список";
});

document.getElementById("interestsToggle").addEventListener("click", () => {
  const acc = document.getElementById("interestsAccordion");
  const body = document.getElementById("interestsBody");
  const isOpen = acc.classList.contains("open");
  acc.classList.toggle("open");
  body.style.display = isOpen ? "none" : "block";
});