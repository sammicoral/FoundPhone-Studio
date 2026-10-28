import { SystemNotifications } from "./SystemNotifications";
import {
  ConnectivityModule,
  SliderModule,
} from "./vendor/ios-web/ControlModules";
import { UnlockHandle } from "./vendor/ios-web/UnlockHandle";
import { useState, useEffect, createContext, useContext } from "react";
import {
  LockKeyhole,
  Flashlight,
  Camera,
  Delete,
  ChevronDown,
  Play,
  SkipForward,
  Moon,
  RotateCcw,
  Monitor,
  Timer,
  Calculator,
  Globe,
  Mic,
  ChevronUp,
  Plus,
  Power,
  Signal,
  House,
  ScanLine,
  Circle,
  Radio,
  Wifi,
  Battery,
  Heart,
  Music2,
  Airplay,
  ChevronRight,
  Lock,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion } from "motion/react";
import type { Work } from "./schema";
export const KeyboardContext = createContext<(open: boolean) => void>(() => {});
export function NativeComposer({
  creator,
  onAdd,
}: {
  creator: boolean;
  onAdd: () => void;
}) {
  const open = useContext(KeyboardContext);
  return (
    <button
      className="native-compose-field"
      aria-label={creator ? "新增訊息" : "輸入訊息"}
      onClick={() => (creator ? onAdd() : open(true))}
    >
      {creator ? "新增訊息" : ""}
    </button>
  );
}
export function DeviceLock({
  work,
  time,
  notices,
  onDismiss,
  pinOpen,
  setPinOpen,
  error,
  onUnlock,
  onCamera,
  onLight,
  passcode,
  wallpaperImage,
}: {
  work: Work;
  time: string;
  notices: string[];
  onDismiss: (index: number) => void;
  pinOpen: boolean;
  setPinOpen: (v: boolean) => void;
  error: string;
  onUnlock: (v: string) => void;
  onCamera: () => void;
  onLight: () => void;
  passcode?: string;
  wallpaperImage?: string;
}) {
  const [code, setCode] = useState("");
  const activePasscode = passcode ?? work.phone.passcode;
  useEffect(() => {
    if (error) setCode("");
  }, [error]);
  useEffect(() => {
    if (!pinOpen) setCode("");
  }, [pinOpen]);
  const digit = (key: string) => {
    const value = key === "⌫" ? code.slice(0, -1) : (code + key).slice(0, 12);
    setCode(value);
    if (
      /^\d+$/.test(activePasscode) &&
      value.length === activePasscode.length
    ) {
      onUnlock(value);
      setCode("");
    }
  };
  const open = () => (activePasscode ? setPinOpen(true) : onUnlock(""));
  return (
    <motion.div
      className={"lock-screen device-lock " + (pinOpen ? "pin-open" : "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: -852, opacity: 0 }}
      transition={{ duration: 0.48, ease: [0.32, 0.72, 0, 1] }}
    >
      {!pinOpen ? (
        <>
          <div className="lock-clock-block">
            <LockKeyhole size={18} />
            <p>
              {new Intl.DateTimeFormat("zh-TW", {
                month: "long",
                day: "numeric",
                weekday: "long",
                timeZone: "UTC",
              }).format(
                new Date((work.phone.date || "2026-09-01") + "T12:00:00Z"),
              )}
            </p>
            <h1>{time}</h1>
          </div>
          <div className="lock-notifications">
            {work.phone.notifications && (
              <SystemNotifications
                compact
                notices={notices}
                apps={work.apps}
                onOpen={open}
                onDismiss={onDismiss}
              />
            )}
          </div>
          <UnlockHandle onUnlock={open} />

          <div className="lock-tools">
            <button onClick={onLight} aria-label="手電筒">
              <Flashlight size={23} />
            </button>
            <button
              onClick={onCamera}
              disabled={
                !work.apps.some((a) => a.installed && a.id === "camera")
              }
              aria-label="相機"
            >
              <Camera size={25} />
            </button>
          </div>
        </>
      ) : (
        <div className="device-passcode">
          <LockKeyhole size={22} />
          <h2>輸入密碼</h2>
          <div
            className={"passcode-dots " + (error ? "pin-shake" : "")}
            aria-label={"已輸入" + code.length + "位密碼"}
          >
            {Array.from({ length: activePasscode.length }, (_, i) => (
              <i key={i} className={i < code.length ? "filled" : ""} />
            ))}
          </div>
          <input
            className={
              /^\d+$/.test(activePasscode)
                ? "accessible-pin"
                : "legacy-passcode"
            }
            aria-label="鎖定畫面密碼"
            autoComplete="off"
            inputMode="numeric"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onUnlock(code)}
          />
          <div className="pin-keypad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].map(
              (n, i) =>
                n ? (
                  <button
                    key={i}
                    aria-label={"密碼按鍵" + n}
                    onClick={() => digit(n)}
                  >
                    <b>{n}</b>
                    <small>
                      {
                        [
                          "",
                          "",
                          "ABC",
                          "DEF",
                          "GHI",
                          "JKL",
                          "MNO",
                          "PQRS",
                          "TUV",
                          "WXYZ",
                        ][Number(n)]
                      }
                    </small>
                  </button>
                ) : (
                  <span key={i} />
                ),
            )}
          </div>
          <span role="status" className="pin-error">
            {error}
          </span>
          {!/^[0-9]+$/.test(activePasscode) && (
            <button onClick={() => onUnlock(code)}>解鎖</button>
          )}
          <div className="pin-footer">
            <button onClick={() => setPinOpen(false)}>取消</button>
            <button
              aria-label="刪除一位密碼"
              onClick={() => (code ? digit("⌫") : setPinOpen(false))}
            >
              {code ? "刪除" : "取消"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
export function ControlCenter({
  battery = 94,
  network,
  close,
  onLock,
  onFullscreen,
  isFullscreen,
}: {
  battery?: number;
  network: string;
  close: () => void;
  onLock: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
}) {
  const [rotation, setRotation] = useState(true),
    [focus, setFocus] = useState(false),
    [playing, setPlaying] = useState(false);
  const [brightness, setBrightness] = useState(50),
    [volume, setVolume] = useState(25);
  const [tool, setTool] = useState("");
  return (
    <motion.div
      className="system-panel device-control"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
    >
      <button className="cc-close" aria-label="鎖定手機" title="鎖定手機" onClick={onLock}>
        <Power />
      </button>
      <button
        className="cc-edit"
        aria-label="控制中心編輯"
        onClick={() => setTool("編輯控制項")}
      >
        <Plus />
      </button>
      <div className="cc-current">
        <span>
          <Airplay size={13} />
        </span>
        控制中心 <ChevronRight size={16} />
      </div>
      <div className="cc-status" aria-label={"行動網路 " + network}>
        <div>
          <span>
            <Signal size={18} />
            OO電信 <Wifi size={17} />
          </span>
        </div>
        <span>
          <Lock size={13} /> {battery}% <Battery size={27} />
        </span>
      </div>
      <nav className="cc-page-rail" aria-label="控制中心分類">
        {[Heart, Music2, House, Radio].map((Icon, i) => (
          <button
            key={i}
            aria-label={["常用控制項", "媒體控制項", "家庭控制項", "連線控制項"][i]}
            onClick={() =>
              document
                .querySelector(
                  [".cc-grid", ".cc-music", ".cc-home", ".cc-connect"][i],
                )
                ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
            }
          >
            <Icon fill={i === 0 ? "currentColor" : "none"} />
          </button>
        ))}
      </nav>
      <div className="cc-grid">
        <ConnectivityModule />
        <div className="cc-music">
          <div className="cc-media-top">
            <span>
              <Music2 size={28} />
            </span>
            <Airplay size={21} />
          </div>
          <div className="cc-media-title">
            <strong>{playing ? "測試播放" : "目前沒有播放內容"}</strong>
            <small>音樂</small>
          </div>
          <div>
            <button aria-label="上一首">
              <SkipForward style={{ transform: "rotate(180deg)" }} />
            </button>
            <button
              aria-label={playing ? "暫停" : "播放"}
              onClick={() => setPlaying(!playing)}
            >
              <Play fill="currentColor" />
            </button>
            <button aria-label="下一首">
              <SkipForward />
            </button>
          </div>
        </div>
        <button
          className={"cc-square " + (rotation ? "cc-white" : "")}
          aria-label="螢幕方向鎖定"
          aria-pressed={rotation}
          onClick={() => setRotation(!rotation)}
        >
          <span className="cc-rotation">
            <RotateCcw />
            <Lock size={14} />
          </span>
        </button>
        <button
          className="cc-square"
          onClick={() => setTool(tool ? "" : "螢幕鏡像輸出")}
          aria-label="螢幕鏡像輸出"
        >
          <Monitor />
        </button>
        <button
          className="cc-square"
          onClick={onFullscreen}
          aria-label={isFullscreen ? "退出全螢幕" : "切換全螢幕"}
          title={isFullscreen ? "退出全螢幕" : "切換全螢幕"}
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </button>
        <SliderModule
          type="brightness"
          value={brightness}
          onChange={setBrightness}
        />
        <SliderModule type="volume" value={volume} onChange={setVolume} />
        <button
          className={"cc-focus " + (focus ? "cc-white" : "")}
          aria-pressed={focus}
          onClick={() => setFocus(!focus)}
        >
          <Moon />
          <span>專注模式</span>
          <ChevronDown size={14} />
        </button>
        <button className="cc-home" onClick={() => setTool("家庭")}>
          <House size={38} />
          <span>尚未設定家庭</span>
        </button>
        {[Flashlight, Timer, Calculator, Camera].map((Icon, i) => (
          <button
            className={"cc-square cc-tool-" + i}
            aria-label={["手電筒", "計時器", "計算機", "相機"][i]}
            key={i}
            onClick={() =>
              setTool(tool ? "" : ["手電筒", "計時器", "計算機", "相機"][i])
            }
          >
            <Icon />
          </button>
        ))}
        {[ScanLine, Circle, Radio].map((Icon, i) => (
          <button
            key={i}
            className={"cc-square cc-bottom-tool cc-bottom-" + i}
            aria-label={["掃描條碼", "螢幕錄影", "聲音辨識"][i]}
            onClick={() => setTool(["掃描條碼", "螢幕錄影", "聲音辨識"][i])}
          >
            <Icon />
          </button>
        ))}
      </div>
      {tool && (
        <div className="cc-tool">
          <strong>{tool}</strong>
          <p>
            {tool === "螢幕鏡像輸出" ? "正在搜尋作品中的裝置…" : "作品內快速控制項"}
          </p>
          <button onClick={() => setTool("")}>完成</button>
        </div>
      )}
      <button className="cc-dismiss" onClick={close}>
        輕掃以關閉
        <ChevronUp size={16} />
      </button>
    </motion.div>
  );
}
export function DeviceKeyboard({ close, target }: { close: () => void; target: HTMLElement | null }) {
  const [mode, setMode] = useState<"zhuyin" | "english" | "numbers">("zhuyin");
  const [shift, setShift] = useState(false);
  const [composition, setComposition] = useState("");
  const currentValue = () => {
    if (!target) return "";
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return target.value;
    return target.textContent || "";
  };
  const insertText = (text: string, replaceLength = 0) => {
    if (!target) return;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? start;
      const value = target.value;
      const next = value.slice(0, start - replaceLength) + text + value.slice(end);
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), "value")?.set;
      setter?.call(target, next);
      target.dispatchEvent(new Event("input", { bubbles: true }));
      const cursor = start - replaceLength + text.length;
      target.setSelectionRange(cursor, cursor);
    } else if (target.isContentEditable) {
      target.textContent = currentValue() + text;
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
    target.focus({ preventScroll: true });
  };
  const candidates: Record<string, string[]> = {
    "ㄋㄧˇ": ["你", "妳", "你好"],
    "ㄨㄛˇ": ["我", "我們"],
    "ㄏㄠˇ": ["好", "很好", "好嗎"],
    "ㄕˋ": ["是", "事", "試"],
    "ㄅㄨˋ": ["不", "部", "步"],
    "ㄧㄡˇ": ["有", "又"],
    "ㄓㄜˋ": ["這", "這個"],
    "ㄎㄜˇ": ["可", "可以"],
    "ㄇㄚ˙": ["嗎", "嘛"],
    "ㄒㄧㄝˋ": ["謝", "謝謝"],
  };
  const suggestions = candidates[composition] || (composition ? [composition, "好", "你"] : ["你好", "謝謝", "可以", "知道了"]);
  const zhuyinRows = ["ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏ", "ㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ", "ㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡ", "ㄢㄣㄤㄥㄦ˙ˊˇˋ"];
  const keyRows = mode === "numbers" ? ["1234567890", "-/:;()&@"] : ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  return (
    <div className="device-keyboard" role="dialog" aria-label="螢幕鍵盤">
      <div className="keyboard-draft">
        <div className="keyboard-target-preview">{currentValue() || "點按下方鍵盤輸入"}</div>
        <button aria-label="收起鍵盤" onClick={close}><ChevronDown /></button>
      </div>
      <div className="keyboard-candidates">
        {mode === "zhuyin" ? (
          <>
            <span className="keyboard-composition">{composition || "注音"}</span>
            {suggestions.map((v) => <button key={v} onClick={() => { insertText(v); setComposition(""); }}>{v}</button>)}
          </>
        ) : (
          ["你好", "謝謝", "可以"].map((v) => <button key={v} onClick={() => insertText(v)}>{v}</button>)
        )}
      </div>
      {mode === "zhuyin" ? zhuyinRows.map((row, i) => (
        <div className="keyboard-row zhuyin-row" key={i}>
          {[...row].map((k) => <button key={k} onClick={() => setComposition(composition + k)}>{k}</button>)}
          {i === zhuyinRows.length - 1 && <button className="key-special" onClick={() => setComposition(composition.slice(0, -1))}><Delete size={18} /></button>}
        </div>
      )) : keyRows.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {[...row].map((k) => <button key={k} onClick={() => insertText(shift ? k.toUpperCase() : k)}>{shift ? k.toUpperCase() : k}</button>)}
          {i === keyRows.length - 1 && <button className="key-special" onClick={() => insertText("", 1)}><Delete size={18} /></button>}
        </div>
      ))}
      <div className="keyboard-row keyboard-bottom">
        <button onClick={() => setMode(mode === "zhuyin" ? "english" : mode === "english" ? "numbers" : "zhuyin")}>{mode === "zhuyin" ? "ABC" : mode === "english" ? "123" : "注音"}</button>
        {mode !== "zhuyin" && <button onClick={() => setShift(!shift)}>⇧</button>}
        <button className="key-space" onClick={() => { insertText(" "); setComposition(""); }}>空格</button>
        <button onClick={() => { setComposition(""); close(); }}>完成</button>
      </div>
      <div className="keyboard-accessories"><Globe size={24} /><small>繁體中文</small><Mic size={23} /></div>
    </div>
  );
}
export { NativeSettings } from "./ios/Settings";
