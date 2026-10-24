"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { XpIcon } from "./XpIcon";
import { xpAudio } from "@/lib/xp-sound";

// ==========================================
// Types
// ==========================================
type Difficulty = "beginner" | "intermediate" | "expert" | "custom";
type CellState = "hidden" | "flagged" | "question";
type GameStatus = "idle" | "playing" | "won" | "lost";

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  state: CellState;
  count: number;
  exploded?: boolean;
  misplaced?: boolean;
}

interface BestScore {
  time: number;
  name: string;
}

interface BestScores {
  beginner: BestScore;
  intermediate: BestScore;
  expert: BestScore;
}

const DEFAULT_SCORES: BestScores = {
  beginner: { time: 999, name: "Anonymous" },
  intermediate: { time: 999, name: "Anonymous" },
  expert: { time: 999, name: "Anonymous" },
};

const DIFFICULTY_CONFIG = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

// ==========================================
// 7-Segment LED Digit Display Component
// ==========================================
function SevenSegmentDigit({ char }: { char: string }) {
  // Segments: [a, b, c, d, e, f, g]
  //   a
  // f   b
  //   g
  // e   c
  //   d
  const segmentMap: Record<string, boolean[]> = {
    "0": [true, true, true, true, true, true, false],
    "1": [false, true, true, false, false, false, false],
    "2": [true, true, false, true, true, false, true],
    "3": [true, true, true, true, false, false, true],
    "4": [false, true, true, false, false, true, true],
    "5": [true, false, true, true, false, true, true],
    "6": [true, false, true, true, true, true, true],
    "7": [true, true, true, false, false, false, false],
    "8": [true, true, true, true, true, true, true],
    "9": [true, true, true, true, false, true, true],
    "-": [false, false, false, false, false, false, true],
    " ": [false, false, false, false, false, false, false],
  };

  const active = segmentMap[char] || segmentMap[" "];

  return (
    <svg
      width="13"
      height="23"
      viewBox="0 0 13 23"
      className="inline-block"
      style={{ shapeRendering: "crispEdges" }}
    >
      {/* Background container */}
      <rect width="13" height="23" fill="#000000" />

      {/* Segment a (top) */}
      <polygon
        points="2,1 11,1 9.5,3 3.5,3"
        fill={active[0] ? "#ff0000" : "#320000"}
      />
      {/* Segment b (top-right) */}
      <polygon
        points="12,2 12,11 10,9.5 10,3.5"
        fill={active[1] ? "#ff0000" : "#320000"}
      />
      {/* Segment c (bottom-right) */}
      <polygon
        points="12,12 12,21 10,19.5 10,13.5"
        fill={active[2] ? "#ff0000" : "#320000"}
      />
      {/* Segment d (bottom) */}
      <polygon
        points="2,22 11,22 9.5,20 3.5,20"
        fill={active[3] ? "#ff0000" : "#320000"}
      />
      {/* Segment e (bottom-left) */}
      <polygon
        points="1,12 1,21 3,19.5 3,13.5"
        fill={active[4] ? "#ff0000" : "#320000"}
      />
      {/* Segment f (top-left) */}
      <polygon
        points="1,2 1,11 3,9.5 3,3.5"
        fill={active[5] ? "#ff0000" : "#320000"}
      />
      {/* Segment g (middle) */}
      <polygon
        points="2.5,11.5 10.5,11.5 9,13 4,13"
        fill={active[6] ? "#ff0000" : "#320000"}
      />
    </svg>
  );
}

function SevenSegmentDisplay({ value }: { value: number }) {
  // Clamp value between -99 and 999
  const clamped = Math.max(-99, Math.min(999, value));
  let str: string;

  if (clamped < 0) {
    const absStr = Math.abs(clamped).toString().padStart(2, "0");
    str = `-${absStr}`;
  } else {
    str = clamped.toString().padStart(3, "0");
  }

  return (
    <div className="bg-black p-[2px] border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white inline-flex gap-[1px]">
      <SevenSegmentDigit char={str[0]} />
      <SevenSegmentDigit char={str[1]} />
      <SevenSegmentDigit char={str[2]} />
    </div>
  );
}

// ==========================================
// Main Minesweeper Component
// ==========================================
interface XpMinesweeperProps {
  onClose: () => void;
}

