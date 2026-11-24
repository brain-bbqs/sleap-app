import { describe, it, expect } from "../bun-test";
import { welcomeBackgroundStyle } from "@/lib/welcomeBackground";

// background.jpg is 2752x1536, with a 546px-tall logo card in its middle.
const LOGO_HEIGHT = 546;
const IMAGE_HEIGHT = 1536;

/** Where the logo card ends up, in screen px, for a layer styled as given. */
function logoSpan(style: ReturnType<typeof welcomeBackgroundStyle>, width: number, height: number) {
  const top = Number(style.top ?? 0);
  const layerHeight = height - top;
  const scale =
    style.backgroundSize === "cover"
      ? Math.max(width / 2752, layerHeight / IMAGE_HEIGHT)
      : Number(String(style.backgroundSize).split(" ")[1].replace("px", "")) / IMAGE_HEIGHT;
  const centre = top + layerHeight / 2;
  return { top: centre - (LOGO_HEIGHT * scale) / 2, bottom: centre + (LOGO_HEIGHT * scale) / 2 };
}

describe("welcomeBackgroundStyle", () => {
  it("is the plain centred cover before a layout is measured", () => {
    const style = welcomeBackgroundStyle("/app/background.jpg");
    expect(style.backgroundImage).toBe("url(/app/background.jpg)");
    expect(style.backgroundSize).toBe("cover");
    expect(style.backgroundPosition).toBe("center");
    expect(style.backgroundRepeat).toBe("no-repeat");
    expect(style.top).toBe(0);
    expect(style.clipPath).toBeUndefined();
  });

  it.each([
    ["no size", { width: 0, height: 0, reserve: 0 }],
    ["no height", { width: 1200, height: 0, reserve: 150 }],
  ])("ignores a layout with %s", (_name, layout) => {
    expect(welcomeBackgroundStyle("/background.jpg", layout)).toEqual(
      welcomeBackgroundStyle("/background.jpg"),
    );
  });

  it("starts the reserved height above the screen and clips that part away", () => {
    const style = welcomeBackgroundStyle("/background.jpg", { width: 1440, height: 840, reserve: 180 });
    expect(style.top).toBe(-180);
    expect(style.clipPath).toBe("inset(180px 0 0 0)");
    expect(style.backgroundSize).toBe("cover");
  });

  it.each([
    [-12, 0, undefined],
    [179.6, -180, "inset(180px 0 0 0)"],
  ])("rounds and floors the reserve (%s)", (reserve, top, clipPath) => {
    const style = welcomeBackgroundStyle("/background.jpg", { width: 1440, height: 840, reserve });
    expect(style.top).toBe(top);
    expect(style.clipPath).toBe(clipPath);
  });

  it.each([
    ["a tall standalone window", 1440, 840, 170],
    ["a 1080p laptop at 125%", 1536, 667, 173],
    ["the same laptop inside a host page", 1536, 487, 207],
    ["a short 720p host page", 1280, 496, 207],
  ])("keeps the logo above the panel in %s", (_name, width, height, reserve) => {
    const style = welcomeBackgroundStyle("/background.jpg", { width, height, reserve });
    const logo = logoSpan(style, width, height);
    expect(logo.top).toBeGreaterThanOrEqual(0);
    expect(logo.bottom).toBeLessThanOrEqual(height - reserve);
  });

  it("shrinks the image below cover only when the logo would not fit", () => {
    const roomy = welcomeBackgroundStyle("/background.jpg", { width: 1440, height: 840, reserve: 170 });
    expect(roomy.backgroundSize).toBe("cover");
    const cramped = welcomeBackgroundStyle("/background.jpg", { width: 1536, height: 487, reserve: 207 });
    // (487 - 207 - 32) / 546 of the image's 2752x1536.
    expect(cramped.backgroundSize).toBe("1250px 698px");
  });

  it("falls back to cover when the panel leaves no room at all", () => {
    const style = welcomeBackgroundStyle("/background.jpg", { width: 800, height: 200, reserve: 220 });
    expect(style.backgroundSize).toBe("cover");
  });
});
