"use client";

import React, { useState } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

interface XpDesktopIconsProps {
  onOpenMyPictures: () => void;
  onClearQueue: () => void;
  onOpenAbout: () => void;
  queueCount: number;
}

export function XpDesktopIcons({
  onOpenMyPictures,
  onClearQueue,
  onOpenAbout,
  queueCount,
}: XpDesktopIconsProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const handleIconClick = (id: string, sound: boolean = true) => {
    setSelectedIcon(id);
    if (sound) xpAudio.playClickSound();
  };

  const icons = [
    {
      id: "my-computer",
      name: "My Computer",
      icon: <XpIcon name="my-computer" size={36} />,
      onDoubleClick: () => {
        xpAudio.playDingSound();
        onOpenAbout();
      },
    },
    {
      id: "my-pictures",
      name: "My Pictures",
      icon: <XpIcon name="my-pictures" size={36} />,
      onDoubleClick: () => {
        xpAudio.playClickSound();
        onOpenMyPictures();
      },
    },
    {
      id: "my-documents",
      name: "My Documents",
      icon: <XpIcon name="my-documents" size={36} />,
      onDoubleClick: () => {
        xpAudio.playClickSound();
        onOpenMyPictures();
      },
    },
    {
      id: "recycle-bin",
      name: queueCount > 0 ? `Recycle Bin (${queueCount})` : "Recycle Bin",
      icon: <XpIcon name={queueCount > 0 ? "recycle-bin-full" : "recycle-bin-empty"} size={36} />,
      onDoubleClick: () => {
        if (queueCount > 0) {
          if (window.confirm("Are you sure you want to empty the Recycle Bin / Clear all images?")) {
            xpAudio.playClickSound();
            onClearQueue();
          }
        } else {
          xpAudio.playDingSound();
          alert("Recycle Bin is empty.");
        }
      },
    },
    {
      id: "webptor-exe",
      name: "webptor.exe",
      icon: <XpIcon name="webptor" size={36} />,
      onDoubleClick: () => {
        xpAudio.playClickSound();
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    },
    {
      id: "internet-explorer",
      name: "Internet Explorer",
      icon: <XpIcon name="internet-explorer" size={36} />,
      onDoubleClick: () => {
        xpAudio.playDingSound();
        onOpenAbout();
      },
    },
  ];

  return (
    <div
      className="hidden xl:flex flex-col gap-6 fixed top-6 left-6 z-10 select-none"
      onClick={() => setSelectedIcon(null)}
    >
      {icons.map((item) => {
        const isSelected = selectedIcon === item.id;
        return (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              handleIconClick(item.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              item.onDoubleClick();
            }}
            className="flex flex-col items-center justify-center w-20 text-center cursor-pointer group"
          >
            <div
              className={`p-1 rounded-sm transition-all flex items-center justify-center ${
                isSelected
                  ? "bg-[#0a246a]/60 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  : "group-hover:brightness-110 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
              }`}
            >
              {item.icon}
            </div>
            <span
              className={`text-[11px] font-medium leading-tight mt-1 px-1 rounded-xs tracking-tight ${
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
