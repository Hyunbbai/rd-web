/* 법률 문서와 언어만 읽는다. 인증·게임 실행·브라우저 저장소는 사용하지 않는다. */
(() => {
  "use strict";

  const MESSAGES = {
    en: {
      lang: "en",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      backToGame: "Back to game",
      backToAccount: "Back to account management",
      loading: "Loading document…",
      error: "The document could not be loaded. Check your connection and reload this page.",
      effective: "Effective date",
      version: "Version",
    },
    ko: {
      lang: "ko",
      terms: "이용약관",
      privacy: "개인정보 처리방침",
      backToGame: "게임으로 돌아가기",
      backToAccount: "계정 관리로 돌아가기",
      loading: "문서를 불러오고 있습니다.",
      error: "문서를 불러오지 못했습니다. 연결을 확인한 뒤 이 페이지를 새로고침해 주세요.",
      effective: "시행일",
      version: "버전",
    },
    zh_CN: {
      lang: "zh-CN",
      terms: "服务条款",
      privacy: "隐私政策",
      backToGame: "返回游戏",
      backToAccount: "返回账号管理",
      loading: "正在加载文档…",
      error: "无法加载文档。请检查网络连接并刷新此页面。",
      effective: "生效日期",
      version: "版本",
    },
    ja: {
      lang: "ja",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      backToGame: "ゲームに戻る",
      backToAccount: "アカウント管理に戻る",
      loading: "文書を読み込んでいます…",
      error: "文書を読み込めませんでした。接続を確認して、このページを再読み込みしてください。",
      effective: "施行日",
      version: "バージョン",
    },
  };
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const nonempty = (value) => typeof value === "string" && value.trim().length > 0;

  function selectLanguage() {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (requested && Object.hasOwn(MESSAGES, requested)) return requested;
    const preferred = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages : [navigator.language];
    for (const candidate of preferred) {
      const primary = String(candidate || "").toLowerCase().replaceAll("_", "-").split("-")[0];
      if (primary === "zh") return "zh_CN";
      if (Object.hasOwn(MESSAGES, primary)) return primary;
    }
    return "en";
  }

  const language = selectLanguage();
  const text = MESSAGES[language];
  const kind = document.body.dataset.document;
  const title = document.getElementById("document-title");
  const metadata = document.getElementById("document-meta");
  const status = document.getElementById("document-status");
  const content = document.getElementById("document-content");
  const main = document.getElementById("main");
  const back = document.getElementById("back-link");
  document.documentElement.lang = text.lang;
  status.textContent = text.loading;
  back.textContent = text.backToGame;
  if (kind === "terms" || kind === "privacy") setTitle(text[kind]);

  // 계정 페이지에서 왔을 때만 고정된 상대 경로로 돌아가며 외부 URL을 전달하지 않는다.
  try {
    const referrer = new URL(document.referrer);
    const account = new URL("../account/", window.location.href);
    if (referrer.origin === account.origin &&
        [account.pathname, `${account.pathname}index.html`].includes(referrer.pathname)) {
      back.href = `../account/?lang=${encodeURIComponent(language)}`;
      back.textContent = text.backToAccount;
    }
  } catch {
    // 직접 접속했거나 유효한 참조 주소가 없으면 같은 스테이지의 게임으로 돌아간다.
  }

  function setTitle(value) {
    title.textContent = value;
    document.title = `${value} · ${document.body.dataset.gameName}`;
    document.querySelector('meta[name="description"]').content = document.title;
  }

  function validateDocument(bundle) {
    if (!isObject(bundle) || bundle.schema !== 1 || !nonempty(bundle.version) ||
        !nonempty(bundle.effective_date) || !isObject(bundle.documents) ||
        !["terms", "privacy"].includes(kind) || !isObject(bundle.documents[kind])) {
      throw new Error("Invalid legal document bundle");
    }
    const value = bundle.documents[kind][language];
    if (!isObject(value) || !nonempty(value.title) || !Array.isArray(value.sections) ||
        value.sections.length === 0 || !value.sections.every((section) =>
          isObject(section) && nonempty(section.heading) && Array.isArray(section.paragraphs) &&
          section.paragraphs.length > 0 && section.paragraphs.every(nonempty))) {
      throw new Error("Invalid legal document translation");
    }
    return value;
  }

  async function loadDocument() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("../legal/legal_documents.json", {
        credentials: "omit",
        mode: "same-origin",
        redirect: "error",
        cache: "no-cache",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Legal document unavailable");
      const bundle = await response.json();
      const value = validateDocument(bundle);
      const fragment = document.createDocumentFragment();
      for (const section of value.sections) {
        const element = document.createElement("section");
        const heading = document.createElement("h2");
        heading.textContent = section.heading;
        element.appendChild(heading);
        for (const paragraph of section.paragraphs) {
          const entry = document.createElement("p");
          entry.textContent = paragraph;
          element.appendChild(entry);
        }
        fragment.appendChild(element);
      }
      setTitle(value.title);
      metadata.textContent = `${text.effective}: ${bundle.effective_date} · ${text.version}: ${bundle.version}`;
      metadata.hidden = false;
      content.replaceChildren(fragment);
      status.hidden = true;
    } catch {
      status.textContent = text.error;
      status.dataset.error = "true";
      status.hidden = false;
    } finally {
      clearTimeout(timeout);
      main.setAttribute("aria-busy", "false");
    }
  }

  void loadDocument();
})();
