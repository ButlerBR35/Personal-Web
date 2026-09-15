/* =====================================================
   委託圖集語言切換
   檔名：commission-language.js

   請放在 commission.js 後載入。

   功能：
   ・中文、日本語、English
   ・翻譯動態產生的資料夾、作品數量與提示
   ・保留繪師名稱、連結及作品資料
   ・沿用首頁的 bart-site-language 語言設定
===================================================== */

(() => {
  "use strict";

  const KEY = "bart-site-language";
  let language = "zh";

  try {
    language = localStorage.getItem(KEY) || "zh";
  } catch {}

  if (!["zh", "ja", "en"].includes(language)) {
    language = "zh";
  }

  // ===== 翻譯文字 =====
  // 每列依序：中文、日本語、English。
  const phrases = [
    [
      "委託圖集 · 巴特",
      "依頼作品集 · バット",
      "Commission Gallery · Bart"
    ],
    [
      "← 返回首頁",
      "← ホームへ戻る",
      "← Back to home"
    ],
    [
      "委託圖集",
      "コミッション作品集",
      "Commission Gallery"
    ],
    [
      "← 上一個作品",
      "← 前の作品",
      "← Previous artwork"
    ],
    [
      "下一個作品 →",
      "次の作品 →",
      "Next artwork →"
    ],
    [
      "返回圖集 ✕",
      "作品集に戻る ✕",
      "Back to gallery ✕"
    ],
    [
      "← 返回分類目錄",
      "← カテゴリーに戻る",
      "← Back to categories"
    ],
    [
      "全部繪師",
      "すべての作家",
      "All artists"
    ],
    [
      "依繪師篩選",
      "作家で絞り込む",
      "Filter by artist"
    ],
    [
      "選擇語言",
      "言語を選択",
      "Choose language"
    ],
    [
      "此作品含成人內容",
      "この作品には成人向けの内容が含まれます",
      "This artwork contains adult content"
    ],
    [
      "我已滿 18 歲，顯示作品",
      "18歳以上です。作品を表示",
      "I am 18 or older — show artwork"
    ],
    [
      "圖片暫時無法載入，請稍後再試。",
      "画像を読み込めません。しばらくしてから再度お試しください。",
      "Unable to load the image. Please try again later."
    ],
    [
      "圖片暫時無法載入",
      "画像を読み込めません",
      "Unable to load the image"
    ],
    [
      "作品著作權屬於各繪師。",
      "作品の著作権は各作家に帰属します。",
      "Copyright belongs to the respective artists."
    ],
    [
      "正在更新雲端清單…",
      "クラウドの作品一覧を更新中…",
      "Updating the cloud gallery…"
    ],
    [
      "更新網址不正確，必須使用 /exec 網址",
      "更新URLが無効です。/exec で終わるURLを使用してください",
      "Invalid update URL. Use a URL ending in /exec"
    ],
    [
      "等待超過 45 秒，未收到有效回應",
      "45秒以内に有効な応答がありませんでした",
      "No valid response within 45 seconds"
    ],
    [
      "無法載入部署網址，請檢查存取權限或網路",
      "公開URLを読み込めません。アクセス権限または接続を確認してください",
      "Unable to load the deployment URL. Check access permissions or your connection"
    ],
    [
      "回傳內容沒有呼叫 receiveDriveGallery",
      "応答で receiveDriveGallery が呼び出されていません",
      "The response did not call receiveDriveGallery"
    ],
    [
      "雲端回傳內容不是有效資料",
      "クラウドからの応答が無効です",
      "The cloud returned invalid data"
    ],
    [
      "雲端回傳資料缺少 works 陣列",
      "クラウドの応答に works 配列がありません",
      "The cloud response is missing the works array"
    ],
    [
      "無法讀取作品清單，請檢查資料夾存取權限。",
      "作品一覧を読み込めません。フォルダーのアクセス権限を確認してください。",
      "Unable to read the gallery. Check folder access permissions."
    ],
    [
      "雲端程式回報：",
      "クラウド側のエラー：",
      "Cloud error: "
    ],
    [
      "顯示已匯入清單",
      "保存済みの一覧を表示しています",
      "Showing the saved gallery"
    ],
    [
      "已從雲端更新",
      "クラウドから更新しました",
      "Updated from the cloud"
    ],
    [
      "更新失敗：",
      "更新に失敗しました：",
      "Update failed: "
    ],
    [
      "已更新；",
      "更新しました；",
      "Updated; "
    ],
    [
      "未分類",
      "未分類",
      "Uncategorized"
    ],
    [
      "約稿",
      "コミッション",
      "Commissions"
    ],
    [
      "贈圖",
      "いただいた作品",
      "Gift artwork"
    ]
  ];

  // 長句先翻譯，避免被短句先替換。
  phrases.sort((a, b) => b[0].length - a[0].length);

  // ===== 翻譯固定文字與動態數量 =====
  function translate(source) {
    if (language === "zh") return source;

    const ja = language === "ja";
    let text = source;

    text = text.replace(
      /(\d+) 件作品缺少雲端分類/g,
      (_, n) =>
        ja
          ? `${n}件の作品にクラウドの分類がありません`
          : `${n} artworks have no cloud category`
    );

    text = text.replace(
      /第 (\d+) 筆資料缺少有效 ID 或繪師/g,
      (_, n) =>
        ja
          ? `${n}件目のデータに有効なIDまたは作家名がありません`
          : `Item ${n} is missing a valid ID or artist`
    );

    text = text.replace(
      /(\d+) 件作品/g,
      (_, n) =>
        ja
          ? `${n} 件の作品`
          : `${n} artwork${n === "1" ? "" : "s"}`
    );

    text = text.replace(
      /^作品 (\d+)$/,
      (_, n) => ja ? `作品 ${n}` : `Artwork ${n}`
    );

    if (/^繪師\s*\/\s*$/.test(text)) {
      return ja ? "作家 / " : "Artist / ";
    }

    for (const row of phrases) {
      text = text
        .split(row[0])
        .join(row[ja ? 1 : 2]);
    }

    return text;
  }

  function init() {
    // 避免重複建立選單。
    if (
      document.getElementById("commission-language-select")
    ) {
      return;
    }

    const header = document.querySelector("header");
    if (!header) return;

    // ===== 建立右上角語言選單 =====
    const select = document.createElement("select");

    select.id = "commission-language-select";
    select.setAttribute("aria-label", "選擇語言");

    // 沿用原本 CSS 的 select 樣式。
    select.style.cssText =
      "margin-left:auto;" +
      "flex:0 0 auto;" +
      "max-width:none;" +
      "min-width:108px;" +
      "font:inherit;";

    [
      ["zh", "中文"],
      ["ja", "日本語"],
      ["en", "English"]
    ].forEach(([value, label]) => {
      select.append(new Option(label, value));
    });

    header.append(select);

    // 保存每個節點的中文來源，
    // 切換回中文時可以還原原始文字。
    const sources = new WeakMap();

    function applyValue(
      node,
      key,
      read,
      write,
      convert = translate
    ) {
      let record = sources.get(node);

      if (!record) {
        record = {};
        sources.set(node, record);
      }

      const current = read();
      if (current === null) return;

      // 原本的 commission.js 更新了文字時，
      // 將新文字視為新的翻譯來源。
      if (
        !record[key] ||
        current !== record[key].last
      ) {
        record[key] = {
          source: current,
          last: current
        };
      }

      const next = convert(record[key].source);

      if (current !== next) {
        write(next);
      }

      record[key].last = next;
    }

    // 僅處理介面文字，不翻譯 folder-name 或繪師選項。
    const selectors = [
      "header > a",
      "header > strong",
      "main > h1",
      "#previous",
      "#next",
      "#close",
      "#total",
      '#artist-filter option[value=""]',
      "#work-title",
      ".folder-count",
      ".folder-category",
      "#work-description",
      ".r18-cover p",
      ".r18-cover button",
      ".fallback",
      ".folder-back",
      "footer"
    ].join(",");

    function observe() {
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-label", "alt"]
      });
    }

    function refresh() {
      // 暫停監看，避免翻譯本身觸發無限更新。
      observer.disconnect();

      try {
        document.documentElement.lang =
          language === "zh" ? "zh-Hant" : language;

        select.value = language;

        document.title =
          language === "zh"
            ? "委託圖集 · 巴特"
            : language === "ja"
              ? "コミッション作品集 · バット"
              : "Commission Gallery · Bart";

        // ===== 翻譯畫面文字 =====
        document.querySelectorAll(selectors)
          .forEach(element => {
            const walker = document.createTreeWalker(
              element,
              NodeFilter.SHOW_TEXT
            );

            let node;

            while ((node = walker.nextNode())) {
              const target = node;

              applyValue(
                target,
                "text",
                () => target.nodeValue,
                value => {
                  target.nodeValue = value;
                }
              );
            }
          });

        // ===== 繪師署名 =====
        // 只更換「繪師 /」，保留姓名和超連結。
        const credit =
          document.getElementById("work-artist");

        if (credit) {
          [...credit.childNodes]
            .filter(node => node.nodeType === 3)
            .forEach(node => {
              applyValue(
                node,
                "text",
                () => node.nodeValue,
                value => {
                  node.nodeValue = value;
                },
                source => {
                  if (language === "zh") return source;

                  return source.replace(
                    /^繪師\s*\/\s*/,
                    language === "ja"
                      ? "作家 / "
                      : "Artist / "
                  );
                }
              );
            });
        }

        // ===== 下拉選單的輔助說明 =====
        [
          select,
          document.getElementById("artist-filter")
        ]
          .filter(Boolean)
          .forEach(element => {
            applyValue(
              element,
              "label",
              () => element.getAttribute("aria-label"),
              value => {
                element.setAttribute("aria-label", value);
              }
            );
          });

        // ===== 資料夾及繪師連結的輔助說明 =====
        document.querySelectorAll(
          ".folder-card, .artist-link"
        ).forEach(element => {
          applyValue(
            element,
            "label",
            () => element.getAttribute("aria-label"),
            value => {
              element.setAttribute("aria-label", value);
            },
            source => {
              if (language === "zh") return source;

              let match = source.match(
                /^開啟 (.*?) 的 (.*?) 資料夾$/
              );

              if (match) {
                return language === "ja"
                  ? `${translate(match[1])}：${match[2]}のフォルダーを開く`
                  : `Open ${match[2]}'s folder in ${translate(match[1])}`;
              }

              match = source.match(
                /^前往繪師 (.*?) 的網站（另開分頁）$/
              );

              if (match) {
                return language === "ja"
                  ? `${match[1]}のサイトへ（新しいタブ）`
                  : `Visit ${match[1]}'s website (new tab)`;
              }

              return source;
            }
          );
        });

        // ===== 圖片替代文字 =====
        document.querySelectorAll("#stage img")
          .forEach(element => {
            applyValue(
              element,
              "alt",
              () => element.getAttribute("alt"),
              value => {
                element.setAttribute("alt", value);
              },
              source => {
                if (language === "zh") return source;

                const match = source.match(/^(.*)的作品$/);

                if (!match) return source;

                return language === "ja"
                  ? `${match[1]}の作品`
                  : `Artwork by ${match[1]}`;
              }
            );
          });
      } finally {
        observe();
      }
    }

    // 新增作品、切換作品、更新狀態時重新翻譯。
    const observer = new MutationObserver(refresh);

    select.addEventListener("change", () => {
      language = select.value;

      try {
        localStorage.setItem(KEY, language);
      } catch {}

      refresh();
    });

    // 同一網站另一個分頁切換語言時同步。
    window.addEventListener("storage", event => {
      if (
        event.key === KEY &&
        ["zh", "ja", "en"].includes(event.newValue)
      ) {
        language = event.newValue;
        refresh();
      }
    });

    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();