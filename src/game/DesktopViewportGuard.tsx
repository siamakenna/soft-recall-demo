import { useEffect, useState, type ReactNode } from "react";

const MIN_WIDTH = 900;
const MIN_HEIGHT = 600;

function isViewportTooSmall(): boolean {
  return window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT;
}

export default function DesktopViewportGuard({ children }: { children: ReactNode }) {
  const [tooSmall, setTooSmall] = useState(isViewportTooSmall);
  const [fullscreenUnavailable, setFullscreenUnavailable] = useState(false);

  useEffect(() => {
    const update = () => setTooSmall(isViewportTooSmall());
    window.addEventListener("resize", update);
    document.addEventListener("fullscreenchange", update);
    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("fullscreenchange", update);
    };
  }, []);

  if (!tooSmall) return children;

  const enterFullscreen = async () => {
    setFullscreenUnavailable(false);
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      setFullscreenUnavailable(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-[color:var(--color-background)] px-6 text-center"
      data-testid="desktop-viewport-guard"
      role="dialog"
      aria-labelledby="viewport-guard-title"
    >
      <div className="max-w-lg">
        <p className="font-hand text-lg text-[color:var(--color-glow)]">A little more room</p>
        <h1 id="viewport-guard-title" className="mt-2 font-serif text-3xl">
          Soft Recall needs a larger window.
        </h1>
        <p className="mt-3 text-base opacity-80">
          Enter fullscreen or enlarge this desktop browser to at least {MIN_WIDTH} x {MIN_HEIGHT}.
        </p>
        <button
          type="button"
          onClick={enterFullscreen}
          className="choice-btn mt-6 min-h-12 rounded px-6 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-glow)]"
        >
          Enter fullscreen
        </button>
        {fullscreenUnavailable && (
          <p className="mt-3 text-sm opacity-70" role="status">
            Fullscreen was blocked. Use the fullscreen control on the game page or enlarge the
            browser window.
          </p>
        )}
      </div>
    </div>
  );
}
