document.documentElement.classList.add("js");

const resources = {
  "食糧": {
    place: "麦畑",
    levels: {
      1: { amount: 225000, timeAt412: "0:22:53" },
      2: { amount: 412000, timeAt412: "0:55:57" },
      3: { amount: 900000, timeAt412: "1:01:02" }
    }
  },
  "石材": {
    place: "石場",
    levels: {
      1: { amount: 180000, timeAt412: "0:36:37" },
      2: { amount: 330000, timeAt412: "0:44:46" },
      3: { amount: 720000, timeAt412: "1:13:15" }
    }
  },
  "木材": {
    place: "森林",
    levels: {
      1: { amount: 180000, timeAt412: "0:36:37" },
      2: { amount: 330000, timeAt412: "0:44:46" },
      3: { amount: 720000, timeAt412: "1:13:15" }
    }
  },
  "鉱石": {
    place: "鉱山",
    levels: {
      1: { amount: 135000, timeAt412: "0:27:28" },
      2: { amount: 247000, timeAt412: "0:33:34" },
      3: { amount: 540000, timeAt412: "0:54:56" }
    }
  },
  "ゴールド": {
    place: "遺跡",
    levels: {
      1: { amount: 67500, timeAt412: "0:27:28" },
      2: { amount: 123750, timeAt412: "0:30:59" },
      3: { amount: 272000, timeAt412: "0:50:36" }
    }
  }
};

const troops = {
  "第1部隊 ソルジャー": { squad: "第1部隊", name: "ソルジャー", type: "兵士", capacity: 7, use: "低コストだが採取ではバリスタ優先" },
  "第1部隊 アーチャー": { squad: "第1部隊", name: "アーチャー", type: "弓兵", capacity: 6, use: "採取では優先度低め" },
  "第1部隊 ランサー": { squad: "第1部隊", name: "ランサー", type: "騎兵", capacity: 5, use: "早く着きたい時" },
  "第1部隊 バリスタ": { squad: "第1部隊", name: "バリスタ", type: "攻城兵器", capacity: 8, use: "普段の採取におすすめ" },
  "第2部隊 グラディエーター": { squad: "第2部隊", name: "グラディエーター", type: "兵士", capacity: 9, use: "補充に余裕がある時" },
  "第2部隊 スナイパー": { squad: "第2部隊", name: "スナイパー", type: "弓兵", capacity: 8, use: "採取では優先度低め" },
  "第2部隊 リザードライダー": { squad: "第2部隊", name: "リザードライダー", type: "騎兵", capacity: 7, use: "速度重視の第2部隊" },
  "第2部隊 カタパルト": { squad: "第2部隊", name: "カタパルト", type: "攻城兵器", capacity: 10, use: "安全な時の採取用" },
  "第3部隊 ロイヤルガーディアン": { squad: "第3部隊", name: "ロイヤルガーディアン", type: "兵士", capacity: 12, use: "基本は温存" },
  "第3部隊 ステルススナイパー": { squad: "第3部隊", name: "ステルススナイパー", type: "弓兵", capacity: 10, use: "基本は温存" },
  "第3部隊 ロイヤルライダー": { squad: "第3部隊", name: "ロイヤルライダー", type: "騎兵", capacity: 9, use: "基本は温存" },
  "第3部隊 フレイムランチャー": { squad: "第3部隊", name: "フレイムランチャー", type: "攻城兵器", capacity: 15, use: "安全な時だけ" }
};

const recommendedTroops = [
  "第1部隊 ランサー",
  "第1部隊 バリスタ",
  "第2部隊 リザードライダー",
  "第2部隊 カタパルト"
];

const allTroops = Object.keys(troops);
const speedPresets = [0, 50, 100, 150, 200];
const amountPresets = [10000, 30000, 50000, 80000];

function troopShortLabel(troop) {
  return `${troop.name}（${troop.type}） / 1人あたり${troop.capacity}`;
}

function troopFullLabel(key) {
  const troop = troops[key];
  return `${troop.squad} / ${troopShortLabel(troop)}`;
}

