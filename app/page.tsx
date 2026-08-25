'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

export default function Home() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>{connected ? 'Connected ✅' : 'Connecting...'}</div>;
}