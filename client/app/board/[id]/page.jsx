// app/board/[id]
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Canvas from '@/components/Canvas';
import axios from 'axios';
import { io } from 'socket.io-client';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LogOut, Moon, PanelsTopLeft, Share2Icon, Sun } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/* 
    Hybrid Storage System
*/

const STORAGE_KEY = (id) => `canvas_${id}`;

//  Instant save (local)
const saveLocal = (canvas, boardId) => {
    const json = JSON.stringify(canvas.toJSON());
    localStorage.setItem(STORAGE_KEY(boardId), json);
};

//  Save to DB
const saveDB = async (canvas, boardId, token) => {
    const json = JSON.stringify(canvas.toJSON());

    await axios.put(
        `${API}/api/boards/${boardId}`,
        { canvasState: json },
        // { headers: { Authorization: `Bearer ${token}` } }
    );
};

// Load: local → DB fallback
const loadCanvasHybrid = async (canvas, boardId) => {
    const local = localStorage.getItem(STORAGE_KEY(boardId));

    if (local && local !== '{}') {
        canvas.loadFromJSON(JSON.parse(local), () => canvas.renderAll());
        return;
    }

    const { data } = await axios.get(`${API}/api/boards/${boardId}`, {
        withCredentials: true
    });
    setBoardTitle(data?.title || 'Untitled Board');

    if (data.canvasState && data.canvasState !== '{}') {
        canvas.loadFromJSON(JSON.parse(data.canvasState), () => canvas.renderAll());

        // cache locally
        localStorage.setItem(STORAGE_KEY(boardId), data?.canvasState);
    }
};

