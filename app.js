/**
 * DPK Chart Viewer - Real-time CSV Visualization
 * Main Application JavaScript
 */

// Register datalabels plugin
Chart.register(ChartDataLabels);

// =====================================
// Configuration
// =====================================
const CONFIG = {
  csvPaths: {
    kcp: {
      dpk: "csv kcp/dpk.csv",
      casa: "csv kcp/casa.csv",
      depo: "csv kcp/depo.csv",
      giro: "csv kcp/giro.csv",
      tabungan: "csv kcp/tabungan.csv",
    },
    konsol: {
      dpk: "csv konsol/dpk.csv",
      casa: "csv konsol/casa.csv",
      depo: "csv konsol/depo.csv",
      giro: "csv konsol/giro.csv",
      tabungan: "csv konsol/tabungan.csv",
    },
    mikro: {
      dpk: "csv mikro/dpk.csv",
      casa: "csv mikro/casa.csv",
      depo: "csv mikro/depo.csv",
      giro: "csv mikro/giro.csv",
      tabungan: "csv mikro/tabungan.csv",
    },
    ritel: {
      dpk: "csv ritel/dpk.csv",
      casa: "csv ritel/casa.csv",
      depo: "csv ritel/depo.csv",
      giro: "csv ritel/giro.csv",
      tabungan: "csv ritel/tabungan.csv",
    },
    "kanca only": {
      dpk: "csv kanca only/dpk.csv",
      casa: "csv kanca only/casa.csv",
      depo: "csv kanca only/depo.csv",
      giro: "csv kanca only/giro.csv",
      tabungan: "csv kanca only/tabungan.csv",
    },
    average: {
      dpk: "csv average/dpk.csv",
      casa: "csv average/casa.csv",
      depo: "csv average/depo.csv",
      giro: "csv average/giro.csv",
      tabungan: "csv average/tabungan.csv",
    },
    cc: {
      savol: "csv cc/savol.csv",
      new_user: "csv cc/new_user.csv",
    },
  },
  chartColors: [
    "#3b82f6",
    "#0ea5e9",
    "#ec4899",
    "#14b8a6",
    "#f59e0b",
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#84cc16",
    "#06b6d4",
    "#a855f7",
    "#e11d48",
    "#0ea5e9",
    "#10b981",
    "#f43f5e",
    "#eab308",
    "#2563eb",
    "#7c3aed",
    "#d946ef",
    "#0d9488",
    "#dc2626",
    "#16a34a",
    "#ca8a04",
    "#6d28d9",
    "#db2777",
    "#0891b2",
    "#059669",
    "#d97706",
    "#4f46e5",
    "#be185d",
    "#0284c7",
    "#15803d",
    "#b45309",
    "#7e22ce",
  ],
  defaultRefreshInterval: 10000,
  areaMapping: {
    "1": [
      "KC Jatibarang", "KC Purwakarta", "KC Indramayu", "KC Subang", "KC Pamanukan",
      "KCP Patrol"
    ],
    "2": [
      "KC Cirebon Gunung Jati", "KC Kuningan", "KC Sumedang", "KC Cirebon Kartini", "KC Majalengka",
      "KCP Sumber", "KCP Ciledug Cirebon", "KCP Jatinangor", "KCP Weru"
    ],
    "3": [
      "KC Garut", "KC Ciamis", "KC Tasikmalaya", "KC Banjar", "KC Singaparna",
      "KCP Cikajang", "KCP Ciawi Tasikmalaya", "KCP Pangandaran"
    ],
    "4": [
      "KC Sukabumi", "KC Cibadak", "KC Majalaya", "KC Soreang", "KC Cimahi", "KC Cianjur",
      "KCP Surade", "KCP Cicurug", "KCP Pelabuhan Ratu", "KCP Rancaekek", "KCP Banjaran", "KCP Cijerah", "KCP Cimindi", "KCP Padalarang", "KCP Ciranjang", "KCP Cipanas", "KCP Sukanagara"
    ],
    "5": [
      "KC Bandung Kopo", "KC Bandung Dewi Sartika", "KC Bandung A.H. Nasution", "KC Bandung Naripan", "KC Bandung AA", "KC Bandung Setiabudi", "KC Bandung Sukarno Hatta", "KC Bandung Dago", "KC Bandung Martadinata",
      "KCP Kopo Indah", "KCP Taman Kopo Indah II", "KCP Sumber Sari", "KCP Telkom Bandung", "KCP Otto Iskandardinata", "KCP Suci", "KCP Rajawali Bandung", "KCP Lembang", "KCP Setrasari", "KCP Trade Center", "KCP Batununggal", "KCP Antapani", "KCP ITB", "KCP Buah Batu", "KCP Riau"
    ]
  },
};

const DEFAULT_MONTH_COLORS = Object.freeze({
  Januari: "#10b981",
  Februari: "#3b82f6",
  Maret: "#111827",
  April: "#8b5cf6",
  Mei: "#ec4899",
  Juni: "#14b8a6",
  Juli: "#f97316",
  Agustus: "#eab308",
  September: "#06b6d4",
  Oktober: "#a855f7",
  November: "#22c55e",
  Desember: "#f59e0b",
});

const CC_MONTH_LIST = Object.freeze([
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]);

const DEFAULT_CC_YEAR_COLORS = Object.freeze({
  "2025": "#3b82f6",
  "2026": "#10b981",
});

const MONTH_COLOR_STORAGE_KEY = "dpk-chart-month-colors";
const CC_YEAR_COLOR_STORAGE_KEY = "cc-chart-year-colors";

function loadMonthColors() {
  const colors = { ...DEFAULT_MONTH_COLORS };

  try {
    const savedColors = JSON.parse(localStorage.getItem(MONTH_COLOR_STORAGE_KEY));
    if (!savedColors || typeof savedColors !== "object") return colors;

    Object.keys(colors).forEach((month) => {
      if (/^#[0-9a-f]{6}$/i.test(savedColors[month])) {
        colors[month] = savedColors[month];
      }
    });
  } catch (error) {
    console.warn("Warna bulan tersimpan tidak dapat dibaca:", error);
  }

  return colors;
}

function saveMonthColors() {
  try {
    localStorage.setItem(MONTH_COLOR_STORAGE_KEY, JSON.stringify(state.monthColors));
  } catch (error) {
    console.warn("Warna bulan tidak dapat disimpan:", error);
  }
}

function loadCcYearColors() {
  const colors = { ...DEFAULT_CC_YEAR_COLORS };
  try {
    const savedColors = JSON.parse(localStorage.getItem(CC_YEAR_COLOR_STORAGE_KEY));
    if (savedColors && typeof savedColors === "object") {
      ["2025", "2026"].forEach((year) => {
        if (/^#[0-9a-f]{6}$/i.test(savedColors[year])) {
          colors[year] = savedColors[year];
        }
      });
    }
  } catch (error) {
    console.warn("Warna CC tersimpan tidak dapat dibaca:", error);
  }
  return colors;
}

function saveCcYearColors() {
  try {
    localStorage.setItem(CC_YEAR_COLOR_STORAGE_KEY, JSON.stringify(state.ccYearColors));
  } catch (error) {
    console.warn("Warna CC tidak dapat disimpan:", error);
  }
}

function hexToRgba(hex, alpha = 0.1) {
  const normalizedHex = hex.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getMonthColor(month) {
  const border = state.monthColors[month] || "#6b7280";
  return { border, bg: hexToRgba(border) };
}

// =====================================
// State Management
// =====================================
const state = {
  userRole: "admin", // 'admin' | 'cc'
  currentCategory: "konsol",
  currentMetric: "dpk",
  currentArea: "all",
  ccViewMode: "line_yoy",
  ccSelectedYear: "all", // 'all' | '2025' | '2026' 
  selectedUkers: new Set(),
  allUkers: [],
  filteredUkers: [],
  chartData: null,
  chart: null,
  comparisonChart: null,
  selectedComparisonUker: null,
  selectedMonths: [],
  selectedCcMonths: [...CC_MONTH_LIST],
  monthColors: loadMonthColors(),
  ccYearColors: loadCcYearColors(),
  dateLabelMode: "range",
  chartTitleVisibility: "hide",
  autoRefreshEnabled: false,
  refreshIntervalId: null,
  lastDataHash: null,
};

const ALL_BRANCHES_VALUE = "__all__";

// =====================================
// DOM Elements
// =====================================
const elements = {
  categorySelect: document.getElementById("categorySelect"),
  metricSelect: document.getElementById("metricSelect"),
  areaSelect: document.getElementById("areaSelect"),
  autoRefreshToggle: document.getElementById("autoRefreshToggle"),
  refreshInterval: document.getElementById("refreshInterval"),
  refreshBtn: document.getElementById("refreshBtn"),
  selectAllBtn: document.getElementById("selectAllBtn"),
  deselectAllBtn: document.getElementById("deselectAllBtn"),
  ukerGrid: document.getElementById("ukerGrid"),
  mainChart: document.getElementById("mainChart"),
  chartTitle: document.getElementById("chartTitle"),
  chartLegend: document.getElementById("chartLegend"),
  dataPoints: document.getElementById("dataPoints"),
  selectedUkers: document.getElementById("selectedUkers"),
  totalUkers: document.getElementById("totalUkers"),
  maxValue: document.getElementById("maxValue"),
  minValue: document.getElementById("minValue"),
  dataPeriod: document.getElementById("dataPeriod"),
  statusIndicator: document.getElementById("statusIndicator"),
  statusText: document.querySelector(".status-text"),
  lastUpdateTime: document.getElementById("lastUpdateTime"),
  dateLabelModeSelect: document.getElementById("dateLabelModeSelect"),
  chartTitleVisibilitySelect: document.getElementById("chartTitleVisibilitySelect"),
  generateTablePhotoBtn: document.getElementById("generateTablePhotoBtn"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  toastContainer: document.getElementById("toastContainer"),
  modeDpkBtn: document.getElementById("modeDpkBtn"),
  modeCcBtn: document.getElementById("modeCcBtn"),
  ccYearSelectGroup: document.getElementById("ccYearSelectGroup"),
  ccYearSelect: document.getElementById("ccYearSelect"),
  ccViewModeGroup: document.getElementById("ccViewModeGroup"),
  ccViewModeSelect: document.getElementById("ccViewModeSelect"),
  dateLabelModeGroup: document.getElementById("dateLabelModeGroup"),
  chartTitleVisibilityGroup: document.getElementById("chartTitleVisibilityGroup"),
  tableCard1Title: document.getElementById("tableCard1Title"),
  tableCard2Title: document.getElementById("tableCard2Title"),
  avgEndingTableHead: document.getElementById("avgEndingTableHead"),
  bottomEndingTableHead: document.getElementById("bottomEndingTableHead"),
  openCcManualModalBtn: document.getElementById("openCcManualModalBtn"),
  openCcManualModalInlineBtn: document.getElementById("openCcManualModalInlineBtn"),
  ccManualModal: document.getElementById("ccManualModal"),
  closeCcManualModalBtn: document.getElementById("closeCcManualModalBtn"),
  ccCancelModalBtn: document.getElementById("ccCancelModalBtn"),
  ccModalMetric: document.getElementById("ccModalMetric"),
  ccModalDate: document.getElementById("ccModalDate"),
  ccModalAddDateBtn: document.getElementById("ccModalAddDateBtn"),
  ccModalPasteExcelBtn: document.getElementById("ccModalPasteExcelBtn"),
  ccClosePasteBox: document.getElementById("ccClosePasteBox"),
  ccPasteBox: document.getElementById("ccPasteBox"),
  ccPasteTextarea: document.getElementById("ccPasteTextarea"),
  ccPasteCountBadge: document.getElementById("ccPasteCountBadge"),
  ccApplyPasteBtn: document.getElementById("ccApplyPasteBtn"),
  ccModalResetBtn: document.getElementById("ccModalResetBtn"),
  ccModalClearBtn: document.getElementById("ccModalClearBtn"),
  ccLiveGrandTotal: document.getElementById("ccLiveGrandTotal"),
  ccAreaBadgesStrip: document.getElementById("ccAreaBadgesStrip"),
  ccBranchesGridContainer: document.getElementById("ccBranchesGridContainer"),
  ccSaveBtn: document.getElementById("ccSaveBtn"),
  ccDownloadCsvBtn: document.getElementById("ccDownloadCsvBtn"),
};

// =====================================
// Utility Functions
// =====================================

/**
 * Parse European number format (1.234,56 -> 1234.56)
 */
function parseEuropeanNumber(str) {
  if (!str || typeof str !== "string") return 0;
  str = str.trim();
  if (!str) return 0;

  // Remove thousands separator (.)
  str = str.replace(/\./g, "");
  // Replace decimal separator (,) with (.)
  str = str.replace(",", ".");

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Format number for display
 */
function formatNumber(num, decimals = 2) {
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Simple hash function for data comparison
 */
function hashData(data) {
  return JSON.stringify(data)
    .split("")
    .reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;

  elements.toastContainer.appendChild(toast);

  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.remove();
  });

  setTimeout(() => {
    toast.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
  if (isLoading) {
    elements.loadingOverlay.classList.add("active");
    elements.statusIndicator.classList.add("loading");
    elements.statusIndicator.classList.remove("error");
    elements.statusText.textContent = "Loading...";
    elements.statusText.style.color = "#f59e0b";
  } else {
    elements.loadingOverlay.classList.remove("active");
    elements.statusIndicator.classList.remove("loading");
    elements.statusText.textContent = "Ready";
    elements.statusText.style.color = "#10b981";
  }
}

/**
 * Set error state
 */
function setError(message) {
  elements.statusIndicator.classList.add("error");
  elements.statusIndicator.classList.remove("loading");
  elements.statusText.textContent = "Error";
  elements.statusText.style.color = "#ef4444";
  showToast(message, "error");
}

/**
 * Update last update time
 */
function updateLastUpdateTime() {
  const now = new Date();
  elements.lastUpdateTime.textContent = now.toLocaleTimeString("id-ID");
}

function generateComparisonTablePhoto() {
  const metricsGrid = document.querySelector('.comparison-metrics-grid');
  if (!metricsGrid) {
    showToast('Tabel tidak ditemukan.', 'error');
    return;
  }

  if (typeof html2canvas !== 'function') {
    showToast('Library generate foto belum siap.', 'error');
    return;
  }

  showToast('Sedang generate foto tabel...', 'info');

  html2canvas(metricsGrid, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
  })
    .then((canvas) => {
      const link = document.createElement('a');
      const ukerName = state.selectedComparisonUker === ALL_BRANCHES_VALUE
        ? 'semua-cabang'
        : (state.selectedComparisonUker || 'uker')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
      const activeMonths = state.currentCategory === 'cc' ? state.selectedCcMonths : state.selectedMonths;
      const monthTag = (activeMonths || []).join('-').toLowerCase() || 'bulan';
      link.download = `tabel-${state.currentCategory}-${state.currentMetric}-${ukerName}-${monthTag}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Foto tabel berhasil digenerate.', 'success');
    })
    .catch((error) => {
      console.error('Generate table photo error:', error);
      showToast('Gagal generate foto tabel.', 'error');
    });
}

// =====================================
// CSV Parsing
// =====================================

/**
 * Fetch and parse CSV file
 */
async function fetchCSV(category, metric) {
  if (category === "cc") {
    const override = localStorage.getItem(`cc_override_${metric}`);
    if (override) {
      try {
        return parseCSV(override);
      } catch (err) {
        console.warn("Gagal parse override CC dari localStorage:", err);
      }
    }
  }

  const path = CONFIG.csvPaths[category][metric];

  try {
    const response = await fetch(`${path}?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error("Error fetching CSV:", error);
    throw error;
  }
}

/**
 * Parse CSV text to structured data
 */
function parseCSV(csvText) {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data");
  }

  // Parse header (unit kerja names)
  const headerLine = lines[0];
  const headers = headerLine.split(";").map((h) => h.trim().replace(/\r/g, ""));

  // Find the starting column for headers (branch names) and data (values)
  // These can differ: e.g. kanca only has branches at col 1 in header but a label at col 1 in data
  let headerStartCol = 1;
  if (
    headers[1] === "" ||
    headers[1].toLowerCase().includes("dpk") ||
    headers[1].toLowerCase().includes("casa") ||
    headers[1].toLowerCase().includes("giro") ||
    headers[1].toLowerCase().includes("depo") ||
    headers[1].toLowerCase().includes("tabungan")
  ) {
    headerStartCol = 2;
  }

  // Check first data row to detect if data has a label column
  let dataStartCol = headerStartCol;
  if (lines.length > 1) {
    const firstDataValues = lines[1].split(";").map((v) => v.trim().replace(/\r/g, ""));
    if (firstDataValues.length > 1) {
      const col1 = firstDataValues[1].toLowerCase();
      if (
        col1.includes("dpk") ||
        col1.includes("casa") ||
        col1.includes("giro") ||
        col1.includes("depo") ||
        col1.includes("tabungan")
      ) {
        dataStartCol = Math.max(headerStartCol, 2);
      }
    }
  }

  const ukerNames = headers.slice(headerStartCol);

  // Parse data rows
  const dates = [];
  const data = {};

  ukerNames.forEach((uker) => {
    if (uker) data[uker] = [];
  });

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(";")) continue;

    const values = line.split(";").map((v) => v.trim().replace(/\r/g, ""));
    const date = values[0];

    if (!date || date === "") continue;

    dates.push(date);

    for (
      let j = dataStartCol;
      j < values.length && j - dataStartCol < ukerNames.length;
      j++
    ) {
      const ukerName = ukerNames[j - dataStartCol];
      if (ukerName) {
        const value = parseEuropeanNumber(values[j]);
        data[ukerName].push(value);
      }
    }
  }

  return { dates, ukerNames, data };
}

function setCcSelectedYear(year) {
  state.ccSelectedYear = year; // 'all' | '2025' | '2026'
  if (elements.ccYearSelect) {
    elements.ccYearSelect.value = year;
  }
  populateMonthSelectors();
  updateCcComparisonChart();
  updateCcTables();
}

function getFilteredUkersForArea(ukerNames) {
  const cleaned = (ukerNames || []).filter((u) => u);
  if (state.currentArea === "all" || !CONFIG.areaMapping[state.currentArea]) {
    return cleaned;
  }

  const areaUkers = CONFIG.areaMapping[state.currentArea];
  return cleaned.filter((uker) => {
    if (state.currentCategory === 'cc' && uker.toLowerCase() === `total area ${state.currentArea}`.toLowerCase()) {
      return true;
    }
    return areaUkers.some(
      (areaUker) =>
        uker.toLowerCase().includes(
          areaUker.toLowerCase().replace("KC ", "").replace("KCP ", ""),
        ) || areaUker.toLowerCase().includes(uker.toLowerCase()),
    );
  });
}

function getMonthKeywords(month) {
  const map = {
    Januari: ["jan"],
    Februari: ["feb"],
    Maret: ["mar"],
    April: ["apr"],
    Mei: ["may", "mei"],
    Juni: ["jun"],
    Juli: ["jul"],
    Agustus: ["aug"],
    September: ["sep"],
    Oktober: ["oct", "okt"],
    November: ["nov"],
    Desember: ["dec", "des"],
  };
  return map[month] || [];
}

// =====================================
// UI Updates
// =====================================

/**
 * Populate unit kerja grid
 */
function populateUkerGrid(ukerNames) {
  if (!elements.ukerGrid) {
    // ukerGrid element not present, just update state
    state.allUkers = ukerNames;
    state.filteredUkers = ukerNames;
    if (elements.totalUkers) {
      elements.totalUkers.textContent = ukerNames.filter((u) => u).length;
    }
    return;
  }
  
  elements.ukerGrid.innerHTML = "";
  state.allUkers = ukerNames;
  
  // Filter by area
  let filteredNames = ukerNames;
  if (state.currentArea !== "all" && CONFIG.areaMapping[state.currentArea]) {
    const areaUkers = CONFIG.areaMapping[state.currentArea];
    filteredNames = ukerNames.filter(uker => {
      if (!uker) return false;
      // Check if uker name matches any in the area mapping (partial match)
      return areaUkers.some(areaUker => 
        uker.toLowerCase().includes(areaUker.toLowerCase().replace('KC ', '').replace('KCP ', '')) ||
        areaUker.toLowerCase().includes(uker.toLowerCase())
      );
    });
  }
  
  state.filteredUkers = filteredNames;

  filteredNames.forEach((uker, index) => {
    if (!uker) return;

    const isSelected = state.selectedUkers.has(uker);
    const item = document.createElement("label");
    item.className = `uker-item ${isSelected ? "selected" : ""}`;
    item.innerHTML = `
            <input type="checkbox" class="uker-checkbox" value="${uker}" ${isSelected ? "checked" : ""}>
            <span class="uker-label" title="${uker}">${uker}</span>
        `;

    const checkbox = item.querySelector("input");
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        state.selectedUkers.add(uker);
        item.classList.add("selected");
      } else {
        state.selectedUkers.delete(uker);
        item.classList.remove("selected");
      }
      updateChart();
      updateComparisonTable();
    });

    elements.ukerGrid.appendChild(item);
  });

  if (elements.totalUkers) {
    elements.totalUkers.textContent = filteredNames.filter((u) => u).length;
  }
}

