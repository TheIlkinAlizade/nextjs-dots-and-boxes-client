'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleCreateRoom() {
    const playerName = name.trim();
    if (!playerName) {
      setError('Enter your name first.');
      return;
    }

    setLoading(true);
    setError('');

    if (!socket.connected) socket.connect();

    socket.emit(
      'create_room',
      { playerName },
      (res: { ok: boolean; roomCode?: string; playerId?: string; error?: string }) => {
        setLoading(false);
        if (!res.ok || !res.roomCode || !res.playerId) {
          setError(res.error || 'Something went wrong.');
          return;
        }

        sessionStorage.setItem('playerId', res.playerId);
        sessionStorage.setItem('playerName', playerName);
        router.push(`/room/${res.roomCode}`);
      }
    );
  }

  function handleJoinRoom() {
    const playerName = name.trim();
    const code = roomCode.trim().toUpperCase();

    if (!playerName) {
      setError('Enter your name first.');
      return;
    }
    if (!code) {
      setError('Enter a room code.');
      return;
    }

    setLoading(true);
    setError('');

    if (!socket.connected) socket.connect();

    socket.emit(
      'join_room',
      { roomCode: code, playerName },
      (res: { ok: boolean; playerId?: string; error?: string }) => {
        setLoading(false);
        if (!res.ok || !res.playerId) {
          setError(res.error || 'Something went wrong.');
          return;
        }

        sessionStorage.setItem('playerId', res.playerId);
        sessionStorage.setItem('playerName', playerName);
        router.push(`/room/${code}`);
      }
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">Dots and Boxes</h1>

      <input
        className="border rounded px-3 py-2 w-64"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white rounded px-4 py-2 w-64 disabled:opacity-50"
        onClick={handleCreateRoom}
        disabled={loading}
      >
        Create Room
      </button>

      <div className="flex gap-2 w-64">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button
          className="bg-green-500 text-white rounded px-4 py-2 disabled:opacity-50"
          onClick={handleJoinRoom}
          disabled={loading}
        >
          Join
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </main>
  );
}