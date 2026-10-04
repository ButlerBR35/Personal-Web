(() => {
  // 貼上「繪圖同步專案」的 /exec 網址。
  const DRIVE_SYNC_URL = "https://script.google.com/macros/s/AKfycbycdpH7G57oHthk0jgSkF5dUhRuUuKr0zkEypBKdG6ym8lbfLpDC9qUs_QmtasG8qCRpQ/exec";

  const gallery = document.getElementById("gallery");
  const status = document.getElementById("status");
  const filter = document.getElementById("folder-filter");
  const refresh = document.getElementById("refresh");
  const viewer = document.getElementById("viewer");
  const large = document.getElementById("large-image");
  const imageError = document.getElementById("image-error");
  const counter = document.getElementById("counter");
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");

  let works = [];
  let visibleWorks = [];
  let current = 0;
  let lastTrigger = null;
  let loading = false;
  let hasLoaded = false;
  let script = null;
  let timer = null;

  function imageURL(id, size) {
    return "https://drive.google.com/thumbnail?id=" +
      encodeURIComponent(id) + "&sz=w" + size;
  }

// 將修改時間轉成可排序的數字
function workTime(work) {
  return Date.parse(work.modifiedTime) || 0;
}

// 顯示台灣時間
function formatTime(time) {
  if (!time) return "尚無更新時間";

  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(time));
}

// 按實際資料夾 ID 分組，避免同名資料夾混在一起
function getFolderGroups() {
  const groups = new Map();

  works.forEach(work => {
    if (!groups.has(work.folderId)) {
      groups.set(work.folderId, {
        id: work.folderId,
        name: work.folder,
        count: 0,
        updatedTime: 0
      });
    }

    const folder = groups.get(work.folderId);
    folder.count += 1;
    folder.updatedTime = Math.max(
      folder.updatedTime,
      workTime(work)
    );
  });

  return [...groups.values()].sort((a, b) =>
    b.updatedTime - a.updatedTime ||
    a.name.localeCompare(b.name, "zh-Hant", { numeric: true })
  );
}

// 下拉選單也依照最新更新時間排列
function populateFolders() {
  const selected = filter.value;
  const folders = getFolderGroups();

  filter.replaceChildren(new Option("全部資料夾", ""));

  folders.forEach(folder => {
    filter.add(new Option(folder.name, folder.id));
  });

  filter.value = folders.some(folder => folder.id === selected)
    ? selected
    : "";
}

function render() {
  gallery.replaceChildren();

  // 建立一次「返回資料夾」按鈕
  let backButton = document.getElementById("back-to-folders");

  if (!backButton) {
    backButton = document.createElement("button");
    backButton.id = "back-to-folders";
    backButton.type = "button";
    backButton.textContent = "← 返回資料夾";

    document.querySelector(".toolbar").after(backButton);

    backButton.addEventListener("click", () => {
      filter.value = "";
      render();
    });
  }

  backButton.hidden = !filter.value;

  // ===== 首層：顯示資料夾，不直接展示全部圖片 =====
  if (!filter.value) {
    visibleWorks = [];

    const folders = getFolderGroups();

    status.textContent = folders.length
      ? `${folders.length} 個資料夾 · ${works.length} 件作品 · 更新時間由新至舊`
      : "目前沒有可顯示的公開作品。";

    folders.forEach(folder => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "folder-card";

      const icon = document.createElement("span");
      icon.className = "folder-icon";
      icon.textContent = "📁";
      icon.setAttribute("aria-hidden", "true");

      const title = document.createElement("strong");
      title.textContent = folder.name;

      const count = document.createElement("span");
      count.className = "folder-count";
      count.textContent = `${folder.count} 件作品`;

      const date = document.createElement("span");
      date.className = "folder-date";
      date.textContent = `作品更新：${formatTime(folder.updatedTime)}`;

      button.append(icon, title, count, date);

      button.addEventListener("click", () => {
        filter.value = folder.id;
        render();
        backButton.focus({ preventScroll: true });
      });

      gallery.appendChild(button);
    });

    return;
  }

  // ===== 資料夾內：圖片依修改時間由新到舊 =====
  visibleWorks = works
    .filter(work => work.folderId === filter.value)
    .sort((a, b) =>
      workTime(b) - workTime(a) ||
      a.id.localeCompare(b.id)
    );

  const folderName = visibleWorks[0]?.folder || "資料夾";

  status.textContent =
    `${folderName} · ${visibleWorks.length} 件作品 · 更新時間由新至舊`;

  visibleWorks.forEach((work, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "artwork";
    button.setAttribute("aria-label", `放大第 ${index + 1} 張作品`);
    button.setAttribute("aria-haspopup", "dialog");

    const image = document.createElement("img");
    image.src = imageURL(work.id, 800);
    image.alt = `繪圖作品 ${index + 1}`;
    image.loading = "lazy";

    const label = document.createElement("span");

    // 不顯示圖片檔名，改顯示更新日期
    label.textContent = `更新：${formatTime(workTime(work))}`;

    image.addEventListener("error", () => {
      image.style.display = "none";
      label.textContent = "圖片無法載入，請確認分享權限。";
    }, { once: true });

    button.append(image, label);

    button.addEventListener("click", () => {
      current = index;
      lastTrigger = button;

      showImage();
      viewer.showModal();
      document.documentElement.classList.add("viewer-open");
    });

    gallery.appendChild(button);
  });
}

