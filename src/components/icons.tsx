// Artwork from the Figma file ("TD Together — SVG assets") plus standard 2px rounded line icons.
import type { CSSProperties } from 'react';

type P = { size?: number; color?: string; style?: CSSProperties; className?: string };

export function LogoTile({ size = 88, style }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" fill="none" style={style} aria-hidden="true">
      <rect width="88" height="88" rx="24" fill="#217E1A" />
      <path d="M17.6 44L44 21.12L70.4 44" strokeWidth="7.92" strokeLinecap="round" strokeLinejoin="round" stroke="white" />
      <circle cx="34.32" cy="57.2" r="7.92" fill="white" />
      <circle cx="53.68" cy="57.2" r="7.92" fill="#A8DDB0" />
    </svg>
  );
}

/** Small logo tile used in the entry card and notification (radius scales with size). */
export function LogoSmall({ size = 28 }: P) {
  return <LogoTile size={size} />;
}

const line = (color: string, w = 2) => ({ stroke: color, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' });

export function StatusIcons({ color = '#000' }: P) {
  return (
    <svg width="66" height="13" viewBox="0 0 66 13" aria-hidden="true">
      {/* signal */}
      <rect x="0" y="8.4" width="3" height="4" rx="0.8" fill={color} />
      <rect x="4.6" y="6.2" width="3" height="6.2" rx="0.8" fill={color} />
      <rect x="9.2" y="3.6" width="3" height="8.8" rx="0.8" fill={color} />
      <rect x="13.8" y="1" width="3" height="11.4" rx="0.8" fill={color} />
      {/* wifi */}
      <path d="M29.5 3.3a10.6 10.6 0 0 1 7.6 3.1l1.2-1.2a12.3 12.3 0 0 0-17.6 0l1.2 1.2a10.6 10.6 0 0 1 7.6-3.1z" fill={color} />
      <path d="M29.5 6.8c1.9 0 3.6.7 4.9 1.9l1.2-1.2a8.6 8.6 0 0 0-12.2 0l1.2 1.2c1.3-1.2 3-1.9 4.9-1.9z" fill={color} />
      <path d="M29.5 10.2c.9 0 1.7.3 2.3.9l-2.3 2.3-2.3-2.3c.6-.6 1.4-.9 2.3-.9z" fill={color} />
      {/* battery */}
      <rect x="41.5" y="0.8" width="22" height="11.4" rx="3.6" stroke={color} strokeOpacity="0.4" fill="none" />
      <rect x="43.3" y="2.6" width="18.4" height="7.8" rx="2.2" fill={color} />
      <path d="M64.8 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill={color} fillOpacity="0.45" />
    </svg>
  );
}

// Tab bar icons (exported from Figma, 1.8px)
export function TabHome({ color = '#636363' }: P) {
  const l = line(color, 1.8);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 21V13C15 12.7348 14.8946 12.4804 14.7071 12.2929C14.5196 12.1054 14.2652 12 14 12H10C9.73478 12 9.48043 12.1054 9.29289 12.2929C9.10536 12.4804 9 12.7348 9 13V21" {...l} />
      <path d="M3 10C2.99993 9.70907 3.06333 9.42162 3.18579 9.15771C3.30824 8.89381 3.4868 8.65979 3.709 8.472L10.709 2.473C11.07 2.16791 11.5274 2.00052 12 2.00052C12.4726 2.00052 12.93 2.16791 13.291 2.473L20.291 8.472C20.5132 8.65979 20.6918 8.89381 20.8142 9.15771C20.9367 9.42162 21.0001 9.70907 21 10V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V10Z" {...l} />
    </svg>
  );
}
export function TabAccounts({ color = '#636363' }: P) {
  const l = line(color, 1.8);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 7V4C19 3.73478 18.8946 3.48043 18.7071 3.29289C18.5196 3.10536 18.2652 3 18 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5C3 5.53043 3.21071 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7H19ZM19 7H20C20.2652 7 20.5196 7.10536 20.7071 7.29289C20.8946 7.48043 21 7.73478 21 8V12M21 12H18C17.4696 12 16.9609 12.2107 16.5858 12.5858C16.2107 12.9609 16 13.4696 16 14C16 14.5304 16.2107 15.0391 16.5858 15.4142C16.9609 15.7893 17.4696 16 18 16H21C21.2652 16 21.5196 15.8946 21.7071 15.7071C21.8946 15.5196 22 15.2652 22 15V13C22 12.7348 21.8946 12.4804 21.7071 12.2929C21.5196 12.1054 21.2652 12 21 12Z" {...l} />
      <path d="M3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H20C20.2652 21 20.5196 20.8946 20.7071 20.7071C20.8946 20.5196 21 20.2652 21 20V16" {...l} />
    </svg>
  );
}
export function TabMoveMoney({ color = '#636363' }: P) {
  const l = line(color, 1.8);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 3L4 7L8 11" {...l} />
      <path d="M4 7H20" {...l} />
      <path d="M16 21L20 17L16 13" {...l} />
      <path d="M20 17H4" {...l} />
    </svg>
  );
}
export function TabRewards({ color = '#636363' }: P) {
  const l = line(color, 1.8);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8H20C20.5523 8 21 8.44772 21 9V11C21 11.5523 20.5523 12 20 12H4C3.44772 12 3 11.5523 3 11V9C3 8.44772 3.44772 8 4 8Z" {...l} />
      <path d="M12 8V21" {...l} />
      <path d="M19 12V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V12" {...l} />
      <path d="M7.5 8.00001C6.83696 8.00001 6.20107 7.73662 5.73223 7.26778C5.26339 6.79894 5 6.16305 5 5.50001C5 4.83697 5.26339 4.20108 5.73223 3.73224C6.20107 3.2634 6.83696 3.00001 7.5 3.00001C8.46469 2.9832 9.41003 3.45127 10.2127 4.34317C11.0154 5.23507 11.6383 6.50941 12 8.00001C12.3617 6.50941 12.9846 5.23507 13.7873 4.34317C14.59 3.45127 15.5353 2.9832 16.5 3.00001C17.163 3.00001 17.7989 3.2634 18.2678 3.73224C18.7366 4.20108 19 4.83697 19 5.50001C19 6.16305 18.7366 6.79894 18.2678 7.26778C17.7989 7.73662 17.163 8.00001 16.5 8.00001" {...l} />
    </svg>
  );
}
export function TabMore({ color = '#636363' }: P) {
  const l = line(color, 1.8);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" {...l} />
      <circle cx="7.5" cy="12" r="1.3" fill={color} />
      <circle cx="12" cy="12" r="1.3" fill={color} />
      <circle cx="16.5" cy="12" r="1.3" fill={color} />
    </svg>
  );
}

