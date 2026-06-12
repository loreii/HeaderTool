"use strict";

const statusEl = document.getElementById("status");
const toggleBtn = document.getElementById("toggle");
const sidebarBtn = document.getElementById("open-sidebar");

function updateUI(enabled) {
  statusEl.textContent = enabled ? "ON" : "OFF";
  statusEl.className = "status " + (enabled ? "on" : "off");
}

browser.runtime.sendMessage({ action: "getState" }).then((state) => {
  if (state) updateUI(state.enabled);
});

toggleBtn.addEventListener("click", () => {
  browser.runtime.sendMessage({ action: "getState" }).then((state) => {
    if (state.enabled) {
      browser.runtime.sendMessage({ action: "disable" });
      updateUI(false);
    } else {
      browser.runtime.sendMessage({ action: "enable" });
      updateUI(true);
    }
  });
});

sidebarBtn.addEventListener("click", () => {
  browser.sidebarAction.open();
  window.close();
});
