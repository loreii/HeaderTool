"use strict";

const btnOn = document.getElementById("btn-on");
const btnOff = document.getElementById("btn-off");
const btnWget = document.getElementById("btn-wget");
const btnCurl = document.getElementById("btn-curl");
const btnImport = document.getElementById("btn-import");
const btnExport = document.getElementById("btn-export");
const cjsCheckbox = document.getElementById("cjs");
const headerText = document.getElementById("headerText");
const fileInput = document.getElementById("file-input");

// Toast notification
function showToast(msg) {
  let existing = document.querySelector(".toast");
  if (existing) existing.remove();

  let toast = document.createElement("div");
  toast.className = "toast show";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

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

// ON / OFF
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

// Continuous JS
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

// wget / curl clipboard
btnWget.addEventListener("click", () => {
  browser.runtime.sendMessage({ action: "serializeWget" }).then((resp) => {
    navigator.clipboard.writeText(resp.result).then(() => {
      showToast("Headers copied (wget format)");
    });
  });
});

btnCurl.addEventListener("click", () => {
  browser.runtime.sendMessage({ action: "serializeCurl" }).then((resp) => {
    navigator.clipboard.writeText(resp.result).then(() => {
      showToast("Headers copied (curl format)");
    });
  });
});

// Import
btnImport.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = (ev) => {
    headerText.value = ev.target.result;
    browser.runtime.sendMessage({ action: "importConfig", text: ev.target.result });
    showToast("Headers imported from " + file.name);
  };
  reader.readAsText(file);
  fileInput.value = "";
});

// Export
btnExport.addEventListener("click", () => {
  browser.runtime.sendMessage({ action: "exportConfig" }).then((resp) => {
    let blob = new Blob([resp.text], { type: "text/plain" });
    let url = URL.createObjectURL(blob);
    browser.downloads.download({
      url: url,
      filename: "headertool-config.txt",
      saveAs: true
    }).then(() => {
      showToast("Headers exported");
    }).catch(() => {
      // Fallback: use anchor download
      let a = document.createElement("a");
      a.href = url;
      a.download = "headertool-config.txt";
      a.click();
      showToast("Headers exported");
    });
  });
});