/**
 * Select all unit kerja
 */
function selectAllUkers() {
  state.allUkers.forEach((uker) => {
    if (uker) state.selectedUkers.add(uker);
  });

  document.querySelectorAll(".uker-checkbox").forEach((checkbox) => {
    checkbox.checked = true;
    checkbox.closest(".uker-item").classList.add("selected");
  });

  updateChart();
}

/**
 * Deselect all unit kerja
 */
function deselectAllUkers() {
  state.selectedUkers.clear();

  document.querySelectorAll(".uker-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.closest(".uker-item").classList.remove("selected");
  });

  updateChart();
}

/**
 * Update chart title
 */
function updateChartTitle() {
  const categoryNames = {
    kcp: "KCP",
    konsol: "Konsol",
    mikro: "Mikro",
    ritel: "Ritel",
    "kanca only": "Kanca Only",
    average: "Average",
    cc: "Kartu Kredit (CC)",
  };

  const metricNames = {
    dpk: "DPK",
    casa: "CASA",
    depo: "Deposito",
    giro: "Giro",
    tabungan: "Tabungan",
    savol: "Sales Volume (SAVOL)",
    new_user: "New User CC",
  };

  if (elements.chartTitle) {
    const mName = metricNames[state.currentMetric] || state.currentMetric;
    const cName = categoryNames[state.currentCategory] || state.currentCategory;
    elements.chartTitle.textContent = `📈 Grafik ${mName} - ${cName}`;
  }
}

function applyRoleRestrictions(role) {
  state.userRole = role === 'cc' ? 'cc' : 'admin';
  const isCcUser = state.userRole === 'cc';

  if (isCcUser) {
    state.currentCategory = 'cc';
    if (state.currentMetric !== 'new_user') state.currentMetric = 'savol';

    if (elements.modeDpkBtn) elements.modeDpkBtn.style.display = 'none';
    if (elements.modeCcBtn) {
      elements.modeCcBtn.classList.add('active');
      elements.modeCcBtn.setAttribute('aria-selected', 'true');
      elements.modeCcBtn.title = 'Akses Khusus: Kartu Kredit (CC)';
    }

    if (elements.categorySelect) {
      elements.categorySelect.innerHTML = '<option value="cc" selected>Kartu Kredit (CC)</option>';
      elements.categorySelect.disabled = true;
    }

    syncModeUI();
    loadData();
  } else {
    if (elements.modeDpkBtn) elements.modeDpkBtn.style.display = '';
    if (elements.categorySelect) {
      elements.categorySelect.disabled = false;
      const currentCat = state.currentCategory || 'konsol';
      elements.categorySelect.innerHTML = `
        <option value="kcp">KCP</option>
        <option value="konsol" ${currentCat === 'konsol' ? 'selected' : ''}>Konsol</option>
        <option value="mikro" ${currentCat === 'mikro' ? 'selected' : ''}>Mikro</option>
        <option value="ritel" ${currentCat === 'ritel' ? 'selected' : ''}>Ritel</option>
        <option value="average" ${currentCat === 'average' ? 'selected' : ''}>Average</option>
        <option value="cc" ${currentCat === 'cc' ? 'selected' : ''}>Kartu Kredit (CC)</option>
      `;
    }
    syncModeUI();
  }
}

window.setDashboardRole = applyRoleRestrictions;

function syncModeUI() {
  if (state.userRole === 'cc') {
    state.currentCategory = 'cc';
    if (elements.modeDpkBtn) elements.modeDpkBtn.style.display = 'none';
  } else {
    if (elements.modeDpkBtn) elements.modeDpkBtn.style.display = '';
  }

  const isCc = state.currentCategory === "cc";
  if (elements.modeCcBtn && elements.modeDpkBtn) {
    if (isCc) {
      elements.modeCcBtn.classList.add("active");
      elements.modeCcBtn.setAttribute("aria-selected", "true");
      elements.modeDpkBtn.classList.remove("active");
      elements.modeDpkBtn.setAttribute("aria-selected", "false");
    } else {
      elements.modeDpkBtn.classList.add("active");
      elements.modeDpkBtn.setAttribute("aria-selected", "true");
      elements.modeCcBtn.classList.remove("active");
      elements.modeCcBtn.setAttribute("aria-selected", "false");
    }
  }

  if (elements.ccViewModeGroup) {
    elements.ccViewModeGroup.style.display = isCc ? "flex" : "none";
  }
  if (elements.ccYearSelectGroup) {
    elements.ccYearSelectGroup.style.display = isCc ? "flex" : "none";
  }
  if (elements.dateLabelModeGroup) {
    elements.dateLabelModeGroup.style.display = isCc ? "none" : "flex";
  }

  if (elements.openCcManualModalBtn) {
    elements.openCcManualModalBtn.style.display = isCc ? "inline-flex" : "none";
  }

  const monthSelectorLabel = document.getElementById('monthSelectorLabel') || document.querySelector('.month-chip-group label');
  if (monthSelectorLabel) {
    monthSelectorLabel.textContent = isCc ? 'Pilih Bulan (Perbandingan CC):' : 'Pilih Bulan (bisa lebih dari 2):';
  }

  populateMetricOptions();
}

function populateMetricOptions() {
  if (!elements.metricSelect) return;
  const isCc = state.currentCategory === "cc";
  const currentVal = state.currentMetric;

  if (isCc) {
    elements.metricSelect.innerHTML = `
      <option value="savol" ${currentVal === "savol" ? "selected" : ""}>Sales Volume (SAVOL)</option>
      <option value="new_user" ${currentVal === "new_user" ? "selected" : ""}>New User</option>
    `;
    if (currentVal !== "savol" && currentVal !== "new_user") {
      state.currentMetric = "savol";
      elements.metricSelect.value = "savol";
    }
  } else {
    elements.metricSelect.innerHTML = `
      <option value="dpk" ${currentVal === "dpk" ? "selected" : ""}>DPK</option>
      <option value="casa" ${currentVal === "casa" ? "selected" : ""}>CASA</option>
      <option value="depo" ${currentVal === "depo" ? "selected" : ""}>Deposito</option>
      <option value="giro" ${currentVal === "giro" ? "selected" : ""}>Giro</option>
      <option value="tabungan" ${currentVal === "tabungan" ? "selected" : ""}>Tabungan</option>
    `;
    if (["savol", "new_user"].includes(currentVal)) {
      state.currentMetric = "dpk";
      elements.metricSelect.value = "dpk";
    }
  }
}

/**
 * Update summary statistics
 */
function updateSummary() {
  if (!state.chartData) return;

  const selectedData = Array.from(state.selectedUkers)
    .filter((uker) => state.chartData.data[uker])
    .flatMap((uker) => state.chartData.data[uker]);

  if (selectedData.length === 0) {
    if (elements.maxValue) elements.maxValue.textContent = "-";
    if (elements.minValue) elements.minValue.textContent = "-";
    if (elements.dataPoints) elements.dataPoints.textContent = "0 data points";
    if (elements.selectedUkers) elements.selectedUkers.textContent = "0 unit kerja";
    if (elements.dataPeriod) elements.dataPeriod.textContent = "-";
    return;
  }

  const maxVal = Math.max(...selectedData.filter((v) => v > 0));
  const minVal = Math.min(...selectedData.filter((v) => v > 0));

  if (elements.maxValue) elements.maxValue.textContent = formatNumber(maxVal);
  if (elements.minValue) elements.minValue.textContent = formatNumber(minVal);
  if (elements.dataPoints) elements.dataPoints.textContent = `${state.chartData.dates.length} data points`;
  if (elements.selectedUkers) elements.selectedUkers.textContent = `${state.selectedUkers.size} unit kerja`;

  if (state.chartData.dates.length > 0) {
    const firstDate = state.chartData.dates[0];
    const lastDate = state.chartData.dates[state.chartData.dates.length - 1];
    if (elements.dataPeriod) elements.dataPeriod.textContent = `${firstDate} - ${lastDate}`;
  }
}

