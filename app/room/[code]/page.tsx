'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';

interface Player {
  id: string;
  name: string;
  connected: boolean;
  isHost: boolean;
}

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const roomCode = params.code.toUpperCase();

  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const playerId = sessionStorage.getItem('playerId');
    const playerName = sessionStorage.getItem('playerName');

    if (!playerName) {
      router.push('/');
      return;
    }

    if (!socket.connected) socket.connect();

    socket.emit(
      'join_room',
      { roomCode, playerName, playerId },
      (res: { ok: boolean; playerId?: string; players?: Player[]; error?: string }) => {
        if (!res.ok) {
          setError(res.error || 'Could not join room.');
          return;
        }
        if (res.playerId) {
          sessionStorage.setItem('playerId', res.playerId);
        }
        if (res.players) {
          setPlayers(res.players);
        }
      }
    );

    function onPlayerJoined({ player }: { player: Player }) {
      setPlayers((prev) => {
        if (prev.some((p) => p.id === player.id)) return prev;
        return [...prev, player];
      });
    }

    function onPlayerReconnected({ playerId }: { playerId: string }) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, connected: true } : p))
      );
    }

    socket.on('player_joined', onPlayerJoined);
    socket.on('player_reconnected', onPlayerReconnected);

    return () => {
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_reconnected', onPlayerReconnected);
    };
  }, [roomCode, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Room {roomCode}</h1>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name} {p.isHost && '(host)'}
          </li>
        ))}
      </ul>
    </main>
  );
}