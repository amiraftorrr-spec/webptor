"use client";

import React, { useState } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpDesktopIconsProps {
  onOpenMyPictures: () => void;
  onClearQueue: () => void;
  onOpenAbout: () => void;
  onRestoreMainWindow?: () => void;
  onOpenApp?: (appName: string) => void;
  queueCount: number;
}

export function XpDesktopIcons({
  onOpenMyPictures,
  onClearQueue,
  onOpenAbout,
  onRestoreMainWindow,
  onOpenApp,
  queueCount,
}: XpDesktopIconsProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);

  const handleIconClick = (id: string, action: () => void) => {
    setSelectedIcon(id);
    xpAudio.playClickSound();

    // Double tap handling for touch devices
    const now = Date.now();
    if (now - lastTapTime < 350) {
      action();
    }
    setLastTapTime(now);
  };

  const icons = [
    {
      id: "my-computer",
      name: "My Computer",
      icon: <XpIcon name="my-computer" size={34} />,
      action: () => {
        xpAudio.playDingSound();
        onOpenAbout();
      },
    },
    {
      id: "my-documents",
      name: "My Documents",
      icon: <XpIcon name="my-documents" size={34} />,
      action: () => {
        xpAudio.playClickSound();
        onOpenMyPictures();
      },
    },
    {
      id: "my-pictures",
      name: "My Pictures",
      icon: <XpIcon name="my-pictures" size={34} />,
      action: () => {
        xpAudio.playClickSound();
        onOpenMyPictures();
      },
    },
    {
      id: "recycle-bin",
      name: queueCount > 0 ? `Recycle Bin (${queueCount})` : "Recycle Bin",
      icon: <XpIcon name={queueCount > 0 ? "recycle-bin-full" : "recycle-bin-empty"} size={34} />,
      action: () => {
        if (queueCount > 0) {
          if (window.confirm("Are you sure you want to empty the Recycle Bin / Clear all images?")) {
            xpAudio.playRecycleSound();
            onClearQueue();
          }
        } else {
          xpAudio.playDingSound();
          alert("Recycle Bin is empty.");
        }
      },
    },
    {
      id: "webptor",
      name: "webptor.exe",
      icon: <XpIcon name="webptor" size={34} />,
      action: () => {
        xpAudio.playRestoreSound();
        onRestoreMainWindow?.();
      },
    },
    {
      id: "internet-explorer",
      name: "Internet Explorer",
      icon: <XpIcon name="internet-explorer" size={34} />,
      action: () => {
        xpAudio.playClickSound();
        onOpenApp?.("ie");
      },
    },
    {
      id: "paint",
      name: "Paint",
      icon: <XpIcon name="paint" size={34} />,
      action: () => {
        xpAudio.playClickSound();
        onOpenApp?.("paint");
      },
    },
    {
      id: "notepad",
      name: "Notepad",
      icon: <XpIcon name="notepad" size={34} />,
      action: () => {
        xpAudio.playClickSound();
        onOpenApp?.("notepad");
      },
    },
    {
      id: "media-player",
      name: "Windows Media",
      icon: <XpIcon name="media-player" size={34} />,
      action: () => {
        xpAudio.playDingSound();
        onOpenAbout();
      },
    },
    {
      id: "minesweeper",
      name: "Minesweeper",
      icon: <XpIcon name="minesweeper" size={34} />,
      action: () => {
        xpAudio.playClickSound();
        onOpenApp?.("minesweeper");
      },
    },
  ];

  return (
    <div
      className="hidden md:flex flex-col flex-wrap gap-4 fixed top-4 left-4 z-10 select-none max-h-[calc(100vh-60px)] content-start"
      onClick={() => setSelectedIcon(null)}
    >
      {icons.map((item) => {
        const isSelected = selectedIcon === item.id;
        return (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              handleIconClick(item.id, item.action);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              item.action();
            }}
            className="flex flex-col items-center justify-start w-[72px] text-center cursor-pointer group py-1"
          >
            <div
              className={`p-1 rounded-[2px] transition-all flex items-center justify-center ${
                isSelected
                  ? "bg-[#0a246a]/60 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                  : "group-hover:brightness-110 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              }`}
            >
              {item.icon}
            </div>
            <span
              className={`text-[11px] font-sans leading-tight mt-1 px-1 rounded-xs tracking-tight select-none max-w-[72px] break-words ${
                isSelected
                  ? "bg-[#0a246a] text-white border border-dotted border-[#ffeb9c]"
                  : "text-white text-shadow-xp"
              }`}
            >
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
