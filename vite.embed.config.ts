// Builds the app as a component a host page mounts (src/embed/index.tsx) rather
// than as a page: `dist-embed/sleap-app.js` exports `mountSleapApp`, beside one
// stylesheet (`sleap-app.css`, which mountSleapApp adds itself), its chunks and
// workers, and public/ (h5wasm, decoders, templates), which the host serves from
// the `assetBaseUrl` it mounts with. Every URL in it is relative, so the folder
// works wherever the host serves it. Same plugins, aliases and Tauri stubs as
// the app (vite.config.ts); only the input and output differ.
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import appConfig from "./vite.config";

export default defineConfig((env) => {
  const base = typeof appConfig === "function" ? appConfig(env) : appConfig;
  const embed: UserConfig = {
    base: "./",
    build: {
      outDir: "dist-embed",
      emptyOutDir: true,
      // One stylesheet for the whole app, so the host page needs no manifest to find it.
      cssCodeSplit: false,
      rollupOptions: {
        input: { "sleap-app": "src/embed/index.tsx" },
        // An app build drops an entry's exports; the host imports mountSleapApp.
        preserveEntrySignatures: "exports-only",
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: (asset) =>
            asset.names?.some((n) => n.endsWith(".css")) ? "sleap-app.css" : "assets/[name]-[hash][extname]",
        },
      },
    },
  };
  return mergeConfig(base as UserConfig, embed);
});
