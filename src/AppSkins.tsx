import { NativeComposer } from "./DeviceSystem";
import { useSkinState } from "./skinState";
import { useState } from "react";
import {
  ChevronLeft,
  Plus,
  CirclePlus,
  Search,
  MessageCircle,
  Users,
  Compass,
  User,
  Camera,
  Phone,
  Video,
  Settings,
  Heart,
  Send,
  Home,
  Play,
  Bookmark,
  MoreHorizontal,
  Mic,
  Smile,
  Grid,
  CheckCheck,
  AtSign,
  Star,
  Music,
  Image as ImageIcon,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { safeMedia, type Item, type UiValue } from "./schema";
export type SkinProps = {
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
  appId?: string;
  owner?: string;
  account?: string;
  virtualTime?: string;
  name: string;
  items: Item[];
  creator: boolean;
  onRead: (id: string) => void;
  onItem: (i: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  thread: string;
  onThread: (s: string) => void;
};
function Avatar({
  name,
  round = false,
  src = "",
}: {
  name: string;
  round?: boolean;
  src?: string;
}) {
  return (
    <span className={`skin-avatar ${round ? "round" : ""}`}>
      {safeMedia(src)?.startsWith("data:image/") ? (
        <img src={safeMedia(src)} alt="" />
      ) : (
        name.slice(0, 1)
      )}
    </span>
  );
}
function ItemMedia({ item }: { item: Item }) {
  const src = safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio controls src={src} />
    ) : item.kind === "video" ? (
      <video controls playsInline src={src} />
    ) : (
      <img loading="lazy" alt={item.title} src={src} />
    )
  ) : (
    <div className="skin-photo">
      <span>{item.title}</span>
    </div>
  );
}
function MessageList({
  items,
  creator,
  onItem,
  onRead,
  whatsapp = false,
}: {
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onRead: (id: string) => void;
  whatsapp?: boolean;
}) {
  return (
    <div className={`skin-messages ${whatsapp ? "wa-wallpaper" : ""}`}>
      <div className="skin-date">{items[0]?.time.slice(0, 10)}</div>
      {items.map((i) => (
        <div
          key={i.id}
          className={`skin-message ${i.outgoing ? "outgoing" : ""}`}
        >
          {!whatsapp && !i.outgoing && (
            <Avatar name={i.sender} src={i.avatar} />
          )}
          <button
            className="skin-bubble"
            onClick={() => (creator ? onItem(i) : onRead(i.id))}
          >
            {["image", "audio", "video"].includes(i.kind) ? (
              <ItemMedia item={i} />
            ) : i.kind === "transfer" ? (
              <div className="skin-transfer">
                ¥ {i.body}
                <small>轉帳記錄 · 虛構</small>
              </div>
            ) : (
              i.body
            )}
            <small className={whatsapp ? undefined : "wx-message-time"}>
              {i.time.slice(-5)}{" "}
              {whatsapp && i.outgoing && <CheckCheck size={11} />}
            </small>
          </button>
          {!whatsapp && i.outgoing && <Avatar name={i.sender} src={i.avatar} />}
        </div>
      ))}
    </div>
  );
}
function Compose({
  creator,
  onAdd,
  wa = false,
}: {
  creator: boolean;
  onAdd: () => void;
  wa?: boolean;
}) {
  return (
    <div className={`skin-compose ${wa ? "wa-compose" : ""}`}>
      {wa ? <Plus size={20} /> : <Mic size={20} />}
      <NativeComposer creator={creator} onAdd={onAdd} />

      <Smile size={21} />
      {wa ? <Mic size={20} /> : <Plus size={22} />}
    </div>
  );
}
export function WeChatSkin(p: SkinProps) {
  const [tab, setTab] = useState("微信"),
    [query, setQuery] = useState(""),
    [moments, setMoments] = useState(false),
    [menu, setMenu] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [utility, setUtility] = useState("");
  const [readThreads, setReadThreads] = useSkinState<string[]>(
    p,
    "readThreads",
    [],
  );
  const conversations = [
    ...new Set(
      p.items
        .filter((i) => !["動態", "我"].includes(i.folder))
        .map((i) => i.title),
    ),
  ];
  const contacts = [
    ...new Set(p.items.map((i) => i.sender).filter((s) => s !== "我")),
  ];
  const posts = p.items.filter(
    (i) => i.folder === "動態" || i.kind === "post",
  );
  return (
    <div
      className="wechat-ui independent-skin"
      data-tab={tab}
      data-thread={!!p.thread}
      data-moments={moments}
      data-utility={!!utility}
    >
      <div className="app-nav wx-nav">
        <button
          aria-label={utility || p.thread || moments ? "返回" : "收藏"}
          onClick={() =>
            utility
              ? setUtility("")
              : p.thread
                ? p.onThread("")
                : moments
                  ? setMoments(false)
                  : setUtility("收藏")
          }
        >
          {utility || p.thread || moments ? (
            <ChevronLeft size={22} />
          ) : (
            <Star size={22} />
          )}
        </button>
        <strong>
          {utility ||
            p.thread ||
            (moments ? "動態" : tab === "微信" ? p.name : tab)}
        </strong>
        <button
          aria-label={
            p.creator ? "新增內容" : p.thread ? "聊天資訊" : "微信選單"
          }
          onClick={
            p.creator
              ? p.onAdd
              : () => (p.thread ? setUtility("聊天資訊") : setMenu(!menu))
          }
        >
          {p.thread ? <MoreHorizontal size={22} /> : <CirclePlus size={22} />}
        </button>
      </div>
      {menu && (
        <div className="wx-popup-menu" role="menu">
          {["搜尋", "發起群組聊天", "新增朋友", "掃描條碼", "收付款"].map((label) => (
            <button
              role="menuitem"
              key={label}
              onClick={() => {
                setMenu(false);
                if (label === "搜尋") {
                  setSearchOpen(true);
                } else setUtility(label);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {utility ? (
        <div className="skin-scroll wx-utility">
          {utility === "聊天資訊" && (
            <div className="wx-members">
              {[
                ...new Set(
                  p.items
                    .filter((i) => i.title === p.thread)
                    .map((i) => i.sender),
                ),
              ].map((name) => (
                <div key={name}>
                  <Avatar
                    name={name}
                    src={p.items.find((i) => i.sender === name)?.avatar}
                  />
                  <small>{name}</small>
                </div>
              ))}
            </div>
          )}
          {p.items
            .filter((i) => i.folder === utility)
            .map((i) => (
              <button
                key={i.id}
                className="wx-discovery"
                onClick={() => p.onItem(i)}
              >
                {i.title}
                <span>›</span>
              </button>
            ))}
          {!p.items.some((i) => i.folder === utility) &&
            utility !== "聊天資訊" && <p className="skin-empty">暫無內容</p>}
        </div>
      ) : p.thread ? (
        <>
          <MessageList
            items={p.items.filter((i) => i.title === p.thread)}
            creator={p.creator}
            onItem={p.onItem}
            onRead={p.onRead}
          />
          <Compose creator={p.creator} onAdd={p.onAdd} />
        </>
      ) : moments ? (
        <div className="wx-moments">
          <div className="wx-moment-cover">
            <Camera size={32} />
            <span>動態</span>
          </div>
          {posts.map((i) => (
            <button
              key={i.id}
              className="wx-moment-post"
              onClick={() => p.onItem(i)}
            >
              <Avatar name={i.sender} />
              <div>
                <strong>{i.sender}</strong>
                <p>{i.body}</p>
                {i.media && <ItemMedia item={i} />}
                <small>{i.time}</small>
              </div>
            </button>
          ))}
          {!posts.length && <p className="skin-empty">暫無動態動態</p>}
          {p.creator && (
            <button className="phone-add" onClick={p.onAdd}>
              新增動態動態
            </button>
          )}
        </div>
      ) : (
        <div className="skin-scroll">
          {tab === "微信" ? (
            <>
              {searchOpen && (
                <label className="wx-search">
                  <Search size={14} />
                  <input
                    aria-label="搜尋微信內容"
                    placeholder="搜尋"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              )}
              {conversations
                .filter(
                  (t) =>
                    t.includes(query) ||
                    p.items.some(
                      (i) => i.title === t && i.body.includes(query),
                    ),
                )
                .map((t) => {
                  const list = p.items.filter((i) => i.title === t),
                    last = list.at(-1)!;
                  return (
                    <button
                      className="wx-chat-row"
                      key={t}
                      onClick={() => {
                        setReadThreads((v) => (v.includes(t) ? v : [...v, t]));
                        p.onThread(t);
                        p.onRead(t);
                      }}
                    >
                      <span className="wx-chat-avatar">
                        <Avatar name={t} src={last.avatar} />
                        {!readThreads.includes(t) &&
                          list.some((i) => !i.read) && (
                            <b className="wx-unread">
                              {list.filter((i) => !i.read).length}
                            </b>
                          )}
                      </span>
                      <div>
                        <strong>{t}</strong>
                        <p>{last.body}</p>
                      </div>
                      <time>{last.time.slice(-5)}</time>
                    </button>
                  );
                })}
              {!conversations.length && <p className="skin-empty">暫無聊天</p>}
            </>
          ) : tab === "通訊錄" ? (
            <>
              <div className="wx-section-label">聯絡人</div>
              {contacts.map((c) => (
                <button
                  key={c}
                  className="wx-contact"
                  onClick={() => {
                    const item = p.items.find((i) => i.sender === c);
                    if (item) {
                      p.onThread(item.title);
                      p.onRead(item.title);
                    }
                  }}
                >
                  <Avatar
                    name={c}
                    src={p.items.find((i) => i.sender === c)?.avatar}
                  />
                  {c}
                </button>
              ))}
            </>
          ) : tab === "探索" ? (
            <div className="wx-discover-groups">
              {[
                [Camera, "動態", "#26a958"],
                [Play, "影音頻道", "#fa9d3b"],
                [Music, "聽一聽", "#fa5151"],
              ].map(([Icon, label, color]) => {
                const Glyph = Icon as typeof Camera;
                return (
                  <button
                    key={String(label)}
                    className="wx-discovery"
                    onClick={() =>
                      label === "動態"
                        ? setMoments(true)
                        : setUtility(String(label))
                    }
                  >
                    <Glyph size={22} style={{ color: String(color) }} />
                    {String(label)}
                    <span>›</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className="wx-profile">
                <Avatar name={p.owner || "手機持有人"} />
                <div>
                  <h2>{p.owner || "手機持有人"}</h2>
                  <small>微信號：未設定</small>
                  <button
                    className="wx-profile-status"
                    onClick={() => setUtility("狀態")}
                  >
                    ＋ 狀態
                  </button>
                </div>
              </div>
              <div className="wx-profile-menu">
                {[
                  [MessageCircle, "服务", "#07c160"],
                  [Layers, "收藏", "#e8a828"],
                  [ImageIcon, "動態", "#3a9bd9"],
                  [Layers, "作品", "#329dd8"],
                  [ShoppingBag, "小店與卡包", "#ed7c59"],
                  [Smile, "表情符號", "#f7b900"],
                  [Settings, "設定", "#1696d2"],
                ].map(([Icon, label, color]) => {
                  const Glyph = Icon as typeof Settings;
                  return (
                    <button
                      key={String(label)}
                      className="wx-discovery"
                      onClick={() =>
                        label === "動態"
                          ? setMoments(true)
                          : setUtility(String(label))
                      }
                    >
                      <Glyph size={22} style={{ color: String(color) }} />
                      {String(label)}
                      <span>›</span>
                    </button>
                  );
                })}
              </div>
              {p.items
                .filter((i) => i.folder === "我")
                .map((i) => (
                  <button
                    className="wx-discovery"
                    key={i.id}
                    onClick={() => p.onItem(i)}
                  >
                    <User size={18} />
                    {i.title}
                    <span>›</span>
                  </button>
                ))}
              {p.creator && (
                <button className="phone-add" onClick={p.onAdd}>
                  編輯個人資料
                </button>
              )}
            </>
          )}
        </div>
      )}
      {!p.thread && !moments && !utility && (
        <nav className="wx-bottom">
          {[
            { label: "微信", icon: MessageCircle },
            { label: "通訊錄", icon: Users },
            { label: "探索", icon: Compass },
            { label: "我", icon: User },
          ].map((t) => (
            <button
              className={tab === t.label ? "selected" : ""}
              key={t.label}
              onClick={() => setTab(t.label)}
            >
              <t.icon size={21} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
export function WhatsAppSkin(p: SkinProps) {
  const [tab, setTab] = useState("聊天"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("全部");
  const tabs = [
    { label: "動態", icon: Compass },
    { label: "通話", icon: Phone },
    { label: "社群", icon: Users },
    { label: "聊天", icon: MessageCircle },
    { label: "設定", icon: Settings },
  ];
  const conversations = [
    ...new Set(
      p.items
        .filter((i) => !["動態", "通話", "社群", "設定"].includes(i.folder))
        .filter((i) => filter !== "未讀" || !i.read)
        .map((i) => i.title),
    ),
  ];
  const name = tab === "聊天" ? p.name : tab;
  return (
    <div className="whatsapp-ui independent-skin">
      <div className="app-nav wa-nav">
        <button
          aria-label="返回"
          onClick={() => (p.thread ? p.onThread("") : p.onBack())}
        >
          <ChevronLeft size={22} />
        </button>
        <strong>{p.thread || name}</strong>
        <button
          aria-label={p.creator ? "新增內容" : "搜尋內容"}
          onClick={
            p.creator
              ? p.onAdd
              : () =>
                  document
                    .querySelector<HTMLInputElement>(".wa-search input")
                    ?.focus()
          }
        >
          {p.creator ? <Plus size={21} /> : <Search size={20} />}
        </button>
      </div>
      {p.thread ? (
        <>
          <div className="wa-thread-profile">
            <button aria-label="返回聊天列表" onClick={() => p.onThread("")}>
              <ChevronLeft size={23} />
            </button>
            <Avatar
              name={p.thread}
              src={p.items.find((i) => i.title === p.thread)?.avatar}
              round
            />
            <div>
              <strong>{p.thread}</strong>
              <small>聯絡人</small>
            </div>
            <Video size={18} />
            <Phone size={17} />
          </div>
          <MessageList
            items={p.items.filter((i) => i.title === p.thread)}
            creator={p.creator}
            onItem={p.onItem}
            onRead={p.onRead}
            whatsapp
          />
          <Compose creator={p.creator} onAdd={p.onAdd} wa />
        </>
      ) : (
        <div className="skin-scroll">
          <h1 className="wa-large-title">{tab}</h1>
          {tab === "聊天" ? (
            <>
              <label className="wa-search">
                <Search size={16} />
                <input
                  placeholder="搜尋"
                  aria-label="搜尋 WhatsApp"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="wa-filters">
                {["全部", "未讀", "群組"].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {conversations
                .filter((t) => t.includes(query))
                .filter(
                  (t) =>
                    filter !== "群組" ||
                    p.items.some((i) => i.title === t && i.folder === "群組"),
                )
                .map((t) => {
                  const last = p.items.filter((i) => i.title === t).at(-1)!;
                  return (
                    <button
                      className="wa-chat-row"
                      key={t}
                      onClick={() => {
                        p.onThread(t);
                        p.onRead(t);
                      }}
                    >
                      <Avatar name={t} src={last.avatar} round />
                      <div>
                        <strong>{t}</strong>
                        <p>
                          {last.outgoing && <CheckCheck size={12} />}{" "}
                          {last.body}
                        </p>
                      </div>
                      <time>{last.time.slice(-5)}</time>
                    </button>
                  );
                })}
            </>
          ) : tab === "設定" ? (
            <>
              <div className="wa-settings-profile">
                <Avatar name="我" round />
                <h2>個人資料</h2>
              </div>
              {p.items
                .filter((i) => i.folder === "設定")
                .map((i) => (
                  <button
                    key={i.id}
                    className="wa-record"
                    onClick={() => p.onItem(i)}
                  >
                    {i.title}
                    <span>›</span>
                  </button>
                ))}
            </>
          ) : (
            <>
              {tab === "動態" && (
                <div className="wa-status">
                  <Avatar name="我" round />
                  <span>我的狀態</span>
                  {p.creator && (
                    <button aria-label="新增動態" onClick={p.onAdd}>
                      <Plus size={17} />
                    </button>
                  )}
                </div>
              )}
              {p.items
                .filter(
                  (i) =>
                    i.folder === tab || (tab === "通話" && i.kind === "call"),
                )
                .map((i) => (
                  <button
                    className="wa-record"
                    key={i.id}
                    onClick={() => p.onItem(i)}
                  >
                    <Avatar name={i.sender} src={i.avatar} round />
                    <div>
                      <strong>{i.title}</strong>
                      <p>{i.body}</p>
                    </div>
                    <span>
                      {tab === "通話" ? (
                        <Phone size={17} />
                      ) : (
                        <ChevronLeft size={15} />
                      )}
                    </span>
                  </button>
                ))}
              {!p.items.some((i) => i.folder === tab) && (
                <p className="skin-empty">暫無{tab}內容</p>
              )}
            </>
          )}
          {p.creator && (
            <button className="phone-add" onClick={p.onAdd}>
              新增{tab === "聊天" ? "聊天" : tab}內容
            </button>
          )}
        </div>
      )}
      {!p.thread && (
        <nav className="wa-bottom">
          {tabs.map((t) => (
            <button
              className={tab === t.label ? "selected" : ""}
              key={t.label}
              onClick={() => setTab(t.label)}
            >
              <t.icon size={20} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
export function InstagramSkin(p: SkinProps) {
  const [tab, setTab] = useState("首頁"),
    [dm, setDm] = useState(false),
    [query, setQuery] = useState(""),
    [likes, setLikes] = useSkinState<string[]>(p, "likes", []),
    [saved, setSaved] = useSkinState<string[]>(p, "saved", []),
    [showSaved, setShowSaved] = useState(false);
  const posts = p.items.filter(
      (i) =>
        i.kind === "post" ||
        !["私訊", "Story", "Reels", "個人檔案"].includes(i.folder),
    ),
    stories = p.items.filter((i) => i.folder === "Story"),
    reels = p.items.filter((i) => i.kind === "video" || i.folder === "Reels"),
    messages = p.items.filter((i) => i.folder === "私訊");
  const tabs = [
    { label: "首頁", icon: Home },
    { label: "搜尋", icon: Search },
    { label: "Reels", icon: Play },
    { label: "個人檔案", icon: User },
  ];
  const shown = (
    showSaved ? posts.filter((i) => saved.includes(i.id)) : posts
  ).filter((i) => (i.title + i.body + i.sender).includes(query));
  return (
    <div className="instagram-ui independent-skin">
      <div className="app-nav ig-nav">
        <button
          aria-label="返回"
          onClick={() => (dm ? setDm(false) : p.onBack())}
        >
          <ChevronLeft size={22} />
        </button>
        <strong>{dm ? "私訊" : p.account ? "@" + p.account : p.name}</strong>
        <div>
          {p.creator && (
            <button aria-label="新增內容" onClick={p.onAdd}>
              <Plus size={21} />
            </button>
          )}
          <button aria-label="Instagram 私訊" onClick={() => setDm(!dm)}>
            <Send size={20} />
          </button>
        </div>
      </div>
      <div className="skin-scroll ig-scroll">
        {dm ? (
          <>
            {messages.map((i) => (
              <button
                key={i.id}
                className="ig-dm-row"
                onClick={() => p.onItem(i)}
              >
                <Avatar name={i.sender} round />
                <div>
                  <strong>{i.sender}</strong>
                  <p>{i.body}</p>
                </div>
              </button>
            ))}
            {!messages.length && <p className="skin-empty">暫無私訊</p>}
            {p.creator && (
              <button className="phone-add" onClick={p.onAdd}>
                新增私訊
              </button>
            )}
          </>
        ) : tab === "首頁" ? (
          <>
            <div className="ig-stories">
              <button
                className="ig-story"
                onClick={
                  p.creator
                    ? p.onAdd
                    : () => {
                        if (stories[0]) p.onItem(stories[0]);
                      }
                }
                disabled={!p.creator && !stories.length}
              >
                <span>
                  <Avatar name="我" round />
                </span>
                <small>你的快拍</small>
              </button>
              {stories.map((i) => (
                <button
                  key={i.id}
                  className="ig-story"
                  onClick={() => p.onItem(i)}
                >
                  <span>
                    <Avatar name={i.sender} round />
                  </span>
                  <small>{i.sender}</small>
                </button>
              ))}
            </div>
            {posts.map((i) => (
              <article className="ig-post" key={i.id}>
                <div className="ig-post-author">
                  <Avatar name={i.sender} round />
                  <strong>{i.sender}</strong>
                  <button
                    aria-label={`帖子详情${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </div>
                <button className="ig-post-media" onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
                <div className="ig-post-controls">
                  <button
                    aria-label={`喜歡${i.title}`}
                    onClick={() =>
                      setLikes(
                        likes.includes(i.id)
                          ? likes.filter((x) => x !== i.id)
                          : [...likes, i.id],
                      )
                    }
                  >
                    <Heart
                      size={23}
                      fill={likes.includes(i.id) ? "#ed4956" : "none"}
                      color={likes.includes(i.id) ? "#ed4956" : "currentColor"}
                    />
                  </button>
                  <button
                    aria-label={`評論${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <MessageCircle size={22} />
                  </button>
                  <button
                    aria-label={`查看${i.title}`}
                    onClick={() => p.onItem(i)}
                  >
                    <Send size={21} />
                  </button>
                  <button
                    aria-label={`收藏${i.title}`}
                    onClick={() =>
                      setSaved(
                        saved.includes(i.id)
                          ? saved.filter((x) => x !== i.id)
                          : [...saved, i.id],
                      )
                    }
                  >
                    <Bookmark
                      size={22}
                      fill={saved.includes(i.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="ig-post-caption">
                  <strong>
                    {i.likes + (likes.includes(i.id) ? 1 : 0)} 次讚
                  </strong>
                  <p>
                    <b>{i.sender}</b> {i.body}
                  </p>
                  <button onClick={() => p.onItem(i)}>
                    查看全部 {i.comments.length} 條評論
                  </button>
                  <time>{i.time}</time>
                </div>
              </article>
            ))}
          </>
        ) : tab === "搜尋" ? (
          <>
            <label className="ig-search">
              <Search size={15} />
              <input
                value={query}
                aria-label="搜尋 Instagram"
                placeholder="搜尋"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="ig-explore">
              {shown.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
              ))}
            </div>
          </>
        ) : tab === "Reels" ? (
          <>
            {reels.map((i) => (
              <div className="ig-reel" key={i.id}>
                <ItemMedia item={i} />
                <button onClick={() => p.onItem(i)}>
                  {i.sender} · {i.title}
                </button>
              </div>
            ))}
            {!reels.length && <p className="skin-empty">暫無 Reels</p>}
          </>
        ) : (
          <>
            <div className="ig-profile">
              <Avatar name={posts[0]?.sender ?? "我"} round />
              <div>
                <strong>{posts.length}</strong>
                <small>帖子</small>
              </div>
              <div>
                <strong>0</strong>
                <small>關註者</small>
              </div>
              <div>
                <strong>0</strong>
                <small>正在關註</small>
              </div>
            </div>
            <h3 className="ig-profile-name">{posts[0]?.sender ?? "我"}</h3>
            <div className="ig-profile-tabs">
              <button aria-label="貼文格狀檢視" onClick={() => setShowSaved(false)}>
                <Grid size={21} />
              </button>
              <button
                aria-label="已收藏的貼文"
                onClick={() => setShowSaved(true)}
              >
                <Bookmark size={21} />
              </button>
              <button
                aria-label="個人資料內容"
                onClick={() => {
                  const i = p.items.find((i) => i.folder === "個人檔案");
                  if (i) p.onItem(i);
                  else if (p.creator) p.onAdd();
                }}
              >
                <AtSign size={21} />
              </button>
            </div>
            <div className="ig-explore">
              {shown.map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  <ItemMedia item={i} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <nav className="ig-bottom">
        {tabs.map((t) => (
          <button
            key={t.label}
            className={tab === t.label ? "selected" : ""}
            aria-label={`Instagram ${t.label}`}
            onClick={() => {
              setTab(t.label);
              setDm(false);
            }}
          >
            <t.icon size={23} />
          </button>
        ))}
      </nav>
    </div>
  );
}


/** Weverse-inspired community app shell with Home, Community, Shop, DM and More sections. */
export function WeverseSkin(p: SkinProps) {
  const [bottomTab, setBottomTab] = useState("首頁");
  const [homeTab, setHomeTab] = useState("My Feed");
  const [communityTab, setCommunityTab] = useState("探索社群");
  const [feedTab, setFeedTab] = useState("Highlight");
  const [filter, setFilter] = useState("全部");
  const [joined, setJoined] = useState<string[]>(["CORTIS"]);
  const [liked, setLiked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [artistProfileTab, setArtistProfileTab] = useState("貼文");
  const members = ["MARTIN", "JAMES", "JUHOON", "SEONGHYEON", "KEONHO"];
  const weverseAliases: Record<string, string> = {
    MARTIN: "m.j. edwards",
    JAMES: "CHAOTIC",
    JUHOON: "주훈",
    SEONGHYEON: "성현",
    KEONHO: "건호",
  };
  const getWeverseCanonicalName = (sender: string) => {
    const normalized = sender.trim().toUpperCase();
    return members.find((member) => member === normalized || weverseAliases[member].toUpperCase() === normalized) || "";
  };
  const getWeverseName = (sender: string) => {
    const canonical = getWeverseCanonicalName(sender);
    return canonical ? weverseAliases[canonical] : sender;
  };
  const isCortisArtist = (sender: string) => Boolean(getWeverseCanonicalName(sender));
  const getWeverseAvatarPath = (sender: string) => {
    const canonical = getWeverseCanonicalName(sender);
    return canonical ? import.meta.env.BASE_URL + "assets/weverse/members/" + canonical.toLowerCase() + "/weverse-" + canonical.toLowerCase() + "-avatar.jpg" : "";
  };
  const communities = [
    { name: "TREASURE", members: "CHOI HYUN SUK · JIHOON · YOSHI · JUNKYU · YOON JAE HYUK +5" },
    { name: "BLACKPINK", members: "JISOO · JENNIE · ROSÉ · LISA" },
    { name: "AND2BLE", members: "ZHANGHAO · YOOSEUNGEON · RICKY · KIMGYUVIN · HANYUJIN" },
    { name: "ENHYPEN", members: "JUNGWON · HEESEUNG · JAY · JAKE · SUNGHOON +2" },
    { name: "TOMORROW X TOGETHER", members: "SOOBIN · YEONJUN · BEOMGYU · TAEHYUN · HUENINGKAI" },
  ];
  const posts = p.items.filter((item) => !item.hidden && (item.kind === "post" || item.folder === "feed" || item.folder === "貼文"));
  const visiblePosts = posts.filter((item) => {
    const matchesMember = feedTab !== "Artist" || members.includes(item.sender.toUpperCase());
    const matchesQuery = !query || (item.sender + " " + item.body + " " + (item.title || "")).toLowerCase().includes(query.toLowerCase());
    return matchesMember && matchesQuery;
  });
  const toggle = (list: string[], setter: (value: string[]) => void, id: string) =>
    setter(list.includes(id) ? list.filter((value) => value !== id) : [...list, id]);
  const postCard = (item: Item) => {
    const isLiked = liked.includes(item.id);
    const isSaved = saved.includes(item.id);
    const isExpanded = expanded.includes(item.id);
    const comments = item.comments || [];
    return <article className="wv-post" key={item.id}>
      <div className="wv-post-head" onClickCapture={(event) => { const target = event.target as HTMLElement; if (isCortisArtist(item.sender) && target.closest(".wv-artist-name, .wv-profile-link, .wv-post-author")) { setSelectedArtist(getWeverseCanonicalName(item.sender)); } }}>
        <button className="wv-avatar wv-profile-link" aria-label={getWeverseName(item.sender)} onClick={() => isCortisArtist(item.sender) && setSelectedArtist(getWeverseCanonicalName(item.sender))}>{getWeverseAvatarPath(item.sender) && <img src={getWeverseAvatarPath(item.sender)} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />}{getWeverseName(item.sender).slice(0, 1)}</button>
        <div className="wv-post-author"><strong><button className="wv-artist-name" onClick={() => isCortisArtist(item.sender) && setSelectedArtist(getWeverseCanonicalName(item.sender))}>{getWeverseName(item.sender)}</button>{isCortisArtist(item.sender) && <svg className="wv-verified" viewBox="0 0 24 24" aria-label="官方認證藝人" role="img"><path className="wv-verified-bg" d="M12 1.1 15.1 4.1 19.4 4.6 19.9 8.9 22.9 12 19.9 15.1 19.4 19.4 15.1 19.9 12 22.9 8.9 19.9 4.6 19.4 4.1 15.1 1.1 12 4.1 8.9 4.6 4.6 8.9 4.1Z" /><path className="wv-verified-check" d="m7.3 12.2 3 3 6.4-6.5" /></svg>}</strong><small>{item.time || "剛剛"}</small></div>
        <button className="wv-more-button" aria-label="更多貼文選項" onClick={() => setExpanded((old) => old.includes(item.id) ? old.filter((id) => id !== item.id) : [...old, item.id])}><MoreHorizontal size={20}/></button>
      </div>
      <button className="wv-post-body" onClick={() => { p.onRead(item.id); toggle(expanded, setExpanded, item.id); }}>
        {item.title && item.title !== item.sender ? <strong>{item.title}</strong> : null}
        <span>{item.body}</span>
        {item.media ? <span className="wv-media-placeholder">照片／影片</span> : null}
        {isExpanded && <span className="wv-post-expanded">CORTIS 社群貼文 · 查看留言與完整內容</span>}
      </button>
      <div className="wv-post-actions">
        <button className={isLiked ? "liked" : ""} aria-pressed={isLiked} onClick={() => toggle(liked, setLiked, item.id)}><Heart size={20} fill={isLiked ? "currentColor" : "none"}/><span>{(item.likes || 0) + (isLiked ? 1 : 0) || ""}</span></button>
        <button onClick={() => toggle(expanded, setExpanded, item.id)}><MessageCircle size={20}/><span>{comments.length || ""}</span></button>
        <button className="wv-save" aria-label="收藏貼文" aria-pressed={isSaved} onClick={() => toggle(saved, setSaved, item.id)}><Bookmark size={19} fill={isSaved ? "currentColor" : "none"}/></button>
      </div>
      {isExpanded && <div className="wv-comments">{comments.length ? comments.map((comment, index) => <p key={index}><strong>COER</strong> {comment}</p>) : <p>還沒有留言。</p>}</div>}
    </article>;
  };
  const tabs = ["首頁", "社群", "Shop", "DM", "More"];
  if (selectedArtist) {
    const artistName = weverseAliases[selectedArtist] || selectedArtist;
    const artistPosts = posts.filter((item) => getWeverseCanonicalName(item.sender) === selectedArtist);
    return (
      <div className="weverse-ui independent-skin wv-artist-profile-page">
        <header className="wv-artist-profile-hero">
          <button className="wv-profile-back" aria-label="返回" onClick={() => setSelectedArtist("")}><ChevronLeft size={25}/></button>
          <button className="wv-profile-share" aria-label="分享"><Send size={22}/></button>
          <div className="wv-profile-photo-placeholder" aria-hidden="true"></div>
          <div className="wv-profile-summary">
            <div className="wv-profile-avatar-placeholder"><img src={getWeverseAvatarPath(selectedArtist)} alt={artistName} onError={(event) => { event.currentTarget.style.display = "none"; }} /></div>
            <strong>{artistName}<svg className="wv-verified wv-verified-profile" viewBox="0 0 24 24" aria-label="官方認證藝人" role="img"><path className="wv-verified-bg" d="M12 1.1 15.1 4.1 19.4 4.6 19.9 8.9 22.9 12 19.9 15.1 19.4 19.4 15.1 19.9 12 22.9 8.9 19.9 4.6 19.4 4.1 15.1 1.1 12 4.1 8.9 4.6 4.6 8.9 4.1Z"/><path className="wv-verified-check wv-verified-check-profile" d="m7.3 12.2 3 3 6.4-6.5"/></svg></strong>
            <span className="wv-profile-stat">15</span><span className="wv-profile-stat-label">收藏集</span>
            <button className="wv-following-button">✓ 正在追蹤</button>
          </div>
        </header>
        <div className="wv-profile-mini-gallery"><div></div><div></div><div></div><div></div><div></div></div>
        <nav className="wv-profile-tabs">{["貼文","留言","Party"].map(tab => <button key={tab} className={artistProfileTab === tab ? "active" : ""} onClick={() => setArtistProfileTab(tab)}>{tab}</button>)}</nav>
        <div className="wv-profile-feed">
          {artistProfileTab === "貼文" ? (artistPosts.length ? artistPosts.map(postCard) : <div className="wv-empty">目前沒有貼文</div>) : <div className="wv-empty">{artistProfileTab === "留言" ? "目前沒有留言" : "目前沒有 Party 活動"}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className="weverse-ui independent-skin">
      {bottomTab === "首頁" && <>
        <header className="wv-header">
          <strong className="wv-wordmark">weverse</strong>
          <div><button aria-label="Weverse 通知"><Star size={23}/></button><button aria-label="通知" onClick={() => setHomeTab("通知")}>♧<i>28</i></button></div>
        </header>
        <nav className="wv-home-tabs">{["My Feed", "Discover", "Party", "Spot"].map(t => <button key={t} className={homeTab === t ? "active" : ""} onClick={() => setHomeTab(t)}>{t}</button>)}</nav>
        {homeTab === "Spot" ? <div className="wv-scroll wv-spot">
          <div className="wv-spot-art"><span>✦</span><strong>Weverse Spot</strong><small>遠端候位 · Stamp Rally · Pickup</small></div>
          <h2>Weverse Spot 就從這裡開始</h2><p>輕鬆樂享所有活動吧</p>
          <div className="wv-pill-row"><button>我的藝人</button><button>地區⌄</button></div>
          <h3>Now on Spot：今日活動</h3><div className="wv-blank-card">活動圖片預留區</div>
        </div> : homeTab === "Discover" ? <div className="wv-scroll"><h2 className="wv-section-title">探索社群</h2><label className="wv-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜尋藝人／社群"/></label>{communities.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => <div className="wv-community-row" key={c.name}><span className="wv-community-icon">W</span><div><strong>{c.name}</strong><small>{c.members}</small></div><button onClick={() => toggle(joined,setJoined,c.name)}>{joined.includes(c.name) ? "已加入" : "加入"}</button></div>)}</div> : homeTab === "Party" ? <div className="wv-scroll"><h2 className="wv-section-title">Party</h2><div className="wv-blank-card">Party 活動與直播預留區</div></div> : <div className="wv-scroll"><h2 className="wv-section-title">藝人動態</h2>{visiblePosts.length ? visiblePosts.map(postCard) : <div className="wv-empty">目前沒有新貼文</div>}</div>}
      </>}
      {bottomTab === "社群" && <>
        {!communityTab || communityTab === "探索社群" ? <>
          <div className="wv-topline"><button onClick={() => setSearching(!searching)}><Search size={20}/></button><strong>社群</strong><button onClick={() => setSearching(!searching)}><Plus size={22}/></button></div>
          {searching && <label className="wv-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="請輸入藝人姓名"/></label>}
          <div className="wv-scroll">
            <h2 className="wv-section-title">我的社群</h2><button className="wv-my-community" onClick={() => setCommunityTab("Home")}><span className="wv-cortis-icon"><img src={import.meta.env.BASE_URL + "assets/weverse/group/weverse-cortis-avatar.jpg"} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />C</span><span>CORTIS</span><i>●</i></button>
            <button className="wv-promo" onClick={() => setCommunityTab("Home")}>OPEN! ASC2NT <small>立即前往查看</small><span>團體圖片預留區</span></button>
            <h2 className="wv-section-title">全部社群</h2>
            <div className="wv-filter-row">{["全部","Weverse DM","New","Group","Artist"].map(t=><button key={t} className={filter===t?"active":""} onClick={()=>setFilter(t)}>{t}</button>)}</div>
            {communities.filter(c=>c.name.toLowerCase().includes(query.toLowerCase())).map(c=><div className="wv-community-row" key={c.name}><span className="wv-community-icon">{c.name.slice(0,1)}</span><div><strong>{c.name}</strong><small>{c.members}</small></div><button onClick={()=>toggle(joined,setJoined,c.name)}>{joined.includes(c.name)?"已加入":"加入"}</button></div>)}
          </div>
        </> : <>
          <div className="wv-detail-hero"><button className="wv-back" onClick={()=>setCommunityTab("探索社群")}><ChevronLeft/></button><div className="wv-hero-image"><img src={import.meta.env.BASE_URL + "assets/weverse/group/weverse-cortis-cover.JPG"} alt="CORTIS 社群封面" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div><div className="wv-detail-title"><small>722萬 members · ✓ 已加入</small><h1>CORTIS</h1><button onClick={()=>setJoined(old=>old.includes("CORTIS")?old.filter(x=>x!=="CORTIS"):[...old,"CORTIS"])}>♡ Membership⌄</button></div></div>
          <nav className="wv-detail-tabs">{["Home","Feed","LIVE·Media","Shop"].map(t=><button key={t} className={communityTab===t?"active":""} onClick={()=>setCommunityTab(t)}>{t}</button>)}</nav>
          <div className="wv-scroll">
            {communityTab === "Home" ? <><h2 className="wv-section-title">公告</h2><div className="wv-announcements"><p>[공지] CORTIS GLOBAL OFFICIAL FANCLUB</p><p>[NOTICE] CORTIS The 2nd EP</p></div><h2 className="wv-section-title">Calendar</h2><div className="wv-blank-card">行事曆預留區</div></> :
            communityTab === "Shop" ? <><h2 className="wv-section-title">Shop</h2><div className="wv-blank-card">官方商品預留區</div></> :
            communityTab === "LIVE·Media" ? <><h2 className="wv-section-title">最新 LIVE</h2><div className="wv-blank-card">LIVE／影音縮圖預留區</div></> :
            <><div className="wv-filter-row wv-feed-cats">{["Highlight","Fan","Artist","Party"].map(t=><button key={t} className={feedTab===t?"active":""} onClick={()=>setFeedTab(t)}>{t}</button>)}</div><div className="wv-feed-label"><strong>Feed</strong><button onClick={()=>setSearching(!searching)}><Search size={15}/> 篩選條件</button></div>{searching&&<label className="wv-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜尋貼文"/></label>}{visiblePosts.length?visiblePosts.map(postCard):<div className="wv-empty">這裡會顯示 CORTIS 的最新貼文</div>}</>}
          </div>
        </>}
      </>}
      {bottomTab === "Shop" && <div className="wv-scroll"><h2 className="wv-section-title">Shop</h2><div className="wv-blank-card">商品圖片與購物功能預留區</div></div>}
      {bottomTab === "DM" && <div className="wv-scroll"><h2 className="wv-section-title">Weverse DM</h2><div className="wv-empty">目前沒有訊息</div></div>}
      {bottomTab === "More" && <>
        <div className="wv-topline"><strong>More</strong><button aria-label="設定" onClick={()=>setSettingsOpen(!settingsOpen)}><Settings size={22}/></button></div>
        <div className="wv-scroll">
          <div className="wv-profile"><strong>{p.owner || "Sammi Wu"}</strong><button>會員資訊</button><p>♡ 我的 Membership ›</p></div>
          <div className="wv-points">✿ 0 <button>儲值</button></div>
          <div className="wv-tools-grid">{["Shop 訂單紀錄","活動申請紀錄","媒體購買紀錄"].map(t=><button key={t}>{t}</button>)}</div>
          <div className="wv-menu-list">{["優惠券","我的收藏集","最近瀏覽的媒體","已儲存的影片","已儲存的 QR 碼","Weverse Magazine","通知設定","語言設定","服務資訊及條款","登出","刪除帳號"].map(t=><button key={t} onClick={()=>t==="通知設定"||t==="語言設定"?setSettingsOpen(true):undefined}>{t}<span>›</span></button>)}</div>
          {settingsOpen&&<div className="wv-settings-panel"><strong>設定</strong><p>附加功能設定</p><button onClick={()=>setSettingsOpen(false)}>關閉</button></div>}
        </div>
      </>}
      <nav className="wv-bottom-nav">{tabs.map((t,i)=><button key={t} className={bottomTab===t?"active":""} onClick={()=>{setBottomTab(t);setSearching(false);}}><span className="wv-nav-icon">{i === 0 ? <Home size={21}/> : i === 1 ? <Grid size={21}/> : i === 2 ? <ShoppingBag size={21}/> : i === 3 ? <Send size={21}/> : <MoreHorizontal size={21}/>}</span><span>{t}</span></button>)}</nav>
    </div>
  );
}
