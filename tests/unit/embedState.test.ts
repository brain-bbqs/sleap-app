import { describe, it, expect } from "../bun-test";
import { isEmbedded, pageEffectOn, setEmbedOptions } from "@/embed/state";

describe("embed state", () => {
  it("answers as the standalone app until a host mounts the app", () => {
    expect(isEmbedded()).toBe(false);
    expect(pageEffectOn("title")).toBe(true);
    expect(pageEffectOn("beforeUnload")).toBe(true);
    expect(pageEffectOn("urlParams")).toBe(true);
  });

  it("turns off only the page effects the host turns off, until it unmounts", () => {
    setEmbedOptions({ assetBaseUrl: "/", pageEffects: { title: false, urlParams: false } });
    expect(isEmbedded()).toBe(true);
    expect(pageEffectOn("title")).toBe(false);
    expect(pageEffectOn("urlParams")).toBe(false);
    expect(pageEffectOn("beforeUnload")).toBe(true);
    setEmbedOptions(null);
    expect(isEmbedded()).toBe(false);
    expect(pageEffectOn("title")).toBe(true);
  });
});
