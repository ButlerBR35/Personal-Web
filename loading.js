(() => {
  const loader = document.getElementById("intro-loader");
  if (!loader) return;

  const root = document.documentElement;
  const startedAt = performance.now();

  const minimumTime = 1600; // Loading 至少顯示 1.6 秒
  const maximumTime = 8000; // 最多等待 8 秒

  let finishing = false;
  let safetyTimer;

  loader.hidden = false;
  root.classList.add("intro-running");

  // Loading 期間，暫時禁止操作首頁內容
  function lockContent() {
    const content = document.getElementById("site-content");

    if (content && root.classList.contains("intro-running")) {
      content.inert = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", lockContent, {
      once: true
    });
  } else {
    lockContent();
  }

  function finishIntro() {
    if (finishing) return;
    finishing = true;

    clearTimeout(safetyTimer);
    window.removeEventListener("load", finishIntro);

    const remaining = Math.max(
      0,
      minimumTime - (performance.now() - startedAt)
    );

    setTimeout(() => {
      let revealed = false;
      let exitTimer;

      // Loading 完全消失後，才開始文字進場動畫
      function revealContent() {
        if (revealed) return;
        revealed = true;

        clearTimeout(exitTimer);
        loader.removeEventListener("transitionend", onExit);
        loader.remove();

        root.classList.remove("intro-running");

        const content = document.getElementById("site-content");
        if (content) content.inert = false;
      }

      function onExit(event) {
        if (
          event.target === loader &&
          event.propertyName === "opacity"
        ) {
          revealContent();
        }
      }

      loader.addEventListener("transitionend", onExit);
      loader.classList.add("is-leaving");

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        revealContent();
      } else {
        // 避免淡出事件未觸發，導致文字一直隱藏
        exitTimer = setTimeout(revealContent, 800);
      }
    }, remaining);
  }

  safetyTimer = setTimeout(finishIntro, maximumTime);

  if (document.readyState === "complete") {
    finishIntro();
  } else {
    window.addEventListener("load", finishIntro, { once: true });
  }
})();