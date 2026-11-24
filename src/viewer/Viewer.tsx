// The page around the prototype (modelled on the Play Along and Wallet prototypes):
// a calm grey page, the phone centred, a caption, small controls and a "Try this" checklist.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

const DESIGN = { w: 402, h: 874 };
const LAYOUT = { pad: 20, guideW: 200, guideGap: 36, caption: 54, controls: 64, maxScale: 1.1, wideFrom: 1000 };
const BEZEL = 14;

/** A narrow touch screen: show the prototype without a frame. */
const isRealPhone = () => window.matchMedia('(pointer: coarse)').matches && Math.min(window.screen.width, window.screen.height) <= 500;

type FsDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };
const nativeFs = () => !!(document.fullscreenElement ?? (document as FsDoc).webkitFullscreenElement);

export function useViewer() {
  const [bare, setBare] = useState(isRealPhone);
  const [win, setWin] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [native, setNative] = useState(nativeFs);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setBare(isRealPhone());
      setWin({ w: window.innerWidth, h: window.innerHeight });
    };
    const onFs = () => {
      const on = nativeFs();
      setNative(on);
      if (on) setFocus(false);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('bare-page', bare);
  }, [bare]);

  const immersive = native || focus;
  const toggleFullscreen = useCallback(() => {
    const doc = document as FsDoc;
    if (nativeFs()) {
      void (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
      return;
    }
    if (focus) return setFocus(false);
    const el = document.documentElement as FsEl;
    const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
    if (!request) return setFocus(true);
    const fallback = () => {
      if (!nativeFs()) setFocus(true);
    };
    try {
      const r = request.call(el) as unknown;
      if (r instanceof Promise) r.catch(fallback);
    } catch {
      return fallback();
    }
    window.setTimeout(fallback, 600);
  }, [focus]);
  const exitFocus = useCallback(() => setFocus(false), []);

  return { bare, win, immersive, focus, toggleFullscreen, exitFocus };
}

interface Props {
  viewer: ReturnType<typeof useViewer>;
  onRestart: () => void;
  guide: ReactNode;
  children: ReactNode;
}

export function Viewer({ viewer, onRestart, guide, children }: Props) {
  const { bare, win, immersive, toggleFullscreen } = viewer;
  const bareRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  // On a real phone the stage is sized from the container as painted (iOS Safari's bars come and go).
  useLayoutEffect(() => {
    const el = bareRef.current;
    if (!bare || !el) return void setBox(null);
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox((was) => (was && was.w === r.width && was.h === r.height ? was : { w: r.width, h: r.height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [bare]);

  const L = LAYOUT;
  const frame = bare ? 0 : BEZEL;
  const wide = win.w >= L.wideFrom && !immersive;
  const roomW = win.w - L.pad * 2 - (wide ? (L.guideW + L.guideGap) * 2 : 0);
  const roomH = win.h - L.pad * 2 - (immersive ? 40 : L.caption + L.controls);
  const avail = bare && box ? box : win;
  // Bare: fill the width at design size and let the screens adapt to the height.
  const s = bare ? avail.w / DESIGN.w : Math.max(0.45, Math.min(immersive ? 2 : L.maxScale, roomW / (DESIGN.w + 2 * frame), roomH / (DESIGN.h + 2 * frame)));
  const stage = bare ? { w: DESIGN.w, h: avail.h / s } : DESIGN;
  const outer = { w: stage.w + 2 * frame, h: stage.h + 2 * frame };

  const phone = (
    <div className="phone-slot" style={{ width: outer.w * s, height: outer.h * s }}>
      <div className="phone-scale" style={{ width: outer.w, height: outer.h, transform: `scale(${s})` }}>
        <div className="device" style={{ padding: frame }}>
          {!bare && (
            <>
              <i className="side side-action" />
              <i className="side side-up" />
              <i className="side side-down" />
              <i className="side side-power" />
            </>
          )}
          <div className="phone" style={{ '--stage-h': `${stage.h}px` } as CSSProperties}>
            {children}
            {!bare && <div className="home-indicator" />}
          </div>
        </div>
      </div>
    </div>
  );

  if (bare)
    return (
      <div className="bare" ref={bareRef}>
        {phone}
      </div>
    );

  return (
    <div className={`viewer ${immersive ? 'immersive' : ''}`}>
      <main className="viewer-main">
        <p className="viewer-caption">
          <strong>TD · TD Together</strong>
          <span>concept prototype · tap to explore</span>
        </p>
        {phone}
        <div className="viewer-controls">
          <button onClick={toggleFullscreen}>{immersive ? 'Exit full screen (F)' : 'Full screen (F)'}</button>
          <button onClick={onRestart}>Restart prototype</button>
        </div>
        <p className="viewer-foot">Concept project. Not affiliated with TD Bank.</p>
      </main>
      {guide}
    </div>
  );
}
