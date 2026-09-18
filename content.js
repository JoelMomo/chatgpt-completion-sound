(() => {
  if (globalThis.__chatgptCompletionSoundLoaded) return;
  globalThis.__chatgptCompletionSoundLoaded = true;

  const FINISH_CONFIRM_MS = 1400;
  const FALLBACK_SCAN_MS = 5000;
  const MUTATION_THROTTLE_MS = 500;
  const ERROR_SCAN_MS = 1000;
  const MANUAL_STOP_GRACE_MS = 5000;

  let state = "idle";
  let finishTimer = null;
  let evaluationTimer = null;
  let lastFallbackScanAt = 0;
  let lastErrorScanAt = 0;
  let manualStopUntil = 0;
  let lastUrl = location.href;

  function isVisible(element) {
    return !!element &&
      !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  function isStopButton(button) {
    if (!button) return false;
    if (button.getAttribute("data-testid") === "stop-button") return true;

    const label = (
      (button.getAttribute("aria-label") || "") +
      " " +
      (button.textContent || "")
    ).trim().toLowerCase();

    return /(^|\s)(stop|cancel|detener|cancelar)(\s|$)/i.test(label) &&
      /(generat|response|respuesta|thinking|pensando|generación|generacion)/i.test(label);
  }

  function directWorkingSignal() {
    const direct = document.querySelector(
      'button[data-testid="stop-button"], [data-testid="stop-button"]'
    );
    return isVisible(direct);
  }

  function fallbackWorkingSignal(forceScan = false) {
    const now = Date.now();
    if (!forceScan && now - lastFallbackScanAt < FALLBACK_SCAN_MS) {
      return false;
    }

    lastFallbackScanAt = now;

    for (const button of document.querySelectorAll("button")) {
      if (isVisible(button) && isStopButton(button)) return true;
    }

    return false;
  }

  function detectWorking(allowFallback = false, forceFallback = false) {
    if (directWorkingSignal()) return true;
    return allowFallback ? fallbackWorkingSignal(forceFallback) : false;
  }

  function detectVisibleError(forceScan = false) {
    const now = Date.now();
    if (!forceScan && now - lastErrorScanAt < ERROR_SCAN_MS) {
      return false;
    }

    lastErrorScanAt = now;

    const candidates = document.querySelectorAll(
      '[role="alert"], [data-testid*="error"], [data-testid*="retry"]'
    );

    let checked = 0;
    for (const element of candidates) {
      if (++checked > 16) break;
      if (!isVisible(element)) continue;

      const text = String(element.textContent || "").trim().slice(0, 500);
      if (!text) continue;

      if (/(something went wrong|network error|error generating|try again|rate limit|failed|connection lost|ha ocurrido un error|error de red|inténtalo de nuevo|intentalo de nuevo)/i.test(text)) {
        return true;
      }
    }

    return false;
  }

  function clearFinishTimer() {
    if (finishTimer) clearTimeout(finishTimer);
    finishTimer = null;
  }

  function resetToIdle() {
    clearFinishTimer();
    state = "idle";
  }

  function sendFinished() {
    try {
      chrome.runtime.sendMessage({
        type: "chatgpt-finished",
        title: document.title,
        url: location.href
      }).catch(() => {});
    } catch {}
  }

  function evaluate(options = {}) {
    const allowFallback = options.allowFallback === true;
    const urlChanged = location.href !== lastUrl;

    if (urlChanged) {
      lastUrl = location.href;
      if (state !== "working") {
        resetToIdle();
        manualStopUntil = 0;
      }
    }

    if (state === "working" && detectVisibleError()) {
      resetToIdle();
      manualStopUntil = 0;
      return;
    }

    const working = detectWorking(allowFallback);

    if (working) {
      clearFinishTimer();
      if (state !== "working") {
        state = "working";
      }
      return;
    }

    if (state !== "working" || finishTimer) return;

    finishTimer = setTimeout(() => {
      finishTimer = null;

      if (state !== "working") return;

      if (detectVisibleError(true)) {
        state = "idle";
        manualStopUntil = 0;
        return;
      }

      // Force one broad scan at the transition boundary. This keeps normal
      // mutation handling cheap without risking a false completion when the
      // direct Stop selector changes.
      if (detectWorking(true, true)) {
        return;
      }

      state = "idle";

      if (Date.now() < manualStopUntil) {
        manualStopUntil = 0;
        return;
      }

      manualStopUntil = 0;
      sendFinished();
    }, FINISH_CONFIRM_MS);
  }

  function scheduleEvaluate() {
    if (evaluationTimer) return;

    evaluationTimer = setTimeout(() => {
      evaluationTimer = null;
      evaluate({ allowFallback: false });
    }, MUTATION_THROTTLE_MS);
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("button")
      : null;

    if (isStopButton(target)) {
      manualStopUntil = Date.now() + MANUAL_STOP_GRACE_MS;
    }
  }, true);

  const observer = new MutationObserver(scheduleEvaluate);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-label", "data-testid", "disabled", "role"]
  });

  window.addEventListener("popstate", scheduleEvaluate);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleEvaluate();
  });

  setInterval(() => {
    evaluate({ allowFallback: true });
  }, FALLBACK_SCAN_MS);

  evaluate({ allowFallback: true });
})();
