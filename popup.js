const enabled = document.getElementById("enabled");
const notify = document.getElementById("notify");
const volume = document.getElementById("volume");
const test = document.getElementById("test");
const testNotify = document.getElementById("testNotify");

async function load() {
  const settings = await chrome.storage.local.get({ enabled: true, notify: true, volume: 0.8 });
  enabled.checked = settings.enabled;
  notify.checked = settings.notify;
  volume.value = settings.volume;
}

enabled.addEventListener("change", () => chrome.storage.local.set({ enabled: enabled.checked }));
notify.addEventListener("change", () => chrome.storage.local.set({ notify: notify.checked }));
volume.addEventListener("input", () => chrome.storage.local.set({ volume: Number(volume.value) }));
test.addEventListener("click", () => chrome.runtime.sendMessage({ type: "play-test" }));
testNotify.addEventListener("click", () => chrome.runtime.sendMessage({ type: "notification-test" }));

load();
