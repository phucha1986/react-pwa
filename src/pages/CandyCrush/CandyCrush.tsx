import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box, Button, Typography } from '@mui/material';

import { useLanguage } from '@/i18n/useLanguage';
import sleep from '@/utils/sleep';

import { playBoom, playMatch, playOver, playShuffle, playSwap, playWin } from './sound';

const SIZE = 6;
const CANDIES = ['🍬', '🍭', '🍫', '🍩', '🍪', '🧁'];
const CANDY_COLORS = ['#FF5C8A', '#FF9F1C', '#8D5524', '#9B5DE5', '#F4D35E', '#4CC9F0'];
const START_MOVES = 25;
/** Board value for a special candy: detonates its whole row and column when swapped. */
const SPECIAL = 6;
const SPECIAL_EMOJI = '💣';
/** Board value for a color bomb: clears all candies of the type it is swapped with. */
const BOMB = 7;
const BOMB_EMOJI = '🌈';

type Phase = 'idle' | 'playing' | 'over';
type Cell = { r: number; c: number };
type Run = { r: number; c: number; len: number; horizontal: boolean };

const cellKey = (r: number, c: number) => `${r},${c}`;

/** True for special candy types (row/column special or color bomb). */
const isSpecialType = (v: number) => v === SPECIAL || v === BOMB;

function randomType(): number {
  return Math.floor(Math.random() * CANDIES.length);
}

/** Returns all runs of 3+ identical normal candies in rows and columns. */
function findRuns(board: number[][]): Run[] {
  const runs: Run[] = [];
  for (let r = 0; r < SIZE; r++) {
    let run = 1;
    for (let c = 1; c <= SIZE; c++) {
      if (c < SIZE && !isSpecialType(board[r][c]) && board[r][c] === board[r][c - 1]) {
        run += 1;
      } else {
        if (run >= 3) runs.push({ r, c: c - run, len: run, horizontal: true });
        run = 1;
      }
    }
  }
  for (let c = 0; c < SIZE; c++) {
    let run = 1;
    for (let r = 1; r <= SIZE; r++) {
      if (r < SIZE && !isSpecialType(board[r][c]) && board[r][c] === board[r - 1][c]) {
        run += 1;
      } else {
        if (run >= 3) runs.push({ r: r - run, c, len: run, horizontal: false });
        run = 1;
      }
    }
  }
  return runs;
}

/** Returns the set of "r,c" keys that are part of a run of 3+ in a row or column. */
function findMatches(board: number[][]): Set<string> {
  const matched = new Set<string>();
  for (const run of findRuns(board)) {
    for (let i = 0; i < run.len; i++) {
      matched.add(run.horizontal ? cellKey(run.r, run.c + i) : cellKey(run.r + i, run.c));
    }
  }
  return matched;
}

/** Center cell of a run, where a special candy appears for runs of 4+. */
function runCenter(run: Run): Cell {
  const mid = Math.floor((run.len - 1) / 2);
  return run.horizontal ? { r: run.r, c: run.c + mid } : { r: run.r + mid, c: run.c };
}

/** Removes matched candies, drops survivors down, and refills the top with new candies. */
function collapse(
  board: number[][],
  matched: Set<string>,
): { board: number[][]; dropped: Set<string> } {
  const next = board.map((row) => [...row]);
  const dropped = new Set<string>();
  for (let c = 0; c < SIZE; c++) {
    const survivors: number[] = [];
    for (let r = SIZE - 1; r >= 0; r--) {
      if (!matched.has(cellKey(r, c))) survivors.push(next[r][c]);
    }
    for (let r = SIZE - 1; r >= 0; r--) {
      const idx = SIZE - 1 - r;
      if (idx < survivors.length) {
        next[r][c] = survivors[idx];
      } else {
        next[r][c] = randomType();
        dropped.add(cellKey(r, c));
      }
    }
  }
  return { board: next, dropped };
}

/** True if a special can be used, or at least one adjacent swap would create a match. */
function hasValidMove(board: number[][]): boolean {
  let hasSpecial = false;
  let hasNormal = false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (isSpecialType(board[r][c])) hasSpecial = true;
      else hasNormal = true;
    }
  }
  if (hasSpecial && hasNormal) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (isSpecialType(board[r][c])) continue;
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
      ] as const) {
        const r2 = r + dr;
        const c2 = c + dc;
        if (r2 >= SIZE || c2 >= SIZE) continue;
        if (isSpecialType(board[r2][c2])) continue;
        const copy = board.map((row) => [...row]);
        [copy[r][c], copy[r2][c2]] = [copy[r2][c2], copy[r][c]];
        if (findMatches(copy).size > 0) return true;
      }
    }
  }
  return false;
}

