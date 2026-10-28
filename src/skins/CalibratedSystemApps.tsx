import { useEffect, useState } from "react";
import {
  Heart,
  Users,
  Grid2X2,
  Flame,
  Bed,
  Footprints,
  ChevronRight,
  ChevronLeft,
  User,
  Plus,
  MoonStar,
  Sunrise,
  CloudSun,
  Droplet,
  Wind,
  Map,
  List,
  Cloud,
  Activity,
  Search,
} from "lucide-react";
import { useSkinState } from "../skinState";
import type { Item } from "../schema";
import { meta, type Props } from "./shared";
import "../ios/native-apps.css";
const healthTypes = [
  { id: "cycle", title: "經期追蹤", icon: Activity, color: "#7361ff" },
  { id: "activity", title: "健身記錄", icon: Flame, color: "#ff5900" },
  { id: "sleep", title: "睡眠評分", icon: Bed, color: "#7361ff" },
  { id: "steps", title: "步數", icon: Footprints, color: "#ff5900" },
];
function seriesFor(item: Item | undefined) {
  try {
    const values = JSON.parse(meta(item, "series", "[]"));
    return Array.isArray(values)
      ? values
          .filter((v) => typeof v === "number" && Number.isFinite(v) && v >= 0)
          .slice(0, 30)
      : [];
  } catch {
    return [];
  }
}
function recordFor(items: Item[], key: string) {
  const map: Record<string, string[]> = {
    cycle: ["经期", "月經"],
    activity: ["活動", "健身"],
    sleep: ["睡眠"],
    steps: ["步數"],
  };
  const terms = map[key];
  if (!terms) return undefined;
  return items.find((i) =>
    terms.some((s) => meta(i, "metric", i.title).includes(s)),
  );
}
export function HealthSkin(p: Props) {
  const [tab, setTab] = useSkinState<string>(p, "tab", "摘要"),
    [pins, setPins] = useSkinState<string[]>(
      p,
      "pins",
      p.items.some((i) => recordFor([i], "cycle"))
        ? ["cycle", "activity", "sleep", "steps"]
        : ["activity", "sleep", "steps"],
    );
  const [editing, setEditing] = useState(false),
    [detail, setDetail] = useState(""),
    [profile, setProfile] = useState(false);
  const current = recordFor(p.items, detail);
  const open = (key: string) => {
    const i = recordFor(p.items, key);
    if (i && p.creator) {
      p.onItem(i);
      return;
    }
    if (i?.password) {
      p.onItem(i);
      return;
    }
    if (i) p.onRead(i.id);
    setDetail(key);
  };
  return (
    <div className="catalog-skin native-health calibrated-health">
      <header className="health-native-nav">
        {detail || profile ? (
          <button
            aria-label="返回健康摘要"
            onClick={() => {
              setDetail("");
              setProfile(false);
            }}
          >
            <ChevronLeft />
          </button>
        ) : (
          <span />
        )}
        <strong>
          {detail
            ? healthTypes.find((x) => x.id === detail)?.title
            : profile
              ? "健康詳細資料"
              : tab}
        </strong>
        <button
          aria-label="健康資料"
          onClick={() => (p.creator ? p.onAdd() : setProfile(true))}
        >
          <User size={23} />
        </button>
      </header>
      <div className="health-native-scroll">
        {profile ? (
          <>
            <h1>健康詳細資料</h1>
            <section className="health-profile-empty">
              <User size={45} />
              <h2>{p.owner || "手機持有人"}</h2>
              <p>尚未設定更多資料</p>
            </section>
          </>
        ) : detail ? (
          <>
            <div className="health-periods">
              {["日", "週", "月", "6個月", "年"].map((x) => (
                <button
                  key={x}
                  onClick={(e) => {
                    e.currentTarget.parentElement
                      ?.querySelectorAll("button")
                      .forEach((b) => b.removeAttribute("data-selected"));
                    e.currentTarget.dataset.selected = "true";
                  }}
                >
                  {x}
                </button>
              ))}
            </div>
            <p className="health-detail-value">
              {current ? meta(current, "value", "—") : "無資料"}{" "}
              <small>{current ? meta(current, "unit") : ""}</small>
            </p>
            <div className="health-detail-chart" aria-label="健康記錄圖表">
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    height:
                      seriesFor(current)[i] !== undefined
                        ? `${Math.max(2, (seriesFor(current)[i] / Math.max(...seriesFor(current), 1)) * 100)}%`
                        : "3px",
                  }}
                />
              ))}
            </div>
            <section className="health-detail-description">
              <h2>記錄</h2>
              {current ? (
                <>
                  <p>{current.body}</p>
                  <small>{current.time}</small>
                </>
              ) : (
                <p>暫無資料</p>
              )}
            </section>
          </>
        ) : tab === "摘要" ? (
          <>
            <div className="health-section-title">
              <h2>置頂</h2>
              <button onClick={() => setEditing(!editing)}>
                {editing ? "完成" : "編輯"}
              </button>
            </div>
            {editing && (
              <div className="health-pin-editor">
                {healthTypes.map((t) => (
                  <label key={t.id}>
                    <input
                      type="checkbox"
                      checked={pins.includes(t.id)}
                      onChange={() =>
                        setPins(
                          pins.includes(t.id)
                            ? pins.filter((x) => x !== t.id)
                            : [...pins, t.id],
                        )
                      }
                    />
                    {t.title}
                  </label>
                ))}
              </div>
            )}
            <div className="health-cards">
              {pins.map((id) => {
                const t = healthTypes.find((t) => t.id === id);
                if (!t) return null;
                const i = recordFor(p.items, id);
                const Icon = t.icon;
                return (
                  <button
                    key={id}
                    className={"health-native-card health-card-" + id}
                    onClick={() => open(id)}
                  >
                    <header style={{ color: t.color }}>
                      <Icon size={19} />
                      <strong>{t.title}</strong>
                      <time>{i?.time.slice(5, 10) || ""}</time>
                      <ChevronRight size={18} />
                    </header>
                    {id === "activity" ? (
                      <div className="health-activity-values">
                        {[
                          ["活動", "active", "千卡"],
                          ["鍛鍊", "exercise", "分鐘"],
                          ["站立", "stand", "小時"],
                        ].map(([name, key, unit], n) => (
                          <div
                            key={key}
                            style={{
                              color: ["#ff2d55", "#54c900", "#00b2d9"][n],
                            }}
                          >
                            <small>{name}</small>
                            <p>
                              <b>{i ? meta(i, key, "—") : "—"}</b>
                              <span>{unit}</span>
                            </p>
                          </div>
                        ))}
                        <div className="activity-rings">
                          <i />
                          <i />
                          <i />
                        </div>
                      </div>
                    ) : (
                      <div className="health-card-bottom">
                        <div>
                          <b>
                            {i
                              ? meta(i, "value", i.body || "無資料")
                              : "無資料"}
                          </b>
                          <span>{i ? meta(i, "unit") : ""}</span>
                        </div>
                        {id === "steps" && (
                          <div className="health-spark" aria-hidden="true">
                            {Array.from({ length: 7 }, (_, n) => (
                              <i
                                key={n}
                                style={{
                                  height:
                                    seriesFor(i)[n] !== undefined
                                      ? `${Math.max(3, (seriesFor(i)[n] / Math.max(...seriesFor(i), 1)) * 45)}px`
                                      : "8px",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <button className="health-all-row" onClick={() => setTab("瀏覽")}>
              <Heart color="#ff2d55" />
              顯示所有健康資料
              <ChevronRight />
            </button>
            <h2 className="health-trends-title">趋势</h2>
            <div className="health-trends-empty">
              {p.items.length ? "查看健康資料中的記錄" : "暫無趨勢"}
            </div>
          </>
        ) : tab === "共享" ? (
          <section className="health-sharing">
            <Users size={54} />
            <h2>共享健康資料</h2>
            <p>尚未共享資料</p>
            {p.items
              .filter((i) => i.folder === "共享")
              .map((i) => (
                <button key={i.id} onClick={() => p.onItem(i)}>
                  {i.title}
                </button>
              ))}
          </section>
        ) : (
          <>
            <h1>瀏覽</h1>
            {healthTypes.map((t) => (
              <button
                key={t.id}
                className="health-browse-row"
                onClick={() => open(t.id)}
              >
                <t.icon size={22} color={t.color} />
                {t.title}
                <ChevronRight />
              </button>
            ))}
            {p.items
              .filter((i) => !healthTypes.some((t) => recordFor([i], t.id)))
              .map((i) => (
                <button
                  className="health-browse-row"
                  key={i.id}
                  onClick={() => p.onItem(i)}
                >
                  {i.title}
                  <ChevronRight />
                </button>
              ))}
          </>
        )}
      </div>
      {!detail && !profile && (
        <nav className="health-floating-tabs">
          {[
            [Heart, "摘要"],
            [Users, "共享"],
            [Grid2X2, "瀏覽"],
          ].map(([Icon, label]) => {
            const Glyph = Icon as typeof Heart;
            return (
              <button
                key={String(label)}
                className={tab === label ? "selected" : ""}
                onClick={() => setTab(String(label))}
              >
                <Glyph size={25} />
                <span>{String(label)}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
function listMeta(
  item: Item | undefined,
  key: string,
): {
  time?: string;
  temperature?: string | number;
  low?: string | number;
  high?: string | number;
  label?: string;
  rain?: string | number;
  wind?: string | number;
}[] {
  try {
    const v = JSON.parse(meta(item, key, "[]"));
    return Array.isArray(v)
      ? v
          .filter(
            (x) =>
              x &&
              typeof x === "object" &&
              Object.values(x).every(
                (v) => typeof v === "string" || typeof v === "number",
              ),
          )
          .slice(0, 12)
      : [];
  } catch {
    return [];
  }
}
export function WeatherSkin(p: Props) {
  const [index, setIndex] = useSkinState<number>(p, "city", 0),
    [mode, setMode] = useState("temperature"),
    [sheet, setSheet] = useState(""),
    [query, setQuery] = useState("");
  const [liveWeather, setLiveWeather] = useState<{
    temperature: number; apparent: number; high: number; low: number;
    condition: string; humidity: number; wind: number; rain: number;
    hourly: { time: string; temperature: number; rain: number; wind: number }[];
    daily: { label: string; low: number; high: number }[];
  } | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise&timezone=Asia%2FSeoul&forecast_days=5");
        if (!response.ok) throw new Error("weather request failed");
        const data = await response.json();
        if (!active) return;
        const current = data.current, hourlyData = data.hourly, dailyData = data.daily;
        const conditionFor = (code: number) => code === 0 ? "晴朗" : code <= 3 ? "多雲" : code <= 48 ? "有霧" : code <= 67 ? "雨" : code <= 77 ? "降雪" : code <= 82 ? "陣雨" : code <= 86 ? "陣雪" : "雷雨";
        const hourNow = new Date(current.time).getTime();
        const nearest = hourlyData.time.reduce((best: number, value: string, i: number) => Math.abs(new Date(value).getTime() - hourNow) < Math.abs(new Date(hourlyData.time[best]).getTime() - hourNow) ? i : best, 0);
        const hours = Array.from({ length: 6 }, (_, n) => {
          const i = Math.min(nearest + n, hourlyData.time.length - 1);
          return { time: n === 0 ? "現在" : new Date(hourlyData.time[i]).toLocaleTimeString("zh-TW", { hour: "2-digit", hourCycle: "h23", timeZone: "Asia/Seoul" }) + "時",
            temperature: Math.round(hourlyData.temperature_2m[i]), rain: hourlyData.precipitation_probability?.[i] ?? 0, wind: Math.round(hourlyData.wind_speed_10m[i]) };
        });
        const days = dailyData.time.map((date: string, i: number) => ({
          label: i === 0 ? "今天" : i === 1 ? "明天" : new Date(date + "T12:00:00").toLocaleDateString("zh-TW", { weekday: "short", timeZone: "Asia/Seoul" }),
          low: Math.round(dailyData.temperature_2m_min[i]), high: Math.round(dailyData.temperature_2m_max[i]),
        }));
        setLiveWeather({ temperature: Math.round(current.temperature_2m), apparent: Math.round(current.apparent_temperature),
          high: Math.round(dailyData.temperature_2m_max[0]), low: Math.round(dailyData.temperature_2m_min[0]),
          condition: conditionFor(current.weather_code), humidity: Math.round(current.relative_humidity_2m),
          wind: Math.round(current.wind_speed_10m), rain: Math.round(current.precipitation ?? 0), hourly: hours, daily: days });
      } catch {
        // Keep saved weather content visible if live weather is unavailable.
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const item = p.items[index] || p.items[0],
    hourly = liveWeather?.hourly || listMeta(item, "hourly"),
    daily = liveWeather?.daily || listMeta(item, "daily");
  const read = () => {
    if (item) {
      if (p.creator || item.password) p.onItem(item);
      else p.onRead(item.id);
    }
  };
  return (
    <div className="catalog-skin native-weather calibrated-weather" data-empty={!item && !liveWeather}>
      <div className="weather-stars" aria-hidden="true" />
      <div className="weather-native-scroll">
        <section className="weather-native-current">
          <small>首爾 · 即時天氣</small><h1>首爾</h1>
          <output>{liveWeather?.temperature ?? meta(item, "temperature", "—")}°</output>
          <div className="weather-high-low"><span>最高 {liveWeather?.high ?? meta(item, "high", "—")}°</span><span>最低 {liveWeather?.low ?? meta(item, "low", "—")}°</span></div>
          <p>{liveWeather?.condition ?? meta(item, "condition", "正在取得首爾天氣…")}</p>
          <MoonStar className="weather-moon-art" size={55} />
        </section>
        <button className="weather-native-card weather-air-quality" onClick={() => { read(); setSheet("空氣品質"); }}>
          <strong>{liveWeather ? `濕度 ${liveWeather.humidity}% · 風速 ${liveWeather.wind} km/h` : `${meta(item, "aqi", "—")} · ${meta(item, "aqiLabel", "空氣品質")}`}</strong>
          <div className="weather-aqi-scale"><i style={{ left: "30%" }} /></div>
          <p>{liveWeather ? `體感溫度 ${liveWeather.apparent}°C · 降水量 ${liveWeather.rain} mm` : item?.meta.aqi ? `當前 AQI (CN) 為 ${item.meta.aqi}。` : "暫無空氣品質資料"}</p>
        </button>
        <section className="weather-native-card weather-hourly">
          <header><div><strong>天氣狀況</strong><small>{mode === "temperature" ? "氣溫 (°C)" : mode === "rain" ? "降雨機率" : "風速"}</small></div>
            <div className="weather-mode-switch">{[[Cloud, "temperature"], [Droplet, "rain"], [Wind, "wind"]].map(([Icon, key]) => { const Glyph = Icon as typeof Cloud; return <button aria-label={String(key)} aria-pressed={mode === key} key={String(key)} onClick={() => setMode(String(key))}><Glyph size={18} /></button>; })}</div>
          </header>
          <div className="weather-hour-grid">{Array.from({ length: 6 }, (_, n) => (
            <button key={n} onClick={() => { read(); setSheet("逐小時天氣"); }}>
              <strong>{hourly[n]?.time || (n === 0 ? "現在" : "—")}</strong>{n === 5 ? <Sunrise size={28} color="#ffd60a" /> : <MoonStar size={28} />}
              <span>{mode === "temperature" ? (hourly[n]?.temperature ?? "—") + "°" : mode === "rain" ? (hourly[n]?.rain ?? "—") + "%" : (hourly[n]?.wind ?? liveWeather?.wind ?? "—")}</span>
            </button>))}</div>
        </section>
        <section className="weather-native-card weather-days">{(daily.length ? daily : [{ label: "今天", low: liveWeather?.low ?? meta(item, "low", "—"), high: liveWeather?.high ?? meta(item, "high", "—") }]).map((d, n) => (
          <button key={n} onClick={() => { read(); setSheet("每日天氣"); }}><strong>{d.label || "—"}</strong><CloudSun size={23} /><span>{d.low || "—"}°</span><i /><b>{d.high || "—"}°</b></button>))}</section>
      </div>
      <nav className="weather-native-toolbar">
        <button aria-label="天氣地圖" onClick={() => setSheet("天氣地圖")}><Map size={27} /></button>
        <div className="weather-city-dots">{p.items.length ? p.items.map((i, n) => <button aria-label={"切換城市" + i.title} aria-current={n === index ? "true" : undefined} key={i.id} onClick={() => { setIndex(n); p.onRead(i.id); }} />) : <span />}</div>
        <button aria-label="城市列表" onClick={() => setSheet("城市列表")}><List size={29} /></button>
      </nav>
      {sheet && <div className="weather-native-sheet">
        <header><button aria-label="返回天氣" onClick={() => setSheet("")}><ChevronLeft />天氣</button><strong>{sheet}</strong></header>
        {sheet === "城市列表" ? <>
          <label className="weather-city-search"><Search size={18} /><input placeholder="搜尋城市" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          {p.items.filter((i) => i.title.includes(query)).map((i) => <button className="weather-city-row" key={i.id} onClick={() => { setIndex(p.items.indexOf(i)); setSheet(""); p.onRead(i.id); }}><strong>{i.title}</strong><span>{meta(i, "temperature", "—")}°</span></button>)}
          {!p.items.length && <p>目前以首爾即時天氣為主</p>}{p.creator && <button onClick={p.onAdd}><Plus />添加城市</button>}
        </> : sheet === "天氣地圖" ? <div className="weather-map-empty"><Map size={60} /><p>暫無地圖資料</p></div> :
          <div className="weather-section-detail"><h2>首爾</h2><p>{sheet === "空氣品質" ? (liveWeather ? `濕度 ${liveWeather.humidity}% · 風速 ${liveWeather.wind} km/h` : "暫無即時資料") : item?.body || "即時天氣資料每 15 分鐘更新"}</p>{item && <small>{item.time}</small>}</div>}
      </div>}
    </div>
  );
}