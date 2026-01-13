const state = {
  cabinetWidth: 24,
  cabinetHeight: 30,
  rows: 2,
  columns: 2,
  stileWidth: 1.5,
  railWidth: 1.5,
};

const els = {
  cabinetWidth: document.getElementById("cabinet-width"),
  cabinetHeight: document.getElementById("cabinet-height"),
  rows: document.getElementById("rows"),
  columns: document.getElementById("columns"),
  stileWidth: document.getElementById("stile-width"),
  railWidth: document.getElementById("rail-width"),
  statusStiles: document.getElementById("status-stiles"),
  statusRails: document.getElementById("status-rails"),
  statusAvailable: document.getElementById("status-available"),
  panelWidth: document.getElementById("panel-width"),
  panelHeight: document.getElementById("panel-height"),
  panelTotal: document.getElementById("panel-total"),
  diagram: document.getElementById("diagram"),
};

function toFraction(decimal) {
  const whole = Math.floor(decimal);
  const remainder = decimal - whole;

  if (remainder === 0) {
    return String(whole);
  }

  const thirtySeconds = Math.round(remainder * 32);

  if (thirtySeconds === 0) {
    return String(whole);
  }

  if (thirtySeconds === 32) {
    return String(whole + 1);
  }

  let num = thirtySeconds;
  let den = 32;

  for (let i = 16; i > 1; i -= 1) {
    if (num % i === 0 && den % i === 0) {
      num = num / i;
      den = den / i;
      break;
    }
  }

  const wholeStr = whole > 0 ? `${whole} ` : "";
  return `${wholeStr}${num}/${den}`;
}

function calculate() {
  const totalStileWidth = (state.columns + 1) * state.stileWidth;
  const totalRailWidth = (state.rows + 1) * state.railWidth;
  const availablePanelWidth = state.cabinetWidth - totalStileWidth;
  const availablePanelHeight = state.cabinetHeight - totalRailWidth;
  const panelWidth = availablePanelWidth / state.columns;
  const panelHeight = availablePanelHeight / state.rows;

  return {
    panelWidth,
    panelHeight,
    totalStileWidth,
    totalRailWidth,
    availablePanelWidth,
    availablePanelHeight,
  };
}

function createSvgElement(tag, attributes) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      el.setAttribute(key, String(value));
    }
  });
  return el;
}