// =====================================
// Chart Management
// =====================================

/**
 * Initialize or update the chart
 */
function updateChart() {
  if (!state.chartData) return;
  if (!elements.mainChart) {
    // Main chart element not present, skip chart update
    updateSummary();
    return;
  }

  const datasets = [];
  let colorIndex = 0;

  state.selectedUkers.forEach((uker) => {
    if (state.chartData.data[uker]) {
      datasets.push({
        label: uker,
        data: state.chartData.data[uker],
        borderColor: CONFIG.chartColors[colorIndex % CONFIG.chartColors.length],
        backgroundColor:
          CONFIG.chartColors[colorIndex % CONFIG.chartColors.length] + "20",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        fill: false,
      });
      colorIndex++;
    }
  });

  const chartData = {
    labels: state.chartData.dates,
    datasets: datasets,
  };

  if (state.chart) {
    state.chart.data = chartData;
    state.chart.update("none");
  } else {
    const ctx = elements.mainChart.getContext("2d");
    state.chart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false, // We use custom legend
          },
          datalabels: {
            display: false // Disable on main chart (too many lines)
          },
          tooltip: {
            backgroundColor: "rgba(26, 26, 37, 0.95)",
            titleColor: "#f8fafc",
            bodyColor: "#94a3b8",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${formatNumber(context.raw)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
            },
            ticks: {
              color: "#64748b",
              maxTicksLimit: 15,
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
            },
            ticks: {
              color: "#64748b",
              callback: function (value) {
                return formatNumber(value, 0);
              },
            },
          },
        },
      },
    });
  }

  updateCustomLegend(datasets);
  updateSummary();
}

/**
 * Update custom legend
 */
function updateCustomLegend(datasets) {
  if (!elements.chartLegend) return;
  
  elements.chartLegend.innerHTML = "";

  datasets.forEach((dataset, index) => {
    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    legendItem.innerHTML = `
            <span class="legend-color" style="background: ${dataset.borderColor}"></span>
            <span>${dataset.label}</span>
        `;

    legendItem.addEventListener("click", () => {
      if (state.chart) {
        const meta = state.chart.getDatasetMeta(index);
        meta.hidden = !meta.hidden;
        legendItem.classList.toggle("hidden");
        state.chart.update();
      }
    });

    elements.chartLegend.appendChild(legendItem);
  });
}

// =====================================
// Data Loading
// =====================================

/**
 * Load data for current selection
 */
async function loadData(showLoadingState = true) {
  if (showLoadingState) {
    setLoading(true);
  }

  try {
    const data = await fetchCSV(state.currentCategory, state.currentMetric);

    // Check if data has changed
    const newHash = hashData(data);
    if (newHash !== state.lastDataHash) {
      state.lastDataHash = newHash;
      state.chartData = data;

      // Preserve selected ukers if they still exist, or select first 5
      const validUkers = Array.from(state.selectedUkers).filter((uker) =>
        data.ukerNames.includes(uker),
      );

      if (validUkers.length === 0) {
        // Select first 5 ukers by default
        state.selectedUkers = new Set(
          data.ukerNames.filter((u) => u).slice(0, 5),
        );
      } else {
        state.selectedUkers = new Set(validUkers);
      }

      populateUkerGrid(data.ukerNames);
      updateChartTitle();
      updateChart();
      populateMonthSelectors();
      populateComparisonUkerSelect();
      updateComparisonChart();
      updateComparisonTable();

      if (!showLoadingState) {
        showToast("Data telah diperbarui", "success");
      }
    }

    updateLastUpdateTime();
    setLoading(false);
  } catch (error) {
    setLoading(false);
    setError(`Gagal memuat data: ${error.message}`);
    console.error("Load data error:", error);
  }
}

// =====================================
// Auto Refresh
// =====================================

/**
 * Start auto refresh
 */
function startAutoRefresh() {
  const interval = parseInt(elements.refreshInterval.value);

  if (state.refreshIntervalId) {
    clearInterval(state.refreshIntervalId);
  }

  state.refreshIntervalId = setInterval(() => {
    loadData(false);
  }, interval);

  state.autoRefreshEnabled = true;
  showToast(`Auto refresh diaktifkan (${interval / 1000}s)`, "info");
}

/**
 * Stop auto refresh
 */
function stopAutoRefresh() {
  if (state.refreshIntervalId) {
    clearInterval(state.refreshIntervalId);
    state.refreshIntervalId = null;
  }

  state.autoRefreshEnabled = false;
  showToast("Auto refresh dinonaktifkan", "info");
}

// =====================================
// Event Listeners
// =====================================


// =====================================
// Kartu Kredit (CC) Chart & Table Engine
// =====================================

function updateCcComparisonChart() {
  const canvas = document.getElementById('comparisonChart');
  if (!canvas || !state.chartData) return;

  const uker = state.selectedComparisonUker || 'TOTAL KESELURUHAN';
  const ukerData = state.chartData.data[uker] || state.chartData.data['TOTAL KESELURUHAN'] || [];
  if (!ukerData || ukerData.length < 24) return;

  const isSavol = state.currentMetric === 'savol';
  const ccViewMode = elements.ccViewModeSelect ? elements.ccViewModeSelect.value : (state.ccViewMode || 'line_yoy');

  const formatCcCompact = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    if (!isSavol) return formatNumber(val, 0);
    const abs = Math.abs(val);
    if (abs >= 1e12) return (val / 1e12).toFixed(2).replace('.', ',') + ' T';
    if (abs >= 1e9) return (val / 1e9).toFixed(2).replace('.', ',') + ' M';
    if (abs >= 1e6) return (val / 1e6).toFixed(2).replace('.', ',') + ' Jt';
    return formatNumber(val, 0);
  };

  const formatCcFull = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    if (isSavol) return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(val));
    return new Intl.NumberFormat('id-ID').format(Math.round(val)) + ' user';
  };

  const activeMonths = CC_MONTH_LIST.filter((m) =>
    (state.selectedCcMonths && state.selectedCcMonths.length > 0)
      ? state.selectedCcMonths.includes(m)
      : true
  );

  const val2025 = activeMonths.map((m) => {
    const idx = CC_MONTH_LIST.indexOf(m);
    const val = ukerData[idx];
    return (val !== null && val !== undefined) ? val : null;
  });

  const val2026 = activeMonths.map((m) => {
    const idx = CC_MONTH_LIST.indexOf(m);
    const rawVal = ukerData[12 + idx];
    if (idx < 10) {
      return (rawVal !== null && rawVal !== undefined) ? rawVal : 0;
    }
    return (rawVal !== null && rawVal !== undefined && rawVal > 0) ? rawVal : null;
  });

  let chartType = 'line';
  let labels = [];
  let datasets = [];

  const color2025 = state.ccYearColors?.['2025'] || DEFAULT_CC_YEAR_COLORS['2025'];
  const color2026 = state.ccYearColors?.['2026'] || DEFAULT_CC_YEAR_COLORS['2026'];

  const selectedYear = state.ccSelectedYear || 'all';

  if (ccViewMode === 'timeline') {
    chartType = 'line';
    let timelineLabels = [];
    let timelineValues = [];

    if (selectedYear === '2025') {
      timelineLabels = activeMonths.map((m) => m.slice(0, 3) + ' 25');
      timelineValues = val2025;
    } else if (selectedYear === '2026') {
      timelineLabels = activeMonths.filter((m) => {
        const idx = CC_MONTH_LIST.indexOf(m);
        return idx < 10 || (ukerData[12 + idx] > 0);
      }).map((m) => m.slice(0, 3) + ' 26');
      timelineValues = val2026.filter((v) => v !== null);
    } else {
      timelineLabels = [
        ...activeMonths.map((m) => m.slice(0, 3) + ' 25'),
        ...activeMonths.filter((m) => {
          const idx = CC_MONTH_LIST.indexOf(m);
          return idx < 10 || (ukerData[12 + idx] > 0);
        }).map((m) => m.slice(0, 3) + ' 26'),
      ];
      timelineValues = [
        ...val2025,
        ...val2026.filter((v) => v !== null),
      ];
    }

    labels = timelineLabels;
    const tColor = selectedYear === '2026' ? color2026 : color2025;
    datasets = [{
      label: `Pencapaian ${isSavol ? 'SAVOL' : 'New User'}${selectedYear !== 'all' ? ` (Tahun ${selectedYear})` : ''}`,
      data: timelineValues,
      borderColor: tColor,
      backgroundColor: hexToRgba(tColor, 0.15),
      fill: true,
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: tColor,
    }];
  } else {
    // Default: Line Chart (2025 vs 2026 / Single Year)
    chartType = 'line';
    labels = activeMonths;

    const ds2025 = {
      label: 'Tahun 2025',
      data: val2025,
      borderColor: color2025,
      backgroundColor: hexToRgba(color2025, 0.1),
      fill: false,
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: color2025,
    };

    const ds2026 = {
      label: 'Tahun 2026',
      data: val2026,
      borderColor: color2026,
      backgroundColor: hexToRgba(color2026, 0.1),
      fill: false,
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: color2026,
      spanGaps: false,
    };

    if (selectedYear === '2025') {
      datasets = [ds2025];
    } else if (selectedYear === '2026') {
      datasets = [ds2026];
    } else {
      datasets = [ds2025, ds2026];
    }
  }

  let yearSuffix = '';
  if (selectedYear === '2025') yearSuffix = ' (Tahun 2025)';
  else if (selectedYear === '2026') yearSuffix = ' (Tahun 2026)';
  else yearSuffix = ' (2025 vs 2026)';

  const chartTitle = `Pencapaian ${isSavol ? 'Sales Volume (SAVOL)' : 'New User CC'} - ${uker}${yearSuffix}`;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 25, right: 15, bottom: 10, left: 10 }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: state.chartTitleVisibility === 'show',
        text: chartTitle,
        color: '#f8fafc',
        font: { size: 14, weight: '600' },
        padding: { top: 6, bottom: 12 }
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 12, weight: '500' },
          usePointStyle: true,
          padding: 15,
        }
      },
      datalabels: {
        display: (ctx) => {
          const val = ctx.dataset.data[ctx.dataIndex];
          return val !== null && val !== undefined && val !== 0;
        },
        anchor: 'end',
        align: 'top',
        offset: 4,
        color: '#cbd5e1',
        font: { size: 10, weight: '600' },
        formatter: (val) => formatCcCompact(val),
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const raw = context.raw;
            if (raw === null || raw === undefined) return null;
            return ` ${context.dataset.label}: ${formatCcFull(raw)}`;
          },
          afterBody: (items) => {
            if (ccViewMode !== 'timeline' && items.length >= 2) {
              const v25 = items[0].raw;
              const v26 = items[1].raw;
              if (v25 && v26) {
                const diff = v26 - v25;
                const pct = (diff / v25 * 100).toFixed(2);
                const sign = diff >= 0 ? '+' : '';
                return [
                  '------------------------------',
                  ` YoY Growth: ${sign}${formatCcFull(diff)} (${sign}${pct}%)`
                ];
              }
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value) => formatCcCompact(value),
        }
      }
    }
  };

  const bgPlugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart) => {
      const { ctx: c, width, height } = chart;
      c.save();
      c.fillStyle = '#ffffff';
      c.fillRect(0, 0, width, height);
      c.restore();
    }
  };

  if (state.comparisonChart) {
    state.comparisonChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  state.comparisonChart = new Chart(ctx, {
    type: chartType,
    data: { labels, datasets },
    options: options,
    plugins: [bgPlugin]
  });
}

