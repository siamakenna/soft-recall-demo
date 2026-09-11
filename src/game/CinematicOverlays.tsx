import { useEffect, useMemo, useRef, useState } from "react";
import { SCENE_IMG, ROOM_LABEL } from "./data/rooms";
import type { RoomStory } from "./data/morningBeats";

import { CUTSCENE_SHOTS, cutsceneTimeline, type CutsceneKind } from "./data/cutscenes";
export type { CutsceneKind } from "./data/cutscenes";

type CutsceneOverlayProps = {
  kind: CutsceneKind;
  title: string;
  lines: string[];
  image: string;
  reducedMotion: boolean;
  onComplete: () => void;
};

export function CutsceneOverlay({
  kind,
  title,
  lines,
  image,
  reducedMotion,
  onComplete,
}: CutsceneOverlayProps) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pauseRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const completed = useRef(false);
  const completeRef = useRef(onComplete);
  const timeline = useMemo(() => cutsceneTimeline(lines), [lines]);
  const duration = timeline.at(-1)?.end ?? 0;
  const caption = timeline.find((line) => elapsed < line.end) ?? timeline.at(-1);
  const still = reducedMotion || failed;
  const playing = !paused && !hidden;
  const framing = CUTSCENE_SHOTS[kind];
  const complete = () => {
    if (completed.current) return;
    completed.current = true;
    completeRef.current();
  };

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);
  useEffect(() => { pauseRef.current?.focus(); }, []);
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (still || !video) return;
    if (!playing) { video.pause(); return; }
    let cancelled = false;
    void video.play().catch((error: DOMException) => {
      if (cancelled) return;
      if (error.name === "NotAllowedError") setPaused(true);
      else setFailed(true);
    });
    return () => { cancelled = true; };
  }, [playing, still]);
  useEffect(() => {
    if (!still || !playing) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - previous) / 1000;
      previous = now;
      setElapsed((time) => time + delta);
    }, 100);
    return () => window.clearInterval(timer);
  }, [still, playing]);
  useEffect(() => {
    if (elapsed >= duration && !completed.current) {
      completed.current = true;
      completeRef.current();
    }
  }, [elapsed, duration]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!completed.current) { completed.current = true; completeRef.current(); }
      } else if (event.key === " " && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        setPaused((value) => !value);
      } else if (event.key === "Tab") {
        event.preventDefault();
        (document.activeElement === pauseRef.current ? skipRef : pauseRef).current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center overflow-auto bg-black text-white"
      data-testid={`cutscene-${kind}`}
      data-playback={playing ? "playing" : "paused"}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`cutscene-title-${kind}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {still ? (
          <img src={image} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${framing.x * 100}% ${framing.y * 100}%`, transform: `scale(${framing.zoom})` }} />
        ) : (
          <video
            ref={videoRef}
            data-testid="cutscene-video"
            src={`${import.meta.env.BASE_URL}media/cutscenes/${kind}.mp4`}
            poster={image}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className="h-full w-full object-cover"
            aria-hidden="true"
            onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
            onEnded={complete}
            onError={() => setFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/10" />
        <div className="pixel-paint-overlay absolute inset-0" aria-hidden />
      </div>

      <div className="relative w-full max-w-4xl px-8 pb-8 pt-24">
        <h2 id={`cutscene-title-${kind}`} className="font-hand text-xl text-white/70">{title}</h2>
        <p data-testid="cutscene-caption" aria-live="polite" aria-atomic="true" className="mt-3 min-h-24 max-w-3xl font-serif text-xl leading-relaxed text-white drop-shadow-lg">{caption?.text}</p>
        <div className="mt-5 flex items-center gap-3">
          <button ref={pauseRef} type="button" onClick={() => setPaused((value) => !value)} data-testid="cutscene-pause" aria-label={paused ? "Play cutscene" : "Pause cutscene"} title={paused ? "Play" : "Pause"} className="min-h-11 min-w-11 rounded border border-white/30 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white">
            <svg viewBox="0 0 24 24" className="mx-auto h-4 w-4" aria-hidden="true" fill="currentColor">{paused ? <path d="m7 4 14 8-14 8Z" /> : <path d="M6 4h4v16H6zM14 4h4v16h-4z" />}</svg>
          </button>
          <div role="progressbar" aria-label="Cutscene progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(elapsed / duration * 100))} className="h-0.5 flex-1 bg-white/20"><div className="h-full bg-white/70" style={{ width: `${Math.min(100, elapsed / duration * 100)}%` }} /></div>
          <button ref={skipRef} type="button" onClick={complete} data-testid="cutscene-skip" className="min-h-11 rounded px-3 text-xs text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-white">Skip moment</button>
        </div>
      </div>
    </div>
  );
}