export function XpMinesweeper({ onClose }: XpMinesweeperProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [rows, setRows] = useState<number>(9);
  const [cols, setCols] = useState<number>(9);
  const [totalMines, setTotalMines] = useState<number>(10);

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [flagCount, setFlagCount] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isMouseDownOnBoard, setIsMouseDownOnBoard] = useState<boolean>(false);
  const [isSmileyPressed, setIsSmileyPressed] = useState<boolean>(false);

  // Settings
  const [marksEnabled, setMarksEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Menus and Dialogs
  const [openMenu, setOpenMenu] = useState<"game" | "help" | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState<boolean>(false);
  const [customRows, setCustomRows] = useState<number>(9);
  const [customCols, setCustomCols] = useState<number>(9);
  const [customMines, setCustomMines] = useState<number>(10);
  const [bestScoresOpen, setBestScoresOpen] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [newRecordModalOpen, setNewRecordModalOpen] = useState<boolean>(false);
  const [recordWinnerName, setRecordWinnerName] = useState<string>("");

  const [bestScores, setBestScores] = useState<BestScores>(DEFAULT_SCORES);

  // Window Dragging
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const winRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load best scores from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("minesweeper_scores");
      if (stored) {
        setBestScores(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Save best scores
  const saveScores = (newScores: BestScores) => {
    setBestScores(newScores);
    try {
      localStorage.setItem("minesweeper_scores", JSON.stringify(newScores));
    } catch {}
  };

  // Reset Best Scores
  const handleResetScores = () => {
    saveScores(DEFAULT_SCORES);
  };

  // Generate blank board
  const createBlankGrid = useCallback((rCount: number, cCount: number): Cell[][] => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rCount; r++) {
      newGrid[r] = [];
      for (let c = 0; c < cCount; c++) {
        newGrid[r][c] = {
          r,
          c,
          isMine: false,
          revealed: false,
          state: "hidden",
          count: 0,
        };
      }
    }
    return newGrid;
  }, []);

  // Initialize or reset game
  const resetGame = useCallback(
    (newDiff?: Difficulty, r?: number, c?: number, m?: number) => {
      const diff = newDiff || difficulty;
      let rCount = r ?? rows;
      let cCount = c ?? cols;
      let mCount = m ?? totalMines;

      if (diff === "beginner") {
        rCount = DIFFICULTY_CONFIG.beginner.rows;
        cCount = DIFFICULTY_CONFIG.beginner.cols;
        mCount = DIFFICULTY_CONFIG.beginner.mines;
      } else if (diff === "intermediate") {
        rCount = DIFFICULTY_CONFIG.intermediate.rows;
        cCount = DIFFICULTY_CONFIG.intermediate.cols;
        mCount = DIFFICULTY_CONFIG.intermediate.mines;
      } else if (diff === "expert") {
        rCount = DIFFICULTY_CONFIG.expert.rows;
        cCount = DIFFICULTY_CONFIG.expert.cols;
        mCount = DIFFICULTY_CONFIG.expert.mines;
      }

      setDifficulty(diff);
      setRows(rCount);
      setCols(cCount);
      setTotalMines(mCount);
      setFlagCount(0);
      setTimer(0);
      setGameStatus("idle");
      setIsMouseDownOnBoard(false);
      setOpenMenu(null);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setGrid(createBlankGrid(rCount, cCount));
    },
    [difficulty, rows, cols, totalMines, createBlankGrid]
  );

  useEffect(() => {
    resetGame("beginner");
  }, []);

  // Stop timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Timer runner
  useEffect(() => {
    if (gameStatus === "playing") {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => Math.min(999, prev + 1));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameStatus]);

  // Place mines ensuring the first clicked cell (and surroundings) is safe
  const populateMines = (
    firstR: number,
    firstC: number,
    currentGrid: Cell[][]
  ): Cell[][] => {
    const updated = currentGrid.map((row) => row.map((cell) => ({ ...cell })));
    let placed = 0;

    // Forbidden positions: clicked cell and all 8 neighbors
    const forbidden = new Set<string>();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = firstR + dr;
        const nc = firstC + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          forbidden.add(`${nr},${nc}`);
        }
      }
    }

    // Place mines randomly
    while (placed < totalMines) {
      const rr = Math.floor(Math.random() * rows);
      const cc = Math.floor(Math.random() * cols);
      const key = `${rr},${cc}`;

      // In small boards if forbidden excludes too many, relax neighbor restriction
      const isForbidden =
        rows * cols - forbidden.size >= totalMines
          ? forbidden.has(key)
          : rr === firstR && cc === firstC;

      if (!updated[rr][cc].isMine && !isForbidden) {
        updated[rr][cc].isMine = true;
        placed++;
      }
    }

    // Compute neighbor counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!updated[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                updated[nr][nc].isMine
              ) {
                count++;
              }
            }
          }
          updated[r][c].count = count;
        }
      }
    }

    return updated;
  };

  // Check victory condition
  const checkWin = (currGrid: Cell[][]) => {
    let unrevealedSafe = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!currGrid[r][c].isMine && !currGrid[r][c].revealed) {
          unrevealedSafe++;
        }
      }
    }

    if (unrevealedSafe === 0) {
      if (soundEnabled) xpAudio.playDingSound();
      setGameStatus("won");

      // Flag all remaining mines
      setGrid((prev) =>
        prev.map((row) =>
          row.map((cell) => (cell.isMine ? { ...cell, state: "flagged" } : cell))
        )
      );
      setFlagCount(totalMines);

      // Check high score
      if (
        difficulty in DEFAULT_SCORES &&
        timer < bestScores[difficulty as keyof BestScores].time
      ) {
        setRecordWinnerName("");
        setNewRecordModalOpen(true);
      }
    }
  };

  // Handle cell left-click / reveal
  const handleCellClick = (r: number, c: number) => {
    if (gameStatus === "won" || gameStatus === "lost") return;

    let activeGrid = grid;

    // First click: generate mines
    if (gameStatus === "idle") {
      activeGrid = populateMines(r, c, grid);
      setGameStatus("playing");
    }

    const target = activeGrid[r][c];
    if (target.revealed || target.state === "flagged") return;

    // Stepped on mine!
    if (target.isMine) {
      if (soundEnabled) xpAudio.playErrorSound();
      setGameStatus("lost");

      // Reveal all mines and mark misflags
      const lostGrid = activeGrid.map((row) =>
        row.map((cell) => {
          if (cell.r === r && cell.c === c) {
            return { ...cell, revealed: true, exploded: true };
          }
          if (cell.isMine && cell.state !== "flagged") {
            return { ...cell, revealed: true };
          }
          if (!cell.isMine && cell.state === "flagged") {
            return { ...cell, revealed: true, misplaced: true };
          }
          return cell;
        })
      );
      setGrid(lostGrid);
      return;
    }

    // Safe reveal with recursive flood-fill
    if (soundEnabled) xpAudio.playClickSound();

    const nextGrid = activeGrid.map((row) => row.map((cell) => ({ ...cell })));

    const flood = (cr: number, cc: number) => {
      if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) return;
      const cur = nextGrid[cr][cc];
      if (cur.revealed || cur.state === "flagged" || cur.isMine) return;
      cur.revealed = true;
      if (cur.count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            flood(cr + dr, cc + dc);
          }
        }
      }
    };

    flood(r, c);
    setGrid(nextGrid);
    checkWin(nextGrid);
  };

  // Handle cell right-click (flagging / question mark)
  const handleCellContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameStatus === "won" || gameStatus === "lost") return;

    const cell = grid[r][c];
    if (cell.revealed) return;

    let nextState: CellState = "hidden";
    let deltaFlag = 0;

    if (cell.state === "hidden") {
      nextState = "flagged";
      deltaFlag = 1;
    } else if (cell.state === "flagged") {
      if (marksEnabled) {
        nextState = "question";
      } else {
        nextState = "hidden";
      }
      deltaFlag = -1;
    } else if (cell.state === "question") {
      nextState = "hidden";
    }

    if (soundEnabled) xpAudio.playClickSound();

    setFlagCount((prev) => prev + deltaFlag);
    setGrid((prev) =>
      prev.map((row, ri) =>
        row.map((cl, ci) =>
          ri === r && ci === c ? { ...cl, state: nextState } : cl
        )
      )
    );
  };

  // Chording: Double click or middle click or left+right click on revealed number
  const handleChord = (r: number, c: number) => {
    if (gameStatus !== "playing") return;
    const center = grid[r][c];
    if (!center.revealed || center.count === 0) return;

    // Count flagged neighbors
    let flagCountAround = 0;
    const neighbors: { r: number; c: number }[] = [];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors.push({ r: nr, c: nc });
          if (grid[nr][nc].state === "flagged") {
            flagCountAround++;
          }
        }
      }
    }

    // If flags match the number, reveal all other unflagged neighbors!
    if (flagCountAround === center.count) {
      let hitMine = false;
      let explodingR = -1;
      let explodingC = -1;

      for (const n of neighbors) {
        const cell = grid[n.r][n.c];
        if (cell.state !== "flagged" && cell.isMine) {
          hitMine = true;
          explodingR = n.r;
          explodingC = n.c;
          break;
        }
      }

      if (hitMine) {
        if (soundEnabled) xpAudio.playErrorSound();
        setGameStatus("lost");
        setGrid((prev) =>
          prev.map((row) =>
            row.map((cell) => {
              if (cell.r === explodingR && cell.c === explodingC) {
                return { ...cell, revealed: true, exploded: true };
              }
              if (cell.isMine && cell.state !== "flagged") {
                return { ...cell, revealed: true };
              }
              if (!cell.isMine && cell.state === "flagged") {
                return { ...cell, revealed: true, misplaced: true };
              }
              return cell;
            })
          )
        );
        return;
      }

      // Safe chord: flood-fill all unflagged neighbors
      if (soundEnabled) xpAudio.playClickSound();

      const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
      const flood = (cr: number, cc: number) => {
        if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) return;
        const cur = nextGrid[cr][cc];
        if (cur.revealed || cur.state === "flagged" || cur.isMine) return;
        cur.revealed = true;
        if (cur.count === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              flood(cr + dr, cc + dc);
            }
          }
        }
      };

      for (const n of neighbors) {
        if (nextGrid[n.r][n.c].state !== "flagged") {
          flood(n.r, n.c);
        }
      }

      setGrid(nextGrid);
      checkWin(nextGrid);
    }
  };

  // Save new high score record
  const handleSaveRecord = () => {
    if (difficulty in DEFAULT_SCORES) {
      const diffKey = difficulty as keyof BestScores;
      const updatedScores = {
        ...bestScores,
        [diffKey]: {
          time: timer,
          name: recordWinnerName.trim() || "Anonymous",
        },
      };
      saveScores(updatedScores);
    }
    setNewRecordModalOpen(false);
    setBestScoresOpen(true);
  };

  // Draggable Title Bar logic
  const handlePointerDownTitleBar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".xp-win-btn")) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...windowPos };

    setIsDragging(true);
    document.body.style.userSelect = "none";

    const onPointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setWindowPos({
        x: initialPos.x + dx,
        y: initialPos.y + dy,
      });
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      setIsDragging(false);
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // Close menus when clicking anywhere
  const handleBackdropClick = () => {
    if (openMenu) setOpenMenu(null);
  };

  // Color lookup for revealed number count
  const getNumberColor = (count: number) => {
    switch (count) {
      case 1:
        return "#0000ff"; // Blue
      case 2:
        return "#008000"; // Green
      case 3:
        return "#ff0000"; // Red
      case 4:
        return "#000080"; // Navy
      case 5:
        return "#800000"; // Maroon
      case 6:
        return "#008080"; // Teal
      case 7:
        return "#000000"; // Black
      case 8:
        return "#808080"; // Gray
      default:
        return "#000000";
    }
  };

  // Smiley icon status
  const getSmileyFace = () => {
    if (isSmileyPressed) return "😮";
    if (gameStatus === "lost") return "😵";
    if (gameStatus === "won") return "😎";
    if (isMouseDownOnBoard) return "😮";
    return "🙂";
  };

  const remainingMines = totalMines - flagCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 select-none text-[12px] font-sans"
      onClick={handleBackdropClick}
    >
      <div
        ref={winRef}
        style={{
          transform:
            windowPos.x !== 0 || windowPos.y !== 0
              ? `translate3d(${windowPos.x}px, ${windowPos.y}px, 0)`
              : undefined,
        }}
        className={`bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-lg shadow-2xl flex flex-col select-none overflow-visible ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Windows Luna Titlebar */}
        <div
          onPointerDown={handlePointerDownTitleBar}
          className="xp-titlebar flex items-center justify-between px-2 py-1 select-none flex-shrink-0 cursor-grab active:cursor-grabbing rounded-t-[6px]"
        >
          <div className="flex items-center gap-1.5 pointer-events-none">
            <XpIcon name="minesweeper" size={16} />
            <span className="text-white font-bold text-xs tracking-wide text-shadow-xp">
              Minesweeper
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="xp-win-btn xp-win-btn-close"
              title="Close"
              onClick={() => {
                if (soundEnabled) xpAudio.playClickSound();
                onClose();
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Windows XP Classic Menu Bar */}
        <div className="relative flex items-center gap-1 px-1 py-0.5 bg-[#ece9d8] border-b border-[#d4d0c8] text-[11px] text-black">
          {/* Game Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === "game" ? null : "game");
              }}
              className={`px-1.5 py-0.5 rounded-[1px] hover:bg-[#316ac5] hover:text-white cursor-pointer ${
                openMenu === "game" ? "bg-[#316ac5] text-white" : ""
              }`}
            >
              <span className="underline">G</span>ame
            </button>

            {openMenu === "game" && (
              <div
                className="absolute left-0 top-full mt-[1px] w-48 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-md py-1 z-50 text-[11px] text-black font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => resetGame()}
                  className="w-full px-4 py-1 text-left flex justify-between items-center hover:bg-[#316ac5] hover:text-white"
                >
                  <span>
                    <span className="underline">N</span>ew
                  </span>
                  <span className="text-[10px] text-gray-500 hover:text-white">F2</span>
                </button>
                <div className="h-[1px] bg-[#d4d0c8] my-1 mx-1 border-b border-white" />

                <button
                  type="button"
                  onClick={() => resetGame("beginner")}
                  className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="w-3 text-center">{difficulty === "beginner" ? "✓" : ""}</span>
                  <span>
                    <span className="underline">B</span>eginner
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => resetGame("intermediate")}
                  className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="w-3 text-center">{difficulty === "intermediate" ? "✓" : ""}</span>
                  <span>
                    <span className="underline">I</span>ntermediate
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => resetGame("expert")}
                  className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="w-3 text-center">{difficulty === "expert" ? "✓" : ""}</span>
                  <span>
                    <span className="underline">E</span>xpert
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    setCustomRows(rows);
                    setCustomCols(cols);
                    setCustomMines(totalMines);
                    setCustomModalOpen(true);
                  }}
                  className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="w-3 text-center">{difficulty === "custom" ? "✓" : ""}</span>
                  <span>
                    <span className="underline">C</span>ustom...
                  </span>
                </button>

                <div className="h-[1px] bg-[#d4d0c8] my-1 mx-1 border-b border-white" />

                <button
                  type="button"
                  onClick={() => {
                    setMarksEnabled((prev) => !prev);
                    setOpenMenu(null);
                  }}
                  className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="w-3 text-center">{marksEnabled ? "✓" : ""}</span>
                  <span>
                    <span className="underline">M</span>arks (?)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSoundEnabled((prev) => !prev);
                    setOpenMenu(null);
                  }}
                  className="w-full px-4 py-1 text-left flex items-center gap-2 hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="w-3 text-center">{soundEnabled ? "✓" : ""}</span>
                  <span>
                    <span className="underline">S</span>ound
                  </span>
                </button>

                <div className="h-[1px] bg-[#d4d0c8] my-1 mx-1 border-b border-white" />

                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    setBestScoresOpen(true);
                  }}
                  className="w-full px-4 py-1 text-left hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="ml-5">
                    <span className="underline">B</span>est Times...
                  </span>
                </button>

                <div className="h-[1px] bg-[#d4d0c8] my-1 mx-1 border-b border-white" />

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-1 text-left hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="ml-5">
                    E<span className="underline">x</span>it
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === "help" ? null : "help");
              }}
              className={`px-1.5 py-0.5 rounded-[1px] hover:bg-[#316ac5] hover:text-white cursor-pointer ${
                openMenu === "help" ? "bg-[#316ac5] text-white" : ""
              }`}
            >
              <span className="underline">H</span>elp
            </button>

            {openMenu === "help" && (
              <div
                className="absolute left-0 top-full mt-[1px] w-44 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] shadow-md py-1 z-50 text-[11px] text-black"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    setAboutOpen(true);
                  }}
                  className="w-full px-4 py-1 text-left hover:bg-[#316ac5] hover:text-white"
                >
                  <span className="underline">A</span>bout Minesweeper...
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Minesweeper Playfield Area (Gray Bevel Box) */}
        <div className="p-3 bg-[#c0c0c0] border-3 border-t-white border-l-white border-b-[#808080] border-r-[#808080] m-1 overflow-auto max-h-[80vh] flex flex-col items-center">
          {/* Top Scoreboard */}
          <div className="w-full flex items-center justify-between px-2 py-1 bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white mb-2 select-none">
            {/* Mines Left Counter (3 Digits) */}
            <SevenSegmentDisplay value={remainingMines} />

            {/* Classic Yellow Smiley Face Button */}
            <button
              type="button"
              onMouseDown={() => setIsSmileyPressed(true)}
              onMouseUp={() => setIsSmileyPressed(false)}
              onMouseLeave={() => setIsSmileyPressed(false)}
              onClick={() => resetGame()}
              className={`w-7 h-7 bg-[#c0c0c0] flex items-center justify-center text-base cursor-pointer select-none active:scale-95 ${
                isSmileyPressed
                  ? "border border-[#808080]"
                  : "border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080]"
              }`}
              title="Click to restart"
            >
              <span className="leading-none select-none">{getSmileyFace()}</span>
            </button>

            {/* Timer Counter (3 Digits) */}
            <SevenSegmentDisplay value={timer} />
          </div>

          {/* Minefield Grid */}
          <div
            onMouseDown={() => {
              if (gameStatus !== "won" && gameStatus !== "lost") {
                setIsMouseDownOnBoard(true);
              }
            }}
            onMouseUp={() => setIsMouseDownOnBoard(false)}
            onMouseLeave={() => setIsMouseDownOnBoard(false)}
            className="border-3 border-t-[#808080] border-l-[#808080] border-b-white border-r-white inline-block bg-[#808080]"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 20px)`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isRevealed = cell.revealed;

                // Render Revealed Cell
                if (isRevealed) {
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onDoubleClick={() => handleChord(r, c)}
                      className={`w-[20px] h-[20px] flex items-center justify-center select-none font-bold text-[13px] border border-[#7b7b7b] leading-none ${
                        cell.exploded
                          ? "bg-[#ff0000]"
                          : "bg-[#c0c0c0]"
                      }`}
                      style={{
                        fontFamily: "Arial, Tahoma, sans-serif",
                        color: getNumberColor(cell.count),
                      }}
                    >
                      {cell.isMine ? (
                        <span className="text-[12px] leading-none">💣</span>
                      ) : cell.misplaced ? (
                        <span className="relative flex items-center justify-center text-[12px]">
                          💣
                          <span className="absolute inset-0 text-red-600 font-extrabold text-[15px] flex items-center justify-center">
                            ✕
                          </span>
                        </span>
                      ) : cell.count > 0 ? (
                        cell.count
                      ) : (
                        ""
                      )}
                    </button>
                  );
                }

                // Render Hidden Cell (Unrevealed)
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleCellContextMenu(e, r, c)}
                    className="w-[20px] h-[20px] flex items-center justify-center select-none text-[12px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border active:border-[#7b7b7b] cursor-pointer"
                  >
                    {cell.state === "flagged" ? (
                      <span className="leading-none text-[12px]">🚩</span>
                    ) : cell.state === "question" ? (
                      <span className="font-bold text-blue-900 text-[12px] leading-none">
                        ?
                      </span>
                    ) : (
                      ""
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Custom Field Dialog */}
        {/* ---------------------------------------------------- */}
        {customModalOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
            onClick={() => setCustomModalOpen(false)}
          >
            <div
              className="bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-md shadow-2xl w-64 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="xp-titlebar flex items-center justify-between px-2 py-1">
                <span className="text-white font-bold text-xs text-shadow-xp">
                  Custom Field
                </span>
                <button
                  type="button"
                  className="xp-win-btn xp-win-btn-close"
                  onClick={() => setCustomModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="p-3 space-y-2 text-[11px] text-black">
                <div className="flex items-center justify-between">
                  <span>Height (9-24):</span>
                  <input
                    type="number"
                    min={9}
                    max={24}
                    value={customRows}
                    onChange={(e) => setCustomRows(parseInt(e.target.value) || 9)}
                    className="w-16 px-1 py-0.5 border border-[#7f9db9] bg-white text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Width (9-30):</span>
                  <input
                    type="number"
                    min={9}
                    max={30}
                    value={customCols}
                    onChange={(e) => setCustomCols(parseInt(e.target.value) || 9)}
                    className="w-16 px-1 py-0.5 border border-[#7f9db9] bg-white text-right"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Mines (10-668):</span>
                  <input
                    type="number"
                    min={10}
                    max={Math.min(668, (customRows - 1) * (customCols - 1))}
                    value={customMines}
                    onChange={(e) => setCustomMines(parseInt(e.target.value) || 10)}
                    className="w-16 px-1 py-0.5 border border-[#7f9db9] bg-white text-right"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#d4d0c8]">
                  <button
                    type="button"
                    onClick={() => {
                      const validRows = Math.max(9, Math.min(24, customRows));
                      const validCols = Math.max(9, Math.min(30, customCols));
                      const maxM = Math.min(668, (validRows - 1) * (validCols - 1));
                      const validMines = Math.max(10, Math.min(maxM, customMines));

                      setCustomModalOpen(false);
                      resetGame("custom", validRows, validCols, validMines);
                    }}
                    className="px-3 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] cursor-pointer text-xs"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomModalOpen(false)}
                    className="px-3 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Fastest Mine Sweepers (Best Times) Dialog */}
        {/* ---------------------------------------------------- */}
        {bestScoresOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
            onClick={() => setBestScoresOpen(false)}
          >
            <div
              className="bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-md shadow-2xl w-72 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="xp-titlebar flex items-center justify-between px-2 py-1">
                <span className="text-white font-bold text-xs text-shadow-xp">
                  Fastest Mine Sweepers
                </span>
                <button
                  type="button"
                  className="xp-win-btn xp-win-btn-close"
                  onClick={() => setBestScoresOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="p-3 text-[11px] text-black space-y-2">
                <div className="border border-[#7f9db9] p-2 bg-white space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Beginner:</span>
                    <span>
                      {bestScores.beginner.time} seconds ({bestScores.beginner.name})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Intermediate:</span>
                    <span>
                      {bestScores.intermediate.time} seconds (
                      {bestScores.intermediate.name})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Expert:</span>
                    <span>
                      {bestScores.expert.time} seconds ({bestScores.expert.name})
                    </span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleResetScores}
                    className="px-2 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] cursor-pointer text-xs"
                  >
                    Reset Scores
                  </button>
                  <button
                    type="button"
                    onClick={() => setBestScoresOpen(false)}
                    className="px-4 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] cursor-pointer text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* New Record Modal */}
        {/* ---------------------------------------------------- */}
        {newRecordModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-md shadow-2xl w-72 overflow-hidden">
              <div className="xp-titlebar flex items-center justify-between px-2 py-1">
                <span className="text-white font-bold text-xs text-shadow-xp">
                  Fastest Time!
                </span>
              </div>

              <div className="p-3 text-[11px] text-black space-y-2">
                <p>
                  You have the fastest time for <strong>{difficulty}</strong> level!
                  Please enter your name:
                </p>
                <input
                  type="text"
                  maxLength={15}
                  value={recordWinnerName}
                  onChange={(e) => setRecordWinnerName(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-2 py-1 border border-[#7f9db9] bg-white text-xs"
                  autoFocus
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveRecord}
                    className="px-4 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] cursor-pointer text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* About Minesweeper Dialog */}
        {/* ---------------------------------------------------- */}
        {aboutOpen && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
            onClick={() => setAboutOpen(false)}
          >
            <div
              className="bg-[#ece9d8] border-2 border-[#0055ea] rounded-t-md shadow-2xl w-72 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="xp-titlebar flex items-center justify-between px-2 py-1">
                <span className="text-white font-bold text-xs text-shadow-xp">
                  About Minesweeper
                </span>
                <button
                  type="button"
                  className="xp-win-btn xp-win-btn-close"
                  onClick={() => setAboutOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="p-4 text-center space-y-2 text-[11px] text-black">
                <div className="flex justify-center">
                  <XpIcon name="minesweeper" size={32} />
                </div>
                <h4 className="font-bold text-sm">Windows XP Minesweeper</h4>
                <p className="text-gray-600 text-xs">
                  Authentic recreation for webptor
                </p>
                <p className="text-[10px] text-gray-500">
                  Left-click reveals, Right-click flags, Double-click revealed numbers to chord.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setAboutOpen(false)}
                    className="px-4 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] cursor-pointer text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
