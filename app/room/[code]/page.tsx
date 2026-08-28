'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';
import PlayerList from '@/components/PlayerList';
import GamePanel from '@/components/GamePanel';

interface Player {
  id: string;
  name: string;
  color: string;
  connected: boolean;
  isHost: boolean;
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
    function onMoveMade(payload: {
      line: { row: number; col: number; orientation: 'horizontal' | 'vertical' };
      completedBoxes: { row: number; col: number; ownerId: string }[];
      currentTurnIndex: number;
      boxesFilled: number;
      scores: { id: string; score: number }[];
    }) {
      setGame((prev) => {
        if (!prev) return prev;
        const key = `${payload.line.row}-${payload.line.col}`;
        const horizontalLines =
          payload.line.orientation === 'horizontal'
            ? [...prev.horizontalLines, key]
            : prev.horizontalLines;
        const verticalLines =
          payload.line.orientation === 'vertical'
            ? [...prev.verticalLines, key]
            : prev.verticalLines;

        const boxOwners = prev.boxOwners.map((r) => [...r]);
        for (const box of payload.completedBoxes) {
          boxOwners[box.row][box.col] = box.ownerId;
        }

        return {
          ...prev,
          horizontalLines,
          verticalLines,
          boxOwners,
          currentTurnIndex: payload.currentTurnIndex,
          boxesFilled: payload.boxesFilled,
        };
      });

      setPlayers((prev) =>
        prev.map((p) => {
          const scoreEntry = payload.scores.find((s) => s.id === p.id);
          return scoreEntry ? { ...p, score: scoreEntry.score } : p;
        })
      );
    }
    function onGameOver() {
      setStatus('finished');
    }

    socket.on('player_joined', onPlayerJoined);
    socket.on('player_reconnected', onPlayerReconnected);
    socket.on('player_disconnected', onPlayerDisconnected);
    socket.on('player_left', onPlayerLeft);
    socket.on('game_started', onGameStarted);
    socket.on('move_made', onMoveMade);
    socket.on('game_over', onGameOver);

    return () => {
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_reconnected', onPlayerReconnected);
      socket.off('player_disconnected', onPlayerDisconnected);
      socket.off('player_left', onPlayerLeft);
      socket.off('game_started', onGameStarted);
      socket.off('move_made', onMoveMade);
      socket.off('game_over', onGameOver);
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

  function handleLineClick(row: number, col: number, orientation: 'horizontal' | 'vertical') {
    socket.emit('make_move', { line: { row, col, orientation } }, (res: { ok: boolean; error?: string }) => {
      if (!res.ok) console.log('Move rejected:', res.error);
    });
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0A1F] text-white">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  const isHost = players.find((p) => p.id === myPlayerId)?.isHost ?? false;
  const winner =
    status === 'finished'
      ? [...players].sort((a, b) => b.score - a.score)[0]
      : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0B0A1F] p-6 text-white">
      <h1 className="text-3xl font-bold tracking-tight">Room {roomCode}</h1>

      {status === 'lobby' && (
        <>
          <PlayerList players={players} />
          {isHost && (
            <button
              className="rounded-full bg-[#FF5D8F] px-6 py-3 font-semibold text-white shadow-lg transition-opacity disabled:opacity-40"
              onClick={handleStartGame}
              disabled={players.filter((p) => p.connected).length < 2}
            >
              Start Game
            </button>
          )}
        </>
      )}

      {(status === 'playing' || status === 'finished') && game && (
        <GamePanel game={game} players={players} myPlayerId={myPlayerId} onLineClick={handleLineClick} />
      )}

      {status === 'finished' && winner && (
        <p className="text-xl font-semibold" style={{ color: winner.color }}>
          {winner.name} wins!
        </p>
      )}

      <button
        className="rounded-full border border-white/20 px-6 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
        onClick={handleLeaveRoom}
      >
        Leave Room
      </button>
    </main>
  );
}