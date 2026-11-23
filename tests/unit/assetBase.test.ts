import { describe, it, expect } from "../bun-test";
import { h5wasmUrl, publicAssetUrl, setAssetBaseUrl } from "@/lib/assetBase";

// One module instance per file (bun test --isolate), so these run in order against the same state:
// the standalone default first, then an embedding host's base.
describe("assetBase", () => {
  it("serves h5wasm from the page's origin, as the standalone app always has, until a host says otherwise", () => {
    expect(h5wasmUrl()).toBe(`${location.origin}/h5wasm/h5wasm.js`);
  });

  it("resolves every public file under the embedding host's assetBaseUrl once it is set", () => {
    setAssetBaseUrl("https://host.example/lab/sleap-app");
    expect(publicAssetUrl("icon.png")).toBe("https://host.example/lab/sleap-app/icon.png");
    expect(publicAssetUrl("decoders/libav-h264")).toBe("https://host.example/lab/sleap-app/decoders/libav-h264");
    expect(h5wasmUrl()).toBe("https://host.example/lab/sleap-app/h5wasm/h5wasm.js");
  });
});
