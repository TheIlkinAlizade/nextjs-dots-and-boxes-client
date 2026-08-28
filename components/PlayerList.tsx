interface Player {
  id: string;
  name: string;
  connected: boolean;
  isHost: boolean;
}

export default function PlayerList({ players }: { players: Player[] }) {
  return (
    <ul className="flex flex-col gap-2 w-64">
      {players.map((p) => (
        <li
          key={p.id}
          className={`flex justify-between border rounded px-3 py-2 ${
            p.connected ? '' : 'opacity-40'
          }`}
        >
          <span>{p.name}</span>
          <span className="text-sm text-gray-500">
            {p.isHost && 'Host'} {!p.connected && '(disconnected)'}
          </span>
        </li>
      ))}
    </ul>
  );
}