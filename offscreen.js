const queue = [];
let playing = false;

function finishCurrent() {
  playing = false;
  playNext();
}

async function playNext() {
  if (playing || queue.length === 0) return;
  playing = true;
  const volume = queue.shift();
  const audio = new Audio(chrome.runtime.getURL("potion.wav"));
  audio.volume = Math.max(0, Math.min(1, Number(volume) || 0.8));
  audio.addEventListener("ended", finishCurrent, { once: true });
  audio.addEventListener("error", finishCurrent, { once: true });
  try {
    await audio.play();
  } catch {
    finishCurrent();
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.target !== "offscreen" || message?.type !== "play") return;
  queue.push(message.volume);
  playNext();
});

