import { useRef, useState, type ComponentType } from "react";
import {
  Plane,
  Wifi,
  Bluetooth,
  Signal,
  Battery,
  Settings,
  Accessibility,
  Image,
  Bell,
  Volume2,
  Moon,
  Shield,
  ChevronRight,
  Search,
  Check,
  Link,
  Globe,
  Mic,
  LockKeyhole,
  Delete,
  Upload,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import type { Work, Item, UiValue } from "../schema";
import { IOSToggle } from "../vendor/konsta/Toggle";
import { NavigationPage, useNavigation } from "./Navigation";
type Row = [ComponentType<{ size?: number }>, string, string];
const groups: Row[][] = [
  [
    [Plane, "飛航模式", "#ff9500"],
    [Wifi, "Wi-Fi", "#007aff"],
    [Bluetooth, "藍牙", "#007aff"],
    [Signal, "行動網路", "#34c759"],
    [Link, "個人熱點", "#65ce88"],
    [Battery, "電池", "#34c759"],
    [Globe, "VPN", "#007aff"],
  ],
  [
    [Settings, "一般", "#8e8e93"],
    [Accessibility, "輔助使用", "#007aff"],
    [Image, "壁紙", "#32ade6"],
  ],
  [
    [Bell, "通知", "#ff3b30"],
    [Volume2, "聲音與觸覺回饋", "#ff2d55"],
    [Moon, "專注模式", "#5856d6"],
    [Shield, "Face ID 與密碼", "#34c759"],
  ],
];
export function NativeSettings({
  work,
  items,
  creator,
  onItem,
  onSettings,
  ui,
  onUi,
}: {
  work: Work;
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onSettings?: () => void;
  ui?: Record<string, UiValue>;
  onUi?: (key: string, value: UiValue) => void;
}) {
  const nav = useNavigation(),
    [query, setQuery] = useState(""),
    [airplane, setAirplane] = useState(false),
    [wifi, setWifi] = useState(true),
    [bluetooth, setBluetooth] = useState(true),
    [lowPower, setLowPower] = useState(false),
    [newPasscode, setNewPasscode] = useState(""),
    [confirmPasscode, setConfirmPasscode] = useState(""),
    [passcodeMessage, setPasscodeMessage] = useState(""),
    [passcodeStep, setPasscodeStep] = useState("menu"),
    [passcodeMode, setPasscodeMode] = useState("4"),
    [wallpaperPreview, setWallpaperPreview] = useState(""),
    [cropX, setCropX] = useState(50),
    [cropY, setCropY] = useState(50),
    [cropZoom, setCropZoom] = useState(1),
    [wallpaperMessage, setWallpaperMessage] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const currentWallpaper = String(ui?.wallpaperImage ?? "");
  const configuredPasscode = String(ui?.passcode ?? work.phone.passcode ?? "");
  const saveCroppedWallpaper = () => {
    if (!wallpaperPreview) return;
    const image = new window.Image();
    image.onload = () => {
      const width = 393, height = 852;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * cropZoom;
      const drawWidth = image.naturalWidth * scale, drawHeight = image.naturalHeight * scale;
      const sx = (drawWidth - width) * cropX / 100, sy = (drawHeight - height) * cropY / 100;
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) { setWallpaperMessage("無法處理圖片，請換一張試試。"); return; }
      context.drawImage(image, -sx, -sy, drawWidth, drawHeight);
      onUi?.("wallpaperImage", canvas.toDataURL("image/jpeg", 0.84));
      setWallpaperPreview(""); setWallpaperMessage("已套用新壁紙。");
    };
    image.onerror = () => setWallpaperMessage("圖片讀取失敗，請重新選擇。");
    image.src = wallpaperPreview;
  };
  const enterPasscodeDigit = (digit: string) => {
    if (passcodeStep === "enter") {
      const max = passcodeMode === "4" ? 4 : passcodeMode === "6" ? 6 : 12;
      setNewPasscode((value) => (value + digit).slice(0, max));
    } else {
      const next = (confirmPasscode + digit).slice(0, newPasscode.length);
      setConfirmPasscode(next);
      if (next.length === newPasscode.length) {
        if (next === newPasscode) {
          onUi?.("passcode", next); setPasscodeMessage("已設定螢幕解鎖密碼。");
          setPasscodeStep("menu"); setNewPasscode(""); setConfirmPasscode("");
        } else { setPasscodeMessage("密碼不一致，請重新輸入。"); setConfirmPasscode(""); }
      }
    }
  };
  const row = (label: string, value?: string, click?: () => void) => (
    <button key={label} className="settings-native-row" onClick={click}>
      <span>{label}</span>
      <span className="settings-detail-value">{value}</span>
      {click && <ChevronRight size={16} />}
    </button>
  );
  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => (
    <div className="settings-native-row">
      <span>{label}</span>
      <IOSToggle label={label} checked={value} onChange={set} />
    </div>
  );
  const sub = () => {
    switch (nav.page) {
      case "一般":
        return (
          <div className="settings-group">
            {row("關於本機", "", () => nav.push("關於本機"))}
            {row("軟體更新", "iOS 18.0", () => nav.push("軟體更新"))}
            {row("iPhone 儲存空間", "", () => nav.push("iPhone 儲存空間"))}
            {row("日期與時間", "", () => nav.push("日期與時間"))}
            {row("語言與地區", "繁體中文", () => nav.push("語言與地區"))}
          </div>
        );
      case "關於本機":
        return (
          <div className="settings-group">
            {row("名稱", work.phone.owner + "的 iPhone")}
            {row("iOS 版本", "18.0")}
            {row("機型名稱", "iPhone 15 Pro")}
            {row("照片", String(work.data.photos?.length || 0))}
            {row(
              "App",
              String(work.apps.filter((a) => a.installed).length),
            )}
          </div>
        );
      case "Wi-Fi":
        return (
          <>
            <div className="settings-group">
              {toggle("Wi-Fi", wifi, setWifi)}
            </div>
            {wifi && (
              <>
                <p className="settings-section-label">我的網絡</p>
                <div className="settings-group">
                  <div className="settings-native-row">
                    <Check size={18} color="#007aff" />
                    <span>{work.phone.network}</span>
                    <Wifi size={18} />
                  </div>
                </div>
                <p className="settings-page-caption">
                  連接狀態僅用於作品中的虛擬手機。
                </p>
              </>
            )}
          </>
        );
      case "藍牙":
        return (
          <>
            <div className="settings-group">
              {toggle("藍牙", bluetooth, setBluetooth)}
            </div>
            <p className="settings-page-caption">
              {bluetooth ? "我的裝置" : "藍牙已關閉"}
            </p>
          </>
        );
      case "電池":
        return (
          <>
            <div className="settings-group">
              {row("電池電量", work.phone.battery + "%")}
              {toggle("低電量模式", lowPower, setLowPower)}
            </div>
            <p className="settings-page-caption">
              低電量模式僅改變虛擬裝置狀態。
            </p>
          </>
        );
      case "日期與時間":
        return (
          <div className="settings-group">
            {row("日期", work.phone.date || "2026-09-01")}
            {row("時間", work.phone.time)}
            {row("時區", "中國標準時間")}
          </div>
        );
      case "iPhone 儲存空間":
        return (
          <div className="settings-group">
            {work.apps
              .filter((a) => a.installed)
              .map((a) => row(a.name, `${work.data[a.id]?.length || 0} 項`))}
          </div>
        );
      case "軟體更新":
        return (
          <p className="settings-page-caption">
            iOS 18.0 · 此為作品中的虛擬系統，不下載系統更新。
          </p>
        );
      case "Face ID 與密碼":
        return (
          <div className="passcode-settings">
            {passcodeStep === "menu" ? (
              <>
                <div className="passcode-hero"><span><LockKeyhole size={34} /></span><h2>Face ID 與密碼</h2><p>使用密碼解鎖 iPhone，並保護你的資料。</p></div>
                <div className="settings-group">
                  <div className="settings-native-row"><span>密碼</span><small>{configuredPasscode ? "已開啟" : "已關閉"}</small></div>
                  <button className="settings-native-row" onClick={() => { setPasscodeMode("4"); setNewPasscode(""); setConfirmPasscode(""); setPasscodeMessage(""); setPasscodeStep("enter"); }}><span>{configuredPasscode ? "更改密碼" : "開啟密碼"}</span><ChevronRight size={16} /></button>
                  {configuredPasscode && <button className="settings-native-row passcode-danger" onClick={() => { onUi?.("passcode", ""); setPasscodeMessage("已關閉螢幕解鎖密碼。"); }}><span>關閉密碼</span><ChevronRight size={16} /></button>}
                </div>
                <p className="settings-page-caption">密碼設定會套用至這支虛擬 iPhone 的鎖定畫面。</p>
                {passcodeMessage && <p className="settings-page-caption" role="status">{passcodeMessage}</p>}
              </>
            ) : (
              <div className="passcode-setup">
                <div className="passcode-setup-icon"><LockKeyhole size={28} /></div>
                <h2>{passcodeStep === "enter" ? "輸入新的密碼" : "再次輸入新的密碼"}</h2>
                <p>{passcodeStep === "enter" ? "設定用來解鎖此 iPhone 的數字密碼。" : "再次輸入密碼以確認。"}</p>
                {passcodeStep === "enter" && <div className="passcode-options">
                  <button className={passcodeMode === "4" ? "selected" : ""} onClick={() => { setPasscodeMode("4"); setNewPasscode(""); }}>4 位數密碼</button>
                  <button className={passcodeMode === "6" ? "selected" : ""} onClick={() => { setPasscodeMode("6"); setNewPasscode(""); }}>6 位數密碼</button>
                  <button className={passcodeMode === "custom" ? "selected" : ""} onClick={() => { setPasscodeMode("custom"); setNewPasscode(""); }}>自訂數字密碼</button>
                </div>}
                <div className="passcode-dots settings-passcode-dots">{Array.from({length: passcodeStep === "confirm" ? newPasscode.length : passcodeMode === "4" ? 4 : passcodeMode === "6" ? 6 : Math.max(4,newPasscode.length)}, (_, i) => <i key={i} className={i < (passcodeStep === "enter" ? newPasscode.length : confirmPasscode.length) ? "filled" : ""} />)}</div>
                <div className="settings-pin-keypad">
                  {["1","2","3","4","5","6","7","8","9","back","0","next"].map(key => key === "back" ? <button key={key} aria-label="刪除一位" onClick={() => passcodeStep === "enter" ? setNewPasscode(v => v.slice(0,-1)) : setConfirmPasscode(v => v.slice(0,-1))}><Delete size={20}/></button> : key === "next" ? <button key={key} className="pin-next" onClick={() => {
                    if (passcodeStep === "enter") {
                      const required = passcodeMode === "4" ? 4 : passcodeMode === "6" ? 6 : newPasscode.length;
                      if (required < 4 || newPasscode.length !== required) { setPasscodeMessage("請輸入至少 4 位數字密碼。"); return; }
                      setPasscodeMessage(""); setPasscodeStep("confirm"); setConfirmPasscode("");
                    } else { setPasscodeStep("enter"); setNewPasscode(""); setConfirmPasscode(""); setPasscodeMessage("請重新設定密碼。"); }
                  }}>{passcodeStep === "enter" ? "下一步" : "重設"}</button> : <button key={key} onClick={() => enterPasscodeDigit(key)}>{key}</button>)}
                </div>
                {passcodeMessage && <p className="settings-page-caption" role="status">{passcodeMessage}</p>}
                <button className="passcode-cancel" onClick={() => { setPasscodeStep("menu"); setNewPasscode(""); setConfirmPasscode(""); setPasscodeMessage(""); }}>取消</button>
              </div>
            )}
          </div>
        );
      case "壁紙":
        return (
          <div className="wallpaper-settings">
            <p className="settings-page-caption">自訂主畫面與鎖定畫面的壁紙。</p>
            <div className="wallpaper-editor-preview"><div className="wallpaper-editor-phone" style={{backgroundImage: "url(" + (wallpaperPreview || currentWallpaper) + ")"}}>
              {!wallpaperPreview && !currentWallpaper && <div className="wallpaper-default-art"><span/><span/></div>}
              <div className="wallpaper-preview-island" /><div className="wallpaper-preview-clock">9:41</div><div className="wallpaper-preview-dock"><i/><i/><i/><i/></div>
            </div></div>
            <input ref={uploadRef} type="file" accept="image/*" hidden onChange={e => {
              const file = e.target.files?.[0]; if (!file) return;
              if (!file.type.startsWith("image/")) { setWallpaperMessage("請選擇圖片檔案。"); return; }
              if (file.size > 20 * 1024 * 1024) { setWallpaperMessage("圖片請小於 20 MB。"); return; }
              const reader = new FileReader();
              reader.onload = () => { setWallpaperPreview(String(reader.result || "")); setCropX(50); setCropY(50); setCropZoom(1); setWallpaperMessage(""); };
              reader.onerror = () => setWallpaperMessage("讀取圖片失敗，請再試一次。");
              reader.readAsDataURL(file); e.currentTarget.value = "";
            }} />
            <button className="wallpaper-upload" onClick={() => uploadRef.current?.click()}><Upload size={19}/>{currentWallpaper ? "更換照片" : "選擇照片"}</button>
            {wallpaperPreview && <>
              <div className="wallpaper-crop-sample"><img src={wallpaperPreview} alt="裁切預覽" style={{objectPosition: cropX + "% " + cropY + "%", transform: "scale(" + cropZoom + ")", transformOrigin: cropX + "% " + cropY + "%"}} /></div>
              <div className="wallpaper-crop-controls"><h3>調整照片裁切範圍</h3><p>調整位置與縮放，選擇要顯示的區域。</p>
                <label>水平位置 <input type="range" min="0" max="100" value={cropX} onChange={e => setCropX(Number(e.target.value))}/></label>
                <label>垂直位置 <input type="range" min="0" max="100" value={cropY} onChange={e => setCropY(Number(e.target.value))}/></label>
                <label>縮放 <input type="range" min="1" max="2.5" step="0.05" value={cropZoom} onChange={e => setCropZoom(Number(e.target.value))}/></label>
                <div className="wallpaper-actions"><button onClick={() => {setCropX(50);setCropY(50);setCropZoom(1);}}><RotateCcw size={16}/>重設裁切</button><button className="wallpaper-apply" onClick={saveCroppedWallpaper}><CheckCircle2 size={16}/>套用壁紙</button></div>
              </div>
            </>}
            {currentWallpaper && <button className="wallpaper-remove" onClick={() => {onUi?.("wallpaperImage","");setWallpaperMessage("已還原預設壁紙。");}}>移除自訂壁紙</button>}
            {wallpaperMessage && <p className="settings-page-caption" role="status">{wallpaperMessage}</p>}
          </div>
        );
      default:
        return (
          <>
            <div className="settings-group">
              {row(
                nav.page,
                nav.page === "Face ID 與密碼"
                  ? (ui?.passcode ?? work.phone.passcode)
                    ? "已設定密碼"
                    : "未設定密碼"
                  : "",
              )}
            </div>
            {!items.some((i) => i.folder === nav.page) && (
              <p className="settings-page-caption">此作品沒有設定更多選項。</p>
            )}
          </>
        );
    }
  };
  return (
    <div className="native-settings" data-root={!nav.page}>
      <NavigationPage
        page={nav.page}
        back={nav.pop}
        title={nav.depth > 1 ? "一般" : "設定"}
      >
        {nav.page ? (
          sub()
        ) : (
          <>
            <h1>設定</h1>
            {!query && (
              <button
                className="settings-account"
                onClick={() => nav.push(work.phone.owner)}
              >
                <span>{work.phone.owner.slice(0, 1)}</span>
                <div>
                  <strong>{work.phone.owner}</strong>
                  <small>Apple 帳號、iCloud 與更多</small>
                </div>
                <ChevronRight size={17} />
              </button>
            )}
            {groups.map((group, n) => (
              <div className="settings-group" key={n}>
                {group
                  .filter(([, name]) => name.includes(query))
                  .map(([Icon, name, color]) => (
                    <div
                      key={name}
                      className="settings-native-row"
                      role={name === "飛航模式" ? undefined : "button"}
                      tabIndex={name === "飛航模式" ? undefined : 0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") nav.push(name);
                      }}
                      onClick={() => {
                        if (name !== "飛航模式") nav.push(name);
                      }}
                    >
                      <span
                        className="settings-glyph"
                        style={{ background: color }}
                      >
                        <Icon size={21} />
                      </span>
                      <span>{name}</span>
                      {name === "飛航模式" ? (
                        <IOSToggle
                          label="飛航模式"
                          checked={airplane}
                          onChange={setAirplane}
                        />
                      ) : (
                        <>
                          <small>
                            {name === "Wi-Fi"
                              ? wifi
                                ? "未連線"
                                : "關閉"
                              : name === "藍牙"
                                ? bluetooth
                                  ? "打開"
                                  : "關閉"
                                : name === "VPN"
                                  ? "未連線"
                                  : name === "行動網路" || name === "個人熱點"
                                    ? "關閉"
                                    : ""}
                          </small>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </>
        )}
        {items
          .filter(
            (i) =>
              !nav.page || i.folder === nav.page || i.title.includes(nav.page),
          )
          .map((i) => (
            <button className="record-row" key={i.id} onClick={() => onItem(i)}>
              {i.title}
              <ChevronRight size={16} />
            </button>
          ))}
        {creator && (
          <button className="phone-add" onClick={onSettings}>
            編輯系統設定
          </button>
        )}
      </NavigationPage>
      {!nav.page && (
        <label className="settings-search">
          <Search size={23} />
          <input
            aria-label="搜尋設定"
            placeholder="搜尋"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Mic size={22} aria-hidden="true" />
        </label>
      )}
    </div>
  );
}
