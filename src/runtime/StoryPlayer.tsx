import { useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";

const BOYFRIENDS = [
  { id: "martin", name: "MARTIN" },
  { id: "james", name: "JAMES" },
  { id: "juhoon", name: "JUHOON" },
  { id: "seonghyeon", name: "SEONGHYEON" },
  { id: "keonho", name: "KEONHO" },
] as const;

type BoyfriendId = (typeof BOYFRIENDS)[number]["id"];

function personalizeWork(source: Work, playerName: string, playerAccount: string, boyfriend: BoyfriendId): Work {
  const work = structuredClone(source);
  const originalOwner = work.phone.owner;
  work.phone.owner = playerName;
  work.variables = {
    ...work.variables,
    playerName,
    playerAccount,
    boyfriend,
    boyfriendName: BOYFRIENDS.find((member) => member.id === boyfriend)?.name ?? "MARTIN",
  };
  if (boyfriend === "martin") {
    work.phone.wallpaper = "martin-photo";
    work.variables.martinWallpaper = import.meta.env.BASE_URL + "assets/martin-wallpaper.jpg";
    work.variables.martinLockScreen = import.meta.env.BASE_URL + "assets/martin-lockscreen.jpg";
  }
  const replacements: Array<[string, string]> = [
    ["{{playerName}}", playerName],
    ["{{playerAccount}}", playerAccount],
    ["{{phoneOwner}}", playerName],
    ["{{boyfriend}}", boyfriend],
    ["{{boyfriendName}}", work.variables.boyfriendName as string],
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
  const [boyfriend, setBoyfriend] = useState<BoyfriendId>("martin");
  const [playerName, setPlayerName] = useState("");
  const [playerAccount, setPlayerAccount] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    const params = new URLSearchParams(location.search);
    const sourceUrl = params.get("preview") === "test"
      ? "./test-work.json"
      : params.get("template") === "blank"
        ? "./blank-work.json"
        : "./work.json";
    fetch(sourceUrl, { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw Error("缺少作品檔案，請執行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title = "CORTIS · 拾獲手機";
        setSource(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);

  const enterPhone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = playerName.trim();
    const account = playerAccount.trim().replace(/^@+/, "");
    if (!name || !account) {
      setFormError("請填寫姓名／暱稱與社群帳號。");
      return;
    }
    if (!/^[A-Za-z0-9._]{1,40}$/.test(account)) {
      setFormError("帳號只能使用英文字母、數字、句點（.）與底線（_），最多 40 個字元。");
      return;
    }
    setFormError("");
    try {
      const response = await fetch("./member-stories/" + boyfriend + ".json");
      if (!response.ok) throw Error("無法載入這位成員的故事，請稍後再試。");
      const memberStory = validateWork(await response.json());
      setWork(personalizeWork(memberStory, name, account, boyfriend));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "故事載入失敗，請稍後再試。");
    }
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
            <h1 id="onboarding-title">選擇你的男友</h1>
            <p className="onboarding-description">
              選擇想攻略的成員，再填寫你的資料，開始專屬於你的故事。
            </p>
            <form onSubmit={enterPhone}>
              <fieldset className="boyfriend-picker">
                <legend>CHOOSE YOUR BOYFRIEND</legend>
                <div className="boyfriend-grid">
                  {BOYFRIENDS.map((member) => (
                    <button
                      className={boyfriend === member.id ? "boyfriend-option is-selected" : "boyfriend-option"}
                      type="button"
                      key={member.id}
                      aria-pressed={boyfriend === member.id}
                      onClick={() => setBoyfriend(member.id)}
                    >
                      <span className="boyfriend-avatar">
                        <img
                          className="boyfriend-avatar-image"
                          src={import.meta.env.BASE_URL + "assets/" + member.id + "-avatar.jpg"}
                          alt={member.name + " 頭像"}
                          loading="lazy"
                        />
                      </span>
                      <span className="boyfriend-name">{member.name}</span>
                      <span className="boyfriend-check" aria-hidden="true">{boyfriend === member.id ? "✓" : ""}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="player-fields">
                <label htmlFor="player-name">你的姓名／暱稱</label>
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
                <label htmlFor="player-account">你的社群帳號</label>
                <div className="player-account-input">
                  <span aria-hidden="true">@</span>
                  <input
                    id="player-account"
                    name="playerAccount"
                    autoComplete="username"
                    maxLength={40}
                    placeholder="輸入英文、數字、. 或 _"
                    value={playerAccount}
                    onChange={(e) => setPlayerAccount(e.target.value)}
                    required
                  />
                </div>
              </div>
              {formError && <p className="onboarding-error" role="alert">{formError}</p>}
              <button className="onboarding-submit" type="submit">
                與 {BOYFRIENDS.find((member) => member.id === boyfriend)?.name} 開始故事 <span aria-hidden="true">→</span>
              </button>
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