function updateCcTables() {
  const avgBody = document.getElementById('avgEndingTableBody');
  const bottomBody = document.getElementById('bottomEndingTableBody');
  const table1Title = document.getElementById('tableCard1Title');
  const table2Title = document.getElementById('tableCard2Title');
  const avgHead = document.getElementById('avgEndingTableHead');
  const bottomHead = document.getElementById('bottomEndingTableHead');

  if (!avgBody || !bottomBody || !state.chartData) return;

  const isSavol = state.currentMetric === 'savol';
  const uker = state.selectedComparisonUker || 'TOTAL KESELURUHAN';
  const ukerData = state.chartData.data[uker] || state.chartData.data['TOTAL KESELURUHAN'] || [];

  const formatVal = (v) => {
    if (v === null || v === undefined || isNaN(v)) return '-';
    if (isSavol) return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(v));
    return new Intl.NumberFormat('id-ID').format(Math.round(v));
  };

  const selectedYear = state.ccSelectedYear || 'all';

  const activeMonths = CC_MONTH_LIST.filter((m) =>
    (state.selectedCcMonths && state.selectedCcMonths.length > 0)
      ? state.selectedCcMonths.includes(m)
      : (CC_MONTH_LIST.indexOf(m) < 10)
  );

  let totalLabel = `TOTAL (${activeMonths.length} Bulan)`;
  if (activeMonths.length === 10 && activeMonths[0] === 'Januari' && activeMonths[9] === 'Oktober') {
    totalLabel = 'TOTAL YTD (Jan - Okt)';
  } else if (activeMonths.length === 12) {
    totalLabel = 'TOTAL TAHUNAN (Jan - Des)';
  } else if (activeMonths.length === 1) {
    totalLabel = `TOTAL (${activeMonths[0]})`;
  }

  // 1. Table 1: Rekap Bulanan
  if (selectedYear === '2025') {
    if (table1Title) table1Title.textContent = `📊 Rekap Bulanan Tahun 2025 (${uker})`;
    if (avgHead) {
      avgHead.innerHTML = `
        <tr>
          <th style="text-align: left;">Bulan</th>
          <th style="text-align: right;">Pencapaian 2025</th>
          <th style="text-align: center; width: 120px;">% Kontribusi</th>
        </tr>
      `;
    }

    let sum2025All = 0;
    activeMonths.forEach((m) => {
      const idx = CC_MONTH_LIST.indexOf(m);
      sum2025All += (ukerData[idx] || 0);
    });

    let table1RowsHtml = '';
    activeMonths.forEach((month) => {
      const idx = CC_MONTH_LIST.indexOf(month);
      const v25 = ukerData[idx] || 0;
      const share = sum2025All > 0 ? (v25 / sum2025All * 100) : 0;

      table1RowsHtml += `
        <tr>
          <td class="uker-name"><strong>${month}</strong></td>
          <td style="text-align: right; font-variant-numeric: tabular-nums;">${formatVal(v25)}</td>
          <td style="text-align: center;"><span class="status-badge up">${share.toFixed(2)}%</span></td>
        </tr>
      `;
    });

    table1RowsHtml += `
      <tr style="background: rgba(59, 130, 246, 0.08); font-weight: 700; border-top: 2px solid rgba(255, 255, 255, 0.15);">
        <td><strong>${totalLabel}</strong></td>
        <td style="text-align: right; font-variant-numeric: tabular-nums; color:#3b82f6;"><strong>${formatVal(sum2025All)}</strong></td>
        <td style="text-align: center;"><span class="status-badge up">100.00%</span></td>
      </tr>
    `;
    avgBody.innerHTML = table1RowsHtml;

  } else if (selectedYear === '2026') {
    if (table1Title) table1Title.textContent = `📊 Rekap Bulanan Tahun 2026 (${uker})`;
    if (avgHead) {
      avgHead.innerHTML = `
        <tr>
          <th style="text-align: left;">Bulan</th>
          <th style="text-align: right;">Pencapaian 2026</th>
          <th style="text-align: right;">Pencapaian 2025 (Ref)</th>
          <th style="text-align: right;">Growth YoY</th>
          <th style="text-align: center; width: 95px;">% Growth</th>
          <th style="text-align: center; width: 75px;">Status</th>
        </tr>
      `;
    }

    let sum2025 = 0;
    let sum2026 = 0;

    let table1RowsHtml = '';
    activeMonths.forEach((month) => {
      const idx = CC_MONTH_LIST.indexOf(month);
      const v25 = ukerData[idx] || 0;
      const v26Raw = ukerData[12 + idx];
      const hasV26 = (idx < 10) || (v26Raw !== null && v26Raw !== undefined && v26Raw > 0);
      const v26 = hasV26 ? (v26Raw || 0) : null;

      sum2025 += v25;
      if (v26 !== null) sum2026 += v26;

      let diff = null;
      let pct = 0;
      let isUp = true;
      let sign = '';

      if (v26 !== null) {
        diff = v26 - v25;
        pct = v25 > 0 ? (diff / v25 * 100) : 0;
        isUp = diff >= 0;
        sign = isUp ? '+' : '';
      }

      const badgeClass = isUp ? 'status-badge up' : 'status-badge down';
      const badgeIcon = isUp ? '▲' : '▼';
      const statusText = (v26 === null)
        ? '<span style="color:#94a3b8;">-</span>'
        : (isUp
          ? '<span style="color:#10b981;font-weight:600;">Naik</span>'
          : '<span style="color:#ef4444;font-weight:600;">Turun</span>');

      table1RowsHtml += `
        <tr>
          <td class="uker-name"><strong>${month}</strong></td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; font-weight:600; color:#10b981;">${v26 !== null ? formatVal(v26) : '-'}</td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; color:#94a3b8;">${formatVal(v25)}</td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; color:${v26 !== null ? (isUp ? '#10b981' : '#ef4444') : '#94a3b8'}; font-weight:600;">${v26 !== null ? `${sign}${formatVal(diff)}` : '-'}</td>
          <td style="text-align: center;">${v26 !== null ? `<span class="${badgeClass}">${badgeIcon} ${sign}${pct.toFixed(2)}%</span>` : '-'}</td>
          <td style="text-align: center;">${statusText}</td>
        </tr>
      `;
    });

    const totalDiff = sum2026 - sum2025;
    const totalPct = sum2025 > 0 ? (totalDiff / sum2025 * 100) : 0;
    const totalUp = totalDiff >= 0;
    const totalSign = totalUp ? '+' : '';

    table1RowsHtml += `
      <tr style="background: rgba(16, 185, 129, 0.08); font-weight: 700; border-top: 2px solid rgba(255, 255, 255, 0.15);">
        <td><strong>${totalLabel}</strong></td>
        <td style="text-align: right; font-variant-numeric: tabular-nums; color:#10b981;"><strong>${formatVal(sum2026)}</strong></td>
        <td style="text-align: right; font-variant-numeric: tabular-nums; color:#94a3b8;"><strong>${formatVal(sum2025)}</strong></td>
        <td style="text-align: right; font-variant-numeric: tabular-nums; color:${totalUp ? '#10b981' : '#ef4444'}; font-weight:700;"><strong>${totalSign}${formatVal(totalDiff)}</strong></td>
        <td style="text-align: center;"><span class="status-badge ${totalUp ? 'up' : 'down'}">${totalUp ? '▲' : '▼'} ${totalSign}${totalPct.toFixed(2)}%</span></td>
        <td style="text-align: center;"><strong>${totalUp ? 'Naik' : 'Turun'}</strong></td>
      </tr>
    `;
    avgBody.innerHTML = table1RowsHtml;

  } else {
    // Both: 2025 vs 2026
    if (table1Title) table1Title.textContent = `📊 Rekap Bulanan 2025 vs 2026 (${uker})`;
    if (avgHead) {
      avgHead.innerHTML = `
        <tr>
          <th style="text-align: left;">Bulan</th>
          <th style="text-align: right;">Pencapaian 2025</th>
          <th style="text-align: right;">Pencapaian 2026</th>
          <th style="text-align: right;">Growth YoY</th>
          <th style="text-align: center; width: 95px;">% Growth</th>
          <th style="text-align: center; width: 75px;">Status</th>
        </tr>
      `;
    }

    let sum2025 = 0;
    let sum2026 = 0;

    let table1RowsHtml = '';
    activeMonths.forEach((month) => {
      const idx = CC_MONTH_LIST.indexOf(month);
      const v25 = ukerData[idx] || 0;
      const v26Raw = ukerData[12 + idx];
      const hasV26 = (idx < 10) || (v26Raw !== null && v26Raw !== undefined && v26Raw > 0);
      const v26 = hasV26 ? (v26Raw || 0) : null;

      sum2025 += v25;
      if (v26 !== null) sum2026 += v26;

      let diff = null;
      let pct = 0;
      let isUp = true;
      let sign = '';

      if (v26 !== null) {
        diff = v26 - v25;
        pct = v25 > 0 ? (diff / v25 * 100) : 0;
        isUp = diff >= 0;
        sign = isUp ? '+' : '';
      }

      const badgeClass = isUp ? 'status-badge up' : 'status-badge down';
      const badgeIcon = isUp ? '▲' : '▼';
      const statusText = (v26 === null)
        ? '<span style="color:#94a3b8;">-</span>'
        : (isUp
          ? '<span style="color:#10b981;font-weight:600;">Naik</span>'
          : '<span style="color:#ef4444;font-weight:600;">Turun</span>');

      table1RowsHtml += `
        <tr>
          <td class="uker-name"><strong>${month}</strong></td>
          <td style="text-align: right; font-variant-numeric: tabular-nums;">${formatVal(v25)}</td>
          <td style="text-align: right; font-variant-numeric: tabular-nums;">${v26 !== null ? formatVal(v26) : '-'}</td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; color:${v26 !== null ? (isUp ? '#10b981' : '#ef4444') : '#94a3b8'}; font-weight:600;">${v26 !== null ? `${sign}${formatVal(diff)}` : '-'}</td>
          <td style="text-align: center;">${v26 !== null ? `<span class="${badgeClass}">${badgeIcon} ${sign}${pct.toFixed(2)}%</span>` : '-'}</td>
          <td style="text-align: center;">${statusText}</td>
        </tr>
      `;
    });

    const totalDiff = sum2026 - sum2025;
    const totalPct = sum2025 > 0 ? (totalDiff / sum2025 * 100) : 0;
    const totalUp = totalDiff >= 0;
    const totalSign = totalUp ? '+' : '';

    table1RowsHtml += `
      <tr style="background: rgba(59, 130, 246, 0.08); font-weight: 700; border-top: 2px solid rgba(255, 255, 255, 0.15);">
        <td><strong>${totalLabel}</strong></td>
        <td style="text-align: right; font-variant-numeric: tabular-nums;"><strong>${formatVal(sum2025)}</strong></td>
        <td style="text-align: right; font-variant-numeric: tabular-nums;"><strong>${formatVal(sum2026)}</strong></td>
        <td style="text-align: right; font-variant-numeric: tabular-nums; color:${totalUp ? '#10b981' : '#ef4444'}; font-weight:700;"><strong>${totalSign}${formatVal(totalDiff)}</strong></td>
        <td style="text-align: center;"><span class="status-badge ${totalUp ? 'up' : 'down'}">${totalUp ? '▲' : '▼'} ${totalSign}${totalPct.toFixed(2)}%</span></td>
        <td style="text-align: center;"><strong>${totalUp ? 'Naik' : 'Turun'}</strong></td>
      </tr>
    `;
    avgBody.innerHTML = table1RowsHtml;
  }

  // 2. Table 2: Ranking Kanca
  let rankingSubtitle = `${activeMonths.length} Bulan`;
  if (activeMonths.length === 10 && activeMonths[0] === 'Januari' && activeMonths[9] === 'Oktober') {
    rankingSubtitle = 'YTD';
  } else if (activeMonths.length === 12) {
    rankingSubtitle = 'Tahunan';
  } else if (activeMonths.length === 1) {
    rankingSubtitle = activeMonths[0];
  }

  const allBranches = getFilteredUkersForArea(state.chartData.ukerNames).filter(
    (name) => name && !name.toLowerCase().startsWith('total') && name.toLowerCase() !== 'ro'
  );

  if (selectedYear === '2025') {
    if (table2Title) table2Title.textContent = `🏆 Ranking Kanca - Top Pencapaian Tahun 2025 (${isSavol ? 'SAVOL' : 'New User'} ${rankingSubtitle})`;
    if (bottomHead) {
      bottomHead.innerHTML = `
        <tr>
          <th style="width: 60px; text-align: center;">Rank</th>
          <th style="text-align: left;">Unit Kerja</th>
          <th style="text-align: right;">Total Pencapaian 2025</th>
          <th style="text-align: center; width: 110px;">% Kontribusi</th>
        </tr>
      `;
    }

    const branchRankings25 = allBranches.map((name) => {
      const bData = state.chartData.data[name] || [];
      let bSum25 = 0;
      activeMonths.forEach((m) => {
        const idx = CC_MONTH_LIST.indexOf(m);
        bSum25 += bData[idx] || 0;
      });
      return { name, sum25: bSum25 };
    });

    branchRankings25.sort((a, b) => b.sum25 - a.sum25);
    const grandSum25 = branchRankings25.reduce((acc, b) => acc + b.sum25, 0);

    let table2RowsHtml = '';
    branchRankings25.forEach((b, idx) => {
      const rank = idx + 1;
      let rankBadge = `<span class="rank-badge">${rank}</span>`;
      if (rank === 1) rankBadge = `<span class="rank-badge rank-1" title="Top 1 Pencapaian 2025">🥇 1</span>`;
      else if (rank === 2) rankBadge = `<span class="rank-badge rank-2" title="Top 2 Pencapaian 2025">🥈 2</span>`;
      else if (rank === 3) rankBadge = `<span class="rank-badge rank-3" title="Top 3 Pencapaian 2025">🥉 3</span>`;

      const share = grandSum25 > 0 ? (b.sum25 / grandSum25 * 100) : 0;

      table2RowsHtml += `
        <tr>
          <td style="text-align: center;">${rankBadge}</td>
          <td class="uker-name"><strong>${b.name}</strong></td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; font-weight:600; color:#3b82f6;">${formatVal(b.sum25)}</td>
          <td style="text-align: center;"><span class="status-badge up">${share.toFixed(2)}%</span></td>
        </tr>
      `;
    });

    bottomBody.innerHTML = table2RowsHtml || '<tr><td colspan="4" class="table-placeholder">Tidak ada cabang untuk diranking.</td></tr>';

  } else if (selectedYear === '2026') {
    if (table2Title) table2Title.textContent = `🏆 Ranking Kanca - Top YoY Growth Tahun 2026 (${isSavol ? 'SAVOL' : 'New User'} ${rankingSubtitle})`;
    if (bottomHead) {
      bottomHead.innerHTML = `
        <tr>
          <th style="width: 60px; text-align: center;">Rank</th>
          <th style="text-align: left;">Unit Kerja</th>
          <th style="text-align: right;">Total 2026</th>
          <th style="text-align: right;">Total 2025 (Ref)</th>
          <th style="text-align: right;">Growth YoY</th>
          <th style="text-align: center; width: 105px;">% Growth</th>
        </tr>
      `;
    }

    const branchRankings = allBranches.map((name) => {
      const bData = state.chartData.data[name] || [];
      let bSum25 = 0;
      let bSum26 = 0;

      activeMonths.forEach((m) => {
        const idx = CC_MONTH_LIST.indexOf(m);
        bSum25 += bData[idx] || 0;
        bSum26 += bData[12 + idx] || 0;
      });

      const bDiff = bSum26 - bSum25;
      const bPct = bSum25 > 0 ? (bDiff / bSum25 * 100) : 0;
      return { name, sum25: bSum25, sum26: bSum26, diff: bDiff, pct: bPct };
    });

    branchRankings.sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return b.diff - a.diff;
    });

    let table2RowsHtml = '';
    branchRankings.forEach((b, idx) => {
      const rank = idx + 1;
      let rankBadge = `<span class="rank-badge">${rank}</span>`;
      if (rank === 1) rankBadge = `<span class="rank-badge rank-1" title="Top 1 Pertumbuhan YoY">🥇 1</span>`;
      else if (rank === 2) rankBadge = `<span class="rank-badge rank-2" title="Top 2 Pertumbuhan YoY">🥈 2</span>`;
      else if (rank === 3) rankBadge = `<span class="rank-badge rank-3" title="Top 3 Pertumbuhan YoY">🥉 3</span>`;

      const isUp = b.diff >= 0;
      const sign = isUp ? '+' : '';
      const badgeClass = isUp ? 'status-badge up' : 'status-badge down';

      table2RowsHtml += `
        <tr>
          <td style="text-align: center;">${rankBadge}</td>
          <td class="uker-name"><strong>${b.name}</strong></td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; font-weight:600; color:#10b981;">${formatVal(b.sum26)}</td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; color:#94a3b8;">${formatVal(b.sum25)}</td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; color:${isUp ? '#10b981' : '#ef4444'}; font-weight:600;">${sign}${formatVal(b.diff)}</td>
          <td style="text-align: center;"><span class="${badgeClass}">${isUp ? '▲' : '▼'} ${sign}${b.pct.toFixed(2)}%</span></td>
        </tr>
      `;
    });

    bottomBody.innerHTML = table2RowsHtml || '<tr><td colspan="6" class="table-placeholder">Tidak ada cabang untuk diranking.</td></tr>';

  } else {
    // Both 2025 vs 2026
    if (table2Title) table2Title.textContent = `🏆 Ranking Kanca - Top YoY Growth (${isSavol ? 'SAVOL' : 'New User'} ${rankingSubtitle})`;
    if (bottomHead) {
      bottomHead.innerHTML = `
        <tr>
          <th style="width: 60px; text-align: center;">Rank</th>
          <th style="text-align: left;">Unit Kerja</th>
          <th style="text-align: right;">Total 2025</th>
          <th style="text-align: right;">Total 2026</th>
          <th style="text-align: right;">Growth YoY</th>
          <th style="text-align: center; width: 105px;">% Growth</th>
        </tr>
      `;
    }

    const branchRankings = allBranches.map((name) => {
      const bData = state.chartData.data[name] || [];
      let bSum25 = 0;
      let bSum26 = 0;

      activeMonths.forEach((m) => {
        const idx = CC_MONTH_LIST.indexOf(m);
        bSum25 += bData[idx] || 0;
        bSum26 += bData[12 + idx] || 0;
      });

      const bDiff = bSum26 - bSum25;
      const bPct = bSum25 > 0 ? (bDiff / bSum25 * 100) : 0;
      return { name, sum25: bSum25, sum26: bSum26, diff: bDiff, pct: bPct };
    });

    branchRankings.sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return b.diff - a.diff;
    });

    let table2RowsHtml = '';
    branchRankings.forEach((b, idx) => {
      const rank = idx + 1;
      let rankBadge = `<span class="rank-badge">${rank}</span>`;
      if (rank === 1) rankBadge = `<span class="rank-badge rank-1" title="Top 1 Pertumbuhan YoY">🥇 1</span>`;
      else if (rank === 2) rankBadge = `<span class="rank-badge rank-2" title="Top 2 Pertumbuhan YoY">🥈 2</span>`;
      else if (rank === 3) rankBadge = `<span class="rank-badge rank-3" title="Top 3 Pertumbuhan YoY">🥉 3</span>`;

      const isUp = b.diff >= 0;
      const sign = isUp ? '+' : '';
      const badgeClass = isUp ? 'status-badge up' : 'status-badge down';

      table2RowsHtml += `
        <tr>
          <td style="text-align: center;">${rankBadge}</td>
          <td class="uker-name"><strong>${b.name}</strong></td>
          <td style="text-align: right; font-variant-numeric: tabular-nums;">${formatVal(b.sum25)}</td>
          <td style="text-align: right; font-variant-numeric: tabular-nums;"><strong>${formatVal(b.sum26)}</strong></td>
          <td style="text-align: right; font-variant-numeric: tabular-nums; color:${isUp ? '#10b981' : '#ef4444'}; font-weight:600;">${sign}${formatVal(b.diff)}</td>
          <td style="text-align: center;"><span class="${badgeClass}">${isUp ? '▲' : '▼'} ${sign}${b.pct.toFixed(2)}%</span></td>
        </tr>
      `;
    });

    bottomBody.innerHTML = table2RowsHtml || '<tr><td colspan="6" class="table-placeholder">Tidak ada cabang untuk diranking.</td></tr>';
  }
}

