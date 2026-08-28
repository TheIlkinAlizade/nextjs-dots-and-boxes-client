interface Player {
  id: string;
  name: string;
  color: string;
  connected: boolean;
  isHost: boolean;
}

export default function PlayerList({ players }: { players: Player[] }) {
  return (
    <ul className="flex w-72 flex-col gap-2">
      {players.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm"
          style={{
            backgroundColor: `${p.color}18`,
            opacity: p.connected ? 1 : 0.4,
          }}
        >
          <span className="flex items-center gap-2 font-medium text-white">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="text-xs text-white/50">
            {p.isHost ? 'Host' : ''} {!p.connected && '· offline'}
          </span>
        </li>
      ))}
    </ul>
  );
}