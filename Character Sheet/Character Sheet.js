(() => {
  const viewer = document.getElementById("image-viewer");
  const largeImage = document.getElementById("viewer-image");
  const closeButton = document.getElementById("viewer-close");

  if (!viewer || !largeImage || !closeButton) return;

  let lastTrigger = null;

  // 為兩張設定圖加入可點擊、可用鍵盤操作的按鈕
  document.querySelectorAll(".character-card").forEach(card => {
    const image = card.querySelector("img");
    if (!image || card.querySelector(".character-open")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-open";
    button.setAttribute(
      "aria-label",
      `放大檢視：${image.alt || "設定圖"}`
    );
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "image-viewer");

    button.addEventListener("click", () => {
      lastTrigger = button;

      largeImage.src = image.currentSrc || image.src;
      largeImage.alt = image.alt;

      viewer.showModal();
      document.documentElement.classList.add("image-viewer-open");
    });

    card.appendChild(button);
  });

  // 點右上角關閉
  closeButton.addEventListener("click", () => {
    viewer.close();
  });

  // 點圖片外的空白區域關閉
  viewer.addEventListener("click", event => {
    if (event.target === viewer) {
      viewer.close();
    }
  });

  // 按 Esc 也會透過原生 dialog 關閉
  viewer.addEventListener("close", () => {
    document.documentElement.classList.remove("image-viewer-open");
    largeImage.removeAttribute("src");
    lastTrigger?.focus({ preventScroll: true });
  });
})();