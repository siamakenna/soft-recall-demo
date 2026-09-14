# itch.io Release

Soft Recall Demo is uploaded to itch.io as an HTML game. The itch build uses relative asset paths so the ZIP can run inside itch.io's browser frame.

## Build Locally

```bash
npm ci
npm run typecheck
npm run test:e2e
npm run build:itch
test -f dist/index.html
```

Create a dated ZIP outside the repository with `index.html` at its root:

```bash
VERSION=$(node -p "require('./package.json').version")
RELEASE_ZIP="$HOME/Downloads/soft-recall-demo-v${VERSION}-itch-$(date +%Y%m%d).zip"
(cd dist && zip -r "$RELEASE_ZIP" .)
unzip -t "$RELEASE_ZIP"
unzip -Z1 "$RELEASE_ZIP"
shasum -a 256 "$RELEASE_ZIP"
```

Upload that ZIP as an HTML project and mark it **This file will be played in the browser**. Use **Click to launch in fullscreen**, enable itch.io's fullscreen button, and leave Mobile friendly, automatic startup, and SharedArrayBuffer support off. Keep the previous upload available locally for rollback until the replacement passes the release check.

The GitHub Pages build uses `/soft-recall-demo/`; do not upload that build to itch.io. Run `npm run build` again before using the normal Pages preview URL after creating an itch package.

## Build in GitHub Actions

Run **Package itch.io Build** from the repository's Actions tab on the release commit. Download the `soft-recall-demo-itch` artifact after it succeeds, extract the Actions wrapper, and upload the versioned game ZIP inside it. The workflow includes a SHA-256 checksum, never receives itch.io credentials, and does not publish automatically.

## Release Check

1. Open the draft or public itch.io page in a private browser window.
2. Launch fullscreen and confirm the title screen fits without scrolling.
3. Complete the route in [../qa/PLAYTHROUGH_QA.md](../qa/PLAYTHROUGH_QA.md).
4. Reload mid-game and confirm Continue returns to the saved room.
5. Open Memory Book, then open Learn More.
6. Confirm no audio plays and no browser console errors appear.

The desktop demo requires a viewport of at least 900 x 600. A clear fullscreen prompt appears below that size.
