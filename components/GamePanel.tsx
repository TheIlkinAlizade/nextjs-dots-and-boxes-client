interface Player {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  connected: boolean;
  score: number;
  resigned: boolean;
}

interface GameState {
  gridWidth: number;
  gridHeight: number;
  horizontalLines: Record<string, string>;
  verticalLines: Record<string, string>;
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
  gameOver: boolean;
  onLineClick: (row: number, col: number, orientation: 'horizontal' | 'vertical') => void;
}

const CELL = 60;
const DOT_RADIUS = 5;
const LINE_HIT_WIDTH = 16;
const LINE_VISIBLE_WIDTH = 6;

export default function GamePanel({ game, players, myPlayerId, gameOver, onLineClick }: GamePanelProps) {
  const playerById = new Map(players.map((p) => [p.id, p]));
  const currentPlayerId = game.turnOrder[game.currentTurnIndex];
  const currentPlayer = playerById.get(currentPlayerId);
  const isMyTurn = currentPlayerId === myPlayerId;

  const width = game.gridWidth * CELL;
  const height = game.gridHeight * CELL;
  const elements: React.ReactNode[] = [];

  for (let row = 0; row <= game.gridHeight; row++) {
    for (let col = 0; col < game.gridWidth; col++) {
      const key = `${row}-${col}`;
      const drawnBy = game.horizontalLines[key];
      const x1 = col * CELL, x2 = (col + 1) * CELL, y = row * CELL;
      elements.push(
        <line key={`h-visible-${key}`} x1={x1} y1={y} x2={x2} y2={y}
          stroke={drawnBy ? playerById.get(drawnBy)?.color ?? '#81B64C' : 'transparent'}
          strokeWidth={LINE_VISIBLE_WIDTH} strokeLinecap="round" />
      );
      if (!drawnBy && !gameOver) {
        elements.push(
          <line key={`h-hit-${key}`} x1={x1} y1={y} x2={x2} y2={y}
            stroke="transparent" strokeWidth={LINE_HIT_WIDTH}
            className="cursor-pointer hover:stroke-white/25"
            onClick={() => isMyTurn && onLineClick(row, col, 'horizontal')} />
        );
      }
    }
  }

  for (let row = 0; row < game.gridHeight; row++) {
    for (let col = 0; col <= game.gridWidth; col++) {
      const key = `${row}-${col}`;
      const drawnBy = game.verticalLines[key];
      const x = col * CELL, y1 = row * CELL, y2 = (row + 1) * CELL;
      elements.push(
        <line key={`v-visible-${key}`} x1={x} y1={y1} x2={x} y2={y2}
          stroke={drawnBy ? playerById.get(drawnBy)?.color ?? '#81B64C' : 'transparent'}
          strokeWidth={LINE_VISIBLE_WIDTH} strokeLinecap="round" />
      );
      if (!drawnBy && !gameOver) {
        elements.push(
          <line key={`v-hit-${key}`} x1={x} y1={y1} x2={x} y2={y2}
            stroke="transparent" strokeWidth={LINE_HIT_WIDTH}
            className="cursor-pointer hover:stroke-white/25"
            onClick={() => isMyTurn && onLineClick(row, col, 'vertical')} />
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
        <rect key={`box-${row}-${col}`}
          x={col * CELL + LINE_VISIBLE_WIDTH / 2} y={row * CELL + LINE_VISIBLE_WIDTH / 2}
          width={CELL - LINE_VISIBLE_WIDTH} height={CELL - LINE_VISIBLE_WIDTH}
          fill={owner?.color ?? '#333'} fillOpacity={0.35} />
      );
    }
  }

  for (let row = 0; row <= game.gridHeight; row++) {
    for (let col = 0; col <= game.gridWidth; col++) {
      elements.push(<circle key={`dot-${row}-${col}`} cx={col * CELL} cy={row * CELL} r={DOT_RADIUS} fill="#EEEED2" />);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {!gameOver && (
        <div className="flex w-full items-center gap-2 bg-panel px-4 py-2.5 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: currentPlayer?.color ?? '#666' }} />
          {isMyTurn ? 'Your turn' : `${currentPlayer?.name ?? '...'}'s turn`}
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <svg
          width={width + LINE_VISIBLE_WIDTH}
          height={height + LINE_VISIBLE_WIDTH}
          viewBox={`${-LINE_VISIBLE_WIDTH / 2} ${-LINE_VISIBLE_WIDTH / 2} ${width + LINE_VISIBLE_WIDTH} ${height + LINE_VISIBLE_WIDTH}`}
          className="mx-auto bg-panelDark shadow-lg"
        >
          {elements}
        </svg>
      </div>
    </div>
  );
}