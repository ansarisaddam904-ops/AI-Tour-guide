const stateFilter = document.getElementById("stateFilter");
const cityFilter = document.getElementById("cityFilter");
const districtFilter = document.getElementById("districtFilter");
const keywordFilter = document.getElementById("keywordFilter");
const archiveGrid = document.getElementById("archiveGrid");
const resultMeta = document.getElementById("resultMeta");
const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

let archiveData = [];

const lowerIncludes = (value, query) => value.toLowerCase().includes(query.toLowerCase());

function uniqueValues(items, key, filter = () => true) {
  return [...new Set(items.filter(filter).map((item) => item[key]))].sort();
}

function populateSelect(select, values) {
  const current = select.value;
  select.innerHTML = '<option value="all">All</option>';
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.value = values.includes(current) ? current : "all";
}

function allText(entry) {
  return [
    entry.stateOrUt,
    entry.city,
    entry.district,
    entry.heritage,
    entry.history,
    ...entry.artCulture,
    ...entry.foods,
    ...entry.handicrafts,
    ...entry.giTags,
    ...entry.uniqueProducts,
    entry.whyUnique,
  ].join(" ");
}

function renderCards(items) {
  archiveGrid.innerHTML = "";
  resultMeta.textContent = `${items.length} archive result(s) found.`;

  if (!items.length) {
    archiveGrid.innerHTML = `<p>No matches found. Try changing filters or keyword.</p>`;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <p class="meta">${item.stateOrUt} • ${item.city} • ${item.district}</p>
      <h3>${item.city}</h3>
      <p><strong>Heritage:</strong> ${item.heritage}</p>
      <div class="pills">${item.giTags.map((tag) => `<span class="pill">GI: ${tag}</span>`).join("")}</div>
      <p><strong>Foods:</strong> ${item.foods.join(", ")}</p>
      <p><strong>Handicrafts:</strong> ${item.handicrafts.join(", ")}</p>
      <p><strong>Unique:</strong> ${item.uniqueProducts.join(", ")}</p>
    `;
    archiveGrid.appendChild(card);
  });
}

function applyFilters() {
  const selectedState = stateFilter.value;
  const selectedCity = cityFilter.value;
  const selectedDistrict = districtFilter.value;
  const keyword = keywordFilter.value.trim();

  const filtered = archiveData.filter((item) => {
    const stateMatch = selectedState === "all" || item.stateOrUt === selectedState;
    const cityMatch = selectedCity === "all" || item.city === selectedCity;
    const districtMatch = selectedDistrict === "all" || item.district === selectedDistrict;
    const keywordMatch = !keyword || lowerIncludes(allText(item), keyword);
    return stateMatch && cityMatch && districtMatch && keywordMatch;
  });

  renderCards(filtered);
}

function refreshDependentFilters() {
  const selectedState = stateFilter.value;

  const cities = uniqueValues(archiveData, "city", (item) => selectedState === "all" || item.stateOrUt === selectedState);
  populateSelect(cityFilter, cities);

  const selectedCity = cityFilter.value;
  const districts = uniqueValues(
    archiveData,
    "district",
    (item) =>
      (selectedState === "all" || item.stateOrUt === selectedState) &&
      (selectedCity === "all" || item.city === selectedCity)
  );
  populateSelect(districtFilter, districts);
}

function botReply(question) {
  const q = question.toLowerCase();
  const placeMatch = archiveData.find(
    (item) => q.includes(item.stateOrUt.toLowerCase()) || q.includes(item.city.toLowerCase()) || q.includes(item.district.toLowerCase())
  );

  if (placeMatch) {
    if (q.includes("food")) {
      return `${placeMatch.city} local foods: ${placeMatch.foods.join(", ")}.`;
    }
    if (q.includes("gi") || q.includes("tag")) {
      return `GI tags for ${placeMatch.city}/${placeMatch.stateOrUt}: ${placeMatch.giTags.join(", ")}.`;
    }
    if (q.includes("craft") || q.includes("handicraft") || q.includes("art")) {
      return `${placeMatch.city} is known for: ${placeMatch.handicrafts.join(", ")} and cultural forms like ${placeMatch.artCulture.join(", ")}.`;
    }
    return `${placeMatch.city}, ${placeMatch.stateOrUt} (${placeMatch.district} district):\n- Heritage: ${placeMatch.heritage}\n- History: ${placeMatch.history}\n- Unique products: ${placeMatch.uniqueProducts.join(", ")}\n- Why unique: ${placeMatch.whyUnique}`;
  }

  if (q.includes("plan") || q.includes("itinerary")) {
    return "Try this mini-route: Jaipur (craft + forts) → Varanasi (heritage + silk) → Bhuj, Kutch (embroidery + Rann). Ask me for a state-wise custom itinerary.";
  }

  return "I can answer state/city/district specific questions on heritage, GI tags, foods, crafts, and unique local products. Try: 'What is special in Madurai?'";
}

function appendMessage(type, text) {
  const message = document.createElement("div");
  message.className = `msg ${type}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function init() {
  const response = await fetch("./data/india-archive.json");
  archiveData = await response.json();

  populateSelect(stateFilter, uniqueValues(archiveData, "stateOrUt"));
  refreshDependentFilters();
  applyFilters();

  stateFilter.addEventListener("change", () => {
    refreshDependentFilters();
    applyFilters();
  });

  cityFilter.addEventListener("change", () => {
    refreshDependentFilters();
    applyFilters();
  });

  districtFilter.addEventListener("change", applyFilters);
  keywordFilter.addEventListener("input", applyFilters);

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question) {
      return;
    }
    appendMessage("user", question);
    appendMessage("bot", botReply(question));
    chatInput.value = "";
  });
}

init();
