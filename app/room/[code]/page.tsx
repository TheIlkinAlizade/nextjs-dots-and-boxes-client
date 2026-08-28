'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';
import PlayerList from '@/components/PlayerList';
import GamePanel from '@/components/GamePanel';

interface Player {
  id: string;
  name: string;
  connected: boolean;
  isHost: boolean;
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

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const roomCode = params.code.toUpperCase();

  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState('');
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

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
      (res: {
        ok: boolean;
        playerId?: string;
        players?: Player[];
        game?: GameState | null;
        status?: 'lobby' | 'playing' | 'finished';
        error?: string;
      }) => {
        if (!res.ok) {
          setError(res.error || 'Could not join room.');
          return;
        }
        if (res.playerId) {
          sessionStorage.setItem('playerId', res.playerId);
          setMyPlayerId(res.playerId);
        }
        if (res.players) setPlayers(res.players);
        if (res.status) setStatus(res.status);
        if (res.game) setGame(res.game);
      }
    );

    function onPlayerJoined({ player }: { player: Player }) {
      setPlayers((prev) => (prev.some((p) => p.id === player.id) ? prev : [...prev, player]));
    }
    function onPlayerReconnected({ playerId }: { playerId: string }) {
      setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, connected: true } : p)));
    }
    function onPlayerDisconnected({ playerId }: { playerId: string }) {
      setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, connected: false } : p)));
    }
    function onPlayerLeft({ playerId }: { playerId: string }) {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    }
    function onGameStarted({ game }: { game: GameState }) {
      setStatus('playing');
      setGame(game);
    }

    socket.on('player_joined', onPlayerJoined);
    socket.on('player_reconnected', onPlayerReconnected);
    socket.on('player_disconnected', onPlayerDisconnected);
    socket.on('player_left', onPlayerLeft);
    socket.on('game_started', onGameStarted);

    return () => {
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_reconnected', onPlayerReconnected);
      socket.off('player_disconnected', onPlayerDisconnected);
      socket.off('player_left', onPlayerLeft);
      socket.off('game_started', onGameStarted);
    };
  }, [roomCode, router]);

  function handleLeaveRoom() {
    socket.emit('leave_room');
    sessionStorage.removeItem('playerId');
    sessionStorage.removeItem('playerName');
    router.push('/');
  }

  function handleStartGame() {
    socket.emit('start_game', {}, (res: { ok: boolean; error?: string }) => {
      if (!res.ok) setError(res.error || 'Could not start game.');
    });
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  const isHost = players.find((p) => p.id === myPlayerId)?.isHost ?? false;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Room {roomCode}</h1>

      {status === 'lobby' && (
        <>
          <PlayerList players={players} />
          {isHost && (
            <button
              className="bg-blue-500 text-white rounded px-4 py-2 w-64 disabled:opacity-50"
              onClick={handleStartGame}
              disabled={players.filter((p) => p.connected).length < 2}
            >
              Start Game
            </button>
          )}
        </>
      )}

      {status === 'playing' && game && <GamePanel game={game} />}

      <button className="bg-gray-300 rounded px-4 py-2 w-64" onClick={handleLeaveRoom}>
        Leave Room
      </button>
    </main>
  );
}