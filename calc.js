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

function calculateBaseFromCity(region, gender, ageGroupKey) {
  const capacity = region.capacity;
  if (!capacity) return 0;

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
  
  // Получаем все выбранные чекбоксы возраста
  const ageCheckboxes = document.querySelectorAll('#ageGroupContainer input:checked');
  const selectedAgeKeys = Array.from(ageCheckboxes).map(cb => cb.value);

  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  let totalSum = 0;

  selectedRegions.forEach(regionName => {
    const region = cityData.find(c => c.name === regionName);
    if (!region) return;

    let regionSum = 0;

    // Если группы выбраны — считаем их сумму, если нет — считаем "ALL"
    const ageKeysToCalculate = selectedAgeKeys.length > 0 ? selectedAgeKeys : ["ALL"];

    ageKeysToCalculate.forEach(ageKey => {
      if (gender === "М/Ж") {
        regionSum += calculateBaseFromCity(region, "М", ageKey);
        regionSum += calculateBaseFromCity(region, "Ж", ageKey);
      } else {
        regionSum += calculateBaseFromCity(region, gender, ageKey);
      }
    });

    totalSum += regionSum;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${region.name}</td>
      <td>—</td>
      <td>—</td>
      <td>${gender}</td>
      <td>${selectedAgeKeys.length > 0 ? selectedAgeKeys.join(', ') : "Любой"}</td>
      <td>${regionSum.toLocaleString("ru-RU")}</td>
    `;
    tableBody.appendChild(tr);
  });

  BASE = totalSum;

  // Обновление дашборда результатов
  document.getElementById("baseReach").innerText = BASE.toLocaleString("ru-RU");
  document.getElementById("finalReach").innerText = BASE.toLocaleString("ru-RU");
  document.getElementById("coef").innerText = "1.00";
  document.getElementById("deltaReach").innerText = "0%";
  document.getElementById("citiesCount").innerText = selectedRegions.length;

  // Авто-открытие таблицы деталей
  const accordion = document.getElementById("detailsAccordion");
  const tableWrapper = document.getElementById("tableWrapper");
  const subtitle = document.getElementById("detailsSubtitle");

  accordion.classList.add("open");
  tableWrapper.style.display = "block";
  subtitle.innerText = "Скрыть список";
}

function calculateWithInterests() {
  if (!BASE) {
    alert("Сначала рассчитайте базовый охват");
    return;
  }

  const selectedInterests = window.getSelectedInterests ? window.getSelectedInterests() : [];

  if (!selectedInterests.length) {
    document.getElementById("finalReach").innerText = BASE.toLocaleString("ru-RU");
    document.getElementById("coef").innerText = "1.00";
    document.getElementById("deltaReach").innerText = "0%";
    return;
  }

  const coefs = selectedInterests
    .map(id => {
      const interest = interestsData.find(i => i.id === id);
      return interest ? COEF[interest.status] : null;
    })
    .filter(Boolean);

  if (!coefs.length) return;

  const finalCoef = Math.min(...coefs);
  const finalReach = Math.round(BASE * finalCoef);
  const deltaPercent = ((BASE - finalReach) / BASE * 100).toFixed(1);

  document.getElementById("finalReach").innerText = finalReach.toLocaleString("ru-RU");
  document.getElementById("coef").innerText = finalCoef.toFixed(2);
  document.getElementById("deltaReach").innerText = `${deltaPercent}%`;
}

// Привязка событий
document.getElementById("calcBtn").addEventListener("click", calculateBase);
document.getElementById("calcWithInterestsBtn").addEventListener("click", calculateWithInterests);
document.getElementById("resetBtn").addEventListener("click", () => location.reload());

// Управление аккордеонами
document.getElementById("tableToggle").addEventListener("click", () => {
  const detailsAccordion = document.getElementById("detailsAccordion");
  const tableWrapper = document.getElementById("tableWrapper");
  const subtitle = document.getElementById("detailsSubtitle");
  const isOpen = detailsAccordion.classList.contains("open");
  
  detailsAccordion.classList.toggle("open");
  tableWrapper.style.display = isOpen ? "none" : "block";
  subtitle.innerText = isOpen ? "Раскрыть список" : "Скрыть список";
});

document.getElementById("interestsToggle").addEventListener("click", () => {
  const interestsAccordion = document.getElementById("interestsAccordion");
  const interestsBody = document.getElementById("interestsBody");
  const isOpen = interestsAccordion.classList.contains("open");
  
  interestsAccordion.classList.toggle("open");
  interestsBody.style.display = isOpen ? "none" : "block";
});

// Логика работы выпадающего списка возраста
document.addEventListener('DOMContentLoaded', () => {
  const ageHeader = document.getElementById('ageHeader');
  const ageDropdown = document.getElementById('ageDropdown');
  const selectedText = ageHeader.querySelector('.selected-text');
  const checkboxes = document.querySelectorAll('#ageGroupContainer input[type="checkbox"]');

  // Открытие/закрытие по клику
  ageHeader.addEventListener('click', (e) => {
    e.stopPropagation();
    ageDropdown.classList.toggle('open');
  });

  // Закрытие при клике вне списка
  document.addEventListener('click', (e) => {
    if (!document.getElementById('ageMultiselect').contains(e.target)) {
      ageDropdown.classList.remove('open');
    }
  });

  // Обновление заголовка при выборе
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = Array.from(checkboxes).filter(c => c.checked);
      if (checked.length === 0) {
        selectedText.textContent = "Любой";
      } else if (checked.length === checkboxes.length) {
        selectedText.textContent = "Все возрасты";
      } else if (checked.length > 2) {
        selectedText.textContent = `Выбрано: ${checked.length}`;
      } else {
        selectedText.textContent = checked.map(c => c.parentElement.textContent.trim()).join(', ');
      }
    });
  });
});
