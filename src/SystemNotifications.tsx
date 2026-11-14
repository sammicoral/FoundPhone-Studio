import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { AppArtwork } from "./AppArtwork";
import type { Work } from "./schema";
export function notificationContent(
  text: string,
  apps: Work["apps"],
  contacts: Work["data"]["contacts"] = [],
  memberAvatar = "",
) {
  const match = text.match(/^([^|:：]+)(?:\|([^:：]+))?[:：]\s*([\s\S]*)$/);
  const appName = match?.[1] ?? "信息";
  const senderId = match?.[2];
  const contact = senderId
    ? contacts.find((item) => item.id === senderId || item.id === senderId + "-card")
    : undefined;
  const app = apps.find((item) => item.id === appName.toLowerCase() || item.name === appName);
  const avatar = contact?.avatar || (senderId ? memberAvatar : "");
  return {
    title: contact?.title || appName,
    body: match ? match[3] : text,
    appId: app?.id ?? (appName.toLowerCase() === "kakaotalk" ? "kakao" : "messages"),
    avatar,
  };
}
export function SystemNotifications({
  notices,
  apps,
  contacts = [],
  memberAvatar = "",
  onOpen,
  onDismiss,
  compact = false,
}: {
  notices: string[];
  apps: Work["apps"];
  contacts?: Work["data"]["contacts"];
  memberAvatar?: string;
  onOpen: (text: string) => void;
  onDismiss: (index: number) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const entries = notices.map((text, index) => ({ text, index })).reverse();
  const shown = compact && !expanded ? entries.slice(0, 1) : entries;
  return (
    <div
      className={
        "device-notices " +
        (compact && !expanded && notices.length > 1 ? "notice-stacked" : "")
      }
    >
      <div className="notice-cards">
        {shown.map(({ text, index }) => {
          const n = notificationContent(text, apps, contacts, memberAvatar);
          return (
            <motion.div
              layout
              className="device-notice"
              key={text + "::" + index}
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) onDismiss(index);
              }}
            >
              <button className="notice-open" onClick={() => onOpen(text)}>
                <span className="notice-app-art">
                  {n.avatar ? (
                    <img
                      src={n.avatar}
                      alt=""
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <AppArtwork id={n.appId} />
                  )}
                </span>
                <span className="notice-copy">
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                </span>
                <time>現在</time>
              </button>
              {!compact && (
                <button
                  className="notice-remove"
                  aria-label="清除通知"
                  onClick={() => onDismiss(index)}
                >
                  <X size={15} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      {compact && notices.length > 1 && (
        <button
          className="notice-expand"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "收起" : notices.length + " 條通知"}
        </button>
      )}
    </div>
  );
}