function initEventListeners() {
  initCcManualModal();
  // Mode switcher tabs (DPK vs CC)
  if (elements.modeDpkBtn) {
    elements.modeDpkBtn.addEventListener('click', () => {
      if (state.userRole === 'cc') return; // User CC dilarang akses DPK
      if (state.currentCategory === 'cc') {
        elements.categorySelect.value = 'konsol';
        state.currentCategory = 'konsol';
        state.selectedUkers.clear();
        state.lastDataHash = null;
        syncModeUI();
        loadData();
      }
    });
  }

  if (elements.modeCcBtn) {
    elements.modeCcBtn.addEventListener('click', () => {
      if (state.currentCategory !== 'cc') {
        elements.categorySelect.value = 'cc';
        state.currentCategory = 'cc';
        state.selectedUkers.clear();
        state.lastDataHash = null;
        syncModeUI();
        loadData();
      }
    });
  }

  if (elements.ccYearSelect) {
    elements.ccYearSelect.addEventListener('change', (e) => {
      setCcSelectedYear(e.target.value);
    });
  }

  if (elements.ccViewModeSelect) {
    elements.ccViewModeSelect.addEventListener('change', (e) => {
      state.ccViewMode = e.target.value;
      if (state.currentCategory === 'cc') {
        updateComparisonChart();
      }
    });
  }

  // Category change
  elements.categorySelect.addEventListener("change", (e) => {
    if (state.userRole === 'cc') {
      state.currentCategory = 'cc';
      elements.categorySelect.value = 'cc';
      return;
    }
    state.currentCategory = e.target.value;
    state.selectedUkers.clear();
    state.lastDataHash = null;
    syncModeUI();
    loadData();
  });

  // Metric change
  elements.metricSelect.addEventListener("change", (e) => {
    state.currentMetric = e.target.value;
    state.lastDataHash = null;
    loadData();
  });

  // Area change
  if (elements.areaSelect) {
    elements.areaSelect.addEventListener("change", (e) => {
      state.currentArea = e.target.value;
      state.selectedUkers.clear();
      if (state.chartData) {
        populateUkerGrid(state.chartData.ukerNames);
        // Select first 5 filtered ukers by default
        const first5 = state.filteredUkers.filter(u => u).slice(0, 5);
        first5.forEach(uker => state.selectedUkers.add(uker));
        document.querySelectorAll(".uker-checkbox").forEach((checkbox) => {
          if (first5.includes(checkbox.value)) {
            checkbox.checked = true;
            checkbox.closest(".uker-item").classList.add("selected");
          }
        });
        updateChart();
        // Update comparison section with area filter
        populateComparisonUkerSelect();
        updateComparisonChart();
        updateComparisonTable();
      }
    });
  }

  // Auto refresh toggle
  elements.autoRefreshToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  });

  // Refresh interval change
  elements.refreshInterval.addEventListener("change", () => {
    if (state.autoRefreshEnabled) {
      startAutoRefresh(); // Restart with new interval
    }
  });

  // Manual refresh
  elements.refreshBtn.addEventListener("click", () => {
    loadData();
  });

  // Date label mode on comparison chart
  if (elements.dateLabelModeSelect) {
    elements.dateLabelModeSelect.addEventListener("change", (e) => {
      state.dateLabelMode = e.target.value;
      updateComparisonChart();
    });
  }

  // Chart title visibility on comparison chart
  if (elements.chartTitleVisibilitySelect) {
    elements.chartTitleVisibilitySelect.addEventListener("change", (e) => {
      state.chartTitleVisibility = e.target.value;
      updateComparisonChart();
    });
  }

  if (elements.generateTablePhotoBtn) {
    elements.generateTablePhotoBtn.addEventListener('click', generateComparisonTablePhoto);
  }

  // Select all
  if (elements.selectAllBtn) {
    elements.selectAllBtn.addEventListener("click", selectAllUkers);
  }

  // Deselect all
  if (elements.deselectAllBtn) {
    elements.deselectAllBtn.addEventListener("click", deselectAllUkers);
  }
}

// =====================================
// Monthly Comparison
// =====================================

/**
 * Get available months from chart data (chronologically ordered)
 */
function getAvailableMonths() {
  if (!state.chartData) return [];
  
  // Define month order for chronological sorting
  const monthOrder = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const monthKeywordMap = {
    'jan': 'Januari',
    'feb': 'Februari',
    'mar': 'Maret',
    'apr': 'April',
    'may': 'Mei',
    'mei': 'Mei',
    'jun': 'Juni',
    'jul': 'Juli',
    'aug': 'Agustus',
    'sep': 'September',
    'oct': 'Oktober',
    'okt': 'Oktober',
    'nov': 'November',
    'dec': 'Desember',
    'des': 'Desember',
  };
  
  const months = new Set();
  state.chartData.dates.forEach(date => {
    const dateLower = date.toLowerCase();
    for (const [keyword, monthName] of Object.entries(monthKeywordMap)) {
      if (dateLower.includes(keyword)) {
        months.add(monthName);
        break;
      }
    }
  });
  
  // Sort chronologically
  return Array.from(months).sort((a, b) => {
    const yearA = a === 'Desember' ? 2025 : 2026;
    const yearB = b === 'Desember' ? 2025 : 2026;
    if (yearA !== yearB) return yearA - yearB;
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  });
}

/**
 * Calculate monthly comparison data (filtered by area)
 */
function calculateMonthlyComparison() {
  if (!state.chartData || !state.selectedMonths || state.selectedMonths.length < 2) return null;

  const { dates, data, ukerNames } = state.chartData;
  const firstMonth = state.selectedMonths[0];
  const lastMonth = state.selectedMonths[state.selectedMonths.length - 1];
  
  // Filter by area if selected
  const filteredUkers = getFilteredUkersForArea(ukerNames);

  const month1Keywords = getMonthKeywords(firstMonth);
  const month2Keywords = getMonthKeywords(lastMonth);
  
  // Separate data by selected months
  const month1Indices = [];
  const month2Indices = [];
  
  dates.forEach((date, index) => {
    const dateLower = date.toLowerCase();
    if (month1Keywords.some(kw => dateLower.includes(kw))) {
      month1Indices.push(index);
    } else if (month2Keywords.some(kw => dateLower.includes(kw))) {
      month2Indices.push(index);
    }
  });
  
  if (month1Indices.length === 0 || month2Indices.length === 0) {
    return null;
  }
  
  const comparisonData = [];
  
  filteredUkers.forEach(uker => {
    if (!uker || !data[uker]) return;
    
    const ukerData = data[uker];
    
    // Calculate month 1 average
    const month1Values = month1Indices
      .map(i => ukerData[i])
      .filter(v => v && v > 0);
    const month1Avg = month1Values.length > 0 
      ? month1Values.reduce((a, b) => a + b, 0) / month1Values.length 
      : 0;
    
    // Calculate month 2 average
    const month2Values = month2Indices
      .map(i => ukerData[i])
      .filter(v => v && v > 0);
    const month2Avg = month2Values.length > 0 
      ? month2Values.reduce((a, b) => a + b, 0) / month2Values.length 
      : 0;
    
    // Calculate change
    const difference = month2Avg - month1Avg;
    const percentChange = month1Avg !== 0 ? ((month2Avg - month1Avg) / month1Avg) * 100 : 0;
    
    comparisonData.push({
      uker,
      month1Avg,
      month2Avg,
      difference,
      percentChange
    });
  });
  
  // Sort by percent change (descending)
  comparisonData.sort((a, b) => b.percentChange - a.percentChange);
  
  return comparisonData;
}

/**
 * Get monthly data for a specific unit kerja
 */
function getMonthlyDataForUker(uker) {
  if (!state.chartData || !state.selectedMonths || state.selectedMonths.length === 0) return null;
  
  const { dates, data } = state.chartData;
  const filteredUkers = getFilteredUkersForArea(state.chartData.ukerNames);

  if (uker !== ALL_BRANCHES_VALUE && !data[uker]) return null;

  const monthDataMap = {};
  state.selectedMonths.forEach((month) => {
    monthDataMap[month] = [];
  });
  
  dates.forEach((date, index) => {
    const dateLower = date.toLowerCase();
    // Extract day number from date (e.g., "01-Dec" -> 1)
    const dayMatch = date.match(/^(\d+)/);
    const day = dayMatch ? parseInt(dayMatch[1]) : index + 1;
    
    let value = 0;
    if (uker === ALL_BRANCHES_VALUE) {
      value = Math.round(filteredUkers.reduce((sum, name) => sum + (data[name]?.[index] || 0), 0));
    } else {
      value = data[uker][index] || 0;
    }

    for (const month of state.selectedMonths) {
      const keywords = getMonthKeywords(month);
      if (keywords.some((kw) => dateLower.includes(kw))) {
        monthDataMap[month].push({ day, value });
        break;
      }
    }
  });
  
  return monthDataMap;
}

/**
 * Populate comparison unit kerja selector (filtered by area)
 */
function populateComparisonUkerSelect() {
  const select = document.getElementById('comparisonUkerSelect');
  if (!select || !state.chartData) return;
  
  select.innerHTML = '';
  const isCc = state.currentCategory === 'cc';

  if (isCc) {
    const allNames = state.chartData.ukerNames.filter((u) => u);
    let eligibleUkers = [];

    if (state.currentArea === 'all') {
      const totals = ['TOTAL KESELURUHAN', 'RO', 'TOTAL AREA 1', 'TOTAL AREA 2', 'TOTAL AREA 3', 'TOTAL AREA 4', 'TOTAL AREA 5'];
      const branches = allNames.filter((n) => !totals.includes(n));
      eligibleUkers = [...totals.filter((t) => allNames.includes(t)), ...branches];
    } else {
      const areaTotalName = `TOTAL AREA ${state.currentArea}`;
      const areaBranches = getFilteredUkersForArea(allNames).filter(
        (n) => !n.toLowerCase().startsWith('total') && n.toLowerCase() !== 'ro'
      );
      eligibleUkers = [areaTotalName, ...areaBranches];
    }

    eligibleUkers.forEach((uker) => {
      const option = document.createElement('option');
      option.value = uker;
      option.textContent = uker;
      select.appendChild(option);
    });

    if (!state.selectedComparisonUker || !eligibleUkers.includes(state.selectedComparisonUker)) {
      state.selectedComparisonUker = eligibleUkers[0] || 'TOTAL KESELURUHAN';
    }
    select.value = state.selectedComparisonUker;
  } else {
    const filteredUkers = getFilteredUkersForArea(state.chartData.ukerNames);

    const allOption = document.createElement('option');
    allOption.value = ALL_BRANCHES_VALUE;
    allOption.textContent = 'Semua Cabang (Gabungan)';
    select.appendChild(allOption);
    
    filteredUkers.forEach(uker => {
      if (!uker) return;
      const option = document.createElement('option');
      option.value = uker;
      option.textContent = uker;
      select.appendChild(option);
    });
    
    if (filteredUkers.length > 0) {
      if (!state.selectedComparisonUker || (state.selectedComparisonUker !== ALL_BRANCHES_VALUE && !filteredUkers.includes(state.selectedComparisonUker))) {
        state.selectedComparisonUker = ALL_BRANCHES_VALUE;
      }
      select.value = state.selectedComparisonUker;
    } else {
      state.selectedComparisonUker = null;
    }
  }
  
  const newSelect = select.cloneNode(true);
  select.parentNode.replaceChild(newSelect, select);
  newSelect.addEventListener('change', (e) => {
    state.selectedComparisonUker = e.target.value;
    updateComparisonChart();
    updateComparisonTable();
  });
}

/**
 * Populate month selectors
 */
