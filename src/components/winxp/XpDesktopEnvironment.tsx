"use client";

import React, { useState, useCallback, useRef } from "react";
import { ImageFileItem, ConversionOptions } from "@/types";
import { BlissBackground } from "./BlissBackground";
import { XpDesktopIcons } from "./XpDesktopIcons";
import { XpTaskbar } from "./XpTaskbar";
import { XpMenuBar } from "./XpMenuBar";
import { XpExplorerSidebar } from "./XpExplorerSidebar";
import { XpConversionSettings } from "./XpConversionSettings";
import { XpDropzone } from "./XpDropzone";
import { XpFileQueue } from "./XpFileQueue";
import { XpComparisonViewer } from "./XpComparisonViewer";
import { XpAboutModal } from "./XpAboutModal";
import { XpTurnOffModal } from "./XpTurnOffModal";
import { XpRunModal } from "./XpRunModal";
import { XpBalloonNotification } from "./XpBalloonNotification";
import { XpAppModal } from "./XpMiniApps";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

export interface XpDesktopEnvironmentProps {
  items: ImageFileItem[];
  options: ConversionOptions;
  setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
  autoConvert: boolean;
  setAutoConvert: React.Dispatch<React.SetStateAction<boolean>>;
  isConvertingAll: boolean;
  isZipping: boolean;
  zipProgress: number;
  handleFilesSelected: (files: File[]) => void;
  handleConvertAll: () => void;
  handleDownloadAllZip: () => void;
  handleClearAll: () => void;
  handleRemoveItem: (id: string) => void;
  comparingItem: ImageFileItem | null;
  setComparingItem: (item: ImageFileItem | null) => void;
  completedCount: number;
  toggleXpMode: () => void;
}

