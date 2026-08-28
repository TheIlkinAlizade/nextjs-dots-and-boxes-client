interface Player {
  id: string;
  name: string;
  color: string;
  connected: boolean;
  isHost: boolean;
}

export default function PlayerList({ players }: { players: Player[] }) {
  return (
    <ul className="flex w-full flex-col gap-2">
      {players.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-xl bg-panelDark px-3 py-2.5"
          style={{ opacity: p.connected ? 1 : 0.4 }}
        >
          <span className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-panelDark"
              style={{ backgroundColor: p.color }}
            >
              {p.name.charAt(0).toUpperCase()}
            </span>
            <span className="font-medium">{p.name}</span>
          </span>
          <span className="text-xs text-muted">
            {p.isHost ? 'Host' : ''} {!p.connected && '· offline'}
          </span>
        </li>
      ))}
    </ul>
  );
}