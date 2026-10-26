import { useState } from "react";
import {
  ChevronLeft,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  Headphones,
  Star,
  Camera,
  Crown,
  Copy,
  Send,
  Home,
  Search,
  Bell,
  Circle,
} from "lucide-react";
import { useSkinState } from "../skinState";
import { RichText } from "../RichText";
import { Avatar, Media, meta } from "./shared";
import type { Item, UiValue } from "../schema";
import "./social-details.css";
export const socialDetailApps = new Set(["twitter", "weibo"]);
const count = (n: number) =>
  n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, "") + "w" : String(n);
export function SocialDetail(p: {
  app: string;
  item: Item;
  back: () => void;
  owner: string;
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
}) {
  const { item } = p,
    weibo = p.app === "weibo";
  const [liked, setLiked] = useSkinState<boolean>(p, "liked-" + item.id, false),
    [saved, setSaved] = useSkinState<boolean>(p, "saved-" + item.id, false),
    [followed, setFollowed] = useSkinState<boolean>(
      p,
      "followed-" + item.sender,
      false,
    ),
    [extra, setExtra] = useSkinState<string[]>(p, "replies-" + item.id, []);
  const [tab, setTab] = useState("留言"),
    [draft, setDraft] = useState(""),
    [target, setTarget] = useState(""),
    [menu, setMenu] = useState(false),
    [sort, setSort] = useState(false),
    [copied, setCopied] = useState(false);
  const comments = [...item.comments, ...extra],
    replies = sort ? [...comments].reverse() : comments;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.body);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const submit = () => {
    if (!draft.trim()) return;
    setExtra([...extra, (p.owner || "手機持有人") + "：" + draft.trim()]);
    setDraft("");
    setTarget("");
    setTab("留言");
  };
  const actions = (
    <div className="post-detail-actions">
      <button aria-label="查看留言" onClick={() => setTab("留言")}>
        <MessageCircle />
        {count(comments.length)}
      </button>
      <button aria-label="查看轉發" onClick={() => setTab("轉發")}>
        <Repeat2 />
        {meta(item, "reposts", "0")}
      </button>
      <button
        aria-label="喜歡貼文"
        aria-pressed={liked}
        onClick={() => setLiked(!liked)}
      >
        <Heart
          fill={liked ? "#f91880" : "none"}
          color={liked ? "#f91880" : undefined}
        />
        {count(item.likes + (liked ? 1 : 0))}
      </button>
      <button
        aria-label="收藏貼文"
        aria-pressed={saved}
        onClick={() => setSaved(!saved)}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
        {saved ? "1" : "0"}
      </button>
      <button aria-label="分享貼文" onClick={() => setMenu(!menu)}>
        <Share />
      </button>
    </div>
  );
  return (
    <div
      className={
        "app-post-detail " +
        (weibo
          ? "weibo-post-detail"
          : "x-post-detail" +
            (p.ui?.["x-dark"] !== false ? " x-reference-dark" : ""))
      }
    >
      <header className="post-detail-nav">
        <button aria-label="返回貼文列表" onClick={p.back}>
          <ChevronLeft size={27} />
        </button>
        <strong>{weibo ? "微博正文" : "貼文"}</strong>
        <div>
          {weibo && <Headphones size={23} />}
          <button aria-label="貼文更多選項" onClick={() => setMenu(!menu)}>
            <MoreHorizontal size={26} />
          </button>
        </div>
      </header>
      <div className="post-detail-scroll">
        <div className="post-detail-author">
          <Avatar name={item.sender} src={item.avatar} />
          <div>
            <strong>{item.sender || "使用者"}</strong>
            <small>
              {weibo
                ? item.time + " " + meta(item, "location")
                : meta(item, "handle", item.sender ? "@" + item.sender : "")}
            </small>
          </div>
          {weibo ? (
            <button
              aria-label="關注作者"
              onClick={() => setFollowed(!followed)}
            >
              <Star fill={followed ? "#ff9500" : "none"} />
            </button>
          ) : (
            <button
              className="post-follow"
              onClick={() => setFollowed(!followed)}
            >
              {followed ? "已關注" : "關注"}
            </button>
          )}
        </div>
        <div className="post-detail-body">
          <RichText value={item.richText} fallback={item.body} />
          {item.media && <Media item={item} />}
        </div>
        {weibo ? (
          <div className="weibo-share-options">
            {[Crown, MessageCircle, Camera, Share, Copy].map((Icon, n) => (
              <button
                key={n}
                aria-label={["會員", "微信分享", "相机", "分享", "複製"][n]}
                onClick={() => (n === 4 ? void copy() : setMenu(true))}
              >
                <Icon size={25} />
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="x-post-metadata">
              {item.time} · <b>{meta(item, "views", "0")}</b> 次查看
            </div>
            {actions}
          </>
        )}
        {weibo ? (
          <div className="weibo-detail-tabs">
            {["轉發", "留言", "讚"].map((name) => (
              <button
                key={name}
                aria-pressed={tab === name}
                onClick={() => setTab(name)}
              >
                {name}{" "}
                {name === "留言"
                  ? count(comments.length)
                  : name === "讚"
                    ? count(item.likes + (liked ? 1 : 0))
                    : meta(item, "reposts", "0")}
              </button>
            ))}
          </div>
        ) : (
          <div className="x-related-row">
            <button onClick={() => setSort(!sort)}>
              {sort ? "最新" : "相關"}⌄
            </button>
            <button onClick={() => setTab(tab === "轉發" ? "留言" : "轉發")}>
              查看引用 ›
            </button>
          </div>
        )}
        {weibo && (
          <button className="weibo-sort" onClick={() => setSort(!sort)}>
            {sort ? "依時間" : "依熱門程度"}⌄
          </button>
        )}
        {tab === "留言" ? (
          <div className="post-detail-comments">
            {replies.map((c, index) => {
              const split = c.search(/[：:]/),
                hasName = split > 0 && split < 24,
                name = hasName ? c.slice(0, split) : "使用者",
                body = hasName ? c.slice(split + 1) : c;
              return (
                <article key={index} className="post-detail-comment">
                  <Avatar name={name} />
                  <div>
                    <strong>{name}</strong>
                    <p>{body}</p>
                    <div className="post-comment-actions">
                      <button
                        aria-label={"回覆" + name}
                        onClick={() => setTarget(name)}
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        aria-label={"喜歡回覆" + index}
                        onClick={(e) => {
                          e.currentTarget.classList.toggle("liked");
                        }}
                      >
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>
                  <MoreHorizontal size={17} />
                </article>
              );
            })}
            {!replies.length && <p className="post-comments-empty">尚無留言</p>}
          </div>
        ) : (
          <p className="post-comments-empty">
            {tab === "轉發" ? "目前沒有可展開的轉發紀錄" : "目前沒有更多紀錄"}
          </p>
        )}
      </div>
      <form
        className="post-detail-reply"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Avatar name={p.owner || "手機持有人"} />
        <input
          aria-label="回覆貼文"
          placeholder={
            target ? "回覆 @" + target : weibo ? "發表留言" : "發布回覆"
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button aria-label="傳送回覆" disabled={!draft.trim()}>
          <Send size={20} />
        </button>
      </form>
      {!weibo && (
        <nav className="x-detail-bottom">
          {[Home, Search, Circle, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={
                ["返回X 時間軸", "X 搜尋", "X 助理", "X 通知", "X 私訊"][n]
              }
              onClick={p.back}
            >
              <Icon />
            </button>
          ))}
        </nav>
      )}
      {menu && (
        <div className="post-options-menu">
          <button onClick={copy}>
            <Copy size={18} />
            {copied ? "已複製" : "複製文字"}
          </button>
          <button
            onClick={() => {
              setSaved(!saved);
              setMenu(false);
            }}
          >
            <Bookmark size={18} />
            {saved ? "取消收藏" : "收藏"}
          </button>
          <button onClick={() => setMenu(false)}>取消</button>
        </div>
      )}
    </div>
  );
}
