const state = {
  cabinetWidth: 60,
  cabinetHeight: 30,
  rows: 1,
  columns: 2,
  stileWidth: 2,
  railWidth: 2,
  endStiles: true,
  endRails: true,
};

const els = {
  cabinetWidth: document.getElementById("cabinet-width"),
  cabinetHeight: document.getElementById("cabinet-height"),
  rows: document.getElementById("rows"),
  columns: document.getElementById("columns"),
  stileWidth: document.getElementById("stile-width"),
  railWidth: document.getElementById("rail-width"),
  endStiles: document.getElementById("end-stiles"),
  endRails: document.getElementById("end-rails"),
  panelWidth: document.getElementById("panel-width"),
  stileCenterline: document.getElementById("stile-centerline"),
  panelHeight: document.getElementById("panel-height"),
  railCenterline: document.getElementById("rail-centerline"),
  verticalSpacing: document.getElementById("vertical-spacing"),
  horizontalSpacing: document.getElementById("horizontal-spacing"),
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

function parseFraction(str) {
  str = str.trim();
  if (/^-?\d+\s+\d+\/\d+$/.test(str)) {
    const [whole, frac] = str.split(/\s+/);
    const [num, den] = frac.split("/");
    return (
      Math.sign(parseFloat(whole)) *
      (Math.abs(parseFloat(whole)) + parseInt(num, 10) / parseInt(den, 10))
    );
  }
  if (/^-?\d+\/\d+$/.test(str)) {
    const [num, den] = str.split("/");
    return parseInt(num, 10) / parseInt(den, 10);
  }
  return parseFloat(str);
}

function normalizeInput(s) {
  return s
    .replace(/[''′]/g, "'")
    .replace(/[""″]/g, '"')
    .replace(/[×x]/gi, "*")
    .replace(/÷/g, "/")
    .replace(/[–—]/g, "-")
    .replace(/,/g, "")
    .replace(/\s*(['"])\s*/g, "$1");
}


function preprocess(s) {
  const n = normalizeInput(s);
  // Recreate regexes each call to avoid stateful lastIndex from /g flag
  const rxMixed    = /((?:\d*\.?\d+)(?:\s+\d+\/\d+)?)\s*'\s*((?:\d*\.?\d+)(?:\s+\d+\/\d+)?)?\s*"/g;
  const rxFt       = /((?:\d*\.?\d+)(?:\s+\d+\/\d+)?)\s*'/g;
  const rxIn       = /((?:\d*\.?\d+)(?:\s+\d+\/\d+)?)\s*"/g;
  const rxMixFrac  = /(-?\d+)\s+(\d+\/\d+)/g;
  const rxPureFrac = /-?\d+\/\d+/g;
  return n
    .replace(rxMixed,    (m, f, i) => parseFraction(f) * 12 + (i ? parseFraction(i) : 0))
    .replace(rxFt,       (m, f)    => parseFraction(f) * 12)
    .replace(rxIn,       (m, i)    => parseFraction(i))
    .replace(rxMixFrac,  (m, w, f) => `(${w}+(${f}))`)
    .replace(rxPureFrac, (m)       => `(${m})`);
}

function parseDimensionToInches(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value !== "string") {
    return NaN;
  }

  const input = value.trim();
  if (!input) {
    return NaN;
  }

  try {
    const preprocessed = preprocess(input);
    // Only allow safe math characters after preprocessing
    if (/[^0-9+\-*/().\s]/.test(preprocessed)) {
      return NaN;
    }
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${preprocessed})`)();
    if (typeof result !== "number" || !Number.isFinite(result)) {
      return NaN;
    }
    return result;
  } catch (_e) {
    return NaN;
  }
}

function calculate() {
  const stileCount = (state.columns - 1) + (state.endStiles ? 2 : 0);
  const railCount  = (state.rows - 1)    + (state.endRails  ? 2 : 0);
  const totalStileWidth = stileCount * state.stileWidth;
  const totalRailWidth  = railCount  * state.railWidth;
  const availablePanelWidth  = state.cabinetWidth  - totalStileWidth;
  const availablePanelHeight = state.cabinetHeight - totalRailWidth;
  const panelWidth  = availablePanelWidth  / state.columns;
  const panelHeight = availablePanelHeight / state.rows;
  const stileCenterline = stileCount >= 2
    ? panelWidth + state.stileWidth
    : stileCount === 1
      ? panelWidth + state.stileWidth / 2
      : null;
  const railCenterline = railCount >= 2
    ? panelHeight + state.railWidth
    : railCount === 1
      ? panelHeight + state.railWidth / 2
      : null;
  const verticalSpacing   = state.cabinetWidth  / state.columns;
  const horizontalSpacing = state.cabinetHeight / state.rows;

  return {
    panelWidth,
    panelHeight,
    stileCenterline,
    railCenterline,
    verticalSpacing,
    horizontalSpacing,
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
  const baseX = 80;
  const baseY = 70;
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

  const stileStep = state.stileWidth * scale + calculations.panelWidth * scale;
  const railStep  = state.railWidth  * scale + calculations.panelHeight * scale;
  const xOrigin   = state.endStiles ? baseX + state.stileWidth * scale : baseX;
  const yOrigin   = state.endRails  ? baseY + state.railWidth  * scale : baseY;

  for (let i = 0; i <= state.columns; i += 1) {
    const isEnd = i === 0 || i === state.columns;
    if (isEnd && !state.endStiles) continue;
    const x = state.endStiles
      ? baseX + i * stileStep
      : baseX + calculations.panelWidth * scale + (i - 1) * stileStep;
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
    const isEnd = i === 0 || i === state.rows;
    if (isEnd && !state.endRails) continue;
    const y = state.endRails
      ? baseY + i * railStep
      : baseY + calculations.panelHeight * scale + (i - 1) * railStep;
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
      const x = xOrigin + col * stileStep;
      const y = yOrigin + row * railStep;
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

  const labelStartY = 16;
  const labelLineHeight = 14;

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

  if (calculations.stileCenterline !== null && calculations.stileCenterline > 0) {
    widthGroup.appendChild(
      createSvgElement("text", {
        x: 0,
        y: labelLineHeight * 2,
        "text-anchor": "start",
        "font-size": 10,
        "font-weight": "bold",
        "font-family": "Courier New, monospace",
        fill: "#BC5215",
        "dominant-baseline": "hanging",
      })
    ).textContent = `STILE CL-CL: ${toFraction(calculations.stileCenterline)} IN`;
  }

  els.diagram.appendChild(widthGroup);

  const heightGroup = createSvgElement("g", {
    transform: `translate(28, ${baseY}) rotate(-90)`,
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

  if (calculations.railCenterline !== null && calculations.railCenterline > 0) {
    heightGroup.appendChild(
      createSvgElement("text", {
        x: 0,
        y: labelLineHeight * 2,
        "text-anchor": "end",
        "font-size": 10,
        "font-weight": "bold",
        "font-family": "Courier New, monospace",
        fill: "#5E409D",
        "dominant-baseline": "hanging",
      })
    ).textContent = `RAIL CL-CL: ${toFraction(calculations.railCenterline)} IN`;
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

  els.panelWidth.textContent = `${toFraction(calculations.panelWidth)}"`;
  els.stileCenterline.textContent = calculations.stileCenterline !== null ? `${toFraction(calculations.stileCenterline)}"` : "N/A";
  els.panelHeight.textContent = `${toFraction(calculations.panelHeight)}"`;
  els.railCenterline.textContent = calculations.railCenterline !== null ? `${toFraction(calculations.railCenterline)}"` : "N/A";
  els.verticalSpacing.textContent = `${toFraction(calculations.verticalSpacing)}"`;
  els.horizontalSpacing.textContent = `${toFraction(calculations.horizontalSpacing)}"`;

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

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const fallback = document.createElement("textarea");
  fallback.value = text;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.appendChild(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(fallback);

  if (!copied) {
    throw new Error("Copy failed");
  }
}

async function handleCopyValue(event) {
  const value = event.currentTarget.textContent.trim();

  try {
    await copyText(value);
    event.currentTarget.title = "Copied!";
  } catch (_error) {
    event.currentTarget.title = "Unable to copy";
  }

  setTimeout(() => {
    event.currentTarget.title = "Click to copy";
  }, 1200);
}

function setupCopyTarget(el) {
  el.setAttribute("title", "Click to copy");
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.addEventListener("click", handleCopyValue);
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCopyValue({ currentTarget: el });
    }
  });
}

bindInput(els.cabinetWidth, "cabinetWidth", parseDimensionToInches);
bindInput(els.cabinetHeight, "cabinetHeight", parseDimensionToInches);
bindInput(els.rows, "rows", clampRowsCols);
bindInput(els.columns, "columns", clampRowsCols);
bindInput(els.stileWidth, "stileWidth", parseDimensionToInches);
bindInput(els.railWidth, "railWidth", parseDimensionToInches);

els.endStiles.checked = state.endStiles;
els.endRails.checked  = state.endRails;
els.endStiles.addEventListener("change", () => { state.endStiles = els.endStiles.checked; update(); });
els.endRails.addEventListener("change",  () => { state.endRails  = els.endRails.checked;  update(); });

els.rows.classList.add("input-accent-green");
els.columns.classList.add("input-accent-green");
els.stileWidth.classList.add("input-accent-orange");
els.railWidth.classList.add("input-accent-orange");
setupCopyTarget(els.panelWidth);
setupCopyTarget(els.stileCenterline);
setupCopyTarget(els.panelHeight);
setupCopyTarget(els.railCenterline);
setupCopyTarget(els.verticalSpacing);
setupCopyTarget(els.horizontalSpacing);

update();
