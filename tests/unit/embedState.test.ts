import { describe, it, expect } from "../bun-test";
import {
  chooseProjectViaHost,
  currentProjectRef,
  isEmbedded,
  pageEffectOn,
  setCurrentProjectRef,
  setEmbedOptions,
} from "@/embed/state";

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

  it("hands New Project and Open Project to the host's picker, and says when there is none", () => {
    expect(chooseProjectViaHost("new")).toBe(false);
    const intents: string[] = [];
    setEmbedOptions({ assetBaseUrl: "/", host: { chooseProject: (intent) => void intents.push(intent) } });
    expect(chooseProjectViaHost("open")).toBe(true);
    expect(chooseProjectViaHost("new")).toBe(true);
    expect(intents).toEqual(["open", "new"]);
    setEmbedOptions(null);
  });

  it("keeps the open project's ref as the host named it, and forgets it on the next mount", () => {
    setEmbedOptions({ assetBaseUrl: "/" });
    setCurrentProjectRef({ key: "ember:000639:sub-01/a.slp" });
    expect(currentProjectRef()).toEqual({ key: "ember:000639:sub-01/a.slp" });
    setEmbedOptions(null);
    expect(currentProjectRef()).toBeUndefined();
  });
});
