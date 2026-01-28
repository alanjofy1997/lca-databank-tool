const API = "https://lca-databank-backend.onrender.com";
const container = document.getElementById("materialsContainer");
const totalTableBody = document.querySelector("#totalTable tbody");
const addBtn = document.getElementById("addMaterialBtn");
const viewBtn = document.getElementById("viewResultsBtn");

let databank = [];
let materialNames = [];
let materialsData = [];

// 🔹 Load databank ONCE
fetch(`${API}/databank`)
  .then(res => res.json())
  .then(data => {
    databank = data;
    materialNames = databank.map(d => d.Materials);
    addMaterialBlock();
  });

addBtn.onclick = () => addMaterialBlock();
viewBtn.onclick = () => calculateTotals();

function addMaterialBlock() {
  const block = document.createElement("div");
  block.className = "material-block";

  block.innerHTML = `
    <div class="material-header">
      <input type="text" placeholder="Search material..." class="material-search"/>
      <input type="number" placeholder="Quantity" class="material-qty" min="0" step="0.01"/>
      <button class="delete-btn">🗑️</button>
    </div>
    <div class="suggestions"></div>
  `;

  container.appendChild(block);

  const searchInput = block.querySelector(".material-search");
  const qtyInput = block.querySelector(".material-qty");
  const suggestions = block.querySelector(".suggestions");
  const deleteBtn = block.querySelector(".delete-btn");

  let selectedMaterial = null;

  // 🔹 LOCAL SEARCH (INSTANT)
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    suggestions.innerHTML = "";
    if (!q) return;

    materialNames
      .filter(m => m.toLowerCase().includes(q))
      .slice(0, 8) // limit suggestions
      .forEach(name => {
        const div = document.createElement("div");
        div.textContent = name;
        div.onclick = () => selectMaterial(name);
        suggestions.appendChild(div);
      });
  });

  function selectMaterial(name) {
    searchInput.value = name;
    suggestions.innerHTML = "";
    selectedMaterial = databank.find(d => d.Materials === name);
  }

  deleteBtn.onclick = () => {
    container.removeChild(block);
    materialsData = materialsData.filter(i => i.block !== block);
  };

  materialsData.push({
    block,
    getMaterial: () => selectedMaterial,
    getQty: () => parseFloat(qtyInput.value) || 0
  });
}

function calculateTotals() {
  let totals = {};

  materialsData.forEach(item => {
    const mat = item.getMaterial();
    const qty = item.getQty();
    if (!mat || qty === 0) return;

    for (const key in mat) {
      if (key === "Materials") continue;
      const val = Number(mat[key]);
      if (!isNaN(val)) {
        totals[key] = (totals[key] || 0) + val * qty;
      }
    }
  });

  renderTotals(totals);
}

function renderTotals(totals) {
  totalTableBody.innerHTML = "";

  if (!Object.keys(totals).length) {
    totalTableBody.innerHTML = `<tr><td colspan="2">No results</td></tr>`;
    return;
  }

  // 🔹 Build HTML once (FAST)
  let html = "";
  for (const [k, v] of Object.entries(totals)) {
    html += `<tr><td>${k}</td><td>${v.toFixed(2)}</td></tr>`;
  }
  totalTableBody.innerHTML = html;
}
