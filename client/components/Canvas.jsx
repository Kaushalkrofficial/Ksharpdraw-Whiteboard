'use client';

import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { io } from 'socket.io-client';
import { Circle, Eraser, MousePointer2, Pencil, Square, Trash2, Type } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Canvas({ boardId, onCanvasReady }) {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  const [fc, setFc] = useState(null);
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('#1a1a1a');
  const [bgcolor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(3);

  // ✅ INIT CANVAS (ONLY ONCE)
  useEffect(() => {
    if (!canvasRef.current) return;

  
const canvas = new fabric.Canvas(canvasRef.current, {
  width: window.innerWidth - 320,
  height: window.innerHeight - 64,
  backgroundColor: bgcolor,
});

setFc(canvas);
onCanvasReady?.(canvas);

return () => {
  canvas.dispose();
};
  }, []);

  // BACKGROUND UPDATE
  useEffect(() => {
    if (!fc) return;

    
fc.backgroundColor = bgcolor;
fc.renderAll();

  }, [bgcolor, fc]);

  //  SOCKET INIT
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    
socket.emit('join-board', { boardId });

return () => {
  socket.disconnect();
};


  }, [boardId]);

  //  TOOL HANDLING
  useEffect(() => {
    if (!fc) return;

   
if (tool === 'pen') {
  fc.isDrawingMode = true;

  const brush = new fabric.PencilBrush(fc);
  brush.color = color;
  brush.width = size;

  fc.freeDrawingBrush = brush;
  fc.selection = false;

} else if (tool === 'eraser') {
  fc.isDrawingMode = true;

  const brush = new fabric.PencilBrush(fc);
  brush.color = bgcolor; // dynamic erase
  brush.width = size * 3;

  fc.freeDrawingBrush = brush;
  fc.selection = false;

} else {
  fc.isDrawingMode = false;
  fc.selection = true;
}


  }, [tool, color, size, bgcolor, fc]);

  //  REAL-TIME SYNC (FIXED)
  useEffect(() => {
    if (!fc) return;
    const socket = socketRef.current;
    if (!socket) return;

    
const handleAdd = (e) => {
  const obj = e.target;
  socket.emit('canvas-update', {
    boardId,
    delta: {
      type: 'add',
      obj: obj.toJSON(),
    },
  });
};

fc.on('object:added', handleAdd);

socket.on('canvas-update', ({ delta }) => {
  if (delta.type === 'add') {
    fabric.util.enlivenObjects([delta.obj], (objects) => {
      objects.forEach((o) => fc.add(o));
      fc.renderAll();
    });
  }
});

return () => {
  fc.off('object:added', handleAdd);
  socket.off('canvas-update');
};


  }, [fc, boardId]);

  // ✅ ADD SHAPES
  const addShape = (type) => {
    if (!fc) return;

   
const opts = {
  left: 200,
  top: 200,
  fill: color,
  stroke: '#333',
  strokeWidth: 1,
};

let obj;

if (type === 'rect') {
  obj = new fabric.Rect({ ...opts, width: 120, height: 80, rx: 6 });
}

if (type === 'circle') {
  obj = new fabric.Circle({ ...opts, radius: 50 });
}

if (type === 'text') {
  obj = new fabric.IText('Double-click to edit', {
    left: 200,
    top: 200,
    fontSize: 18,
    fill: color,
    fontFamily: 'Patrick Hand',
    textAlign: 'center',
  });
}

if (type === 'sticky') {
  const rect = new fabric.Rect({
    width: 150,
    height: 120,
    fill: '#fef08a',
    rx: 4,
  });

  const text = new fabric.IText('Note...', {
    fontSize: 14,
    left: 10,
    top: 10,
    fill: '#333',
  });

  obj = new fabric.Group([rect, text], {
    left: 200,
    top: 200,
  });
}

if (obj) {
  fc.add(obj);
  fc.setActiveObject(obj);
}


  };

  //  CLEAR CANVAS
  const clearCanvas = () => {
    if (!fc) return;

   
fc.clear();
fc.backgroundColor = bgcolor;
fc.renderAll();


  };

  const tools = [
    { id: 'select', icon: <MousePointer2 className="w-6 h-6" /> },
    { id: 'pen', icon: <Pencil /> },
    { id: 'rect', icon: <Square /> },
    { id: 'circle', icon: <Circle /> },
    { id: 'text', icon: <Type /> },
    { id: 'sticky', icon: '📋' },
    { id: 'eraser', icon: <Eraser /> },
  ];

  return (<div className="flex h-screen w-screen bg-amber-200">
    {/* Sidebar */} <div className="w-14 border-r flex flex-col items-center py-4 gap-2 bg-white dark:bg-gray-900">

      
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            setTool(t.id);
            if (!['pen', 'select', 'eraser'].includes(t.id)) {
              addShape(t.id);
            }
          }}
          className={`w-9 h-9 rounded-lg transition pl-1 ${tool === t.id
              ? 'bg-blue-100 dark:bg-blue-800'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          {t.icon}
        </button>
      ))}

      {/* CLEAR */}
      <button onClick={clearCanvas}>
        <Trash2 className="text-red-500" />
      </button>

      {/* COLOR */}
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-9 h-9"
      />

      {/* BACKGROUND */}
      <input
        type="color"
        value={bgcolor}
        onChange={(e) => setBgColor(e.target.value)}
        className="w-9 h-9"
      />

    </div>

    {/* CANVAS */}
    <canvas ref={canvasRef} />
  </div>
   

  );
}
