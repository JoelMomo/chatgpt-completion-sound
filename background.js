const DEFAULTS = { sound: "pop", volume: 0.8 };
const VALID_SOUNDS = new Set([
  "pop",
  "cash-register",
  "chan",
  "potion",
  "point",
  "page-turn",
  "windows"
]);
const lastFinishedByTab = new Map();
const notificationTabs = new Map();

async function getSettings() {
  const stored = await chrome.storage.local.get(DEFAULTS);
  const sound = VALID_SOUNDS.has(stored.sound) ? stored.sound : DEFAULTS.sound;
  const volumeValue = Number(stored.volume);
  const volume = Number.isFinite(volumeValue)
    ? Math.max(0, Math.min(1, volumeValue))
    : DEFAULTS.volume;
  return { sound, volume };
}

function cleanTitle(title) {
  const value = String(title || "")
    .replace(/\s+(?:-|–|—)\s+ChatGPT\s*$/i, "")
    .trim();
  return value && value.toLowerCase() !== "chatgpt" ? value : "ChatGPT";
}

async function ensureOffscreen() {
  let exists = false;
  if (chrome.offscreen.hasDocument) {
    exists = await chrome.offscreen.hasDocument();
  } else {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"]
    });
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

async function play(sound, volume) {
  await ensureOffscreen();
  chrome.runtime.sendMessage({
    target: "offscreen",
    type: "play",
    sound,
    volume
  });
}

async function notify(tabId, title, silent) {
  const id = `chatgpt-finished-${tabId ?? "x"}-${Date.now()}`;
  if (tabId !== null && tabId !== undefined) {
    notificationTabs.set(id, tabId);
  }
  await chrome.notifications.create(id, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon128.png"),
    title: "ChatGPT finished",
    message: cleanTitle(title),
    contextMessage: tabId == null ? "Alert test" : "Click to open this chat",
    priority: 1,
    silent
  });
}

async function runAlert(tabId, title) {
  const settings = await getSettings();
  if (settings.sound === "windows") {
    await notify(tabId, title, false);
    return;
  }
  await play(settings.sound, settings.volume);
  await notify(tabId, title, true);
}

async function finished(message, sender) {
  const tabId = sender.tab?.id ?? null;
  const now = Date.now();
  if (tabId !== null && now - (lastFinishedByTab.get(tabId) || 0) < 3000) {
    return;
  }
  if (tabId !== null) {
    lastFinishedByTab.set(tabId, now);
  }
  await runAlert(tabId, message.title || sender.tab?.title);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "chatgpt-finished") {
    finished(message, sender);
    return;
  }
  if (message?.type === "test-alert") {
    runAlert(null, "This is a test");
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

chrome.notifications.onClosed.addListener((id) => {
  notificationTabs.delete(id);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  lastFinishedByTab.delete(tabId);
  for (const [id, mappedTabId] of notificationTabs) {
    if (mappedTabId === tabId) {
      notificationTabs.delete(id);
    }
  }
});
