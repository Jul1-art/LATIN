import React from 'react';

export const IconArrow = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15m-6-6 6 6-6 6" />
  </svg>
);

export const IconDiagonal = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 18 18 6M6 6h12v12" />
  </svg>
);

export const IconClose = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 6 12 12M6 18 18 6" />
  </svg>
);

export const IconCopy = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V4H4v12h4" />
  </svg>
);

export const IconSearch = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

export const IconPlay = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14M16 5v14" strokeWidth="3.5" />
  </svg>
);

export const IconSound = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m11 5-5 4H3v6h3l5 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" />
  </svg>
);

export const IconMuted = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m11 5-5 4H3v6h3l5 4zM16 9l5 6M16 15l5-6" />
  </svg>
);

export const IconExpand = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />
  </svg>
);

export const IconContract = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 8h5V3M21 8h-5V3M8 21v-5H3M16 21v-5h5" />
  </svg>
);

export const IconSettings = ({ className = "icon" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="m10 3-.5 2a7 7 0 0 0-1.8 1L5.8 5.5 3.9 8.8l1.5 1.4a7 7 0 0 0 0 2.1L3.9 14l1.9 3.3 1.9-.5a7 7 0 0 0 1.8 1l.5 2.1h4l.5-2.1a7 7 0 0 0 1.8-1l1.9.5 1.9-3.3-1.5-1.6a7 7 0 0 0 0-2.1l1.5-1.5-1.9-3.3-1.9.5a7 7 0 0 0-1.8-1L14 3z" />
    <circle cx="12" cy="11.5" r="3" />
  </svg>
);

export const IconLogoMark = ({ className = "logo-mark" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
    <path d="M5 26V6h5v15h17v5zM16 6h5v9h-5zM25 6h3v9h-3z" fill="currentColor" stroke="none" />
  </svg>
);