export default function BoardPage() {
    const { token, user, logout } = useAuth();
    const params = useParams();
    const router = useRouter();
    const { theme, setTheme } = useTheme();


    const boardId = params?.id;

    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const [cursors, setCursors] = useState({});
    const [boardTitle, setBoardTitle] = useState('');
    const [inviteLink, setInviteLink] = useState('');

    // console.log("Data-Board: ",data);

    if (!boardId) return null;

    // Export PNG
    const exportPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'whiteboard.png';
        link.click();
    };

    // Export PDF
    const exportPDF = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.getWidth(), canvas.getHeight()]
        });

        pdf.addImage(dataURL, 'PNG', 0, 0, canvas.getWidth(), canvas.getHeight());
        pdf.save('whiteboard.pdf');
    };

    // Invite link
    const generateInviteLink = async () => {
        const res = await axios.post(
            `${API}/api/boards/${boardId}/invite`,

            { withCredentials: true }
        );
        setInviteLink(res?.data?.link);
        navigator.clipboard.writeText(res?.data.link);
        alert('Invite link copied!');
    };

    // Socket
    useEffect(() => {
        const socket = io(API);
        socketRef.current = socket;

        socket.emit('join-board', { boardId, user });

        socket.on('cursor-move', ({ user: u, x, y }) => {
            setCursors(prev => ({
                ...prev,
                [u.id]: { x, y, name: u.name }
            }));
        });

        return () => socket.disconnect();
    }, [boardId]);

    // Canvas init

    const isGuestBoard = boardId?.startsWith('guest_');

    // Canvas init mein:
    const handleCanvasReady = useCallback(async (canvas) => {
        canvasRef.current = canvas;

        //  Load — guest ho ya logged in, localStorage se pehle try karo
        const local = localStorage.getItem(`canvas_${boardId}`);
        if (local && local !== '{}') {
            canvas.loadFromJSON(JSON.parse(local), () => canvas.renderAll());
        } else if (!isGuestBoard) {
            // sirf DB se load karo agar logged in hai
            const { data } = await axios.get(`${API}/api/boards/${boardId}`);
            if (data.canvasState && data.canvasState !== '{}') {
                canvas.loadFromJSON(JSON.parse(data.canvasState), () => canvas.renderAll());
                localStorage.setItem(`canvas_${boardId}`, data.canvasState);
            }
        }

        canvas.on('object:added', () => saveLocal(canvas, boardId));
        canvas.on('object:modified', () => saveLocal(canvas, boardId));
        canvas.on('object:removed', () => saveLocal(canvas, boardId));

        //  Auto-save DB mein sirf logged in user ke liye
        if (!isGuestBoard) {
            const interval = setInterval(() => saveDB(canvas, boardId), 30000);
            return () => clearInterval(interval);
        }
    }, [boardId, isGuestBoard]);
    // const handleCanvasReady = useCallback(async (canvas) => {
    //     canvasRef.current = canvas;

    //     // ✅ Hybrid Load
    //     await loadCanvasHybrid(canvas, boardId);

    //     // ⚡ Auto save
    //     const interval = setInterval(() => {
    //         saveLocal(canvas, boardId);
    //         saveDB(canvas, boardId, token);
    //     }, 30000);

    //     // ⚡ Instant local save on changes
    //     canvas.on('object:added', () => saveLocal(canvas, boardId));
    //     canvas.on('object:modified', () => saveLocal(canvas, boardId));
    //     canvas.on('object:removed', () => saveLocal(canvas, boardId));

    //     return () => clearInterval(interval);
    // }, [boardId, token]);

    // // Ctrl+S
    // useEffect(() => {
    //     const handleKey = (e) => {
    //         if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    //             e.preventDefault();
    //             if (canvasRef.current) {
    //                 saveLocal(canvasRef.current, boardId);
    //                 saveDB(canvasRef.current, boardId, token);
    //             }
    //         }
    //     };

    //     window.addEventListener('keydown', handleKey);
    //     return () => window.removeEventListener('keydown', handleKey);
    // }, [boardId, token]);

    // Cursor move
    const handleMouseMove = (e) => {
        socketRef.current?.emit('cursor-move', {
            boardId,
            user,
            x: e.clientX,
            y: e.clientY
        });
    };

    return (
        <div className="relative w-full h-screen" onMouseMove={handleMouseMove}>

            {/* Toolbar */}
            <div

                className="absolute top-0 left-0 right-0 h-14 flex items-center px-4 gap-3 z-10 bg-gray-200 dark:bg-gray-700">
                {/* <span className="font-medium text-sm dark:text-white">Board</span> */}
                <div onClick={() => router.push('/')} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center bg-blue-800 text-white rounded-lg ">
                        <PanelsTopLeft className="h-4 w-4" />
                    </div>
                    <h2 className="font-semibold text-lg">Whiteboard</h2>
                </div>

                <div className="ml-auto flex gap-2">

                    {/*  Save button updated */}
                    <button
                        onClick={() => {
                            if (!canvasRef.current) return;
                            saveLocal(canvasRef.current, boardId);
                            saveDB(canvasRef.current, boardId, token);
                        }}
                        className="px-3 py-1.5 rounded dark:text-gray-100 bg-fuchsia-700">
                        Save
                    </button>

                    <button onClick={exportPNG} className="px-3 py-1.5 rounded dark:text-gray-100 bg-orange-500">
                        PNG
                    </button>

                    <button onClick={exportPDF} className="px-3 py-1.5 rounded dark:text-gray-800 bg-gray-300">
                        PDF
                    </button>

                    <button
                        onClick={generateInviteLink}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded">
                        <Share2Icon />
                    </button>

                    <div className="flex gap-4">
                        <button onClick={() => setTheme(theme === 'dark' ? "light" : "dark")}>
                            {theme === "dark" ?
                                <Sun className="text-orange-500 w-5 h-5" /> :
                                <Moon className="text-blue-500 w-5 h-5" />}
                        </button>

                        {
                            user && <button
                                onClick={() => logout()}
                                className="flex items-center gap-2 dark:text-white">
                                <LogOut className="w-4 h-4" />
                                <span>Sign out</span>
                            </button>
                        }
                    </div>

                    {inviteLink && (
                        <span className="text-xs truncate max-w-[150px]">{inviteLink}</span>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className="pt-14">
                <Canvas boardId={boardId} onCanvasReady={handleCanvasReady} />
            </div>

            {/* Cursors */}
            {Object.entries(cursors).map(([id, c]) => (
                <div key={id} style={{
                    position: 'absolute',
                    left: c.x,
                    top: c.y,
                    pointerEvents: 'none',
                    zIndex: 50
                }}>
                    <div style={{
                        fontSize: 12,
                        background: '#1e40af',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4
                    }}>
                        {c.name}
                    </div>
                </div>
            ))}

        </div>
    );
}