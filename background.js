const DEFAULTS = { enabled: true, volume: 0.8, notify: true };
const lastFinishedByTab = new Map();
const notificationTabs = new Map();

async function getSettings() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
}

function cleanTitle(title) {
  const value = String(title || "").replace(/\s*[-â€“â€”]\s*ChatGPT\s*$/i, "").trim();
  return value && value.toLowerCase() !== "chatgpt" ? value : "ChatGPT";
}

async function ensureOffscreen() {
  let exists = false;
  if (chrome.offscreen.hasDocument) exists = await chrome.offscreen.hasDocument();
  else {
    const contexts = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] });
    exists = contexts.length > 0;
  }
  if (!exists) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play a sound when a ChatGPT response finishes."
    });
  }
}

async function play(volume) {
  await ensureOffscreen();
  chrome.runtime.sendMessage({ target: "offscreen", type: "play", volume });
}

async function notify(tabId, title) {
  const id = `chatgpt-finished-${tabId ?? "x"}-${Date.now()}`;
  if (tabId !== null && tabId !== undefined) notificationTabs.set(id, tabId);
  await chrome.notifications.create(id, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon128.png"),
    title: "ChatGPT terminado",
    message: cleanTitle(title),
    contextMessage: tabId == null ? "Notification test" : "Click to open this chat",
    priority: 1,
    silent: true
  });
}

async function finished(message, sender) {
  const tabId = sender.tab?.id ?? null;
  const now = Date.now();
  if (tabId !== null && now - (lastFinishedByTab.get(tabId) || 0) < 3000) return;
  if (tabId !== null) lastFinishedByTab.set(tabId, now);
  const settings = await getSettings();
  if (settings.enabled) await play(settings.volume);
  if (settings.notify) await notify(tabId, message.title || sender.tab?.title);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "chatgpt-finished") {
    finished(message, sender);
    return;
  }
  if (message?.type === "play-test") {
    getSettings().then((s) => play(s.volume));
    sendResponse({ ok: true });
    return true;
  }
  if (message?.type === "notification-test") {
    notify(null, "Esta es una prueba");
    sendResponse({ ok: true });
    return true;
  }
});

chrome.notifications.onClicked.addListener(async (id) => {
  const tabId = notificationTabs.get(id);
  if (tabId === undefined) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tabId, { active: true });
  } catch {}
  chrome.notifications.clear(id);
});

chrome.notifications.onClosed.addListener((id) => notificationTabs.delete(id));
chrome.tabs.onRemoved.addListener((tabId) => {
  lastFinishedByTab.delete(tabId);
  for (const [id, mappedTabId] of notificationTabs) {
    if (mappedTabId === tabId) notificationTabs.delete(id);
  }
});