function troopHeaderLabel(key) {
  const troop = troops[key];
  return `<span class="thMain">${troop.squad} / ${troop.name}（${troop.type}）</span><span class="thSub">1人あたり${troop.capacity}</span>`;
}

function amountHeaderLabel(count) {
  return `<span class="thMain">${formatNumber(count)}人</span><span class="thSub">採れる上限</span>`;
}

function parseTime(value) {
  const parts = value.split(":").map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("ja-JP");
}

function formatTime(seconds) {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remain = safe % 60;
  if (hours > 0) return `${hours}時間${String(minutes).padStart(2, "0")}分`;
  if (minutes > 0) return `${minutes}分${String(remain).padStart(2, "0")}秒`;
  return `${remain}秒`;
}

function fullGatherSeconds(resourceName, level, speedBonus) {
  const timeAt412 = parseTime(resources[resourceName].levels[level].timeAt412);
  const baseSeconds = timeAt412 * 5.12;
  return baseSeconds / (1 + speedBonus / 100);
}

function calculateGather({ resourceName, level, troopName, troopCount, gatherBonus, loadBonus, oneWayMinutes }) {
  const tile = resources[resourceName].levels[level];
  const troop = troops[troopName];
  const capacity = troopCount * troop.capacity * (1 + loadBonus / 100);
  const actual = Math.min(tile.amount, capacity);
  const fullTime = fullGatherSeconds(resourceName, level, gatherBonus);
  const gatherTime = fullTime * (actual / tile.amount);
  const totalTime = gatherTime + oneWayMinutes * 2 * 60;
  const required = Math.ceil(tile.amount / (troop.capacity * (1 + loadBonus / 100)));
  const perHour = totalTime > 0 ? actual / (totalTime / 3600) : actual;
  return { tile, troop, capacity, actual, fullTime, gatherTime, totalTime, required, perHour };
}

function fillSelects() {
  const resourceSelect = document.getElementById("resourceSelect");
  const levelSelect = document.getElementById("levelSelect");
  const troopSelect = document.getElementById("troopSelect");
  const partialResourceSelect = document.getElementById("partialResourceSelect");
  const partialLevelSelect = document.getElementById("partialLevelSelect");
  const partialTroopSelect = document.getElementById("partialTroopSelect");

  const resourceOptions = Object.keys(resources).map(name => `<option value="${name}">${name}（${resources[name].place}）</option>`).join("");
  const levelOptions = [1, 2, 3].map(level => `<option value="${level}">レベル${level}</option>`).join("");
  const troopOptions = Object.keys(troops).map(name => `<option value="${name}">${troopFullLabel(name)}</option>`).join("");

  resourceSelect.innerHTML = resourceOptions;
  levelSelect.innerHTML = levelOptions;
  troopSelect.innerHTML = troopOptions;
  partialResourceSelect.innerHTML = resourceOptions;
  partialLevelSelect.innerHTML = levelOptions;
  partialTroopSelect.innerHTML = troopOptions;

  resourceSelect.value = "石材";
  levelSelect.value = "2";
  troopSelect.value = "第1部隊 バリスタ";
  partialResourceSelect.value = "石材";
  partialLevelSelect.value = "2";
  partialTroopSelect.value = "第1部隊 バリスタ";
}