function populateMonthSelectors() {
  const monthChips = document.getElementById('monthChips');
  const monthSelectionHint = document.getElementById('monthSelectionHint');
  
  if (!monthChips) return;
  
  const isCc = state.currentCategory === 'cc';
  const monthSelectorLabel = document.getElementById('monthSelectorLabel') || document.querySelector('.month-chip-group label');
  if (monthSelectorLabel) {
    monthSelectorLabel.textContent = isCc ? 'Pilih Bulan (Perbandingan CC):' : 'Pilih Bulan (bisa lebih dari 2):';
  }

  let monthColorControls = document.getElementById('monthColorControls');
  if (!monthColorControls) {
    monthColorControls = document.createElement('div');
    monthColorControls.id = 'monthColorControls';
    monthColorControls.setAttribute('aria-label', 'Atur warna grafik');
    Object.assign(monthColorControls.style, {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '0.35rem',
    });
    monthChips.insertAdjacentElement('afterend', monthColorControls);
  }

  if (isCc) {
    populateCcMonthSelectors(monthChips, monthSelectionHint, monthColorControls);
    return;
  }

  // Remove CC year pills if switching back to DPK
  const ccYearPills = document.getElementById('ccYearPills');
  if (ccYearPills) {
    ccYearPills.remove();
  }

  // --- DPK Mode ---
  const availableMonths = getAvailableMonths();
  monthChips.innerHTML = '';
  
  if (!state.selectedMonths || state.selectedMonths.length === 0) {
    state.selectedMonths = availableMonths.slice(Math.max(availableMonths.length - 4, 0));
  }

  const updateHint = () => {
    if (!monthSelectionHint) return;
    monthSelectionHint.textContent = `${state.selectedMonths.length} bulan dipilih`;
  };

  const renderColorControls = () => {
    monthColorControls.replaceChildren();

    const title = document.createElement('span');
    title.textContent = 'Warna grafik:';
    Object.assign(title.style, {
      color: 'var(--text-secondary)',
      fontSize: '0.78rem',
      fontWeight: '600',
    });
    monthColorControls.appendChild(title);

    state.selectedMonths.forEach((month) => {
      const colorLabel = document.createElement('label');
      colorLabel.title = `Ubah warna ${month}`;
      Object.assign(colorLabel.style, {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        color: 'var(--text-secondary)',
        fontSize: '0.78rem',
        cursor: 'pointer',
      });

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = state.monthColors[month] || DEFAULT_MONTH_COLORS[month];
      colorInput.setAttribute('aria-label', `Warna ${month}`);
      Object.assign(colorInput.style, {
        width: '1.75rem',
        height: '1.75rem',
        padding: '1px',
        border: '1px solid var(--border-color)',
        borderRadius: '0.4rem',
        background: 'transparent',
        cursor: 'pointer',
      });

      colorInput.addEventListener('input', (event) => {
        state.monthColors[month] = event.target.value;
        saveMonthColors();
        updateComparisonChart();
      });

      const monthName = document.createElement('span');
      monthName.textContent = month;
      colorLabel.append(colorInput, monthName);
      monthColorControls.appendChild(colorLabel);
    });

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = 'Reset warna';
    resetButton.title = 'Kembalikan semua warna ke pengaturan awal';
    Object.assign(resetButton.style, {
      border: '1px solid var(--border-color)',
      borderRadius: '0.4rem',
      padding: '0.3rem 0.55rem',
      background: 'rgba(148, 163, 184, 0.12)',
      color: 'var(--text-secondary)',
      fontSize: '0.75rem',
      cursor: 'pointer',
    });
    resetButton.addEventListener('click', () => {
      state.monthColors = { ...DEFAULT_MONTH_COLORS };
      saveMonthColors();
      renderColorControls();
      updateComparisonChart();
    });
    monthColorControls.appendChild(resetButton);
  };

  const renderChips = () => {
    monthChips.innerHTML = '';
    availableMonths.forEach((month) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `month-chip ${state.selectedMonths.includes(month) ? 'active' : ''}`;
      chip.textContent = month;
      chip.setAttribute('aria-pressed', state.selectedMonths.includes(month) ? 'true' : 'false');

      chip.addEventListener('click', () => {
        if (state.selectedMonths.includes(month)) {
          if (state.selectedMonths.length === 1) return;
          state.selectedMonths = state.selectedMonths.filter((m) => m !== month);
        } else {
          state.selectedMonths = availableMonths.filter((m) => state.selectedMonths.includes(m) || m === month);
        }

        renderChips();
        updateComparisonChart();
        updateComparisonTable();
      });

      monthChips.appendChild(chip);
    });

    renderColorControls();
    updateHint();
  };

  if (state.selectedMonths.length === 0 && availableMonths.length > 0) {
    state.selectedMonths = [availableMonths[availableMonths.length - 1]];
  }

  renderChips();
}

/**
 * Populate month selectors specifically for Credit Card (CC)
 */
function populateCcMonthSelectors(monthChips, monthSelectionHint, monthColorControls) {
  if (!state.selectedCcMonths || state.selectedCcMonths.length === 0) {
    state.selectedCcMonths = [...CC_MONTH_LIST];
  }

  // 1. Year Filter Pills (Semua, 2026, 2025)
  let ccYearPills = document.getElementById('ccYearPills');
  if (!ccYearPills) {
    ccYearPills = document.createElement('div');
    ccYearPills.id = 'ccYearPills';
    ccYearPills.className = 'cc-year-pills';
    Object.assign(ccYearPills.style, {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.45rem',
      marginBottom: '0.55rem',
    });
    monthChips.insertAdjacentElement('beforebegin', ccYearPills);
  }

  const renderYearPills = () => {
    ccYearPills.replaceChildren();

    const label = document.createElement('span');
    label.textContent = 'Pilih Tahun:';
    Object.assign(label.style, {
      color: 'var(--text-secondary)',
      fontSize: '0.82rem',
      fontWeight: '600',
      marginRight: '0.2rem',
    });
    ccYearPills.appendChild(label);

    const yearOptions = [
      { key: 'all', label: 'Semua (2025 vs 2026)' },
      { key: '2026', label: 'Tahun 2026 Saja' },
      { key: '2025', label: 'Tahun 2025 Saja' },
    ];

    yearOptions.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = (state.ccSelectedYear || 'all') === opt.key;
      btn.className = `month-chip ${isActive ? 'active' : ''}`;
      btn.textContent = opt.label;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.addEventListener('click', () => {
        setCcSelectedYear(opt.key);
      });
      ccYearPills.appendChild(btn);
    });
  };

  renderYearPills();

  const updateHint = () => {
    if (!monthSelectionHint) return;
    const yearText = state.ccSelectedYear === '2026'
      ? ' (Tahun 2026)'
      : (state.ccSelectedYear === '2025' ? ' (Tahun 2025)' : ' (2025 vs 2026)');
    monthSelectionHint.textContent = `${state.selectedCcMonths.length} bulan dipilih${yearText}`;
  };

  const renderCcColorControls = () => {
    monthColorControls.replaceChildren();

    const title = document.createElement('span');
    title.textContent = 'Warna grafik:';
    Object.assign(title.style, {
      color: 'var(--text-secondary)',
      fontSize: '0.78rem',
      fontWeight: '600',
    });
    monthColorControls.appendChild(title);

    const activeYears = (state.ccSelectedYear === '2025' || state.ccSelectedYear === '2026')
      ? [state.ccSelectedYear]
      : ['2025', '2026'];

    activeYears.forEach((year) => {
      const colorLabel = document.createElement('label');
      colorLabel.title = `Ubah warna garis Tahun ${year}`;
      Object.assign(colorLabel.style, {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        color: 'var(--text-secondary)',
        fontSize: '0.78rem',
        cursor: 'pointer',
      });

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = state.ccYearColors[year] || DEFAULT_CC_YEAR_COLORS[year];
      colorInput.setAttribute('aria-label', `Warna Tahun ${year}`);
      Object.assign(colorInput.style, {
        width: '1.75rem',
        height: '1.75rem',
        padding: '1px',
        border: '1px solid var(--border-color)',
        borderRadius: '0.4rem',
        background: 'transparent',
        cursor: 'pointer',
      });

      colorInput.addEventListener('input', (event) => {
        state.ccYearColors[year] = event.target.value;
        saveCcYearColors();
        updateCcComparisonChart();
      });

      const yearName = document.createElement('span');
      yearName.textContent = `Tahun ${year}`;
      colorLabel.append(colorInput, yearName);
      monthColorControls.appendChild(colorLabel);
    });

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = 'Reset warna';
    resetButton.title = 'Kembalikan warna tahun ke pengaturan awal';
    Object.assign(resetButton.style, {
      border: '1px solid var(--border-color)',
      borderRadius: '0.4rem',
      padding: '0.3rem 0.55rem',
      background: 'rgba(148, 163, 184, 0.12)',
      color: 'var(--text-secondary)',
      fontSize: '0.75rem',
      cursor: 'pointer',
    });
    resetButton.addEventListener('click', () => {
      if (state.ccSelectedYear === '2025') {
        state.ccYearColors['2025'] = DEFAULT_CC_YEAR_COLORS['2025'];
      } else if (state.ccSelectedYear === '2026') {
        state.ccYearColors['2026'] = DEFAULT_CC_YEAR_COLORS['2026'];
      } else {
        state.ccYearColors = { ...DEFAULT_CC_YEAR_COLORS };
      }
      saveCcYearColors();
      renderCcColorControls();
      updateCcComparisonChart();
    });
    monthColorControls.appendChild(resetButton);

    // Separator
    const sep = document.createElement('span');
    sep.style.margin = '0 0.25rem';
    sep.style.color = 'var(--border-color)';
    sep.textContent = '|';
    monthColorControls.appendChild(sep);

    // Quick filter: Semua (12 Bulan)
    const isAllSelected = state.selectedCcMonths.length === 12;
    const btnAll = document.createElement('button');
    btnAll.type = 'button';
    btnAll.textContent = 'Semua (12 Bulan)';
    btnAll.title = 'Pilih seluruh 12 bulan';
    Object.assign(btnAll.style, {
      border: '1px solid var(--border-color)',
      borderRadius: '0.4rem',
      padding: '0.3rem 0.55rem',
      background: isAllSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(148, 163, 184, 0.12)',
      color: isAllSelected ? '#3b82f6' : 'var(--text-secondary)',
      fontSize: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
    });
    btnAll.addEventListener('click', () => {
      state.selectedCcMonths = [...CC_MONTH_LIST];
      renderCcChips();
      updateCcComparisonChart();
      updateCcTables();
    });
    monthColorControls.appendChild(btnAll);

    // Quick filter: YTD (Jan - Okt)
    const isYtdSelected = state.selectedCcMonths.length === 10 &&
      state.selectedCcMonths[0] === 'Januari' &&
      state.selectedCcMonths[9] === 'Oktober';
    const btnYtd = document.createElement('button');
    btnYtd.type = 'button';
    btnYtd.textContent = 'YTD (Jan - Okt)';
    btnYtd.title = 'Pilih bulan Januari s/d Oktober';
    Object.assign(btnYtd.style, {
      border: '1px solid var(--border-color)',
      borderRadius: '0.4rem',
      padding: '0.3rem 0.55rem',
      background: isYtdSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(148, 163, 184, 0.12)',
      color: isYtdSelected ? '#10b981' : 'var(--text-secondary)',
      fontSize: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
    });
    btnYtd.addEventListener('click', () => {
      state.selectedCcMonths = CC_MONTH_LIST.slice(0, 10);
      renderCcChips();
      updateCcComparisonChart();
      updateCcTables();
    });
    monthColorControls.appendChild(btnYtd);
  };

  const renderCcChips = () => {
    monthChips.innerHTML = '';
    CC_MONTH_LIST.forEach((month) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      const isActive = state.selectedCcMonths.includes(month);
      chip.className = `month-chip ${isActive ? 'active' : ''}`;
      chip.textContent = month;
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      chip.addEventListener('click', () => {
        if (state.selectedCcMonths.includes(month)) {
          if (state.selectedCcMonths.length === 1) return;
          state.selectedCcMonths = state.selectedCcMonths.filter((m) => m !== month);
        } else {
          state.selectedCcMonths = CC_MONTH_LIST.filter(
            (m) => state.selectedCcMonths.includes(m) || m === month
          );
        }
        renderCcChips();
        updateCcComparisonChart();
        updateCcTables();
      });

      monthChips.appendChild(chip);
    });

    renderCcColorControls();
    updateHint();
  };

  renderCcChips();
}

/**
 * Update comparison chart with selected months
 */