export function XpDesktopEnvironment({
  items,
  options,
  setOptions,
  autoConvert,
  setAutoConvert,
  isConvertingAll,
  isZipping,
  zipProgress,
  handleFilesSelected,
  handleConvertAll,
  handleDownloadAllZip,
  handleClearAll,
  handleRemoveItem,
  comparingItem,
  setComparingItem,
  completedCount,
  toggleXpMode,
}: XpDesktopEnvironmentProps) {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMainMinimized, setIsMainMinimized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [turnOffModalOpen, setTurnOffModalOpen] = useState(false);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [activeMiniApp, setActiveMiniApp] = useState<"notepad" | "paint" | "minesweeper" | "ie" | null>(null);
  const [showBalloon, setShowBalloon] = useState(true);
  const [selectedQueueItem, setSelectedQueueItem] = useState<ImageFileItem | null>(null);

  // Desktop Rubberband Selection
  const [desktopSelecting, setDesktopSelecting] = useState(false);
  const [selectBox, setSelectBox] = useState({ startX: 0, startY: 0, curX: 0, curY: 0 });

  // Main Window Dragging using direct DOM manipulation for 60fps latency-free dragging
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [windowOffset, setWindowOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ startX: number; startY: number; initialOffsetX: number; initialOffsetY: number } | null>(null);
  const mainWinRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  const xpFileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const openXpFolderPicker = () => {
    xpFileInputRef.current?.click();
  };

  const handleXpFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleToggleMinimizeMain = () => {
    if (isMainMinimized) {
      xpAudio.playRestoreSound();
      setIsMainMinimized(false);
    } else {
      xpAudio.playMinimizeSound();
      setIsMainMinimized(true);
    }
  };

  const handleDesktopMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setDesktopSelecting(true);
      setSelectBox({
        startX: e.clientX,
        startY: e.clientY,
        curX: e.clientX,
        curY: e.clientY,
      });
    }
  };

  const handleDesktopMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (desktopSelecting) {
      setSelectBox((prev) => ({
        ...prev,
        curX: e.clientX,
        curY: e.clientY,
      }));
    }
  };

  const handleDesktopMouseUp = () => {
    if (desktopSelecting) {
      setDesktopSelecting(false);
    }
  };

  const handleTitleBarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isMaximized) return;
      if ((e.target as HTMLElement).closest("button")) return;

      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialOffsetX: currentOffsetRef.current.x,
        initialOffsetY: currentOffsetRef.current.y,
      };
      setIsDraggingWindow(true);

      const onPointerMove = (moveEv: PointerEvent) => {
        if (!dragStartRef.current) return;
        const deltaX = moveEv.clientX - dragStartRef.current.startX;
        const deltaY = moveEv.clientY - dragStartRef.current.startY;
        const nextX = dragStartRef.current.initialOffsetX + deltaX;
        const nextY = Math.max(0, dragStartRef.current.initialOffsetY + deltaY);

        currentOffsetRef.current = { x: nextX, y: nextY };

        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          if (mainWinRef.current) {
            mainWinRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
          }
        });
      };

      const onPointerUp = (upEv: PointerEvent) => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);

        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }

        setWindowOffset(currentOffsetRef.current);
        setIsDraggingWindow(false);
        dragStartRef.current = null;
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    },
    [isMaximized]
  );

  const handleRunCommand = (cmd: string) => {
    setRunModalOpen(false);
    const lower = cmd.trim().toLowerCase();
    if (lower === "notepad") {
      setActiveMiniApp("notepad");
    } else if (lower === "mspaint" || lower === "pbrush" || lower === "paint") {
      setActiveMiniApp("paint");
    } else if (lower === "winmine" || lower === "minesweeper" || lower === "mine") {
      setActiveMiniApp("minesweeper");
    } else if (lower === "ie" || lower === "iexplore" || lower.startsWith("http")) {
      setActiveMiniApp("ie");
    } else if (lower === "modern" || lower === "exit") {
      toggleXpMode();
    } else if (lower === "about" || lower === "system") {
      setAboutModalOpen(true);
    } else {
      xpAudio.playErrorSound();
      alert(`Windows cannot find '${cmd}'. Make sure you typed the name correctly, and then try again.`);
    }
  };

  return (
    <div
      onMouseDown={handleDesktopMouseDown}
      onMouseMove={handleDesktopMouseMove}
      onMouseUp={handleDesktopMouseUp}
      className="fixed inset-0 h-screen w-screen overflow-hidden select-none bg-[#0055ea] font-sans"
    >
      {/* Hidden File Input for XP Actions */}
      <input
        ref={xpFileInputRef}
        type="file"
        multiple
        accept="image/*,.*"
        onChange={handleXpFileInputChange}
        className="hidden"
      />

      {/* Bliss Wallpaper Background */}
      <BlissBackground />

      {/* Marquee Selection Box */}
      {desktopSelecting && (
        <div
          className="xp-select-rect"
          style={{
            left: Math.min(selectBox.startX, selectBox.curX),
            top: Math.min(selectBox.startY, selectBox.curY),
            width: Math.abs(selectBox.curX - selectBox.startX),
            height: Math.abs(selectBox.curY - selectBox.startY),
          }}
        />
      )}

      {/* XP Desktop Icons */}
      <XpDesktopIcons
        onOpenMyPictures={openXpFolderPicker}
        onClearQueue={handleClearAll}
        onOpenAbout={() => setAboutModalOpen(true)}
        onRestoreMainWindow={() => {
          setIsMainMinimized(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenApp={(app) => setActiveMiniApp(app as any)}
        queueCount={items.length}
      />

      {/* Main Application Window (Draggable & Maximizable) */}
      {!isMainMinimized && (
        <div
          ref={mainWinRef}
          className={`z-20 ${
            isDraggingWindow ? "select-none" : "transition-[width,height,top,left] duration-150"
          } ${
            isMaximized
              ? "fixed top-0 left-0 right-0 bottom-[30px] w-full h-[calc(100vh-30px)] rounded-none"
              : "fixed top-2 sm:top-4 left-2 sm:left-[90px] xl:left-[105px] w-[calc(100vw-16px)] sm:w-[calc(100vw-110px)] max-w-[960px] max-h-[calc(100vh-45px)]"
          }`}
          style={
            !isMaximized && (windowOffset.x !== 0 || windowOffset.y !== 0)
              ? {
                  transform: `translate3d(${windowOffset.x}px, ${windowOffset.y}px, 0)`,
                }
              : undefined
          }
        >
          <div className={`xp-window flex flex-col h-full ${isMaximized ? "rounded-none" : "rounded-t-lg"}`}>
            {/* Windows Luna Titlebar */}
            <div
              onPointerDown={handleTitleBarPointerDown}
              className={`xp-titlebar flex items-center justify-between px-2 py-1 select-none touch-none ${
                isMaximized ? "rounded-none" : ""
              } ${isDraggingWindow ? "cursor-grabbing" : isMaximized ? "cursor-default" : "cursor-grab"}`}
            >
              <div className="flex items-center gap-2 pointer-events-none">
                <XpIcon name="webptor" size={17} />
                <span className="text-white font-bold text-xs tracking-wide text-shadow-xp truncate">
                  webptor - Instant Image to WebP Converter v1.0
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="xp-win-btn xp-win-btn-min"
                  title="Minimize"
                  onClick={() => {
                    xpAudio.playMinimizeSound();
                    setIsMainMinimized(true);
                  }}
                >
                  _
                </button>
                <button
                  type="button"
                  className={`xp-win-btn ${isMaximized ? "xp-win-btn-restore" : "xp-win-btn-max"}`}
                  title={isMaximized ? "Restore Window" : "Maximize Window"}
                  onClick={() => {
                    xpAudio.playClickSound();
                    setIsMaximized((prev) => !prev);
                  }}
                >
                  □
                </button>
                <button
                  type="button"
                  className="xp-win-btn xp-win-btn-close"
                  title="Close / Exit XP Mode"
                  onClick={() => {
                    xpAudio.playClickSound();
                    setTurnOffModalOpen(true);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Menu Bar & Navigation Bar */}
            <XpMenuBar
              onOpenFilePicker={openXpFolderPicker}
              onConvertAll={handleConvertAll}
              onDownloadZip={handleDownloadAllZip}
              onClearAll={handleClearAll}
              onOpenAbout={() => setAboutModalOpen(true)}
              onToggleModern={toggleXpMode}
              onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
              sidebarOpen={sidebarOpen}
              hasItems={items.length > 0}
              hasCompleted={completedCount > 0}
            />

            {/* Window Workspace: Left Sidebar + Content Area */}
            <div className="flex-1 flex overflow-hidden bg-white">
              {/* Collapsible Common Tasks Sidebar (Desktop / Tablet) */}
              {sidebarOpen && (
                <XpExplorerSidebar
                  items={items}
                  selectedItem={selectedQueueItem}
                  onOpenFilePicker={openXpFolderPicker}
                  onConvertAll={handleConvertAll}
                  onDownloadZip={handleDownloadAllZip}
                  onClearAll={handleClearAll}
                  onOpenAbout={() => setAboutModalOpen(true)}
                  onCompareItem={(item) => setComparingItem(item)}
                  isConvertingAll={isConvertingAll}
                  className="hidden lg:block border-r border-[#6375d6]"
                />
              )}

              {/* Main Content Workspace */}
              <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-3 bg-[#ece9d8]">
                {/* Image Conversion Settings */}
                <XpConversionSettings
                  options={options}
                  onChange={setOptions}
                  autoConvert={autoConvert}
                  onAutoConvertChange={setAutoConvert}
                  disabled={isConvertingAll}
                />

                {/* Dropzone */}
                <XpDropzone
                  onFilesSelected={handleFilesSelected}
                  disabled={isConvertingAll}
                />

                {/* Queue List */}
                <div ref={resultsRef}>
                  <XpFileQueue
                    items={items}
                    isConvertingAll={isConvertingAll}
                    isZipping={isZipping}
                    zipProgress={zipProgress}
                    onConvertAll={handleConvertAll}
                    onDownloadAllZip={handleDownloadAllZip}
                    onClearAll={handleClearAll}
                    onRemoveItem={handleRemoveItem}
                    onCompareItem={setComparingItem}
                    onSelectItem={(item) => setSelectedQueueItem(item)}
                    selectedItemId={selectedQueueItem?.id}
                  />
                </div>
              </div>
            </div>

            {/* Window Status Bar */}
            <div className="bg-[#ece9d8] border-t border-[#d4d0c8] px-3 py-1 text-[11px] font-sans flex items-center justify-between text-gray-700 select-none flex-shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span>
                  {items.length === 0
                    ? "Ready"
                    : isConvertingAll
                    ? "Converting images..."
                    : `${items.length} item(s) in queue (${completedCount} completed)`}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 text-gray-500 text-[10px]">
                <span>100% Client-side Processing</span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <span>🔒</span> Local Intranet
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yellow Balloon Notification on Desktop Startup */}
      {showBalloon && (
        <XpBalloonNotification
          title="webptor WebP Converter"
          message="100% Client-side image processing active. Drag and drop pictures anywhere to convert!"
          onClose={() => setShowBalloon(false)}
          autoCloseMs={8000}
        />
      )}

      {/* XP Taskbar */}
      <XpTaskbar
        onOpenFilePicker={openXpFolderPicker}
        onOpenAbout={() => setAboutModalOpen(true)}
        onToggleModern={toggleXpMode}
        onOpenRun={() => setRunModalOpen(true)}
        onOpenTurnOff={() => setTurnOffModalOpen(true)}
        onOpenApp={(app) => setActiveMiniApp(app as any)}
        queueCount={items.length}
        isMainMinimized={isMainMinimized}
        onToggleMinimizeMain={handleToggleMinimizeMain}
        isAboutOpen={aboutModalOpen}
        onToggleAboutWindow={() => setAboutModalOpen((prev) => !prev)}
        isComparingOpen={!!comparingItem}
        onToggleComparingWindow={() => setComparingItem(null)}
        isRunOpen={runModalOpen}
        onToggleRunWindow={() => setRunModalOpen((prev) => !prev)}
      />

      {/* Windows Picture and Fax Viewer Modal (Comparison) */}
      {comparingItem && (
        <XpComparisonViewer
          item={comparingItem}
          onClose={() => setComparingItem(null)}
        />
      )}

      {/* System Properties / About Modal */}
      {aboutModalOpen && (
        <XpAboutModal onClose={() => setAboutModalOpen(false)} />
      )}

      {/* Run Modal */}
      {runModalOpen && (
        <XpRunModal
          onClose={() => setRunModalOpen(false)}
          onExecute={handleRunCommand}
        />
      )}

      {/* Turn Off Computer Dialog with Grayscale Fade */}
      {turnOffModalOpen && (
        <XpTurnOffModal
          onClose={() => setTurnOffModalOpen(false)}
          onTurnOff={() => {
            setTurnOffModalOpen(false);
            toggleXpMode();
          }}
        />
      )}

      {/* Nostalgic Mini Applications (Paint, Notepad, Minesweeper, IE) */}
      {activeMiniApp && (
        <XpAppModal
          app={activeMiniApp}
          onClose={() => setActiveMiniApp(null)}
        />
      )}
    </div>
  );
}