function updateCalculator() {
  const values = {
    resourceName: document.getElementById("resourceSelect").value,
    level: Number(document.getElementById("levelSelect").value),
    troopName: document.getElementById("troopSelect").value,
    troopCount: Number(document.getElementById("troopCount").value || 0),
    gatherBonus: Number(document.getElementById("gatherBonus").value || 0),
    loadBonus: Number(document.getElementById("loadBonus").value || 0),
    oneWayMinutes: Number(document.getElementById("oneWayMinutes").value || 0)
  };

  const result = calculateGather(values);
  const troopText = `${result.troop.squad} ${result.troop.name}（${result.troop.type}）`;
  document.getElementById("resultTitle").textContent = `${troopText}で${values.resourceName}レベル${values.level}を採取`;
  document.getElementById("tileAmount").textContent = formatNumber(result.tile.amount);
  document.getElementById("capacityAmount").textContent = formatNumber(result.capacity);
  document.getElementById("actualAmount").textContent = formatNumber(result.actual);
  document.getElementById("gatherTime").textContent = formatTime(result.gatherTime);
  document.getElementById("totalTime").textContent = formatTime(result.totalTime);
  document.getElementById("requiredTroops").textContent = `${formatNumber(result.required)}人`;

  const note = result.capacity >= result.tile.amount
    ? `この兵数なら資源地を空にできます。往復込みの1時間あたり目安は約${formatNumber(result.perHour)}です。片道の移動時間の単位は「分」です。`
    : `この兵数だと資源地に約${formatNumber(result.tile.amount - result.actual)}残ります。空にするには約${formatNumber(result.required)}人が必要です。片道の移動時間の単位は「分」です。`;
  document.getElementById("resultNote").textContent = note;
}


function calculatePartialGather({ resourceName, level, troopName, troopCount, remainingAmount, gatherBonus, loadBonus, oneWayMinutes }) {
  const tile = resources[resourceName].levels[level];
  const troop = troops[troopName];
  const safeRemaining = Math.max(0, remainingAmount);
  const clampedRemaining = Math.min(safeRemaining, tile.amount);
  const capacity = troopCount * troop.capacity * (1 + loadBonus / 100);
  const actual = Math.min(clampedRemaining, capacity);
  const remainingAfter = Math.max(0, clampedRemaining - actual);
  const fullTime = fullGatherSeconds(resourceName, level, gatherBonus);
  const gatherTime = fullTime * (actual / tile.amount);
  const totalTime = gatherTime + oneWayMinutes * 2 * 60;
  const rate = tile.amount > 0 ? clampedRemaining / tile.amount : 0;
  const required = Math.ceil(clampedRemaining / (troop.capacity * (1 + loadBonus / 100)));
  return {
    tile,
    troop,
    capacity,
    actual,
    remainingAfter,
    clampedRemaining,
    fullTime,
    gatherTime,
    totalTime,
    rate,
    required,
    wasClamped: safeRemaining > tile.amount
  };
}

function updatePartialCalculator() {
  const values = {
    resourceName: document.getElementById("partialResourceSelect").value,
    level: Number(document.getElementById("partialLevelSelect").value),
    troopName: document.getElementById("partialTroopSelect").value,
    troopCount: Number(document.getElementById("partialTroopCount").value || 0),
    remainingAmount: Number(document.getElementById("partialAmount").value || 0),
    gatherBonus: Number(document.getElementById("partialGatherBonus").value || 0),
    loadBonus: Number(document.getElementById("partialLoadBonus").value || 0),
    oneWayMinutes: Number(document.getElementById("partialOneWayMinutes").value || 0)
  };

  const result = calculatePartialGather(values);
  const troopText = `${result.troop.squad} ${result.troop.name}（${result.troop.type}）`;
  document.getElementById("partialResultTitle").textContent = `${troopText}で${values.resourceName}レベル${values.level}の残量を採取`;
  document.getElementById("partialTileMax").textContent = formatNumber(result.tile.amount);
  document.getElementById("partialActualAmount").textContent = formatNumber(result.clampedRemaining);
  document.getElementById("partialCapacityAmount").textContent = formatNumber(result.capacity);
  document.getElementById("partialGatherableAmount").textContent = formatNumber(result.actual);
  document.getElementById("partialRemainingAfter").textContent = formatNumber(result.remainingAfter);
  document.getElementById("partialRate").textContent = `${Math.round(result.rate * 1000) / 10}%`;
  document.getElementById("partialGatherTime").textContent = formatTime(result.gatherTime);
  document.getElementById("partialTotalTime").textContent = formatTime(result.totalTime);
  document.getElementById("partialRequiredTroops").textContent = `${formatNumber(result.required)}人`;

  const baseNote = `${values.resourceName}レベル${values.level}の最大量は${formatNumber(result.tile.amount)}です。入力した残量${formatNumber(result.clampedRemaining)}のうち、この部隊で実際に採れる量は${formatNumber(result.actual)}です。`;
  const capacityNote = result.remainingAfter > 0 ? ` 部隊の持ち帰り上限が足りないため、採取後に約${formatNumber(result.remainingAfter)}残ります。` : " この兵数なら入力した残量を空にできます。";
  const clampNote = result.wasClamped ? ` 入力値が最大量を超えていたため、最大量${formatNumber(result.tile.amount)}として計算しました。` : "";
  document.getElementById("partialNote").textContent = baseNote + capacityNote + clampNote;
}

