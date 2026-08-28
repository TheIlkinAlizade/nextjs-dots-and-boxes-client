'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function submit() {
    const playerName = name.trim();
    if (!playerName) return setError('Enter your name first.');
    if (mode === 'join' && !roomCode.trim()) return setError('Enter a room code.');

    setLoading(true);
    setError('');
    if (!socket.connected) socket.connect();

    const event = mode === 'create' ? 'create_room' : 'join_room';
    const payload =
      mode === 'create' ? { playerName } : { roomCode: roomCode.trim().toUpperCase(), playerName };

    socket.emit(event, payload, (res: { ok: boolean; roomCode?: string; playerId?: string; error?: string }) => {
      setLoading(false);
      if (!res.ok || !res.playerId) return setError(res.error || 'Something went wrong.');
      sessionStorage.setItem('playerId', res.playerId);
      sessionStorage.setItem('playerName', playerName);
      const code = mode === 'create' ? res.roomCode : roomCode.trim().toUpperCase();
      router.push(`/room/${code}`);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-panel p-8 shadow-2xl ring-1 ring-white/5">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-accent">Dots & Boxes</h1>
          <p className="mt-1 text-sm text-muted">Play with friends</p>
        </div>

        <input
          className="mb-4 w-full rounded-xl bg-panelDark px-4 py-3 text-white placeholder-muted outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
        />

        <div className="mb-4 flex rounded-xl bg-panelDark p-1">
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === 'create' ? 'bg-accent text-panelDark' : 'text-muted'}`}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === 'join' ? 'bg-accent text-panelDark' : 'text-muted'}`}
            onClick={() => setMode('join')}
          >
            Join Room
          </button>
        </div>

        {mode === 'join' && (
          <input
            className="mb-4 w-full rounded-xl bg-panelDark px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-white placeholder-muted outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent"
            placeholder="ROOM CODE"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={5}
          />
        )}

        <button
          className="w-full rounded-xl bg-accent py-3 font-semibold text-panelDark transition-colors hover:bg-accentHover disabled:opacity-40"
          onClick={submit}
          disabled={loading}
        >
          {mode === 'create' ? 'Create Room' : 'Join Room'}
        </button>

        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}