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
let currentTabUrl = "";

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

// ============================================================
// Crypto utilities using Web Crypto API (async, but we pre-compute)
// ============================================================

async function cryptoHash(algorithm, message) {
  const algMap = {
    "md5": null, // Web Crypto doesn't support MD5, use fallback
    "sha1": "SHA-1",
    "sha256": "SHA-256",
    "sha384": "SHA-384",
    "sha512": "SHA-512"
  };

  if (algorithm === "md5") {
    return md5Fallback(message);
  }

  const alg = algMap[algorithm];
  if (!alg) return "[unsupported algorithm]";

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest(alg, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => ("0" + b.toString(16)).slice(-2)).join("");
}

// MD5 implementation (Web Crypto doesn't support it)
function md5Fallback(string) {
  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }

  function md5blk(s) {
    let md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
  }

  let n = string.length;
  let state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(string.substring(i - 64, i)));
  }
  string = string.substring(i - 64);
  let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 0; i < string.length; i++) {
    tail[i >> 2] |= string.charCodeAt(i) << ((i % 4) << 3);
  }
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);

  function rhex(n) {
    let s = "";
    for (let j = 0; j < 4; j++) {
      s += ("0" + ((n >> (j * 8)) & 0xFF).toString(16)).slice(-2);
    }
    return s;
  }
  return rhex(state[0]) + rhex(state[1]) + rhex(state[2]) + rhex(state[3]);
}

// ============================================================
// Track active tab URL for utility functions
// ============================================================

function updateCurrentTabUrl() {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs[0] && tabs[0].url) {
      currentTabUrl = tabs[0].url;
    }
  }).catch(() => {});
}

browser.tabs.onActivated.addListener(updateCurrentTabUrl);
browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) updateCurrentTabUrl();
});
updateCurrentTabUrl();

// ============================================================
// JS Engine: evaluate ${...} expressions safely
// ============================================================

function getUrlParts() {
  try {
    let url = new URL(currentTabUrl);
    return {
      href: url.href,
      hostname: url.hostname,
      pathname: url.pathname,
      search: url.search
    };
  } catch (e) {
    return { href: "", hostname: "", pathname: "", search: "" };
  }
}

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
      let urlParts = getUrlParts();
      // Use Function constructor instead of eval (AMO-safe)
      let fn = new Function(
        "b64", "href", "hostname", "pathname", "search",
        "getPathname", "getSearch",
        "md5", "sha1", "sha256", "crypto",
        "previous", "next",
        code
      );
      result = fn(
        function(x) { return btoa(x); },
        function() { return urlParts.href; },
        function() { return urlParts.hostname; },
        function() { return urlParts.pathname; },
        function() { return urlParts.search; },
        function() { return urlParts.pathname; },
        function() { return urlParts.search; },
        function(x) { return md5Fallback(x); },
        function(x) { return "__sha1_pending__"; },
        function(x) { return "__sha256_pending__"; },
        function(alg, x) { return "__crypto_pending__"; },
        function() { return ""; },
        function() { return ""; }
      );
    } catch (e) {
      console.error("[HeaderTool] JS eval error:", code, e);
      result = " [error] ";
    }
    text = text.substring(0, jsStart) + result + text.substring(jsEnd + 1);
  }
  return text;
}

// Async version of jsEngine for crypto support
async function jsEngineAsync(text) {
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
      let urlParts = getUrlParts();
      // Use AsyncFunction for crypto support
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      let fn = new AsyncFunction(
        "b64", "href", "hostname", "pathname", "search",
        "getPathname", "getSearch",
        "md5", "sha1", "sha256", "crypto",
        "previous", "next",
        code
      );
      result = await fn(
        function(x) { return btoa(x); },
        function() { return urlParts.href; },
        function() { return urlParts.hostname; },
        function() { return urlParts.pathname; },
        function() { return urlParts.search; },
        function() { return urlParts.pathname; },
        function() { return urlParts.search; },
        function(x) { return md5Fallback(x); },
        async function(x) { return await cryptoHash("sha1", x); },
        async function(x) { return await cryptoHash("sha256", x); },
        async function(alg, x) { return await cryptoHash(alg, x); },
        function() { return ""; },
        function() { return ""; }
      );
    } catch (e) {
      console.error("[HeaderTool] JS eval error:", code, e);
      result = " [error] ";
    }
    text = text.substring(0, jsStart) + result + text.substring(jsEnd + 1);
  }
  return text;
}