function updateComparisonChart() {
  if (state.currentCategory === 'cc') {
    updateCcComparisonChart();
    return;
  }
  const canvas = document.getElementById('comparisonChart');
  if (!canvas) return;
  
  const uker = state.selectedComparisonUker;
  if (!uker || !state.selectedMonths || state.selectedMonths.length === 0) return;
  
  const monthlyData = getMonthlyDataForUker(uker);
  if (!monthlyData) return;

  const selectedMonths = state.selectedMonths.filter((m) => monthlyData[m]);
  if (selectedMonths.length === 0) return;

  // Create labels (days 1-31)
  const maxDay = Math.max(
    1,
    ...selectedMonths.flatMap((m) => monthlyData[m].map((d) => d.day)),
  );
  const labels = Array.from({ length: maxDay }, (_, i) => i + 1);
  
  const chartData = {
    labels: labels,
    datasets: selectedMonths.map((month) => {
      const monthColor = getMonthColor(month);
      const values = labels.map((day) => {
        const found = monthlyData[month].find((d) => d.day === day);
        return found ? found.value : null;
      });
      return {
        label: month,
        data: values,
        borderColor: monthColor.border,
        backgroundColor: monthColor.bg,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: monthColor.border,
        fill: false,
        spanGaps: true,
      };
    }),
  };

  const showAllDateTicks = state.dateLabelMode === "all";
  const showChartTitle = state.chartTitleVisibility === "show";
  
  const chartTitle = uker === ALL_BRANCHES_VALUE
    ? 'Perbandingan Semua Cabang (Gabungan)'
    : `Perbandingan ${uker}`;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 30,
        right: 30,
        top: 20,
        bottom: 0
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: getThemeColors().textSecondary,
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: showChartTitle,
        text: [chartTitle, '(Dalam Miliar)'],
        color: getThemeColors().text,
        font: {
          size: 14,
          weight: 600
        },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: getThemeColors().tooltipBg,
        titleColor: getThemeColors().text,
        bodyColor: getThemeColors().textSecondary,
        borderColor: getThemeColors().tooltipBorder,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function(context) {
            return `Tanggal ${context[0].label}`;
          },
          label: function(context) {
            if (context.raw === null) return null;
            return `${context.dataset.label}: ${formatNumber(context.raw)}`;
          }
        }
      },
      datalabels: {
        display: function(context) {
          if (showAllDateTicks) return true;
          const points = context.dataset.data || [];
          const firstValidIndex = points.findIndex((v) => v !== null && v !== undefined);
          let lastValidIndex = -1;
          for (let i = points.length - 1; i >= 0; i--) {
            if (points[i] !== null && points[i] !== undefined) {
              lastValidIndex = i;
              break;
            }
          }
          if (firstValidIndex === -1 || lastValidIndex === -1) return false;
          return context.dataIndex === firstValidIndex || context.dataIndex === lastValidIndex;
        },
        align: function(context) {
          return context.datasetIndex === 0 ? 'top' : 'bottom';
        },
        anchor: function(context) {
          return context.datasetIndex === 0 ? 'end' : 'start';
        },
        color: function(context) {
          return context.dataset.borderColor;
        },
        font: {
          size: 10,
          weight: '600'
        },
        formatter: function(value) {
          if (value === null || value === undefined) return '';
          return Math.round(value).toLocaleString('id-ID');
        },
        padding: 4,
        offset: 4
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tanggal',
          color: getThemeColors().textMuted
        },
        grid: {
          color: getThemeColors().gridColor
        },
        ticks: {
          color: getThemeColors().textMuted,
          autoSkip: false,
          callback: function(value, index) {
            return labels[index];
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Nilai',
          color: getThemeColors().textMuted
        },
        grid: {
          color: getThemeColors().gridColor
        },
        ticks: {
          color: getThemeColors().textMuted,
          callback: function(value) {
            return formatNumber(value, 0);
          }
        }
      }
    }
  };
  
  if (state.comparisonChart) {
    state.comparisonChart.data = chartData;
    state.comparisonChart.options.plugins.title.display = showChartTitle;
    state.comparisonChart.options.plugins.title.text = showChartTitle ? [chartTitle, '(Dalam Miliar)'] : [];
    state.comparisonChart.options.plugins.datalabels.display = function(context) {
      if (showAllDateTicks) return true;
      const points = context.dataset.data || [];
      const firstValidIndex = points.findIndex((v) => v !== null && v !== undefined);
      let lastValidIndex = -1;
      for (let i = points.length - 1; i >= 0; i--) {
        if (points[i] !== null && points[i] !== undefined) {
          lastValidIndex = i;
          break;
        }
      }
      if (firstValidIndex === -1 || lastValidIndex === -1) return false;
      return context.dataIndex === firstValidIndex || context.dataIndex === lastValidIndex;
    };
    state.comparisonChart.options.scales.x.ticks.autoSkip = false;
    state.comparisonChart.options.scales.x.ticks.callback = function(value, index) {
      return labels[index];
    };
    state.comparisonChart.update('none');
  } else {
    const ctx = canvas.getContext('2d');
    const bgPlugin = {
      id: 'whiteBg',
      beforeDraw: (chart) => {
        const { ctx: c, width, height } = chart;
        c.save();
        c.fillStyle = '#ffffff';
        c.fillRect(0, 0, width, height);
        c.restore();
      }
    };
    state.comparisonChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: options,
      plugins: [bgPlugin]
    });
  }
}

/**
 * Update comparison table
 */
function updateComparisonTable() {
  if (state.currentCategory === 'cc') {
    updateCcTables();
    return;
  }
  
  // Restore DPK Table Titles and Heads if switching back from CC
  if (elements.tableCard1Title) elements.tableCard1Title.textContent = 'Average Balance vs Ending Balance';
  if (elements.tableCard2Title) elements.tableCard2Title.textContent = 'Bottom vs Ending Balance';
  if (elements.avgEndingTableHead) {
    elements.avgEndingTableHead.innerHTML = `
      <tr>
        <th>Bulan</th>
        <th>Ending Balance</th>
        <th>Avg Bln</th>
        <th>Avg/Ending</th>
        <th>MTD</th>
        <th>YTD</th>
      </tr>
    `;
  }
  if (elements.bottomEndingTableHead) {
    elements.bottomEndingTableHead.innerHTML = `
      <tr>
        <th>Bulan</th>
        <th>Ending Balance</th>
        <th>Bottom</th>
        <th>Bottom/Ending</th>
        <th>MTD</th>
        <th>YTD</th>
      </tr>
    `;
  }

  const avgBody = document.getElementById('avgEndingTableBody');
  const bottomBody = document.getElementById('bottomEndingTableBody');
  if (!avgBody || !bottomBody) return;

  if (!state.selectedComparisonUker || !state.selectedMonths || state.selectedMonths.length === 0) {
    const placeholder = '<tr><td colspan="6" class="table-placeholder">Pilih bulan untuk menampilkan tabel.</td></tr>';
    avgBody.innerHTML = placeholder;
    bottomBody.innerHTML = placeholder;
    return;
  }

  const monthlyData = getMonthlyDataForUker(state.selectedComparisonUker);
  if (!monthlyData) {
    const placeholder = '<tr><td colspan="6" class="table-placeholder">Data belum tersedia.</td></tr>';
    avgBody.innerHTML = placeholder;
    bottomBody.innerHTML = placeholder;
    return;
  }

  const selectedMonths = state.selectedMonths.filter((m) => monthlyData[m] && monthlyData[m].length > 0);
  if (selectedMonths.length === 0) {
    const placeholder = '<tr><td colspan="6" class="table-placeholder">Data bulan terpilih tidak ditemukan.</td></tr>';
    avgBody.innerHTML = placeholder;
    bottomBody.innerHTML = placeholder;
    return;
  }

  const rows = selectedMonths.map((month) => {
    const values = monthlyData[month].map((d) => d.value).filter((v) => typeof v === 'number' && !Number.isNaN(v));
    const ending = values.length ? Math.round(values[values.length - 1]) : 0;
    const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const bottom = values.length ? Math.round(Math.min(...values)) : 0;
    return { month, ending, avg, bottom };
  });

  const firstAvg = rows[0].avg;
  const firstBottom = rows[0].bottom;

  const formatDelta = (value) => {
    if (value > 0) return `<span class="delta-cell positive">▲ ${formatNumber(value, 0)}</span>`;
    if (value < 0) return `<span class="delta-cell negative">▼ ${formatNumber(Math.abs(value), 0)}</span>`;
    return `<span class="delta-cell neutral">-</span>`;
  };

  avgBody.innerHTML = rows
    .map((row, i) => {
      const prevAvg = i > 0 ? rows[i - 1].avg : row.avg;
      const mtd = row.avg - prevAvg;
      const ytd = row.avg - firstAvg;
      const avgRatio = row.ending > 0 ? (row.avg / row.ending) * 100 : 0;
      return `
        <tr>
          <td>${row.month}</td>
          <td class="value">${formatNumber(row.ending, 0)}</td>
          <td class="value">${formatNumber(row.avg, 0)}</td>
          <td class="value">${formatNumber(avgRatio, 1)}%</td>
          <td class="value">${formatDelta(i === 0 ? 0 : mtd)}</td>
          <td class="value">${formatDelta(i === 0 ? 0 : ytd)}</td>
        </tr>
      `;
    })
    .join('');

  bottomBody.innerHTML = rows
    .map((row, i) => {
      const prevBottom = i > 0 ? rows[i - 1].bottom : row.bottom;
      const mtd = row.bottom - prevBottom;
      const ytd = row.bottom - firstBottom;
      const bottomRatio = row.ending > 0 ? (row.bottom / row.ending) * 100 : 0;
      return `
        <tr>
          <td>${row.month}</td>
          <td class="value">${formatNumber(row.ending, 0)}</td>
          <td class="value">${formatNumber(row.bottom, 0)}</td>
          <td class="value">${formatNumber(bottomRatio, 1)}%</td>
          <td class="value">${formatDelta(i === 0 ? 0 : mtd)}</td>
          <td class="value">${formatDelta(i === 0 ? 0 : ytd)}</td>
        </tr>
      `;
    })
    .join('');
}

// =====================================
// Initialization
// =====================================

async function init() {
  initEventListeners();

  let detectedRole = window.__CURRENT_ROLE__ || 'admin';
  const storedSession = localStorage.getItem('dpk_session');
  if (storedSession) {
    try {
      const sess = JSON.parse(storedSession);
      if (sess && sess.role) detectedRole = sess.role;
    } catch (e) {}
  }

  if (detectedRole === 'cc') {
    applyRoleRestrictions('cc');
    console.log("CC Chart Viewer initialized for User CC.");
    return;
  }

  applyRoleRestrictions('admin');
  syncModeUI();
  console.log("DPK Chart Viewer initializing for Admin...");

  // Load initial data
  await loadData();
  
  // Update comparison table
  updateComparisonTable();

  console.log("DPK Chart Viewer ready!");
}

// Start the application
document.addEventListener("DOMContentLoaded", init);

// =====================================
// PDF Download Helper
// =====================================

/**
 * Download PDF with proper filename
 */
function downloadPDF(url, filename) {
  // Show loading
  showToast(`Mengunduh ${filename}...`, 'info');
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('File tidak ditemukan');
      }
      return response.blob();
    })
    .then(blob => {
      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create temporary link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
      
      showToast(`${filename} berhasil diunduh!`, 'success');
    })
    .catch(error => {
      console.error('Download error:', error);
      showToast(`Gagal mengunduh: ${error.message}`, 'error');
    });
}

// Setup PDF download buttons
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for DOM to be ready
  setTimeout(() => {
    const downloadButtons = document.querySelectorAll('.btn-download');
    downloadButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const href = btn.getAttribute('href');
        const filename = btn.getAttribute('download') || href.split('/').pop();
        downloadPDF(href, filename);
      });
    });
  }, 100);
});

// =====================================
// Theme Toggle
// =====================================

function getThemeColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#64748b',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)',
    tooltipBg: isDark ? 'rgba(26, 26, 37, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  };
}

function updateChartTheme() {
  const colors = getThemeColors();
  
  if (state.comparisonChart) {
    state.comparisonChart.options.plugins.title.color = colors.text;
    state.comparisonChart.options.plugins.legend.labels.color = colors.textSecondary;
    state.comparisonChart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
    state.comparisonChart.options.plugins.tooltip.titleColor = colors.text;
    state.comparisonChart.options.plugins.tooltip.bodyColor = colors.textSecondary;
    state.comparisonChart.options.plugins.tooltip.borderColor = colors.tooltipBorder;
    state.comparisonChart.options.scales.x.grid.color = colors.gridColor;
    state.comparisonChart.options.scales.y.grid.color = colors.gridColor;
    state.comparisonChart.options.scales.x.ticks.color = colors.textMuted;
    state.comparisonChart.options.scales.y.ticks.color = colors.textMuted;
    state.comparisonChart.options.scales.x.title.color = colors.textMuted;
    state.comparisonChart.options.scales.y.title.color = colors.textMuted;
    state.comparisonChart.update();
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  updateChartTheme();
  
  showToast(`Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`, 'info');
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

// Setup theme toggle
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
});


// =====================================
// CC Manual Input Engine
// =====================================

const CC_AREAS_DEF = [
  {
    id: "1",
    name: "Area 1",
    totalCol: "TOTAL AREA 1",
    branches: ["KC Indramayu", "KC Purwakarta", "KC Subang", "KC Jatibarang", "KC Pamanukan"]
  },
  {
    id: "2",
    name: "Area 2",
    totalCol: "TOTAL AREA 2",
    branches: ["KC Majalengka", "KC Sumedang", "KC Cirebon Kartini", "KC Kuningan", "KC Cirebon Gunung Jati", "KC Banjar", "KC Ciamis", "KC Tasikmalaya"]
  },
  {
    id: "3",
    name: "Area 3",
    totalCol: "TOTAL AREA 3",
    branches: []
  },
  {
    id: "4",
    name: "Area 4",
    totalCol: "TOTAL AREA 4",
    branches: ["KC Sukabumi", "KC Cianjur", "KC Majalaya", "KC Cimahi", "KC Cibadak", "KC Soreang", "KC Garut", "KC Singaparna"]
  },
  {
    id: "5",
    name: "Area 5",
    totalCol: "TOTAL AREA 5",
    branches: ["KC Bandung AA", "KC Bandung Dewi Sartika", "KC Bandung Naripan", "KC Bandung A.H. Nasution", "KC Bandung Martadinata", "KC Bandung Kopo", "KC Bandung Dago", "KC Bandung Sukarno Hatta", "KC Bandung Setiabudi"]
  }
];

const ALL_CC_KANCAS = CC_AREAS_DEF.flatMap(a => a.branches);

let ccModalRawLines = [];
let ccModalHeaderCols = [];
let ccModalCurrentMetric = "savol";
let ccModalCurrentDate = "";

