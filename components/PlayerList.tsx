interface Player {
  id: string;
  name: string;
  color: string;
  connected: boolean;
  isHost: boolean;
  score: number;
  resigned: boolean;
}

interface PlayerListProps {
  players: Player[];
  showScores: boolean;
  canKick: boolean;
  myPlayerId: string | null;
  onKick?: (playerId: string) => void;
}

export default function PlayerList({ players, showScores, canKick, myPlayerId, onKick }: PlayerListProps) {
  return (
    <ul className="flex w-full flex-col gap-1.5">
      {players.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-md bg-panelDark px-3 py-2"
          style={{ opacity: p.connected ? 1 : 0.4 }}
        >
          <span className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-sm text-xs font-bold text-panelDark"
              style={{ backgroundColor: p.color }}
            >
              {p.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-medium">{p.name}</span>
            {p.isHost && <span className="text-xs text-muted">Host</span>}
            {p.resigned && <span className="text-xs text-red-400">Defeated</span>}
            {!p.connected && <span className="text-xs text-muted">· offline</span>}
          </span>

          <span className="flex items-center gap-2">
            {showScores && <span className="text-sm font-bold text-white">{p.score}</span>}
            {canKick && p.id !== myPlayerId && (
              <button
                className="rounded px-1.5 py-0.5 text-xs text-muted hover:bg-red-500/20 hover:text-red-400"
                onClick={() => onKick?.(p.id)}
                title={`Kick ${p.name}`}
              >
                ✕
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}