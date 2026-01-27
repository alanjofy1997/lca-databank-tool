const API = "https://lca-databank-backend.onrender.com";
const container = document.getElementById("materialsContainer");
const totalTableBody = document.querySelector("#totalTable tbody");
const addBtn = document.getElementById("addMaterialBtn");
const viewBtn = document.getElementById("viewResultsBtn");

let materialsData = [];

addMaterialBlock(); // start with one

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

  searchInput.addEventListener("input", async () => {
    const q = searchInput.value.trim();
    if (!q) return suggestions.innerHTML = "";

    const res = await fetch(`${API}/search?q=${q}`);
    const mats = await res.json();
    suggestions.innerHTML = "";

    mats.forEach(m => {
      const div = document.createElement("div");
      div.textContent = m;
      div.onclick = () => selectMaterial(m);
      suggestions.appendChild(div);
    });
  });

  async function selectMaterial(name) {
    searchInput.value = name;
    suggestions.innerHTML = "";

    const res = await fetch(`${API}/material/${encodeURIComponent(name)}`);
    selectedMaterial = await res.json();
  }

  deleteBtn.onclick = () => {
    container.removeChild(block);
    materialsData = materialsData.filter(item => item.block !== block);
  };

  materialsData.push({
    block: block,
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

    Object.entries(mat).forEach(([key, val]) => {
      if (key === "Materials") return;
      const num = parseFloat(val);
      if (isNaN(num)) return;

      totals[key] = (totals[key] || 0) + num * qty;
    });
  });

  renderTotals(totals);
}

function renderTotals(totals) {
  totalTableBody.innerHTML = "";

  if (Object.keys(totals).length === 0) {
    totalTableBody.innerHTML = `<tr><td colspan="2">No results to display</td></tr>`;
    return;
  }

  Object.entries(totals).forEach(([key, val]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${key}</td><td>${val.toFixed(2)}</td>`;
    totalTableBody.appendChild(tr);
  });
}
