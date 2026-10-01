# M426

A Pokemon browser extension built with WXT and React.

## Prerequisites

- Docker with Docker Compose

## Getting started

```
cp .env.example .env
```

Set `CHROMIUM=true` in `.env` to run the Chrome/Brave dev server, or leave it unset for Firefox:

```
CHROMIUM=true
```

Start the dev server:

```
docker compose up --build
```

The dev server runs on http://localhost:3000.

## Loading the extension

The dev server writes the unpacked extension to `.output/chrome-mv3-dev`.

1. Open the extensions page (brave://extensions or chrome://extensions)
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3-dev` folder

The extension reloads automatically when source files change.

## Project structure

- `entrypoints/` - background, content script, popup
- `public/` - icons and static assets
- `docker/` - dev container setup

## Commands

Run inside the container (`docker compose exec dev sh`):

- `pnpm dev` - start the dev server
- `pnpm compile` - type check
- `pnpm build` - production build for Chrome (`.output/chrome-mv3`)
- `pnpm build:firefox` - production build for Firefox (`.output/firefox-mv2`)
- `pnpm test` - run unit tests
- `pnpm zip` - package the extension for store submission

## CI

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs type check, tests and both builds on every pull request. The Chrome build is uploaded as a downloadable artifact.