function fillPartialMaxAmount() {
  const resourceName = document.getElementById("partialResourceSelect").value;
  const level = Number(document.getElementById("partialLevelSelect").value);
  document.getElementById("partialAmount").value = resources[resourceName].levels[level].amount;
  updatePartialCalculator();
}

function renderTimeTable() {
  const rows = [];
  Object.entries(resources).forEach(([resourceName, resource]) => {
    Object.entries(resource.levels).forEach(([level, data]) => {
      const cells = speedPresets.map(speed => formatTime(fullGatherSeconds(resourceName, Number(level), speed)));
      rows.push(`
        <tr>
          <td><strong>${resourceName}</strong></td>
          <td>${resource.place}</td>
          <td>レベル${level}</td>
          <td>${formatNumber(data.amount)}</td>
          ${cells.map(cell => `<td>${cell}</td>`).join("")}
        </tr>
      `);
    });
  });

  return `
    <div class="tableWrap">
      <table>
        <thead>
          <tr>
            <th>資源</th>
            <th>資源地</th>
            <th>レベル</th>
            <th>総量</th>
            ${speedPresets.map(speed => `<th>採取速度+${speed}%</th>`).join("")}
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
    <p class="tableNote">この表は資源地を空にするまでの採取時間です。実際は往復の移動時間が追加されます。</p>
  `;
}

