interface Player {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  connected: boolean;
  score: number;
}

interface GameState {
  gridWidth: number;
  gridHeight: number;
  horizontalLines: string[];
  verticalLines: string[];
  boxOwners: (string | null)[][];
  turnOrder: string[];
  currentTurnIndex: number;
  totalBoxes: number;
  boxesFilled: number;
}

interface GamePanelProps {
  game: GameState;
  players: Player[];
  myPlayerId: string | null;
  onLineClick: (row: number, col: number, orientation: 'horizontal' | 'vertical') => void;
}

const CELL = 64;
const DOT_RADIUS = 6;
const LINE_HIT_WIDTH = 16;
const LINE_VISIBLE_WIDTH = 6;

export default function GamePanel({ game, players, myPlayerId, onLineClick }: GamePanelProps) {
  const playerById = new Map(players.map((p) => [p.id, p]));
  const currentPlayerId = game.turnOrder[game.currentTurnIndex];
  const currentPlayer = playerById.get(currentPlayerId);
  const isMyTurn = currentPlayerId === myPlayerId;
  const gameOver = game.boxesFilled === game.totalBoxes;

  const width = game.gridWidth * CELL;
  const height = game.gridHeight * CELL;

  const horizontalSet = new Set(game.horizontalLines);
  const verticalSet = new Set(game.verticalLines);

  const elements: React.ReactNode[] = [];

  for (let row = 0; row <= game.gridHeight; row++) {
    for (let col = 0; col < game.gridWidth; col++) {
      const key = `${row}-${col}`;
      const drawn = horizontalSet.has(key);
      const x1 = col * CELL;
      const x2 = (col + 1) * CELL;
      const y = row * CELL;

      elements.push(
        <line
          key={`h-visible-${key}`}
          x1={x1}
          y1={y}
          x2={x2}
          y2={y}
          stroke={drawn ? '#2D2A5C' : 'transparent'}
          strokeWidth={LINE_VISIBLE_WIDTH}
          strokeLinecap="round"
        />
      );

      if (!drawn && !gameOver) {
        elements.push(
          <line
            key={`h-hit-${key}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke="transparent"
            strokeWidth={LINE_HIT_WIDTH}
            className="cursor-pointer hover:stroke-[#FFB84C]/40"
            onClick={() => isMyTurn && onLineClick(row, col, 'horizontal')}
          />
        );
      }
    }
  }

  for (let row = 0; row < game.gridHeight; row++) {
    for (let col = 0; col <= game.gridWidth; col++) {
      const key = `${row}-${col}`;
      const drawn = verticalSet.has(key);
      const x = col * CELL;
      const y1 = row * CELL;
      const y2 = (row + 1) * CELL;

      elements.push(
        <line
          key={`v-visible-${key}`}
          x1={x}
          y1={y1}
          x2={x}
          y2={y2}
          stroke={drawn ? '#2D2A5C' : 'transparent'}
          strokeWidth={LINE_VISIBLE_WIDTH}
          strokeLinecap="round"
        />
      );

      if (!drawn && !gameOver) {
        elements.push(
          <line
            key={`v-hit-${key}`}
            x1={x}
            y1={y1}
            x2={x}
            y2={y2}
            stroke="transparent"
            strokeWidth={LINE_HIT_WIDTH}
            className="cursor-pointer hover:stroke-[#FFB84C]/40"
            onClick={() => isMyTurn && onLineClick(row, col, 'vertical')}
          />
        );
      }
    }
  }

  for (let row = 0; row < game.gridHeight; row++) {
    for (let col = 0; col < game.gridWidth; col++) {
      const ownerId = game.boxOwners[row][col];
      if (!ownerId) continue;
      const owner = playerById.get(ownerId);

      elements.push(
        <rect
          key={`box-${row}-${col}`}
          x={col * CELL + LINE_VISIBLE_WIDTH / 2}
          y={row * CELL + LINE_VISIBLE_WIDTH / 2}
          width={CELL - LINE_VISIBLE_WIDTH}
          height={CELL - LINE_VISIBLE_WIDTH}
          rx={8}
          fill={owner?.color ?? '#333'}
          fillOpacity={0.25}
        />
      );
    }
  }

  for (let row = 0; row <= game.gridHeight; row++) {
    for (let col = 0; col <= game.gridWidth; col++) {
      elements.push(
        <circle
          key={`dot-${row}-${col}`}
          cx={col * CELL}
          cy={row * CELL}
          r={DOT_RADIUS}
          fill="#1A1830"
        />
      );
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {!gameOver && (
        <div
          className="flex items-center gap-2 rounded-full px-5 py-2 font-semibold text-white shadow-md transition-colors"
          style={{ backgroundColor: currentPlayer?.color ?? '#666' }}
        >
          <span className="h-2 w-2 rounded-full bg-white/80" />
          {isMyTurn ? "Your turn" : `${currentPlayer?.name ?? '...'}'s turn`}
        </div>
      )}

      <svg
        width={width + LINE_VISIBLE_WIDTH}
        height={height + LINE_VISIBLE_WIDTH}
        viewBox={`${-LINE_VISIBLE_WIDTH / 2} ${-LINE_VISIBLE_WIDTH / 2} ${width + LINE_VISIBLE_WIDTH} ${height + LINE_VISIBLE_WIDTH}`}
        className="rounded-2xl bg-[#12102A] shadow-xl"
      >
        {elements}
      </svg>

      <div className="flex gap-3 flex-wrap justify-center">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium"
            style={{ backgroundColor: `${p.color}22`, color: p.color }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}: {p.score}
          </div>
        ))}
      </div>
    </div>
  );
}