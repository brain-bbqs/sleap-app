// What the rest of the app asks about the page it is embedded in. Everything
// here answers as the standalone app behaves until mountSleapApp sets options,
// so the standalone and desktop apps are unchanged.
import type { MountOptions, PageEffects } from "./contract";

let options: MountOptions | null = null;

export function setEmbedOptions(next: MountOptions | null): void {
  options = next;
}

export function isEmbedded(): boolean {
  return options !== null;
}

/** Whether a page-level side effect is on: always for the standalone app, opt-out for a host. */
export function pageEffectOn(effect: keyof PageEffects): boolean {
  return options?.pageEffects?.[effect] !== false;
}
