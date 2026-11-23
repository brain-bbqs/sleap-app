// The app as a component a host page mounts (built by vite.embed.config.ts): the
// whole SLEAP editor in the host's element, with the host owning where projects
// come from and go to. See ./contract.ts for the shape, and ./state.ts for what
// the rest of the app consults. One instance per page: the stores are
// module-level, as in the standalone app.

// Must stay the first import, as in main.tsx (see the file).
import "../lib/localeGuard";
// The app's styles, built into sleap-app.css (see vite.embed.config.ts).
import "../index.css";
import ReactDOM from "react-dom/client";
import { Labels, Skeleton, Video } from "@talmolab/sleap-io.js";
import App from "../App";
import { setAssetBaseUrl } from "../lib/assetBase";
import { loadProjectFromUrl } from "../lib/loadProject";
import { toast } from "../lib/notify";
import { assignVideoBackendFromUrl } from "../lib/resolveVideos";
import { hasUnsavedWork } from "../lib/unsavedGuard";
import { useAppStore } from "../stores/appStore";
import type { FileType, MountOptions, NewProjectRequest, OpenRequest, SleapAppHandle } from "./contract";
import { currentProjectRef, embedHost, setCurrentProjectRef, setEmbedOptions } from "./state";

export type * from "./contract";

/** This build's sleap-app version. */
export const version: string = __APP_VERSION__;

const STYLESHEET = "sleap-app.css";

/** The sleap-io.js backend for a declared video type: the URL itself may have no extension. */
function backendFor(fileType: FileType): "mp4box" | "avi" | undefined {
  if (fileType === "mp4") return "mp4box";
  if (fileType === "avi") return "avi";
  return undefined;
}

/** The app's stylesheet, at the top of the built package the host serves at assetBaseUrl; added once. */
function addStylesheet(assetBaseUrl: string): void {
  if (document.querySelector("link[data-sleap-app]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(STYLESHEET, new URL(assetBaseUrl, document.baseURI)).href;
  link.dataset.sleapApp = "";
  document.head.append(link);
}

/** A video an opened project records by a path the browser cannot open, found through the host. */
async function resolveThroughHost(video: Video): Promise<boolean> {
  const resolveVideo = embedHost()?.resolveVideo;
  if (!resolveVideo) return false;
  const stored = Array.isArray(video.filename) ? video.filename[0] : video.filename;
  if (!stored) return false;
  const found = await resolveVideo(stored, currentProjectRef());
  if (!found) return false;
  return assignVideoBackendFromUrl(video, found.url, { silent: true, backend: backendFor(found.fileType) });
}

/** Back to the start screen: nothing open, nothing unsaved. */
function clearProject(): void {
  useAppStore.setState((state) => {
    state.labels = null;
    state.projectLoaded = false;
    state.hasChanges = false;
    state.pendingExport = false;
    state.filename = null;
    state.projectPath = null;
    state.projectFile = null;
    state.projectFileHandle = null;
    state.labelsDraftPath = null;
  });
}

async function open(file: OpenRequest): Promise<void> {
  setCurrentProjectRef(file.ref);
  // The host asked before handing over a project, so the app does not ask again.
  await loadProjectFromUrl(file.url, { name: file.name, discardConfirmed: true, hostResolve: resolveThroughHost });
}

async function create(request: NewProjectRequest): Promise<void> {
  const store = useAppStore.getState();
  store.setLoading(true, "Opening videos...");
  try {
    // An empty skeleton to start from, as New Project's own dialog does (#138).
    const labels = new Labels({ skeletons: [new Skeleton({ nodes: [], name: "skeleton" })] });
    let unopened = 0;
    for (const source of request.videos) {
      // Recorded by the host's path for it, so the saved project finds it again
      // through resolveVideo; read through the link the host gave.
      const video = new Video({ filename: source.storedPath, openBackend: false });
      const opened = await assignVideoBackendFromUrl(video, source.url, {
        silent: true,
        backend: backendFor(source.fileType),
      });
      if (!opened) unopened++;
      labels.addVideo(video);
    }
    labels.reindex();
    setCurrentProjectRef(request.ref);
    store.setLabels(labels, request.name);
    if (unopened > 0) {
      toast.error(`${unopened} video${unopened > 1 ? "s" : ""} could not be opened`, {
        description: "They stay in the project; their frames show blank until they can be read.",
      });
    }
  } finally {
    store.setLoading(false);
  }
}

let mounted = false;

export function mountSleapApp(el: HTMLElement, options: MountOptions): SleapAppHandle {
  if (mounted) throw new Error("Only one SLEAP app can be mounted on a page.");
  mounted = true;
  setEmbedOptions(options);
  setAssetBaseUrl(options.assetBaseUrl);
  addStylesheet(options.assetBaseUrl.endsWith("/") ? options.assetBaseUrl : `${options.assetBaseUrl}/`);
  const root = ReactDOM.createRoot(el);
  root.render(<App />);
  return {
    open,
    create,
    isDirty: () => hasUnsavedWork(useAppStore.getState()),
    unmount() {
      root.unmount();
      clearProject();
      setEmbedOptions(null);
      mounted = false;
    },
  };
}
