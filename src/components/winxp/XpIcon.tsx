import React from "react";

interface XpIconProps {
  name:
    | "windows-flag"
    | "my-computer"
    | "my-pictures"
    | "my-documents"
    | "recycle-bin-empty"
    | "recycle-bin-full"
    | "internet-explorer"
    | "webptor"
    | "folder"
    | "image-file"
    | "zip"
    | "gear"
    | "info"
    | "help"
    | "search"
    | "run"
    | "shutdown"
    | "logoff"
    | "sound"
    | "network"
    | "compare"
    | "refresh"
    | "camera"
    | "floppy"
    | "delete";
  className?: string;
  size?: number;
}

export function XpIcon({ name, className = "", size = 24 }: XpIconProps) {
  const pixelSize = size;

  switch (name) {
    case "windows-flag":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          {/* Windows XP 4-colored flag tiles */}
          {/* Red top-left */}
          <path
            d="M5 6.5C8 5.5 12 7 14.5 8.2V17C12 15.8 8 14.5 5 15.5V6.5Z"
            fill="url(#xp-red)"
            stroke="#b8281a"
            strokeWidth="0.5"
          />
          {/* Green top-right */}
          <path
            d="M17.5 9.5C21 8 25 9.5 28 11V19.5C25 18 21 16.5 17.5 18V9.5Z"
            fill="url(#xp-green)"
            stroke="#418d18"
            strokeWidth="0.5"
          />
          {/* Blue bottom-left */}
          <path
            d="M5 17.5C8 16.5 12 18 14.5 19.2V27.5C12 26.5 8 25 5 26V17.5Z"
            fill="url(#xp-blue)"
            stroke="#1d5eb8"
            strokeWidth="0.5"
          />
          {/* Yellow bottom-right */}
          <path
            d="M17.5 20C21 18.5 25 20 28 21.5V29.5C25 28 21 26.5 17.5 28V20Z"
            fill="url(#xp-yellow)"
            stroke="#d49b10"
            strokeWidth="0.5"
          />
          <defs>
            <linearGradient id="xp-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b52" />
              <stop offset="100%" stopColor="#d82c18" />
            </linearGradient>
            <linearGradient id="xp-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9de645" />
              <stop offset="100%" stopColor="#5ea717" />
            </linearGradient>
            <linearGradient id="xp-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#51a9ff" />
              <stop offset="100%" stopColor="#156ee0" />
            </linearGradient>
            <linearGradient id="xp-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffde59" />
              <stop offset="100%" stopColor="#f5aa0f" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "my-computer":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          {/* CRT Monitor */}
          <rect x="4" y="3" width="22" height="17" rx="2" fill="#d0cfc9" stroke="#77746d" strokeWidth="1" />
          <rect x="6" y="5" width="18" height="13" rx="1" fill="#1b52a4" stroke="#0f346b" strokeWidth="0.8" />
          {/* CRT screen highlight */}
          <path d="M7 6L18 6L14 11L7 11Z" fill="#3877d9" opacity="0.6" />
          {/* Stand */}
          <path d="M12 20H18L20 23H10L12 20Z" fill="#b9b7ae" stroke="#77746d" strokeWidth="0.8" />
          {/* Desktop tower */}
          <rect x="19" y="8" width="9" height="21" rx="1" fill="#dfded9" stroke="#77746d" strokeWidth="1" />
          <rect x="21" y="10" width="5" height="1.5" fill="#525048" />
          <rect x="21" y="13" width="5" height="1.5" fill="#525048" />
          <circle cx="23.5" cy="22" r="1.5" fill="#39b54a" />
          <circle cx="23.5" cy="25.5" r="1" fill="#ef4136" />
        </svg>
      );

    case "my-pictures":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          {/* XP Folder */}
          <path
            d="M3 7C3 5.89543 3.89543 5 5 5H12L15 8H27C28.1046 8 29 8.89543 29 10V25C29 26.1046 28.1046 27 27 27H5C3.89543 27 3 26.1046 3 25V7Z"
            fill="#ecc761"
            stroke="#b88f28"
            strokeWidth="1"
          />
          {/* Front folder leaf */}
          <path
            d="M3 13H29V25C29 26.1046 28.1046 27 27 27H5C3.89543 27 3 26.1046 3 25V13Z"
            fill="#f7d97b"
            stroke="#d49f28"
            strokeWidth="0.8"
          />
          {/* Photo frame inside folder */}
          <rect x="8" y="10" width="16" height="12" rx="1" fill="#fff" stroke="#999" strokeWidth="0.8" transform="rotate(-6 16 16)" />
          {/* Landscape art in photo */}
          <rect x="9.5" y="11.5" width="13" height="9" fill="#66a6ff" transform="rotate(-6 16 16)" />
          <circle cx="12" cy="14" r="1.5" fill="#ffe066" />
          <path d="M10 20L14 15L17 18L20 14L23 20Z" fill="#38a169" />
        </svg>
      );

    case "my-documents":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          <path
            d="M3 7C3 5.89543 3.89543 5 5 5H12L15 8H27C28.1046 8 29 8.89543 29 10V25C29 26.1046 28.1046 27 27 27H5C3.89543 27 3 26.1046 3 25V7Z"
            fill="#ecc761"
            stroke="#b88f28"
            strokeWidth="1"
          />
          {/* Paper sheet inside */}
          <rect x="8" y="9" width="14" height="15" rx="1" fill="#ffffff" stroke="#ccc" strokeWidth="0.8" />
          <line x1="11" y1="13" x2="19" y2="13" stroke="#2563eb" strokeWidth="1" />
          <line x1="11" y1="16" x2="19" y2="16" stroke="#888" strokeWidth="1" />
          <line x1="11" y1="19" x2="16" y2="19" stroke="#888" strokeWidth="1" />
          <path
            d="M3 14H29V25C29 26.1046 28.1046 27 27 27H5C3.89543 27 3 26.1046 3 25V14Z"
            fill="#f7d97b"
            stroke="#d49f28"
            strokeWidth="0.8"
          />
        </svg>
      );

    case "recycle-bin-full":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          {/* Trash papers bursting out */}
          <rect x="9" y="4" width="10" height="8" rx="1" fill="#fff" stroke="#999" strokeWidth="0.5" transform="rotate(-15 14 8)" />
          <rect x="14" y="5" width="10" height="8" rx="1" fill="#e2e8f0" stroke="#999" strokeWidth="0.5" transform="rotate(20 19 9)" />
          {/* Bin body */}
          <path
            d="M6 10H26L23 28C23 29.1 22.1 30 21 30H11C9.9 30 9 29.1 9 28L6 10Z"
            fill="url(#xp-bin-grad)"
            stroke="#476585"
            strokeWidth="1"
          />
          {/* Mesh pattern & recycle logo */}
          <circle cx="16" cy="20" r="4.5" fill="#22c55e" opacity="0.9" />
          <path d="M16 17.5L18 20.5H14L16 17.5Z" fill="#fff" />
          <defs>
            <linearGradient id="xp-bin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9fb9d6" />
              <stop offset="100%" stopColor="#57789e" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "recycle-bin-empty":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          <ellipse cx="16" cy="10" rx="10" ry="3" fill="#88a4c4" stroke="#476585" strokeWidth="1" />
          <path
            d="M6 10H26L23 28C23 29.1 22.1 30 21 30H11C9.9 30 9 29.1 9 28L6 10Z"
            fill="url(#xp-bin-empty-grad)"
            stroke="#476585"
            strokeWidth="1"
          />
          <circle cx="16" cy="20" r="4.5" fill="#22c55e" opacity="0.8" />
          <path d="M16 17.5L18 20.5H14L16 17.5Z" fill="#fff" />
          <defs>
            <linearGradient id="xp-bin-empty-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bed2e8" />
              <stop offset="100%" stopColor="#678db8" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "webptor":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          <rect x="3" y="3" width="26" height="26" rx="5" fill="url(#xp-wp-bg)" stroke="#1a4ca1" strokeWidth="1.2" />
          {/* Bevel highlight */}
          <rect x="4" y="4" width="24" height="24" rx="4" stroke="#8cb8ff" strokeWidth="1" fill="none" />
          {/* Flash lightning / webp glyph */}
          <path
            d="M17 5L9 17H15L13 27L23 14H17L19 5H17Z"
            fill="url(#xp-bolt-grad)"
            stroke="#995200"
            strokeWidth="0.8"
          />
          <defs>
            <linearGradient id="xp-wp-bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d8cf8" />
              <stop offset="50%" stopColor="#1e5bc6" />
              <stop offset="100%" stopColor="#0c3a91" />
            </linearGradient>
            <linearGradient id="xp-bolt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff566" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "internet-explorer":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          {/* Iconic XP IE 'e' with golden orbital ring */}
          <circle cx="16" cy="16" r="11" fill="url(#xp-ie-e)" />
          {/* Cutout for 'e' */}
          <path
            d="M16 8C11.58 8 8 11.58 8 16C8 20.42 11.58 24 16 24C19.5 24 22.4 21.8 23.5 18.5H12C12.3 20 13.9 21.2 16 21.2C17.5 21.2 18.8 20.5 19.4 19.5L22.5 20.5C21.2 22.6 18.8 24 16 24C11.58 24 8 20.42 8 16C8 11.58 11.58 8 16 8ZM16 10.8C14 10.8 12.4 12 12.1 13.8H19.9C19.6 12 18 10.8 16 10.8Z"
            fill="#ffffff"
          />
          {/* Golden yellow orbital halo */}
          <ellipse
            cx="16"
            cy="16"
            rx="14"
            ry="4.5"
            transform="rotate(-30 16 16)"
            stroke="url(#xp-ie-ring)"
            strokeWidth="2.5"
            fill="none"
          />
          <defs>
            <linearGradient id="xp-ie-e" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4aa3ff" />
              <stop offset="100%" stopColor="#0d59c7" />
            </linearGradient>
            <linearGradient id="xp-ie-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe600" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "image-file":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          <path d="M6 3H21L27 9V29H6V3Z" fill="#ffffff" stroke="#777" strokeWidth="1" />
          <path d="M21 3V9H27" fill="#e2e8f0" stroke="#777" strokeWidth="1" />
          <rect x="9" y="11" width="14" height="12" fill="#3b82f6" rx="1" />
          <circle cx="12" cy="14" r="1.5" fill="#fef08a" />
          <path d="M9 21L13 16L16 19L19 15L23 21Z" fill="#15803d" />
        </svg>
      );

    case "zip":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          <path d="M6 3H21L27 9V29H6V3Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
          <path d="M21 3V9H27" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
          {/* Zipper strip */}
          <rect x="13.5" y="3" width="5" height="26" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
          <rect x="14" y="6" width="2" height="2" fill="#451a03" />
          <rect x="16" y="9" width="2" height="2" fill="#451a03" />
          <rect x="14" y="12" width="2" height="2" fill="#451a03" />
          <rect x="16" y="15" width="2" height="2" fill="#451a03" />
          <rect x="13" y="18" width="6" height="6" rx="1" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
        </svg>
      );

    case "folder":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          <path
            d="M3 7C3 5.89543 3.89543 5 5 5H12L15 8H27C28.1046 8 29 8.89543 29 10V25C29 26.1046 28.1046 27 27 27H5C3.89543 27 3 26.1046 3 25V7Z"
            fill="#ecc761"
            stroke="#b88f28"
            strokeWidth="1"
          />
          <path
            d="M3 13H29V25C29 26.1046 28.1046 27 27 27H5C3.89543 27 3 26.1046 3 25V13Z"
            fill="#f7d97b"
            stroke="#d49f28"
            strokeWidth="0.8"
          />
        </svg>
      );

    case "shutdown":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          <circle cx="16" cy="16" r="13" fill="url(#xp-shutdown)" stroke="#991b1b" strokeWidth="1" />
          <path
            d="M16 8V16M11.5 10.5C9.5 12 8 14.5 8 17.5C8 22 11.5 25.5 16 25.5C20.5 25.5 24 22 24 17.5C24 14.5 22.5 12 20.5 10.5"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="xp-shutdown" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "logoff":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
        >
          <circle cx="16" cy="16" r="13" fill="url(#xp-logoff)" stroke="#b45309" strokeWidth="1" />
          {/* Key icon */}
          <circle cx="13" cy="14" r="4" stroke="#ffffff" strokeWidth="2" fill="none" />
          <path d="M16 17L22 23M20 21L22 19" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="xp-logoff" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "sound":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
        >
          <path d="M4 9H8L13 5V19L8 15H4V9Z" fill="#ffd700" stroke="#78350f" strokeWidth="0.8" />
          <path d="M16 8C17.5 9.5 17.5 14.5 16 16" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18.5 6C21 8.5 21 15.5 18.5 18" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "network":
      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
        >
          <rect x="2" y="4" width="11" height="9" rx="1" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.8" />
          <rect x="11" y="9" width="11" height="9" rx="1" fill="#22c55e" stroke="#14532d" strokeWidth="0.8" />
        </svg>
      );

    default:
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}
