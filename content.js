(() => {
  if (globalThis.__chatgptCompletionSoundLoaded) return;
  globalThis.__chatgptCompletionSoundLoaded = true;

  const FINISH_DELAY_MS = 2200;
  let wasWorking = false;
  let seenWorking = false;
  let suppressNextFinish = false;
  let finishTimer = null;

  function isStopButton(button) {
    if (!button) return false;
    if (button.getAttribute("data-testid") === "stop-button") return true;

    const label = `${button.getAttribute("aria-label") || ""} ${button.textContent || ""}`
      .trim()
      .toLowerCase();

    return /(^|\s)(stop|detener|cancel|cancelar)(\s|$)/i.test(label) &&
      /(generat|respuesta|response|generación|generacion|thinking|pensando)/i.test(label);
  }

  function isVisible(element) {
    return !!element &&
      !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  function isWorking() {
    const testIdStop = document.querySelector(
      'button[data-testid="stop-button"], [data-testid="stop-button"]'
    );
    if (isVisible(testIdStop)) return true;

    const buttons = document.querySelectorAll("button");
    for (const button of buttons) {
      if (isVisible(button) && isStopButton(button)) return true;
    }
    return false;
  }

  function clearFinishTimer() {
    if (finishTimer) clearTimeout(finishTimer);
    finishTimer = null;
  }

  function evaluate() {
    const working = isWorking();

    if (working) {
      seenWorking = true;
      wasWorking = true;
      clearFinishTimer();
      return;
    }

    if (!seenWorking || !wasWorking || finishTimer) return;

    wasWorking = false;
    finishTimer = setTimeout(() => {
      finishTimer = null;
      if (!seenWorking || isWorking()) return;

      seenWorking = false;

      if (suppressNextFinish) {
        suppressNextFinish = false;
        return;
      }

      chrome.runtime.sendMessage({
        type: "chatgpt-finished",
        title: document.title,
        url: location.href
      }).catch(() => {});
    }, FINISH_DELAY_MS);
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("button")
      : null;

    if (isStopButton(target)) {
      suppressNextFinish = true;
    }
  }, true);

  const observer = new MutationObserver(evaluate);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-label", "data-testid", "disabled"]
  });

  setInterval(evaluate, 1000);
  evaluate();
})();
