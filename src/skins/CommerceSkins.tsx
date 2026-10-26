import {
  Home,
  MapPin,
  Receipt,
  ShoppingBag,
  Star,
  Ticket,
  Truck,
  Utensils,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  Empty,
  Header,
  Media,
  meta,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
export function AlipaySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "帳單");
  const list =
    tab === "卡包"
      ? items.filter((i) => i.folder === "卡包" || i.folder === "票券")
      : items.filter((i) => !["卡包", "票券"].includes(i.folder));
  return (
    <div className="catalog-skin alipay-ui">
      <Header p={p} />
      <div className="alipay-blue">
        <h2>{tab}</h2>
        <div>
          <button onClick={() => setTab("帳單")}>
            <Receipt size={28} />
            帳單
          </button>
          <button onClick={() => setTab("卡包")}>
            <Ticket size={28} />
            卡包
          </button>
        </div>
        <small>作品內的虛構付款紀錄</small>
      </div>
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {list.map((i) =>
          tab === "卡包" ? (
            <button
              className="alipay-ticket"
              key={i.id}
              onClick={() => p.onItem(i)}
            >
              <Ticket size={23} />
              <div>
                <strong>{i.title}</strong>
                <p>{i.body}</p>
                <small>{i.time}</small>
              </div>
            </button>
          ) : (
            <button
              className="alipay-bill"
              key={i.id}
              onClick={() => p.onItem(i)}
            >
              <Wallet size={27} />
              <div>
                <strong>{i.title}</strong>
                <small>
                  {meta(i, "merchant", i.sender)} · {i.time.slice(5, 16)}
                </small>
              </div>
              <span>
                <strong>{meta(i, "amount", "—")}</strong>
                <small>{meta(i, "status", "帳單紀錄")}</small>
              </span>
            </button>
          ),
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["帳單", "卡包"]}
        value={tab}
        set={setTab}
        icons={[<Receipt />, <Ticket />]}
      />
    </div>
  );
}
export function TaobaoSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "商品");
  const [status, setStatus] = useState("全部");
  const list = items
    .filter((i) =>
      tab === "商品"
        ? i.folder !== "訂單" && i.folder !== "物流"
        : i.folder === tab,
    )
    .filter((i) => status === "全部" || meta(i, "status") === status);
  return (
    <div className="catalog-skin taobao-ui">
      <Header p={p} />
      <div className="taobao-search">
        <SearchBox value={q} set={setQ} placeholder="搜尋商品或訂單" />
      </div>
      <div className="catalog-scroll">
        {tab === "商品" ? (
          <div className="taobao-products">
            {list.map((i) => (
              <button key={i.id} onClick={() => p.onItem(i)}>
                <Media item={i} />
                <strong>{i.title}</strong>
                <p>
                  ¥ <b>{meta(i, "price", "—")}</b>
                </p>
                <small>{i.sender}</small>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="taobao-status">
              {["全部", "待付款", "待出貨", "待收貨", "已完成"].map((s) => (
                <button
                  className={s === status ? "selected" : ""}
                  key={s}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {list.map((i) => (
              <button
                className="taobao-order"
                key={i.id}
                onClick={() => p.onItem(i)}
              >
                <div>
                  <ShoppingBag size={16} />
                  <strong>{i.sender}</strong>
                  <small>{meta(i, "status", "訂單紀錄")}</small>
                </div>
                <section>
                  <Media item={i} />
                  <span>
                    <strong>{i.title}</strong>
                    <p>
                      {tab === "物流" ? meta(i, "tracking", i.body) : i.body}
                    </p>
                    <b>¥ {meta(i, "price", "—")}</b>
                  </span>
                </section>
                <footer>{meta(i, "number", i.time)}</footer>
              </button>
            ))}
          </>
        )}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["商品", "訂單", "物流"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setStatus("全部");
        }}
        icons={[<Home />, <ShoppingBag />, <Truck />]}
      />
    </div>
  );
}
export function DeliverySkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "為你推薦");
  const merchants = items.filter((i) => i.folder !== "訂單");
  const orders = items.filter((i) => i.folder === "訂單");
  const shown = merchants.filter((i) =>
    (i.title + i.body + i.sender).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="catalog-skin delivery-ui uber-eats-ui">
      <header className="uber-header">
        <div className="uber-address">
          <span>外送至</span>
          <strong><MapPin size={15} /> {meta(items[0], "address", "選擇外送地址")}</strong>
        </div>
        <button className="uber-profile" aria-label="帳戶" onClick={() => setTab("帳戶")}>我</button>
      </header>
      <div className="uber-search-wrap">
        <SearchBox value={q} set={setQ} placeholder="搜尋餐廳、料理或商品" />
      </div>
      <div className="uber-scroll catalog-scroll">
        {tab === "帳戶" ? (
          <section className="uber-account">
            <h1>帳戶</h1>
            <button onClick={() => setTab("訂單")}>訂單紀錄 <span>›</span></button>
            <button onClick={() => setTab("為你推薦")}>回到首頁 <span>›</span></button>
            <p>Uber Eats 介面概念預覽</p>
          </section>
        ) : tab === "訂單" ? (
          <>
            <h1 className="uber-section-title">你的訂單</h1>
            {orders.map((i) => (
              <button className="uber-order" key={i.id} onClick={() => p.onItem(i)}>
                <Media item={i} />
                <div><strong>{i.sender || i.title}</strong><p>{i.title}</p><small>{meta(i, "status", "訂單紀錄")} · {i.time}</small></div>
                <span>›</span>
              </button>
            ))}
            <Empty items={orders} />
          </>
        ) : (
          <>
            <div className="uber-welcome">
              <h1>美食，送到你身邊。</h1>
              <p>探索附近的餐廳與人氣料理</p>
            </div>
            <div className="uber-categories">
              {[
                ["🍔", "漢堡"], ["🍜", "麵食"], ["🧋", "飲料"],
                ["🍣", "日式料理"], ["🍕", "披薩"], ["🥗", "健康餐"],
              ].map(([emoji, label]) => (
                <button key={label} onClick={() => { setTab("搜尋"); setQ(label); }}>
                  <span>{emoji}</span><small>{label}</small>
                </button>
              ))}
            </div>
            <div className="uber-promo">
              <div><small>附近人氣美食</small><h2>今天想吃點什麼？</h2><p>挑選喜愛的餐廳，開始探索</p></div>
              <span>EATS</span>
            </div>
            <div className="uber-list-heading">
              <h2>{tab === "搜尋" || q ? "搜尋結果" : "為你推薦"}</h2>
              <button onClick={() => setTab("搜尋")}>查看全部</button>
            </div>
            {shown.map((i) => (
              <button className="uber-merchant" key={i.id} onClick={() => p.onItem(i)}>
                <Media item={i} />
                <div className="uber-merchant-info">
                  <h3>{i.title}</h3>
                  <p><Star size={13} fill="currentColor" /> {meta(i, "rating", "4.8")} <span>·</span> {meta(i, "duration", "20–35 分鐘")}</p>
                  <small>{i.body.split("\\n")[0] || "人氣餐點 · 外送服務"}</small>
                  <footer><span>外送費依地址而定</span><b>{meta(i, "price", "查看菜單")}</b></footer>
                </div>
              </button>
            ))}
            <Empty items={shown} />
          </>
        )}
      </div>
      <Tabs tabs={["為你推薦", "搜尋", "訂單", "帳戶"]} value={tab} set={setTab}
        icons={[<Home />, <MapPin />, <Receipt />, <Users />]} />
    </div>
  );
}
