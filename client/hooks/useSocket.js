// client/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useSocket(boardId, user) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join-board', { boardId, user });
    return () => { socketRef.current?.disconnect(); };
  }, [boardId]);

  return socketRef.current;
}