const sound = document.getElementById("sound");
const volume = document.getElementById("volume");
const volumeRow = document.getElementById("volumeRow");
const hint = document.getElementById("hint");
const test = document.getElementById("test");

const DEFAULTS = { sound: "pop", volume: 0.8 };

function refreshUi() {
  const usingWindows = sound.value === "windows";
  volume.disabled = usingWindows;
  volumeRow.style.opacity = usingWindows ? "0.45" : "1";
  hint.textContent = usingWindows
    ? "Uses the standard Windows notification sound."
    : "Windows still shows the completion notification, but it stays silent so it does not overlap this sound.";
}

async function load() {
  const settings = await chrome.storage.local.get(DEFAULTS);
  sound.value = settings.sound || DEFAULTS.sound;
  volume.value = settings.volume ?? DEFAULTS.volume;
  refreshUi();
}

sound.addEventListener("change", () => {
  chrome.storage.local.set({ sound: sound.value });
  refreshUi();
});

volume.addEventListener("input", () => {
  chrome.storage.local.set({ volume: Number(volume.value) });
});

test.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "test-alert" });
});

load();
