// Where the app's own public files (public/: h5wasm, video decoders, skeleton
// templates, images) are served from. The standalone app serves them at its own
// base path, as it always has. An embedding host serves them wherever it likes and
// says where through mountSleapApp's `assetBaseUrl` (see src/embed/), so nothing
// here may assume the app owns the page's origin or path.

let embeddedBase: string | null = null;

/** Called by mountSleapApp before the app renders. */
export function setAssetBaseUrl(url: string): void {
  const absolute = new URL(url, document.baseURI).href;
  embeddedBase = absolute.endsWith("/") ? absolute : `${absolute}/`;
}

/** A file from public/, by its path below it (e.g. "icon.png"). */
export function publicAssetUrl(path: string): string {
  return embeddedBase ? `${embeddedBase}${path}` : `${import.meta.env.BASE_URL}${path}`;
}

/**
 * The h5wasm loader sleap-io.js fetches. Absolute, since sleap-io.js hands it to
 * workers whose base URL is not the page's. Undefined outside a browser context.
 */
export function h5wasmUrl(): string | undefined {
  if (typeof location === "undefined") return undefined;
  return embeddedBase ? `${embeddedBase}h5wasm/h5wasm.js` : `${location.origin}/h5wasm/h5wasm.js`;
}