export function Icon({ name, size = 24, color = 'currentColor', style }: P & { name: IconName }) {
  const l = line(color, size <= 16 ? 1.5 : 2);
  const s = { width: size, height: size, viewBox: '0 0 24 24', style, 'aria-hidden': true } as const;
  switch (name) {
    case 'menu':
      return (
        <svg {...s}>
          <path d="M3.5 6h17M3.5 12h17M3.5 18h17" {...l} />
        </svg>
      );
    case 'gear':
      return (
        <svg {...s}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" {...l} />
          <circle cx="12" cy="12" r="3" {...l} />
        </svg>
      );
    case 'back':
      return (
        <svg {...s}>
          <path d="M15 5l-7 7 7 7" {...line(color, 2.4)} />
        </svg>
      );
    case 'chevronRight':
      return (
        <svg {...s}>
          <path d="M9 6l6 6-6 6" {...l} />
        </svg>
      );
    case 'chevronDown':
      return (
        <svg {...s}>
          <path d="M6 9l6 6 6-6" {...l} />
        </svg>
      );
    case 'chevronUp':
      return (
        <svg {...s}>
          <path d="M6 15l6-6 6 6" {...l} />
        </svg>
      );
    case 'x':
      return (
        <svg {...s}>
          <path d="M6 6l12 12M18 6L6 18" {...line(color, 2.2)} />
        </svg>
      );
    case 'more':
      return (
        <svg {...s}>
          <circle cx="5" cy="12" r="2" fill={color} />
          <circle cx="12" cy="12" r="2" fill={color} />
          <circle cx="19" cy="12" r="2" fill={color} />
        </svg>
      );
    case 'plus':
      return (
        <svg {...s}>
          <path d="M12 5v14M5 12h14" {...l} />
        </svg>
      );
    case 'check':
      return (
        <svg {...s}>
          <path d="M5 12.5l4.5 4.5L19 7.5" {...line(color, 2.4)} />
        </svg>
      );
    case 'clock':
      return (
        <svg {...s}>
          <circle cx="12" cy="12" r="9" {...l} />
          <path d="M12 7v5l3 2" {...l} />
        </svg>
      );
    case 'lock':
      return (
        <svg {...s}>
          <rect x="5" y="11" width="14" height="10" rx="2" {...l} />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" {...l} />
        </svg>
      );
    case 'pencil':
      return (
        <svg {...s}>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" {...l} />
        </svg>
      );
    case 'eye':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" style={style} aria-hidden="true">
          <path d="M1.33 8S3.73 3.33 8 3.33 14.67 8 14.67 8 12.27 12.67 8 12.67 1.33 8 1.33 8Z" stroke={color} strokeWidth="1.33" strokeLinejoin="round" fill="none" />
          <circle cx="8" cy="8" r="2" stroke={color} strokeWidth="1.33" fill="none" />
        </svg>
      );
    case 'calendar':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" style={style} aria-hidden="true">
          <path d="M3.67 3.33h8.66c.92 0 1.67.75 1.67 1.67v7.33c0 .92-.75 1.67-1.67 1.67H3.67C2.75 14 2 13.25 2 12.33V5c0-.92.75-1.67 1.67-1.67Z" stroke={color} strokeWidth="1.33" fill="none" />
          <path d="M2 6.67h12M5.33 2v2.67M10.67 2v2.67" stroke={color} strokeWidth="1.33" strokeLinecap="round" />
        </svg>
      );
    case 'faceId':
      return (
        <svg {...s}>
          <path d="M3 8V6a3 3 0 0 1 3-3h2M16 3h2a3 3 0 0 1 3 3v2M21 16v2a3 3 0 0 1-3 3h-2M8 21H6a3 3 0 0 1-3-3v-2" {...l} />
          <path d="M9 9v1.5M15 9v1.5M12 9v4h-1M9 16c1.6 1.3 4.4 1.3 6 0" {...l} />
        </svg>
      );
    case 'star':
      return (
        <svg {...s}>
          <circle cx="12" cy="12" r="9.2" stroke={color} strokeWidth="1.6" fill="none" />
          <path d="M12 6.8l1.55 3.25 3.55.45-2.6 2.45.67 3.52L12 14.75l-3.17 1.72.67-3.52-2.6-2.45 3.55-.45z" fill={color} />
        </svg>
      );
    case 'percent':
      return (
        <svg {...s}>
          <path d="M18 6L6 18" {...l} />
          <circle cx="7" cy="7" r="2.2" {...l} />
          <circle cx="17" cy="17" r="2.2" {...l} />
        </svg>
      );
  }
}

export type IconName =
  | 'menu'
  | 'gear'
  | 'back'
  | 'chevronRight'
  | 'chevronDown'
  | 'chevronUp'
  | 'x'
  | 'more'
  | 'plus'
  | 'check'
  | 'clock'
  | 'lock'
  | 'pencil'
  | 'eye'
  | 'calendar'
  | 'faceId'
  | 'star'
  | 'percent';

/** The bold green arrow beside section titles ("Open all"). */
export function OpenAll() {
  return (
    <svg width="39" height="34" viewBox="0 0 39 34" aria-hidden="true">
      <path d="M15 9l8 8-8 8" stroke="#217e1a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** The green plus in a circle on "Create a…" buttons. */
export function PlusCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.9" stroke="#18a033" strokeWidth="2.2" fill="none" />
      <path d="M12 7v10M7 12h10" stroke="#18a033" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
