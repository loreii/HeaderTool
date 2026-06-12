"use strict";

const btnOn = document.getElementById("btn-on");
const btnOff = document.getElementById("btn-off");
const cjsCheckbox = document.getElementById("cjs");
const headerText = document.getElementById("headerText");

// Load state from background
browser.runtime.sendMessage({ action: "getState" }).then((state) => {
  if (state) {
    headerText.value = state.headerText || "";
    cjsCheckbox.checked = state.continuousJS || false;
    if (state.enabled) {
      btnOn.disabled = true;
      btnOff.disabled = false;
    }
  }
});

btnOn.addEventListener("click", () => {
  browser.runtime.sendMessage({ action: "enable", text: headerText.value });
  btnOn.disabled = true;
  btnOff.disabled = false;
});

btnOff.addEventListener("click", () => {
  browser.runtime.sendMessage({ action: "disable" });
  btnOn.disabled = false;
  btnOff.disabled = true;
});

cjsCheckbox.addEventListener("change", () => {
  browser.runtime.sendMessage({ action: "setContinuousJS", value: cjsCheckbox.checked });
});

// Auto-save text on input
let saveTimeout;
headerText.addEventListener("input", () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    browser.runtime.sendMessage({ action: "updateText", text: headerText.value });
  }, 500);
});