function renderNeededTable() {
  const rows = [];
  Object.entries(resources).forEach(([resourceName, resource]) => {
    Object.entries(resource.levels).forEach(([level, data]) => {
      const cells = recommendedTroops.map(name => {
        const required = Math.ceil(data.amount / troops[name].capacity);
        return `<td>${formatNumber(required)}人</td>`;
      });
      rows.push(`
        <tr>
          <td><strong>${resourceName}</strong></td>
          <td>${resource.place}</td>
          <td>レベル${level}</td>
          <td>${formatNumber(data.amount)}</td>
          ${cells.join("")}
        </tr>
      `);
    });
  });

  return `
    <div class="tableWrap">
      <table class="neededTable compactTable">
        <thead>
          <tr>
            <th>資源</th>
            <th>資源地</th>
            <th>レベル</th>
            <th>総量</th>
            ${recommendedTroops.map(name => `<th class="splitHead">${troopHeaderLabel(name)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
    <p class="tableNote">資源所持量アップ率0%で、資源地を空にするための必要兵数です。所持量アップがある場合は計算ツールで確認してください。</p>
  `;
}

function renderCarryTable() {
  const rows = Object.entries(troops).map(([name, troop]) => `
    <tr>
      <td><strong>${troop.squad}</strong></td>
      <td><strong>${troop.name}</strong></td>
      <td>${troop.type}</td>
      <td>${troop.capacity}</td>
      <td>${formatNumber(troop.capacity * 10000)}</td>
      <td>${formatNumber(troop.capacity * 30000)}</td>
      <td>${formatNumber(troop.capacity * 50000)}</td>
      <td>${troop.use}</td>
    </tr>
  `);

  return `
    <div class="tableWrap">
      <table>
        <thead>
          <tr>
            <th>部隊</th>
            <th>兵士名</th>
            <th>兵種</th>
            <th>1人あたり</th>
            <th>1万人</th>
            <th>3万人</th>
            <th>5万人</th>
            <th>使いどころ</th>
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
    <p class="tableNote">表記は「ソルジャー（兵士） / 1人あたり7」のように統一して使えるようにしています。資源所持量アップ率0%の表です。</p>
  `;
}

function renderAmountTable() {
  const rows = allTroops.map(name => {
    const troop = troops[name];
    return `
      <tr>
        <td><strong>${troop.squad}</strong></td>
        <td><strong>${troop.name}</strong></td>
        <td>${troop.type}</td>
        <td>${troop.capacity}</td>
        ${amountPresets.map(count => `<td>${formatNumber(troop.capacity * count)}</td>`).join("")}
      </tr>
    `;
  });

  return `
    <div class="tableWrap">
      <table class="amountTable compactTable">
        <thead>
          <tr>
            <th>部隊</th>
            <th>兵士名</th>
            <th>兵種</th>
            <th>1人あたり</th>
            ${amountPresets.map(count => `<th class="splitHead amountHead">${amountHeaderLabel(count)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
    <p class="tableNote">この表は第1〜第3部隊すべての「部隊が満杯になるまで採った場合の上限」です。資源地の総量より多く持てる場合でも、実際に採れるのは資源地にある量までです。</p>
  `;
}

function renderTable(type = "time") {
  const tableArea = document.getElementById("tableArea");
  if (type === "needed") tableArea.innerHTML = renderNeededTable();
  else if (type === "carry") tableArea.innerHTML = renderCarryTable();
  else if (type === "amount") tableArea.innerHTML = renderAmountTable();
  else tableArea.innerHTML = renderTimeTable();
}

function setupDrawer() {
  const openMenu = document.getElementById("openMenu");
  const closeMenu = document.getElementById("closeMenu");
  const overlay = document.getElementById("overlay");
  const links = document.querySelectorAll(".navLink");

  function close() {
    document.body.classList.remove("menuOpen");
  }

  openMenu.addEventListener("click", () => document.body.classList.add("menuOpen"));
  closeMenu.addEventListener("click", close);
  overlay.addEventListener("click", close);
  links.forEach(link => link.addEventListener("click", close));
}

function setupPageNavigation() {
  const links = document.querySelectorAll(".navLink");
  const pages = document.querySelectorAll(".page");

  function activate(hash) {
    const target = (hash || "#home").replace("#", "");
    pages.forEach(page => page.classList.toggle("active", page.id === target));
    links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${target}`));
  }

  links.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const href = link.getAttribute("href");
      history.pushState(null, "", href);
      activate(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  window.addEventListener("popstate", () => activate(location.hash));
  activate(location.hash || "#home");
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".miniTabBtn");
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      tabButtons.forEach(item => item.classList.toggle("active", item === button));
      renderTable(button.dataset.table);
    });
  });
}

function setupCalculator() {
  const form = document.getElementById("calcForm");
  const inputs = form.querySelectorAll("input, select");
  const partialForm = document.getElementById("partialCalcForm");
  const partialInputs = partialForm.querySelectorAll("input, select");

  inputs.forEach(input => {
    input.addEventListener("input", updateCalculator);
    input.addEventListener("change", updateCalculator);
  });

  partialInputs.forEach(input => {
    input.addEventListener("input", updatePartialCalculator);
    input.addEventListener("change", updatePartialCalculator);
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    updateCalculator();
  });

  partialForm.addEventListener("submit", event => {
    event.preventDefault();
    updatePartialCalculator();
  });

  document.getElementById("resetButton").addEventListener("click", () => {
    document.getElementById("resourceSelect").value = "石材";
    document.getElementById("levelSelect").value = "2";
    document.getElementById("troopSelect").value = "第1部隊 バリスタ";
    document.getElementById("troopCount").value = "30000";
    document.getElementById("gatherBonus").value = "100";
    document.getElementById("loadBonus").value = "0";
    document.getElementById("oneWayMinutes").value = "5";
    updateCalculator();
  });

  document.getElementById("fillPartialMaxButton").addEventListener("click", fillPartialMaxAmount);
}

function init() {
  fillSelects();
  setupDrawer();
  setupPageNavigation();
  setupTabs();
  setupCalculator();
  renderTable("time");
  updateCalculator();
  updatePartialCalculator();
}

document.addEventListener("DOMContentLoaded", init);
