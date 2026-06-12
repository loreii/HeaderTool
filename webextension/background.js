/*
Header Tool - WebExtension port
Copyright (C) 2011-2024 Lorenzo Pavesi
License: GPL-2.0
*/

"use strict";

let headerMap = {};
let enabled = false;
let continuousJS = false;
let headerText = "";

// Mozilla internal domains to skip
const SKIP_DOMAINS = [
  "services.mozilla.com",
  "sync.services.mozilla.com",
  "accounts.firefox.com",
  "oauth.accounts.firefox.com",
  "token.services.mozilla.com",
  "aus5.mozilla.org",
  "telemetry.mozilla.org"
];

function shouldSkipURL(url) {
  for (let domain of SKIP_DOMAINS) {
    if (url.indexOf(domain) > -1) {
      return true;
    }
  }
  return false;
}

// JS engine: evaluate ${...} expressions in header text
function jsEngine(text) {
  let jsStart;
  while ((jsStart = text.indexOf("${")) > -1) {
    let jsEnd = -1;
    let code;
    do {
      jsEnd = text.indexOf("}", jsEnd + 1);
      if (jsEnd === -1) {
        jsEnd = text.length;
        break;
      }
      code = text.substring(jsStart + 2, jsEnd);
      let openBraces = 0;
      for (let i = 0; i < code.length; i++) {
        if (code.charAt(i) === "{") openBraces++;
        else if (code.charAt(i) === "}") openBraces--;
      }
      if (openBraces === 0) break;
    } while (true);

    let result;
    try {
      // Provide utility functions in the evaluation context
      const evalCode = `
        (function() {
          function b64(x) { return btoa(x); }
          ${code}
        })()
      `;
      result = eval(evalCode);
    } catch (e) {
      console.error("[HeaderTool] JS eval error:", code, e);
      result = " [error] ";
    }
    text = text.substring(0, jsStart) + result + text.substring(jsEnd + 1);
  }
  return text;
}

// Parse header text into headerMap
function parseHeaders(text) {
  headerMap = {};

  if (continuousJS) {
    text = jsEngine(text);
  }

  let lines = text.split("\n");
  let currentMap = {};
  let regexp = "^.";

  for (let line of lines) {
    // Skip short lines and comments
    if (line.length < 2 || line.charAt(0) === "#") continue;

    // Regexp marker
    if (line.charAt(0) === "@") {
      headerMap[regexp] = currentMap;
      currentMap = {};
      regexp = line.substring(1).trim();
      continue;
    }

    // Must contain a colon
    if (line.indexOf(":") === -1) continue;

    // Strip inline comments
    let commentIdx = line.indexOf("#");
    if (commentIdx > -1) {
      line = line.substring(0, commentIdx);
    }

    let colonIdx = line.indexOf(":");
    let headerName = line.substring(0, colonIdx).replace(/\s/g, "");
    let headerValue = line.substring(colonIdx + 1);

    currentMap[headerName] = headerValue;
  }

  headerMap[regexp] = currentMap;
}

// Apply headers to requests
function modifyHeaders(details) {
  if (!enabled) return {};
  if (shouldSkipURL(details.url)) return {};

  // If continuous JS, re-parse every time
  if (continuousJS) {
    parseHeaders(headerText);
  }

  let headers = details.requestHeaders;

  for (let pattern in headerMap) {
    let patt = new RegExp(pattern, "i");
    if (!patt.test(details.url)) continue;

    for (let name in headerMap[pattern]) {
      let value = headerMap[pattern][name];
      let trimmedValue = value.replace(/\s/g, "");

      // Find existing header
      let found = false;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].name.toLowerCase() === name.toLowerCase()) {
          if (trimmedValue === "") {
            // Empty value = remove header
            headers.splice(i, 1);
          } else {
            headers[i].value = value.trim();
          }
          found = true;
          break;
        }
      }

      // Add new header if not found and value is not empty
      if (!found && trimmedValue !== "") {
        headers.push({ name: name, value: value.trim() });
      }
    }
  }

  return { requestHeaders: headers };
}

// Register the webRequest listener
browser.webRequest.onBeforeSendHeaders.addListener(
  modifyHeaders,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

// Load saved state on startup
browser.storage.local.get(["enabled", "headerText", "continuousJS"]).then((data) => {
  if (data.enabled !== undefined) enabled = data.enabled;
  if (data.headerText !== undefined) {
    headerText = data.headerText;
    if (enabled) parseHeaders(headerText);
  }
  if (data.continuousJS !== undefined) continuousJS = data.continuousJS;
});

// Listen for messages from sidebar/popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "enable":
      headerText = message.text || headerText;
      parseHeaders(headerText);
      enabled = true;
      browser.storage.local.set({ enabled: true, headerText: headerText });
      break;

    case "disable":
      enabled = false;
      headerMap = {};
      browser.storage.local.set({ enabled: false });
      break;

    case "setContinuousJS":
      continuousJS = message.value;
      browser.storage.local.set({ continuousJS: continuousJS });
      break;

    case "getState":
      sendResponse({
        enabled: enabled,
        headerText: headerText,
        continuousJS: continuousJS
      });
      return true;

    case "updateText":
      headerText = message.text;
      browser.storage.local.set({ headerText: headerText });
      if (enabled) parseHeaders(headerText);
      break;
  }
});
