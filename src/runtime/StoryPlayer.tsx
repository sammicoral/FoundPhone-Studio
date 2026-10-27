import { useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";

function personalizeWork(source: Work, playerName: string, playerAccount: string): Work {
  const work = structuredClone(source);
  const originalOwner = work.phone.owner;
  work.phone.owner = playerName;
  work.variables = {
    ...work.variables,
    playerName,
    playerAccount,
  };
  const replacements: Array<[string, string]> = [
    ["{{playerName}}", playerName],
    ["{{playerAccount}}", playerAccount],
    ["{{phoneOwner}}", playerName],
    ["林知夏", playerName],
    ["知夏", playerName],
    ["lin.zhixia", playerAccount],
  ];
  const replace = (value: unknown): unknown => {
    if (typeof value === "string") {
      return replacements.reduce((result, [from, to]) => result.split(from).join(to), value)
        .replaceAll(originalOwner, playerName);
    }
    if (Array.isArray(value)) return value.map(replace);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item)]));
    }
    return value;
  };
  return validateWork(replace(work));
}

function StoryPlayer() {
  const [source, setSource] = useState<Work | null>(null);
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerAccount, setPlayerAccount] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    fetch(
      new URLSearchParams(location.search).get("preview") === "test"
        ? "./test-work.json"
        : new URLSearchParams(location.search).get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json",
      { signal: abort.signal },
    )
      .then((r) => {
        if (!r.ok) throw Error("缺少作品檔案，請執行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title = w.title === "拾獲手機" ? "拾獲手機" : w.title + " · 拾獲手機";
        setSource(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);

  const enterPhone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = playerName.trim();
    const account = playerAccount.trim().replace(/^@+/, "");
    if (!name || !account) {
      setFormError("請填寫姓名／暱稱與社群帳號。");
      return;
    }
    if (account.length > 40) {
      setFormError("帳號請控制在 40 個字元以內。");
      return;
    }
    if (!source) return;
    setWork(personalizeWork(source, name, account));
    setFormError("");
  };

  return (
    <main className="story-runtime">
      {work ? (
        <Phone work={work} />
      ) : source ? (
        <section className="player-onboarding" aria-labelledby="onboarding-title">
          <div className="onboarding-card">
            <div className="onboarding-mark" aria-hidden="true">🩷</div>
            <p className="onboarding-eyebrow">YOUR STORY STARTS HERE</p>
            <h1 id="onboarding-title">先認識一下你</h1>
            <p className="onboarding-description">
              輸入你想使用的名字與社群帳號，接著就能開啟屬於你的手機。
            </p>
            <form onSubmit={enterPhone}>
              <label htmlFor="player-name">姓名／暱稱</label>
              <input
                id="player-name"
                name="playerName"
                autoComplete="nickname"
                maxLength={60}
                placeholder="輸入你想使用的名字"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
              <label htmlFor="player-account">社群帳號</label>
              <div className="player-account-input">
                <span aria-hidden="true">@</span>
                <input
                  id="player-account"
                  name="playerAccount"
                  autoComplete="username"
                  maxLength={40}
                  placeholder="輸入你的帳號（不需加 @）"
                  value={playerAccount}
                  onChange={(e) => setPlayerAccount(e.target.value)}
                  required
                />
              </div>
              {formError && <p className="onboarding-error" role="alert">{formError}</p>}
              <button className="onboarding-submit" type="submit">進入我的手機 <span aria-hidden="true">→</span></button>
            </form>
            <p className="onboarding-footnote">無需註冊或登入；資料只用於這次故事體驗。</p>
          </div>
        </section>
      ) : (
        <p role="status">{error || "正在開啟故事…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
