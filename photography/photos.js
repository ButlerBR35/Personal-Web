"use strict";

(() => {
  const albums = window.PHOTO_ALBUMS || [];
  const $ = selector => document.querySelector(selector);

  const grid = $("#grid");
  const title = $("#title");
  const count = $("#count");
  const back = $("#back");
  const viewer = $("#viewer");
  const large = $("#large");
  const position = $("#position");
  const error = $("#error");

  const homeLink = $("#home-link");
  const languageSelect = $("#photo-language");
  const previousButton = $("#prev");
  const nextButton = $("#next");
  const closeButton = $("#close");

  const translations = {
    zh: {
      htmlLang: "zh-Hant",
      title: "攝影作品",
      home: "← 返回首頁",
      back: "← 全部相簿",
      previous: "← 上一張",
      next: "下一張 →",
      close: "關閉",
      viewer: "照片檢視",
      language: "選擇語言",
      empty: "尚未匯入相簿。",
      loadError: "照片無法載入，請確認圖片檔案完整。",
      footer: "每一張照片，都是一段記憶。",
      photos: n => `${n} 張照片`,
      summary: (a, p) => `${a} 本相簿・${p} 張照片`,
      photo: n => `第 ${n} 張照片`,
      enlarge: "放大照片"
    },

    ja: {
      htmlLang: "ja",
      title: "写真作品",
      home: "← ホームに戻る",
      back: "← すべてのアルバム",
      previous: "← 前の写真",
      next: "次の写真 →",
      close: "閉じる",
      viewer: "写真ビューアー",
      language: "言語を選択",
      empty: "アルバムはまだありません。",
      loadError: "写真を読み込めません。画像ファイルをご確認ください。",
      footer: "一枚の写真に、ひとつの思い出。",
      photos: n => `${n} 枚の写真`,
      summary: (a, p) => `${a} 件のアルバム・${p} 枚の写真`,
      photo: n => `${n} 枚目の写真`,
      enlarge: "写真を拡大"
    },

    en: {
      htmlLang: "en",
      title: "Photography",
      home: "← Back to home",
      back: "← All albums",
      previous: "← Previous",
      next: "Next →",
      close: "Close",
      viewer: "Photo viewer",
      language: "Select language",
      empty: "No albums have been imported yet.",
      loadError: "Unable to load this photo. Please check the image file.",
      footer: "Every photograph holds a memory.",
      photos: n => `${n} photo${n === 1 ? "" : "s"}`,
      summary: (a, p) =>
        `${a} album${a === 1 ? "" : "s"} · ` +
        `${p} photo${p === 1 ? "" : "s"}`,
      photo: n => `Photo ${n}`,
      enlarge: "Enlarge photo"
    }
  };

  /*
   * 相簿譯名設定：
   * 左側名稱必須與 albums.js 裡的 name 完全相同。
   * 沒有填寫的相簿會保留原名。
   *
   * 範例：
   * "我的相簿": {
   *   ja: "私のアルバム",
   *   en: "My Album"
   * }
   */
  const albumTranslations = {};

  let language = "zh";

  try {
    const saved = localStorage.getItem("bart-photo-language");
    if (translations[saved]) language = saved;
  } catch {
    // 無法儲存偏好時，仍可正常切換語言。
  }

  let active = null;
  let index = 0;

  function t() {
    return translations[language];
  }

  function albumName(album) {
    return albumTranslations[album.name]?.[language] || album.name;
  }

  function picture(src, alt) {
    const img = document.createElement("img");

    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    img.decoding = "async";

    return img;
  }

  function updateLabels() {
    const text = t();

    document.documentElement.lang = text.htmlLang;
    document.title = `${text.title}｜巴特`;

    homeLink.textContent = text.home;
    back.textContent = text.back;

    languageSelect.value = language;
    languageSelect.setAttribute("aria-label", text.language);

    previousButton.textContent = text.previous;
    nextButton.textContent = text.next;
    closeButton.setAttribute("aria-label", text.close);
    viewer.setAttribute("aria-label", text.viewer);

    const footer = document.querySelector("body > footer");
    if (footer) footer.textContent = text.footer;
  }

  function render() {
    const text = t();

    grid.replaceChildren();
    back.hidden = !active;
    title.textContent = active ? albumName(active) : text.title;

    if (active) {
      count.textContent = text.photos(active.photos.length);

      active.photos.forEach((photo, photoIndex) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "card photo";
        button.setAttribute(
          "aria-label",
          `${albumName(active)}，${text.photo(photoIndex + 1)}，` +
          text.enlarge
        );

        button.append(
          picture(photo.thumb, text.photo(photoIndex + 1))
        );

        button.addEventListener("click", () => {
          index = photoIndex;
          showPhoto();
          viewer.showModal();
        });

        grid.append(button);
      });

      return;
    }

    const totalPhotos = albums.reduce(
      (total, album) => total + album.photos.length,
      0
    );

    count.textContent = albums.length
      ? text.summary(albums.length, totalPhotos)
      : text.empty;

    albums.forEach(album => {
      const link = document.createElement("a");

      link.className = "card";
      link.href = "#album=" + encodeURIComponent(album.id);

      if (album.photos.length) {
        link.append(
          picture(album.photos[0].thumb, albumName(album))
        );
      }

      const heading = document.createElement("h2");
      heading.textContent = albumName(album);

      const description = document.createElement("p");
      description.textContent = text.photos(album.photos.length) + " ↗";

      link.append(heading, description);
      grid.append(link);
    });
  }

  function showPhoto() {
    if (!active || !active.photos[index]) return;

    error.textContent = "";
    large.src = active.photos[index].src;

    updateViewerLabels();
  }

  function updateViewerLabels() {
    if (!active) return;

    large.alt = `${albumName(active)}，${t().photo(index + 1)}`;
    position.textContent = `${index + 1} / ${active.photos.length}`;

    previousButton.disabled = index === 0;
    nextButton.disabled = index === active.photos.length - 1;

    if (error.textContent) {
      error.textContent = t().loadError;
    }
  }

  function step(amount) {
    if (!active) return;

    const nextIndex = index + amount;

    if (nextIndex < 0 || nextIndex >= active.photos.length) return;

    index = nextIndex;
    showPhoto();
  }

  function route() {
    if (viewer.open) viewer.close();

    const albumId = new URLSearchParams(
      location.hash.slice(1)
    ).get("album");

    active = albums.find(album => album.id === albumId) || null;
    index = 0;

    render();
  }

  languageSelect.addEventListener("change", () => {
    language = translations[languageSelect.value]
      ? languageSelect.value
      : "zh";

    try {
      localStorage.setItem("bart-photo-language", language);
    } catch {
      // 儲存失敗不影響翻譯功能。
    }

    updateLabels();
    render();

    if (viewer.open) updateViewerLabels();
  });

  large.addEventListener("error", () => {
    error.textContent = t().loadError;
  });

  closeButton.addEventListener("click", () => viewer.close());
  previousButton.addEventListener("click", () => step(-1));
  nextButton.addEventListener("click", () => step(1));

  viewer.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });

  window.addEventListener("hashchange", route);

  updateLabels();
  route();
})();