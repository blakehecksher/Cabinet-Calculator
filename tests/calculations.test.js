const assert = require("node:assert/strict");

function createElement() {
  return {
    value: "",
    checked: false,
    textContent: "",
    title: "",
    style: {},
    classList: {
      add() {},
      toggle() {},
    },
    setAttribute() {},
    addEventListener() {},
    appendChild(child) {
      return child;
    },
    removeChild() {},
    select() {},
  };
}

global.document = {
  body: createElement(),
  getElementById() {
    return createElement();
  },
  createElement() {
    return createElement();
  },
  createElementNS() {
    return createElement();
  },
  execCommand() {
    return true;
  },
};

global.window = { isSecureContext: false };
global.navigator = {};

const {
  state,
  calculate,
  parseDimensionToInches,
  toFraction,
  validateState,
} = require("../script.js");

function setState(overrides) {
  Object.assign(state, {
    cabinetWidth: 60,
    cabinetHeight: 30,
    rows: 2,
    columns: 2,
    stileWidth: 2,
    railWidth: 2,
    endStiles: true,
    endRails: true,
  }, overrides);
}

function nearlyEqual(actual, expected, label) {
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${label}: expected ${expected}, got ${actual}`
  );
}

function assertReconstructs(overrides) {
  setState(overrides);
  assert.equal(validateState().isValid, true);

  const result = calculate();
  const stileCount = (state.columns - 1) + (state.endStiles ? 2 : 0);
  const railCount = (state.rows - 1) + (state.endRails ? 2 : 0);

  nearlyEqual(
    result.panelWidth * state.columns + stileCount * state.stileWidth,
    state.cabinetWidth,
    "width reconstruction"
  );
  nearlyEqual(
    result.panelHeight * state.rows + railCount * state.railWidth,
    state.cabinetHeight,
    "height reconstruction"
  );

  const expectedStileCenterline = stileCount >= 2
    ? result.panelWidth + state.stileWidth
    : null;
  const expectedRailCenterline = railCount >= 2
    ? result.panelHeight + state.railWidth
    : null;

  assert.equal(result.stileCenterline, expectedStileCenterline);
  assert.equal(result.railCenterline, expectedRailCenterline);
}

[
  { endStiles: true, endRails: true },
  { endStiles: false, endRails: true },
  { endStiles: true, endRails: false },
  { endStiles: false, endRails: false },
  { columns: 1, rows: 1, endStiles: true, endRails: true },
  { columns: 1, rows: 1, endStiles: false, endRails: false },
  { columns: 2, rows: 2, endStiles: false, endRails: false },
  { columns: 3, rows: 3, endStiles: false, endRails: false },
].forEach(assertReconstructs);

setState({ columns: 2, rows: 2, endStiles: false, endRails: false });
let result = calculate();
assert.equal(result.stileCenterline, null);
assert.equal(result.railCenterline, null);

setState({ columns: 3, rows: 3, endStiles: false, endRails: false });
result = calculate();
nearlyEqual(result.stileCenterline, result.panelWidth + state.stileWidth, "interior stile CL-CL");
nearlyEqual(result.railCenterline, result.panelHeight + state.railWidth, "interior rail CL-CL");

assert.equal(parseDimensionToInches("2' 10 1/2\""), 34.5);
assert.equal(parseDimensionToInches("1 1/2"), 1.5);
assert.equal(toFraction(29.125), "29 1/8");

console.log("Calculation tests passed");
