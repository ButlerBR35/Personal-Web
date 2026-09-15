(() => {
  const languageSelect = document.getElementById("language-select");
  if (!languageSelect) return;

  // ===== 三種語言文字，可在這裡修改 =====
  const translations = {
    zh: {
      htmlLang: "zh-TW",
      welcome: "歡迎來到我的空間",
      greeting: "嗨囉嗨囉",
      intro: "我是",
      name: "巴特勒·棕響",
      nameAfter: "",
      callBefore: "可以直接叫我",
      nickname1: "巴特",
      callBetween: "或",
      nickname2: "棕響",
      callAfter: "就好",
      directory: "歡迎更認識我",
      menu: [
        "關於我", "設定圖", "委託圖集",
        "攝影作品", "繪圖作品", "暫未更新"
      ],
      scroll: "往下瀏覽",
      language: "選擇語言",
      navigation: "主要目錄",
      social: "社群連結",
      loading: "網站載入中",
      home: "首頁"
    },

    ja: {
      htmlLang: "ja",
      welcome: "私の空間へようこそ",
      greeting: "こんにちは！",
      intro: "",
      name: "バトラー・ブラウンリング",
      nameAfter: "です",
      callBefore: "",
      nickname1: "バッと",
      callBetween: "や",
      nickname2: "ブラウンリング",
      callAfter: "って気軽に呼んでね！",
      directory: "もっと私を知ってください",
      menu: [
        "自己紹介", "設定画", "依頼作品集",
        "写真作品", "イラスト作品", "準備中"
      ],
      scroll: "下へスクロール",
      language: "言語を選択",
      navigation: "メインメニュー",
      social: "ソーシャルリンク",
      loading: "読み込み中",
      home: "ホーム"
    },

    en: {
      htmlLang: "en",
      welcome: "Welcome to my space",
      greeting: "Hello there!",
      intro: "I'm ",
      name: "Butler Brownring",
      nameAfter: "",
      callBefore: "You can call me ",
      nickname1: "Bart",
      callBetween: " or ",
      nickname2: "Brownring",
      callAfter: ".",
      directory: "Get to know me",
      menu: [
        "About Me", "Character Sheets", "Commission Gallery",
        "Photography", "Artwork", "Coming Soon"
      ],
      scroll: "Scroll Down",
      language: "Choose language",
      navigation: "Main navigation",
      social: "Social links",
      loading: "Loading",
      home: "Home"
    }
  };

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function setLabel(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.setAttribute("aria-label", value);
  }

  function highlight(text) {
    const span = document.createElement("span");
    span.className = "highlight";
    span.textContent = text;
    return span;
  }

  function applyLanguage(language) {
    const text = translations[language];
    if (!text) return;

    document.documentElement.lang = text.htmlLang;
    languageSelect.value = language;
    languageSelect.setAttribute("aria-label", text.language);

    setText(".text-box-title > p:not(.call)", text.welcome);
    setText("#directory-title", text.directory);
    setText(".scroll-hint-text", text.scroll);

    const heading = document.querySelector(".sayhi");

    if (heading) {
  heading.replaceChildren(
    document.createTextNode(text.greeting),
    document.createElement("br"),
    document.createTextNode(text.intro),
    highlight(text.name)
  );

  // 日文：在「です」前面換行
  if (language === "ja" && text.nameAfter) {
    heading.appendChild(document.createElement("br"));
  }

  heading.appendChild(
    document.createTextNode(text.nameAfter || "")
  );
}

    const call = document.querySelector(".call");

    if (call) {
      call.replaceChildren(
        document.createTextNode(text.callBefore),
        highlight(text.nickname1),
        document.createTextNode(text.callBetween),
        highlight(text.nickname2),
        document.createTextNode(text.callAfter)
      );
    }

    const ids = [
      "menu-about",
      "menu-character",
      "menu-collection",
      "menu-photo",
      "menu-art",
      "menu-upcoming"
    ];

    ids.forEach((id, index) => {
      setText(`.top-nav a[href="#${id}"]`, text.menu[index]);
      setText(`#${id} .card-title`, text.menu[index]);
    });

    setLabel(".top-nav", text.navigation);
    setLabel(".social-sidebar", text.social);
    setLabel(".hero", text.home);
    setLabel(".scroll-hint", text.scroll);
    setLabel("#intro-loader", text.loading);

    try {
      localStorage.setItem("bart-site-language", language);
    } catch (_) {}
  }

  let initialLanguage = "zh";

  try {
    const saved = localStorage.getItem("bart-site-language");

    if (Object.hasOwn(translations, saved)) {
      initialLanguage = saved;
    }
  } catch (_) {}

  languageSelect.addEventListener("change", () => {
    applyLanguage(languageSelect.value);
  });

  applyLanguage(initialLanguage);
})();