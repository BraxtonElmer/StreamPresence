const ENDPOINT = "http://127.0.0.1:8731/update";
const CLEAR = "http://127.0.0.1:8731/clear";

let lastSentByTab = new Map();
const POST_INTERVAL_MS = 15000;

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!sender?.tab) return;

  if (msg?.type === "presence") {
    const now = Date.now();
    const last = lastSentByTab.get(sender.tab.id) || 0;
    if (now - last < POST_INTERVAL_MS && !msg.immediate) return;
    lastSentByTab.set(sender.tab.id, now);

    fetch(ENDPOINT, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(msg.payload)
    }).catch(() => {});
  }

  if (msg?.type === "clear") {
    fetch(CLEAR, { method: "POST" }).catch(() => {});
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  lastSentByTab.delete(tabId);
  fetch(CLEAR, { method: "POST" }).catch(() => {});
});
