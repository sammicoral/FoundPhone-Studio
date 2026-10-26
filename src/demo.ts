import { makeItem, uid, type Work } from "./schema";
import { registry } from "./registry";
export function createWork(title = "雨停之前"): Work {
  const w: Work = {
    formatVersion: 1,
    id: uid(),
    title,
    description:
      "一部遗落在末班地铁上的手机，一條未送达的消息。\n在雨停之前，找到那個沒有赴约的人。",
    category: "悬疑 · 治愈",
    cover: "",
    updatedAt: Date.now(),
    phone: {
      owner: "林知夏",
      passcode: "",
      wallpaper: "sage",
      theme: "light",
      time: "09:41",
      battery: 86,
      network: "5G",
      notifications: true,
    },
    apps: registry.map((a) => ({
      id: a.id,
      name: a.name,
      installed: [
        "appstore",
        "phone",
        "messages",
        "photos",
        "notes",
        "safari",
        "settings",
      ].includes(a.id),
      visible: true,
      dock: ["phone", "messages", "safari", "music"].includes(a.id),
      folder:
        ![
          "appstore",
          "wechat",
          "photos",
          "notes",
          "instagram",
          "whatsapp",
          "mail",
          "calendar",
          "settings",
          "camera",
          "alipay",
          "taobao",
        ].includes(a.id) &&
        !["phone", "messages", "safari", "music"].includes(a.id)
          ? "更多應用"
          : "",
      icon: "",
    })),
    data: {},
    variables: { found: false },
    nodes: [],
    mode: "mixed",
  };
  for (const a of registry)
    w.data[a.id] = [
      makeItem({
        id: `${a.id}-first`,
        title:
          a.engine === "messaging"
            ? "小林"
            : a.engine === "media"
              ? "雨後的城市"
              : a.engine === "social"
                ? "等一场雨停"
                : "九月的某一天",
        body:
          a.engine === "messaging"
            ? "你捡到這部手机了吗？\n別着急，線索就在備忘錄裡。"
            : a.engine === "records"
              ? "2026 年 9 月 1 日 · 城南舊書店\n這是故事裡的一條虚构記錄。"
              : "那天的雨下得很大，我們约好在舊書店見面。\n可是，有人一直沒有出現。",
        kind:
          a.engine === "social"
            ? "post"
            : a.engine === "document"
              ? "note"
              : "text",
        folder: a.tabs[0],
      }),
    ];
  w.data.wechat = [
    makeItem({
      id: "wx1",
      title: "小林",
      sender: "小林",
      body: "知夏，你的手机是不是落在地铁上了？",
      time: "2026-09-01 08:30",
    }),
    makeItem({
      id: "wx2",
      title: "小林",
      sender: "我",
      body: "如果有人捡到，請幫我看看備忘錄。",
      outgoing: true,
      time: "2026-09-01 08:32",
    }),
    makeItem({
      id: "wx3",
      title: "小林",
      sender: "小林",
      body: "還有一张照片。它比你想象的更重要。",
      time: "2026-09-01 08:34",
    }),
  ];
  w.data.notes = [
    makeItem({
      id: "note-clue",
      title: "如果我忘記了",
      body: "9 月 1 日，16:30。城南舊書店。\n帶上那张綠色的車票。\n\n看到這段文字，就说明你已经找到第一個線索。",
      kind: "note",
      folder: "私人笔記",
    }),
    makeItem({
      id: "note-locked",
      title: "给未來的自己",
      body: "請記住，無論多晚，總有人在等你。",
      password: "0901",
      kind: "note",
      folder: "私人笔記",
    }),
  ];
  w.data.photos = [
    makeItem({
      id: "photo-ticket",
      title: "一张舊車票",
      body: "開往城南的最後一班車。背面寫着：記得赴约。",
      kind: "image",
      hidden: true,
    }),
    makeItem({
      id: "photo-rain",
      title: "窗外的雨",
      body: "2026 年 9 月 1 日 · 城南",
      kind: "image",
    }),
  ];
  w.data.instagram = [
    makeItem({
      id: "ig1",
      sender: "lin.zhixia",
      title: "慢一點，也沒關係。",
      body: "雨天适合散步，和等待一個很久沒見的人。\n#城市漫游 #九月",
      kind: "post",
      likes: 128,
    }),
  ];
  w.nodes = [
    {
      id: "start",
      label: "一部被遗落的手机",
      type: "start",
      event: "start",
      target: "",
      conditions: [],
      logic: "and",
      actions: [
        {
          type: "notification",
          key: "",
          value: "小林：如果你捡到手机，請查看備忘錄。",
        },
      ],
      next: [],
      once: true,
      x: 40,
      y: 50,
    },
    {
      id: "clue",
      label: "讀到约定 · 發現車票",
      type: "event",
      event: "read",
      target: "note-clue",
      conditions: [],
      logic: "and",
      actions: [
        { type: "clue", key: "ticket", value: true },
        { type: "unlock", key: "photo-ticket", value: true },
        {
          type: "notification",
          key: "",
          value: "相册中似乎出現了一张新的照片。",
        },
      ],
      next: ["decision"],
      once: true,
      x: 340,
      y: 50,
    },
    {
      id: "decision",
      label: "是否前往舊書店？",
      type: "choice",
      event: "",
      target: "",
      conditions: [],
      logic: "and",
      actions: [],
      next: ["good", "quiet"],
      once: true,
      x: 640,
      y: 50,
    },
    {
      id: "good",
      label: "赴约 · 雨停了",
      type: "ending",
      event: "",
      target: "",
      conditions: [],
      logic: "and",
      actions: [
        {
          type: "ending",
          key: "",
          value:
            "雨停了。你把手机交给舊書店門口等待的人，也替一個陌生人守住了约定。",
        },
      ],
      next: [],
      once: true,
      x: 940,
      y: 0,
    },
    {
      id: "quiet",
      label: "等待 · 另一種溫柔",
      type: "ending",
      event: "",
      target: "",
      conditions: [],
      logic: "and",
      actions: [
        {
          type: "ending",
          key: "",
          value: "你留在失物招领處。天黑之前，手机的主人终於找到了你。",
        },
      ],
      next: [],
      once: true,
      x: 940,
      y: 180,
    },
  ];
  return w;
}
export function createEmptyWork(): Work {
  const w = createWork("未命名作品");
  w.description = "";
  w.category = "未分類";
  w.phone.owner = "机主";
  w.nodes = [];
  w.variables = {};
  w.data = {};
  for (const a of w.apps) if (a.installed) w.data[a.id] = [];
  return w;
}
