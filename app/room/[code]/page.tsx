'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';
import PlayerList from '@/components/PlayerList';
import GamePanel from '@/components/GamePanel';
import GridSizeSelector from '@/components/GridSizeSelector';

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
  const [copied, setCopied] = useState(false);
  const [gridSize, setGridSize] = useState({ width: 5, height: 5 });
  const [needsName, setNeedsName] = useState(true);
  const [nameInput, setNameInput] = useState('');

  function joinWithName(playerName: string) {
    const playerId = sessionStorage.getItem('playerId');

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
        if (!res.ok) return setError(res.error || 'Could not join room.');
        if (res.playerId) {
          sessionStorage.setItem('playerId', res.playerId);
          sessionStorage.setItem('playerName', playerName);
          setMyPlayerId(res.playerId);
        }
        if (res.players) setPlayers(res.players);
        if (res.status) setStatus(res.status);
        if (res.game) setGame(res.game);
        setNeedsName(false);
      }
    );
  }

  useEffect(() => {
    const playerName = sessionStorage.getItem('playerName');
    if (!playerName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNeedsName(true);
    } else {
      joinWithName(playerName);
    }

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
          payload.line.orientation === 'horizontal' ? [...prev.horizontalLines, key] : prev.horizontalLines;
        const verticalLines =
          payload.line.orientation === 'vertical' ? [...prev.verticalLines, key] : prev.verticalLines;
        const boxOwners = prev.boxOwners.map((r) => [...r]);
        for (const box of payload.completedBoxes) boxOwners[box.row][box.col] = box.ownerId;
        return { ...prev, horizontalLines, verticalLines, boxOwners, currentTurnIndex: payload.currentTurnIndex, boxesFilled: payload.boxesFilled };
      });
      setPlayers((prev) =>
        prev.map((p) => {
          const s = payload.scores.find((s) => s.id === p.id);
          return s ? { ...p, score: s.score } : p;
        })
      );
    }
    function onGameOver() {
      setStatus('finished');
    }
    function onRoomReset(payload: { game: GameState; players: Player[] }) {
      setStatus('playing');
      setGame(payload.game);
      setPlayers(payload.players);
    }
    function onTurnSkipped({ currentTurnIndex }: { currentTurnIndex: number }) {
      setGame((prev) => (prev ? { ...prev, currentTurnIndex } : prev));
    }

    socket.on('player_joined', onPlayerJoined);
    socket.on('player_reconnected', onPlayerReconnected);
    socket.on('player_disconnected', onPlayerDisconnected);
    socket.on('player_left', onPlayerLeft);
    socket.on('game_started', onGameStarted);
    socket.on('move_made', onMoveMade);
    socket.on('game_over', onGameOver);
    socket.on('room_reset', onRoomReset);
    socket.on('turn_skipped', onTurnSkipped);

    return () => {
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_reconnected', onPlayerReconnected);
      socket.off('player_disconnected', onPlayerDisconnected);
      socket.off('player_left', onPlayerLeft);
      socket.off('game_started', onGameStarted);
      socket.off('move_made', onMoveMade);
      socket.off('game_over', onGameOver);
      socket.off('room_reset', onRoomReset);
      socket.off('turn_skipped', onTurnSkipped);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  function handleLeaveRoom() {
    socket.emit('leave_room');
    sessionStorage.removeItem('playerId');
    sessionStorage.removeItem('playerName');
    router.push('/');
  }

  function handleStartGame() {
    socket.emit('start_game', gridSize, (res: { ok: boolean; error?: string }) => {
      if (!res.ok) setError(res.error || 'Could not start game.');
    });
  }

  function handlePlayAgain() {
    socket.emit('play_again', {}, (res: { ok: boolean; error?: string }) => {
      if (!res.ok) setError(res.error || 'Could not start a rematch.');
    });
  }

  function handleLineClick(row: number, col: number, orientation: 'horizontal' | 'vertical') {
    socket.emit('make_move', { line: { row, col, orientation } }, (res: { ok: boolean; error?: string }) => {
      if (!res.ok) console.log('Move rejected:', res.error);
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (needsName) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl bg-panel p-8 shadow-2xl ring-1 ring-white/5">
          <h1 className="mb-1 text-center font-display text-2xl font-bold text-accent">Join Room</h1>
          <p className="mb-6 text-center text-sm text-muted">Room code: {roomCode}</p>
          <input
            className="mb-4 w-full rounded-xl bg-panelDark px-4 py-3 text-white placeholder-muted outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent"
            placeholder="Your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={20}
          />
          <button
            className="w-full rounded-xl bg-accent py-3 font-semibold text-panelDark hover:bg-accentHover"
            onClick={() => nameInput.trim() && joinWithName(nameInput.trim())}
          >
            Join
          </button>
          {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  const isHost = players.find((p) => p.id === myPlayerId)?.isHost ?? false;
  const winner = status === 'finished' ? [...players].sort((a, b) => b.score - a.score)[0] : null;

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-black">Room {roomCode}</h1>
        <button
          className="rounded-full bg-panel px-3 py-1 text-xs font-semibold text-muted ring-1 ring-white/10 hover:text-white"
          onClick={copyCode}
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>

      {status === 'lobby' && (
        <div className="w-full max-w-sm rounded-3xl bg-panel p-6 shadow-xl ring-1 ring-white/5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Players</h2>
          <PlayerList players={players} />

          {isHost && (
            <>
              <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Grid size</h2>
              <GridSizeSelector selected={gridSize} onSelect={setGridSize} />
              <button
                className="mt-5 w-full rounded-xl bg-accent py-3 font-semibold text-panelDark transition-colors hover:bg-accentHover disabled:opacity-30"
                onClick={handleStartGame}
                disabled={players.filter((p) => p.connected).length < 2}
              >
                Start Game
              </button>
            </>
          )}
          {!isHost && <p className="mt-4 text-center text-sm text-muted">Waiting for host to start…</p>}
        </div>
      )}

      {(status === 'playing' || status === 'finished') && game && (
        <GamePanel game={game} players={players} myPlayerId={myPlayerId} onLineClick={handleLineClick} />
      )}

      {status === 'finished' && (
        <div className="flex flex-col items-center gap-3">
          {winner && (
            <p className="font-display text-xl font-bold" style={{ color: winner.color }}>
              {winner.name} wins!
            </p>
          )}
          {isHost && (
            <button className="rounded-xl bg-accent px-6 py-3 font-semibold text-panelDark hover:bg-accentHover" onClick={handlePlayAgain}>
              Play Again
            </button>
          )}
        </div>
      )}

      <button className="rounded-full px-5 py-2 text-sm text-muted hover:text-white" onClick={handleLeaveRoom}>
        Leave Room
      </button>
    </main>
  );
}