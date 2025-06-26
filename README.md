# Arkadia Web Client Extension

A browser extension that augments the [Arkadia](https://arkadia.rpg.pl/) web client with features such as an embedded map, additional triggers and a configurable options page. The project is organised as a Yarn workspaces monorepo managed with Lerna.

## Packages

| Package    | Description                                                      |
|------------|------------------------------------------------------------------|
| `extension`| Final extension assets (manifest, icons and static files).       |
| `client`   | Content script written in TypeScript and bundled with Webpack.   |
| `map`      | Map iframe script bundled with Browserify.                       |
| `options`  | React based options page built with Vite.                        |
| `scripts`  | Helper scripts for generating data files.                        |
| `sandbox`  | Local development sandbox (not part of the published extension). |
| `data`     | Sample data used by helper scripts.                              |

## Installing dependencies

```bash
yarn install
```

## Building the extension

Run the following command from the repository root:

```bash
yarn build
```

This invokes each workspace build task via Lerna and then packages the `extension` directory into an archive named `arkadia-extension.<timestamp>.zip`.

During development you can rebuild automatically on changes:

```bash
yarn watch
```

You can also execute scripts for a single workspace, for example:

```bash
yarn workspace client build
```

## Running the sandbox

The sandbox is a separate React application useful for local testing. Run it with:

```bash
cd sandbox
yarn install
yarn dev
```

Then open `http://localhost:5173` in your browser to try out features without packaging the extension.

## License

MIT