/** Builds a random board with no pre-existing matches and at least one valid move. */
function makeBoard(): number[][] {
  let board: number[][];
  do {
    board = [];
    for (let r = 0; r < SIZE; r++) {
      const row: number[] = [];
      for (let c = 0; c < SIZE; c++) {
        let t = randomType();
        while (
          (c >= 2 && row[c - 1] === t && row[c - 2] === t) ||
          (r >= 2 && board[r - 1][c] === t && board[r - 2][c] === t)
        ) {
          t = randomType();
        }
        row.push(t);
      }
      board.push(row);
    }
  } while (!hasValidMove(board));
  return board;
}

export default function CandyCrush() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>('idle');
  const [board, setBoard] = useState<number[][]>(() => makeBoard());
  const [selected, setSelected] = useState<Cell | null>(null);
  const [held, setHeld] = useState<Cell | null>(null);
  const [dragTarget, setDragTarget] = useState<Cell | null>(null);
  const [popping, setPopping] = useState<Set<string>>(() => new Set());
  const [dropping, setDropping] = useState<Set<string>>(() => new Set());
  const [swapAnim, setSwapAnim] = useState<{
    cells: Record<string, { dx: string; dy: string }>;
    name: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(START_MOVES);
  const busyRef = useRef(false);
  const dragRef = useRef<{
    r: number;
    c: number;
    x: number;
    y: number;
    target: Cell | null;
  } | null>(null);
  const boardAreaRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(0);

  useEffect(() => {
    const el = boardAreaRef.current;
    if (!el) return;
    const update = () => setBoardSize(Math.min(el.clientWidth, el.clientHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const keyframes = useMemo(
    () => `
@keyframes candyPop {
  0% { transform: scale(1); opacity: 1; }
  55% { transform: scale(1.35); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}
@keyframes candyDrop {
  0% { transform: translateY(-60px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes candySwap {
  0% { transform: translate(var(--dx), var(--dy)); }
  100% { transform: translate(0, 0); }
}
@keyframes candySwapBack {
  0% { transform: translate(var(--dx), var(--dy)); }
  100% { transform: translate(0, 0); }
}
@keyframes candySpecial {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.8)); }
  50% { transform: scale(1.18); filter: drop-shadow(0 0 10px rgba(255, 215, 0, 1)); }
}`,
    [],
  );

  const startGame = () => {
    setBoard(makeBoard());
    setScore(0);
    setMovesLeft(START_MOVES);
    setSelected(null);
    setHeld(null);
    setDragTarget(null);
    dragRef.current = null;
    setPopping(new Set());
    setDropping(new Set());
    setSwapAnim(null);
    busyRef.current = false;
    setPhase('playing');
  };

  const resolveCascades = async (start: number[][], moves: number, baseScore: number) => {
    let current = start;
    let chain = 0;
    let gained = 0;
    for (;;) {
      const runs = findRuns(current);
      if (runs.length === 0) break;
      const matched = new Set<string>();
      for (const run of runs) {
        for (let i = 0; i < run.len; i++) {
          matched.add(run.horizontal ? cellKey(run.r, run.c + i) : cellKey(run.r + i, run.c));
        }
      }
      chain += 1;
      playMatch(chain);
      gained += matched.size * 10 * chain;
      setPopping(matched);
      await sleep(320);
      const { board: next, dropped } = collapse(current, matched);
      // Runs of 5+ leave a color bomb; runs of 4 leave a row/column special.
      const sortedRuns = [...runs].sort((a, b) => b.len - a.len);
      for (const run of sortedRuns) {
        const pos = runCenter(run);
        if (isSpecialType(next[pos.r][pos.c])) continue;
        next[pos.r][pos.c] = run.len >= 5 ? BOMB : SPECIAL;
      }
      setPopping(new Set());
      setDropping(dropped);
      setBoard(next);
      current = next;
      await sleep(320);
      setDropping(new Set());
    }
    if (!hasValidMove(current)) {
      playShuffle();
      current = makeBoard();
      setBoard(current);
    }
    setScore(baseScore + gained);
    if (moves <= 0) {
      setPhase('over');
      if (baseScore + gained > 0) playWin();
      else playOver();
    }
  };

  const attemptSwap = async (a: Cell, b: Cell) => {
    busyRef.current = true;
    setSelected(null);
    const original = board;
    const aType = original[a.r][a.c];
    const bType = original[b.r][b.c];
    const specialSwap = aType === SPECIAL || bType === SPECIAL;
    const bombSwap = aType === BOMB || bType === BOMB;
    const swapped = board.map((row) => [...row]);
    [swapped[a.r][a.c], swapped[b.r][b.c]] = [swapped[b.r][b.c], swapped[a.r][a.c]];
    playSwap();
    // Distance between adjacent cell centers, used for the slide animation.
    const step = boardSize ? (boardSize - 12 - 4 * (SIZE - 1)) / SIZE + 4 : 0;
    const unit = step ? 'px' : '%';
    const mag = step || 100;
    // The cell at `a` now shows the candy that came from `b` (and vice versa).
    // Offset each candy toward its old cell so it appears to slide into place.
    const swapCells = {
      [cellKey(a.r, a.c)]: { dx: `${(b.c - a.c) * mag}${unit}`, dy: `${(b.r - a.r) * mag}${unit}` },
      [cellKey(b.r, b.c)]: { dx: `${(a.c - b.c) * mag}${unit}`, dy: `${(a.r - b.r) * mag}${unit}` },
    };
    setSwapAnim({ cells: swapCells, name: 'candySwap' });
    setBoard(swapped);
    await sleep(220);
    if (bombSwap) {
      // The color bomb detonates: it clears all candies of the type it was swapped with.
      setSwapAnim(null);
      const bombPos = aType === BOMB ? b : a;
      const otherPos = aType === BOMB ? a : b;
      const targetType = swapped[otherPos.r][otherPos.c];
      if (isSpecialType(targetType)) {
        // A bomb can only be swapped with a normal candy; swap back.
        setSwapAnim({ cells: swapCells, name: 'candySwapBack' });
        setBoard(original);
        await sleep(220);
        setSwapAnim(null);
        busyRef.current = false;
        return;
      }
      const moves = movesLeft - 1;
      setMovesLeft(moves);
      const boom = new Set<string>();
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (swapped[r][c] === targetType) boom.add(cellKey(r, c));
        }
      }
      boom.add(cellKey(bombPos.r, bombPos.c));
      playBoom();
      setPopping(boom);
      await sleep(320);
      const { board: next, dropped } = collapse(swapped, boom);
      setPopping(new Set());
      setDropping(dropped);
      setBoard(next);
      await sleep(320);
      setDropping(new Set());
      await resolveCascades(next, moves, score + boom.size * 10);
      busyRef.current = false;
      return;
    }
    if (specialSwap) {
      // The special candy detonates: it clears its whole row and column.
      setSwapAnim(null);
      const specialPos = aType === SPECIAL ? b : a;
      const moves = movesLeft - 1;
      setMovesLeft(moves);
      const boom = new Set<string>();
      for (let i = 0; i < SIZE; i++) {
        boom.add(cellKey(specialPos.r, i));
        boom.add(cellKey(i, specialPos.c));
      }
      playBoom();
      setPopping(boom);
      await sleep(320);
      const { board: next, dropped } = collapse(swapped, boom);
      setPopping(new Set());
      setDropping(dropped);
      setBoard(next);
      await sleep(320);
      setDropping(new Set());
      await resolveCascades(next, moves, score + boom.size * 10);
      busyRef.current = false;
      return;
    }
    if (findMatches(swapped).size === 0) {
      // No match: swap back (same offsets, different keyframe name to restart the animation).
      setSwapAnim({ cells: swapCells, name: 'candySwapBack' });
      setBoard(original);
      await sleep(220);
      setSwapAnim(null);
      busyRef.current = false;
      return;
    }
    setSwapAnim(null);
    const moves = movesLeft - 1;
    setMovesLeft(moves);
    await resolveCascades(swapped, moves, score);
    busyRef.current = false;
  };

  const handleCellClick = (r: number, c: number) => {
    if (phase !== 'playing' || busyRef.current) return;
    if (!selected) {
      setSelected({ r, c });
      return;
    }
    if (selected.r === r && selected.c === c) {
      setSelected(null);
      return;
    }
    const selSpecial = isSpecialType(board[selected.r][selected.c]);
    const clickSpecial = isSpecialType(board[r][c]);
    if (selSpecial !== clickSpecial) {
      // A special candy can be swapped with any normal candy on the board.
      void attemptSwap(selected, { r, c });
      return;
    }
    if (clickSpecial) {
      setSelected({ r, c });
      return;
    }
    const adjacent = Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1;
    if (!adjacent) {
      setSelected({ r, c });
      return;
    }
    void attemptSwap(selected, { r, c });
  };

  const handleCellPointerDown = (e: ReactPointerEvent, r: number, c: number) => {
    if (phase !== 'playing' || busyRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture unsupported; drag still works via per-cell handlers.
    }
    dragRef.current = { r, c, x: e.clientX, y: e.clientY, target: null };
    setHeld({ r, c });
    setDragTarget(null);
  };

  const handleCellPointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
    let tr = d.r;
    let tc = d.c;
    if (Math.abs(dx) > Math.abs(dy)) {
      tc += dx > 0 ? 1 : -1;
    } else {
      tr += dy > 0 ? 1 : -1;
    }
    if (tr < 0 || tr >= SIZE || tc < 0 || tc >= SIZE) return;
    if (d.target?.r === tr && d.target?.c === tc) return;
    d.target = { r: tr, c: tc };
    setDragTarget({ r: tr, c: tc });
  };

  const endDrag = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setHeld(null);
    setDragTarget(null);
    if (!d) return;
    if (d.target && !busyRef.current) {
      void attemptSwap({ r: d.r, c: d.c }, d.target);
    }
  };

  const playButtonSx = {
    bgcolor: '#E64980',
    '&:hover': { bgcolor: '#c2255c' },
    borderRadius: '2rem',
    px: 3,
    py: 0.5,
    fontWeight: 700,
    textTransform: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <Box
      ref={boardAreaRef}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 80px)',
        bgcolor: '#FFF0F6',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <style>{keyframes}</style>
      {/* Compact header: title, score, moves and play button in one row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          flexShrink: 0,
          px: 1,
          py: 0.75,
        }}
      >
        <Typography variant="h6" sx={{ color: '#E64980', fontWeight: 800, whiteSpace: 'nowrap' }}>
          {t.candyTitle}
        </Typography>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            px: 1.5,
            py: 0.25,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography variant="caption" color="#999" sx={{ display: 'block', lineHeight: 1 }}>
            {t.candyScore}
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="#E64980"
            sx={{ lineHeight: 1.2 }}
          >
            {score}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            px: 1.5,
            py: 0.25,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography variant="caption" color="#999" sx={{ display: 'block', lineHeight: 1 }}>
            {t.candyMoves}
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="#7048E8"
            sx={{ lineHeight: 1.2 }}
          >
            {movesLeft}
          </Typography>
        </Box>
        {phase === 'idle' && (
          <Button onClick={startGame} variant="contained" sx={playButtonSx}>
            {t.candyPlay}
          </Button>
        )}
        {phase === 'over' && (
          <Button onClick={startGame} variant="contained" sx={playButtonSx}>
            {t.candyPlayAgain}
          </Button>
        )}
      </Box>
      {/* Board fills all remaining space */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1,
          pb: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${SIZE}, 1fr)`,
            gap: 0.5,
            width: boardSize || '100%',
            height: boardSize || '100%',
            bgcolor: '#F8BBD0',
            p: 0.75,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: phase === 'playing' ? 'auto' : 'none',
          }}
        >
          {board.map((row, r) =>
            row.map((type, c) => {
              const k = cellKey(r, c);
              const isSelected = selected?.r === r && selected?.c === c;
              const isHeld = held?.r === r && held?.c === c;
              const isDragTarget = dragTarget?.r === r && dragTarget?.c === c;
              const isSpecial = type === SPECIAL;
              const isBomb = type === BOMB;
              const swap = swapAnim?.cells[k];
              return (
                <Box
                  key={k}
                  onClick={() => handleCellClick(r, c)}
                  onPointerDown={(e) => handleCellPointerDown(e, r, c)}
                  onPointerMove={handleCellPointerMove}
                  onPointerUp={endDrag}
                  onPointerLeave={endDrag}
                  onPointerCancel={endDrag}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: boardSize ? Math.round(boardSize * 0.11) : 40,
                    bgcolor: isDragTarget
                      ? '#fff'
                      : isSelected
                        ? '#fff'
                        : isSpecial
                          ? '#FFD700'
                          : isBomb
                            ? '#B983FF'
                            : CANDY_COLORS[type],
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    outline: isHeld || isDragTarget || isSelected ? '3px solid #E64980' : 'none',
                    transform: isHeld ? 'scale(1.12)' : 'scale(1)',
                    transition: 'transform 0.1s ease',
                    zIndex: isHeld ? 2 : 1,
                    touchAction: 'none',
                    userSelect: 'none',
                    ...(swap
                      ? ({ '--dx': swap.dx, '--dy': swap.dy } as Record<string, string>)
                      : {}),
                    animation: popping.has(k)
                      ? 'candyPop 0.3s ease-in forwards'
                      : dropping.has(k)
                        ? 'candyDrop 0.3s ease-out'
                        : swap
                          ? `${swapAnim.name} 0.22s ease-in-out`
                          : isSpecial || isBomb
                            ? 'candySpecial 1.2s ease-in-out infinite'
                            : 'none',
                  }}
                >
                  {isSpecial ? SPECIAL_EMOJI : isBomb ? BOMB_EMOJI : CANDIES[type]}
                </Box>
              );
            }),
          )}
        </Box>
      </Box>
    </Box>
  );
}
