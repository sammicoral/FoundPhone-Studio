import { describe, it, expect } from "vitest";
import { registry } from "./registry";
import { catalogSkins } from "./skins/catalog";
import { makeItem, validateWork } from "./schema";
import { createWork } from "./demo";
describe("independent app coverage and authored attributes", () => {
  it("routes all remaining built-in app identities through dedicated screens or legacy fallbacks", () => {
    const previous = [
      "wechat",
      "whatsapp",
      "instagram",
      "calculator",
      "settings", "appstore",
    ];
    expect(Object.keys(catalogSkins)).toHaveLength(37);
    for (const app of registry)
      expect(previous.includes(app.id) || app.id in catalogSkins).toBe(true);
  });
  it("defaults new metadata safely when reading legacy item records", () => {
    const w = JSON.parse(JSON.stringify(createWork()));
    for (const items of Object.values(w.data) as Record<string, unknown>[][])
      for (const i of items) { delete i.meta; delete i.avatar; }
    expect(validateWork(w).data.notes[0].meta).toEqual({});
    expect(validateWork(w).data.whatsapp[0].avatar).toBe("");
  });
  it("removes retired app data when validating legacy works", () => {
    const w = createWork();
    w.data.wechat = [makeItem({ title: "legacy" })];
    w.data.alipay = [makeItem({ title: "legacy" })];
    const copy = validateWork(JSON.parse(JSON.stringify(w)));
    expect(copy.data.wechat).toBeUndefined();
    expect(copy.data.alipay).toBeUndefined();
    expect(copy.apps.some((app) => app.id === "wechat")).toBe(false);
    expect(copy.apps.some((app) => app.id === "alipay")).toBe(false);
  });
  it("rejects non-string or oversized authored attribute values", () => {
    expect(() =>
      makeItem({ meta: { amount: 42 } as unknown as Record<string, string> }),
    ).toThrow();
    expect(() => makeItem({ meta: { url: "x".repeat(2001) } })).toThrow();
  });
});