const imageLoading = document.getElementById("image-loading");

// 每次切換編號遞增，避免較慢的舊圖片蓋掉新圖片。
let imageRequestId = 0;
let cancelImageLoad = () => {};

function showImage() {
  const work = visibleWorks[current];
  if (!work) return;

  // 清理上一張圖片尚未完成的載入。
  cancelImageLoad();

  const requestId = ++imageRequestId;
  const source = imageURL(work.id, 2400);
  const preloader = new Image();
  let finished = false;
  let timeoutId;

  imageError.textContent = "";
  imageLoading.hidden = false;

  large.classList.add("is-loading");
  large.setAttribute("aria-busy", "true");
  large.removeAttribute("src");
  large.alt = `繪圖作品 ${current + 1}`;

  counter.textContent = `${current + 1} / ${visibleWorks.length}`;
  previous.disabled = current === 0;
  next.disabled = current === visibleWorks.length - 1;

  function cleanup() {
    clearTimeout(timeoutId);
    preloader.onload = null;
    preloader.onerror = null;
  }

  function finish(success, message = "") {
    if (finished || requestId !== imageRequestId) return;

    finished = true;
    cleanup();

    imageLoading.hidden = true;
    large.setAttribute("aria-busy", "false");

    if (success) {
      large.src = source;
      large.classList.remove("is-loading");
    } else {
      // 保持圖片隱藏，改顯示錯誤訊息。
      imageError.textContent = message;
    }
  }

  cancelImageLoad = () => {
    finished = true;
    cleanup();
  };

  preloader.onload = async () => {
    // 等待圖片解碼，減少載入完後短暫空白。
    try {
      await preloader.decode();
    } catch {
      // 已觸發 load 且有尺寸時，仍可顯示圖片。
    }

    finish(
      preloader.naturalWidth > 0,
      "圖片無法顯示，請切換圖片後再試。"
    );
  };

  preloader.onerror = () => {
    finish(false, "圖片載入失敗，請確認網路或圖片分享權限。");
  };

  // 避免一直顯示旋轉圖示。
  timeoutId = setTimeout(() => {
    finish(false, "圖片載入時間較長，請切換圖片後再試。");
  }, 45000);

  preloader.src = source;
}

  function move(direction) {
    const target = current + direction;
    if (target < 0 || target >= visibleWorks.length) return;

    current = target;
    showImage();
  }

  large.addEventListener("error", () => {
    if (viewer.open) {
      imageError.textContent =
        "圖片無法載入，請確認分享權限或稍後再試。";
    }
  });

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));

  document.getElementById("close").addEventListener("click", () => {
    viewer.close();
  });

  viewer.addEventListener("click", event => {
    if (event.target === viewer) viewer.close();
  });

  viewer.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });

viewer.addEventListener("close", () => {
  // 關閉後，不讓尚未載入完成的圖片繼續更新畫面。
  ++imageRequestId;
  cancelImageLoad();

  imageLoading.hidden = true;
  large.classList.remove("is-loading");
  large.removeAttribute("aria-busy");
  large.removeAttribute("src");
  imageError.textContent = "";

  document.documentElement.classList.remove("viewer-open");
  lastTrigger?.focus({ preventScroll: true });
});

  function finishRequest() {
    clearTimeout(timer);
    script?.remove();
    script = null;
    loading = false;
    refresh.disabled = false;
  }

  function fail(message) {
    finishRequest();

    status.textContent = message + (
      hasLoaded ? "（目前保留上次成功載入的內容）" : ""
    );
  }

  // 名稱必須與 Apps Script 回傳的回呼名稱一致。
  window.receiveDrawingGallery = payload => {
    if (!loading) return;

    if (!payload || payload.error || !Array.isArray(payload.works)) {
      fail(payload?.error || "清單格式錯誤。");
      return;
    }

    const valid = payload.works.every(work =>
      work &&
      typeof work.id === "string" &&
      /^[A-Za-z0-9_-]+$/.test(work.id) &&
      typeof work.folderId === "string" &&
      typeof work.folder === "string"
    );

    if (!valid) {
      fail("作品資料格式不完整。");
      return;
    }

    finishRequest();

    if (viewer.open) viewer.close();

    // 完整替換清單，不把舊作品持續累加。
    works = payload.works;
    hasLoaded = true;

    populateFolders();
    render();
  };

  function sync() {
    if (loading) return;

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(
      DRIVE_SYNC_URL
    )) {
      status.textContent = "請先在 drawing.js 填入 Apps Script 部署網址。";
      return;
    }

    loading = true;
    refresh.disabled = true;
    status.textContent = "正在讀取雲端作品…";

    script = document.createElement("script");
    script.src = DRIVE_SYNC_URL + "?t=" + Date.now();

    script.onerror = () => {
      if (loading) fail("同步失敗，請檢查網路與部署存取權。");
    };

    script.onload = () => {
      if (loading) fail("未收到作品清單，請確認部署的是繪圖同步程式。");
    };

    timer = setTimeout(() => {
      if (loading) fail("讀取逾時，請稍後按「更新作品」重試。");
    }, 120000);

    document.body.appendChild(script);
  }

  filter.addEventListener("change", render);
  refresh.addEventListener("click", sync);

  sync();
})();