// The embed contract a host page mounts the app through, as proposed in
// brain-bbqs/ember-sleap (docs/UPSTREAM_PROPOSAL.md, src/lib/sleapContract.ts).
// Only the parts this build implements are here: storage (open, create, save,
// resolveVideo) and the project picker. Model catalogues and host compute come later.

export type FileType = "slp" | "pkg.slp" | "mp4" | "avi" | "h5";

export interface ResolvedFile {
  url: string;
  fileType: FileType;
  /** For display; the URL may say nothing about the file's name. */
  name: string;
}

/** Opaque to the app: the host's own name for where a project lives. */
export interface HostRef {
  key: string;
}

export interface ProjectVideo extends ResolvedFile {
  /** What the project file records for the video, which `resolveVideo` finds again. */
  storedPath: string;
}

export interface NewProjectRequest {
  name: string;
  videos: ProjectVideo[];
  ref?: HostRef;
}

export type OpenRequest = ResolvedFile & { ref?: HostRef };

export type ProjectIntent = "new" | "open";

export interface SleapHost {
  /** New Project… and Open Project… go to the host's picker, which answers through `create` or `open`. */
  chooseProject?(intent: ProjectIntent): void;
  /** Save and Save As hand the project's bytes to the host, which says where it now lives. */
  save?(file: Blob, name: string, ref?: HostRef): Promise<HostRef>;
  /** Finds a video an opened project records by a path the browser cannot open. */
  resolveVideo?(storedPath: string, project?: HostRef): Promise<ResolvedFile | null>;
  refreshUrl?(file: ResolvedFile): Promise<ResolvedFile>;
}

export interface PageEffects {
  title?: boolean;
  beforeUnload?: boolean;
  urlParams?: boolean;
  debugGlobal?: boolean;
}

export interface MountOptions {
  /** Where the host serves this package's public files (h5wasm, decoders, templates). */
  assetBaseUrl: string;
  compute?: { builtIn: boolean };
  pageEffects?: PageEffects;
  host?: SleapHost;
}

export interface SleapAppHandle {
  open(file: OpenRequest): Promise<void>;
  create(request: NewProjectRequest): Promise<void>;
  isDirty(): boolean;
  unmount(): void;
}