function renderSvg(calculations) {
  const baseX = 50;
  const baseY = 50;
  const scale = Math.min(350 / state.cabinetWidth, 280 / state.cabinetHeight);

  els.diagram.innerHTML = "";

  els.diagram.appendChild(
    createSvgElement("rect", {
      x: baseX,
      y: baseY,
      width: state.cabinetWidth * scale,
      height: state.cabinetHeight * scale,
      fill: "none",
      stroke: "#100F0F",
      "stroke-width": 3,
    })
  );

  for (let i = 0; i <= state.columns; i += 1) {
    const x = baseX + i * (state.stileWidth * scale + calculations.panelWidth * scale);
    els.diagram.appendChild(
      createSvgElement("rect", {
        x,
        y: baseY,
        width: state.stileWidth * scale,
        height: state.cabinetHeight * scale,
        fill: "#BC5215",
        stroke: "#100F0F",
        "stroke-width": 1,
      })
    );
  }

  for (let i = 0; i <= state.rows; i += 1) {
    const y = baseY + i * (state.railWidth * scale + calculations.panelHeight * scale);
    els.diagram.appendChild(
      createSvgElement("rect", {
        x: baseX,
        y,
        width: state.cabinetWidth * scale,
        height: state.railWidth * scale,
        fill: "#BC5215",
        stroke: "#100F0F",
        "stroke-width": 1,
      })
    );
  }

  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.columns; col += 1) {
      const x =
        baseX +
        state.stileWidth * scale +
        col * (state.stileWidth * scale + calculations.panelWidth * scale);
      const y =
        baseY +
        state.railWidth * scale +
        row * (state.railWidth * scale + calculations.panelHeight * scale);

      els.diagram.appendChild(
        createSvgElement("rect", {
          x,
          y,
          width: calculations.panelWidth * scale,
          height: calculations.panelHeight * scale,
          fill: "#F2F0E5",
          stroke: "#878580",
          "stroke-width": 1,
        })
      );
    }
  }

  els.diagram.appendChild(
    createSvgElement("text", {
      x: baseX + (state.cabinetWidth * scale) / 2,
      y: 35,
      "text-anchor": "middle",
      "font-size": 12,
      "font-weight": "bold",
      "font-family": "Courier New, monospace",
      fill: "#100F0F",
    })
  ).textContent = `${toFraction(state.cabinetWidth)} IN TOTAL WIDTH`;

  els.diagram.appendChild(
    createSvgElement("text", {
      x: 25,
      y: baseY + (state.cabinetHeight * scale) / 2,
      "text-anchor": "middle",
      "font-size": 12,
      "font-weight": "bold",
      "font-family": "Courier New, monospace",
      fill: "#100F0F",
      transform: `rotate(-90, 25, ${baseY + (state.cabinetHeight * scale) / 2})`,
    })
  ).textContent = `${toFraction(state.cabinetHeight)} IN TOTAL HEIGHT`;

  if (calculations.panelWidth > 0 && calculations.panelHeight > 0) {
    els.diagram.appendChild(
      createSvgElement("text", {
        x: baseX + state.stileWidth * scale + (calculations.panelWidth * scale) / 2,
        y: baseY + state.cabinetHeight * scale + 25,
        "text-anchor": "middle",
        "font-size": 11,
        "font-weight": "bold",
        "font-family": "Courier New, monospace",
        fill: "#205EA6",
      })
    ).textContent = `PANEL: ${toFraction(calculations.panelWidth)} IN W`;

    els.diagram.appendChild(
      createSvgElement("text", {
        x: baseX + state.cabinetWidth * scale + 35,
        y: baseY + state.railWidth * scale + (calculations.panelHeight * scale) / 2,
        "text-anchor": "middle",
        "font-size": 11,
        "font-weight": "bold",
        "font-family": "Courier New, monospace",
        fill: "#24837B",
        transform: `rotate(-90, ${baseX + state.cabinetWidth * scale + 35}, ${
          baseY + state.railWidth * scale + (calculations.panelHeight * scale) / 2
        })`,
      })
    ).textContent = `PANEL: ${toFraction(calculations.panelHeight)} IN H`;
  }
}

function updateValidation() {
  const rowValid = state.rows >= 1;
  const colValid = state.columns >= 1;

  els.rows.classList.toggle("input-invalid", !rowValid);
  els.columns.classList.toggle("input-invalid", !colValid);
}

function update() {
  updateValidation();
  const calculations = calculate();

  els.statusStiles.textContent = `TOTAL STILE WIDTH: ${calculations.totalStileWidth.toFixed(3)} IN`;
  els.statusRails.textContent = `TOTAL RAIL WIDTH: ${calculations.totalRailWidth.toFixed(3)} IN`;
  els.statusAvailable.textContent = `AVAILABLE PANEL SPACE: ${calculations.availablePanelWidth.toFixed(
    3
  )} A- ${calculations.availablePanelHeight.toFixed(3)} IN`;

  els.panelWidth.textContent = toFraction(calculations.panelWidth);
  els.panelHeight.textContent = toFraction(calculations.panelHeight);
  els.panelTotal.textContent = String(state.rows * state.columns);

  renderSvg(calculations);
}

function bindInput(el, key, parser) {
  el.value = state[key];
  el.addEventListener("input", (event) => {
    const value = parser(event.target.value);
    state[key] = Number.isFinite(value) ? value : 0;
    update();
  });
}

function clampRowsCols(value) {
  const numeric = parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric < 1) {
    return 0;
  }
  return numeric;
}

bindInput(els.cabinetWidth, "cabinetWidth", (value) => parseFloat(value));
bindInput(els.cabinetHeight, "cabinetHeight", (value) => parseFloat(value));
bindInput(els.rows, "rows", clampRowsCols);
bindInput(els.columns, "columns", clampRowsCols);
bindInput(els.stileWidth, "stileWidth", (value) => parseFloat(value));
bindInput(els.railWidth, "railWidth", (value) => parseFloat(value));

els.rows.classList.add("input-accent-green");
els.columns.classList.add("input-accent-green");
els.stileWidth.classList.add("input-accent-orange");
els.railWidth.classList.add("input-accent-orange");

update();
