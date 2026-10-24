"use client";

import React, { useState, useRef, useEffect } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";
import { XpMinesweeper } from "./XpMinesweeper";

interface XpAppModalProps {
  app: "notepad" | "paint" | "minesweeper" | "ie";
  onClose: () => void;
}

export function XpAppModal({ app, onClose }: XpAppModalProps) {
  useEffect(() => {
    xpAudio.playClickSound();
  }, []);

  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".xp-win-btn")) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = posRef.current.x;
    const originY = posRef.current.y;
    let latestX = originX;
    let latestY = originY;
    let rafId: number | null = null;

    if (modalRef.current) {
      modalRef.current.style.transition = "none";
      modalRef.current.style.willChange = "transform";
    }

    const onPointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      latestX = originX + dx;
      latestY = originY + dy;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (modalRef.current) {
            modalRef.current.style.transform = `translate3d(${latestX}px, ${latestY}px, 0)`;
          }
          rafId = null;
        });
      }
    };

    const onPointerUp = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      posRef.current = { x: latestX, y: latestY };
      setModalPos({ x: latestX, y: latestY });
      if (modalRef.current) {
        modalRef.current.style.willChange = "auto";
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
  };

  if (app === "minesweeper") {
    return <XpMinesweeper onClose={onClose} />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 select-none text-[12px] font-sans"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        style={{
          transform:
            modalPos.x !== 0 || modalPos.y !== 0
              ? `translate3d(${modalPos.x}px, ${modalPos.y}px, 0)`
              : undefined,
        }}
        className="w-full max-w-2xl bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {app === "notepad" && <NotepadApp onClose={onClose} onDragTitle={handlePointerDown} />}
        {app === "paint" && <PaintApp onClose={onClose} onDragTitle={handlePointerDown} />}
        {app === "ie" && <InternetExplorerApp onClose={onClose} onDragTitle={handlePointerDown} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. Classic Windows XP Notepad
// ----------------------------------------------------------------------
function NotepadApp({
  onClose,
  onDragTitle,
}: {
  onClose: () => void;
  onDragTitle?: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const [content, setContent] = useState(
    "webptor - WebP Image Converter for Windows XP\n" +
    "===============================================\n\n" +
    "Features:\n" +
    "- Instant client-side WebP conversion\n" +
    "- Full batch ZIP archive generation\n" +
    "- High quality lossless & lossy settings\n" +
    "- 100% private: images never leave your browser\n\n" +
    "Enjoy your stay in Windows XP!"
  );

  return (
    <div className="flex flex-col h-[480px]">
      {/* Titlebar */}
      <div
        onPointerDown={onDragTitle}
        className="xp-titlebar flex items-center justify-between px-2 py-1 select-none flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="flex items-center gap-2">
          <XpIcon name="notepad" size={16} />
          <span className="text-white font-bold text-xs tracking-wide text-shadow-xp">
            Untitled - Notepad
          </span>
        </div>
        <button
          type="button"
          className="xp-win-btn xp-win-btn-close"
          title="Close"
          onClick={() => {
            xpAudio.playClickSound();
            onClose();
          }}
        >
          ✕
        </button>
      </div>

      {/* Menu bar */}
      <div className="flex items-center gap-3 px-2 py-0.5 bg-[#ece9d8] border-b border-[#d4d0c8] text-[11px] text-black">
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">F</span>ile
        </span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">E</span>dit
        </span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          F<span className="underline">o</span>rmat
        </span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">V</span>iew
        </span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">H</span>elp
        </span>
      </div>

      {/* TextArea Workspace */}
      <div className="flex-1 p-0.5 bg-white">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-2 font-mono text-xs text-black border-none resize-none focus:outline-none"
          style={{ fontFamily: "'Lucida Console', 'Courier New', monospace" }}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-[#ece9d8] border-t border-[#d4d0c8] px-3 py-0.5 text-[10px] text-gray-700 flex justify-between select-none">
        <span>Windows (CRLF)</span>
        <span>Ln 1, Col 1</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. Classic Windows XP Paint
// ----------------------------------------------------------------------
function PaintApp({
  onClose,
  onDragTitle,
}: {
  onClose: () => void;
  onDragTitle?: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  const colors = [
    "#000000", "#787878", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4",
    "#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    xpAudio.playRecycleSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col h-[520px]">
      {/* Titlebar */}
      <div
        onPointerDown={onDragTitle}
        className="xp-titlebar flex items-center justify-between px-2 py-1 select-none flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="flex items-center gap-2">
          <XpIcon name="paint" size={16} />
          <span className="text-white font-bold text-xs tracking-wide text-shadow-xp">
            untitled - Paint
          </span>
        </div>
        <button
          type="button"
          className="xp-win-btn xp-win-btn-close"
          title="Close"
          onClick={() => {
            xpAudio.playClickSound();
            onClose();
          }}
        >
          ✕
        </button>
      </div>

      {/* Menu bar */}
      <div className="flex items-center gap-3 px-2 py-0.5 bg-[#ece9d8] border-b border-[#d4d0c8] text-[11px] text-black">
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">F</span>ile
        </span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">E</span>dit
        </span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">V</span>iew
        </span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">I</span>mage
        </span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">
          <span className="underline">H</span>elp
        </span>
      </div>

      {/* Paint Tools & Canvas */}
      <div className="flex-1 flex overflow-hidden p-1.5 gap-2 bg-[#ece9d8]">
        {/* Tool palette sidebar */}
        <div className="w-14 flex flex-col gap-1.5 bg-[#ece9d8] border border-[#7f9db9] p-1 items-center">
          <button
            type="button"
            onClick={() => setBrushSize(2)}
            className={`w-10 h-7 text-[10px] border flex items-center justify-center font-bold ${
              brushSize === 2 ? "bg-[#fff] border-[#0055ea]" : "bg-[#ece9d8] border-[#999]"
            }`}
          >
            ✏️ Fine
          </button>
          <button
            type="button"
            onClick={() => setBrushSize(6)}
            className={`w-10 h-7 text-[10px] border flex items-center justify-center font-bold ${
              brushSize === 6 ? "bg-[#fff] border-[#0055ea]" : "bg-[#ece9d8] border-[#999]"
            }`}
          >
            🖌️ Med
          </button>
          <button
            type="button"
            onClick={() => setBrushSize(14)}
            className={`w-10 h-7 text-[10px] border flex items-center justify-center font-bold ${
              brushSize === 14 ? "bg-[#fff] border-[#0055ea]" : "bg-[#ece9d8] border-[#999]"
            }`}
          >
            🖍️ Bold
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="w-10 h-7 text-[10px] border border-[#999] bg-[#ece9d8] hover:bg-white flex items-center justify-center mt-auto"
            title="Clear canvas"
          >
            🧹 Clear
          </button>
        </div>

        {/* Canvas container */}
        <div className="flex-1 bg-[#808080] p-3 flex items-center justify-center overflow-auto">
          <canvas
            ref={canvasRef}
            width={540}
            height={360}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
            className="bg-white shadow-md cursor-crosshair max-w-full h-auto"
          />
        </div>
      </div>

      {/* Color Palette Strip */}
      <div className="bg-[#ece9d8] border-t border-[#d4d0c8] p-2 flex items-center gap-3">
        {/* Active Color Preview */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-6 h-6 border-2 border-black rounded-[2px]"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Color Palette Boxes */}
        <div className="grid grid-rows-2 grid-flow-col gap-1">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                xpAudio.playClickSound();
                setColor(c);
              }}
              className={`w-4 h-4 border border-black/60 rounded-[1px] ${
                color === c ? "ring-2 ring-black ring-offset-1" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Retro Internet Explorer 6 Window
// ----------------------------------------------------------------------
function InternetExplorerApp({
  onClose,
  onDragTitle,
}: {
  onClose: () => void;
  onDragTitle?: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="flex flex-col h-[520px]">
      {/* Titlebar */}
      <div
        onPointerDown={onDragTitle}
        className="xp-titlebar flex items-center justify-between px-2 py-1 select-none flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="flex items-center gap-2">
          <XpIcon name="internet-explorer" size={16} />
          <span className="text-white font-bold text-xs tracking-wide text-shadow-xp truncate">
            webptor - Microsoft Internet Explorer
          </span>
        </div>
        <button
          type="button"
          className="xp-win-btn xp-win-btn-close"
          title="Close"
          onClick={() => {
            xpAudio.playClickSound();
            onClose();
          }}
        >
          ✕
        </button>
      </div>

      {/* Menu bar */}
      <div className="flex items-center gap-3 px-2 py-0.5 bg-[#ece9d8] border-b border-[#d4d0c8] text-[11px] text-black">
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">File</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">Edit</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">View</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">Favorites</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">Tools</span>
        <span className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded-[1px] cursor-pointer">Help</span>
      </div>

      {/* Address Bar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-[#ece9d8] border-b border-[#d4d0c8]">
        <span className="text-[11px] text-[#555] font-medium">Address</span>
        <div className="flex-1 flex items-center bg-white border border-[#7f9db9] rounded-[1px] px-1.5 py-0.5 shadow-inner">
          <XpIcon name="internet-explorer" size={14} className="mr-1.5" />
          <span className="text-[11px] font-sans text-black select-text">
            http://www.webptor.com/welcome.htm
          </span>
        </div>
        <button
          type="button"
          onClick={() => xpAudio.playClickSound()}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-gradient-to-b from-[#65c832] to-[#3a8b13] border border-[#265e0d] text-white text-[11px] font-bold shadow-xs hover:brightness-110"
        >
          <span>Go</span>
        </button>
      </div>

      {/* Web Content Area */}
      <div className="flex-1 bg-white p-4 overflow-y-auto text-black font-sans">
        <div className="max-w-lg mx-auto text-center space-y-4 py-6">
          <div className="flex items-center justify-center gap-2">
            <XpIcon name="webptor" size={48} />
          </div>

          <h2 className="text-xl font-bold text-[#003399]">
            Welcome to webptor Image Converter
          </h2>

          <p className="text-xs text-gray-700 leading-relaxed">
            The ultra-fast client-side image converter designed for the modern web with the timeless nostalgia of Windows XP.
          </p>

          <div className="p-3 bg-[#eef4ff] border border-[#b4d2ff] rounded text-left text-xs space-y-1.5">
            <h4 className="font-bold text-[#003399]">Did you know?</h4>
            <p className="text-gray-600">
              WebP creates images that are on average <strong>26% smaller</strong> than PNGs and <strong>25-34% smaller</strong> than comparable JPEGs without compromising visual quality.
            </p>
          </div>

          <div className="text-[11px] text-gray-500 pt-4 border-t border-gray-200">
            Microsoft Internet Explorer 6.0 (Enhanced for webptor)
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#ece9d8] border-t border-[#d4d0c8] px-3 py-0.5 text-[10px] text-gray-700 flex justify-between select-none">
        <span className="flex items-center gap-1">
          <span>✔️</span> Done
        </span>
        <span>Local intranet</span>
      </div>
    </div>
  );
}
