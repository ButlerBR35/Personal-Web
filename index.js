(() => {
  function initScrollGradient() {
    const root = document.documentElement;
    const hero = document.querySelector(".hero");
    const below = document.getElementById("page-below");

    if (!hero || !below) return;

    let scheduled = false;

    function updateGradient() {
      const scrollTop = window.scrollY;

      const heroTop =
        hero.getBoundingClientRect().top + scrollTop;

      const belowTop =
        below.getBoundingClientRect().top + scrollTop;

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      // 抵達下方區域，或捲到底時，灰色完全覆蓋
      const endPosition = Math.min(belowTop, maxScroll);
      const distance = Math.max(endPosition - heroTop, 1);

      const progress = Math.min(
        1,
        Math.max(0, (scrollTop - heroTop) / distance)
      );

      // 首頁右側漸層逐漸淡出
      root.style.setProperty(
        "--right-opacity",
        (1 - progress).toFixed(4)
      );

      // 灰色漸層由底部往上：
      // 50% → -50%
      root.style.setProperty(
        "--gray-position",
        `${(50 - progress * 100).toFixed(3)}%`
      );

      scheduled = false;
    }

    function scheduleUpdate() {
      if (scheduled) return;

      scheduled = true;
      requestAnimationFrame(updateGradient);
    }

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true
    });

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);
    window.addEventListener("pageshow", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    // Loading 結束、頁面高度變動時，重新計算
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(hero);
    observer.observe(below);

    updateGradient();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initScrollGradient,
      { once: true }
    );
  } else {
    initScrollGradient();
  }
})();