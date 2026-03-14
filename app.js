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

// =====================================
// State Management
// =====================================
const state = {
  currentCategory: "kcp",
  currentMetric: "dpk",
  currentArea: "all",
  selectedUkers: new Set(),
  allUkers: [],
  filteredUkers: [],
  chartData: null,
  chart: null,
  comparisonChart: null,
  selectedComparisonUker: null,
  selectedMonths: [],
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
      const monthTag = (state.selectedMonths || []).join('-').toLowerCase() || 'bulan';
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
  const path = CONFIG.csvPaths[category][metric];

  try {
    const response = await fetch(path);
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

  // Find the starting column for data (skip first columns that might be labels)
  let dataStartCol = 1;
  if (
    headers[1] === "" ||
    headers[1].toLowerCase().includes("dpk") ||
    headers[1].toLowerCase().includes("casa") ||
    headers[1].toLowerCase().includes("giro") ||
    headers[1].toLowerCase().includes("depo") ||
    headers[1].toLowerCase().includes("tabungan")
  ) {
    dataStartCol = 2;
  }

  const ukerNames = headers.slice(dataStartCol);

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

function getFilteredUkersForArea(ukerNames) {
  const cleaned = (ukerNames || []).filter((u) => u);
  if (state.currentArea === "all" || !CONFIG.areaMapping[state.currentArea]) {
    return cleaned;
  }

  const areaUkers = CONFIG.areaMapping[state.currentArea];
  return cleaned.filter((uker) => {
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
  };

  const metricNames = {
    dpk: "DPK",
    casa: "CASA",
    depo: "Deposito",
    giro: "Giro",
    tabungan: "Tabungan",
  };

  if (elements.chartTitle) {
    elements.chartTitle.textContent = `📈 Grafik ${metricNames[state.currentMetric]} - ${categoryNames[state.currentCategory]}`;
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

function initEventListeners() {
  // Category change
  elements.categorySelect.addEventListener("change", (e) => {
    state.currentCategory = e.target.value;
    state.selectedUkers.clear();
    state.lastDataHash = null;
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
      value = filteredUkers.reduce((sum, name) => sum + (data[name]?.[index] || 0), 0);
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
  
  // Filter by area if selected
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
  
  // Set first filtered uker as selected
  if (filteredUkers.length > 0) {
    state.selectedComparisonUker = ALL_BRANCHES_VALUE;
    select.value = ALL_BRANCHES_VALUE;
  } else {
    state.selectedComparisonUker = null;
  }
  
  // Remove old event listener and add new one
  const newSelect = select.cloneNode(true);
  select.parentNode.replaceChild(newSelect, select);
  newSelect.addEventListener('change', (e) => {
    state.selectedComparisonUker = e.target.value;
    updateComparisonChart();
  });
}

/**
 * Populate month selectors
 */
function populateMonthSelectors() {
  const monthChips = document.getElementById('monthChips');
  const monthSelectionHint = document.getElementById('monthSelectionHint');
  
  if (!monthChips) return;
  
  const availableMonths = getAvailableMonths();
  
  monthChips.innerHTML = '';
  
  // Default: select up to 4 latest months
  state.selectedMonths = availableMonths.slice(Math.max(availableMonths.length - 4, 0));

  const updateHint = () => {
    if (!monthSelectionHint) return;
    monthSelectionHint.textContent = `${state.selectedMonths.length} bulan dipilih`;
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
          // Keep at least one month selected
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

    updateHint();
  };

  if (state.selectedMonths.length === 0 && availableMonths.length > 0) {
    state.selectedMonths = [availableMonths[availableMonths.length - 1]];
  }

  renderChips();
}

/**
 * Update comparison chart with selected months
 */
function updateComparisonChart() {
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
  
  // Get colors based on month selection
  const getMonthColor = (month) => {
    const colorMap = {
      'Januari': { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
      'Februari': { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
      'Maret': { border: '#111827', bg: 'rgba(17, 24, 39, 0.1)' },
      'April': { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
      'Mei': { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
      'Juni': { border: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)' },
      'Juli': { border: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
      'Agustus': { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
      'September': { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
      'Oktober': { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
      'November': { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
      'Desember': { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    };
    return colorMap[month] || { border: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
  };
  
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
    const ending = values.length ? values[values.length - 1] : 0;
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const bottom = values.length ? Math.min(...values) : 0;
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
  console.log("DPK Chart Viewer initializing...");

  initEventListeners();

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
