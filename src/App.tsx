import { useCallback, useEffect } from 'react';
import { Viewer, useViewer } from './viewer/Viewer';
import { Guide } from './viewer/Guide';
import { PhoneApp } from './PhoneApp';
import { useStore } from './state/store';
import { useNav } from './state/nav';
import { useUI } from './state/ui';

export function App() {
  const viewer = useViewer();
  const { state, dispatch } = useStore();
  const nav = useNav();
  const ui = useUI();

  const restart = useCallback(() => {
    ui.clearAll();
    dispatch({ type: 'reset' });
    nav.root('login');
  }, [ui, dispatch, nav]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest?.('input, select, textarea')) return;
      const key = e.key.toLowerCase();
      if (key === 'f') viewer.toggleFullscreen();
      else if (key === 'escape' && viewer.focus) viewer.exitFocus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewer.toggleFullscreen, viewer.focus, viewer.exitFocus]);

  return (
    <Viewer viewer={viewer} onRestart={restart} guide={<Guide done={state.guide} partner={state.people.partner.short} />}>
      <PhoneApp />
    </Viewer>
  );
}