function cleanCcInputNumber(str) {
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  if (!str) return 0;
  const cleaned = String(str).replace(/Rp\s?/gi, '').replace(/\./g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatCcNumber(num, isCurrency = false) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  const formatted = Math.round(num).toLocaleString("id-ID");
  return isCurrency ? `Rp ${formatted}` : formatted;
}

async function openCcManualModal() {
  if (!elements.ccManualModal) return;
  elements.ccManualModal.style.display = "flex";
  document.body.style.overflow = "hidden";

  const targetMetric = (state.currentCategory === "cc" && state.currentMetric === "new_user") ? "new_user" : "savol";
  if (elements.ccModalMetric) {
    elements.ccModalMetric.value = targetMetric;
  }
  ccModalCurrentMetric = targetMetric;

  await loadCcModalDataset(targetMetric);
}

function closeCcManualModal() {
  if (!elements.ccManualModal) return;
  elements.ccManualModal.style.display = "none";
  document.body.style.overflow = "";
  if (elements.ccPasteBox) elements.ccPasteBox.style.display = "none";
}

async function loadCcModalDataset(metric, preferredDate = null) {
  const path = (CONFIG.csvPaths.cc && CONFIG.csvPaths.cc[metric]) || `csv cc/${metric}.csv`;

  try {
    let csvText = "";
    const override = localStorage.getItem(`cc_override_${metric}`);
    if (override) {
      csvText = override;
    } else {
      const resp = await fetch(`${path}?t=${Date.now()}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      csvText = await resp.text();
    }

    ccModalRawLines = csvText.split("\n").map(l => l.trim()).filter(l => l);
    if (ccModalRawLines.length < 2) {
      throw new Error("CSV file kosong");
    }

    ccModalHeaderCols = ccModalRawLines[0].split(";").map(h => h.trim().replace(/\r/g, ""));
    const dates = ccModalRawLines.slice(1).map(l => l.split(";")[0].trim().replace(/\r/g, ""));

    if (elements.ccModalDate) {
      elements.ccModalDate.innerHTML = "";
      dates.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        elements.ccModalDate.appendChild(opt);
      });

      if (preferredDate && dates.includes(preferredDate)) {
        elements.ccModalDate.value = preferredDate;
      } else {
        const novDate = dates.find(d => d.toLowerCase().includes("nov-2026"));
        elements.ccModalDate.value = novDate || dates[dates.length - 1];
      }
      ccModalCurrentDate = elements.ccModalDate.value;
    }

    renderCcModalForm();
  } catch (err) {
    console.error("Gagal memuat dataset modal CC:", err);
    showToast(`Gagal memuat data CC: ${err.message}`, "error");
  }
}

function renderCcModalForm() {
  if (!elements.ccBranchesGridContainer) return;
  elements.ccBranchesGridContainer.innerHTML = "";

  const selectedDate = elements.ccModalDate ? elements.ccModalDate.value : ccModalCurrentDate;
  const isCurrency = ccModalCurrentMetric === "savol";

  const rowLine = ccModalRawLines.slice(1).find(l => l.split(";")[0].trim() === selectedDate);
  const valuesMap = {};
  if (rowLine) {
    const cols = rowLine.split(";").map(v => v.trim().replace(/\r/g, ""));
    for (let i = 1; i < cols.length && i < ccModalHeaderCols.length; i++) {
      valuesMap[ccModalHeaderCols[i]] = parseEuropeanNumber(cols[i]);
    }
  }

  CC_AREAS_DEF.forEach(area => {
    const areaCard = document.createElement("div");
    areaCard.className = "cc-area-card";

    const header = document.createElement("div");
    header.className = "cc-area-card-header";
    header.innerHTML = `
      <span class="cc-area-title">${area.name}</span>
      <span id="ccAreaSumPill_${area.id}" class="cc-area-total-pill">0</span>
    `;
    areaCard.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "cc-branches-inputs-grid";

    if (area.branches.length > 0) {
      area.branches.forEach(branch => {
        const val = valuesMap[branch] || 0;
        const group = document.createElement("div");
        group.className = "cc-branch-input-group";
        group.innerHTML = `
          <label class="cc-branch-label" title="${branch}">${branch}</label>
          <input type="text" class="cc-branch-input" data-branch="${branch}" data-area="${area.id}" value="${formatCcNumber(val)}" inputmode="numeric" />
        `;
        grid.appendChild(group);
      });
    } else {
      const val = valuesMap[area.totalCol] || 0;
      const group = document.createElement("div");
      group.className = "cc-branch-input-group";
      group.innerHTML = `
        <label class="cc-branch-label" title="${area.totalCol}">${area.totalCol}</label>
        <input type="text" class="cc-branch-input" data-branch="${area.totalCol}" data-area="${area.id}" value="${formatCcNumber(val)}" inputmode="numeric" />
      `;
      grid.appendChild(group);
    }

    areaCard.appendChild(grid);
    elements.ccBranchesGridContainer.appendChild(areaCard);
  });

  // Render RO Card
  const roCard = document.createElement("div");
  roCard.className = "cc-area-card";
  const roVal = valuesMap["RO"] || 0;
  roCard.innerHTML = `
    <div class="cc-area-card-header">
      <span class="cc-area-title">Kantor Wilayah (RO)</span>
      <span class="cc-area-total-pill" id="ccRoPill">0</span>
    </div>
    <div class="cc-branches-inputs-grid">
      <div class="cc-branch-input-group">
        <label class="cc-branch-label">RO</label>
        <input type="text" class="cc-branch-input" data-branch="RO" data-area="RO" value="${formatCcNumber(roVal)}" inputmode="numeric" />
      </div>
    </div>
  `;
  elements.ccBranchesGridContainer.appendChild(roCard);

  const allInputs = elements.ccBranchesGridContainer.querySelectorAll(".cc-branch-input");
  allInputs.forEach(input => {
    input.addEventListener("input", () => {
      recalcCcModalLiveTotals();
    });

    input.addEventListener("focus", (e) => {
      const raw = cleanCcInputNumber(e.target.value);
      e.target.value = raw === 0 ? "" : raw;
    });

    input.addEventListener("blur", (e) => {
      const num = cleanCcInputNumber(e.target.value);
      e.target.value = formatCcNumber(num);
      recalcCcModalLiveTotals();
    });
  });

  recalcCcModalLiveTotals();
}

function recalcCcModalLiveTotals() {
  if (!elements.ccBranchesGridContainer) return;

  const isCurrency = ccModalCurrentMetric === "savol";
  let grandTotal = 0;
  const areaTotals = {};

  CC_AREAS_DEF.forEach(area => {
    let areaSum = 0;
    const inputs = elements.ccBranchesGridContainer.querySelectorAll(`.cc-branch-input[data-area="${area.id}"]`);
    inputs.forEach(inp => {
      areaSum += cleanCcInputNumber(inp.value);
    });

    areaTotals[area.id] = areaSum;
    grandTotal += areaSum;

    const pill = document.getElementById(`ccAreaSumPill_${area.id}`);
    if (pill) {
      pill.textContent = formatCcNumber(areaSum, isCurrency);
    }
  });

  const roInput = elements.ccBranchesGridContainer.querySelector(`.cc-branch-input[data-branch="RO"]`);
  const roVal = roInput ? cleanCcInputNumber(roInput.value) : 0;
  grandTotal += roVal;
  const roPill = document.getElementById("ccRoPill");
  if (roPill) roPill.textContent = formatCcNumber(roVal, isCurrency);

  if (elements.ccLiveGrandTotal) {
    elements.ccLiveGrandTotal.textContent = formatCcNumber(grandTotal, isCurrency);
  }

  if (elements.ccAreaBadgesStrip) {
    elements.ccAreaBadgesStrip.innerHTML = "";
    CC_AREAS_DEF.forEach(area => {
      const item = document.createElement("div");
      item.className = "cc-area-badge-item";
      item.innerHTML = `<span class="area-tag">${area.name}:</span> <span class="area-val">${formatCcNumber(areaTotals[area.id] || 0, isCurrency)}</span>`;
      elements.ccAreaBadgesStrip.appendChild(item);
    });
    const roItem = document.createElement("div");
    roItem.className = "cc-area-badge-item";
    roItem.innerHTML = `<span class="area-tag">RO:</span> <span class="area-val">${formatCcNumber(roVal, isCurrency)}</span>`;
    elements.ccAreaBadgesStrip.appendChild(roItem);
  }
}

async function saveCcModalData() {
  const selectedDate = elements.ccModalDate ? elements.ccModalDate.value : ccModalCurrentDate;
  if (!selectedDate) {
    showToast("Silakan pilih tanggal/bulan terlebih dahulu", "warning");
    return;
  }

  const values = {};
  const allInputs = elements.ccBranchesGridContainer.querySelectorAll(".cc-branch-input");
  allInputs.forEach(inp => {
    const branch = inp.getAttribute("data-branch");
    values[branch] = cleanCcInputNumber(inp.value);
  });

  let grandTotal = 0;
  CC_AREAS_DEF.forEach(area => {
    let areaSum = 0;
    if (area.branches.length > 0) {
      area.branches.forEach(b => {
        areaSum += values[b] || 0;
      });
    } else {
      areaSum = values[area.totalCol] || 0;
    }
    values[area.totalCol] = areaSum;
    grandTotal += areaSum;
  });

  const roVal = values["RO"] || 0;
  grandTotal += roVal;
  values["TOTAL KESELURUHAN"] = grandTotal;

  const rowCols = [selectedDate];
  for (let i = 1; i < ccModalHeaderCols.length; i++) {
    const colName = ccModalHeaderCols[i];
    rowCols.push(values[colName] !== undefined ? Math.round(values[colName]) : 0);
  }
  const newRowStr = rowCols.join(";");

  let foundIdx = -1;
  for (let i = 1; i < ccModalRawLines.length; i++) {
    if (ccModalRawLines[i].split(";")[0].trim() === selectedDate) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx !== -1) {
    ccModalRawLines[foundIdx] = newRowStr;
  } else {
    ccModalRawLines.push(newRowStr);
  }

  const updatedCsvText = ccModalRawLines.join("\n");

  let savedToDisk = false;
  try {
    const resp = await fetch("save_cc.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric: ccModalCurrentMetric,
        date: selectedDate,
        values: values
      })
    });
    if (resp.ok) {
      const resJson = await resp.json();
      if (resJson.success) {
        savedToDisk = true;
      }
    }
  } catch (e) {
    console.warn("save_cc.php request failed or not available:", e);
  }

  localStorage.setItem(`cc_override_${ccModalCurrentMetric}`, updatedCsvText);

  if (state.currentCategory === "cc" && state.currentMetric === ccModalCurrentMetric) {
    state.chartData = parseCSV(updatedCsvText);
    state.lastDataHash = hashData(state.chartData);
    updateComparisonChart();
    updateComparisonTable();
  }

  showToast(
    savedToDisk
      ? `✅ Data ${ccModalCurrentMetric.toUpperCase()} bulan ${selectedDate} berhasil disimpan ke disk!`
      : `✅ Data ${ccModalCurrentMetric.toUpperCase()} berhasil disimpan! (Tersimpan di browser)`,
    "success"
  );

  closeCcManualModal();
}

function downloadCcModalCsv() {
  const csvContent = ccModalRawLines.join("\r\n") + "\r\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${ccModalCurrentMetric}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`File ${ccModalCurrentMetric}.csv berhasil diunduh!`, "info");
}

function initCcManualModal() {
  if (elements.openCcManualModalBtn) {
    elements.openCcManualModalBtn.addEventListener("click", openCcManualModal);
  }
  if (elements.openCcManualModalInlineBtn) {
    elements.openCcManualModalInlineBtn.addEventListener("click", openCcManualModal);
  }
  if (elements.closeCcManualModalBtn) {
    elements.closeCcManualModalBtn.addEventListener("click", closeCcManualModal);
  }
  if (elements.ccCancelModalBtn) {
    elements.ccCancelModalBtn.addEventListener("click", closeCcManualModal);
  }

  if (elements.ccManualModal) {
    elements.ccManualModal.addEventListener("click", (e) => {
      if (e.target === elements.ccManualModal) {
        closeCcManualModal();
      }
    });
  }

  if (elements.ccModalMetric) {
    elements.ccModalMetric.addEventListener("change", (e) => {
      ccModalCurrentMetric = e.target.value;
      loadCcModalDataset(ccModalCurrentMetric);
    });
  }

  if (elements.ccModalDate) {
    elements.ccModalDate.addEventListener("change", (e) => {
      ccModalCurrentDate = e.target.value;
      renderCcModalForm();
    });
  }

  if (elements.ccModalAddDateBtn) {
    elements.ccModalAddDateBtn.addEventListener("click", () => {
      const newDate = prompt("Masukkan tanggal/bulan baru (contoh: 31-Jan-2027):");
      if (newDate && newDate.trim()) {
        const cleanDate = newDate.trim();
        const exists = Array.from(elements.ccModalDate.options).some(o => o.value.toLowerCase() === cleanDate.toLowerCase());
        if (!exists) {
          const opt = document.createElement("option");
          opt.value = cleanDate;
          opt.textContent = cleanDate;
          elements.ccModalDate.appendChild(opt);
        }
        elements.ccModalDate.value = cleanDate;
        ccModalCurrentDate = cleanDate;
        renderCcModalForm();
      }
    });
  }

  if (elements.ccModalResetBtn) {
    elements.ccModalResetBtn.addEventListener("click", () => {
      renderCcModalForm();
      showToast("Nilai telah dimuat ulang dari data tersimpan", "info");
    });
  }

  if (elements.ccModalClearBtn) {
    elements.ccModalClearBtn.addEventListener("click", () => {
      const inputs = elements.ccBranchesGridContainer.querySelectorAll(".cc-branch-input");
      inputs.forEach(inp => inp.value = "0");
      recalcCcModalLiveTotals();
      showToast("Seluruh input direset ke 0", "info");
    });
  }

  if (elements.ccModalPasteExcelBtn && elements.ccPasteBox) {
    elements.ccModalPasteExcelBtn.addEventListener("click", () => {
      const isVisible = elements.ccPasteBox.style.display !== "none";
      elements.ccPasteBox.style.display = isVisible ? "none" : "flex";
      if (!isVisible && elements.ccPasteTextarea) {
        elements.ccPasteTextarea.focus();
      }
    });
  }

  if (elements.ccClosePasteBox && elements.ccPasteBox) {
    elements.ccClosePasteBox.addEventListener("click", () => {
      elements.ccPasteBox.style.display = "none";
    });
  }

  if (elements.ccPasteTextarea && elements.ccPasteCountBadge) {
    elements.ccPasteTextarea.addEventListener("input", (e) => {
      const tokens = e.target.value.trim().split(/[\t\n,;]+/).filter(t => t.trim());
      elements.ccPasteCountBadge.textContent = `${tokens.length} angka terdeteksi (Dibutuhkan 30 Kanca)`;
      elements.ccPasteCountBadge.style.color = tokens.length === ALL_CC_KANCAS.length ? "var(--success)" : "var(--text-muted)";
    });
  }

  if (elements.ccApplyPasteBtn && elements.ccPasteTextarea) {
    elements.ccApplyPasteBtn.addEventListener("click", () => {
      const tokens = elements.ccPasteTextarea.value.trim().split(/[\t\n,;]+/).filter(t => t.trim());
      if (tokens.length === 0) {
        showToast("Tidak ada angka yang terdeteksi pada teks paste!", "warning");
        return;
      }

      const numbers = tokens.map(cleanCcInputNumber);
      ALL_CC_KANCAS.forEach((kanca, idx) => {
        const inp = elements.ccBranchesGridContainer.querySelector(`.cc-branch-input[data-branch="${kanca}"]`);
        if (inp) {
          inp.value = formatCcNumber(numbers[idx] !== undefined ? numbers[idx] : 0);
        }
      });

      recalcCcModalLiveTotals();
      elements.ccPasteBox.style.display = "none";
      elements.ccPasteTextarea.value = "";
      showToast(`${Math.min(tokens.length, ALL_CC_KANCAS.length)} angka berhasil diterapkan ke 30 Kanca!`, "success");
    });
  }

  if (elements.ccSaveBtn) {
    elements.ccSaveBtn.addEventListener("click", saveCcModalData);
  }

  if (elements.ccDownloadCsvBtn) {
    elements.ccDownloadCsvBtn.addEventListener("click", downloadCcModalCsv);
  }
}
