// What the rest of the app asks about the page it is embedded in. Everything
// here answers as the standalone app behaves until mountSleapApp sets options,
// so the standalone and desktop apps are unchanged.
import type { HostRef, MountOptions, PageEffects, ProjectIntent, SleapHost } from "./contract";

let options: MountOptions | null = null;
// The open project's ref, as the host last named it (on open, create or save).
let projectRef: HostRef | undefined;

export function setEmbedOptions(next: MountOptions | null): void {
  options = next;
  projectRef = undefined;
}

export function isEmbedded(): boolean {
  return options !== null;
}

export function embedHost(): SleapHost | undefined {
  return options?.host;
}

/** Whether a page-level side effect is on: always for the standalone app, opt-out for a host. */
export function pageEffectOn(effect: keyof PageEffects): boolean {
  return options?.pageEffects?.[effect] !== false;
}

/** Hands New Project… or Open Project… to the host's picker; false when there is none. */
export function chooseProjectViaHost(intent: ProjectIntent): boolean {
  const choose = options?.host?.chooseProject;
  if (!choose) return false;
  choose(intent);
  return true;
}

export function currentProjectRef(): HostRef | undefined {
  return projectRef;
}

export function setCurrentProjectRef(ref: HostRef | undefined): void {
  projectRef = ref;
}
