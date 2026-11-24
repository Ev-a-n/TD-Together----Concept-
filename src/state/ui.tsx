// Things that sit on top of the screens: bottom sheets, the delete dialog, the notification banner and toasts.
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type SheetKind = { type: 'intro' } | { type: 'billOptions' } | { type: 'pickAccount'; field: 'from' | 'to'; onPick: (id: string) => void; current: string };
export type DialogKind = { type: 'deleteBill'; billId: string; name: string; onConfirm: () => void };
export interface BannerData {
  id: number;
  title: string;
  message: string;
  onTap?: () => void;
  onDone?: () => void;
}

interface UI {
  sheet: SheetKind | null;
  openSheet: (s: SheetKind) => void;
  closeSheet: () => void;
  dialog: DialogKind | null;
  openDialog: (d: DialogKind) => void;
  closeDialog: () => void;
  banner: BannerData | null;
  showBanner: (b: Omit<BannerData, 'id'>) => void;
  tapBanner: () => void;
  toast: { id: number; text: string } | null;
  showToast: (text: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<UI | null>(null);

const BANNER_MS = 2500;
const TOAST_MS = 2200;

export function UIProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const bannerTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);
  const bannerRef = useRef<BannerData | null>(null);
  const seq = useRef(1);

  const finishBanner = useCallback((tapped: boolean) => {
    const b = bannerRef.current;
    window.clearTimeout(bannerTimer.current);
    bannerRef.current = null;
    setBanner(null);
    if (!b) return;
    b.onDone?.();
    if (tapped) b.onTap?.();
  }, []);

  const showBanner = useCallback(
    (b: Omit<BannerData, 'id'>) => {
      if (bannerRef.current) finishBanner(false);
      const data = { ...b, id: seq.current++ };
      bannerRef.current = data;
      setBanner(data);
      bannerTimer.current = window.setTimeout(() => finishBanner(false), BANNER_MS);
    },
    [finishBanner],
  );
  const tapBanner = useCallback(() => finishBanner(true), [finishBanner]);

  const showToast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: seq.current++, text });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const clearAll = useCallback(() => {
    window.clearTimeout(bannerTimer.current);
    window.clearTimeout(toastTimer.current);
    bannerRef.current = null;
    setSheet(null);
    setDialog(null);
    setBanner(null);
    setToast(null);
  }, []);

  const value = useMemo<UI>(
    () => ({
      sheet,
      openSheet: setSheet,
      closeSheet: () => setSheet(null),
      dialog,
      openDialog: setDialog,
      closeDialog: () => setDialog(null),
      banner,
      showBanner,
      tapBanner,
      toast,
      showToast,
      clearAll,
    }),
    [sheet, dialog, banner, showBanner, tapBanner, toast, showToast, clearAll],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUI outside UIProvider');
  return ctx;
}
