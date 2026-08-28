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

export default function GamePanel({ game }: { game: GameState }) {
  const currentPlayerId = game.turnOrder[game.currentTurnIndex];

  return (
    <div className="flex flex-col items-center gap-4">
      <p>
        {game.boxesFilled} / {game.totalBoxes} boxes filled
      </p>
      <p className="text-sm text-gray-500">Current turn: {currentPlayerId}</p>
      <div className="border rounded p-4 text-sm text-gray-400">
        Grid: {game.gridWidth} × {game.gridHeight}
      </div>
    </div>
  );
}