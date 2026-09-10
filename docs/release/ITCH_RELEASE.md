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

Create a ZIP with `index.html` at its root:

```bash
cd dist
zip -r ../soft-recall-demo-itch.zip .
cd ..
```

Upload `soft-recall-demo-itch.zip` as an HTML project. Use **Click to launch in fullscreen**, enable itch.io's fullscreen button, and leave SharedArrayBuffer support off.

## Build in GitHub Actions

Run **Package itch.io Build** from the repository's Actions tab. Download the `soft-recall-demo-itch` artifact after it succeeds. The workflow never receives itch.io credentials and does not publish automatically.

## Release Check

1. Open the draft or public itch.io page in a private browser window.
2. Launch fullscreen and confirm the title screen fits without scrolling.
3. Complete the route in [../qa/PLAYTHROUGH_QA.md](../qa/PLAYTHROUGH_QA.md).
4. Reload mid-game and confirm Continue returns to the saved room.
5. Open Memory Book, then open Learn More.
6. Confirm no audio plays and no browser console errors appear.

The desktop demo requires a viewport of at least 900 x 600. A clear fullscreen prompt appears below that size.