// ============================================================
// Header parsing
// ============================================================

function parseHeaders(text) {
  headerMap = {};
  text = jsEngine(text);

  let lines = text.split("\n");
  let currentMap = {};
  let regexp = "^.";

  for (let line of lines) {
    if (line.length < 2 || line.charAt(0) === "#") continue;

    if (line.charAt(0) === "@") {
      headerMap[regexp] = currentMap;
      currentMap = {};
      regexp = line.substring(1).trim();
      continue;
    }

    if (line.indexOf(":") === -1) continue;

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

async function parseHeadersAsync(text) {
  headerMap = {};
  text = await jsEngineAsync(text);

  let lines = text.split("\n");
  let currentMap = {};
  let regexp = "^.";

  for (let line of lines) {
    if (line.length < 2 || line.charAt(0) === "#") continue;

    if (line.charAt(0) === "@") {
      headerMap[regexp] = currentMap;
      currentMap = {};
      regexp = line.substring(1).trim();
      continue;
    }

    if (line.indexOf(":") === -1) continue;

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

// ============================================================
// Header modification (webRequest listener)
// ============================================================

function modifyHeaders(details) {
  if (!enabled) return {};
  if (shouldSkipURL(details.url)) return {};

  // If continuous JS, re-parse synchronously on each request
  if (continuousJS) {
    parseHeaders(headerText);
  }

  let headers = details.requestHeaders;

  for (let pattern in headerMap) {
    let patt;
    try {
      patt = new RegExp(pattern, "i");
    } catch (e) {
      console.error("[HeaderTool] Invalid regex:", pattern, e);
      continue;
    }
    if (!patt.test(details.url)) continue;

    for (let name in headerMap[pattern]) {
      let value = headerMap[pattern][name];
      let trimmedValue = value.replace(/\s/g, "");

      let found = false;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].name.toLowerCase() === name.toLowerCase()) {
          if (trimmedValue === "") {
            headers.splice(i, 1);
          } else {
            headers[i].value = value.trim();
          }
          found = true;
          break;
        }
      }

      if (!found && trimmedValue !== "") {
        headers.push({ name: name, value: value.trim() });
      }
    }
  }

  return { requestHeaders: headers };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  modifyHeaders,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

// ============================================================
// Clipboard / serialize utilities
// ============================================================

function serializeHeaders(text, trailing) {
  text = jsEngine(text);
  let lines = text.split("\n");
  let result = "";
  for (let line of lines) {
    if (line.length < 2 || line.charAt(0) === "#") continue;
    if (line.charAt(0) === "@") continue;
    if (line.indexOf(":") === -1) continue;

    let commentIdx = line.indexOf("#");
    if (commentIdx > -1) {
      line = line.substring(0, commentIdx);
    }

    result += " " + trailing + "'" + line.trim() + "' \\\n";
  }
  return result;
}

// ============================================================
// State management
// ============================================================

// Load saved state on startup
browser.storage.local.get(["enabled", "headerText", "continuousJS"]).then(async (data) => {
  if (data.enabled !== undefined) enabled = data.enabled;
  if (data.headerText !== undefined) headerText = data.headerText;
  if (data.continuousJS !== undefined) continuousJS = data.continuousJS;
  if (enabled && headerText) {
    await parseHeadersAsync(headerText);
  }
});

// Listen for messages from sidebar/popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "enable":
      headerText = message.text || headerText;
      parseHeadersAsync(headerText).then(() => {
        enabled = true;
        browser.storage.local.set({ enabled: true, headerText: headerText });
      });
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
      if (enabled) {
        parseHeadersAsync(headerText);
      }
      break;

    case "serializeWget":
      sendResponse({ result: serializeHeaders(headerText, "--header=") });
      return true;

    case "serializeCurl":
      sendResponse({ result: serializeHeaders(headerText, "-H ") });
      return true;

    case "exportConfig":
      sendResponse({ text: headerText });
      return true;

    case "importConfig":
      headerText = message.text;
      browser.storage.local.set({ headerText: headerText });
      if (enabled) parseHeadersAsync(headerText);
      break;
  }
});
