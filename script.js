const state = {
  cabinetWidth: 60,
  cabinetHeight: 30,
  rows: 1,
  columns: 2,
  stileWidth: 2,
  railWidth: 2,
};

const els = {
  cabinetWidth: document.getElementById("cabinet-width"),
  cabinetHeight: document.getElementById("cabinet-height"),
  rows: document.getElementById("rows"),
  columns: document.getElementById("columns"),
  stileWidth: document.getElementById("stile-width"),
  railWidth: document.getElementById("rail-width"),
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

function parseFraction(value) {
  const match = value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) {
    return NaN;
  }
  const numerator = parseInt(match[1], 10);
  const denominator = parseInt(match[2], 10);
  if (denominator === 0) {
    return NaN;
  }
  return numerator / denominator;
}

function parseDimensionToInches(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value !== "string") {
    return NaN;
  }

  let input = value.trim();
  if (!input) {
    return NaN;
  }

  let sign = 1;
  if (input.startsWith("-")) {
    sign = -1;
    input = input.slice(1).trim();
  }

  let feet = 0;
  const feetMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:'|ft)\s*/i);
  if (feetMatch) {
    feet = parseFloat(feetMatch[1]);
    input = input.replace(feetMatch[0], "");
  }

  input = input
    .replace(/(?:inches|inch|in)\b/gi, "")
    .replace(/"/g, "")
    .trim();

  if (!input) {
    return sign * feet * 12;
  }

  input = input.replace(/(\d)\s*-\s*(\d)/g, "$1 $2");

  let inches = 0;
  let fraction = 0;
  let invalid = false;

  if (input.includes("/")) {
    const parts = input.split(/\s+/);
    if (parts.length === 1) {
      fraction = parseFraction(parts[0]);
      if (!Number.isFinite(fraction)) {
        invalid = true;
      }
    } else {
      const fractionPart = parts[parts.length - 1];
      const wholePart = parts.slice(0, -1).join(" ");
      inches = parseFloat(wholePart);
      if (!Number.isFinite(inches)) {
        invalid = true;
      }
      fraction = parseFraction(fractionPart);
      if (!Number.isFinite(fraction)) {
        invalid = true;
      }
    }
  } else {
    inches = parseFloat(input);
    if (!Number.isFinite(inches)) {
      invalid = true;
    }
  }

  if (invalid) {
    return NaN;
  }

  return sign * (feet * 12 + inches + fraction);
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

  const labelStartY = 18;
  const labelLineHeight = 16;

  const widthGroup = createSvgElement("g", {
    transform: `translate(${baseX}, ${labelStartY})`,
  });

  widthGroup.appendChild(
    createSvgElement("text", {
      x: 0,
      y: 0,
      "text-anchor": "start",
      "font-size": 12,
      "font-weight": "bold",
      "font-family": "Courier New, monospace",
      fill: "#100F0F",
      "dominant-baseline": "hanging",
    })
  ).textContent = `${toFraction(state.cabinetWidth)} IN TOTAL WIDTH`;

  if (calculations.panelWidth > 0) {
    widthGroup.appendChild(
      createSvgElement("text", {
        x: 0,
        y: labelLineHeight,
        "text-anchor": "start",
        "font-size": 11,
        "font-weight": "bold",
        "font-family": "Courier New, monospace",
        fill: "#205EA6",
        "dominant-baseline": "hanging",
      })
    ).textContent = `PANEL: ${toFraction(calculations.panelWidth)} IN W`;
  }

  els.diagram.appendChild(widthGroup);

  const heightGroup = createSvgElement("g", {
    transform: `translate(18, 50) rotate(-90)`,
  });

  heightGroup.appendChild(
    createSvgElement("text", {
      x: 0,
      y: 0,
      "text-anchor": "end",
      "font-size": 12,
      "font-weight": "bold",
      "font-family": "Courier New, monospace",
      fill: "#100F0F",
      "dominant-baseline": "hanging",
    })
  ).textContent = `${toFraction(state.cabinetHeight)} IN TOTAL HEIGHT`;

  if (calculations.panelHeight > 0) {
    heightGroup.appendChild(
      createSvgElement("text", {
        x: 0,
        y: labelLineHeight,
        "text-anchor": "end",
        "font-size": 11,
        "font-weight": "bold",
        "font-family": "Courier New, monospace",
        fill: "#24837B",
        "dominant-baseline": "hanging",
      })
    ).textContent = `PANEL: ${toFraction(calculations.panelHeight)} IN H`;
  }

  els.diagram.appendChild(heightGroup);
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

  els.panelWidth.textContent = toFraction(calculations.panelWidth);
  els.panelHeight.textContent = toFraction(calculations.panelHeight);
  els.panelTotal.textContent = String(state.rows * state.columns);

  renderSvg(calculations);
}

function bindInput(el, key, parser) {
  el.value = state[key];
  const handleChange = (event) => {
    const value = parser(event.target.value);
    state[key] = Number.isFinite(value) ? value : 0;
    update();
  };
  el.addEventListener("input", handleChange);
  el.addEventListener("change", handleChange);
}

function clampRowsCols(value) {
  const numeric = parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric < 1) {
    return 0;
  }
  return numeric;
}

bindInput(els.cabinetWidth, "cabinetWidth", parseDimensionToInches);
bindInput(els.cabinetHeight, "cabinetHeight", parseDimensionToInches);
bindInput(els.rows, "rows", clampRowsCols);
bindInput(els.columns, "columns", clampRowsCols);
bindInput(els.stileWidth, "stileWidth", parseDimensionToInches);
bindInput(els.railWidth, "railWidth", parseDimensionToInches);

els.rows.classList.add("input-accent-green");
els.columns.classList.add("input-accent-green");
els.stileWidth.classList.add("input-accent-orange");
els.railWidth.classList.add("input-accent-orange");

update();