type StoryOverlayProps = {
  story: RoomStory;
  beatIndex: number;
  reducedMotion: boolean;
  onChoice: (choiceId: string, beatIndex: number, isLast: boolean) => void;
  onClose: () => void;
};

export function StoryOverlay({ story, beatIndex, reducedMotion, onChoice, onClose }: StoryOverlayProps) {
  const [currentBeat, setCurrentBeat] = useState(beatIndex);
  const [finished, setFinished] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const beat = story.beats[currentBeat] ?? story.beats[story.beats.length - 1];
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); onClose(); } };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [onClose]);

  useEffect(() => {
    firstChoiceRef.current?.focus();
  }, [currentBeat]);

  useEffect(() => {
    if (response && !finished) continueButtonRef.current?.focus();
  }, [response, finished]);

  useEffect(() => {
    setCurrentBeat(beatIndex);
    setFinished(false);
    setResponse(null);
  }, [beatIndex, story.id]);

  const selectChoice = (choiceId: string) => {
    if (finished) return;
    const isLast = currentBeat >= story.beats.length - 1;
    onChoice(choiceId, currentBeat, isLast);
    const selected = beat.choices.find((choice) => choice.id === choiceId);
    setResponse(selected?.response ?? null);
    if (isLast) {
      setFinished(true);
    }
  };

  const continueStory = () => {
    setResponse(null);
    setCurrentBeat((index) => index + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center overflow-auto bg-black/80 p-4 text-white backdrop-blur-sm"
      data-testid="room-story"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-story-title"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-lg border border-white/20 bg-[color:var(--color-dread)] shadow-2xl">
        <div className="relative h-[28vh] min-h-40 max-h-72 overflow-hidden sm:h-64">
          <img
            src={SCENE_IMG[story.room]}
            alt={`${ROOM_LABEL[story.room]} detail`}
            className={`h-full w-full object-cover ${reducedMotion ? "" : "animate-[cinematic-breathe_16s_ease-in-out_infinite]"}`}
            style={{ filter: "brightness(.72) saturate(.9) contrast(1.04)", transform: "scale(1.08)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-dread)] via-transparent to-black/10" />
          <div className="pixel-paint-overlay absolute inset-0" aria-hidden />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4 sm:left-7 sm:right-7">
            <div>
              <p className="font-hand text-lg text-[color:var(--color-glow)]">{ROOM_LABEL[story.room]} · linger</p>
              <h2 id="room-story-title" className="font-serif text-2xl sm:text-3xl">{story.title}</h2>
            </div>
            <span className="shrink-0 text-xs text-white/60">{Math.min(currentBeat + 1, story.beats.length)} / {story.beats.length}</span>
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <p data-testid="story-copy" className="max-w-2xl font-serif text-base leading-relaxed text-white/90 sm:text-lg">{response ?? (finished ? "The detail settles. You can leave it here, or carry it with you." : beat.text)}</p>
          {!finished && !response ? (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {beat.choices.map((choice, index) => (
                <button
                  key={choice.id}
                  ref={index === 0 ? firstChoiceRef : undefined}
                  type="button"
                  onClick={() => selectChoice(choice.id)}
                  data-testid={`story-choice-${choice.id}`}
                  className="choice-btn min-h-12 rounded px-4 py-3 text-left text-sm leading-snug focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-glow)]"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          ) : !finished && response ? (
            <div className="mt-6 flex justify-end">
              <button ref={continueButtonRef} type="button" onClick={continueStory} data-testid="story-continue" className="choice-btn min-h-11 rounded px-5 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-glow)]">
                Continue the thread
              </button>
            </div>
          ) : (
            <p className="mt-6 rounded border border-[color:var(--color-glow)]/30 bg-black/20 px-4 py-3 font-serif text-sm italic text-white/80">
              This moment is in the Memory Book now.
            </p>
          )}
          <div className="mt-5 flex items-center justify-between gap-3 text-xs text-white/55">
            <span>The room keeps what you notice.</span>
            <button type="button" onClick={onClose} className="rounded px-2 py-1 underline underline-offset-4 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-glow)]">
              Leave this moment (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
