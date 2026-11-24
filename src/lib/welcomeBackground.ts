import type { CSSProperties } from "react";

/** background.jpg's size, and the height of the logo card in its middle (rows 495 to 1041). */
const IMAGE = { width: 2752, height: 1536, logoHeight: 546 };
/** The image's near-black edges, which fill whatever it leaves uncovered when shrunk. */
const EDGE_COLOR = "#05060c";
/** Room kept above and below the logo when it has to shrink to fit. */
const LOGO_MARGIN = 16;

/** The welcome screen's size, and how far the New/Open panel reaches up from its bottom edge. */
export interface WelcomeLayout {
  width: number;
  height: number;
  reserve: number;
}

/**
 * Style for the welcome screen's background layer.
 *
 * The SLEAP logo is baked into the middle of background.jpg, while the
 * New/Open panel is anchored to the bottom of the screen. Centring the image
 * on the whole screen puts the logo under the panel whenever the screen is
 * short for its width (a 1080p laptop at 125% scaling, or a host page's own
 * header and footer around the embedded app), because `cover` then scales the
 * image by width.
 *
 * So the layer starts `reserve` px above the screen and ends at its bottom: the
 * image still covers the whole screen, but its middle, and so the logo, sits in
 * the middle of the space above the panel. The part above the screen is clipped
 * away. When even that leaves too little room, the image shrinks until the logo
 * fits, and the edge colour fills the sides.
 *
 * Without a measured layout (before the first layout, or with no layout at all,
 * as under test) this is the plain centred `cover` the screen always had.
 */
export function welcomeBackgroundStyle(imageUrl: string, layout?: WelcomeLayout): CSSProperties {
  const base: CSSProperties = {
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: EDGE_COLOR,
  };
  if (!layout || layout.width <= 0 || layout.height <= 0) {
    return { ...base, top: 0, backgroundSize: "cover" };
  }
  const above = Math.max(0, Math.round(layout.reserve));
  const cover = Math.max(layout.width / IMAGE.width, (layout.height + above) / IMAGE.height);
  const fit = (layout.height - above - 2 * LOGO_MARGIN) / IMAGE.logoHeight;
  const scale = fit > 0 ? Math.min(cover, fit) : cover;
  return {
    ...base,
    ...(above > 0 ? { top: -above, clipPath: `inset(${above}px 0 0 0)` } : { top: 0 }),
    backgroundSize:
      scale < cover
        ? `${Math.round(IMAGE.width * scale)}px ${Math.round(IMAGE.height * scale)}px`
        : "cover",
  };
}
