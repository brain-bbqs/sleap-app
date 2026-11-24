# @talmolab/sleap-app (embed build)

Built output only: the SLEAP web app as a component a host page mounts, for
[brain-bbqs/ember-sleap](https://github.com/brain-bbqs/ember-sleap)'s test run of
the embed contract. Not a Talmo Lab release, and nothing here is upstream.

- Source: [brain-bbqs/sleap-app@bc7ff6b](https://github.com/brain-bbqs/sleap-app/commit/bc7ff6b0988a2c969a227466e804c5e876e54827) on `embed/integration`.
- Rebuild: on that branch, `bun install && bun run build:embed`, then replace this branch's files with `dist-embed/` and this package.json, and commit.

`sleap-app.js` exports `mountSleapApp(el, options)`. The host serves this whole
folder and passes its URL as `options.assetBaseUrl`: the app's stylesheet,
workers, h5wasm and video decoders load from there.
