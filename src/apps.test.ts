import { describe, it, expect } from "vitest";
import { createWork, createEmptyWork } from "./demo";
import { validateWork } from "./schema";
import {
  essentialApps,
  installApp,
  removeFromHome,
  uninstallApp,
  moveApp,
  newCustomApp,
} from "./apps";
describe("optional app lifecycle", () => {
  it("starts newly authored projects without seeded optional content or story", () => {
    const w = createEmptyWork();
    expect(w.nodes).toEqual([]);
    expect(Object.keys(w.data).sort()).toEqual([...essentialApps].sort());
    expect(Object.values(w.data).every((items) => items.length === 0)).toBe(
      true,
    );
  });
  it("installs only six necessary system apps in new works", () => {
    const w = createWork();
    expect(
      w.apps
        .filter((a) => a.installed)
        .map((a) => a.id)
        .sort(),
    ).toEqual([...essentialApps].sort());
    expect(w.apps).toHaveLength(36);
  });
  it("upgrades old format v1 app records without uninstalling existing apps", () => {
    const old = createWork();
    const raw = JSON.parse(JSON.stringify(old));
    for (const a of raw.apps) delete a.installed;
    expect(validateWork(raw).apps.every((a) => a.installed)).toBe(true);
  });
  it("distinguishes home removal from uninstall and keeps content on request", () => {
    const w = createWork();
    installApp(w, "whatsapp");
    const data = structuredClone(w.data.whatsapp);
    removeFromHome(w, "whatsapp");
    expect(w.apps.find((a) => a.id === "whatsapp")).toMatchObject({
      installed: true,
      visible: false,
    });
    expect(w.data.whatsapp).toEqual(data);
    uninstallApp(w, "whatsapp", true);
    expect(w.apps.find((a) => a.id === "whatsapp")?.installed).toBe(false);
    installApp(w, "whatsapp");
    expect(w.apps.find((a) => a.id === "whatsapp")).toMatchObject({
      installed: true,
      visible: true,
    });
    expect(w.data.whatsapp).toEqual(data);
  });
  it("deletes app data only when selected and reinstall starts empty", () => {
    const w = createWork();
    installApp(w, "whatsapp");
    uninstallApp(w, "whatsapp", false);
    expect(w.data.whatsapp).toBeUndefined();
    installApp(w, "whatsapp");
    expect(w.data.whatsapp).toEqual([]);
  });
  it("preserves icon, name, folders, order and install state on roundtrip", () => {
    const w = createWork();
    installApp(w, "whatsapp");
    const a = w.apps.find((a) => a.id === "whatsapp")!;
    a.name = "私人訊息";
    a.icon = "信";
    a.folder = "社交";
    moveApp(w, "whatsapp", "phone");
    uninstallApp(w, "instagram", true);
    const copy = validateWork(JSON.parse(JSON.stringify(w)));
    expect(copy).toEqual(w);
    expect(copy.apps[0].id).toBe("whatsapp");
    expect(copy.apps.find((a) => a.id === "instagram")?.installed).toBe(false);
  });
  it("blocks installation of removed apps", () => {
    const w = createWork();
    installApp(w, "wechat");
    expect(w.apps.some((a) => a.id === "wechat")).toBe(false);
    expect(w.data.wechat).toBeUndefined();
  });
  it("retains custom app identity across uninstall and reinstall", () => {
    const w = createWork();
    const id = newCustomApp(w, "调查");
    uninstallApp(w, id, true);
    installApp(w, id);
    expect(w.apps.find((a) => a.id === id)?.name).toBe("调查");
  });
});
